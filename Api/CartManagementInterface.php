<?php

namespace Webkul\OneStepCheckout\Api;

/**
 * CartManagementInterface interface manage one step checkout cart
 * @api
 */
interface CartManagementInterface
{
    /**
     * Undocumented function
     *
     * @param string $cartId
     * @param string $cartData
     * @return \Webkul\OneStepCheckout\Api\Data\CartUpdateResponseInterface
     */
    public function updateGuestCart($cartId, $cartData);

    /**
     * Undocumented function
     *
     * @param int $cartId
     * @param string $cartData
     * @return \Webkul\OneStepCheckout\Api\Data\CartUpdateResponseInterface
     */
    public function updateCart($cartId, $cartData);
}
