<?php

namespace Webkul\OneStepCheckout\Plugin\Model\Quote;

use Magento\Framework\Exception\NoSuchEntityException;

class ShippingAddressManagement
{

    protected $logger;

    /**
     * @param \Webkul\OneStepCheckout\Helper\Data $helper
     * @param \Psr\Log\LoggerInterface $logger
     */
    public function __construct(
        \Webkul\OneStepCheckout\Helper\Data $helper,
        \Psr\Log\LoggerInterface $logger
    ) {
        $this->helper = $helper;
        $this->logger = $logger;
    }

    public function beforeAssign(
        \Magento\Quote\Model\ShippingAddressManagement $subject,
        $cartId,
        \Magento\Quote\Api\Data\AddressInterface $address
    ) {
        $extAttributes = $address->getExtensionAttributes();
        if (!empty($extAttributes)) {
            try {
                $address->setGstNumber($extAttributes->getGstNumber());
            } catch (\Exception $e) {
                $this->logger->critical($e->getMessage());
            }

        }
        return [$cartId, $address];
    }
}
