define([
    'mageUtils'
], function (utils) {
    'use strict';

    return {
        validatedGstCodeExample: [],

        /**
         * @param {*} postCode
         * @param {*} countryId
         * @param {Array} postCodesPatterns
         * @return {Boolean}
         */
        validate: function (gstNumber) {
            var  regex = new RegExp('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');
            this.validatedGstCodeExample = [];
            if (!utils.isEmpty(gstNumber) ) {

                if (regex.test(gstNumber)) {
                    return true;
                }
                this.validatedGstCodeExample.push('22AAAAA0000A1Z5');
                return false;
            }
            return true;
        }
    };
});