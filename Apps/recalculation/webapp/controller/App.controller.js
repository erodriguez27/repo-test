sap.ui.define([
    "recalculation/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("recalculation.controller.App", {

        onInit: function() {
	      //Aplica el modo de densidad de contenido a la vista raíz
	      this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

	    }
    });
});
