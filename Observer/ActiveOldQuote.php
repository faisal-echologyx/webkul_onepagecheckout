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

use \Magento\Framework\Event\ObserverInterface;
use \Magento\Framework\Event\Observer;
use \Magento\Framework\Exception\LocalizedException;

class ActiveOldQuote implements ObserverInterface
{
    /**
     * @var \Webkul\OneStepCheckout\Helper\Data
     */
    private $oscHelper;

    /**
     * @var \Magento\Checkout\Model\Session
     */
    private $checkoutSession;

    /**
     * @var \Magento\Quote\Model\QuoteFactory
     */
    private $quoteFactory;

    /**
     * @var \Webkul\OneStepCheckout\Logger\Logger
     */
    private $oscLogger;

    /**
     * @var \Magento\Customer\Model\Session
     */
    private $session;

    /**
     * @param \Magento\Sales\Api\OrderAddressRepositoryInterface $orderAddressRepository
     * @param \Webkul\OneStepCheckout\Logger\Logger      $oscLogger
     */
    public function __construct(
        \Webkul\OneStepCheckout\Helper\Data $oscHelper,
        \Magento\Checkout\Model\Session $checkoutSession,
        \Magento\Quote\Model\QuoteFactory $quoteFactory,
        \Webkul\OneStepCheckout\Logger\Logger $oscLogger,
        \Magento\Customer\Model\Session $session
    ) {
        $this->oscHelper = $oscHelper;
        $this->checkoutSession = $checkoutSession;
        $this->quoteFactory = $quoteFactory;
        $this->oscLogger = $oscLogger;
        $this->session = $session;
    }

    /**
     * {@inheritdoc}
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function execute(Observer $observer)
    {
        if ($this->oscHelper->getIsEnable()) {
            try {
                $oldQuoteId = $this->checkoutSession->getDisableQuoteId();
                if ($oldQuoteId) {
                    $oldQuote = $this->quoteFactory->create()->load($oldQuoteId);
                    $oldQuote->setIsActive(1);
                    if ($this->isCustomerLoggedIn() && $this->getCustomerId()) {
                        $oldQuote->setCustomerId($this->getCustomerId());
                    }
                    $oldQuote->save();
                    $oldQuote->collectTotals()->save();
                    $this->checkoutSession->replaceQuote($oldQuote);
                    $this->checkoutSession->setCartWasUpdated(true);
                }
                $this->checkoutSession->unsDisableQuoteId();
            } catch (\Exception $e) {
                $this->oscLogger->info("ActiveOldQuote :".$e->getMessage());
                throw new LocalizedException(__($e->getMessage()));
            }
        }
    }

    /**
     * IsCustomerLoggedIn function check customer
     *
     * @return boolean
     */
    public function isCustomerLoggedIn()
    {
        return $this->session->isLoggedIn();
    }
    
    /**
     * GetCustomerId function get customer id
     *
     * @return void
     */
    public function getCustomerId()
    {
        return $this->session->getCustomer()->getId();
    }
}
