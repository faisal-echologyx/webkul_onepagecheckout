<?php
namespace Webkul\OneStepCheckout\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Session\SessionManager;

class SaveOrderBeforeSalesModelQuoteObserver implements ObserverInterface
{
    /**
     * @var \Magento\Framework\DataObject\Copy
     */
    protected $objectCopyService;

    /**
     * @param \Magento\Framework\DataObject\Copy $objectCopyService
     *
     */
    public function __construct(
        SessionManager $coreSession,
        \Magento\Framework\DataObject\Copy $objectCopyService,
        \Webkul\OneStepCheckout\Helper\Data $oscHelper
    ) {
        $this->coreSession = $coreSession;
        $this->objectCopyService = $objectCopyService;
        $this->oscHelper = $oscHelper;
    }

    /**
     * @param \Magento\Framework\Event\Observer $observer
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        if ($this->oscHelper->getIsEnable()) {
            $order = $observer->getOrder();
            $orderComment = $this->coreSession->getOrderComment();
            if ($orderComment) {
                $order->setOrderComment($orderComment);
                $order->addCommentToStatusHistory($orderComment, false, true);
            }
        }
        return $this;
    }
}
