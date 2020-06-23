sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "sap/ui/model/json/JSONModel",
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("technicalConfiguration.controller.App", {
    /**
     * Inicializa el modo de densidad de contenido a la vista raíz
     */
    onInit: function () {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            this.setModel(new JSONModel({
                "originalRecords": []
            }), "oscenterOriginal");

        }
    });
});
