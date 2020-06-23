sap.ui.define([
    "dataImport/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "dataImport/controller/MasterUserAppController",
], function(BaseController, JSONModel,MessageBox,Dialog,Button,Text,MasterUserAppController) {
    "use strict";

    return BaseController.extend("dataImport.controller.App", {
        onInit: function() {
        // var part = window.location.href.split("/"),
            // prefix = part[2].split(":"),
            // ip = prefix[0],
            // port = prefix[1];
            // var app_r=part[4];
            // var rout= "http://"+ip+":"+port
            // console.log("la ruta de carga masiva")
            // console.log(rout);
			   
			   
            /*if(!localStorage.getItem(app_r)){
				  if(!localStorage.getItem("logged")){
					console.log("ENTROOOOOOOOOOOOOOO")
			   
					var inf="No ha iniciado sesion"
					// MessageToast.show("Por faavor Inicie Sesión", {duration:2000})
					var dialog = new Dialog({
					  title: 'Error',
					  type: 'Message',
					  state: 'Error',
					  content: new Text({
						text: inf
					  }),
					  beginButton: new Button({
						text: 'Iniciar Sesion',
						press: function () {
						  window.location.href=rout+"/Apps/userControl/webapp"
						  dialog.close();
						}
					  }),
					  afterClose: function() {
						dialog.destroy();
					  }
					});
			   
					dialog.open();
					
				  }else{
					if(!localStorage.getItem(app_r)){
					  // MessageToast.show("No tiene permiso para acceder a esta aplicacion, será redireccionado al launchpad en 10 segundos", {duration:10000, autoClose: false})
					  var inf="No tiene permiso para acceder a esta aplicación, será redireccionado al launchpad"
					// MessageToast.show("Por faavor Inicie Sesión", {duration:2000})
					var dialog = new Dialog({
					  title: 'Error',
					  type: 'Message',
					  state: 'Error',
					  content: new Text({
						text: inf
					  }),
					  beginButton: new Button({
						text: 'Continuar',
						press: function () {
						  window.location.href=rout+"/Apps/launchpad/webapp"
						  dialog.close();
						}
					  }),
					  afterClose: function() {
						dialog.destroy();
					  }
					});
			   
					dialog.open();
					  // window.location.href=rout+"/Apps/launchpad/webapp"
					}
				  }
				}else{*/
            this.setModel(new JSONModel(
                {
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
                        "housingway" : "/housingway",
                        "findHousingWayDetByHw": "/housingwaydetail/findHousingWayDetByHw",
                        "housingwaydetail": "/housingwaydetail",
                        "activeScenario": "/scenario/activeScenario",
                        "findFarmByPartAndStatus": "/farm/findFarmByPartAndStatus/",
                        "findProcessByStage": "/process/findProcessByStage",
                        "findBreed": "/breed",
                        "findProcessBreedByStage": "/process/findProcessBreedByStage",
                        "findProcessByStageBreed": "/process/findProcessByStageBreed",
                        "findShedsByFarm": "/shed/findShedsByFarm",
                        "deleteHousingWayDetail": "/housingwaydetail"
                    },
                    "remote": {
                        "addliftBreedingPlanningM": "/liftBreedingPlanningM",
                        "truncateliftBreedingPlanningM": "/liftBreedingPlanningM/truncateliftBreedingPlanningM"
                    }
                }), "util");
				
            this.setModel(new JSONModel(
                {
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
				
            this.setModel(new JSONModel(
                {
                    "name": {
                        "state": "None",
                        "stateText": ""
                    },
                    "selectedFarm": 0,
                    "records": [],
                    "rProgrammed":{
                        "enabledTab": false
                    },
                    "programmedsaveBtn": false,
                    "executionSaveBtn": false
                }), "mdprogrammed");

            this.setModel(new JSONModel(
                {
                    "records": [],
                    "projectedSaveBtn": true
                }), "mdprojected");

            this.setModel(new JSONModel(
                {
                    "scenario_id": 0,
                    "name": ""
                }), "mdscenario");

            this.setModel(new JSONModel(
                {
                    "records": [],
                    "selectedKey": ""
                }), "mdfarms");

            this.setModel(new JSONModel(
                {
                    "records": [],
                    "selectedKey": ""
                }), "mdshed");

            this.setModel(new JSONModel(
                {
                    "value": "",
                    "records": []
                }), "mdbreed");
		
            this.setModel(new JSONModel(
                {
                    "records": []
                }), "mdparameter_breed");
						
            this.setModel(new JSONModel(
                {
                    "edit_duration": false,
                    "duration": 0,
                    "edit_decrease": false,
                    "decrease": 0
                }), "mdprocess");
        }
    });

});