/**
 * Webkul Software
 *
 * @category Webkul
 * @package Webkul_
 * @author Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license https://store.webkul.com/license.html
 */

define(
    [
    'jquery',
    'uiRegistry',
    'underscore'
    ],
    function ($, uiRegistry, _) {
    'use strict';

    return function (Default) {
        return Default.extend({
            getData: function () {
                var agreementsConfig = window.checkoutConfig.checkoutAgreements,
                    enableComment = window.checkoutConfig.opc_autocomplete.order_comment == '1',
                    agreementForm,
                    agreementData,
                    agreementIds;

                agreementForm = $('.opc-block-summary div[data-role=checkout-agreements] input');
                if ($(agreementForm).length==0) {
                    agreementForm = $('.payment-method._active div[data-role=checkout-agreements] input');
                }
                var paymentData = this._super();
                if (paymentData['extension_attributes'] === undefined) {
                    paymentData['extension_attributes'] = {};
                }

                agreementData = agreementForm.serializeArray();
                agreementIds = [];
                if (agreementsConfig.isEnabled) {
                    agreementData.forEach(function (item) {
                        agreementIds.push(item.value);
                    });

                    paymentData['extension_attributes']['agreement_ids'] = agreementIds;
                }

                this.source = uiRegistry.get('checkout.sidebar.place-order-before-additional.addition-information');
                _.each(this.source.elems(), function (element) {
                    paymentData['extension_attributes'][element.dataScope] = element.value();
                });

                return paymentData;
            }
        });
    }
    }
);
