'use client';
import {useEffect,useMemo,useState} from 'react';
import {browserClient} from '../../lib/supabase';
type Report={id:string;post_id:string|null;comment_id:string|null;reason:string;details:string;status:string;created_at:string};
export default function SocialReports(){
 const c=useMemo(browserClient,[]),[rows,R]=useState<Report[]>([]),[error,E]=useState(''),[busy,B]=useState(false),[revision,V]=useState(0);
 useEffect(()=>{if(!c)return;let active=true;void Promise.resolve(c.from('social_reports').select('id,post_id,comment_id,reason,details,status,created_at').eq('status','pending').order('created_at').limit(50)).then(r=>{if(active){if(r.error)E('Social reports unavailable.');else{R(r.data??[]);E('')}}});return()=>{active=false}},[c,revision]);
 async function resolve(id:string,status:string){if(!c||busy)return;B(true);try{const r=await c.from('social_reports').update({status}).eq('id',id);if(r.error)throw r.error;V(v=>v+1)}catch{E('Unable to update report.')}finally{B(false)}}
 return <section className="panel"><h2>Social reports</h2><button onClick={()=>V(v=>v+1)}>Refresh</button>{error&&<p role="alert">{error}</p>}{!error&&!rows.length&&<p>No pending reports loaded.</p>}{rows.map(r=><article className="panel" key={r.id}><strong>{r.reason}</strong><p>{r.details}</p><p>{r.post_id?'Post: '+r.post_id:r.comment_id?'Comment: '+r.comment_id:'Content removed'}</p><time>{r.created_at}</time><div><button disabled={busy} onClick={()=>void resolve(r.id,'resolved')}>Resolve</button><button disabled={busy} onClick={()=>void resolve(r.id,'dismissed')}>Dismiss</button></div></article>)}</section>
}
