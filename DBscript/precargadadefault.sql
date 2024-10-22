PGDMP                         x            precargadadefault    10.3    10.3 �   �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                       false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                       false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                       false            �           1262    139808    precargadadefault    DATABASE     �   CREATE DATABASE precargadadefault WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'Spanish_Venezuela.1252' LC_CTYPE = 'Spanish_Venezuela.1252';
 !   DROP DATABASE precargadadefault;
             postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
             postgres    false            �           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                  postgres    false    3                        3079    12924    plpgsql 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
    DROP EXTENSION plpgsql;
                  false            �           0    0    EXTENSION plpgsql    COMMENT     @   COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';
                       false    1            �           1255    139809    delete_broiler_cascade(integer)    FUNCTION     �  CREATE FUNCTION public.delete_broiler_cascade(lot_b integer, OUT deleted boolean) RETURNS boolean
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
       public       postgres    false    3    1            �           1255    139810 #   delete_buy_chicken_cascade(integer)    FUNCTION     9  CREATE FUNCTION public.delete_buy_chicken_cascade(buy_id integer, OUT deleted boolean) RETURNS boolean
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
       public       postgres    false    3    1            �           1255    139811    delete_buy_egg_cascade(integer)    FUNCTION     �  CREATE FUNCTION public.delete_buy_egg_cascade(buy_id integer, OUT deleted boolean) RETURNS boolean
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
       public       postgres    false    1    3            �           1255    139812 !   delete_incubator_cascade(integer)    FUNCTION     �  CREATE FUNCTION public.delete_incubator_cascade(inc_id integer, OUT deleted boolean) RETURNS boolean
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
       public       postgres    false    3    1            �           1255    139813 "   delete_production_cascade(integer)    FUNCTION     R  CREATE FUNCTION public.delete_production_cascade(produccion_id integer, OUT deleted boolean) RETURNS boolean
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
       public       postgres    false    3    1            �            1259    139814    abaTimeUnit_id_seq    SEQUENCE     �   CREATE SEQUENCE public."abaTimeUnit_id_seq"
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 +   DROP SEQUENCE public."abaTimeUnit_id_seq";
       public       postgres    false    3            �            1259    139816    aba_breeds_and_stages_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_breeds_and_stages_id_seq
    START WITH 8
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 3   DROP SEQUENCE public.aba_breeds_and_stages_id_seq;
       public       postgres    false    3            �            1259    139818    aba_breeds_and_stages    TABLE     "  CREATE TABLE public.aba_breeds_and_stages (
    id integer DEFAULT nextval('public.aba_breeds_and_stages_id_seq'::regclass) NOT NULL,
    code character varying(100),
    name character varying(100),
    id_aba_consumption_and_mortality integer NOT NULL,
    id_process integer NOT NULL
);
 )   DROP TABLE public.aba_breeds_and_stages;
       public         postgres    false    197    3                        0    0    TABLE aba_breeds_and_stages    COMMENT     o   COMMENT ON TABLE public.aba_breeds_and_stages IS 'Relaciona los procesos de ARP con el consumo y mortalidad ';
            public       postgres    false    198                       0    0    COLUMN aba_breeds_and_stages.id    COMMENT     o   COMMENT ON COLUMN public.aba_breeds_and_stages.id IS 'Id de la relacion entre proceso y consumo y mortalidad';
            public       postgres    false    198                       0    0 !   COLUMN aba_breeds_and_stages.code    COMMENT     u   COMMENT ON COLUMN public.aba_breeds_and_stages.code IS 'Codigo de la relacion entre proceso y consumo y mortalidad';
            public       postgres    false    198                       0    0 !   COLUMN aba_breeds_and_stages.name    COMMENT     u   COMMENT ON COLUMN public.aba_breeds_and_stages.name IS 'Nombre de la relacion entre proceso y consumo y mortalidad';
            public       postgres    false    198                       0    0 =   COLUMN aba_breeds_and_stages.id_aba_consumption_and_mortality    COMMENT     �   COMMENT ON COLUMN public.aba_breeds_and_stages.id_aba_consumption_and_mortality IS 'Id de tabla aba_consumption_and_mortality (FK)';
            public       postgres    false    198                       0    0 '   COLUMN aba_breeds_and_stages.id_process    COMMENT     Y   COMMENT ON COLUMN public.aba_breeds_and_stages.id_process IS 'Id de la tabla mdprocess';
            public       postgres    false    198            �            1259    139822 $   aba_consumption_and_mortality_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_consumption_and_mortality_id_seq
    START WITH 8
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 ;   DROP SEQUENCE public.aba_consumption_and_mortality_id_seq;
       public       postgres    false    3            �            1259    139824    aba_consumption_and_mortality    TABLE     ?  CREATE TABLE public.aba_consumption_and_mortality (
    id integer DEFAULT nextval('public.aba_consumption_and_mortality_id_seq'::regclass) NOT NULL,
    code character varying(100),
    name character varying(100),
    id_breed integer NOT NULL,
    id_stage integer NOT NULL,
    id_aba_time_unit integer NOT NULL
);
 1   DROP TABLE public.aba_consumption_and_mortality;
       public         postgres    false    199    3                       0    0 #   TABLE aba_consumption_and_mortality    COMMENT     �   COMMENT ON TABLE public.aba_consumption_and_mortality IS 'Almacena la información del consumo y mortalidad asociados a la combinacion de raza y etapa';
            public       postgres    false    200                       0    0 '   COLUMN aba_consumption_and_mortality.id    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.id IS 'Id de los datos de consumo y mortalidad asociados a una raza y una etapa';
            public       postgres    false    200                       0    0 )   COLUMN aba_consumption_and_mortality.code    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.code IS 'Codigo de los datos de consumo y mortalidad asociados a una raza y una etapa ';
            public       postgres    false    200            	           0    0 )   COLUMN aba_consumption_and_mortality.name    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.name IS 'Nombre de los datos de consumo y mortalidad asociados a una raza y una etapa';
            public       postgres    false    200            
           0    0 -   COLUMN aba_consumption_and_mortality.id_breed    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.id_breed IS 'Id de la raza asociada a los datos de consumo y mortalidad';
            public       postgres    false    200                       0    0 -   COLUMN aba_consumption_and_mortality.id_stage    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.id_stage IS 'id de la etapa en la que se encuentran los datos de consumo y mortalidad ';
            public       postgres    false    200                       0    0 5   COLUMN aba_consumption_and_mortality.id_aba_time_unit    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality.id_aba_time_unit IS 'Id de la unidad de tiempo utilizada en los datos cargados en consumo y mortalidad (dias o semanas)';
            public       postgres    false    200            �            1259    139828 +   aba_consumption_and_mortality_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_consumption_and_mortality_detail_id_seq
    START WITH 203
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 B   DROP SEQUENCE public.aba_consumption_and_mortality_detail_id_seq;
       public       postgres    false    3            �            1259    139830 $   aba_consumption_and_mortality_detail    TABLE     =  CREATE TABLE public.aba_consumption_and_mortality_detail (
    id integer DEFAULT nextval('public.aba_consumption_and_mortality_detail_id_seq'::regclass) NOT NULL,
    id_aba_consumption_and_mortality integer NOT NULL,
    time_unit_number integer,
    consumption double precision,
    mortality double precision
);
 8   DROP TABLE public.aba_consumption_and_mortality_detail;
       public         postgres    false    201    3                       0    0 *   TABLE aba_consumption_and_mortality_detail    COMMENT     �   COMMENT ON TABLE public.aba_consumption_and_mortality_detail IS 'Almacena los detalles para la unidad de tiempo asociada a una determinada agrupación de consumo y mortalidad ';
            public       postgres    false    202                       0    0 .   COLUMN aba_consumption_and_mortality_detail.id    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality_detail.id IS 'Id de los detalles para la unidad de tiempo asociada a una determinada agrupación de consumo y mortalidad ';
            public       postgres    false    202                       0    0 L   COLUMN aba_consumption_and_mortality_detail.id_aba_consumption_and_mortality    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality_detail.id_aba_consumption_and_mortality IS 'Id de la agrupación de consumo y mortalidad asociada';
            public       postgres    false    202                       0    0 <   COLUMN aba_consumption_and_mortality_detail.time_unit_number    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality_detail.time_unit_number IS 'Indica la unidad de tiempo asociada a la agrupacion de consumo y mortalidad';
            public       postgres    false    202                       0    0 7   COLUMN aba_consumption_and_mortality_detail.consumption    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality_detail.consumption IS 'Consumo asociado a una determinada agrupación de consumo y mortalidad ';
            public       postgres    false    202                       0    0 5   COLUMN aba_consumption_and_mortality_detail.mortality    COMMENT     �   COMMENT ON COLUMN public.aba_consumption_and_mortality_detail.mortality IS 'Mortalidad asociada a una determinada agrupación de consumo y mortalidad ';
            public       postgres    false    202            �            1259    139834    aba_elements_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_elements_id_seq
    START WITH 22
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 *   DROP SEQUENCE public.aba_elements_id_seq;
       public       postgres    false    3            �            1259    139836    aba_elements    TABLE       CREATE TABLE public.aba_elements (
    id integer DEFAULT nextval('public.aba_elements_id_seq'::regclass) NOT NULL,
    code character varying(100),
    name character varying(100),
    id_aba_element_property integer NOT NULL,
    equivalent_quantity double precision
);
     DROP TABLE public.aba_elements;
       public         postgres    false    203    3                       0    0    TABLE aba_elements    COMMENT     T   COMMENT ON TABLE public.aba_elements IS 'Almacena los datos de los macroelementos';
            public       postgres    false    204                       0    0    COLUMN aba_elements.id    COMMENT     D   COMMENT ON COLUMN public.aba_elements.id IS 'Id del macroelemento';
            public       postgres    false    204                       0    0    COLUMN aba_elements.code    COMMENT     J   COMMENT ON COLUMN public.aba_elements.code IS 'Codigo del macroelemento';
            public       postgres    false    204                       0    0    COLUMN aba_elements.name    COMMENT     J   COMMENT ON COLUMN public.aba_elements.name IS 'Nombre del macroelemento';
            public       postgres    false    204                       0    0 +   COLUMN aba_elements.id_aba_element_property    COMMENT     q   COMMENT ON COLUMN public.aba_elements.id_aba_element_property IS 'Id de la propiedad asociada al macroelemento';
            public       postgres    false    204                       0    0 '   COLUMN aba_elements.equivalent_quantity    COMMENT     �   COMMENT ON COLUMN public.aba_elements.equivalent_quantity IS 'Cantidad de la propiedad asociada al macroelemento con el fin de realizar equivalencias';
            public       postgres    false    204            �            1259    139840 &   aba_elements_and_concentrations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_elements_and_concentrations_id_seq
    START WITH 105
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 =   DROP SEQUENCE public.aba_elements_and_concentrations_id_seq;
       public       postgres    false    3            �            1259    139842    aba_elements_and_concentrations    TABLE     }  CREATE TABLE public.aba_elements_and_concentrations (
    id integer DEFAULT nextval('public.aba_elements_and_concentrations_id_seq'::regclass) NOT NULL,
    id_aba_element integer NOT NULL,
    id_aba_formulation integer NOT NULL,
    proportion double precision,
    id_element_equivalent integer,
    id_aba_element_property integer,
    equivalent_quantity double precision
);
 3   DROP TABLE public.aba_elements_and_concentrations;
       public         postgres    false    205    3                       0    0 %   TABLE aba_elements_and_concentrations    COMMENT     x   COMMENT ON TABLE public.aba_elements_and_concentrations IS 'Asocia una formula con los macroelementos que la componen';
            public       postgres    false    206                       0    0 )   COLUMN aba_elements_and_concentrations.id    COMMENT     �   COMMENT ON COLUMN public.aba_elements_and_concentrations.id IS 'Id de la asociación entre una formula con los macroelementos que la componen';
            public       postgres    false    206                       0    0 5   COLUMN aba_elements_and_concentrations.id_aba_element    COMMENT     g   COMMENT ON COLUMN public.aba_elements_and_concentrations.id_aba_element IS 'Id del elemento asociado';
            public       postgres    false    206                       0    0 9   COLUMN aba_elements_and_concentrations.id_aba_formulation    COMMENT     l   COMMENT ON COLUMN public.aba_elements_and_concentrations.id_aba_formulation IS 'Id de la formula asociado';
            public       postgres    false    206                       0    0 1   COLUMN aba_elements_and_concentrations.proportion    COMMENT     x   COMMENT ON COLUMN public.aba_elements_and_concentrations.proportion IS 'Proporción del elemento dentro de la formula';
            public       postgres    false    206            �            1259    139846    aba_elements_properties_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_elements_properties_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 5   DROP SEQUENCE public.aba_elements_properties_id_seq;
       public       postgres    false    3            �            1259    139848    aba_elements_properties    TABLE     �   CREATE TABLE public.aba_elements_properties (
    id integer DEFAULT nextval('public.aba_elements_properties_id_seq'::regclass) NOT NULL,
    code character varying(100),
    name character varying(100)
);
 +   DROP TABLE public.aba_elements_properties;
       public         postgres    false    207    3                       0    0    TABLE aba_elements_properties    COMMENT     �   COMMENT ON TABLE public.aba_elements_properties IS 'Almacena las propiedades que pueden llegar a tener los macroelementos para realizar la equivalencia';
            public       postgres    false    208                       0    0 !   COLUMN aba_elements_properties.id    COMMENT     Z   COMMENT ON COLUMN public.aba_elements_properties.id IS 'Id de la propiedad del elemento';
            public       postgres    false    208                        0    0 #   COLUMN aba_elements_properties.code    COMMENT     _   COMMENT ON COLUMN public.aba_elements_properties.code IS 'Codigode la propiedad del elemento';
            public       postgres    false    208            !           0    0 #   COLUMN aba_elements_properties.name    COMMENT     `   COMMENT ON COLUMN public.aba_elements_properties.name IS 'Nombre de la propiedad del elemento';
            public       postgres    false    208            �            1259    139852    aba_formulation_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_formulation_id_seq
    START WITH 68
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 -   DROP SEQUENCE public.aba_formulation_id_seq;
       public       postgres    false    3            �            1259    139854    aba_formulation    TABLE     �   CREATE TABLE public.aba_formulation (
    id integer DEFAULT nextval('public.aba_formulation_id_seq'::regclass) NOT NULL,
    code character varying(100),
    name character varying(100)
);
 #   DROP TABLE public.aba_formulation;
       public         postgres    false    209    3            "           0    0    TABLE aba_formulation    COMMENT     g   COMMENT ON TABLE public.aba_formulation IS 'Almacena los datos del alimento balanceado para animales';
            public       postgres    false    210            #           0    0    COLUMN aba_formulation.id    COMMENT     [   COMMENT ON COLUMN public.aba_formulation.id IS 'Id del alimento balanceado para animales';
            public       postgres    false    210            $           0    0    COLUMN aba_formulation.code    COMMENT     a   COMMENT ON COLUMN public.aba_formulation.code IS 'Codigo del alimento balanceado para animales';
            public       postgres    false    210            %           0    0    COLUMN aba_formulation.name    COMMENT     a   COMMENT ON COLUMN public.aba_formulation.name IS 'Nombre del alimento balanceado para animales';
            public       postgres    false    210            �            1259    139858    aba_results_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 )   DROP SEQUENCE public.aba_results_id_seq;
       public       postgres    false    3            �            1259    139860 &   aba_stages_of_breeds_and_stages_id_seq    SEQUENCE     �   CREATE SEQUENCE public.aba_stages_of_breeds_and_stages_id_seq
    START WITH 24
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 =   DROP SEQUENCE public.aba_stages_of_breeds_and_stages_id_seq;
       public       postgres    false    3            �            1259    139862    aba_stages_of_breeds_and_stages    TABLE     '  CREATE TABLE public.aba_stages_of_breeds_and_stages (
    id integer DEFAULT nextval('public.aba_stages_of_breeds_and_stages_id_seq'::regclass) NOT NULL,
    id_aba_breeds_and_stages integer NOT NULL,
    id_formulation integer NOT NULL,
    name character varying(100),
    duration integer
);
 3   DROP TABLE public.aba_stages_of_breeds_and_stages;
       public         postgres    false    212    3            &           0    0 %   TABLE aba_stages_of_breeds_and_stages    COMMENT     �   COMMENT ON TABLE public.aba_stages_of_breeds_and_stages IS 'Almacena las fases asociadas a los animales considerados en la tabla de consumo y mortalidad y asocia el alimento a ser proporcionado en dicha fase';
            public       postgres    false    213            '           0    0 )   COLUMN aba_stages_of_breeds_and_stages.id    COMMENT     �   COMMENT ON COLUMN public.aba_stages_of_breeds_and_stages.id IS 'Id de la fase asociadas a los animales considerados en la tabla de consumo y mortalidad ';
            public       postgres    false    213            (           0    0 ?   COLUMN aba_stages_of_breeds_and_stages.id_aba_breeds_and_stages    COMMENT     �   COMMENT ON COLUMN public.aba_stages_of_breeds_and_stages.id_aba_breeds_and_stages IS 'Id de la tabla que almacena la relacion entre proceso y consumo y mortalidad';
            public       postgres    false    213            )           0    0 5   COLUMN aba_stages_of_breeds_and_stages.id_formulation    COMMENT     �   COMMENT ON COLUMN public.aba_stages_of_breeds_and_stages.id_formulation IS 'Id del alimento balanceado para animales asociado a la fase';
            public       postgres    false    213            *           0    0 +   COLUMN aba_stages_of_breeds_and_stages.name    COMMENT     �   COMMENT ON COLUMN public.aba_stages_of_breeds_and_stages.name IS 'Nombre de la fase asociadas a los animales considerados en la tabla de consumo y mortalidad ';
            public       postgres    false    213            +           0    0 /   COLUMN aba_stages_of_breeds_and_stages.duration    COMMENT     �   COMMENT ON COLUMN public.aba_stages_of_breeds_and_stages.duration IS 'Duracion de la fase asociadas a los animales considerados en la tabla de consumo y mortalidad ';
            public       postgres    false    213            �            1259    139866    aba_time_unit    TABLE     �   CREATE TABLE public.aba_time_unit (
    id integer DEFAULT nextval('public."abaTimeUnit_id_seq"'::regclass) NOT NULL,
    singular_name character varying(100),
    plural_name character varying(100)
);
 !   DROP TABLE public.aba_time_unit;
       public         postgres    false    196    3            ,           0    0    TABLE aba_time_unit    COMMENT     L   COMMENT ON TABLE public.aba_time_unit IS 'Almacena las unidades de tiempo';
            public       postgres    false    214            -           0    0    COLUMN aba_time_unit.id    COMMENT     K   COMMENT ON COLUMN public.aba_time_unit.id IS 'Id de la unidad de tiempo
';
            public       postgres    false    214            .           0    0 "   COLUMN aba_time_unit.singular_name    COMMENT     e   COMMENT ON COLUMN public.aba_time_unit.singular_name IS 'Nombre en singular de la unidad de tiempo';
            public       postgres    false    214            /           0    0     COLUMN aba_time_unit.plural_name    COMMENT     a   COMMENT ON COLUMN public.aba_time_unit.plural_name IS 'Nombre en plural de la unidad de tiempo';
            public       postgres    false    214            �            1259    139870    availability_shed_id_seq    SEQUENCE     �   CREATE SEQUENCE public.availability_shed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.availability_shed_id_seq;
       public       postgres    false    3            �            1259    139872    base_day_id_seq    SEQUENCE     x   CREATE SEQUENCE public.base_day_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.base_day_id_seq;
       public       postgres    false    3            �            1259    139874    breed_id_seq    SEQUENCE     u   CREATE SEQUENCE public.breed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.breed_id_seq;
       public       postgres    false    3            �            1259    139876    broiler_detail_id_seq    SEQUENCE     ~   CREATE SEQUENCE public.broiler_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.broiler_detail_id_seq;
       public       postgres    false    3            �            1259    139878    broiler_id_seq    SEQUENCE     w   CREATE SEQUENCE public.broiler_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.broiler_id_seq;
       public       postgres    false    3            �            1259    139880    broiler_product_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.broiler_product_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.broiler_product_detail_id_seq;
       public       postgres    false    3            �            1259    139882    broiler_product_id_seq    SEQUENCE        CREATE SEQUENCE public.broiler_product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.broiler_product_id_seq;
       public       postgres    false    3            �            1259    139884    broilereviction_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.broilereviction_detail_id_seq
    START WITH 124
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.broilereviction_detail_id_seq;
       public       postgres    false    3            �            1259    139886    broilereviction_id_seq    SEQUENCE     �   CREATE SEQUENCE public.broilereviction_id_seq
    START WITH 70
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.broilereviction_id_seq;
       public       postgres    false    3            �            1259    139888    brooder_id_seq    SEQUENCE     w   CREATE SEQUENCE public.brooder_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.brooder_id_seq;
       public       postgres    false    3            �            1259    139890    brooder_machines_id_seq    SEQUENCE     �   CREATE SEQUENCE public.brooder_machines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.brooder_machines_id_seq;
       public       postgres    false    3            �            1259    139892    calendar_day_id_seq    SEQUENCE     |   CREATE SEQUENCE public.calendar_day_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.calendar_day_id_seq;
       public       postgres    false    3            �            1259    139894    calendar_id_seq    SEQUENCE     x   CREATE SEQUENCE public.calendar_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.calendar_id_seq;
       public       postgres    false    3            �            1259    139896    center_id_seq    SEQUENCE     v   CREATE SEQUENCE public.center_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.center_id_seq;
       public       postgres    false    3            �            1259    139898    egg_planning_id_seq    SEQUENCE     |   CREATE SEQUENCE public.egg_planning_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.egg_planning_id_seq;
       public       postgres    false    3            �            1259    139900    egg_required_id_seq    SEQUENCE     |   CREATE SEQUENCE public.egg_required_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.egg_required_id_seq;
       public       postgres    false    3            �            1259    139902    eggs_storage_id_seq    SEQUENCE     |   CREATE SEQUENCE public.eggs_storage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.eggs_storage_id_seq;
       public       postgres    false    3            �            1259    139904    farm_id_seq    SEQUENCE     t   CREATE SEQUENCE public.farm_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.farm_id_seq;
       public       postgres    false    3            �            1259    139906    farm_type_id_seq    SEQUENCE     y   CREATE SEQUENCE public.farm_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.farm_type_id_seq;
       public       postgres    false    3            �            1259    139908    holiday_id_seq    SEQUENCE     w   CREATE SEQUENCE public.holiday_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.holiday_id_seq;
       public       postgres    false    3            �            1259    139910    housing_way_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.housing_way_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.housing_way_detail_id_seq;
       public       postgres    false    3            �            1259    139912    housing_way_id_seq    SEQUENCE     {   CREATE SEQUENCE public.housing_way_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.housing_way_id_seq;
       public       postgres    false    3            �            1259    139914    incubator_id_seq    SEQUENCE     y   CREATE SEQUENCE public.incubator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.incubator_id_seq;
       public       postgres    false    3            �            1259    139916    incubator_plant_id_seq    SEQUENCE        CREATE SEQUENCE public.incubator_plant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.incubator_plant_id_seq;
       public       postgres    false    3            �            1259    139918    industry_id_seq    SEQUENCE     x   CREATE SEQUENCE public.industry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.industry_id_seq;
       public       postgres    false    3            �            1259    139920    line_id_seq    SEQUENCE     t   CREATE SEQUENCE public.line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.line_id_seq;
       public       postgres    false    3            �            1259    139922    lot_eggs_id_seq    SEQUENCE     x   CREATE SEQUENCE public.lot_eggs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.lot_eggs_id_seq;
       public       postgres    false    3            �            1259    139924    lot_fattening_id_seq    SEQUENCE     }   CREATE SEQUENCE public.lot_fattening_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.lot_fattening_id_seq;
       public       postgres    false    3            �            1259    139926 
   lot_id_seq    SEQUENCE     s   CREATE SEQUENCE public.lot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 !   DROP SEQUENCE public.lot_id_seq;
       public       postgres    false    3            �            1259    139928    lot_liftbreeding_id_seq    SEQUENCE     �   CREATE SEQUENCE public.lot_liftbreeding_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.lot_liftbreeding_id_seq;
       public       postgres    false    3            �            1259    139930    md_optimizer_parameter    TABLE       CREATE TABLE public.md_optimizer_parameter (
    optimizerparameter_id integer NOT NULL,
    breed_id integer NOT NULL,
    max_housing integer NOT NULL,
    min_housing integer NOT NULL,
    difference double precision NOT NULL,
    active boolean NOT NULL
);
 *   DROP TABLE public.md_optimizer_parameter;
       public         postgres    false    3            �            1259    139933 0   md_optimizer_parameter_optimizerparameter_id_seq    SEQUENCE     �   CREATE SEQUENCE public.md_optimizer_parameter_optimizerparameter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 G   DROP SEQUENCE public.md_optimizer_parameter_optimizerparameter_id_seq;
       public       postgres    false    245    3            0           0    0 0   md_optimizer_parameter_optimizerparameter_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.md_optimizer_parameter_optimizerparameter_id_seq OWNED BY public.md_optimizer_parameter.optimizerparameter_id;
            public       postgres    false    246            �            1259    139935    mdadjustment    TABLE     �   CREATE TABLE public.mdadjustment (
    adjustment_id integer NOT NULL,
    type character varying NOT NULL,
    prefix character varying,
    description character varying NOT NULL
);
     DROP TABLE public.mdadjustment;
       public         postgres    false    3            �            1259    139941    mdadjustment_adjustment_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mdadjustment_adjustment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public.mdadjustment_adjustment_id_seq;
       public       postgres    false    247    3            1           0    0    mdadjustment_adjustment_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public.mdadjustment_adjustment_id_seq OWNED BY public.mdadjustment.adjustment_id;
            public       postgres    false    248            �            1259    139943     mdapplication_application_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mdapplication_application_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 999999999999999
    CACHE 1;
 7   DROP SEQUENCE public.mdapplication_application_id_seq;
       public       postgres    false    3            �            1259    139945    mdapplication    TABLE     �   CREATE TABLE public.mdapplication (
    application_id integer DEFAULT nextval('public.mdapplication_application_id_seq'::regclass) NOT NULL,
    application_name character varying(30) NOT NULL,
    type character varying(20)
);
 !   DROP TABLE public.mdapplication;
       public         postgres    false    249    3            2           0    0    TABLE mdapplication    COMMENT     X   COMMENT ON TABLE public.mdapplication IS 'Almacena la informacion de las aplicaciones';
            public       postgres    false    250            3           0    0 #   COLUMN mdapplication.application_id    COMMENT     P   COMMENT ON COLUMN public.mdapplication.application_id IS 'Id de la aplicació';
            public       postgres    false    250            4           0    0 %   COLUMN mdapplication.application_name    COMMENT     W   COMMENT ON COLUMN public.mdapplication.application_name IS 'Nombre de la aplicación';
            public       postgres    false    250            5           0    0    COLUMN mdapplication.type    COMMENT     W   COMMENT ON COLUMN public.mdapplication.type IS 'A qué tipo pertenece la aplicación';
            public       postgres    false    250            �            1259    139949    mdapplication_rol_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mdapplication_rol_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999999
    CACHE 1;
 /   DROP SEQUENCE public.mdapplication_rol_id_seq;
       public       postgres    false    3            �            1259    139951    mdapplication_rol    TABLE     �   CREATE TABLE public.mdapplication_rol (
    id integer DEFAULT nextval('public.mdapplication_rol_id_seq'::regclass) NOT NULL,
    application_id integer NOT NULL,
    rol_id integer NOT NULL
);
 %   DROP TABLE public.mdapplication_rol;
       public         postgres    false    251    3            6           0    0    TABLE mdapplication_rol    COMMENT     _   COMMENT ON TABLE public.mdapplication_rol IS 'Contiene los id de aplicación y los id de rol';
            public       postgres    false    252            7           0    0    COLUMN mdapplication_rol.id    COMMENT     \   COMMENT ON COLUMN public.mdapplication_rol.id IS 'Id la combinacion de aplicación y rol ';
            public       postgres    false    252            8           0    0 '   COLUMN mdapplication_rol.application_id    COMMENT     `   COMMENT ON COLUMN public.mdapplication_rol.application_id IS 'Identificador de la aplicación';
            public       postgres    false    252            9           0    0    COLUMN mdapplication_rol.rol_id    COMMENT     N   COMMENT ON COLUMN public.mdapplication_rol.rol_id IS 'Identificador del rol';
            public       postgres    false    252            �            1259    139955    mdbreed    TABLE     �   CREATE TABLE public.mdbreed (
    breed_id integer DEFAULT nextval('public.breed_id_seq'::regclass) NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(45) NOT NULL
);
    DROP TABLE public.mdbreed;
       public         postgres    false    217    3            :           0    0    TABLE mdbreed    COMMENT     U   COMMENT ON TABLE public.mdbreed IS 'Tabla donde se almacenan las razas de las aves';
            public       postgres    false    253            ;           0    0    COLUMN mdbreed.breed_id    COMMENT     >   COMMENT ON COLUMN public.mdbreed.breed_id IS 'Id de la raza';
            public       postgres    false    253            <           0    0    COLUMN mdbreed.code    COMMENT     >   COMMENT ON COLUMN public.mdbreed.code IS 'Codigo de la raza';
            public       postgres    false    253            =           0    0    COLUMN mdbreed.name    COMMENT     >   COMMENT ON COLUMN public.mdbreed.name IS 'Nombre de la Raza';
            public       postgres    false    253            �            1259    139959    mdbroiler_product    TABLE     �  CREATE TABLE public.mdbroiler_product (
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
       public         postgres    false    221    3            >           0    0    TABLE mdbroiler_product    COMMENT     w   COMMENT ON TABLE public.mdbroiler_product IS 'Almacena los productos de salida de la etapa de engorda hacia desalojo';
            public       postgres    false    254            ?           0    0 +   COLUMN mdbroiler_product.broiler_product_id    COMMENT     ^   COMMENT ON COLUMN public.mdbroiler_product.broiler_product_id IS 'Id de producto de engorde';
            public       postgres    false    254            @           0    0    COLUMN mdbroiler_product.name    COMMENT     T   COMMENT ON COLUMN public.mdbroiler_product.name IS 'Nombre de producto de engorde';
            public       postgres    false    254            A           0    0 &   COLUMN mdbroiler_product.days_eviction    COMMENT     y   COMMENT ON COLUMN public.mdbroiler_product.days_eviction IS 'Días necesarios para el desalojo del producto de engorde';
            public       postgres    false    254            B           0    0    COLUMN mdbroiler_product.weight    COMMENT     b   COMMENT ON COLUMN public.mdbroiler_product.weight IS 'Peso estimado del producto para su salida';
            public       postgres    false    254            �            1259    139963    mdequivalenceproduct    TABLE     �   CREATE TABLE public.mdequivalenceproduct (
    equivalenceproduct_id integer NOT NULL,
    product_code character varying(20),
    equivalence_code character varying(20),
    breed_id integer NOT NULL
);
 (   DROP TABLE public.mdequivalenceproduct;
       public         postgres    false    3                        1259    139966 .   mdequivalenceproduct_equivalenceproduct_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mdequivalenceproduct_equivalenceproduct_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 E   DROP SEQUENCE public.mdequivalenceproduct_equivalenceproduct_id_seq;
       public       postgres    false    3    255            C           0    0 .   mdequivalenceproduct_equivalenceproduct_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.mdequivalenceproduct_equivalenceproduct_id_seq OWNED BY public.mdequivalenceproduct.equivalenceproduct_id;
            public       postgres    false    256                       1259    139968 
   mdfarmtype    TABLE     �   CREATE TABLE public.mdfarmtype (
    farm_type_id integer DEFAULT nextval('public.farm_type_id_seq'::regclass) NOT NULL,
    name character varying(45) NOT NULL
);
    DROP TABLE public.mdfarmtype;
       public         postgres    false    233    3            D           0    0    TABLE mdfarmtype    COMMENT     D   COMMENT ON TABLE public.mdfarmtype IS 'Define los tipos de granja';
            public       postgres    false    257            E           0    0    COLUMN mdfarmtype.farm_type_id    COMMENT     L   COMMENT ON COLUMN public.mdfarmtype.farm_type_id IS 'Id de tipo de granja';
            public       postgres    false    257            F           0    0    COLUMN mdfarmtype.name    COMMENT     O   COMMENT ON COLUMN public.mdfarmtype.name IS 'Nombre de la etapa de la granja';
            public       postgres    false    257                       1259    139972    measure_id_seq    SEQUENCE     w   CREATE SEQUENCE public.measure_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.measure_id_seq;
       public       postgres    false    3                       1259    139974 	   mdmeasure    TABLE     -  CREATE TABLE public.mdmeasure (
    measure_id integer DEFAULT nextval('public.measure_id_seq'::regclass) NOT NULL,
    name character varying(10) NOT NULL,
    abbreviation character varying(5) NOT NULL,
    originvalue double precision NOT NULL,
    valuekg double precision,
    is_unit boolean
);
    DROP TABLE public.mdmeasure;
       public         postgres    false    258    3            G           0    0    TABLE mdmeasure    COMMENT     _   COMMENT ON TABLE public.mdmeasure IS 'Almacena las medidas a utilizar en las planificaciones';
            public       postgres    false    259            H           0    0    COLUMN mdmeasure.measure_id    COMMENT     D   COMMENT ON COLUMN public.mdmeasure.measure_id IS 'Id de la medida';
            public       postgres    false    259            I           0    0    COLUMN mdmeasure.name    COMMENT     B   COMMENT ON COLUMN public.mdmeasure.name IS 'Nombre de la medida';
            public       postgres    false    259            J           0    0    COLUMN mdmeasure.abbreviation    COMMENT     O   COMMENT ON COLUMN public.mdmeasure.abbreviation IS 'Abreviatura de la medida';
            public       postgres    false    259            K           0    0    COLUMN mdmeasure.originvalue    COMMENT     Q   COMMENT ON COLUMN public.mdmeasure.originvalue IS 'Valor original de la medida';
            public       postgres    false    259            L           0    0    COLUMN mdmeasure.valuekg    COMMENT     R   COMMENT ON COLUMN public.mdmeasure.valuekg IS 'Valor en Kilogramos de la medida';
            public       postgres    false    259                       1259    139978    parameter_id_seq    SEQUENCE     y   CREATE SEQUENCE public.parameter_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.parameter_id_seq;
       public       postgres    false    3                       1259    139980    mdparameter    TABLE     9  CREATE TABLE public.mdparameter (
    parameter_id integer DEFAULT nextval('public.parameter_id_seq'::regclass) NOT NULL,
    description character varying(250) NOT NULL,
    type character varying(10),
    measure_id integer NOT NULL,
    process_id integer NOT NULL,
    name character varying(250) NOT NULL
);
    DROP TABLE public.mdparameter;
       public         postgres    false    260    3            M           0    0    TABLE mdparameter    COMMENT     �   COMMENT ON TABLE public.mdparameter IS 'Almacena la definición de los parámetros a utilizar en la planificación regresiva junto a sus respectivas características';
            public       postgres    false    261            N           0    0    COLUMN mdparameter.parameter_id    COMMENT     N   COMMENT ON COLUMN public.mdparameter.parameter_id IS 'Id de los parámetros';
            public       postgres    false    261            O           0    0    COLUMN mdparameter.description    COMMENT     W   COMMENT ON COLUMN public.mdparameter.description IS 'Descripción de los parámetros';
            public       postgres    false    261            P           0    0    COLUMN mdparameter.type    COMMENT     D   COMMENT ON COLUMN public.mdparameter.type IS 'Tipo de parámetros';
            public       postgres    false    261            Q           0    0    COLUMN mdparameter.measure_id    COMMENT     F   COMMENT ON COLUMN public.mdparameter.measure_id IS 'Id de la medida';
            public       postgres    false    261            R           0    0    COLUMN mdparameter.process_id    COMMENT     E   COMMENT ON COLUMN public.mdparameter.process_id IS 'Id del proceso';
            public       postgres    false    261            S           0    0    COLUMN mdparameter.name    COMMENT     F   COMMENT ON COLUMN public.mdparameter.name IS 'Nombre del parámetro';
            public       postgres    false    261                       1259    139987    process_id_seq    SEQUENCE     w   CREATE SEQUENCE public.process_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.process_id_seq;
       public       postgres    false    3                       1259    139989 	   mdprocess    TABLE     =  CREATE TABLE public.mdprocess (
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
       public         postgres    false    262    3            T           0    0    TABLE mdprocess    COMMENT     �   COMMENT ON TABLE public.mdprocess IS 'Almacena los procesos definidos para la planificación progresiva junto a sus respectivas características';
            public       postgres    false    263            U           0    0    COLUMN mdprocess.process_id    COMMENT     G   COMMENT ON COLUMN public.mdprocess.process_id IS 'Id de los procesos';
            public       postgres    false    263            V           0    0    COLUMN mdprocess.process_order    COMMENT     M   COMMENT ON COLUMN public.mdprocess.process_order IS 'Orden de los procesos';
            public       postgres    false    263            W           0    0    COLUMN mdprocess.product_id    COMMENT     D   COMMENT ON COLUMN public.mdprocess.product_id IS 'Id del producto';
            public       postgres    false    263            X           0    0    COLUMN mdprocess.stage_id    COMMENT     >   COMMENT ON COLUMN public.mdprocess.stage_id IS 'Id de etapa';
            public       postgres    false    263            Y           0    0 $   COLUMN mdprocess.historical_decrease    COMMENT     Y   COMMENT ON COLUMN public.mdprocess.historical_decrease IS 'Merma historica del proceso';
            public       postgres    false    263            Z           0    0 %   COLUMN mdprocess.theoretical_decrease    COMMENT     Y   COMMENT ON COLUMN public.mdprocess.theoretical_decrease IS 'Merma teórica del proceso';
            public       postgres    false    263            [           0    0 "   COLUMN mdprocess.historical_weight    COMMENT     V   COMMENT ON COLUMN public.mdprocess.historical_weight IS 'Peso historico del proceso';
            public       postgres    false    263            \           0    0 #   COLUMN mdprocess.theoretical_weight    COMMENT     V   COMMENT ON COLUMN public.mdprocess.theoretical_weight IS 'Peso teórico del proceso';
            public       postgres    false    263            ]           0    0 $   COLUMN mdprocess.historical_duration    COMMENT     ^   COMMENT ON COLUMN public.mdprocess.historical_duration IS 'Duración histórica del proceso';
            public       postgres    false    263            ^           0    0 %   COLUMN mdprocess.theoretical_duration    COMMENT     ]   COMMENT ON COLUMN public.mdprocess.theoretical_duration IS 'Duración teórica del proceso';
            public       postgres    false    263            _           0    0    COLUMN mdprocess.visible    COMMENT     I   COMMENT ON COLUMN public.mdprocess.visible IS 'Visibilidad del proceso';
            public       postgres    false    263            `           0    0    COLUMN mdprocess.name    COMMENT     A   COMMENT ON COLUMN public.mdprocess.name IS 'Nombre del proceso';
            public       postgres    false    263            a           0    0    COLUMN mdprocess.predecessor_id    COMMENT     J   COMMENT ON COLUMN public.mdprocess.predecessor_id IS 'Id del predecesor';
            public       postgres    false    263            b           0    0    COLUMN mdprocess.capacity    COMMENT     X   COMMENT ON COLUMN public.mdprocess.capacity IS 'Capacidad semanal asociada al proceso';
            public       postgres    false    263            c           0    0    COLUMN mdprocess.breed_id    COMMENT     @   COMMENT ON COLUMN public.mdprocess.breed_id IS 'Id de la raza';
            public       postgres    false    263            d           0    0    COLUMN mdprocess.gender    COMMENT     N   COMMENT ON COLUMN public.mdprocess.gender IS 'Genero del producto de salida';
            public       postgres    false    263            e           0    0    COLUMN mdprocess.fattening_goal    COMMENT     H   COMMENT ON COLUMN public.mdprocess.fattening_goal IS 'Meta de engorde';
            public       postgres    false    263            f           0    0    COLUMN mdprocess.type_posture    COMMENT     s   COMMENT ON COLUMN public.mdprocess.type_posture IS 'Define el tipo de postura de acuerdo a la edad de la gallina';
            public       postgres    false    263            g           0    0 "   COLUMN mdprocess.biological_active    COMMENT     h   COMMENT ON COLUMN public.mdprocess.biological_active IS 'Define si el proceso es un activo biológico';
            public       postgres    false    263                       1259    139993    product_id_seq    SEQUENCE     w   CREATE SEQUENCE public.product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.product_id_seq;
       public       postgres    false    3            	           1259    139995 	   mdproduct    TABLE       CREATE TABLE public.mdproduct (
    product_id integer DEFAULT nextval('public.product_id_seq'::regclass) NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(45) NOT NULL,
    breed_id integer NOT NULL,
    stage_id integer NOT NULL
);
    DROP TABLE public.mdproduct;
       public         postgres    false    264    3            h           0    0    TABLE mdproduct    COMMENT     Z   COMMENT ON TABLE public.mdproduct IS 'Almacena los productos utilizados en los procesos';
            public       postgres    false    265            i           0    0    COLUMN mdproduct.product_id    COMMENT     D   COMMENT ON COLUMN public.mdproduct.product_id IS 'Id del producto';
            public       postgres    false    265            j           0    0    COLUMN mdproduct.code    COMMENT     B   COMMENT ON COLUMN public.mdproduct.code IS 'Codigo del producto';
            public       postgres    false    265            k           0    0    COLUMN mdproduct.name    COMMENT     B   COMMENT ON COLUMN public.mdproduct.name IS 'Nombre del producto';
            public       postgres    false    265            
           1259    139999    mdrol_rol_id_seq    SEQUENCE        CREATE SEQUENCE public.mdrol_rol_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 10000000
    CACHE 1;
 '   DROP SEQUENCE public.mdrol_rol_id_seq;
       public       postgres    false    3                       1259    140001    mdrol    TABLE     �   CREATE TABLE public.mdrol (
    rol_id integer DEFAULT nextval('public.mdrol_rol_id_seq'::regclass) NOT NULL,
    rol_name character varying(80) NOT NULL,
    admin_user_creator integer NOT NULL,
    creation_date timestamp with time zone NOT NULL
);
    DROP TABLE public.mdrol;
       public         postgres    false    266    3            l           0    0    TABLE mdrol    COMMENT     O   COMMENT ON TABLE public.mdrol IS 'Almacena los datos de los diferentes roles';
            public       postgres    false    267            m           0    0    COLUMN mdrol.rol_id    COMMENT     7   COMMENT ON COLUMN public.mdrol.rol_id IS 'Id del rol';
            public       postgres    false    267            n           0    0    COLUMN mdrol.rol_name    COMMENT     =   COMMENT ON COLUMN public.mdrol.rol_name IS 'Nombre del rol';
            public       postgres    false    267            o           0    0    COLUMN mdrol.admin_user_creator    COMMENT     [   COMMENT ON COLUMN public.mdrol.admin_user_creator IS 'Especifica que usuario creo el rol';
            public       postgres    false    267            p           0    0    COLUMN mdrol.creation_date    COMMENT     N   COMMENT ON COLUMN public.mdrol.creation_date IS 'Fecha de creación del rol';
            public       postgres    false    267                       1259    140005    scenario_id_seq    SEQUENCE     x   CREATE SEQUENCE public.scenario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.scenario_id_seq;
       public       postgres    false    3                       1259    140007 
   mdscenario    TABLE     ]  CREATE TABLE public.mdscenario (
    scenario_id integer DEFAULT nextval('public.scenario_id_seq'::regclass) NOT NULL,
    description character varying(250) NOT NULL,
    date_start timestamp with time zone NOT NULL,
    date_end timestamp with time zone NOT NULL,
    name character varying(250) NOT NULL,
    status integer DEFAULT 0 NOT NULL
);
    DROP TABLE public.mdscenario;
       public         postgres    false    268    3            q           0    0    TABLE mdscenario    COMMENT     [   COMMENT ON TABLE public.mdscenario IS 'Almacena información de los distintos escenarios';
            public       postgres    false    269            r           0    0    COLUMN mdscenario.scenario_id    COMMENT     G   COMMENT ON COLUMN public.mdscenario.scenario_id IS 'Id del escenario';
            public       postgres    false    269            s           0    0    COLUMN mdscenario.description    COMMENT     P   COMMENT ON COLUMN public.mdscenario.description IS 'Descripcion del escenario';
            public       postgres    false    269            t           0    0    COLUMN mdscenario.date_start    COMMENT     S   COMMENT ON COLUMN public.mdscenario.date_start IS 'Fecha de inicio del escenario';
            public       postgres    false    269            u           0    0    COLUMN mdscenario.date_end    COMMENT     N   COMMENT ON COLUMN public.mdscenario.date_end IS 'Fecha de fin del escenario';
            public       postgres    false    269            v           0    0    COLUMN mdscenario.name    COMMENT     D   COMMENT ON COLUMN public.mdscenario.name IS 'Nombre del escenario';
            public       postgres    false    269            w           0    0    COLUMN mdscenario.status    COMMENT     F   COMMENT ON COLUMN public.mdscenario.status IS 'Estado del escenario';
            public       postgres    false    269                       1259    140015    status_shed_id_seq    SEQUENCE     {   CREATE SEQUENCE public.status_shed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.status_shed_id_seq;
       public       postgres    false    3                       1259    140017    mdshedstatus    TABLE     �   CREATE TABLE public.mdshedstatus (
    shed_status_id integer DEFAULT nextval('public.status_shed_id_seq'::regclass) NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(250) NOT NULL
);
     DROP TABLE public.mdshedstatus;
       public         postgres    false    270    3            x           0    0    TABLE mdshedstatus    COMMENT     b   COMMENT ON TABLE public.mdshedstatus IS 'Almaceno los estatus de disponibilidad de los galpones';
            public       postgres    false    271            y           0    0 "   COLUMN mdshedstatus.shed_status_id    COMMENT     T   COMMENT ON COLUMN public.mdshedstatus.shed_status_id IS 'Id del estado del galpon';
            public       postgres    false    271            z           0    0    COLUMN mdshedstatus.name    COMMENT     a   COMMENT ON COLUMN public.mdshedstatus.name IS 'Nombre del estado en que se encuentra el galpon';
            public       postgres    false    271            {           0    0    COLUMN mdshedstatus.description    COMMENT     [   COMMENT ON COLUMN public.mdshedstatus.description IS 'Descripcion del estado del galpon
';
            public       postgres    false    271                       1259    140021    stage_id_seq    SEQUENCE     u   CREATE SEQUENCE public.stage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.stage_id_seq;
       public       postgres    false    3                       1259    140023    mdstage    TABLE     �   CREATE TABLE public.mdstage (
    stage_id integer DEFAULT nextval('public.stage_id_seq'::regclass) NOT NULL,
    order_ integer NOT NULL,
    name character varying(250) NOT NULL
);
    DROP TABLE public.mdstage;
       public         postgres    false    272    3            |           0    0    TABLE mdstage    COMMENT     d   COMMENT ON TABLE public.mdstage IS 'Almacena las etapas a utilizar en el proceso de planificacion';
            public       postgres    false    273            }           0    0    COLUMN mdstage.stage_id    COMMENT     ?   COMMENT ON COLUMN public.mdstage.stage_id IS 'Id de la etapa';
            public       postgres    false    273            ~           0    0    COLUMN mdstage.order_    COMMENT     U   COMMENT ON COLUMN public.mdstage.order_ IS 'Orden en el que se muestras las etapas';
            public       postgres    false    273                       0    0    COLUMN mdstage.name    COMMENT     ?   COMMENT ON COLUMN public.mdstage.name IS 'Nombre de la etapa';
            public       postgres    false    273                       1259    140027    mduser_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.mduser_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 9999999999
    CACHE 1;
 )   DROP SEQUENCE public.mduser_user_id_seq;
       public       postgres    false    3                       1259    140029    mduser    TABLE     �  CREATE TABLE public.mduser (
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
       public         postgres    false    274    3                       1259    140036    osadjustmentscontrol    TABLE     �   CREATE TABLE public.osadjustmentscontrol (
    adjustmentscontrol_id integer NOT NULL,
    username character varying NOT NULL,
    adjustment_date date NOT NULL,
    os_type character varying NOT NULL,
    os_id integer NOT NULL
);
 (   DROP TABLE public.osadjustmentscontrol;
       public         postgres    false    3                       1259    140042 .   osadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE     �   CREATE SEQUENCE public.osadjustmentscontrol_adjustmentscontrol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 E   DROP SEQUENCE public.osadjustmentscontrol_adjustmentscontrol_id_seq;
       public       postgres    false    276    3            �           0    0 .   osadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.osadjustmentscontrol_adjustmentscontrol_id_seq OWNED BY public.osadjustmentscontrol.adjustmentscontrol_id;
            public       postgres    false    277                       1259    140044    oscenter    TABLE     5  CREATE TABLE public.oscenter (
    center_id integer DEFAULT nextval('public.center_id_seq'::regclass) NOT NULL,
    partnership_id integer NOT NULL,
    farm_id integer NOT NULL,
    name character varying(45) NOT NULL,
    code character varying(20) NOT NULL,
    "order" integer,
    os_disable boolean
);
    DROP TABLE public.oscenter;
       public         postgres    false    228    3            �           0    0    TABLE oscenter    COMMENT     S   COMMENT ON TABLE public.oscenter IS 'Almacena los datos referentes a los nucleos';
            public       postgres    false    278            �           0    0    COLUMN oscenter.center_id    COMMENT     @   COMMENT ON COLUMN public.oscenter.center_id IS 'Id del nucleo';
            public       postgres    false    278            �           0    0    COLUMN oscenter.partnership_id    COMMENT     H   COMMENT ON COLUMN public.oscenter.partnership_id IS 'Id de la empresa';
            public       postgres    false    278            �           0    0    COLUMN oscenter.farm_id    COMMENT     @   COMMENT ON COLUMN public.oscenter.farm_id IS 'Id de la granja';
            public       postgres    false    278            �           0    0    COLUMN oscenter.name    COMMENT     @   COMMENT ON COLUMN public.oscenter.name IS 'Nombre del nucleo
';
            public       postgres    false    278            �           0    0    COLUMN oscenter.code    COMMENT     ?   COMMENT ON COLUMN public.oscenter.code IS 'Codigo del nucleo';
            public       postgres    false    278                       1259    140048    osfarm    TABLE     3  CREATE TABLE public.osfarm (
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
            public       postgres    false    279            �           0    0    COLUMN osfarm.farm_id    COMMENT     >   COMMENT ON COLUMN public.osfarm.farm_id IS 'Id de la granja';
            public       postgres    false    279            �           0    0    COLUMN osfarm.partnership_id    COMMENT     F   COMMENT ON COLUMN public.osfarm.partnership_id IS 'Id de la empresa';
            public       postgres    false    279            �           0    0    COLUMN osfarm.code    COMMENT     ?   COMMENT ON COLUMN public.osfarm.code IS 'Codigo de la granja';
            public       postgres    false    279            �           0    0    COLUMN osfarm.name    COMMENT     ?   COMMENT ON COLUMN public.osfarm.name IS 'Nombre de la granja';
            public       postgres    false    279            �           0    0    COLUMN osfarm.farm_type_id    COMMENT     I   COMMENT ON COLUMN public.osfarm.farm_type_id IS 'Id del tipo de granja';
            public       postgres    false    279                       1259    140052    osincubator    TABLE       CREATE TABLE public.osincubator (
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
            public       postgres    false    280            �           0    0    COLUMN osincubator.incubator_id    COMMENT     L   COMMENT ON COLUMN public.osincubator.incubator_id IS 'Id de la incubadora';
            public       postgres    false    280            �           0    0 %   COLUMN osincubator.incubator_plant_id    COMMENT     Y   COMMENT ON COLUMN public.osincubator.incubator_plant_id IS 'Id de la planta incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.name    COMMENT     H   COMMENT ON COLUMN public.osincubator.name IS 'Nombre de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.code    COMMENT     H   COMMENT ON COLUMN public.osincubator.code IS 'Codigo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.description    COMMENT     T   COMMENT ON COLUMN public.osincubator.description IS 'Descripcion de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.capacity    COMMENT     O   COMMENT ON COLUMN public.osincubator.capacity IS 'Capacidad de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.sunday    COMMENT     ]   COMMENT ON COLUMN public.osincubator.sunday IS 'Marca los dias de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.monday    COMMENT     ^   COMMENT ON COLUMN public.osincubator.monday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.tuesday    COMMENT     _   COMMENT ON COLUMN public.osincubator.tuesday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.wednesday    COMMENT     a   COMMENT ON COLUMN public.osincubator.wednesday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.thursday    COMMENT     `   COMMENT ON COLUMN public.osincubator.thursday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.friday    COMMENT     ^   COMMENT ON COLUMN public.osincubator.friday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280            �           0    0    COLUMN osincubator.saturday    COMMENT     `   COMMENT ON COLUMN public.osincubator.saturday IS 'Marca los días de trabajo de la incubadora';
            public       postgres    false    280                       1259    140056    osincubatorplant    TABLE     �  CREATE TABLE public.osincubatorplant (
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
            public       postgres    false    281            �           0    0 *   COLUMN osincubatorplant.incubator_plant_id    COMMENT     ^   COMMENT ON COLUMN public.osincubatorplant.incubator_plant_id IS 'Id de la planta incubadora';
            public       postgres    false    281            �           0    0    COLUMN osincubatorplant.name    COMMENT     T   COMMENT ON COLUMN public.osincubatorplant.name IS 'Nombre de la planta incubadora';
            public       postgres    false    281            �           0    0    COLUMN osincubatorplant.code    COMMENT     T   COMMENT ON COLUMN public.osincubatorplant.code IS 'Codigo de la planta incubadora';
            public       postgres    false    281            �           0    0 #   COLUMN osincubatorplant.description    COMMENT     a   COMMENT ON COLUMN public.osincubatorplant.description IS 'Descripción de la planta incubadora';
            public       postgres    false    281            �           0    0 &   COLUMN osincubatorplant.partnership_id    COMMENT     P   COMMENT ON COLUMN public.osincubatorplant.partnership_id IS 'Id de la empresa';
            public       postgres    false    281            �           0    0 #   COLUMN osincubatorplant.max_storage    COMMENT     ]   COMMENT ON COLUMN public.osincubatorplant.max_storage IS 'Numero máximo de almacenamiento';
            public       postgres    false    281            �           0    0 #   COLUMN osincubatorplant.min_storage    COMMENT     \   COMMENT ON COLUMN public.osincubatorplant.min_storage IS 'Numero minimo de almacenamiento';
            public       postgres    false    281                       1259    140060    partnership_id_seq    SEQUENCE     {   CREATE SEQUENCE public.partnership_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.partnership_id_seq;
       public       postgres    false    3                       1259    140062    ospartnership    TABLE     J  CREATE TABLE public.ospartnership (
    partnership_id integer DEFAULT nextval('public.partnership_id_seq'::regclass) NOT NULL,
    name character varying(45) NOT NULL,
    address character varying(250) NOT NULL,
    description character varying(250) NOT NULL,
    code character varying(20) NOT NULL,
    os_disable boolean
);
 !   DROP TABLE public.ospartnership;
       public         postgres    false    282    3            �           0    0    TABLE ospartnership    COMMENT     j   COMMENT ON TABLE public.ospartnership IS 'Almacena la información referente a las empresas registradas';
            public       postgres    false    283            �           0    0 #   COLUMN ospartnership.partnership_id    COMMENT     M   COMMENT ON COLUMN public.ospartnership.partnership_id IS 'Id de la empresa';
            public       postgres    false    283            �           0    0    COLUMN ospartnership.name    COMMENT     G   COMMENT ON COLUMN public.ospartnership.name IS 'Nombre de la empresa';
            public       postgres    false    283            �           0    0    COLUMN ospartnership.address    COMMENT     M   COMMENT ON COLUMN public.ospartnership.address IS 'Direccion de la empresa';
            public       postgres    false    283            �           0    0     COLUMN ospartnership.description    COMMENT     T   COMMENT ON COLUMN public.ospartnership.description IS 'Descripción de la empresa';
            public       postgres    false    283            �           0    0    COLUMN ospartnership.code    COMMENT     G   COMMENT ON COLUMN public.ospartnership.code IS 'Codigo de la empresa';
            public       postgres    false    283                       1259    140069    shed_id_seq    SEQUENCE     t   CREATE SEQUENCE public.shed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.shed_id_seq;
       public       postgres    false    3                       1259    140071    osshed    TABLE     n  CREATE TABLE public.osshed (
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
    capacity_theoretical integer DEFAULT 0,
    avaliable_date date,
    _order integer,
    breed_id integer,
    os_disable boolean,
    rehousing boolean NOT NULL
);
    DROP TABLE public.osshed;
       public         postgres    false    284    3            �           0    0    TABLE osshed    COMMENT     d   COMMENT ON TABLE public.osshed IS 'Almacena la informacion de los galpones asociados a la empresa';
            public       postgres    false    285            �           0    0    COLUMN osshed.shed_id    COMMENT     <   COMMENT ON COLUMN public.osshed.shed_id IS 'Id del galpon';
            public       postgres    false    285            �           0    0    COLUMN osshed.partnership_id    COMMENT     F   COMMENT ON COLUMN public.osshed.partnership_id IS 'Id de la empresa';
            public       postgres    false    285            �           0    0    COLUMN osshed.farm_id    COMMENT     >   COMMENT ON COLUMN public.osshed.farm_id IS 'Id de la granja';
            public       postgres    false    285            �           0    0    COLUMN osshed.center_id    COMMENT     >   COMMENT ON COLUMN public.osshed.center_id IS 'Id del nucleo';
            public       postgres    false    285            �           0    0    COLUMN osshed.code    COMMENT     =   COMMENT ON COLUMN public.osshed.code IS 'Codigo del galpon';
            public       postgres    false    285            �           0    0    COLUMN osshed.statusshed_id    COMMENT     _   COMMENT ON COLUMN public.osshed.statusshed_id IS 'Identificador del estado actual del galpon';
            public       postgres    false    285            �           0    0    COLUMN osshed.type_id    COMMENT     D   COMMENT ON COLUMN public.osshed.type_id IS 'Id del tipo de galpon';
            public       postgres    false    285            �           0    0    COLUMN osshed.building_date    COMMENT     c   COMMENT ON COLUMN public.osshed.building_date IS 'Almacena la fecha de construccion del edificio';
            public       postgres    false    285            �           0    0    COLUMN osshed.stall_width    COMMENT     M   COMMENT ON COLUMN public.osshed.stall_width IS 'Indica el ancho del galpon';
            public       postgres    false    285            �           0    0    COLUMN osshed.stall_height    COMMENT     M   COMMENT ON COLUMN public.osshed.stall_height IS 'Indica el alto del galpon';
            public       postgres    false    285            �           0    0    COLUMN osshed.capacity_min    COMMENT     D   COMMENT ON COLUMN public.osshed.capacity_min IS 'Capacidad minima';
            public       postgres    false    285            �           0    0    COLUMN osshed.capacity_max    COMMENT     F   COMMENT ON COLUMN public.osshed.capacity_max IS 'Capacidad máxima ';
            public       postgres    false    285            �           0    0    COLUMN osshed.environment_id    COMMENT     E   COMMENT ON COLUMN public.osshed.environment_id IS 'Id del ambiente';
            public       postgres    false    285            �           0    0    COLUMN osshed.rotation_days    COMMENT     H   COMMENT ON COLUMN public.osshed.rotation_days IS 'Días de rotación
';
            public       postgres    false    285            �           0    0    COLUMN osshed.nests_quantity    COMMENT     I   COMMENT ON COLUMN public.osshed.nests_quantity IS 'Cantidad de nidales';
            public       postgres    false    285            �           0    0    COLUMN osshed.cages_quantity    COMMENT     H   COMMENT ON COLUMN public.osshed.cages_quantity IS 'Cantidad de jaulas';
            public       postgres    false    285            �           0    0    COLUMN osshed.birds_quantity    COMMENT     F   COMMENT ON COLUMN public.osshed.birds_quantity IS 'Cantidad de aves';
            public       postgres    false    285            �           0    0 "   COLUMN osshed.capacity_theoretical    COMMENT     O   COMMENT ON COLUMN public.osshed.capacity_theoretical IS '	Capacidad teórica';
            public       postgres    false    285                       1259    140080    slaughterhouse_id_seq    SEQUENCE        CREATE SEQUENCE public.slaughterhouse_id_seq
    START WITH 33
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.slaughterhouse_id_seq;
       public       postgres    false    3                       1259    140082    osslaughterhouse    TABLE     r  CREATE TABLE public.osslaughterhouse (
    slaughterhouse_id integer DEFAULT nextval('public.slaughterhouse_id_seq'::regclass) NOT NULL,
    name character varying(45) NOT NULL,
    address character varying(250) NOT NULL,
    description character varying(250) NOT NULL,
    code character varying(20) NOT NULL,
    capacity double precision,
    os_disable boolean
);
 $   DROP TABLE public.osslaughterhouse;
       public         postgres    false    286    3                        1259    140089    posture_curve_id_seq    SEQUENCE     }   CREATE SEQUENCE public.posture_curve_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.posture_curve_id_seq;
       public       postgres    false    3            !           1259    140091    predecessor_id_seq    SEQUENCE     {   CREATE SEQUENCE public.predecessor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.predecessor_id_seq;
       public       postgres    false    3            "           1259    140093    process_class_id_seq    SEQUENCE     }   CREATE SEQUENCE public.process_class_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.process_class_id_seq;
       public       postgres    false    3            #           1259    140095    programmed_eggs_id_seq    SEQUENCE        CREATE SEQUENCE public.programmed_eggs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.programmed_eggs_id_seq;
       public       postgres    false    3            $           1259    140097    raspberry_id_seq    SEQUENCE     y   CREATE SEQUENCE public.raspberry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.raspberry_id_seq;
       public       postgres    false    3            %           1259    140099    scenario_formula_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scenario_formula_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.scenario_formula_id_seq;
       public       postgres    false    3            &           1259    140101    scenario_parameter_day_seq    SEQUENCE     �   CREATE SEQUENCE public.scenario_parameter_day_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.scenario_parameter_day_seq;
       public       postgres    false    3            '           1259    140103    scenario_parameter_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scenario_parameter_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.scenario_parameter_id_seq;
       public       postgres    false    3            (           1259    140105    scenario_posture_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scenario_posture_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.scenario_posture_id_seq;
       public       postgres    false    3            )           1259    140107    scenario_process_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scenario_process_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.scenario_process_id_seq;
       public       postgres    false    3            *           1259    140109    silo_id_seq    SEQUENCE     t   CREATE SEQUENCE public.silo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.silo_id_seq;
       public       postgres    false    3            +           1259    140111    slevictionpartition_id_seq    SEQUENCE     �   CREATE SEQUENCE public.slevictionpartition_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 1   DROP SEQUENCE public.slevictionpartition_id_seq;
       public       postgres    false    3            ,           1259    140113    slgenderclassification_id_seq    SEQUENCE     �   CREATE SEQUENCE public.slgenderclassification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 4   DROP SEQUENCE public.slgenderclassification_id_seq;
       public       postgres    false    3            -           1259    140115    slmachinegroup_id_seq    SEQUENCE     �   CREATE SEQUENCE public.slmachinegroup_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 ,   DROP SEQUENCE public.slmachinegroup_id_seq;
       public       postgres    false    3            .           1259    140117    slmdevictionpartition    TABLE     �  CREATE TABLE public.slmdevictionpartition (
    slevictionpartition_id integer DEFAULT nextval('public.slevictionpartition_id_seq'::regclass) NOT NULL,
    youngmale double precision NOT NULL,
    oldmale double precision NOT NULL,
    peasantmale double precision NOT NULL,
    youngfemale double precision NOT NULL,
    oldfemale double precision NOT NULL,
    active boolean,
    sl_disable boolean,
    name character varying NOT NULL
);
 )   DROP TABLE public.slmdevictionpartition;
       public         postgres    false    299    3            /           1259    140124    slmdgenderclassification    TABLE     �  CREATE TABLE public.slmdgenderclassification (
    slgenderclassification_id integer DEFAULT nextval('public.slgenderclassification_id_seq'::regclass) NOT NULL,
    gender "char" NOT NULL,
    breed_id integer NOT NULL,
    weight_gain double precision NOT NULL,
    age integer NOT NULL,
    mortality double precision NOT NULL,
    sl_disable boolean,
    name character varying NOT NULL
);
 ,   DROP TABLE public.slmdgenderclassification;
       public         postgres    false    300    3            0           1259    140131    slmdmachinegroup    TABLE     �  CREATE TABLE public.slmdmachinegroup (
    slmachinegroup_id integer DEFAULT nextval('public.slmachinegroup_id_seq'::regclass) NOT NULL,
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
       public         postgres    false    301    3            1           1259    140138    slprocess_id_seq    SEQUENCE     �   CREATE SEQUENCE public.slprocess_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 '   DROP SEQUENCE public.slprocess_id_seq;
       public       postgres    false    3            2           1259    140140    slmdprocess    TABLE     c  CREATE TABLE public.slmdprocess (
    slprocess_id integer DEFAULT nextval('public.slprocess_id_seq'::regclass) NOT NULL,
    stage_id integer NOT NULL,
    breed_id integer NOT NULL,
    decrease double precision NOT NULL,
    duration_process integer NOT NULL,
    sync_considered boolean,
    sl_disable boolean,
    name character varying NOT NULL
);
    DROP TABLE public.slmdprocess;
       public         postgres    false    305    3            3           1259    140147    sltxb_shed_slb_shed_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxb_shed_slb_shed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 1   DROP SEQUENCE public.sltxb_shed_slb_shed_id_seq;
       public       postgres    false    3            4           1259    140149 
   sltxb_shed    TABLE     �   CREATE TABLE public.sltxb_shed (
    slb_shed_id integer DEFAULT nextval('public.sltxb_shed_slb_shed_id_seq'::regclass) NOT NULL,
    slbreeding_id integer NOT NULL,
    center_id integer NOT NULL,
    shed_id integer NOT NULL
);
    DROP TABLE public.sltxb_shed;
       public         postgres    false    307    3            5           1259    140153    sltxbr_shed_slbr_shed_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxbr_shed_slbr_shed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 3   DROP SEQUENCE public.sltxbr_shed_slbr_shed_id_seq;
       public       postgres    false    3            6           1259    140155    sltxbr_shed    TABLE       CREATE TABLE public.sltxbr_shed (
    slbr_shed_id integer DEFAULT nextval('public.sltxbr_shed_slbr_shed_id_seq'::regclass) NOT NULL,
    slbroiler_detail_id integer NOT NULL,
    center_id integer NOT NULL,
    shed_id integer NOT NULL,
    lot character varying
);
    DROP TABLE public.sltxbr_shed;
       public         postgres    false    309    3            7           1259    140162    sltxbreeding_slbreeding_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxbreeding_slbreeding_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 5   DROP SEQUENCE public.sltxbreeding_slbreeding_id_seq;
       public       postgres    false    3            8           1259    140164    sltxbreeding    TABLE     o  CREATE TABLE public.sltxbreeding (
    slbreeding_id integer DEFAULT nextval('public.sltxbreeding_slbreeding_id_seq'::regclass) NOT NULL,
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
    associated integer,
    decrease double precision,
    duration integer,
    sl_disable boolean,
    lot character varying
);
     DROP TABLE public.sltxbreeding;
       public         postgres    false    311    3            9           1259    140171    sltxbroiler_slbroiler_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxbroiler_slbroiler_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 3   DROP SEQUENCE public.sltxbroiler_slbroiler_id_seq;
       public       postgres    false    3            :           1259    140173    sltxbroiler    TABLE     v  CREATE TABLE public.sltxbroiler (
    slbroiler_id integer DEFAULT nextval('public.sltxbroiler_slbroiler_id_seq'::regclass) NOT NULL,
    scheduled_date date NOT NULL,
    scheduled_quantity integer NOT NULL,
    real_quantity integer,
    gender "char" NOT NULL,
    incubatorplant_id integer NOT NULL,
    sl_disable boolean,
    slincubator_detail_id integer NOT NULL
);
    DROP TABLE public.sltxbroiler;
       public         postgres    false    313    3            ;           1259    140177 *   sltxbroiler_detail_slbroiler_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxbroiler_detail_slbroiler_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 A   DROP SEQUENCE public.sltxbroiler_detail_slbroiler_detail_id_seq;
       public       postgres    false    3            <           1259    140179    sltxbroiler_detail    TABLE     �  CREATE TABLE public.sltxbroiler_detail (
    slbroiler_detail_id integer DEFAULT nextval('public.sltxbroiler_detail_slbroiler_detail_id_seq'::regclass) NOT NULL,
    farm_id integer NOT NULL,
    housing_date date NOT NULL,
    housing_quantity integer NOT NULL,
    eviction_date date,
    eviction_quantity integer,
    category integer,
    age integer,
    weightgain double precision,
    youngmale integer,
    oldmale integer,
    youngfemale integer,
    oldfemale integer,
    synchronized boolean,
    lot character varying,
    order_p character varying,
    executed boolean,
    sl_disable boolean,
    slbroiler_id integer,
    peasantmale integer
);
 &   DROP TABLE public.sltxbroiler_detail;
       public         postgres    false    315    3            =           1259    140186    sltxbroiler_lot    TABLE       CREATE TABLE public.sltxbroiler_lot (
    slbroiler_lot_id integer NOT NULL,
    slbroiler_detail_id integer NOT NULL,
    slbroiler_id integer,
    quantity integer NOT NULL,
    sl_disable boolean,
    slsellspurchase_id integer,
    gender "char" NOT NULL
);
 #   DROP TABLE public.sltxbroiler_lot;
       public         postgres    false    3            >           1259    140189 $   sltxbroiler_lot_slbroiler_lot_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxbroiler_lot_slbroiler_lot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public.sltxbroiler_lot_slbroiler_lot_id_seq;
       public       postgres    false    3    317            �           0    0 $   sltxbroiler_lot_slbroiler_lot_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public.sltxbroiler_lot_slbroiler_lot_id_seq OWNED BY public.sltxbroiler_lot.slbroiler_lot_id;
            public       postgres    false    318            ?           1259    140191    sltxincubator_slincubator_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxincubator_slincubator_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 4   DROP SEQUENCE public.sltxincubator_slincubator_seq;
       public       postgres    false    3            @           1259    140193    sltxincubator    TABLE     H  CREATE TABLE public.sltxincubator (
    slincubator integer DEFAULT nextval('public.sltxincubator_slincubator_seq'::regclass) NOT NULL,
    scenario_id integer NOT NULL,
    incubatorplant_id integer,
    scheduled_date date NOT NULL,
    scheduled_quantity integer,
    eggsrequired integer NOT NULL,
    sl_disable boolean
);
 !   DROP TABLE public.sltxincubator;
       public         postgres    false    319    3            A           1259    140197    sltxincubator_curve    TABLE     �   CREATE TABLE public.sltxincubator_curve (
    slincubator_curve_id integer NOT NULL,
    slposturecurve_id integer NOT NULL,
    slincubator_id integer NOT NULL,
    quantity integer NOT NULL,
    sl_disable boolean
);
 '   DROP TABLE public.sltxincubator_curve;
       public         postgres    false    3            B           1259    140200 ,   sltxincubator_curve_slincubator_curve_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxincubator_curve_slincubator_curve_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 C   DROP SEQUENCE public.sltxincubator_curve_slincubator_curve_id_seq;
       public       postgres    false    3    321            �           0    0 ,   sltxincubator_curve_slincubator_curve_id_seq    SEQUENCE OWNED BY     }   ALTER SEQUENCE public.sltxincubator_curve_slincubator_curve_id_seq OWNED BY public.sltxincubator_curve.slincubator_curve_id;
            public       postgres    false    322            C           1259    140202 .   sltxincubator_detail_slincubator_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxincubator_detail_slincubator_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 E   DROP SEQUENCE public.sltxincubator_detail_slincubator_detail_id_seq;
       public       postgres    false    3            D           1259    140204    sltxincubator_detail    TABLE     �  CREATE TABLE public.sltxincubator_detail (
    slincubator_detail_id integer DEFAULT nextval('public.sltxincubator_detail_slincubator_detail_id_seq'::regclass) NOT NULL,
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
       public         postgres    false    323    3            E           1259    140211    sltxincubator_lot    TABLE     �   CREATE TABLE public.sltxincubator_lot (
    slincubator_lot_id integer NOT NULL,
    slincubator_detail_id integer NOT NULL,
    slincubator_curve_id integer,
    quantity integer NOT NULL,
    sl_disable boolean,
    slsellspurchase_id integer
);
 %   DROP TABLE public.sltxincubator_lot;
       public         postgres    false    3            F           1259    140214 (   sltxincubator_lot_slincubator_lot_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxincubator_lot_slincubator_lot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ?   DROP SEQUENCE public.sltxincubator_lot_slincubator_lot_id_seq;
       public       postgres    false    325    3            �           0    0 (   sltxincubator_lot_slincubator_lot_id_seq    SEQUENCE OWNED BY     u   ALTER SEQUENCE public.sltxincubator_lot_slincubator_lot_id_seq OWNED BY public.sltxincubator_lot.slincubator_lot_id;
            public       postgres    false    326            G           1259    140216     sltxinventory_slinventory_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxinventory_slinventory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 7   DROP SEQUENCE public.sltxinventory_slinventory_id_seq;
       public       postgres    false    3            H           1259    140218    sltxinventory    TABLE       CREATE TABLE public.sltxinventory (
    slinventory_id integer DEFAULT nextval('public.sltxinventory_slinventory_id_seq'::regclass) NOT NULL,
    scenario_id integer NOT NULL,
    week_date date NOT NULL,
    execution_eggs integer,
    execution_plexus_eggs integer
);
 !   DROP TABLE public.sltxinventory;
       public         postgres    false    327    3            I           1259    140222    sltxlb_shed_sllb_shed_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxlb_shed_sllb_shed_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 3   DROP SEQUENCE public.sltxlb_shed_sllb_shed_id_seq;
       public       postgres    false    3            J           1259    140224    sltxlb_shed    TABLE     �   CREATE TABLE public.sltxlb_shed (
    sllb_shed_id integer DEFAULT nextval('public.sltxlb_shed_sllb_shed_id_seq'::regclass) NOT NULL,
    slliftbreeding_id integer NOT NULL,
    center_id integer NOT NULL,
    shed_id integer NOT NULL
);
    DROP TABLE public.sltxlb_shed;
       public         postgres    false    329    3            K           1259    140228 &   sltxliftbreeding_slliftbreeding_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxliftbreeding_slliftbreeding_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 =   DROP SEQUENCE public.sltxliftbreeding_slliftbreeding_id_seq;
       public       postgres    false    3            L           1259    140230    sltxliftbreeding    TABLE     9  CREATE TABLE public.sltxliftbreeding (
    slliftbreeding_id integer DEFAULT nextval('public.sltxliftbreeding_slliftbreeding_id_seq'::regclass) NOT NULL,
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
    sl_disable boolean,
    slbreeding_id integer NOT NULL
);
 $   DROP TABLE public.sltxliftbreeding;
       public         postgres    false    331    3            M           1259    140234 &   sltxposturecurve_slposturecurve_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxposturecurve_slposturecurve_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 =   DROP SEQUENCE public.sltxposturecurve_slposturecurve_id_seq;
       public       postgres    false    3            N           1259    140236    sltxposturecurve    TABLE     �  CREATE TABLE public.sltxposturecurve (
    slposturecurve_id integer DEFAULT nextval('public.sltxposturecurve_slposturecurve_id_seq'::regclass) NOT NULL,
    scenario_id integer NOT NULL,
    breed_id integer NOT NULL,
    weekly_curve double precision NOT NULL,
    posture_date date NOT NULL,
    posture_quantity integer NOT NULL,
    associated integer,
    sl_disable boolean,
    slbreeding_id integer NOT NULL
);
 $   DROP TABLE public.sltxposturecurve;
       public         postgres    false    333    3            O           1259    140240 (   sltxsellspurchase_slsellspurchase_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sltxsellspurchase_slsellspurchase_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 ?   DROP SEQUENCE public.sltxsellspurchase_slsellspurchase_id_seq;
       public       postgres    false    3            P           1259    140242    sltxsellspurchase    TABLE     �  CREATE TABLE public.sltxsellspurchase (
    slsellspurchase_id integer DEFAULT nextval('public.sltxsellspurchase_slsellspurchase_id_seq'::regclass) NOT NULL,
    scenario_id integer NOT NULL,
    programmed_date date NOT NULL,
    quantity integer NOT NULL,
    breed_id integer NOT NULL,
    sl_disable boolean,
    concept character varying NOT NULL,
    type character varying NOT NULL,
    description character varying NOT NULL,
    lot character varying
);
 %   DROP TABLE public.sltxsellspurchase;
       public         postgres    false    335    3            Q           1259    140249    txadjustmentscontrol    TABLE     �   CREATE TABLE public.txadjustmentscontrol (
    adjustmentscontrol_id integer NOT NULL,
    username character varying(250) NOT NULL,
    adjustment_date date NOT NULL,
    lot_arp character varying NOT NULL,
    description character varying
);
 (   DROP TABLE public.txadjustmentscontrol;
       public         postgres    false    3            R           1259    140255 .   txadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txadjustmentscontrol_adjustmentscontrol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 E   DROP SEQUENCE public.txadjustmentscontrol_adjustmentscontrol_id_seq;
       public       postgres    false    337    3            �           0    0 .   txadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.txadjustmentscontrol_adjustmentscontrol_id_seq OWNED BY public.txadjustmentscontrol.adjustmentscontrol_id;
            public       postgres    false    338            S           1259    140257    txavailabilitysheds    TABLE       CREATE TABLE public.txavailabilitysheds (
    availability_shed_id integer DEFAULT nextval('public.availability_shed_id_seq'::regclass) NOT NULL,
    shed_id integer NOT NULL,
    init_date date,
    end_date date,
    lot_code character varying(20) NOT NULL
);
 '   DROP TABLE public.txavailabilitysheds;
       public         postgres    false    215    3            �           0    0    TABLE txavailabilitysheds    COMMENT     �   COMMENT ON TABLE public.txavailabilitysheds IS 'Almacena la disponibilidad en fechas de los galpones de acuerdo a la programación establecida';
            public       postgres    false    339            �           0    0 /   COLUMN txavailabilitysheds.availability_shed_id    COMMENT     �   COMMENT ON COLUMN public.txavailabilitysheds.availability_shed_id IS 'Id de la disponibilidad del almacen, indicando si este esta disponible';
            public       postgres    false    339            �           0    0 "   COLUMN txavailabilitysheds.shed_id    COMMENT     I   COMMENT ON COLUMN public.txavailabilitysheds.shed_id IS 'Id del galpon';
            public       postgres    false    339            �           0    0 $   COLUMN txavailabilitysheds.init_date    COMMENT     r   COMMENT ON COLUMN public.txavailabilitysheds.init_date IS 'Fecha de inicio de la programacion de uso del galpon';
            public       postgres    false    339            �           0    0 #   COLUMN txavailabilitysheds.end_date    COMMENT     r   COMMENT ON COLUMN public.txavailabilitysheds.end_date IS 'Fecha de cerrado de la programacion de uso del galpon';
            public       postgres    false    339            �           0    0 #   COLUMN txavailabilitysheds.lot_code    COMMENT     W   COMMENT ON COLUMN public.txavailabilitysheds.lot_code IS 'codigo del lote del galpon';
            public       postgres    false    339            T           1259    140261 	   txbroiler    TABLE     �  CREATE TABLE public.txbroiler (
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
       public         postgres    false    219    3            �           0    0    TABLE txbroiler    COMMENT     c   COMMENT ON TABLE public.txbroiler IS 'Almacena la proyeccion realizada para el modulo de engorde';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.broiler_id    COMMENT     U   COMMENT ON COLUMN public.txbroiler.broiler_id IS 'Id de la programacion de engorde';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.projected_date    COMMENT     X   COMMENT ON COLUMN public.txbroiler.projected_date IS 'Fecha de proyección de engorde';
            public       postgres    false    340            �           0    0 #   COLUMN txbroiler.projected_quantity    COMMENT     `   COMMENT ON COLUMN public.txbroiler.projected_quantity IS 'Cantidad proyectada para el engorde';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.partnership_id    COMMENT     I   COMMENT ON COLUMN public.txbroiler.partnership_id IS 'Id de la empresa';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.scenario_id    COMMENT     G   COMMENT ON COLUMN public.txbroiler.scenario_id IS 'Id edl escenario ';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.breed_id    COMMENT     K   COMMENT ON COLUMN public.txbroiler.breed_id IS 'Id de la raza a engordar';
            public       postgres    false    340            �           0    0    COLUMN txbroiler.lot_incubator    COMMENT     u   COMMENT ON COLUMN public.txbroiler.lot_incubator IS 'Lote de incubación de donde provienen los huevos proyectados';
            public       postgres    false    340            �           0    0 #   COLUMN txbroiler.programmed_eggs_id    COMMENT     Y   COMMENT ON COLUMN public.txbroiler.programmed_eggs_id IS 'Id de los huevos programados';
            public       postgres    false    340            U           1259    140265    txbroiler_detail    TABLE     �  CREATE TABLE public.txbroiler_detail (
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
       public         postgres    false    218    3            �           0    0    TABLE txbroiler_detail    COMMENT     l   COMMENT ON TABLE public.txbroiler_detail IS 'Almacena la programacion y ejecuccion del proceso de engorde';
            public       postgres    false    341            �           0    0 )   COLUMN txbroiler_detail.broiler_detail_id    COMMENT     `   COMMENT ON COLUMN public.txbroiler_detail.broiler_detail_id IS 'Id de los detalles de engorde';
            public       postgres    false    341            �           0    0 "   COLUMN txbroiler_detail.broiler_id    COMMENT     \   COMMENT ON COLUMN public.txbroiler_detail.broiler_id IS 'Id de la programacion de engorde';
            public       postgres    false    341            �           0    0 &   COLUMN txbroiler_detail.scheduled_date    COMMENT     k   COMMENT ON COLUMN public.txbroiler_detail.scheduled_date IS 'Fecha programada para el proceso de engorde';
            public       postgres    false    341            �           0    0 *   COLUMN txbroiler_detail.scheduled_quantity    COMMENT     r   COMMENT ON COLUMN public.txbroiler_detail.scheduled_quantity IS 'Cantidad programada para el proceso de engorde';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.farm_id    COMMENT     H   COMMENT ON COLUMN public.txbroiler_detail.farm_id IS 'Id de la granja';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.shed_id    COMMENT     F   COMMENT ON COLUMN public.txbroiler_detail.shed_id IS 'Id del galpon';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.confirm    COMMENT     E   COMMENT ON COLUMN public.txbroiler_detail.confirm IS 'Confirmacion';
            public       postgres    false    341            �           0    0 &   COLUMN txbroiler_detail.execution_date    COMMENT     p   COMMENT ON COLUMN public.txbroiler_detail.execution_date IS 'Fecha de ejeccion de la planificacion de engorde';
            public       postgres    false    341            �           0    0 *   COLUMN txbroiler_detail.execution_quantity    COMMENT     u   COMMENT ON COLUMN public.txbroiler_detail.execution_quantity IS 'Cantidad ejecutada de la programación de engorde';
            public       postgres    false    341            �           0    0    COLUMN txbroiler_detail.lot    COMMENT     D   COMMENT ON COLUMN public.txbroiler_detail.lot IS 'Lote de engorde';
            public       postgres    false    341            �           0    0 *   COLUMN txbroiler_detail.broiler_product_id    COMMENT     ^   COMMENT ON COLUMN public.txbroiler_detail.broiler_product_id IS 'Id del producto de engorde';
            public       postgres    false    341            V           1259    140272    txbroiler_lot    TABLE     �   CREATE TABLE public.txbroiler_lot (
    broiler_lot_id integer NOT NULL,
    broiler_detail_id integer NOT NULL,
    broiler_id integer NOT NULL,
    quantity integer NOT NULL
);
 !   DROP TABLE public.txbroiler_lot;
       public         postgres    false    3            W           1259    140275     txbroiler_lot_broiler_lot_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txbroiler_lot_broiler_lot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.txbroiler_lot_broiler_lot_id_seq;
       public       postgres    false    3    342            �           0    0     txbroiler_lot_broiler_lot_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.txbroiler_lot_broiler_lot_id_seq OWNED BY public.txbroiler_lot.broiler_lot_id;
            public       postgres    false    343            X           1259    140277    txbroilereviction    TABLE     �  CREATE TABLE public.txbroilereviction (
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
       public         postgres    false    223    3            �           0    0    TABLE txbroilereviction    COMMENT     _   COMMENT ON TABLE public.txbroilereviction IS 'Almacena las proyeccion del modula de desalojo';
            public       postgres    false    344            �           0    0 +   COLUMN txbroilereviction.broilereviction_id    COMMENT     ^   COMMENT ON COLUMN public.txbroilereviction.broilereviction_id IS 'Id del modulo de desalojo';
            public       postgres    false    344            �           0    0 '   COLUMN txbroilereviction.projected_date    COMMENT     b   COMMENT ON COLUMN public.txbroilereviction.projected_date IS 'Fecha proyectada para el desalojo';
            public       postgres    false    344            �           0    0 +   COLUMN txbroilereviction.projected_quantity    COMMENT     i   COMMENT ON COLUMN public.txbroilereviction.projected_quantity IS 'Cantidad proyectada para el desalojo';
            public       postgres    false    344            �           0    0 '   COLUMN txbroilereviction.partnership_id    COMMENT     Q   COMMENT ON COLUMN public.txbroilereviction.partnership_id IS 'Id de la empresa';
            public       postgres    false    344            �           0    0 $   COLUMN txbroilereviction.scenario_id    COMMENT     N   COMMENT ON COLUMN public.txbroilereviction.scenario_id IS 'Id del escenario';
            public       postgres    false    344            �           0    0 !   COLUMN txbroilereviction.breed_id    COMMENT     H   COMMENT ON COLUMN public.txbroilereviction.breed_id IS 'Id de la raza';
            public       postgres    false    344            �           0    0 &   COLUMN txbroilereviction.lot_incubator    COMMENT     R   COMMENT ON COLUMN public.txbroilereviction.lot_incubator IS 'Lote de incubacion';
            public       postgres    false    344            Y           1259    140281    txbroilereviction_detail    TABLE     �  CREATE TABLE public.txbroilereviction_detail (
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
       public         postgres    false    222    3            �           0    0    TABLE txbroilereviction_detail    COMMENT     v   COMMENT ON TABLE public.txbroilereviction_detail IS 'Almacena la programación y ejecución del módulo de desalojo';
            public       postgres    false    345            �           0    0 9   COLUMN txbroilereviction_detail.broilereviction_detail_id    COMMENT     ~   COMMENT ON COLUMN public.txbroilereviction_detail.broilereviction_detail_id IS 'Id de los detalles del modulo de desarrollo';
            public       postgres    false    345            �           0    0 2   COLUMN txbroilereviction_detail.broilereviction_id    COMMENT     e   COMMENT ON COLUMN public.txbroilereviction_detail.broilereviction_id IS 'Id del modulo de desalojo';
            public       postgres    false    345            �           0    0 .   COLUMN txbroilereviction_detail.scheduled_date    COMMENT     i   COMMENT ON COLUMN public.txbroilereviction_detail.scheduled_date IS 'Fecha programada para el desalojo';
            public       postgres    false    345            �           0    0 2   COLUMN txbroilereviction_detail.scheduled_quantity    COMMENT     p   COMMENT ON COLUMN public.txbroilereviction_detail.scheduled_quantity IS 'Cantidad programada para el desalojo';
            public       postgres    false    345            �           0    0 '   COLUMN txbroilereviction_detail.farm_id    COMMENT     P   COMMENT ON COLUMN public.txbroilereviction_detail.farm_id IS 'Id de la granja';
            public       postgres    false    345            �           0    0 '   COLUMN txbroilereviction_detail.shed_id    COMMENT     N   COMMENT ON COLUMN public.txbroilereviction_detail.shed_id IS 'Id del galpon';
            public       postgres    false    345            �           0    0 '   COLUMN txbroilereviction_detail.confirm    COMMENT     M   COMMENT ON COLUMN public.txbroilereviction_detail.confirm IS 'Confirmacion';
            public       postgres    false    345            �           0    0 .   COLUMN txbroilereviction_detail.execution_date    COMMENT     \   COMMENT ON COLUMN public.txbroilereviction_detail.execution_date IS 'Fecha de ejecución ';
            public       postgres    false    345            �           0    0 2   COLUMN txbroilereviction_detail.execution_quantity    COMMENT     c   COMMENT ON COLUMN public.txbroilereviction_detail.execution_quantity IS 'Cantidad de ejecución ';
            public       postgres    false    345            �           0    0 #   COLUMN txbroilereviction_detail.lot    COMMENT     X   COMMENT ON COLUMN public.txbroilereviction_detail.lot IS 'Lote del modulo de desalojo';
            public       postgres    false    345            �           0    0 2   COLUMN txbroilereviction_detail.broiler_product_id    COMMENT     f   COMMENT ON COLUMN public.txbroilereviction_detail.broiler_product_id IS 'Id del producto de engorde';
            public       postgres    false    345            �           0    0 1   COLUMN txbroilereviction_detail.slaughterhouse_id    COMMENT     g   COMMENT ON COLUMN public.txbroilereviction_detail.slaughterhouse_id IS 'Id de la planta de beneficio';
            public       postgres    false    345            �           0    0 *   COLUMN txbroilereviction_detail.closed_lot    COMMENT     u   COMMENT ON COLUMN public.txbroilereviction_detail.closed_lot IS 'Indica si el lote fue cerrado para notificaciones';
            public       postgres    false    345            Z           1259    140288    txbroilerheavy_detail    TABLE       CREATE TABLE public.txbroilerheavy_detail (
    broiler_heavy_detail_id integer NOT NULL,
    programmed_date date NOT NULL,
    programmed_quantity integer NOT NULL,
    broiler_detail_id integer NOT NULL,
    broiler_product_id integer NOT NULL,
    lot character varying NOT NULL,
    execution_date date,
    execution_quantity integer,
    closed_lot boolean,
    programmed_disable boolean,
    synchronized boolean,
    tight boolean,
    order_p character varying,
    lot_sap character varying,
    eviction boolean
);
 )   DROP TABLE public.txbroilerheavy_detail;
       public         postgres    false    3            [           1259    140294 1   txbroilerheavy_detail_broiler_heavy_detail_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txbroilerheavy_detail_broiler_heavy_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 H   DROP SEQUENCE public.txbroilerheavy_detail_broiler_heavy_detail_id_seq;
       public       postgres    false    346    3            �           0    0 1   txbroilerheavy_detail_broiler_heavy_detail_id_seq    SEQUENCE OWNED BY     �   ALTER SEQUENCE public.txbroilerheavy_detail_broiler_heavy_detail_id_seq OWNED BY public.txbroilerheavy_detail.broiler_heavy_detail_id;
            public       postgres    false    347            \           1259    140296    txbroilerproduct_detail    TABLE     �   CREATE TABLE public.txbroilerproduct_detail (
    broilerproduct_detail_id integer DEFAULT nextval('public.broiler_product_detail_id_seq'::regclass) NOT NULL,
    broiler_detail integer NOT NULL,
    broiler_product_id integer,
    quantity integer
);
 +   DROP TABLE public.txbroilerproduct_detail;
       public         postgres    false    220    3            �           0    0    TABLE txbroilerproduct_detail    COMMENT     h   COMMENT ON TABLE public.txbroilerproduct_detail IS 'Almacena los detalles de la produccion de engorde';
            public       postgres    false    348            �           0    0 7   COLUMN txbroilerproduct_detail.broilerproduct_detail_id    COMMENT     |   COMMENT ON COLUMN public.txbroilerproduct_detail.broilerproduct_detail_id IS 'Id de los detalles de produccion de engorde';
            public       postgres    false    348            �           0    0 -   COLUMN txbroilerproduct_detail.broiler_detail    COMMENT     Z   COMMENT ON COLUMN public.txbroilerproduct_detail.broiler_detail IS 'Detalles de engorde';
            public       postgres    false    348            �           0    0 1   COLUMN txbroilerproduct_detail.broiler_product_id    COMMENT     e   COMMENT ON COLUMN public.txbroilerproduct_detail.broiler_product_id IS 'Id del producto de engorde';
            public       postgres    false    348            �           0    0 '   COLUMN txbroilerproduct_detail.quantity    COMMENT     `   COMMENT ON COLUMN public.txbroilerproduct_detail.quantity IS 'Cantidad de producto de engorde';
            public       postgres    false    348            ]           1259    140300    txbroodermachine    TABLE     �  CREATE TABLE public.txbroodermachine (
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
       public         postgres    false    225    3            �           0    0    TABLE txbroodermachine    COMMENT     ]   COMMENT ON TABLE public.txbroodermachine IS 'Almacena los datos de las maquinas de engorde';
            public       postgres    false    349            �           0    0 .   COLUMN txbroodermachine.brooder_machine_id_seq    COMMENT     c   COMMENT ON COLUMN public.txbroodermachine.brooder_machine_id_seq IS 'Id de la maquina de engorde';
            public       postgres    false    349            �           0    0 &   COLUMN txbroodermachine.partnership_id    COMMENT     P   COMMENT ON COLUMN public.txbroodermachine.partnership_id IS 'Id de la empresa';
            public       postgres    false    349            �           0    0    COLUMN txbroodermachine.farm_id    COMMENT     H   COMMENT ON COLUMN public.txbroodermachine.farm_id IS 'Id de la granja';
            public       postgres    false    349            �           0    0     COLUMN txbroodermachine.capacity    COMMENT     Q   COMMENT ON COLUMN public.txbroodermachine.capacity IS 'Capacidad de la maquina';
            public       postgres    false    349            �           0    0    COLUMN txbroodermachine.sunday    COMMENT     ?   COMMENT ON COLUMN public.txbroodermachine.sunday IS 'Domingo';
            public       postgres    false    349            �           0    0    COLUMN txbroodermachine.monday    COMMENT     =   COMMENT ON COLUMN public.txbroodermachine.monday IS 'Lunes';
            public       postgres    false    349            �           0    0    COLUMN txbroodermachine.tuesday    COMMENT     ?   COMMENT ON COLUMN public.txbroodermachine.tuesday IS 'Martes';
            public       postgres    false    349                        0    0 !   COLUMN txbroodermachine.wednesday    COMMENT     D   COMMENT ON COLUMN public.txbroodermachine.wednesday IS 'Miercoles';
            public       postgres    false    349                       0    0     COLUMN txbroodermachine.thursday    COMMENT     @   COMMENT ON COLUMN public.txbroodermachine.thursday IS 'Jueves';
            public       postgres    false    349                       0    0    COLUMN txbroodermachine.friday    COMMENT     ?   COMMENT ON COLUMN public.txbroodermachine.friday IS 'Viernes';
            public       postgres    false    349                       0    0     COLUMN txbroodermachine.saturday    COMMENT     @   COMMENT ON COLUMN public.txbroodermachine.saturday IS 'Sabado';
            public       postgres    false    349                       0    0    COLUMN txbroodermachine.name    COMMENT     J   COMMENT ON COLUMN public.txbroodermachine.name IS 'Nombre de la maquina';
            public       postgres    false    349            ^           1259    140312    txeggs_movements_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txeggs_movements_id_seq
    START WITH 170
    INCREMENT BY 2041
    NO MINVALUE
    MAXVALUE 9999999999999999
    CACHE 1;
 .   DROP SEQUENCE public.txeggs_movements_id_seq;
       public       postgres    false    3            _           1259    140314    txeggs_movements    TABLE     �  CREATE TABLE public.txeggs_movements (
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
       public         postgres    false    350    3            `           1259    140321    txeggs_planning    TABLE       CREATE TABLE public.txeggs_planning (
    egg_planning_id integer DEFAULT nextval('public.egg_planning_id_seq'::regclass) NOT NULL,
    month_planning integer,
    year_planning integer,
    scenario_id integer NOT NULL,
    planned double precision,
    breed_id integer NOT NULL
);
 #   DROP TABLE public.txeggs_planning;
       public         postgres    false    229    3                       0    0    TABLE txeggs_planning    COMMENT     g   COMMENT ON TABLE public.txeggs_planning IS 'Almacena los detalles de la planificación de los huevos';
            public       postgres    false    352                       0    0 &   COLUMN txeggs_planning.egg_planning_id    COMMENT     [   COMMENT ON COLUMN public.txeggs_planning.egg_planning_id IS 'Id de planeación de huevos';
            public       postgres    false    352                       0    0 %   COLUMN txeggs_planning.month_planning    COMMENT     c   COMMENT ON COLUMN public.txeggs_planning.month_planning IS 'Mes de planificación de los huevos
';
            public       postgres    false    352                       0    0 $   COLUMN txeggs_planning.year_planning    COMMENT     b   COMMENT ON COLUMN public.txeggs_planning.year_planning IS 'Año de planificación de los huevos';
            public       postgres    false    352            	           0    0 "   COLUMN txeggs_planning.scenario_id    COMMENT     p   COMMENT ON COLUMN public.txeggs_planning.scenario_id IS 'Escenario al cual pertenecen los huevos planificados';
            public       postgres    false    352            
           0    0    COLUMN txeggs_planning.planned    COMMENT     X   COMMENT ON COLUMN public.txeggs_planning.planned IS 'Cantidad de huevos planificados
';
            public       postgres    false    352                       0    0    COLUMN txeggs_planning.breed_id    COMMENT     T   COMMENT ON COLUMN public.txeggs_planning.breed_id IS 'Id de la raza de los huevos';
            public       postgres    false    352            a           1259    140325    txeggs_required    TABLE     
  CREATE TABLE public.txeggs_required (
    egg_required_id integer DEFAULT nextval('public.egg_required_id_seq'::regclass) NOT NULL,
    use_month integer,
    use_year integer,
    scenario_id integer NOT NULL,
    required double precision,
    breed_id integer
);
 #   DROP TABLE public.txeggs_required;
       public         postgres    false    230    3                       0    0    TABLE txeggs_required    COMMENT     V   COMMENT ON TABLE public.txeggs_required IS 'Almacena los datos de huevos requeridos';
            public       postgres    false    353                       0    0 &   COLUMN txeggs_required.egg_required_id    COMMENT     [   COMMENT ON COLUMN public.txeggs_required.egg_required_id IS 'Id de los huevos requeridos';
            public       postgres    false    353                       0    0     COLUMN txeggs_required.use_month    COMMENT     =   COMMENT ON COLUMN public.txeggs_required.use_month IS 'Mes';
            public       postgres    false    353                       0    0    COLUMN txeggs_required.use_year    COMMENT     =   COMMENT ON COLUMN public.txeggs_required.use_year IS 'Año';
            public       postgres    false    353                       0    0 "   COLUMN txeggs_required.scenario_id    COMMENT     L   COMMENT ON COLUMN public.txeggs_required.scenario_id IS 'Id del escenario';
            public       postgres    false    353                       0    0    COLUMN txeggs_required.required    COMMENT     K   COMMENT ON COLUMN public.txeggs_required.required IS 'Cantidad requerida';
            public       postgres    false    353                       0    0    COLUMN txeggs_required.breed_id    COMMENT     F   COMMENT ON COLUMN public.txeggs_required.breed_id IS 'Id de la raza';
            public       postgres    false    353            b           1259    140329    txeggs_storage    TABLE     �  CREATE TABLE public.txeggs_storage (
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
       public         postgres    false    231    3                       0    0    TABLE txeggs_storage    COMMENT     ~   COMMENT ON TABLE public.txeggs_storage IS 'Guarda la informacion de almacenamiento de los huevos en las plantas incubadoras';
            public       postgres    false    354                       0    0 %   COLUMN txeggs_storage.eggs_storage_id    COMMENT     W   COMMENT ON COLUMN public.txeggs_storage.eggs_storage_id IS 'Id del almacen de huevos';
            public       postgres    false    354                       0    0 (   COLUMN txeggs_storage.incubator_plant_id    COMMENT     Y   COMMENT ON COLUMN public.txeggs_storage.incubator_plant_id IS 'Id de planta incubadora';
            public       postgres    false    354                       0    0 !   COLUMN txeggs_storage.scenario_id    COMMENT     K   COMMENT ON COLUMN public.txeggs_storage.scenario_id IS 'Id del escenario';
            public       postgres    false    354                       0    0    COLUMN txeggs_storage.breed_id    COMMENT     E   COMMENT ON COLUMN public.txeggs_storage.breed_id IS 'Id de la raza';
            public       postgres    false    354                       0    0    COLUMN txeggs_storage.init_date    COMMENT     H   COMMENT ON COLUMN public.txeggs_storage.init_date IS 'Fecha de inicio';
            public       postgres    false    354                       0    0    COLUMN txeggs_storage.end_date    COMMENT     J   COMMENT ON COLUMN public.txeggs_storage.end_date IS 'Fecha de terminado';
            public       postgres    false    354                       0    0    COLUMN txeggs_storage.lot    COMMENT     7   COMMENT ON COLUMN public.txeggs_storage.lot IS 'Lote';
            public       postgres    false    354                       0    0    COLUMN txeggs_storage.eggs    COMMENT     F   COMMENT ON COLUMN public.txeggs_storage.eggs IS 'Cantidad de huevos';
            public       postgres    false    354            c           1259    140336    txgoals_erp    TABLE     �   CREATE TABLE public.txgoals_erp (
    goals_erp_id bigint NOT NULL,
    use_week date,
    use_value integer,
    product_id integer NOT NULL,
    code character varying(10),
    scenario_id integer NOT NULL
);
    DROP TABLE public.txgoals_erp;
       public         postgres    false    3                       0    0    TABLE txgoals_erp    COMMENT     �   COMMENT ON TABLE public.txgoals_erp IS 'Almacena los datos generados de las metas de producción de la planificación regresiva para ser enviados al ERP';
            public       postgres    false    355                       0    0    COLUMN txgoals_erp.goals_erp_id    COMMENT     N   COMMENT ON COLUMN public.txgoals_erp.goals_erp_id IS 'Id de la meta del ERP';
            public       postgres    false    355                       0    0    COLUMN txgoals_erp.use_week    COMMENT     ;   COMMENT ON COLUMN public.txgoals_erp.use_week IS 'Semana';
            public       postgres    false    355                       0    0    COLUMN txgoals_erp.use_value    COMMENT     D   COMMENT ON COLUMN public.txgoals_erp.use_value IS 'Valor objetivo';
            public       postgres    false    355                        0    0    COLUMN txgoals_erp.product_id    COMMENT     F   COMMENT ON COLUMN public.txgoals_erp.product_id IS 'Id del producto';
            public       postgres    false    355            !           0    0    COLUMN txgoals_erp.code    COMMENT     D   COMMENT ON COLUMN public.txgoals_erp.code IS 'Codigo del producto';
            public       postgres    false    355            "           0    0    COLUMN txgoals_erp.scenario_id    COMMENT     H   COMMENT ON COLUMN public.txgoals_erp.scenario_id IS 'Id del escenario';
            public       postgres    false    355            d           1259    140339    txgoals_erp_goals_erp_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txgoals_erp_goals_erp_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.txgoals_erp_goals_erp_id_seq;
       public       postgres    false    355    3            #           0    0    txgoals_erp_goals_erp_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.txgoals_erp_goals_erp_id_seq OWNED BY public.txgoals_erp.goals_erp_id;
            public       postgres    false    356            e           1259    140341    txhousingway    TABLE     �  CREATE TABLE public.txhousingway (
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
       public         postgres    false    236    3            $           0    0    TABLE txhousingway    COMMENT     t   COMMENT ON TABLE public.txhousingway IS 'Almacena la proyección de los módulos de levante, cría y reproductora';
            public       postgres    false    357            %           0    0 "   COLUMN txhousingway.housing_way_id    COMMENT     �   COMMENT ON COLUMN public.txhousingway.housing_way_id IS 'Id de las proyecciones  de los módulos de levante, cría y reproductora';
            public       postgres    false    357            &           0    0 &   COLUMN txhousingway.projected_quantity    COMMENT     S   COMMENT ON COLUMN public.txhousingway.projected_quantity IS 'Cantidad proyectada';
            public       postgres    false    357            '           0    0 "   COLUMN txhousingway.projected_date    COMMENT     L   COMMENT ON COLUMN public.txhousingway.projected_date IS 'Fecha proyectada';
            public       postgres    false    357            (           0    0    COLUMN txhousingway.stage_id    COMMENT     D   COMMENT ON COLUMN public.txhousingway.stage_id IS 'Id de la etapa';
            public       postgres    false    357            )           0    0 "   COLUMN txhousingway.partnership_id    COMMENT     L   COMMENT ON COLUMN public.txhousingway.partnership_id IS 'Id de la empresa';
            public       postgres    false    357            *           0    0    COLUMN txhousingway.breed_id    COMMENT     C   COMMENT ON COLUMN public.txhousingway.breed_id IS 'Id de la raza';
            public       postgres    false    357            +           0    0 "   COLUMN txhousingway.predecessor_id    COMMENT     N   COMMENT ON COLUMN public.txhousingway.predecessor_id IS 'Id del predecesor ';
            public       postgres    false    357            f           1259    140345    txhousingway_detail    TABLE     �  CREATE TABLE public.txhousingway_detail (
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
       public         postgres    false    235    3            ,           0    0    TABLE txhousingway_detail    COMMENT     �   COMMENT ON TABLE public.txhousingway_detail IS 'Almacena la programación y la ejecución de los módulos de levante y cría y reproductora';
            public       postgres    false    358            -           0    0 /   COLUMN txhousingway_detail.housingway_detail_id    COMMENT     �   COMMENT ON COLUMN public.txhousingway_detail.housingway_detail_id IS 'Id de la programación y ejecución de los modelos de levante y cría y reproductora';
            public       postgres    false    358            .           0    0 )   COLUMN txhousingway_detail.housing_way_id    COMMENT     �   COMMENT ON COLUMN public.txhousingway_detail.housing_way_id IS 'Id de las proyecciones  de los módulos de levante, cría y reproductora';
            public       postgres    false    358            /           0    0 )   COLUMN txhousingway_detail.scheduled_date    COMMENT     S   COMMENT ON COLUMN public.txhousingway_detail.scheduled_date IS 'Fecha programada';
            public       postgres    false    358            0           0    0 -   COLUMN txhousingway_detail.scheduled_quantity    COMMENT     Z   COMMENT ON COLUMN public.txhousingway_detail.scheduled_quantity IS 'Cantidad programada';
            public       postgres    false    358            1           0    0 "   COLUMN txhousingway_detail.farm_id    COMMENT     K   COMMENT ON COLUMN public.txhousingway_detail.farm_id IS 'Id de la granja';
            public       postgres    false    358            2           0    0 "   COLUMN txhousingway_detail.shed_id    COMMENT     S   COMMENT ON COLUMN public.txhousingway_detail.shed_id IS 'Id del galpon utilizado';
            public       postgres    false    358            3           0    0 "   COLUMN txhousingway_detail.confirm    COMMENT     [   COMMENT ON COLUMN public.txhousingway_detail.confirm IS 'Confirmacion de sincronizacion ';
            public       postgres    false    358            4           0    0 )   COLUMN txhousingway_detail.execution_date    COMMENT     V   COMMENT ON COLUMN public.txhousingway_detail.execution_date IS 'Fecha de ejecución';
            public       postgres    false    358            5           0    0 -   COLUMN txhousingway_detail.execution_quantity    COMMENT     Z   COMMENT ON COLUMN public.txhousingway_detail.execution_quantity IS 'Cantidad a ejecutar';
            public       postgres    false    358            6           0    0    COLUMN txhousingway_detail.lot    COMMENT     I   COMMENT ON COLUMN public.txhousingway_detail.lot IS 'Lote seleccionado';
            public       postgres    false    358            7           0    0 -   COLUMN txhousingway_detail.incubator_plant_id    COMMENT     a   COMMENT ON COLUMN public.txhousingway_detail.incubator_plant_id IS 'Id de la planta incubadora';
            public       postgres    false    358            g           1259    140352    txhousingway_lot    TABLE     �   CREATE TABLE public.txhousingway_lot (
    housingway_lot_id integer NOT NULL,
    production_id integer NOT NULL,
    housingway_id integer NOT NULL,
    quantity integer,
    stage_id integer
);
 $   DROP TABLE public.txhousingway_lot;
       public         postgres    false    3            h           1259    140355 %   txhousingway_lot_txhousingway_lot_seq    SEQUENCE     �   CREATE SEQUENCE public.txhousingway_lot_txhousingway_lot_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 <   DROP SEQUENCE public.txhousingway_lot_txhousingway_lot_seq;
       public       postgres    false    359    3            8           0    0 %   txhousingway_lot_txhousingway_lot_seq    SEQUENCE OWNED BY     p   ALTER SEQUENCE public.txhousingway_lot_txhousingway_lot_seq OWNED BY public.txhousingway_lot.housingway_lot_id;
            public       postgres    false    360            i           1259    140357    txincubator_lot    TABLE     �   CREATE TABLE public.txincubator_lot (
    incubator_lot_id integer NOT NULL,
    programmed_eggs_id integer NOT NULL,
    eggs_movements_id integer NOT NULL,
    quantity integer NOT NULL
);
 #   DROP TABLE public.txincubator_lot;
       public         postgres    false    3            j           1259    140360 $   txincubator_lot_incubator_lot_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txincubator_lot_incubator_lot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public.txincubator_lot_incubator_lot_id_seq;
       public       postgres    false    361    3            9           0    0 $   txincubator_lot_incubator_lot_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public.txincubator_lot_incubator_lot_id_seq OWNED BY public.txincubator_lot.incubator_lot_id;
            public       postgres    false    362            k           1259    140362    txincubator_sales    TABLE       CREATE TABLE public.txincubator_sales (
    incubator_sales_id integer NOT NULL,
    date_sale date NOT NULL,
    quantity integer NOT NULL,
    gender "char" NOT NULL,
    incubator_plant_id integer NOT NULL,
    programmed_disable boolean,
    breed_id integer NOT NULL
);
 %   DROP TABLE public.txincubator_sales;
       public         postgres    false    3            l           1259    140365 (   txincubator_sales_incubator_sales_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txincubator_sales_incubator_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ?   DROP SEQUENCE public.txincubator_sales_incubator_sales_id_seq;
       public       postgres    false    363    3            :           0    0 (   txincubator_sales_incubator_sales_id_seq    SEQUENCE OWNED BY     u   ALTER SEQUENCE public.txincubator_sales_incubator_sales_id_seq OWNED BY public.txincubator_sales.incubator_sales_id;
            public       postgres    false    364            m           1259    140367    txlot    TABLE     n  CREATE TABLE public.txlot (
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
       public         postgres    false    243    3            ;           0    0    TABLE txlot    COMMENT     T   COMMENT ON TABLE public.txlot IS 'Almacena la informacion de los diferentes lotes';
            public       postgres    false    365            <           0    0    COLUMN txlot.lot_id    COMMENT     8   COMMENT ON COLUMN public.txlot.lot_id IS 'Id del lote';
            public       postgres    false    365            =           0    0    COLUMN txlot.lot_code    COMMENT     >   COMMENT ON COLUMN public.txlot.lot_code IS 'Codigo del lote';
            public       postgres    false    365            >           0    0    COLUMN txlot.lot_origin    COMMENT     @   COMMENT ON COLUMN public.txlot.lot_origin IS 'Origen del lote';
            public       postgres    false    365            ?           0    0    COLUMN txlot.status    COMMENT     <   COMMENT ON COLUMN public.txlot.status IS 'Estado del lote';
            public       postgres    false    365            @           0    0    COLUMN txlot.proyected_date    COMMENT     E   COMMENT ON COLUMN public.txlot.proyected_date IS 'Fecha proyectada';
            public       postgres    false    365            A           0    0    COLUMN txlot.sheduled_date    COMMENT     D   COMMENT ON COLUMN public.txlot.sheduled_date IS 'Fecha programada';
            public       postgres    false    365            B           0    0    COLUMN txlot.proyected_quantity    COMMENT     L   COMMENT ON COLUMN public.txlot.proyected_quantity IS 'Cantidad proyectada';
            public       postgres    false    365            C           0    0    COLUMN txlot.sheduled_quantity    COMMENT     K   COMMENT ON COLUMN public.txlot.sheduled_quantity IS 'Cantidad programada';
            public       postgres    false    365            D           0    0    COLUMN txlot.released_quantity    COMMENT     I   COMMENT ON COLUMN public.txlot.released_quantity IS 'Cantidad liberada';
            public       postgres    false    365            E           0    0    COLUMN txlot.product_id    COMMENT     @   COMMENT ON COLUMN public.txlot.product_id IS 'Id del producto';
            public       postgres    false    365            F           0    0    COLUMN txlot.breed_id    COMMENT     <   COMMENT ON COLUMN public.txlot.breed_id IS 'Id de la raza';
            public       postgres    false    365            G           0    0    COLUMN txlot.gender    COMMENT     <   COMMENT ON COLUMN public.txlot.gender IS 'Genero del lote';
            public       postgres    false    365            H           0    0    COLUMN txlot.type_posture    COMMENT     B   COMMENT ON COLUMN public.txlot.type_posture IS 'Tipo de postura';
            public       postgres    false    365            I           0    0    COLUMN txlot.shed_id    COMMENT     ;   COMMENT ON COLUMN public.txlot.shed_id IS 'Id del galpon';
            public       postgres    false    365            J           0    0    COLUMN txlot.origin    COMMENT     3   COMMENT ON COLUMN public.txlot.origin IS 'Origen';
            public       postgres    false    365            K           0    0    COLUMN txlot.farm_id    COMMENT     =   COMMENT ON COLUMN public.txlot.farm_id IS 'Id de la granja';
            public       postgres    false    365            L           0    0    COLUMN txlot.housing_way_id    COMMENT     ~   COMMENT ON COLUMN public.txlot.housing_way_id IS 'Id del almacenamientos de la proyecciones de levante, cria y reproductora';
            public       postgres    false    365            n           1259    140371 
   txlot_eggs    TABLE     �   CREATE TABLE public.txlot_eggs (
    lot_eggs_id integer DEFAULT nextval('public.lot_eggs_id_seq'::regclass) NOT NULL,
    theorical_performance double precision,
    week_date date,
    week integer
);
    DROP TABLE public.txlot_eggs;
       public         postgres    false    241    3            M           0    0    TABLE txlot_eggs    COMMENT     S   COMMENT ON TABLE public.txlot_eggs IS 'Almacena los datos de los lotes de huevos';
            public       postgres    false    366            N           0    0    COLUMN txlot_eggs.lot_eggs_id    COMMENT     L   COMMENT ON COLUMN public.txlot_eggs.lot_eggs_id IS 'Id del lote de huevos';
            public       postgres    false    366            O           0    0 '   COLUMN txlot_eggs.theorical_performance    COMMENT     T   COMMENT ON COLUMN public.txlot_eggs.theorical_performance IS 'Rendimiento teorico';
            public       postgres    false    366            P           0    0    COLUMN txlot_eggs.week_date    COMMENT     G   COMMENT ON COLUMN public.txlot_eggs.week_date IS 'Fecha de la semana';
            public       postgres    false    366            Q           0    0    COLUMN txlot_eggs.week    COMMENT     6   COMMENT ON COLUMN public.txlot_eggs.week IS 'Semana';
            public       postgres    false    366            o           1259    140375    txposturecurve    TABLE     �  CREATE TABLE public.txposturecurve (
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
       public         postgres    false    288    3            R           0    0    TABLE txposturecurve    COMMENT        COMMENT ON TABLE public.txposturecurve IS 'Almacena la información de la curva de postura por cada raza separada por semana';
            public       postgres    false    367            S           0    0 &   COLUMN txposturecurve.posture_curve_id    COMMENT     Y   COMMENT ON COLUMN public.txposturecurve.posture_curve_id IS 'Id de la curva de postura';
            public       postgres    false    367            T           0    0    COLUMN txposturecurve.week    COMMENT     _   COMMENT ON COLUMN public.txposturecurve.week IS 'Semana en la que inicia la curva de postura';
            public       postgres    false    367            U           0    0    COLUMN txposturecurve.breed_id    COMMENT     P   COMMENT ON COLUMN public.txposturecurve.breed_id IS 'Identificador de la raza';
            public       postgres    false    367            V           0    0 +   COLUMN txposturecurve.theorical_performance    COMMENT     X   COMMENT ON COLUMN public.txposturecurve.theorical_performance IS 'Desempeño teórico';
            public       postgres    false    367            W           0    0 ,   COLUMN txposturecurve.historical_performance    COMMENT     [   COMMENT ON COLUMN public.txposturecurve.historical_performance IS 'Desempeño histórico';
            public       postgres    false    367            X           0    0 /   COLUMN txposturecurve.theorical_accum_mortality    COMMENT     h   COMMENT ON COLUMN public.txposturecurve.theorical_accum_mortality IS 'Acumulado de mortalidad teorico';
            public       postgres    false    367            Y           0    0 0   COLUMN txposturecurve.historical_accum_mortality    COMMENT     k   COMMENT ON COLUMN public.txposturecurve.historical_accum_mortality IS 'Acumulado de mortalidad historico';
            public       postgres    false    367            Z           0    0 *   COLUMN txposturecurve.theorical_uniformity    COMMENT     W   COMMENT ON COLUMN public.txposturecurve.theorical_uniformity IS 'Uniformidad teorica';
            public       postgres    false    367            [           0    0 +   COLUMN txposturecurve.historical_uniformity    COMMENT     Z   COMMENT ON COLUMN public.txposturecurve.historical_uniformity IS 'Uniformidad historica';
            public       postgres    false    367            \           0    0 "   COLUMN txposturecurve.type_posture    COMMENT     K   COMMENT ON COLUMN public.txposturecurve.type_posture IS 'Tipo de postura';
            public       postgres    false    367            p           1259    140379    txprogrammed_eggs    TABLE     �  CREATE TABLE public.txprogrammed_eggs (
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
       public         postgres    false    291    3            ]           0    0    TABLE txprogrammed_eggs    COMMENT        COMMENT ON TABLE public.txprogrammed_eggs IS 'Almacena la proyección, programación y ejecución del módulo de incubadoras';
            public       postgres    false    368            ^           0    0 +   COLUMN txprogrammed_eggs.programmed_eggs_id    COMMENT     j   COMMENT ON COLUMN public.txprogrammed_eggs.programmed_eggs_id IS 'Id de las programacion de incubadoras';
            public       postgres    false    368            _           0    0 %   COLUMN txprogrammed_eggs.incubator_id    COMMENT     O   COMMENT ON COLUMN public.txprogrammed_eggs.incubator_id IS 'Id de incubadora';
            public       postgres    false    368            `           0    0 "   COLUMN txprogrammed_eggs.lot_breed    COMMENT     I   COMMENT ON COLUMN public.txprogrammed_eggs.lot_breed IS 'Lote por raza';
            public       postgres    false    368            a           0    0 &   COLUMN txprogrammed_eggs.lot_incubator    COMMENT     S   COMMENT ON COLUMN public.txprogrammed_eggs.lot_incubator IS 'Lote de incubadoras';
            public       postgres    false    368            b           0    0    COLUMN txprogrammed_eggs.eggs    COMMENT     I   COMMENT ON COLUMN public.txprogrammed_eggs.eggs IS 'Cantidad de huevos';
            public       postgres    false    368            c           0    0 !   COLUMN txprogrammed_eggs.breed_id    COMMENT     E   COMMENT ON COLUMN public.txprogrammed_eggs.breed_id IS 'Id de raza';
            public       postgres    false    368            d           0    0 +   COLUMN txprogrammed_eggs.execution_quantity    COMMENT     [   COMMENT ON COLUMN public.txprogrammed_eggs.execution_quantity IS 'Cantidad de ejecución';
            public       postgres    false    368            q           1259    140386    txscenarioformula    TABLE     y  CREATE TABLE public.txscenarioformula (
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
       public         postgres    false    293    3            e           0    0    TABLE txscenarioformula    COMMENT     �   COMMENT ON TABLE public.txscenarioformula IS 'Almacena los datos para la formulación de salida de la planificación regresiva';
            public       postgres    false    369            f           0    0 ,   COLUMN txscenarioformula.scenario_formula_id    COMMENT     d   COMMENT ON COLUMN public.txscenarioformula.scenario_formula_id IS 'Id de la formula del escenario';
            public       postgres    false    369            g           0    0 #   COLUMN txscenarioformula.process_id    COMMENT     K   COMMENT ON COLUMN public.txscenarioformula.process_id IS 'Id del proceso';
            public       postgres    false    369            h           0    0 '   COLUMN txscenarioformula.predecessor_id    COMMENT     R   COMMENT ON COLUMN public.txscenarioformula.predecessor_id IS 'Id del predecesor';
            public       postgres    false    369            i           0    0 %   COLUMN txscenarioformula.parameter_id    COMMENT     O   COMMENT ON COLUMN public.txscenarioformula.parameter_id IS 'Id del parametro';
            public       postgres    false    369            j           0    0    COLUMN txscenarioformula.sign    COMMENT     E   COMMENT ON COLUMN public.txscenarioformula.sign IS 'Firma de datos';
            public       postgres    false    369            k           0    0     COLUMN txscenarioformula.divider    COMMENT     J   COMMENT ON COLUMN public.txscenarioformula.divider IS 'divisor de datos';
            public       postgres    false    369            l           0    0 !   COLUMN txscenarioformula.duration    COMMENT     Q   COMMENT ON COLUMN public.txscenarioformula.duration IS 'Duracion de la formula';
            public       postgres    false    369            m           0    0 $   COLUMN txscenarioformula.scenario_id    COMMENT     N   COMMENT ON COLUMN public.txscenarioformula.scenario_id IS 'Id del escenario';
            public       postgres    false    369            n           0    0 #   COLUMN txscenarioformula.measure_id    COMMENT     M   COMMENT ON COLUMN public.txscenarioformula.measure_id IS 'Id de la medida
';
            public       postgres    false    369            r           1259    140390    txscenarioparameter    TABLE     l  CREATE TABLE public.txscenarioparameter (
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
       public         postgres    false    295    3            o           0    0    TABLE txscenarioparameter    COMMENT     s   COMMENT ON TABLE public.txscenarioparameter IS 'Almacena las metas de producción ingresadas para los escenarios';
            public       postgres    false    370            p           0    0 0   COLUMN txscenarioparameter.scenario_parameter_id    COMMENT     l   COMMENT ON COLUMN public.txscenarioparameter.scenario_parameter_id IS 'Id de los parametros del escenario';
            public       postgres    false    370            q           0    0 %   COLUMN txscenarioparameter.process_id    COMMENT     M   COMMENT ON COLUMN public.txscenarioparameter.process_id IS 'Id del proceso';
            public       postgres    false    370            r           0    0 '   COLUMN txscenarioparameter.parameter_id    COMMENT     Q   COMMENT ON COLUMN public.txscenarioparameter.parameter_id IS 'Id del parametro';
            public       postgres    false    370            s           0    0 #   COLUMN txscenarioparameter.use_year    COMMENT     O   COMMENT ON COLUMN public.txscenarioparameter.use_year IS 'Año del parametro';
            public       postgres    false    370            t           0    0 $   COLUMN txscenarioparameter.use_month    COMMENT     O   COMMENT ON COLUMN public.txscenarioparameter.use_month IS 'Mes del parametro';
            public       postgres    false    370            u           0    0 $   COLUMN txscenarioparameter.use_value    COMMENT     Q   COMMENT ON COLUMN public.txscenarioparameter.use_value IS 'Valor del parametro';
            public       postgres    false    370            v           0    0 &   COLUMN txscenarioparameter.scenario_id    COMMENT     P   COMMENT ON COLUMN public.txscenarioparameter.scenario_id IS 'Id del escenario';
            public       postgres    false    370            w           0    0 &   COLUMN txscenarioparameter.value_units    COMMENT     U   COMMENT ON COLUMN public.txscenarioparameter.value_units IS 'Valor de las unidades';
            public       postgres    false    370            s           1259    140395    txscenarioparameterday    TABLE     {  CREATE TABLE public.txscenarioparameterday (
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
       public         postgres    false    294    3            x           0    0    TABLE txscenarioparameterday    COMMENT     V   COMMENT ON TABLE public.txscenarioparameterday IS 'Almcacena los parametros por dia';
            public       postgres    false    371            y           0    0 7   COLUMN txscenarioparameterday.scenario_parameter_day_id    COMMENT     m   COMMENT ON COLUMN public.txscenarioparameterday.scenario_parameter_day_id IS 'Id de los parametros del dia';
            public       postgres    false    371            z           0    0 %   COLUMN txscenarioparameterday.use_day    COMMENT     B   COMMENT ON COLUMN public.txscenarioparameterday.use_day IS 'Dia';
            public       postgres    false    371            {           0    0 *   COLUMN txscenarioparameterday.parameter_id    COMMENT     c   COMMENT ON COLUMN public.txscenarioparameterday.parameter_id IS 'Id de los parametros necesarios';
            public       postgres    false    371            |           0    0 '   COLUMN txscenarioparameterday.units_day    COMMENT     U   COMMENT ON COLUMN public.txscenarioparameterday.units_day IS 'Cantidad de material';
            public       postgres    false    371            }           0    0 )   COLUMN txscenarioparameterday.scenario_id    COMMENT     u   COMMENT ON COLUMN public.txscenarioparameterday.scenario_id IS 'Escenario al cual pertenece el scanrioparameterday';
            public       postgres    false    371            ~           0    0 &   COLUMN txscenarioparameterday.sequence    COMMENT     R   COMMENT ON COLUMN public.txscenarioparameterday.sequence IS 'Secuencia del dia
';
            public       postgres    false    371                       0    0 '   COLUMN txscenarioparameterday.use_month    COMMENT     ]   COMMENT ON COLUMN public.txscenarioparameterday.use_month IS 'Mes en que se ubica el día ';
            public       postgres    false    371            �           0    0 &   COLUMN txscenarioparameterday.use_year    COMMENT     ]   COMMENT ON COLUMN public.txscenarioparameterday.use_year IS 'Año en que se ubica el día ';
            public       postgres    false    371            �           0    0 &   COLUMN txscenarioparameterday.week_day    COMMENT     P   COMMENT ON COLUMN public.txscenarioparameterday.week_day IS 'Dia de la semana';
            public       postgres    false    371            �           0    0 &   COLUMN txscenarioparameterday.use_week    COMMENT     F   COMMENT ON COLUMN public.txscenarioparameterday.use_week IS 'Semana';
            public       postgres    false    371            t           1259    140399    txscenarioposturecurve    TABLE     3  CREATE TABLE public.txscenarioposturecurve (
    scenario_posture_id integer DEFAULT nextval('public.scenario_posture_id_seq'::regclass) NOT NULL,
    posture_date date,
    eggs double precision,
    scenario_id integer NOT NULL,
    housingway_detail_id integer NOT NULL,
    breed_id integer NOT NULL
);
 *   DROP TABLE public.txscenarioposturecurve;
       public         postgres    false    296    3            �           0    0    TABLE txscenarioposturecurve    COMMENT     o   COMMENT ON TABLE public.txscenarioposturecurve IS 'Almacena los datos que se utilizan en la curva de postura';
            public       postgres    false    372            �           0    0 1   COLUMN txscenarioposturecurve.scenario_posture_id    COMMENT     i   COMMENT ON COLUMN public.txscenarioposturecurve.scenario_posture_id IS 'Id de la postura del escenario';
            public       postgres    false    372            �           0    0 *   COLUMN txscenarioposturecurve.posture_date    COMMENT     W   COMMENT ON COLUMN public.txscenarioposturecurve.posture_date IS 'Fecha de la postura';
            public       postgres    false    372            �           0    0 "   COLUMN txscenarioposturecurve.eggs    COMMENT     N   COMMENT ON COLUMN public.txscenarioposturecurve.eggs IS 'Cantidad de huevos';
            public       postgres    false    372            �           0    0 )   COLUMN txscenarioposturecurve.scenario_id    COMMENT     R   COMMENT ON COLUMN public.txscenarioposturecurve.scenario_id IS 'Id del scenario';
            public       postgres    false    372            �           0    0 2   COLUMN txscenarioposturecurve.housingway_detail_id    COMMENT     �   COMMENT ON COLUMN public.txscenarioposturecurve.housingway_detail_id IS 'Id de la programación y ejecución de los modelos de levante y cría y reproductora';
            public       postgres    false    372            �           0    0 &   COLUMN txscenarioposturecurve.breed_id    COMMENT     M   COMMENT ON COLUMN public.txscenarioposturecurve.breed_id IS 'Id de la raza';
            public       postgres    false    372            u           1259    140403    txscenarioprocess    TABLE     4  CREATE TABLE public.txscenarioprocess (
    scenario_process_id integer DEFAULT nextval('public.scenario_process_id_seq'::regclass) NOT NULL,
    process_id integer NOT NULL,
    decrease_goal double precision,
    weight_goal double precision,
    duration_goal integer,
    scenario_id integer NOT NULL
);
 %   DROP TABLE public.txscenarioprocess;
       public         postgres    false    297    3            �           0    0    TABLE txscenarioprocess    COMMENT     m   COMMENT ON TABLE public.txscenarioprocess IS 'Almacena los procesos asociados a cada uno de los escenarios';
            public       postgres    false    373            �           0    0 ,   COLUMN txscenarioprocess.scenario_process_id    COMMENT     a   COMMENT ON COLUMN public.txscenarioprocess.scenario_process_id IS 'Id del proceso de escenario';
            public       postgres    false    373            �           0    0 #   COLUMN txscenarioprocess.process_id    COMMENT     V   COMMENT ON COLUMN public.txscenarioprocess.process_id IS 'Id del proceso a utilizar';
            public       postgres    false    373            �           0    0 &   COLUMN txscenarioprocess.decrease_goal    COMMENT     v   COMMENT ON COLUMN public.txscenarioprocess.decrease_goal IS 'Guarda los datos de la merma historia en dicho proceso';
            public       postgres    false    373            �           0    0 $   COLUMN txscenarioprocess.weight_goal    COMMENT     q   COMMENT ON COLUMN public.txscenarioprocess.weight_goal IS 'Guarda los datos del peso historio en dicho proceso';
            public       postgres    false    373            �           0    0 &   COLUMN txscenarioprocess.duration_goal    COMMENT     y   COMMENT ON COLUMN public.txscenarioprocess.duration_goal IS 'Guarda los datos de la duracion historia en dicho proceso';
            public       postgres    false    373            �           0    0 $   COLUMN txscenarioprocess.scenario_id    COMMENT     X   COMMENT ON COLUMN public.txscenarioprocess.scenario_id IS 'Id del escenario utilizado';
            public       postgres    false    373            v           1259    140407    txsync    TABLE     +  CREATE TABLE public.txsync (
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
       public         postgres    false    3            w           1259    140413    txsync_sync_id_seq    SEQUENCE     �   CREATE SEQUENCE public.txsync_sync_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.txsync_sync_id_seq;
       public       postgres    false    374    3            �           0    0    txsync_sync_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.txsync_sync_id_seq OWNED BY public.txsync.sync_id;
            public       postgres    false    375            x           1259    140415 #   user_application_application_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_application_application_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 :   DROP SEQUENCE public.user_application_application_id_seq;
       public       postgres    false    3            y           1259    140417     user_application_user_app_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_application_user_app_id_seq
    START WITH 215
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 7   DROP SEQUENCE public.user_application_user_app_id_seq;
       public       postgres    false    3            z           1259    140419    user_application_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_application_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;
 3   DROP SEQUENCE public.user_application_user_id_seq;
       public       postgres    false    3            {           1259    140421    warehouse_id_seq    SEQUENCE     y   CREATE SEQUENCE public.warehouse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.warehouse_id_seq;
       public       postgres    false    3            �           2604    140423 ,   md_optimizer_parameter optimizerparameter_id    DEFAULT     �   ALTER TABLE ONLY public.md_optimizer_parameter ALTER COLUMN optimizerparameter_id SET DEFAULT nextval('public.md_optimizer_parameter_optimizerparameter_id_seq'::regclass);
 [   ALTER TABLE public.md_optimizer_parameter ALTER COLUMN optimizerparameter_id DROP DEFAULT;
       public       postgres    false    246    245            �           2604    140424    mdadjustment adjustment_id    DEFAULT     �   ALTER TABLE ONLY public.mdadjustment ALTER COLUMN adjustment_id SET DEFAULT nextval('public.mdadjustment_adjustment_id_seq'::regclass);
 I   ALTER TABLE public.mdadjustment ALTER COLUMN adjustment_id DROP DEFAULT;
       public       postgres    false    248    247            �           2604    140425 *   mdequivalenceproduct equivalenceproduct_id    DEFAULT     �   ALTER TABLE ONLY public.mdequivalenceproduct ALTER COLUMN equivalenceproduct_id SET DEFAULT nextval('public.mdequivalenceproduct_equivalenceproduct_id_seq'::regclass);
 Y   ALTER TABLE public.mdequivalenceproduct ALTER COLUMN equivalenceproduct_id DROP DEFAULT;
       public       postgres    false    256    255            �           2604    140426 *   osadjustmentscontrol adjustmentscontrol_id    DEFAULT     �   ALTER TABLE ONLY public.osadjustmentscontrol ALTER COLUMN adjustmentscontrol_id SET DEFAULT nextval('public.osadjustmentscontrol_adjustmentscontrol_id_seq'::regclass);
 Y   ALTER TABLE public.osadjustmentscontrol ALTER COLUMN adjustmentscontrol_id DROP DEFAULT;
       public       postgres    false    277    276            �           2604    140427     sltxbroiler_lot slbroiler_lot_id    DEFAULT     �   ALTER TABLE ONLY public.sltxbroiler_lot ALTER COLUMN slbroiler_lot_id SET DEFAULT nextval('public.sltxbroiler_lot_slbroiler_lot_id_seq'::regclass);
 O   ALTER TABLE public.sltxbroiler_lot ALTER COLUMN slbroiler_lot_id DROP DEFAULT;
       public       postgres    false    318    317            �           2604    140428 (   sltxincubator_curve slincubator_curve_id    DEFAULT     �   ALTER TABLE ONLY public.sltxincubator_curve ALTER COLUMN slincubator_curve_id SET DEFAULT nextval('public.sltxincubator_curve_slincubator_curve_id_seq'::regclass);
 W   ALTER TABLE public.sltxincubator_curve ALTER COLUMN slincubator_curve_id DROP DEFAULT;
       public       postgres    false    322    321            �           2604    140429 $   sltxincubator_lot slincubator_lot_id    DEFAULT     �   ALTER TABLE ONLY public.sltxincubator_lot ALTER COLUMN slincubator_lot_id SET DEFAULT nextval('public.sltxincubator_lot_slincubator_lot_id_seq'::regclass);
 S   ALTER TABLE public.sltxincubator_lot ALTER COLUMN slincubator_lot_id DROP DEFAULT;
       public       postgres    false    326    325            �           2604    140430 *   txadjustmentscontrol adjustmentscontrol_id    DEFAULT     �   ALTER TABLE ONLY public.txadjustmentscontrol ALTER COLUMN adjustmentscontrol_id SET DEFAULT nextval('public.txadjustmentscontrol_adjustmentscontrol_id_seq'::regclass);
 Y   ALTER TABLE public.txadjustmentscontrol ALTER COLUMN adjustmentscontrol_id DROP DEFAULT;
       public       postgres    false    338    337            �           2604    140431    txbroiler_lot broiler_lot_id    DEFAULT     �   ALTER TABLE ONLY public.txbroiler_lot ALTER COLUMN broiler_lot_id SET DEFAULT nextval('public.txbroiler_lot_broiler_lot_id_seq'::regclass);
 K   ALTER TABLE public.txbroiler_lot ALTER COLUMN broiler_lot_id DROP DEFAULT;
       public       postgres    false    343    342            �           2604    140432 -   txbroilerheavy_detail broiler_heavy_detail_id    DEFAULT     �   ALTER TABLE ONLY public.txbroilerheavy_detail ALTER COLUMN broiler_heavy_detail_id SET DEFAULT nextval('public.txbroilerheavy_detail_broiler_heavy_detail_id_seq'::regclass);
 \   ALTER TABLE public.txbroilerheavy_detail ALTER COLUMN broiler_heavy_detail_id DROP DEFAULT;
       public       postgres    false    347    346            �           2604    140433    txgoals_erp goals_erp_id    DEFAULT     �   ALTER TABLE ONLY public.txgoals_erp ALTER COLUMN goals_erp_id SET DEFAULT nextval('public.txgoals_erp_goals_erp_id_seq'::regclass);
 G   ALTER TABLE public.txgoals_erp ALTER COLUMN goals_erp_id DROP DEFAULT;
       public       postgres    false    356    355            �           2604    140434 "   txhousingway_lot housingway_lot_id    DEFAULT     �   ALTER TABLE ONLY public.txhousingway_lot ALTER COLUMN housingway_lot_id SET DEFAULT nextval('public.txhousingway_lot_txhousingway_lot_seq'::regclass);
 Q   ALTER TABLE public.txhousingway_lot ALTER COLUMN housingway_lot_id DROP DEFAULT;
       public       postgres    false    360    359            �           2604    140435     txincubator_lot incubator_lot_id    DEFAULT     �   ALTER TABLE ONLY public.txincubator_lot ALTER COLUMN incubator_lot_id SET DEFAULT nextval('public.txincubator_lot_incubator_lot_id_seq'::regclass);
 O   ALTER TABLE public.txincubator_lot ALTER COLUMN incubator_lot_id DROP DEFAULT;
       public       postgres    false    362    361            �           2604    140436 $   txincubator_sales incubator_sales_id    DEFAULT     �   ALTER TABLE ONLY public.txincubator_sales ALTER COLUMN incubator_sales_id SET DEFAULT nextval('public.txincubator_sales_incubator_sales_id_seq'::regclass);
 S   ALTER TABLE public.txincubator_sales ALTER COLUMN incubator_sales_id DROP DEFAULT;
       public       postgres    false    364    363            �           2604    140437    txsync sync_id    DEFAULT     p   ALTER TABLE ONLY public.txsync ALTER COLUMN sync_id SET DEFAULT nextval('public.txsync_sync_id_seq'::regclass);
 =   ALTER TABLE public.txsync ALTER COLUMN sync_id DROP DEFAULT;
       public       postgres    false    375    374            B          0    139818    aba_breeds_and_stages 
   TABLE DATA               m   COPY public.aba_breeds_and_stages (id, code, name, id_aba_consumption_and_mortality, id_process) FROM stdin;
    public       postgres    false    198   C�      D          0    139824    aba_consumption_and_mortality 
   TABLE DATA               m   COPY public.aba_consumption_and_mortality (id, code, name, id_breed, id_stage, id_aba_time_unit) FROM stdin;
    public       postgres    false    200   `�      F          0    139830 $   aba_consumption_and_mortality_detail 
   TABLE DATA               �   COPY public.aba_consumption_and_mortality_detail (id, id_aba_consumption_and_mortality, time_unit_number, consumption, mortality) FROM stdin;
    public       postgres    false    202   }�      H          0    139836    aba_elements 
   TABLE DATA               d   COPY public.aba_elements (id, code, name, id_aba_element_property, equivalent_quantity) FROM stdin;
    public       postgres    false    204   ��      J          0    139842    aba_elements_and_concentrations 
   TABLE DATA               �   COPY public.aba_elements_and_concentrations (id, id_aba_element, id_aba_formulation, proportion, id_element_equivalent, id_aba_element_property, equivalent_quantity) FROM stdin;
    public       postgres    false    206   ��      L          0    139848    aba_elements_properties 
   TABLE DATA               A   COPY public.aba_elements_properties (id, code, name) FROM stdin;
    public       postgres    false    208   ��      N          0    139854    aba_formulation 
   TABLE DATA               9   COPY public.aba_formulation (id, code, name) FROM stdin;
    public       postgres    false    210   ��      Q          0    139862    aba_stages_of_breeds_and_stages 
   TABLE DATA               w   COPY public.aba_stages_of_breeds_and_stages (id, id_aba_breeds_and_stages, id_formulation, name, duration) FROM stdin;
    public       postgres    false    213   �      R          0    139866    aba_time_unit 
   TABLE DATA               G   COPY public.aba_time_unit (id, singular_name, plural_name) FROM stdin;
    public       postgres    false    214   +�      q          0    139930    md_optimizer_parameter 
   TABLE DATA                  COPY public.md_optimizer_parameter (optimizerparameter_id, breed_id, max_housing, min_housing, difference, active) FROM stdin;
    public       postgres    false    245   H�      s          0    139935    mdadjustment 
   TABLE DATA               P   COPY public.mdadjustment (adjustment_id, type, prefix, description) FROM stdin;
    public       postgres    false    247   e�      v          0    139945    mdapplication 
   TABLE DATA               O   COPY public.mdapplication (application_id, application_name, type) FROM stdin;
    public       postgres    false    250   ��      x          0    139951    mdapplication_rol 
   TABLE DATA               G   COPY public.mdapplication_rol (id, application_id, rol_id) FROM stdin;
    public       postgres    false    252   
�      y          0    139955    mdbreed 
   TABLE DATA               7   COPY public.mdbreed (breed_id, code, name) FROM stdin;
    public       postgres    false    253   x�      z          0    139959    mdbroiler_product 
   TABLE DATA               �   COPY public.mdbroiler_product (broiler_product_id, name, days_eviction, weight, code, breed_id, gender, min_days_eviction, conversion_percentage, type_bird, initial_product) FROM stdin;
    public       postgres    false    254   ��      {          0    139963    mdequivalenceproduct 
   TABLE DATA               o   COPY public.mdequivalenceproduct (equivalenceproduct_id, product_code, equivalence_code, breed_id) FROM stdin;
    public       postgres    false    255   ��      }          0    139968 
   mdfarmtype 
   TABLE DATA               8   COPY public.mdfarmtype (farm_type_id, name) FROM stdin;
    public       postgres    false    257   ��                0    139974 	   mdmeasure 
   TABLE DATA               b   COPY public.mdmeasure (measure_id, name, abbreviation, originvalue, valuekg, is_unit) FROM stdin;
    public       postgres    false    259   �      �          0    139980    mdparameter 
   TABLE DATA               d   COPY public.mdparameter (parameter_id, description, type, measure_id, process_id, name) FROM stdin;
    public       postgres    false    261   L�      �          0    139989 	   mdprocess 
   TABLE DATA               N  COPY public.mdprocess (process_id, process_order, product_id, stage_id, historical_decrease, theoretical_decrease, historical_weight, theoretical_weight, historical_duration, theoretical_duration, visible, name, predecessor_id, capacity, breed_id, gender, fattening_goal, type_posture, biological_active, sync_considered) FROM stdin;
    public       postgres    false    263   i�      �          0    139995 	   mdproduct 
   TABLE DATA               O   COPY public.mdproduct (product_id, code, name, breed_id, stage_id) FROM stdin;
    public       postgres    false    265   ��      �          0    140001    mdrol 
   TABLE DATA               T   COPY public.mdrol (rol_id, rol_name, admin_user_creator, creation_date) FROM stdin;
    public       postgres    false    267   ��      �          0    140007 
   mdscenario 
   TABLE DATA               b   COPY public.mdscenario (scenario_id, description, date_start, date_end, name, status) FROM stdin;
    public       postgres    false    269   ��      �          0    140017    mdshedstatus 
   TABLE DATA               I   COPY public.mdshedstatus (shed_status_id, name, description) FROM stdin;
    public       postgres    false    271   �      �          0    140023    mdstage 
   TABLE DATA               9   COPY public.mdstage (stage_id, order_, name) FROM stdin;
    public       postgres    false    273   }�      �          0    140029    mduser 
   TABLE DATA                  COPY public.mduser (user_id, username, password, name, lastname, active, admi_user_creator, rol_id, creation_date) FROM stdin;
    public       postgres    false    275   ��      �          0    140036    osadjustmentscontrol 
   TABLE DATA               p   COPY public.osadjustmentscontrol (adjustmentscontrol_id, username, adjustment_date, os_type, os_id) FROM stdin;
    public       postgres    false    276   �       �          0    140044    oscenter 
   TABLE DATA               g   COPY public.oscenter (center_id, partnership_id, farm_id, name, code, "order", os_disable) FROM stdin;
    public       postgres    false    278   �       �          0    140048    osfarm 
   TABLE DATA               g   COPY public.osfarm (farm_id, partnership_id, code, name, farm_type_id, _order, os_disable) FROM stdin;
    public       postgres    false    279   �       �          0    140052    osincubator 
   TABLE DATA               �   COPY public.osincubator (incubator_id, incubator_plant_id, name, code, description, capacity, sunday, monday, tuesday, wednesday, thursday, friday, saturday, available, os_disable, _order) FROM stdin;
    public       postgres    false    280   �       �          0    140056    osincubatorplant 
   TABLE DATA               �   COPY public.osincubatorplant (incubator_plant_id, name, code, description, partnership_id, max_storage, min_storage, acclimatized, suitable, expired, os_disable) FROM stdin;
    public       postgres    false    281   �       �          0    140062    ospartnership 
   TABLE DATA               e   COPY public.ospartnership (partnership_id, name, address, description, code, os_disable) FROM stdin;
    public       postgres    false    283         �          0    140071    osshed 
   TABLE DATA               O  COPY public.osshed (shed_id, partnership_id, farm_id, center_id, code, statusshed_id, type_id, building_date, stall_width, stall_height, capacity_min, capacity_max, environment_id, rotation_days, nests_quantity, cages_quantity, birds_quantity, capacity_theoretical, avaliable_date, _order, breed_id, os_disable, rehousing) FROM stdin;
    public       postgres    false    285   /      �          0    140082    osslaughterhouse 
   TABLE DATA               u   COPY public.osslaughterhouse (slaughterhouse_id, name, address, description, code, capacity, os_disable) FROM stdin;
    public       postgres    false    287   L      �          0    140117    slmdevictionpartition 
   TABLE DATA               �   COPY public.slmdevictionpartition (slevictionpartition_id, youngmale, oldmale, peasantmale, youngfemale, oldfemale, active, sl_disable, name) FROM stdin;
    public       postgres    false    302   i      �          0    140124    slmdgenderclassification 
   TABLE DATA               �   COPY public.slmdgenderclassification (slgenderclassification_id, gender, breed_id, weight_gain, age, mortality, sl_disable, name) FROM stdin;
    public       postgres    false    303   �      �          0    140131    slmdmachinegroup 
   TABLE DATA               �   COPY public.slmdmachinegroup (slmachinegroup_id, incubatorplant_id, name, description, amount_of_charge, charges, sunday, monday, tuesday, wednesday, thursday, friday, saturday, sl_disable) FROM stdin;
    public       postgres    false    304   �      �          0    140140    slmdprocess 
   TABLE DATA               �   COPY public.slmdprocess (slprocess_id, stage_id, breed_id, decrease, duration_process, sync_considered, sl_disable, name) FROM stdin;
    public       postgres    false    306   �      �          0    140149 
   sltxb_shed 
   TABLE DATA               T   COPY public.sltxb_shed (slb_shed_id, slbreeding_id, center_id, shed_id) FROM stdin;
    public       postgres    false    308   �      �          0    140155    sltxbr_shed 
   TABLE DATA               a   COPY public.sltxbr_shed (slbr_shed_id, slbroiler_detail_id, center_id, shed_id, lot) FROM stdin;
    public       postgres    false    310   �      �          0    140164    sltxbreeding 
   TABLE DATA                 COPY public.sltxbreeding (slbreeding_id, stage_id, scenario_id, partnership_id, breed_id, farm_id, programmed_quantity, execution_quantity, housing_date, execution_date, start_posture_date, mortality, associated, decrease, duration, sl_disable, lot) FROM stdin;
    public       postgres    false    312         �          0    140173    sltxbroiler 
   TABLE DATA               �   COPY public.sltxbroiler (slbroiler_id, scheduled_date, scheduled_quantity, real_quantity, gender, incubatorplant_id, sl_disable, slincubator_detail_id) FROM stdin;
    public       postgres    false    314   4      �          0    140179    sltxbroiler_detail 
   TABLE DATA                  COPY public.sltxbroiler_detail (slbroiler_detail_id, farm_id, housing_date, housing_quantity, eviction_date, eviction_quantity, category, age, weightgain, youngmale, oldmale, youngfemale, oldfemale, synchronized, lot, order_p, executed, sl_disable, slbroiler_id, peasantmale) FROM stdin;
    public       postgres    false    316   Q      �          0    140186    sltxbroiler_lot 
   TABLE DATA               �   COPY public.sltxbroiler_lot (slbroiler_lot_id, slbroiler_detail_id, slbroiler_id, quantity, sl_disable, slsellspurchase_id, gender) FROM stdin;
    public       postgres    false    317   n      �          0    140193    sltxincubator 
   TABLE DATA               �   COPY public.sltxincubator (slincubator, scenario_id, incubatorplant_id, scheduled_date, scheduled_quantity, eggsrequired, sl_disable) FROM stdin;
    public       postgres    false    320   �      �          0    140197    sltxincubator_curve 
   TABLE DATA               |   COPY public.sltxincubator_curve (slincubator_curve_id, slposturecurve_id, slincubator_id, quantity, sl_disable) FROM stdin;
    public       postgres    false    321   �      �          0    140204    sltxincubator_detail 
   TABLE DATA               �   COPY public.sltxincubator_detail (slincubator_detail_id, incubator_id, programmed_date, slmachinegroup_id, programmed_quantity, associated, decrease, real_decrease, duration, sl_disable, identifier) FROM stdin;
    public       postgres    false    324   �      �          0    140211    sltxincubator_lot 
   TABLE DATA               �   COPY public.sltxincubator_lot (slincubator_lot_id, slincubator_detail_id, slincubator_curve_id, quantity, sl_disable, slsellspurchase_id) FROM stdin;
    public       postgres    false    325   �      �          0    140218    sltxinventory 
   TABLE DATA               v   COPY public.sltxinventory (slinventory_id, scenario_id, week_date, execution_eggs, execution_plexus_eggs) FROM stdin;
    public       postgres    false    328   �      �          0    140224    sltxlb_shed 
   TABLE DATA               Z   COPY public.sltxlb_shed (sllb_shed_id, slliftbreeding_id, center_id, shed_id) FROM stdin;
    public       postgres    false    330         �          0    140230    sltxliftbreeding 
   TABLE DATA               �   COPY public.sltxliftbreeding (slliftbreeding_id, stage_id, scenario_id, partnership_id, breed_id, farm_id, scheduled_date, execution_date, demand_birds, received_birds, associated, decrease, duration, sl_disable, slbreeding_id) FROM stdin;
    public       postgres    false    332   9      �          0    140236    sltxposturecurve 
   TABLE DATA               �   COPY public.sltxposturecurve (slposturecurve_id, scenario_id, breed_id, weekly_curve, posture_date, posture_quantity, associated, sl_disable, slbreeding_id) FROM stdin;
    public       postgres    false    334   V      �          0    140242    sltxsellspurchase 
   TABLE DATA               �   COPY public.sltxsellspurchase (slsellspurchase_id, scenario_id, programmed_date, quantity, breed_id, sl_disable, concept, type, description, lot) FROM stdin;
    public       postgres    false    336   s      �          0    140249    txadjustmentscontrol 
   TABLE DATA               v   COPY public.txadjustmentscontrol (adjustmentscontrol_id, username, adjustment_date, lot_arp, description) FROM stdin;
    public       postgres    false    337   �      �          0    140257    txavailabilitysheds 
   TABLE DATA               k   COPY public.txavailabilitysheds (availability_shed_id, shed_id, init_date, end_date, lot_code) FROM stdin;
    public       postgres    false    339   �      �          0    140261 	   txbroiler 
   TABLE DATA               �   COPY public.txbroiler (broiler_id, projected_date, projected_quantity, partnership_id, scenario_id, breed_id, lot_incubator, programmed_eggs_id, evictionprojected) FROM stdin;
    public       postgres    false    340   �      �          0    140265    txbroiler_detail 
   TABLE DATA               Y  COPY public.txbroiler_detail (broiler_detail_id, broiler_id, scheduled_date, scheduled_quantity, farm_id, shed_id, confirm, execution_date, execution_quantity, lot, broiler_product_id, center_id, executionfarm_id, executioncenter_id, executionshed_id, programmed_disable, synchronized, order_p, lot_sap, tight, eviction, closed_lot) FROM stdin;
    public       postgres    false    341   �      �          0    140272    txbroiler_lot 
   TABLE DATA               `   COPY public.txbroiler_lot (broiler_lot_id, broiler_detail_id, broiler_id, quantity) FROM stdin;
    public       postgres    false    342         �          0    140277    txbroilereviction 
   TABLE DATA               �   COPY public.txbroilereviction (broilereviction_id, projected_date, projected_quantity, partnership_id, scenario_id, breed_id, lot_incubator, broiler_detail_id, evictionprojected, broiler_heavy_detail_id) FROM stdin;
    public       postgres    false    344   !      �          0    140281    txbroilereviction_detail 
   TABLE DATA               X  COPY public.txbroilereviction_detail (broilereviction_detail_id, broilereviction_id, scheduled_date, scheduled_quantity, farm_id, shed_id, confirm, execution_date, execution_quantity, lot, broiler_product_id, slaughterhouse_id, center_id, executionslaughterhouse_id, programmed_disable, synchronized, order_p, eviction, closed_lot) FROM stdin;
    public       postgres    false    345   >      �          0    140288    txbroilerheavy_detail 
   TABLE DATA                 COPY public.txbroilerheavy_detail (broiler_heavy_detail_id, programmed_date, programmed_quantity, broiler_detail_id, broiler_product_id, lot, execution_date, execution_quantity, closed_lot, programmed_disable, synchronized, tight, order_p, lot_sap, eviction) FROM stdin;
    public       postgres    false    346   [      �          0    140296    txbroilerproduct_detail 
   TABLE DATA               y   COPY public.txbroilerproduct_detail (broilerproduct_detail_id, broiler_detail, broiler_product_id, quantity) FROM stdin;
    public       postgres    false    348   x      �          0    140300    txbroodermachine 
   TABLE DATA               �   COPY public.txbroodermachine (brooder_machine_id_seq, partnership_id, farm_id, capacity, sunday, monday, tuesday, wednesday, thursday, friday, saturday, name) FROM stdin;
    public       postgres    false    349   �      �          0    140314    txeggs_movements 
   TABLE DATA               �   COPY public.txeggs_movements (eggs_movements_id, fecha_movements, lot, quantity, type_movements, eggs_storage_id, description_adjustment, justification, programmed_eggs_id, programmed_disable) FROM stdin;
    public       postgres    false    351   �      �          0    140321    txeggs_planning 
   TABLE DATA               y   COPY public.txeggs_planning (egg_planning_id, month_planning, year_planning, scenario_id, planned, breed_id) FROM stdin;
    public       postgres    false    352   �      �          0    140325    txeggs_required 
   TABLE DATA               p   COPY public.txeggs_required (egg_required_id, use_month, use_year, scenario_id, required, breed_id) FROM stdin;
    public       postgres    false    353   �      �          0    140329    txeggs_storage 
   TABLE DATA               �   COPY public.txeggs_storage (eggs_storage_id, incubator_plant_id, scenario_id, breed_id, init_date, end_date, lot, eggs, eggs_executed, origin, synchronized, lot_sap, evictionprojected) FROM stdin;
    public       postgres    false    354   	      �          0    140336    txgoals_erp 
   TABLE DATA               g   COPY public.txgoals_erp (goals_erp_id, use_week, use_value, product_id, code, scenario_id) FROM stdin;
    public       postgres    false    355   &      �          0    140341    txhousingway 
   TABLE DATA               �   COPY public.txhousingway (housing_way_id, projected_quantity, projected_date, stage_id, partnership_id, scenario_id, breed_id, predecessor_id, projected_disable, evictionprojected) FROM stdin;
    public       postgres    false    357   C      �          0    140345    txhousingway_detail 
   TABLE DATA               s  COPY public.txhousingway_detail (housingway_detail_id, housing_way_id, scheduled_date, scheduled_quantity, farm_id, shed_id, confirm, execution_date, execution_quantity, lot, incubator_plant_id, center_id, executionfarm_id, executioncenter_id, executionshed_id, executionincubatorplant_id, programmed_disable, synchronized, order_p, lot_sap, tight, eviction) FROM stdin;
    public       postgres    false    358   `      �          0    140352    txhousingway_lot 
   TABLE DATA               o   COPY public.txhousingway_lot (housingway_lot_id, production_id, housingway_id, quantity, stage_id) FROM stdin;
    public       postgres    false    359   }      �          0    140357    txincubator_lot 
   TABLE DATA               l   COPY public.txincubator_lot (incubator_lot_id, programmed_eggs_id, eggs_movements_id, quantity) FROM stdin;
    public       postgres    false    361   �      �          0    140362    txincubator_sales 
   TABLE DATA               �   COPY public.txincubator_sales (incubator_sales_id, date_sale, quantity, gender, incubator_plant_id, programmed_disable, breed_id) FROM stdin;
    public       postgres    false    363   �      �          0    140367    txlot 
   TABLE DATA               �   COPY public.txlot (lot_id, lot_code, lot_origin, status, proyected_date, sheduled_date, proyected_quantity, sheduled_quantity, released_quantity, product_id, breed_id, gender, type_posture, shed_id, origin, farm_id, housing_way_id) FROM stdin;
    public       postgres    false    365   �      �          0    140371 
   txlot_eggs 
   TABLE DATA               Y   COPY public.txlot_eggs (lot_eggs_id, theorical_performance, week_date, week) FROM stdin;
    public       postgres    false    366   �      �          0    140375    txposturecurve 
   TABLE DATA               �   COPY public.txposturecurve (posture_curve_id, week, breed_id, theorical_performance, historical_performance, theorical_accum_mortality, historical_accum_mortality, theorical_uniformity, historical_uniformity, type_posture) FROM stdin;
    public       postgres    false    367         �          0    140379    txprogrammed_eggs 
   TABLE DATA                 COPY public.txprogrammed_eggs (programmed_eggs_id, incubator_id, lot_breed, lot_incubator, use_date, eggs, breed_id, execution_quantity, eggs_storage_id, confirm, released, eggs_movements_id, disable, synchronized, order_p, lot_sap, end_lot, diff_days, programmed_disable) FROM stdin;
    public       postgres    false    368   +      �          0    140386    txscenarioformula 
   TABLE DATA               �   COPY public.txscenarioformula (scenario_formula_id, process_id, predecessor_id, parameter_id, sign, divider, duration, scenario_id, measure_id) FROM stdin;
    public       postgres    false    369   H      �          0    140390    txscenarioparameter 
   TABLE DATA               �   COPY public.txscenarioparameter (scenario_parameter_id, process_id, parameter_id, use_year, use_month, use_value, scenario_id, value_units) FROM stdin;
    public       postgres    false    370   e      �          0    140395    txscenarioparameterday 
   TABLE DATA               �   COPY public.txscenarioparameterday (scenario_parameter_day_id, use_day, parameter_id, units_day, scenario_id, sequence, use_month, use_year, week_day, use_week) FROM stdin;
    public       postgres    false    371   �      �          0    140399    txscenarioposturecurve 
   TABLE DATA               �   COPY public.txscenarioposturecurve (scenario_posture_id, posture_date, eggs, scenario_id, housingway_detail_id, breed_id) FROM stdin;
    public       postgres    false    372   �      �          0    140403    txscenarioprocess 
   TABLE DATA               �   COPY public.txscenarioprocess (scenario_process_id, process_id, decrease_goal, weight_goal, duration_goal, scenario_id) FROM stdin;
    public       postgres    false    373   �      �          0    140407    txsync 
   TABLE DATA               �   COPY public.txsync (sync_id, lot, scheduled_date, scheduled_quantity, farm_code, shed_code, execution_date, execution_quantity, is_error) FROM stdin;
    public       postgres    false    374   �      �           0    0    abaTimeUnit_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public."abaTimeUnit_id_seq"', 1, true);
            public       postgres    false    196            �           0    0    aba_breeds_and_stages_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.aba_breeds_and_stages_id_seq', 1, true);
            public       postgres    false    197            �           0    0 +   aba_consumption_and_mortality_detail_id_seq    SEQUENCE SET     Y   SELECT pg_catalog.setval('public.aba_consumption_and_mortality_detail_id_seq', 1, true);
            public       postgres    false    201            �           0    0 $   aba_consumption_and_mortality_id_seq    SEQUENCE SET     R   SELECT pg_catalog.setval('public.aba_consumption_and_mortality_id_seq', 1, true);
            public       postgres    false    199            �           0    0 &   aba_elements_and_concentrations_id_seq    SEQUENCE SET     T   SELECT pg_catalog.setval('public.aba_elements_and_concentrations_id_seq', 1, true);
            public       postgres    false    205            �           0    0    aba_elements_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.aba_elements_id_seq', 1, true);
            public       postgres    false    203            �           0    0    aba_elements_properties_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.aba_elements_properties_id_seq', 1, false);
            public       postgres    false    207            �           0    0    aba_formulation_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.aba_formulation_id_seq', 1, true);
            public       postgres    false    209            �           0    0    aba_results_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.aba_results_id_seq', 1, false);
            public       postgres    false    211            �           0    0 &   aba_stages_of_breeds_and_stages_id_seq    SEQUENCE SET     T   SELECT pg_catalog.setval('public.aba_stages_of_breeds_and_stages_id_seq', 1, true);
            public       postgres    false    212            �           0    0    availability_shed_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.availability_shed_id_seq', 1, false);
            public       postgres    false    215            �           0    0    base_day_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.base_day_id_seq', 1, false);
            public       postgres    false    216            �           0    0    breed_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.breed_id_seq', 1, false);
            public       postgres    false    217            �           0    0    broiler_detail_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.broiler_detail_id_seq', 1, false);
            public       postgres    false    218            �           0    0    broiler_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.broiler_id_seq', 1, false);
            public       postgres    false    219            �           0    0    broiler_product_detail_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.broiler_product_detail_id_seq', 1, false);
            public       postgres    false    220            �           0    0    broiler_product_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.broiler_product_id_seq', 1, false);
            public       postgres    false    221            �           0    0    broilereviction_detail_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('public.broilereviction_detail_id_seq', 124, false);
            public       postgres    false    222            �           0    0    broilereviction_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.broilereviction_id_seq', 70, false);
            public       postgres    false    223            �           0    0    brooder_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.brooder_id_seq', 1, false);
            public       postgres    false    224            �           0    0    brooder_machines_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.brooder_machines_id_seq', 1, false);
            public       postgres    false    225            �           0    0    calendar_day_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.calendar_day_id_seq', 1, false);
            public       postgres    false    226            �           0    0    calendar_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.calendar_id_seq', 1, false);
            public       postgres    false    227            �           0    0    center_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.center_id_seq', 1, false);
            public       postgres    false    228            �           0    0    egg_planning_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.egg_planning_id_seq', 1, false);
            public       postgres    false    229            �           0    0    egg_required_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.egg_required_id_seq', 1, false);
            public       postgres    false    230            �           0    0    eggs_storage_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.eggs_storage_id_seq', 1, false);
            public       postgres    false    231            �           0    0    farm_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.farm_id_seq', 1, false);
            public       postgres    false    232            �           0    0    farm_type_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.farm_type_id_seq', 3, true);
            public       postgres    false    233            �           0    0    holiday_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.holiday_id_seq', 1, false);
            public       postgres    false    234            �           0    0    housing_way_detail_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.housing_way_detail_id_seq', 1, false);
            public       postgres    false    235            �           0    0    housing_way_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.housing_way_id_seq', 1, false);
            public       postgres    false    236            �           0    0    incubator_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.incubator_id_seq', 1, false);
            public       postgres    false    237            �           0    0    incubator_plant_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.incubator_plant_id_seq', 1, false);
            public       postgres    false    238            �           0    0    industry_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.industry_id_seq', 1, false);
            public       postgres    false    239            �           0    0    line_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.line_id_seq', 1, false);
            public       postgres    false    240            �           0    0    lot_eggs_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.lot_eggs_id_seq', 1, false);
            public       postgres    false    241            �           0    0    lot_fattening_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.lot_fattening_id_seq', 1, false);
            public       postgres    false    242            �           0    0 
   lot_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.lot_id_seq', 1, false);
            public       postgres    false    243            �           0    0    lot_liftbreeding_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.lot_liftbreeding_id_seq', 1, false);
            public       postgres    false    244            �           0    0 0   md_optimizer_parameter_optimizerparameter_id_seq    SEQUENCE SET     _   SELECT pg_catalog.setval('public.md_optimizer_parameter_optimizerparameter_id_seq', 1, false);
            public       postgres    false    246            �           0    0    mdadjustment_adjustment_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.mdadjustment_adjustment_id_seq', 6, true);
            public       postgres    false    248            �           0    0     mdapplication_application_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.mdapplication_application_id_seq', 20, true);
            public       postgres    false    249            �           0    0    mdapplication_rol_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.mdapplication_rol_id_seq', 24, true);
            public       postgres    false    251            �           0    0 .   mdequivalenceproduct_equivalenceproduct_id_seq    SEQUENCE SET     \   SELECT pg_catalog.setval('public.mdequivalenceproduct_equivalenceproduct_id_seq', 4, true);
            public       postgres    false    256            �           0    0    mdrol_rol_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.mdrol_rol_id_seq', 2, true);
            public       postgres    false    266            �           0    0    mduser_user_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.mduser_user_id_seq', 2, true);
            public       postgres    false    274            �           0    0    measure_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.measure_id_seq', 2, true);
            public       postgres    false    258            �           0    0 .   osadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE SET     ]   SELECT pg_catalog.setval('public.osadjustmentscontrol_adjustmentscontrol_id_seq', 1, false);
            public       postgres    false    277            �           0    0    parameter_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.parameter_id_seq', 1, false);
            public       postgres    false    260            �           0    0    partnership_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.partnership_id_seq', 1, false);
            public       postgres    false    282            �           0    0    posture_curve_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.posture_curve_id_seq', 1, false);
            public       postgres    false    288            �           0    0    predecessor_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.predecessor_id_seq', 1, false);
            public       postgres    false    289            �           0    0    process_class_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.process_class_id_seq', 1, false);
            public       postgres    false    290            �           0    0    process_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.process_id_seq', 1, false);
            public       postgres    false    262            �           0    0    product_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.product_id_seq', 1, false);
            public       postgres    false    264            �           0    0    programmed_eggs_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.programmed_eggs_id_seq', 1, false);
            public       postgres    false    291            �           0    0    raspberry_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.raspberry_id_seq', 1, false);
            public       postgres    false    292            �           0    0    scenario_formula_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.scenario_formula_id_seq', 1, false);
            public       postgres    false    293            �           0    0    scenario_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.scenario_id_seq', 1, false);
            public       postgres    false    268            �           0    0    scenario_parameter_day_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.scenario_parameter_day_seq', 1, false);
            public       postgres    false    294            �           0    0    scenario_parameter_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.scenario_parameter_id_seq', 1, false);
            public       postgres    false    295            �           0    0    scenario_posture_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.scenario_posture_id_seq', 1, false);
            public       postgres    false    296            �           0    0    scenario_process_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.scenario_process_id_seq', 1, false);
            public       postgres    false    297            �           0    0    shed_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.shed_id_seq', 1, false);
            public       postgres    false    284            �           0    0    silo_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.silo_id_seq', 1, false);
            public       postgres    false    298            �           0    0    slaughterhouse_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.slaughterhouse_id_seq', 33, false);
            public       postgres    false    286            �           0    0    slevictionpartition_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.slevictionpartition_id_seq', 1, false);
            public       postgres    false    299            �           0    0    slgenderclassification_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.slgenderclassification_id_seq', 1, false);
            public       postgres    false    300            �           0    0    slmachinegroup_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.slmachinegroup_id_seq', 1, false);
            public       postgres    false    301            �           0    0    slprocess_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.slprocess_id_seq', 1, false);
            public       postgres    false    305            �           0    0    sltxb_shed_slb_shed_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.sltxb_shed_slb_shed_id_seq', 1, false);
            public       postgres    false    307            �           0    0    sltxbr_shed_slbr_shed_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.sltxbr_shed_slbr_shed_id_seq', 1, false);
            public       postgres    false    309            �           0    0    sltxbreeding_slbreeding_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.sltxbreeding_slbreeding_id_seq', 1, false);
            public       postgres    false    311            �           0    0 *   sltxbroiler_detail_slbroiler_detail_id_seq    SEQUENCE SET     Y   SELECT pg_catalog.setval('public.sltxbroiler_detail_slbroiler_detail_id_seq', 1, false);
            public       postgres    false    315            �           0    0 $   sltxbroiler_lot_slbroiler_lot_id_seq    SEQUENCE SET     S   SELECT pg_catalog.setval('public.sltxbroiler_lot_slbroiler_lot_id_seq', 1, false);
            public       postgres    false    318            �           0    0    sltxbroiler_slbroiler_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.sltxbroiler_slbroiler_id_seq', 1, false);
            public       postgres    false    313            �           0    0 ,   sltxincubator_curve_slincubator_curve_id_seq    SEQUENCE SET     [   SELECT pg_catalog.setval('public.sltxincubator_curve_slincubator_curve_id_seq', 1, false);
            public       postgres    false    322            �           0    0 .   sltxincubator_detail_slincubator_detail_id_seq    SEQUENCE SET     ]   SELECT pg_catalog.setval('public.sltxincubator_detail_slincubator_detail_id_seq', 1, false);
            public       postgres    false    323            �           0    0 (   sltxincubator_lot_slincubator_lot_id_seq    SEQUENCE SET     W   SELECT pg_catalog.setval('public.sltxincubator_lot_slincubator_lot_id_seq', 1, false);
            public       postgres    false    326            �           0    0    sltxincubator_slincubator_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.sltxincubator_slincubator_seq', 1, false);
            public       postgres    false    319            �           0    0     sltxinventory_slinventory_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.sltxinventory_slinventory_id_seq', 1, false);
            public       postgres    false    327            �           0    0    sltxlb_shed_sllb_shed_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.sltxlb_shed_sllb_shed_id_seq', 1, false);
            public       postgres    false    329            �           0    0 &   sltxliftbreeding_slliftbreeding_id_seq    SEQUENCE SET     U   SELECT pg_catalog.setval('public.sltxliftbreeding_slliftbreeding_id_seq', 1, false);
            public       postgres    false    331            �           0    0 &   sltxposturecurve_slposturecurve_id_seq    SEQUENCE SET     U   SELECT pg_catalog.setval('public.sltxposturecurve_slposturecurve_id_seq', 1, false);
            public       postgres    false    333            �           0    0 (   sltxsellspurchase_slsellspurchase_id_seq    SEQUENCE SET     W   SELECT pg_catalog.setval('public.sltxsellspurchase_slsellspurchase_id_seq', 1, false);
            public       postgres    false    335            �           0    0    stage_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.stage_id_seq', 10, true);
            public       postgres    false    272            �           0    0    status_shed_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.status_shed_id_seq', 6, true);
            public       postgres    false    270            �           0    0 .   txadjustmentscontrol_adjustmentscontrol_id_seq    SEQUENCE SET     ]   SELECT pg_catalog.setval('public.txadjustmentscontrol_adjustmentscontrol_id_seq', 1, false);
            public       postgres    false    338            �           0    0     txbroiler_lot_broiler_lot_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.txbroiler_lot_broiler_lot_id_seq', 1, false);
            public       postgres    false    343            �           0    0 1   txbroilerheavy_detail_broiler_heavy_detail_id_seq    SEQUENCE SET     `   SELECT pg_catalog.setval('public.txbroilerheavy_detail_broiler_heavy_detail_id_seq', 1, false);
            public       postgres    false    347            �           0    0    txeggs_movements_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.txeggs_movements_id_seq', 170, false);
            public       postgres    false    350            �           0    0    txgoals_erp_goals_erp_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.txgoals_erp_goals_erp_id_seq', 1, false);
            public       postgres    false    356            �           0    0 %   txhousingway_lot_txhousingway_lot_seq    SEQUENCE SET     T   SELECT pg_catalog.setval('public.txhousingway_lot_txhousingway_lot_seq', 1, false);
            public       postgres    false    360            �           0    0 $   txincubator_lot_incubator_lot_id_seq    SEQUENCE SET     S   SELECT pg_catalog.setval('public.txincubator_lot_incubator_lot_id_seq', 1, false);
            public       postgres    false    362            �           0    0 (   txincubator_sales_incubator_sales_id_seq    SEQUENCE SET     W   SELECT pg_catalog.setval('public.txincubator_sales_incubator_sales_id_seq', 1, false);
            public       postgres    false    364            �           0    0    txsync_sync_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.txsync_sync_id_seq', 1, false);
            public       postgres    false    375            �           0    0 #   user_application_application_id_seq    SEQUENCE SET     R   SELECT pg_catalog.setval('public.user_application_application_id_seq', 1, false);
            public       postgres    false    376            �           0    0     user_application_user_app_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('public.user_application_user_app_id_seq', 215, false);
            public       postgres    false    377            �           0    0    user_application_user_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.user_application_user_id_seq', 1, false);
            public       postgres    false    378            �           0    0    warehouse_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.warehouse_id_seq', 1, false);
            public       postgres    false    379                       2606    140439    aba_time_unit abaTimeUnit_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.aba_time_unit
    ADD CONSTRAINT "abaTimeUnit_pkey" PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.aba_time_unit DROP CONSTRAINT "abaTimeUnit_pkey";
       public         postgres    false    214            �           2606    140441 0   aba_breeds_and_stages aba_breeds_and_stages_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public.aba_breeds_and_stages
    ADD CONSTRAINT aba_breeds_and_stages_pkey PRIMARY KEY (id);
 Z   ALTER TABLE ONLY public.aba_breeds_and_stages DROP CONSTRAINT aba_breeds_and_stages_pkey;
       public         postgres    false    198                        2606    140443 N   aba_consumption_and_mortality_detail aba_consumption_and_mortality_detail_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.aba_consumption_and_mortality_detail
    ADD CONSTRAINT aba_consumption_and_mortality_detail_pkey PRIMARY KEY (id);
 x   ALTER TABLE ONLY public.aba_consumption_and_mortality_detail DROP CONSTRAINT aba_consumption_and_mortality_detail_pkey;
       public         postgres    false    202            �           2606    140445 @   aba_consumption_and_mortality aba_consumption_and_mortality_pkey 
   CONSTRAINT     ~   ALTER TABLE ONLY public.aba_consumption_and_mortality
    ADD CONSTRAINT aba_consumption_and_mortality_pkey PRIMARY KEY (id);
 j   ALTER TABLE ONLY public.aba_consumption_and_mortality DROP CONSTRAINT aba_consumption_and_mortality_pkey;
       public         postgres    false    200                       2606    140447 D   aba_elements_and_concentrations aba_elements_and_concentrations_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.aba_elements_and_concentrations
    ADD CONSTRAINT aba_elements_and_concentrations_pkey PRIMARY KEY (id);
 n   ALTER TABLE ONLY public.aba_elements_and_concentrations DROP CONSTRAINT aba_elements_and_concentrations_pkey;
       public         postgres    false    206                       2606    140449    aba_elements aba_elements_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.aba_elements
    ADD CONSTRAINT aba_elements_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.aba_elements DROP CONSTRAINT aba_elements_pkey;
       public         postgres    false    204            	           2606    140451 4   aba_elements_properties aba_elements_properties_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.aba_elements_properties
    ADD CONSTRAINT aba_elements_properties_pkey PRIMARY KEY (id);
 ^   ALTER TABLE ONLY public.aba_elements_properties DROP CONSTRAINT aba_elements_properties_pkey;
       public         postgres    false    208                       2606    140453 $   aba_formulation aba_formulation_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.aba_formulation
    ADD CONSTRAINT aba_formulation_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.aba_formulation DROP CONSTRAINT aba_formulation_pkey;
       public         postgres    false    210                       2606    140455 D   aba_stages_of_breeds_and_stages aba_stages_of_breeds_and_stages_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages
    ADD CONSTRAINT aba_stages_of_breeds_and_stages_pkey PRIMARY KEY (id);
 n   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages DROP CONSTRAINT aba_stages_of_breeds_and_stages_pkey;
       public         postgres    false    213                       2606    140457    mdapplication application_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.mdapplication
    ADD CONSTRAINT application_pkey PRIMARY KEY (application_id);
 H   ALTER TABLE ONLY public.mdapplication DROP CONSTRAINT application_pkey;
       public         postgres    false    250                       2606    140459 2   md_optimizer_parameter md_optimizer_parameter_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.md_optimizer_parameter
    ADD CONSTRAINT md_optimizer_parameter_pkey PRIMARY KEY (optimizerparameter_id);
 \   ALTER TABLE ONLY public.md_optimizer_parameter DROP CONSTRAINT md_optimizer_parameter_pkey;
       public         postgres    false    245                       2606    140461 (   mdapplication_rol mdapplication_rol_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.mdapplication_rol
    ADD CONSTRAINT mdapplication_rol_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.mdapplication_rol DROP CONSTRAINT mdapplication_rol_pkey;
       public         postgres    false    252                       2606    140463    mdbreed mdbreed_code_key 
   CONSTRAINT     S   ALTER TABLE ONLY public.mdbreed
    ADD CONSTRAINT mdbreed_code_key UNIQUE (code);
 B   ALTER TABLE ONLY public.mdbreed DROP CONSTRAINT mdbreed_code_key;
       public         postgres    false    253                       2606    140465    mdbreed mdbreed_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.mdbreed
    ADD CONSTRAINT mdbreed_pkey PRIMARY KEY (breed_id);
 >   ALTER TABLE ONLY public.mdbreed DROP CONSTRAINT mdbreed_pkey;
       public         postgres    false    253                       2606    140467 (   mdbroiler_product mdbroiler_product_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.mdbroiler_product
    ADD CONSTRAINT mdbroiler_product_pkey PRIMARY KEY (broiler_product_id);
 R   ALTER TABLE ONLY public.mdbroiler_product DROP CONSTRAINT mdbroiler_product_pkey;
       public         postgres    false    254            !           2606    140469 .   mdequivalenceproduct mdequivalenceproduct_pkey 
   CONSTRAINT        ALTER TABLE ONLY public.mdequivalenceproduct
    ADD CONSTRAINT mdequivalenceproduct_pkey PRIMARY KEY (equivalenceproduct_id);
 X   ALTER TABLE ONLY public.mdequivalenceproduct DROP CONSTRAINT mdequivalenceproduct_pkey;
       public         postgres    false    255            #           2606    140471    mdfarmtype mdfarmtype_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.mdfarmtype
    ADD CONSTRAINT mdfarmtype_pkey PRIMARY KEY (farm_type_id);
 D   ALTER TABLE ONLY public.mdfarmtype DROP CONSTRAINT mdfarmtype_pkey;
       public         postgres    false    257            %           2606    140473    mdmeasure mdmeasure_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.mdmeasure
    ADD CONSTRAINT mdmeasure_pkey PRIMARY KEY (measure_id);
 B   ALTER TABLE ONLY public.mdmeasure DROP CONSTRAINT mdmeasure_pkey;
       public         postgres    false    259            )           2606    140475    mdparameter mdparameter_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.mdparameter
    ADD CONSTRAINT mdparameter_pkey PRIMARY KEY (parameter_id);
 F   ALTER TABLE ONLY public.mdparameter DROP CONSTRAINT mdparameter_pkey;
       public         postgres    false    261            .           2606    140477    mdprocess mdprocess_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.mdprocess
    ADD CONSTRAINT mdprocess_pkey PRIMARY KEY (process_id);
 B   ALTER TABLE ONLY public.mdprocess DROP CONSTRAINT mdprocess_pkey;
       public         postgres    false    263            0           2606    140479    mdproduct mdproduct_code_unique 
   CONSTRAINT     Z   ALTER TABLE ONLY public.mdproduct
    ADD CONSTRAINT mdproduct_code_unique UNIQUE (code);
 I   ALTER TABLE ONLY public.mdproduct DROP CONSTRAINT mdproduct_code_unique;
       public         postgres    false    265            2           2606    140481    mdproduct mdproduct_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.mdproduct
    ADD CONSTRAINT mdproduct_pkey PRIMARY KEY (product_id);
 B   ALTER TABLE ONLY public.mdproduct DROP CONSTRAINT mdproduct_pkey;
       public         postgres    false    265            8           2606    140483 !   mdscenario mdscenario_name_unique 
   CONSTRAINT     \   ALTER TABLE ONLY public.mdscenario
    ADD CONSTRAINT mdscenario_name_unique UNIQUE (name);
 K   ALTER TABLE ONLY public.mdscenario DROP CONSTRAINT mdscenario_name_unique;
       public         postgres    false    269            :           2606    140485    mdscenario mdscenario_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public.mdscenario
    ADD CONSTRAINT mdscenario_pkey PRIMARY KEY (scenario_id);
 D   ALTER TABLE ONLY public.mdscenario DROP CONSTRAINT mdscenario_pkey;
       public         postgres    false    269            <           2606    140487    mdshedstatus mdshedstatus_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.mdshedstatus
    ADD CONSTRAINT mdshedstatus_pkey PRIMARY KEY (shed_status_id);
 H   ALTER TABLE ONLY public.mdshedstatus DROP CONSTRAINT mdshedstatus_pkey;
       public         postgres    false    271            >           2606    140489    mdstage mdstage_name_unique 
   CONSTRAINT     V   ALTER TABLE ONLY public.mdstage
    ADD CONSTRAINT mdstage_name_unique UNIQUE (name);
 E   ALTER TABLE ONLY public.mdstage DROP CONSTRAINT mdstage_name_unique;
       public         postgres    false    273            @           2606    140491    mdstage mdstage_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.mdstage
    ADD CONSTRAINT mdstage_pkey PRIMARY KEY (stage_id);
 >   ALTER TABLE ONLY public.mdstage DROP CONSTRAINT mdstage_pkey;
       public         postgres    false    273            C           2606    140493    mduser mduser_user_id_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.mduser
    ADD CONSTRAINT mduser_user_id_pkey PRIMARY KEY (user_id);
 D   ALTER TABLE ONLY public.mduser DROP CONSTRAINT mduser_user_id_pkey;
       public         postgres    false    275            E           2606    140495    mduser mduser_username_unique 
   CONSTRAINT     \   ALTER TABLE ONLY public.mduser
    ADD CONSTRAINT mduser_username_unique UNIQUE (username);
 G   ALTER TABLE ONLY public.mduser DROP CONSTRAINT mduser_username_unique;
       public         postgres    false    275            G           2606    140497 .   osadjustmentscontrol osadjustmentscontrol_pkey 
   CONSTRAINT        ALTER TABLE ONLY public.osadjustmentscontrol
    ADD CONSTRAINT osadjustmentscontrol_pkey PRIMARY KEY (adjustmentscontrol_id);
 X   ALTER TABLE ONLY public.osadjustmentscontrol DROP CONSTRAINT osadjustmentscontrol_pkey;
       public         postgres    false    276            K           2606    140499 "   oscenter oscenter_code_farm_id_key 
   CONSTRAINT     f   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_code_farm_id_key UNIQUE (code, farm_id);
 L   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_code_farm_id_key;
       public         postgres    false    278    278            M           2606    140501 #   oscenter oscenter_code_farm_id_key1 
   CONSTRAINT     g   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_code_farm_id_key1 UNIQUE (code, farm_id);
 M   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_code_farm_id_key1;
       public         postgres    false    278    278            O           2606    140503 .   oscenter oscenter_partnership_farm_code_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_partnership_farm_code_unique UNIQUE (partnership_id, farm_id, code);
 X   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_partnership_farm_code_unique;
       public         postgres    false    278    278    278            Q           2606    140505    oscenter oscenter_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_pkey PRIMARY KEY (center_id);
 @   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_pkey;
       public         postgres    false    278            U           2606    140507 %   osfarm osfarm_code_partnership_id_key 
   CONSTRAINT     p   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_code_partnership_id_key UNIQUE (code, partnership_id);
 O   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_code_partnership_id_key;
       public         postgres    false    279    279            W           2606    140509 &   osfarm osfarm_code_partnership_id_key1 
   CONSTRAINT     q   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_code_partnership_id_key1 UNIQUE (code, partnership_id);
 P   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_code_partnership_id_key1;
       public         postgres    false    279    279            Y           2606    140511 %   osfarm osfarm_partnership_code_unique 
   CONSTRAINT     p   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_partnership_code_unique UNIQUE (partnership_id, code);
 O   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_partnership_code_unique;
       public         postgres    false    279    279            [           2606    140513    osfarm osfarm_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_pkey PRIMARY KEY (farm_id);
 <   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_pkey;
       public         postgres    false    279            w           2606    140515    osshed oshed_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT oshed_pkey PRIMARY KEY (shed_id);
 ;   ALTER TABLE ONLY public.osshed DROP CONSTRAINT oshed_pkey;
       public         postgres    false    285            ^           2606    140517 2   osincubator osincubator_incubatorplant_code_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public.osincubator
    ADD CONSTRAINT osincubator_incubatorplant_code_unique UNIQUE (incubator_plant_id, code);
 \   ALTER TABLE ONLY public.osincubator DROP CONSTRAINT osincubator_incubatorplant_code_unique;
       public         postgres    false    280    280            `           2606    140519    osincubator osincubator_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.osincubator
    ADD CONSTRAINT osincubator_pkey PRIMARY KEY (incubator_id);
 F   ALTER TABLE ONLY public.osincubator DROP CONSTRAINT osincubator_pkey;
       public         postgres    false    280            c           2606    140521 9   osincubatorplant osincubatorplant_code_partnership_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.osincubatorplant
    ADD CONSTRAINT osincubatorplant_code_partnership_id_key UNIQUE (code, partnership_id);
 c   ALTER TABLE ONLY public.osincubatorplant DROP CONSTRAINT osincubatorplant_code_partnership_id_key;
       public         postgres    false    281    281            e           2606    140523 :   osincubatorplant osincubatorplant_code_partnership_id_key1 
   CONSTRAINT     �   ALTER TABLE ONLY public.osincubatorplant
    ADD CONSTRAINT osincubatorplant_code_partnership_id_key1 UNIQUE (code, partnership_id);
 d   ALTER TABLE ONLY public.osincubatorplant DROP CONSTRAINT osincubatorplant_code_partnership_id_key1;
       public         postgres    false    281    281            g           2606    140525 9   osincubatorplant osincubatorplant_partnership_code_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public.osincubatorplant
    ADD CONSTRAINT osincubatorplant_partnership_code_unique UNIQUE (partnership_id, code);
 c   ALTER TABLE ONLY public.osincubatorplant DROP CONSTRAINT osincubatorplant_partnership_code_unique;
       public         postgres    false    281    281            i           2606    140527 &   osincubatorplant osincubatorplant_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public.osincubatorplant
    ADD CONSTRAINT osincubatorplant_pkey PRIMARY KEY (incubator_plant_id);
 P   ALTER TABLE ONLY public.osincubatorplant DROP CONSTRAINT osincubatorplant_pkey;
       public         postgres    false    281            k           2606    140529 $   ospartnership ospartnership_code_key 
   CONSTRAINT     _   ALTER TABLE ONLY public.ospartnership
    ADD CONSTRAINT ospartnership_code_key UNIQUE (code);
 N   ALTER TABLE ONLY public.ospartnership DROP CONSTRAINT ospartnership_code_key;
       public         postgres    false    283            m           2606    140531 %   ospartnership ospartnership_code_key1 
   CONSTRAINT     `   ALTER TABLE ONLY public.ospartnership
    ADD CONSTRAINT ospartnership_code_key1 UNIQUE (code);
 O   ALTER TABLE ONLY public.ospartnership DROP CONSTRAINT ospartnership_code_key1;
       public         postgres    false    283            o           2606    140533 '   ospartnership ospartnership_code_unique 
   CONSTRAINT     b   ALTER TABLE ONLY public.ospartnership
    ADD CONSTRAINT ospartnership_code_unique UNIQUE (code);
 Q   ALTER TABLE ONLY public.ospartnership DROP CONSTRAINT ospartnership_code_unique;
       public         postgres    false    283            q           2606    140535     ospartnership ospartnership_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.ospartnership
    ADD CONSTRAINT ospartnership_pkey PRIMARY KEY (partnership_id);
 J   ALTER TABLE ONLY public.ospartnership DROP CONSTRAINT ospartnership_pkey;
       public         postgres    false    283            y           2606    140537     osshed osshed_code_center_id_key 
   CONSTRAINT     f   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_code_center_id_key UNIQUE (code, center_id);
 J   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_code_center_id_key;
       public         postgres    false    285    285            {           2606    140539 !   osshed osshed_code_center_id_key1 
   CONSTRAINT     g   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_code_center_id_key1 UNIQUE (code, center_id);
 K   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_code_center_id_key1;
       public         postgres    false    285    285            }           2606    140541 1   osshed osshed_partnership_farm_center_code_unique 
   CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_partnership_farm_center_code_unique UNIQUE (partnership_id, farm_id, center_id, code);
 [   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_partnership_farm_center_code_unique;
       public         postgres    false    285    285    285    285                       2606    140543 &   osslaughterhouse osslaughterhouse_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.osslaughterhouse
    ADD CONSTRAINT osslaughterhouse_pkey PRIMARY KEY (slaughterhouse_id);
 P   ALTER TABLE ONLY public.osslaughterhouse DROP CONSTRAINT osslaughterhouse_pkey;
       public         postgres    false    287            4           2606    140545    mdrol rol_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.mdrol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (rol_id);
 8   ALTER TABLE ONLY public.mdrol DROP CONSTRAINT rol_pkey;
       public         postgres    false    267            �           2606    140547 .   sltxliftbreeding slliftbreeding_id_primary_key 
   CONSTRAINT     {   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT slliftbreeding_id_primary_key PRIMARY KEY (slliftbreeding_id);
 X   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT slliftbreeding_id_primary_key;
       public         postgres    false    332            �           2606    140549 0   slmdevictionpartition slmdevictionpartition_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.slmdevictionpartition
    ADD CONSTRAINT slmdevictionpartition_pkey PRIMARY KEY (slevictionpartition_id);
 Z   ALTER TABLE ONLY public.slmdevictionpartition DROP CONSTRAINT slmdevictionpartition_pkey;
       public         postgres    false    302            �           2606    140551 6   slmdgenderclassification slmdgenderclassification_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.slmdgenderclassification
    ADD CONSTRAINT slmdgenderclassification_pkey PRIMARY KEY (slgenderclassification_id);
 `   ALTER TABLE ONLY public.slmdgenderclassification DROP CONSTRAINT slmdgenderclassification_pkey;
       public         postgres    false    303            �           2606    140553 &   slmdmachinegroup slmdmachinegroup_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.slmdmachinegroup
    ADD CONSTRAINT slmdmachinegroup_pkey PRIMARY KEY (slmachinegroup_id);
 P   ALTER TABLE ONLY public.slmdmachinegroup DROP CONSTRAINT slmdmachinegroup_pkey;
       public         postgres    false    304            �           2606    140555    slmdprocess slmdprocess_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.slmdprocess
    ADD CONSTRAINT slmdprocess_pkey PRIMARY KEY (slprocess_id);
 F   ALTER TABLE ONLY public.slmdprocess DROP CONSTRAINT slmdprocess_pkey;
       public         postgres    false    306            �           2606    140557    sltxb_shed sltxb_shed_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public.sltxb_shed
    ADD CONSTRAINT sltxb_shed_pkey PRIMARY KEY (slb_shed_id);
 D   ALTER TABLE ONLY public.sltxb_shed DROP CONSTRAINT sltxb_shed_pkey;
       public         postgres    false    308            �           2606    140559    sltxbr_shed sltxbr_shed_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.sltxbr_shed
    ADD CONSTRAINT sltxbr_shed_pkey PRIMARY KEY (slbr_shed_id);
 F   ALTER TABLE ONLY public.sltxbr_shed DROP CONSTRAINT sltxbr_shed_pkey;
       public         postgres    false    310            �           2606    140561    sltxbreeding sltxbreeding_pkey 
   CONSTRAINT     g   ALTER TABLE ONLY public.sltxbreeding
    ADD CONSTRAINT sltxbreeding_pkey PRIMARY KEY (slbreeding_id);
 H   ALTER TABLE ONLY public.sltxbreeding DROP CONSTRAINT sltxbreeding_pkey;
       public         postgres    false    312            �           2606    140563 *   sltxbroiler_detail sltxbroiler_detail_pkey 
   CONSTRAINT     y   ALTER TABLE ONLY public.sltxbroiler_detail
    ADD CONSTRAINT sltxbroiler_detail_pkey PRIMARY KEY (slbroiler_detail_id);
 T   ALTER TABLE ONLY public.sltxbroiler_detail DROP CONSTRAINT sltxbroiler_detail_pkey;
       public         postgres    false    316            �           2606    140565 $   sltxbroiler_lot sltxbroiler_lot_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY public.sltxbroiler_lot
    ADD CONSTRAINT sltxbroiler_lot_pkey PRIMARY KEY (slbroiler_lot_id);
 N   ALTER TABLE ONLY public.sltxbroiler_lot DROP CONSTRAINT sltxbroiler_lot_pkey;
       public         postgres    false    317            �           2606    140567    sltxbroiler sltxbroiler_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.sltxbroiler
    ADD CONSTRAINT sltxbroiler_pkey PRIMARY KEY (slbroiler_id);
 F   ALTER TABLE ONLY public.sltxbroiler DROP CONSTRAINT sltxbroiler_pkey;
       public         postgres    false    314            �           2606    140569 ,   sltxincubator_curve sltxincubator_curve_pkey 
   CONSTRAINT     |   ALTER TABLE ONLY public.sltxincubator_curve
    ADD CONSTRAINT sltxincubator_curve_pkey PRIMARY KEY (slincubator_curve_id);
 V   ALTER TABLE ONLY public.sltxincubator_curve DROP CONSTRAINT sltxincubator_curve_pkey;
       public         postgres    false    321            �           2606    140571 .   sltxincubator_detail sltxincubator_detail_pkey 
   CONSTRAINT        ALTER TABLE ONLY public.sltxincubator_detail
    ADD CONSTRAINT sltxincubator_detail_pkey PRIMARY KEY (slincubator_detail_id);
 X   ALTER TABLE ONLY public.sltxincubator_detail DROP CONSTRAINT sltxincubator_detail_pkey;
       public         postgres    false    324            �           2606    140573 (   sltxincubator_lot sltxincubator_lot_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.sltxincubator_lot
    ADD CONSTRAINT sltxincubator_lot_pkey PRIMARY KEY (slincubator_lot_id);
 R   ALTER TABLE ONLY public.sltxincubator_lot DROP CONSTRAINT sltxincubator_lot_pkey;
       public         postgres    false    325            �           2606    140575     sltxincubator sltxincubator_pkey 
   CONSTRAINT     g   ALTER TABLE ONLY public.sltxincubator
    ADD CONSTRAINT sltxincubator_pkey PRIMARY KEY (slincubator);
 J   ALTER TABLE ONLY public.sltxincubator DROP CONSTRAINT sltxincubator_pkey;
       public         postgres    false    320            �           2606    140577     sltxinventory sltxinventory_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.sltxinventory
    ADD CONSTRAINT sltxinventory_pkey PRIMARY KEY (slinventory_id);
 J   ALTER TABLE ONLY public.sltxinventory DROP CONSTRAINT sltxinventory_pkey;
       public         postgres    false    328            �           2606    140579    sltxlb_shed sltxlb_shed_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.sltxlb_shed
    ADD CONSTRAINT sltxlb_shed_pkey PRIMARY KEY (sllb_shed_id);
 F   ALTER TABLE ONLY public.sltxlb_shed DROP CONSTRAINT sltxlb_shed_pkey;
       public         postgres    false    330            �           2606    140581 &   sltxposturecurve sltxposturecurve_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.sltxposturecurve
    ADD CONSTRAINT sltxposturecurve_pkey PRIMARY KEY (slposturecurve_id);
 P   ALTER TABLE ONLY public.sltxposturecurve DROP CONSTRAINT sltxposturecurve_pkey;
       public         postgres    false    334            �           2606    140583 (   sltxsellspurchase sltxsellspurchase_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.sltxsellspurchase
    ADD CONSTRAINT sltxsellspurchase_pkey PRIMARY KEY (slsellspurchase_id);
 R   ALTER TABLE ONLY public.sltxsellspurchase DROP CONSTRAINT sltxsellspurchase_pkey;
       public         postgres    false    336            �           2606    140585 .   txadjustmentscontrol txadjustmentscontrol_pkey 
   CONSTRAINT        ALTER TABLE ONLY public.txadjustmentscontrol
    ADD CONSTRAINT txadjustmentscontrol_pkey PRIMARY KEY (adjustmentscontrol_id);
 X   ALTER TABLE ONLY public.txadjustmentscontrol DROP CONSTRAINT txadjustmentscontrol_pkey;
       public         postgres    false    337            �           2606    140587 ,   txavailabilitysheds txavailabilitysheds_pkey 
   CONSTRAINT     |   ALTER TABLE ONLY public.txavailabilitysheds
    ADD CONSTRAINT txavailabilitysheds_pkey PRIMARY KEY (availability_shed_id);
 V   ALTER TABLE ONLY public.txavailabilitysheds DROP CONSTRAINT txavailabilitysheds_pkey;
       public         postgres    false    339            �           2606    140589 &   txbroiler_detail txbroiler_detail_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_pkey PRIMARY KEY (broiler_detail_id);
 P   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_pkey;
       public         postgres    false    341            �           2606    140591     txbroiler_lot txbroiler_lot_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.txbroiler_lot
    ADD CONSTRAINT txbroiler_lot_pkey PRIMARY KEY (broiler_lot_id);
 J   ALTER TABLE ONLY public.txbroiler_lot DROP CONSTRAINT txbroiler_lot_pkey;
       public         postgres    false    342            �           2606    140593    txbroiler txbroiler_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.txbroiler
    ADD CONSTRAINT txbroiler_pkey PRIMARY KEY (broiler_id);
 B   ALTER TABLE ONLY public.txbroiler DROP CONSTRAINT txbroiler_pkey;
       public         postgres    false    340            �           2606    140595 6   txbroilereviction_detail txbroilereviction_detail_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_pkey PRIMARY KEY (broilereviction_detail_id);
 `   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_pkey;
       public         postgres    false    345            �           2606    140597 (   txbroilereviction txbroilereviction_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_pkey PRIMARY KEY (broilereviction_id);
 R   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_pkey;
       public         postgres    false    344            �           2606    140599 0   txbroilerheavy_detail txbroilerheavy_detail_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.txbroilerheavy_detail
    ADD CONSTRAINT txbroilerheavy_detail_pkey PRIMARY KEY (broiler_heavy_detail_id);
 Z   ALTER TABLE ONLY public.txbroilerheavy_detail DROP CONSTRAINT txbroilerheavy_detail_pkey;
       public         postgres    false    346            �           2606    140601 4   txbroilerproduct_detail txbroilerproduct_detail_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.txbroilerproduct_detail
    ADD CONSTRAINT txbroilerproduct_detail_pkey PRIMARY KEY (broilerproduct_detail_id);
 ^   ALTER TABLE ONLY public.txbroilerproduct_detail DROP CONSTRAINT txbroilerproduct_detail_pkey;
       public         postgres    false    348            �           2606    140603 &   txbroodermachine txbroodermachine_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public.txbroodermachine
    ADD CONSTRAINT txbroodermachine_pkey PRIMARY KEY (brooder_machine_id_seq);
 P   ALTER TABLE ONLY public.txbroodermachine DROP CONSTRAINT txbroodermachine_pkey;
       public         postgres    false    349            �           2606    140609 &   txeggs_movements txeggs_movements_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.txeggs_movements
    ADD CONSTRAINT txeggs_movements_pkey PRIMARY KEY (eggs_movements_id);
 P   ALTER TABLE ONLY public.txeggs_movements DROP CONSTRAINT txeggs_movements_pkey;
       public         postgres    false    351            �           2606    140611 $   txeggs_planning txeggs_planning_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public.txeggs_planning
    ADD CONSTRAINT txeggs_planning_pkey PRIMARY KEY (egg_planning_id);
 N   ALTER TABLE ONLY public.txeggs_planning DROP CONSTRAINT txeggs_planning_pkey;
       public         postgres    false    352            �           2606    140613 $   txeggs_required txeggs_required_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public.txeggs_required
    ADD CONSTRAINT txeggs_required_pkey PRIMARY KEY (egg_required_id);
 N   ALTER TABLE ONLY public.txeggs_required DROP CONSTRAINT txeggs_required_pkey;
       public         postgres    false    353            �           2606    140615 "   txeggs_storage txeggs_storage_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY public.txeggs_storage
    ADD CONSTRAINT txeggs_storage_pkey PRIMARY KEY (eggs_storage_id);
 L   ALTER TABLE ONLY public.txeggs_storage DROP CONSTRAINT txeggs_storage_pkey;
       public         postgres    false    354            �           2606    140617    txgoals_erp txgoals_erp_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.txgoals_erp
    ADD CONSTRAINT txgoals_erp_pkey PRIMARY KEY (goals_erp_id);
 F   ALTER TABLE ONLY public.txgoals_erp DROP CONSTRAINT txgoals_erp_pkey;
       public         postgres    false    355            �           2606    140619 ,   txhousingway_detail txhousingway_detail_pkey 
   CONSTRAINT     |   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_pkey PRIMARY KEY (housingway_detail_id);
 V   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_pkey;
       public         postgres    false    358            �           2606    140621 &   txhousingway_lot txhousingway_lot_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.txhousingway_lot
    ADD CONSTRAINT txhousingway_lot_pkey PRIMARY KEY (housingway_lot_id);
 P   ALTER TABLE ONLY public.txhousingway_lot DROP CONSTRAINT txhousingway_lot_pkey;
       public         postgres    false    359            �           2606    140623    txhousingway txhousingway_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.txhousingway
    ADD CONSTRAINT txhousingway_pkey PRIMARY KEY (housing_way_id);
 H   ALTER TABLE ONLY public.txhousingway DROP CONSTRAINT txhousingway_pkey;
       public         postgres    false    357            �           2606    140625 $   txincubator_lot txincubator_lot_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY public.txincubator_lot
    ADD CONSTRAINT txincubator_lot_pkey PRIMARY KEY (incubator_lot_id);
 N   ALTER TABLE ONLY public.txincubator_lot DROP CONSTRAINT txincubator_lot_pkey;
       public         postgres    false    361            �           2606    140627 (   txincubator_sales txincubator_sales_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.txincubator_sales
    ADD CONSTRAINT txincubator_sales_pkey PRIMARY KEY (incubator_sales_id);
 R   ALTER TABLE ONLY public.txincubator_sales DROP CONSTRAINT txincubator_sales_pkey;
       public         postgres    false    363            �           2606    140629    txlot_eggs txlot_eggs_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public.txlot_eggs
    ADD CONSTRAINT txlot_eggs_pkey PRIMARY KEY (lot_eggs_id);
 D   ALTER TABLE ONLY public.txlot_eggs DROP CONSTRAINT txlot_eggs_pkey;
       public         postgres    false    366            �           2606    140631    txlot txlot_lot_code_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_lot_code_key UNIQUE (lot_code);
 B   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_lot_code_key;
       public         postgres    false    365            �           2606    140633    txlot txlot_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_pkey PRIMARY KEY (lot_id);
 :   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_pkey;
       public         postgres    false    365                        2606    140635 "   txposturecurve txposturecurve_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public.txposturecurve
    ADD CONSTRAINT txposturecurve_pkey PRIMARY KEY (posture_curve_id);
 L   ALTER TABLE ONLY public.txposturecurve DROP CONSTRAINT txposturecurve_pkey;
       public         postgres    false    367                       2606    140637 (   txprogrammed_eggs txprogrammed_eggs_pkey 
   CONSTRAINT     v   ALTER TABLE ONLY public.txprogrammed_eggs
    ADD CONSTRAINT txprogrammed_eggs_pkey PRIMARY KEY (programmed_eggs_id);
 R   ALTER TABLE ONLY public.txprogrammed_eggs DROP CONSTRAINT txprogrammed_eggs_pkey;
       public         postgres    false    368                       2606    140639 (   txscenarioformula txscenarioformula_pkey 
   CONSTRAINT     w   ALTER TABLE ONLY public.txscenarioformula
    ADD CONSTRAINT txscenarioformula_pkey PRIMARY KEY (scenario_formula_id);
 R   ALTER TABLE ONLY public.txscenarioformula DROP CONSTRAINT txscenarioformula_pkey;
       public         postgres    false    369                       2606    140641 ,   txscenarioparameter txscenarioparameter_pkey 
   CONSTRAINT     }   ALTER TABLE ONLY public.txscenarioparameter
    ADD CONSTRAINT txscenarioparameter_pkey PRIMARY KEY (scenario_parameter_id);
 V   ALTER TABLE ONLY public.txscenarioparameter DROP CONSTRAINT txscenarioparameter_pkey;
       public         postgres    false    370                       2606    140643 2   txscenarioparameterday txscenarioparameterday_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameterday
    ADD CONSTRAINT txscenarioparameterday_pkey PRIMARY KEY (scenario_parameter_day_id);
 \   ALTER TABLE ONLY public.txscenarioparameterday DROP CONSTRAINT txscenarioparameterday_pkey;
       public         postgres    false    371                       2606    140645 2   txscenarioposturecurve txscenarioposturecurve_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioposturecurve
    ADD CONSTRAINT txscenarioposturecurve_pkey PRIMARY KEY (scenario_posture_id);
 \   ALTER TABLE ONLY public.txscenarioposturecurve DROP CONSTRAINT txscenarioposturecurve_pkey;
       public         postgres    false    372                       2606    140647 (   txscenarioprocess txscenarioprocess_pkey 
   CONSTRAINT     w   ALTER TABLE ONLY public.txscenarioprocess
    ADD CONSTRAINT txscenarioprocess_pkey PRIMARY KEY (scenario_process_id);
 R   ALTER TABLE ONLY public.txscenarioprocess DROP CONSTRAINT txscenarioprocess_pkey;
       public         postgres    false    373                        2606    140649    txsync txsync_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public.txsync
    ADD CONSTRAINT txsync_pkey PRIMARY KEY (sync_id);
 <   ALTER TABLE ONLY public.txsync DROP CONSTRAINT txsync_pkey;
       public         postgres    false    374            6           2606    140651    mdrol uniqueRolName 
   CONSTRAINT     T   ALTER TABLE ONLY public.mdrol
    ADD CONSTRAINT "uniqueRolName" UNIQUE (rol_name);
 ?   ALTER TABLE ONLY public.mdrol DROP CONSTRAINT "uniqueRolName";
       public         postgres    false    267            �           1259    140656    fki_FK_ id_aba_time_unit    INDEX     p   CREATE INDEX "fki_FK_ id_aba_time_unit" ON public.aba_consumption_and_mortality USING btree (id_aba_time_unit);
 .   DROP INDEX public."fki_FK_ id_aba_time_unit";
       public         postgres    false    200                       1259    140657    fki_FK_id_aba_breeds_and_stages    INDEX     �   CREATE INDEX "fki_FK_id_aba_breeds_and_stages" ON public.aba_stages_of_breeds_and_stages USING btree (id_aba_breeds_and_stages);
 5   DROP INDEX public."fki_FK_id_aba_breeds_and_stages";
       public         postgres    false    213            �           1259    140658 '   fki_FK_id_aba_consumption_and_mortality    INDEX     �   CREATE INDEX "fki_FK_id_aba_consumption_and_mortality" ON public.aba_breeds_and_stages USING btree (id_aba_consumption_and_mortality);
 =   DROP INDEX public."fki_FK_id_aba_consumption_and_mortality";
       public         postgres    false    198                       1259    140659 (   fki_FK_id_aba_consumption_and_mortality2    INDEX     �   CREATE INDEX "fki_FK_id_aba_consumption_and_mortality2" ON public.aba_consumption_and_mortality_detail USING btree (id_aba_consumption_and_mortality);
 >   DROP INDEX public."fki_FK_id_aba_consumption_and_mortality2";
       public         postgres    false    202                       1259    140660    fki_FK_id_aba_element    INDEX     m   CREATE INDEX "fki_FK_id_aba_element" ON public.aba_elements_and_concentrations USING btree (id_aba_element);
 +   DROP INDEX public."fki_FK_id_aba_element";
       public         postgres    false    206                       1259    140661    fki_FK_id_aba_formulation    INDEX     u   CREATE INDEX "fki_FK_id_aba_formulation" ON public.aba_elements_and_concentrations USING btree (id_aba_formulation);
 /   DROP INDEX public."fki_FK_id_aba_formulation";
       public         postgres    false    206            �           1259    140662    fki_FK_id_breed    INDEX     _   CREATE INDEX "fki_FK_id_breed" ON public.aba_consumption_and_mortality USING btree (id_breed);
 %   DROP INDEX public."fki_FK_id_breed";
       public         postgres    false    200                       1259    140663    fki_FK_id_formulation    INDEX     m   CREATE INDEX "fki_FK_id_formulation" ON public.aba_stages_of_breeds_and_stages USING btree (id_formulation);
 +   DROP INDEX public."fki_FK_id_formulation";
       public         postgres    false    213            �           1259    140664    fki_FK_id_process    INDEX     [   CREATE INDEX "fki_FK_id_process" ON public.aba_breeds_and_stages USING btree (id_process);
 '   DROP INDEX public."fki_FK_id_process";
       public         postgres    false    198            �           1259    140665    fki_FK_id_stage    INDEX     _   CREATE INDEX "fki_FK_id_stage" ON public.aba_consumption_and_mortality USING btree (id_stage);
 %   DROP INDEX public."fki_FK_id_stage";
       public         postgres    false    200                       1259    140666 )   fki_mdapplication_rol_application_id_fkey    INDEX     q   CREATE INDEX fki_mdapplication_rol_application_id_fkey ON public.mdapplication_rol USING btree (application_id);
 =   DROP INDEX public.fki_mdapplication_rol_application_id_fkey;
       public         postgres    false    252                       1259    140667 !   fki_mdapplication_rol_rol_id_fkey    INDEX     a   CREATE INDEX fki_mdapplication_rol_rol_id_fkey ON public.mdapplication_rol USING btree (rol_id);
 5   DROP INDEX public.fki_mdapplication_rol_rol_id_fkey;
       public         postgres    false    252            &           1259    140668    fki_mdparameter_measure_id_fkey    INDEX     ]   CREATE INDEX fki_mdparameter_measure_id_fkey ON public.mdparameter USING btree (measure_id);
 3   DROP INDEX public.fki_mdparameter_measure_id_fkey;
       public         postgres    false    261            '           1259    140669    fki_mdparameter_process_id_fkey    INDEX     ]   CREATE INDEX fki_mdparameter_process_id_fkey ON public.mdparameter USING btree (process_id);
 3   DROP INDEX public.fki_mdparameter_process_id_fkey;
       public         postgres    false    261            *           1259    140670    fki_mdprocess_breed_id_fkey    INDEX     U   CREATE INDEX fki_mdprocess_breed_id_fkey ON public.mdprocess USING btree (breed_id);
 /   DROP INDEX public.fki_mdprocess_breed_id_fkey;
       public         postgres    false    263            A           1259    140672    fki_mduser_rol_id_fkey    INDEX     K   CREATE INDEX fki_mduser_rol_id_fkey ON public.mduser USING btree (rol_id);
 *   DROP INDEX public.fki_mduser_rol_id_fkey;
       public         postgres    false    275            H           1259    140673    fki_oscenter_farm_id_fkey    INDEX     Q   CREATE INDEX fki_oscenter_farm_id_fkey ON public.oscenter USING btree (farm_id);
 -   DROP INDEX public.fki_oscenter_farm_id_fkey;
       public         postgres    false    278            I           1259    140674     fki_oscenter_partnership_id_fkey    INDEX     _   CREATE INDEX fki_oscenter_partnership_id_fkey ON public.oscenter USING btree (partnership_id);
 4   DROP INDEX public.fki_oscenter_partnership_id_fkey;
       public         postgres    false    278            R           1259    140675    fki_osfarm_farm_type_id_fkey    INDEX     W   CREATE INDEX fki_osfarm_farm_type_id_fkey ON public.osfarm USING btree (farm_type_id);
 0   DROP INDEX public.fki_osfarm_farm_type_id_fkey;
       public         postgres    false    279            S           1259    140676    fki_osfarm_partnership_id_fkey    INDEX     [   CREATE INDEX fki_osfarm_partnership_id_fkey ON public.osfarm USING btree (partnership_id);
 2   DROP INDEX public.fki_osfarm_partnership_id_fkey;
       public         postgres    false    279            \           1259    140677 '   fki_osincubator_incubator_plant_id_fkey    INDEX     m   CREATE INDEX fki_osincubator_incubator_plant_id_fkey ON public.osincubator USING btree (incubator_plant_id);
 ;   DROP INDEX public.fki_osincubator_incubator_plant_id_fkey;
       public         postgres    false    280            a           1259    140678 (   fki_osincubatorplant_partnership_id_fkey    INDEX     o   CREATE INDEX fki_osincubatorplant_partnership_id_fkey ON public.osincubatorplant USING btree (partnership_id);
 <   DROP INDEX public.fki_osincubatorplant_partnership_id_fkey;
       public         postgres    false    281            r           1259    140679    fki_osshed_center_id_fkey    INDEX     Q   CREATE INDEX fki_osshed_center_id_fkey ON public.osshed USING btree (center_id);
 -   DROP INDEX public.fki_osshed_center_id_fkey;
       public         postgres    false    285            s           1259    140680    fki_osshed_farm_id_fkey    INDEX     M   CREATE INDEX fki_osshed_farm_id_fkey ON public.osshed USING btree (farm_id);
 +   DROP INDEX public.fki_osshed_farm_id_fkey;
       public         postgres    false    285            t           1259    140681    fki_osshed_partnership_id_fkey    INDEX     [   CREATE INDEX fki_osshed_partnership_id_fkey ON public.osshed USING btree (partnership_id);
 2   DROP INDEX public.fki_osshed_partnership_id_fkey;
       public         postgres    false    285            u           1259    140682    fki_osshed_statusshed_id_fkey    INDEX     Y   CREATE INDEX fki_osshed_statusshed_id_fkey ON public.osshed USING btree (statusshed_id);
 1   DROP INDEX public.fki_osshed_statusshed_id_fkey;
       public         postgres    false    285            +           1259    140683    fki_process_product_id_fkey    INDEX     W   CREATE INDEX fki_process_product_id_fkey ON public.mdprocess USING btree (product_id);
 /   DROP INDEX public.fki_process_product_id_fkey;
       public         postgres    false    263            ,           1259    140684    fki_process_stage_id_fkey    INDEX     S   CREATE INDEX fki_process_stage_id_fkey ON public.mdprocess USING btree (stage_id);
 -   DROP INDEX public.fki_process_stage_id_fkey;
       public         postgres    false    263            �           1259    140685 %   fki_txavailabilitysheds_lot_code_fkey    INDEX     i   CREATE INDEX fki_txavailabilitysheds_lot_code_fkey ON public.txavailabilitysheds USING btree (lot_code);
 9   DROP INDEX public.fki_txavailabilitysheds_lot_code_fkey;
       public         postgres    false    339            �           1259    140686 $   fki_txavailabilitysheds_shed_id_fkey    INDEX     g   CREATE INDEX fki_txavailabilitysheds_shed_id_fkey ON public.txavailabilitysheds USING btree (shed_id);
 8   DROP INDEX public.fki_txavailabilitysheds_shed_id_fkey;
       public         postgres    false    339            �           1259    140687 $   fki_txbroiler_detail_broiler_id_fkey    INDEX     g   CREATE INDEX fki_txbroiler_detail_broiler_id_fkey ON public.txbroiler_detail USING btree (broiler_id);
 8   DROP INDEX public.fki_txbroiler_detail_broiler_id_fkey;
       public         postgres    false    341            �           1259    140688 !   fki_txbroiler_detail_farm_id_fkey    INDEX     a   CREATE INDEX fki_txbroiler_detail_farm_id_fkey ON public.txbroiler_detail USING btree (farm_id);
 5   DROP INDEX public.fki_txbroiler_detail_farm_id_fkey;
       public         postgres    false    341            �           1259    140689 !   fki_txbroiler_detail_shed_id_fkey    INDEX     a   CREATE INDEX fki_txbroiler_detail_shed_id_fkey ON public.txbroiler_detail USING btree (shed_id);
 5   DROP INDEX public.fki_txbroiler_detail_shed_id_fkey;
       public         postgres    false    341            �           1259    140690 %   fki_txbroiler_programmed_eggs_id_fkey    INDEX     i   CREATE INDEX fki_txbroiler_programmed_eggs_id_fkey ON public.txbroiler USING btree (programmed_eggs_id);
 9   DROP INDEX public.fki_txbroiler_programmed_eggs_id_fkey;
       public         postgres    false    340            �           1259    140691 #   fki_txbroilereviction_breed_id_fkey    INDEX     e   CREATE INDEX fki_txbroilereviction_breed_id_fkey ON public.txbroilereviction USING btree (breed_id);
 7   DROP INDEX public.fki_txbroilereviction_breed_id_fkey;
       public         postgres    false    344            �           1259    140692 ,   fki_txbroilereviction_detail_broiler_id_fkey    INDEX        CREATE INDEX fki_txbroilereviction_detail_broiler_id_fkey ON public.txbroilereviction_detail USING btree (broilereviction_id);
 @   DROP INDEX public.fki_txbroilereviction_detail_broiler_id_fkey;
       public         postgres    false    345            �           1259    140693 4   fki_txbroilereviction_detail_broiler_product_id_fkey    INDEX     �   CREATE INDEX fki_txbroilereviction_detail_broiler_product_id_fkey ON public.txbroilereviction_detail USING btree (broiler_product_id);
 H   DROP INDEX public.fki_txbroilereviction_detail_broiler_product_id_fkey;
       public         postgres    false    345            �           1259    140694 )   fki_txbroilereviction_detail_farm_id_fkey    INDEX     q   CREATE INDEX fki_txbroilereviction_detail_farm_id_fkey ON public.txbroilereviction_detail USING btree (farm_id);
 =   DROP INDEX public.fki_txbroilereviction_detail_farm_id_fkey;
       public         postgres    false    345            �           1259    140695 )   fki_txbroilereviction_detail_shed_id_fkey    INDEX     q   CREATE INDEX fki_txbroilereviction_detail_shed_id_fkey ON public.txbroilereviction_detail USING btree (shed_id);
 =   DROP INDEX public.fki_txbroilereviction_detail_shed_id_fkey;
       public         postgres    false    345            �           1259    140696 3   fki_txbroilereviction_detail_slaughterhouse_id_fkey    INDEX     �   CREATE INDEX fki_txbroilereviction_detail_slaughterhouse_id_fkey ON public.txbroilereviction_detail USING btree (slaughterhouse_id);
 G   DROP INDEX public.fki_txbroilereviction_detail_slaughterhouse_id_fkey;
       public         postgres    false    345            �           1259    140697 )   fki_txbroilereviction_partnership_id_fkey    INDEX     q   CREATE INDEX fki_txbroilereviction_partnership_id_fkey ON public.txbroilereviction USING btree (partnership_id);
 =   DROP INDEX public.fki_txbroilereviction_partnership_id_fkey;
       public         postgres    false    344            �           1259    140698 &   fki_txbroilereviction_scenario_id_fkey    INDEX     k   CREATE INDEX fki_txbroilereviction_scenario_id_fkey ON public.txbroilereviction USING btree (scenario_id);
 :   DROP INDEX public.fki_txbroilereviction_scenario_id_fkey;
       public         postgres    false    344            �           1259    140699 /   fki_txbroilerproduct_detail_broiler_detail_fkey    INDEX     }   CREATE INDEX fki_txbroilerproduct_detail_broiler_detail_fkey ON public.txbroilerproduct_detail USING btree (broiler_detail);
 C   DROP INDEX public.fki_txbroilerproduct_detail_broiler_detail_fkey;
       public         postgres    false    348            �           1259    140700 "   fki_txbroodermachines_farm_id_fkey    INDEX     b   CREATE INDEX fki_txbroodermachines_farm_id_fkey ON public.txbroodermachine USING btree (farm_id);
 6   DROP INDEX public.fki_txbroodermachines_farm_id_fkey;
       public         postgres    false    349            �           1259    140701 )   fki_txbroodermachines_partnership_id_fkey    INDEX     p   CREATE INDEX fki_txbroodermachines_partnership_id_fkey ON public.txbroodermachine USING btree (partnership_id);
 =   DROP INDEX public.fki_txbroodermachines_partnership_id_fkey;
       public         postgres    false    349            �           1259    140702 !   fki_txeggs_planning_breed_id_fkey    INDEX     a   CREATE INDEX fki_txeggs_planning_breed_id_fkey ON public.txeggs_planning USING btree (breed_id);
 5   DROP INDEX public.fki_txeggs_planning_breed_id_fkey;
       public         postgres    false    352            �           1259    140703 $   fki_txeggs_planning_scenario_id_fkey    INDEX     g   CREATE INDEX fki_txeggs_planning_scenario_id_fkey ON public.txeggs_planning USING btree (scenario_id);
 8   DROP INDEX public.fki_txeggs_planning_scenario_id_fkey;
       public         postgres    false    352            �           1259    140704 !   fki_txeggs_required_breed_id_fkey    INDEX     a   CREATE INDEX fki_txeggs_required_breed_id_fkey ON public.txeggs_required USING btree (breed_id);
 5   DROP INDEX public.fki_txeggs_required_breed_id_fkey;
       public         postgres    false    353            �           1259    140705 $   fki_txeggs_required_scenario_id_fkey    INDEX     g   CREATE INDEX fki_txeggs_required_scenario_id_fkey ON public.txeggs_required USING btree (scenario_id);
 8   DROP INDEX public.fki_txeggs_required_scenario_id_fkey;
       public         postgres    false    353            �           1259    140706     fki_txeggs_storage_breed_id_fkey    INDEX     _   CREATE INDEX fki_txeggs_storage_breed_id_fkey ON public.txeggs_storage USING btree (breed_id);
 4   DROP INDEX public.fki_txeggs_storage_breed_id_fkey;
       public         postgres    false    354            �           1259    140707 *   fki_txeggs_storage_incubator_plant_id_fkey    INDEX     s   CREATE INDEX fki_txeggs_storage_incubator_plant_id_fkey ON public.txeggs_storage USING btree (incubator_plant_id);
 >   DROP INDEX public.fki_txeggs_storage_incubator_plant_id_fkey;
       public         postgres    false    354            �           1259    140708 #   fki_txeggs_storage_scenario_id_fkey    INDEX     e   CREATE INDEX fki_txeggs_storage_scenario_id_fkey ON public.txeggs_storage USING btree (scenario_id);
 7   DROP INDEX public.fki_txeggs_storage_scenario_id_fkey;
       public         postgres    false    354            �           1259    140709    fki_txfattening_breed_id_fkey    INDEX     W   CREATE INDEX fki_txfattening_breed_id_fkey ON public.txbroiler USING btree (breed_id);
 1   DROP INDEX public.fki_txfattening_breed_id_fkey;
       public         postgres    false    340            �           1259    140710 #   fki_txfattening_partnership_id_fkey    INDEX     c   CREATE INDEX fki_txfattening_partnership_id_fkey ON public.txbroiler USING btree (partnership_id);
 7   DROP INDEX public.fki_txfattening_partnership_id_fkey;
       public         postgres    false    340            �           1259    140711     fki_txfattening_scenario_id_fkey    INDEX     ]   CREATE INDEX fki_txfattening_scenario_id_fkey ON public.txbroiler USING btree (scenario_id);
 4   DROP INDEX public.fki_txfattening_scenario_id_fkey;
       public         postgres    false    340            �           1259    140712    fki_txgoals_erp_product_id_fkey    INDEX     ]   CREATE INDEX fki_txgoals_erp_product_id_fkey ON public.txgoals_erp USING btree (product_id);
 3   DROP INDEX public.fki_txgoals_erp_product_id_fkey;
       public         postgres    false    355            �           1259    140713     fki_txgoals_erp_scenario_id_fkey    INDEX     _   CREATE INDEX fki_txgoals_erp_scenario_id_fkey ON public.txgoals_erp USING btree (scenario_id);
 4   DROP INDEX public.fki_txgoals_erp_scenario_id_fkey;
       public         postgres    false    355            �           1259    140714    fki_txhousingway_breed_id_fkey    INDEX     [   CREATE INDEX fki_txhousingway_breed_id_fkey ON public.txhousingway USING btree (breed_id);
 2   DROP INDEX public.fki_txhousingway_breed_id_fkey;
       public         postgres    false    357            �           1259    140715 $   fki_txhousingway_detail_farm_id_fkey    INDEX     g   CREATE INDEX fki_txhousingway_detail_farm_id_fkey ON public.txhousingway_detail USING btree (farm_id);
 8   DROP INDEX public.fki_txhousingway_detail_farm_id_fkey;
       public         postgres    false    358            �           1259    140716 +   fki_txhousingway_detail_housing_way_id_fkey    INDEX     u   CREATE INDEX fki_txhousingway_detail_housing_way_id_fkey ON public.txhousingway_detail USING btree (housing_way_id);
 ?   DROP INDEX public.fki_txhousingway_detail_housing_way_id_fkey;
       public         postgres    false    358            �           1259    140717 /   fki_txhousingway_detail_incubator_plant_id_fkey    INDEX     }   CREATE INDEX fki_txhousingway_detail_incubator_plant_id_fkey ON public.txhousingway_detail USING btree (incubator_plant_id);
 C   DROP INDEX public.fki_txhousingway_detail_incubator_plant_id_fkey;
       public         postgres    false    358            �           1259    140718 $   fki_txhousingway_detail_shed_id_fkey    INDEX     g   CREATE INDEX fki_txhousingway_detail_shed_id_fkey ON public.txhousingway_detail USING btree (shed_id);
 8   DROP INDEX public.fki_txhousingway_detail_shed_id_fkey;
       public         postgres    false    358            �           1259    140719 $   fki_txhousingway_partnership_id_fkey    INDEX     g   CREATE INDEX fki_txhousingway_partnership_id_fkey ON public.txhousingway USING btree (partnership_id);
 8   DROP INDEX public.fki_txhousingway_partnership_id_fkey;
       public         postgres    false    357            �           1259    140720 !   fki_txhousingway_scenario_id_fkey    INDEX     a   CREATE INDEX fki_txhousingway_scenario_id_fkey ON public.txhousingway USING btree (scenario_id);
 5   DROP INDEX public.fki_txhousingway_scenario_id_fkey;
       public         postgres    false    357            �           1259    140721    fki_txhousingway_stage_id_fkey    INDEX     [   CREATE INDEX fki_txhousingway_stage_id_fkey ON public.txhousingway USING btree (stage_id);
 2   DROP INDEX public.fki_txhousingway_stage_id_fkey;
       public         postgres    false    357            �           1259    140722    fki_txlot_breed_id_fkey    INDEX     M   CREATE INDEX fki_txlot_breed_id_fkey ON public.txlot USING btree (breed_id);
 +   DROP INDEX public.fki_txlot_breed_id_fkey;
       public         postgres    false    365            �           1259    140723    fki_txlot_farm_id_fkey    INDEX     K   CREATE INDEX fki_txlot_farm_id_fkey ON public.txlot USING btree (farm_id);
 *   DROP INDEX public.fki_txlot_farm_id_fkey;
       public         postgres    false    365            �           1259    140724    fki_txlot_housin_way_id_fkey    INDEX     X   CREATE INDEX fki_txlot_housin_way_id_fkey ON public.txlot USING btree (housing_way_id);
 0   DROP INDEX public.fki_txlot_housin_way_id_fkey;
       public         postgres    false    365            �           1259    140725    fki_txlot_product_id_fkey    INDEX     Q   CREATE INDEX fki_txlot_product_id_fkey ON public.txlot USING btree (product_id);
 -   DROP INDEX public.fki_txlot_product_id_fkey;
       public         postgres    false    365            �           1259    140726    fki_txlot_shed_id_fkey    INDEX     K   CREATE INDEX fki_txlot_shed_id_fkey ON public.txlot USING btree (shed_id);
 *   DROP INDEX public.fki_txlot_shed_id_fkey;
       public         postgres    false    365            �           1259    140727     fki_txposturecurve_breed_id_fkey    INDEX     _   CREATE INDEX fki_txposturecurve_breed_id_fkey ON public.txposturecurve USING btree (breed_id);
 4   DROP INDEX public.fki_txposturecurve_breed_id_fkey;
       public         postgres    false    367                       1259    140728 #   fki_txprogrammed_eggs_breed_id_fkey    INDEX     e   CREATE INDEX fki_txprogrammed_eggs_breed_id_fkey ON public.txprogrammed_eggs USING btree (breed_id);
 7   DROP INDEX public.fki_txprogrammed_eggs_breed_id_fkey;
       public         postgres    false    368                       1259    140729 *   fki_txprogrammed_eggs_eggs_storage_id_fkey    INDEX     s   CREATE INDEX fki_txprogrammed_eggs_eggs_storage_id_fkey ON public.txprogrammed_eggs USING btree (eggs_storage_id);
 >   DROP INDEX public.fki_txprogrammed_eggs_eggs_storage_id_fkey;
       public         postgres    false    368                       1259    140730 '   fki_txprogrammed_eggs_incubator_id_fkey    INDEX     m   CREATE INDEX fki_txprogrammed_eggs_incubator_id_fkey ON public.txprogrammed_eggs USING btree (incubator_id);
 ;   DROP INDEX public.fki_txprogrammed_eggs_incubator_id_fkey;
       public         postgres    false    368                       1259    140731 %   fki_txscenarioformula_measure_id_fkey    INDEX     i   CREATE INDEX fki_txscenarioformula_measure_id_fkey ON public.txscenarioformula USING btree (measure_id);
 9   DROP INDEX public.fki_txscenarioformula_measure_id_fkey;
       public         postgres    false    369                       1259    140732 '   fki_txscenarioformula_parameter_id_fkey    INDEX     m   CREATE INDEX fki_txscenarioformula_parameter_id_fkey ON public.txscenarioformula USING btree (parameter_id);
 ;   DROP INDEX public.fki_txscenarioformula_parameter_id_fkey;
       public         postgres    false    369                       1259    140733 %   fki_txscenarioformula_process_id_fkey    INDEX     i   CREATE INDEX fki_txscenarioformula_process_id_fkey ON public.txscenarioformula USING btree (process_id);
 9   DROP INDEX public.fki_txscenarioformula_process_id_fkey;
       public         postgres    false    369            	           1259    140734 &   fki_txscenarioformula_scenario_id_fkey    INDEX     k   CREATE INDEX fki_txscenarioformula_scenario_id_fkey ON public.txscenarioformula USING btree (scenario_id);
 :   DROP INDEX public.fki_txscenarioformula_scenario_id_fkey;
       public         postgres    false    369                       1259    140735 )   fki_txscenarioparameter_parameter_id_fkey    INDEX     q   CREATE INDEX fki_txscenarioparameter_parameter_id_fkey ON public.txscenarioparameter USING btree (parameter_id);
 =   DROP INDEX public.fki_txscenarioparameter_parameter_id_fkey;
       public         postgres    false    370                       1259    140736 '   fki_txscenarioparameter_process_id_fkey    INDEX     m   CREATE INDEX fki_txscenarioparameter_process_id_fkey ON public.txscenarioparameter USING btree (process_id);
 ;   DROP INDEX public.fki_txscenarioparameter_process_id_fkey;
       public         postgres    false    370                       1259    140737 (   fki_txscenarioparameter_scenario_id_fkey    INDEX     o   CREATE INDEX fki_txscenarioparameter_scenario_id_fkey ON public.txscenarioparameter USING btree (scenario_id);
 <   DROP INDEX public.fki_txscenarioparameter_scenario_id_fkey;
       public         postgres    false    370                       1259    140738 ,   fki_txscenarioparameterday_parameter_id_fkey    INDEX     w   CREATE INDEX fki_txscenarioparameterday_parameter_id_fkey ON public.txscenarioparameterday USING btree (parameter_id);
 @   DROP INDEX public.fki_txscenarioparameterday_parameter_id_fkey;
       public         postgres    false    371                       1259    140739 +   fki_txscenarioparameterday_scenario_id_fkey    INDEX     u   CREATE INDEX fki_txscenarioparameterday_scenario_id_fkey ON public.txscenarioparameterday USING btree (scenario_id);
 ?   DROP INDEX public.fki_txscenarioparameterday_scenario_id_fkey;
       public         postgres    false    371                       1259    140740 (   fki_txscenarioposturecurve_breed_id_fkey    INDEX     o   CREATE INDEX fki_txscenarioposturecurve_breed_id_fkey ON public.txscenarioposturecurve USING btree (breed_id);
 <   DROP INDEX public.fki_txscenarioposturecurve_breed_id_fkey;
       public         postgres    false    372                       1259    140741 4   fki_txscenarioposturecurve_housingway_detail_id_fkey    INDEX     �   CREATE INDEX fki_txscenarioposturecurve_housingway_detail_id_fkey ON public.txscenarioposturecurve USING btree (housingway_detail_id);
 H   DROP INDEX public.fki_txscenarioposturecurve_housingway_detail_id_fkey;
       public         postgres    false    372                       1259    140742 +   fki_txscenarioposturecurve_scenario_id_fkey    INDEX     u   CREATE INDEX fki_txscenarioposturecurve_scenario_id_fkey ON public.txscenarioposturecurve USING btree (scenario_id);
 ?   DROP INDEX public.fki_txscenarioposturecurve_scenario_id_fkey;
       public         postgres    false    372                       1259    140743 %   fki_txscenarioprocess_process_id_fkey    INDEX     i   CREATE INDEX fki_txscenarioprocess_process_id_fkey ON public.txscenarioprocess USING btree (process_id);
 9   DROP INDEX public.fki_txscenarioprocess_process_id_fkey;
       public         postgres    false    373                       1259    140744 &   fki_txscenarioprocess_scenario_id_fkey    INDEX     k   CREATE INDEX fki_txscenarioprocess_scenario_id_fkey ON public.txscenarioprocess USING btree (scenario_id);
 :   DROP INDEX public.fki_txscenarioprocess_scenario_id_fkey;
       public         postgres    false    373                       1259    140745    posturedate_index    INDEX     [   CREATE INDEX posturedate_index ON public.txscenarioposturecurve USING hash (posture_date);
 %   DROP INDEX public.posturedate_index;
       public         postgres    false    372            *           2606    140747 ;   aba_stages_of_breeds_and_stages FK_id_aba_breeds_and_stages    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages
    ADD CONSTRAINT "FK_id_aba_breeds_and_stages" FOREIGN KEY (id_aba_breeds_and_stages) REFERENCES public.aba_breeds_and_stages(id) ON DELETE CASCADE;
 g   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages DROP CONSTRAINT "FK_id_aba_breeds_and_stages";
       public       postgres    false    213    3319    198            !           2606    140752 9   aba_breeds_and_stages FK_id_aba_consumption_and_mortality    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_breeds_and_stages
    ADD CONSTRAINT "FK_id_aba_consumption_and_mortality" FOREIGN KEY (id_aba_consumption_and_mortality) REFERENCES public.aba_consumption_and_mortality(id);
 e   ALTER TABLE ONLY public.aba_breeds_and_stages DROP CONSTRAINT "FK_id_aba_consumption_and_mortality";
       public       postgres    false    200    3323    198            &           2606    140757 I   aba_consumption_and_mortality_detail FK_id_aba_consumption_and_mortality2    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_consumption_and_mortality_detail
    ADD CONSTRAINT "FK_id_aba_consumption_and_mortality2" FOREIGN KEY (id_aba_consumption_and_mortality) REFERENCES public.aba_consumption_and_mortality(id) ON DELETE CASCADE;
 u   ALTER TABLE ONLY public.aba_consumption_and_mortality_detail DROP CONSTRAINT "FK_id_aba_consumption_and_mortality2";
       public       postgres    false    202    3323    200            (           2606    140762 1   aba_elements_and_concentrations FK_id_aba_element    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_elements_and_concentrations
    ADD CONSTRAINT "FK_id_aba_element" FOREIGN KEY (id_aba_element) REFERENCES public.aba_elements(id);
 ]   ALTER TABLE ONLY public.aba_elements_and_concentrations DROP CONSTRAINT "FK_id_aba_element";
       public       postgres    false    206    204    3331            )           2606    140767 5   aba_elements_and_concentrations FK_id_aba_formulation    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_elements_and_concentrations
    ADD CONSTRAINT "FK_id_aba_formulation" FOREIGN KEY (id_aba_formulation) REFERENCES public.aba_formulation(id) ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.aba_elements_and_concentrations DROP CONSTRAINT "FK_id_aba_formulation";
       public       postgres    false    210    3339    206            #           2606    140772 1   aba_consumption_and_mortality FK_id_aba_time_unit    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_consumption_and_mortality
    ADD CONSTRAINT "FK_id_aba_time_unit" FOREIGN KEY (id_aba_time_unit) REFERENCES public.aba_time_unit(id);
 ]   ALTER TABLE ONLY public.aba_consumption_and_mortality DROP CONSTRAINT "FK_id_aba_time_unit";
       public       postgres    false    200    214    3345            $           2606    140777 )   aba_consumption_and_mortality FK_id_breed    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_consumption_and_mortality
    ADD CONSTRAINT "FK_id_breed" FOREIGN KEY (id_breed) REFERENCES public.mdbreed(breed_id);
 U   ALTER TABLE ONLY public.aba_consumption_and_mortality DROP CONSTRAINT "FK_id_breed";
       public       postgres    false    3357    253    200            +           2606    140782 1   aba_stages_of_breeds_and_stages FK_id_formulation    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages
    ADD CONSTRAINT "FK_id_formulation" FOREIGN KEY (id_formulation) REFERENCES public.aba_formulation(id);
 ]   ALTER TABLE ONLY public.aba_stages_of_breeds_and_stages DROP CONSTRAINT "FK_id_formulation";
       public       postgres    false    3339    213    210            "           2606    140787 #   aba_breeds_and_stages FK_id_process    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_breeds_and_stages
    ADD CONSTRAINT "FK_id_process" FOREIGN KEY (id_process) REFERENCES public.mdprocess(process_id);
 O   ALTER TABLE ONLY public.aba_breeds_and_stages DROP CONSTRAINT "FK_id_process";
       public       postgres    false    198    263    3374            %           2606    140792 )   aba_consumption_and_mortality FK_id_stage    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_consumption_and_mortality
    ADD CONSTRAINT "FK_id_stage" FOREIGN KEY (id_stage) REFERENCES public.mdstage(stage_id);
 U   ALTER TABLE ONLY public.aba_consumption_and_mortality DROP CONSTRAINT "FK_id_stage";
       public       postgres    false    200    273    3392            '           2606    140797 6   aba_elements aba_elements_id_aba_element_property_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.aba_elements
    ADD CONSTRAINT aba_elements_id_aba_element_property_fkey FOREIGN KEY (id_aba_element_property) REFERENCES public.aba_elements_properties(id);
 `   ALTER TABLE ONLY public.aba_elements DROP CONSTRAINT aba_elements_id_aba_element_property_fkey;
       public       postgres    false    3337    204    208            k           2606    140802    sltxliftbreeding breed_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT breed_id_fk FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 F   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT breed_id_fk;
       public       postgres    false    253    3357    332            S           2606    140807    sltxbreeding breed_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbreeding
    ADD CONSTRAINT breed_id_fk FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 B   ALTER TABLE ONLY public.sltxbreeding DROP CONSTRAINT breed_id_fk;
       public       postgres    false    253    312    3357            p           2606    140812    sltxposturecurve breed_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxposturecurve
    ADD CONSTRAINT breed_id_fk FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 F   ALTER TABLE ONLY public.sltxposturecurve DROP CONSTRAINT breed_id_fk;
       public       postgres    false    334    3357    253            s           2606    140817    sltxsellspurchase breed_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxsellspurchase
    ADD CONSTRAINT breed_id_fk FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 G   ALTER TABLE ONLY public.sltxsellspurchase DROP CONSTRAINT breed_id_fk;
       public       postgres    false    3357    336    253            K           2606    140822    slmdprocess breed_id_fk    FK CONSTRAINT        ALTER TABLE ONLY public.slmdprocess
    ADD CONSTRAINT breed_id_fk FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 A   ALTER TABLE ONLY public.slmdprocess DROP CONSTRAINT breed_id_fk;
       public       postgres    false    3357    253    306            I           2606    140827 $   slmdgenderclassification breed_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.slmdgenderclassification
    ADD CONSTRAINT breed_id_fk FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 N   ALTER TABLE ONLY public.slmdgenderclassification DROP CONSTRAINT breed_id_fk;
       public       postgres    false    253    303    3357            �           2606    140832    txincubator_sales breed_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.txincubator_sales
    ADD CONSTRAINT breed_id_fk FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 G   ALTER TABLE ONLY public.txincubator_sales DROP CONSTRAINT breed_id_fk;
       public       postgres    false    253    363    3357            Y           2606    140837    sltxbroiler_detail category_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_detail
    ADD CONSTRAINT category_fk FOREIGN KEY (category) REFERENCES public.slmdgenderclassification(slgenderclassification_id);
 H   ALTER TABLE ONLY public.sltxbroiler_detail DROP CONSTRAINT category_fk;
       public       postgres    false    3459    303    316            h           2606    140842    sltxlb_shed center_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxlb_shed
    ADD CONSTRAINT center_id_fk FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 B   ALTER TABLE ONLY public.sltxlb_shed DROP CONSTRAINT center_id_fk;
       public       postgres    false    278    330    3409            M           2606    140847    sltxb_shed center_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxb_shed
    ADD CONSTRAINT center_id_fk FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 A   ALTER TABLE ONLY public.sltxb_shed DROP CONSTRAINT center_id_fk;
       public       postgres    false    3409    278    308            P           2606    140852    sltxbr_shed center_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbr_shed
    ADD CONSTRAINT center_id_fk FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 B   ALTER TABLE ONLY public.sltxbr_shed DROP CONSTRAINT center_id_fk;
       public       postgres    false    310    278    3409            �           2606    140857 *   txeggs_movements eggs_movements_storage_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_movements
    ADD CONSTRAINT eggs_movements_storage_id FOREIGN KEY (eggs_storage_id) REFERENCES public.txeggs_storage(eggs_storage_id);
 T   ALTER TABLE ONLY public.txeggs_movements DROP CONSTRAINT eggs_movements_storage_id;
       public       postgres    false    351    3548    354            T           2606    140862    sltxbreeding farm_id_fk    FK CONSTRAINT     |   ALTER TABLE ONLY public.sltxbreeding
    ADD CONSTRAINT farm_id_fk FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id);
 A   ALTER TABLE ONLY public.sltxbreeding DROP CONSTRAINT farm_id_fk;
       public       postgres    false    312    279    3419            Z           2606    140867    sltxbroiler_detail farm_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_detail
    ADD CONSTRAINT farm_id_fk FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id);
 G   ALTER TABLE ONLY public.sltxbroiler_detail DROP CONSTRAINT farm_id_fk;
       public       postgres    false    3419    279    316            b           2606    140872 $   sltxincubator_detail incubator_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_detail
    ADD CONSTRAINT incubator_id_fk FOREIGN KEY (incubator_id) REFERENCES public.sltxincubator(slincubator);
 N   ALTER TABLE ONLY public.sltxincubator_detail DROP CONSTRAINT incubator_id_fk;
       public       postgres    false    320    324    3477            J           2606    140877 %   slmdmachinegroup incubatorplant_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.slmdmachinegroup
    ADD CONSTRAINT incubatorplant_id_fk FOREIGN KEY (incubatorplant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 O   ALTER TABLE ONLY public.slmdmachinegroup DROP CONSTRAINT incubatorplant_id_fk;
       public       postgres    false    304    3433    281            _           2606    140882 "   sltxincubator incubatorplant_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator
    ADD CONSTRAINT incubatorplant_id_fk FOREIGN KEY (incubatorplant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 L   ALTER TABLE ONLY public.sltxincubator DROP CONSTRAINT incubatorplant_id_fk;
       public       postgres    false    281    320    3433            W           2606    140887     sltxbroiler incubatorplant_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler
    ADD CONSTRAINT incubatorplant_id_fk FOREIGN KEY (incubatorplant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 J   ALTER TABLE ONLY public.sltxbroiler DROP CONSTRAINT incubatorplant_id_fk;
       public       postgres    false    314    3433    281            �           2606    140892 &   txincubator_sales incubatorplant_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.txincubator_sales
    ADD CONSTRAINT incubatorplant_id_fk FOREIGN KEY (incubator_plant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 P   ALTER TABLE ONLY public.txincubator_sales DROP CONSTRAINT incubatorplant_id_fk;
       public       postgres    false    363    281    3433            ,           2606    140897 ;   md_optimizer_parameter md_optimizer_parameter_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.md_optimizer_parameter
    ADD CONSTRAINT md_optimizer_parameter_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 e   ALTER TABLE ONLY public.md_optimizer_parameter DROP CONSTRAINT md_optimizer_parameter_breed_id_fkey;
       public       postgres    false    253    3357    245            -           2606    140902 7   mdapplication_rol mdapplication_rol_application_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdapplication_rol
    ADD CONSTRAINT mdapplication_rol_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.mdapplication(application_id);
 a   ALTER TABLE ONLY public.mdapplication_rol DROP CONSTRAINT mdapplication_rol_application_id_fkey;
       public       postgres    false    250    252    3349            .           2606    140907 /   mdapplication_rol mdapplication_rol_rol_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdapplication_rol
    ADD CONSTRAINT mdapplication_rol_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.mdrol(rol_id);
 Y   ALTER TABLE ONLY public.mdapplication_rol DROP CONSTRAINT mdapplication_rol_rol_id_fkey;
       public       postgres    false    267    3380    252            /           2606    140912 1   mdbroiler_product mdbroiler_product_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdbroiler_product
    ADD CONSTRAINT mdbroiler_product_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 [   ALTER TABLE ONLY public.mdbroiler_product DROP CONSTRAINT mdbroiler_product_breed_id_fkey;
       public       postgres    false    253    3357    254            0           2606    140917 8   mdbroiler_product mdbroiler_product_initial_product_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdbroiler_product
    ADD CONSTRAINT mdbroiler_product_initial_product_fkey FOREIGN KEY (initial_product) REFERENCES public.mdbroiler_product(broiler_product_id);
 b   ALTER TABLE ONLY public.mdbroiler_product DROP CONSTRAINT mdbroiler_product_initial_product_fkey;
       public       postgres    false    254    3359    254            1           2606    140922 7   mdequivalenceproduct mdequivalenceproduct_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdequivalenceproduct
    ADD CONSTRAINT mdequivalenceproduct_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 a   ALTER TABLE ONLY public.mdequivalenceproduct DROP CONSTRAINT mdequivalenceproduct_breed_id_fkey;
       public       postgres    false    255    3357    253            2           2606    140927 '   mdparameter mdparameter_measure_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdparameter
    ADD CONSTRAINT mdparameter_measure_id_fkey FOREIGN KEY (measure_id) REFERENCES public.mdmeasure(measure_id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.mdparameter DROP CONSTRAINT mdparameter_measure_id_fkey;
       public       postgres    false    259    261    3365            3           2606    140932 '   mdparameter mdparameter_process_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdparameter
    ADD CONSTRAINT mdparameter_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.mdprocess(process_id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.mdparameter DROP CONSTRAINT mdparameter_process_id_fkey;
       public       postgres    false    263    3374    261            4           2606    140937 !   mdprocess mdprocess_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdprocess
    ADD CONSTRAINT mdprocess_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.mdprocess DROP CONSTRAINT mdprocess_breed_id_fkey;
       public       postgres    false    3357    253    263            5           2606    140947 '   mdprocess mdprocess_predecessor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdprocess
    ADD CONSTRAINT mdprocess_predecessor_id_fkey FOREIGN KEY (predecessor_id) REFERENCES public.mdprocess(process_id);
 Q   ALTER TABLE ONLY public.mdprocess DROP CONSTRAINT mdprocess_predecessor_id_fkey;
       public       postgres    false    3374    263    263            6           2606    140952 #   mdprocess mdprocess_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdprocess
    ADD CONSTRAINT mdprocess_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.mdproduct(product_id) ON UPDATE CASCADE ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.mdprocess DROP CONSTRAINT mdprocess_product_id_fkey;
       public       postgres    false    265    3378    263            7           2606    140957 !   mdprocess mdprocess_stage_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdprocess
    ADD CONSTRAINT mdprocess_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.mdprocess DROP CONSTRAINT mdprocess_stage_id_fkey;
       public       postgres    false    3392    263    273            8           2606    140962 !   mdproduct mdproduct_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdproduct
    ADD CONSTRAINT mdproduct_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 K   ALTER TABLE ONLY public.mdproduct DROP CONSTRAINT mdproduct_breed_id_fkey;
       public       postgres    false    253    3357    265            9           2606    140967 !   mdproduct mdproduct_stage_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdproduct
    ADD CONSTRAINT mdproduct_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id);
 K   ALTER TABLE ONLY public.mdproduct DROP CONSTRAINT mdproduct_stage_id_fkey;
       public       postgres    false    273    3392    265            :           2606    140972 #   mdrol mdrol_admin_user_creator_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.mdrol
    ADD CONSTRAINT mdrol_admin_user_creator_fkey FOREIGN KEY (admin_user_creator) REFERENCES public.mduser(user_id);
 M   ALTER TABLE ONLY public.mdrol DROP CONSTRAINT mdrol_admin_user_creator_fkey;
       public       postgres    false    267    275    3395            ;           2606    140982    mduser mduser_rol_id_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.mduser
    ADD CONSTRAINT mduser_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.mdrol(rol_id);
 C   ALTER TABLE ONLY public.mduser DROP CONSTRAINT mduser_rol_id_fkey;
       public       postgres    false    267    3380    275            <           2606    140987    mduser mduser_user_id_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.mduser
    ADD CONSTRAINT mduser_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.mduser(user_id);
 D   ALTER TABLE ONLY public.mduser DROP CONSTRAINT mduser_user_id_fkey;
       public       postgres    false    275    275    3395            =           2606    140992    mduser mduser_user_id_fkey1    FK CONSTRAINT     �   ALTER TABLE ONLY public.mduser
    ADD CONSTRAINT mduser_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.mduser(user_id);
 E   ALTER TABLE ONLY public.mduser DROP CONSTRAINT mduser_user_id_fkey1;
       public       postgres    false    275    3395    275            >           2606    140997    oscenter oscenter_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_farm_id_fkey;
       public       postgres    false    279    3419    278            ?           2606    141002 %   oscenter oscenter_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.oscenter
    ADD CONSTRAINT oscenter_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.oscenter DROP CONSTRAINT oscenter_partnership_id_fkey;
       public       postgres    false    283    3441    278            @           2606    141007    osfarm osfarm_farm_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_farm_type_id_fkey FOREIGN KEY (farm_type_id) REFERENCES public.mdfarmtype(farm_type_id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_farm_type_id_fkey;
       public       postgres    false    257    3363    279            A           2606    141012 !   osfarm osfarm_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osfarm
    ADD CONSTRAINT osfarm_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.osfarm DROP CONSTRAINT osfarm_partnership_id_fkey;
       public       postgres    false    279    3441    283            B           2606    141017 /   osincubator osincubator_incubator_plant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osincubator
    ADD CONSTRAINT osincubator_incubator_plant_id_fkey FOREIGN KEY (incubator_plant_id) REFERENCES public.osincubatorplant(incubator_plant_id) ON UPDATE CASCADE ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.osincubator DROP CONSTRAINT osincubator_incubator_plant_id_fkey;
       public       postgres    false    280    281    3433            C           2606    141022 5   osincubatorplant osincubatorplant_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osincubatorplant
    ADD CONSTRAINT osincubatorplant_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.osincubatorplant DROP CONSTRAINT osincubatorplant_partnership_id_fkey;
       public       postgres    false    283    3441    281            D           2606    141027    osshed osshed_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 E   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_breed_id_fkey;
       public       postgres    false    253    285    3357            E           2606    141032    osshed osshed_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id) ON UPDATE CASCADE ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_center_id_fkey;
       public       postgres    false    3409    278    285            F           2606    141037    osshed osshed_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_farm_id_fkey;
       public       postgres    false    279    3419    285            G           2606    141042 !   osshed osshed_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_partnership_id_fkey;
       public       postgres    false    283    285    3441            H           2606    141047     osshed osshed_statusshed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.osshed
    ADD CONSTRAINT osshed_statusshed_id_fkey FOREIGN KEY (statusshed_id) REFERENCES public.mdshedstatus(shed_status_id) ON UPDATE CASCADE ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.osshed DROP CONSTRAINT osshed_statusshed_id_fkey;
       public       postgres    false    3388    271    285            l           2606    141052 "   sltxliftbreeding partnership_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT partnership_id_fk FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id);
 L   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT partnership_id_fk;
       public       postgres    false    283    332    3441            U           2606    141057    sltxbreeding partnership_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbreeding
    ADD CONSTRAINT partnership_id_fk FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id);
 H   ALTER TABLE ONLY public.sltxbreeding DROP CONSTRAINT partnership_id_fk;
       public       postgres    false    312    3441    283            �           2606    141062 &   txeggs_movements programmed_eggs_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_movements
    ADD CONSTRAINT programmed_eggs_id_fk FOREIGN KEY (programmed_eggs_id) REFERENCES public.txprogrammed_eggs(programmed_eggs_id);
 P   ALTER TABLE ONLY public.txeggs_movements DROP CONSTRAINT programmed_eggs_id_fk;
       public       postgres    false    3589    368    351            i           2606    141067    sltxlb_shed shed_id_fk    FK CONSTRAINT     {   ALTER TABLE ONLY public.sltxlb_shed
    ADD CONSTRAINT shed_id_fk FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id);
 @   ALTER TABLE ONLY public.sltxlb_shed DROP CONSTRAINT shed_id_fk;
       public       postgres    false    285    3447    330            N           2606    141072    sltxb_shed shed_id_fk    FK CONSTRAINT     z   ALTER TABLE ONLY public.sltxb_shed
    ADD CONSTRAINT shed_id_fk FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id);
 ?   ALTER TABLE ONLY public.sltxb_shed DROP CONSTRAINT shed_id_fk;
       public       postgres    false    3447    285    308            Q           2606    141077    sltxbr_shed shed_id_fk    FK CONSTRAINT     {   ALTER TABLE ONLY public.sltxbr_shed
    ADD CONSTRAINT shed_id_fk FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id);
 @   ALTER TABLE ONLY public.sltxbr_shed DROP CONSTRAINT shed_id_fk;
       public       postgres    false    3447    285    310            O           2606    141082    sltxb_shed slbreeding_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxb_shed
    ADD CONSTRAINT slbreeding_id_fk FOREIGN KEY (slbreeding_id) REFERENCES public.sltxbreeding(slbreeding_id);
 E   ALTER TABLE ONLY public.sltxb_shed DROP CONSTRAINT slbreeding_id_fk;
       public       postgres    false    3469    308    312            m           2606    141087 !   sltxliftbreeding slbreeding_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT slbreeding_id_fk FOREIGN KEY (slbreeding_id) REFERENCES public.sltxbreeding(slbreeding_id);
 K   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT slbreeding_id_fk;
       public       postgres    false    312    3469    332            q           2606    141092 !   sltxposturecurve slbreeding_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxposturecurve
    ADD CONSTRAINT slbreeding_id_fk FOREIGN KEY (slbreeding_id) REFERENCES public.sltxbreeding(slbreeding_id);
 K   ALTER TABLE ONLY public.sltxposturecurve DROP CONSTRAINT slbreeding_id_fk;
       public       postgres    false    3469    334    312            [           2606    141097 "   sltxbroiler_detail slbroiler_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_detail
    ADD CONSTRAINT slbroiler_id_fk FOREIGN KEY (slbroiler_id) REFERENCES public.sltxbroiler(slbroiler_id);
 L   ALTER TABLE ONLY public.sltxbroiler_detail DROP CONSTRAINT slbroiler_id_fk;
       public       postgres    false    314    316    3471            j           2606    141102     sltxlb_shed slliftbreeding_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxlb_shed
    ADD CONSTRAINT slliftbreeding_id_fk FOREIGN KEY (slliftbreeding_id) REFERENCES public.sltxliftbreeding(slliftbreeding_id);
 J   ALTER TABLE ONLY public.sltxlb_shed DROP CONSTRAINT slliftbreeding_id_fk;
       public       postgres    false    332    3489    330            c           2606    141107 )   sltxincubator_detail slmachinegroup_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_detail
    ADD CONSTRAINT slmachinegroup_id_fk FOREIGN KEY (slmachinegroup_id) REFERENCES public.slmdmachinegroup(slmachinegroup_id);
 S   ALTER TABLE ONLY public.sltxincubator_detail DROP CONSTRAINT slmachinegroup_id_fk;
       public       postgres    false    3461    324    304            R           2606    141112 0   sltxbr_shed sltxbr_shed_slbroiler_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbr_shed
    ADD CONSTRAINT sltxbr_shed_slbroiler_detail_id_fkey FOREIGN KEY (slbroiler_detail_id) REFERENCES public.sltxbroiler_detail(slbroiler_detail_id);
 Z   ALTER TABLE ONLY public.sltxbr_shed DROP CONSTRAINT sltxbr_shed_slbroiler_detail_id_fkey;
       public       postgres    false    3473    316    310            \           2606    141117 8   sltxbroiler_lot sltxbroiler_lot_slbroiler_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_lot
    ADD CONSTRAINT sltxbroiler_lot_slbroiler_detail_id_fkey FOREIGN KEY (slbroiler_detail_id) REFERENCES public.sltxbroiler_detail(slbroiler_detail_id);
 b   ALTER TABLE ONLY public.sltxbroiler_lot DROP CONSTRAINT sltxbroiler_lot_slbroiler_detail_id_fkey;
       public       postgres    false    316    317    3473            ]           2606    141122 1   sltxbroiler_lot sltxbroiler_lot_slbroiler_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_lot
    ADD CONSTRAINT sltxbroiler_lot_slbroiler_id_fkey FOREIGN KEY (slbroiler_id) REFERENCES public.sltxbroiler(slbroiler_id);
 [   ALTER TABLE ONLY public.sltxbroiler_lot DROP CONSTRAINT sltxbroiler_lot_slbroiler_id_fkey;
       public       postgres    false    314    3471    317            ^           2606    141127 7   sltxbroiler_lot sltxbroiler_lot_slsellspurchase_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler_lot
    ADD CONSTRAINT sltxbroiler_lot_slsellspurchase_id_fkey FOREIGN KEY (slsellspurchase_id) REFERENCES public.sltxsellspurchase(slsellspurchase_id);
 a   ALTER TABLE ONLY public.sltxbroiler_lot DROP CONSTRAINT sltxbroiler_lot_slsellspurchase_id_fkey;
       public       postgres    false    3493    336    317            X           2606    141132 2   sltxbroiler sltxbroiler_slincubator_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbroiler
    ADD CONSTRAINT sltxbroiler_slincubator_detail_id_fkey FOREIGN KEY (slincubator_detail_id) REFERENCES public.sltxincubator_detail(slincubator_detail_id);
 \   ALTER TABLE ONLY public.sltxbroiler DROP CONSTRAINT sltxbroiler_slincubator_detail_id_fkey;
       public       postgres    false    314    3481    324            `           2606    141137 ;   sltxincubator_curve sltxincubator_curve_slincubator_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_curve
    ADD CONSTRAINT sltxincubator_curve_slincubator_id_fkey FOREIGN KEY (slincubator_id) REFERENCES public.sltxincubator(slincubator);
 e   ALTER TABLE ONLY public.sltxincubator_curve DROP CONSTRAINT sltxincubator_curve_slincubator_id_fkey;
       public       postgres    false    3477    321    320            a           2606    141142 >   sltxincubator_curve sltxincubator_curve_slposturecurve_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_curve
    ADD CONSTRAINT sltxincubator_curve_slposturecurve_id_fkey FOREIGN KEY (slposturecurve_id) REFERENCES public.sltxposturecurve(slposturecurve_id);
 h   ALTER TABLE ONLY public.sltxincubator_curve DROP CONSTRAINT sltxincubator_curve_slposturecurve_id_fkey;
       public       postgres    false    334    321    3491            d           2606    141147 =   sltxincubator_lot sltxincubator_lot_slincubator_curve_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_lot
    ADD CONSTRAINT sltxincubator_lot_slincubator_curve_id_fkey FOREIGN KEY (slincubator_curve_id) REFERENCES public.sltxincubator_curve(slincubator_curve_id);
 g   ALTER TABLE ONLY public.sltxincubator_lot DROP CONSTRAINT sltxincubator_lot_slincubator_curve_id_fkey;
       public       postgres    false    3479    321    325            e           2606    141152 >   sltxincubator_lot sltxincubator_lot_slincubator_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_lot
    ADD CONSTRAINT sltxincubator_lot_slincubator_detail_id_fkey FOREIGN KEY (slincubator_detail_id) REFERENCES public.sltxincubator_detail(slincubator_detail_id);
 h   ALTER TABLE ONLY public.sltxincubator_lot DROP CONSTRAINT sltxincubator_lot_slincubator_detail_id_fkey;
       public       postgres    false    3481    324    325            f           2606    141157 ;   sltxincubator_lot sltxincubator_lot_slsellspurchase_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxincubator_lot
    ADD CONSTRAINT sltxincubator_lot_slsellspurchase_id_fkey FOREIGN KEY (slsellspurchase_id) REFERENCES public.sltxsellspurchase(slsellspurchase_id);
 e   ALTER TABLE ONLY public.sltxincubator_lot DROP CONSTRAINT sltxincubator_lot_slsellspurchase_id_fkey;
       public       postgres    false    3493    325    336            g           2606    141162 ,   sltxinventory sltxinventory_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxinventory
    ADD CONSTRAINT sltxinventory_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 V   ALTER TABLE ONLY public.sltxinventory DROP CONSTRAINT sltxinventory_scenario_id_fkey;
       public       postgres    false    269    3386    328            n           2606    141167 .   sltxliftbreeding sltxliftbreeding_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT sltxliftbreeding_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id);
 X   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT sltxliftbreeding_farm_id_fkey;
       public       postgres    false    332    279    3419            r           2606    141172 2   sltxposturecurve sltxposturecurve_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxposturecurve
    ADD CONSTRAINT sltxposturecurve_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 \   ALTER TABLE ONLY public.sltxposturecurve DROP CONSTRAINT sltxposturecurve_scenario_id_fkey;
       public       postgres    false    269    3386    334            t           2606    141177 4   sltxsellspurchase sltxsellspurchase_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxsellspurchase
    ADD CONSTRAINT sltxsellspurchase_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 ^   ALTER TABLE ONLY public.sltxsellspurchase DROP CONSTRAINT sltxsellspurchase_scenario_id_fkey;
       public       postgres    false    336    269    3386            o           2606    141182    sltxliftbreeding stage_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxliftbreeding
    ADD CONSTRAINT stage_id_fk FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id);
 F   ALTER TABLE ONLY public.sltxliftbreeding DROP CONSTRAINT stage_id_fk;
       public       postgres    false    332    3392    273            V           2606    141187    sltxbreeding stage_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.sltxbreeding
    ADD CONSTRAINT stage_id_fk FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id);
 B   ALTER TABLE ONLY public.sltxbreeding DROP CONSTRAINT stage_id_fk;
       public       postgres    false    273    3392    312            L           2606    141192    slmdprocess stage_id_fk    FK CONSTRAINT        ALTER TABLE ONLY public.slmdprocess
    ADD CONSTRAINT stage_id_fk FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id);
 A   ALTER TABLE ONLY public.slmdprocess DROP CONSTRAINT stage_id_fk;
       public       postgres    false    306    3392    273            u           2606    141197 5   txavailabilitysheds txavailabilitysheds_lot_code_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txavailabilitysheds
    ADD CONSTRAINT txavailabilitysheds_lot_code_fkey FOREIGN KEY (lot_code) REFERENCES public.txlot(lot_code) ON UPDATE CASCADE ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.txavailabilitysheds DROP CONSTRAINT txavailabilitysheds_lot_code_fkey;
       public       postgres    false    3577    365    339            v           2606    141202 4   txavailabilitysheds txavailabilitysheds_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txavailabilitysheds
    ADD CONSTRAINT txavailabilitysheds_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txavailabilitysheds DROP CONSTRAINT txavailabilitysheds_shed_id_fkey;
       public       postgres    false    3447    285    339            w           2606    141207 !   txbroiler txbroiler_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler
    ADD CONSTRAINT txbroiler_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.txbroiler DROP CONSTRAINT txbroiler_breed_id_fkey;
       public       postgres    false    253    340    3357            {           2606    141212 1   txbroiler_detail txbroiler_detail_broiler_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_broiler_id_fkey FOREIGN KEY (broiler_id) REFERENCES public.txbroiler(broiler_id) ON UPDATE CASCADE ON DELETE CASCADE;
 [   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_broiler_id_fkey;
       public       postgres    false    3505    340    341            |           2606    141217 9   txbroiler_detail txbroiler_detail_broiler_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_broiler_product_id_fkey FOREIGN KEY (broiler_product_id) REFERENCES public.mdbroiler_product(broiler_product_id);
 c   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_broiler_product_id_fkey;
       public       postgres    false    341    254    3359            }           2606    141222 0   txbroiler_detail txbroiler_detail_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 Z   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_center_id_fkey;
       public       postgres    false    341    3409    278            ~           2606    141227 9   txbroiler_detail txbroiler_detail_executioncenter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_executioncenter_id_fkey FOREIGN KEY (executioncenter_id) REFERENCES public.oscenter(center_id);
 c   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_executioncenter_id_fkey;
       public       postgres    false    278    341    3409                       2606    141232 7   txbroiler_detail txbroiler_detail_executionfarm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_executionfarm_id_fkey FOREIGN KEY (executionfarm_id) REFERENCES public.osfarm(farm_id);
 a   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_executionfarm_id_fkey;
       public       postgres    false    3419    279    341            �           2606    141237 7   txbroiler_detail txbroiler_detail_executionshed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_executionshed_id_fkey FOREIGN KEY (executionshed_id) REFERENCES public.osshed(shed_id);
 a   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_executionshed_id_fkey;
       public       postgres    false    285    341    3447            �           2606    141242 .   txbroiler_detail txbroiler_detail_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_farm_id_fkey;
       public       postgres    false    3419    341    279            �           2606    141247 .   txbroiler_detail txbroiler_detail_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler_detail
    ADD CONSTRAINT txbroiler_detail_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.txbroiler_detail DROP CONSTRAINT txbroiler_detail_shed_id_fkey;
       public       postgres    false    3447    341    285            x           2606    141252 '   txbroiler txbroiler_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler
    ADD CONSTRAINT txbroiler_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.txbroiler DROP CONSTRAINT txbroiler_partnership_id_fkey;
       public       postgres    false    3441    283    340            y           2606    141257 +   txbroiler txbroiler_programmed_eggs_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler
    ADD CONSTRAINT txbroiler_programmed_eggs_id_fkey FOREIGN KEY (programmed_eggs_id) REFERENCES public.txprogrammed_eggs(programmed_eggs_id) ON UPDATE CASCADE ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.txbroiler DROP CONSTRAINT txbroiler_programmed_eggs_id_fkey;
       public       postgres    false    3589    368    340            z           2606    141262 $   txbroiler txbroiler_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroiler
    ADD CONSTRAINT txbroiler_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.txbroiler DROP CONSTRAINT txbroiler_scenario_id_fkey;
       public       postgres    false    269    3386    340            �           2606    141267 1   txbroilereviction txbroilereviction_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 [   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_breed_id_fkey;
       public       postgres    false    3357    253    344            �           2606    141272 :   txbroilereviction txbroilereviction_broiler_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_broiler_detail_id_fkey FOREIGN KEY (broiler_detail_id) REFERENCES public.txbroiler_detail(broiler_detail_id);
 d   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_broiler_detail_id_fkey;
       public       postgres    false    3510    344    341            �           2606    141277 @   txbroilereviction txbroilereviction_broiler_heavy_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_broiler_heavy_detail_id_fkey FOREIGN KEY (broiler_heavy_detail_id) REFERENCES public.txbroilerheavy_detail(broiler_heavy_detail_id);
 j   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_broiler_heavy_detail_id_fkey;
       public       postgres    false    344    3526    346            �           2606    141282 A   txbroilereviction_detail txbroilereviction_detail_broiler_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_broiler_id_fkey FOREIGN KEY (broilereviction_id) REFERENCES public.txbroilereviction(broilereviction_id) ON UPDATE CASCADE ON DELETE CASCADE;
 k   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_broiler_id_fkey;
       public       postgres    false    345    3517    344            �           2606    141287 I   txbroilereviction_detail txbroilereviction_detail_broiler_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_broiler_product_id_fkey FOREIGN KEY (broiler_product_id) REFERENCES public.mdbroiler_product(broiler_product_id) ON UPDATE CASCADE ON DELETE CASCADE;
 s   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_broiler_product_id_fkey;
       public       postgres    false    3359    254    345            �           2606    141292 @   txbroilereviction_detail txbroilereviction_detail_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 j   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_center_id_fkey;
       public       postgres    false    345    3409    278            �           2606    141297 M   txbroilereviction_detail txbroilereviction_detail_execution_slaughterhouse_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_execution_slaughterhouse_id FOREIGN KEY (executionslaughterhouse_id) REFERENCES public.osslaughterhouse(slaughterhouse_id);
 w   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_execution_slaughterhouse_id;
       public       postgres    false    287    3455    345            �           2606    141302 >   txbroilereviction_detail txbroilereviction_detail_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 h   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_farm_id_fkey;
       public       postgres    false    345    279    3419            �           2606    141307 >   txbroilereviction_detail txbroilereviction_detail_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 h   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_shed_id_fkey;
       public       postgres    false    345    285    3447            �           2606    141312 H   txbroilereviction_detail txbroilereviction_detail_slaughterhouse_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction_detail
    ADD CONSTRAINT txbroilereviction_detail_slaughterhouse_id_fkey FOREIGN KEY (slaughterhouse_id) REFERENCES public.osslaughterhouse(slaughterhouse_id) ON UPDATE CASCADE ON DELETE CASCADE;
 r   ALTER TABLE ONLY public.txbroilereviction_detail DROP CONSTRAINT txbroilereviction_detail_slaughterhouse_id_fkey;
       public       postgres    false    345    287    3455            �           2606    141317 7   txbroilereviction txbroilereviction_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_partnership_id_fkey;
       public       postgres    false    283    344    3441            �           2606    141322 4   txbroilereviction txbroilereviction_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilereviction
    ADD CONSTRAINT txbroilereviction_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txbroilereviction DROP CONSTRAINT txbroilereviction_scenario_id_fkey;
       public       postgres    false    344    269    3386            �           2606    141327 B   txbroilerheavy_detail txbroilerheavy_detail_broiler_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilerheavy_detail
    ADD CONSTRAINT txbroilerheavy_detail_broiler_detail_id_fkey FOREIGN KEY (broiler_detail_id) REFERENCES public.txbroiler_detail(broiler_detail_id);
 l   ALTER TABLE ONLY public.txbroilerheavy_detail DROP CONSTRAINT txbroilerheavy_detail_broiler_detail_id_fkey;
       public       postgres    false    346    341    3510            �           2606    141332 C   txbroilerheavy_detail txbroilerheavy_detail_broiler_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilerheavy_detail
    ADD CONSTRAINT txbroilerheavy_detail_broiler_product_id_fkey FOREIGN KEY (broiler_product_id) REFERENCES public.mdbroiler_product(broiler_product_id);
 m   ALTER TABLE ONLY public.txbroilerheavy_detail DROP CONSTRAINT txbroilerheavy_detail_broiler_product_id_fkey;
       public       postgres    false    346    254    3359            �           2606    141337 C   txbroilerproduct_detail txbroilerproduct_detail_broiler_detail_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroilerproduct_detail
    ADD CONSTRAINT txbroilerproduct_detail_broiler_detail_fkey FOREIGN KEY (broiler_detail) REFERENCES public.txbroiler_detail(broiler_detail_id) ON UPDATE CASCADE ON DELETE CASCADE;
 m   ALTER TABLE ONLY public.txbroilerproduct_detail DROP CONSTRAINT txbroilerproduct_detail_broiler_detail_fkey;
       public       postgres    false    348    341    3510            �           2606    141342 .   txbroodermachine txbroodermachine_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroodermachine
    ADD CONSTRAINT txbroodermachine_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.txbroodermachine DROP CONSTRAINT txbroodermachine_farm_id_fkey;
       public       postgres    false    349    279    3419            �           2606    141347 5   txbroodermachine txbroodermachine_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txbroodermachine
    ADD CONSTRAINT txbroodermachine_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.txbroodermachine DROP CONSTRAINT txbroodermachine_partnership_id_fkey;
       public       postgres    false    349    283    3441            �           2606    141357 -   txeggs_planning txeggs_planning_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_planning
    ADD CONSTRAINT txeggs_planning_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.txeggs_planning DROP CONSTRAINT txeggs_planning_breed_id_fkey;
       public       postgres    false    253    352    3357            �           2606    141362 0   txeggs_planning txeggs_planning_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_planning
    ADD CONSTRAINT txeggs_planning_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 Z   ALTER TABLE ONLY public.txeggs_planning DROP CONSTRAINT txeggs_planning_scenario_id_fkey;
       public       postgres    false    352    269    3386            �           2606    141367 -   txeggs_required txeggs_required_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_required
    ADD CONSTRAINT txeggs_required_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 W   ALTER TABLE ONLY public.txeggs_required DROP CONSTRAINT txeggs_required_breed_id_fkey;
       public       postgres    false    353    253    3357            �           2606    141372 0   txeggs_required txeggs_required_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_required
    ADD CONSTRAINT txeggs_required_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 Z   ALTER TABLE ONLY public.txeggs_required DROP CONSTRAINT txeggs_required_scenario_id_fkey;
       public       postgres    false    353    269    3386            �           2606    141377 +   txeggs_storage txeggs_storage_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_storage
    ADD CONSTRAINT txeggs_storage_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 U   ALTER TABLE ONLY public.txeggs_storage DROP CONSTRAINT txeggs_storage_breed_id_fkey;
       public       postgres    false    354    253    3357            �           2606    141382 5   txeggs_storage txeggs_storage_incubator_plant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_storage
    ADD CONSTRAINT txeggs_storage_incubator_plant_id_fkey FOREIGN KEY (incubator_plant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 _   ALTER TABLE ONLY public.txeggs_storage DROP CONSTRAINT txeggs_storage_incubator_plant_id_fkey;
       public       postgres    false    354    281    3433            �           2606    141387 .   txeggs_storage txeggs_storage_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txeggs_storage
    ADD CONSTRAINT txeggs_storage_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 X   ALTER TABLE ONLY public.txeggs_storage DROP CONSTRAINT txeggs_storage_scenario_id_fkey;
       public       postgres    false    354    269    3386            �           2606    141392 '   txgoals_erp txgoals_erp_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txgoals_erp
    ADD CONSTRAINT txgoals_erp_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.mdproduct(product_id);
 Q   ALTER TABLE ONLY public.txgoals_erp DROP CONSTRAINT txgoals_erp_product_id_fkey;
       public       postgres    false    355    265    3378            �           2606    141397 (   txgoals_erp txgoals_erp_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txgoals_erp
    ADD CONSTRAINT txgoals_erp_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 R   ALTER TABLE ONLY public.txgoals_erp DROP CONSTRAINT txgoals_erp_scenario_id_fkey;
       public       postgres    false    355    269    3386            �           2606    141402 '   txhousingway txhousingway_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway
    ADD CONSTRAINT txhousingway_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.txhousingway DROP CONSTRAINT txhousingway_breed_id_fkey;
       public       postgres    false    357    253    3357            �           2606    141407 6   txhousingway_detail txhousingway_detail_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.oscenter(center_id);
 `   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_center_id_fkey;
       public       postgres    false    358    278    3409            �           2606    141412 @   txhousingway_detail txhousingway_detail_execution_center_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_execution_center_id_fkey FOREIGN KEY (executioncenter_id) REFERENCES public.oscenter(center_id);
 j   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_execution_center_id_fkey;
       public       postgres    false    358    278    3409            �           2606    141417 >   txhousingway_detail txhousingway_detail_execution_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_execution_farm_id_fkey FOREIGN KEY (executionfarm_id) REFERENCES public.osfarm(farm_id);
 h   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_execution_farm_id_fkey;
       public       postgres    false    358    279    3419            �           2606    141422 >   txhousingway_detail txhousingway_detail_execution_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_execution_shed_id_fkey FOREIGN KEY (executionshed_id) REFERENCES public.osshed(shed_id);
 h   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_execution_shed_id_fkey;
       public       postgres    false    358    285    3447            �           2606    141427 G   txhousingway_detail txhousingway_detail_executionincubatorplant_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_executionincubatorplant_id_fkey FOREIGN KEY (executionincubatorplant_id) REFERENCES public.osincubatorplant(incubator_plant_id);
 q   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_executionincubatorplant_id_fkey;
       public       postgres    false    281    358    3433            �           2606    141432 4   txhousingway_detail txhousingway_detail_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_farm_id_fkey;
       public       postgres    false    279    358    3419            �           2606    141437 ;   txhousingway_detail txhousingway_detail_housing_way_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_housing_way_id_fkey FOREIGN KEY (housing_way_id) REFERENCES public.txhousingway(housing_way_id) ON UPDATE CASCADE ON DELETE CASCADE;
 e   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_housing_way_id_fkey;
       public       postgres    false    358    357    3558            �           2606    141442 4   txhousingway_detail txhousingway_detail_shed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway_detail
    ADD CONSTRAINT txhousingway_detail_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txhousingway_detail DROP CONSTRAINT txhousingway_detail_shed_id_fkey;
       public       postgres    false    358    285    3447            �           2606    141447 -   txhousingway txhousingway_partnership_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway
    ADD CONSTRAINT txhousingway_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.ospartnership(partnership_id) ON UPDATE CASCADE ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.txhousingway DROP CONSTRAINT txhousingway_partnership_id_fkey;
       public       postgres    false    357    283    3441            �           2606    141452 *   txhousingway txhousingway_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway
    ADD CONSTRAINT txhousingway_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.txhousingway DROP CONSTRAINT txhousingway_scenario_id_fkey;
       public       postgres    false    357    269    3386            �           2606    141457 '   txhousingway txhousingway_stage_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txhousingway
    ADD CONSTRAINT txhousingway_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.mdstage(stage_id);
 Q   ALTER TABLE ONLY public.txhousingway DROP CONSTRAINT txhousingway_stage_id_fkey;
       public       postgres    false    273    357    3392            �           2606    141462 6   txincubator_lot txincubator_lot_eggs_movements_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txincubator_lot
    ADD CONSTRAINT txincubator_lot_eggs_movements_id_fkey FOREIGN KEY (eggs_movements_id) REFERENCES public.txeggs_movements(eggs_movements_id);
 `   ALTER TABLE ONLY public.txincubator_lot DROP CONSTRAINT txincubator_lot_eggs_movements_id_fkey;
       public       postgres    false    3535    361    351            �           2606    141467 7   txincubator_lot txincubator_lot_programmed_eggs_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txincubator_lot
    ADD CONSTRAINT txincubator_lot_programmed_eggs_id_fkey FOREIGN KEY (programmed_eggs_id) REFERENCES public.txprogrammed_eggs(programmed_eggs_id);
 a   ALTER TABLE ONLY public.txincubator_lot DROP CONSTRAINT txincubator_lot_programmed_eggs_id_fkey;
       public       postgres    false    3589    361    368            �           2606    141472    txlot txlot_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id);
 C   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_breed_id_fkey;
       public       postgres    false    365    3357    253            �           2606    141477    txlot txlot_farm_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.osfarm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;
 B   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_farm_id_fkey;
       public       postgres    false    3419    365    279            �           2606    141482    txlot txlot_housing_way_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_housing_way_id_fkey FOREIGN KEY (housing_way_id) REFERENCES public.txhousingway(housing_way_id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_housing_way_id_fkey;
       public       postgres    false    365    357    3558            �           2606    141487    txlot txlot_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.mdproduct(product_id);
 E   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_product_id_fkey;
       public       postgres    false    365    3378    265            �           2606    141492    txlot txlot_shed_id_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.txlot
    ADD CONSTRAINT txlot_shed_id_fkey FOREIGN KEY (shed_id) REFERENCES public.osshed(shed_id);
 B   ALTER TABLE ONLY public.txlot DROP CONSTRAINT txlot_shed_id_fkey;
       public       postgres    false    3447    285    365            �           2606    141497 +   txposturecurve txposturecurve_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txposturecurve
    ADD CONSTRAINT txposturecurve_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.txposturecurve DROP CONSTRAINT txposturecurve_breed_id_fkey;
       public       postgres    false    367    3357    253            �           2606    141502 1   txprogrammed_eggs txprogrammed_eggs_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txprogrammed_eggs
    ADD CONSTRAINT txprogrammed_eggs_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 [   ALTER TABLE ONLY public.txprogrammed_eggs DROP CONSTRAINT txprogrammed_eggs_breed_id_fkey;
       public       postgres    false    253    368    3357            �           2606    141507 5   txprogrammed_eggs txprogrammed_eggs_eggs_movements_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.txprogrammed_eggs
    ADD CONSTRAINT txprogrammed_eggs_eggs_movements_id FOREIGN KEY (eggs_movements_id) REFERENCES public.txeggs_movements(eggs_movements_id);
 _   ALTER TABLE ONLY public.txprogrammed_eggs DROP CONSTRAINT txprogrammed_eggs_eggs_movements_id;
       public       postgres    false    368    351    3535            �           2606    141512 8   txprogrammed_eggs txprogrammed_eggs_eggs_storage_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txprogrammed_eggs
    ADD CONSTRAINT txprogrammed_eggs_eggs_storage_id_fkey FOREIGN KEY (eggs_storage_id) REFERENCES public.txeggs_storage(eggs_storage_id) ON UPDATE CASCADE ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.txprogrammed_eggs DROP CONSTRAINT txprogrammed_eggs_eggs_storage_id_fkey;
       public       postgres    false    368    354    3548            �           2606    141517 5   txprogrammed_eggs txprogrammed_eggs_incubator_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txprogrammed_eggs
    ADD CONSTRAINT txprogrammed_eggs_incubator_id_fkey FOREIGN KEY (incubator_id) REFERENCES public.osincubator(incubator_id) ON UPDATE CASCADE ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.txprogrammed_eggs DROP CONSTRAINT txprogrammed_eggs_incubator_id_fkey;
       public       postgres    false    368    3424    280            �           2606    141522 3   txscenarioformula txscenarioformula_measure_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioformula
    ADD CONSTRAINT txscenarioformula_measure_id_fkey FOREIGN KEY (measure_id) REFERENCES public.mdmeasure(measure_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ]   ALTER TABLE ONLY public.txscenarioformula DROP CONSTRAINT txscenarioformula_measure_id_fkey;
       public       postgres    false    259    369    3365            �           2606    141527 5   txscenarioformula txscenarioformula_parameter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioformula
    ADD CONSTRAINT txscenarioformula_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.mdparameter(parameter_id) ON UPDATE CASCADE ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.txscenarioformula DROP CONSTRAINT txscenarioformula_parameter_id_fkey;
       public       postgres    false    261    369    3369            �           2606    141532 3   txscenarioformula txscenarioformula_process_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioformula
    ADD CONSTRAINT txscenarioformula_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.mdprocess(process_id) ON UPDATE CASCADE;
 ]   ALTER TABLE ONLY public.txscenarioformula DROP CONSTRAINT txscenarioformula_process_id_fkey;
       public       postgres    false    263    3374    369            �           2606    141537 4   txscenarioformula txscenarioformula_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioformula
    ADD CONSTRAINT txscenarioformula_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txscenarioformula DROP CONSTRAINT txscenarioformula_scenario_id_fkey;
       public       postgres    false    369    3386    269            �           2606    141542 9   txscenarioparameter txscenarioparameter_parameter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameter
    ADD CONSTRAINT txscenarioparameter_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.mdparameter(parameter_id) ON UPDATE CASCADE ON DELETE CASCADE;
 c   ALTER TABLE ONLY public.txscenarioparameter DROP CONSTRAINT txscenarioparameter_parameter_id_fkey;
       public       postgres    false    370    3369    261            �           2606    141547 7   txscenarioparameter txscenarioparameter_process_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameter
    ADD CONSTRAINT txscenarioparameter_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.mdprocess(process_id) ON UPDATE CASCADE ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.txscenarioparameter DROP CONSTRAINT txscenarioparameter_process_id_fkey;
       public       postgres    false    370    263    3374            �           2606    141552 8   txscenarioparameter txscenarioparameter_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameter
    ADD CONSTRAINT txscenarioparameter_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.txscenarioparameter DROP CONSTRAINT txscenarioparameter_scenario_id_fkey;
       public       postgres    false    3386    370    269            �           2606    141557 ?   txscenarioparameterday txscenarioparameterday_parameter_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameterday
    ADD CONSTRAINT txscenarioparameterday_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.mdparameter(parameter_id);
 i   ALTER TABLE ONLY public.txscenarioparameterday DROP CONSTRAINT txscenarioparameterday_parameter_id_fkey;
       public       postgres    false    261    371    3369            �           2606    141562 >   txscenarioparameterday txscenarioparameterday_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioparameterday
    ADD CONSTRAINT txscenarioparameterday_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id);
 h   ALTER TABLE ONLY public.txscenarioparameterday DROP CONSTRAINT txscenarioparameterday_scenario_id_fkey;
       public       postgres    false    269    371    3386            �           2606    141567 ;   txscenarioposturecurve txscenarioposturecurve_breed_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioposturecurve
    ADD CONSTRAINT txscenarioposturecurve_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.mdbreed(breed_id) ON UPDATE CASCADE ON DELETE CASCADE;
 e   ALTER TABLE ONLY public.txscenarioposturecurve DROP CONSTRAINT txscenarioposturecurve_breed_id_fkey;
       public       postgres    false    253    3357    372            �           2606    141572 G   txscenarioposturecurve txscenarioposturecurve_housingway_detail_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioposturecurve
    ADD CONSTRAINT txscenarioposturecurve_housingway_detail_id_fkey FOREIGN KEY (housingway_detail_id) REFERENCES public.txhousingway_detail(housingway_detail_id) ON UPDATE CASCADE ON DELETE CASCADE;
 q   ALTER TABLE ONLY public.txscenarioposturecurve DROP CONSTRAINT txscenarioposturecurve_housingway_detail_id_fkey;
       public       postgres    false    372    3564    358            �           2606    141577 >   txscenarioposturecurve txscenarioposturecurve_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioposturecurve
    ADD CONSTRAINT txscenarioposturecurve_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 h   ALTER TABLE ONLY public.txscenarioposturecurve DROP CONSTRAINT txscenarioposturecurve_scenario_id_fkey;
       public       postgres    false    372    3386    269            �           2606    141582 3   txscenarioprocess txscenarioprocess_process_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioprocess
    ADD CONSTRAINT txscenarioprocess_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.mdprocess(process_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ]   ALTER TABLE ONLY public.txscenarioprocess DROP CONSTRAINT txscenarioprocess_process_id_fkey;
       public       postgres    false    3374    263    373            �           2606    141587 4   txscenarioprocess txscenarioprocess_scenario_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.txscenarioprocess
    ADD CONSTRAINT txscenarioprocess_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.mdscenario(scenario_id) ON UPDATE CASCADE ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.txscenarioprocess DROP CONSTRAINT txscenarioprocess_scenario_id_fkey;
       public       postgres    false    373    3386    269            B      x������ � �      D      x������ � �      F      x������ � �      H      x������ � �      J      x������ � �      L      x������ � �      N      x������ � �      Q      x������ � �      R      x������ � �      q      x������ � �      s   K   x�3���K/J-����I�(-�2�9s:��%rs�BD�8�R�J�L`.�.��ɉE%�\�01�I1z\\\ ���      v   :  x�}��n�0���S�6��7�ä!!��⦦��&�I*uO?Ä�"�S����粄0:Ӊw�Cƻ#�IаwE9�َ[���ķB�,�JQď��%����%נ���d�L�X��5�F=���&D�vg�9}�y�
zt��L.�G
�ܹ[��=�*ڝ1	m��Y@�_��bϖ$��/�ΤՖ�|)�l�aK�y���Z�}`s1!�v�ٶ�{�O��*'��r'h����
��N!�g	�:n;�Oir�jX��b��o�6��*��}��xy0'�~��F�e��S�=Fj��&Y5�!��z*��/y�%      x   ^   x���	�0��aJ��w��sT
�Ä�9�d64���Ü���27�ypL��)Z�O�)��^���H��$A��ȏ������JF��=U��F      y      x������ � �      z      x������ � �      {      x������ � �      }   ;   x�3�J-(�O)MN�<�9/&�ˈ�5/=�(%�˘�'�,1�$U�R�����D�=... Վ         "   x�3�,�/rIMKM.����4�?�=... tj�      �      x������ � �      �      x������ � �      �      x������ � �      �   =   x�3�tL����,.)JL�/�4�420��5��54Q0��26�24�321�43�50����� ~};      �      x������ � �      �   `   x�3�t�,.���L�IU(H,JTp���J��L�+��'�eę�\Z������9���͇R\&��y�I�9�% e�.S΢��Ԣ2������� S�4"      �   M   x�3�4���K.MJL����2�4�t�K�/JI�2�4�t.�LT�T�I-K�+I�2�4�J-(�O)M.�/J,����� �r�      �   �   x�=�A�A �3��n�����4M�xXM��G7&�*u.�F�]����>�v��z̕�fy-������E�<�wE���Cu"��!C*��
�n���䌎�1��ʔU�$:�����R�v����;��������|��}zo5�      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �     