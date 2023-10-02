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

namespace Webkul\OneStepCheckout\CustomerData;

use Magento\Customer\CustomerData\SectionSourceInterface;
use Magento\Quote\Api\CartRepositoryInterface;

/**
 * MergeQuote source
 */
class MergeQuote extends \Magento\Framework\DataObject implements SectionSourceInterface
{
    /**
     * @var \Magento\Checkout\Model\Session
     */
    private $checkoutSession;

    /**
     * @var RequestInterface
     */
    private $request;

    /**
     * @var \Magento\Quote\Model\QuoteFactory
     */
    private $quoteFactory;

    /**
     * @var \Webkul\OneStepCheckout\Logger\Logger
     */
    private $oscLogger;

    /**
     * @param \Magento\Checkout\Model\Session $checkoutSession,
     * @param \Magento\Framework\App\RequestInterface $request,
     * @param \Magento\Quote\Model\QuoteFactory $quoteFactory,
     * @param \Webkul\OneStepCheckout\Logger\Logger $oscLogger,
     * @param array $data
     */
    public function __construct(
        \Magento\Checkout\Model\Session $checkoutSession,
        \Magento\Framework\App\RequestInterface $request,
        \Magento\Quote\Model\QuoteFactory $quoteFactory,
        \Webkul\OneStepCheckout\Logger\Logger $oscLogger,
        CartRepositoryInterface $quoteRepository,
        array $data = []
    ) {
        $this->checkoutSession = $checkoutSession;
        $this->request = $request;
        $this->quoteFactory = $quoteFactory;
        $this->oscLogger = $oscLogger;
        $this->quoteRepository = $quoteRepository;
        parent::__construct($data);
    }

    /**
     * {@inheritdoc}
     */
    public function getSectionData()
    {
        $this->oscLogger->info("section data call");

        $output = [];
        try {
            $sections = explode(',', $this->request->getParam('sections'));
            $currentQuoteId = $this->checkoutSession->getQuote()->getId();
            $oldQuoteId = $this->checkoutSession->getDisableQuoteId();
            if ($oldQuoteId && in_array('merge-quote', $sections)) {
                $newQuote = $this->quoteRepository->getActive($currentQuoteId);
                $oldQuote = $this->quoteRepository->get($oldQuoteId);
                $newQuote->merge($oldQuote);
                $newQuote->collectTotals()->save();
                $this->quoteRepository->save($newQuote);

                $newQuote = $this->quoteRepository->get($newQuote->getId());
                $this->quoteRepository->save(
                    $newQuote->collectTotals()
                );
                // $this->quoteRepository->delete($oldQuote);
                $this->checkoutSession->replaceQuote($newQuote);
                $this->checkoutSession->setCartWasUpdated(true);
                $this->checkoutSession->unsDisableQuoteId();
            }
        } catch (\Exception $e) {
            $this->oscLogger->info($e->getMessage());
        }
        return $output;
    }
}
