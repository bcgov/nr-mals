
--### 
--###  dblink, mapping and named connection
--### 


--###  postgres@mal_dev_spilo - mals_app@mals

	-- install the extension
	CREATE EXTENSION dblink;
	
	CREATE SERVER patroni_dblink_fdw
	    FOREIGN DATA WRAPPER dblink_fdw
	    OPTIONS (host '<<mals patroni cluster IP>>', port '5432', dbname 'mals');
	
	-- permit mals to use the foreign server
	--GRANT USAGE ON FOREIGN SERVER patroni_dblink_fdw TO mals;	   
	
	-- The first mals user is local, the second is remote
	CREATE USER MAPPING FOR postgres
	    SERVER patroni_dblink_fdw
	    OPTIONS (user 'mals', password '<<mals patroni cluster password>>');

/*
	-- veiw the data over the database link
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
				);
*/
		
