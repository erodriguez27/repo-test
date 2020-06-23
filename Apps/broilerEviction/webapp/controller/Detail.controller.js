sap.ui.define([
    "broilerEviction/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function (BaseController, jQuery, Filter, Fragment, JSONModel, MessageToast, Dialog, Button, Text) {
    "use strict";
    const breedingStage = 1; /*Etapa para Engorde*/
    const farm_type = 2;
    return BaseController.extend("broilerEviction.controller.Detail", {

        onInit: function () {
            this.setFragments();
            this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        },
        onChangeSelectProduct: function (event) {
            var key = event.getSource().getSelectedItem().getKey();
            let mdprogrammed = this.getModel("mdprogrammed");
            // mdprogrammed>/programmed_date
            let vector = mdprogrammed.getProperty("/product/records");
            console.log(vector);
            let evic = 0;
            let i = -1;
            do {
                i++;
                if (key == vector[i].broiler_product_id)
                    evic = vector[i].days_eviction;
            } while (key != vector[i].broiler_product_id);
            console.log("dias???:");
            console.log(this.sumaDias(evic));
            let pDate = this.sumaDias(evic)
            let aDate = pDate.split("/"),
                pSelDate = new Date(aDate[2], aDate[1] - 1, aDate[0]);
            mdprogrammed.setProperty("/focus_date", pSelDate);
            mdprogrammed.setProperty("/programmed_date", pDate);
            let projected = mdprogrammed.getProperty("/selectedRecord/projected_date").split("/"),
                proDate = new Date(projected[2], projected[1] - 1, projected[0]);
            let minDate = new Date(this.addDays(proDate, 30));
            console.log("la minDate:::", proDate, minDate)
            mdprogrammed.setProperty("/minDate", minDate);

        },

        _onRouteMatched: function (oEvent) {
            var oArguments = oEvent.getParameter("arguments");

            this.cleanTablesAndControls();
            this.dialogProjected = sap.ui.xmlfragment("broilerEviction.view.projected.projectedDialog", this)
            this.getView().addDependent(this.dialogProjected);
            this.index = oArguments.id;

            let oView = this.getView();
            let ospartnership = this.getModel("ospartnership");
            oView.byId("tabBar").setSelectedKey("tabParameter");
            oView.byId("tableBreed").addEventDelegate({
                onAfterRendering: oEvent => {
                    console.log("victor te amo!");
                }
            });







            if (ospartnership.getProperty("/records").length > 0) {
                let partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id");
                this.onRead(partnership_id);
            }
            else {
                this.reloadPartnership()
                    .then(data => {
                        if (data.length > 0) {
                            let obj = ospartnership.getProperty("/selectedRecords/");
                            if (obj) {
                                this.onRead(obj.partnership_id);
                            }
                            else {
                                MessageToast.show("no existen empresas cargadas en el sistema", {
                                    duration: 3000,
                                    width: "20%"
                                });
                                console.log("err: ", data);
                            }
                        }
                        else {
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
                this.getView().byId("age").setValue("");
                this.getView().byId("age2").setValue("");

                this.getView().byId("breedSelect2").setSelectedKey(null);
                this.getView().byId("sd").setValue("");
                this.getView().byId("sd2").setValue("");

                this.getView().byId("numberL").setValue("");
        },

        showProjectedProduct: async function (oEvent) {
            const mdprojected = this.getView().getModel('mdprojected')
            const object = oEvent.getSource().getBindingContext('mdprojected').getObject()
            const mdprogrammed = this.getModel("mdprogrammed")
            const link = oEvent.getSource()
            let that = this;

            console.log(object)

            if (object.broilereviction_id !== '-' && object.broilereviction_id !== '') {

                const result = await fetch('/broilereviction/findBroilerEvictionFarmAndProduct', {
                    headers: {
                        'Content-type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        broilereviction_id: object.broilereviction_id
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
                                console.log("data popover::::: ", res.data)

                                mdprojected.setProperty('/dataPopover', res.data)
                                console.log(mdprojected.getProperty('/dataPopover'))
                                console.log(mdprojected)
                                mdprojected.refresh(true)
                                that.dialogProjected.openBy(link)
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });


            }
        }, showProjectedProductList: async function (oEvent) {

            const mdprojected = this.getView().getModel('mdprojected')
            const mdprogrammed = this.getModel("mdprogrammed")
            const link = oEvent.getSource()
            let sRecord = mdprogrammed.getProperty("/selectedRecord")
            let that = this;

            const result = await fetch('/broilereviction/findBroilerEvictionFarmAndProduct', {
                headers: {
                    'Content-type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    broilereviction_id: sRecord.broilereviction_id
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
                            console.log("data popover::::: ", res.data)

                            mdprojected.setProperty('/dataPopover', res.data)
                            console.log(mdprojected)
                            mdprojected.refresh(true)
                            that.dialogProjected.openBy(link)
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });



        },

        reloadPartnership: function () {
            let util = this.getModel("util");
            let that = this;
            let ospartnership = this.getModel("ospartnership");

            util.setProperty("/busy/", true);
            ospartnership.setProperty("/records", []);

            let url = "/partnership/findPartnershipByFarmType"
            let method = "POST";
            let data = { farm_type: farm_type };
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


        onRead: async function (index) {
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
            //mdprojected.setProperty("/records", findScenario.data);
            that.hideButtons(false, false, false, false);
            this.onFarmLoad();
        },



        findExecuted: function () {
            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdprojected = this.getView().getModel("mdprojected"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                hwid = mdexecuted.getProperty("/selectedRecord/broilereviction_detail_id");
            console.log(hwid);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findHousingWayDetByHwdId");
            console.log(serverName);
            /* /broilerEvictionDetail/findBroilerEvictionDetailById */
            return new Promise((resolve, reject) => {
                fetch("/broilerEvictionDetail/findBroilerEvictionDetailById", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: "broilereviction_detail_id=" + mdexecuted.getProperty("/selectedRecord/broilereviction_detail_id")
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
                                    console.log("isnotexecuted");
                                    mdexecuted.setProperty("/isnotexecuted", true);
                                    mdexecuted.setProperty("/isexecuted", false);
                                    console.log(mdexecuted);
                                } else {
                                    console.log("isexecuted");
                                    mdexecuted.setProperty("/isnotexecuted", false);
                                    mdexecuted.setProperty("/isexecuted", true);
                                }
                                mdexecuted.setProperty("/slaughterhouse", records[0].slaughterhouse);
                                console.log(mdexecuted);
                                that.hideButtons(false, false, true, false);

                                console.log(records);
                                if (records[0].executionslaughterhouse_id != null) {
                                    mdexecuted.setProperty("/slaughterhouse/selectedKey", records[0].executionslaughterhouse_id);
                                } else {
                                    mdexecuted.setProperty("/slaughterhouse/selectedKey", records[0].slaughterhouse_id);
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

                                }
                                util.setProperty("/busy/", true);
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            });

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
            console.log(mdexecuted);
            mdexecuted.setProperty("/rExecuted/enabledTab", true);

            oView.byId("tabBar").setSelectedKey("ktabExecuted");

            let findExecuted = await this.findExecuted();
            console.log(this.getView().getModel("mdfarms"));
            console.log(this.getView().byId("selectFarm"));
            console.log(mdexecuted);
            mdprogrammed.setProperty("/programmedsaveBtn", false);
            let records = mdexecuted.getProperty("/records");
            if (records.length > 0) {
                console.log(">0");
                mdexecuted.setProperty("/executionSaveBtn", true);
            }
            console.log(records[0].slaughterhouse_id);

            mdexecuted.setProperty("/slaughterhouse/selectedKey", records[0].slaughterhouse_id);
            console.log(mdexecuted);
            // if(records[0].executedfarm_id){
            //   console.log("executed farm id", records[0].executedfarm_id)

            //   mdfarms.setProperty("/selectedKey",records[0].executedfarm_id)

            // }else{
            //   console.log("farm id", records[0].farm_id)
            //   mdfarms.setProperty("/selectedKey",records[0].farm_id)
            // }
            console.log(mdfarms);
            console.log(records);
            //this.onChangeFarmE()
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

        onChangeCenterE: async function () {
            let mdcenter = this.getView().getModel("mdcenter"),
                mdshed = this.getView().getModel("mdshed"),
                mdexecuted = this.getModel("mdexecuted"),
                center_id = mdcenter.getProperty("/selectedKey");
            console.log(center_id);
            let findShed = await this.findShedByCenterForExecution(center_id);
            console.log(findShed);
            mdshed.setProperty("/records", findShed.data);
            // mdshed.setProperty("/selectedKey",mdexecuted.getProperty("/selectedRecord/shed_id"))
            console.log(mdshed);
            // this.getView().byId("execution_quantityE").setValue('')
            // mdexecuted.setProperty("/execution_quantity",'');
            mdexecuted.setProperty("/name/state", "None");
            mdexecuted.setProperty("/name/stateText", "");
            mdexecuted.setProperty("/confirmBtn", false);
            mdexecuted.setProperty("/addBtn", false);

            //Pendiente: Crear funcion para manejar el cambio del nucleo y de los galpones



            // console.log(sap.ui.getCore().byId("selectFarm"))
        },


        findShedByCenterForExecution: function (selectedFarm) { /* En caso que se pida mostrar todos los galpones en la pantalla de ejecucion */
            let util = this.getModel("util"),
                mdexecuted = this.getModel("mdexecuted"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            console.log(selectedFarm);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findShedsByFarm");
            console.log(serverName);
            return new Promise((resolve, reject) => {
                fetch("/shed/findShedByCenter", {
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
                                res.data = res.data.filter(function (item) {
                                    return item.statusshed_id === 1 || mdexecuted.getProperty("/selectedRecord").shed_id === item.shed_id || mdexecuted.getProperty("/selectedRecord").executedshed_id === item.shed_id;
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


        onChangeFarmE: async function () {
            let mdfarms = this.getView().getModel("mdfarms"),
                mdcenter = this.getView().getModel("mdcenter"),
                mdexecuted = this.getView().getModel("mdexecuted"),
                farm_id = mdfarms.getProperty("/selectedKey");
            console.log(mdfarms);
            let findCenter = await this.findCenterByFarm(farm_id);
            console.log(mdcenter);
            mdcenter.setProperty("/records", findCenter.data);
            mdcenter.setProperty("/selectedKey", findCenter.data[0].center_id);

            console.log(mdcenter);
            this.onChangeCenterE();
            if (mdexecuted.getProperty("/records")[0].available) {
                // console.log(this.getView().byId("execution_quantityE"))
                // this.getView().byId("execution_quantityE").setValue('')
                // mdexecuted.setProperty("/execution_quantity",'');
                mdexecuted.setProperty("/name/state", "None");
                mdexecuted.setProperty("/name/stateText", "");
                mdexecuted.setProperty("/confirmBtn", false);
                mdexecuted.setProperty("/addBtn", false);
            }
            //Pendiente: Crear funcion para manejar el cambio del nucleo y de los galpones



            // console.log(sap.ui.getCore().byId("selectFarm"))
        },

        findCenterByFarm: function (selectedFarm) {
            let util = this.getModel("util"),
                mdshed = this.getModel("mdshed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            console.log(partnership_id);
            return new Promise((resolve, reject) => {
                fetch("/center/findCenterByFarm", {
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
                                console.log("respuesta recibida en la busqueda de galpones");
                                console.log(res);

                                console.log("sheds:: ", res.data);
                                resolve(res);
                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            });
        },


        findShedByCenter: function (selectedFarm) {
            let util = this.getModel("util"),
                mdshed = this.getModel("mdshed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            console.log(selectedFarm);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findShedByCenter");
            // console.log(serverName)
            return new Promise((resolve, reject) => {
                fetch("/shed/findShedByCenter", {
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
                                    return item.statusshed_id == 1;
                                });
                                console.log("sheds filter:: ", res.data);


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
            // console.log(this.getView().byId("execution_quantityE"))
            // this.getView().byId("execution_quantityE").setValue('')
            // mdexecuted.setProperty("/execution_quantity",'');
            mdexecuted.setProperty("/name/state", "None");
            mdexecuted.setProperty("/name/stateText", "");
            mdexecuted.setProperty("/confirmBtn", false);
            mdexecuted.setProperty("/addBtn", false);
            console.log(mdexecuted);
            console.log(mdshed);
            mdexecuted.refresh();

        },

        onValidExecutedQuantity: function (o) {
            let input = o.getSource();
            let length = 10;
            let mdexecuted = this.getView().getModel("mdexecuted");
            let value = input.getValue();
            console.log("valor: " + value);
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                console.log("entro if");
                return true;
            } else {
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

                console.log("el valor es:" + value);
                mdexecuted.setProperty("/saveBtn", true); //parcheado por error del merge

                let /*mdexecuted = this.getView().getModel("mdexecuted"),*/programmedquantity = mdexecuted.getProperty("/selectedRecord").scheduled_quantity;

                console.log("el modelo shed en validación");
                console.log(mdexecuted, programmedquantity);

                let mdshed = this.getView().getModel("mdshed");
                let records = mdshed.getProperty("/records"),
                    myshed = records.filter(function (item) {
                        return mdshed.getProperty("/selectedKey") == item.shed_id;
                    });
                console.log(myshed);
                //console.log(value,programmedquantity,value,myshed[0].capmax)

                /*if(parseInt(value) <= parseInt(myshed[0].capmax) ){
        mdexecuted.setProperty("/name/state", "None");
        console.log("entro")
        mdexecuted.setProperty("/name/stateText", "");
        mdexecuted.setProperty("/saveBtn", true);
        console.log( mdexecuted.getProperty("/saveBtn"))

      }else{
        // if (parseInt(value) > programmedquantity) {
        //   mdexecuted.setProperty("/name/state", "Error");
        //   mdexecuted.setProperty("/name/stateText", "La cantidad ejecutada supera la programada");
        //   mdexecuted.setProperty("/saveBtn", false);
        // }
        console.log(value,myshed[0].capmax)
        if (parseInt(value) > parseInt(myshed[0].capmax)) {
          mdexecuted.setProperty("/name/state", "Error");
          mdexecuted.setProperty("/name/stateText", "La cantidad ejecutada supera la capacidad del galpon");
          // mdexecuted.setProperty("/saveBtn", false);
        }
        if (value == '') {
          mdexecuted.setProperty("/name/state", "Error");
          mdexecuted.setProperty("/name/stateText", "La cantidad ejecutada no debe estar vacia");
          mdexecuted.setProperty("/saveBtn", false);
        }
      }*/
                return false;
            }
        },

        onValidProgrammedQuantity: function (o) {
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
            let mdprogrammed = this.getModel("mdprogrammed");
            let programmed_residue = mdprogrammed.getProperty("/selectedRecord/residue");
            console.log("programmed_residue::::::::: ", programmed_residue);

            mdprogrammed.setProperty("/addBtn", true);
            // value= parseInt(value);

            // debugger;
            if (value === null || value === "") {//VALIDACION PARA ENTRADA NULA
                mdprogrammed.setProperty("/name/state", "None");
                mdprogrammed.setProperty("/name/stateText", "");
                mdprogrammed.setProperty("/addBtn", false);
            }
            else if (parseInt(value) === 0) {//VALIDACION PARA ENTRADA IGUAL A 0
                mdprogrammed.setProperty("/name/state", "Error");
                mdprogrammed.setProperty("/name/stateText", "La cantidad programada debe ser mayor a 0");
                mdprogrammed.setProperty("/addBtn", false);
            }
            else if (parseInt(value) > programmed_residue) {//VALIDACION PARA ENTRADA MAYOR AL RESIDUO
                mdprogrammed.setProperty("/name/state", "Error");
                mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera al saldo");

            }
            else {
                mdprogrammed.setProperty("/name/state", "None");
                mdprogrammed.setProperty("/name/stateText", "");
            }

        },















        reports: function () {
            var mdreports = this.getModel("mdreports");
            console.log("presione el boton de reportes");
            let datePick1 = this.getView().byId("sd"),
                date1 = datePick1.mProperties.value,
                datePick2 = this.getView().byId("sd2"),
                date2 = datePick2.mProperties.value,
                breedSelect = this.getView().byId("breedSelect2"),
                breed_id = breedSelect.getSelectedKey(),
                type_bird = "L",
                partnership_id = this.getView().getModel("ospartnership").getProperty("/selectedRecord/partnership_id"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                condDate = date1 === null || date1 == "" || date2 === null || date2 == "",
                condBreed = breed_id == null || breed_id == undefined || breed_id == "";

            let aDate = date1.split("-"),
                init_date = `${aDate[0]}/${aDate[1]}/${aDate[2]}`;

            let aDate2 = date2.split("-"),
                end_date = `${aDate2[0]}/${aDate2[1]}/${aDate2[2]}`;

            if (condDate && condBreed) {
                
                if(condDate){
                    if (date1 === undefined || date1 === "" || date1 === null) {
                        datePick1.setValueState("Error");
                        datePick1.setValueStateText("No se pueden consultar fechas vacías");
                    } else {
                        datePick1.setValueState("None");
                        datePick1.setValueStateText("");
                    }

                    if (date2 === undefined || date2 === "" || date2 === null) {
                        datePick2.setValueState("Error");
                        datePick2.setValueStateText("No se pueden consultar fechas vacías");
                    } else {
                        datePick2.setValueState("None");
                        datePick2.setValueStateText("");
                    }
    
                   
                }

                if(condBreed){
                    breedSelect.setValueState("Error");
                    breedSelect.setValueStateText("Seleccione una raza");
                }
            } else {
                console.log("las fechas");
                console.log(date1);
                console.log(date2);
                console.log(breed_id);
                console.log("EL MODELO CON FECHAS");
                console.log(mdreports);
                let serverName = "/reports/broilerEviction";

                fetch(serverName, {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        date1: date1,
                        date2: date2,
                        breed_id: breed_id,
                        scenario_id: scenario_id,
                        type_bird: type_bird,
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
                                console.log("la respuesta despues de reportes");
                                console.log(res);
                                mdreports.setProperty("/records", res.data);
                                console.log("la longitud");
                                console.log(res.data);
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
                    array = ["Fecha Programada", "Cantidad Programada", "Lote", "Raza", "Granja", "Núcleo", "Galpón", "Sexo", "Edad", "Fecha Ejecutada", "Cantidad Ejecutada", "Peso Kg/UND", "Peso Total (Kg)", "Variación Cantidad", "Variación Días"];
                } else {
                    array = ["Fecha Programada", "Cantidad Programada", "Lote", "Granja", "Núcleo", "Galpón", "Sexo", "Edad", "Fecha Ejecutada", "Cantidad Ejecutada", "Peso Kg/UND", "Peso Total (Kg)", "Variación Cantidad", "Variación Días"];
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






        onPress: async function () {
            console.log("se presiono el boton buscar");
            console.log("OnPress2");
            this.getView().byId("projectedTable").removeSelections();
            let that = this,
                mdprojected = this.getModel("mdprojected"),
                mdscenario = this.getModel("mdscenario"),
                mdprogrammed = this.getModel("mdprogrammed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                util = this.getModel("util"),
                scenario_id = mdscenario.getProperty("/scenario_id"),
                age_date = this.getView().byId("scheduled_date").mProperties.value,
                init_age = this.getView().byId("age").getValue(),
                end_age = this.getView().byId("age2").getValue(),
                breed_id = this.getView().byId("breedSelect").getSelectedKey();

            //const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findprojectedbroilereviction");
            const serverName = "/broilerEviction/findprojectedbroilereviction";
            // console.log("qloq1 " + scheduled_date);
            console.log("ages::: ", init_age, end_age, init_age !== NaN, end_age !== NaN, age_date)
            console.log("qloq2 " + util.getProperty("/service"));
            console.log("qloq3 " + util.getProperty("/" + util.getProperty("/service") + "/findprojectedbroilereviction"));
            if (init_age !== undefined && init_age !== "" && init_age !== "0" && init_age !== null && end_age !== undefined 
                && end_age !== "" && end_age !== "0" && end_age !== null && age_date !== undefined && age_date !== "" 
                && age_date !== "0" && age_date !== null && breed_id !== "" && breed_id !== null && breed_id !== undefined) {
                fetch(serverName, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scenario_id: scenario_id,
                        init_age: parseInt(init_age),
                        end_age: parseInt(end_age),
                        // _date: scheduled_date,
                        partnership_id: partnership_id,
                        breed_id: breed_id,
                        age_date: age_date
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
                                console.log("ressssssss:::::::", res.data);
                                console.log(res);
                                mdprojected.setProperty("/records", res.data);
                                mdprogrammed.setProperty("/product/records", res.product);
                                mdprogrammed.setProperty("/slaughterhouse", res.slaughterhouse);
                                console.log("aqui deberia salir slaughterhouse");
                                console.log(mdprogrammed);
                                mdprojected.refresh();
                                console.log("mdprojected en el boton buscar de proyectado");
                                console.log(mdprojected);
                                mdprogrammed.refresh();
                                console.log("modelo uwejyguaguybubfre");
                                console.log(mdprogrammed);

                            });
                        }
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });

            } else {
                if (init_age === undefined || init_age === "" || init_age === "0" || init_age === null) {
                    mdprojected.setProperty("/age/state", "Error");
                    mdprojected.setProperty("/age/stateText", "La edad debe ser mayor a cero (0)");
                    this.getView().byId("bProj").setEnabled(false);
                } else {
                    mdprojected.setProperty("/age/state", "None");
                    mdprojected.setProperty("/age/stateText", "");
                }
                if (end_age === undefined || end_age === "" || end_age === "0" || end_age === null) {
                    console.log("end_age", end_age)
                    mdprojected.setProperty("/age2/state", "Error");
                    mdprojected.setProperty("/age2/stateText", "La edad debe ser mayor a cero (0)");
                    this.getView().byId("bProj").setEnabled(false);
                } else {
                    mdprojected.setProperty("/age2/state", "None");
                    mdprojected.setProperty("/age2/stateText", "");
                }
                if (age_date === undefined || age_date === "" || age_date === "0" || age_date === null) {
                    mdprojected.setProperty("/age_date/state", "Error");
                    mdprojected.setProperty("/age_date/stateText", "Seleccione una fecha");
                    this.getView().byId("bProj").setEnabled(false);
                } else {
                    mdprojected.setProperty("/age_date/state", "None");
                    mdprojected.setProperty("/age_date/stateText", "");
                }
                if(breed_id === undefined || breed_id === "" || breed_id === null){
                    console.log("ASD")
                    mdprojected.setProperty("/breed/state", "Error");
                    mdprojected.setProperty("/breed/stateText", "Seleccione una raza");
                    this.getView().byId("bProj").setEnabled(false);

                }else{

                    mdprojected.setProperty("/breed/state", "None");
                    mdprojected.setProperty("/breed/stateText", "");

                }

            }

        },
        processInfo: function () {

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
        findProjected: function () {
            console.log("llego a findPRojected");
            let util = this.getModel("util"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
            console.log(partnership_id);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findHousingByStage");
            console.log(serverName);
            return new Promise((resolve, reject) => {
                fetch(serverName, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: "stage_id=" + breedingStage + "&partnership_id=" + partnership_id + "&scenario_id=" + scenario_id
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

        resetFilter: function (filter) {
            var mdprojected = this.getModel("mdprojected");
            var mdbreed = this.getModel("mdbreed");

            switch (filter) {
                case "breading":

                    mdprojected.setProperty("/val_lot","");
                    mdprojected.setProperty("/stateLot","None");
                    mdprojected.setProperty("/stateTextLot","");
                    
                    break;
                case "projected":

                    mdbreed.setProperty("/value",null);
                    mdprojected.setProperty("/breed/state","None");
                    mdprojected.setProperty("/breed/stateText","");

                    this.getView().byId("scheduled_date").setValue(null);
                    mdprojected.setProperty("/age_date/state","None");
                    mdprojected.setProperty("/age_date/stateText","");

                    this.getView().byId("age").setValue("");
                    mdprojected.setProperty("/age/state","None");
                    mdprojected.setProperty("/age/stateText","");

                    this.getView().byId("age2").setValue("");
                    mdprojected.setProperty("/age2/state","None");
                    mdprojected.setProperty("/age2/stateText","");

                    this.getView().byId("projectedTable").removeSelections();
                    this.getView().getModel("mdprojected").setProperty("/records", []);

                    this.getView().byId("bProj").setEnabled(true);

                    
                    break;

                case "reports":

                    mdbreed.setProperty("/value","Todas");

                    this.getView().byId("sd").setValue(null);
                    // mdprojected.setProperty("/age_date/state","None");
                    // mdprojected.setProperty("/age_date/stateText","");

                    this.getView().byId("sd2").setValue(null);
                    // mdprojected.setProperty("/age_date/state","None");
                    // mdprojected.setProperty("/age_date/stateText","");
                    
                    break;
            
            }

        },

        
        onTabSelection: async function (ev) {
            var mdprogrammed = this.getModel("mdprogrammed");
            var mdprojected = this.getModel("mdprojected");
            var mdexecuted = this.getModel("mdexecuted");
            var mdfarms = this.getModel("mdfarms");
            var mdbreed = this.getModel("mdbreed");
            let recordsB = mdbreed.getProperty("/records");
            let mdreports = this.getModel("mdreports");
            console.log("llego ***");
            //osfarm.setProperty("/saveBtn", false);
            var selectedKey = ev.getSource().getSelectedKey();
            // mdprojected.setProperty("/age2/state", "None");
            // mdprojected.setProperty("/age2/stateText", "");
            // mdprojected.setProperty("/age/state", "None");
            // mdprojected.setProperty("/age/stateText", "");
            console.log("asddd", selectedKey)
            mdprojected.setProperty("/visibleOtherButtons", false)

            if (selectedKey !== "kTabProjected") {
                this.getView().byId("projectedTable").removeSelections();
                this.getView().getModel("mdprojected").setProperty("/records", []);
            }

            if (selectedKey !== "ktabReports") {
                console.log("entre al reports y tengo", recordsB[0].breed_id)
                if (recordsB[0].breed_id === "Todas") {
                    recordsB.shift();
                    console.log(recordsB);
                    mdbreed.setProperty("/records", recordsB);
                    this.resetFilter("projected");
                }
                if (mdbreed.getProperty("/value") === "Todas") {
                    mdbreed.setProperty("/value", recordsB[0].breed_id);
                }

            }

            if (selectedKey === "kTabParameter") {
                console.log("entre parameters");
                this.resetFilter("projected");
                // this.getView().byId("projectedTable").removeSelections();
                // this.getView().getModel("mdprojected").setProperty("/records", []);
                // //mdbreed.setProperty("/value", recordsB[0].breed_id);
                // this.getView().byId("age").setValue("")
                // this.getView().byId("age2").setValue("")
                // this.getView().byId("scheduled_date").setValue("")
                this.getView().getModel("mdprogrammed").setProperty("/rProgrammed/enabledTab", false);
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab", false);
                //this.getView().byId("projectedTable").removeSelections();
                this.getView().byId("idtable2").removeSelections();
                this.getView().byId("idexecuted").removeSelections();
                this.hideButtons(false, false, false, false);
            }
            if (selectedKey === "kTabProjected") {
                console.log("entre projected");
                this.hideButtons(true, false, false, false);
                this.getView().byId("projectedTable").removeSelections();
                // this.getView().getModel("mdprojected").setProperty("/records",[]);
                this.getView().byId("idtable2").removeSelections();
                //esto podria eliminarse
                if (this.getView().byId("age").getValue() !== undefined && this.getView().byId("age").getValue() !== null 
                    && this.getView().byId("age").getValue() !== "" && this.getView().byId("age2").getValue() !== undefined 
                    && this.getView().byId("age2").getValue() !== null && this.getView().byId("age2").getValue() !== "" 
                    && this.getView().byId("breedSelect").getSelectedKey() !== "" && this.getView().byId("breedSelect").getSelectedKey() !== null) {
                    
                        console.log(this.getView().byId("age2").getValue(), this.getView().byId("age2").getValue())
                    this.getView().byId("bProj").firePress();
                }
                // let findScenario = await this.findProjected();
                // console.log("ya proyecté",findScenario)
                this.getView().getModel("mdprogrammed").setProperty("/records", []);

                this.getView().getModel("mdprogrammed").setProperty("/rProgrammed/enabledTab", false);
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab", false);

                // mdprojected.setProperty("/records", findScenario.data);

                this.getView().byId("idtable2").removeSelections();
                this.getView().byId("idexecuted").removeSelections();

            }
            if (selectedKey === "ktabProgrammed") {
                this.hideButtons(false, true, false, false);
                let records = mdprojected.getProperty("/records");
                this.getView().getModel("mdexecuted").setProperty("/records", []);

                // this.getView().getModel("mdfarms").setProperty("/records",[]);
                this.getView().getModel("mdfarms").setProperty("/selectedKey", "");

                // this.getView().getModel("mdcenter").setProperty("/records",[]);
                this.getView().getModel("mdcenter").setProperty("/selectedKey", "");

                // this.getView().getModel("mdshed").setProperty("/records",[]);
                this.getView().getModel("mdshed").setProperty("/selectedKey", "");

                this.getView().byId("idtable2").removeSelections();
                this.getView().byId("idexecuted").removeSelections();
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab", false);


                console.log(mdexecuted);

            }
            if (selectedKey === "ktabExecuted") {
                this.getView().byId("idexecuted").removeSelections();
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
                this.resetFilter("reports");
                this.resetFilter("projected");
                //pordria eliminarse
                // this.getView().byId("projectedTable").removeSelections();
                // this.getView().getModel("mdprojected").setProperty("/records", []);
                // this.getView().byId("age").setValue("")
                // this.getView().byId("age2").setValue("")
                // this.getView().byId("scheduled_date").setValue("")
                this.getView().byId("idtable2").removeSelections();
                this.getView().getModel("mdprogrammed").setProperty("/records", []);
                this.getView().byId("idexecuted").removeSelections();
                this.getView().getModel("mdexecuted").setProperty("/records", []);
                this.getView().getModel("mdprogrammed").setProperty("/rProgrammed/enabledTab", false);
                this.getView().getModel("mdexecuted").setProperty("/rExecuted/enabledTab", false);
                recordsB.unshift({ breed_id: "Todas", name: "Todas" });
                mdbreed.setProperty("/records", recordsB);
                mdbreed.setProperty("/value", "Todas");
                var lo = mdreports.getProperty("/records");
                console.log("LA LONGITUD");
                console.log(lo.length);
                if (lo.length == 0) {
                    this.hideButtons(false, false, false, false);
                }
                else {
                    this.hideButtons(false, false, false, true);
                }

            }

            if (selectedKey === "tabAdjust") {
                // console.log("here i am, rock you like a hurricane");
                this.resetFilter("breading");
                mdreports.setProperty("/records", []);
                this.getModel("mdprojected").setProperty("/adjustmenttable", {})
                mdprojected.setProperty("/visibleOtherButtons", false)

                this.hideButtons(false, false, false, false);



            }

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


        onSelectProgrammedRecord: async function (oEvent) {
            console.log("entro en la programacion de desalojo con lo seleccionado");
            var tabla = this.getView().byId("idtable2");
            // var itemsrows = tabla.mAggregations.items.length;

            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getView().getModel("mdprogrammed"),
                mdprojected = this.getView().getModel("mdprojected"),
                oView = this.getView(),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            // console.log(itemsrows);

            console.log("modelo que quiero ver");
            console.log(mdprogrammed);
            // let broilereviction_id = this.getModel("mdprogrammed").getProperty("/selectedRecord/broilereviction_id");

            // this.hideButtons(false, true, false, false);


            //guarda la ruta del registro proyectado que fue seleccionado
            mdprogrammed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            console.log("lo que voy a poner en el selected records");
            console.log(mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
            let broilereviction_id = mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath") + "/broilereviction_id");
            let gender = mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath") + "/gender");
            let shed_code = mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath") + "/shed_code");
            console.log("el id");
            console.log(broilereviction_id);
            mdprogrammed.setProperty("/selectedRecord/", mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
            console.log(mdprojected);
            console.log(mdprogrammed.getProperty("/selectedRecord"));
            console.log("lo que quiero ver");
            console.log(mdprogrammed);


            mdprojected.setProperty("/shed_id", shed_code);

            let pDate = mdprogrammed.getProperty("/selectedRecord/projected_date"),
                aDate = pDate.split("/"),
                minDate = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                date2 = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                maxDate = this.addDays(date2, 7);
            mdprogrammed.setProperty("/selectedRecord/minDate/", minDate);
            mdprogrammed.setProperty("/selectedRecord/maxDate/", maxDate);

            //guarda la ruta del registro proyectado que fue seleccionado
            mdprogrammed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            mdprogrammed.setProperty("/selectedRecord/", mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));
            console.log(mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath/")));

            //habilita el tab de la tabla de registros programado
            mdprogrammed.setProperty("/rProgrammed/enabledTab", true);

            oView.byId("tabBar").setSelectedKey("ktabProgrammed");

            //  this.hideButtons(false, true, true);
            mdprojected.setProperty("/projectedSaveBtn", false);
            mdprogrammed.setProperty("/programmedsaveBtn", true);
            console.log("el md programed en la seleccion");
            console.log(mdprogrammed);
            //Buscar los lotes que se pueden asignar
            let lots = await this.loadLot(pDate),
                breed_id = this.getModel("mdprogrammed").getProperty("/selectedRecord/breed_id");



            //Buscar los registros de broiler_detail

            //const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBroilerEvictionDetail");

            const serverName = "/broilerEvictionDetail/findBroilerEvictionDetail";
            console.log(aDate + " " + partnership_id + " " + scenario_id);


            fetch(serverName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scenario_id: scenario_id,
                    _date: aDate[2] + "-" + aDate[1] + "-" + aDate[0],
                    partnership_id: partnership_id,
                    breed_id: breed_id,
                    broilereviction_id: broilereviction_id,
                    gender : gender
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
                            records.forEach(element => {
                                if (element.executionslaughterhouse_id && element.execution_quantity && element.execution_date) {
                                    element.isexecuted = true;
                                } else {
                                    element.isexecuted = false;
                                }

                            });
                            console.log("AQUIIII: ", res);
                            mdprogrammed.setProperty("/records", records);
                            mdprogrammed.setProperty("/product/records", res.product);


                            if (records.length > 0) {
                                mdprogrammed.setProperty("/executionSaveBtn", true);
                            } else {
                                mdprogrammed.setProperty("/executionSaveBtn", false);
                            }
                            if (mdprojected.getProperty(mdprogrammed.getProperty("/selectedRecordPath") + "/evictionprojected") == false) {
                                that.hideButtons(false, true, false, false);
                            } else {
                                that.hideButtons(false, false, false, false);
                            }
                            util.setProperty("/busy/", true);
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });

            this.showProjectedProductList(oEvent)
            console.log("Salida  ", mdprogrammed.getProperty("/dataPopover"))
        },
        loadLot: function (pdate) {
            let util = this.getModel("util"),
                mdprogrammed = this.getModel("mdprogrammed"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                breed_id = this.getModel("mdprogrammed").getProperty("/selectedRecord/breed_id");

            mdprogrammed.setProperty("/selectedRecord/projected_quantity", parseInt(mdprogrammed.getProperty("/selectedRecord/projected_quantity")));
            /*const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBroilerLot");

      console.log(util.getProperty("/serviceUrl"));
      console.log(util.getProperty("/service"));

      console.log( util.getProperty("/" + util.getProperty("/service") + "/findBroilerLot"));
      //const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBroilerEvictionLot");
*/

            const serverName = "/broilerEviction/findBroilerEvictionLot";
            console.log("esta es la ruta");
            console.log(serverName);

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
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                            return;
                        }

                        response.json().then(function (res) {
                            let records = res.data;
                            mdprogrammed.setProperty("/selectedRecord/lot", records);
                            mdprogrammed.setProperty("/selectedRecord/lot_assigned", []);
                            mdprogrammed.setProperty("/selectedRecord/residue", mdprogrammed.getProperty("/selectedRecord/projected_quantity"));
                            console.log(records);
                            console.log(mdprogrammed.getProperty("/selectedRecord"));
                            util.setProperty("/busy/", true);
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },



        sumaDias: function (dias) {
            let mdprogrammed = this.getView().getModel("mdprogrammed");
            let pDate = mdprogrammed.getProperty("/selectedRecord/projected_date"),
                aDate = pDate.split("/"),
                minDate = new Date(aDate[2], aDate[1] - 1, aDate[0]);

            console.log("fecha adate: " + aDate);
            console.log("tomada: " + minDate);

            let suma = 20;

            let minDate1 = new Date(this.addDays(minDate, dias));
            console.log("sumada: " + minDate1);

            console.log("sumada " + (minDate1.getDate()) + "/" + (minDate1.getMonth() + 1) + "/" + minDate1.getFullYear());

            let fechaDesalojo = "" + (minDate1.getDate()) + "/" + (minDate1.getMonth() + 1) + "/" + minDate1.getFullYear();

            console.log("lista " + fechaDesalojo);

            return (fechaDesalojo);
        },

        validateIntInput: function (o) {
            let input = o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                console.log();
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

        change: function (o) {
            let input = o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                console.log();
                return true;
            } else {
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
                console.log("value: ", value);
                console.log("modelo que quiero ver");
                console.log(mdshed);

                console.log("modelo mdprogrammed que quiero ver");
                console.log(mdprogrammed);

                let cant = mdshed.getProperty("/records");
                var cap = cant[0].capmax;
                console.log("capacidad");
                console.log(cap);

                let input2 = sap.ui.getCore().byId("assigned_quantity").getValue();
                console.log("prrrr" + input2);

                let programmed_residue = mdprogrammed.getProperty("/selectedRecord/residue");
                console.log("el residuo");
                console.log(programmed_residue);
                console.log("condition: ", value !== '0');
                if (value === "" || value === null || value === undefined || parseInt(value) === 0) {
                    mdprogrammed.setProperty("/name/state", "Error");
                    mdprogrammed.setProperty("/name/stateText", "La cantidad programada debe ser mayor a cero (0)");
                    mdprogrammed.setProperty("/addBtn", false);
                    sap.ui.getCore().byId("assigned_quantity2").setValue("");
                    console.log("entre aquiiii Victor");

                    // mdprogrammed.setProperty("/confirmBtn", false);
                } else {
                    var completa = (value * 100) / cap;

                    var tmp = parseInt(value) + 1;
                    sap.ui.getCore().byId("assigned_quantity2").setValue(completa.toFixed(2));


                    if (value <= programmed_residue) {
                        mdprogrammed.setProperty("/name/state", "None");
                        mdprogrammed.setProperty("/name/stateText", "");
                        // mdprogrammed.setProperty("/confirmBtn", true);
                        mdprogrammed.setProperty("/addBtn", true);

                    } else {
                        if (value > programmed_residue) {
                            console.log("entro en el ");
                            mdprogrammed.setProperty("/name/state", "Warning");
                            mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera al saldo");
                            mdprogrammed.setProperty("/confirmBtn", true);
                            mdprogrammed.setProperty("/addBtn", true);
                        }
                        if (value > cap) {
                            mdprogrammed.setProperty("/name/state", "Warning");
                            mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera la capacidad del galpon");
                            mdprogrammed.setProperty("/confirmBtn", true);
                            mdprogrammed.setProperty("/addBtn", true);
                        }

                        if (value === "" || value === null || value === undefined || value === 0) {
                            mdprogrammed.setProperty("/name/state", "Error");
                            mdprogrammed.setProperty("/name/stateText", "La cantidad programada debe ser mayor a cero (0)");
                            mdprogrammed.setProperty("/addBtn", false);
                        }
                    }
                }



                // if (value == undefined) {
                //   sap.ui.getCore().byId("assigned_quantity2").setValue(666);
                // }

                // var completa = (value * 100) / cap; 

                // var tmp = parseInt(value) + 1;
                // sap.ui.getCore().byId("assigned_quantity2").setValue(completa.toFixed(4));

                return false;
            }
        },
        change_age: function (o) {
            let input = o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);
            console.log("El input:::: ", input)
            if (regex.test(value)) {
                console.log();
                return true;
            } else {
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

                let mdprojected = this.getModel("mdprojected");
                console.log("value: ", value);

                if (value === "" || value === null || value === undefined || parseInt(value) === 0) {
                    mdprojected.setProperty("/age/state", "Error");
                    mdprojected.setProperty("/age/stateText", "La edad debe ser mayor a cero (0)");
                    this.getView().byId("age").setValue("");
                    this.getView().byId("bProj").setEnabled(false);

                } else {
                    mdprojected.setProperty("/age/state", "None");
                    mdprojected.setProperty("/age/stateText", "");
                    this.getView().byId("bProj").setEnabled(true);
                }

                return false;
            }
        },
        changeBreed: function (oEvent) {
            let mdprojected = this.getModel("mdprojected"),
                Select = oEvent.getSource(),
                breed_id = Select.getSelectedKey();
                console.log(breed_id === "" || breed_id === null || breed_id === undefined || parseInt(breed_id) === 0)
            if (breed_id === "" || breed_id === null || breed_id === undefined || parseInt(breed_id) === 0) {
                console.log("Here i am, rock you like hurricane")
                Select.setValueState("Error");
                Select.setValueStateText("Seleccione una raza");
                this.getView().byId("bProj").setEnabled(false);

            } else {
                Select.setValueState("None");
                Select.setValueStateText("");
                this.getView().byId("bProj").setEnabled(true);
            }

        },
        change_age2: function (o) {
            let input = o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);
            console.log("El input:::: ", input)
            if (regex.test(value)) {
                console.log();
                return true;
            } else {
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

                let mdprojected = this.getModel("mdprojected");
                console.log("value: ", value);

                if (value === "" || value === null || value === undefined || parseInt(value) === 0) {
                    mdprojected.setProperty("/age2/state", "Error");
                    mdprojected.setProperty("/age2/stateText", "La edad debe ser mayor a cero (0)");
                    this.getView().byId("age2").setValue("");

                } else {
                    if (parseInt(value) > 100) {
                        mdprojected.setProperty("/age2/state", "Error");
                        mdprojected.setProperty("/age2/stateText", "La edad no puede ser mayor a cien días (100)");
                        this.getView().byId("bProj").setEnabled(false);
                    } else {
                        mdprojected.setProperty("/age2/state", "None");
                        mdprojected.setProperty("/age2/stateText", "");
                        this.getView().byId("bProj").setEnabled(true);
                    }
                }

                return false;
            }
        },

        change2: function (o) {


            let input = o.getSource();
            let floatLength = 2,
                intLength = 10;
            console.log("entro en la funcion v");
            let value = input.getValue();
            let regex = new RegExp(`/^([0-9]{1,${intLength}})([.][0-9]{0,${floatLength}})?$/`);
            if (regex.test(value)) {
                input.setValueState("None");
                input.setValueStateText("");
                return true;
            }
            else {
                let pNumber = 0;
                let aux = value
                    .split("")
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
                    })
                    .join("")
                    .split(".");
                value = aux[0].substring(0, intLength);

                if (aux[1] !== undefined) {
                    value += "." + aux[1].substring(0, floatLength);
                }
                console.log(value);


                if (value <= 100) {
                    input.setValue(value);
                    let mdshed = this.getModel("mdshed");

                    console.log("modelo que quiero ver");
                    console.log(mdshed);

                    let cant = mdshed.getProperty("/records");

                    var cap = cant[0].capmax;
                    console.log("capacidad");
                    console.log(cap);

                    let input2 = sap.ui.getCore().byId("assigned_quantity2").getValue();
                    console.log("prrrr" + input2);

                    var completa = (value * cap) / 100;

                    console.log("completa");
                    console.log(Math.round(completa));
                    console.log(value);

                    let mdprogrammed = this.getModel("mdprogrammed");
                    let programmed_residue = mdprogrammed.getProperty("/selectedRecord/residue");

                    if (value === "" || value === null || value === undefined || value === 0) {
                        console.log("nulo");
                        mdprogrammed.setProperty("/name/state", "Error");
                        mdprogrammed.setProperty("/name/stateText", "La cantidad programada debe ser mayor a cero (0)");
                        mdprogrammed.setProperty("/addBtn", false);
                        mdprogrammed.setProperty("/confirmBtn", false);

                    } else {
                        if (completa <= programmed_residue) {
                            mdprogrammed.setProperty("/name/state", "None");
                            mdprogrammed.setProperty("/name/stateText", "");
                            mdprogrammed.setProperty("/confirmBtn", true);
                            mdprogrammed.setProperty("/addBtn", true);

                        } else {
                            if (completa > programmed_residue) {
                                console.log("entro en el ");
                                mdprogrammed.setProperty("/name/state", "Warning");
                                mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera al saldo");
                                mdprogrammed.setProperty("/confirmBtn", true);
                                mdprogrammed.setProperty("/addBtn", true);
                            }
                            if (completa > cap) {
                                mdprogrammed.setProperty("/name/state", "Warning");
                                mdprogrammed.setProperty("/name/stateText", "La cantidad programada supera la capacidad del galpon");
                                mdprogrammed.setProperty("/confirmBtn", true);
                                mdprogrammed.setProperty("/addBtn", true);
                            }
                            if (completa == "" || completa === 0) {
                                mdprogrammed.setProperty("/name/state", "Error");
                                mdprogrammed.setProperty("/name/stateText", "La cantidad programada debe ser mayor a cero (0)");
                                mdprogrammed.setProperty("/addBtn", false);
                                mdprogrammed.setProperty("/confirmBtn", false);
                            }
                        }
                    }






                    var tmp = parseInt(value) + 1;
                    sap.ui.getCore().byId("assigned_quantity").setValue(Math.round(completa));
                    return false;
                } else {
                    input.setValue(100);
                    mdprogrammed.setProperty("/name/state", "Error");
                    mdprogrammed.setProperty("/name/stateText", "La cantidad programada no debe superar el 100% de capacidad del galpón");
                    mdprogrammed.setProperty("/addBtn", false);
                    mdprogrammed.setProperty("/confirmBtn", false);

                }
            }




        },

        onAddBroiler: function () {
            console.log("estoy presionando el boton mas");
            
            if (sap.ui.getCore().byId("programmed_date").getValueState() !== 'Error') {
                // let selected_incubator = sap.ui.getCore().byId("selectLot").getSelectedKey(),
                let mdprogrammed = this.getView().getModel("mdprogrammed"),
                    selected_incubator = mdprogrammed.getProperty("/selectedRecord/lot_incubator"),
                    quantity_chicken = sap.ui.getCore().byId("assigned_quantity").mProperties.value,
                    fecha = sap.ui.getCore().byId("programmed_date").mProperties.value,
                    slaughterhouse = sap.ui.getCore().byId("selecProduct2").getSelectedItem().mProperties.text,
                    slaughterhouse_id = sap.ui.getCore().byId("selecProduct2").getSelectedKey();

                let flag = true;
                console.log("INCUBADOR KEYYYYYYYYY:" + selected_incubator);
                console.log("modelo:");
                console.log(mdprogrammed);

                let capacidad = mdprogrammed.getProperty("/records");

                console.log("capacidad");
                console.log(capacidad);

                let key = mdprogrammed.getProperty("/product/selectedKey");
                let aqui = mdprogrammed.getProperty("/product");
                let vector = mdprogrammed.getProperty("/product/records");

                console.log("nombre planta Beneficio: " + slaughterhouse);
                console.log("id planta Beneficio: " + slaughterhouse_id);
                mdprogrammed.setProperty("/slaughterhouse_id", slaughterhouse_id);

                let lot = mdprogrammed.getProperty("/selectedRecord/lot_assigned"),
                    name = selected_incubator,
                    selected_product_name = sap.ui.getCore().byId("selecProduct").getSelectedItem().mProperties.text,
                    selected_product_id = sap.ui.getCore().byId("selecProduct").getSelectedKey();

                console.log("gvehvhsskjebvrb");
                console.log(selected_product_name);
                console.log(selected_product_id);


                console.log("lote seleccionado:: " + selected_incubator);
                console.log("Lot: ", lot, "name: ", name);


                if (lot === undefined) {
                    lot = [];
                }
                let list_name = name.split("/");

                let sum_chicken = parseInt(quantity_chicken);
                lot.forEach(item => {
                    // sum_chicken += parseInt(item.quantity_chicken);
                    //verifica que no este repetido el lote
                    if (selected_product_id == item.selected_product_id && slaughterhouse_id == item.slaughterhouse_id) {
                        console.log("se repite!!!");
                        flag = false;
                        item.quantity_chicken += parseInt(quantity_chicken);
                    }
                });

                if (flag) {
                    let lotItem = {
                        selected_lot: parseInt(selected_incubator),
                        quantity_chicken: parseInt(quantity_chicken),
                        name: list_name[0],
                        description: selected_product_name,
                        slaughterhouse_id: slaughterhouse_id,
                        selected_product_id: parseInt(selected_product_id)
                    };
                    lot.push(lotItem);
                }


                console.log("lot: ", lot);
                //console.log("listID: ", mdincubator.getProperty("/listID"));
                //mdprogrammed.setProperty("/lot_records/"+ mdincubator.getProperty("/listID") +"/assigned", lot );
                mdprogrammed.setProperty("/selectedRecord/lot_assigned", lot);
                if (lot.length > 0) {
                    mdprogrammed.setProperty("/confirmBtn", true);
                }
                else {
                    mdprogrammed.setProperty("/confirmBtn", false);
                }
                let residue = parseInt(mdprogrammed.getProperty("/selectedRecord/residue")) - sum_chicken;
                console.log(parseInt(mdprogrammed.getProperty("/selectedRecord/residue")), sum_chicken, residue);
                //console.log("Brayan: ", mdprogrammed.getProperty("/lot_records/"+ mdincubator.getProperty("/listID") +"/eggs"), " ", sum_eggs);
                mdprogrammed.setProperty("/selectedRecord/residue", residue);
                sap.ui.getCore().byId("assigned_quantity").setValue("");
                sap.ui.getCore().byId("assigned_quantity2").setValue("");
                mdprogrammed.setProperty("/name/state", "None");
                mdprogrammed.setProperty("/name/stateText", "");
                mdprogrammed.setProperty("/addBtn", false);
                console.log("mdprogrammed luego del lote: ", mdprogrammed);
                mdprogrammed.setProperty("/enabledProduct", (sum_chicken < 1));
            }

        },
        handleTitleSelectorPress: function (oEvent) {
            var _oPopover = this._getResponsivePopover();
            _oPopover.setModel(oEvent.getSource().getModel());
            _oPopover.openBy(oEvent.getParameter("domRef"));
            console.log("prueba");
        },
        _getResponsivePopover: function () {
            if (!this._oPopover) {

                this._oPopover = sap.ui.xmlfragment("broilerEviction.view.Popover", this);
                this.getView().addDependent(this._oPopover);
            }
            return this._oPopover;
        },
        addDays: function (ndate, ndays) {
            ndate.setDate(ndate.getDate() + ndays);
            return ndate;
        },

        onDialogPressPj: function (oEvent) {
            this.formProjected = sap.ui.xmlfragment(
                "broilerEviction.view.DialogProject", this);
            this.getView().addDependent(this.pressDialog);
            this.formProjected.open();
        },

        onProyectedCloseDialog: function (oEvent) {
            console.log("Entro");
            this.formProjected.close();
            this.formProjected.destroy();
        },

        onProjectedSaveDialog: function (oEvent) {

            let that = this,
                util = this.getModel("util"),
                mdprojected = this.getModel("mdprojected"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                breed_id = sap.ui.getCore().byId("breedSelect").getSelectedKey(),
                pDate = sap.ui.getCore().byId("projected_date").mProperties.dateValue,
                projected_quantity = sap.ui.getCore().byId("projected_quantity").mProperties.value,
                projected_date = `${pDate.getFullYear()}-${pDate.getMonth() + 1}-${pDate.getDate()}`;
            console.log(projected_date);


            var dates = [];
            //this.byId("list").setBusy(true);
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
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                                response.status);
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
                                    text: "Semana guardada con éxito."
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



            mdprojected.setProperty("/records", findScenario.data);
            console.log(mdprojected);
            mdprojected.attachRequestCompleted(function () {
                sap.ui.getCore().byId("projectedTable").removeSelections();
            });
            this.hideButtons(true, false, false, false);
        },
        onBreedLoad: function () {
            const util = this.getModel("util"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findBreed");

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
                                //console.log(data);
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
                    //mdbreed.setProperty("/value", mdbreed.getProperty("/records/0/breed_id"));
                    mdbreed.setProperty("/value", null);
                    console.log(mdbreed);
                }
            });
        },
        onProyectedSave: async function () {

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
            let mdprogrammed = this.getModel("mdprogrammed"),
                sRecord = mdprogrammed.getProperty("/selectedRecord"),
                lot = mdprogrammed.getProperty("/records");
            let selectRec = this.getModel("mdprojected").getProperty("/dataPopover");
            let i = 0;

            mdprogrammed.setProperty("/selectedRecord/lot_assigned", []);
            mdprogrammed.setProperty("/programmed_date", null);
            mdprogrammed.setProperty("/enabledProduct", true);
            mdprogrammed.setProperty("/shedEviction", false);
            mdprogrammed.setProperty("/product/selectedKey", "");

            let ar = new Array();
            let product = new Array();
            ar = mdprogrammed.getProperty("/product/records");

            let gender = selectRec[0].gender;
            
            while (i < ar.length) {
                if (ar[i].gender == gender) {
                    product.push(ar[i])
                    console.log("Género", product)
                }
                i++;
            }
            mdprogrammed.setProperty("/product/records", product)
            console.log("El item seleccionado es: ", sRecord)

            console.log("enble??");
            console.log(mdprogrammed.getProperty("/enabledProduct"));
            console.log("Holaaaa bebé ", mdprogrammed.getProperty("/product/records"));

            if (lot === undefined) {
                lot = [];
            }
            let sum_chicken = 0;

            lot.forEach(item => {
                console.log("item::");
                console.log(item);
                // if (item.execution_quantity !== undefined && item.execution_quantity !== null)
                //     sum_chicken += parseInt(item.scheduled_quantity);
                if (item.scheduled_quantity !== undefined && item.scheduled_quantity !== null)
                    sum_chicken += parseInt(item.scheduled_quantity);
                console.log("suma::" + sum_chicken);
            });

            sRecord.residue = parseInt(sRecord.projected_quantity) - sum_chicken;

            mdprogrammed.setProperty("/enabledProduct", (true));

            this.formProgrammed = sap.ui.xmlfragment(
                "broilerEviction.view.DialogProgrammer", this);
            var that = this;
            var dlg = sap.ui.getCore().byId("dialogprogrammed");
            dlg.attachAfterClose(function () {
                that.formProgrammed.destroy();
            });
            this.getView().addDependent(this.formProgrammed);
            this.formProgrammed.open();
            this.onChangeFarm();
        },
        onChangeShed: async function () {
            let mdshed = this.getModel("mdshed"),
                mdprogrammed = this.getModel("mdprogrammed"),
                selectedShed = sap.ui.getCore().byId("selectShed").getSelectedKey();
            mdshed.setProperty("/selectedKey", selectedShed);
            console.log(selectedShed);
            sap.ui.getCore().byId("assigned_quantity").setValue();
            sap.ui.getCore().byId("assigned_quantity2").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
            mdprogrammed.setProperty("/addBtn", false);

        },
        onChangeFarm: async function () {
            let mdfarm = this.getModel("mdfarms"),
                mdprogrammed = this.getModel("mdprogrammed");
            console.log("EL MODELOOOOOO");
            console.log(mdprogrammed);

            // let  selectedFarm = sap.ui.getCore().byId("selectFarm").getSelectedKey();
            let selectedFarm = mdprogrammed.getProperty("/selectedRecord/farm_code");
            console.log("selectedFarm");
            console.log(selectedFarm);
            mdfarm.setProperty("/selectedKey", selectedFarm);
            let findShed = await this.findShedByFarm(selectedFarm),
                mdshed = this.getModel("mdshed");

            mdshed.setProperty("/records", findShed.data);
            let array1 = mdshed.getProperty("/records"),
                selectedShed = findShed.data[0].shed_id;

            var found = array1.find(function (element) {
                return element.shed_id == selectedShed;
            });

            mdprogrammed.setProperty("/capmin", found.capmin);
            mdprogrammed.setProperty("/capmax", found.capmax);
            sap.ui.getCore().byId("assigned_quantity").setValue();
            sap.ui.getCore().byId("assigned_quantity2").setValue();
            mdprogrammed.setProperty("/name/state", "None");
            mdprogrammed.setProperty("/name/stateText", "");
            mdprogrammed.setProperty("/confirmBtn", false);
            mdprogrammed.setProperty("/addBtn", false);

        },

        findShedByFarm: function (selectedFarm) {
            let util = this.getModel("util"),
                mdshed = this.getModel("mdshed"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            console.log(partnership_id);
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findShedsByFarm");
            console.log("LO USEEEEEE");
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
        onProgrammedCloseDialog: function () {
            let mdprogrammed = this.getModel("mdprogrammed");
            mdprogrammed.setProperty("/selectedRecord/lot_assigned", []);
            this.formProgrammed.close();
            this.formProgrammed.destroy();
        },

        onProgrammedSaveDialog: function () {
            let that = this,
                util = this.getModel("util"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                mdprogrammed = this.getModel("mdprogrammed"),
                mdprocess = this.getModel("mdprocess"),
                pDate = sap.ui.getCore().byId("programmed_date").getValue(),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/selectedRecord/").partnership_id,
                farm_id = mdprogrammed.getProperty("/selectedRecord/farm_code"),
                shed_id = mdprogrammed.getProperty("/selectedRecord/shed_code"),
                breed_id = mdprogrammed.getProperty("/selectedRecord/breed_id"),

                center_id = mdprogrammed.getProperty("/selectedRecord/center_id");
            console.log(mdprogrammed);
            console.log("center id" + center_id);
            console.log(mdprogrammed.getProperty("/selectedRecord/lot_assigned"));
            mdprogrammed.setProperty("/enabledProduct", true);
            mdprogrammed.setProperty("/confirmBtn", false);
            console.log("la fecha seleccionada:::", pDate)
            var dates = [];
            console.log("pDate: ", pDate);
            //const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/addbroilerdetail");
            const serverName = "/broilerEvictionDetail";
            console.log("recoooooooooord");
            console.log(mdprogrammed.getProperty("/selectedRecord/broilereviction_id"));
            fetch(serverName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projected_date: mdprogrammed.getProperty("/selectedRecord/projected_date"),
                    scenario_id: scenario_id,
                    _date: pDate,
                    farm_id: farm_id,
                    shed_id: shed_id,
                    center_id: center_id,
                    partnership_id: partnership_id,
                    breed_id: breed_id,
                    records: mdprogrammed.getProperty("/selectedRecord/lot_assigned"),
                    broilereviction_id: mdprogrammed.getProperty("/selectedRecord/broilereviction_id")
                })
            })
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log(response);
                            console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                            return;
                        }

                        response.json().then(function (res) {

                            that.formProgrammed.close();
                            that.formProgrammed.destroy();
                            mdprogrammed.setProperty("/records", res.data);
                            let record = res.data;
                            record.forEach(element => {
                                if (element.executionslaughterhouse_id && element.execution_quantity && element.execution_date) {
                                    element.isexecuted = true;
                                } else {
                                    element.isexecuted = false;
                                }

                            });
                            mdprogrammed.setProperty("/records", record);

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
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        handleTitleSelectorPress: function (oEvent) {
            var _oPopover = this._getResponsivePopover();
            _oPopover.setModel(oEvent.getSource().getModel());
            _oPopover.openBy(oEvent.getParameter("domRef"));
            console.log("prueba");
        },
        _getResponsivePopover: function () {
            if (!this._oPopover) {

                this._oPopover = sap.ui.xmlfragment("broilerEviction.view.Popover", this);
                this.getView().addDependent(this._oPopover);
            }
            return this._oPopover;
        },
        onFarmLoad: function () {

            const util = this.getModel("util"),
                serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findFarmByPartAndStatus"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");

            let osfarm = this.getModel("mdfarms"),
                that = this;

            osfarm.setProperty("/records", []);
            console.log(serverName);
            let isRecords = new Promise((resolve, reject) => {
                fetch("/farm/findFarmByPartAndStatus2/", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: "partnership_id=" + partnership_id + "&status_id=2"
                })
                    .then(
                        function (response) {
                            if (response.status !== 200) {

                                console.log("Looks like there was a problem. Status Code: " +
                                    response.status);
                                return;
                            }
                            // Examine the text in the response
                            response.json().then(function (data) {
                                console.log(data);
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
                    osfarm.setProperty("/records", res.data);
                    console.log(osfarm);
                } else {
                    console.log("no tiene data ");
                }
            });
        },

        handleDelete: function (oEvent) {
            console.log("se presiono el boton x");
            let sId = oEvent.getParameters().listItem.sId,
                asId = sId.split("-"),
                idx = asId[asId.length - 1],
                mdprogrammed = this.getModel("mdprogrammed"),
                that = this;


            // let arr = mdprogrammed.getProperty("/selectedRecord/lot_assigned");
            //   console.log("OBJDELTETRETE::: " );
            //   console.log(arr[idx]);

            // let obj =  mdprogrammed.getProperty("/records/"+idx);

            var dialog = new Dialog({
                title: "Confirmación",
                type: "Message",
                content: new Text({
                    text: "Se procedera a eliminar asignación: " //+ obj.scheduled_date

                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        dialog.close();

                        /*Aqui se hace la modificacion para eliminar cuando se esta insertando uno nuevo*/
                        let mdprogrammed = that.getView().getModel("mdprogrammed"),
                            arr = mdprogrammed.getProperty("/selectedRecord/lot_assigned");

                        /*se recalcula el residuo*/
                        mdprogrammed.setProperty("/selectedRecord/residue", parseInt(mdprogrammed.getProperty("/selectedRecord/residue")) + arr[idx].quantity_chicken);
                        /*hasta aqui*/

                        arr.splice(idx, 1);
                        mdprogrammed.setProperty("/selectedRecord/lot_assigned", arr);
                        if (arr.length > 0) {
                            mdprogrammed.setProperty("/confirmBtn", true);
                        }
                        else {
                            mdprogrammed.setProperty("/confirmBtn", false);
                        }
                        mdprogrammed.refresh();
                        /*hasta aqui*/



                        console.log(mdprogrammed);
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
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();

        },

        testeameste: function () {
            let mdprogrammed = this.getModel("mdprogrammed");
            let shedEviction = mdprogrammed.getProperty("/shedEviction");
            console.log("shedEviction:: ", shedEviction);
        },

        onDialogPressEx: function () {
            let that = this;
            this.dialogEviction = sap.ui.xmlfragment("broilerEviction.view.DialogEviction", this);
            let dialog = this.dialogEviction;
            let mdprojected = this.getModel("mdprojected");
            console.log("el id:: ", mdprojected.getProperty("/shed_id"));
            console.log(dialog);
            //Botón cancelar:
            console.log(sap.ui.getCore());
            // sap.ui.getCore().byId("cancelBtnEviction").attachPress(function() {
            //     dialog.close();
            //     console.log("el id:: ", mdprojected.getProperty("/shed_id") );
            //     // dialog.destroy();
            // });

            //  //Botón cancelar:
            //  sap.ui.getCore().byId("aceptBtnEviction").attachPress(function() {
            //   dialog.close();
            //   this.onDialogPressExAcept();
            //   // dialog.destroy();
            // });

            //Agregamos como dependiente el dialogo a la vista:
            this.getView().addDependent(dialog);

            //Abrimos el dialogo:
            dialog.open();


        },

        destroy: function () {
            this.dialogEviction.destroy();
        },

        onDialogPressExAcept: function () {
            let that = this,
                util = this.getModel("util"),
                mdprogrammed = this.getModel("mdprogrammed"),
                mdexecuted = this.getModel("mdexecuted"),
                execution_quantity = mdexecuted.getProperty("/execution_quantity"),
                mdprojected = this.getModel("mdprojected"),
                aRecords = mdexecuted.getProperty("/records"),
                sRecords = mdprogrammed.getProperty("/selectedRecord"),
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                mdscenario = this.getModel("mdscenario"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                farm_id = this.getView().getModel("mdfarms").getProperty("/selectedKey"),
                center_id = this.getView().getModel("mdcenter").getProperty("/selectedKey"),
                mdshed = this.getModel("mdshed"),
                shed_id = mdshed.getProperty("/selectedKey"),
                slaughterhouse_id = mdexecuted.getProperty("/slaughterhouse/selectedKey");


            let shedEviction = mdprogrammed.getProperty("/shedEviction");
            shed_id = mdprojected.getProperty("/shed_id");
            // debugger;
            this.dialogEviction.close();

            let pDate = mdprogrammed.getProperty("/selectedRecord/projected_date"),
                aDate = pDate.split("/"),
                minDate = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                date2 = new Date(aDate[2], aDate[1] - 1, aDate[0]),
                maxDate = this.addDays(date2, 7),
                breed_id = this.getModel("mdprogrammed").getProperty("/selectedRecord/breed_id");

            mdprogrammed.setProperty("/selectedRecord/minDate/", minDate);
            mdprogrammed.setProperty("/selectedRecord/maxDate/", maxDate);

            // ospartnership = this.getView().getModel("ospartnership");
            // ospartnership.setProperty("/selectedPartnership/partnership_index", this.index);

            console.log(mdscenario);

            let housing_way_id = mdprogrammed.getProperty("/selectedRecord/broilereviction_id");
            console.log("housing_way_id: ", housing_way_id);
            let records_programmed = [];
            let sendRecords = true;


            console.log("aqui record ");
            console.log(aRecords);

            console.log("execution_quantiy", execution_quantity);
            aRecords.forEach(item => {
                console.log("RECORDS:: " + item.lot);
                // if ((item.available!==undefined && item.available=== true )) {

                if ((parseInt(execution_quantity)) && (parseInt(execution_quantity))) {
                    // item.executedfarm_id = farm_id;
                    // item.executedcenter_id = center_id;
                    // item.executedshed_id = shed_id;
                    item.executionslaughterhouse_id = slaughterhouse_id;
                    item.execution_quantity = execution_quantity;
                    console.log("No es null los valores son: ", item.execution_date, item.execution_quantity);
                    records_programmed.push(item);
                }



                if ((!item.execution_date) && (parseInt(execution_quantity))) {
                    console.log("entro en el primer if 2");
                    console.log("execution_date null");
                    item.state_date = "Error";
                    item.state_text_date = "El campo fecha no puede estar en blanco";
                    sendRecords = false;
                } else {
                    item.state_date = "None";
                    item.state_text_date = "";
                }

                if ((item.execution_date) && (!parseInt(execution_quantity))) {
                    console.log("entro en el primer if 3");
                    console.log("execution_date null");
                    item.state_quantity = "Error";
                    item.state_text_quantity = "El campo cantidad no puede estar en blanco";
                    sendRecords = false;
                } else {
                    item.state_quantity = "None";
                    item.state_text_quantity = "";
                }

                // if ((item.execution_date) && (parseInt(execution_quantity) > item.capacity_shed)) {
                //   console.log("entro en el primer if 4")
                //   console.log("execution_date null");
                //   item.state_quantity = 'Error';
                //   item.state_text_quantity = 'El campo cantidad supera la capacidad del galpon';
                //   sendRecords = false;
                // } else {
                //     item.state_quantity = 'None';
                //     item.state_text_quantity = '';
                // }




                /*
          //item.execution_date = sRecords.projected_date;

          if ((item.execution_quantity!== null && item.execution_quantity!== undefined) && (item.execution_date !== null && item.execution_date !== undefined)){
            console.log("No hay valores null o undefined: ", item.execution_date, item.execution_quantity);
            records_programmed.push(item);
          }
          if ((!item.execution_date) && (item.execution_quantity)) {
            console.log("execution_date null");
            sendRecords= false;
            item.state_date = 'Error';
            item.state_text_date = 'El campo no puede estar en blanco';
          } else {
            item.state_date = 'None';
            item.state_text_date = '';
          }*/

                // if ((!item.execution_quantity)) {
                //   if ((item.execution_date===null || item.execution_date=== undefined)){
                //     console.log('date invadio:: ' + item.execution_date);
                //   }
                //   console.log("execution_date quantity");
                //   item.state_quantity = 'None';
                //   item.state_text_quantity = 'Recuerde asignar la cantidad ejecutada';
                // } else {
                //   item.state_quantity = 'None';
                //   item.state_text_quantity = '';
                // }
                // }
            });
            mdexecuted.refresh(true);

            console.log(aRecords);
            console.log("inserta esto:");
            console.log(records_programmed);

            //const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/addbroilerdetail");
            const serverName = "/broilerEvictionDetail";
            // const serverName = "/broilerEvictionDetail/addBroilerEvictionDetail";
            console.log(serverName);

            if (records_programmed.length > 0 && sendRecords) {
                console.log("aja, entrre aqui !!:::");
                fetch(serverName, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        projected_date: mdprogrammed.getProperty("/selectedRecord/projected_date"),
                        records: records_programmed,
                        scenario_id: scenario_id,
                        _date: aDate[2] + "-" + aDate[1] + "-" + aDate[0],
                        partnership_id: partnership_id,
                        breed_id: breed_id,
                        shedEviction: shedEviction,
                        shed_id: shed_id
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
                                console.log("luego entre aqui");
                                console.log(res.data);

                                mdexecuted.setProperty("/isnotexecuted", false);
                                mdexecuted.setProperty("/isexecuted", true);
                                mdprogrammed.setProperty("/records", res.data);
                                mdexecuted.setProperty("/name/state", "None");
                                mdexecuted.setProperty("/name/stateText", "");
                                mdprogrammed.setProperty("/available", false);
                                mdexecuted.setProperty("/saveBtn", false);
                                that.findExecuted();

                                console.log(mdexecuted);
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
                    )
                    .catch(function (err) {
                        console.log("Fetch Error :-S", err);
                    });
            } else if (!sendRecords) {
                this.onToast("Faltan campos");
            } else {
                //No se detectaron cambios
                this.onToast("No de detectaron cambios");
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
                id = selectedItem.broilereviction_detail_id,
                broiler_eviction_id = selectedItem.broilereviction_id,
                scenario_id = this.getModel("mdscenario").getProperty("/scenario_id"),
                partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
                breed_id = this.getModel("mdprogrammed").getProperty("/selectedRecord/breed_id"),
                shed_id = selectedItem.shed_id,
                pDate = mdprogrammed.getProperty("/selectedRecord/projected_date"),
                aDate = pDate.split("/"),
                _date = aDate[2] + "-" + aDate[1] + "-" + aDate[0];

            console.log(selectedItem);
            console.log(mdprogrammed);


            fetch("/broilerEvictionDetail/updateDisabledBroilerEvictionDetail", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "PUT",
                body: JSON.stringify({
                    broiler_eviction_id: broiler_eviction_id,
                    broilereviction_detail_id: id,
                    scenario_id: scenario_id,
                    partnership_id: partnership_id,
                    breed_id: breed_id,
                    shed_id: shed_id,
                    _date: _date
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
                                    if (element.executionslaughterhouse_id && element.execution_quantity && element.execution_date) {
                                        element.isexecuted = true;
                                    } else {
                                        element.isexecuted = false;
                                    }

                                });
                                mdprogrammed.setProperty("/records", records);
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
                                console.log(res);

                            });
                        }

                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });

        },

        handleChange: function (oEvent) {
            let DateP = oEvent.getSource(),
                age_date = DateP.mProperties.value,
                mdprojected = this.getModel("mdprojected");

            if (age_date === undefined || age_date === "" || age_date === "0" || age_date === null) {
                DateP.setValueState("Error");
                DateP.setValueStateText("No se pueden consultar fechas vacías");
                this.getView().byId("bProj").setEnabled(false);
            } else {
                DateP.setValueState("None");
                DateP.setValueStateText("");
                this.getView().byId("bProj").setEnabled(true);
            }

        },

        onMessageWarningDialogPress: function (oEvent) {
            var dialog = new Dialog({
                title: 'Desalojado',
                type: 'Message',
                state: 'Warning',
                content: new Text({
                    text: 'La proyección proviene de una programación que ya fue desalojada'
                }),
                beginButton: new Button({
                    text: 'OK',
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

        pressadjustment: function (o) {
            console.log({
                lot: this.getView().byId("numberL").getValue(),
                stage: "D",
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
                    stage: "D",
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
                        if (res.data.length > 0) {
                            console.log("2")
                            mdprojected.setProperty("/visibleInfo", ((res.data[0].adjustment_date !== undefined && res.data[0].adjustment_date !== null) && (res.data[0].username !== undefined && res.data[0].username !== null)));
                            mdprojected.setProperty("/visibleOtherButtons", true)
                            if (res.data[0].eviction === true) {
                                mdprojected.setProperty("/visibleOtherButtons", false)
                            }
                        } else {
                            console.log("1")
                            mdprojected.setProperty("/visibleOtherButtons", false)

                        }





                    });

                })
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });


        },

        SaveEviction: async function () {
            let mdprojected = this.getView().getModel("mdprojected"),
                stage = "D",
                record = mdprojected.getProperty("/adjustmenttable/0")
            console.log(stage)
            record.stage = stage
            console.log(record)
            console.log(record.eviction_date)
            if (record.eviction_date == undefined || record.eviction_date == " " || record.eviction_date == "" || record.eviction_date == null) {
                MessageToast.show("Ingrese una parametro de fecha de desalojo");
            } else {
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
                                        that.getModel("mdprojected").setProperty("/adjustmenttable", {})
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
