/* eslint-disable no-console */
const conn = require("../db");

function DBfindProcessByBreedAndScenario(breed_id, scenario_id) {

    return conn.db.any(`SELECT a.process_id, name, stage_id, breed_id, product_id, historical_decrease, historical_duration
                       FROM public.mdprocess a 
                       LEFT JOIN public.txscenarioprocess b on a.process_id = b.process_id 
                       WHERE breed_id=$1 and b.scenario_id = $2 `,
    [breed_id, scenario_id]);
}


// **** Inicio ConfTecnica ****

/**
 * Consulta que devuelve los registros donde existan relaciones en las tablas mdproduct, mdstage y txcalendar con mdprocess
 *
 * @returns  {object}
 * */
function DBgetAllProcessJ() {

    return conn.db.any("SELECT a.process_id, a.name as name, a.process_order, a.product_id, b.name as product_name, a.stage_id, c.name as stage_name, " +
        "historical_decrease, theoretical_decrease, historical_weight, theoretical_weight, historical_duration, theoretical_duration, " +
        "predecessor_id, visible,capacity, a.breed_id, a.biological_active, a.sync_considered, CASE WHEN predecessor_id is null THEN 0 ELSE 1 END AS ispredecessor " +
        "FROM mdprocess a " +
        "LEFT JOIN mdproduct b on a.product_id = b.product_id " +
        "LEFT JOIN mdstage  c on a.stage_id = c.stage_id order by a.breed_id,process_order ASC");
}

/**
 * Consulta para agregar un proceso 
 *
 * @param {Object} process  
 * @returns {object}
 */
function DBaddProcess(process) {
    return conn.db.one(`INSERT INTO public.mdprocess (process_order, product_id, stage_id, historical_decrease,theoretical_decrease, historical_weight, theoretical_weight, 
    historical_duration,theoretical_duration, visible, name, 
    predecessor_id, capacity, breed_id, gender, fattening_goal, type_posture, biological_active, sync_considered) 
    VALUES ($1, $2, $3, $4, 0.00, $6, 0.00, $8, 0.00, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING process_id`,
        [process.process_order,
            process.product_id,
            process.stage_id,
            process.historical_decrease,
            process.theoretical_decrease,
            process.historical_weight,
            process.theoretical_weight,
            process.historical_duration, process.theoretical_duration,
            process.visible, process.name, process.predecessor_id, process.capacity, process.breed_id,
            process.gender, process.fattening_goal, process.type_posture, process.biological_active, process.sync_considered
        ]);
}

/**
 *  Función para actualizar un producto específico
 *
 * @param {Object} process
 * @returns {object}
 */
function DBupdateProcess(process) {
    return conn.db.none(`UPDATE public.mdprocess SET process_order = $1, product_id = $2, stage_id = $3, historical_decrease = $4, theoretical_decrease = $5, 
                      historical_weight = $6, theoretical_weight = $7, historical_duration = $8 ,theoretical_duration = $9, 
                      visible = $10, name = $11, predecessor_id= $12, capacity = $13, breed_id = $14, 
                      gender = $15, fattening_goal = $16, type_posture = $17, biological_active= $18, sync_considered = $20  
                      WHERE process_id = $19`,
        [process.process_order, process.product_id, process.stage_id, process.historical_decrease, process.theoretical_decrease, process.historical_weight,
            process.theoretical_weight, process.historical_duration, process.theoretical_duration,
            process.visible, process.name, process.predecessor_id, process.capacity, process.breed_id,
            process.gender, process.fattening_goal, process.type_posture, process.biological_active,
            process.process_id, process.sync_considered
        ]);
}

/**
 * Función para eliminar un registro 
 *
 * @param {Number} process_id id del registro
 * @returns
 */
function DBdeleteProcess(process_id) {
    return conn.db.none("DELETE FROM public.mdprocess WHERE process_id = $1", [process_id]);
}

/**
 * Verifica si la raza desciende de otra
 *
 * @param {Number} breed_id id de raza
 * @param {Number} process_id id de proceso
 * @returns
 */
function DBfindProcessPredecessors(breed_id, process_id) {
    return conn.db.any("SELECT * FROM public.mdprocess WHERE breed_id= $1 and process_id != $2", [breed_id, process_id]);
}

/**
 * Devuelve todos los procesos 
 *
 * @returns  {object}
 * */
function DBgetAllProcess() {
    return conn.db.any("SELECT * FROM public.mdprocess order by name ASC;");
}

/**
 *  Función para verificar si una raza está siendo usada por otra entidad
 *
 * @param {*} process_id id del registro 
 * @returns {Object}
 */
function DBisBeingUsed(process_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.parameter_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.mdprocess a
                            LEFT JOIN public.mdparameter b on b.process_id = a.process_id
                            WHERE a.process_id=$1)
                            OR (SELECT DISTINCT CASE WHEN b.scenario_formula_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.mdprocess a
                            LEFT JOIN public.txscenarioformula b on b.process_id = a.process_id
                            WHERE a.process_id=$1)
                            OR (SELECT DISTINCT CASE WHEN b.scenario_parameter_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.mdprocess a
                            LEFT JOIN public.txscenarioparameter b on b.process_id = a.process_id
                            WHERE a.process_id=$1)
                            OR (SELECT DISTINCT CASE WHEN b.scenario_process_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.mdprocess a
                            LEFT JOIN public.txscenarioprocess b on b.process_id = a.process_id
                            WHERE a.process_id=$1) ) as used`, [process_id]);
}

// **** Fin ConfTecnica ****

function DBgetProcessById(process_id) {
    return conn.db.any("SELECT * FROM public.mdprocess WHERE process_id= $1;", [process_id]);
}

function DBfindProcessByStage(stage_id) {
    // console.log("STAGE: ", stage_id);
    return conn.db.any("SELECT * FROM public.mdprocess WHERE stage_id= $1;", [stage_id]);
}

function DBfindProcessByStageAndBreed(stage_id, breed_id) {
    return conn.db.any("SELECT product_id, breed_id FROM public.mdprocess WHERE stage_id= $1 and breed_id =$2;",
        [stage_id, breed_id]);
}

function DBfindProcessBreedByStage(stage_id) {
    return conn.db.any("SELECT b.name, theoretical_duration, historical_decrease as theoretical_decrease " +
        "FROM public.mdprocess a " +
        "LEFT JOIN public.mdbreed b on a.breed_id = b.breed_id " +
        "WHERE stage_id= $1;", [stage_id]);
}



/*
 * Retorna el detalle del housingWay solicitado para el proceso que se le indique
 * Duracion y Merma los campos mas importante para avanzar a la siguiente etapa
 */
function DBfindProcessByStageBreed(stage_id, breed_id, scenario_id) {

    return conn.db.any("SELECT breed_id, stage_id, weight_goal, decrease_goal, duration_goal " +
        "FROM public.mdprocess a " +
        "LEFT JOIN public.txscenarioprocess b on a.process_id = b.process_id " +
        "WHERE stage_id=$1 and breed_id=$2 and scenario_id = $3 ",
        [stage_id, breed_id, scenario_id]);
}

function DBfindProcessCalendarByStage(stage_id, breed_id) {

    return conn.db.any("SELECT breed_id, stage_id, weight_goal, decrease_goal, duration_goal " +
        "FROM public.mdprocess a " +
        "LEFT JOIN public.txscenarioprocess b on a.process_id = b.process_id " +
        "WHERE stage_id=$1 and breed_id=$2 and scenario_id = $3 ",
        [stage_id, breed_id, scenario_id]);
}


function DBgetBiologicalActive() {

    return conn.db.any("SELECT * " +
        "FROM public.mdprocess a " +
        "WHERE biological_active=true ");
}

function DBfindProductByStage(stage_id) {

    return conn.db.any("SELECT * " +
        "FROM public.mdprocess a " +
        "WHERE stage_id=$1 ", [stage_id]);
}


function DBKnowProcessid(register) {
    let string = "SELECT name,process_id FROM public.mdprocess WHERE name = ";
    var index = 0;
    while (index < register.length) {
        if (index == 0) {
            string = string + "'" + register[index].process_id + "'";
        } else {
            string = string + " or " + "name = " + "'" + register[index].process_id + "'";
        }
        index++;
    }
    return conn.db.any(string);
}

function DBKnowProcessid(register) {
    let string = "SELECT name,process_id FROM public.mdprocess WHERE name = ";
    var index = 0;
    while (index < register.length) {
        if (index == 0) {
            string = string + "'" + register[index].process + "'";
        } else {
            string = string + " or " + "name = " + "'" + register[index].process + "'";
        }
        index++;
    }
    return conn.db.any(string);
}


module.exports = {
    DBgetAllProcess,
    DBgetProcessById,
    DBgetAllProcessJ,
    DBaddProcess,
    DBupdateProcess,
    DBdeleteProcess,
    DBfindProcessByStage,
    DBfindProcessBreedByStage,
    DBfindProcessByStageBreed,
    DBgetBiologicalActive,
    DBfindProductByStage,
    DBfindProcessByStageAndBreed,
    DBKnowProcessid,
    DBfindProcessPredecessors,
    DBisBeingUsed,
    DBfindProcessByBreedAndScenario
};