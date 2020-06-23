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

    return BaseController.extend("userManagement.controller.edit_user", {
        //text="{path:'data>application_name', formatter: '.formatter.formatApps'}

        formatter: formatter,

        onInit: function () {

            this.getRouter().getRoute("edit").attachPatternMatched(this._onRouteMatched, this);

        },

        _onRouteMatched: function (oEvent) {
            this.clearFields();
            this.getView().byId("user_type").setValue("");
            this.getView().byId("user_type").setSelectedItem("");
            var tipo = this.getView().getModel("data").getProperty("/selected_user/user_role");
            this.active = this.getView().getModel("data").getProperty("/selected_user/active");
            var modelo = this.getView().getModel("data");
            this.getView().byId("switch_active").setState(this.active);
            var type = new Item({
                key: tipo,
                text: tipo
            });
            this.getView().byId("user_type").setSelectedItem(type);

            const serverNameRol = "/userManagement/findRol";
            fetch(serverNameRol, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            })
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " + response.status);
                            return;
                        }
                        response.json().then(function (res) {
                            var rols = res.data;
                            modelo.setProperty("/userTypes", rols);
                        });
                    }
                );

        },

        onPressReject: function () {

            this.getRouter().navTo("main");
        },

        validateChanges:function(oldinfo,newinfo){
            let change={
                exist_changes:false,
                role:false,
                status:false,
                password:false} 
            
            if(oldinfo.role!==newinfo.role){
                change.exist_changes=true
                change.role=true
            }
            
            if(oldinfo.status!==newinfo.status){
                change.exist_changes=true
                change.status=true
            }

            if(newinfo.pass1 || newinfo.pass2){
                change.exist_changes=true
                change.password=true
            }

            return change;


        },

        validatePassword: function(pass1,pass2){

            let flag = false

            if(pass1){

                if(pass2){
                    
                    if(pass1===pass2){
                        flag=true
                    }else{
                        //las contraseñas no coinciden
                        this.getView().byId("password_2").setValueState("Error")
                        this.getView().byId("password_2").setValueStateText("Las contraseñas no coinciden")
                        flag=false
                    }
                }else{
                    //debe repetir contraseña
                    this.getView().byId("password_2").setValueState("Error")
                    this.getView().byId("password_2").setValueStateText("Debe repetir la contraseña")
                    flag=false
                }

            }else{
                if(!pass1 && !pass2){

                    flag=true

                }
            }

            return flag;



        },

        clearFields: function(){

            this.getView().byId("password").setValue();
            this.getView().byId("password").setValueState("None")
            this.getView().byId("password").setValueStateText()

            this.getView().byId("password_2").setValue();
            this.getView().byId("password_2").setValueState("None")
            this.getView().byId("password_2").setValueStateText()
            this.getView().byId("password_2").setEnabled(false)

        },

        validateInput: function(oEvent){

            let that=this
            let sid = oEvent.getSource().sId.split("--")
            let id = sid[1]
            let status = that.getView().byId(id).getValueState()
            let value

            console.log("input",id)

            if(status==="Error"){
                that.getView().byId(id).setValueState("None")
                that.getView().byId(id).setValueStateText("")
            }

            if(id==="password"){
                value = that.getView().byId(id).getValue()

                if(value){
                    that.getView().byId("password_2").setEnabled(true)
                }else{
                    that.getView().byId("password_2").setValue()
                    that.getView().byId("password_2").setValueState("None")
                    that.getView().byId("password_2").setValueStateText("")
                    that.getView().byId("password_2").setEnabled(false)
                }

            }



        },

        onPressAccept: function () {
            let inf = "Se actualizará toda la información ingresada";
            let that = this;

            let or_type = this.getView().getModel("data").getProperty("/selected_user/user_role");
            let username = this.getView().getModel("data").getProperty("/selected_user/username")
            let id = this.getView().getModel("data").getProperty("/selected_user/user_id");
            let act = this.getView().byId("switch_active").getState();

            let password = that.getView().byId("password").getValue();
            let password2 = that.getView().byId("password_2").getValue();
            let tipo = that.getView().byId("user_type").getSelectedKey();

            let obj_info_user = {
                role:or_type,
                id_user:id,
                status:that.active
            }

            let obj_new_info ={
                pass1:password,
                pass2:password2,
                role:tipo,
                status:act
            }
            
            let change=that.validateChanges(obj_info_user,obj_new_info)
 
            if(change.exist_changes){

                if(that.validatePassword(password,password2)){
                    
                    var dialog = new Dialog({
                        title: "¿Desea continuar con la operación?",
                        type: "Message",
                        content: new Text({
                            text: inf
                        }),
                        beginButton: new Button({
                            text: "Si, deseo continuar",
                            press: function () {

                                let parameters ={
                                    user_id:id
                                }

                                if(change.role){parameters.user_type=tipo}
                                if(change.password){parameters.password=password;parameters.username=username}
                                if(change.status){parameters.active=act}

                                
                                const serverName = "/userControl/updateUser";
                                fetch(serverName, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        change:change,
                                        parameters: parameters
                                    })
                                })
                                    .then(
                                        function (response) {
                                            if (response.status !== 200) {
                                                console.log("Looks like there was a problem. Status Code: " +
                                                    response.status);
                                                console.log(response);
                                                return;
                                            }
                                            response.json().then(function (res) {
                                                console.log(res);

                                            });
                                            that.showToast("success_update_user")
                                            that.getRouter().navTo("main");
                                        }
                                    );

                            }
                        }),
                        endButton: new Button({
                            text: "No, deseo regresar",
                            press: function () {
                                dialog.close();
                            }
                        }),
                        afterClose: function () {
                            that.clearFields()
                            dialog.destroy();
                        }
                    });
                    dialog.open();


                }
            }else{
                that.showToast("no_changes")
            }

        }
    });

});