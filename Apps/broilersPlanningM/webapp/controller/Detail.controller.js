sap.ui.define([
    "broilersPlanningM/controller/BaseController",
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
    const breedingStage = 1; /*Etapa para Engorde*/
    return BaseController.extend("broilersPlanningM.controller.Detail", {

        onInit: function() {
            this.setFragments();
            this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            var oArguments = oEvent.getParameter("arguments");

            this.cleanTablesAndControls();
            this.index = oArguments.id;
            let oView= this.getView();
            let ospartnership = this.getModel("ospartnership");
            oView.byId("tabBar").setSelectedKey("tabParameter");
            oView.byId("tableBreed").addEventDelegate({
                onAfterRendering: oEvent=>{
                }
            });
            
            this.incubatorPopover = sap.ui.xmlfragment("broilersPlanningM.view.projected.IncubatorPopover", this)
            this.getView().addDependent(this.incubatorPopover);
    
            this.programmedPopover = sap.ui.xmlfragment("broilersPlanningM.view.programmed.ProgrammedPopover", this);
            this.getView().addDependent(this.programmedPopover);
    
            if(ospartnership.getProperty("/records").length>0){
                let partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id");
                this.onRead(partnership_id);
            }
            else{
                this.reloadPartnership()
                    .then(data => {
                        if(data.length>0){
                            let obj= ospartnership.getProperty("/selectedRecords/");
                            if(obj){
                                this.onRead(obj.partnership_id);
                            }
                            else{
                                MessageToast.show("no existen empresas cargadas en el sistema", {
                                    duration: 3000,
                                    width: "20%"
                                });
                                console.log("err: ", data);
                            }
                        }
                        else{
                            MessageToast.show("ha ocurrido un error al cargar el inventario", {
                                duration: 3000,
                                width: "35%"
                            });
                            console.log("err: ", data);
                        }
                    });
            } 

            this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
            this.onRead(this.index);

        },

        cleanTablesAndControls: function(){
            let mdprojected = this.getView().getModel('mdprojected'),
                mdprogrammed = this.getModel("mdprogrammed"),
                mdreport = this.getModel("mdreports"),
                mdexecuted = this.getModel("mdexecuted");

                mdprojected.setProperty("/records", []);
                mdprojected.setProperty("/adjustmenttable", []);
                mdprogrammed.setProperty("/records", []);
                mdreport.setProperty("/records", []);
                mdexecuted.setProperty("/records", []);

                this.getView().byId("breedSelect").setSelectedKey(null);
                this.getView().byId("scheduled_date").setValue("");
                this.getView().byId("scheduled_date2").setValue("");

                this.getView().byId("breedSelect2").setSelectedKey(null);
                this.getView().byId("sd").setValue("");
                this.getView().byId("sd2").setValue("");

                this.getView().byId("numberL").setValue("");
        },
        showProgrammedLots: async function(oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            const programming = oEvent.getSource().getBindingContext("mdprogrammed").getObject();

            const link = oEvent.getSource();
            const response = await fetch("/broilerdetail/findIncubatorLotByBroilerLot", {
                headers: {
                    "Content-type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    broiler_detail_id: programming.broiler_detail_id
                })
            });

            if (!response.ok) {
                console.log("error showProgrammedLots");
                console.log(response);
            }
            else {
                const res = await response.json();
                mdprogrammed.setProperty("/popover", res.data);
                this.programmedPopover.openBy(link);
            }
        },

        showProgrammedIcubatorLots: async function(oEvent) {
            const mdprojected = this.getView().getModel('mdprojected')
            const object = oEvent.getSource().getBindingContext('mdprojected').getObject()
            const link = oEvent.getSource()
            
            console.log(object)
      
            if (object.lot_incubator !== '-' && object.lot_incubator !== '') {
              
              const result = await fetch('/traceability/findLotLocation', {
                headers: {
                  'Content-type' : 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                  lot: object.lot_incubator
                })
              })
        
              if (!result.ok) {
                console.log('error with status - ', result.status)
                return
              }
        
              const res = await result.json()
        
              mdprojected.setProperty('/popover', res)
              this.incubatorPopover.openBy(link)
            }
          },

        reloadPartnership: function(){
            let util = this.getModel("util");
            let that = this;
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
                    console.log(err);
                    ospartnership.setProperty("/selectedRecords/", []);
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, getPartnership, error, error);
            });
        },

        onRead: async function(index) {
            let ospartnership = this.getModel("ospartnership"),
                mdscenario = this.getModel("mdscenario"),
                oView = this.getView();

            oView.byId("tabBar").setSelectedKey("kTabParameter");

            let activeS = await this.activeScenario();
            mdscenario.setProperty("/scenario_id", activeS.scenario_id);
            mdscenario.setProperty("/name", activeS.name);

            ospartnership.setProperty("/selectedRecordPath/", "/records/" + index);
            ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));

            this.onFarmLoad();
            this.onBreedLoad();

            let util = this.getModel("util"),
                that = this,
                mdprojected = this.getModel("mdprojected"),
                mdprogrammed = this.getModel("mdprogrammed");

            ospartnership.setProperty("/selectedPartnership/partnership_index", index);

            let process_info = await this.processInfo(),
                mdprocess = this.getModel("mdprocess");

            mdprocess.setProperty("/records", process_info.data);
            that.hideButtons(false, false, false, false);
            this.onFarmLoad();
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
                return false;
            }
        },


        onValidProgrammedQuantity: function(o){
            let input= o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)){
                return true;
            }
            else {
                let aux = value.split("").filter(char => {
                    if (/^[0-9]$/.test(char)){
                        if (char !== ".") {
                            return true;
                        }
                    }
                }).join("");
                value = aux.substring(0, length);
                input.setValue(value);
                this.validQuantityShed(value);
                return false;
            }
        },

        validQuantityShed: function(value){
            let mdshed = this.getModel("mdshed");
            let selectedShed = sap.ui.getCore().byId("selectShed").getSelectedKey();
            let array1 = mdshed.getProperty("/records");
            let mdprogrammed = this.getModel("mdprogrammed");
            let programmed_residue = mdprogrammed.getProperty("/programmed_residue");
        
            var found = array1.find(function(element) {
                return element.shed_id == selectedShed;
            });
            mdprogrammed.setProperty("/addBtn", true);
            if(value === null || value ===""){//VALIDACION PARA ENTRADA NULA
                mdprogrammed.setProperty("/name/state", "None");
                mdprogrammed.setProperty("/name/stateText", "");
                mdprogrammed.setProperty("/addBtn", false);
            }
            else if(parseInt(value)===0){//VALIDACION PARA ENTRADA IGUAL A 0
                mdprogrammed.setProperty("/name/state", "Error");
                mdprogrammed.setProperty("/name/stateText", "La cantidad programada debe ser mayor a 0");
                mdprogrammed.setProperty("/addBtn", false);
            }
            else if(parseInt(value) > programmed_residue){//VALIDACION PARA ENTRADA MAYOR AL RESIDUO
                mdprogrammed.setProperty("/name/state", "Warning");
                mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera al saldo");
            }
            else if(parseInt(value) > found.capmax) {//VALIDACION PARA ENTRADA MAYOR A CAPACID. MAX
                mdprogrammed.setProperty("/name/state", "Warning");
                mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera la capacidad del galpon");
            }
            else if(parseInt(value)< parseInt(found.capmin)){//VALIDACION PARA ENTRADA MENOR A CAPAC. MIN
                mdprogrammed.setProperty("/name/state", "Warning");
                mdprogrammed.setProperty("/name/stateText", "La cantidad programada esta por debajo de la capacidad mínima del galpón");
            }
            else{
                mdprogrammed.setProperty("/name/state", "None");
                mdprogrammed.setProperty("/name/stateText", "");
            }

        },

        reports: function()
        {
            var mdreports = this.getModel("mdreports");
            let date1 = this.getView().byId("sd").mProperties.value,
                date2 = this.getView().byId("sd2").mProperties.value,
                breed_id = this.getView().byId("breedSelect2").getSelectedKey(),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id");

            let aDate = date1.split("-"),
                init_date = `${aDate[0]}/${aDate[1]}/${aDate[2]}`;

            let aDate2 = date2.split("-"),
                end_date = `${aDate2[0]}/${aDate2[1]}/${aDate2[2]}`;

      
            if (date1 === null || date1== "" || date2 === null || date2== "" ){
                MessageToast.show("No se pueden consultar fechas vacías", {
                    duration: 3000,
                    width: "20%"
                });
            }else{
                let serverName = "/reports/broiler";

                fetch(serverName, {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        date1: date1,
                        date2: date2,
                        breed_id: breed_id,
                        scenario_id : scenario_id,
                        partnership_id : partnership_id
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
                                mdreports.setProperty("/raza", res.raza);
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
            }
        },

        generatedCSV: function()
        {
            var mdreports = this.getModel("mdreports").getProperty("/records");
            this.arrayObjToCsv(mdreports);
        },

        arrayObjToCsv: function (ar) {
        //comprobamos compatibilidad
            let breed_id = this.getView().byId("breedSelect").getSelectedKey();
            let array = [];
            if(window.Blob && (window.URL || window.webkitURL)){
                var contenido = "",
                    d = new Date(),
                    blob,
                    reader,
                    save,
                    clicEvent;
                //creamos contenido del archivo
                if(breed_id === "Todas"){
                    array = ["Fecha Programada",  "Cantidad Programada", "Fecha Ejecutada", "Cantidad Ejecutada", "Lote", "Raza", "Granja", "Núcleo", "Galpón", "Granja Ejecutada", "Núcleo Ejecutado", "Galpón Ejecutado","Variación Cantidad", "Variación Dias"];
                }else{
                    array = ["Fecha Programada",  "Cantidad Programada", "Fecha Ejecutada", "Cantidad Ejecutada", "Lote", "Granja", "Núcleo", "Galpón", "Granja Ejecutada", "Núcleo Ejecutado", "Galpón Ejecutado","Variación Cantidad", "Variación Dias"];
                }
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

        onPress: async function(){
            this.getView().byId("projectedTable").removeSelections();
            let that = this,
                mdprojected = this.getModel("mdprojected"),
                mdscenario =  this.getModel("mdscenario"),
                mdprogrammed = this.getModel("mdprogrammed"),
                partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id"),
                util = this.getModel("util"),
                scenario_id = mdscenario.getProperty("/scenario_id"),
                scheduled_date = this.getView().byId("scheduled_date").mProperties.value,
                scheduled_date2 = this.getView().byId("scheduled_date2").mProperties.value,
                breed_id = this.getView().byId("breedSelect").getSelectedKey();

            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findprojectedbroiler");
            fetch(serverName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    scenario_id: scenario_id,
                    _date: scheduled_date,
                    end_date: scheduled_date2,
                    partnership_id: partnership_id,
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
                            let records=res.data;
                            records.forEach(element => {
                                element.fProjected = that.getDia(element.projected_date);
                            });
                            mdprojected.setProperty("/records", res.data);
                            mdprogrammed.setProperty("/product/records", res.product);
                            mdprojected.refresh();
                            mdprogrammed.refresh();
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
        },
        processInfo: function() {

            let util = this.getModel("util"),
                mdprocess = this.getModel("mdprocess"),
                that = this;

            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findProcessBreedByStage");
            return new Promise((resolve, reject) => {
                fetch(serverName, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: "stage_id=" + breedingStage
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
                    body: "stage_id=" + breedingStage + "&partnership_id=" + partnership_id + "&scenario_id=" + scenario_id
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

        onTabSelection: async function(ev) {
            var mdprogrammed = this.getModel("mdprogrammed");
            var mdprojected = this.getModel("mdprojected");
            var mdexecuted = this.getModel("mdexecuted");
            var mdbreed = this.getModel("mdbreed");
            let recordsB = mdbreed.getProperty("/records"); 
            var mdfarms = this.getModel("mdfarms");
            let mdreports = this.getModel("mdreports");
            let util = this.getModel("util");
            var selectedKey = ev.getSource().getSelectedKey();

            mdprojected.setProperty("/visibleOtherButtons",false)
            mdprojected.setProperty("/val_lot","");

            if (selectedKey === "kTabParameter") {
                this.getView().byId("projectedTable").removeSelections();
                this.getView().getModel("mdprogrammed").setProperty("/rProgrammed/enabledTab",false);
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab",false);
                this.getView().byId("projectedTable").removeSelections();
                this.getView().byId("idtable2").removeSelections();
                this.getView().byId("idexecuted").removeSelections();
                this.hideButtons(false, false, false, false);
            }

            if (selectedKey === "kTabProjected") {
                mdprojected.setProperty("/records", []);
                this.getView().byId("breedSelect").setSelectedKey(null);
                this.getView().byId("scheduled_date").setValue("");
                this.getView().byId("scheduled_date2").setValue("");
                // ================================================================================
                this.hideButtons(true, false, false, false);
                this.getView().byId("projectedTable").removeSelections();
                this.getView().byId("idtable2").removeSelections();
                mdprogrammed.setProperty("/selectedRecords", []);
                this.getView().byId("bProj").firePress();
                this.getView().getModel("mdprogrammed").setProperty("/records", []);
                this.getView().getModel("mdprogrammed").setProperty("/rProgrammed/enabledTab", false);
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab", false);
                this.getView().byId("idtable2").removeSelections();
                this.getView().byId("idexecuted").removeSelections();
            }

            if (selectedKey === "ktabProgrammed") {
                this.hideButtons(false, true, false, false);
                util.setProperty("/busy", false);
                let records = mdprojected.getProperty("/records");
                this.getView().getModel("mdexecuted").setProperty("/records",[]);
                this.getView().getModel("mdfarms").setProperty("/selectedKey",null);
                this.getView().getModel("mdcores").setProperty("/selectedKey",null);
                this.getView().getModel("mdcenter").setProperty("/selectedKey",null);
                this.getView().getModel("mdshed").setProperty("/selectedKey",null);
                this.getView().byId("idtable2").removeSelections();
                this.getView().byId("idexecuted").removeSelections();
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab",false);
            }

            if (selectedKey === "ktabExecuted") {
                this.getView().byId("idexecuted").removeSelections();
                this.hideButtons(false,false, true, false);
                mdprogrammed.setProperty("/programmedsaveBtn", false);
            }

            if (selectedKey === "ktabReports") {
                this.getView().byId("breedSelect2").setSelectedKey(null);
                this.getView().byId("sd").setValue("");
                this.getView().byId("sd2").setValue("");
                // ================================================================================
                this.getView().byId("projectedTable").removeSelections();
                this.getView().byId("idtable2").removeSelections();
                this.getView().getModel("mdprogrammed").setProperty("/records",[]);
                this.getView().byId("idexecuted").removeSelections();
                this.getView().getModel("mdexecuted").setProperty("/records",[]);
                this.getView().getModel("mdprogrammed").setProperty("/rProgrammed/enabledTab",false);
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab",false);

                recordsB.unshift({breed_id: "Todas", name: "Todas"});
                mdbreed.setProperty("/records",recordsB);

                var lo = mdreports.getProperty("/records");

                if (lo.length == 0) {
                    this.hideButtons(false, false, false, false);
                } else {
                    this.hideButtons(false, false, false, true);
                }
            }

            if (selectedKey !== "ktabReports") {
                mdreports.setProperty("/records", []);

                if (recordsB[0].breed_id==="Todas"){
                    recordsB.shift();
                    mdbreed.setProperty("/records",recordsB);
                }
            }

            if (selectedKey === "tabAdjust") {
                // console.log("here i am, rock you like a hurricane");
                mdreports.setProperty("/records", []);
                this.getModel("mdprojected").setProperty("/adjustmenttable",{})
                mdprojected.setProperty("/visibleOtherButtons",false)
                this.hideButtons(false, false, false, false);
            }
        },

        findExecuted: function(){
            let that= this,
                util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                mdfarms = this.getView().getModel("mdfarms"),
                mdcenter = this.getView().getModel("mdcenter"),
                mdshed = this.getView().getModel("mdshed"),
                brid = mdexecuted.getProperty("/selectedRecord/broiler_detail_id");

            return new Promise((resolve, reject) => {
                fetch("/broilerdetail/findbroilerdetailById", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: "broiler_detail_id=" + brid
                }).then(function(response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status code:" + response.status);
                        return;
                    }
      
                    response.json().then(function(res) {
                        let records = res.data,
                            cond = (records[0].execution_quantity === null || records[0].execution_quantity === 0) && records[0].execution_date === null;
                        mdexecuted.setProperty("/records", records);

                        mdexecuted.setProperty("/isnotexecuted", cond);
                        mdexecuted.setProperty("/isexecuted", !cond);

                        mdfarms.setProperty("/selectedKey", records[0].executedfarm_id !== null ? records[0].executedfarm_id : records[0].farm_id);
                        mdcenter.setProperty("/selectedKey", records[0].executedcenter_id !== null ? records[0].executedcenter_id : records[0].center_id);
                        mdshed.setProperty("/selectedKey", records[0].executedshed_id !== null ? records[0].executedshed_id : records[0].shed_id);
                        mdexecuted.setProperty("/execution_quantity", records[0].execution_quantity !== null ? records[0].execution_quantity : records[0].scheduled_quantity);
                        records[0].execution_date = records[0].execution_date === null ? records[0].scheduled_date : records[0].execution_date;
                        mdexecuted.setProperty("/saveBtn", true);
                        that.hideButtons(false, false, true, false);

                        if (records.length > 0) {
                            mdprogrammed.setProperty("/executionSaveBtn", true);
                            let residue_programmed = res.residue,
                                projected_quantity = mdprogrammed.getProperty("/selectedRecord/projected_quantity"),
                                total = projected_quantity - residue_programmed;

                            mdexecuted.setProperty("/programmed_residue", total);
                        } else {
                            mdexecuted.setProperty("/programmed_residue", mdexecuted.getProperty("/selectedRecord/projected_quantity"));

                        }

                        mdfarms.refresh(true);
                        mdcenter.refresh(true);
                        mdshed.refresh(true);
                        mdexecuted.refresh(true);

                        util.setProperty("/busy/", true);
                        resolve(res);
                    });
                }).catch(function(err) {
                    console.error("Fetch error:", err);
                });
            });
        },

        onSelectExecutedRecord: async function(oEvent) {
            let util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                oView = this.getView();
            //guarda la ruta del registro proyectado que fue seleccionado
            mdprogrammed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            mdexecuted.setProperty("/selectedRecord",mdprogrammed.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
            mdexecuted.setProperty("/rExecuted/enabledTab", true);
            oView.byId("tabBar").setSelectedKey("ktabExecuted");
            util.setProperty("/busy", false);
            let findExecuted = await this.findExecuted();
            mdprogrammed.setProperty("/programmedsaveBtn", false);

            mdexecuted.setProperty("/name/state", "None");
            mdexecuted.setProperty("/name/stateText", "");
            mdexecuted.setProperty("/confirmBtn", false);
            mdexecuted.setProperty("/addBtn", false);

            findExecuted = findExecuted.data;
            let mdcenter = this.getView().getModel("mdcenter"),
                mdshed = this.getView().getModel("mdshed"),
                farm_id = findExecuted[0].executedfarm_id !== null ? findExecuted[0].executedfarm_id : findExecuted[0].farm_id,
                center_id = findExecuted[0].executedcenter_id !== null ? findExecuted[0].executedcenter_id : findExecuted[0].center_id,
                centers = await this.findCenterByFarm(farm_id), 
                sheds = await this.findShedByCenterForExecution(center_id);

            mdcenter.setProperty("/records",centers.data);
            mdshed.setProperty("/records",sheds.data);

        },

        onChangeCenterE: async function(){
            let mdcenter =  this.getView().getModel("mdcenter"),
                mdshed =  this.getView().getModel("mdshed"),
                center_id = mdcenter.getProperty("/selectedKey");
            let findShed = await this.findShedByCenterForExecution(center_id);
            mdshed.setProperty("/records",findShed.data);
            console.log(mdshed, mdcenter)
            
        },

        onValidExecutedQuantity: function(o)
        {
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

                let mdexecuted = this.getView().getModel("mdexecuted"),
                    programmedquantity = mdexecuted.getProperty("/selectedRecord").scheduled_quantity;

                let mdshed= this.getView().getModel("mdshed");
                let records= mdshed.getProperty("/records"),
                    myshed= records.filter(function(item){
                        return mdshed.getProperty("/selectedKey")==item.shed_id;
                    });

                if(parseInt(value) <= parseInt(myshed[0].capmax) ){
                    mdexecuted.setProperty("/name/state", "None");
                    mdexecuted.setProperty("/name/stateText", "");
                    mdexecuted.setProperty("/saveBtn", true);

                }else{
                    if (parseInt(value) > parseInt(myshed[0].capmax)) {
                        mdexecuted.setProperty("/name/state", "Warning");
                        mdexecuted.setProperty("/name/stateText", "La cantidad ejecutada supera la capacidad del galpon");
                    }
                    if (value == "") {
                        mdexecuted.setProperty("/name/state", "Error");
                        mdexecuted.setProperty("/name/stateText", "La cantidad ejecutada no debe estar vacia");
                        mdexecuted.setProperty("/saveBtn", false);
                    }
                }
                return false;
            }
        },

        onChangeFarmE: async function(){
            let mdfarms = this.getView().getModel("mdfarms"),
                mdcenter =  this.getView().getModel("mdcenter"),
                farm_id = mdfarms.getProperty("/selectedKey");
            let findCenter = await this.findCenterByFarm(farm_id);
            mdcenter.setProperty("/records",findCenter.data);
            this.onChangeCenterE();
        },

        getDia: function(dia){
            let mdprogrammed = this.getView().getModel("mdprogrammed"),
                aDate = dia.split("/"),
                fecha = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                dias= ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"], 
                fullDate = dias[fecha.getUTCDay()] + " " +dia ;
            return fullDate;
        },

        hideButtons: function(projected, programmed, execution, reports) {
            let mdprojected = this.getModel("mdprojected");
            let mdprogrammed = this.getModel("mdprogrammed");
            let mdexecuted = this.getModel("mdexecuted");
            let mdreports = this.getModel("mdreports");
            mdprojected.setProperty("/projectedSaveBtn", projected);
            mdprogrammed.setProperty("/programmedsaveBtn", programmed);
            mdexecuted.setProperty("/executionSaveBtn", execution);
            mdreports.setProperty("/reportsBtn", reports);

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

        onProjectedNext: function(oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            const util = this.getModel("util");
            this.getView().byId("projectedTable").removeSelections();

            mdprogrammed.setProperty("/rProgrammed/enabledTab", true);
            this.getView().byId("tabBar").setSelectedKey("ktabProgrammed");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findbroilerdetail");
      
            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    records: mdprogrammed.getProperty("/selectedRecords").map(record => record.broiler_id)
                })
            })
                .then(response => {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status Code: " +
            response.status);
                        return;
                    }
                    response.json().then((res) => {
                        let records = res.data;
                        records.forEach(element => {
                            if(element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date){
                                element.isexecuted = true;
                            }else{
                                element.isexecuted = false;
                            }
            
                        });
                        mdprogrammed.setProperty("/records", records);
                        this.hideButtons(false, true, false, false);

                        if (records.length > 0) {
                            mdprogrammed.setProperty("/executionSaveBtn", true);
                            let residue_programmed = res.residue,
                                projected_quantity = mdprogrammed.getProperty("/selectedRecord/projected_quantity"),
                                total = projected_quantity - residue_programmed;

                            mdprogrammed.setProperty("/programmed_residue", total);
                        } else {
                            mdprogrammed.setProperty("/programmed_residue", mdprogrammed.getProperty("/selectedRecord/projected_quantity"));
                            mdprogrammed.setProperty("/executionSaveBtn", false);
                        }
                        util.setProperty("/busy/", false);
                    });
                })
                .catch(err => console.log("error onProjectedNext ----> ",err));
        },

        onSelectProgrammedRecords: function(oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            const util = this.getView().getModel("util");
            const mdprojected = this.getView().getModel("mdprojected");

            const projectedTable = this.getView().byId("projectedTable");
            const projections = projectedTable.getSelectedItems().map(item => mdprojected.getProperty(item.getBindingContext("mdprojected").getPath()));
            const actualRecords = mdprogrammed.getProperty("/selectedRecords");
            mdprogrammed.setProperty("/selectedRecords", projections);
            util.setProperty("/busy", false);
        },

        lotSelected: function(oEvent) {
            let broiler_id = oEvent.getSource().getSelectedKey();
            
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            let sRecords = mdprogrammed.getProperty("/selectedRecords");

            let record = sRecords.find(item => item.broiler_id == broiler_id);

            let edate = record.projected_date.split("/"),
                year = parseInt(edate[2]),
                month = parseInt(edate[1])-1,
                day = parseInt(edate[0]);

            let fprojected = new Date(year,month,day)
            
            mdprogrammed.setProperty("/lotselected/date",fprojected);

        },

        onSelectProgrammedRecord: async function(oEvent) {
            var tabla = this.getView().byId("idtable2");
            var itemsrows = tabla.mAggregations.items.length;

            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdprojected = this.getView().getModel("mdprojected"),
                oView = this.getView(),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                mdrecords= mdprogrammed.getProperty("/records"),
                ospartnership = this.getView().getModel("ospartnership");

            util.setProperty("/busy", false);
            ospartnership.setProperty("/selectedPartnership/partnership_index", this.index);

            this.hideButtons(false, true, false, false);

            //guarda la ruta del registro proyectado que fue seleccionado
            mdprogrammed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            mdprogrammed.setProperty("/selectedRecord/", mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
      
            let pDate = mdprogrammed.getProperty("/selectedRecord/projected_date"),
                aDate = pDate.split("/"),
                minDate = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                date2 = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                maxDate = this.addDays(date2, 7);
            mdprogrammed.setProperty("/selectedRecord/minDate/", minDate);
            mdprogrammed.setProperty("/selectedRecord/maxDate/", maxDate);
            mdprogrammed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            mdprogrammed.setProperty("/selectedRecord/", mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));


            //habilita el tab de la tabla de registros programado
            mdprogrammed.setProperty("/rProgrammed/enabledTab", true);
            oView.byId("tabBar").setSelectedKey("ktabProgrammed");
            mdprojected.setProperty("/projectedSaveBtn", false);
            mdprogrammed.setProperty("/programmedsaveBtn", true);

            //Buscar los lotes que se pueden asiganr
            let lots = await this.loadLot(pDate),
                breed_id = this.getModel("mdprogrammed").getProperty("/selectedRecord/breed_id"),
                broiler_id = this.getModel("mdprogrammed").getProperty("/selectedRecord/broiler_id");


            //Buscar los registros de broiler_detail
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findbroilerdetail");
            fetch(serverName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scenario_id: scenario_id,
                    _date: aDate[2]+"-"+aDate[1]+"-"+aDate[0],
                    partnership_id: partnership_id,
                    breed_id: breed_id,
                    broiler_id:broiler_id
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
                            let records = res.data;
                            records.forEach(element => {
                                if(element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date){
                                    element.isexecuted = true;
                                }else{
                                    element.isexecuted = false;
                                }
                
                            });
                            mdprogrammed.setProperty("/records", records);
                            that.hideButtons(false, true, false, false);
                            if (records.length > 0) {
                                mdprogrammed.setProperty("/executionSaveBtn", true);
                                let residue_programmed = res.residue,
                                    projected_quantity = mdprogrammed.getProperty("/selectedRecord/projected_quantity"),
                                    total = projected_quantity - residue_programmed;
                                mdprogrammed.setProperty("/programmed_residue", total);
                            } else {
                                mdprogrammed.setProperty("/programmed_residue", mdprogrammed.getProperty("/selectedRecord/projected_quantity"));
                                mdprogrammed.setProperty("/executionSaveBtn", false);
                            }
                            util.setProperty("/busy/", true);
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
        },
        loadLot: function(pdate){
            let util = this.getModel("util"),
                mdprogrammed = this.getModel("mdprogrammed"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                breed_id = this.getModel("mdprogrammed").getProperty("/selectedRecord/breed_id") ;

            mdprogrammed.setProperty("/selectedRecord/projected_quantity", parseInt(mdprogrammed.getProperty("/selectedRecord/projected_quantity")) );
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBroilerLot");

            fetch(serverName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scenario_id: scenario_id,
                    _date: pdate,
                    partnership_id: partnership_id,
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
                            let records = res.data;
                            mdprogrammed.setProperty("/selectedRecord/lot", records);
                            mdprogrammed.setProperty("/selectedRecord/lot_assigned", []);
                            mdprogrammed.setProperty("/selectedRecord/residue" , mdprogrammed.getProperty("/selectedRecord/projected_quantity" ) );
                            util.setProperty("/busy/", true);
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        onAddBroiler: function(){
            let selected_incubator = sap.ui.getCore().byId("selectLot").getSelectedKey(),
                quantity_chicken = parseInt(sap.ui.getCore().byId("assigned_quantity").mProperties.value, 10),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdshed = this.getView().getModel("mdshed"),
                records = mdprogrammed.getProperty("/selectedRecords");
            let lot = mdprogrammed.getProperty("/assigned"),
                iName = sap.ui.getCore().byId("selectLot").getSelectedItem(),
                name = iName.mProperties.text,
                selected_product_name = sap.ui.getCore().byId("selecProduct").getSelectedItem().mProperties.text,
                selected_product_id = sap.ui.getCore().byId("selecProduct").getSelectedKey();
            let flag= true;
            let dateInput = sap.ui.getCore().byId("programmed_date"),
                date = dateInput.getValue();

            if (date === undefined || date === "" || dateInput.getValueState()==="Error") {
                dateInput.setValueState("Error");
                return;
            }
            else {
                dateInput.setValueState("None");
            }

            const shedSelect = sap.ui.getCore().byId("selectShed");
            const shedKey = shedSelect.getSelectedKey();
            if (shedKey === undefined || shedKey === "") {
                shedSelect.setValueState("Error");
                return;
            }
            else {
                shedSelect.setValueState("None");
            }
            if(lot === undefined){
                lot = [];
            }
            let list_name = name.split("-");

            let sum_chicken = parseInt(quantity_chicken, 10);
            lot.forEach(item => {
            //verifica que no este repetido el lote
                if (flag && selected_product_id== item.selected_product_id && selected_incubator == item.selected_lot){
                    flag= false;
                    item.quantity_chicken += parseInt(quantity_chicken);
                    const broiler_lot = records.find(record => record.broiler_id == selected_incubator);
                    broiler_lot.partial_residue += quantity_chicken;
                }
            
            });

            if(flag){
                let lotItem= {
                    selected_lot: parseInt(selected_incubator),
                    quantity_chicken: parseInt(quantity_chicken),
                    name: list_name[0].trim(),
                    description: selected_product_name,
                    selected_product_id: parseInt(selected_product_id)
                };
                lot.push(lotItem);
            
                const broiler_lot = records.find(record => record.broiler_id == selected_incubator);
                broiler_lot.partial_residue = quantity_chicken;

                sap.ui.getCore().byId("assigned_quantity").setValue("");
            }
            mdprogrammed.setProperty("/assigned", lot );
            if(lot.length>0){
                mdprogrammed.setProperty("/confirmBtn", true);
            }
            else{
                mdprogrammed.setProperty("/confirmBtn", false);
            }
            let residue = parseInt(mdprogrammed.getProperty("/selectedRecord/residue")) - sum_chicken;
            mdprogrammed.setProperty("/selectedRecord/residue" , residue );
            sap.ui.getCore().byId("assigned_quantity").setValue("");
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/addBtn", false);
        },

        resetValues: function() {
            let mdshed = this.getModel("mdshed"),
                mdcores = this.getModel("mdcores"),
                mdprogrammed = this.getModel("mdprogrammed"),
                mdfarms = this.getModel("mdfarms");

            mdprogrammed.setProperty("/selectedKey","");
            mdprogrammed.setProperty("/lotselected/date",null);
            mdprogrammed.setProperty("/product/selectedKey","");
            mdprogrammed.setProperty("/capmin2", "");
            mdprogrammed.setProperty("/capmax2", "");
            mdfarms.setProperty("/selectedKey","");
            mdcores.setProperty("/selectedKey","");
            mdshed.setProperty("/selectedKey","");

            mdcores.setProperty("/editable",false);
            mdshed.setProperty("/editable",false);

            
        },

        handleTitleSelectorPress: function(oEvent) {
            var _oPopover = this._getResponsivePopover();
            _oPopover.setModel(oEvent.getSource().getModel());
            _oPopover.openBy(oEvent.getParameter("domRef"));
        },
        _getResponsivePopover: function() {
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("broilersPlanningM.view.Popover", this);
                this.getView().addDependent(this._oPopover);
            }
            return this._oPopover;
        },
        addDays: function(ndate, ndays) {
            ndate.setDate(ndate.getDate() + ndays);
            return ndate;
        },

        onDialogPressPj: function(oEvent) {
            this.formProjected = sap.ui.xmlfragment(
                "broilersPlanningM.view.DialogProject", this);
            this.getView().addDependent(this.pressDialog);
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
            var dates = [];
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/housingway");

            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: "stage_id=" + breedingStage + "&partnership_id=" + partnership_id + "&scenario_id=" + scenario_id + "&projected_quantity=" + projected_quantity +
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
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });

        },
        onProjectedSave: async function() {

            let mdprojected = this.getModel("mdprojected"),
                mdprogrammed = this.getModel("mdprogrammed"),
                findScenario = await this.findProjected();

            mdprogrammed.setProperty("/rProgrammed/enabledTab", false);
            mdprogrammed.setProperty("/records", []);
            mdprojected.setProperty("/records", findScenario.data);
            mdprojected.attachRequestCompleted(function() {
                sap.ui.getCore().byId("projectedTable").removeSelections();
            });
            this.hideButtons(true, false, false, false);
        },

        onBreedLoad: function() {
            const util = this.getModel("util"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBreed");
            let mdbreed = this.getModel("mdbreed");
            mdbreed.setProperty("/records", []);
            let isRecords = new Promise((resolve, reject) => {
                fetch(serverName).then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status code:" + response.status);
                            return;
                        }
                        // Examine the text in the response
                        response.json().then(function(data) {
                            resolve(data);
                        });
                    }
                ).catch(function(err) {
                    console.error("Fetch error:", err);
                });
            });

            isRecords.then((res) => {
                if (res.data.length > 0) {
                    mdbreed.setProperty("/records", res.data);
                    // mdbreed.setProperty("/value", mdbreed.getProperty("/records/0/breed_id"));
                    mdbreed.setProperty("/value", null);
                }
            });
        },

        onProyectedSave: async function() {
            let mdprojected = this.getModel("mdprojected"),
                mdprogrammed = this.getModel("mdprogrammed"),
                findScenario = await this.findProjected();

            mdprogrammed.setProperty("/rProgrammed/enabledTab", false);
            mdprogrammed.setProperty("/records", []);
            this.getView().byId("projectedTable").removeSelections();
            mdprojected.setProperty("/records", findScenario.data);
            this.hideButtons(true, false, false, false);
        },

        onProgDateChange: function () {
            let oSelectedFarm = this.getView().byId("selectFarm");
            oSelectedFarm.setEnabled(true);
        },

        onDialogPressPg: function(oEvent) {
            this.resetValues();
            let mdprogrammed = this.getModel("mdprogrammed"),
                sRecord= mdprogrammed.getProperty("/selectedRecords")[0],
                lot = mdprogrammed.getProperty("/records");

            mdprogrammed.setProperty("/selectedRecord/lot_assigned", []);
            if(lot === undefined){
                lot = [];
            }
            let sum_chicken=0;
            lot.forEach(item=>{
                if (item.scheduled_quantity !== undefined && item.scheduled_quantity !== null)
                    sum_chicken += parseInt(item.scheduled_quantity);

            });
            this.formProgrammed = sap.ui.xmlfragment(
                "broilersPlanningM.view.DialogProgrammer", this);
            var that = this;
            var dlg = sap.ui.getCore().byId("dialogprogrammed");
            dlg.attachAfterClose(function () {
                that.formProgrammed.destroy();
            });
            this.getView().addDependent(this.formProgrammed);
            this.formProgrammed.open();
            this.onChangeFarm();
        },
        onChangeShed: async function() {
            let mdshed = this.getModel("mdshed"),
                mdprogrammed = this.getModel("mdprogrammed"),
                selectedShed = sap.ui.getCore().byId("selectShed").getSelectedKey();
            mdshed.setProperty("/selectedKey", selectedShed);
            sap.ui.getCore().byId("assigned_quantity").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
            let array1 = mdshed.getProperty("/records");

            var found = array1.find(function(element) {
                return element.shed_id == selectedShed;
            });
            mdprogrammed.setProperty("/capmin2", parseInt(found.capmin));
            mdprogrammed.setProperty("/capmax2", parseInt(found.capmax));
            mdprogrammed.setProperty("/addBtn", false);
        },
        onChangeShedE: async function() {
            let mdshed = this.getModel("mdshed"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                selectedShed = mdshed.getProperty("/selectedKey");
            mdexecuted.setProperty("/name/state", "None");
            mdexecuted.setProperty("/name/stateText", "");
            mdexecuted.setProperty("/confirmBtn", false);
            mdexecuted.setProperty("/addBtn", false);
            mdexecuted.refresh();

        },
        onChangeCore: async function(){
            let mdcores = this.getModel("mdcores"),
                mdprogrammed= this.getModel("mdprogrammed"),
                selectedFarm = mdprogrammed.getProperty("/selectedFarm"),
                mdfarm = this.getModel("mdfarms"),
                selectedCore = sap.ui.getCore().byId("selectCore").getSelectedKey();
                console.log("Nucleo",selectedCore);
            mdcores.setProperty("/selectedKey", selectedCore);

            let findShed = await this.findShedByFarm(selectedCore),
                mdshed = this.getModel("mdshed");

            mdshed.setProperty("/records", findShed.data);
            mdshed.setProperty("/selectedKey", "");
            mdshed.setProperty("/editable", findShed.data.length >0);
            if(findShed.data.length === 0){
                MessageToast.show('No se encontraron galpones disponibles');
            }

            mdprogrammed.setProperty("/capmin2", "");
            mdprogrammed.setProperty("/capmax2", "");

            this.onChangeShed();
            // sap.ui.getCore().byId("programmed_quantity").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
        },

        onChangeFarm: async function() {
            let mdfarm = this.getModel("mdfarms"),
                mdshed = this.getModel("mdshed"),
                mdprogrammed = this.getModel("mdprogrammed"),
                selectedFarm = sap.ui.getCore().byId("selectFarm").getSelectedKey();

            mdfarm.setProperty("/selectedKey", selectedFarm);

            let findShed = await this.findCenterByFarm(selectedFarm),
                mdcores = this.getModel("mdcores");

            mdcores.setProperty("/records", findShed.data);
            mdcores.setProperty("/selectedKey", "");
            mdcores.setProperty("/editable", true);

            mdshed.setProperty("/selectedKey", "");
            mdshed.setProperty("/records", []);
            mdshed.setProperty("/editable", false);

            mdprogrammed.setProperty("/capmin2", "");
            mdprogrammed.setProperty("/capmax2", "");
            //var tmp = mdcores.getProperty("/records")[0].center_id;
            
            sap.ui.getCore().byId("assigned_quantity").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
            mdprogrammed.setProperty("/addBtn", false);
            //this.onChangeCore();
        },
        findCenterByFarm: function(selectedFarm) {
            console.log('mi granja', selectedFarm)
            let util = this.getModel("util"),
                mdshed = this.getModel("mdshed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            return new Promise((resolve, reject) => {
                fetch("/center/findCenterByFarm2", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },

                    body: "farm_id=" + selectedFarm
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

        findShedByFarm: function(selectedFarm) {
            let util = this.getModel("util"),
                mdshed = this.getModel("mdshed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findShedsByFarm");
            return new Promise((resolve, reject) => {
                fetch("/shed/findShedByCenter2", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },

                    body: "center_id=" + selectedFarm
                })
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                                return;
                            }
                            response.json().then(function(res) {
                                console.log("DATA SHED:::: ", res.data)
                                res.data= res.data.filter(function(item){
                                    return item.statusshed_id===1||item.rehousing===true;
                                });
                                resolve(res);
                            });
                        }
                    )
                    .catch(function(err) {
                        console.log("Fetch Error :-S", err);
                    });
            });
        },

        findShedByCenterForExecution: function(selectedFarm) { /* En caso que se pida mostrar todos los galpones en la pantalla de ejecucion */
            console.log('mi center', selectedFarm)
            let util = this.getModel("util"),
                mdexecuted = this.getModel("mdexecuted"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findShedsByFarm");
            return new Promise((resolve, reject) => {
                fetch("/shed/findShedByCenter2", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },

                    body: "center_id=" + selectedFarm
                })
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                                return;
                            }

                            response.json().then(function(res) {
                                res.data= res.data.filter(function(item){
                                    return item.statusshed_id===1||item.rehousing===true||mdexecuted.getProperty("/selectedRecord").shed_id===item.shed_id||mdexecuted.getProperty("/selectedRecord").executedshed_id===item.shed_id;
                                });
                                resolve(res);
                            });
                        }
                    )
                    .catch(function(err) {
                        console.log("Fetch Error :-S", err);
                    });
            });
        },
        onProgrammedCloseDialog: function() {
            let mdshed = this.getModel("mdshed"),
            mdprogrammed = this.getModel("mdprogrammed"); 
            mdshed.setProperty("/selectedKey","");
            mdprogrammed.setProperty("/confirmBtn",false);
            this.closeProgrammedDialog();
            this.formProgrammed.close();
            this.formProgrammed.destroy();
        },

        onProgrammedSaveDialog: function() {
            let that = this,
                util = this.getModel("util"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                mdprogrammed = this.getModel("mdprogrammed"),
                mdprocess = this.getModel("mdprocess"),
                mdshed = this.getModel("mdshed"),
                pDate = sap.ui.getCore().byId("programmed_date").getValue(),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/selectedRecord/").partnership_id,
                farm_id = sap.ui.getCore().byId("selectFarm").getSelectedKey(),
                shed_id = sap.ui.getCore().byId("selectShed").getSelectedKey(),
                center_id = sap.ui.getCore().byId("selectCore").getSelectedKey(),
                breed_id = mdprogrammed.getProperty("/selectedRecords/0/breed_id"),
                broiler_id = mdprogrammed.getProperty("/assigned/0/selected_lot");
            var dates = [];
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/addbroilerdetail");
            mdprogrammed.setProperty("/confirmBtn",false);
            console.log(serverName)
            fetch(serverName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scenario_id: scenario_id,
                    _date: pDate,
                    farm_id: farm_id,
                    shed_id: shed_id,
                    center_id: center_id,
                    partnership_id: partnership_id,
                    breed_id: breed_id,
                    broiler_id : broiler_id,
                    records: mdprogrammed.getProperty("/assigned"),
                    selected_product_id: mdprogrammed.getProperty("/assigned/0/selected_product_id")
                })
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log(response);
                            console.log("Looks like there was a problem. Status Code: " +
                response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            that.formProgrammed.close();
                            that.formProgrammed.destroy();
                            var dialog = new Dialog({
                                title: "Información",
                                type: "Message",
                                state: "Success",
                                content: new Text({
                                    text: "Información guardada con éxito."
                                }),
                                beginButton: new Button({
                                    text: "OK",
                                    press: function() {
                                        dialog.close();
                                        let record = res.data;
                                        record.forEach(element => {
                                            if(element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date){
                                                element.isexecuted = true;
                                            }else{
                                                element.isexecuted = false;
                                            }
                          
                                        });
                                        mdprogrammed.setProperty("/records", record);
                                        mdshed.setProperty("/selectedKey","");
                                        //formateo los lotes mostrados luego de guardar
                                        mdprogrammed.setProperty("/selectedRecord/lot_assigned", []);
                                        mdprogrammed.setProperty("/assigned", []);
                                        that.hideButtons(false, true, false, false);
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

        handleTitleSelectorPress: function(oEvent) {
            var _oPopover = this._getResponsivePopover();
            _oPopover.setModel(oEvent.getSource().getModel());
            _oPopover.openBy(oEvent.getParameter("domRef"));
        },
        _getResponsivePopover: function() {
            if (!this._oPopover) {

                this._oPopover = sap.ui.xmlfragment("broilersPlanningM.view.Popover", this);
                this.getView().addDependent(this._oPopover);
            }
            return this._oPopover;
        },
        onFarmLoad: function() {

            const util = this.getModel("util"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findFarmByPartAndStatus"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/selectedRecord/").partnership_id;

            let osfarm = this.getModel("mdfarms"),
                that = this;
            osfarm.setProperty("/records", []);
            let isRecords = new Promise((resolve, reject) => {
                fetch("/farm/findFarmByPartAndStatus2/", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: "partnership_id=" + partnership_id + "&status_id=2"
                })
                    .then(
                        function(response) {
                            if (response.status !== 200) {

                                console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                                return;
                            }
                            // Examine the text in the response
                            response.json().then(function(data) {
                                console.log(data);
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
                    osfarm.setProperty("/records", res.data);
                }
            });
        },

        handleDelete: function(oEvent){
            let sId = oEvent.getParameters().listItem.sId,
                asId = sId.split("-"),
                idx = asId[asId.length-1],
                mdprogrammed = this.getModel("mdprogrammed"),
                that = this;
            let records =  mdprogrammed.getProperty("/selectedRecord/lot_assigned/");
            let assigneds = mdprogrammed.getProperty("/assigned");
       
            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Se procedera a eliminar el lote: " + assigneds[idx].name

                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        let residue= parseInt(mdprogrammed.getProperty("/selectedRecord/residue"));
                        let quantity= parseInt(assigneds[idx].quantity_chicken);
                        mdprogrammed.setProperty("/selectedRecord/residue" , + residue+ quantity);
                        const records = mdprogrammed.getProperty("/selectedRecords");
                        const record = records.find(record => record.broiler_id == assigneds[idx].selected_lot);
                        record.partial_residue -= assigneds[idx].quantity_chicken;
                        assigneds.splice(idx,1);
                        if(assigneds.length>0){
                            mdprogrammed.setProperty("/confirmBtn", true);
                        }
                        else{
                            mdprogrammed.setProperty("/confirmBtn", false);
                        }
                        mdprogrammed.refresh();
                        dialog.close();
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
        deleteProgrammed: function(lot) {
            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getModel("mdprogrammed"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/deleteBroilerDetail"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                breed_id = this.getModel("mdprogrammed").getProperty("/selectedRecord/breed_id"),
                _date =   mdprogrammed.getProperty("/selectedRecord/updateDate/");

            fetch(serverName, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lot: lot,
                    scenario_id: scenario_id,
                    _date: _date,
                    partnership_id: partnership_id,
                    breed_id: breed_id
                })
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                            response.json().then(
                                function(resp){
                                    MessageToast.show(resp.msg);
                                }
                            );

                            return;
                        }
                        // Examine the text in the response
                        response.json().then(function(res) {
                            let records = res.data;
                            mdprogrammed.setProperty("/records", records);
                            that.hideButtons(false, true, false, false);

                            if (records.length > 0) {
                                mdprogrammed.setProperty("/executionSaveBtn", true);
                                let residue_programmed = res.residue,
                                    projected_quantity = mdprogrammed.getProperty("/selectedRecord/projected_quantity"),
                                    total = projected_quantity - residue_programmed;
                                mdprogrammed.setProperty("/programmed_residue", total);
                            } else {
                                mdprogrammed.setProperty("/programmed_residue", mdprogrammed.getProperty("/selectedRecord/projected_quantity"));
                                mdprogrammed.setProperty("/executionSaveBtn", false);
                            }
                            util.setProperty("/busy/", true);
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        onDialogPressEx: function() {

            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getModel("mdprogrammed"),
                mdexecuted = this.getModel("mdexecuted"),
                aRecords = mdexecuted.getProperty("/records"),
                sRecords = mdprogrammed.getProperty("/selectedRecord"),
                execution_quantity = mdexecuted.getProperty("/execution_quantity"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                mdscenario = this.getModel("mdscenario"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                farm_id = this.getView().getModel("mdfarms").getProperty("/selectedKey"),
                center_id = this.getView().getModel("mdcenter").getProperty("/selectedKey"),
                mdshed = this.getModel("mdshed"),
                shed_id = mdshed.getProperty("/selectedKey");
            let pDate = aRecords[0].execution_date,
                aDate = pDate.split("-"),
                minDate = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                date2 = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                maxDate = this.addDays(date2, 7),
                breed_id = this.getModel("mdprogrammed").getProperty("/selectedRecords/0/breed_id"),
                broiler_id = this.getModel("mdprogrammed").getProperty("/selectedRecords/0/broiler_id");
            mdprogrammed.setProperty("/selectedRecord/minDate/", minDate);
            mdprogrammed.setProperty("/selectedRecord/maxDate/", maxDate);
            let housing_way_id = mdprogrammed.getProperty("/selectedRecord/broilereviction_id");
            let records_programmed = [],
                isValidRecord = true;

            mdshed = this.getModel("mdshed");
            aRecords.forEach(item => {
                if (item.execution_date && (parseInt(execution_quantity))) {
                    item.executedfarm_id = farm_id;
                    item.executedcenter_id = center_id;
                    item.executedshed_id = shed_id;
                    item.execution_quantity = execution_quantity;
                    records_programmed.push(item);
                }



                if ((!item.execution_date) && parseInt(execution_quantity)) {
                    item.state_date = "Error";
                    item.state_text_date = "El campo fecha no puede estar en blanco";
                    isValidRecord = false;
                } else {
                    item.state_date = "None";
                    item.state_text_date = "";
                }

                if ((item.execution_date) && (!parseInt(execution_quantity))) {
                    item.state_quantity = "Error";
                    item.state_text_quantity = "El campo cantidad no puede estar en blanco";
                    isValidRecord = false;
                } else {
                    item.state_quantity = "None";
                    item.state_text_quantity = "";
                }
            });

            mdprogrammed.refresh(true);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/addbroilerdetail");
            if (records_programmed.length > 0 ) {

                var dialogC = new Dialog({
                    title: "Aviso",
                    type: "Message",
                    content: new Text({
                        text: "¿Desea guardar los cambios?"
                    }),
                    beginButton: new Button({
                        text: "Aceptar",
                        press: function(oEvent) {
                            oEvent.getSource().oParent.mAggregations.beginButton.setEnabled(false)
                            console.log("mi servername:::::: ",serverName);
                            fetch(serverName, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    records: records_programmed,
                                    scenario_id: scenario_id,
                                    _date: aDate[2]+"-"+aDate[1]+"-"+aDate[0],
                                    partnership_id: partnership_id,
                                    breed_id: breed_id,
                                    broiler_id: broiler_id
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
                                            mdexecuted.setProperty("/isnotexecuted",false);
                                            mdexecuted.setProperty("/isexecuted",true);
                                            mdprogrammed.setProperty("/records", res.data);
                                            mdexecuted.setProperty("/name/state", "None");
                                            mdexecuted.setProperty("/name/stateText", "");
                                            mdshed.setProperty("/selectedKey","");
                                            mdexecuted.setProperty("/saveBtn", false);
                                            that.findExecuted();

                                            var dialog = new Dialog({
                                                title: "Información",
                                                state: "Success",
                                                type: "Message",
                                                content: new Text({
                                                    text: "Información guardada con éxito."
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

                                            dialog.attachBeforeClose(function(){
                                                dialogC.close();
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
            } else if (!isValidRecord) {

                this.onToast("Faltan campos");
            } else {
                this.onToast("No de detectaron cambios");
            }
        },

        onDialogPressExBrayan: function() {

            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getModel("mdprogrammed"),
                aRecords = mdprogrammed.getProperty("/records"),
                mdscenario = this.getModel("mdscenario");
            let housing_way_id = mdprogrammed.getProperty("/selectedRecord/housing_way_id");
            let records_programmed = [],
                isValidRecord = true;
            aRecords.forEach(item => {
                if ((item.available == true)) {
                    if ((item.execution_date) && (item.execution_quantity)) {
                        records_programmed.push(item);
                    }
                    if ((!item.execution_date) && (item.execution_quantity)) {
                        item.state_date = "Error";
                        item.state_text_date = "El campo no puede estar en blanco";
                        isValidRecord = false;
                    } else {
                        item.state_date = "None";
                        item.state_text_date = "";
                    }

                    if ((item.execution_date) && (!item.execution_quantity)) {
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
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/housingwaydetail");
            if (records_programmed.length > 0 && isValidRecord) {
                fetch(serverName, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        records: records_programmed,
                        stage_id: breedingStage,
                        housing_way_id: housing_way_id,
                        scenario_id: mdscenario.getProperty("/scenario_id")
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
                                var dialog = new Dialog({
                                    title: "Información",
                                    type: "Message",
                                    state: "Success",
                                    content: new Text({
                                        text: "Información guardada con éxito."
                                    }),
                                    beginButton: new Button({
                                        text: "OK",
                                        press: function() {
                                            dialog.close();
                                            mdprogrammed.setProperty("/records", res.data);
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
            } else if (!isValidRecord) {
                this.onToast("Faltan campos");
            } else {
                this.onToast("No de detectaron cambios");
            }
        },


        reloadProgrammed: function(broiler_detail, mdprogrammed){
            let broilers = [];
            broilers = broiler_detail.map(record => record.broiler_id);
            fetch("/broilerdetail/findbroilerdetail", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    records: broilers
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
                            mdprogrammed.setProperty("/records",res.data);
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
  
        },

        toSap: function () {
            let util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                ids = mdprogrammed.getProperty("/selectedRecords"),
                that = this;
            var dialogToSap = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Se procedera a sincronizar: "
                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                    
                        dialogToSap.close();
                        dialogToSap.destroy();
                        util.setProperty("/busy", true);

                        fetch("/synchronization/syncEngorde", {
                            method: "GET"
                        })
                            .then(
                                function(response) {
                                    if (response.status !== 200) {
                                        util.setProperty("/busy", false);
                                        console.log("Looks like there was a problem. Status Code: " + response.status);
                                        response.json().then(data => {
                                            var dialog = new Dialog({
                                                title: "Información",
                                                type: "Message",
                                                state: "Error",
                                                content: new Text({
                                                    text: data.message
                                                }),
                                                beginButton: new Button({
                                                    text: "OK",
                                                    press: function() {
                                                        dialog.close();
                                                        dialogToSap.close();
                                                        dialogToSap.destroy();
                                                    }
                                                }),
                                                afterClose: function() {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        });
                                        return;
                                    }else{
                                        util.setProperty("/busy", false);
                                        response.json().then(function(res) {
                                            let texto = "";
                                            if (res.resp.length > 0) 
                                            {
                                                texto = "Sincronización realizada con éxito.\n"+ res.resp[0].satisfactorios + " registro(s) guardados\n"+res.resp[0].error+" registro(s) erroneos";

                                            }
                                            else{
                                                texto = "Todos los registros ya han sido sincronizados";
                                            }
                                            that.reloadProgrammed(ids, mdprogrammed);
                                            var dialog = new Dialog({
                                                title: "Información",
                                                type: "Message",
                                                state: "Success",
                                                content: new Text({
                                                    text: texto
                                                }),
                                                beginButton: new Button({
                                                    text: "OK",
                                                    press: function() {
                                                        dialog.close();
                                                        dialogToSap.close();
                                                        dialogToSap.destroy();
                                                    }
                                                }),
                                                afterClose: function() {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        });
                                    }
                                }
                            )
                            .catch(function(err) {
                                console.log("Fetch Error :-S", err);
                                util.setProperty("/busy", false);
                                var dialog = new Dialog({
                                    title: "Información",
                                    type: "Message",
                                    state: "Error",
                                    content: new Text({
                                        text: "Error de sincronización."
                                    }),
                                    beginButton: new Button({
                                        text: "OK",
                                        press: function() {
                                            dialog.close();
                                            dialogToSap.close();
                                            dialogToSap.destroy();
                                        }
                                    }),
                                    afterClose: function() {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
                            });
                    }
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () {
                        dialogToSap.close();
                      
                    }
                }),
                afterClose: function() {
                    dialogToSap.destroy();
                }
            });
            dialogToSap.open();
        },
    
        onPressDetProg: function(oEvent){
            let that = this,
                path = oEvent.getSource().oPropagatedProperties.oBindingContexts.mdprogrammed.sPath;
            var dialog = new Dialog({
                title: "Información",
                type: "Message",
                state: "Warning",
                content: new Text({
                    text: "¿Desea eliminar la programación seleccionada?."
                }),
                beginButton: new Button({
                    text: "Aceptar",
                    press: function() {
                        that.onUpdateDisabled(path);
                        dialog.close();
                    }
                }),
                endButton: new Button({
                    text: "Cancelar",
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
        closeProgrammedDialog: function(oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            mdprogrammed.getProperty("/selectedRecords").forEach(record => record.partial_residue = 0);
            mdprogrammed.setProperty("/assigned", []);
        },
  
        onUpdateDisabled: function(path){
            let mdprogrammed = this.getView().getModel("mdprogrammed"),
                selectedItem = mdprogrammed.getProperty(path),
                id = selectedItem.broiler_detail_id,
                broiler_id = selectedItem.broiler_id,
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                breed_id = this.getModel("mdprogrammed").getProperty("/selectedRecords/0/breed_id"),
                date = this.getModel("mdprogrammed").getProperty("/selectedRecords/0/projected_date"),
                shed_id = selectedItem.shed_id;
  
            fetch("/broilerDetail/updateDisabledbroilerdetail", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "PUT",
                body: JSON.stringify({
                    broiler_id : broiler_id,
                    broiler_detail_id: id,
                    execution_date: date,
                    scenario_id: scenario_id,
                    partnership_id: partnership_id,
                    breed_id: breed_id,
                    shed_id : shed_id
                })
            })
                .then(
                    function(response) {
                        if (response.status !== 200 && response.status !== 409) {
                            console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                            return;
                        }
                        if(response.status === 409){
                            var dialog = new Dialog({
                                title: "Información",
                                type: "Message",
                                state: "Error",
                                content: new Text({
                                    text: "No se puede eliminar la programación, porque ya ha sido ejecutada."
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
                        }
                
                        if(response.status === 200){
                            response.json().then(function(res) {
                                var dialog = new Dialog({
                                    title: "Información",
                                    type: "Message",
                                    state: "Success",
                                    content: new Text({
                                        text: "Programación eliminada con éxito."
                                    }),
                                    beginButton: new Button({
                                        text: "OK",
                                        press: function() {
                                            dialog.close();
                                            let records = res.data;
                                            mdprogrammed.setProperty("/records", records);
                                            mdprogrammed.refresh(true);
                          
                                        }
                                    }),
                                    afterClose: function() {
                                        dialog.destroy();
                                    }
                                });
      
                                dialog.open();
                            });
                        }
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
  
        },

        pressadjustment: function (o) {
            console.log({
                lot: this.getView().byId("numberL").getValue(),
                stage: "E",
                scenario_id: this.getModel("mdscenario").getProperty("/scenario_id")
            })
            let that = this
            let mdprojected = this.getView().getModel("mdprojected")
            fetch("/adjustments/findEvictionLotData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    lot: this.getView().byId("numberL").getValue(),
                    stage: "E",
                    scenario_id: this.getModel("mdscenario").getProperty("/scenario_id"),
                })
            })
                .then(function (response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }

                    response.json().then(function (res) {
                        console.log(res)
                        that.getModel("mdprojected").setProperty("/adjustmenttable", res.data)
                        if(res.data.length>0){
                            console.log("2")
                            mdprojected.setProperty("/visibleInfo", ((res.data[0].adjustment_date !== undefined && res.data[0].adjustment_date !== null) && (res.data[0].username !== undefined && res.data[0].username !== null)));
                            mdprojected.setProperty("/visibleOtherButtons",true)
                            if(res.data[0].eviction===true){
                                mdprojected.setProperty("/visibleOtherButtons",false)
                            }
                        }else{
                            console.log("1")
                            mdprojected.setProperty("/visibleOtherButtons",false)
                            
                        }
                        




                    });

                })
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        SaveEviction: async function () {
            let mdprojected = this.getView().getModel("mdprojected"),
              stage = "E",
              record = mdprojected.getProperty("/adjustmenttable/0")
            console.log(stage)
            record.stage = stage
            console.log(record)
            console.log(record.eviction_date)
            if(record.eviction_date==undefined || record.eviction_date==" " || record.eviction_date==""  || record.eviction_date==null){
              MessageToast.show("Ingrese una parámetro de fecha de desalojo");
            }else {
              let that = this
              var dialogC = new Dialog({
                title: "Aviso",
                type: "Message",
                content: new Text({
                  text: "¿Desea guardar la información?"
                }),
                beginButton: new Button({
                  text: "Aceptar",
                  press: async function (oEvent) {
                    fetch("/adjustments/updateEvictionedStage", {
                      method: "PUT",
                      headers: {
                        "Content-type": "application/json"
                      },
                      body: JSON.stringify(record)
                    })
                      .then(response => {
                        if (response.status !== 200) {
                          console.log("Looks like there was a problem. Status Code: " +
                            response.status);
                          MessageToast.show("Ingrese un parametro de fecha valido");
                          return;
                        }
                        response.json().then((res) => {
                          console.log(res);
                          that.getModel("mdprojected").setProperty("/adjustmenttable",{})
                          MessageToast.show("Desalojo exitoso");
                         
                        });
        
        
                      })
                      .catch(err => console.log);
                    dialogC.close();
                  }
                }),
                endButton: new Button({
                  text: "Cancelar",
                  press: function () {
                    dialogC.close();
                  }
                }),
                afterClose: function () {
                  dialogC.destroy();
                }
              });
              dialogC.open();
      
      
      
            }
      
      
      
      
           
      
          },

          changeProgrammedDate: function(oEvent){
            let input = oEvent.getSource(),
                value = input.getValue(),
                minus = value.split('-'),
                divider = value.split('/');

            if(divider.length===3){
                value = `${divider[0]}-${divider[1]}-${divider[2]}`;
            }
            console.log(minus.length)
            input.setValueState((minus.length===3||divider.length===3)?'None':'Error');
            input.setValueStateText((minus.length===3||divider.length===3)?'':'Fecha no valida');
            
            input.setValue(value);
            if(this.getView().byId("executionSaveBtn").getVisible() === true){
                this.getView().byId("executionSaveBtn").setEnabled(minus.length===3||divider.length===3);
            }
        },


    });
});
