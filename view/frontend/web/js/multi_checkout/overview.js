/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'jquery-ui-modules/widget',
    'mage/translate'
], function ($) {
    'use strict';

    $.widget('mage.orderOverview', {
        options: {
            opacity: 0.5, // CSS opacity for the 'Place Order' button when it's clicked and then disabled.
            pleaseWaitLoader: 'span.please-wait', // 'Submitting order information...' Ajax loader.
            placeOrderSubmit: 'button[type="submit"]', // The 'Place Order' button.
            agreements: '.checkout-agreements' // Container for all of the checkout agreements and terms/conditions
        },

        /**
         * Bind a submit handler to the form.
         * @private
         */
        _create: function () {
            var scope = this;
            this.element.on('submit', $.proxy(this._showLoader, this));
            $('body').on('click', ".wk_titles_overview", function() {
                let selectedElement = $(this);
                let currentTab = $(this).attr("data-id");
                let currentTabText = $(this).attr("data-textId");
                scope.closeAll().then(
                    function(){
                        console.log("after promiswe");
                        $(currentTab).css("display", "flex")
                        $(selectedElement).addClass("selected_tab");
                        $(currentTabText).css("color","white");
                        $(selectedElement).css("background-color","#1979c3");
                    }
                );
            });
        },

        /**
         * closes all tabs asynchronously, before opening tab 
         */
        closeAll : async function(){
            let a = await new Promise(function (resolve, reject){
                $('body').find(".wk_titles_overview").each(function() {
                    let selectedElement = $(this);
                    let currentTab = $(this).attr("data-id");
                    console.log("in promise");
                    $(currentTab).css("display","none");
                    $(selectedElement).removeClass("selected_tab");
                    $(selectedElement).css("background-color","white");
                    $(".wk_each_title").css("color","#1979c3");
                    resolve(1);
                });
              });
            return a;
        },

        /**
         * Verify that all agreements and terms/conditions are checked. Show the Ajax loader. Disable
         * the submit button (i.e. Place Order).
         * @return {Boolean}
         * @private
         */
        _showLoader: function () {
            if ($(this.options.agreements).find('input[type="checkbox"]:not(:checked)').length > 0) {
                return false;
            }
            this.element.find(this.options.pleaseWaitLoader).show().end()
                .find(this.options.placeOrderSubmit).prop('disabled', true).css('opacity', this.options.opacity);

            if ($("body").find(this.options.placeOrderSubmit).prop('disabled') == false) {
                // console.log("hrllo");
                $(this.options.agreements).find('input[type="checkbox"]').each(function(){ $(this).prop( "checked", true ); })
            }

            return true;
        }
    });

    return $.mage.orderOverview;
});
