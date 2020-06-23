sap.ui.define([
    "jquery.sap.global",
    "annualPostureCurve/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/m/MessageBox",
    "annualPostureCurve/controller/MasterUserAppController",
    "sap/ui/core/Fragment"
], function (jQuery, BaseController, MessageToast, Dialog, Button, Text, Export, ExportTypeCSV, MessageBox,MasterUserAppController, Fragment) {
    "use strict";

    return BaseController.extend("annualPostureCurve.controller.Main", {
        onInit: function () {
            var oList = this.getView().byId("__list0");
            this._oList = oList;
            this._oListFilterState = {
                aFilter: [],
                aSearch: []
            };
            this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);

     
        },
        _onRouteMatched: async function() {
            let isBreedLoad = await this.onBreedLoad();
            this.onRead();
     
        },
        onRead: function () {   //Esta funci�n la vamos a llevar completa a reproductora
            let posturecurve = this.getView().getModel("posturecurve"),
                util = this.getModel("util"),
                year = this.getView().byId("yearSelect").mProperties.selectedKey,
                serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/lotPostureCurve");
            util.setProperty("/busy/", true);
            let breed_id = this.getView().byId("breedSelect").mProperties.selectedKey;
            let params = {
                year: year
            };

            fetch(serviceUrl, {
                method: "POST",
                body: "year="+year+"&breed_id="+breed_id,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                }
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                        response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            util.setProperty("/busy/", false);
                            /* guardamos cantidad proyectada para cada semana
                          guardar numero sem, raza, total eject:0, lote, idparnetship */
                            posturecurve.setProperty("/week/", res.data);
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error: ", err);
                });

        },
        onSave: function(){
            let posturecurve = this.getModel("posturecurve"),
                util = this.getModel("util"),
                that = this,
                serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/lotEggs");
            $.ajax({
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({
                    "changes": posturecurve.getProperty("/week")
                }),
                url: serviceUrl,
                dataType: "json",
                async: true,
                success: function(data) {
                    util.setProperty("/busy/", false);
                    that.onToast("Registro Guardado con exito");
                },
                error: function(err) {
                    that.onToast("Error: "+err);
                    console.log("Read failed"+ err);
                }
            });

        },
        onBreedLoad: function() {
            const util = this.getModel("util"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBreed");

            let mdbreed = this.getModel("mdbreed"),
                that = this;
            mdbreed.setProperty("/records", []);

            let isRecords = new Promise((resolve, reject) => {
                fetch(serverName)
                    .then(
                        function(response) {
                            if (response.status !== 200) {

                                console.log("Looks like there was a problem. Status Code: " +
                      response.status);
                                return;
                            }
                            // Examine the text in the response
                            response.json().then(function(data) {
                                resolve(data);
                            });
                        }
                    )
                    .catch(function(err) {
                        console.log("Fetch Error :-S", err);
                    });
            });


            isRecords.then((res) => {
                if (res.data.length > 0) {
                    mdbreed.setProperty("/records", res.data);
                    mdbreed.setProperty("/value", mdbreed.getProperty("/records/0/breed_id"));
                    that.onRead();
                }
            });
        },
        goToLaunchpad: function () {
            window.location.href =  "/Apps/launchpad/webapp";
        },
        onViewCurve: function(oEvent) {
            let lot=oEvent.getParameters().listItem.mAggregations.cells[1].mProperties.text;
            let eggs=oEvent.getParameters().listItem.mAggregations.cells[2].mProperties.number.replace(".", "");
            let eggsForDay=parseInt(eggs/7,10);
 

            let report = new Array();
            for (let i = 1; i <= 7; i++) {
                report.push({
                    day:i,
                    lot:lot,
                    eggsForDay:eggsForDay 
                });
                this.getView().getModel("posturecurve").setProperty("/day",report);
            }

            var oPage = this.getView().byId("scenarioTab");
            var oFormFragment = sap.ui.xmlfragment("annualPostureCurve.view.postureCurve.PostureCurveTable2",this);
            oPage.removeAllContent();
            oPage.insertContent(oFormFragment);
        } ,

        onViewCurve2: function(oEvent) {
            let lot=oEvent.getParameters().listItem.mAggregations.cells[1].mProperties.text;
            let eggs=oEvent.getParameters().listItem.mAggregations.cells[2].mProperties.number.replace(".", "");
            let eggsForDay=0;
            let report = new Array();
            for (let i = 1; i <= 7; i++) {
                report.push({
                    day:i,
                    lot:lot,
                    eggsForDay:eggsForDay 
                });
                this.getView().getModel("posturecurve").setProperty("/day",report);
            }

            var oPage = this.getView().byId("scenarioTabReal");
            var oFormFragment = sap.ui.xmlfragment("annualPostureCurve.view.postureCurve.PostureCurveTableReal2",this);
            oPage.removeAllContent();
            oPage.insertContent(oFormFragment);
        },



        AddonPress:function() {

            let report = this.getModel("posturecurve").getProperty("/real");
            report.push( {				eggs:"0"  
            });	
            this.getView().getModel("posturecurve").setProperty("/real",report);

        },
        ReturnToCurve: function(oEvent) {
            var oPage2 = this.getView().byId("tabBar");
            var oFormFragment2 = sap.ui.xmlfragment("annualPostureCurve.view.postureCurve.postureCurveTable",this);
            window.location.reload();
        }

    });

});
