/*global history */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "annualPostureCurve/model/formatter"
], function (Controller, History, formatter) {
    "use strict";
    var groupDetailsDlg;
    return Controller.extend("annualPostureCurve.controller.BaseController", {
        /**
			 * Convenience method for accessing the router in every controller of the application.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
        formatter: formatter,

        setFragments : function () {

            this.groupDetailsDlg = sap.ui.xmlfragment("annualPostureCurve.view.postureCurve.PostureCurveTable2", this);
            this.getView().addDependent(this.groupDetailsDlg);
            this.groupDetailsDlgforall = sap.ui.xmlfragment("annualPostureCurve.view.postureCurve.PostureCurveTableForAll", this);
            this.getView().addDependent(this.groupDetailsDlgforall);

        },
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
            this.getRouter().navTo("master", {}, true /*no history*/);
        },

        sendRequest : function (url, method, data, successFunc, srvErrorFunc, connErrorFunc) {
            var util = this.getModel("util");
            var $settings = {
                url: url,
                method: method,
                data: JSON.stringify(data),
                contentType: "application/json",
                error: err => {
                    util.setProperty("/connectionError/status", err.status);
                    util.setProperty("/connectionError/message", err.statusText);
                    this.onConnectionError();
                    if(connErrorFunc) connErrorFunc(err);

                },
                success: res => {
                    if(res.statusCode !== 200) {
                        util.setProperty("/serviceError/status", res.statusCode);
                        util.setProperty("/serviceError/message", res.msg);
                        this.onServiceError();
                        if(srvErrorFunc) srvErrorFunc(res);
                    } else {
                        successFunc(res);
                    }
                }
            };

            $.ajax($settings);
        },
        onConnectionError: function() {
            connectionErrorDlg.open();
        },
        handleLinkPress: function(oEvent){
            let posturecurve=this.getModel("posturecurve");
            let num_week = parseInt(oEvent.getSource().getBindingContext("posturecurve").getObject().num_week);
            let lot= oEvent.getSource().getBindingContext("posturecurve").getObject().lot;
            let week=oEvent.getSource().getBindingContext("posturecurve").getObject().week;
            let date= week.split("/");
            let year = posturecurve.getProperty("/theyeartolook");
      	let breed = posturecurve.getProperty("/thebreedtolook");
            let modelo= this.getView().getModel("posturecurve");

				
				
            fetch("/eggs_storage/findEggsStorageDetailByYearWeekBreedLot", {
                method: "POST",
                headers: {
					  "Content-type": "application/json; charset=UTF-8"
                },
			
                body: JSON.stringify({
                    breed_id: breed,
                    year:year,
                    lot: lot,
					  num_week: num_week
					  
				  })
				  
						
				  })
				  .then(
                    function(response) {
					  if (response.status !== 200) {
                            console.log("Looks like there was a problem. Status Code: " +
						  response.status);
                            return;
					  }
			
					  response.json().then(function(res) {
                            let i=0;
                            res.data.forEach(item =>{
                                let theday=item.dia.split("-");
                                let dia=theday[2]+"/"+theday[1]+"/"+theday[0];
                                let ddate= new Date(item.init_date);
                                let date= new Date(item.dia.toString());
                                let aDay=["7", "1", "2", "3", "4", "5", "6"];
							
                                let formatDate= aDay[date.getUTCDay()];

						  modelo.setProperty("/formateDate", formatDate);
						  i++;
			
                                item.available= (item.eggs_executed==null || item.eggs_executed< 0)? true: false;
                                item.day=i; 
                                item.formatDate= formatDate;
                                item.dia=dia;
                            });
			
                            modelo.setProperty("/datapopover", res.data);
					  });
                    }
				  );
       
            this.groupDetailsDlg.openBy(oEvent.getSource());
                
        },
        LotsView:function(oEvent){
            var posturecurve = this.getView().getModel("posturecurve");
            let week = oEvent.getSource().getBindingContext("posturecurve").getObject().num_week;
            let breed_id = this.getView().byId("breedSelect").mProperties.selectedKey;
            let init_week = oEvent.getSource().getBindingContext("posturecurve").getObject().week;
            let year = this.getView().byId("Selectyears").mProperties.selectedKey;
            let scenario_id = this.getModel("mdscenario").getProperty("/scenario_id");
            let parent_lot = this.getView().byId("selectLoteFatherprojected").mProperties.selectedKey;
            // let year = this.getView().byId("Selectyears").mProperties.selectedKey;
            // var formatDate = new Array();
            // formatDate = year.split('/');
            // year = formatDate[2]+"-"+formatDate[1]+"-"+formatDate[0];

            var format_init_week = new Array();
            format_init_week = init_week.split("/");
            init_week = format_init_week[2] + "-" + format_init_week[1] + "-" + format_init_week[0];
            fetch("/eggs_storage/findEggsStorageByWeek", {
                headers: {
					  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({"breed_id" : breed_id,
                "num_week" : week,
                "init_week" : init_week,
                "year": year,
                "scenario_id": scenario_id,
                "parent_lot": parent_lot})
              })
                .then(
					  function(response) {
                        if (response.status !== 200) {
						  console.log("Looks like there was a problem. Status Code: " +
							response.status);
						  return;
                        }
	
                        response.json().then(function(res) {
                            console.log(res)
						  posturecurve.setProperty("/datapopoverforall", res.data);
						  
                        });
					  }
                )
                .catch(function(err) {
					  console.log("Fetch Error: ", err);
                });

            this.groupDetailsDlgforall.openBy(oEvent.getSource());



        },


        onToast: function(message, f) {
            sap.m.MessageToast.show(message, {
                width: "22em",
                duration: 5000,
                closeOnBrowserNavigation: false,
                onClose: f
            });
        }
		
    });

}
);
