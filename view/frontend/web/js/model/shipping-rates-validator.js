/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * @api
 */
define([
    'jquery',
    'underscore',
    'ko',
    'Magento_Checkout/js/model/shipping-rates-validation-rules',
    'Magento_Checkout/js/model/address-converter',
    'Magento_Checkout/js/action/select-shipping-address',
    'Magento_Checkout/js/model/postcode-validator',
    'Webkul_OneStepCheckout/js/model/gst-validator',
    'Magento_Checkout/js/model/default-validator',
    'Magento_Checkout/js/model/shipping-rate-service',
    'mage/translate',
    'uiRegistry',
    'Magento_Checkout/js/model/shipping-address/form-popup-state',
    'Magento_Checkout/js/model/quote'
], function (
    $,
    _,
    ko,
    shippingRatesValidationRules,
    addressConverter,
    selectShippingAddress,
    postcodeValidator,
    gstValidator,
    defaultValidator,
    shippingRateService,
    $t,
    uiRegistry,
    formPopUpState
) {
    'use strict';

    var checkoutConfig = window.checkoutConfig,
        validators = [],
        observedElements = [],
        postcodeElements = [],
        postcodeElementName = 'postcode',
        gstNumberElementName = 'gst_number';

    validators.push(defaultValidator);

    return {
        validateAddressTimeout: 0,
        validateZipCodeTimeout: 0,
        validateGSTTimeout: 0,
        validateDelay: 2000,

        /**
         * @param {String} carrier
         * @param {Object} validator
         */
        registerValidator: function (carrier, validator) {
            if (checkoutConfig.activeCarriers.indexOf(carrier) !== -1) {
                validators.push(validator);
            }
        },

        /**
         * @param {Object} address
         * @return {Boolean}
         */
        validateAddressData: function (address) {
            return validators.some(function (validator) {
                return validator.validate(address);
            });
        },

        /**
         * Perform postponed binding for fieldset elements
         *
         * @param {String} formPath
         */
        initFields: function (formPath) {
            var self = this,
                elements = shippingRatesValidationRules.getObservableFields(),
                countryId = $('select[name="country_id"]:visible').val();

            if (_.isEmpty(elements)) {
                elements.push('country_id');
            }
            if ($.inArray(postcodeElementName, elements) === -1) {
                // Add postcode field to observables if not exist for zip code validation support
                elements.push(postcodeElementName);
            }

            if ($.inArray(gstNumberElementName, elements) === -1) {
                // Add postcode field to observables if not exist for zip code validation support
                elements.push(gstNumberElementName);
            }

            $.each(elements, function (index, field) {
                uiRegistry.async(formPath + '.' + field)(self.doElementBinding.bind(self));
            });
        },

        /**
         * Bind shipping rates request to form element
         *
         * @param {Object} element
         * @param {Boolean} force
         * @param {Number} delay
         */
        doElementBinding: function (element, force, delay) {

            var observableFields = shippingRatesValidationRules.getObservableFields();

            if (element && (observableFields.indexOf(element.index) !== -1 || force)) {
                if (element.index !== postcodeElementName) {
                    this.bindHandler(element, delay);
                }
            }

            if (element.index === postcodeElementName) {
                this.bindHandler(element, delay);
                postcodeElements.push(element);
            }
            if (element.index === gstNumberElementName) {
                this.bindHandler(element, delay);
            }
        },

        /**
         * @param {*} elements
         * @param {Boolean} force
         * @param {Number} delay
         */
        bindChangeHandlers: function (elements, force, delay) {
            var self = this;

            $.each(elements, function (index, elem) {
                self.doElementBinding(elem, force, delay);
            });
        },

        /**
         * @param {Object} element
         * @param {Number} delay
         */
        bindHandler: function (element, delay) {

            var self = this;

            delay = typeof delay === 'undefined' ? self.validateDelay : delay;

            if (element.component.indexOf('/group') !== -1) {
                $.each(element.elems(), function (index, elem) {
                    self.bindHandler(elem);
                });
            } else {
                element.on('value', function () {
                    clearTimeout(self.validateZipCodeTimeout);
                    self.validateZipCodeTimeout = setTimeout(function () {
                        if (element.index === postcodeElementName) {
                            self.postcodeValidation(element);
                        } else {
                            $.each(postcodeElements, function (index, elem) {
                                self.postcodeValidation(elem);
                            });
                        }
                    }, delay);

                    clearTimeout(self.validateGSTTimeout);
                    self.validateGSTTimeout = setTimeout(function () {
                        if (element.index === gstNumberElementName) {
                            self.gstValidation(element);
                        }
                    }, delay);

                    if (!formPopUpState.isVisible()) {
                        clearTimeout(self.validateAddressTimeout);
                        self.validateAddressTimeout = setTimeout(function () {
                            self.validateFields();
                        }, delay);
                    }
                });
                observedElements.push(element);
            }
        },

        /**
         * @return {*}
         */
        postcodeValidation: function (postcodeElement) {
            var countryId = $('select[name="country_id"]:visible').val(),
                validationResult,
                warnMessage;

            if (postcodeElement == null || postcodeElement.value() == null) {
                return true;
            }

            postcodeElement.warn(null);
            validationResult = postcodeValidator.validate(postcodeElement.value(), countryId);

            if (!validationResult) {
                warnMessage = $t('Provided Zip/Postal Code seems to be invalid.');

                if (postcodeValidator.validatedPostCodeExample.length) {
                    warnMessage += $t(' Example: ') + postcodeValidator.validatedPostCodeExample.join('; ') + '. ';
                }
                warnMessage += $t('If you believe it is the right one you can ignore this notice.');
                postcodeElement.warn(warnMessage);
            }

            return validationResult;
        },

        gstValidation: function (gstElement) {
            var countryId = $('select[name="country_id"]:visible').val(),
                validationResult,
                warnMessage;

            if (gstElement == null || gstElement.value() == null) {
                return true;
            }
            gstElement.warn(null);

            validationResult = gstValidator.validate(gstElement.value());

            if (!validationResult) {
                warnMessage = $t('Provided GST number seems to be invalid.');
                if (gstValidator.validatedGstCodeExample.length) {
                    warnMessage += $t(' Example: ') + gstValidator.validatedGstCodeExample.join('; ') + '. ';
                }
                gstElement.warn(warnMessage);
            }
            return validationResult;
        },

        /**
         * Convert form data to quote address and validate fields for shipping rates
         */
        validateFields: function () {
            var addressFlat = addressConverter.formDataProviderToFlatData(
                this.collectObservedData(),
                'shippingAddress'
                ),
                address;

            shippingRateService.setReloadRequired(true);

            if (this.validateAddressData(addressFlat)) {
                addressFlat = uiRegistry.get('checkoutProvider').shippingAddress;
                address = addressConverter.formAddressDataToQuoteAddress(addressFlat);
                selectShippingAddress(address);
            }
        },

        /**
         * Collect observed fields data to object
         *
         * @returns {*}
         */
        collectObservedData: function () {
            var observedValues = {};

            $.each(observedElements, function (index, field) {
                observedValues[field.dataScope] = field.value();
            });

            return observedValues;
        }
    };
});
