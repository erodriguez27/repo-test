sap.ui.define([
    "Launchpad/controller/BaseController"
], function(BaseController) {
    "use strict";

    return BaseController.extend("Launchpad.controller.App", {

        onInit: function() {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }

    });
});
