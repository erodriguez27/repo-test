sap.ui.define([
    "dailyMonitor/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
],
function (BaseController, JSONModel, Dialog, Button, Text) {
    "use strict";

    return BaseController.extend("dailyMonitor.controller.App", {
        onInit: function () {
				
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            this.setModel(new JSONModel({
                "busy": true,
                "serviceError": {
                    "status": "",
                    "message": ""
                },
                "connectionError": {
                    "status": "",
                    "message": ""
                },
                "serviceUrl": "",
                "service": "local",
                "local": {
                    "getPartnership": "/partnership",
                    "activeScenario": "/scenario/activeScenario",
                },
                "remote": {}
            }), "util");

            this.setModel(new JSONModel({
                "selectedPartnership": {
                    "partnership_index": 0
                },
                "saldo": 0,
                "records": [],
                "title": "",
                "noDataText": this.getResourceBundle().getText("master.masterListNoDataText"),
                "new": true,
                "delete": false,
                "scenarioActivate": false
            }), "ospartnership");

            this.setModel(new JSONModel({
                "scenario_id": 0,
                "name": ""
            }), "mdscenario");

            this.setModel(new JSONModel({
                "edit_duration": false,
                "duration": 0,
                "edit_decrease": false,
                "decrease": 0
            }), "mdprocess");
        }
    });
});