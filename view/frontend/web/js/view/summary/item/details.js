/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'underscore',
    'jquery',
    'uiComponent',
    'Magento_Ui/js/modal/confirm',
    'Webkul_OneStepCheckout/js/action/update-cart',
    'mage/translate'
], function (_, $, Component, confirm, updateCartAction) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'Webkul_OneStepCheckout/summary/item/details'
        },
        changeQtyTimout: 0,
        changeQtyInterval: 600,
        confirmMessage: $.mage.__('Are you sure you would like to remove this item from the shopping cart?'),

        /**
         * @param {Object} quoteItem
         * @return {String}
         */
        getValue: function (quoteItem) {
            return quoteItem.name;
        },
        decreaseQty: function(item, event) {
            var self = this,
                paylaod = {},
                cartData = {},
                quantityBox = $(event.target).parent().siblings('input'),
                lastQty = parseFloat(quantityBox.val()),
                itemId = quantityBox.data('cart-item'),
                newQty = lastQty - 1;

            clearTimeout(this.changeQtyTimout);
            if (newQty < 1) {
                newQty = 1;
            }
            quantityBox.val(newQty);
            if (lastQty !== newQty) {
                cartData.qty = newQty;
                cartData.item_id = itemId;

                this.updateCart(cartData);
            }
        },
        increaseQty: function(item, event) {
            var self = this, cartData = {};
            clearTimeout(this.changeQtyTimout);

            var quantityBox = $(event.target).parent().siblings('input'),
                lastQty = parseFloat(quantityBox.val()),
                itemId = quantityBox.data('cart-item'),
                newQty = lastQty + 1;

            quantityBox.val(newQty);

            cartData.qty = newQty;
            cartData.item_id = itemId;
            this.updateCart(cartData);

        },
        onChange: function(item, event) {
            var self = this, cartData = {};
            var quantityBox = $(event.target),
            qty = parseFloat(quantityBox.val()),
            itemId = quantityBox.data('cart-item');

            if (qty !== 0) {
                cartData.qty = qty;
                cartData.item_id = itemId;
                this.updateCart(cartData);
            }
        },

        removeItem: function(item, event) {
            var self = this, cartData = {}, paylaod = {},
                elm = $(event.target),
                itemId = elm.data('cart-item');
            confirm({
                content: self.confirmMessage,
                actions: {
                    /** @inheritdoc */
                    confirm: function () {
                        cartData.qty = 0;
                        cartData.item_id = itemId;
                        paylaod.cartData = JSON.stringify(cartData);
                        updateCartAction(paylaod);
                    },

                    /** @inheritdoc */
                    always: function (e) {
                        event.stopImmediatePropagation();
                    }
                }
            });
        },

        updateCart: function (cartData) {
            var self = this, paylaod = {};
            paylaod.cartData = JSON.stringify(cartData);
            this.changeQtyTimout = setTimeout(() => {
                updateCartAction(paylaod);
            }, self.changeQtyInterval);
        }
    });
});
