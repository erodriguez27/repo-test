sap.ui.define([
    "technicalConfiguration/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/ui/model/Filter",
    "sap/m/Button",
], function(BaseController, JSONModel,Dialog,Filter, Button) {
    "use strict";

    return BaseController.extend("technicalConfiguration.controller.osslaughterhouse", {
        /**
         *
         * Se llama a la inicialización de la Vista
         */
        onInit: function() {
            //ruta para la vista principal
            this.getOwnerComponent().getRouter().getRoute("osslaughterhouse").attachPatternMatched(this._onRouteMatched, this);
            //ruta para la vista de detalles de un registro
            this.getOwnerComponent().getRouter().getRoute("osslaughterhouse_Record").attachPatternMatched(this._onRecordMatched, this);
            //ruta para la vista de creación de un registro
            this.getOwnerComponent().getRouter().getRoute("osslaughterhouse_Create").attachPatternMatched(this._onCreateMatched, this);
        },

        /**
         * Coincidencia de ruta para acceder a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onRouteMatched: function(oEvent) {
            /**
             * @type {Controller} that         Referencia a este controlador
             * @type {JSONModel} util         Referencia al modelo "util"
             * @type {JSONModel} OS            Referencia al modelo "OS"
             * @type {JSONModel} MDOSSLAUGHTERHOUSE        Referencia al modelo "osslaughterhouse"
             */

            var that = this,
                util = this.getView().getModel("util"),
                osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");

            //dependiendo del dispositivo, establece la propiedad "phone"
            this.getView().getModel("util").setProperty("/phone/",
                this.getOwnerComponent().getContentDensityClass() === "sapUiSizeCozy");


            //establece osslaughterhouse como la entidad seleccionada
            util.setProperty("/selectedEntity/", "osslaughterhouse");
            osslaughterhouse.setProperty("/settings/tableMode", "None");

            //obtiene los registros de osslaughterhouse
            this.onRead(that, util, osslaughterhouse);
        },

        /**
         * Obtiene todos los registros de osslaughterhouse
         * @param  {Controller} that         Referencia al controlador que llama esta función
         * @param  {JSONModel} util         Referencia al modelo "util"
         * @param  {JSONModel} osslaughterhouse Referencia al modelo "osslaughterhouse"
         */
        onRead: function(that, util, osslaughterhouse) {
            /** @type {Object} settings opciones de la llamada a la función ajax */
            var serviceUrl = util.getProperty("/serviceUrl");
            var settings = {
                url: serviceUrl+"/slaughterhouse",
                method: "GET",
                success: function(res) {
                    util.setProperty("/busy/", false);
                    osslaughterhouse.setProperty("/records/", res.data);

                },
                error: function(err) {
                    util.setProperty("/error/status", err.status);
                    //==QuitarLuego========================================//
                    util.setProperty("/busy/", false);
                    //==QuitarLuego========================================//
                    util.setProperty("/error/statusText", err.statusText);
                }
            };
            util.setProperty("/busy/", true);
            //borra los registros OSSLAUGHTERHOUSE que estón almacenados actualmente
            osslaughterhouse.setProperty("/records/", []);
            //realiza la llamada ajax
            $.ajax(settings);
        },

        /**
         * Coincidencia de ruta para acceder a la creación de un registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        _onCreateMatched: function(oEvent) {

            this._resetRecordValues();
            this._editRecordValues(true);
            this._editRecordRequired(true);
        },

        /**
         * Resetea todos los valores existentes en el formulario del registro
         */
        _resetRecordValues: function() {
            /**
             * @type {JSONModel} osslaughterhouse Referencia al modelo "osslaughterhouse"
             */
            var osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");

            osslaughterhouse.setProperty("/slaughterhouse_id/value", "");

            osslaughterhouse.setProperty("/name/editable", true);
            osslaughterhouse.setProperty("/name/value", "");
            osslaughterhouse.setProperty("/name/ok", false);
            osslaughterhouse.setProperty("/name/exception", "");
            osslaughterhouse.setProperty("/name/state", "None");
            osslaughterhouse.setProperty("/name/stateText", "");

            osslaughterhouse.setProperty("/code/editable", true);
            osslaughterhouse.setProperty("/code/value", "");
            osslaughterhouse.setProperty("/code/ok", false);
            osslaughterhouse.setProperty("/code/exception", "");
            osslaughterhouse.setProperty("/code/state", "None");
            osslaughterhouse.setProperty("/code/stateText", "");

            osslaughterhouse.setProperty("/capacity/editable", true);
            osslaughterhouse.setProperty("/capacity/value", "");
            osslaughterhouse.setProperty("/capacity/state", "None");
            osslaughterhouse.setProperty("/capacity/stateText", "");

            osslaughterhouse.setProperty("/description/editable", true);
            osslaughterhouse.setProperty("/description/value", "");
            osslaughterhouse.setProperty("/description/state", "None");
            osslaughterhouse.setProperty("/description/stateText", "");

            osslaughterhouse.setProperty("/address/editable", true);
            osslaughterhouse.setProperty("/address/value", "");
            osslaughterhouse.setProperty("/address/state", "None");
            osslaughterhouse.setProperty("/address/stateText", "");


        },

        /**
         * Habilita/deshabilita la edición de los datos de un registro osslaughterhouse
         * @param  {Boolean} edit "true" si habilita la edición, "false" si la deshabilita
         */
        _editRecordValues: function(edit,f) {

            var osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");
            if(f==="cancelEdit"){

                osslaughterhouse.setProperty("/name/value", osslaughterhouse.getProperty(osslaughterhouse.getProperty("/selectedRecordPath/")+"/name"));
                osslaughterhouse.setProperty("/code/value", osslaughterhouse.getProperty(osslaughterhouse.getProperty("/selectedRecordPath/")+"/code"));
                osslaughterhouse.setProperty("/capacity/value", osslaughterhouse.getProperty(osslaughterhouse.getProperty("/selectedRecordPath/")+"/capacity"));
                osslaughterhouse.setProperty("/description/value", osslaughterhouse.getProperty(osslaughterhouse.getProperty("/selectedRecordPath/")+"/description"));
                osslaughterhouse.setProperty("/address/value", osslaughterhouse.getProperty(osslaughterhouse.getProperty("/selectedRecordPath/")+"/address"));

                
            }
            osslaughterhouse.setProperty("/name/editable", edit);
            osslaughterhouse.setProperty("/code/editable", edit);
            osslaughterhouse.setProperty("/capacity/editable", edit);
            osslaughterhouse.setProperty("/description/editable", edit);
            osslaughterhouse.setProperty("/address/editable", edit);
        },

        /**
         * Se define un campo como obligatorio o no, de un registro osslaughterhouse
         * @param  {Boolean} edit "true" si es campo obligatorio, "false" si no es obligatorio
         */
        _editRecordRequired: function(edit) {
            var osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");

            osslaughterhouse.setProperty("/name/required", edit);
            osslaughterhouse.setProperty("/code/required", edit);
            osslaughterhouse.setProperty("/capacity/required", edit);
            osslaughterhouse.setProperty("/description/required", edit);
            osslaughterhouse.setProperty("/address/required", edit);
        },

        /**
         * verificar si una entrada de campo contiene un número utilizando una expresión regular que 
         * permite el formato Entero
         * @param {char} o numero
         */
        validateIntInput: function (o) {
            let input= o.getSource();
            let length = 10;
            let value = input.getValue();
            let regex = new RegExp(`/^[0-9]{1,${length}}$/`);

            if (regex.test(value)) {
                return true;
            }
            else {
                let aux = value.split("").filter(char => {
                    if (/^[0-9]$/.test(char)) {
                        if (char !== ".") {
                            return true;
                        }
                    }
                }).join("");

                value = aux.substring(0, length);

                if (value > 0) {
                    input.setValue(value);
                } else {
                    input.setValue("");
                }

                let osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");

                if(parseInt(value) <= 0){
                    osslaughterhouse.setProperty("/capacity/state", 'Error');
                    osslaughterhouse.setProperty("/capacity/stateText", 'La capacidad debe ser mayor a cero (0)'); 
                    osslaughterhouse.setProperty("/capacity/ok", false); 
                }else if(value === "" || value === null || value === undefined){

                    osslaughterhouse.setProperty("/capacity/state", 'Error');
                    osslaughterhouse.setProperty("/capacity/stateText", 'El campo no puede ser vacío'); 
                    osslaughterhouse.setProperty("/capacity/ok", false); 

                }else{
                    osslaughterhouse.setProperty("/capacity/state", 'None');
                    osslaughterhouse.setProperty("/capacity/stateText", '');
                    osslaughterhouse.setProperty("/capacity/ok", true);
                }

                return false;
            }
        },

        /**
         * Toma el valor de la entrada por la interacción del usuario: cada pulsación de tecla, eliminar, pegar, etc.
         * @param {Event} oEvent Evento que llamó esta función
         */
        validText: function (oEvent) {
            let input= oEvent.getSource(),
                nwCode = input.getValue().trim();

            let origin = input.sId.split("--")[1];
            let propertyTarget,
                osshed = this.getView().getModel("OSSLAUGHTERHOUSE");

            switch (origin) {
                case "description_id":
                    propertyTarget="description";
                    break;
                case "address_id":
                    propertyTarget="address";
                    break;
            }
            
            if(nwCode.length>100){
                osshed.setProperty("/"+propertyTarget+"/state", "Error");
                osshed.setProperty("/"+propertyTarget+"/stateText", "Excede el limite de caracteres permitido (100)");
                osshed.setProperty("/code/ok", false);
            }else{
                
                osshed.setProperty("/"+propertyTarget+"/state", "None");
                osshed.setProperty("/"+propertyTarget+"/stateText", "");
                osshed.setProperty("/code/ok", true);
               
            }



        },
        
        /**
         * Navega a la vista para crear un nuevo registro
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNewRecord: function(oEvent) {
            this.getRouter().navTo("osslaughterhouse_Create", {}, false /*create history*/ );
        },

        /**
         * Cancela la creación de un registro osslaughterhouse, y regresa a la vista principal
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCancelCreate: function(oEvent) {
            this._resetRecordValues();
            this.onNavBack(oEvent);
        },

        /**
         * Regresa a la vista principal de la entidad seleccionada actualmente
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onNavBack: function(oEvent) {
            /** @type {JSONModel} OS Referencia al modelo "OS" */
            var util = this.getView().getModel("util");

            this.getRouter().navTo(util.getProperty("/selectedEntity"), {}, false /*create history*/ );
        },

        /**
         * Solicita al servicio correspondiente crear un registro osslaughterhouse
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onCreate: function(oEvent) {
            //Si el registro que se desea crear es vólido
            if (this._validRecord()) {
                var that = this,
                    util = this.getView().getModel("util"),
                    osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE"),
                    serviceUrl = util.getProperty("/serviceUrl");


            
                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "name": osslaughterhouse.getProperty("/name/value"),
                        "code": osslaughterhouse.getProperty("/code/value"),
                        "capacity": osslaughterhouse.getProperty("/capacity/value"),
                        "description": osslaughterhouse.getProperty("/description/value"),
                        "address": osslaughterhouse.getProperty("/address/value"),
                        "capacity": osslaughterhouse.getProperty("/capacity/value"),
                        
                    }),
                    url: serviceUrl+"/slaughterhouse",
                    dataType: "json",
                    async: true,
                    success: function(data) {
                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that.onToast(that.getI18n().getText("OS.recordCreated"));
                        that.getRouter().navTo("osslaughterhouse", {}, true /*no history*/ );

                    },
                    error: function(error) {
                        that.onToast("Error: " + error.responseText);
                    }


                });
            }
        },

        /**
         * Valida la correctitud de los datos existentes en el formulario del registro
         * @return {Boolean} Devuelve "true" si los datos son correctos, y "false" si son incorrectos
         */
        _validRecord: function() {
            /**
             * @type {JSONModel} osslaughterhouse Referencia al modelo "osslaughterhouse"
             * @type {Boolean} flag "true" si los datos son vólidos, "false" si no lo son
             */
            var osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE"),
                flag = true,
                that = this;

            if (osslaughterhouse.getProperty("/name/value") === "") {
                flag = false;
                osslaughterhouse.setProperty("/name/state", "Error");
                osslaughterhouse.setProperty("/name/stateText", "el campo nombre no puede estar vacío");
            }else if(osslaughterhouse.getProperty("/name/state") === "Error"){
                flag = false;
            }else {
                osslaughterhouse.setProperty("/name/state", "None");
                osslaughterhouse.setProperty("/name/stateText", "");
            }

            if (osslaughterhouse.getProperty("/code/value") === "") {
                flag = false;
                osslaughterhouse.setProperty("/code/state", "Error");
                osslaughterhouse.setProperty("/code/stateText", "el campo código no puede estar vacío");
            }else if(osslaughterhouse.getProperty("/code/state") === "Error"){
                flag = false;
            }else {
                osslaughterhouse.setProperty("/code/state", "None");
                osslaughterhouse.setProperty("/code/stateText", "");
            }

            if (osslaughterhouse.getProperty("/capacity/value") === "") {
                flag = false;
                osslaughterhouse.setProperty("/capacity/state", "Error");
                osslaughterhouse.setProperty("/capacity/stateText", this.getI18n().getText("enter.FIELD.greaterThan"));
            }else if(osslaughterhouse.getProperty("/capacity/state") === "Error"){
                flag = false;
            } else {
                osslaughterhouse.setProperty("/capacity/state", "None");
                osslaughterhouse.setProperty("/capacity/stateText", "");
            }

            if (osslaughterhouse.getProperty("/description/value") === "") {
                flag = false;
                osslaughterhouse.setProperty("/description/state", "Error");
                osslaughterhouse.setProperty("/description/stateText", "el campo descripción no puede estar vacío");
            } else if(osslaughterhouse.getProperty("/description/state") === "Error"){
                flag = false;
            }else {
                osslaughterhouse.setProperty("/description/state", "None");
                osslaughterhouse.setProperty("/description/stateText", "");
            }

            if (osslaughterhouse.getProperty("/address/value") === "") {
                flag = false;
                osslaughterhouse.setProperty("/address/state", "Error");
                osslaughterhouse.setProperty("/address/stateText", "el campo dirección no puede estar vacío");
            } else if(osslaughterhouse.getProperty("/description/state") === "Error"){
                flag = false;
            }  else {
                osslaughterhouse.setProperty("/address/state", "None");
                osslaughterhouse.setProperty("/address/stateText", "");
            }

            return flag;
        },

        /**
         * Coincidencia de ruta para acceder a los detalles de un registro
         * @param  {Event} oEvent Evento que llama esta función
         */
        _onRecordMatched: function(oEvent) {

            this._viewOptions();

        },

        /**
         * Cambia las opciones de visualización disponibles en la vista de detalles de un registro
         */
        _viewOptions: function(f) {
            var osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");
            osslaughterhouse.setProperty("/save/", false);
            osslaughterhouse.setProperty("/cancel/", false);
            osslaughterhouse.setProperty("/modify/", true);
            osslaughterhouse.setProperty("/delete/", true);

            this._editRecordValues(false,f);
            this._editRecordRequired(false);
        },

        /**
         * Ajusta la vista para editar los datos de un registro
         * @param  {Event} oEvent Evento que llama esta función
         */
        onEdit: function(oEvent) {

            var osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");
            osslaughterhouse.setProperty("/name/state", "None");
            osslaughterhouse.setProperty("/name/stateText", "");
            osslaughterhouse.setProperty("/code/state", "None");
            osslaughterhouse.setProperty("/code/stateText", "");
            osslaughterhouse.setProperty("/capacity/state", "None");
            osslaughterhouse.setProperty("/capacity/stateText", "");
            osslaughterhouse.setProperty("/description/state", "None");
            osslaughterhouse.setProperty("/description/stateText", "");
            osslaughterhouse.setProperty("/address/state", "None");
            osslaughterhouse.setProperty("/address/stateText", "");
            osslaughterhouse.setProperty("/save/", true);
            osslaughterhouse.setProperty("/cancel/", true);
            osslaughterhouse.setProperty("/modify/", false);
            osslaughterhouse.setProperty("/delete/", false);
            this._editRecordRequired(true);
            this._editRecordValues(true);
        },

        /**
         * Cancela la edición de un registro osslaughterhouse
         * @param  {Event} oEvent Evento que llama esta función
         */
        onCancelEdit: function(oEvent) {
            /** @type {JSONModel} osslaughterhouse  Referencia al modelo osslaughterhouse */

            this.onView("cancelEdit");
        },
        /**
         * Ajusta la vista para visualizar los datos de un registro
         */
        onView: function(f) {
            this._viewOptions(f);
        },

        /**
         * Solicita al servicio correspondiente actualizar un registro osslaughterhouse
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onUpdate: function(oEvent) {
            /**
             * Si el registro que se quiere actualizar es válido y hubo algún cambio
             * con respecto a sus datos originales
             */
            if (this._validRecord() && this._recordChanged()) {
                /**
                 * @type {JSONModel} osslaughterhouse       Referencia al modelo "osslaughterhouse"
                 * @type {JSONModel} util         Referencia al modelo "util"
                 * @type {Controller} that         Referencia a este controlador
                 */
                var osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE"),
                    util = this.getView().getModel("util"),
                    that = this,
                    serviceUrl = util.getProperty("/serviceUrl");

                $.ajax({
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({
                        "slaughterhouse_id": osslaughterhouse.getProperty("/slaughterhouse_id/value"),
                        "name": osslaughterhouse.getProperty("/name/value"),
                        "code": osslaughterhouse.getProperty("/code/value"),
                        "capacity": osslaughterhouse.getProperty("/capacity/value"),
                        "description": osslaughterhouse.getProperty("/description/value"),
                        "address": osslaughterhouse.getProperty("/address/value"),
                    }),
                    url: serviceUrl+"/slaughterhouse/",
                    dataType: "json",
                    async: true,
                    success: function(data) {

                        util.setProperty("/busy/", false);
                        that._resetRecordValues();
                        that._viewOptions();
                        that.onToast(that.getI18n().getText("OS.recordUpdated"));
                        that.getRouter().navTo("osslaughterhouse", {}, true /*no history*/ );

                    },
                    error: function(request, status, error) {
                        that.onToast("Error de comunicación");
                    }
                });
            }
        },
        /**
         * Verifica si el registro seleccionado tiene algún cambio con respecto a sus valores originales
         * @return {Boolean} Devuelve "true" el registro cambió, y "false" si no cambió
         */
        _recordChanged: function() {
            /**
             * @type {JSONModel} OSSLAUGHTERHOUSE Referencia al modelo "OSSLAUGHTERHOUSE"
             * @type {Boolean} flag            "true" si el registro cambió, "false" si no cambió
             */
            var osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE"),
                flag = false;

            if (osslaughterhouse.getProperty("/name/value") !== osslaughterhouse.getProperty(osslaughterhouse.getProperty("/selectedRecordPath/") + "/name")) {
                flag = true;
            }

            if (osslaughterhouse.getProperty("/code/value") !== osslaughterhouse.getProperty(osslaughterhouse.getProperty("/selectedRecordPath/") + "/code")) {
                flag = true;
            }

            if (osslaughterhouse.getProperty("/capacity/value") !== osslaughterhouse.getProperty(osslaughterhouse.getProperty("/selectedRecordPath/") + "/capacity")) {
                flag = true;
            }

            if (osslaughterhouse.getProperty("/description/value") !== osslaughterhouse.getProperty(osslaughterhouse.getProperty("/selectedRecordPath/") + "/description")) {
                flag = true;
            }

            if (osslaughterhouse.getProperty("/address/value") !== osslaughterhouse.getProperty(osslaughterhouse.getProperty("/selectedRecordPath/") + "/address")) {
                flag = true;
            }

            if(!flag) this.onToast("No se detectaron cambios");

            return flag;
        },

        /**
         * Este evento se activa cuando el usuario cambia el valor del campo de búsqueda. se actualiza el binding de la lista
         * @param {Event} oEvent Evento que llamó esta función
         */
        onSlaughterhouseSearch: function(oEvent){
            var sQuery = this.getView().byId("slaughterhouseSearchField").getValue().toString(),
                binding = this.getView().byId("slaughterhouseTable").getBinding("items");

            if(sQuery){
                let code = new Filter("code", sap.ui.model.FilterOperator.Contains, sQuery);
                let name = new Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                    
                var oFilter = new Filter({aFilters:[code,name], and:false});
            }
    
            binding.filter(oFilter);


        },

        /**
         * Levanta el Dialogo que muestra la confirmacion del Eliminar un registro y ejecuta la peticion de ser aceptado el borrado
         * @param  {Event} oEvent Evento que llamó esta función
         */
        onConfirmDelete: async function(oEvent){

            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var confirmation = oBundle.getText("confirmation");
            var util = this.getView().getModel("util");
            var serviceUrl = util.getProperty("/serviceUrl");
            var osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");
            var that = this;


            var dialog = new Dialog({
                title: confirmation,
                type: "Message",
                content: new sap.m.Text({
                    text: "¿Desea eliminar la planta de beneficio?"
                }),

                beginButton: new Button({
                    text: "Si",
                    press: function() {
                        util.setProperty("/busy/", true);
                        $.ajax({
                            type: "DELETE",
                            contentType: "application/json",
                            data: JSON.stringify({
                                "slaughterhouse_id": osslaughterhouse.getProperty("/slaughterhouse_id/value")
                            }),
                            url: serviceUrl+"/slaughterhouse/",
                            dataType: "json",
                            async: true,
                            success: function(data) {

                                util.setProperty("/busy/", false);
                                that.getRouter().navTo("osslaughterhouse", {}, true);
                                dialog.close();

                            },
                            error: function(request, status, error) {
                                that.onToast("Error de comunicación");
                            }
                        });
                    }
                }),
                endButton: new Button({
                    text: "No",
                    press: function() {
                        dialog.close();
                        dialog.destroy();
                    }
                })
            });

            dialog.open();

        },

        /**
         * Toma el valor de la entrada por la interacción del usuario: cada pulsación de tecla, eliminar, pegar, etc.
         * @param {Event} oEvent Evento que llamó esta función
         */
        changeName: function(oEvent){
            let input= oEvent.getSource(),
                nwCode = input.getValue()
            let osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");

            if(nwCode.length>45){
                osslaughterhouse.setProperty("/name/state", "Error");
                osslaughterhouse.setProperty("/name/stateText", "Excede el limite de caracteres permitido (45)");
                osslaughterhouse.setProperty("/name/ok", false);
            }else{
                this.checkChange(input.getValue().toString(), "/name", "changeName");
            }
        },

        /**
         * Toma el valor de la entrada por la interacción del usuario: cada pulsación de tecla, eliminar, pegar, etc.
         * @param {Event} oEvent Evento que llamó esta función
         */
        changeCode: function(oEvent){
            let input= oEvent.getSource(),
                nwCode = input.getValue().trim();
            input.setValue(input.getValue().trim());
            let osslaughterhouse = this.getView().getModel("OSSLAUGHTERHOUSE");

            if(nwCode.length>20){
                osslaughterhouse.setProperty("/code/state", "Error");
                osslaughterhouse.setProperty("/code/stateText", "Excede el limite de caracteres permitido (20)");
                osslaughterhouse.setProperty("/code/ok", false);
            }else{
                this.checkChange(input.getValue().toString(), "/code", "changeCode");
            }
        },

        /**
         * Valida si el registro de entrada es unico 
         * @param {String} name valor de entrada
         * @param {String} field campo donde se encuentra el focus
         * @param {String} funct funcion a validar
         */
        checkChange: async function(name,field, funct){
            let mdModel= this.getModel("OSSLAUGHTERHOUSE");
        
            if (name=="" || name===null){
                mdModel.setProperty(field+"/state", "None");
                mdModel.setProperty(field+"/stateText", "");
                mdModel.setProperty(field+"/ok", false);
            }
            else{

                let registers = mdModel.getProperty("/records");
                let found, exception
                if(funct === "changeCode"){
                    exception = mdModel.getProperty("/code/exception")
                    found = await registers.find(element => ((element.code).toLowerCase() === name.toLowerCase() && element.code !== exception));
                    
                }else{
                    exception = mdModel.getProperty("/name/exception")

                    found = await registers.find(element => ((element.name).toLowerCase() === name.toLowerCase() && element.name !== exception));

                }

                if(found === undefined){

                    mdModel.setProperty(field+"/state", "Success");
                    mdModel.setProperty(field+"/stateText", "");
                    mdModel.setProperty(field+"/ok", true);

                }else{

                    mdModel.setProperty(field+"/state", "Error");
                    mdModel.setProperty(field+"/stateText", (funct==="changeCode") ? "código ya existente" : "nombre ya existente");
                    mdModel.setProperty(field+"/ok", false);
                }

            }
        }

    });
});
