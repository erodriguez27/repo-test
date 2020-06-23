sap.ui.define([
    "dataImport/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "sap/ui/table/Table",
    "sap/ui/table/Column",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "dataImport/model/formatter",
    "sap/ui/model/odata/v2/ODataModel"
], function(BaseController, jQuery, JSONModel, Controller, Table, Column, MessageToast, MessageBox, formatter, ODataModel) {
    "use strict";

    let selectedTicketId;
    // var regexDate = /^(0[1-9]|[12][0-9]|3[01])[\- \/.](?:(0[1-9]|1[012])[\- \/.][0-9]{4,5})/g;

    return BaseController.extend("dataImport.controller.Detail", {
        formatter: formatter,

        /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf MasterDetail.view.Detail
     */
        tableExist : false,

        onInit: function() {
            this.getRouter().getRoute("detail").attachMatched(this._onRouteMatched, this);
            // funcion para evitar que el usuario ingese la fecha manual en el DatePicker
            // $(document).on("click","input[id*='picker']",function(){

            //  $(this).parent().next().children(".sapMInputValHelpInner").click();
            // });
        },
        /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf MasterDetail.view.Detail
     */
        _onRouteMatched: function(oEvent) {
            this.byId("saveButton").setVisible(false);
            this.byId("editButton").setVisible(true);
            this.oTable = this.byId("cargaTable");
            this.header = this.getModel("header");
            this.oModel = this.getModel("data");
            this.structureModel = this.getModel("structure");

            this.columns = [];
            this.cellsT = [];
            this.cellsE = [];

            let oView = this.getView();
            let report = this.oModel.getProperty("/REPORT/" + this.index );
            var that = this;
            this.index = oEvent.getParameter("arguments").id;
            // if (this.index > -1) {
            this.mode = "preview";
            oView.bindElement({
                path: "data>/REPORT/" + this.index + "/"
            });

            if(this.getModel("data").getProperty("/REPORT").length == 0) {
                // this.getRouter().navTo('master', {}, false);
            }

            // generar headers e input dinamicamentes desde headers.json
            $.each(this.header.getData("/"), function(i,val){
                // var data = i.replace(/\s/g,"_").replace(/\(|\)/g,"");
                var data = val.binding;

                // let state = {
                //   parts : [
                //     {path : `data>${data}`},
                //     {path : 'val.validate'}
                //   ],
                //   formatter : '.formatter.validate'
                // }

                // let message = {
                //   parts : [
                //     {path : `data>${data}`},
                //     {path : 'val.validate'}
                //   ],
                //   formatter : '.formatter.message'
                // }

                if (val.type == undefined || val.type == "Input") {

                    that.cellsE.push(new sap.m.Input({
                        value: "{data>"+data+"}",
                        valueState: "{path: 'data>status"+data+"'}",
                        valueStateText: "{path :'data>statusText"+data+"'}",
                        change: function(){
                            var value = this.getValue();
                            // is just required without format
                            if (val.validate.required && (value == "" || value == undefined)) {
                                this.setValueState("Error");
                                this.setValueStateText((val.validate.errorEmpty != undefined && val.validate.errorEmpty != "") ? val.validate.errorEmpty: "El campo no puede estar vacio");
                                that.errorDataEnableButtons(false);
                            }
                            else {
                                this.setValueState("Success");
                                that.validateData(false);
                            }


                            if (value != "" && val.validate.pattern != "") {
                                // is regex could be required or not
                                var regex = new RegExp(val.validate.pattern);
                                if (!regex.test(value)) {
                                    this.setValueState("Error");
                                    this.setValueStateText((val.validate.errorPattern != undefined && val.validate.errorPattern != "") ? val.validate.errorPattern: "Formato invalido");
                                    that.errorDataEnableButtons(false);
                                }
                                else {
                                    this.setValueState("Success");
                                    that.validateData(false);
                                }
                            }
                        }
                    }));
                }
                else if (val.type == "DatePicker") {
                    that.cellsE.push(new sap.m.DatePicker({
                        width: "auto",
                        value: "{data>"+data+"}",
                        valueFormat: "dd/MM/yyyy",
                        displayFormat: "dd/MM/yyyy",
                        valueState: "{path: 'data>status"+data+"'}",
                        valueStateText: "{path :'data>statusText"+data+"'}",
                        maxDate: new Date(),
                        change: function() {
                            var value = this.getValue();
                            // is just required without format
                            if (val.validate.required && (value == "" || value == undefined)) {
                                this.setValueState("Error");
                                this.setValueStateText((val.validate.errorEmpty != undefined && val.validate.errorEmpty != "") ? val.validate.errorEmpty: "El campo no puede estar vacio");
                                that.errorDataEnableButtons(false);
                            }
                            else {
                                this.setValueState("Success");
                                that.validateData(false);
                            }
                            if (value != "" && val.validate.pattern != "") {
                                // is regex could be required or not
                                var regex = new RegExp(val.validate.pattern);
                                if (!regex.test(value)) {
                                    this.setValueState("Error");
                                    this.setValueStateText((val.validate.errorPattern != undefined && val.validate.errorPattern != "") ? val.validate.errorPattern: "Formato invalido");
                                    that.errorDataEnableButtons(false);
                                }
                                else {
                                    this.setValueState("Success");
                                    that.validateData(false);
                                }
                            }
                        }
                    }));
                }
                that.cellsT.push(new sap.m.ObjectStatus({ text: "{data>"+data+"}", state: "{data>status"+data+"}"}));
                that.columns.push(new sap.m.Column({ header: new sap.m.Label({text: i}), width: "150px"}));
            });

            // this.columns.push(new sap.m.Column({ header: new sap.m.Label({text: 'ACCIONES'}), width: "150px"}))
            // this.cellsT.push(new sap.m.Button({
            //   icon : 'sap-icon://delete',
            //   press : this.deleteRow.bind(this)
            // }))
            // this.cellsE.push(new sap.m.Button({
            //   icon : 'sap-icon://delete',
            //   press : this.deleteRow.bind(this)
            // }))


            this.oEditableTemplate = new sap.m.ColumnListItem({
                highlight: "{data>rowColor}",
                customData : [
                    new sap.ui.core.CustomData({
                        key : "background-color",
                        value: "{data>rowColor}",
                        formatter : this.formatter.showRowError,
                        writeToDom: true
                    })
                ],
                cells: this.cellsE
            });

            this.oReadOnlyTemplate = new sap.m.ColumnListItem({
                highlight: "{data>rowColor}",
                customData : [
                    new sap.ui.core.CustomData({
                        key : "background-color",
                        value : "{data>rowColor}",
                        writeToDom : true
                    })
                ],
                cells: this.cellsT
            });

            this.bindTableHeaders();
            this.validateData();

            // }
        },



        validateData: function(init = true){
            var that = this;
            var header = {};
            var editar = false;
            let requiredErrors = 0, patternErrors = 0, duplicateErrors = 0;

            $.each(this.header.getData("/"),function(i,val){
                let refName = i.replace(/\s/g,"_").replace(/\(|\)/g,"");
                header[val.binding] = val;
            });

            $.each(this.oModel.getProperty("/REPORT/"+this.index+"/items/"),function(i,val){
                let error = false;
                $.each(val,function(i2,val2){
                    let flag = false;
                    var validation = (header[i2] != undefined) ? header[i2].validate: "";
                    let message = "";
                    // i2 = header[i2].binding
                    // var validation = header[i2] != undefined && header[i2].validate.pattern != undefined ? header[i2].validate.pattern: "";
                    if (validation.required && (val2 == "" || val2 == undefined)) {
                        message = header[i2].validate.errorEmpty;
                        editar = true;
                        flag = true;
                        requiredErrors += 1;
                    }
                    if (validation.pattern != "" && val2 != "" && !flag) {
                        var regex = new RegExp(validation.pattern);
                        if (!regex.test(val2)) {
                            message = header[i2].validate.errorPattern;
                            editar = true;
                            flag = true;
                            patternErrors += 1;
                        }
                    }
                    if (validation.unique && !flag) {
                        let report = that.oModel.getProperty(`/REPORT/${that.index}/items`);
                        if (report.filter(value => value[i2] == val2).length > 1) {
                            that.oModel.setProperty("/REPORT/" + that.index + "/items/" + i + "/status" + i2, "Error");
                            message = header[i2].validate.errorUnique;
                            editar = true;
                            flag = true;
                            duplicateErrors += 1;
                        }
                    }
                    if (validation.uniqueGroup !== undefined && !flag) {
                        let report = that.oModel.getProperty(`/REPORT/${that.index}/items`);
                        let res = report.filter(value => {
                            let flag = true;
                            validation.uniqueGroup.forEach(unique => {
                                flag = flag && value[unique] == val[unique];
                            });
                            return flag;
                        });

                        if (res.length > 1) {
                            message = header[i2].validate.errorUnique;
                            editar = true;
                            flag = true;
                            duplicateErrors += 1;
                        }
                    }
                    if (validation.greaterThan !== undefined && validation.greaterThan !== "" && val2 !== "" && !flag) {
                        if (parseInt(val2) <= parseInt(val[validation.greaterThan])) {
                            message = header[i2].validate.errorGreater;
                            editar = true;
                            flag = true;
                            patternErrors += 1;
                        }
                    }
                    let oldStatus = that.oModel.getProperty("/REPORT/" + that.index + "/items/" + i + "/status" + i2);
                    let oldMessage = that.oModel.getProperty("/REPORT/" + that.index + "/items/" + i + "/statusText" + i2);

                    if (!flag) {
                        if (oldStatus == "Error") {
                            that.oModel.setProperty("/REPORT/" + that.index + "/items/" + i + "/status" + i2, "None");
                            that.oModel.setProperty("/REPORT/" + that.index + "/items/" + i + "/statusText" + i2, "");
                        }
                    }
                    else {
                        error = true;
                        if (oldStatus !== "Error") {
                            that.oModel.setProperty("/REPORT/" + that.index + "/items/" + i + "/status" + i2, "Error");
                            that.oModel.setProperty("/REPORT/" + that.index + "/items/" + i + "/statusText" + i2, message);
                        }
                        else if (oldMessage !== message) {
                            that.oModel.setProperty("/REPORT/" + that.index + "/items/" + i + "/statusText" + i2, message);
                        }
                    }
                });
                let oldColor = that.oModel.getProperty("/REPORT/" + that.index + "/items/" + i + "/rowColor");



                if (error && oldColor !== "Error") {
                    that.oModel.setProperty("/REPORT/" + that.index + "/items/" + i + "/rowColor", "Error");
                }
                else if ((!error && oldColor !== "None") || oldColor === undefined) {
                    that.oModel.setProperty("/REPORT/" + that.index + "/items/" + i + "/rowColor", "None");
                }
            });
            // first validation onRouteMatche
            if (init) {
                if (editar) {
                    let error = "";
                    error += requiredErrors > 0 ? `${requiredErrors} Campos requeridos vacios\n` : "";
                    error += patternErrors > 0 ? `${patternErrors} Campos con formato erroneo\n` : "";
                    error += duplicateErrors > 0 ? `${duplicateErrors} Campos con duplicado` : "";
                    this.onEdit();
                    this.errorDataEnableButtons(false);
                    sap.m.MessageBox.error(error, {
                        title : "Errores en el formulario"
                    });
                }
                else{
                    this.rebindTable(this.oReadOnlyTemplate,"Navigation");
                }
            }
            // Enable button after change event in input
            else{
                if (!editar) {
                    this.errorDataEnableButtons(true);
                }
                else {
                    if (this.mode !== "edit") {
                        this.onEdit();
                    }
                    this.errorDataEnableButtons(false);
                }
            }
            this.getModel("data").setProperty("/errorCount", requiredErrors + patternErrors + duplicateErrors);


        },

        errorDataEnableButtons: function(prop){
            this.oModel.setProperty("/REPORT/"+this.index+"/enableAccept",prop);
            this.oModel.setProperty("/REPORT/"+this.index+"/saveButton",prop);
        },
        rebindTable: function(oTemplate, sKeyboardMode) {
            var that = this;
            // Agergar columnas a la tabla

            this.oTable.bindItems({
                path: "data>/REPORT/"+this.index+"/items/",
                template: oTemplate,
                key: "ProductId"
            }).setKeyboardMode(sKeyboardMode);
        },
        bindTableHeaders: function(){
            var that = this;
            this.oTable.destroyColumns();

            this.columns.forEach(function(val,i){
                that.oTable.addColumn(val);
            });
        },

        getShowErrorFilter: function (oEvent) {
            let flag = this.getView().byId("toggle").getPressed();
            let filters = [];

            if (flag) {
                let headers = this.header.getData();

                for (let key in headers) {
                    filters.push(
                        new sap.ui.model.Filter({
                            path : `status${headers[key].binding}`,
                            test : function(value) {
                                return value == "ERROR";
                            }
                        })
                    );
                }
                filters = new sap.ui.model.Filter(filters, false);
                return filters;
            }
        },

        getSearchFilter : function(oEvent) {
            let query = this.getView().byId("search").getValue();
            let headers = this.header.getData();
            let filters = [];

            for (let key in headers) {
                filters.push(
                    new sap.ui.model.Filter(headers[key].binding, sap.ui.model.FilterOperator.Contains, query)
                );
            }
            return filters = new sap.ui.model.Filter(filters, false);
        },

        constructFilters: function() {
            let queryFilters = this.getSearchFilter();
            let errorFilters = this.getShowErrorFilter();
            if (errorFilters == undefined) {
                return queryFilters;
            }
            return new sap.ui.model.Filter([queryFilters, errorFilters], true);
        },

        applyFilters: function(oEvent) {
            let object = oEvent.getSource();
            if (object.getId() == this.getView().createId("toggle")) {
                if (object.getPressed() === true) {
                    this.validateData();
                    this.onEdit();
                }
            }
            let filters = this.constructFilters();
            this.oTable
                .getBinding("items")
                .filter(filters);
        },

        addRow : function(oEvent) {
            const path = this.oTable.getBindingContext("data").getPath();
            let report = this.getModel("data").getProperty(path);

            if (report != undefined) {
                let headers = this.header.getData();
                let row = {};



                for (let key in headers) {
                    let binding = headers[key].binding;
                    row[binding] = headers[key].default || "";
                }

                report.items.unshift(row);
                this.getModel("data").setProperty(path, report);
                this.validateData(false);
            }
        },

        deleteRow: function(oEvent) {
            console.log(oEvent.getParameters("listItem"));
            let path = oEvent
                .getParameters("listItem").listItem
                .getBindingContext("data")
                .getPath()
                .split("/");

            let index = path.pop();
            path = path.join("/");
            let oModel = this.getView().getModel("data");
            let items = oModel.getProperty(path);
            items.splice(index, 1);
            oModel.setProperty(path, items);
            this.validateData(false);
        },

        onEdit: function() {
            this.getView().byId("editButton").setVisible(false);
            this.getView().byId("saveButton").setVisible(true);
            this.rebindTable(this.oEditableTemplate, "Edit");
            this.mode = "edit";
            // this.getView().byId("cancelButton").setVisible(true);
        },

        onSave: function() {
            this.getView().byId("editButton").setVisible(true);
            this.getView().byId("saveButton").setVisible(false);
            this.rebindTable(this.oReadOnlyTemplate, "Navigation");
            this.mode = "preview";
            // this.getView().byId("cancelButton").setVisible(false);

        },

        onConfirm: function(oEvent) {
            let oModel = this.getView().getModel("data");
            let i = this.index;
            let today = new Date();

            MessageBox.confirm("¿Desea confirmar la carga?", {
                title: "Confirmar",
                icon: sap.m.MessageBox.Icon.SUCCESS,
                onClose: (oAction) => {
                    if(oAction === MessageBox.Action.OK) {
                        let json = oModel.getProperty(`/REPORT/${this.index}`);
                        let items = json.items;
                        let result = {};
                        let structures = this.structureModel.getProperty("/list");
                        let selected = this.structureModel.getProperty("/selected");

                        selected = structures.filter(structure => structure.key === selected)[0];

                        let srvModel = this.getModel("service");
                        let data = {
                            Oentry : JSON.stringify(items)
                        };
                        console.log("lo que quiero veeeeeeeeer");
                        sap.ui.core.BusyIndicator.show();
                        console.log(selected.method);
            
                        items.forEach(item => {
                            for (const key in item) {
                                item[key] = item[key].trim();
                            }
                        });


                        // Asyncronus JSON And XML
                        $.ajax({
                            url : selected.method,
                            method : "POST",
                            contentType : "application/json",
                            data : JSON.stringify({
                                registers : items
                            }),

                            success : (response) => {
                                console.log(response);
                                sap.m.MessageBox.success("Carga realizada exitosamente");
                                sap.ui.core.BusyIndicator.hide();
                            },
                            error : (err) => {
                                sap.m.MessageBox.error(err.responseJSON.message);
                                sap.ui.core.BusyIndicator.hide();
                            }
                        });

                        console.log("prueba");
                        /*srvModel.create(selected.method, data, {
              success : res => {

                sap.ui.core.BusyIndicator.hide()
                if(res.Messcode == '1000') {
                  MessageBox.success(res.Message)
                  json.date = today;
                  delete json.status;

                  oModel.setProperty(`/REPORT/${this.index}`, json);
                  oModel.refresh(true);
                }
                else {
                  MessageBox.error(res.Message)
                }
              },

              error : err => {
                sap.ui.core.BusyIndicator.hide()
                MessageBox.error('Error en la carga masiva!')
              }
            })*/

                    }
                }
            });
        },
        // /**
        //  * Function called when the user cancel the bulk load
        //  * @param {Object} oEvent event generate when the user clicks the button
        //  */
        cancel: function(oEvent) {

            let oModel = this.getView().getModel("data");
            let reports = oModel.getProperty("/REPORT");

            reports.splice(this.index, 1);
            if(reports.length === 0) {
                this.rebindTable(this.oReadOnlyTemplate,"Navigation");
                this.getRouter().navTo("master", false);
            } else {
                this.getRouter().navTo("detail", {id : 0}, false);
            }
            oModel.refresh(true);
        },

        mapObject : function (obj, equivalents) {
            for (let key in equivalents) {
                obj[equivalents[key]] = obj[key];
                delete obj[key];
            }
        },

        cleanObject: function (obj) {
            for (let key in obj) {
                if (obj[key] === "") {
                    delete obj[key];
                }
            }
        }



    });

});