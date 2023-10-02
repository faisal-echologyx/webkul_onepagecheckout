<?php
namespace Webkul\OneStepCheckout\Api;

use Magento\Checkout\Api\GuestShippingInformationManagementInterface as
    CheckoutGuestShippingInformationManagementInterface;

interface GuestShippingInformationManagementInterface
{
    /**
     * @param string $cartId
     * @param \Magento\Checkout\Api\Data\ShippingInformationInterface $addressInformation
     * @return \Webkul\OneStepCheckout\Api\Data\CartUpdateResponseInterface
     */
    public function getTotalInformation(
        $cartId,
        \Magento\Checkout\Api\Data\ShippingInformationInterface $addressInformation
    );
}
