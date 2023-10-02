define(
    [
        'ko',
        'uiComponent'
    ],
    function (ko, Component) {
        "use strict";

        return Component.extend({
            defaults: {
                template: 'Webkul_OneStepCheckout/geo-button'
            },
            autoCompleteEnabled: window.checkoutConfig.opc_autocomplete.active === "1" &&
                window.checkoutConfig.opc_autocomplete.use_geolocation === "1"

        });
    }
);