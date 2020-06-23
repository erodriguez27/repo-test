sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button"
], function (BaseController, JSONModel, Dialog, Button) {
    "use strict";
    const urlPath = "/abaElements";
    return BaseController.extend("technicalConfiguration.controller.abaElements", {

        onInit: function () {
            //ruta para la vista principal
            this.getOwnerComponent().getRouter().getRoute("abaElements").attachPatternMatched(this._onRouteMatched, this);
            //ruta para la vista de detalles de un registro
            this.getOwnerComponent().getRouter().getRoute("abaElements_Record").attachPatternMatched(this._onRecordMatched, this);
            //ruta para la vista de creación de un registro
            this.getOwnerComponent().getRouter().getRoute("abaElements_Create").attachPatternMatched(this._onCreateMatched, this);
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
                abaElementsModel = this.getView().getModel("ABAELEMENTS");

            //dependiendo del dispositivo, establece la propiedad "phone"
            this.getView().getModel("util").setProperty("/phone/",
                this.getOwnerComponent().getContentDensityClass() === "sapUiSizeCozy");

            //establece MDSTAGE como la entidad seleccionada
            util.setProperty("/selectedEntity/", "abaElements");

            //obtiene los registros de mdbroilerProduct
            this.onRead(that, util, abaElementsModel);
        },
        /**
         * Obtiene todos los registros de MDBROILERPRODUCT
         * @param  {Controller} that         Referencia al controlador que llama esta función
         * @param  {JSONModel} util         Referencia al modelo "util"
         * @param  {JSONModel} MDBROILERPRODUCT Referencia al modelo "MDBROILERPRODUCT"
         */
        onRead: function (that, util, abaElementsModel) {
            /** @type {Object} settings opciones de la llamada a la función ajax */
            var service = util.getProperty("/serviceUrl");
            var settings = {
                url: urlPath,
                method: "GET",
                success: function (res) {
                    console.log(res.data);

                    util.setProperty("/busy/", false);
                    abaElementsModel.setProperty("/records/", res.data);
                    console.log(abaElementsModel);
                },
                error: function (err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                    //that.onConnectionError();
                }
            };
            console.log(util);
            util.setProperty("/busy/", true);
            abaElementsModel.setProperty("/records/", []);
            $.ajax(settings);
        },
        /**
         * Navega a la vista para crear un nuevo registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNewRecord: function (oEvent) {
            var abaElementsModel = this.getView().getModel("ABAELEMENTS");
            var that = this;
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/abaElementsProperties",
                dataType: "json",
                async: false,
                success: function (data) {
                    console.log(data);
                    abaElementsModel.setProperty("/id_aba_element_property", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast('Error: ' + msg);
                    console.log("Read failed: ", request);
                }
            });
            this.getRouter().navTo("abaElements_Create", {}, false /*create history*/ );
        },
        /**
         * Coincidencia de ruta para acceder a la creación de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onCreateMatched: function (oEvent) {

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
            var abaElementsModel = this.getView().getModel("ABAELEMENTS");

            abaElementsModel.setProperty("/id/value", "");
            abaElementsModel.setProperty("/code/editable", true);
            abaElementsModel.setProperty("/code/value", "");
            abaElementsModel.setProperty("/code/state", "None");
            abaElementsModel.setProperty("/code/stateText", "");
            abaElementsModel.setProperty("/name/editable", true);
            abaElementsModel.setProperty("/name/value", "");
            abaElementsModel.setProperty("/name/state", "None");
            abaElementsModel.setProperty("/name/stateText", "");
            abaElementsModel.setProperty("/equivalent_quantity/editable", true);
            abaElementsModel.setProperty("/equivalent_quantity/value", "");
            abaElementsModel.setProperty("/equivalent_quantity/state", "None");
            abaElementsModel.setProperty("/equivalent_quantity/stateText", "");

        },
        /**
         * Habilita/deshabilita la edición de los datos de un registro MDBROILERPRODUCT
         * @param  {Boolean} edit "true" si habilita la edición, "false" si la deshabilita
         */
        _editRecordValues: function (edit) {

            var abaElementsModel = this.getView().getModel("ABAELEMENTS");
            abaElementsModel.setProperty("/code/editable", edit);
            abaElementsModel.setProperty("/name/editable", edit);
            abaElementsModel.setProperty("/order/editable", edit);
            abaElementsModel.setProperty("/equivalent_quantity/editable", edit);
            abaElementsModel.setProperty("/id_aba_element_property/editable", edit);
        },
        /**
         * Se define un campo como obligatorio o no, de un registro MDBROILERPRODUCT
         * @param  {Boolean} edit "true" si es campo obligatorio, "false" si no es obligatorio
         */
        _editRecordRequired: function (edit) {
            var abaElementsModel = this.getView().getModel("ABAELEMENTS");
            abaElementsModel.setProperty("/code/required", edit);
            abaElementsModel.setProperty("/name/required", edit);
            abaElementsModel.setProperty("/equivalent_quantity/required", edit);
            abaElementsModel.setProperty("/id_aba_element_property/required", edit);
            // abaElementsModel.setProperty("/order/required", edit);
        },
        /**
         * Solicita al servicio correspondiente crear un registro MDBROILERPRODUCT
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCreate: function (oEvent) {
            //Si el registro que se desea crear es válido
            if (this._validRecord()) {
                console.log("Voy a insertar");
                var that = this,
                    util = this.getView().getModel("util"),
                    serviceUrl = util.getProperty("/serviceUrl"),
                    abaElementsModel = this.getView().getModel("ABAELEMENTS");

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "code": abaElementsModel.getProperty("/code/value"),
                        "name": abaElementsModel.getProperty("/name/value"),
                        "id_aba_element_property": abaElementsModel.getProperty("/id_aba_element_property/id"),
                        "equivalent_quantity": abaElementsModel.getProperty("/equivalent_quantity/value")
                    }),
                    url: urlPath,
                    dataType: "json",
                    async: true,
                    success: function (data) {
                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that.onToast(that.getI18n().getText("OS.recordCreated"));
                        that.getRouter().navTo("abaElements", {}, true /*no history*/ );

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
            var abaElementsModel = this.getView().getModel("ABAELEMENTS"),
                flag = true;

            if (abaElementsModel.getProperty("/code/value") === "") {
                flag = false;
                abaElementsModel.setProperty("/code/state", "Error");
                abaElementsModel.setProperty("/code/stateText", this.getI18n().getText("enter.FIELD"));
            }else{
                abaElementsModel.setProperty("/code/state", "None");
                abaElementsModel.setProperty("/code/stateText","");
            }
            if (abaElementsModel.getProperty("/name/value") === "") {
                flag = false;
                abaElementsModel.setProperty("/name/state", "Error");
                abaElementsModel.setProperty("/name/stateText", this.getI18n().getText("enter.FIELD"));
            }else{
                abaElementsModel.setProperty("/name/state", "None");
                abaElementsModel.setProperty("/name/stateText","");
            }

            if (abaElementsModel.getProperty("/id_aba_element_property/id") === "" || abaElementsModel.getProperty("/id_aba_element_property/id") == undefined)  {
                flag = false;
                abaElementsModel.setProperty("/id_aba_element_property/state", "Error");
                abaElementsModel.setProperty("/id_aba_element_property/stateText", this.getI18n().getText("enter.FIELD"));
            }else{
                abaElementsModel.setProperty("/id_aba_element_property/state", "None");
                abaElementsModel.setProperty("/id_aba_element_property/stateText","");
            }

            if (abaElementsModel.getProperty("/equivalent_quantity/value") === "" || abaElementsModel.getProperty("/equivalent_quantity/value") == undefined) {
                flag = false;
                abaElementsModel.setProperty("/equivalent_quantity/state", "Error");
                abaElementsModel.setProperty("/equivalent_quantity/stateText", this.getI18n().getText("enter.FIELD"));
            }else{
                abaElementsModel.setProperty("/equivalent_quantity/state", "None");
                abaElementsModel.setProperty("/equivalent_quantity/stateText","");
            }

            console.log(abaElementsModel);
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
            var abaElementsModel = this.getView().getModel("ABAELEMENTS");
            abaElementsModel.setProperty("/save/", false);
            abaElementsModel.setProperty("/cancel/", false);
            abaElementsModel.setProperty("/modify/", true);
            abaElementsModel.setProperty("/delete/", true);

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
            if (this._validRecord() && this._recordChanged()) {
                /**
                 * @type {JSONModel} MDBROILERPRODUCT       Referencia al modelo "MDBROILERPRODUCT"
                 * @type {JSONModel} util         Referencia al modelo "util"
                 * @type {Controller} that         Referencia a este controlador
                 */
                var abaElementsModel = this.getView().getModel("ABAELEMENTS");
                var util = this.getView().getModel("util");
                var serviceUrl = util.getProperty("/serviceUrl");
                var that = this;
                console.log("Actualizar el ID: ", abaElementsModel.getProperty("/id/value"));
                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "id": abaElementsModel.getProperty("/id/value"),
                        "code": abaElementsModel.getProperty("/code/value"),
                        "name": abaElementsModel.getProperty("/name/value"),
                        "id_aba_element_property": abaElementsModel.getProperty("/id_aba_element_property/id"),
                        "equivalent_quantity": abaElementsModel.getProperty("/equivalent_quantity/value")
                    }),
                    url: urlPath,
                    dataType: "json",
                    async: true,
                    success: function (data) {

                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that._viewOptions();
                        that.onToast(that.getI18n().getText("OS.recordUpdated"));
                        that.getRouter().navTo("abaElements", {}, true /*no history*/ );

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

            var abaElementsModel = this.getView().getModel("ABAELEMENTS");
            abaElementsModel.setProperty("/save/", true);
            abaElementsModel.setProperty("/cancel/", true);
            abaElementsModel.setProperty("/modify/", false);
            abaElementsModel.setProperty("/delete/", false);
            this._editRecordRequired(true);
            this._editRecordValues(true);
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
                        let abaElementsModel = that.getView().getModel("ABAELEMENTS");

                        $.ajax({
                            type: "DELETE",
                            contentType: "application/json",
                            data: JSON.stringify({
                                "id": abaElementsModel.getProperty("/id/value")
                            }),
                            url: urlPath,
                            dataType: "json",
                            async: true,
                            success: function (data) {

                                util.setProperty("/busy/", false);
                                that.getRouter().navTo("abaElements", {}, true);
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
        onViewElementsRecord: function (oEvent) {

            var abaElementModel = this.getView().getModel("ABAELEMENTS");
            
            let that = this;
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/abaElementsProperties",
                dataType: "json",
                async: false,
                success: function (data) {
                    //todo reemplazar mas adelante
                    abaElementModel.setProperty("/id_aba_element_property", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast('Error: ' + msg);
                    console.log("Read failed: ", request);
                }
            });
            abaElementModel.setProperty("/save/", false);
            abaElementModel.setProperty("/cancel/", false);
            abaElementModel.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("ABAELEMENTS"));
            abaElementModel.setProperty("/id/value", oEvent.getSource().getBindingContext("ABAELEMENTS").getObject().id);
            abaElementModel.setProperty("/code/value", oEvent.getSource().getBindingContext("ABAELEMENTS").getObject().code);
            abaElementModel.setProperty("/name/value", oEvent.getSource().getBindingContext("ABAELEMENTS").getObject().name);
            abaElementModel.setProperty("/id_aba_element_property/id", oEvent.getSource().getBindingContext("ABAELEMENTS").getObject().id_aba_element_property);
            abaElementModel.setProperty("/equivalent_quantity/value", oEvent.getSource().getBindingContext("ABAELEMENTS").getObject().equivalent_quantity);
           
            this.getRouter().navTo("abaElements_Record", {}, false /*create history*/ );
        },


        /**
         * Cancela la edición de un registro MDSTAGE
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCancelEdit: function (oEvent) {
            /** @type {JSONModel} MDSTAGE  Referencia al modelo MDSTAGE */

            var abaElementModel = this.getView().getModel("ABAELEMENTS");
            abaElementModel.setProperty("/name/value",abaElementModel.getProperty(abaElementModel.getProperty("/selectedRecordPath/")+"/name"));
            abaElementModel.setProperty("/code/value",abaElementModel.getProperty(abaElementModel.getProperty("/selectedRecordPath/")+"/code"));
            abaElementModel.setProperty("/id_aba_element_property/id",abaElementModel.getProperty(abaElementModel.getProperty("/selectedRecordPath/")+"/id_aba_element_property"));
            abaElementModel.setProperty("/equivalent_quantity/value",abaElementModel.getProperty(abaElementModel.getProperty("/selectedRecordPath/")+"/equivalent_quantity"));
            
            this.onView();
        },
        /**
         * Ajusta la vista para visualizar los datos de un registro
         */
        onView: function () {
            this._viewOptions();
        },

        onelementsProductSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("elementsProductTable").getBinding("items");

            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                var filter1 = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters = new sap.ui.model.Filter([filter1]);
            }

            //se actualiza el binding de la lista
            binding.filter(aFilters);

        }

    });
});