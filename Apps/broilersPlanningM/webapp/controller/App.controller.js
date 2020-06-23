sap.ui.define([
    "broilersPlanningM/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function(BaseController, JSONModel, Dialog, Button, Text) {
    "use strict";

    return BaseController.extend("broilersPlanningM.controller.App", {

        onInit: function () {
            //Aplica el modo de densidad de contenido a la vista raíz
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());


            this.setModel(new JSONModel({
                "busy": false,
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
                    "findHousingByStage": "/housingway/findHousingByStage",
                    "housingway": "/housingway",
                    "findHousingWayDetByHw": "/housingwaydetail/findHousingWayDetByHw",
                    "housingwaydetail": "/housingwaydetail",
                    "activeScenario": "/scenario/activeScenario",
                    "findFarmByPartAndStatus": "/farm/findFarmByPartAndStatus/",
                    "findProcessByStage": "/process/findProcessByStage",
                    "findProcessBreedByStage": "/process/findProcessBreedByStage",
                    "findShedsByFarm": "/shed/findShedsByFarm",
                    "findBreed": "/breed",
                    "findprojectedbroiler": "/broiler/findprojectedbroiler",
                    "findBroilerLot": "/broiler/findBroilerLot",
                    "addbroilerdetail": "/broilerdetail",
                    "findbroilerdetail": "/broilerdetail/findbroilerdetail",
                    "deleteBroilerDetail": "/broilerdetail"
                },
                "remote": {
                    "addbroilersPlanningM": "/broilersPlanningM",
                    "truncatebroilersPlanningM": "/broilersPlanningM/truncatebroilersPlanningM"
                }
            }), "util");

            this.setModel(new JSONModel({
                "selectedPartnership": {
                    "partnership_index": 0
                },
                "saldo": 0,

                "records": [],
                "title": this.getResourceBundle().getText("master.TitleCount", [0]),
                "noDataText": this.getResourceBundle().getText("master.masterListNoDataText"),
                "new": true,
                "delete": false,
                "scenarioActivate": false
            }), "ospartnership");

            this.setModel(new JSONModel({
                "name": {
                    "state": "None",
                    "stateText": ""
                },
                "selectedFarm": 0,
                "records": [],
                "rProgrammed": {
                    "enabledTab": false
                },
                "product": {
                    "records": [],
                    "selectedKey": 0
                },
                "lotselected":{
                    "date":null
                },
                "programmedsaveBtn": false,
                "executionSaveBtn": false,
                "confirmBtn": false,
                "addBtn": false,
                "assigned": []
            }), "mdprogrammed");

            this.setModel(new JSONModel({
                "name": {
                    "state": "None",
                    "stateText": ""
                },
                "selectedFarm": 0,
                "records": [],
                "rExecuted": {
                    "enabledTab": false
                },
                "programmedsaveBtn": false,
                "executionSaveBtn": false,
                "saveBtn": false,
                "confirmBtn": false
            }), "mdexecuted");

            this.setModel(new JSONModel({
                "records": [],
                "projectedSaveBtn": true,
                "visibleOtherButtons": false
            }), "mdprojected");

            this.setModel(new JSONModel({
                "scenario_id": 0,
                "name": ""
            }), "mdscenario");

            this.setModel(new JSONModel({
                "records": [],
                "selectedKey": ""
            }), "mdfarms");

            this.setModel(new JSONModel({
                "records": [],
                "selectedKey": ""
            }), "mdcenter");

            this.setModel(new JSONModel({
                "records": [],
                "selectedKey": ""
            }), "mdcores");

            this.setModel(new JSONModel({
                "records": [],
                "selectedKey": ""
            }), "mdshed");
            this.setModel(new JSONModel({
                "value": "",
                "records": []
            }), "mdbreed");

            this.setModel(new JSONModel({
                "edit_duration": false,
                "duration": 0,
                "edit_decrease": false,
                "decrease": 0
            }), "mdprocess");

            this.setModel(new JSONModel({
                "records": [],
                "reportsBtn": false,
                "visible": false
            }), "mdreports");
				
        }

    });
});
