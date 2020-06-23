sap.ui.define([
    "annualPostureCurve/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/core/Item",
    "sap/m/IconTabFilter"
], function(BaseController, jQuery, Filter, Fragment, JSONModel, MessageToast, Dialog, Button, Text, item,IconTabFilter) {
    "use strict";
    const breedingStage = 3; /*Clase para Reproductora*/
    return BaseController.extend("annualPostureCurve.controller.Detail", {
        onInit: function() {
            // console.log("mas volumen puede ser")
            this.setFragments();
            this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: async function(oEvent) {
            this.resetProjected();
            this.resetReports();
            this.getView().getModel("posturecurve").setProperty("/executed/enabledTab",false);
            this.getView().byId("tabBar").setSelectedKey("kTabParameter");
            var oArguments = oEvent.getParameter("arguments");
            let mdscenario = this.getModel("mdscenario");
            let activeS = await this.activeScenario();
            mdscenario.setProperty("/scenario_id", activeS.scenario_id);
            mdscenario.setProperty("/name", activeS.name);

            this.index = oArguments.id;

            //   let oView= this.getView();
            //   let ospartnership = this.getModel("ospartnership");
            //   oView.byId("tabBar").setSelectedKey("tabParameter");
            //   oView.byId("idProductsTable").addEventDelegate({
            //     onAfterRendering: oEvent=>{
            //         console.log("victor te amo!")
            //     }
            // })

            // if(ospartnership.getProperty("/records").length>0){
            //     let partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id")
            //     this.onRead(partnership_id);
            // }
            // else{
            //     this.reloadPartnership()
            //     .then(data => {
            //         if(data.length>0){
            //             let obj= ospartnership.getProperty("/selectedRecords/");
            //             if(obj){
            //                 this.onRead(obj.partnership_id);
            //             }
            //             else{
            //                 MessageToast.show("no existen empresas cargadas en el sistema", {
            //                     duration: 3000,
            //                     width: "20%"
            //                 });
            //                 console.log("err: ", data)
            //             }
            //         }
            //         else{
            //             MessageToast.show("ha ocurrido un error al cargar el inventario", {
            //                 duration: 3000,
            //                 width: "35%"
            //             });
            //             console.log("err: ", data)
            //         }
            //     });
            // }

            this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");



            // this.getView().byId("selectBreed").setSelectedItem(new item ());
            // this.getView().byId("selectLot").setSelectedItem(new item ());
            let emp = this.getView().getModel("posturecurve").getProperty("/id_empresa");
            this.onBreedLoad();

            fetch("/eggs_storage/getEggsStorageYears", {
                method: "GET",
            }).then((response) => {
                if (response.status !== 200) {
                    console.log("Looks like there was a problem. Status code: " + response.status);
                    return;
                }

                response.json().then((res)=> {
                    res.data.unshift({"year": "Todos"});
                    this.getView().getModel("posturecurve").setProperty("/years",res.data);
                });
            });

            // this.onRead(this.index);
        },

        resetProjected: function(){

            this.getView().byId("Selectyears").setSelectedItem(new item ());
            this.getView().byId("breedSelect").setSelectedItem(new item ());
            this.getView().byId("selectLoteFatherprojected").setEnabled(false);
            this.getView().byId("selectLoteFatherprojected").setSelectedKey(null);
            this.getView().byId("selectLote").setEnabled(false);
            this.getView().byId("selectLote").setSelectedKey(null);
            this.getView().byId("idProductsTable").removeSelections(true);


        },

        resetReports: function(){

            this.getView().byId("Selectyears2").setSelectedItem(new item ());
            this.getView().byId("selectBreed").setSelectedItem(new item ());
            this.getView().byId("selectLoteFather").setEnabled(false);
            this.getView().byId("selectLoteFather").setSelectedKey(null);
            this.getView().byId("selectLoteChild").setEnabled(false);
            this.getView().byId("selectLoteChild").setSelectedKey(null);
            this.getView().byId("Reporttype").setEnabled(false);
            this.getView().byId("Reporttype").setSelectedKey(null);
            this.getView().byId("reportTables").removeSelections(true);


        },

        onReadChild2: function (oEvent) {
            let breed_id = this.getView().byId("breedSelect").mProperties.selectedKey;
            let year = this.getView().byId("Selectyears").mProperties.selectedKey;
            let lot = this.getView().byId("selectLoteFatherprojected").mProperties.selectedKey;
            let  posturecurve=this.getView().getModel("posturecurve")
            let mdscenario = this.getModel("mdscenario"),
                scenario_id = mdscenario.getProperty("/scenario_id")
            // this.getView().byId("selectLoteChild").setSelectedKey("")
            this.getView().byId("selectLote").setSelectedKey("")
            // this.getView().getModel("posturecurve").setProperty("/weekReport",[])
            console.log("Aquí voy",breed_id, year, lot)
            // this.getView().byId("Reporttype").setSelectedKey("")
            // posturecurve.setProperty("/enabledDiary",false)
            // posturecurve.setProperty("/enabledChild",false)
            this.getView().byId("selectLote").setEnabled(true)
            let mode = [{
                "name" : ""
            }];
            // posturecurve.setProperty("/select",false)
            // posturecurve.setProperty("/mode",mode)

            if (lot == "Todos") {
                lot = "H";
            }

            if (lot === "H") {
                let array = [{
                    lot: "Todos",
                    total: 0
                }];

                console.log(array);
                posturecurve.setProperty("/lot_init", array);
                // posturecurve.setProperty("/enabledChild",true)
                this.getView().byId("selectLote").setSelectedKey("Todos")
                // posturecurve.setProperty("/enabledChild",false)
                // this.onReadFindChild()
            } else {
                fetch("/eggs_storage/findEggsStorageLotsChilds", { 
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                    method: "POST",
                    body: JSON.stringify({"breed_id" : breed_id, "year": year, "lot": lot, 'scenario_id': scenario_id})
                }).then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status code: " + response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            console.log(res);

                            if (res.data.length > 0) {
                                res.data.unshift({
                                    lot: "Todos",
                                    total: 0
                                });

                                posturecurve.setSizeLimit (res.data.length+1);
                                posturecurve.setProperty("/lot_init", res.data);
                                // posturecurve.setProperty("/enabledChild",true)
                                // util.setProperty("/busy/", false);
                            } else {
                            // posturecurve.setProperty("/enabledChild",false)
                                MessageToast.show("No se encontraron lotes hijos asociados")
                            }
                        });
                    }
                ).catch(function(err) {
                    console.error("Fetch error:", err);
                });
            }
            // posturecurve.setProperty("/week", aux);
        },

        reloadPartnership: function(){
            let util = this.getModel("util");
            let ospartnership = this.getModel("ospartnership");

            util.setProperty("/busy/", true);
            ospartnership.setProperty("/records", []);

            let url = util.getProperty("/serviceUrl") +util.getProperty("/" + util.getProperty("/service") + "/getPartnership");
            let method = "GET";
            let data = {};

            return new Promise((resolve, reject) => {
                function getPartnership(res) {
                    util.setProperty("/busy/", false);
                    ospartnership.setProperty("/records/", res.data);
                    if(res.data.length>0){
                        let obj= res.data[0];
                        obj.index= 0;
                        ospartnership.setProperty("/selectedRecords/", obj);
                        ospartnership.setProperty("/name", obj.name);
                        ospartnership.setProperty("/address", obj.address);
                        // console.log("la data en el detail el mio: ",data)
                    }
                    resolve(res.data);
                }

                function error(err) {
                    console.log(err);
                    ospartnership.setProperty("/selectedRecords/", []);
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                    reject(err);
                }

                // Envía la solicitud
                // console.log("antes del send request, this:  ",this, "url:",url, "method: ",method, "data:",data, "getPartnership: ",getPartnership, "error: ",error, error)
                this.sendRequest.call(this, url, method, data, getPartnership, error, error);
            });
        },

        blockinput: function () {
            let aux = this.getView().getModel("posturecurve");
            aux.setProperty("/input", true);

            this.getView().byId("executionSaveBtn").setVisible(true);
            // this.getView().byId("ModifiyBtn").setEnabled(false)
            this.getView().byId("executionSaveBtn").setEnabled(true);
        },

        loadDays: function (oEvent) {
            //eliminado por FROM SAP
            // this.getView().byId("executionSaveBtn").setVisible(true);
            // this.getView().byId("ModifiyBtn").setVisible(true)
            // this.getView().byId("executionSaveBtn").setEnabled(false);
            // this.getView().byId("ModifiyBtn").setEnabled(true)
            let posturecurve=this.getView().getModel("posturecurve");
            let modelo= this.getView().getModel("posturecurve");
            let modeloo = this.getView().getModel("posturecurve");
            console.log(oEvent.getParameters());
            let obj = oEvent.getParameters().listItem.getBindingContext("posturecurve").getObject();
            let lot= oEvent.getParameters().listItem.getBindingContext("posturecurve").getObject().lot;
            console.log(lot);
            let num_week= oEvent.getParameters().listItem.mAggregations.cells[0].mProperties.text;
            let start_date = oEvent.getParameters().listItem.mAggregations.cells[1].mProperties.text;
            let year = posturecurve.getProperty("/theyeartolook");
            let breed = posturecurve.getProperty("/thebreedtolook");
            // console.log({year});
            // console.log({breed});
            let week = start_date.split("/");
            var d=new Date(start_date.split("/").reverse().join("-"));
            var dd=d.getDate()+1;
            var mm=d.getMonth()+1;
            var yy=d.getFullYear();
            var newdate=yy+"/"+mm+"/"+dd;
            var end = new Date(newdate);
            end.setDate(end.getDate() + 6);
            // console.log({start_date});

            if (obj.evictionprojected!==true) {
                let jsonTemp = { "end_date":end,
                    "init_date": start_date,
                    "lot":lot
                };
    
                posturecurve.setProperty("/savingthedate",jsonTemp);
                posturecurve.setProperty("/returnupdate",{
                    breed_id: breed,
                    year:year,
                    lot: lot,
                    num_week: num_week
                });
    
                start_date = start_date.split("/");
                start_date = start_date[2] + "-" + start_date[1] + "-" + start_date[0];

                console.log(lot);

                fetch("/eggs_storage/findEggsStorageDetailByYearWeekBreedLot", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    },
                    body: JSON.stringify({
                        breed_id: breed,
                        year:year,
                        lot: lot,
                        num_week: num_week
    
                    })
                }).then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status code: " + response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            console.log(res.data);
                            res.data.forEach(item =>{

                                // let formatDate= `${(ddate.getDate() < 10 ? '0' : '') + ddate.getDate()}/${((ddate.getMonth() + 1) < 10 ? '0' : '') + (ddate.getMonth() + 1)}/${ddate.getFullYear()}`;
                                let formatDate= item.dia.split("-");
                                // console.log(formatDate);
                                let lol= formatDate[2]+"/"+formatDate[1]+"/"+formatDate[0];
                                posturecurve.setProperty("/formateDate", formatDate);

                                item.available= (item.eggs_executed==null || item.eggs_executed< 0)? true: false;
                                item.dia= lol;
                            });

                            modelo.setProperty("/dayExecuted", res.data);
                            // modelo.setProperty("/dataOld", res.data);
                        });
                    }
                );
    
                let oView = this.getView();
                this.getView().getModel("posturecurve").setProperty("/executed/enabledTab");
                oView.byId("tabBar").setSelectedKey("kTabProjected");

            } else {
                this.onMessageWarningDialogPress()
            }
        },

        formDate:function(date){
            let v = new Date(date);
            // console.log(date)
            if(date){
                var aux= date.split("/");
                var l =  `${aux[2]}-${aux[1]}-${aux[0]}`;
                // aux[0].toString()+"/"+aux[1].toString()+"/"+aux[2].toString()
                // console.log(v)
                v = new Date(l);
            }
            return(v);
        },

        onSelectLot:function(oEvent){
            let lot = oEvent.getParameters(),
                posturecurve=this.getView().getModel("posturecurve");
            posturecurve.setProperty("/input",true);
            // console.log(lot);
            let modelo= this.getView().getModel("posturecurve"),
                that = this;

            // let lote = oEvent.getParameters().selectedItem.mProperties.key;
            // var aux= this.getView().getModel("posturecurve").getProperty("/semanas")
            // var arr=new Array();
            // console.log(aux)
            // aux.forEach(element => {
            //   if(element.lot==lote){
            //     arr.push(element)
            //   }
            // });
            // let week_id=arr[0].week_id;
            // console.log(arr)
            // modelo.setProperty("/lotaux", lote);
            // console.log(this.getView().getModel("posturecurve"))
            let x =  (this.getView().getModel("posturecurve").getProperty("/fechainiciotemporal"));
            var end = new Date(x);
            end.setDate(end.getDate()-1);
            // console.log(x)
            // console.log(this.getView().getModel("posturecurve").getProperty("/fechafintemporal"))
            let y =  (this.getView().getModel("posturecurve").getProperty("/fechafintemporal"));
            // let x="2018-05-15]]T04:30:00.000Z"
            // let y="2018-05-22T04:30:00.000Z"
            let z=this.getView().byId("selecLot").setSelectedItem().mProperties.selectedKey;
            // console.log("hey")
            // console.log(z)
            // console.log(x)
            // console.log(y)

            fetch("/eggs_storage/findEggsStorageByLotAndDate", {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },

                body: JSON.stringify({
                    lot: z,
                    init_date_start:  end,
                    init_date_end: y
                })
            }).then(
                function(response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status code: " + response.status);
                        return;
                    }

                    response.json().then(function(res) {
                        // console.log(res.data);
                        res.data.forEach(item =>{
                            let ddate= new Date(item.init_date);
                            let formatDate= `${(ddate.getDate() < 10 ? "0" : "") + ddate.getDate()}/${((ddate.getMonth() + 1) < 10 ? "0" : "") + (ddate.getMonth() + 1)}/${ddate.getFullYear()}`;
                            posturecurve.setProperty("/formateDate", formatDate);

                            item.formatDate= formatDate;
                        });
                        modelo.setProperty("/dayExecuted", res.data);
                        // modelo.setProperty("/dataOld", res.data);
                    });
                }
            );
        },

        onRead: function (oEvent) {
            let breed_id = this.getView().byId("breedSelect").mProperties.selectedKey;
            let year = this.getView().byId("Selectyears").mProperties.selectedKey;
            let ospartnership = this.getView().getModel("ospartnership");
            let partnership_id = ospartnership.getProperty("/records/" + this.index + "/partnership_id");
            let that = this;
            let scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
            console.log("A;o de filtro", year, scenario_id)
            //no se esta pasando el a;o para el filtro 
            fetch("/eggs_storage/findEggsStorageLotsFather", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ "breed_id": breed_id, "year": year, "partnership_id": partnership_id, scenario_id: scenario_id })
            }).then(
                function (response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status code: " + response.status);
                        return;
                    }

                    response.json().then(function (res) {
                        util.setProperty("/busy/", false);
                        // console.log("yup");
                        let insert = new Array();
                        // console.log(res.data);
                        insert.push("Todos");

                        res.data.forEach(element =>{
                            // console.log(element.lot)
                            // console.log(element.lot)
                            if(element.lot.split("-") [0]!= aux){
                                aux = element.lot.split("-")[0]
                                insert.push(aux);
                            }
                        });

                        console.log("Datos ", res.data);

                        if (res.data.length === 0) {
                            that.getView().byId("selectLoteFatherprojected").setEnabled(false);
                            that.getView().byId("selectLote").setEnabled(false);
                            that.getView().byId("selectLote").setSelectedKey("");
                            MessageToast.show("No se encontraron lotes asociados");
                        } else {
                            that.getView().byId("selectLoteFatherprojected").setEnabled(true);
                        }
                        // console.log(insert.length);
                        // console.log(insert);
                        posturecurve.setSizeLimit(insert.length + 1);
                        posturecurve.setProperty("/dad_lot", insert);
                        // that.getView().byId("selectLoteFatherprojected").setEnabled(true)
                        // console.log(posturecurve.getProperty("/lot_init"))
                        // console.log(posturecurve.getProperty("/lot_init"))
                        // length
                    });
                }
            ).catch(function (err) {
                console.error("Fetch error:", err);
            });

            let el = oEvent.getParameters().selectedItem.mProperties.key,
                ep_id = this.getView().getModel("posturecurve").getProperty("/id_empresa"),
                util = this.getModel("util"),
                posturecurve = this.getView().getModel("posturecurve"),
                serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/lotPostureCurve");
            // console.log(this.getView().getModel("posturecurve"));
            this.getView().getModel("posturecurve").setProperty("/idBreed_report", breed_id);
            this.getView().getModel("posturecurve").setProperty("/idEmp_report", ep_id);
            // console.log("que"+serviceUrl)




            // console.log(el)
            // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/lotPostureCurve");
            util.setProperty("/busy/", true);
            // console.log("Llegue");
            // console.log("breed_id: ", breed_id);
            let aux = this.getView().getModel("posturecurve").getProperty("/week");
            let params = {
                year: year
            };

            // posturecurve.setProperty("/week", aux);
        },

        onRead2: function (oEvent) {
            let breed_id = this.getView().byId("breedSelect").mProperties.selectedKey;
            let year = this.getView().byId("Selectyears").mProperties.selectedKey;
            fetch("/eggs_storage/findEggsStorageLots", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({"breed_id" : breed_id})
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            util.setProperty("/busy/", false);
                            // console.log("yup");
                            let insert = new Array();
                            // console.log(res.data);
                            insert.push("Todos");

                            res.data.forEach(element =>{
                                // console.log(element.lot)
                                insert.push(element.lot);
                            });
                            //  console.log(insert.length);
                            //   console.log(insert);
                            posturecurve.setSizeLimit (insert.length+1);
                            posturecurve.setProperty("/lot_init", insert);
                            // console.log(posturecurve.getProperty("/lot_init"))

                            // console.log(posturecurve.getProperty("/lot_init"))
                            // length
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error: ", err);
                });


            let el = oEvent.getParameters().selectedItem.mProperties.key,
                ep_id = this.getView().getModel("posturecurve").getProperty("/id_empresa"),
                util = this.getModel("util"),
                that=this,
                posturecurve = this.getView().getModel("posturecurve"),
                serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/lotPostureCurve");
            // console.log(this.getView().getModel("posturecurve"));
            this.getView().getModel("posturecurve").setProperty("/idBreed_report",el);
            this.getView().getModel("posturecurve").setProperty("/idEmp_report",ep_id);
            // console.log("que"+serviceUrl)




            // console.log(el)
            // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/lotPostureCurve");
            util.setProperty("/busy/", true);
            // console.log("Llegue");
            // console.log("breed_id: ", breed_id);
            let aux= this.getView().getModel("posturecurve").getProperty("/week");
            let params = {
                year: year
            };

            // posturecurve.setProperty("/week", aux);
        },

        onReadChild: function (oEvent) {
            let breed_id = this.getView().byId("selectBreed").mProperties.selectedKey;
            let year = this.getView().byId("Selectyears2").mProperties.selectedKey;
            let lot = this.getView().byId("selectLoteFather").mProperties.selectedKey;
            let util = this.getModel("util")
            let  posturecurve=this.getView().getModel("posturecurve")
            //this.getView().byId("selectLoteChild").setSelectedKey("")
            this.getView().byId("selectLoteChild").setSelectedKey("")
            this.getView().getModel("posturecurve").setProperty("/weekReport",[])
           console.log("Aquí voy",breed_id, year, lot)
             this.getView().byId("Reporttype").setSelectedKey("")

                posturecurve.setProperty("/enabledDiary",false)
               posturecurve.setProperty("/enabledChild",false)

           let   mode = [
              {
                "name" : ""
              }
             ]
              posturecurve.setProperty("/select",false)
             posturecurve.setProperty("/mode",mode)

           if(lot == "Todos")
           {
               lot = 'H'
           }
           if(lot == "H")
           {
               let array = [{
                lot: "Todos",
                total: 0
            }]
            posturecurve.setProperty("/lot_initChild", array);
            posturecurve.setProperty("/enabledChild",true)
            this.getView().byId("selectLoteChild").setSelectedKey("Todos")
            posturecurve.setProperty("/enabledChild",false)
            this.onReadFindChild()
           }
           else{

           
            fetch("/eggs_storage/findEggsStorageLotsChilds", {
                headers: {"Content-type": "application/json; charset=UTF-8"},
                method: "POST",
                body: JSON.stringify({"breed_id" : breed_id, "year": year, "lot": lot
            })
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                response.status);
                            return;
                        }

                        response.json().then(function(res) {


                            if(res.data.length > 0){
                              res.data.unshift({
                                  lot: "Todos",
                                  total: 0
                              });

                              posturecurve.setSizeLimit (res.data.length+1);
                              posturecurve.setProperty("/lot_initChild", res.data);
                              posturecurve.setProperty("/enabledChild",true)
                                util.setProperty("/busy/", false);
                            }else {
                               posturecurve.setProperty("/enabledChild",false)
                               MessageToast.show("No se encontraron lotes hijos asociados")
                            }

                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error: ", err);
                });
            }


            // posturecurve.setProperty("/week", aux);
        },
        onReadFindChild : function(){
          let posturecurve = this.getModel("posturecurve")
          let lotC = this.getView().byId("selectLoteChild").mProperties.selectedKey
          posturecurve.setProperty("/weekReport",[])
          this.getView().byId("Reporttype").setSelectedKey("")
              posturecurve.setProperty("/select",false)
              let arr = new Array()
              arr = this.getView().byId("selectLoteChild").mProperties.selectedKey


            if(lotC!== 'Todos'){
              let opts3 = [{
                "name" : "Diario"
              }]

              posturecurve.setProperty("/mode",opts3)
              posturecurve.setProperty("/enabledDiary", true)
                this.getView().byId("Reporttype").setSelectedKey("")
               posturecurve.setProperty("/select",true)
            }else{
              let   mode = [
                 {
                   "name" : "Diario"
                 },
                 {
                   "name" : "Semanal"
                 }
                ]
                posturecurve.setProperty("/mode",mode)

                 posturecurve.setProperty("/select",false)
                   this.getView().byId("Reporttype").setSelectedKey("")
                     posturecurve.setProperty("/enabledDiary", true)
            }




        },
        onReadRe: function (oEvent) {
            let breed_id = this.getView().byId("selectBreed").mProperties.selectedKey,
                year = this.getView().byId("Selectyears2").mProperties.selectedKey,
                posturecurve = this.getView().getModel("posturecurve");
                let partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");


                this.getView().byId("selectLoteFather").setSelectedKey("")
                this.getView().byId("selectLoteChild").setSelectedKey("")
                this.getView().byId("Reporttype").setSelectedKey("")
                this.getView().getModel("posturecurve").setProperty("/weekReport",[])
            // console.log(breed_id, year)

            posturecurve.setProperty("/lot_init2",[])
            posturecurve.setProperty("/lot_initChild",[])
            posturecurve.setProperty("/enabledChild",false)


            let   mode = [
               {
                 "name" : ""
               }
              ]
              posturecurve.setProperty("/mode",mode)
              posturecurve.setProperty("/enabledDiary",false)
            fetch("/eggs_storage/findEggsStorageLots", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({"breed_id" : breed_id, "partnership_id": partnership_id, "year":year})
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            // console.log("yup");
                            let insert = new Array();
                            // console.log(res.data);
                            if(res.data.length > 0){
                              insert.push("Todos");
                              let aux = ""
                            res.data.forEach(element =>{
                                // console.log(element.lot)


                                  // console.log(element.lot)
                                  if(element.lot.split("-") [0]!= aux){
                                      aux = element.lot.split("-")[0]
                                    insert.push(aux);

                                  }

                            posturecurve.setProperty("/enabledFather",true)
                                //insert.push(element.lot);

                            });
                          }else {
                            MessageToast.show("No se encontraron lotes asociados")

                           posturecurve.setProperty("/enabledChild",false)


                              posturecurve.setProperty("/enabledFather",false)
                          }
                            //  console.log(insert.length);
                            //   console.log(insert);
                            posturecurve.setSizeLimit (insert.length+1);

                            posturecurve.setProperty("/lot_init2", insert)

                            // console.log(posturecurve.getProperty("/lot_init"))

                            // console.log(posturecurve.getProperty("/lot_init"))
                            // length
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error: ", err);
                });
            // posturecurve.setProperty("/week", aux);
        },




        onRead2: function () {   //Esta funci�n la vamos a llevar completa a reproductora
            // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            let posturecurve = this.getView().getModel("posturecurve"),
                util = this.getModel("util"),
                year = "2018",
                partnership_id=this.getView().getModel("posturecurve").getProperty("/id_empresa"),
                that=this,
                //serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/lotPostureCurve");
                serviceUrl =  "/posturecurveWeekly/findAllPostureCurveByPartnershipAndBreed";
            // console.log(serviceUrl);
            util.setProperty("/busy/", true);
            // console.log("Llegue");
            let breed_id = this.getView().byId("breedSelect").mProperties.selectedKey;
            // console.log("breed_id: ", breed_id);
            let params = {
                year: year
            };

            fetch(serviceUrl, {
                method: "POST",
                body: "year="+year+"&breed_id="+breed_id+"&partnership_id="+partnership_id,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                }
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                            response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            util.setProperty("/busy/", false);
                            // console.log(res.data);
                            //guardar res.data en la tabla posturecurve_weekly
                            /* guardamos cantidad proyectada para cada semana
                              guardar numero sem, raza, total eject:0, lote, idparnetship */
                            posturecurve.setProperty("/weekExecuted", res.data);
                            // console.log(posturecurve.getProperty("/weekExecuted"));
                            // let j ={
                            //         "records":res.data,
                            //         "breed_id": breed_id,
                            //         "partnership_id":partnership_id
                            //       }
                            //       $.ajax({
                            //         type: "POST",
                            //         contentType: "application/json",
                            //         url: "/posturecurveWeekly",
                            //         dataType: "json",
                            //         data: JSON.stringify(j),
                            //         async: false,
                            //         success: function (data) {
                            //             oModel = new JSONModel(data.data);
                            //             stats = data.stats;
                            //         },
                            //         error: function (request) {
                            //             var msg = request.statusText;
                            //             that.onToast('Error: ' + 'El escenario no tiene datos cargados');
                            //             console.log("Read failed: ", request);
                            //         }
                            //     });
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error: ", err);
                });

        },




        // handleLinkPress: function(oEvent){
        //     var groupDetailsDlg = sap.ui.xmlfragment("annualPostureCurve.view.postureCurve.PostureCurveTable2", this);
        //     this.getView().addDependent(this.groupDetailsDlg);

        //     console.log("se prendio la que no se apaga");
        //     var posturecurve = this.getView().getModel("posturecurve");
        //     posturecurve.setProperty("/selectedRecordDialog", JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("posturecurve").getObject())));

        //     console.log(posturecurve.getProperty("/selectedRecordDialog"));
        //     //console.log(oEvent.getSource().getBindingContext("osfarm").getObject());
        //     let selectObject = oEvent.getSource().getBindingContext("posturecurve").getObject();
        //   console.log(selectObject);
        //     let lot=selectObject.lot;
        //     let eggs=selectObject.eggs;
        //     let eggsForDay=parseInt(eggs/7,10);


        //     let report = new Array();
        //     for (let i = 1; i <=7 ; i++) {
        //         report.push({
        //           "day":i,
        //           "lot":lot,
        //           "eggsForDay":eggsForDay
        //         })
        //       }

        //       posturecurve.setProperty("/datapopover", selectObject);
        //       posturecurve.refresh(true);

        //       console.log(this.getView().getModel("posturecurve").getProperty("/datapopover"));


        //       groupDetailsDlg.openBy(oEvent.getSource());

        //   },


        // onRead: async function(index) {
        //   console.log("mas volumen puede ser3")
        //   let ospartnership = this.getModel("ospartnership"),
        //       mdscenario = this.getModel("mdscenario"),
        //       oView = this.getView();

        //   oView.byId("tabBar").setSelectedKey("kTabParameter")

        //   let activeS = await this.activeScenario();
        //   mdscenario.setProperty("/scenario_id", activeS.scenario_id);
        //   mdscenario.setProperty("/name", activeS.name);

        //   ospartnership.setProperty("/selectedRecordPath/", "/records/" + index);
        //   ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));

        //   // let isBreedLoad = await this.onBreedLoad();


        //   let util = this.getModel("util"),
        //     that = this,
        //     mdprojected = this.getModel("mdprojected"),
        //     mdprogrammed = this.getModel("mdprogrammed");
        //      console.log("mdprojected");
        //     console.log(mdprojected);
        //      console.log(mdprogrammed);
        //      console.log("asddddddddddddddddddddddddddddddddddddddddddddddddddd")


        //   // ospartnership.setProperty("/selectedPartnership/partnership_index", index);

        //   //  let process_info = await this.processInfo(),
        //   //     mdprocess = this.getModel("mdprocess");
        //   //     console.log(process_info.data);
        //   //     //console.log("process_info ",process_info.data[0].theoretical_duration);
        //   //     mdprocess.setProperty("/records", process_info.data);
        //   //     //mdprocess.setProperty("/duration", process_info.data[0].theoretical_duration );
        //   //     //mdprocess.setProperty("/decrease", process_info.data[0].theoretical_decrease );



        //   // let findScenario = await this.findProjected();
        //   // mdprojected.setProperty("/records", findScenario.data);
        //   // that.hideButtons(false, false,false, false);
        //   // this.onFarmLoad();
        //   // let isIncubatorPlant = await this.onIncubatorPlant(),
        //   //     mdincubatorplant = this.getModel("mdincubatorplant");

        //   // mdincubatorplant.setProperty("/records", isIncubatorPlant.data);
        //   // if(isIncubatorPlant.data.length>0){
        //   //   mdincubatorplant.setProperty("/selectedKey", isIncubatorPlant.data[0].incubator_plant_id);
        //   // }





        // },

        // validateIntInput: function (oEvent) {
        //     let input = oEvent.getSource();
        //     let length = 10;
        //     let value = input.getValue();
        //     let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

        //     if (regex.test(value)) {
        //         return true;
        //     } else {
        //         var aux = value.split("").filter(char => {
        //             if (/^[0-9]$/.test(char)) {
        //                 if (char !== ".") {
        //                     return true;
        //                 }
        //             }
        //         }).join("");

        //         value = aux.substring(0, length);
        //         input.setValue(value);

        //         return false;
        //     }
        // },

        reports: function() {
            var mdreports = this.getModel("mdreports");
            // console.log("presione el boton de reportes");
            let date1 = this.getView().byId("sd").mProperties.value,
                date2 = this.getView().byId("sd2").mProperties.value,
                breed_id = this.getView().byId("breedSelect").getSelectedKey();

            let aDate = date1.split("-"),
                init_date = `${aDate[0]}/${aDate[1]}/${aDate[2]}`;

            let aDate2 = date2.split("-"),
                end_date = `${aDate2[0]}/${aDate2[1]}/${aDate2[2]}`;

            // console.log("las fechas");
            // console.log(date1);
            // console.log(date2);
            // console.log(breed_id);
            // console.log("EL MODELO CON FECHAS");
            // console.log(mdreports)
            let serverName = "/reports/breeding";

            fetch(serverName, {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    date1: date1,
                    date2: date2,
                    breed_id: breed_id
                })
            }).then(
                function(response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status code: " + response.status);
                        return;
                    }

                    response.json().then(function(res) {
                        // console.log("la respuesta despues de reportes")
                        // console.log(res);
                        mdreports.setProperty("/records", res.data);
                        // console.log("la longitud")
                        // console.log(res.data.length)
                        if (res.data.length > 0) {
                            mdreports.setProperty("/reportsBtn", true);
                            mdreports.setProperty("/desde", init_date);
                            mdreports.setProperty("/hasta", end_date);
                            mdreports.setProperty("/visible", true);
                        } else {
                            mdreports.setProperty("/reportsBtn", false);
                            mdreports.setProperty("/visible", false);
                        }
                        resolve(res);
                    });
                }
            ).catch(function(err) {
                console.error("Fetch error:", err);
            });
        },

        generatedCSV: function() {
            var mdreports = this.getModel("posturecurve").getProperty("/weekReport");
            // console.log(mdreports)
            this.arrayObjToCsv(mdreports);
            // this.arrayObjToCsv();
        },

        arrayObjToCsv: function (ar) {
        //comprobamos compatibilidad
            if(window.Blob && (window.URL || window.webkitURL)){
                var contenido = "",
                    d = new Date(),
                    blob,
                    reader,
                    save,
                    clicEvent;
                //creamos contenido del archivo
                var array = ["Fecha", "Lote", "Huevos Proyectados", "Huevos Ejecutados", "Proporcion (%)"];
                // console.log(array)
                // console.log("EL ARRAY")
                // console.log(ar)

                // {
                //   "formatDate": ar[0].formatDate,
                //   "lot": ar[0].lot,
                //   "projected": ar[0].projected,
                //   "executed": ar[0].executed,
                //   "percen": ar[0].percen
                // }



                for (var i = 0; i < ar.length; i++) {
                    let aja = new Array();

                    aja[i] = {
                        "formatDate": ar[i].formatDate,
                        "lot": ar[i].lot,
                        "projected": ar[i].projected,
                        "executed": ar[i].executed,
                        "percen": ar[i].percen
                    };


                    // console.log("se supone que las cabeceras")
                    // console.log(Object.keys(aja[i]))
                    //construimos cabecera del csv
                    if (i == 0)
                        contenido += array.join(";") + "\n";
                    //resto del contenido
                    contenido += Object.keys(aja[i]).map(function(key){
                        return aja[i][key];
                    }).join(";") + "\n";
                }
                // console.log(contenido)
                //creamos el blob
                blob =  new Blob(["\ufeff", contenido], {type: "text/csv"});
                //creamos el reader
                var reader = new FileReader();
                reader.onload = function (event) {
                //escuchamos su evento load y creamos un enlace en dom
                    save = document.createElement("a");
                    save.href = event.target.result;
                    save.target = "_blank";
                    //aqu� le damos nombre al archivo

                    save.download = "salida.csv";


                    try {
                    //creamos un evento click
                        clicEvent = new MouseEvent("click", {
                            "view": window,
                            "bubbles": true,
                            "cancelable": true
                        });
                    } catch (e) {
                    //si llega aqu� es que probablemente implemente la forma antigua de crear un enlace
                        clicEvent = document.createEvent("MouseEvent");
                        clicEvent.initEvent("click", true, true);
                    }
                    //disparamos el evento
                    save.dispatchEvent(clicEvent);
                    //liberamos el objeto window.URL
                    (window.URL || window.webkitURL).revokeObjectURL(save.href);
                };
                //leemos como url
                reader.readAsDataURL(blob);
            }else {
            //el navegador no admite esta opci�n
                alert("Su navegador no permite esta acci�n");
            }
        },
        selRazaReport: function(oEvent){
            let posturecurve = this.getModel("posturecurve");
            let breed_id = this.getView().byId("selectBreed").mProperties.selectedKey;
            fetch("/eggs_storage/findEggsStorageLots", {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({"breed_id" : breed_id})
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                response.status);
                            return;
                        }
                        response.json().then(function(res) {
                            res.data.unshift({"lot": "Todos"});
                            posturecurve.setSizeLimit (res.data.length+1);
                            // console.log(posturecurve.getProperty("/lot_rep"))
                            posturecurve.setProperty("/lot_rep", res.data.map(elem => elem.lot));
                        });
                    }
                )
                .catch(function(err) {
                    console.log("Fetch Error: ", err);
                });
            this.getView().byId("selectLot").setSelectedItem(new item());

        },
        onMessageWarningDialogPress: function () {
			var dialog = new Dialog({
				title: 'Desalojado',
				type: 'Message',
				state: 'Warning',
				content: new Text({
					text: 'La proyección proviene de una programación que ya fue desalojada'
				}),
				beginButton: new Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},
        LoadingDays: function(oEvent){

            let breed_id = this.getView().byId("breedSelect").mProperties.selectedKey;
            let year = this.getView().byId("Selectyears").mProperties.selectedKey;
            let lot = this.getView().byId("selectLote").mProperties.selectedKey;
            this.getView().byId("idProductsTable").removeSelections();
            this.getModel("posturecurve").setProperty("/dayExecuted","");
            let ospartnership = this.getView().getModel("ospartnership");
            let partnership_id = ospartnership.getProperty("/records/" + this.index + "/partnership_id"); 
            let scenario_id = this.getModel("mdscenario").getProperty("/scenario_id")
            let parent_lot = this.getView().byId("selectLoteFatherprojected").mProperties.selectedKey;console.log("Partnership:::: ", partnership_id, ospartnership, scenario_id)
            console.log("Partnership:::: ", lot, year,breed_id)
            console.log(lot)
            console.log(breed_id)
            if(!breed_id || !lot || !year){
                MessageToast.show("Complete todos los parámetros de búsqueda")
            }
            // console.log(oTreeTable)
            // oTreeTable.removeSelections(true)
            let posturecurve=this.getModel("posturecurve");
            let yearr = this.getView().byId("Selectyears").mProperties.selectedKey;
            posturecurve.setProperty("/theyeartolook",yearr);
            let breedd = this.getView().byId("breedSelect").mProperties.selectedKey;
            posturecurve.setProperty("/thebreedtolook",breedd);
            if (lot=="Todos"){


                posturecurve.setProperty("/table","None");
                posturecurve.setProperty("/egglots","");
                posturecurve.setProperty("/proportion","");
                posturecurve.setProperty("/enabledLinkdate",false);
                posturecurve.setProperty("/weekenabled",true);
                posturecurve.setProperty("/enabledLink",true);
                posturecurve.setProperty("/lookenabled",false);
                fetch("/eggs_storage/findAllEggsStorageView", {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({"breed_id" : breed_id,
                    "year" : year, "partnership_id":partnership_id, "scenario_id": scenario_id,
                    "parent_lot": parent_lot})
                })
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                        response.status);
                                return;
                            }

                            response.json().then(function(res) {
                                let info= JSON.parse(JSON.stringify(res.data));
                                posturecurve.setProperty("/daysInf",info);

                                res.data.forEach(element =>{
                                    let ddate= new Date(element.week);
                                    // let formatDate= `${(ddate.getDate() < 10 ? '0' : '') + ddate.getDate()}/${((ddate.getMonth() + 1) < 10 ? '0' : '') + (ddate.getMonth() + 1)}/${ddate.getFullYear()}`;
                                    var jaj = new Array();
                                    jaj = element.week.split("-");
                                    jaj[2] = jaj[2][0] + jaj[2][1];
                                    //let formatDate= `${(ddate.getDate() < 10 ? '0' : '') + ddate.getDate()}/${((ddate.getMonth() + 1) < 10 ? '0' : '') + (ddate.getMonth() + 1)}/${ddate.getFullYear()}`;
                                    let formatDate = jaj[2] + "/" + jaj[1] + "/" + jaj[0];
                                    posturecurve.setProperty("/formateDate", formatDate);

                                    element.week= formatDate;
                                    element.lot = "Ver";
                                    element.eggs=parseInt(element.eggs);
                                });
                                console.log(res.data)
                                posturecurve.setProperty("/week", res.data);

                            });
                        }
                    )
                    .catch(function(err) {
                        console.log("Fetch Error: ", err);
                    });}
            else{
                console.log("---------------------------------------")
                let lot_id = this.getView().byId("selectLote").getSelectedKey(),
                    breed_id = this.getView().getModel("posturecurve").getProperty("/idBreed_report"),
                    posturecurve = this.getView().getModel("posturecurve"),
                    week = this.getView().getModel("posturecurve").getProperty("/week"),
                    that = this;
                posturecurve.setProperty("/enabledLinkdate",true);
                posturecurve.setProperty("/enabledemphasizedate",false);
                posturecurve.setProperty("/enabledLink",false);
                posturecurve.setProperty("/enabledemphasize",true);
                posturecurve.setProperty("/lookenabled",true);
                posturecurve.setProperty("/weekenabled",false);

                posturecurve.setProperty("/egglots","Huevos Por Lote");
                posturecurve.setProperty("/proportion","Proporción (%)");
                posturecurve.setProperty("/table","SingleSelect");
                console.log({
                    breed_id: breed_id,
                    lot: lot_id,
                    year: year, 
                    partnership_id: partnership_id,
                    scenario_id: scenario_id,
                    parent_lot: parent_lot
                })
                fetch("/eggs_storage/findEggsStorageByYearBreedLot", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        breed_id: breed_id,
                        lot: lot_id,
                        year: year, 
                        partnership_id: partnership_id,
                        scenario_id: scenario_id,
                        parent_lot: parent_lot
                    })


                })
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                                return;
                            }
                            let nMod = new Array();
                            response.json().then(function(res) {
                                let i = 0;
                                let x;
                                console.log(res.data)

                                res.data.forEach(element => {
                                    if(element.eggs_executed==null){
                                        x=0;
                                    }else{
                                        x=element.eggs_executed;
                                    }
                                    var jaj = new Array();
                                    jaj = element.week.split("-");
                                    jaj[2] = jaj[2][0] + jaj[2][1];
                                    element.breed=breed_id;

                                    let ddate= new Date(element.week);
                                    //let formatDate= `${(ddate.getDate() < 10 ? '0' : '') + ddate.getDate()}/${((ddate.getMonth() + 1) < 10 ? '0' : '') + (ddate.getMonth() + 1)}/${ddate.getFullYear()}`;
                                    let formatDate = jaj[2] + "/" + jaj[1] + "/" + jaj[0];
                                    posturecurve.setProperty("/formateDate", formatDate);

                                    element.formatDate = formatDate;

                                    console.log((100*element.lot_eggs)/element.week_eggs, element.week_eggs, element.lot_eggs)
                                    let float = {
                                        week: element.formatDate,
                                        lot: lot,
                                        projected: element.eggs,
                                        eggs:element.week_eggs,
                                        executed: x,
                                        num_week: element.num_week,
                                        lot_eggs: parseInt(element.lot_eggs),
                                        percen: ((100*parseInt(element.lot_eggs))/(parseInt(element.week_eggs)!==0?parseInt(element.week_eggs):1)).toFixed(2),
                                        breed:element.breed,
                                        evictionprojected: element.evictionprojected

                                    };
                                    nMod.push(float);
                                    i++;
                                });
                                that.getView().getModel("posturecurve").setProperty("/week",nMod);

                            });
                        }
                    );
            }

        },
        findLot: function(selectF,selectC){
          let lot = new Array();

          if(selectF == "Todos" && selectC=="Todos"){
            lot = "Todos"
            console.log("Todos todos")
          }else
              if(selectF == "Todos" && selectC !=="Todos"){
                console.log("Todos SelectC 1", selectC)
                lot.push(selectC)
                lot =  selectC
          }else
              if(selectF !== "Todos" && selectC =="Todos"){

                lot.push(selectF)

                lot = selectF.split("-")[0] + "-"
                console.log("Todos SelectC 2", lot)
          }else
              if(selectF !== "Todos" && selectC !=="Todos"){
              console.log("SelectF SelectC", selectC)
                lot = selectC
          }
          return lot
        },
        converter_breed : function(breed){
          if(breed == 'Cobb'){
            breed = 1
          }else if(breed == 'H'){
            breed = 2
          }else
               if(breed == 'Ross'){
            breed = 3
          }else
               if(breed == 'Plexus'){
                 breed = 4
          }
          return breed;
        }
        ,
        selLotReport: function(oEvent){
            let ReportType = this.getView().byId("Reporttype").mProperties.selectedKey,
                util = this.getView().getModel("util");
                let lotF = this.getView().byId("selectLoteFather").mProperties.selectedKey;
                let lotC = this.getView().byId("selectLoteChild").mProperties.selectedKey
                this.getView().byId("idProductsTable").removeSelections();
                let posturecurve = this.getModel("posturecurve");
                let partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
                let scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");


              let  breed_id = this.getView().byId("selectBreed").mProperties.selectedKey
                let lot_id = this.findLot(lotF,lotC)
              let year = this.getView().byId("Selectyears2").mProperties.selectedKey
                      console.log("Casos posibles ", lot_id)
                      let that = this
            // console.log(ReportType)
            this.getView().getModel("posturecurve").setProperty("/weekReport",[])
              posturecurve.setProperty("/select",false)
            util.setProperty("/busy",true);

            if (ReportType == "Diario"){
              let lotF = this.getView().byId("selectLoteFather").mProperties.selectedKey;
              let lotC = this.getView().byId("selectLoteChild").mProperties.selectedKey
              this.getView().byId("idProductsTable").removeSelections();
              let route = ""
//caso  listo


                    breed_id = this.converter_breed(breed_id)
                    console.log("breed_id")
                    let lot_id = this.findLot(lotF,lotC)

                    console.log("Lote asignado ", lot_id)
                    if(lot_id == 'Todos'){
                      route = "/eggs_storage/findEggsStorageDataReport"
                    }else {
                        route = "/eggs_storage/findEggsStorageDataReportNew"
                    }
                    if(lotF !== "" && lotC!==""){
                fetch(route, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        breed_id: breed_id,
                        lot: lot_id,
                        year: year,
                        parent_lot: lotF,
                        scenario_id: scenario_id
                    })


                })
                    .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                                return;
                            }
                            let nMod = new Array();
                            response.json().then(function(res) {
                                console.log(res.data)
                                if(res.data.length > 0){
                                  that.getView().getModel("posturecurve").setProperty("/weekReport",res.nMod);
                                  that.getView().byId("exportBtn").setEnabled(true);
                                }else {
                                  MessageToast.show("No se encontraron lotes asociados")
                                }


                            });
                        }
                    );
                  }
                  else {
                    MessageToast.show("Seleccione lotes a consultar")
                  }
                  }
            else if (ReportType == "Semanal"){

                let breed_id = this.getView().byId("selectBreed").mProperties.selectedKey;

                let lotF = this.getView().byId("selectLoteFather").mProperties.selectedKey;
                let lotC = this.getView().byId("selectLoteChild").mProperties.selectedKey
                this.getView().byId("idProductsTable").removeSelections();
                let year = this.getView().byId("Selectyears2").mProperties.selectedKey;
                let lot_id = this.findLot(lotF,lotC)
                this.getView().byId("idProductsTable").removeSelections();
                breed_id = this.converter_breed(breed_id)

                // console.log(oTreeTable)
                // oTreeTable.removeSelections(true)

                let posturecurve=this.getModel("posturecurve");
                let yearr = this.getView().byId("Selectyears2").mProperties.selectedKey;
                let breedd = this.getView().byId("selectBreed").mProperties.selectedKey;


                if (lot_id=="Todos"){

                    fetch("/eggs_storage/findAllEggsStorageView", {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        method: "POST",
                        body: JSON.stringify({"breed_id" : breed_id,
                            "year" : year, "scenario_id": scenario_id, "partnership_id": partnership_id, parent_lot: lotF})
                    })
                        .then(
                            function(response) {
                                if (response.status !== 200) {
                                    console.log("Looks like there was a problem. Status Code: " +
                        response.status);
                                    return;
                                }

                                response.json().then(function(res) {
                                    // console.log(res.data)
                                    let info= JSON.parse(JSON.stringify(res.data));
                                    posturecurve.setProperty("/daysInf",info);
                                    res.data.forEach(element =>{
                                        let ddate= new Date(element.week);
                                        // let formatDate= `${(ddate.getDate() < 10 ? '0' : '') + ddate.getDate()}/${((ddate.getMonth() + 1) < 10 ? '0' : '') + (ddate.getMonth() + 1)}/${ddate.getFullYear()}`;
                                        var jaj = new Array();
                                        jaj = element.week.split("-");
                                        jaj[2] = jaj[2][0] + jaj[2][1];
                                        //let formatDate= `${(ddate.getDate() < 10 ? '0' : '') + ddate.getDate()}/${((ddate.getMonth() + 1) < 10 ? '0' : '') + (ddate.getMonth() + 1)}/${ddate.getFullYear()}`;
                                        let formatDate = jaj[2] + "/" + jaj[1] + "/" + jaj[0];
                                        posturecurve.setProperty("/formateDate", formatDate);
                                        console.log((100* element.eggs_executed)/ element.lot_eggs, element.eggs_executed, element.lot_eggs)
                                        element.formatDate= formatDate;
                                        element.projected=element.eggs;
                                        element.executed=element.eggs_executed;
                                        element.percen= ((100* element.eggs_executed)/ element.projected).toFixed(2);

                                        element.lot="Todos";
                                        element.eggs=parseInt(element.eggs);
                                    });
                                    posturecurve.setProperty("/weekReport", res.data);

                                });
                            }
                        )
                        .catch(function(err) {
                            console.log("Fetch Error: ", err);
                        });}
                else
                    if(lotC ==  'Todos' && lotF !=='Todos'){



                    let breed_id = this.getView().byId("selectBreed").mProperties.selectedKey;
                    let lotF = this.getView().byId("selectLoteFather").mProperties.selectedKey;
                    let lotC = this.getView().byId("selectLoteChild").mProperties.selectedKey
                    this.getView().byId("idProductsTable").removeSelections();

                    let lot_id = this.findLot(lotF,lotC)
                        posturecurve = this.getView().getModel("posturecurve"),


                        breed_id = this.converter_breed(breed_id)
                    // posturecurve.setProperty("/egglots","Huevos Por Lote");
                    // posturecurve.setProperty("/proportion","Proporción (%)");
                    // posturecurve.setProperty("/table","SingleSelect");
                    console.log("Hijos")
                    fetch("/eggs_storage/findEggsStorageByYearBreedLotAllChilds", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            breed_id: breed_id,
                            lot: lot_id,
                            year: year,
                            scenario_id: scenario_id,
                            partnership_id: partnership_id
                        })


                    })
                        .then(
                            function(response) {
                                if (response.status !== 200) {
                                    console.log("Looks like there was a problem. Status Code: " +
                  response.status);
                                    return;
                                }
                                let nMod = new Array();
                                response.json().then(function(res) {
                                    let i = 0;
                                    let x;
                                    // console.log(res.data)

                                    res.data.forEach(element => {
                                        if(element.eggs_executed==null){
                                            x=0;
                                        }else{
                                            x=element.eggs_executed;
                                        }
                                        var jaj = new Array();
                                        jaj = element.week.split("-");
                                        jaj[2] = jaj[2][0] + jaj[2][1];
                                        element.breed=breed_id;

                                        let ddate= new Date(element.week);
                                        //let formatDate= `${(ddate.getDate() < 10 ? '0' : '') + ddate.getDate()}/${((ddate.getMonth() + 1) < 10 ? '0' : '') + (ddate.getMonth() + 1)}/${ddate.getFullYear()}`;
                                        let formatDate = jaj[2] + "/" + jaj[1] + "/" + jaj[0];
                                        posturecurve.setProperty("/formateDate", formatDate);

                                        element.formatDate = formatDate;
console.log((100* element.eggs_executed)/ element.lot_eggs, element.eggs_executed, element.lot_eggs)
                                        let float = {
                                            formatDate: element.formatDate,
                                            lot: element.lot,
                                            projected: element.eggs,
                                            eggs:element.week_eggs,
                                            executed: x,
                                            num_week: element.num_week,
                                            projected: parseInt(element.lot_eggs),
                                            percen:((100* parseInt(element.eggs_executed))/ (parseInt(element.lot_eggs)!==0?parseInt(element.lot_eggs):1)).toFixed(2),
                                            breed:element.breed

                                        };
                                        nMod.push(float);
                                        i++;
                                    });
                                    that.getView().getModel("posturecurve").setProperty("/weekReport",nMod);

                                });
                            }
                        );
                } else {
                    this.getView().byId("selectBreed").setSelectedKey("")
                    this.getView().byId("selectLoteFather").setSelectedKey("")
                    this.getView().byId("selectLoteChild").setSelectedKey("")
                    this.getView().getModel("posturecurve").setProperty("/weekReport",[])
                    this.getView().byId("Reporttype").setSelectedKey("")
                    MessageToast.show("No se pueden obtener reportes semanales")
                }
            } else {
                let empty = new Array();
                this.getView().getModel("posturecurve").setProperty("/weekReport",empty);
                MessageToast.show("Complete todos los parámetros de búsqueda")
            }
            console.log('aqui')
            util.setProperty("/busy", false);

        },

        onTabSelection: function (oEvent) {
            let selectedKey = oEvent.getSource().getSelectedKey();

            if (selectedKey !== "kTabProjected") {
                this.getView().byId("executionSaveBtn").setVisible(false);
                this.getView().byId("executionSaveBtn").setEnabled(false);

                if (selectedKey === "kTabParameter") {
                    let oProductsTable = this.getView().byId("idProductsTable");
                    oProductsTable.removeSelections(true);
                    this.getModel("posturecurve").setProperty("/executed/enabledTab", false);
                    this.getModel("posturecurve").setProperty("/week", []);
                    this.getView().byId("Selectyears").setSelectedKey(null);
                    this.getView().byId("breedSelect").setSelectedKey(null);
                    this.getView().byId("selectLoteFatherprojected").setEnabled(false);
                    this.getView().byId("selectLoteFatherprojected").setSelectedKey(null);
                    this.getView().byId("selectLote").setEnabled(false);
                    this.getView().byId("selectLote").setSelectedKey(null);
                }

                if (selectedKey === "ktabReports") {
                    let oProductsTable = this.getView().byId("idProductsTable");
                    oProductsTable.removeSelections();
                    this.onBreedLoad();
                    this.getModel("posturecurve").setProperty("/executed/enabledTab", false);
                    this.getModel("posturecurve").setProperty("/weekReport", []);
                    this.getView().byId("Selectyears2").setSelectedKey(null);
                    this.getView().byId("selectBreed").setSelectedKey(null);
                    this.getView().byId("selectLoteFather").setSelectedKey(null);
                    this.getView().byId("selectLoteChild").setSelectedKey(null);
                    this.getView().byId("Reporttype").setSelectedKey(null);
                }
            }
        },

        onDialogPressEx: function () {
            var aux = this.getView().getModel("posturecurve");
            aux.setProperty("/input",false);
            // this.getView().byId("ModifiyBtn").setEnabled(true)
            this.getView().byId("executionSaveBtn").setVisible(true);
            this.getView().byId("executionSaveBtn").setEnabled(true);
            // debugger;

            let posturecurve = this.getModel("posturecurve");

            let jsonSelect= posturecurve.getProperty("/savingthedate");
            let updatedjson= posturecurve.getProperty("/returnupdate");
            // console.log({updatedjson})

            // var model= aux.dayExecuted
            let arr = aux.oData.dayExecuted;
            // console.log({arr})
            let arrayTemp = new Array();
            let update= [];
            arr.forEach(element => {
                if(element.eggs_executed!= null){
                    let jsonTemp = {
                        "eggs_executed": element.eggs_executed,
                        "init_date": element.dia,
                        "lot": element.lot
                    };

                    update.push(jsonTemp);
                }
            });

            // console.log(update)
            // console.log(jsonSelect)

            // "posturecurveday_id": element.posturecurveday_id,
            // "week_id": element.week_id,
            // "executed": parseInt(element.executed),
            // "day_of_week": element.day_of_week


            let formatDate = jsonSelect.init_date.split("/"),
                that = this;
            // console.log(formatDate)
            fetch("/eggs_storage/updateEggsExecuted", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    records: update,
                    init_date_start: formatDate[2] + "-" + formatDate[1] + "-" + formatDate[0],

                    breed_id: updatedjson.breed_id,
                    year:updatedjson.year,
                    lot: updatedjson.lot,
                    num_week: updatedjson.num_week
                })
            }).then(function(response) {
                if (response.status !== 200) {
                    console.log("Looks like there was a problem. Status Code: " + response.status);
                    return;
                }

                response.json().then(function(res) {
                    // console.log(res.data)
                    var dialog = new Dialog({
                        title: "Información",
                        type: "Message",
                        state: "Success",
                        content: new Text({
                            text: "Información guardada con éxito."
                        }),
                        beginButton: new Button({
                            text: "OK",
                            press: function() {
                                res.data.forEach(item => {
                                    let formatDate= item.dia.split("-");

                                    posturecurve.setProperty("/formateDate", formatDate);
                                    item.available = (item.eggs_executed==null || item.eggs_executed< 0)? true: false;
                                    item.dia = formatDate[2]+"/"+formatDate[1]+"/"+formatDate[0];
                                });
                                // console.log(res.data)
                                posturecurve.setProperty("/dayExecuted", res.data);
                                that.getView().byId("executionSaveBtn").setVisible(false);
                                that.getView().byId("executionSaveBtn").setEnabled(false);
                                dialog.close();
                            }
                        }),
                        afterClose: function() {
                            dialog.destroy();
                        }
                    });

                    dialog.open();
                });
            });
        },

        // validateFloatInput: function (oEvent) {
        //     let input = oEvent.getSource();
        //     let floatLength = 10;
        //     let intLength = 10;
        //     let value = input.getValue();
        //     let regex = new RegExp(`/^([0-9]{1,${intLength}})([.][0-9]{0,${floatLength}})?$/`);

        //     if (regex.test(value)) {
        //         input.setValueState("None");
        //         input.setValueStateText("");
        //         return true;
        //     } else {
        //         let pNumber = 0;
        //         let aux = value.split("").filter(char => {
        //             if (/^[0-9.]$/.test(char)) {
        //                 if (char !== ".") {
        //                     return true;
        //                 }
        //                 else {
        //                     if (pNumber === 0) {
        //                         pNumber++;
        //                         return true;
        //                     }
        //                 }
        //             }
        //         }).join("").split(".");

        //         value = aux[0].substring(0, intLength);

        //         if (aux[1] !== undefined) {
        //             value += "." + aux[1].substring(0, floatLength);
        //         }

        //         if (value > 0) {
        //             input.setValue(value);
        //         } else {
        //             input.setValue("");
        //         }

        //         let origin = input.sId.split("--")[1];

        //         this.detectFailure(origin);

        //         return false;
        //     }
        // },

        // validateIntInput: function (oEvent) {
        //     let length = 10;
        //     let regex = new RegExp(`/^[0-9]{1,${length}}$/`);
        //     let oInput = oEvent.getSource();
        //     let value = oInput.getValue();
        //     let iValue = parseInt(value);

        //     if (regex.test(iValue)) {
        //         console.error("REGEXXXXXXXXXXXXXXXX");
        //         this.getView().byId("executionSaveBtn").setVisible(true);
        //         this.getView().byId("executionSaveBtn").setEnabled(true);
        //         return true;
        //     } else {
        //         let aux = value.split("").filter(char => {
        //             if (/^[0-9]$/.test(char)) {
        //                 if (char !== ".") {
        //                     console.error("REGEXYYYYYYYYYYYYYYYYYYYYYYYY");
        //                     this.getView().byId("executionSaveBtn").setVisible(true);
        //                     this.getView().byId("executionSaveBtn").setEnabled(true);
        //                     return true;
        //                 }
        //             }
        //         }).join("");

        //         value = aux.substring(0, length);

        //         console.error("REGEXZZZZZZZZZZZZZZZZZZZZZZZZZZ");
        //         this.getView().byId("executionSaveBtn").setVisible(false);
        //         this.getView().byId("executionSaveBtn").setEnabled(false);

        //         if (value > 0) {
        //             oInput.setValue(value);
        //         } else {
        //             oInput.setValue("");
        //         }

        //         return false;
        //     }
        // },

        onChange: function (oEvent) {
            // let intLength = 10;
            // let regex = new RegExp(`/^[0-9]{1,${intLength}}$/`);
            let oInput = oEvent.getSource(),
                obj = oInput.getBindingContext('posturecurve').getObject(),
                iExecutedEggs = oInput.getValue();
            iExecutedEggs = parseInt(iExecutedEggs);

            if (iExecutedEggs !== null && iExecutedEggs > 0 && (iExecutedEggs%1===0)) {
            // if (regex.test(iExecutedEggs)) {
                this.getView().byId("executionSaveBtn").setVisible(true);
                this.getView().byId("executionSaveBtn").setEnabled(true);
            } else {
                this.getView().byId("executionSaveBtn").setVisible(false);
                this.getView().byId("executionSaveBtn").setEnabled(false);
            }

            oInput.setValueState(iExecutedEggs === parseInt(obj.sum)?'None':'Warning');
            oInput.setValueStateText(iExecutedEggs === parseInt(obj.sum)?'':(iExecutedEggs > parseInt(obj.sum)?'El valor es superior a la cantidad proyectada':'El valor es inferior a la cantidad proyectada'))
        },

        onViewCurve2: function (oEvent) {
            var aux= this.getView().getModel("posturecurve");
            var duck = oEvent.getParameter("listItem").getBindingContext("posturecurve").getPath();
            let week_id= aux.getProperty(duck).week_id;
            let lote= aux.getProperty(duck).lot;

            fetch("/posturecurveDaily/findDaysByWeek", {
                method: "POST",
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },

                body: "week_id="+week_id
            }).then(
                function (response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status code: " + response.status);
                        return;
                    }

                    response.json().then(function (res) {
                        aux.setProperty("/dayExecuted", res.data);
                        aux.setProperty("/dataOld", res.data);
                        // console.log(posturecurve.getProperty("/dayExecuted"));
                    });
                }
            );

            // let lot=oEvent.getParameters().listItem.mAggregations.cells[1].mProperties.text;
            aux.setProperty("/lotaux", lote);

            //  console.log("sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss");
            // console.log(week_id);
            // let eggs=oEvent.getParameters().listItem.mAggregations.cells[2].mProperties.number.replace('.', "");;
            // let eggsForDay=parseInt(eggs/7,10);

            //  let report = new Array();
            //  for (let i = 1; i <= 7; i++) {
            //   report.push({
            //     day:i,
            // 		lot:lot,
            // 		eggsForDay:eggsForDay
            //   })
            //   this.getView().getModel("posturecurve").setProperty("/day",report);
            //   }

            var oPage = this.getView().byId("tabProjected");
            var oFormFragment = sap.ui.xmlfragment("annualPostureCurve.view.postureCurve.PostureCurveTableReal2",this);
            // oPage.setVisible(false)
            this.dummy=oPage.getContent()[1];
            oPage.removeAllContent();
            oPage.insertContent(oFormFragment);
        },

        onBreedLoad: function () {
            const serverName = "/breed/findAllBreedWP";
            let mdbreed = this.getModel("mdbreed");
            let that = this;

            mdbreed.setProperty("/records", []);

            let isRecords = new Promise((resolve, reject) => {
                fetch(serverName).then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status code: " + response.status);
                            return;
                        }
                        // Examine the text in the response
                        response.json().then(function(data) {
                            resolve(data);
                        });
                    }
                ).catch(function (err) {
                    console.error("Fetch error:", err);
                });
            });

            isRecords.then((res) => {
                if (res.data.length > 0) {
                    mdbreed.setProperty("/records", res.data);
                    mdbreed.setProperty("/value", mdbreed.getProperty("/records/0/breed_id"));
                    that.getView().byId("breedSelect").setSelectedItem({});
                }
            });
        },

        onIncubatorPlant: function () {
            let util = this.getModel("util");
            let partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id");
            const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/findIncPlantByPartnetship");

            return new Promise((resolve, reject) => {
                fetch(serverName, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        partnership_id: partnership_id
                    })
                }).then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " + response.status);
                            return;
                        }

                        response.json().then(function(res) {
                            //  console.log("Buscando incubadora: ", res);
                            resolve(res);
                        });
                    }
                ).catch(function(err) {
                    console.log("Fetch Error :-S", err);
                });
            });
        },

        findYear : function(){
            this.getView().byId("selectBreed").setSelectedKey("")
            this.getView().byId("selectLoteFather").setSelectedKey("")
            this.getView().byId("selectLoteChild").setSelectedKey("")
            this.getView().getModel("posturecurve").setProperty("/weekReport",[])
            this.getView().byId("Reporttype").setSelectedKey("")
            let posturecurve = this.getModel("posturecurve")

            posturecurve.setProperty("/lot_init2",[])
            posturecurve.setProperty("/lot_initChild",[])
            posturecurve.setProperty("/enabledFather",false)
            posturecurve.setProperty("/enabledDiary",false)
            posturecurve.setProperty("/enabledChild",false)

            let   mode = [{
                "name" : ""
            }]

            posturecurve.setProperty("/mode",mode)
            posturecurve.setProperty("/select",false)
        },

        diaryWeekType : function(){
          this.getView().getModel("posturecurve").setProperty("/weekReport",[])
        },

        activeScenario: function(){
            let util = this.getModel("util");
            let mdscenario = this.getModel("posturecurve");
            let that = this;
            const serverName = "/scenario/activeScenario";
            // const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/activeScenario");

            return new Promise((resolve, reject) => {
                fetch(serverName).then(function(response) {
                    if (response.status !== 200) {
                        console.log("Looks like there was a problem. Status Code: " + response.status);
                        return;
                    }

                    response.json().then(function(res) {
                        resolve(res);
                    });
                }).catch(function(err) {
                    console.error("Fetch error:", err);
                });
            });
        }
    });
});