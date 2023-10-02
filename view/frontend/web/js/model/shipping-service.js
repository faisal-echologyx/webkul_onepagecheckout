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
        'underscore',
        'Magento_Checkout/js/model/checkout-data-resolver'
    ],
    function (ko, _, checkoutDataResolver) {
        "use strict";
        var shippingRates = ko.observableArray([]);
        var shippingCarriers = ko.observableArray([]);

        return {
            isLoading: ko.observable(false),
            /**
             * Set shipping rates
             *
             * @param ratesData
             */
            setShippingRates: function (ratesData) {

                this.prepareShippingCarriers(ratesData);
                shippingRates(ratesData);
                shippingRates.valueHasMutated();
                checkoutDataResolver.resolveShippingRates(ratesData);
            },

            /**
             * Get shipping rates
             *
             * @returns {*}
             */
            getShippingRates: function () {
                return shippingRates;
            },

            /**
             * Get shipping rates
             *
             * @returns {*}
             */
            getShippingCarriers: function () {
                return shippingCarriers;
            },

            prepareShippingCarriers:function (ratesData) {
                shippingCarriers([]);
                var carriers = [];

                _.each(ratesData, function (rate) {
                    var carrierTitle = rate['carrier_title'];
                    var carrierCode = rate['carrier_code'];
                    if (carriers.indexOf(carrierCode) === -1) {
                        shippingCarriers.push({carrier_title:carrierTitle, carrier_code:carrierCode});
                        carriers.push(carrierCode);
                    }
                });

                shippingCarriers.valueHasMutated();
            }
        };
    }
);
