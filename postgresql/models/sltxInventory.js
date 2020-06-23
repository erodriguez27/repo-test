const config = require("../../config");
const conn = require("../db");

exports.DBfindInventoryByFilter = function(date1,date2,scenario_id) {
        
    return conn.db.any(`
    SELECT 
                            total.date_from, total.date_to, total.projected_total, total.total_eggs, total.total_plexus,
                            total.purchases_total, total.sells_total, total.incubator_total, 
                            total.purchases_accumulated, total.incubator_accumulated, total.sells_accumulated, 
                            (case when total.total_eggs is null then false else true end) AS execution_s,
                            (case when total.exist_pc is null then false else true end) AS exist_pc, 
                            TO_CHAR(total.date_from, 'DD/MM/YYYY') as date_from_f, 
                            TO_CHAR(total.date_to, 'DD/MM/YYYY') as date_to_f, 

                            
                            (CASE 
                                WHEN (SELECT execution_eggs FROM sltxinventory WHERE week_date = total.date_from AND scenario_id = $3) is null     
                                THEN (

                                    CASE WHEN (SELECT sum(execution_eggs) FROM sltxinventory WHERE week_date < total.date_from AND scenario_id = $3) is null
                                    THEN (SELECT CASE WHEN sum(posture_quantity) is not null THEN sum(posture_quantity) ELSE 0 END + total.purchases_accumulated - total.sells_accumulated - total.incubator_accumulated FROM sltxposturecurve WHERE posture_date <= total.date_to AND scenario_id = $3 AND sl_disable is not true)
                                    ELSE (SELECT sum(execution_eggs) + sum(execution_plexus_eggs) + total.projected_total + total.purchases_accumulated - total.sells_accumulated - total.incubator_accumulated FROM sltxinventory  WHERE week_date < total.date_from AND scenario_id = $3) END )

                                ELSE (SELECT sum(execution_eggs) + sum(execution_plexus_eggs) + total.purchases_accumulated - total.sells_accumulated - total.incubator_accumulated FROM sltxinventory  WHERE week_date <= total.date_from AND scenario_id = $3)
                            END) AS inventory

                            FROM(

                                SELECT 
    
                                projection.date_from, projection.date_to,
								
								(SELECT case when sum(posture_quantity)> 0 then sum(posture_quantity) else 0 end
								 FROM sltxposturecurve 
								 WHERE posture_date BETWEEN projection.date_from AND projection.date_to AND scenario_id = $3 AND sl_disable is not true ) AS projected_total,
    
								(SELECT sum(posture_quantity)
								 FROM sltxposturecurve 
								 WHERE posture_date BETWEEN projection.date_from AND projection.date_to AND scenario_id = $3 AND sl_disable is not true ) AS exist_pc,
    
                                (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end
                                FROM sltxsellspurchase 
                                WHERE concept = 'Compra' AND type = 'Huevo Fértil' AND scenario_id = $3 AND sl_disable is not true AND programmed_date <= projection.date_to )::integer AS purchases_accumulated,
                                
                                (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end
                                FROM sltxsellspurchase 
                                WHERE concept = 'Compra' AND type = 'Huevo Fértil' AND scenario_id = $3 AND sl_disable is not true AND programmed_date BETWEEN projection.date_from AND projection.date_to )::integer AS purchases_total,
                                
                                (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end 
                                FROM sltxsellspurchase 
                                WHERE concept = 'Venta' AND type = 'Huevo Fértil' AND scenario_id = $3 AND sl_disable is not true AND programmed_date <= projection.date_to )::integer AS sells_accumulated ,
                                
                                (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end 
                                FROM sltxsellspurchase 
                                WHERE concept = 'Venta' AND type = 'Huevo Fértil' AND scenario_id = $3 AND sl_disable is not true AND programmed_date BETWEEN projection.date_from AND projection.date_to )::integer AS sells_total ,
                                
                                (SELECT case when sum(programmed_quantity)> 0 then sum(programmed_quantity) else 0 end 
                                FROM sltxincubator_detail a
                                left join sltxincubator b on a.incubator_id = b.slincubator 
                                WHERE a.programmed_date <= projection.date_to AND b.scenario_id = $3 AND a.sl_disable is not true)::integer AS incubator_accumulated ,
                                
                                (SELECT case when sum(programmed_quantity)> 0 then sum(programmed_quantity) else 0 end 
                                FROM sltxincubator_detail a
                                left join sltxincubator b on a.incubator_id = b.slincubator 
                                WHERE a.programmed_date BETWEEN projection.date_from AND projection.date_to AND b.scenario_id = $3 AND a.sl_disable is not true )::integer AS incubator_total ,

                                (SELECT execution_eggs FROM sltxinventory WHERE week_date = projection.date_from AND scenario_id = $3) AS total_eggs,
                                
                                (SELECT execution_plexus_eggs FROM sltxinventory WHERE week_date = projection.date_from AND scenario_id = $3) AS total_plexus
                                
                                FROM(

                                    SELECT range.date_from, range.date_to
                                    
                                    FROM(
                                        
                                        (SELECT range_pc.date_from, range_pc.date_to
										FROM(
                                        	SELECT series_pc.date_from, (series_pc.date_from + 6) AS date_to
                                        
                                        	FROM(
                                            	SELECT generate_series($1, $2, '7day'::interval)::date AS date_from
                                            	GROUP BY date_from
                                            	ORDER BY date_from ASC
                                        	) AS series_pc
										)as range_pc, sltxposturecurve b
                                        WHERE b.posture_date BETWEEN range_pc.date_from AND range_pc.date_to AND b.scenario_id = $3 AND b.sl_disable is not true)
                                        
                                        UNION
                                        
										(SELECT range_sp.date_from, range_sp.date_to
										FROM(
                                        	SELECT series_sp.date_from, (series_sp.date_from + 6) AS date_to
                                        
                                        	FROM(
                                            	SELECT generate_series($1, $2, '7day'::interval)::date AS date_from
                                            	GROUP BY date_from
                                            	ORDER BY date_from ASC
                                        	) AS series_sp
										)as range_sp, sltxsellspurchase s
										WHERE s.programmed_date BETWEEN range_sp.date_from AND range_sp.date_to AND s.scenario_id = $3 AND s.sl_disable is not true AND s.type = 'Huevo Fértil')
                                        ORDER BY 1
                                        
                                    )AS range
                                    GROUP BY range.date_from, range.date_to
									ORDER BY range.date_from

                                ) AS projection

                                GROUP BY projection.date_from, projection.date_to
                            ) AS total
                        
                            `,[date1,date2,scenario_id]);

};

exports.DBinsertExecution = function(operation) {
        
    cs = conn.pgp.helpers.ColumnSet(["scenario_id", "week_date", "execution_eggs", "execution_plexus_eggs"],
        {table: "sltxinventory", schema: "public"});
    return conn.db.any(conn.pgp.helpers.insert(operation, cs)+"RETURNING slinventory_id");

};

exports.DBfindDateReferencial = function(scenario_id) {
    return conn.db.one(`SELECT
                            (CASE WHEN (SELECT MAX(week_date) FROM sltxinventory WHERE scenario_id = $1) is null
                            THEN (SELECT MIN(posture_date) FROM sltxposturecurve WHERE scenario_id = $1)
                            ELSE (SELECT MAX(week_date) FROM sltxinventory WHERE scenario_id = $1)
                            END) AS date `, [scenario_id]);
};

// SELECT 
//                             total.date_from, total.date_to, total.projected_total, total.total_eggs, total.total_plexus,
//                             total.purchases_total, total.sells_total, total.incubator_total, 
//                             total.purchases_accumulated, total.incubator_accumulated, total.sells_accumulated, 
//                             (case when total.total_eggs is null then false else true end) AS execution_s, 
//                             TO_CHAR(total.date_from, 'DD/MM/YYYY') as date_from_f, 
//                             TO_CHAR(total.date_to, 'DD/MM/YYYY') as date_to_f, 

                            
//                             (CASE 
//                                 WHEN (SELECT execution_eggs FROM sltxinventory WHERE week_date = total.date_from AND scenario_id = $3) is null     
//                                 THEN (

//                                     CASE WHEN (SELECT sum(execution_eggs) FROM sltxinventory WHERE week_date < total.date_from AND scenario_id = $3) is null
//                                     THEN (SELECT sum(posture_quantity) + total.purchases_accumulated - total.sells_accumulated - total.incubator_accumulated FROM sltxposturecurve WHERE posture_date <= total.date_to AND scenario_id = $3 AND sl_disable is not true)
//                                     ELSE (SELECT sum(execution_eggs) + sum(execution_plexus_eggs) + total.projected_total + total.purchases_accumulated - total.sells_accumulated - total.incubator_accumulated FROM sltxinventory  WHERE week_date < total.date_from AND scenario_id = $3) END )

//                                 ELSE (SELECT sum(execution_eggs) + sum(execution_plexus_eggs) + total.purchases_accumulated - total.sells_accumulated - total.incubator_accumulated FROM sltxinventory  WHERE week_date <= total.date_from AND scenario_id = $3)
//                             END) AS inventory

//                             FROM(

//                                 SELECT 
    
//                                 projection.date_from, projection.date_to, projection.projected_total,
    
//                                 (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end
//                                 FROM sltxsellspurchase 
//                                 WHERE concept = 'Compra' AND type = 'Huevo Fértil' AND scenario_id = $3 AND sl_disable is not true AND programmed_date <= projection.date_to )::integer AS purchases_accumulated,
                                
//                                 (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end
//                                 FROM sltxsellspurchase 
//                                 WHERE concept = 'Compra' AND type = 'Huevo Fértil' AND scenario_id = $3 AND sl_disable is not true AND programmed_date BETWEEN projection.date_from AND projection.date_to )::integer AS purchases_total,
                                
//                                 (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end 
//                                 FROM sltxsellspurchase 
//                                 WHERE concept = 'Venta' AND type = 'Huevo Fértil' AND scenario_id = $3 AND sl_disable is not true AND programmed_date <= projection.date_to )::integer AS sells_accumulated ,
                                
//                                 (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end 
//                                 FROM sltxsellspurchase 
//                                 WHERE concept = 'Venta' AND type = 'Huevo Fértil' AND scenario_id = $3 AND sl_disable is not true AND programmed_date BETWEEN projection.date_from AND projection.date_to )::integer AS sells_total ,
                                
//                                 (SELECT case when sum(programmed_quantity)> 0 then sum(programmed_quantity) else 0 end 
//                                 FROM sltxincubator_detail a
//                                 left join sltxincubator b on a.incubator_id = b.slincubator 
//                                 WHERE a.programmed_date <= projection.date_to AND b.scenario_id = $3 AND a.sl_disable is not true)::integer AS incubator_accumulated ,
                                
//                                 (SELECT case when sum(programmed_quantity)> 0 then sum(programmed_quantity) else 0 end 
//                                 FROM sltxincubator_detail a
//                                 left join sltxincubator b on a.incubator_id = b.slincubator 
//                                 WHERE a.programmed_date BETWEEN projection.date_from AND projection.date_to AND b.scenario_id = $3 AND a.sl_disable is not true )::integer AS incubator_total ,

//                                 (SELECT execution_eggs FROM sltxinventory WHERE week_date = projection.date_from AND scenario_id = $3) AS total_eggs,
                                
//                                 (SELECT execution_plexus_eggs FROM sltxinventory WHERE week_date = projection.date_from AND scenario_id = $3) AS total_plexus
                                
//                                 FROM(

//                                     SELECT range.date_from, range.date_to, sum(b.posture_quantity)::integer AS projected_total
                                    
//                                     FROM(
                                        
//                                         SELECT series.date_from, (series.date_from + 6) AS date_to
                                        
//                                         FROM(
//                                             SELECT generate_series($1, $2, '7day'::interval)::date AS date_from 
//                                             GROUP BY date_from
//                                             ORDER BY date_from ASC
//                                         ) AS series

//                                     )AS range, sltxposturecurve b

//                                     WHERE b.posture_date BETWEEN range.date_from AND range.date_to AND b.scenario_id = $3 AND b.sl_disable is not true

//                                     GROUP BY range.date_from, range.date_to

//                                 ) AS projection

//                                 GROUP BY projection.date_from, projection.date_to, projection.projected_total
//                             ) AS total

