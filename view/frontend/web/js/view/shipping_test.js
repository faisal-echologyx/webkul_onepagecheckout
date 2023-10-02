define([
    'jquery', 
    'uiComponent', 
    'ko', 
    'mage/url',
    'Magento_Ui/js/modal/modal',
], function (
    $, 
    Component, 
    ko, 
    urlBuilder, 
    modal
    ) {
    'use strict';
    return Component.extend({
        defaults: {
            template: 'Webkul_OneStepCheckout/knockout-test'
        },
        initialize: function () {
            this._super();
        },
        showFormPopUp : function() {
            var thisthis = this;
            thisthis.initialSetup();
        },
        initialSetup : function() {
            $('body').find("#form_button").attr("data-flag","create");
            $('body').find("#form_button").attr("data-addId","");

            $('body').find("#firstname").val("");
            $('body').find("#lastname").val("");
            $('body').find("#company").val("");
            $('body').find("#telephone").val("");
            $('body').find("#street_1").val("");

            let fields = parseInt($('body').find('.nested .field').length)+1

            for (var count = 1; count <= fields; count++) {
                $('body').find("#street_"+count).val("");
            }

            $('body').find("#country").val("");
            $('body').find("#country").trigger("change");
            $('body').find("#zip").val("");
            $('body').find("#region_id").val("");
            $('body').find("#city").val("");

            this.openModal();
        },
        openModal : function() {
            var options = {
                type: 'popup',
                responsive: true,
                innerScroll: true,
                buttons: []
            };
            $("#popup-modal").modal(options).modal('openModal');
        }
    });
}
);