sap.ui.define([
  "higherLayer/controller/BaseController",
  'jquery.sap.global',
  'sap/ui/model/Filter',
  'sap/ui/core/Fragment',
  'sap/ui/model/json/JSONModel',
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Text",
  "sap/ui/core/Item"
], function (BaseController, jQuery, Filter, Fragment, JSONModel, MessageToast, Dialog, Button, Text, Item) {
  "use strict";
  return BaseController.extend("higherLayer.controller.Detail", {

    onInit: function () {
     
      this.setFragments();
      this.getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function (oEvent) {
      var oArguments = oEvent.getParameter("arguments");
      let pene = this.getModel("ospartnership").getProperty("/")
      this.index = oArguments.id;
      console.log(pene)
      this.getView().getParent().getParent().setMode("HideMode");



      let oView = this.getView();
      let ospartnership = this.getModel("ospartnership");



      if (ospartnership.getProperty("/records").length > 0) {
        let partnership_id = ospartnership.getProperty("/selectedRecords/partnership_id")
        this.onRead(partnership_id);
        console.log(pene)
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
          console.log(pene)
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
      this.onRead(this.index);
      console.log(pene)
    },
    onRead: async function (index) {
      let ospartnership = this.getModel("ospartnership"),
        mdscenario = this.getModel("mdscenario")
      //   activeS = await this.activeScenario();
      console.log("djdhdjhdj")
      // mdscenario.setProperty("/scenario_id", activeS.scenario_id);
      // mdscenario.setProperty("/name", activeS.name);
      console.log(index)
      ospartnership.setProperty("/selectedRecordPath/", "/records/" + index);
      ospartnership.setProperty("/selectedRecord/", ospartnership.getProperty(ospartnership.getProperty("/selectedRecordPath/")));
    },


    reloadPartnership: function () {
      let util = this.getModel("util");
      let ospartnership = this.getModel("ospartnership");
      console.log("aaaaaaaaaaaaaaaaaaa")
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
      console.log("aja")
      var _oPopover = this._getResponsivePopover();
      _oPopover.setModel(oEvent.getSource().getModel());
      _oPopover.openBy(oEvent.getParameter("domRef"));
    },

    handleItemSelect: function (oEvent) {
      var Oid = oEvent.getSource().getBindingContext("ospartnership").getPath().split("/");
      var id = Oid[2];
      this.getRouter().navTo("parameter", {
          partnership_id: oEvent.getSource().getBindingContext("ospartnership").getObject().partnership_id,
          id: id
      }, false /*create history*/ );
    }





  });
});
