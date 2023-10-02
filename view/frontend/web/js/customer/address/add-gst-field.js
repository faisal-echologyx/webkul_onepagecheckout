/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
/*jshint jquery:true*/
define([
    "jquery",
    'mage/template',
    'mage/translate',
    "jquery/ui"
], function ($,mageTemplate,$t) {
    'use strict';
    $.widget('mage.addGstField', {
        options: {
            gstNumber: '#gst_number',
            country:    '#country',
            gstDiv: '.gstnumber',
            saveButton: '.action'
        },
        _create: function () {
            var self = this;
            $(self.options.country).on('change', function () {
                if ($(this).val()=="IN") {
                    $(self.options.gstDiv).show();
                } else {
                    $(self.options.gstDiv).hide();
                }
            });

            $(self.options.gstNumber).on('focusout', function () {
                var gstIn = $(this).val();
                if (gstIn!="") {
                    var regex = new RegExp('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');
                    if (!regex.test(gstIn)) {
                        $(this).addClass('mage-error');
                        var msg = $t('Invalid GST Number.Example 22AAAAA0000A1Z5');
                        self.addNotice($(self.options.gstDiv), msg);
                        return false;
                    }
                }
                self.removeNotice($(self.options.gstDiv));
                $(this).removeClass('mage-error');
                return true;
            });

            $(self.options.saveButton).on('click', function () {
                if ($(self.options.gstNumber).hasClass('mage-error')) {
                    return false;
                }
                return true;
            });
        },

        /**
         * Add notice message at the top of the element
         *
         * @param el
         * @param msg
         */
        addNotice: function (el, msg) {
            el.after(
                '<div class="gst-notice message notice"><span>' +
                    msg +
                '</span></div>'
            );
        },

        /**
         * Remove notice label
         *
         * @param  el
         * @return void
         */
        removeNotice: function (el) {
            $('body').find('.gst-notice').remove();
        }
    });
    return $.mage.addGstField;
});
