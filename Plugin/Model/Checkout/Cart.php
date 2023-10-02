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

class Cart
{
    /**
     * @var \Webkul\OneStepCheckout\Helper\Data
     */
    private $oscHelper;

    /**
     * @param \Webkul\OneStepCheckout\Helper\Data        $helper
     */
    public function __construct(
        \Webkul\OneStepCheckout\Helper\Data $oscHelper
    ) {
        $this->oscHelper = $oscHelper;
    }

    public function beforeAddProduct(
        \Magento\Checkout\Model\Cart $subject,
        $productInfo,
        $requestInfo
    ) {
        if ($this->oscHelper->getIsEnable()) {
            if (is_array($requestInfo) && isset($requestInfo['is_buynow'])) {
                unset($requestInfo['is_buynow']);
                return [$productInfo, $requestInfo];
            }
        }
        return [$productInfo, $requestInfo];
    }
}
