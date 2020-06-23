sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    return Controller.extend("Launchpad.controller.BaseController", {

        getI18n: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        /**
			 * Convenience method for accessing the router in every controller of the application.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
        getRouter : function () {
            return this.getOwnerComponent().getRouter();
        },

        /**
			 * Convenience method for getting the view model by name in every controller of the application.
			 * @public
			 * @param {string} sName the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
        getModel : function (sName) {
            return this.getView().getModel(sName);
        },

        /**
			 * Convenience method for setting the view model in every controller of the application.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
        setModel : function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        validString: function(string){
            return string !== "" && string !== null && string !== undefined 
        },

        showToast: function(property){
            MessageToast.show(this.getI18n().getText(property), {
                duration: 2000,
                closeOnBrowserNavigation:false
            });
        },
        
        validateInputsDialog: function(oEvent){
            let old = sap.ui.getCore().byId("old"),
                newP = sap.ui.getCore().byId("pass"),
                conf = sap.ui.getCore().byId("pafss"),
                button = sap.ui.getCore().byId("AcceptButton");

                oEvent.getSource().setValueState(this.validString(oEvent.getSource().getValue())?"None":"Error");
                oEvent.getSource().setValueStateText(this.validString(oEvent.getSource().getValue())?"":this.getI18n().getText("BlankField"));

                button.setEnabled(this.validString(old.getValue()) && this.validString(newP.getValue()) && this.validString(conf.getValue()))

        }

        /**
			 * Convenience method for getting the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */

    });
}
);
