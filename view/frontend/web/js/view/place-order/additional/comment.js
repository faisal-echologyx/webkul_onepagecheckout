define([
    'Magento_Ui/js/form/element/textarea',
    'mage/translate'
], function (AbstractField, $t) {
    'use strict';

    return AbstractField.extend({
        defaults: {
            template: 'Webkul_OneStepCheckout/form/element/comment-field'
        },
        enable: window.checkoutConfig.opc_general.order_comment == '1',
        label: $t('Order Comment'),

        getLabel: function () {
            if (!window.checkoutConfig.opc_general.order_comment_label) {
                return $t('Order Comment');
            }
            return window.checkoutConfig.opc_general.order_comment_label;
        }
    });
});
