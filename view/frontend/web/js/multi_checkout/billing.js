/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_Mpmangopay
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
/*jshint jquery:true*/

define([
    'jquery',
    'underscore',
    'mage/url',
    "mage/template",
    'mageUtils',
    'mage/translate',
    'Magento_Checkout/js/model/postcode-validator',
    'jquery-ui-modules/widget',
    'validation',
    'loader'
], function ($, __,urlBuilder, mageTemplate, utils, $t, postCodeValidator, loader) {
    'use strict';

    $.widget('mage.addressValidation', {

        /**
         * Validation creation
         *
         * @protected
         */
        _create: function () {
            var thisthis = this;
            $('body').on('click', "#wk_choose_billing", function() {
                thisthis.createAddressModal();
            });
        },
        createAddressModal : function() {
            var scope = this;
            urlBuilder.setBaseUrl(BASE_URL);
            //url for form submission
            var ajaxUrl = urlBuilder.build('multishipping/checkout_address/selectBilling');
            $('body').loader("show");
            $.ajax({
                url : ajaxUrl,
                type: 'GET',
                dataType : "html"
            }).done(function(response){ 
                $('body').loader("hide");
                scope.appendHtml(response);

            });
        },
        appendHtml : function(response) {
            var self = this;
            var options = {
                type: 'popup',
                responsive: true,
                innerScroll: true,
                buttons: []
            };
            $(self.options.modal_html).html($(response).find('#wrapper_billing_select').html());
            $(self.options.modal_html).modal(options).modal('openModal');
        }
    });

    return $.mage.addressValidation;
});
