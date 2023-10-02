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
    [
        'Magento_Checkout/js/model/resource-url-manager',
        'Magento_Checkout/js/model/quote',
        'mage/storage',
        'Webkul_OneStepCheckout/js/model/shipping-service',
        'Magento_Checkout/js/model/shipping-rate-registry',
        'Magento_Checkout/js/model/error-processor',
        'temandoCheckoutFieldsDefinition',
        'Magento_Checkout/js/action/set-shipping-information'
    ],
    function (resourceUrlManager, quote, storage, shippingService, rateRegistry, errorProcessor, fieldsDefinition, setShippingInformationAction) {
        "use strict";
        return {
            getRates: function (address) {
                var cache,
                    cacheKey;

                if (!address.extensionAttributes) {
                    address.extensionAttributes = {};
                }
                if (!address.extensionAttributes.checkoutFields) {
                    address.extensionAttributes.checkoutFields = {};
                }

                _.each(fieldsDefinition.getFields(), function (field) {
                    address.extensionAttributes.checkoutFields[field.id] = {
                        attributeCode: field.id,
                        value: field.value
                    };
                });

                cacheKey = address.getCacheKey().concat(JSON.stringify(address.extensionAttributes));

                shippingService.isLoading(true);
                cache = rateRegistry.get(cacheKey);

                if (cache) {
                    shippingService.setShippingRates(cache);
                    shippingService.isLoading(false);
                    if (quote.shippingMethod()!= null) {
                        setShippingInformationAction();
                    }
                } else {
                    storage.post(
                        resourceUrlManager.getUrlForEstimationShippingMethodsByAddressId(quote),
                        JSON.stringify({
                            addressId: address.customerAddressId,
                            extensionAttributes: address.extensionAttributes || {},
                        }),
                        false
                    ).done(function (result) {
                        rateRegistry.set(cacheKey, result);
                        shippingService.setShippingRates(result);
                        if (quote.shippingMethod()!= null) {
                            setShippingInformationAction();
                        }
                    }).fail(function (response) {
                        shippingService.setShippingRates([]);
                        errorProcessor.process(response);
                    }).always(function () {
                        shippingService.isLoading(false);
                    });
                }
            }
        };
    }
);
