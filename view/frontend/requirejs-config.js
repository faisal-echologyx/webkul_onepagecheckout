/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
var config = {};
if (window.location.href.indexOf('onestepcheckout') !== -1) {
    var config = {
        map: {
            '*': {
                'Magento_Checkout/js/view/billing-address':'Webkul_OneStepCheckout/js/view/billing-address',
                'Magento_Checkout/js/model/shipping-rate-service': 'Webkul_OneStepCheckout/js/model/shipping-rate-service',
                'Magento_Checkout/js/model/shipping-rates-validator': 'Webkul_OneStepCheckout/js/model/shipping-rates-validator',
                'Magento_CheckoutAgreements/js/model/agreements-assigner': 'Webkul_OneStepCheckout/js/model/agreements-assigner',
                'Magento_CheckoutAgreements/js/model/agreement-validator': 'Webkul_OneStepCheckout/js/model/agreement-validator',
                'Magento_SalesRule/js/action/select-payment-method-mixin': 'Webkul_OneStepCheckout/js/action/select-payment-method-mixin',
                billing : 'Webkul_OneStepCheckout/js/multi_checkout/billing',
                orderOverview : 'Webkul_OneStepCheckout/js/multi_checkout/overview',
                shippingAccordion : 'Webkul_OneStepCheckout/js/multi_checkout/shippingAccordion'
            },
            'Magento_Checkout/js/model/shipping-save-processor/default': {
                'Magento_Checkout/js/model/full-screen-loader': 'Webkul_OneStepCheckout/js/model/payment-loader'
            },
            'Webkul_OneStepCheckout/js/view/billing-address': {
                'Magento_Checkout/js/model/quote': 'Webkul_OneStepCheckout/js/model/quote'
            },
            'Webkul_OneStepCheckout/js/view/shipping': {
                'Magento_Checkout/js/model/quote': 'Webkul_OneStepCheckout/js/model/quote'
            }
        },
        config: {
            mixins: {
                'Magento_Checkout/js/action/set-shipping-information': {
                    'Webkul_OneStepCheckout/js/action/set-shipping-information-mixin': true
                },
                'Magento_Checkout/js/action/set-billing-address': {
                    'Webkul_OneStepCheckout/js/action/set-billing-address-mixin': true
                },
                'Magento_Checkout/js/action/create-billing-address': {
                    'Webkul_OneStepCheckout/js/action/set-billing-address-mixin': true
                },
                'Magento_Checkout/js/action/place-order': {
                    'Webkul_OneStepCheckout/js/action/set-billing-address-mixin': true
                },
                'Magento_Checkout/js/view/payment/default': {
                    'Webkul_OneStepCheckout/js/view/payment/default-mixin': true
                }
            }
        }
    };
} else {
    var config = {
        map: {
            '*': {
                addGstField: 'Webkul_OneStepCheckout/js/customer/address/add-gst-field'
            }
        },
    };

}

