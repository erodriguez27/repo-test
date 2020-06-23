sap.ui.define([
    "userManagement/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/odata/OperationMode",
    "sap/m/MessageToast",
    "sap/ui/core/Item",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "userManagement/model/formatter"
], function (BaseController, JSONModel, BusyIndicator, ODataModel, OperationMode, MessageToast, Item, Dialog, Button, Text, formatter) {
    "use strict";

    return BaseController.extend("userManagement.controller.edit_rol", {
        //text="{path:'data>application_name', formatter: '.formatter.formatApps'}

        formatter: formatter,

        onInit: function () {

            this.getRouter().getRoute("editrol").attachPatternMatched(this._onRouteMatched, this);

        },
        _onRouteMatched: function (oEvent) {
            var rolname = this.getView().getModel("data").getProperty("/selected_rol/rolname");
            var rol_id = this.getView().getModel("data").getProperty("/selected_rol/rol_id");
            var that = this;
            // var modelo=this.getView().getModel("data");
            this.apli = this.getView().byId("aplicaciones");

            var modelo = this.getView().getModel("data");
            //--------------------------------------------

            const serverName = "/userManagement/findApps";
            // let dataApp = this.getModel("data");


            fetch(serverName, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            })
                .then(
                    function (response) {
                        if (response.status == 500) {
                            console.log("Looks like there was a problem. Status Code: " + response.status);
                            return;
                        }
                        response.json().then(function (res) {
                            var apps = res.data;
                            modelo.setProperty("/apps", apps);
                            that.apli.setEditable(true);
                        });
                    }
                );
            //--------------------------------------------
            const serverNameApps = "/app_rolControl/otbenerApps";
            fetch(serverNameApps, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    rolname: rolname,
                    rol_id: rol_id
                })
            })
                .then(function (response) {
                    if (response.status == 500) {
                        console.log("Looks like there was a problem. Status Code: " +
                            response.status);
                        return;
                    }
                    response.json().then(function (res) {
                        console.log(res);
                        console.log(res.data);
                        that.apps = res.data;
                        modelo.setProperty("/user_app", that.apps);
                        const keys = [];

                        for (var i = 0; i < that.apps.length; i++) {
                            keys.push(that.apps[i]["application_id"]);
                            var it = new Item({
                                key: that.apps[i]["application_id"],
                                text: that.formatter.formatApps(that.apps[i]["application_name"]),

                            });
                            console.log(it);
                            that.apli.addSelectedItem(it);
                            that.apli.fireSelectionChange();
                        }
                        that.apli.setSelectedKeys(keys);
                        // dataApp.setProperty("/apps", apps)
                        console.log(that.apli);
                    });
                });
            var permisos = this.getView().getModel("data").getProperty("/apps");
            console.log(permisos);

        },
        onPressReject: function () {
            // this.getView().getModel("data").setProperty("/apps", "");
            // this.getView().byId("userrol").setValue("");
            // this.getView().byId("aplicaciones").setSelectedItems("");
            this.resetFormRole();
            this.getRouter().navTo("main");
        },
        handleSelectionFinish: function () {
            console.log(this.getView().byId("aplicaciones").getSelectedItems());
        },
        validateChanges: function (role,items) {
            let exist_change=false
            let mddata = this.getModel("data");
            let user_apps = mddata.getProperty("/user_app")
            let exception_name_role = mddata.getProperty("/exception_name_role")

            if(role !== exception_name_role){

                exist_change=true;

            }

            if(user_apps.length !== items.length){

                exist_change=true;
            }
            else{

                for (let i = 0; i < items.length; i++) {
                    
                    if(user_apps.find(element => element.application_id == items[i].getKey())===undefined){
                        exist_change=true;
                    }
                    
                }

            }

            return exist_change;

        },
        onPressAccept: async function () {
            var that = this;
            var inf = "Se actualizará toda la información ingresada";
            var rol_name = that.getView().getModel("data").getProperty("/selected_rol/rolname");
            var rol_id = that.getView().getModel("data").getProperty("/selected_rol/rol_id");
            var selectedItems = that.getView().byId("aplicaciones").getSelectedItems();
            let arr = [];

            let flag = await that.validateFormRole(rol_name,selectedItems)
            console.log("flag",flag);
            
            if(flag){

                if(that.validateChanges(rol_name,selectedItems)){

                    var dialog = new Dialog({
                        title: "¿Desea continuar con la operación?",
                        type: "Message",
                        content: new Text({
                            text: inf
                        }),
                        beginButton: new Button({
                            text: "Si, deseo continuar",
                            press: function () {
        
        
                                let info_role = selectedItems.map(itm=>({application_id:itm.getKey(),rol_id:rol_id}))
                                console.log("info_role",info_role);
                                
                                    const serverName = "/app_rolControl/updateRole";
                                    fetch(serverName, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({
                                            role_name: rol_name,
                                            role_id: rol_id,
                                            info_role: info_role
                                        })
                                    }).then(function (response) {
                                        console.log(response);
                                        if (response.status == 500) {
                                            console.log("Looks like there was a problem. Status Code: " +
                                                response.status);
                                            console.log(response);
                                            return;
                                        }else{
        
                                            that.showToast("success_update_rol")
                                            that.resetFormRole();
                                            that.getRouter().navTo("main");
        
                                        }
                                    });
        
                            }
                        }),
                        endButton: new Button({
                            text: "No, deseo regresar",
                            press: function () {
                                dialog.close();
                            }
                        }),
                        afterClose: function () {
                            // that.getView().getModel("data").setProperty("/apps", "");
                            // that.getView().byId("userrol").setValue("");
                            // that.getView().byId("aplicaciones").setSelectedItems("");
                            dialog.destroy();
                        }
                    });

                    
                    dialog.open();

                }else{
                    that.showToast("no_changes")
                }
            }


        }

    });

});