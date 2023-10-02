/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
/*jshint browser:true jquery:true*/
/*global alert*/
define(
    [
        'jquery',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/model/url-builder',
        'Magento_Customer/js/model/customer',
        'Magento_Checkout/js/model/place-order'
    ],
    function ($, quote, urlBuilder, customer, placeOrderService) {
        'use strict';
        return function (paymentData, messageContainer) {

            var agreementsConfig = window.checkoutConfig.checkoutAgreements;
            var serviceUrl, payload, agreementForm, agreementData, agreementIds;
            var gstNumber = "";
            agreementForm = $('.opc-block-summary div[data-role=checkout-agreements] input');
            if ($(agreementForm).length==0) {
                agreementForm = $('.payment-method._active div[data-role=checkout-agreements] input');
            }

            payload = {
                cartId: quote.getQuoteId(),
                billingAddress: billingAddress,
                paymentMethod: paymentData
            };
            console.log(payload);
            if (customer.isLoggedIn()) {
                serviceUrl = urlBuilder.createUrl('/carts/mine/payment-information', {});
            } else {
                serviceUrl = urlBuilder.createUrl('/guest-carts/:quoteId/payment-information', {
                    quoteId: quote.getQuoteId()
                });
                payload.email = quote.guestEmail;
            }

            return placeOrderService(serviceUrl, payload, messageContainer);
        };
    }
);
