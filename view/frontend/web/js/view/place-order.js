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
    'ko',
    'uiComponent',
    'Magento_Checkout/js/model/quote',
    'Webkul_OneStepCheckout/js/model/onestepcheckout'
], function ($, ko, Component, quote, onestepcheckout) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'Webkul_OneStepCheckout/place-order'
        },
        message: ko.observable(false),

        placeOrder: onestepcheckout.placeOrder.bind(onestepcheckout),

        initialize: function () {
            this._super();
        }
    });
});
