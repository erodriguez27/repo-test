sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/m/Dialog",
    "sap/m/Button"
], function(BaseController, JSONModel, Sorter, Filter, Dialog, Button) {
    "use strict";

    return BaseController.extend("technicalConfiguration.controller.txposturecurve", {

        /**
         * Se llama a la inicialización de la Vista
         */
        onInit: function() {
            //ruta para la vista principal
            this.getOwnerComponent().getRouter().getRoute("txposturecurve").attachPatternMatched(this._onRouteMatched, this);
            //ruta para la vista de creación de un registro
            this.getOwnerComponent().getRouter().getRoute("txposturecurve_Create").attachPatternMatched(this._onCreateMatched, this);
        },

        /**
         * Coincidencia de ruta para acceder a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onRouteMatched: function (oEvent) {
            var that = this,
                util = this.getView().getModel("util"),
                txposturecurve = this.getView().getModel("TXPOSTURECURVE"),
                mdbreed = this.getView().getModel("MDBREED");

            mdbreed.setProperty("/selectedRecord/", "");

            txposturecurve.setProperty("/settings/enabledTab", false);

            //dependiendo del dispositivo, establece la propiedad "phone"
            this.getView().getModel("util").setProperty("/phone/",
                this.getOwnerComponent().getContentDensityClass() === "sapUiSizeCozy");

            //establece process como la entidad seleccionada
            util.setProperty("/selectedEntity/", "txposturecurve");
            txposturecurve.setProperty("/postureRecords", []);
            txposturecurve.setProperty("/newRecords", []);
            txposturecurve.setProperty("/curves", []);
            txposturecurve.setProperty("/breedRecords", []);
            txposturecurve.setProperty("/newRecords/ok", false);

            txposturecurve.setProperty("/create", true);
            txposturecurve.setProperty("/delete", false);
            txposturecurve.setProperty("/save", false);

            //obtiene los registros de MDPROCESS
            this.onRead(that, util, txposturecurve);
            util.setProperty("/busy/", true);
            this.loadBreed();
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
            let input= o.getSource();
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
         *  Ajusta la vista para editar los datos de una curva de Postura
         */
        onEdit: function() {
            this.oTable = this.getView().byId("idProductsTable");
            this.oReadOnlyTemplate = this.byId("idProductsTable").removeItem(0);
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");

            let oEditableTemplate = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.ObjectIdentifier({
                        title: "{TXPOSTURECURVE>week}"
                    }), new sap.m.Input({
                        value: "{TXPOSTURECURVE>theorical_performance}",
                        valueState: "{TXPOSTURECURVE>state}",
                        valueStateText: "{TXPOSTURECURVE>stateText}",
                        description: "Huevos",
                        liveChange: this.validateFloatInput
                    })
                ]
            });

            this.txposturecurveI = JSON.parse(JSON.stringify(this.getView().getModel("TXPOSTURECURVE").getProperty("/postureRecords")));
            this.byId("editButton").setVisible(false);
            this.byId("saveButton").setVisible(true);
            this.byId("cancelButton").setVisible(true);
            this.rebindTable(oEditableTemplate, "Edit");
        },

        /**
         * Vincula los elementos de agregación a los datos del modelo.
         *
         * @param {*} oTemplate La plantilla para clonar para cada elemento en la agregación
         * @param {*} sKeyboardMode Establecer el modo 
         */
        rebindTable: function(oTemplate, sKeyboardMode) {
            this.oTable.bindItems({
                path: "TXPOSTURECURVE>/postureRecords",
                template: oTemplate
            }).setKeyboardMode(sKeyboardMode);
        },

        /**
         *  Guarda los datos una curva de Postura
         */
        onSave: function () {
            let aWeeks = this.getView().getModel("TXPOSTURECURVE").getProperty("/postureRecords");

            if (this.verifyInputs(aWeeks, true)) {
                this.byId("saveButton").setVisible(false);
                this.byId("cancelButton").setVisible(false);
                this.byId("editButton").setVisible(true);

                let arra = this.oReadOnlyTemplate.oBindingContexts.TXPOSTURECURVE.oModel.oData.postureRecords;
                let arra2 = [];
            
                var i = 0;

                arra.forEach(item => {
                    if ((item.theorical_performance) != this.txposturecurveI[i].theorical_performance) {
                        arra2.push(item);
                    }

                    i++;
                });
                const serverName = "/posture_curve";
            
                fetch(serverName, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({arra2})
                }).then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. status code: " + response.status);
                            return;
                        }

                        response.json().then(function(res) {
                        });
                    }
                ).catch(function(err) {
                    console.log("Fetch Error:", err);
                });

                this.rebindTable(this.oReadOnlyTemplate, "Navigation");
            } else {
                this.onToast("Debe llenar todos los campos");
            }
        },

        /**
         *  Ajusta la vista y bloquea los campos del editar de una curva de Postura
         */
        onCancel: function() {
            this.byId("cancelButton").setVisible(false);
            this.byId("saveButton").setVisible(false);
            this.byId("editButton").setVisible(true);

            this.getView().getModel("TXPOSTURECURVE").setProperty("/postureRecords", this.txposturecurveI);
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");
        },

        /**
         * Obtiene todos los registros de txposturecurve
         * @param  {Controller} that          Referencia al controlador que llama esta función
         * @param  {JSONModel} util           Referencia al modelo "util"
         * @param  {JSONModel} txposturecurve Referencia al modelo "txposturecurve"
         */
        onRead: function(that, util, txposturecurve) {
            var serviceUrl= util.getProperty("/serviceUrl"),
                that = this;
            var settings = {
                url: serviceUrl+"/posture_curve",
                method: "GET",
                success: function(res) {
                    
                    that.getView().byId("curveTable").removeSelections(true);
                    util.setProperty("/busy/", false);
                    txposturecurve.setProperty("/curves/", res.data);
                },
                error: function(err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                }
            };

            util.setProperty("/busy/", true);
            //borra los registros OSPARTNERSHIP que estén almacenados actualmente
            txposturecurve.setProperty("/curves/", []);
            //realiza la llamada ajax
            $.ajax(settings);
        },

        /**
         * Navega a traves de los Tabs y valida que opciones mostrar
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onTabSelection: function(oEvent) {
            let selectedKey = oEvent.getSource().getSelectedKey();
            let viewId = this.getView().getId() + "--";
            let txposturecurve = this.getModel("TXPOSTURECURVE");
            let mdbreed = this.getModel("MDBREED");
            if (selectedKey === "kregisterCurveFilter") {
                txposturecurve.setProperty("/create", true);
                txposturecurve.setProperty("/delete", false);
                txposturecurve.setProperty("/save", false);
                mdbreed.setProperty("/selectedRecord/", "");
                txposturecurve.setProperty("/settings/enabledTab", false);
            }

            if(selectedKey === "kpostureCurveFilter"){
                txposturecurve.setProperty("/create", false);
                txposturecurve.setProperty("/delete", true);
                txposturecurve.setProperty("/save", false);
            }
        },


        /**
         * Este evento se activa cuando el usuario cambia el valor del campo de búsqueda. se actualiza el binding de la lista
         * @param {Event} oEvent Evento que llamó esta función
         */
        onCurveSearch: function (oEvent) {
            let aFilters = [];
            let sQuery = this.getView().byId("curveSearchField").getValue().toString();
            let binding = this.getView().byId("curveTable").getBinding("items");

            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                var filter1 = new Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters = new Filter([filter1]);
            }

            //se actualiza el binding de la lista
            binding.filter(aFilters);
        },

        /**
         * Coincidencia de ruta para acceder a la creación de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onCreateMatched: function (oEvent) {
            if (this.loadBreed()) {
                this.getRouter().navTo("txposturecurve_Create", {}, true);
            } else {
                this.onToast("Todas las razas ya poseen su curva de postura");
            }
        },

        /**
         * Verifica las razas que poseen curva de postura 
         * @returns {Boolean} "true" hay razas libres de curva, "false" si ya todas poseen
         */
        loadBreed: async function () {
            var util = this.getModel("util"),
                service = util.getProperty("/serviceUrl"),
                txposturecurve = this.getModel("TXPOSTURECURVE");
            let bIsFilled = true;
            this.bAreBreed = true;
            var settings = {
                url: service+"/breed/findBreedByCurve",
                method: "GET",
                success: (res) => {
                    util.setProperty("/busy/", false);

                    if (res.data.length <= 0) {
                        this.bAreBreed = false;
                        bIsFilled = false;
                    }
                    
                    txposturecurve.setProperty("/breedRecords/", res.data);
                },
                error: (err) => {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                }
            };
            util.setProperty("/busy/", true);
            txposturecurve.setProperty("/records/", []);

            await $.ajax(settings);

            return (bIsFilled);
        },

        /**
         * Este evento se activa cuando se cambia el valor en el campo de selección de raza en el formulario.
         */
        onBreedChanged: function(){
            var txposturecurve = this.getView().getModel("TXPOSTURECURVE");
            txposturecurve.setProperty("/breed_id/value", this.getView().byId("selectBreed").getSelectedKey());
            txposturecurve.setProperty("/breed_id/state", "None");
            txposturecurve.setProperty("/breed_id/stateText", "");
        },

        /**
         * Se activa cuando selecciona una raza y muestra su información.
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onSelectBreedRecord: function(oEvent) {
            this.getView().byId("curveSearchField").setValue("");
            this.onCurveSearch();

            let mdbreed = this.getView().getModel("MDBREED");
            let txposturecurve = this.getView().getModel("TXPOSTURECURVE");

            //guarda la ruta del registro BROILERSFARM que fue seleccionado
            mdbreed.setProperty("/selectedRecordPath/", oEvent.getSource()["_aSelectedPaths"][0]);

            mdbreed.setProperty("/selectedRecord/", txposturecurve.getProperty(mdbreed.getProperty("/selectedRecordPath/")));
            //habilita el tab de la tabla de registros CENTER
            txposturecurve.setProperty("/settings/enabledTab", true);

            //habilita la opción
            txposturecurve.setProperty("/create", false);
            txposturecurve.setProperty("/delete", true);
            txposturecurve.setProperty("/save", false);

            //establece el tab de la tabla CENTER como el tab seleccionado
            this.getView().byId("tabBar").setSelectedKey("kpostureCurveFilter");

            //obtiene los registros de la curva de postura
            this.onPostureCurveRecords();
            this.getView().byId("curveTable").removeSelections(true);
        },

        /**
         * Este evento se activa cuando se selecciona la cantidad de semanas.
         */
        daysSelect: function(oEvent) {
            
            let txposturecurve = this.getView().getModel("TXPOSTURECURVE");

            txposturecurve.setProperty("/days_state", "None");
            txposturecurve.setProperty("/days_stateText", "");

        },

        /**
         * Obtiene los registros de la curva de postura.
         */
        onPostureCurveRecords: function(){
            console.log("hjvkhjb");
            var util = this.getModel("util"),
                txposturecurve = this.getModel("TXPOSTURECURVE"),
                mdbreed = this.getModel("MDBREED");
            var serviceUrl= util.getProperty("/serviceUrl");
            var settings = {
                contentType: "application/json",
                dataType: "json",
                url: serviceUrl+"/posture_curve/findCurveByBreed",
                method: "POST",
                data: JSON.stringify({
                    "breed_id": mdbreed.getProperty("/selectedRecord/breed_id"),
                }),
                success: function(res) {
                    util.setProperty("/busy/", false);
                    txposturecurve.setProperty("/postureRecords/", res.data);
                },
                error: function(err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);

                }
            };

            util.setProperty("/busy/", true);
            //borra los registros OSPARTNERSHIP que estén almacenados actualmente
            txposturecurve.setProperty("/postureRecords/", []);
            //realiza la llamada ajax
            $.ajax(settings);
        },

        /**
         * Navega a la vista para crear un nuevo registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNewRecord: function (oEvent) {
            if (this.bAreBreed === false) {
                this.onToast("Todas las razas ya poseen su curva de postura");
            } else {
                let txposturecurve = this.getModel("TXPOSTURECURVE");
                txposturecurve.setProperty("/breed_id/value", null);

                this.getView().byId("curveSearchField").setValue("");
                this.onCurveSearch();
                this.getRouter().navTo("txposturecurve_Create", {}, true);
            }
        },
        /**
         * Genera la cantidad de semana(s) para llenar su producción
         * @param  {Event} oEvent Evento que llamó esta función
         */
        saveRecuDates: function (oEvent) {
            let selectBreed = this.getView().byId("selectBreed").mProperties.selectedKey;
            let numberOfActualRows = this.getView().byId("selectRecuDays").mProperties.selectedKey;
            let numberOfRows = this.getView().getModel("TXPOSTURECURVE").getProperty("/newRecords").length;
            let temp = this.getView().getModel("TXPOSTURECURVE").getProperty("/newRecords");

            if(this._validRecord()){
                if (numberOfActualRows > numberOfRows) {
                    if (temp != "") {
                        //todo hacer ciclo dependiendo de la cantidad a agregar
                        for (let i = 0; i < numberOfActualRows-numberOfRows; i++) {
                            temp.push( {
                                "week": temp.length+1,
                                "breed_id": 0,
                                "theorical_performance": "",
                                "historical_performance": 0,
                                "theorical_accum_mortality": 0,
                                "historical_accum_mortality": 0,
                                "theorical_uniformity": 0,
                                "historical_uniformity": 0,
                                "type_posture": "Joven"
                            });       
                        }
                    } else {
                        temp = [{
                            "week": 1,
                            "breed_id": 0,
                            "theorical_performance": "",
                            "historical_performance": 0,
                            "theorical_accum_mortality": 0,
                            "historical_accum_mortality": 0,
                            "theorical_uniformity": 0,
                            "historical_uniformity": 0,
                            "type_posture": "Joven"
                        }];
                        for (let i = 0; i < numberOfActualRows-1; i++) {
                            temp.push( {
                                "week": temp.length+1,
                                "breed_id": 0,
                                "theorical_performance": "",
                                "historical_performance": 0,
                                "theorical_accum_mortality": 0,
                                "historical_accum_mortality": 0,
                                "theorical_uniformity": 0,
                                "historical_uniformity": 0,
                                "type_posture": "Joven"
                            });       
                        }
                    }
                } else {
                    if (numberOfActualRows < numberOfRows) {
                        temp.splice(numberOfActualRows);
                    }
                }
            }
    
            this.getView().getModel("TXPOSTURECURVE").setProperty("/newRecords", temp);
        },

        /**
         * Controlador de eventos para navegar de regreso.
         * @param {Event} oEvent Evento que llamó esta función
         */
        onNavBack: function (oEvent) {
            var util = this.getView().getModel("util");
            this.getView().getModel("TXPOSTURECURVE").setProperty("/selectDay", null);
            this._resetRecordValues();
            this.getRouter().navTo(util.getProperty("/selectedEntity"), {}, true );
        },

        /**
         * Valida que las entradas tenga información y no estenn en blanco
         * @returns {Boolean} "true" si estan seleccionados, "false" si no estan y envia error
         */
        _validRecord: function() {
            var txposturecurve = this.getView().getModel("TXPOSTURECURVE");
            let flag = true;
            if (txposturecurve.getProperty("/breed_id/value") === null) {
                flag = false;
                txposturecurve.setProperty("/breed_id/state", "Error");
                txposturecurve.setProperty("/breed_id/stateText", "Indique raza");
            } else {
                txposturecurve.setProperty("/breed_id/state", "None");
                txposturecurve.setProperty("/breed_id/stateText", "");
            }
            
            if (txposturecurve.getProperty("/selectDay") === null) {
                flag = false;
                txposturecurve.setProperty("/days_state", "Error");
                txposturecurve.setProperty("/days_stateText", "Indique cantidad de semanas");
            } else {
                txposturecurve.setProperty("/days_state", "None");
                txposturecurve.setProperty("/days_stateText", "");
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
            let bSuccess = true;

            for (let i = 0; i < aWeeks.length; ++i) {
                if ((aWeeks[i].theorical_performance === "") || (parseFloat(aWeeks[i].theorical_performance) === 0) || (aWeeks[i].theorical_performance === null)) {
                    aWeeks[i].state = "Error"

                    this.getView().getModel("TXPOSTURECURVE").setProperty((update===true?"/postureRecords/":"/newRecords/")+i+"/state","Error")
                    this.getView().getModel("TXPOSTURECURVE").setProperty((update===true?"/postureRecords/":"/newRecords/")+i+"/stateText",(parseFloat(aWeeks[i].theorical_performance) === 0)?"Debe ser mayor a cero (0)":"No puede ser vacio")
                    bSuccess = bSuccess && false;

                }else{
                    this.getView().getModel("TXPOSTURECURVE").setProperty((update===true?"/postureRecords/":"/newRecords/")+i+"/state","None")
                    this.getView().getModel("TXPOSTURECURVE").setProperty((update===true?"/postureRecords/":"/newRecords/")+i+"/stateText","")
                    bSuccess = bSuccess && true;
                }
            }

            return bSuccess;
        },

        /**
         * Cancela la creación de un registro MDMEASURE, y regresa a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _resetRecordValues: function() {
            /**
             * @type {JSONModel} MDSTAGE Referencia al modelo "MDSTAGE"
             */
            var txposturecurve = this.getView().getModel("TXPOSTURECURVE");

            txposturecurve.setProperty("/breed_id/value", null);
            txposturecurve.setProperty("/breed_id/state", "None");
            txposturecurve.setProperty("/breed_id/stateText", "");

            txposturecurve.setProperty("/selectDay", null);
            txposturecurve.setProperty("/days_state", "None");
            txposturecurve.setProperty("/days_stateText", "");
        },

        /**
         * Solicita al servicio correspondiente crear un registro TXPOSTURECURVE
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCreate: function (oEvent) {
            let aWeeks = this.getView().getModel("TXPOSTURECURVE").getProperty("/newRecords");

            if (this._validRecord() && this.verifyInputs(aWeeks)) {
                var txposturecurve = this.getView().getModel("TXPOSTURECURVE"),
                    util = this.getView().getModel("util"),
                    that = this,
                    json = {
                        "breed_id": txposturecurve.getProperty("/breed_id/value"),
                        "newRecords": txposturecurve.getProperty("/newRecords"),
                    },
                    serviceUrl = util.getProperty("/serviceUrl"),
                    settings = {
                        async: true,
                        url: serviceUrl + "/posture_curve",
                        method: "POST",
                        data: JSON.stringify(json),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function(res) {
                            that.onToast(that.getI18n().getText("Registro creado con exito"));
                            txposturecurve.setProperty("/selectDay", "");
                            that._resetRecordValues();
                            that.getRouter().navTo("txposturecurve", {}, true);
                        },
                        error: function(err) {
                            util.setProperty("/error/status", err.status);
                            util.setProperty("/error/statusText", err.statusText);
                        }
                    };
                util.setProperty("/busy/", true);
                //realiza la llamada ajax
                $.ajax(settings);

                this.loadBreed();
            } else {
                this.onToast("Debe llenar todos los campos");
            }
        },

        /**
         * Levanta el Diálogo que muestra la confirmación del Eliminar un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onConfirmDelete: function(oEvent) {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var confirmation = oBundle.getText("confirmation");

            var that = this;
            var dialog = new Dialog({
                title: confirmation,
                type: "Message",
                content: new sap.m.Text({
                    text: "¿Desea eliminar la curva de postura?"
                }),

                beginButton: new Button({
                    text: "Si",
                    press: function() {
                        dialog.close();
                        that.onDeleteRecord();
                    }
                }),
                endButton: new Button({
                    text: "No",
                    press: function() {
                        dialog.close();
                        dialog.destroy();
                    }
                })
            });

            dialog.open();
        },

        /**
         * Hace la petición para el borrado y refresca la data.
         */
        onDeleteRecord: function(){
            let util  = this.getModel("util"),
                that = this,
                txposturecurve = this.getModel("TXPOSTURECURVE"),
                serviceUrl = util.getProperty("/serviceUrl"),
                mdbreed = this.getView().getModel("MDBREED"),
                tabBar = this.getView().byId("tabBar");

            util.setProperty("/busy/", true);

            $.ajax({
                type: "DELETE",
                contentType: "application/json",
                data: JSON.stringify({
                    "breed_id": mdbreed.getProperty("/selectedRecord/breed_id")
                }),
                url: serviceUrl + "/posture_curve/",
                dataType: "json",
                async: true,
                success: function(data) {
                    util.setProperty("/busy/", false);
                    tabBar.setSelectedKey("kregisterCurveFilter");
                    txposturecurve.setProperty("/settings/enabledTab", false);
                    that.getView().byId("curveTable").removeSelections(true);
                    that._onRouteMatched();
                },
                error: function(request, status, error) {
                    that.onToast("Error de comunicación");
                }
            });
        }
    });
});