sap.ui.define([
    "higherLayer/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "higherLayer/controller/MasterUserAppController"
], function (BaseController, Filter, FilterOperator, MessageBox, Dialog, Button, Text, MasterUserAppController) {
    "use strict";

    return BaseController.extend("higherLayer.controller.Master", {

        onInit: function () {

            var oList = this.getView().byId("__list0");
            this._oList = oList;
            this._oListFilterState = {
                aFilter: [],
                aSearch: []
            };
            this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);

        },
        _onMasterMatched: function (oEvent) {

            var util = this.getModel("util"),
                that = this,
                ospartnership = this.getModel("ospartnership"),
                serviceUrl = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/getPartnership");
            console.log(serviceUrl);
            var settings = {
                url: serviceUrl,
                method: "GET",
                success: function (res) {
                    console.log(res);
                    util.setProperty("/busy/", false);
                    ospartnership.setProperty("/records/", res.data);

                    // var firstItem = that.getView().byId("__list0").getItems()[0];
                    // var Oid = firstItem.getBindingContext("ospartnership").getPath().split("/");
                    // var id = Oid[2];
                    // console.log(Oid)
                    // console.log(id)

                    // if (firstItem) {
                    //     var one_item = firstItem.getBindingContext("ospartnership").getObject().partnership_id;
                    //     that.getRouter().navTo("detail", {
                    //         partnership_id: one_item,
                    //         id: id
                    //     }, false);
                    // }

                },
                error: function (err) {
                    console.log(err);
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                }
            };

            util.setProperty("/busy/", true);
            //borra los registros OSPARTNERSHIP que estén almacenados actualmente
            ospartnership.setProperty("/records/", []);
            //realiza la llamada ajax
            $.ajax(settings);



        },
        onSelectionChange: function (oEvent) {

            var Oid = oEvent.getSource().getBindingContext("ospartnership").getPath().split("/");
            var id = Oid[2];
            console.log(id);
            console.log(oEvent.getSource().getBindingContext("ospartnership").getObject().partnership_id);
            this.getRouter().navTo("detail", {
                partnership_id: oEvent.getSource().getBindingContext("ospartnership").getObject().partnership_id,
                id: id
            }, false /*create history*/);
        },

        onSearch: function (oEvent) {

            if (oEvent.getParameters().refreshButtonPressed) {
                this.onRefresh();
                return;
            }
            var sQuery = oEvent.getSource().getValue();
            //var sQuery = oEvent.getParameter("query");
            if (sQuery) {
                this._oListFilterState.aSearch = [new Filter("name", FilterOperator.Contains, sQuery)];
            } else {
                this._oListFilterState.aSearch = [];
            }
            this._applyFilterSearch();

        },
        _applyFilterSearch: function () {
            var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
                oViewModel = this.getModel("ospartnership");

            this._oList.getBinding("items").filter(aFilters, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aFilters.length !== 0) {
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("master.ListNoDataText"));
            } else if (this._oListFilterState.aSearch.length > 0) {
                // only reset the no data text to default when no new search was triggered
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("master.ListNoDataText"));
            }
        },
        _updateListItemCount: function (iTotalItems) {
            var sTitle;
            // only update the counter if the length is final
            if (this._oList.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("master.TitleCount", [iTotalItems]);
                this.getModel("ospartnership").setProperty("/title", sTitle);
            }
        },
        onUpdateFinished: function (oEvent) {
            this._updateListItemCount(oEvent.getParameter("total"));
        },
        goToLaunchpad: function () {
            // var dummy = this.getView().getModel("util");
            // window.location.href = dummy.getProperty("/serviceUrl") + "/Apps/launchpad/webapp";
            window.location.href = "/Apps/launchpad/webapp";
        },
        parametersSelect: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var parameter = oItem.getBindingContext("prueba").getObject().route;
            // let parameter = oEvent.getSource().getBindingContext("prueba").getObject().route
            console.log(parameter)
            let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
            let id = this.getModel("ospartnership").getProperty("/selectedRecordPath").split("/")
            this.getRouter().navTo("parameters", { id: id[2], partnership_id:partnership_id }, false /*create history*/);
            this.getModel("prueba").setProperty("/CurrentParameter", parameter)
            let that = this
            switch (parameter) {
                case "process":
                    this.ParametersViews(true,false,false,false)
                    fetch("/higherLayer/findAllProcess", {
                        method: "GET",
                      })
                        .then(
                          function (response) {
                            if (response.status !== 200) {
                              console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                              return;
                            }
                
                            response.json().then(function (res) {
                              //console.log(JSON.parse(res.data));
                              // resolve(res);
                              console.log(res.data)
                              that.getView().getModel("tables").setProperty("/ProcessTable", res.data)
                
                            });
                          }
                        )
                        .catch(function (err) {
                          console.log("Fetch Error :-S", err);
                        });
                    break;
                case "machines":
                    this.ParametersViews(false,true,false,false)
                    let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
                    console.log(partnership_id)
                    fetch("/higherLayer/findAllMachineGroup", {
                      method: "POST",
                      headers: {
                        "Content-type": "application/json"
                      },
                      body: JSON.stringify({
                        partnership_id: partnership_id
                      })
                    })
                      .then(response => {
                        if (response.status !== 200) {
                          console.log("Looks like there was a problem. Status Code: " +
                            response.status);
                          return;
                        }
                        console.log("entre1");
                        response.json().then((res) => {
                          console.log(res.data);
                          this.getModel("tables").setProperty("/MachineTable", res.data)
              
              
                        });
              
              
                      })
                      .catch(err => console.log);
                    break;
                case "sex":
                    this.ParametersViews(false,false,true,false)
           
                    fetch("/higherLayer/findAllGenderCl", {
                        method: "GET",
                    })
                        .then(
                            function(response) {
                                if (response.status !== 200) {
                                    console.log("Looks like there was a problem. Status Code: " +
                      response.status);
                                    return;
                                }
            
                                response.json().then(function(res) {
                                    //console.log(JSON.parse(res.data));
                                    // resolve(res);
                                    console.log(res.data)
                                    that.getView().getModel("tables").setProperty("/SexTable",res.data)
                                    
                                });
                            }
                        )
                        .catch(function(err) {
                            console.log("Fetch Error :-S", err);
                        });
                    break;
                case "eviction":
                    this.ParametersViews(false,false,false,true)
                    
                    fetch("/higherLayer/findAllEvictionPartition", {
                        method: "GET",
                    })
                        .then(
                            function(response) {
                                if (response.status !== 200) {
                                    console.log("Looks like there was a problem. Status Code: " +
                      response.status);
                                    return;
                                }
            
                                response.json().then(function(res) {
                                    //console.log(JSON.parse(res.data));
                                    // resolve(res);
                                    console.log(res.data)
                                    that.getView().getModel("tables").setProperty("/EvictionTable",res.data)
                                    
                                });
                            }
                        )
                        .catch(function(err) {
                            console.log("Fetch Error :-S", err);
                        });
                    break;
            }


        },
        ParametersViews: function (w,x,y,z) {
            this.getModel("prueba").setProperty("/viewProcess", w)
            this.getModel("prueba").setProperty("/viewMachines", x)
            this.getModel("prueba").setProperty("/viewSex", y)
            this.getModel("prueba").setProperty("/viewEviction", z)
        },
        Navback: function () {
            this.getView().byId("list1").setVisible(true)
            this.getView().byId("list2").setVisible(false)
            this.getView().byId("__page1").setShowNavButton(false)
            this.getModel("prueba").setProperty("/Title","Etapas")
            this.getRouter().navTo("master", { id: 0 }, false /*create history*/);
        },

        onSelectionChange: function (oEvent) {
        

            /**
			 * @type {Array} entities Arreglo con las entidades disponibles
			 * @type {String} name    Nombre de la entidad seleccionada
			 */
            var entities = ["mdstage"] 
            var oItem = oEvent.getParameter("listItem");
            var name = oItem.getBindingContext("prueba").getObject()
                // name = oEvent.getSource().getBindingContext("prueba").getObject()
                // let oItem = oEvent.getParameter("listItem");
                // if(oItem===undefined){
                    // var name = oEvent.getSource().getBindingContext("prueba").getObject()
                //     console.log("1")
                // } else {
                //     var name = oItem.getBindingContext("prueba").getObject();
                //     console.log("2")
                //     console.log(name)
                // }
               
            /**
			 * Función para buscar la entidad que tenga el mismo nombre que la proporcionada en la ruta
			 */
            function findEntity(entity) {
                return entity === name;
            }
            let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id"),
            aja = this.getModel("ospartnership").getProperty("/records"),
            sendid
            let id = this.getModel("ospartnership").getProperty("/selectedRecordPath")
            console.log(id)
            console.log(aja)
            if (id===undefined){
                sendid=0
            }else{
                sendid=id.split("/")
                sendid=sendid[2]
                console.log(sendid)
                if (aja.length===1){
                    sendid=0
                }

            }
            // let partner = partnership_id.split("/")
            console.log(name)
            if (name.route == "parameters") {
                this.getView().byId("list1").setVisible(false)
                this.getView().byId("list2").setVisible(true)
                this.getView().byId("__page1").setShowNavButton(true)
                this.getModel("prueba").setProperty("/Title","Parámetros")
                console.log("sss")
            }
            this.getRouter().navTo(name.route, {
                partnership_id:partnership_id, 
                id: sendid
            }, false /*create history*/);


        },


    });

});
