<?php
namespace Webkul\OneStepCheckout\Api;

interface ShippingInformationManagementInterface
{
    /**
     * @param int $cartId
     * @param \Magento\Checkout\Api\Data\ShippingInformationInterface $addressInformation
     * @return \Webkul\OneStepCheckout\Api\Data\CartUpdateResponseInterface
     */
    public function getTotalInformation(
        $cartId,
        \Magento\Checkout\Api\Data\ShippingInformationInterface $addressInformation
    );
}
