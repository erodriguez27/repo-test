sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button"
], function (BaseController, JSONModel, Dialog, Button) {
    "use strict";
    const urlPath = "/abaBreedsAndStages";
    const baseUrl = "http://127.0.0.1:3001";
    const baseUrl2 = "http://127.0.0.1:3009";
    var Stagesvalue = [];
    return BaseController.extend("technicalConfiguration.controller.abaStages", {

        onInit: function () {
            //ruta para la vista principal
            this.getOwnerComponent().getRouter().getRoute("abaStages").attachPatternMatched(this._onRouteMatched, this);
            //ruta para la vista de detalles de un registro
            this.getOwnerComponent().getRouter().getRoute("abaStages_Record").attachPatternMatched(this._onRecordMatched, this);
            //ruta para la vista de creación de un registro
            this.getOwnerComponent().getRouter().getRoute("abaStages_Create").attachPatternMatched(this._onCreateMatched, this);
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
                abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");

            //dependiendo del dispositivo, establece la propiedad "phone"
            this.getView().getModel("util").setProperty("/phone/",
                this.getOwnerComponent().getContentDensityClass() === "sapUiSizeCozy");

            //establece MDSTAGE como la entidad seleccionada
            util.setProperty("/selectedEntity/", "abaStages");

            //obtiene los registros de mdbroilerProduct
            this.onRead(that, util, abaBreedsAndStagesModel);
        },
        /**
         * Obtiene todos los registros de MDBROILERPRODUCT
         * @param  {Controller} that         Referencia al controlador que llama esta función
         * @param  {JSONModel} util         Referencia al modelo "util"
         * @param  {JSONModel} MDBROILERPRODUCT Referencia al modelo "MDBROILERPRODUCT"
         */
        onRead: async function (that, util, abaBreedsAndStagesModel) {
            await this.loadData();
            /** @type {Object} settings opciones de la llamada a la función ajax */
            var service = util.getProperty("/serviceUrl");
            var settings = {
                url: urlPath,
                method: "GET",
                success: function (res) {
                    console.log(res.data);

                    util.setProperty("/busy/", false);
                    abaBreedsAndStagesModel.setProperty("/records/", res.data);
                },
                error: function (err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                    //that.onConnectionError();
                }
            };
            console.log(util);
            util.setProperty("/busy/", true);
            abaBreedsAndStagesModel.setProperty("/records/", []);
            $.ajax(settings);
        },
        /**
         * Navega a la vista para crear un nuevo registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNewRecord: function (oEvent) {

            this.getRouter().navTo("abaStages_Create", {}, false /*create history*/ );
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
            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");

            abaBreedsAndStagesModel.setProperty("/id/value", "");
            abaBreedsAndStagesModel.setProperty("/code/editable", true);
            abaBreedsAndStagesModel.setProperty("/code/value", "");
            abaBreedsAndStagesModel.setProperty("/code/state", "None");
            abaBreedsAndStagesModel.setProperty("/code/stateText", "");
            abaBreedsAndStagesModel.setProperty("/name/editable", true);
            abaBreedsAndStagesModel.setProperty("/name/value", "");
            abaBreedsAndStagesModel.setProperty("/name/state", "None");
            abaBreedsAndStagesModel.setProperty("/name/stateText", "");
            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/editable", true);
            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/value", "");
            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/state", "None");
            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/stateText", "");
            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/id", "");
            abaBreedsAndStagesModel.setProperty("/abaProcesses/editable", true);
            abaBreedsAndStagesModel.setProperty("/abaProcesses/value", "");
            abaBreedsAndStagesModel.setProperty("/abaProcesses/state", "None");
            abaBreedsAndStagesModel.setProperty("/abaProcesses/stateText", "");
            abaBreedsAndStagesModel.setProperty("/abaProcesses/id", "");
            abaBreedsAndStagesModel.setProperty("/abaFormulation/editable", true);
            abaBreedsAndStagesModel.setProperty("/abaFormulation/value", "");
            abaBreedsAndStagesModel.setProperty("/abaFormulation/state", "None");
            abaBreedsAndStagesModel.setProperty("/abaFormulation/stateText", "");
            abaBreedsAndStagesModel.setProperty("/abaFormulation/id", "");
            abaBreedsAndStagesModel.setProperty("/stages/editable", true);
            abaBreedsAndStagesModel.setProperty("/stages/value", "");
            abaBreedsAndStagesModel.setProperty("/stages/state", "None");
            abaBreedsAndStagesModel.setProperty("/stages/stateText", "");
        },
        /**
         * Habilita/deshabilita la edición de los datos de un registro MDBROILERPRODUCT
         * @param  {Boolean} edit "true" si habilita la edición, "false" si la deshabilita
         */
        _editRecordValues: function (edit) {

            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");
            abaBreedsAndStagesModel.setProperty("/name/editable", edit);
            abaBreedsAndStagesModel.setProperty("/code/editable", edit);
            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/editable", edit);
            abaBreedsAndStagesModel.setProperty("/abaProcesses/editable", edit);
            abaBreedsAndStagesModel.setProperty("/abaFormulation/editable", edit);
            abaBreedsAndStagesModel.setProperty("/stages/editable", edit);
        },
        /**
         * Se define un campo como obligatorio o no, de un registro MDBROILERPRODUCT
         * @param  {Boolean} edit "true" si es campo obligatorio, "false" si no es obligatorio
         */
        _editRecordRequired: function (edit) {
            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");
            abaBreedsAndStagesModel.setProperty("/name/required", edit);
            abaBreedsAndStagesModel.setProperty("/code/required", edit);
            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/required", edit);
            abaBreedsAndStagesModel.setProperty("/abaProcesses/required", edit);
            abaBreedsAndStagesModel.setProperty("/abaFormulation/required", edit);
            abaBreedsAndStagesModel.setProperty("/stages/required", edit);
        },
        /**
         * Solicita al servicio correspondiente crear un registro MDBROILERPRODUCT
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCreate: function (oEvent) {
            //Si el registro que se desea crear es válido

            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");
            let stages = abaBreedsAndStagesModel.getProperty("/stages/value");
            if (this._validRecord() && this.verifyInputs(stages)) {
                if (stages.length > 0) {
                    console.log("Voy a insertar");
                    var that = this,
                        util = this.getView().getModel("util"),
                        serviceUrl = util.getProperty("/serviceUrl");

                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            "code": abaBreedsAndStagesModel.getProperty("/code/value"),
                            "name": abaBreedsAndStagesModel.getProperty("/name/value"),
                            "abaConsumptionAndMortality": abaBreedsAndStagesModel.getProperty("/abaConsumptionAndMortality"),
                            "abaProcesses": abaBreedsAndStagesModel.getProperty("/abaProcesses"),
                            "abaFormulation": abaBreedsAndStagesModel.getProperty("/abaFormulation/value"),
                            "stages": abaBreedsAndStagesModel.getProperty("/stages/value")

                        }),
                        url: urlPath + "/addBreedsAndStageWithStages",
                        dataType: "json",
                        async: true,
                        success: function (data) {
                            util.setProperty("/busy/", false);
                            that._resetRecordValues();
                            that.onToast(that.getI18n().getText("OS.recordCreated"));
                            that.getRouter().navTo("abaStages", {}, true /*no history*/ );

                        },
                        error: function (request) {
                            var msg = request.statusText;
                            that.onToast("Error: " + msg);
                            console.log("Read failed: ", request);
                        }
                    });
                } else {
                    this.onToast("Debe seleccionar al menos una fase");
                }

            }
        },

        /**
         *  valida que los input de producción esten llenos correctamente
         * @param {JSON} stages Cantidad de semanas
         * @param {boolean} [update=false] true para editar, false para crear
         * @returns {boolean} true si estan correctos, false si estan incorrectos
         */
        verifyInputs: function (stages, update = false) {
            let bSuccess = true;
            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");

            for (let i = 0; i < stages.length; ++i) {

                if ((stages[i].duration === "") || (parseFloat(stages[i].duration) === 0) || (stages[i].duration === null)) {
                    stages[i].state = "Error";
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/state", "Error");
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/stateText", (parseFloat(stages[i].duration) === 0) ? "Debe ser mayor a cero (0)" : "No puede ser vacio")
                    bSuccess = bSuccess && false;

                } else {
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/state", "None");
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/stateText", "");
                    bSuccess = bSuccess && true;
                }

                if ((stages[i].name === "") || (parseFloat(stages[i].name) === 0) || (stages[i].name === null)) {
                    stages[i].state1 = "Error";
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/state1", "Error");
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/stateText1", (parseFloat(stages[i].name) === 0) ? "Debe ser mayor a cero (0)" : "No puede ser vacio")
                    bSuccess = bSuccess && false;

                } else {
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/state1", "None");
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/stateText1", "");
                    bSuccess = bSuccess && true;
                }
                if ((stages[i].id_formulation === "") || (parseFloat(stages[i].id_formulation) === 0) || (stages[i].id_formulation === null)) {
                    stages[i].state2 = "Error";
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/state2", "Error");
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/stateText2", "No puede ser vacio")
                    bSuccess = bSuccess && false;

                } else {
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/state2", "None");
                    abaBreedsAndStagesModel.setProperty("/stages/value/" + i + "/stateText2", "");
                    bSuccess = bSuccess && true;
                }
            }


            return bSuccess;
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
            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES"),
                flag = true;


            if (abaBreedsAndStagesModel.getProperty("/abaConsumptionAndMortality/id") === "") {
                flag = false;
                abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/state", "Error");
                abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/state", "None");
                abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/stateText", "");
            }

            if (abaBreedsAndStagesModel.getProperty("/abaProcesses/id") === "") {
                flag = false;
                abaBreedsAndStagesModel.setProperty("/abaProcesses/state", "Error");
                abaBreedsAndStagesModel.setProperty("/abaProcesses/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaBreedsAndStagesModel.setProperty("/abaProcesses/state", "None");
                abaBreedsAndStagesModel.setProperty("/abaProcesses/stateText", "");
            }

            if (abaBreedsAndStagesModel.getProperty("/code/value") === "") {
                flag = false;
                abaBreedsAndStagesModel.setProperty("/code/state", "Error");
                abaBreedsAndStagesModel.setProperty("/code/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaBreedsAndStagesModel.setProperty("/code/state", "None");
                abaBreedsAndStagesModel.setProperty("/code/stateText", "");
            }

            if (abaBreedsAndStagesModel.getProperty("/name/value") === "") {
                flag = false;
                abaBreedsAndStagesModel.setProperty("/name/state", "Error");
                abaBreedsAndStagesModel.setProperty("/name/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaBreedsAndStagesModel.setProperty("/name/state", "None");
                abaBreedsAndStagesModel.setProperty("/name/stateText", "");
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
        _viewOptions: function () {
            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");
            abaBreedsAndStagesModel.setProperty("/save/", false);
            abaBreedsAndStagesModel.setProperty("/cancel/", false);
            abaBreedsAndStagesModel.setProperty("/modify/", true);
            abaBreedsAndStagesModel.setProperty("/delete/", true);

            this._editRecordValues(false);
            this._editRecordRequired(false);
        },
        /**
         * Solicita al servicio correspondiente actualizar un registro MDBROILERPRODUCT
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onUpdate: function (oEvent) {
            /**
             * Si el registro que se quiere actualizar es válido y hubo algún cambio
             */
            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");
            let stages = abaBreedsAndStagesModel.getProperty("/stages/value");
            if (this._validRecord() && this.verifyInputs(stages)) {
                /**
                 * @type {JSONModel} MDBROILERPRODUCT       Referencia al modelo "MDBROILERPRODUCT"
                 * @type {JSONModel} util         Referencia al modelo "util"
                 * @type {Controller} that         Referencia a este controlador
                 */
                var util = this.getView().getModel("util");
                var serviceUrl = util.getProperty("/serviceUrl");
                var that = this;
                console.log("Actualizar el ID: ", abaBreedsAndStagesModel.getProperty("/selectedRecord/broiler_product_id/"));
                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "id": abaBreedsAndStagesModel.getProperty("/id/value"),
                        "code": abaBreedsAndStagesModel.getProperty("/code/value"),
                        "name": abaBreedsAndStagesModel.getProperty("/name/value"),
                        "abaConsumptionAndMortality": abaBreedsAndStagesModel.getProperty("/abaConsumptionAndMortality"),
                        "abaProcesses": abaBreedsAndStagesModel.getProperty("/abaProcesses"),
                        "abaFormulation": abaBreedsAndStagesModel.getProperty("/abaFormulation/value"),
                        "stages": abaBreedsAndStagesModel.getProperty("/stages/value")
                    }),
                    url: urlPath + "/updateBreedsAndStageWithStages",
                    dataType: "json",
                    async: true,
                    success: function (data) {

                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that._viewOptions();
                        that.onToast(that.getI18n().getText("OS.recordUpdated"));
                        that.getRouter().navTo("abaStages", {}, true /*no history*/ );

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

            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");

            abaBreedsAndStagesModel.setProperty("/handleType/", "Delete");
            abaBreedsAndStagesModel.setProperty("/save/", true);
            abaBreedsAndStagesModel.setProperty("/cancel/", true);
            abaBreedsAndStagesModel.setProperty("/modify/", false);
            abaBreedsAndStagesModel.setProperty("/delete/", false);
            console.log(abaBreedsAndStagesModel);
            this._editRecordRequired(true);
            this._editRecordValues(true);
        },
        onConfirmDelete: function (oEvent) {

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
                        let abaBreedsAndStagesModel = that.getView().getModel("ABABREEDSANDSTAGES");

                        $.ajax({
                            type: "DELETE",
                            contentType: "application/json",
                            data: JSON.stringify({
                                "id": abaBreedsAndStagesModel.getProperty("/id/value")
                            }),
                            url: urlPath,
                            dataType: "json",
                            async: true,
                            success: function (data) {

                                util.setProperty("/busy/", false);
                                that.getRouter().navTo("abaStages", {}, true);
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

        loadData: function(){
            let that = this;
            let abaBreedsAndStagesModel = that.getView().getModel("ABABREEDSANDSTAGES");
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/abaConsumptionAndMortality",
                dataType: "json",
                async: true,
                success: function (data) {
                    //todo reemplazar mas adelante
                    abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/value", data.data);
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
                url: "/process",
                dataType: "json",
                async: true,
                success: function (data) {
                    //todo reemplazar mas adelante
                    abaBreedsAndStagesModel.setProperty("/abaProcesses/value", data.data);
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
                url: "/abaFormulation",
                dataType: "json",
                async: true,
                success: function (data) {
                    //todo reemplazar mas adelante
                    abaBreedsAndStagesModel.setProperty("/abaFormulation/value", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast("Error: " + msg);
                    console.log("Read failed: ", request);
                }
            });
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
        onViewStagesRecord: function (oEvent) {

            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");
            abaBreedsAndStagesModel.setProperty("/save/", false);
            abaBreedsAndStagesModel.setProperty("/handleType/", "None");
            abaBreedsAndStagesModel.setProperty("/cancel/", false);
            abaBreedsAndStagesModel.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("ABABREEDSANDSTAGES"));

            abaBreedsAndStagesModel.setProperty("/id/value", oEvent.getSource().getBindingContext("ABABREEDSANDSTAGES").getObject().id);
            abaBreedsAndStagesModel.setProperty("/code/value", oEvent.getSource().getBindingContext("ABABREEDSANDSTAGES").getObject().code);
            abaBreedsAndStagesModel.setProperty("/name/value", oEvent.getSource().getBindingContext("ABABREEDSANDSTAGES").getObject().name);


            //todo pasar el id correcto y crear consulta de back para que busque por este
            $.ajax({
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "id": abaBreedsAndStagesModel.getProperty("/id/value")
                }),
                url: "/abaStagesOfBreedsAndStages" + "/findByIdBreedsAndStages",
                dataType: "json",
                async: true,
                success: function (data) {
                    //todo reemplazar mas adelante
                    abaBreedsAndStagesModel.setProperty("/stages/value", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast("Error: " + msg);
                    console.log("Read failed: ", request);
                }
            });

            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/id", oEvent.getSource().getBindingContext("ABABREEDSANDSTAGES").getObject().id_aba_consumption_and_mortality);
            abaBreedsAndStagesModel.setProperty("/abaProcesses/id", oEvent.getSource().getBindingContext("ABABREEDSANDSTAGES").getObject().id_process);
            // abaBreedsAndStagesModel.setProperty("/stages/value", oEvent.getSource().getBindingContext("ABABREEDSANDSTAGES").getObject().stages);

            this.getRouter().navTo("abaStages_Record", {}, false /*create history*/ );
        },


        /**
         * Cancela la edición de un registro MDSTAGE
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCancelEdit: async function (oEvent) {
            /** @type {JSONModel} MDSTAGE  Referencia al modelo MDSTAGE */

            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");
            var selectPath = abaBreedsAndStagesModel.getProperty("/selectedRecordPath/").sPath;
            var key = selectPath.split("/");
            abaBreedsAndStagesModel.setProperty("/name/value", abaBreedsAndStagesModel.getProperty(abaBreedsAndStagesModel.getProperty("/selectedRecordPath/") + "/name"));
            abaBreedsAndStagesModel.setProperty("/code/value", abaBreedsAndStagesModel.getProperty(abaBreedsAndStagesModel.getProperty("/selectedRecordPath/") + "/code"));
            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/id", abaBreedsAndStagesModel.getProperty(abaBreedsAndStagesModel.getProperty("/selectedRecordPath/") + "/id_aba_consumption_and_mortality"));
            abaBreedsAndStagesModel.setProperty("/abaProcesses/id", abaBreedsAndStagesModel.getProperty(abaBreedsAndStagesModel.getProperty("/selectedRecordPath/") + "/id_process"));
            abaBreedsAndStagesModel.setProperty("/handleType/", "None");

            await $.ajax({
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "id": abaBreedsAndStagesModel.getProperty(abaBreedsAndStagesModel.getProperty("/selectedRecordPath/") + "/id")
                }),
                url: "/abaStagesOfBreedsAndStages" + "/findByIdBreedsAndStages",
                dataType: "json",
                async: true,
                success: function (data) {
                    abaBreedsAndStagesModel.setProperty("/records2/" , data.data);
                    abaBreedsAndStagesModel.setProperty("/stages/value", abaBreedsAndStagesModel.getProperty("/records2/"));
                },
                error: function (request) {
                    var msg = request.statusText;
                    console.log("Read failed: ", request);
                }
            });

            abaBreedsAndStagesModel.setProperty("/abaProcesses/state", "None");
            abaBreedsAndStagesModel.setProperty("/abaProcesses/stateText", "");
            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/state", "None");
            abaBreedsAndStagesModel.setProperty("/abaConsumptionAndMortality/stateText", "");
            this.onView();
        },
        /**
         * Ajusta la vista para visualizar los datos de un registro
         */
        onView: function () {
            this._viewOptions();
        },

        onstagesProductSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("stagesProductTable").getBinding("items");

            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                var filter1 = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters = new sap.ui.model.Filter([filter1]);
            }

            //se actualiza el binding de la lista
            binding.filter(aFilters);

        },
        addToStages: function (oEvent) {
            //todo obtener data
            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");
            let temp = abaBreedsAndStagesModel.getProperty("/stages/value");
            if (temp != "") {
                temp.push({
                    "id": null,
                    "name": null,
                    "duration": null,
                    "id_formulation": null
                });
            } else {
                temp = [{
                    "id": null,
                    "name": null,
                    "duration": null,
                    "id_formulation": null
                }];
            }
            console.log(temp);
            abaBreedsAndStagesModel.setProperty("/stages/value", temp);
            console.log(temp);

        },
        handleDelete: function (oEvent) {
            var abaBreedsAndStagesModel = this.getView().getModel("ABABREEDSANDSTAGES");
            let temp = abaBreedsAndStagesModel.getProperty("/stages/value");
            // let donno = oEvent.getSource().getBindingContext("ABAFORMULATION").getObject().id;
            //todo con esto busco en el modelo el primero que cumpla con todas esas caracteristicas y lo elimino
            let path = oEvent.getParameter("listItem").getBindingContext("ABABREEDSANDSTAGES").getPath()
                .split("/");
            let index = path.pop();
            path = path.join("/");
            let items = abaBreedsAndStagesModel.getProperty(path);
            items.splice(index, 1);
            abaBreedsAndStagesModel.setProperty(path, items);
        }
    });
});