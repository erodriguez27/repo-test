sap.ui.define([
  "higherLayer/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  'sap/m/MessageToast',
  "sap/m/Dialog",
  "sap/m/Text",
  "sap/m/Button"
], function (BaseController, JSONModel, MessageToast, Dialog, Text, Button) {
  "use strict";

  return BaseController.extend("higherLayer.controller.AppsControllers.parameters", {


    onInit: function () {

      this.setFragments();
      this.getRouter().getRoute("parameters").attachPatternMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function (oEvent) {
      var oArguments = oEvent.getParameter("arguments");
      let that = this
      this.index = oArguments.id;
      // this.getView().getParent().getParent().setMode("HideMode");
      this.getView().getParent().getParent().setMode("ShowHideMode");
      // this.getView().getParent().getParent().setMode("HideMode");

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
      this.onRead(this.index);
      this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
      //  return new Promise((resolve, reject) => {

      this.parametersSelect()
      // if (this.getModel("prueba").getProperty("/CurrentParameter") == "process") {

      //   fetch("/higherLayer/findAllProcess", {
      //     method: "GET",
      //   })
      //     .then(
      //       function (response) {
      //         if (response.status !== 200) {
      //           console.log("Looks like there was a problem. Status Code: " +
      //             response.status);
      //           return;
      //         }

      //         response.json().then(function (res) {
      //           //console.log(JSON.parse(res.data));
      //           // resolve(res);
      //           console.log(res.data)
      //           that.getView().getModel("tables").setProperty("/ProcessTable", res.data)

      //         });
      //       }
      //     )
      //     .catch(function (err) {
      //       console.log("Fetch Error :-S", err);
      //     });
      //   // });


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

    NewParameter: function (oEvent) {
      let parameter = this.getModel("prueba").getProperty("/CurrentParameter"), that = this
      this.getModel("tables").setProperty("/ButtonsParameter", true)

      switch (parameter) {
        case "process":
          this.getModel("tables").setProperty("/ProcessDialog", {
            "name": "",
            "stage_id": "",
            "breed_id": "",
            "decrease": "",
            "duration_process": "",
            "sync_considered": false
          })
          this.LoadStage()
          this.formProjected = sap.ui.xmlfragment("higherLayer.view.parameters.ProcessDialog", this);
          var dlg = sap.ui.getCore().byId("processDialog");
          dlg.attachAfterClose(function () {
            that.formProjected.destroy();
          });
          this.getView().addDependent(this.formProjected);
          this.formProjected.open();
          break;
        case "machines":
          this.getModel("tables").setProperty("/MachineDialog", {
            "incubatorplant_id": "",
            "charges": "",
            "amount_of_charge": "",
            "description": "",
            "monday": false,
            "tuesday": false,
            "wednesday": false,
            "thursday": false,
            "friday": false,
            "saturday": false,
            "sunday": false
          })
          this.LoadMachineGroups()
          this.formProjected = sap.ui.xmlfragment("higherLayer.view.parameters.MachineDialog", this);
          var dlg = sap.ui.getCore().byId("machineDialog");
          dlg.attachAfterClose(function () {
            that.formProjected.destroy();
          });
          this.getView().addDependent(this.formProjected);
          this.formProjected.open();
          this.getView().addDependent(this.formProjected);
          this.formProjected.open();
          break;
        case "sex":
          this.getModel("tables").setProperty("/SexDialog", {
            "name": "",
            "gender": "",
            "breed_id": "",
            "weight_gain": "",
            "age": "",
            "mortality": ""
          })
          this.LoadBreedsSex()
          this.formProjected = sap.ui.xmlfragment("higherLayer.view.parameters.SexDialog", this);
          var dlg = sap.ui.getCore().byId("sexDialog");
          dlg.attachAfterClose(function () {
            that.formProjected.destroy();
          });
          this.getView().addDependent(this.formProjected);
          this.formProjected.open();
          break;
        case "eviction":
          this.getModel("tables").setProperty("/EvictionDialog", {
            "slevictionpartition_id": "",
            "name": "",
            "youngmale": "",
            "oldmale": "",
            "peasantmale": "",
            "youngfemale": "",
            "oldfemale": "",
            "active": false
          })
          this.formProjected = sap.ui.xmlfragment("higherLayer.view.parameters.EvictionDialog", this);
          var dlg = sap.ui.getCore().byId("evictionDialog");
          dlg.attachAfterClose(function () {
            that.formProjected.destroy();
          });
          this.getView().addDependent(this.formProjected);
          this.formProjected.open();
          break;
      }
    },
    ChangeParameter: function (oEvent) {
      let change = oEvent.getSource().getBindingContext("tables").getObject()
      let path = oEvent.getSource().getBindingContext("tables").getPath()
      this.getModel("tables").setProperty("/ButtonsParameter", false)
      this.getModel("tables").setProperty("/dialogcopy", JSON.parse(JSON.stringify(change)))
      this.getModel("tables").setProperty("/dialogpath", path)
      let parameter = this.getModel("prueba").getProperty("/CurrentParameter"), that = this
      switch (parameter) {
        case "process":
          this.getModel("tables").setProperty("/ProcessDialog", change)
          this.getModel("tables").setProperty("/Stages", [{ "name": change.stage, "stage_id": change.stage_id }])
          this.getModel("tables").setProperty("/Breeds", [{ "name": change.breed, "breed_id": change.breed_id }])
          this.formProjected = sap.ui.xmlfragment("higherLayer.view.parameters.ProcessDialog", this);
          var dlg = sap.ui.getCore().byId("processDialog");
          dlg.attachAfterClose(function () {
            that.formProjected.destroy();
          });
          this.getView().addDependent(this.formProjected);
          this.formProjected.open();
          if (change.stage_id == "1") {
            sap.ui.getCore().byId("checkboxprocess").setVisible(true)
          } else {
            sap.ui.getCore().byId("checkboxprocess").setVisible(false)
          }
          sap.ui.getCore().byId("breedos").setForceSelection(true)
          sap.ui.getCore().byId("Stageos").setForceSelection(true)
          sap.ui.getCore().byId("breedos").setEnabled(false)
          sap.ui.getCore().byId("Stageos").setEnabled(false)
          break;
        case "machines":
          this.LoadMachineGroups()
          let array = []

          this.getModel("tables").setProperty("/MachineDialog", change)
          this.formProjected = sap.ui.xmlfragment("higherLayer.view.parameters.MachineDialog", this);
          var dlg = sap.ui.getCore().byId("machineDialog");
          dlg.attachAfterClose(function () {
            that.formProjected.destroy();
          });
          this.getView().addDependent(this.formProjected);
          this.formProjected.open();
          sap.ui.getCore().byId("SelectPlantInc").setSelectedKey(change.incubatorplant_id)
          for (var key in change) {
            if (change[key] === true) {
              array.push(key)
            }
          }
          sap.ui.getCore().byId("MultiDay").setSelectedKeys(array)
          break;
        case "sex":

          this.getModel("tables").setProperty("/SexDialog", change)
          this.LoadBreedsSex()

          this.formProjected = sap.ui.xmlfragment("higherLayer.view.parameters.SexDialog", this);
          var dlg = sap.ui.getCore().byId("sexDialog");
          dlg.attachAfterClose(function () {
            that.formProjected.destroy();
          });
          this.getView().addDependent(this.formProjected);
          this.formProjected.open();
          sap.ui.getCore().byId("breeds").setForceSelection(true)
          sap.ui.getCore().byId("genderic").setForceSelection(true)
          sap.ui.getCore().byId("genderic").setSelectedKey(change.gender)
          sap.ui.getCore().byId("breeds").setSelectedKey(change.breed_id)
          break;
        case "eviction":
          this.getModel("tables").setProperty("/EvictionDialog", change)




          this.formProjected = sap.ui.xmlfragment("higherLayer.view.parameters.EvictionDialog", this);
          var dlg = sap.ui.getCore().byId("evictionDialog");
          dlg.attachAfterClose(function () {
            that.formProjected.destroy();
          });
          this.getView().addDependent(this.formProjected);
          this.formProjected.open();
          break;
      }
    },
    LoadBreedsSex: function () {
      let that = this
      fetch("/higherLayer/findBreedForGenderClass", {
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
              that.getView().getModel("tables").setProperty("/Breeds", res.data)

            });
          }
        )
        .catch(function (err) {
          console.log("Fetch Error :-S", err);
        });
    },
    LoadMachineGroups: function () {
      // let data = this.getModel("").getProperty("/")
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      fetch("/higherLayer/findIncPlantByPartnership", {
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
          response.json().then((res) => {
            console.log(res.data);
            this.getModel("tables").setProperty("/IncubatorPlants", res.data)


          });


        })
        .catch(err => console.log);
    },
    LoadStage: function () {
      let that = this
      fetch("/higherLayer/findStageByBreedAvailable", {
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
              console.log(res.data)
              that.getView().getModel("tables").setProperty("/Stages", res.data)

            });
          }
        )
        .catch(function (err) {
          console.log("Fetch Error :-S", err);
        });
    },

    LoadBreed: function (oEvent) {
      let stage = oEvent.getSource().getSelectedKey();
      console.log(stage)
      fetch("/higherLayer/findBreedByStageid", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          stage_id: stage
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
            this.getModel("tables").setProperty("/Breeds", res.data)
            sap.ui.getCore().byId("breedos").setSelectedKey(null);


          });


        })
        .catch(err => console.log);
    },
    SaveProcess: function () {
      let data = this.getModel("tables").getProperty("/ProcessDialog")
      console.log(data)
      // let breed = sap.ui.getCore().byId("breedos").getSelectedKey(),
      //   stage = sap.ui.getCore().byId("Stageos").getSelectedKey()
      // data.stage_id = stage
      // data.breed_id = breed
      fetch("/higherLayer/addProcess", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          records: [data]
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
            this.getModel("tables").setProperty("/ProcessTable", res.data)
            this.formProjected.destroy();


          });


        })
        .catch(err => console.log);
    },
    SaveMachine: function (oEvent) {
      let data = this.getModel("tables").getProperty("/MachineDialog")

      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      let days = sap.ui.getCore().byId("MultiDay").getSelectedItems(),
        stage = sap.ui.getCore().byId("SelectPlantInc").getSelectedKey()
      data.incubatorplant_id = stage

      // data.breed_id=breed

      days.map(function (days) {

        data[days.getKey()] = true
        return days;
      });
      console.log(data)

      fetch("/higherLayer/addMachineGroup", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          records: [data],
          partnership_id: partnership_id
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
            this.getModel("tables").setProperty("/MachineTable", res.data)
            this.formProjected.destroy();


          });


        })
        .catch(err => console.log);
    },


    SaveSex: function (oEvent) {
      let data = this.getModel("tables").getProperty("/SexDialog")
      let gender = sap.ui.getCore().byId("genderic").getSelectedKey(),
        breed = sap.ui.getCore().byId("breeds").getSelectedKey()
      data.breed_id = parseInt(breed)
      data.gender = gender
      data.mortality = parseFloat(data.mortality)
      data.weight_gain = parseFloat(data.weight_gain)
      data.age = parseInt(data.age)

      console.log(data)
      fetch("/higherLayer/addGenderCl", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          records: [data]
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
            this.getModel("tables").setProperty("/SexTable", res.data)
            this.formProjected.destroy();


          });


        })
        .catch(err => console.log);
    },
    SaveEviction: function (oEvent) {
      let data = this.getModel("tables").getProperty("/EvictionDialog")
      console.log(data)
      data.oldfemale = parseFloat(data.oldfemale)
      data.oldmale = parseFloat(data.oldmale)
      data.youngfemale = parseFloat(data.youngfemale)
      data.youngmale = parseFloat(data.youngmale)
      data.peasantmale = parseFloat(data.peasantmale)


      fetch("/higherLayer/addEvictionPartition", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          records: [data]
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
            this.getModel("tables").setProperty("/EvictionTable", res.data)
            this.formProjected.destroy();


          });


        })
        .catch(err => console.log);
    },

    DeleteprocessDialog: function (oEvent) {
      this.getModel("tables").setProperty("/CurrentObject", oEvent.getSource().getBindingContext("tables").getObject())
      let that = this
      var dialog = new Dialog({
        title: 'Eliminar',
        type: 'Message',
        content: new Text({ text: '¿Seguro que desea eliminar este proceso?' }),
        beginButton: new Button({
          text: 'Aceptar',
          press: function (pc) {
            let data = that.getModel("tables").getProperty("/CurrentObject")
            console.log(data)
            fetch("/higherLayer/updateDeletedProcess", {
              method: "PUT",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                slprocess_id: data.slprocess_id
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
                  that.getModel("tables").setProperty("/ProcessTable", res.data)
                  MessageToast.show("Proceso eliminado con éxito");
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
    DeleteMachineDialog: function (oEvent) {
      this.getModel("tables").setProperty("/CurrentObject", oEvent.getSource().getBindingContext("tables").getObject())
      let that = this
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      var dialog = new Dialog({
        title: 'Eliminar',
        type: 'Message',
        content: new Text({ text: '¿Seguro que desea eliminar este grupo de máquinas?' }),
        beginButton: new Button({
          text: 'Aceptar',
          press: function (pc) {
            let data = that.getModel("tables").getProperty("/CurrentObject")
            console.log(data)
            fetch("/higherLayer/updateDeletedMachineGroup", {
              method: "PUT",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                partnership_id: partnership_id,
                slmachinegroup_id: data.slmachinegroup_id
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
                  that.getModel("tables").setProperty("/MachineTable", res.data)
                  MessageToast.show("Grupo de máquinas eliminado con éxito");
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
    DeleteSexDialog: function (oEvent) {
      this.getModel("tables").setProperty("/CurrentObject", oEvent.getSource().getBindingContext("tables").getObject())
      let that = this
      var dialog = new Dialog({
        title: 'Eliminar',
        type: 'Message',
        content: new Text({ text: '¿Seguro que desea eliminar esta clasificación de sexaje?' }),
        beginButton: new Button({
          text: 'Aceptar',
          press: function (pc) {
            let data = that.getModel("tables").getProperty("/CurrentObject")
            console.log(data)
            fetch("/higherLayer/updateDeletedGenderCl", {
              method: "PUT",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                slgenderclassification_id: data.slgenderclassification_id
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
                  that.getModel("tables").setProperty("/SexTable", res.data)
                  MessageToast.show("Clasificación de sexaje eliminada con éxito");
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

    DeleteEvictionDialog: function (oEvent) {
      this.getModel("tables").setProperty("/CurrentObject", oEvent.getSource().getBindingContext("tables").getObject())
      let that = this
      var dialog = new Dialog({
        title: 'Eliminar',
        type: 'Message',
        content: new Text({ text: '¿Seguro que desea eliminar esta partición de desalojo?' }),
        beginButton: new Button({
          text: 'Aceptar',
          press: function (pc) {
            let data = that.getModel("tables").getProperty("/CurrentObject")
            console.log(data)
            fetch("/higherLayer/updateDeletedEvictionPartition", {
              method: "PUT",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                slevictionpartition_id: data.slevictionpartition_id
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
                  that.getModel("tables").setProperty("/EvictionTable", res.data)
                  MessageToast.show("Partición de desalojo eliminada con éxito");
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
    AlterStates: function (oEvent) {
      console.log(oEvent.getSource().getBindingContext("tables").getPath())
      console.log(oEvent.getSource().getBindingContext("tables").getObject())
      this.getModel("tables").setProperty("/CurrentObject", oEvent.getSource().getBindingContext("tables").getObject())
      let that = this
      let tata = oEvent.getSource().getBindingContext("tables").getPath(),
        text, title
      if (oEvent.getSource().getBindingContext("tables").getObject().active == true) {
        text = '¿Seguro que desea activar esta partición?'
        title = 'Activar'
      } else {
        text = '¿Seguro que desea desactivar esta partición?'
        title = 'Desactivar'
      }
      var dialog = new Dialog({
        title: title,
        type: 'Message',
        content: new Text({ text: text }),
        beginButton: new Button({
          text: 'Aceptar',
          press: function (pc) {
            let data = that.getModel("tables").getProperty("/CurrentObject")
            console.log(data)
            fetch("/higherLayer/updateActiveEvictionPartition", {
              method: "PUT",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                slevictionpartition_id: data.slevictionpartition_id,
                active: data.active
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
                  that.getModel("tables").setProperty("/EvictionTable", res.data)
                  dialog.close();


                });


              })
              .catch(err => console.log);

          }
        }),
        endButton: new Button({
          text: 'Cancelar',
          press: function () {
            console.log(tata);
            let ro = that.getModel("tables").getProperty(tata)
            ro.active = !ro.active
            that.getModel("tables").setProperty(tata, ro)
            // .setState(false)
            dialog.close();
          }
        }),
        afterClose: function () {
          dialog.destroy();
        }
      });
      dialog.open();


    },

    SaveChangeProcess: function (oEvent) {
      var that = this;
      let pass = false
      var oView = sap.ui.getCore()
      // let parameter = this.getModel("prueba").getProperty("/CurrentParameter")
      // this.getModel("tables").setProperty("/ButtonsParameter", true)
      var bValidationError = false;
      var aInputs = [
        oView.byId("inputname"),
        oView.byId("inputduration"),
      ];
      var bInputs = [

        oView.byId("inputdecrease"),

      ];
      jQuery.each(aInputs, function (i, oInput) {
        bValidationError = that._validateInput(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      jQuery.each(bInputs, function (i, oInput) {
        bValidationError = that._validateInputcanzero(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      if (pass == false) {
        this.SaveChangeProcessAfterValidation()
      }
    },
    SaveChangeProcessAfterValidation: function (oEvent) {
      let data = this.getModel("tables").getProperty("/ProcessDialog")
      console.log(data)
      let breed = sap.ui.getCore().byId("breedos").getSelectedKey(),
        stage = sap.ui.getCore().byId("Stageos").getSelectedKey()
      data.stage_id = parseInt(stage)
      data.breed_id = parseInt(breed)
      data.duration_process = parseInt(data.duration_process)
      console.log(data)
      fetch("/higherLayer/updateProcess", {
        method: "PUT",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          records: [data]
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
            this.getModel("tables").setProperty("/ProcessTable", res.data)
            MessageToast.show("Modificación exitosa");
            this.formProjected.destroy();


          });


        })
        .catch(err => console.log);
    },
    SaveChangeMachine: function (oEvent) {
      var that = this;
      let pass = false
      var oView = sap.ui.getCore()
      var bValidationError = false;

      var aInputs = [
        oView.byId("inputname"),
        oView.byId("inputcharges"),
        oView.byId("inputamount")
      ];
      var bInputs = [
        oView.byId("MultiDay"),
      ];

      jQuery.each(bInputs, function (i, oInput) {
        bValidationError = that._validateComboBox(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      jQuery.each(aInputs, function (i, oInput) {
        bValidationError = that._validateInput(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });

      if (pass == false) {
        this.SaveaftervalidateMachine()

      }
    },
    SaveaftervalidateMachine: function (oEvent) {
      let data = this.getModel("tables").getProperty("/MachineDialog")
      console.log(data)
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      let days = sap.ui.getCore().byId("MultiDay").getSelectedItems(),
        stage = sap.ui.getCore().byId("SelectPlantInc").getSelectedKey()
      data.incubatorplant_id = stage
      // data.breed_id=breed
      console.log(days)
      for (var key in data) {
        if (data[key] === true) {
          data[key] = false
        }
      }
      days.map(function (days) {
        console.log(days.getKey())
        data[days.getKey()] = true
        return days;
      });

      data.incubatorplant_id = parseInt(data.incubatorplant_id)
      data.amount_of_charge = parseInt(data.amount_of_charge)
      data.charges = parseInt(data.charges)
      console.log(data)
      fetch("/higherLayer/updateMachineGroup", {
        method: "PUT",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          partnership_id: partnership_id,
          records: [data]
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
            MessageToast.show("Modificación exitosa");
            this.formProjected.destroy();


          });


        })
        .catch(err => console.log);
    },

    SaveChangeSex: function (oEvent) {
      var that = this;
      let pass = false
      var oView = sap.ui.getCore()
      // let parameter = this.getModel("prueba").getProperty("/CurrentParameter")
      // this.getModel("tables").setProperty("/ButtonsParameter", true)
      var bValidationError = false;
      var aInputs = [
        oView.byId("inputaname"),
        oView.byId("inpugain"),
        oView.byId("inputage"),
        oView.byId("inputdead")
      ];

      var bInputs = [
        oView.byId("genderic"),
        oView.byId("breeds"),

      ];
      jQuery.each(bInputs, function (i, oInput) {
        bValidationError = that._validateselect(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      jQuery.each(aInputs, function (i, oInput) {
        bValidationError = that._validateInput(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      if (pass == false) {
        this.SaveChangeSexAfterValidation()
      }
    },
    SaveChangeSexAfterValidation: function (oEvent) {
      let data = this.getModel("tables").getProperty("/SexDialog")
      console.log(data)
      let breed = sap.ui.getCore().byId("breeds").getSelectedKey(),
        gender = sap.ui.getCore().byId("genderic").getSelectedKey()
      data.gender = gender
      data.breed_id = parseInt(breed)
      data.mortality = parseFloat(data.mortality)
      data.weight_gain = parseFloat(data.weight_gain)
      data.age = parseInt(data.age)

      console.log(data)
      fetch("/higherLayer/updateGenderCl", {
        method: "PUT",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          records: [data]
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
            this.getModel("tables").setProperty("/SexTable", res.data)
            MessageToast.show("Modificación exitosa");
            this.formProjected.destroy();


          });


        })
        .catch(err => console.log);
    },
    SaveChangeEviction: function (oEvent) {
      var that = this;
      let pass = false
      var oView = sap.ui.getCore()
      // let parameter = this.getModel("prueba").getProperty("/CurrentParameter")
      // this.getModel("tables").setProperty("/ButtonsParameter", true)
      var bValidationError = false;
      var aInputs = [
        oView.byId("inputname"),
        oView.byId("inputyounf"),
        oView.byId("inputfemale"),
        oView.byId("inputmanyound"),
        oView.byId("inputold"),
        oView.byId("inputcamp"),
      ];
      bValidationError = that.validateEvictionInputs(aInputs) || bValidationError;
      if (bValidationError == true) {
        pass = true
      }
      //  jQuery.each(aInputs, function (i, oInput) {

      // });

      console.log("aja", pass)
      if (pass === false) {
        this.SaveChangeEvictionAfterValidation()
      }
    },
    SaveChangeEvictionAfterValidation: function (oEvent) {
      console.log("entro")
      let data = this.getModel("tables").getProperty("/EvictionDialog")
      data.oldfemale = parseFloat(data.oldfemale)
      data.oldmale = parseFloat(data.oldmale)
      data.youngfemale = parseFloat(data.youngfemale)
      data.youngmale = parseFloat(data.youngmale)
      data.peasantmale = parseFloat(data.peasantmale)
      console.log("entro")
      console.log(data)
      fetch("/higherLayer/updateEvictionPartition", {
        method: "PUT",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          records: [data]
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
            this.getModel("tables").setProperty("/EvictionTable", res.data)
            MessageToast.show("Modificación exitosa");
            this.formProjected.destroy();


          });


        })
        .catch(err => console.log);
    },



    onProyectedCloseDialog: function (oEvent) {
      console.log("Aquiiiiii")
      this.formProjected.close();
      let object = this.getModel("tables").getProperty("/dialogcopy"),
        path = this.getModel("tables").getProperty("/dialogpath")
      this.getModel("tables").setProperty(path, object)
      this.formProjected.destroy();
    },
    onNavBackprocess: function (oEvent) {
      // var firstItem = this.getView().getModel("ospartnership").getProperty("/records/0");
      // var Oid = firstItem.getBindingContext("ospartnership").getPath().split("/");
      // var id = Oid[2];
      console.log("jp;s")
      this.getRouter().navTo("parameters", {
        id: 0
      }, false);
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
        input.setValueState("None");
        return false;
      }
    },
    validatenoinput: function (o) {
      let input = o.getSource();
      let value = input.getValue();
      if (value == " ") {
        input.setValue(undefined);

        return false;
      } else {

        // let aja = value.split("")
        // if(aja[aja.length-1]==" "){
        //   aja.pop()
        //   console.log(aja)
        //   let dd = aja.join("")
        //   input.setValue(dd);
        // }





        input.setValueState("None");
        return true
      }
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
        input.setValueState("None");
        return false;
      }
    },
    validateFloatInputMerma: function (o) {
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
        console.log("el value aqui:::", parseFloat(value))
        input.setValue(value);

        if (parseFloat(value) > 100) {
          input.setValueState("Error");
          input.setValueStateText("La merma no puede ser mayor al 100%");
        } else {
          input.setValueState("None");
          input.setValueStateText("");

        }

        return false;
      }
    },

    parametersSelect: function (oEvent) {
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      let id = this.getModel("ospartnership").getProperty("/selectedRecordPath").split("/")
      this.getRouter().navTo("parameters", { id: id[2], partnership_id: partnership_id }, false /*create history*/);
      let parameter = this.getModel("prueba").getProperty("/CurrentParameter")
      let that = this
      switch (parameter) {
        case "process":
          // this.ParametersViews(true, false, false, false)
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
          // this.ParametersViews(false, true, false, false)

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
          // this.ParametersViews(false, false, true, false)

          fetch("/higherLayer/findAllGenderCl", {
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
                  that.getView().getModel("tables").setProperty("/SexTable", res.data)

                });
              }
            )
            .catch(function (err) {
              console.log("Fetch Error :-S", err);
            });
          break;
        case "eviction":
          // this.ParametersViews(false, false, false, true)

          fetch("/higherLayer/findAllEvictionPartition", {
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
                  that.getView().getModel("tables").setProperty("/EvictionTable", res.data)

                });
              }
            )
            .catch(function (err) {
              console.log("Fetch Error :-S", err);
            });
          break;
      }


    },

    validateEvictionInputs: function (inputs) {
      let sum = 0, H = 0, M = 0
      let sValueState = "None",
        sValueStateText = "",
        bValidationError = false;
      console.log(inputs)
      inputs.forEach(itm => {
        sValueState = "None";
        sValueStateText = "";
        // console.log("El value:::: ",parseInt(itm.getValue()))
        // sum = sum + (parseInt(itm.getValue())>0?parseInt(itm.getValue()) : 0 );
        // console.log("La sum despues de agregarle el value:::::: ", sum)
        if (itm.getValue() == "" || itm.getValue() === null || itm.getValue() === undefined) {
          itm.setValueState(sValueState);
          sValueState = "Error";
          sValueStateText = "El campo no puede estar vacío";
          bValidationError = true;
        }

        if ((itm.sId === "inputyounf" || itm.sId === "inputfemale") && bValidationError === false) {
          H = H + parseInt(itm.getValue())
        }

        if ((itm.sId === "inputmanyound" || itm.sId === "inputold" || itm.sId === "inputcamp") && bValidationError === false) {
          M = M + parseInt(itm.getValue())
        }
        
        itm.setValueState(sValueState);
        itm.setValueStateText(sValueStateText);

      });


      console.log(parseInt(M + H))
      console.log(parseInt(H))
      console.log(parseInt(M))
      sum = parseInt(M + H)


      if (H !== 100 || M !== 100) {
        MessageToast.show("La suma de los parámetros para cada genero debe ser igual a 100");
      }
      console.log("La sum antes de salir::::: ", sum, bValidationError)
      return (sum !== 200 || bValidationError);

    },
    validateDialog: async function () {
      var that = this;
      let pass = false
      var oView = sap.ui.getCore()
      let parameter = this.getModel("prueba").getProperty("/CurrentParameter")
      this.getModel("tables").setProperty("/ButtonsParameter", true)
      var bValidationError = false;
      var cValidationError = false;
      var pass_i = false;
      let pass_i_ev = false;
      switch (parameter) {
        case "process":
          var aInputs = [
            oView.byId("inputname"),
            oView.byId("inputduration"),
          ];
          var cInputs = [
            oView.byId("inputdecrease"),
          ];
          var bInputs = [
            oView.byId("Stageos"),
            oView.byId("breedos"),

          ];
          await jQuery.each(bInputs, function (i, oInput) {
            bValidationError = that._validateselect(oInput) || bValidationError;
            if (bValidationError == true) {
              pass = true
            }

          });
          await jQuery.each(cInputs, function (i, oInput) {
            bValidationError = that._validateInputcanzero(oInput) || bValidationError;
            if (bValidationError == true) {
              pass = true
            }

          });
          break;
        case "machines":
          var aInputs = [
            oView.byId("inputname"),
            oView.byId("inputcharges"),
            oView.byId("inputamount")
          ];
          var bInputs = [
            oView.byId("MultiDay"),
          ];

          var cInputs = [

            oView.byId("SelectPlantInc")

          ];

          await jQuery.each(bInputs, function (i, oInput) {
            bValidationError = that._validateComboBox(oInput) || bValidationError;
            // if (bValidationError == true) {
            //   pass = true
            // }
          })

          await jQuery.each(cInputs, function (i, oInput) {
            cValidationError = that._validateselect(oInput) || cValidationError;
            if (cValidationError === true || bValidationError === true) {
              pass = true
            }
          });
          break;
        case "sex":
          var aInputs = [
            oView.byId("inputaname"),
            oView.byId("inpugain"),
            oView.byId("inputage"),
            oView.byId("inputdead")
          ];
          var bInputs = [
            oView.byId("genderic"),
            oView.byId("breeds"),

          ];
          await jQuery.each(bInputs, function (i, oInput) {
            bValidationError = that._validateselect(oInput) || bValidationError;
            if (bValidationError == true) {
              pass = true
            }

          });
          break;
        case "eviction":
          var aInputs = [
            oView.byId("inputname"),
            oView.byId("inputyounf"),
            oView.byId("inputfemale"),
            oView.byId("inputmanyound"),
            oView.byId("inputold"),
            oView.byId("inputcamp"),
          ];
          pass_i = pass_i || that.validateEvictionInputs(aInputs);
          pass_i_ev = true;
          break;
      }
      console.log("pass_i despues de iterar::::: ", pass_i)
      if (pass_i_ev !== true) {
        await jQuery.each(aInputs, function (i, oInput) {
          console.log("hereee:::: ", oInput)
          bValidationError = that._validateInput(oInput) || bValidationError;
          if (bValidationError == true) {
            pass_i = true
          }

        });
      }


      if (pass === false && pass_i === false) {
        switch (parameter) {
          case "process":
            this.SaveProcess()
            MessageToast.show("El proceso ha sido creado con éxito");
            break;
          case "machines":
            this.SaveMachine()
            MessageToast.show("El grupo de máquinas ha sido creado con éxito");
            break;
          case "sex":
            this.SaveSex()
            MessageToast.show("La clasificación de sexaje ha sido creada con éxito");
            break;
          case "eviction":
            this.SaveEviction()
            MessageToast.show("La partición de desalojo ha sido creada con éxito");
            break;
        }
      }
    },

    _validateInput: function (oInput) {
      var oBinding = oInput.getBinding("value");
      console.log(oBinding)
      var sValueState = "None";
      var sValueStateText = "";
      var bValidationError = false;
      var sId = oInput.sId;

      if (oInput.getValue() == "" || oInput.getValue() == "0" || oInput.getValue() == "00" || oInput.getValue() == "000" || oInput.getValue() == "0000") {

        oInput.setValueState(sValueState);
        sValueState = "Error";
        sValueStateText = (sId === "inputname") || (sId === "inputaname") ? "El campo no puede estar vacío" : "El campo no puede estar vacío y debe ser mayor a cero";
        bValidationError = true;
      }

      oInput.setValueState(sValueState);
      oInput.setValueStateText(sValueStateText);

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
      var sValueStateText = "";
      var bValidationError = false;


      if (oBinding.length == 0) {
        oInput.setValueState(sValueState);
        oInput.setValueStateText(sValueStateText);
        sValueState = "Error";
        sValueStateText = "El campo no puede estar vacío";
        bValidationError = true;
      }

      oInput.setValueState(sValueState);
      oInput.setValueStateText(sValueStateText);

      return bValidationError;
    },

    _validateselect: function (oInput) {
      var sValueState = "None";
      var sValueStateText = "";
      var bValidationError = false;
      if (oInput.getSelectedItem() == null) {
        oInput.setValueState(sValueState);
        sValueState = "Error";
        sValueStateText = "El campo no puede estar vacío"
        bValidationError = true;
      }
      oInput.setValueState(sValueState);
      oInput.setValueStateText(sValueStateText);
      return bValidationError;
    },




  });
});
