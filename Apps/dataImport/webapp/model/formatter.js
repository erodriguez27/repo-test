sap.ui.define([], function() {
    "use strict";

    return {

        convertidorMedida: function(cantidad, unidad) {
            if (unidad == "TON") {
                return cantidad * 1000 + " KG";
            } else {
                return cantidad * 50 + " KG";
            }
        },
        unidadMedida: function(unidad) {
            return "KG";
        },

        showContinueButton : function(band, structure) {
            console.log(band, structure);
            return band && structure != null;
        },

        validCantidades: function(status) {
            var result = "";
            if (status === "" | status === undefined) {
                result = "Valor Necesario";
            } else {
                result = status;
            }
            return result;
        },

        validIcon: function(silo, descripcion, fecha, tipoMedicion, capacidadMax, existenciaActual) {
            var result = "";
            if (silo === "" | silo === undefined | descripcion === "" | descripcion === undefined | fecha === "" | fecha === undefined |
        tipoMedicion === "" | tipoMedicion === undefined | capacidadMax === "" | capacidadMax === undefined | existenciaActual === "" |
        existenciaActual === undefined) {
                result = "decline";
            } else {
                result = "accept";
            }
            return result;
        },
        validColor: function(silo, descripcion, fecha, tipoMedicion, capacidadMax, existenciaActual) {
            var result = "";
            if (silo === "" | silo === undefined | descripcion === "" | descripcion === undefined | fecha === "" | fecha === undefined |
        tipoMedicion === "" | tipoMedicion === undefined | capacidadMax === "" | capacidadMax === undefined | existenciaActual === "" |
        existenciaActual === undefined) {
                result = "Red";
            } else {
                //result = "#40FF00";
                result = "#2B7D2B";
            }
            return result;
        },
        status: function(Status){

            if(Status === "noConfirmado")
            {
                return "No Confirmado";
            }
            else
            {
                return "Confirmado";
            }
        },

        infoStatus: function(Status){
            if (Status === "noConfirmado") {
                return "Error";
            } else {
                return "Success";
            }
        },
        validarPattern: function(val){
            console.log(val);
            return "Error";
        },

        // ** VALIDATIONS **//
        validate : function(val, rules) {

            return "Error";
            console.log(val, rules);
            if (rules.required) {
                if (val === ""  || val === undefined) {
                    return "Error";
                }
            }

            if (rules.pattern != "") {
                let regex = new RegExp(rules.pattern);
                if (!regex.test(val)) {
                    return "Error";
                }
            }

            return "None";
        },

        message : function(val, rules) {
            if (rules.required) {
                if (val === ""  || val === undefined) {
                    return rules.errorEmpty;
                }
            }

            if (rules.pattern != "") {
                let regex = new RegExp(rules.pattern);
                if (!regex.test(val)) {
                    return rules.errorPattern;
                }
            }

            return "";
        },

        displayName : function(val) {
            let structureModel = this.getModel("structure"),
                selected = structureModel.getProperty("/selected");

            return structureModel.getProperty("/list")
                .filter(structure => structure.key === selected)[0]
                .display;
        }


    };
});