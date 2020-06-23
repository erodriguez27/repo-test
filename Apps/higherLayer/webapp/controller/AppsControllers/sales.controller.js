sap.ui.define([
  "higherLayer/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  'sap/m/MessageToast',
  "sap/m/Dialog",
  "sap/m/Text",
  "sap/m/Button"
], function (BaseController, JSONModel, MessageToast, Dialog, Text, Button) {
  "use strict";

  return BaseController.extend("higherLayer.controller.AppsControllers.sales", {


    onInit: function () {

      this.setFragments();
      this.getRouter().getRoute("sales").attachPatternMatched(this._onRouteMatched, this);
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
      // this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
      this.onRead(this.index);
      let savedate = {
        breed_id: null,
      concept: null,
      date1: undefined,
      date2: undefined,
      type: null,
      }
      this.getModel("sales").setProperty("/salesMainCopy", savedate)
      this.getModel("sales").setProperty("/salesMain", {})
      this.getModel("sales").setProperty("/salesTable", {})
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      fetch("/higherLayer/findScenarioBreedAndFarms", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          partnership_id: partnership_id,
          farm_type_id: 3,
          stage_id: 4
        })
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
            res.farms.unshift({ name: "Granja", farm_id: null })
            res.breed.unshift({ name: "Raza", breed_id: null })
            const result = res.scenarios.filter(word => word.status === 1);
            // if(res.scenarios.length!==1){
            //   res.scenarios.unshift({ name: "Escenario", scenario_id: res.scenarios[0].scenario_id})
            // }
            // this.getModel("inventary").setProperty("/activescenariooo", result[0])
            // this.getModel("sales").setProperty("/scenarios", result[0])
            this.getModel("sales").setProperty("/breeds", res.breed)
            this.getModel("sales").setProperty("/farms", res.farms)
            this.getModel("sales").setProperty("/scenariosall", res.scenarios)
            this.getModel("sales").setProperty("/salesMain/scenario_id", res.scenarios[0].scenario_id)
          });


        })
        .catch(err => console.log);
      let that = this
      fetch("/scenario/activeScenario", {
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
              console.log(res)
              that.getView().getModel("inventary").setProperty("/scenarios", res)

            });
          }
        )
        .catch(function (err) {
          console.log("Fetch Error :-S", err);
        });
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

    NewProductionProgrammed: function (oEvent) {
      this.getModel("sales").setProperty("/salesDialog", {})
      let that = this
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      fetch("/higherLayer/findScenarioBreedAndFarms", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          partnership_id: partnership_id,
          farm_type_id: 3,
          stage_id: 4
        })
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);

            this.getModel("sales").setProperty("/breedss", res.breed)
            this.getModel("sales").setProperty("/farms", res.farms)
            this.getModel("sales").setProperty("/scenarios", res.scenarios_all)
          });


        })
        .catch(err => console.log);

      this.formProjected = sap.ui.xmlfragment("higherLayer.view.sales.NewProgrammedDialog", this);
      var dlg = sap.ui.getCore().byId("programewdialogsales");
      dlg.attachAfterClose(function () {
        that.formProjected.destroy();
      });
      this.getView().addDependent(this.formProjected);
      this.formProjected.open();
    },
    CloseDialog: function (oEvent) {
      this.formProjected.destroy();
    },

    validateIntInput: function (o) {
      let input = o.getSource();
      let length = 10;
      let value = input.getValue();
      let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

      if (regex.test(value)) {
        console.log("entro if liveChange=validateIntInput");
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

    SaveDecrease: function (oEvent) {
      oEvent.getSource().setEnabled(false)
      var that = this;
      let pass = false
      var oView = sap.ui.getCore()

      var aselects = [
        oView.byId("salesscenario"),
        oView.byId("salestype"),
        oView.byId("salesconcept"),
        oView.byId("salesbreed")
      ];
      var ainputs = [
        oView.byId("salesinpu"),
        oView.byId("projected_date"),
        oView.byId("descri")
      ];

      var bValidationError = false;
      jQuery.each(aselects, function (i, oInput) {
        bValidationError = that._validateselect(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      jQuery.each(ainputs, function (i, oInput) {
        bValidationError = that._validateInput(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      oEvent.getSource().setEnabled(true)
      if (pass == false) {
        oEvent.getSource().setEnabled(false)
        let data = this.getModel("sales").getProperty("/salesDialog")
        data.breed_id = parseInt(data.breed_id)
        data.scenario_id = parseInt(data.scenario_id)
        console.log(data)
        fetch("/sltxSellsPurchase/saveOperation", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(data)
        })
          .then(response => {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " +
                response.status);
              return;
            }
            response.json().then((res) => {
              console.log(res);
              this.getModel("sales").setProperty("/salesTable", res.data)
              this.getModel("sales").setProperty("/scenariosall", res.scenarios)
              this.getModel("sales").setProperty("/salesMainCopy/scenario_id", res.data[0].scenario_id)
              this.getModel("sales").setProperty("/salesMain/scenario_id", res.data[0].scenario_id)
              MessageToast.show("Registro creado con éxito");
              this.formProjected.destroy();


            });
            oEvent.getSource().setEnabled(true)

          })
          .catch(err => console.log);
      }
    },

    PopOverSales: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("sales").getObject()
      this.getModel("sales").setProperty("/salesDpopOver", data.description)
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.sales.PopOverSales", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },

    LoadProduction: function (oEvent) {
      let data = this.getModel("sales").getProperty("/salesMain")
      console.log(data)

      data.breed_id === "" ? data.breed_id = null : data.breed_id = parseInt(data.breed_id)
      isNaN(data.breed_id) === true ? data.breed_id = null : data.breed_id = parseInt(data.breed_id)
      data.concept == "" ? data.concept = null : data.concept = data.concept
      data.concept == undefined ? data.concept = null : data.concept = data.concept
      data.type == "" ? data.type = null : data.type = data.type
      data.type == undefined ? data.type = null : data.type = data.type
      data.date1 == "" ? data.date1 = null : data.date1 = data.date1
      data.date2 == "" ? data.date2 = null : data.date2 = data.date2
      data.scenario_id = parseInt(data.scenario_id)
      console.log(data)




      let savedata = JSON.parse(JSON.stringify(data))

      if (data.breed_id === null && data.concept === undefined && data.date1 === undefined && data.date2 === undefined && data.type === undefined) {
        MessageToast.show("Ingrese un parámetro de búsqueda");
        this.getModel("sales").setProperty("/salesMainCopy", savedata)
      } else {

        fetch("/sltxsellspurchase/findOperationsByFilter", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(data)
        })
          .then(response => {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " +
                response.status);
              if (response.status == 204) {
                MessageToast.show("Ingrese parámetros de búsqueda valido");
                this.getModel("sales").setProperty("/salesTable", [])
                this.getModel("sales").setProperty("/salesMainCopy", savedata)
              }
              return;
            }
            response.json().then((res) => {
              console.log(res);
              console.log(res.data);
              if (res.data.length == 0) {
                MessageToast.show("No se encontraron registros");
              }
              this.getModel("sales").setProperty("/salesTable", res.data)
              this.getModel("sales").setProperty("/salesMainCopy", savedata)
              // this.getModel("breedingplanning").setProperty("/farms", res.farms)
            });


          })
          .catch(err => console.log);
      }

    },

    _validateselect: function (oInput) {
      var sValueState = "None";
      var bValidationError = false;
      if (oInput.getSelectedItem() == null) {
        oInput.setValueState(sValueState);
        sValueState = "Error";
        bValidationError = true;
      }
      oInput.setValueState(sValueState);
      return bValidationError;
    },

    _validateInput: function (oInput) {
      var sValueState = "None";
      var bValidationError = false;
      console.log(oInput)
      if (oInput.getValue() == "" || oInput.getValue() <= 0) {
        oInput.setValueState(sValueState);
        sValueState = "Error";
        bValidationError = true;
      }
      oInput.setValueState(sValueState);
      return bValidationError;
    },
    DeleteSexDialog: function (oEvent) {
      this.getModel("sales").setProperty("/CurrentObject", oEvent.getSource().getBindingContext("sales").getObject())
      let that = this
      var dialog = new Dialog({
        title: 'Eliminar',
        type: 'Message',
        content: new Text({ text: '¿Seguro que desea eliminar este registro?' }),
        beginButton: new Button({
          text: 'Aceptar',
          press: function (pc) {
            let data = that.getModel("sales").getProperty("/CurrentObject")
            let search = that.getModel("sales").getProperty("/salesMainCopy")
            console.log(data)
            fetch("/sltxSellsPurchase/saveDeleted", {
              method: "POST",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                "slsellspurchase_id": data.slsellspurchase_id,
                "data": data,
                "sl_disable": true,
                "search": search
              })
            })
              .then(response => {
                console.log(response)
                response.json().then((res) => {
                  console.log(res)
                  if (res.statusCode !== 200) {
                    console.log("Looks like there was a problem. Status Code: " +
                      response.statusCode);
                    // return;
                  } else {
                    console.log("entre1");
                    console.log(res.data);
                    that.getModel("sales").setProperty("/salesTable", res.data)
                    // MessageToast.show("Registro eliminado con éxito");
                  }
                  dialog.close();
                  that.onDialog(res.statusCode === 200 ? 'Success' : 'Warning', res.msj);

                });


              })
              .catch(err => console.log);

          }
        }),
        endButton: new Button({
          text: 'Cancelar',
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

    onDialog: function (state, text) {
      let that = this;
      var dialog = new Dialog({
        title: "Información",
        type: "Message",
        state: state,
        content: new Text({
          text: text
        }),
        beginButton: new Button({
          text: "OK",
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



  });
});
