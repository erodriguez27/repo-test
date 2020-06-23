sap.ui.define([
    "userManagement/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/odata/OperationMode",
    "sap/m/MessageToast",
    "sap/ui/core/Item",
    "userManagement/model/formatter"
], function (BaseController, JSONModel, BusyIndicator, ODataModel, OperationMode, MessageToast, Item, formatter) {
    "use strict";

    return BaseController.extend("userManagement.controller.Add_rol", {
        formatter: formatter,
        onInit: function () {
            this.getRouter().getRoute("addrol").attachPatternMatched(this._onMasterMatched, this);
        },
        _onMasterMatched: function (oEvent) {
            this.resetFormRole();
            const serverName = "/userManagement/findApps";
            let dataApp = this.getModel("data");

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
                            console.log("respuesta",res.data);
                            
                            dataApp.setProperty("/apps", res.data);
                        });
                    }
                );
        },
        onSearch: function (oEvent) {
            var filters = [];
            var query = oEvent.getParameter("query");
            if (query && query.length > 0) {
                var filter = new sap.ui.model.Filter("username", sap.ui.model.FilterOperator.Contains, query);
                filters.push(filter);
            }
            // update binding
            var list = this.getView().byId("Table");
            var binding = list.getBinding("items");
            binding.filter(filters);

        },


        onPressAccept: function (oEvent) {

            var that = this;

            const serverName = "/userControl/LogIn";
            fetch(serverName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                withCredentials: true

            })
            .then(async function (userData) {

                if (userData.status == 403) {
                    window.location.href = "/Apps/userControl/webapp";
                } else {
                    var selectedItems = that.getView().byId("aplicaciones").getSelectedItems();
                    let arr = [];
                    var userrol = that.getView().byId("userrol").getValue();
                    for (let i = 0; i < selectedItems.length; i++)
                    arr.push(selectedItems[i].getKey());
                    
                    let flag = await that.validateFormRole(userrol,arr)

                    if (flag) {

                        userData.json().then(function (userDataNew) {
                        //Se Crea el Nuevo Rol y Insertamos datos en mdapplication_rol

                            const serverNameRol = "/app_rolControl/AddRolXApps";
                            fetch(serverNameRol, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    name: userrol,
                                    userAdmin: userDataNew.user[0]["user_id"],
                                    selectedItems: arr
                                })
                            }).then(function (response) {
                                
                                if (response.status == 500) {
                                    console.log("Looks like there was a problem. Status Code: " + response.status);
                                    return;
                                }

                                that.showToast("success_create_rol")
                                that.getRouter().navTo("main");
                            });

                        });
                    }
                }
            });
            
        },
        onPressReject: function () {
            this.getRouter().navTo("main");
        }
    });


});