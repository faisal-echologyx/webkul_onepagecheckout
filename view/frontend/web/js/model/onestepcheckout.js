/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
define([
    'jquery',
    'Webkul_OneStepCheckout/js/model/quote',
    'Magento_Checkout/js/model/resource-url-manager',
    'mage/storage',
    'Webkul_OneStepCheckout/js/model/validator',
    'Magento_Checkout/js/model/payment-service',
    'Magento_Checkout/js/model/payment/method-converter',
    'Magento_Checkout/js/model/error-processor',
    'Magento_Checkout/js/model/full-screen-loader',
    'Magento_Checkout/js/action/select-billing-address',
    'Magento_Checkout/js/model/shipping-save-processor/payload-extender'
], function (
    $,
    quote,
    resourceUrlManager,
    storage,
    validator,
    paymentService,
    methodConverter,
    errorProcessor,
    fullScreenLoader,
    selectBillingAddressAction,
    payloadExtender
) {
    'use strict';

    return {
        /**
         * Place Order method
         */
        placeOrder: function () {
            if (!validator.validate()) {
                // scroll to error if it's not visible in viewport
                validator.scrollToError();
                return;
            }

            if (!quote.quoteVirtual()) {
                this.submitShippingInformation(
                    this.submitPaymentInformation.bind(this)
                );
            } else {
                this.submitPaymentInformation();
            }
        },

        /**
         * This code is taken from Checkout/view/frontend/web/js/model/shipping-save-processor/default.js
         * Reason: remove setTotals and setPaymentMethods callbacks
         *
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        submitShippingInformation: function (callback) {
            var shippingAddress = quote.shippingAddress();
            var billingAddress = quote.billingAddress();
            var extArr = {};
            var payload;
            var paymentmethod = quote.paymentMethod().method;
            var isAddressSameAsShipping = $('#billing-address-same-as-shipping-shared').is(':checked');
            if (isAddressSameAsShipping) {
                selectBillingAddressAction(quote.shippingAddress());
            }

            if (shippingAddress['extension_attributes'] === undefined) {
                shippingAddress['extension_attributes'] = {};
            }

            if (shippingAddress.customAttributes != undefined) {
                $.each(shippingAddress.customAttributes , function( key, value ) {
                    var attribute = shippingAddress.customAttributes.find(
                        function (element) {
                            return element.attribute_code;
                        }
                    );
        
                    shippingAddress['extension_attributes'][attribute.attribute_code] = attribute.value;
                });
            }

            if (billingAddress['extension_attributes'] === undefined) {
                billingAddress['extension_attributes'] = {};
            }

            if (billingAddress.customAttributes != undefined) {
                $.each(billingAddress.customAttributes , function( key, value ) {
                    var attribute = billingAddress.customAttributes.find(
                        function (element) {
                            return element.attribute_code;
                        }
                    );
        
                    billingAddress['extension_attributes'][attribute.attribute_code] = attribute.value;
                });
            }

            payload = {
                addressInformation: {
                    'shipping_address': shippingAddress,
                    'billing_address': billingAddress,
                    'shipping_method_code': quote.shippingMethod()['method_code'],
                    'shipping_carrier_code': quote.shippingMethod()['carrier_code'],
                    'extension_attributes':extArr
                }
            };

            payloadExtender(payload);

            fullScreenLoader.startLoader();

            return storage.post(
                resourceUrlManager.getUrlForSetShippingInformation(quote),
                JSON.stringify(payload)
            ).done(
                function (response) {
                    quote.setTotals(response.totals);
                    fullScreenLoader.stopLoader();
                    callback();
                }
            ).fail(
                function (response) {
                    errorProcessor.process(response);
                    fullScreenLoader.stopLoader();
                }
            );
        },

        submitPaymentInformation: function () {
            // Restore agreements checkboxes in case if section was rendered very fast
            $('.checkout-agreements input:checkbox').prop('checked', true);
            $('.action.checkout', '.payment-method._active').click();
        }
    };
});
