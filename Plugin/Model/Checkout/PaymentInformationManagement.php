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

class PaymentInformationManagement
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
     * @param SessionManager                             $coreSession
     * @param \Webkul\OneStepCheckout\Helper\Data        $oscHelper
     */
    public function __construct(
        SessionManager $coreSession,
        \Webkul\OneStepCheckout\Helper\Data $oscHelper
    ) {
        $this->coreSession = $coreSession;
        $this->oscHelper = $oscHelper;
    }

    /**
     * @param \Magento\Checkout\Model\PaymentInformationManagement $subject
     * @param $cartId
     * @param \Magento\Checkout\Api\Data\PaymentInformationManagement $paymentInformation
     */
    public function beforeSavePaymentInformation(
        \Magento\Checkout\Model\PaymentInformationManagement $subject,
        $cartId,
        \Magento\Quote\Api\Data\PaymentInterface $paymentMethod,
        \Magento\Quote\Api\Data\AddressInterface $billingAddress = null
    ) {
        if ($this->oscHelper->getIsEnable()) {
            $addressExtnAttributes = [];
            $addressExtnAttributes = $billingAddress ? $billingAddress->getExtensionAttributes() : [];
            $paymentExtnAttributes = $paymentMethod ? $paymentMethod->getExtensionAttributes() : [];
            if (!empty($addressExtnAttributes)) {
                $gstNumber = $addressExtnAttributes->getGstNumber();
                $billingAddress->setGstNumber($gstNumber);
            }
            if (!empty($paymentExtnAttributes)) {
                $orderComment = $paymentExtnAttributes->getOrderComment();
                if ($this->coreSession->getOrderComment()) {
                    $this->coreSession->unsOrderComment();
                    $this->coreSession->setOrderComment($orderComment);
                } else {
                    $this->coreSession->setOrderComment($orderComment);
                }
            }
        }
        return [$cartId, $paymentMethod, $billingAddress];
    }
}
