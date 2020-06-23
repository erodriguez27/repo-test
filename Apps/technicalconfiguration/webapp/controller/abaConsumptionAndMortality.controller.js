sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button"
], function (BaseController, JSONModel, Dialog, Button) {
    "use strict";
    const urlPath = "/abaConsumptionAndMortality";
    const baseUrl = "http://127.0.0.1:3010";
    const baseUrl2 = "http://127.0.0.1:3010";

    return BaseController.extend("technicalConfiguration.controller.abaConsumptionAndMortality", {

        onInit: function () {
            //ruta para la vista principal
            console.log("Controller de broiler product");
            this.getOwnerComponent().getRouter().getRoute("abaConsumptionAndMortality").attachPatternMatched(this._onRouteMatched, this);
            //ruta para la vista de detalles de un registro
            this.getOwnerComponent().getRouter().getRoute("abaConsumptionAndMortality_Record").attachPatternMatched(this._onRecordMatched, this);
            //ruta para la vista de creación de un registro
            this.getOwnerComponent().getRouter().getRoute("abaConsumptionAndMortality_Create").attachPatternMatched(this._onCreateMatched, this);
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

            let that = this,
                util = this.getView().getModel("util"),
                abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");

            //dependiendo del dispositivo, establece la propiedad "phone"
            this.getView().getModel("util").setProperty("/phone/",
                this.getOwnerComponent().getContentDensityClass() === "sapUiSizeCozy");

            //establece MDSTAGE como la entidad seleccionada
            util.setProperty("/selectedEntity/", "abaConsumptionAndMortality");

            //obtiene los registros de mdbroilerProduct
            this.onRead(that, util, abaConsumptionAndMortalityModel);
        },
        /**
         * Obtiene todos los registros de MDBROILERPRODUCT
         * @param  {Controller} that         Referencia al controlador que llama esta función
         * @param  {JSONModel} util         Referencia al modelo "util"
         * @param  {JSONModel} MDBROILERPRODUCT Referencia al modelo "MDBROILERPRODUCT"
         */
        onRead: function (that, util, abaConsumptionAndMortalityModel) {
            /** @type {Object} settings opciones de la llamada a la función ajax */

            this.loadData();
            var service = util.getProperty("/serviceUrl");
            var settings = {
                url: urlPath + "/withTimes",
                method: "GET",
                success: function (res) {
                    util.setProperty("/busy/", false);
                    abaConsumptionAndMortalityModel.setProperty("/records/", res.data);
                },
                error: function (err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                    //that.onConnectionError();
                }
            };
            console.log(util);
            util.setProperty("/busy/", true);
            abaConsumptionAndMortalityModel.setProperty("/records/", []);
            // this.loadData();
            $.ajax(settings);
        },
        /**
         * Navega a la vista para crear un nuevo registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNewRecord: function (oEvent) {

            this.getRouter().navTo("abaConsumptionAndMortality_Create", {}, false /*create history*/ );
        },
        /**
         * Coincidencia de ruta para acceder a la creación de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onCreateMatched: function (oEvent) {
            this.loadData();

            this._resetRecordValues();
            this._editRecordValues(true);
            this._editRecordRequired(true);
        },
        /**
         * Resetea todos los valores existentes en el formulario del registro
         */
        _resetRecordValues: function () {
            /**
             * @type {JSONModel} MDSTAGE Referencia al modelo "MDBROILERPRODUCT"
             */
            var abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");

            // abaConsumptionAndMortalityModel.setProperty("/abaConsumptionAndMortality_id/value", "");

            abaConsumptionAndMortalityModel.setProperty("/id/value", "");

            abaConsumptionAndMortalityModel.setProperty("/code/editable", true);
            abaConsumptionAndMortalityModel.setProperty("/code/value", "");
            abaConsumptionAndMortalityModel.setProperty("/code/state", "None");
            abaConsumptionAndMortalityModel.setProperty("/code/stateText", "");
            abaConsumptionAndMortalityModel.setProperty("/name/editable", true);
            abaConsumptionAndMortalityModel.setProperty("/name/value", "");
            abaConsumptionAndMortalityModel.setProperty("/name/state", "None");
            abaConsumptionAndMortalityModel.setProperty("/name/stateText", "");
            abaConsumptionAndMortalityModel.setProperty("/breeds", []);
            abaConsumptionAndMortalityModel.setProperty("/breeds/id", "");
            abaConsumptionAndMortalityModel.setProperty("/breeds/value", "");
            abaConsumptionAndMortalityModel.setProperty("/breeds/editable", true);
            abaConsumptionAndMortalityModel.setProperty("/breeds/state", "None");
            abaConsumptionAndMortalityModel.setProperty("/breeds/stateText", "");
            abaConsumptionAndMortalityModel.setProperty("/types/editable", true);
            abaConsumptionAndMortalityModel.setProperty("/types", []);
            abaConsumptionAndMortalityModel.setProperty("/types/id", "");
            abaConsumptionAndMortalityModel.setProperty("/types/value", "");
            abaConsumptionAndMortalityModel.setProperty("/types/state", "None");
            abaConsumptionAndMortalityModel.setProperty("/types/stateText", "");
            abaConsumptionAndMortalityModel.setProperty("/time/editable", true);
            abaConsumptionAndMortalityModel.setProperty("/time", []);
            abaConsumptionAndMortalityModel.setProperty("/time/id", "");
            abaConsumptionAndMortalityModel.setProperty("/time/value", "");
            abaConsumptionAndMortalityModel.setProperty("/time/timeUnitNameSingular", "");
            abaConsumptionAndMortalityModel.setProperty("/time/timeUnitNamePlural", "");
            abaConsumptionAndMortalityModel.setProperty("/time/timeUnitNumber", "");
            abaConsumptionAndMortalityModel.setProperty("/time/state", "None");
            abaConsumptionAndMortalityModel.setProperty("/time/stateText", "");
            abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/timeUnitNumber", "");
            abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/editable", true);
            abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/value", "");
            abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/state", "None");
            abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/stateText", "");
        },
        /**
         * Habilita/deshabilita la edición de los datos de un registro MDBROILERPRODUCT
         * @param  {Boolean} edit "true" si habilita la edición, "false" si la deshabilita
         */
        _editRecordValues: function (edit) {

            var abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");
            abaConsumptionAndMortalityModel.setProperty("/code/editable", edit);
            abaConsumptionAndMortalityModel.setProperty("/name/editable", edit);
            abaConsumptionAndMortalityModel.setProperty("/breeds/editable", edit);
            abaConsumptionAndMortalityModel.setProperty("/types/editable", edit);
            abaConsumptionAndMortalityModel.setProperty("/time/editable", edit);
            abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/editable", edit);
        },
        /**
         * Se define un campo como obligatorio o no, de un registro MDBROILERPRODUCT
         * @param  {Boolean} edit "true" si es campo obligatorio, "false" si no es obligatorio
         */
        _editRecordRequired: function (edit) {
            var abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");
            abaConsumptionAndMortalityModel.setProperty("/code/required", edit);
            abaConsumptionAndMortalityModel.setProperty("/name/required", edit);
            abaConsumptionAndMortalityModel.setProperty("/breeds/required", edit);
            abaConsumptionAndMortalityModel.setProperty("/types/required", edit);
            abaConsumptionAndMortalityModel.setProperty("/time/required", edit);
            abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/required", edit);
        },
        /**
         * Solicita al servicio correspondiente crear un registro MDBROILERPRODUCT
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCreate: function (oEvent) { //todo insercion
            //Si el registro que se desea crear es válido
            let aWeeks = this.getView().getModel("ABACONSUMPTIONANDMORTALITY").getProperty("/timeUnitInfo/");
            console.log(aWeeks);
            if (this._validRecord() && this.verifyInputs(aWeeks)) {
                console.log("Voy a insertar");
                var that = this,
                    util = this.getView().getModel("util"),
                    serviceUrl = util.getProperty("/serviceUrl"),
                    abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");
                console.log(abaConsumptionAndMortalityModel);

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "id": abaConsumptionAndMortalityModel.getProperty("/id/value"),
                        "code": abaConsumptionAndMortalityModel.getProperty("/code/value"),
                        "name": abaConsumptionAndMortalityModel.getProperty("/name/value"),
                        "id_breed": abaConsumptionAndMortalityModel.getProperty("/breeds/id"),
                        "id_type": abaConsumptionAndMortalityModel.getProperty("/types/id"),
                        "id_time_unit": abaConsumptionAndMortalityModel.getProperty("/time/id"),
                        "values": abaConsumptionAndMortalityModel.getProperty("/timeUnitInfo/value"),
                    }),
                    url: urlPath + "/addConsAndMort",
                    dataType: "json",
                    async: true,
                    success: function (data) {
                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that.onToast(that.getI18n().getText("OS.recordCreated"));
                        that.getRouter().navTo("abaConsumptionAndMortality", {}, true /*no history*/ );

                    },
                    error: function (request) {
                        var msg = request.statusText;
                        that.onToast("Error: " + msg);
                        console.log("Read failed: ", request);
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
             * @type {JSONModel} MDBROILERPRODUCT Referencia al modelo "MDBROILERPRODUCT"
             * @type {Boolean} flag "true" si los datos son válidos, "false" si no lo son
             */
            let abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY"),
                flag = true
            if (abaConsumptionAndMortalityModel.getProperty("/breeds/id") === "" || abaConsumptionAndMortalityModel.getProperty("/breeds/id") == undefined) {
                flag = false;
                console.log(flag);
                abaConsumptionAndMortalityModel.setProperty("/breeds/state", "Error");
                abaConsumptionAndMortalityModel.setProperty("/breeds/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaConsumptionAndMortalityModel.setProperty("/breeds/state", "None");
                abaConsumptionAndMortalityModel.setProperty("/breeds/stateText", "");
            }

            if (abaConsumptionAndMortalityModel.getProperty("/types/id") === "" || abaConsumptionAndMortalityModel.getProperty("/types/id") == undefined) {
                flag = false;
                console.log(flag);
                abaConsumptionAndMortalityModel.setProperty("/types/state", "Error");
                abaConsumptionAndMortalityModel.setProperty("/types/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaConsumptionAndMortalityModel.setProperty("/types/state", "None");
                abaConsumptionAndMortalityModel.setProperty("/types/stateText", "");
            }

            if (abaConsumptionAndMortalityModel.getProperty("/code/value") === "") {
                flag = false;
                console.log(flag);
                abaConsumptionAndMortalityModel.setProperty("/code/state", "Error");
                abaConsumptionAndMortalityModel.setProperty("/code/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaConsumptionAndMortalityModel.setProperty("/code/state", "None");
                abaConsumptionAndMortalityModel.setProperty("/code/stateText", "");
            }


            if (abaConsumptionAndMortalityModel.getProperty("/name/value") === "") {
                flag = false;
                console.log(flag);
                abaConsumptionAndMortalityModel.setProperty("/name/state", "Error");
                abaConsumptionAndMortalityModel.setProperty("/name/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaConsumptionAndMortalityModel.setProperty("/name/state", "None");
                abaConsumptionAndMortalityModel.setProperty("/name/stateText", "");
            }
            abaConsumptionAndMortalityModel.getProperty("/timeUnitInfo/timeUnitNumber")
            if (abaConsumptionAndMortalityModel.getProperty("/timeUnitInfo/timeUnitNumber") === "") {
                flag = false;
                console.log(flag);
                abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/state", "Error");
                abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/state", "None");
                abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/stateText", "");
            }

            if (abaConsumptionAndMortalityModel.getProperty("/time/id") === "" || abaConsumptionAndMortalityModel.getProperty("/time/id") == undefined) {
                flag = false;
                console.log(flag);
                abaConsumptionAndMortalityModel.setProperty("/time/state", "Error");
                abaConsumptionAndMortalityModel.setProperty("/time/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaConsumptionAndMortalityModel.setProperty("/time/state", "None");
                abaConsumptionAndMortalityModel.setProperty("/time/stateText", "");
            }

            return flag;
        },

        /**
         *  valida que los input de producción esten llenos correctamente
         * @param {JSON} aWeeks Cantidad de semanas
         * @param {boolean} [update=false] true para editar, false para crear
         * @returns {boolean} true si estan correctos, false si estan incorrectos
         */
        verifyInputs: function (aWeeks, update = false) {
            const weeks = aWeeks.value;
            let bSuccess = true;
            console.log(update);
            let abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");

            for (let i = 0; i < weeks.length; ++i) {
                if ((weeks[i].consumption === "") || (parseFloat(weeks[i].consumption) === 0) || (weeks[i].consumption === null)) {
                    weeks[i].state = "Error";
                    abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/value/" + i + "/state", "Error");
                    abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/value/" + i + "/stateText", (parseFloat(weeks[i].consumption) === 0) ? "Debe ser mayor a cero (0)" : "No puede ser vacio");
                    bSuccess = bSuccess && false;

                } else {
                    abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/value/" + i + "/state", "None");
                    abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/value/" + i + "/stateText", "");
                    bSuccess = bSuccess && true;
                }

                if ((weeks[i].mortality === "") || (parseFloat(weeks[i].mortality) === 0) || (weeks[i].mortality === null)) {
                    weeks[i].state2 = "Error";
                    abaConsumptionAndMortalityModel.setProperty((update === true ? "/timeUnitInfoRecords/" : "/timeUnitInfo/value/") + i + "/state2", "Error");
                    abaConsumptionAndMortalityModel.setProperty((update === true ? "/timeUnitInfoRecords/" : "/timeUnitInfo/value/") + i + "/stateText2", (parseFloat(weeks[i].mortality) === 0) ? "Debe ser mayor a cero (0)" : "No puede ser vacio")
                    bSuccess = bSuccess && false;

                } else {
                    abaConsumptionAndMortalityModel.setProperty((update === true ? "/timeUnitInfoRecords/" : "/timeUnitInfo/value/") + i + "/state2", "None")
                    abaConsumptionAndMortalityModel.setProperty((update === true ? "/timeUnitInfoRecords/" : "/timeUnitInfo/value/") + i + "/stateText2", "")
                    bSuccess = bSuccess && true;
                }
            }
            return bSuccess;
        },

        loadData: function () {
            let abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/breed",
                dataType: "json",
                async: true,
                success: function (data) {
                    //todo reemplazar mas adelante
                    abaConsumptionAndMortalityModel.setProperty("/breeds", data.data);
                    console.log(abaConsumptionAndMortalityModel)
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast("Error: " + msg);
                    console.log("Read failed: ", request);
                }
            });
            //para etapas o subtipo basado en el uso de la raza
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/stage",
                dataType: "json",
                async: true,
                success: function (data) {
                    //todo reemplazar mas adelante
                    abaConsumptionAndMortalityModel.setProperty("/types", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast("Error: " + msg);
                    console.log("Read failed: ", request);
                }
            });

            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/abaTimeUnit",
                dataType: "json",
                async: true,
                success: function (data) {
                    //todo reemplazar mas adelante
                    console.log(data);
                    abaConsumptionAndMortalityModel.setProperty("/time", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast("Error: " + msg);
                    console.log("Read failed: ", request);
                }
            });
        },

        /**
         * verificar si una entrada de campo contiene un número utilizando una expresión regular que 
         * permite el formato decimal
         * @param {*} o numero
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

                if (value >= 0) {
                    input.setValue(value);
                    input.setValueState("None");
                    input.setValueStateText("");
                }

                return false;
            }
        },

        /**
         * verificar si una entrada de campo contiene un número utilizando una expresión regular que 
         * permite el formato Entero
         * @param {*} o numero
         */
        validateIntInput: function (o) {
            let input = o.getSource();
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

                if (value > 0) {
                    input.setValue(value);
                } else {
                    input.setValue("");
                }

                return false;
            }
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
            var abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");
            abaConsumptionAndMortalityModel.setProperty("/save/", false);
            abaConsumptionAndMortalityModel.setProperty("/cancel/", false);
            abaConsumptionAndMortalityModel.setProperty("/modify/", true);
            abaConsumptionAndMortalityModel.setProperty("/delete/", true);

            this._editRecordValues(false);
            this._editRecordRequired(false);
        },
        /**
         * Solicita al servicio correspondiente actualizar un registro MDBROILERPRODUCT
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onUpdate: function (oEvent) { //todo hacer
            let aWeeks = this.getView().getModel("ABACONSUMPTIONANDMORTALITY").getProperty("/timeUnitInfo/");
            console.log(aWeeks);
            /**
             * Si el registro que se quiere actualizar es válido y hubo algún cambio
             */
            if (this._validRecord() && this._recordChanged() && this.verifyInputs(aWeeks, true)) {
                /**
                 * @type {JSONModel} MDBROILERPRODUCT       Referencia al modelo "MDBROILERPRODUCT"
                 * @type {JSONModel} util         Referencia al modelo "util"
                 * @type {Controller} that         Referencia a este controlador
                 */
                var abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");
                var util = this.getView().getModel("util");
                var serviceUrl = util.getProperty("/serviceUrl");
                var that = this;
                console.log("Actualizar el ID: ", abaConsumptionAndMortalityModel.getProperty("/id/value"));
                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "id": abaConsumptionAndMortalityModel.getProperty("/id/value"),
                        "code": abaConsumptionAndMortalityModel.getProperty("/code/value"),
                        "name": abaConsumptionAndMortalityModel.getProperty("/name/value"),
                        "id_breed": abaConsumptionAndMortalityModel.getProperty("/breeds/id"),
                        "id_type": abaConsumptionAndMortalityModel.getProperty("/types/id"),
                        "id_time_unit": abaConsumptionAndMortalityModel.getProperty("/time/id"),
                        "values": abaConsumptionAndMortalityModel.getProperty("/timeUnitInfo/value"),
                    }),
                    url: urlPath + "/updateConsAndMort",
                    dataType: "json",
                    async: true,
                    success: function (data) {

                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that._viewOptions();
                        that.onToast(that.getI18n().getText("OS.recordUpdated"));
                        that.getRouter().navTo("abaConsumptionAndMortality", {}, true /*no history*/ );

                    },
                    error: function (request) {
                        let msg = request.statusText;

                        that.onToast("Error: " + msg);
                        console.log("Read failed: ", request);
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
             * @type {JSONModel} MDBREED         Referencia al modelo "MDSTAGE"
             * @type {Boolean} flag            "true" si el registro cambió, "false" si no cambió
             */
            var mdbroilerProduct = this.getView().getModel("MDBROILERPRODUCT"),
                flag = false;

            if (mdbroilerProduct.getProperty("/name/value") !== mdbroilerProduct.getProperty(mdbroilerProduct.getProperty("/selectedRecordPath/") + "/name")) {
                flag = true;
            }

            if (!flag) this.onToast("No se detectaron cambios");

            return flag;
        },
        /**
         * Ajusta la vista para editar los datos de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onEdit: function (oEvent) {

            var abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");
            abaConsumptionAndMortalityModel.setProperty("/save/", true);
            abaConsumptionAndMortalityModel.setProperty("/cancel/", true);
            abaConsumptionAndMortalityModel.setProperty("/modify/", false);
            abaConsumptionAndMortalityModel.setProperty("/delete/", false);
            this._editRecordRequired(true);
            this._editRecordValues(true);
        },
        onConfirmDelete: function (oEvent) { //todo hacer

            let oBundle = this.getView().getModel("i18n").getResourceBundle(),
                deleteRecord = oBundle.getText("deleteRecord"),
                confirmation = oBundle.getText("confirmation"),
                util = this.getView().getModel("util"),
                serviceUrl = util.getProperty("/serviceUrl"),
                that = this;

            let dialog = new Dialog({
                title: confirmation,
                type: "Message",
                content: new sap.m.Text({
                    text: deleteRecord
                }),

                beginButton: new Button({
                    text: "Si",
                    press: function () {
                        util.setProperty("/busy/", true);
                        let abaConsumptionAndMortalityModel = that.getView().getModel("ABACONSUMPTIONANDMORTALITY");

                        $.ajax({
                            type: "DELETE",
                            contentType: "application/json",
                            data: JSON.stringify({
                                "id": abaConsumptionAndMortalityModel.getProperty("/id/value")
                            }),
                            url: urlPath,
                            dataType: "json",
                            async: true,
                            success: function (data) {

                                util.setProperty("/busy/", false);
                                that.getRouter().navTo("abaConsumptionAndMortality", {}, true);
                                dialog.close();
                                dialog.destroy();

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
            /** @type {JSONModel} OS Referencia al modelo "OS" */
            var util = this.getView().getModel("util");

            this.getRouter().navTo(util.getProperty("/selectedEntity"), {}, false /*create history*/ );
        },
        /**
         * Visualiza los detalles de un registro MDSTAGE
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onViewConsumptionAndMortalityProductRecord: function (oEvent) {

            var abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");
            abaConsumptionAndMortalityModel.setProperty("/save/", false);
            abaConsumptionAndMortalityModel.setProperty("/cancel/", false);

            $.ajax({
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "id": oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject().id
                }),
                url: "/abaConsumptionAndMortalityDetail/findByConsumptionAndMortalityId",
                dataType: "json",
                async: true,
                success: function (data) {

                    //todo reemplazar mas adelante
                    console.log(data.data);
                    abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/value", data.data);
                    //asigno cantidad de dias o semanas, lo saco de la cantidad de datos retornada en este lugar
                    abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/timeUnitNumber", data.data.length);
                    //tomando en cuenta el el stage asignar valores al modelo time
                    //Engorde dias y Reproductoras semanas
                    /*
                    *
                    *       "timeUnit": "Semanas",
                     "timeUnitType": "2",
                     "timeUnitNumber": "6",//cantidad total, depende del resultado de la consulta
                     */
                },
                error: function (request) {
                    var msg = request.statusText;
                    // that.onToast('Error: ' + msg);
                    console.log("Read failed: ", request);
                }
            });



            console.log(oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject());
            //todo asignar los datos al modelo y probar onDetail
            //aqui debo de obtener el detalle de abaConsumptionAndMortality con el id del seleccionado
            abaConsumptionAndMortalityModel.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY"));
            abaConsumptionAndMortalityModel.setProperty("/id/value", oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject().id);
            abaConsumptionAndMortalityModel.setProperty("/code/value", oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject().code);
            abaConsumptionAndMortalityModel.setProperty("/name/value", oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject().name);
            console.log(oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject().id_breed);
            abaConsumptionAndMortalityModel.setProperty("/breeds/id", oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject().id_breed);
            // console.log(abaConsumptionAndMortalityModel.setProperty("/breeds/id"));
            abaConsumptionAndMortalityModel.setProperty("/types/id", oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject().id_stage);
            //todo 
            abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/timeUnitNumber", abaConsumptionAndMortalityModel.getProperty("/timeUnitInfo/value").length);
            abaConsumptionAndMortalityModel.setProperty("/time/id", oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject().id_aba_time_unit);
            abaConsumptionAndMortalityModel.setProperty("/time/timeUnitNameSingular", oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject().singular_name);
            abaConsumptionAndMortalityModel.setProperty("/time/timeUnitNamePlural", oEvent.getSource().getBindingContext("ABACONSUMPTIONANDMORTALITY").getObject().plural_name);

            console.log(abaConsumptionAndMortalityModel)
            this.getRouter().navTo("abaConsumptionAndMortality_Record", {}, false /*create history*/ );
        },


        /**
         * Cancela la edición de un registro MDSTAGE
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCancelEdit: async function (oEvent) {
            /** @type {JSONModel} MDSTAGE  Referencia al modelo MDSTAGE */
            let abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");

            var selectPath = abaConsumptionAndMortalityModel.getProperty("/selectedRecordPath/").sPath;
            var key = selectPath.split("/");
            abaConsumptionAndMortalityModel.setProperty("/breeds/id", abaConsumptionAndMortalityModel.getProperty(abaConsumptionAndMortalityModel.getProperty("/selectedRecordPath/") + "/id_breed"));
            abaConsumptionAndMortalityModel.setProperty("/types/id", abaConsumptionAndMortalityModel.getProperty(abaConsumptionAndMortalityModel.getProperty("/selectedRecordPath/") + "/id_stage"));
            abaConsumptionAndMortalityModel.setProperty("/name/value", abaConsumptionAndMortalityModel.getProperty(abaConsumptionAndMortalityModel.getProperty("/selectedRecordPath/") + "/name"));
            abaConsumptionAndMortalityModel.setProperty("/code/value", abaConsumptionAndMortalityModel.getProperty(abaConsumptionAndMortalityModel.getProperty("/selectedRecordPath/") + "/code"));

            abaConsumptionAndMortalityModel.setProperty("/time/id", abaConsumptionAndMortalityModel.getProperty(abaConsumptionAndMortalityModel.getProperty("/selectedRecordPath/") + "/id_aba_time_unit"));

            await $.ajax({
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "id": abaConsumptionAndMortalityModel.getProperty(abaConsumptionAndMortalityModel.getProperty("/selectedRecordPath/") + "/id")
                }),
                url: "/abaConsumptionAndMortalityDetail/findByConsumptionAndMortalityId",
                dataType: "json",
                async: true,
                success: function (data) {
                    console.log(data.data);
                    abaConsumptionAndMortalityModel.setProperty("/records2/", data.data);
                    console.log(abaConsumptionAndMortalityModel);
                }
            });

            abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/value", abaConsumptionAndMortalityModel.getProperty("/records2/"));

            abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/timeUnitNumber", abaConsumptionAndMortalityModel.getProperty("/timeUnitInfo/value").length);
            this.onView();
        },
        /**
         * Ajusta la vista para visualizar los datos de un registro
         */
        onView: function () {
            this._viewOptions();
        },

        onconsumptionAndMortalityProductSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("consumptionAndMortalityProductTable").getBinding("items");

            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                var filter1 = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters = new sap.ui.model.Filter([filter1]);
            }

            //se actualiza el binding de la lista
            binding.filter(aFilters);

        },
        onPressGenerateForm: function (oEvent) {

            if (this._validRecord()) {

                //obtener el modelo
                let abaConsumptionAndMortalityModel = this.getView().getModel("ABACONSUMPTIONANDMORTALITY");
                // this.getView().byId("newBtn").setEnabled(true);

                //primero veo si cambio entre dia y semana
                let selectedTime = abaConsumptionAndMortalityModel.getProperty("/time/id");

                let timeValues = abaConsumptionAndMortalityModel.getProperty("/time");
                //buscar el seleccionado por el id
                let selectedTimeUnit = timeValues.find(actualRow => actualRow.id == selectedTime);

                //y resetear el nombre en singular y plural todo tal vez verificar
                abaConsumptionAndMortalityModel.setProperty("/time/timeUnitNameSingular", selectedTimeUnit.singular_name);
                abaConsumptionAndMortalityModel.setProperty("/time/timeUnitNamePlural", selectedTimeUnit.plural_name);

                //primero obtengo cuanto coloco en el campo con numero
                let numberOfRows = abaConsumptionAndMortalityModel.getProperty("/timeUnitInfo/timeUnitNumber");

                //luego cuento cuantas filas hay actualmente
                let numberOfActualRows = abaConsumptionAndMortalityModel.getProperty("/timeUnitInfo/value").length;
                let temp = abaConsumptionAndMortalityModel.getProperty("/timeUnitInfo/value");
                //si tengo que agregar
                if (numberOfActualRows < numberOfRows) {
                    //agrego campos vacios al modelo
                    //si no esta vacio
                    if (temp != "") {
                        //todo hacer ciclo dependiendo de la cantidad a agregar
                        for (let i = 0; i < numberOfRows - numberOfActualRows; i++) {
                            temp.push({
                                "id": null,
                                "id_aba_consumption_and_mortality": null,
                                "time_unit_number": temp.length + 1,
                                "consumption": null,
                                "mortality": null
                            });
                        }
                        console.log(temp);
                    } else { //si esta vacio inserto el primero y luego hago ciclo
                        temp = [{
                            "id": null,
                            "id_aba_consumption_and_mortality": null,
                            "time_unit_number": 1,
                            "consumption": null,
                            "mortality": null
                        }];
                        //todo hacer ciclo para añadir los restantes menos 1
                        for (let i = 0; i < numberOfRows - 1; i++) {
                            temp.push({
                                "id": null,
                                "id_aba_consumption_and_mortality": null,
                                "time_unit_number": temp.length + 1,
                                "consumption": null,
                                "mortality": null
                            });
                        }
                        console.log(temp);
                    }
                    abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/value", temp);
                    console.log(temp);
                } else {
                    //sino, tengo que quitar
                    if (numberOfActualRows > numberOfRows) {
                        //tengo que borrar filas del modelo
                        //le paso el indice a partir de donde borrara
                        temp.splice(numberOfRows);
                        console.log(temp);
                        abaConsumptionAndMortalityModel.setProperty("/timeUnitInfo/value", temp);

                    } //sino es que estan igual y no hago nada
                }
            }
        }
    });


});