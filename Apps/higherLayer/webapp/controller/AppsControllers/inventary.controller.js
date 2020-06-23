sap.ui.define([
  "higherLayer/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/Dialog",
  'sap/m/MessageToast',
  "sap/m/Text",
  "sap/m/Button"
], function (BaseController, JSONModel, Dialog, MessageToast, Text, Button) {
  "use strict";

  return BaseController.extend("higherLayer.controller.AppsControllers.inventary", {


    onInit: function () {

      this.setFragments();
      this.getRouter().getRoute("inventary").attachPatternMatched(this._onRouteMatched, this);
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
      // console.log("djdhdjhdj")
      // this.getView().byId("__header0").bindElement("ospartnership>/records/" + this.index + "/");
      this.onRead(this.index);
      let that = this
      this.getModel("inventary").setProperty("/inventaryMain", {})
      this.getModel("inventary").setProperty("/inventaryTable", {})
      let partnership_id = this.getModel("ospartnership").getProperty("/selectedRecord/partnership_id")
      fetch("/higherLayer/findAllScenariosProgrammedByStage", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          stage_id: 5
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
            const result = res.data.filter(word => word.status === 1);
            // if(res.data.length!==1){
            //   res.data.unshift({ name: "Escenario", scenario_id: "J"+res.data[0].scenario_id})
            // }
            // this.getModel("inventary").setProperty("/activescenariooo", result[0])
            this.getView().getModel("inventary").setProperty("/scenarios", result[0])
            this.getModel("inventary").setProperty("/selectScenariomains", res.data)
            this.getModel("inventary").setProperty("/inventaryMain/scenario_id", res.data[0].scenario_id)

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

    LoadProduction: function (oEvent) {
      let data = this.getModel("inventary").getProperty("/inventaryMain")
      // let scenario = this.getModel("inventary").getProperty("/scenarios")
      // data.scenario_id = scenario.scenario_id
      console.log(data)


      if (Date.parse(data.date1) > Date.parse(data.date2)) {
        MessageToast.show("Ingrese un rango de fecha válido");
        this.getModel("inventary").setProperty("/inventaryTable", [])
      } else {
        fetch("/sltxInventory/findInventoryByFilter", {
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
              this.getModel("inventary").setProperty("/inventaryTable", [])
              if (response.status == 500) {
                MessageToast.show("No se encontraron registros");
              } else {
                MessageToast.show("Ingrese un rango de fecha válido");
              }

              return;
            }
            response.json().then((res) => {
              console.log(res);
              if (res.data.records.length === 0) {
                MessageToast.show("No se encontraron registros");
              } else {
                res.data.records.forEach(function (element) {

                  element.ponderet = parseFloat(element.inventory / ((element.total_eggs + element.total_plexus)/ 7))
                  element.ponderet = element.ponderet.toFixed(2)
                  if (element.ponderet == -Infinity || element.ponderet == Infinity) {
                    element.ponderet = ""
                  }
                  if (element.exist_pc == false) {
                    element.execution_s = true
                    element.projected_total = "-"
                    element.total_eggs = "-"
                    element.total_plexus = "-"
                  }
                });
              }
              // if (res.data.executable == false) {
              //   var dialog = new Dialog({
              //     title: 'Advertencia',
              //     type: 'Message',
              //     state: 'Warning',
              //     content: new Text({
              //       text: 'Algunos registros no se pueden ejecutar debido a que no existe demanda de huevos para esa semana'
              //     }),
              //     beginButton: new Button({
              //       text: 'OK',
              //       press: function () {
              //         dialog.close();
              //       }
              //     }),
              //     afterClose: function () {
              //       dialog.destroy();
              //     }
              //   });

              //   dialog.open();

              // }



              this.TableModification(res.data)
              this.getModel("inventary").setProperty("/inventaryMainCopy", data)
              // this.getModel("breedingplanning").setProperty("/farms", res.farms)
            });


          })
          .catch(err => console.log);
      }





    },
    LoadProductionExcuted: function (oEvent) {
      let data = this.getModel("inventary").getProperty("/inventaryMainCopy")
      // let scenario = this.getModel("inventary").getProperty("/scenarios")
      data.scenario_id = parseInt(data.scenario_id)
      console.log(data)

      fetch("/sltxInventory/findInventoryByFilter", {
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
            MessageToast.show("Ingrese un parámetro de fecha válido");
            return;
          }
          response.json().then((res) => {
            console.log(res);

            res.data.records.forEach(function (element) {
              element.ponderet = parseFloat(element.inventory / ((element.total_eggs + element.total_plexus)/ 7))
              element.ponderet = element.ponderet.toFixed(2)
              if (element.ponderet == -Infinity || element.ponderet == Infinity) {
                element.ponderet = ""
              }
              if (element.exist_pc == false) {
                element.execution_s = true
                element.projected_total = "-"
                element.total_eggs = "-"
                element.total_plexus = "-"
              }
            });


            this.TableModification(res.data)
            this.getModel("inventary").setProperty("/inventaryMainCopy", data)
            // this.getModel("breedingplanning").setProperty("/farms", res.farms)
          });


        })
        .catch(err => console.log);






    },
    getNumberWithCommas: function (number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    TableModification: function (data) {
let that = this
      // if (data.executable == false) {
      data.records.forEach(function (element) {
        element.thatnumberproyected= that.getNumberWithCommas(parseInt(element.projected_total))
        element.invenarynumber= that.getNumberWithCommas(parseInt(element.inventory))
        // if (element.executable_inv == false) {

        //   element.block = false
        // }
      });
      // this.getView().byId("confirmSync").setEnabled(false)
      // }else{
      //   this.getView().byId("confirmSync").setEnabled(true)
      // }





      console.log(data);
      // if(data.valid==false && data.executable==false){
      //   var dialog = new Dialog({
      //     title: 'Error',
      //     type: 'Message',
      //     state: 'Error',
      //     content: new Text({
      //       text: 'El rango de fecha no muestra registros ejecutables, si desea ejecutar incremente el rango iniciando desde '+data.date_suggest+ ' y es necesaria la ejecución de la regresiva para ejecutar el inventario'
      //     }),
      //     beginButton: new Button({
      //       text: 'OK',
      //       press: function () {
      //         dialog.close();
      //       }
      //     }),
      //     afterClose: function() {
      //       dialog.destroy();
      //     }
      //   });

      //   dialog.open();
      // }
      // if(data.valid==false && data.executable==true){
      //   var dialog = new Dialog({
      //     title: 'Error',
      //     type: 'Message',
      //     state: 'Error',
      //     content: new Text({
      //       text: 'El rango de fecha no muestra registros ejecutables, si desea ejecutar incremente el rango iniciando desde '+data.date_suggest
      //     }),
      //     beginButton: new Button({
      //       text: 'OK',
      //       press: function () {
      //         dialog.close();
      //       }
      //     }),
      //     afterClose: function() {
      //       dialog.destroy();
      //     }
      //   });

      //   dialog.open();

      // }





      this.getModel("inventary").setProperty("/inventaryTable", data.records)

    },

    ExecutedInventary: async function (oEvent) {
      oEvent.getSource().setEnabled(false)
      let data = this.getModel("inventary").getProperty("/inventaryTable")
      let array = []
      let one = false, two = false
      console.log(data)
      // if (data)
        data.forEach(function (element) {
          //   if (element.execution_s == false && two == false) {
          //     if (one == false) {
          //       one = true
          //     }
          // if ((element.total_plexus == "" && element.total_eggs == "") || (element.total_plexus == "" && element.total_eggs == null)|| (element.total_plexus == null && element.total_eggs == "")) {
          //   element.total_plexus = null
          //   element.total_eggs = null
          // }
          if(element.total_plexus === ""){
            element.total_plexus = null
          }
          if(element.total_eggs === ""){
            element.total_eggs = null
          }
          if (element.execution_s === false && element.total_eggs != "" && element.total_plexus != "" && element.total_eggs != null && element.total_plexus != null) {
            array.push(element)
          }

          if ((element.total_eggs == null && element.total_plexus != null)  || (element.total_plexus == null && element.total_eggs != null)) {
            console.log("campos vacios")
            if(element.total_eggs == null){
              element.aja="Error"
            }else{
              element.aja="None"
            }
            if(element.total_plexus == null){
              element.aja2="Error"
            }else{
              element.aja2="None"
            }
            one = true
          }else{
            element.aja2="None"
            element.aja="None"
          }



          //   } else if (element.execution_s == true) {
          //     if (one == true) {
          //       two = true
          //     }

          //   }
        });
      console.log(array)
      // let result = data.filter(item => item.execution_s === false && item.total_eggs != "" && item.total_plexus != "" && item.total_eggs != null && item.total_plexus != null);
      this.getModel("inventary").setProperty("/inventaryTable",data)
      let scenario = this.getView().getModel("inventary").getProperty("/scenarios")
      let look = this.getModel("inventary").getProperty("/inventaryMainCopy")
      array.forEach(function (element) {
        element.week_date = element.date_from
        element.execution_eggs = parseInt(element.total_eggs)
        element.execution_plexus_eggs = parseInt(element.total_plexus)
        element.scenario_id = parseInt(look.scenario_id)
      });
      console.log(array)
      // console.
      console.log({
        records: array,
        date1: look.date1,
        date2: look.date2,
        scenario_id: look.scenario_id
      });
      let tEvent = oEvent
      if (array.length > 0 && one == false) {
        console.log("jajajaja")
        fetch("/sltxInventory/executeInventory", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({
            records: array
          })
        })
          .then(response => {
            if (response.status !== 200) {
              console.log("Looks like there was a problem. Status Code: " +
                response.status);
              return;
            }
            response.json().then((res) => {
              console.log("AAAAAAAAAAAAHHHHHHHHHH");

              MessageToast.show(array.length + " elemento(s) ejecutado(s) con éxito");
              this.LoadProductionExcuted()
            });


          })
          .catch(err => console.log);
        oEvent.getSource().setEnabled(true)
      } else {
        MessageToast.show("Campos faltantes, incompletos o inválidos");
        oEvent.getSource().setEnabled(true)
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
        console.log("El value::::: ", value)
        if(value==='' ){
          console.log("0000000000")
            input.setValue(null);

        }else{
          input.setValue(value);
        }
        // else{
        //   input.setValueState("None");
        //   input.setValueStateText("");
        // }
        

      }
    },



  });
});
