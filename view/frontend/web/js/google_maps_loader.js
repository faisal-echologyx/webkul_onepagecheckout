
//credit: https://github.com/shipperhq/module-address-autocomplete
var google_maps_loaded_def = null;

define(['jquery'],function ($) {
    var enabled = window.checkoutConfig.opc_autocomplete.active;
    if (!google_maps_loaded_def) {
        google_maps_loaded_def = $.Deferred();
        if (enabled == '1') {
            window.google_maps_loaded = function () {
                google_maps_loaded_def.resolve(google.maps);
            }
            var apiKey =  window.checkoutConfig.opc_autocomplete.api_key;
            if (apiKey != 'false' && apiKey !== null) {
                var url = 'https://maps.googleapis.com/maps/api/js?key='+ apiKey +'&libraries=places&callback=google_maps_loaded';
                require([url], function () {}, function (err) {
                    google_maps_loaded_def.reject();
                });
            }
        } else {
            google_maps_loaded_def.reject();
        }

    }
    return google_maps_loaded_def.promise();

});