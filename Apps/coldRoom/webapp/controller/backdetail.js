sap.ui.define([
    "coldRoom/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function(BaseController, jQuery, Filter, Fragment, JSONModel, MessageToast, Dialog, Button, Text) {
    "use strict";
    const incubatorStage = 2; /*Clase para levante y Cria*/
    return BaseController.extend("coldRoom.controller.Detail", {

        onInit: function() {
            this.setFragments();
            this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            var oArguments = oEvent.getParameter("arguments");
            this.index = oArguments.id;
            this.enabledTab(false);
            this.onRead(this.index);
        },

        onRead: async function(index) {
            let ospartnership = this.getModel("ospartnership");
            let mdscenario = this.getModel("mdscenario");
            let oView = this.getView();

            oView.byId("tabBar").setSelectedKey("projectTab");
            this.hideButtons(false, false, false, false);

            let partnership_id = ospartnership.getProperty("/records/" + this.index + "/partnership_id");
            let activeS = await this.activeScenario();
            await this.onBreedLoad();
            await this.loadInventory(partnership_id);

            mdscenario.setProperty("/scenario_id", activeS.scenario_id);
            mdscenario.setProperty("/name", activeS.name);

            ospartnership.setProperty("/selectedRecordPath/", "/records/" + index);
            ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));

            let isIncubatorPlant = await this.onIncubatorPlant();
            let mdincubatorplant = this.getModel("mdincubatorplant");

            mdincubatorplant.setProperty("/records", isIncubatorPlant.data);
            if(isIncubatorPlant.data.length>0){
                mdincubatorplant.setProperty("/selectedKey", isIncubatorPlant.data[0].incubator_plant_id);
            }
        },

        validateIntInput: function (o) {
            let input= o.getSource();
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
    
        onChangeIncubator: async function() {
            let mdprogrammed= this.getModel("mdprogrammed");
            sap.ui.getCore().byId("assigned_quantity").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
        },

        onValidProgrammedQuantity: function(o){
            let input= o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) 
            {
                return true;
            }
            else 
            {
                let aux = value
                    .split("")
                    .filter(char => {
                        if (/^[0-9]$/.test(char)) 
                        {
                            if (char !== ".") {
                                return true;
                            }
                        }
                    })
                    .join("");
                value = aux.substring(0, length);
                input.setValue(value);

                let mdprogrammed = this.getModel("mdprogrammed");
                let mdincubator = this.getModel("mdincubator"),
                    residue = mdincubator.getProperty("/residue");
                let selectedMachine = sap.ui.getCore().byId("selectIncubator").getSelectedKey();
                let lot_records = mdprogrammed.getProperty("/lot_records");
                let asig = 0;
                lot_records.forEach(item=>{
                    item.assigned.forEach(item2=>{
                        if (item2.selected_incubator == selectedMachine) 
                        {
                            asig += item2.quantity_eggs;
                        }
                    });
                });

                let array1 = mdincubator.getProperty("/list2");

                var found = array1.find(function(element) {
                    return element.incubator_id == selectedMachine;
                });
                var available = 800;

                if(parseInt(value) <= residue && parseInt(value) <= found.available){
                    mdprogrammed.setProperty("/name/state", "None");
                    mdprogrammed.setProperty("/name/stateText", "");
                    mdprogrammed.setProperty("/confirmBtn", true);

                }else{
                    if (parseInt(value) > residue) {
                        mdprogrammed.setProperty("/name/state", "Error");
                        mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera al saldo");
                        mdprogrammed.setProperty("/confirmBtn", false);
                    }

                    if (parseInt(value) > found.available - asig) {
                        mdprogrammed.setProperty("/name/state", "Error");
                        mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera la disponibilidad de la máquina");
                        mdprogrammed.setProperty("/confirmBtn", false);
                    }
                }
                return false;
            }
        },
        reports: function()
        {
            var mdreports = this.getModel("mdreports");
            let date1 = this.getView().byId("sd").mProperties.value,
                date2 = this.getView().byId("sd2").mProperties.value,
                breed_id = this.getView().byId("breedSelect").getSelectedKey();

            let aDate = date1.split("-"),
                init_date = `${aDate[0]}/${aDate[1]}/${aDate[2]}`;

            let aDate2 = date2.split("-"),
                end_date = `${aDate2[0]}/${aDate2[1]}/${aDate2[2]}`;
            let serverName = "/reports/incubator";

            fetch(serverName, {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    date1: date1,
                    date2: date2,
                    breed_id: breed_id
                })
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            mdreports.setProperty("/records", res.data);
                            if (res.data.length > 0) 
                            {
                                mdreports.setProperty("/reportsBtn", true);
                                mdreports.setProperty("/desde", init_date);
                                mdreports.setProperty("/hasta", end_date);
                                mdreports.setProperty("/visible", true);
                            }
                            else
                            {
                                mdreports.setProperty("/reportsBtn", false);
                                mdreports.setProperty("/visible", false);
                            }
                            resolve(res);
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        generatedCSV: function()
        {
            var mdreports = this.getModel("mdreports").getProperty("/records");
            this.arrayObjToCsv(mdreports);
        },

        arrayObjToCsv: function (ar) {
        //comprobamos compatibilidad
            if(window.Blob && (window.URL || window.webkitURL)){
                var contenido = "",
                    d = new Date(),
                    blob,
                    reader,
                    save,
                    clicEvent;
                //creamos contenido del archivo
                var array = ["Fecha","Lote de Reproducción","Máquina", "Cantidad Asignada", "Cantidad Ejecutada", "Variación Cantidad"];
                for (var i = 0; i < ar.length; i++) {
                    //construimos cabecera del csv
                    if (i == 0)
                        contenido += array.join(";") + "\n";
                    //resto del contenido
                    contenido += Object.keys(ar[i]).map(function(key){
                        return ar[i][key];
                    }).join(";") + "\n";
                }
                //creamos el blob
                blob =  new Blob(["\ufeff", contenido], {type: "text/csv"});
                //creamos el reader
                var reader = new FileReader();
                reader.onload = function (event) {
                //escuchamos su evento load y creamos un enlace en dom
                    save = document.createElement("a");
                    save.href = event.target.result;
                    save.target = "_blank";
                    //aquí le damos nombre al archivo
                    save.download = "salida.csv";
                    try {
                    //creamos un evento click
                        clicEvent = new MouseEvent("click", {
                            "view": window,
                            "bubbles": true,
                            "cancelable": true
                        });
                    } catch (e) {
                    //si llega aquí es que probablemente implemente la forma antigua de crear un enlace
                        clicEvent = document.createEvent("MouseEvent");
                        clicEvent.initEvent("click", true, true);
                    }
                    //disparamos el evento
                    save.dispatchEvent(clicEvent);
                    //liberamos el objeto window.URL
                    (window.URL || window.webkitURL).revokeObjectURL(save.href);
                };
                //leemos como url
                reader.readAsDataURL(blob);
            }else {
            //el navegador no admite esta opción
                alert("Su navegador no permite esta acción");
            }
        },
        /**
       * carga las mquinas incubadoras por plantas
       */
        onIncubatorPlant: function () {

            let util = this.getModel("util"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                that = this;
            let inreal = this.getView().getModel("incubatorRealNew");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findIncPlantByPartnetship");

            return new Promise((resolve, reject) => {
                fetch(serverName, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        partnership_id: partnership_id
                    })
                })
                    .then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                                return;
                            }
                            response.json().then(function (res) {
                                inreal.setProperty("/plantaIncubadora", res.data);
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            });

        },
        activeScenario: function () {

            let util = this.getModel("util"),
                mdscenario = this.getModel("mdscenario"),
                that = this;
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/activeScenario");

            return new Promise((resolve, reject) => {
                fetch(serverName)
                    .then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                                return;
                            }
                            response.json().then(function (res) {
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });

            });
        },
        onPress: async function () {
            debugger;
            let mdprojected = this.getModel("mdprojected");
            let partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            let util = this.getModel("util");
            let incubator_plant_id = this.getView().byId("inventoryTable").getSelectedItem().getBindingContext("mdinventory").getPath();
            let activeS = await this.activeScenario();
            let scenario_id = activeS.scenario_id;
            let scheduled_date = this.getView().byId("scheduled_date").mProperties.value;
            let breed_id = this.getView().byId("breedSelect").getSelectedKey();

            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/calculateIncubator");
          
            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    scenario_id: scenario_id,
                    init_date: scheduled_date,
                    incubator_plant_id: incubator_plant_id,
                    partnership_id: partnership_id,
                    breed_id: breed_id
                })
            })
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                            return;
                        }

                        response.json().then(function (res) {
                            mdprojected.setProperty("/records", res.data);
                            mdprojected.refresh();

                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        onSelectProgrammedRecord: function (oEvent) {
            this.hideButtons(true, true, false, false);

            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdprojected = this.getView().getModel("mdprojected"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                breed_id = this.getView().byId("breedSelect").getSelectedKey(),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");

            //guarda la ruta del registro proyectado que fue seleccionado
            if(oEvent){
                mdprogrammed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
                mdprogrammed.setProperty("/selectedRecord/", mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
                mdprogrammed.setProperty("/selectedRecord/breed_id", parseInt(breed_id));
            }
            let pDate = mdprogrammed.getProperty("/selectedRecord/pdate"),
                aDate = pDate.split("-"),
                minDate = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                date2 = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                maxDate = this.addDays(date2, 7);

            mdprogrammed.setProperty("/selectedRecord/minDate/", minDate);
            mdprogrammed.setProperty("/selectedRecord/maxDate/", maxDate);
            mdprogrammed.setProperty("/selectedRecord/_date/", minDate.getDate() + "/" + ("0" + (minDate.getMonth() + 1)).slice(-2) + "/" + minDate.getFullYear());

            //habilita el tab de la tabla de registros programado
            this.getView().byId("tabBar").setSelectedKey("ktabProgrammed");
            //Buscar los registros de housingway_detail
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findEggsStorageByDateDetail");
            
            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    scenario_id: scenario_id,
                    partnership_id: partnership_id,
                    breed_id: breed_id,
                    incubator_plant_id: mdprogrammed.getProperty("/selectedRecord/incubator_plant_id"),
                    date: mdprogrammed.getProperty("/selectedRecord/posture_date")
                })
            })
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                            return;
                        }
                        response.json().then(function (res) {
                            let records = res.data;

                            records.forEach(item => {
                                item.assigned = [];
                            });
                            mdprogrammed.setProperty("/lot_records", records);
                            mdprogrammed.setProperty("/records", res.records);
                            let isMessageStrip = mdprogrammed.getProperty("/selectedRecord/incubatorList");

                            if (isMessageStrip.length > 0) {
                                mdprogrammed.setProperty("/selectedRecord/showIcon", false);

                            } else {
                                mdprogrammed.setProperty("/selectedRecord/showIcon", true);


                            }
                            let projected_quantity = mdprogrammed.getProperty("/selectedRecord/available");
                            let cantidadAignadaHastaAhoraEggs = 0;
                            res.records.forEach(item => {
                                cantidadAignadaHastaAhoraEggs = cantidadAignadaHastaAhoraEggs + item.eggs;
                            });


                            let residue_programmed = res.available,
                                total = residue_programmed - cantidadAignadaHastaAhoraEggs ;
                  
                            mdprogrammed.setProperty("/selectedRecord/available", total);

                            if (records.length > 0 && !mdprogrammed.getProperty("/selectedRecord/showIcon")) {
                                mdprogrammed.setProperty("/executionSaveBtn", true);
                                if (res.records.length > 0) {
                                    that.hideButtons(true, true, false, false);
                                } else {
                                    that.hideButtons(true, false, false, false);
                                }


                            } else if (res.records.length > 0) {
                                that.hideButtons(false, true, false, false);
                            } else {
                                mdprogrammed.setProperty("/executionSaveBtn", false);
                            }
                            util.setProperty("/busy/", true);
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });

        },
        /**
         * Carga las razas
         */
        onBreedLoad: function () {
            let util = this.getModel("util");
            let serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBreed");
            let inreal = this.getView().getModel("incubatorRealNew");
            let mdbreed = this.getModel("mdbreed");
            mdbreed.setProperty("/records", []);

            let isRecords = new Promise((resolve, reject) => {
                fetch(serverName).then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: ",response.status);
                            return;
                        }
                        // Examine the text in the response
                        response.json().then(function (data) {
                            inreal.setProperty("/breed", data.data);
                            resolve(data);
                        });
                    }
                )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            });
            isRecords.then((res) => {
                if (res.data.length > 0) {
                    mdbreed.setProperty("/records", res.data);
                    mdbreed.setProperty("/value", mdbreed.getProperty("/records/0/breed_id"));
                }
            });
        },

        /**
         * Carga el inventario por incubadora
         */
        loadInventory: function (partnership_id) {
            let mdinventory = this.getModel("mdinventory");
            let util = this.getModel("util");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findInventoryByPartnership");

            fetch(serverName, {
                method: "POST",
                headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
                body: "partnership_id=" + partnership_id
            }).then(
                function (response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status Code: ",response.status);
                        return;
                    }

                    response.json().then(function (res) {
                        if (res.data.length > 0) {
                            mdinventory.setProperty("/records", res.data);
                            mdinventory.setProperty("/records2", res.data2);
                        } else {
                            mdinventory.setProperty("/records", []);
                        }
                        let serverName2 = "/eggsMovements/findInventoryRealByPartnership";
                    
                        fetch(serverName2, {
                            method: "POST",
                            headers: {
                                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                            },
                            body: "partnership_id=" + partnership_id
                        }).then(function (response2) {
                            if (response2.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: ",response.status);
                                return;
                            }
                            response2.json().then(function (res) {
                                if (res.data.length > 0) {
                                    mdinventory.setProperty("/recordsReal", res.data);
                                } else {
                                    mdinventory.setProperty("/recordsReal", []);
                                }
                            });
                        });
                        util.setProperty("/busy/", true);
                    });
                }
            );

        },
        onDialogPressPg: function(oEvent){
            this.formProgrammed = sap.ui.xmlfragment(
                "coldRoom.view.DialogProgrammer", this);
            this.getView().addDependent(this.formProgrammed);
            this.formProgrammed.open();
            let mdprogrammed = this.getModel("mdprogrammed");
            mdprogrammed.setProperty("/enabledTabAssigned", false);
            let date = mdprogrammed.getProperty("/selectedRecord/_date");
            let mdincubator = this.getModel("mdincubator");
            let incubator_plant_id = this.getView().byId("selectIncubatorPlant").getSelectedKey();
            const serverName =  "/incubator/findIncubatorByPlant2";

            fetch(serverName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    incubator_plant_id: incubator_plant_id, 
                    date: date
                })
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            mdincubator.setProperty("/list2", res.data);
                            mdincubator.refresh(true);
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
        },
        onProgrammedCloseDialog: function(){
            this.formProgrammed.close();
            this.formProgrammed.destroy();
        },
        onDialogPressReal: function (oEvent) {
            this.formInventoryReal = sap.ui.xmlfragment(
                "coldRoom.view.DialogNewInventoryReal", this);
            this.getView().addDependent(this.formInventoryReal);
            this.formInventoryReal.open();
            this.getModel("mdprogrammed").setProperty("/enabledTabInvetoryReal", false);
        },
        onInventoryRealCloseDialog: function () {
            this.formInventoryReal.close();
            this.formInventoryReal.destroy();
        },
        onDialogSettingsDisp: function(oEvent){
            this.formSettingsDisp = sap.ui.xmlfragment(
                "coldRoom.view.DialogSettingDisp", this);
            this.getView().addDependent(this.formSettingsDisp);
            this.formSettingsDisp.open();
  
        },
        onSettingsDispCloseDialog: function () {
            this.formSettingsDisp.close();
            this.formSettingsDisp.destroy();
        },
        onDialogPressAssigned: async function(oEvent){
            let mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdincubator = this.getView().getModel("mdincubator"),
                incubator_id = mdprogrammed.getProperty("/selectedRecord/incubatorId"),
                select_paths = oEvent.getSource()._aSelectedPaths[0],
                aSelect_paths = select_paths.split("/"),
                itemSelect = aSelect_paths[1];

            mdprogrammed.setProperty("/programmedSaveDialog", false);

            //habilita el tab de la tabla de registros programado
            mdprogrammed.setProperty("/rProgrammed/enabledTab", true);
            mdprogrammed.setProperty("/enabledTabAssigned", true);
            mdincubator.setProperty("/list", mdprogrammed.getProperty("/selectedRecord/incubatorList") );
            mdincubator.setProperty("/listID", aSelect_paths[2] );

            let lot = mdprogrammed.getProperty("/lot_records/"+ aSelect_paths[2] +"/assigned"),
                residue = 0;
            mdincubator.setProperty("/assigned", lot );
            if(lot.length>0){
                lot.forEach(item=>{
                    residue += parseInt(item.quantity_eggs);
                });
                residue = mdprogrammed.getProperty("/lot_records/"+ aSelect_paths[2]  +"/eggs") - residue;
            }else{
                residue = mdprogrammed.getProperty("/lot_records/"+ aSelect_paths[2]  +"/eggs");
            }

            mdincubator.setProperty("/residue", residue);
            sap.ui.getCore().byId("tabBar2").setSelectedKey("kTabAssigned");
        },
        onTabSelectionAssigned: function(ev){
            var mdprogrammed = this.getModel("mdprogrammed");

            var selectedKey = ev.getSource().getSelectedKey();

            if (selectedKey === "kTabProgrammedD") {
                mdprogrammed.setProperty("/programmedSaveDialog", true);
            }
            if (selectedKey === "kTabAssigned") {
                mdprogrammed.setProperty("/programmedSaveDialog", false);
            }

        },
        onAddIncubator: function(){

            let selected_incubator = sap.ui.getCore().byId("selectIncubator").getSelectedKey(),
                quantity_eggs = sap.ui.getCore().byId("assigned_quantity").mProperties.value,
                mdincubator = this.getView().getModel("mdincubator"),
                mdprogrammed = this.getView().getModel("mdprogrammed");
            let lot = mdprogrammed.getProperty("/lot_records/"+ mdincubator.getProperty("/listID")+"/assigned" ),
                iName = sap.ui.getCore().byId("selectIncubator").getSelectedItem(),
                name = iName.mProperties.text;

            if(lot === undefined){
                lot = [];
            }

            lot.push({
                selected_incubator: parseInt(selected_incubator),
                quantity_eggs: parseInt(quantity_eggs),
                name: name
            });

            let sum_eggs = 0;
            lot.forEach(item=>{
                sum_eggs += parseInt(item.quantity_eggs);
            });
            mdprogrammed.setProperty("/lot_records/"+ mdincubator.getProperty("/listID") +"/assigned", lot );
            mdincubator.setProperty("/assigned", lot );
            let residue = mdprogrammed.getProperty("/lot_records/"+ mdincubator.getProperty("/listID") +"/eggs") - sum_eggs;
            mdincubator.setProperty("/residue" , residue );
            sap.ui.getCore().byId("assigned_quantity").setValue(0);

        },
        onProgrammedSaveDialog: function(){

            let that = this,
                util = this.getModel("util"),
                mdincubator = this.getView().getModel("mdincubator"),
                mdprogrammed = this.getView().getModel("mdprogrammed");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/addprogrammedeggs");

            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    records: mdprogrammed.getProperty("/lot_records"),
                    pdate: mdprogrammed.getProperty("/selectedRecord/pdate"),
                    breed_id: mdprogrammed.getProperty("/selectedRecord/breed_id"),
                    incubator_plant_id: mdprogrammed.getProperty("/selectedRecord/incubator_plant_id")
                })
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            //Si todo esta bien entrar aqui
                            that.formProgrammed.close();
                            that.formProgrammed.destroy();
                            var dialog = new Dialog({
                                title: "Información",
                                type: "Message",
                                state: "Success",
                                content: new Text({
                                    text: "Registros guadrados con éxito."
                                }),
                                beginButton: new Button({
                                    text: "OK",
                                    press: function () {
                                        dialog.close();
                        
                                        mdprogrammed.setProperty("/records", res.data);
                                        mdprogrammed.refresh(true);
                                        let asig =  res.records;
                                        let asigSum = 0;
                                        asig.forEach(item=>{
                                            asigSum += item.eggs;
                                        });
                                        mdprogrammed.setProperty("/selectedRecord/available", mdprogrammed.getProperty("/selectedRecord/available") - asigSum);
                                        mdprogrammed.refresh();
                                        that.hideButtons(true, true, false, false);
                                        that.onSelectProgrammedRecord();
                                        mdincubator.setProperty("/list", res.ava);
                                    }
                                }),
                                afterClose: function() {
                                    dialog.destroy();
                                }
                            });
                            dialog.open();
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });

        },
        hideButtons: function (programmed, execution, real, reports) {

            let mdprogrammed = this.getModel("mdprogrammed");
            let mdreports = this.getModel("mdreports");
            mdprogrammed.setProperty("/programmedNewBtn", programmed);
            mdprogrammed.setProperty("/executionSaveBtn", execution);
            mdprogrammed.setProperty("/executionNewReal", real);
            mdreports.setProperty("/reportsBtn", reports);

        },
        onTabSelection: function (ev) {
            var mdprogrammed = this.getModel("mdprogrammed");
            var mdprojected = this.getModel("mdprojected");
            let mdreports = this.getModel("mdreports");
            let that = this;
            var selectedKey = ev.getSource().getSelectedKey();

            if (selectedKey === "ktabInventory") {
                this.hideButtons(false, false, false, false);
            }
            if (selectedKey === "ktabProjected") {
                this.onPress();
                this.hideButtons(false, false, false, false);
            }
            if (selectedKey === "ktabProgrammed") {
                this.hideButtons(true, true, false, false);
            }
            if (selectedKey === "ktabInventoryReal") {
                let serverName = "/eggsMovements/veriInventaOri/";
                fetch(serverName, {
                    method: "GET",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    }
                }).then(function (response) {
                    if (response.status == 500) {
                        console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                        return;
                    } else {
                        response.json().then(function (res) {
                            if (res.data.length > 0) {
                                that.hideButtons(false, false, false, false);
                            } else {
                                that.hideButtons(false, false, true, false);
                            }
                        });
                    }
                });
            }
            if (selectedKey === "ktabReports") {
                var lo = mdreports.getProperty("/records");
                if (lo.length == 0) {
                    this.hideButtons(false, false, false, false);
                } else {
                    this.hideButtons(false, false, false, true);
                }
            }
        },
        onDialogPressEx: function () {

            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getModel("mdprogrammed"),
                aRecords = mdprogrammed.getProperty("/records"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            let records_programmed = [],
                isValidRecord = true;
            aRecords.forEach(item => {
                if ((item.available == true)) {
                    if (item.execution_quantity) {
                        records_programmed.push(item);
                    }

                    if (!item.execution_quantity) {
                        item.state_quantity = "Error";
                        item.state_text_quantity = "El campo no puede estar en blanco";
                        isValidRecord = false;
                    } else {
                        item.state_quantity = "None";
                        item.state_text_quantity = "";
                    }

                }
            });
            mdprogrammed.refresh(true);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/programmedeggsdetail");

            if (records_programmed.length > 0) {
                //Dialogo para confirmar si esta de acuerdo con lo registrado
                var dialogC = new Dialog({
                    title: "Aviso",
                    type: "Message",
                    content: new Text({
                        text: "¿Desea guardar los cambios?"
                    }),
                    beginButton: new Button({
                        text: "Aceptar",
                        press: function() {
                            fetch(serverName, {
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                method: "PUT",
                                body: JSON.stringify({
                                    records: records_programmed,
                                    stage_id: incubatorStage,
                                    _date: mdprogrammed.getProperty("/selectedRecord/pdate"),
                                    scenario_id: scenario_id,
                                    partnership_id: partnership_id,
                                    breed_id: mdprogrammed.getProperty("/selectedRecord/breed_id"),
                                    incubator_plant_id: mdprogrammed.getProperty("/selectedRecord/incubator_plant_id")
                                })
                            })
                                .then(
                                    function(response) {
                                        if (response.status !== 200) {
                                            console.log("Looks like there was a problem. Status Code: " + response.status);
                                            return;
                                        }
                                        response.json().then(function(res) {
                                            var dialog = new Dialog({
                                                title: "Información",
                                                type: "Message",
                                                state: "Success",
                                                content: new Text({
                                                    text: "Fecha guardada con éxito."
                                                }),
                                                beginButton: new Button({
                                                    text: "OK",
                                                    press: function() {
                                                        mdprogrammed.setProperty("/records", res.records);
                                                        mdprogrammed.refresh();
                                                        dialog.close();
                                                        dialogC.close();
                                                    }
                                                }),
                                                afterClose: function() {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        });
                                    }
                                )
                                .catch(function(err) {
                                    console.log("Fetch Error :-S", err);
                                });
                        }
                    }),
                    endButton: new Button({
                        text: "Cancelar",
                        press: function() {
                            dialogC.close();
                        }
                    }),
                    afterClose: function() {
                        dialogC.destroy();
                    }
                });
                dialogC.open();
                //Fin Dialogo de confirmacion

            } else if (!isValidRecord) {

                this.onToast("Faltan campos");
            } else {
                //No se detectaron cambios
                this.onToast("No de detectaron cambios");
            }

        },
        deleteProgrammedD: function(oEvent){
            let sId = oEvent.getParameters().listItem.sId,
                asId = sId.split("-"),
                idx = asId[asId.length-1],
                mdincubator = this.getModel("mdincubator"),
                mdprogrammed = this.getModel("mdprogrammed"),
                that = this;
            let obj =  mdincubator.getProperty("/assigned/"+idx);

            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Se procedera a eliminar la : " + obj.name
                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        let assigned = mdincubator.getProperty("/assigned/");
                        assigned.splice(idx, 1);
                        mdprogrammed.setProperty("/lot_records/" + mdincubator.getProperty("/listID") + "/assigned", assigned);
                        mdincubator.setProperty("/assigned/", assigned);
                        let sum_eggs = 0;
                        assigned.forEach(item => {
                            sum_eggs += parseInt(item.quantity_eggs);
                        });
                        let residue = mdprogrammed.getProperty("/lot_records/" + mdincubator.getProperty("/listID") + "/eggs") - sum_eggs;
                        mdincubator.setProperty("/residue", residue);
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

        pruebaERP: function(){
            return new Promise((resolve, reject) => {
                fetch("/farm/erp", {
                    method: "GET",
                })
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                                return;
                            }
                            response.json().then(function(res) {
                                resolve(res);
                            });
                        }
                    )
                    .catch(function(err) {
                        console.log("Fetch Error :-S", err);
                    });
            });
        },

        onParameterBreed: function() {

            let util = this.getModel("util"),
                mdparameter_breed = this.getModel("mdparameter_breed"),
                that = this;

            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findProcessBreedByStage");
            return new Promise((resolve, reject) => {
                fetch(serverName, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: "stage_id=" + liftBreedingStage
                })
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                                return;
                            }
                            response.json().then(function(res) {
                                resolve(res);
                            });
                        }
                    )
                    .catch(function(err) {
                        console.log("Fetch Error :-S", err);
                    });
            });

        },

        processInfo: function() {
            let util = this.getModel("util"),
                mdprocess = this.getModel("mdprocess"),
                that = this;
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findProcessByStage");
            return new Promise((resolve, reject) => {
                fetch(serverName, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: "stage_id=" + liftBreedingStage
                })
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                                return;
                            }
                            response.json().then(function(res) {
                                resolve(res);
                            });
                        }
                    )
                    .catch(function(err) {
                        console.log("Fetch Error :-S", err);
                    });
            });

        },
        findProjected: function() {
            let util = this.getModel("util"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findHousingByStage");
            return new Promise((resolve, reject) => {
                fetch(serverName, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: "stage_id=" + liftBreedingStage + "&partnership_id=" + partnership_id + "&scenario_id=" + scenario_id
                })
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                                return;
                            }

                            response.json().then(function(res) {
                                resolve(res);
                            });
                        }
                    )
                    .catch(function(err) {
                        console.log("Fetch Error :-S", err);
                    });
            });
        },
        activeScenario: function() {
            let util = this.getModel("util"),
                mdscenario = this.getModel("mdscenario"),
                that = this;
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/activeScenario");

            return new Promise((resolve, reject) => {
                fetch(serverName)
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " + response.status);
                                return;
                            }
                            response.json().then(function(res) {
                                resolve(res);
                            });
                        }
                    )
                    .catch(function(err) {
                        console.log("Fetch Error :-S", err);
                    });

            });
        },
        handleValueHelp: function(oEvent) {
            var sInputValue = oEvent.getSource().getValue();

            this.inputId = oEvent.getSource().getId();
            // create value help dialog
            if (!this._valueHelpDialog) {
                this._valueHelpDialog = sap.ui.xmlfragment(
                    "liftBreedingProgram.view.maintenance.Dialog",
                    this
                );
                this.getView().addDependent(this._valueHelpDialog);
            }
            this._valueHelpDialog.open(sInputValue);
        },

        _handleValueHelpSearch: function(evt) {
            var sValue = evt.getParameter("value");
            var oFilter = new Filter(
                "Name",
                sap.ui.model.FilterOperator.Contains, sValue
            );
            evt.getSource().getBinding("items").filter([oFilter]);
        },

        _handleValueHelpClose: function(evt) {
            var oSelectedItem = evt.getParameter("selectedItem");
            if (oSelectedItem) {
                var productInput = this.getView().byId(this.inputId);
                productInput.setValue(oSelectedItem.getTitle());
            }
            evt.getSource().getBinding("items").filter([]);
        },
        addDays: function(ndate, ndays) {
            ndate.setDate(ndate.getDate() + ndays);
            return ndate;
        },
        onDialogPressPj: function(oEvent) {
            this.formProjected = sap.ui.xmlfragment(
                "liftBreedingPlanningM.view.DialogProject", this);
            this.getView().addDependent(this.formProjected);
            this.formProjected.open();
        },

        onProyectedCloseDialog: function(oEvent) {
            this.formProjected.close();
            this.formProjected.destroy();
        },

        onProjectedSaveDialog: function(oEvent) {

            let that = this,
                util = this.getModel("util"),
                mdprojected = this.getModel("mdprojected"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                breed_id = sap.ui.getCore().byId("breedSelect").getSelectedKey(),
                pDate = sap.ui.getCore().byId("projected_date").mProperties.dateValue,
                projected_quantity = sap.ui.getCore().byId("projected_quantity").mProperties.value,
                projected_date = `${pDate.getFullYear()}-${pDate.getMonth()+1}-${pDate.getDate()}`;
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/housingway");

            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: "stage_id=" + liftBreedingStage + "&partnership_id=" + partnership_id + "&scenario_id=" + scenario_id + "&projected_quantity=" + projected_quantity +
            "&projected_date=" + projected_date + "&breed_id=" + breed_id + "&predecessor_id=0"
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                response.status);
                            return;
                        }
                        response.json().then(function(res) {
                            that.formProjected.close();
                            that.formProjected.destroy();
                            var dialog = new Dialog({
                                title: "Información",
                                type: "Message",
                                state: "Success",
                                content: new Text({
                                    text: "Semana guardada con éxito."
                                }),
                                beginButton: new Button({
                                    text: "OK",
                                    press: function() {
                                        dialog.close();
                                        that.onProjectedSave();
                                    }
                                }),
                                afterClose: function() {
                                    dialog.destroy();
                                }
                            });
                            dialog.open();
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        onProjectedSave: async function () {

            let mdprojected = this.getModel("mdprojected"),
                mdprogrammed = this.getModel("mdprogrammed"),
                findScenario = await this.findProjected();

            mdprogrammed.setProperty("/rProgrammed/enabledTab", false);
            mdprogrammed.setProperty("/records", []);
            this.getView().byId("projectedTable").removeSelections();
            mdprojected.setProperty("/records", findScenario.data);
        },

        onChangeShed: async function () {
            let mdshed = this.getModel("mdshed"),
                selectedShed = sap.ui.getCore().byId("selectShed").getSelectedKey();
            mdshed.setProperty("/selectedKey", selectedShed);
        },

        onChangeFarm: async function () {
            let mdfarm = this.getModel("mdfarms"),
                selectedFarm = sap.ui.getCore().byId("selectFarm").getSelectedKey();
            mdfarm.setProperty("/selectedKey", selectedFarm);
            let findShed = await this.findShedByFarm(selectedFarm),
                mdshed = this.getModel("mdshed");

            mdshed.setProperty("/records", findShed.data);
        },

        findShedByFarm: function (selectedFarm) {
            let util = this.getModel("util"),
                mdshed = this.getModel("mdshed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findShedsByFarm");

            return new Promise((resolve, reject) => {
                fetch(serverName, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },

                    body: "farm_id=" + selectedFarm
                })
                    .then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                              response.status);
                                return;
                            }
                            response.json().then(function (res) {
                                console.log(res);
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            });
        },

        handleTitleSelectorPress: function (oEvent) {
            var _oPopover = this._getResponsivePopover();
            _oPopover.setModel(oEvent.getSource().getModel());
            _oPopover.openBy(oEvent.getParameter("domRef"));
        },

        _getResponsivePopover: function () {
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("liftBreedingPlanningM.view.Popover", this);
                this.getView().addDependent(this._oPopover);
            }
            return this._oPopover;
        },

        onFarmLoad: function () {
            const util = this.getModel("util"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findFarmByPartAndStatus"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/selectedRecord/").partnership_id;
            let osfarm = this.getModel("mdfarms"),
                that = this;
            osfarm.setProperty("/records", []);
            let isRecords = new Promise((resolve, reject) => {
                fetch(serverName, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: "partnership_id=" + partnership_id + "&status_id=3"
                })
                    .then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                              response.status);
                                return;
                            }
                            // Examine the text in the response
                            response.json().then(function (res) {
                                //seleccionar la primera granja
                                if (res.data.length > 0) {
                                    osfarm.setProperty("/selectedKey", res.data[0].farm_id);
                                }
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            });
            isRecords.then((res) => {
                if (res.data.length > 0) {
                    osfarm.setProperty("/records", res.data);
                }
            });
        },
        handleDelete: function (oEvent) {
            let sId = oEvent.getParameters().listItem.sId,
                asId = sId.split("-"),
                idx = asId[asId.length - 1],
                mdprogrammed = this.getModel("mdprogrammed"),
                that = this;
            let obj =  mdprogrammed.getProperty("/records/"+idx);
            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Se procedera a eliminar el lote: " + obj.lot_incubator
                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        that.deleteProgrammed(obj.lot_incubator);
                        dialog.close();
           
                        /*Aqui se hace la modificacion para eliminar cuando se esta insertando uno nuevo*/
                        let mdincubator = that.getView().getModel("mdincubator"),
                            arr = mdincubator.getProperty("/assigned");

                        arr.splice(idx, 1);
                        mdincubator.setProperty("/assigned", arr);  
                        /*hasta aqui*/
                    }
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function() {
                    dialog.destroy();
                }
            });
            dialog.open();
        },

        deleteProgrammed: async function(lot_incubator) {
            var that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getModel("mdprogrammed"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/deleteProgrammedStorage"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                incubator_plant_id = this.getView().byId("selectIncubatorPlant").getSelectedKey(),
                activeS = await this.activeScenario(),
                scenario_id = activeS.scenario_id,
                scheduled_date = mdprogrammed.getProperty("/selectedRecord/_date"),
                breed_id = this.getView().byId("breedSelect").getSelectedKey();

            fetch(serverName, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: "lot_incubator=" + lot_incubator
                  +"&scenario_id=" + scenario_id
                  +"&date="+ scheduled_date
                  +"&incubator_plant_id="+ incubator_plant_id
                  +"&partnership_id="+ partnership_id
                  +"&breed_id="+ breed_id
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " + response.status);
                            response.json().then(
                                function(resp){
                                    MessageToast.show(resp.msg);
                                });
                            return;
                        }
                        response.json().then(function(res) {
                            let records = res.data;

                            records.forEach(item=>{
                                item.assigned = [];
                            });

                            mdprogrammed.setProperty("/lot_records", records);
                            mdprogrammed.setProperty("/records", res.records);
                            let isMessageStrip  = mdprogrammed.getProperty("/selectedRecord/incubatorList");

                            if(isMessageStrip.length>0){
                                mdprogrammed.setProperty("/selectedRecord/showIcon", false);

                            }else{
                                mdprogrammed.setProperty("/selectedRecord/showIcon", true);


                            }

                            let residue_programmed = res.available,
                                projected_quantity = mdprogrammed.getProperty("/selectedRecord/available");
                            mdprogrammed.setProperty("/selectedRecord/available", residue_programmed);
                            mdprogrammed.refresh();

                            if (records.length > 0 && !mdprogrammed.getProperty("/selectedRecord/showIcon")) {
                                mdprogrammed.setProperty("/executionSaveBtn", true);

                                if (res.records.length > 0) {
                                    that.hideButtons(true, true, false, false);
                                } else {
                                    that.hideButtons(true, false, false, false);
                                }
                            } else if (res.records.length > 0) {
                                that.hideButtons(false, true, false, false);
                            } else {
                                mdprogrammed.setProperty("/executionSaveBtn", false);
                            }
                            util.setProperty("/busy/", true);
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        toSap: function () {
            var dialogToSap = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Se procedera a sincronizar: Incubadora"
                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        fetch("/synchronization/syncIncubadora", {
                            method: "GET"
                        }).then(dialogToSap.close());
                    }
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () {
                        dialogToSap.close();
                    }
                }),
                afterClose: function () {
                    dialogToSap.destroy();
                }
            });
            dialogToSap.open();
        },
        onIngresoEgresos: function (oEvent) {
            let oView= this.getView();
            this.enabledTab(true);
            oView.byId("tabBar").setSelectedKey("tabIngreso");
        },
        validateFloatInput: function (o) {
            let input = o.getSource();
            let floatLength = 10,
                intLength = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^([0-9]{1,${intLength}})([.][0-9]{0,${floatLength}})?$/`);
            if (regex.test(value)) {
                input.setValueState("None");
                input.setValueStateText("");
                return true;
            } else {
                let pNumber = 0;
                let aux = value
                    .split("")
                    .filter(char => {
                        if (/^[0-9.]$/.test(char)) {
                            if (char !== ".") {
                                return true;
                            } else {
                                if (pNumber === 0) {
                                    pNumber++;
                                    return true;
                                }
                            }
                        }
                    })
                    .join("")
                    .split(".");
                value = aux[0].substring(0, intLength);

                if (aux[1] !== undefined) {
                    value += "." + aux[1].substring(0, floatLength);
                }
                input.setValue(value);
                return false;
            }
        },

        onInvRealSaveDialog: function (oEvent) {
            let that = this,
                util = this.getModel("util"),
                incubatorRealNew = this.getModel("incubatorRealNew"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                breed_id = sap.ui.getCore().byId("SelectBreed").getSelectedKey(),
                incub_id = sap.ui.getCore().byId("SelectIncubadora").getSelectedKey(),
                pDate = sap.ui.getCore().byId("NewInvetaryR_date").mProperties.dateValue,
                lot = sap.ui.getCore().byId("Lote").mProperties.value,
                EggsC = sap.ui.getCore().byId("Eggs").mProperties.value;
            let serverName = "/eggsMovements/addMovementOriginal/";

            if (this._validRecord()) {
                fetch(serverName, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        partnership_id: partnership_id,
                        scenario_id: scenario_id,
                        breed_id: breed_id,
                        incub_id: incub_id,
                        pDate: pDate,
                        lot: lot,
                        EggsC: EggsC
                    })
                }).then(function (response) {
                    if (response.status == 500) {
                        console.log("Looks like there was a problem. Status Code: " +
                            response.status);
                        return;
                    } else {
                        response.json().then(function (res) {
                            that.formInventoryReal.close();
                            that.formInventoryReal.destroy();
                            var dialog = new Dialog({
                                title: "Información",
                                type: "Message",
                                state: "Success",
                                content: new Text({
                                    text: "Inventario Original Insertado con Exito"
                                }),
                                beginButton: new Button({
                                    text: "OK",
                                    press: function () {
                                        that.loadInventory(partnership_id);
                                        that.hideButtons(false, false, false, false);
                                        dialog.close();
                                    }
                                }),
                                afterClose: function () {
                                    dialog.destroy();
                                }
                            });
                            dialog.open();
                        });
                    }
                });
            }
        },
        _validRecord: function () {
            var FechaReal = this.getView().getModel("FechaReal"),
                LoteReal = this.getView().getModel("LoteReal"),
                EggsReal = this.getView().getModel("EggsReal"),
                flag = true,
                pDate = sap.ui.getCore().byId("NewInvetaryR_date").mProperties.dateValue,
                lot = sap.ui.getCore().byId("Lote").mProperties.value,
                EggsC = sap.ui.getCore().byId("Eggs").mProperties.value;

            if (pDate == null) {
                flag = false;
                FechaReal.setProperty("/state", "Error");
                FechaReal.setProperty("/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                FechaReal.setProperty("/state", "None");
                FechaReal.setProperty("/stateText", "");
            }

            if (lot === "") {
                flag = false;
                LoteReal.setProperty("/state", "Error");
                LoteReal.setProperty("/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                LoteReal.setProperty("/state", "None");
                LoteReal.setProperty("/stateText", "");
            }

            if (EggsC === "") {
                flag = false;
                EggsReal.setProperty("/state", "Error");
                EggsReal.setProperty("/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                EggsReal.setProperty("/state", "None");
                EggsReal.setProperty("/stateText", "");
            }

            return flag;
        },

        enabledTab: function(enab) {
            this.getView().byId("tabIngreso").setEnabled(enab);
        },

        searchEntry: async function (oEvent) {
            let sId = oEvent.getSource().sId.substring(36, oEvent.getSource().sId.length);
            let mdinventorySelect =   this.getModel("mdinventory").getProperty("/selecterInventartio");
            let mdegresoIngresoAjustes = this.getModel("mdegresoIngresoAjustes");
            let mdinventory = this.getModel("mdinventory").getProperty("/records2");
            let obj = this.getModel("mdinventory").getProperty("/selecterInventartio");
            let date1, date2;
            let recordIngreso = mdegresoIngresoAjustes.getProperty("/RecordIngresos");
            let recordEgreso = mdegresoIngresoAjustes.getProperty("/RecordEgresos");
            let recordAjuste = mdegresoIngresoAjustes.getProperty("/RecordAjustes");
            let that = this;
            if (sId == "IngresoButton") {
                date1 = this.getView().byId("dayparam1").mProperties.value;
                date2 = this.getView().byId("dayparam2").mProperties.value;
            } else {
                if (sId == "EgresosButton") {
                    date1 = this.getView().byId("dayparam3").mProperties.value;
                    date2 = this.getView().byId("dayparam4").mProperties.value;
                } else {
                    if (sId == "AjustesButton") {
                        date1 = this.getView().byId("dayparam5").mProperties.value;
                        date2 = this.getView().byId("dayparam6").mProperties.value;
                    }
                }
            }

            let aDate = date1.split("-"),
                init_date = `${aDate[1]}-${aDate[0]}-${aDate[2]}`;

            let aDate2 = date2.split("-"),
                end_date = `${aDate2[1]}-${aDate2[0]}-${aDate2[2]}`;

            let elementefing = [];

            let i = 0,
                j = 0;
            let band = true;
            let dateEggs = new Date();
            let dayparm1 = new Date(date1);
            let dayparm2 = new Date(date2);
            let LaCopia = [];
            let servername = "/incubator_plant/incubatorStatus";

            fetch(servername, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    incubator_plant_id: mdinventorySelect.id
                })
            }).then(  function (StatusRespo) {
          
                if (StatusRespo.status == 500) {
                    console.log("Looks like there was a problem. Status Code: " + StatusRespo.status);
                } else {
                    StatusRespo.json().then(async function (StatusDisp) {
                        if (sId == "IngresoButton") {
                            mdegresoIngresoAjustes.setProperty("/desde", init_date);
                            mdegresoIngresoAjustes.setProperty("/hasta", end_date);
                        } else {
                            if (sId == "EgresosButton") {
                                mdegresoIngresoAjustes.setProperty("/desdeEgreso", init_date);
                                mdegresoIngresoAjustes.setProperty("/hastaEgreso", end_date);
                            } else {
                                if (sId == "AjustesButton") {
                                    mdegresoIngresoAjustes.setProperty("/desdeAjuste", init_date);
                                    mdegresoIngresoAjustes.setProperty("/hastaAjuste", end_date);
                                }
                            }
                        }
                        while (i < mdinventory.length && band) {
                            if (obj.name == mdinventory[i].name) {
                                band = false;
                                if (sId == "IngresoButton") {
                                    if (StatusDisp.data[0].acclimatized) {
                                        mdinventory[i].acc.forEach(function (element) {
                                            let aDate = element["init_date"].split("/"),
                                                init_date = `${aDate[1]}/${aDate[0]}/${aDate[2]}`;
                                            dateEggs = new Date(init_date);
                                            if (dateEggs >= dayparm1 && dateEggs <= dayparm2) {
                                                element[element.length + 1] = ("acc");
                                                var found = recordIngreso.find(function(element2) {
                                                    return element2.eggs_storage_id == element.eggs_storage_id;
                                                }); 
                                                LaCopia = JSON.parse(JSON.stringify(element));
                                                if (found != undefined) {
                                                    LaCopia.newEggs = found.quantity;
                                                    LaCopia.newDate = found.fecha_movements;
                                                    LaCopia.available = false;
                                                }else{
                                              
                                                    LaCopia.available = true;
                                                }
                                                LaCopia.end_date =  `${dateEggs.getDate()}/${dateEggs.getUTCMonth()+1}/${dateEggs.getFullYear()}`;
                                                LaCopia.newDate;
                                                LaCopia.newEggs;
                                                elementefing.push(LaCopia);
                                            }
                                        });
                                    }

                                    if (StatusDisp.data[0].suitable) {
                                        mdinventory[i].app.forEach(function (element) {
                                            let aDate = element["init_date"].split("/"),
                                                end_date = `${aDate[1]}/${aDate[0]}/${aDate[2]}`;
                                            dateEggs = new Date(end_date);
                                            if (dateEggs >= dayparm1 && dateEggs <= dayparm2) {
                                                element[element.length + 1] = ("app");
                                                var found = recordIngreso.find(function(element2) {
                                                    return element2.eggs_storage_id == element.eggs_storage_id;
                                                }); 
                                                LaCopia = JSON.parse(JSON.stringify(element));
                                                if (found != undefined) {
                                                    LaCopia.newEggs = found.quantity;
                                                    LaCopia.newDate = found.fecha_movements;
                                                    LaCopia.available = false;
                                                }else{
                                              
                                                    LaCopia.available = true;
                                                }
                                                LaCopia.end_date =  `${dateEggs.getDate()}/${dateEggs.getUTCMonth()+1}/${dateEggs.getFullYear()}`;
                                                LaCopia.newDate;
                                                LaCopia.newEggs;
                                  
                                                elementefing.push(LaCopia);
                                            }
                                        });
                                    }
                                    if (StatusDisp.data[0].expired) {
                                        mdinventory[i].exp.forEach(function (element) {
                                            let aDate = element["init_date"].split("/"),
                                                end_date = `${aDate[1]}/${aDate[0]}/${aDate[2]}`;
                                            dateEggs = new Date(end_date);
                                            if (dateEggs >= dayparm1 && dateEggs <= dayparm2) {
                                                element[element.length + 1] = ("exp");
                                                var found = recordIngreso.find(function(element2) {
                                                    return element2.eggs_storage_id == element.eggs_storage_id;
                                                }); 
                                                LaCopia = JSON.parse(JSON.stringify(element));
                                                if (found != undefined) {
                                                    LaCopia.newEggs = found.quantity;
                                                    LaCopia.newDate = found.fecha_movements;
                                                    LaCopia.available = false;
                                                }else{
                                              
                                                    LaCopia.available = true;
                                                }
                                                LaCopia.end_date =  `${dateEggs.getDate()}/${dateEggs.getUTCMonth()+1}/${dateEggs.getFullYear()}`;
                                                LaCopia.newDate;
                                                LaCopia.newEggs;
                                          
                                                elementefing.push(LaCopia);
                                            }
                                        });
                                    }
                                }
                            }
                            i++;
                        }

                        if (sId == "EgresosButton") {
                            that.functionFindEgreso(dayparm1,dayparm2);
                        }
                      
                        if (sId == "AjustesButton") {
                            that.functionFindAjuste(dayparm1,dayparm2);
                        }
                        if (elementefing != undefined) {
                            if (elementefing.length > 0) {
                                if (sId == "IngresoButton") {
                                    mdegresoIngresoAjustes.setProperty("/Ingresos", elementefing);
                                }
                            } else {
                                if (sId == "IngresoButton") {
                                    mdegresoIngresoAjustes.setProperty("/Ingresos", "");
                                }
                            }
                        }
                    });
                }
            });
             
        },
    });
});
