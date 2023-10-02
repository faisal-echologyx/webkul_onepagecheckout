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
    'ko',
    'jquery',
    'underscore',
    'uiComponent',
    'Magento_Ui/js/modal/confirm',
    'mage/url',
    'mage/template',
    'mage/translate',
    'mage/validation'
], function (ko, $, _, Component, confirm, urlBuilder, mageTemplate, $t) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'Webkul_OneStepCheckout/buy-now',
            buttonText: $t('Buy Now'),
            redirectUrl: urlBuilder.build('checkout/index/index'),
            productFormSelector: '#product_addtocart_form'
        },

        /**
         * Confirmation method
         */
        buyNow: function () {
            var form = $(this.productFormSelector);
            var redirectUrl = this.redirectUrl;
            var el = '<input type="hidden" name="is_buynow" value="1"/>';
            if (!(form.validation() && form.validation('isValid'))) {
                return;
            }
            form.append(el);
            var formData = new FormData(form[0]);
            $.ajax({
                url: form.attr('action'),
                data: formData,
                type: 'post',
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false,

                /** Show loader before send */
                beforeSend: function () {
                    $('body').trigger('processStart');
                },
                success: function (res) {
                    window.location = redirectUrl;
                    return;
                }, complete: function (res) {
                    window.location = redirectUrl;
                }
            });
        }
    });
});
