/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
/*jshint browser:true jquery:true*/
/*global alert*/
define([
    'jquery',
    'mageUtils',
    'mage/translate',
    'Webkul_OneStepCheckout/js/model/validator'
], function ($, utils, $t, validator) {
    'use strict';
    return {
        validateShippingGst: function (gstIn) {
            var el = $('body').find("div[name ='shippingAddress.custom_attributes.gst_number']");
            if (gstIn!="") {
                validator.gstRemoveNotice(el);
                var regex = new RegExp('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');
                if (regex.test(gstIn)) {
                    validator.gstRemoveNotice(el);
                    el.removeClass('_error');
                    return true;
                }
                var message = $t('Invalid GST Number.Example 22AAAAA0000A1Z5');
                el.addClass('_error');
                validator.gstAddNotice(el, message);
                return false;
            }
            return true;
        },
        validateBillingGst: function (gstIn) {
            var el = $('body').find(".billing-address-form").find("input[name ='custom_attributes[gst_number]']").parent().parent();
            if (gstIn!="") {
                validator.gstRemoveNotice(el);
                var regex = new RegExp('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');
                if (regex.test(gstIn)) {
                    validator.gstRemoveNotice(el);
                    el.removeClass('_error');
                    return true;
                }
                var message = $t('Invalid GST Number.Example 22AAAAA0000A1Z5');
                el.addClass('_error');
                validator.gstAddNotice(el, message);
                return false;
            }
            return true;
        },


    }
});
