define(
    [
        'underscore',
        'Webkul_OneStepCheckout/js/model/quote',
        'Webkul_OneStepCheckout/js/model/resource-url-manager',
        'Webkul_OneStepCheckout/js/model/shipping-rate-service',
        'Webkul_OneStepCheckout/js/model/payment-loader',
        'Magento_Checkout/js/model/error-processor',
        'Magento_Customer/js/model/customer',
        'Magento_Customer/js/customer-data',
        'Magento_Checkout/js/model/totals',
        'mage/storage',
        'Magento_Checkout/js/model/payment/method-converter',
        'Magento_Checkout/js/model/payment-service',
        'Magento_Checkout/js/model/shipping-service'
    ], function (
        _,
        quote,
        resourceUrlManager,
        shippingRateService,
        paymentLoader,
        errorProcessor,
        customer,
        customerData,
        totals,
        storage,
        methodConverter,
        paymentService,
        shippingService
    ) {
    'use strict';

    function startLoader() {
        totals.isLoading(true);
        shippingService.isLoading(true);
        paymentLoader.isLoading(true);
    };
    function stopLoader() {
        totals.isLoading(false);
        shippingService.isLoading(false);
        paymentLoader.isLoading(false);
    };

    return function (cartData) {
        var payload = cartData,
        url = resourceUrlManager.getUrlForUpdateCartItem(quote);

        if (!customer.isLoggedIn()) {
            payload.cart_id = quote.getQuoteId();
        }
        startLoader();
        return storage.post(
            resourceUrlManager.getUrlForUpdateCartItem(quote),
            JSON.stringify(payload)
        ).done(function (response) {
            if (_.isEmpty(response.totals.items)) {
                location.reload();
            }
            if (!quote.isVirtual() && response.shipping_methods.length) {
                shippingService.setShippingRates(response.shipping_methods);
            }
            quote.setTotals(response.totals);
            paymentService.setPaymentMethods(methodConverter(response.payment_methods));
            customerData.reload(['cart'], true);
            quote.setIsVirtual(response.is_virtual);
        }).fail(function (response) {
            stopLoader();
            errorProcessor.process(response);
        }).error(function (response) {
            stopLoader();
            errorProcessor.process(response);
        }).always(function () {
            stopLoader();
        });

    }
});