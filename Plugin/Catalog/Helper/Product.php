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
namespace Webkul\OneStepCheckout\Plugin\Catalog\Helper;

use Magento\Framework\Session\SessionManager;

class Product
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

    public function beforeAddParamsToBuyRequest(
        \Magento\Catalog\Helper\Product $subject,
        $buyRequest,
        $params
    ) {
        if ($this->oscHelper->getIsEnable()) {
            if (is_array($buyRequest) && isset($buyRequest['is_buynow'])) {
                unset($buyRequest['is_buynow']);
                return [$buyRequest, $params];
            }
        }
        return [$buyRequest, $params];
    }
}
