sap.ui.define([
    "userControl/controller/BaseController"
], function(BaseController) {
    "use strict";

    return BaseController.extend("userControl.controller.App", {
  
        onInit: function() {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            
        }
    
    });
});
