/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
/*jshint browser:true*/
/*global define*/

define([
    'uiComponent',
    'Magento_Customer/js/model/address-list',
    'mage/translate',
    'Magento_Customer/js/model/customer'
], function (Component, addressList, $t, customer) {
    'use strict';

    var newAddressOption = {
            /**
             * Get new address label
             * @returns {String}
             */
            getAddressInline: function () {
                return $t('New Address');
            },
            customerAddressId: null
        },
        addressOptions = addressList().filter(function (address) {
            return address.getType() === 'customer-address';
        });

    return Component.extend({
        defaults: {
            template: 'Magento_Checkout/billing-address',
            selectedAddress: null,
            isNewAddressSelected: false,
            addressOptions: addressOptions,
            exports: {
                selectedAddress: '${ $.parentName }:selectedAddress'
            }
        },

        /**
         * @returns {Object} Chainable.
         */
        initConfig: function () {
            this._super();
            this.addressOptions.push(newAddressOption);

            return this;
        },

        /**
         * @return {exports.initObservable}
         */
        initObservable: function () {
            this._super()
                .observe('selectedAddress isNewAddressSelected')
                .observe({
                    isNewAddressSelected: !customer.isLoggedIn() || !addressOptions.length
                });

            return this;
        },

        /**
         * @param {Object} address
         * @return {*}
         */
        addressOptionsText: function (address) {
            return address.getAddressInline();
        },

        /**
         * @param {Object} address
         */
        onAddressChange: function (address) {
            this.isNewAddressSelected(address === newAddressOption);
        }
    });
});
