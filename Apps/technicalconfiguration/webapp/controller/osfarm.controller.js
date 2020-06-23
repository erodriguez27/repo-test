sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/model/Filter"
], function (BaseController, JSONModel, Dialog, Button, Text, Filter) {
    "use strict";

    return BaseController.extend("technicalConfiguration.controller.osfarm", {

        /**
         * Se llama a la inicialización de la Vista
         */
        onInit: function () {
            //ruta para la vista principal
            this.getOwnerComponent().getRouter().getRoute("osfarm").attachPatternMatched(this._onRouteMatched, this);
            //ruta para la vista de detalles de un registro
            this.getOwnerComponent().getRouter().getRoute("osfarm_Record").attachPatternMatched(this._onRecordMatched, this);
            //ruta para la vista de creación de un registro
            this.getOwnerComponent().getRouter().getRoute("osfarm_Create").attachPatternMatched(this._onCreateMatched, this);
        },
        /**
         *
         * Limpio Search
         * @param  {Event} oEvent Evento que llamó esta función
         */
        changeTabBar: function (oEvent) {
            this.getView().byId("partnershipSearchField").setValue("");
            this.getView().byId("partnershipTable").getBinding("items").filter(null)

            this.getView().byId("farmsearchid").setValue("");
            this.getView().byId("farmTable").getBinding("items").filter(null)
        },

        /**
         * Coincidencia de ruta para acceder a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onRouteMatched: function (oEvent) {
            /**
             * @type {Controller} that         Referencia a este controlador
             * @type {JSONModel} util         Referencia al modelo "util"
             * @type {JSONModel} OS            Referencia al modelo "OS"
             * @type {JSONModel} MDSTAGE        Referencia al modelo "MdSTAGE"
             */

            var that = this,
                util = this.getView().getModel("util"),
                ospartnership = this.getView().getModel("OSPARTNERSHIP"),
                osfarm = this.getView().getModel("OSFARM");

            ospartnership.setProperty("/itemType", "Inactive");
            osfarm.setProperty("/itemType", "DetailAndActive");

            //dependiendo del dispositivo, establece la propiedad "phone"
            util.setProperty("/phone/",
                this.getOwnerComponent().getContentDensityClass() === "sapUiSizeCozy");

            ospartnership.setProperty("/settings/tableMode", "SingleSelect");
            osfarm.setProperty("/settings/tableMode", "None");

            //si la entidad seleccionada antes de acceder a esta vista es diferente a BROILERSFARM
            if (util.getProperty("/selectedEntity") !== "osfarm") {

                //establece BROILERSFARM como la entidad seleccionada
                util.setProperty("/selectedEntity", "osfarm");

                //limpio selectedRecord
                ospartnership.setProperty("/selectedRecord", "");

                //establece el tab de la tabla PARTNERSHIP como el tab seleccionado
                // this.getView().byId("tabBar").setSelectedKey(this.getView().getId() + "--" + "partnershipFilter");
                sap.ui.getCore().byId(this.createId("tabBar")).setSelectedKey("partnershipFilter");

                //borra cualquier selección que se haya hecho en la tabla PARTNERSHIP
                this.getView().byId("partnershipTable").removeSelections(true);

                osfarm.setProperty("/records/", []);

                //establece que no hay ningún registro PARTNERSHIP seleccionado
                ospartnership.setProperty("/selectedRecordPath/", "");

                //deshabilita el tab de la tabla de registros BROILERSFARM
                osfarm.setProperty("/settings/enabledTab", false);

                //deshabilita la opción de crear un registro BROILERSFARM
                osfarm.setProperty("/new", false);

                //obtiene los registros de PARTNERSHIP
                sap.ui.controller("technicalConfiguration.controller.ospartnership").onRead(that, util, ospartnership);

            } else if (ospartnership.getProperty("/selectedRecordPath/") !== "") {

                //habilita el tab de la tabla de registros BROILERSFARM
                osfarm.setProperty("/settings/enabledTab", true);

                //habilita la opción de crear un registro BROILERSFARM
                osfarm.setProperty("/new", true);

                //obtiene los registros de BROILERSFARM
                this.onRead(that, util, ospartnership, osfarm);
            }
        },

        /**
         * Funcion para detectar el cambio de iconos en el tabbar
         *
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onSelectChangedTab: function (oEvent) {
            let osfarm = this.getView().getModel("OSFARM");
            if (oEvent.getParameters().selectedKey === "partnershipFilter") {
                osfarm.setProperty("/new", false);
            } else {
                osfarm.setProperty("/new", true);
            }
        },

        /**
         * Obtiene todos los registros de MDSTAGE
         * @param  {Controller} that         Referencia al controlador que llama esta función
         * @param  {JSONModel} util         Referencia al modelo "util"
         * @param  {JSONModel} ospartnership Referencia al modelo "ospartnership"
         * @param  {JSONModel} osfarm Referencia al modelo "osfarm"
         */
        onRead: function (that, util, ospartnership, osfarm) {

            var serviceUrl = util.getProperty("/serviceUrl");
            var partnership_id = ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/") + "/partnership_id");
            var allFarmsTypes = [];
            var settings = {
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "partnership_id": partnership_id,
                }),
                url: serviceUrl + "/farm/findFarmByPartnetship",
                dataType: "json",
                async: true,
                success: function (res) {
                    util.setProperty("/busy/", false);
                    res.data.forEach(element => {
                        element.old = element.order;
                    });
                    osfarm.setProperty("/records/", res.data);

                    if (res.types.length > 0) {
                        allFarmsTypes.push({
                            "farmtype": "Todos"
                        });
                        res.types.forEach(element => {
                            allFarmsTypes.push({
                                "farmtype": element.farmtype
                            });
                        });
                        osfarm.setProperty("/farmtypes/", allFarmsTypes);
                        osfarm.setProperty("/All/", osfarm.getProperty("/records"));
                        console.log(osfarm)
                    }
                },
                error: function (err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                    //that.onConnectionError();
                }
            };
            util.setProperty("/busy/", true);
            //borra los registros OSPARTNERSHIP que estén almacenados actualmente
            osfarm.setProperty("/records/", []);
            //realiza la llamada ajax
            $.ajax(settings);
        },

        /**
         * Coincidencia de ruta para acceder a la creación de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onCreateMatched: function (oEvent) {
            this._resetRecordValues();
            this._editRecordValues(true);
            this._editRecordRequired(true);
            this.getFarmType(true);
            this.getIncubatorPlant(true);
        },

        /**
         * Resetea todos los valores existentes en el formulario del registro
         */
        _resetRecordValues: function () {
            /**
             * @type {JSONModel} MDSTAGE Referencia al modelo "MDSTAGE"
             */
            var osfarm = this.getView().getModel("OSFARM");

            osfarm.setProperty("/name/editable", true);
            osfarm.setProperty("/name/value", "");
            osfarm.setProperty("/name/state", "None");
            osfarm.setProperty("/name/stateText", "");

            osfarm.setProperty("/code/editable", true);
            osfarm.setProperty("/code/value", "");
            osfarm.setProperty("/code/state", "None");
            osfarm.setProperty("/code/stateText", "");

            osfarm.setProperty("/order/editable", true);
            osfarm.setProperty("/order/value", "");
            osfarm.setProperty("/order/state", "None");
            osfarm.setProperty("/order/stateText", "");

            osfarm.setProperty("/farm_type/editable", true);
            osfarm.setProperty("/farm_type/value", "");
            osfarm.setProperty("/farm_type/state", "None");
            osfarm.setProperty("/farm_type/stateText", "");

            osfarm.setProperty("/type_id/value", "");

            osfarm.setProperty("/disable/value", false);
        },

        /**
         * Habilita/deshabilita la edición de los datos de un registro OSFARM
         * @param  {Boolean} edit "true" si habilita la edición, "false" si la deshabilita
         */
        _editRecordValues: function (edit, f) {
            var osfarm = this.getView().getModel("OSFARM");

            if (f === "cancelEdit") {

                osfarm.setProperty("/disable/value", osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/disable"));
                osfarm.setProperty("/type_id/value", osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/farm_type_id"));
            }

            osfarm.setProperty("/name/editable", edit);
            osfarm.setProperty("/code/editable", edit);
            osfarm.setProperty("/order/editable", edit);
            osfarm.setProperty("/farm_type/editable", edit);
            osfarm.setProperty("/disable/editable", edit);
            //osfarm.setProperty("/incubator_plant/editable", edit);
        },

        /**
         * Habilita/deshabilita la edición de los datos de un registro OSFARM
         * @param  {Boolean} edit "true" si habilita la edición, "false" si la deshabilita
         */
        _editRecordValues2: function (edit) {
            var osfarm = this.getView().getModel("OSFARM");
            osfarm.setProperty("/name/editable", edit);
            osfarm.setProperty("/code/editable", edit);
            osfarm.setProperty("/order/editable", edit);
            osfarm.setProperty("/farm_type/editable", edit);
            osfarm.setProperty("/disable/editable", edit);
            //osfarm.setProperty("/incubator_plant/editable", edit);

        },

        /**
         * Se define un campo como obligatorio o no, de un registro OSFARM
         * @param  {Boolean} edit "true" si es campo obligatorio, "false" si no es obligatorio
         */
        _editRecordRequired: function (edit) {
            var osfarm = this.getView().getModel("OSFARM");
            osfarm.setProperty("/name/required", edit);
            osfarm.setProperty("/code/required", edit);
            osfarm.setProperty("/order/required", edit);
        },

        /**
         * Navega a la vista para crear un nuevo registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNewRecord: function (oEvent) {
            this.getRouter().navTo("osfarm_Create", {}, false /*create history*/ );
        },

        /**
         * Cancela la creación de un registro MDSTAGE, y regresa a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCancelCreate: function (oEvent) {
            this._resetRecordValues();
            this.onNavBack(oEvent);
        },

        /**
         * Regresa a la vista principal de la entidad seleccionada actualmente
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNavBack: function (oEvent) {
            var util = this.getView().getModel("util");
            let osfarm = this.getModel("OSFARM");
            osfarm.setProperty("/type_id/value", null);
            this._resetRecordValues();
            this.getRouter().navTo(util.getProperty("/selectedEntity"), {}, false /*create history*/ );
        },

        /**
         * Solicita al servicio correspondiente crear un registro MDSTAGE
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCreate: function (oEvent) {
            //Si el registro que se desea crear es válido
            if (this._validRecord()) {
                var ospartnership = this.getView().getModel("OSPARTNERSHIP"),
                    osfarm = this.getView().getModel("OSFARM"),
                    util = this.getView().getModel("util"),
                    that = this,
                    serviceUrl = util.getProperty("/serviceUrl");
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "partnership_id": ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/") + "/partnership_id"),
                        "code": osfarm.getProperty("/code/value"),
                        "name": osfarm.getProperty("/name/value"),
                        "farm_type_id": osfarm.getProperty("/type_id/value"),
                        "order": osfarm.getProperty("/order/value"),
                        "os_disable": osfarm.getProperty("/disable/value")
                    }),
                    url: serviceUrl + "/farm/",
                    dataType: "json",
                    async: true,
                    success: function (data) {
                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that.onToast(that.getI18n().getText("OS.recordCreated"));
                        that.getRouter().navTo("osfarm", {}, true /*no history*/ );

                    },
                    error: function (error) {
                        that.onToast("Error: " + error.responseText);
                        console.log("Read failed ");
                    }
                });
            }
        },

        /**
         * Valida la correctitud de los datos existentes en el formulario del registro
         * @return {Boolean} Devuelve "true" si los datos son correctos, y "false" si son incorrectos
         */
        _validRecord: function () {
            /**
             * @type {JSONModel} MDSTAGE Referencia al modelo "MDSTAGE"
             * @type {Boolean} flag "true" si los datos son válidos, "false" si no lo son
             */
            var osfarm = this.getView().getModel("OSFARM"),
                flag = true;

            if (osfarm.getProperty("/name/value") === "") {
                flag = false;
                osfarm.setProperty("/name/state", "Error");
                osfarm.setProperty("/name/stateText", "el campo nombre no puede estar vacío");
            } else {
                osfarm.setProperty("/name/state", "None");
                osfarm.setProperty("/name/stateText", "");
            }

            if (osfarm.getProperty("/code/value") === "") {
                flag = false;
                osfarm.setProperty("/code/state", "Error");
                osfarm.setProperty("/code/stateText", "el campo código no puede estar vacío");
            } else {
                osfarm.setProperty("/code/state", "None");
                osfarm.setProperty("/code/stateText", "");
            }

            if (osfarm.getProperty("/order/value") === "") {
                flag = false;
                osfarm.setProperty("/order/state", "Error");
                osfarm.setProperty("/order/stateText", "el campo código no puede estar vacío");
            } else {
                osfarm.setProperty("/order/state", "None");
                osfarm.setProperty("/order/stateText", "");
            }

            if (osfarm.getProperty("/type_id/value") === "") {
                flag = false;
                osfarm.setProperty("/farm_type/state", "Error");
                osfarm.setProperty("/farm_type/stateText", "Indique tipo de granja");
            } else {
                osfarm.setProperty("/farm_type/state", "None");
                osfarm.setProperty("/farm_type/stateText", "");
            }

            return flag;
        },
        /**
         * Valida la correctitud de los datos existentes en el formulario del registro
         * @return {Boolean} Devuelve "true" si los datos son correctos, y "false" si son incorrectos
         */
        _validRecord2: function () {
            /**
             * @type {JSONModel} MDSTAGE Referencia al modelo "MDSTAGE"
             * @type {Boolean} flag "true" si los datos son válidos, "false" si no lo son
             */
            var osfarm = this.getView().getModel("OSFARM"),
                flag = true;

            if (osfarm.getProperty("/name/value") === "") {
                flag = false;
                osfarm.setProperty("/name/state", "Error");
                osfarm.setProperty("/name/stateText", "el campo nombre no puede estar vacío");
            } else if (osfarm.getProperty("/name/state") == "Error") {
                flag = false;
            } else {
                osfarm.setProperty("/name/state", "None");
                osfarm.setProperty("/name/stateText", "");
            }

            if (osfarm.getProperty("/code/value") === "") {
                flag = false;
                osfarm.setProperty("/code/state", "Error");
                osfarm.setProperty("/code/stateText", "el campo código no puede estar vacío");
            } else if (osfarm.getProperty("/code/state") == "Error") {
                flag = false;
            } else {
                osfarm.setProperty("/code/state", "None");
                osfarm.setProperty("/code/stateText", "");
            }

            if (osfarm.getProperty("/order/value") === "") {
                flag = false;
                osfarm.setProperty("/order/state", "Error");
                osfarm.setProperty("/order/stateText", "el campo código no puede estar vacío");
            } else if (osfarm.getProperty("/order/state") == "Error") {
                flag = false;
            } else {
                osfarm.setProperty("/order/state", "None");
                osfarm.setProperty("/order/stateText", "");
            }

            return flag;
        },

        /**
         * Coincidencia de ruta para acceder a los detalles de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onRecordMatched: function (oEvent) {
            this._viewOptions();
        },

        /**
         * Cambia las opciones de visualización disponibles en la vista de detalles de un registro
         */
        _viewOptions: function (f) {
            var osfarm = this.getView().getModel("OSFARM");
            osfarm.setProperty("/save/", false);
            osfarm.setProperty("/cancel/", false);
            osfarm.setProperty("/modify/", true);
            osfarm.setProperty("/delete/", true);
            this.getFarmType(false);
            this.getIncubatorPlant(false);
            this._editRecordValues(false, f);
            this._editRecordRequired(false);
        },
        /**
         * Ajusta la vista para editar los datos de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onEdit: function (oEvent) {

            var osfarm = this.getView().getModel("OSFARM");
            osfarm.setProperty("/save/", true);
            osfarm.setProperty("/cancel/", true);
            osfarm.setProperty("/modify/", false);
            osfarm.setProperty("/delete/", false);
            // this._editRecordRequired(true);
            this._editRecordValues2(true);
        },

        /**
         * Cancela la edición de un registro MDSTAGE
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCancelEdit: function (oEvent) {
            /** @type {JSONModel} MDSTAGE  Referencia al modelo MDSTAGE */

            this.onView('cancelEdit');
        },
        /**
         * Ajusta la vista para visualizar los datos de un registro
         */
        onView: function (f) {
            this._viewOptions(f);
        },
        /**
         * Solicita al servicio correspondiente actualizar un registro MDSTAGE
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onUpdate: function (oEvent) {
            /**
             * Si el registro que se quiere actualizar es válido y hubo algún cambio
             * con respecto a sus datos originales
             */
            if (this._validRecord2() && this._recordChanged2()) {
                /**
                 * @type {JSONModel} MDSTAGE       Referencia al modelo "MDSTAGE"
                 * @type {JSONModel} util         Referencia al modelo "util"
                 * @type {Controller} that         Referencia a este controlador
                 */
                var osfarm = this.getView().getModel("OSFARM");
                var util = this.getView().getModel("util");
                var that = this;
                var serviceUrl = util.getProperty("/serviceUrl");

                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "farm_id": osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/farm_id"),
                        "name": osfarm.getProperty("/name/value"),
                        "code": osfarm.getProperty("/code/value"),
                        "farm_type_id": osfarm.getProperty("/type_id/value"),
                        "order": osfarm.getProperty("/order/value"),
                        "os_disable": osfarm.getProperty("/disable/value")
                    }),
                    url: serviceUrl + "/farm/",
                    dataType: "json",
                    async: true,
                    success: function (data) {

                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that._viewOptions();
                        that.onToast(that.getI18n().getText("OS.recordUpdated"));
                        that.getRouter().navTo("osfarm", {}, true /*no history*/ );

                    },
                    error: function (request, status, error) {
                        that.onToast("Error de comunicación");
                        console.log("Read failed");
                    }
                });
            }
        },

        /**
         * Carga las etapas de granja
         */
        getFarmType: function (isNew) {
            const util = this.getModel("util");
            let osfarm = this.getModel("OSFARM");
            $.ajax({
                url: util.getProperty("/serviceUrl") + "/farm_type",
                method: "GET",
                async: true,
                dataType: "json",
                success: function (res) {
                    osfarm.setProperty("/farm_type/record", res.data);
                    if (res.data[0].farm_type_id === 1) {
                        osfarm.setProperty("/incubator_plant/editable", true);
                    } else {
                        osfarm.setProperty("/incubator_plant/editable", false);
                    }
                },
                error: function (err) {
                    console.log("err: ", err);
                }
            });
        },
        /**
         *
         * Carga las plantas incubadoras de granja
         */
        getIncubatorPlant: function (isNew) {
            const util = this.getModel("util");
            let osfarm = this.getModel("OSFARM"),
                ospartnership = this.getModel("OSPARTNERSHIP"),
                partnership_id = ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/") + "/partnership_id");
            $.ajax({
                url: util.getProperty("/serviceUrl") + "/incubator_plant/findIncPlantByPartnetship",
                method: "POST",
                async: true,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                    "partnership_id": partnership_id
                }),
                success: function (res) {
                    osfarm.setProperty("/incubator_plant/record", res.data);
                    if (res.data.length > 0 && isNew) {
                        osfarm.setProperty("/incubator_plant/value", res.data[0].incubator_plant_id);
                    }

                },
                error: function (err) {
                    console.log("err: ", err);
                }
            });
        },

        /**
         * Verifica si el registro seleccionado tiene algún cambio con respecto a sus valores originales
         * @return {Boolean} Devuelve "true" el registro cambió, y "false" si no cambió
         */
        _recordChanged: function () {
            /**
             * @type {JSONModel} MDSTAGE         Referencia al modelo "MDSTAGE"
             * @type {Boolean} flag            "true" si el registro cambió, "false" si no cambió
             */
            var osfarm = this.getView().getModel("OSFARM"),
                flag = false;

            if (osfarm.getProperty("/name/value") !== osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/name")) {
                flag = true;
            }

            if (osfarm.getProperty("/code/value") !== osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/code")) {
                flag = true;
            }

            if (osfarm.getProperty("/order/value") !== osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/order")) {
                flag = true;
            }

            if (osfarm.getProperty("/farm_type/record") !== osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/record")) {
                flag = true;
            }

            if (!flag) this.onToast("No se detectaron cambios");

            return flag;
        },
        /**
         * Verifica si el registro seleccionado tiene algún cambio con respecto a sus valores originales
         * @return {Boolean} Devuelve "true" el registro cambió, y "false" si no cambió
         */
        _recordChanged2: function () {
            /**
             * @type {JSONModel} MDSTAGE         Referencia al modelo "MDSTAGE"
             * @type {Boolean} flag            "true" si el registro cambió, "false" si no cambió
             */
            var osfarm = this.getView().getModel("OSFARM"),
                flag = false;

            if (osfarm.getProperty("/name/value") !== osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/name")) {
                flag = true;
            }

            if (osfarm.getProperty("/code/value") !== osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/code")) {
                flag = true;
            }

            if (osfarm.getProperty("/order/value") !== osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/order")) {
                flag = true;
            }

            if (osfarm.getProperty("/farm_type/record") !== osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/record")) {
                flag = true;
            }

            if (!flag) this.onToast("No se detectaron cambios");

            return flag;
        },

        /**
         * Este evento se activa cuando el usuario cambia el valor del campo de búsqueda. se actualiza el binding de la lista
         * @param {Event} oEvent Evento que llamó esta función
         */
        onPartnershipSearch: function (oEvent) {
            var sQuery = this.getView().byId("partnershipSearchField").getValue().toString(),
                binding = this.getView().byId("partnershipTable").getBinding("items");

            if (sQuery) {
                let code = new Filter("code", sap.ui.model.FilterOperator.Contains, sQuery);
                let name = new Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                let description = new Filter("description", sap.ui.model.FilterOperator.Contains, sQuery);

                var oFilter = new sap.ui.model.Filter({
                    aFilters: [code, name, description],
                    and: false
                });
            }

            binding.filter(oFilter);

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
         * Verifica si la granja esta en uso en otra entidad
         * @param {JSON} farm_id
         */
        onVerifyIsUsed: async function (farm_id) {
            let ret;

            const response = await fetch("/farm/isBeingUsed", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    farm_id: farm_id
                })
            });

            if (response.status !== 200 && response.status !== 409) {
                console.log("Looks like there was a problem. status code: " + response.status);
                return;
            }
            if (response.status === 200) {
                const res = await response.json();

                ret = res.data.used;
            }

            return ret;

        },

        /**
         * Levanta el Dialogo que muestra la confirmacion del Eliminar un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onConfirmDelete: async function (oEvent) {

            let that = this,
                util = this.getView().getModel("util"),
                osfarm = this.getView().getModel("OSFARM"),
                farm_id = osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/farm_id");
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var confirmation = oBundle.getText("confirmation");



            let cond = await this.onVerifyIsUsed(farm_id);
            if (cond) {
                var dialog = new Dialog({
                    title: "Información",
                    type: "Message",
                    state: "Warning",
                    content: new Text({
                        text: "No se puede eliminar la Granja, porque está siendo utilizada."
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
            } else {
                util.setProperty("/busy/", true);
                var serviceUrl = util.getProperty("/serviceUrl");
                var dialog = new Dialog({
                    title: confirmation,
                    type: "Message",
                    content: new sap.m.Text({
                        text: "¿Desea eliminar esta granja?"
                    }),

                    beginButton: new Button({
                        text: "Si",
                        press: function () {
                            $.ajax({
                                type: "DELETE",
                                contentType: "application/json",
                                data: JSON.stringify({
                                    "farm_id": farm_id
                                }),
                                url: serviceUrl + "/farm/",
                                dataType: "json",
                                async: true,
                                success: function (data) {

                                    util.setProperty("/busy/", false);
                                    that.getRouter().navTo("osfarm", {}, true);
                                    dialog.close();
                                },
                                error: function (request, status, error) {
                                    that.onToast("Error de comunicación");
                                    console.log("Read failed");
                                }
                            });
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
         * Seleccion en la tabla partnership
         * @param {Event} oEvent Evento que llamó esta función
         */
        onSelectPartnershipRecord: function (oEvent) {
            this.changeTabBar();
            var that = this,
                util = this.getView().getModel("util"),
                ospartnership = this.getView().getModel("OSPARTNERSHIP"),
                osfarm = this.getView().getModel("OSFARM");

            //guarda la ruta del registro PARTNERSHIP que fue seleccionado
            ospartnership.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));

            //habilita el tab de la tabla de registros BROILERSFARM
            osfarm.setProperty("/settings/enabledTab", true);

            //habilita la opción de crear un registro BROILERSFARM
            osfarm.setProperty("/new", true);

            //establece el tab de la tabla BROILERSFARM como el tab seleccionado
            this.getView().byId("tabBar").setSelectedKey(this.getView().getId() + "--" + "farmFilter");

            //obtiene los registros de BROILERSFARM
            this.onRead(that, util, ospartnership, osfarm);
        },

        /**
         * Este evento se activa cuando se selecciona la etapa de la granja.
         */
        updateFarmTypeModel: function () {
            let osfarm = this.getView().getModel("OSFARM"),
                farm_type_model = this.getView().byId("farm_type_model").getSelectedKey();

            osfarm.setProperty("/type_id/value", farm_type_model);

            let records = osfarm.getProperty("/records"),
                used = false,
                value = this.getView().byId("Order_input").getValue();
            records.forEach(itm => {
                if (farm_type_model) {
                    used = used || (itm._order == value) && itm.farm_type_id == farm_type_model;
                }
            });
            if (used === true) {
                osfarm.setProperty("/order/state", "Error");
                osfarm.setProperty("/order/stateText", "El orden ingresado ya fue utilizado");
                osfarm.setProperty("/name/ok", false);
                osfarm.setProperty("/code/ok", false);
                osfarm.setProperty("/saveEnabled", false);

            }

            if (farm_type_model == 1) {
                osfarm.setProperty("/incubator_plant/editable", true);
            } else {
                osfarm.setProperty("/incubator_plant/editable", false);
            }

            osfarm.setProperty("/farm_type/state", "None");
            osfarm.setProperty("/farm_type/stateText", "");


        },

        /**
         * Toma el valor de la entrada por la interacción del usuario: cada pulsación de tecla, eliminar, pegar, etc.
         * @param {Event} oEvent Evento que llamó esta función
         */
        changeName: function (oEvent) {
            let input = oEvent.getSource(),
                nwCode = input.getValue();
            let osfarm = this.getView().getModel("OSFARM");
            let excepcion = osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/name");

            if (nwCode.length > 45) {
                osfarm.setProperty("/name/state", "Error");
                osfarm.setProperty("/name/stateText", "Excede el limite de caracteres permitido (45)");
                osfarm.setProperty("/name/ok", false);
            } else {
                this.checkChange(input.getValue().toString(), excepcion.toString(), "/name", "changeName");
            }
        },
        /**
         * Toma el valor de la entrada por la interacción del usuario: cada pulsación de tecla, eliminar, pegar, etc.
         * @param {Event} oEvent Evento que llamó esta función
         */
        changeCode: function (oEvent) {
            let input = oEvent.getSource(),
                nwCode = input.getValue().trim();
            input.setValue(input.getValue().trim());
            let osfarm = this.getView().getModel("OSFARM");
            let excepcion = osfarm.getProperty(osfarm.getProperty("/selectedRecordPath/") + "/code");

            if (nwCode.length > 20) {
                osfarm.setProperty("/code/state", "Error");
                osfarm.setProperty("/code/stateText", "Excede el limite de caracteres permitido (20)");
                osfarm.setProperty("/code/ok", false);
            } else {
                this.checkChange(input.getValue().toString(), excepcion.toString(), "/code", "changeCode");
            }
        },

        /**
         * verificar si una entrada de campo contiene un número utilizando una expresión regular que 
         * permite el formato Entero
         * @param {char} o numero
         */
        validateIntInput: function (o) {
            let input = o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);
            let osfarm = this.getModel("OSFARM");
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
                    let records = osfarm.getProperty("/records"),
                        used = false,
                        farm_type_id = this.getView().byId("farm_type_model").getSelectedKey();
                    records.forEach(itm => {
                        if (value) {
                            used = used || (itm._order === value) && itm.farm_type_id == farm_type_id;
                        }
                    });
                    if (used === true) {
                        osfarm.setProperty("/order/state", "Error");
                        osfarm.setProperty("/order/stateText", "El orden ingresado ya fue utilizado");
                        osfarm.setProperty("/name/ok", false);
                        osfarm.setProperty("/code/ok", false);
                        osfarm.setProperty("/saveEnabled", false);

                    } else {
                        osfarm.setProperty("/order/state", "Success");
                        osfarm.setProperty("/order/stateText", "");
                        osfarm.setProperty("/name/ok", true);
                        osfarm.setProperty("/code/ok", true);
                        osfarm.setProperty("/saveEnabled", true);
                    }
                } else {
                    osfarm.setProperty("/order/state", "None");
                    osfarm.setProperty("/order/stateText", "");
                    osfarm.setProperty("/name/ok", true);
                    osfarm.setProperty("/code/ok", true);
                    osfarm.setProperty("/saveEnabled", true);
                }
                return false;
            }
        },

        /**
         * Valida si el registro de entrada es unico 
         * @param {String} name valor de entrada
         * @param {String} excepcion excepcion del modelo 
         * @param {String} field campo donde se encuentra el focus
         * @param {String} funct funcion a validar
         */
        checkChange: async function (name, excepcion, field, funct) {
            let util = this.getModel("util");
            let mdModel = this.getModel("OSFARM");
            if (name == "" || name === null) {
                mdModel.setProperty(field + "/state", "None");
                mdModel.setProperty(field + "/stateText", "");
                mdModel.setProperty(field + "/ok", false);
            } else {
                let registers = mdModel.getProperty("/records");
                let found;

                if (funct === "changeCode") {
                    found = await registers.find(element => ((element.code).toLowerCase() === name.toLowerCase() && element.code !== excepcion));
                } else {
                    found = await registers.find(element => ((element.name).toLowerCase() === name.toLowerCase() && element.name !== excepcion));
                }

                if (found === undefined) {
                    mdModel.setProperty(field + "/state", "Success");
                    mdModel.setProperty(field + "/stateText", "");
                    mdModel.setProperty(field + "/ok", true);
                } else {
                    mdModel.setProperty(field + "/state", "Error");
                    mdModel.setProperty(field + "/stateText", (funct === "changeCode") ? "código ya existente" : "nombre ya existente");
                    mdModel.setProperty(field + "/ok", false);
                }
            }
        }
    });
});