/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

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
        options: {
            selectors: {
                button: '[data-action=save-address]',
                zip: '#zip',
                country: 'select[name="country_id"]:visible'
            }
        },

        zipInput: null,
        countrySelect: null,

        /**
         * Validation creation
         *
         * @protected
         */
        _create: function () {
            var thisthis = this;

            /**
             * load first component on page load
             */
            $( document ).ready(function() {
                thisthis.loadFirstBlock();
            });

            /**
             * on click of this, reused create address modal
             */
            $('body').on("click", '.wk_edit_ship_addr', function() {
               var addressId = $(this).attr("data-addr");
               $('body').find("#form_button").attr("data-addId",addressId);
               thisthis.editShippingAddress(this);
            });

            /**
             * on click of radio button invoke overview
             */
            $('body').on('click', "#payment-methods input[type=radio]", function() {
                thisthis.orderOverview();
            });

            /**
             * select shipping
             */
            $('body').on('click', ".wk_radio_shipping", function() {
                thisthis.updateBillings();
            });

            /**
             * remove item
             */
            $('body').on('click', ".wk_remove_item", function() {
                let productId = $(this).attr("data-productId");
                let inputQuantity = $(this).attr("data-inputVal");
                let itemQuantity = $(inputQuantity).val();
                let addressId = $(this).parent('td').next().find('select').val();
                thisthis.removeItem(productId, itemQuantity, addressId);
            });

            /**
             * change address in first blolck
             */
            $('body').on('change', '#wk_address_list > select', function(){
                thisthis.updateShippings(thisthis);
            } );

            $('body').on('click', '#update_qty', function(){
                thisthis.updateShippings(thisthis);
            } );

            /**
             * for clicking address on modal(billing block)
             */
            $('body').on('click', '.wk_box-billing-address', function(){
                let currentAddress= $(this);
                thisthis.unselectAddressTabModal().then(
                    function(){
                        currentAddress.removeClass("unselect_box_billing_address");
                        currentAddress.addClass("select_box_billing_address");
                        thisthis.setNewBillingAddress(currentAddress);
                    }
                );
            } );

            urlBuilder.setBaseUrl(BASE_URL);
            //url for form submission

            //adds added address to the select options
            var template = mageTemplate("#some-template");
            var button = $(this.options.selectors.button, this.element);

            this.zipInput = $(this.options.selectors.zip, this.element);
            this.countrySelect = $(this.options.selectors.country, this.element);

            this.element.validation({

                /**
                 * Submit Handler
                 * @param {Element} form - address form
                 */
                submitHandler: function (form) {
                    const scope = thisthis;
                    //create address
                    var formData = new FormData(form);
                    var val = "";

                    for (var p of formData) {
                        //gets address
                        let name = p[0];
                        let value = p[1];
                        if(name!="success_url" && name!="error_url" && name!="form_key")
                        {
                            val = val+value+",";
                        }
                    }

                    var newField = template({
                        data: {
                            count: parseInt($("#wk_address_list>select option:last-child").val())+1,
                            content: val
                        }
                    });
                    let ajaxUrl = urlBuilder.build('customer/address/formPost');
                    //for update
                    let formAction = $("body").find("#form_button").attr("data-flag");
                    let addressId = $("body").find("#form_button").attr("data-addid");
                    //for update
                    if (formAction == "update") {
                        ajaxUrl = ajaxUrl+"/id/"+addressId;
                    }
                    //update condition ends

                    // ajax starts
                    $('body').loader("show");
                    $.ajax({
                    url : ajaxUrl,
                    type: 'POST',
                    dataType : "html",
                    data : $(form).serialize()
                    }).done(function(response){
                        $('body').loader("hide");
                        $("#popup-modal").modal("closeModal");
                        scope.loadFirstBlock();
                    });
                    // ajax ends
                }
            });

            this._addPostCodeValidation();
        },

        /**
         * removes item (first block)
         * @param {productId} productId
         * @param {itemQuantity} itemQuantity
         */
        removeItem : function(productId, itemQuantity, addressId) {
            var scope = this, total = $('#multiship-addresses-table').find('tbody').find('tr');
            let removeItemurl = urlBuilder.build("onestepcheckout/multishipping/removeItem");
            $.ajax({
            url : removeItemurl,
            type: 'GET',
            data: {
                product_id:productId,
                item_quantity:itemQuantity,
                address: addressId
            }
            }).done(function(response){
                scope.renderProducts(response, scope);
                if (total.length == 1) {
                    location.reload();
                }
            });
        },

        /**
         * render the list after removeItem func.
         * @param {*} response
         * @param {*} scope
         */
        renderProducts : function(response, scope) {
            $('body').find("#checkout_multishipping_form").html($(response).find('#checkout_multishipping_form').html());
            scope.loadFirstBlock();
            // scope.updateShippings(this);
        },

        /**
         * show first block on removal of product, and on page load
         */
        loadFirstBlock : function() {
            var scope = this;
            urlBuilder.setBaseUrl(BASE_URL);
            let firstBlockUrl = urlBuilder.build('multishipping/checkout/addresses');
            $('body').loader("show");
            $.ajax({
            url : firstBlockUrl,
            type: 'GET'
            }).done(function(response){
                $('body').find("#checkout_multishipping_form").html($(response).find('#checkout_multishipping_form').html());
                $('body').loader("hide");
                $('body').find("#wk_osc_address_div").removeClass("wk-display-none");
                scope.updateShippings(scope);
                // scope.loadFirstBlockHtml(response);
            });
            // thisthis.updateBillings(thisthis);
        },

        loadFirstBlockHtml : function (response) {
            $('body').find("#checkout_multishipping_form").html($(response).find('#checkout_multishipping_form').html());
            updateShippings(this);
        },

        updateShippings :function(thisthis) {
            urlBuilder.setBaseUrl(BASE_URL);
            $('body').find("#can_continue_flag").val(parseInt($('body').find("#button_submit_flag").data('flag'), 10));
            var formKey = $('body').find("input[name=form_key]").val();
            var shippingFormUrl = urlBuilder.build('multishipping/checkout/addressesPost')+'?form_key='+formKey;
            $('body').loader("show");
            $.ajax({
            url : shippingFormUrl,
            type: 'POST',
            data : $("#checkout_multishipping_form").serialize()
            }).done(function(response){
                $('body').loader("hide");
                thisthis.updateShippingBlockHtml(response);
            });
            // thisthis.updateBillings(thisthis);
        },

        updateShippingBlockHtml : function(response) {
            $('body').find("#shipping_method_form").html($(response).find('#shipping_method_form').html());
            $('body').find("#wk_osc_shipping_div").removeClass("wk-display-none");
            this.updateBillings();
        },

        updateBillings : function() {
            let scope = this;
            urlBuilder.setBaseUrl(BASE_URL);
            var formKey = $('body').find("input[name=form_key]").val();
            var billingFormUrl = urlBuilder.build('multishipping/checkout/shippingPost')+'?form_key='+formKey;
            $('body').loader("show");
            $.ajax({
            url : billingFormUrl,
            type: 'POST',
            data : $("#shipping_method_form").serialize()
            }).done(function(response){
                $('body').loader("hide");
                scope.updateBillingBlockHtml(response);
            });
        },

        updateBillingBlockHtml : function(response) {
            $('body').find("#multishipping-billing-form").html($(response).find('#multishipping-billing-form').html());
            this.orderOverview();
        },

        orderOverview: function() {
            let scope = this;
            urlBuilder.setBaseUrl(BASE_URL);
            var formKey = $('body').find("input[name=form_key]").val();
            var overviewFormUrl = urlBuilder.build('multishipping/checkout/overview')+'?form_key='+formKey;
            $('body').loader("show");
            $.ajax({
            url : overviewFormUrl,
            type: 'POST',
            data : $("#multishipping-billing-form").serialize()
            }).done(function(response){
                $('body').loader("hide");
                scope.updateorderOverviewBlockHtml(response);
            });
        },

        updateorderOverviewBlockHtml : function(response){
            $('body').find("#review-order-form").html($(response).find('#review-order-form').html());
            let terms = $('body').find(".checkout-agreements-block").html();
            $('body').find(".checkout-agreements-block").each(
                function(count){
                    if(count==0){
                        $(this).find('input[type="checkbox"]').each(function (){
                            $(this).prop("checked", true);});
                            // $(this).remove();
                        $(this).css("display", "none");
                    }
                    else{
                        $(".checkout-agreements-block:nth-of-type(2)").html($(this).html());
                        $(this).find('input[type="checkbox"]').each(function (){
                            $(this).prop("checked", false);});
                    }
            });
            $( "body" ).find("#titleText1").trigger( "click" );
        },

        editShippingAddress : function(scope) {
            urlBuilder.setBaseUrl(BASE_URL);
            //url for form submission
            let address_id = $(scope).data("addr");
            let addressUrl = urlBuilder.build("onestepcheckout/multishipping/getAddress");
            this.getAddress(addressUrl, address_id);
        },

        unselectAddressTabModal : async function(){
            let a = await new Promise(function (resolve, reject){
                $('body').find(".wk_box-billing-address").each(function() {
                    let selectedElement = $(this);
                    selectedElement.removeClass("select_box_billing_address");
                    selectedElement.addClass("unselect_box_billing_address");
                    resolve(1);
                });
              });
            return a;
        },

        setNewBillingAddress : function(currentAddress) {
            let scope = this;
            let ajaxShipUrl =currentAddress.attr("data-link");
            $('body').loader("show");
            $.ajax({
                url : ajaxShipUrl,
                type: 'GET'
                }).done(function(response){
                    $('body').loader("hide");
                    scope.updateBillingBlockHtml(response);
                    $("#adddress-popup-modal").modal("closeModal");
            });
        },

        getAddress : function(addressUrl, address_id) {
            let scope = this;
            $.ajax({
            url : addressUrl,
            data:{
                address_id:address_id
            },
            type: 'GET'
            }).done(function(response){
                scope.initializeAddress(response);
            });
        },

        /**
         * initialize address modal
         * @param {*} response
         */
        initializeAddress : function(response) {
            $('body').find("#firstname").val(response.firstname);
            $('body').find("#lastname").val(response.lastname);
            $('body').find("#company").val(response.company);
            $('body').find("#telephone").val(response.telephone);
            $('body').find("#street_1").val(response.street_lines[0]);

            for (var count = 1; count < response.street_lines.length; count++) {
                let selector = count+1;
                $('body').find("#street_"+selector).val(response.street_lines[selector-1]);
            }

            $('body').find("#country").val(response.country_id);
            $('body').find("#country").trigger("change");
            $('body').find("#zip").val(response.postcode);
            $('body').find("#region_id").val(response.region_id);
            $('body').find("#city").val(response.city);

            this.openModal();
        },

        openModal : function() {
            //for address update
            $('body').find("#form_button").attr("data-flag","update");
            var options = {
                type: 'popup',
                responsive: true,
                innerScroll: true,
                buttons: []
            };
            $("#popup-modal").modal(options).modal('openModal');
        },

        /**
         * Add postcode validation
         *
         * @protected
         */
        _addPostCodeValidation: function () {
            var self = this;

            this.zipInput.on('keyup', __.debounce(function (event) {
                    var valid = self._validatePostCode(event.target.value);

                    self._renderValidationResult(valid);
                }, 500)
            );

            this.countrySelect.on('change', function () {
                var valid = self._validatePostCode(self.zipInput.val());

                self._renderValidationResult(valid);
            });
        },

        /**
         * Validate post code value.
         *
         * @protected
         * @param {String} postCode - post code
         * @return {Boolean} Whether is post code valid
         */
        _validatePostCode: function (postCode) {
            var countryId = this.countrySelect.val();

            if (postCode === null) {
                return true;
            }

            return postCodeValidator.validate(postCode, countryId, this.options.postCodes);
        },

        /**
         * Renders warning messages for invalid post code.
         *
         * @protected
         * @param {Boolean} valid
         */
        _renderValidationResult: function (valid) {
            var warnMessage,
                alertDiv = this.zipInput.next();

            if (!valid) {
                warnMessage = $t('Provided Zip/Postal Code seems to be invalid.');

                if (postCodeValidator.validatedPostCodeExample.length) {
                    warnMessage += $t(' Example: ') + postCodeValidator.validatedPostCodeExample.join('; ') + '. ';
                }
                warnMessage += $t('If you believe it is the right one you can ignore this notice.');
            }

            alertDiv.children(':first').text(warnMessage);

            if (valid) {
                alertDiv.hide();
            } else {
                alertDiv.show();
            }
        }
    });

    return $.mage.addressValidation;
});
