import {createClient} from '@supabase/supabase-js';
import {notFound} from 'next/navigation';
import Link from 'next/link';
export const dynamic='force-dynamic';
export const metadata={title:'Player profile',robots:{index:false,follow:false}};
type Props={params:Promise<{username:string}>};
function image(value:string|null){try{const u=new URL(value??'');return u.protocol==='https:'?u.href:null}catch{return null}}
export default async function Player({params}:Props){
 const {username}=await params;if(!/^[a-z0-9_]{3,24}$/.test(username))notFound();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return <section className="panel"><h1>Profile unavailable</h1></section>;
 const c=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}});
 const {data:p,error}=await c.from('profiles').select('username,display_name,bio,avatar_url,banner_url').eq('username',username).eq('is_public',true).maybeSingle();
 if(error)return <section className="panel"><h1>Profile temporarily unavailable</h1></section>;if(!p)notFound();
 const avatar=image(p.avatar_url),banner=image(p.banner_url);
 return <><section className="panel cvx-player-profile"><div className="cvx-player-banner">{banner&&<img src={banner} alt="" referrerPolicy="no-referrer"/>}</div><div className="cvx-player-identity"><div className="cvx-player-avatar">{avatar?<img src={avatar} alt="" referrerPolicy="no-referrer"/>:p.display_name.slice(0,1).toUpperCase()}</div><span className="eyebrow">CRITIVEX PLAYER</span><h1>{p.display_name}</h1><p>@{p.username}</p></div><div className="cvx-player-bio"><h2>About</h2><p>{p.bio||'No biography yet.'}</p></div></section><Link className="text-link" href="/community">Explore the community →</Link></>
}
