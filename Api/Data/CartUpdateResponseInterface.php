<?php

namespace Webkul\OneStepCheckout\Api\Data;

/**
 * Interface CartUpdateResponseInterface
 * @api
 */
interface CartUpdateResponseInterface
{
    /**
     * Constants defined for keys of array, makes typos less likely
     */
    const SHIPPING_METHODS = 'shipping_methods';
    const PAYMENT_METHODS  = 'payment_methods';
    const TOTALS = 'totals';
    const IS_VIRTUAL = 'is_virtual';

    /**
     * @return \Magento\Quote\Api\Data\ShippingMethodInterface[]
     */
    public function getShippingMethods();

    /**
     * @param \Magento\Quote\Api\Data\ShippingMethodInterface[] $shippingMethods
     * @return $this
     */
    public function setShippingMethods($shippingMethods);

    /**
     * @return \Magento\Quote\Api\Data\PaymentMethodInterface[]
     */
    public function getPaymentMethods();

    /**
     * @param \Magento\Quote\Api\Data\PaymentMethodInterface[] $paymentMethods
     * @return $this
     */
    public function setPaymentMethods($paymentMethods);

    /**
     * @return \Magento\Quote\Api\Data\TotalsInterface
     */
    public function getTotals();

    /**
     * @param \Magento\Quote\Api\Data\TotalsInterface $totals
     * @return $this
     */
    public function setTotals($totals);

    /**
     * @return bool|string
     */
    public function getIsVirtual();

    /**
     * @param bool|string $isVirtual
     * @return $this
     */
    public function setIsVirtual($isVirtual);
}
