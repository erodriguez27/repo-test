sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "technicalConfiguration/model/formatter"
], function(Controller,formatter ) {
    "use strict";
    return Controller.extend("technicalConfiguration.controller.BaseController", {
        formatter: formatter,
        /**
		 * Método de conveniencia para acceder al enrutador en cada controlador de la aplicación.
		 * @public
		 * @returns {sap.ui.core.routing.Router} el enrutador para este componente
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Método de conveniencia para obtener el modelo de vista por nombre en cada controlador de la aplicación.
		 * @public
		 * @param {string} sName nombre del modelo
		 * @returns {sap.ui.model.Model} Instancia del modelo
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Método de conveniencia para configurar el modelo de vista en cada controlador de la aplicación.
		 * @public
		 * @param {sap.ui.model.Model} oModel Instancia del modelo
		 * @param {string} sName nombre del modelo
		 * @returns {sap.ui.mvc.View} Instancia de la Vista
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		
		/**
		 * Controlador de eventos para navegar de regreso.
		 * Comprueba si hay una entrada en el historial. En caso afirmativo, history.go (-1) sucederá.
		 * De lo contrario, reemplazará la entrada actual del historial del navegador con la ruta maestra.
		 * @public
		 */
        onNavMaster: function(oEvent) {
            this.getRouter().navTo("master", {}, true /*no history*/ );
        },

		/**
		 * Método de conveniencia para obtener el paquete de recursos.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} Recurso del componente
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Controlador de eventos para navegar de regreso.
		 * Comprueba si hay una entrada en el historial. En caso afirmativo, history.go (-1) sucederá.
		 * De lo contrario, reemplazará la entrada actual del historial del navegador con la ruta maestra.
		 * @public
		 */
		onNavBack: function() {
			this.getRouter().getTargets().display("master", {}, true);
		},
		/**
		 *
		 * Inicializa el modelo i18 llamando al método 
		 * @returns {sap.ui.model.resource.ResourceModel} Recurso del componente
		 */
		getI18n: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		/**
		 * Inicial la funcion para mostrar los mensajes
		 * @param {String} message Texto a mostrar
		 * @param {null} f Default
		 */
		onToast: function(message, f) {
            sap.m.MessageToast.show(message, {
                width: "22em",
                closeOnBrowserNavigation: false,
                onClose: f
            });
		},
		/**
         * Visualiza los detalles de un registro OSPARTNERSHIP
         * @param  {Event} oEvent Evento que llamó esta función
         */
		onViewPartnershipRecord: function(oEvent) {
            var ospartnership = this.getView().getModel("OSPARTNERSHIP");
            ospartnership.setProperty("/save/", false);
            ospartnership.setProperty("/cancel/", false);
            ospartnership.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("OSPARTNERSHIP"));
            ospartnership.setProperty("/partnership_id/value", oEvent.getSource().getBindingContext("OSPARTNERSHIP").getObject().partnership_id);
            ospartnership.setProperty("/name/value", oEvent.getSource().getBindingContext("OSPARTNERSHIP").getObject().name);
            ospartnership.setProperty("/disable/value", oEvent.getSource().getBindingContext("OSPARTNERSHIP").getObject().os_disable);
            ospartnership.setProperty("/code/value", oEvent.getSource().getBindingContext("OSPARTNERSHIP").getObject().code);
            ospartnership.setProperty("/description/value", oEvent.getSource().getBindingContext("OSPARTNERSHIP").getObject().description);
            ospartnership.setProperty("/address/value", oEvent.getSource().getBindingContext("OSPARTNERSHIP").getObject().address);
            
            let obj = oEvent.getSource().getBindingContext("OSPARTNERSHIP").getObject();
			ospartnership.setProperty("/copy", obj);
            this.getView().byId("partnershipSearchField").setValue(""); 
            this.getView().byId("partnershipTable").getBinding("items").filter(null)
            this.getRouter().navTo("ospartnership_Record", {}, false /*create history*/ );
		},

		/**
		 * Visualiza los detalles de un registro OSFARM
		 * @param  {Event} oEvent Evento que llamó esta función
		 */
		onViewFarmRecord: function (oEvent) {
            var osfarm = this.getView().getModel("OSFARM");
            var record = JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("OSFARM").getObject()));
			osfarm.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("OSFARM")["sPath"]);
            osfarm.setProperty("/name/value", record.name);
            osfarm.setProperty("/disable/value", record.os_disable);
            osfarm.setProperty("/code/value", record.code);
            osfarm.setProperty("/type_id/value", record.farm_type_id);
            osfarm.setProperty("/order/value", record._order);
            this.getRouter().navTo("osfarm_Record", {}, true);
		},
		
		/**
         * Visualiza los detalles de un registro CENTER
         * @param  {Event} oEvent Evento que llamó esta función
         */
		onViewCenterRecord: function(oEvent) {
            /** @type {JSONModel} OSCENTER Referencia al modelo "CENTER" */

            this.getView().byId("searchCenterId").setValue(""); 
            this.getView().byId("centerTable").getBinding("items").filter(null)
            var oscenter = this.getView().getModel("OSCENTER");
            var record = JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("OSCENTER").getObject()));
            oscenter.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("OSCENTER")["sPath"]);
            oscenter.setProperty("/code/value", record.code);
            oscenter.setProperty("/name/value", record.name);
            this.getRouter().navTo("oscenter_Record", {}, true);
		},

        /**
		 * Visualiza los detalles de un registro SHED
		 * @param  {Event} oEvent Evento que llamó esta función
		 */
        onViewShedRecord: function(oEvent) {
            /** @type {JSONModel} SHED Referencia al modelo "SHED" */
			var osshed = this.getView().getModel("OSSHED");
            osshed.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("OSSHED")["sPath"]);
            osshed.setProperty("/name/value", oEvent.getSource().getBindingContext("OSSHED").getObject().code);
            osshed.setProperty("/stall_height/value", parseFloat(oEvent.getSource().getBindingContext("OSSHED").getObject().stall_height));
            osshed.setProperty("/stall_width/value", parseFloat(oEvent.getSource().getBindingContext("OSSHED").getObject().stall_width));
            osshed.setProperty("/order/value", parseInt(oEvent.getSource().getBindingContext("OSSHED").getObject()._order));
            osshed.setProperty("/status/value", oEvent.getSource().getBindingContext("OSSHED").getObject().statusshed_id);
            osshed.setProperty("/environment/value", oEvent.getSource().getBindingContext("OSSHED").getObject().environment_id);
            osshed.setProperty("/disable/value", oEvent.getSource().getBindingContext("OSSHED").getObject().os_disable);
            osshed.setProperty("/rehousing/value", oEvent.getSource().getBindingContext("OSSHED").getObject().rehousing);
            osshed.setProperty("/capmin/value", oEvent.getSource().getBindingContext("OSSHED").getObject().capmin);
            osshed.setProperty("/capmax/value", oEvent.getSource().getBindingContext("OSSHED").getObject().capmax);
            osshed.setProperty("/rotation_days/value", oEvent.getSource().getBindingContext("OSSHED").getObject().rotation_days);
            let copy = {
                code: oEvent.getSource().getBindingContext("OSSHED").getObject().code,
                stall_height: parseFloat(oEvent.getSource().getBindingContext("OSSHED").getObject().stall_height),
                stall_width: parseFloat(oEvent.getSource().getBindingContext("OSSHED").getObject().stall_width),
                order: parseInt(oEvent.getSource().getBindingContext("OSSHED").getObject()._order),
                status: oEvent.getSource().getBindingContext("OSSHED").getObject().statusshed_id,
                environment: oEvent.getSource().getBindingContext("OSSHED").getObject().environment_id,
                disable: oEvent.getSource().getBindingContext("OSSHED").getObject().os_disable,
                rehousing: oEvent.getSource().getBindingContext("OSSHED").getObject().rehousing,
                capmin: oEvent.getSource().getBindingContext("OSSHED").getObject().capmin,
                capmax: oEvent.getSource().getBindingContext("OSSHED").getObject().capmax,
                rotation_days: oEvent.getSource().getBindingContext("OSSHED").getObject().rotation_days
            }
            osshed.setProperty("/copy", copy);
            this.getRouter().navTo("osshed_Record", {}, true);
        },
		
		/**
		 * Visualiza los detalles de un registro MDSTAGE
		 * @param  {Event} oEvent Evento que llamó esta función
		 */
		onViewIncubatorPlantRecord: function(oEvent) {

			/** @type {JSONModel} incubatorPlant Referencia al modelo "incubatorPlant" */
			var osincubatorplant = this.getView().getModel("OSINCUBATORPLANT");
			var record = JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("OSINCUBATORPLANT").getObject()));
			osincubatorplant.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("OSINCUBATORPLANT")["sPath"]);
			osincubatorplant.setProperty("/name/value", record.name);
			osincubatorplant.setProperty("/code/value", record.code);
			osincubatorplant.setProperty("/description/value", record.description);
			osincubatorplant.setProperty("/max_storage/value", record.max_storage);
			osincubatorplant.setProperty("/min_storage/value", record.min_storage);
			osincubatorplant.setProperty("/acclimatized/value", record.acclimatized);
			osincubatorplant.setProperty("/suitable/value", record.suitable);
			osincubatorplant.setProperty("/expired/value", record.expired);

			let copy = {
				name: record.name,
				code: record.code,
				description: record.description,
				max_storage: record.max_storage,
				min_storage: record.min_storage,
				acclimatized: record.acclimatized,
				suitable: record.suitable,
				expired: record.expired
			}
			osincubatorplant.setProperty("/copy", copy);
			this.getView().byId("searchIncPlantId").setValue(""); 
            this.getView().byId("incubatorPlantTable").getBinding("items").filter(null)
			this.getRouter().navTo("osIncubatorPlant_Record", {}, true);
		},
        
        /**
		 * Visualiza los detalles de un registro OSINCUBATOR
		 * @param  {Event} oEvent Evento que llamó esta función
		 */
        onViewIncubatorRecord: function (oEvent) {
            let osincubator = this.getView().getModel("OSINCUBATOR");
            let record = JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext("OSINCUBATOR").getObject()));
            osincubator.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("OSINCUBATOR")["sPath"]);
            osincubator.setProperty("/name/value", record.name);
            osincubator.setProperty("/code/value", record.code);
            osincubator.setProperty("/description/value", record.description);
            osincubator.setProperty("/order/value", record._order);
            osincubator.setProperty("/capacity/value", record.capacity);
            osincubator.setProperty("/sunday/value", record.sunday===1);
            osincubator.setProperty("/monday/value", record.monday===1);
            osincubator.setProperty("/tuesday/value", record.tuesday===1);
            osincubator.setProperty("/wednesday/value", record.wednesday===1);
            osincubator.setProperty("/thursday/value", record.thursday===1);
            osincubator.setProperty("/friday/value", record.friday===1);
            osincubator.setProperty("/saturday/value", record.saturday===1);
            osincubator.setProperty("/available/value", record.available===1);
            this.getRouter().navTo("osIncubator_Record", {}, true);

            osincubator.setProperty("/copy", {
                name: record.name,
                code: record.code,
                description: record.description,
                order: record.order,
                capacity: record.capacity,
                sunday:record.sunday === 1,
                monday:record.monday === 1,
                tuesday:record.tuesday === 1,
                wednesday:record.wednesday === 1,
                thursday:record.thursday === 1,
                friday:record.friday === 1,
                saturday:record.saturday === 1,
            });
		},
		
		/**
		 * Visualiza los detalles de un registro ospartnership
		 * @param  {Event} oEvent Evento que llamó esta función
		 */
		onViewSlaughterhouseRecord: function(oEvent) {

			var osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");
			osslaughterhouse.setProperty("/save/", false);
			osslaughterhouse.setProperty("/cancel/", false);
			osslaughterhouse.setProperty("/selectedRecordPath/", oEvent.getSource().getBindingContext("OSSLAUGHTERHOUSE"));
			osslaughterhouse.setProperty("/slaughterhouse_id/value", oEvent.getSource().getBindingContext("OSSLAUGHTERHOUSE").getObject().slaughterhouse_id);
			osslaughterhouse.setProperty("/name/value", oEvent.getSource().getBindingContext("OSSLAUGHTERHOUSE").getObject().name);
			osslaughterhouse.setProperty("/name/exception", oEvent.getSource().getBindingContext("OSSLAUGHTERHOUSE").getObject().name);
			osslaughterhouse.setProperty("/code/value", oEvent.getSource().getBindingContext("OSSLAUGHTERHOUSE").getObject().code);
			osslaughterhouse.setProperty("/code/value", oEvent.getSource().getBindingContext("OSSLAUGHTERHOUSE").getObject().code);
			osslaughterhouse.setProperty("/description/value", oEvent.getSource().getBindingContext("OSSLAUGHTERHOUSE").getObject().description);
			osslaughterhouse.setProperty("/address/value", oEvent.getSource().getBindingContext("OSSLAUGHTERHOUSE").getObject().address);
			osslaughterhouse.setProperty("/capacity/value", oEvent.getSource().getBindingContext("OSSLAUGHTERHOUSE").getObject().capacity);
			
            this.getView().byId("slaughterhouseSearchField").setValue(""); 
            this.getView().byId("slaughterhouseTable").getBinding("items").filter(null)
			this.getRouter().navTo("osslaughterhouse_Record", {}, false /*create history*/ );
		}
    });
});
