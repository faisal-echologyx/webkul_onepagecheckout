/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
define([
    'jquery',
    'ko',
    'uiRegistry',
    'Webkul_OneStepCheckout/js/model/quote',
    'Magento_Checkout/js/model/payment/additional-validators',
    'Webkul_OneStepCheckout/js/model/gst-validator',
    'mage/translate'
], function ($, ko, registry, quote, additionalValidators, gstValidator, $t) {
    'use strict';

    return {
        /**
         * Validate One Step Checkout form
         */
        validate: function () {
            var result = true;
            var isShippingSelected = this.validateShippingRadios(),
                isPaymentSelected  = this.validatePaymentRadios(),
                isInvalidGst  = this.validateGst(),
                isAgreement = this.agreementValidate(),
                isAddressSameAsShipping = $('#billing-address-same-as-shipping-shared').is(':checked');

            if (!quote.quoteVirtual()) {
                registry.get(
                    'checkout.steps.shipping-step.shippingAddress',
                    function (shippingAddress) {
                        if (!shippingAddress.validateShippingInformation()) {
                            result = false;
                        }
                    }
                );
            }

            if (quote.paymentMethod()) {
                registry.get(
                    'checkout.steps.billing-step.payment.payments-list.' + quote.paymentMethod().method,
                    function (payment) {
                        if (!payment.validate() || !additionalValidators.validate()) {
                            result = false;
                        }
                    }
                );
            }

            registry.get(
                'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.gst_number',
                function (gstElement) {
                    if (gstElement.value() == null) {
                        return true;
                    }
                    gstElement.warn(null);
                    if (!gstValidator.validate(gstElement.value())) {
                        var errorMessage = $t('Provided GST number seems to be invalid.');
                        gstElement.error(errorMessage);
                        result = false;
                    }
                }
            );
            registry.get(
                'checkout.steps.billing-step.payment.afterMethods.billing-address-form.form-fields.gst_number',
                function (gstElement) {
                    if (gstElement.value() == null) {
                        return true;
                    }
                    gstElement.warn(null);
                    if (!gstValidator.validate(gstElement.value())) {
                        var errorMessage = $t('Provided GST number seems to be invalid.');
                        gstElement.error(errorMessage);
                        result = false;
                    }
                }
            );
            var isAddressFormVisible = registry.get('checkout.steps.billing-step.payment.afterMethods.billing-address-form').isAddressDetailsVisible();
            if (!isAddressSameAsShipping && !isAddressFormVisible) {
                this.source = registry.get('checkoutProvider');
                this.source.set('params.invalid', false);
                this.source.trigger('billingAddressshared.data.validate');
                if (this.source.get('billingAddressshared.custom_attributes')) {
                    this.source.trigger('billingAddressshared.custom_attributes.data.validate');
                }
                if (this.source.get('params.invalid')) {
                    result = false;
                }

                if (!isShippingSelected || !isPaymentSelected || !isInvalidGst || !isAgreement) {
                    return false;
                }
            }


            return result;
        },

        isElementVisibleInViewport: function (el) {
            var rect = el.getBoundingClientRect(),
                viewport = {
                    width: $(window).width(),
                    height: $(window).height()
                };

            return (
                rect.top  >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= viewport.height &&
                rect.right  <= viewport.width
            );
        },

        /**
         * Scroll to error if it's not visible in viewport
         */
        scrollToError: function () {
            var messages = $('div.mage-error:visible, .onestepcheckout-msg:visible');
            if (!messages.length) {
                return;
            }

            var timeout = 0,
                visibleMessage = messages.toArray().find(this.isElementVisibleInViewport);

            if (!visibleMessage) {
                visibleMessage = messages.first();
                timeout = 200;
                $('html, body').animate({
                    scrollTop: visibleMessage.offset().top - 70
                }, timeout);
            }
            setTimeout(function () {
                $(visibleMessage).addClass('onestepcheckout-shake')
                    .one(
                        'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                        function () {
                            $(this).removeClass('onestepcheckout-shake');
                        }
                    );
            }, timeout);
        },

        /**
         * Check is shipping radio is selected
         */
        validateShippingRadios: function () {
            var el = $('#co-shipping-method-form');
            if (!el.length) {
                return true;
            }

            this.removeNotice(el);
            if (!quote.shippingMethod() || typeof quote.shippingMethod() !== 'object') {
                this.addNotice(el, $t('Please specify a shipping method.'));
                return false;
            }
            return true;
        },

        /**
         * Check is payment radio is selected
         */
        validatePaymentRadios: function () {
            var el = $('#co-payment-form');
            if (!el.length) {
                return true;
            }

            this.removeNotice(el);
            if (!quote.paymentMethod() || typeof quote.paymentMethod() !== 'object') {
                this.addNotice(el, $t('Please specify a payment method.'));
                return false;
            } else {
                this.removeNotice(el);
            }
            //check if wallet system enable
            if (!quote.paymentMethod().method) {
                this.addNotice(el, $t('Please specify a payment method.'));
                return false;
            } else {
                this.removeNotice(el);
            }
            return true;
        },

        /**
         * Check valid GST
         */
        validateGst: function () {
            var el = $('body').find("div[name ='shippingAddress.custom_attributes.gst_number']");
            if (el.length) {
                if (el.hasClass('_error')) {
                    return false;
                }
            }
            return true;
        },

        agreementValidate: function () {
            var self = this;
            var el = $('.opc-block-summary .checkout-agreement');
            var flag = true;
            if (el.length) {
                self.removeAgreementNotice(el);
                el.each(function () {
                    var inp = $(this).find('input');
                    if (inp.length) {
                        if (!inp.prop('checked')) {
                            flag = false;
                            self.addAgreementNotice($(this), $t('Please select agreement.'));
                        }
                    }
                });
            }
            if (!flag) {
                return false;
            } else {
                return true;
            }
        },

        /**
         * Add notice message at the top of the element
         *
         * @param el
         * @param msg
         */
        addNotice: function (el, msg) {
            el.prepend(
                '<div class="onestepcheckout-msg message notice"><span>' +
                    msg +
                '</span></div>'
            );
        },

        gstAddNotice: function (el, msg) {
            el.append(
                '<div class="onestepcheckout-msg message notice"><span>' +
                    msg +
                '</span></div>'
            );
        },

        addAgreementNotice: function (el, msg) {
            el.after(
                '<div class="onestepcheckout-msg message notice"><span>' +
                    msg +
                '</span></div>'
            );
        },

        /**
         * Remove notice label
         *
         * @param  el
         * @return void
         */
        removeNotice: function (el) {
            $('.onestepcheckout-msg', el).remove();
        },

        gstRemoveNotice: function (el) {
            $('.onestepcheckout-msg', el).remove();
        },

        removeAgreementNotice: function (el) {
            $(el).siblings('.onestepcheckout-msg').remove();
        }
    };
});
