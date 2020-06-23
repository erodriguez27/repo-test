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


    return BaseController.extend("userManagement.controller.Add_user", {

        formatter: formatter,

        onInit: function () {

            this.getRouter().getRoute("add").attachPatternMatched(this._onMasterMatched, this);

        },

        _onMasterMatched: function (oEvent) {
            var type = new Item({
                key: "",
                text: ""
            });
            this.getView().byId("user_type").setSelectedItem(type);
            this.resetForm();

            var modelo= this.getView().getModel("data");

            const serverNameRol = "/userManagement/findRol";
            fetch(serverNameRol, {
                method: "GET",
                headers: { "Content-Type": "application/json" }, 
            })
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " + response.status);
                            return;
                        }
                        response.json().then(function(res) {
                            var rols=res.data;
                            modelo.setProperty("/userTypes",rols);
                        });
				  }
                );
        },

        resetForm: function(){

            this.getView().byId("username").setValue("");
            this.getView().byId("username").setValueState("None")
            this.getView().byId("username").setValueStateText("")

            this.getView().byId("password").setValue("");
            this.getView().byId("password").setValueState("None")
            this.getView().byId("password").setValueStateText("")

            this.getView().byId("password_2").setValue("");
            this.getView().byId("password_2").setValueState("None")
            this.getView().byId("password_2").setValueStateText("")

            this.getView().byId("name").setValue("");
            this.getView().byId("name").setValueState("None")
            this.getView().byId("name").setValueStateText("")
            

            this.getView().byId("lastname").setValue("");
            this.getView().byId("lastname").setValueState("None")
            this.getView().byId("lastname").setValueStateText("")

            this.getView().byId("user_type").getSelectedKey("");
            this.getView().byId("user_type").setValueState("None")
            this.getView().byId("user_type").setValueStateText("")

        },

        clearStatusField: function(oEvent){

            let that=this
            let sid = oEvent.getSource().sId.split("--")
            let id = sid[1]
            let status = that.getView().byId(id).getValueState()

            if(status==="Error"){

                if (id==="password") {

                    that.getView().byId("password").setValueState("None")
                    that.getView().byId("password").setValueStateText("")
    
                    that.getView().byId("password_2").setValue()
                    that.getView().byId("password_2").setValueState("None")
                    that.getView().byId("password_2").setValueStateText("")
                    
                }else{

                    if (id==="password_2") {

                        that.getView().byId("password").setValue()
                        that.getView().byId("password").setValueState("None")
                        that.getView().byId("password").setValueStateText("")
        
                        that.getView().byId("password_2").setValueState("None")
                        that.getView().byId("password_2").setValueStateText("")
                        
                    }
                    
                    that.getView().byId(id).setValueState("None")
                    that.getView().byId(id).setValueStateText("")
    
                }


            }
            

        },

        findUserName:async function(usrname){

            let that = this
            
            const serverName = "/userManagement/findUsername";
                
             let resp =   await fetch(serverName, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                username: usrname
                            })
                        })
                        .then(function (response) {

                            if(response.status !== 200) {
                                console.log("Looks like there was a problem. Status Code: " +
                                response.status);
                                console.log(response);
                                return response.status;
                            }

                             return response.json().then(function (res) {return res.data;})
                    
                        });
                        
                 return resp       

        },

        validateForm: async function (usrname,name,lastname,password,password2,role) {

            var flag=true
            let that=this

            if (usrname) {
    
                await that.findUserName(usrname)
                    .then((data) => {
                        
                        if (parseInt(data[0]['count']) > 0) {
                            that.getView().byId("username").setValueState("Error")
                            that.getView().byId("username").setValueStateText(that.getResourceBundle().getText("exist_user"))
                            flag = false;
                        }
                            
                    })
                
            }else{

                that.getView().byId("username").setValueState("Error")
                that.getView().byId("username").setValueStateText(that.getResourceBundle().getText("field_null"))
                flag=false

            }
            

            if (!name) {

                that.getView().byId("name").setValueState("Error")
                that.getView().byId("name").setValueStateText(that.getResourceBundle().getText("field_null"))
                flag=false
                
            }
            if (!lastname) {

                that.getView().byId("lastname").setValueState("Error")
                that.getView().byId("lastname").setValueStateText(that.getResourceBundle().getText("field_null"))

                flag=false
                
            }
            if (!password) {

                that.getView().byId("password").setValueState("Error")
                that.getView().byId("password").setValueStateText(that.getResourceBundle().getText("field_null"))

                flag=false
                
            }
            if (!password2) {

                that.getView().byId("password_2").setValueState("Error")
                that.getView().byId("password_2").setValueStateText(that.getResourceBundle().getText("field_null"))

                flag=false
                
            }
            if (!role) {

                that.getView().byId("user_type").setValueState("Error")
                that.getView().byId("user_type").setValueStateText(that.getResourceBundle().getText("field_null"))

                flag=false
                
            }

            if(password!==password2){

                that.getView().byId("password").setValueState("Error")
                that.getView().byId("password").setValueStateText(that.getResourceBundle().getText("pass_dont_match"))

                that.getView().byId("password_2").setValueState("Error")
                that.getView().byId("password_2").setValueStateText(that.getResourceBundle().getText("pass_dont_match"))

                flag=false

            } 

            return flag;
            

        },

        onPressAccept: function () {
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
                        window.location.href = "/Apps/launchpad/webapp";
                    }else{
                        var username = that.getView().byId("username").getValue();
                        username = username.toLowerCase();
                        var password = that.getView().byId("password").getValue();
                        var password2 = that.getView().byId("password_2").getValue();
                        var name = that.getView().byId("name").getValue();
                        name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                        var lastname = that.getView().byId("lastname").getValue();
                        lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1).toLowerCase();
                        var tipo = that.getView().byId("user_type").getSelectedKey();

                        let flag = await that.validateForm(username,name,lastname,password,password2,tipo)
                        
                        if (flag) {
                            
                            userData.json().then(function (userDataNew) {
                                const now = new Date();

                                const serverName = "/userManagement/addUser";
                                fetch(serverName, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        username: username,
                                        password: password,
                                        type_user: tipo,
                                        active: true,
                                        name: name,
                                        lastname: lastname,
                                        userAdmin :userDataNew.user[0]["user_id"],
                                        date: now
                                    })
                                })
                                    .then(function (response) {
                                        if (response.status !== 200) {
                                            console.log("Looks like there was a problem. Status Code: " +
                                                response.status);
                                            console.log(response);
                                            return;
                                        }else{
                                            that.showToast("success_create_user")
                                            that.getRouter().navTo("main");
                                        }

                                    });

                            })
                                        
                        }
                    }
                });
        },
                            

        onPressReject: function () {
            // this.getView().getModel("data").setProperty("/apps", "");
            this.getRouter().navTo("main");
        }
    });
});