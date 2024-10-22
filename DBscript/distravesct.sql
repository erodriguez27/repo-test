PGDMP     *                    x            distravesct    10.3    10.3    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                       false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                       false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                       false            �           1262    138029    distravesct    DATABASE     �   CREATE DATABASE distravesct WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'Spanish_Venezuela.1252' LC_CTYPE = 'Spanish_Venezuela.1252';
    DROP DATABASE distravesct;
             postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
             postgres    false            �           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                  postgres    false    3                        3079    12924    plpgsql 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
    DROP EXTENSION plpgsql;
                  false            �           0    0    EXTENSION plpgsql    COMMENT     @   COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';
                       false    1            �           1255    138030    delete_broiler_cascade(integer)    FUNCTION     �  CREATE FUNCTION public.delete_broiler_cascade(lot_b integer, OUT deleted boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $$

DECLARE
allowed boolean DEFAULT false;
BEGIN

SELECT COALESCE(sum(CASE WHEN gg.synchronized is true THEN 1 ELSE 0 END),0)=0 INTO allowed FROM (SELECT distinct eng_detail.slbroiler_detail_id, eng_detail.synchronized FROM sltxbroiler_detail eng_detail 
WHERE lot::integer = lot_b) as gg;

IF allowed is false THEN
deleted = false;
RETURN;
END IF;

UPDATE sltxbroiler_detail SET sl_disable = true where lot::integer = lot_b;

UPDATE sltxbroiler_lot bl SET sl_disable = true FROM (SELECT distinct eng_lt.slbroiler_lot_id FROM sltxbroiler_detail eng_detail
LEFT JOIN sltxbroiler_lot eng_lt on eng_detail.slbroiler_detail_id = eng_lt.slbroiler_detail_id 
WHERE eng_detail.lot::integer=lot_b ) as bro_l WHERE bl.slbroiler_lot_id = bro_l.slbroiler_lot_id;

deleted = true
RETURN;

END;

$$;
 Q   DROP FUNCTION public.delete_broiler_cascade(lot_b integer, OUT deleted boolean);
       public       postgres    false    1    3            �           1255    138031 #   delete_buy_chicken_cascade(integer)    FUNCTION     9  CREATE FUNCTION public.delete_buy_chicken_cascade(buy_id integer, OUT deleted boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    
	DECLARE
      allowed boolean DEFAULT false;
    BEGIN
	  
	SELECT COALESCE(sum(CASE WHEN gg.synchronized is true THEN 1 ELSE 0 END),0)=0 INTO allowed 
	FROM (SELECT distinct eng_detail.slbroiler_detail_id, eng_detail.synchronized FROM sltxsellspurchase sells
			LEFT JOIN sltxbroiler_lot eng_lot on sells.slsellspurchase_id = eng_lot.slsellspurchase_id 
			LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id 
		WHERE sells.slsellspurchase_id=buy_id) as gg;
     
     IF allowed is false THEN
	 	deleted = false;
        RETURN;
     END IF;
	 
		UPDATE sltxbroiler_detail b SET sl_disable = true FROM (SELECT distinct eng_detail.slbroiler_detail_id FROM sltxsellspurchase sells
			LEFT JOIN sltxbroiler_lot eng_lot on sells.slsellspurchase_id = eng_lot.slsellspurchase_id 
			LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id 
	WHERE sells.slsellspurchase_id=buy_id) as bro_d where b.slbroiler_detail_id = bro_d.slbroiler_detail_id;


		UPDATE sltxbroiler_lot bl SET sl_disable = true FROM (SELECT distinct eg_lot.slbroiler_lot_id FROM sltxsellspurchase sells
			LEFT JOIN sltxbroiler_lot eng_lot on sells.slsellspurchase_id = eng_lot.slsellspurchase_id 
			LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id 
			LEFT JOIN sltxbroiler_lot eg_lot on eng_detail.slbroiler_detail_id = eg_lot.slbroiler_detail_id 
	WHERE sells.slsellspurchase_id=buy_id) as bro_l WHERE bl.slbroiler_lot_id = bro_l.slbroiler_lot_id;
	
	UPDATE sltxsellspurchase SET sl_disable = true where slsellspurchase_id = buy_id;

	deleted = true
     RETURN;
     
    END;
	
$$;
 V   DROP FUNCTION public.delete_buy_chicken_cascade(buy_id integer, OUT deleted boolean);
       public       postgres    false    1    3            �           1255    138032    delete_buy_egg_cascade(integer)    FUNCTION     �  CREATE FUNCTION public.delete_buy_egg_cascade(buy_id integer, OUT deleted boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    
	DECLARE
      allowed boolean DEFAULT false;
    BEGIN
	  
	SELECT COALESCE(sum(CASE WHEN gg.synchronized is true THEN 1 ELSE 0 END),0)=0 INTO allowed 
	FROM (SELECT distinct eng_detail.slbroiler_detail_id, eng_detail.synchronized FROM sltxsellspurchase sells
			LEFT JOIN sltxincubator_lot inc_lot on sells.slsellspurchase_id  = inc_lot.slsellspurchase_id
	  		LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id
			LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
			LEFT JOIN sltxbroiler_lot eng_lot on engorde.slbroiler_id = eng_lot.slbroiler_id 
			LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id
		WHERE sells.slsellspurchase_id=buy_id) as gg;
     
     IF allowed is false THEN
	 	deleted = false;
        RETURN;
     END IF;
	 
		UPDATE sltxbroiler_detail b SET sl_disable = true FROM (SELECT distinct eng_detail.slbroiler_detail_id FROM sltxsellspurchase sells
			LEFT JOIN sltxincubator_lot inc_lot on sells.slsellspurchase_id  = inc_lot.slsellspurchase_id
	  		LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id
			LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
			LEFT JOIN sltxbroiler_lot eng_lot on engorde.slbroiler_id = eng_lot.slbroiler_id 
			LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id 
		WHERE sells.slsellspurchase_id=buy_id) as bro_d where b.slbroiler_detail_id = bro_d.slbroiler_detail_id;


		UPDATE sltxbroiler_lot bl SET sl_disable = true FROM (SELECT distinct g_lot.slbroiler_lot_id FROM sltxsellspurchase sells
			LEFT JOIN sltxincubator_lot inc_lot on sells.slsellspurchase_id  = inc_lot.slsellspurchase_id
	  		LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id
			LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
			LEFT JOIN sltxbroiler_lot eng_lot on engorde.slbroiler_id = eng_lot.slbroiler_id  
			LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id
			LEFT JOIN sltxbroiler_lot g_lot on eng_detail.slbroiler_detail_id = g_lot.slbroiler_detail_id  											
		WHERE sells.slsellspurchase_id=37) as bro_l WHERE bl.slbroiler_lot_id = bro_l.slbroiler_lot_id;
	
		UPDATE sltxbroiler  br SET sl_disable = true FROM (SELECT distinct engorde.slbroiler_id FROM sltxsellspurchase sells
			LEFT JOIN sltxincubator_lot inc_lot on sells.slsellspurchase_id  = inc_lot.slsellspurchase_id
	  		LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id
			LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
		WHERE sells.slsellspurchase_id=buy_id) as bro where br.slbroiler_id = bro.slbroiler_id;

		UPDATE sltxincubator_detail ind SET sl_disable = true FROM (SELECT distinct inc_detail.slincubator_detail_id FROM sltxsellspurchase sells
			LEFT JOIN sltxincubator_lot inc_lot on sells.slsellspurchase_id  = inc_lot.slsellspurchase_id
	  		LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id
		WHERE sells.slsellspurchase_id=buy_id) as det where ind.slincubator_detail_id = det.slincubator_detail_id;

		UPDATE sltxincubator_lot icl SET sl_disable = true FROM (SELECT distinct ic_lot.slincubator_lot_id FROM sltxsellspurchase sells
			LEFT JOIN sltxincubator_lot inc_lot on sells.slsellspurchase_id  = inc_lot.slsellspurchase_id
			LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id
			LEFT JOIN sltxincubator_lot ic_lot on inc_detail.slincubator_detail_id  = ic_lot.slincubator_detail_id
		WHERE sells.slsellspurchase_id=buy_id) as inc_l where icl.slincubator_lot_id = inc_l.slincubator_lot_id;

		UPDATE sltxsellspurchase SET sl_disable = true where slsellspurchase_id = buy_id;

		deleted = true
     	RETURN;
     
    END;
	
$$;
 R   DROP FUNCTION public.delete_buy_egg_cascade(buy_id integer, OUT deleted boolean);
       public       postgres    false    3    1            �           1255    138033 !   delete_incubator_cascade(integer)    FUNCTION     �  CREATE FUNCTION public.delete_incubator_cascade(inc_id integer, OUT deleted boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    DECLARE
      allowed boolean DEFAULT false;
    BEGIN
	  
	 SELECT COALESCE(sum(CASE WHEN gg.synchronized is true THEN 1 ELSE 0 END),0)=0 INTO allowed FROM (SELECT distinct eng_detail.slbroiler_detail_id, eng_detail.synchronized FROM sltxincubator_detail inc_detail
			LEFT JOIN sltxincubator_lot inc_lot on inc_detail.slincubator_detail_id  = inc_lot.slincubator_detail_id
			LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
			LEFT JOIN sltxbroiler_lot eng_lot on engorde.slbroiler_id = eng_lot.slbroiler_id 
			LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id 
	WHERE inc_detail.slincubator_detail_id=inc_id) as gg;
     
     IF allowed is false THEN
	 	deleted = false;
        RETURN;
     END IF;
	
	

		UPDATE sltxbroiler_detail b SET sl_disable = true FROM (SELECT distinct eng_detail.slbroiler_detail_id FROM sltxincubator_detail inc_detail
			LEFT JOIN sltxincubator_lot inc_lot on inc_detail.slincubator_detail_id  = inc_lot.slincubator_detail_id
			LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
			LEFT JOIN sltxbroiler_lot eng_lot on engorde.slbroiler_id = eng_lot.slbroiler_id 
			LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id 
	WHERE inc_detail.slincubator_detail_id=inc_id) as bro_d where b.slbroiler_detail_id = bro_d.slbroiler_detail_id;


		UPDATE sltxbroiler_lot bl SET sl_disable = true FROM (SELECT distinct eng_lt.slbroiler_lot_id FROM sltxincubator_detail inc_detail
			LEFT JOIN sltxincubator_lot inc_lot on inc_detail.slincubator_detail_id  = inc_lot.slincubator_detail_id
			LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
			LEFT JOIN sltxbroiler_lot eng_lot on engorde.slbroiler_id = eng_lot.slbroiler_id 
			LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id 
			LEFT JOIN sltxbroiler_lot eng_lt on eng_detail.slbroiler_detail_id  = eng_lt.slbroiler_detail_id 												
	WHERE inc_detail.slincubator_detail_id=inc_id ) as bro_l WHERE bl.slbroiler_lot_id = bro_l.slbroiler_lot_id;


		UPDATE sltxbroiler  br SET sl_disable = true FROM (SELECT distinct engorde.slbroiler_id FROM sltxincubator_detail inc_detail
			LEFT JOIN sltxincubator_lot inc_lot on inc_detail.slincubator_detail_id  = inc_lot.slincubator_detail_id
			LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
	WHERE inc_detail.slincubator_detail_id=inc_id) as bro where br.slbroiler_id = bro.slbroiler_id;


		UPDATE sltxincubator_lot icl SET sl_disable = true FROM (SELECT distinct inc_lot.slincubator_lot_id FROM sltxincubator_detail inc_detail
			LEFT JOIN sltxincubator_lot inc_lot on inc_detail.slincubator_detail_id  = inc_lot.slincubator_detail_id
	WHERE inc_detail.slincubator_detail_id=inc_id) as inc_l where icl.slincubator_lot_id = inc_l.slincubator_lot_id;


		UPDATE sltxincubator_detail SET sl_disable = true where slincubator_detail_id = inc_id;


	
	
	deleted = true
     RETURN;
     
    END;
$$;
 T   DROP FUNCTION public.delete_incubator_cascade(inc_id integer, OUT deleted boolean);
       public       postgres    false    1    3            �           1255    138034 "   delete_production_cascade(integer)    FUNCTION     R  CREATE FUNCTION public.delete_production_cascade(produccion_id integer, OUT deleted boolean) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    
	DECLARE
      allowed boolean DEFAULT false;
    BEGIN
	  
	 SELECT COALESCE(sum(CASE WHEN gg.synchronized is true THEN 1 ELSE 0 END),0)=0 INTO allowed FROM (SELECT distinct eng_detail.slbroiler_detail_id, eng_detail.synchronized FROM sltxbreeding produccion
			LEFT JOIN sltxposturecurve curva on produccion.slbreeding_id = curva.slbreeding_id 
			LEFT JOIN sltxincubator_curve ic on curva.slposturecurve_id = ic.slposturecurve_id 																						
			LEFT JOIN sltxincubator incubadora on incubadora.slincubator = ic.slincubator_id
			LEFT JOIN sltxincubator_lot inc_lot on ic.slincubator_curve_id  = inc_lot.slincubator_curve_id 
			LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id 
			LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
			LEFT JOIN sltxbroiler_lot eng_lot on engorde.slbroiler_id = eng_lot.slbroiler_id 
			LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id 
	WHERE produccion.slbreeding_id=produccion_id) as gg;
     
     IF allowed is false THEN
	 	deleted = false;
        RETURN;
     END IF;
	
	

		UPDATE sltxbroiler_detail b SET sl_disable = true FROM (SELECT distinct eng_detail.slbroiler_detail_id FROM sltxbreeding produccion
				LEFT JOIN sltxposturecurve curva on produccion.slbreeding_id = curva.slbreeding_id 
																
																
				LEFT JOIN sltxincubator_curve ic on curva.slposturecurve_id = ic.slposturecurve_id 																						
				LEFT JOIN sltxincubator incubadora on incubadora.slincubator = ic.slincubator_id
																
																
				LEFT JOIN sltxincubator_lot inc_lot on ic.slincubator_curve_id  = inc_lot.slincubator_curve_id 
				LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id 
				LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
				LEFT JOIN sltxbroiler_lot eng_lot on engorde.slbroiler_id = eng_lot.slbroiler_id 
				LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id 
		WHERE produccion.slbreeding_id=produccion_id ) as bro_d where b.slbroiler_detail_id = bro_d.slbroiler_detail_id;


		UPDATE sltxbroiler_lot bl SET sl_disable = true FROM (SELECT distinct eng_lt.slbroiler_lot_id FROM sltxbreeding produccion
				LEFT JOIN sltxposturecurve curva on produccion.slbreeding_id = curva.slbreeding_id 
				LEFT JOIN sltxincubator_curve ic on curva.slposturecurve_id = ic.slposturecurve_id 																						
				LEFT JOIN sltxincubator incubadora on incubadora.slincubator = ic.slincubator_id
				LEFT JOIN sltxincubator_lot inc_lot on ic.slincubator_curve_id  = inc_lot.slincubator_curve_id  
				LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id 
				LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
				LEFT JOIN sltxbroiler_lot eng_lot on engorde.slbroiler_id = eng_lot.slbroiler_id 
				LEFT JOIN sltxbroiler_detail eng_detail on eng_lot.slbroiler_detail_id = eng_detail.slbroiler_detail_id 
				LEFT JOIN sltxbroiler_lot eng_lt on eng_detail.slbroiler_detail_id  = eng_lt.slbroiler_detail_id
		WHERE produccion.slbreeding_id=produccion_id ) as bro_l WHERE bl.slbroiler_lot_id = bro_l.slbroiler_lot_id;


		UPDATE sltxbroiler  br SET sl_disable = true FROM (SELECT distinct engorde.slbroiler_id FROM sltxbreeding produccion
				LEFT JOIN sltxposturecurve curva on produccion.slbreeding_id = curva.slbreeding_id 
				LEFT JOIN sltxincubator_curve ic on curva.slposturecurve_id = ic.slposturecurve_id 																						
				LEFT JOIN sltxincubator incubadora on incubadora.slincubator = ic.slincubator_id 
				LEFT JOIN sltxincubator_lot inc_lot on ic.slincubator_curve_id  = inc_lot.slincubator_curve_id 
				LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id 
				LEFT JOIN sltxbroiler engorde on inc_detail.slincubator_detail_id = engorde.slincubator_detail_id 
		WHERE produccion.slbreeding_id=produccion_id ) as bro where br.slbroiler_id = bro.slbroiler_id;


		UPDATE sltxincubator_detail icd SET sl_disable = true FROM (SELECT distinct inc_detail.slincubator_detail_id FROM sltxbreeding produccion
				LEFT JOIN sltxposturecurve curva on produccion.slbreeding_id = curva.slbreeding_id 
				LEFT JOIN sltxincubator_curve ic on curva.slposturecurve_id = ic.slposturecurve_id 																						
				LEFT JOIN sltxincubator incubadora on incubadora.slincubator = ic.slincubator_id
				LEFT JOIN sltxincubator_lot inc_lot on ic.slincubator_curve_id  = inc_lot.slincubator_curve_id 
				LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id 
		WHERE produccion.slbreeding_id=produccion_id ) as inc_d where icd.slincubator_detail_id = inc_d.slincubator_detail_id;



		UPDATE sltxincubator_lot icl SET sl_disable = true FROM (SELECT distinct inc_lt.slincubator_lot_id FROM sltxbreeding produccion
				LEFT JOIN sltxposturecurve curva on produccion.slbreeding_id = curva.slbreeding_id 
				LEFT JOIN sltxincubator_curve ic on curva.slposturecurve_id = ic.slposturecurve_id 																						
				LEFT JOIN sltxincubator incubadora on incubadora.slincubator = ic.slincubator_id 
				LEFT JOIN sltxincubator_lot inc_lot on ic.slincubator_curve_id  = inc_lot.slincubator_curve_id 
				LEFT JOIN sltxincubator_detail inc_detail on inc_lot.slincubator_detail_id = inc_detail.slincubator_detail_id 
				LEFT JOIN sltxincubator_lot inc_lt on inc_detail.slincubator_detail_id  = inc_lt.slincubator_detail_id 
		WHERE produccion.slbreeding_id=produccion_id ) as inc_l where icl.slincubator_lot_id = inc_l.slincubator_lot_id;


		UPDATE sltxincubator_curve i SET sl_disable = true FROM (SELECT distinct ic.slincubator_curve_id FROM sltxbreeding produccion
				LEFT JOIN sltxposturecurve curva on produccion.slbreeding_id = curva.slbreeding_id 
				LEFT JOIN sltxincubator_curve ic on curva.slposturecurve_id = ic.slposturecurve_id
		WHERE produccion.slbreeding_id=produccion_id ) as inc_curv where i.slincubator_curve_id = inc_curv.slincubator_curve_id;

		UPDATE sltxposturecurve cp SET sl_disable = true FROM (SELECT distinct curva.slposturecurve_id FROM sltxbreeding produccion
				LEFT JOIN sltxposturecurve curva on produccion.slbreeding_id = curva.slbreeding_id 
		WHERE produccion.slbreeding_id=produccion_id ) as bc where cp.slposturecurve_id = bc.slposturecurve_id;

		UPDATE sltxbreeding SET sl_disable = true WHERE slbreeding_id = produccion_id;
		
		UPDATE sltxliftbreeding SET sl_disable = true WHERE slbreeding_id = produccion_id;

	
	
	deleted = true
     RETURN;
     
    END;
$$;
 \   DROP FUNCTION public.delete_production_cascade(produccion_id integer, OUT deleted boolean);
       public       postgres    false    1    3            �            1259    138035    abaTimeUnit_id_seq    SEQUENCE     �   CREATE SEQUENCE public."abaTimeUnit_id_seq"
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 +   DROP SEQUENCE public."abaTimeUnit_id_seq";
       public       postgres    false    3            �            1259    138037    aba_breeds_and_stages_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_breeds_and_stages_id_seq
    START WITH 8
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 3   DROP SEQUENCE public.aba_breeds_and_stages_id_seq;
       public       postgres    false    3            �            1259    138039    aba_breeds_and_stages    TABLE     "  CREATE TABLE public.aba_breeds_and_stages (
    id integer DEFAULT nextval('public.aba_breeds_and_stages_id_seq'::regclass) NOT NULL,
    code character varying(100),
    name character varying(100),
    id_aba_consumption_and_mortality integer NOT NULL,
    id_process integer NOT NULL
);
 )   DROP TABLE public.aba_breeds_and_stages;
       public         postgres    false    197    3            �           0    0    TABLE aba_breeds_and_stages    COMMENT     o   COMMENT ON TABLE public.aba_breeds_and_stages IS 'Relaciona los procesos de ARP con el consumo y mortalidad ';
            public       postgres    false    198            �           0    0    COLUMN aba_breeds_and_stages.id    COMMENT     o   COMMENT ON COLUMN public.aba_breeds_and_stages.id IS 'ID de la relación entre proceso, consumo y mortalidad';
            public       postgres    false    198            �           0    0 !   COLUMN aba_breeds_and_stages.code    COMMENT     v   COMMENT ON COLUMN public.aba_breeds_and_stages.code IS 'Código de la relación entre proceso, consumo y mortalidad';
            public       postgres    false    198                        0    0 !   COLUMN aba_breeds_and_stages.name    COMMENT     v   COMMENT ON COLUMN public.aba_breeds_and_stages.name IS 'Nombre de la relación entre proceso y consumo y mortalidad';
            public       postgres    false    198                       0    0 =   COLUMN aba_breeds_and_stages.id_aba_consumption_and_mortality    COMMENT     �   COMMENT ON COLUMN public.aba_breeds_and_stages.id_aba_consumption_and_mortality IS 'ID referente al consumo de las aves y la mortalidad por semana';
            public       postgres    false    198                       0    0 '   COLUMN aba_breeds_and_stages.id_process    COMMENT     l   COMMENT ON COLUMN public.aba_breeds_and_stages.id_process IS 'ID de referenica a los procesos del sistema';
            public       postgres    false    198            �            1259    138043 $   aba_consumption_and_mortality_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_consumption_and_mortality_id_seq
    START WITH 8
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 ;   DROP SEQUENCE public.aba_consumption_and_mortality_id_seq;
       public       postgres    false    3            �            1259    138045    aba_consumption_and_mortality    TABLE     ?  CREATE TABLE public.aba_consumption_and_mortality (
    id integer DEFAULT nextval('public.aba_consumption_and_mortality_id_seq'::regclass) NOT NULL,
    code character varying(100),
    name character varying(100),
    id_breed integer NOT NULL,
    id_stage integer NOT NULL,
    id_aba_time_unit integer NOT NULL
);
 1   DROP TABLE public.aba_consumption_and_mortality;
       public         postgres    false    199    3                       0    0 #   TABLE aba_consumption_and_mortality    COMMENT     �   COMMENT ON TABLE public.aba_consumption_and_mortality IS 'Almacena la información del consumo y mortalidad asociados a la combinación de raza y etapa';
            public       postgres    false    200                       0    0 '   COLUMN aba_consumption_and_mortality.id    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.id IS 'ID de los datos de consumo y mortalidad asociados a una raza y una etapa';
            public       postgres    false    200                       0    0 )   COLUMN aba_consumption_and_mortality.code    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.code IS 'Código de los datos de consumo y mortalidad asociados a una raza y una etapa ';
            public       postgres    false    200                       0    0 )   COLUMN aba_consumption_and_mortality.name    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.name IS 'Nombre de los datos de consumo y mortalidad asociados a una raza y una etapa';
            public       postgres    false    200                       0    0 -   COLUMN aba_consumption_and_mortality.id_breed    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.id_breed IS 'ID de la raza asociada a los datos de consumo y mortalidad';
            public       postgres    false    200                       0    0 -   COLUMN aba_consumption_and_mortality.id_stage    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.id_stage IS 'ID de la etapa en la que se encuentran los datos de consumo y mortalidad ';
            public       postgres    false    200            	           0    0 5   COLUMN aba_consumption_and_mortality.id_aba_time_unit    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.id_aba_time_unit IS 'ID de la unidad de tiempo utilizada en los datos cargados en consumo y mortalidad';
            public       postgres    false    200            �            1259    138049 +   aba_consumption_and_mortality_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_consumption_and_mortality_detail_id_seq
    START WITH 203
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 B   DROP SEQUENCE public.aba_consumption_and_mortality_detail_id_seq;
       public       postgres    false    3            �            1259    138051 $   aba_consumption_and_mortality_detail    TABLE     =  CREATE TABLE public.aba_consumption_and_mortality_detail (
    id integer DEFAULT nextval('public.aba_consumption_and_mortality_detail_id_seq'::regclass) NOT NULL,
    id_aba_consumption_and_mortality integer NOT NULL,
    time_unit_number integer,
    consumption double precision,
    mortality double precision
);
 8   DROP TABLE public.aba_consumption_and_mortality_detail;
       public         postgres    false    201    3            
           0    0 *   TABLE aba_consumption_and_mortality_detail    COMMENT     �   COMMENT ON TABLE public.aba_consumption_and_mortality_detail IS 'Almacena los detalles para la unidad de tiempo asociada a una determinada agrupación de consumo y mortalidad ';
            public       postgres    false    202                       0    0 .   COLUMN aba_consumption_and_mortality_detail.id    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality_detail.id IS 'ID de los detalles para la unidad de tiempo asociada a una determinada agrupación de consumo y mortalidad ';
            public       postgres    false    202                       0    0 L   COLUMN aba_consumption_and_mortality_detail.id_aba_consumption_and_mortality    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality_detail.id_aba_consumption_and_mortality IS 'ID de la agrupación de consumo y mortalidad asociada';
            public       postgres    false    202                       0    0 <   COLUMN aba_consumption_and_mortality_detail.time_unit_number    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality_detail.time_unit_number IS 'Indica la unidad de tiempo asociada a la agrupación de consumo y mortalidad';
            public       postgres    false    202                       0    0 7   COLUMN aba_consumption_and_mortality_detail.consumption    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality_detail.consumption IS 'Indica el consumo asociado a una determinada agrupación de consumo y mortalidad ';
            public       postgres    false    202                       0    0 5   COLUMN aba_consumption_and_mortality_detail.mortality    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality_detail.mortality IS 'Indica la mortalidad asociada a una determinada agrupación de consumo y mortalidad ';
            public       postgres    false    202            �            1259    138055    aba_elements_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_elements_id_seq
    START WITH 22
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 *   DROP SEQUENCE public.aba_elements_id_seq;
       public       postgres    false    3            �            1259    138057    aba_elements    TABLE       CREATE TABLE public.aba_elements (
    id integer DEFAULT nextval('public.aba_elements_id_seq'::regclass) NOT NULL,
    code character varying(100),
    name character varying(100),
    id_aba_element_property integer NOT NULL,
    equivalent_quantity double precision
);
     DROP TABLE public.aba_elements;
       public         postgres    false    203    3                       0    0    TABLE aba_elements    COMMENT     T   COMMENT ON TABLE public.aba_elements IS 'Almacena los datos de los macroelementos';
            public       postgres    false    204                       0    0    COLUMN aba_elements.id    COMMENT     D   COMMENT ON COLUMN public.aba_elements.id IS 'ID del macroelemento';
            public       postgres    false    204                       0    0    COLUMN aba_elements.code    COMMENT     K   COMMENT ON COLUMN public.aba_elements.code IS 'Código del macroelemento';
            public       postgres    false    204                       0    0    COLUMN aba_elements.name    COMMENT     J   COMMENT ON COLUMN public.aba_elements.name IS 'Nombre del macroelemento';
            public       postgres    false    204                       0    0 +   COLUMN aba_elements.id_aba_element_property    COMMENT     q   COMMENT ON COLUMN public.aba_elements.id_aba_element_property IS 'ID de la propiedad asociada al macroelemento';
            public       postgres    false    204                       0    0 '   COLUMN aba_elements.equivalent_quantity    COMMENT     �   COMMENT ON COLUMN public.aba_elements.equivalent_quantity IS 'Cantidad de la propiedad asociada al macroelemento con el fin de realizar equivalencias';
            public       postgres    false    204            �            1259    138061 &   aba_elements_and_concentrations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_elements_and_concentrations_id_seq
    START WITH 105
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 =   DROP SEQUENCE public.aba_elements_and_concentrations_id_seq;
       public       postgres    false    3            �            1259    138063    aba_elements_and_concentrations    TABLE     }  CREATE TABLE public.aba_elements_and_concentrations (
    id integer DEFAULT nextval('public.aba_elements_and_concentrations_id_seq'::regclass) NOT NULL,
    id_aba_element integer NOT NULL,
    id_aba_formulation integer NOT NULL,
    proportion double precision,
    id_element_equivalent integer,
    id_aba_element_property integer,
    equivalent_quantity double precision
);
 3   DROP TABLE public.aba_elements_and_concentrations;
       public         postgres    false    205    3                       0    0 %   TABLE aba_elements_and_concentrations    COMMENT     y   COMMENT ON TABLE public.aba_elements_and_concentrations IS 'Asocia una fórmula con los macroelementos que la componen';
            public       postgres    false    206                       0    0 )   COLUMN aba_elements_and_concentrations.id    COMMENT     �   COMMENT ON COLUMN public.aba_elements_and_concentrations.id IS 'ID de la asociación entre una fórmula con los macroelementos que la componen';
            public       postgres    false    206                       0    0 5   COLUMN aba_elements_and_concentrations.id_aba_element    COMMENT     g   COMMENT ON COLUMN public.aba_elements_and_concentrations.id_aba_element IS 'ID del elemento asociado';
            public       postgres    false    206                       0    0 9   COLUMN aba_elements_and_concentrations.id_aba_formulation    COMMENT     m   COMMENT ON COLUMN public.aba_elements_and_concentrations.id_aba_formulation IS 'ID de la fórmula asociada';
            public       postgres    false    206                       0    0 1   COLUMN aba_elements_and_concentrations.proportion    COMMENT     y   COMMENT ON COLUMN public.aba_elements_and_concentrations.proportion IS 'Proporción del elemento dentro de la fórmula';
            public       postgres    false    206            �            1259    138067    aba_elements_properties_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_elements_properties_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 5   DROP SEQUENCE public.aba_elements_properties_id_seq;
       public       postgres    false    3            �            1259    138069    aba_elements_properties    TABLE     �   CREATE TABLE public.aba_elements_properties (
    id integer DEFAULT nextval('public.aba_elements_properties_id_seq'::regclass) NOT NULL,
    code character varying(100),
    name character varying(100)
);
 +   DROP TABLE public.aba_elements_properties;
       public         postgres    false    207    3                       0    0    TABLE aba_elements_properties    COMMENT     �   COMMENT ON TABLE public.aba_elements_properties IS 'Almacena las propiedades que pueden llegar a tener los macroelementos para realizar la equivalencia';
            public       postgres    false    208                       0    0 !   COLUMN aba_elements_properties.id    COMMENT     Z   COMMENT ON COLUMN public.aba_elements_properties.id IS 'ID de la propiedad del elemento';
            public       postgres    false    208                       0    0 #   COLUMN aba_elements_properties.code    COMMENT     a   COMMENT ON COLUMN public.aba_elements_properties.code IS 'Código de la propiedad del elemento';
            public       postgres    false    208                       0    0 #   COLUMN aba_elements_properties.name    COMMENT     `   COMMENT ON COLUMN public.aba_elements_properties.name IS 'Nombre de la propiedad del elemento';
            public       postgres    false    208            �            1259    138073    aba_formulation_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_formulation_id_seq
    START WITH 68
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 -   DROP SEQUENCE public.aba_formulation_id_seq;
       public       postgres    false    3            �            1259    138075    aba_formulation    TABLE     �   CREATE TABLE public.aba_formulation (
    id integer DEFAULT nextval('public.aba_formulation_id_seq'::regclass) NOT NULL,
    code character varying(100),
    name character varying(100)
);
 #   DROP TABLE public.aba_formulation;
       public         postgres    false    209    3                       0    0    TABLE aba_formulation    COMMENT     g   COMMENT ON TABLE public.aba_formulation IS 'Almacena los datos del alimento balanceado para animales';
            public       postgres    false    210                        0    0    COLUMN aba_formulation.id    COMMENT     [   COMMENT ON COLUMN public.aba_formulation.id IS 'ID del alimento balanceado para animales';
            public       postgres    false    210            !           0    0    COLUMN aba_formulation.code    COMMENT     b   COMMENT ON COLUMN public.aba_formulation.code IS 'Código del alimento balanceado para animales';
            public       postgres    false    210            "           0    0    COLUMN aba_formulation.name    COMMENT     a   COMMENT ON COLUMN public.aba_formulation.name IS 'Nombre del alimento balanceado para animales';
            public       postgres    false    210            �            1259    138079    aba_results_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 )   DROP SEQUENCE public.aba_results_id_seq;
       public       postgres    false    3            �            1259    138081 &   aba_stages_of_breeds_and_stages_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_stages_of_breeds_and_stages_id_seq
    START WITH 24
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 =   DROP SEQUENCE public.aba_stages_of_breeds_and_stages_id_seq;
       public       postgres    false    3            �            1259    138083    aba_stages_of_breeds_and_stages    TABLE     '  CREATE TABLE public.aba_stages_of_breeds_and_stages (
    id integer DEFAULT nextval('public.aba_stages_of_breeds_and_stages_id_seq'::regclass) NOT NULL,
    id_aba_breeds_and_stages integer NOT NULL,
    id_formulation integer NOT NULL,
    name character varying(100),
    duration integer
);
 3   DROP TABLE public.aba_stages_of_breeds_and_stages;
       public         postgres    false    212    3            #           0    0 %   TABLE aba_stages_of_breeds_and_stages    COMMENT     �   COMMENT ON TABLE public.aba_stages_of_breeds_and_stages IS 'Almacena las fases asociadas a los animales considerados en la tabla de consumo y mortalidad y asocia el alimento a ser proporcionado en dicha fase';
            public       postgres    false    213            $           0    0 )   COLUMN aba_stages_of_breeds_and_stages.id    COMMENT     �   COMMENT ON COLUMN public.aba_stages_of_breeds_and_stages.id IS 'ID de la fase asociada a los animales considerados en la tabla de consumo y mortalidad ';
            public       postgres    false    213            %           0    0 ?   COLUMN aba_stages_of_breeds_and_stages.id_aba_breeds_and_stages    COMMENT     �   COMMENT ON COLUMN public.aba_stages_of_breeds_and_stages.id_aba_breeds_and_stages IS 'ID de la tabla que almacena la relación entre proceso y consumo y mortalidad';
            public       postgres    false    213            &           0    0 5   COLUMN aba_stages_of_breeds_and_stages.id_formulation    COMMENT     �   COMMENT ON COLUMN public.aba_stages_of_breeds_and_stages.id_formulation IS 'ID del alimento balanceado para animales asociado a la fase';
            public       postgres    false    213            '           0    0 +   COLUMN aba_stages_of_breeds_and_stages.name    COMMENT     �   COMMENT ON COLUMN public.aba_stages_of_breeds_and_stages.name IS 'Nombre de la fase asociada a los animales considerados en la tabla de consumo y mortalidad ';
            public       postgres    false    213            (           0    0 /   COLUMN aba_stages_of_breeds_and_stages.duration    COMMENT     �   COMMENT ON COLUMN public.aba_stages_of_breeds_and_stages.duration IS 'Duración de la fase asociada a los animales considerados en la tabla de consumo y mortalidad ';
            public       postgres    false    213            �            1259    138087    aba_time_unit    TABLE     �   CREATE TABLE public.aba_time_unit (
    id integer DEFAULT nextval('public."abaTimeUnit_id_seq"'::regclass) NOT NULL,
    singular_name character varying(100),
    plural_name character varying(100)
);
 !   DROP TABLE public.aba_time_unit;
       public         postgres    false    196    3            )           0    0    TABLE aba_time_unit    COMMENT     L   COMMENT ON TABLE public.aba_time_unit IS 'Almacena las unidades de tiempo';
            public       postgres    false    214            *           0    0    COLUMN aba_time_unit.id    COMMENT     J   COMMENT ON COLUMN public.aba_time_unit.id IS 'ID de la unidad de tiempo';
            public       postgres    false    214            +           0    0 "   COLUMN aba_time_unit.singular_name    COMMENT     e   COMMENT ON COLUMN public.aba_time_unit.singular_name IS 'Nombre en singular de la unidad de tiempo';
            public       postgres    false    214            ,           0    0     COLUMN aba_time_unit.plural_name    COMMENT     a   COMMENT ON COLUMN public.aba_time_unit.plural_name IS 'Nombre en plural de la unidad de tiempo';
            public       postgres    false    214            �            1259    138091    availability_shed_id_seq    SEQUENCE     �   CREATE SEQUENCE public.availability_shed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.availability_shed_id_seq;
       public       postgres    false    3            �            1259    138093    base_day_id_seq    SEQUENCE     x   CREATE SEQUENCE public.base_day_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.base_day_id_seq;
       public       postgres    false    3            �            1259    138095    breed_id_seq    SEQUENCE     u   CREATE SEQUENCE public.breed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.breed_id_seq;
       public       postgres    false    3            �            1259    138097    broiler_detail_id_seq    SEQUENCE     ~   CREATE SEQUENCE public.broiler_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.broiler_detail_id_seq;
       public       postgres    false    3            �            1259    138099    broiler_id_seq    SEQUENCE     w   CREATE SEQUENCE public.broiler_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.broiler_id_seq;
       public       postgres    false    3            �            1259    138101    broiler_product_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.broiler_product_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.broiler_product_detail_id_seq;
       public       postgres    false    3            �            1259    138103    broiler_product_id_seq    SEQUENCE        CREATE SEQUENCE public.broiler_product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.broiler_product_id_seq;
       public       postgres    false    3            �            1259    138105    broilereviction_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.broilereviction_detail_id_seq
    START WITH 124
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.broilereviction_detail_id_seq;
       public       postgres    false    3            �            1259    138107    broilereviction_id_seq    SEQUENCE     �   CREATE SEQUENCE public.broilereviction_id_seq
    START WITH 70
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.broilereviction_id_seq;
       public       postgres    false    3            �            1259    138109    brooder_id_seq    SEQUENCE     w   CREATE SEQUENCE public.brooder_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.brooder_id_seq;
       public       postgres    false    3            �            1259    138111    brooder_machines_id_seq    SEQUENCE     �   CREATE SEQUENCE public.brooder_machines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.brooder_machines_id_seq;
       public       postgres    false    3            �            1259    138113    calendar_day_id_seq    SEQUENCE     |   CREATE SEQUENCE public.calendar_day_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.calendar_day_id_seq;
       public       postgres    false    3            �            1259    138115    calendar_id_seq    SEQUENCE     x   CREATE SEQUENCE public.calendar_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.calendar_id_seq;
       public       postgres    false    3            �            1259    138117    center_id_seq    SEQUENCE     v   CREATE SEQUENCE public.center_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.center_id_seq;
       public       postgres    false    3            �            1259    138119    egg_planning_id_seq    SEQUENCE     |   CREATE SEQUENCE public.egg_planning_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.egg_planning_id_seq;
       public       postgres    false    3            �            1259    138121    egg_required_id_seq    SEQUENCE     |   CREATE SEQUENCE public.egg_required_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.egg_required_id_seq;
       public       postgres    false    3            �            1259    138123    eggs_storage_id_seq    SEQUENCE     |   CREATE SEQUENCE public.eggs_storage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.eggs_storage_id_seq;
       public       postgres    false    3            �            1259    138125    farm_id_seq    SEQUENCE     t   CREATE SEQUENCE public.farm_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.farm_id_seq;
       public       postgres    false    3            �            1259    138127    farm_type_id_seq    SEQUENCE     y   CREATE SEQUENCE public.farm_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.farm_type_id_seq;
       public       postgres    false    3            �            1259    138129    holiday_id_seq    SEQUENCE     w   CREATE SEQUENCE public.holiday_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.holiday_id_seq;
       public       postgres    false    3            �            1259    138131    housing_way_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.housing_way_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.housing_way_detail_id_seq;
       public       postgres    false    3            �            1259    138133    housing_way_id_seq    SEQUENCE     {   CREATE SEQUENCE public.housing_way_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.housing_way_id_seq;
       public       postgres    false    3            �            1259    138135    incubator_id_seq    SEQUENCE     y   CREATE SEQUENCE public.incubator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.incubator_id_seq;
       public       postgres    false    3            �            1259    138137    incubator_plant_id_seq    SEQUENCE        CREATE SEQUENCE public.incubator_plant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.incubator_plant_id_seq;
       public       postgres    false    3            �            1259    138139    industry_id_seq    SEQUENCE     x   CREATE SEQUENCE public.industry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.industry_id_seq;
       public       postgres    false    3            �            1259    138141    line_id_seq    SEQUENCE     t   CREATE SEQUENCE public.line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.line_id_seq;
       public       postgres    false    3            �            1259    138143    lot_eggs_id_seq    SEQUENCE     x   CREATE SEQUENCE public.lot_eggs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.lot_eggs_id_seq;
       public       postgres    false    3            �            1259    138145    lot_fattening_id_seq    SEQUENCE     }   CREATE SEQUENCE public.lot_fattening_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.lot_fattening_id_seq;
       public       postgres    false    3            �            1259    138147 
   lot_id_seq    SEQUENCE     s   CREATE SEQUENCE public.lot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 !   DROP SEQUENCE public.lot_id_seq;
       public       postgres    false    3            �            1259    138149    lot_liftbreeding_id_seq    SEQUENCE     �   CREATE SEQUENCE public.lot_liftbreeding_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.lot_liftbreeding_id_seq;
       public       postgres    false    3            �            1259    138151    md_optimizer_parameter    TABLE       CREATE TABLE public.md_optimizer_parameter (
    optimizerparameter_id integer NOT NULL,
    breed_id integer NOT NULL,
    max_housing integer NOT NULL,
    min_housing integer NOT NULL,
    difference double precision NOT NULL,
    active boolean NOT NULL
);
 *   DROP TABLE public.md_optimizer_parameter;
       public         postgres    false    3            �            1259    138154 0   md_optimizer_parameter_optimizerparameter_id_seq    SEQUENCE     �   CREATE SEQUENCE public.md_optimizer_parameter_optimizerparameter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 G   DROP SEQUENCE public.md_optimizer_parameter_optimizerparameter_id_seq;
       public       postgres    false    3    245            -           0    0 0   md_optimizer_parameter_optimizerparameter_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.md_optimizer_parameter_optimizerparameter_id_seq OWNED BY public.md_optimizer_parameter.optimizerparameter_id;
            public       postgres    false    246            �            1259    138156    mdadjustment    TABLE     �   CREATE TABLE public.mdadjustment (
    adjustment_id integer NOT NULL,
    type character varying NOT NULL,
    prefix character varying,
    description character varying NOT NULL
);
     DROP TABLE public.mdadjustment;
       public         postgres    false    3            .           0    0    TABLE mdadjustment    COMMENT     L   COMMENT ON TABLE public.mdadjustment IS 'Almacena los ajustes realizables';
            public       postgres    false    247            /           0    0 !   COLUMN mdadjustment.adjustment_id    COMMENT     H   COMMENT ON COLUMN public.mdadjustment.adjustment_id IS 'ID del ajuste';
            public       postgres    false    247            0           0    0    COLUMN mdadjustment.type    COMMENT     O   COMMENT ON COLUMN public.mdadjustment.type IS 'Indica si es ingreso o egreso';
            public       postgres    false    247            1           0    0    COLUMN mdadjustment.prefix    COMMENT     N   COMMENT ON COLUMN public.mdadjustment.prefix IS 'Prefijo asignado al ajuste';
            public       postgres    false    247            2           0    0    COLUMN mdadjustment.description    COMMENT     V   COMMENT ON COLUMN public.mdadjustment.description IS 'Breve descripción del ajuste';
            public       postgres    false    247            �            1259    138162    mdadjustment_adjustment_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mdadjustment_adjustment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public.mdadjustment_adjustment_id_seq;
       public       postgres    false    247    3            3           0    0    mdadjustment_adjustment_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public.mdadjustment_adjustment_id_seq OWNED BY public.mdadjustment.adjustment_id;
            public       postgres    false    248            �            1259    138164     mdapplication_application_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mdapplication_application_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 999999999999999
    CACHE 1;
 7   DROP SEQUENCE public.mdapplication_application_id_seq;
       public       postgres    false    3            �            1259    138166    mdapplication    TABLE     �   CREATE TABLE public.mdapplication (
    application_id integer DEFAULT nextval('public.mdapplication_application_id_seq'::regclass) NOT NULL,
    application_name character varying(30) NOT NULL,
    type character varying(20)
);
 !   DROP TABLE public.mdapplication;
       public         postgres    false    249    3            4           0    0    TABLE mdapplication    COMMENT     Y   COMMENT ON TABLE public.mdapplication IS 'Almacena la información de las aplicaciones';
            public       postgres    false    250            5           0    0 #   COLUMN mdapplication.application_id    COMMENT     Q   COMMENT ON COLUMN public.mdapplication.application_id IS 'ID de la aplicación';
            public       postgres    false    250            6           0    0 %   COLUMN mdapplication.application_name    COMMENT     W   COMMENT ON COLUMN public.mdapplication.application_name IS 'Nombre de la aplicación';
            public       postgres    false    250            7           0    0    COLUMN mdapplication.type    COMMENT     P   COMMENT ON COLUMN public.mdapplication.type IS 'Indica el tipo de aplicación';
            public       postgres    false    250            �            1259    138170    mdapplication_rol_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mdapplication_rol_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999999
    CACHE 1;
 /   DROP SEQUENCE public.mdapplication_rol_id_seq;
       public       postgres    false    3            �            1259    138172    mdapplication_rol    TABLE     �   CREATE TABLE public.mdapplication_rol (
    id integer DEFAULT nextval('public.mdapplication_rol_id_seq'::regclass) NOT NULL,
    application_id integer NOT NULL,
    rol_id integer NOT NULL
);
 %   DROP TABLE public.mdapplication_rol;
       public         postgres    false    251    3            8           0    0    TABLE mdapplication_rol    COMMENT     e   COMMENT ON TABLE public.mdapplication_rol IS 'Contiene los ID''s de aplicación y los ID''s de rol';
            public       postgres    false    252            9           0    0    COLUMN mdapplication_rol.id    COMMENT     _   COMMENT ON COLUMN public.mdapplication_rol.id IS 'ID de la relación entre aplicación y rol';
            public       postgres    false    252            :           0    0 '   COLUMN mdapplication_rol.application_id    COMMENT     U   COMMENT ON COLUMN public.mdapplication_rol.application_id IS 'ID de la aplicación';
            public       postgres    false    252            ;           0    0    COLUMN mdapplication_rol.rol_id    COMMENT     C   COMMENT ON COLUMN public.mdapplication_rol.rol_id IS 'ID del rol';
            public       postgres    false    252            �            1259    138176    mdbreed    TABLE     �   CREATE TABLE public.mdbreed (
    breed_id integer DEFAULT nextval('public.breed_id_seq'::regclass) NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(45) NOT NULL
);
    DROP TABLE public.mdbreed;
       public         postgres    false    217    3            <           0    0    TABLE mdbreed    COMMENT     E   COMMENT ON TABLE public.mdbreed IS 'Almacena las razas de las aves';
            public       postgres    false    253            =           0    0    COLUMN mdbreed.breed_id    COMMENT     >   COMMENT ON COLUMN public.mdbreed.breed_id IS 'ID de la raza';
            public       postgres    false    253            >           0    0    COLUMN mdbreed.code    COMMENT     ?   COMMENT ON COLUMN public.mdbreed.code IS 'Código de la raza';
            public       postgres    false    253            ?           0    0    COLUMN mdbreed.name    COMMENT     >   COMMENT ON COLUMN public.mdbreed.name IS 'Nombre de la raza';
            public       postgres    false    253            �            1259    138180    mdbroiler_product    TABLE     �  CREATE TABLE public.mdbroiler_product (
    broiler_product_id integer DEFAULT nextval('public.broiler_product_id_seq'::regclass) NOT NULL,
    name character varying(45) NOT NULL,
    days_eviction integer,
    weight double precision,
    code character varying(20),
    breed_id integer NOT NULL,
    gender "char" NOT NULL,
    min_days_eviction integer,
    conversion_percentage double precision,
    type_bird "char",
    initial_product integer
);
 %   DROP TABLE public.mdbroiler_product;
       public         postgres    false    221    3            @           0    0    TABLE mdbroiler_product    COMMENT     w   COMMENT ON TABLE public.mdbroiler_product IS 'Almacena los productos de salida de la etapa de engorde hacia desalojo';
            public       postgres    false    254            A           0    0 +   COLUMN mdbroiler_product.broiler_product_id    COMMENT     _   COMMENT ON COLUMN public.mdbroiler_product.broiler_product_id IS 'ID del producto de engorde';
            public       postgres    false    254            B           0    0    COLUMN mdbroiler_product.name    COMMENT     T   COMMENT ON COLUMN public.mdbroiler_product.name IS 'Nombre de producto de engorde';
            public       postgres    false    254            C           0    0 &   COLUMN mdbroiler_product.days_eviction    COMMENT     y   COMMENT ON COLUMN public.mdbroiler_product.days_eviction IS 'Días necesarios para el desalojo del producto de engorde';
            public       postgres    false    254            D           0    0    COLUMN mdbroiler_product.weight    COMMENT     m   COMMENT ON COLUMN public.mdbroiler_product.weight IS 'Peso estimado del producto de engorde para su salida';
            public       postgres    false    254            E           0    0    COLUMN mdbroiler_product.code    COMMENT     V   COMMENT ON COLUMN public.mdbroiler_product.code IS 'Código del producto de engorde';
            public       postgres    false    254            F           0    0 !   COLUMN mdbroiler_product.breed_id    COMMENT     `   COMMENT ON COLUMN public.mdbroiler_product.breed_id IS 'ID de la raza del producto de engorde';
            public       postgres    false    254            G           0    0    COLUMN mdbroiler_product.gender    COMMENT     U   COMMENT ON COLUMN public.mdbroiler_product.gender IS 'Sexo del producto de engorde';
            public       postgres    false    254            H           0    0 *   COLUMN mdbroiler_product.min_days_eviction    COMMENT     {   COMMENT ON COLUMN public.mdbroiler_product.min_days_eviction IS 'Días mínimos para el desalojo del producto de engorde';
            public       postgres    false    254            I           0    0 .   COLUMN mdbroiler_product.conversion_percentage    COMMENT     �   COMMENT ON COLUMN public.mdbroiler_product.conversion_percentage IS 'Porcentaje de conversión del producto de engorde liviano a pesado';
            public       postgres    false    254            J           0    0 "   COLUMN mdbroiler_product.type_bird    COMMENT     X   COMMENT ON COLUMN public.mdbroiler_product.type_bird IS 'Tipo del producto de engorde';
            public       postgres    false    254            K           0    0 (   COLUMN mdbroiler_product.initial_product    COMMENT     d   COMMENT ON COLUMN public.mdbroiler_product.initial_product IS 'ID del producto de engorde inicial';
            public       postgres    false    254            �            1259    138184    mdequivalenceproduct    TABLE     �   CREATE TABLE public.mdequivalenceproduct (
    equivalenceproduct_id integer NOT NULL,
    product_code character varying(20),
    equivalence_code character varying(20),
    breed_id integer NOT NULL
);
 (   DROP TABLE public.mdequivalenceproduct;
       public         postgres    false    3            L           0    0    TABLE mdequivalenceproduct    COMMENT     d   COMMENT ON TABLE public.mdequivalenceproduct IS 'Almacena la equivalencia de productos de engorde';
            public       postgres    false    255            M           0    0 1   COLUMN mdequivalenceproduct.equivalenceproduct_id    COMMENT     m   COMMENT ON COLUMN public.mdequivalenceproduct.equivalenceproduct_id IS 'ID de la equivalencia de productos';
            public       postgres    false    255            N           0    0 (   COLUMN mdequivalenceproduct.product_code    COMMENT     V   COMMENT ON COLUMN public.mdequivalenceproduct.product_code IS 'Código del producto';
            public       postgres    false    255            O           0    0 ,   COLUMN mdequivalenceproduct.equivalence_code    COMMENT     m   COMMENT ON COLUMN public.mdequivalenceproduct.equivalence_code IS 'Código de la equivalencia del producto';
            public       postgres    false    255            P           0    0 $   COLUMN mdequivalenceproduct.breed_id    COMMENT     `   COMMENT ON COLUMN public.mdequivalenceproduct.breed_id IS 'ID de la raza asociada al producto';
            public       postgres    false    255                        1259    138187 .   mdequivalenceproduct_equivalenceproduct_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mdequivalenceproduct_equivalenceproduct_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 E   DROP SEQUENCE public.mdequivalenceproduct_equivalenceproduct_id_seq;
       public       postgres    false    255    3            Q           0    0 .   mdequivalenceproduct_equivalenceproduct_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.mdequivalenceproduct_equivalenceproduct_id_seq OWNED BY public.mdequivalenceproduct.equivalenceproduct_id;
            public       postgres    false    256                       1259    138189 
   mdfarmtype    TABLE     �   CREATE TABLE public.mdfarmtype (
    farm_type_id integer DEFAULT nextval('public.farm_type_id_seq'::regclass) NOT NULL,
    name character varying(45) NOT NULL
);
    DROP TABLE public.mdfarmtype;
       public         postgres    false    233    3            R           0    0    TABLE mdfarmtype    COMMENT     F   COMMENT ON TABLE public.mdfarmtype IS 'Almacena los tipos de granja';
            public       postgres    false    257            S           0    0    COLUMN mdfarmtype.farm_type_id    COMMENT     M   COMMENT ON COLUMN public.mdfarmtype.farm_type_id IS 'ID del tipo de granja';
            public       postgres    false    257            T           0    0    COLUMN mdfarmtype.name    COMMENT     O   COMMENT ON COLUMN public.mdfarmtype.name IS 'Nombre de la etapa de la granja';
            public       postgres    false    257                       1259    138193    measure_id_seq    SEQUENCE     w   CREATE SEQUENCE public.measure_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.measure_id_seq;
       public       postgres    false    3                       1259    138195 	   mdmeasure    TABLE     -  CREATE TABLE public.mdmeasure (
    measure_id integer DEFAULT nextval('public.measure_id_seq'::regclass) NOT NULL,
    name character varying(10) NOT NULL,
    abbreviation character varying(5) NOT NULL,
    originvalue double precision NOT NULL,
    valuekg double precision,
    is_unit boolean
);
    DROP TABLE public.mdmeasure;
       public         postgres    false    258    3            U           0    0    TABLE mdmeasure    COMMENT     _   COMMENT ON TABLE public.mdmeasure IS 'Almacena las medidas a utilizar en las planificaciones';
            public       postgres    false    259            V           0    0    COLUMN mdmeasure.measure_id    COMMENT     D   COMMENT ON COLUMN public.mdmeasure.measure_id IS 'ID de la medida';
            public       postgres    false    259            W           0    0    COLUMN mdmeasure.name    COMMENT     B   COMMENT ON COLUMN public.mdmeasure.name IS 'Nombre de la medida';
            public       postgres    false    259            X           0    0    COLUMN mdmeasure.abbreviation    COMMENT     O   COMMENT ON COLUMN public.mdmeasure.abbreviation IS 'Abreviatura de la medida';
            public       postgres    false    259            Y           0    0    COLUMN mdmeasure.originvalue    COMMENT     Q   COMMENT ON COLUMN public.mdmeasure.originvalue IS 'Valor original de la medida';
            public       postgres    false    259            Z           0    0    COLUMN mdmeasure.valuekg    COMMENT     R   COMMENT ON COLUMN public.mdmeasure.valuekg IS 'Valor en kilogramos de la medida';
            public       postgres    false    259            [           0    0    COLUMN mdmeasure.is_unit    COMMENT     V   COMMENT ON COLUMN public.mdmeasure.is_unit IS 'Indica si la medida es la unidad (1)';
            public       postgres    false    259                       1259    138199    parameter_id_seq    SEQUENCE     y   CREATE SEQUENCE public.parameter_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.parameter_id_seq;
       public       postgres    false    3                       1259    138201    mdparameter    TABLE     9  CREATE TABLE public.mdparameter (
    parameter_id integer DEFAULT nextval('public.parameter_id_seq'::regclass) NOT NULL,
    description character varying(250) NOT NULL,
    type character varying(10),
    measure_id integer NOT NULL,
    process_id integer NOT NULL,
    name character varying(250) NOT NULL
);
    DROP TABLE public.mdparameter;
       public         postgres    false    260    3            \           0    0    TABLE mdparameter    COMMENT     �   COMMENT ON TABLE public.mdparameter IS 'Almacena la definición de los parámetros a utilizar en la planificación regresiva junto a sus respectivas características';
            public       postgres    false    261            ]           0    0    COLUMN mdparameter.parameter_id    COMMENT     J   COMMENT ON COLUMN public.mdparameter.parameter_id IS 'ID del parámetro';
            public       postgres    false    261            ^           0    0    COLUMN mdparameter.description    COMMENT     S   COMMENT ON COLUMN public.mdparameter.description IS 'Descripción del parámetro';
            public       postgres    false    261            _           0    0    COLUMN mdparameter.type    COMMENT     C   COMMENT ON COLUMN public.mdparameter.type IS 'Tipo de parámetro';
            public       postgres    false    261            `           0    0    COLUMN mdparameter.measure_id    COMMENT     F   COMMENT ON COLUMN public.mdparameter.measure_id IS 'ID de la medida';
            public       postgres    false    261            a           0    0    COLUMN mdparameter.process_id    COMMENT     E   COMMENT ON COLUMN public.mdparameter.process_id IS 'ID del proceso';
            public       postgres    false    261            b           0    0    COLUMN mdparameter.name    COMMENT     F   COMMENT ON COLUMN public.mdparameter.name IS 'Nombre del parámetro';
            public       postgres    false    261                       1259    138208    process_id_seq    SEQUENCE     w   CREATE SEQUENCE public.process_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.process_id_seq;
       public       postgres    false    3                       1259    138210 	   mdprocess    TABLE     =  CREATE TABLE public.mdprocess (
    process_id integer DEFAULT nextval('public.process_id_seq'::regclass) NOT NULL,
    process_order integer NOT NULL,
    product_id integer NOT NULL,
    stage_id integer NOT NULL,
    historical_decrease double precision NOT NULL,
    theoretical_decrease double precision NOT NULL,
    historical_weight double precision NOT NULL,
    theoretical_weight double precision NOT NULL,
    historical_duration integer NOT NULL,
    theoretical_duration integer NOT NULL,
    visible boolean,
    name character varying(250) NOT NULL,
    predecessor_id integer,
    capacity integer NOT NULL,
    breed_id integer NOT NULL,
    gender character varying(30),
    fattening_goal double precision,
    type_posture character varying(30),
    biological_active boolean,
    sync_considered boolean
);
    DROP TABLE public.mdprocess;
       public         postgres    false    262    3            c           0    0    TABLE mdprocess    COMMENT     �   COMMENT ON TABLE public.mdprocess IS 'Almacena los procesos definidos para la planificación progresiva junto a sus respectivas características';
            public       postgres    false    263            d           0    0    COLUMN mdprocess.process_id    COMMENT     C   COMMENT ON COLUMN public.mdprocess.process_id IS 'ID del proceso';
            public       postgres    false    263            e           0    0    COLUMN mdprocess.process_order    COMMENT     M   COMMENT ON COLUMN public.mdprocess.process_order IS 'Orden de los procesos';
            public       postgres    false    263            f           0    0    COLUMN mdprocess.product_id    COMMENT     M   COMMENT ON COLUMN public.mdprocess.product_id IS 'ID del producto asociado';
            public       postgres    false    263            g           0    0    COLUMN mdprocess.stage_id    COMMENT     A   COMMENT ON COLUMN public.mdprocess.stage_id IS 'ID de la etapa';
            public       postgres    false    263            h           0    0 $   COLUMN mdprocess.historical_decrease    COMMENT     Z   COMMENT ON COLUMN public.mdprocess.historical_decrease IS 'Merma histórica del proceso';
            public       postgres    false    263            i           0    0 %   COLUMN mdprocess.theoretical_decrease    COMMENT     Y   COMMENT ON COLUMN public.mdprocess.theoretical_decrease IS 'Merma teórica del proceso';
            public       postgres    false    263            j           0    0 "   COLUMN mdprocess.historical_weight    COMMENT     W   COMMENT ON COLUMN public.mdprocess.historical_weight IS 'Peso histórico del proceso';
            public       postgres    false    263            k           0    0 #   COLUMN mdprocess.theoretical_weight    COMMENT     V   COMMENT ON COLUMN public.mdprocess.theoretical_weight IS 'Peso teórico del proceso';
            public       postgres    false    263            l           0    0 $   COLUMN mdprocess.historical_duration    COMMENT     ^   COMMENT ON COLUMN public.mdprocess.historical_duration IS 'Duración histórica del proceso';
            public       postgres    false    263            m           0    0 %   COLUMN mdprocess.theoretical_duration    COMMENT     ]   COMMENT ON COLUMN public.mdprocess.theoretical_duration IS 'Duración teórica del proceso';
            public       postgres    false    263            n           0    0    COLUMN mdprocess.visible    COMMENT     I   COMMENT ON COLUMN public.mdprocess.visible IS 'Visibilidad del proceso';
            public       postgres    false    263            o           0    0    COLUMN mdprocess.name    COMMENT     A   COMMENT ON COLUMN public.mdprocess.name IS 'Nombre del proceso';
            public       postgres    false    263            p           0    0    COLUMN mdprocess.predecessor_id    COMMENT     J   COMMENT ON COLUMN public.mdprocess.predecessor_id IS 'ID del predecesor';
            public       postgres    false    263            q           0    0    COLUMN mdprocess.capacity    COMMENT     X   COMMENT ON COLUMN public.mdprocess.capacity IS 'Capacidad semanal asociada al proceso';
            public       postgres    false    263            r           0    0    COLUMN mdprocess.breed_id    COMMENT     @   COMMENT ON COLUMN public.mdprocess.breed_id IS 'ID de la raza';
            public       postgres    false    263            s           0    0    COLUMN mdprocess.gender    COMMENT     L   COMMENT ON COLUMN public.mdprocess.gender IS 'Sexo del producto de salida';
            public       postgres    false    263            t           0    0    COLUMN mdprocess.fattening_goal    COMMENT     H   COMMENT ON COLUMN public.mdprocess.fattening_goal IS 'Meta de engorde';
            public       postgres    false    263            u           0    0    COLUMN mdprocess.type_posture    COMMENT     s   COMMENT ON COLUMN public.mdprocess.type_posture IS 'Define el tipo de postura de acuerdo a la edad de la gallina';
            public       postgres    false    263            v           0    0 "   COLUMN mdprocess.biological_active    COMMENT     h   COMMENT ON COLUMN public.mdprocess.biological_active IS 'Define si el proceso es un activo biológico';
            public       postgres    false    263            w           0    0     COLUMN mdprocess.sync_considered    COMMENT     |   COMMENT ON COLUMN public.mdprocess.sync_considered IS 'Indica si la merma es considerada en el proceso de sincronización';
            public       postgres    false    263                       1259    138214    product_id_seq    SEQUENCE     w   CREATE SEQUENCE public.product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.product_id_seq;
       public       postgres    false    3            	           1259    138216 	   mdproduct    TABLE       CREATE TABLE public.mdproduct (
    product_id integer DEFAULT nextval('public.product_id_seq'::regclass) NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(45) NOT NULL,
    breed_id integer NOT NULL,
    stage_id integer NOT NULL
);
    DROP TABLE public.mdproduct;
       public         postgres    false    264    3            x           0    0    TABLE mdproduct    COMMENT     Z   COMMENT ON TABLE public.mdproduct IS 'Almacena los productos utilizados en los procesos';
            public       postgres    false    265            y           0    0    COLUMN mdproduct.product_id    COMMENT     D   COMMENT ON COLUMN public.mdproduct.product_id IS 'ID del producto';
            public       postgres    false    265            z           0    0    COLUMN mdproduct.code    COMMENT     C   COMMENT ON COLUMN public.mdproduct.code IS 'Código del producto';
            public       postgres    false    265            {           0    0    COLUMN mdproduct.name    COMMENT     B   COMMENT ON COLUMN public.mdproduct.name IS 'Nombre del producto';
            public       postgres    false    265            |           0    0    COLUMN mdproduct.breed_id    COMMENT     I   COMMENT ON COLUMN public.mdproduct.breed_id IS 'ID de la raza asociada';
            public       postgres    false    265            }           0    0    COLUMN mdproduct.stage_id    COMMENT     V   COMMENT ON COLUMN public.mdproduct.stage_id IS 'ID de la etapa asociada al producto';
            public       postgres    false    265            
           1259    138220    mdrol_rol_id_seq    SEQUENCE        CREATE SEQUENCE public.mdrol_rol_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000000
    CACHE 1;
 '   DROP SEQUENCE public.mdrol_rol_id_seq;
       public       postgres    false    3                       1259    138222    mdrol    TABLE     �   CREATE TABLE public.mdrol (
    rol_id integer DEFAULT nextval('public.mdrol_rol_id_seq'::regclass) NOT NULL,
    rol_name character varying(80) NOT NULL,
    admin_user_creator integer NOT NULL,
    creation_date timestamp with time zone NOT NULL
);
    DROP TABLE public.mdrol;
       public         postgres    false    266    3            ~           0    0    TABLE mdrol    COMMENT     O   COMMENT ON TABLE public.mdrol IS 'Almacena los datos de los diferentes roles';
            public       postgres    false    267                       0    0    COLUMN mdrol.rol_id    COMMENT     7   COMMENT ON COLUMN public.mdrol.rol_id IS 'ID del rol';
            public       postgres    false    267            �           0    0    COLUMN mdrol.rol_name    COMMENT     =   COMMENT ON COLUMN public.mdrol.rol_name IS 'Nombre del rol';
            public       postgres    false    267            �           0    0    COLUMN mdrol.admin_user_creator    COMMENT     \   COMMENT ON COLUMN public.mdrol.admin_user_creator IS 'Especifica que usuario creó el rol';
            public       postgres    false    267            �           0    0    COLUMN mdrol.creation_date    COMMENT     N   COMMENT ON COLUMN public.mdrol.creation_date IS 'Fecha de creación del rol';
            public       postgres    false    267                       1259    138226    scenario_id_seq    SEQUENCE     x   CREATE SEQUENCE public.scenario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.scenario_id_seq;
       public       postgres    false    3                       1259    138228 
   mdscenario    TABLE     ]  CREATE TABLE public.mdscenario (
    scenario_id integer DEFAULT nextval('public.scenario_id_seq'::regclass) NOT NULL,
    description character varying(250) NOT NULL,
    date_start timestamp with time zone NOT NULL,
    date_end timestamp with time zone NOT NULL,
    name character varying(250) NOT NULL,
    status integer DEFAULT 0 NOT NULL
);
    DROP TABLE public.mdscenario;
       public         postgres    false    268    3            �           0    0    TABLE mdscenario    COMMENT     ^   COMMENT ON TABLE public.mdscenario IS 'Almacena la información de los distintos escenarios';
            public       postgres    false    269            �           0    0    COLUMN mdscenario.scenario_id    COMMENT     G   COMMENT ON COLUMN public.mdscenario.scenario_id IS 'ID del escenario';
            public       postgres    false    269            �           0    0    COLUMN mdscenario.description    COMMENT     Q   COMMENT ON COLUMN public.mdscenario.description IS 'Descripción del escenario';
            public       postgres    false    269            �           0    0    COLUMN mdscenario.date_start    COMMENT     S   COMMENT ON COLUMN public.mdscenario.date_start IS 'Fecha de inicio del escenario';
            public       postgres    false    269            �           0    0    COLUMN mdscenario.date_end    COMMENT     W   COMMENT ON COLUMN public.mdscenario.date_end IS 'Fecha de culminación del escenario';
            public       postgres    false    269            �           0    0    COLUMN mdscenario.name    COMMENT     D   COMMENT ON COLUMN public.mdscenario.name IS 'Nombre del escenario';
            public       postgres    false    269            �           0    0    COLUMN mdscenario.status    COMMENT     F   COMMENT ON COLUMN public.mdscenario.status IS 'Estado del escenario';
            public       postgres    false    269                       1259    138236    status_shed_id_seq    SEQUENCE     {   CREATE SEQUENCE public.status_shed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.status_shed_id_seq;
       public       postgres    false    3                       1259    138238    mdshedstatus    TABLE     �   CREATE TABLE public.mdshedstatus (
    shed_status_id integer DEFAULT nextval('public.status_shed_id_seq'::regclass) NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(250) NOT NULL
);
     DROP TABLE public.mdshedstatus;
       public         postgres    false    270    3            �           0    0    TABLE mdshedstatus    COMMENT     b   COMMENT ON TABLE public.mdshedstatus IS 'Almacena los estatus de disponibilidad de los galpones';
            public       postgres    false    271            �           0    0 "   COLUMN mdshedstatus.shed_status_id    COMMENT     U   COMMENT ON COLUMN public.mdshedstatus.shed_status_id IS 'ID del estado del galpón';
            public       postgres    false    271            �           0    0    COLUMN mdshedstatus.name    COMMENT     b   COMMENT ON COLUMN public.mdshedstatus.name IS 'Nombre del estado en que se encuentra el galpón';
            public       postgres    false    271            �           0    0    COLUMN mdshedstatus.description    COMMENT     \   COMMENT ON COLUMN public.mdshedstatus.description IS 'Descripción del estado del galpón';
            public       postgres    false    271                       1259    138242    stage_id_seq    SEQUENCE     u   CREATE SEQUENCE public.stage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.stage_id_seq;
       public       postgres    false    3                       1259    138244    mdstage    TABLE     �   CREATE TABLE public.mdstage (
    stage_id integer DEFAULT nextval('public.stage_id_seq'::regclass) NOT NULL,
    order_ integer NOT NULL,
    name character varying(250) NOT NULL
);
    DROP TABLE public.mdstage;
       public         postgres    false    272    3            �           0    0    TABLE mdstage    COMMENT     e   COMMENT ON TABLE public.mdstage IS 'Almacena las etapas a utilizar en el proceso de planificación';
            public       postgres    false    273            �           0    0    COLUMN mdstage.stage_id    COMMENT     ?   COMMENT ON COLUMN public.mdstage.stage_id IS 'ID de la etapa';
            public       postgres    false    273            �           0    0    COLUMN mdstage.order_    COMMENT     U   COMMENT ON COLUMN public.mdstage.order_ IS 'Orden en el que se muestras las etapas';
            public       postgres    false    273            �           0    0    COLUMN mdstage.name    COMMENT     ?   COMMENT ON COLUMN public.mdstage.name IS 'Nombre de la etapa';
            public       postgres    false    273                       1259    138248    mduser_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mduser_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;
 )   DROP SEQUENCE public.mduser_user_id_seq;
       public       postgres    false    3                       1259    138250    mduser    TABLE     �  CREATE TABLE public.mduser (
    user_id integer DEFAULT nextval('public.mduser_user_id_seq'::regclass) NOT NULL,
    username character varying(80) NOT NULL,
    password character varying(10000000) NOT NULL,
    name character varying(80) NOT NULL,
    lastname character varying(80) NOT NULL,
    active boolean NOT NULL,
    admi_user_creator integer NOT NULL,
    rol_id integer NOT NULL,
    creation_date timestamp with time zone NOT NULL
);
    DROP TABLE public.mduser;
       public         postgres    false    274    3            �           0    0    TABLE mduser    COMMENT     G   COMMENT ON TABLE public.mduser IS 'Almacena los usuarios del sistema';
            public       postgres    false    275            �           0    0    COLUMN mduser.user_id    COMMENT     =   COMMENT ON COLUMN public.mduser.user_id IS 'ID del usuario';
            public       postgres    false    275            �           0    0    COLUMN mduser.username    COMMENT     A   COMMENT ON COLUMN public.mduser.username IS 'Alias del usuario';
            public       postgres    false    275            �           0    0    COLUMN mduser.password    COMMENT     G   COMMENT ON COLUMN public.mduser.password IS 'Contraseña del usuario';
            public       postgres    false    275            �           0    0    COLUMN mduser.name    COMMENT     >   COMMENT ON COLUMN public.mduser.name IS 'Nombre del usuario';
            public       postgres    false    275            �           0    0    COLUMN mduser.lastname    COMMENT     D   COMMENT ON COLUMN public.mduser.lastname IS 'Apellido del usuario';
            public       postgres    false    275            �           0    0    COLUMN mduser.active    COMMENT     O   COMMENT ON COLUMN public.mduser.active IS 'Indica si el usuario está activo';
            public       postgres    false    275            �           0    0    COLUMN mduser.admi_user_creator    COMMENT     u   COMMENT ON COLUMN public.mduser.admi_user_creator IS 'Nombre del usuario tipo "administrador" que creó el usuario';
            public       postgres    false    275            �           0    0    COLUMN mduser.rol_id    COMMENT     L   COMMENT ON COLUMN public.mduser.rol_id IS 'ID del rol asignado al usuario';
            public       postgres    false    275            �           0    0    COLUMN mduser.creation_date    COMMENT     S   COMMENT ON COLUMN public.mduser.creation_date IS 'Fecha de creación del usuario';
            public       postgres    false    275                       1259    138257    osadjustmentscontrol    TABLE     �   CREATE TABLE public.osadjustmentscontrol (
    adjustmentscontrol_id integer NOT NULL,
    username character varying NOT NULL,
    adjustment_date date NOT NULL,
    os_type character varying NOT NULL,
    os_id integer NOT NULL
);
 (   DROP TABLE public.osadjustmentscontrol;
       public         postgres    false    3            �           0    0    TABLE osadjustmentscontrol    COMMENT     x   COMMENT ON TABLE public.osadjustmentscontrol IS 'Almacena la información de los usuarios que modificaron estructuras';
            public       postgres    false    276            �           0    0 1   COLUMN osadjustmentscontrol.adjustmentscontrol_id    COMMENT     ]   COMMENT ON COLUMN public.osadjustmentscontrol.adjustmentscontrol_id IS 'ID de la relación';
            public       postgres    false    276            �           0    0 $   COLUMN osadjustmentscontrol.username    COMMENT     k   COMMENT ON COLUMN public.osadjustmentscontrol.username IS 'Alias del usuario que modificó la estructura';
            public       postgres    false    276            �           0    0 +   COLUMN osadjustmentscontrol.adjustment_date    COMMENT     o   COMMENT ON COLUMN public.osadjustmentscontrol.adjustment_date IS 'Fecha de la modificación de la estructura';
            public       postgres    false    276            �           0    0 #   COLUMN osadjustmentscontrol.os_type    COMMENT     ]   COMMENT ON COLUMN public.osadjustmentscontrol.os_type IS 'Tipo de la estructura modificada';
            public       postgres    false    276            �           0    0 !   COLUMN osadjustmentscontrol.os_id    COMMENT     Y   COMMENT ON COLUMN public.osadjustmentscontrol.os_id IS 'ID de la estructura modificada';
            public       postgres    false    276                       1259    138263 .   osadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE     �   CREATE SEQUENCE public.osadjustmentscontrol_adjustmentscontrol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 E   DROP SEQUENCE public.osadjustmentscontrol_adjustmentscontrol_id_seq;
       public       postgres    false    3    276            �           0    0 .   osadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.osadjustmentscontrol_adjustmentscontrol_id_seq OWNED BY public.osadjustmentscontrol.adjustmentscontrol_id;
            public       postgres    false    277                       1259    138265    oscenter    TABLE     5  CREATE TABLE public.oscenter (
    center_id integer DEFAULT nextval('public.center_id_seq'::regclass) NOT NULL,
    partnership_id integer NOT NULL,
    farm_id integer NOT NULL,
    name character varying(45) NOT NULL,
    code character varying(20) NOT NULL,
    "order" integer,
    os_disable boolean
);
    DROP TABLE public.oscenter;
       public         postgres    false    228    3            �           0    0    TABLE oscenter    COMMENT     T   COMMENT ON TABLE public.oscenter IS 'Almacena los datos referentes a los núcleos';
            public       postgres    false    278            �           0    0    COLUMN oscenter.center_id    COMMENT     A   COMMENT ON COLUMN public.oscenter.center_id IS 'ID del núcleo';
            public       postgres    false    278            �           0    0    COLUMN oscenter.partnership_id    COMMENT     H   COMMENT ON COLUMN public.oscenter.partnership_id IS 'ID de la empresa';
            public       postgres    false    278            �           0    0    COLUMN oscenter.farm_id    COMMENT     @   COMMENT ON COLUMN public.oscenter.farm_id IS 'ID de la granja';
            public       postgres    false    278            �           0    0    COLUMN oscenter.name    COMMENT     @   COMMENT ON COLUMN public.oscenter.name IS 'Nombre del núcleo';
            public       postgres    false    278            �           0    0    COLUMN oscenter.code    COMMENT     A   COMMENT ON COLUMN public.oscenter.code IS 'Código del núcleo';
            public       postgres    false    278            �           0    0    COLUMN oscenter.os_disable    COMMENT     U   COMMENT ON COLUMN public.oscenter.os_disable IS 'Indica si el núcleo está activo';
            public       postgres    false    278                       1259    138269    osfarm    TABLE     3  CREATE TABLE public.osfarm (
    farm_id integer DEFAULT nextval('public.farm_id_seq'::regclass) NOT NULL,
    partnership_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(45) NOT NULL,
    farm_type_id integer NOT NULL,
    _order integer,
    os_disable boolean
);
    DROP TABLE public.osfarm;
       public         postgres    false    232    3            �           0    0    TABLE osfarm    COMMENT     p   COMMENT ON TABLE public.osfarm IS 'Almacena la información de la granja con sus respectivas características';
            public       postgres    false    279            �           0    0    COLUMN osfarm.farm_id    COMMENT     >   COMMENT ON COLUMN public.osfarm.farm_id IS 'ID de la granja';
            public       postgres    false    279            �           0    0    COLUMN osfarm.partnership_id    COMMENT     F   COMMENT ON COLUMN public.osfarm.partnership_id IS 'ID de la empresa';
            public       postgres    false    279            �           0    0    COLUMN osfarm.code    COMMENT     @   COMMENT ON COLUMN public.osfarm.code IS 'Código de la granja';
            public       postgres    false    279            �           0    0    COLUMN osfarm.name    COMMENT     ?   COMMENT ON COLUMN public.osfarm.name IS 'Nombre de la granja';
            public       postgres    false    279            �           0    0    COLUMN osfarm.farm_type_id    COMMENT     I   COMMENT ON COLUMN public.osfarm.farm_type_id IS 'ID del tipo de granja';
            public       postgres    false    279            �           0    0    COLUMN osfarm.os_disable    COMMENT     R   COMMENT ON COLUMN public.osfarm.os_disable IS 'Indica si la granja está activa';
            public       postgres    false    279                       1259    138273    osincubator    TABLE       CREATE TABLE public.osincubator (
    incubator_id integer DEFAULT nextval('public.incubator_id_seq'::regclass) NOT NULL,
    incubator_plant_id integer NOT NULL,
    name character varying(45) NOT NULL,
    code character varying(20) NOT NULL,
    description character varying(250) NOT NULL,
    capacity integer,
    sunday integer,
    monday integer,
    tuesday integer,
    wednesday integer,
    thursday integer,
    friday integer,
    saturday integer,
    available integer,
    os_disable boolean,
    _order integer
);
    DROP TABLE public.osincubator;
       public         postgres    false    237    3            �           0    0    TABLE osincubator    COMMENT     y   COMMENT ON TABLE public.osincubator IS 'Almacena las máquinas de incubación pertenecientes a cada una de las plantas';
            public       postgres    false    280            �           0    0    COLUMN osincubator.incubator_id    COMMENT     L   COMMENT ON COLUMN public.osincubator.incubator_id IS 'ID de la incubadora';
            public       postgres    false    280            �           0    0 %   COLUMN osincubator.incubator_plant_id    COMMENT     m   COMMENT ON COLUMN public.osincubator.incubator_plant_id IS 'ID de la planta incubadora a la cual pertenece';
            public       postgres    false    280            �           0    0    COLUMN osincubator.name    COMMENT     H   COMMENT ON COLUMN public.osincubator.name IS 'Nombre de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.code    COMMENT     I   COMMENT ON COLUMN public.osincubator.code IS 'Código de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.description    COMMENT     U   COMMENT ON COLUMN public.osincubator.description IS 'Descripción de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.capacity    COMMENT     O   COMMENT ON COLUMN public.osincubator.capacity IS 'Capacidad de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.sunday    COMMENT     ]   COMMENT ON COLUMN public.osincubator.sunday IS 'Marca los dias de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.monday    COMMENT     ^   COMMENT ON COLUMN public.osincubator.monday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.tuesday    COMMENT     _   COMMENT ON COLUMN public.osincubator.tuesday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.wednesday    COMMENT     a   COMMENT ON COLUMN public.osincubator.wednesday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.thursday    COMMENT     `   COMMENT ON COLUMN public.osincubator.thursday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.friday    COMMENT     ^   COMMENT ON COLUMN public.osincubator.friday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.saturday    COMMENT     `   COMMENT ON COLUMN public.osincubator.saturday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.available    COMMENT     ]   COMMENT ON COLUMN public.osincubator.available IS 'Indica si la incubadora está disponble';
            public       postgres    false    280            �           0    0    COLUMN osincubator.os_disable    COMMENT     [   COMMENT ON COLUMN public.osincubator.os_disable IS 'Indica si la incubadora está activa';
            public       postgres    false    280                       1259    138277    osincubatorplant    TABLE     �  CREATE TABLE public.osincubatorplant (
    incubator_plant_id integer DEFAULT nextval('public.incubator_plant_id_seq'::regclass) NOT NULL,
    name character varying(45) NOT NULL,
    code character varying(20) NOT NULL,
    description character varying(250),
    partnership_id integer NOT NULL,
    max_storage integer,
    min_storage integer,
    acclimatized boolean,
    suitable boolean,
    expired boolean,
    os_disable boolean
);
 $   DROP TABLE public.osincubatorplant;
       public         postgres    false    238    3            �           0    0    TABLE osincubatorplant    COMMENT     }   COMMENT ON TABLE public.osincubatorplant IS 'Almacena la información de la planta incubadora perteneciente a cada empresa';
            public       postgres    false    281            �           0    0 *   COLUMN osincubatorplant.incubator_plant_id    COMMENT     ^   COMMENT ON COLUMN public.osincubatorplant.incubator_plant_id IS 'ID de la planta incubadora';
            public       postgres    false    281            �           0    0    COLUMN osincubatorplant.name    COMMENT     T   COMMENT ON COLUMN public.osincubatorplant.name IS 'Nombre de la planta incubadora';
            public       postgres    false    281            �           0    0    COLUMN osincubatorplant.code    COMMENT     U   COMMENT ON COLUMN public.osincubatorplant.code IS 'Código de la planta incubadora';
            public       postgres    false    281            �           0    0 #   COLUMN osincubatorplant.description    COMMENT     a   COMMENT ON COLUMN public.osincubatorplant.description IS 'Descripción de la planta incubadora';
            public       postgres    false    281            �           0    0 &   COLUMN osincubatorplant.partnership_id    COMMENT     d   COMMENT ON COLUMN public.osincubatorplant.partnership_id IS 'ID de la empresa a la cual pertenece';
            public       postgres    false    281            �           0    0 #   COLUMN osincubatorplant.max_storage    COMMENT     ^   COMMENT ON COLUMN public.osincubatorplant.max_storage IS 'Número máximo de almacenamiento';
            public       postgres    false    281            �           0    0 #   COLUMN osincubatorplant.min_storage    COMMENT     ^   COMMENT ON COLUMN public.osincubatorplant.min_storage IS 'Número mínimo de almacenamiento';
            public       postgres    false    281            �           0    0 $   COLUMN osincubatorplant.acclimatized    COMMENT     �   COMMENT ON COLUMN public.osincubatorplant.acclimatized IS 'Indica si se usará el valor aclimatado para la disponibilidad del inventario en almacén de huevo fértil';
            public       postgres    false    281            �           0    0     COLUMN osincubatorplant.suitable    COMMENT     �   COMMENT ON COLUMN public.osincubatorplant.suitable IS 'Indica si se usará el valor adecuado para la disponibilidad del inventario en almacén de huevo fértil';
            public       postgres    false    281            �           0    0    COLUMN osincubatorplant.expired    COMMENT     �   COMMENT ON COLUMN public.osincubatorplant.expired IS 'Indica si se usará el valor expirado para la disponibilidad del inventario en almacén de huevo férti';
            public       postgres    false    281            �           0    0 "   COLUMN osincubatorplant.os_disable    COMMENT     g   COMMENT ON COLUMN public.osincubatorplant.os_disable IS 'Indica si la planta incubadora está activa';
            public       postgres    false    281                       1259    138281    partnership_id_seq    SEQUENCE     {   CREATE SEQUENCE public.partnership_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.partnership_id_seq;
       public       postgres    false    3                       1259    138283    ospartnership    TABLE     J  CREATE TABLE public.ospartnership (
    partnership_id integer DEFAULT nextval('public.partnership_id_seq'::regclass) NOT NULL,
    name character varying(45) NOT NULL,
    address character varying(250) NOT NULL,
    description character varying(250) NOT NULL,
    code character varying(20) NOT NULL,
    os_disable boolean
);
 !   DROP TABLE public.ospartnership;
       public         postgres    false    282    3            �           0    0    TABLE ospartnership    COMMENT     j   COMMENT ON TABLE public.ospartnership IS 'Almacena la información referente a las empresas registradas';
            public       postgres    false    283            �           0    0 #   COLUMN ospartnership.partnership_id    COMMENT     M   COMMENT ON COLUMN public.ospartnership.partnership_id IS 'ID de la empresa';
            public       postgres    false    283            �           0    0    COLUMN ospartnership.name    COMMENT     G   COMMENT ON COLUMN public.ospartnership.name IS 'Nombre de la empresa';
            public       postgres    false    283            �           0    0    COLUMN ospartnership.address    COMMENT     N   COMMENT ON COLUMN public.ospartnership.address IS 'Dirección de la empresa';
            public       postgres    false    283            �           0    0     COLUMN ospartnership.description    COMMENT     T   COMMENT ON COLUMN public.ospartnership.description IS 'Descripción de la empresa';
            public       postgres    false    283            �           0    0    COLUMN ospartnership.code    COMMENT     H   COMMENT ON COLUMN public.ospartnership.code IS 'Código de la empresa';
            public       postgres    false    283            �           0    0    COLUMN ospartnership.os_disable    COMMENT     Z   COMMENT ON COLUMN public.ospartnership.os_disable IS 'Indica si la empresa está activa';
            public       postgres    false    283                       1259    138290    shed_id_seq    SEQUENCE     t   CREATE SEQUENCE public.shed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.shed_id_seq;
       public       postgres    false    3                       1259    138292    osshed    TABLE     n  CREATE TABLE public.osshed (
    shed_id integer DEFAULT nextval('public.shed_id_seq'::regclass) NOT NULL,
    partnership_id integer NOT NULL,
    farm_id integer NOT NULL,
    center_id integer NOT NULL,
    code character varying(20) NOT NULL,
    statusshed_id integer,
    type_id integer,
    building_date date,
    stall_width double precision NOT NULL,
    stall_height double precision NOT NULL,
    capacity_min double precision NOT NULL,
    capacity_max double precision NOT NULL,
    environment_id integer,
    rotation_days integer DEFAULT 0 NOT NULL,
    nests_quantity integer DEFAULT 0 NOT NULL,
    cages_quantity integer DEFAULT 0 NOT NULL,
    birds_quantity integer DEFAULT 0 NOT NULL,
    capacity_theoretical integer DEFAULT 0 NOT NULL,
    avaliable_date date,
    _order integer,
    breed_id integer,
    os_disable boolean,
    rehousing boolean
);
    DROP TABLE public.osshed;
       public         postgres    false    284    3            �           0    0    TABLE osshed    COMMENT     e   COMMENT ON TABLE public.osshed IS 'Almacena la información de los galpones asociados a la empresa';
            public       postgres    false    285            �           0    0    COLUMN osshed.shed_id    COMMENT     =   COMMENT ON COLUMN public.osshed.shed_id IS 'ID del galpón';
            public       postgres    false    285            �           0    0    COLUMN osshed.partnership_id    COMMENT     Z   COMMENT ON COLUMN public.osshed.partnership_id IS 'ID de la empresa a la cual pertenece';
            public       postgres    false    285            �           0    0    COLUMN osshed.farm_id    COMMENT     R   COMMENT ON COLUMN public.osshed.farm_id IS 'ID de la granja a la cual pertenece';
            public       postgres    false    285            �           0    0    COLUMN osshed.center_id    COMMENT     Q   COMMENT ON COLUMN public.osshed.center_id IS 'ID del núcleo al cual pertenece';
            public       postgres    false    285            �           0    0    COLUMN osshed.code    COMMENT     ?   COMMENT ON COLUMN public.osshed.code IS 'Código del galpón';
            public       postgres    false    285            �           0    0    COLUMN osshed.statusshed_id    COMMENT     U   COMMENT ON COLUMN public.osshed.statusshed_id IS 'ID del estado actual del galpón';
            public       postgres    false    285            �           0    0    COLUMN osshed.type_id    COMMENT     E   COMMENT ON COLUMN public.osshed.type_id IS 'ID del tipo de galpón';
            public       postgres    false    285            �           0    0    COLUMN osshed.building_date    COMMENT     X   COMMENT ON COLUMN public.osshed.building_date IS 'Fecha de construcción del edificio';
            public       postgres    false    285            �           0    0    COLUMN osshed.stall_width    COMMENT     N   COMMENT ON COLUMN public.osshed.stall_width IS 'Indica el ancho del galpón';
            public       postgres    false    285            �           0    0    COLUMN osshed.stall_height    COMMENT     N   COMMENT ON COLUMN public.osshed.stall_height IS 'Indica el alto del galpón';
            public       postgres    false    285            �           0    0    COLUMN osshed.capacity_min    COMMENT     E   COMMENT ON COLUMN public.osshed.capacity_min IS 'Capacidad mínima';
            public       postgres    false    285            �           0    0    COLUMN osshed.capacity_max    COMMENT     F   COMMENT ON COLUMN public.osshed.capacity_max IS 'Capacidad máxima ';
            public       postgres    false    285            �           0    0    COLUMN osshed.environment_id    COMMENT     E   COMMENT ON COLUMN public.osshed.environment_id IS 'ID del ambiente';
            public       postgres    false    285            �           0    0    COLUMN osshed.rotation_days    COMMENT     H   COMMENT ON COLUMN public.osshed.rotation_days IS 'Días de rotación
';
            public       postgres    false    285            �           0    0    COLUMN osshed.nests_quantity    COMMENT     I   COMMENT ON COLUMN public.osshed.nests_quantity IS 'Cantidad de nidales';
            public       postgres    false    285            �           0    0    COLUMN osshed.cages_quantity    COMMENT     H   COMMENT ON COLUMN public.osshed.cages_quantity IS 'Cantidad de jaulas';
            public       postgres    false    285            �           0    0    COLUMN osshed.birds_quantity    COMMENT     F   COMMENT ON COLUMN public.osshed.birds_quantity IS 'Cantidad de aves';
            public       postgres    false    285            �           0    0 "   COLUMN osshed.capacity_theoretical    COMMENT     N   COMMENT ON COLUMN public.osshed.capacity_theoretical IS 'Capacidad teórica';
            public       postgres    false    285            �           0    0    COLUMN osshed.avaliable_date    COMMENT     Y   COMMENT ON COLUMN public.osshed.avaliable_date IS 'Fecha de disponibilidad del galpón';
            public       postgres    false    285            �           0    0    COLUMN osshed.breed_id    COMMENT     R   COMMENT ON COLUMN public.osshed.breed_id IS 'ID de la raza que aloja el galpón';
            public       postgres    false    285            �           0    0    COLUMN osshed.os_disable    COMMENT     S   COMMENT ON COLUMN public.osshed.os_disable IS 'Indica si el galpón está activo';
            public       postgres    false    285            �           0    0    COLUMN osshed.rehousing    COMMENT     W   COMMENT ON COLUMN public.osshed.rehousing IS 'Indica si el galpón se puede realojar';
            public       postgres    false    285                       1259    138301    slaughterhouse_id_seq    SEQUENCE        CREATE SEQUENCE public.slaughterhouse_id_seq
    START WITH 33
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.slaughterhouse_id_seq;
       public       postgres    false    3                       1259    138303    osslaughterhouse    TABLE     r  CREATE TABLE public.osslaughterhouse (
    slaughterhouse_id integer DEFAULT nextval('public.slaughterhouse_id_seq'::regclass) NOT NULL,
    name character varying(45) NOT NULL,
    address character varying(250) NOT NULL,
    description character varying(250) NOT NULL,
    code character varying(20) NOT NULL,
    capacity double precision,
    os_disable boolean
);
 $   DROP TABLE public.osslaughterhouse;
       public         postgres    false    286    3            �           0    0    TABLE osslaughterhouse    COMMENT     ^   COMMENT ON TABLE public.osslaughterhouse IS 'Almacena los datos de las plantas de beneficio';
            public       postgres    false    287            �           0    0 )   COLUMN osslaughterhouse.slaughterhouse_id    COMMENT     _   COMMENT ON COLUMN public.osslaughterhouse.slaughterhouse_id IS 'ID de la planta de beneficio';
            public       postgres    false    287            �           0    0    COLUMN osslaughterhouse.name    COMMENT     V   COMMENT ON COLUMN public.osslaughterhouse.name IS 'Nombre de la planta de beneficio';
            public       postgres    false    287            �           0    0    COLUMN osslaughterhouse.address    COMMENT     ]   COMMENT ON COLUMN public.osslaughterhouse.address IS 'Dirección de la planta de beneficio';
            public       postgres    false    287            �           0    0 #   COLUMN osslaughterhouse.description    COMMENT     c   COMMENT ON COLUMN public.osslaughterhouse.description IS 'Descripción de la planta de beneficio';
            public       postgres    false    287            �           0    0    COLUMN osslaughterhouse.code    COMMENT     W   COMMENT ON COLUMN public.osslaughterhouse.code IS 'Código de la planta de beneficio';
            public       postgres    false    287            �           0    0     COLUMN osslaughterhouse.capacity    COMMENT     ]   COMMENT ON COLUMN public.osslaughterhouse.capacity IS 'Capacidad de la planta de beneficio';
            public       postgres    false    287            �           0    0 "   COLUMN osslaughterhouse.os_disable    COMMENT     i   COMMENT ON COLUMN public.osslaughterhouse.os_disable IS 'Indica si la planta de beneficio está activa';
            public       postgres    false    287                        1259    138310    posture_curve_id_seq    SEQUENCE     }   CREATE SEQUENCE public.posture_curve_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.posture_curve_id_seq;
       public       postgres    false    3            !           1259    138312    predecessor_id_seq    SEQUENCE     {   CREATE SEQUENCE public.predecessor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.predecessor_id_seq;
       public       postgres    false    3            "           1259    138314    process_class_id_seq    SEQUENCE     }   CREATE SEQUENCE public.process_class_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.process_class_id_seq;
       public       postgres    false    3            #           1259    138316    programmed_eggs_id_seq    SEQUENCE        CREATE SEQUENCE public.programmed_eggs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.programmed_eggs_id_seq;
       public       postgres    false    3            $           1259    138318    raspberry_id_seq    SEQUENCE     y   CREATE SEQUENCE public.raspberry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.raspberry_id_seq;
       public       postgres    false    3            %           1259    138320    scenario_formula_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scenario_formula_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.scenario_formula_id_seq;
       public       postgres    false    3            &           1259    138322    scenario_parameter_day_seq    SEQUENCE     �   CREATE SEQUENCE public.scenario_parameter_day_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.scenario_parameter_day_seq;
       public       postgres    false    3            '           1259    138324    scenario_parameter_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scenario_parameter_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.scenario_parameter_id_seq;
       public       postgres    false    3            (           1259    138326    scenario_posture_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scenario_posture_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.scenario_posture_id_seq;
       public       postgres    false    3            )           1259    138328    scenario_process_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scenario_process_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.scenario_process_id_seq;
       public       postgres    false    3            *           1259    138330    silo_id_seq    SEQUENCE     t   CREATE SEQUENCE public.silo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.silo_id_seq;
       public       postgres    false    3            +           1259    138332    slmdevictionpartition    TABLE     {  CREATE TABLE public.slmdevictionpartition (
    slevictionpartition_id integer NOT NULL,
    youngmale double precision NOT NULL,
    oldmale double precision NOT NULL,
    youngfemale double precision NOT NULL,
    oldfemale double precision NOT NULL,
    active boolean,
    sl_disable boolean,
    peasantmale double precision NOT NULL,
    name character varying NOT NULL
);
 )   DROP TABLE public.slmdevictionpartition;
       public         postgres    false    3            �           0    0    TABLE slmdevictionpartition    COMMENT     j   COMMENT ON TABLE public.slmdevictionpartition IS 'Almacena las particiones de desalojo de capa superior';
            public       postgres    false    299            �           0    0 3   COLUMN slmdevictionpartition.slevictionpartition_id    COMMENT     l   COMMENT ON COLUMN public.slmdevictionpartition.slevictionpartition_id IS 'ID de la partición de desalojo';
            public       postgres    false    299            �           0    0 &   COLUMN slmdevictionpartition.youngmale    COMMENT     ]   COMMENT ON COLUMN public.slmdevictionpartition.youngmale IS 'Porcentaje de machos jóvenes';
            public       postgres    false    299            �           0    0 $   COLUMN slmdevictionpartition.oldmale    COMMENT     Y   COMMENT ON COLUMN public.slmdevictionpartition.oldmale IS 'Porcentaje de machos viejos';
            public       postgres    false    299            �           0    0 (   COLUMN slmdevictionpartition.youngfemale    COMMENT     `   COMMENT ON COLUMN public.slmdevictionpartition.youngfemale IS 'Porcentaje de hembras jóvenes';
            public       postgres    false    299            �           0    0 &   COLUMN slmdevictionpartition.oldfemale    COMMENT     \   COMMENT ON COLUMN public.slmdevictionpartition.oldfemale IS 'Porcentaje de hembras viejas';
            public       postgres    false    299            �           0    0 #   COLUMN slmdevictionpartition.active    COMMENT     j   COMMENT ON COLUMN public.slmdevictionpartition.active IS 'Indica actividad/inactividad de la partición';
            public       postgres    false    299            �           0    0 '   COLUMN slmdevictionpartition.sl_disable    COMMENT     \   COMMENT ON COLUMN public.slmdevictionpartition.sl_disable IS 'Indica partición eliminada';
            public       postgres    false    299            �           0    0 (   COLUMN slmdevictionpartition.peasantmale    COMMENT     _   COMMENT ON COLUMN public.slmdevictionpartition.peasantmale IS 'Porcentaje de macho campesino';
            public       postgres    false    299            �           0    0 !   COLUMN slmdevictionpartition.name    COMMENT     R   COMMENT ON COLUMN public.slmdevictionpartition.name IS 'Nombre de la partición';
            public       postgres    false    299            ,           1259    138338 0   slmdevictionpartition_slevictionpartition_id_seq    SEQUENCE     �   CREATE SEQUENCE public.slmdevictionpartition_slevictionpartition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 G   DROP SEQUENCE public.slmdevictionpartition_slevictionpartition_id_seq;
       public       postgres    false    299    3            �           0    0 0   slmdevictionpartition_slevictionpartition_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.slmdevictionpartition_slevictionpartition_id_seq OWNED BY public.slmdevictionpartition.slevictionpartition_id;
            public       postgres    false    300            -           1259    138340    slmdgenderclassification    TABLE     G  CREATE TABLE public.slmdgenderclassification (
    slgenderclassification_id integer NOT NULL,
    name character varying NOT NULL,
    gender "char" NOT NULL,
    breed_id integer NOT NULL,
    weight_gain double precision NOT NULL,
    age integer NOT NULL,
    mortality double precision NOT NULL,
    sl_disable boolean
);
 ,   DROP TABLE public.slmdgenderclassification;
       public         postgres    false    3            �           0    0    TABLE slmdgenderclassification    COMMENT     o   COMMENT ON TABLE public.slmdgenderclassification IS 'Almacena las clasificaciones de sexaje de capa superior';
            public       postgres    false    301            �           0    0 9   COLUMN slmdgenderclassification.slgenderclassification_id    COMMENT     t   COMMENT ON COLUMN public.slmdgenderclassification.slgenderclassification_id IS 'ID de la clasificación de sexaje';
            public       postgres    false    301                        0    0 $   COLUMN slmdgenderclassification.name    COMMENT     c   COMMENT ON COLUMN public.slmdgenderclassification.name IS 'Nombre de la clasificación de sexaje';
            public       postgres    false    301                       0    0 &   COLUMN slmdgenderclassification.gender    COMMENT     c   COMMENT ON COLUMN public.slmdgenderclassification.gender IS 'Sexo de la clasificación de sexaje';
            public       postgres    false    301                       0    0 (   COLUMN slmdgenderclassification.breed_id    COMMENT     v   COMMENT ON COLUMN public.slmdgenderclassification.breed_id IS 'ID de la raza asociada a la clasificación de sexaje';
            public       postgres    false    301                       0    0 +   COLUMN slmdgenderclassification.weight_gain    COMMENT     v   COMMENT ON COLUMN public.slmdgenderclassification.weight_gain IS 'Ganancia de peso para la clasificación de sexaje';
            public       postgres    false    301                       0    0 #   COLUMN slmdgenderclassification.age    COMMENT     b   COMMENT ON COLUMN public.slmdgenderclassification.age IS 'Edad para la clasificación de sexaje';
            public       postgres    false    301                       0    0 )   COLUMN slmdgenderclassification.mortality    COMMENT     t   COMMENT ON COLUMN public.slmdgenderclassification.mortality IS 'Mortalidad asociada a la clasificación de sexaje';
            public       postgres    false    301                       0    0 *   COLUMN slmdgenderclassification.sl_disable    COMMENT     m   COMMENT ON COLUMN public.slmdgenderclassification.sl_disable IS 'Indica clasificación de sexaje eliminada';
            public       postgres    false    301            .           1259    138346 6   slmdgenderclassification_slgenderclassification_id_seq    SEQUENCE     �   CREATE SEQUENCE public.slmdgenderclassification_slgenderclassification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 M   DROP SEQUENCE public.slmdgenderclassification_slgenderclassification_id_seq;
       public       postgres    false    3    301                       0    0 6   slmdgenderclassification_slgenderclassification_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.slmdgenderclassification_slgenderclassification_id_seq OWNED BY public.slmdgenderclassification.slgenderclassification_id;
            public       postgres    false    302            /           1259    138348    slmdmachinegroup    TABLE     �  CREATE TABLE public.slmdmachinegroup (
    slmachinegroup_id integer NOT NULL,
    incubatorplant_id integer NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    amount_of_charge integer NOT NULL,
    charges integer NOT NULL,
    sunday boolean,
    monday boolean,
    tuesday boolean,
    wednesday boolean,
    thursday boolean,
    friday boolean,
    saturday boolean,
    sl_disable boolean
);
 $   DROP TABLE public.slmdmachinegroup;
       public         postgres    false    3                       0    0    TABLE slmdmachinegroup    COMMENT     a   COMMENT ON TABLE public.slmdmachinegroup IS 'Almacena los grupos de máquinas de capa superior';
            public       postgres    false    303            	           0    0 )   COLUMN slmdmachinegroup.slmachinegroup_id    COMMENT     \   COMMENT ON COLUMN public.slmdmachinegroup.slmachinegroup_id IS 'ID del grupo de máquinas';
            public       postgres    false    303            
           0    0 )   COLUMN slmdmachinegroup.incubatorplant_id    COMMENT     �   COMMENT ON COLUMN public.slmdmachinegroup.incubatorplant_id IS 'ID de la planta incubadora a la que pertenece el grupo de máquinas';
            public       postgres    false    303                       0    0    COLUMN slmdmachinegroup.name    COMMENT     S   COMMENT ON COLUMN public.slmdmachinegroup.name IS 'Nombre del grupo de máquinas';
            public       postgres    false    303                       0    0 #   COLUMN slmdmachinegroup.description    COMMENT     `   COMMENT ON COLUMN public.slmdmachinegroup.description IS 'Descripción del grupo de máquinas';
            public       postgres    false    303                       0    0 (   COLUMN slmdmachinegroup.amount_of_charge    COMMENT     �   COMMENT ON COLUMN public.slmdmachinegroup.amount_of_charge IS 'Cantidad de cargas por máquina asociada al grupo de máquinas';
            public       postgres    false    303                       0    0    COLUMN slmdmachinegroup.charges    COMMENT     k   COMMENT ON COLUMN public.slmdmachinegroup.charges IS 'Cantidad de cargas asociadas al grupo de máquinas';
            public       postgres    false    303                       0    0    COLUMN slmdmachinegroup.sunday    COMMENT     m   COMMENT ON COLUMN public.slmdmachinegroup.sunday IS 'Indica si las máquinas asociadas trabajan el domingo';
            public       postgres    false    303                       0    0    COLUMN slmdmachinegroup.monday    COMMENT     k   COMMENT ON COLUMN public.slmdmachinegroup.monday IS 'Indica si las máquinas asociadas trabajan el lunes';
            public       postgres    false    303                       0    0    COLUMN slmdmachinegroup.tuesday    COMMENT     m   COMMENT ON COLUMN public.slmdmachinegroup.tuesday IS 'Indica si las máquinas asociadas trabajan el martes';
            public       postgres    false    303                       0    0 !   COLUMN slmdmachinegroup.wednesday    COMMENT     s   COMMENT ON COLUMN public.slmdmachinegroup.wednesday IS 'Indica si las máquinas asociadas trabajan el miércoles';
            public       postgres    false    303                       0    0     COLUMN slmdmachinegroup.thursday    COMMENT     n   COMMENT ON COLUMN public.slmdmachinegroup.thursday IS 'Indica si las máquinas asociadas trabajan el jueves';
            public       postgres    false    303                       0    0    COLUMN slmdmachinegroup.friday    COMMENT     m   COMMENT ON COLUMN public.slmdmachinegroup.friday IS 'Indica si las máquinas asociadas trabajan el viernes';
            public       postgres    false    303                       0    0     COLUMN slmdmachinegroup.saturday    COMMENT     o   COMMENT ON COLUMN public.slmdmachinegroup.saturday IS 'Indica si las máquinas asociadas trabajan el sábado';
            public       postgres    false    303                       0    0 "   COLUMN slmdmachinegroup.sl_disable    COMMENT     _   COMMENT ON COLUMN public.slmdmachinegroup.sl_disable IS 'Indica grupo de máquinas eliminado';
            public       postgres    false    303            0           1259    138354 &   slmdmachinegroup_slmachinegroup_id_seq    SEQUENCE     �   CREATE SEQUENCE public.slmdmachinegroup_slmachinegroup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 =   DROP SEQUENCE public.slmdmachinegroup_slmachinegroup_id_seq;
       public       postgres    false    303    3                       0    0 &   slmdmachinegroup_slmachinegroup_id_seq    SEQUENCE OWNED BY     q   ALTER SEQUENCE public.slmdmachinegroup_slmachinegroup_id_seq OWNED BY public.slmdmachinegroup.slmachinegroup_id;
            public       postgres    false    304            1           1259    138356    slmdprocess    TABLE     .  CREATE TABLE public.slmdprocess (
    slprocess_id integer NOT NULL,
    name character varying NOT NULL,
    stage_id integer NOT NULL,
    breed_id integer NOT NULL,
    decrease double precision NOT NULL,
    duration_process integer NOT NULL,
    sync_considered boolean,
    sl_disable boolean
);
    DROP TABLE public.slmdprocess;
       public         postgres    false    3                       0    0    TABLE slmdprocess    COMMENT     ^   COMMENT ON TABLE public.slmdprocess IS 'Almacena los datos de los procesos de capa superior';
            public       postgres    false    305                       0    0    COLUMN slmdprocess.slprocess_id    COMMENT     G   COMMENT ON COLUMN public.slmdprocess.slprocess_id IS 'ID del proceso';
            public       postgres    false    305                       0    0    COLUMN slmdprocess.name    COMMENT     C   COMMENT ON COLUMN public.slmdprocess.name IS 'Nombre del proceso';
            public       postgres    false    305                       0    0    COLUMN slmdprocess.stage_id    COMMENT     W   COMMENT ON COLUMN public.slmdprocess.stage_id IS 'ID de la etapa asociada al proceso';
            public       postgres    false    305                       0    0    COLUMN slmdprocess.breed_id    COMMENT     V   COMMENT ON COLUMN public.slmdprocess.breed_id IS 'ID de la raza asociada al proceso';
            public       postgres    false    305                       0    0    COLUMN slmdprocess.decrease    COMMENT     N   COMMENT ON COLUMN public.slmdprocess.decrease IS 'Merma asociada al proceso';
            public       postgres    false    305                       0    0 #   COLUMN slmdprocess.duration_process    COMMENT     [   COMMENT ON COLUMN public.slmdprocess.duration_process IS 'Duración del proceso en días';
            public       postgres    false    305                       0    0 "   COLUMN slmdprocess.sync_considered    COMMENT     w   COMMENT ON COLUMN public.slmdprocess.sync_considered IS 'Indica si la merma es considerada al momento de sincronizar';
            public       postgres    false    305                        0    0    COLUMN slmdprocess.sl_disable    COMMENT     O   COMMENT ON COLUMN public.slmdprocess.sl_disable IS 'Indica proceso eliminado';
            public       postgres    false    305            2           1259    138362    slmdprocess_slprocess_id_seq    SEQUENCE     �   CREATE SEQUENCE public.slmdprocess_slprocess_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.slmdprocess_slprocess_id_seq;
       public       postgres    false    3    305            !           0    0    slmdprocess_slprocess_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.slmdprocess_slprocess_id_seq OWNED BY public.slmdprocess.slprocess_id;
            public       postgres    false    306            3           1259    138364 
   sltxb_shed    TABLE     �   CREATE TABLE public.sltxb_shed (
    slb_shed_id integer NOT NULL,
    slbreeding_id integer NOT NULL,
    center_id integer NOT NULL,
    shed_id integer NOT NULL
);
    DROP TABLE public.sltxb_shed;
       public         postgres    false    3            "           0    0    TABLE sltxb_shed    COMMENT     ~   COMMENT ON TABLE public.sltxb_shed IS 'Almacena la relación entre galpón y programaciones de producción de capa superior';
            public       postgres    false    307            #           0    0    COLUMN sltxb_shed.slb_shed_id    COMMENT     n   COMMENT ON COLUMN public.sltxb_shed.slb_shed_id IS 'ID de la relación galpón-programación de producción';
            public       postgres    false    307            $           0    0    COLUMN sltxb_shed.slbreeding_id    COMMENT     ^   COMMENT ON COLUMN public.sltxb_shed.slbreeding_id IS 'ID de la programación de producción';
            public       postgres    false    307            %           0    0    COLUMN sltxb_shed.center_id    COMMENT     z   COMMENT ON COLUMN public.sltxb_shed.center_id IS 'ID del núcleo del galpón asociado a la programación de producción';
            public       postgres    false    307            &           0    0    COLUMN sltxb_shed.shed_id    COMMENT     l   COMMENT ON COLUMN public.sltxb_shed.shed_id IS 'ID del galpón asociado a la programación de producción';
            public       postgres    false    307            4           1259    138367    sltxb_shed_slb_shed_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxb_shed_slb_shed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.sltxb_shed_slb_shed_id_seq;
       public       postgres    false    307    3            '           0    0    sltxb_shed_slb_shed_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.sltxb_shed_slb_shed_id_seq OWNED BY public.sltxb_shed.slb_shed_id;
            public       postgres    false    308            5           1259    138369    sltxbr_shed    TABLE     �   CREATE TABLE public.sltxbr_shed (
    slbr_shed_id integer NOT NULL,
    slbroiler_detail_id integer NOT NULL,
    center_id integer NOT NULL,
    shed_id integer NOT NULL,
    lot character varying
);
    DROP TABLE public.sltxbr_shed;
       public         postgres    false    3            (           0    0    TABLE sltxbr_shed    COMMENT     {   COMMENT ON TABLE public.sltxbr_shed IS 'Almacena la relación entre galpón y programaciones de engorde de capa superior';
            public       postgres    false    309            )           0    0    COLUMN sltxbr_shed.slbr_shed_id    COMMENT     l   COMMENT ON COLUMN public.sltxbr_shed.slbr_shed_id IS 'ID de la relación galpón-programación de engorde';
            public       postgres    false    309            *           0    0 &   COLUMN sltxbr_shed.slbroiler_detail_id    COMMENT     a   COMMENT ON COLUMN public.sltxbr_shed.slbroiler_detail_id IS 'ID de la programación de engorde';
            public       postgres    false    309            +           0    0    COLUMN sltxbr_shed.center_id    COMMENT     w   COMMENT ON COLUMN public.sltxbr_shed.center_id IS 'ID del núcleo del galpón asociado a la programación de engorde';
            public       postgres    false    309            ,           0    0    COLUMN sltxbr_shed.shed_id    COMMENT     i   COMMENT ON COLUMN public.sltxbr_shed.shed_id IS 'ID del galpón asociado a la programación de engorde';
            public       postgres    false    309            -           0    0    COLUMN sltxbr_shed.lot    COMMENT     [   COMMENT ON COLUMN public.sltxbr_shed.lot IS 'Lote asociado a la programación de engorde';
            public       postgres    false    309            6           1259    138375    sltxbr_shed_slbr_shed_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxbr_shed_slbr_shed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.sltxbr_shed_slbr_shed_id_seq;
       public       postgres    false    3    309            .           0    0    sltxbr_shed_slbr_shed_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.sltxbr_shed_slbr_shed_id_seq OWNED BY public.sltxbr_shed.slbr_shed_id;
            public       postgres    false    310            7           1259    138377    sltxbreeding    TABLE     ,  CREATE TABLE public.sltxbreeding (
    slbreeding_id integer NOT NULL,
    stage_id integer NOT NULL,
    scenario_id integer NOT NULL,
    partnership_id integer NOT NULL,
    breed_id integer NOT NULL,
    farm_id integer NOT NULL,
    programmed_quantity integer NOT NULL,
    execution_quantity integer,
    housing_date date NOT NULL,
    execution_date date,
    start_posture_date date,
    mortality double precision,
    lot character varying,
    associated integer,
    decrease double precision,
    duration integer,
    sl_disable boolean
);
     DROP TABLE public.sltxbreeding;
       public         postgres    false    3            /           0    0    TABLE sltxbreeding    COMMENT     q   COMMENT ON TABLE public.sltxbreeding IS 'Almacena los registros de la sección de producción de capa superior';
            public       postgres    false    311            0           0    0 !   COLUMN sltxbreeding.slbreeding_id    COMMENT     `   COMMENT ON COLUMN public.sltxbreeding.slbreeding_id IS 'ID de la programación de producción';
            public       postgres    false    311            1           0    0    COLUMN sltxbreeding.stage_id    COMMENT     o   COMMENT ON COLUMN public.sltxbreeding.stage_id IS 'ID de la etapa asociada a la programación de producción';
            public       postgres    false    311            2           0    0    COLUMN sltxbreeding.scenario_id    COMMENT     �   COMMENT ON COLUMN public.sltxbreeding.scenario_id IS 'ID del escenario sobre el que fue creada la programación de producción';
            public       postgres    false    311            3           0    0 "   COLUMN sltxbreeding.partnership_id    COMMENT     �   COMMENT ON COLUMN public.sltxbreeding.partnership_id IS 'ID de la empresa sobre la que fue creada la programación de producción';
            public       postgres    false    311            4           0    0    COLUMN sltxbreeding.breed_id    COMMENT     {   COMMENT ON COLUMN public.sltxbreeding.breed_id IS 'ID de la raza sobre la que fue creada la programación de producción';
            public       postgres    false    311            5           0    0    COLUMN sltxbreeding.farm_id    COMMENT     |   COMMENT ON COLUMN public.sltxbreeding.farm_id IS 'ID de la granja sobre la que fue creada la programación de producción';
            public       postgres    false    311            6           0    0 '   COLUMN sltxbreeding.programmed_quantity    COMMENT     T   COMMENT ON COLUMN public.sltxbreeding.programmed_quantity IS 'Cantidad programada';
            public       postgres    false    311            7           0    0 &   COLUMN sltxbreeding.execution_quantity    COMMENT     R   COMMENT ON COLUMN public.sltxbreeding.execution_quantity IS 'Cantidad ejecutada';
            public       postgres    false    311            8           0    0     COLUMN sltxbreeding.housing_date    COMMENT     J   COMMENT ON COLUMN public.sltxbreeding.housing_date IS 'Fecha programada';
            public       postgres    false    311            9           0    0 "   COLUMN sltxbreeding.execution_date    COMMENT     K   COMMENT ON COLUMN public.sltxbreeding.execution_date IS 'Fecha ejecutada';
            public       postgres    false    311            :           0    0 &   COLUMN sltxbreeding.start_posture_date    COMMENT     Z   COMMENT ON COLUMN public.sltxbreeding.start_posture_date IS 'Fecha de inicio de postura';
            public       postgres    false    311            ;           0    0    COLUMN sltxbreeding.mortality    COMMENT     A   COMMENT ON COLUMN public.sltxbreeding.mortality IS 'Mortalidad';
            public       postgres    false    311            <           0    0    COLUMN sltxbreeding.lot    COMMENT     I   COMMENT ON COLUMN public.sltxbreeding.lot IS 'Lote de la programación';
            public       postgres    false    311            =           0    0    COLUMN sltxbreeding.associated    COMMENT     d   COMMENT ON COLUMN public.sltxbreeding.associated IS 'Indica si esta asociado a otra programación';
            public       postgres    false    311            >           0    0    COLUMN sltxbreeding.decrease    COMMENT     W   COMMENT ON COLUMN public.sltxbreeding.decrease IS 'Merma asociada a la programación';
            public       postgres    false    311            ?           0    0    COLUMN sltxbreeding.duration    COMMENT     Y   COMMENT ON COLUMN public.sltxbreeding.duration IS 'Tiempo estimado (días) del proceso';
            public       postgres    false    311            @           0    0    COLUMN sltxbreeding.sl_disable    COMMENT     V   COMMENT ON COLUMN public.sltxbreeding.sl_disable IS 'Indica programación eliminada';
            public       postgres    false    311            8           1259    138383    sltxbreeding_slbreeding_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxbreeding_slbreeding_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public.sltxbreeding_slbreeding_id_seq;
       public       postgres    false    3    311            A           0    0    sltxbreeding_slbreeding_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public.sltxbreeding_slbreeding_id_seq OWNED BY public.sltxbreeding.slbreeding_id;
            public       postgres    false    312            9           1259    138385    sltxbroiler    TABLE     5  CREATE TABLE public.sltxbroiler (
    slbroiler_id integer NOT NULL,
    scheduled_date date NOT NULL,
    scheduled_quantity integer NOT NULL,
    real_quantity integer,
    gender "char" NOT NULL,
    incubatorplant_id integer NOT NULL,
    sl_disable boolean,
    slincubator_detail_id integer NOT NULL
);
    DROP TABLE public.sltxbroiler;
       public         postgres    false    3            B           0    0    TABLE sltxbroiler    COMMENT     `   COMMENT ON TABLE public.sltxbroiler IS 'Almacena las proyecciones de engorde de capa superior';
            public       postgres    false    313            C           0    0    COLUMN sltxbroiler.slbroiler_id    COMMENT     M   COMMENT ON COLUMN public.sltxbroiler.slbroiler_id IS 'ID de la proyección';
            public       postgres    false    313            D           0    0 !   COLUMN sltxbroiler.scheduled_date    COMMENT     K   COMMENT ON COLUMN public.sltxbroiler.scheduled_date IS 'Fecha proyectada';
            public       postgres    false    313            E           0    0 %   COLUMN sltxbroiler.scheduled_quantity    COMMENT     R   COMMENT ON COLUMN public.sltxbroiler.scheduled_quantity IS 'Cantidad proyectada';
            public       postgres    false    313            F           0    0     COLUMN sltxbroiler.real_quantity    COMMENT     G   COMMENT ON COLUMN public.sltxbroiler.real_quantity IS 'Cantidad real';
            public       postgres    false    313            G           0    0    COLUMN sltxbroiler.gender    COMMENT     C   COMMENT ON COLUMN public.sltxbroiler.gender IS 'Sexo de las aves';
            public       postgres    false    313            H           0    0 $   COLUMN sltxbroiler.incubatorplant_id    COMMENT     X   COMMENT ON COLUMN public.sltxbroiler.incubatorplant_id IS 'ID de la planta incubadora';
            public       postgres    false    313            I           0    0    COLUMN sltxbroiler.sl_disable    COMMENT     S   COMMENT ON COLUMN public.sltxbroiler.sl_disable IS 'Indica proyección eliminada';
            public       postgres    false    313            J           0    0 (   COLUMN sltxbroiler.slincubator_detail_id    COMMENT     z   COMMENT ON COLUMN public.sltxbroiler.slincubator_detail_id IS 'ID de la programación de incubación de la que proviene';
            public       postgres    false    313            :           1259    138388    sltxbroiler_detail    TABLE     J  CREATE TABLE public.sltxbroiler_detail (
    slbroiler_detail_id integer NOT NULL,
    farm_id integer NOT NULL,
    housing_date date NOT NULL,
    housing_quantity integer NOT NULL,
    eviction_date date,
    eviction_quantity integer,
    category integer,
    age integer,
    weightgain double precision,
    synchronized boolean,
    lot character varying,
    order_p character varying,
    executed boolean,
    sl_disable boolean,
    youngmale integer,
    oldmale integer,
    peasantmale integer,
    youngfemale integer,
    oldfemale integer,
    slbroiler_id integer
);
 &   DROP TABLE public.sltxbroiler_detail;
       public         postgres    false    3            K           0    0    TABLE sltxbroiler_detail    COMMENT     i   COMMENT ON TABLE public.sltxbroiler_detail IS 'Almacena las programaciones de engorde de capa superior';
            public       postgres    false    314            L           0    0 -   COLUMN sltxbroiler_detail.slbroiler_detail_id    COMMENT     ]   COMMENT ON COLUMN public.sltxbroiler_detail.slbroiler_detail_id IS 'ID de la programación';
            public       postgres    false    314            M           0    0 !   COLUMN sltxbroiler_detail.farm_id    COMMENT     q   COMMENT ON COLUMN public.sltxbroiler_detail.farm_id IS 'ID de la granja sobre la que se creó la programación';
            public       postgres    false    314            N           0    0 &   COLUMN sltxbroiler_detail.housing_date    COMMENT     W   COMMENT ON COLUMN public.sltxbroiler_detail.housing_date IS 'Fecha de encasetamiento';
            public       postgres    false    314            O           0    0 *   COLUMN sltxbroiler_detail.housing_quantity    COMMENT     V   COMMENT ON COLUMN public.sltxbroiler_detail.housing_quantity IS 'Cantidad ejecutada';
            public       postgres    false    314            P           0    0 '   COLUMN sltxbroiler_detail.eviction_date    COMMENT     R   COMMENT ON COLUMN public.sltxbroiler_detail.eviction_date IS 'Fecha de desalojo';
            public       postgres    false    314            Q           0    0 +   COLUMN sltxbroiler_detail.eviction_quantity    COMMENT     Y   COMMENT ON COLUMN public.sltxbroiler_detail.eviction_quantity IS 'Cantidad de desalojo';
            public       postgres    false    314            R           0    0 "   COLUMN sltxbroiler_detail.category    COMMENT     ]   COMMENT ON COLUMN public.sltxbroiler_detail.category IS 'ID de la clasificación de sexaje';
            public       postgres    false    314            S           0    0    COLUMN sltxbroiler_detail.age    COMMENT     L   COMMENT ON COLUMN public.sltxbroiler_detail.age IS 'Edad para el desalojo';
            public       postgres    false    314            T           0    0 $   COLUMN sltxbroiler_detail.weightgain    COMMENT     K   COMMENT ON COLUMN public.sltxbroiler_detail.weightgain IS 'Peso promedio';
            public       postgres    false    314            U           0    0 &   COLUMN sltxbroiler_detail.synchronized    COMMENT     a   COMMENT ON COLUMN public.sltxbroiler_detail.synchronized IS 'Indica programación sincronizada';
            public       postgres    false    314            V           0    0    COLUMN sltxbroiler_detail.lot    COMMENT     e   COMMENT ON COLUMN public.sltxbroiler_detail.lot IS 'Indica lote para agrupación de programaciones';
            public       postgres    false    314            W           0    0 !   COLUMN sltxbroiler_detail.order_p    COMMENT     L   COMMENT ON COLUMN public.sltxbroiler_detail.order_p IS 'Orden previsional';
            public       postgres    false    314            X           0    0 "   COLUMN sltxbroiler_detail.executed    COMMENT     Q   COMMENT ON COLUMN public.sltxbroiler_detail.executed IS 'Indica lote ejecutado';
            public       postgres    false    314            Y           0    0 $   COLUMN sltxbroiler_detail.sl_disable    COMMENT     \   COMMENT ON COLUMN public.sltxbroiler_detail.sl_disable IS 'Indica programación eliminada';
            public       postgres    false    314            Z           0    0 #   COLUMN sltxbroiler_detail.youngmale    COMMENT     X   COMMENT ON COLUMN public.sltxbroiler_detail.youngmale IS 'Cantidad de machos jóvenes';
            public       postgres    false    314            [           0    0 !   COLUMN sltxbroiler_detail.oldmale    COMMENT     T   COMMENT ON COLUMN public.sltxbroiler_detail.oldmale IS 'Cantidad de machos viejos';
            public       postgres    false    314            \           0    0 %   COLUMN sltxbroiler_detail.peasantmale    COMMENT     \   COMMENT ON COLUMN public.sltxbroiler_detail.peasantmale IS 'Cantidad de machos campesinos';
            public       postgres    false    314            ]           0    0 %   COLUMN sltxbroiler_detail.youngfemale    COMMENT     [   COMMENT ON COLUMN public.sltxbroiler_detail.youngfemale IS 'Cantidad de hembras jóvenes';
            public       postgres    false    314            ^           0    0 #   COLUMN sltxbroiler_detail.oldfemale    COMMENT     W   COMMENT ON COLUMN public.sltxbroiler_detail.oldfemale IS 'Cantidad de hembras viejas';
            public       postgres    false    314            _           0    0 &   COLUMN sltxbroiler_detail.slbroiler_id    COMMENT     ^   COMMENT ON COLUMN public.sltxbroiler_detail.slbroiler_id IS 'ID de la proyección de origen';
            public       postgres    false    314            ;           1259    138394 *   sltxbroiler_detail_slbroiler_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxbroiler_detail_slbroiler_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 A   DROP SEQUENCE public.sltxbroiler_detail_slbroiler_detail_id_seq;
       public       postgres    false    314    3            `           0    0 *   sltxbroiler_detail_slbroiler_detail_id_seq    SEQUENCE OWNED BY     y   ALTER SEQUENCE public.sltxbroiler_detail_slbroiler_detail_id_seq OWNED BY public.sltxbroiler_detail.slbroiler_detail_id;
            public       postgres    false    315            <           1259    138396    sltxbroiler_lot    TABLE       CREATE TABLE public.sltxbroiler_lot (
    slbroiler_lot_id integer NOT NULL,
    slbroiler_detail_id integer NOT NULL,
    slbroiler_id integer,
    quantity integer NOT NULL,
    sl_disable boolean,
    slsellspurchase_id integer,
    gender "char" NOT NULL
);
 #   DROP TABLE public.sltxbroiler_lot;
       public         postgres    false    3            a           0    0    TABLE sltxbroiler_lot    COMMENT     �   COMMENT ON TABLE public.sltxbroiler_lot IS 'Almacena la relación entre proyecciones de engorde y compras de pollitos con programaciones de engorde de capa superior';
            public       postgres    false    316            b           0    0 '   COLUMN sltxbroiler_lot.slbroiler_lot_id    COMMENT     S   COMMENT ON COLUMN public.sltxbroiler_lot.slbroiler_lot_id IS 'ID de la relación';
            public       postgres    false    316            c           0    0 *   COLUMN sltxbroiler_lot.slbroiler_detail_id    COMMENT     e   COMMENT ON COLUMN public.sltxbroiler_lot.slbroiler_detail_id IS 'ID de la programación de engorde';
            public       postgres    false    316            d           0    0 #   COLUMN sltxbroiler_lot.slbroiler_id    COMMENT     \   COMMENT ON COLUMN public.sltxbroiler_lot.slbroiler_id IS 'ID de la proyección de engorde';
            public       postgres    false    316            e           0    0    COLUMN sltxbroiler_lot.quantity    COMMENT     M   COMMENT ON COLUMN public.sltxbroiler_lot.quantity IS 'Cantidad relacionada';
            public       postgres    false    316            f           0    0 !   COLUMN sltxbroiler_lot.sl_disable    COMMENT     d   COMMENT ON COLUMN public.sltxbroiler_lot.sl_disable IS 'Indica programación de engorde eliminada';
            public       postgres    false    316            g           0    0 )   COLUMN sltxbroiler_lot.slsellspurchase_id    COMMENT     ^   COMMENT ON COLUMN public.sltxbroiler_lot.slsellspurchase_id IS 'ID de la compra de pollitos';
            public       postgres    false    316            h           0    0    COLUMN sltxbroiler_lot.gender    COMMENT     G   COMMENT ON COLUMN public.sltxbroiler_lot.gender IS 'Sexo de las aves';
            public       postgres    false    316            =           1259    138399 $   sltxbroiler_lot_slbroiler_lot_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxbroiler_lot_slbroiler_lot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public.sltxbroiler_lot_slbroiler_lot_id_seq;
       public       postgres    false    316    3            i           0    0 $   sltxbroiler_lot_slbroiler_lot_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public.sltxbroiler_lot_slbroiler_lot_id_seq OWNED BY public.sltxbroiler_lot.slbroiler_lot_id;
            public       postgres    false    317            >           1259    138401    sltxbroiler_slbroiler_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxbroiler_slbroiler_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.sltxbroiler_slbroiler_id_seq;
       public       postgres    false    3    313            j           0    0    sltxbroiler_slbroiler_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.sltxbroiler_slbroiler_id_seq OWNED BY public.sltxbroiler.slbroiler_id;
            public       postgres    false    318            ?           1259    138403    sltxincubator    TABLE       CREATE TABLE public.sltxincubator (
    slincubator integer NOT NULL,
    scenario_id integer NOT NULL,
    incubatorplant_id integer,
    scheduled_date date NOT NULL,
    scheduled_quantity integer,
    eggsrequired integer NOT NULL,
    sl_disable boolean
);
 !   DROP TABLE public.sltxincubator;
       public         postgres    false    3            k           0    0    TABLE sltxincubator    COMMENT        COMMENT ON TABLE public.sltxincubator IS 'Almacena la programación de huevos por semanas para un escenario de capa superior';
            public       postgres    false    319            l           0    0     COLUMN sltxincubator.slincubator    COMMENT     M   COMMENT ON COLUMN public.sltxincubator.slincubator IS 'ID de los registros';
            public       postgres    false    319            m           0    0     COLUMN sltxincubator.scenario_id    COMMENT     c   COMMENT ON COLUMN public.sltxincubator.scenario_id IS 'ID del escenario asociado a los registros';
            public       postgres    false    319            n           0    0 &   COLUMN sltxincubator.incubatorplant_id    COMMENT     c   COMMENT ON COLUMN public.sltxincubator.incubatorplant_id IS 'ID de la planta incubadora asociada';
            public       postgres    false    319            o           0    0 #   COLUMN sltxincubator.scheduled_date    COMMENT     M   COMMENT ON COLUMN public.sltxincubator.scheduled_date IS 'Fecha proyectada';
            public       postgres    false    319            p           0    0 '   COLUMN sltxincubator.scheduled_quantity    COMMENT     T   COMMENT ON COLUMN public.sltxincubator.scheduled_quantity IS 'Cantidad proyectada';
            public       postgres    false    319            q           0    0 !   COLUMN sltxincubator.eggsrequired    COMMENT     W   COMMENT ON COLUMN public.sltxincubator.eggsrequired IS 'Cantidad demandada de huevos';
            public       postgres    false    319            r           0    0    COLUMN sltxincubator.sl_disable    COMMENT     W   COMMENT ON COLUMN public.sltxincubator.sl_disable IS 'Indica programación eliminada';
            public       postgres    false    319            @           1259    138406    sltxincubator_curve    TABLE     �   CREATE TABLE public.sltxincubator_curve (
    slincubator_curve_id integer NOT NULL,
    slposturecurve_id integer NOT NULL,
    slincubator_id integer NOT NULL,
    quantity integer NOT NULL,
    sl_disable boolean
);
 '   DROP TABLE public.sltxincubator_curve;
       public         postgres    false    3            s           0    0    TABLE sltxincubator_curve    COMMENT     �   COMMENT ON TABLE public.sltxincubator_curve IS 'Almacena la relación entre la producción de huevos en curva y la demanda de capa superior';
            public       postgres    false    320            t           0    0 /   COLUMN sltxincubator_curve.slincubator_curve_id    COMMENT     [   COMMENT ON COLUMN public.sltxincubator_curve.slincubator_curve_id IS 'ID de la relación';
            public       postgres    false    320            u           0    0 ,   COLUMN sltxincubator_curve.slposturecurve_id    COMMENT     _   COMMENT ON COLUMN public.sltxincubator_curve.slposturecurve_id IS 'ID de la curva de postura';
            public       postgres    false    320            v           0    0 )   COLUMN sltxincubator_curve.slincubator_id    COMMENT     S   COMMENT ON COLUMN public.sltxincubator_curve.slincubator_id IS 'ID de la demanda';
            public       postgres    false    320            w           0    0 #   COLUMN sltxincubator_curve.quantity    COMMENT     O   COMMENT ON COLUMN public.sltxincubator_curve.quantity IS 'Cantidad de huevos';
            public       postgres    false    320            x           0    0 %   COLUMN sltxincubator_curve.sl_disable    COMMENT     U   COMMENT ON COLUMN public.sltxincubator_curve.sl_disable IS 'Indica curva eliminada';
            public       postgres    false    320            A           1259    138409 ,   sltxincubator_curve_slincubator_curve_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxincubator_curve_slincubator_curve_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 C   DROP SEQUENCE public.sltxincubator_curve_slincubator_curve_id_seq;
       public       postgres    false    320    3            y           0    0 ,   sltxincubator_curve_slincubator_curve_id_seq    SEQUENCE OWNED BY     }   ALTER SEQUENCE public.sltxincubator_curve_slincubator_curve_id_seq OWNED BY public.sltxincubator_curve.slincubator_curve_id;
            public       postgres    false    321            B           1259    138411    sltxincubator_detail    TABLE     �  CREATE TABLE public.sltxincubator_detail (
    slincubator_detail_id integer NOT NULL,
    incubator_id integer NOT NULL,
    programmed_date date NOT NULL,
    slmachinegroup_id integer NOT NULL,
    programmed_quantity integer NOT NULL,
    associated integer,
    decrease double precision,
    real_decrease double precision,
    duration integer,
    sl_disable boolean,
    identifier character varying NOT NULL
);
 (   DROP TABLE public.sltxincubator_detail;
       public         postgres    false    3            z           0    0    TABLE sltxincubator_detail    COMMENT     o   COMMENT ON TABLE public.sltxincubator_detail IS 'Almacena las programaciones de incubación de capa superior';
            public       postgres    false    322            {           0    0 1   COLUMN sltxincubator_detail.slincubator_detail_id    COMMENT     a   COMMENT ON COLUMN public.sltxincubator_detail.slincubator_detail_id IS 'ID de la programación';
            public       postgres    false    322            |           0    0 (   COLUMN sltxincubator_detail.incubator_id    COMMENT     k   COMMENT ON COLUMN public.sltxincubator_detail.incubator_id IS 'ID de la proyección de demanda de origen';
            public       postgres    false    322            }           0    0 +   COLUMN sltxincubator_detail.programmed_date    COMMENT     U   COMMENT ON COLUMN public.sltxincubator_detail.programmed_date IS 'Fecha programada';
            public       postgres    false    322            ~           0    0 -   COLUMN sltxincubator_detail.slmachinegroup_id    COMMENT     j   COMMENT ON COLUMN public.sltxincubator_detail.slmachinegroup_id IS 'ID del grupo de máquinas asociadas';
            public       postgres    false    322                       0    0 /   COLUMN sltxincubator_detail.programmed_quantity    COMMENT     \   COMMENT ON COLUMN public.sltxincubator_detail.programmed_quantity IS 'Cantidad programada';
            public       postgres    false    322            �           0    0 &   COLUMN sltxincubator_detail.associated    COMMENT     l   COMMENT ON COLUMN public.sltxincubator_detail.associated IS 'Indica si esta asociado a otra programación';
            public       postgres    false    322            �           0    0 $   COLUMN sltxincubator_detail.decrease    COMMENT     C   COMMENT ON COLUMN public.sltxincubator_detail.decrease IS 'Merma';
            public       postgres    false    322            �           0    0 )   COLUMN sltxincubator_detail.real_decrease    COMMENT     M   COMMENT ON COLUMN public.sltxincubator_detail.real_decrease IS 'Merma real';
            public       postgres    false    322            �           0    0 $   COLUMN sltxincubator_detail.duration    COMMENT     n   COMMENT ON COLUMN public.sltxincubator_detail.duration IS 'Tiempo de duración (días) estimado del proceso';
            public       postgres    false    322            �           0    0 &   COLUMN sltxincubator_detail.sl_disable    COMMENT     ^   COMMENT ON COLUMN public.sltxincubator_detail.sl_disable IS 'Indica programación eliminada';
            public       postgres    false    322            �           0    0 &   COLUMN sltxincubator_detail.identifier    COMMENT     a   COMMENT ON COLUMN public.sltxincubator_detail.identifier IS 'Identificador de la programación';
            public       postgres    false    322            C           1259    138417 .   sltxincubator_detail_slincubator_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxincubator_detail_slincubator_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 E   DROP SEQUENCE public.sltxincubator_detail_slincubator_detail_id_seq;
       public       postgres    false    322    3            �           0    0 .   sltxincubator_detail_slincubator_detail_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.sltxincubator_detail_slincubator_detail_id_seq OWNED BY public.sltxincubator_detail.slincubator_detail_id;
            public       postgres    false    323            D           1259    138419    sltxincubator_lot    TABLE     �   CREATE TABLE public.sltxincubator_lot (
    slincubator_lot_id integer NOT NULL,
    slincubator_detail_id integer NOT NULL,
    slincubator_curve_id integer,
    quantity integer NOT NULL,
    sl_disable boolean,
    slsellspurchase_id integer
);
 %   DROP TABLE public.sltxincubator_lot;
       public         postgres    false    3            �           0    0    TABLE sltxincubator_lot    COMMENT     �   COMMENT ON TABLE public.sltxincubator_lot IS 'Almacena la relación entre las programaciones de incubación y las curvas de postura de origen de capa superior';
            public       postgres    false    324            �           0    0 +   COLUMN sltxincubator_lot.slincubator_lot_id    COMMENT     W   COMMENT ON COLUMN public.sltxincubator_lot.slincubator_lot_id IS 'ID de la relación';
            public       postgres    false    324            �           0    0 .   COLUMN sltxincubator_lot.slincubator_detail_id    COMMENT     m   COMMENT ON COLUMN public.sltxincubator_lot.slincubator_detail_id IS 'ID de la programación de incubación';
            public       postgres    false    324            �           0    0 -   COLUMN sltxincubator_lot.slincubator_curve_id    COMMENT     d   COMMENT ON COLUMN public.sltxincubator_lot.slincubator_curve_id IS 'ID de la proyección de curva';
            public       postgres    false    324            �           0    0 !   COLUMN sltxincubator_lot.quantity    COMMENT     N   COMMENT ON COLUMN public.sltxincubator_lot.quantity IS 'Cantidad programada';
            public       postgres    false    324            �           0    0 #   COLUMN sltxincubator_lot.sl_disable    COMMENT     X   COMMENT ON COLUMN public.sltxincubator_lot.sl_disable IS 'Indica registros eliminados';
            public       postgres    false    324            �           0    0 +   COLUMN sltxincubator_lot.slsellspurchase_id    COMMENT     _   COMMENT ON COLUMN public.sltxincubator_lot.slsellspurchase_id IS 'ID de las compras de huevo';
            public       postgres    false    324            E           1259    138422 (   sltxincubator_lot_slincubator_lot_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxincubator_lot_slincubator_lot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ?   DROP SEQUENCE public.sltxincubator_lot_slincubator_lot_id_seq;
       public       postgres    false    3    324            �           0    0 (   sltxincubator_lot_slincubator_lot_id_seq    SEQUENCE OWNED BY     u   ALTER SEQUENCE public.sltxincubator_lot_slincubator_lot_id_seq OWNED BY public.sltxincubator_lot.slincubator_lot_id;
            public       postgres    false    325            F           1259    138424    sltxincubator_slincubator_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxincubator_slincubator_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.sltxincubator_slincubator_seq;
       public       postgres    false    319    3            �           0    0    sltxincubator_slincubator_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.sltxincubator_slincubator_seq OWNED BY public.sltxincubator.slincubator;
            public       postgres    false    326            G           1259    138426    sltxinventory    TABLE     �   CREATE TABLE public.sltxinventory (
    slinventory_id integer NOT NULL,
    scenario_id integer NOT NULL,
    week_date date NOT NULL,
    execution_eggs integer,
    execution_plexus_eggs integer
);
 !   DROP TABLE public.sltxinventory;
       public         postgres    false    3            �           0    0    TABLE sltxinventory    COMMENT     c   COMMENT ON TABLE public.sltxinventory IS 'Almacena los datos de los inventarios de capa superior';
            public       postgres    false    327            �           0    0 #   COLUMN sltxinventory.slinventory_id    COMMENT     [   COMMENT ON COLUMN public.sltxinventory.slinventory_id IS 'ID del registro de inventarios';
            public       postgres    false    327            �           0    0     COLUMN sltxinventory.scenario_id    COMMENT     a   COMMENT ON COLUMN public.sltxinventory.scenario_id IS 'ID del escenario asociado al inventario';
            public       postgres    false    327            �           0    0    COLUMN sltxinventory.week_date    COMMENT     Q   COMMENT ON COLUMN public.sltxinventory.week_date IS 'Fecha de inicio de semana';
            public       postgres    false    327            �           0    0 #   COLUMN sltxinventory.execution_eggs    COMMENT     z   COMMENT ON COLUMN public.sltxinventory.execution_eggs IS 'Huevos ejecutados correspondientes a la semana del inventario';
            public       postgres    false    327            �           0    0 *   COLUMN sltxinventory.execution_plexus_eggs    COMMENT     h   COMMENT ON COLUMN public.sltxinventory.execution_plexus_eggs IS 'Cantidad de huevos plexus ejecutados';
            public       postgres    false    327            H           1259    138429     sltxinventory_slinventory_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxinventory_slinventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.sltxinventory_slinventory_id_seq;
       public       postgres    false    3    327            �           0    0     sltxinventory_slinventory_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.sltxinventory_slinventory_id_seq OWNED BY public.sltxinventory.slinventory_id;
            public       postgres    false    328            I           1259    138431    sltxlb_shed    TABLE     �   CREATE TABLE public.sltxlb_shed (
    sllb_shed_id integer NOT NULL,
    slliftbreeding_id integer NOT NULL,
    center_id integer NOT NULL,
    shed_id integer NOT NULL
);
    DROP TABLE public.sltxlb_shed;
       public         postgres    false    3            �           0    0    TABLE sltxlb_shed    COMMENT     �   COMMENT ON TABLE public.sltxlb_shed IS 'Almacena la relación entre galpones y programaciones de cría y levante de capa superior';
            public       postgres    false    329            �           0    0    COLUMN sltxlb_shed.sllb_shed_id    COMMENT     K   COMMENT ON COLUMN public.sltxlb_shed.sllb_shed_id IS 'ID de la relación';
            public       postgres    false    329            �           0    0 $   COLUMN sltxlb_shed.slliftbreeding_id    COMMENT     g   COMMENT ON COLUMN public.sltxlb_shed.slliftbreeding_id IS 'ID de la programación de cría y levante';
            public       postgres    false    329            �           0    0    COLUMN sltxlb_shed.center_id    COMMENT        COMMENT ON COLUMN public.sltxlb_shed.center_id IS 'ID del núcleo del galpón asociado a la programación de cría y levante';
            public       postgres    false    329            �           0    0    COLUMN sltxlb_shed.shed_id    COMMENT     q   COMMENT ON COLUMN public.sltxlb_shed.shed_id IS 'ID del galpón asociado a la programación de cría y levante';
            public       postgres    false    329            J           1259    138434    sltxlb_shed_sllb_shed_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxlb_shed_sllb_shed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.sltxlb_shed_sllb_shed_id_seq;
       public       postgres    false    3    329            �           0    0    sltxlb_shed_sllb_shed_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.sltxlb_shed_sllb_shed_id_seq OWNED BY public.sltxlb_shed.sllb_shed_id;
            public       postgres    false    330            K           1259    138436    sltxliftbreeding    TABLE     �  CREATE TABLE public.sltxliftbreeding (
    slliftbreeding_id integer NOT NULL,
    stage_id integer NOT NULL,
    scenario_id integer NOT NULL,
    partnership_id integer NOT NULL,
    breed_id integer NOT NULL,
    farm_id integer NOT NULL,
    scheduled_date date NOT NULL,
    execution_date date,
    demand_birds integer,
    received_birds integer,
    associated integer,
    decrease double precision,
    duration integer,
    slbreeding_id integer NOT NULL,
    sl_disable boolean
);
 $   DROP TABLE public.sltxliftbreeding;
       public         postgres    false    3            �           0    0    TABLE sltxliftbreeding    COMMENT     o   COMMENT ON TABLE public.sltxliftbreeding IS 'Almacena las programaciones de cría y levante de capa superior';
            public       postgres    false    331            �           0    0 )   COLUMN sltxliftbreeding.slliftbreeding_id    COMMENT     Y   COMMENT ON COLUMN public.sltxliftbreeding.slliftbreeding_id IS 'ID de la programación';
            public       postgres    false    331            �           0    0     COLUMN sltxliftbreeding.stage_id    COMMENT     \   COMMENT ON COLUMN public.sltxliftbreeding.stage_id IS 'ID de la etapa asociada al proceso';
            public       postgres    false    331            �           0    0 #   COLUMN sltxliftbreeding.scenario_id    COMMENT     t   COMMENT ON COLUMN public.sltxliftbreeding.scenario_id IS 'ID del escenario sobre el que se creó la programación';
            public       postgres    false    331            �           0    0 &   COLUMN sltxliftbreeding.partnership_id    COMMENT     w   COMMENT ON COLUMN public.sltxliftbreeding.partnership_id IS 'ID de la empresa sobre la que se creó la programación';
            public       postgres    false    331            �           0    0     COLUMN sltxliftbreeding.breed_id    COMMENT     n   COMMENT ON COLUMN public.sltxliftbreeding.breed_id IS 'ID de la raza sobre la que se creó la programación';
            public       postgres    false    331            �           0    0    COLUMN sltxliftbreeding.farm_id    COMMENT     o   COMMENT ON COLUMN public.sltxliftbreeding.farm_id IS 'ID de la granja sobre la que se creó la programación';
            public       postgres    false    331            �           0    0 &   COLUMN sltxliftbreeding.scheduled_date    COMMENT     P   COMMENT ON COLUMN public.sltxliftbreeding.scheduled_date IS 'Fecha programada';
            public       postgres    false    331            �           0    0 &   COLUMN sltxliftbreeding.execution_date    COMMENT     O   COMMENT ON COLUMN public.sltxliftbreeding.execution_date IS 'Fecha ejecutada';
            public       postgres    false    331            �           0    0 $   COLUMN sltxliftbreeding.demand_birds    COMMENT     J   COMMENT ON COLUMN public.sltxliftbreeding.demand_birds IS 'Aves pedidas';
            public       postgres    false    331            �           0    0 &   COLUMN sltxliftbreeding.received_birds    COMMENT     N   COMMENT ON COLUMN public.sltxliftbreeding.received_birds IS 'Aves recibidas';
            public       postgres    false    331            �           0    0 "   COLUMN sltxliftbreeding.associated    COMMENT     h   COMMENT ON COLUMN public.sltxliftbreeding.associated IS 'Indica si esta asociado a otra programación';
            public       postgres    false    331            �           0    0     COLUMN sltxliftbreeding.decrease    COMMENT     ?   COMMENT ON COLUMN public.sltxliftbreeding.decrease IS 'Merma';
            public       postgres    false    331            �           0    0     COLUMN sltxliftbreeding.duration    COMMENT     j   COMMENT ON COLUMN public.sltxliftbreeding.duration IS 'Tiempo de duración (días) estimado del proceso';
            public       postgres    false    331            �           0    0 %   COLUMN sltxliftbreeding.slbreeding_id    COMMENT     n   COMMENT ON COLUMN public.sltxliftbreeding.slbreeding_id IS 'ID de la programación de producción de origen';
            public       postgres    false    331            �           0    0 "   COLUMN sltxliftbreeding.sl_disable    COMMENT     Z   COMMENT ON COLUMN public.sltxliftbreeding.sl_disable IS 'Indica programación eliminada';
            public       postgres    false    331            L           1259    138439 &   sltxliftbreeding_slliftbreeding_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxliftbreeding_slliftbreeding_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 =   DROP SEQUENCE public.sltxliftbreeding_slliftbreeding_id_seq;
       public       postgres    false    331    3            �           0    0 &   sltxliftbreeding_slliftbreeding_id_seq    SEQUENCE OWNED BY     q   ALTER SEQUENCE public.sltxliftbreeding_slliftbreeding_id_seq OWNED BY public.sltxliftbreeding.slliftbreeding_id;
            public       postgres    false    332            M           1259    138441    sltxposturecurve    TABLE     Y  CREATE TABLE public.sltxposturecurve (
    slposturecurve_id integer NOT NULL,
    scenario_id integer NOT NULL,
    breed_id integer NOT NULL,
    slbreeding_id integer NOT NULL,
    weekly_curve double precision NOT NULL,
    posture_date date NOT NULL,
    posture_quantity integer NOT NULL,
    associated integer,
    sl_disable boolean
);
 $   DROP TABLE public.sltxposturecurve;
       public         postgres    false    3            �           0    0    TABLE sltxposturecurve    COMMENT     `   COMMENT ON TABLE public.sltxposturecurve IS 'Almacenaa las curvas de postura de capa superior';
            public       postgres    false    333            �           0    0 )   COLUMN sltxposturecurve.slposturecurve_id    COMMENT     m   COMMENT ON COLUMN public.sltxposturecurve.slposturecurve_id IS 'ID de los registros de la curva de postura';
            public       postgres    false    333            �           0    0 #   COLUMN sltxposturecurve.scenario_id    COMMENT     y   COMMENT ON COLUMN public.sltxposturecurve.scenario_id IS 'ID del escenario sobre el que fue creada la curva de postura';
            public       postgres    false    333            �           0    0     COLUMN sltxposturecurve.breed_id    COMMENT     f   COMMENT ON COLUMN public.sltxposturecurve.breed_id IS 'ID de la raza asociada a la curva de postura';
            public       postgres    false    333            �           0    0 %   COLUMN sltxposturecurve.slbreeding_id    COMMENT     �   COMMENT ON COLUMN public.sltxposturecurve.slbreeding_id IS 'ID de la progrmación de producción de donde proviene la curva de postura';
            public       postgres    false    333            �           0    0 $   COLUMN sltxposturecurve.weekly_curve    COMMENT     X   COMMENT ON COLUMN public.sltxposturecurve.weekly_curve IS 'Cantidad de huevos semanal';
            public       postgres    false    333            �           0    0 $   COLUMN sltxposturecurve.posture_date    COMMENT     N   COMMENT ON COLUMN public.sltxposturecurve.posture_date IS 'Fecha de postura';
            public       postgres    false    333            �           0    0 (   COLUMN sltxposturecurve.posture_quantity    COMMENT     U   COMMENT ON COLUMN public.sltxposturecurve.posture_quantity IS 'Cantidad de postura';
            public       postgres    false    333            �           0    0 "   COLUMN sltxposturecurve.associated    COMMENT     h   COMMENT ON COLUMN public.sltxposturecurve.associated IS 'Indica si esta asociado a otra programación';
            public       postgres    false    333            �           0    0 "   COLUMN sltxposturecurve.sl_disable    COMMENT     ]   COMMENT ON COLUMN public.sltxposturecurve.sl_disable IS 'Indica curva de postura eliminada';
            public       postgres    false    333            N           1259    138444 &   sltxposturecurve_slposturecurve_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxposturecurve_slposturecurve_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 =   DROP SEQUENCE public.sltxposturecurve_slposturecurve_id_seq;
       public       postgres    false    3    333            �           0    0 &   sltxposturecurve_slposturecurve_id_seq    SEQUENCE OWNED BY     q   ALTER SEQUENCE public.sltxposturecurve_slposturecurve_id_seq OWNED BY public.sltxposturecurve.slposturecurve_id;
            public       postgres    false    334            O           1259    138446    sltxsellspurchase    TABLE     �  CREATE TABLE public.sltxsellspurchase (
    slsellspurchase_id integer NOT NULL,
    scenario_id integer NOT NULL,
    programmed_date date NOT NULL,
    concept character varying NOT NULL,
    quantity integer NOT NULL,
    type character varying NOT NULL,
    breed_id integer NOT NULL,
    description character varying NOT NULL,
    sl_disable boolean,
    lot character varying
);
 %   DROP TABLE public.sltxsellspurchase;
       public         postgres    false    3            �           0    0    TABLE sltxsellspurchase    COMMENT     _   COMMENT ON TABLE public.sltxsellspurchase IS 'Almacena las compras y ventas de capa superior';
            public       postgres    false    335            �           0    0 +   COLUMN sltxsellspurchase.slsellspurchase_id    COMMENT     Z   COMMENT ON COLUMN public.sltxsellspurchase.slsellspurchase_id IS 'ID de la compra/venta';
            public       postgres    false    335            �           0    0 $   COLUMN sltxsellspurchase.scenario_id    COMMENT     w   COMMENT ON COLUMN public.sltxsellspurchase.scenario_id IS 'ID del escenario sobre el que se realizó la compra/venta';
            public       postgres    false    335            �           0    0 (   COLUMN sltxsellspurchase.programmed_date    COMMENT     h   COMMENT ON COLUMN public.sltxsellspurchase.programmed_date IS 'Fecha de ejecución de la compra/venta';
            public       postgres    false    335            �           0    0     COLUMN sltxsellspurchase.concept    COMMENT     ^   COMMENT ON COLUMN public.sltxsellspurchase.concept IS 'Tipo de la operación (compra/venta)';
            public       postgres    false    335            �           0    0 !   COLUMN sltxsellspurchase.quantity    COMMENT     V   COMMENT ON COLUMN public.sltxsellspurchase.quantity IS 'Cantidad de la compra/venta';
            public       postgres    false    335            �           0    0    COLUMN sltxsellspurchase.type    COMMENT     ]   COMMENT ON COLUMN public.sltxsellspurchase.type IS 'Producto referencia de la compra/venta';
            public       postgres    false    335            �           0    0 !   COLUMN sltxsellspurchase.breed_id    COMMENT     c   COMMENT ON COLUMN public.sltxsellspurchase.breed_id IS 'ID de la raza asociada a la compra/venta';
            public       postgres    false    335            �           0    0 $   COLUMN sltxsellspurchase.description    COMMENT     ]   COMMENT ON COLUMN public.sltxsellspurchase.description IS 'Descripción de la compra/venta';
            public       postgres    false    335            �           0    0 #   COLUMN sltxsellspurchase.sl_disable    COMMENT     Z   COMMENT ON COLUMN public.sltxsellspurchase.sl_disable IS 'Indica compra/venta eliminada';
            public       postgres    false    335            �           0    0    COLUMN sltxsellspurchase.lot    COMMENT     D   COMMENT ON COLUMN public.sltxsellspurchase.lot IS 'Lote de compra';
            public       postgres    false    335            P           1259    138452 (   sltxsellspurchase_slsellspurchase_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxsellspurchase_slsellspurchase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ?   DROP SEQUENCE public.sltxsellspurchase_slsellspurchase_id_seq;
       public       postgres    false    335    3            �           0    0 (   sltxsellspurchase_slsellspurchase_id_seq    SEQUENCE OWNED BY     u   ALTER SEQUENCE public.sltxsellspurchase_slsellspurchase_id_seq OWNED BY public.sltxsellspurchase.slsellspurchase_id;
            public       postgres    false    336            Q           1259    138454    txadjustmentscontrol    TABLE     �   CREATE TABLE public.txadjustmentscontrol (
    adjustmentscontrol_id integer NOT NULL,
    username character varying(250) NOT NULL,
    adjustment_date date NOT NULL,
    lot_arp character varying NOT NULL,
    description character varying
);
 (   DROP TABLE public.txadjustmentscontrol;
       public         postgres    false    3            �           0    0    TABLE txadjustmentscontrol    COMMENT     c   COMMENT ON TABLE public.txadjustmentscontrol IS 'Almacena la información de ajustes a los lotes';
            public       postgres    false    337            �           0    0 1   COLUMN txadjustmentscontrol.adjustmentscontrol_id    COMMENT     X   COMMENT ON COLUMN public.txadjustmentscontrol.adjustmentscontrol_id IS 'ID del ajuste';
            public       postgres    false    337            �           0    0 $   COLUMN txadjustmentscontrol.username    COMMENT     f   COMMENT ON COLUMN public.txadjustmentscontrol.username IS 'Alias del usuario que realizó el ajuste';
            public       postgres    false    337            �           0    0 +   COLUMN txadjustmentscontrol.adjustment_date    COMMENT     g   COMMENT ON COLUMN public.txadjustmentscontrol.adjustment_date IS 'Fecha en que se realizó el ajuste';
            public       postgres    false    337            �           0    0 #   COLUMN txadjustmentscontrol.lot_arp    COMMENT     a   COMMENT ON COLUMN public.txadjustmentscontrol.lot_arp IS 'Lote al que se le realizó el ajuste';
            public       postgres    false    337            �           0    0 '   COLUMN txadjustmentscontrol.description    COMMENT     h   COMMENT ON COLUMN public.txadjustmentscontrol.description IS 'Breve descripción del ajuste realizado';
            public       postgres    false    337            R           1259    138460 .   txadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txadjustmentscontrol_adjustmentscontrol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 E   DROP SEQUENCE public.txadjustmentscontrol_adjustmentscontrol_id_seq;
       public       postgres    false    337    3            �           0    0 .   txadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.txadjustmentscontrol_adjustmentscontrol_id_seq OWNED BY public.txadjustmentscontrol.adjustmentscontrol_id;
            public       postgres    false    338            S           1259    138462    txavailabilitysheds    TABLE       CREATE TABLE public.txavailabilitysheds (
    availability_shed_id integer DEFAULT nextval('public.availability_shed_id_seq'::regclass) NOT NULL,
    shed_id integer NOT NULL,
    init_date date,
    end_date date,
    lot_code character varying(20) NOT NULL
);
 '   DROP TABLE public.txavailabilitysheds;
       public         postgres    false    215    3            �           0    0    TABLE txavailabilitysheds    COMMENT     �   COMMENT ON TABLE public.txavailabilitysheds IS 'Almacena la disponibilidad en fechas de los galpones de acuerdo a la programación establecida';
            public       postgres    false    339            �           0    0 /   COLUMN txavailabilitysheds.availability_shed_id    COMMENT     �   COMMENT ON COLUMN public.txavailabilitysheds.availability_shed_id IS 'ID de la disponibilidad del almacén, indicando si este está disponible';
            public       postgres    false    339            �           0    0 "   COLUMN txavailabilitysheds.shed_id    COMMENT     J   COMMENT ON COLUMN public.txavailabilitysheds.shed_id IS 'ID del galpón';
            public       postgres    false    339            �           0    0 $   COLUMN txavailabilitysheds.init_date    COMMENT     t   COMMENT ON COLUMN public.txavailabilitysheds.init_date IS 'Fecha de inicio de la programación de uso del galpón';
            public       postgres    false    339            �           0    0 #   COLUMN txavailabilitysheds.end_date    COMMENT     t   COMMENT ON COLUMN public.txavailabilitysheds.end_date IS 'Fecha de cerrado de la programación de uso del galpón';
            public       postgres    false    339            �           0    0 #   COLUMN txavailabilitysheds.lot_code    COMMENT     Y   COMMENT ON COLUMN public.txavailabilitysheds.lot_code IS 'Código del lote del galpón';
            public       postgres    false    339            T           1259    138466 	   txbroiler    TABLE     �  CREATE TABLE public.txbroiler (
    broiler_id integer DEFAULT nextval('public.broiler_id_seq'::regclass) NOT NULL,
    projected_date date,
    projected_quantity integer,
    partnership_id integer NOT NULL,
    scenario_id integer NOT NULL,
    breed_id integer NOT NULL,
    lot_incubator character varying(45) NOT NULL,
    programmed_eggs_id integer NOT NULL,
    evictionprojected boolean
);
    DROP TABLE public.txbroiler;
       public         postgres    false    219    3            �           0    0    TABLE txbroiler    COMMENT     e   COMMENT ON TABLE public.txbroiler IS 'Almacena la proyección realizada para el módulo de engorde';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.broiler_id    COMMENT     V   COMMENT ON COLUMN public.txbroiler.broiler_id IS 'ID de la programación de engorde';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.projected_date    COMMENT     X   COMMENT ON COLUMN public.txbroiler.projected_date IS 'Fecha de proyección de engorde';
            public       postgres    false    340            �           0    0 #   COLUMN txbroiler.projected_quantity    COMMENT     `   COMMENT ON COLUMN public.txbroiler.projected_quantity IS 'Cantidad proyectada para el engorde';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.partnership_id    COMMENT     I   COMMENT ON COLUMN public.txbroiler.partnership_id IS 'ID de la empresa';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.scenario_id    COMMENT     G   COMMENT ON COLUMN public.txbroiler.scenario_id IS 'ID del escenario ';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.breed_id    COMMENT     K   COMMENT ON COLUMN public.txbroiler.breed_id IS 'ID de la raza a engordar';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.lot_incubator    COMMENT     u   COMMENT ON COLUMN public.txbroiler.lot_incubator IS 'Lote de incubación de donde provienen los huevos proyectados';
            public       postgres    false    340            �           0    0 #   COLUMN txbroiler.programmed_eggs_id    COMMENT     Y   COMMENT ON COLUMN public.txbroiler.programmed_eggs_id IS 'ID de los huevos programados';
            public       postgres    false    340            �           0    0 "   COLUMN txbroiler.evictionprojected    COMMENT     w   COMMENT ON COLUMN public.txbroiler.evictionprojected IS 'Indica si viene de una programación previamente desalojada';
            public       postgres    false    340            U           1259    138470    txbroiler_detail    TABLE     �  CREATE TABLE public.txbroiler_detail (
    broiler_detail_id integer DEFAULT nextval('public.broiler_detail_id_seq'::regclass) NOT NULL,
    broiler_id integer NOT NULL,
    scheduled_date date,
    scheduled_quantity integer,
    farm_id integer NOT NULL,
    shed_id integer NOT NULL,
    confirm integer,
    execution_date date,
    execution_quantity integer,
    lot character varying(25) NOT NULL,
    broiler_product_id integer,
    center_id integer NOT NULL,
    executionfarm_id integer,
    executioncenter_id integer,
    executionshed_id integer,
    programmed_disable boolean,
    synchronized boolean,
    order_p character varying,
    lot_sap character varying,
    tight boolean,
    eviction boolean,
    closed_lot boolean
);
 $   DROP TABLE public.txbroiler_detail;
       public         postgres    false    218    3            �           0    0    TABLE txbroiler_detail    COMMENT     n   COMMENT ON TABLE public.txbroiler_detail IS 'Almacena la programación y ejecucción del proceso de engorde';
            public       postgres    false    341            �           0    0 )   COLUMN txbroiler_detail.broiler_detail_id    COMMENT     `   COMMENT ON COLUMN public.txbroiler_detail.broiler_detail_id IS 'ID de los detalles de engorde';
            public       postgres    false    341            �           0    0 "   COLUMN txbroiler_detail.broiler_id    COMMENT     ]   COMMENT ON COLUMN public.txbroiler_detail.broiler_id IS 'ID de la programación de engorde';
            public       postgres    false    341            �           0    0 &   COLUMN txbroiler_detail.scheduled_date    COMMENT     k   COMMENT ON COLUMN public.txbroiler_detail.scheduled_date IS 'Fecha programada para el proceso de engorde';
            public       postgres    false    341            �           0    0 *   COLUMN txbroiler_detail.scheduled_quantity    COMMENT     r   COMMENT ON COLUMN public.txbroiler_detail.scheduled_quantity IS 'Cantidad programada para el proceso de engorde';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.farm_id    COMMENT     H   COMMENT ON COLUMN public.txbroiler_detail.farm_id IS 'ID de la granja';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.shed_id    COMMENT     G   COMMENT ON COLUMN public.txbroiler_detail.shed_id IS 'ID del galpón';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.confirm    COMMENT     F   COMMENT ON COLUMN public.txbroiler_detail.confirm IS 'Confirmación';
            public       postgres    false    341            �           0    0 &   COLUMN txbroiler_detail.execution_date    COMMENT     r   COMMENT ON COLUMN public.txbroiler_detail.execution_date IS 'Fecha de ejección de la planificación de engorde';
            public       postgres    false    341            �           0    0 *   COLUMN txbroiler_detail.execution_quantity    COMMENT     u   COMMENT ON COLUMN public.txbroiler_detail.execution_quantity IS 'Cantidad ejecutada de la programación de engorde';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.lot    COMMENT     D   COMMENT ON COLUMN public.txbroiler_detail.lot IS 'Lote de engorde';
            public       postgres    false    341            �           0    0 *   COLUMN txbroiler_detail.broiler_product_id    COMMENT     ^   COMMENT ON COLUMN public.txbroiler_detail.broiler_product_id IS 'ID del producto de engorde';
            public       postgres    false    341            �           0    0 !   COLUMN txbroiler_detail.center_id    COMMENT     e   COMMENT ON COLUMN public.txbroiler_detail.center_id IS 'ID del núcleo asignado a la programación';
            public       postgres    false    341            �           0    0 (   COLUMN txbroiler_detail.executionfarm_id    COMMENT     x   COMMENT ON COLUMN public.txbroiler_detail.executionfarm_id IS 'ID de la granja en la que se ejecutó la programación';
            public       postgres    false    341            �           0    0 *   COLUMN txbroiler_detail.executioncenter_id    COMMENT     y   COMMENT ON COLUMN public.txbroiler_detail.executioncenter_id IS 'ID del núcleo en el que se ejecutó la programación';
            public       postgres    false    341            �           0    0 (   COLUMN txbroiler_detail.executionshed_id    COMMENT     w   COMMENT ON COLUMN public.txbroiler_detail.executionshed_id IS 'ID del galpón en el que se ejecutó la programación';
            public       postgres    false    341            �           0    0 *   COLUMN txbroiler_detail.programmed_disable    COMMENT     l   COMMENT ON COLUMN public.txbroiler_detail.programmed_disable IS 'Indica si la programación fue eliminada';
            public       postgres    false    341            �           0    0 $   COLUMN txbroiler_detail.synchronized    COMMENT     [   COMMENT ON COLUMN public.txbroiler_detail.synchronized IS 'Indica si ya fue sincronizado';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.order_p    COMMENT     _   COMMENT ON COLUMN public.txbroiler_detail.order_p IS 'Indica el número de orden previsional';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.lot_sap    COMMENT     Y   COMMENT ON COLUMN public.txbroiler_detail.lot_sap IS 'Indica el número de lote en SAP';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.tight    COMMENT     M   COMMENT ON COLUMN public.txbroiler_detail.tight IS 'Indica si fue ajustado';
            public       postgres    false    341            �           0    0     COLUMN txbroiler_detail.eviction    COMMENT     U   COMMENT ON COLUMN public.txbroiler_detail.eviction IS 'Indica si ya fue desalojado';
            public       postgres    false    341            V           1259    138477    txbroiler_lot    TABLE     �   CREATE TABLE public.txbroiler_lot (
    broiler_lot_id integer NOT NULL,
    broiler_detail_id integer NOT NULL,
    broiler_id integer NOT NULL,
    quantity integer NOT NULL
);
 !   DROP TABLE public.txbroiler_lot;
       public         postgres    false    3            �           0    0    TABLE txbroiler_lot    COMMENT     y   COMMENT ON TABLE public.txbroiler_lot IS 'Almacena la relación entre proyecciones y programaciones de engorde liviana';
            public       postgres    false    342            �           0    0 #   COLUMN txbroiler_lot.broiler_lot_id    COMMENT     |   COMMENT ON COLUMN public.txbroiler_lot.broiler_lot_id IS 'ID de la relación entre proyección y programación de engorde';
            public       postgres    false    342            �           0    0 &   COLUMN txbroiler_lot.broiler_detail_id    COMMENT     V   COMMENT ON COLUMN public.txbroiler_lot.broiler_detail_id IS 'ID de la programación';
            public       postgres    false    342            �           0    0    COLUMN txbroiler_lot.broiler_id    COMMENT     M   COMMENT ON COLUMN public.txbroiler_lot.broiler_id IS 'ID de la proyección';
            public       postgres    false    342            �           0    0    COLUMN txbroiler_lot.quantity    COMMENT     ^   COMMENT ON COLUMN public.txbroiler_lot.quantity IS 'Cantidad usada de la proyección origen';
            public       postgres    false    342            W           1259    138480     txbroiler_lot_broiler_lot_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txbroiler_lot_broiler_lot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.txbroiler_lot_broiler_lot_id_seq;
       public       postgres    false    342    3            �           0    0     txbroiler_lot_broiler_lot_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.txbroiler_lot_broiler_lot_id_seq OWNED BY public.txbroiler_lot.broiler_lot_id;
            public       postgres    false    343            X           1259    138482    txbroilereviction    TABLE     �  CREATE TABLE public.txbroilereviction (
    broilereviction_id integer DEFAULT nextval('public.broilereviction_id_seq'::regclass) NOT NULL,
    projected_date date,
    projected_quantity integer,
    partnership_id integer NOT NULL,
    scenario_id integer NOT NULL,
    breed_id integer NOT NULL,
    lot_incubator character varying(45) NOT NULL,
    broiler_detail_id integer,
    evictionprojected boolean,
    broiler_heavy_detail_id integer
);
 %   DROP TABLE public.txbroilereviction;
       public         postgres    false    223    3            �           0    0    TABLE txbroilereviction    COMMENT     a   COMMENT ON TABLE public.txbroilereviction IS 'Almacena las proyección del módulo de desalojo';
            public       postgres    false    344            �           0    0 +   COLUMN txbroilereviction.broilereviction_id    COMMENT     _   COMMENT ON COLUMN public.txbroilereviction.broilereviction_id IS 'ID del módulo de desalojo';
            public       postgres    false    344            �           0    0 '   COLUMN txbroilereviction.projected_date    COMMENT     b   COMMENT ON COLUMN public.txbroilereviction.projected_date IS 'Fecha proyectada para el desalojo';
            public       postgres    false    344            �           0    0 +   COLUMN txbroilereviction.projected_quantity    COMMENT     i   COMMENT ON COLUMN public.txbroilereviction.projected_quantity IS 'Cantidad proyectada para el desalojo';
            public       postgres    false    344            �           0    0 '   COLUMN txbroilereviction.partnership_id    COMMENT     Q   COMMENT ON COLUMN public.txbroilereviction.partnership_id IS 'ID de la empresa';
            public       postgres    false    344            �           0    0 $   COLUMN txbroilereviction.scenario_id    COMMENT     N   COMMENT ON COLUMN public.txbroilereviction.scenario_id IS 'ID del escenario';
            public       postgres    false    344            �           0    0 !   COLUMN txbroilereviction.breed_id    COMMENT     H   COMMENT ON COLUMN public.txbroilereviction.breed_id IS 'ID de la raza';
            public       postgres    false    344            �           0    0 &   COLUMN txbroilereviction.lot_incubator    COMMENT     S   COMMENT ON COLUMN public.txbroilereviction.lot_incubator IS 'Lote de procedencia';
            public       postgres    false    344                        0    0 *   COLUMN txbroilereviction.broiler_detail_id    COMMENT        COMMENT ON COLUMN public.txbroilereviction.broiler_detail_id IS 'ID de la programación de engorde liviano de donde proviene';
            public       postgres    false    344                       0    0 *   COLUMN txbroilereviction.evictionprojected    COMMENT     y   COMMENT ON COLUMN public.txbroilereviction.evictionprojected IS 'Indica si proviene de una programación ya desalojada';
            public       postgres    false    344                       0    0 0   COLUMN txbroilereviction.broiler_heavy_detail_id    COMMENT     }   COMMENT ON COLUMN public.txbroilereviction.broiler_heavy_detail_id IS 'ID de la programación de pesadas de donde proviene';
            public       postgres    false    344            Y           1259    138486    txbroilereviction_detail    TABLE     �  CREATE TABLE public.txbroilereviction_detail (
    broilereviction_detail_id integer DEFAULT nextval('public.broilereviction_detail_id_seq'::regclass) NOT NULL,
    broilereviction_id integer NOT NULL,
    scheduled_date date,
    scheduled_quantity integer,
    farm_id integer NOT NULL,
    shed_id integer NOT NULL,
    confirm integer,
    execution_date date,
    execution_quantity integer,
    lot character varying NOT NULL,
    broiler_product_id integer NOT NULL,
    slaughterhouse_id integer NOT NULL,
    center_id integer,
    executionslaughterhouse_id integer,
    programmed_disable boolean,
    synchronized boolean,
    order_p character varying(25),
    eviction boolean,
    closed_lot boolean
);
 ,   DROP TABLE public.txbroilereviction_detail;
       public         postgres    false    222    3                       0    0    TABLE txbroilereviction_detail    COMMENT     v   COMMENT ON TABLE public.txbroilereviction_detail IS 'Almacena la programación y ejecución del módulo de desalojo';
            public       postgres    false    345                       0    0 9   COLUMN txbroilereviction_detail.broilereviction_detail_id    COMMENT        COMMENT ON COLUMN public.txbroilereviction_detail.broilereviction_detail_id IS 'ID de los detalles del módulo de desarrollo';
            public       postgres    false    345                       0    0 2   COLUMN txbroilereviction_detail.broilereviction_id    COMMENT     f   COMMENT ON COLUMN public.txbroilereviction_detail.broilereviction_id IS 'ID del módulo de desalojo';
            public       postgres    false    345                       0    0 .   COLUMN txbroilereviction_detail.scheduled_date    COMMENT     i   COMMENT ON COLUMN public.txbroilereviction_detail.scheduled_date IS 'Fecha programada para el desalojo';
            public       postgres    false    345                       0    0 2   COLUMN txbroilereviction_detail.scheduled_quantity    COMMENT     p   COMMENT ON COLUMN public.txbroilereviction_detail.scheduled_quantity IS 'Cantidad programada para el desalojo';
            public       postgres    false    345                       0    0 '   COLUMN txbroilereviction_detail.farm_id    COMMENT     P   COMMENT ON COLUMN public.txbroilereviction_detail.farm_id IS 'ID de la granja';
            public       postgres    false    345            	           0    0 '   COLUMN txbroilereviction_detail.shed_id    COMMENT     O   COMMENT ON COLUMN public.txbroilereviction_detail.shed_id IS 'ID del galpón';
            public       postgres    false    345            
           0    0 '   COLUMN txbroilereviction_detail.confirm    COMMENT     N   COMMENT ON COLUMN public.txbroilereviction_detail.confirm IS 'Confirmación';
            public       postgres    false    345                       0    0 .   COLUMN txbroilereviction_detail.execution_date    COMMENT     \   COMMENT ON COLUMN public.txbroilereviction_detail.execution_date IS 'Fecha de ejecución ';
            public       postgres    false    345                       0    0 2   COLUMN txbroilereviction_detail.execution_quantity    COMMENT     c   COMMENT ON COLUMN public.txbroilereviction_detail.execution_quantity IS 'Cantidad de ejecución ';
            public       postgres    false    345                       0    0 #   COLUMN txbroilereviction_detail.lot    COMMENT     Y   COMMENT ON COLUMN public.txbroilereviction_detail.lot IS 'Lote del módulo de desalojo';
            public       postgres    false    345                       0    0 2   COLUMN txbroilereviction_detail.broiler_product_id    COMMENT     f   COMMENT ON COLUMN public.txbroilereviction_detail.broiler_product_id IS 'ID del producto de engorde';
            public       postgres    false    345                       0    0 1   COLUMN txbroilereviction_detail.slaughterhouse_id    COMMENT     g   COMMENT ON COLUMN public.txbroilereviction_detail.slaughterhouse_id IS 'ID de la planta de beneficio';
            public       postgres    false    345                       0    0 )   COLUMN txbroilereviction_detail.center_id    COMMENT     _   COMMENT ON COLUMN public.txbroilereviction_detail.center_id IS 'ID del núcleo de ejecución';
            public       postgres    false    345                       0    0 :   COLUMN txbroilereviction_detail.executionslaughterhouse_id    COMMENT     �   COMMENT ON COLUMN public.txbroilereviction_detail.executionslaughterhouse_id IS 'ID de la planta de beneficio donde fue ejecutada';
            public       postgres    false    345                       0    0 2   COLUMN txbroilereviction_detail.programmed_disable    COMMENT     t   COMMENT ON COLUMN public.txbroilereviction_detail.programmed_disable IS 'Indica si la programación fue eliminada';
            public       postgres    false    345                       0    0 ,   COLUMN txbroilereviction_detail.synchronized    COMMENT     `   COMMENT ON COLUMN public.txbroilereviction_detail.synchronized IS 'Indica si fue sincronizado';
            public       postgres    false    345                       0    0 '   COLUMN txbroilereviction_detail.order_p    COMMENT     g   COMMENT ON COLUMN public.txbroilereviction_detail.order_p IS 'Indica el número de orden previsional';
            public       postgres    false    345                       0    0 (   COLUMN txbroilereviction_detail.eviction    COMMENT     Z   COMMENT ON COLUMN public.txbroilereviction_detail.eviction IS 'Indica si fue desalojado';
            public       postgres    false    345                       0    0 *   COLUMN txbroilereviction_detail.closed_lot    COMMENT     u   COMMENT ON COLUMN public.txbroilereviction_detail.closed_lot IS 'Indica si el lote fue cerrado para notificaciones';
            public       postgres    false    345            Z           1259    138493    txbroilerheavy_detail    TABLE       CREATE TABLE public.txbroilerheavy_detail (
    broiler_heavy_detail_id integer NOT NULL,
    programmed_date date NOT NULL,
    programmed_quantity integer NOT NULL,
    broiler_detail_id integer NOT NULL,
    broiler_product_id integer NOT NULL,
    lot character varying NOT NULL,
    execution_date date,
    execution_quantity integer,
    tight boolean,
    closed_lot boolean,
    programmed_disable boolean,
    synchronized boolean,
    order_p character varying,
    lot_sap character varying,
    eviction boolean
);
 )   DROP TABLE public.txbroilerheavy_detail;
       public         postgres    false    3                       0    0    TABLE txbroilerheavy_detail    COMMENT     `   COMMENT ON TABLE public.txbroilerheavy_detail IS 'Almacena las programaciones de aves pesadas';
            public       postgres    false    346                       0    0 4   COLUMN txbroilerheavy_detail.broiler_heavy_detail_id    COMMENT     v   COMMENT ON COLUMN public.txbroilerheavy_detail.broiler_heavy_detail_id IS 'ID de la programación de engorde pesada';
            public       postgres    false    346                       0    0 ,   COLUMN txbroilerheavy_detail.programmed_date    COMMENT     V   COMMENT ON COLUMN public.txbroilerheavy_detail.programmed_date IS 'Fecha programada';
            public       postgres    false    346                       0    0 0   COLUMN txbroilerheavy_detail.programmed_quantity    COMMENT     ]   COMMENT ON COLUMN public.txbroilerheavy_detail.programmed_quantity IS 'Cantidad programada';
            public       postgres    false    346                       0    0 .   COLUMN txbroilerheavy_detail.broiler_detail_id    COMMENT     �   COMMENT ON COLUMN public.txbroilerheavy_detail.broiler_detail_id IS 'ID de la programación de engorde liviana de procedencia';
            public       postgres    false    346                       0    0 /   COLUMN txbroilerheavy_detail.broiler_product_id    COMMENT     l   COMMENT ON COLUMN public.txbroilerheavy_detail.broiler_product_id IS 'ID del producto de engorde asociado';
            public       postgres    false    346                       0    0     COLUMN txbroilerheavy_detail.lot    COMMENT     R   COMMENT ON COLUMN public.txbroilerheavy_detail.lot IS 'Lote de la programación';
            public       postgres    false    346                       0    0 +   COLUMN txbroilerheavy_detail.execution_date    COMMENT     W   COMMENT ON COLUMN public.txbroilerheavy_detail.execution_date IS 'Fecha de ejecutada';
            public       postgres    false    346                       0    0 /   COLUMN txbroilerheavy_detail.execution_quantity    COMMENT     ^   COMMENT ON COLUMN public.txbroilerheavy_detail.execution_quantity IS 'Cantidad de ejecutada';
            public       postgres    false    346                        0    0 "   COLUMN txbroilerheavy_detail.tight    COMMENT     R   COMMENT ON COLUMN public.txbroilerheavy_detail.tight IS 'Indica si fue ajustado';
            public       postgres    false    346            !           0    0 '   COLUMN txbroilerheavy_detail.closed_lot    COMMENT     ^   COMMENT ON COLUMN public.txbroilerheavy_detail.closed_lot IS 'Indica si el lote fue cerrado';
            public       postgres    false    346            "           0    0 /   COLUMN txbroilerheavy_detail.programmed_disable    COMMENT     `   COMMENT ON COLUMN public.txbroilerheavy_detail.programmed_disable IS 'Indica si fue eliminado';
            public       postgres    false    346            #           0    0 )   COLUMN txbroilerheavy_detail.synchronized    COMMENT     ]   COMMENT ON COLUMN public.txbroilerheavy_detail.synchronized IS 'Indica si fue sincronizado';
            public       postgres    false    346            $           0    0 $   COLUMN txbroilerheavy_detail.order_p    COMMENT     a   COMMENT ON COLUMN public.txbroilerheavy_detail.order_p IS 'Indica número de orden previsional';
            public       postgres    false    346            %           0    0 $   COLUMN txbroilerheavy_detail.lot_sap    COMMENT     ^   COMMENT ON COLUMN public.txbroilerheavy_detail.lot_sap IS 'Indica el número de lote en SAP';
            public       postgres    false    346            &           0    0 %   COLUMN txbroilerheavy_detail.eviction    COMMENT     W   COMMENT ON COLUMN public.txbroilerheavy_detail.eviction IS 'Indica si fue desalojada';
            public       postgres    false    346            [           1259    138499 1   txbroilerheavy_detail_broiler_heavy_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txbroilerheavy_detail_broiler_heavy_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 H   DROP SEQUENCE public.txbroilerheavy_detail_broiler_heavy_detail_id_seq;
       public       postgres    false    346    3            '           0    0 1   txbroilerheavy_detail_broiler_heavy_detail_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.txbroilerheavy_detail_broiler_heavy_detail_id_seq OWNED BY public.txbroilerheavy_detail.broiler_heavy_detail_id;
            public       postgres    false    347            \           1259    138501    txbroilerproduct_detail    TABLE     �   CREATE TABLE public.txbroilerproduct_detail (
    broilerproduct_detail_id integer DEFAULT nextval('public.broiler_product_detail_id_seq'::regclass) NOT NULL,
    broiler_detail integer NOT NULL,
    broiler_product_id integer,
    quantity integer
);
 +   DROP TABLE public.txbroilerproduct_detail;
       public         postgres    false    220    3            (           0    0    TABLE txbroilerproduct_detail    COMMENT     i   COMMENT ON TABLE public.txbroilerproduct_detail IS 'Almacena los detalles de la producción de engorde';
            public       postgres    false    348            )           0    0 7   COLUMN txbroilerproduct_detail.broilerproduct_detail_id    COMMENT     }   COMMENT ON COLUMN public.txbroilerproduct_detail.broilerproduct_detail_id IS 'ID de los detalles de producción de engorde';
            public       postgres    false    348            *           0    0 -   COLUMN txbroilerproduct_detail.broiler_detail    COMMENT     Z   COMMENT ON COLUMN public.txbroilerproduct_detail.broiler_detail IS 'Detalles de engorde';
            public       postgres    false    348            +           0    0 1   COLUMN txbroilerproduct_detail.broiler_product_id    COMMENT     e   COMMENT ON COLUMN public.txbroilerproduct_detail.broiler_product_id IS 'ID del producto de engorde';
            public       postgres    false    348            ,           0    0 '   COLUMN txbroilerproduct_detail.quantity    COMMENT     `   COMMENT ON COLUMN public.txbroilerproduct_detail.quantity IS 'Cantidad de producto de engorde';
            public       postgres    false    348            ]           1259    138505    txbroodermachine    TABLE     �  CREATE TABLE public.txbroodermachine (
    brooder_machine_id_seq integer DEFAULT nextval('public.brooder_machines_id_seq'::regclass) NOT NULL,
    partnership_id integer NOT NULL,
    farm_id integer NOT NULL,
    capacity integer,
    sunday integer,
    monday integer,
    tuesday integer,
    wednesday integer,
    thursday integer,
    friday integer,
    saturday integer,
    name character varying(250)
);
 $   DROP TABLE public.txbroodermachine;
       public         postgres    false    225    3            -           0    0    TABLE txbroodermachine    COMMENT     ^   COMMENT ON TABLE public.txbroodermachine IS 'Almacena los datos de las máquinas de engorde';
            public       postgres    false    349            .           0    0 .   COLUMN txbroodermachine.brooder_machine_id_seq    COMMENT     d   COMMENT ON COLUMN public.txbroodermachine.brooder_machine_id_seq IS 'ID de la máquina de engorde';
            public       postgres    false    349            /           0    0 &   COLUMN txbroodermachine.partnership_id    COMMENT     P   COMMENT ON COLUMN public.txbroodermachine.partnership_id IS 'ID de la empresa';
            public       postgres    false    349            0           0    0    COLUMN txbroodermachine.farm_id    COMMENT     H   COMMENT ON COLUMN public.txbroodermachine.farm_id IS 'ID de la granja';
            public       postgres    false    349            1           0    0     COLUMN txbroodermachine.capacity    COMMENT     R   COMMENT ON COLUMN public.txbroodermachine.capacity IS 'Capacidad de la máquina';
            public       postgres    false    349            2           0    0    COLUMN txbroodermachine.sunday    COMMENT     ?   COMMENT ON COLUMN public.txbroodermachine.sunday IS 'Domingo';
            public       postgres    false    349            3           0    0    COLUMN txbroodermachine.monday    COMMENT     =   COMMENT ON COLUMN public.txbroodermachine.monday IS 'Lunes';
            public       postgres    false    349            4           0    0    COLUMN txbroodermachine.tuesday    COMMENT     ?   COMMENT ON COLUMN public.txbroodermachine.tuesday IS 'Martes';
            public       postgres    false    349            5           0    0 !   COLUMN txbroodermachine.wednesday    COMMENT     E   COMMENT ON COLUMN public.txbroodermachine.wednesday IS 'Miércoles';
            public       postgres    false    349            6           0    0     COLUMN txbroodermachine.thursday    COMMENT     @   COMMENT ON COLUMN public.txbroodermachine.thursday IS 'Jueves';
            public       postgres    false    349            7           0    0    COLUMN txbroodermachine.friday    COMMENT     ?   COMMENT ON COLUMN public.txbroodermachine.friday IS 'Viernes';
            public       postgres    false    349            8           0    0     COLUMN txbroodermachine.saturday    COMMENT     A   COMMENT ON COLUMN public.txbroodermachine.saturday IS 'Sábado';
            public       postgres    false    349            9           0    0    COLUMN txbroodermachine.name    COMMENT     K   COMMENT ON COLUMN public.txbroodermachine.name IS 'Nombre de la máquina';
            public       postgres    false    349            ^           1259    138517    txeggs_movements_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txeggs_movements_id_seq
    START WITH 170
    INCREMENT BY 2041
    NO MINVALUE
    MAXVALUE 9999999999999999
    CACHE 1;
 .   DROP SEQUENCE public.txeggs_movements_id_seq;
       public       postgres    false    3            _           1259    138519    txeggs_movements    TABLE     �  CREATE TABLE public.txeggs_movements (
    eggs_movements_id integer DEFAULT nextval('public.txeggs_movements_id_seq'::regclass) NOT NULL,
    fecha_movements date NOT NULL,
    lot character varying(25) NOT NULL,
    quantity integer NOT NULL,
    type_movements character varying NOT NULL,
    eggs_storage_id integer NOT NULL,
    description_adjustment character varying,
    justification character varying,
    programmed_eggs_id integer,
    programmed_disable boolean
);
 $   DROP TABLE public.txeggs_movements;
       public         postgres    false    350    3            :           0    0    TABLE txeggs_movements    COMMENT     a   COMMENT ON TABLE public.txeggs_movements IS 'Almacena los movimientos de huevos en el almacén';
            public       postgres    false    351            ;           0    0 )   COLUMN txeggs_movements.eggs_movements_id    COMMENT     T   COMMENT ON COLUMN public.txeggs_movements.eggs_movements_id IS 'ID del movimiento';
            public       postgres    false    351            <           0    0 '   COLUMN txeggs_movements.fecha_movements    COMMENT     U   COMMENT ON COLUMN public.txeggs_movements.fecha_movements IS 'Fecha del movimiento';
            public       postgres    false    351            =           0    0    COLUMN txeggs_movements.lot    COMMENT     _   COMMENT ON COLUMN public.txeggs_movements.lot IS 'Lote sobre el que se realiza el movimiento';
            public       postgres    false    351            >           0    0     COLUMN txeggs_movements.quantity    COMMENT     Q   COMMENT ON COLUMN public.txeggs_movements.quantity IS 'Cantidad del movimiento';
            public       postgres    false    351            ?           0    0 &   COLUMN txeggs_movements.type_movements    COMMENT     n   COMMENT ON COLUMN public.txeggs_movements.type_movements IS 'Indica si el movimiento es de ingreso o egreso';
            public       postgres    false    351            @           0    0 '   COLUMN txeggs_movements.eggs_storage_id    COMMENT     w   COMMENT ON COLUMN public.txeggs_movements.eggs_storage_id IS 'ID de almacenamiento de huevos en la planta incubadora';
            public       postgres    false    351            A           0    0 .   COLUMN txeggs_movements.description_adjustment    COMMENT     i   COMMENT ON COLUMN public.txeggs_movements.description_adjustment IS 'Indica el concepto del movimiento';
            public       postgres    false    351            B           0    0 %   COLUMN txeggs_movements.justification    COMMENT     `   COMMENT ON COLUMN public.txeggs_movements.justification IS 'Breve descripción del movimiento';
            public       postgres    false    351            C           0    0 *   COLUMN txeggs_movements.programmed_eggs_id    COMMENT     n   COMMENT ON COLUMN public.txeggs_movements.programmed_eggs_id IS 'ID de la ejecución de incubadora asociada';
            public       postgres    false    351            D           0    0 *   COLUMN txeggs_movements.programmed_disable    COMMENT     g   COMMENT ON COLUMN public.txeggs_movements.programmed_disable IS 'Indica si el registro fue eliminado';
            public       postgres    false    351            `           1259    138526    txeggs_planning    TABLE       CREATE TABLE public.txeggs_planning (
    egg_planning_id integer DEFAULT nextval('public.egg_planning_id_seq'::regclass) NOT NULL,
    month_planning integer,
    year_planning integer,
    scenario_id integer NOT NULL,
    planned double precision,
    breed_id integer NOT NULL
);
 #   DROP TABLE public.txeggs_planning;
       public         postgres    false    229    3            E           0    0    TABLE txeggs_planning    COMMENT     g   COMMENT ON TABLE public.txeggs_planning IS 'Almacena los detalles de la planificación de los huevos';
            public       postgres    false    352            F           0    0 &   COLUMN txeggs_planning.egg_planning_id    COMMENT     ^   COMMENT ON COLUMN public.txeggs_planning.egg_planning_id IS 'ID de planificación de huevos';
            public       postgres    false    352            G           0    0 %   COLUMN txeggs_planning.month_planning    COMMENT     b   COMMENT ON COLUMN public.txeggs_planning.month_planning IS 'Mes de planificación de los huevos';
            public       postgres    false    352            H           0    0 $   COLUMN txeggs_planning.year_planning    COMMENT     b   COMMENT ON COLUMN public.txeggs_planning.year_planning IS 'Año de planificación de los huevos';
            public       postgres    false    352            I           0    0 "   COLUMN txeggs_planning.scenario_id    COMMENT     w   COMMENT ON COLUMN public.txeggs_planning.scenario_id IS 'ID del escenario al cual pertenecen los huevos planificados';
            public       postgres    false    352            J           0    0    COLUMN txeggs_planning.planned    COMMENT     W   COMMENT ON COLUMN public.txeggs_planning.planned IS 'Cantidad de huevos planificados';
            public       postgres    false    352            K           0    0    COLUMN txeggs_planning.breed_id    COMMENT     T   COMMENT ON COLUMN public.txeggs_planning.breed_id IS 'ID de la raza de los huevos';
            public       postgres    false    352            a           1259    138530    txeggs_required    TABLE     
  CREATE TABLE public.txeggs_required (
    egg_required_id integer DEFAULT nextval('public.egg_required_id_seq'::regclass) NOT NULL,
    use_month integer,
    use_year integer,
    scenario_id integer NOT NULL,
    required double precision,
    breed_id integer
);
 #   DROP TABLE public.txeggs_required;
       public         postgres    false    230    3            L           0    0    TABLE txeggs_required    COMMENT     V   COMMENT ON TABLE public.txeggs_required IS 'Almacena los datos de huevos requeridos';
            public       postgres    false    353            M           0    0 &   COLUMN txeggs_required.egg_required_id    COMMENT     [   COMMENT ON COLUMN public.txeggs_required.egg_required_id IS 'ID de los huevos requeridos';
            public       postgres    false    353            N           0    0     COLUMN txeggs_required.use_month    COMMENT     =   COMMENT ON COLUMN public.txeggs_required.use_month IS 'Mes';
            public       postgres    false    353            O           0    0    COLUMN txeggs_required.use_year    COMMENT     =   COMMENT ON COLUMN public.txeggs_required.use_year IS 'Año';
            public       postgres    false    353            P           0    0 "   COLUMN txeggs_required.scenario_id    COMMENT     L   COMMENT ON COLUMN public.txeggs_required.scenario_id IS 'ID del escenario';
            public       postgres    false    353            Q           0    0    COLUMN txeggs_required.required    COMMENT     K   COMMENT ON COLUMN public.txeggs_required.required IS 'Cantidad requerida';
            public       postgres    false    353            R           0    0    COLUMN txeggs_required.breed_id    COMMENT     F   COMMENT ON COLUMN public.txeggs_required.breed_id IS 'ID de la raza';
            public       postgres    false    353            b           1259    138534    txeggs_storage    TABLE     �  CREATE TABLE public.txeggs_storage (
    eggs_storage_id integer DEFAULT nextval('public.eggs_storage_id_seq'::regclass) NOT NULL,
    incubator_plant_id integer NOT NULL,
    scenario_id integer NOT NULL,
    breed_id integer NOT NULL,
    init_date date,
    end_date date,
    lot character varying(45),
    eggs integer,
    eggs_executed integer,
    origin integer,
    synchronized boolean,
    lot_sap character varying,
    evictionprojected boolean
);
 "   DROP TABLE public.txeggs_storage;
       public         postgres    false    231    3            S           0    0    TABLE txeggs_storage    COMMENT     �   COMMENT ON TABLE public.txeggs_storage IS 'Almacena la información de almacenamiento de los huevos en las plantas incubadoras';
            public       postgres    false    354            T           0    0 %   COLUMN txeggs_storage.eggs_storage_id    COMMENT     X   COMMENT ON COLUMN public.txeggs_storage.eggs_storage_id IS 'ID del almacén de huevos';
            public       postgres    false    354            U           0    0 (   COLUMN txeggs_storage.incubator_plant_id    COMMENT     \   COMMENT ON COLUMN public.txeggs_storage.incubator_plant_id IS 'ID de la planta incubadora';
            public       postgres    false    354            V           0    0 !   COLUMN txeggs_storage.scenario_id    COMMENT     K   COMMENT ON COLUMN public.txeggs_storage.scenario_id IS 'ID del escenario';
            public       postgres    false    354            W           0    0    COLUMN txeggs_storage.breed_id    COMMENT     E   COMMENT ON COLUMN public.txeggs_storage.breed_id IS 'ID de la raza';
            public       postgres    false    354            X           0    0    COLUMN txeggs_storage.init_date    COMMENT     H   COMMENT ON COLUMN public.txeggs_storage.init_date IS 'Fecha de inicio';
            public       postgres    false    354            Y           0    0    COLUMN txeggs_storage.end_date    COMMENT     J   COMMENT ON COLUMN public.txeggs_storage.end_date IS 'Fecha de culminado';
            public       postgres    false    354            Z           0    0    COLUMN txeggs_storage.lot    COMMENT     7   COMMENT ON COLUMN public.txeggs_storage.lot IS 'Lote';
            public       postgres    false    354            [           0    0    COLUMN txeggs_storage.eggs    COMMENT     R   COMMENT ON COLUMN public.txeggs_storage.eggs IS 'Cantidad de huevos proyectados';
            public       postgres    false    354            \           0    0 #   COLUMN txeggs_storage.eggs_executed    COMMENT     Z   COMMENT ON COLUMN public.txeggs_storage.eggs_executed IS 'Cantidad de huevos ejecutados';
            public       postgres    false    354            ]           0    0 "   COLUMN txeggs_storage.synchronized    COMMENT     V   COMMENT ON COLUMN public.txeggs_storage.synchronized IS 'Indica si fue sincronizado';
            public       postgres    false    354            ^           0    0    COLUMN txeggs_storage.lot_sap    COMMENT     T   COMMENT ON COLUMN public.txeggs_storage.lot_sap IS 'Indica el número de lote SAP';
            public       postgres    false    354            _           0    0 '   COLUMN txeggs_storage.evictionprojected    COMMENT     �   COMMENT ON COLUMN public.txeggs_storage.evictionprojected IS 'Inndica si el registro proviene de una programación ya desalojada';
            public       postgres    false    354            c           1259    138541    txgoals_erp    TABLE     �   CREATE TABLE public.txgoals_erp (
    goals_erp_id bigint NOT NULL,
    use_week date,
    use_value integer,
    product_id integer NOT NULL,
    code character varying(10),
    scenario_id integer NOT NULL
);
    DROP TABLE public.txgoals_erp;
       public         postgres    false    3            `           0    0    TABLE txgoals_erp    COMMENT     �   COMMENT ON TABLE public.txgoals_erp IS 'Almacena los datos generados de las metas de producción de la planificación regresiva para ser enviados al ERP';
            public       postgres    false    355            a           0    0    COLUMN txgoals_erp.goals_erp_id    COMMENT     N   COMMENT ON COLUMN public.txgoals_erp.goals_erp_id IS 'ID de la meta del ERP';
            public       postgres    false    355            b           0    0    COLUMN txgoals_erp.use_week    COMMENT     ;   COMMENT ON COLUMN public.txgoals_erp.use_week IS 'Semana';
            public       postgres    false    355            c           0    0    COLUMN txgoals_erp.use_value    COMMENT     D   COMMENT ON COLUMN public.txgoals_erp.use_value IS 'Valor objetivo';
            public       postgres    false    355            d           0    0    COLUMN txgoals_erp.product_id    COMMENT     F   COMMENT ON COLUMN public.txgoals_erp.product_id IS 'ID del producto';
            public       postgres    false    355            e           0    0    COLUMN txgoals_erp.code    COMMENT     E   COMMENT ON COLUMN public.txgoals_erp.code IS 'Código del producto';
            public       postgres    false    355            f           0    0    COLUMN txgoals_erp.scenario_id    COMMENT     H   COMMENT ON COLUMN public.txgoals_erp.scenario_id IS 'ID del escenario';
            public       postgres    false    355            d           1259    138544    txgoals_erp_goals_erp_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txgoals_erp_goals_erp_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.txgoals_erp_goals_erp_id_seq;
       public       postgres    false    355    3            g           0    0    txgoals_erp_goals_erp_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.txgoals_erp_goals_erp_id_seq OWNED BY public.txgoals_erp.goals_erp_id;
            public       postgres    false    356            e           1259    138546    txhousingway    TABLE     �  CREATE TABLE public.txhousingway (
    housing_way_id integer DEFAULT nextval('public.housing_way_id_seq'::regclass) NOT NULL,
    projected_quantity integer,
    projected_date date,
    stage_id integer NOT NULL,
    partnership_id integer NOT NULL,
    scenario_id integer NOT NULL,
    breed_id integer NOT NULL,
    predecessor_id integer NOT NULL,
    projected_disable boolean,
    evictionprojected boolean
);
     DROP TABLE public.txhousingway;
       public         postgres    false    236    3            h           0    0    TABLE txhousingway    COMMENT     t   COMMENT ON TABLE public.txhousingway IS 'Almacena la proyección de los módulos de levante, cría y reproductora';
            public       postgres    false    357            i           0    0 "   COLUMN txhousingway.housing_way_id    COMMENT     �   COMMENT ON COLUMN public.txhousingway.housing_way_id IS 'ID de las proyecciones de los módulos de reproductora junto con levante y cría';
            public       postgres    false    357            j           0    0 &   COLUMN txhousingway.projected_quantity    COMMENT     S   COMMENT ON COLUMN public.txhousingway.projected_quantity IS 'Cantidad proyectada';
            public       postgres    false    357            k           0    0 "   COLUMN txhousingway.projected_date    COMMENT     L   COMMENT ON COLUMN public.txhousingway.projected_date IS 'Fecha proyectada';
            public       postgres    false    357            l           0    0    COLUMN txhousingway.stage_id    COMMENT     D   COMMENT ON COLUMN public.txhousingway.stage_id IS 'ID de la etapa';
            public       postgres    false    357            m           0    0 "   COLUMN txhousingway.partnership_id    COMMENT     L   COMMENT ON COLUMN public.txhousingway.partnership_id IS 'ID de la empresa';
            public       postgres    false    357            n           0    0    COLUMN txhousingway.scenario_id    COMMENT     H   COMMENT ON COLUMN public.txhousingway.scenario_id IS 'ID del scenario';
            public       postgres    false    357            o           0    0    COLUMN txhousingway.breed_id    COMMENT     C   COMMENT ON COLUMN public.txhousingway.breed_id IS 'ID de la raza';
            public       postgres    false    357            p           0    0 "   COLUMN txhousingway.predecessor_id    COMMENT     N   COMMENT ON COLUMN public.txhousingway.predecessor_id IS 'ID del predecesor ';
            public       postgres    false    357            q           0    0 %   COLUMN txhousingway.projected_disable    COMMENT     e   COMMENT ON COLUMN public.txhousingway.projected_disable IS 'Indica si la proyección fue eliminada';
            public       postgres    false    357            r           0    0 %   COLUMN txhousingway.evictionprojected    COMMENT     t   COMMENT ON COLUMN public.txhousingway.evictionprojected IS 'Indica si proviene de una programación ya desalojada';
            public       postgres    false    357            f           1259    138550    txhousingway_detail    TABLE     �  CREATE TABLE public.txhousingway_detail (
    housingway_detail_id integer DEFAULT nextval('public.housing_way_detail_id_seq'::regclass) NOT NULL,
    housing_way_id integer NOT NULL,
    scheduled_date date,
    scheduled_quantity integer,
    farm_id integer NOT NULL,
    shed_id integer NOT NULL,
    confirm integer,
    execution_date date,
    execution_quantity integer,
    lot character varying(45),
    incubator_plant_id integer,
    center_id integer,
    executionfarm_id integer,
    executioncenter_id integer,
    executionshed_id integer,
    executionincubatorplant_id integer,
    programmed_disable boolean,
    synchronized boolean,
    order_p character varying,
    lot_sap character varying,
    tight boolean,
    eviction boolean
);
 '   DROP TABLE public.txhousingway_detail;
       public         postgres    false    235    3            s           0    0    TABLE txhousingway_detail    COMMENT     �   COMMENT ON TABLE public.txhousingway_detail IS 'Almacena la programación y la ejecución de los módulos de levante y cría y reproductora';
            public       postgres    false    358            t           0    0 /   COLUMN txhousingway_detail.housingway_detail_id    COMMENT     �   COMMENT ON COLUMN public.txhousingway_detail.housingway_detail_id IS 'ID de la programación y ejecución de los modelos de levante y cría y reproductora';
            public       postgres    false    358            u           0    0 )   COLUMN txhousingway_detail.housing_way_id    COMMENT     �   COMMENT ON COLUMN public.txhousingway_detail.housing_way_id IS 'ID de las proyecciones de los módulos de reproductora junto con levante y cría';
            public       postgres    false    358            v           0    0 )   COLUMN txhousingway_detail.scheduled_date    COMMENT     S   COMMENT ON COLUMN public.txhousingway_detail.scheduled_date IS 'Fecha programada';
            public       postgres    false    358            w           0    0 -   COLUMN txhousingway_detail.scheduled_quantity    COMMENT     Z   COMMENT ON COLUMN public.txhousingway_detail.scheduled_quantity IS 'Cantidad programada';
            public       postgres    false    358            x           0    0 "   COLUMN txhousingway_detail.farm_id    COMMENT     K   COMMENT ON COLUMN public.txhousingway_detail.farm_id IS 'ID de la granja';
            public       postgres    false    358            y           0    0 "   COLUMN txhousingway_detail.shed_id    COMMENT     T   COMMENT ON COLUMN public.txhousingway_detail.shed_id IS 'ID del galpón utilizado';
            public       postgres    false    358            z           0    0 "   COLUMN txhousingway_detail.confirm    COMMENT     ]   COMMENT ON COLUMN public.txhousingway_detail.confirm IS 'Confirmación de sincronización ';
            public       postgres    false    358            {           0    0 )   COLUMN txhousingway_detail.execution_date    COMMENT     V   COMMENT ON COLUMN public.txhousingway_detail.execution_date IS 'Fecha de ejecución';
            public       postgres    false    358            |           0    0 -   COLUMN txhousingway_detail.execution_quantity    COMMENT     Y   COMMENT ON COLUMN public.txhousingway_detail.execution_quantity IS 'Cantidad ejecutada';
            public       postgres    false    358            }           0    0    COLUMN txhousingway_detail.lot    COMMENT     I   COMMENT ON COLUMN public.txhousingway_detail.lot IS 'Lote seleccionado';
            public       postgres    false    358            ~           0    0 -   COLUMN txhousingway_detail.incubator_plant_id    COMMENT     a   COMMENT ON COLUMN public.txhousingway_detail.incubator_plant_id IS 'ID de la planta incubadora';
            public       postgres    false    358                       0    0 $   COLUMN txhousingway_detail.center_id    COMMENT     e   COMMENT ON COLUMN public.txhousingway_detail.center_id IS 'ID del núcleo en el que fue programada';
            public       postgres    false    358            �           0    0 +   COLUMN txhousingway_detail.executionfarm_id    COMMENT     h   COMMENT ON COLUMN public.txhousingway_detail.executionfarm_id IS 'ID de la granja donde fue ejecutada';
            public       postgres    false    358            �           0    0 -   COLUMN txhousingway_detail.executioncenter_id    COMMENT     i   COMMENT ON COLUMN public.txhousingway_detail.executioncenter_id IS 'ID del núcleo donde fue ejecutada';
            public       postgres    false    358            �           0    0 +   COLUMN txhousingway_detail.executionshed_id    COMMENT     g   COMMENT ON COLUMN public.txhousingway_detail.executionshed_id IS 'ID del galpón donde fue ejecutada';
            public       postgres    false    358            �           0    0 5   COLUMN txhousingway_detail.executionincubatorplant_id    COMMENT     �   COMMENT ON COLUMN public.txhousingway_detail.executionincubatorplant_id IS 'ID de la planta incubadora en la que fue ejecutada';
            public       postgres    false    358            �           0    0 -   COLUMN txhousingway_detail.programmed_disable    COMMENT     ^   COMMENT ON COLUMN public.txhousingway_detail.programmed_disable IS 'Indica si fue eliminada';
            public       postgres    false    358            �           0    0 '   COLUMN txhousingway_detail.synchronized    COMMENT     [   COMMENT ON COLUMN public.txhousingway_detail.synchronized IS 'Indica si fue sincronizado';
            public       postgres    false    358            �           0    0 "   COLUMN txhousingway_detail.order_p    COMMENT     X   COMMENT ON COLUMN public.txhousingway_detail.order_p IS 'Número de orden previsional';
            public       postgres    false    358            �           0    0 "   COLUMN txhousingway_detail.lot_sap    COMMENT     R   COMMENT ON COLUMN public.txhousingway_detail.lot_sap IS 'Número de lote en SAP';
            public       postgres    false    358            �           0    0     COLUMN txhousingway_detail.tight    COMMENT     P   COMMENT ON COLUMN public.txhousingway_detail.tight IS 'Indica si fue ajustada';
            public       postgres    false    358            �           0    0 #   COLUMN txhousingway_detail.eviction    COMMENT     U   COMMENT ON COLUMN public.txhousingway_detail.eviction IS 'Indica si fue desalojada';
            public       postgres    false    358            g           1259    138557    txhousingway_lot    TABLE     �   CREATE TABLE public.txhousingway_lot (
    housingway_lot_id integer NOT NULL,
    production_id integer NOT NULL,
    housingway_id integer NOT NULL,
    quantity integer,
    stage_id integer
);
 $   DROP TABLE public.txhousingway_lot;
       public         postgres    false    3            �           0    0    TABLE txhousingway_lot    COMMENT     �   COMMENT ON TABLE public.txhousingway_lot IS 'Almacena la relación entre proyecciones y programaciones de levante y cría y producción';
            public       postgres    false    359            �           0    0 )   COLUMN txhousingway_lot.housingway_lot_id    COMMENT     U   COMMENT ON COLUMN public.txhousingway_lot.housingway_lot_id IS 'ID de la relación';
            public       postgres    false    359            �           0    0 %   COLUMN txhousingway_lot.production_id    COMMENT     v   COMMENT ON COLUMN public.txhousingway_lot.production_id IS 'ID de la programación de levante y cría o producción';
            public       postgres    false    359            �           0    0 %   COLUMN txhousingway_lot.housingway_id    COMMENT     S   COMMENT ON COLUMN public.txhousingway_lot.housingway_id IS 'ID de la proyección';
            public       postgres    false    359            �           0    0     COLUMN txhousingway_lot.quantity    COMMENT     ^   COMMENT ON COLUMN public.txhousingway_lot.quantity IS 'Cantidad utilizada de la proyección';
            public       postgres    false    359            �           0    0     COLUMN txhousingway_lot.stage_id    COMMENT     H   COMMENT ON COLUMN public.txhousingway_lot.stage_id IS 'ID de la etapa';
            public       postgres    false    359            h           1259    138560 %   txhousingway_lot_txhousingway_lot_seq    SEQUENCE     �   CREATE SEQUENCE public.txhousingway_lot_txhousingway_lot_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 <   DROP SEQUENCE public.txhousingway_lot_txhousingway_lot_seq;
       public       postgres    false    3    359            �           0    0 %   txhousingway_lot_txhousingway_lot_seq    SEQUENCE OWNED BY     p   ALTER SEQUENCE public.txhousingway_lot_txhousingway_lot_seq OWNED BY public.txhousingway_lot.housingway_lot_id;
            public       postgres    false    360            i           1259    138562    txincubator_lot    TABLE     �   CREATE TABLE public.txincubator_lot (
    incubator_lot_id integer NOT NULL,
    programmed_eggs_id integer NOT NULL,
    eggs_movements_id integer NOT NULL,
    quantity integer NOT NULL
);
 #   DROP TABLE public.txincubator_lot;
       public         postgres    false    3            �           0    0    TABLE txincubator_lot    COMMENT        COMMENT ON TABLE public.txincubator_lot IS 'Almacena la relación entre las proyecciones y las programaciones de incubación';
            public       postgres    false    361            �           0    0 '   COLUMN txincubator_lot.incubator_lot_id    COMMENT     S   COMMENT ON COLUMN public.txincubator_lot.incubator_lot_id IS 'ID de la relación';
            public       postgres    false    361            �           0    0 )   COLUMN txincubator_lot.programmed_eggs_id    COMMENT     h   COMMENT ON COLUMN public.txincubator_lot.programmed_eggs_id IS 'ID de la programación de incubación';
            public       postgres    false    361            �           0    0 (   COLUMN txincubator_lot.eggs_movements_id    COMMENT     m   COMMENT ON COLUMN public.txincubator_lot.eggs_movements_id IS 'ID del movimiento asociado a la proyección';
            public       postgres    false    361            �           0    0    COLUMN txincubator_lot.quantity    COMMENT     ]   COMMENT ON COLUMN public.txincubator_lot.quantity IS 'Cantidad extraída de la proyección';
            public       postgres    false    361            j           1259    138565 $   txincubator_lot_incubator_lot_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txincubator_lot_incubator_lot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public.txincubator_lot_incubator_lot_id_seq;
       public       postgres    false    3    361            �           0    0 $   txincubator_lot_incubator_lot_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public.txincubator_lot_incubator_lot_id_seq OWNED BY public.txincubator_lot.incubator_lot_id;
            public       postgres    false    362            k           1259    138567    txincubator_sales    TABLE       CREATE TABLE public.txincubator_sales (
    incubator_sales_id integer NOT NULL,
    date_sale date NOT NULL,
    quantity integer NOT NULL,
    gender "char" NOT NULL,
    incubator_plant_id integer NOT NULL,
    breed_id integer NOT NULL,
    programmed_disable boolean
);
 %   DROP TABLE public.txincubator_sales;
       public         postgres    false    3            �           0    0    TABLE txincubator_sales    COMMENT     S   COMMENT ON TABLE public.txincubator_sales IS 'Almacena las ventas en incubación';
            public       postgres    false    363            �           0    0 +   COLUMN txincubator_sales.incubator_sales_id    COMMENT     S   COMMENT ON COLUMN public.txincubator_sales.incubator_sales_id IS 'ID de la venta';
            public       postgres    false    363            �           0    0 "   COLUMN txincubator_sales.date_sale    COMMENT     M   COMMENT ON COLUMN public.txincubator_sales.date_sale IS 'Fecha de la venta';
            public       postgres    false    363            �           0    0 !   COLUMN txincubator_sales.quantity    COMMENT     O   COMMENT ON COLUMN public.txincubator_sales.quantity IS 'Cantidad de la venta';
            public       postgres    false    363            �           0    0    COLUMN txincubator_sales.gender    COMMENT     I   COMMENT ON COLUMN public.txincubator_sales.gender IS 'Sexo de las aves';
            public       postgres    false    363            �           0    0 +   COLUMN txincubator_sales.incubator_plant_id    COMMENT     x   COMMENT ON COLUMN public.txincubator_sales.incubator_plant_id IS 'ID de la planta incubadora sobre la que se realizó';
            public       postgres    false    363            �           0    0 !   COLUMN txincubator_sales.breed_id    COMMENT     H   COMMENT ON COLUMN public.txincubator_sales.breed_id IS 'ID de la raza';
            public       postgres    false    363            �           0    0 +   COLUMN txincubator_sales.programmed_disable    COMMENT     \   COMMENT ON COLUMN public.txincubator_sales.programmed_disable IS 'Indica si fue eliminado';
            public       postgres    false    363            l           1259    138570 (   txincubator_sales_incubator_sales_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txincubator_sales_incubator_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ?   DROP SEQUENCE public.txincubator_sales_incubator_sales_id_seq;
       public       postgres    false    3    363            �           0    0 (   txincubator_sales_incubator_sales_id_seq    SEQUENCE OWNED BY     u   ALTER SEQUENCE public.txincubator_sales_incubator_sales_id_seq OWNED BY public.txincubator_sales.incubator_sales_id;
            public       postgres    false    364            m           1259    138572    txlot    TABLE     n  CREATE TABLE public.txlot (
    lot_id integer DEFAULT nextval('public.lot_id_seq'::regclass) NOT NULL,
    lot_code character varying(20) NOT NULL,
    lot_origin character varying(150),
    status integer,
    proyected_date date,
    sheduled_date date,
    proyected_quantity integer,
    sheduled_quantity integer,
    released_quantity integer,
    product_id integer NOT NULL,
    breed_id integer NOT NULL,
    gender character varying(30),
    type_posture character varying(30),
    shed_id integer NOT NULL,
    origin character varying(30),
    farm_id integer NOT NULL,
    housing_way_id integer NOT NULL
);
    DROP TABLE public.txlot;
       public         postgres    false    243    3            �           0    0    TABLE txlot    COMMENT     U   COMMENT ON TABLE public.txlot IS 'Almacena la información de los diferentes lotes';
            public       postgres    false    365            �           0    0    COLUMN txlot.lot_id    COMMENT     8   COMMENT ON COLUMN public.txlot.lot_id IS 'ID del lote';
            public       postgres    false    365            �           0    0    COLUMN txlot.lot_code    COMMENT     ?   COMMENT ON COLUMN public.txlot.lot_code IS 'Código del lote';
            public       postgres    false    365            �           0    0    COLUMN txlot.lot_origin    COMMENT     @   COMMENT ON COLUMN public.txlot.lot_origin IS 'Origen del lote';
            public       postgres    false    365            �           0    0    COLUMN txlot.status    COMMENT     <   COMMENT ON COLUMN public.txlot.status IS 'Estado del lote';
            public       postgres    false    365            �           0    0    COLUMN txlot.proyected_date    COMMENT     E   COMMENT ON COLUMN public.txlot.proyected_date IS 'Fecha proyectada';
            public       postgres    false    365            �           0    0    COLUMN txlot.sheduled_date    COMMENT     D   COMMENT ON COLUMN public.txlot.sheduled_date IS 'Fecha programada';
            public       postgres    false    365            �           0    0    COLUMN txlot.proyected_quantity    COMMENT     L   COMMENT ON COLUMN public.txlot.proyected_quantity IS 'Cantidad proyectada';
            public       postgres    false    365            �           0    0    COLUMN txlot.sheduled_quantity    COMMENT     K   COMMENT ON COLUMN public.txlot.sheduled_quantity IS 'Cantidad programada';
            public       postgres    false    365            �           0    0    COLUMN txlot.released_quantity    COMMENT     I   COMMENT ON COLUMN public.txlot.released_quantity IS 'Cantidad liberada';
            public       postgres    false    365            �           0    0    COLUMN txlot.product_id    COMMENT     @   COMMENT ON COLUMN public.txlot.product_id IS 'ID del producto';
            public       postgres    false    365            �           0    0    COLUMN txlot.breed_id    COMMENT     <   COMMENT ON COLUMN public.txlot.breed_id IS 'ID de la raza';
            public       postgres    false    365            �           0    0    COLUMN txlot.gender    COMMENT     :   COMMENT ON COLUMN public.txlot.gender IS 'Sexo del lote';
            public       postgres    false    365            �           0    0    COLUMN txlot.type_posture    COMMENT     B   COMMENT ON COLUMN public.txlot.type_posture IS 'Tipo de postura';
            public       postgres    false    365            �           0    0    COLUMN txlot.shed_id    COMMENT     <   COMMENT ON COLUMN public.txlot.shed_id IS 'ID del galpón';
            public       postgres    false    365            �           0    0    COLUMN txlot.origin    COMMENT     3   COMMENT ON COLUMN public.txlot.origin IS 'Origen';
            public       postgres    false    365            �           0    0    COLUMN txlot.farm_id    COMMENT     =   COMMENT ON COLUMN public.txlot.farm_id IS 'ID de la granja';
            public       postgres    false    365            �           0    0    COLUMN txlot.housing_way_id    COMMENT     ~   COMMENT ON COLUMN public.txlot.housing_way_id IS 'ID del almacenamientos de la proyecciones de levante, cria y reproductora';
            public       postgres    false    365            n           1259    138576 
   txlot_eggs    TABLE     �   CREATE TABLE public.txlot_eggs (
    lot_eggs_id integer DEFAULT nextval('public.lot_eggs_id_seq'::regclass) NOT NULL,
    theorical_performance double precision,
    week_date date,
    week integer
);
    DROP TABLE public.txlot_eggs;
       public         postgres    false    241    3            �           0    0    TABLE txlot_eggs    COMMENT     S   COMMENT ON TABLE public.txlot_eggs IS 'Almacena los datos de los lotes de huevos';
            public       postgres    false    366            �           0    0    COLUMN txlot_eggs.lot_eggs_id    COMMENT     L   COMMENT ON COLUMN public.txlot_eggs.lot_eggs_id IS 'ID del lote de huevos';
            public       postgres    false    366            �           0    0 '   COLUMN txlot_eggs.theorical_performance    COMMENT     U   COMMENT ON COLUMN public.txlot_eggs.theorical_performance IS 'Rendimiento teórico';
            public       postgres    false    366            �           0    0    COLUMN txlot_eggs.week_date    COMMENT     G   COMMENT ON COLUMN public.txlot_eggs.week_date IS 'Fecha de la semana';
            public       postgres    false    366            �           0    0    COLUMN txlot_eggs.week    COMMENT     6   COMMENT ON COLUMN public.txlot_eggs.week IS 'Semana';
            public       postgres    false    366            o           1259    138580    txposturecurve    TABLE     �  CREATE TABLE public.txposturecurve (
    posture_curve_id integer DEFAULT nextval('public.posture_curve_id_seq'::regclass) NOT NULL,
    week integer NOT NULL,
    breed_id integer NOT NULL,
    theorical_performance double precision NOT NULL,
    historical_performance double precision,
    theorical_accum_mortality integer,
    historical_accum_mortality integer,
    theorical_uniformity double precision,
    historical_uniformity double precision,
    type_posture character varying(30) NOT NULL
);
 "   DROP TABLE public.txposturecurve;
       public         postgres    false    288    3            �           0    0    TABLE txposturecurve    COMMENT        COMMENT ON TABLE public.txposturecurve IS 'Almacena la información de la curva de postura por cada raza separada por semana';
            public       postgres    false    367            �           0    0 &   COLUMN txposturecurve.posture_curve_id    COMMENT     Y   COMMENT ON COLUMN public.txposturecurve.posture_curve_id IS 'ID de la curva de postura';
            public       postgres    false    367            �           0    0    COLUMN txposturecurve.week    COMMENT     _   COMMENT ON COLUMN public.txposturecurve.week IS 'Semana en la que inicia la curva de postura';
            public       postgres    false    367            �           0    0    COLUMN txposturecurve.breed_id    COMMENT     E   COMMENT ON COLUMN public.txposturecurve.breed_id IS 'ID de la raza';
            public       postgres    false    367            �           0    0 +   COLUMN txposturecurve.theorical_performance    COMMENT     X   COMMENT ON COLUMN public.txposturecurve.theorical_performance IS 'Desempeño teórico';
            public       postgres    false    367            �           0    0 ,   COLUMN txposturecurve.historical_performance    COMMENT     [   COMMENT ON COLUMN public.txposturecurve.historical_performance IS 'Desempeño histórico';
            public       postgres    false    367            �           0    0 /   COLUMN txposturecurve.theorical_accum_mortality    COMMENT     i   COMMENT ON COLUMN public.txposturecurve.theorical_accum_mortality IS 'Acumulado de mortalidad teórico';
            public       postgres    false    367            �           0    0 0   COLUMN txposturecurve.historical_accum_mortality    COMMENT     l   COMMENT ON COLUMN public.txposturecurve.historical_accum_mortality IS 'Acumulado de mortalidad histórico';
            public       postgres    false    367            �           0    0 *   COLUMN txposturecurve.theorical_uniformity    COMMENT     X   COMMENT ON COLUMN public.txposturecurve.theorical_uniformity IS 'Uniformidad teórica';
            public       postgres    false    367            �           0    0 +   COLUMN txposturecurve.historical_uniformity    COMMENT     [   COMMENT ON COLUMN public.txposturecurve.historical_uniformity IS 'Uniformidad histórica';
            public       postgres    false    367            �           0    0 "   COLUMN txposturecurve.type_posture    COMMENT     K   COMMENT ON COLUMN public.txposturecurve.type_posture IS 'Tipo de postura';
            public       postgres    false    367            p           1259    138584    txprogrammed_eggs    TABLE     �  CREATE TABLE public.txprogrammed_eggs (
    programmed_eggs_id integer DEFAULT nextval('public.programmed_eggs_id_seq'::regclass) NOT NULL,
    incubator_id integer NOT NULL,
    lot_breed character varying(45),
    lot_incubator character varying(45),
    use_date date,
    eggs integer,
    breed_id integer NOT NULL,
    execution_quantity integer,
    eggs_storage_id integer NOT NULL,
    confirm integer,
    released boolean,
    eggs_movements_id integer,
    disable boolean,
    synchronized boolean,
    order_p character varying,
    lot_sap character varying,
    end_lot boolean,
    diff_days integer,
    programmed_disable boolean
);
 %   DROP TABLE public.txprogrammed_eggs;
       public         postgres    false    291    3            �           0    0    TABLE txprogrammed_eggs    COMMENT        COMMENT ON TABLE public.txprogrammed_eggs IS 'Almacena la proyección, programación y ejecución del módulo de incubadoras';
            public       postgres    false    368            �           0    0 +   COLUMN txprogrammed_eggs.programmed_eggs_id    COMMENT     k   COMMENT ON COLUMN public.txprogrammed_eggs.programmed_eggs_id IS 'ID de las programación de incubadoras';
            public       postgres    false    368            �           0    0 %   COLUMN txprogrammed_eggs.incubator_id    COMMENT     O   COMMENT ON COLUMN public.txprogrammed_eggs.incubator_id IS 'ID de incubadora';
            public       postgres    false    368            �           0    0 "   COLUMN txprogrammed_eggs.lot_breed    COMMENT     I   COMMENT ON COLUMN public.txprogrammed_eggs.lot_breed IS 'Lote por raza';
            public       postgres    false    368            �           0    0 &   COLUMN txprogrammed_eggs.lot_incubator    COMMENT     S   COMMENT ON COLUMN public.txprogrammed_eggs.lot_incubator IS 'Lote de incubadoras';
            public       postgres    false    368            �           0    0 !   COLUMN txprogrammed_eggs.use_date    COMMENT     N   COMMENT ON COLUMN public.txprogrammed_eggs.use_date IS 'Fecha de ejecución';
            public       postgres    false    368            �           0    0    COLUMN txprogrammed_eggs.eggs    COMMENT     I   COMMENT ON COLUMN public.txprogrammed_eggs.eggs IS 'Cantidad de huevos';
            public       postgres    false    368            �           0    0 !   COLUMN txprogrammed_eggs.breed_id    COMMENT     E   COMMENT ON COLUMN public.txprogrammed_eggs.breed_id IS 'ID de raza';
            public       postgres    false    368            �           0    0 +   COLUMN txprogrammed_eggs.execution_quantity    COMMENT     [   COMMENT ON COLUMN public.txprogrammed_eggs.execution_quantity IS 'Cantidad de ejecución';
            public       postgres    false    368            �           0    0 (   COLUMN txprogrammed_eggs.eggs_storage_id    COMMENT     n   COMMENT ON COLUMN public.txprogrammed_eggs.eggs_storage_id IS 'ID de la disponibilidad en planta incubadora';
            public       postgres    false    368            �           0    0 !   COLUMN txprogrammed_eggs.released    COMMENT     �   COMMENT ON COLUMN public.txprogrammed_eggs.released IS 'Indica si la programación ya se liberó al concluir los 21 días establecidos';
            public       postgres    false    368            �           0    0 *   COLUMN txprogrammed_eggs.eggs_movements_id    COMMENT     �   COMMENT ON COLUMN public.txprogrammed_eggs.eggs_movements_id IS 'ID del movimiento de almacén asociado a la programación de incubación';
            public       postgres    false    368            �           0    0 %   COLUMN txprogrammed_eggs.synchronized    COMMENT     Y   COMMENT ON COLUMN public.txprogrammed_eggs.synchronized IS 'Indica si fue sincronizado';
            public       postgres    false    368            �           0    0     COLUMN txprogrammed_eggs.order_p    COMMENT     `   COMMENT ON COLUMN public.txprogrammed_eggs.order_p IS 'Indica el número de orden previsional';
            public       postgres    false    368            �           0    0     COLUMN txprogrammed_eggs.lot_sap    COMMENT     T   COMMENT ON COLUMN public.txprogrammed_eggs.lot_sap IS 'Indica número de lote SAP';
            public       postgres    false    368            �           0    0     COLUMN txprogrammed_eggs.end_lot    COMMENT     u   COMMENT ON COLUMN public.txprogrammed_eggs.end_lot IS 'Indica si el lote fue cerrado para notificaciones de huevos';
            public       postgres    false    368            �           0    0 "   COLUMN txprogrammed_eggs.diff_days    COMMENT     x   COMMENT ON COLUMN public.txprogrammed_eggs.diff_days IS 'Indica la diferencia de días para evitar los días feriados';
            public       postgres    false    368            �           0    0 +   COLUMN txprogrammed_eggs.programmed_disable    COMMENT     \   COMMENT ON COLUMN public.txprogrammed_eggs.programmed_disable IS 'Indica si fue eliminado';
            public       postgres    false    368            q           1259    138591    txscenarioformula    TABLE     y  CREATE TABLE public.txscenarioformula (
    scenario_formula_id integer DEFAULT nextval('public.scenario_formula_id_seq'::regclass) NOT NULL,
    process_id integer NOT NULL,
    predecessor_id integer,
    parameter_id integer NOT NULL,
    sign integer,
    divider double precision,
    duration integer,
    scenario_id integer NOT NULL,
    measure_id integer NOT NULL
);
 %   DROP TABLE public.txscenarioformula;
       public         postgres    false    293    3            �           0    0    TABLE txscenarioformula    COMMENT     �   COMMENT ON TABLE public.txscenarioformula IS 'Almacena los datos para la formulación de salida de la planificación regresiva';
            public       postgres    false    369            �           0    0 ,   COLUMN txscenarioformula.scenario_formula_id    COMMENT     e   COMMENT ON COLUMN public.txscenarioformula.scenario_formula_id IS 'ID de la fórmula del escenario';
            public       postgres    false    369            �           0    0 #   COLUMN txscenarioformula.process_id    COMMENT     K   COMMENT ON COLUMN public.txscenarioformula.process_id IS 'ID del proceso';
            public       postgres    false    369            �           0    0 '   COLUMN txscenarioformula.predecessor_id    COMMENT     R   COMMENT ON COLUMN public.txscenarioformula.predecessor_id IS 'ID del predecesor';
            public       postgres    false    369            �           0    0 %   COLUMN txscenarioformula.parameter_id    COMMENT     P   COMMENT ON COLUMN public.txscenarioformula.parameter_id IS 'ID del parámetro';
            public       postgres    false    369            �           0    0    COLUMN txscenarioformula.sign    COMMENT     E   COMMENT ON COLUMN public.txscenarioformula.sign IS 'Firma de datos';
            public       postgres    false    369            �           0    0     COLUMN txscenarioformula.divider    COMMENT     J   COMMENT ON COLUMN public.txscenarioformula.divider IS 'Divisor de datos';
            public       postgres    false    369            �           0    0 !   COLUMN txscenarioformula.duration    COMMENT     S   COMMENT ON COLUMN public.txscenarioformula.duration IS 'Duración de la fórmula';
            public       postgres    false    369            �           0    0 $   COLUMN txscenarioformula.scenario_id    COMMENT     N   COMMENT ON COLUMN public.txscenarioformula.scenario_id IS 'ID del escenario';
            public       postgres    false    369            �           0    0 #   COLUMN txscenarioformula.measure_id    COMMENT     L   COMMENT ON COLUMN public.txscenarioformula.measure_id IS 'ID de la medida';
            public       postgres    false    369            r           1259    138595    txscenarioparameter    TABLE     l  CREATE TABLE public.txscenarioparameter (
    scenario_parameter_id integer DEFAULT nextval('public.scenario_parameter_id_seq'::regclass) NOT NULL,
    process_id integer NOT NULL,
    parameter_id integer NOT NULL,
    use_year integer,
    use_month integer,
    use_value integer,
    scenario_id integer NOT NULL,
    value_units integer DEFAULT 0 NOT NULL
);
 '   DROP TABLE public.txscenarioparameter;
       public         postgres    false    295    3            �           0    0    TABLE txscenarioparameter    COMMENT     s   COMMENT ON TABLE public.txscenarioparameter IS 'Almacena las metas de producción ingresadas para los escenarios';
            public       postgres    false    370            �           0    0 0   COLUMN txscenarioparameter.scenario_parameter_id    COMMENT     m   COMMENT ON COLUMN public.txscenarioparameter.scenario_parameter_id IS 'ID de los parámetros del escenario';
            public       postgres    false    370            �           0    0 %   COLUMN txscenarioparameter.process_id    COMMENT     M   COMMENT ON COLUMN public.txscenarioparameter.process_id IS 'ID del proceso';
            public       postgres    false    370            �           0    0 '   COLUMN txscenarioparameter.parameter_id    COMMENT     R   COMMENT ON COLUMN public.txscenarioparameter.parameter_id IS 'ID del parámetro';
            public       postgres    false    370            �           0    0 #   COLUMN txscenarioparameter.use_year    COMMENT     P   COMMENT ON COLUMN public.txscenarioparameter.use_year IS 'Año del parámetro';
            public       postgres    false    370            �           0    0 $   COLUMN txscenarioparameter.use_month    COMMENT     P   COMMENT ON COLUMN public.txscenarioparameter.use_month IS 'Mes del párametro';
            public       postgres    false    370            �           0    0 $   COLUMN txscenarioparameter.use_value    COMMENT     R   COMMENT ON COLUMN public.txscenarioparameter.use_value IS 'Valor del parámetro';
            public       postgres    false    370            �           0    0 &   COLUMN txscenarioparameter.scenario_id    COMMENT     P   COMMENT ON COLUMN public.txscenarioparameter.scenario_id IS 'ID del escenario';
            public       postgres    false    370            �           0    0 &   COLUMN txscenarioparameter.value_units    COMMENT     U   COMMENT ON COLUMN public.txscenarioparameter.value_units IS 'Valor de las unidades';
            public       postgres    false    370            s           1259    138600    txscenarioparameterday    TABLE     {  CREATE TABLE public.txscenarioparameterday (
    scenario_parameter_day_id integer DEFAULT nextval('public.scenario_parameter_day_seq'::regclass) NOT NULL,
    use_day integer,
    parameter_id integer NOT NULL,
    units_day integer,
    scenario_id integer NOT NULL,
    sequence integer,
    use_month integer,
    use_year integer,
    week_day integer,
    use_week date
);
 *   DROP TABLE public.txscenarioparameterday;
       public         postgres    false    294    3            �           0    0    TABLE txscenarioparameterday    COMMENT     W   COMMENT ON TABLE public.txscenarioparameterday IS 'Almacena los parámetros por día';
            public       postgres    false    371            �           0    0 7   COLUMN txscenarioparameterday.scenario_parameter_day_id    COMMENT     o   COMMENT ON COLUMN public.txscenarioparameterday.scenario_parameter_day_id IS 'ID de los parámetros del día';
            public       postgres    false    371            �           0    0 %   COLUMN txscenarioparameterday.use_day    COMMENT     C   COMMENT ON COLUMN public.txscenarioparameterday.use_day IS 'Día';
            public       postgres    false    371            �           0    0 *   COLUMN txscenarioparameterday.parameter_id    COMMENT     d   COMMENT ON COLUMN public.txscenarioparameterday.parameter_id IS 'ID de los párametros necesarios';
            public       postgres    false    371            �           0    0 '   COLUMN txscenarioparameterday.units_day    COMMENT     U   COMMENT ON COLUMN public.txscenarioparameterday.units_day IS 'Cantidad de material';
            public       postgres    false    371            �           0    0 )   COLUMN txscenarioparameterday.scenario_id    COMMENT     S   COMMENT ON COLUMN public.txscenarioparameterday.scenario_id IS 'ID del escenario';
            public       postgres    false    371            �           0    0 &   COLUMN txscenarioparameterday.sequence    COMMENT     R   COMMENT ON COLUMN public.txscenarioparameterday.sequence IS 'Secuencia del día';
            public       postgres    false    371            �           0    0 '   COLUMN txscenarioparameterday.use_month    COMMENT     ]   COMMENT ON COLUMN public.txscenarioparameterday.use_month IS 'Mes en que se ubica el día ';
            public       postgres    false    371            �           0    0 &   COLUMN txscenarioparameterday.use_year    COMMENT     ]   COMMENT ON COLUMN public.txscenarioparameterday.use_year IS 'Año en que se ubica el día ';
            public       postgres    false    371            �           0    0 &   COLUMN txscenarioparameterday.week_day    COMMENT     Q   COMMENT ON COLUMN public.txscenarioparameterday.week_day IS 'Día de la semana';
            public       postgres    false    371            �           0    0 &   COLUMN txscenarioparameterday.use_week    COMMENT     F   COMMENT ON COLUMN public.txscenarioparameterday.use_week IS 'Semana';
            public       postgres    false    371            t           1259    138604    txscenarioposturecurve    TABLE     3  CREATE TABLE public.txscenarioposturecurve (
    scenario_posture_id integer DEFAULT nextval('public.scenario_posture_id_seq'::regclass) NOT NULL,
    posture_date date,
    eggs double precision,
    scenario_id integer NOT NULL,
    housingway_detail_id integer NOT NULL,
    breed_id integer NOT NULL
);
 *   DROP TABLE public.txscenarioposturecurve;
       public         postgres    false    296    3            �           0    0    TABLE txscenarioposturecurve    COMMENT     o   COMMENT ON TABLE public.txscenarioposturecurve IS 'Almacena los datos que se utilizan en la curva de postura';
            public       postgres    false    372            �           0    0 1   COLUMN txscenarioposturecurve.scenario_posture_id    COMMENT     i   COMMENT ON COLUMN public.txscenarioposturecurve.scenario_posture_id IS 'ID de la postura del escenario';
            public       postgres    false    372            �           0    0 *   COLUMN txscenarioposturecurve.posture_date    COMMENT     W   COMMENT ON COLUMN public.txscenarioposturecurve.posture_date IS 'Fecha de la postura';
            public       postgres    false    372            �           0    0 "   COLUMN txscenarioposturecurve.eggs    COMMENT     N   COMMENT ON COLUMN public.txscenarioposturecurve.eggs IS 'Cantidad de huevos';
            public       postgres    false    372            �           0    0 )   COLUMN txscenarioposturecurve.scenario_id    COMMENT     S   COMMENT ON COLUMN public.txscenarioposturecurve.scenario_id IS 'ID del escenario';
            public       postgres    false    372            �           0    0 2   COLUMN txscenarioposturecurve.housingway_detail_id    COMMENT     �   COMMENT ON COLUMN public.txscenarioposturecurve.housingway_detail_id IS 'ID de la programación y ejecución de los modelos de levante y cría y reproductora';
            public       postgres    false    372            �           0    0 &   COLUMN txscenarioposturecurve.breed_id    COMMENT     M   COMMENT ON COLUMN public.txscenarioposturecurve.breed_id IS 'ID de la raza';
            public       postgres    false    372            u           1259    138608    txscenarioprocess    TABLE     4  CREATE TABLE public.txscenarioprocess (
    scenario_process_id integer DEFAULT nextval('public.scenario_process_id_seq'::regclass) NOT NULL,
    process_id integer NOT NULL,
    decrease_goal double precision,
    weight_goal double precision,
    duration_goal integer,
    scenario_id integer NOT NULL
);
 %   DROP TABLE public.txscenarioprocess;
       public         postgres    false    297    3            �           0    0    TABLE txscenarioprocess    COMMENT     m   COMMENT ON TABLE public.txscenarioprocess IS 'Almacena los procesos asociados a cada uno de los escenarios';
            public       postgres    false    373            �           0    0 ,   COLUMN txscenarioprocess.scenario_process_id    COMMENT     a   COMMENT ON COLUMN public.txscenarioprocess.scenario_process_id IS 'ID del proceso de escenario';
            public       postgres    false    373            �           0    0 #   COLUMN txscenarioprocess.process_id    COMMENT     V   COMMENT ON COLUMN public.txscenarioprocess.process_id IS 'ID del proceso a utilizar';
            public       postgres    false    373            �           0    0 &   COLUMN txscenarioprocess.decrease_goal    COMMENT     x   COMMENT ON COLUMN public.txscenarioprocess.decrease_goal IS 'Guarda los datos de la merma histórica en dicho proceso';
            public       postgres    false    373            �           0    0 $   COLUMN txscenarioprocess.weight_goal    COMMENT     s   COMMENT ON COLUMN public.txscenarioprocess.weight_goal IS 'Guarda los datos del peso histórico en dicho proceso';
            public       postgres    false    373            �           0    0 &   COLUMN txscenarioprocess.duration_goal    COMMENT     z   COMMENT ON COLUMN public.txscenarioprocess.duration_goal IS 'Guarda los datos de la duración historia en dicho proceso';
            public       postgres    false    373            �           0    0 $   COLUMN txscenarioprocess.scenario_id    COMMENT     X   COMMENT ON COLUMN public.txscenarioprocess.scenario_id IS 'ID del escenario utilizado';
            public       postgres    false    373            v           1259    138612    txsync    TABLE     +  CREATE TABLE public.txsync (
    sync_id integer NOT NULL,
    lot character varying NOT NULL,
    scheduled_date date,
    scheduled_quantity integer,
    farm_code character varying,
    shed_code character varying,
    execution_date date,
    execution_quantity integer,
    is_error boolean
);
    DROP TABLE public.txsync;
       public         postgres    false    3                        0    0    TABLE txsync    COMMENT     N   COMMENT ON TABLE public.txsync IS 'Almacena los datos de la sincronización';
            public       postgres    false    374                       0    0    COLUMN txsync.sync_id    COMMENT     A   COMMENT ON COLUMN public.txsync.sync_id IS 'ID de la relación';
            public       postgres    false    374                       0    0    COLUMN txsync.lot    COMMENT     /   COMMENT ON COLUMN public.txsync.lot IS 'Lote';
            public       postgres    false    374                       0    0    COLUMN txsync.scheduled_date    COMMENT     F   COMMENT ON COLUMN public.txsync.scheduled_date IS 'Fecha programada';
            public       postgres    false    374                       0    0     COLUMN txsync.scheduled_quantity    COMMENT     M   COMMENT ON COLUMN public.txsync.scheduled_quantity IS 'Cantidad programada';
            public       postgres    false    374                       0    0    COLUMN txsync.farm_code    COMMENT     E   COMMENT ON COLUMN public.txsync.farm_code IS 'Código de la granja';
            public       postgres    false    374                       0    0    COLUMN txsync.shed_code    COMMENT     D   COMMENT ON COLUMN public.txsync.shed_code IS 'Código del galpón';
            public       postgres    false    374                       0    0    COLUMN txsync.execution_date    COMMENT     E   COMMENT ON COLUMN public.txsync.execution_date IS 'Fecha ejecutada';
            public       postgres    false    374                       0    0     COLUMN txsync.execution_quantity    COMMENT     L   COMMENT ON COLUMN public.txsync.execution_quantity IS 'Cantidad ejecutada';
            public       postgres    false    374            	           0    0    COLUMN txsync.is_error    COMMENT     P   COMMENT ON COLUMN public.txsync.is_error IS 'Indica si el registro el válido';
            public       postgres    false    374            w           1259    138618    txsync_sync_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txsync_sync_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.txsync_sync_id_seq;
       public       postgres    false    374    3            
           0    0    txsync_sync_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.txsync_sync_id_seq OWNED BY public.txsync.sync_id;
            public       postgres    false    375            x           1259    138620 #   user_application_application_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_application_application_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 :   DROP SEQUENCE public.user_application_application_id_seq;
       public       postgres    false    3            y           1259    138622     user_application_user_app_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_application_user_app_id_seq
    START WITH 215
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 7   DROP SEQUENCE public.user_application_user_app_id_seq;
       public       postgres    false    3            z           1259    138624    user_application_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_application_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 3   DROP SEQUENCE public.user_application_user_id_seq;
       public       postgres    false    3            {           1259    138626    warehouse_id_seq    SEQUENCE     y   CREATE SEQUENCE public.warehouse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.warehouse_id_seq;
       public       postgres    false    3            �           2604    138628 ,   md_optimizer_parameter optimizerparameter_id    DEFAULT     �   ALTER TABLE ONLY public.md_optimizer_parameter ALTER COLUMN optimizerparameter_id SET DEFAULT nextval('public.md_optimizer_parameter_optimizerparameter_id_seq'::regclass);
 [   ALTER TABLE public.md_optimizer_parameter ALTER COLUMN optimizerparameter_id DROP DEFAULT;
       public       postgres    false    246    245            �           2604    138629    mdadjustment adjustment_id    DEFAULT     �   ALTER TABLE ONLY public.mdadjustment ALTER COLUMN adjustment_id SET DEFAULT nextval('public.mdadjustment_adjustment_id_seq'::regclass);
 I   ALTER TABLE public.mdadjustment ALTER COLUMN adjustment_id DROP DEFAULT;
       public       postgres    false    248    247            �           2604    138630 *   mdequivalenceproduct equivalenceproduct_id    DEFAULT     �   ALTER TABLE ONLY public.mdequivalenceproduct ALTER COLUMN equivalenceproduct_id SET DEFAULT nextval('public.mdequivalenceproduct_equivalenceproduct_id_seq'::regclass);
 Y   ALTER TABLE public.mdequivalenceproduct ALTER COLUMN equivalenceproduct_id DROP DEFAULT;
       public       postgres    false    256    255            �           2604    138631 *   osadjustmentscontrol adjustmentscontrol_id    DEFAULT     �   ALTER TABLE ONLY public.osadjustmentscontrol ALTER COLUMN adjustmentscontrol_id SET DEFAULT nextval('public.osadjustmentscontrol_adjustmentscontrol_id_seq'::regclass);
 Y   ALTER TABLE public.osadjustmentscontrol ALTER COLUMN adjustmentscontrol_id DROP DEFAULT;
       public       postgres    false    277    276            �           2604    138632 ,   slmdevictionpartition slevictionpartition_id    DEFAULT     �   ALTER TABLE ONLY public.slmdevictionpartition ALTER COLUMN slevictionpartition_id SET DEFAULT nextval('public.slmdevictionpartition_slevictionpartition_id_seq'::regclass);
 [   ALTER TABLE public.slmdevictionpartition ALTER COLUMN slevictionpartition_id DROP DEFAULT;
       public       postgres    false    300    299            �           2604    138633 2   slmdgenderclassification slgenderclassification_id    DEFAULT     �   ALTER TABLE ONLY public.slmdgenderclassification ALTER COLUMN slgenderclassification_id SET DEFAULT nextval('public.slmdgenderclassification_slgenderclassification_id_seq'::regclass);
 a   ALTER TABLE public.slmdgenderclassification ALTER COLUMN slgenderclassification_id DROP DEFAULT;
       public       postgres    false    302    301            �           2604    138634 "   slmdmachinegroup slmachinegroup_id    DEFAULT     �   ALTER TABLE ONLY public.slmdmachinegroup ALTER COLUMN slmachinegroup_id SET DEFAULT nextval('public.slmdmachinegroup_slmachinegroup_id_seq'::regclass);
 Q   ALTER TABLE public.slmdmachinegroup ALTER COLUMN slmachinegroup_id DROP DEFAULT;
       public       postgres    false    304    303            �           2604    138635    slmdprocess slprocess_id    DEFAULT     �   ALTER TABLE ONLY public.slmdprocess ALTER COLUMN slprocess_id SET DEFAULT nextval('public.slmdprocess_slprocess_id_seq'::regclass);
 G   ALTER TABLE public.slmdprocess ALTER COLUMN slprocess_id DROP DEFAULT;
       public       postgres    false    306    305            �           2604    138636    sltxb_shed slb_shed_id    DEFAULT     �   ALTER TABLE ONLY public.sltxb_shed ALTER COLUMN slb_shed_id SET DEFAULT nextval('public.sltxb_shed_slb_shed_id_seq'::regclass);
 E   ALTER TABLE public.sltxb_shed ALTER COLUMN slb_shed_id DROP DEFAULT;
       public       postgres    false    308    307            �           2604    138637    sltxbr_shed slbr_shed_id    DEFAULT     �   ALTER TABLE ONLY public.sltxbr_shed ALTER COLUMN slbr_shed_id SET DEFAULT nextval('public.sltxbr_shed_slbr_shed_id_seq'::regclass);
 G   ALTER TABLE public.sltxbr_shed ALTER COLUMN slbr_shed_id DROP DEFAULT;
       public       postgres    false    310    309            �           2604    138638    sltxbreeding slbreeding_id    DEFAULT     �   ALTER TABLE ONLY public.sltxbreeding ALTER COLUMN slbreeding_id SET DEFAULT nextval('public.sltxbreeding_slbreeding_id_seq'::regclass);
 I   ALTER TABLE public.sltxbreeding ALTER COLUMN slbreeding_id DROP DEFAULT;
       public       postgres    false    312    311            �           2604    138639    sltxbroiler slbroiler_id    DEFAULT     �   ALTER TABLE ONLY public.sltxbroiler ALTER COLUMN slbroiler_id SET DEFAULT nextval('public.sltxbroiler_slbroiler_id_seq'::regclass);
 G   ALTER TABLE public.sltxbroiler ALTER COLUMN slbroiler_id DROP DEFAULT;
       public       postgres    false    318    313            �           2604    138640 &   sltxbroiler_detail slbroiler_detail_id    DEFAULT     �   ALTER TABLE ONLY public.sltxbroiler_detail ALTER COLUMN slbroiler_detail_id SET DEFAULT nextval('public.sltxbroiler_detail_slbroiler_detail_id_seq'::regclass);
 U   ALTER TABLE public.sltxbroiler_detail ALTER COLUMN slbroiler_detail_id DROP DEFAULT;
       public       postgres    false    315    314            �           2604    138641     sltxbroiler_lot slbroiler_lot_id    DEFAULT     �   ALTER TABLE ONLY public.sltxbroiler_lot ALTER COLUMN slbroiler_lot_id SET DEFAULT nextval('public.sltxbroiler_lot_slbroiler_lot_id_seq'::regclass);
 O   ALTER TABLE public.sltxbroiler_lot ALTER COLUMN slbroiler_lot_id DROP DEFAULT;
       public       postgres    false    317    316            �           2604    138642    sltxincubator slincubator    DEFAULT     �   ALTER TABLE ONLY public.sltxincubator ALTER COLUMN slincubator SET DEFAULT nextval('public.sltxincubator_slincubator_seq'::regclass);
 H   ALTER TABLE public.sltxincubator ALTER COLUMN slincubator DROP DEFAULT;
       public       postgres    false    326    319            �           2604    138643 (   sltxincubator_curve slincubator_curve_id    DEFAULT     �   ALTER TABLE ONLY public.sltxincubator_curve ALTER COLUMN slincubator_curve_id SET DEFAULT nextval('public.sltxincubator_curve_slincubator_curve_id_seq'::regclass);
 W   ALTER TABLE public.sltxincubator_curve ALTER COLUMN slincubator_curve_id DROP DEFAULT;
       public       postgres    false    321    320            �           2604    138644 *   sltxincubator_detail slincubator_detail_id    DEFAULT     �   ALTER TABLE ONLY public.sltxincubator_detail ALTER COLUMN slincubator_detail_id SET DEFAULT nextval('public.sltxincubator_detail_slincubator_detail_id_seq'::regclass);
 Y   ALTER TABLE public.sltxincubator_detail ALTER COLUMN slincubator_detail_id DROP DEFAULT;
       public       postgres    false    323    322            �           2604    138645 $   sltxincubator_lot slincubator_lot_id    DEFAULT     �   ALTER TABLE ONLY public.sltxincubator_lot ALTER COLUMN slincubator_lot_id SET DEFAULT nextval('public.sltxincubator_lot_slincubator_lot_id_seq'::regclass);
 S   ALTER TABLE public.sltxincubator_lot ALTER COLUMN slincubator_lot_id DROP DEFAULT;
       public       postgres    false    325    324            �           2604    138646    sltxinventory slinventory_id    DEFAULT     �   ALTER TABLE ONLY public.sltxinventory ALTER COLUMN slinventory_id SET DEFAULT nextval('public.sltxinventory_slinventory_id_seq'::regclass);
 K   ALTER TABLE public.sltxinventory ALTER COLUMN slinventory_id DROP DEFAULT;
       public       postgres    false    328    327            �           2604    138647    sltxlb_shed sllb_shed_id    DEFAULT     �   ALTER TABLE ONLY public.sltxlb_shed ALTER COLUMN sllb_shed_id SET DEFAULT nextval('public.sltxlb_shed_sllb_shed_id_seq'::regclass);
 G   ALTER TABLE public.sltxlb_shed ALTER COLUMN sllb_shed_id DROP DEFAULT;
       public       postgres    false    330    329            �           2604    138648 "   sltxliftbreeding slliftbreeding_id    DEFAULT     �   ALTER TABLE ONLY public.sltxliftbreeding ALTER COLUMN slliftbreeding_id SET DEFAULT nextval('public.sltxliftbreeding_slliftbreeding_id_seq'::regclass);
 Q   ALTER TABLE public.sltxliftbreeding ALTER COLUMN slliftbreeding_id DROP DEFAULT;
       public       postgres    false    332    331            �           2604    138649 "   sltxposturecurve slposturecurve_id    DEFAULT     �   ALTER TABLE ONLY public.sltxposturecurve ALTER COLUMN slposturecurve_id SET DEFAULT nextval('public.sltxposturecurve_slposturecurve_id_seq'::regclass);
 Q   ALTER TABLE public.sltxposturecurve ALTER COLUMN slposturecurve_id DROP DEFAULT;
       public       postgres    false    334    333            �           2604    138650 $   sltxsellspurchase slsellspurchase_id    DEFAULT     �   ALTER TABLE ONLY public.sltxsellspurchase ALTER COLUMN slsellspurchase_id SET DEFAULT nextval('public.sltxsellspurchase_slsellspurchase_id_seq'::regclass);
 S   ALTER TABLE public.sltxsellspurchase ALTER COLUMN slsellspurchase_id DROP DEFAULT;
       public       postgres    false    336    335            �           2604    138651 *   txadjustmentscontrol adjustmentscontrol_id    DEFAULT     �   ALTER TABLE ONLY public.txadjustmentscontrol ALTER COLUMN adjustmentscontrol_id SET DEFAULT nextval('public.txadjustmentscontrol_adjustmentscontrol_id_seq'::regclass);
 Y   ALTER TABLE public.txadjustmentscontrol ALTER COLUMN adjustmentscontrol_id DROP DEFAULT;
       public       postgres    false    338    337            �           2604    138652    txbroiler_lot broiler_lot_id    DEFAULT     �   ALTER TABLE ONLY public.txbroiler_lot ALTER COLUMN broiler_lot_id SET DEFAULT nextval('public.txbroiler_lot_broiler_lot_id_seq'::regclass);
 K   ALTER TABLE public.txbroiler_lot ALTER COLUMN broiler_lot_id DROP DEFAULT;
       public       postgres    false    343    342            �           2604    138653 -   txbroilerheavy_detail broiler_heavy_detail_id    DEFAULT     �   ALTER TABLE ONLY public.txbroilerheavy_detail ALTER COLUMN broiler_heavy_detail_id SET DEFAULT nextval('public.txbroilerheavy_detail_broiler_heavy_detail_id_seq'::regclass);
 \   ALTER TABLE public.txbroilerheavy_detail ALTER COLUMN broiler_heavy_detail_id DROP DEFAULT;
       public       postgres    false    347    346            �           2604    138654    txgoals_erp goals_erp_id    DEFAULT     �   ALTER TABLE ONLY public.txgoals_erp ALTER COLUMN goals_erp_id SET DEFAULT nextval('public.txgoals_erp_goals_erp_id_seq'::regclass);
 G   ALTER TABLE public.txgoals_erp ALTER COLUMN goals_erp_id DROP DEFAULT;
       public       postgres    false    356    355            �           2604    138655 "   txhousingway_lot housingway_lot_id    DEFAULT     �   ALTER TABLE ONLY public.txhousingway_lot ALTER COLUMN housingway_lot_id SET DEFAULT nextval('public.txhousingway_lot_txhousingway_lot_seq'::regclass);
 Q   ALTER TABLE public.txhousingway_lot ALTER COLUMN housingway_lot_id DROP DEFAULT;
       public       postgres    false    360    359            �           2604    138656     txincubator_lot incubator_lot_id    DEFAULT     �   ALTER TABLE ONLY public.txincubator_lot ALTER COLUMN incubator_lot_id SET DEFAULT nextval('public.txincubator_lot_incubator_lot_id_seq'::regclass);
 O   ALTER TABLE public.txincubator_lot ALTER COLUMN incubator_lot_id DROP DEFAULT;
       public       postgres    false    362    361            �           2604    138657 $   txincubator_sales incubator_sales_id    DEFAULT     �   ALTER TABLE ONLY public.txincubator_sales ALTER COLUMN incubator_sales_id SET DEFAULT nextval('public.txincubator_sales_incubator_sales_id_seq'::regclass);
 S   ALTER TABLE public.txincubator_sales ALTER COLUMN incubator_sales_id DROP DEFAULT;
       public       postgres    false    364    363            �           2604    138658    txsync sync_id    DEFAULT     p   ALTER TABLE ONLY public.txsync ALTER COLUMN sync_id SET DEFAULT nextval('public.txsync_sync_id_seq'::regclass);
 =   ALTER TABLE public.txsync ALTER COLUMN sync_id DROP DEFAULT;
       public       postgres    false    375    374            ?          0    138039    aba_breeds_and_stages 
   TABLE DATA               m   COPY public.aba_breeds_and_stages (id, code, name, id_aba_consumption_and_mortality, id_process) FROM stdin;
    public       postgres    false    198   �      A          0    138045    aba_consumption_and_mortality 
   TABLE DATA               m   COPY public.aba_consumption_and_mortality (id, code, name, id_breed, id_stage, id_aba_time_unit) FROM stdin;
    public       postgres    false    200   `�      C          0    138051 $   aba_consumption_and_mortality_detail 
   TABLE DATA               �   COPY public.aba_consumption_and_mortality_detail (id, id_aba_consumption_and_mortality, time_unit_number, consumption, mortality) FROM stdin;
    public       postgres    false    202   ��      E          0    138057    aba_elements 
   TABLE DATA               d   COPY public.aba_elements (id, code, name, id_aba_element_property, equivalent_quantity) FROM stdin;
    public       postgres    false    204   ތ      G          0    138063    aba_elements_and_concentrations 
   TABLE DATA               �   COPY public.aba_elements_and_concentrations (id, id_aba_element, id_aba_formulation, proportion, id_element_equivalent, id_aba_element_property, equivalent_quantity) FROM stdin;
    public       postgres    false    206   	�      I          0    138069    aba_elements_properties 
   TABLE DATA               A   COPY public.aba_elements_properties (id, code, name) FROM stdin;
    public       postgres    false    208   ��      K          0    138075    aba_formulation 
   TABLE DATA               9   COPY public.aba_formulation (id, code, name) FROM stdin;
    public       postgres    false    210   �      N          0    138083    aba_stages_of_breeds_and_stages 
   TABLE DATA               w   COPY public.aba_stages_of_breeds_and_stages (id, id_aba_breeds_and_stages, id_formulation, name, duration) FROM stdin;
    public       postgres    false    213   j�      O          0    138087    aba_time_unit 
   TABLE DATA               G   COPY public.aba_time_unit (id, singular_name, plural_name) FROM stdin;
    public       postgres    false    214   �      n          0    138151    md_optimizer_parameter 
   TABLE DATA                  COPY public.md_optimizer_parameter (optimizerparameter_id, breed_id, max_housing, min_housing, difference, active) FROM stdin;
    public       postgres    false    245   B�      p          0    138156    mdadjustment 
   TABLE DATA               P   COPY public.mdadjustment (adjustment_id, type, prefix, description) FROM stdin;
    public       postgres    false    247   _�      s          0    138166    mdapplication 
   TABLE DATA               O   COPY public.mdapplication (application_id, application_name, type) FROM stdin;
    public       postgres    false    250   ��      u          0    138172    mdapplication_rol 
   TABLE DATA               G   COPY public.mdapplication_rol (id, application_id, rol_id) FROM stdin;
    public       postgres    false    252   �      v          0    138176    mdbreed 
   TABLE DATA               7   COPY public.mdbreed (breed_id, code, name) FROM stdin;
    public       postgres    false    253   p�      w          0    138180    mdbroiler_product 
   TABLE DATA               �   COPY public.mdbroiler_product (broiler_product_id, name, days_eviction, weight, code, breed_id, gender, min_days_eviction, conversion_percentage, type_bird, initial_product) FROM stdin;
    public       postgres    false    254   ��      x          0    138184    mdequivalenceproduct 
   TABLE DATA               o   COPY public.mdequivalenceproduct (equivalenceproduct_id, product_code, equivalence_code, breed_id) FROM stdin;
    public       postgres    false    255   ��      z          0    138189 
   mdfarmtype 
   TABLE DATA               8   COPY public.mdfarmtype (farm_type_id, name) FROM stdin;
    public       postgres    false    257   8�      |          0    138195 	   mdmeasure 
   TABLE DATA               b   COPY public.mdmeasure (measure_id, name, abbreviation, originvalue, valuekg, is_unit) FROM stdin;
    public       postgres    false    259   ��      ~          0    138201    mdparameter 
   TABLE DATA               d   COPY public.mdparameter (parameter_id, description, type, measure_id, process_id, name) FROM stdin;
    public       postgres    false    261   ��      �          0    138210 	   mdprocess 
   TABLE DATA               N  COPY public.mdprocess (process_id, process_order, product_id, stage_id, historical_decrease, theoretical_decrease, historical_weight, theoretical_weight, historical_duration, theoretical_duration, visible, name, predecessor_id, capacity, breed_id, gender, fattening_goal, type_posture, biological_active, sync_considered) FROM stdin;
    public       postgres    false    263   ��      �          0    138216 	   mdproduct 
   TABLE DATA               O   COPY public.mdproduct (product_id, code, name, breed_id, stage_id) FROM stdin;
    public       postgres    false    265   A�      �          0    138222    mdrol 
   TABLE DATA               T   COPY public.mdrol (rol_id, rol_name, admin_user_creator, creation_date) FROM stdin;
    public       postgres    false    267   �      �          0    138228 
   mdscenario 
   TABLE DATA               b   COPY public.mdscenario (scenario_id, description, date_start, date_end, name, status) FROM stdin;
    public       postgres    false    269   l�      �          0    138238    mdshedstatus 
   TABLE DATA               I   COPY public.mdshedstatus (shed_status_id, name, description) FROM stdin;
    public       postgres    false    271   ��      �          0    138244    mdstage 
   TABLE DATA               9   COPY public.mdstage (stage_id, order_, name) FROM stdin;
    public       postgres    false    273   ��      �          0    138250    mduser 
   TABLE DATA                  COPY public.mduser (user_id, username, password, name, lastname, active, admi_user_creator, rol_id, creation_date) FROM stdin;
    public       postgres    false    275   W�      �          0    138257    osadjustmentscontrol 
   TABLE DATA               p   COPY public.osadjustmentscontrol (adjustmentscontrol_id, username, adjustment_date, os_type, os_id) FROM stdin;
    public       postgres    false    276   ��      �          0    138265    oscenter 
   TABLE DATA               g   COPY public.oscenter (center_id, partnership_id, farm_id, name, code, "order", os_disable) FROM stdin;
    public       postgres    false    278   N�      �          0    138269    osfarm 
   TABLE DATA               g   COPY public.osfarm (farm_id, partnership_id, code, name, farm_type_id, _order, os_disable) FROM stdin;
    public       postgres    false    279   ��      �          0    138273    osincubator 
   TABLE DATA               �   COPY public.osincubator (incubator_id, incubator_plant_id, name, code, description, capacity, sunday, monday, tuesday, wednesday, thursday, friday, saturday, available, os_disable, _order) FROM stdin;
    public       postgres    false    280   �      �          0    138277    osincubatorplant 
   TABLE DATA               �   COPY public.osincubatorplant (incubator_plant_id, name, code, description, partnership_id, max_storage, min_storage, acclimatized, suitable, expired, os_disable) FROM stdin;
    public       postgres    false    281   u�      �          0    138283    ospartnership 
   TABLE DATA               e   COPY public.ospartnership (partnership_id, name, address, description, code, os_disable) FROM stdin;
    public       postgres    false    283   ��      �          0    138292    osshed 
   TABLE DATA               O  COPY public.osshed (shed_id, partnership_id, farm_id, center_id, code, statusshed_id, type_id, building_date, stall_width, stall_height, capacity_min, capacity_max, environment_id, rotation_days, nests_quantity, cages_quantity, birds_quantity, capacity_theoretical, avaliable_date, _order, breed_id, os_disable, rehousing) FROM stdin;
    public       postgres    false    285   �      �          0    138303    osslaughterhouse 
   TABLE DATA               u   COPY public.osslaughterhouse (slaughterhouse_id, name, address, description, code, capacity, os_disable) FROM stdin;
    public       postgres    false    287   f�      �          0    138332    slmdevictionpartition 
   TABLE DATA               �   COPY public.slmdevictionpartition (slevictionpartition_id, youngmale, oldmale, youngfemale, oldfemale, active, sl_disable, peasantmale, name) FROM stdin;
    public       postgres    false    299   Ҷ      �          0    138340    slmdgenderclassification 
   TABLE DATA               �   COPY public.slmdgenderclassification (slgenderclassification_id, name, gender, breed_id, weight_gain, age, mortality, sl_disable) FROM stdin;
    public       postgres    false    301   �      �          0    138348    slmdmachinegroup 
   TABLE DATA               �   COPY public.slmdmachinegroup (slmachinegroup_id, incubatorplant_id, name, description, amount_of_charge, charges, sunday, monday, tuesday, wednesday, thursday, friday, saturday, sl_disable) FROM stdin;
    public       postgres    false    303   �      �          0    138356    slmdprocess 
   TABLE DATA               �   COPY public.slmdprocess (slprocess_id, name, stage_id, breed_id, decrease, duration_process, sync_considered, sl_disable) FROM stdin;
    public       postgres    false    305   )�      �          0    138364 
   sltxb_shed 
   TABLE DATA               T   COPY public.sltxb_shed (slb_shed_id, slbreeding_id, center_id, shed_id) FROM stdin;
    public       postgres    false    307   F�      �          0    138369    sltxbr_shed 
   TABLE DATA               a   COPY public.sltxbr_shed (slbr_shed_id, slbroiler_detail_id, center_id, shed_id, lot) FROM stdin;
    public       postgres    false    309   c�      �          0    138377    sltxbreeding 
   TABLE DATA                 COPY public.sltxbreeding (slbreeding_id, stage_id, scenario_id, partnership_id, breed_id, farm_id, programmed_quantity, execution_quantity, housing_date, execution_date, start_posture_date, mortality, lot, associated, decrease, duration, sl_disable) FROM stdin;
    public       postgres    false    311   ��      �          0    138385    sltxbroiler 
   TABLE DATA               �   COPY public.sltxbroiler (slbroiler_id, scheduled_date, scheduled_quantity, real_quantity, gender, incubatorplant_id, sl_disable, slincubator_detail_id) FROM stdin;
    public       postgres    false    313   ��      �          0    138388    sltxbroiler_detail 
   TABLE DATA                  COPY public.sltxbroiler_detail (slbroiler_detail_id, farm_id, housing_date, housing_quantity, eviction_date, eviction_quantity, category, age, weightgain, synchronized, lot, order_p, executed, sl_disable, youngmale, oldmale, peasantmale, youngfemale, oldfemale, slbroiler_id) FROM stdin;
    public       postgres    false    314   ��      �          0    138396    sltxbroiler_lot 
   TABLE DATA               �   COPY public.sltxbroiler_lot (slbroiler_lot_id, slbroiler_detail_id, slbroiler_id, quantity, sl_disable, slsellspurchase_id, gender) FROM stdin;
    public       postgres    false    316   ׷      �          0    138403    sltxincubator 
   TABLE DATA               �   COPY public.sltxincubator (slincubator, scenario_id, incubatorplant_id, scheduled_date, scheduled_quantity, eggsrequired, sl_disable) FROM stdin;
    public       postgres    false    319   ��      �          0    138406    sltxincubator_curve 
   TABLE DATA               |   COPY public.sltxincubator_curve (slincubator_curve_id, slposturecurve_id, slincubator_id, quantity, sl_disable) FROM stdin;
    public       postgres    false    320   �      �          0    138411    sltxincubator_detail 
   TABLE DATA               �   COPY public.sltxincubator_detail (slincubator_detail_id, incubator_id, programmed_date, slmachinegroup_id, programmed_quantity, associated, decrease, real_decrease, duration, sl_disable, identifier) FROM stdin;
    public       postgres    false    322   .�      �          0    138419    sltxincubator_lot 
   TABLE DATA               �   COPY public.sltxincubator_lot (slincubator_lot_id, slincubator_detail_id, slincubator_curve_id, quantity, sl_disable, slsellspurchase_id) FROM stdin;
    public       postgres    false    324   K�      �          0    138426    sltxinventory 
   TABLE DATA               v   COPY public.sltxinventory (slinventory_id, scenario_id, week_date, execution_eggs, execution_plexus_eggs) FROM stdin;
    public       postgres    false    327   h�      �          0    138431    sltxlb_shed 
   TABLE DATA               Z   COPY public.sltxlb_shed (sllb_shed_id, slliftbreeding_id, center_id, shed_id) FROM stdin;
    public       postgres    false    329   ��      �          0    138436    sltxliftbreeding 
   TABLE DATA               �   COPY public.sltxliftbreeding (slliftbreeding_id, stage_id, scenario_id, partnership_id, breed_id, farm_id, scheduled_date, execution_date, demand_birds, received_birds, associated, decrease, duration, slbreeding_id, sl_disable) FROM stdin;
    public       postgres    false    331   ��      �          0    138441    sltxposturecurve 
   TABLE DATA               �   COPY public.sltxposturecurve (slposturecurve_id, scenario_id, breed_id, slbreeding_id, weekly_curve, posture_date, posture_quantity, associated, sl_disable) FROM stdin;
    public       postgres    false    333   ��      �          0    138446    sltxsellspurchase 
   TABLE DATA               �   COPY public.sltxsellspurchase (slsellspurchase_id, scenario_id, programmed_date, concept, quantity, type, breed_id, description, sl_disable, lot) FROM stdin;
    public       postgres    false    335   ܸ      �          0    138454    txadjustmentscontrol 
   TABLE DATA               v   COPY public.txadjustmentscontrol (adjustmentscontrol_id, username, adjustment_date, lot_arp, description) FROM stdin;
    public       postgres    false    337   ��      �          0    138462    txavailabilitysheds 
   TABLE DATA               k   COPY public.txavailabilitysheds (availability_shed_id, shed_id, init_date, end_date, lot_code) FROM stdin;
    public       postgres    false    339   \�      �          0    138466 	   txbroiler 
   TABLE DATA               �   COPY public.txbroiler (broiler_id, projected_date, projected_quantity, partnership_id, scenario_id, breed_id, lot_incubator, programmed_eggs_id, evictionprojected) FROM stdin;
    public       postgres    false    340   y�      �          0    138470    txbroiler_detail 
   TABLE DATA               Y  COPY public.txbroiler_detail (broiler_detail_id, broiler_id, scheduled_date, scheduled_quantity, farm_id, shed_id, confirm, execution_date, execution_quantity, lot, broiler_product_id, center_id, executionfarm_id, executioncenter_id, executionshed_id, programmed_disable, synchronized, order_p, lot_sap, tight, eviction, closed_lot) FROM stdin;
    public       postgres    false    341   ��      �          0    138477    txbroiler_lot 
   TABLE DATA               `   COPY public.txbroiler_lot (broiler_lot_id, broiler_detail_id, broiler_id, quantity) FROM stdin;
    public       postgres    false    342   ��      �          0    138482    txbroilereviction 
   TABLE DATA               �   COPY public.txbroilereviction (broilereviction_id, projected_date, projected_quantity, partnership_id, scenario_id, breed_id, lot_incubator, broiler_detail_id, evictionprojected, broiler_heavy_detail_id) FROM stdin;
    public       postgres    false    344   й      �          0    138486    txbroilereviction_detail 
   TABLE DATA               X  COPY public.txbroilereviction_detail (broilereviction_detail_id, broilereviction_id, scheduled_date, scheduled_quantity, farm_id, shed_id, confirm, execution_date, execution_quantity, lot, broiler_product_id, slaughterhouse_id, center_id, executionslaughterhouse_id, programmed_disable, synchronized, order_p, eviction, closed_lot) FROM stdin;
    public       postgres    false    345   ��      �          0    138493    txbroilerheavy_detail 
   TABLE DATA                 COPY public.txbroilerheavy_detail (broiler_heavy_detail_id, programmed_date, programmed_quantity, broiler_detail_id, broiler_product_id, lot, execution_date, execution_quantity, tight, closed_lot, programmed_disable, synchronized, order_p, lot_sap, eviction) FROM stdin;
    public       postgres    false    346   
�      �          0    138501    txbroilerproduct_detail 
   TABLE DATA               y   COPY public.txbroilerproduct_detail (broilerproduct_detail_id, broiler_detail, broiler_product_id, quantity) FROM stdin;
    public       postgres    false    348   '�      �          0    138505    txbroodermachine 
   TABLE DATA               �   COPY public.txbroodermachine (brooder_machine_id_seq, partnership_id, farm_id, capacity, sunday, monday, tuesday, wednesday, thursday, friday, saturday, name) FROM stdin;
    public       postgres    false    349   D�      �          0    138519    txeggs_movements 
   TABLE DATA               �   COPY public.txeggs_movements (eggs_movements_id, fecha_movements, lot, quantity, type_movements, eggs_storage_id, description_adjustment, justification, programmed_eggs_id, programmed_disable) FROM stdin;
    public       postgres    false    351   a�      �          0    138526    txeggs_planning 
   TABLE DATA               y   COPY public.txeggs_planning (egg_planning_id, month_planning, year_planning, scenario_id, planned, breed_id) FROM stdin;
    public       postgres    false    352   ~�      �          0    138530    txeggs_required 
   TABLE DATA               p   COPY public.txeggs_required (egg_required_id, use_month, use_year, scenario_id, required, breed_id) FROM stdin;
    public       postgres    false    353   ��      �          0    138534    txeggs_storage 
   TABLE DATA               �   COPY public.txeggs_storage (eggs_storage_id, incubator_plant_id, scenario_id, breed_id, init_date, end_date, lot, eggs, eggs_executed, origin, synchronized, lot_sap, evictionprojected) FROM stdin;
    public       postgres    false    354   ��      �          0    138541    txgoals_erp 
   TABLE DATA               g   COPY public.txgoals_erp (goals_erp_id, use_week, use_value, product_id, code, scenario_id) FROM stdin;
    public       postgres    false    355   պ      �          0    138546    txhousingway 
   TABLE DATA               �   COPY public.txhousingway (housing_way_id, projected_quantity, projected_date, stage_id, partnership_id, scenario_id, breed_id, predecessor_id, projected_disable, evictionprojected) FROM stdin;
    public       postgres    false    357   �      �          0    138550    txhousingway_detail 
   TABLE DATA               s  COPY public.txhousingway_detail (housingway_detail_id, housing_way_id, scheduled_date, scheduled_quantity, farm_id, shed_id, confirm, execution_date, execution_quantity, lot, incubator_plant_id, center_id, executionfarm_id, executioncenter_id, executionshed_id, executionincubatorplant_id, programmed_disable, synchronized, order_p, lot_sap, tight, eviction) FROM stdin;
    public       postgres    false    358   �      �          0    138557    txhousingway_lot 
   TABLE DATA               o   COPY public.txhousingway_lot (housingway_lot_id, production_id, housingway_id, quantity, stage_id) FROM stdin;
    public       postgres    false    359   ,�      �          0    138562    txincubator_lot 
   TABLE DATA               l   COPY public.txincubator_lot (incubator_lot_id, programmed_eggs_id, eggs_movements_id, quantity) FROM stdin;
    public       postgres    false    361   I�      �          0    138567    txincubator_sales 
   TABLE DATA               �   COPY public.txincubator_sales (incubator_sales_id, date_sale, quantity, gender, incubator_plant_id, breed_id, programmed_disable) FROM stdin;
    public       postgres    false    363   f�      �          0    138572    txlot 
   TABLE DATA               �   COPY public.txlot (lot_id, lot_code, lot_origin, status, proyected_date, sheduled_date, proyected_quantity, sheduled_quantity, released_quantity, product_id, breed_id, gender, type_posture, shed_id, origin, farm_id, housing_way_id) FROM stdin;
    public       postgres    false    365   ��      �          0    138576 
   txlot_eggs 
   TABLE DATA               Y   COPY public.txlot_eggs (lot_eggs_id, theorical_performance, week_date, week) FROM stdin;
    public       postgres    false    366   ��      �          0    138580    txposturecurve 
   TABLE DATA               �   COPY public.txposturecurve (posture_curve_id, week, breed_id, theorical_performance, historical_performance, theorical_accum_mortality, historical_accum_mortality, theorical_uniformity, historical_uniformity, type_posture) FROM stdin;
    public       postgres    false    367   ��      �          0    138584    txprogrammed_eggs 
   TABLE DATA                 COPY public.txprogrammed_eggs (programmed_eggs_id, incubator_id, lot_breed, lot_incubator, use_date, eggs, breed_id, execution_quantity, eggs_storage_id, confirm, released, eggs_movements_id, disable, synchronized, order_p, lot_sap, end_lot, diff_days, programmed_disable) FROM stdin;
    public       postgres    false    368   H�      �          0    138591    txscenarioformula 
   TABLE DATA               �   COPY public.txscenarioformula (scenario_formula_id, process_id, predecessor_id, parameter_id, sign, divider, duration, scenario_id, measure_id) FROM stdin;
    public       postgres    false    369   e�      �          0    138595    txscenarioparameter 
   TABLE DATA               �   COPY public.txscenarioparameter (scenario_parameter_id, process_id, parameter_id, use_year, use_month, use_value, scenario_id, value_units) FROM stdin;
    public       postgres    false    370   ��      �          0    138600    txscenarioparameterday 
   TABLE DATA               �   COPY public.txscenarioparameterday (scenario_parameter_day_id, use_day, parameter_id, units_day, scenario_id, sequence, use_month, use_year, week_day, use_week) FROM stdin;
    public       postgres    false    371   ��      �          0    138604    txscenarioposturecurve 
   TABLE DATA               �   COPY public.txscenarioposturecurve (scenario_posture_id, posture_date, eggs, scenario_id, housingway_detail_id, breed_id) FROM stdin;
    public       postgres    false    372   ��      �          0    138608    txscenarioprocess 
   TABLE DATA               �   COPY public.txscenarioprocess (scenario_process_id, process_id, decrease_goal, weight_goal, duration_goal, scenario_id) FROM stdin;
    public       postgres    false    373   ٿ      �          0    138612    txsync 
   TABLE DATA               �   COPY public.txsync (sync_id, lot, scheduled_date, scheduled_quantity, farm_code, shed_code, execution_date, execution_quantity, is_error) FROM stdin;
    public       postgres    false    374   ��                 0    0    abaTimeUnit_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public."abaTimeUnit_id_seq"', 7, true);
            public       postgres    false    196                       0    0    aba_breeds_and_stages_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.aba_breeds_and_stages_id_seq', 15, true);
            public       postgres    false    197                       0    0 +   aba_consumption_and_mortality_detail_id_seq    SEQUENCE SET     [   SELECT pg_catalog.setval('public.aba_consumption_and_mortality_detail_id_seq', 329, true);
            public       postgres    false    201                       0    0 $   aba_consumption_and_mortality_id_seq    SEQUENCE SET     S   SELECT pg_catalog.setval('public.aba_consumption_and_mortality_id_seq', 13, true);
            public       postgres    false    199                       0    0 &   aba_elements_and_concentrations_id_seq    SEQUENCE SET     V   SELECT pg_catalog.setval('public.aba_elements_and_concentrations_id_seq', 120, true);
            public       postgres    false    205                       0    0    aba_elements_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.aba_elements_id_seq', 30, true);
            public       postgres    false    203                       0    0    aba_elements_properties_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.aba_elements_properties_id_seq', 8, true);
            public       postgres    false    207                       0    0    aba_formulation_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.aba_formulation_id_seq', 81, true);
            public       postgres    false    209                       0    0    aba_results_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.aba_results_id_seq', 1, false);
            public       postgres    false    211                       0    0 &   aba_stages_of_breeds_and_stages_id_seq    SEQUENCE SET     U   SELECT pg_catalog.setval('public.aba_stages_of_breeds_and_stages_id_seq', 40, true);
            public       postgres    false    212                       0    0    availability_shed_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.availability_shed_id_seq', 1, false);
            public       postgres    false    215                       0    0    base_day_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.base_day_id_seq', 1, false);
            public       postgres    false    216                       0    0    breed_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.breed_id_seq', 4, true);
            public       postgres    false    217                       0    0    broiler_detail_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.broiler_detail_id_seq', 34, true);
            public       postgres    false    218                       0    0    broiler_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.broiler_id_seq', 89, true);
            public       postgres    false    219                       0    0    broiler_product_detail_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.broiler_product_detail_id_seq', 1, false);
            public       postgres    false    220                       0    0    broiler_product_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.broiler_product_id_seq', 12, true);
            public       postgres    false    221                       0    0    broilereviction_detail_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.broilereviction_detail_id_seq', 136, true);
            public       postgres    false    222                       0    0    broilereviction_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.broilereviction_id_seq', 75, true);
            public       postgres    false    223                       0    0    brooder_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.brooder_id_seq', 1, false);
            public       postgres    false    224                       0    0    brooder_machines_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.brooder_machines_id_seq', 1, false);
            public       postgres    false    225                        0    0    calendar_day_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.calendar_day_id_seq', 8766, true);
            public       postgres    false    226            !           0    0    calendar_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.calendar_id_seq', 2, true);
            public       postgres    false    227            "           0    0    center_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.center_id_seq', 248, true);
            public       postgres    false    228            #           0    0    egg_planning_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.egg_planning_id_seq', 272, true);
            public       postgres    false    229            $           0    0    egg_required_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.egg_required_id_seq', 348, true);
            public       postgres    false    230            %           0    0    eggs_storage_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.eggs_storage_id_seq', 8009, true);
            public       postgres    false    231            &           0    0    farm_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.farm_id_seq', 94, true);
            public       postgres    false    232            '           0    0    farm_type_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.farm_type_id_seq', 3, true);
            public       postgres    false    233            (           0    0    holiday_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.holiday_id_seq', 1, false);
            public       postgres    false    234            )           0    0    housing_way_detail_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.housing_way_detail_id_seq', 64, true);
            public       postgres    false    235            *           0    0    housing_way_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.housing_way_id_seq', 46, true);
            public       postgres    false    236            +           0    0    incubator_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.incubator_id_seq', 575, true);
            public       postgres    false    237            ,           0    0    incubator_plant_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.incubator_plant_id_seq', 1, true);
            public       postgres    false    238            -           0    0    industry_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.industry_id_seq', 1, false);
            public       postgres    false    239            .           0    0    line_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.line_id_seq', 1, false);
            public       postgres    false    240            /           0    0    lot_eggs_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.lot_eggs_id_seq', 1, false);
            public       postgres    false    241            0           0    0    lot_fattening_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.lot_fattening_id_seq', 1, false);
            public       postgres    false    242            1           0    0 
   lot_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.lot_id_seq', 1, false);
            public       postgres    false    243            2           0    0    lot_liftbreeding_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.lot_liftbreeding_id_seq', 1, false);
            public       postgres    false    244            3           0    0 0   md_optimizer_parameter_optimizerparameter_id_seq    SEQUENCE SET     _   SELECT pg_catalog.setval('public.md_optimizer_parameter_optimizerparameter_id_seq', 1, false);
            public       postgres    false    246            4           0    0    mdadjustment_adjustment_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.mdadjustment_adjustment_id_seq', 6, true);
            public       postgres    false    248            5           0    0     mdapplication_application_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.mdapplication_application_id_seq', 20, true);
            public       postgres    false    249            6           0    0    mdapplication_rol_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.mdapplication_rol_id_seq', 24, true);
            public       postgres    false    251            7           0    0 .   mdequivalenceproduct_equivalenceproduct_id_seq    SEQUENCE SET     ]   SELECT pg_catalog.setval('public.mdequivalenceproduct_equivalenceproduct_id_seq', 16, true);
            public       postgres    false    256            8           0    0    mdrol_rol_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.mdrol_rol_id_seq', 2, true);
            public       postgres    false    266            9           0    0    mduser_user_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.mduser_user_id_seq', 2, true);
            public       postgres    false    274            :           0    0    measure_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.measure_id_seq', 2, true);
            public       postgres    false    258            ;           0    0 .   osadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE SET     \   SELECT pg_catalog.setval('public.osadjustmentscontrol_adjustmentscontrol_id_seq', 5, true);
            public       postgres    false    277            <           0    0    parameter_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.parameter_id_seq', 12, true);
            public       postgres    false    260            =           0    0    partnership_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.partnership_id_seq', 1, true);
            public       postgres    false    282            >           0    0    posture_curve_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.posture_curve_id_seq', 115, true);
            public       postgres    false    288            ?           0    0    predecessor_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.predecessor_id_seq', 1, false);
            public       postgres    false    289            @           0    0    process_class_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.process_class_id_seq', 1, false);
            public       postgres    false    290            A           0    0    process_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.process_id_seq', 21, true);
            public       postgres    false    262            B           0    0    product_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.product_id_seq', 16, true);
            public       postgres    false    264            C           0    0    programmed_eggs_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.programmed_eggs_id_seq', 89, true);
            public       postgres    false    291            D           0    0    raspberry_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.raspberry_id_seq', 1, false);
            public       postgres    false    292            E           0    0    scenario_formula_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.scenario_formula_id_seq', 72, true);
            public       postgres    false    293            F           0    0    scenario_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.scenario_id_seq', 2, true);
            public       postgres    false    268            G           0    0    scenario_parameter_day_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.scenario_parameter_day_seq', 2657, true);
            public       postgres    false    294            H           0    0    scenario_parameter_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.scenario_parameter_id_seq', 3168, true);
            public       postgres    false    295            I           0    0    scenario_posture_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.scenario_posture_id_seq', 7980, true);
            public       postgres    false    296            J           0    0    scenario_process_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.scenario_process_id_seq', 28, true);
            public       postgres    false    297            K           0    0    shed_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.shed_id_seq', 12056, true);
            public       postgres    false    284            L           0    0    silo_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.silo_id_seq', 1, false);
            public       postgres    false    298            M           0    0    slaughterhouse_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.slaughterhouse_id_seq', 34, true);
            public       postgres    false    286            N           0    0 0   slmdevictionpartition_slevictionpartition_id_seq    SEQUENCE SET     _   SELECT pg_catalog.setval('public.slmdevictionpartition_slevictionpartition_id_seq', 1, false);
            public       postgres    false    300            O           0    0 6   slmdgenderclassification_slgenderclassification_id_seq    SEQUENCE SET     e   SELECT pg_catalog.setval('public.slmdgenderclassification_slgenderclassification_id_seq', 1, false);
            public       postgres    false    302            P           0    0 &   slmdmachinegroup_slmachinegroup_id_seq    SEQUENCE SET     U   SELECT pg_catalog.setval('public.slmdmachinegroup_slmachinegroup_id_seq', 1, false);
            public       postgres    false    304            Q           0    0    slmdprocess_slprocess_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.slmdprocess_slprocess_id_seq', 1, false);
            public       postgres    false    306            R           0    0    sltxb_shed_slb_shed_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.sltxb_shed_slb_shed_id_seq', 1, false);
            public       postgres    false    308            S           0    0    sltxbr_shed_slbr_shed_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.sltxbr_shed_slbr_shed_id_seq', 1, false);
            public       postgres    false    310            T           0    0    sltxbreeding_slbreeding_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.sltxbreeding_slbreeding_id_seq', 1, false);
            public       postgres    false    312            U           0    0 *   sltxbroiler_detail_slbroiler_detail_id_seq    SEQUENCE SET     Y   SELECT pg_catalog.setval('public.sltxbroiler_detail_slbroiler_detail_id_seq', 1, false);
            public       postgres    false    315            V           0    0 $   sltxbroiler_lot_slbroiler_lot_id_seq    SEQUENCE SET     S   SELECT pg_catalog.setval('public.sltxbroiler_lot_slbroiler_lot_id_seq', 1, false);
            public       postgres    false    317            W           0    0    sltxbroiler_slbroiler_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.sltxbroiler_slbroiler_id_seq', 1, false);
            public       postgres    false    318            X           0    0 ,   sltxincubator_curve_slincubator_curve_id_seq    SEQUENCE SET     [   SELECT pg_catalog.setval('public.sltxincubator_curve_slincubator_curve_id_seq', 1, false);
            public       postgres    false    321            Y           0    0 .   sltxincubator_detail_slincubator_detail_id_seq    SEQUENCE SET     ]   SELECT pg_catalog.setval('public.sltxincubator_detail_slincubator_detail_id_seq', 1, false);
            public       postgres    false    323            Z           0    0 (   sltxincubator_lot_slincubator_lot_id_seq    SEQUENCE SET     W   SELECT pg_catalog.setval('public.sltxincubator_lot_slincubator_lot_id_seq', 1, false);
            public       postgres    false    325            [           0    0    sltxincubator_slincubator_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.sltxincubator_slincubator_seq', 1, false);
            public       postgres    false    326            \           0    0     sltxinventory_slinventory_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.sltxinventory_slinventory_id_seq', 1, false);
            public       postgres    false    328            ]           0    0    sltxlb_shed_sllb_shed_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.sltxlb_shed_sllb_shed_id_seq', 1, false);
            public       postgres    false    330            ^           0    0 &   sltxliftbreeding_slliftbreeding_id_seq    SEQUENCE SET     U   SELECT pg_catalog.setval('public.sltxliftbreeding_slliftbreeding_id_seq', 1, false);
            public       postgres    false    332            _           0    0 &   sltxposturecurve_slposturecurve_id_seq    SEQUENCE SET     U   SELECT pg_catalog.setval('public.sltxposturecurve_slposturecurve_id_seq', 1, false);
            public       postgres    false    334            `           0    0 (   sltxsellspurchase_slsellspurchase_id_seq    SEQUENCE SET     W   SELECT pg_catalog.setval('public.sltxsellspurchase_slsellspurchase_id_seq', 1, false);
            public       postgres    false    336            a           0    0    stage_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.stage_id_seq', 6, true);
            public       postgres    false    272            b           0    0    status_shed_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.status_shed_id_seq', 6, true);
            public       postgres    false    270            c           0    0 .   txadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE SET     \   SELECT pg_catalog.setval('public.txadjustmentscontrol_adjustmentscontrol_id_seq', 5, true);
            public       postgres    false    338            d           0    0     txbroiler_lot_broiler_lot_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public.txbroiler_lot_broiler_lot_id_seq', 254, true);
            public       postgres    false    343            e           0    0 1   txbroilerheavy_detail_broiler_heavy_detail_id_seq    SEQUENCE SET     `   SELECT pg_catalog.setval('public.txbroilerheavy_detail_broiler_heavy_detail_id_seq', 1, false);
            public       postgres    false    347            f           0    0    txeggs_movements_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.txeggs_movements_id_seq', 1583986, true);
            public       postgres    false    350            g           0    0    txgoals_erp_goals_erp_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.txgoals_erp_goals_erp_id_seq', 1, false);
            public       postgres    false    356            h           0    0 %   txhousingway_lot_txhousingway_lot_seq    SEQUENCE SET     T   SELECT pg_catalog.setval('public.txhousingway_lot_txhousingway_lot_seq', 64, true);
            public       postgres    false    360            i           0    0 $   txincubator_lot_incubator_lot_id_seq    SEQUENCE SET     T   SELECT pg_catalog.setval('public.txincubator_lot_incubator_lot_id_seq', 337, true);
            public       postgres    false    362            j           0    0 (   txincubator_sales_incubator_sales_id_seq    SEQUENCE SET     W   SELECT pg_catalog.setval('public.txincubator_sales_incubator_sales_id_seq', 1, false);
            public       postgres    false    364            k           0    0    txsync_sync_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.txsync_sync_id_seq', 77944, true);
            public       postgres    false    375            l           0    0 #   user_application_application_id_seq    SEQUENCE SET     R   SELECT pg_catalog.setval('public.user_application_application_id_seq', 1, false);
            public       postgres    false    376            m           0    0     user_application_user_app_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('public.user_application_user_app_id_seq', 215, false);
            public       postgres    false    377            n           0    0    user_application_user_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.user_application_user_id_seq', 1, false);
            public       postgres    false    378            o           0    0    warehouse_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.warehouse_id_seq', 1, false);
            public       postgres    false    379                       2606    138660    aba_time_unit abaTimeUnit_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.aba_time_unit
    ADD CONSTRAINT "abaTimeUnit_pkey" PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.aba_time_unit DROP CONSTRAINT "abaTimeUnit_pkey";
       public         postgres    false    214            �           2606    138662 0   aba_breeds_and_stages aba_breeds_and_stages_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public.aba_breeds_and_stages
    ADD CONSTRAINT aba_breeds_and_stages_pkey PRIMARY KEY (id);
 Z   ALTER TABLE ONLY public.aba_breeds_and_stages DROP CONSTRAINT aba_breeds_and_stages_pkey;
       public         postgres    false    198                        2606    138664 N   aba_consumption_and_mortality_detail aba_consumption_and_mortality_detail_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.aba_consumption_and_mortality_detail
    ADD CONSTRAINT aba_consumption_and_mortality_detail_pkey PRIMARY KEY (id);
 x   ALTER TABLE ONLY public.aba_consumption_and_mortality_detail DROP CONSTRAINT aba_consumption_and_mortality_detail_pkey;
       public         postgres    false    202            �           2606    138666 @   aba_consumption_and_mortality aba_consumption_and_mortality_pkey 
   CONSTRAINT     ~   ALTER TABLE ONLY public.aba_consumption_and_mortality
    ADD CONSTRAINT aba_consumption_and_mortality_pkey PRIMARY KEY (id);
 j   ALTER TABLE ONLY public.aba_consumption_and_mortality DROP CONSTRAINT aba_consumption_and_mortality_pkey;
       public         postgres    false    200                       2606    138668 D   aba_elements_and_concentrations aba_elements_and_concentrations_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.aba_elements_and_concentrations
    ADD CONSTRAINT aba_elements_and_concentrations_pkey PRIMARY KEY (id);
 n   ALTER TABLE ONLY public.aba_elements_and_concentrations DROP CONSTRAINT aba_elements_and_concentrations_pkey;
       public         postgres    false    206                       2606    138670    aba_elements aba_elements_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.aba_elements
    ADD CONSTRAINT aba_elements_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.aba_elements DROP CONSTRAINT aba_elements_pkey;
       public         postgres    false    204            	           2606    138672 4   aba_elements_properties aba_elements_properties_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.aba_elements_properties
    ADD CONSTRAINT aba_elements_properties_pkey PRIMARY KEY (id);
 ^   ALTER TABLE ONLY public.aba_elements_properties DROP CONSTRAINT aba_elements_properties_pkey;
       public         postgres    false    208                       2606    138674 $   aba_formulation aba_formulation_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.aba_formulation
    ADD CONSTRAINT aba_formulation_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.aba_formulation DROP CONSTRAINT aba_formulation_pkey;
       public         postgres    false    210                       2606    138676 D   aba_stages_of_breeds_and_stages aba_stages_of_breeds_and_stages_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages
    ADD CONSTRAINT aba_stages_of_breeds_and_stages_pkey PRIMARY KEY (id);
 n   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages DROP CONSTRAINT aba_stages_of_breeds_and_stages_pkey;
       public         postgres    false    213                       2606    138678    mdapplication application_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.mdapplication
    ADD CONSTRAINT application_pkey PRIMARY KEY (application_id);
 H   ALTER TABLE ONLY public.mdapplication DROP CONSTRAINT application_pkey;
       public         postgres    false    250                       2606    138680 2   md_optimizer_parameter md_optimizer_parameter_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.md_optimizer_parameter
    ADD CONSTRAINT md_optimizer_parameter_pkey PRIMARY KEY (optimizerparameter_id);
 \   ALTER TABLE ONLY public.md_optimizer_parameter DROP CONSTRAINT md_optimizer_parameter_pkey;
       public         postgres    false    245                       2606    138682 (   mdapplication_rol mdapplication_rol_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.mdapplication_rol
    ADD CONSTRAINT mdapplication_rol_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.mdapplication_rol DROP CONSTRAINT mdapplication_rol_pkey;
       public         postgres    false    252                       2606    138684    mdbreed mdbreed_code_key 
   CONSTRAINT     S   ALTER TABLE ONLY public.mdbreed
    ADD CONSTRAINT mdbreed_code_key UNIQUE (code);
 B   ALTER TABLE ONLY public.mdbreed DROP CONSTRAINT mdbreed_code_key;
       public         postgres    false    253                       2606    138686    mdbreed mdbreed_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.mdbreed
    ADD CONSTRAINT mdbreed_pkey PRIMARY KEY (breed_id);
 >   ALTER TABLE ONLY public.mdbreed DROP CONSTRAINT mdbreed_pkey;
       public         postgres    false    253                       2606    138688 (   mdbroiler_product mdbroiler_product_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.mdbroiler_product
    ADD CONSTRAINT mdbroiler_product_pkey PRIMARY KEY (broiler_product_id);
 R   ALTER TABLE ONLY public.mdbroiler_product DROP CONSTRAINT mdbroiler_product_pkey;
       public         postgres    false    254            !           2606    138690 .   mdequivalenceproduct mdequivalenceproduct_pkey 
   CONSTRAINT        ALTER TABLE ONLY public.mdequivalenceproduct
    ADD CONSTRAINT mdequivalenceproduct_pkey PRIMARY KEY (equivalenceproduct_id);
 X   ALTER TABLE ONLY public.mdequivalenceproduct DROP CONSTRAINT mdequivalenceproduct_pkey;
       public         postgres    false    255            #           2606    138692    mdfarmtype mdfarmtype_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.mdfarmtype
    ADD CONSTRAINT mdfarmtype_pkey PRIMARY KEY (farm_type_id);
 D   ALTER TABLE ONLY public.mdfarmtype DROP CONSTRAINT mdfarmtype_pkey;
       public         postgres    false    257            %           2606    138694    mdmeasure mdmeasure_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.mdmeasure
    ADD CONSTRAINT mdmeasure_pkey PRIMARY KEY (measure_id);
 B   ALTER TABLE ONLY public.mdmeasure DROP CONSTRAINT mdmeasure_pkey;
       public         postgres    false    259            )           2606    138696    mdparameter mdparameter_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.mdparameter
    ADD CONSTRAINT mdparameter_pkey PRIMARY KEY (parameter_id);
 F   ALTER TABLE ONLY public.mdparameter DROP CONSTRAINT mdparameter_pkey;
       public         postgres    false    261            .           2606    138698    mdprocess mdprocess_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.mdprocess
    ADD CONSTRAINT mdprocess_pkey PRIMARY KEY (process_id);
 B   ALTER TABLE ONLY public.mdprocess DROP CONSTRAINT mdprocess_pkey;
       public         postgres    false    263            0           2606    138700    mdproduct mdproduct_code_unique 
   CONSTRAINT     Z   ALTER TABLE ONLY public.mdproduct
    ADD CONSTRAINT mdproduct_code_unique UNIQUE (code);
 I   ALTER TABLE ONLY public.mdproduct DROP CONSTRAINT mdproduct_code_unique;
       public         postgres    false    265            2           2606    138702    mdproduct mdproduct_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.mdproduct
    ADD CONSTRAINT mdproduct_pkey PRIMARY KEY (product_id);
 B   ALTER TABLE ONLY public.mdproduct DROP CONSTRAINT mdproduct_pkey;
       public         postgres    false    265            8           2606    138704 !   mdscenario mdscenario_name_unique 
   CONSTRAINT     \   ALTER TABLE ONLY public.mdscenario
    ADD CONSTRAINT mdscenario_name_unique UNIQUE (name);
 K   ALTER TABLE ONLY public.mdscenario DROP CONSTRAINT mdscenario_name_unique;
       public         postgres    false    269            :           2606    138706    mdscenario mdscenario_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public.mdscenario
    ADD CONSTRAINT mdscenario_pkey PRIMARY KEY (scenario_id);
 D   ALTER TABLE ONLY public.mdscenario DROP CONSTRAINT mdscenario_pkey;
       public         postgres    false    269            <           2606    138708    mdshedstatus mdshedstatus_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.mdshedstatus
    ADD CONSTRAINT mdshedstatus_pkey PRIMARY KEY (shed_status_id);
 H   ALTER TABLE ONLY public.mdshedstatus DROP CONSTRAINT mdshedstatus_pkey;
       public         postgres    false    271            >           2606    138710    mdstage mdstage_name_unique 
   CONSTRAINT     V   ALTER TABLE ONLY public.mdstage
    ADD CONSTRAINT mdstage_name_unique UNIQUE (name);
 E   ALTER TABLE ONLY public.mdstage DROP CONSTRAINT mdstage_name_unique;
       public         postgres    false    273            @           2606    138712    mdstage mdstage_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.mdstage
    ADD CONSTRAINT mdstage_pkey PRIMARY KEY (stage_id);
 >   ALTER TABLE ONLY public.mdstage DROP CONSTRAINT mdstage_pkey;
       public         postgres    false    273            C           2606    138714    mduser mduser_user_id_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.mduser
    ADD CONSTRAINT mduser_user_id_pkey PRIMARY KEY (user_id);
 D   ALTER TABLE ONLY public.mduser DROP CONSTRAINT mduser_user_id_pkey;
       public         postgres    false    275            E           2606    138716    mduser mduser_username_unique 
   CONSTRAINT     \   ALTER TABLE ONLY public.mduser
    ADD CONSTRAINT mduser_username_unique UNIQUE (username);
 G   ALTER TABLE ONLY public.mduser DROP CONSTRAINT mduser_username_unique;
       public         postgres    false    275            G           2606    138718 .   osadjustmentscontrol osadjustmentscontrol_pkey 
   CONSTRAINT        ALTER TABLE ONLY public.osadjustmentscontrol
    ADD CONSTRAINT osadjustmentscontrol_pkey PRIMARY KEY (adjustmentscontrol_id);
 X   ALTER TABLE ONLY public.osadjustmentscontrol DROP CONSTRAINT osadjustmentscontrol_pkey;
       public         postgres    false    276            K           2606    138720 "   oscenter oscenter_code_farm_id_key 
   CONSTRAINT     f   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_code_farm_id_key UNIQUE (code, farm_id);
 L   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_code_farm_id_key;
       public         postgres    false    278    278            M           2606    138722 #   oscenter oscenter_code_farm_id_key1 
   CONSTRAINT     g   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_code_farm_id_key1 UNIQUE (code, farm_id);
 M   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_code_farm_id_key1;
       public         postgres    false    278    278            O           2606    138724 .   oscenter oscenter_partnership_farm_code_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_partnership_farm_code_unique UNIQUE (partnership_id, farm_id, code);
 X   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_partnership_farm_code_unique;
       public         postgres    false    278    278    278            Q           2606    138726    oscenter oscenter_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_pkey PRIMARY KEY (center_id);
 @   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_pkey;
       public         postgres    false    278            U           2606    138728 %   osfarm osfarm_code_partnership_id_key 
   CONSTRAINT     p   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_code_partnership_id_key UNIQUE (code, partnership_id);
 O   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_code_partnership_id_key;
       public         postgres    false    279    279            W           2606    138730 &   osfarm osfarm_code_partnership_id_key1 
   CONSTRAINT     q   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_code_partnership_id_key1 UNIQUE (code, partnership_id);
 P   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_code_partnership_id_key1;
       public         postgres    false    279    279            Y           2606    138732 %   osfarm osfarm_partnership_code_unique 
   CONSTRAINT     p   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_partnership_code_unique UNIQUE (partnership_id, code);
 O   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_partnership_code_unique;
       public         postgres    false    279    279            [           2606    138734    osfarm osfarm_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_pkey PRIMARY KEY (farm_id);
 <   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_pkey;
       public         postgres    false    279            u           2606    138736    osshed oshed_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT oshed_pkey PRIMARY KEY (shed_id);
 ;   ALTER TABLE ONLY public.osshed DROP CONSTRAINT oshed_pkey;
       public         postgres    false    285            ^           2606    138738    osincubator osincubator_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.osincubator
    ADD CONSTRAINT osincubator_pkey PRIMARY KEY (incubator_id);
 F   ALTER TABLE ONLY public.osincubator DROP CONSTRAINT osincubator_pkey;
       public         postgres    false    280            a           2606    138740 9   osincubatorplant osincubatorplant_code_partnership_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.osincubatorplant
    ADD CONSTRAINT osincubatorplant_code_partnership_id_key UNIQUE (code, partnership_id);
 c   ALTER TABLE ONLY public.osincubatorplant DROP CONSTRAINT osincubatorplant_code_partnership_id_key;
       public         postgres    false    281    281            c           2606    138742 :   osincubatorplant osincubatorplant_code_partnership_id_key1 
   CONSTRAINT     �   ALTER TABLE ONLY public.osincubatorplant
    ADD CONSTRAINT osincubatorplant_code_partnership_id_key1 UNIQUE (code, partnership_id);
 d   ALTER TABLE ONLY public.osincubatorplant DROP CONSTRAINT osincubatorplant_code_partnership_id_key1;
       public         postgres    false    281    281            e           2606    138744 9   osincubatorplant osincubatorplant_partnership_code_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public.osincubatorplant
    ADD CONSTRAINT osincubatorplant_partnership_code_unique UNIQUE (partnership_id, code);
 c   ALTER TABLE ONLY public.osincubatorplant DROP CONSTRAINT osincubatorplant_partnership_code_unique;
       public         postgres    false    281    281            g           2606    138746 &   osincubatorplant osincubatorplant_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public.osincubatorplant
    ADD CONSTRAINT osincubatorplant_pkey PRIMARY KEY (incubator_plant_id);
 P   ALTER TABLE ONLY public.osincubatorplant DROP CONSTRAINT osincubatorplant_pkey;
       public         postgres    false    281            i           2606    138748 $   ospartnership ospartnership_code_key 
   CONSTRAINT     _   ALTER TABLE ONLY public.ospartnership
    ADD CONSTRAINT ospartnership_code_key UNIQUE (code);
 N   ALTER TABLE ONLY public.ospartnership DROP CONSTRAINT ospartnership_code_key;
       public         postgres    false    283            k           2606    138750 %   ospartnership ospartnership_code_key1 
   CONSTRAINT     `   ALTER TABLE ONLY public.ospartnership
    ADD CONSTRAINT ospartnership_code_key1 UNIQUE (code);
 O   ALTER TABLE ONLY public.ospartnership DROP CONSTRAINT ospartnership_code_key1;
       public         postgres    false    283            m           2606    138752 '   ospartnership ospartnership_code_unique 
   CONSTRAINT     b   ALTER TABLE ONLY public.ospartnership
    ADD CONSTRAINT ospartnership_code_unique UNIQUE (code);
 Q   ALTER TABLE ONLY public.ospartnership DROP CONSTRAINT ospartnership_code_unique;
       public         postgres    false    283            o           2606    138754     ospartnership ospartnership_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.ospartnership
    ADD CONSTRAINT ospartnership_pkey PRIMARY KEY (partnership_id);
 J   ALTER TABLE ONLY public.ospartnership DROP CONSTRAINT ospartnership_pkey;
       public         postgres    false    283            w           2606    138756     osshed osshed_code_center_id_key 
   CONSTRAINT     f   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_code_center_id_key UNIQUE (code, center_id);
 J   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_code_center_id_key;
       public         postgres    false    285    285            y           2606    138758 !   osshed osshed_code_center_id_key1 
   CONSTRAINT     g   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_code_center_id_key1 UNIQUE (code, center_id);
 K   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_code_center_id_key1;
       public         postgres    false    285    285            {           2606    138760 1   osshed osshed_partnership_farm_center_code_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_partnership_farm_center_code_unique UNIQUE (partnership_id, farm_id, center_id, code);
 [   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_partnership_farm_center_code_unique;
       public         postgres    false    285    285    285    285            }           2606    138762 &   osslaughterhouse osslaughterhouse_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.osslaughterhouse
    ADD CONSTRAINT osslaughterhouse_pkey PRIMARY KEY (slaughterhouse_id);
 P   ALTER TABLE ONLY public.osslaughterhouse DROP CONSTRAINT osslaughterhouse_pkey;
       public         postgres    false    287            4           2606    138764    mdrol rol_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.mdrol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (rol_id);
 8   ALTER TABLE ONLY public.mdrol DROP CONSTRAINT rol_pkey;
       public         postgres    false    267                       2606    138766 0   slmdevictionpartition slmdevictionpartition_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.slmdevictionpartition
    ADD CONSTRAINT slmdevictionpartition_pkey PRIMARY KEY (slevictionpartition_id);
 Z   ALTER TABLE ONLY public.slmdevictionpartition DROP CONSTRAINT slmdevictionpartition_pkey;
       public         postgres    false    299            �           2606    138768 6   slmdgenderclassification slmdgenderclassification_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.slmdgenderclassification
    ADD CONSTRAINT slmdgenderclassification_pkey PRIMARY KEY (slgenderclassification_id);
 `   ALTER TABLE ONLY public.slmdgenderclassification DROP CONSTRAINT slmdgenderclassification_pkey;
       public         postgres    false    301            �           2606    138770 &   slmdmachinegroup slmdmachinegroup_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.slmdmachinegroup
    ADD CONSTRAINT slmdmachinegroup_pkey PRIMARY KEY (slmachinegroup_id);
 P   ALTER TABLE ONLY public.slmdmachinegroup DROP CONSTRAINT slmdmachinegroup_pkey;
       public         postgres    false    303            �           2606    138772    slmdprocess slmdprocess_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.slmdprocess
    ADD CONSTRAINT slmdprocess_pkey PRIMARY KEY (slprocess_id);
 F   ALTER TABLE ONLY public.slmdprocess DROP CONSTRAINT slmdprocess_pkey;
       public         postgres    false    305            �           2606    138774    sltxb_shed sltxb_shed_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public.sltxb_shed
    ADD CONSTRAINT sltxb_shed_pkey PRIMARY KEY (slb_shed_id);
 D   ALTER TABLE ONLY public.sltxb_shed DROP CONSTRAINT sltxb_shed_pkey;
       public         postgres    false    307            �           2606    138776    sltxbr_shed sltxbr_shed_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.sltxbr_shed
    ADD CONSTRAINT sltxbr_shed_pkey PRIMARY KEY (slbr_shed_id);
 F   ALTER TABLE ONLY public.sltxbr_shed DROP CONSTRAINT sltxbr_shed_pkey;
       public         postgres    false    309            �           2606    138778    sltxbreeding sltxbreeding_pkey 
   CONSTRAINT     g   ALTER TABLE ONLY public.sltxbreeding
    ADD CONSTRAINT sltxbreeding_pkey PRIMARY KEY (slbreeding_id);
 H   ALTER TABLE ONLY public.sltxbreeding DROP CONSTRAINT sltxbreeding_pkey;
       public         postgres    false    311            �           2606    138780 *   sltxbroiler_detail sltxbroiler_detail_pkey 
   CONSTRAINT     y   ALTER TABLE ONLY public.sltxbroiler_detail
    ADD CONSTRAINT sltxbroiler_detail_pkey PRIMARY KEY (slbroiler_detail_id);
 T   ALTER TABLE ONLY public.sltxbroiler_detail DROP CONSTRAINT sltxbroiler_detail_pkey;
       public         postgres    false    314            �           2606    138782 $   sltxbroiler_lot sltxbroiler_lot_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY public.sltxbroiler_lot
    ADD CONSTRAINT sltxbroiler_lot_pkey PRIMARY KEY (slbroiler_lot_id);
 N   ALTER TABLE ONLY public.sltxbroiler_lot DROP CONSTRAINT sltxbroiler_lot_pkey;
       public         postgres    false    316            �           2606    138784    sltxbroiler sltxbroiler_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.sltxbroiler
    ADD CONSTRAINT sltxbroiler_pkey PRIMARY KEY (slbroiler_id);
 F   ALTER TABLE ONLY public.sltxbroiler DROP CONSTRAINT sltxbroiler_pkey;
       public         postgres    false    313            �           2606    138786 ,   sltxincubator_curve sltxincubator_curve_pkey 
   CONSTRAINT     |   ALTER TABLE ONLY public.sltxincubator_curve
    ADD CONSTRAINT sltxincubator_curve_pkey PRIMARY KEY (slincubator_curve_id);
 V   ALTER TABLE ONLY public.sltxincubator_curve DROP CONSTRAINT sltxincubator_curve_pkey;
       public         postgres    false    320            �           2606    138788 .   sltxincubator_detail sltxincubator_detail_pkey 
   CONSTRAINT        ALTER TABLE ONLY public.sltxincubator_detail
    ADD CONSTRAINT sltxincubator_detail_pkey PRIMARY KEY (slincubator_detail_id);
 X   ALTER TABLE ONLY public.sltxincubator_detail DROP CONSTRAINT sltxincubator_detail_pkey;
       public         postgres    false    322            �           2606    138790 (   sltxincubator_lot sltxincubator_lot_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.sltxincubator_lot
    ADD CONSTRAINT sltxincubator_lot_pkey PRIMARY KEY (slincubator_lot_id);
 R   ALTER TABLE ONLY public.sltxincubator_lot DROP CONSTRAINT sltxincubator_lot_pkey;
       public         postgres    false    324            �           2606    138792     sltxincubator sltxincubator_pkey 
   CONSTRAINT     g   ALTER TABLE ONLY public.sltxincubator
    ADD CONSTRAINT sltxincubator_pkey PRIMARY KEY (slincubator);
 J   ALTER TABLE ONLY public.sltxincubator DROP CONSTRAINT sltxincubator_pkey;
       public         postgres    false    319            �           2606    138794     sltxinventory sltxinventory_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.sltxinventory
    ADD CONSTRAINT sltxinventory_pkey PRIMARY KEY (slinventory_id);
 J   ALTER TABLE ONLY public.sltxinventory DROP CONSTRAINT sltxinventory_pkey;
       public         postgres    false    327            �           2606    138796    sltxlb_shed sltxlb_shed_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.sltxlb_shed
    ADD CONSTRAINT sltxlb_shed_pkey PRIMARY KEY (sllb_shed_id);
 F   ALTER TABLE ONLY public.sltxlb_shed DROP CONSTRAINT sltxlb_shed_pkey;
       public         postgres    false    329            �           2606    138798 &   sltxliftbreeding sltxliftbreeding_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT sltxliftbreeding_pkey PRIMARY KEY (slliftbreeding_id);
 P   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT sltxliftbreeding_pkey;
       public         postgres    false    331            �           2606    138800 &   sltxposturecurve sltxposturecurve_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.sltxposturecurve
    ADD CONSTRAINT sltxposturecurve_pkey PRIMARY KEY (slposturecurve_id);
 P   ALTER TABLE ONLY public.sltxposturecurve DROP CONSTRAINT sltxposturecurve_pkey;
       public         postgres    false    333            �           2606    138802 (   sltxsellspurchase sltxsellspurchase_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.sltxsellspurchase
    ADD CONSTRAINT sltxsellspurchase_pkey PRIMARY KEY (slsellspurchase_id);
 R   ALTER TABLE ONLY public.sltxsellspurchase DROP CONSTRAINT sltxsellspurchase_pkey;
       public         postgres    false    335            �           2606    138804 .   txadjustmentscontrol txadjustmentscontrol_pkey 
   CONSTRAINT        ALTER TABLE ONLY public.txadjustmentscontrol
    ADD CONSTRAINT txadjustmentscontrol_pkey PRIMARY KEY (adjustmentscontrol_id);
 X   ALTER TABLE ONLY public.txadjustmentscontrol DROP CONSTRAINT txadjustmentscontrol_pkey;
       public         postgres    false    337            �           2606    138806 ,   txavailabilitysheds txavailabilitysheds_pkey 
   CONSTRAINT     |   ALTER TABLE ONLY public.txavailabilitysheds
    ADD CONSTRAINT txavailabilitysheds_pkey PRIMARY KEY (availability_shed_id);
 V   ALTER TABLE ONLY public.txavailabilitysheds DROP CONSTRAINT txavailabilitysheds_pkey;
       public         postgres    false    339            �           2606    138808 &   txbroiler_detail txbroiler_detail_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_pkey PRIMARY KEY (broiler_detail_id);
 P   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_pkey;
       public         postgres    false    341            �           2606    138810     txbroiler_lot txbroiler_lot_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.txbroiler_lot
    ADD CONSTRAINT txbroiler_lot_pkey PRIMARY KEY (broiler_lot_id);
 J   ALTER TABLE ONLY public.txbroiler_lot DROP CONSTRAINT txbroiler_lot_pkey;
       public         postgres    false    342            �           2606    138812    txbroiler txbroiler_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.txbroiler
    ADD CONSTRAINT txbroiler_pkey PRIMARY KEY (broiler_id);
 B   ALTER TABLE ONLY public.txbroiler DROP CONSTRAINT txbroiler_pkey;
       public         postgres    false    340            �           2606    138814 6   txbroilereviction_detail txbroilereviction_detail_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_pkey PRIMARY KEY (broilereviction_detail_id);
 `   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_pkey;
       public         postgres    false    345            �           2606    138816 (   txbroilereviction txbroilereviction_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_pkey PRIMARY KEY (broilereviction_id);
 R   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_pkey;
       public         postgres    false    344            �           2606    138818 0   txbroilerheavy_detail txbroilerheavy_detail_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.txbroilerheavy_detail
    ADD CONSTRAINT txbroilerheavy_detail_pkey PRIMARY KEY (broiler_heavy_detail_id);
 Z   ALTER TABLE ONLY public.txbroilerheavy_detail DROP CONSTRAINT txbroilerheavy_detail_pkey;
       public         postgres    false    346            �           2606    138820 4   txbroilerproduct_detail txbroilerproduct_detail_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.txbroilerproduct_detail
    ADD CONSTRAINT txbroilerproduct_detail_pkey PRIMARY KEY (broilerproduct_detail_id);
 ^   ALTER TABLE ONLY public.txbroilerproduct_detail DROP CONSTRAINT txbroilerproduct_detail_pkey;
       public         postgres    false    348            �           2606    138822 &   txbroodermachine txbroodermachine_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public.txbroodermachine
    ADD CONSTRAINT txbroodermachine_pkey PRIMARY KEY (brooder_machine_id_seq);
 P   ALTER TABLE ONLY public.txbroodermachine DROP CONSTRAINT txbroodermachine_pkey;
       public         postgres    false    349            �           2606    138828 &   txeggs_movements txeggs_movements_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.txeggs_movements
    ADD CONSTRAINT txeggs_movements_pkey PRIMARY KEY (eggs_movements_id);
 P   ALTER TABLE ONLY public.txeggs_movements DROP CONSTRAINT txeggs_movements_pkey;
       public         postgres    false    351            �           2606    138830 $   txeggs_planning txeggs_planning_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public.txeggs_planning
    ADD CONSTRAINT txeggs_planning_pkey PRIMARY KEY (egg_planning_id);
 N   ALTER TABLE ONLY public.txeggs_planning DROP CONSTRAINT txeggs_planning_pkey;
       public         postgres    false    352            �           2606    138832 $   txeggs_required txeggs_required_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public.txeggs_required
    ADD CONSTRAINT txeggs_required_pkey PRIMARY KEY (egg_required_id);
 N   ALTER TABLE ONLY public.txeggs_required DROP CONSTRAINT txeggs_required_pkey;
       public         postgres    false    353            �           2606    138834 "   txeggs_storage txeggs_storage_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY public.txeggs_storage
    ADD CONSTRAINT txeggs_storage_pkey PRIMARY KEY (eggs_storage_id);
 L   ALTER TABLE ONLY public.txeggs_storage DROP CONSTRAINT txeggs_storage_pkey;
       public         postgres    false    354            �           2606    138836    txgoals_erp txgoals_erp_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.txgoals_erp
    ADD CONSTRAINT txgoals_erp_pkey PRIMARY KEY (goals_erp_id);
 F   ALTER TABLE ONLY public.txgoals_erp DROP CONSTRAINT txgoals_erp_pkey;
       public         postgres    false    355            �           2606    138838 ,   txhousingway_detail txhousingway_detail_pkey 
   CONSTRAINT     |   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_pkey PRIMARY KEY (housingway_detail_id);
 V   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_pkey;
       public         postgres    false    358            �           2606    138840 &   txhousingway_lot txhousingway_lot_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.txhousingway_lot
    ADD CONSTRAINT txhousingway_lot_pkey PRIMARY KEY (housingway_lot_id);
 P   ALTER TABLE ONLY public.txhousingway_lot DROP CONSTRAINT txhousingway_lot_pkey;
       public         postgres    false    359            �           2606    138842    txhousingway txhousingway_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.txhousingway
    ADD CONSTRAINT txhousingway_pkey PRIMARY KEY (housing_way_id);
 H   ALTER TABLE ONLY public.txhousingway DROP CONSTRAINT txhousingway_pkey;
       public         postgres    false    357            �           2606    138844 $   txincubator_lot txincubator_lot_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY public.txincubator_lot
    ADD CONSTRAINT txincubator_lot_pkey PRIMARY KEY (incubator_lot_id);
 N   ALTER TABLE ONLY public.txincubator_lot DROP CONSTRAINT txincubator_lot_pkey;
       public         postgres    false    361            �           2606    138846 (   txincubator_sales txincubator_sales_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.txincubator_sales
    ADD CONSTRAINT txincubator_sales_pkey PRIMARY KEY (incubator_sales_id);
 R   ALTER TABLE ONLY public.txincubator_sales DROP CONSTRAINT txincubator_sales_pkey;
       public         postgres    false    363            �           2606    138848    txlot_eggs txlot_eggs_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public.txlot_eggs
    ADD CONSTRAINT txlot_eggs_pkey PRIMARY KEY (lot_eggs_id);
 D   ALTER TABLE ONLY public.txlot_eggs DROP CONSTRAINT txlot_eggs_pkey;
       public         postgres    false    366            �           2606    138850    txlot txlot_lot_code_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_lot_code_key UNIQUE (lot_code);
 B   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_lot_code_key;
       public         postgres    false    365            �           2606    138852    txlot txlot_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_pkey PRIMARY KEY (lot_id);
 :   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_pkey;
       public         postgres    false    365            �           2606    138854 "   txposturecurve txposturecurve_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public.txposturecurve
    ADD CONSTRAINT txposturecurve_pkey PRIMARY KEY (posture_curve_id);
 L   ALTER TABLE ONLY public.txposturecurve DROP CONSTRAINT txposturecurve_pkey;
       public         postgres    false    367                       2606    138856 (   txprogrammed_eggs txprogrammed_eggs_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.txprogrammed_eggs
    ADD CONSTRAINT txprogrammed_eggs_pkey PRIMARY KEY (programmed_eggs_id);
 R   ALTER TABLE ONLY public.txprogrammed_eggs DROP CONSTRAINT txprogrammed_eggs_pkey;
       public         postgres    false    368            	           2606    138858 (   txscenarioformula txscenarioformula_pkey 
   CONSTRAINT     w   ALTER TABLE ONLY public.txscenarioformula
    ADD CONSTRAINT txscenarioformula_pkey PRIMARY KEY (scenario_formula_id);
 R   ALTER TABLE ONLY public.txscenarioformula DROP CONSTRAINT txscenarioformula_pkey;
       public         postgres    false    369                       2606    138860 ,   txscenarioparameter txscenarioparameter_pkey 
   CONSTRAINT     }   ALTER TABLE ONLY public.txscenarioparameter
    ADD CONSTRAINT txscenarioparameter_pkey PRIMARY KEY (scenario_parameter_id);
 V   ALTER TABLE ONLY public.txscenarioparameter DROP CONSTRAINT txscenarioparameter_pkey;
       public         postgres    false    370                       2606    138862 2   txscenarioparameterday txscenarioparameterday_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameterday
    ADD CONSTRAINT txscenarioparameterday_pkey PRIMARY KEY (scenario_parameter_day_id);
 \   ALTER TABLE ONLY public.txscenarioparameterday DROP CONSTRAINT txscenarioparameterday_pkey;
       public         postgres    false    371                       2606    138864 2   txscenarioposturecurve txscenarioposturecurve_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioposturecurve
    ADD CONSTRAINT txscenarioposturecurve_pkey PRIMARY KEY (scenario_posture_id);
 \   ALTER TABLE ONLY public.txscenarioposturecurve DROP CONSTRAINT txscenarioposturecurve_pkey;
       public         postgres    false    372                       2606    138866 (   txscenarioprocess txscenarioprocess_pkey 
   CONSTRAINT     w   ALTER TABLE ONLY public.txscenarioprocess
    ADD CONSTRAINT txscenarioprocess_pkey PRIMARY KEY (scenario_process_id);
 R   ALTER TABLE ONLY public.txscenarioprocess DROP CONSTRAINT txscenarioprocess_pkey;
       public         postgres    false    373                       2606    138868    txsync txsync_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.txsync
    ADD CONSTRAINT txsync_pkey PRIMARY KEY (sync_id);
 <   ALTER TABLE ONLY public.txsync DROP CONSTRAINT txsync_pkey;
       public         postgres    false    374            6           2606    138870    mdrol uniqueRolName 
   CONSTRAINT     T   ALTER TABLE ONLY public.mdrol
    ADD CONSTRAINT "uniqueRolName" UNIQUE (rol_name);
 ?   ALTER TABLE ONLY public.mdrol DROP CONSTRAINT "uniqueRolName";
       public         postgres    false    267            �           1259    138875    fki_FK_ id_aba_time_unit    INDEX     p   CREATE INDEX "fki_FK_ id_aba_time_unit" ON public.aba_consumption_and_mortality USING btree (id_aba_time_unit);
 .   DROP INDEX public."fki_FK_ id_aba_time_unit";
       public         postgres    false    200                       1259    138876    fki_FK_id_aba_breeds_and_stages    INDEX     �   CREATE INDEX "fki_FK_id_aba_breeds_and_stages" ON public.aba_stages_of_breeds_and_stages USING btree (id_aba_breeds_and_stages);
 5   DROP INDEX public."fki_FK_id_aba_breeds_and_stages";
       public         postgres    false    213            �           1259    138877 '   fki_FK_id_aba_consumption_and_mortality    INDEX     �   CREATE INDEX "fki_FK_id_aba_consumption_and_mortality" ON public.aba_breeds_and_stages USING btree (id_aba_consumption_and_mortality);
 =   DROP INDEX public."fki_FK_id_aba_consumption_and_mortality";
       public         postgres    false    198                       1259    138878 (   fki_FK_id_aba_consumption_and_mortality2    INDEX     �   CREATE INDEX "fki_FK_id_aba_consumption_and_mortality2" ON public.aba_consumption_and_mortality_detail USING btree (id_aba_consumption_and_mortality);
 >   DROP INDEX public."fki_FK_id_aba_consumption_and_mortality2";
       public         postgres    false    202                       1259    138879    fki_FK_id_aba_element    INDEX     m   CREATE INDEX "fki_FK_id_aba_element" ON public.aba_elements_and_concentrations USING btree (id_aba_element);
 +   DROP INDEX public."fki_FK_id_aba_element";
       public         postgres    false    206                       1259    138880    fki_FK_id_aba_formulation    INDEX     u   CREATE INDEX "fki_FK_id_aba_formulation" ON public.aba_elements_and_concentrations USING btree (id_aba_formulation);
 /   DROP INDEX public."fki_FK_id_aba_formulation";
       public         postgres    false    206            �           1259    138881    fki_FK_id_breed    INDEX     _   CREATE INDEX "fki_FK_id_breed" ON public.aba_consumption_and_mortality USING btree (id_breed);
 %   DROP INDEX public."fki_FK_id_breed";
       public         postgres    false    200                       1259    138882    fki_FK_id_formulation    INDEX     m   CREATE INDEX "fki_FK_id_formulation" ON public.aba_stages_of_breeds_and_stages USING btree (id_formulation);
 +   DROP INDEX public."fki_FK_id_formulation";
       public         postgres    false    213            �           1259    138883    fki_FK_id_process    INDEX     [   CREATE INDEX "fki_FK_id_process" ON public.aba_breeds_and_stages USING btree (id_process);
 '   DROP INDEX public."fki_FK_id_process";
       public         postgres    false    198            �           1259    138884    fki_FK_id_stage    INDEX     _   CREATE INDEX "fki_FK_id_stage" ON public.aba_consumption_and_mortality USING btree (id_stage);
 %   DROP INDEX public."fki_FK_id_stage";
       public         postgres    false    200                       1259    138885 )   fki_mdapplication_rol_application_id_fkey    INDEX     q   CREATE INDEX fki_mdapplication_rol_application_id_fkey ON public.mdapplication_rol USING btree (application_id);
 =   DROP INDEX public.fki_mdapplication_rol_application_id_fkey;
       public         postgres    false    252                       1259    138886 !   fki_mdapplication_rol_rol_id_fkey    INDEX     a   CREATE INDEX fki_mdapplication_rol_rol_id_fkey ON public.mdapplication_rol USING btree (rol_id);
 5   DROP INDEX public.fki_mdapplication_rol_rol_id_fkey;
       public         postgres    false    252            &           1259    138887    fki_mdparameter_measure_id_fkey    INDEX     ]   CREATE INDEX fki_mdparameter_measure_id_fkey ON public.mdparameter USING btree (measure_id);
 3   DROP INDEX public.fki_mdparameter_measure_id_fkey;
       public         postgres    false    261            '           1259    138888    fki_mdparameter_process_id_fkey    INDEX     ]   CREATE INDEX fki_mdparameter_process_id_fkey ON public.mdparameter USING btree (process_id);
 3   DROP INDEX public.fki_mdparameter_process_id_fkey;
       public         postgres    false    261            *           1259    138889    fki_mdprocess_breed_id_fkey    INDEX     U   CREATE INDEX fki_mdprocess_breed_id_fkey ON public.mdprocess USING btree (breed_id);
 /   DROP INDEX public.fki_mdprocess_breed_id_fkey;
       public         postgres    false    263            A           1259    138891    fki_mduser_rol_id_fkey    INDEX     K   CREATE INDEX fki_mduser_rol_id_fkey ON public.mduser USING btree (rol_id);
 *   DROP INDEX public.fki_mduser_rol_id_fkey;
       public         postgres    false    275            H           1259    138892    fki_oscenter_farm_id_fkey    INDEX     Q   CREATE INDEX fki_oscenter_farm_id_fkey ON public.oscenter USING btree (farm_id);
 -   DROP INDEX public.fki_oscenter_farm_id_fkey;
       public         postgres    false    278            I           1259    138893     fki_oscenter_partnership_id_fkey    INDEX     _   CREATE INDEX fki_oscenter_partnership_id_fkey ON public.oscenter USING btree (partnership_id);
 4   DROP INDEX public.fki_oscenter_partnership_id_fkey;
       public         postgres    false    278            R           1259    138894    fki_osfarm_farm_type_id_fkey    INDEX     W   CREATE INDEX fki_osfarm_farm_type_id_fkey ON public.osfarm USING btree (farm_type_id);
 0   DROP INDEX public.fki_osfarm_farm_type_id_fkey;
       public         postgres    false    279            S           1259    138895    fki_osfarm_partnership_id_fkey    INDEX     [   CREATE INDEX fki_osfarm_partnership_id_fkey ON public.osfarm USING btree (partnership_id);
 2   DROP INDEX public.fki_osfarm_partnership_id_fkey;
       public         postgres    false    279            \           1259    138896 '   fki_osincubator_incubator_plant_id_fkey    INDEX     m   CREATE INDEX fki_osincubator_incubator_plant_id_fkey ON public.osincubator USING btree (incubator_plant_id);
 ;   DROP INDEX public.fki_osincubator_incubator_plant_id_fkey;
       public         postgres    false    280            _           1259    138897 (   fki_osincubatorplant_partnership_id_fkey    INDEX     o   CREATE INDEX fki_osincubatorplant_partnership_id_fkey ON public.osincubatorplant USING btree (partnership_id);
 <   DROP INDEX public.fki_osincubatorplant_partnership_id_fkey;
       public         postgres    false    281            p           1259    138898    fki_osshed_center_id_fkey    INDEX     Q   CREATE INDEX fki_osshed_center_id_fkey ON public.osshed USING btree (center_id);
 -   DROP INDEX public.fki_osshed_center_id_fkey;
       public         postgres    false    285            q           1259    138899    fki_osshed_farm_id_fkey    INDEX     M   CREATE INDEX fki_osshed_farm_id_fkey ON public.osshed USING btree (farm_id);
 +   DROP INDEX public.fki_osshed_farm_id_fkey;
       public         postgres    false    285            r           1259    138900    fki_osshed_partnership_id_fkey    INDEX     [   CREATE INDEX fki_osshed_partnership_id_fkey ON public.osshed USING btree (partnership_id);
 2   DROP INDEX public.fki_osshed_partnership_id_fkey;
       public         postgres    false    285            s           1259    138901    fki_osshed_statusshed_id_fkey    INDEX     Y   CREATE INDEX fki_osshed_statusshed_id_fkey ON public.osshed USING btree (statusshed_id);
 1   DROP INDEX public.fki_osshed_statusshed_id_fkey;
       public         postgres    false    285            +           1259    138902    fki_process_product_id_fkey    INDEX     W   CREATE INDEX fki_process_product_id_fkey ON public.mdprocess USING btree (product_id);
 /   DROP INDEX public.fki_process_product_id_fkey;
       public         postgres    false    263            ,           1259    138903    fki_process_stage_id_fkey    INDEX     S   CREATE INDEX fki_process_stage_id_fkey ON public.mdprocess USING btree (stage_id);
 -   DROP INDEX public.fki_process_stage_id_fkey;
       public         postgres    false    263            �           1259    138904 %   fki_txavailabilitysheds_lot_code_fkey    INDEX     i   CREATE INDEX fki_txavailabilitysheds_lot_code_fkey ON public.txavailabilitysheds USING btree (lot_code);
 9   DROP INDEX public.fki_txavailabilitysheds_lot_code_fkey;
       public         postgres    false    339            �           1259    138905 $   fki_txavailabilitysheds_shed_id_fkey    INDEX     g   CREATE INDEX fki_txavailabilitysheds_shed_id_fkey ON public.txavailabilitysheds USING btree (shed_id);
 8   DROP INDEX public.fki_txavailabilitysheds_shed_id_fkey;
       public         postgres    false    339            �           1259    138906 $   fki_txbroiler_detail_broiler_id_fkey    INDEX     g   CREATE INDEX fki_txbroiler_detail_broiler_id_fkey ON public.txbroiler_detail USING btree (broiler_id);
 8   DROP INDEX public.fki_txbroiler_detail_broiler_id_fkey;
       public         postgres    false    341            �           1259    138907 !   fki_txbroiler_detail_farm_id_fkey    INDEX     a   CREATE INDEX fki_txbroiler_detail_farm_id_fkey ON public.txbroiler_detail USING btree (farm_id);
 5   DROP INDEX public.fki_txbroiler_detail_farm_id_fkey;
       public         postgres    false    341            �           1259    138908 !   fki_txbroiler_detail_shed_id_fkey    INDEX     a   CREATE INDEX fki_txbroiler_detail_shed_id_fkey ON public.txbroiler_detail USING btree (shed_id);
 5   DROP INDEX public.fki_txbroiler_detail_shed_id_fkey;
       public         postgres    false    341            �           1259    138909 %   fki_txbroiler_programmed_eggs_id_fkey    INDEX     i   CREATE INDEX fki_txbroiler_programmed_eggs_id_fkey ON public.txbroiler USING btree (programmed_eggs_id);
 9   DROP INDEX public.fki_txbroiler_programmed_eggs_id_fkey;
       public         postgres    false    340            �           1259    138910 #   fki_txbroilereviction_breed_id_fkey    INDEX     e   CREATE INDEX fki_txbroilereviction_breed_id_fkey ON public.txbroilereviction USING btree (breed_id);
 7   DROP INDEX public.fki_txbroilereviction_breed_id_fkey;
       public         postgres    false    344            �           1259    138911 ,   fki_txbroilereviction_detail_broiler_id_fkey    INDEX        CREATE INDEX fki_txbroilereviction_detail_broiler_id_fkey ON public.txbroilereviction_detail USING btree (broilereviction_id);
 @   DROP INDEX public.fki_txbroilereviction_detail_broiler_id_fkey;
       public         postgres    false    345            �           1259    138912 4   fki_txbroilereviction_detail_broiler_product_id_fkey    INDEX     �   CREATE INDEX fki_txbroilereviction_detail_broiler_product_id_fkey ON public.txbroilereviction_detail USING btree (broiler_product_id);
 H   DROP INDEX public.fki_txbroilereviction_detail_broiler_product_id_fkey;
       public         postgres    false    345            �           1259    138913 )   fki_txbroilereviction_detail_farm_id_fkey    INDEX     q   CREATE INDEX fki_txbroilereviction_detail_farm_id_fkey ON public.txbroilereviction_detail USING btree (farm_id);
 =   DROP INDEX public.fki_txbroilereviction_detail_farm_id_fkey;
       public         postgres    false    345            �           1259    138914 )   fki_txbroilereviction_detail_shed_id_fkey    INDEX     q   CREATE INDEX fki_txbroilereviction_detail_shed_id_fkey ON public.txbroilereviction_detail USING btree (shed_id);
 =   DROP INDEX public.fki_txbroilereviction_detail_shed_id_fkey;
       public         postgres    false    345            �           1259    138915 3   fki_txbroilereviction_detail_slaughterhouse_id_fkey    INDEX     �   CREATE INDEX fki_txbroilereviction_detail_slaughterhouse_id_fkey ON public.txbroilereviction_detail USING btree (slaughterhouse_id);
 G   DROP INDEX public.fki_txbroilereviction_detail_slaughterhouse_id_fkey;
       public         postgres    false    345            �           1259    138916 )   fki_txbroilereviction_partnership_id_fkey    INDEX     q   CREATE INDEX fki_txbroilereviction_partnership_id_fkey ON public.txbroilereviction USING btree (partnership_id);
 =   DROP INDEX public.fki_txbroilereviction_partnership_id_fkey;
       public         postgres    false    344            �           1259    138917 &   fki_txbroilereviction_scenario_id_fkey    INDEX     k   CREATE INDEX fki_txbroilereviction_scenario_id_fkey ON public.txbroilereviction USING btree (scenario_id);
 :   DROP INDEX public.fki_txbroilereviction_scenario_id_fkey;
       public         postgres    false    344            �           1259    138918 /   fki_txbroilerproduct_detail_broiler_detail_fkey    INDEX     }   CREATE INDEX fki_txbroilerproduct_detail_broiler_detail_fkey ON public.txbroilerproduct_detail USING btree (broiler_detail);
 C   DROP INDEX public.fki_txbroilerproduct_detail_broiler_detail_fkey;
       public         postgres    false    348            �           1259    138919 "   fki_txbroodermachines_farm_id_fkey    INDEX     b   CREATE INDEX fki_txbroodermachines_farm_id_fkey ON public.txbroodermachine USING btree (farm_id);
 6   DROP INDEX public.fki_txbroodermachines_farm_id_fkey;
       public         postgres    false    349            �           1259    138920 )   fki_txbroodermachines_partnership_id_fkey    INDEX     p   CREATE INDEX fki_txbroodermachines_partnership_id_fkey ON public.txbroodermachine USING btree (partnership_id);
 =   DROP INDEX public.fki_txbroodermachines_partnership_id_fkey;
       public         postgres    false    349            �           1259    138921 !   fki_txeggs_planning_breed_id_fkey    INDEX     a   CREATE INDEX fki_txeggs_planning_breed_id_fkey ON public.txeggs_planning USING btree (breed_id);
 5   DROP INDEX public.fki_txeggs_planning_breed_id_fkey;
       public         postgres    false    352            �           1259    138922 $   fki_txeggs_planning_scenario_id_fkey    INDEX     g   CREATE INDEX fki_txeggs_planning_scenario_id_fkey ON public.txeggs_planning USING btree (scenario_id);
 8   DROP INDEX public.fki_txeggs_planning_scenario_id_fkey;
       public         postgres    false    352            �           1259    138923 !   fki_txeggs_required_breed_id_fkey    INDEX     a   CREATE INDEX fki_txeggs_required_breed_id_fkey ON public.txeggs_required USING btree (breed_id);
 5   DROP INDEX public.fki_txeggs_required_breed_id_fkey;
       public         postgres    false    353            �           1259    138924 $   fki_txeggs_required_scenario_id_fkey    INDEX     g   CREATE INDEX fki_txeggs_required_scenario_id_fkey ON public.txeggs_required USING btree (scenario_id);
 8   DROP INDEX public.fki_txeggs_required_scenario_id_fkey;
       public         postgres    false    353            �           1259    138925     fki_txeggs_storage_breed_id_fkey    INDEX     _   CREATE INDEX fki_txeggs_storage_breed_id_fkey ON public.txeggs_storage USING btree (breed_id);
 4   DROP INDEX public.fki_txeggs_storage_breed_id_fkey;
       public         postgres    false    354            �           1259    138926 *   fki_txeggs_storage_incubator_plant_id_fkey    INDEX     s   CREATE INDEX fki_txeggs_storage_incubator_plant_id_fkey ON public.txeggs_storage USING btree (incubator_plant_id);
 >   DROP INDEX public.fki_txeggs_storage_incubator_plant_id_fkey;
       public         postgres    false    354            �           1259    138927 #   fki_txeggs_storage_scenario_id_fkey    INDEX     e   CREATE INDEX fki_txeggs_storage_scenario_id_fkey ON public.txeggs_storage USING btree (scenario_id);
 7   DROP INDEX public.fki_txeggs_storage_scenario_id_fkey;
       public         postgres    false    354            �           1259    138928    fki_txfattening_breed_id_fkey    INDEX     W   CREATE INDEX fki_txfattening_breed_id_fkey ON public.txbroiler USING btree (breed_id);
 1   DROP INDEX public.fki_txfattening_breed_id_fkey;
       public         postgres    false    340            �           1259    138929 #   fki_txfattening_partnership_id_fkey    INDEX     c   CREATE INDEX fki_txfattening_partnership_id_fkey ON public.txbroiler USING btree (partnership_id);
 7   DROP INDEX public.fki_txfattening_partnership_id_fkey;
       public         postgres    false    340            �           1259    138930     fki_txfattening_scenario_id_fkey    INDEX     ]   CREATE INDEX fki_txfattening_scenario_id_fkey ON public.txbroiler USING btree (scenario_id);
 4   DROP INDEX public.fki_txfattening_scenario_id_fkey;
       public         postgres    false    340            �           1259    138931    fki_txgoals_erp_product_id_fkey    INDEX     ]   CREATE INDEX fki_txgoals_erp_product_id_fkey ON public.txgoals_erp USING btree (product_id);
 3   DROP INDEX public.fki_txgoals_erp_product_id_fkey;
       public         postgres    false    355            �           1259    138932     fki_txgoals_erp_scenario_id_fkey    INDEX     _   CREATE INDEX fki_txgoals_erp_scenario_id_fkey ON public.txgoals_erp USING btree (scenario_id);
 4   DROP INDEX public.fki_txgoals_erp_scenario_id_fkey;
       public         postgres    false    355            �           1259    138933    fki_txhousingway_breed_id_fkey    INDEX     [   CREATE INDEX fki_txhousingway_breed_id_fkey ON public.txhousingway USING btree (breed_id);
 2   DROP INDEX public.fki_txhousingway_breed_id_fkey;
       public         postgres    false    357            �           1259    138934 $   fki_txhousingway_detail_farm_id_fkey    INDEX     g   CREATE INDEX fki_txhousingway_detail_farm_id_fkey ON public.txhousingway_detail USING btree (farm_id);
 8   DROP INDEX public.fki_txhousingway_detail_farm_id_fkey;
       public         postgres    false    358            �           1259    138935 +   fki_txhousingway_detail_housing_way_id_fkey    INDEX     u   CREATE INDEX fki_txhousingway_detail_housing_way_id_fkey ON public.txhousingway_detail USING btree (housing_way_id);
 ?   DROP INDEX public.fki_txhousingway_detail_housing_way_id_fkey;
       public         postgres    false    358            �           1259    138936 /   fki_txhousingway_detail_incubator_plant_id_fkey    INDEX     }   CREATE INDEX fki_txhousingway_detail_incubator_plant_id_fkey ON public.txhousingway_detail USING btree (incubator_plant_id);
 C   DROP INDEX public.fki_txhousingway_detail_incubator_plant_id_fkey;
       public         postgres    false    358            �           1259    138937 $   fki_txhousingway_detail_shed_id_fkey    INDEX     g   CREATE INDEX fki_txhousingway_detail_shed_id_fkey ON public.txhousingway_detail USING btree (shed_id);
 8   DROP INDEX public.fki_txhousingway_detail_shed_id_fkey;
       public         postgres    false    358            �           1259    138938 $   fki_txhousingway_partnership_id_fkey    INDEX     g   CREATE INDEX fki_txhousingway_partnership_id_fkey ON public.txhousingway USING btree (partnership_id);
 8   DROP INDEX public.fki_txhousingway_partnership_id_fkey;
       public         postgres    false    357            �           1259    138939 !   fki_txhousingway_scenario_id_fkey    INDEX     a   CREATE INDEX fki_txhousingway_scenario_id_fkey ON public.txhousingway USING btree (scenario_id);
 5   DROP INDEX public.fki_txhousingway_scenario_id_fkey;
       public         postgres    false    357            �           1259    138940    fki_txhousingway_stage_id_fkey    INDEX     [   CREATE INDEX fki_txhousingway_stage_id_fkey ON public.txhousingway USING btree (stage_id);
 2   DROP INDEX public.fki_txhousingway_stage_id_fkey;
       public         postgres    false    357            �           1259    138941    fki_txlot_breed_id_fkey    INDEX     M   CREATE INDEX fki_txlot_breed_id_fkey ON public.txlot USING btree (breed_id);
 +   DROP INDEX public.fki_txlot_breed_id_fkey;
       public         postgres    false    365            �           1259    138942    fki_txlot_farm_id_fkey    INDEX     K   CREATE INDEX fki_txlot_farm_id_fkey ON public.txlot USING btree (farm_id);
 *   DROP INDEX public.fki_txlot_farm_id_fkey;
       public         postgres    false    365            �           1259    138943    fki_txlot_housin_way_id_fkey    INDEX     X   CREATE INDEX fki_txlot_housin_way_id_fkey ON public.txlot USING btree (housing_way_id);
 0   DROP INDEX public.fki_txlot_housin_way_id_fkey;
       public         postgres    false    365            �           1259    138944    fki_txlot_product_id_fkey    INDEX     Q   CREATE INDEX fki_txlot_product_id_fkey ON public.txlot USING btree (product_id);
 -   DROP INDEX public.fki_txlot_product_id_fkey;
       public         postgres    false    365            �           1259    138945    fki_txlot_shed_id_fkey    INDEX     K   CREATE INDEX fki_txlot_shed_id_fkey ON public.txlot USING btree (shed_id);
 *   DROP INDEX public.fki_txlot_shed_id_fkey;
       public         postgres    false    365            �           1259    138946     fki_txposturecurve_breed_id_fkey    INDEX     _   CREATE INDEX fki_txposturecurve_breed_id_fkey ON public.txposturecurve USING btree (breed_id);
 4   DROP INDEX public.fki_txposturecurve_breed_id_fkey;
       public         postgres    false    367            �           1259    138947 #   fki_txprogrammed_eggs_breed_id_fkey    INDEX     e   CREATE INDEX fki_txprogrammed_eggs_breed_id_fkey ON public.txprogrammed_eggs USING btree (breed_id);
 7   DROP INDEX public.fki_txprogrammed_eggs_breed_id_fkey;
       public         postgres    false    368                        1259    138948 *   fki_txprogrammed_eggs_eggs_storage_id_fkey    INDEX     s   CREATE INDEX fki_txprogrammed_eggs_eggs_storage_id_fkey ON public.txprogrammed_eggs USING btree (eggs_storage_id);
 >   DROP INDEX public.fki_txprogrammed_eggs_eggs_storage_id_fkey;
       public         postgres    false    368                       1259    138949 '   fki_txprogrammed_eggs_incubator_id_fkey    INDEX     m   CREATE INDEX fki_txprogrammed_eggs_incubator_id_fkey ON public.txprogrammed_eggs USING btree (incubator_id);
 ;   DROP INDEX public.fki_txprogrammed_eggs_incubator_id_fkey;
       public         postgres    false    368                       1259    138950 %   fki_txscenarioformula_measure_id_fkey    INDEX     i   CREATE INDEX fki_txscenarioformula_measure_id_fkey ON public.txscenarioformula USING btree (measure_id);
 9   DROP INDEX public.fki_txscenarioformula_measure_id_fkey;
       public         postgres    false    369                       1259    138951 '   fki_txscenarioformula_parameter_id_fkey    INDEX     m   CREATE INDEX fki_txscenarioformula_parameter_id_fkey ON public.txscenarioformula USING btree (parameter_id);
 ;   DROP INDEX public.fki_txscenarioformula_parameter_id_fkey;
       public         postgres    false    369                       1259    138952 %   fki_txscenarioformula_process_id_fkey    INDEX     i   CREATE INDEX fki_txscenarioformula_process_id_fkey ON public.txscenarioformula USING btree (process_id);
 9   DROP INDEX public.fki_txscenarioformula_process_id_fkey;
       public         postgres    false    369                       1259    138953 &   fki_txscenarioformula_scenario_id_fkey    INDEX     k   CREATE INDEX fki_txscenarioformula_scenario_id_fkey ON public.txscenarioformula USING btree (scenario_id);
 :   DROP INDEX public.fki_txscenarioformula_scenario_id_fkey;
       public         postgres    false    369            
           1259    138954 )   fki_txscenarioparameter_parameter_id_fkey    INDEX     q   CREATE INDEX fki_txscenarioparameter_parameter_id_fkey ON public.txscenarioparameter USING btree (parameter_id);
 =   DROP INDEX public.fki_txscenarioparameter_parameter_id_fkey;
       public         postgres    false    370                       1259    138955 '   fki_txscenarioparameter_process_id_fkey    INDEX     m   CREATE INDEX fki_txscenarioparameter_process_id_fkey ON public.txscenarioparameter USING btree (process_id);
 ;   DROP INDEX public.fki_txscenarioparameter_process_id_fkey;
       public         postgres    false    370                       1259    138956 (   fki_txscenarioparameter_scenario_id_fkey    INDEX     o   CREATE INDEX fki_txscenarioparameter_scenario_id_fkey ON public.txscenarioparameter USING btree (scenario_id);
 <   DROP INDEX public.fki_txscenarioparameter_scenario_id_fkey;
       public         postgres    false    370                       1259    138957 ,   fki_txscenarioparameterday_parameter_id_fkey    INDEX     w   CREATE INDEX fki_txscenarioparameterday_parameter_id_fkey ON public.txscenarioparameterday USING btree (parameter_id);
 @   DROP INDEX public.fki_txscenarioparameterday_parameter_id_fkey;
       public         postgres    false    371                       1259    138958 +   fki_txscenarioparameterday_scenario_id_fkey    INDEX     u   CREATE INDEX fki_txscenarioparameterday_scenario_id_fkey ON public.txscenarioparameterday USING btree (scenario_id);
 ?   DROP INDEX public.fki_txscenarioparameterday_scenario_id_fkey;
       public         postgres    false    371                       1259    138959 (   fki_txscenarioposturecurve_breed_id_fkey    INDEX     o   CREATE INDEX fki_txscenarioposturecurve_breed_id_fkey ON public.txscenarioposturecurve USING btree (breed_id);
 <   DROP INDEX public.fki_txscenarioposturecurve_breed_id_fkey;
       public         postgres    false    372                       1259    138960 4   fki_txscenarioposturecurve_housingway_detail_id_fkey    INDEX     �   CREATE INDEX fki_txscenarioposturecurve_housingway_detail_id_fkey ON public.txscenarioposturecurve USING btree (housingway_detail_id);
 H   DROP INDEX public.fki_txscenarioposturecurve_housingway_detail_id_fkey;
       public         postgres    false    372                       1259    138961 +   fki_txscenarioposturecurve_scenario_id_fkey    INDEX     u   CREATE INDEX fki_txscenarioposturecurve_scenario_id_fkey ON public.txscenarioposturecurve USING btree (scenario_id);
 ?   DROP INDEX public.fki_txscenarioposturecurve_scenario_id_fkey;
       public         postgres    false    372                       1259    138962 %   fki_txscenarioprocess_process_id_fkey    INDEX     i   CREATE INDEX fki_txscenarioprocess_process_id_fkey ON public.txscenarioprocess USING btree (process_id);
 9   DROP INDEX public.fki_txscenarioprocess_process_id_fkey;
       public         postgres    false    373                       1259    138963 &   fki_txscenarioprocess_scenario_id_fkey    INDEX     k   CREATE INDEX fki_txscenarioprocess_scenario_id_fkey ON public.txscenarioprocess USING btree (scenario_id);
 :   DROP INDEX public.fki_txscenarioprocess_scenario_id_fkey;
       public         postgres    false    373                       1259    138964    posturedate_index    INDEX     [   CREATE INDEX posturedate_index ON public.txscenarioposturecurve USING hash (posture_date);
 %   DROP INDEX public.posturedate_index;
       public         postgres    false    372            (           2606    138966 ;   aba_stages_of_breeds_and_stages FK_id_aba_breeds_and_stages    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages
    ADD CONSTRAINT "FK_id_aba_breeds_and_stages" FOREIGN KEY (id_aba_breeds_and_stages) REFERENCES public.aba_breeds_and_stages(id) ON DELETE CASCADE;
 g   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages DROP CONSTRAINT "FK_id_aba_breeds_and_stages";
       public       postgres    false    198    3319    213                       2606    138971 9   aba_breeds_and_stages FK_id_aba_consumption_and_mortality    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_breeds_and_stages
    ADD CONSTRAINT "FK_id_aba_consumption_and_mortality" FOREIGN KEY (id_aba_consumption_and_mortality) REFERENCES public.aba_consumption_and_mortality(id);
 e   ALTER TABLE ONLY public.aba_breeds_and_stages DROP CONSTRAINT "FK_id_aba_consumption_and_mortality";
       public       postgres    false    200    3323    198            $           2606    138976 I   aba_consumption_and_mortality_detail FK_id_aba_consumption_and_mortality2    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_consumption_and_mortality_detail
    ADD CONSTRAINT "FK_id_aba_consumption_and_mortality2" FOREIGN KEY (id_aba_consumption_and_mortality) REFERENCES public.aba_consumption_and_mortality(id) ON DELETE CASCADE;
 u   ALTER TABLE ONLY public.aba_consumption_and_mortality_detail DROP CONSTRAINT "FK_id_aba_consumption_and_mortality2";
       public       postgres    false    202    3323    200            &           2606    138981 1   aba_elements_and_concentrations FK_id_aba_element    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_elements_and_concentrations
    ADD CONSTRAINT "FK_id_aba_element" FOREIGN KEY (id_aba_element) REFERENCES public.aba_elements(id);
 ]   ALTER TABLE ONLY public.aba_elements_and_concentrations DROP CONSTRAINT "FK_id_aba_element";
       public       postgres    false    206    3331    204            '           2606    138986 5   aba_elements_and_concentrations FK_id_aba_formulation    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_elements_and_concentrations
    ADD CONSTRAINT "FK_id_aba_formulation" FOREIGN KEY (id_aba_formulation) REFERENCES public.aba_formulation(id) ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.aba_elements_and_concentrations DROP CONSTRAINT "FK_id_aba_formulation";
       public       postgres    false    210    206    3339            !           2606    138991 1   aba_consumption_and_mortality FK_id_aba_time_unit    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_consumption_and_mortality
    ADD CONSTRAINT "FK_id_aba_time_unit" FOREIGN KEY (id_aba_time_unit) REFERENCES public.aba_time_unit(id);
 ]   ALTER TABLE ONLY public.aba_consumption_and_mortality DROP CONSTRAINT "FK_id_aba_time_unit";
       public       postgres    false    3345    214    200            "           2606    138996 )   aba_consumption_and_mortality FK_id_breed    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_consumption_and_mortality
    ADD CONSTRAINT "FK_id_breed" FOREIGN KEY (id_breed) REFERENCES public.mdbreed(breed_id);
 U   ALTER TABLE ONLY public.aba_consumption_and_mortality DROP CONSTRAINT "FK_id_breed";
       public       postgres    false    253    3357    200            )           2606    139001 1   aba_stages_of_breeds_and_stages FK_id_formulation    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages
    ADD CONSTRAINT "FK_id_formulation" FOREIGN KEY (id_formulation) REFERENCES public.aba_formulation(id);
 ]   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages DROP CONSTRAINT "FK_id_formulation";
       public       postgres    false    3339    213    210                        2606    139006 #   aba_breeds_and_stages FK_id_process    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_breeds_and_stages
    ADD CONSTRAINT "FK_id_process" FOREIGN KEY (id_process) REFERENCES public.mdprocess(process_id);
 O   ALTER TABLE ONLY public.aba_breeds_and_stages DROP CONSTRAINT "FK_id_process";
       public       postgres    false    3374    263    198            #           2606    139011 )   aba_consumption_and_mortality FK_id_stage    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_consumption_and_mortality
    ADD CONSTRAINT "FK_id_stage" FOREIGN KEY (id_stage) REFERENCES public.mdstage(stage_id);
 U   ALTER TABLE ONLY public.aba_consumption_and_mortality DROP CONSTRAINT "FK_id_stage";
       public       postgres    false    3392    200    273            %           2606    139016 6   aba_elements aba_elements_id_aba_element_property_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_elements
    ADD CONSTRAINT aba_elements_id_aba_element_property_fkey FOREIGN KEY (id_aba_element_property) REFERENCES public.aba_elements_properties(id);
 `   ALTER TABLE ONLY public.aba_elements DROP CONSTRAINT aba_elements_id_aba_element_property_fkey;
       public       postgres    false    3337    204    208            �           2606    139021    txincubator_sales breed_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.txincubator_sales
    ADD CONSTRAINT breed_id_fk FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 G   ALTER TABLE ONLY public.txincubator_sales DROP CONSTRAINT breed_id_fk;
       public       postgres    false    3357    363    253            H           2606    139026    slmdprocess breed_id_fk    FK CONSTRAINT        ALTER TABLE ONLY public.slmdprocess
    ADD CONSTRAINT breed_id_fk FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 A   ALTER TABLE ONLY public.slmdprocess DROP CONSTRAINT breed_id_fk;
       public       postgres    false    3357    305    253            �           2606    139031 *   txeggs_movements eggs_movements_storage_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_movements
    ADD CONSTRAINT eggs_movements_storage_id FOREIGN KEY (eggs_storage_id) REFERENCES public.txeggs_storage(eggs_storage_id);
 T   ALTER TABLE ONLY public.txeggs_movements DROP CONSTRAINT eggs_movements_storage_id;
       public       postgres    false    351    354    3546            _           2606    139036 $   sltxincubator_detail incubator_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_detail
    ADD CONSTRAINT incubator_id_fk FOREIGN KEY (incubator_id) REFERENCES public.sltxincubator(slincubator);
 N   ALTER TABLE ONLY public.sltxincubator_detail DROP CONSTRAINT incubator_id_fk;
       public       postgres    false    322    319    3475            �           2606    139041 '   txincubator_sales incubator_plant_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.txincubator_sales
    ADD CONSTRAINT incubator_plant_id_fk FOREIGN KEY (incubator_plant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 Q   ALTER TABLE ONLY public.txincubator_sales DROP CONSTRAINT incubator_plant_id_fk;
       public       postgres    false    3431    281    363            T           2606    139046     sltxbroiler incubatorplant_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler
    ADD CONSTRAINT incubatorplant_id_fk FOREIGN KEY (incubatorplant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 J   ALTER TABLE ONLY public.sltxbroiler DROP CONSTRAINT incubatorplant_id_fk;
       public       postgres    false    281    313    3431            *           2606    139051 ;   md_optimizer_parameter md_optimizer_parameter_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.md_optimizer_parameter
    ADD CONSTRAINT md_optimizer_parameter_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 e   ALTER TABLE ONLY public.md_optimizer_parameter DROP CONSTRAINT md_optimizer_parameter_breed_id_fkey;
       public       postgres    false    3357    253    245            +           2606    139056 7   mdapplication_rol mdapplication_rol_application_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdapplication_rol
    ADD CONSTRAINT mdapplication_rol_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.mdapplication(application_id);
 a   ALTER TABLE ONLY public.mdapplication_rol DROP CONSTRAINT mdapplication_rol_application_id_fkey;
       public       postgres    false    3349    252    250            ,           2606    139061 /   mdapplication_rol mdapplication_rol_rol_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdapplication_rol
    ADD CONSTRAINT mdapplication_rol_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.mdrol(rol_id);
 Y   ALTER TABLE ONLY public.mdapplication_rol DROP CONSTRAINT mdapplication_rol_rol_id_fkey;
       public       postgres    false    3380    252    267            -           2606    139066 1   mdbroiler_product mdbroiler_product_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdbroiler_product
    ADD CONSTRAINT mdbroiler_product_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 [   ALTER TABLE ONLY public.mdbroiler_product DROP CONSTRAINT mdbroiler_product_breed_id_fkey;
       public       postgres    false    3357    254    253            .           2606    139071 8   mdbroiler_product mdbroiler_product_initial_product_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdbroiler_product
    ADD CONSTRAINT mdbroiler_product_initial_product_fkey FOREIGN KEY (initial_product) REFERENCES public.mdbroiler_product(broiler_product_id);
 b   ALTER TABLE ONLY public.mdbroiler_product DROP CONSTRAINT mdbroiler_product_initial_product_fkey;
       public       postgres    false    254    254    3359            /           2606    139076 7   mdequivalenceproduct mdequivalenceproduct_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdequivalenceproduct
    ADD CONSTRAINT mdequivalenceproduct_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 a   ALTER TABLE ONLY public.mdequivalenceproduct DROP CONSTRAINT mdequivalenceproduct_breed_id_fkey;
       public       postgres    false    3357    255    253            0           2606    139081 '   mdparameter mdparameter_measure_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdparameter
    ADD CONSTRAINT mdparameter_measure_id_fkey FOREIGN KEY (measure_id) REFERENCES public.mdmeasure(measure_id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.mdparameter DROP CONSTRAINT mdparameter_measure_id_fkey;
       public       postgres    false    3365    259    261            1           2606    139086 '   mdparameter mdparameter_process_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdparameter
    ADD CONSTRAINT mdparameter_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.mdprocess(process_id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.mdparameter DROP CONSTRAINT mdparameter_process_id_fkey;
       public       postgres    false    3374    261    263            2           2606    139091 !   mdprocess mdprocess_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdprocess
    ADD CONSTRAINT mdprocess_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.mdprocess DROP CONSTRAINT mdprocess_breed_id_fkey;
       public       postgres    false    3357    263    253            3           2606    139101 '   mdprocess mdprocess_predecessor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdprocess
    ADD CONSTRAINT mdprocess_predecessor_id_fkey FOREIGN KEY (predecessor_id) REFERENCES public.mdprocess(process_id);
 Q   ALTER TABLE ONLY public.mdprocess DROP CONSTRAINT mdprocess_predecessor_id_fkey;
       public       postgres    false    3374    263    263            4           2606    139106 #   mdprocess mdprocess_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdprocess
    ADD CONSTRAINT mdprocess_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.mdproduct(product_id) ON UPDATE CASCADE ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.mdprocess DROP CONSTRAINT mdprocess_product_id_fkey;
       public       postgres    false    3378    263    265            5           2606    139111 !   mdprocess mdprocess_stage_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdprocess
    ADD CONSTRAINT mdprocess_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.mdprocess DROP CONSTRAINT mdprocess_stage_id_fkey;
       public       postgres    false    263    273    3392            6           2606    139116 !   mdproduct mdproduct_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdproduct
    ADD CONSTRAINT mdproduct_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 K   ALTER TABLE ONLY public.mdproduct DROP CONSTRAINT mdproduct_breed_id_fkey;
       public       postgres    false    265    253    3357            7           2606    139121 !   mdproduct mdproduct_stage_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdproduct
    ADD CONSTRAINT mdproduct_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id);
 K   ALTER TABLE ONLY public.mdproduct DROP CONSTRAINT mdproduct_stage_id_fkey;
       public       postgres    false    265    3392    273            8           2606    139126 #   mdrol mdrol_admin_user_creator_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdrol
    ADD CONSTRAINT mdrol_admin_user_creator_fkey FOREIGN KEY (admin_user_creator) REFERENCES public.mduser(user_id);
 M   ALTER TABLE ONLY public.mdrol DROP CONSTRAINT mdrol_admin_user_creator_fkey;
       public       postgres    false    275    3395    267            9           2606    139136 $   mduser mduser_admi_user_creator_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mduser
    ADD CONSTRAINT mduser_admi_user_creator_fkey FOREIGN KEY (admi_user_creator) REFERENCES public.mduser(user_id);
 N   ALTER TABLE ONLY public.mduser DROP CONSTRAINT mduser_admi_user_creator_fkey;
       public       postgres    false    3395    275    275            :           2606    139141    mduser mduser_rol_id_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.mduser
    ADD CONSTRAINT mduser_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.mdrol(rol_id);
 C   ALTER TABLE ONLY public.mduser DROP CONSTRAINT mduser_rol_id_fkey;
       public       postgres    false    3380    275    267            ;           2606    139146    oscenter oscenter_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_farm_id_fkey;
       public       postgres    false    3419    278    279            <           2606    139151 %   oscenter oscenter_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_partnership_id_fkey;
       public       postgres    false    278    283    3439            =           2606    139156    osfarm osfarm_farm_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_farm_type_id_fkey FOREIGN KEY (farm_type_id) REFERENCES public.mdfarmtype(farm_type_id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_farm_type_id_fkey;
       public       postgres    false    3363    279    257            >           2606    139161 !   osfarm osfarm_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_partnership_id_fkey;
       public       postgres    false    3439    283    279            ?           2606    139166 /   osincubator osincubator_incubator_plant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osincubator
    ADD CONSTRAINT osincubator_incubator_plant_id_fkey FOREIGN KEY (incubator_plant_id) REFERENCES public.osincubatorplant(incubator_plant_id) ON UPDATE CASCADE ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.osincubator DROP CONSTRAINT osincubator_incubator_plant_id_fkey;
       public       postgres    false    3431    280    281            @           2606    139171 5   osincubatorplant osincubatorplant_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osincubatorplant
    ADD CONSTRAINT osincubatorplant_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.osincubatorplant DROP CONSTRAINT osincubatorplant_partnership_id_fkey;
       public       postgres    false    3439    281    283            A           2606    139176    osshed osshed_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 E   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_breed_id_fkey;
       public       postgres    false    253    3357    285            B           2606    139181    osshed osshed_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id) ON UPDATE CASCADE ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_center_id_fkey;
       public       postgres    false    3409    285    278            C           2606    139186    osshed osshed_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_farm_id_fkey;
       public       postgres    false    279    285    3419            D           2606    139191 !   osshed osshed_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_partnership_id_fkey;
       public       postgres    false    283    285    3439            E           2606    139196     osshed osshed_statusshed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_statusshed_id_fkey FOREIGN KEY (statusshed_id) REFERENCES public.mdshedstatus(shed_status_id) ON UPDATE CASCADE ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_statusshed_id_fkey;
       public       postgres    false    285    271    3388            �           2606    139201 &   txeggs_movements programmed_eggs_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_movements
    ADD CONSTRAINT programmed_eggs_id_fk FOREIGN KEY (programmed_eggs_id) REFERENCES public.txprogrammed_eggs(programmed_eggs_id);
 P   ALTER TABLE ONLY public.txeggs_movements DROP CONSTRAINT programmed_eggs_id_fk;
       public       postgres    false    351    368    3587            V           2606    139206 "   sltxbroiler_detail slbroiler_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_detail
    ADD CONSTRAINT slbroiler_id_fk FOREIGN KEY (slbroiler_id) REFERENCES public.sltxbroiler(slbroiler_id);
 L   ALTER TABLE ONLY public.sltxbroiler_detail DROP CONSTRAINT slbroiler_id_fk;
       public       postgres    false    314    313    3469            F           2606    139211 ?   slmdgenderclassification slmdgenderclassification_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.slmdgenderclassification
    ADD CONSTRAINT slmdgenderclassification_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 i   ALTER TABLE ONLY public.slmdgenderclassification DROP CONSTRAINT slmdgenderclassification_breed_id_fkey;
       public       postgres    false    301    253    3357            G           2606    139216 8   slmdmachinegroup slmdmachinegroup_incubatorplant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.slmdmachinegroup
    ADD CONSTRAINT slmdmachinegroup_incubatorplant_id_fkey FOREIGN KEY (incubatorplant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 b   ALTER TABLE ONLY public.slmdmachinegroup DROP CONSTRAINT slmdmachinegroup_incubatorplant_id_fkey;
       public       postgres    false    303    281    3431            J           2606    139221 $   sltxb_shed sltxb_shed_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxb_shed
    ADD CONSTRAINT sltxb_shed_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 N   ALTER TABLE ONLY public.sltxb_shed DROP CONSTRAINT sltxb_shed_center_id_fkey;
       public       postgres    false    278    307    3409            K           2606    139226 "   sltxb_shed sltxb_shed_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxb_shed
    ADD CONSTRAINT sltxb_shed_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id);
 L   ALTER TABLE ONLY public.sltxb_shed DROP CONSTRAINT sltxb_shed_shed_id_fkey;
       public       postgres    false    285    307    3445            L           2606    139231 (   sltxb_shed sltxb_shed_slbreeding_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxb_shed
    ADD CONSTRAINT sltxb_shed_slbreeding_id_fkey FOREIGN KEY (slbreeding_id) REFERENCES public.sltxbreeding(slbreeding_id);
 R   ALTER TABLE ONLY public.sltxb_shed DROP CONSTRAINT sltxb_shed_slbreeding_id_fkey;
       public       postgres    false    311    307    3467            M           2606    139236 &   sltxbr_shed sltxbr_shed_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbr_shed
    ADD CONSTRAINT sltxbr_shed_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 P   ALTER TABLE ONLY public.sltxbr_shed DROP CONSTRAINT sltxbr_shed_center_id_fkey;
       public       postgres    false    3409    309    278            N           2606    139241 $   sltxbr_shed sltxbr_shed_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbr_shed
    ADD CONSTRAINT sltxbr_shed_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id);
 N   ALTER TABLE ONLY public.sltxbr_shed DROP CONSTRAINT sltxbr_shed_shed_id_fkey;
       public       postgres    false    309    285    3445            O           2606    139246 0   sltxbr_shed sltxbr_shed_slbroiler_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbr_shed
    ADD CONSTRAINT sltxbr_shed_slbroiler_detail_id_fkey FOREIGN KEY (slbroiler_detail_id) REFERENCES public.sltxbroiler_detail(slbroiler_detail_id);
 Z   ALTER TABLE ONLY public.sltxbr_shed DROP CONSTRAINT sltxbr_shed_slbroiler_detail_id_fkey;
       public       postgres    false    309    314    3471            P           2606    139251 '   sltxbreeding sltxbreeding_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbreeding
    ADD CONSTRAINT sltxbreeding_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 Q   ALTER TABLE ONLY public.sltxbreeding DROP CONSTRAINT sltxbreeding_breed_id_fkey;
       public       postgres    false    311    253    3357            Q           2606    139256 &   sltxbreeding sltxbreeding_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbreeding
    ADD CONSTRAINT sltxbreeding_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id);
 P   ALTER TABLE ONLY public.sltxbreeding DROP CONSTRAINT sltxbreeding_farm_id_fkey;
       public       postgres    false    311    3419    279            R           2606    139261 -   sltxbreeding sltxbreeding_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbreeding
    ADD CONSTRAINT sltxbreeding_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id);
 W   ALTER TABLE ONLY public.sltxbreeding DROP CONSTRAINT sltxbreeding_partnership_id_fkey;
       public       postgres    false    283    311    3439            S           2606    139266 '   sltxbreeding sltxbreeding_stage_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbreeding
    ADD CONSTRAINT sltxbreeding_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id);
 Q   ALTER TABLE ONLY public.sltxbreeding DROP CONSTRAINT sltxbreeding_stage_id_fkey;
       public       postgres    false    273    311    3392            W           2606    139271 3   sltxbroiler_detail sltxbroiler_detail_category_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_detail
    ADD CONSTRAINT sltxbroiler_detail_category_fkey FOREIGN KEY (category) REFERENCES public.slmdgenderclassification(slgenderclassification_id);
 ]   ALTER TABLE ONLY public.sltxbroiler_detail DROP CONSTRAINT sltxbroiler_detail_category_fkey;
       public       postgres    false    301    314    3457            X           2606    139276 2   sltxbroiler_detail sltxbroiler_detail_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_detail
    ADD CONSTRAINT sltxbroiler_detail_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id);
 \   ALTER TABLE ONLY public.sltxbroiler_detail DROP CONSTRAINT sltxbroiler_detail_farm_id_fkey;
       public       postgres    false    279    314    3419            Y           2606    139281 8   sltxbroiler_lot sltxbroiler_lot_slbroiler_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_lot
    ADD CONSTRAINT sltxbroiler_lot_slbroiler_detail_id_fkey FOREIGN KEY (slbroiler_detail_id) REFERENCES public.sltxbroiler_detail(slbroiler_detail_id);
 b   ALTER TABLE ONLY public.sltxbroiler_lot DROP CONSTRAINT sltxbroiler_lot_slbroiler_detail_id_fkey;
       public       postgres    false    3471    314    316            Z           2606    139286 1   sltxbroiler_lot sltxbroiler_lot_slbroiler_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_lot
    ADD CONSTRAINT sltxbroiler_lot_slbroiler_id_fkey FOREIGN KEY (slbroiler_id) REFERENCES public.sltxbroiler(slbroiler_id);
 [   ALTER TABLE ONLY public.sltxbroiler_lot DROP CONSTRAINT sltxbroiler_lot_slbroiler_id_fkey;
       public       postgres    false    3469    316    313            [           2606    139291 7   sltxbroiler_lot sltxbroiler_lot_slsellspurchase_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_lot
    ADD CONSTRAINT sltxbroiler_lot_slsellspurchase_id_fkey FOREIGN KEY (slsellspurchase_id) REFERENCES public.sltxsellspurchase(slsellspurchase_id);
 a   ALTER TABLE ONLY public.sltxbroiler_lot DROP CONSTRAINT sltxbroiler_lot_slsellspurchase_id_fkey;
       public       postgres    false    3491    316    335            U           2606    139296 2   sltxbroiler sltxbroiler_slincubator_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler
    ADD CONSTRAINT sltxbroiler_slincubator_detail_id_fkey FOREIGN KEY (slincubator_detail_id) REFERENCES public.sltxincubator_detail(slincubator_detail_id);
 \   ALTER TABLE ONLY public.sltxbroiler DROP CONSTRAINT sltxbroiler_slincubator_detail_id_fkey;
       public       postgres    false    3479    313    322            ]           2606    139301 ;   sltxincubator_curve sltxincubator_curve_slincubator_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_curve
    ADD CONSTRAINT sltxincubator_curve_slincubator_id_fkey FOREIGN KEY (slincubator_id) REFERENCES public.sltxincubator(slincubator);
 e   ALTER TABLE ONLY public.sltxincubator_curve DROP CONSTRAINT sltxincubator_curve_slincubator_id_fkey;
       public       postgres    false    3475    320    319            ^           2606    139306 >   sltxincubator_curve sltxincubator_curve_slposturecurve_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_curve
    ADD CONSTRAINT sltxincubator_curve_slposturecurve_id_fkey FOREIGN KEY (slposturecurve_id) REFERENCES public.sltxposturecurve(slposturecurve_id);
 h   ALTER TABLE ONLY public.sltxincubator_curve DROP CONSTRAINT sltxincubator_curve_slposturecurve_id_fkey;
       public       postgres    false    333    320    3489            `           2606    139311 @   sltxincubator_detail sltxincubator_detail_slmachinegroup_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_detail
    ADD CONSTRAINT sltxincubator_detail_slmachinegroup_id_fkey FOREIGN KEY (slmachinegroup_id) REFERENCES public.slmdmachinegroup(slmachinegroup_id);
 j   ALTER TABLE ONLY public.sltxincubator_detail DROP CONSTRAINT sltxincubator_detail_slmachinegroup_id_fkey;
       public       postgres    false    322    303    3459            \           2606    139316 3   sltxincubator sltxincubator_incubator_plant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator
    ADD CONSTRAINT sltxincubator_incubator_plant_id_fkey FOREIGN KEY (incubatorplant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 ]   ALTER TABLE ONLY public.sltxincubator DROP CONSTRAINT sltxincubator_incubator_plant_id_fkey;
       public       postgres    false    319    281    3431            a           2606    139321 =   sltxincubator_lot sltxincubator_lot_slincubator_curve_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_lot
    ADD CONSTRAINT sltxincubator_lot_slincubator_curve_id_fkey FOREIGN KEY (slincubator_curve_id) REFERENCES public.sltxincubator_curve(slincubator_curve_id);
 g   ALTER TABLE ONLY public.sltxincubator_lot DROP CONSTRAINT sltxincubator_lot_slincubator_curve_id_fkey;
       public       postgres    false    320    324    3477            b           2606    139326 >   sltxincubator_lot sltxincubator_lot_slincubator_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_lot
    ADD CONSTRAINT sltxincubator_lot_slincubator_detail_id_fkey FOREIGN KEY (slincubator_detail_id) REFERENCES public.sltxincubator_detail(slincubator_detail_id);
 h   ALTER TABLE ONLY public.sltxincubator_lot DROP CONSTRAINT sltxincubator_lot_slincubator_detail_id_fkey;
       public       postgres    false    3479    322    324            c           2606    139331 ;   sltxincubator_lot sltxincubator_lot_slsellspurchase_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_lot
    ADD CONSTRAINT sltxincubator_lot_slsellspurchase_id_fkey FOREIGN KEY (slsellspurchase_id) REFERENCES public.sltxsellspurchase(slsellspurchase_id);
 e   ALTER TABLE ONLY public.sltxincubator_lot DROP CONSTRAINT sltxincubator_lot_slsellspurchase_id_fkey;
       public       postgres    false    324    335    3491            d           2606    139336 ,   sltxinventory sltxinventory_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxinventory
    ADD CONSTRAINT sltxinventory_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 V   ALTER TABLE ONLY public.sltxinventory DROP CONSTRAINT sltxinventory_scenario_id_fkey;
       public       postgres    false    327    269    3386            e           2606    139341 &   sltxlb_shed sltxlb_shed_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxlb_shed
    ADD CONSTRAINT sltxlb_shed_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 P   ALTER TABLE ONLY public.sltxlb_shed DROP CONSTRAINT sltxlb_shed_center_id_fkey;
       public       postgres    false    329    278    3409            f           2606    139346 $   sltxlb_shed sltxlb_shed_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxlb_shed
    ADD CONSTRAINT sltxlb_shed_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id);
 N   ALTER TABLE ONLY public.sltxlb_shed DROP CONSTRAINT sltxlb_shed_shed_id_fkey;
       public       postgres    false    329    285    3445            g           2606    139351 .   sltxlb_shed sltxlb_shed_slliftbreeding_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxlb_shed
    ADD CONSTRAINT sltxlb_shed_slliftbreeding_id_fkey FOREIGN KEY (slliftbreeding_id) REFERENCES public.sltxliftbreeding(slliftbreeding_id);
 X   ALTER TABLE ONLY public.sltxlb_shed DROP CONSTRAINT sltxlb_shed_slliftbreeding_id_fkey;
       public       postgres    false    329    331    3487            h           2606    139356 /   sltxliftbreeding sltxliftbreeding_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT sltxliftbreeding_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 Y   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT sltxliftbreeding_breed_id_fkey;
       public       postgres    false    331    253    3357            i           2606    139361 .   sltxliftbreeding sltxliftbreeding_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT sltxliftbreeding_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id);
 X   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT sltxliftbreeding_farm_id_fkey;
       public       postgres    false    331    279    3419            j           2606    139366 5   sltxliftbreeding sltxliftbreeding_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT sltxliftbreeding_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id);
 _   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT sltxliftbreeding_partnership_id_fkey;
       public       postgres    false    331    283    3439            k           2606    139371 4   sltxliftbreeding sltxliftbreeding_slbreeding_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT sltxliftbreeding_slbreeding_id_fkey FOREIGN KEY (slbreeding_id) REFERENCES public.sltxbreeding(slbreeding_id);
 ^   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT sltxliftbreeding_slbreeding_id_fkey;
       public       postgres    false    331    311    3467            l           2606    139376 /   sltxliftbreeding sltxliftbreeding_stage_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT sltxliftbreeding_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id);
 Y   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT sltxliftbreeding_stage_id_fkey;
       public       postgres    false    331    273    3392            m           2606    139381 /   sltxposturecurve sltxposturecurve_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxposturecurve
    ADD CONSTRAINT sltxposturecurve_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 Y   ALTER TABLE ONLY public.sltxposturecurve DROP CONSTRAINT sltxposturecurve_breed_id_fkey;
       public       postgres    false    333    253    3357            n           2606    139386 2   sltxposturecurve sltxposturecurve_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxposturecurve
    ADD CONSTRAINT sltxposturecurve_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 \   ALTER TABLE ONLY public.sltxposturecurve DROP CONSTRAINT sltxposturecurve_scenario_id_fkey;
       public       postgres    false    333    269    3386            o           2606    139391 4   sltxposturecurve sltxposturecurve_slbreeding_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxposturecurve
    ADD CONSTRAINT sltxposturecurve_slbreeding_id_fkey FOREIGN KEY (slbreeding_id) REFERENCES public.sltxbreeding(slbreeding_id);
 ^   ALTER TABLE ONLY public.sltxposturecurve DROP CONSTRAINT sltxposturecurve_slbreeding_id_fkey;
       public       postgres    false    333    311    3467            p           2606    139396 1   sltxsellspurchase sltxsellspurchase_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxsellspurchase
    ADD CONSTRAINT sltxsellspurchase_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 [   ALTER TABLE ONLY public.sltxsellspurchase DROP CONSTRAINT sltxsellspurchase_breed_id_fkey;
       public       postgres    false    335    253    3357            q           2606    139401 4   sltxsellspurchase sltxsellspurchase_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxsellspurchase
    ADD CONSTRAINT sltxsellspurchase_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 ^   ALTER TABLE ONLY public.sltxsellspurchase DROP CONSTRAINT sltxsellspurchase_scenario_id_fkey;
       public       postgres    false    335    269    3386            I           2606    139406    slmdprocess stage_id_fk    FK CONSTRAINT        ALTER TABLE ONLY public.slmdprocess
    ADD CONSTRAINT stage_id_fk FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id);
 A   ALTER TABLE ONLY public.slmdprocess DROP CONSTRAINT stage_id_fk;
       public       postgres    false    305    273    3392            r           2606    139411 5   txavailabilitysheds txavailabilitysheds_lot_code_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txavailabilitysheds
    ADD CONSTRAINT txavailabilitysheds_lot_code_fkey FOREIGN KEY (lot_code) REFERENCES public.txlot(lot_code) ON UPDATE CASCADE ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.txavailabilitysheds DROP CONSTRAINT txavailabilitysheds_lot_code_fkey;
       public       postgres    false    339    365    3575            s           2606    139416 4   txavailabilitysheds txavailabilitysheds_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txavailabilitysheds
    ADD CONSTRAINT txavailabilitysheds_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txavailabilitysheds DROP CONSTRAINT txavailabilitysheds_shed_id_fkey;
       public       postgres    false    339    285    3445            t           2606    139421 !   txbroiler txbroiler_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler
    ADD CONSTRAINT txbroiler_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.txbroiler DROP CONSTRAINT txbroiler_breed_id_fkey;
       public       postgres    false    340    253    3357            x           2606    139426 1   txbroiler_detail txbroiler_detail_broiler_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_broiler_id_fkey FOREIGN KEY (broiler_id) REFERENCES public.txbroiler(broiler_id) ON UPDATE CASCADE ON DELETE CASCADE;
 [   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_broiler_id_fkey;
       public       postgres    false    341    340    3503            y           2606    139431 9   txbroiler_detail txbroiler_detail_broiler_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_broiler_product_id_fkey FOREIGN KEY (broiler_product_id) REFERENCES public.mdbroiler_product(broiler_product_id);
 c   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_broiler_product_id_fkey;
       public       postgres    false    341    254    3359            z           2606    139436 0   txbroiler_detail txbroiler_detail_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 Z   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_center_id_fkey;
       public       postgres    false    341    278    3409            {           2606    139441 9   txbroiler_detail txbroiler_detail_executioncenter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_executioncenter_id_fkey FOREIGN KEY (executioncenter_id) REFERENCES public.oscenter(center_id);
 c   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_executioncenter_id_fkey;
       public       postgres    false    341    3409    278            |           2606    139446 7   txbroiler_detail txbroiler_detail_executionfarm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_executionfarm_id_fkey FOREIGN KEY (executionfarm_id) REFERENCES public.osfarm(farm_id);
 a   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_executionfarm_id_fkey;
       public       postgres    false    341    279    3419            }           2606    139451 7   txbroiler_detail txbroiler_detail_executionshed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_executionshed_id_fkey FOREIGN KEY (executionshed_id) REFERENCES public.osshed(shed_id);
 a   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_executionshed_id_fkey;
       public       postgres    false    341    285    3445            ~           2606    139456 .   txbroiler_detail txbroiler_detail_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_farm_id_fkey;
       public       postgres    false    341    279    3419                       2606    139461 .   txbroiler_detail txbroiler_detail_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_shed_id_fkey;
       public       postgres    false    341    285    3445            u           2606    139466 '   txbroiler txbroiler_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler
    ADD CONSTRAINT txbroiler_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.txbroiler DROP CONSTRAINT txbroiler_partnership_id_fkey;
       public       postgres    false    340    283    3439            v           2606    139471 +   txbroiler txbroiler_programmed_eggs_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler
    ADD CONSTRAINT txbroiler_programmed_eggs_id_fkey FOREIGN KEY (programmed_eggs_id) REFERENCES public.txprogrammed_eggs(programmed_eggs_id) ON UPDATE CASCADE ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.txbroiler DROP CONSTRAINT txbroiler_programmed_eggs_id_fkey;
       public       postgres    false    340    368    3587            w           2606    139476 $   txbroiler txbroiler_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler
    ADD CONSTRAINT txbroiler_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.txbroiler DROP CONSTRAINT txbroiler_scenario_id_fkey;
       public       postgres    false    340    269    3386            �           2606    139481 1   txbroilereviction txbroilereviction_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 [   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_breed_id_fkey;
       public       postgres    false    344    253    3357            �           2606    139486 :   txbroilereviction txbroilereviction_broiler_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_broiler_detail_id_fkey FOREIGN KEY (broiler_detail_id) REFERENCES public.txbroiler_detail(broiler_detail_id);
 d   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_broiler_detail_id_fkey;
       public       postgres    false    344    341    3508            �           2606    139491 @   txbroilereviction txbroilereviction_broiler_heavy_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_broiler_heavy_detail_id_fkey FOREIGN KEY (broiler_heavy_detail_id) REFERENCES public.txbroilerheavy_detail(broiler_heavy_detail_id);
 j   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_broiler_heavy_detail_id_fkey;
       public       postgres    false    3524    344    346            �           2606    139496 A   txbroilereviction_detail txbroilereviction_detail_broiler_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_broiler_id_fkey FOREIGN KEY (broilereviction_id) REFERENCES public.txbroilereviction(broilereviction_id) ON UPDATE CASCADE ON DELETE CASCADE;
 k   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_broiler_id_fkey;
       public       postgres    false    344    3515    345            �           2606    139501 I   txbroilereviction_detail txbroilereviction_detail_broiler_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_broiler_product_id_fkey FOREIGN KEY (broiler_product_id) REFERENCES public.mdbroiler_product(broiler_product_id) ON UPDATE CASCADE ON DELETE CASCADE;
 s   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_broiler_product_id_fkey;
       public       postgres    false    345    254    3359            �           2606    139506 @   txbroilereviction_detail txbroilereviction_detail_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 j   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_center_id_fkey;
       public       postgres    false    345    278    3409            �           2606    139511 M   txbroilereviction_detail txbroilereviction_detail_execution_slaughterhouse_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_execution_slaughterhouse_id FOREIGN KEY (executionslaughterhouse_id) REFERENCES public.osslaughterhouse(slaughterhouse_id);
 w   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_execution_slaughterhouse_id;
       public       postgres    false    345    287    3453            �           2606    139516 >   txbroilereviction_detail txbroilereviction_detail_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 h   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_farm_id_fkey;
       public       postgres    false    345    279    3419            �           2606    139521 >   txbroilereviction_detail txbroilereviction_detail_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 h   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_shed_id_fkey;
       public       postgres    false    345    285    3445            �           2606    139526 H   txbroilereviction_detail txbroilereviction_detail_slaughterhouse_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_slaughterhouse_id_fkey FOREIGN KEY (slaughterhouse_id) REFERENCES public.osslaughterhouse(slaughterhouse_id) ON UPDATE CASCADE ON DELETE CASCADE;
 r   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_slaughterhouse_id_fkey;
       public       postgres    false    345    287    3453            �           2606    139531 7   txbroilereviction txbroilereviction_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_partnership_id_fkey;
       public       postgres    false    344    283    3439            �           2606    139536 4   txbroilereviction txbroilereviction_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_scenario_id_fkey;
       public       postgres    false    344    269    3386            �           2606    139541 B   txbroilerheavy_detail txbroilerheavy_detail_broiler_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilerheavy_detail
    ADD CONSTRAINT txbroilerheavy_detail_broiler_detail_id_fkey FOREIGN KEY (broiler_detail_id) REFERENCES public.txbroiler_detail(broiler_detail_id);
 l   ALTER TABLE ONLY public.txbroilerheavy_detail DROP CONSTRAINT txbroilerheavy_detail_broiler_detail_id_fkey;
       public       postgres    false    346    341    3508            �           2606    139546 C   txbroilerheavy_detail txbroilerheavy_detail_broiler_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilerheavy_detail
    ADD CONSTRAINT txbroilerheavy_detail_broiler_product_id_fkey FOREIGN KEY (broiler_product_id) REFERENCES public.mdbroiler_product(broiler_product_id);
 m   ALTER TABLE ONLY public.txbroilerheavy_detail DROP CONSTRAINT txbroilerheavy_detail_broiler_product_id_fkey;
       public       postgres    false    346    254    3359            �           2606    139551 C   txbroilerproduct_detail txbroilerproduct_detail_broiler_detail_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilerproduct_detail
    ADD CONSTRAINT txbroilerproduct_detail_broiler_detail_fkey FOREIGN KEY (broiler_detail) REFERENCES public.txbroiler_detail(broiler_detail_id) ON UPDATE CASCADE ON DELETE CASCADE;
 m   ALTER TABLE ONLY public.txbroilerproduct_detail DROP CONSTRAINT txbroilerproduct_detail_broiler_detail_fkey;
       public       postgres    false    348    341    3508            �           2606    139556 .   txbroodermachine txbroodermachine_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroodermachine
    ADD CONSTRAINT txbroodermachine_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.txbroodermachine DROP CONSTRAINT txbroodermachine_farm_id_fkey;
       public       postgres    false    349    279    3419            �           2606    139561 5   txbroodermachine txbroodermachine_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroodermachine
    ADD CONSTRAINT txbroodermachine_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.txbroodermachine DROP CONSTRAINT txbroodermachine_partnership_id_fkey;
       public       postgres    false    349    283    3439            �           2606    139571 -   txeggs_planning txeggs_planning_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_planning
    ADD CONSTRAINT txeggs_planning_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.txeggs_planning DROP CONSTRAINT txeggs_planning_breed_id_fkey;
       public       postgres    false    352    253    3357            �           2606    139576 0   txeggs_planning txeggs_planning_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_planning
    ADD CONSTRAINT txeggs_planning_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 Z   ALTER TABLE ONLY public.txeggs_planning DROP CONSTRAINT txeggs_planning_scenario_id_fkey;
       public       postgres    false    352    269    3386            �           2606    139581 -   txeggs_required txeggs_required_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_required
    ADD CONSTRAINT txeggs_required_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 W   ALTER TABLE ONLY public.txeggs_required DROP CONSTRAINT txeggs_required_breed_id_fkey;
       public       postgres    false    353    253    3357            �           2606    139586 0   txeggs_required txeggs_required_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_required
    ADD CONSTRAINT txeggs_required_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 Z   ALTER TABLE ONLY public.txeggs_required DROP CONSTRAINT txeggs_required_scenario_id_fkey;
       public       postgres    false    353    269    3386            �           2606    139591 +   txeggs_storage txeggs_storage_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_storage
    ADD CONSTRAINT txeggs_storage_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 U   ALTER TABLE ONLY public.txeggs_storage DROP CONSTRAINT txeggs_storage_breed_id_fkey;
       public       postgres    false    354    253    3357            �           2606    139596 5   txeggs_storage txeggs_storage_incubator_plant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_storage
    ADD CONSTRAINT txeggs_storage_incubator_plant_id_fkey FOREIGN KEY (incubator_plant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 _   ALTER TABLE ONLY public.txeggs_storage DROP CONSTRAINT txeggs_storage_incubator_plant_id_fkey;
       public       postgres    false    354    281    3431            �           2606    139601 .   txeggs_storage txeggs_storage_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_storage
    ADD CONSTRAINT txeggs_storage_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 X   ALTER TABLE ONLY public.txeggs_storage DROP CONSTRAINT txeggs_storage_scenario_id_fkey;
       public       postgres    false    354    269    3386            �           2606    139606 '   txgoals_erp txgoals_erp_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txgoals_erp
    ADD CONSTRAINT txgoals_erp_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.mdproduct(product_id);
 Q   ALTER TABLE ONLY public.txgoals_erp DROP CONSTRAINT txgoals_erp_product_id_fkey;
       public       postgres    false    355    265    3378            �           2606    139611 (   txgoals_erp txgoals_erp_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txgoals_erp
    ADD CONSTRAINT txgoals_erp_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 R   ALTER TABLE ONLY public.txgoals_erp DROP CONSTRAINT txgoals_erp_scenario_id_fkey;
       public       postgres    false    355    269    3386            �           2606    139616 '   txhousingway txhousingway_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway
    ADD CONSTRAINT txhousingway_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.txhousingway DROP CONSTRAINT txhousingway_breed_id_fkey;
       public       postgres    false    357    253    3357            �           2606    139621 6   txhousingway_detail txhousingway_detail_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 `   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_center_id_fkey;
       public       postgres    false    358    278    3409            �           2606    139626 @   txhousingway_detail txhousingway_detail_execution_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_execution_center_id_fkey FOREIGN KEY (executioncenter_id) REFERENCES public.oscenter(center_id);
 j   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_execution_center_id_fkey;
       public       postgres    false    358    278    3409            �           2606    139631 >   txhousingway_detail txhousingway_detail_execution_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_execution_farm_id_fkey FOREIGN KEY (executionfarm_id) REFERENCES public.osfarm(farm_id);
 h   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_execution_farm_id_fkey;
       public       postgres    false    358    279    3419            �           2606    139636 >   txhousingway_detail txhousingway_detail_execution_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_execution_shed_id_fkey FOREIGN KEY (executionshed_id) REFERENCES public.osshed(shed_id);
 h   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_execution_shed_id_fkey;
       public       postgres    false    358    285    3445            �           2606    139641 G   txhousingway_detail txhousingway_detail_executionincubatorplant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_executionincubatorplant_id_fkey FOREIGN KEY (executionincubatorplant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 q   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_executionincubatorplant_id_fkey;
       public       postgres    false    358    281    3431            �           2606    139646 4   txhousingway_detail txhousingway_detail_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_farm_id_fkey;
       public       postgres    false    3419    279    358            �           2606    139651 ;   txhousingway_detail txhousingway_detail_housing_way_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_housing_way_id_fkey FOREIGN KEY (housing_way_id) REFERENCES public.txhousingway(housing_way_id) ON UPDATE CASCADE ON DELETE CASCADE;
 e   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_housing_way_id_fkey;
       public       postgres    false    357    358    3556            �           2606    139656 4   txhousingway_detail txhousingway_detail_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_shed_id_fkey;
       public       postgres    false    358    285    3445            �           2606    139661 -   txhousingway txhousingway_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway
    ADD CONSTRAINT txhousingway_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.txhousingway DROP CONSTRAINT txhousingway_partnership_id_fkey;
       public       postgres    false    357    283    3439            �           2606    139666 *   txhousingway txhousingway_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway
    ADD CONSTRAINT txhousingway_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.txhousingway DROP CONSTRAINT txhousingway_scenario_id_fkey;
       public       postgres    false    357    269    3386            �           2606    139671 '   txhousingway txhousingway_stage_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway
    ADD CONSTRAINT txhousingway_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id);
 Q   ALTER TABLE ONLY public.txhousingway DROP CONSTRAINT txhousingway_stage_id_fkey;
       public       postgres    false    357    273    3392            �           2606    139676 6   txincubator_lot txincubator_lot_eggs_movements_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txincubator_lot
    ADD CONSTRAINT txincubator_lot_eggs_movements_id_fkey FOREIGN KEY (eggs_movements_id) REFERENCES public.txeggs_movements(eggs_movements_id);
 `   ALTER TABLE ONLY public.txincubator_lot DROP CONSTRAINT txincubator_lot_eggs_movements_id_fkey;
       public       postgres    false    361    351    3533            �           2606    139681 7   txincubator_lot txincubator_lot_programmed_eggs_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txincubator_lot
    ADD CONSTRAINT txincubator_lot_programmed_eggs_id_fkey FOREIGN KEY (programmed_eggs_id) REFERENCES public.txprogrammed_eggs(programmed_eggs_id);
 a   ALTER TABLE ONLY public.txincubator_lot DROP CONSTRAINT txincubator_lot_programmed_eggs_id_fkey;
       public       postgres    false    361    368    3587            �           2606    139686    txlot txlot_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 C   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_breed_id_fkey;
       public       postgres    false    365    253    3357            �           2606    139691    txlot txlot_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 B   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_farm_id_fkey;
       public       postgres    false    365    279    3419            �           2606    139696    txlot txlot_housing_way_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_housing_way_id_fkey FOREIGN KEY (housing_way_id) REFERENCES public.txhousingway(housing_way_id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_housing_way_id_fkey;
       public       postgres    false    357    365    3556            �           2606    139701    txlot txlot_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.mdproduct(product_id);
 E   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_product_id_fkey;
       public       postgres    false    365    265    3378            �           2606    139706    txlot txlot_shed_id_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id);
 B   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_shed_id_fkey;
       public       postgres    false    365    285    3445            �           2606    139711 +   txposturecurve txposturecurve_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txposturecurve
    ADD CONSTRAINT txposturecurve_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.txposturecurve DROP CONSTRAINT txposturecurve_breed_id_fkey;
       public       postgres    false    367    253    3357            �           2606    139716 1   txprogrammed_eggs txprogrammed_eggs_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txprogrammed_eggs
    ADD CONSTRAINT txprogrammed_eggs_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 [   ALTER TABLE ONLY public.txprogrammed_eggs DROP CONSTRAINT txprogrammed_eggs_breed_id_fkey;
       public       postgres    false    368    253    3357            �           2606    139721 5   txprogrammed_eggs txprogrammed_eggs_eggs_movements_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.txprogrammed_eggs
    ADD CONSTRAINT txprogrammed_eggs_eggs_movements_id FOREIGN KEY (eggs_movements_id) REFERENCES public.txeggs_movements(eggs_movements_id);
 _   ALTER TABLE ONLY public.txprogrammed_eggs DROP CONSTRAINT txprogrammed_eggs_eggs_movements_id;
       public       postgres    false    368    351    3533            �           2606    139726 8   txprogrammed_eggs txprogrammed_eggs_eggs_storage_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txprogrammed_eggs
    ADD CONSTRAINT txprogrammed_eggs_eggs_storage_id_fkey FOREIGN KEY (eggs_storage_id) REFERENCES public.txeggs_storage(eggs_storage_id) ON UPDATE CASCADE ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.txprogrammed_eggs DROP CONSTRAINT txprogrammed_eggs_eggs_storage_id_fkey;
       public       postgres    false    368    354    3546            �           2606    139731 5   txprogrammed_eggs txprogrammed_eggs_incubator_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txprogrammed_eggs
    ADD CONSTRAINT txprogrammed_eggs_incubator_id_fkey FOREIGN KEY (incubator_id) REFERENCES public.osincubator(incubator_id) ON UPDATE CASCADE ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.txprogrammed_eggs DROP CONSTRAINT txprogrammed_eggs_incubator_id_fkey;
       public       postgres    false    368    280    3422            �           2606    139736 3   txscenarioformula txscenarioformula_measure_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioformula
    ADD CONSTRAINT txscenarioformula_measure_id_fkey FOREIGN KEY (measure_id) REFERENCES public.mdmeasure(measure_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ]   ALTER TABLE ONLY public.txscenarioformula DROP CONSTRAINT txscenarioformula_measure_id_fkey;
       public       postgres    false    369    259    3365            �           2606    139741 5   txscenarioformula txscenarioformula_parameter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioformula
    ADD CONSTRAINT txscenarioformula_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.mdparameter(parameter_id) ON UPDATE CASCADE ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.txscenarioformula DROP CONSTRAINT txscenarioformula_parameter_id_fkey;
       public       postgres    false    369    3369    261            �           2606    139746 3   txscenarioformula txscenarioformula_process_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioformula
    ADD CONSTRAINT txscenarioformula_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.mdprocess(process_id) ON UPDATE CASCADE;
 ]   ALTER TABLE ONLY public.txscenarioformula DROP CONSTRAINT txscenarioformula_process_id_fkey;
       public       postgres    false    369    263    3374            �           2606    139751 4   txscenarioformula txscenarioformula_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioformula
    ADD CONSTRAINT txscenarioformula_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txscenarioformula DROP CONSTRAINT txscenarioformula_scenario_id_fkey;
       public       postgres    false    3386    269    369            �           2606    139756 9   txscenarioparameter txscenarioparameter_parameter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameter
    ADD CONSTRAINT txscenarioparameter_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.mdparameter(parameter_id) ON UPDATE CASCADE ON DELETE CASCADE;
 c   ALTER TABLE ONLY public.txscenarioparameter DROP CONSTRAINT txscenarioparameter_parameter_id_fkey;
       public       postgres    false    3369    370    261            �           2606    139761 7   txscenarioparameter txscenarioparameter_process_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameter
    ADD CONSTRAINT txscenarioparameter_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.mdprocess(process_id) ON UPDATE CASCADE ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.txscenarioparameter DROP CONSTRAINT txscenarioparameter_process_id_fkey;
       public       postgres    false    3374    370    263            �           2606    139766 8   txscenarioparameter txscenarioparameter_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameter
    ADD CONSTRAINT txscenarioparameter_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.txscenarioparameter DROP CONSTRAINT txscenarioparameter_scenario_id_fkey;
       public       postgres    false    370    3386    269            �           2606    139771 ?   txscenarioparameterday txscenarioparameterday_parameter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameterday
    ADD CONSTRAINT txscenarioparameterday_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.mdparameter(parameter_id);
 i   ALTER TABLE ONLY public.txscenarioparameterday DROP CONSTRAINT txscenarioparameterday_parameter_id_fkey;
       public       postgres    false    371    3369    261            �           2606    139776 >   txscenarioparameterday txscenarioparameterday_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameterday
    ADD CONSTRAINT txscenarioparameterday_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 h   ALTER TABLE ONLY public.txscenarioparameterday DROP CONSTRAINT txscenarioparameterday_scenario_id_fkey;
       public       postgres    false    3386    269    371            �           2606    139781 ;   txscenarioposturecurve txscenarioposturecurve_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioposturecurve
    ADD CONSTRAINT txscenarioposturecurve_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 e   ALTER TABLE ONLY public.txscenarioposturecurve DROP CONSTRAINT txscenarioposturecurve_breed_id_fkey;
       public       postgres    false    372    3357    253            �           2606    139786 G   txscenarioposturecurve txscenarioposturecurve_housingway_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioposturecurve
    ADD CONSTRAINT txscenarioposturecurve_housingway_detail_id_fkey FOREIGN KEY (housingway_detail_id) REFERENCES public.txhousingway_detail(housingway_detail_id) ON UPDATE CASCADE ON DELETE CASCADE;
 q   ALTER TABLE ONLY public.txscenarioposturecurve DROP CONSTRAINT txscenarioposturecurve_housingway_detail_id_fkey;
       public       postgres    false    3562    358    372            �           2606    139791 >   txscenarioposturecurve txscenarioposturecurve_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioposturecurve
    ADD CONSTRAINT txscenarioposturecurve_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 h   ALTER TABLE ONLY public.txscenarioposturecurve DROP CONSTRAINT txscenarioposturecurve_scenario_id_fkey;
       public       postgres    false    372    3386    269            �           2606    139796 3   txscenarioprocess txscenarioprocess_process_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioprocess
    ADD CONSTRAINT txscenarioprocess_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.mdprocess(process_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ]   ALTER TABLE ONLY public.txscenarioprocess DROP CONSTRAINT txscenarioprocess_process_id_fkey;
       public       postgres    false    373    263    3374            �           2606    139801 4   txscenarioprocess txscenarioprocess_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioprocess
    ADD CONSTRAINT txscenarioprocess_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txscenarioprocess DROP CONSTRAINT txscenarioprocess_scenario_id_fkey;
       public       postgres    false    373    269    3386            ?   _   x�����!NC.KN(p��I�SHIUp���M�+IL�<�9O�5/=�(�_\�d�eh �d�SSPjAQ~JirI~Qb1D�9��W� G�%�      A   7   x�3�4�J-(�O)M.�/J,�4�4�4��43�t�K�/JI
qr��qqq >�      C   '  x�}�Iv�0D��a����?GWA�^�ʎp�B}��َ&Mf�?�^:����煳5Y<�K���7�}������<��>γ)����o�wo|�������YT��ߛ��Ai^��狶(o ���L�ۨnX�$�ƨ��S+1�H(O! G���2�2I���V�$I����,�y�=�*�"K4�H�넩��X� M4�TMc�8u@1+y�D�
^�	TY6�$�Ɩ(�b}��-�h�dj�����0�S�9�`zTL�LLW�T�C��b*dj���&d
��˧����*B���(��)�]{E]����礹��K�d�E�VsrV�d���e�+�:�J�E���T�L�L�c�:L���
870�� �ť���V?�`�`�s��n��X�w`5jL��f3�~���ս/E�����ND3UA�;�\��u/��'��bfSn�=L��؎����#L�¶Ƙ1�ű]S��a;gcΰ6r�2�MwΖ|!\�=̙����1g�[��1�s+�
��k�[�������ז�|x��ӗ:=qm�LE|*
9��o��S����jpm��o��q)`ϳ��#D*\L�B�U�" �Kc�AAd�
:��#D�F�����FЪ�'�:��Q(h�iեPйۓ"� ������ &'&��Q���Z��� D?�d�dz�㍂L�?)�4d��L#�$r�5Xǧ� TTgKn�6��<��k�����E��k^:u�kp,��$�I2I6��z~��I�5�D*	٢HO��L�5{+!ݡ������� �����������ܕ'�      E     x�e�Mj�@���)|3����,%��v��4R'�L�$ɝz�^�RC�m���>�$��B<N�6��H���]���>V��x�I����q����,ܼ�X#Ϭ����	S�չz9ƒ������ՠ�Θ�X6�����y�&$��Bψ�0��G&L[{5/����<S/�ʜ-�1dk�J+���*��c:\��o�ְZ� ��?Q�P���'�e�mQ�Mn�s�_�t
�B	����ۗ��N5H�n8�y8�
�mǏ!�:���ȢƧ� ��uI      G   }   x�U���0D���l7�
���AdF��gA�p8qo̲�k�@�N͢�������hg��8�^��Mi�i]Y-׬��R]g�B?��X�GרtB�X�%Կe���Bd�c����z��>�      I   <   x�3�T2T�T�NN�Q�2�T2rTRR
��KR3����9��a��ɩ�%�J\1z\\\ ��e      K   x   x�E�=
�0��9:E�����C�z�.!ACmp{"lL����/ҀDdq�g�]�#�h��S���N�����՗t�r��k�Iqݾ|3j�Y�fզj��S
mv��£�Q{���� �'      N   �   x�m̽1��ڞ�	Pb��R#����"䂜n3F`1�Ӏ����Y/����$Y��Qޯ���+8�VH���CIQ�� U��	����[����P�m�U�M�u�2S��N�3�t'�d�� �Nv9d��2��G�ͬ@d      O   '   x�3�Tr9�6Q	B+qq*��&恄 �`� �      n      x������ � �      p   K   x�3���K/J-����I�(-�2�9s:��%rs�BD�8�R�J�L`.�.��ɉE%�\�01�I1z\\\ ���      s   8  x�}��n�0���S�6��7�ä!!��⦦��&�I*uO?�T)0�S�|��ǿ���L'��	��&A���d;n�F/p�
�(+E?���x+��\���&�"�α��T��F=���&D�vg�9=��y=�H�{&�#C��2�gPeB��!&�M���&���X*�lI�]��L�Qc��א����'o�\M��6��l�Zm��������	k��+�l�S�g�pE�ق��:n;�O�j�����%M}�i�,઄��b��u��Tz�5���S�=Fj��&Y���U|=E�<��n      u   ^   x���	�0��aJ��w��sT
�Ä�9�d64���Ü���27�ypL��)Z�O�)��^���H��$A��ȏ������JF��=U��F      v   5   x�3�200�t�OJ�2��9=��ACΠ��b.� ; '����+F��� #IV      w   �   x�}���0��ۧ�	Ho�,����J"	X"���V�7�6����
��0��ҍ��ɪ�{�g�0�Z񯃠���%H��;���tX4��}lN���o�.ۺ��A�\o��c?{�(���9MA�RT��
IqT���r�?���Bq�4Ij�^�Z�x0��+o��i0uss^FQ�֪�F1>�c��C�,�$��1�0H��ed�(��Q�?Ud�cHV猱J��W      x   s   x�=��C!ϸ���<�%���/��#�����e����V��{������/���$ɾ��?x��ɓLxy��l���]���q	��"�ɥ�H�4}��tn��d���(ߏ�� >�(�      z   ;   x�3�J-(�O)MN�<�9/&�ˈ�5/=�(%�˘�'�,1�$U�R�����D�=... Վ      |   !   x�3�,�/rIMKM.����4��=... m%�      ~   �   x���Mn�0�מS�	*�_º�Q��	�++��V=E/FbR $K��{�=R��1?m��d�dsƃ���H���E $�v�_dtNB
)^y��d��t+eC�jUʸ��iۡy�o�i���֤�����MCN�/@�5�z��9��yST��Kop;\��q Wځ����7�>���s�(����H���vn9�'����U���]�͊M���=�Wk�?g~)�~ �xw;      �   ~  x��TKN�0]ON�	,{���FH� ���iӀ*U	j��{q.�x�E�lo�8Y�����|<P
T�����A�5�����M����V���vt4�nN�|�#Hx�� 05
��0rZ���&Bu������K�Q�ʉ
|Ȑ*T��������~H�%��a��iS��¸p�T��m���t��$E���8����&���(E���K�D�N׌����-�������
�iz���6���Gj(u`����ʅH-��<ilTO�[zQ�S!��a����Z Ζ
��N���R]�rV)y1�5L�_􍼎��V�\ۙ��Rن�香����=����0E��B�MFr[a��w����!��X\�i-����d�      �   �   x�m���0E�3_�/0L[��M��n 16A��0~�ӊ&��ܛ;��f)%P�Ϟ/S3r_����H�&���������%-@�p�3�-��������~A�Y�zIC�`-ѼǠ4�"!p�u���}�9F	)���u�{����+���N�wX�y���o�� ����P_�{���-E����6�l��~[����f�-��5�w��5�"      �   =   x�3�tL����,.)JL�/�4�420��5��54Q0��26�24�321�43�50����� ~};      �      x������ � �      �   `   x�3�t�,.���L�IU(H,JTp���J��L�+��'�eę�\Z������9���͇R\&��y�I�9�% e�.S΢��Ԣ2������� S�4"      �   N   x�3�4�t�K�/JI�2�4���K.MJL����2�4�J-(�O)M.�/J,�2�4�t.:�6Q�R�'�,1�$�+F��� ۏ�      �   �   x�=�A�A �3��n�����4M�xXM��G7&�*u.�F�]����>�v��z̕�fy-������E�<�wE���Cu"��!C*��
�n���䌎�1��ʔU�$:�����R�v����;��������|��}zo5�      �   @   x�3�LL����,.)JL�/�420��50�5��,�HM�44461�2!��˔�*sK�=... ���      �   ]  x�u�Kn�8���)t��ԃ��ytҁ�	ڙY����nzhѣG��6s���6���%m��X�XR��B\��"�\G{��L�Ή��w)d���O�Z�wִ̞�`���tӸ�E���R��Z[ݬ��D��(�{mw:�M���1�n���FO���,����h�mZ���Sڢk���]�J�;���/)�(� ]�z��ai�����V.Z�:ZV/����?k:J'���p��:���U�Qq.�p�B���/�z�tKy<���"���`�O8�f���<Ok���E7ng�M��В仩W���`y�*w�K۪�f�
���Mՙ0:D��C溦�3B8||S�+]Y�!��δ��m][q+����k�tf|�ؒr�2���& ��|/���Uh�|TChF� _	.!p���f�-��;����R��ee_�sy�6/�����Oc���+�w�:b{�W����v����ou�3'��� ���F�]t�o�΅�Qœ��t׽q�Tr̝"A��WBZу6�0(��R�
�=��TU�A�HV�ɼ�͆�0��n�r����X��&��(�g��nB��/Ǿѝ���)��j~hR��b�B�Y�B�E2����@�C��{k��WD�����@R,�:<�v����l �̈�C�u������Xz=B���F�а�ڀcA��Nzf����A�((G��]#�6�H�q(ϯ�ڸ	�`�	�����c���Q�|�ODh���S�(�D�H� )R6��ƀP)|(ٙP�Q$�(=#�)/RgDj�>��$�d�6�
s�k��u�0Ճ;C��8Q�����I�an�5�b0AK�����A�����Z荶,�e��?�&Α�O}]O'*c���;Y7f�+R�Y�c�?�2N<���ݴ%$���J`P�W@�]sgD�ЁZ(��߹d��Ų�ŲQ����3.G��h���1�`C��q
.p#b/��j�3Q
������K�m2�^:nW [1��m��W�HTH�g�S����@�b86�G��6I_.N���_�zcT�W!kf����Z����		݇<�A���%���`޹�,%]��|���6)i�PW~4ͫ�#1"�UES�7AZJ�)*��ޮ�8<Qn�$�]_�����|�&����R����=P2�ֳ��]�����3ٞ��Է��V0	3/��es/���
���`�|$�)z�=��G�.���R6<���ׇdMlj�H?�d8�&�L>_�0�-$����J�����?~`�@��0�`n�34>���D�D���^�uo/��K-���Y��&#����7�~?\�~���z�ǯ�n1��vyy�?���y      �   F  x�m�_n�8Ɵ�S�]XI=:m�i��vЧ����4(�KI����aϐ�u���)���8�7?ΐNE*Vr��/�${�}�è���E.�?�o�Ѵ�:m�'��9��@�������beF;$M�H>�z��4�h`�d��ߨVa��v"����2������ᜫC���#���MM��(�v�ʧ��>�d��6��U#�8�̹�w��24D�����4�F���!�a�����oF�p���l#�]k�~�oQ�(�,�з�Q�Y�~�iǨQ�Y!>Z7�S4�Q�e壒-8�S)�R�)luoc
��ͩcnh�GR��N�.�%�Q�ټi���Sl�4�����c��h�/�
�����6!'H��;p�6I?dQ��_ �����*e���"�=`Z������r�U�糵�1�pU����Q�J�	�W���_�pU�����*�i���M&XU9��m��E 5�|�`�6J	y���m�#9G�'v6�AJ_&,�^G%�QsжmX��Ax��+��Ħ�C����D"#��h�O��x�Q':2�ּ�8g���蠱�����I��mVIxd&�ڴ���+��-��%�;��%����OF������pI�d!��ٺ�=pR�aB�G0��}I�d�Q�U�@�Ov�:��e��Z|~���GJ���?�늠�V�tOw�4o؊�H%�&��B�Z|k��_E 
�5���p�*�PK�M�qe��k���`�u�`ݝ�FTT��[<I&�ε���l�`X�UDHe!�k�N�"LX��u��|��S��L�a�?`#lI���Y�7D�� v�k���.e (�Uce�����bòHb����_�"\��_�M%tJ�H|��s����
3��{Te�W�k�|��U V��?_Z��X}-�-p�H��M��fg�V}=�=މLO�Rlt��+^�M�v�F������{���=��WD	{ݿ���/�
�\!�{n��`�o}5Ɛ:t�|��n��:�j)��w��ՁG���#Ji#���og3?�6�P^��Աϧs�^5���'��޼������b��	����      �   T  x�����G���S�l(�$u�q9��C���Cl�1!o�ّ	����e{��n�TjU۶Nrz�����{��^�!N�K����ߞ�>~��t����?�����I\t�^~�����oϿwn���w��z�����!~�T��w�������$6�2����kJ�5{�B�ڔ�_?���\�8~�r3�
��
�X�rhӂ�͂9�Y���05惾`��m��
f��	l���ajX>3kbV0c0/�3X,��ێu��uvbbx>~�ݤ���I����`�`�e�5#��l2X�l+�3�*X�c�m���I�&�i���f����`�`�+��jb�`�`{���b,���3ۛ�����hʸ<3��/�F���&V{�9LZM���N\��Xs�SL��X��3��-�f	2\N�XwC��\�uKPL���y�����_z���Q��q�,S"�&Xw1ai�Ě�ԡ��+Q��M������]�R��r��ծ�R0g0-X0,rɑRs�g[�l+��� �H���6�3�s���a rp#���ml�l/��>
��Y��k1/�3X,�9��na>F����`�`Z�`0�f�4�7��E�����9����	F3�r��ƴ`�`�`�`V�`0�f�!�Ӿ�����sþQr��0�9����6f3�9�E��� ��c�Qz���1D��9�i��� ��ݶ�����E�����9���E��F��7{Z�崥Yim���9P�s�%(G7�}�,G7�∇��h
�x/9�i� LڑW�[��a��I�}3Jj(�3�
Pb\�#�>���G2�cC���+v9;k���<�l/&|�y����01r�n[0 9�k/&,�9�jot ��f͚q9��J�I|ץHY�rXH9ji~"��\Z�z�!e�H9ARAP�G~�ޢb e%H9A)RAP���h��@�jC�	j!}j�d�C�%HM�R���&RNP�T�)۱�����!p(3�Sm�r�%���1�f^Y���	%�{?��� U��[�aY���nA��a}oY�.%���_;�y�ٕ��mw]1�JDqa���a��?������      �   7   x�3���K.MJL�/JTp�,.)J,K-�t��4�.c�i�i�Y�1~@����� *�      �   G   x�3�t�,.)�L*�L�/JTp,;�69?'Q!X�Q/��=����<����ܤ�D�98c��b���� ��      �   C  x���[��&@�}�2��L #�w�?� �{� �6�t*]�>g]Bolxw�����.��럿�o�5grW��:����q=�����c^�s�ij�����+��ёd>c!��D_3��	��̋B�1�m��'9�a�#�o�����.��2��`\���:����}��ο|g�3�'n�=�EL�W���3!�`��^�П���T��_�r���OB^fbaҿ��=<�F���7m //fJ�ґ�JCHb�Lp��c
 /%��j8wځj���B$&fu�u+�6a���d���F�0�+U���J�'�i6�g���f^+ɂ���koH���Ч����3ɚwU�����*@��YA�N`}̌��a�E1'��%M�oO���؊�j�Vʐhk��x�޳��"e����p�!�vaͤSYX?�L�~�V�����l�V��a���
'ֺ���<Ƈ�A��Gg����Ԛ�3�Ȍ�K�)v�:��J�Ѻ�%ƞVwm {�;��	-Q�("c�
�UL�}�!���|�}�l��V��_���HZ;�ω�l���Y�kY���W7�zs�Rg�?�bvᡩ�XP1MJ"�W9�ƺh����8�mi(Ȕ,�6`d�5�ʒ�����6��%�LeC9N/Lyt�'bd;����H�8�QV1u^0�L�����A�Y�Qf�S�Z����^;f��X�K%��r��GZ��T�g�g]��3��ɱM����t������*G��y�^
{���N��ЇI6��l�|u��ūa"�ON��s~P��.���SǼ}91�7t����4^���X�y��!"�D�m�jo���_�D��O
�� ��Ki���l��(�^3�`
��{)cƌF�\�R����MI�2l�s9hx���7ޞ L����\eh~t�Ge��~� ��]T1�%)q�JەSbPկO�u� "����k�%kcblcLTL'�vS�$(n��hE�j4��]�~WxpA0����i��$+��֨oՖ9/�zv�=wze������6Fb�Wtfy�Hh%]���_��dڄ8���e[�v�8L�`L����h�jd��G�d������7�Z��Udvl��N����̠�Ta������.B��_�X���F�*�I[����׃�%T^+���,K��x����v�z��R.���c��a��f�-��&����'i Tׇc�wE9����+�,Ya�X6kNk&�T^��U*�Af#_���R��7�(�"B����]Q���J?��-[Dl�SQ�Դ���I���-�U8�8
 ��~��lc�/
&��j��u�6ʸͧIm�}V�] �B��E�8dgkd_����XGf]%_qPm��߹�FK���6�6�)>�'+��(c�u�5��_4�'*�f��r��tye�@�嵉;��v�+跆2KR��j��*�t酾B�b�L+�r�&��i���,�JN�ټ��qq&8F%�;ee)���;E�r� _-X\��M�V���qud�$π1_�Ae��BK&��A�r��c9�+L��q�|�t���qFUU�������A�޿��L.6W��a��U1�65���3J�ͼ��5S���2�ݖ����'֮Gbh��?����N���@˭92K�(z̻�k���@�9��,0�Ƽ��Fxf��.�f�U%�)0��J*>Gp��A�e���/��j�Kec������׌�z��5�-��2��Ť��ܝ�� ��?�o�d�����B��`tu/Rp�[��,�ic��(�m���9�z�o{�˸UDwVk�~����l�e��V0ۦ�3
��?�l���`�/��)|w_a�������ﶎ��y֞H��}oԙa�k��t���A��{�39�NG�����NjiS�L�ډ)3
������,R���e������<�M����{�|��"�q�c�5���:��d�V�HS#'�jLs����s�ZƮ��S�+]�Ȳ`d�uS�yE���h^7��9�(�*T��8�ӍH�}:�'�3���h�����-���
�-?�1�`ʃ��"-�ܙ+�Q�D�Fw���0h���V��s��<Ơ�qk����lg��ʤ;#φ�j�ػ��6����̦�:�[29$�D�Q�5��9�,����t�9#X7P<���ن����09��WSn8��yN�����08�+���:nT??)L٣ĭ��3�m����ȚI*H���𥡙X>G��Qa���g��J��]%)��YÝ��;C/�6�T��-���������e�ˈ�Z�K�d��%��+QTS5jw���wy� �W������\��5L�9�GRWj�n?<�bc�a�U7b�R��F����n�a��Q2�#��#G��$h���jݥҟx�E|�l���%I �[�l����NF�l�t>/��*a�����
fd%*Lap8�a�Y��AH������pYQ�}�ф,��]VN����� ���_>hឱK�����2FO!�F��^�+��rdZ��nvaJ'ϸ1x�����>�f$F��>�����}�P1��Q�׸��ƪ+\w�x��M�ڪ�0�)�A�i,�e���񶦭e(��l͈��<[�*���5���{.~�\ث}>N����Ŭ)7�?#�o��y�9}���*{����%��m��Ҿ�I�����a�3z���k�����(��ue��Ч{���R@���~0D#�3��*��$��Q��;��f�.��{�֖��(���`�{����`DlDy���t�d�|�B:�ץ��,���ߊ�����c`�&��/���Ċ�Hϣ�"\��:�A5�c��i�C��ɠ��T�	�UE5aF���ݶ�P��4]��v.f�rT� �(L;b�Q��Gm�Q�=�h\�/'!�7Mo��%�-�ʝ�;ӳyyI,O�/��HY�t"�oi,�J��#;n�>	��SqQ8�������A��K8��p�[0�b!�M���Dz��6��DR�^[WP���rr��g99�-H��+WsN1�;0�V�;:JA_��L�(�`�����y醽g��_c�v��M�=����6-��X`�´#��s��G��ڷy�ū��L���������V> "�9�o_��x�e)U���*;5�ȥ����^��zEpPW:�R�q�j�mΞ��9~�WY9��M�.�5:�|5�����B?���� +�W����6<ëC�SO�1�ϕ->���k������v�� ۉuN/�f���F�oI��C+F���Bv2#d�d�Ծ���*���m�;ә��������|/�jg�u�/�9� �9��s����?�"��      �   \   x�36��I�+ITHIUpJ�KM�L��WH�Qp�L�J�r:�&'���:
��9��I��Xu9.��%E�e�Ŝ�����@������� ��"]      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �   S   x�3�LL����,.)JL�/�420��50�50�t64���2£�����
SN#]CC�"��A�L�(2*2)����� �/�      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �   {  x���=�!�c�a�������`S�v��[-60��V��d��	��H������'����|����ϗ\�młn������ӭ���i���œ��������^��1���J��b��df����W$F�=c�|������p
���U&5S#7��Y�v����ݩ�[���3��{Y?7�e̨j���i.u�QX��/*�YD7ߨԯ"���~�"m���l������Y�=����w�y������[���8�+�������'��^6���⽪�h��\/|o��{ va�}X�eOI�������d�h�� �L��ёd1e����P'R,`���Ņԋ�0�T_*#u���E�b��qB���S�����܍�5�֘�zJ�e�[�G8��-3v���4LnؼT4-�C�Nn�h���/J�Z��q9J��h�v�8ns����m��?�N��>���S�+�&y�6.0���Fc�Ѹ�h����z�р�$�Fc�1y��mL>`4�+%>a48�)~�h�ϳ����+�&��l_���������k����x-�d_�Zwx���QtXx�԰xL�^j�',�p9Xp��Q5~.f�!�����%�Ca/�S�w��|��=yW*�2���l�n�r�o�Ǩ���6M�4����ԭ����m{H/ZCz��W��^�w[�s��d[}!:�6	�nb��V�&��8�epAo�s~����o�>����_ ��J�	0�x��/D��
-?��=�[R�ģhl�~$�T��~&/���^lzZ�&"��D
��W��AD��d���w�f��)هf��S�,\0�=��VX���<w��(�:��U
����fN�*�-ֹ/��p�9:����^�?��vd      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �     