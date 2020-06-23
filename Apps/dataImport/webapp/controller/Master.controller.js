sap.ui.define([
    "dataImport/controller/BaseController",
    "sap/m/GroupHeaderListItem",
    "sap/ui/model/json/JSONModel",
    "dataImport/model/formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "dataImport/controller/MasterUserAppController",
], function (BaseController, GroupHeaderListItem, JSONModel, formatter, MessageBox, MessageToast, Filter, MasterUserAppController) {
    "use strict";

    return BaseController.extend("dataImport.controller.Master", {

        formatter: formatter,

        /**
     * Function to be fired when the controller is initialized
     */
        onInit: function () {
            this.getRouter().getRoute("master")
                .attachPatternMatched(this._onMasterMatched, this);
        },

        /**
     * Function to be fired when the route 'master' is matched
     * @param {Object} oEvent event with the searchbox
     */
        _onMasterMatched: function (oEvent) {
            let structure = this.getModel("structure").getProperty("/selected");
            let headerConfig = this.getModel(structure).getData();
            // console.log(structure)
            // console.log(headerConfig)
      
            this.getModel("header").setData(headerConfig);
            this.getModel("data").setProperty("/REPORT", []);
            this.getModel("data").setProperty("/TypeOfSeparator",";");
            this.getModel("header").refresh(true);
            this.getRouter().navTo("detail", {
                id: -1
            }, false);
        },

        /**
     * Function triggered by the searchBox in Master.view.xml
     * it adds filters to the binding
     + @param {Object} oEvent event fired when the searchbox changes value
     */
        onSearch: function (oEvent) {
            let aFilters = [],
                highlight, // filters that will be applied to the binding
                sQuery = oEvent.getSource().getValue(), // searchBox value
                binding = this.getView().byId("__list0").getBinding("items"); // binding of the list in Master
            console.log(sQuery, binding);
            if (sQuery && sQuery.length > 0) {
                let filter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }
            console.log(aFilters);
            binding.filter(aFilters);
        },

        onPressBack: function (oEvent) {
            this.getRouter().navTo("select");
        },

        /**
     * Function triggered when select an item in the list
     * @param {Object} oEvent event with the list item
     */
        onSelectionChange: function (oEvent) {

            let index = oEvent.getSource()
                .getBindingContext("data") // obtains the item
                .getPath() // obtains the path of the item
                .split("/REPORT/")[1]; // obtains the index of the item

            this.getRouter().navTo("detail", {
                id: index
            }, false);

        },

        /**
     * Function triggered when a file is upload
     * takes the file and insert it like a new item in the model
     * @param {Object} oEvent event that have the file
     */
        handleFiles: function (oEvent) {
            let oFileToRead = oEvent.getParameters().files[0], // actual file that has been read
                reader = new FileReader(); // letiable that let you handle the file

            reader.readAsText(oFileToRead,"ASCII"); // converts the file in text
            reader.onload = (event) => { // function triggered when the file ends the load
                let csv = event.target.result; // text of the file
                this._processData(csv, oFileToRead);
            };
        },

        /**
     * Internal function that process the data of the file and insert it into
     * the model
     * @param {String} csv a string with the content of the file, it must be
     * separated by ';'
     * @param {Object} oFileToRead the file that is handle
     */
        _processData: function (csv, oFileToRead) {
     
            let elSimbolo = this.getModel("data").getProperty("/TypeOfSeparator");
            console.log(elSimbolo);

            let lines = csv.split("\r\n"), // lines of the csv file
                headers = lines[0].split(elSimbolo).map(header => header.trim()), // headers of the file
                oHeaders = this.getView().getModel("header"), // headers of the config model
                result = { // result that will be inserted into the model
                    name: oFileToRead.name,
                    items: [],
                    status: "noConfirmado", // TODO change the way status work
                    enableAccept: true
                };
            var SiEsObligatorioNo;
            var sumLines = 1;
            // console.log("Lineas", lines)
            // console.log("Cabeceras", headers)

            if (headers[headers.length - 1] == "") {
                headers.pop();
            }

            let aux = Array(headers.length ).join(elSimbolo);
            let flag = this._validNames(oFileToRead.name); // check name is unique
            headers = this._validHeaders(headers); // check headers are in the config model
            lines.shift();
            lines.shift();

            // if (lines[lines.length - 1] === '') {
            //   lines.pop()
            // }

            if (headers.length > 0 && flag) {

                // insert all the rows of the csv into the result
                lines.forEach(line => {
                    var obj = {};
                    var flag = true;
                    var i = 0;
                    if (sumLines != 1) {
                        if (line.trim() != "" && line.trim() != aux) {
                            console.log("entre con la linea:", line, ", aux:", aux);
                            line = line.split(elSimbolo);
                            headers.forEach((header, index) => {
                                let value = line[index];
                                // if (value != "" && SiEsObligatorioNo[i] == "No Obligatorio" || SiEsObligatorioNo[i] == "Obligatorio") {
                                var clearHeader = header.replace(/\s/g, "_").replace(/\(|\)/g, "").toUpperCase(); // Eliminar espacios en blanco y parentesis
                                let key = oHeaders.getProperty(`/${header}/binding`);
                                obj[key] = value != "" ? value : oHeaders.getProperty(`/${header}/default`);
                                // }
                                // i++;
                            });
                            console.log(obj);
                            i=0;
                        } else {
                            flag = false;
                        }

                        let oModel = this.getView().getModel("data");
                        $.each(oModel.getProperty("/REPORT/"), function (i, val) {
                            if (val.name != result.name) {
                                val.items.forEach(function (val2, i2) {
                                    if (val2 != undefined) {
                                        var cont = 0;
                                        var leng = Object.keys(val2).length;
                                        $.each(val2, function (i3, val3) {
                                            if (obj[i3] == val3) {
                                                cont++;
                                            }
                                        });
                                        // se calcula el tamaño de leng en base a la cantidad de atributos que puede poseer un registro y se compara con la cantidad de coincidencias en la que los atributos del obj coincidieron a un registro del modelo principal
                                        if (cont == leng) {
                                            // cuando flag es true, se debe a que todos los atributos del obj actual coincidio con uno de los registros del modelo principal
                                            flag = false;
                                        }
                                    }
                                });
                            }
                        });
                        // flag true, se guarda el objeto
                        if (flag) {
                            result.items.push(obj);
                        }
                    }else{
                        SiEsObligatorioNo = line.split(elSimbolo);
                    }
                    sumLines++;
                });

                let oModel = this.getView().getModel("data"),
                    index = oModel.getProperty("/REPORT").length;

                oModel.setProperty(`/REPORT/${index}`, result);

                this.getRouter().navTo("detail", {
                    id: index
                }, false);
            } else {
                console.log("Error handling the file."); // TODO handle the error here
            }

        },

        /**
     * Valid the line so is not empty
     * @param {Array} line to be checked
     */
        _lineIsEmpty: function (line) {
            console.log(line);
            for (let l of line) {
                if (l != "") {
                    return false;
                }
            }

            return true;
        },

        /**
     * Function that validate the headers
     * @param {Array} headers
     * @return {Array} array with the headers
     */
        _validHeaders: function (headers) {
            let validHeaders = this.getView().getModel("header").getProperty("/"), // headers from the model
                band = true,
                result = [];

            headers.forEach(header => {
                if (validHeaders[header]) {
                    result.push(header);
                } else {
                    this._showInvalidHeaderToast(header);
                    band = false;
                }
            });

            return band ? result : [];

        },

        /**
     * Function that valid the name of a file to not be repeated.
     * @param {String} name the name of the file
     * @return {Boolean} true if it's valid false otherwise
     */
        _validNames: function (name) {

            let oModel = this.getView().getModel("data"),
                list = oModel.getProperty("/REPORT"),
                i = 0,
                band = false;

            console.log(oModel);

            while (i < list.length && !band) {

                if (name == list[i].name) {
                    band = true;
                }
                i++;
            }
            return !band;
        },
        _showInvalidHeaderToast: function (name) {
            MessageToast.show("Formato invalido. La cabecera " + name + " no es valida!");
        },

    });
}, /* bExport= */ true);

