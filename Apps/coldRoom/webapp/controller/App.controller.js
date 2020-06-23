sap.ui.define([
    "coldRoom/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function (BaseController, JSONModel, Dialog, Button, Text) {
    "use strict";

    return BaseController.extend("coldRoom.controller.App", {
        onInit: function () {
            //Aplica el modo de densidad de contenido a la vista raíz
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            this.setModel(new JSONModel({
                "name":"",
                "address": "",
                "selectedRecords": {},
                "records": [],
                "title": this.getResourceBundle().getText("master.TitleCount", [0]),
                "noDataText": this.getResourceBundle().getText("master.masterListNoDataText"),
                "scenarioActivate": false
            }), "ospartnership");

            this.setModel(new JSONModel({
                "scenario_id": 0,
                "name": ""
            }), "mdscenario");

            this.setModel(new JSONModel({
                "records": [],
                "selectedKey": ""
            }), "mdincubatorplant");
            this.setModel(new JSONModel({
                "records": [],
                "selectedKey": ""
            }), "mdbreed");
			
            this.setModel(new JSONModel({
                "records": [],
                "selectRecords": {}
            }), "mdprojected");
			
			
        }
    });
});
