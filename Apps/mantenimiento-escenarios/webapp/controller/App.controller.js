sap.ui.define([
    "Mantenimiento-escenarios/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("Mantenimiento-escenarios.controller.App", {

        onInit: function() {
	      //Aplica el modo de densidad de contenido a la vista raíz
	      this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());


	      this.setModel(new JSONModel(
	      {
	        "records": []
	      }), "filters");


	      this.setModel(new JSONModel(
	      {
	        "errorValue": [0,10],
	        "warningValue": [10,50],
	        "successValue": [50,100],
	        "topValue": 100,
	        "buttonValue": 0,
	        "middleValueButton": 10,
	        "middleValueTop": 50
	        
	      }), "parameterColors");


	      this.setModel(new JSONModel(
	      {
	        "records": [],
	        "selectRecords": []

	      }), "calendar");

	      this.setModel(new JSONModel(
	      {
	        "records": [],
	        "selectRecords": []

	      }), "mdstage");

	      this.setModel(new JSONModel(
	      {
	        "records": [],
	        "selectRecords": []
	      }), "mdbreed");


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
					
                    "service": "local",
					
                    "urlService": "",

	        "local": {
                        "getScenarioProcesses": "/scenario_proc/getScenariosProcess",
                        "updateScenarioProcesses": "/scenario_proc/updateScenarioProcesses",
                        "findAllScenario":"/scenario/findAllScenario/",
                        "addScenario": "/scenario/addScenario",
                        "updateScenario": "/scenario/updateScenario",
                        "getParameterGoal": "/scenario_param/getParameterGoal",
                        "deleteScenario": "/scenario",
                        "updateStatus": "/scenario/updateStatus",
                        "getCalendarScenarioYears": "/calendar/getCalendarScenarioYears",
                        "fileExport": "/downloadFile/fileExport/",
                        "getMaxDemandEggs": "/scenario_param/getMaxDemandEggs",
                        "syncToERP": "/scenario_param/syncToERP",
                        "isSyncToERP": "/scenario_param/isSyncToERP",
                        "getStages": "/scenario_param/getStages",
                        "getBreeds": "/scenario_param/getBreeds",
                        "getScenarioName":"/scenario/getScenarioName/",
                        "thereGoals": "/scenario_param/thereGoals"
                    },
					
	        "remote": {
	          	"getScenarioProcesses": "http://200.35.78.10:8080/scenario_proc/getScenariosProcess",
	          	"updateScenarioProcesses": "http://200.35.78.10:8080/scenario_proc/updateScenarioProcesses",
                        "findAllScenario":"http://200.35.78.10:8080/scenario/findAllScenario/",
                        "addScenario": "http://200.35.78.10:8080/scenario/addScenario",
                        "getParameterGoal": "http://200.35.78.10:3009/scenario_param/getParameterGoal",
                        "deleteScenario": "http://200.35.78.10:3009/scenario",
                        "updateStatus": "http://200.35.78.10:3009/scenario/updateStatus"
	        }
	      }), "util");

	      this.setModel(new JSONModel(
	      {
                    "updatesScenarios": [],
	        "selectedScenario": {
	        		"scenario_id": 0,
                        "name": ""
	        },
	        "records": [],
	      	"new": true,
                    "delete": false,
                    "scenarioActivate": false,
                    "scenarioDesactivate": false,
                    "edit": false,
                    "setScenario": {
                        "name":"",
                        "id":"",
                        "description":"",
                        "calendar_id":"",
                        "yearBegin": "",
                        "monthBegin": "",
                        "yearEnd": "",
                        "monthEnd": "",
                        "excepcion": ""

                    }
	      }), "scenarios");

	      this.setModel(new JSONModel(
	      {
                    "originalData": [],
                    "data": [],
                    "selectedRecord": {},
                    "changes": [],
                    "editable": false,
                    "edit": false,
                    "save": false,
                    "cancel": false
	      }), "processes");

            this.setModel(new JSONModel(
                {
                    "columns": [],
                    "rows": [],
                    "data": [],
                    "editable": false,
                    "edit": false,
                    "save": false,
                    "cancel": false,
                    "export": false,
                    "export_erp": false,
                    "export2": false,
                    "codeColumns": "",
                    "staticColums": []
                }), "goals");

            this.setModel(new JSONModel(
			  {
                    "years": [
                        {"year": 2016},
                        {"year": 2017},
                        {"year": 2018},
                        {"year": 2019},
                        {"year": 2020},
                        {"year": 2021},
                        {"year": 2022},
                        {"year": 2023},
                        {"year": 2024},
                        {"year": 2025},
                        {"year": 2026},
                        {"year": 2027},
                        {"year": 2028},
                        {"year": 2029},
                        {"year": 2030},
                        {"year": 2031},
                        {"year": 2032},
                        {"year": 2033},
                        {"year": 2034},
                        {"year": 2035},
                        {"year": 2036},
                        {"year": 2037},
                        {"year": 2038},
                        {"year": 2039},
                        {"year": 2040}
	 			 	],

	 			 	"months": [
                        {"key": 1, "name": "Enero"},
                        {"key": 2, "name": "Febrero"},
                        {"key": 3, "name": "Marzo"},
                        {"key": 4, "name": "Abril"},
                        {"key": 5, "name": "Mayo"},
                        {"key": 6, "name": "Junio"},
                        {"key": 7, "name": "Julio"},
                        {"key": 8, "name": "Agosto"},
                        {"key": 9, "name": "Septiembre"},
                        {"key": 10, "name": "Octubre"},
                        {"key": 11, "name": "Noviembre"},
                        {"key": 12, "name": "Diciembre"}
	 			 	]

	 			 	
			 }), "date");

	    }
    });
});
