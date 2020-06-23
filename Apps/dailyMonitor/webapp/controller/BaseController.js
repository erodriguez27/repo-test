sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "dailyMonitor/model/formatter"
], 
function (Controller,formatter) 
{
    "use strict";
    var groupDetailsDlg, groupDetailsDlg2, groupDetailsDlg22;

    return Controller.extend("dailyMonitor.controller.BaseController", 
        {
            formatter: formatter,

            setFragments : function () 
            {
                groupDetailsDlg = sap.ui.xmlfragment("dailyMonitor.view.productDialog", this);
                this.getView().addDependent(groupDetailsDlg);

                groupDetailsDlg2 = sap.ui.xmlfragment("dailyMonitor.view.productDialog2", this);
                this.getView().addDependent(groupDetailsDlg2);

                groupDetailsDlg22 = sap.ui.xmlfragment("dailyMonitor.view.slaughterhouseDialog", this);
                this.getView().addDependent(groupDetailsDlg22);
            },

            getI18n: function() 
            {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            getRouter : function () 
            {
                return this.getOwnerComponent().getRouter();
            },
		

            getModel : function (sName) 
            {
                return this.getView().getModel(sName);
            },
		

            setModel : function (oModel, sName) 
            {
                return this.getView().setModel(oModel, sName);
            },
		
            getResourceBundle : function () 
            {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            handleLinkPressPE: function(oEvent)
            {
                var mdBroilerMonitor = this.getView().getModel("mdBroilerMonitor");
                mdBroilerMonitor.setProperty("/selectedRecordDialog", JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("mdBroilerMonitor").getObject())));
                let selectObject = oEvent.getSource().getBindingContext("mdBroilerMonitor").getObject();
                mdBroilerMonitor.setProperty("/dataPopover", selectObject.product);
                groupDetailsDlg.openBy(oEvent.getSource());
            },
            handleLinkPressPD: function(oEvent)
            {
                var mdBroilerEvictionMonitor = this.getView().getModel("mdBroilerEvictionMonitor");
                mdBroilerEvictionMonitor.setProperty("/selectedRecordDialog", JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("mdBroilerEvictionMonitor").getObject())));
                let selectObject = oEvent.getSource().getBindingContext("mdBroilerEvictionMonitor").getObject();
                mdBroilerEvictionMonitor.setProperty("/dataPopover", selectObject.product);
                groupDetailsDlg2.openBy(oEvent.getSource());
            },
            handleLinkPressPBD: function(oEvent)
            {
                var mdBroilerEvictionMonitor = this.getView().getModel("mdBroilerEvictionMonitor");
                mdBroilerEvictionMonitor.setProperty("/selectedRecordDialog", JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("mdBroilerEvictionMonitor").getObject())));
                let selectObject = oEvent.getSource().getBindingContext("mdBroilerEvictionMonitor").getObject();
	        var object = [{"name":selectObject.pb_name}];
                mdBroilerEvictionMonitor.setProperty("/dataPopover", object);
                groupDetailsDlg22.openBy(oEvent.getSource());
            }
        });
});
