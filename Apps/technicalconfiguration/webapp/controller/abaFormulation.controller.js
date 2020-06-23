sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button"
], function (BaseController, JSONModel, Dialog, Button) {
    "use strict";
    const urlPath = "/abaFormulation";
    const baseUrl = "http://127.0.0.1:3001";
    return BaseController.extend("technicalConfiguration.controller.abaFormulation", {

        onInit: function () {
            //ruta para la vista principal
            this.getOwnerComponent().getRouter().getRoute("abaFormulation").attachPatternMatched(this._onRouteMatched, this);
            //ruta para la vista de detalles de un registro
            this.getOwnerComponent().getRouter().getRoute("abaFormulation_Record").attachPatternMatched(this._onRecordMatched, this);
            //ruta para la vista de creación de un registro
            this.getOwnerComponent().getRouter().getRoute("abaFormulation_Create").attachPatternMatched(this._onCreateMatched, this);
        },
        /**
         * Coincidencia de ruta para acceder a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onRouteMatched: function (oEvent) {
            let that = this,
                util = this.getView().getModel("util"),
                abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            //dependiendo del dispositivo, establece la propiedad "phone"
            this.getView().getModel("util").setProperty("/phone/",
                this.getOwnerComponent().getContentDensityClass() === "sapUiSizeCozy");
            //establece la entidad seleccionada
            util.setProperty("/selectedEntity/", "abaFormulation");
            //obtiene los registros
            this.onRead(that, util, abaFormulationModel);
        },
        /**
         * Obtiene todos los registros
         * @param  {Controller} that         Referencia al controlador que llama esta función
         * @param  {JSONModel} util         Referencia al modelo "util"
         */
        onRead: function (that, util, abaFormulationModel) {
            /** @type {Object} settings opciones de la llamada a la función ajax */
            var service = util.getProperty('/serviceUrl');
            var settings = {
                url: urlPath,
                method: "GET",
                success: function (res) {
                    console.log(res.data);
                    util.setProperty("/busy/", false);
                    abaFormulationModel.setProperty("/records/", res.data);

                },
                error: function (err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                    var msg = err.statusText;
                    that.onToast('Error: ' + msg);
                    console.log("Read failed: ", err);
                }
            };
            console.log(util);
            util.setProperty("/busy/", true);
            abaFormulationModel.setProperty("/records/", []);
            $.ajax(settings);
        },
        /**
         * Navega a la vista para crear un nuevo registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNewRecord: function (oEvent) {
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            let that = this;
            //obtener datos para los combos
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/abaElements",
                dataType: "json",
                async: true,
                success: function (data) {
                    //todo reemplazar mas adelante
                    abaFormulationModel.setProperty("/abaElements/value", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast('Error: ' + msg);
                    console.log("Read failed: ", request);
                }
            });

            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/abaElementsProperties",
                dataType: "json",
                async: true,
                success: function (data) {
                    //todo reemplazar mas adelante
                    abaFormulationModel.setProperty("/abaProperties/value", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast('Error: ' + msg);
                    console.log("Read failed: ", request);
                }
            });

            this.getRouter().navTo("abaFormulation_Create", {}, false /*create history*/ );
        },
        /**
         * Coincidencia de ruta para acceder a la creación de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onCreateMatched: function (oEvent) {
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            abaFormulationModel.setProperty("/tableType", "Delete");
            this._resetRecordValues();
            this._editRecordValues(true);
            this._editRecordRequired(true);
        },
        /**
         * Resetea todos los valores existentes en el formulario del registro
         */
        _resetRecordValues: function () {
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");

            abaFormulationModel.setProperty("/id/value", "");
            abaFormulationModel.setProperty("/code/editable", true);
            abaFormulationModel.setProperty("/code/value", "");
            abaFormulationModel.setProperty("/code/state", "None");
            abaFormulationModel.setProperty("/code/stateText", "");
            abaFormulationModel.setProperty("/name/editable", true);
            abaFormulationModel.setProperty("/name/value", "");
            abaFormulationModel.setProperty("/name/state", "None");
            abaFormulationModel.setProperty("/name/stateText", "");
            abaFormulationModel.setProperty("/order/editable", true);
            abaFormulationModel.setProperty("/order/value", "");
            abaFormulationModel.setProperty("/order/state", "None");
            abaFormulationModel.setProperty("/order/stateText", "");
            abaFormulationModel.setProperty("/alimentsAndProportions/editable", true);
            abaFormulationModel.setProperty("/alimentsAndProportions/value", "");
            abaFormulationModel.setProperty("/alimentsAndProportions/state", "None");
            abaFormulationModel.setProperty("/alimentsAndProportions/stateText", "");
            // abaFormulationModel.setProperty("/alimentsEquivalence/editable", true);
            // abaFormulationModel.setProperty("/alimentsEquivalence/value", "");
            // abaFormulationModel.setProperty("/alimentsEquivalence/state", "None");
            // abaFormulationModel.setProperty("/alimentsEquivalence/stateText", "");
        },
        /**
         * Habilita/deshabilita la edición de los datos de un registro
         * @param  {Boolean} edit "true" si habilita la edición, "false" si la deshabilita
         */
        _editRecordValues: function (edit) {
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            abaFormulationModel.setProperty("/code/editable", edit);
            abaFormulationModel.setProperty("/name/editable", edit);
            abaFormulationModel.setProperty("/order/editable", edit);
            abaFormulationModel.setProperty("/alimentsAndProportions/editable", edit);
            // abaFormulationModel.setProperty("/alimentsEquivalence/editable", edit);
        },
        /**
         * Se define un campo como obligatorio o no, de un registro
         * @param  {Boolean} edit "true" si es campo obligatorio, "false" si no es obligatorio
         */
        _editRecordRequired: function (edit) {
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            abaFormulationModel.setProperty("/code/required", edit);
            abaFormulationModel.setProperty("/name/required", edit);
            // abaFormulationModel.setProperty("/order/required", edit);
            abaFormulationModel.setProperty("/alimentsAndProportions/required", edit);
            // abaFormulationModel.setProperty("/alimentsEquivalence/required", edit);
        },
        /**
         * Solicita al servicio correspondiente crear un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCreate: function (oEvent) {
            //Si el registro que se desea crear es válido

            var that = this,
                util = this.getView().getModel("util"),
                abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            let recursos = abaFormulationModel.getProperty("/alimentsAndProportions/value");
            if (this._validRecord() && this.verifyInputs(recursos)) {
                if (recursos.length > 0) {
                    //debo insertar en varios lugares a la vez, tal vez implementar transaction
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            "code": abaFormulationModel.getProperty("/code/value"),
                            "name": abaFormulationModel.getProperty("/name/value"),
                            "elementsAndProportions": abaFormulationModel.getProperty("/alimentsAndProportions/value")
                        }),
                        url: urlPath + "/addFormula",
                        dataType: "json",
                        async: true,
                        success: function (data) {
                            util.setProperty("/busy/", false);
                            that._resetRecordValues();
                            that.onToast(that.getI18n().getText("OS.recordCreated"));
                            that.onRead(that, util, abaFormulationModel);
                            that.getRouter().navTo("abaFormulation", {}, true /*no history*/ );
                        },
                        error: function (request) {
                            var msg = request.statusText;
                            that.onToast('Error: ' + msg);
                            console.log("Read failed: ", request);
                        }
                    });
                } else {
                    this.onToast("Debe agregar al menos un macroelemento");
                }
            }
        },
        /**
         * Valida la correctitud de los datos existentes en el formulario del registro
         * @return {Boolean} Devuelve "true" si los datos son correctos, y "false" si son incorrectos
         */
        _validRecord: function () {

            var abaFormulationModel = this.getView().getModel("ABAFORMULATION"),
                flag = true;

            if (abaFormulationModel.getProperty("/code/value") === "") {
                flag = false;
                abaFormulationModel.setProperty("/code/state", "Error");
                abaFormulationModel.setProperty("/code/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaFormulationModel.setProperty("/code/state", "None");
                abaFormulationModel.setProperty("/code/stateText", "");
            }
            if (abaFormulationModel.getProperty("/name/value") === "") {
                flag = false;
                abaFormulationModel.setProperty("/name/state", "Error");
                abaFormulationModel.setProperty("/name/stateText", this.getI18n().getText("enter.FIELD"));
            } else {
                abaFormulationModel.setProperty("/name/state", "None");
                abaFormulationModel.setProperty("/name/stateText", "");
            }
            return flag;
        },

        /**
         *  valida que los input de producción esten llenos correctamente
         * @param {JSON} stages Cantidad de semanas
         * @param {boolean} [update=false] true para editar, false para crear
         * @returns {boolean} true si estan correctos, false si estan incorrectos
         */
        verifyInputs: function (recursos, update = false) {
            let bSuccess = true;
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");

            for (let i = 0; i < recursos.length; ++i) {

                if ((recursos[i].proportion === "") || (parseFloat(recursos[i].proportion) === 0) || (recursos[i].proportion === null)) {
                    recursos[i].state = "Error";
                    abaFormulationModel.setProperty("/alimentsAndProportions/value/" + i + "/state", "Error");
                    abaFormulationModel.setProperty("/alimentsAndProportions/value/" + i + "/stateText", (parseFloat(recursos[i].proportion) === 0) ? "Debe ser mayor a cero (0)" : "No puede ser vacio")
                    bSuccess = bSuccess && false;
                } else {

                    recursos[i].state = "None";
                    abaFormulationModel.setProperty("/alimentsAndProportions/value/" + i + "/state", "None");
                    abaFormulationModel.setProperty("/alimentsAndProportions/value/" + i + "/stateText", "");
                    bSuccess = bSuccess && true;
                }
                if ((recursos[i].id_aba_element === "") || (parseFloat(recursos[i].id_aba_element) === 0) || (recursos[i].id_aba_element === null)) {
                    recursos[i].state2 = "Error";
                    abaFormulationModel.setProperty("/alimentsAndProportions/value/" + i + "/state2", "Error");
                    abaFormulationModel.setProperty("/alimentsAndProportions/value/" + i + "/stateText2", "No puede ser vacio")
                    bSuccess = bSuccess && false;
                } else {

                    recursos[i].state2 = "None";
                    abaFormulationModel.setProperty("/alimentsAndProportions/value/" + i + "/state2", "None");
                    abaFormulationModel.setProperty("/alimentsAndProportions/value/" + i + "/stateText2", "");
                    bSuccess = bSuccess && true;
                }
            }
            return bSuccess;
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
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            abaFormulationModel.setProperty("/save/", false);
            abaFormulationModel.setProperty("/cancel/", false);
            abaFormulationModel.setProperty("/modify/", true);
            abaFormulationModel.setProperty("/delete/", true);
            this._editRecordValues(false);
            this._editRecordRequired(false);
        },
        /**
         * Solicita al servicio correspondiente actualizar un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onUpdate: function (oEvent) {
            /**
             * Si el registro que se quiere actualizar es válido y hubo algún cambio
             */
            let abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            let recursos = abaFormulationModel.getProperty("/alimentsAndProportions/value");
            if (this._validRecord() && this.verifyInputs(recursos)) {
                var util = this.getView().getModel("util");
                var serviceUrl = util.getProperty('/serviceUrl');
                var that = this;
                console.log("Actualizar el ID: ", abaFormulationModel.getProperty("/id/value/"));
                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "id": abaFormulationModel.getProperty("/id/value"),
                        "code": abaFormulationModel.getProperty("/code/value"),
                        "name": abaFormulationModel.getProperty("/name/value"),
                        "elementsAndProportions": abaFormulationModel.getProperty("/alimentsAndProportions/value")
                    }),
                    url: urlPath + "/updateFormula",
                    dataType: "json",
                    async: true,
                    success: function (data) {
                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that._viewOptions();
                        that.onToast(that.getI18n().getText("OS.recordUpdated"));
                        that.onRead(that, util, abaFormulationModel);
                        that.getRouter().navTo("abaFormulation", {}, true /*no history*/ );
                    },
                    error: function (request) {
                        let msg = request.statusText;
                        that.onToast('Error: ' + msg);
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
            var mdbroilerProduct = this.getView().getModel("MDBROILERPRODUCT"),
                flag = false;
            if (mdbroilerProduct.getProperty("/name/value") !== mdbroilerProduct.getProperty(mdbroilerProduct.getProperty("/selectedRecordPath/") + "/name")) {
                flag = true;
            }
            if (!flag) this.onToast('No se detectaron cambios');
            return flag;
        },
        /**
         * Ajusta la vista para editar los datos de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onEdit: function (oEvent) {
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            abaFormulationModel.setProperty("/save/", true);
            abaFormulationModel.setProperty("/cancel/", true);
            abaFormulationModel.setProperty("/modify/", false);
            abaFormulationModel.setProperty("/delete/", false);
            abaFormulationModel.setProperty("/tableType", "Delete");
            this._editRecordRequired(true);
            this._editRecordValues(true);
        },
        onConfirmDelete: function (oEvent) {
            let oBundle = this.getView().getModel("i18n").getResourceBundle(),
                deleteRecord = oBundle.getText("deleteRecord"),
                confirmation = oBundle.getText("confirmation"),
                util = this.getView().getModel("util"),
                serviceUrl = util.getProperty('/serviceUrl'),
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
                        let abaFormulationModel = that.getView().getModel("ABAFORMULATION");
                        $.ajax({
                            type: "DELETE",
                            contentType: "application/json",
                            data: JSON.stringify({
                                "id": abaFormulationModel.getProperty("/id/value")
                            }),
                            url: urlPath,
                            dataType: "json",
                            async: true,
                            success: function (data) {
                                util.setProperty("/busy/", false);
                                that.onRead(that, util, abaFormulationModel);
                                that.getRouter().navTo("abaFormulation", {}, true);
                                dialog.close();
                                dialog.destroy();
                            },
                            error: function (request, status, error) {
                                that.onToast('Error de comunicación');
                                console.log("Read failed");
                            }
                        });
                    }
                }),
                endButton: new Button({
                    text: 'No',
                    press: function () {
                        dialog.close();
                        dialog.destroy();
                    }
                })
            });
            dialog.open();
        },
        /**
         * Cancela la creación de un registro y regresa a la vista principal
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
         * Visualiza los detalles de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onViewFormulationRecord: function (oEvent) {
            //hago solicitud con el id de formulation seleccionado al back para pedirle los abaElementsAndConcentrations
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            abaFormulationModel.setProperty("/tableType", "None");
            abaFormulationModel.setProperty("/save/", false);
            abaFormulationModel.setProperty("/cancel/", false);
            let that = this;
            $.ajax({
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "id": oEvent.getSource().getBindingContext("ABAFORMULATION").getObject().id
                }),
                url: "/abaElementsAndConcentrations/findByFormulationId",
                dataType: "json",
                async: true,
                success: function (data) {
                    abaFormulationModel.setProperty("/alimentsAndProportions/value", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast('Error: ' + msg);
                    console.log("Read failed: ", request);
                }
            });

            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/abaElements",
                dataType: "json",
                async: true,
                success: function (data) {
                    abaFormulationModel.setProperty("/abaElements/value", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast('Error: ' + msg);
                    console.log("Read failed: ", request);
                }
            });

            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/abaElementsProperties",
                dataType: "json",
                async: true,
                success: function (data) {
                    abaFormulationModel.setProperty("/abaProperties/value", data.data);
                },
                error: function (request) {
                    var msg = request.statusText;
                    that.onToast('Error: ' + msg);
                    console.log("Read failed: ", request);
                }
            });

            abaFormulationModel.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("ABAFORMULATION"));
            abaFormulationModel.setProperty("/id/value", oEvent.getSource().getBindingContext("ABAFORMULATION").getObject().id);
            abaFormulationModel.setProperty("/code/value", oEvent.getSource().getBindingContext("ABAFORMULATION").getObject().code);
            abaFormulationModel.setProperty("/name/value", oEvent.getSource().getBindingContext("ABAFORMULATION").getObject().name);
            abaFormulationModel.setProperty("/order/value", oEvent.getSource().getBindingContext("ABAFORMULATION").getObject().order);
            abaFormulationModel.setProperty("/alimentsEquivalence/value", oEvent.getSource().getBindingContext("ABAFORMULATION").getObject().alimentsEquivalence);

            this.getRouter().navTo("abaFormulation_Record", {}, false /*create history*/ );
        },
        /**
         * Cancela la edición de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCancelEdit: async function (oEvent) {
            /** @type {JSONModel} Referencia al modelo */
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            var selectPath = abaFormulationModel.getProperty("/selectedRecordPath/").sPath;
            var key = selectPath.split("/");
            abaFormulationModel.setProperty("/code/value", abaFormulationModel.getProperty(abaFormulationModel.getProperty("/selectedRecordPath/") + "/code"));
            abaFormulationModel.setProperty("/name/value", abaFormulationModel.getProperty(abaFormulationModel.getProperty("/selectedRecordPath/") + "/name"));

            await $.ajax({
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "id": abaFormulationModel.getProperty(abaFormulationModel.getProperty("/selectedRecordPath/") + "/id"),
                }),
                url: "/abaElementsAndConcentrations/findByFormulationId",
                dataType: "json",
                async: true,
                success: function (data) {
                    abaFormulationModel.setProperty("/records2/", data.data);

                    abaFormulationModel.setProperty("/alimentsAndProportions/value", abaFormulationModel.getProperty("/records2/"));
                },
                error: function (request) {
                    var msg = request.statusText;
                    // that.onToast('Error: ' + msg);
                    console.log("Read failed: ", request);
                }
            });
            abaFormulationModel.setProperty("/tableType", "None");
            await this.onView();
        },
        /**
         * Ajusta la vista para visualizar los datos de un registro
         */
        onView: function () {
            this._viewOptions();
        },
        onformulationProductSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("formulationProductTable").getBinding("items");
            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                var filter1 = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters = new sap.ui.model.Filter([filter1]);
            }
            //se actualiza el binding de la lista
            binding.filter(aFilters);
        },
        addToAlimentsAndProportions: function (oEvent) {
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            let temp = abaFormulationModel.getProperty("/alimentsAndProportions/value");
            if (temp != "") {
                temp.push({
                    "id": null,
                    "id_aba_element": null,
                    "id_aba_formulation": null,
                    "proportion": null,
                    "id_element_equivalent": null,
                    "id_aba_element_property": null,
                    "equivalent_quantity": null
                });
            } else {
                temp = [{
                    "id": null,
                    "id_aba_element": null,
                    "id_aba_formulation": null,
                    "proportion": null,
                    "id_element_equivalent": null,
                    "id_aba_element_property": null,
                    "equivalent_quantity": null
                }];
            }
            console.log(temp);
            abaFormulationModel.setProperty("/alimentsAndProportions/value", temp);
            console.log(temp);
        },
        handleDelete: function (oEvent) {
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            let temp = abaFormulationModel.getProperty("/alimentsAndProportions/value");
            //con esto busco en el modelo el primero que cumpla con todas esas caracteristicas y lo elimino
            let path = oEvent.getParameter("listItem").getBindingContext("ABAFORMULATION").getPath()
                .split("/");
            let index = path.pop();
            path = path.join('/');
            let items = abaFormulationModel.getProperty(path)
            items.splice(index, 1)
            abaFormulationModel.setProperty(path, items)
        },
        handleDeleteOfEquivalent: function (oEvent) {
            var abaFormulationModel = this.getView().getModel("ABAFORMULATION");
            let temp = abaFormulationModel.getProperty("/alimentsAndProportions/value");
            //con esto busco en el modelo el primero que cumpla con todas esas caracteristicas y lo elimino
            let path = oEvent.getParameter("listItem").getBindingContext("ABAFORMULATION").getPath()
                .split("/");
            let index = path.pop();
            path = path.join('/');
            let items = abaFormulationModel.getProperty(path);
            items[0].id_element_equivalent = null;
            items[0].id_aba_element_property = null;
            items[0].equivalent_quantity = null;
            // items.splice(index, 1)
            abaFormulationModel.setProperty(path, items)
        },
        validateFloatInput: function (o) {
            let input = o.getSource();
            let floatLength = 10,
                intLength = 10;
            let value = input.getValue()
            let regex = new RegExp(`/^([0-9]{1,${intLength}})([.][0-9]{0,${floatLength}})?$/`)
            if (regex.test(value)) {
                input.setValueState('None')
                input.setValueStateText('')
                return true
            } else {
                let pNumber = 0
                let aux = value
                    .split('')
                    .filter(char => {
                        if (/^[0-9.]$/.test(char)) {
                            if (char !== '.') {
                                return true
                            } else {
                                if (pNumber === 0) {
                                    pNumber++
                                    return true
                                }
                            }
                        }
                    })
                    .join('')
                    .split('.')
                value = aux[0].substring(0, intLength)
                if (aux[1] !== undefined) {
                    value += '.' + aux[1].substring(0, floatLength)
                }
                input.setValue(value)
                return false
            }
        }
    });
});