<?php

namespace Webkul\OneStepCheckout\Controller\Cart;

use Magento\Framework\App\Action\HttpPostActionInterface as HttpPostActionInterface;

class UpdateItemOptions extends \Magento\Checkout\Controller\Cart\UpdateItemOptions
{
    /**
     * Set back redirect url to response
     *
     * @param null|string $backUrl
     *
     * @return \Magento\Framework\Controller\Result\Redirect
     */
    protected function _goBack($backUrl = null)
    {
        if (!$this->getRequest()->isAjax()) {
            $resultRedirect = $this->resultRedirectFactory->create();

            if ($backUrl || $backUrl = $this->getBackUrl($this->_redirect->getRefererUrl())) {
                $resultRedirect->setUrl($backUrl);
            }

            return $resultRedirect;
        }

        $result = [];

        if ($backUrl || $backUrl = $this->getBackUrl()) {
            $result['backUrl'] = $backUrl;
        }

        $this->getResponse()->representJson(
            $this->_objectManager->get(\Magento\Framework\Json\Helper\Data::class)->jsonEncode($result)
        );
    }
}
