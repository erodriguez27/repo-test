sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "broilerEviction/model/formatter"
], function (Controller,formatter) {
    "use strict";
    var farmDetailsDlg, groupDetailsDlg, groupDetailsDlg2;

    return Controller.extend("broilerEviction.controller.BaseController", {
        formatter: formatter,

        setFragments : function () {

            farmDetailsDlg = sap.ui.xmlfragment("broilerEviction.view.Popover", this);
            this.getView().addDependent(farmDetailsDlg);

            groupDetailsDlg = sap.ui.xmlfragment("broilerEviction.view.programmed.productDialog", this);
            this.getView().addDependent(groupDetailsDlg);

            groupDetailsDlg2 = sap.ui.xmlfragment("broilerEviction.view.programmed.slaughterhouseDialog", this);
            this.getView().addDependent(groupDetailsDlg2);

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
                    //console.log("error", err);
                    util.setProperty("/connectionError/status", err.status);
                    util.setProperty("/connectionError/message", err.statusText);
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
        handleLinkPress: function(oEvent){

            var mdprogrammed = this.getView().getModel("mdprogrammed");
            mdprogrammed.setProperty("/selectedRecordDialog", JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("mdprogrammed").getObject())));
            let selectObject = oEvent.getSource().getBindingContext("mdprogrammed").getObject();
            console.log("selectObject: ", selectObject);
            mdprogrammed.setProperty("/dataPopover", selectObject.product);
            console.log("modelo modificado");
            console.log(mdprogrammed);
            groupDetailsDlg.openBy(oEvent.getSource());
        },
        handleLinkPress2: function(oEvent){

            var mdprogrammed = this.getView().getModel("mdprogrammed");
            mdprogrammed.setProperty("/selectedRecordDialog", JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("mdprogrammed").getObject())));
				
            console.log("modelo");
            console.log(oEvent.getSource().getBindingContext("mdprogrammed").getObject());



            let selectObject = oEvent.getSource().getBindingContext("mdprogrammed").getObject();
            console.log("selectObject");
            console.log(selectObject);
            console.log("selectObject: ", selectObject);

            var key = selectObject.slaughterhouse_id;
            console.log("cod" + key);


            let vector = mdprogrammed.getProperty("/slaughterhouse");
            console.log("plantas");
            console.log(vector);
				
		        let sal = 0;
		        let i = -1;
		        do
		        {
		          i++;
		          if (key == vector[i].slaughterhouse_id ) 
		            sal = vector[i].name;
		        }while(  key != vector[i].slaughterhouse_id);


		        console.log("nombre planta" + sal);

		        var object = [{"id":key, "name":sal}];


            mdprogrammed.setProperty("/dataPopover", object);
            console.log("modelo modificado");
            console.log(mdprogrammed);
            groupDetailsDlg2.openBy(oEvent.getSource());
        }



    });
}
);
