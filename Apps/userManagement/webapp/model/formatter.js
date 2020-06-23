sap.ui.define([], function() {
    "use strict";

    return {
        formatApps: function(app){

            switch (app) {
            case "technicalConfiguration": 
                return ("Configuración técnica");
            case "calendario": 
                return ("Calendario");
            case "mantenimiento-escenarios":
                return ("Mantenimiento de escenario");
            case "liftBreedingPlanningM":
                return ("Levante y cría");
            case "breedingPlanningM":
                return ("Producción");
            case "annualPostureCurve":
                return ("Curva anual de Postura");
            case "incubatorPlanningM": 
                return ("Incubadora");
            case "broilersPlanningM":
                return ("Engorde");
            case "broilerEviction": 
                return ("Desalojo");
            case "userManagement":
                return ("Gestión de Usuarios");
            case "dailyMonitor": 
                return ("Monitor diario");
            case "synchronizer":
                return ("Sincronización");
            case "dataImport":
                return ("Carga Masiva de Materiales");
            case "coldRoom":
                return ("Cuarto Frio");
            case "traceability": 
                return ("Trazabilidad de Lotes");
            case "synchronization":
                return ("Sincronizador");
            case "adjustments":
                return ("Ajustes");
            }
        }

    };
});