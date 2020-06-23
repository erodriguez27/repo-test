sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "higherLayer/model/formatter"
], function (Controller,formatter) {
    "use strict";
    var groupDetailsDlg, groupDetailsDlgLot;

    return Controller.extend("higherLayer.controller.BaseController", {
        formatter: formatter,

        setFragments : function () {
        },

        getI18n: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onServiceError: function() {
            serviceErrorDlg.open();
        },

        onConnectionError: function() {
            connectionErrorDlg.open();
        },

        onCloseServiceErrorDialog: function() {
            serviceErrorDlg.close();
        },

        onCloseConnectionErrorDialog: function() {
            connectionErrorDlg.close();
        },
        handleItemSelect: function (oEvent) {
            var Oid = oEvent.getSource().getBindingContext("ospartnership").getPath().split("/");
            var id = Oid[2];
            let oView = this.getView().sViewName.split(".")
  
            console.log("cambio de empresa")
            this.getRouter().navTo(oView[3], {
                partnership_id: oEvent.getSource().getBindingContext("ospartnership").getObject().partnership_id,
                id: id
            }, false /*create history*/ );
            this._oPopover.destroy()
          },

      


        sendRequest : function (url, method, data, successFunc, srvErrorFunc, connErrorFunc) {
            var util = this.getModel("util");
            var $settings = {
                url: url,
                method: method,
                data: JSON.stringify(data),
                contentType: "application/json",
                error: err => {
                    util.setProperty("/connectionError/status", err.status);
                    util.setProperty("/connectionError/message", err.statusText);
                    this.onConnectionError();
                    if(connErrorFunc) connErrorFunc(err);

                },
                success: res => {
                    if(res.statusCode !== 200) {
                        util.setProperty("/serviceError/status", res.statusCode);
                        util.setProperty("/serviceError/message", res.msg);
                        this.onServiceError();
                        if(srvErrorFunc) srvErrorFunc(res);
                    } else {
                        successFunc(res);
                    }
                }
            };

            $.ajax($settings);
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

        /**
			 * Convenience method for getting the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
        getResourceBundle : function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
			 * Event handler  for navigating back.
			 * It checks if there is a history entry. If yes, history.go(-1) will happen.
			 * If not, it will replace the current entry of the browser history with the master route.
			 * @public
			 */

			 onNavBack : function() {
            this.getRouter().navTo("home", {}, true /*no history*/);
        },

        onToast: function(message, f) {
            sap.m.MessageToast.show(message, {
                width: "22em",
                duration: 5000,
                closeOnBrowserNavigation: false,
                onClose: f
            });
        }
    });
}
);
