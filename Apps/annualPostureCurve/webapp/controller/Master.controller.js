sap.ui.define([
    "annualPostureCurve/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "annualPostureCurve/controller/MasterUserAppController"
], function (BaseController, Filter, FilterOperator, MessageToast, Dialog, Button, Text,MasterUserAppController) {
    "use strict";

    return BaseController.extend("annualPostureCurve.controller.Master", {


        onInit: function () {
            var oList = this.getView().byId("__list0");
            this._oList = oList;
            this._oListFilterState = {
                aFilter: [],
                aSearch: []
            };
            this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
        },
        _onMasterMatched:  function (oEvent) {
            var util = this.getModel("util"),
                that = this,
                ospartnership = this.getModel("ospartnership"),
                serviceUrl = "/partnership";
            var settings = {
                url: serviceUrl,
                method: "GET",
                success: function (res) {

                    util.setProperty("/busy/", false);
                    ospartnership.setProperty("/records", res.data);
					
                    let str = "Empresa ("+ res.data.leght+")";
                    ospartnership.setProperty("/title",str);

                    var firstItem = that.getView().byId("__list0").getItems()[0];
						 var Oid = firstItem.getBindingContext("ospartnership").getPath().split("/");
						 var id = Oid[2];

						 if (firstItem) {
						 	var one_item = firstItem.getBindingContext("ospartnership").getObject().partnership_id;
						 	that.getRouter().navTo("detail", {
						 		partnership_id: one_item,
						 		id: id
						 	}, false);
						 }

                },
                error: function (err) {
                    util.setProperty("/error/status", err.status);
                    util.setProperty("/error/statusText", err.statusText);
                }
            };

            util.setProperty("/busy/", true);
            //realiza la llamada ajax
            $.ajax(settings);
        },

        onSelectionChange:  function (oEvent) {
            var Oid = oEvent.getSource().getBindingContext("ospartnership").getPath().split("/");
            var id = Oid[2];
            var emp_id = oEvent.getSource().getBindingContext("ospartnership").getObject().partnership_id;
			
            this.getView().getModel("posturecurve").setProperty("/id_empresa",oEvent.getSource().getBindingContext("ospartnership").getObject().partnership_id);
            this.getView().getModel("posturecurve").setProperty("/week",[]);
            this.getRouter().navTo("detail", {
                partnership_id: oEvent.getSource().getBindingContext("ospartnership").getObject().partnership_id,
                id: id
            }, false /*create history*/ );
			
        },

        onSearch:  function (oEvent) {

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
        _applyFilterSearch:  function () {
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
        _updateListItemCount:  function (iTotalItems) {
            var sTitle;
            let ospartnership= this.getModel("ospartnership");
            // only update the counter if the length is final
            if (this._oList.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("master.TitleCount", [iTotalItems]);
                let records= ospartnership.getProperty("/records");
                let str = "Empresa ("+ records.length+")";
                ospartnership.setProperty("/title",str);

                this.getModel("posturecurve").setProperty("/title", sTitle);
            }
        },
        onUpdateFinished:  function (oEvent) {
            this._updateListItemCount(oEvent.getParameter("total"));
        },
        goToLaunchpad:  function () {
            window.location.href = "/Apps/launchpad/webapp";
        }
    });
});