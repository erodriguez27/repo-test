sap.ui.define([
    //"userManagement/controller/BaseController",
    "sap/ui/core/mvc/Controller",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "userManagement/controller/MasterUserAppController",
], function(Controller, jQuery, JSONModel, Filter, FilterOperator, MessageToast,MessageBox,Dialog,Button,Text,MasterUserAppController) {
    "use strict";

    return Controller.extend("userManagement.controller.View1", {
        onInit: function () {
            this.getRouter().getRoute("main").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent){
            var oModel = this.getView().getModel("data");
            this.getView().setModel(oModel);
            var oView = this.getView();
            oView.setModel(this.oModel);
            var modelo= this.getView().getModel("data");
            const serverName = "/userManagement";
            oModel.setProperty("/exception_name_role","")
			
            fetch(serverName, {
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
                            var users=res.data;
                            modelo.setProperty("/users",users);
                        });
				  }
                );

            //-----------------------------------------------------------------//
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
                            modelo.setProperty("/rols",rols);
                        });
				  }
                );



        },

        getRouter: function(){
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        onEdit: function(oEvent){

            var oView = this.getView();
            var mod=oView.getModel("data");
            var user = oEvent.getSource().getBindingContext("data").getObject();
            console.log("User",user);
            var that = this;
            const serverNameRol = "/app_rolControl/findRolId";
            
            fetch(serverNameRol, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: user["rol_id"]
                })
            })
                .then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " + response.status);
                            return;
                        }
                        response.json().then(function (res) {
                            console.log(res[0]["rol_name"]);
                            if(res[0]["rol_name"]=="Administrador"){
                                MessageToast.show("El usuario "+user["username"]+" es administrador, no puede ser editado", {duration:3000});
                            }else{
                                mod.setProperty("/selected_user/user_id",user["user_id"]);
                                mod.setProperty("/selected_user/username",user["username"]);
                                mod.setProperty("/selected_user/user_role",res[0]["rol_name"]);
                                mod.setProperty("/selected_user/user_status",user["status"]);
                                mod.setProperty("/selected_user/active",user["active"]);
								
                                that.getRouter().navTo("edit");
                            }
                        });
                    }
                );	
        },
        onEditrol: function(oEvent){

            var oView = this.getView();
            var mod=oView.getModel("data");
            var rol = oEvent.getSource().getBindingContext("data").getObject();
            var that = this;
            console.log(rol);
            mod.setProperty("/selected_rol/rol_id",rol["rol_id"]);
            mod.setProperty("/selected_rol/rolname",rol["rol_name"]);
            mod.setProperty("/exception_name_role",rol["rol_name"]);

            that.getRouter().navTo("editrol");
        }
        ,
        onPressButton: function(){
            this.getRouter().navTo("add");
        },
        onPressButtonRol: function(){
            this.getRouter().navTo("addrol");
        },
        onChange: function(oEvent){
            var find= this.getView().byId("usersSearchField").getValue();
            var find2= this.getView().byId("usersSearchFieldRol").getValue();
            this.getView().byId("usersSearchField").fireSearch({query: find});
            this.getView().byId("usersSearchFieldRol").fireSearch({query: find2});
        },
        onSearch: function(oEvent) {
            console.log("Usuario");
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
        onSearch_Rol: function(oEvent) {
            console.log("Aqui Vamos");
            var filters = [];
            var query = oEvent.getParameter("query");
            if (query && query.length > 0) {
                var filter = new sap.ui.model.Filter("rol_name", sap.ui.model.FilterOperator.Contains, query);
                filters.push(filter);
            }
            // update binding
            var list = this.getView().byId("TableRols");
            var binding = list.getBinding("items");
            binding.filter(filters);
        },
        goToLaunchpad:function(){
            // var part = window.location.href.split("/"),
            // 	prefix = part[2].split(":"),
            // 	ip = prefix[0],
            // 	port = prefix[1];
            // var app_r=part[4];
            // var rout= "http://"+ip+":"+port
			
            window.location.href= "/Apps/launchpad/webapp";
			
        },
        handleDelete: function(oEvent){
            var user = oEvent.getSource().getBindingContext("data").getObject();

        },
        onTabSelection: async function(ev) {
            var mduser = this.getView().getModel("mduser");
            var mdrol = this.getView().getModel("mdrol");
            //osfarm.setProperty("/saveBtn", false);
            var selectedKey = ev.getSource().getSelectedKey();
	  
            if (selectedKey === "kTabRol") {
                console.log(mduser);
                console.log(mdrol);
			  this.hideButtons(false, true);
            }
            if (selectedKey === "kTabUser") {console.log(mduser);
                console.log(mdrol);
			  this.hideButtons(true, false);
            }
        },
        hideButtons: function(user, rol) {
            let mduser = this.getView().getModel("mduser");
            let mdrol = this.getView().getModel("mdrol");
            mduser.setProperty("/button", user);
            mdrol.setProperty("/button", rol);
	  
        }

    });
});