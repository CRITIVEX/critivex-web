import {createClient,type SupabaseClient} from '@supabase/supabase-js';
let shared:SupabaseClient|null=null;
export function browserClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)return null;if(typeof window==='undefined')return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});return shared??=createClient(url,key);}
