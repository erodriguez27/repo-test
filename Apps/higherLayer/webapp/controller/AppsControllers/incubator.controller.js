sap.ui.define([
  "higherLayer/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/Dialog",
  'sap/m/MessageToast',
  "sap/m/Text",
  "sap/m/Button"
], function (BaseController, JSONModel, Dialog, MessageToast, Text, Button) {
  "use strict";

  return BaseController.extend("higherLayer.controller.AppsControllers.incubator", {


    onInit: function () {

      this.setFragments();
      this.getRouter().getRoute("incubator").attachPatternMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function (oEvent) {
      var oArguments = oEvent.getParameter("arguments");

      this.index = oArguments.id;
      this.getView().getParent().getParent().setMode("HideMode");
      this.getView().getParent().getParent().setMode("ShowHideMode");
      this.getView().getParent().getParent().setMode("HideMode");


      let ospartnership = this.getModel("ospartnership");
      this.getView().byId("icontabbar").setSelectedKey("projected");
      this.getView().byId("NewProductionProgrammed").setVisible(false)
      this.getView().byId("SaveProductionProgrammed").setVisible(false)
      this.getView().byId("programmedTab").setEnabled(false)


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
      console.log("FinishrouteM")
      this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
      this.onRead(this.index);
      this.getModel("incubator").setProperty("/incubatorMain", {})
      this.getModel("incubator").setProperty("/incubatorTable", {})
      let that = this
      fetch("/higherLayer/findAllScenariosProgrammedByStage", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          stage_id: 6
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
            // that.getView().getModel("incubator").setProperty("/scenarios", res.data[0])     
            const result = res.data.filter(word => word.status === 1);
            // if(res.data.length!==1){
            //   res.data.unshift({ name: "Escenario", scenario_id: res.data[0].scenario_id})
            // }
            // this.getModel("incubator").setProperty("/activescenariooo", result[0])
            this.getView().getModel("incubator").setProperty("/scenarios", result[0])
            this.getModel("incubator").setProperty("/selectScenariomains", res.data)  
            this.getModel("incubator").setProperty("/incubatorMain/scenario_id", res.data[0].scenario_id)  
          });


        })
        .catch(err => console.log);
      // fetch("/scenario/activeScenario", {
      //   method: "GET",
      // })
      //   .then(
      //     function (response) {
      //       if (response.status !== 200) {
      //         console.log("Looks like there was a problem. Status Code: " +
      //           response.status);
      //         return;
      //       }

      //       response.json().then(function (res) {
      //         console.log(res)
      //         that.getView().getModel("incubator").setProperty("/scenarios", res)

      //       });
      //     }
      //   )
      //   .catch(function (err) {
      //     console.log("Fetch Error :-S", err);
      //   });
    },
    onRead: async function (index) {
      let ospartnership = this.getModel("ospartnership"),
        mdscenario = this.getModel("mdscenario")
      //   activeS = await this.activeScenario();
      console.log("OnRead")
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

    PopOverProductionProjected: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("incubator").getObject(),
        breed = parseInt(data.slbreeding_id),
        projected = {
          decrease: data.decrease,
          duration: data.duration
        }
   

      this.getModel("incubator").setProperty("/ProjectedPopOverProduction", projected)
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.incubator.PopOverProjectedDone", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
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

      
      let incubator = this.getModel("incubator").getProperty("/SelectedExecuted").s_date,
          selected = this.getModel("incubator").getProperty("/SelectedExecuted"),
          scen = this.getModel("incubator").getProperty("/scenarios"),
          that = this;

      console.log(incubator, selected)
      console.log(scen)
      fetch("/sltxincubator/findLotProduction", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          scenario: scen.scenario_id,
          date: incubator
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
            
            res.data.forEach(itm => {
              itm.slincubator_curve_id = itm.slincubator_curve_id !== null ? 'cv'+ itm.slincubator_curve_id : null;
              itm.slsellspurchase_id = itm.slsellspurchase_id !== null ? 'cp' + itm.slsellspurchase_id : null;
            });
            this.getModel("incubator").setProperty("/lots", res.data)
            this.formProjected = sap.ui.xmlfragment("higherLayer.view.incubator.NewProgrammedDialog", this);
            var dlg = sap.ui.getCore().byId("newProgrammedDialog");
            dlg.attachAfterClose(function () {
              that.formProjected.destroy();
            });
            this.getView().addDependent(this.formProjected);
            this.formProjected.open();


          });


        })
        .catch(err => console.log);



    },
    findMachineGroupByDayOfWork: function (oEvent) {
      this.Blockselects()
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id"),
        date = oEvent.getSource().getValue()


      fetch("/higherLayer/findMachineGroupByDayOfWork", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          partnership_id: partnership_id,
          date: date
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
            if(res.data.length===0){
              MessageToast.show("No encontraron máquinas disponibles para esta fecha");
            }else{
              sap.ui.getCore().byId("selectsmachine").setEnabled(true)
              this.getModel("incubator").setProperty("/machines", res.data)
            }
           


          });


        })
        .catch(err => console.log);

    },
    CloseDialog: function (oEvent) {
      this.getModel("incubator").setProperty("/programmedList", [])
      this.getModel("incubator").setProperty("/incubatorDialog", {})
      this.getModel("incubator").setProperty("/selectedLot", [])
      this.formProjected.destroy();
    },


    onTabSelection: function (oEvent) {
      this.LoadIncubator()
      this.getView().byId("projectedtable").removeSelections();
      var selectedKey = oEvent.getSource().getSelectedKey();
      if (selectedKey == "programed") {
        this.getView().byId("NewProductionProgrammed").setVisible(true)
        this.getView().byId("SaveProductionProgrammed").setVisible(true)
      } else {
        this.getView().byId("NewProductionProgrammed").setVisible(false)
        this.getView().byId("SaveProductionProgrammed").setVisible(false)
        this.getView().byId("programmedTab").setEnabled(false)
      }
    },


    validateIntInput: function (o) {
      let input = o.getSource();
      let length = 10;
      let value = input.getValue();
      let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

      if (regex.test(value)) {
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
    validateEspecialIntInput: function (o) {
      let input = o.getSource();
      let length = 10;
      let value = input.getValue();
      let regex = new RegExp(`/^[0-9]{1,${length}}$/`);
      let selectitem = sap.ui.getCore().byId("selectsmachine").getSelectedItem().getBindingContext("incubator").getObject()
      console.log(selectitem)
      console.log(selectitem.amount_of_charge)
      console.log(value)
      if (parseInt(value) > selectitem.amount_of_charge) {
        input.setValueState("Error");
        sap.ui.getCore().byId("savebuttondialog").setEnabled(false)
        sap.ui.getCore().byId("nutton").setEnabled(false)
        input.setValueStateText("El campo no puede estar vacío y debe ser menor o igual a " + selectitem.amount_of_charge + " (Capacidad máxima por carga de la máquina seleccionada)");
      } else {
        if (parseInt(value) === 0) {
          input.setValueState("Error");
          sap.ui.getCore().byId("savebuttondialog").setEnabled(false)
          sap.ui.getCore().byId("nutton").setEnabled(false)
          input.setValueStateText("El campo debe ser mayor a 0");
        } else {
          input.setValueState("None");
          sap.ui.getCore().byId("savebuttondialog").setEnabled(true)
          sap.ui.getCore().byId("nutton").setEnabled(true)
        }
      }



      if (regex.test(value)) {
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

    LoadIncubator: function (oEvent) {
      let data = this.getModel("incubator").getProperty("/incubatorMain")
      // let scenario = this.getModel("incubator").getProperty("/scenarios")
      let that = this
      data.scenario_id = parseInt(data.scenario_id)
      console.log(data)




      if (Date.parse(data.init_date) > Date.parse(data.end_date)) {
        MessageToast.show("Ingrese un rango de fecha válido");
        this.getModel("incubator").setProperty("/incubatorTable", {})
      } else {

        fetch("/sltxIncubator/findIncubator", {
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
              MessageToast.show("Ingrese un rango de fecha válido");
              return;
            }
            response.json().then((res) => {
              console.log(res.data);
              if (res.data.length == 0) {
                MessageToast.show("No se encontraron registros");
              }

              res.data.forEach(function (element) {
                element.amountaja= that.getNumberWithCommas(element.scheduled_quantity)
                element.saldoaja= that.getNumberWithCommas(element.scheduled_quantity-parseInt(element.residue))
                element.needd= that.getNumberWithCommas(element.eggsrequired)
                
              });
              this.getView().getModel("incubator").setProperty("/scenarios", data)
              this.getModel("incubator").setProperty("/incubatorTable", res.data)
              this.getModel("incubator").setProperty("/incubatorMainCopy", data)
              // this.getModel("breedingplanning").setProperty("/farms", res.farms)
            });


          })
          .catch(err => console.log);
      }
    },

    getNumberWithCommas: function (number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },


    DeleteIncubation: function (oEvent) {

      let that = this
      let data = oEvent.getParameter('listItem').getBindingContext("incubator").getObject()
      console.log(data)
      var dialog = new Dialog({
        title: 'Eliminar',
        type: 'Message',
        content: new Text({ text: '¿Seguro que desea eliminar esta programación?' }),
        beginButton: new Button({
          text: 'Aceptar',
          press: function (pc) {
            fetch("/higherLayer/", {
              method: "DELETE",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                slincubator_detail_id: data.slincubator_detail_id,
                incubator_id: data.incubator_id,
                stage_id: 2
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
                  that.getModel("incubator").setProperty("/incubatorProgrammedTable", res.data)
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


    LoadProgramed: function (oEvent) {
      // let find = oEvent.getSource()._aSelectedPaths[0]
      let data = oEvent.getSource().getBindingContext("incubator").getObject()
      console.log(data)
      data.s_date = new Date(data.s_date)
      oEvent.getSource().setSelected(false)
      fetch("/sltxIncubatorDetail/findProgrammedIncubator", {
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
            console.log(res.data);
            this.getModel("incubator").setProperty("/incubatorProgrammedTable", res.data)
            this.getModel("incubator").setProperty("/SelectedExecuted", data)
            this.getView().byId("programmedTab").setEnabled(true)
            this.getView().byId("icontabbar").setSelectedKey("programed")
            this.getView().byId("NewProductionProgrammed").setVisible(true)
            this.getView().byId("SaveProductionProgrammed").setVisible(true)
            // this.getModel("breedingplanning").setProperty("/farms", res.farms)

          });


        })
        .catch(err => console.log);

    },
    onProgrammeddSaveDialog: function (oEvent) {
      oEvent.getSource().setEnabled(false)
      var that = this;
      let pass = false
      var oView = sap.ui.getCore()
      var aInputs = [
        oView.byId("projected_datess")
      ];
      var aselect = [
        oView.byId("selectsmachine"),
        oView.byId("selectlot")
      ];


      var bValidationError = false;
      jQuery.each(aInputs, function (i, oInput) {
        bValidationError = that._validateInput(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }
      });

      var bValidationError = false;
      jQuery.each(aselect, function (i, oInput) {
        bValidationError = that._validateselect(oInput) || bValidationError;
        if (bValidationError == true) {
          pass = true
        }

      });
      oEvent.getSource().setEnabled(true)
      let list = this.getModel("incubator").getProperty("/programmedList")
      list.forEach(itm => {
        itm.slsellspurchase_id = itm.slsellspurchase_id !== null ? parseInt(itm.slsellspurchase_id.split('cp')[1]) : null;
        itm.slincubator_curve_id = itm.slincubator_curve_id !== null ? parseInt(itm.slincubator_curve_id.split('cv')[1]) : null;
      });
      if (list.length === 0 && pass == false) {
        pass = true
        MessageToast.show("Ingrese una cantidad");
      }


      if (pass == false) {

        oEvent.getSource().setEnabled(false)
        let data = this.getModel("incubator").getProperty("/incubatorDialog")
        let incubator = this.getModel("incubator").getProperty("/SelectedExecuted").slincubator
        data.incubator_id = incubator
        data.slmachinegroup_id = parseInt(data.slmachinegroup_id)
        console.log({ record: [data], lots: list })

        fetch("/sltxIncubatorDetail/addNewProgrammed", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({ record: [data], lots: list })
        })
          .then(response => {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " +
                response.status);
              return;
            }
            response.json().then((res) => {
              console.log(res.data);
              this.getModel("incubator").setProperty("/incubatorProgrammedTable", res.data)
              this.getModel("incubator").setProperty("/incubatorDialog", {})
              MessageToast.show("Programación creada con éxito");
              this.getModel("incubator").setProperty("/programmedList", [])
              this.getModel("incubator").setProperty("/selectedLot", [])
              // this.getModel("breedingplanning").setProperty("/farms", res.farms)
              this.formProjected.destroy();
            });


          })
          .catch(err => console.log);
        oEvent.getSource().setEnabled(true)
      }
    },

    ChangeDecreaseButton: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("incubator").getObject(),
          that = this;
      console.log(data)
      this.getModel("incubator").setProperty("/CurrentObject", data)
      fetch("/higherLayer/findProcessByIncStage", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ stage_id: 2 })
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
            this.getModel("incubator").setProperty("/DecreaseDialog", res.data)
            this.formProjected = sap.ui.xmlfragment("higherLayer.view.incubator.ChangeDecreaseDialog", this);
            var dlg = sap.ui.getCore().byId("decreaseDialog");
            dlg.attachAfterClose(function () {
              that.formProjected.destroy();
            });
            this.getView().addDependent(this.formProjected);
            this.formProjected.open();
            // this.getModel("breedingplanning").setProperty("/farms", res.farms)
          });


        })
        .catch(err => console.log);


    },
    onAddResidue: function (oEvent) {
      let quantity = this.getModel("incubator").getProperty("/incubatorDialog/programmed_quantity")
      let slincubator = this.getModel("incubator").getProperty("/incubatorDialog/lot")
      let list = this.getModel("incubator").getProperty("/programmedList"),
        check, sum = 0
      let selectitem = sap.ui.getCore().byId("selectsmachine").getSelectedItem().getBindingContext("incubator").getObject()
      let aja = sap.ui.getCore().byId("selectlot").getSelectedItem().getBindingContext("incubator").getObject()
      console.log(aja)
      
      let item = {
        quantity: quantity,
        slincubator_curve_id: aja.slincubator_curve_id,
        slsellspurchase_id: aja.slsellspurchase_id,
        lot: aja.lot
      }
      console.log(item)


      list.find(function (element) {
        if ((element.slincubator_curve_id === item.slincubator_curve_id &&  element.slincubator_curve_id != null )|| (element.slsellspurchase_id === item.slsellspurchase_id  &&  element.slsellspurchase_id != null) ) {
          check = true
          console.log("entro al primero")
          return true
        }
      });

      list.forEach(function (element) {
        sum = parseInt(sum) + parseInt(element.quantity)
      });
      sum = parseInt(parseInt(sum) + parseInt(quantity));
      console.log(sum)
      if (sum > selectitem.amount_of_charge) {
        MessageToast.show("No puede exceder la capacidad maxima de la maquina seleccionada");
      }

      if (sum > selectitem.amount_of_charge || quantity === undefined  || quantity === "" || quantity === null || quantity === " ") {
      } else {

        let saldo=this.getModel("incubator").getProperty("/selectedLot/quantity")
        this.getModel("incubator").setProperty("/selectedLot/quantity", parseInt(saldo - quantity))

        if (check === true) {
          list.forEach(function (element) {
            if ((element.slincubator_curve_id === item.slincubator_curve_id &&  element.slincubator_curve_id != null )|| (element.slsellspurchase_id === item.slsellspurchase_id  &&  element.slsellspurchase_id != null) ) {
              element.quantity = parseInt(parseInt(element.quantity) + parseInt(quantity));
            }
          });
          sum = 0
          list.forEach(function (element) {
            sum = parseInt(sum + element.quantity)
          });
          console.log(sum)
          if (sum > selectitem.amount_of_charge) {
            MessageToast.show("No puede exceder la capacidad maxima de la maquina seleccionada");
          } else {
            this.getModel("incubator").setProperty("/programmedList", list)
            this.getModel("incubator").setProperty("/incubatorDialog/programmed_quantity", undefined)

          }

          console.log("entro a sumar")

        } else {
          console.log("entro a agregar")
          sap.ui.getCore().byId("projected_datess").setEnabled(false)
          sap.ui.getCore().byId("selectsmachine").setEnabled(false)
          list.push(item)


          this.getModel("incubator").setProperty("/programmedList", list)
          this.getModel("incubator").setProperty("/incubatorDialog/programmed_quantity", undefined)

        }



      }




    },

    deleteProgrammedD: function (oEvent) {
      let aja = oEvent.getParameters().listItem.mProperties.title

      let list = this.getModel("incubator").getProperty("/programmedList")
      console.log(list)
      let bien = list.filter(item => item.lot != aja);
      let pepe = list.filter(item => item.lot === aja);
      let saldo=this.getModel("incubator").getProperty("/lots")

      console.log(pepe[0])
      console.log(saldo)

      saldo.forEach(function (element) {
        if ((element.slincubator_curve_id === pepe[0].slincubator_curve_id &&  element.slincubator_curve_id != null )|| (element.slsellspurchase_id === pepe[0].slsellspurchase_id  &&  element.slsellspurchase_id != null) ) {
        element.quantity = parseInt(parseInt(element.quantity) + parseInt(pepe[0].quantity))
        
        }
      });
      this.getModel("incubator").setProperty("/lots", saldo)
      let selected = sap.ui.getCore().byId("selectlot").getSelectedItem().getBindingContext("incubator").getObject();
      this.getModel("incubator").setProperty("/selectedLot", selected);
      if (bien.length == 0) {
        sap.ui.getCore().byId("projected_datess").setEnabled(true)
        sap.ui.getCore().byId("selectsmachine").setEnabled(true)
      }
      this.getModel("incubator").setProperty("/programmedList", bien)



    },
    SaveDecrease: function (oEvent) {
      oEvent.getSource().setEnabled(false)
      var that = this;
      let pass = false
      var oView = sap.ui.getCore()
      var aInputs = [
        oView.byId("incubatordecrease"),
        oView.byId("incubatorduration_process"),
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
        let data = this.getModel("incubator").getProperty("/incubatorMainCopy")
        let CurrentObject = this.getModel("incubator").getProperty("/CurrentObject")
        let Decrease = this.getModel("incubator").getProperty("/DecreaseDialog")

        CurrentObject.decrease = parseFloat(Decrease.decrease)
        CurrentObject.duration = parseInt(Decrease.duration_process)


        fetch("/sltxIncubatorDetail/projectIncubator", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({
            record: [CurrentObject]
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
              this.getModel("incubator").setProperty("/incubatorProgrammedTable", res.data)
              MessageToast.show("Proyección realizada con éxito");
              this.formProjected.destroy();


            });


          })
          .catch(err => console.log);
        oEvent.getSource().setEnabled(true)
      }
    },

    _validateInput: function (oInput) {
      var sValueState = "None";
      var bValidationError = false;

      if (oInput.getValue() == "") {
        oInput.setValueState(sValueState);
        sValueState = "Error";
        bValidationError = true;
      }
      oInput.setValueState(sValueState);
      return bValidationError;
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

    Blockselects: function () {
      let dialog = this.getModel("incubator").getProperty("/incubatorDialog")
        // selected = sap.ui.getCore().byId("selectlot").getSelectedItem().getBindingContext("incubator").getObject();
      if (dialog.lot === undefined || dialog.programmed_date === "" || dialog.programmed_date === undefined || dialog.slmachinegroup_id === undefined) {
        sap.ui.getCore().byId("inputincubator").setEnabled(false)
        sap.ui.getCore().byId("inputincubator").setValue(undefined)
        sap.ui.getCore().byId("nutton").setEnabled(false)
      } else {
        sap.ui.getCore().byId("inputincubator").setEnabled(true)
        sap.ui.getCore().byId("nutton").setEnabled(true)
      }
     


    },
    selectedllot: function () {
      let selected = sap.ui.getCore().byId("selectlot").getSelectedItem().getBindingContext("incubator").getObject();
      this.getModel("incubator").setProperty("/selectedLot", selected);
      this.Blockselects()


    },
    MaxChange: function (oEvent) {
      this.Blockselects()
      let selectitem = oEvent.getSource().getSelectedItem().getBindingContext("incubator").getObject()
      console.log(selectitem.amount_of_charge)
      this.getModel("incubator").setProperty("/MaxProperty", selectitem.amount_of_charge)




    },

    ExecutedIncubator: function (oEvent) {
      oEvent.getSource().setEnabled(false)
      let data = this.getModel("incubator").getProperty("/incubatorProgrammedTable")



      const result = data.filter(item => item.executed === false);

      let send = result.filter(item => item.real_decrease != null && item.real_decrease != "");
      //   send = send.map(function(x) {
      //     let y = x.scheduled_date.split("/")
      //     x.scheduled_date=y[2]+"-"+y[1]+"-"+y[0]
      //  });

      // let searcher = this.getModel("incubator").getProperty("/breedingMainCopy")
      // console.log(data)
      fetch("/sltxIncubatorDetail/executeIncubator", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          record: send
        })
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
              MessageToast.show("Ingrese parámetros validos para poder ejecutar");
            return;
          }
          response.json().then((res) => {
            console.log(res);
            this.getModel("incubator").setProperty("/incubatorProgrammedTable", res.data)
            // this.getModel("breedingplanning").setProperty("/breeds", res.breed)
            // this.getModel("breedingplanning").setProperty("/farms", res.farms)
            MessageToast.show(send.length + " elemento(s) ejecutado(s) con éxito");
          });


        })
        .catch(err => console.log);
      oEvent.getSource().setEnabled(true)
    },


  });
});
