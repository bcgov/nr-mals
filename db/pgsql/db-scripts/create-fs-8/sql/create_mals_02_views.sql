SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;
	
--
-- VIEW:  MAL_LICENCE_SUMMARY_VW
--

CREATE OR REPLACE VIEW mal_licence_summary_vw as 
with registrants as (
  select 
       x.licence_id 
      ,string_agg(distinct r.last_name, '~' order by r.last_name) last_name
      ,string_agg(distinct r.company_name, '~' order by r.company_name) company_name
      ,string_agg(distinct r.email_address, '~' order by r.email_address) email_address
  from mal_registrant r
  inner join mal_licence_registrant_xref x 
  on r.id=x.registrant_id
  group by x.licence_id)
--
--  MAIN QUERY
--
select 
	 lic.id licence_id
	,lic.licence_type_id
	,lic.status_code_id
	,lic.region_id
	,lic.regional_district_id
	,lic.licence_number
	,lic.irma_number
	,lictyp.licence_name licence_type
	,reg.last_name
    ,reg.company_name
    ,reg.email_address
	,stat.code_description licence_status
	,lic.application_date
	,lic.issue_date
	,lic.expiry_date
	,rgn.region_name 
	,dist.district_name
from mal_licence lic
inner join mal_licence_type_lu lictyp 
on lic.licence_type_id = lictyp.id
inner join mals_app.mal_status_code_lu stat 
on lic.status_code_id = stat.id 
left join mals_app.mal_region_lu rgn 
on lic.region_id = rgn.id 
left join mals_app.mal_regional_district_lu dist
on lic.regional_district_id = dist.id
left join registrants reg 
on lic.id = reg.licence_id;
