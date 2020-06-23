sap.ui.define([
    "dataImport/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/odata/OperationMode",
    "dataImport/model/formatter"
], function (BaseController, jQuery, JSONModel, MessageToast, MessageBox, Dialog, Text, Button, List, StandardListItem, BusyIndicator, ODataModel, OperationMode, formatter) {
    "use strict";
    let oModelSrv = "";
    //let Doc;


    return BaseController.extend("dataImport.controller.Sheds", {

        formatter: formatter,
        /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf ZSF_CMSV_0001.view.Sheds
     */
        onInit: function () {

            this.getRouter().getRoute("select").attachPatternMatched(this._onRouteMatched, this);

        },
        _onRouteMatched: function (oEvent) {

            this.structureModel = this.getModel("structure");
            this.uiModel = this.getModel("ui");
        },
        goToLaunchpad: function () {
            //   var part = window.location.href.split("/"),
            //     prefix = part[2].split(":"),
            //     ip = prefix[0],
            //     port = prefix[1];
            //   var app_r=part[4];
            //   var rout= "http://"+ip+":"+port

            window.location.href = "/Apps/launchpad/webapp";

        },

        selectStructure: function (oEvent) {
            let structure = this.structureModel.getProperty("/selected");

            if (structure != null) {
                this.showButton();
            } else {
                this.hideButton();
            }
        },

        onPressMasterDetail: function (oEvent) {

            this.contenedorSelecter = this.structureModel.getProperty("/selected");
            var that = this;

            if (this.contenedorSelecter == "txposturecurve" || this.contenedorSelecter == "ospartnership") {
                console.log("Three Billboars outside ebbing missouri");
                that.getRouter().navTo("master");
            } else {
                if (this.contenedorSelecter == "osppppartnership") {
                    this.contenedorSelecter = "ospartnership";
                }
                const serverName = "/dataImport/encontramosAlgo";
                // fetch(serverName, {
                //     method: 'POST',
                //     headers: {
                //       'Content-Type': 'application/json'
                //     },
                //     body: JSON.stringify({
                //       contenedorSelecter :this.contenedorSelecter
                //     })
                //   })
                //   .then(function (response) {
                //     console.log(response.status);
                //     if (response.status > 200 && response.status < 400) {
                //       that.getRouter().navTo("master");
                //     }else{
                //       console.log('StarFire');
                //       if (response.status == 401){
                //         MessageToast.show("No se encontro Data de Empresas", {
                //           duration: 2000
                //         });
                //       }else{
                //         if (response.status == 402){
                //           MessageToast.show("No se encontro Data de Grajas", {
                //             duration: 2000
                //           });
                //         }else{
                //           if (response.status == 403){
                //             MessageToast.show("No se encontro Data de Nucleos", {
                //               duration: 2000
                //             });
                //           }else{
                //             if (response.status == 404){
                //               MessageToast.show("No se encontro Data de Almacen", {
                //                 duration: 2000
                //               });
                //             }else{
                //               if (response.status == 405){
                //                 MessageToast.show("No se encontro Data de Galpon", {
                //                   duration: 2000
                //                 });
                //               }else{
                //                 if (response.status == 406){
                //                   MessageToast.show("No se encontro Data de Planta Incubadora", {
                //                     duration: 2000
                //                   });
                //                 }else{
                //                   if (response.status == 407){
                //                     MessageToast.show("No se encontro Data de Maquina Incubadora", {
                //                       duration: 2000
                //                     });
                //                   }
                //                 }
                //               }
                //             }
                //           }
                //         }
                //       }
                //     }
                //   });
                this.getRouter().navTo("master");

            }
        },
        hideButton: function () {
            this.uiModel.setProperty("/continueButton", true);
        },
        showButton: function () {
            this.uiModel.setProperty("/continueButton", false);
        }
    });

});