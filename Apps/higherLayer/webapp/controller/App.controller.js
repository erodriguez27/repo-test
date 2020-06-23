sap.ui.define([
    "higherLayer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function (BaseController, JSONModel, Dialog, Button, Text) {
    "use strict";

    return BaseController.extend("higherLayer.controller.App", {
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
                //"serviceUrl": "http://200.35.78.10:8080"
                "local": {
                    "getPartnership": "/partnership",
                    "activeScenario": "/scenario/activeScenario",
                    "findFarmByPartAndStatus": "/farm/findFarmByPartAndStatus/",
                    "findIncPlantByPartnetship": "/incubator_plant/findIncPlantByPartnetship",
                    "calculateIncubator": "/incubator/calculateIncubator",
                    "findBreed": "/breed",
                    "findInventoryByPartnership": "/eggs_storage/findInventoryByPartnership",
                    "findEggsStorageByDateDetail": "/eggs_storage/findEggsStorageByDateDetail",
                    "addprogrammedeggs": "/programmed_eggs",
                    "findProgrammedEggs": "/programmed_eggs/findProgrammedEggs",
                    "programmedeggsdetail": "/programmed_eggs",
                    "deleteProgrammedStorage": "/programmed_eggs"
                },
                "remote": {
                    "addliftBreedingPlanningM": "/liftBreedingPlanningM",
                    "truncateliftBreedingPlanningM": "/liftBreedingPlanningM/truncateliftBreedingPlanningM"
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
            }), "mdincubatorplant");
            this.setModel(new JSONModel({
                "name": {
                    "state": "None",
                    "stateText": ""
                },
                "records": [],
                "programmedSaveDialog": true,
                "enabledTabAssigned": false,
                "enabledTabInvetoryReal": false,
        		"confirmBtn": false,
        		"confirmMore": false
            }), "mdprogrammed");
            this.setModel(new JSONModel({
                "records": [],
                "visibleTable": false,
                "visibleC": false,
                "visibleP": false,
                "visibleH": false,
                "visibleI": false,
                "visibleE": false,
                "available":false,
                "popover": {}
            }), "mdprojected");
            this.setModel(new JSONModel({
                "records": []
            }), "mdbreed");
            this.setModel(new JSONModel({
                "records": [],
                "records2": [],
                "selecterInventartio": [],
                "RecordsReal":[],
                "Setting":[]
            }), "mdinventory");
            this.setModel(new JSONModel({
                "records": [],
                "selectedKey": 1,
                "acumulado": 0
            }), "mdincubator");
            this.setModel(new JSONModel({
                "RecordIngresos": [],
                "Ingresos": [],
                "RecordEgresos": [],
                "Egresos": [],
                "RecordAjustes": [],
                "Ajustes": [],
                "TypeAjustes": [{"name": "Compra de huevos"},{"name": "Venta de huevos"},
                    {"name": "Reclasificación de huevos"},{"name": "Descarte de huevos"},
                    {"name": "Siniestros"},{"name": "Otros"}],
                "ingresosNewBtn":false,
                "EgresosNewBtn":false,
                "AjustesNewBtn":false
            }), "mdegresoIngresoAjustes");
            this.setModel(new JSONModel({
                "records": [],
                "reportsBtn": false,
                "visible": false
            }), "mdreports");
			
            this.setModel(new JSONModel({
                "plantaIncubadora": [],
                "breed": []
            }), "incubatorRealNew");
			
            this.setModel(new JSONModel({
                "state": "None",
                "stateText": "",
                "required": true
            }), "FechaReal");
            this.setModel(new JSONModel({
                "state": "None",
                "stateText": "",
                "required": true
            }), "LoteReal");
            this.setModel(new JSONModel({
                "state": "None",
                "stateText": "",
                "required": true
            }), "EggsReal");
            this.setModel(new JSONModel({
                "isVisibleT": true,
                "isVisibleF": false,
                "isVisibleB": false,
                "isVisibleCylProdEng": false,
                "isVisibleCurve": false,
                "isVisibleBuy": false,
                "isVisibleEgress": false,
                "buttonsSync": true,
                "VisibleS": true,
                "visibleButtonsSync": false,
                "VisibleTable": true
            }), "higherLayer");

        }
    });
});
