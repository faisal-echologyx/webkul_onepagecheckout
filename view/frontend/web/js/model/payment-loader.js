define(
    [
        'ko',
        'Magento_Checkout/js/model/quote'
    ],
    function (ko, quote) {
        'use strict';

        return {
            isLoading: ko.observable(false),
            isVirtual: ko.observable(!quote.isVirtual()),
            /**
             * Start full page loader action
             */
            startLoader: function () {
                this.isLoading(true);
            },

            /**
             * Stop full page loader action
             *
             * @param {Boolean} [forceStop]
             */
            stopLoader: function (forceStop) {
                this.isLoading(false);
            }
        };
    }
);