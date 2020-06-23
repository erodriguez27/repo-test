sap.ui.define([
    "Mantenimiento-escenarios/controller/BaseController",
    "Mantenimiento-escenarios/model/formatter",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/model/Filter",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "Mantenimiento-escenarios/controller/MasterUserAppController",
    "sap/ui/core/Item"
], function (BaseController, formatter, MessageToast, Dialog, Button, Text, Filter, Export, ExportTypeCSV, MasterUserAppController, Item) {
    "use strict";

    return BaseController.extend("Mantenimiento-escenarios.controller.Main", {
        formatter: formatter,
        onInit: function () {
            this.setFragments();

            this.getRouter().getRoute("home").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function () {
            console.log(this)

            let dummy = this.getView().getModel("dummy"),
                util = this.getView().getModel("util"),
                that = this


            this.dialogNewScenario = sap.ui.xmlfragment("Mantenimiento-escenarios.view.dialogs.newScenarioDialog", this);
            this.dialogGoals = sap.ui.xmlfragment("Mantenimiento-escenarios.view.dialogs.Dialog", this);
            //force brutality
            let prefixUrl = document.URL.split("/");
            let aprefixUrl = prefixUrl[2].split(":");

            // dummy.setProperty("/urlService", "http://"+aprefixUrl[0]+":"+aprefixUrl[1]);
            dummy.setProperty("/urlService", "");
            // util.setProperty("/urlService", "http://"+aprefixUrl[0]+":"+aprefixUrl[1]);
            util.setProperty("/urlService", "");
            // console.log(util);
            that.onScenario();
            that.enabledTab(false);

            dummy.attachRequestCompleted(function () {

                let prefixUrl = document.URL.split("/");
                let aprefixUrl = prefixUrl[2].split(":");

                // dummy.setProperty("/urlService", "http://"+aprefixUrl[0]+":"+aprefixUrl[1]);
                // util.setProperty("/urlService", "http://"+aprefixUrl[0]+":"+aprefixUrl[1]);
                dummy.setProperty("/urlService", "");
                util.setProperty("/urlService", "");
                console.log(util);
                that.onScenario();
                that.enabledTab(false);
            });


            var sStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
            // sStorage.put("key", "nonono");
            let aja = sStorage.get("key");

            console.log(aja)
            if (aja.aja === "ok") {
                let scenarios = this.getView().getModel("scenarios");
                scenarios.setProperty("/selectedScenario/scenario_id/", aja.scenario.scenario_id);
                scenarios.setProperty("/selectedScenario/name/", aja.scenario.name);

                scenarios.setProperty("/scenarioActivate", false);
                scenarios.setProperty("/scenarioDesactivate", true);
                this.enabledTab(true);

                scenarios.setProperty("/delete/", true);
                scenarios.setProperty("/edit/", true);
                this.showStatusMaintenance();
                console.log( this.getView().byId("tabBar"))
                this.getView().byId("tabBar").setSelectedKey("__component0---mainView--scenarioEstimationTab")
                this.getView().byId("tabBar").fireSelect()

                // this.onTabSelection(this.getView().byId("tabBar").setSelectedKey("__component0---mainView--scenarioEstimationTab"))
                sStorage.put("key", "nonono");
            }else{
                sStorage.put("key", "nonono");
            }

        },
        enabledTab: function (enab) {
           
            let scenario = this.getModel("scenarios");
            this.getView().byId("scenarioProcessesTab").setEnabled(enab);
            this.getView().byId("scenarioEstimationTab").setEnabled(enab);
            //this.getView().byId("scenarioEstimationTab2").setEnabled(enab);
            if (enab) {
                this.activeGoalsTab();
            }
            else {
                this.getView().byId("goalsTab").setEnabled(false);
            }

        },
        onTabSelection: function (ev) {
            console.log(ev)
            var selectedKey = ev.getSource().getSelectedKey();
            var viewId = this.getView().getId() + "--";
            let mdbreed = this.getView().getModel("mdbreed"),
                mdstage = this.getView().getModel("mdstage")
            console.log(selectedKey)
            console.log(sap.ui.getCore().byId("filterBreed").getSelected())
            this.resetFilterItems()
            sap.ui.getCore().byId("filterBreed").setSelected(false);
            if (sap.ui.getCore().byId("filterProcess") !== undefined && sap.ui.getCore().byId("filterBreed") !== undefined) {
                sap.ui.getCore().byId("filterProcess").setSelected(false);

            }


            console.log("Aqui estoy ", mdbreed, mdstage)
            if (selectedKey === viewId + "scenarioTab") {
                this.newScenariosButtons();
                this.hideProcessesButtons();
                this.hideBudgetButtons();
                this.hideGoalsButtons();
                this.onScenario();
                // console.log("escenario");
            }

            if (selectedKey === viewId + "scenarioProcessesTab") {
                this.hideScenariosButtons();
                this.hideBudgetButtons();
                this.hideGoalsButtons();
                this.onProcesses();
                // console.log('procesos');
            }

            if (selectedKey === viewId + "scenarioEstimationTab") {
                this.hideScenariosButtons();
                this.newBudgetButtons();
                this.hideProcessesButtons();
                this.hideGoalsButtons();
                this.onBudget();
                // console.log("presupuesto");
            }
            /*
            if (selectedKey === viewId + "scenarioEstimationTab2") {
                this.hideScenariosButtons();
                this.newBudgetButtons();
                this.hideProcessesButtons();
                this.hideGoalsButtons();
                this.onBudgetIn();
                console.log("presupuesto 2");
            }*/

            if (selectedKey === viewId + "goalsTab") {
                this.newGoalsButtons();
                this.hideScenariosButtons();
                this.hideProcessesButtons();
                this.hideBudgetButtons();
                //console.log(this.getView().byId("goalsTable"));
                this.preloadStage();
                this.preloadBreed();

                let mdstage = this.getModel("mdstage");
                let mdbreed = this.getModel("mdbreed");

                mdstage.setProperty("/selectRecords", []);
                mdbreed.setProperty("/selectRecords", []);

                this.onGoals();
                //this.verifySynchronization();
            }
        },
        // verifySynchronization: function () {
        //     var util = this.getModel("util");
        //     var goals = this.getModel("goals");
        //     var scenarios = this.getModel("scenarios");

        //     console.log(goals.getProperty("/data_to_erp"));
        //     // var serverName = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/isSyncToERP");
        //     var serverName = "/scenario_param/isSyncToERP";

        //     fetch(serverName, {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify({
        //             scenario_id: scenarios.getProperty("/selectedScenario/scenario_id")
        //         })
        //     }).then(
        //         function (response) {
        //             if (response.status !== 200) {
        //                 console.log("Looks like there was a problem. Status Code: " +
        //                     response.status);
        //                 return;
        //             }

        //             response.json().then(function (res) {
        //                 console.log("res: ", res);
        //                 res.results.length > 0 ? goals.setProperty("/export_erp", false) : goals.setProperty("/export_erp", true);
        //             });
        //         }
        //     ).catch(function (err) {
        //         console.log("Fetch Error :-S", err);
        //     });
        // },


        preloadStage: function () {
            let mdstage = this.getModel("mdstage");
            let util = this.getModel("util");

            // const serverName = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/getStages");
            const serverName = "/scenario_param/getStages";

            fetch(serverName, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            })
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                            return;
                        }
                        response.json().then(function (res) {
                            // console.log(res.data);
                            mdstage.setProperty("/records", res.data);
                            mdstage.refresh();
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        preloadBreed: function () {
            let mdstage = this.getModel("mdbreed");
            let util = this.getModel("util");


            // const serverName = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/getBreeds");
            const serverName = "/scenario_param/getBreeds";

            fetch(serverName, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },

            })
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                            return;
                        }
                        response.json().then(function (res) {
                            // console.log(res.data);
                            mdstage.setProperty("/records", res.data);
                            mdstage.refresh();
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },
        onGoals: function () {
            // console.log('GOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOL! ');
            var util = this.getModel("util");
            var goals = this.getModel("goals");
            var dummy = this.getModel("dummy");
            var processes = this.getModel("processes");
            util.setProperty("/busy", true);

            var merma = 0;
            processes.getData().data.forEach((elem) => {
                if (elem.product_id == 4) {
                    merma = parseFloat(elem.decrease_goal) / 100;
                }
            });

            var that = this;
            let maxEggDemand = 0;
            this.getView().byId("goalsTable").onAfterRendering = function () {

                var tbl = this;
                tbl.selectedCell = null;
                var columns = this.getColumns().pop();
                // var lastProduct = goals.getProperty(columns.getBindingContext('goals').getPath());
                var $parentProduct = columns.getAggregation("header").$().parent();
                var items = this.getItems();

                let currParameter = 0;
                let flag = true;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var path = item.getBindingContext("goals").getPath();
                    var cells = item.getAggregation("cells");
                    tbl.numCells = cells.length;

                    for (var j = 0; j < cells.length; j++) {
                        var cell = cells[j];
                        var $cell = cell.$();

                        $cell.attr("path", path);
                        var $parent = $cell.parent();

                        $parent.css("cursor", "pointer");
                        $parent.css("background-color", (j == 0) ? "#f7f7f7" : "#ffffff");
                        // $parent.css('border-bottom', '#f5f5f5');

                        if ($cell.context !== undefined) {
                            let colIndex = $cell.context.parentNode.cellIndex;
                            let field = goals.getProperty("/rows/" + ($cell.context.parentNode.parentNode.rowIndex - 1) + "/values/" + (colIndex));
                        }


                        // $parent.click(function(event) {
                        //     var $o = $(this).find("span");
                        //     var column = event.currentTarget["cellIndex"];
                        //     var obj = goals.getProperty( "/rows/" + (event.currentTarget.parentNode.rowIndex - 1) + "/values/" + (column) );
                        //     // obtener el numero total de columnas
                        //     tbl.selectedCell = $o;
                        //     if(obj.value !== "" && !isNaN(obj.value) && obj.state !== "None") {
                        //         dummy.setProperty("/cellSelected", obj);
                        //         dummy.setProperty("/dataPopover", []);
                        //         dummy.getProperty("/dataPopover").push({
                        //             "text": "Meta",
                        //             "value": obj.value.toLocaleString(),
                        //             "state": "None"
                        //         });
                        //         dummy.getProperty("/dataPopover").push({
                        //             "text": "Capacidad",
                        //             "value": obj.capacity.toLocaleString(),
                        //             "state": "None"
                        //         });
                        //         dummy.getProperty("/dataPopover").push({
                        //             "text": "Saldo",
                        //             "value": obj.residue.toLocaleString(),
                        //             "state": obj.state
                        //         });
                        //         dummy.refresh();
                        //         var domRef = $o;
                        //   			that._getPopover().openBy(domRef);
                        //     }
                        // });
                    }
                }
            };

console.log("aqui toy")
            //this.getMaxDailyDemandEggs()
                // .then(data => {
                //     maxEggDemand = data.results[0];
                //     // console.log(data);
                // })
                /*.then(() =>*/ this.getGoalsData()
                .then(records => {
                    // debugger;
                    // console.log('records: data, columns, rows ');
                    // console.log(records.data, records.columns, records.rows);
                    console.time("despues")
                    if (records.error) {
                        goals.setProperty("/data", []);
                        util.setProperty("/busy", false);
                        goals.setProperty("/columns", []);
                        goals.setProperty("/rows", []);
                    } else {
                        goals.setProperty("/data", records.data);
                        goals.setProperty("/codeColumns", records.codeColumns);
                        util.setProperty("/busy", false);
                        goals.setProperty("/data_to_erp", records.data_to_erp);

                        console.log("llega aquiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
                        //define los estilos
                        records.columns[0].width = "5%";
                        records.columns.forEach(function (item, index) {
                            if (index < records.staticColumns.length) {
                                item.textalign = "Begin";
                                item.halign = "Left";
                            }
                            else {
                                item.textalign = "End";
                                item.halign = "Right";
                            }
                            item.filter_stage = item.process_id;
                            item.filter_breed = item.breed_id;
                            item.filter_key = item.breed_id + "___$" + item.process_id;
                            item.visible = true;
                            item.design = "Bold";
                            item.state = "None";
                        });

                        // for (let j = 0; j < records.columns.length; j++) {
                        //     if (j < records.staticColumns.length) {
                        //         records.columns[j].textalign = "Begin";
                        //         records.columns[j].halign = "Left";
                        //     }
                        //     else {
                        //         records.columns[j].textalign = "End";
                        //         records.columns[j].halign = "Right";
                        //     }
                        //     records.columns[j].filter_stage = records.columns[j].process_id;
                        //     records.columns[j].filter_breed = records.columns[j].breed_id;
                        //     records.columns[j].filter_key = records.columns[j].breed_id + "___$" + records.columns[j].process_id;
                        //     records.columns[j].visible = true;
                        //     records.columns[j].design = "Bold";
                        //     records.columns[j].state = "None";                            
                        // }

                        console.log("llega aquiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
                        //define los filtros en las columnas estaticas
                        records.staticColumns.forEach(function (item, i) {
                            records.columns[i].filter_key = records.codeColumns;
                        });

                        //define filtros y capacidades
                        for (var i = records.rows.length - 1; i >= 0; i--) {
                            records.rows[i].values.forEach(function (element, index) {
                                element.visible = true;
                                element.design = "Standard";

                                element.isStatic = (index < records.staticColumns.length) ? true : false;

                                /*  if (element.residue== 0){
                                    element.state = 'None';
                                }
                                else{
                                    if (element.residue < 0){
                                        element.state = 'Error';
                                    }else if ((element.capacity * 0.50) > element.residue) {
                                        element.state = 'Success';
                                    } else if ((element.capacity * 0.50) < element.residue) {
                                        element.state = 'Warning';
                                    } else {
                                        element.state = 'None';
                                    }
                                } */

                                if (index < records.staticColumns.length) {
                                    element.filter_key = records.codeColumns;
                                }
                                else {
                                    element.filter_stage = records.columns[index].process_id;
                                    element.filter_breed = records.columns[index].breed_id;
                                    element.filter_key = records.columns[index].breed_id + "___$" + records.columns[index].process_id;
                                }

                            });
                        }
                        goals.setProperty("/rows", records.rows);
                        goals.setProperty("/columns", records.columns);
                        goals.setProperty("/staticColumns", records.staticColumns);
                        console.log("row::", records.rows);
                        let skip = this.getModel("goals").getProperty("/rows/0/values")
                        skip.forEach(item => {
                            item.capacity = undefined
                        });
                        this.getModel("goals").setProperty("/rows/0/values", skip)
                        console.log("row::", records.columns);
                    }
                    console.timeEnd("despues")
                })
                .catch(err => {
                    console.log(err);
                });

        },

        onExit: function () {
            if (this._oPopover) {
                this._oPopover.destroy();
            }
        },

        getMaxDailyDemandEggs: function () {
            let util = this.getModel("util");
            let scenarios = this.getModel("scenarios");
            // let url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/getMaxDemandEggs");
            let url = "/scenario_param/getMaxDemandEggs";
            let method = "POST";
            let data = {
                scenario_id: scenarios.getProperty("/selectedScenario/scenario_id")
            };
            return new Promise((resolve, reject) => {
                function getGoals(res) {
                    resolve(res);
                }

                function error(err) {
                    console.log(err);
                    reject(err);
                }

                this.sendRequest.call(this, url, method, data, getGoals, error, error);
            });

            /*fetch( util.getProperty("/" + util.getProperty("/service") + "/getMaxDemandEggs"),
            {
              method: 'POST',
              body: JSON.stringify(data)
            })
            .then(function(res){
              return res.json();
            })
            .then(function(maxDemandEggs){
              console.log(maxDemandEggs);
              //return maxDemandEggs;
            })
            .catch(function(error){
              console.log(error);
            });*/
        },

        _getPopover: function (oEvent) {

            let path = oEvent.getSource().getBindingContext("goals").getPath()
            let data = this.getModel("goals").getProperty(path)
            console.log(data)
            console.log(data.capacity)

            this.getModel("dummy").setProperty("/dataPopover",
                [{ 'text': data.value, 'init': "Meta: " },
                { 'text': data.capacity, 'init': "Capacidad: " },
                { 'text': data.residue, 'init': "Saldo: " }])




            this._oPopover = sap.ui.xmlfragment("Mantenimiento-escenarios.view.goals.capacity", this);
            this.getView().addDependent(this._oPopover);
            this._oPopover.openBy(oEvent.getSource());

        },

        /*handleTitlePress : function (oEvent) {
			var domRef = oEvent.getParameter("domRef");
			this._getPopover().openBy(domRef);
		},*/
        /***************************************************/
        getGoalsData: function () {
            var util = this.getModel("util");
            console.log("UTIL SJ")
            console.log(util)
            var scenarios = this.getModel("scenarios");
            // console.log(scenarios);
            // var url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/getParameterGoal");
            var url = "/scenario_param/getParameterGoal";
            // console.log(url);
            let filter_stage = this.getModel("mdstage").getProperty("/selectRecords");
            let filter_breed = this.getModel("mdbreed").getProperty("/selectRecords");



            var method = "POST";
            var data = {
                scenario_id: scenarios.getProperty("/selectedScenario/scenario_id"),
                filter_breed: filter_breed,
                filter_stage: filter_stage
            };

            return new Promise((resolve, reject) => {
                function getGoals(res) {
                    resolve(res);
                }

                function error(err) {
                    console.log(err);
                    reject(err);
                }

                this.sendRequest.call(this, url, method, data, getGoals, error, error);
            });
        },
        onScenario: function () {
            var util = this.getModel("util");
            let scenarios = this.getModel("scenarios");
            let that = this
            util.setProperty("/busy", true);
            this.getScenarioRecords()
                .then(records => {
                    scenarios.setProperty("/records", records.data);
                    that.enabledTab(false)
                    scenarios.setProperty("/selectedScenario/scenario_id", 0);
                    scenarios.setProperty("/selectedScenario/name", "");
                    records.data.forEach(function (elem) {
                        if(elem.status==1){
                            scenarios.setProperty("/selectedScenario/scenario_id", elem.scenario_id);
                            scenarios.setProperty("/selectedScenario/name", elem.name);
                            that.enabledTab(true)
                            
                        }
                    })
                    this.showStatusMaintenance();
                    util.setProperty("/busy", false);
                })
                .catch(err => {
                    console.log(err);
                });

        },
        getScenarioRecords: function () {
            var util = this.getModel("util");
            var scenarios = this.getModel("scenarios");
            var url = "/scenario/findAllScenario";
            var method = "GET";
            var data = {};
            console.log(url)
            return new Promise((resolve, reject) => {
                function getScenario(res) {
                    resolve(res);
                }

                function error(err) {
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, getScenario, error, error);
            });
        },
        onProcesses: function () {
            var util = this.getModel("util");
            var processes = this.getModel("processes");
            util.setProperty("/busy", true);
            this.getProcessesData()
                .then(data => {
                    if (data.results === undefined) {
                        processes.setProperty("/originalData", []);
                        processes.setProperty("/data", "");
                        util.setProperty("/busy", false);
                    } else {
                        var results = data.results.map(function (elem) {

                            elem.decrease_goal = parseFloat(elem.decrease_goal).toFixed(2);
                            elem.duration_goal = parseInt(elem.duration_goal, 10);
                            elem.weight_goal = parseFloat(elem.weight_goal).toFixed(2);

                            //para control de validaciones
                            elem.input_decrease_state = "None";
                            elem.input_decrease_state_text = "";

                            elem.input_weight_state = "None";
                            elem.input_weight_state_text = "";

                            elem.input_duration_state = "None";
                            elem.input_duration_state_text = "";

                            return elem;
                        });
                        // console.log(results);
                        processes.setProperty("/originalData", results);
                        processes.setProperty("/data", JSON.parse(JSON.stringify(results)));
                        this.editProcessesButtons();
                        util.setProperty("/busy", false);
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },

        getProcessesData: function () {
            var util = this.getModel("util");
            var scenarios = this.getModel("scenarios");
            var processes = this.getModel("processes");
            // var url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/getScenarioProcesses");
            var url = "/scenario_proc/getScenariosProcess";
            var method = "POST";
            var data = {
                scenario_id: scenarios.getProperty("/selectedScenario/scenario_id")
            };

            return new Promise((resolve, reject) => {

                function getProcessScenarios(res) {
                    // console.log("datos obtenidos", res);
                    resolve(res);
                }

                function error(err) {
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, getProcessScenarios, error, error);
            });
        },

        hideScenariosButtons: function () {
            var scenarios = this.getModel("scenarios");

            scenarios.setProperty("/new", false);
            scenarios.setProperty("/delete", false);
            scenarios.setProperty("/edit/", false);
        },

        newScenariosButtons: function () {
            var scenarios = this.getModel("scenarios");

            scenarios.setProperty("/new", true);
            scenarios.setProperty("/delete", true);
            scenarios.setProperty("/edit/", true);
        },

        hideProcessesButtons: function () {
            var processes = this.getModel("processes");

            processes.setProperty("/editable", false);
            processes.setProperty("/edit", false);
            processes.setProperty("/save", false);
            processes.setProperty("/cancel", false);
        },

        hideBudgetButtons: function () {
            var budget = this.getView().getModel("budget");

            budget.setProperty("/next", false);
            budget.setProperty("/edit", false);
            budget.setProperty("/save", false);
            budget.setProperty("/cancel", false);
            budget.setProperty("/prev", false);
        },
        hideBudgetButtons: function () {
            var budget = this.getView().getModel("budget");

            budget.setProperty("/next", false);
            budget.setProperty("/edit", false);
            budget.setProperty("/cancel", false);
            budget.setProperty("/prev", false);
        },
        hideGoalsButtons: function () {
            var goals = this.getView().getModel("goals");

            goals.setProperty("/export", false);
            goals.setProperty("/export_erp", false);
            goals.setProperty("/export2", false);
        },
        newGoalsButtons: function () {
            var goals = this.getView().getModel("goals");

            goals.setProperty("/export", true);
            goals.setProperty("/export_erp", true);
            goals.setProperty("/export2", true);
        },
        newBudgetButtons: function () {
            var budget = this.getView().getModel("budget");

            budget.setProperty("/next", true);
            budget.setProperty("/edit", true);
            budget.setProperty("/cancel", false);
            budget.setProperty("/prev", true);
        },

        editProcessesButtons: function () {
            var processes = this.getModel("processes");

            processes.setProperty("/editable", false);
            processes.setProperty("/edit", true);
            processes.setProperty("/save", false);
            processes.setProperty("/cancel", false);
        },

        saveProcessesButtons: function () {
            var processes = this.getModel("processes");

            processes.setProperty("/editable", true);
            processes.setProperty("/edit", false);
            processes.setProperty("/save", true);
            processes.setProperty("/cancel", true);
        },

        onProcessesEdit: function () {
            var processes = this.getModel("processes");

            processes.setProperty("/changes", []);
            this.saveProcessesButtons();
        },

        onTest: function (ev) {
            console.log(ev);
        },

        onProcessesSave: function () {
            var util = this.getModel("util");
            var processes = this.getModel("processes");
            var originalData = processes.getProperty("/originalData");
            var data = processes.getProperty("/data");
            let errValidate = false;

            /*Especifica los cambios que ocurrieron en cada registro que cambio*/
            var changes = data.map(function (elem, index) {

                var aux = {
                    scenario_process_id: elem.scenario_process_id
                };

                /*var weight_goal = parseFloat(elem.weight_goal).toFixed(2);
                var decrease_goal = parseFloat(elem.decrease_goal).toFixed(2);
                var duration_goal = (elem.duration_goal);*/

                var changed = elem.decrease_goal != originalData[index].decrease_goal ||
                    elem.duration_goal != originalData[index].duration_goal ||
                    elem.weight_goal != originalData[index].weight_goal;

                elem.input_decrease_state = "None";
                elem.input_decrease_state_text = "";

                elem.input_duration_state = "None";
                elem.input_duration_state_text = "";

                elem.input_weight_state = "None";
                elem.input_weight_state_text = "";
                /*console.log('changed: ', changed)
                console.log('elem: ', elem)
                console.log('es entero?: ', elem.duration_goal, Number.isInteger(Number(elem.duration_goal)))
                console.log('isNaN?: ', elem.duration_goal, isNaN(elem.duration_goal))*/
                /*Si ocurrio algun cambio en este registro*/
                if (changed) {

                    if (elem.weight_goal === null || elem.weight_goal.toString().trim() == "" ||
                        isNaN(elem.weight_goal) || parseFloat(elem.weight_goal) < 0) {
                        elem.input_weight_state = "Error";
                        elem.input_weight_state_text = "Valor incorrecto";
                        errValidate = true;
                    }
                    else {
                        if (elem.weight_goal != originalData[index].weight_goal) {
                            aux.weight_goal = parseFloat(elem.weight_goal);
                        }
                        elem.input_weight_state = "None";
                        elem.input_weight_state_text = "";
                    }

                    if (elem.decrease_goal === null || elem.decrease_goal.toString().trim() == "" ||
                        isNaN(elem.decrease_goal) || parseFloat(elem.decrease_goal) < 0) {
                        elem.input_decrease_state = "Error";
                        elem.input_decrease_state_text = "Valor incorrecto";
                        errValidate = true;
                    }
                    else {
                        if (elem.decrease_goal != originalData[index].decrease_goal) {
                            aux.decrease_goal = parseFloat(elem.decrease_goal);
                        }
                        elem.input_decrease_state = "None";
                        elem.input_decrease_state_text = "";
                    }

                    if (elem.duration_goal === null || elem.duration_goal.toString().trim() == "" ||
                        isNaN(elem.duration_goal) || Number(elem.duration_goal) < 0) {
                        elem.input_duration_state = "Error";
                        elem.input_duration_state_text = "Valor incorrecto";
                        errValidate = true;
                    } else {
                        if (!Number.isInteger(Number(elem.duration_goal))) {
                            elem.input_duration_state = "Warning";
                            elem.input_duration_state_text = "Solo se aceptan valoren enteros positivos";
                            errValidate = true;
                        } else {
                            if (elem.duration_goal != originalData[index].duration_goal) {
                                aux.duration_goal = parseInt(elem.duration_goal);
                            }
                            elem.input_duration_state = "None";
                            elem.input_duration_state_text = "";
                        }
                    }

                }
                return aux;
            });

            console.log("vector de cambios: ", changes);
            /*Filtra solo los registro que cambiaron*/

            changes = changes.filter(function (elem, index) {

                /*Si existe algun cambio por hacer en este registro*/
                if (Number.isInteger(elem.decrease_goal) || Number.isInteger(elem.duration_goal) || Number.isInteger(elem.weight_goal)) {
                    return true;
                }
                return false;
            });

            processes.setProperty("/changes", changes);
            console.log("cambios", changes);
            /*Si hay al menos un cambio por realizar*/
            if (errValidate) {
                this.onToast("Algunos de los valores ingresados no son permitidos");
            } else if (changes.length === 0) {
                this.onToast("Realice algún cambio para guardar");
            } else {
                /*Actualiza los datos y vuelve a obtenerlos*/
                util.setProperty("/busy", true);
                this.updateProcessesData()
                    .then(() => this.getProcessesData())
                    .then(data => {

                        var results = data.results.map(function (elem) {

                            elem.decrease_goal = parseFloat(elem.decrease_goal).toFixed(2);
                            elem.duration_goal = parseInt(elem.duration_goal, 10);
                            elem.weight_goal = parseFloat(elem.weight_goal).toFixed(2);

                            return elem;
                        });

                        processes.setProperty("/originalData", results);
                        processes.setProperty("/data", JSON.parse(JSON.stringify(results)));

                        this.editProcessesButtons();
                        util.setProperty("/busy", false);
                        this.onToast("Los cambios se guardaron con éxito");
                    })
                    .catch(err => {
                        util.setProperty("/busy", false);
                        console.log("error en la actualizacion", err);
                    });
            }
        },

        updateProcessesData: function () {
            var util = this.getModel("util");
            var processes = this.getModel("processes");
            var scenarios = this.getModel("scenarios");
            var budget = this.getModel("budget");
            // var url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/updateScenarioProcesses");
            var url = "/scenario_proc/updateScenarioProcesses";
            var method = "PUT";
            var changes = {
                "scenario_id": scenarios.getProperty("/selectedScenario/scenario_id"),
                "changes": processes.getProperty("/changes")
            };
            console.log("changes", changes);
            budget.setProperty("/callFromBudget", false);
            return new Promise((resolve, reject) => {
                function updateProcessScenarios(res) {
                    resolve(res);
                }

                function error(err) {
                    reject(err);
                }

                this.sendRequest.call(this, url, method, changes, updateProcessScenarios, error, error);
            }).then(this.pushScenarioParameters());
        },

        onProcessesCancel: function () {
            var processes = this.getModel("processes");

            processes.setProperty("/data", JSON.parse(JSON.stringify(processes.getProperty("/originalData"))));
            processes.setProperty("/changes", []);
            this.editProcessesButtons();
        },
        onselectScenario: function (obj) {
            console.log("aqui le doy a la tabla")
            let scenarios = this.getView().getModel("scenarios");
            let scenariosS = obj
            let status = scenariosS.status
            let scenarioSelect = scenariosS.scenario_id
            let name = scenariosS.name

            scenarios.setProperty("/selectedScenario/scenario_id/", scenarioSelect);
            scenarios.setProperty("/selectedScenario/name/", name);
            if (status == 1) {
                scenarios.setProperty("/scenarioActivate", false);
                scenarios.setProperty("/scenarioDesactivate", true);
                this.enabledTab(true);
            }
            else {
                scenarios.setProperty("/scenarioActivate", true);
                scenarios.setProperty("/scenarioDesactivate", false);
                this.enabledTab(false);
            }
            scenarios.setProperty("/delete/", true);
            scenarios.setProperty("/edit/", true);
            this.showStatusMaintenance();
        },

        getSelectScenario: function () {
            let scenarios = this.getView().getModel("scenarios");
            let selectRecords = this.getView().byId("maintenanceTable")._aSelectedPaths;

            return (scenarios.getProperty(selectRecords[0]));
        },

        onUpdateScenario: async function (oEvent) {
            let obj = oEvent.getSource().getBindingContext("scenarios").getObject();
            let scenario = this.getModel("scenarios");
            let budget = this.getModel("budget");
            let initDate = new Date(obj.date_start);
            let endDate = new Date(obj.date_end);
            // let getYearsScenario = await this.sGetYearsEscenario();

            // let i = 0;
            // let records = calendar.getProperty("/records");
            // while (i < records.length) {
            //     if (records[i].calendar_id == obj.calendar_id) {
            //         calendar.setProperty("/selectRecords", records[i]);
            //         scenario.setProperty("/setScenario/yearBegin", records[i].year_start);
            //         scenario.setProperty("/setScenario/yearEnd", records[i].year_end);
            //     }
            //     i++;
            // }

            this.resetInputs();
            budget.setProperty("/btnDialog", "Actualizar");
            budget.setProperty("/textDialog", "Actualizar Escenario");

            scenario.setProperty("/setScenario/description", obj.description);
            scenario.setProperty("/setScenario/name", obj.name);
            scenario.setProperty("/setScenario/excepcion", obj.name);
            scenario.setProperty("/setScenario/id", obj.scenario_id);
            scenario.setProperty("/setScenario/monthBegin", initDate.getMonth() + 1);
            scenario.setProperty("/setScenario/yearBegin", initDate.getFullYear());
            scenario.setProperty("/setScenario/monthEnd", endDate.getMonth() + 1);
            scenario.setProperty("/setScenario/yearEnd", endDate.getFullYear());

            //habilita el boton de update, deshabilita el de crear
            budget.setProperty("/textBtnK", "Actualizar");
            budget.setProperty("/enabledBtnK", false);
            budget.setProperty("/typeActionBtnk", 1);//indica que se activo para actualizar

            this.showDialogScenario();

        },
        onNewScenario: async function () {

            // let getYearsScenario = await this.sGetYearsEscenario();
            let date = this.getModel("date");
            let year = date.getProperty("/years");
            let budget = this.getModel("budget");
            let scenario = this.getModel("scenarios");
            let calendar = this.getModel("calendar");

            this.resetInputs();
            budget.setProperty("/btnDialog", "Crear");
            budget.setProperty("/textDialog", "Crear Escenario");

            // let records= calendar.getProperty('/records');
            // calendar.setProperty('/selectRecords',records[0]);// id: -
            // console.log("this:: ", calendar.getProperty('/selectRecords'))

            scenario.setProperty("/setScenario/description", "");
            scenario.setProperty("/setScenario/name", "");
            scenario.setProperty("/setScenario/excepcion", "");
            scenario.setProperty("/setScenario/id", "");
            scenario.setProperty("/setScenario/monthBegin", "1");
            scenario.setProperty("/setScenario/yearBegin", "");
            scenario.setProperty("/setScenario/yearEnd", "");
            // sap.ui.getCore().byId("initYear2").setSelectedKey("")
            // sap.ui.getCore().byId("endYear2").setSelectedKey("")
            // date.setProperty("/yearsI", [])
            // scenario.setProperty("/setScenario/yearBegin", calendar.getProperty("/records")[0].year_start);
            // // scenario.setProperty("/setScenario/yearBegin", year[0].year);
            // scenario.setProperty("/setScenario/monthEnd", "12");
            // scenario.setProperty("/setScenario/yearEnd", calendar.getProperty("/records")[0].year_end);
            // // scenario.setProperty("/setScenario/yearEnd", year[year.length-1].year);
            // //desabilita el boton de crear y desaparece el de update
            budget.setProperty("/textBtnK", "Crear");
            budget.setProperty("/enabledBtnK", false);
            budget.setProperty("/typeActionBtnk", 0);//indica que se activo para crear

            this.showDialogScenario();

            // if (calendar.getProperty("/records").length <= 1) {
            //     console.log("hola");
            //     MessageToast.show("No existen calendarios y procesos asociados", {
            //         duration: 3000,
            //         width: "35%"
            //     });
            // }
        },

        showDialogScenario: async function () {
            let that = this;
            let budget = this.getModel("budget");
            let dialog = this.dialogNewScenario;


            //Botón cancelar:
            sap.ui.getCore().byId("cancelBtn").attachPress(function () {
                dialog.close();
                // dialog.destroy();
            });

            //Al cerrar el dialogo con la tecla ESC, es necesario indicarle que se destruya:
            dialog.attachAfterClose(function () {
                // dialog.destroy();
            });

            //Agregamos como dependiente el dialogo a la vista:
            this.getView().addDependent(dialog);
            this.changeCalendar();
            //Abrimos el dialogo:
            dialog.open();
        },

        _saveEscenario: function (escenario) {

            var util = this.getModel("util");
            var scenarios = this.getModel("scenarios");
            util.setProperty("/busy", true);
            this.postAddScenario(escenario)
                .then(records => {
                    scenarios.setProperty("/records", records.data);
                    util.setProperty("/busy", false);
                })
                .catch(err => {
                    console.log(err);
                });

        },
        postAddScenario: function (escenario) {
            var util = this.getModel("util");
            var scenarios = this.getModel("scenarios");
            var processes = this.getModel("processes");
            // var url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/addScenario");
            var url = "/scenario/addScenario";
            var method = "POST";
            var data = escenario;
            var that = this;

            return new Promise((resolve, reject) => {
                function postScenarios(res) {
                    MessageToast.show("Escenario guardado", {
                        duration: 4500,
                        width: "35%"
                    });
                    that.onScenario();
                    resolve(res);
                }

                function error(err) {
                    MessageToast.show("Error", {
                        duration: 4500,
                        width: "35%"
                    });
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, postScenarios, error, error);
            });
        },

        //**//**//**//
        //Section Budget
        //**//**//**//
        onBudget: function () {
            var view = this.getView();
            var model = view.getModel("budget");
            var scenario = view.getModel("scenarios");
            let up = scenario.getProperty("/updatesScenarios");
            var dummy = view.getModel("dummy");
            var that = this;
            let util = view.getModel("util");
            util.setProperty("/busy", true);
            console.log("Here i am", util.getProperty("/busy"))
            // Call Post
            return new Promise(async (resolve, reject) => {
                // var url = dummy.getProperty("/urlService") + "/scenario_param/getScenariosParameters";
                var url = "/scenario_param/getScenariosParameters";
                var method = "POST";
                var data = {
                    scenario_id: scenario.getProperty("/selectedScenario/scenario_id/"),
                    type: "Salida"
                };

                function postBudget(res) {
                    model.setProperty("/inYear", res.initYDate);
                    model.setProperty("/outYear", res.endYDate);
                    model.setProperty("/inMonth", res.initMDate);
                    model.setProperty("/outMonth", res.endMDate);
                    model.setProperty("/NParameters", res.numberOfParameters);
                    model.setProperty("/pulledData", res.results);
                    that.scenarioYearsConfig();
                    console.log("--------------------------------------------------");
                    console.log("--------------------------------------------------");
                    let i = 0;
                    while (i < up.length && i != -1) {
                        if (up[i] == scenario.getProperty("/selectedScenario/scenario_id/")) {
                            up.splice(i, 1);
                            i = -1;
                        } else {
                            i++;
                        }
                    }
                    console.log("up:: ", up);
                    if (i != -1) {
                        console.log("el escenario aun no se ha actualziado");
                    }
                    else {
                        console.log("escenario se ha actualziado: ", scenario.getProperty("/selectedScenario/scenario_id/"));
                        that.forcePushScenarioParameters();
                    }
                    util.setProperty("/busy", false)
                    resolve(res);
                }

                function error(err) {
                    reject(err);
                }

                /*Envía la solicitud*/
                await this.sendRequest.call(this, url, method, data, postBudget, error, error);

            });
        },
        onBudgetIn: function () {
            var view = this.getView();
            var model = view.getModel("budget");
            var scenario = view.getModel("scenarios");
            var dummy = view.getModel("dummy");
            var that = this;

            // Call Post
            return new Promise((resolve, reject) => {
                // var url = dummy.getProperty("/urlService") + "/scenario_param/getScenariosParameters";
                var url = "/scenario_param/getScenariosParameters";
                var method = "POST";
                var data = {
                    scenario_id: scenario.getProperty("/selectedScenario/scenario_id/"),
                    type: "Entrada"
                };

                function postBudget(res) {
                    console.log(res);
                    model.setProperty("/inYear", res.initYDate);
                    model.setProperty("/outYear", res.endYDate);
                    model.setProperty("/inMonth", res.initMDate);
                    model.setProperty("/outMonth", res.endMDate);
                    model.setProperty("/NParameters", res.numberOfParameters);
                    model.setProperty("/pulledData", res.results);
                    that.scenarioYearsConfig();
                    resolve(res);
                }

                function error(err) {
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, postBudget, error, error);
            });
        },
        scenarioYearsConfig: function () {
            var view = this.getView();
            var element, i, j, k, param_length;
            var start, end;
            var model = view.getModel("budget");
            var inYear, outYear, inMonth, outMonth, outYearDiff;
            var column, length, nParameters;
            var yearData = [];

            var arrayPulledData = model.getProperty("/pulledData");
            nParameters = model.getProperty("/NParameters");
            inYear = parseInt(model.getProperty("/inYear"));
            outYear = parseInt(model.getProperty("/outYear"));
            inMonth = model.getProperty("/inMonth");
            outMonth = model.getProperty("/outMonth");
            var values = [];
            var pushArray = [];
            var parts = [];

            length = 0;
            if (!arrayPulledData.length) {
                model.setProperty("/tableData", []);
                model.setProperty("/bindedYear", "--");
                return;
            }
            if (inYear == outYear) { //Construct for one year only
                arrayPulledData = arrayPulledData[0].data; //Setting arrayPulledData to data property that holds parameters and values
                for (k = 0; k != nParameters; k++) //Parameters
                {
                    //This is the first column element, the parameter
                    // element = {
                    //     value: arrayPulledData[k][0].name,
                    //     editable: false,
                    //     lock: true,
                    //     width: "10%",
                    //     direction: "Left"
                    // };
                    // values.push(element);
                    for (j = inMonth - 1; j != outMonth; j++) //
                    {
                        // value: parseFloat(arrayPulledData[k][j].value).toFixed(2),
                        element = {
                            value: parseInt(arrayPulledData[k][j].value),
                            editable: false,
                            lock: false,
                            index: j,
                            direction: "Right",
                            parameter_id: arrayPulledData[k][j].scenario_parameter_id,
                            width: "40%",
                            valueState: "None",
                            valueStateText: ""
                        };
                        values.push(element);
                    }
                    //Adding parameters by row
                    element = {
                        name: arrayPulledData[k][0].name,
                        parameter_id: arrayPulledData[k][0].parameter_id,
                        values: values
                    };
                    parts.push(element); //Every element of parts is a row
                    values = [];
                }
                element = {
                    year: inYear,
                    values: parts
                }; //Whole year
                pushArray.push(element); //Every element of Push Array is a year
            } else {
                outYearDiff = outYear - inYear;
                for (i = 0; i != outYearDiff + 1; i++) {

                    yearData = arrayPulledData[i].data; //Setting arrayPulledData to data property that holds parameters and values
                    parts = [];
                    values = [];

                    if (i == outYearDiff) {//Same Year, fill from January to endMonth
                        start = 0;
                        end = outMonth;
                    } else if (i == inYear) { // Fill from the inMonth to December
                        start = inMonth - 1; //Months starting in zero
                        end = 12;
                    } else {// Fill all months
                        start = 0;
                        end = 12;
                    }

                    for (k = 0; k < yearData.length; k++) //Parameters
                    {
                        end = yearData[k].length;
                        for (j = start; j != end; j++) //Months
                        {
                            element = {
                                value: yearData[k][j].value,
                                index: yearData[k][j].month - 1,
                                editable: false,
                                direction: "Right",
                                lock: false,
                                parameter_id: yearData[k][j].scenario_parameter_id,
                                valueState: "None",
                                valueStateText: ""
                            };
                            values.push(element); // Every Elements of valueins is a cell
                        }
                        element = {
                            name: yearData[k][0].name,
                            parameter_id: yearData[k][0].parameter_id,
                            values: values
                        };
                        values = [];
                        parts.push(element); //Every element of parts is a row
                    }
                    element = {

                        year: inYear + i,
                        values: parts
                    }; //Whole year
                    pushArray.push(element); //Every element of Push Array is a year

                }
            }
            model.setProperty("/NYears", (outYear - inYear) + 1); //Number of years
            //model.setProperty("/NYears", outYear + 1); //Number of years
            model.setProperty("/tableDataAllYears", pushArray); //All years data available
            model.setProperty("/bindedYear", inYear); //Initialized first position
            model.setProperty("/bindedYearPosition", 0); //Initialized first position
            model.setProperty("/tableData", pushArray[0].values);

            this.resetColumns();
        },

        resetColumns: function () {
            var view = this.getView();
            var model = view.getModel("budget");
            var columListemItem, input, element;
            var i, j, k, acum, rows, columns, inMonth, end;
            var cells = [];
            var starters, parts;

            var months, array;

            inMonth = model.getProperty("/tableData/0/values/0/index"); //Month of the first need to start in 0
            //Number of columns is determined by the formula:
            // Number of months = Full length of data /Number of Rows (parameters)
            var nColumns = parseInt(model.getProperty("/tableData/0/values").length);
            months = model.getProperty("/Months");
            array = [];
            /*element = {
                value: "Parámetros",
                width: "20em",
                align: "Left"
            };
            array.push(element);
            */
            end = (((inMonth) + (nColumns))); //Minus inMonth added element and nColumns parameters
            for (k = inMonth; k != end; k++) {
                element = {
                    value: months[k].value,
                    width: "",
                    align: "Right"
                };
                array.push(element);
            }
            model.setProperty("/Columns", array); //New array of months
        },
        onBudgetNextYear: function () {
            var view = this.getView();
            var model = view.getModel("budget");
            var i, j, length, values_length;
            var index;
            var tableAllData = model.getProperty("/tableDataAllYears");
            var tableData = model.getProperty("/tableData");
            length = tableAllData.length;

            i = parseInt(model.getProperty("/bindedYearPosition"));
            model.setProperty("/tableDataAllYears/" + i + "/values", model.getProperty("/tableData")); //Back up data from table to array years of data

            if (length != 1) //Greater than 1 year
            {
                i++; //Increase bindedyearposition
                if (i == length) //check bindedYearPosition
                    i = 0;
                model.setProperty("/tableData", tableAllData[i].values);
                model.setProperty("/bindedYearPosition", i);
                model.setProperty("/bindedYear", model.getProperty("/tableDataAllYears/" + i + "/year"));
                this.resetColumns();
            }
        },
        onBudgetPreviousYear: function () {
            var view = this.getView();
            var model = view.getModel("budget");
            var i, j, length, values_length;
            var tableAllData = model.getProperty("/tableDataAllYears");
            var tableData = model.getProperty("/tableData");
            length = tableAllData.length;

            i = parseInt(model.getProperty("/bindedYearPosition"));
            model.setProperty("/tableDataAllYears/" + i + "/values", model.getProperty("/tableData")); //Back up data from table to array years of data

            if (length != 1) //Greater than 1 year
            {
                i--;
                if (i < 0) //Decrease and check bindedYearPosition
                    i = length - 1;
                model.setProperty("/tableData", tableAllData[i].values);
                model.setProperty("/bindedYearPosition", i);
                model.setProperty("/bindedYear", model.getProperty("/tableDataAllYears/" + i + "/year"));
                this.resetColumns();
            }
        },
        toggleBudgetEditability: function () {
            var view = this.getView();
            var data = view.getModel("budget");
            var i, j, length, values_length;
            var tableData = data.getProperty("/tableData");

            //Buttons Editable Configuration
            data.setProperty("/edit", false);
            data.setProperty("/cancel", true);
            data.setProperty("/prev", false);
            data.setProperty("/next", false);

            //Save original data before changing it, so if user cancels, we restore the data
            data.setProperty("/tableData_original", JSON.parse(JSON.stringify(data.getProperty("/tableData"))));

            length = tableData.length;
            for (i = 0; i != length; i++) {
                values_length = tableData[i].values.length;
                for (j = 0; j != values_length; j++) {
                    if (!tableData[i].values[j].lock) //If it is not locked, meaning it is an editable value
                        tableData[i].values[j].editable = !tableData[i].values[j].editable;
                }
            }
            data.setProperty("/tableData", tableData); //Showing editability
        },

        onBudgetSave: function () {
            var that = this;
            var view = this.getView();
            var model = view.getModel("budget");
            if (!this._validateParameterTable()) {
                this.onToast("Algunos de los valores ingresados no son permitidos");
            }
            else {
                // Dialog
                var dialog = new Dialog({
                    title: "Aviso",
                    type: "Message",
                    content: new Text({
                        text: "¿Desea confirmar los cambios realizados a los parámetros del escenario?"
                    }),
                    beginButton: new Button({
                        text: "Aceptar",
                        press: function (oEvent) {
                            oEvent.getSource().oParent.mAggregations.beginButton.setEnabled(false)
                            model.setProperty("/callFromBudget", true);
                            that.pushScenarioParameters();
                            dialog.close();
                        }
                    }),
                    endButton: new Button({
                        text: "Cancelar",
                        press: function () {
                            dialog.close();
                        }
                    }),
                    afterClose: function () {
                        dialog.destroy();
                    }
                });
                dialog.open();
            }
        },

        onBudgetCancel: function () {
            var view = this.getView();
            var model = view.getModel("budget");
            var that = this;
            // Dialog
            var dialog = new Dialog({
                title: "Aviso",
                type: "Message",
                content: new Text({
                    text: "¿Desea salir de la edición de parametros? Todos los cambios realizados se perderán"
                }),
                beginButton: new Button({
                    text: "Aceptar",
                    press: function () {
                        model.setProperty("/tableData", model.getProperty("/tableData_original"));
                        that.newBudgetButtons();
                        dialog.close();
                    }
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });
            dialog.open();
        },
        pushScenarioParameters: async function () {
            var view = this.getView();
            var model = view.getModel("budget");
            var that = this;
            var length_years, length_parameters, length_months;
            var i, j, k, call, data, parameters, element;
            var arrayPush = [];
            let util = this.getModel("util");
            util.setProperty("/busy", true);

            if (!model.getProperty("/callFromBudget"))
                var promesa = await this.onBudget();

            length_years = model.getProperty("/NYears");
            //recorre cada año
            for (i = 0; i != length_years; i++) {
                parameters = model.getProperty("/tableDataAllYears/" + i + "/values");
                length_parameters = parameters.length;
                //recorre cada parametro
                for (j = 0; j != length_parameters; j++) {
                    parameters = model.getProperty("/tableDataAllYears/" + i + "/values/" + j + "/values");
                    length_months = parameters.length;
                    //recorre cada mes
                    for (k = 0; k != length_months; k++) // Starts with one added since its first parameter is the parameter
                    {
                        // parameters[k].value = parseFloat(parameters[k].value).toFixed(2)
                        parameters[k].value = parseInt(parameters[k].value);
                        element = {
                            scenario_parameter_id: parameters[k].parameter_id,
                            value: parameters[k].value,
                        };
                        arrayPush.push(element);
                    }
                    model.setProperty("/tableDataAllYears/" + i + "/values/" + j + "/values", parameters); // Reflecting changes from fix floats in model
                }
            }
            console.log("arrayPush");
            // Call Put
            return new Promise((resolve, reject) => {
                var dummy = that.getView().getModel("dummy");
                // var url = dummy.getProperty("/urlService") + "/scenario_param/updateScenariosParameters";
                var url = "/scenario_param/updateScenariosParameters";
                var method = "PUT";
                var data = {
                    "changes": arrayPush
                };

                function putBudget(res) {
                    resolve(res);
                    that.activeGoalsTab();
                }

                function error(err) {
                    console.log("aqui, joven!");
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, putBudget, error, error);
            }).then(() => {
                if (model.getProperty("/callFromBudget")) {
                    util.setProperty("/busy", false);
                    MessageToast.show("Parámetro guardado", {
                        duration: 4500,
                        width: "35%"
                    });
                    that.toggleBudgetEditability();
                    that.newBudgetButtons();
                }
            }).catch(() => {
                that.toggleBudgetEditability();
                that.newBudgetButtons();
            });

        },

        columnPress: function (oEvent) {
            console.log("Pressed!");
        },
        onDeleteScenario: function () {
            var that = this;
            var scenarios = this.getModel("scenarios");
            var nameScenario = scenarios.getProperty("/selectedScenario/name");
            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Desea eliminar el escenario " + nameScenario
                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        dialog.close();
                        that.deleteScenario();
                    }
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },
        deleteScenario: function () {
            var that = this;
            var util = this.getModel("util");
            var scenarios = this.getModel("scenarios");
            util.setProperty("/busy", true);
            this.sDeleteScenario()
                .then(records => {
                    console.log("si elimino");
                    util.setProperty("/busy", false);
                    that.onToast(records.mgs);
                    that.enabledTab(false);
                    that.onScenario();
                    scenarios.setProperty("/selectedScenario/scenario_id", 0);
                    scenarios.setProperty("/selectedScenario/name", "");
                    scenarios.setProperty("/delete", false);
                    scenarios.setProperty("/edit/", false);
                    that.getView().byId("maintenanceTable").removeSelections();
                    // scenario.refresh();
                })
                .catch(err => {
                    console.log("err, no eliminó: ", err);
                    // that.onToast(err);
                });
        },
        sDeleteScenario: function (scenario_id) {
            var util = this.getModel("util");
            var scenarios = this.getModel("scenarios");
            // var url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/deleteScenario");
            var url = "/scenario";
            var method = "DELETE";
            let sScenario = this.getSelectScenario();
            console.log("id:: ", sScenario.scenario_id);
            var data = {
                scenario_id: sScenario.scenario_id
            };

            return new Promise((resolve, reject) => {
                function deleScenario(res) {
                    console.log("eliminacion correcta");
                    resolve(res);
                }

                function error(err) {
                    console.log("err al eliminar");
                    reject(err);
                }
console.log("pasa antes")
                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, deleScenario, error, error);
            });
        },

        onGoalsExport: function () {
            var util = this.getModel("util");
            // var url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/fileExport");
            var url = "/downloadFile/fileExport/";
            window.location.href = url;
            /*var method = "GET";
          var data = {};

          return new Promise((resolve, reject) => {
              function getStatusFile(res) {
                  resolve(res);
              };

              function error(err) {
                  reject(err);
              };


              this.sendRequest.call(this, url, method, data, getStatusFile, error, error);
          });*/
            /*var $settings = {
  					url: url,
  					method: 'GET',
  					//data: JSON.stringify(data),
  					//contentType: "application/json",
  					error: err => {
  						console.log("error", err);
  					},
  					success: res => {
  						//console.log("respuesta", res);
  						if(res.statusCode !== 200) {
                console.log("NO EXITO");

  						} else {
  							console.log("EXITO");
  						}
  					}
  				};

  				$.ajax($settings);*/
            /*
          var goals = this.getView().getModel('goals'),
              columns = goals.getData()["columns"],
              oJson = [],
              items = this.getView().byId("goalsTable").getItems();
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var path = item.getBindingContext('goals').getPath();
            var cells = item.getAggregation('cells');
            var object = {};
            for (var j = 0; j < cells.length; j++) {
              var cellPath = cells[j].getBindingContext("goals").getPath();
              object['value' + j] = goals.getProperty(cellPath).value;
              //console.log(goals.getProperty(cellPath));
            }
            oJson.push(object);
          }
          //console.log(oJson);
          var objColum = {};
          var jsonColum = [];
          for(var k = 0; k < columns.length; k++) {
              objColum = {
                "name" : columns[k].columnid,
                "template" : {
                  "content": {
                    "path": "value" + k
                  }
                }
              }
            jsonColum.push(objColum);
          }
          //console.log(oJson);
          //console.log(jsonColum);
          var oModel = new sap.ui.model.json.JSONModel(oJson);
          var oExport = new Export({

    				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
    				exportType : new ExportTypeCSV({
    					separatorChar : ";"
    				}),

    				// Pass in the model created above
    				models : oModel,

    				// binding information for the rows aggregation
    				rows : {
    					path : "/"
    				},

    				// column definitions with column name and binding info for the content

            columns: jsonColum
          });

          // download exported file
    			oExport.saveFile().catch(function(oError) {
    				MessageBox.error("Error al descargar archivo. Intente con otro navegador!\n\n" + oError);
    			}).then(function() {
    				oExport.destroy();
    			});*/
        },
        onGoalsExport2: function () {
            var goals = this.getView().getModel("goals"),
                columns = goals.getData()["columns"],
                oJson = [],
                itemsG = goals.getProperty("/rows"),
                items = this.getView().byId("goalsTable").getItems();
            let mdgoals = this.getModel("goals");
            console.log("items:::: ", items)
            console.log("itemG:::: ", itemsG)
            console.log("del property rows::::: ", goals.getProperty("/rows"))
            console.log("columns")
            console.log(columns)
            for (var i = 0; i < itemsG.length; i++) {
                // var item = items[i];
                // var path = item.getBindingContext("goals").getPath();
                // var cells = item.getAggregation("cells");
                var object = {};
                var k = 0;
                // console.log("cells:::: ", cells)
                for (var j = 0; j < columns.length; j++) {
                    // var cellPath = cells[j].getBindingContext("goals").getPath();
                    object["value" + k] = itemsG[i].values[j].value;
                    // console.log("cellpath:::: ", cellPath)
                    if (itemsG[i].values[j].value !== "" && !isNaN(itemsG[i].values[j].value) &&
                        (j >= mdgoals.getProperty("/staticColumns").length)) {
                        object["value" + (k + 1)] = itemsG[i].values[j].capacity;
                        object["value" + (k + 2)] = itemsG[i].values[j].residue;
                        k = k + 3;
                        console.log("i ", i, "j ", j, "k ", k)
                    }
                    else k++;
                    //console.log(goals.getProperty(cellPath));
                }
                console.log("")
                oJson.push(object);
                //console.log(object);
            }
            console.log("oJson")
            console.log(oJson)
            console.log("columns")
            console.log(columns)
            console.log("mdgoals")
            console.log(mdgoals)
            console.log("mdgoals.getProperty(/staticColumns).length")
            console.log(mdgoals.getProperty("/staticColumns").length)
            var objColum = {};
            var jsonColum = [];
            var m = 0;
            for (var k = 0; k < columns.length; k++) {
                // if(k > 0)
                if (k >= mdgoals.getProperty("/staticColumns").length) {
                    objColum = {
                        "name": columns[k].columnid,
                        "template": {
                            "content": {
                                "path": "value" + m
                            }
                        }
                    };
                    m = m + 1;
                    jsonColum.push(objColum);
                    objColum = {
                        "name": "Capacidad",
                        "template": {
                            "content": {
                                "path": "value" + m
                            }
                        }
                    };
                    m = m + 1;
                    jsonColum.push(objColum);
                    objColum = {
                        "name": "Residuo",
                        "template": {
                            "content": {
                                "path": "value" + m
                            }
                        }
                    };
                    jsonColum.push(objColum);
                    m = m + 1;
                }
                else {
                    objColum = {
                        "name": columns[k].columnid,
                        "template": {
                            "content": {
                                "path": "value" + m
                            }
                        }
                    };
                    m++;
                    jsonColum.push(objColum);
                }
            }
            console.log(jsonColum);
            var oModel = new sap.ui.model.json.JSONModel(oJson);
            var oExport = new Export({

                // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                exportType: new ExportTypeCSV({
                    separatorChar: ";"
                }),

                // Pass in the model created above
                models: oModel,

                // binding information for the rows aggregation
                rows: {
                    path: "/"
                },

                // column definitions with column name and binding info for the content

                columns: jsonColum
            });

            // download exported file
            oExport.saveFile().catch(function (oError) {
                MessageBox.error("Error al descargar archivo. Intente con otro navegador!\n\n" + oError);
            }).then(function () {
                oExport.destroy();
            });

        },


        onDialogScenarioActivate: function (oEvent) {
            var that = this;
            let scenarios = oEvent.getSource().getBindingContext('scenarios').getObject()
            let nameScenario = scenarios.name
        
            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "¿Desea activar el escenario " + nameScenario + "?"
                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        dialog.close();
                        that.onScenarioActivate(scenarios,scenarios.status!=1);
                        // that.onselectScenario(scenarios)
                        
                    }
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },

        onScenarioActivate: function (obj,status) {
            var that = this;
            var util = this.getModel("util");
            var scenarios = this.getModel("scenarios");
            let sScenario;

            util.setProperty("/busy", true);
            sScenario = obj;
            console.log(sScenario);
            if (sScenario === null || sScenario === undefined) {
                console.log("no se puede cargar el escenario activo");
                that.onToast("Error: No se puede cargar el escenario activo");
            } else {
                this.scenarioActivate(sScenario.scenario_id, status)
                    .then(records => {
                        util.setProperty("/busy", false);
                        that.onToast(records.mgs);
                        that.onScenario();
                        // that.getView().byId("maintenanceTable").removeSelections();
                       
                        // scenarios.setProperty("/scenarioActivate", false);
                        // scenarios.setProperty("/scenarioDesactivate", false);
                        scenarios.setProperty("/delete", false);
                        scenarios.setProperty("/edit/", false);
                        scenarios.refresh();


                    })
                    .catch(err => {
                        that.getView().byId("maintenanceTable").removeSelections();
                        console.log(err);
                        that.onToast(err);
                    });
            }
        },
        scenarioActivate: function (id, status) {
            var util = this.getModel("util");
            var scenarios = this.getModel("scenarios");
            // var url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/updateStatus");
            var url = "/scenario/updateStatus";
            var method = "PUT";
            console.log("id recibido: ", id);
            var data = {
                scenario_id: id,
                status: status
            };

            return new Promise((resolve, reject) => {
                function scenarioAc(res) {
                    resolve(res);
                }

                function error(err) {
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, scenarioAc, error, error);
            });
        },


        goToLaunchpad: function () {
            var dummy = this.getView().getModel("dummy");
            // window.location.href = dummy.getProperty("/urlService") + "/Apps/launchpad/webapp";
            window.location.href = "/Apps/launchpad/webapp";
        },
        sGetYearsEscenario: function () {
            let util = this.getModel("util");
            let budget = this.getModel("budget");
            let calendar = this.getModel("calendar");
            let date = this.getModel("date");
            let year = date.getProperty("/years");
            // let url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/getCalendarScenarioYears");
            let url = "/calendar/getCalendarScenarioYears";
            let method = "GET";
            let data = {};

            return new Promise((resolve, reject) => {
                function getYearsScenario(res) {
                    res.data.unshift({
                        code: "-",
                        description: "",
                        year_start: year[0].year,
                        year_end: year[year.length - 1].year,
                        calendar_id: "-"
                    });
                    calendar.setProperty("/records/", res.data);
                    resolve(res);
                }

                function error(err) {
                    console.log("alla");
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, getYearsScenario, error, error);
            });
        },
        // onGoalsToERP: function () {
        //     var util = this.getModel("util");
        //     var goals = this.getModel("goals");

        //     console.log(goals.getProperty("/data_to_erp"));
        //     // var serverName = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/syncToERP");
        //     var serverName = "/scenario_param/syncToERP";

        //     fetch(serverName, {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({
        //             dataERP: goals.getProperty("/data_to_erp")
        //         })
        //     })
        //         .then(
        //             function (response) {
        //                 if (response.status !== 200) {
        //                     console.log("Looks like there was a problem. Status Code: " +
        //                         response.status);
        //                     return;
        //                 }

        //                 response.json().then(function (res) {
        //                     var dialog = new Dialog({
        //                         title: "Información",
        //                         type: "Message",
        //                         state: "Success",
        //                         content: new Text({
        //                             text: "Registros sincronizados con éxito."
        //                         }),
        //                         beginButton: new Button({
        //                             text: "OK",
        //                             press: function () {
        //                                 goals.setProperty("/export_erp", false);
        //                                 dialog.close();
        //                             }
        //                         }),
        //                         afterClose: function () {
        //                             dialog.destroy();
        //                         }
        //                     });

        //                     dialog.open();

        //                 });
        //             }
        //         )
        //         .catch(function (err) {
        //             console.log("Fetch Error :-S", err);
        //         });
        // },


        handleSelectionChangeStage: function (oEvent) {
            var isSelected = oEvent.getParameter("selected");

            // console.log('handleSelectionChange::');
            // console.log(changedItem);

            var state = "Selected";
            if (!isSelected) {
                state = "Deselected";
            }

            // MessageToast.show("Event 'selectionChange': " + state + " '" + changedItem.getText() + "'", {
            //   width: "auto"
            // });
        },

        handleSelectionFinishStage: function (oEvent) {
            var selectedItems = oEvent.getParameter("selectedItems");
            let mdstage = this.getModel("mdstage");
            let filterStage = new Array();

            console.log("handleSelectionFinish::");
            console.log(selectedItems);

            for (var i = 0; i < selectedItems.length; i++) {
                messageText += "'" + selectedItems[i].getText() + "'";
                if (i != selectedItems.length - 1) {
                    messageText += ",";
                }
            }

            messageText += "]";

            selectedItems.forEach(item => {
                filterStage.push(item.mProperties.key);
            });

            mdstage.setProperty("/selectRecords", filterStage);

            console.log("filterStage::");
            console.log(filterStage);

            // MessageToast.show(messageText, {
            //   width: "auto"
            // });
        },


        handleSelectionChangeBreed: function (oEvent) {
            var changedItem = oEvent.getParameter("changedItem");
            var isSelected = oEvent.getParameter("selected");

            // console.log('handleSelectionChange::');
            // console.log(changedItem);

            var state = "Selected";
            if (!isSelected) {
                state = "Deselected";
            }

            // MessageToast.show("Event 'selectionChange': " + state + " '" + changedItem.getText() + "'", {
            //   width: "auto"
            // });
        },

        handleSelectionFinishBreed: function (oEvent) {
            var selectedItems = oEvent.getParameter("selectedItems");
            var messageText = "Event 'selectionFinished': [";
            let mdbreed = this.getModel("mdbreed");
            let filterBreed = new Array();

            console.log("handleSelectionFinish::");
            console.log(selectedItems);

            for (var i = 0; i < selectedItems.length; i++) {
                messageText += "'" + selectedItems[i].getText() + "'";
                if (i != selectedItems.length - 1) {
                    messageText += ",";
                }
            }

            messageText += "]";

            selectedItems.forEach(item => {
                filterBreed.push(item.mProperties.key);
            });

            mdbreed.setProperty("/selectRecords", filterBreed);

            console.log("filterBreed::");
            console.log(filterBreed);

            // MessageToast.show(messageText, {
            //   width: "auto"
            // });
        },

        applyFilters: function () {
            this.onGoals();
        },

        changeCalendar: function (oEvent) {
            this.changeOn();
            let scenario = this.getModel("scenarios");
            let budget = this.getModel("budget");
            let i = 0;
            let date = this.getModel("date")
            date.setProperty("/yearsI", [])


            budget.setProperty("/calendar/valueState", "None");
            budget.setProperty("/calendar/valueStateText", "");

            // scenario.setProperty("/setScenario/yearBegin", []);
            // scenario.setProperty("/setScenario/yearEnd", []);


                    // while (i < records.length) {
                    //     if (records[i].calendar_id == keyR) {
                    //         calendar.setProperty("/selectRecords", records[i]);
                    //         scenario.setProperty("/setScenario/yearBeginI", records[i].year_start);
                    //         scenario.setProperty("/setScenario/yearEndF", records[i].year_end);
                    //         console.log("Reords", records[i].year_start)
                    //         this.generateYears(records[i].year_start, records[i].year_end)
                    //         console.log("Reords", records[i].year_end)
                    //     }
                    //     i++;
                    // }
        },

        generateYears: function (init, close) {
            let year = new Array()
            let date = this.getModel("date");
            console.log("Holaaa", init, close, close - init)
            while (init < close + 1) {
                let obj = {
                    year: init
                }
                year.push(obj)
                init++
                date.setSizeLimit(year.length + 1);
                //posturecurve.setProperty("/lot_init", insert)
            }
            console.log("Hoooolaaa", year)
            console.log("Lista", date.setProperty("/yearsI", year))

        },

        changeNameScenario: function (oEvent) {
            let input = oEvent.getSource();
            input.setValue(input.getValue().trim());
            // let name = sap.ui.getCore().byId("name2").getValue();
            let scenario = this.getModel("scenarios");
            let excepcion = scenario.getProperty("/setScenario/excepcion");
            this.changeOn();
            this.checkChangeNameScenario(sap.ui.getCore().byId("name2").getValue(), excepcion);
        },

        checkChangeNameScenario: function (name, excepcion) {

            let scenario = this.getModel("scenarios");
            let util = this.getModel("util");
            let budget = this.getModel("budget");
            // let serverName  = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/getScenarioName");
            let serverName = "/scenario/getScenarioName/";
            // console.log(serverName);

            if (name == "" || name === null) {
                budget.setProperty("/nameInput/valueState", "None");
                budget.setProperty("/nameInput/valueStateText", "");
            }
            else {
                fetch(serverName, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name,
                        diff: excepcion
                    })
                })
                    .then(function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                            return;
                        }
                        response.json().then(function (res) {
                            if (res.data.length > 0) {
                                budget.setProperty("/nameInput/valueState", "Error");
                                budget.setProperty("/nameInput/valueStateText", "ya existe un escenario con el mismo nombre");
                                budget.setProperty("/enabledBtnK", false);
                            }
                            else {
                                budget.setProperty("/nameInput/valueState", "Success");
                                budget.setProperty("/nameInput/valueStateText", "");
                                budget.setProperty("/enabledBtnK", true);
                            }
                        });
                    })
                    .catch(function (err) {
                        console.log("Fetch Error: ", err);
                    });
            }

        },

        resetInputs: function () {
            let budget = this.getModel("budget");

            budget.setProperty("/nameInput/valueState", "None");
            budget.setProperty("/nameInput/valueStateText", "");

            budget.setProperty("/calendar/valueState", "None");
            budget.setProperty("/calendar/valueStateText", "");

            budget.setProperty("/dateInicio/valueState", "None");
            budget.setProperty("/dateInicio/valueStateText", "");

            budget.setProperty("/dateFin/valueState", "None");
            budget.setProperty("/dateFin/valueStateText", "");

        },

        _validateParameterTable: function () {
            var model = this.getModel("budget");
            let table = model.getProperty("/tableData/");
            let flag = true;

            table.forEach((elem) => {

                for (var k = 0, length3 = elem.values.length; k < length3; k++) {

                    if (elem.values[k].value === null || elem.values[k].value == "") {
                        elem.values[k].value = 0;
                    }
                    if (isNaN(elem.values[k].value) || elem.values[k].value === null
                        || elem.values[k].value.toString().trim() == "") {

                        flag = false;
                        elem.values[k].value = 0;
                        elem.values[k].valueState = "Warning";
                        elem.values[k].valueStateText = "Solo se aceptan valores numéricos";
                    } else {
                        if (elem.values[k].value < 0) {
                            elem.values[k].valueState = "Error";
                            elem.values[k].valueStateText = "El valor no puede ser negativo";
                            flag = false;
                        }
                        else {
                            elem.values[k].valueState = "None";
                            elem.values[k].valueStateText = "";
                        }
                    }


                }
            });
            model.refresh();
            return flag;
        },

        _onlyNumber: function (input) {
            var regex = /^[0-9]+$/;
            return input.match(regex);
        },

        _warningOnlyInt: function (oEvent) {
            let input = oEvent.getSource();
            if (!Number.isInteger(input)) {
                this.onToast("Los días no pueden ser flotantes");
                input.setValue(parseInt(input.getValue(), 10));
            }

        },

        _forceOnlyInt: function (oEvent) {
            let input = oEvent.getSource();
            if (!Number.isInteger(input)) {
                this.onToast("Los días no pueden ser flotantes");
                input.setValue(parseInt(input.getValue(), 10));
            }

        },

        createScenario: function () {

            let valid = true,
                init_input= sap.ui.getCore().byId("initYear2"),
                end_input = sap.ui.getCore().byId("endYear2"),
                name_input = sap.ui.getCore().byId("name2"),
                init = init_input.getValue(),
                end = end_input.getValue(),
                name = name_input.getValue(),
                valid_init = init !== undefined && init !== null && init !== '',
                valid_end = end !== undefined && end !== null && end !== '',
                valid_name = name !== undefined && name !== null && name !== '';

            init_input.setValueState((valid_init)?'None':'Error');
            init_input.setValueStateText((valid_init)?'':'No puede estar vacío')
            end_input.setValueState((valid_end)?'None':'Error');
            end_input.setValueStateText((valid_end)?'':'No puede estar vacío')
            
            name_input.setValueState((valid_name)?'None':'Error');
            name_input.setValueStateText((valid_name)?'':'No puede estar vacío')

            if(valid_init && valid_end && valid_name){
                let that = this;
                let scenario = this.getModel("scenarios");
                var aux_start = init
                    + "-" + sap.ui.getCore().byId("initMonth2").getSelectedKey() + "-01";
                var aux_end = new Date(end
                    + "-" + sap.ui.getCore().byId("endMonth2").getSelectedKey() + "-01");
                aux_end.setMonth(aux_end.getMonth()+1)
                aux_end.setDate(aux_end.getDate()-1)
                let escenario = {
                    scenario_id: scenario.getProperty("/setScenario/id"),
                    name: name,
                    description: sap.ui.getCore().byId("descripcion2").getValue(),
                    date_start: new Date(aux_start),
                    date_end: aux_end,
                    status: 0
                };
    
                if (true) {
                    that._saveEscenario(escenario);
                    this.dialogNewScenario.close();
                }
                else {
                    console.log("no se ha podido crear el nuevo escenario");
                }

            }

        },

        updateScenario: function () {

            let valid = true,
                init_input= sap.ui.getCore().byId("initYear2"),
                end_input = sap.ui.getCore().byId("endYear2"),
                name_input = sap.ui.getCore().byId("name2"),
                init = init_input.getValue(),
                end = end_input.getValue(),
                name = name_input.getValue(),
                valid_init = init !== undefined && init !== null && init !== '',
                valid_end = end !== undefined && end !== null && end !== '',
                valid_name = name !== undefined && name !== null && name !== '';

            init_input.setValueState((valid_init)?'None':'Error');
            init_input.setValueStateText((valid_init)?'':'No puede estar vacío')
            end_input.setValueState((valid_end)?'None':'Error');
            end_input.setValueStateText((valid_end)?'':'No puede estar vacío')
            
            name_input.setValueState((valid_name)?'None':'Error');
            name_input.setValueStateText((valid_name)?'':'No puede estar vacío')

            if(valid_init && valid_end && valid_name){
                let that = this;
                let oldScenario = this.getModel("scenarios");
                var aux_start = init
                    + "-" + sap.ui.getCore().byId("initMonth2").getSelectedKey() + "-02";
                var aux_end = new Date(end
                    + "-" + sap.ui.getCore().byId("endMonth2").getSelectedKey() + "-01");
                aux_end.setMonth(aux_end.getMonth()+1)
                aux_end.setDate(aux_end.getDate()-1)
                let escenario = {
                    scenario_id: oldScenario.getProperty("/setScenario/id"),
                    name: name,
                    description: sap.ui.getCore().byId("descripcion2").getValue(),
                    date_start: new Date(aux_start),
                    date_end: aux_end,
                    status: 0
                };
    
                if (true) {
                    that._updateEscenario(escenario);
                    this.dialogNewScenario.close();
                }
                else {
                    console.log("no se ha podido Actualizar el nuevo escenario");
                }
            }

        },

        _validateScenario: function (escenario) {
            let that = this;
            let budget = this.getModel("budget");
            let scenario = this.getModel("scenarios");

            let calendar = this.getModel("calendar");
            let sCalendar = calendar.getProperty("/selectRecords");
            console.log("sCalendar: ", sCalendar);
            let diff = 0;

            if (parseInt(sap.ui.getCore().byId("endYear2").mProperties.selectedKey, 10) ===
                parseInt(sap.ui.getCore().byId("initYear2").mProperties.selectedKey, 10)) {
                diff = (parseInt(sap.ui.getCore().byId("endMonth2").mProperties.selectedKey, 10) -
                    parseInt(sap.ui.getCore().byId("initMonth2").mProperties.selectedKey, 10));
            }
            else {
                diff = ((12 - parseInt(sap.ui.getCore().byId("initMonth2").mProperties.selectedKey, 10))
                    + parseInt(sap.ui.getCore().byId("endMonth2").mProperties.selectedKey, 10)
                    + ((parseInt(sap.ui.getCore().byId("endYear2").mProperties.selectedKey, 10) -
                        parseInt(sap.ui.getCore().byId("initYear2").mProperties.selectedKey, 10) + 1) * 12));
            }

            if (escenario.selectCalendar === "" || escenario.date_end === "" || escenario.date_start === ""
                || escenario.selectCalendar === null || escenario.date_end === null || escenario.date_start === null
                || escenario.name === "" || escenario.name === null) {

                if (escenario.selectCalendar == "" || escenario.selectCalendar === null) {
                    budget.setProperty("/calendar/valueState", "Error");
                    budget.setProperty("/calendar/valueStateText", "El campo no puede estar vacío");
                }

                if (escenario.name == "" || escenario.name === null) {
                    budget.setProperty("/nameInput/valueState", "Error");
                    budget.setProperty("/nameInput/valueStateText", "El campo no puede estar vacío");
                }

                if (escenario.date_start == "" || escenario.date_start === null) {
                    budget.setProperty("/dateInicio/valueState", "Error");
                    budget.setProperty("/dateInicio/valueStateText", "El campo no puede estar vacío");
                }

                if (escenario.date_end == "" || escenario.date_end === null) {
                    budget.setProperty("/dateFin/valueState", "Error");
                    budget.setProperty("/dateFin/valueStateText", "El campo no puede estar vacío");
                }

                MessageToast.show("Algunos campos requeridos no han sido llenados aún.", {
                    duration: 4500,
                    width: "35%"
                });
                return false;
            }

            else if (escenario.selectCalendar == "-") {

                budget.setProperty("/calendar/valueState", "Warning");
                budget.setProperty("/calendar/valueStateText", "Debe seleccionar un escenario válido");
                MessageToast.show("Seleccione un escenario válido.", {
                    duration: 4500,
                    width: "35%"
                });
                return false;
            }
            else {
                if (parseInt(sap.ui.getCore().byId("initYear2").mProperties.selectedKey, 10) > sCalendar.year_end ||
                    parseInt(sap.ui.getCore().byId("initYear2").mProperties.selectedKey, 10) < sCalendar.year_start ||
                    parseInt(sap.ui.getCore().byId("endYear2").mProperties.selectedKey, 10) > sCalendar.year_end ||
                    parseInt(sap.ui.getCore().byId("endYear2").mProperties.selectedKey, 10) < sCalendar.year_start) {
                    MessageToast.show(`El intervalo de tiempo no está comprendido
                                      dentro del Calendario "${sCalendar.code}: ${sCalendar.description}"`, {
                            duration: 6000,
                            width: "35%"
                        });
                    return false;
                }
                else if ((parseInt(sap.ui.getCore().byId("endYear2").mProperties.selectedKey, 10) < parseInt(sap.ui.getCore().byId("initYear2").mProperties.selectedKey, 10))
                    || ((parseInt(sap.ui.getCore().byId("endYear2").mProperties.selectedKey, 10) === parseInt(sap.ui.getCore().byId("initYear2").mProperties.selectedKey, 10))
                        && (parseInt(sap.ui.getCore().byId("endMonth2").mProperties.selectedKey, 10) < parseInt(sap.ui.getCore().byId("initMonth2").mProperties.selectedKey, 10)))) {
                    MessageToast.show("Rango incorrecto", {
                        duration: 4500,
                        width: "35%"
                    });
                    return false;
                }
                else if (diff < 4) {
                    /**aqui debo mostrar el mensaje*/
                    MessageToast.show("No se puede crear un escenario con un periodo menor a 4 meses.", {
                        duration: 4500,
                        width: "35%" 
                    });
                    return false;
                }
                else {
                    return true;
                }

            }
        },

        _updateEscenario: function (escenario) {
            let that = this;
            let util = this.getModel("util");
            let scenarios = this.getModel("scenarios");
            let up = scenarios.getProperty("/updatesScenarios");
            let id = escenario.scenario_id;
            util.setProperty("/busy", true);
            // let serverName = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/updateScenario");
            let serverName = "/scenario/updateScenario";
            this.postUpdateScenario(escenario)
                .then(records => {
                    scenarios.setProperty("/records", records.data);
                    up.push(id);
                    // console.log("update:: ", scenarios.getProperty("/updatesScenarios"))
                    that.onScenario();
                    that.enabledTab();
                    util.setProperty("/busy", false);
                })
                .catch(err => {
                    console.log(err);
                });
        },


        postUpdateScenario: function (escenario) {
            let that = this;
            let util = this.getModel("util");
            // let url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/updateScenario");
            let url = "/scenario/updateScenario";
            let method = "POST";
            let data = escenario;
            console.log("data: ", data);
            return new Promise((resolve, reject) => {
                function postScenarios(res) {
                    MessageToast.show("Escenario Actualizado", {
                        duration: 4500,
                        width: "35%"
                    });
                    that.onScenario();
                    resolve(res);
                }
                function error(err) {
                    console.log("error: ", err);
                    MessageToast.show("Error", {
                        duration: 4500,
                        width: "35%"
                    });
                    reject(err);
                }
                this.sendRequest.call(this, url, method, data, postScenarios, error, error);
            });
        },

        pressBtnk: function () {
            let budget = this.getModel("budget");

            if (budget.getProperty("/typeActionBtnk")) { // 1: indica actualizar
                this.updateScenario();
            }
            else {// 0: indica crear
                this.createScenario();
            }
        },

        validateIntInputYear: function (o) {
            let input= o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                return true;
            }
            else {
                let aux = value
                    .split("")
                    .filter(char => {
                        if (/^[0-9]$/.test(char)) {
                            if (char !== ".") {
                                return true;
                            }
                        }
                    })
                    .join("");
                value = aux.substring(0, length);
                input.setValue(value);
                return (value!== undefined && value !== null &&value!=='');
            }
        },
        changeOn: function (oEvent) {
            let valid = true;
            if(oEvent !== undefined && oEvent !== null){
                let ov = oEvent;

                valid = this.validateIntInputYear(ov);

            }

            if(valid === true){
                let budget = this.getModel("budget");
                // budget.setProperty('/changeUpdate', true);
                budget.setProperty("/enabledBtnK", true);
                var inputInitYear = sap.ui.getCore().byId("initYear2")
                var inputInitMonth =sap.ui.getCore().byId("initMonth2")
                var inputEndYear = sap.ui.getCore().byId("endYear2")
                var inputEndMonth = sap.ui.getCore().byId("endMonth2")
                var aux_start = inputInitYear.getValue()
                    + "-" + inputInitMonth.getSelectedKey() + "-02";
                var aux_end = inputEndYear.getValue()
                    + "-" + inputEndMonth.getSelectedKey() + "-02";
                var date_start = new Date(aux_start);
                var date_end = new Date(aux_end);
                if(date_start > date_end){
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Rango de fecha no valida");
                }else{
                    inputInitYear.setValueState("None")
                    inputInitYear.setValueStateText("");
                    inputInitMonth.setValueState("None")
                    inputInitMonth.setValueStateText("");
                    inputEndYear.setValueState("None")
                    inputEndYear.setValueStateText("");
                    inputEndMonth.setValueState("None")
                    inputEndMonth.setValueStateText("");
                }
            }
            
        },

        onDialogScenarioDesactivate: function () {
            var that = this;
            var scenarios = this.getModel("scenarios");
            var nameScenario = scenarios.getProperty("/selectedScenario/name");
            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "¿Desea desactivar el escenario " + nameScenario + "?"
                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        dialog.close();
                        that.onScenarioDesactivate();
                        that.enabledTab(true);
                    }
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },

        onScenarioDesactivate: function () {
            var that = this;
            var util = this.getModel("util");
            var scenarios = this.getModel("scenarios");
            let sScenario;

            util.setProperty("/busy", true);
            sScenario = that.getSelectScenario();
            console.log(sScenario);
            if (sScenario === null || sScenario === undefined) {
                console.log("no se puede cargar el escenario activo");
                that.onToast("Error: No se puede cargar el escenario activo");
            } else {
                this.scenarioActivate(sScenario.scenario_id, false)
                    .then(records => {
                        util.setProperty("/busy", false);
                        that.onToast(records.mgs);
                        that.getView().byId("maintenanceTable").removeSelections();
                        scenarios.setProperty("/selectedScenario/scenario_id", 0);
                        scenarios.setProperty("/selectedScenario/name", "");
                        scenarios.setProperty("/scenarioActivate", false);
                        scenarios.setProperty("/scenarioDesactivate", false);
                        scenarios.setProperty("/delete", false);
                        scenarios.setProperty("/edit/", false);
                        that.onScenario();
                        that.enabledTab(false);
                        scenarios.refresh();


                    })
                    .catch(err => {
                        that.getView().byId("maintenanceTable").removeSelections();
                        console.log(err);
                        that.onToast(err);
                    });
            }
        },

        activeGoalsTab: function () {
            let that = this;
            let scenario = this.getModel("scenarios");
            let util = this.getModel("util");
            // let serverName= util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/thereGoals");
            let serverName = "/scenario_param/thereGoals";
            console.log("id: ", scenario.getProperty("/selectedScenario/scenario_id/"));
            fetch(serverName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: scenario.getProperty("/selectedScenario/scenario_id/")
                })
            })
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " + response.status);
                            that.getView().byId("goalsTab").setEnabled(false);
                        }
                        else {
                            response.json().then(function (res) {
                                console.log("data: ", res.data);
                                if (res.data.length > 0) {
                                    that.getView().byId("goalsTab").setEnabled(true);
                                    that.showStatusProductionGoals(false);
                                } else {
                                    that.getView().byId("goalsTab").setEnabled(false);
                                    that.showStatusProductionGoals(true);
                                }
                            });
                        }

                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        validateFloatInput: function (o) {
            let input = o.getSource();
            let floatLength = 10;
            let intLength = 10;

            let value = input.getValue();
            let regex = new RegExp(`/^([0-9]{1,${intLength}})([.][0-9]{0,${floatLength}})?$/`);

            if (regex.test(value)) {
                input.setValueState("None");
                input.setValueStateText("");
                return true;
            }
            else {
                let pNumber = 0;
                let aux = value.split("")
                    .filter(char => {
                        if (/^[0-9.]$/.test(char)) {
                            if (char !== ".") {
                                return true;
                            }
                            else {
                                if (pNumber === 0) {
                                    pNumber++;
                                    return true;
                                }
                            }
                        }
                    }).join("").split(".");
                value = aux[0].substring(0, intLength);

                if (aux[1] !== undefined) {
                    value += "." + aux[1].substring(0, floatLength);
                }
                input.setValue(value);
                return false;
            }
        },

        validateIntInput: function (o) {
            console.log("validateIntInput");
            let input = o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                return true;
            }
            else {
                let aux = value.split("").filter(char => {
                    if (/^[0-9]$/.test(char)) {
                        if (char !== ".") {
                            return true;
                        }
                    }
                }).join("");

                value = aux.substring(0, length);
                input.setValue(value);
                return false;
            }
        },

        resetParameterColors: function () {
            let colors = this.getModel("parameterColors");

            colors.setProperty("/errorValue", new Array(0, colors.getProperty("/middleValueButton")));
            colors.setProperty("/warningValue",
                new Array(colors.getProperty("/middleValueButton"),
                    colors.getProperty("/middleValueTop")));
            colors.setProperty("/successValue", new Array(colors.getProperty("/middleValueTop"), 100));
        },

        liveParameterError: function () {
            let colors = this.getModel("parameterColors");
            let r1 = colors.getProperty("/errorValue")[1];
            let r2 = colors.getProperty("/successValue")[0];

            if (r1 < r2) {
                colors.setProperty("/warningValue", new Array(r1, r2));
            }
            else {
                colors.setProperty("/errorValue",
                    new Array(colors.getProperty("/buttonValue"), colors.getProperty("/warningValue")[0]));
            }

        },

        liveParameterWarning: function () {
            let colors = this.getModel("parameterColors");
            let r1 = colors.getProperty("/warningValue")[0];
            let r2 = colors.getProperty("/warningValue")[1];

            if (r1 < r2) {
                let array = [r1, r2];
                colors.setProperty("/errorValue", new Array(colors.getProperty("/buttonValue"), r1));
                colors.setProperty("/successValue", new Array(r2, colors.getProperty("/topValue")));
            }
            else {
                colors.setProperty("/warningValue",
                    new Array(colors.getProperty("/errorValue")[1], colors.getProperty("/successValue")[0]));
            }

        },

        liveParameterSuccess: function () {
            let colors = this.getModel("parameterColors");
            let r1 = colors.getProperty("/errorValue")[1];
            let r2 = colors.getProperty("/successValue")[0];

            if (r1 < r2) {
                let array = [r1, r2];
                colors.setProperty("/warningValue", array);
                colors.setProperty("/successValue",
                    new Array(colors.getProperty("/successValue")[0], colors.getProperty("/topValue")));
            }
            else {
                colors.setProperty("/successValue",
                    new Array(colors.getProperty("/warningValue")[1], colors.getProperty("/topValue")));
            }

        },


        handleViewSettingsDialogButtonPressed: function (oEvent) {

            if (!this.dialogGoals) {
                this.dialogGoals = sap.ui.xmlfragment("Mantenimiento-escenarios.view.dialogs.Dialog", this);
            }

            let dialog = this.dialogGoals;

            //Botón cancelar:
            sap.ui.getCore().byId("cancelBtn").attachPress(function () {
                dialog.close();
                dialog.destroy();
            });

            //Agregamos como dependiente el dialogo a la vista:
            this.getView().addDependent(dialog);

            //Abrimos el dialogo:
            dialog.open();
        },

        resetFilterItems: function () {
            var aFilterItems = this.dialogGoals.getFilterItems();
            if (sap.ui.getCore().byId("myFilter")._vContentPage !== -1) {
                sap.ui.getCore().byId("myFilter")._vContentPage = 2
                console.log("Un dialogGoals----- ", this.dialogGoals)
                aFilterItems.forEach(function (item) {
                    var aItems = item.getItems();
                    console.log("Un item ----- ", item)
                    aItems.forEach(function (item) {

                        item.setSelected(false);
                    });
                });
            }

        },

        handleConfirm: function (oEvent) {
            let oView = this.getView();
            let oTable = oView.byId("goalsTable");
            let mParams = oEvent.getParameters();
            let oBinding = oTable.getBinding("columns");

            let mdbreed = this.getModel("mdbreed");
            let mdstage = this.getModel("mdstage");
            let goals = this.getModel("goals");
            let mdfilter = this.getModel("filters");
            //debugger;
            console.log(oEvent.getParameters(), oEvent.getSource())
            // apply filters to binding
            // let aFilters = [];
            let cellsFilters = [];
            let aFiltersBreed = [];
            let aFiltersProcess = [];
            jQuery.each(mParams.filterItems, function (i, oItem) {
                let aSplit = oItem.getKey().split("___");
                console.log(aSplit)
                let sPath = aSplit[0];
                let sValue1 = aSplit[1];
                if (sPath == "breed")
                    aFiltersBreed.push(sValue1);
                if (sPath == "process")
                    aFiltersProcess.push(sValue1);
            });

            if (aFiltersBreed.length > 0 || aFiltersProcess.length > 0) {
                if (aFiltersBreed.length <= 0) { //si no hay filtros por razas, se toman todas las existentes
                    mdbreed.getProperty("/records").forEach(item => {
                        aFiltersBreed.push(item.breed_id);
                    });
                }
                if (aFiltersProcess.length <= 0) { //si no hay filtros por razas, se toman todas las existentes
                    mdstage.getProperty("/records").forEach(item => {
                        aFiltersProcess.push(item.process_id);
                    });
                }
            }
            console.log("aFiltersBreed:: ", aFiltersBreed);
            console.log("aFiltersProcess:: ", aFiltersProcess);


            for (var k = 0; k < aFiltersBreed.length; k++) {
                for (var j = 0; j < aFiltersProcess.length; j++) {
                    let str = aFiltersBreed[k].toString() + "___$" + aFiltersProcess[j].toString();
                    // aFilters.push(new Filter("filter_key", 'EQ', str));
                    cellsFilters.push({ path: "filter_key", operator: "EQ", value1: str });
                }
            }

            if (cellsFilters.length > 0) {
                let str = goals.getProperty("/codeColumns");
                // aFilters.push(new Filter("filter_key", 'EQ', str));
                cellsFilters.push({ path: "filter_key", operator: "EQ", value1: str });
            }
            console.log("cellsFilters:: ", cellsFilters);

            // oBinding.filter(aFilters);
            mdfilter.setProperty("/records", cellsFilters);

            // update filter bar
            oView.byId("vsdFilterBar").setVisible(cellsFilters.length > 0);
            oView.byId("vsdFilterLabel").setText(mParams.filterString);
            this.applyFilters2();
            //sap.ui.getCore().byId("myFilter").removeAllFilterItems()
        },

        applyFilters2: function () {
            let oFilters = this.getModel("filters");
            let filters = oFilters.getProperty("/records");

            let goals = this.getModel("goals");
            let oRow = goals.getProperty("/rows");
            let oColums = goals.getProperty("/columns");
            let found = false;


            for (var i = oColums.length - 1; i >= 0; i--) {
                found = filters.find(function (ofilt) {
                    return ofilt.value1 == oColums[i].filter_key;
                });
                oColums[i].visible = ((!found && filters.length > 0) ? false : true);
            }

            oRow.forEach(function (irow, index) {
                for (var i = irow.values.length - 1; i >= 0; i--) {
                    found = filters.find(function (ofilt) {
                        return ofilt.value1 == irow.values[i].filter_key;
                    });
                    irow.values[i].visible = ((!found && filters.length > 0) ? false : true);
                }
            });
            goals.refresh();
        },

        showStatusMaintenance: function () {
            let scenarios = this.getModel("scenarios");
            let records = scenarios.getProperty("/records");
            let budget = this.getModel("budget");

            let oView = this.getView();
            let view = false;
            let text = "";

            if (records.length == 0) {
                text = budget.getProperty("/statusBarText/maintenance/scenariosNoFound");
                view = true;
            }
            else {
                let found = records.find(function (item) {
                    return item.status == 1;
                });
                if (!found) {
                    text = budget.getProperty("/statusBarText/maintenance/activeNoFound");
                    view = true;
                }
                else {
                    if ((scenarios.getProperty("/selectedScenario/scenario_id/") == null ||
                        scenarios.getProperty("/selectedScenario/scenario_id/").toString().trim() == "") ||
                        scenarios.getProperty("/selectedScenario/scenario_id/") != found.scenario_id) {
                        text = budget.getProperty("/statusBarText/maintenance/selectNoFound");
                        view = true;
                    }
                }
            }
            oView.byId("vsdFilterBarMaintenance").setVisible(view);
            oView.byId("vsdFilterLabelMaintenance").setText(text);
        },

        showStatusProductionGoals: function (view) {
            let budget = this.getModel("budget");
            let oView = this.getView();
            let text = budget.getProperty("/statusBarText/ProductionGoals/parameterDayNoFound");

            oView.byId("vsdFilterBarProducctionGoals").setVisible(view);
            oView.byId("vsdFilterLabelProducctionGoals").setText(text);
        },


        forcePushScenarioParameters: async function () {
            var view = this.getView();
            var model = view.getModel("budget");
            var that = this;
            var length_years, length_parameters, length_months;
            var i, j, k, call, data, parameters, element;
            var arrayPush = [];

            if (!model.getProperty("/callFromBudget"))
                var promesa = await this.onBudget();

            length_years = model.getProperty("/NYears");
            //recorre cada año
            for (i = 0; i != length_years; i++) {
                parameters = model.getProperty("/tableDataAllYears/" + i + "/values");
                length_parameters = parameters.length;
                //recorre cada parametro
                for (j = 0; j != length_parameters; j++) {
                    parameters = model.getProperty("/tableDataAllYears/" + i + "/values/" + j + "/values");
                    length_months = parameters.length;
                    //recorre cada mes
                    for (k = 0; k != length_months; k++) // Starts with one added since its first parameter is the parameter
                    {
                        // parameters[k].value = parseFloat(parameters[k].value).toFixed(2)
                        parameters[k].value = parseInt(parameters[k].value);
                        element = {
                            scenario_parameter_id: parameters[k].parameter_id,
                            value: parameters[k].value,
                        };
                        arrayPush.push(element);
                    }
                    model.setProperty("/tableDataAllYears/" + i + "/values/" + j + "/values", parameters); // Reflecting changes from fix floats in model
                }
            }
            console.log("arrayPush");
            // Call Put
            return new Promise((resolve, reject) => {
                var dummy = that.getView().getModel("dummy");
                // var url = dummy.getProperty("/urlService") + "/scenario_param/updateScenariosParameters";
                var url = "/scenario_param/updateScenariosParameters";
                var method = "PUT";
                var data = {
                    "changes": arrayPush
                };

                function putBudget(res) {
                    resolve(res);
                    that.activeGoalsTab();
                }

                function error(err) {
                    console.log("aqui, joven!");
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, putBudget, error, error);
            }).then(() => {
                if (model.getProperty("/callFromBudget")) {
                    MessageToast.show("Parámetros Actulizados", {
                        duration: 4500,
                        width: "35%"
                    });
                    that._forceBudgetEditability(false);
                    that.newBudgetButtons();
                }
            }).catch(() => {
                that._forceBudgetEditability(false);
                that.newBudgetButtons();
            });

        },

        _forceBudgetEditability: function (evalue) {
            var view = this.getView();
            var data = view.getModel("budget");
            var i, j, length, values_length;
            var tableData = data.getProperty("/tableData");

            //Buttons Editable Configuration
            data.setProperty("/edit", false);
            data.setProperty("/cancel", true);
            data.setProperty("/prev", false);
            data.setProperty("/next", false);

            //Save original data before changing it, so if user cancels, we restore the data
            data.setProperty("/tableData_original", JSON.parse(JSON.stringify(data.getProperty("/tableData"))));

            length = tableData.length;
            for (i = 0; i != length; i++) {
                values_length = tableData[i].values.length;
                for (j = 0; j != values_length; j++) {
                    if (!tableData[i].values[j].lock) //If it is not locked, meaning it is an editable value
                        tableData[i].values[j].editable = evalue;
                }
            }
            data.setProperty("/tableData", tableData); //Showing editability
        },

        testFunction: function () {
            console.log("test");
        },

        onScenarioDelete: async function(oEvent){
            let selected = oEvent.getSource().getBindingContext("scenarios").getObject(),
                that = this,
                url = "/scenario",
                method = "DELETE",
                body = {scenario_id: selected.scenario_id};               

                let dialog = new Dialog({
                    title: "Confirmación",
                    type: "Message",
                    content: new Text({
                        text: `Se eliminará el escenario: ${selected.name}`
                    }),
                    beginButton: new Button({
                        text: "Continuar",
                        press: async function () {
                            dialog.close();
                            let res = await that.fetch(url, body, method);
                            if (res.statusCode === 200) {
                                that.onScenario();
                                that.onDialog("Success", "Escenario eliminado con éxito");
                            } else {
                                if(res.statusCode === 409){
                                    that.onDialog('Error', res.msj);

                                }else{
                                    MessageToast.show("Error eliminando el escenario", {
                                        duration: 4500,
                                        width: "35%"
                                    });
                                }
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancelar",
                        press: function () {
                            dialog.close();
                        }
                    }),
                    afterClose: function () {
                        dialog.destroy();
                    }
                });
    
                dialog.open();
        },

        fetch: function(route, body, meth){
            let conf = {
                headers: {
                    "Content-Type": "application/json"
                },
                method: meth,
                body: JSON.stringify(body)
            }
            if(meth === "GET"){
                delete conf["body"]
            }
            return (new Promise((resolve, reject) => {
                fetch(route, conf).then(
                    function (response) {
                        // Examine the text in the response
                        response.json().then(function (data) {
                            resolve(data);
                        });
                    }
                )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            }))
            // isRecords.then((res) => {
            //     return res
            // });
        },

        onDialog: function(state, text){
            var dialog = new Dialog({
              title: "Información",
              type: "Message",
              state: state,
              content: new Text({
                  text: text
              }),
              beginButton: new Button({
                  text: "OK",
                  press: function() {
                      dialog.close();
                  }
              }),
              afterClose: function() {
                  dialog.destroy();
              }
          });
    
          dialog.open();
        },

    });
});