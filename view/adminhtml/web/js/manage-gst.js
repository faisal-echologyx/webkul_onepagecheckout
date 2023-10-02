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
require([
    'jquery',
    'mage/template',
    "jquery/ui"
], function($, $t) {
    $(document).ready(function($){
        var self = this;
        $('body').on('focusout', "input[name='gst_number']", function () {
            var gstIn = $(this).val();
            var el = $(this).parents("[data-index ='gst_number']");
            if (gstIn!="") {
                $('.onestepcheckout-msg').remove();
                var regex = new RegExp('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');
                if (regex.test(gstIn)) {
                    $('.onestepcheckout-msg').remove();
                    $('.customer_form_areas_address_address_customer_address_update_modal #save').attr('disabled', false);
                    el.removeClass('_error');
                    return true;
                }
                var msg = "Invalid GST Number.Example 22AAAAA0000A1Z5";
                el.addClass('_error');
                $('.customer_form_areas_address_address_customer_address_update_modal #save').attr('disabled', true);
                el.prepend(
                    '<div class="onestepcheckout-msg message notice"><span>' +
                        msg +
                    '</span></div>'
                );
                return false;
            }
        });
    });
});
