sap.ui.define([
    "dailyMonitor/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "dailyMonitor/controller/MasterUserAppController"
],
function (BaseController, Filter, FilterOperator, MessageBox, Dialog, Button, Text,MasterUserAppController) {
    "use strict";

    return BaseController.extend("dailyMonitor.controller.Master", {

        onInit: function () {
            var oList = this.getView().byId("__list0");
            this._oList = oList;

            this._oListFilterState = {
                aFilter: [],
                aSearch: []
            };
            this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
        },

        _onMasterMatched: function (oEvent) {

            var util = this.getModel("util"),
                that = this,
                ospartnership = this.getModel("ospartnership"),
                serviceUrl = util.getProperty("/serviceUrl") +util.getProperty("/" + util.getProperty("/service") + "/getPartnership");
            console.log(serviceUrl);
            var settings = {
                url: serviceUrl,
                method: "GET",
				
                success: function(res) 
                {
                    console.log(res);
                    util.setProperty("/busy/", false);
                    ospartnership.setProperty("/records/", res.data);
                    let title= "Empresas ("+res.data.length+")";
                    ospartnership.setProperty("/title", title);

                    var firstItem = that.getView().byId("__list0").getItems()[0];
                    var Oid = firstItem.getBindingContext("ospartnership").getPath().split("/");
                    var id = Oid[2];

                    if (firstItem) 
                    {
                        var one_item = firstItem.getBindingContext("ospartnership").getObject().partnership_id;
                        that.getRouter().navTo("detail", {
                            partnership_id: one_item,
                            id: id
                        }, false);
                    }

                },
                error: function(err) {
                    console.log(err);
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                }
            };

            util.setProperty("/busy/", true);
            //borra los registros OSPARTNERSHIP que estén almacenados actualmente
            ospartnership.setProperty("/records/", []);
            //realiza la llamada ajax
            $.ajax(settings);
        },


        onSelectionChange : function(oEvent)
        {
            var Oid = oEvent.getSource().getBindingContext("ospartnership").getPath().split("/");
            var id = Oid[2];
            console.log(id);
            console.log(oEvent.getSource().getBindingContext("ospartnership").getObject().partnership_id);
            this.getRouter().navTo("detail", {
                partnership_id: oEvent.getSource().getBindingContext("ospartnership").getObject().partnership_id,
                id: id
            }, false );
        },

        goToLaunchpad: function () {
            // var dummy = this.getView().getModel("util");
            // console.log(dummy)
            // window.location.href = dummy.getProperty("/serviceUrl") + "/Apps/launchpad/webapp";
            window.location.href =  "/Apps/launchpad/webapp";
        }

    });

});