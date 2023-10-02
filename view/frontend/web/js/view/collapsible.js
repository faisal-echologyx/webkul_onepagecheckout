define([
    'jquery',
    'uiComponent',
    'underscore',
    'matchMedia',
    'jquery-ui-modules/widget',
    'mage/translate'
], function ($, Component, _, mediaCheck) {
    'use strict';
    return Component.extend({
        isCollapsibleEnable: window.checkoutConfig.opc_general.is_block_collapsible == '1',
        initialize: function () {
            this._super();
            var self = this;
            setTimeout(function () {
                if (self.isCollapsibleEnable) {
                    $(".colps-group").collapsible({
                        active: true,
                        header: '.colps-title',
                        content: '.colps-content',
                        openedState: 'active'
                    });
                    $(".colps-group").addClass('opc-collapsible');
                }
            }, 4000);

            return this;
        },
    });
    return $.mage.opcCollepsible;
});