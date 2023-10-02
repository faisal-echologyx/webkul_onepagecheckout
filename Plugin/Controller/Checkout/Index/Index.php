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

namespace Webkul\OneStepCheckout\Plugin\Controller\Checkout\Index;

class Index
{
    /**
     * @var \Webkul\OneStepCheckout\Helper\Data
     */
    private $oscHelper;

    /**
     * @var \Magento\Framework\Controller\Result\RedirectFactory
     */
    private $resultRedirectFactory;

    /**
     * @param \Webkul\OneStepCheckout\Helper\Data $oscHelper
     * @param \Magento\Framework\Controller\Result\RedirectFactory $resultRedirectFactory
     */
    public function __construct(
        \Webkul\OneStepCheckout\Helper\Data $oscHelper,
        \Magento\Framework\Controller\Result\RedirectFactory $resultRedirectFactory
    ) {
        $this->oscHelper = $oscHelper;
        $this->resultRedirectFactory = $resultRedirectFactory;
    }

    /**
     * @param \Magento\Checkout\Block\Link $subject
     * @param \Closure $proceed
     * @return string
     */
    public function aroundExecute(
        \Magento\Checkout\Controller\Index\Index $subject,
        \Closure $proceed
    ) {
        $quote = $subject->getOnepage()->getQuote();
        if (!$quote->hasItems() || $quote->getHasError() || !$quote->validateMinimumAmount()) {
            return $proceed();
        } elseif ($this->oscHelper->getIsEnable()) {
            $data = $subject->getRequest()->getParams();
            if (!empty($data['amazonCheckoutSessionId'])) {
                return $this->resultRedirectFactory->create()->setPath(
                    'onestepcheckout/index',
                    ['_query' => ['amazonCheckoutSessionId' => $data['amazonCheckoutSessionId']]]
                );
            } else {
                return $this->resultRedirectFactory->create()->setPath('onestepcheckout/index', $data);
            }
        }
        return $proceed();
    }
}
