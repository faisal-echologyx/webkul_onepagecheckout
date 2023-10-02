<?php
/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */

namespace Webkul\OneStepCheckout\Model;

use Magento\Framework\Exception\CouldNotSaveException;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Framework\Serialize\Serializer\Json as JsonHelper;
use Magento\Checkout\Model\Cart\RequestQuantityProcessor;
use Magento\Quote\Model\Quote\Item;
use Magento\Quote\Model\Quote;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Quote\Api\Data\AddressInterface;

class CartManagement implements \Webkul\OneStepCheckout\Api\CartManagementInterface
{
    /**
     * @param CartRepositoryInterface $cartRepository
     * @param RequestQuantityProcessor $quantityProcessor
     * @param JsonHelper $jsonHelper
     * @param AddressInterface $addressInterface
     * @param \Magento\Quote\Model\QuoteIdMaskFactory $quoteIdMaskFactory
     * @param \Magento\Quote\Api\CartManagementInterface $cartManagement
     * @param \Magento\Checkout\Model\PaymentDetailsFactory $paymentDetailsFactory
     * @param \Magento\Quote\Api\PaymentMethodManagementInterface $paymentMethodManagement
     * @param \Psr\Log\LoggerInterface $logger
     * @param \Magento\Quote\Api\CartTotalRepositoryInterface $cartTotalsRepository
     * @param \Magento\Quote\Model\Quote\TotalsCollector $totalCollector
     * @param \Magento\Quote\Model\Cart\ShippingMethodConverter $converter
     * @param \Webkul\OneStepCheckout\Model\CartUpdateResponseFactory $updateResponseFactory
     */
    public function __construct(
        CartRepositoryInterface $cartRepository,
        RequestQuantityProcessor $quantityProcessor,
        JsonHelper $jsonHelper,
        AddressInterface $addressInterface,
        \Magento\Quote\Model\QuoteIdMaskFactory $quoteIdMaskFactory,
        \Magento\Quote\Api\CartManagementInterface $cartManagement,
        \Magento\Checkout\Model\PaymentDetailsFactory $paymentDetailsFactory,
        \Magento\Quote\Api\PaymentMethodManagementInterface $paymentMethodManagement,
        \Psr\Log\LoggerInterface $logger,
        \Magento\Quote\Api\CartTotalRepositoryInterface $cartTotalsRepository,
        \Magento\Quote\Model\Quote\TotalsCollector $totalCollector,
        \Magento\Quote\Model\Cart\ShippingMethodConverter $converter,
        \Webkul\OneStepCheckout\Model\CartUpdateResponseFactory $updateResponseFactory,
        \Magento\Checkout\Model\Session $checkoutSession
    ) {
        $this->cartRepository= $cartRepository;
        $this->quantityProcessor = $quantityProcessor;
        $this->jsonHelper = $jsonHelper;
        $this->addressInterface = $addressInterface;
        $this->quoteIdMaskFactory = $quoteIdMaskFactory;
        $this->cartManagement = $cartManagement;
        $this->paymentDetailsFactory = $paymentDetailsFactory;
        $this->paymentMethodManagement = $paymentMethodManagement;
        $this->cartTotalsRepository = $cartTotalsRepository;
        $this->totalCollector = $totalCollector;
        $this->converter = $converter;
        $this->updateResponseFactory = $updateResponseFactory;
        $this->logger = $logger;
        $this->_checkoutSession = $checkoutSession;
    }
    /**
     * @inheritdoc
     */
    public function updateGuestCart($cartId, $cartData)
    {
        $quoteIdMask = $this->quoteIdMaskFactory->create()->load($cartId, 'masked_id');
        /** @var Quote $quote */
        $quote = $this->cartRepository->getActive($quoteIdMask->getQuoteId());
        $cartData = $this->quantityProcessor->process($this->jsonHelper->unserialize($cartData));
        $itemId = $cartData['item_id']?? null;
        $item = $quote->getItemById($itemId);

        if (!$item) {
            throw new NoSuchEntityException(
                __('Cart %1 doesn\'t contain item  %2', $cartId, $itemId)
            );
        }
        $qty = isset($cartData['qty']) ? (double) $cartData['qty'] : 0;
        if ($item) {
            try {
                $update = $qty == 0 ? $quote->removeItem($itemId) :
                    $this->updateItemQuantity($item, $qty);
                $this->cartRepository->save($quote);
            } catch (\Exception $e) {
                throw new CouldNotSaveException(__('Could not remove item from quote'));
            }
        }
        return $this->getResponseData($quoteIdMask->getQuoteId(), $quote);
    }

    /**
     * @inheritdoc
     */
    public function updateCart($cartId, $cartData)
    {
        /** @var Quote $quote */
        $quote = $this->cartRepository->getActive($cartId);
        $cartData = $this->quantityProcessor->process($this->jsonHelper->unserialize($cartData));
        $itemId = $cartData['item_id']?? null;
        $item = $quote->getItemById($itemId);

        if (!$item) {
            throw new NoSuchEntityException(
                __('Cart %1 doesn\'t contain item  %2', $cartId, $itemId)
            );
        }
        $qty = isset($cartData['qty']) ? (double) $cartData['qty'] : 0;
        if ($item) {
            try {
                $update = $qty == 0 ? $quote->removeItem($itemId) :
                    $this->updateItemQuantity($item, $qty);
                $this->cartRepository->save($quote);
            } catch (\Exception $e) {
                throw new CouldNotSaveException(__('Could not remove item from quote'));
            }
        }
        return $this->getResponseData($cartId, $quote);
    }

    /**
     * Undocumented function
     *
     * @param int|string $cartId
     * @param Quote $quote
     * @return CartUpdateResponse
     */
    public function getResponseData($cartId, Quote $quote)
    {
        $response = $this->updateResponseFactory->create();
        $response->setShippingMethods(
            $this->getShippingMethods($quote, $this->addressInterface->getData())
        );
        // $response->setPaymentMethods(
        //     $this->paymentMethodManagement->getList($cartId)
        // );
        $response->setPaymentMethods([]);
        $response->setIsVirtual($quote->getIsVirtual());
        $totals = $this->cartTotalsRepository->get($quote->getId());

        $response->setTotals($totals);
        return $response;
    }

    /**
     * Get list of available shipping methods
     *
     * @param \Magento\Quote\Model\Quote $quote
     * @param AddressInterface $address
     * @return \Magento\Quote\Api\Data\ShippingMethodInterface[]
     */
    private function getShippingMethods(Quote $quote, $address)
    {
        $output = [];
        $shippingAddress = $quote->getShippingAddress();
        $shippingAddress->addData($address);
        $shippingAddress->setCollectShippingRates(true);
        $this->totalCollector->collectAddressTotals($quote, $shippingAddress);
        $shippingRates = $shippingAddress->getGroupedAllShippingRates();
        $sellerShipping = '';
        $carriertitle = '';
        $methodtitle = '';
        $flag = false;
        foreach ($shippingRates as $carrierRates) {
            foreach ($carrierRates as $rate) {
                if ($rate->getCarrier() == 'mpmultishipping') {
                    $sellerShipping = $this->_checkoutSession->getSellerMethod();
                    if (count($sellerShipping) > 0) {
                        $flag = true;
                    }
                    $carriertitle = $rate->getCarrierTitle();
                    $methodtitle = $rate->getCarrierTitle();
                    $rate->setMethodTitle($this->getSubMethodsTitle());
                }
                $output[] = $this->converter->modelToDataObject($rate, $quote->getQuoteCurrencyCode());
            }
        }
        if ($flag) {
            $output[] = [
                'available' => true,
                'amount' => 0,
                'carrier_code'=>'mpmultishipping',
                'carrier_title' => $carriertitle,
                'method_code' => 'mpmultishipping',
                'method_title' =>  $this->getSubMethodsTitle(),
                'sellerShipping' => $sellerShipping,
            ];
        }

        return $output;
    }

    /**
     * Updates quote item quantity.
     *
     * @param Item $item
     * @param float $qty
     * @return void
     * @throws LocalizedException
     */
    private function updateItemQuantity(Item $item, float $qty)
    {
        if ($qty > 0) {
            $item->clearMessage();
            $item->setQty($qty)->save();

            if ($item->getHasError()) {
                throw new LocalizedException(__($item->getMessage()));
            }
        }
    }

    /**
     * getSubMethodsTitle
     * @param array $selected
     * @return string $subtitle
     */
    private function getSubMethodsTitle()
    {
        return __("MultiShipping");
    }
}
