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
    "sap/m/MessageBox",
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
            // this.dialogDelete = sap.ui.xmlfragment("liftBreedingPlanningM.view.DialogDelete", this);
            this.index = oArguments.id;

            let oView = this.getView();
            let ospartnership = this.getModel("ospartnership");
            // this.resetReports();
            oView.byId("tabBar").setSelectedKey("tabParameter");
            oView.byId("tableBreed").addEventDelegate({
                onAfterRendering: oEvent => {
                    console.log("victor te amo!");
                }
            });
            console.log("this.projectedPopover antes")
            this.projectedPopover = sap.ui.xmlfragment("liftBreedingPlanningM.view.parameter.ProjectedPopover", this);
            this.getView().addDependent(this.projectedPopover);
            console.log("this.projectedPopover")
            console.log(this.projectedPopover)

            this.incubatorPopover = sap.ui.xmlfragment("liftBreedingPlanningM.view.parameter.IncubatorPopover", this);
            this.getView().addDependent(this.incubatorPopover);


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
                            console.log("err: ", data);
                        }
                    } else {
                        MessageToast.show("ha ocurrido un error al cargar el inventario", {
                            duration: 3000,
                            width: "35%"
                        });
                        console.log("err:", data);
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

        showProjectedLots: async function(oEvent) {
            const optimizado = this.getView().getModel("optimizado");
            const projection = oEvent.getSource().getBindingContext("optimizado").getObject();
            console.log(projection)
            const link = oEvent.getSource();
            
            console.log(projection.lista.length)
            console.log(optimizado)
            console.log(optimizado.getProperty("/stage"))
            if (optimizado.getProperty("/stage") === '2') {
                console.log("es incubadora")
                if(projection.lista.length > 0){
                    optimizado.setProperty("/popover", projection.lista);
                    this.incubatorPopover.openBy(link);
                }
                else{
                    console.log("esta vacio")
                    MessageToast.show("No existen máquinas disponibles para la fecha", {
                        duration: 3000,
                        width: "35%"
                    });
                }

                
                
                
            }
            else{
                if(projection.lista.length > 0){
                    optimizado.setProperty("/popover", projection.lista);
                    this.projectedPopover.openBy(link);
                }
                else{
                    console.log("esta vacio")
                    MessageToast.show("No existen galpones disponibles para la fecha", {
                        duration: 3000,
                        width: "35%"
                    });
                }
            }
            
            
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
            //  let pERP = await this.pruebaERP();
            //  console.log(JSON.parse(pERP.data));
            let records_pb = await this.onParameterBreed();
            await this.loadStages()
            await this.loadScenarios()
            mdparameter_breed.setProperty("/records", records_pb.data);
            console.log(mdparameter_breed);

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
            console.log("process_info ", process_info.data[0].theoretical_duration);
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
                console.log("entro if");
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
            console.log("presione el boton de reportes");
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
                // console.log("fechas vacias")
                MessageToast.show("No se pueden consultar fechas vacías", {
                    duration: 3000,
                    width: "20%"
                });
            } else {
                console.log("las fechas");
                console.log(date1);
                console.log(date2);
                console.log(breed_id);
                console.log(init_date);
                console.log(end_date);
                console.log("EL MODELO CON FECHAS");
                console.log(mdreports);
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
                                console.log("la respuesta despues de reportes");
                                console.log(res);
                                mdreports.setProperty("/records", res.data);
                                console.log("la longitud");
                                console.log(res.data.length);
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
            console.log(mdreports);
            this.arrayObjToCsv(mdreports);
            // this.arrayObjToCsv();
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
                    contenido += Object.keys(ar[i]).map(function (key) {
                        console.log(ar[i][key]);
                        return ar[i][key];
                    }).join(";") + "\n";
                }
                console.log(contenido);
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
            console.log("path: ", path);
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
        loadStages: function (create) {
            var mdstage = this.getView().getModel("mdstage")
                // mdprocess = this.getView().getModel("MDPROCESS");
            var util = this.getView().getModel("util");
            var serviceUrl = util.getProperty("/serviceUrl");
            var settings = {
                url: serviceUrl + "/stage/",
                method: "GET",
                success: function (res) {
                    console.log(res.data)
                    mdstage.setProperty("/records", res.data);
                    console.log("stage_id = " + res.data[0].stage_id);
                    // if(create) mdprocess.setProperty("/stage_id/value", res.data[0].stage_id);

                },
                error: function (err) {
                    console.log(err);
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                }
            };
            //borra los registros MDSTAGE que estén almacenados actualmente
            mdstage.setProperty("/records/", []);
            //realiza la llamada ajax
            $.ajax(settings);
        },
        loadScenarios: function (create) {


            
            var mdescenarios = this.getView().getModel("escenarios")
                // mdprocess = this.getView().getModel("MDPROCESS");
            var util = this.getView().getModel("util");
            var serviceUrl = util.getProperty("/serviceUrl");
            var settings = {
                url: serviceUrl + "/scenario/findAllScenario",
                method: "GET",
                success: function (res) {
                    console.log(res)
                    mdescenarios.setProperty("/records", res.data);
                    // console.log("stage_id = " + res.data[0].stage_id);
                    // if(create) mdprocess.setProperty("/stage_id/value", res.data[0].stage_id);

                },
                error: function (err) {
                    console.log(err);
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                }
            };
            
            $.ajax(settings);
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
        onChangeShedE: async function () {
            let mdshed = this.getModel("mdshed"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                selectedShed = mdshed.getProperty("/selectedKey");
            console.log(selectedShed);
            console.log(mdexecuted.getProperty("/records")[0].available);
            if (mdexecuted.getProperty("/records")[0].available) {
                // console.log(this.getView().byId("execution_quantityE"))
                // this.getView().byId("execution_quantityE").setValue('')
                // mdexecuted.setProperty("/execution_quantity",'');
                mdexecuted.setProperty("/name/state", "None");
                mdexecuted.setProperty("/name/stateText", "");
                mdexecuted.setProperty("/confirmBtn", false);
                mdexecuted.setProperty("/addBtn", false);
            }

            console.log(mdexecuted);
            console.log(mdshed);
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
                                console.log(res);

                            });
                        }

                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });


            /*mdprojected.setProperty("/Delete/", oEvent.getSource()["_aSelectedPaths"][0]);
      console.log(mdprojected.getProperty("/Delete/"))
      console.log(mdprojected.getProperty(mdprojected.getProperty("/Delete/"))) */
            /*SELECT b.housing_way_id, CASE WHEN b.housing_way_id IS NOT NULL THEN true ELSE false END as Retornar
	FROM public.txhousingway a 
	LEFT JOIN txhousingway_detail b on a.housing_way_id = b.housing_way_id
	WHERE a.housing_way_id = 892; */
        },
        findProjected: function () {
            let util = this.getModel("util"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
            console.log(partnership_id);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findHousingByStage");
            console.log("el serverName");
            console.log(serverName);

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
                mdprojected = this.getView().getModel("mdprojected"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                mdfarms = this.getView().getModel("mdfarms"),
                mdcenter = this.getView().getModel("mdcenter"),
                mdshed = this.getView().getModel("mdshed"),
                hwid = mdexecuted.getProperty("/selectedRecord/housingway_detail_id");
            console.log(hwid);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findHousingWayDetByHwdId");
            // console.log(serverName)
            let partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            return new Promise((resolve, reject) => {
                fetch("/housingwaydetail/findHousingWayDetByHwdId", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        housing_way_id: mdexecuted.getProperty("/selectedRecord/housingway_detail_id"),
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
                                console.log(res);
                                let records = res.data;
                                mdexecuted.setProperty("/records", records);
                                if (records[0].execution_quantity === null && records[0].execution_date === null) {
                                    mdexecuted.setProperty("/isnotexecuted", true);
                                    mdexecuted.setProperty("/isexecuted", false);
                                } else {
                                    mdexecuted.setProperty("/isnotexecuted", false);
                                    mdexecuted.setProperty("/isexecuted", true);
                                }
                                console.log(mdexecuted);
                                if (records[0].executedfarm_id !== null) {
                                    console.log("entro farm", mdfarms);
                                    mdfarms.setProperty("/selectedKey", records[0].executedfarm_id);
                                } else {
                                    mdfarms.setProperty("/selectedKey", records[0].farm_id);
                                }
                                if (records[0].executedcenter_id !== null) {
                                    console.log("entro center", mdcenter);
                                    mdcenter.setProperty("/selectedKey", records[0].executedcenter_id);
                                } else {
                                    mdcenter.setProperty("/selectedKey", records[0].center_id);
                                }
                                if (records[0].executedshed_id !== null) {
                                    console.log(mdshed.getProperty("/selectedKey"));
                                    mdshed.setProperty("/selectedKey", records[0].executedshed_id);
                                    console.log("entro shed", mdshed, records[0].executedshed_id);
                                    mdshed.refresh(true);
                                } else {
                                    mdshed.setProperty("/selectedKey", records[0].shed_id);
                                }
                                if (records[0].execution_date === null) {
                                    records[0].execution_date = records[0].scheduled_date;
                                }


                                if (records[0].execution_quantity === null) {
                                    console.log(records[0].scheduled_quantity, records[0].execution_quantity);
                                    mdexecuted.setProperty("/execution_quantity", records[0].scheduled_quantity);
                                    console.log(mdexecuted);
                                } else {
                                    console.log("entree");
                                    mdexecuted.setProperty("/execution_quantity", records[0].execution_quantity);
                                }
                                mdexecuted.setProperty("/saveBtn", true);

                                that.hideButtons(false, false, true, false);
                                console.log(mdexecuted);
                                console.log(records);

                                if (records.length > 0) {
                                    mdprogrammed.setProperty("/executionSaveBtn", true);
                                    console.log(records);
                                    let residue_programmed = res.residue,
                                        projected_quantity = mdprogrammed.getProperty("/selectedRecord/projected_quantity"),
                                        total = projected_quantity - residue_programmed;

                                    mdexecuted.setProperty("/programmed_residue", total);
                                    console.log(mdprogrammed);
                                } else {
                                    mdexecuted.setProperty("/programmed_residue", mdprogrammed.getProperty("/selectedRecord/projected_quantity"));

                                }
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
            console.log(findCenter);
            mdcenter.setProperty("/records", findCenter.data);
            // mdcenter.setProperty("/selectedKey",findCenter.data[0].center_id)

            console.log(mdcenter);
            if (mdexecuted.getProperty("/records")[0].available) {
                // console.log(this.getView().byId("execution_quantityE"))
                // this.getView().byId("execution_quantityE").setValue('')
                // mdexecuted.setProperty("/execution_quantity",'');
                mdexecuted.setProperty("/name/state", "None");
                mdexecuted.setProperty("/name/stateText", "");
                mdexecuted.setProperty("/confirmBtn", false);
                mdexecuted.setProperty("/addBtn", false);
            }
            // this.getView().byId("execution_quantityE").setValue('')
            // mdexecuted.setProperty("/execution_quantity",'');
            // mdexecuted.setProperty("/name/state", "None");
            // mdexecuted.setProperty("/name/stateText", "");
            // mdexecuted.setProperty("/confirmBtn", false);
            // mdexecuted.setProperty("/addBtn", false);
            this.onChangeCenterE();

            //Pendiente: Crear funcion para manejar el cambio del nucleo y de los galpones



            // console.log(sap.ui.getCore().byId("selectFarm"))
        },

        onChangeCenterE: async function () {
            let mdcenter = this.getView().getModel("mdcenter"),
                mdshed = this.getView().getModel("mdshed"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                center_id = mdcenter.getProperty("/selectedKey"),
                executed_shed = mdexecuted.getProperty("/selectedRecord").executedshed_id;
            console.log(center_id);
            let findShed = await this.findShedByCenterForExecution(center_id);
            console.log(findShed);
            mdshed.setProperty("/records", findShed.data);
            console.log(mdexecuted.getProperty("/selectedRecord/shed_id"));
            // if(executed_shed!=null){
            //   mdshed.setProperty("/selectedKey",executed_shed)
            // }else{
            //   mdshed.setProperty("/selectedKey",mdexecuted.getProperty("/selectedRecord/shed_id"))
            // }

            console.log(mdshed);




            // console.log(sap.ui.getCore().byId("selectFarm"))
        },


        findShedByCenterForExecution: function (selectedFarm) { /* En caso que se pida mostrar todos los galpones en la pantalla de ejecucion */
            let util = this.getModel("util"),
                that = this,
                mdexecuted = this.getModel("mdexecuted"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            console.log(selectedFarm);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findShedsByFarm");
            console.log(serverName);
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
                                console.log(res);
                                console.log(mdexecuted.getProperty("/records"));
                                console.log(that.getView().getModel("mdshed").getProperty("/selectedKey"));
                                let shed_id = that.getView().getModel("mdshed").getProperty("/selectedKey");
                                console.log("la data antes del filter:", res.data);
                                res.data = res.data.filter(function (item) {
                                    return item.statusshed_id === 1 || item.rehousing === true || mdexecuted.getProperty("/selectedRecord").shed_id === item.shed_id || mdexecuted.getProperty("/selectedRecord").executedshed_id === item.shed_id;
                                });
                                console.log("la data luego del filter:", res.data);

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
            console.log("valor: " + value);
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                console.log("entro if");
                return true;
            }
            else {
                console.log("entro else");
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

                console.log("el valor es: " + value);


                let mdexecuted = this.getView().getModel("mdexecuted"),
                    programmedquantity = mdexecuted.getProperty("/selectedRecord").scheduled_quantity;

                console.log("el modelo shed en validacion");
                console.log(mdexecuted, programmedquantity);

                let mdshed = this.getView().getModel("mdshed");
                let records = mdshed.getProperty("/records"),
                    myshed = records.filter(function (item) {
                        return mdshed.getProperty("/selectedKey") == item.shed_id;
                    });
                console.log(myshed);
                console.log(value, programmedquantity, value, myshed[0].capmax);

                if (parseInt(value) <= parseInt(myshed[0].capmax)) {
                    mdexecuted.setProperty("/name/state", "None");
                    console.log("entro");
                    mdexecuted.setProperty("/name/stateText", "");
                    mdexecuted.setProperty("/saveBtn", true);
                    console.log(mdexecuted.getProperty("/saveBtn"));

                } else {
                    // if (parseInt(value) > programmedquantity) {
                    //   mdexecuted.setProperty("/name/state", "Error");
                    //   mdexecuted.setProperty("/name/stateText", "La cantidad ejecutada supera la programada");
                    //   mdexecuted.setProperty("/saveBtn", false);
                    // }
                    console.log(value, myshed[0].capmax);
                    if (parseInt(value) > parseInt(myshed[0].capmax)) {
                        mdexecuted.setProperty("/name/state", "Warning");
                        mdexecuted.setProperty("/name/stateText", "La cantidad ejecutada supera la capacidad del galpon");
                        // mdexecuted.setProperty("/saveBtn", false);
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
            console.log("llego ***");
            //osfarm.setProperty("/saveBtn", false);
            var selectedKey = ev.getSource().getSelectedKey();
            let recordsB = mdbreed.getProperty("/records");
            if (selectedKey === "kTabParameter") {
                console.log("entre parameters");
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
                console.log("entre projected");
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

                // this.getView().getModel("mdfarms").setProperty("/records",[]);
                this.getView().getModel("mdfarms").setProperty("/selectedKey", "");

                // this.getView().getModel("mdcores").setProperty("/records",[]);
                this.getView().getModel("mdcores").setProperty("/selectedKey", "");

                // this.getView().getModel("mdshed").setProperty("/records",[]);
                this.getView().getModel("mdshed").setProperty("/selectedKey", "");

                this.getView().byId("liftBreedingTable").removeSelections();
                this.getView().byId("liftBreedingTableE").removeSelections();
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab", false);
                console.log(mdexecuted);
            }

            if (selectedKey === "ktabExecuted") {
                this.getView().byId("liftBreedingTableE").removeSelections();
                this.hideButtons(false, false, true, false);
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
                console.log("LA LONGITUD");
                console.log(lo.length);

                if (lo.length == 0) {
                    this.hideButtons(false, false, false, false);
                } else {
                    this.hideButtons(false, false, false, true);
                }
            }

            if (selectedKey != "ktabReports") {
                mdprojected.setProperty("/visibleOtherButtons",false)
                console.log("here i am, rock you like a hurricane");
                mdreports.setProperty("/records", []);
                this.getView().byId("sd").setValue("");
                this.getView().byId("sd2").setValue("");
                mdreports.setProperty("/visible", false);

                if (recordsB[0].breed_id === "Todas") {
                    recordsB.shift();
                    console.log(recordsB);
                    mdbreed.setProperty("/records", recordsB);
                }
            }

            if (selectedKey === "tabAdjust") {
                // console.log("here i am, rock you like a hurricane");
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

            console.log(mdexecuted);

        },

        SaveEviction: async function () {
            let mdprojected = this.getView().getModel("mdprojected"),
              stage = "C",
              record = mdprojected.getProperty("/adjustmenttable/0")
            console.log(stage)
            record.stage = stage
            console.log(record)
            console.log(record.eviction_date)
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


            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdfarms = this.getView().getModel("mdfarms"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                oView = this.getView(),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
            console.log(mdprogrammed);
            //guarda la ruta del registro proyectado que fue seleccionado
            mdprogrammed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            console.log(mdprogrammed.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
            var selected = mdprogrammed.getProperty(mdprogrammed.getProperty("/selectedRecordPath/"));
            console.log(selected);
            mdexecuted.setProperty("/selectedRecord", mdprogrammed.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));

            mdexecuted.setProperty("/rExecuted/enabledTab", true);

            oView.byId("tabBar").setSelectedKey("ktabExecuted");

            let findExecuted = await this.findExecuted();
            console.log(this.getView().getModel("mdfarms"));
            console.log(this.getView().byId("selectFarm"));

            console.log(mdexecuted);
            mdprogrammed.setProperty("/programmedsaveBtn", false);
            let records = mdexecuted.getProperty("/records");
            if (records.length > 0) {
                mdexecuted.setProperty("/executionSaveBtn", true);
            }
            if (records[0].executedfarm_id) {
                mdfarms.setProperty("/selectedKey", records[0].executedfarm_id);

            } else {
                mdfarms.setProperty("/selectedKey", records[0].farm_id);
            }
            await this.onChangeFarmE();
            console.log(findExecuted.data[0].execution_quantity);
            // this.getView().byId("execution_quantityE").setValue(findExecuted.data[0].execution_quantity)
            console.log("Cambio");

            //       mdprogrammed.setProperty("/selectedRecord/", mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
            //       console.log(mdprogrammed);
            //       let pDate = mdprogrammed.getProperty("/selectedRecord/projected_date"),
            //         aDate = pDate.split("/"),
            //         minDate = new Date(aDate[2], aDate[1] - 1, aDate[0]),
            //         date2 = new Date(aDate[2], aDate[1] - 1, aDate[0]),
            //         maxDate = this.addDays(date2, 7);

            //       mdprogrammed.setProperty("/selectedRecord/minDate/", minDate);
            //       mdprogrammed.setProperty("/selectedRecord/maxDate/", maxDate);

            //       //habilita el tab de la tabla de registros programado
            //       mdprogrammed.setProperty("/rProgrammed/enabledTab", true);

            //       oView.byId("tabBar").setSelectedKey("ktabProgrammed");


            //       console.log(mdprogrammed);
            //       //Buscar los registros de hausingway_detail
            //       const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findHousingWayDetByHw");
            // console.log(serverName)
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
                console.log("entre");
                mdprojected.setProperty("/programmedFilter", "programmed");
                console.log("sali");
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
                console.log("mah filter nigger: ", filter);
                if (filter === "all") {
                    filter = "programmed";
                }
                query = query === "" ? null : query.toUpperCase();
                filter = filter !== "programmed";
                filter = query !== null ? null : filter;
                console.log("El filte: ", filter, "El query:", query);
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
                console.log(result.data);
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
                console.log("entre");
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
        },

        deleteProgrammedD: function (oEvent) {

            console.log(oEvent.getParameters().listItem);
            let sId = oEvent.getParameters().listItem.sId,
                asId = sId.split("-"),
                idx = asId[asId.length - 1],
                mdincubator = this.getModel("mdincubator"),
                mdprogrammed = this.getModel("mdprogrammed"),
                that = this;
            let obj = mdprogrammed.getProperty("/assigned/" + idx);
            //  console.log('Obj: ', obj)
            //console.log(mdincubator)


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
                        console.log("Tengo: ", assigned);
                        console.log("obj", obj);
                        const projection = mdprogrammed.getProperty("/selectedRecords").find(record => record.housing_way_id === obj.projection.housing_way_id);
                        projection.partial_residue = 0;
                        assigned.splice(idx, 1);
                        console.log("Elimino: ", assigned);
                        // mdprogrammed.setProperty("/lot_records/" + mdincubator.getProperty("/listID") + "/assigned", assigned);
                        mdprogrammed.setProperty("/assigned/", assigned);
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
            // ====================================================================================
            if (oSelectedProj === undefined || oSelectedProj === "") {
                oProjSelect.setValueState("Error");
            } else {
                oProjSelect.setValueState("None");
            }
            // ====================================================================================
            if (oDate === undefined || oDate === "") {
                oDatePicker.setValueState("Error");
                oDatePicker.setValueStateText("el campo fecha no puede ser vacío");
            } else {
                oDatePicker.setValueState("None");
                oDatePicker.setValueStateText("");
            }
            // ====================================================================================
            if (oSelectedFarm === undefined || oSelectedFarm === "" || oSelectedFarm === null) {
                oFarm.setValueState("Error");
                oFarm.setValueStateText("el campo granja no puede ser vacío");
            } else {
                oFarm.setValueState("None");
                oFarm.setValueStateText("");
            }
            // ====================================================================================
            if (oSelectedCore === undefined || oSelectedCore === "" || oSelectedCore === null) {
                oCore.setValueState("Error");
                oCore.setValueStateText("el campo núcleo no puede ser vacío");
            } else {
                oCore.setValueState("None");
                oCore.setValueStateText("");
            }
            // ====================================================================================
            if (oSelectedShed === undefined || oSelectedShed === "" || oSelectedShed === null) {
                oShed.setValueState("Error");
                oShed.setValueStateText("el campo galpón no puede ser vacío");
            } else {
                oShed.setValueState("None");
                oShed.setValueStateText("");
            }
            // ====================================================================================
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
        },

        onProjectedNext: function (oEvent) {
            const mdprogrammed = this.getView().getModel("mdprogrammed");
            const util = this.getModel("util");
            console.log(mdprogrammed.getProperty("/selectedRecords"));

            mdprogrammed.setProperty("/rProgrammed/enabledTab", true);

            this.getView().byId("tabBar").setSelectedKey("ktabProgrammed");
            console.log("entre0");
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

                console.log("entre1");
                response.json().then((res) => {
                    console.log(res);
                    let records = res.data;
                    records.forEach(element => {
                        if (element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date) {
                            element.isexecuted = true;
                        } else {
                            element.isexecuted = false;
                        }
                    });

                    console.log("Entreee2");
                    console.log(records);
                    mdprogrammed.setProperty("/records", records);
                    this.hideButtons(false, true, false, false);

                    console.log(records);

                    if (records.length > 0) {
                        mdprogrammed.setProperty("/executionSaveBtn", true);
                        console.log(records);
                        let residue_programmed = res.residue,
                            projected = mdprogrammed.getProperty("/selectedRecords/"),
                            projected_quantity = 0;

                        projected.forEach(element => {
                            projected_quantity = parseInt(projected_quantity) + parseInt(element.projected_quantity);
                        });

                        let total = parseInt(projected_quantity) - parseInt(residue_programmed);

                        console.log("Mi total: ", total, "Mi projected quantity", projected_quantity, "Mi residue:", res.residue);
                        mdprogrammed.setProperty("/programmed_residue", total);
                        console.log(mdprogrammed);
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
            console.log(mdprogrammed);
            //guarda la ruta del registro proyectado que fue seleccionado
            mdprogrammed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            mdprogrammed.setProperty("/selectedRecord/", mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
            console.log(mdprogrammed);
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


            console.log(mdprogrammed);
            //Buscar los registros de hausingway_detail
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findHousingWayDetByHw");
            console.log(serverName);
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
                            console.log(res);
                            let records = res.data;
                            records.forEach(element => {
                                if (element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date) {
                                    element.isexecuted = true;
                                } else {
                                    element.isexecuted = false;
                                }

                            });
                            console.log(records);
                            mdprogrammed.setProperty("/records", records);
                            console.log(mdexecuted);
                            that.hideButtons(false, true, false, false);

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

        // onDialogPressPj: function (oEvent) {
        //     this.formProjected = sap.ui.xmlfragment("liftBreedingPlanningM.view.DialogProject", this);
        //     var that = this;
        //     var dlg = sap.ui.getCore().byId("dialogprojected");
        //     dlg.attachAfterClose(function () {
        //         that.formProjected.destroy();
        //     });
        //     this.getView().addDependent(this.formProjected);
        //     this.formProjected.open();
        // },

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
            console.log(projected_date);

            if (pDate === null || pDate == "") {
                // console.log("fechas vacias")
                MessageToast.show("No se pueden insertar fechas vacías", {
                    duration: 3000,
                    width: "20%"
                });
            } else {
                let projected_date = `${pDate.getFullYear()}-${pDate.getMonth() + 1}-${pDate.getDate()}`;
                if (projected_quantity === null || projected_quantity == "" || parseInt(projected_quantity) === 0 || parseInt(projected_quantity) < 0) {
                    // console.log("fechas vacias")
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

        onChangeCore: async function () {
            console.log(this.getView().getModel("mdprogrammed"));
            console.log(this.getView().getModel("mdprojected"));

            let mdcores = this.getModel("mdcores"),
                mdprogrammed = this.getModel("mdprogrammed"),
                selectedFarm = mdprogrammed.getProperty("/selectedFarm"),
                mdfarm = this.getModel("mdfarms"),
                selectedCore = sap.ui.getCore().byId("selectCore").getSelectedKey();
            console.log(selectedCore);
            // mdcores.setProperty("/selectedKey", selectedCore);
            console.log(mdcores.getProperty("/selectedKey"));
            console.log(mdfarm.getProperty("/selectedKey"));
            /*Llamar a la funcion del back que se va a traer los galpones que pertenecen al nucleo seleccionado*/
            console.log("llego");
            let findShed = await this.findShedByFarm(selectedCore),
                mdshed = this.getModel("mdshed");

            console.log(findShed);

            mdshed.setProperty("/records", findShed.data);
            mdshed.setProperty("/selectedKey", "");
            // sap.ui.getCore().byId("selectShed").setSelectedKey(findShed.data[0].shed_id)
            this.onChangeShed();
            // mdshed.setProperty("/selectedKey",findShed.data[0].shed_id)
            // var id = findShed.data[0].shed_id,
            //     array1 = findShed.data;
            // console.log(mdshed)
            // var found = array1.find(function(element) {
            //   return element.shed_id == id;
            // });
            // mdprogrammed.setProperty("/capmin", found.capmin);
            // mdprogrammed.setProperty("/capmax", found.capmax);
            sap.ui.getCore().byId("programmed_quantity").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
            // sap.ui.getCore().byId("selectShed").setSelectedItem(new item ());

        },
        onChangeShed: async function () {
            let mdshed = this.getModel("mdshed"),
                mdprogrammed = this.getModel("mdprogrammed"),
                selectedShed = sap.ui.getCore().byId("selectShed").getSelectedKey();
            mdshed.setProperty("/selectedKey", selectedShed);
            console.log(selectedShed);
            console.log(mdshed);
            sap.ui.getCore().byId("programmed_quantity").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
            let array1 = mdshed.getProperty("/records");

            var found = array1.find(function (element) {
                return element.shed_id == selectedShed;
            });
            console.log("my found-----> ", found);
            // mdprogrammed.setProperty("/confirmBtn", true);
            if (found === undefined || found === null) {
                mdprogrammed.setProperty("/capmin2", "");
                mdprogrammed.setProperty("/capmax2", "");
            } else {
                mdprogrammed.setProperty("/capmin2", parseInt(found.capmin));
                mdprogrammed.setProperty("/capmax2", parseInt(found.capmax));
            }
            console.log(found.capmin);
            console.log(found.capmax);
        },

        onChangeFarm: async function () {
            let mdfarm = this.getModel("mdfarms"),
                mdprogrammed = this.getModel("mdprogrammed"),
                selectedFarm = sap.ui.getCore().byId("selectFarm").getSelectedKey();

            mdfarm.setProperty("/selectedKey", selectedFarm);

            let findShed = await this.findCenterByFarm(selectedFarm),
                mdcores = this.getModel("mdcores");

            mdcores.setProperty("/records", findShed.data); /* Mover a findcenterbyfarm */
            var tmp = mdcores.getProperty("/records")[0].center_id;
            console.log(tmp);
            // mdcores.setProperty("/selectedKey", tmp);

            console.log(mdcores.getProperty("/selectedKey"));
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

            console.log(partnership_id);
            console.log(selectedFarm);

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
        },
        findShedByFarm: function (selectedFarm) {
            let util = this.getModel("util"),
                mdshed = this.getModel("mdshed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            console.log("el parametro recibido");
            console.log(selectedFarm);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findShedByCenter");
            // console.log(serverName)
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
                                console.log("respuesta recibida en la busqueda de galpones");
                                console.log(res);

                                console.log("sheds:: ", res.data);
                                res.data = res.data.filter(function (item) {
                                    return item.statusshed_id == 1 || item.rehousing === true;
                                });
                                console.log("sheds filter:: ", res.data);


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
            this.formProgrammed.close();
            this.formProgrammed.destroy();
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

            console.log(data);

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
                        console.log("Mi total:", total, "Mi projected quantity", projected_quantity, "Mi residue:", res.residue);
                        mdprogrammed.setProperty("/programmed_residue", total);
                        console.log(mdprogrammed);
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
            console.log(serverName);
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
                                //console.log(data);
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
                    console.log(mdbreed);
                }
            });
        },

        onFarmLoad: function () {
            console.log(this.getView().getModel("ospartnership"));
            const util = this.getModel("util"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findFarmByPartAndStatus"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/selectedRecord/").partnership_id;
            console.log(serverName);
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
                    console.log(osfarm);
                }
            });
        },
        // onSaveExecution: function(oEvent){
        //   let that = this
        //   var dialog = new Dialog({
        //     title: 'Información',
        //     type: 'Message',
        //     state: 'Success',
        //     content: new Text({
        //       text: '¿Desea Guardar los cambios?.'
        //     }),
        //     beginButton: new Button({
        //       text: 'Aceptar',
        //       press: function() {
        //         that.onDialogPressEx();
        //         dialog.close();
        //       }
        //     }),
        //     endButton: new Button({
        //       text: 'Cancelar',
        //       press: function() {
        //         dialog.close();
        //       }
        //     }),
        //     afterClose: function() {
        //       dialog.destroy();
        //     }
        //   });

        //   dialog.open();
        // },
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
            console.log(mdexecuted);
            console.log(mdprogrammed);

            let housing_way_id = mdexecuted.getProperty("/selectedRecord/housing_way_id");
            console.log("housing_way_id: ", housing_way_id);
            let records_executed = [],
                isValidRecord = true;

            console.log("execution_quantiy", execution_quantity);

            console.log("el modelo shed en validacion");
            console.log(mdshed);

            console.log("el modelo mdprogrammed en validacion");
            console.log(mdprogrammed);

            console.log(aRecords);

            aRecords.forEach(item => {
                console.log("el item");
                console.log(item.available);
                console.log(item.capmax);
                console.log(farm_id, center_id, shed_id);
                // if ((item.available == true)) {

                if ((item.execution_date) && (parseInt(execution_quantity)) /*&& (item.sales_quantity)*/) {
                    item.executionfarm_id = farm_id;
                    item.execution_quantity = execution_quantity;
                    item.executioncenter_id = center_id;
                    item.executionshed_id = shed_id;
                    console.log("No es null los valores son: ", item.execution_date, item.execution_quantity);
                    records_executed.push(item);
                }

                if ((!item.execution_date) && (execution_quantity)) {
                    console.log("execution_date null");
                    item.state_date = "Error";
                    item.state_text_date = "El campo fecha no puede estar en blanco";
                    isValidRecord = false;
                } else {
                    item.state_date = "None";
                    item.state_text_date = "";
                }

                if ((item.execution_date) && (!execution_quantity)) {
                    console.log("execution_date null");
                    item.state_quantity = "Error";
                    item.state_text_quantity = "El campo cantidad no puede estar en blanco";
                    isValidRecord = false;
                } else {
                    item.state_quantity = "None";
                    item.state_text_quantity = "";
                }

                // if ((item.execution_date) && (execution_quantity > parseInt(item.capmax))) {
                //   console.log("execution_date null");
                //   item.state_quantity = 'Error';
                //   item.state_text_quantity = 'El campo cantidad supera la capacidad del galpon';
                //   isValidRecord = true;
                // } else {
                //     item.state_quantity = 'None';
                //     item.state_text_quantity = '';
                // }


                console.log(item);


                // }
            });

            mdexecuted.refresh(true);
            console.log(aRecords);
            console.log(records_executed);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/housingwaydetail");
            console.log(serverName);
            console.log(records_executed.lenght + " " + isValidRecord);
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
                                            console.log(mdprogrammed.getProperty("/selectedRecordPath/"));
                                            mdprogrammed.setProperty(mdprogrammed.getProperty("/selectedRecordPath/") + "/isexecuted", true);
                                            mdprogrammed.refresh(true);
                                            console.log(mdprogrammed);
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
                                            console.log(dialog);

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
            //serverName = "/housingwaydetail/deleteHousingWayDetail"
            console.log("ruta");
            console.log(serverName);
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

                        console.log(records);
                        console.log("res:", res.residue);
                        let residue_programmed = res.residue,
                            projected_quantity = mdprogrammed.getProperty("/selectedRecord/projected_quantity"),
                            total = projected_quantity - residue_programmed;
                        mdprogrammed.setProperty("/programmed_residue", total);

                        if (records.length > 0) {
                            mdprogrammed.setProperty("/executionSaveBtn", true);
                            console.log(records);
                            console.log(mdprogrammed);
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

            console.log("value:" + value);

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

            console.log(mdprogrammed);

            // value= parseInt(value);

            // debugger;
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
            console.log("input");
            console.log(input);
            let length = 10;
            let value = input.getValue();
            console.log("valor: " + value);
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                console.log("entro if");
                return true;
            }
            else {
                console.log("entro else");
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

                console.log("el valor es: " + value);


                let mdshed = this.getModel("mdshed");

                console.log("el modelo shed en validacion");
                console.log(mdshed);


                // let selectedShed = sap.ui.getCore().byId("selectShed").getSelectedKey();
                // // mdshed.setProperty("/selectedKey", selectedShed);
                // console.log("el codigo del galpon seleccionado")
                // console.log(selectedShed);

                let mdprogrammed = this.getModel("mdprogrammed");
                console.log("le mdprogrammed");
                console.log(mdprogrammed);

                let array1 = mdshed.getProperty("/records");

                console.log("el array");
                console.log(array1);

                // var found = array1.find(function(element) {
                //   return element.shed_id == selectedShed;
                // });

                // console.log("el found")
                // console.log(found.capmax);


                let scheduled_quantity = parseInt(sap.ui.getCore().byId("programmed_quantity").getValue()),
                    programmed_residue = mdprogrammed.getProperty("/programmed_residue");
                console.log(scheduled_quantity, " -- ", programmed_residue);

                if (parseInt(value) <= programmed_residue && parseInt(value) <= parseInt(found.capmax)) {
                    mdprogrammed.setProperty("/name/state", "None");
                    mdprogrammed.setProperty("/name/stateText", "");
                    mdprogrammed.setProperty("/confirmBtn", true);

                } else {
                    // if (parseInt(value) > programmed_residue) {
                    //   mdprogrammed.setProperty("/name/state", "Error");
                    //   mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera al saldo");
                    //   mdprogrammed.setProperty("/confirmBtn", false);
                    // }
                    if (parseInt(value) > found.capmax) {
                        mdprogrammed.setProperty("/name/state", "Error");
                        mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera la capacidad del galpon");
                    }
                    // if (value == '') {
                    //   mdprogrammed.setProperty("/name/state", "Error");
                    //   mdprogrammed.setProperty("/name/stateText", "La cantidad programada no debe estar vacia");
                    // }
                }
                return false;
            }
        },

        reloadProgrammed: function (housingway_detail, mdprogrammed) {
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
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                            return;
                        }

                        response.json().then(function (res) {
                            console.log(res.data);
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



            // console.log("El housing way: ",housing_way_id)
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
                                                console.log(data);
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

                                            }
                                            else {
                                                console.log("no hubo");
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

        onPress: function () {
            console.log("presiono")
            let optimizado = this.getModel("optimizado")

            // let escenario = this.getView().byId("selectescenario").mProperties.value,
            //     breed = this.getView().byId("SelectBreed").mProperties.value,
            let escenario = this.getView().byId("selectescenario").getSelectedKey(),
                breed = this.getView().byId("SelectBreed").getSelectedKey(),
                stage = this.getView().byId("stageSelect").getSelectedKey(),
                date = this.getView().byId("date_opt").mProperties.value,
                partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/").partnership_id;
                console.log(partnership_id)
                console.log(escenario)
                console.log(breed)
                console.log(stage)
                console.log(date)

                let nobj = {
                    partnership_id: partnership_id,
                    escenario: escenario,
                    breed: breed,
                    stage: stage,
                    date: date
                }
                let old = optimizado.getProperty("/dates")

                console.log(nobj)
                console.log(old)
                console.log(JSON.stringify(nobj) === JSON.stringify(old))


                if (date === null || date == "" || escenario === null || escenario == ""|| breed === null || breed == ""|| stage === null || stage == "") {
                    // console.log("fechas vacias")
                    optimizado.setProperty("/records", []);
                    MessageToast.show("Debe completar todos los campos", {
                        duration: 3000,
                        width: "20%"
                    });
                }
                else{
                    if (JSON.stringify(nobj) === JSON.stringify(old)) {
                        MessageBox.error("No existe variaciones en los parámetros de entrada",{title: "Error",actions: ["Cerrar"],
                        emphasizedAction: MessageBox.Action.CLOSE});
                    }
                    else{
                        optimizado.setProperty("/stage", stage);
                        let farm
                        switch (parseInt(stage)) {
                            case 1:
                                farm = 2
                                break;
                            case 3:
                                farm = 1
                                break;
                            case 5:
                                farm = 3
                                break;
                        
                            default:
                                break;
                        }
                        console.log(farm)
                        optimizado.setProperty("/busy", true);
                        optimizado.setProperty("/blockButton", false);
                        fetch("/shed/automatedScheduling", {
                            headers: {
                                "Content-Type": "application/json"
                            },
                            method: "POST",
                            body:JSON.stringify({
                                partnership_id: partnership_id,
                                stage: parseInt(stage),
                                farm_type: farm,
                                breed_id: parseInt(breed),
                                scenario_id: parseInt(escenario),
                                date: date
                            })
                        })
                        .then(
                            function (response) {
                                // optimizado.setProperty("/records", res.records);
                                optimizado.setProperty("/busy", false);
                                optimizado.setProperty("/dates", nobj);
                                optimizado.setProperty("/blockButton", true);
                                if (response.status !== 200) {

                                    if (response.status === 201) {
                                        console.log("en el 201")
                                        MessageBox.error("No se encontr\u00F3 soluci\u00F3n factible, verifique los par\u00E1metros de cofiguraci\u00F3n o modifique la fecha seleccionada",{title: "Error",actions: ["Cerrar"],
                                        emphasizedAction: MessageBox.Action.CLOSE});
                                    }

                                    // console.log("Looks like there was a problem. Status Code: " +
                                    //     response.status);
                                    return;
                                }
        
                            
                                if (response.status === 200) {
                                    response.json().then(function (res) {
                                        console.log(res);
                                        optimizado.setProperty("/records", res.records);
        
                                    });
                                }
        
                            }
                        )
                        .catch(function (err) {
                            console.log("Fetch Error :-S", err);
                        });
                    }
                    
                }



        },
        onPressDetProg: function (oEvent) {
            let that = this,
                path = oEvent.getSource().oPropagatedProperties.oBindingContexts.mdprogrammed.sPath;
            console.log("path: ", path);
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
                shed_id = selectedItem.shed_id;

            console.log(selectedItem);
            console.log(mdprogrammed);


            fetch("/housingWayDetail/updateDisabledHousingWayDetail", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "PUT",
                body: JSON.stringify({
                    housing_way_id: housing_way_id,
                    housingway_detail_id: id,
                    shed_id: shed_id
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
                                // var fi= records.filter(function(item){
                                //   return item.disable!==true;
                                // });
                                mdprogrammed.setProperty("/records", records);
                                let residue_programmed = res.residue,
                                    projected = mdprogrammed.getProperty("/selectedRecords/"),
                                    projected_quantity = 0;

                                projected.forEach(element => {
                                    projected_quantity = parseInt(projected_quantity) + parseInt(element.projected_quantity);
                                });
                                let total = parseInt(projected_quantity) - parseInt(residue_programmed);
                                console.log("Mi total: ", total, "Mi projected quantity", projected_quantity, "Mi residue:", res.residue);
                                mdprogrammed.setProperty("/programmed_residue", total);
                                console.log(mdprogrammed);
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
                                            let records = res.data;
                                            records.forEach(element => {
                                                if (element.execution_quantity && element.execution_date) {
                                                    element.isexecuted = true;
                                                } else {
                                                    element.isexecuted = false;
                                                }

                                            });
                                            // var fi= records.filter(function(item){
                                            //   return item.disable!==true;
                                            // });
                                            mdprogrammed.setProperty("/records", records);
                                            let residue_programmed = res.residue,
                                                projected = mdprogrammed.getProperty("/selectedRecords/"),
                                                projected_quantity = 0;

                                            projected.forEach(element => {
                                                projected_quantity = parseInt(projected_quantity) + parseInt(element.projected_quantity);
                                            });
                                            let total = parseInt(projected_quantity) - parseInt(residue_programmed);
                                            console.log("Mi total: ", total, "Mi projected quantity", projected_quantity, "Mi residue:", res.residue);
                                            mdprogrammed.setProperty("/programmed_residue", total);
                                            console.log(mdprogrammed);
                                            mdprogrammed.refresh(true);

                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
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
            console.log({
                lot: this.getView().byId("numberL").getValue(),
                stage: "C",
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
                        console.log(res)
                        that.getModel("mdprojected").setProperty("/adjustmenttable", res.data)
                        if(res.data.length>0){
                            console.log("2")
                            mdprojected.setProperty("/visibleInfo", ((res.data[0].adjustment_date !== undefined && res.data[0].adjustment_date !== null) && (res.data[0].username !== undefined && res.data[0].username !== null)));
                            mdprojected.setProperty("/visibleOtherButtons",true)
                        }else{
                            console.log("1")
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



    });
});
