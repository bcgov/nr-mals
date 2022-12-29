
SET search_path TO mals_app;

/*
 	On Patroni pods,
 
	Generate ALTER SEQUENCE statements, on the patroni pods, to update the next value, and save to file
		select 'alter sequence ' || schemaname || '.' || sequencename || ' restart with ' || coalesce(last_value,0) + 1 || ';' str
		from pg_sequences 
		order by 1;
*/

--
-- Populate this file with the output of the above statement
--

ERROR, the ALTER SEQUENCE statements were not generated
