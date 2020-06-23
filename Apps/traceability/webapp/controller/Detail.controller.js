sap.ui.define([
  "traceability/controller/BaseController",
  'jquery.sap.global',
  'sap/ui/model/Filter',
  'sap/ui/core/Fragment',
  'sap/ui/model/json/JSONModel',
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Text"
], function (BaseController, jQuery, Filter, Fragment, JSONModel, MessageToast, Dialog, Button, Text) {
  "use strict";
  const incubatorStage = 2; /*Clase para levante y Cria*/
  return BaseController.extend("traceability.controller.Detail", {

    onInit: function () {

      this.setFragments();
      this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function (oEvent) {
      var oArguments = oEvent.getParameter("arguments");

      this.index = oArguments.id;

      this.housingPopover = sap.ui.xmlfragment("traceability.view.popovers.HousingPopover", this)
      this.getView().addDependent(this.housingPopover);
  
      this.incubatorPopover = sap.ui.xmlfragment("traceability.view.popovers.IncubatorPopover", this)
      this.getView().addDependent(this.incubatorPopover);

      this.broilerPopover = sap.ui.xmlfragment("traceability.view.popovers.BroilerPopover", this)
      this.getView().addDependent(this.broilerPopover);
  

      let oView= this.getView();
      let ospartnership = this.getModel("ospartnership"),
        mdprojected = this.getModel("mdprojected");
      
      mdprojected.setProperty("/records", []);
      oView.byId("numberL").setValue("");
      // oView.byId("tabBar").setSelectedKey("__page1");
      oView.byId("projectedTable").addEventDelegate({
        onAfterRendering: oEvent=>{
            console.log("victor te amo!")
        }
    })
    
    
    
    
    
    
    
    if(ospartnership.getProperty("/records").length>0){
        let partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id")
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
                    console.log("err: ", data)
                }
            }
            else{
                MessageToast.show("ha ocurrido un error al cargar el inventario", {
                    duration: 3000,
                    width: "35%"
                });
                console.log("err: ", data)
            }
        });
    }

      this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
      this.onRead(this.index);
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
          };

          function error(err) {
              console.log(err);
              ospartnership.setProperty("/selectedRecords/", []);
              util.setProperty("/error/status", err.status);
              util.setProperty("/error/statusText", err.statusText);
              reject(err);
          };

          /*Envía la solicitud*/
          this.sendRequest.call(this, url, method, data, getPartnership, error, error);
      });
  },

    onRead: async function (index) {
      let ospartnership = this.getModel("ospartnership"),
        mdscenario = this.getModel("mdscenario"),
        mdparameter_breed = this.getModel("mdparameter_breed"),
        oView = this.getView();

     
     
      let partnership_id = ospartnership.getProperty("/records/" + this.index + "/partnership_id"),
        activeS = await this.activeScenario()

      mdscenario.setProperty("/scenario_id", activeS.scenario_id);
      mdscenario.setProperty("/name", activeS.name);

      ospartnership.setProperty("/selectedRecordPath/", "/records/" + index);
      ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));

      //let isFarmLoad = await this.onFarmLoad();
      //let isBreedLoad = await this.onBreedLoad();
      //let pERP = await this.pruebaERP();
      //console.log(JSON.parse(pERP.data));
      //let records_pb = await this.onParameterBreed();
      //mdparameter_breed.setProperty("/records", records_pb.data);
      //console.log(mdparameter_breed);

      

      let util = this.getModel("util"),
        that = this,
        mdprojected = this.getModel("mdprojected"),
        mdprogrammed = this.getModel("mdprogrammed");

     

    },
    validateIntInput: function (o) {
      let input = o.getSource();
      let length = 5;
      let value = input.getValue()
      let regex = new RegExp(`/^[0-9]{1,${length}}$/`)

      if (regex.test(value)) {
        console.log()
        return true
      }
      else {
        let aux = value
          .split('')
          .filter(char => {
            if (/^[0-9]$/.test(char)) {
              if (char !== '.') {
                return true
              }
            }
          })
          .join('')
        value = aux.substring(0, length)
        input.setValue(value)
        return false
      }
    

    },

    onChangeType: async function() {
      
      let mdtraceability= this.getModel("traceability");
      let ty = this.getView().byId("SelectType").getSelectedKey()

      console.log("el sel")
      console.log(ty)

      if (ty === "SAP") {
        mdtraceability.setProperty("/isVisible", false);
        
      }
      else{
        mdtraceability.setProperty("/isVisible", true);
      }
      
    


     
    },

    setColumnsVisible: function(stage, sel){
      let mdprojected = this.getView().getModel("mdprojected"),
          type = this.getView().byId("SelectType").getSelectedKey();


      mdprojected.setProperty("/visibleTable",true);
      if(type === "SAP"){
        console.log("here i am, rock you like a hurricane")
        mdprojected.setProperty("/visibleP",true);
        mdprojected.setProperty("/visibleC",true);
        mdprojected.setProperty("/visibleH",true);
        mdprojected.setProperty("/visibleI",true);
        mdprojected.setProperty("/visibleE",true);
        mdprojected.refresh(true)
      }else{
        if(sel==="progresiva"){
          switch (stage) {
            case 'C':
              mdprojected.setProperty("/visibleP",true);
              mdprojected.setProperty("/visibleC",false);
              mdprojected.setProperty("/visibleH",true);
              mdprojected.setProperty("/visibleI",true);
              mdprojected.setProperty("/visibleE",true);
              mdprojected.setProperty("/visibleEH",true);
              console.log('El kilogramo de Naranjas cuesta $0.59.');
              break;
            case 'P':
              mdprojected.setProperty("/visibleC",false);
              mdprojected.setProperty("/visibleP",false);
              mdprojected.setProperty("/visibleH",true);
              mdprojected.setProperty("/visibleI",true);
              mdprojected.setProperty("/visibleE",true);
              mdprojected.setProperty("/visibleEH",true);
              console.log('El kilogramo de Naranjas cuesta $0.59.');
              break;
            case 'H':
              mdprojected.setProperty("/visibleC",false);
              mdprojected.setProperty("/visibleP",false);
              mdprojected.setProperty("/visibleH",false);
              mdprojected.setProperty("/visibleI",true);
              mdprojected.setProperty("/visibleE",true);
              mdprojected.setProperty("/visibleEH",true);
              console.log('El kilogramo de Manzanas cuesta $0.32.');
              break;
            case 'I':
              mdprojected.setProperty("/visibleC",false);
              mdprojected.setProperty("/visibleP",false);
              mdprojected.setProperty("/visibleH",false);
              mdprojected.setProperty("/visibleI",false);
              mdprojected.setProperty("/visibleE",true);
              mdprojected.setProperty("/visibleEH",true);
              console.log('El kilogramo de Bananas cuesta $0.48.');
              break;
            case 'E':
              mdprojected.setProperty("/visibleC",false);
              mdprojected.setProperty("/visibleP",false);
              mdprojected.setProperty("/visibleH",false);
              mdprojected.setProperty("/visibleI",false);
              mdprojected.setProperty("/visibleE",false);
              mdprojected.setProperty("/visibleEH",true);
              console.log('El kilogramo de Cerezas cuesta $3.00.');
              break;
            case 'D':
              mdprojected.setProperty("/visibleC",false);
              mdprojected.setProperty("/visibleP",false);
              mdprojected.setProperty("/visibleH",false);
              mdprojected.setProperty("/visibleI",false);
              mdprojected.setProperty("/visibleE",false);
              mdprojected.setProperty("/visibleEH",false);
              console.log('El kilogramo de Cerezas cuesta $3.00.');
              break;
            default:
              mdprojected.setProperty("/visibleC",false);
              mdprojected.setProperty("/visibleP",false);
              mdprojected.setProperty("/visibleH",false);
              mdprojected.setProperty("/visibleI",true);
              mdprojected.setProperty("/visibleE",true);
              mdprojected.setProperty("/visibleEH",true);
              console.log('Lo lamentamos, por el momento no disponemos de ' + stage + '.');
          }
        }else{
          switch (stage) {
            case 'C':
              mdprojected.setProperty("/visibleP",false);
              mdprojected.setProperty("/visibleC",false);
              mdprojected.setProperty("/visibleH",false);
              mdprojected.setProperty("/visibleI",false);
              mdprojected.setProperty("/visibleE",false);
              break;
            case 'P':
              mdprojected.setProperty("/visibleC",true);
              mdprojected.setProperty("/visibleP",false);
              mdprojected.setProperty("/visibleH",false);
              mdprojected.setProperty("/visibleI",false);
              mdprojected.setProperty("/visibleE",false);
              break;
            case 'H':
              mdprojected.setProperty("/visibleC",true);
              mdprojected.setProperty("/visibleP",true);
              mdprojected.setProperty("/visibleH",false);
              mdprojected.setProperty("/visibleI",false);
              mdprojected.setProperty("/visibleE",false);
              break;
            case 'I':
              mdprojected.setProperty("/visibleC",true);
              mdprojected.setProperty("/visibleP",true);
              mdprojected.setProperty("/visibleH",true);
              mdprojected.setProperty("/visibleI",false);
              mdprojected.setProperty("/visibleE",false);
              break;
            case 'E':
              mdprojected.setProperty("/visibleC",true);
              mdprojected.setProperty("/visibleP",true);
              mdprojected.setProperty("/visibleH",true);
              mdprojected.setProperty("/visibleI",true);
              mdprojected.setProperty("/visibleE",false);
              break;
            case 'D':
              mdprojected.setProperty("/visibleC",true);
              mdprojected.setProperty("/visibleP",true);
              mdprojected.setProperty("/visibleH",true);
              mdprojected.setProperty("/visibleI",true);
              mdprojected.setProperty("/visibleE",true);
              mdprojected.setProperty("/visibleEH",false);
              break;
            default:
              mdprojected.setProperty("/visibleC",false);
              mdprojected.setProperty("/visibleP",false);
              mdprojected.setProperty("/visibleH",false);
              mdprojected.setProperty("/visibleI",false);
              mdprojected.setProperty("/visibleE",false);
            }
        }
      }
    },

    findLot: async function() { 
      console.log("entro en el find lot")
      let that = this,
            mdprojected = this.getModel("mdprojected"),
            partnership_id = this.getView().getModel("ospartnership").getProperty("/records/" + this.index + "/partnership_id"),
            util = this.getModel("util"),
            prefijo = this.getView().byId("SelectStage").getSelectedKey(),
            sel = this.getView().byId("SelectPR").getSelectedKey(),
            cant = this.getView().byId("numberL").mProperties.value,

            activeS = await this.activeScenario(),
            scenario_id = activeS.scenario_id;

            let ty = this.getView().byId("SelectType").getSelectedKey()

      console.log("el sel")
      console.log(ty)
      this.setColumnsVisible(prefijo, sel)
      
        console.log("NO es con sap")
        console.log(prefijo)
        console.log(cant)
        console.log(sel)

        let serverName = "/traceability";

        const response = await fetch(serverName, {
          headers: {
            'Content-type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            pref: prefijo,
            lot: cant,
            type: sel,
            sap: ty === 'SAP',
            partnership_id: partnership_id,
            scenario_id: scenario_id
          })
        })

        if (!response.ok) {
          console.log('Looks like there was a problem. Status Code: ' + response.status)
          mdprojected.setProperty('/records', [])
          return
        }else{console.log("asd")}

        if(response.status === 204){
          mdprojected.setProperty('/records', []);
          MessageToast.show("El lote no existe para la empresa seleccionada", {
            duration: 3000,
            width: "20%"
        });
        }else{
          const res = await response.json()
          console.log(res)
          const items = []
          if (sel === 'regresiva') {
            this.formatResponseBackToFront(res, items)
          }
          else {
            console.log("La res::::",res)
            this.formatResponseFrontToBack(res, items)
          }
          console.log(items)
          mdprojected.setProperty('/records', items)

        }
      



            


    },


    activeScenario: function() {

      let util = this.getModel("util"),
        mdscenario = this.getModel("mdscenario"),
        that = this;
      const serverName = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/activeScenario");

      return new Promise((resolve, reject) => {
        fetch(serverName)
          .then(
            function(response) {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status);
                return;
              }

              response.json().then(function(res) {
                resolve(res);
              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error :-S', err);
          });

      });
    },

    OnChangeStage: function(){
      let stage = this.getView().byId("SelectStage").getSelectedKey(),
          sel = this.getView().byId("SelectPR").getSelectedKey(),
          mdprojected = this.getView().getModel("mdprojected");

      if(stage === 'C' || stage === 'X' || stage === 'A'){
        this.getView().byId("SelectPR").setSelectedKey("progresiva");
        mdprojected.setProperty("/available",false);
      }else{
        if(stage === 'D' || stage === 'E'){
          this.getView().byId("SelectPR").setSelectedKey("regresiva");
          mdprojected.setProperty("/available",false);
        }else{
          mdprojected.setProperty("/available",true);
        }
      }
    },

    formatResponseBackToFront: function(node, arr, obj = {}, count = 1) {
      obj[node.stage] = node.lot

      if (node.predecessors.length > 0) {
        count = 1
        for (const lot of node.predecessors) {
          console.log(lot.lot)
          this.formatResponseBackToFront(lot, arr, obj, count)
          count++
          obj[node.stage] = '-'
        }
      }
      else {
        if (count === 1) {
          arr.push({...obj})
        }
        else {
          arr.push({liftbreading: node.lot, production: '-', incubation: '-', broiler: '-', broilerHeavy: '-',  eggs: '-'})
        }
      }
    },
    
    formatResponseFrontToBack: function(node, arr, obj = {liftbreading: '-', production: '-', incubation: '-', broiler: '-', broilerHeavy: '-',  eggs: '-'}, count = 1) {
      obj[node.stage] = node.lot
console.log(node.successsor, node)
      if (node.successor.length > 0) {
        count = 1
        for (const lot of node.successor) {
          console.log(lot.lot)
          this.formatResponseFrontToBack(lot, arr, obj, count)
          // count++
        }
      }
      else {
        console.log('nueva fila')
        obj[node.stage] = node.lot

        arr.push({...obj})

        obj.production = '-'
        obj.incubation = '-'
        obj.broiler = '-'
        obj.broilerHeavy = '-'
        obj.eggs = '-'
      }
    },

    showLotLocationLiftBreading: async function(oEvent) {
      const mdprojected = this.getView().getModel('mdprojected')
      const object = oEvent.getSource().getBindingContext('mdprojected').getObject()
      const link = oEvent.getSource(),
        activeS = await this.activeScenario(),
        scenario_id = activeS.scenario_id;
      
      console.log(object)
      if (object.liftbreading !== '-' && object.liftbreading !== '') {
        const result = await fetch('/traceability/findLotLocation', {
          headers: {
            'Content-type' : 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            lot: object.liftbreading,
            scenario_id: scenario_id
          })
        })
  
        if (!result.ok) {
          console.log('error with status - ', result.status)
          return
        }
  
        const res = await result.json()
  
        mdprojected.setProperty('/popover/farm', res.granja)
        mdprojected.setProperty('/popover/shed', res.galpon)
        this.housingPopover.openBy(link)
      }
    },

    showLotLocationProduction: async function(oEvent) {
      const mdprojected = this.getView().getModel('mdprojected')
      const object = oEvent.getSource().getBindingContext('mdprojected').getObject()
      const link = oEvent.getSource(),
        activeS = await this.activeScenario(),
        scenario_id = activeS.scenario_id;
      
      console.log(object)

      if (object.production !== '-' && object.production !== '') {
        
        const result = await fetch('/traceability/findLotLocation', {
          headers: {
            'Content-type' : 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            lot: object.production,
            scenario_id: scenario_id
          })
        })
  
        if (!result.ok) {
          console.log('error with status - ', result.status)
          return
        }
  
        const res = await result.json()
  
        mdprojected.setProperty('/popover/farm', res.granja)
        mdprojected.setProperty('/popover/shed', res.galpon)
        this.housingPopover.openBy(link)
      }
    },

    showLotLocationIncubation: async function(oEvent) {
      const mdprojected = this.getView().getModel('mdprojected')
      const object = oEvent.getSource().getBindingContext('mdprojected').getObject()
      const link = oEvent.getSource(),
        activeS = await this.activeScenario(),
        scenario_id = activeS.scenario_id;
      
      console.log(object)

      if (object.incubation !== '-' && object.incubation !== '') {
        
        const result = await fetch('/traceability/findLotLocation', {
          headers: {
            'Content-type' : 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            lot: object.incubation,
            scenario_id: scenario_id
          })
        })
  
        if (!result.ok) {
          console.log('error with status - ', result.status)
          return
        }
  
        const res = await result.json()
  
        mdprojected.setProperty('/popover', res)
        this.incubatorPopover.openBy(link)
      }
    },


    showLotLocationBroiler: async function(oEvent) {
      const mdprojected = this.getView().getModel('mdprojected')
      const object = oEvent.getSource().getBindingContext('mdprojected').getObject()
      const link = oEvent.getSource(),
        activeS = await this.activeScenario(),
        scenario_id = activeS.scenario_id;
      
      console.log(object)

      if (object.broiler !== '-' && object.broiler !== '') {
        
        const result = await fetch('/traceability/findLotLocation', {
          headers: {
            'Content-type' : 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            lot: object.broiler,
            scenario_id: scenario_id
          })
        })
  
        if (!result.ok) {
          console.log('error with status - ', result.status)
          return
        }
  
        const res = await result.json()
  
        mdprojected.setProperty('/popover', res)
        this.broilerPopover.openBy(link)
      }
    },

    showLotLocationBroilerHeavy: async function(oEvent) {
      const mdprojected = this.getView().getModel('mdprojected')
      const object = oEvent.getSource().getBindingContext('mdprojected').getObject()
      const link = oEvent.getSource(),
        activeS = await this.activeScenario(),
        scenario_id = activeS.scenario_id;
      
      console.log(object)

      if (object.broiler !== '-' && object.broiler !== '') {
        
        const result = await fetch('/traceability/findLotLocation', {
          headers: {
            'Content-type' : 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            lot: object.broilerHeavy,
            scenario_id: scenario_id
          })
        })
  
        if (!result.ok) {
          console.log('error with status - ', result.status)
          return
        }
  
        const res = await result.json()
  
        mdprojected.setProperty('/popover', res)
        this.broilerPopover.openBy(link)
      }
    }

  });
});
