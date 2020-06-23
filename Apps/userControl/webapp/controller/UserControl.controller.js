sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "jquery.sap.global",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/odata/OperationMode",
    "userControl/controller/BaseController",
    "sap/m/IconTabFilter",
    "sap/m/Text"
], function (Controller, jQuery, MessageToast, JSONModel, ODataModel, OperationMode, BaseController, IconTabFilter, Text) {
    "use strict";

    return BaseController.extend("userControl.controller.UserControl", {

        onInit: async function () {
            const servername = "/userControl/LogIn";
            await fetch(servername, {
                method: "POST",
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin"
            }) .then(
                function (response) {
                    console.log("responde",response.status)
                    if (response.status == 200) {
                        response.json().then(function (res) {

                            window.location.href = "/Apps/launchpad/webapp";

                        });
                    }else{

                        this.getRouter().getRoute("main").attachPatternMatched(this);

                    }
                    
                });
            

        },

        _validateCredentials: function () {
            let username = this.getView().byId("user").getValue(),
                password = this.getView().byId("password").getValue();
                
            if((typeof username !== 'undefined' && username)&&(typeof password !== 'undefined' && password)){

                this.getView().byId("ingress").setEnabled(true);

            }else{
                this.getView().byId("ingress").setEnabled(false);
            }
            

        },

        onPressButton: function () {
            var username = this.getView().byId("user").getValue(); // Obtengo Dato de la casilla usuario de la vista
            username = username.toLowerCase(); //Paso a Miniscula
            var password = this.getView().byId("password").getValue(); //Obtenemos Contrase�a
            var util = this.getModel("util");
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const servername = "/userControl/inicioPassport";


            fetch(servername, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                withCredentials: true,
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
                .then(
                    function (response) {
                        console.log("responde",response)
                        if (response.status == 200) {
                            response.json().then(function (res) {
                                if (res.user.active == true) {
                                    window.location.href = "/Apps/launchpad/webapp";
                                } else {
                                    MessageToast.show(oResourceBundle.getText("res_inactive"), {
                                        duration: 2000
                                    });
                                }

                            });
                        } else {
                            MessageToast.show(oResourceBundle.getText("res_invalid"), {
                                duration: 2000
                            });
                        }
                    });
            }
            
        
    });
});