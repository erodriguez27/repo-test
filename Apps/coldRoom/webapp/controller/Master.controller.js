sap.ui.define([
    "coldRoom/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "coldRoom/controller/MasterUserAppController"
], function (BaseController, Filter, FilterOperator, MessageBox, Dialog, Button, Text,MasterUserAppController) {
    "use strict";

    return BaseController.extend("coldRoom.controller.Master", {

        onInit: function () {
            var oList = this.getView().byId("__list0");
            this._oList = oList;
            this._oListFilterState = {
                aFilter: [],
                aSearch: []
            };
            this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
        },
        _onMasterMatched: function(oEvent) {
            var util = this.getModel("util"),
                that = this,
                ospartnership = this.getModel("ospartnership"),
                serviceUrl = util.getProperty("/serviceUrl") +util.getProperty("/" + util.getProperty("/service") + "/getPartnership");

            var settings = {
                url: serviceUrl,
                method: "GET",
                success: function(res) {
                    util.setProperty("/busy/", false);
                    ospartnership.setProperty("/records", res.data);
                    if(res.data.length>0){
                        let firstItem = that.getView().byId("__list0").getItems()[0];//obtiene el elemento desde la vista (sin bindearlo)
                        if (firstItem) {
                            let obj= firstItem.getBindingContext("ospartnership").getObject();//obtiene el objeto desde el modelo
                            let index = firstItem.getBindingContext("ospartnership").getPath().split("/")[2];
                            obj.index= index;
                            ospartnership.setProperty("/selectedRecords/", obj);
                            ospartnership.setProperty("/name", obj.name);
                            ospartnership.setProperty("/address", obj.address);
                            that.getRouter().navTo("detail", {
                                partnership_id: obj.partnership_id,
                                id: obj.index
                            }, false);
                        }
                    }

                },
                error: function(err) {
                    console.log("Error en _onMasterMatched ----->",err);
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
        onSelectionChange : function(oEvent){
            let ospartnership= this.getModel("ospartnership");
            let obj= oEvent.getSource().getBindingContext("ospartnership").getObject();//obtiene el objeto desde el modelo
            let index = oEvent.getSource().getBindingContext("ospartnership").getPath().split("/")[2];
            obj.index= index;
            ospartnership.setProperty("/selectedRecords/", obj);
            ospartnership.setProperty("/name", obj.name);
            ospartnership.setProperty("/address", obj.address);
            ospartnership.setProperty("/selectedRecords/", obj);
            this.getRouter().navTo("detail", {
                partnership_id: obj.partnership_id,
                id: obj.index
            }, false /*create history*/ );
        },

        onSearch: function(oEvent) {

            if (oEvent.getParameters().refreshButtonPressed) {
                this.onRefresh();
                return;
            }
            var sQuery = oEvent.getSource().getValue();
            if (sQuery) {
                this._oListFilterState.aSearch = [new Filter("name", FilterOperator.Contains, sQuery)];
            } else {
                this._oListFilterState.aSearch = [];
            }
            this._applyFilterSearch();

        },
        _applyFilterSearch: function() {
            var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
                oViewModel = this.getModel("ospartnership");

            this._oList.getBinding("items").filter(aFilters, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aFilters.length !== 0) {
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("master.ListNoDataText"));
            } else if (this._oListFilterState.aSearch.length > 0) {
                // only reset the no data text to default when no new search was triggered
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("master.ListNoDataText"));
            }
        },
        _updateListItemCount: function (iTotalItems) {
            var sTitle;
            // only update the counter if the length is final
            if (this._oList.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("master.TitleCount", [iTotalItems]);
                this.getModel("ospartnership").setProperty("/title", sTitle);
            }
        },
        onUpdateFinished: function (oEvent) {
            this._updateListItemCount(oEvent.getParameter("total"));
        },
        goToLaunchpad: function () {
            window.location.href = "/Apps/launchpad/webapp";
        }
    });
});
