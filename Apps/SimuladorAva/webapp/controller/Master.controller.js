sap.ui.define([
    'abaRegressivePlanning/controller/BaseController',
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/m/MessageToast',
    'sap/m/Label',
    'sap/m/Text',
    'sap/m/TextArea',
    'sap/ui/core/mvc/Controller',
    'sap/ui/layout/HorizontalLayout',
    'sap/ui/layout/VerticalLayout',
    "sap/ui/model/json/JSONModel",
    'sap/ui/core/Fragment',
    "abaRegressivePlanning/controller/MasterUserAppController"
], function (BaseController, Button, Dialog,MessageToast, Label, Text, TextArea, Controller, HorizontalLayout, VerticalLayout, JSONModel, Fragment, MasterUserAppController) {
    'use strict';

    return BaseController.extend('abaRegressivePlanning.controller.Master', {
        /**
         * Function to be fired when the controller is initialized
         */
        onInit: async function () {
            let that = this;

            await $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/scenario/findAllScenario",
                dataType: "json",
                async: true,
                success: function (data) {
                    let dataModel = that.getView().getModel("data");
                    dataModel.setProperty("/scenarios", data.data);
                    
                },
                error: function (request, status, error) {
                    console.log("Error al consultar escenarios");
                    that.onToast("Error al consultar escenarios");
                }
            });
            
            //borra los registros OSPARTNERSHIP que estén almacenados actualmente
            var settings = {
                contentType: "application/json",
                dataType: "json",
                url: "/ave_simulator/findParameter",
                method: "GET",
                async: true,
                success: function(res) {
                    that.getView().getModel('data').setProperty("/postureRecords", res.breed);
                    that.getView().getModel('data').setProperty("/breedTrue",res.parameterActive)
                },
                error: function(err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
  
                }
            };
            await $.ajax(settings);
            if(this.getView().getModel('data').getProperty("/breedTrue").length==0){
                var dialog = new Dialog({
                    title: "Aviso",
                    type: "Message",
                    content: new sap.m.Text({
                        text: "No existen parámetros cargados, se redireccionará a la creación de parámetros"
                    }),
                    beginButton: new Button({
                        text: "Ok",
                        press: function () {
                            window.location.href = "/Apps/technicalConfiguration/webapp/#/entity/optimizer";
                            that.dialog.close();
                        }.bind(that)
                    }),
                    afterClose: function () {
                        //todo
                    }
                }
                );
                this.getView().addDependent(dialog);
                dialog.open();
            }
            
            this.getRouter().getRoute('master')
                .attachPatternMatched(this._onMasterMatched, this);
        },
        dialog: null,
        /**
         * Function to be fired when the route 'master' is matched
         * @param {Object} oEvent event with the searchbox
         */
        _onMasterMatched: function (oEvent) {
            console.log('on master matched')
        },
        onSelectionChange: async function (oEvent) {
            let that = this
            let Strue = this.getModel('data').getProperty("/semaforo");
            if(Strue){
                this.getModel('data').setProperty("/menuGeneral", false);
                let object = oEvent.getParameters().listItem.getBindingContext('data').getObject();
                this.getModel('data').setProperty("/idSelected", object);
                var filter6 = sap.ui.getCore().byId("__component0---detail--comboCosto")
                var filter7 = sap.ui.getCore().byId("__component0---detail--comboalojamiento")
                var filter4 = sap.ui.getCore().byId("__component0---detail--comboName")
                var filter5 = sap.ui.getCore().byId("__component0---detail--DP1")
                var filter1 = sap.ui.getCore().byId("__component0---detail--DP2")
                var filter2 = sap.ui.getCore().byId("__component0---detail--DP3")
                var filter3 = sap.ui.getCore().byId("__component0---detail--comboLote")
                
                filter4.setSelectedKey([]);
                filter3.setSelectedKey([]);
                filter5.setDateValue(null);
                filter2.setDateValue(null);
                filter1.setDateValue(null);
                var aFilter = [];
                var oList = sap.ui.getCore().byId("__component0---detail--TreeTableBasic");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilter);
                
            }
        },
        
        showPopOver: function (oEvent) {
            //coloco en el popUp el valor correspondiente, deberia de estar en stats
            let stats = this.getModel('data').getProperty("/stats");
            let actualScenarioName = oEvent.oSource.mProperties.text;
            //busco en stats a con nombre igual al anterior
            let toShow = stats.filter(data => data.scenario == actualScenarioName);
            this.getModel('data').setProperty("/popOverData/scenarioName",
                                                actualScenarioName);
            this.getModel('data').setProperty("/popOverData/criaYLevante",
                                    toShow[0].text + ": " + toShow[0].quantity);
            this.getModel('data').setProperty("/popOverData/engorde",
                toShow[1].text + ": " + toShow[1].quantity);
            // create popover
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("abaRegressivePlanning.view.Popover", this);
                this.getView().addDependent(this._oPopover);
            }
            this._oPopover.openBy(oEvent.getSource());
        }
    });
}, /* bExport= */ true);
