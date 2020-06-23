sap.ui.define([
    "recalculation/controller/BaseController",
    "recalculation/model/formatter",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/model/Filter",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "recalculation/controller/MasterUserAppController",
    "sap/ui/core/Item",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (BaseController, formatter, MessageToast, Dialog, Button, Text, Filter, Export, ExportTypeCSV, MasterUserAppController, Item,MessageBox,JSONModel) {
    "use strict";

    return BaseController.extend("recalculation.controller.Main", {
        formatter: formatter,
        onInit: function () {
            // this.setFragments();

            this.getRouter().getRoute("home").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function () {
            console.log(this)

            let dummy = this.getView().getModel("dummy"),
                util = this.getView().getModel("util"),
                that = this


            //this.dialogNewScenario = sap.ui.xmlfragment("recalculation.view.dialogs.newScenarioDialog", this);
            this.dialogGoals = sap.ui.xmlfragment("recalculation.view.dialogs.Dialog", this);
            // util.setProperty("/urlService", "");
            that.preloadScenario();
            that.preloadBreed();
            that.enabledRecalculationTab(false);
            let jsonInput = {
                "sAloj": "",
                "idScenario": "",
                "fecha":"",
                "breed_id":"",
                "algoritmo":""
            }
            this.getModel('data').setProperty("/newImput",jsonInput);
            

        },

        changeDate: function (oEvent) {

            let date = oEvent.getSource().getValue();
            let that=this

            oEvent.getSource().setValue(that.validateDate(date)?date:"")


            
        },

        validateDate: function (date) {return (/^(?:3[01]|[12][0-9]|0?[1-9])([\-/.])(0?[1-9]|1[1-2])\1\d{4}$/.test(date))},

        validateInput: function (o) {

            let input = o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                console.log("entro if");
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

        validateChanges: async function () {

            let mddata = this.getModel('data')
            //let recalculationData = mddata.getProperty('/recalculationData')
            let optimizerData = mddata.getProperty('/optimizerData')
            let optimizerDataCpy = mddata.getProperty('/optimizerDataCpy')
            let same = await this.objectsAreSame(optimizerData,optimizerDataCpy)
            return same;
            
        },

        applyFilterOptimizerData: async function(){

            let selectedScenario = this.getView().byId("cb_scenario").getSelectedKey()
            let selectedBreed = this.getView().byId("cb_breed").getSelectedKey()
            let selectedDate = this.getView().byId("dp_date").getValue()
            let data = this.getModel('data');

            if(selectedScenario && selectedBreed && selectedDate){

                this.getModel('data').setProperty("/enabledFilters",false);
                let oModel;
                let that = this;
                                
                this.getModel('data').setProperty("/busy", true);
                let jsonInput = {
                    "sAloj": 'Con alojamiento',
                    "idScenario": parseInt(selectedScenario),
                    "fecha":selectedDate,
                    "breed_id":parseInt(selectedBreed),
                    "algoritmo": '2'
                }
                var compare = this.getModel('data').getProperty("/newImput");

                if(compare.sAloj!=jsonInput.sAloj || compare.idScenario != jsonInput.idScenario || compare.fecha != jsonInput.fecha || compare.breed_id != jsonInput.breed_id || compare.algoritmo!= jsonInput.algoritmo){



                    //that.getModel('data').setProperty("/enabledFilters", false);
                    await $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: "/ave_simulator",
                        dataType: "json",
                        data: JSON.stringify(jsonInput),
                        async: true,
                        timeout: 0,
                        success: function (data) {
                            
                            oModel = new JSONModel(data.data);
                            that.getModel('data').setProperty("/newImput",jsonInput);
                            let datos = oModel.oData
                            if(datos.demand.length>0){
                                
                                let dato   = [];
                                selectedDate =  datos.dates[0].split("/")
                                var dates = new Date(selectedDate[2],selectedDate[1]-1,selectedDate[0])

                                dates.setDate(dates.getDate()-7*(datos.lot_size.length - datos.dates.length))
                                var formatter = new Intl.NumberFormat('en-US');
                                for(var i =0 ; i< datos.demand.length;i++)
                                {
                                    var tempdate = dates.getDate() + "/" + parseInt(dates.getMonth()+1, 10) + "/" + dates.getFullYear();
                                    tempdate = that.formatterDate(tempdate)
                                    if((datos.lot_size[i]>0) && ((datos.lot_size[i]) - (datos.isPrevios[i]))>0 ){
                                        //var temp = {"datesCom":new Date(dates.getFullYear(),parseInt(dates.getMonth(), 10),dates.getDate()),"date":tempdate,"quantity":parseInt(datos.lot_size[i]),"stateDp":"None","stateInput":"None"};
                                        var temp = {"datesCom":new Date(dates.getFullYear(),parseInt(dates.getMonth(), 10),dates.getDate()),"date":tempdate,"quantity":parseInt(datos.lot_size[i] - datos.isPrevios[i]),"isPrevios":datos.isPrevios[i],"statusDp":"None","statusInput":"None"};
                                        dato.push(temp);
                                    }
                                    
                                    dates.setDate(dates.getDate()+7);
                                }

                                if (dato.length>0) {

                                    
                                    that.getModel('data').setProperty("/optimizerData", dato);
                                    
                                }else{

                                    MessageToast.show("No se encontró data sin programar", {
                                        duration: 4000,
                                        width: "20%"
                                    });

                                }
                                that.getModel('data').setProperty("/enabledFilters", true);
                                console.log("optimizerData",dato);
                                
                            }else{
                                MessageBox.error("No se encontr\u00F3 soluci\u00F3n factible, verifique los par\u00E1metros de cofiguraci\u00F3n o modifique la fecha seleccionada",{title: "Error",actions: ["Cerrar"],
                                emphasizedAction: MessageBox.Action.CLOSE});

                            }
                            that.getModel('data').setProperty("/busy", false);
                
                            that.getModel('data').setProperty("/enabledFilters",true);
                        },
                        error: function (request) {
                            that.getModel('data').setProperty("/busy", false);
                            // that.getModel('data').setProperty("/optimizerData", []);
                            that.getModel('data').setProperty("/enabledFilters",true);
                            MessageBox.error("Verifique los parámetros técnicos o si existe una demanda asociada a la raza seleccionada",{title: "Error",actions: ["Cerrar"],
                            emphasizedAction: MessageBox.Action.CLOSE});
                        }
                    })
                    }else{
                        MessageBox.error("No existe variaciones en los parametros de entrada",{title: "Error",actions: ["Cerrar"],
                        emphasizedAction: MessageBox.Action.CLOSE});
                    }
                    this.getModel('data').setProperty("/enabledFilters",true);
                    data.setProperty('/busy', false)


                
            }else{

                if(!selectedScenario){
                    this.getView().byId("cb_scenario").setValue("")
                }
                if(!selectedBreed){
                    this.getView().byId("cb_breed").setValue("")
                }
                MessageToast.show("No es posible filtrar a partir de los datos suministrados. Revise e intente nuevamente", {
                    duration: 4000,
                    width: "20%"
                });
                
            }

            console.log("1",selectedScenario);
            console.log("2",selectedBreed);
            console.log("3",selectedDate);
            

        },

        formatterDate : function (dateopt) {

            let parts = dateopt.split('/')
            parseInt(parts[0]) < 10 ? parts[0] = "0"+parts[0] : parts[0]
            parseInt(parts[1]) < 9 ? parts[1] = "0"+parts[1] : parts[1]
            return(parts[0]+'/'+parts[1]+'/'+parts[2])
            
        },

        proceedToRecalculation: async function(){
            let mddata = this.getModel('data')
            let recalculationData = mddata.getProperty('/recalculationData')
            let optimizerData = mddata.getProperty('/optimizerData')
            let optimizerDataCpy = mddata.getProperty('/optimizerDataCpy')
            let validate = await this.validateData()
            let same = await this.objectsAreSame(optimizerData,optimizerDataCpy)
            console.log("same",same);
            

            if(validate){


                if(recalculationData.length === 0 || !same){

                    console.log("calculo de nuevo");
                    

                    optimizerDataCpy = optimizerData.map(itm=>({...itm}))
                    mddata.setProperty('/optimizerDataCpy',optimizerDataCpy)

                    this.enabledRecalculationTab(true);
                    this.showOptimizerDataButtons(false)
                    this.showGoalsButtons(false)

                }else{

                    this.showOptimizerDataButtons(false)
                    this.getView().byId("goalsTab").setEnabled(true);
                    this.getView().byId("tabBar").setSelectedKey("goalsTabKey")
                    console.log("no calculo nada");

                }


            }else{

                MessageToast.show("Debe completar todos los campos para poder continuar.", {
                    duration: 4000,
                    width: "20%"
                });

            }

        },

        objectsAreSame :function (x, y) {
            var objectsAreSame = true;
            for(var propertyName in x) {
                console.log("proper x",x[propertyName]);
                console.log("proper y",y[propertyName]);
                
               if(JSON.stringify(x[propertyName]) !== JSON.stringify(y[propertyName])) {
                  objectsAreSame = false;
                  break;
               }
            }
            return objectsAreSame;
         },

        validateData: function (params) {

            let mddata = this.getModel("data")
            let optimizerData = mddata.getProperty('/optimizerData')
            let flag = true;

            for (let i = 0; i < optimizerData.length; i++) {
                let element = optimizerData[i];
                console.log("date",element.date);
                console.log("quantity",element.quantity);
                

                if(element.date){

                    element.stateDp = "None"

                }else{

                    element.stateDp = "Error"
                    flag=false

                }

                if(element.quantity){

                    element.stateInput = "None"

                }else{

                    element.stateInput = "Error"
                    flag=false

                }
                
            }
            mddata.refresh()
            //this.getModel("data").setProperty("/optimizerData",optimizerData)
            console.log("optimizer",optimizerData);
            

            return flag;
            
        },

        enabledRecalculationTab: function (enab) {
            let that=this
           
            if (enab) {
                let scenario_id = this.getView().byId("cb_scenario").getSelectedKey()
                let breed_id = this.getView().byId("cb_breed").getSelectedKey()
                that.getView().byId("goalsTab").setEnabled(enab);
                that.getView().byId("tabBar").setSelectedKey("goalsTabKey")
                that.recalculateGoals(breed_id,scenario_id);

            }
            else {
                that.getView().byId("goalsTab").setEnabled(false);
            }

        },

        recalculateGoals: function (breed_id,scenario_id) {

            let mddata = this.getModel("data");
            let optimizerData = mddata.getProperty("/optimizerData")

            console.log("data",optimizerData);
            console.log("scenario",scenario_id);
            console.log("breed",breed_id);
            


            fetch("/process/recalculateGoals", {
                headers: {
					  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({"breed_id" : breed_id,
                "scenario_id": scenario_id,
                "records": optimizerData
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
                            console.log(res)
                            mddata.setProperty("/recalculationData", res.data);
						  
                        });
					  }
                )
                .catch(function(err) {
					  console.log("Fetch Error: ", err);
                });

            
            
        },

        onTabSelection: function (ev) {
            console.log(ev)
            let that = this
            var selectedKey = ev.getSource().getSelectedKey();
            //var viewId = this.getView().getId() + "--";
            console.log(selectedKey)
            

            if (selectedKey === "optimizerDataTabKey") {

                that.enabledRecalculationTab(false)
                that.showOptimizerDataButtons(true)
                that.showGoalsButtons(false)
                
            }

            // if (selectedKey === "goalsTabKey") {

            //     that.showOptimizerDataButtons(false)
            //     that.showGoalsButtons(true)
                
            // }
        },

        preloadBreed: function () {
            let mddata = this.getModel("data");
            // let util = this.getModel("util");


            // const serverName = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/getBreeds");
            const serverName = "/breed/findAllBreedWP";

            fetch(serverName, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },

            })
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                            return;
                        }
                        response.json().then(function (res) {
                            // console.log(res.data);
                            mddata.setProperty("/filtersBreedRecords", res.data);
                            mddata.refresh();
                        });
                    }
                )
                .catch(function (err) {
                    console.log("Fetch Error :-S", err);
                });
        },

        preloadScenario: function () {
            //var util = this.getModel("util");
            let mddata = this.getModel("data");
            let that = this
            //util.setProperty("/busy", true);
            this.getScenarioRecords()
                .then(records => {
                    mddata.setProperty("/filtersScenarioRecords", records.data);
                    //that.enabledTab(false)
                    mddata.setProperty("/activeScenarioId", 0);
                    mddata.setProperty("/activeScenarioName", "");
                    records.data.forEach(function (elem) {
                        if(elem.status==1){
                            mddata.setProperty("/activeScenarioId", elem.scenario_id);
                            mddata.setProperty("/activeScenarioName", elem.name);
                            //that.enabledTab(true)
                            
                        }
                    })
                    //this.showStatusMaintenance();
                    //util.setProperty("/busy", false);
                    console.log("mddata",mddata);
                    
                })
                .catch(err => {
                    console.log(err);
                });

        },

        getScenarioRecords: function () {
            //var util = this.getModel("util");
            var scenarios = this.getModel("scenarios");
            var url = "/scenario/findAllScenario";
            var method = "GET";
            var data = {};
            console.log(url)
            return new Promise((resolve, reject) => {
                function getScenario(res) {
                    resolve(res);
                }

                function error(err) {
                    reject(err);
                }

                /*Envía la solicitud*/
                this.sendRequest.call(this, url, method, data, getScenario, error, error);
            });
        },

        showOptimizerDataButtons: function (flag) {
            var mddata = this.getView().getModel("data");

            mddata.setProperty("/optimizerDataBtn", flag);
        },

        showGoalsButtons: function (flag) {
            var mddata = this.getView().getModel("data");

            mddata.setProperty("/recalculationExportBtn", flag);
            // goals.setProperty("/export_erp", flag);
            // goals.setProperty("/export2", flag);
        },

        handleViewSettingsDialogButtonPressed: function (oEvent) {

            if (!this.dialogGoals) {
                this.dialogGoals = sap.ui.xmlfragment("recalculation.view.dialogs.Dialog", this);
            }

            let dialog = this.dialogGoals;

            //Botón cancelar:
            // sap.ui.getCore().byId("cancelBtn").attachPress(function () {
            //     dialog.close();
            //     dialog.destroy();
            // });

            //Agregamos como dependiente el dialogo a la vista:
            this.getView().addDependent(dialog);

            //Abrimos el dialogo:
            dialog.open();
        },

        onTest: function (ev) {
            console.log(ev);
        },



        onGoalsExport: function () {
            //var util = this.getModel("util");
            // var url = util.getProperty("/urlService") + util.getProperty("/" + util.getProperty("/service") + "/fileExport");
            var url = "/downloadFile/fileExport/";
            window.location.href = url;
            /*var method = "GET";
          var data = {};

          return new Promise((resolve, reject) => {
              function getStatusFile(res) {
                  resolve(res);
              };

              function error(err) {
                  reject(err);
              };


              this.sendRequest.call(this, url, method, data, getStatusFile, error, error);
          });*/
            /*var $settings = {
  					url: url,
  					method: 'GET',
  					//data: JSON.stringify(data),
  					//contentType: "application/json",
  					error: err => {
  						console.log("error", err);
  					},
  					success: res => {
  						//console.log("respuesta", res);
  						if(res.statusCode !== 200) {
                console.log("NO EXITO");

  						} else {
  							console.log("EXITO");
  						}
  					}
  				};

  				$.ajax($settings);*/
            /*
          var goals = this.getView().getModel('goals'),
              columns = goals.getData()["columns"],
              oJson = [],
              items = this.getView().byId("goalsTable").getItems();
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var path = item.getBindingContext('goals').getPath();
            var cells = item.getAggregation('cells');
            var object = {};
            for (var j = 0; j < cells.length; j++) {
              var cellPath = cells[j].getBindingContext("goals").getPath();
              object['value' + j] = goals.getProperty(cellPath).value;
              //console.log(goals.getProperty(cellPath));
            }
            oJson.push(object);
          }
          //console.log(oJson);
          var objColum = {};
          var jsonColum = [];
          for(var k = 0; k < columns.length; k++) {
              objColum = {
                "name" : columns[k].columnid,
                "template" : {
                  "content": {
                    "path": "value" + k
                  }
                }
              }
            jsonColum.push(objColum);
          }
          //console.log(oJson);
          //console.log(jsonColum);
          var oModel = new sap.ui.model.json.JSONModel(oJson);
          var oExport = new Export({

    				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
    				exportType : new ExportTypeCSV({
    					separatorChar : ";"
    				}),

    				// Pass in the model created above
    				models : oModel,

    				// binding information for the rows aggregation
    				rows : {
    					path : "/"
    				},

    				// column definitions with column name and binding info for the content

            columns: jsonColum
          });

          // download exported file
    			oExport.saveFile().catch(function(oError) {
    				MessageBox.error("Error al descargar archivo. Intente con otro navegador!\n\n" + oError);
    			}).then(function() {
    				oExport.destroy();
    			});*/
        },
        onGoalsExport2: function () {
            var goals = this.getView().getModel("goals"),
                columns = goals.getData()["columns"],
                oJson = [],
                itemsG = goals.getProperty("/rows"),
                items = this.getView().byId("goalsTable").getItems();
            let mdgoals = this.getModel("goals");
            console.log("items:::: ", items)
            console.log("itemG:::: ", itemsG)
            console.log("del property rows::::: ", goals.getProperty("/rows"))
            console.log("columns")
            console.log(columns)
            for (var i = 0; i < itemsG.length; i++) {
                // var item = items[i];
                // var path = item.getBindingContext("goals").getPath();
                // var cells = item.getAggregation("cells");
                var object = {};
                var k = 0;
                // console.log("cells:::: ", cells)
                for (var j = 0; j < columns.length; j++) {
                    // var cellPath = cells[j].getBindingContext("goals").getPath();
                    object["value" + k] = itemsG[i].values[j].value;
                    // console.log("cellpath:::: ", cellPath)
                    if (itemsG[i].values[j].value !== "" && !isNaN(itemsG[i].values[j].value) &&
                        (j >= mdgoals.getProperty("/staticColumns").length)) {
                        object["value" + (k + 1)] = itemsG[i].values[j].capacity;
                        object["value" + (k + 2)] = itemsG[i].values[j].residue;
                        k = k + 3;
                        console.log("i ", i, "j ", j, "k ", k)
                    }
                    else k++;
                    //console.log(goals.getProperty(cellPath));
                }
                console.log("")
                oJson.push(object);
                //console.log(object);
            }
            console.log("oJson")
            console.log(oJson)
            console.log("columns")
            console.log(columns)
            console.log("mdgoals")
            console.log(mdgoals)
            console.log("mdgoals.getProperty(/staticColumns).length")
            console.log(mdgoals.getProperty("/staticColumns").length)
            var objColum = {};
            var jsonColum = [];
            var m = 0;
            for (var k = 0; k < columns.length; k++) {
                // if(k > 0)
                if (k >= mdgoals.getProperty("/staticColumns").length) {
                    objColum = {
                        "name": columns[k].columnid,
                        "template": {
                            "content": {
                                "path": "value" + m
                            }
                        }
                    };
                    m = m + 1;
                    jsonColum.push(objColum);
                    objColum = {
                        "name": "Capacidad",
                        "template": {
                            "content": {
                                "path": "value" + m
                            }
                        }
                    };
                    m = m + 1;
                    jsonColum.push(objColum);
                    objColum = {
                        "name": "Residuo",
                        "template": {
                            "content": {
                                "path": "value" + m
                            }
                        }
                    };
                    jsonColum.push(objColum);
                    m = m + 1;
                }
                else {
                    objColum = {
                        "name": columns[k].columnid,
                        "template": {
                            "content": {
                                "path": "value" + m
                            }
                        }
                    };
                    m++;
                    jsonColum.push(objColum);
                }
            }
            console.log(jsonColum);
            var oModel = new sap.ui.model.json.JSONModel(oJson);
            var oExport = new Export({

                // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                exportType: new ExportTypeCSV({
                    separatorChar: ";"
                }),

                // Pass in the model created above
                models: oModel,

                // binding information for the rows aggregation
                rows: {
                    path: "/"
                },

                // column definitions with column name and binding info for the content

                columns: jsonColum
            });

            // download exported file
            oExport.saveFile().catch(function (oError) {
                MessageBox.error("Error al descargar archivo. Intente con otro navegador!\n\n" + oError);
            }).then(function () {
                oExport.destroy();
            });

        },


        goToLaunchpad: function () {
            var dummy = this.getView().getModel("dummy");
            // window.location.href = dummy.getProperty("/urlService") + "/Apps/launchpad/webapp";
            window.location.href = "/Apps/launchpad/webapp";
        },



        _onlyNumber: function (input) {
            var regex = /^[0-9]+$/;
            return input.match(regex);
        },


        validateFloatInput: function (o) {
            let input = o.getSource();
            let floatLength = 10;
            let intLength = 10;

            let value = input.getValue();
            let regex = new RegExp(`/^([0-9]{1,${intLength}})([.][0-9]{0,${floatLength}})?$/`);

            if (regex.test(value)) {
                input.setValueState("None");
                input.setValueStateText("");
                return true;
            }
            else {
                let pNumber = 0;
                let aux = value.split("")
                    .filter(char => {
                        if (/^[0-9.]$/.test(char)) {
                            if (char !== ".") {
                                return true;
                            }
                            else {
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
                input.setValue(value);
                return false;
            }
        },

        validateIntInput: function (o) {
            console.log("validateIntInput");
            let input = o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                return true;
            }
            else {
                let aux = value.split("").filter(char => {
                    if (/^[0-9]$/.test(char)) {
                        if (char !== ".") {
                            return true;
                        }
                    }
                }).join("");

                value = aux.substring(0, length);
                input.setValue(value);
                return false;
            }
        },



        resetFilterItems: function () {
            var aFilterItems = this.dialogGoals.getFilterItems();
            if (sap.ui.getCore().byId("myFilter")._vContentPage !== -1) {
                sap.ui.getCore().byId("myFilter")._vContentPage = 2
                console.log("Un dialogGoals----- ", this.dialogGoals)
                aFilterItems.forEach(function (item) {
                    var aItems = item.getItems();
                    console.log("Un item ----- ", item)
                    aItems.forEach(function (item) {

                        item.setSelected(false);
                    });
                });
            }

        },

        handleConfirm: function (oEvent) {
            let oView = this.getView();
            let oTable = oView.byId("goalsTable");
            let mParams = oEvent.getParameters();
            let oBinding = oTable.getBinding("columns");

            let mdbreed = this.getModel("mdbreed");
            let mdstage = this.getModel("mdstage");
            let goals = this.getModel("goals");
            let mdfilter = this.getModel("filters");
            //debugger;
            console.log(oEvent.getParameters(), oEvent.getSource())
            // apply filters to binding
            // let aFilters = [];
            let cellsFilters = [];
            let aFiltersBreed = [];
            let aFiltersProcess = [];
            jQuery.each(mParams.filterItems, function (i, oItem) {
                let aSplit = oItem.getKey().split("___");
                console.log(aSplit)
                let sPath = aSplit[0];
                let sValue1 = aSplit[1];
                if (sPath == "breed")
                    aFiltersBreed.push(sValue1);
                if (sPath == "process")
                    aFiltersProcess.push(sValue1);
            });

            if (aFiltersBreed.length > 0 || aFiltersProcess.length > 0) {
                if (aFiltersBreed.length <= 0) { //si no hay filtros por razas, se toman todas las existentes
                    mdbreed.getProperty("/records").forEach(item => {
                        aFiltersBreed.push(item.breed_id);
                    });
                }
                if (aFiltersProcess.length <= 0) { //si no hay filtros por razas, se toman todas las existentes
                    mdstage.getProperty("/records").forEach(item => {
                        aFiltersProcess.push(item.process_id);
                    });
                }
            }
            console.log("aFiltersBreed:: ", aFiltersBreed);
            console.log("aFiltersProcess:: ", aFiltersProcess);


            for (var k = 0; k < aFiltersBreed.length; k++) {
                for (var j = 0; j < aFiltersProcess.length; j++) {
                    let str = aFiltersBreed[k].toString() + "___$" + aFiltersProcess[j].toString();
                    // aFilters.push(new Filter("filter_key", 'EQ', str));
                    cellsFilters.push({ path: "filter_key", operator: "EQ", value1: str });
                }
            }

            if (cellsFilters.length > 0) {
                let str = goals.getProperty("/codeColumns");
                // aFilters.push(new Filter("filter_key", 'EQ', str));
                cellsFilters.push({ path: "filter_key", operator: "EQ", value1: str });
            }
            console.log("cellsFilters:: ", cellsFilters);

            // oBinding.filter(aFilters);
            mdfilter.setProperty("/records", cellsFilters);

            // update filter bar
            oView.byId("vsdFilterBar").setVisible(cellsFilters.length > 0);
            oView.byId("vsdFilterLabel").setText(mParams.filterString);
            this.applyFilters2();
            //sap.ui.getCore().byId("myFilter").removeAllFilterItems()
        },

        applyFilters2: function () {
            let oFilters = this.getModel("filters");
            let filters = oFilters.getProperty("/records");

            let goals = this.getModel("goals");
            let oRow = goals.getProperty("/rows");
            let oColums = goals.getProperty("/columns");
            let found = false;


            for (var i = oColums.length - 1; i >= 0; i--) {
                found = filters.find(function (ofilt) {
                    return ofilt.value1 == oColums[i].filter_key;
                });
                oColums[i].visible = ((!found && filters.length > 0) ? false : true);
            }

            oRow.forEach(function (irow, index) {
                for (var i = irow.values.length - 1; i >= 0; i--) {
                    found = filters.find(function (ofilt) {
                        return ofilt.value1 == irow.values[i].filter_key;
                    });
                    irow.values[i].visible = ((!found && filters.length > 0) ? false : true);
                }
            });
            goals.refresh();
        },

        testFunction: function () {
            console.log("test");
        }

    });
});