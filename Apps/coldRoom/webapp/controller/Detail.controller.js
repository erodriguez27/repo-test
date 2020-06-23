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
    const stateSucess = "Success";
    const stateError = "Error";
    const limitInt = 2147483640;
    const limitRows = 2000;
    const limitDiferencial = 720; 
    const limitPlexus = 720; //Preguntar esto, porque no estaba definido asi que explotaba

    return BaseController.extend("coldRoom.controller.Detail", {
        onInit: function() {
            this.setFragments();
            this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            let oView= this.getView();
            var oArguments = oEvent.getParameter("arguments");
            let ospartnership = this.getModel("ospartnership");
            let mdinventory = this.getModel("mdinventory");
            this.enabledTab({entry: false, egress: false});
            oView.byId("tabBar").setSelectedKey("projectTab");
            oView.byId("projectTable").removeSelections();
            this.hideButtons(false, false, false, false);
            oView.byId("IngresoTable").addEventDelegate({
                onAfterRendering: oEvent =>{
                }
            });

            if(ospartnership.getProperty("/records").length>0){
                let partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id");
                this.onRead(partnership_id);
            } else {
                this.reloadPartnership().then(data => {
                    if (data.length > 0) {
                        let obj = ospartnership.getProperty("/selectedRecords/");
                        if (obj) {
                            this.onRead(obj.partnership_id);
                        } else {
                            MessageToast.show("no existen empresas cargadas en el sistema", {
                                duration: 3000,
                                width: "20%"
                            });
                            console.error("err:", data);
                        }
                    } else{
                        MessageToast.show("ha ocurrido un error al cargar el inventario", {
                            duration: 3000,
                            width: "35%"
                        });
                        console.log("err: ", data);
                    }
                });
            } 
        },

        onRead: async function(partnership_id) {
            let mdscenario = this.getModel("mdscenario");
            let activeS = await this.activeScenario();

            mdscenario.setProperty("/scenario_id", activeS.scenario_id);
            await this.loadInventory(partnership_id, activeS.scenario_id);
            mdscenario.setProperty("/name", activeS.name);
        },

        reloadPartnership: function(){
            let util = this.getModel("util");
            let ospartnership = this.getModel("ospartnership");

            util.setProperty("/busy/", true);
            ospartnership.setProperty("/records", []);

            let url = util.getProperty("/serviceUrl") +util.getProperty("/" + util.getProperty("/service") + "/getPartnership");
            let method = "GET";
            let data = {};
            return new Promise((resolve, reject) => {
                function getPartnership(res) {
                    util.setProperty("/busy/", false);
                    ospartnership.setProperty("/records/", res.data);
                    if(res.data.length>0){
                        let obj= res.data[0];
                        obj.index= 0;
                        ospartnership.setProperty("/selectedRecords/", obj);
                        ospartnership.setProperty("/name", obj.name);
                        ospartnership.setProperty("/address", obj.address);
                    }
                    resolve(res.data);
                }

                function error(err) {
                    console.log("Error en reloadPartnership ------> ",err);
                    ospartnership.setProperty("/selectedRecords/", []);
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                    reject(err);
                }
                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, getPartnership, error, error);
            });
        },

        changeDate: function (oEvent) {
            var oDP = oEvent.getSource();
            var bValid = oEvent.getParameter("valid");
            this._iEvent++;

            if (bValid) {
                oDP.setValueState(sap.ui.core.ValueState.None);
            } else {
                oDP.setValueState(sap.ui.core.ValueState.Error);
            }
        },

        formatDate: function (date) {
            if (date!== null) {
                let c= "/"; //caracter separatos

                date = new Date(date.toString());

                if (!isNaN(date.getFullYear())) {
                    date = (((date.getDate() < 10) ? "0" + date.getDate() : date.getDate()) + c +
                        ((date.getMonth() + 1 < 10) ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + c +
                        date.getFullYear());
                } else {
                    date = null;
                }
            }

            return (date);
        },

        constructDate: function(date){
            if(date!==null){
                date= new Date(date.toString());
                if(!(typeof date.getMonth === "function"))
                    date= null;
            }
            return(date);
        },

        constructDateWithFormat: function(date){
            if(date!==null){
                date= new Date(date.toString());
                if(!(typeof date.getMonth === "function"))
                    date= null;
            }
            return(date);
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
        validateIntEntry: function (o) {
            let input= o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);
            let obj = o.getSource().getBindingContext("mdinventory").getObject();

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
                if(value>(parseInt(obj.eggs_executed)+parseInt(limitDiferencial))){
                    obj.stateQuantity="Error";
                    obj.stateTextQuantity="La cantidad ejecutada no debe superar la cantidad permitida ("+(parseInt(obj.eggs_executed) +parseInt(limitDiferencial))+")";
                    console.log(obj)
                    console.log("input: ----",o.getSource().getBindingContext("mdinventory").getObject())
                }else{
                    obj.stateQuantity="None";
                    obj.valueStateText="";
                    console.log("input: ----",o.getSource().getBindingContext("mdinventory").getObject())
                }
                return false;
            }
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

        onValidAdjustedQuantity: function(o){
            let input= o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                return true;
            } else {
                let aux = value.split("").filter(char => {
                    if (/^[0-9]$/.test(char)) {
                        if (char !== ".") {
                            return true;
                        }
                    }
                }).join("");

                value = aux.substring(0, length);
                input.setValue(value);

                let mdinventory= this.getModel("mdinventory"),
                    path = mdinventory.getProperty("/selectedRecordPath"),
                    quan = mdinventory.getProperty("/MinimunAmount"),
                    obj = mdinventory.getProperty(path),
                    quantity = parseInt(limitPlexus + quan);

                if (parseInt(value) > 0) {
                    if (parseInt(value) <= quantity) {
                        mdinventory.setProperty("/name/state", "None");
                        mdinventory.setProperty("/name/stateText", "");
                        mdinventory.setProperty("/confirmBtn", true);
                    } else {
                        if (parseInt(value) > quantity) {
                            mdinventory.setProperty("/name/state", "Error");
                            console.log("change");
                            mdinventory.setProperty("/name/stateText", "La cantidad ingresada supera el límite ("+quantity+")");
                            mdinventory.setProperty("/confirmBtn", false);
                        }
                    }
                } else {
                    mdinventory.setProperty("/name/state", "Error");
                    mdinventory.setProperty("/name/stateText", "La cantidad ingresada debe ser mayor a cero");
                    mdinventory.setProperty("/confirmBtn", false);
                }

                return false;
            }
        },

        onValidEgressQuantity: function(o){
            let input= o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                return true;
            } else {
                let aux = value.split("").filter(char => {
                    if (/^[0-9]$/.test(char)) {
                        if (char !== ".") {
                            return true;
                        }
                    }
                }).join("");

                value = aux.substring(0, length);
                input.setValue(value);

                let mdinventory= this.getModel("mdinventory"),
                    path = mdinventory.getProperty("/selectedRecordPath"),
                    SelectedItem = mdinventory.getProperty("/entry/selectRecord"),
                    lmt = 0,
                    egress = mdinventory.getProperty("/egress/records");

                egress.forEach(element => {
                    lmt = parseInt(lmt) + parseInt(element.quantity);
                });

                lmt = parseInt(SelectedItem.quantity) - parseInt(lmt);

                if(parseInt(value) > 0) {
                    if (parseInt(value) <= lmt){
                        mdinventory.setProperty("/name/state", "None");
                        mdinventory.setProperty("/name/stateText", "");
                        mdinventory.setProperty("/confirmBtn", true);
                    } else {
                        if (parseInt(value) > lmt) {
                            mdinventory.setProperty("/name/state", "Error");
                            mdinventory.setProperty("/name/stateText", "La cantidad ingresada supera el límite ("+lmt+")");
                            mdinventory.setProperty("/confirmBtn", false);
                        }
                    }
                } else {
                    mdinventory.setProperty("/name/state", "Error");
                    mdinventory.setProperty("/name/stateText", "La cantidad ingresada debe ser mayor a cero");
                    mdinventory.setProperty("/confirmBtn", false); 
                }

                return false;
            }
        },

        activeScenario: function () {
            let that= this;
            let util = this.getModel("util");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/activeScenario");
            return new Promise((resolve, reject) => {
                fetch(serverName)
                    .then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +response.status);
                                that.openDialog(stateError, "Ha ocurrido un error.");
                                return;
                            }
                            response.json().then(function (res) {
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                        that.openDialog(stateError, "Ha ocurrido un error.");
                    });
            });
        },
        /**
     * Carga el inventario por incubadora
     */
        loadInventory: function (partnership_id, scenario_id) {
            let mdprojected = this.getModel("mdprojected");
            let util = this.getModel("util");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findProjectEggs");
            //esto se cambia despues de aclararlo
            let aclimatized= 3;
            let suitable1= 3;
            let suitable2= 100;
            let expired= 100;
            let that = this

            util.setProperty("/busy/", true);
            fetch(serverName, {
                method: "POST",
                headers: {"Content-type": "application/json; charset=UTF-8"},
                body: JSON.stringify({
                    partnership_id: partnership_id,
                    aclimatized: aclimatized,
                    suitable1: suitable1,
                    suitable2: suitable2,
                    rangeExpired: expired,
                    scenario_id: scenario_id
                })
            }).then(
                function (response) {
                    util.setProperty("/busy/", false);
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status Code: ",response.status);
                        that.openDialog(stateError, "Ha ocurrido un error.");
                        return;
                    }
                    else{
                        response.json().then(function (res) {
                            if (res.data.length > 0) {
                                mdprojected.setProperty("/records", res.data);
                            } else {
                                mdprojected.setProperty("/records", []);
                            }
                        });
                    }
                }
            );
        },

        hideAllButtons: function(){
            let mdinventory= this.getModel("mdinventory");
            mdinventory.setProperty("/entry/viewEntrySave", false),
            mdinventory.setProperty("/entry/entryNew", false);
            mdinventory.setProperty("/entry/egressNew", false);
        },

        hideButtons: function (programmed, execution, real, reports) {
        },

        onTabSelection: function (ev) {
            var mdinventory = this.getModel("mdinventory");
            var ospartnership = this.getModel("ospartnership");
            var selectedKey = ev.getSource().getSelectedKey();
            let obj= ospartnership.getProperty("/selectedRecords/"), 
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");

            this.hideAllButtons();
            if (selectedKey === "projectTab") {
                this.hideAllButtons();
                this.loadInventory(obj.partnership_id, scenario_id);
                this.getView().byId("projectTable").removeSelections();
                this.getView().byId("IngresoTable").removeSelections();
                this.enabledTab({entry: false, egress: false});
            }

            if (selectedKey === "tabIngreso") {
                // this.hideAllButtons();
                this.getModel("mdinventory").setProperty("/origin/key", null);
                this.getView().byId("IngresoTable").removeSelections();
                this.viewEntryBtns();
                // this.getModel("mdinventory").setProperty("/entry/entryNew", true);
                // this.loadLots();
                // this.loadLotsEntry()
                this.changeOrigin();
                this.enabledTab({entry: true, egress: true});
            }

            if (selectedKey === "tabEgreso") {
            // this.hideAllButtons();
                // this.loadLots();
                this.resetEgressFilters();
                mdinventory.setProperty("/entry/selectRecord", {});
                mdinventory.setProperty("/entry/entryNew", false);
                mdinventory.setProperty("/entry/egressNew", true);
                mdinventory.setProperty("/entry/viewEntrySave", false);
                mdinventory.setProperty("/egress/viewEgressDate", false);

                this.enabledTab({entry: true, egress: true});
            }else{
                mdinventory.setProperty("/egress/egressNew", false);
            }
        
        },

        enabledTab: function(obj) {
            this.getView().byId("tabIngreso").setEnabled(obj.entry);
            this.getView().byId("tabEgreso").setEnabled(obj.egress);
        },

    
        onSelectProject: function (oEvent) {
            let oView= this.getView();
            let mdinventory= this.getModel("mdinventory");
            let mdprojected= this.getModel("mdprojected");
            let objProjected= oEvent.getSource().getSelectedItem().getBindingContext("mdprojected").getObject();
        
            mdprojected.setProperty("/selectedRecords", objProjected);
            //limpiar entradas
            // this.loadLots();
            this.loadLotsEntry();
            mdinventory.setProperty("/entry/records", []);
            // mdinventory.setProperty("/entry/entryNew", true);
            oView.byId("entryDesde").setValue("");
            oView.byId("entryHasta").setValue("");
        
            // this.showEntryBtns(true)
        
            this.enabledTab({entry: true, egress: true});
            this.getModel("mdinventory").setProperty("/origin/key", null);
            oView.byId("tabBar").setSelectedKey("tabIngreso");
        },

        onSelectEntry: function(oEvent){
            let oView= this.getView();
            let mdinventory= this.getModel("mdinventory");
            let objEntry= oEvent.getSource().getSelectedItem().getBindingContext("mdinventory").getObject();
            console.log("el object: ", objEntry)
            if(objEntry.available){
                MessageToast.show("No se puede consultar un ingreso no ejecutado", {
                    duration: 3000,
                    width: "20%"
                });
                this.getView().byId("IngresoTable").removeSelections();
            } else {
            //limpiar entradas
                this.resetEgressFilters();
                //cargar los primeros 10
                mdinventory.setProperty("/entry/selectRecord", objEntry);
                mdinventory.setProperty("/minE", objEntry.fecha_movements);
                mdinventory.setProperty("/entry/viewEntrySave", false);
                mdinventory.setProperty("/egress/viewEgressDate", true);
                mdinventory.setProperty("/egress/egressNew", true);
                mdinventory.setProperty("/entry/entryNew", false);
                this.getMovementsByEntry(objEntry);
                // this.loadLots()
                this.enabledTab({entry: true, egress: true});
                oView.byId("tabBar").setSelectedKey("tabEgreso");
            }
        },
   
        searchEntry: async function (oEvent) {
            let that = this;
            let mdinventory= this.getModel("mdinventory");
            let mdprojected= this.getModel("mdprojected");
            let ospartnership= this.getModel("ospartnership");
            let objProjected= mdprojected.getProperty("/selectedRecords");
            let init_date = this.getView().byId("entryDesde").mProperties.value;
            let end_date = this.getView().byId("entryHasta").mProperties.value;
            let scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
            let slot = this.getView().byId("filterLotEntry").getSelectedKey();
            let util = this.getModel("util");
            this.getView().byId("IngresoTable").removeSelections();
            //resetSearch
            mdinventory.setProperty("/entry/records", []);
            mdinventory.setProperty("/entry/objectSearch", {});
            console.log(slot)
            util.setProperty("/busy", true);
            if (slot!=="Todos"){
                init_date="asd"
                end_date="asd"
            }
            if (init_date === null || init_date== "" || end_date === null || end_date== "" ){
                MessageToast.show("No se pueden consultar fechas vacías", {
                    duration: 3000,
                    width: "20%"
                });
                util.setProperty("/busy/", false);
            }
            else{
                let descip = this.getView().byId("filterOriginEntry").getSelectedKey("");
                if(descip==="Compra"||descip==="Plexus"){
                    slot= (slot.toLowerCase()=="todos")? null: slot;
                    console.log(slot)
                    let objSearch
                    if (slot === null) {
                    objSearch={
                        partnership_id: ospartnership.getProperty("/selectedRecords/partnership_id"),
                        incubator_plant_id: objProjected.incubator_plant_id,
                        init_date: init_date,
                        end_date: end_date,
                        slot: slot,
                        scenario_id: scenario_id
                    }}else{
                        objSearch={
                            partnership_id: ospartnership.getProperty("/selectedRecords/partnership_id"),
                            incubator_plant_id: objProjected.incubator_plant_id,
                            init_date: null,
                            end_date: null,
                            slot: slot,
                            scenario_id: scenario_id
                        }
                    }
                    let server = (descip==="Compra")?"/coldRoom/findEntryEggs2":"/coldRoom/findEntryEggsPlexus";
                    console.log(server)
                    console.log(objSearch)
                    fetch(server, {
                        method: "POST",
                        headers: {"Content-type": "application/json; charset=UTF-8"},
                        body: JSON.stringify(objSearch)
                    }).then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: ",response.status);
                                that.openDialog(stateError, "Ha ocurrido un error.");
                                return;
                            }
                            else{
                                response.json().then(function (res) {
                                    if (res.data.length > 0) {

                                        mdinventory.setProperty("/entry/records", res.data);
                                        mdinventory.setProperty("/entry/objectSearch", objSearch);
                                        mdinventory.setProperty("/compra",true);
                                        mdinventory.setProperty("/curva",false);
                                        let records= mdinventory.getProperty("/entry/records");
                                        records.forEach(item=>{
                                            item.stateQuantity= "None";
                                            item.stateTextQuantity= "";
                                            item.stateFecha_movements= "None";
                                            item.stateTextFecha_movements= "";

                                            item.fecha_movements= that.formatDate(item.fecha_movements);

                                            item.oldQuantity= item.quantity;
                                            item.oldFecha_movements= item.fecha_movements;
                                        });
                                        mdinventory.refresh();
                                        that.viewEntryBtns();
                                    } else {
                                        mdinventory.setProperty("/entry/records", []);
                                        mdinventory.setProperty("/entry/objectSearch", {});
                                        that.viewEntryBtns();
                                    }
                                });
                            }
                            util.setProperty("/busy/", false);
                        }
                    );
                }else{
                    init_date= new Date(init_date);
                    end_date= new Date(end_date);
                    slot= (slot.toLowerCase()=="todos")? null: slot;
                    console.log(slot)
                    let objSearch
                    if (slot === null) {
                    objSearch={
                        partnership_id: ospartnership.getProperty("/selectedRecords/partnership_id"),
                        incubator_plant_id: objProjected.incubator_plant_id,
                        init_date: init_date,
                        end_date: end_date,
                        slot: slot,
                        scenario_id: scenario_id
                    }}else{
                        objSearch={
                            partnership_id: ospartnership.getProperty("/selectedRecords/partnership_id"),
                            incubator_plant_id: objProjected.incubator_plant_id,
                            init_date: null,
                            end_date: null,
                            slot: slot,
                            scenario_id: scenario_id
                        }
                    }


                    let serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findEntryEggs");
                    console.log(serverName)
                   
                    fetch(serverName, {
                        method: "POST",
                        headers: {"Content-type": "application/json; charset=UTF-8"},
                        body: JSON.stringify(objSearch)
                    }).then(
                        function (response) {

                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: ",response.status);
                                that.openDialog(stateError, "Ha ocurrido un error.");
                                return;
                            }
                            else{
                                response.json().then(function (res) {
                                    if (res.data.length > 0) {
                                        let ajusteButton= new Button ();
                                        ajusteButton = that.getView().byId("ajusteButton");
                                        // console.log(ajusteButton);
                                        // console.log("data entry:: ", res.data);
                                        mdinventory.setProperty("/entry/records", res.data);
                                        mdinventory.setProperty("/postureVisible", true);
                                        mdinventory.setProperty("/entry/objectSearch", objSearch);
                                        mdinventory.setProperty("/compra",false);
                                        mdinventory.setProperty("/curva",true);
                                        mdinventory.refresh(true);
                                        let records= mdinventory.getProperty("/entry/records");
                                        records.forEach(item=>{
                                            item.stateQuantity= "None";
                                            item.stateTextQuantity= "";
                                            item.stateFecha_movements= "None";
                                            item.stateTextFecha_movements= "";

                                            item.fecha_movements= that.formatDate(item.fecha_movements);

                                            item.oldQuantity= item.quantity;
                                            item.oldFecha_movements= item.fecha_movements;
                                        });
                                        mdinventory.refresh();
                                        that.viewEntryBtns();
                                    } else {
                                        mdinventory.setProperty("/entry/records", []);
                                        mdinventory.setProperty("/entry/objectSearch", {});
                                        that.viewEntryBtns();
                                    }
                                });
                            }
                            util.setProperty("/busy/", false);
                        }
                    );
                }

            }
            this.getView().byId("IngresoTable").removeSelections();
            
        },

        searchEgress: async function (oEvent) {
            let that = this;
            let mdinventory= this.getModel("mdinventory");
            let mdprojected= this.getModel("mdprojected");
            let init_date = this.getView().byId("egressDesde").mProperties.value;
            let end_date = this.getView().byId("egressHasta").mProperties.value;
            let slot = this.getView().byId("filterLotEgress").getSelectedKey();
            let scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getModel("ospartnership").getProperty("/selectedRecords/partnership_id");
        
            //resetSearch
            mdinventory.setProperty("/egress/objectSearch", {});
        
            if (init_date === null || init_date== "" || end_date === null || end_date== ""){
                MessageToast.show("No se pueden consultar fechas vacías", {
                    duration: 3000,
                    width: "20%"
                });
            }
            else{
                init_date= new Date(init_date);
                end_date= new Date(end_date);
                slot= (slot.toLowerCase()=="todos")? null: slot;
            
                let util = this.getModel("util");
                let serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/getOutMovementsForDate");
                util.setProperty("/busy/", true);
            
                let name= mdprojected.getProperty("/selectedRecords/name");
                let objEntry= mdinventory.getProperty("/entry/selectRecord");
                let eggs_storage_id= (Object.keys(objEntry).length === 0)? null : objEntry.eggs_storage_id;
                let objSearch={//objeto de busquedad
                    eggs_storage_id: eggs_storage_id,
                    init_date: init_date,
                    end_date: end_date,
                    type_movements: "egreso",
                    slot: slot,
                    scenario_id: scenario_id,
                    partnership_id: partnership_id
                };
                fetch(serverName, {
                    method: "POST",
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                    body: JSON.stringify({
                        eggs_storage_id: objEntry.eggs_storage_id,
                        type_movements: "egreso",
                        init_date: init_date,
                        end_date: end_date,
                        slot: slot,
                        scenario_id: scenario_id,
                        partnership_id : partnership_id
                    })
                }).then(
                    function (response) {
                        util.setProperty("/busy/", false);
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: ",response.status);
                            that.openDialog(stateError, "Ha ocurrido un error.");
                            return;
                        }
                        else{
                            response.json().then(function (res) {
                                if (res.data.length > 0) {
                                    res.data.forEach(item =>{
                                        item.name= name;
                                    });
                                    mdinventory.setProperty("/egress/records", res.data);
                                    mdinventory.setProperty("/egress/objectSearch", objSearch);
                                    mdinventory.refresh();
                                } else {
                                    mdinventory.setProperty("/egress/records", []);
                                    mdinventory.setProperty("/egress/objectSearch", {});
                                }
                            });
                        }
                    }
                );
            }     
        },

        onDialogPressEx: function(){
            let mdinventory= this.getModel("mdinventory");
            let util= this.getModel("util");
            let entryList= mdinventory.getProperty("/entry/records");
            let newEntry=[];
            let flagError= false;

            //util.setProperty("/busy",true);
            entryList.forEach(function(item){
                if( (item.quantity!== null && item.quantity!="" )|| (item.fecha_movements!== null && item.fecha_movements!="" )){//almenos uno es distinto de null
                    console.log(item, flagError)
                    if( (item.quantity!== null && item.quantity!="" )&& (item.fecha_movements!== null && item.fecha_movements!="" )){//ambos son distintos de null
                    //si se detectan cambios
                        if(item.stateFecha_movements!=="Error"){
                            if( (item.quantity!= item.oldQuantity)||(item.fecha_movements!= item.oldFecha_movements)){
                            // if(item.quantity> item.eggs_executed){
                                // debugger;
                                if(parseInt(item.quantity)!==0){
                                    
                                    if((parseInt(item.quantity)> limitInt) || (parseInt(item.quantity)> (item.eggs_executed +limitDiferencial)) ) {
                                        flagError=true;
                                        item.stateQuantity= "Error";
                                        item.stateTextQuantity= "La cantidad ejecutada no debe superar la cantidad permitida ("+(parseInt(item.eggs_executed) +parseInt(limitDiferencial))+")";
                                    }
                                    else{
                                    // debugger;
                                        item.stateQuantity= "None";
                                        item.stateTextQuantity= "";
                                        item.stateFecha_movements= "None";
                                        item.stateTextFecha_movements= "";
                                        let dateMov= item.fecha_movements;
                                        newEntry.push({
                                            eggs_storage_id: item.eggs_storage_id,
                                            quantity: item.quantity,
                                            fecha_movements: new Date(item.fecha_movements),
                                            lot: item.lot,
                                            type_movements: "ingreso"
                                        });
                                    }
                                }else{
                                    flagError=true;
                                    item.stateQuantity= "Error";
                                    item.stateTextQuantity= "La cantidad ingresada debe ser mayor a cero";

                                }
                            }
                        }else{
                            item.stateFecha_movements= "Error";
                            item.stateTextFecha_movements= "No puede ser inferior a la fecha proyectada";
                        }
                        
                    }else {//uno solo es distinto de null
                        flagError=true;
                        //si la cantidad ejecutada es el campo null
                        if( (item.quantity== null)){
                            item.stateQuantity= "Error";
                            item.stateTextQuantity= "Ambos campos de ejecucion deben ser llenados";
                        }
                        //si la fecha ejecutada es el campo null
                        if( (item.fecha_movements== null)){
                            item.stateFecha_movements= "Error";
                            item.stateTextFecha_movements= "Ambos campos de ejecucion deben ser llenados";
                        }
                    }
                }else{
                    item.stateQuantity= "None";
                    item.stateTextQuantity= "";
                    item.stateFecha_movements= "None";
                    item.stateTextFecha_movements= "";
                }
            });
            mdinventory.refresh();

            if(!flagError||newEntry.length>0){
                if(newEntry.length>0){
                    console.log('update', newEntry)
                
                    this.updateEntryColdRoom(newEntry);
                }else{
                    MessageToast.show("No se detectaron cambios", {
                        duration: 3000,
                        width: "20%"
                    });
                }
            }
            else{
                MessageToast.show("Se han ingresados valores incorrectos o incompletos", {
                    duration: 3000,
                    width: "20%"
                });
            }
            //util.setProperty("/busy",false);

        },

        updateEntryColdRoom: function(records){
            try{
                let that = this;
                let mdinventory= this.getModel("mdinventory");
                let util = this.getModel("util");
                let serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/addEntryEggs");
                util.setProperty("/busy/", true);
                fetch(serverName, {
                    method: "POST",
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                    body: JSON.stringify({
                        records: records,
                        objSearch: mdinventory.getProperty("/entry/objectSearch")
                    })
                }).then(
                    function (response) {
                        util.setProperty("/busy/", false);
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: ",response.status);
                            that.openDialog(stateError, "Ha ocurrido un error.");
                            return;
                        }
                        else{
                            response.json().then(function (res) {
                                if (res.data.length > 0) {
                                    mdinventory.setProperty("/entry/records", res.data);
                                    let records= mdinventory.getProperty("/entry/records");
                                    records.forEach(item=>{
                                        item.stateQuantity= "None";
                                        item.stateTextQuantity= "";
                                        item.stateFecha_movements= "None";
                                        item.stateTextFecha_movements= "";
                                        item.fecha_movements= that.formatDate(item.fecha_movements);
                                        item.oldQuantity= item.quantity;
                                        item.oldFecha_movements= item.fecha_movements;
                                    });
                                    mdinventory.refresh();
                                    that.viewEntryBtns();
                                } else {
                                    mdinventory.setProperty("/entry/records", []);
                                    that.viewEntryBtns();
                                }
                            });
                            that.openDialog(stateSucess, "Ejecución guardada con éxito.");
                       
                        }
                    }
                );
            }catch(err){
                console.log("err: ", err);
                this.openDialog(stateError, "Ha ocurrido un error.");
            }
        },

        getMovementsByEntry: function(objEntry){
            try{
                let that = this;
                let mdinventory= this.getModel("mdinventory");
                let util = this.getModel("util");
                let descip = this.getView().byId("filterOriginEntry").getSelectedKey("");
                let serverName = (descip==="Plexus")?"/coldRoom/getMovementsPlexusByEntry":util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/getMovementsByEntry");
                
                console.log(serverName);

                //resetSearch
                mdinventory.setProperty("/egress/records", []);
                mdinventory.setProperty("/egress/objectSearch", {});

                util.setProperty("/busy/", true);
                console.log(serverName);
                fetch(serverName, {
                    method: "POST",
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                    body: JSON.stringify({
                        eggs_storage_id: (descip==="Plexus")?objEntry.lot:objEntry.eggs_storage_id,
                         lot: objEntry.lot,
                        type_movements: "egreso"
                    })
                }).then(
                    function (response) {
                        util.setProperty("/busy/", false);
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: ",response.status);
                            that.openDialog(stateError, "Ha ocurrido un error.");
                            return;
                        }
                        else{
                            response.json().then(function (res) {
                            // debugger;
                                if (res.data.length > 0) {
                                    let sumEgress=0;
                                    res.data.forEach(item =>{
                                        item.name= objEntry.name;
                                        item.lot= objEntry.lot;
                                        sumEgress+= item.quantity;
                                    });
                                    mdinventory.setProperty("/egress/records", res.data);
                                    let ajus= objEntry.ajustes,
                                        sum = 0;
                                    ajus.forEach(element => {
                                        sum = parseInt(sum)+parseInt(element.quantity);
                                    });
                                    mdinventory.setProperty("/egress/egressBalance", parseInt (objEntry.quantity)+ parseInt (sum)- parseInt( sumEgress));
                                    mdinventory.refresh();
                                    console.log(mdinventory);

                                
                                
                                } else {
                                    mdinventory.setProperty("/egress/records", []);
                                    mdinventory.setProperty("/egress/egressBalance",objEntry.quantity);
                                }
                            });
                        }
                    }
                );
            }catch(err){
                console.log("err: ", err);
                this.openDialog(stateError, "Ha ocurrido un error.");
            }
        },

         viewEntryBtns: function(){
        // debugger;
            let mdinventory= this.getModel("mdinventory");
            let origin =  this.getView().byId("filterOriginEntry").getSelectedKey()

            mdinventory.setProperty("/entry/entryNew",origin==="Compra");
            mdinventory.setProperty("/entry/viewEntrySave", ((mdinventory.getProperty("/entry/records").length>0)&&(origin==="Curva de postura")));
        },

        openDialog: function(state, msj){
            let dialog = new Dialog({
                title: "Información",
                type: "Message",
                state: state,
                content: new Text({
                    text: msj
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

        loadLots: function(){
            try{
                let that = this;
                let mdlot= this.getModel("mdlot");
                let mdprojected= this.getModel("mdprojected");
                let mdinventory= this.getModel("mdinventory");
                let util = this.getModel("util");
                let scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
                let serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/getAllLots");
                let objProjected= mdprojected.getProperty("/selectedRecords");

                //resetRecords
                mdlot.setProperty("/records", []);
                mdlot.setProperty("/selectRecords/entry", {});

                util.setProperty("/busy/", true);
                fetch(serverName, {
                    method: "POST",
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                    body: JSON.stringify({
                        incubator_plant_id: objProjected.incubator_plant_id,
                        scenario_id: scenario_id
                    })
                }).then(function (response) {
                    util.setProperty("/busy/", false);
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status code:", response.status);
                        that.openDialog(stateError, "Ha ocurrido un error.");
                        return;
                    } else {
                        response.json().then(function (res) {
                            if (res.data.length > 0) {
                                res.data.unshift({
                                    lot: "Todos",
                                    total: 0
                                });

                                mdlot.setSizeLimit (res.data.length+1);
                                mdlot.setProperty("/records", res.data);
                                //reset filter lot for entry
                                let slot= mdinventory.getProperty("/entry/objectSearch/slot");
                                slot= (slot=== undefined || slot== null || slot=="")? "Todos" : slot;
                                mdlot.setProperty("/selectRecords/entry", {lot: slot} );
                            
                                //reset filter lot for egress
                                slot= mdinventory.getProperty("/egress/objectSearch/slot");
                                slot= (slot=== undefined || slot== null || slot=="")? "Todos" : slot;
                                mdlot.setProperty("/selectRecords/egress", {lot: slot} );
                            } else {
                                mdlot.setProperty("/records", [{
                                    lot: "Todos",
                                    total: 0
                                }]);
                                mdlot.setProperty("/selectRecords/entry", {});
                            }
                        });
                    }
                });
            }catch(err){
                console.log("err:", err);
                this.openDialog(stateError, "Ha ocurrido un error.");
            }
        },

        loadLotsEntry: function(){
            try{
                let that = this;
                let mdlot= this.getModel("mdlot");
                let mdprojected= this.getModel("mdprojected");
                let mdinventory= this.getModel("mdinventory");
                let util = this.getModel("util");
                let serverName = "/coldRoom/getLots";
                let objProjected= mdprojected.getProperty("/selectedRecords");
                let origin =  this.getView().byId("filterOriginEntry").getSelectedKey();
                let scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
                let prefix;

                switch(origin){
                case "Curva de postura":
                    prefix="H";
                    break;
                case "Compra":
                    prefix="A";
                    break;
                case "Plexus":
                    prefix="X";
                    break;
                }

                console.log(serverName);

                //resetRecords
                mdlot.setProperty("/records", []);
                mdlot.setProperty("/selectRecords/entry", {});

                util.setProperty("/busy/", true);
                fetch(serverName, {
                    method: "POST",
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                    body: JSON.stringify({
                        incubator_plant_id: objProjected.incubator_plant_id,
                        prefix: prefix, 
                        scenario_id: scenario_id
                    })
                }).then(function (response) {
                // debugger;
                    util.setProperty("/busy/", false);
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status Code: ",response.status);
                        that.openDialog(stateError, "Ha ocurrido un error.");
                        return;
                    } else {
                        response.json().then(function (res) {
                        // debugger;
                            if (res.data.length > 0) {
                                res.data.unshift({
                                    lot: "Todos",
                                    total: 0
                                });
                                mdlot.setSizeLimit (res.data.length+1);
                                mdlot.setProperty("/records", res.data);
                                //reset filter lot for entry
                                let slot= mdinventory.getProperty("/entry/objectSearch/slot");
                                slot= (slot=== undefined || slot== null || slot=="")? "Todos" : slot;
                                // mdlot.setProperty("/selectRecords/entry", {lot: slot} );
                            
                                //reset filter lot for egress
                                slot= mdinventory.getProperty("/egress/objectSearch/slot");
                                slot= (slot=== undefined || slot== null || slot=="")? "Todos" : slot;
                                // mdlot.setProperty("/selectRecords/egress", {lot: slot} );
                            } else {
                                mdlot.setProperty("/records", [{
                                    lot: "Todos",
                                    total: 0
                                }]);
                                mdlot.setProperty("/selectRecords/entry", {});
                            }
                        });
                    }
                });
            } catch (err) {
                console.log("err: ", err);
                this.openDialog(stateError, "Ha ocurrido un error.");
            }
        },

        resetEgressFilters: function () {
            let mdinventory= this.getModel("mdinventory");
            let mdlot= this.getModel("mdlot");

            this.getView().byId("egressDesde").setValue("");
            this.getView().byId("egressHasta").setValue("");
            mdinventory.setProperty("/egress/records", []);
            mdlot.setProperty("/selectRecords/egress", {lot: null} );
        },

        onDialogAjuste: function(oEvent) {
            let id = oEvent.getSource().oPropagatedProperties.oBindingContexts.mdinventory.sPath,
                mdinventory = this.getModel("mdinventory"),
                selected = mdinventory.getProperty(id),
                obj = mdinventory.getProperty(id);

            mdinventory.setProperty("/selectedRecordPath",id);
            mdinventory.setProperty("/entryDate",obj.oldFecha_movements);
            let selectedItem = {
                key: "Plexus",
                name: "Plexus"
            };
        
            this.formAjuste = sap.ui.xmlfragment(
                "coldRoom.view.DialogAjuste", this);
            var that = this;
            var dlg = sap.ui.getCore().byId("dialogAjuste");
            dlg.attachAfterClose(function () {
                that.formAjuste.destroy();
            });
            this.getView().addDependent(this.formAjuste);
            this.formAjuste.open();
        },
        onDialogAjusteEgress: function(oEvent) {

            let mdinventory = this.getModel("mdinventory"),
                obj = mdinventory.getProperty("/entry/selectRecord");

            mdinventory.setProperty("/egressDate",obj.oldFecha_movements);
            this.formAjusteEgress = sap.ui.xmlfragment(
                "coldRoom.view.egress.DialogAjuste", this);
            var that = this;
            var dlg = sap.ui.getCore().byId("dialogAjusteEgress");
            dlg.attachAfterClose(function () {
                that.formAjusteEgress.destroy();
            });
            this.getView().addDependent(this.formAjusteEgress);
            this.formAjusteEgress.open();
        },
        onCloseDialogAjusteEgress:function(){
            this.getView().getModel("mdinventory").setProperty("/stateFecha_movements", "None");
            this.getView().getModel("mdinventory").setProperty("/name/state", "None");
            sap.ui.getCore().byId("ajuste_quantityE").setValue(null);
            this.getView().getModel("mdinventory").setProperty("/egressDate", "");
            this.formAjusteEgress.close();
            this.formAjusteEgress.destroy();
        },

        onSaveDialogAjusteEgress: function () {
            let oDatePicker = sap.ui.getCore().byId("date_ajusteE");
            let fecha_movements = oDatePicker.getValue();
            let oInput = sap.ui.getCore().byId("ajuste_quantityE");
            let quantity = oInput.getValue();
            let oSelect = sap.ui.getCore().byId("descriptionSelectE"); //Validar esto, si es "" entonces no guardar y marcar error
            let description = oSelect.getSelectedKey(); //Validar esto, si es "" entonces no guardar y marcar error
            // ====================================================================================
            let newEntry = [];
            let mdinventory = this.getModel("mdinventory");
            let SelectedItem = mdinventory.getProperty("/entry/selectRecord");
            let egress = mdinventory.getProperty("/egress/records");
            let pDate = fecha_movements.split("-");
            let ndate = `${pDate[0]}/${pDate[1]}/${pDate[2]}`;
            let stateFecha_movements = mdinventory.getProperty("/stateFecha_movements");
            let residue_quantity = 0;

            if (stateFecha_movements !== "Error" && (quantity !== "0" || quantity !== "") && description !== "") {
                newEntry.push({
                    eggs_storage_id: SelectedItem.eggs_storage_id,
                    quantity: quantity,
                    fecha_movements: fecha_movements,
                    lot: SelectedItem.lot,
                    type_movements: "egreso",
                    description_adjustment: description
                });

                this.updateAdjustEgressColdRoom(newEntry);
                sap.ui.getCore().byId("date_ajusteE").setValue(null);
                sap.ui.getCore().byId("ajuste_quantityE").setValue(null);
                this.getView().getModel("mdinventory").setProperty("/stateFecha_movements", "None");
                this.getView().getModel("mdinventory").setProperty("/name/state", "None");
                //Al recibir la respuesta despues de guardar hacemos esto para cerrar el dialog
                this.formAjusteEgress.close();
                mdinventory.setProperty("/selectedRecordPath","");
                this.formAjusteEgress.destroy();
            } else {
                if (fecha_movements === "") {
                    mdinventory.setProperty("/stateFecha_movements", "Error");
                    mdinventory.setProperty("/stateTextFecha_movements", "Debe indicar fecha del ajuste");
                }

                if (quantity === "0" || quantity === "") {
                    mdinventory.setProperty("/name/state", "Error");
                    mdinventory.setProperty("/name/stateText", "Debe indicar cantidad del ajuste");
                }

                if (description === "") {
                    oSelect.setValueState("Error");
                    oSelect.setValueStateText("Debe indicar descripción del ajuste")
                }

                MessageToast.show("Falta llenar algunos campos", {
                    duration: 3000,
                    width: "20%"
                });
            }  
        },

        onCloseDialogAjuste: function () {
            this.getView().getModel("mdinventory").setProperty("/stateFecha_movements", "None");
            this.getView().getModel("mdinventory").setProperty("/name/state", "None");
            sap.ui.getCore().byId("date_ajuste").setValue(null);
            sap.ui.getCore().byId("ajuste_quantity").setValue("");

            this.formAjuste.close();
            this.formAjuste.destroy();
        },

        changeDescription:function(oEvent){
            let select = oEvent.getSource();

            select.setValueState("None");
            select.setValueStateText("");
        },

        onCloseDialogNew: function () {
            this.formNew.close();
            this.formNew.destroy();
        },

        onSaveDialogAjuste: function () {
            let oDatePicker = sap.ui.getCore().byId("date_ajuste");
            let fecha_movements = oDatePicker.getValue();
            let oInput = sap.ui.getCore().byId("ajuste_quantity");
            let quantity = oInput.getValue();
            let oSelect = sap.ui.getCore().byId("descriptionSelect");
            let description = oSelect.getSelectedKey();
            // ====================================================================================
            let newEntry = [];
            let mdinventory = this.getModel("mdinventory");
            let selected_path = mdinventory.getProperty("/selectedRecordPath");
            let SelectedItem = mdinventory.getProperty(selected_path);
            let pDate = fecha_movements.split("/");
            let ndate = this.formatDate(fecha_movements);
            let stateFecha_movements = mdinventory.getProperty("/stateFecha_movements");

            if (stateFecha_movements !== "Error" && (quantity !== "0" || quantity !== "") && description !== "") {
                newEntry.push({
                    eggs_storage_id: SelectedItem.eggs_storage_id,
                    quantity: quantity,
                    fecha_movements: ndate,
                    lot: "X",
                    type_movements: "ingreso",
                    description_adjustment: description
                });

                this.updateAdjustEntryColdRoom(newEntry);
                this.formAjuste.close();
                mdinventory.setProperty("/selectedRecordPath","");
                this.formAjuste.destroy();
                mdinventory.setProperty("/stateFecha_movements", "None");
                mdinventory.setProperty("/name/state", "None");
                sap.ui.getCore().byId("date_ajuste").setValue(null);
            } else {
                if (fecha_movements === "") {
                    mdinventory.setProperty("/stateFecha_movements", "Error");
                    mdinventory.setProperty("/stateTextFecha_movements", "Debe indicar fecha del ajuste");
                }

                if (quantity === "0" || quantity === "") {
                    mdinventory.setProperty("/name/state", "Error");
                    mdinventory.setProperty("/name/stateText", "Debe indicar cantidad del ajuste");
                }

                if (description === "") {
                    oSelect.setValueState("Error");
                    oSelect.setValueStateText("Debe indicar descripción del ajuste");
                }

                MessageToast.show("Falta llenar algunos campos", {
                    duration: 3000,
                    width: "20%"
                });
            }
        },

        updateAdjustEntryColdRoom: function (records) {
            try{
                let that = this;
                let mdinventory= this.getModel("mdinventory");
                let util = this.getModel("util");
                let serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/addEntryEggs");

                util.setProperty("/busy/", true);
                fetch("/coldRoom/addAdjustEntryEggs", {
                    method: "POST",
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                    body: JSON.stringify({
                        records: records,
                        objSearch: mdinventory.getProperty("/entry/objectSearch")
                    })
                }).then(
                    function (response) {
                        util.setProperty("/busy/", false);
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status code:", response.status);
                            that.openDialog(stateError, "Ha ocurrido un error.");
                            return;
                        } else {
                            response.json().then(function (res) {
                                if (res.data.length > 0) {
                                    mdinventory.setProperty("/entry/records", res.data);
                                    let records= mdinventory.getProperty("/entry/records");
                                    records.forEach(item=>{
                                        item.stateQuantity= "None";
                                        item.stateTextQuantity= "";
                                        item.stateFecha_movements= "None";
                                        item.stateTextFecha_movements= "";
                                        item.fecha_movements= that.formatDate(item.fecha_movements);
                                        item.oldQuantity= item.quantity;
                                        item.oldFecha_movements= item.fecha_movements;
                                    });
                                    mdinventory.refresh();
                                    that.viewEntryBtns();
                                } else {
                                    mdinventory.setProperty("/entry/records", []);
                                    that.viewEntryBtns();
                                }
                            });
                            that.openDialog(stateSucess, "Ejecución guardada con éxito.");
                        }
                    }
                );
            }catch(err){
                console.log("err: ", err);
                this.openDialog(stateError, "Ha ocurrido un error.");
            }
        },
        updateAdjustEgressColdRoom: function(records){
            try{
                let that = this;
                let mdinventory= this.getModel("mdinventory"),
                    obj = mdinventory.getProperty("/entry/selectRecord"),
                    name = mdinventory.getProperty("/entry/selectRecord/name");

                fetch("/coldRoom/addAdjustEgressEggs", {
                    method: "POST",
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                    body: JSON.stringify({
                        records: records,
                        objSearch: mdinventory.getProperty("/entry/objectSearch"),
                        lot: obj.lot
                    })
                }).then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: ",response.status);
                            that.openDialog(stateError, "Ha ocurrido un error.");
                            return;
                        }
                        else{
                            response.json().then(function (res) {
                                if (res.data.length > 0) {
                                    mdinventory.setProperty("/egress/records", res.data);
                                    let records= mdinventory.getProperty("/egress/records");
                                    let sumEgress=0;
                                    records.forEach(item=>{
                                        sumEgress+= item.quantity;
                                        item.name= name;
                                        item.stateQuantity= "None";
                                        item.stateTextQuantity= "";
                                        item.stateFecha_movements= "None";
                                        item.stateTextFecha_movements= "";
                                        item.oldQuantity= item.quantity;
                                        item.oldFecha_movements= item.fecha_movements;
                                    });
                                    let ajus= obj.ajustes,
                                        sum = 0;
                                    ajus.forEach(element => {
                                        sum = parseInt(sum)+parseInt(element.quantity);
                                    });
                                    mdinventory.setProperty("/egress/egressBalance", parseInt (obj.quantity)+ parseInt (sum)- parseInt( sumEgress));
                                    mdinventory.refresh();
                                } else {
                                    mdinventory.setProperty("/egress/records", []);
                                    that.viewEntryBtns();
                                }
                            });
                            that.openDialog(stateSucess, "Ajuste guardado con éxito.");
                        }
                    }
                );
            }catch(err){
                console.log("err: ", err);
                this.openDialog(stateError, "Ha ocurrido un error.");
            }
        },
        onBreedLoad: function () {
            let util = this.getModel("util");
            let serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBreed")+"/findAllBreedWP";
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
                    mdbreed.setProperty("/selectedKey", mdbreed.getProperty("/records/0/breed_id"));
                }
            });
        },

        onSavePress: async function(){
            var that = this;
            
            await this.onBreedLoad();
            this.formNew = sap.ui.xmlfragment("coldRoom.view.DialogNew", this);
            
            this.getView().addDependent(this.formNew);
            
            let dlg = sap.ui.getCore().byId("dialogNew");
            dlg.attachAfterClose(function () {
                that.formNew.destroy();
            });
            this.formNew.open();
        },

        onSaveNewIngress: function () {
            let oDatePicker = sap.ui.getCore().byId("date_new");
            let fecha_movements = oDatePicker.getValue();
            let oInput = sap.ui.getCore().byId("new_quantity");
            let quantity = oInput.getValue();
            let oSelect = sap.ui.getCore().byId("descriptionNewSelect");
            let description = oSelect.getSelectedKey();
            // ====================================================================================
            let mdinventory = this.getModel("mdinventory");
            let mdincubator = this.getModel("mdincubator");
            let ospartnership = this.getModel("ospartnership");
            let mdprojected= this.getModel("mdprojected");
            let mdscenario = this.getModel("mdscenario");
            // ====================================================================================
            let newEntry = [];
            let objProjected= mdprojected.getProperty("/selectedRecords");
            let partnership_id = ospartnership.getProperty("/selectedRecord/partnership_id");
            let incubator_plant_id = objProjected.incubator_plant_id;
            let breed_id = this.getModel("mdbreed").getProperty("/selectedKey");
            let pDate = fecha_movements.split("-");
            let ndate = this.formatDate(fecha_movements);
            let scenario_id = mdscenario.getProperty("/scenario_id");

            newEntry.push({
                incubator_plant_id: incubator_plant_id,
                scenario_id: scenario_id,
                breed_id: breed_id,
                init_date: ndate,
                end_date: ndate,
                lot: "C",
                eggs: quantity,
                eggs_executed: quantity,
                origin: 1
            });
            this.NewEntryColdRoom(newEntry);
            this.formNew.close();
            this.formNew.destroy();
        },

        changeOrigin: function(oEvent){
            let origin =  this.getView().byId("filterOriginEntry").getSelectedKey(),
                mdinventory = this.getModel("mdinventory");
            console.log(origin, oEvent);
            mdinventory.setProperty("/entry/records",[]);
            mdinventory.setProperty("/compra",((origin==="Compra")||(origin==="Plexus")));
            mdinventory.setProperty("/curva",origin==="Curva de postura");
            mdinventory.setProperty("/plexus",origin==="Plexus");
            this.getView().byId("entryDesde").setValue("");
            this.getView().byId("entryHasta").setValue("");

            if(origin === "Compra"||origin==="Plexus"){
                mdinventory.setProperty("/entry/entryNew",origin==="Compra");
                mdinventory.setProperty("/entry/viewEntrySave",false);
            // mdinventory.setProperty("/curva",false);
            } else {
                mdinventory.setProperty("/entry/entryNew",false);
            // mdinventory.setProperty("/entry/viewEntrySave",true);
            // mdinventory.setProperty("/curva",true);
            }
            this.loadLotsEntry();
        },
        changeOriginEgress: function(oEvent){
            let origin =  this.getView().byId("filterOriginEntry").getSelectedKey(),
                mdinventory = this.getModel("mdinventory");
            console.log(origin, oEvent);
            mdinventory.setProperty("/egress/records",[]);
            this.getView().byId("egressDesde").setValue("");
            this.getView().byId("egressHasta").setValue("");

            this.loadLotsEgress();
        },
        loadLotsEgress: function(){
            try{
                let that = this;
                let mdlot= this.getModel("mdlot");
                let mdprojected= this.getModel("mdprojected");
                let mdinventory= this.getModel("mdinventory");
                let util = this.getModel("util");
                let serverName = "/coldRoom/getLots";
                let objProjected= mdprojected.getProperty("/selectedRecords");
                let origin =  this.getView().byId("filterOriginEgress").getSelectedKey();
                let scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
                let prefix;

                switch(origin){
                case "Curva de postura":
                    prefix="H";
                    break;
                case "Compra":
                    prefix="A";
                    break;
                case "Plexus":
                    prefix="X";
                    break;
                }

                console.log(serverName);

                //resetRecords
                mdlot.setProperty("/records", []);
                mdlot.setProperty("/selectRecords/entry", {});

                util.setProperty("/busy/", true);
                fetch(serverName, {
                    method: "POST",
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                    body: JSON.stringify({
                        incubator_plant_id: objProjected.incubator_plant_id,
                        prefix: prefix, 
                        scenario_id: scenario_id
                    })
                }).then(function (response) {
                // debugger;
                    util.setProperty("/busy/", false);
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status Code: ",response.status);
                        that.openDialog(stateError, "Ha ocurrido un error.");
                        return;
                    } else {
                        response.json().then(function (res) {
                        // debugger;
                            if (res.data.length > 0) {
                                res.data.unshift({
                                    lot: "Todos",
                                    total: 0
                                });
                                mdlot.setSizeLimit (res.data.length+1);
                                mdlot.setProperty("/records", res.data);
                                //reset filter lot for entry
                                let slot= mdinventory.getProperty("/entry/objectSearch/slot");
                                slot= (slot=== undefined || slot== null || slot=="")? "Todos" : slot;
                                // mdlot.setProperty("/selectRecords/entry", {lot: slot} );
                            
                                //reset filter lot for egress
                                slot= mdinventory.getProperty("/egress/objectSearch/slot");
                                slot= (slot=== undefined || slot== null || slot=="")? "Todos" : slot;
                                // mdlot.setProperty("/selectRecords/egress", {lot: slot} );
                            } else {
                                mdlot.setProperty("/records", [{
                                    lot: "Todos",
                                    total: 0
                                }]);
                                mdlot.setProperty("/selectRecords/entry", {});
                            }
                        });
                    }
                });
            } catch (err) {
                console.log("err: ", err);
                this.openDialog(stateError, "Ha ocurrido un error.");
            }
        },
        NewEntryColdRoom: function(newEntry){ 
            try{
                let that = this;
                let mdinventory= this.getModel("mdinventory");
                let util = this.getModel("util");
                let serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/addEntryEggs");
                let ospartnership = this.getModel("ospartnership"),
                    partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id");

                util.setProperty("/busy/", true);
                fetch("/coldRoom/addNewEntryEggs", {
                    method: "POST",
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                    body: JSON.stringify({
                        records: newEntry,
                        partnership_id: partnership_id
                    })
                }).then(
                    function (response) {
                        util.setProperty("/busy/", false);
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: ",response.status);
                            that.openDialog(stateError, "Ha ocurrido un error.");
                            return;
                        }
                        else{
                            response.json().then(function (res) {
                                if (res.data.length > 0) {
                                    mdinventory.setProperty("/entry/records", res.data);
                                    let records= mdinventory.getProperty("/entry/records");
                                    records.forEach(item=>{
                                        item.stateQuantity= "None";
                                        item.stateTextQuantity= "";
                                        item.stateFecha_movements= "None";
                                        item.stateTextFecha_movements= "";
                                        item.fecha_movements= that.formatDate(item.fecha_movements);
                                        item.oldQuantity= item.quantity;
                                        item.oldFecha_movements= item.fecha_movements;
                                    });
                                    mdinventory.refresh();
                                    mdinventory.setProperty("/compra",true);
                                    mdinventory.setProperty("/curva",false);
                                } else {
                                    mdinventory.setProperty("/entry/records", []);
                                    that.viewEntryBtns();
                                }
                                that.changeOrigin();
                            });
                            that.openDialog(stateSucess, "Ejecución guardada con éxito.");
                        }
                    }
                );
            }catch(err){
                console.log("err: ", err);
                this.openDialog(stateError, "Ha ocurrido un error.");
            }
        },
        onClick: function(oEvent){
            let ev = oEvent;
            var mdinventory = this.getView().getModel("mdinventory");
            let selectObject = oEvent.getSource().getBindingContext("mdinventory").getObject();
            console.log(parseInt(selectObject.eggs_executed - selectObject.quantity))
            mdinventory.setProperty("/min",selectObject.init_date);
            mdinventory.setProperty("/MinimunAmount",parseInt(selectObject.eggs_executed - selectObject.quantity) );

            if(selectObject.adjusted === true){
                this.handleLink(ev);
            }else{
                console.log("+")
                this.onDialogAjuste(ev);
            }

        }

    });
});
