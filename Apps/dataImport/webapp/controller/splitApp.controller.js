sap.ui.define([
    "dataImport/controller/BaseController",
], function(BaseController) {
    "use strict";

    return BaseController.extend("dataImport.controller.splitApp", {

        /**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ZSF_CMSV_0003.view.splitApp
		 */
        //	onInit: function() {
        //
        //	},

        /**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ZSF_CMSV_0003.view.splitApp
		 */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ZSF_CMSV_0003.view.splitApp
		 */
        //	onAfterRendering: function() {
        //
        //	},

        /**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ZSF_CMSV_0003.view.splitApp
		 */
        //	onExit: function() {
        //
        //	}

    });

});