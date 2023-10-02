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

    $.widget('mage.shippingAccordion', {

        /**
         * Validation creation
         *
         * @protected
         */
        _create: function () {
            var scope = this;
            $('body').on('click', ".wk_ship_title", function() {
                console.log("testts");
                let selectedElement = $(this);
                let operationTab = selectedElement.attr("data-id");
                let status = $(operationTab).attr("data-status");
                scope.closeOthersOpenSelectedTab().then(
                    function(){
                        if(status == "close"){
                            $(operationTab).removeClass("wk_close_ship_content");
                            $(operationTab).addClass("wk_open_ship_content");

                            selectedElement.find(" .font-awesome-dropdown .wk_fa_up").addClass("wk_display_block");
                            selectedElement.find(" .font-awesome-dropdown .wk_fa_up").removeClass("wk_display_none");
                            selectedElement.find(" .font-awesome-dropdown .wk_fa_down").removeClass("wk_display_block");
                            selectedElement.find(" .font-awesome-dropdown .wk_fa_down").addClass("wk_display_none");

                            $(operationTab).attr("data-status","open");        
                        } else{
                            $(operationTab).addClass("wk_close_ship_content");
                            $(operationTab).removeClass("wk_open_ship_content");

                            selectedElement.find(" .font-awesome-dropdown .wk_fa_up").removeClass("wk_display_block");
                            selectedElement.find(" .font-awesome-dropdown .wk_fa_up").addClass("wk_display_none");
                            selectedElement.find(" .font-awesome-dropdown .wk_fa_down").addClass("wk_display_block");
                            selectedElement.find(" .font-awesome-dropdown .wk_fa_down").removeClass("wk_display_none");

                            $(operationTab).attr("data-status","close"); 
                        }
                    }
                );
            });
        },

        /**
         * close all accordion before opening selected one
         */
        closeOthersOpenSelectedTab : async function(){
            let a = await new Promise(function (resolve, reject){
                $('body').find(".wk_ship_content").each(function() {
                    let selectedElement = $(this);
                    let title = selectedElement.attr("data-titleId");
                    // let currentTab = $(this).attr("data-id");
                    $(selectedElement).attr("data-status","close");
                    $(selectedElement).addClass("wk_close_ship_content");
                    $(selectedElement).removeClass("wk_open_ship_content");

                    $(title+" .font-awesome-dropdown .wk_fa_up").removeClass("wk_display_block");
                    $(title+" .font-awesome-dropdown .wk_fa_up").addClass("wk_display_none");
                    $(title+" .font-awesome-dropdown .wk_fa_down").addClass("wk_display_block");
                    $(title+" .font-awesome-dropdown .wk_fa_down").removeClass("wk_display_none");

                    resolve(1);
                });
              });
            return a;
        },
    });

    return $.mage.shippingAccordion;
});
