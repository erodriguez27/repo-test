sap.ui.define([
    "liftBreedingPlanningM/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/core/Item"
], function (BaseController, jQuery, Filter, Fragment, JSONModel, MessageToast, Dialog, Button, Text, MessageBox, item) {
    "use strict";
    const liftBreedingStage = 5; /*Clase para levante y Cria*/
    return BaseController.extend("liftBreedingPlanningM.controller.Detail", {

        onInit: function () {
            this.setFragments();
            this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var oArguments = oEvent.getParameter("arguments");
            this.dialogDelete = sap.ui.xmlfragment("liftBreedingPlanningM.view.DialogDelete", this);
            this.index = oArguments.id;

            let oView = this.getView();
            let ospartnership = this.getModel("ospartnership");
            this.resetReports();
            oView.byId("tabBar").setSelectedKey("tabParameter");
            oView.byId("tableBreed").addEventDelegate({
                onAfterRendering: oEvent => {
                    console.log("victor te amo!");
                }
            });

            if (ospartnership.getProperty("/records").length > 0) {
                let partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id");
                this.onRead(partnership_id);
            } else {
                this.reloadPartnership().then(data => {
                    if (data.length > 0) {
                        let obj = ospartnership.getProperty("/selectedRecords/");
                        if (!obj) {
                            // this.onRead(obj.partnership_id);
                            // }
                            // else{
                            MessageToast.show("no existen empresas cargadas en el sistema", {
                                duration: 3000,
                                width: "20%"
                            });
                        }
                    } else {
                        MessageToast.show("ha ocurrido un error al cargar el inventario", {
                            duration: 3000,
                            width: "35%"
                        });
                    }
                });
            }

            this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
            this.onRead(this.index);
        },

        reloadPartnership: function () {
            let util = this.getModel("util");
            let that = this;
            let ospartnership = this.getModel("ospartnership");

            util.setProperty("/busy/", true);
            ospartnership.setProperty("/records", []);

            let url = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/getPartnership");
            let method = "GET";
            let data = {};
            return new Promise((resolve, reject) => {
                function getPartnership(res) {
                    util.setProperty("/busy/", false);
                    ospartnership.setProperty("/records/", res.data);
                    if (res.data.length > 0) {
                        let obj = res.data[0];
                        obj.index = 0;
                        ospartnership.setProperty("/selectedRecords/", obj);
                        ospartnership.setProperty("/name", obj.name);
                        ospartnership.setProperty("/address", obj.address);
                    }
                    resolve(res.data);
                }

                function error(err) {
                    ospartnership.setProperty("/selectedRecords/", []);
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, getPartnership, error, error);
            });
        },

        onRead: async function (index) {
            let ospartnership = this.getModel("ospartnership"),
                mdscenario = this.getModel("mdscenario"),
                mdparameter_breed = this.getModel("mdparameter_breed"),
                oView = this.getView();

            oView.byId("tabBar").setSelectedKey("kTabParameter");

            let activeS = await this.activeScenario();
            mdscenario.setProperty("/scenario_id", activeS.scenario_id);
            mdscenario.setProperty("/name", activeS.name);

            ospartnership.setProperty("/selectedRecordPath/", "/records/" + index);
            ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));

            let isFarmLoad = await this.onFarmLoad();
            let isBreedLoad = await this.onBreedLoad();
            let records_pb = await this.onParameterBreed();
            mdparameter_breed.setProperty("/records", records_pb.data);

            let util = this.getModel("util"),
                that = this,
                mdprojected = this.getModel("mdprojected"),
                mdprogrammed = this.getModel("mdprogrammed"),
                mdexecuted = this.getModel("mdexecuted");

            this.getView().byId("projectedTable").removeSelections();
            mdprogrammed.setProperty("/rProgrammed/enabledTab", false);

            //Ocultar el boton de guardar registros
            ospartnership.setProperty("/selectedPartnership/partnership_index", index);

            let process_info = await this.processInfo(),
                mdprocess = this.getModel("mdprocess");
            mdprocess.setProperty("/duration", process_info.data[0].theoretical_duration);
            mdprocess.setProperty("/decrease", process_info.data[0].theoretical_decrease);

            let findScenario = await this.findProjected();
            mdprojected.setProperty("/records", findScenario.data);

            that.hideButtons(false, false, false, false);
        },

        validateIntInput: function (o) {
            let input = o.getSource();
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

        reports: function () {
            var mdreports = this.getModel("mdreports");
            let date1 = this.getView().byId("sd").mProperties.value,
                date2 = this.getView().byId("sd2").mProperties.value,
                breed_id = this.getView().byId("breedSelect").getSelectedKey(),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");

            let aDate = date1.split("-"),
                init_date = `${aDate[0]}/${aDate[1]}/${aDate[2]}`;

            let aDate2 = date2.split("-"),
                end_date = `${aDate2[0]}/${aDate2[1]}/${aDate2[2]}`;

            if (date1 === null || date1 == "" || date2 === null || date2 == "") {
                MessageToast.show("No se pueden consultar fechas vacías", {
                    duration: 3000,
                    width: "20%"
                });
            } else {
                let serverName = "/reports/findLiftBreeding";

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
                })
                    .then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                                    response.status);
                                return;
                            }

                            response.json().then(function (res) {
                                mdreports.setProperty("/records", res.data);
                                mdreports.setProperty("/raza", res.raza);
                                if (res.data.length > 0) {
                                    mdreports.setProperty("/reportsBtn", true);
                                    mdreports.setProperty("/desde", init_date);
                                    mdreports.setProperty("/hasta", end_date);
                                    mdreports.setProperty("/visible", true);

                                }
                                else {
                                    mdreports.setProperty("/reportsBtn", false);
                                    mdreports.setProperty("/visible", false);
                                }
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            }

        },

        generatedCSV: function () {
            var mdreports = this.getModel("mdreports").getProperty("/records");
            this.arrayObjToCsv(mdreports);
        },

        arrayObjToCsv: function (ar) {
            //comprobamos compatibilidad
            let breed_id = this.getView().byId("breedSelect").getSelectedKey();
            let array = [];

            if (window.Blob && (window.URL || window.webkitURL)) {
                var contenido = "",
                    d = new Date(),
                    blob,
                    reader,
                    save,
                    clicEvent;
                //creamos contenido del archivo
                if (breed_id === "Todas") {
                    array = ["Fecha Programada", "Cantidad Programada", "Fecha Ejecutada", "Cantidad Ejecutada", "Lote", "Raza", "Granja", "Núcleo", "Galpón", "Granja Ejecutada", "Núcleo Ejecutado", "Galpón Ejecutado", "Variación Cantidad", "Variación Dias"];
                } else {
                    array = ["Fecha Programada", "Cantidad Programada", "Fecha Ejecutada", "Cantidad Ejecutada", "Lote", "Granja", "Núcleo", "Galpón", "Granja Ejecutada", "Núcleo Ejecutado", "Galpón Ejecutado", "Variación Cantidad", "Variación Dias"];
                }

                for (var i = 0; i < ar.length; i++) {
                    //construimos cabecera del csv
                    if (i == 0)
                        contenido += array.join(";") + "\n";
                    //resto del contenido
                    contenido += Object.keys(ar[i]).map(function (key) {
                        return ar[i][key];
                    }).join(";") + "\n";
                }
                //creamos el blob
                blob = new Blob(["\ufeff", contenido], { type: "text/csv" });
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
            } else {
                //el navegador no admite esta opción
                alert("Su navegador no permite esta acción");
            }
        },


        onDialogPressDet: function (oEvent) {

            let that = this,
                path = oEvent.getSource().oPropagatedProperties.oBindingContexts.mdprojected.sPath;
                
            var dialog = new Dialog({
                title: "Información",
                type: "Message",
                state: "Warning",
                content: new Text({
                    text: "¿Desea eliminar la proyección seleccionada?."
                }),
                beginButton: new Button({
                    text: "Aceptar",
                    press: function () {
                        that.onDeleteProjected(path);
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

        pruebaERP: function () {
            return new Promise((resolve, reject) => {
                fetch("/farm/erp", {
                    method: "GET",
                })
                    .then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                                    response.status);
                                return;
                            }

                            response.json().then(function (res) {
                                //console.log(JSON.parse(res.data));
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            });
        },
        onParameterBreed: function () {

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
        processInfo: function () {

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
        onChangeShedE: async function () {
            let mdshed = this.getModel("mdshed"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                selectedShed = mdshed.getProperty("/selectedKey");
            if (mdexecuted.getProperty("/records")[0].available) {
                mdexecuted.setProperty("/name/state", "None");
                mdexecuted.setProperty("/name/stateText", "");
                mdexecuted.setProperty("/confirmBtn", false);
                mdexecuted.setProperty("/addBtn", false);
            }
            mdexecuted.refresh();

        },
        onDeleteProjected: function (path) {
            let mdprojected = this.getView().getModel("mdprojected"),
                selectedItem = mdprojected.getProperty(path),
                id = selectedItem.housing_way_id,
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");

            fetch("/housingWay/deleteHousingWayById", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    housing_way_id: id,
                    stage_id: liftBreedingStage,
                    partnership_id: partnership_id,
                    scenario_id: scenario_id
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
                                mdprojected.setProperty("/records", res.data);
                                mdprojected.refresh(true);
                                var dialog = new Dialog({
                                    title: "Información",
                                    type: "Message",
                                    state: "Success",
                                    content: new Text({
                                        text: "Proyección eliminada con éxito."
                                    }),
                                    beginButton: new Button({
                                        text: "OK",
                                        press: function () {
                                            dialog.close();
                                            mdprojected.setProperty("/records", res.data);
                                            mdprojected.refresh(true);

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
                });
        },
        findProjected: function () {
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
        findExecuted: function () {
            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                mdfarms = this.getView().getModel("mdfarms"),
                mdcenter = this.getView().getModel("mdcenter"),
                mdshed = this.getView().getModel("mdshed"),
                hwid = mdexecuted.getProperty("/selectedRecord/housingway_detail_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");

            return new Promise((resolve, reject) => {
                fetch("/housingwaydetail/findHousingWayDetByHwdId", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        housing_way_id: hwid,
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
                                let records = res.data,
                                    cond = records[0].execution_quantity === null && records[0].execution_date === null;
                                mdexecuted.setProperty("/records", records);
                                mdexecuted.setProperty("/isnotexecuted", cond);
                                mdexecuted.setProperty("/isexecuted", !cond);
                                
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
                                    mdexecuted.setProperty("/programmed_residue", mdprogrammed.getProperty("/selectedRecord/projected_quantity"));

                                }

                                mdfarms.refresh(true);
                                mdcenter.refresh(true);
                                mdshed.refresh(true);
                                mdexecuted.refresh(true);

                                util.setProperty("/busy/", false);
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            });

        },

        onChangeFarmE: async function () {
            let mdfarms = this.getView().getModel("mdfarms"),
                mdcenter = this.getView().getModel("mdcenter"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                farm_id = mdfarms.getProperty("/selectedKey");

            let findCenter = await this.findCenterByFarm(farm_id);
            mdcenter.setProperty("/records", findCenter.data);
            if (mdexecuted.getProperty("/records")[0].available) {
                mdexecuted.setProperty("/name/state", "None");
                mdexecuted.setProperty("/name/stateText", "");
                mdexecuted.setProperty("/confirmBtn", false);
                mdexecuted.setProperty("/addBtn", false);
            }
            this.onChangeCenterE();
        },

        onChangeCenterE: async function () {
            let mdcenter = this.getView().getModel("mdcenter"),
                mdshed = this.getView().getModel("mdshed"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                center_id = mdcenter.getProperty("/selectedKey"),
                executed_shed = mdexecuted.getProperty("/selectedRecord").executedshed_id;
            let findShed = await this.findShedByCenterForExecution(center_id);
            mdshed.setProperty("/records", findShed.data);
        },


        findShedByCenterForExecution: function (selectedFarm) { /* En caso que se pida mostrar todos los galpones en la pantalla de ejecucion */
            let util = this.getModel("util"),
                that = this,
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
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                                    response.status);
                                return;
                            }

                            response.json().then(function (res) {
                                res.data = res.data.filter(function (item) {
                                    return item.statusshed_id === 1 || item.rehousing === true || mdexecuted.getProperty("/selectedRecord").shed_id === item.shed_id || mdexecuted.getProperty("/selectedRecord").executedshed_id === item.shed_id;
                                });

                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            });
        },


        onValidExecutedQuantity: function (o) {
            let input = o.getSource();
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

                let mdexecuted = this.getView().getModel("mdexecuted"),
                    programmedquantity = mdexecuted.getProperty("/selectedRecord").scheduled_quantity;

                let mdshed = this.getView().getModel("mdshed");
                let records = mdshed.getProperty("/records"),
                    myshed = records.filter(function (item) {
                        return mdshed.getProperty("/selectedKey") == item.shed_id;
                    });

                if (parseInt(value) <= parseInt(myshed[0].capmax)) {
                    mdexecuted.setProperty("/name/state", "None");
                    mdexecuted.setProperty("/name/stateText", "");
                    mdexecuted.setProperty("/saveBtn", true);

                } else {
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

        onTabSelection: async function (ev) {
            var mdprogrammed = this.getModel("mdprogrammed");
            var mdprojected = this.getModel("mdprojected");
            var mdexecuted = this.getModel("mdexecuted");
            var mdbreed = this.getModel("mdbreed");
            var mdfarms = this.getModel("mdfarms");
            let mdreports = this.getModel("mdreports");
            var selectedKey = ev.getSource().getSelectedKey();
            let recordsB = mdbreed.getProperty("/records");
            if (selectedKey === "kTabParameter") {
                this.getView().byId("projectedTable").removeSelections();
                // this.getView().getModel("mdprojected").setProperty("/records",[]);
                this.getView().getModel("mdprogrammed").setProperty("/rProgrammed/enabledTab", false);
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab", false);
                this.getView().byId("projectedTable").removeSelections();
                this.getView().byId("liftBreedingTable").removeSelections();
                this.getView().byId("liftBreedingTableE").removeSelections();
                this.hideButtons(false, false, false, false);
            }

            if (selectedKey === "kTabProjected") {
                this.hideButtons(true, false, false, false);
                this.getView().byId("projectedTable").removeSelections();
                // this.getView().getModel("mdprojected").setProperty("/records",[]);
                this.getView().byId("liftBreedingTable").removeSelections();
                mdprogrammed.setProperty("/selectedRecords", []);

                let findScenario = await this.findProjected();
                this.getView().getModel("mdprogrammed").setProperty("/records", []);
                this.getView().getModel("mdprogrammed").setProperty("/selectedRecords", []);

                this.getView().getModel("mdprogrammed").setProperty("/rProgrammed/enabledTab", false);
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab", false);

                mdprojected.setProperty("/records", findScenario.data);

                this.getView().byId("liftBreedingTable").removeSelections();
                this.getView().byId("liftBreedingTableE").removeSelections();
            }

            if (selectedKey === "ktabProgrammed") {
                this.hideButtons(false, true, false, false);
                let records = mdprojected.getProperty("/records");
                this.getView().getModel("mdexecuted").setProperty("/records", []);

                this.getView().getModel("mdfarms").setProperty("/selectedKey", null);
                this.getView().getModel("mdcores").setProperty("/selectedKey", null);
                this.getView().getModel("mdcenter").setProperty("/selectedKey", null);
                this.getView().getModel("mdshed").setProperty("/selectedKey", null);

                this.getView().byId("liftBreedingTable").removeSelections();
                this.getView().byId("liftBreedingTableE").removeSelections();
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab", false);
            }

            if (selectedKey === "ktabExecuted") {
                this.getView().byId("liftBreedingTableE").removeSelections();
                this.hideButtons(false, false, true, false);
                mdprogrammed.setProperty("/programmedsaveBtn", false);
            }

            if (selectedKey === "ktabReports") {
                this.getView().byId("projectedTable").removeSelections();
                // this.getView().getModel("mdprojected").setProperty("/records",[]);
                this.getView().byId("liftBreedingTable").removeSelections();
                this.getView().getModel("mdprogrammed").setProperty("/records", []);
                this.getView().byId("liftBreedingTableE").removeSelections();
                this.getView().getModel("mdexecuted").setProperty("/records", []);
                this.getView().getModel("mdprogrammed").setProperty("/rProgrammed/enabledTab", false);
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab", false);
                var lo = mdreports.getProperty("/records");
                recordsB.unshift({ breed_id: "Todas", name: "Todas" });
                mdbreed.setProperty("/records", recordsB);
                mdbreed.setProperty("/value", "Todas");

                if (lo.length == 0) {
                    this.hideButtons(false, false, false, false);
                } else {
                    this.hideButtons(false, false, false, true);
                }
            }

            if (selectedKey != "ktabReports") {
                mdprojected.setProperty("/visibleOtherButtons",false)
                mdreports.setProperty("/records", []);
                this.getView().byId("sd").setValue("");
                this.getView().byId("sd2").setValue("");
                mdreports.setProperty("/visible", false);

                if (recordsB[0].breed_id === "Todas") {
                    recordsB.shift();
                    mdbreed.setProperty("/records", recordsB);
                }
            }

            if (selectedKey === "tabAdjust") {
                mdreports.setProperty("/records", []);
                this.getModel("mdprojected").setProperty("/adjustmenttable", {});
                this.getModel("mdprojected").setProperty("/val_lot", null);

                this.hideButtons(false, false, false, false);
                mdprojected.setProperty("/visibleOtherButtons",false)
            }
        },

        resetReports: function () {

            let mdreports = this.getModel("mdreports");
            this.getView().byId("breedSelect").setSelectedKey("Todas")
            this.getView().byId("sd").setValue(null)
            this.getView().byId("sd2").setValue(null)
            mdreports.setProperty("/visible", false);
            mdreports.setProperty("/records", []);

            
        },

        hideButtons: function (projected, programmed, execution, reports) {
            let mdprojected = this.getModel("mdprojected");
            let mdprogrammed = this.getModel("mdprogrammed");
            let mdexecuted = this.getModel("mdexecuted");
            let mdreports = this.getModel("mdreports");
            mdprojected.setProperty("/projectedSaveBtn", projected);
            mdprogrammed.setProperty("/programmedsaveBtn", programmed);
            mdexecuted.setProperty("/executionSaveBtn", execution);
            mdreports.setProperty("/reportsBtn", reports);

        },

        SaveEviction: async function () {
            let mdprojected = this.getView().getModel("mdprojected"),
              stage = "C",
              record = mdprojected.getProperty("/adjustmenttable/0")
            record.stage = stage
            if(record.eviction_date==undefined || record.eviction_date==" " || record.eviction_date==""  || record.eviction_date==null){
              MessageToast.show("Ingrese una parametro de fecha de desalojo");
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
                            if(response.status === 511){
                                MessageToast.show("Inicie sesión para continuar");
                            }
                          return;
                        }
                        response.json().then((res) => {
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
        handleValueHelp: function (oEvent) {
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

        _handleValueHelpSearch: function (evt) {
            var sValue = evt.getParameter("value");
            var oFilter = new Filter(
                "Name",
                sap.ui.model.FilterOperator.Contains, sValue
            );
            evt.getSource().getBinding("items").filter([oFilter]);
        },

        _handleValueHelpClose: function (evt) {
            var oSelectedItem = evt.getParameter("selectedItem");
            if (oSelectedItem) {
                var productInput = this.getView().byId(this.inputId);
                productInput.setValue(oSelectedItem.getTitle());
            }
            evt.getSource().getBinding("items").filter([]);
        },




        onSelectExecutedRecord: async function (oEvent) {


            let mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                oView = this.getView();
            
            //guarda la ruta del registro proyectado que fue seleccionado
            mdprogrammed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            mdexecuted.setProperty("/selectedRecord", mdprogrammed.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
            mdexecuted.setProperty("/rExecuted/enabledTab", true);
            oView.byId("tabBar").setSelectedKey("ktabExecuted");

            let findExecuted = await this.findExecuted();
            let records = mdexecuted.getProperty("/records");

            if (records.length > 0) {
                mdexecuted.setProperty("/executionSaveBtn", records.length > 0);
            }

            mdprogrammed.setProperty("/programmedsaveBtn", false);
            mdexecuted.setProperty("/name/state", "None");
            mdexecuted.setProperty("/name/stateText", "");
            mdexecuted.setProperty("/confirmBtn", false);
            mdexecuted.setProperty("/addBtn", false);

            findExecuted = findExecuted.data;

            let mdfarms = this.getView().getModel("mdfarms"),
                mdcenter = this.getView().getModel("mdcenter"),
                mdshed = this.getView().getModel("mdshed"),
                farm_id = findExecuted[0].executedfarm_id !== null ? findExecuted[0].executedfarm_id : findExecuted[0].farm_id,
                center_id = findExecuted[0].executedcenter_id !== null ? findExecuted[0].executedcenter_id : findExecuted[0].center_id;

            mdfarms.setProperty("/selectedKey", findExecuted[0].executedfarm_id !== null ? findExecuted[0].executedfarm_id : findExecuted[0].farm_id);

            let centers = await this.findCenterByFarm(farm_id)
            mdcenter.setProperty("/records", centers.data);
            mdcenter.setProperty("/selectedKey", center_id);

            let sheds = await this.findShedByCenterForExecution(center_id);
            mdshed.setProperty("/records", sheds.data);
            mdshed.setProperty("/selectedKey", records[0].executedshed_id !== null ? records[0].executedshed_id : records[0].shed_id);

        },

        changeProgrammedFilter: function (oEvent) {
            const mdprojected = this.getView().getModel("mdprojected");
            const programmedFilter = mdprojected.getProperty("/programmedFilter");

            if (programmedFilter !== "programmed") {
                mdprojected.setProperty("/lotFilter", "");
            }
        },

        changeLotFilter: function (oEvent) {
            const mdprojected = this.getView().getModel("mdprojected");
            const query = mdprojected.getProperty("/lotFilter");

            if (query !== "") {
                mdprojected.setProperty("/programmedFilter", "programmed");
            }
        },

        applyProjectedTableFilters: async function (oEvent) {
            const mdprojected = this.getView().getModel("mdprojected");
            const util = this.getView().getModel("util");
            let query = mdprojected.getProperty("/lotFilter");
            let lot = mdprojected.getProperty("/lotFilter");
            let filter = mdprojected.getProperty("/programmedFilter");
            const partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            const scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");


            if (filter === "all" && lot !== null) {
                const result = await this.findProjected();
                mdprojected.setProperty("/records", result.data);
            }
            else {
                if (filter === "all") {
                    filter = "programmed";
                }
                query = query === "" ? null : query.toUpperCase();
                filter = filter !== "programmed";
                filter = query !== null ? null : filter;
                const response = await fetch("/housingway/findHousingByFilters", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({
                        partnership_id,
                        scenario_id,
                        stage_id: liftBreedingStage,
                        lot: query,
                        programmed: filter
                    })
                });

                if (!response.ok) {
                    console.log("Looks like there was a problem. Status Code: " +
                        response.status);
                    return;
                }

                const result = await response.json();
                mdprojected.setProperty("/records", result.data);
            }

        },

        onSelectProgrammedRecords: function (oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            const mdprojected = this.getView().getModel("mdprojected");
            const projectedTable = this.getView().byId("projectedTable");
            const parameters = oEvent.getParameters();
            const records = mdprogrammed.getProperty("/selectedRecords");

            const items = parameters.listItems;

            if (parameters.selectAll && records.length > 1) {
                projectedTable.removeSelections();
                mdprogrammed.setProperty("/selectedRecords", []);
            }
            else if (items.length > 1 && records.length === 0) {
                items.forEach(item => projectedTable.setSelectedItem(item, false));
            }
            else if (items.length > 1) {
                items.forEach(item => {
                    if (item.getType() === "Inactive") {
                        projectedTable.setSelectedItem(item, false);
                    }
                });
            }
            else if (items[0].getType() === "Inactive") {
                let item_projection = items[0].getBindingContext("mdprojected").getObject();
                if ((item_projection.breed_name !== records[0].breed_name) && (item_projection.projected_date !== records[0].projected_date)) {
                    MessageToast.show("Debe seleccionar registros con la misma fecha y la misma raza", {
                        duration: 3000,
                        width: "30%"
                    });
                } else {
                    if (item_projection.breed_name !== records[0].breed_name) {
                        MessageToast.show("Debe seleccionar registros con la misma raza", {
                            duration: 3000,
                            width: "20%"
                        });
                    }
                    if (item_projection.projected_date !== records[0].projected_date) {
                        MessageToast.show("Debe seleccionar registros proyectados con la misma fecha", {
                            duration: 3000,
                            width: "20%"
                        });
                    }
                }
                projectedTable.setSelectedItem(items[0], false);
            }
            const projections = projectedTable.getSelectedItems().map(item => mdprojected.getProperty(item.getBindingContext("mdprojected").getPath()));
            const actualRecords = mdprogrammed.getProperty("/selectedRecords");
            
            mdprogrammed.setProperty("/selectedRecords", projections);
            mdprogrammed.setProperty("/selectedRecordsDate", new Date(projections[0].pd));
        },

        deleteProgrammedD: function (oEvent) {

            let sId = oEvent.getParameters().listItem.sId,
                asId = sId.split("-"),
                idx = asId[asId.length - 1],
                mdincubator = this.getModel("mdincubator"),
                mdprogrammed = this.getModel("mdprogrammed"),
                that = this;
            let obj = mdprogrammed.getProperty("/assigned/" + idx);


            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Se procedera a eliminar : " + obj.projection.projected_date
                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {

                        let assigned = mdprogrammed.getProperty("/assigned/");
                        const projection = mdprogrammed.getProperty("/selectedRecords").find(record => record.housing_way_id === obj.projection.housing_way_id);
                        projection.partial_residue = 0;
                        assigned.splice(idx, 1);
                        
                        mdprogrammed.setProperty("/assigned/", assigned);
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

        onAddResidue: function (oEvent) {
            const mdprogrammed = this.getModel("mdprogrammed");
            const selectedProjectionId = sap.ui.getCore().byId("projection_select").getSelectedKey();
            const projection = mdprogrammed.getProperty("/selectedRecords").find(records => records.housing_way_id == selectedProjectionId);
            const oProjSelect = sap.ui.getCore().byId("projection_select");
            const oSelectedProj = oProjSelect.getSelectedKey();
            const oDatePicker = sap.ui.getCore().byId("programmed_date");
            const oDate = oDatePicker.getValue();
            const oFarm = sap.ui.getCore().byId("selectFarm");
            const oSelectedFarm = oFarm.getSelectedKey();
            const oCore = sap.ui.getCore().byId("selectCore");
            const oSelectedCore = oCore.getSelectedKey();
            const oShed = sap.ui.getCore().byId("selectShed");
            const oSelectedShed = oShed.getSelectedKey();
            const quantity = parseInt(sap.ui.getCore().byId("programmed_quantity").getValue(), 10);
            let valid = true;
            // ====================================================================================
            if (oSelectedProj === undefined || oSelectedProj === "") {
                oProjSelect.setValueState("Error");
                valid = false;
            } else {
                oProjSelect.setValueState("None");
            }
            // ====================================================================================
            if (oDate === undefined || oDate === "" || oDatePicker.getValueState() === 'Error') {
                if(oDatePicker.getValueState() !== 'Error'){
                    oDatePicker.setValueState("Error");
                    oDatePicker.setValueStateText("el campo fecha no puede ser vacío");
                }
                valid = false;

            } else {
                oDatePicker.setValueState("None");
                oDatePicker.setValueStateText("");
            }
            // ====================================================================================
            if (oSelectedFarm === undefined || oSelectedFarm === "" || oSelectedFarm === null) {
                oFarm.setValueState("Error");
                oFarm.setValueStateText("el campo granja no puede ser vacío");
                valid = false;
            } else {
                oFarm.setValueState("None");
                oFarm.setValueStateText("");
            }
            // ====================================================================================
            if (oSelectedCore === undefined || oSelectedCore === "" || oSelectedCore === null) {
                oCore.setValueState("Error");
                oCore.setValueStateText("el campo núcleo no puede ser vacío");
                valid = false;
            } else {
                oCore.setValueState("None");
                oCore.setValueStateText("");
            }
            // ====================================================================================
            if (oSelectedShed === undefined || oSelectedShed === "" || oSelectedShed === null) {
                oShed.setValueState("Error");
                oShed.setValueStateText("el campo galpón no puede ser vacío");
                valid = false;
            } else {
                oShed.setValueState("None");
                oShed.setValueStateText("");
            }
            // ====================================================================================

            if(valid === true){
                if (quantity !== "" && quantity !== undefined && quantity > 0) {
                    const assigned = mdprogrammed.getProperty("/assigned");
                    const oldAssigned = assigned.find(assig => assig.projection.housing_way_id == projection.housing_way_id);
    
                    if (oldAssigned) {
                        oldAssigned.quantity += quantity;
                        projection.partial_residue += quantity;
                    } else {
                        assigned.push({
                            quantity,
                            projection
                        });
                        projection.partial_residue = quantity;
                    }
    
                    sap.ui.getCore().byId("programmed_quantity").setValue("");
                    mdprogrammed.setProperty("/name/state", "None");
                    mdprogrammed.setProperty("/name/stateText", "");
                    mdprogrammed.setProperty("/assigned", assigned);
                } else {
                    sap.ui.getCore().byId("programmed_quantity").setValueState("Error");
                    sap.ui.getCore().byId("programmed_quantity").setValueStateText("el campo cantidad no puede ser vacío");
                }

            }
        },

        onProjectedNext: function (oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            const util = this.getModel("util");

            mdprogrammed.setProperty("/rProgrammed/enabledTab", true);
            this.getView().byId("tabBar").setSelectedKey("ktabProgrammed");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findHousingWayDetByHw");

            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    records: mdprogrammed.getProperty("/selectedRecords").map(record => record.housing_way_id)
                })
            }).then(response => {
                if (response.status !== 200) {
                    console.log("Looks like there was a problem. Status code: " + response.status);
                    return;
                }

                response.json().then((res) => {
                    let records = res.data;
                    records.forEach(element => {
                        if (element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date) {
                            element.isexecuted = true;
                        } else {
                            element.isexecuted = false;
                        }
                    });

                    mdprogrammed.setProperty("/records", records);
                    this.hideButtons(false, true, false, false);

                    if (records.length > 0) {
                        mdprogrammed.setProperty("/executionSaveBtn", true);
                        let residue_programmed = res.residue,
                            projected = mdprogrammed.getProperty("/selectedRecords/"),
                            projected_quantity = 0;

                        projected.forEach(element => {
                            projected_quantity = parseInt(projected_quantity) + parseInt(element.projected_quantity);
                        });

                        let total = parseInt(projected_quantity) - parseInt(residue_programmed);

                        mdprogrammed.setProperty("/programmed_residue", total);
                    } else {
                        mdprogrammed.setProperty("/programmed_residue", mdprogrammed.getProperty("/selectedRecord/projected_quantity"));
                        mdprogrammed.setProperty("/executionSaveBtn", false);
                    }

                    util.setProperty("/busy/", false);
                });
            }).catch(err => console.error(err));
        },

        onSelectProgrammedRecord: function (oEvent) {


            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdprojected = this.getView().getModel("mdprojected"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                oView = this.getView(),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
            util.setProperty("/busy", false);
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

            //habilita el tab de la tabla de registros programado
            mdprogrammed.setProperty("/rProgrammed/enabledTab", true);

            oView.byId("tabBar").setSelectedKey("ktabProgrammed");


            //Buscar los registros de hausingway_detail
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findHousingWayDetByHw");
            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: "housing_way_id=" + mdprogrammed.getProperty("/selectedRecord/housing_way_id")
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
                            records.forEach(element => {
                                if (element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date) {
                                    element.isexecuted = true;
                                } else {
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
                            util.setProperty("/busy/", false);
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });

        },
        addDays: function (ndate, ndays) {
            ndate.setDate(ndate.getDate() + ndays);
            return ndate;
        },

        onDialogPressPj: function (oEvent) {
            this.formProjected = sap.ui.xmlfragment("liftBreedingPlanningM.view.DialogProject", this);
            var that = this;
            var dlg = sap.ui.getCore().byId("dialogprojected");
            dlg.attachAfterClose(function () {
                that.formProjected.destroy();
            });
            this.getView().addDependent(this.formProjected);
            this.formProjected.open();
        },

        onProyectedCloseDialog: function (oEvent) {
            let mdbreed = this.getModel("mdbreed");
            mdbreed.setProperty("/value", null);
            this.formProjected.close();
            this.formProjected.destroy();
        },

        onProjectedSaveDialog: function (oEvent) {
            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdprojected = this.getModel("mdprojected"),
                mdbreed = this.getModel("mdbreed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                breed_id = sap.ui.getCore().byId("breedSelect").getSelectedKey(),
                pDate = sap.ui.getCore().byId("projected_date").mProperties.dateValue,
                projected_quantity = sap.ui.getCore().byId("projected_quantity").mProperties.value;

            if (pDate === null || pDate == "") {
                MessageToast.show("No se pueden insertar fechas vacías", {
                    duration: 3000,
                    width: "20%"
                });
            } else {
                let projected_date = `${pDate.getFullYear()}-${pDate.getMonth() + 1}-${pDate.getDate()}`;
                if (projected_quantity === null || projected_quantity == "" || parseInt(projected_quantity) === 0 || parseInt(projected_quantity) < 0) {
                    MessageToast.show("La cantidad ingresada no es valida", {
                        duration: 3000,
                        width: "20%"
                    });
                } else {
                    mdprojected.setProperty("/saveButton", false);

                    var dates = [];
                    //this.byId("list").setBusy(true);
                    const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/housingway");
                    mdprogrammed.setProperty("/confirmBtn", false);
                    fetch(serverName, {
                        method: "POST",
                        headers: {
                            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        body: "stage_id=" + liftBreedingStage + "&partnership_id=" + partnership_id + "&scenario_id=" + scenario_id + "&projected_quantity=" + projected_quantity +
                            "&projected_date=" + projected_date + "&breed_id=" + breed_id + "&predecessor_id=0"
                    }).then(
                        function (response) {
                            mdprojected.setProperty("/saveButton", true);
                            mdbreed.setProperty("/value", null);

                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status code: " + response.status);
                                return;
                            }

                            response.json().then(function (res) {
                                that.formProjected.close();
                                that.formProjected.destroy();
                                that.onProjectedSave();
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
                            });
                        }
                    ).catch(function (err) {
                        console.log("Fetch error:", err);
                    });
                }
            }
        },

        onProjectedSave: async function () {
            let mdprojected = this.getModel("mdprojected"),
                mdprogrammed = this.getModel("mdprogrammed"),
                findScenario = await this.findProjected();

            mdprogrammed.setProperty("/rProgrammed/enabledTab", false);
            mdprogrammed.setProperty("/records", []);
            this.getView().byId("projectedTable").removeSelections();
            mdprojected.setProperty("/records", findScenario.data);
            this.hideButtons(true, false, false, false);
        },

        onDialogPressPg: function (oEvent) {
            this.formProgrammed = sap.ui.xmlfragment("liftBreedingPlanningM.view.DialogProgrammer", this);
            var that = this;
            var dlg = sap.ui.getCore().byId("dialogprogramed");
            dlg.attachAfterClose(function () {
                that.formProgrammed.destroy();
            });
            this.getView().addDependent(this.formProgrammed);
            this.formProgrammed.open();
            this.onChangeFarm();
        },

        onChangeCore: async function (oEvent) {

            if(oEvent !== undefined && oEvent !== null){
                let input = oEvent.getSource(),
                    value = input.getSelectedKey();

                input.setValueState((value !== undefined && value !== null && value !== '') ? 'None' : 'Error');
                input.setValueStateText((value!== undefined && value!== null && value!== '')?'':'El campo núcleo no puede estar vacío');
            }

            let mdcores = this.getModel("mdcores"),
                mdprogrammed = this.getModel("mdprogrammed"),
                selectedFarm = mdprogrammed.getProperty("/selectedFarm"),
                mdfarm = this.getModel("mdfarms"),
                selectedCore = sap.ui.getCore().byId("selectCore").getSelectedKey();
                
            let findShed = await this.findShedByFarm(selectedCore),
                mdshed = this.getModel("mdshed");

            mdshed.setProperty("/records", findShed.data);
            mdshed.setProperty("/selectedKey", null);
            this.onChangeShed();
            sap.ui.getCore().byId("programmed_quantity").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);

        },
        onChangeShed: async function (oEvent) {

            if(oEvent !== undefined && oEvent !== null){
                let input = oEvent.getSource(),
                    value = input.getSelectedKey();

                input.setValueState((value !== undefined && value !== null && value !== '') ? 'None' : 'Error');
                input.setValueStateText((value!== undefined && value!== null && value!== '')?'':'El campo galpón no puede estar vacío');
            }
            let mdshed = this.getModel("mdshed"),
                mdprogrammed = this.getModel("mdprogrammed"),
                selectedShed = sap.ui.getCore().byId("selectShed").getSelectedKey();
            mdshed.setProperty("/selectedKey", selectedShed);
            sap.ui.getCore().byId("programmed_quantity").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
            let array1 = mdshed.getProperty("/records");

            var found = array1.find(function (element) {
                return element.shed_id == selectedShed;
            });
            
            if (found === undefined || found === null) {
                mdprogrammed.setProperty("/capmin2", "");
                mdprogrammed.setProperty("/capmax2", "");
            } else {
                mdprogrammed.setProperty("/capmin2", parseInt(found.capmin));
                mdprogrammed.setProperty("/capmax2", parseInt(found.capmax));
            }
            
        },

        onChangeFarm: async function (oEvent) {

            if(oEvent !== undefined && oEvent !== null){
                let input = oEvent.getSource(),
                    value = input.getSelectedKey();

                input.setValueState((value !== undefined && value !== null && value !== '') ? 'None' : 'Error');
                input.setValueStateText((value!== undefined && value!== null && value!== '')?'':'El campo granja no puede estar vacío');
            }
            let mdfarm = this.getModel("mdfarms"),
                mdprogrammed = this.getModel("mdprogrammed"),
                selectedFarm = sap.ui.getCore().byId("selectFarm").getSelectedKey();

            mdfarm.setProperty("/selectedKey", selectedFarm);

            let findShed = await this.findCenterByFarm(selectedFarm),
                mdcores = this.getModel("mdcores");

            mdcores.setProperty("/records", findShed.data); /* Mover a findcenterbyfarm */
            var tmp = mdcores.getProperty("/records")[0].center_id;
            
            sap.ui.getCore().byId("programmed_quantity").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
            this.onChangeCore();
        },

        findCenterByFarm: function (selectedFarm) {
            let util = this.getModel("util"),
                mdshed = this.getModel("mdshed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");

            if(selectedFarm != ""){
                return new Promise((resolve, reject) => {
                    fetch("/center/findCenterByFarm2", {
                        method: "POST",
                        headers: {
                            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        body: "farm_id=" + selectedFarm
                    }).then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status code: " + response.status);
                                return;
                            }

                            response.json().then(function (res) {
                                resolve(res);
                            });
                        }
                    ).catch(function (err) {
                        console.error("Fetch error:", err);
                    });
                });
            }
        },
        
        findShedByFarm: function (selectedFarm) {
            let util = this.getModel("util"),
                mdshed = this.getModel("mdshed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
                
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findShedByCenter");
            
            return new Promise((resolve, reject) => {
                fetch("/shed/findShedByCenter2", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },

                    body: "center_id=" + selectedFarm
                })
                    .then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                                    response.status);
                                return;
                            }

                            response.json().then(function (res) {
                                
                                res.data = res.data.filter(function (item) {
                                    return item.statusshed_id == 1 || item.rehousing === true;
                                });
                                
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.error("Fetch error:", err);
                    });
            });
        },

        onProgrammedCloseDialog: function () {
            this.closeProgrammedDialog();
            this.cleanModels();
            this.formProgrammed.close();
            this.formProgrammed.destroy();
        },

        cleanModels: function(){
            let mdcores = this.getModel("mdcores"),
                mdshed = this.getModel("mdshed");

            mdshed.setProperty("/records", []);
            mdcores.setProperty("/records", []);
        },

        onProgrammedSaveDialog: function () {
            let that = this,
                util = this.getModel("util"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                mdprogrammed = this.getModel("mdprogrammed"),
                mdfarms = this.getModel("mdfarms"),
                mdcores = this.getModel("mdcores"),
                mdshed = this.getModel("mdshed"),
                mdprocess = this.getModel("mdprocess"),
                housing_way_id = mdprogrammed.getProperty("/selectedRecord/housing_way_id"),
                pDate = sap.ui.getCore().byId("programmed_date").mProperties.dateValue,
                scheduled_quantity = sap.ui.getCore().byId("programmed_quantity").mProperties.value,
                list = sap.ui.getCore().byId("listProgrammedItems"),
                partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/").partnership_id,
                scheduled_date = `${pDate.getFullYear()}-${pDate.getMonth() + 1}-${pDate.getDate()}`,
                farm_id = sap.ui.getCore().byId("selectFarm").getSelectedKey(),
                shed_id = sap.ui.getCore().byId("selectShed").getSelectedKey(),
                center_id = sap.ui.getCore().byId("selectCore").getSelectedKey(),
                next_step = new Date(pDate.getFullYear(), pDate.getMonth() - 1, pDate.getDate());
            // residue = mdprogrammed.getProperty('/assigned').reduce((result, act) => result + act.quantity, 0);

            //Condicion para validar que el programado no supere el sugerido
            //if(scheduled_quantity<=residue){
            let ddate = this.addDays(next_step, mdprocess.getProperty("/duration"));
            let next_date = `${ddate.getFullYear()}-${ddate.getMonth() + 1}-${ddate.getDate()}`;

            //this.byId("list").setBusy(true);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/housingwaydetail");
            mdprogrammed.setProperty("/confirmBtn", false);
            const data = {
                records: mdprogrammed.getProperty("/assigned").map(assg => ({ housing_way_id: assg.projection.housing_way_id, quantity: assg.quantity })),
                scheduled_date,
                scheduled_quantity,
                farm_id,
                shed_id,
                center_id,
                confirm: 0,
                liftBreedingStage,
                partnership_id,
                scenario_id,
                next_date,
                incubator_plant_id: 0
            };


            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(data)
            }).then(
                function (response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status code: " + response.status);
                        return;
                    }

                    response.json().then(res => {
                        //mdprojected.setProperty("/records", res.data);
                        //util.setProperty("/busy/", true);
                        //Si todo esta bien entrar aqui
                        mdprogrammed.getProperty("/selectedRecords").forEach(record => {
                            record.residue = parseInt(record.residue, 10) + record.partial_residue;
                            record.partial_residue = 0;
                        });

                        mdprogrammed.setProperty("/capmin2", "");
                        mdprogrammed.setProperty("/capmax2", "");
                        mdprogrammed.setProperty("/quantity", "");
                        mdfarms.setProperty("/selectedKey", null);
                        mdcores.setProperty("/selectedKey", null);
                        mdshed.setProperty("/selectedKey", null);
            
                        that.formProgrammed.close();
                        that.formProgrammed.destroy();
                        let residue_programmed = res.residue,
                            projected = mdprogrammed.getProperty("/selectedRecords/"),
                            projected_quantity = 0;

                        projected.forEach(element => {
                            projected_quantity = parseInt(projected_quantity) + parseInt(element.projected_quantity);
                        });

                        let total = parseInt(projected_quantity) - parseInt(residue_programmed);
                        mdprogrammed.setProperty("/programmed_residue", total);
                        let record = res.data;

                        record.forEach(element => {
                            if (element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date) {
                                element.isexecuted = true;
                            } else {
                                element.isexecuted = false;
                            }
                        });

                        mdprogrammed.setProperty("/records", record);
                        mdprogrammed.setProperty("/assigned", []);
                        that.cleanModels();
                        that.hideButtons(false, true, false, false);
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
                    });
                }
            ).catch(function (err) {
                console.error("Fetch error:", err);
                mdprogrammed.setProperty("/confirmBtn", true);
            });
        },

        closeProgrammedDialog: function (oEvent) {
            const mdprogrammed = this.getModel("mdprogrammed");
            const mdfarms = this.getModel("mdfarms");
            const mdcores = this.getModel("mdcores");
            const mdshed = this.getModel("mdshed");
            mdprogrammed.getProperty("/selectedRecords").forEach(record => record.partial_residue = 0);
            mdprogrammed.setProperty("/assigned", []);
            mdprogrammed.setProperty("/capmin2", "");
            mdprogrammed.setProperty("/capmax2", "");
            mdprogrammed.setProperty("/quantity", "");
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdfarms.setProperty("/selectedKey", null);
            mdcores.setProperty("/selectedKey", null);
            mdshed.setProperty("/selectedKey", null);
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

        onBreedLoad: function () {
            const util = this.getModel("util"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBreed") + "/findAllBreedWP";
            let mdbreed = this.getModel("mdbreed");

            mdbreed.setProperty("/records", []);

            let isRecords = new Promise((resolve, reject) => {
                fetch(serverName)
                    .then(
                        function (response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status code: " + response.status);
                                return;
                            }
                            // Examine the text in the response
                            response.json().then(function (data) {
                                resolve(data);
                            });
                        }
                    ).catch(function (err) {
                        console.error("Fetch error:", err);
                    });
            });

            isRecords.then((res) => {
                if (res.data.length > 0) {
                    mdbreed.setProperty("/records", res.data);
                    mdbreed.setProperty("/value", null);
                }
            });
        },

        onFarmLoad: function () {
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
        onDialogPressEx: function () {

            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getModel("mdprogrammed"),
                mdexecuted = this.getModel("mdexecuted"),
                execution_quantity = mdexecuted.getProperty("/execution_quantity"),
                aRecords = mdexecuted.getProperty("/records"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                farm_id = this.getView().getModel("mdfarms").getProperty("/selectedKey"),
                center_id = this.getView().getModel("mdcenter").getProperty("/selectedKey"),
                mdshed = this.getModel("mdshed"),
                shed_id = mdshed.getProperty("/selectedKey");

            let housing_way_id = mdexecuted.getProperty("/selectedRecord/housing_way_id");
            let records_executed = [],
                isValidRecord = true;

            aRecords.forEach(item => {
                // if ((item.available == true)) {

                if ((item.execution_date) && (parseInt(execution_quantity)) /*&& (item.sales_quantity)*/) {
                    item.executionfarm_id = farm_id;
                    item.execution_quantity = execution_quantity;
                    item.executioncenter_id = center_id;
                    item.executionshed_id = shed_id;
                    records_executed.push(item);
                }

                if ((!item.execution_date) && (execution_quantity)) {
                    item.state_date = "Error";
                    item.state_text_date = "El campo fecha no puede estar en blanco";
                    isValidRecord = false;
                } else {
                    item.state_date = "None";
                    item.state_text_date = "";
                }

                if ((item.execution_date) && (!execution_quantity)) {
                    item.state_quantity = "Error";
                    item.state_text_quantity = "El campo cantidad no puede estar en blanco";
                    isValidRecord = false;
                } else {
                    item.state_quantity = "None";
                    item.state_text_quantity = "";
                }
            });

            mdexecuted.refresh(true);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/housingwaydetail");
            if (records_executed.length > 0 && isValidRecord) {

                //Dialogo para confirmar si esta de acuerdo con lo registrado
                var dialogC = new Dialog({
                    title: "Aviso",
                    type: "Message",
                    content: new Text({
                        text: "¿Desea guardar los cambios?"
                    }),
                    beginButton: new Button({
                        text: "Aceptar",
                        press: function (oEvent) {
                            oEvent.getSource().oParent.mAggregations.beginButton.setEnabled(false)

                            fetch(serverName, {
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                method: "PUT",
                                body: JSON.stringify({
                                    records: records_executed,
                                    stage_id: liftBreedingStage,
                                    housing_way_id: housing_way_id,
                                    scenario_id: scenario_id
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
                                            mdexecuted.setProperty("/isnotexecuted", false);
                                            mdprogrammed.setProperty(mdprogrammed.getProperty("/selectedRecordPath/") + "/isexecuted", true);
                                            mdprogrammed.refresh(true);
                                            mdexecuted.setProperty("/isexecuted", true);
                                            mdexecuted.setProperty("/records", res.data);
                                            mdexecuted.setProperty("/name/state", "None");
                                            mdexecuted.setProperty("/name/stateText", "");
                                            mdexecuted.setProperty("/saveBtn", false);
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

                                            dialog.attachBeforeClose(function () {
                                                dialogC.close();
                                            });

                                            dialog.open();

                                        });
                                    }
                                )
                                .catch(function (err) {
                                    console.log("Fetch Error :-S", err);
                                });

                            //hasta aqui
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
                //Fin Dialogo de confirmacion

            } else if (!isValidRecord) {
                this.onToast("Faltan campos");
            } else if (parseInt(mdexecuted.getProperty("/execution_quantity")) === 0) {
                mdexecuted.setProperty("/name/state", "Error");
                mdexecuted.setProperty("/name/stateText", "La cantidad de aves debe ser mayor a cero (0)");
            } else {
                //No se detectaron cambios
                this.onToast("No de detectaron cambios");
            }
        },

        handleDelete: function (oEvent) {
            let sId = oEvent.getParameters().listItem.sId,
                asId = sId.split("-"),
                idx = asId[asId.length - 1],
                mdprogrammed = this.getModel("mdprogrammed"),
                that = this;

            let obj = mdprogrammed.getProperty("/records/" + idx);

            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Se procedera a eliminar la fecha: " + obj.scheduled_date

                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        dialog.close();
                        that.deleteProgrammed(obj.housingway_detail_id, obj.housing_way_id);
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

        deleteProgrammed: function (housingway_detail_id, housing_way_id) {
            var that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getModel("mdprogrammed"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/deleteHousingWayDetail");
            fetch(serverName, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: "housingway_detail_id=" + housingway_detail_id + "&housing_way_id=" + housing_way_id
            }).then(
                function (response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status code: " + response.status);
                        response.json().then(
                            function (resp) {
                                MessageToast.show(resp.msg);
                            }
                        );

                        return;
                    }
                    // Examine the text in the response
                    response.json().then(function (res) {
                        let records = res.data;
                        mdprogrammed.setProperty("/records", records);
                        that.hideButtons(false, true, false, false);

                        let residue_programmed = res.residue,
                            projected_quantity = mdprogrammed.getProperty("/selectedRecord/projected_quantity"),
                            total = projected_quantity - residue_programmed;
                        mdprogrammed.setProperty("/programmed_residue", total);

                        if (records.length > 0) {
                            mdprogrammed.setProperty("/executionSaveBtn", true);
                        } else {
                            mdprogrammed.setProperty("/executionSaveBtn", false);
                        }
                        util.setProperty("/busy/", false);

                    });
                }
            ).catch(function (err) {
                console.error("Fetch error:", err);
            });
        },


        onValidProgrammedQuantity: function (oEvent) {
            let input = oEvent.getSource();
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
                this.validQuantityShed(value);
                return false;
            }
        },

        validQuantityShed: function (value) {
            let mdshed = this.getModel("mdshed");
            let selectedShed = sap.ui.getCore().byId("selectShed").getSelectedKey();
            let array1 = mdshed.getProperty("/records");
            let mdprogrammed = this.getModel("mdprogrammed");
            let programmed_residue = mdprogrammed.getProperty("/programmed_residue");

            var found = array1.find(function (element) {
                return element.shed_id == selectedShed;
            });
            mdprogrammed.setProperty("/confirmBtn", true);
            mdprogrammed.setProperty("/capmin", found.capmin);
            mdprogrammed.setProperty("/capmax", found.capmax);
            if (value === null || value === "") {//VALIDACION PARA ENTRADA NULA
                mdprogrammed.setProperty("/name/state", "None");
                mdprogrammed.setProperty("/name/stateText", "");
                mdprogrammed.setProperty("/confirmBtn", false);
            }
            else if (parseInt(value) === 0) {//VALIDACION PARA ENTRADA IGUAL A 0
                mdprogrammed.setProperty("/name/state", "Error");
                mdprogrammed.setProperty("/name/stateText", "La cantidad programada debe ser mayor a 0");
                mdprogrammed.setProperty("/confirmBtn", false);
            }
            else if (parseInt(value) > programmed_residue) {//VALIDACION PARA ENTRADA MAYOR AL RESIDUO
                mdprogrammed.setProperty("/name/state", "Warning");
                mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera al saldo");
            }
            else if (parseInt(value) > found.capmax) {//VALIDACION PARA ENTRADA MAYOR A CAPACID. MAX
                mdprogrammed.setProperty("/name/state", "Warning");
                mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera la capacidad del galpon");
            }
            else if (parseInt(value) < parseInt(found.capmin)) {//VALIDACION PARA ENTRADA MENOR A CAPAC. MIN
                mdprogrammed.setProperty("/name/state", "Warning");
                mdprogrammed.setProperty("/name/stateText", "La cantidad programada esta por debajo de la capacidad mínima del galpón");
            }
            else {
                mdprogrammed.setProperty("/name/state", "None");
                mdprogrammed.setProperty("/name/stateText", "");
            }

        },



        onValidProgrammedQuantity2: function (o) {
            debugger;
            let input = o.getSource();
            
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

                let mdshed = this.getModel("mdshed");

                let mdprogrammed = this.getModel("mdprogrammed");

                let array1 = mdshed.getProperty("/records");


                let scheduled_quantity = parseInt(sap.ui.getCore().byId("programmed_quantity").getValue()),
                    programmed_residue = mdprogrammed.getProperty("/programmed_residue");

                if (parseInt(value) <= programmed_residue && parseInt(value) <= parseInt(found.capmax)) {
                    mdprogrammed.setProperty("/name/state", "None");
                    mdprogrammed.setProperty("/name/stateText", "");
                    mdprogrammed.setProperty("/confirmBtn", true);

                } else {
                    if (parseInt(value) > found.capmax) {
                        mdprogrammed.setProperty("/name/state", "Error");
                        mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera la capacidad del galpon");
                    }
                }
                return false;
            }
        },

        reloadProgrammed: function (housingway_detail, mdprogrammed) {
            let housing_ways = [];

            housing_ways = housingway_detail.map(record => record.housing_way_id);
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
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                            return;
                        }

                        response.json().then(function (res) {
                            mdprogrammed.setProperty("/records", res.data);
                        });
                    }
                )
                .catch(function (err) {
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

                        fetch("/synchronization/syncLevanteYCria", {
                            method: "GET"
                        })
                            .then(
                                function (response) {
                                    if (response.status !== 200) {
                                        util.setProperty("/busy", false);

                                        console.log("Looks like there was a problem. Status Code: " + response.status);
                                        response.json()
                                            .then(data => {
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

                                            let texto = "";
                                            if (res.resp.length > 0) {
                                                texto = "Sincronización realizada con éxito.\n" + res.resp[0].satisfactorios + " registro(s) guardados\n" + res.resp[0].error + " registro(s) erroneos";

                                            }
                                            else {
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

        onPressDetProg: function (oEvent) {
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
                    press: function () {
                        that.onUpdateDisabled(path);
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

        onUpdateDisabled: function (path) {
            let mdprogrammed = this.getView().getModel("mdprogrammed"),
                selectedItem = mdprogrammed.getProperty(path),
                id = selectedItem.housingway_detail_id,
                housing_way_id = selectedItem.housing_way_id,
                shed_id = selectedItem.shed_id,
                records_selected = mdprogrammed.getProperty('/selectedRecords').map(itm => itm.housing_way_id);

            fetch("/housingWayDetail/updateDisabledHousingWayDetail", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "PUT",
                body: JSON.stringify({
                    housing_way_id: housing_way_id,
                    housingway_detail_id: id,
                    shed_id: shed_id,
                    records_selected: records_selected
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
                                    text: "No se puede eliminar la programación, porque ya ha sido ejecutada."
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

                                let records = res.data;
                                records.forEach(element => {
                                    if (element.execution_quantity && element.execution_date) {
                                        element.isexecuted = true;
                                    } else {
                                        element.isexecuted = false;
                                    }

                                });
                                mdprogrammed.setProperty("/records", records);
                                let residue_programmed = res.residue,
                                    projected = mdprogrammed.getProperty("/selectedRecords/");

                                projected.forEach(element => {
                                    const tmp = residue_programmed.find(itm => { return itm.housing_way_id === element.housing_way_id})
                                    if(tmp !== undefined){
                                        element.residue = parseInt(tmp.residue);
                                        element.partial_residue = 0;
                                    }
                                });
                                mdprogrammed.setProperty("/selectedRecords", projected);
                                mdprogrammed.refresh(true);

                                var dialog = new Dialog({
                                    title: "Información",
                                    type: "Message",
                                    state: "Success",
                                    content: new Text({
                                        text: "Programación eliminada con éxito."
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

                            });
                        }

                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });

        },


        OnChangeStage: function (oEvent) {
            let mdprojected = this.getView().getModel("mdprojected"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                item = oEvent.getSource().getSelectedKey()
            if (item == "D") {
                this.getView().byId("SelectEviction").setVisible(true);
            } else {
                this.getView().byId("SelectEviction").setVisible(false);
            }
            mdprojected.setProperty("/visibleOtherButtons", false);
            this.getView().byId("numberL").setValue("");

            this.getView().byId("GoFind").setEnabled(true);
            mdprogrammed.setProperty("/visible", false);
            mdprogrammed.setProperty("/confirmBtn", false);
            this.resetStates();
            this.setColumnsInvisible();

            mdprojected.setProperty("/records", []);
        },

        resetStates: function () {
            let mdprojected = this.getView().getModel("mdprojected");

            mdprojected.setProperty("/tipeAdjustmentH", "");
            mdprojected.setProperty("/descripAdjustmentH", "");
            mdprojected.setProperty("/cantAdjustmentH", "");
            mdprojected.setProperty("/stateTextQuantity", "");
            mdprojected.setProperty("/stateQuantity", "None");
            mdprojected.setProperty("/stateTextDescription", "");
            mdprojected.setProperty("/stateDescription", "None");
            mdprojected.setProperty("/stateTextType", "");
            mdprojected.setProperty("/stateType", "None");
            mdprojected.setProperty("/stateLot", "None");
            mdprojected.setProperty("/stateTextLot", "");
        },

        setColumnsInvisible: function () {
            let mdprojected = this.getView().getModel("mdprojected")

            mdprojected.setProperty("/editable", "Inactive")
            mdprojected.setProperty("/visibleTable", false);
            mdprojected.setProperty("/visibleP", false);
            mdprojected.setProperty("/visibleC", false);
            mdprojected.setProperty("/visibleCant", false);
            mdprojected.setProperty("/visibleH", false);
            mdprojected.setProperty("/visibleH1", false);
            mdprojected.setProperty("/visibleI", false);
            mdprojected.setProperty("/visibleE", false);

            // this.getView().byId("bS").setProperty("visible", false);
            // this.getView().byId("bR").setProperty("visible", false);

        },

        validateInputLot: function (o) {
            let mdprojected = this.getView().getModel("mdprojected");

            let stage = "k"
            let input = o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            // if (stage === "H") {
            //   var len = 5;
            //   regex = new RegExp(`^[0-9]{1,${len}}-([0-1][0-9][0-9]|2[0-7][0-9]|280)$`);
            //   if (regex.test(value)) {
            //     mdprojected.setProperty("/stateLot", "None");
            //     mdprojected.setProperty("/stateTextLot", "");
            //     this.getView().byId("GoFind").setEnabled(true);

            //     return true;
            //   }
            //   else {
            //     this.getView().byId("GoFind").setEnabled(false);

            //     let aux = value.split("").filter(char => {
            //       if (/^[0-9\-]$/.test(char)) {
            //         if (char !== ".") {
            //           return true;
            //         }
            //       }
            //     }).join("");
            //     value = aux.substring(0, length);
            //     input.setValue(value);

            //     mdprojected.setProperty("/stateLot", "Error");
            //     mdprojected.setProperty("/stateTextLot", "Formato de lote invalido");
            //     return false;
            //   }
            // } 
            // else {

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
            // }
        },


        pressadjustment: function (o) {
            let that = this
            let mdprojected = this.getView().getModel("mdprojected")
            fetch("/adjustments/findEvictionLotData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    lot: this.getView().byId("numberL").getValue(),
                    stage: "C",
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
                        that.getModel("mdprojected").setProperty("/adjustmenttable", res.data)
                        if(res.data.length>0){
                            mdprojected.setProperty("/visibleInfo", ((res.data[0].adjustment_date !== undefined && res.data[0].adjustment_date !== null) && (res.data[0].username !== undefined && res.data[0].username !== null)));
                            mdprojected.setProperty("/visibleOtherButtons",true)
                        }else{
                            mdprojected.setProperty("/visibleOtherButtons",false)
                            
                        }
                        if(res.data[0].eviction===true){
                            mdprojected.setProperty("/visibleOtherButtons",false)
                        }




                    });

                })
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });


        },

        changeProgrammedDate: function(oEvent){
            let input = oEvent.getSource(),
                value = input.getValue(),
                minus = value.split('-'),
                divider = value.split('/');

            if(divider.length===3){
                value = `${divider[0]}-${divider[1]}-${divider[2]}`;
            }
            input.setValueState((minus.length===3||divider.length===3)?'None':'Error');
            input.setValueStateText((minus.length===3||divider.length===3)?'':'Fecha no valida');
            
            input.setValue(value);
        },
        changeProjection: function(oEvent){
            let input = oEvent.getSource(),
                value = input.getSelectedKey();

            input.setValueState((value!== undefined && value!== null && value!== '')?'None':'Error');
            input.setValueStateText((value!== undefined && value!== null && value!== '')?'':'Seleccione una proyección');
            
        },



    });
});
