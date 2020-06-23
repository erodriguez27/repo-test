sap.ui.define([
    "incubatorPlanningM/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/odata/OperationMode",
    "sap/m/MessageToast",
    "sap/ui/core/Item",
    "incubatorPlanningM/model/formatter",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text"
], function (BaseController, JSONModel, BusyIndicator, ODataModel, OperationMode,
    MessageToast, Item, formatter, Dialog, Button, Text) {
    "use strict";
    // var axios = require("axios");
    return BaseController.extend("incubatorPlanningM.controller.Edit_ingreso_egreso", {

        onInit: function () {
            this.getRouter().getRoute("editig").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
            var oArguments = oEvent.getParameter("arguments");
            this.index = oArguments.id;
            this.getView().byId("__header1").bindElement("ospartnership>/records/" + this.index + "/");
            this.onRead(this.index);
        },
        onRead: async function (index) {
            let mdegresoIngresoAjustes = this.getModel("mdegresoIngresoAjustes");
            const servername = "/eggsMovements/totalRecord";
            fetch(servername, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            }).then(function (response) {
                if (response.status == 500) {
                    console.log("Looks like there was a problem. Status Code: " + response.status);
                } else {
                    response.json().then(function (recordIngresos) {
                        // console.log(recordIngresos);
                      

                        mdegresoIngresoAjustes.setProperty("/RecordIngresos", recordIngresos.ingresos);
                        mdegresoIngresoAjustes.setProperty("/RecordEgresos", recordIngresos.egresos);
                        mdegresoIngresoAjustes.setProperty("/RecordAjustes", recordIngresos.ajustes);
                    });
                }
            });

        },
        hideButtons: function (programmed, execution, reports) {
            let mdegresoIngresoAjustes = this.getModel("mdegresoIngresoAjustes");
            mdegresoIngresoAjustes.setProperty("/ingresosNewBtn", programmed);
            mdegresoIngresoAjustes.setProperty("/EgresosNewBtn", execution);
            mdegresoIngresoAjustes.setProperty("/AjustesNewBtn", reports);

        },
        onTabSelection: function (ev) {
            var selectedKey = ev.getSource().getSelectedKey();
            if (selectedKey === "ktabIngreso") {
                this.hideButtons(true, false, false);
            }
            if (selectedKey === "ktabEgreso") {
                this.hideButtons(false, true, false);
            }
            if (selectedKey === "ktabAjustes") {
                this.hideButtons(false, false, true);
            }
            if (selectedKey === "recordTabIngreso") {
                this.hideButtons(false, false, false);
            }
            if (selectedKey === "recordTabEgreso") {
                this.hideButtons(false, false, false);
            }
            if (selectedKey === "recordTabAjuste") {
                this.hideButtons(false, false, false);
            }
        },

        functionFindEgreso: async  function (dayparm1,dayparm2) {
            let elementefing;
            let mdegresoIngresoAjustes = this.getModel("mdegresoIngresoAjustes");
            let servername = "/eggsMovements/findIngresoOfEgresoDate";
            fetch(servername, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    dayparm1: dayparm1,
                    dayparm2: dayparm2
                })
            }).then(function (find_ingreso) {
                if (find_ingreso.status == 500) {
                    console.log("Looks like there was a problem. Status Code: " + StatusRespo.status);
                } else {
                    console.log(find_ingreso);
                    find_ingreso.json().then( async function (dataE) {
                        console.log(dataE);
                        dataE.data.forEach(element => {
                            if (element.eggs == 0) {
                                element.available = false;
                            }else{
                                element.newDate;
                                element.newEggs;
                                element.available = true;
                            }
                        });
                        elementefing =  dataE.data;
                        mdegresoIngresoAjustes.setProperty("/Egresos", elementefing);
                    });
                  

                    
                }
             
            });    
        },
        functionFindAjuste: async  function (dayparm1,dayparm2) {
            let elementefing = [];
            let mdegresoIngresoAjustes = this.getModel("mdegresoIngresoAjustes");
            let dateEggs = new Date();
            let LaCopia = [];
            let servername = "/eggsMovements/ajusteMovement";
            fetch(servername, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    dayparm1: dayparm1,
                    dayparm2: dayparm2
                })

            })
                .then( function (response) {
                    if (response.status == 500) {
                        console.log("Looks like there was a problem. Status Code: " + response.status);
                    } else {
                        response.json().then( async function (info) {
                            let data = info.data;
                            let StringDate = "";
                            console.log(data);
                            // data.forEach(element => {
                            //     StringDate = element.fecha_movements;
                            //     dateEggs = new Date(element.fecha_movements);
                            
                            //         LaCopia = JSON.parse(JSON.stringify(element)); 
                            //         LaCopia.fecha_movements = `${dateEggs.getDate()}/${dateEggs.getUTCMonth()+1}/${dateEggs.getFullYear()}`;
                            //         LaCopia.available = true;
                            //         elementefing.push(LaCopia)
                            
                            // });
                            elementefing =  data;
                            if (elementefing.length > 0) {
                                mdegresoIngresoAjustes.setProperty("/Ajustes", elementefing);
                            }else{
                                mdegresoIngresoAjustes.setProperty("/Ajustes", "");
                            }
                        });
                    }   
                });
        },

        onPress: async function (oEvent) {
            let sId = oEvent.getSource().sId.substring(36, oEvent.getSource().sId.length);
            let mdinventorySelect =   this.getModel("mdinventory").getProperty("/selecterInventartio");
            let mdegresoIngresoAjustes = this.getModel("mdegresoIngresoAjustes");
            let mdinventory = this.getModel("mdinventory").getProperty("/records2");
            let obj = this.getModel("mdinventory").getProperty("/selecterInventartio");
            let date1, date2;
            let recordIngreso = mdegresoIngresoAjustes.getProperty("/RecordIngresos");
            let recordEgreso = mdegresoIngresoAjustes.getProperty("/RecordEgresos");
            let recordAjuste = mdegresoIngresoAjustes.getProperty("/RecordAjustes");
            let that = this;
            console.log(recordIngreso);
            if (sId == "IngresoButton") {
                date1 = this.getView().byId("dayparam1").mProperties.value;
                date2 = this.getView().byId("dayparam2").mProperties.value;
            } else {
                if (sId == "EgresosButton") {
                    date1 = this.getView().byId("dayparam3").mProperties.value;
                    date2 = this.getView().byId("dayparam4").mProperties.value;
                } else {
                    if (sId == "AjustesButton") {
                        date1 = this.getView().byId("dayparam5").mProperties.value;
                        date2 = this.getView().byId("dayparam6").mProperties.value;
                    }
                }
            }

            let aDate = date1.split("-"),
                init_date = `${aDate[1]}-${aDate[0]}-${aDate[2]}`;

            let aDate2 = date2.split("-"),
                end_date = `${aDate2[1]}-${aDate2[0]}-${aDate2[2]}`;

            let elementefing = [];

            let i = 0,
                j = 0;
            let band = true;
            let dateEggs = new Date();
            let dayparm1 = new Date(date1);
            let dayparm2 = new Date(date2);
            let LaCopia = [];

            console.log(mdinventorySelect);
            console.log(mdinventorySelect.id);

            let servername = "/incubator_plant/incubatorStatus";
            fetch(servername, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    incubator_plant_id: mdinventorySelect.id
                })
            }).then(  function (StatusRespo) {
                    
                if (StatusRespo.status == 500) {
                    console.log("Looks like there was a problem. Status Code: " + StatusRespo.status);
                } else {
                    StatusRespo.json().then(async function (StatusDisp) {


                        if (sId == "IngresoButton") {
                            mdegresoIngresoAjustes.setProperty("/desde", init_date);
                            mdegresoIngresoAjustes.setProperty("/hasta", end_date);
                        } else {
                            if (sId == "EgresosButton") {
                                mdegresoIngresoAjustes.setProperty("/desdeEgreso", init_date);
                                mdegresoIngresoAjustes.setProperty("/hastaEgreso", end_date);
                            } else {
                                if (sId == "AjustesButton") {
                                    mdegresoIngresoAjustes.setProperty("/desdeAjuste", init_date);
                                    mdegresoIngresoAjustes.setProperty("/hastaAjuste", end_date);
                                }
                            }
                        }

                        console.log(mdinventory);
                        while (i < mdinventory.length && band) {
                            if (obj.name == mdinventory[i].name) {
                                band = false;
                                if (sId == "IngresoButton") {
                                    // mdinventory[i].acc.forEach(function (element) {
                                    //     let aDate = element['end_date'].split("/"),
                                    //     init_date = `${aDate[1]}-${aDate[0]}-${aDate[2]}`;
                                    //     dateEggs = new Date(init_date);
                                            
                                    //     console.log(dateEggs);
                                    //     if (dateEggs >= dayparm1 && dateEggs <= dayparm2) {
                                    //         var found = recordIngreso.find(function(element2) {
                                    //             return element2.eggs_storage_id == element.eggs_storage_id;
                                    //         }); 
                                    //         element[element.length + 1] = ("acc")
                                    //         LaCopia = JSON.parse(JSON.stringify(element)); 
                                                
                                    //         console.log(found);
                                    //         if (found != undefined) {
                                    //             LaCopia.newEggs = found.quantity
                                    //             LaCopia.available = false;
                                    //         }else{
                                                    
                                    //             LaCopia.available = true;
                                    //         }

                                    //         LaCopia.end_date =  `${dateEggs.getDate()}/${dateEggs.getUTCMonth()+1}/${dateEggs.getFullYear()}`;
                                    //         elementefing.push(LaCopia)
                                    //     } else {
                                    //         console.log("No Cumple");
                                    //     }
                                    // })

                                    console.log(StatusDisp);
                                    if (StatusDisp.data[0].acclimatized) {
                                        mdinventory[i].acc.forEach(function (element) {
                                            let aDate = element["init_date"].split("/"),
                                                init_date = `${aDate[1]}/${aDate[0]}/${aDate[2]}`;
                                            dateEggs = new Date(init_date);
                                            if (dateEggs >= dayparm1 && dateEggs <= dayparm2) {
                                                element[element.length + 1] = ("acc");
                                                var found = recordIngreso.find(function(element2) {
                                                    return element2.eggs_storage_id == element.eggs_storage_id;
                                                }); 
                                                LaCopia = JSON.parse(JSON.stringify(element)); 
                                                console.log(found);
                                                if (found != undefined) {
                                                    LaCopia.newEggs = found.quantity;
                                                    LaCopia.newDate = found.fecha_movements;
                                                    LaCopia.available = false;
                                                }else{
                                                        
                                                    LaCopia.available = true;
                                                }
                                                LaCopia.end_date =  `${dateEggs.getDate()}/${dateEggs.getUTCMonth()+1}/${dateEggs.getFullYear()}`;
                                                LaCopia.newDate;
                                                LaCopia.newEggs;
                                                elementefing.push(LaCopia);
                                            } else {
                                                console.log("No Cumple");
                                            }
                                        });
                                        

                                    }

                                    if (StatusDisp.data[0].suitable) {
                                        mdinventory[i].app.forEach(function (element) {
                                            let aDate = element["init_date"].split("/"),
                                                end_date = `${aDate[1]}/${aDate[0]}/${aDate[2]}`;
                                            dateEggs = new Date(end_date);
                                            if (dateEggs >= dayparm1 && dateEggs <= dayparm2) {
                                                element[element.length + 1] = ("app");
                                                var found = recordIngreso.find(function(element2) {
                                                    return element2.eggs_storage_id == element.eggs_storage_id;
                                                }); 
                                                LaCopia = JSON.parse(JSON.stringify(element)); 
                                                console.log(found);
                                                if (found != undefined) {
                                                    LaCopia.newEggs = found.quantity;
                                                    LaCopia.newDate = found.fecha_movements;
                                                    LaCopia.available = false;
                                                }else{
                                                        
                                                    LaCopia.available = true;
                                                }
                                                LaCopia.end_date =  `${dateEggs.getDate()}/${dateEggs.getUTCMonth()+1}/${dateEggs.getFullYear()}`;
                                                LaCopia.newDate;
                                                LaCopia.newEggs;
                                            
                                                elementefing.push(LaCopia);
                                            } else {
                                                console.log("No Cumple");
                                            }
                                        });
                                            

                                    }

                                    if (StatusDisp.data[0].expired) {
                                        mdinventory[i].exp.forEach(function (element) {
                                            let aDate = element["init_date"].split("/"),
                                                end_date = `${aDate[1]}/${aDate[0]}/${aDate[2]}`;
                                            dateEggs = new Date(end_date);
                                            if (dateEggs >= dayparm1 && dateEggs <= dayparm2) {
                                                element[element.length + 1] = ("exp");
                                                var found = recordIngreso.find(function(element2) {
                                                    return element2.eggs_storage_id == element.eggs_storage_id;
                                                }); 
                                                LaCopia = JSON.parse(JSON.stringify(element)); 
                                                console.log(found);
                                                if (found != undefined) {
                                                    LaCopia.newEggs = found.quantity;
                                                    LaCopia.newDate = found.fecha_movements;
                                                    LaCopia.available = false;
                                                }else{
                                                        
                                                    LaCopia.available = true;
                                                }
                                                LaCopia.end_date =  `${dateEggs.getDate()}/${dateEggs.getUTCMonth()+1}/${dateEggs.getFullYear()}`;
                                                LaCopia.newDate;
                                                LaCopia.newEggs;
                                                    
                                                elementefing.push(LaCopia);
                                            } else {
                                                console.log("No Cumple");
                                            }
                                        });
                                            
                                    }
                                    
                                }
                            }
                            i++;
                        }

                        if (sId == "EgresosButton") {
                            that.functionFindEgreso(dayparm1,dayparm2);
                        }
                                
                        if (sId == "AjustesButton") {
                            that.functionFindAjuste(dayparm1,dayparm2);
                        }


                        console.log(elementefing);
                        if (elementefing != undefined) {
                            if (elementefing.length > 0) {
                                console.log(sId);
                                if (sId == "IngresoButton") {
                                    mdegresoIngresoAjustes.setProperty("/Ingresos", elementefing);
                                }
                            } else {
                                if (sId == "IngresoButton") {
                                    mdegresoIngresoAjustes.setProperty("/Ingresos", "");
                                }
                            }
                        }
                            
                    });
                }
            });
                       
        },

        handleDelete: function (oEvent) {
            console.log("elimina");

            let sId = oEvent.getParameters().listItem.sId,
                asId = sId.split("-"),
                idx = asId[asId.length - 1],
                queEs = asId[asId.length - 2],
                mdegresoIngresoAjustes = this.getModel("mdegresoIngresoAjustes"),
                that = this;
            console.log(idx);
            
            let obj;
            let Day = "";
            let date = new Date();
            let aux;
            if (queEs == "IngresoTable") {
                obj = mdegresoIngresoAjustes.getProperty("/Ingresos/" + idx);
                let aDate =obj.end_date.split("/"),
                    aux = `${aDate[1]}-${aDate[0]}-${aDate[2]}`;
                date= new Date(aux);
                Day = `${date.getDate()}/${date.getUTCMonth()+1}/${date.getFullYear()}`;
            }
            if (queEs == "EgresosTable") {
                obj = mdegresoIngresoAjustes.getProperty("/Egresos/" + idx);
                let aDate =obj.end_date.split("/"),
                    aux = `${aDate[1]}-${aDate[0]}-${aDate[2]}`;
                date= new Date(aux);
                Day = `${date.getDate()}/${date.getUTCMonth()+1}/${date.getFullYear()}`;
            }
            if (queEs == "AjustesTable") {
                obj = mdegresoIngresoAjustes.getProperty("/Ajustes/" + idx);
                let aDate =obj.fecha_movements.split("/"),
                    aux = `${aDate[1]}-${aDate[0]}-${aDate[2]}`;
                date= new Date(aux);
                Day = `${date.getDate()}/${date.getUTCMonth()+1}/${date.getFullYear()}`;
            }

            console.log("Obj: ", obj);
            var dialog = new Dialog({
                title: "Confirmaci�n",
                type: "Message",
                content: new Text({
                    text: "Se prodecera a eliminar el lote: " + obj.lot + " que arribo el " + Day.substring(0,10)
                }),
                beginButton: new Button({
                    text: "Continuar",
                    press: function () {
                        //   that.deleteProgrammed(obj.lot_incubator);
                        dialog.close();

                        /*Aqui se hace la modificacion para eliminar cuando se esta insertando uno nuevo*/
                        let mdincubator = that.getView().getModel("mdegresoIngresoAjustes");
                        let arr;

                        if (queEs == "IngresoTable") {
                            arr =mdincubator.getProperty("/Ingresos");
                            arr.splice(idx, 1);
                            mdincubator.setProperty("/mdegresoIngresoAjustes", arr);
                        }
                        if (queEs == "EgresosTable") {
                            arr = mdincubator.getProperty("/Egresos");
                            arr.splice(idx, 1);
                            mdincubator.setProperty("/mdegresoIngresoAjustes", arr);
                        }
                        if (queEs == "AjustesTable") {
                            arr = mdincubator.getProperty("/Ajustes");
                            arr.splice(idx, 1);
                            mdincubator.setProperty("/mdegresoIngresoAjustes", arr);
                        }
                        /*hasta aqui*/
                        console.log(mdincubator);

                        //that.deleteProgrammed(obj.housingway_detail_id, obj.housing_way_id);
                    }
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },

        onDialogPress: function (oEvent) {
      
            let sId = oEvent.getSource().sId;
            let asId = sId.split("-");
            let queEs = asId[asId.length - 1];
            let  mdegresoIngresoAjustes = this.getModel("mdegresoIngresoAjustes");
            let LosPanasDatos = [];
            let servername;
            console.log(queEs);
            let band = true;
            let bandCantida = false;
            let date1,date2;

            if (queEs == "ajustesSaveBtn") {
                servername = "/eggsMovements/updateEggsMovements";
            }else{
                servername = "/eggsMovements/addEggsMovements";
            }

            let that=this;

            if (queEs == "ingresosSaveBtn") {
                mdegresoIngresoAjustes.getProperty("/Ingresos").forEach(function(element) {
                    console.log(element.newEggs);
                    console.log(element.newDate);
                    if (element.newEggs != undefined && element.newDate != undefined && element.available == true) {
                        LosPanasDatos.push({
                            "fecha_movements":element.newDate,
                            "lot":element.lot,
                            "quantity":element.newEggs,
                            "type_movements": "Ingreso",
                            "eggs_storage_id": element.eggs_storage_id
                        });
                        element.available = false;
                    }
                });
            }else{
                if (queEs == "egresosSaveBtn") {
                    mdegresoIngresoAjustes.getProperty("/Egresos").forEach(function(element) {
                        if (element.newEggs != undefined  && element.newDate != undefined) {
                            console.log(element.newEggs);
                            console.log(element.eggs);
                            if (parseInt(element.newEggs) <= parseInt(element.eggs) ) {
                                console.log(element);
                                LosPanasDatos.push({
                                    "fecha_movements":element.newDate,
                                    "lot":element.lot,
                                    "quantity":element.newEggs,
                                    "type_movements": "Egreso",
                                    "eggs_storage_id": element.eggs_storage_id
                                });
                            }else{
                                console.log(element);
                                bandCantida = true;
                            }

                        }
                 
                    });
                }else{
                    if (queEs == "ajustesSaveBtn") {
                        console.log( mdegresoIngresoAjustes.getProperty("/Ajustes"));
                    
                        mdegresoIngresoAjustes.getProperty("/Ajustes").forEach(function(element) {
                        

                            if (element.newEggs != undefined) {
                                // let aDate =element.fecha_movements.split("/"),
                                // aux = `${aDate[1]}-${aDate[0]}-${aDate[2]}`;
                                // console.log(aux);
                                // let transFor = new Date(aux)
                                // let date = `${transFor.getFullYear()}-${((transFor.getMonth() + 1) < 10 ? '0' : '') + (transFor.getMonth() + 1)}-${(transFor.getDate() < 10 ? '0' : '') + transFor.getDate()}`;
                              
                                // let date = new Date(element.fecha_movements);
                                // console.log("date -> "+ transFor)
                                if (element.newEggs != undefined ) {
                                    if (element.description_adjustment != null) {
                                        if (element.newEggs <= element.quantity || element.description_adjustment == "Compra de huevos") {
                                            if (element.type_movements == "Egreso" ) {
                                                LosPanasDatos.push({
                                                    "eggs_movements_id":element.eggs_movements_id,
                                                    "fecha_movements": element.fecha_movements,
                                                    "lot":element.lot,
                                                    "quantity":  parseInt((element.newEggs)),
                                                    "type_movements": "Ajuste Egreso",
                                                    "eggs_storage_id": element.eggs_storage_id,
                                                    "description_adjustment":element.description_adjustment
                                                });
                                       
                                            }else{
                                                LosPanasDatos.push({
                                                    "eggs_movements_id":element.eggs_movements_id,
                                                    "fecha_movements": element.fecha_movements,
                                                    "lot":element.lot,
                                                    "quantity":  parseInt((element.newEggs)),
                                                    "type_movements": "Ajuste",
                                                    "eggs_storage_id": element.eggs_storage_id,
                                                    "description_adjustment":element.description_adjustment
                                                });
                              
                                            }
                                        }else{
                                            bandCantida = true;
                                        }

                               
                                    }else{
                                        band = false;
                                    }
                                }
                            }                                                    
                        });
                    }
                }
            }
   
            console.log(LosPanasDatos);
            if (LosPanasDatos.length == 0) {
                band = false;
            }

            if (bandCantida == false) {
                if (band == false) {
                    if (LosPanasDatos.length > 0) {
                        var inf = "Descripcion No Seleccionada";
                        var dialog = new Dialog({
                            title: "Error",
                            type: "Message",
                            state: "Error",
                            content: new Text({
                                text: inf
                            }),
                            beginButton: new Button({
                                text: "Continuar",
                                press: function () {
                                    dialog.close();
                                }
                            }),
                            afterClose: function () {
                                dialog.destroy();
                            }
                        });
                        dialog.open();
                        LosPanasDatos = [];
                    }
                }else{
                    fetch(servername, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "same-origin",
                        body: JSON.stringify({
                            registers: LosPanasDatos
                        })
                    })
                        .then(function (response) {
                            if (response.status == 500) {
                                var inf = "Problema con la Actualizacion";
                                var dialog = new Dialog({
                                    title: "Error",
                                    type: "Message",
                                    state: "Error",
                                    content: new Text({
                                        text: inf
                                    }),
                                    beginButton: new Button({
                                        text: "Continuar",
                                        press: function () {
                                            dialog.close();
                                        }
                                    }),
                                    afterClose: function () {
                                        dialog.destroy();
                                    }
                                });
                                dialog.open();
        
                            }else{
                                response.json().then(function (eggsMovement_Result) {
                                    var inf = "Actualizacion Exitosa";
                                    var dialog = new Dialog({
                                        title: "success",
                                        type: "Message",
                                        state: "Success",
                                        content: new Text({
                                            text: inf
                                        }),
                                        beginButton: new Button({
                                            text: "Continuar",
                                            press: function () {
                                                if (queEs == "ajustesSaveBtn") {
                                                    mdegresoIngresoAjustes.getProperty("/Ajustes").forEach(function(element) {
                                                        element.newEggs = null;   
                                                        element.description_adjustment = null;
                                                    });
                                                    date1 = that.getView().byId("dayparam5").mProperties.value;
                                                    date2 = that.getView().byId("dayparam6").mProperties.value;
                                
                                                    let dayparm1 = new Date(date1);
                                                    let dayparm2 = new Date(date2);

                                                    that.functionFindAjuste(dayparm1,dayparm2);
                                                }
                                                if (queEs == "egresosSaveBtn") {
                                                    mdegresoIngresoAjustes.getProperty("/Egresos").forEach(function(element) {
                                                        element.newEggs = null;
                                                        element.newDate = null;
                                                    });
                                                    date1 = that.getView().byId("dayparam3").mProperties.value;
                                                    date2 = that.getView().byId("dayparam4").mProperties.value;
                                
                                                    let dayparm1 = new Date(date1);
                                                    let dayparm2 = new Date(date2);
                                                    that.functionFindEgreso(dayparm1,dayparm2);
                                                }
                                    
                                                mdegresoIngresoAjustes.refresh();
                                                that.onRead(that.index);
                                                dialog.close();
                                            }
                                        }),
                                        afterClose: function () {
                                            dialog.destroy();
                                        }
                                    });
                                    dialog.open();
                                });
                            }
                        });
                }
            }else{
                var inf = "Existe Alguna Cantidad Ejecutada que Supera al Ingreso";
                var dialog = new Dialog({
                    title: "Error",
                    type: "Message",
                    state: "Error",
                    content: new Text({
                        text: inf
                    }),
                    beginButton: new Button({
                        text: "Continuar",
                        press: function () {
                            dialog.close();
                        }
                    }),
                    afterClose: function () {
                        dialog.destroy();
                    }
                });
                dialog.open();
                LosPanasDatos = [];
            }
            
        },

        validateFloatInput: function (o) {
            let input = o.getSource();
            let floatLength = 10,
                intLength = 10;
            console.log("entro en la funcion v");
            let value = input.getValue();
            let regex = new RegExp(`/^([0-9]{1,${intLength}})([.][0-9]{0,${floatLength}})?$/`);
            if (regex.test(value)) {
                input.setValueState("None");
                input.setValueStateText("");
                return true;
            } else {
                let pNumber = 0;
                let aux = value
                    .split("")
                    .filter(char => {
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
                    })
                    .join("")
                    .split(".");
                value = aux[0].substring(0, intLength);

                if (aux[1] !== undefined) {
                    value += "." + aux[1].substring(0, floatLength);
                }
                input.setValue(value);
                return false;
            }
        },
       
        validateIntInput: function (o) {
            let input= o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                console.log();
                return true;
            }
            else {
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
                input.setValue(value);
                return false;
            }
        },

        onPressReject: function () {
            this.getView().byId("dayparam1").setValue("");
            this.getView().byId("dayparam2").setValue("");
            this.getView().byId("dayparam3").setValue("");
            this.getView().byId("dayparam4").setValue("");
            this.getView().byId("dayparam5").setValue("");
            this.getView().byId("dayparam6").setValue("");

            this.getModel("mdegresoIngresoAjustes").setProperty("/desde", "");
            this.getModel("mdegresoIngresoAjustes").setProperty("/hasta", "");
            this.getModel("mdegresoIngresoAjustes").setProperty("/desdeEgreso", "");
            this.getModel("mdegresoIngresoAjustes").setProperty("/hastaEgreso", "");
            this.getModel("mdegresoIngresoAjustes").setProperty("/desdeAjuste", "");
            this.getModel("mdegresoIngresoAjustes").setProperty("/hastaAjuste", "");


            this.getModel("mdegresoIngresoAjustes").setProperty("/Ingresos", "");
            this.getModel("mdegresoIngresoAjustes").setProperty("/Egresos", "");
            this.getModel("mdegresoIngresoAjustes").setProperty("/Ajustes", "");
            this.getRouter().navTo("master");
        }

    });
});