/*global history */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast"
], function (Controller, History,MessageToast) {
    "use strict";

    return Controller.extend("userManagement.controller.BaseController", {
        /**
			 * Convenience method for accessing the router in every controller of the application.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
        getRouter : function () {
            return this.getOwnerComponent().getRouter();
        },

        /**
			 * Convenience method for getting the view model by name in every controller of the application.
			 * @public
			 * @param {string} sName the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
        getModel : function (sName) {
            return this.getView().getModel(sName);
        },

        /**
			 * Convenience method for setting the view model in every controller of the application.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
        setModel : function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
			 * Convenience method for getting the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
        getResourceBundle : function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
			 * Event handler  for navigating back.
			 * It checks if there is a history entry. If yes, history.go(-1) will happen.
			 * If not, it will replace the current entry of the browser history with the master route.
			 * @public
			 */
			 
		onNavBack : function() {
            /*var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					// The history contains a previous entry
					history.go(-1);
				} else {
					// Otherwise we go backwards with a forward history
					var bReplace = true;
					this.getRouter().getTargets().display("master", {}, bReplace);
				}*/
            this.getRouter().navTo("Master", {}, true );
		},
		
		showToast: function(property){
            MessageToast.show(this.getResourceBundle().getText(property), {
                duration: 2000,
                closeOnBrowserNavigation:false
            });
		},

		resetFormRole: function(){

            this.getView().byId("userrol").setValue();
            this.getView().byId("userrol").setValueState("None")
            this.getView().byId("userrol").setValueStateText()

            this.getView().byId("aplicaciones").clearSelection();
            this.getView().byId("aplicaciones").setValueState("None")
            this.getView().byId("aplicaciones").setValueStateText()


        },

		
        clearStatusFieldRole: function(oEvent){

            let that=this
            let sid = oEvent.getSource().sId.split("--")
            let id = sid[1]
            let status = that.getView().byId(id).getValueState()

            if(status==="Error"){

                that.getView().byId(id).setValueState("None")
                that.getView().byId(id).setValueStateText("")
            }

        },

		
        getNameRole: function(rol){

            const serverName = "/app_rolControl/GetName";
            return  fetch(serverName, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "same-origin",
                        withCredentials: true,
                        body: JSON.stringify({
                            name: rol
                        })
                    })
                    .then(function(name){

                        return name.json()

                    })

        },
		
		validateFormRole: async function(rol,apps){    

            let flag=true
			let that=this
			let mddata = this.getModel("data");
			let exception = mddata.getProperty("/exception_name_role")

			console.log("exception",exception)

            if (rol) {

                
                await that.getNameRole(rol).then((data)=> {
					if(exception){

						if (data.length > 0 && (rol !== exception)) {

							that.getView().byId("userrol").setValueState("Error")
							that.getView().byId("userrol").setValueStateText(that.getResourceBundle().getText("exits_name_rol"))
							flag=false
	
						}

					}
					else{

						if (data.length > 0) {

							that.getView().byId("userrol").setValueState("Error")
							that.getView().byId("userrol").setValueStateText(that.getResourceBundle().getText("exits_name_rol"))
							flag=false
	
						}

					}

            })

                
                
            }else{

                that.getView().byId("userrol").setValueState("Error")
                that.getView().byId("userrol").setValueStateText(that.getResourceBundle().getText("field_null"))
                flag=false

            }

            if (apps.length<1) {

                that.getView().byId("aplicaciones").setValueState("Error")
                that.getView().byId("aplicaciones").setValueStateText(that.getResourceBundle().getText("select_apps_null"))
                flag=false
                
            }

            return flag;
            

		}


    });

}
);