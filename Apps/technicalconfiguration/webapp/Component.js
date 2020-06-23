sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "technicalConfiguration/model/models"
], function(UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("technicalConfiguration.Component", {

        metadata: {
            manifest: "json"
        },
        /**
		 * UI5 inicializa el componente automáticamente durante el inicio de la aplicación y llama al método init una vez.
		 * @public
		 * @override
		 */
        init: function() {
            // llamar a la función init del componente base
            UIComponent.prototype.init.apply(this, arguments);

            // establecer el modelo del dispositivo
            this.setModel(models.createDeviceModel(), "device");
            this.getRouter().initialize();
        },
        /**
         * compruebe si FLP ya ha establecido la clase de densidad de contenido; no hacer nada en este caso.
         * aplique el modo "sapUiSizeCompact" si no se admite la función táctil
         * "sapUiSizeCozy" en caso de soporte táctil; predeterminado para la mayoría de los controles sap.m
         * @returns {Class} clase css de densidad 
         */
        getContentDensityClass : function() {
            if (this._sContentDensityClass === undefined) {
                
                if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
                    this._sContentDensityClass = "";
                } else if (!Device.support.touch || Device.system.desktop) { 
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        }
    });
});
