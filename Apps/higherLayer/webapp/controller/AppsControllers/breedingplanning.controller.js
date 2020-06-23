sap.ui.define([
  "higherLayer/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/Dialog",
  'sap/m/MessageToast',
  "sap/m/Text",
  "sap/m/Button"
], function (BaseController, JSONModel, Dialog, MessageToast, Text, Button) {
  "use strict";

  return BaseController.extend("higherLayer.controller.AppsControllers.breedingplanning", {


    onInit: function () {
      this.setFragments();
      this.getRouter().getRoute("breedingplanning").attachPatternMatched(this._onRouteMatched, this)
    },
    _onRouteMatched: function (oEvent) {
      var oArguments = oEvent.getParameter("arguments");
      this.index = oArguments.id;
      this.getView().getParent().getParent().setMode("HideMode");
      this.getView().getParent().getParent().setMode("ShowHideMode");
      this.getView().getParent().getParent().setMode("HideMode");


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

      this.getModel("breedingplanning").setProperty("/breedingTable", {})
      this.getModel("breedingplanning").setProperty("/breedingMain", {})

      let savedata = {

        breed_id: null,
        farm_id: null
      }

      this.getModel("breedingplanning").setProperty("/breedingMainCopy", savedata)


      console.log("djdhdjhdj")
      this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
      this.onRead(this.index);
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      fetch("/higherLayer/findScenarioBreedAndFarms", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          partnership_id: partnership_id,
          farm_type_id: 3,
          stage_id: 2
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
            // if(res.scenarios.length!==1){
            //   res.scenarios.unshift({ name: "Escenario", scenario_id: res.scenarios[0].scenario_id})
            // }
            this.getModel("breedingplanning").setProperty("/breeds", res.breed)
            this.getModel("breedingplanning").setProperty("/farms", res.farms)
            this.getModel("breedingplanning").setProperty("/scenarios", res.scenarios)
            this.getModel("breedingplanning").setProperty("/breedingMain/scenario_id", res.scenarios[0].scenario_id)
            console.log(res);
          });


        })
        .catch(err => console.log);
    },
    onRead: async function (index) {
      let ospartnership = this.getModel("ospartnership"),
        mdscenario = this.getModel("mdscenario")
      //   activeS = await this.activeScenario();
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
    LoadProduction: function (oEvent) {
      let data = this.getModel("breedingplanning").getProperty("/breedingMain"),
        ospartnership = this.getModel("ospartnership"),
        partnership_id = ospartnership.getProperty("/selectedRecord").partnership_id,
        datago


      // let savedate = data.datestart,
      //   savedate2 = data.dateend,
      //   aja = [], date2 = []

      // if (data.datestart === undefined) {
      //   aja = null
      // } else {
      //   aja = data.datestart.split("-")
      //   aja = aja[2] + "-" + aja[1] + "-" + aja[0]
      // }
      // if (data.dateend === undefined) {
      //   date2 = null
      // } else {
      //   date2 = data.dateend.split("-")
      //   date2 = date2[2] + "-" + date2[1] + "-" + date2[0]
      // }
      // if(data.dataend==undefined){

      //   let dateend = data.dateend.split("-")
      //   data.dateend=dateend[2]+"-"+dateend[1]+"-"+dateend[0]
      // }
      if (data.datestart == "") {
        data.datestart = null

      }

      if (data.dateend == "") {
        data.dateend = null

      }


      let savedata = JSON.parse(JSON.stringify({
        init_date: data.datestart,
        end_date: data.dateend,
        breed_id: parseInt(data.breed_id),
        farm_id: parseInt(data.farm_id),
        scenario_id: parseInt(data.scenario_id)

      }))
      console.log(savedata)
      if (savedata.init_date === null && savedata.end_date === null && savedata.breed_id === null && savedata.farm_id === null) {
        MessageToast.show("Ingrese un parámetro de búsqueda");
        this.getModel("breedingplanning").setProperty("/breedingTable", [])
        this.getModel("breedingplanning").setProperty("/breedingMainCopy", savedata)
      } else {



        fetch("/sltxliftbreeding/findLiftBreedingProgrammed", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({
            init_date: data.datestart,
            end_date: data.dateend,
            breed_id: parseInt(data.breed_id),
            farm_id: parseInt(data.farm_id),
            partnership_id: partnership_id,
            scenario_id: parseInt(data.scenario_id)
          })
        })
          .then(response => {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " +
                response.status);
              MessageToast.show("Ingrese un parámetro de búsqueda valido");
              this.getModel("breedingplanning").setProperty("/breedingTable", [])
              this.getModel("breedingplanning").setProperty("/breedingMainCopy", savedata)
              return;
            }
            response.json().then((res) => {
              console.log(res);
              res.data.forEach(function (element) {
                element.showdate = element.scheduled_date
                datago = element.scheduled_date.split("/")
                element.scheduled_date = datago[2] + "-" + datago[1] + "-" + datago[0]
                element.helpdate = new Date(element.scheduled_date)
              });
              if (res.data.length == 0) {
                MessageToast.show("No se encontraron registros");
              }

              this.getModel("breedingplanning").setProperty("/breedingTable", res.data)
              this.getModel("breedingplanning").setProperty("/breedingMainCopy", savedata)
              // this.getModel("breedingplanning").setProperty("/farms", res.farms)
            });


          })
          .catch(err => console.log);
      }
      // data.datestart = savedate
      // data.dateend = savedate2
    },

    NewPorgrammedButton: function (oEvent) {
      this.formProjected = sap.ui.xmlfragment("higherLayer.view.breedingplanning.NewProgrammedDialog", this);
      var dlg = sap.ui.getCore().byId("newprogrdialog");
      dlg.attachAfterClose(function () {
        that.formProjected.destroy();
      });
      this.getView().addDependent(this.formProjected);
      this.formProjected.open();
    },
    ChangeDecreaseButton: function (oEvent) {
      let that = this
      let data = oEvent.getSource().getBindingContext("breedingplanning").getObject()
      console.log(data)
      this.getModel("breedingplanning").setProperty("/CurrentObject", data)
      fetch("/higherLayer/findProcessByStageAndBreed", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          stage_id: 5, breed_id: data.breed_id
        })
      })
        .then(response => {
          if (response.status !== 200) {
            if (response.status === 409) {

              console.log("antes")
              that.onDialog("Warning", "No hay proceso de cría y levante asociado a esta raza ")
              console.log("despues")

              console.log("No hay proceso de cría y levante asociado a esta raza " +
                response.status);
              return;

            } else {
              console.log("Looks like there was a problem. Status Code: " +
                response.status);
              return;
            }
          }
          else {
            response.json().then((res) => {
              console.log(res);
              this.getModel("breedingplanning").setProperty("/DecreaseDialog", res.data)

              this.formProjected = sap.ui.xmlfragment("higherLayer.view.breedingplanning.ChangeDecreaseDialog", this);
              var dlg = sap.ui.getCore().byId("decreaseDialog");
              dlg.attachAfterClose(function () {
                that.formProjected.destroy();
              });
              this.getView().addDependent(this.formProjected);
              this.formProjected.open();
              // this.getModel("breedingplanning").setProperty("/farms", res.farms)
            });
          }


        })
        .catch(err => console.log);


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

    SaveDecrease: function (oEvent) {
      oEvent.getSource().setEnabled(false)
      var that = this;
      let pass = false
      var oView = sap.ui.getCore()
      var aInputs = [
        oView.byId("breedingdecrease"),
        oView.byId("breedingduration_process"),
      ];

      var bValidationError = false;
      jQuery.each(aInputs, function (i, oInput) {
        bValidationError = that._validateInput(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      oEvent.getSource().setEnabled(true)
      if (pass == false) {
        oEvent.getSource().setEnabled(false)
        let tata = oEvent


        let data = this.getModel("breedingplanning").getProperty("/breedingMainCopy")
        let CurrentObject = this.getModel("breedingplanning").getProperty("/CurrentObject")
        let Decrease = this.getModel("breedingplanning").getProperty("/DecreaseDialog"),
          ospartnership = this.getModel("ospartnership"),
          partnership_id = ospartnership.getProperty("/selectedRecord").partnership_id,
          datago
        console.log(CurrentObject)
        let savedate = CurrentObject.execution_date

        let data1 = CurrentObject.execution_date.split("/")
        CurrentObject.execution_date = data1[2] + "-" + data1[1] + "-" + data1[0]



        // let data2=CurrentObject.scheduled_date.split("/")
        // CurrentObject.scheduled_date=data2[2]+"-"+data2[1]+"-"+data2[0]
        // console.log(CurrentObject)

        fetch("/sltxliftbreeding/projectLiftBreeding", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({
            record: [CurrentObject],
            init_date: data.init_date,
            end_date: data.end_date,
            partnership_id: partnership_id,
            farm_id: data.farm_id,
            breed_id: data.breed_id,
            scenario_id: data.scenario_id,
            decrease: Decrease.decrease,
            duration: Decrease.duration_process
          })
        })
          .then(response => {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " +
                response.status);
              return;
            }
            response.json().then((res) => {
              console.log(res.data);
              res.data.forEach(function (element) {
                element.showdate = element.scheduled_date
                element.helpdate = new Date(element.scheduled_date)
                // datago=element.scheduled_date.split("/")
                // element.scheduled_date=datago[2]+"-"+datago[1]+"-"+datago[0]
              });
              this.getModel("breedingplanning").setProperty("/breedingTable", res.data)
              MessageToast.show("Proyección realizada con éxito");

              this.formProjected.destroy();


            });
            CurrentObject.execution_date = savedate
            oEvent.getSource().setEnabled(true)

          })
          .catch(err => console.log);
      }

    },


    PopOverProduction: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("breedingplanning").getObject(),
        breed = parseInt(data.slliftbreeding_id)
      console.log({ breeding_id: breed })
      fetch("/sltxlb_Shed/findShedsByLiftBreedingId", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ liftbreeding_id: breed })
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
            this.getModel("breedingplanning").setProperty("/sheedpopovers", res.data)
            // sap.ui.getCore().byId("sheets").setSelectedKey(null);

          });


        })
        .catch(err => console.log);
      console.log(data)
      // this.getModel("production").setProperty("",data)
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.breedingplanning.PopOverBreeding", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },
    CloseDialog: function (oEvent) {
      this.formProjected.destroy();
    },
    EmptyDelete: function (item) {
      return item.demand_birds != "" && item.received_birds != "";
    },
    ExecutedBreeding: function (oEvent) {

      let data = this.getModel("breedingplanning").getProperty("/breedingTable"),
        ospartnership = this.getModel("ospartnership"),
        partnership_id = ospartnership.getProperty("/selectedRecord").partnership_id,
        datago
      data.forEach(function (element) {
        if (element.executed == false) {

          if (element.execution_date == null) {

            element.stateDate = "Error"
            element.stateTextDate = "La fecha de ejecución no puede estar vacía"
          }
          if ((element.received_birds == null || element.received_birds == "")) {

            element.state = "Error"
            element.stateText = "La cantidad no puede estar vacía"
          }
          if (element.demand_birds == null || element.demand_birds == "" || element.demand_birds == "0") {

            element.statebird = "Error"
            element.stateTextBird = "La cantidad no puede estar vacía y debe ser mayor a cero (0)"
          }
        }
      });
      

      console.log("tabla", data)
      const result = data.filter(item => item.executed === false);
      console.log(result);
      let send = result.filter(item => item.demand_birds != "" && item.received_birds != null && item.received_birds != "" && item.execution_date != null && item.scheduled_date != null && item.execution_date != "" && item.scheduled_date != "");
      //   send = send.map(function(x) {
      //     let y = x.scheduled_date.split("/")
      //     x.scheduled_date=y[2]+"-"+y[1]+"-"+y[0]
      //  });
      console.log(send);

      if (send.length > 0) {
        let searcher = this.getModel("breedingplanning").getProperty("/breedingMainCopy")
        console.log(searcher)
        fetch("/sltxliftbreeding/executeLiftBreeding", {
          method: "PUT",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({
            records: send,
            init_date: searcher.init_date,
            end_date: searcher.end_date,
            breed_id: searcher.breed_id,
            partnership_id: partnership_id,
            farm_id: searcher.farm_id,
            scenario_id: searcher.scenario_id
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
              res.data.forEach(function (element) {
                element.showdate = element.scheduled_date
                datago = element.scheduled_date.split("/")
                element.scheduled_date = datago[2] + "-" + datago[1] + "-" + datago[0]
                element.helpdate = new Date(element.scheduled_date)
              });
              this.getModel("breedingplanning").setProperty("/breedingTable", res.data)
              MessageToast.show(send.length + " elemento(s) ejecutado(s) con éxito");
              // this.getModel("breedingplanning").setProperty("/breeds", res.breed)
              // this.getModel("breedingplanning").setProperty("/farms", res.farms)
            });


          })
          .catch(err => console.log);

      } else {
        this.getModel("breedingplanning").setProperty("/breedingTable", data)
        MessageToast.show("No se detectaron cambios", {
          duration: 3000,
          width: "20%"
        });
      }
    },

    PopOverProductionProjected: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("breedingplanning").getObject(),
        breed = parseInt(data.slbreeding_id),
        projected = {
          decrease: data.decrease,
          duration: data.duration
        }
      console.log(data)
      console.log(projected)

      this.getModel("breedingplanning").setProperty("/ProjectedPopOverbreedingplanning", projected)
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.breedingplanning.PopOverProjectedDone", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },

    PopOverBreeding: function (oEvent) {
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.breedingplanning.PopOverBreeding", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },

    _validateInput: function (oInput) {
      var sValueState = "None";
      var bValidationError = false;
      console.log(oInput)
      if (oInput.getValue() == "") {
        oInput.setValueState(sValueState);
        sValueState = "Error";
        bValidationError = true;
      }
      oInput.setValueState(sValueState);
      return bValidationError;
    },

    validateIntInput: function (o) {
      let input = o.getSource();
      let length = 10;
      let value = o.getParameter("value");
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
        console.log("el value:::", value)
        if (parseInt(value) === 0 || value === '' || value === null || value === undefined) {
          input.setValueState("Error");
          input.setValueStateText("El campo no puede estar vacío y debe ser mayor a cero (0)");

        } else {
          input.setValueState("None");
          input.setValueStateText("");
        }
        input.setValue(value);
        return false;
      }
    },
    validateIntInputRec: function (o) {
      let input = o.getSource();
      let length = 10;
      let value = o.getParameter("value");
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
        console.log("El value::::: ", value)
        if (value === '' || value === null || value === undefined) {
          input.setValueState("Error");
          input.setValueStateText("El campo no puede estar vacío");

        } else {
          input.setValueState("None");
          input.setValueStateText("");
        }
        input.setValue(value);

      }
    },
    changeDate: function (oEvent) {
      let dateP = oEvent.getSource();
      let object = oEvent.getSource().getBindingContext("breedingplanning").getObject()
      let path = oEvent.getSource().getBindingContext("breedingplanning").getPath()

      object.helpdate = new Date(object.showdate)
      object.helpdate.setDate(object.helpdate.getDate() + 1);
      this.getModel("breedingplanning").setProperty(path, object)







      dateP.setValueState("None");
      dateP.setValueStateText("");

    }

  });
});
