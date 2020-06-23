sap.ui.define([
  "higherLayer/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  'sap/m/MessageToast',
  "sap/m/Dialog",
  "sap/m/Text",
  "sap/m/Button"
], function (BaseController, JSONModel, MessageToast, Dialog, Text, Button) {
  "use strict";

  return BaseController.extend("higherLayer.controller.AppsControllers.posturecurve", {


    onInit: function () {

      this.setFragments();
      this.getRouter().getRoute("posturecurve").attachPatternMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function (oEvent) {
      var oArguments = oEvent.getParameter("arguments");
      this.getView().getParent().getParent().setMode("HideMode");
      this.getView().getParent().getParent().setMode("ShowHideMode");
      this.getView().getParent().getParent().setMode("HideMode");
      this.index = oArguments.id;


      let ospartnership = this.getModel("ospartnership");



      if (ospartnership.getProperty("/records").length > 0) {
        let partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id")
        this.onRead(partnership_id);
      }
      else {
        this.reloadPartnership()
          .then(data => {
            if (data.length > 0) {
              let obj = ospartnership.getProperty("/selectedRecords/");
              if (obj) {
                this.onRead(obj.partnership_id);
              }
              else {
                MessageToast.show("No existen empresas cargadas en el sistema", {
                  duration: 3000,
                  width: "20%"
                });
                console.log("err: ", data)
              }
            }
            else {
              MessageToast.show("Ha ocurrido un error al cargar el inventario", {
                duration: 3000,
                width: "35%"
              });
              console.log("err: ", data)
            }
          });
      }

      // var firstItem = this.getView().getModel("ospartnership").getProperty("/records/0");
      // var Oid = firstItem.getBindingContext("ospartnership").getPath().split("/");
      // var id = Oid[2];
      // console.log(id)

      // if (firstItem) {
      //   var one_item = firstItem.getBindingContext("ospartnership").getObject().partnership_id;
      //   this.getRouter().navTo("detail", {
      //     partnership_id: one_item,
      //     id: id
      //   }, false);
      // }
      console.log("djdhdjhdj")
      this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
      this.onRead(this.index);
      this.getModel("posturecurve").setProperty("/PosturecurveMain", { farm_id: null, breed_id: null, init_date: undefined, end_date: undefined, scenario_id: null, lot:null })
      this.getModel("posturecurve").setProperty("/PosturecurveTable", {})

      this.EnterCall()
     
    },
    
    EnterCall: async function () {
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      fetch("/higherLayer/findScenarioBreedAndFarms", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          partnership_id: partnership_id,
          farm_type_id: 1,
          stage_id: 3
        })
      })
        .then(response => {
          console.log(response)

          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
            res.farms.unshift({ name: "Granja", farm_id: null })
            res.breed.unshift({ name: "Raza", breed_id: null })
            res.lots.unshift({ lot: "Lotes",max_date:"2099-03-04T04:00:00.000Z",min_date:"1900-03-04T04:00:00.000Z" })
            const result = res.scenarios.filter(word => word.status === 1);
            // if(res.scenarios.length!==1){
            //   res.scenarios.unshift({ name: "Escenario", scenario_id: res.scenarios[0].scenario_id})
            // }
            this.getModel("posturecurve").setProperty("/breeds", res.breed)
            this.getModel("posturecurve").setProperty("/farms", res.farms)
            this.getModel("posturecurve").setProperty("/lots", res.lots)
            this.getModel("posturecurve").setProperty("/scenarios", res.scenarios)
            this.getModel("posturecurve").setProperty("/PosturecurveMain/scenario_id", res.scenarios[0].scenario_id)
          });


        })
        .catch(err => console.log);
    },
    onRead: async function (index) {
      let ospartnership = this.getModel("ospartnership"),
        mdscenario = this.getModel("mdscenario")
      //   activeS = await this.activeScenario();
      console.log("djdhdjhdj")
      // mdscenario.setProperty("/scenario_id", activeS.scenario_id);
      // mdscenario.setProperty("/name", activeS.name);
      ospartnership.setProperty("/selectedRecordPath/", "/records/" + index);
      ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));
    },

    
    Loadlots: async function (index) {
      let data = this.getModel("posturecurve").getProperty("/PosturecurveMain")
      data.farm_id = parseInt(data.farm_id)
      data.breed_id = parseInt(data.breed_id)
      data.scenario_id = parseInt(data.scenario_id)
      console.log(data)
      fetch("/sltxPostureCurve/findPostureCurveLot", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(data)
      })
        .then(response => {
          console.log(response)

          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
           
            res.data.unshift({ lot: "Lotes",max_date:"2999-03-04T04:00:00.000Z",min_date:"1900-03-04T04:00:00.000Z" })
            this.getModel("posturecurve").setProperty("/lots", res.data)

            if (res.data.length<= 1){
              MessageToast.show("No existen lotes para los parametros ingresados");
              this.getView().byId("selectlot").setEnabled(false)
            }else{
              this.getView().byId("selectlot").setEnabled(true)
            }
           
            // if(res.scenarios.length!==1){
            //   res.scenarios.unshift({ name: "Escenario", scenario_id: res.scenarios[0].scenario_id})
            // }
            // this.getModel("posturecurve").setProperty("/breeds", res.breed)
            // this.getModel("posturecurve").setProperty("/farms", res.farms)
            // this.getModel("posturecurve").setProperty("/scenarios", res.scenarios)
            // this.getModel("posturecurve").setProperty("/PosturecurveMain/scenario_id", res.scenarios[0].scenario_id)

          });


        })
        .catch(err => console.log);
    },

    LoadProduction: function (oEvent) {
      let data = this.getModel("posturecurve").getProperty("/PosturecurveMain")
      console.log("data",data)
      let savedate = data.date1,
        savedate2 = data.date2,
        that = this,
        ospartnership = this.getModel("ospartnership"),
        partnership_id = ospartnership.getProperty("/selectedRecord/partnership_id"),
        aja = [], date2 = []

    
      console.log("Partnership_id:::::", partnership_id)
      // if (data.date1 === undefined) {
      //   aja = null
      // } else {
      //   aja = data.date1.split("-")
      //   aja = aja[2] + "-" + aja[1] + "-" + aja[0]
      // }
      // if (data.date2 === undefined) {
      //   date2 = null
      // } else {
      //   date2 = data.date2.split("-")
      //   date2 = date2[2] + "-" + date2[1] + "-" + date2[0]
      // }

      if (data.date1 == "") {
        data.date1 = null

      }

      if (data.date2 == "") {
        data.date2 = null

      }
      if (data.lot === "Lotes") {
        data.lot = null

      }

      if (data.farm_id === "" || data.farm_id === null || data.farm_id === undefined) {
        data.farm_id = null

      }

      if (data.breed_id === "" || data.breed_id === null || data.breed_id === undefined) {
        data.breed_id = null

      }
      console.log(data)
      let send = {
        farm_id: (data.farm_id),
        breed_id: (data.breed_id),
        init_date: data.date1,
        end_date: data.date2,
        partnership_id: partnership_id,
        scenario_id: parseInt(data.scenario_id),
        lot:  data.lot
      }
      console.log("objeto",send);
      this.getModel("posturecurve").setProperty("/postureMainCopy", send)
      if (data.scenarios_id === undefined && data.breed_id === undefined && send.end_date === null && send.init_date === null && data.farm_id === undefined) {
        MessageToast.show("Ingrese un parámetro de búsqueda");
      } else {
        fetch(" /sltxPostureCurve/findPostureCurve", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(send)
        })
          .then(response => {

            if (response.status !== 200) {

              MessageToast.show("Ingrese un parámetro de búsqueda valido", {
                duration: 3000,
                width: "20%"
              });
              this.getModel("posturecurve").setProperty("/postureMainCopy", send)
              this.getModel("posturecurve").setProperty("/PosturecurveTable", [])
              console.log("Looks like there was a problem. Status Code: " +
                response.status);
              return;
            }
            response.json().then((res) => {
              console.log(res);
              if (res.data.length == 0) {
                MessageToast.show("No se encontraron registros");
              }

              res.data.forEach(function (element) {
                element.thatnumber = that.getNumberWithCommas(element.posture_quantity)
              });
              console.log(res.data)
              this.getModel("posturecurve").setProperty("/PosturecurveTable", res.data)
              this.getModel("posturecurve").setProperty("/postureMainCopy", send)

            });


          })
      }
      data.date1 = savedate,
        data.date2 = savedate2
    },
    getNumberWithCommas: function (number) {
      // console.log(parseInt("1232").toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))

      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },



    minmaxdate: function (oEvent) {
      let data =this.getView().byId("selectlot").getSelectedItem().getBindingContext("posturecurve").getObject()
      console.log(data)
      data.min_date= new Date(data.min_date)
      data.max_date= new Date(data.max_date)
      console.log(data)
      this.getView().getModel("posturecurve").setProperty("/datesminmax",data)
    },



    reloadPartnership: function () {
      let util = this.getModel("util");
      let ospartnership = this.getModel("ospartnership");

      util.setProperty("/busy/", true);
      ospartnership.setProperty("/records", []);

      let url = util.getProperty("/serviceUrl") + util.getProperty("/" + util.getProperty("/service") + "/getPartnership");
      let method = "GET";
      let data = {};
      return new Promise((resolve, reject) => {
        function getPartnership(res) {
          util.setProperty("/busy/", false);
          ospartnership.setProperty("/records/", res.data);
          if (res.data.length > 0) {
            let obj = res.data[0];
            obj.index = 0;
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

    _getResponsivePopover: function () {
      if (!this._oPopover) {
        this._oPopover = sap.ui.xmlfragment("higherLayer.view.components.PartnershipPopOver", this);
        this.getView().addDependent(this._oPopover);
      }
      return this._oPopover;
    },


    handleTitleSelectorPress: function (oEvent) {
      // var _oPopover = this._getResponsivePopover();
      // _oPopover.setModel(oEvent.getSource().getModel());
      // _oPopover.openBy(oEvent.getParameter("domRef"));
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.components.PartnershipPopOver", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },





  });
});
