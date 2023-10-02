/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
/*global define*/
define(
    [
        'ko',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/model/shipping-rate-processor/new-address',
        'Magento_Checkout/js/model/shipping-rate-processor/customer-address',
        'Magento_Checkout/js/model/shipping-rate-registry'
    ],
    function (ko, quote, defaultProcessor, customerAddressProcessor,rateRegistery) {
        "use strict";

    var processors = {},
    isRequiredReload = ko.observable(false);

    processors.default =  defaultProcessor;
    processors['customer-address'] = customerAddressProcessor;

    quote.shippingAddress.subscribe(function () {
        var type = quote.shippingAddress().getType();

        if (processors[type]) {
            processors[type].getRates(quote.shippingAddress());
        } else {
            processors.default.getRates(quote.shippingAddress());
        }
    });

    return {
        /**
         * @param {String} type
         * @param {*} processor
         */
        registerProcessor: function (type, processor) {
            processors[type] = processor;
        },

        getReloadRequired: function () {
            return isRequiredReload;
        },

        setReloadRequired: function (value) {
            isRequiredReload(value);
        },
        reEstimateShippingMethods: function () {
            var type = quote.shippingAddress().getType();
            rateRegistery.set(quote.shippingAddress().getCacheKey(), null);
            if (processors[type]) {
                processors[type].getRates(quote.shippingAddress());
            } else {
                processors.default.getRates(quote.shippingAddress());
            }
        }
    };
});
