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
namespace Webkul\OneStepCheckout\Plugin\Model\Checkout;

use Magento\Framework\Session\SessionManager;

class ShippingInformationManagement
{
    /**
     * @var SessionManager
     */
    private $coreSession;

    /**
     * @var \Webkul\OneStepCheckout\Helper\Data
     */
    private $oscHelper;

    /**
     * @param SessionManager                            $coreSession
     * @param \Webkul\OneStepCheckout\Helper\Data        $helper
     */
    public function __construct(
        SessionManager $coreSession,
        \Webkul\OneStepCheckout\Helper\Data $oscHelper
    ) {
        $this->coreSession = $coreSession;
        $this->oscHelper = $oscHelper;
    }

    /**
     * @param \Magento\Checkout\Model\ShippingInformationManagement $subject
     * @param $cartId
     * @param \Magento\Checkout\Api\Data\ShippingInformationInterface $addressInformation
     */
    public function beforeSaveAddressInformation(
        \Magento\Checkout\Model\ShippingInformationManagement $subject,
        $cartId,
        \Magento\Checkout\Api\Data\ShippingInformationInterface $addressInformation
    ) {
        if ($this->oscHelper->getIsEnable()) {
            $extAttributes = $addressInformation->getShippingAddress()->getExtensionAttributes();
            if (!empty($extAttributes)) {
                $this->coreSession->setData('gst_number', '');
                $gstNumber = $extAttributes->getGstNumber();
                $this->coreSession->setGstNumber($gstNumber);
            }
        }
    }
}
