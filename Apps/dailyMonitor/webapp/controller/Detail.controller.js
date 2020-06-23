sap.ui.define([
    "dailyMonitor/controller/BaseController", 
    "jquery.sap.global",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/IconTabFilter",
    "sap/m/IconTabSeparator"
], 
function(BaseController, jQuery, Filter, Fragment, JSONModel, MessageToast, Dialog, Button, Text, IconTabFilter, IconTabSeparator) 
{
    "use strict";
    const liftBreeding = 5,
        breeding = 3;
    return BaseController.extend("dailyMonitor.controller.Detail", 
        {

            onInit: function() 
            {
                this.setFragments();
                this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
            },
            onChangeSelectProduct: function(event) 
            {
                var key = event.getSource().getSelectedItem().getKey();
                let mdprogrammed = this.getModel("mdprogrammed");
                let vector = mdprogrammed.getProperty("/product/records");
                let evic = 0;
                let i = -1;
                do
                {
                    i++;
                    if (key == vector[i].broiler_product_id ) 
                        evic = vector[i].days_eviction;
                }while(  key != vector[i].broiler_product_id);
                mdprogrammed.setProperty("/programmed_date", this.sumaDias(evic));
            },

            _onRouteMatched: async function(oEvent) 
            {
                var oArguments = oEvent.getParameter("arguments");
                this.index = oArguments.id; 
      
                this.programmedPopover = sap.ui.xmlfragment("dailyMonitor.view.stages.ProgrammedPopover", this);
                this.getView().addDependent(this.programmedPopover);

                let oView= this.getView();
                let ospartnership = this.getModel("ospartnership");

                this.cleanTabs();    
                oView.byId("tabBar").setSelectedKey("tabLiftBreeding");
                oView.byId("liftBreedingTableId").addEventDelegate({
                    onAfterRendering: oEvent=>{
                        console.log("victor te amo!");
                    }
                });
    
    
    
    
    
    
    
                if(ospartnership.getProperty("/records").length>0){
                    let partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id");
                    this.onRead(partnership_id);
                }
                else{
                    this.reloadPartnership()
                        .then(data => {
                            if(data.length>0){
                                let obj= ospartnership.getProperty("/selectedRecords/");
                                if(obj){
                                    this.onRead(obj.partnership_id);
                                }
                                else{
                                    MessageToast.show("no existen empresas cargadas en el sistema", {
                                        duration: 3000,
                                        width: "20%"
                                    });
                                    console.log("err: ", data);
                                }
                            }
                            else{
                                MessageToast.show("ha ocurrido un error al cargar el inventario", {
                                    duration: 3000,
                                    width: "35%"
                                });
                                console.log("err: ", data);
                            }
                        });
                }



                this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
                this.onRead(this.index);
                console.log("mdscenario", this.getModel("mdscenario"));

                let scenario = await this.activeScenario();
                console.log(scenario);
                this.getModel("mdscenario").setProperty("/name",scenario.name);
                this.getModel("mdscenario").setProperty("/scenario_id",scenario.scenario_id);
                console.log("active scenario", this.getModel("mdscenario"));
                // var tab=this.getView().byId("tabBar")
                // console.log(tab)

                // var sep= new IconTabSeparator({
                //   icon: "sap-icon://open-command-field"
                // })
                // // tab.addItem(sep)
                // var cont=0;
                // var filt


                // if(localStorage.getItem("liftBreedingPlanningM")){
                //   filt= new IconTabFilter({
                //     text:"Levante y cria",
                //     content:sap.ui.xmlfragment("dailyMonitor.view.stages.liftBreeding", this)
                //   })
                //   console.log(cont)
                //   filt.setKey("levcria")
        
                //   if(cont>0){
                //     tab.addItem(new IconTabSeparator({
                //       icon: "sap-icon://open-command-field"
                //     }))
                //     console.log("entré")
                //   }
                //   cont++
                //   tab.addItem(filt)
                // }
                // if(localStorage.getItem("breedingPlanningM")){
                //   filt= new IconTabFilter({
                //     text:"Reproductora",
                //     content:sap.ui.xmlfragment("dailyMonitor.view.stages.breeding", this)
                //   })
                //   console.log(cont)
                //   filt.setKey("reproductora")
                //   if(cont>0){
                //     tab.addItem(new IconTabSeparator({
                //       icon: "sap-icon://open-command-field"
                //     }))
                //     console.log("entré")
                //   }
                //   cont++
                //   tab.addItem(filt)
                // }
                // if(localStorage.getItem("incubatorPlanningM")){
                //   filt= new IconTabFilter({
                //     text:"Incubadora",
                //     content:sap.ui.xmlfragment("dailyMonitor.view.stages.incubator", this)
                //   })
                //   filt.setKey("incubadora")
                //   console.log(cont)
                //   if(cont>0){
                //     tab.addItem(new IconTabSeparator({
                //       icon: "sap-icon://open-command-field"
                //     }))
                //     console.log("entré")
                //   }
                //   cont++
                //   tab.addItem(filt)
                // }
                // if(localStorage.getItem("broilersPlanningM")){
                //   filt= new IconTabFilter({
                //     text:"Engorde",
                //     content:sap.ui.xmlfragment("dailyMonitor.view.stages.broiler", this)
                //   })
                //   filt.setKey("engorde")
                //   console.log(cont)
                //   if(cont>0){
                //     tab.addItem(new IconTabSeparator({
                //       icon: "sap-icon://open-command-field"
                //     }))
                //     console.log("entré")
                //   }
                //   cont++
                //   tab.addItem(filt)
                // }
                // if(localStorage.getItem("broilerEviction")){
                //   filt= new IconTabFilter({
                //     text:"Desalojo",
                //     content:sap.ui.xmlfragment("dailyMonitor.view.stages.broilerEviction", this)
                //   })
                //   filt.setKey("desalojo")
                //   console.log(cont)
                //   if(cont>0){
                //     tab.addItem(new IconTabSeparator({
                //       icon: "sap-icon://open-command-field"
                //     }))
                //     console.log("entré")
                //   }
                //   cont++
                //   tab.addItem(filt)
                // }
                // console.log(cont)

            },

            reloadPartnership: function(){
                let util = this.getModel("util");
                let that = this;
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

                    /*Envía la solicitud*/
                    this.sendRequest.call(this, url, method, data, getPartnership, error, error);
                });
            },

            onRead: async function(index) 
            {
                let fecha2 = new Date();
                let fecha = "'"+fecha2.getFullYear()+"-"+(fecha2.getMonth()+1)+"-"+fecha2.getDate()+"'";
                let process_info = await this.processInfo(fecha, fecha);
                console.log(process_info);
                let mdLiftbreedingMonitor = this.getModel("mdLiftbreedingMonitor"),
                    mdbreedingMonitor = this.getModel("mdbreedingMonitor"),
                    mdIncubatorMonitor = this.getModel("mdIncubatorMonitor"),
                    mdBroilerMonitor = this.getModel("mdBroilerMonitor"),
                    mdBroilerEvictionMonitor = this.getModel("mdBroilerEvictionMonitor");

                mdLiftbreedingMonitor.setProperty("/records", process_info.data);
                mdbreedingMonitor.setProperty("/records", process_info.data);
                mdIncubatorMonitor.setProperty("/records", process_info.data);
                mdBroilerMonitor.setProperty("/records", process_info.data);
                mdBroilerEvictionMonitor.setProperty("/records", process_info.data);

                /*console.log("El modelo mdLiftbreedingMonitor:")
      console.log(mdLiftbreedingMonitor)
      console.log("El modelo mdbreedingMonitor:")
      console.log(mdbreedingMonitor)
      console.log("El modelo mdIncubatorMonitor:")
      console.log(mdIncubatorMonitor)
      console.log("El modelo mdBroilerMonitor:")
      console.log(mdBroilerMonitor)
      console.log("El modelo mdBroilerEvictionMonitor:")
      console.log(mdBroilerEvictionMonitor)*/
            },

            change: function(oEvent)
            {
                var date = oEvent.getParameter ("value");

                let mdLiftbreedingMonitor = this.getModel("mdLiftbreedingMonitor"),
                    mdbreedingMonitor = this.getModel("mdbreedingMonitor"),
                    mdIncubatorMonitor = this.getModel("mdIncubatorMonitor"),
                    mdBroilerMonitor = this.getModel("mdBroilerMonitor"),
                    mdBroilerEvictionMonitor = this.getModel("mdBroilerEvictionMonitor");

                mdLiftbreedingMonitor.setProperty("/date", date);
                mdbreedingMonitor.setProperty("/date", date);
                mdIncubatorMonitor.setProperty("/date", date);
                mdBroilerMonitor.setProperty("/date", date);
                mdBroilerEvictionMonitor.setProperty("/date", date);
            },
            change: function(oEvent)
            {
                var date = oEvent.getParameter ("value");

                let mdLiftbreedingMonitor = this.getModel("mdLiftbreedingMonitor"),
                    mdbreedingMonitor = this.getModel("mdbreedingMonitor"),
                    mdColdRoomMonitor = this.getModel("mdColdRoomMonitor"),
                    mdIncubatorMonitor = this.getModel("mdIncubatorMonitor"),
                    mdBroilerMonitor = this.getModel("mdBroilerMonitor"),
                    mdBroilerEvictionMonitor = this.getModel("mdBroilerEvictionMonitor");

                mdLiftbreedingMonitor.setProperty("/date", date);
                mdbreedingMonitor.setProperty("/date", date);
                mdColdRoomMonitor.setProperty("/date", date);
                mdIncubatorMonitor.setProperty("/date", date);
                mdBroilerMonitor.setProperty("/date", date);
                mdBroilerEvictionMonitor.setProperty("/date", date);
            },
            cleanTabs: function(oEvent)
            {
                let mdLiftbreedingMonitor = this.getModel("mdLiftbreedingMonitor"),
                mdbreedingMonitor = this.getModel("mdbreedingMonitor"),
                mdColdRoomMonitor = this.getModel("mdColdRoomMonitor"),
                mdIncubatorMonitor = this.getModel("mdIncubatorMonitor"),
                mdBroilerMonitor = this.getModel("mdBroilerMonitor"),
                mdBroilerEvictionMonitor = this.getModel("mdBroilerEvictionMonitor");

                mdLiftbreedingMonitor.setProperty("/records",[]);
                mdbreedingMonitor.setProperty("/records",[]);
                mdColdRoomMonitor.setProperty("/records",[]);
                mdIncubatorMonitor.setProperty("/records",[]);
                mdBroilerMonitor.setProperty("/records",[]);
                mdBroilerEvictionMonitor.setProperty("/records",[]);

                this.getView().byId("scheduled_date_fb1").setValue("")
                this.getView().byId("scheduled_date_fb1_1").setValue("");
                this.getView().byId("scheduled_date_fb2").setValue("");
                this.getView().byId("scheduled_date_fb2_2").setValue("");
                this.getView().byId("scheduled_date_fb6").setValue("");
                this.getView().byId("scheduled_date_fb6_6").setValue("");
                this.getView().byId("scheduled_date_fb3").setValue("");
                this.getView().byId("scheduled_date_fb3_3").setValue("");
                this.getView().byId("scheduled_date_fb4").setValue("");
                this.getView().byId("scheduled_date_fb4_4").setValue("");
                this.getView().byId("scheduled_date_fb5").setValue("");
                this.getView().byId("scheduled_date_fb5_5").setValue("");
            },
            change2: function(oEvent)
            {
                var date = oEvent.getParameter ("value");

                let mdLiftbreedingMonitor = this.getModel("mdLiftbreedingMonitor"),
                    mdbreedingMonitor = this.getModel("mdbreedingMonitor"),
                    mdColdRoomMonitor = this.getModel("mdColdRoomMonitor"),
                    mdIncubatorMonitor = this.getModel("mdIncubatorMonitor"),
                    mdBroilerMonitor = this.getModel("mdBroilerMonitor"),
                    mdBroilerEvictionMonitor = this.getModel("mdBroilerEvictionMonitor");

                mdLiftbreedingMonitor.setProperty("/date2", date);
                mdbreedingMonitor.setProperty("/date2", date);
                mdColdRoomMonitor.setProperty("/date2", date);
                mdIncubatorMonitor.setProperty("/date2", date);
                mdBroilerMonitor.setProperty("/date2", date);
                mdBroilerEvictionMonitor.setProperty("/date2", date);
            },

            onPress: async function()
            { 
                var scheduled_date_fb1,
                    scheduled_date_fb2;
                if(this.getView().byId("tabBar").getSelectedKey()=="ktabLiftBreeding"){
                    scheduled_date_fb1 = this.getView().byId("scheduled_date_fb1").getValue();
                    scheduled_date_fb2 = this.getView().byId("scheduled_date_fb1_1").getValue();
                    console.log(scheduled_date_fb1);
                }
                if(this.getView().byId("tabBar").getSelectedKey()=="ktabBreeding"){
                    scheduled_date_fb1 = this.getView().byId("scheduled_date_fb2").getValue();
                    scheduled_date_fb2 = this.getView().byId("scheduled_date_fb2_2").getValue();
                    console.log(scheduled_date_fb1);
                }
                if(this.getView().byId("tabBar").getSelectedKey()=="ktabColdRoom"){
                    scheduled_date_fb1 = this.getView().byId("scheduled_date_fb6").getValue();
                    scheduled_date_fb2 = this.getView().byId("scheduled_date_fb6_6").getValue();
                    console.log(scheduled_date_fb1);
                }
                if(this.getView().byId("tabBar").getSelectedKey()=="ktabIncubator"){
                    scheduled_date_fb1 = this.getView().byId("scheduled_date_fb3").getValue();
                    scheduled_date_fb2 = this.getView().byId("scheduled_date_fb3_3").getValue();
                    console.log(scheduled_date_fb1);
                }
                if(this.getView().byId("tabBar").getSelectedKey()=="ktabBroiler"){
                    scheduled_date_fb1 = this.getView().byId("scheduled_date_fb4").getValue();
                    scheduled_date_fb2 = this.getView().byId("scheduled_date_fb4_4").getValue();
                    console.log(scheduled_date_fb1);
                }
                if(this.getView().byId("tabBar").getSelectedKey()=="ktabBroilerEviction"){
                    scheduled_date_fb1 = this.getView().byId("scheduled_date_fb5").getValue();
                    scheduled_date_fb2 = this.getView().byId("scheduled_date_fb5_5").getValue();
                    console.log(scheduled_date_fb1);
                }

                if (scheduled_date_fb1 === null || scheduled_date_fb1== "" || scheduled_date_fb2 === null || scheduled_date_fb2== "" ){
                    // console.log("fechas vacias")
                    MessageToast.show("No se pueden consultar fechas vacías", {
                        duration: 3000,
                        width: "20%"
                    });
                }else{
                    let process_info = await this.processInfo(scheduled_date_fb1, scheduled_date_fb2);

                    let mdLiftbreedingMonitor = this.getModel("mdLiftbreedingMonitor"),
                        mdbreedingMonitor = this.getModel("mdbreedingMonitor"),
                        mdColdRoomMonitor = this.getModel("mdColdRoomMonitor"),
                        mdIncubatorMonitor = this.getModel("mdIncubatorMonitor"),
                        mdBroilerMonitor = this.getModel("mdBroilerMonitor"),
                        mdBroilerEvictionMonitor = this.getModel("mdBroilerEvictionMonitor");

                    mdLiftbreedingMonitor.setProperty("/date", scheduled_date_fb1);
                    mdbreedingMonitor.setProperty("/date", scheduled_date_fb1);
                    mdColdRoomMonitor.setProperty("/date", scheduled_date_fb1);
                    mdIncubatorMonitor.setProperty("/date", scheduled_date_fb1);
                    mdBroilerMonitor.setProperty("/date", scheduled_date_fb1);
                    mdBroilerEvictionMonitor.setProperty("/date", scheduled_date_fb1);

                    mdLiftbreedingMonitor.setProperty("/records", process_info[0].data);
                    mdbreedingMonitor.setProperty("/records", process_info[1].data);
                    mdColdRoomMonitor.setProperty("/records", process_info[2].data);
                    mdIncubatorMonitor.setProperty("/records", process_info[3].data);
                    mdBroilerMonitor.setProperty("/records", process_info[4].data);
                    mdBroilerEvictionMonitor.setProperty("/records", process_info[5].data);
                }

      

                /*console.log("El modelo mdLiftbreedingMonitor:")
      console.log(mdLiftbreedingMonitor)
      console.log("El modelo mdbreedingMonitor:")
      console.log(mdbreedingMonitor)
      console.log("El modelo mdIncubatorMonitor:")
      console.log(mdIncubatorMonitor)
      console.log("El modelo mdBroilerMonitor:")
      console.log(mdBroilerMonitor)
      console.log("El modelo mdBroilerEvictionMonitor:")
      console.log(mdBroilerEvictionMonitor)*/
            },

            getPromise : function(url, fecha, fecha2, stage_id) 
            {
                var mdpartnership = this.getView().getModel("ospartnership");
                let partnership_id = mdpartnership.getProperty("/records")[this.index].partnership_id,
                    scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
                return fetch(url, 
                    {
                        method : "POST",
                        headers: {
                            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        body: "fecha=" + fecha + "&fecha2=" + fecha2 + "&stage_id=" + stage_id + "&partnership_id=" + partnership_id + "&scenario_id=" + scenario_id
                    })
                    .then(response => response.json());
            },

            processInfo: async function(fecha, fecha2) 
            {
                let response = await Promise.all([
                    this.getPromise("/dailyMonitor/findLiftBreedingMonitor", fecha, fecha2, liftBreeding),
                    this.getPromise("/dailyMonitor/findBreedingMonitor", fecha, fecha2, breeding),
                    this.getPromise("/dailyMonitor/findColdRoom", fecha, fecha2, breeding),
                    this.getPromise("/dailyMonitor/findIncubatorMonitor", fecha, fecha2),
                    this.getPromise("/dailyMonitor/findBroilerMonitor", fecha, fecha2),  
                    this.getPromise("/dailyMonitor/findBroilerEvictionMonitor", fecha, fecha2), 
                ]);
                console.log(response);
                return response;
            },

            activeScenario: function() 
            {
                let util = this.getModel("util"),
                    mdscenario = this.getModel("mdscenario"),
                    that = this;
      
                const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/activeScenario");
                console.log(serverName);
                return new Promise((resolve, reject) => 
                {
                    fetch(serverName)
                        .then(
                            function(response) 
                            {
                                if (response.status !== 200) 
                                {
                                    console.log("Looks like there was a problem. Status Code: " +
                response.status);
                                    return;
                                }
                                response.json().then(function(res) 
                                {
                                    console.log(res);
                                    resolve(res);
                                });
                            }
                        )
                        .catch(function(err) 
                        {
                            console.log("Fetch Error :-S", err);
                        });
                });
            },

            showProgrammedLots: async function(oEvent) {
                const mdIncubatorMonitor = this.getView().getModel("mdIncubatorMonitor");
                const programming = oEvent.getSource().getBindingContext("mdIncubatorMonitor").getObject();
                console.log(programming);
                const link = oEvent.getSource();
                const response = await fetch("/programmed_eggs/findColdRoomsLotByProgramming", {
                    headers: {
                        "Content-type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        programmed_eggs_id: programming.programmed_eggs_id
                    })
                });
    
                if (!response.ok) {
                    console.log("error");
                    console.log(response);
                }
                else {
                    const res = await response.json();
                    mdIncubatorMonitor.setProperty("/popover", res.data);
                    console.log(mdIncubatorMonitor.getProperty("/popover"));
                    this.programmedPopover.openBy(link);
                }
    
                // programmed_eggs/findAllDateQuantityFarmProduct
            },
        });
});
