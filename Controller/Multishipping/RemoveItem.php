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

namespace Webkul\OneStepCheckout\Controller\Multishipping;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;

class RemoveItem extends Action
{
    /**
     * @var Magento\Framework\App\Helper\Context
     */
    private $context;

    public function __construct(
        Context $context,
        \Magento\Customer\Model\AddressFactory $addressFactory,
        \Magento\Framework\Controller\Result\JsonFactory $jsonResultFactory,
        \Magento\Customer\Helper\Address $addresssHelper,
        \Magento\Directory\Model\CountryFactory $countryFactory
    ) {
        $this->addressFactory = $addressFactory;
        $this->jsonResultFactory = $jsonResultFactory;
        $this->addresssHelper = $addresssHelper;
        $this->countryFactory = $countryFactory;
        parent::__construct($context);
    }

    public function execute()
    {
        try {
            $product_id = $this->getRequest()->getParam('product_id');
            $itemQuantity = 1;
            $itemQuantity = (int)$this->getRequest()->getParam('item_quantity');
            $addressId = (int)$this->getRequest()->getParam('address');
            if ($product_id != null) {
                $checkoutSession = $this->getCheckoutSession();
                $quoteId = $checkoutSession->getQuote()->getId();
                $quoteItemsOfProductId = $this->getAddressItemModel()
                                        ->getCollection()
                                        ->addFieldToFilter(
                                            'product_id',
                                            ['eq' => $product_id]
                                        );
                $this->updateOrDelete($quoteItemsOfProductId, $itemQuantity, $quoteId);

            }
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function getCheckoutSession()
    {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $checkoutSession = $objectManager->get(\Magento\Checkout\Model\Session::class);
        return $checkoutSession;
    }

    public function getAddressItemModel()
    {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $itemModel = $objectManager->create(\Magento\Quote\Model\Quote\Address\Item::class);
        return $itemModel;
    }

    public function getItemModel()
    {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        $itemModel = $objectManager->create(\Magento\Quote\Model\Quote\Item::class);
        return $itemModel;
    }

    public function updateOrDelete($items, $itemQuantity, $quoteId)
    {
        if ($items->getSize()) {
            if ($items->getFirstItem()->getQty() > 1) {
                $updateQuantity = $items->getFirstItem()->getQty() - $itemQuantity;
                $this->getAddressItemModel()
                    ->load($items->getFirstItem()->getId())
                    ->setQty($updateQuantity)
                    ->save();
            } else {
                $quoteItemId = $items->getFirstItem()->getQuoteItemId();
                $this->getAddressItemModel()
                    ->load($items->getFirstItem()->getId())
                    ->delete();
                $this->getItemModel()
                    ->load($quoteItemId)
                    ->delete();
            }
        }
    }
}
