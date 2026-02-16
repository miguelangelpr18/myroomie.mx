table_name,column_name,data_type
profiles,budget_max,numeric
listings,user_id,uuid
listings,price_mxn,integer
listings,created_at,timestamp with time zone
listings,updated_at,timestamp with time zone
listings,featured_until,timestamp with time zone
listings,location_id,uuid
listings,lifestyle_prefs,jsonb
listing_saves,id,uuid
listing_saves,user_id,uuid
listing_saves,listing_id,uuid
listing_saves,created_at,timestamp with time zone
threads,id,uuid
threads,user1_id,uuid
threads,user2_id,uuid
threads,listing_id,uuid
threads,created_at,timestamp with time zone
messages,id,uuid
messages,thread_id,uuid
messages,sender_id,uuid
messages,created_at,timestamp with time zone
profiles,created_at,timestamp with time zone
profiles,updated_at,timestamp with time zone
profiles,pets,boolean
profiles,smoker,boolean
profiles,cleanliness,smallint
profiles,parties,boolean
profiles,featured_until,timestamp with time zone
profiles,budget_min,numeric
profiles,user_id,uuid
profiles,location_id,uuid
locations,id,uuid
locations,lat,double precision
locations,lng,double precision
locations,created_at,timestamp with time zone
listings,id,uuid
profiles,display_name,text
profiles,city,text
profiles,zone,text
profiles,avatar_url,text
locations,region,text
locations,country,text
listings,city,text
listings,zone,text
listings,listing_subtype,text
listings,amenities,ARRAY
profiles,schedule,text
messages,body,text
listings,listing_type,text
listings,title,text
listings,description,text
listings,image_urls,ARRAY
locations,provider,text
locations,place_id,text
locations,label,text
locations,city,text