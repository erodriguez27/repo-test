sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "coldRoom/model/formatter"
], function (Controller,formatter) {
    "use strict";
    var groupDetailsDlg, groupDetailsDlgLot, AdjustmentDialog;

    return Controller.extend("coldRoom.controller.BaseController", {
        formatter: formatter,

        setFragments : function () {
            AdjustmentDialog = sap.ui.xmlfragment("coldRoom.view.AdjustmentPopover", this);
            this.getView().addDependent(AdjustmentDialog);
        },

        getI18n: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        handleLink: function(oEvent){

            var mdinventory = this.getView().getModel("mdinventory");
            let selectObject = oEvent.getSource().getBindingContext("mdinventory").getObject();
            let obj = new Array();
            let arr = selectObject.ajustes;
            arr.forEach(element => {
                obj.push(
                    {
                        date: element.fecha_movements,
                        lot: element.lot,
                        quantity: element.quantity,
                        description_adjustment: element.description_adjustment
                    }
                );
            });
            mdinventory.setProperty("/recordAjuste",[]);
            mdinventory.setProperty("/recordAjuste",obj);
            AdjustmentDialog.openBy(oEvent.getSource());
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
            weightDetailsDlg.openBy(ev.getSource());
        },

        onCloseWeightDetailsDialog: function() {
            weightDetailsDlg.close();
        },

        onMermaDetailsDialog: function(ev) {
            var processes = this.getView().getModel("processes");
            processes.setProperty("/selectedRecord", JSON.parse(JSON.stringify(ev.getSource().getBindingContext("processes").getObject())));
            mermaDetailsDlg.openBy(ev.getSource());
        },

        onCloseMermaDetailsDialog: function() {
            mermaDetailsDlg.close();
        },

        onDurationDetailsDialog: function(ev) {
            var processes = this.getView().getModel("processes");
            processes.setProperty("/selectedRecord", JSON.parse(JSON.stringify(ev.getSource().getBindingContext("processes").getObject())));
            durationDetailsDlg.openBy(ev.getSource());
        },

        onCloseDurationDetailsDialog: function() {
            durationDetailsDlg.close();
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
        },
        handleLinkPress: function(oEvent){

            var mdinventory = this.getView().getModel("mdinventory");
            mdinventory.setProperty("/selectedRecordDialog", JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("mdinventory").getObject())));
            let selectObject = oEvent.getSource().getBindingContext("mdinventory").getObject();

            mdinventory.setSizeLimit(999999);
            mdinventory.setProperty("/dataPopover", selectObject.info_lot);
            groupDetailsDlg.openBy(oEvent.getSource());
        },
        handleLinkPress2: function(oEvent){
            var mdinventory = this.getView().getModel("mdinventory");
            mdinventory.setProperty("/selectedRecordDialogLot", JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("mdinventory").getObject().lot)));
            let selectObject2 = oEvent.getSource().getBindingContext("mdinventory").getObject();

            mdinventory.setSizeLimit(999999);
            mdinventory.setProperty("/dataPopover2", selectObject2.lot);
            groupDetailsDlgLot.openBy(oEvent.getSource());
        }
    });
}
);
