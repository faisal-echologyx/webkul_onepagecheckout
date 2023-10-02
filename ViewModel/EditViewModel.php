<?php
namespace Webkul\OneStepCheckout\ViewModel;

class EditViewModel implements \Magento\Framework\View\Element\Block\ArgumentInterface
{
    /**
     * @var [type]
     */
    public $addressHelper;

    /**
     * @var [type]
     */
    public $helperData;

    /**
     * @param \Magento\Customer\Helper\Address $addressHelper
     */
    public function __construct(
        \Magento\Customer\Helper\Address $addressHelper,
        \Magento\Directory\Helper\Data $helperData
    ) {
        $this->addressHelper = $addressHelper;
        $this->helperData = $helperData;
    }

    public function getAddressHelper()
    {
        return $this->addressHelper;
    }

    public function getHelperData()
    {
        return $this->helperData;
    }
}
