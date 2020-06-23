sap.ui.define([
    "incubatorPlanningM/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/core/Item"
], function(BaseController, jQuery, Filter, Fragment, JSONModel, MessageToast, Dialog, Button, Text, Item) {
    "use strict";
    const incubatorStage = 2; /*Clase para levante y Cria*/
    return BaseController.extend("incubatorPlanningM.controller.Detail", {

        onInit: function() {
            this.setFragments();
            this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            var oArguments = oEvent.getParameter("arguments");
            let mdincubatorplant = this.getModel("mdincubatorplant");
            let mdbreed = this.getModel("mdbreed");
            let mdprogrammed = this.getModel("mdprogrammed");
            let mdprojected = this.getModel("mdprojected");
            this.index = oArguments.id;
      
            let oView= this.getView();
            let ospartnership = this.getModel("ospartnership");
            this.resetProjected();
            //this.hideButtons(false, false, false, false, false);
            oView.byId("tabBar").setSelectedKey("ktabProjected");

            // mdincubatorplant.setProperty("/selectedIncPlant", null);
            // mdbreed.setProperty("/selectedBreed", null);
            // this.getView().byId("parentLotSelect").setSelectedKey(null)
            // this.getView().byId("parentLotSelect").setEnabled(false)
            // this.getView().byId("scheduled_date").setValue(null);
            // this.getView().byId("scheduled_date2").setValue(null);
            // this.getView().byId("projectedTable").removeSelections(true);
            this.getView().byId("programmedTable").removeSelections(true);
            mdprogrammed.setProperty("/selectedRecords", []);
            mdprojected.setProperty("/records", []);

            oView.byId("projectedTable").addEventDelegate({
                onAfterRendering: oEvent=>{
                    // console.log("victor te amo!");
                }
            });

            this.programmedPopover = sap.ui.xmlfragment("incubatorPlanningM.view.programmed.ProgrammedPopover", this);
            this.getView().addDependent(this.programmedPopover);

            if (ospartnership.getProperty("/records").length > 0) {
                let partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id");
                console.log("Alaaaaaa")
                this.onRead(partnership_id);
            } else {
                this.reloadPartnership().then(data => {
                    if(data.length > 0) {
                        let obj= ospartnership.getProperty("/selectedRecords/");
                        if (obj) {
                            this.onRead(obj.partnership_id);
                        } else {
                            MessageToast.show("no existen empresas cargadas en el sistema", {
                                duration: 3000,
                                width: "20%"
                            });
                            console.log("err: ", data);
                        }
                    } else {
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

        resetProjected: function(){

            let mdprogrammed = this.getModel("mdprogrammed");
            let mdexecuted = this.getView().getModel("mdexecuted");

            this.getView().byId("selectIncubatorPlant").setSelectedKey(null)
            this.getView().byId("breedSelect").setSelectedKey(null)
            this.getView().byId("parentLotSelect").setSelectedKey(null)
            this.getView().byId("parentLotSelect").setEnabled(false)
            this.getView().byId("scheduled_date").setValue(null);
            this.getView().byId("scheduled_date2").setValue(null);
            this.getView().byId("projectedTable").removeSelections(true);

            mdprogrammed.setProperty("/enabledTabAssigned", false);
            mdexecuted.setProperty("/enabledTabAssigned", false);

        },
        
        showProgrammedLots: async function(oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            const mdexecuted = this.getView().getModel("mdexecuted");
            let programming;  
            let parent = oEvent.getSource().getParent().getParent();
            let sId = parent.sId.split("---detail--")[1]

            if (sId==="programmedTable") {

                programming = oEvent.getSource().getBindingContext("mdprogrammed").getObject()

            } else {
                programming = mdexecuted.getProperty("/parent_programming")
            }

            console.log(programming);
            const link = oEvent.getSource();
            const response = await fetch("/programmed_eggs/findColdRoomsLotByProgramming", {
                headers: {
                    "Content-type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    programmed_eggs_id: programming.programmed_eggs_id
                })
            });

            if (!response.ok) {
                console.log("error");
                console.log(response);
            } else {
                const res = await response.json();
                mdprogrammed.setProperty("/popover", res.data);
                console.log(mdprogrammed.getProperty("/popover"));
                this.programmedPopover.openBy(link);
            }

            // programmed_eggs/findAllDateQuantityFarmProduct
        },

        showProgrammedLotsReports: async function(oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            const programming = oEvent.getSource().getBindingContext("mdreports").getObject();
            console.log(programming);
            const link = oEvent.getSource();
            const response = await fetch("/programmed_eggs/findColdRoomsLotByProgramming", {
                headers: {
                    "Content-type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    programmed_eggs_id: programming.programmed_eggs_id
                })
            });

            if (!response.ok) {
                console.log("error");
                console.log(response);
            } else {
                const res = await response.json();
                mdprogrammed.setProperty("/popover", res.data);
                console.log(mdprogrammed.getProperty("/popover"));
                this.programmedPopover.openBy(link);
            }

            // programmed_eggs/findAllDateQuantityFarmProduct
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
                mdparameter_breed = this.getModel("mdparameter_breed"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                mdprogrammed = this.getModel("mdprogrammed"),
                oView = this.getView();

            oView.byId("tabBar").setSelectedKey("ktabInventory");
            this.hideButtons(false, true, false, false, false);
            mdexecuted.setProperty("/executionSaveBtn", false);

            let partnership_id = ospartnership.getProperty("/records/" + this.index + "/partnership_id"),
                activeS = await this.activeScenario(),
                isBreedLoad = await this.onBreedLoad(),
                load_invetory = await this.loadInventory(partnership_id);

            mdscenario.setProperty("/scenario_id", activeS.scenario_id);
            mdscenario.setProperty("/name", activeS.name);

            ospartnership.setProperty("/selectedRecordPath/", "/records/" + index);
            ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));

            //let isFarmLoad = await this.onFarmLoad();
            //let isBreedLoad = await this.onBreedLoad();
            //let pERP = await this.pruebaERP();
            //console.log(JSON.parse(pERP.data));
            //let records_pb = await this.onParameterBreed();
            //mdparameter_breed.setProperty("/records", records_pb.data);
            //console.log(mdparameter_breed);

            let isIncubatorPlant = await this.onIncubatorPlant(),
                mdincubatorplant = this.getModel("mdincubatorplant");

            mdincubatorplant.setProperty("/records", isIncubatorPlant.data);

            
            // if(isIncubatorPlant.data.length>0){
            //     mdincubatorplant.setProperty("/selectedKey", isIncubatorPlant.data[0].incubator_plant_id);
            // }


            let util = this.getModel("util"),
                that = this,
                mdprojected = this.getModel("mdprojected");
                

            /*  this.getView().byId('projectedTable').removeSelections();
            mdprogrammed.setProperty("/rProgrammed/enabledTab", false);

            //Ocultar el boton de guardar registros
            ospartnership.setProperty("/selectedPartnership/partnership_index", index);

            let process_info = await this.processInfo(),
                mdprocess = this.getModel("mdprocess");
            console.log("process_info ", process_info.data[0].theoretical_duration);
            mdprocess.setProperty("/duration", process_info.data[0].theoretical_duration);
            mdprocess.setProperty("/decrease", process_info.data[0].theoretical_decrease);

            let findScenario = await this.findProjected();
            mdprojected.setProperty("/records", findScenario.data);
            that.hideButtons(false, false, false);*/

            // this.findParentLot();
            console.log("mdincubatorplant", this.getModel("mdincubatorplant"))
        },


        handleChange: function (o) {
            console.log("la fecha que puso es");
            let date2 = o.getSource().getValue();
            // let date1 = this.getView().byId("programmed_date").mProperties.value;
            console.log(date2);


            let tDate = date2.split("-"),
                date= new Date(tDate[0]+'/'+tDate[1]+'/'+tDate[2]);
            // let date= new Date(date2.toString());
            console.log(date);

            let aDay=["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
   
            let dayDate= aDay[date.getUTCDay()];
            console.log(dayDate);

            let mdprogrammed = this.getModel("mdprogrammed");

            let util = this.getModel("util");
            util.setProperty("/busy",true);
            console.log("el modelo mdprogrammed");
            console.log(mdprogrammed);

            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            // mdprogrammed.setProperty("/confirmBtn", false);
            mdprogrammed.setProperty("/confirmMore", false);
            sap.ui.getCore().byId("assigned_quantity").setValue();
            sap.ui.getCore().byId("selectIncubator").setEnabled(false);
            let mdincubator = this.getModel("mdincubator"),
                that = this;
            console.log("el modelo incubator");
            console.log(mdincubator);

            let incubator_plant_id = mdprogrammed.getProperty("/selectedRecords/0/incubator_plant_id");
            console.log(incubator_plant_id);

            let dateFree = new Date(mdprogrammed.getProperty("/selectedRecord/fecha_movements"));
            console.log(dateFree);
            console.log(dateFree.getFullYear());
            console.log(dateFree.getMonth());
            console.log(dateFree.getDate());

            dateFree = dateFree.getFullYear()+"-"+(dateFree.getMonth()+1)+"-"+dateFree.getDate();
            date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
            console.log(dateFree, date);


            const serverName =  "/incubator/findIncubatorByDate";
            // const serverName =  "/incubator/findIncubatorByDay";

            fetch(serverName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    incubator_plant_id: incubator_plant_id, 
                    day: dayDate,
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
                            console.log("el resultado de las incubadoras por dia", res);
                            mdincubator.setProperty("/list", res.data);
                            mdincubator.setProperty("/list2", res.data);
                            console.log("el modelo incubator en el new");
                            console.log(mdincubator);
                            mdincubator.refresh(true);
                            sap.ui.getCore().byId("selectIncubator").setSelectedItem(new Item ()); 
                            sap.ui.getCore().byId("selectIncubator").setEnabled(res.data.length>0);
                            if(res.data.length === 0){
                                MessageToast.show("No se encontraron máquinas disponibles");
                            }
                            util.setProperty("/busy", false);                           
                            // that.onChangeMachine();


                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        validateIncPlant: function () {
            // let mdprojected = this.getModel("mdprojected");
            // mdprojected.setProperty("/recordsSales", []);
            let mdincubatorplant = this.getModel("mdincubatorplant");
            let aIncPlants = mdincubatorplant.getProperty("/records");
            let oIncubatorPlant = this.getView().byId("selectIncubatorPlantSale").getValue();
            let aValidIncPlant = aIncPlants.filter(item => (item.name === oIncubatorPlant));

            if (aValidIncPlant.length <= 0) {
                MessageToast.show("Planta incubadora errónea");
            }

            let mdbreed = this.getModel("mdbreed");
            mdbreed.setProperty("/selectedBreed", null);
            this.getView().byId("sales_date").setValue("");
            this.getView().byId("sales_date2").setValue("");
        },

        validateBreed: function () {
            let mdbreed = this.getModel("mdbreed");
            let aSales = mdbreed.getProperty("/recordsSales");
            let oSelectedBreed = this.getView().byId("breedSelectSale").getValue();
            let aValidSale = aSales.filter(item => (item.name === oSelectedBreed));

            if (aValidSale.length <= 0) {
                MessageToast.show("Raza errónea");
            }

            this.getView().byId("sales_date").setValue("");
            this.getView().byId("sales_date2").setValue("");
        },

        validateDate: function (sDate) { return (/^(?:3[01]|[12][0-9]|0?[1-9])([\-/.])(0?[1-9]|1[1-2])\1\d{4}$/.test(sDate))},

        onInitDateChange: function (oEvent) {
            let oInitDate = oEvent.getSource().getValue();
            let bIsValid = this.validateDate(oInitDate);
            console.log(`Is ${oInitDate} valid?:`, bIsValid);

            if (!bIsValid) {
                MessageToast.show("Fecha inicial errónea");
            }
        },

        onEndDateChange: function (oEvent) {
            let oEndDate = oEvent.getSource().getValue();
            let bIsValid = this.validateDate(oEndDate);
            console.log(`Is ${oEndDate} valid?:`, bIsValid);

            if (!bIsValid) {
                MessageToast.show("Fecha final errónea");
            }
        },

        validateIntInput: function (oEvent) {
            let input = oEvent.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);
            let mdbreed = this.getModel("mdbreed");
            let mdprojected = this.getModel("mdprojected");
            mdbreed.setProperty("/estateS", true);

            if (regex.test(value)) {
                console.log("Aquí");
                mdprojected.setProperty("/stateLot", "None");
                mdprojected.setProperty("/valueStateText", "");
                return true;
            } else {
                let aux = value.split("").filter(char => {
                    if (/^[0-9]$/.test(char)) {
                        if (char !== ".") {
                            console.log("Aquí no:", parseInt(value));
                            if (parseInt(value) === 0) {
                                mdprojected.setProperty("/stateLot", "Error");
                                mdprojected.setProperty("/stateTextLot", "Cantidad inválida");
                                console.log("Aquí no2");
                            } else {
                                mdprojected.setProperty("/stateLot", "None");
                                mdprojected.setProperty("/stateTextLot", "");
                            }
                            return true;
                        }
                    }
                }).join("");

                value = aux.substring(0, length);
                input.setValue(value);

                // if (input.getValue() !== 0) {

                // }

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

        onChangeMachine: async function() {
            console.log(sap.ui.getCore().byId("selectIncubator").getSelectedItem());
            let mdprogrammed = this.getModel("mdprogrammed"),
                mdincubator = this.getView().getModel("mdincubator"),
                selected_id = sap.ui.getCore().byId("selectIncubator").getSelectedItem().getBindingContext("mdincubator").getObject().incubator_id,
                disp = sap.ui.getCore().byId("selectIncubator").getSelectedItem().getBindingContext("mdincubator").getObject().available;
            console.log(disp);
            mdincubator.setProperty("/available", disp);
            mdincubator.setProperty("/selectedKey", selected_id); 
            console.log(this.getView().getModel("mdincubator"));
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            // mdprogrammed.setProperty("/confirmBtn", false);
            mdprogrammed.setProperty("/confirmMore", false);
            sap.ui.getCore().byId("assigned_quantity").setValue();
        },
           
        onValidProgrammedQuantity: function(o) {
            let input= o.getSource();
            let length = 10;
            let value = input.getValue();
            console.log("valor: " + value);
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                console.log("entro if");
                return true;
            } else {
                console.log("entro else");
                let aux = value.split("").filter(char => {
                        if (/^[0-9]$/.test(char)) {
                            if (char !== ".") {
                                return true;
                            }
                        }
                }).join("");

                value = aux.substring(0, length);
                input.setValue(value);

                console.log("el valor es: " + value);

                // let mdshed = this.getModel("mdshed")

                // console.log("el modelo shed en validacion")
                // console.log(mdshed);

                // let selectedShed = sap.ui.getCore().byId("selectShed").getSelectedKey();
                // console.log("el codigo del galpon seleccionado")
                // console.log(selectedShed);

                // let array1 = mdshed.getProperty("/records")

                // console.log("el array")
                // console.log(array1);

                // var found = array1.find(function(element) {
                //   return element.shed_id == selectedShed;
                // });

                // console.log("el found")
                // console.log(found.capmax);

                // let mdprogrammed = this.getModel("mdprogrammed"),
                // scheduled_quantity = parseInt(sap.ui.getCore().byId("programmed_quantity").getValue()),
                // programmed_residue = mdprogrammed.getProperty("/programmed_residue");
                // console.log(scheduled_quantity,' -- ', programmed_residue);

                let mdprogrammed = this.getModel("mdprogrammed");
                console.log("el modelo mdprogrammed");
                console.log(mdprogrammed);

                let mdincubator = this.getModel("mdincubator"),
                    residue = mdincubator.getProperty("/residue");

                console.log("el modelo incubator");
                console.log(mdincubator);
                console.log("el residuo incubator");
                console.log(residue);

                let selectedMachine = sap.ui.getCore().byId("selectIncubator").getSelectedKey();
                // mdshed.setProperty("/selectedKey", selectedShed);
                console.log("el codigo de la maquina seleccionado");
                console.log(selectedMachine);

                let lot_records = mdprogrammed.getProperty("/lot_records");
                console.log("lot_records -> ", lot_records)
                console.log(mdprogrammed.getProperty("/selectedRecord"));
                const selectedProjectionId = sap.ui.getCore().byId("projection_select").getSelectedKey();
                const projection = mdprogrammed.getProperty("/selectedRecords").find(records => records.eggs_movements_id == selectedProjectionId);

                let saldoReal = projection.quantity;
                console.log(saldoReal);

                let elRecords = mdprogrammed.getProperty("/records");
                console.log(elRecords);

                let laSuma = 0;
                elRecords.forEach(item=>{
                    laSuma += item.execution_quantity;
                    // console.log("el item")
                    // console.log(item)
                    // item.assigned.forEach(item2=>{
                    // console.log("el item2")
                    // console.log(item2)

                    // });
                });

                console.log(laSuma);

                let asig = 0;
                let acum = 0;
                console.log("el records de los lotes");
                console.log(lot_records);

                console.log("el for");
                lot_records.forEach(item => {
                    acum += item.quantity_eggs;
                    // console.log("el item")
                    // console.log(item)
                    // item.assigned.forEach(item2=>{
                    // console.log("el item2")
                    // console.log(item2)
                    if (item.selected_incubator == selectedMachine) {
                        console.log("entro en el if");
                        console.log(item.quantity_eggs);
                        asig += item.quantity_eggs;
                    }
                    // });
                });

                console.log("salio del for");
                console.log(asig);
                console.log(acum);

                let array1 = mdincubator.getProperty("/list2");

                console.log("el array");
                console.log(array1);

                var found = array1.find(function(element) {
                    return element.incubator_id == selectedMachine;
                });

                console.log("el found");
                console.log(found.available);

                var available = 800;
                // if(parseInt(value) <= programmed_residue && parseInt(value) <= parseInt(found.capmax) ){
                // if(parseInt(value) <= residue && parseInt(value) <= found.available  - asig){
                console.log(found.available - asig , projection.quantity - Math.abs(parseInt(projection.residue)) - (projection.partial_residue | 0)- (laSuma+acum));
                console.log(projection.quantity- projection.residue - (projection.partial_residue | 0), projection.quantity+ projection.residue - (projection.partial_residue | 0) );

                if (parseInt(value) <= found.available - asig && parseInt(value) <= projection.quantity- Math.abs(parseInt(projection.residue)) - (projection.partial_residue | 0) ) {
                // if(parseInt(value) <= found.available - asig && parseInt(value) <= projection.quantity - Math.abs(parseInt(projection.residue)) - (projection.partial_residue | 0)- (laSuma+acum)){
                    mdprogrammed.setProperty("/name/state", "None");
                    mdprogrammed.setProperty("/name/stateText", "");
                    // mdprogrammed.setProperty("/confirmBtn", true);
                    mdprogrammed.setProperty("/confirmMore", true);

                } else {
                    console.log("el residuo en el else");
                    console.log(Math.abs(parseInt(projection.residue)));

                    // if (parseInt(value) > residue) {
                    //   console.log("el residuo en el if")
                    //   console.log(residue)
                    //   mdprogrammed.setProperty("/name/state", "Error");
                    //   mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera al saldo");
                    //   mdprogrammed.setProperty("/confirmBtn", false);
                    // }
                    console.log(saldoReal,laSuma+acum)

                    if (parseInt(value) > found.available - asig) {
                        mdprogrammed.setProperty("/name/state", "Error");
                        mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera la disponibilidad de la máquina");
                        mdprogrammed.setProperty("/confirmMore", false);
                        // mdprogrammed.setProperty("/confirmBtn", false);
                    }

                    if (parseInt(value) > saldoReal - (laSuma+acum)) {
                        console.log("entro en el if del saldo");
                        mdprogrammed.setProperty("/name/state", "Error");
                        mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera el saldo");
                        mdprogrammed.setProperty("/confirmMore", false);
                        // mdprogrammed.setProperty("/confirmBtn", false);
                    }

                    if (parseInt(value) > projection.quantity - Math.abs(parseInt(projection.residue))) {
                        console.log("entro en el if del saldo");
                        console.log(projection.quantity,Math.abs(parseInt(projection.residue)), (projection.partial_residue | 0)- (laSuma+acum))
                        mdprogrammed.setProperty("/name/state", "Error");
                        mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera el saldo");
                        mdprogrammed.setProperty("/confirmMore", false);
                        // mdprogrammed.setProperty("/confirmBtn", false);
                    }

                    // if (value == '') {
                    //   mdprogrammed.setProperty("/name/state", "Error");
                    //   mdprogrammed.setProperty("/name/stateText", "La cantidad programada no debe estar vacia");
                    //   mdprogrammed.setProperty("/confirmBtn", false);
                    // }
                }

                return false;
            }
        },

        reports: function () {
            var mdreports = this.getModel("mdreports");
            console.log("presione el boton de reportes");
            let date1 = this.getView().byId("sd").mProperties.value,
                date2 = this.getView().byId("sd2").mProperties.value,
                breed_id = this.getView().byId("breedSelect2").getSelectedKey(),
                breed_name = this.getView().byId("breedSelect2").mProperties.text,
                partnership_id = this.getView().getModel("ospartnership").getProperty("/selectedRecords/").partnership_id,
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");

            let aDate = date1.split("-"),
                init_date = `${aDate[0]}/${aDate[1]}/${aDate[2]}`;

            let aDate2 = date2.split("-"),
                end_date = `${aDate2[0]}/${aDate2[1]}/${aDate2[2]}`;

            if (date1 === null || date1== "" || date2 === null || date2== "" ){
                this.getView().byId("sd").setValue("");
                this.getView().byId("sd2").setValue("");
                MessageToast.show("Especifique el rango de fecha a consultar");
            } else {
                if (!this.validateDate(date1) || !this.validateDate(date2)) {
                    this.getView().byId("sd").setValue("");
                    this.getView().byId("sd2").setValue("");
                    MessageToast.show("El rango de fecha ingresado, es inválido");
                }

                if (breed_name === "Todas") {
                    breed_id = 0;
                }
                
                console.log("las fechas");
                console.log(date1);
                console.log(date2);
                console.log(breed_id);
                console.log("EL MODELO CON FECHAS");
                console.log(mdreports);
                let serverName = "/reports/incubator";

                fetch(serverName, {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        date1: date1,
                        date2: date2,
                        breed_id: breed_id,
                        partnership_id: partnership_id,
                        scenario_id: scenario_id
                    })
                }).then(function(response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status code: " + response.status);
                        return;
                    }

                    response.json().then(function (res) {
                        console.log("la respuesta despues de reportes");
                        console.log(res);
                        mdreports.setProperty("/records", res.data);
                        console.log("la longitud");
                        console.log(res.data.length);
                        if (res.data.length > 0) {
                            mdreports.setProperty("/reportsBtn", true);
                            mdreports.setProperty("/desde", init_date);
                            mdreports.setProperty("/hasta", end_date);
                            mdreports.setProperty("/visible", true);
                        } else {
                            mdreports.setProperty("/reportsBtn", false);
                            mdreports.setProperty("/visible", false);
                        }

                        resolve(res.data);
                    });
                }).catch(function(err) {
                    console.error("Fetch error:", err);
                });
            }
        },

        generatedCSV: function () {
            var mdreports = this.getModel("mdreports").getProperty("/records");
            console.log(mdreports);
            this.arrayObjToCsv(mdreports);
            // this.arrayObjToCsv();
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
                var array = ["Fecha","Lote de Incubadora","Máquina","Cantidad Ejecutada"];
                // var array = ["Fecha","Lote de Incubadora","Máquina", "Cantidad Asignada", "Cantidad Ejecutada", "Variación Cantidad"];
                console.log(array);
                console.log("EL ARRAY");
                console.log(ar);
                for (var i = 0; i < ar.length; i++) {
                 
    
                    console.log("se supone que las cabeceras");
                    console.log(Object.keys(ar[i]));
                    //construimos cabecera del csv
                    if (i == 0)
                        contenido += array.join(";") + "\n";
                        //resto del contenido
                    contenido += Object.keys(ar[i]).slice(1).map(function(key){
                        return ar[i][key];
                    }).join(";") + "\n";
                }
                console.log(contenido);
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
                                console.log("Buscando incubadora: ", res.data);
                                // inreal.setProperty("/plantaIncubadora", res.data);
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
            console.log(serverName);

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

        onPressSales: function (oEvent) {
            let view = this.getView(),
                date_init = view.byId("sales_date").getValue(),
                date_finish = view.byId("sales_date2").getValue(),
                incubatorplant_id = view.byId("selectIncubatorPlantSale").getSelectedKey(),
                mdprogrammed = this.getModel("mdprogrammed"),
                mdprojected = this.getModel("mdprojected"),
                breed_id = view.byId("breedSelectSale").getSelectedKey(),
                dateValidate = false;

            mdprojected.setProperty("/recordsSales", []);

            if (date_init == date_finish && date_init !== "" && date_finish !== "") {
                dateValidate = true
            } else {
                if (!this.validateDate(date_init) || !this.validateDate(date_finish)) {
                    this.getView().byId("sales_date").setValue("");
                    this.getView().byId("sales_date2").setValue("");
                    MessageToast.show("El rango de fecha ingresado, es inválido");
                }

                dateValidate = this.compareDate(date_init, date_finish)
            }

            if (date_init !== null && date_finish !== null && breed_id !== "" && dateValidate) {
                date_init = date_init.split("-").reverse().join("/")
                date_finish = date_finish.split("-").reverse().join("/")
                console.log("Rango de fechas:", date_init, date_finish)
                const serverName = "/incubatorSales/findIncubatorSales";
                fetch(serverName, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        beginning: date_init,
                        ending: date_finish,
                        breed_id: breed_id,
                        incubator_plant_id: incubatorplant_id
                    })
                }).then(function (response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status Code: " +
                            response.status);
                        return;
                    }

                    response.json().then(function (res) {
                        console.log("el resultado de las incubadoras por dia", res.data);
                        mdprogrammed.setProperty("/enabled", true)
                        if (res.data.length > 0) {
                            mdprojected.setProperty("/recordsSales", res.data)
                        } else {

                            MessageToast.show("No se encontraron ventas para el rango de fecha indicado")
                        }
                    });
                }).catch(function (err) {
                    console.error("Fetch error:", err);
                });
            } else {
                if ((date_init == "" || date_finish == "") && dateValidate == false) {
                    MessageToast.show("Especifique el rango de fecha a consultar")
                } else if ((date_init !== "" && date_finish !== "") && dateValidate == false) {
                    this.getView().byId("sales_date").setValue("");
                    this.getView().byId("sales_date2").setValue("");
                    MessageToast.show("El rango de fecha ingresado, es inválido");
                }
            }
        },

        compareDate: function (date1, date2) {
            let nDate = date1.split("-"),
                nDate2 = date2.split("-");
            let flag;
            console.log("Vector:", nDate2);
            console.log("Vector:", nDate);
            //año galpon mayor
            console.log("ESTOY EN COMPARE DATE!!!");
            if (nDate[2] < nDate2[2]) {
                flag = true;
            } else
                if (nDate[2] === nDate2[2]) {
                    //años iguales
                    if (nDate[1] === nDate2[1]) {
                        //meses iguales
                        if (nDate[0] === nDate2[0]) {
                            //dias iguales
                            flag = false;
                        } else
                            if (nDate[0] < nDate2[0]) {
                                //años iguales, meses iguales dia mayor
                                flag = true;
                            } else {
                                flag = false;
                            }

                    } else
                        if (nDate[1] < nDate2[1]) {
                            flag = true;
                        } else {
                            flag = false;
                        }

                } else {
                    flag = false;
                }

            return flag;
        },

        onDialogPressDet: function (oEvent) {
            let that = this,
                path = oEvent.getSource().oPropagatedProperties.oBindingContexts.mdprojected.sPath;
            let date_init = this.getView().byId("sales_date").mProperties.value
            let date_finish = this.getView().byId("sales_date2").mProperties.value
            let date_initV = this.getView().byId("sales_date").mProperties.dateValue
            let date_finishV = this.getView().byId("sales_date2").mProperties.dateValue
            let mdprojected = this.getModel("mdprojected")
            console.log("path: ", path, date_init, date_finish);
            let cad = path.split("/")
            cad = cad[cad.length - 1]
            let ids = new Array()
            ids.push(mdprojected.getProperty("/recordsSales")[cad])
            console.log("Ids", ids)

            console.log("Hoooolaaaa ", ids[0].incubator_sales_id)

            var dialog = new Dialog({
                title: "Información",
                type: "Message",
                state: "Warning",
                content: new Text({
                    text: "¿Desea eliminar la venta seleccionada?."
                }),
                beginButton: new Button({
                    text: "Aceptar",
                    press: function () {


                        that.onDeleteProjected(path, oEvent);
                        dialog.close();


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


            /*
      let that = this;
      let dialog = this.dialogDelete;
      let mdprojected = this.getModel("mdprojected");
      console.log("el id:: ", mdprojected.getProperty("/shed_id") );
      console.log(dialog)
        //Botón cancelar:
        console.log(sap.ui.getCore())
        sap.ui.getCore().byId("cancelBtnDelete").attachPress(function() {
          dialog.close();
          console.log("el id:: ", mdprojected.getProperty("/shed_id") );
          // dialog.destroy();
        });

        //  //Botón cancelar:
        //  sap.ui.getCore().byId("aceptBtnEviction").attachPress(function() {
        //   dialog.close();
        //   this.onDialogPressExAcept();
        //   // dialog.destroy();
        // });

        //Agregamos como dependiente el dialogo a la vista:
        this.getView().addDependent(dialog);

        //Abrimos el dialogo:
        dialog.open();*/


        },
        onDeleteProjected: function (path, oEvent) {
            let mdprojected = this.getView().getModel("mdprojected"),
                selectedItem = mdprojected.getProperty(path),
                id = selectedItem.housing_way_id,
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
            let that = this
            console.log("Hiiiii babeeee")
            let date_init = this.getView().byId("sales_date").mProperties.value
            let date_finish = this.getView().byId("sales_date2").mProperties.value
            //this.getView().byId("sales_date").mProperties.value = ""
            //this.getView().byId("sales_date2").mProperties.value = ""
            let mdincubatorplant = this.getModel("mdincubatorplant").getProperty("/records")[0]
            let mdprogrammed = this.getModel("mdprogrammed")

            date_init = date_init.split("-").reverse().join("/")
            date_finish = date_finish.split("-").reverse().join("/")
            let cad = path.split("/")
            cad = cad[cad.length - 1]
            let ids = new Array()
            ids.push(mdprojected.getProperty("/recordsSales")[cad])


            const serverName = "/incubatorSales/updateDeletedIncubatorSales";
            if (date_init !== null && date_finish !== null && ids.length) {
                fetch(serverName, {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "PUT",
                    body: JSON.stringify({
                        ids: ids
                    })
                })
                    .then(
                        function (response) {
                            if (response.status !== 200 && response.status !== 409) {
                                console.log("Looks like there was a problem. Status Code: " +
                                    response.status);
                                return;
                            }

                            if (response.status === 409) {
                                var dialog = new Dialog({
                                    title: "Información",
                                    type: "Message",
                                    state: "Error",
                                    content: new Text({
                                        text: "No se puede eliminar la proyección, porque ya ha sido programada."
                                    }),
                                    beginButton: new Button({
                                        text: "OK",
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

                            if (response.status === 200) {
                                response.json().then(function (res) {
                                    mdprojected.setProperty("/recordsSales", res.data);
                                    mdprojected.refresh(true);

                                    var dialog = new Dialog({
                                        title: "Información",
                                        type: "Message",
                                        state: "Success",
                                        content: new Text({
                                            text: "Venta eliminada con éxito."
                                        }),
                                        beginButton: new Button({
                                            text: "OK",
                                            press: function () {
                                                dialog.close();
                                                mdprojected.setProperty("/recordsSales", res.data);
                                                mdprojected.refresh(true);
                                                if (date_init !== "" && date_finish !== "") {
                                                    that.onPressSales2()
                                                } else
                                                    if (res.incubator_sales_id !== "") {
                                                        that.onAct()
                                                    }
                                                let date_initV = that.getView().byId("sales_date").mProperties.dateValue
                                                let date_finishV = that.getView().byId("sales_date2").mProperties.dateValue

                                            }
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                            //that.getView().byId("breedSelectSale").setSelectedKey("")
                                        }
                                    });

                                    dialog.open();
                                    console.log(res);

                                });
                            }

                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });

            } else {


                MessageToast.show("Ingrese el rango de fecha válido para eliminar la venta")

                //mdprojected.setProperty("/recordsSales",[])
            }

        },

        onPressSales2: function (oEvent) {

            let date_init = this.getView().byId("sales_date").mProperties.value
            let date_finish = this.getView().byId("sales_date2").mProperties.value
            let date_initV = this.getView().byId("sales_date").mProperties.dateValue
            let date_finishV = this.getView().byId("sales_date2").mProperties.dateValue
            let mdincubatorplant = this.getModel("mdincubatorplant").getProperty("/records")[0]
            let mdprogrammed = this.getModel("mdprogrammed")
            let mdprojected = this.getModel("mdprojected")
            mdprojected.setProperty("/recordsSales", [])
            let breed_id = this.getView().byId("breedSelectSale").mProperties.selectedKey
            let dateValidate = false


            if (date_init == date_finish && date_init !== "" && date_finish !== "") {
                dateValidate = true
            } else {
                dateValidate = this.compareDate(date_init, date_finish)
            }

            if (date_init !== null && date_finish !== null && breed_id !== "" && dateValidate) {

                date_init = date_init.split("-").reverse().join("/")
                date_finish = date_finish.split("-").reverse().join("/")
                console.log("Planta Incubadora ", date_init, date_finish)
                const serverName = "/incubatorSales/findIncubatorSales";
                fetch(serverName, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        beginning: date_init,
                        ending: date_finish,
                        breed_id: breed_id,
                        incubator_plant_id: mdincubatorplant.incubator_plant_id
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
                                console.log("el resultado de las incubadoras por dia", res.data);
                                mdprogrammed.setProperty("/enabled", true)
                                if (res.data.length > 0) {
                                    mdprojected.setProperty("/recordsSales", res.data)
                                }
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            } else {
                if ((date_init == "" || date_finish == "") && dateValidate == false) {
                    MessageToast.show("Especifique el rango de feha a consultar")
                } else if ((date_init !== "" && date_finish !== "") && dateValidate == false) {
                    this.getView().byId("sales_date").setValue("")
                    this.getView().byId("sales_date2").setValue("")
                    MessageToast.show("El rango de fecha ingresado, es inválido")
                }
            }
        },

        onPress: async function () {
            console.log("OnPress");
            this.getView().byId("projectedTable").removeSelections();
            let mdprojected = this.getModel("mdprojected");
            let partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            // let util = this.getModel("util");
            let incubator_plant_id = this.getView().byId("selectIncubatorPlant").getSelectedKey();
            let activeS = await this.activeScenario();
            let scenario_id = activeS.scenario_id;
            // let scheduled_date = this.getView().byId("scheduled_date").mProperties.value;
            let scheduled_date = this.getView().byId("scheduled_date").mProperties.value;
            let scheduled_date2 = this.getView().byId("scheduled_date2").mProperties.value;
            let breed_id = this.getView().byId("breedSelect").getSelectedKey();
            let breed_name = this.getView().byId("breedSelect").getSelectedItem().mProperties.text;
            let plexus = 0;
            let parentLot = this.getView().byId("parentLotSelect").getSelectedKey();

            console.log("breed_id", breed_id);
            console.log("parentLot", parentLot);

            if(parentLot !== ''){
                if (((!parentLot) && parentLot !== "Todos" && parentLot !== "") && (!scheduled_date && !scheduled_date2)) {
                    this.getView().byId("scheduled_date").setValue("");
                    this.getView().byId("scheduled_date2").setValue("");
                    MessageToast.show("Especifique el rango de fecha a consultar");
                } else {
                    if ((parentLot !== "Todos" && parentLot !== "") && (!this.validateDate(scheduled_date) || !this.validateDate(scheduled_date2))) {
                        this.getView().byId("scheduled_date").setValue("");
                        this.getView().byId("scheduled_date2").setValue("");
                        MessageToast.show("El rango de fecha ingresado, no es válido");
                    }
    
                    if (breed_name === "Todas") {
                        let objFind = {
                            scenario_id: scenario_id,
                            init_date: scheduled_date,
                            end_date: scheduled_date2,
                            incubator_plant_id: incubator_plant_id,
                            partnership_id: partnership_id
                        };
                        this.findAllBreeds(objFind);
                    } else {
                        console.log("raza:", this.getView().byId("breedSelect").getSelectedItem().mProperties.text);
                        // console.log(this.getView().byId("breedSelect").mProperties.text);
    
                        if (this.getView().byId("breedSelect").getSelectedItem().mProperties.text === "Plexus") {
                            console.log("entro en plexus");
                            plexus = 1;
                        }
    
                        const serverName = "/coldRoom/findProjectIncubator";
                        let serach
                        if (parentLot === "Todos") {
                            serach = {
                                scenario_id: scenario_id,
                                init_date: scheduled_date,
                                end_date: scheduled_date2,
                                incubator_plant_id: incubator_plant_id,
                                partnership_id: partnership_id,
                                breed_id: breed_id,
                                plexus: plexus,
                                parentLot: parentLot
                            };
                        } 
                        else {
                            console.log(scheduled_date,scheduled_date2)
                            serach = {
                                scenario_id: scenario_id,
                                init_date: scheduled_date,
                                end_date: scheduled_date2,
                                incubator_plant_id: incubator_plant_id,
                                partnership_id: partnership_id,
                                breed_id: breed_id,
                                plexus: plexus,
                                parentLot: parentLot
                            };
                        }
                       
                        fetch(serverName, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(serach)
                        }).then(
                            function (response) {
                                if (response.status !== 200) {
                                    console.log("Looks like there was a problem. Status code: " + response.status);
                                    return;
                                }
    
                                response.json().then(function (res) {
                                    console.log("Buscando incubadora: este es el controller", res.data);
                                    mdprojected.setProperty("/records", res.data);
                                    mdprojected.setProperty("/search", serach);
                                    mdprojected.setProperty("/raza", false);
                                    console.log(mdprojected);
                                    mdprojected.refresh();
    
                                });
                            }
                        ).catch(function (err) {
                            console.error("Fetch error:", err);
                        });
                    }
                }

            }else{
                MessageToast.show("Indique lote padre");
            }
            
        },

        findAllBreeds: function (objFind) {
            let mdprojected = this.getModel("mdprojected");

            console.log("la raza");
            const serverName = "/coldRoom/findProjectIncubatorAll";
              
            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    obj: objFind
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
                            console.log("Buscando incubadora: ", res.data);
                            mdprojected.setProperty("/records", res.data);
                            mdprojected.setProperty("/raza",true);
                            console.log(mdprojected);
                            mdprojected.refresh();

                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        }, 

        onProjectedNext: function(oEvent) {
            this.hideButtons(true, false, false, false, false);
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            const util = this.getModel("util");
            console.log(mdprogrammed.getProperty("/selectedRecords"));
    
            mdprogrammed.setProperty("/enabledTabAssigned", true);

            this.getView().byId("tabBar").setSelectedKey("ktabProgrammed");
            console.log("entre0");
            console.log(mdprogrammed.getProperty("/selectedRecords"));

          
            fetch("/programmed_eggs/findProgrammedEggs", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    eggs_movements_id: mdprogrammed.getProperty("/selectedRecords").map(record => record.eggs_movements_id)
                })
            })
                .then(response => {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status Code: " +
                response.status);
                        return;
                    }
                    console.log("entre1");
                    response.json().then((res) => {
                        console.log(res);
                        let records = res.data;
                        
                        console.log("Entreee2");
                        console.log(records);
                        mdprogrammed.setProperty("/records", records);
    
                        console.log(records);
    
                        if (records.length > 0) {
                            mdprogrammed.setProperty("/executionSaveBtn", true);
                            console.log(records);
                            let residue_programmed = res.residue,
                                projected_quantity = mdprogrammed.getProperty("/selectedRecord/projected_quantity"),
                                total = projected_quantity - residue_programmed;
    
                            mdprogrammed.setProperty("/programmed_residue", total);
                            console.log(mdprogrammed);
                        } else {
                            console.log("onProjectedNext");
                            
                            mdprogrammed.setProperty("/programmed_residue", mdprogrammed.getProperty("/selectedRecord/projected_quantity"));
                            mdprogrammed.setProperty("/executionSaveBtn", false);
                        }
                        util.setProperty("/busy/", false);
                    });
    
    
                })
                .catch(err => console.log);
        },
    
        onSelectProgrammedRecords: function(oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            const mdprojected = this.getView().getModel("mdprojected");
            let minDate;
            const projectedTable = this.getView().byId("projectedTable");
            console.log("entre");
            const projections = projectedTable.getSelectedItems().map(item => mdprojected.getProperty(item.getBindingContext("mdprojected").getPath()));
            const actualRecords = mdprogrammed.getProperty("/selectedRecords");
            projections.forEach(element => {
                console.log(element.fecha_movements)
                let date_aux = new Date(element.fecha_movements)
                console.log(date_aux)
                if(minDate !== undefined && minDate!== null && minDate!==""){
                    if(date_aux.getTime()>minDate.getTime()){
                        minDate=date_aux;
                    }
                }else{
                    minDate = date_aux
                }
            });
            mdprogrammed.setProperty("/minDate", minDate);
            // if (actualRecords.length > 0 && actualRecords[0].breed_name)
            mdprogrammed.setProperty("/selectedRecords", projections);
        },
    
        onSelectProgrammedRecord: function (oEvent) {
            this.hideButtons(true, true, false, false, false);
            console.log("esta es la funcion que necesito");

            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdprojected = this.getView().getModel("mdprojected"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                breed_id = this.getView().byId("breedSelect").getSelectedKey(),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");

            util.setProperty("/busy/", false);
            //guarda la ruta del registro proyectado que fue seleccionado
            if(oEvent){
                mdprogrammed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
                mdprogrammed.setProperty("/selectedRecord/", mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
                console.log("los seteado cuando se selecciono la proyeccion");
                console.log(mdprogrammed);
                mdprogrammed.setProperty("/selectedRecord/breed_id", parseInt(breed_id));
            }

            mdprogrammed.setProperty("/selectedRecord/partnership_id", partnership_id);

            //habilita el tab de la tabla de registros programado
            mdprogrammed.setProperty("/enabledTabAssigned", true);

            this.getView().byId("tabBar").setSelectedKey("ktabProgrammed");


            let eggs_movements_id = mdprogrammed.getProperty("/selectedRecord/eggs_movements_id");
            console.log(eggs_movements_id);
            const serverName = "/programmed_eggs/findProgrammedEggs";


            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    eggs_movements_id: eggs_movements_id
                // partnership_id: partnership_id,
                // breed_id: breed_id,
                // incubator_plant_id: mdprogrammed.getProperty("/selectedRecord/incubator_plant_id"),
                // date: mdprogrammed.getProperty("/selectedRecord/posture_date")
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
                            console.log("el records traido de la consulta");
                            console.log(records);
                            mdprogrammed.setProperty("/records", records);
                            console.log(mdprogrammed);

                            let elRecords = mdprogrammed.getProperty("/records");
                            console.log(elRecords);

                            let laSuma = 0;
                            elRecords.forEach(item=>{
                                laSuma += item.execution_quantity;
                                // console.log("el item")
                                // console.log(item)
                                // item.assigned.forEach(item2=>{
                                // console.log("el item2")
                                // console.log(item2)
                      
                                // });
                            });

                            console.log(laSuma);
                            let pri = mdprogrammed.getProperty("/selectedRecord/quantity");
                            console.log(pri);
                            mdprogrammed.setProperty("/suma", laSuma);
                            mdprogrammed.setProperty("/programmed_residue", pri-laSuma);
                            console.log(mdprogrammed);
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });

            /*
      console.log(mdprogrammed);
      let pDate = mdprogrammed.getProperty("/selectedRecord/fecha_movements"),
        aDate = pDate.split("-"),
        minDate = new Date(aDate[2], aDate[1] - 1, aDate[0]),
        date2 = new Date(aDate[2], aDate[1] - 1, aDate[0]),
        maxDate = this.addDays(date2, 7);

          mdprogrammed.setProperty("/selectedRecord/minDate/", minDate);
          mdprogrammed.setProperty("/selectedRecord/maxDate/", maxDate);
          mdprogrammed.setProperty("/selectedRecord/_date/", minDate.getDate() + "/" + ("0" + (minDate.getMonth() + 1)).slice(-2) + "/" + minDate.getFullYear());

          //habilita el tab de la tabla de registros programado
          //mdprogrammed.setProperty("/enabledTabAssigned", true);

          this.getView().byId("tabBar").setSelectedKey("ktabProgrammed");

          console.log(mdprogrammed);
          //Buscar los registros de hausingway_detail
          const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findEggsStorageByDateDetail");
          console.log('eL sERVEname es : ' + serverName);
          // console.log(scenario_id);
          // console.log(breed_id);
          // console.log(mdprogrammed.getProperty("/selectedRecord/incubator_plant_id"));
          // console.log(mdprogrammed.getProperty("/selectedRecord/posture_date"));

          fetch(serverName, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
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
                  console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                  return;
                }

                response.json().then(function (res) {
                  let records = res.data;

                  records.forEach(item => {
                    item.assigned = [];
                  });

                  mdprogrammed.setProperty('/lot_records', records);
                  console.log("Records antes")
                  console.log(mdprogrammed)
                  mdprogrammed.setProperty('/records', res.records);
                  console.log("Records despyes")
                  console.log(mdprogrammed)
                  let isMessageStrip = mdprogrammed.getProperty("/selectedRecord/incubatorList");

                  if (isMessageStrip.length > 0) {
                    mdprogrammed.setProperty("/selectedRecord/showIcon", false);

                  } else {
                    mdprogrammed.setProperty("/selectedRecord/showIcon", true);


                  }
                  let projected_quantity = mdprogrammed.getProperty('/selectedRecord/available');
       
                  console.log(records);
                  console.log("res: ", res);
                  let cantidadAignadaHastaAhoraEggs = 0;
                  res.records.forEach(item => {
                    cantidadAignadaHastaAhoraEggs = cantidadAignadaHastaAhoraEggs + item.eggs
                  });


                  let residue_programmed = res.available,
                  total = residue_programmed - cantidadAignadaHastaAhoraEggs ;
                  // debugger;
                  console.log("EL TOTAL AMIGO ES -- > " + total);  
                  console.log(residue_programmed, '-',cantidadAignadaHastaAhoraEggs );
                  
                  mdprogrammed.setProperty('/selectedRecord/available', total);

                  if (records.length > 0 && !mdprogrammed.getProperty("/selectedRecord/showIcon")) {
                    mdprogrammed.setProperty("/executionSaveBtn", true);
                    console.log(records);

                    console.log(res.records.length)
                    if (res.records.length > 0) {
                      that.hideButtons(true, true, false, false);
                    } else {
                      that.hideButtons(true, false, false, false);
                    }


                  } else if (res.records.length > 0) {
                    that.hideButtons(false, true, false, false);
                  } else {
                    mdprogrammed.setProperty("/executionSaveBtn", false);
                    console.log(mdprogrammed);
                  }
                  util.setProperty("/busy/", true);
                });
              }
            )
            .catch(function (err) {
              console.log('Fetch Error :-S', err);
            });
*/




        },
        onBreedLoad: function () {
            const util = this.getModel("util"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBreed");
            let inreal = this.getView().getModel("incubatorRealNew");
            let mdbreed = this.getModel("mdbreed"),
                that = this;
            mdbreed.setProperty("/records", []);

            let isRecords = new Promise((resolve, reject) => {
                fetch(serverName)
                    .then(
                        function (response) {
                            if (response.status !== 200) {

                                console.log("Looks like there was a problem. Status Code: " +
                      response.status);
                                return;
                            }
                            // Examine the text in the response
                            response.json().then(function (data) {
                                console.log(data.data);
                                // data.data.unshift({breed_id: 200, code: "Todas", name: "Todas"})
                                inreal.setProperty("/breed", data.data);
                                // mdbreed.setProperty("/value", mdbreed.getProperty("/records/0/breed_id"));
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
                    // mdbreed.setProperty("/value", mdbreed.getProperty("/records/0/breed_id"));
                    console.log(mdbreed);
                }
            });
        },
        loadInventory: function (partnership_id) {
            let mdinventory = this.getModel("mdinventory"),
                that = this,
                util = this.getModel("util");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findInventoryByPartnership");
            console.log("el serveName es  " + serverName);

            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: "partnership_id=" + partnership_id
            })
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                            return;
                        }

                        response.json().then(function (res) {
                            if (res.data.length > 0) {
                                mdinventory.setProperty("/records", res.data);
                                mdinventory.setProperty("/records2", res.data2);
                                //that.hideButtons(false, true, true);
                                console.log(res.data);
                                console.log("---------------------------");
                                console.log(res.data2);
                                // util.setProperty("/busy/", true);
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
                            })
                                .then(function (response2) {
                                    if (response2.status !== 200) {
                                        console.log("Looks like there was a problem. Status Code: " +
                          response.status);
                                        return;
                                    }
                                    response2.json().then(function (res) {
                                        // console.log(res.data.length)
                                        if (res.data.length > 0) {
                                            mdinventory.setProperty("/recordsReal", res.data);
                                        } else {
                                            mdinventory.setProperty("/recordsReal", []);
                                        }
                                    });
                                });

                            util.setProperty("/busy/", true);
                        });
                    });

        },
        onDialogPressPg: function(oEvent){
            this.formProgrammed = sap.ui.xmlfragment(
                "incubatorPlanningM.view.DialogProgrammer", this);
            var that = this;
            var dlg = sap.ui.getCore().byId("dialogprogrammed");
            dlg.attachAfterClose(function () {
                that.formProgrammed.destroy();
            });
            this.getView().addDependent(this.formProgrammed);
            this.formProgrammed.open();
            let mdprogrammed = this.getModel("mdprogrammed");
            // mdprogrammed.setProperty("/enabledTabAssigned", false);



            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
            mdprogrammed.setProperty("/confirmMore", false);
            sap.ui.getCore().byId("assigned_quantity").setValue();

            // let partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
            //     util = this.getModel("util"),
            //     incubator_plant_id = this.getView().byId("selectIncubatorPlant").getSelectedKey(),
            //     activeS = await this.activeScenario(),
            //     scenario_id = activeS.scenario_id;

            // let mdprogrammed = this.getView().getModel("mdprogrammed")
            let mdincubator = this.getView().getModel("mdincubator");
            let lot = [];

            mdincubator.setProperty("/assigned", lot );
            mdincubator.setProperty("/list", lot );
            mdprogrammed.setProperty("/lot_records/", lot);
            mdprogrammed.refresh();
            mdincubator.refresh();

            console.log("el mdprogrammed en el boton nuevo");
            console.log(mdprogrammed);

            let date = mdprogrammed.getProperty("/selectedRecord/_date");
            console.log("la fecha que me importa");
            console.log(date);

     
            // let mdincubator = this.getModel("mdincubator");
      

            let incubator_plant_id = this.getView().byId("selectIncubatorPlant").getSelectedKey();

            console.log("incubator incubator_plant_id");
            console.log(incubator_plant_id);


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
                            console.log("el resultado de las incubadoras", res);
                            mdincubator.setProperty("/list2", res.data);
                            console.log("el modelo incubator en el new");
                            console.log(mdincubator);
                            mdincubator.refresh(true);
                  

                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });




        },
        onProgrammedCloseDialog: function(){
            console.log("entro en el que destruyeme");
            this.closeProgrammedDialog();
            let mdprogrammed = this.getView().getModel("mdprogrammed");
            let mdincubator = this.getView().getModel("mdincubator");
            let lot = [];

            mdincubator.setProperty("/assigned", lot );
            mdincubator.setProperty("/list", lot );
            mdincubator.setProperty("/available","");
            mdprogrammed.setProperty("/lot_records/", lot);
            mdprogrammed.refresh();
            mdincubator.refresh();
            this.formProgrammed.close();
            this.formProgrammed.destroy();
        },
        onDialogPressReal: function (oEvent) {
            this.formInventoryReal = sap.ui.xmlfragment(
                "incubatorPlanningM.view.DialogNewInventoryReal", this);
            this.getView().addDependent(this.formInventoryReal);
            this.formInventoryReal.open();
            this.getModel("mdprogrammed").setProperty("/enabledTabInvetoryReal", false);
        },
        onInventoryRealCloseDialog: function () {
            this.formInventoryReal.close();
            this.formInventoryReal.destroy();
        },
        onDialogSettingsDisp: function(oEvent){

            // this.activeAcc = this.getView().getModel("mdinventory").getProperty("/Setting/activeAcc");
            // this.activeApp = this.getView().getModel("mdinventory").getProperty("/Setting/activeApp");
            // this.activeExp = this.getView().getModel("mdinventory").getProperty("/Setting/activeExp");

            // this.getView().byId("switch_active1").setState(this.activeAcc);
            // this.getView().byId("switch_active2").setState(this.actactiveAppive);
            // this.getView().byId("switch_active3").setState(this.activeExp);

            this.formSettingsDisp = sap.ui.xmlfragment(
                "incubatorPlanningM.view.DialogSettingDisp", this);
            this.getView().addDependent(this.formSettingsDisp);
            this.formSettingsDisp.open();
  
        },
        onSettingsDispCloseDialog: function () {
            this.formSettingsDisp.close();
            this.formSettingsDisp.destroy();
        },
        onDialogPressAssigned: async function(oEvent){

            console.log("oEvent: ", oEvent.getSource()._aSelectedPaths[0]);
            let mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdincubator = this.getView().getModel("mdincubator"),
                incubator_id = mdprogrammed.getProperty("/selectedRecord/incubatorId"),
                select_paths = oEvent.getSource()._aSelectedPaths[0],
                aSelect_paths = select_paths.split("/"),
                itemSelect = aSelect_paths[1];

            mdprogrammed.setProperty("/programmedSaveDialog", false);
            console.log("Item select: ", aSelect_paths[2]);

            //habilita el tab de la tabla de registros programado
            mdprogrammed.setProperty("/rProgrammed/enabledTab", true);
            mdprogrammed.setProperty("/enabledTabAssigned", true);
            mdincubator.setProperty("/list", mdprogrammed.getProperty("/selectedRecord/incubatorList") );
            mdincubator.setProperty("/listID", aSelect_paths[2] );

            let lot = mdprogrammed.getProperty("/lot_records/"+ aSelect_paths[2] +"/assigned"),
                residue = 0;

            console.log("lot:", lot);
            mdincubator.setProperty("/assigned", lot );

            if (lot.length > 0) {
                lot.forEach(item=>{
                    residue += parseInt(item.quantity_eggs);
                });
                residue = mdprogrammed.getProperty("/lot_records/"+ aSelect_paths[2]  +"/eggs") - residue;
            } else {
                residue = mdprogrammed.getProperty("/lot_records/"+ aSelect_paths[2]  +"/eggs");
            }

            mdincubator.setProperty("/residue", residue);
            console.log(mdincubator);
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

        onAddResidue: function(oEvent) {
            const quantity = parseInt(sap.ui.getCore().byId("assigned_quantity").getValue(), 10);
            const selectedProjectionId = sap.ui.getCore().byId("projection_select").getSelectedKey();
            const dateInput = sap.ui.getCore().byId("programmed_date");
            const date = dateInput.getValue();

            const projection = this.getModel("mdprogrammed").getProperty("/selectedRecords").find(records => records.eggs_movements_id == selectedProjectionId);
            const assigned = this.getModel("mdprogrammed").getProperty("/assigned");

            if (date === undefined || date === "") {
                dateInput.setValueState("Error");
                return;
            }
            else {
                dateInput.setValueState("None");
            }

            const incubatorSelect = sap.ui.getCore().byId("selectIncubator");
            const incubatorKey = shedSelect.getSelectedKey();
            console.log("incubatorKey", incubatorKey);
            if (incubatorKey === undefined || incubatorKey === "") {
                incubatorSelect.setValueState("Error");
                return;
            }
            else {
                incubatorSelect.setValueState("None");
            }


            if (quantity !== "" && quantity !== undefined && quantity > 0) {
                const oldAssigned = assigned.find(assig => assig.projection.eggs_movements_id == projection.eggs_movements_id);
                if (oldAssigned) {
                    oldAssigned.quantity += quantity;
                }
                else {
                    assigned.push({
                        quantity,
                        projection
                    });
                }
          
                this.getModel("mdprogrammed").setProperty("/assigned", assigned);
            }
        },
        onAddIncubator: function(){

            let selected_incubator = sap.ui.getCore().byId("selectIncubator").getSelectedKey(),
                quantity_eggs = parseInt(sap.ui.getCore().byId("assigned_quantity").mProperties.value,10),
                mdincubator = this.getView().getModel("mdincubator"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                available = mdincubator.getProperty("/available");
            const selectedProjectionId = sap.ui.getCore().byId("projection_select").getSelectedKey();


            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", true);

            let fecha = sap.ui.getCore().byId("programmed_date").mProperties.value;
            console.log(fecha);

            console.log("mdincubator: ", mdincubator);
            console.log("mdprogrammed: ", mdprogrammed);
            console.log("Item select: ", sap.ui.getCore().byId("selectIncubator").getSelectedItem());
            console.log("Incubator: ", selected_incubator);
            console.log("quantity_eggs: ", quantity_eggs);

            let iName = sap.ui.getCore().byId("selectIncubator").getSelectedItem(),
                name = iName.mProperties.text;

            console.log("nombre incubadora");
            console.log(name);
            const projection = this.getModel("mdprogrammed").getProperty("/selectedRecords").find(records => records.eggs_movements_id == selectedProjectionId);
            const assigned = this.getModel("mdprogrammed").getProperty("/assigned");
    
            let lot = mdprogrammed.getProperty("/lot_records/");
            console.log(lot);

            if(lot === undefined){
                lot = [];
            }

            // lot.push({
            //   selected_incubator: parseInt(selected_incubator),
            //   quantity_eggs: parseInt(quantity_eggs),
            //   name: name,
            //   fecha: fecha
            // });

            if (quantity_eggs !== "" && quantity_eggs !== undefined && quantity_eggs > 0) {
                mdincubator.setProperty("/available", parseInt(available)-parseInt(quantity_eggs));
                const oldAssigned = lot.find(assig => assig.projection.eggs_movements_id == projection.eggs_movements_id);
                if (oldAssigned) {
                    oldAssigned.quantity_eggs += quantity_eggs;
                    projection.partial_residue += quantity_eggs;
                }
                else {
                    lot.push({
                        selected_incubator: parseInt(selected_incubator),
                        quantity_eggs: parseInt(quantity_eggs),
                        name: name,
                        fecha: fecha,
                        projection
                    });
                    projection.partial_residue = quantity_eggs;
                }
                sap.ui.getCore().byId("assigned_quantity").setValue("");
            }
    
            mdprogrammed.setProperty("/lot_records/", lot);
            mdincubator.setProperty("/assigned", lot );

            sap.ui.getCore().byId("assigned_quantity").setValue(0);
            console.log("mdprogrammed luego del lote: ", mdprogrammed);
            /*

      let lot = mdprogrammed.getProperty("/lot_records/"+ mdincubator.getProperty("/listID")+"/assigned" ),
          iName = sap.ui.getCore().byId("selectIncubator").getSelectedItem(),
          name = iName.mProperties.text;

          console.log("Lot: ", lot, 'name: ', name);

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

        console.log("lot: ", lot);
        console.log("listID: ", mdincubator.getProperty("/listID"));
      mdprogrammed.setProperty("/lot_records/"+ mdincubator.getProperty("/listID") +"/assigned", lot );
      mdincubator.setProperty("/assigned", lot );
      let residue = mdprogrammed.getProperty("/lot_records/"+ mdincubator.getProperty("/listID") +"/eggs") - sum_eggs;
      console.log("Brayan: ", mdprogrammed.getProperty("/lot_records/"+ mdincubator.getProperty("/listID") +"/eggs"), " ", sum_eggs);
      mdincubator.setProperty("/residue" , residue );
      // let acumulado = mdincubator.getProperty("/acumulado")-sum_eggs;
      console.log("mdincubator en el boton mas")
      console.log(mdincubator)
      // mdincubator.setProperty("/acumulado" , acumulado );
      sap.ui.getCore().byId("assigned_quantity").setValue(0);
      console.log("mdprogrammed luego del lote: ", mdprogrammed);
      */

        },
        onProgrammedSaveDialog: function(){

            let that = this,
                util = this.getModel("util"),
                mdincubator = this.getView().getModel("mdincubator"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdprojected = this.getView().getModel("mdprojected"),
                search = mdprojected.getProperty("/search");

            console.log("Save: ", mdincubator);
            console.log("Save: ", mdprogrammed);


            // console.log("Lo asignado: ",mdincubator.getProperty("/assigned"))
            // let eggs_storage_id = [],
            //     projected = mdincubator.getProperty("/assigned");
            // console.log("projected: ",projected)
            // projected.forEach(element => {
            //   eggs_storage_id.push({eggs_storage_id: element.projection.eggs_storage_id, quantity: element.quantity_eggs})
            
            // });
            // console.log("los eggs_storage_id: ",eggs_storage_id)
            console.log("Mi incubator ------> ",mdincubator.getProperty("/selectedKey"))
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/addprogrammedeggs");
            console.log(serverName);
            mdprogrammed.setProperty("/confirmBtn",false);
            console.log("entre1");
            console.log("assigned",mdincubator.getProperty("/assigned"));
            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    records: mdincubator.getProperty("/assigned").map(asig => ({ 
                        eggs_movements_id: asig.projection.eggs_movements_id,
                        quantity_eggs: asig.quantity_eggs,
                        fecha: asig.fecha,
                        lot: asig.projection.lot,
                        eggs_storage_id: asig.projection.eggs_storage_id,
                    })),
                    search: search,
                    incubator_id: mdincubator.getProperty("/selectedKey"),
                    breed_id: mdincubator.getProperty("/assigned/0/projection/breed_id"),
                    // eggs_storage_id: mdincubator.getProperty("/assigned/0/projection/eggs_storage_id"),
                    lot_breed: mdincubator.getProperty("/assigned/0/projection/lot"),
                    incubator_plant_id: mdincubator.getProperty("/assigned/0/projection/incubator_plant_id"),
                    eggs_movements_id: mdincubator.getProperty("/assigned/0/projection/eggs_movements_id"),
                    scenario_id: mdincubator.getProperty("/assigned/0/projection/scenario_id"),
                    partnership_id: this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                    description_adjustment: "Carga en máquina"

                })
            })
                .then(
                    function(response) {
                        console.log("entre2");
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                            return;
                        }

                        response.json().then(function(res) {

                            //mdprojected.setProperty("/records", res.data);
                            //util.setProperty("/busy/", true);
                            //Si todo esta bien entrar aqui
                            mdprogrammed.getProperty("/selectedRecords").forEach(record => {
                                console.log("partial_residue", record.partial_residue);
                                record.residue = Math.abs(parseInt(record.residue, 10)) + parseInt(record.partial_residue|0);
                                record.partial_residue = 0;
                            });
                            let search = res.search;
                            console.log(mdprogrammed.getProperty("/selectedRecords"));
    
                            that.formProgrammed.close();
                            that.formProgrammed.destroy();
                            console.log("LA DATA SETEADA");
                            console.log(res);
                            console.log(res.data);
            
                            mdprogrammed.setProperty("/records", res.data);
                            console.log(mdprogrammed.getProperty("/records"));
                            mdprogrammed.refresh(true);
                            console.log("modelo incubadora ok");
                            console.log(mdprogrammed);
                            let asig =  res.data;
                            console.log("asig: ", asig);
                            let asigSum = 0;
                            // asig.forEach(item=>{
                            //   asigSum += item.eggs;
                            // });
                            console.log("1: ", asigSum);
                            console.log("1: ", mdprogrammed.getProperty("/selectedRecord/available"));
                            mdprogrammed.setProperty("/selectedRecord/available", mdprogrammed.getProperty("/selectedRecord/available") - asigSum);


                            mdprogrammed.refresh();
                            console.log("el modelo final despues de guardar tooooooodo");
                            console.log(mdprogrammed);
                            // that.hideButtons(true, true, false, false);
                            // that.onSelectProgrammedRecord();


                            mdincubator.setProperty("/list", res.ava);
                            mdincubator.setProperty("/available","");
                            mdprogrammed.setProperty("/assigned", []);
                            mdprojected.setProperty("/records", search)
                            console.log("EL INCUBATOR NEWWWWWWWWWWWWWWWWWWWWWWW");
                            console.log(mdincubator);
                            that.onProjectedNext();
                            var dialog = new Dialog({
                                title: "Información",
                                type: "Message",
                                state: "Success",
                                content: new Text({
                                    text: "Registros guardados con éxito."
                                }),
                                beginButton: new Button({
                                    text: "OK",
                                    press: function () {
                                        dialog.close();



                                        //that.hideButtons(false, true, true);
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
        hideButtons: function (programmed, execution, real, reports, sales) {

            let mdprogrammed = this.getModel("mdprogrammed");
            let mdreports = this.getModel("mdreports");
            let mdexecuted = this.getModel("mdexecuted");
            let mdprojected = this.getModel("mdprojected")
            let mdbreed = this.getModel("mdbreed")
            let records = mdbreed.getProperty("/records")

            mdprogrammed.setProperty("/programmedNewBtn", programmed);
            mdprogrammed.setProperty("/projectedSaveBtn", execution);
            mdexecuted.setProperty("/executionSaveBtn", execution);
            mdprogrammed.setProperty("/executionNewReal", real);
            mdprogrammed.setProperty("/sales", sales)

            console.log("Entre y no cambio");
            // console.log("programmed",mdprogrammed);
            // console.log("executed",mdexecuted);
            // this.getView().byId("breedSelectSale").setSelectedKey(records[0])
            this.getView().byId("sales_date").setValue("")
            this.getView().byId("sales_date2").setValue("")
            mdprojected.setProperty("/recordsSales", [])


            let i = 0
            let obj = new Array()
            while (i < records.length) {
                if (records[i].name !== 'Plexus') {
                    obj.push(records[i])
                }
                i++;
            }
            mdbreed.setProperty("/recordsSales", obj)
            mdreports.setProperty("/reportsBtn", reports);
        },

        onTabSelection: function (ev) {
            var mdprogrammed = this.getModel("mdprogrammed");
            var mdprojected = this.getModel("mdprojected");
            let mdreports = this.getModel("mdreports");
            let mdexecuted = this.getModel("mdexecuted");
            let mdincubatorplant = this.getModel("mdincubatorplant");
            let mdbreed = this.getModel("mdbreed");
            let that = this;

            console.log("Que código tan horrible :/");
            mdprogrammed.setProperty("/salesC", false)

            var selectedKey = ev.getSource().getSelectedKey();
            this.getView().byId("programmedTable").removeSelections(true);

            if (selectedKey === "ktabInventory") {
                this.hideButtons(false, false, false, false, false);
            }

            if (selectedKey === "ktabProjected") {
                mdincubatorplant.setProperty("/selectedIncPlant", null);
                mdbreed.setProperty("/selectedBreed", null);
                this.getView().byId("parentLotSelect").setSelectedKey(null)
                this.getView().byId("parentLotSelect").setEnabled(false)
                //mdprojected.setProperty("/selectedLot", null);
                //mdprojected.setProperty("/lotRecords", []);
                this.getView().byId("scheduled_date").setValue(null);
                this.getView().byId("scheduled_date2").setValue(null);
                // ================================================================================
                this.getView().byId("projectedTable").removeSelections();
                mdprogrammed.setProperty("/selectedRecords", []);
                this.hideButtons(false, true, false, false, false);
                mdexecuted.setProperty("/executionSaveBtn", false);
            }

            if (selectedKey === "ktabProgrammed") {
                this.getView().byId("programmedTable").removeSelections(true);
                this.hideButtons(true, false, false, false, false);
            } else {
                // this.hideButtons(false, false, false, false,false);
                if(selectedKey !== "ktabExecuted"){
                    // mdprogrammed.getProperty("/records",[]);
                    mdprogrammed.setProperty("/enabledTabAssigned", false)
                }
            }

            if (selectedKey === "ktabExecuted") {
                this.hideButtons(false,false, false, false, true);
                // let findExecuted = await this.findExecuted();
                // console.log(this.getView().getModel("mdfarms"))
                // console.log(this.getView().byId("selectFarm"));
                // console.log(mdexecuted)
                // let records = mdexecuted.getProperty("/records");
                // mdfarms.setProperty("/selectedKey",records[0].executedfarm_id)
                // this.onChangeFarmE()
                mdprogrammed.setProperty("/programmedsaveBtn", false);
                // if (records.length > 0) {
                //   mdexecuted.setProperty("/executionSaveBtn", true);
                // } else {
                //   mdexecuted.setProperty("/executionSaveBtn", false);
                // }
            } else {
                mdexecuted.setProperty("/enabledTabAssigned", false);
                mdexecuted.setProperty("/records", []);
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
                            console.log(res.data.length);
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
                mdbreed.setProperty("/selectedBreed", null);
                // ================================================================================
                mdreports.setProperty("/records",[]);
                mdreports.setProperty("/desde","");
                mdreports.setProperty("/hasta","");
                mdreports.setProperty("/visible",false);
                this.getView().byId("sd").setValue("");
                this.getView().byId("sd2").setValue("");

                var lo = mdreports.getProperty("/records");
                let mdprogrammed = this.getModel("mdprogrammed")
                console.log("LA LONGITUD");
                console.log(lo.length);
                if (lo.length == 0) {
                    this.hideButtons(false, false, false, false, false);
                } else {
                    this.hideButtons(false, false, false, true, false);
                }
            }

            if (selectedKey === "ktabSales") {
                if (selectedKey === "ktabSales") {
                    mdincubatorplant.setProperty("/selectedIncPlant", null);
                    mdbreed.setProperty("/selectedBreed", null);
                    this.getView().byId("sales_date").setValue("");
                    this.getView().byId("sales_date2").setValue("");
                    // ================================================================================
                    mdprogrammed.setProperty("/salesC", true)
                    mdprogrammed.setProperty("/enabled", true)

                    this.hideButtons(false, false, false, false, false);
                } else {
                    mdprogrammed.setProperty("/salesC", false)
                    mdprogrammed.setProperty("/enabled", false)
                    this.hideButtons(false, false, false, false, true);
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

            console.log(mdprogrammed);
            console.log("el registro");
            console.log(aRecords);

            let records_programmed = [],
                isValidRecord = true;

            aRecords.forEach(item => {
                console.log("El item");
                console.log(item);

                if ((item.available == true)) {
                    if (item.execution_quantity) {
                        console.log("No es null los valores son: ", item.execution_quantity);
                        records_programmed.push(item);
                    }

                    if (!item.execution_quantity) {
                        console.log("execution_date null");
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

            console.log("el registro que quiero ver al guardar", aRecords);
            console.log("records_programmed:", records_programmed);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/programmedeggsdetail");
            console.log("utyil");
            console.log(util);
            console.log("la utlima ruta", serverName);

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
                                    eggs_movements_id: mdprogrammed.getProperty("/selectedRecord/eggs_movements_id"),
                                    incubator_plant_id: mdprogrammed.getProperty("/selectedRecord/incubator_plant_id")
                                })
                            }).then(function(response) {
                                if (response.status !== 200) {
                                    console.log("Looks like there was a problem. Status code: " + response.status);
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
                                                //  mdprogrammed.setProperty("/selectedRecord/available", res.available);
                                                mdprogrammed.refresh();
                                                console.log(mdprogrammed);
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
                            }).catch(function(err) {
                                console.error("Fetch error:", err);
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

        deleteProgrammedD: function (oEvent) {
            console.log(oEvent.getParameters().listItem);
            let sId = oEvent.getParameters().listItem.sId,
                asId = sId.split("-"),
                idx = asId[asId.length-1],
                mdincubator = this.getModel("mdincubator"),
                mdprogrammed = this.getModel("mdprogrammed"),
                that = this,
                available = mdincubator.getProperty("/available");
            console.log("listID: ", mdincubator.getProperty("/listID"));
            let obj =  mdincubator.getProperty("/assigned/"+idx);
            //  console.log('Obj: ', obj)
            //console.log(mdincubator)

            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Se procedera a eliminar: " + obj.name
                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        let assigned = mdincubator.getProperty("/assigned/");
                        console.log("Tengo: ", assigned);
                        console.log("obj", obj);
                        const projection = mdprogrammed.getProperty("/selectedRecords").find(record => record.eggs_movements_id === obj.projection.eggs_movements_id);
                        console.log(projection);
                        projection.partial_residue = 0;
                        mdprogrammed.refresh(true);
                        assigned.splice(idx, 1);
                        console.log("Elimino: ", assigned);
                        mdprogrammed.setProperty("/lot_records/" + mdincubator.getProperty("/listID") + "/assigned", assigned);
                        mdincubator.setProperty("/assigned/", assigned);

                        let sum_eggs = 0;
                        assigned.forEach(item => {
                            sum_eggs += parseInt(item.quantity_eggs);
                        });

                        let residue = mdprogrammed.getProperty("/lot_records/" + mdincubator.getProperty("/listID") + "/eggs") - sum_eggs;
                        mdincubator.setProperty("/residue", residue);
                        mdincubator.setProperty("/available", parseInt(available)+parseInt(obj.quantity_eggs));
                        dialog.close();
                        //that.deleteProgrammed(obj.housingway_detail_id, obj.housing_way_id);
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
                }).then(function(response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status code: " + response.status);
                                return;
                    }

                    response.json().then(function(res) {
                        //console.log(JSON.parse(res.data));
                        resolve(res);
                    });
                }).catch(function(err) {
                    console.log("Fetch error:", err);
                });
            });

            /*  fetch('https://appsdev.cmi.co/sap/bc/lrep/flex/data/ZWM_CONFTRANS.Component?sap-client=200', {
          method: 'GET',
          headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            'Authorization': 'Basic '+btoa('XCONSAREVALO:Sofos.001')
          }
        })
        .then(
          function(response) {
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ' +
                response.status);
              return;
            }

            response.json().then(function(res) {
              console.log(res);
              resolve(res);
            });
          }
        )
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
        });*/
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
                                console.log(res);
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
                                console.log(res);
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
            console.log(partnership_id);
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
                                console.log(res);
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
        closeProgrammedDialog: function(oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            mdprogrammed.getProperty("/selectedRecords").forEach(record => record.partial_residue = 0);
            mdprogrammed.setProperty("/assigned", []);
        },

        onProyectedCloseDialog: function(oEvent) {
            console.log("Entro");
            this.closeProgrammedDialog();

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
            console.log(projected_date);


            var dates = [];
            //this.byId("list").setBusy(true);
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
            //this.hideButtons(true, false, false);
        },
        onChangeShed: async function () {
            let mdshed = this.getModel("mdshed"),
                selectedShed = sap.ui.getCore().byId("selectShed").getSelectedKey();
            mdshed.setProperty("/selectedKey", selectedShed);
            console.log(selectedShed);
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
            console.log(partnership_id);
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
                    console.log(osfarm);
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
            console.log("Obj: ", obj);
            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Se procedera a eliminar el lote: " + obj.lot_incubator
                    //   text: 'Se procedera a eliminar el lote: ' + obj.scheduled_date
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

                        console.log(mdincubator);
                        console.log(idx);

                        //that.deleteProgrammed(obj.housingway_detail_id, obj.housing_way_id);
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

                            console.log("Looks like there was a problem. Status Code: " +
                  response.status);
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

                            console.log(records);
                            console.log("res: ", res);

                            let residue_programmed = res.available,
                                projected_quantity = mdprogrammed.getProperty("/selectedRecord/available");
                            console.log("Esta es la cantidad ", residue_programmed);
                            console.log(mdprogrammed.getProperty("/selectedRecord/available"));
                            mdprogrammed.setProperty("/selectedRecord/available", residue_programmed);
                            mdprogrammed.refresh();
                            console.log(mdprogrammed);

                            if (records.length > 0 && !mdprogrammed.getProperty("/selectedRecord/showIcon")) {
                                mdprogrammed.setProperty("/executionSaveBtn", true);
                                console.log(records);


                                if (res.records.length > 0) {
                                    that.hideButtons(true, true, false, false, false);
                                } else {
                                    that.hideButtons(true, false, false, false, false);
                                }


                            } else if (res.records.length > 0) {
                                that.hideButtons(false, true, false, false, false);
                            } else {
                                mdprogrammed.setProperty("/executionSaveBtn", false);
                                console.log(mdprogrammed);
                            }
                            util.setProperty("/busy/", true);
                        });




                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },
        reloadProgrammed: function(housingway_detail, mdprogrammed){
            let housing_ways = [];
              
            // housingway_detail.forEach(element => {
            //   housing_ways.push(element.housing_way_id)
            // });
            housing_ways = housingway_detail.map(record => record.housing_way_id);
            console.log(housing_ways);
            fetch("/housingWayDetail/findHousingWayDetByHw", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    records: housing_ways
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
                            console.log(res.data);
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

                        fetch("/synchronization/syncIncubadora", {
                            method: "GET"
                        })
                            .then(
                                function (response) {
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
                                                    press: function () {
                                                        dialog.close();
                                                        dialogToSap.close();
                                                        dialogToSap.destroy();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        });
                                        return;
                                    } else {
                                        util.setProperty("/busy", false);
                                        response.json().then(function (res) {
                                            console.log("la respuesta despues de sincronizar");
                                            console.log(res);

                                            let texto = "";
                                            if (res.resp.length > 0) {
                                                console.log("si hubo");
                                                texto = "Sincronización realizada con éxito.\n" + res.resp[0].satisfactorios + " registro(s) guardados\n" + res.resp[0].error + " registro(s) erroneos";

                                            } else {
                                                console.log("no hubo");
                                                texto = "Todos los registros ya han sido sincronizados";
                                            }
                                            that.onProjectedNext();

                                            var dialog = new Dialog({
                                                title: "Información",
                                                type: "Message",
                                                state: "Success",
                                                content: new Text({
                                                    text: texto
                                                }),
                                                beginButton: new Button({
                                                    text: "OK",
                                                    press: function () {
                                                        dialog.close();
                                                        dialogToSap.close();
                                                        dialogToSap.destroy();
                                                    }
                                                }),
                                                afterClose: function () {
                                                    dialog.destroy();
                                                }
                                            });
                                            dialog.open();
                                        });
                                    }
                                }
                            )
                            .catch(function (err) {
                                console.log("Fetch Error :-S", err);
                                console.log(err);
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
                                        press: function () {
                                            dialog.close();
                                            dialogToSap.close();
                                            dialogToSap.destroy();
                                        }
                                    }),
                                    afterClose: function () {
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
                afterClose: function () {
                    dialogToSap.destroy();
                }
            });
            dialogToSap.open();
        },
        onIngresoEgresos: function (oEvent) {
            var obj = oEvent.getSource().getBindingContext("mdinventory").getObject();
            // console.log(obj);
            this.getModel("mdinventory").setProperty("/selecterInventartio", obj);
            this.getRouter().navTo("editig");
        },
        validateFloatInput: function (o) {
            let input = o.getSource();
            let floatLength = 10,
                intLength = 10;
            console.log("entro en la funcion v");
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
                                        that.hideButtons(false, false, false, false, false);
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
            console.log("validRe");

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

        getExecutedRecord: async function(oEvent){
            this.hideButtons(false, false, false, false, true);

            const mdexecuted = this.getView().getModel("mdexecuted");

            let that = this,
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                oView = this.getView(),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                selected = mdprogrammed.getProperty(oEvent.getSource()["_aSelectedPaths"][0]);

            //mdexecuted.setProperty("/selectedRecord",mdprogrammed.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
            mdexecuted.setProperty("/parent_programming",selected);
            console.log("Selected:::: ",selected)
            console.log("Selected2:::: ",mdexecuted)
            const util = this.getModel("util");
            const response = await fetch("/programmed_eggs/findExecutionByProgrammedId", {
                headers: {
                    "Content-type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    programmed_eggs_id: selected.programmed_eggs_id
                })
            });

            if (!response.ok) {
                console.log("error");
                console.log(response);
            }
            else {
                const res = await response.json();
                mdexecuted.setProperty("/records", res.data);
                mdexecuted.setProperty("/executed", res.data[0].executed);
                if(!res.data[0].executed){
                    mdexecuted.setProperty("/executionSaveBtn", true);
                }
                mdexecuted.setProperty("/notexecuted", !res.data[0].executed);
                mdexecuted.setProperty("/execution_quantity", res.data[0].execution_quantity|res.data[0].eggs);
                console.log(mdexecuted.getProperty("/records"));
            }

            mdexecuted.setProperty("/enabledTabAssigned", true);
            mdexecuted.setProperty("/selectedProgrammedRecord", selected);
            console.log("modelo",this.getView().getModel("mdexecuted"))
            this.getView().getModel("mdexecuted").refresh(true);

            this.getView().byId("tabBar").setSelectedKey("ktabExecuted");
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
                    programmedquantity = mdexecuted.getProperty("/records/0/eggs");

                if(parseInt(value) <= parseInt(programmedquantity) ){
                    mdexecuted.setProperty("/name/state", "None");
                    mdexecuted.setProperty("/name/stateText", "");
                    mdexecuted.setProperty("/saveBtn", true);

                }else{
                    if (parseInt(value) > parseInt(programmedquantity)) {
                        mdexecuted.setProperty("/name/state", "Warning");
                        mdexecuted.setProperty("/name/stateText", "La cantidad ejecutada supera la cantidad programada");
                    }
                    if (value == "" || parseInt(value)===0) {
                        mdexecuted.setProperty("/name/state", "Error");
                        mdexecuted.setProperty("/name/stateText", "La cantidad ejecutada no debe estar vacia ni ser cero");
                        mdexecuted.setProperty("/saveBtn", false);
                    }
                }
                return false;
            }
        },

        saveExecution: function(){
            let that = this,
                util = this.getModel("util"),
                mdexecuted = this.getModel("mdexecuted"),
                record = mdexecuted.getProperty("/records"),
                execution_quantity = mdexecuted.getProperty("/execution_quantity"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");

            if(execution_quantity !== null && execution_quantity !== undefined){
                console.log("se ejecuto")
                if(execution_quantity <= record[0].eggs){
                    record[0].execution_quantity = execution_quantity;
                    var dialogC = new Dialog({
                        title: "Aviso",
                        type: "Message",
                        content: new Text({
                            text: "¿Desea guardar los cambios?"
                        }),
                        beginButton: new Button({
                            text: "Aceptar",
                            press: function() {
    
    
                                fetch("/programmed_eggs/updateExecutedQuantity/", {
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    method: "PUT",
                                    body: JSON.stringify({
                                        record: record,
                                        stage_id: incubatorStage,
                                        scenario_id: scenario_id,
                                        partnership_id: partnership_id
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
                                                mdexecuted.setProperty("/records", res.records);
                                                mdexecuted.setProperty("/executed", true);
                                                mdexecuted.setProperty("/notexecuted", false);
                                                mdexecuted.setProperty("/executionSaveBtn", false);
                                                //  mdexecuted.setProperty("/selectedRecord/available", res.available);
                                                mdexecuted.refresh();
                                                console.log(mdexecuted);
                                                dialogC.close();     
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
    
                                //hasta aqui
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
                }
            }      

            
        },

        onPressDetProg: function(oEvent){
            let that = this,
                path = oEvent.getSource().oPropagatedProperties.oBindingContexts.mdprogrammed.sPath;
            console.log("path: ",path);
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
        
        onUpdateDisabled: function(path){
            let mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdprojected = this.getView().getModel("mdprojected"),
                selectedItem = mdprogrammed.getProperty(path),
                id = selectedItem.programmed_eggs_id,
                eggs_movements_id = selectedItem.eggs_movements_id,
                search = mdprojected.getProperty("/search"),
                projection = this.getModel("mdprogrammed").getProperty("/selectedRecords").find(records => records.eggs_movements_id == eggs_movements_id),
                shed_id = selectedItem.shed_id;
  
            console.log(selectedItem);
            console.log(mdprogrammed);
  
  
            fetch("/programmed_eggs/updateDisabledProgrammedEggs", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "PUT",
                body: JSON.stringify({
                    programmed_eggs_id: id,
                    search: search,
                    eggs_movements_id: mdprogrammed.getProperty("/selectedRecords").map(record => record.eggs_movements_id)
                })
            })
                .then(
                    function(response) {
                        if (response.status !== 200 && response.status !== 409) {
                            console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                            return;
                        }
                        if(response.status === 200){
                            response.json().then(function(res) {

                                let records = res.data,
                                    search = res.search;
                                records.forEach(element => {
                                    if(element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date){
                                        element.isexecuted = true;
                                    }else{
                                        element.isexecuted = false;
                                    }
                        
                                });
                                console.log("Entreee2");
                                console.log(records);
                                mdprogrammed.setProperty("/records", records);
            
                                console.log(records);
            
                                if (records.length > 0) {
                                    mdprogrammed.setProperty("/executionSaveBtn", true);
                                    console.log(records);
                                    let residue_programmed = res.residue,
                                        projected_quantity = mdprogrammed.getProperty("/selectedRecord/projected_quantity"),
                                        total = projected_quantity - residue_programmed;
            
                                    mdprogrammed.setProperty("/programmed_residue", total);
                                    console.log(mdprogrammed);
                                } else {
                                    console.log("onUpdateDisabled")
                                    mdprogrammed.setProperty("/programmed_residue", mdprogrammed.getProperty("/selectedRecord/projected_quantity"));
                                    mdprogrammed.setProperty("/executionSaveBtn", false);
                                }
                                if(search.length>0){
                                    search = search.map(item => ({...item,
                                        partial_residue: 0}));
                                    mdprojected.setProperty("/records", search)
                                    let selected_R = mdprogrammed.getProperty("/selectedRecords"),
                                    n_array = selected_R.map(obj => search.find(o => o.eggs_movements_id === obj.eggs_movements_id) || obj);
                                    
                                    mdprogrammed.setProperty("/selectedRecords", n_array)
                                    mdprojected.refresh(true);
                                }

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
                                            mdprogrammed.refresh(true);
                          
                                        }
                                    }),
                                    afterClose: function() {
                                        dialog.destroy();
                                    }
                                });
      
                                dialog.open();
                                console.log(res);
                  
                            });
                        }
                
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        findParentLot: function (oEvent) {
            let mdbreed = this.getModel("mdbreed");
            let aBreeds = mdbreed.getProperty("/records");
            let oBreed = oEvent.getSource().getValue();
            let aValidBreed = aBreeds.filter(item => (item.name === oBreed));

            if (aValidBreed.length <= 0) {
                MessageToast.show("Raza errónea");
            } else {
                let mdprojected = this.getModel("mdprojected");
                mdprojected.setProperty("/selectedLot", null)
                let mdbreed = this.getView().getModel("mdbreed");
                let selectedBreed = this.getView().byId("breedSelect").getSelectedKey();
                let plant_id = this.getView().byId("selectIncubatorPlant").getSelectedKey();
                let mdincubatorplant = this.getView().getModel("mdincubatorplant");
                let mdscenario = this.getModel("mdscenario");
                let scenario_id = mdscenario.getProperty("/scenario_id");
                let plexus = this.getView().byId("breedSelect").getSelectedItem().mProperties.text;
                console.log(this.getView().byId("breedSelect").getSelectedItem(), plexus);
                mdprojected.setProperty("/records", []);
                mdprojected.setProperty("/lotRecords", []);

                fetch("/coldRoom/findParentLots", {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        breed_id: parseInt(selectedBreed),
                        incubatorplant_id: plant_id,
                        scenario_id: scenario_id,
                        plexus: plexus === "Plexus"?1:0
                    })
                }).then(function(response) {
                    if (response.status !== 200 && response.status !== 409) {
                        console.log("Looks like there was a problem. Status code: " + response.status);
                        return;
                    }

                    if (response.status === 200) {
                        response.json().then(function(res) {
                            if(res.data.length > 0) {
                                res.data.unshift({lot:"Todos"})
                                mdprojected.setProperty("/lotRecords", res.data);
                                // mdprojected.setProperty("/selectedLot", res.data[0].lot);
                            }else{
                                MessageToast.show("No se encontraron lotes associados a la raza seleccionada", {
                                    duration: 3000,
                                    width: "20%"
                                });
                            }
                        });
                    }
                }).catch(function(err) {
                    console.error("Fetch error:", err);
                });
            }
        },

        onChangeParentLot: function (path) {
            let mdprojected = this.getModel("mdprojected");
            let aLots = mdprojected.getProperty("/lotRecords");
            let oSelectedLot = this.getView().byId("parentLotSelect").getValue();
            let aValidLot = aLots.filter(item => (item.lot === oSelectedLot));

            if (aValidLot.length <= 0) {
                MessageToast.show("Lote erróneo");
            }
        },

        onDialogPressSales: function (oEvent) {
            /*let mdprogrammed = this.getModel("mdprogrammed"),
                sRecord= mdprogrammed.getProperty("/selectedRecord"),
                lot = mdprogrammed.getProperty("/records");

            mdprogrammed.setProperty("/selectedRecord/lot_assigned", []);
            mdprogrammed.setProperty("/programmed_date", null);
            mdprogrammed.setProperty("/enabledProduct", true);
            mdprogrammed.setProperty("/shedEviction", false);
            mdprogrammed.setProperty("/product/selectedKey", "");
            console.log("enble??");
            console.log(mdprogrammed.getProperty("/enabledProduct"));
            console.log(mdprogrammed);

            if(lot === undefined){
                lot = [];
            }
            let sum_chicken=0;

            lot.forEach(item=>{
                console.log("item::");
                console.log(item);
                // if (item.execution_quantity !== undefined && item.execution_quantity !== null)
                //     sum_chicken += parseInt(item.scheduled_quantity);
                if (item.scheduled_quantity !== undefined && item.scheduled_quantity !== null)
                    sum_chicken += parseInt(item.scheduled_quantity);
                console.log("suma::" + sum_chicken);
            });

            sRecord.residue= parseInt(sRecord.projected_quantity) -sum_chicken;

            mdprogrammed.setProperty("/enabledProduct", ( true));
            */
            this.formProgrammed = sap.ui.xmlfragment("incubatorPlanningM.view.sales.dialogSales", this);
            var that = this;
            var dlg = sap.ui.getCore().byId("dialogSales");
            dlg.attachAfterClose(function () {
                that.formProgrammed.destroy();
            });

            this.getView().addDependent(this.formProgrammed);
            this.formProgrammed.open();
            let mdprojected = this.getModel("mdprojected")
            let mdbreed = this.getModel("mdbreed")
            mdprojected.setProperty("/stateLot", "None");
            mdprojected.setProperty("/valueStateText", "");
            mdprojected.setProperty("/stateLotDate", "None");
            mdprojected.setProperty("/stateTextLotDate", "");
            mdprojected.setProperty("/stateLotGen", "None");
            mdprojected.setProperty("/stateTextLotGen", "");
            mdprojected.setProperty("/stateLotBreed", "None");
            mdprojected.setProperty("/stateTextLotBreed", "");

            mdbreed.setProperty("/change", false)
            mdbreed.setProperty("/estateB", false)
            mdbreed.setProperty("/estateC", false)
            mdbreed.setProperty("/estateS", false)
            //this.onChangeFarm();
        },

        activeateBreed: function (oEvent) {
            let mdbreed = this.getModel("mdbreed")
            mdbreed.setProperty("/estateB", true)
            let mdprojected = this.getModel("mdprojected")
            let gen = sap.ui.getCore().byId("breedSelectSales").mProperties.selectedKey
            if (gen == "") {
                mdprojected.setProperty("/stateLotGen", "Error");
                mdprojected.setProperty("/valueStateTextGen", "No ha ingresado el sexo");
            } else {
                mdprojected.setProperty("/stateLotGen", "None");
                mdprojected.setProperty("/valueStateTextGen", "");
            }
        },

        onCloseDialogSale: function (oEvent) {
            console.log("Entro");
            console.log("entro en el que destruyeme");
            //this.closeProgrammedDialog();

            let mdprogrammed = this.getView().getModel("mdprogrammed");
            let mdincubator = this.getView().getModel("mdincubator");
            let mdprojected = this.getView().getModel("mdprojected");
            let lot = [];
            let mdbreed = this.getModel("mdbreed")

            console.log("Datos del gé nero ", oEvent.getSource())
            mdincubator.setProperty("/assigned", lot);
            mdincubator.setProperty("/list", lot);
            mdincubator.setProperty("/available", "");
            mdprogrammed.setProperty("/lot_records/", lot);

            mdbreed.setProperty("/estateC", false)
            mdbreed.setProperty("/estateS", false)
            mdprojected.setProperty("/statePlant", "None");
            mdprojected.setProperty("/stateTextPlant", "");

            mdprogrammed.refresh();
            mdincubator.refresh();
            this.formProgrammed.close();
            this.formProgrammed.destroy();

        },

        handleChangeS: function () {
            let mdbreed = this.getModel("mdbreed")

            mdbreed.setProperty("/estateC", true)
            let mdprojected = this.getModel("mdprojected")
            let date = sap.ui.getCore().byId("sales_dateD").mProperties.dateValue
            if (date == "") {
                mdprojected.setProperty("/stateLotDate", "Error");
                mdprojected.setProperty("/valueStateTextDate", "No ha ingresado fecha");
            } else {
                mdprojected.setProperty("/stateLotDate", "None");
                mdprojected.setProperty("/valueStateTextDate", "");
            }
        },

        validateS: function () {
            let breed = sap.ui.getCore().byId("breedSelectSaleO").mProperties.value
            let mdbreed = this.getModel("mdbreed")
            let mdprojected = this.getModel("mdprojected")
            console.log("HOOOOLAAAA")
            if (breed == "") {
                mdprojected.setProperty("/stateLotBreed", "Error");
                mdprojected.setProperty("/valueStateTextBreed", "No ha seleccionado raza");
            } else {
                mdprojected.setProperty("/stateLotBreed", "None");
                mdprojected.setProperty("/valueStateTextBreed", "");
                mdbreed.setProperty("/change", true)
                console.log("HOOOOLAAAA")
            }
            let date = sap.ui.getCore().byId("sales_dateD").mProperties.value
            let cant = sap.ui.getCore().byId("projected_quantity").mProperties.value
            let gen = sap.ui.getCore().byId("breedSelectSales").mProperties.value
            if (date == "") {
                mdprojected.setProperty("/stateLotBreed", "Error");
                mdprojected.setProperty("/valueStateTextBreed", "Ingrese fecha válida");
            } else
                if (cant == "" || cant == 0) {
                    mdprojected.setProperty("/stateLot", "Error");
                    mdprojected.setProperty("/valueStateText", "Ingrese cantidad válida");
                } else
                    if (gen == "") {
                        mdprojected.setProperty("/stateLotGen", "Error");
                        mdprojected.setProperty("/stateTextLotGen", "Ingrese el sexo");
                    } else
                        if (date !== "" && cant > 0 && gen !== "" && breed !== "") {
                            mdbreed.setProperty("/change", true)
                        }
        },

        onChangeIncubatorPlant: function (oEvent) {
            let mdprojected = this.getModel("mdprojected");
            mdprojected.setProperty("/statePlant", "None");
            mdprojected.setProperty("/stateTextPlant", "");

            let mdincubatorplant = this.getModel("mdincubatorplant");
            let aIncPlants = mdincubatorplant.getProperty("/records");
            let oIncubatorPlant = this.getView().byId("selectIncubatorPlant").getValue();
            let aValidIncPlant = aIncPlants.filter(item => (item.name === oIncubatorPlant));

            if (aValidIncPlant.length <= 0) {
                MessageToast.show("Planta incubadora errónea");
            }

            let mdbreed = this.getModel("mdbreed");
            mdbreed.setProperty("/selectedBreed", null);
            mdprojected.setProperty("/selectedLot", null);
        },

        onSaleSaveDialog: function (oEvent) {

            let util = this.getModel("util")
            let that = this
            let date = sap.ui.getCore().byId("sales_dateD").mProperties.value
            let date2 = sap.ui.getCore().byId("sales_dateD").mProperties.dateValue
            let cant = sap.ui.getCore().byId("projected_quantity").mProperties.value
            let gen = sap.ui.getCore().byId("breedSelectSales").mProperties.selectedKey;
            let inc_plant = sap.ui.getCore().byId("selectIncubatorPlantSales").getSelectedKey();
            let mdincubatorplant = this.getModel("mdincubatorplant").getProperty("/records")[0]
            let record = new Array()
            date = date.split("-").join("/")

            let date_init = this.getView().byId("sales_date").mProperties.value
            let date_finish = this.getView().byId("sales_date2").mProperties.value
            date_init = date_init.split("-").reverse().join("/")
            date_finish = date_finish.split("-").reverse().join("/")
            let mdprojected = this.getModel("mdprojected")
            //mdprojected.setProperty("/recordsSales",[])
            let breed_id = sap.ui.getCore().byId("breedSelectSaleO").mProperties.selectedKey;
            console.log("Aquí estoy!", date, cant, gen, breed_id)
            let rec = new Array()
            console.log("date, cant,gen", date, cant, gen, breed_id)
console.log("inc_plant", inc_plant,"asd")
            if (date !== "" && cant !== undefined && cant > 0 && gen !== "" && breed_id !== "" && inc_plant !== "") {
                mdprojected.setProperty("/stateLot", "None");
                mdprojected.setProperty("/valueStateText", "");
                mdprojected.setProperty("/stateLotGen", "None");
                mdprojected.setProperty("/valueStateTextGen", "");
                mdprojected.setProperty("/statePlant", "None");
                mdprojected.setProperty("/stateTextPlant", "");
                this.formProgrammed.close()
                this.formProgrammed.destroy()


                let obj = {
                    date_sale: date,
                    quantity: cant,
                    gender: gen,
                    breed_id: breed_id,
                    incubator_plant_id: inc_plant
                }
                let obj2 = {
                    date_sale: date2,
                    quantity: cant,
                    gender: gen,
                    breed_id: breed_id,
                    incubator_plant_id: inc_plant
                }
                record.push(obj)

                const serverName = "/incubatorSales/addNewSales";

                fetch(serverName, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        records: record

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

                                var dialog = new Dialog({
                                    title: "Información",
                                    type: "Message",
                                    state: "Success",
                                    content: new Text({
                                        text: "Información guardada con éxito."
                                    }),
                                    beginButton: new Button({
                                        text: "OK",
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();

                                mdprojected.setProperty("/recordsSales", res.data)
                                that.byId("selectIncubatorPlantSale").setSelectedKey(null),
                                that.byId("breedSelectSale").setSelectedKey(null),
                                console.log("Date init, date finish ", res.data)
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });

                that.getView().byId("sales_date").setValue("")
                that.getView().byId("sales_date2").setValue("")
            } else {
                if(inc_plant===""){
                    mdprojected.setProperty("/statePlant", "Error");
                    mdprojected.setProperty("/stateTextPlant", "Indique planta incubadora");
                }
                if (date == "") {
                    mdprojected.setProperty("/stateLotDate", "Error");
                    mdprojected.setProperty("/valueStateTextDate", "No ha ingresado fecha");
                    MessageToast.show("Ingrese la fecha de la venta")
                } else
                    if (cant == "" || cant == 0 || cant < 0 && date !== "") {
                        if (cant == "") {
                            mdprojected.setProperty("/stateLot", "Error");
                            mdprojected.setProperty("/valueStateText", "Cantidad inválida");
                            MessageToast.show("La cantidad ingresada no es válida")
                        } else {
                            mdprojected.setProperty("/stateLot", "Error");
                            mdprojected.setProperty("/valueStateText", "Cantidad inválida");
                            MessageToast.show("La cantidad ingresada no es válida")
                        }
                    } else
                        if (gen == "") {
                            MessageToast.show("Seleccione el sexo")
                            mdprojected.setProperty("/stateLotGen", "Error");
                            mdprojected.setProperty("/valueStateTextGen", "No ha ingresado el sexo");

                        } else
                            if (breed_id == "") {
                                MessageToast.show("Seleccione la raza")
                                mdprojected.setProperty("/stateLotBreed", "Error");
                                mdprojected.setProperty("/valueStateTextBreed", "No ha ingresado la raza");

                            }
            }

        }

    });
});
