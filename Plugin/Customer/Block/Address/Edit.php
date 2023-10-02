<?php
namespace Webkul\OneStepCheckout\Plugin\Customer\Block\Address;

class Edit
{
    public function __construct(
        \Webkul\OneStepCheckout\Helper\Data $oscHelper,
        \Magento\Store\Model\StoreManagerInterface $storeManager
    ) {
        $this->oscHelper = $oscHelper;
        $this->_storeManager = $storeManager;
    }

    public function beforeToHtml(\Magento\Customer\Block\Address\Edit $subject)
    {
        if (strpos($this->_storeManager->getStore()->getCurrentUrl(), "onestepcheckout") === true) {
            if ($this->oscHelper->getIsEnable()) {
                if ($template === 'Magento_Customer::address/edit.phtml') {
                    $subject->setTemplate('Webkul_OneStepCheckout::customer/address/edit.phtml');
                }
            }
        }
    }
}
