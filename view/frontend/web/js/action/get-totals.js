/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * @api
 */
define([
    'jquery',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/url-builder',
    'mage/storage',
    'Magento_Checkout/js/model/error-processor',
    'Magento_Customer/js/model/customer',
    'Magento_Checkout/js/model/payment/method-converter',
    'Magento_Checkout/js/model/payment-service',
    'Magento_Checkout/js/model/shipping-service',
    'Magento_Checkout/js/model/totals',
    'Magento_Checkout/js/action/select-billing-address',
    'Webkul_OneStepCheckout/js/model/payment-loader',
    'Webkul_OneStepCheckout/js/model/resource-url-manager'
], function ($, quote, urlBuilder, storage, errorProcessor, customer, methodConverter, paymentService, shippingService, totals, selectBillingAddressAction, paymentLoader, resourceUrlManager) {
    'use strict';

    return function () {
        var payload;

        payload = {
            addressInformation: {
                'shipping_address': quote.shippingAddress(),
                'billing_address': quote.billingAddress(),
                'shipping_method_code': null,
                'shipping_carrier_code':null
            }
        };

        paymentLoader.startLoader();
        shippingService.isLoading(true);

        return storage.post(
            resourceUrlManager.getOpcUrlForSetShippingInformation(quote),
            JSON.stringify(payload)
        ).done(
            function (response) {
                quote.setTotals(response.totals);
                paymentService.setPaymentMethods(methodConverter(response['payment_methods']));
                if (!quote.isVirtual()) {
                    shippingService.setShippingRates(response.shipping_methods);
                }
                paymentLoader.stopLoader();
                shippingService.isLoading(false);
            }
        ).fail(
            function (response) {
                errorProcessor.process(response);
                paymentLoader.stopLoader();
                shippingService.isLoading(false);
            }
        );
    };
});
