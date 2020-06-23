sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/m/Dialog",
    "sap/m/Button"
], function (BaseController, JSONModel, Sorter, Filter, Dialog, Button) {
    "use strict";
    const that2 = this;
    return BaseController.extend("technicalConfiguration.controller.optimizer", {

        onInit: function () {
            //ruta para la vista principal
            this.getOwnerComponent().getRouter().getRoute("optimizer").attachPatternMatched(this._onRouteMatched, this);
            //ruta para la vista de detalles de un registro
            //this.getOwnerComponent().getRouter().getRoute("mdprocess_Record").attachPatternMatched(this._onRecordMatched, this);
            //ruta para la vista de creación de un registro
            //this.getOwnerComponent().getRouter().getRoute("txposturecurve_Create").attachPatternMatched(this._onCreateMatched, this);
        },

        /**
         * Coincidencia de ruta para acceder a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onRouteMatched: function (oEvent) {
            var that = this,
                util = this.getView().getModel("util")
            let modelo = this.getView().getModel("optimizer")
            console.log("sddsdvd");
            //establece process como la entidad seleccionada
            util.setProperty("/selectedEntity/", "optimizer");
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/ave_simulator/findParameter",
                dataType: "json",
                success: function (data) {
                    console.log("Read failed: ", data);
                    modelo.setProperty("/register", data.data)
                    modelo.setProperty("/breed", data.breed)
                    modelo.setProperty("/breedTrue", data.parameterActive)
                },
                error: function (request) {
                    console.log("Read failed: ", request);
                    var msg = request.statusText;
                }
            })


        },
        onConfirmActive: function (act) {
            let valorId = act;
            let that = this;
            $.ajax({
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({
                    "optimizer_id": valorId.optimizerparameter_id,
                    "breed_id": valorId.breed_id,
                    "active": valorId.active
                }),
                url: "/ave_simulator/changeActive",
                dataType: "json",
                async: true,
                success: function (data) {

                    that._onRouteMatched();
                },
                error: function (request, status, error) {
                    that.onToast("Error de comunicación");
                    console.log("Read failed");
                }
            });
        },
        onChangeActive: function (oEvent) {
            let that = this;
            let act = oEvent.getSource().getBindingContext("optimizer").getObject();
            let breedTrue = this.getView().getModel('optimizer').getProperty("/breedTrue")
            let setTrue = breedTrue.find(el => el.breed_id === act.breed_id);
            if (setTrue != undefined) {

                this.dialog = new Dialog({
                    title: "Confirmación",
                    type: "Message",
                    content: new sap.m.Text({
                        text: "¿Desea cambiar el par\u00E1metro activo?"
                    }),
                    beginButton: new Button({
                        text: "Ok",
                        press: function () {
                            that.onConfirmActive(act);
                            that.dialog.close();
                        }.bind(that)
                    }),
                    endButton: new Button({
                        text: "Cancelar",
                        press: function () {
                            that._onRouteMatched();
                            that.dialog.close();
                        }.bind(that)
                    }),
                    afterClose: function () {
                        //todo
                    }
                });
                this.getView().addDependent(this.dialog);
                this.dialog.open();
            } else {
                that.onConfirmActive(act);
            }
        },
        onDeleteRecord: function () {
            let util = this.getModel("util"),
                serviceUrl = util.getProperty("/serviceUrl");
            util.setProperty("/busy/", true);
            let modelo = this.getView().getModel("optimizer")

            let valorId = modelo.getProperty("/newData").optimizerparameter_id
            let that = this
            $.ajax({
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    "optimizer_id": parseInt(valorId)
                }),
                url: "/ave_simulator/DeleteParameter",
                dataType: "json",
                async: true,
                success: function (data) {
                    util.setProperty("/busy/", false);
                    that.onNavBack();

                },
                error: function (request, status, error) {
                    that.onToast("Error de comunicación");
                    console.log("Read failed");
                }
            });

        },
        onModRecordFalse: async function (oEvent) {
            let modelo = this.getView().getModel("optimizer")
            modelo.setProperty("/modify", true)
            modelo.setProperty("/detele", true)
            modelo.setProperty("/save", false)
            modelo.setProperty("/active", false)
        },
        onModRecord: async function (oEvent) {
            let modelo = this.getView().getModel("optimizer")
            modelo.setProperty("/modify", false)
            modelo.setProperty("/detele", false)
            modelo.setProperty("/save", true)
            modelo.setProperty("/active", true)
        },
        onViewShedRecord: async function (oEvent) {
            let valorId = oEvent.getSource().getBindingContext("optimizer").getObject()
            let modelo = this.getView().getModel("optimizer")
            modelo.setProperty("/newData", valorId)
            modelo.setProperty("/create", false)
            modelo.setProperty("/modify", true)
            modelo.setProperty("/detele", true)
            modelo.setProperty("/save", false)
            modelo.setProperty("/active", false)
            this.getRouter().navTo("optimizer_Create", {}, true);
        },
        onConfirmDelete: function (oEvent) {

            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var confirmation = oBundle.getText("confirmation");

            var that = this;
            var dialog = new Dialog({
                title: confirmation,
                type: "Message",
                content: new sap.m.Text({
                    text: "¿Desea eliminar el parámetro?"
                }),

                beginButton: new Button({
                    text: "Si",
                    press: function () {
                        dialog.close();
                        that.onDeleteRecord();
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
        onUpdate: function (oEvent) {
            let modelo = this.getView().getModel("optimizer")
            let that = this
            let id = modelo.getProperty("/newData").optimizerparameter_id
            let max = this.getView().byId("inputMax").getValue()
            let min = this.getView().byId("inputMin").getValue()
            let dif = this.getView().byId("inputDif").getValue()
            let selectBreed = this.getView().byId("selectBreed").getSelectedKey()
            if (this.validateInt(max) && this.validateInt(min) && this.validateFloat(dif) && this.validateInt(selectBreed)) {

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: "/ave_simulator/updateParameter",
                    dataType: "json",
                    data: JSON.stringify({
                        "id": parseInt(id),
                        "breed_id": parseInt(selectBreed),
                        "max_housing": parseInt(max),
                        "min_housing": parseInt(min),
                        "difference": parseFloat(dif),
                    }),
                    success: function (data) {

                        that.onNavBack();
                    },
                    error: function (request) {
                        console.log("Read failed: ", request);
                        var msg = request.statusText;
                    }
                })
            } else {
                if (!this.validateInt(max)) {
                    this.getView().byId("inputMax").setValueState("Error")
                    this.getView().byId("inputMax").setValueStateText("El campo no debe ser vacio")
                }
                if (!this.validateInt(min)) {
                    this.getView().byId("inputMin").setValueState("Error")
                    this.getView().byId("inputMin").setValueStateText("El campo no debe ser vacio")
                }
                if (!this.validateFloat(dif)) {
                    this.getView().byId("inputDif").setValueState("Error")
                    this.getView().byId("inputDif").setValueStateText("El campo no debe ser vacio")
                }
                if (!this.validateInt(selectBreed)) {
                    this.getView().byId("selectBreed").setValueState("Error")
                    this.getView().byId("selectBreed").setValueStateText("Seleccione raza")
                }
                modelo.setProperty("/enable", false)
            }

        },
        validateIntInput: function (o) {
            let input = o.getSource();
            let value = input.getValue();
            let modelo = this.getView().getModel("optimizer");
            if (this.validateInt(value)) {
                var id = input.sId.split("--")
                input.setValueStateText("")
                input.setValueState("None")
                modelo.setProperty("/enable", true)
                if (id[1] == "inputMin") {
                    if (parseInt(this.getView().byId("inputMax").getValue()) <= parseInt(value)) {
                        input.setValueStateText("Tiene que ser menor al máximo")
                        input.setValueState("Error")
                        modelo.setProperty("/enable", false)
                    } else {
                        this.getView().byId("inputMax").setValueStateText("")
                        this.getView().byId("inputMax").setValueState("None")
                        modelo.setProperty("/enable", true)
                    }
                }

                if (id[1] == "inputMax") {
                    if (parseInt(this.getView().byId("inputMin").getValue()) >= parseInt(value)) {
                        input.setValueStateText("Tiene que ser mayor al mínimo")
                        input.setValueState("Error")
                        modelo.setProperty("/enable", false)
                    } else {
                        this.getView().byId("inputMin").setValueStateText("")
                        this.getView().byId("inputMin").setValueState("None")
                        modelo.setProperty("/enable", true)
                    }
                }

            } else {

                input.setValue(value.substr(0, value.length - 1))
            }
        },
        onCurveSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("curveTable").getBinding("items");

            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                var filter1 = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters = new sap.ui.model.Filter([filter1]);
            }

            //se actualiza el binding de la lista
            binding.filter(aFilters);

        },
        validateInt: function (value) {
            let regex = /^[0-9]{1,10}$/;
            return regex.test(value)
        },
        validateFloat: function (value) {
            let regex = /^(100|0{0,1}[0-9]{0,1}[0-9]((\.(([0-9][0-9])|([0-9])))){0,1})$/;
            return regex.test(value)
        },
        validateFloatInput: function (o) {
            let input = o.getSource();
            let value = input.getValue();

            if (this.validateFloat(value)) {
                input.setValueStateText("")
                input.setValueState("None")
            } else {
                if (!(/^[0-9]{0,1}[0-9]{1}\.$/.test(value))) {
                    input.setValue(value.substr(0, value.length - 1))
                }
            }

        },
        onBreedChanged: function (o) {
            let input = o.getSource();
            let value = input.getSelectedKey();

            if (this.validateInt(value)) {
                input.setValueStateText("")
                input.setValueState("None")
            } else {
                input.setValueStateText("Seleccione raza")
                input.setValueState("Error")
            }
        },
        onCreate: function (oEvent) {
            let modelo = this.getView().getModel("optimizer")
            let that = this
            let max = this.getView().byId("inputMax").getValue()
            let min = this.getView().byId("inputMin").getValue()
            let dif = this.getView().byId("inputDif").getValue()
            let selectBreed = this.getView().byId("selectBreed").getSelectedKey()
            if (this.validateInt(max) && this.validateInt(min) && this.validateFloat(dif) && this.validateInt(selectBreed)) {
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: "/ave_simulator/insertParameter",
                    dataType: "json",
                    data: JSON.stringify({
                        "breed_id": parseInt(selectBreed),
                        "max_housing": parseInt(max),
                        "min_housing": parseInt(min),
                        "difference": parseFloat(dif),
                        "active": false
                    }),
                    success: function (data) {

                        that.onNavBack();
                    },
                    error: function (request) {

                    }
                })
            } else {
                if (!this.validateInt(max)) {
                    this.getView().byId("inputMax").setValueState("Error")
                    this.getView().byId("inputMax").setValueStateText("El campo no debe ser vacio")
                }
                if (!this.validateInt(min)) {
                    this.getView().byId("inputMin").setValueState("Error")
                    this.getView().byId("inputMin").setValueStateText("El campo no debe ser vacio")
                }
                if (!this.validateFloat(dif)) {
                    this.getView().byId("inputDif").setValueState("Error")
                    this.getView().byId("inputDif").setValueStateText("El campo no debe ser vacio")
                }
                if (!this.validateInt(selectBreed)) {
                    this.getView().byId("selectBreed").setValueState("Error")
                    this.getView().byId("selectBreed").setValueStateText("Seleccione raza")
                }
                modelo.setProperty("/enable", false)
            }

        },
        onNewRecord: function (oEvent) {
            let modelo = this.getView().getModel("optimizer")
            modelo.setProperty("/newData", {
                "breed_id": null,
                "max_housing": "",
                "min_housing": "",
                "difference": ""
            })
            modelo.setProperty("/create", true)
            modelo.setProperty("/modify", false)
            modelo.setProperty("/detele", false)
            modelo.setProperty("/save", false)
            modelo.setProperty("/active", true)
            modelo.setProperty("/enable", true)
            this.getRouter().navTo("optimizer_Create", {}, true);
        },
        onNavBack: function (oEvent) {
            /** @type {JSONModel} OS Referencia al modelo "OS" */
            var util = this.getView().getModel("util");
            let modelo = this.getView().getModel("optimizer")
            modelo.setProperty("/create", true)
            modelo.setProperty("/modify", false)
            modelo.setProperty("/detele", false)
            this.getRouter().navTo(util.getProperty("/selectedEntity"), {}, true);

        }
    });
});