sap.ui.define([
  "higherLayer/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  'sap/m/MessageToast',
  "sap/m/Dialog",
  "sap/m/Text",
  "sap/m/Button"
], function (BaseController, JSONModel, MessageToast, Dialog, Text, Button) {
  "use strict";

  return BaseController.extend("higherLayer.controller.AppsControllers.production", {


    onInit: function () {
      console.log("Init")

      this.setFragments();
      this.getRouter().getRoute("production").attachPatternMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function (oEvent) {
      var oArguments = oEvent.getParameter("arguments");
      console.log("RouteMatch")
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
      this.getModel("production").setProperty("/ProductionTable", {})
      console.log("djdhdjhdj")
      this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
      this.onRead(this.index);
      this.getModel("production").setProperty("/ProductionMain", {})
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      fetch("/higherLayer/findScenarioBreedAndFarms", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          partnership_id: partnership_id,
          farm_type_id: 1,
          stage_id: 1

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
            // res.scenarios.unshift({ name: "Escenario", scenario_id: res.scenarios[0].scenario_id})
            const result = res.scenarios.filter(word => word.status === 1);
            this.getModel("production").setProperty("/activescenariooo", result[0])
            this.getModel("production").setProperty("/ProductionMain/scenario_id", res.scenarios[0].scenario_id)
            this.getModel("production").setProperty("/selectScenariomains", res.scenarios)
            this.getModel("production").setProperty("/breedss", res.breed)
            this.getModel("production").setProperty("/farmss", res.farms)
          });


        })
        .catch(err => console.log);
    },
    onRead: async function (index) {
      let ospartnership = this.getModel("ospartnership"),
        mdscenario = this.getModel("mdscenario")
      //   activeS = await this.activeScenario();
      let sd = this.getModel("ospartnership").getProperty("/")
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
      console.log("eje")
      // var _oPopover = this._getResponsivePopover();
      // _oPopover.setModel(oEvent.getSource().getModel());
      // _oPopover.openBy(oEvent.getParameter("domRef"));
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.components.PartnershipPopOver", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },
    LoadProduction: function (oEvent) {
      let data = this.getModel("production").getProperty("/ProductionMain"),
        ospartnership = this.getModel("ospartnership"),
        partnership_id = ospartnership.getProperty("/selectedRecord").partnership_id
      let that = this
      console.log(data)
      let savedate = data.date1,
        savedate2 = data.date2,
        aja = [], date2 = []
      if (data.date1 === undefined) {
        aja = null
      } else {
        aja = data.date1.split("-")
        aja = aja[2] + "-" + aja[1] + "-" + aja[0]
      }
      if (data.date2 === undefined) {
        date2 = null
      } else {
        date2 = data.date2.split("-")
        date2 = date2[2] + "-" + date2[1] + "-" + date2[0]
      }
      console.log(data)
      let send = {
        farm_id: parseInt(data.farm_id),
        breed_id: parseInt(data.breed_id),
        date1: aja,
        date2: date2,
        partnership_id: partnership_id,
        scenario_id: parseInt(data.scenario_id)
      }
      console.log(send)
      console.log(send.farm_id)
      console.log(data.farm_id)
      if (data.scenario_id === null && send.date1 === null && send.date2 === null && data.farm_id === undefined && data.breed_id === undefined) {
        MessageToast.show("Ingrese un parámetro de búsqueda");
      } else {


        this.getModel("production").setProperty("/ProductionMainCopy", send)
        fetch("/sltxBreeding/findBreedingByFilter", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(send)
        })
          .then(response => {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " +
                response.status);
              MessageToast.show("Ingrese un parámetro de búsqueda valido");
              this.getModel("production").setProperty("/ProductionTable", [])
              return;
            }
            response.json().then((res) => {
              console.log(res);
              let date
              res.data.forEach(function (element) {
                if (element.execution_date != null) {
                  if (element.programmed_quantity != null) {

                    element.thatnumber = that.getNumberWithCommas(element.programmed_quantity)
                  }
                  if (element.execution_quantity != null) {
                    element.othernumber = that.getNumberWithCommas(element.execution_quantity)

                  }
                  date = element.execution_date.split("/")
                  //let date_ref = new Date(element.execution_date)
                  //console.log("aqui 0",element.execution_date )
                  element.execution_date = date[2] + "-" + date[1] + "-" + date[0]
                  element.execution_date_ref = new Date(date[2] + "," + date[1] + "," + date[0]);
                  //console.log("aqui",element.execution_date)
                  //console.log("aqui2",element.execution_date_ref) 

                }
              });
              console.log(res.data);
              if (res.data.length == 0) {
                MessageToast.show("No se encontraron registros");
              }
              this.getModel("production").setProperty("/ProductionTable", res.data)
              this.getModel("production").setProperty("/ProductionMainCopy", send)

            });


          })
      }
      data.date1 = savedate,
        data.date2 = savedate2
    },

    getNumberWithCommas: function (number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    NewProductionProgrammed: function (oEvent) {
      let that = this
      // this.getModel("production").setProperty("/ProductionDialog/housing_date", new Date())



      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      fetch("/higherLayer/findScenarioBreedAndFarms", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          partnership_id: partnership_id,
          farm_type_id: 1,
          stage_id: 1
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
            this.getModel("production").setProperty("/scenarios", res.scenarios_all)
            this.getModel("production").setProperty("/breeds", res.breed)
            this.getModel("production").setProperty("/farms", res.farms)
          });


        })
      this.formProjected = sap.ui.xmlfragment("higherLayer.view.production.NewProgrammedDialog", this);
      var dlg = sap.ui.getCore().byId("newProgrammedDialog");
      dlg.attachAfterClose(function () {
        that.formProjected.destroy();
      });
      this.getView().addDependent(this.formProjected);
      this.formProjected.open();
    },
    CloseDialog: function (oEvent) {
      console.log("help")
      this.getModel("production").setProperty("/ProductionDialog", {
        "programmed_quantity": "",
        "housing_date": ""
      })
      this.formProjected.destroy();
    },
    CloseDialogssss: function (oEvent) {
      console.log("help")

      this.formProjecteded.close();
      this.formProjecteded.destroy();
    },

    DeleteProduction: function (oEvent) {

      let that = this
      let data = oEvent.getParameter('listItem').getBindingContext("production").getObject()
      var dialog = new Dialog({
        title: 'Eliminar',
        type: 'Message',
        content: new Text({ text: '¿Seguro que desea eliminar esta programación?' }),
        beginButton: new Button({
          text: 'Aceptar',
          press: function (pc) {
            let search = that.getModel("production").getProperty("/ProductionMainCopy")

            fetch("/higherLayer/", {
              method: "DELETE",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                stage_id: 3,
                slbreeding_id: data.slbreeding_id,
                search: search
              })
            })
              .then(response => {
                if (response.status !== 200) {
                  console.log("Looks like there was a problem. Status Code: " +
                    response.status);
                  console.log(response)
                  if (response.status === 304) {
                    MessageToast.show("No se puede eliminar el registro porque influye sobre una programación de engorde que ya ha sido sincronizada");
                    dialog.close();
                  } else {
                    MessageToast.show("No se pudo eliminar la programación seleccionada");
                    dialog.close();
                  }
                  return;
                }
                console.log("entre1");
                response.json().then((res) => {
                  console.log(res);
                  that.getModel("production").setProperty("/ProductionTable", res.data)
                  MessageToast.show("Programación eliminada con éxito");
                  dialog.close();



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

    SaveDecrease: function (oEvent) {
      oEvent.getSource().setEnabled(false)
      var that = this;
      let pass = false
      var oView = sap.ui.getCore()
      var aInputs = [
        oView.byId("decrease"),
      ];
      var bInputs = [
        oView.byId("duration_process"),
      ];

      var bValidationError = false;
      jQuery.each(aInputs, function (i, oInput) {
        bValidationError = that._validateInputcanzero(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      jQuery.each(bInputs, function (i, oInput) {
        bValidationError = that._validateInput(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      oEvent.getSource().setEnabled(true)
      if (pass == false) {
        oEvent.getSource().setEnabled(false)
        this.formProjected.destroy();


        let data = this.getModel("production").getProperty("/ProductionMainCopy")
        let CurrentObject = this.getModel("production").getProperty("/CurrentObject")
        let Decrease = this.getModel("production").getProperty("/DecreaseDialog")
        let table = this.getModel("production").getProperty("/ProductionTable")

        CurrentObject.decrease = parseInt(Decrease.decrease)
        CurrentObject.duration = parseInt(Decrease.duration_process)
        CurrentObject.stage_id = 3
        CurrentObject.search = data
        CurrentObject.table = table.length
        CurrentObject.partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
        console.log(CurrentObject)
        this.getModel("production").setProperty("/SavedDecrease", CurrentObject)

        this.formProjecteded = sap.ui.xmlfragment("higherLayer.view.production.PostureCurveDialog", this);
        var dlg = sap.ui.getCore().byId("productiondialogposture");
        dlg.attachAfterClose(function () {
          that.formProjected.destroy();
        });
        this.getView().addDependent(this.formProjecteded);
        this.formProjecteded.open();
      }

    },



    SavePostureCurve: function (oEvent) {
      let that = this
      let data = this.getModel("production").getProperty("/ProductionMainCopy")
      let CurrentObject = this.getModel("production").getProperty("/CurrentObject")
      let posturecurve = this.getModel("production").getProperty("/PostureCurveDialog")
      let All = this.getModel("production").getProperty("/SavedDecrease")
      // console.log(Decrease)
      // let  data1=CurrentObject.execution_date.split("/")
      // CurrentObject.execution_date=data1[2]+"-"+data1[1]+"-"+data1[0]
      console.log(All)
      All.posturecurve = posturecurve
      // CurrentObject.search = data
      // CurrentObject.table = table.length


      // let data2=CurrentObject.housing_date.split("/")
      // CurrentObject.housing_date=data2[2]+"-"+data2[1]+"-"+data2[0]
      // console.log(CurrentObject)

      console.log(All)

      fetch("/sltxBreeding/saveProjection", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(CurrentObject)
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            MessageToast.show("Campos faltantes en la curva de postura");
            return;
          }
          response.json().then((res) => {
            console.log(res.data);
            console.log(res);

            res.data.forEach(function (element) {
              if (element.execution_date != null) {
                if (element.programmed_quantity != null) {

                  element.thatnumber = that.getNumberWithCommas(element.programmed_quantity)
                }
                if (element.execution_quantity != null) {
                  element.othernumber = that.getNumberWithCommas(element.execution_quantity)

                }
                let date = element.execution_date.split("/")
                //let date_ref = new Date(element.execution_date)
                //console.log("aqui 0",element.execution_date )
                element.execution_date = date[2] + "-" + date[1] + "-" + date[0]
                element.execution_date_ref = new Date(date[2] + "," + date[1] + "," + date[0]);
                //console.log("aqui",element.execution_date)
                //console.log("aqui2",element.execution_date_ref) 

              }
            });
            this.getModel("production").setProperty("/ProductionTable", res.data)

            MessageToast.show("Ejecución realizada con éxito");
            that.formProjecteded.destroy();


          });


        })
        .catch(err => console.log);
      // CurrentObject.housing_date=data2[0]+"-"+data2[1]+"-"+data2[2]
    },


    Loadshet: function (oEvent) {
      let stage = oEvent.getSource().getSelectedKey();
      console.log(stage)
      fetch("/higherLayer/findShedsByFarmAndAvailability", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          farm_id: stage
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
            this.getModel("production").setProperty("/sheds", res.data)
            // sap.ui.getCore().byId("sheets").setSelectedKey(null);


          });


        })
        .catch(err => console.log);
    },


    validateIntInput: function (o) {
      let input = o.getSource();
      // let obj = o.getSource().getBindingContext("production").getObject();
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
        console.log(value, parseInt(value) === 0)
        console.log(value)
        // input.setValue(value);
        if (value === '' || value === null || value === undefined) {
          input.setValueState("Error");
          input.setValueStateText("El campo no puede estar vacío");

        } else {
          input.setValue(value);
          input.setValueState("None");
        }
        // if (value === "e") {
        //   input.setValue("");
        // }
        return false;
      }
    },
    PopOverProduction: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("production").getObject(),
        breed = parseInt(data.slbreeding_id)
      console.log({ breeding_id: breed })
      fetch("/sltxb_Shed/findShedsByBreedingId", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ breeding_id: breed })
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
            this.getModel("production").setProperty("/sheedpopovers", res.data)
            // sap.ui.getCore().byId("sheets").setSelectedKey(null);

          });


        })
        .catch(err => console.log);
      console.log(data)
      // this.getModel("production").setProperty("",data)
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.production.PopOverProduction", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },
    PopOverProductionProjected: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("production").getObject(),
        breed = parseInt(data.slbreeding_id),
        projected = {
          decrease: data.decrease,
          duration: data.duration
        }
      console.log(data)
      console.log(projected)

      this.getModel("production").setProperty("/ProjectedPopOverProduction", projected)
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.production.PopOverProjectedDone", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },
    PopOverProduction: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("production").getObject(),
        breed = parseInt(data.slbreeding_id)
      console.log({ breeding_id: breed })
      fetch("/sltxb_Shed/findShedsByBreedingId", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ breeding_id: breed })
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
            this.getModel("production").setProperty("/sheedpopovers", res.data)
            // sap.ui.getCore().byId("sheets").setSelectedKey(null);

          });


        })
        .catch(err => console.log);
      console.log(data)
      // this.getModel("production").setProperty("",data)
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.production.PopOverProduction", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },
    ProjectionButton: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("production").getObject()
      data.stage_id = 5
      data.partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      console.log(data)
      // let date1=data.split("-")
      fetch("/sltxBreeding/saveProjectionByBreedingProgrammed", {
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
            // this.getModel("production").setProperty("/sheedpopovers",res.data)
            // sap.ui.getCore().byId("sheets").setSelectedKey(null);

          });


        })
        .catch(err => console.log);


    },
    PopOverscenario: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("production").getObject()
      this.getModel("production").setProperty("/popoverscenario", data.name_scenario)
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.production.PopOverScenario", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },
    ChangeDecreaseButton: function (oEvent) {
      let that = this
      let data = oEvent.getSource().getBindingContext("production").getObject()
      console.log(data)
      let dateee = data.post_date.split("/")
      dateee = dateee[2] + "-" + dateee[1] + "-" + dateee[0]
      this.getModel("production").setProperty("/CurrentObject", data)
      fetch(" /sltxBreeding/findPostureProcessAndCurveByBreed", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          stage_id: 5, breed_id: data.breed_id, start_posture_date: dateee
        })
      })
        .then(response => {
          if (response.status !== 200) {
            if (response.status === 409) {
              that.onDialog("Warning", "No hay proceso de cría y levante asociado a esta raza ")
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
              this.getModel("production").setProperty("/DecreaseDialog", res.process[0])
              this.getModel("production").setProperty("/PostureCurveDialog", res.curve)
              // this.getModel("breedingplanning").setProperty("/farms", res.farms)
            });
            this.formProjected = sap.ui.xmlfragment("higherLayer.view.production.ChangeDecreaseDialog", this);
            var dlg = sap.ui.getCore().byId("decreaseDialog");
            dlg.attachAfterClose(function () {
              that.formProjected.destroy();
            });
            this.getView().addDependent(this.formProjected);
            this.formProjected.open();
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

    ChangePostureCurveButton: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("production").getObject(),
        path = oEvent.getSource().getBindingContext("production").getPath()
      console.log(oEvent.getParameter("listItem"), path)
      let production = this.getView().getModel("production");
      let pass = true
      let mainlook = this.getModel("production").getProperty("/ProductionMainCopy")
      console.log(data)
      let that = this
      if (data.execution_quantity === null || data.execution_quantity === "" || data.execution_quantity === undefined || data.execution_quantity === "e" || data.execution_quantity === "ee" || data.execution_quantity === "eee") {
        production.setProperty(path + "/stateQuantity", 'Error')
        pass = false
      } else {
        production.setProperty(path + "/stateQuantity", 'None')
      }
      if (data.execution_date === null || data.execution_date === "" || data.execution_date === undefined) {
        production.setProperty(path + "/stateExeDate", 'Error')
        pass = false
      } else {
        production.setProperty(path + "/stateExeDate", 'None')
      }
      if (pass === true) {


        fetch("/sltxBreeding/saveExecutions", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({
            execution: {
              slbreeding_id: data.slbreeding_id,
              execution_date: data.execution_date,
              execution_quantity: parseInt(data.execution_quantity)
            },
            data: mainlook
          })
        })
          .then(response => {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " +
                response.status);
              production.setProperty(path + "/stateExeDate", 'Error')
              production.setProperty(path + "/stateQuantity", 'Error')
              MessageToast.show("Campos invalidos para ejecutar");
              return;
            }
            response.json().then((res) => {
              console.log(res);
              res.data.forEach(function (element) {
                if (element.execution_date != null) {

                  element.thatnumber = that.getNumberWithCommas(element.programmed_quantity)
                  element.othernumber = that.getNumberWithCommas(element.execution_quantity)
                  let date = element.execution_date.split("/")
                  //let date_ref = new Date(element.execution_date)
                  //console.log("aqui 0",element.execution_date )
                  element.execution_date = date[2] + "-" + date[1] + "-" + date[0]
                  element.execution_date_ref = new Date(date[2] + "," + date[1] + "," + date[0]);
                  //console.log("aqui",element.execution_date)
                  //console.log("aqui2",element.execution_date_ref) 

                }
              });
              this.getModel("production").setProperty("/ProductionTable", res.data)
              // sap.ui.getCore().byId("sheets").setSelectedKey(null);
              MessageToast.show("Ejecución realizada con éxito");
              // this.CloseDialog()
            });


          })
          .catch(err => console.log);

      } else {
        MessageToast.show("Campos invalidos para ejecutar");
      }



      // if (data.lot == null || data.lot === '' || data.lot === undefined || data.lot === '0' || parseInt(data.execution_quantity) === 0 || data.execution_quantity === '' || data.execution_quantity == null || data.execution_date === '' || data.execution_date == null || data.start_posture_date === '' || data.start_posture_date == null) {
      //   if (data.lot == null || data.lot === '' || data.lot === undefined || data.lot === '0') {
      //     production.setProperty(path + "/stateQuantityLot", 'Error')
      //     production.setProperty(path + "/stateTextQuantityLot", 'El lote no puede estar vacío y debe ser mayor a cero (0)')
      //   } else {
      //     production.setProperty(path + "/stateQuantityLot", 'None')
      //     production.setProperty(path + "/stateTextQuantityLot", '')

      //   }
      //   if (parseInt(data.execution_quantity) === 0 || data.execution_quantity === '' || data.execution_quantity === null || data.execution_quantity === undefined) {
      //     production.setProperty(path + "/stateQuantity", 'Error')
      //     production.setProperty(path + "/stateTextQuantity", 'La cantidad no puede estar vacía y debe ser mayor a cero (0)')

      //   } else {
      //     production.setProperty(path + "/stateQuantity", 'None');
      //     production.setProperty(path + "/stateTextQuantity", '');

      //   }
      //   if (data.execution_date === '' || data.execution_date === null || data.execution_date === undefined) {
      //     production.setProperty(path + "/stateExeDate", 'Error')
      //     production.setProperty(path + "/stateTextExeDate", 'Debe indicar una fecha de ejecución')
      //   } else {
      //     production.setProperty(path + "/stateExeDate", 'None')
      //     production.setProperty(path + "/stateTextExeDate", '')

      //   }
      //   if (data.start_posture_date === '' || data.start_posture_date === null || data.start_posture_date === undefined) {
      //     production.setProperty(path + "/statePosDate", 'Error')
      //     production.setProperty(path + "/stateTextPosDate", 'Debe indicar una fecha de inicio de postura')
      //   } else {
      //     production.setProperty(path + "/statePosDate", 'None')
      //     production.setProperty(path + "/stateTextPosDate", '')

      //   }

      //   MessageToast.show("Campos faltantes para proyectar");
      // } else {
      //   console.log(new Date(data.execution_date))
      //   console.log(new Date(data.start_posture_date))
      //   if (Date.parse(data.start_posture_date) < Date.parse(data.execution_date)) {
      //     production.setProperty(path + "/statePosDate", 'Error')
      //     production.setProperty(path + "/stateTextPosDate", 'La fecha de inicio de postura no puede ser menor a la fecha ejecutada')
      //     // console.log("fecha mala")
      //     // MessageToast.show("La fecha de inicio de postura no puede ser menor a la fecha ejecutada");
      //   } else {
      //     //end is less than start


      //   }
      // }


    },
    changeDate: function (oEvent) {
      let dateP = oEvent.getSource()
      // let dateP = oEvent.getSource().getBindingContext("production");

      console.log("change", dateP)

      dateP.setValueState("None");
      dateP.setValueStateText("");
    },
    dateSelect: function (oEvent) {
      let dateP = oEvent.getSource().getDateValue()
      // let dateP = oEvent.getSource().getBindingContext("production");
      sap.ui.getCore().byId("datepickid2").setInitialFocusedDateValue(dateP)
      // console.log( dateP)
      // setInitialFocusedDateValue
      // dateP.setValueState("None");
      // dateP.setValueStateText("");
    },

    changeDateExecution: function (oEvent) {
      let record = oEvent.getSource().getBindingContext("production").getObject();

      //console.log("aqui1",record.execution_date)
      record.start_posture_date = ""
      let date = record.execution_date.split("-")
      record.execution_date_ref = new Date(date[0] + "," + date[1] + "," + date[2]);
      //console.log("aqui2", record.execution_date_ref)

    },

    onProjectedSaveDialog: function (oEvent) {
      oEvent.getSource().setEnabled(false)

      var that = this;
      let pass = false
      var oView = sap.ui.getCore()
      let evento = oEvent

      var aselects = [
        oView.byId("selectscenario"),
        oView.byId("selectbreed"),
        oView.byId("selectfarm")
      ];
      var aInput = [
        oView.byId("inputamount"),
        oView.byId("datepickid"),
        oView.byId("lotidinput"),
        oView.byId("datepickid2")
      ];

      var aComboBox = [
        oView.byId("sheets")
      ];

      var bValidationError = false;
      jQuery.each(aselects, function (i, oInput) {
        bValidationError = that._validateselect(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      var bValidationError = false;
      jQuery.each(aComboBox, function (i, oInput) {
        bValidationError = that._validateComboBox(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      var bValidationError = false;
      jQuery.each(aInput, function (i, oInput) {
        bValidationError = that._validateInput(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      oEvent.getSource().setEnabled(true)
      if (pass == false) {
        evento.getSource().setEnabled(false)
        let production = this.getModel("production").getProperty("/ProductionDialog")
        console.log(production)
        console.log({
          breed_id: parseInt(production.breed_id),
          scenario_id: parseInt(production.scenario_id),
          start_posture_date: production.posture_date,
          lot: production.lot
        })
        fetch("/sltxBreeding/existDemandAndLot", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({
            breed_id: parseInt(production.breed_id),
            scenario_id: parseInt(production.scenario_id),
            start_posture_date: production.posture_date,
            lot: production.lot
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
              if (res.data.lot == true) {
                MessageToast.show("El lote ingresado ya existe");
                // production.setProperty(path + "/stateQuantityLot", 'Error')
                sap.ui.getCore().byId("lotidinput").setValueState("Error")
              } else if (res.data.start_posture_date == false) {
                var dialog = new Dialog({
                  title: 'Advertencia',
                  type: 'Message',
                  state: 'Warning',
                  content: new Text({ text: 'No se pudo ejecutar porque no existe demanda de huevos para una de las semanas involucradas en la producción' }),
                  beginButton: new Button({
                    text: 'Ir a Escenario',
                    press: function () {
                      jQuery.sap.require("jquery.sap.storage");
                      let scenario = that.getModel("production").getProperty("/activescenariooo")
                      var sStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
                      //to add data in the storage 
                      sStorage.put("key", { scenario, aja: "ok" });
                      window.location.href = "/Apps/mantenimiento-escenarios/webapp";
                      dialog.close();
                    }
                  }),
                  endButton: new Button({
                    text: 'Aceptar',
                    press: function (pc) {
                      dialog.close();

                    }
                  }),

                  afterClose: function () {
                    dialog.destroy();
                    // this.formProjecteded.destroy();
                  }
                });
                dialog.open();




              }
              else {
                // MessageToast.show("");

                this.InsertProduction()
              }


              // this.getModel("production").setProperty("/PostureCurveDialog", res.data)
              // this.getModel("breedingplanning").setProperty("/farms", res.farms)
            });


          })
          .catch(err => console.log);

      }
      evento.getSource().setEnabled(true)
    },

    InsertProduction: function (oInput) {
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      let production = this.getModel("production").getProperty("/ProductionDialog")
      console.log(production)

      production.partnership_id = parseInt(partnership_id)
      production.breed_id = parseInt(production.breed_id)
      production.farm_id = parseInt(production.farm_id)
      production.scenario_id = parseInt(production.scenario_id)
      production.stage_id = 3

      let date = production.housing_date.split("-")
      // production.housing_date = date[2] + "-" + date[1] + "-" + date[0]
      console.log(production)

      fetch("/sltxBreeding/saveBreedingProgrammed", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(
          production
        )
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
            this.getModel("production").setProperty("/selectScenariomains", res.scenarios)
            this.getModel("production").setProperty("/ProductionTable", [res.data])
            // sap.ui.getCore().byId("sheets").setSelectedKey(null);
            MessageToast.show("Programación creada con éxito");
            this.CloseDialog()
          });


        })
        .catch(err => console.log);


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
      }
      else {
        let pNumber = 0;
        let aux = value
          .split("")
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
      if (oInput.getValue() == "" || oInput.getValue() <= 0) {
        oInput.setValueState(sValueState);
        sValueState = "Error";
        bValidationError = true;
      }
      oInput.setValueState(sValueState);
      return bValidationError;
    },
    _validateInputcanzero: function (oInput) {
      var sValueState = "None";
      var bValidationError = false;
      if (oInput.getValue() == "" || oInput.getValue() < 0) {
        oInput.setValueState(sValueState);
        sValueState = "Error";
        bValidationError = true;
      }
      oInput.setValueState(sValueState);
      return bValidationError;
    },

    _validateComboBox: function (oInput) {
      var oBinding = oInput.getSelectedItems()
      var sValueState = "None";
      var bValidationError = false;


      if (oBinding.length == 0) {
        oInput.setValueState(sValueState);
        sValueState = "Error";
        bValidationError = true;
      }

      oInput.setValueState(sValueState);

      return bValidationError;
    },




  });
});
