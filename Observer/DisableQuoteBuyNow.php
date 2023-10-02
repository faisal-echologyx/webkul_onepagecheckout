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
namespace Webkul\OneStepCheckout\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\App\RequestInterface;

class DisableQuoteBuyNow implements ObserverInterface
{
    /**
     * @var \Webkul\Customisation\Logger\CustomLogger
     */
    private $customLogger;

    /**
     * @var RequestInterface
     */
    private $request;

    /**
     * @var \Magento\Checkout\Model\Session
     */
    private $checkoutSession;

    /**
     * @var \Magento\Quote\Model\QuoteFactory
     */
    private $quoteFactory;

    /**
     * @param \Webkul\Customisation\Logger\CustomLogger $customLogger,
     * @param RequestInterface $request,
     * @param \Magento\Checkout\Model\Session $checkoutSession,
     * @param \Magento\Quote\Model\QuoteFactory $quoteFactory,
     */
    public function __construct(
        \Webkul\OneStepCheckout\Logger\Logger $oscLogger,
        RequestInterface $request,
        \Magento\Checkout\Model\Session $checkoutSession,
        \Magento\Quote\Model\QuoteFactory $quoteFactory,
        \Magento\Customer\Model\Session $customerSession
    ) {
        $this->oscLogger = $oscLogger;
        $this->request = $request;
        $this->checkoutSession = $checkoutSession;
        $this->quoteFactory = $quoteFactory;
        $this->customerSession = $customerSession;
    }

    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        try {
            $data = $this->request->getParams();
            if (isset($data['is_buynow']) && $data['is_buynow']) {
                $currentQuote = $this->checkoutSession->getQuote();
                $this->checkoutSession->setDisableQuoteId($currentQuote->getId());
                $quoteModel = $this->quoteFactory->create()->load($currentQuote->getId());
                $quoteModel->setIsActive(0)->save();
                $this->checkoutSession->setCartWasUpdated(true);
                $newquoteModel = $this->quoteFactory->create();
                $newquoteModel->setStoreId($quoteModel->getStoreId());
                //if login user then set following details in quote
                if ($this->customerSession->isLoggedIn()) {
                    $customer = $this->customerSession->getCustomer();
                    $newquoteModel->setCustomerId($customer->getId());
                    $newquoteModel->setCustomerGroupId($quoteModel->getGroupId());
                    $newquoteModel->setCustomerEmail($customer->getEmail());
                    $newquoteModel->setCustomerFirstname($customer->getFirstname());
                    $newquoteModel->setCustomerLastname($customer->getLastname());
                    $newquoteModel->setCustomerDob($customer->getDob());
                    $newquoteModel->setCustomerGender($customer->getGender());
                    $newquoteModel->save();
                }
                $this->checkoutSession->replaceQuote($newquoteModel);
                $this->checkoutSession->setCartWasUpdated(true);
            }
            return $this;
        } catch (\Exception $e) {
            $this->oscLogger->info($e->getMessage());
        }
    }
}
