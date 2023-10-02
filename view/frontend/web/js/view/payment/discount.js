define(
    [
        'ko',
        'Magento_SalesRule/js/view/payment/discount',
    ],
    function (ko, Component) {
        'use strict';

        return Component.extend({
            defaults: {
                template: 'Webkul_OneStepCheckout/payment/discount'
            }
        });
    }
);