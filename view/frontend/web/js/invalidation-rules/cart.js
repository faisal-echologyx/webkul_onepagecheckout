/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'uiClass',
    'mage/url',
    'Magento_Customer/js/section-config'
], function ($, Element, url, sectionConfig) {
    'use strict';

    return Element.extend({

        defaults: {
            sections: {}
        },

        /**
         * Takes website id from current customer data and compare it with current website id
         * If customer belongs to another scope, we need to invalidate current section
         *
         * @param {Object} customerData
         */
        process: function (customerData) {
            var sections = ['merge-quote', 'cart'];
                customerData.invalidate(sections);
                customerData.reload(sections, true);

            if (customerData.options) {
                var sections = ['merge-quote', 'cart'];
                customerData.invalidate(sections);
                customerData.reload(sections, true);
            } else {
                url.setBaseUrl(window.BASE_URL);
                var parameters;
                var sectionNames = ['merge-quote', 'cart'];
                sectionNames = sectionConfig.filterClientSideSections(sectionNames);
                parameters = _.isArray(sectionNames) ? {
                    sections: sectionNames.join(',')
                } : [];
                return $.getJSON(url.build('customer/section/load'), parameters).fail(function (jqXHR) {
                    throw new Error(jqXHR);
                });
            }
        }
    });
});
