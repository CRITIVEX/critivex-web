import {notFound} from 'next/navigation';
import Link from 'next/link';
import {createClient} from '@supabase/supabase-js';
import PostText from '../../post-text';
export const dynamic='force-dynamic';
export const metadata={title:'Community topic',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{topic:string}>}){
 const {topic}=await params;if(!/^[A-Za-z0-9_]{1,40}$/.test(topic))notFound();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 const r=url&&key?await createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}}).rpc('topic_posts',{topic}):{data:null,error:true};
 return <section className="panel"><Link href="/community">← Community</Link><h1>#{topic}</h1><p>Latest public discussions</p>{r.error?<p>Topic unavailable.</p>:r.data?.length?r.data.map((p:{id:string;username:string;display_name:string;body:string;created_at:string})=><article className="panel" key={p.id}><Link href={'/players/'+encodeURIComponent(p.username)}><strong>{p.display_name||p.username}</strong></Link><PostText body={p.body}/><Link href={'/community/post/'+p.id}>View discussion →</Link></article>):<p>No posts yet.</p>}</section>
}
