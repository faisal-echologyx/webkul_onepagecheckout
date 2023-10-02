/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
/*jshint browser:true*/
/*global define*/
define(
    [
        'jquery',
        'ko',
        'underscore',
        'Magento_Ui/js/form/form',
        'Magento_Customer/js/model/customer',
        'Magento_Customer/js/model/address-list',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/action/create-billing-address',
        'Magento_Checkout/js/action/select-billing-address',
        'Magento_Checkout/js/checkout-data',
        'Magento_Checkout/js/model/checkout-data-resolver',
        'Magento_Customer/js/customer-data',
        'Magento_Checkout/js/action/set-billing-address',
        'Magento_Ui/js/model/messageList',
        'mage/translate',
        'Magento_Checkout/js/model/billing-address-postcode-validator',
        'Webkul_OneStepCheckout/js/model/gst-validator',
        'Webkul_OneStepCheckout/js/action/get-totals',
        'uiRegistry',
        'mage/translate'
    ],
    function (
        $,
        ko,
        _,
        Component,
        customer,
        addressList,
        quote,
        createBillingAddress,
        selectBillingAddress,
        checkoutData,
        checkoutDataResolver,
        customerData,
        setBillingAddressAction,
        globalMessageList,
        $t,
        billingAddressPostcodeValidator,
        gstValidator,
        collectTotal,
        registry
    ) {
        'use strict';

        var lastSelectedBillingAddress = null,
            newAddressOption = {
                /**
                 * Get new address label
                 * @returns {String}
                 */
                getAddressInline: function () {
                    return $t('New Address');
                },
                customerAddressId: null
            },
            countryData = customerData.get('directory-data'),
            addressOptions = addressList().filter(function (address) {
                return address.getType() == 'customer-address';
            });

        addressOptions.push(newAddressOption);

        return Component.extend({
            defaults: {
                template: 'Webkul_OneStepCheckout/billing-address',
                actionsTemplate: 'Magento_Checkout/billing-address/actions',
                formTemplate: 'Magento_Checkout/billing-address/form',
                detailsTemplate: 'Webkul_OneStepCheckout/billing-address/details',
                links: {
                    isAddressFormVisible: '${$.billingAddressListProvider}:isNewAddressSelected'
                }
            },
            currentBillingAddress: quote.billingAddress,
            customerHasAddresses: addressOptions.length > 0,
            validateGstTimeout: 0,
            validateDelay: 2000,

            /**
             * Init component
             */
            initialize: function () {
                var self = this;
                this._super();
                quote.paymentMethod.subscribe(function () {
                    checkoutDataResolver.resolveBillingAddress();
                }, this);
                billingAddressPostcodeValidator.initFields(this.get('name') + '.form-fields');

                this.initFields(this.get('name') + '.form-fields');

                quote.shippingAddress.subscribe(function (newAddress) {
                    if (self.isAddressSameAsShipping()) {
                        selectBillingAddress(newAddress);
                        if (newAddress.getCacheKey() != quote.shippingAddress().getCacheKey()) {
                            collectTotal();
                        }
                    }
                });
            },

            /**
             * @return {exports.initObservable}
             */
            initObservable: function () {
                this._super()
                    .observe({
                        selectedAddress: null,
                        isAddressDetailsVisible: quote.billingAddress() != null,
                        isAddressFormVisible: !customer.isLoggedIn() || addressOptions.length == 1,
                        isAddressSameAsShipping: false,
                        saveInAddressBook: 1
                    });


                quote.billingAddress.subscribe(function (newAddress) {
                    if (quote.quoteVirtual()) {
                        this.isAddressSameAsShipping(false);
                    } else {
                        this.isAddressSameAsShipping(
                            newAddress != null &&
                            newAddress.getCacheKey() == quote.shippingAddress().getCacheKey()
                        );
                    }

                    if (newAddress != null && newAddress.saveInAddressBook !== undefined) {
                        this.saveInAddressBook(newAddress.saveInAddressBook);
                    } else {
                        this.saveInAddressBook(1);
                    }

                    this.isAddressDetailsVisible(true);

                }, this);

                return this;
            },

            canUseShippingAddress: ko.computed(function () {
                return !quote.quoteVirtual() && quote.shippingAddress() && quote.shippingAddress().canUseForBilling();
            }),

            /**
             * Manage cancel button visibility
             */
            canUseCancelBillingAddress: ko.computed(function () {
                return quote.billingAddress() || lastSelectedBillingAddress;
            }),

            /**
             * @param {Object} address
             * @return {*}
             */
            addressOptionsText: function (address) {
                return address.getAddressInline();
            },

            /**
             * @return {Boolean}
             */
            useShippingAddress: function () {
                if (this.isAddressSameAsShipping()) {
                    selectBillingAddress(quote.shippingAddress());

                    this.updateAddresses();
                    this.isAddressDetailsVisible(true);
                } else {
                    lastSelectedBillingAddress = quote.billingAddress();
                    quote.billingAddress(null);
                    this.isAddressDetailsVisible(false);
                }
                checkoutData.setSelectedBillingAddress(null);

                return true;
            },

            /**
             * Update address action
             */
            updateAddress: function () {
                if (this.selectedAddress() && this.selectedAddress().customerAddressId != newAddressOption.customerAddressId) {
                    selectBillingAddress(this.selectedAddress());
                    checkoutData.setSelectedBillingAddress(this.selectedAddress().getKey());
                } else {
                    this.source.set('params.invalid', false);
                    this.source.trigger(this.dataScopePrefix + '.data.validate');
                    if (this.source.get(this.dataScopePrefix + '.custom_attributes')) {
                        this.source.trigger(this.dataScopePrefix + '.custom_attributes.data.validate');
                    }

                    if (!this.source.get('params.invalid')) {
                        var addressData = this.source.get(this.dataScopePrefix),
                            newBillingAddress;

                        if (customer.isLoggedIn() && !this.customerHasAddresses) {
                            this.saveInAddressBook(1);
                        }

                        addressData['save_in_address_book'] = this.saveInAddressBook() ? 1 : 0;
                        newBillingAddress = createBillingAddress(addressData);
                        // New address must be selected as a billing address
                        selectBillingAddress(newBillingAddress);
                        checkoutData.setSelectedBillingAddress(newBillingAddress.getKey());
                        checkoutData.setNewCustomerBillingAddress(addressData);
                        this.isAddressDetailsVisible(true);

                    }
                }
                this.updateAddresses();
            },

            /**
             * Edit address action
             */
            editAddress: function () {
                lastSelectedBillingAddress = quote.billingAddress();
                quote.billingAddress(null);
                this.isAddressDetailsVisible(false);
            },

            /**
             * Cancel address edit action
             */
            cancelAddressEdit: function () {
                this.restoreBillingAddress();

                if (quote.billingAddress()) {
                    // restore 'Same As Shipping' checkbox state
                    this.isAddressSameAsShipping(
                        quote.billingAddress() != null &&
                            quote.billingAddress().getCacheKey() == quote.shippingAddress().getCacheKey() &&
                            !quote.quoteVirtual()
                    );
                    this.isAddressDetailsVisible(true);
                }
            },

            /**
             * Perform postponed binding for fieldset elements
             */
            initFields: function (fieldsetName) {
                // var fieldsetName = 'checkout.steps.shipping-step.billingAddressshared.billing-address-fieldset';
                registry.async(fieldsetName + '.' + 'gst_number')(this.bindHandler.bind(this));
                return this;
            },

            /**
         * @param {Object} element
         * @param {Number} delay
         */
        bindHandler: function (element, delay) {
            var self = this;

            delay = typeof delay === 'undefined' ? self.validateDelay : delay;

            element.on('value', function () {
                clearTimeout(self.validateGstTimeout);
                self.validateGstTimeout = setTimeout(function () {
                    self.gstValidation(element);
                }, delay);
            });
        },

        /**
         * @param {Object} gstElement
         * @return {*}
         */
        gstValidation: function (gstElement) {
            var validationResult,
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
             * Restore billing address
             */
            restoreBillingAddress: function () {
                if (lastSelectedBillingAddress != null) {
                    selectBillingAddress(lastSelectedBillingAddress);
                }
            },

            /**
             * @param {Object} address
             */
            onAddressChange: function (address) {
                this.isAddressFormVisible(address == newAddressOption);
            },

            /**
             * @param {int} countryId
             * @return {*}
             */
            getCountryName: function (countryId) {
                return countryData()[countryId] != undefined ? countryData()[countryId].name : '';
            },

            /**
             * Trigger action to update shipping and billing addresses
             */
            updateAddresses: function () {
                if (window.checkoutConfig.reloadOnBillingAddress ||
                    !window.checkoutConfig.displayBillingOnPaymentMethod
                ) {
                    setBillingAddressAction(globalMessageList);
                }
            },

            /**
             * Get code
             * @param {Object} parent
             * @returns {String}
             */
            getCode: function (parent) {
                return _.isFunction(parent.getCode) ? parent.getCode() : 'shared';
            },
            /**
             * Get customer attribute label
             *
             * @param {*} attribute
             * @returns {*}
             */
            getCustomAttributeLabel: function (attribute) {
                var resultAttribute;

                if (typeof attribute === 'string') {
                    return attribute;
                }

                if (attribute.label) {
                    return attribute.label;
                }

                if (typeof this.source.get('customAttributes') !== 'undefined') {
                    resultAttribute = _.findWhere(this.source.get('customAttributes')[attribute['attribute_code']], {
                        value: attribute.value
                    });
                }

                return resultAttribute && resultAttribute.label || attribute.value;
            }
        });
    }
);
