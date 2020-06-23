sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button"
], function (BaseController, JSONModel, Dialog, Button) {
    "use strict";

    return BaseController.extend("technicalConfiguration.controller.osIncubatorPlant", {

        /**
         * Se llama a la inicialización de la Vista
         */
        onInit: function () {
            //ruta para la vista principal
            this.getOwnerComponent().getRouter().getRoute("osIncubatorPlant").attachPatternMatched(this._onRouteMatched, this);
            //ruta para la vista de detalles de un registro
            this.getOwnerComponent().getRouter().getRoute("osIncubatorPlant_Record").attachPatternMatched(this._onRecordMatched, this);
            //ruta para la vista de creación de un registro
            this.getOwnerComponent().getRouter().getRoute("osIncubatorPlant_Create").attachPatternMatched(this._onCreateMatched, this);
        },

        /**
         *
         * Limpio Search
         * @param  {Event} oEvent Evento que llamó esta función
         */
        changeTabBar: function (oEvent) {
            this.getView().byId("partnershipSearchField").setValue("");
            this.getView().byId("partnershipTable").getBinding("items").filter(null)

            this.getView().byId("searchIncPlantId").setValue("");
            this.getView().byId("incubatorPlantTable").getBinding("items").filter(null)

            let osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");

            let key = (oEvent.getParameters().selectedKey).split("--");
            if (key[0] !== "kincubatorPlantFilter") {
                osincubatorplant.setProperty("/new", false);
            } else {
                osincubatorplant.setProperty("/new", true);
            }
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
                osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");

            ospartnership.setProperty("/itemType", "Inactive");
            osincubatorplant.setProperty("/itemType", "DetailAndActive");

            //dependiendo del dispositivo, establece la propiedad "phone"
            util.setProperty("/phone/",
                this.getOwnerComponent().getContentDensityClass() === "sapUiSizeCozy");

            ospartnership.setProperty("/settings/tableMode", "SingleSelect");
            osincubatorplant.setProperty("/settings/tableMode", "None");

            //si la entidad seleccionada antes de acceder a esta vista es diferente a incubatorPlant
            if (util.getProperty("/selectedEntity") !== "osIncubatorPlant") {

                //establece OSINCUBATORPLANT como la entidad seleccionada
                util.setProperty("/selectedEntity", "osIncubatorPlant");

                //limpio selectedRecord
                ospartnership.setProperty("/selectedRecord", "");

                //establece el tab de la tabla PARTNERSHIP como el tab seleccionado
                this.getView().byId("tabBar").setSelectedKey("kpartnershipFilter");

                //borra cualquier selección que se haya hecho en la tabla PARTNERSHIP
                this.getView().byId("partnershipTable").removeSelections(true);

                osincubatorplant.setProperty("/records/", []);

                //establece que no hay ningún registro PARTNERSHIP seleccionado
                ospartnership.setProperty("/selectedRecordPath/", "");

                //deshabilita el tab de la tabla de registros osincubatorplant
                osincubatorplant.setProperty("/settings/enabledTab", false);

                //deshabilita la opción de crear un registro osincubatorplant
                osincubatorplant.setProperty("/new", false);

                //obtiene los registros de PARTNERSHIP
                sap.ui.controller("technicalConfiguration.controller.ospartnership").onRead(that, util, ospartnership);

            } else if (ospartnership.getProperty("/selectedRecordPath/") !== "") {

                //habilita el tab de la tabla de registros OSINCUBATORPLANT
                osincubatorplant.setProperty("/settings/enabledTab", true);

                //habilita la opción de crear un registro OSINCUBATORPLANT
                osincubatorplant.setProperty("/new", true);

                //obtiene los registros de BROILERSFARM
                this.onRead(that, util, ospartnership, osincubatorplant);
            }
        },

        /**
         * Obtiene todos los registros de OSINCUBATORPLANT
         * @param  {Controller} that   Referencia al controlador que llama esta función
         * @param  {JSONModel} util    Referencia al modelo "util"
         * @param  {JSONModel} OSINCUBATORPLANT Referencia al modelo "OSINCUBATORPLANT"
         */
        onRead: function (that, util, ospartnership, osincubatorplant) {
            /** @type {Object} settings opciones de la llamada a la función ajax */
            var serviceUrl = util.getProperty("/serviceUrl");
            var partnership_id = ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/") + "/partnership_id");
            var settings = {
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "partnership_id": partnership_id,
                }),
                url: serviceUrl + "/incubator_plant/findIncPlantByPartnetship",
                dataType: "json",
                async: true,
                success: function (res) {
                    util.setProperty("/busy/", false);
                    osincubatorplant.setProperty("/records/", res.data);
                },
                error: function (err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                }
            };
            util.setProperty("/busy/", true);
            //borra los registros OSINCUBATORPLANT que estén almacenados actualmente
            osincubatorplant.setProperty("/records/", []);
            //realiza la llamada ajax
            $.ajax(settings);
        },

        /**
         * Seleccion en la tabla partnership
         * @param {Event} oEvent Evento que llamó esta función
         */
        onSelectPartnershipRecord: function (oEvent) {

            var that = this,
                util = this.getView().getModel("util"),
                ospartnership = this.getView().getModel("OSPARTNERSHIP"),
                osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");

            //guarda la ruta del registro PARTNERSHIP que fue seleccionado
            ospartnership.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);
            ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));

            //habilita el tab de la tabla de registros BROILERSFARM
            osincubatorplant.setProperty("/settings/enabledTab", true);

            //habilita la opción de crear un registro BROILERSFARM
            osincubatorplant.setProperty("/new", true);

            //establece el tab de la tabla incubatorPlant como el tab seleccionado
            this.getView().byId("tabBar").setSelectedKey("kincubatorPlantFilter");

            //obtiene los registros de incubatorPlant
            this.onRead(that, util, ospartnership, osincubatorplant);

        },

        /**
         * verificar si una entrada de campo contiene un número utilizando una expresión regular que 
         * permite el formato Entero
         * @param {char} o numero
         */
        validateIntInput: function (o) {
            let input = o.getSource();
            let length = 3;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
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
         *   valida de que cada campo al escribir su entrada, esta sea correcta. 
         *
         * @param {String} origin campo
         * @param {String} value  entrada.
         */
        detectFailure: function (origin, value) {
            let propertyTarget = (origin === "inputMinStorage") ? "/min_storage" : "/max_storage",
                osincubatorplant = this.getView().getModel("OSINCUBATORPLANT"),
                state = "None",
                stateText = "";

            osincubatorplant.setProperty("/min_storage/state", "None");
            osincubatorplant.setProperty("/min_storage/stateText", "");
            osincubatorplant.setProperty("/max_storage/state", "None");
            osincubatorplant.setProperty("/max_storage/stateText", "");
            if (origin === "inputMinStorage" && osincubatorplant.getProperty("/max_storage/value") !== "") {
                state = (parseInt(value) > parseInt(osincubatorplant.getProperty("/max_storage/value"))) ? "Error" : "None";
                stateText = (parseInt(value) > parseInt(osincubatorplant.getProperty("/max_storage/value"))) ? "Debe ser menor o igual que el máximo de almacenamiento" : "";
            }
            if (origin === "inputMaxStorage" && osincubatorplant.getProperty("/min_storage/value") !== "") {
                state = (parseInt(value) < parseInt(osincubatorplant.getProperty("/min_storage/value"))) ? "Error" : "None";
                stateText = (parseInt(value) < parseInt(osincubatorplant.getProperty("/min_storage/value"))) ? "Debe ser mayor o igual que el mínimo de almacenamiento" : "";
            }

            osincubatorplant.setProperty(propertyTarget + "/state", state);
            osincubatorplant.setProperty(propertyTarget + "/stateText", stateText);
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
        onIncubatorPlantSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("incubatorPlantTable").getBinding("items");

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
         * Navega a la vista para crear un nuevo registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNewRecord: function (oEvent) {
            this.getView().byId("partnershipSearchField").setValue("");
            this.getView().byId("partnershipTable").getBinding("items").filter(null)

            this.getView().byId("searchIncPlantId").setValue("");
            this.getView().byId("incubatorPlantTable").getBinding("items").filter(null)
            this.getRouter().navTo("osIncubatorPlant_Create", {}, false /*create history*/ );
        },

        /**
         * Coincidencia de ruta para acceder a la creación de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onCreateMatched: function (oEvent) {
            this._resetRecordValues();
            this._editRecordValues(true);
            this._editRecordRequired(true);
            // this.getView().byId("searchIncPlantId").setValue(""); 
            // this.getView().byId("incubatorPlantTable").getBinding("items").filter(null)
        },

        /**
         * Resetea todos los valores existentes en el formulario del registro
         */
        _resetRecordValues: function () {
            /**
             * @type {JSONModel} OSINCUBATORPLANT Referencia al modelo "OSINCUBATORPLANT"
             */
            var osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");

            osincubatorplant.setProperty("/name/editable", true);
            osincubatorplant.setProperty("/name/value", "");
            osincubatorplant.setProperty("/name/state", "None");
            osincubatorplant.setProperty("/name/stateText", "");

            osincubatorplant.setProperty("/code/editable", true);
            osincubatorplant.setProperty("/code/value", "");
            osincubatorplant.setProperty("/code/state", "None");
            osincubatorplant.setProperty("/code/stateText", "");

            osincubatorplant.setProperty("/description/editable", true);
            osincubatorplant.setProperty("/description/value", "");
            osincubatorplant.setProperty("/description/state", "None");
            osincubatorplant.setProperty("/description/stateText", "");

            osincubatorplant.setProperty("/max_storage/editable", true);
            osincubatorplant.setProperty("/max_storage/value", "");
            osincubatorplant.setProperty("/max_storage/state", "None");
            osincubatorplant.setProperty("/max_storage/stateText", "");

            osincubatorplant.setProperty("/min_storage/editable", true);
            osincubatorplant.setProperty("/min_storage/value", "");
            osincubatorplant.setProperty("/min_storage/state", "None");
            osincubatorplant.setProperty("/min_storage/stateText", "");

            osincubatorplant.setProperty("/acclimatized/editable", true);
            osincubatorplant.setProperty("/acclimatized/value", true);
            osincubatorplant.setProperty("/acclimatized/state", "None");
            osincubatorplant.setProperty("/acclimatized/stateText", "");

            osincubatorplant.setProperty("/suitable/editable", true);
            osincubatorplant.setProperty("/suitable/value", true);
            osincubatorplant.setProperty("/suitable/state", "None");
            osincubatorplant.setProperty("/suitable/stateText", "");

            osincubatorplant.setProperty("/expired/editable", true);
            osincubatorplant.setProperty("/expired/value", true);
            osincubatorplant.setProperty("/expired/state", "None");
            osincubatorplant.setProperty("/expired/stateText", "");
        },

        /**
         * Habilita/deshabilita la edición de los datos de un registro OSINCUBATORPLANT
         * @param  {Boolean} edit "true" si habilita la edición, "false" si la deshabilita
         */
        _editRecordValues: function (edit) {

            var osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");
            osincubatorplant.setProperty("/name/editable", edit);
            osincubatorplant.setProperty("/code/editable", edit);
            osincubatorplant.setProperty("/description/editable", edit);
            osincubatorplant.setProperty("/max_storage/editable", edit);
            osincubatorplant.setProperty("/min_storage/editable", edit);
            osincubatorplant.setProperty("/acclimatized/editable", edit);
            osincubatorplant.setProperty("/suitable/editable", edit);
            osincubatorplant.setProperty("/expired/editable", edit);

        },

        /**
         * Se define un campo como obligatorio o no, de un registro MDSTAGE
         * @param  {Boolean} edit "true" si es campo obligatorio, "false" si no es obligatorio
         */
        _editRecordRequired: function (edit) {
            var osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");
            osincubatorplant.setProperty("/name/required", edit);
            osincubatorplant.setProperty("/code/required", edit);
            osincubatorplant.setProperty("/description/required", edit);
            osincubatorplant.setProperty("/max_storage/required", edit);
            osincubatorplant.setProperty("/min_storage/required", edit);

        },

        /**
         * Solicita al servicio correspondiente crear un registro MDSTAGE
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCreate: function (oEvent) {
            //Si el registro que se desea crear es válido
            if (this._validRecord()) {

                var ospartnership = this.getView().getModel("OSPARTNERSHIP"),
                    osincubatorplant = this.getView().getModel("OSINCUBATORPLANT"),
                    util = this.getView().getModel("util"),
                    that = this,
                    serviceUrl = util.getProperty("/serviceUrl");

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "partnership_id": ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/") + "/partnership_id"),
                        "code": osincubatorplant.getProperty("/code/value"),
                        "name": osincubatorplant.getProperty("/name/value"),
                        "description": osincubatorplant.getProperty("/description/value"),
                        "max_storage": osincubatorplant.getProperty("/max_storage/value"),
                        "min_storage": osincubatorplant.getProperty("/min_storage/value"),
                        "acclimatized": osincubatorplant.getProperty("/acclimatized/value"),
                        "suitable": osincubatorplant.getProperty("/suitable/value"),
                        "expired": osincubatorplant.getProperty("/expired/value")
                    }),
                    url: serviceUrl + "/incubator_plant/",
                    dataType: "json",
                    async: true,
                    success: function (data) {
                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that.onToast(that.getI18n().getText("OS.recordCreated"));
                        that.getRouter().navTo("osIncubatorPlant", {}, true /*no history*/ );

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
             * @type {Boolean} flag "true" si los datos son válidos, "false" si no lo son
             */
            var osincubatorplant = this.getView().getModel("OSINCUBATORPLANT"),
                flag = true;

            if (osincubatorplant.getProperty("/name/state") === "Error") {
                flag = false;
            } else {
                if (osincubatorplant.getProperty("/name/value") === "") {
                    flag = false;
                    osincubatorplant.setProperty("/name/state", "Error");
                    osincubatorplant.setProperty("/name/stateText", "el campo nombre no puede estar vacío");
                } else {
                    osincubatorplant.setProperty("/name/state", "None");
                    osincubatorplant.setProperty("/name/stateText", "");
                }
            }

            if (osincubatorplant.getProperty("/code/state") === "Error") {
                flag = false;
            } else {
                if (osincubatorplant.getProperty("/code/value") === "") {
                    flag = false;
                    osincubatorplant.setProperty("/code/state", "Error");
                    osincubatorplant.setProperty("/code/stateText", "el campo código no puede estar vacío");
                } else {
                    osincubatorplant.setProperty("/code/state", "None");
                    osincubatorplant.setProperty("/code/stateText", "");
                }
            }

            if (osincubatorplant.getProperty("/description/value") === "") {
                flag = false;
                osincubatorplant.setProperty("/description/state", "Error");
                osincubatorplant.setProperty("/description/stateText", "el campo descripción no puede estar vacío");
            } else {
                osincubatorplant.setProperty("/description/state", "None");
                osincubatorplant.setProperty("/description/stateText", "");
            }

            if (osincubatorplant.getProperty("/max_storage/value") === "" || parseInt(osincubatorplant.getProperty("/max_storage/value")) === 0) {
                flag = false;
                osincubatorplant.setProperty("/max_storage/state", "Error");
                osincubatorplant.setProperty("/max_storage/stateText", (osincubatorplant.getProperty("/max_storage/value") === "") ? this.getI18n().getText("enter.FIELD") : this.getI18n().getText("enter.FIELD.greaterThan"));
            } else if (parseInt(osincubatorplant.getProperty("/min_storage/value")) > parseInt(osincubatorplant.getProperty("/max_storage/value"))) {
                flag = false;
                osincubatorplant.setProperty("/max_storage/state", "Error");
                osincubatorplant.setProperty("/max_storage/stateText", "La cantidad máxima no puede ser menor a la mínima");
            } else {
                osincubatorplant.setProperty("/max_storage/state", "None");
                osincubatorplant.setProperty("/max_storage/stateText", "");
            }

            if (osincubatorplant.getProperty("/min_storage/value") === "" || parseInt(osincubatorplant.getProperty("/min_storage/value")) === 0) {
                flag = false;
                osincubatorplant.setProperty("/min_storage/state", "Error");
                osincubatorplant.setProperty("/min_storage/stateText", (osincubatorplant.getProperty("/min_storage/value") === "") ? this.getI18n().getText("enter.FIELD") : this.getI18n().getText("enter.FIELD.greaterThan"));
            } else if (parseInt(osincubatorplant.getProperty("/min_storage/value")) > parseInt(osincubatorplant.getProperty("/max_storage/value"))) {
                flag = false;
                osincubatorplant.setProperty("/min_storage/state", "Error");
                osincubatorplant.setProperty("/min_storage/stateText", "La cantidad mínima no puede ser mayor a la máxima");
            } else {
                osincubatorplant.setProperty("/min_storage/state", "None");
                osincubatorplant.setProperty("/min_storage/stateText", "");
            }


            return flag;
        },

        /**
         * Regresa a la vista principal de la entidad seleccionada actualmente
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNavBack: function (oEvent) {
            /** @type {JSONModel} OS Referencia al modelo "OS" */
            var util = this.getView().getModel("util");

            this.getRouter().navTo(util.getProperty("/selectedEntity"), {}, false /*create history*/ );
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
        _viewOptions: function () {
            var osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");
            osincubatorplant.setProperty("/save/", false);
            osincubatorplant.setProperty("/cancel/", false);
            osincubatorplant.setProperty("/modify/", true);
            osincubatorplant.setProperty("/delete/", true);
            this._editRecordValues(false);
            this._editRecordRequired(false);
        },
        /**
         * Ajusta la vista para editar los datos de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onEdit: function (oEvent) {

            var osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");
            osincubatorplant.setProperty("/save/", true);
            osincubatorplant.setProperty("/cancel/", true);
            osincubatorplant.setProperty("/modify/", false);
            osincubatorplant.setProperty("/delete/", false);
            this._editRecordRequired(true);
            this._editRecordValues(true);

        },

        /**
         * Cancela la edición de un registro OSINCUBATORPLANT
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCancelEdit: function (oEvent) {
            /** @type {JSONModel} OSINCUBATORPLANT  Referencia al modelo OSINCUBATORPLANT */

            let osincubatorplant = this.getModel("OSINCUBATORPLANT"),
                copy = osincubatorplant.getProperty("/copy");

            osincubatorplant.setProperty("/name/value", copy.name);
            osincubatorplant.setProperty("/code/value", copy.code);
            osincubatorplant.setProperty("/description/value", copy.description);
            osincubatorplant.setProperty("/max_storage/value", copy.max_storage);
            osincubatorplant.setProperty("/min_storage/value", copy.min_storage);
            osincubatorplant.setProperty("/acclimatized/value", copy.acclimatized);
            osincubatorplant.setProperty("/suitable/value", copy.suitable);
            osincubatorplant.setProperty("/expired/value", copy.expired);

            osincubatorplant.setProperty("/name/state", "None");
            osincubatorplant.setProperty("/code/state", "None");
            osincubatorplant.setProperty("/description/state", "None");
            osincubatorplant.setProperty("/max_storage/state", "None");
            osincubatorplant.setProperty("/min_storage/state", "None");
            osincubatorplant.setProperty("/acclimatized/state", "None");
            osincubatorplant.setProperty("/suitable/state", "None");
            osincubatorplant.setProperty("/expired/state", "None");

            this.onView();
        },

        /**
         * Cancela la creación de un registro OSINCUBATORPLANT, y regresa a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCancelCreate: function (oEvent) {
            this._resetRecordValues();
            this.onNavBack(oEvent);
        },

        /**
         * Ajusta la vista para visualizar los datos de un registro
         */
        onView: function () {
            this._viewOptions();
        },

        /**
         * Levanta el Dialogo que muestra la confirmacion del Eliminar un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onConfirmDelete: async function (oEvent) {

            let that = this,
                util = this.getView().getModel("util"),
                osIncubatorPlant = that.getView().getModel("OSINCUBATORPLANT"),
                serviceUrl = util.getProperty("/serviceUrl");
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var confirmation = oBundle.getText("confirmation");
            var incubator_plant_id = osIncubatorPlant.getProperty(osIncubatorPlant.getProperty("/selectedRecordPath/") + "/incubator_plant_id");

            util.setProperty("/busy/", true);

            let cond = await this.onVerifyIsUsed(incubator_plant_id);

            if (cond) {
                var dialog = new Dialog({
                    title: "Información",
                    type: "Message",
                    state: "Warning",
                    content: new sap.m.Text({
                        text: "No se puede eliminar la planta Incubadora, porque está siendo utilizada."
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
                var dialog = new Dialog({
                    title: confirmation,
                    type: "Message",
                    content: new sap.m.Text({
                        text: "¿Desea eliminar esta Planta Incubadora?"
                    }),

                    beginButton: new Button({
                        text: "Si",
                        press: function () {
                            $.ajax({
                                type: "DELETE",
                                contentType: "application/json",
                                data: JSON.stringify({
                                    "incubator_plant_id": incubator_plant_id
                                }),
                                url: serviceUrl + "/incubator_plant/",
                                dataType: "json",
                                async: true,
                                success: function (data) {

                                    util.setProperty("/busy/", false);
                                    that.getRouter().navTo("osIncubatorPlant", {}, true);
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
         * Verifica si la Planta Incubadora esta en uso 
         * @param {JSON} incubator_plant_id
         */
        onVerifyIsUsed: async function (incubator_plant_id) {
            let ret;
            const response = await fetch("/process/isBeingUsed", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    incubator_plant_id: incubator_plant_id
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
         * Solicita al servicio correspondiente actualizar un registro MDSTAGE
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onUpdate: function (oEvent) {
            /**
             * Si el registro que se quiere actualizar es válido y hubo algún cambio
             * con respecto a sus datos originales
             */
            if (this._validRecord() && this._recordChanged()) {
                /**
                 * @type {JSONModel} MDSTAGE       Referencia al modelo "MDSTAGE"
                 * @type {JSONModel} util         Referencia al modelo "util"
                 * @type {Controller} that         Referencia a este controlador
                 */
                var osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");
                var util = this.getView().getModel("util");
                var that = this;
                var serviceUrl = util.getProperty("/serviceUrl");

                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({

                        "incubator_plant_id": osincubatorplant.getProperty(osincubatorplant.getProperty("/selectedRecordPath/") + "/incubator_plant_id"),
                        "name": osincubatorplant.getProperty("/name/value"),
                        "code": osincubatorplant.getProperty("/code/value"),
                        "description": osincubatorplant.getProperty("/description/value"),
                        "max_storage": osincubatorplant.getProperty("/max_storage/value"),
                        "min_storage": osincubatorplant.getProperty("/min_storage/value"),
                        "acclimatized": osincubatorplant.getProperty("/acclimatized/value"),
                        "suitable": osincubatorplant.getProperty("/suitable/value"),
                        "expired": osincubatorplant.getProperty("/expired/value")

                    }),
                    url: serviceUrl + "/incubator_plant/",
                    dataType: "json",
                    async: true,
                    success: function (data) {

                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that._viewOptions();
                        that.onToast(that.getI18n().getText("OS.recordUpdated"));
                        that.getRouter().navTo("osIncubatorPlant", {}, true /*no history*/ );

                    },
                    error: function (request, status, error) {
                        that.onToast("Error de comunicación");
                        console.log("Read failed");
                    }
                });
            }
        },

        /**
         * Verifica si el registro seleccionado tiene algún cambio con respecto a sus valores originales
         * @return {Boolean} Devuelve "true" el registro cambió, y "false" si no cambió
         */
        _recordChanged: function () {
            /**
             * @type {JSONModel} OSINCUBATORPLANT         Referencia al modelo "OSINCUBATORPLANT"
             * @type {Boolean} flag            "true" si el registro cambió, "false" si no cambió
             */
            var osincubatorplant = this.getView().getModel("OSINCUBATORPLANT"),
                flag = false;

            if (osincubatorplant.getProperty("/name/value") !== osincubatorplant.getProperty(osincubatorplant.getProperty("/selectedRecordPath/") + "/name")) {
                flag = true;
            }

            if (osincubatorplant.getProperty("/code/value") !== osincubatorplant.getProperty(osincubatorplant.getProperty("/selectedRecordPath/") + "/code")) {
                flag = true;
            }

            if (osincubatorplant.getProperty("/description/value") !== osincubatorplant.getProperty(osincubatorplant.getProperty("/selectedRecordPath/") + "/description")) {
                flag = true;
            }

            if (osincubatorplant.getProperty("/max_storage/value") !== osincubatorplant.getProperty(osincubatorplant.getProperty("/selectedRecordPath/") + "/max_storage")) {
                flag = true;
            }

            if (osincubatorplant.getProperty("/min_storage/value") !== osincubatorplant.getProperty(osincubatorplant.getProperty("/selectedRecordPath/") + "/min_storage")) {
                flag = true;
            }

            if (osincubatorplant.getProperty("/acclimatized/value") !== osincubatorplant.getProperty(osincubatorplant.getProperty("/selectedRecordPath/") + "/acclimatized")) {
                flag = true;
            }

            if (osincubatorplant.getProperty("/suitable/value") !== osincubatorplant.getProperty(osincubatorplant.getProperty("/selectedRecordPath/") + "/suitable")) {
                flag = true;
            }

            if (osincubatorplant.getProperty("/expired/value") !== osincubatorplant.getProperty(osincubatorplant.getProperty("/selectedRecordPath/") + "/expired")) {
                flag = true;
            }

            if (!flag) this.onToast("No se detectaron cambios");

            return flag;
        },

        /**
         * Toma el valor de la entrada por la interacción del usuario: cada pulsación de tecla, eliminar, pegar, etc.
         * @param {Event} oEvent Evento que llamó esta función
         */
        changeName: function (oEvent) {
            let input = oEvent.getSource(),
                nwCode = input.getValue();
            //input.setValue(input.getValue().trim());
            let osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");

            if (nwCode.length > 45) {
                osincubatorplant.setProperty("/name/state", "Error");
                osincubatorplant.setProperty("/name/stateText", "Excede el limite de caracteres permitido (45)");
                osincubatorplant.setProperty("/name/ok", false);
            } else {
                let records = osincubatorplant.getProperty("/records");
                let used = false;

                records.forEach(itm => {
                    used = used || ((itm.name).toLowerCase() === nwCode.toLowerCase())
                });

                if (used === true) {
                    osincubatorplant.setProperty("/name/state", "Error");
                    osincubatorplant.setProperty("/name/stateText", "nombre ya existente");
                } else {
                    osincubatorplant.setProperty("/name/state", "None");
                    osincubatorplant.setProperty("/name/stateText", "");
                    osincubatorplant.setProperty("/name/ok", true);
                }
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
            let osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");

            if (nwCode.length > 100) {
                osincubatorplant.setProperty("/code/state", "Error");
                osincubatorplant.setProperty("/code/stateText", "Excede el limite de caracteres permitido (100)");
                osincubatorplant.setProperty("/code/ok", false);
            } else {
                let records = osincubatorplant.getProperty("/records");
                let used = false;

                records.forEach(itm => {
                    used = used || ((itm.code).toLowerCase() === nwCode.toLowerCase())
                });

                if (used === true) {
                    osincubatorplant.setProperty("/code/state", "Error");
                    osincubatorplant.setProperty("/code/stateText", "código ya existente");
                } else {
                    osincubatorplant.setProperty("/code/state", "None");
                    osincubatorplant.setProperty("/code/stateText", "");
                    osincubatorplant.setProperty("/code/ok", true);
                }
            }
        },

        /**
         * Toma el valor de la entrada por la interacción del usuario: cada pulsación de tecla, eliminar, pegar, etc.
         * @param {Event} oEvent Evento que llamó esta función
         */
        changeDescription: function (oEvent) {
            let input = oEvent.getSource(),
                nwCode = input.getValue().trim();
            input.setValue(input.getValue().trim());
            let osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");

            if (nwCode.length > 20) {
                osincubatorplant.setProperty("/description/state", "Error");
                osincubatorplant.setProperty("/description/stateText", "Excede el limite de caracteres permitido (20)");
                osincubatorplant.setProperty("/code/ok", false);
            } else {

                osincubatorplant.setProperty("/description/state", "None");
                osincubatorplant.setProperty("/description/stateText", "");
                osincubatorplant.setProperty("/code/ok", true);

            }
        },
    });
});