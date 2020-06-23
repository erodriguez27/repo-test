sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "technicalConfiguration/model/formatter",
    "sap/m/Dialog",
    "sap/m/Button",
], function (BaseController, formatter, Dialog, Button) {
    "use strict";

    return BaseController.extend("technicalConfiguration.controller.osshed", {
        formatter: formatter,

        /**
         * Se llama a la inicialización de la Vista
         */
        onInit: function () {
            //ruta para la vista principal de galpones
            this.getOwnerComponent().getRouter().getRoute("osshed").attachPatternMatched(this._onRouteMatched, this);
            //ruta para los detalles de un galpón
            this.getOwnerComponent().getRouter().getRoute("osshed_Create").attachPatternMatched(this._onCreateMatched, this);
            //ruta para los detalles de un galpón
            this.getOwnerComponent().getRouter().getRoute("osshed_Record").attachPatternMatched(this._onRecordMatched, this);
        },

        /**
         * Coincidencia de ruta para acceder a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onRouteMatched: function (oEvent) {
            /**
             * @type {Controller} that          Referencia a este controlador
             * @type {JSONModel} dummy          Referencia al modelo "dummy"
             * @type {JSONModel} OS             Referencia al modelo "OS"
             * @type {JSONModel} PARTNERSHIP  Referencia al modelo "PARTNERSHIP"
             * @type {JSONModel} BROILERSFARM Referencia al modelo "BROILERSFARM"
             * @type {JSONModel} CENTER       Referencia al modelo "CENTER"
             */

            var that = this,
                util = this.getView().getModel("util"),
                ospartnership = this.getView().getModel("OSPARTNERSHIP"),
                osfarm = this.getView().getModel("OSFARM"),
                oscenter = this.getView().getModel("OSCENTER"),
                osshed = this.getView().getModel("OSSHED");

            ospartnership.setProperty("/itemType", "Inactive");
            osfarm.setProperty("/itemType", "Inactive");
            oscenter.setProperty("/itemType", "Inactive");

            //dependiendo del dispositivo, establece la propiedad "phone"
            util.setProperty("/phone/",
                this.getOwnerComponent().getContentDensityClass() === "sapUiSizeCozy");

            ospartnership.setProperty("/settings/tableMode", "SingleSelect");
            osfarm.setProperty("/settings/tableMode", "SingleSelect");
            oscenter.setProperty("/settings/tableMode", "SingleSelect");

            //si la estructura seleccionada antes de acceder a esta vista es diferente a galpón
            if (util.getProperty("/selectedEntity") !== "osshed") {

                //establece galpón como la estructura seleccionada
                util.setProperty("/selectedEntity", "osshed");

                //establece el tab de la tabla PARTNERSHIP como el tab seleccionado
                this.getView().byId("tabBar").setSelectedKey(this.getView().getId() + "--" + "partnershipFilter");

                //borra cualquier selección que se haya hecho en la tabla PARTNERSHIP
                this.getView().byId("partnershipTable").removeSelections(true);

                //borra cualquier selección que se haya hecho en la tabla BROILERSFARM
                this.getView().byId("farmTable").removeSelections(true);

                //borra cualquier selección que se haya hecho en la tabla CENTER
                this.getView().byId("centerTable").removeSelections(true);

                //borra cualquier selección que se haya hecho en la tabla silo
                this.getView().byId("shedTable").removeSelections(true);

                //establece que no hay ningún registro PARTNERSHIP seleccionado
                ospartnership.setProperty("/selectedRecordPath/", "");

                //establece que no hay ningún registro BROILERSFARM seleccionado
                osfarm.setProperty("/selectedRecordPath/", "");

                osfarm.setProperty("/records/", []);

                oscenter.setProperty("/records/", []);

                osshed.setProperty("/records/", []);

                //establece que no hay ningún registro BROILERSFARM seleccionado
                oscenter.setProperty("/selectedRecordPath/", "");

                //deshabilita el tab de la tabla de registros BROILERSFARM
                osfarm.setProperty("/settings/enabledTab", false);

                //deshabilita el tab de la tabla de registros CENTER
                oscenter.setProperty("/settings/enabledTab", false);

                //deshabilita el tab de la tabla de silos
                osshed.setProperty("/settings/enabledTab", false);

                //deshabilita la opción de crear un galpón
                osshed.setProperty("/new", false);

                //obtiene las sociedades financieras
                sap.ui.controller("technicalConfiguration.controller.ospartnership").onRead(that, util, ospartnership);

            } else if (ospartnership.getProperty("/selectedRecordPath/") !== "" &&
                osfarm.getProperty("/selectedRecordPath/") !== "" &&
                oscenter.getProperty("/selectedRecordPath/") !== "") {

                //habilita el tab de la tabla de granjas
                osfarm.setProperty("/settings/enabledTab", true);

                //habilita el tab de la tabla de núcleos
                oscenter.setProperty("/settings/enabledTab", true);

                //habilita el tab de la tabla de galpones
                osshed.setProperty("/settings/enabledTab", true);

                //habilita la opción de crear un galpón
                osshed.setProperty("/new", true);

                //obtiene los galpones
                this.onRead(that, util, ospartnership, osfarm, oscenter, osshed);
            }
        },

        /**
         * Funcion para detectar el cambio de iconos en el tabbar
         *
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onSelectChangedTab: function(oEvent){
            let ossehd = this.getView().getModel("OSSHED");
            let key = (oEvent.getParameters().selectedKey).split("--");
            if(key[1] !== "shedFilter"){
                ossehd.setProperty("/new", false);
            }else{
                ossehd.setProperty("/new", true);
            }
        },


        /**
         * Carga todos los estatus para los galpones, en el formulario.
         */
        onLoadSheds: function () {
            let osshed = this.getModel("OSSHED"),
                util = this.getModel("util"),
                serviceUrl = util.getProperty("/serviceUrl") + "/shed_status/";
            fetch(serviceUrl)
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                            return;
                        }

                        // Examine the text in the response
                        response.json().then(function (res) {
                            util.setProperty("/busy/", false);
                            osshed.setProperty("/statusRecords", res.data);
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error: ", err);
                });

        },

        /**
         *
         * Habilita el tabs de estatus de Galpones
         * @param {Event} oEvent Evento que llamó esta función
         */
        onNewShow: function (oEvent) {
            let oView = this.getView();
            var osshed = this.getView().getModel("OSSHED");
            osshed.setProperty("/settings2/enabledTab", true);
            oView.byId("tabBar").setSelectedKey("edu");
        },

        /**
         * Coincidencia de ruta para acceder a la creación de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onCreateMatched: function (oEvent) {
            //resetea y habilita los campos del formulario para su edición
            this._resetRecordValues();
            this._editRecordValues(true);
            // this._visibility();
            this.onLoadSheds();
        },

        /**
         * Ajusta la vista para visualizar los datos de un registro
         */
        onView: function () {
            this._viewOptions();
        },

        /**
         * Ajusta la vista para editar los datos de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onEdit: function (oEvent) {
            this._editOptions();
        },

        /**
         * verificar si una entrada de campo contiene un número utilizando una expresión regular que 
         * permite el formato Decimal
         * @param {char} o numero
         */
        validateFloatInput: function (o) {
            let input = o.getSource();
            let floatLength = 2;
            let intLength = 10;

            let value = input.getValue();
            let regex = new RegExp(`/^([0-9]{1,${intLength}})([.][0-9]{0,${floatLength}})?$/`);

            if (regex.test(value)) {
                input.setValueState("None");
                input.setValueStateText("");
                return true;
            } else {
                let pNumber = 0;
                let aux = value.split("").filter(char => {
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
                }).join("").split(".");

                value = aux[0].substring(0, intLength);

                if (aux[1] !== undefined) {
                    value += "." + aux[1].substring(0, floatLength);
                }

                if (value > 0) {
                    input.setValue(value);
                } else {
                    input.setValue("");
                }

                let origin = input.sId.split("--")[1];

                this.detectFailure(origin, value)
                return false;
            }
        },

        /**
         * verificar si una entrada de campo contiene un número utilizando una expresión regular que 
         * permite el formato Entero
         * @param {char} o numero
         */
        validateIntInput: function (o) {

            let input = o.getSource();
            let length = 7;
            let idinput = (input.sId).split("--");
            if (idinput[1] == "rotation_days_id")
                length = 3;

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

                if (value > 0) {
                    input.setValue(value);
                } else {
                    input.setValue("");
                }

                return false;
            }
        },

        /**
         * verificar si una entrada de campo contiene un número utilizando una expresión regular que 
         * permite el formato Entero
         * @param {char} o numero
         */
        validateOrderIntInput: function (o) {
            let input = o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);
            let osshed = this.getView().getModel("OSSHED");
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
                if (value !== undefined && value !== null && value !== "") {
                    value = parseInt(value);
                    let records = osshed.getProperty("/records"),
                        used = false;
                    records.forEach(itm => {
                        used = used || (itm._order === value)
                    });
                    if (used === true) {
                        osshed.setProperty("/order/state", "Error");
                        osshed.setProperty("/order/stateText", "El orden ingresado ya fue utilizado");
                        osshed.setProperty("/name/ok", false);
                        osshed.setProperty("/saveEnabled", false);

                    } else {
                        osshed.setProperty("/order/state", "Success");
                        osshed.setProperty("/order/stateText", "");
                        osshed.setProperty("/name/ok", true);
                        osshed.setProperty("/saveEnabled", true);
                    }
                } else {
                    osshed.setProperty("/order/state", "None");
                    osshed.setProperty("/order/stateText", "");
                    osshed.setProperty("/name/ok", true);
                    osshed.setProperty("/saveEnabled", true);
                }
                return false;
            }
        },


        /**
         *   valida de que cada campo al escribir su entrada, esta sea correcta. 
         *
         * @param {String} origin campo
         * @param {String} value  entrada.
         */
        detectFailure: function (origin, value) {
            let propertyTarget,
                osshed = this.getView().getModel("OSSHED"),
                state = "None",
                stateText = "";


            switch (origin) {
                case "stall_height_id":

                    propertyTarget = "/stall_height";

                    break;
                case "stall_width_id":

                    propertyTarget = "/stall_width";

                    break;
                case "capmin_id":

                    propertyTarget = "/capmin"

                    break;
                case "capmax_id":

                    propertyTarget = "/capmax"

                    break;
                case "rotation_days_id":

                    propertyTarget = "/rotation_days"

                    break;
            }

            if (value !== "" && value !== null && value !== undefined) {

                osshed.setProperty(propertyTarget + "/state", state);
                osshed.setProperty(propertyTarget + "/stateText", stateText);

            } else {

                osshed.setProperty(propertyTarget + "/state", "Error");
                osshed.setProperty(propertyTarget + "/stateText", "El campo no puede estar vacío");

            }


        },

        /**
         * Este evento se activa cuando el usuario cambia el valor del campo de búsqueda. se actualiza el binding de la lista
         * @param {Event} oEvent Evento que llamó esta función
         */
        onPartnershipSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("partnershipTable").getBinding("items");

            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                aFilters = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("code", sap.ui.model.FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
            }

            //se actualiza el binding de la lista
            binding.filter(aFilters);

        },

        /**
         * Este evento se activa cuando el usuario cambia el valor del campo de búsqueda. se actualiza el binding de la lista
         * @param {Event} oEvent Evento que llamó esta función
         */
        onFarmSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("farmTable").getBinding("items");
            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                aFilters = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("code", sap.ui.model.FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
            }

            //se actualiza el binding de la lista
            binding.filter(aFilters);

        },

        /**
         * Este evento se activa cuando el usuario cambia el valor del campo de búsqueda. se actualiza el binding de la lista
         * @param {Event} oEvent Evento que llamó esta función
         */
        onBroilersCenterSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("centerTable").getBinding("items");

            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                aFilters = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("code", sap.ui.model.FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
            }

            //se actualiza el binding de la lista
            binding.filter(aFilters);

        },

        /**
         * Este evento se activa cuando el usuario cambia el valor del campo de búsqueda. se actualiza el binding de la lista
         * @param {Event} oEvent Evento que llamó esta función
         */
        onShedSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("shedTable").getBinding("items");

            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                var filter1 = new sap.ui.model.Filter("code", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters = new sap.ui.model.Filter([filter1]);
            }

            //se actualiza el binding de la lista
            binding.filter(aFilters);

        },

        /**
         * Regresa a la vista principal de la entidad seleccionada actualmente
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNavBack: function (oEvent) {
            /** @type {JSONModel} OS Referencia al modelo "OS" */
            var util = this.getView().getModel("util");

            this._resetRecordValues();
            this.getRouter().navTo(util.getProperty("/selectedEntity"), {}, true);
        },

        /**
         * Selecciona un registro PARTNERSHIP y habilita la tabla de registros BROILERSFARM
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onSelectPartnershipRecord: function (oEvent) {
            /**
             * @type {Controller} that          Referencia a este controlador
             * @type {JSONModel} dummy          Referencia al modelo "dummy"
             * @type {JSONModel} PARTNERSHIP  Referencia al modelo "PARTNERSHIP"
             * @type {JSONModel} BROILERSFARM Referencia al modelo "BROILERSFARM"
             * @type {JSONModel} CENTER       Referencia al modelo "CENTER"
             */
            var that = this,
                util = this.getView().getModel("util"),
                ospartnership = this.getView().getModel("OSPARTNERSHIP"),
                osfarm = this.getView().getModel("OSFARM"),
                oscenter = this.getView().getModel("OSCENTER"),
                osshed = this.getView().getModel("OSSHED");

            //guarda la ruta del registro PARTNERSHIP que fue seleccionado
            ospartnership.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));

            osfarm.setProperty("/selectedRecordPath/", "");
            osfarm.setProperty("/selectedRecord/", {});

            oscenter.setProperty("/selectedRecordPath/", "");
            oscenter.setProperty("/selectedRecord/", {});

            //habilita el tab de la tabla de granjas
            osfarm.setProperty("/settings/enabledTab", true);

            //deshabilita el tab de la tabla de núcleos
            oscenter.setProperty("/settings/enabledTab", false);

            //deshabilita el tab de la tabla de galpones
            osshed.setProperty("/settings/enabledTab", false);

            //deshabilita la tab de galpones // DANGER
            osshed.setProperty("/settings/enabledTab2", false);

            //deshabilita la opción de crear un galpón
            osshed.setProperty("/new", false);

            //establece el tab de la tabla de granjas como el tab seleccionado
            this.getView().byId("tabBar").setSelectedKey(this.getView().getId() + "--" + "farmFilter");

            //borra cualquier selección que se haya hecho en la tabla de granjas
            this.getView().byId("farmTable").removeSelections(true);

            //obtiene las granjas
            sap.ui.controller("technicalConfiguration.controller.osfarm").onRead(that, util, ospartnership, osfarm);
        },

        /**
         * Selecciona un registro BROILERSFARM y habilita la tabla de registros CENTER
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onSelectFarmRecord: function (oEvent) {
            /**
             * @type {Controller} that          Referencia a este controlador
             * @type {JSONModel} dummy          Referencia al modelo "dummy"
             * @type {JSONModel} PARTNERSHIP  Referencia al modelo "PARTNERSHIP"
             * @type {JSONModel} BROILERSFARM Referencia al modelo "BROILERSFARM"
             * @type {JSONModel} CENTER       Referencia al modelo "CENTER"
             */
            var that = this,
                util = this.getView().getModel("util"),
                ospartnership = this.getView().getModel("OSPARTNERSHIP"),
                osfarm = this.getView().getModel("OSFARM"),
                oscenter = this.getView().getModel("OSCENTER"),
                osshed = this.getView().getModel("OSSHED");

            //guarda la ruta del registro BROILERSFARM que fue seleccionado
            osfarm.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            osfarm.setProperty("/selectedRecord/", osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/")));

            oscenter.setProperty("/selectedRecordPath/", "");
            oscenter.setProperty("/selectedRecord/", {});

            //habilita el tab de la tabla de registros CENTER
            oscenter.setProperty("/settings/enabledTab", true);

            //deshabilita el tab de la tabla de galpones
            osshed.setProperty("/settings/enabledTab", false);

            //deshabilita la opción de crear un galpón
            osshed.setProperty("/new", false);

            //establece el tab de la tabla CENTER como el tab seleccionado
            this.getView().byId(this.getView().getId() + "--" + "tabBar").setSelectedKey(this.getView().getId() + "--" + "centerFilter");

            //borra cualquier selección que se haya hecho en la tabla BROILERSFARM
            this.getView().byId("centerTable").removeSelections(true);

            //obtiene los registros de CENTER
            sap.ui.controller("technicalConfiguration.controller.oscenter").onRead(that, util, ospartnership, osfarm, oscenter);
        },

        /**
         * Selecciona un registro BROILERSFARM y habilita la tabla de registros CENTER
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onSelectCenterRecord: function (oEvent) {
            /**
             * @type {Controller} that          Referencia a este controlador
             * @type {JSONModel} dummy          Referencia al modelo "dummy"
             * @type {JSONModel} PARTNERSHIP  Referencia al modelo "PARTNERSHIP"
             * @type {JSONModel} BROILERSFARM Referencia al modelo "BROILERSFARM"
             * @type {JSONModel} CENTER       Referencia al modelo "CENTER"
             */
            var that = this,
                util = this.getView().getModel("util"),
                ospartnership = this.getView().getModel("OSPARTNERSHIP"),
                osfarm = this.getView().getModel("OSFARM"),
                oscenter = this.getView().getModel("OSCENTER"),
                osshed = this.getView().getModel("OSSHED");

            //guarda la ruta del registro BROILERSFARM que fue seleccionado
            oscenter.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);

            oscenter.setProperty("/selectedRecord/", oscenter.getProperty(oscenter.getProperty("/selectedRecordPath/")));

            //habilita el tab de la tabla de galpones
            osshed.setProperty("/settings/enabledTab", true);

            //deshabilita la opción de crear un galpón
            osshed.setProperty("/new", true);

            //establece el tab de la tabla de galpones como el tab seleccionado
            this.getView().byId(this.getView().getId() + "--" + "tabBar").setSelectedKey(this.getView().getId() + "--" + "shedFilter");

            //borra cualquier selección que se haya hecho en la tabla BROILERSFARM
            this.getView().byId("shedTable").removeSelections(true);

            //obtiene los galpones
            this.onRead(that, util, ospartnership, osfarm, oscenter, osshed);
        },

        /**
         * Obtiene todos los registros de BROILERSFARM, dado un cliente y una sociedad
         * @param  {Controller} that          Referencia al controlador que llama esta función
         * @param  {JSONModel} dummy          Referencia al modelo "dummy"
         * @param  {JSONModel} PARTNERSHIP  Referencia al modelo "PARTNERSHIP"
         * @param  {JSONModel} BROILERSFARM Referencia al modelo "BROILERSFARM"
         * @param  {JSONModel} CENTER       Referencia al modelo "CENTER"
         */
        onRead: function (that, util, ospartnership, osfarm, oscenter, osshed) {
            /** @type {Object} settings opciones de la llamada a la función ajax */
            var serviceUrl = util.getProperty("/serviceUrl");
            var center_id = oscenter.getProperty(oscenter.getProperty("/selectedRecordPath/") + "/center_id");

            if (osfarm.getProperty("/selectedRecord/farm_type_id") === 2) {
                osfarm.setProperty("/reproduccion", true);

            } else {
                osfarm.setProperty("/reproduccion", false);
            }

            var settings = {
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "center_id": center_id,
                }),
                url: serviceUrl + "/shed/findShedByCenter3/",
                dataType: "json",
                async: true,
                success: function (res) {

                    res.data.forEach(element => {
                        element.old = element.order;
                    });
                    osshed.setProperty("/records", res.data);
                },
                error: function (err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                }
            };
            util.setProperty("/busy/", true);
            //borra los registros de galpones que estén almacenados actualmente
            osshed.setProperty("/records/", []);
            //realiza la llamada ajax
            $.ajax(settings);
        },

        /**
         * Navega a la vista para crear un nuevo registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNewRecord: function (oEvent) {
            let osfarm = this.getModel("OSFARM");
            this.getRouter().navTo("osshed_Create", {}, true);
        },

        /**
         * Resetea todos los valores existentes en el formulario del registro
         */
        _resetRecordValues: function () {
            /** @type {JSONModel} SHED Referencia al modelo "SHED" */
            var osshed = this.getView().getModel("OSSHED");

            osshed.setProperty("/name/value", "");
            osshed.setProperty("/name/state", "None");
            osshed.setProperty("/name/stateText", "");

            osshed.setProperty("/stall_height/value", "");
            osshed.setProperty("/stall_height/state", "None");
            osshed.setProperty("/stall_height/stateText", "");

            osshed.setProperty("/stall_width/value", "");
            osshed.setProperty("/stall_width/state", "None");
            osshed.setProperty("/stall_width/stateText", "");

            osshed.setProperty("/order/value", "");
            osshed.setProperty("/order/state", "None");
            osshed.setProperty("/order/stateText", "");

            osshed.setProperty("/status/value", 0);
            osshed.setProperty("/status/state", "None");
            osshed.setProperty("/status/stateText", "");

            osshed.setProperty("/capmin/value", "0");
            osshed.setProperty("/capmin/state", "None");
            osshed.setProperty("/capmin/stateText", "");

            osshed.setProperty("/capmax/value", "0");
            osshed.setProperty("/capmax/state", "None");
            osshed.setProperty("/capmax/stateText", "");

            osshed.setProperty("/rotation_days/value", "0");
            osshed.setProperty("/rotation_days/state", "None");
            osshed.setProperty("/rotation_days/stateText", "");

            osshed.setProperty("/disable/value", false);
            osshed.setProperty("/rehousing/value", false);
        },

        /**
         * Habilita/deshabilita la edición de los datos de un registro
         * @param  {Boolean} edit "true" si habilita la edición, "false" si la deshabilita
         */
        _editRecordValues: function (edit) {
            /** @type {JSONModel} SILO Referencia al modelo "SHED" */
            var osshed = this.getView().getModel("OSSHED");

            osshed.setProperty("/name/editable", edit);
            osshed.setProperty("/stall_height/editable", edit);
            osshed.setProperty("/stall_width/editable", edit);
            osshed.setProperty("/order/editable", edit);
            osshed.setProperty("/status/editable", edit);
            osshed.setProperty("/breed", edit);
            osshed.setProperty("/capmin/editable", edit);
            osshed.setProperty("/capmax/editable", edit);
            osshed.setProperty("/rotation_days/editable", edit);
            osshed.setProperty("/quantity_nests/editable", edit);
            osshed.setProperty("/quantity_cages/editable", edit);
            osshed.setProperty("/rotation_days/editable", edit);
            osshed.setProperty("/disable/editable", edit);
            osshed.setProperty("/rehousing/editable", edit);
            osshed.setProperty("/name/required", edit);
            osshed.setProperty("/stall_height/required", edit);
            osshed.setProperty("/stall_width/required", edit);
            osshed.setProperty("/order/required", edit);
            osshed.setProperty("/status/required", edit);
            osshed.setProperty("/capmin/required", edit);
            osshed.setProperty("/capmax/required", edit);
            osshed.setProperty("/rotation_days/required", edit);
            osshed.setProperty("/quantity_nests/required", edit);
            osshed.setProperty("/quantity_cages/required", edit);
        },

        /**
         * Habilita/deshabilita la edición de los datos de un registro
         * @param  {Boolean} edit "true" si habilita la edición, "false" si la deshabilita
         */
        _editRecordValues2: function (edit) {
            /** @type {JSONModel} SILO Referencia al modelo "SHED" */
            var osshed = this.getView().getModel("OSSHED"),
                selected = osshed.getProperty(osshed.getProperty("/selectedRecordPath/"));

            if (selected.statusshed_id !== 1) {
                osshed.setProperty("/rehousing/editable", edit);
                osshed.setProperty("/rehousing/required", edit);
            } else {
                osshed.setProperty("/stall_height/editable", edit);
                osshed.setProperty("/stall_width/editable", edit);
                osshed.setProperty("/order/editable", edit);
                osshed.setProperty("/breed", edit);
                osshed.setProperty("/capmin/editable", edit);
                osshed.setProperty("/capmax/editable", edit);
                osshed.setProperty("/rotation_days/editable", edit);
                osshed.setProperty("/quantity_nests/editable", edit);
                osshed.setProperty("/quantity_cages/editable", edit);
                osshed.setProperty("/rotation_days/editable", edit);
                osshed.setProperty("/disable/editable", edit);
                osshed.setProperty("/rehousing/editable", edit);

                osshed.setProperty("/name/required", edit);
                osshed.setProperty("/stall_height/required", edit);
                osshed.setProperty("/stall_width/required", edit);
                osshed.setProperty("/order/required", edit);
                osshed.setProperty("/capmin/required", edit);
                osshed.setProperty("/capmax/required", edit);
                osshed.setProperty("/rotation_days/required", edit);
                osshed.setProperty("/quantity_nests/required", edit);
                osshed.setProperty("/quantity_cages/required", edit);
            }
        },

        /**
         * Valida la correctitud de los datos existentes en el formulario del registro
         * @return {Boolean} Devuelve "true" si los datos son correctos, y "false" si son incorrectos
         */
        _validRecord: function () {
            /**
             * @type {JSONModel} SHED Referencia al modelo "SHED"
             * @type {Boolean} flag             "true" si los datos son válidos, "false" si no lo son
             */
            var osshed = this.getView().getModel("OSSHED"),
                flag = true;

            if (osshed.getProperty("/name/state") === "Error") {
                flag = false;
            } else {
                if (osshed.getProperty("/name/value") === "") {
                    flag = false;
                    osshed.setProperty("/name/state", "Error");
                    osshed.setProperty("/name/stateText", "el campo código no puede estar vacío");
                } else {
                    osshed.setProperty("/name/state", "None");
                    osshed.setProperty("/name/stateText", "");
                }

            }

            if (osshed.getProperty("/rehousing/value") === undefined || osshed.getProperty("/rehousing/value") === null || osshed.getProperty("/rehousing/value") === "") {
                flag = false;
                osshed.setProperty("/rehousing/state", "Error");
                osshed.setProperty("/rehousing/stateText", "Indique si el galpón puede ser realojado");
            } else {
                osshed.setProperty("/rehousing/state", "None");
                osshed.setProperty("/rehousing/stateText", "");
            }

            if (osshed.getProperty("/stall_height/value") === "") {
                flag = false;
                osshed.setProperty("/stall_height/state", "Error");
                osshed.setProperty("/stall_height/stateText", "introduzca el largo");
            } else if (osshed.getProperty("/stall_height/value") <= 0) {
                flag = false;
                osshed.setProperty("/stall_height/state", "Error");
                osshed.setProperty("/stall_height/stateText", "introduzca un valor válido");
            } else {
                osshed.setProperty("/stall_height/state", "None");
                osshed.setProperty("/stall_height/stateText", "");
            }

            if (osshed.getProperty("/stall_width/value") === "") {
                flag = false;
                osshed.setProperty("/stall_width/state", "Error");
                osshed.setProperty("/stall_width/stateText", "introduzca el ancho");
            } else if (osshed.getProperty("/stall_width/value") <= 0) {
                flag = false;
                osshed.setProperty("/stall_width/state", "Error");
                osshed.setProperty("/stall_width/stateText", "introduzca un valor válido");
            } else {
                osshed.setProperty("/stall_width/state", "None");
                osshed.setProperty("/stall_width/stateText", "");
            }

            if (osshed.getProperty("/order/value") === "") {
                flag = false;
                osshed.setProperty("/order/state", "Error");
                osshed.setProperty("/order/stateText", "introduzca el Orden de Alojamiento");
            } else if (osshed.getProperty("/order/value") <= 0) {
                flag = false;
                osshed.setProperty("/order/state", "Error");
                osshed.setProperty("/order/stateText", "introduzca un valor válido");
            } else {
                osshed.setProperty("/order/state", "None");
                osshed.setProperty("/order/stateText", "");
            }

            if (osshed.getProperty("/status/value") === "" || osshed.getProperty("/status/value") == null) {
                flag = false;
                osshed.setProperty("/status/state", "Error");
                osshed.setProperty("/status/stateText", "Seleccione un estatus");
            } else {
                osshed.setProperty("/status/state", "None");
                osshed.setProperty("/status/stateText", "");
            }

            if (osshed.getProperty("/capmin/value") === "" || osshed.getProperty("/capmin/value") === "0") {
                flag = false;
                osshed.setProperty("/capmin/state", "Error");
                osshed.setProperty("/capmin/stateText", (osshed.getProperty("/capmin/value") === "") ? this.getI18n().getText("enter.FIELD") : this.getI18n().getText("enter.FIELD.greaterThan"));
            } else {
                osshed.setProperty("/capmin/state", "None");
                osshed.setProperty("/capmin/stateText", "");
            }

            if (osshed.getProperty("/capmax/value") === "" || osshed.getProperty("/capmax/value") === "0") {
                flag = false;
                osshed.setProperty("/capmax/state", "Error");
                osshed.setProperty("/capmax/stateText", (osshed.getProperty("/capmax/value") === "") ? this.getI18n().getText("enter.FIELD") : this.getI18n().getText("enter.FIELD.greaterThan"));
            } else {
                osshed.setProperty("/capmax/state", "None");
                osshed.setProperty("/capmax/stateText", "");
            }

            if (osshed.getProperty("/rotation_days/value") === "" || osshed.getProperty("/rotation_days/value") === "0") {
                flag = false;
                osshed.setProperty("/rotation_days/state", "Error");
                osshed.setProperty("/rotation_days/stateText", (osshed.getProperty("/rotation_days/value") === "") ? this.getI18n().getText("enter.FIELD") : this.getI18n().getText("enter.FIELD.greaterThan"));
            } else {
                osshed.setProperty("/rotation_days/state", "None");
                osshed.setProperty("/rotation_days/stateText", "");
            }

            return flag;
        },

        /**
         * Valida la correctitud de los datos existentes en el formulario del registro
         * @return {Boolean} Devuelve "true" si los datos son correctos, y "false" si son incorrectos
         */
        _validRecord2: function () {
            /**
             * @type {JSONModel} SHED Referencia al modelo "SHED"
             * @type {Boolean} flag             "true" si los datos son válidos, "false" si no lo son
             */
            var osshed = this.getView().getModel("OSSHED"),
                flag = true;

            if (osshed.getProperty("/stall_height/value") === "") {
                flag = false;
                osshed.setProperty("/stall_height/state", "Error");
                osshed.setProperty("/stall_height/stateText", "introduzca el largo");
            } else if (osshed.getProperty("/stall_height/value") <= 0) {
                flag = false;
                osshed.setProperty("/stall_height/state", "Error");
                osshed.setProperty("/stall_height/stateText", "introduzca un valor válido");
            }else if (osshed.getProperty("/stall_height/state") == "Error") {
                flag = false;
            } else {
                osshed.setProperty("/stall_height/state", "None");
                osshed.setProperty("/stall_height/stateText", "");
            }

            if (osshed.getProperty("/stall_width/value") === "") {
                flag = false;
                osshed.setProperty("/stall_width/state", "Error");
                osshed.setProperty("/stall_width/stateText", "introduzca el ancho");
            } else if (osshed.getProperty("/stall_width/value") <= 0) {
                flag = false;
                osshed.setProperty("/stall_width/state", "Error");
                osshed.setProperty("/stall_width/stateText", "introduzca un valor válido");
            }  else if (osshed.getProperty("/stall_width/state") == "Error") {
                flag = false;
            } else {
                osshed.setProperty("/stall_width/state", "None");
                osshed.setProperty("/stall_width/stateText", "");
            }

            if (osshed.getProperty("/capmin/value") === "" || osshed.getProperty("/capmin/value") === "0") {
                flag = false;
                osshed.setProperty("/capmin/state", "Error");
                osshed.setProperty("/capmin/stateText", (osshed.getProperty("/capmin/value") === "") ? this.getI18n().getText("enter.FIELD") : this.getI18n().getText("enter.FIELD.greaterThan"));
            } else if (osshed.getProperty("/capmin/state") == "Error") {
                flag = false;
            }  else {
                osshed.setProperty("/capmin/state", "None");
                osshed.setProperty("/capmin/stateText", "");
            }

            if (osshed.getProperty("/capmax/value") === "" || osshed.getProperty("/capmax/value") === "0") {
                flag = false;
                osshed.setProperty("/capmax/state", "Error");
                osshed.setProperty("/capmax/stateText", (osshed.getProperty("/capmax/value") === "") ? this.getI18n().getText("enter.FIELD") : this.getI18n().getText("enter.FIELD.greaterThan"));
            }else if (osshed.getProperty("/capmax/state") == "Error") {
                flag = false;
            } else {
                osshed.setProperty("/capmax/state", "None");
                osshed.setProperty("/capmax/stateText", "");
            }

            if (osshed.getProperty("/rotation_days/value") === "" || osshed.getProperty("/rotation_days/value") === "0") {
                flag = false;
                osshed.setProperty("/rotation_days/state", "Error");
                osshed.setProperty("/rotation_days/stateText", (osshed.getProperty("/rotation_days/value") === "") ? this.getI18n().getText("enter.FIELD") : this.getI18n().getText("enter.FIELD.greaterThan"));
            }else if (osshed.getProperty("/rotation_days/state") == "Error") {
                flag = false;
            }  else {
                osshed.setProperty("/rotation_days/state", "None");
                osshed.setProperty("/rotation_days/stateText", "");
            }

            if (osshed.getProperty("/order/value") === "" || osshed.getProperty("/order/value") === "0") {
                flag = false;
                osshed.setProperty("/order/state", "Error");
                osshed.setProperty("/order/stateText", (osshed.getProperty("/order/value") === "") ? this.getI18n().getText("enter.FIELD") : this.getI18n().getText("enter.FIELD.greaterThan"));
            }else if (osshed.getProperty("/order/state") == "Error") {
                flag = false;
            }  else {
                osshed.setProperty("/order/state", "None");
                osshed.setProperty("/order/stateText", "");
            }
            return flag;
        },

        /**
         * Este evento se activa cuando se selecciona un estatus en el formulario.
         */
        onStatus: function (oEvent) {
            var campo = oEvent.getParameters().selectedItem.mProperties.key;
            var osshed = this.getView().getModel("OSSHED");

            osshed.setProperty("/status/value", campo);
            osshed.setProperty("/status/state", "None");
            osshed.setProperty("/status/stateText", "");
        },

        /**
         * Solicita al servicio correspondiente crear un registro CENTER,
         * dado un cliente, una sociedad y una granja
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCreate: function (oEvent) {
            //Si el registro que se desea crear es válido
            if (this._validRecord()) {
                /**
                 * @type {JSONModel} CENTER Referencia al modelo "CENTER"
                 * @type {JSONModel} dummy    Referencia al modelo "dummy"
                 * @type {Controller} that    Referencia a este controlador
                 * @type {Object} json        Objeto a enviar en la solicitud
                 * @type {Object} settings    Opciones de la llamada a la función ajax
                 */
                var ospartnership = this.getView().getModel("OSPARTNERSHIP"),
                    osfarm = this.getView().getModel("OSFARM"),
                    oscenter = this.getView().getModel("OSCENTER"),
                    osshed = this.getView().getModel("OSSHED"),
                    util = this.getView().getModel("util"),
                    that = this,
                    serviceUrl = util.getProperty("/serviceUrl"),
                    json = {
                        "client_id": 1,
                        "partnership_id": ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/") + "/partnership_id"),
                        "farm_id": osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/farm_id"),
                        "center_id": oscenter.getProperty(oscenter.getProperty("/selectedRecordPath/") + "/center_id"),
                        "code": osshed.getProperty("/name/value"),
                        "stall_height": (osshed.getProperty("/stall_height/value")).toString(),
                        "stall_width": (osshed.getProperty("/stall_width/value")).toString(),
                        "order": (osshed.getProperty("/order/value")),
                        "status_id": (osshed.getProperty("/status/value")),
                        "capacity_min": (osshed.getProperty("/capmin/value")),
                        "capacity_max": (osshed.getProperty("/capmax/value")),
                        "rotation_days": (osshed.getProperty("/rotation_days/value")),
                        "os_disable": (osshed.getProperty("/disable/value")),
                        "rehousing": (osshed.getProperty("/rehousing/value"))
                    },

                    settings = {
                        async: true,
                        url: serviceUrl + "/shed",
                        method: "POST",
                        data: JSON.stringify(json),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (res) {
                            util.setProperty("/busy/", false);
                            that._resetRecordValues();
                            that.onToast(that.getI18n().getText("OS.recordCreated"));
                            that.getRouter().navTo("osshed", {}, true /*no history*/ );
                        },
                        error: function (err) {
                            that.onToast("Error de comunicación");
                            console.log("Read failed ", err);
                        }
                    };
                util.setProperty("/busy/", true);
                //realiza la llamada ajax
                $.ajax(settings);
            }
        },

        /**
         * Coincidencia de ruta para acceder a los detalles de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onRecordMatched: function (oEvent) {
            //Establece las opciones disponibles al visualizar el registro
            this._viewOptions();
            this.onLoadSheds();
        },

        /**
         * Cambia las opciones de visualización disponibles en la vista de detalles de un registro
         */
        _viewOptions: function () {
            /**
             * @type {JSONModel} OS       Referencia al modelo "OS"
             * @type {JSONModel} SHED Referencia al modelo "SHED"
             */
            var util = this.getView().getModel("util"),
                osshed = this.getView().getModel("OSSHED");

            if (util.getProperty("/selectedEntity/") === "osshed") {
                osshed.setProperty("/modify/", true);
                osshed.setProperty("/delete/", true);
            } else {
                osshed.setProperty("/modify/", false);
                osshed.setProperty("/delete/", false);
            }

            osshed.setProperty("/save/", false);
            osshed.setProperty("/cancel/", false);

            this._editRecordValues(false);
        },

        /**
         * Ajusta la vista para visualizar los datos de un registro
         */
        onView: function () {
            this._viewOptions();
        },

        /**
         * Cambia las opciones de edición disponibles en la vista de detalles de un registro
         */
        _editOptions: function () {
            /** @type {JSONModel} SHED Referencia al modelo "SHED" */
            var osshed = this.getView().getModel("OSSHED");

            osshed.setProperty("/modify/", false);
            osshed.setProperty("/delete/", false);
            osshed.setProperty("/save/", true);
            osshed.setProperty("/cancel/", true);

            this._editRecordValues2(true);
        },

        /**
         * Ajusta la vista para editar los datos de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onEdit: function (oEvent) {
            this._editOptions();
        },

        /**
         * Verifica si el registro seleccionado tiene algún cambio con respecto a sus valores originales
         * @return {Boolean} Devuelve "true" el registro cambió, y "false" si no cambió
         */
        _recordChanged2: function () {
            /**
             * @type {JSONModel} SHED Referencia al modelo "SHED"
             * @type {Boolean} flag       "true" si el registro cambió, "false" si no cambió
             */
            var osshed = this.getView().getModel("OSSHED"),
                mdbreed = this.getView().getModel("MDBREED"),
                flag = false,
                selected = osshed.getProperty(osshed.getProperty("/selectedRecordPath/"));
            if (selected.statusshed_id !== 1) {
                if (osshed.getProperty("/rehousing/value") !==
                    osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/rehousing")) {
                    flag = true;
                }
            } else {

                if (osshed.getProperty("/stall_height/value").toString() !==
                    osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/stall_height").toString()) {
                    flag = true;
                }

                if (osshed.getProperty("/order/value") !==
                    osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/order")) {
                    flag = true;
                }

                
                if (osshed.getProperty("/stall_width/value").toString() !==
                    osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/stall_width").toString()) {
                    flag = true;
                }

                if (osshed.getProperty("/capmin/value") !==
                    osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/capmin")) {
                    flag = true;
                }

                if (osshed.getProperty("/capmax/value").toString() !==
                    osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/capmax").toString()) {
                    flag = true;
                }

                if (osshed.getProperty("/rotation_days/value") !==
                    osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/rotation_days")) {
                    flag = true;
                }
                if (osshed.getProperty("/disable/value") !==
                    osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/os_disable")) {
                    flag = true;
                }

                if (osshed.getProperty("/rehousing/value") !==
                    osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/rehousing")) {
                    flag = true;
                }
            }

            if (!flag) this.onToast("No se detectaron cambios");

            return flag;
        },

        /**
         * Cancela la edición de un galpón
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCancelEdit: function (oEvent) {
            /** @type {JSONModel} SHED Referencia al modelo SHED */
            let osshed = this.getView().getModel("OSSHED"),
                copy = osshed.getProperty("/copy");

            osshed.setProperty("/name/value", copy.code);
            osshed.setProperty("/stall_height/value", parseFloat(copy.stall_height));
            osshed.setProperty("/stall_width/value", parseFloat(copy.stall_width));
            osshed.setProperty("/order/value", copy.order);
            osshed.setProperty("/status/value", copy.status);
            osshed.setProperty("/environment/value", copy.environment_id);
            osshed.setProperty("/disable/value", copy.os_disable);
            osshed.setProperty("/rehousing/value", copy.rehousing);
            osshed.setProperty("/capmin/value", copy.capmin);
            osshed.setProperty("/capmax/value", copy.capmax);
            osshed.setProperty("/rotation_days/value", copy.rotation_days);
            this.onView();
        },

        /**
         * Solicita al servicio correspondiente actualizar un silo
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onUpdate: function (oEvent) {
            /**
             * Si el registro que se quiere actualizar es válido y hubo algún cambio
             * con respecto a sus datos originales
             */
            if (this._validRecord2() && this._recordChanged2()) {

                /**
                 * @type {JSONModel} CENTER Referencia al modelo "CENTER"
                 * @type {JSONModel} dummy    Referencia al modelo "dummy"
                 * @type {Controller} that    Referencia a este controlador
                 */
                var osshed = this.getView().getModel("OSSHED"),
                    util = this.getView().getModel("util"),
                    that = this,
                    serviceUrl = util.getProperty("/serviceUrl");

                /** @type {Object} settings Opciones de la llamada a la función ajax */
                var settings = {
                    async: true,
                    url: serviceUrl + "/shed",
                    method: "PUT",
                    data: JSON.stringify({
                        "shed_id": osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/shed_id"),
                        "code": osshed.getProperty("/name/value"),
                        "stall_height": osshed.getProperty("/stall_height/value"),
                        "stall_width": osshed.getProperty("/stall_width/value"),
                        "order": osshed.getProperty("/order/value"),
                        "status_id": osshed.getProperty("/status/value"),
                        "capacity_max": osshed.getProperty("/capmax/value"),
                        "capacity_min": osshed.getProperty("/capmin/value"),
                        "rotation_days": osshed.getProperty("/rotation_days/value"),
                        "os_disable": osshed.getProperty("/disable/value"),
                        "rehousing": osshed.getProperty("/rehousing/value")
                    }),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function (res) {
                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that._viewOptions();
                        that.onToast(that.getI18n().getText("OS.recordUpdated"));
                        that.getRouter().navTo("osshed", {}, true /*no history*/ );
                    },
                    error: function (err) {
                        that.onToast("Error de comunicación");
                        console.log("Read failed ", err);
                    }
                };
                util.setProperty("/busy/", true);
                $.ajax(settings);
            }
        },

        /**
         *
         * Muestra los galpones disponibles y no disponibles
         * @param  {Event} oEvent Evento que llamó esta función
         */
        consult: function (oEvent) {
            var oView = this.getView();
            var oDialog = oView.byId("galpon");
            var osshed = this.getView().getModel("OSSHED");
            let sheds = osshed.getProperty("/records");
            let dateSheds = "";
            let aux = [];
            let flag;


            if (!$.isEmptyObject(oDialog.getValue())) {


                for (let i = 0; i < sheds.length; i++) {
                    if (sheds[i].avaliable_date != null) {
                        dateSheds = this.formatDate(sheds[i].avaliable_date);


                        flag = this.compareDate(dateSheds, oDialog.getValue());


                        if (!flag) {
                            sheds[i].statusshed_id = "No Disponible";
                            aux.push(sheds[i]);
                        } else {
                            sheds[i].statusshed_id = "Disponible";
                            aux.push(sheds[i]);
                        }
                    } else
                    if (sheds[i].avaliable_date == null) {
                        sheds[i].statusshed_id = "Disponible";
                        aux.push(sheds[i]);
                    }

                }
                osshed.setProperty("/asd", aux);
            }


        },

        /**
         * Verifica si la empresa esta en uso en otra entidad
         * @param {JSON} shed_id
         */
        onVerifyIsUsed: async function (shed_id) {
            let ret;

            const response = await fetch("/shed/isBeingUsed", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    shed_id: shed_id
                })
            });

            if (response.status !== 200 && response.status !== 409) {
                console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                return;
            }
            if (response.status === 200) {
                const res = await response.json();
                ret = res.data.used;
            }
            return ret;

        },
        /**
         * Formateo de Fecha 
         *
         * @param {String} date Formato UTC
         * @returns {String} date formato DD-MM-YYYY
         */
        formatDate: function (date) {
            if (date !== null) {
                let c = "-"; //caracter separatos
                date = new Date(date.toString());
                // if((typeof date.getMonth === 'function'))
                if (!isNaN(date.getFullYear())) {
                    date = (((date.getDate() < 10) ? "0" + date.getDate() : date.getDate()) + c +
                        ((date.getMonth() + 1 < 10) ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + c +
                        date.getFullYear());
                } else
                    date = null;
            }
            return (date);
        },

        /**
         * Compara de qie la fecha sea mayor o menor
         *
         * @param {String} date1
         * @param {String} date2
         * @returns {boolean} true si es mayor, false si es menor
         */
        compareDate: function (date1, date2) {
            let nDate = date1.split("-"),
                nDate2 = date2.split("-");
            let flag;
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

        /**
         * Levanta el Dialogo que muestra la confirmacion del Eliminar un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onConfirmDelete: async function (oEvent) {

            var oBundle = this.getView().getModel("i18n").getResourceBundle(),
                confirmation = oBundle.getText("confirmation"),
                that = this,
                util = this.getView().getModel("util"),
                osshed = this.getView().getModel("OSSHED");


            let shed_id = osshed.getProperty(osshed.getProperty("/selectedRecordPath/") + "/shed_id");
            let cond = await this.onVerifyIsUsed(shed_id);
            if (cond) {
                var dialog = new Dialog({
                    title: "Información",
                    type: "Message",
                    state: "Warning",
                    content: new Text({
                        text: "No se puede eliminar el Galpón, porque está siendo utilizado."
                    }),
                    beginButton: new Button({
                        text: "OK",
                        press: function () {
                            dialog.close();
                            that.confirmDeleteDlg.close();
                        }
                    }),
                    afterClose: function () {
                        dialog.destroy();
                    }
                });

                dialog.open();
            } else {
                var dialog = new Dialog({
                    title: confirmation,
                    type: "Message",
                    content: new sap.m.Text({
                        text: "¿Desea eliminar este galpón?"
                    }),

                    beginButton: new Button({
                        text: "Si",
                        press: function () {
                            var json = {
                                    "shed_id": shed_id
                                },
                                serviceUrl = util.getProperty("/serviceUrl"),
                                settings = {
                                    async: true,
                                    url: serviceUrl + "/shed",
                                    method: "DELETE",
                                    data: JSON.stringify(json),
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    success: function (res) {
                                        util.setProperty("/busy/", false);
                                        that.onToast(that.getI18n().getText("OS.recordDeleted"));
                                        that.getRouter().navTo("osshed", {}, true);
                                        dialog.close();
                                    },
                                    error: function (err) {
                                        that.onToast("Error de comunicación");
                                        console.log("Read failed", err);
                                    }
                                };
                            util.setProperty("/busy/", true);
                            //Realiza la llamada ajax
                            $.ajax(settings);
                        }
                    }),
                    endButton: new Button({
                        text: "No",
                        press: function () {
                            dialog.close();
                            dialog.destroy();
                        }
                    })
                });

                dialog.open();
            }

        },

        /**
         * Toma el valor de la entrada por la interacción del usuario: cada pulsación de tecla, eliminar, pegar, etc.
         * @param {Event} oEvent Evento que llamó esta función
         */
        changeName: function (oEvent) {
            let input = oEvent.getSource(),
                nwCode = input.getValue().trim();
            input.setValue(input.getValue().trim());
            let osshed = this.getView().getModel("OSSHED");

            if (nwCode.length > 20) {
                osshed.setProperty("/name/state", "Error");
                osshed.setProperty("/name/stateText", "Excede el limite de caracteres permitido (20)");
                osshed.setProperty("/name/ok", false);
            } else if (nwCode === "" || nwCode === null || nwCode === undefined) {

                osshed.setProperty("/name/state", "Error");
                osshed.setProperty("/name/stateText", "El campo no puede estar vacío");

            } else {
                let records = osshed.getProperty("/records"),
                    used = false;

                records.forEach(itm => {
                    used = used || ((itm.code).toLowerCase() === nwCode.toLowerCase())
                });
                if (used === true) {
                    osshed.setProperty("/name/state", "Error");
                    osshed.setProperty("/name/stateText", "El código ingresado ya fue utilizado");
                } else {
                    osshed.setProperty("/name/state", "None");
                    osshed.setProperty("/name/stateText", "");
                    osshed.setProperty("/name/ok", true);
                }

            }
        }
    });
});