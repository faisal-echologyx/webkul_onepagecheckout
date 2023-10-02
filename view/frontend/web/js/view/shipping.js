/*global define*/
define(
    [
        'jquery',
        "underscore",
        'Magento_Checkout/js/view/shipping',
        'ko',
        'Magento_Customer/js/model/customer',
        'Magento_Customer/js/model/address-list',
        'Magento_Checkout/js/model/address-converter',
        'Magento_Checkout/js/model/quote',
        'Magento_Checkout/js/action/create-shipping-address',
        'Magento_Checkout/js/action/select-shipping-address',
        'Magento_Checkout/js/model/shipping-rates-validator',
        'Magento_Checkout/js/model/shipping-address/form-popup-state',
        'Magento_Checkout/js/model/shipping-rate-service',
        'Magento_Checkout/js/model/shipping-service',
        'Magento_Checkout/js/action/select-shipping-method',
        'Magento_Checkout/js/model/shipping-rate-registry',
        'Magento_Checkout/js/action/set-shipping-information',
        'Webkul_OneStepCheckout/js/action/get-totals',
        'Magento_Checkout/js/model/step-navigator',
        'Magento_Ui/js/modal/modal',
        'Magento_Checkout/js/model/checkout-data-resolver',
        'Magento_Checkout/js/checkout-data',
        'uiRegistry',
        'mage/translate',
        'Magento_Catalog/js/price-utils'
    ],
    function (
        $,
        _,
        Component,
        ko,
        customer,
        addressList,
        addressConverter,
        quote,
        createShippingAddress,
        selectShippingAddress,
        shippingRatesValidator,
        formPopUpState,
        shippingRateService,
        shippingService,
        selectShippingMethodAction,
        rateRegistry,
        setShippingInformationAction,
        getTotals,
        stepNavigator,
        modal,
        checkoutDataResolver,
        checkoutData,
        registry,
        $t,
        // gstUpdater,
        priceUtils
    ) {
        'use strict';
        var popUp = null;
        return Component.extend({
            defaults: {
                template: 'Webkul_OneStepCheckout/shipping',
                addressTemplate: 'Webkul_OneStepCheckout/shipping-address'
            },
            visible: ko.observable(!quote.quoteVirtual()),
            shippingSelectd: null,
            totalSellerAmount: ko.observable(0),
            totalBaseSellerAmount: ko.observable(0),
            totalSeller: ko.observable(0),
            totalSelectedSeller: ko.observable(0),
            selectedSellerPickupMethod: ko.observableArray([]),
            totalSellerPickupAmount: ko.observable(0),
            totalBaseSellerPickupAmount: ko.observable(0),
            totalSellerPickup: ko.observable(0),
            totalSelectedSellerPickup: ko.observable(0),
            shippingAutocomplete: null,
            isAmazonPayEnable: window.checkoutConfig.opc_general.amazonPay_enable == '1',

            initialize: function () {
                var self = this;
                this._super();

                stepNavigator.steps.removeAll();

                return true;
            },

            initObservable: function () {
                this._super();

                quote.shippingMethod.subscribe(function (selected) {
                    this.shippingSelectd = selected;
                }, this, 'beforeChange');

                quote.shippingMethod.subscribe(function (newSelected) {
                    var changedMethod = !_.isObject(this.shippingSelectd) ? true : this.shippingSelectd.method_code;
                    var requiredPaymentReload = shippingRateService.getReloadRequired()();
                    if (requiredPaymentReload) {
                        getTotals();
                        shippingRateService.setReloadRequired(false);
                    }
                    if (_.isObject(newSelected) &&
                        (changedMethod !== newSelected.method_code)) {
                            setShippingInformationAction();
                    }

                }, this);

                if (!quote.shippingAddress() && addressList().length >= 1) {
                    selectShippingAddress(addressList()[0]);
                }

                return this;
            },

            navigate: function () {
                //load data from server for shipping step
            },

            /** Save new shipping address */
            saveNewAddress: function () {
                this.source.set('params.invalid', false);
                this.source.trigger('shippingAddress.data.validate');

                if (this.source.get('shippingAddress.custom_attributes')) {
                    this.source.trigger('shippingAddress.custom_attributes.data.validate');
                }
                if (!this.source.get('params.invalid')) {
                    this._super();
                    shippingRateService.setReloadRequired(true);
                    shippingRateService.reEstimateShippingMethods();
                }
            },

            getFormattedPrice: function (price) {
                return priceUtils.formatPrice(price, quote.getPriceFormat());
            }
        });
    }
);
