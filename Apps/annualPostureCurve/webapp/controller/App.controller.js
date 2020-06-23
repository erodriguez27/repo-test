sap.ui.define([
    "annualPostureCurve/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("annualPostureCurve.controller.App", {

        onInit: function() {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            this.setModel(new JSONModel(
                {
                    "busy": true,
                    "serviceError": {
                        "status": "",
                        "message": ""
                    },
                    "connectionError": {
                        "status": "",
                        "message": ""
                    },
                    "serviceUrl": "",
                    "service": "local",
                    "local": {
                        "lotEggs": "/lot_eggs",
                        "lotPostureCurve": "/sposture_curve/findLotByScenario ",
                        "findBreed": "/breed"

                    },
                    "remote": {
                        "addHousingway": "/housingway",
                        "truncateHousingWay": "/housingway/truncateHousingWay"
                    }
                }), "util");

            this.setModel(new JSONModel(
                {
                    "value": "",
                    "records": []
                }), "mdbreed");


        }

    });

});
