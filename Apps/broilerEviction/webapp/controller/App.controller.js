sap.ui.define([
    "broilerEviction/controller/BaseController", 
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function(BaseController, JSONModel, Dialog, Button, Text) {
    "use strict";

    return BaseController.extend("broilerEviction.controller.App", {

        onInit: function () {
            //Aplica el modo de densidad de contenido a la vista raíz 
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
                //"serviceUrl": "http://200.35.78.10:8080"
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
                    "findbroilerdetail": "/broilerdetail/findbroilerdetail"
                },
                "remote": {
                    "addbroilerEviction": "/broilerEviction",
                    "truncatebroilerEviction": "/broilerEviction/truncatebroilerEviction"
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
                "shedEviction": false,
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
                "programmedsaveBtn": false,
                "executionSaveBtn": false,
                "confirmBtn": false,
                "addBtn": false
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
                "shed_id": "",
                "records": [],
                "projectedSaveBtn": true,
                "visibleOtherButtons":false,
                "age": {
                    "state": "None",
                    "stateText": ""
                },
                "age2": {
                    "state": "None",
                    "stateText": ""
                },
                "age_date": {
                    "state": "None",
                    "stateText": "",
                    "visibleOtherButtons": false
                },
                "breed":{
                    "state": "None",
                    "stateText": ""
                }
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
