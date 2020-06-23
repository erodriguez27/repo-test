sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    var serviceErrorDlg, connectionErrorDlg, weightDetailsDlg, mermaDetailsDlg, durationDetailsDlg;

    return Controller.extend("Mantenimiento-escenarios.controller.BaseController", {

        setFragments : function () {
            serviceErrorDlg = sap.ui.xmlfragment("Mantenimiento-escenarios.view.dialogs.ServiceErrorDialog", this);
            this.getView().addDependent(serviceErrorDlg);

            connectionErrorDlg = sap.ui.xmlfragment("Mantenimiento-escenarios.view.dialogs.ConnectionErrorDialog", this);
            this.getView().addDependent(connectionErrorDlg);

            weightDetailsDlg = sap.ui.xmlfragment("Mantenimiento-escenarios.view.processes.WeightDetailsDialog", this);
            this.getView().addDependent(weightDetailsDlg);

            mermaDetailsDlg = sap.ui.xmlfragment("Mantenimiento-escenarios.view.processes.MermaDetailsDialog", this);
            this.getView().addDependent(mermaDetailsDlg);

            durationDetailsDlg = sap.ui.xmlfragment("Mantenimiento-escenarios.view.processes.DurationDetailsDialog", this);
            this.getView().addDependent(durationDetailsDlg);
        },
        
        _getPopover : function (oEvent) {
            
            console.log("aaaaaaaaaaaaaaaaaaaahhhhhhhhhhhhhhhhhhhh")
            this._oPopover = sap.ui.xmlfragment("Mantenimiento-escenarios.view.goals.capacity", this);
            this.getView().addDependent(this._oPopover);
            this._oPopover.openBy(oEvent.getSource());

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

        onWeightDetailsDialog: function(ev) {
            var processes = this.getView().getModel("processes");
            processes.setProperty("/selectedRecord", JSON.parse(JSON.stringify(ev.getSource().getBindingContext("processes").getObject())));
            console.log(ev.getSource().getBindingContext("processes").getObject());
            weightDetailsDlg.openBy(ev.getSource());
        },

        onCloseWeightDetailsDialog: function() {
            weightDetailsDlg.close();
        },

        onMermaDetailsDialog: function(ev) {
            var processes = this.getView().getModel("processes");
            processes.setProperty("/selectedRecord", JSON.parse(JSON.stringify(ev.getSource().getBindingContext("processes").getObject())));
            console.log(ev.getSource().getBindingContext("processes").getObject());
            mermaDetailsDlg.openBy(ev.getSource());
        },

        onCloseMermaDetailsDialog: function() {
            mermaDetailsDlg.close();
        },

        onDurationDetailsDialog: function(ev) {
            var processes = this.getView().getModel("processes");
            processes.setProperty("/selectedRecord", JSON.parse(JSON.stringify(ev.getSource().getBindingContext("processes").getObject())));
            console.log(ev.getSource().getBindingContext("processes").getObject());
            durationDetailsDlg.openBy(ev.getSource());
        },

        onCloseDurationDetailsDialog: function() {
            durationDetailsDlg.close();
        },


        sendRequest : function (url, method, data, successFunc, srvErrorFunc, connErrorFunc) {
            var util = this.getModel("util");
            //console.log("datos", data);
            var $settings = {
                url: url,
                method: method,
                data: JSON.stringify(data),
                contentType: "application/json",
                error: err => {
                    console.log("error", err);
                    if(err.responseJSON.statusCode===409){
                        // err.json().then((resp) => {
                            util.setProperty("/connectionError/status", err.responseJSON.statusCode);
                            util.setProperty("/connectionError/message", err.responseJSON.msj);
                            util.setProperty("/busy", false);
                        //   });
                    }else{
                        util.setProperty("/connectionError/status", err.status);
                        util.setProperty("/connectionError/message", err.statusText);
                    }
                    this.onConnectionError();
                    if(connErrorFunc) connErrorFunc(err);
                },
                success: res => {
                    //console.log("respuesta", res);
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
        },

    });
}
);
