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
namespace Webkul\OneStepCheckout\Block;

/**
 * OneStepCheckout block.
 *
 * @author Webkul Software
 */
class OneStepCheckout extends \Magento\Framework\View\Element\Template
{
    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Webkul\OneStepCheckout\Helper\Data $oscHelper
    ) {
        $this->oscHelper = $oscHelper;
        parent::__construct($context);
    }

    /**
     * GetOscHelper function
     *
     * @return \Webkul\OneStepCheckout\Helper\Data
     */
    public function getOscHelper()
    {
        return $this->oscHelper;
    }
}
