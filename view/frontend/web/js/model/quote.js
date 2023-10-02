define([
    'ko',
    'underscore',
    'Magento_Checkout/js/model/quote'
], function (ko, _, Quote) {
    'use strict';

    var quoteData = window.checkoutConfig.quoteData;

    return _.extend(Quote, {
        quoteVirtual: ko.observable(!!Number(quoteData['is_virtual'])),

        /**
         * @return {Boolean}
         */
        setIsVirtual: function (value) {
            return this.quoteVirtual(!!Number(value));
        },
    });
});