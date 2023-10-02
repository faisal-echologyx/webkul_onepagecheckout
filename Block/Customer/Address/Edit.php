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

namespace Webkul\OneStepCheckout\Block\Customer\Address;

/**
 * Webkul OneStepCheckout Block.
 */
class Edit extends \Magento\Customer\Block\Address\Edit
{
    /**
     * @var \Magento\Framework\View\Element\Template\Context
     */
    public $context;

    /**
     * @var \Magento\Directory\Helper\Data
     */
    public $directoryHelper;

    /**
     * @var \Magento\Framework\Json\EncoderInterface
     */
    public $jsonEncoder;

    /**
     * @var \Magento\Framework\App\Cache\Type\Config
     */
    public $configCacheType;

    /**
     * @var \Magento\Directory\Model\ResourceModel\Region\CollectionFactory,
     */
    public $regionCollectionFactory;

    /**
     * @var \Magento\Directory\Model\ResourceModel\Country\CollectionFactory
     */
    public $countryCollectionFactory;

    /**
     * @var \Magento\Customer\Model\Session
     */
    public $customerSession;

    /**
     * @var \Magento\Customer\Api\AddressRepositoryInterface
     */
    public $addressRepository;

    /**
     * @var \Magento\Customer\Api\Data\AddressInterfaceFactory
     */
    public $addressDataFactory;

    /**
     * @var \Magento\Customer\Helper\Session\CurrentCustomer
     */
    public $currentCustomer;

    /**
     * @var \Magento\Framework\Api\DataObjectHelper
     */
    public $dataObjectHelper;

    /**
     * @var \Magento\Customer\Model\AddressFactory
     */
    public $addressFactory;

    /**
     * @var \Webkul\OneStepCheckout\Helper\Data
     */
    public $oscHelper;

    /**
     * Constructor
     *
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magento\Directory\Helper\Data $directoryHelper
     * @param \Magento\Framework\Json\EncoderInterface $jsonEncoder
     * @param \Magento\Framework\App\Cache\Type\Config $configCacheType
     * @param \Magento\Directory\Model\ResourceModel\Region\CollectionFactory $regionCollectionFactory
     * @param \Magento\Directory\Model\ResourceModel\Country\CollectionFactory $countryCollectionFactory
     * @param \Magento\Customer\Model\Session $customerSession
     * @param \Magento\Customer\Api\AddressRepositoryInterface $addressRepository
     * @param \Magento\Customer\Api\Data\AddressInterfaceFactory $addressDataFactory
     * @param \Magento\Customer\Helper\Session\CurrentCustomer $currentCustomer
     * @param \Webkul\OneStepCheckout\Helper\Data $oscHelper
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Directory\Helper\Data $directoryHelper,
        \Magento\Framework\Json\EncoderInterface $jsonEncoder,
        \Magento\Framework\App\Cache\Type\Config $configCacheType,
        \Magento\Directory\Model\ResourceModel\Region\CollectionFactory $regionCollectionFactory,
        \Magento\Directory\Model\ResourceModel\Country\CollectionFactory $countryCollectionFactory,
        \Magento\Customer\Model\Session $customerSession,
        \Magento\Customer\Api\AddressRepositoryInterface $addressRepository,
        \Magento\Customer\Api\Data\AddressInterfaceFactory $addressDataFactory,
        \Magento\Customer\Helper\Session\CurrentCustomer $currentCustomer,
        \Magento\Framework\Api\DataObjectHelper $dataObjectHelper,
        \Magento\Customer\Model\AddressFactory $addressFactory,
        \Webkul\OneStepCheckout\Helper\Data $oscHelper,
        \Magento\Customer\Helper\Address $customerAddressHelper,
        array $data = []
    ) {
        $this->addressFactory = $addressFactory;
        $this->oscHelper = $oscHelper;
        $this->customerAddressHelper = $customerAddressHelper;
        $this->directoryHelper = $directoryHelper;
        parent::__construct(
            $context,
            $directoryHelper,
            $jsonEncoder,
            $configCacheType,
            $regionCollectionFactory,
            $countryCollectionFactory,
            $customerSession,
            $addressRepository,
            $addressDataFactory,
            $currentCustomer,
            $dataObjectHelper,
            $data
        );
    }

    //get Gst number
    public function getGstNumber()
    {
        $addressId = $this->getRequest()->getParam('id');
        $addressModel = $this->addressFactory->create()->load($addressId);
        return $addressModel->getGstNumber();
    }

    //get default country
    public function getDefaultCountry()
    {
        return $this->oscHelper->getConfigValue("general/country/default");
    }

    //check module enable or disable
    public function isEnable()
    {
        return $this->oscHelper->getIsEnable();
    }
}
