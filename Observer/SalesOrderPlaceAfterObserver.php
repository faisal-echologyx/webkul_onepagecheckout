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
namespace Webkul\OneStepCheckout\Observer;

use \Magento\Framework\Event\ObserverInterface;
use \Magento\Framework\Event\Observer;
use \Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Session\SessionManager;
use Magento\Customer\Api\Data\AddressInterfaceFactory;
use Magento\Customer\Api\Data\AddressInterface;
use Magento\Framework\Api\DataObjectHelper;

class SalesOrderPlaceAfterObserver implements ObserverInterface
{
    /**
     * @var \Magento\Sales\Api\OrderAddressRepositoryInterface
     */
    private $orderAddressRepository;

    /**
     * @var \Magento\Sales\Api\OrderRepositoryInterface
     */
    private $orderRepository;

    /**
     * @var SessionManager
     */
    private $coreSession;

    /**
     * @var AddressInterfaceFactory
     */
    private $addressDataFactory;

    /**
     * @var DataObjectHelper
     */
    private $dataObjectHelper;

    /**
     * @var \Webkul\OneStepCheckout\Helper\Data
     */
    private $oscHelper;

    /**
     * @var \Webkul\OneStepCheckout\Logger\Logger
     */
    private $oscLogger;

    /**
     * @var \Magento\Quote\Model\QuoteFactory
     */
    private $quoteFactory;

    /**
     * @param \Magento\Sales\Api\OrderAddressRepositoryInterface $orderAddressRepository
     * @param \Webkul\OneStepCheckout\Logger\Logger      $oscLogger
     */
    public function __construct(
        \Magento\Sales\Api\OrderAddressRepositoryInterface $orderAddressRepository,
        \Magento\Sales\Api\OrderRepositoryInterface $orderRepository,
        SessionManager $coreSession,
        \Magento\Customer\Model\ResourceModel\AddressRepository $addressRepository,
        AddressInterfaceFactory $addressDataFactory,
        DataObjectHelper $dataObjectHelper,
        \Webkul\OneStepCheckout\Helper\Data $oscHelper,
        \Webkul\OneStepCheckout\Logger\Logger $oscLogger,
        \Magento\Quote\Model\QuoteFactory $quoteFactory
    ) {
        $this->orderAddressRepository = $orderAddressRepository;
        $this->orderRepository = $orderRepository;
        $this->coreSession = $coreSession;
        $this->addressRepository = $addressRepository;
        $this->addressDataFactory = $addressDataFactory;
        $this->dataObjectHelper = $dataObjectHelper;
        $this->oscHelper = $oscHelper;
        $this->oscLogger = $oscLogger;
        $this->quoteFactory = $quoteFactory;
    }

    /**
     * {@inheritdoc}
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function execute(Observer $observer)
    {
        if ($this->oscHelper->getIsEnable()) {
            $gstNumber = "";
            $shippingCustomerId = "";
            $billingCustomerId = "";
            $gstNumber = $this->coreSession->getGstNumber();
            $orderInstance = $observer->getEvent()->getOrder();
            if ($orderInstance) {
                $billingAddressId = $orderInstance->getBillingAddressId();
                $shippingAddressId = $orderInstance->getShippingAddressId();
                if ($billingAddressId != "") {
                    $billingAddress = $this->orderAddressRepository->get($billingAddressId);
                    $billingCustomerId = $billingAddress->getCustomerAddressId();
                }
                if ($shippingAddressId != "") {
                    $shipingAddress = $this->orderAddressRepository->get($shippingAddressId);
                    $shippingCustomerId = $shipingAddress->getCustomerAddressId();
                }

                // save extension gst_number extension attribute value to order
                $quote = $this->quoteFactory->create()->load($orderInstance->getQuoteId());
                if ($quote->getBillingAddress()) {
                    $orderInstance->getBillingAddress()
                    ->setGstNumber($quote->getBillingAddress()->getGstNumber())
                    ->save();
                }
                if (!$quote->isVirtual()) {
                    $orderInstance->getShippingAddress()
                    ->setGstNumber($quote->getShippingAddress()->getGstNumber())
                    ->save();
                }
            }
            try {
                if ($gstNumber != "") {
                    if ($billingCustomerId != "") {
                        $addressData = [];
                        $savedAddressData = $this->addressRepository->getById($billingCustomerId);
                        $address = $this->addressDataFactory->create();
                        $addressData['gst_number'] = $gstNumber;
                        $addressData['customer_id'] = $savedAddressData->getCustomerId();
                        $addressData['id'] = $billingCustomerId;
                        $this->dataObjectHelper->populateWithArray(
                            $address,
                            $addressData,
                            \Magento\Customer\Api\Data\AddressInterface::class
                        );
                        $this->addressRepository->save($address);
                    }
                    if ($shippingCustomerId != "") {
                        $addressData = [];
                        $savedAddressData = $this->addressRepository->getById($shippingCustomerId);
                        $address = $this->addressDataFactory->create();
                        $addressData['gst_number'] = $gstNumber;
                        $addressData['customer_id'] = $savedAddressData->getCustomerId();
                        $addressData['id'] = $shippingCustomerId;
                        $this->dataObjectHelper->populateWithArray(
                            $address,
                            $addressData,
                            \Magento\Customer\Api\Data\AddressInterface::class
                        );
                        $this->addressRepository->save($address);
                    }
                }
                $this->coreSession->setData('gst_number', '');
            } catch (\Exception $e) {
                throw new LocalizedException(__($e->getMessage()));
            }
        }
    }
}
