sap.ui.define([
  "higherLayer/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/Dialog",
  'sap/m/MessageToast',
  "sap/m/Text",
  "sap/m/Button"
], function (BaseController, JSONModel, Dialog, MessageToast, Text, Button) {
  "use strict";

  return BaseController.extend("higherLayer.controller.AppsControllers.broiler", {


    onInit: function () {

      this.setFragments();
      this.getRouter().getRoute("broiler").attachPatternMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function (oEvent) {
      var oArguments = oEvent.getParameter("arguments");
      this.getView().getParent().getParent().setMode("HideMode");
      this.getView().getParent().getParent().setMode("ShowHideMode");
      this.getView().getParent().getParent().setMode("HideMode");
      this.index = oArguments.id;
      // var oSplitApp = this.byId("mySplitApp")
      // this.byId("__xmlview0").setVisible(false)


      let ospartnership = this.getModel("ospartnership");

      this.getView().byId("broilerIconTab").setSelectedKey("projected");
      this.getView().byId("NewProductionProgrammed").setVisible(false)
      this.getView().byId("ExecutedProductionProgrammed").setVisible(false)
      this.getView().byId("programed").setEnabled(false)



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

      this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
      this.onRead(this.index);
      this.getModel("broiler").setProperty("/broilerMain", {})
      this.getModel("broiler").setProperty("/broilerProjectedTable", {})
      // this.byId("__xmlview0--splitApp-MasterBtn").setVisible(false)

      fetch("/higherLayer/findAllScenariosProgrammedByStage", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          stage_id: 7
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
            // if (res.data.length !== 1) {
            //   res.data.unshift({ name: "Escenario", scenario_id: res.data[0].scenario_id })
            // }
            // this.getModel("incubator").setProperty("/activescenariooo", result[0])
            this.getView().getModel("broiler").setProperty("/scenarios", result[0])
            this.getModel("broiler").setProperty("/selectScenariomains", res.data)
            this.getModel("broiler").setProperty("/broilerMain/scenario_id", result[0].scenario_id)
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
    jaja: function (oEvent) {
      this.getView().getParent().getParent().setMode("ShowHideMode");
    },

    NewProductionProgrammed: function (oEvent) {
      let that = this
      let aja = this.getModel("broiler").getProperty("/SelectedExecuted")
      console.log(aja)


      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      fetch("/higherLayer/findScenarioBreedAndFarms", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          partnership_id: partnership_id,
          farm_type_id: 2,
          gender: aja.gender,
          stage_id: 7

        })
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            if (response.status == 409) {

              response.json().then((res) => {
                console.log(res)



                let message = res.msgClas + "\n" + res.msgPart + "\n" + res.msgProc




                this.onDialog('Warning', message);

              });
            }

            return;
          }
          response.json().then((res) => {
            console.log(res);
            this.getModel("broiler").setProperty("/scenarios", res.scenarios)
            this.getModel("broiler").setProperty("/breeds", res.breed)
            this.getModel("broiler").setProperty("/farms", res.farms)
            this.formProjected = sap.ui.xmlfragment("higherLayer.view.broiler.NewProgrammedDialog", this);
            var dlg = sap.ui.getCore().byId("newProgrammedDialog");






            
            dlg.attachAfterClose(function () {
              that.formProjected.destroy();
            });
            this.getView().addDependent(this.formProjected);
            this.formProjected.open();
          });


        })

    },
    CloseDialog: function (oEvent) {
      this.getModel("broiler").setProperty("/programmedList", [])
      this.getModel("broiler").setProperty("/broilerDialog", { "sheds": [] })
      this.getModel("broiler").setProperty("/selectedLot", [])
      let aja = this.getModel("broiler").getProperty("/lotscopy")
      this.getModel("broiler").setProperty("/lots", aja)

      this.formProjected.destroy();
    },

    onAddResidue: function (oEvent) {
      let quantity = this.getModel("broiler").getProperty("/broilerDialog/housing_quantity")
      let slbroiler_id = this.getModel("broiler").getProperty("/broilerDialog/slbroiler_id")
      let list = this.getModel("broiler").getProperty("/programmedList"),
        check, sum = 0, value = quantity, lettercheck, lastcheck = false
      // let selectitem = sap.ui.getCore().byId("selectsmachine").getSelectedItem().getBindingContext("broiler").getObject()
      let aja = sap.ui.getCore().byId("lotsbroiler").getSelectedItem().getBindingContext("broiler").getObject()
      console.log(aja)
      let saldo = this.getModel("broiler").getProperty("/selectedLot/quantityS")

      let item = {
        quantity: quantity,
        lot: aja.lot,
        slbroiler_id: aja.slbroiler_id,
        slsellspurchase_id: aja.slsellspurchase_id
      },
        max = aja.quantity - aja.residue
      console.log(item)



      list.find(function (element) {
        if ((element.slsellspurchase_id === item.slsellspurchase_id && element.slsellspurchase_id != null) || (element.slbroiler_id === item.slbroiler_id && element.slbroiler_id != null)) {
          value = parseInt(parseInt(element.quantity) + parseInt(quantity))
          check = true
          return true
        }
      });
      let letter = aja.lot.charAt(0)
      console.log(letter)
      if (letter === "A") {
        lettercheck = true
      }

      if (lettercheck == true && (saldo - quantity) < 0) {
        MessageToast.show("No puede exceder la capacidad maxima del lote de compra seleccionado");
        lastcheck = true
      }
      // list.forEach(function (element) {
      //   sum = parseInt(sum) + parseInt(element.quantity)
      // });
      // sum= parseInt(parseInt(sum) + parseInt(quantity));
      console.log(value)
      // if(value > max){
      //   MessageToast.show("el lote seleccionado tiene un maximo de "+ max);
      // }
      this.getModel("broiler").setProperty("/broilerDialog/housing_quantity", undefined)
      if (lastcheck === true || quantity === undefined || slbroiler_id === undefined || quantity === "" || quantity === null || quantity === " ") {
      } else {


        let path = sap.ui.getCore().byId("lotsbroiler").getSelectedItem().getBindingContext("broiler").getPath()
        console.log(path)
        this.getModel("broiler").setProperty(path + "/quantity", parseInt(saldo - quantity))
        this.getModel("broiler").setProperty("/selectedLot/quantityS", parseInt(saldo - quantity))

        if (check === true) {
          list.forEach(function (element) {
            if ((element.slsellspurchase_id === item.slsellspurchase_id && element.slsellspurchase_id != null) || (element.slbroiler_id === item.slbroiler_id && element.slbroiler_id != null)) {
              element.quantity = parseInt(parseInt(element.quantity) + parseInt(quantity));
            }
          });
          // sum=0
          // list.forEach(function (element) {
          //   sum = parseInt(sum + element.quantity)
          // });
          // console.log(sum)
          // if(value > max){
          //   MessageToast.show("No puede exceder la capacidad maxima del lote seleccionada");
          // }else{
          this.getModel("broiler").setProperty("/programmedList", list)
          this.getModel("broiler").setProperty("/broilerDialog/housing_quantity", undefined)

          // }



        } else {

          // sap.ui.getCore().byId("projected_datess").setEnabled(false)

          sap.ui.getCore().byId("selectfarmbroiler").setEnabled(false)
          sap.ui.getCore().byId("sheetsbroiler").setEnabled(false)
          sap.ui.getCore().byId("datebroiler").setEnabled(false)
          list.push(item)


          this.getModel("broiler").setProperty("/programmedList", list)
          this.getModel("broiler").setProperty("/broilerDialog/housing_quantity", undefined)

        }



      }




    },

    deleteProgrammedD: function (oEvent) {
      let aja = oEvent.getParameters().listItem.mProperties.title
      let qweqw = this.getModel("broiler").getProperty("/")
      console.log(qweqw)
      let list = this.getModel("broiler").getProperty("/programmedList")

      let bien = list.filter(item => item.lot != aja);
      let pepe = list.filter(item => item.lot === aja);
      console.log(pepe)
      let saldo = this.getModel("broiler").getProperty("/lots")

      // (element.slsellspurchase_id === item.slsellspurchase_id &&  element.slsellspurchase_id != null )|| (element.slbroiler_id === item.slbroiler_id  &&  element.slbroiler_id != null)
      saldo.forEach(function (element) {
        if ((element.slsellspurchase_id === pepe[0].slsellspurchase_id && element.slsellspurchase_id != null) || (element.slbroiler_id === pepe[0].slbroiler_id && element.slbroiler_id != null)) {
          console.log(element.quantityS)
          element.quantityS = parseInt(parseInt(element.quantityS) + parseInt(pepe[0].quantity))
          console.log("entra")
          console.log(element.quantityS)

        }
      });
      console.log(saldo)
      this.getModel("broiler").setProperty("/lots", saldo)
      let selected = sap.ui.getCore().byId("lotsbroiler").getSelectedItem().getBindingContext("broiler").getObject();
      console.log(selected)
      this.getModel("broiler").setProperty("/selectedLot", selected);





      if (bien.length == 0) {

        sap.ui.getCore().byId("selectfarmbroiler").setEnabled(true)
        sap.ui.getCore().byId("sheetsbroiler").setEnabled(true)
        sap.ui.getCore().byId("datebroiler").setEnabled(true)
      }
      this.getModel("broiler").setProperty("/programmedList", bien)



    },
    Blockselects: function () {
      let dialog = this.getModel("broiler").getProperty("/broilerDialog")
      // selected = sap.ui.getCore().byId("lotsbroiler").getSelectedItem().getBindingContext("broiler").getObject();
      if (dialog.farm_id === undefined || dialog.housing_date === "" || dialog.housing_date === undefined || dialog.sheds.length === 0 || dialog.sheds === undefined || dialog.slbroiler_id === undefined) {
        sap.ui.getCore().byId("inputbroiler").setEnabled(false)
        sap.ui.getCore().byId("inputbroiler").setValue(undefined)
        sap.ui.getCore().byId("nutton").setEnabled(false)
        console.log("aja")
      } else {
        sap.ui.getCore().byId("inputbroiler").setEnabled(true)
        sap.ui.getCore().byId("nutton").setEnabled(true)
      }
      // this.getModel("broiler").setProperty("/selectedLot", selected);



    },
    lotselect: function () {
      let selected = sap.ui.getCore().byId("lotsbroiler").getSelectedItem().getBindingContext("broiler").getObject();


      this.getModel("broiler").setProperty("/selectedLot", selected);
      this.Blockselects();



    },

    onTabSelection: function (oEvent) {
      this.LoadProjectedBroiler();
      this.getView().byId("broilerprojectedtable").removeSelections();
      var selectedKey = oEvent.getSource().getSelectedKey();
      if (selectedKey == "programed") {
        this.getView().byId("NewProductionProgrammed").setVisible(true)
        this.getView().byId("ExecutedProductionProgrammed").setVisible(true)
      } else {
        this.getView().byId("programed").setEnabled(false)
        this.getView().byId("NewProductionProgrammed").setVisible(false)
        this.getView().byId("ExecutedProductionProgrammed").setVisible(false)
      }
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

    PopOverBroiler: function (oEvent) {
      let data = oEvent.getSource().getBindingContext("broiler").getObject(),
        breed = parseInt(data.slbreeding_id)
      console.log({ breeding_id: breed })
      console.log(data)
      fetch("/sltxbr_shed/findShedsByLotProg", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ lot: data.lot, housing_quantity : data.housing_quantity})
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
            this.getModel("broiler").setProperty("/PopOverShets", res.data)
            // sap.ui.getCore().byId("sheets").setSelectedKey(null);

          });


        })
        .catch(err => console.log);
      this._oPopover = sap.ui.xmlfragment("higherLayer.view.broiler.PopOverBroiler", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },

    PopOverQuality: function (oEvent) {

      let data = oEvent.getSource().getBindingContext("broiler").getObject()
      this.getModel("broiler").setProperty("/PopOverChicks", data)




      this._oPopover = sap.ui.xmlfragment("higherLayer.view.broiler.PopOverQuality", this);
      this.getView().addDependent(this._oPopover);
      this._oPopover.openBy(oEvent.getSource());
    },

    DeleteBroiler: function (oEvent) {

      let that = this
      let data = oEvent.getParameter('listItem').getBindingContext("broiler").getObject()
      console.log(data)
      var dialog = new Dialog({
        title: 'Eliminar',
        type: 'Message',
        content: new Text({ text: '¿Seguro que desea eliminar esta programación?' }),
        beginButton: new Button({
          text: 'Aceptar',
          press: function (pc) {
            let dates = that.getModel("broiler").getProperty("/SelectedExecuted"),
            scenario = that.getModel("broiler").getProperty("/broilerMainCopy/scenario_id")
            fetch("/higherLayer/", {
              method: "DELETE",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                beginning: dates.init_date,
                ending: dates.end_date,
                gender: dates.gender,
                lot: data.lot,
                stage_id: 1,
                scenario_id: parseInt(scenario)
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
                  res.lots.forEach(function (element) {
                    element.quantityS = element.quantity - element.residue;
                  });
                  that.getModel("broiler").setProperty("/lots", res.lots)
                  that.getModel("broiler").setProperty("/broilerProgrammedTable", res.data)
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



    LoadProjectedBroiler: function (oEvent) {
      let data = this.getModel("broiler").getProperty("/broilerMain")
      console.log(data)
      data.scenario_id = parseInt(data.scenario_id)



      if (Date.parse(data.beginning) > Date.parse(data.ending)) {
        MessageToast.show("Ingrese un rango de fecha válido");
        this.getModel("broiler").setProperty("/broilerProjectedTable", [])
      } else {



        fetch("/sltxBroiler/findBroilerByDateRange", {
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
              console.log(res);

              // res.data.forEach(function (element) {
              //   element.ponderet = parseFloat(element.inventory / (element.total_eggs / 7))
              // });
              console.log(res.data);
              if (res.data.length === 0) {
                MessageToast.show("No se encontraron registros");
              }
              this.getModel("broiler").setProperty("/broilerProjectedTable", res.data)
              this.getModel("broiler").setProperty("/broilerMainCopy", data)
              // this.getModel("breedingplanning").setProperty("/farms", res.farms)
            });


          })
          .catch(err => console.log);
      }
    },

    ageinput: function (o) {
      console.log("sdsdsd")

      let input = o.getSource();
      let data = o.getSource().getBindingContext("broiler").getObject()
      let path = o.getSource().getBindingContext("broiler").getPath()
      let weight = this.getModel("broiler").getProperty("/currentweight")
      console.log(data)
      let value = o.getParameter("value");
      input.setValue(value)
      if (parseInt(value) > 0) {
        data.weightgain = (parseFloat(value) * parseFloat(weight)).toFixed(2)
        let aja = data.h_date.split("/")
        console.log(aja)
        let thedate = new Date(aja[2], aja[1] - 1, aja[0])
        thedate = this.addDays(thedate, parseInt(value))
        let day = thedate.getDate()
        let month = thedate.getMonth()
        let year = thedate.getFullYear()
        data.eviction_date = thedate
        data.showdate = day + "/" + (month + 1) + "/" + year
        console.log(data)
        // input.setText(value)
        this.getModel("broiler").setProperty(path, data)
        input.setValueState("None");
        input.setValueStateText("");
        // input.setText(value)
      } else {
        input.setValueState("Error");
        input.setValueStateText("El campo no puede estar vacío y debe ser mayor a cero (0)");
        data.eviction_date = null
        data.showdate = null
        data.weightgain = null
      }


    },

    LoadProgramedBroiler: function (oEvent) {
      let find = oEvent.getSource().getBindingContext("broiler").getObject(),
        scenario = this.getModel("broiler").getProperty("/broilerMainCopy/scenario_id")
      // let data = this.getModel("broiler").getProperty(find)
      let date = new Date(find.init_date);
      find.s_date = date;
      oEvent.getSource().setSelected(false)
      find.scenario_id = parseInt(scenario)
      console.log(find)

      fetch("/sltxbroilerDetail/findBroilerDetail", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(find)
      })
        .then(response => {
          if (response.status !== 200) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
            res.lots.forEach(function (element) {
              element.quantityS = element.quantity - element.residue;
            });
            this.getModel("broiler").setProperty("/lots", res.lots)
            this.getModel("broiler").setProperty("/lotscopy", res.lots)
            this.getModel("broiler").setProperty("/broilerProgrammedTable", res.data)
            this.getModel("broiler").setProperty("/genders", res.gender_cl)
            this.getModel("broiler").setProperty("/SelectedExecuted", find)
            this.getView().byId("programed").setEnabled(true)
            this.getView().byId("broilerIconTab").setSelectedKey("programed")
            this.getView().byId("NewProductionProgrammed").setVisible(true)
            this.getView().byId("ExecutedProductionProgrammed").setVisible(true)
            // this.getModel("breedingplanning").setProperty("/farms", res.farms)
          });


        })
        .catch(err => console.log);

    },

    Loadshet: function (oEvent) {
      let stage = this.getModel("broiler").getProperty("/broilerDialog/farm_id")

      console.log(stage)
      fetch("/higherLayer/findShedsByFarmAndAvailability", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          farm_id: stage,
          eng: 'engorde'
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
            this.getModel("broiler").setProperty("/sheds", res.data)
            // sap.ui.getCore().byId("sheets").setSelectedKey(null);


          });


        })
        .catch(err => console.log);
      this.Blockselects()
    },

    onProjectedSaveDialog: function (oEvent) {
      oEvent.getSource().setEnabled(false)


      var that = this;
      let pass = false
      var oView = sap.ui.getCore()

      var aselects = [
        oView.byId("lotsbroiler"),
        oView.byId("selectfarmbroiler")
      ];
      var aInput = [
        oView.byId("datebroiler")
      ];

      var aComboBox = [
        oView.byId("sheetsbroiler")
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
      let lots = this.getModel("broiler").getProperty("/programmedList")
      if (lots.length === 0 && pass == false) {
        MessageToast.show("Ingrese una cantidad");
        pass = true
      }
      oEvent.getSource().setEnabled(true)
      if (pass == false) {
        oEvent.getSource().setEnabled(false)
        this.InsertProduction()
        oEvent.getSource().setEnabled(true)
      }
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

    InsertProduction: function (oInput) {

      let programmed = this.getModel("broiler").getProperty("/broilerDialog")
      let data = this.getModel("broiler").getProperty("/SelectedExecuted")
      let lots = this.getModel("broiler").getProperty("/programmedList"),
      scenario = this.getModel("broiler").getProperty("/broilerMainCopy/scenario_id")
      programmed.farm_id = parseInt(programmed.farm_id)
      programmed.slbroiler_id = parseInt(programmed.slbroiler_id)
      programmed.housing_quantity = parseInt(programmed.housing_quantity)
      // console.log(programmed)
      // console.log(data)
      console.log( {
        lots: lots, 
        record: [programmed], 
        init_date: data.init_date, 
        end_date: data.end_date, 
        gender: data.gender,
        scenario_id:parseInt(scenario)
      })

      fetch("/sltxbroilerDetail/addNewBroilerDetail", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(
          {
            lots: lots, 
            record: [programmed], 
            init_date: data.init_date, 
            end_date: data.end_date, 
            gender: data.gender,
            scenario_id:parseInt(scenario)
          }
        )
      })
        .then(response => {
          if (response.status !== 200 && response.status !== 409) {
            console.log("Looks like there was a problem. Status Code: " +
              response.status);
            return;
          }
          response.json().then((res) => {
            console.log(res);
            if (res.statusCode === 409) {
              console.log("aqui:::::: ", res.msj)
              this.onDialog('Warning', res.msj);
            } else {
              this.getModel("broiler").setProperty("/broilerProgrammedTable", res.data)
              res.lots.forEach(function (element) {
                element.quantityS = element.quantity - element.residue;
              });
              this.getModel("broiler").setProperty("/lots", res.lots)
              MessageToast.show("Programación creada con exito");
              // sap.ui.getCore().byId("sheets").setSelectedKey(null);
            }
            this.CloseDialog()
          });


        })
        .catch(err => console.log);


    },

    addDays: function (nDate, nDay) {
      nDate.setDate(nDate.getDate() + nDay);
      return nDate;
    },

    sexChange: function (oEvent) {
      let stage = oEvent.getSource().getBindingContext("broiler").getObject()
      let path = oEvent.getSource().getBindingContext("broiler").getPath()
      let xd = oEvent.getSource().getSelectedKey();
      let genders = this.getModel("broiler").getProperty("/genders")
      const result = genders.filter(word => word.slgenderclassification_id == parseInt(xd));
      this.getModel("broiler").setProperty("/currentweight", result[0].weight_gain)


      let aja = stage.h_date.split("/")
      console.log(aja)
      let thedate = new Date(aja[2], aja[1] - 1, aja[0])
      thedate = this.addDays(thedate, result[0].age)
      let day = thedate.getDate()
      let month = thedate.getMonth()
      let year = thedate.getFullYear()
      stage.eviction_date = thedate
      stage.showdate = (day >=10?day:'0'+day) + "/" + ((month + 1) >= 10?(month + 1):'0'+(month + 1)) + "/" + year

      stage.age = result[0].age
      stage.weightgain = (parseFloat(result[0].age) * parseFloat(result[0].weight_gain)).toFixed(2)
      stage.eviction_quantity = Math.ceil( (stage.housing_quantity * (1 - (result[0].mortality / 100) ) ) )
      console.log(stage)
      console.log(result)








      this.getModel("broiler").setProperty(path, stage)

    },


    ExecutedIncubator: function (oEvent) {
      oEvent.getSource().setEnabled(false)
      let data = this.getModel("broiler").getProperty("/broilerProgrammedTable")
      let saved = this.getModel("broiler").getProperty("/SelectedExecuted"),
      scenario = this.getModel("broiler").getProperty("/broilerMainCopy/scenario_id")



      const result = data.filter(item => item.executed != true);
      console.log(result);
      let send = result.filter(item => item.weightgain != null && item.eviction_date != "");
      send.forEach(function (element) {
        element.age = parseInt(element.age)
      });
      console.log(send);

      fetch("/sltxbroilerDetail/executeBroilerDetail", {
        method: "PUT",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          records: send,
          init_date: saved.init_date,
          end_date: saved.end_date,
          gender: saved.gender,
          scenario_id: parseInt(scenario)
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
            this.getModel("broiler").setProperty("/broilerProgrammedTable", res.data)
            MessageToast.show("Ejecución realizada con exito");
            // this.getModel("breedingplanning").setProperty("/breeds", res.breed)
            // this.getModel("breedingplanning").setProperty("/farms", res.farms)
          });


        })
        .catch(err => console.log);
      oEvent.getSource().setEnabled(true)
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
