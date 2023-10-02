/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
/*global define*/
define(
    ['jquery'],
    function ($) {
        'use strict';

        var ratesRules = {},
            checkoutConfig = window.checkoutConfig;

        return {
            registerRules: function (carrier, rules) {
                if (checkoutConfig.activeCarriers.indexOf(carrier) !== -1) {
                    ratesRules[carrier] = rules.getRules();
                }
            },
            getRules: function () {
                return ratesRules;
            },
            getObservableFields: function () {
                var self = this,
                    observableFields = ['country_id', 'region_id', 'region', 'postcode', 'telephone'];

                $.each(self.getRules(), function (carrier, fields) {
                    $.each(fields, function (field, rules) {
                        if (observableFields.indexOf(field) === -1) {
                            observableFields.push(field);
                        }
                    });
                });

                return observableFields;
            }
        };
    }
);
