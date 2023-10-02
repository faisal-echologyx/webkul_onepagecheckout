define(
    [
        'jquery',
        'Magento_Checkout/js/model/resource-url-manager'
    ],
    function ($, resourceUrlManager) {
        "use strict";

        return $.extend({
            /**
             * @param {Object} quote
             * @return {*}
             */
            getUrlForUpdateCartItem: function (quote) {
                var params = this.getCheckoutMethod() == 'guest' ? //eslint-disable-line eqeqeq
                        {
                            cartId: quote.getQuoteId()
                        } : {},
                    urls = {
                        'guest': '/guest-carts/:cartId/update-cart',
                        'customer': '/carts/mine/update-cart'
                    };

                return this.getUrl(urls, params);
            },
            /**
             * @param {Object} quote
             * @return {*}
             */
            getOpcUrlForSetShippingInformation: function (quote) {
                var params = this.getCheckoutMethod() == 'guest' ? //eslint-disable-line eqeqeq
                        {
                            cartId: quote.getQuoteId()
                        } : {},
                    urls = {
                        'guest': '/opc-guest-carts/:cartId/total-information',
                        'customer': '/opc-carts/mine/total-information'
                    };

                return this.getUrl(urls, params);
            }
        }, resourceUrlManager);
});