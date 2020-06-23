sap.ui.define([
    'abaRegressivePlanning/controller/BaseController',
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/m/Label',
    'sap/m/MessageToast',
    'sap/m/Text',
    'sap/m/TextArea',
    'sap/ui/core/mvc/Controller',
    'sap/ui/layout/HorizontalLayout',
    'sap/ui/layout/VerticalLayout',
    "sap/ui/model/json/JSONModel",
    'sap/ui/core/Fragment',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "abaRegressivePlanning/controller/MasterUserAppController"
], function (BaseController, Button, Dialog, Label, MessageToast, Text, TextArea, Controller, HorizontalLayout, VerticalLayout, JSONModel, Fragment,Filter, FilterOperator, MasterUserAppController) {
    'use strict';

    return BaseController.extend('abaRegressivePlanning.controller.Master', {
        /**
         * Function to be fired when the controller is initialized
         */
        onInit: function () {
            let that = this;
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/scenario/findAllScenario",
                dataType: "json",
                async: true,
                success: function (data) {
                    let dataModel = that.getView().getModel("data");
                    dataModel.setProperty("/scenarios", data.data);
                },
                error: function (request, status, error) {
                    console.log("Error al consultar escenarios");
                    that.onToast("Error al consultar escenarios");
                }
            });
            this.getRouter().getRoute('master')
                .attachPatternMatched(this._onMasterMatched, this);
        },
        dialog: null,
        /**
         * Function to be fired when the route 'master' is matched
         * @param {Object} oEvent event with the searchbox
         */
        _onMasterMatched: function (oEvent) {
            console.log('on master matched')
        },
        onSelectionChange: function (oEvent) {
            this.cleanFields();
            let dataModel = this.getModel('data');
            let listType = dataModel.getProperty('/listType');
            var oModel = null, oModel2;
            let that = this;
            
            //si no se van a comprar los escenarios
            if (listType == "SingleSelectMaster") {
                let object = oEvent.getParameters().listItem.getBindingContext('data').getObject();
                //popup que muestra años, se genera a partir de año de inicio y fin del escenario el listado
                let start = oEvent.getParameters().listItem.getBindingContext('data').getObject().date_start.substr(0, 4);
                let end = oEvent.getParameters().listItem.getBindingContext('data').getObject().date_end.substr(0, 4);
                let dates = [];
                that.getModel('data').setProperty("/atrNombre", "");
                that.getModel('data').setProperty("/menuDetails", false);
                this.getModel('data').setProperty("/menuGeneral", false);
                for (let i = start; i <= end; i++) {
                    dates.push({"year": parseInt(i.toString())});
                }
                this.getModel('data').setProperty('/dates', dates);
                let oItemTemplate = new sap.ui.core.Item({
                    key: "{data>year}",
                    text: "{data>year}"
                });
                //componentes del popup
                var erLabel = new Label({"text": "Escenario: "});
                var erLabel2 = new Label({"text": object.name});
                this.getModel('data').setProperty("/idSelected", object.scenario_id);
                let combo3 = new sap.m.MultiComboBox({
                    placeholder: "Año(s)",
                    items: {
                        path: "data>/dates",
                        template: oItemTemplate
                    },
                    selectedKeys: {
                        path: "data>/selectedDates",
                        template: "{selected}"
                    }
                });
               
                let loadDialog;
                this.dialog = new Dialog({
                        title: 'Seleccione los años del escenario que desea evaluar',
                        type: 'Message',
                        content: [erLabel, erLabel2, combo3],
                        beginButton: new Button({
                            text: 'Ok',
                            press: function () {
                                // instantiate dialog
                                // simulate end of operation
                                
                                let selectedDates = this.getModel('data').getProperty("/selectedDates");
                                let initialDate = this.getModel('data').getProperty("/dates")[0].year;
                                let idSelected = this.getModel('data').getProperty("/idSelected");
                                combo3.setSelectedKeys([])
                                //ahora los mando a backend junto al id del scenario seleccionado
                                let stats;
                                let that = this;
                                this.getModel('data').setProperty("/busy",true);
                                
                                // //solicito respuesta
                                $.ajax({
                                    type: "POST",
                                    contentType: "application/json",
                                    url: "/abaResultsGeneration",
                                    dataType: "json",
                                    data: JSON.stringify({
                                        "idScenario": idSelected,
                                        "years": selectedDates,
                                        "initialYear": initialDate
                                    }),
                                    async: true,
                                    success: function (data) {
                                        oModel = new JSONModel(data.data);
                                        oModel2 = new JSONModel(data.data);
                                        stats = data.stats;
                                        let tempModel = new Array();
                                        let tempObj = {
                                            "scenario": object.name,
                                            "text": stats[0].text,
                                            "quantity": stats[0].quantity
                                        };
                                        let tempObj2 = {
                                            "scenario": object.name,
                                            "text": stats[1].text,
                                            "quantity": stats[1].quantity
                                        };
                                        tempModel.push(tempObj);
                                        tempModel.push(tempObj2);
                                        that.getModel('data').setProperty("/menuGeneral", true);
                                        that.getModel('data').setProperty("/stats", tempModel);
                                        
                                        //armado del json para el treetable tomando en cuenta equivalentes
                                        var data = oModel.getData();
                                        var arrayDetails = [];
                                        var arrayAnios = [{name:"Todos"}];
                                        
                                        var arraySem = [{name:"Todos"}];
                                        var arrayElement = [{name:"Todos"}];
                                        var arrayMes = [];
                                        data.equivalents.forEach(function(item){
                                            arrayDetails.push({name:item.fecha});
                                            if(item.fecha=="Detallados")
                                            {
                                                item.equivalents.forEach(function(item){
                                                    var anioFecha = item.fecha;
                                                    arrayAnios.push({name:anioFecha});
                                                    var arrayMeses = [{name:"Todos"}];
                                                    item.equivalents.forEach(function(item){
                                                        var mesFecha = item.fecha;
                                                        arrayMeses.push({name:mesFecha})
                                                        item.equivalents.forEach(function(item){
                                                            var semana = item.fecha;
                                                            if(item.equivalents.length>0){
                                                                arraySem.push({name:semana});
                                                            }
                                                            item.equivalents.forEach(function(item){
                                                                
                                                                arrayMes.push({anio:anioFecha,mes:mesFecha,semana:semana,name:item.name,cant:item.quantity,equiva:item.equivalents})
                            
                                                            });
                                                            
                                                        });

                                                    });
                                                    that.getModel('data').setProperty("/selectedmes/" + anioFecha, arrayMeses);
                                                    
                                                });
                                            }
                                            else
                                            {
                                                item.equivalents.forEach(function(item){
                                                    arrayElement.push({name:item.name})
                                                    arrayMes.push({anio:"",mes:"",semana:"",name:item.name,cant:item.quantity,equiva:item.equivalents})
                                                });
                                            }
                                        });
                                        var arrayMeses = [{name:"Todos"},{name:"Enero"},{name:"Febrero"},{name:"Marzo"},{name:"Abril"},{name:"Mayo"},{name:"Junio"},{name:"Julio"},{name:"Agosto"},{name:"Septiembre"},{name:"Octubre"},{name:"Noviembre"},{name:"Diciembre"}];
                                        that.getModel('data').setProperty("/selectedmes1",arrayMeses);
                                        that.getModel('data').setProperty("/selectedDetails", arrayDetails);
                                        that.getModel('data').setProperty("/selectedAnios", arrayAnios);
                                        that.getModel('data').setProperty("/selectedsemana", arraySem);
                                        that.getModel('data').setProperty("/selectedMacroelemento", arrayElement);
                                        that.getModel('data').setProperty("/tableInfo", arrayMes);
                                        that.getModel('data').setProperty("/menuDetails", false);
                                        //activo las 
                                        var oCombox = sap.ui.getCore().byId("__component0---detail--comboName");
                                        oCombox.setSelectedKey("General")
                                        oCombox = sap.ui.getCore().byId("__component0---detail--comboMacroElement");
                                        oCombox.setSelectedKeys([])   
                                        var tbl = sap.ui.getCore().byId("__component0---detail--TreeTableBasic");
                                        var aFilter = [];
                                        aFilter.push(new Filter("mes", FilterOperator.EQ,""));
                                        var oBinding = tbl.getBinding("items");
                                        oBinding.filter(aFilter);
                                        
                                        var atr = sap.ui.getCore().byId("__component0---detail--oh1");
                                        /*
                                        tbl.addColumn(new sap.ui.table.Column({label: "Fecha", template: "data>fecha"}))
                                        tbl.addColumn(new sap.ui.table.Column({label: "MacroElemento", template: "data>name"}))
                                        tbl.addColumn(new sap.ui.table.Column({label: "Cantidad (Tons)", template: "data>quantity"}))
                                        */
                                        // atr.destroyAttributes();
                                        that.getModel('data').setProperty("/atrNombre", object.name);


                                        // atr.addAttribute(new sap.m.ObjectAttribute({text:object.name,active:true,press:function(oEvent){
                                        //     console.log(oEvent);
                                            
                                        //     that.showPopOver(oEvent);
                                        // }}));
                                       
                                        //that.getModel('data').setProperty("/columns/visible" + 1, true);
                                        
                                        that.getModel('data').setProperty("/busy",false);
                                    },
                                    error: function (request) {
                                        var msg = request.statusText;
                                        that.onToast('Error: ' + 'El escenario no tiene datos cargados');
                                     
                                        that.getModel('data').setProperty("/busy",false);
                                        that.getModel('data').setProperty("/menuGeneral", false);
                                        console.log("Read failed: ", request);
                                    }
                                });

                                //texto del lado derecho
                                this.dialog.close();
                                loadDialog = this._dialog;
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: 'Cancelar',
                            press: function () {
                                this.dialog.close();
                                combo3.setSelectedKeys([])
                                // dialog.destroy();
                            }.bind(this)
                        }),
                        afterClose: function () {
                            loadDialog.close();
                            // this.dialog.destroy();
                        }
                    }
                );
                if (oModel != null) {
                    this.getModel('data').setProperty("/tableInfo", oModel.getData());
                }
                this.getView().addDependent(this.dialog);
                this.getView().byId("scenarioList").removeSelections(true);
                this.dialog.open();
            }
        },
        activateComparation: function (oEvent) {
            let dataModel = this.getModel('data');
            let listType = dataModel.getProperty('/listType');
            if (listType == "SingleSelectMaster") {
                dataModel.setProperty('/listType', "MultiSelect");
                dataModel.setProperty('/compareButton/text', "Cancelar");
                dataModel.setProperty('/compareButton/type', "Reject");
                dataModel.setProperty('/calculateButton/visible', true);
            } else {
                dataModel.setProperty('/listType', "SingleSelectMaster");
                dataModel.setProperty('/compareButton/text', "Comparar");
                dataModel.setProperty('/compareButton/type', "Emphasized");
                dataModel.setProperty('/calculateButton/visible', false);
            }
        },
        calculate: function (oEvent) {
            this.cleanFields();
            var oModel = null, oModel2;
            let selected = this.getView().byId("scenarioList").getSelectedItems();
            let arrayOfScenariosAndDates = new Array();
            let loadDialog;
            //activa columnas de macroelementos
            for (let i = 0; i < selected.length; i++) {
                let tempPath = this.getView().byId("scenarioList").getSelectedItems()[i].getBindingContext('data').getPath();
                let actualObject = this.getModel('data').getProperty(tempPath);
                //genero años
                let start = actualObject.date_start.substr(0, 4);
                let end = actualObject.date_end.substr(0, 4);
                let dates = [];
                for (let i = start; i <= end; i++) {
                    dates.push({"year": parseInt(i.toString())});
                }
                //armo el objeto
                let tempObject =
                    {
                        "id": actualObject.scenario_id,
                        "name": actualObject.name,
                        "dates": dates,
                        "selectedDates": []
                    }
                arrayOfScenariosAndDates.push(tempObject);
                //debo colocar el nombre de la columna +1
                this.getModel('data').setProperty("/columns/columnName" + (i + 2), actualObject.name);
            }
            this.getModel('data').setProperty("/scenariosAndDates", arrayOfScenariosAndDates);
            //para cada uno de los escenarios genero los desplegables
            let arrayOfObjects = new Array();
            for (let i = 0; i < selected.length; i++) {
                let oItemTemplate = new sap.ui.core.Item({
                    key: "{data>year}",
                    text: "{data>year}"
                });
                var erLabel = new Label({"text": "Escenario: "});
                console.log(selected);
                var erLabel2 = new Label({"text": selected[i].mProperties.title});
                var combo3 = new sap.m.MultiComboBox({
                    placeholder: "Año(s)",
                    items: {
                        path: "data>/scenariosAndDates/" + i.toString() + "/dates",
                        template: oItemTemplate
                    },
                    selectedKeys: {
                        path: "data>/scenariosAndDates/" + i.toString() + "/selectedDates",
                        template: "{selected}"
                    }
                });
                arrayOfObjects.push(erLabel, erLabel2, combo3);
            }
            
            var stats;
            // var that = this;
            this.dialog = new Dialog({
                    title: 'Seleccione los años del escenario que desea evaluar',
                    type: 'Message',
                    content: arrayOfObjects,
                    beginButton: new Button({
                        text: 'Ok',
                        press: function () {
                            if (!this._dialog) {
                                this._dialog = sap.ui.xmlfragment("abaRegressivePlanning.view.BusyDialog", this);
                                this.getView().addDependent(this._dialog);
                            }
                            //abrir dialogo de espera
                            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._dialog);
                            this._dialog.open();
                            let tempInfo = this.getModel('data').getProperty("/scenariosAndDates");
                            let selectedDates = this.getModel('data').getProperty("/scenariosAndDates/" + 0 + "/selectedDates");
                            let initialDate = this.getModel('data').getProperty("/scenariosAndDates/" + 0 + "/dates")[0].year;
                            let idSelected = this.getModel('data').getProperty("/scenariosAndDates/" + 0 + "/id");
                            let actualName = this.getModel('data').getProperty("/scenariosAndDates/" + 0 + "/name");
                            //para cada uno de los datos enviar a backend años y id del scenario
                            let that = this;
                            $.ajax({
                                type: "POST",
                                contentType: "application/json",
                                url: "/abaResultsGeneration",
                                dataType: "json",
                                data: JSON.stringify({
                                    "idScenario": idSelected,
                                    "years": selectedDates,
                                    "initialYear": initialDate
                                }),
                                async: false,
                                success: function (data) {
                                    oModel = new JSONModel(data.data);
                                    stats = data.stats;
                                },
                                error: function (request) {
                                    var msg = request.statusText;
                                    that.onToast('Error: ' + 'El escenario no tiene datos cargados');
                                    that._dialog.close();
                                    console.log("Read failed: ", request);
                                }
                            });
                            //aqui añado el primero
                            let tempModel = new Array();
                            let tempObj = {
                                "scenario": actualName,
                                "text": stats[0].text,
                                "quantity": stats[0].quantity
                            };
                            let tempObj2 = {
                                "scenario": actualName,
                                "text": stats[1].text,
                                "quantity": stats[1].quantity
                            };
                            tempModel.push(tempObj);
                            tempModel.push(tempObj2);
                            this.getModel('data').setProperty("/stats", tempModel);
                            //ya esta listo el primer elemento ahora continuo con los demas
                            for (let j = 1; j < tempInfo.length; j++) {
                                //para cada uno de los datos enviar a backend años y id del scenario
                                let selectedDates = this.getModel('data').getProperty("/scenariosAndDates/" + j + "/selectedDates");
                                let initialDate = this.getModel('data').getProperty("/scenariosAndDates/" + j + "/dates")[0].year;
                                let idSelected = this.getModel('data').getProperty("/scenariosAndDates/" + j + "/id");
                                let actualName = this.getModel('data').getProperty("/scenariosAndDates/" + j + "/name");
                                //ahora los mando a backend junto al id del scenario seleccionado
                                // //solicito respuesta
                                oModel2=null;
                                $.ajax({
                                    type: "POST",
                                    contentType: "application/json",
                                    url: "/abaResultsGeneration",
                                    dataType: "json",
                                    data: JSON.stringify({
                                        "idScenario": idSelected,
                                        "years": selectedDates,
                                        "initialYear": initialDate
                                    }),
                                    async: false,
                                    success: function (data) {
                                        oModel2 = new JSONModel(data.data);
                                        stats = data.stats;
                                    },
                                    error: function (request) {
                                        var msg = request.statusText;
                                        that.onToast('Error: ' + 'El escenario ' + actualName +' no tiene datos cargados');
                                        that._dialog.close();
                                        console.log("Read failed: ", request);
                                    }
                                });
                                //aqui añado el primero
                                let tempModel = this.getModel('data').getProperty("/stats");
                                let tempObj = {
                                    "scenario": actualName,
                                    "text": stats[0].text,
                                    "quantity": 0
                                }
                                let tempObj2 = {
                                    "scenario": actualName,
                                    "text": stats[1].text,
                                    "quantity": 0
                                }
                                if(oModel2){
                                    
                                    tempObj.quantity = stats[0].quantity;
                                    tempObj2.quantity= stats[1].quantity; 
                                    
                                    oModel.oData.equivalents[1].equivalents="";
                                    oModel.oData.equivalents[0].equivalents.forEach(function (element) {
                                        //aqui estoy en el primer nivel
                                        //buscar en segundo mapa
                                        //el omodel2 puede ser reasignable en funcion a la cantidad de escenarios
                                        
                                        oModel2.oData.equivalents[0].equivalents.forEach(function (element3) {
                                            //aqui estoy en el primer nivel
                                            if (element.id == element3.id) {
                                                element["quantity" + j] = element3.quantity;
                                                //agregar cantidad
                                            } else {
                                                element3.equivalents.forEach(function (element4) {
                                                    //aqui estoy en el primer nivel
                                                    //buscar en segundo mapa
                                                    if (element.id == element4.id) {
                                                        //agregar cantidad
                                                        element["quantity" + j] = element4.quantity;
                                                    }
                                                });
                                            }
                                        });
                                        //aqui busco en el segundo nivel del primer mapa
                                        element.equivalents.forEach(function (element2) {
                                            //aqui estoy en el primer nivel
                                            //buscar en segundo mapa
                                            oModel2.oData.equivalents[0].equivalents.forEach(function (element3) {
                                                //aqui estoy en el primer nivel
                                                if (element2.id == element3.id) {
                                                    //agregar cantidad
                                                    element2["quantity" + j] = element3.quantity;
                                                } else {
                                                    element3.equivalents.forEach(function (element4) {
                                                        //aqui estoy en el primer nivel
                                                        //buscar en segundo mapa
                                                        if (element2.id == element4.id) {
                                                            //agregar cantidad
                                                            element2["quantity" + j] = element4.quantity;
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    });
                                }
                                tempModel.push(tempObj);
                                tempModel.push(tempObj2);
                                this.getModel('data').setProperty("/stats", tempModel);
                                this.getModel('data').setProperty("/scenariosAndDates", arrayOfScenariosAndDates);
                            }
                            /*
                            this.getModel('data').setProperty("/columns", []);
                            
                            var tbl = sap.ui.getCore().byId("__component0---detail--TreeTableBasic");
                            var atr = sap.ui.getCore().byId("__component0---detail--oh1");
                            
                            tbl.addColumn(new sap.ui.table.Column({label: "Macroelemento", template: "data>name"}))
                            tbl.addColumn(new sap.ui.table.Column({label: selected[0].mProperties.title, template: "data>quantity"}))
                            atr.addAttribute(new sap.m.ObjectAttribute({text:selected[0].mProperties.title,active:true,press:function(oEvent){
                                that.showPopOver(oEvent);
                                }}));
            
                            for(let i = 1; i < selected.length; i++)
                            {
                                tbl.addColumn(new sap.ui.table.Column({label: selected[i].mProperties.title, template: "data>quantity" + i.toString()}))
                                atr.addAttribute(new sap.m.ObjectAttribute({text:selected[i].mProperties.title,active:true,press:function(oEvent){
                                    that.showPopOver(oEvent);
                                    }}));
                            }
                            */
                            
                            this.getModel('data').setProperty("/tableInfo", oModel.oData.equivalents[0].equivalents);
                            this.getModel('data').getProperty("/stats");
                            this._dialog.close();
                            this.dialog.close();
                        // MessageToast.show('Submit pressed!
                    
                            //instanciando el dialogo de espera
                            
                            //habilitacion de columnas
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: 'Cancelar',
                        press: function () {
                            this.dialog.close();
                            
                            // dialog.destroy();
                        }.bind(this)
                    }),
                    afterClose: function () {
                        
                        this.dialog.destroy();
                    }
                }
            );
            this.getView().addDependent(this.dialog);
            this.dialog.open();
        },
        cleanFields: function () {
            /*
            var tbl = sap.ui.getCore().byId("__component0---detail--TreeTableBasic");
            var atr = sap.ui.getCore().byId("__component0---detail--oh1");
            atr.destroyAttributes();
            tbl.destroyColumns();*/
        },
        showPopOver: function (oEvent) {
            //coloco en el popUp el valor correspondiente, deberia de estar en stats
            let stats = this.getModel('data').getProperty("/stats");
            let actualScenarioName = oEvent.oSource.mProperties.text;
            //busco en stats a con nombre igual al anterior
            let toShow = stats.filter(data => data.scenario == actualScenarioName);
            this.getModel('data').setProperty("/popOverData/scenarioName",
                                                "Aves consumiendo");
            this.getModel('data').setProperty("/popOverData/criaYLevante",
                                    toShow[0].text + ": " + toShow[0].quantity);
            this.getModel('data').setProperty("/popOverData/engorde",
                toShow[1].text + ": " + toShow[1].quantity);
            // create popover
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("abaRegressivePlanning.view.Popover", this);
                this.getView().addDependent(this._oPopover);
            }
            this._oPopover.openBy(oEvent.getSource());
        }
    });
}, /* bExport= */ true);
