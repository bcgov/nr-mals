
SET search_path TO mals_app, public;

-- create a named connection to patroni
SELECT dblink_connect('my_patroni_connection', 'patroni_dblink_fdw');


--###  
--###  
--###  LOOKUP TABLES
--###  
--###  

--	POPULATE MAL_LICENCE_TYPE_LU 
--		BEFORE mal_licence_species_code_lu

		insert into mals_app.mal_licence_type_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_licence_type_lu') 
				as temp_t(
			id integer,
			licence_type varchar(50),
			standard_fee numeric(10,2),
			licence_term integer,
			standard_issue_date timestamp,
			standard_expiry_date timestamp,
			renewal_notice smallint,
			active_flag boolean,
			legislation varchar(2000),
			regulation varchar(2000),
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

	
--	POPULATE MAL_LICENCE_SPECIES_CODE_LU 
--		BEFORE mal_licence_species_sub_code_lu
		
		insert into mals_app.mal_licence_species_code_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_licence_species_code_lu') 
				as temp_t(
			id integer,
			licence_type_id integer,
			code_name varchar(50),
			code_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

	
--	POPULATE MAL_REGION_LU 
--		BEFORE mal_regional_district_lu
		
		insert into mals_app.mal_region_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_region_lu') 
				as temp_t(
			id integer,
			region_number varchar(50),
			region_name varchar(200),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

	
--	POPULATE MAL_DAIRY_FARM_SPECIES_CODE_LU 
--		BEFORE mal_dairy_farm_species_sub_code_lu
		
		insert into mals_app.mal_dairy_farm_species_code_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_dairy_farm_species_code_lu') 
				as temp_t(
			id integer,
			code_name varchar(50),
			code_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

	
--	POPULATE MAL_SALE_YARD_SPECIES_CODE_LU 
--		BEFORE mal_sale_yard_species_sub_code_lu

		insert into mals_app.mal_sale_yard_species_code_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_sale_yard_species_code_lu') 
				as temp_t(
			id integer,
			code_name varchar(50),
			code_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;


--	POPULATE all other lookup tables
		
		insert into mals_app.mal_add_reason_code_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_add_reason_code_lu') 
				as temp_t(
			id integer,
			code_name varchar(50),
			code_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
			
		
		insert into mals_app.mal_city_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_city_lu') 
				as temp_t(
			id integer,
			city_name varchar(50),
			city_description varchar(120),
			province_code varchar(2),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
			
		
		insert into mals_app.mal_dairy_farm_species_sub_code_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_dairy_farm_species_sub_code_lu') 
				as temp_t(
			id integer,
			species_code_id integer,
			code_name varchar(50),
			code_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
			
		insert into mals_app.mal_dairy_farm_test_threshold_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_dairy_farm_test_threshold_lu') 
				as temp_t(
			id integer,
			species_code varchar(50),
			species_sub_code varchar(50),
			upper_limit numeric(8,2),
			infraction_window varchar(30),
			active_flag boolean,
			create_userid varchar(30),
			create_timestamp timestamp,
			update_userid varchar(30),
			update_timestamp timestamp
		) ;
		
		insert into mals_app.mal_dairy_farm_test_infraction_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_dairy_farm_test_infraction_lu') 
				as temp_t(
			id integer,
			test_threshold_id integer ,	
			previous_infractions_count integer,
			levy_percentage integer,
			correspondence_code varchar(50),
			correspondence_description varchar(120),
			active_flag boolean,
			create_userid varchar(30),
			create_timestamp timestamp,
			update_userid varchar(30),
			update_timestamp timestamp
		) ;
		
		insert into mals_app.mal_delete_reason_code_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_delete_reason_code_lu') 
				as temp_t(
			id integer,
			code_name varchar(50),
			code_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
			
		insert into mals_app.mal_licence_species_sub_code_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_licence_species_sub_code_lu') 
				as temp_t(
			id integer,
			species_code_id integer,
			code_name varchar(50),
			code_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
			
		insert into mals_app.mal_plant_code_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_plant_code_lu') 
				as temp_t(
			id integer,
			code_name varchar(50),
			code_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
	
		insert into mals_app.mal_regional_district_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_regional_district_lu') 
				as temp_t(
			id integer,
			region_id integer,
			district_number varchar(50),
			district_name varchar(200),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
			
		insert into mals_app.mal_sale_yard_species_sub_code_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_sale_yard_species_sub_code_lu') 
				as temp_t(
			id integer,
			species_code_id integer,
			code_name varchar(50),
			code_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
		
		insert into mals_app.mal_status_code_lu 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_status_code_lu') 
				as temp_t(
			id integer,
			code_name varchar(50),
			code_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;


--###  
--###  
--###  BASE TABLES
--###  
--###  

--	POPULATE MAL_REGISTRANT 
--		BEFORE mal_licence
--			   mal_licence_registrant_xref
		
		insert into mals_app.mal_registrant 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_registrant') 
				as temp_t(
			id integer,
			first_name varchar(200),
			last_name varchar(200),
			middle_initials varchar(3),
			official_title varchar(200),
			primary_phone varchar(10),
			secondary_phone varchar(10),
			fax_number varchar(10),
			email_address varchar(128),
			old_identifier varchar(100),
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

--	POPULATE MAL_LICENCE
--		BEFORE mal_dairy_farm_test_result
--			   mal_fur_farm_inventory
--			   mal_game_farm_inventory
--			   mal_licence_comment
--			   mal_sale_yard_inventory
--			   mal_licence_parent_child_xref
--			   mal_licence_registrant_xref
--			   mal_site
		
		insert into mals_app.mal_licence 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_licence') 
				as temp_t(
			id integer,
			licence_number integer,
			irma_number varchar(10),
			licence_type_id integer,
			status_code_id integer,
			primary_registrant_id integer,
			region_id integer,
			regional_district_id integer, 
			plant_code_id integer,
			species_code_id integer,
			company_name varchar(200),
			company_name_override boolean,
			address_line_1 varchar(100),
			address_line_2 varchar(100),
			city varchar(35),
			province varchar(4),
			postal_code varchar(6),
			country varchar(50),
			mail_address_line_1 varchar(100),
			mail_address_line_2 varchar(100),
			mail_city varchar(35),
			mail_province varchar(4),
			mail_postal_code varchar(6),
			mail_country varchar(50),
			gps_coordinates varchar(50),
			primary_phone varchar(10),
			secondary_phone varchar(10),
			fax_number varchar(10),	
			application_date date,
			issue_date date,
			expiry_date date,
			reissue_date date,
			fee_collected numeric(10,2),
			fee_collected_ind boolean,	
			bond_carrier_phone_number varchar(10),
			bond_number varchar(50),
			bond_value numeric(10,2),
			bond_carrier_name varchar(50),
			bond_continuation_expiry_date date,	
			dpl_approved_date date,
			dpl_received_date date,
			exam_date date,
			exam_fee numeric(10,2),
			dairy_levy numeric(38),
			df_active_ind boolean,
			hives_per_apiary integer,
			total_hives integer,
			licence_details varchar(2000),
			former_irma_number varchar(10),
			old_identifier varchar(100),
			action_required boolean,
			print_certificate boolean,
			print_renewal boolean,
			print_dairy_infraction boolean,
			legacy_game_farm_species_code varchar(10),
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

--	POPULATE MAL_SITE
--		BEFORE mal_dairy_farm_tank
		
		insert into mals_app.mal_site 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_site') 
				as temp_t(
			id integer,
			licence_id integer,
			apiary_site_id integer,
			region_id integer,
			regional_district_id integer,
			status_code_id integer,
			registration_date timestamp,
			deactivation_date timestamp,
			inspector_name  varchar(200),
			inspection_date timestamp,
			next_inspection_date timestamp,
			hive_count integer,
			contact_name varchar(50),
			primary_phone varchar(10),
			secondary_phone varchar(10),
			fax_number varchar(10),
			address_line_1 varchar(100),
			address_line_2 varchar(100),
			city varchar(35),
			province varchar(4),
			postal_code varchar(6),
			country varchar(50),
			gps_coordinates varchar(50),
			legal_description varchar(2000),
			site_details varchar(2000),
			parcel_identifier varchar(2000),
			old_identifier varchar(100),
			create_userid varchar(30),
			create_timestamp timestamp,
			update_userid varchar(30),
			update_timestamp timestamp,
			premises_id varchar(24)
		) ;

	
--	POPULATE MAL_APPLICATION_ROLE
--		BEFORE mal_application_user
		
		insert into mals_app.mal_application_role 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_application_role') 
				as temp_t(
			id integer,
			role_name varchar(50),
			role_description varchar(120),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

	
	
--	POPULATE MAL_DAIRY_FARM_TEST_JOB 
--		BEFORE mal_dairy_farm_test_result
		
		insert into mals_app.mal_dairy_farm_test_job 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_dairy_farm_test_job') 
				as temp_t(
			id integer,	
			job_status varchar(50),
			job_source varchar(30),
			execution_start_time timestamp,
			execution_end_time timestamp,
			source_row_count integer,
			target_insert_count integer,
			target_update_count integer,
			execution_comment varchar(2000),
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;


--	POPULATE all other base tables

		insert into mals_app.mal_apiary_inspection 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_apiary_inspection') 
				as temp_t(
			id integer,
			site_id integer,
			inspection_date timestamp,
			inspector_id varchar(10),
			colonies_tested integer,
			brood_tested integer,
			varroa_tested integer,
			small_hive_beetle_tested integer,
			american_foulbrood_result integer,
			european_foulbrood_result integer,
			small_hive_beetle_result integer,
			chalkbrood_result integer,
			sacbrood_result integer,
			nosema_result integer,
			varroa_mite_result integer,
			varroa_mite_result_percent numeric(5,2),
			other_result_description varchar(240),
			supers_inspected integer,
			supers_destroyed integer,
			inspection_comment varchar(2000),
			old_identifier varchar(100),
			create_userid varchar(30),
			create_timestamp timestamp,
			update_userid varchar(30),
			update_timestamp timestamp
		) ;

		insert into mals_app.mal_application_user 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_application_user') 
				as temp_t(
			id integer,
			application_role_id integer,
			user_name varchar(50),
			surname varchar(50),
			given_name_1 varchar(50),
			given_name_2 varchar(50),
			given_name_3 varchar(50),
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

		insert into mals_app.mal_dairy_farm_tank 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_dairy_farm_tank') 
				as temp_t(
			id integer,
			site_id integer,
			serial_number varchar(30),
			calibration_date timestamp,
			issue_date timestamp,
			company_name varchar(100),
			model_number varchar(30),
			tank_capacity varchar(30),
			recheck_year varchar(4),
			print_recheck_notice boolean,
			create_userid varchar(30),
			create_timestamp timestamp,
			update_userid varchar(30),
			update_timestamp timestamp
		) ;

		insert into mals_app.mal_dairy_farm_test_result 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_dairy_farm_test_result') 
				as temp_t(
			id integer,
			test_job_id integer,	
			licence_id integer,
			irma_number varchar(5),
			plant_code varchar(2),
			test_month integer,
			test_year integer,
			spc1_day varchar(2),
			spc1_date date,
			spc1_value numeric(10,2),
			spc1_infraction_flag boolean,
			spc1_previous_infraction_first_date date,
			spc1_previous_infraction_count integer,	
			spc1_levy_percentage integer,
			spc1_correspondence_code varchar(50),
			spc1_correspondence_description varchar(120),	
			scc_day varchar(2),
			scc_date date,
			scc_value numeric(10,2),
			scc_infraction_flag boolean,
			scc_previous_infraction_first_date date,
			scc_previous_infraction_count integer,	
			scc_levy_percentage integer,
			scc_correspondence_code varchar(50),
			scc_correspondence_description varchar(120),	
			cry_day varchar(2),
			cry_date date,
			cry_value numeric(10,2),
			cry_infraction_flag boolean,
			cry_previous_infraction_first_date date,
			cry_previous_infraction_count integer,	
			cry_levy_percentage integer,
			cry_correspondence_code varchar(50),
			cry_correspondence_description varchar(120),	
			ffa_day varchar(2),
			ffa_date date,
			ffa_value numeric(10,2),
			ffa_infraction_flag boolean,
			ffa_previous_infraction_first_date date,
			ffa_previous_infraction_count integer,	
			ffa_levy_percentage integer,
			ffa_correspondence_code varchar(50),
			ffa_correspondence_description varchar(120),	
			ih_day varchar(2),
			ih_date date,
			ih_value numeric(10,2),
			ih_infraction_flag boolean,
			ih_previous_infraction_first_date date,
			ih_previous_infraction_count integer,	
			ih_levy_percentage integer,
			ih_correspondence_code varchar(50),
			ih_correspondence_description varchar(120),	
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

		insert into mals_app.mal_fur_farm_inventory 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_fur_farm_inventory') 
				as temp_t(
			id integer,
			licence_id integer,
			species_sub_code_id integer,
			recorded_date timestamp,
			recorded_value double precision,
			old_identifier varchar(100),
			create_userid varchar(30),
			create_timestamp timestamp,
			update_userid varchar(30),
			update_timestamp timestamp
		) ;

		insert into mals_app.mal_game_farm_inventory 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_game_farm_inventory') 
				as temp_t(
			id integer,
			licence_id integer,
			species_sub_code_id integer,
			add_reason_code_id integer, 
			delete_reason_code_id integer, 
			recorded_date timestamp,
			recorded_value double precision,	
			tag_number varchar(10),
			abattoir_value varchar(20),
			buyer_seller  varchar(50),	
			create_userid varchar(30),
			create_timestamp timestamp,
			update_userid varchar(30),
			update_timestamp timestamp
		) ;

		insert into mals_app.mal_licence_comment 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_licence_comment') 
				as temp_t(
			id integer,
			licence_id integer,
			licence_comment varchar(4000),
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

		insert into mals_app.mal_print_job 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_print_job') 
				as temp_t(
			id integer,	
			print_job_number integer,	
			job_status varchar(30),
			print_category varchar(100),
			execution_start_time timestamp,
			json_end_time timestamp,
			document_end_time timestamp,
			certificate_json_count integer,
			envelope_json_count integer,
			card_json_count integer,
			renewal_json_count integer,
			dairy_infraction_json_count integer,
			recheck_notice_json_count integer,
			report_json_count integer,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;

		insert into mals_app.mal_print_job_output 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_print_job_output') 
				as temp_t(
			id integer,
			print_job_id integer,
			licence_type varchar(100),
			licence_number varchar(30),
			document_type varchar(30),
			document_json json,
			document_binary bytea,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
			
		insert into mals_app.mal_sale_yard_inventory 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_sale_yard_inventory') 
				as temp_t(
			id integer,
			licence_id integer,
			species_sub_code_id integer,
			recorded_date timestamp,
			recorded_value double precision,
			create_userid varchar(30),
			create_timestamp timestamp,
			update_userid varchar(30),
			update_timestamp timestamp
		) ;

		insert into mals_app.mal_premises_job 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_premises_job') 
				as temp_t(
			id int4,
			job_status varchar(50),
			execution_start_time timestamp,
			execution_end_time timestamp,
			source_row_count int4,
			source_insert_count int4,
			source_update_count int4,
			source_do_not_import_count int4,
			target_insert_count int4,
			target_update_count int4,
			execution_comment varchar(2000),
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		);

		insert into mals_app.mal_premises_detail 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_premises_detail') 
				as temp_t(
			id int4,
			premises_job_id int4,
			source_operation_pk int4,
			source_last_change_date varchar(30),
			source_premises_id varchar(24),
			import_action varchar(20),
			import_status varchar(20),
			licence_id int4,
			licence_number int4,
			licence_action varchar(20),
			licence_status varchar(20),
			licence_status_timestamp timestamp,
			licence_company_name varchar(200),
			licence_total_hives int4,
			licence_mail_address_line_1 varchar(100),
			licence_mail_address_line_2 varchar(100),
			licence_mail_city varchar(35),
			licence_mail_province varchar(4),
			licence_mail_postal_code varchar(6),
			site_id int4,
			apiary_site_id int4,
			site_action varchar(20),
			site_status varchar(20),
			site_status_timestamp timestamp,
			site_address_line_1 varchar(100),
			site_region_name varchar(200),
			site_regional_district_name varchar(200),
			registrant_id int4,
			registrant_action varchar(20),
			registrant_status varchar(20),
			registrant_status_timestamp timestamp,
			registrant_first_name varchar(200),
			registrant_last_name varchar(200),
			registrant_primary_phone varchar(10),
			registrant_secondary_phone varchar(10),
			registrant_fax_number varchar(10),
			registrant_email_address varchar(128),
			process_comments varchar(2000),
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		);


--###  
--###  
--###  CROSS REFERENCE TABLES
--###  
--###  

		insert into mals_app.mal_licence_type_parent_child_xref 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_licence_type_parent_child_xref') 
				as temp_t(
			id integer,
			parent_licence_type_id integer,
			child_licence_type_id integer,
			active_flag boolean,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
		
		insert into mals_app.mal_licence_parent_child_xref 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_licence_parent_child_xref') 
				as temp_t(
			id integer,
			parent_licence_id integer,
			child_licence_id integer,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
		
		insert into mals_app.mal_licence_registrant_xref 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_licence_registrant_xref') 
				as temp_t(
			id integer,
			licence_id integer,
			registrant_id integer,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
