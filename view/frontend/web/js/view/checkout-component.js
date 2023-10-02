define([
    'jquery',
    'underscore',
    'uiComponent',
    'ko',
    'Webkul_OneStepCheckout/js/model/quote',
    'Magento_Checkout/js/action/get-payment-information',
    'Magento_Checkout/js/model/shipping-service',
    'uiRegistry',
], function (
    $,
    _,
    Component,
    ko,
    quote,
    collectTotals,
    shippingService,
    registry
) {
    'use strict';

    return Component.extend({
        visible: ko.observable(!quote.quoteVirtual()),

        initialize: function () {
            this._super();
            var self = this;
            quote.quoteVirtual.subscribe(function (value) {
                self.visible(!value);
                $.when(collectTotals()).done(function () {
                    registry.get('checkout.steps.billing-step.payment.payments-list').initialize();
                });
                if (value === false) {
                    location.reload();
                }
            });
        },
    });
});