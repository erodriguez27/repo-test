sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(Controller, MessageToast, MessageBox) {
    "use strict";
    return Controller.extend("userControl.controller.BaseController", {

        getRouter: function() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        getModel: function(sName) {
            return this.getView().getModel(sName);
        },
        setModel: function(oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },
        onNavBack: function(oEvent) {
            //this.getRouter().navTo("sheds", {}, false);
        },
        getI18n: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        onToast: function(message, f) {
            MessageToast.show(message, {
                duration: 1500,
                width: "22em",
                onClose: f
            });
        }
    });
});
