/* eslint-disable no-console */
sap.ui.define([
    "technicalConfiguration/controller/BaseController",
], function (BaseController) {
    "use strict";

    return BaseController.extend("technicalConfiguration.controller.Master", {
        /**
         * Se llama a la inicialización de la Vista
         */
        onInit: function () {		
            var oList = this.getView().byId("entitiesList");
            this._oList = oList;
            this._oListFilterState = {
                aFilter: [],
                aSearch: []
            };
            this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
        },
        /**
         * Coincidencia de ruta para acceder a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onMasterMatched: function(oEvent) {
            let util = this.getView().getModel("util"),
                that = this;

            var settings = {
                url: "/entities",
                method: "GET",
                success: function(res) {
                    util.setProperty("/entities/", res);
                },
                error: function(err) {
                    console.log(err.status);
                    console.log("/error/statusText", err.statusText);
                    
                }
            };
            $.ajax(settings); 
        },
         /**
		 * Muestra la vista principal de la entidad seleccionada
		 * @param  {Event} oEvent Evento que llamó esta función
		 */
        onSelectionChange: function(oEvent) {

            /**
			 * @type {Array} entities Arreglo con las entidades disponibles
			 * @type {String} name    Nombre de la entidad seleccionada
			 */
            var name = oEvent.getSource().getBindingContext("util").getObject().name;
            console.log(name);
            this.getRouter().navTo(name, {}, false /*create history*/ );

        },

        /**
		 * Busca una entidad y filtra la lista de entidades actuales
		 * @param  {Event} oEvent Evento que llamó esta función
		 */
        onSearch: function(oEvent) {
            /**
			 * @type {Array} aFilters Arreglo para los filtros a realizar en la lista de entidades
			 * @type {String} sQuery  Valor especificado en la búsqueda
			 * @type {Object} binding Binding de la lista de entidades
			 */
            var aFilters = [],
                sQuery = oEvent.getSource().getValue(),
                binding = this.getView().byId("entitiesList").getBinding("items");

            if (sQuery && sQuery.length > 0) {
                /** @type {Object} filter1 Primer filtro de la búsqueda */
                var filter1 = new sap.ui.model.Filter("displayName", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters = new sap.ui.model.Filter([filter1]);
            }

            //se actualiza el binding de la lista
            binding.filter(aFilters);
        },
        /**
         * Controlador de eventos para navegar de regreso. Vuelve al Launchpad
         */
        goToLaunchpad: function () {
            window.location.href = "/Apps/launchpad/webapp";
        },
        /**
         * Marca la cantidad de entidades que se vizualizan en el master
         * @param {Integer} iTotalItems
         */
        _updateListItemCount: function(iTotalItems) {
            var sTitle;            
            // solo actualice el contador si la longitud es final
            if (this._oList.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("OS.TitleCount", [iTotalItems]);
                this.getModel("util").setProperty("/title", sTitle);
            }
        },
        /**
         * procesa el enlace de elementos.
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onUpdateFinished: function(oEvent) {

            let util = this.getModel("util");
            util.setProperty("/title", this.getResourceBundle().getText("OS.TitleCount", [0]));
            util.setProperty("/noDataText", this.getResourceBundle().getText("OS.masterListNoDataText"));

            this._updateListItemCount(oEvent.getParameter("total"));
        }
    });
});
