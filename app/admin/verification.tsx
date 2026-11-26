'use client';
import {useEffect,useMemo,useState} from 'react';
import {browserClient} from '../../lib/supabase';
type Application={id:string;user_id:string;kind:string;name:string;website:string;details:string};
export default function VerificationAdmin(){const c=useMemo(browserClient,[]),[rows,R]=useState<Application[]>([]),[msg,M]=useState(''),[busy,B]=useState(false),[rev,V]=useState(0);
 useEffect(()=>{if(!c)return;let active=true;void Promise.resolve(c.from('verification_applications').select('id,user_id,kind,name,website,details').eq('status','pending').order('created_at').limit(50)).then(r=>{if(active){if(r.error)M('Unable to load applications.');else R(r.data??[])}}).catch(()=>{if(active)M('Unable to load applications.')});return()=>{active=false}},[c,rev]);
 async function decide(id:string,approve:boolean){if(!c||busy||!confirm(approve?'Confirm identity and approve verification?':'Reject application?'))return;B(true);try{const r=await c.rpc('decide_verification',{application:id,approve});if(r.error)throw r.error;M('Decision saved.');V(v=>v+1)}catch{M('Unable to save decision. Check public profile and logo.')}finally{B(false)}}
 return <section className="panel"><h2>Verification applications</h2><p>Independently confirm the applicant’s identity and authority before approving.</p>{msg&&<p role="status">{msg}</p>}{!rows.length&&<p>No pending applications loaded.</p>}{rows.map(a=><article className="panel" key={a.id}><h3>{a.name}</h3><p>{a.kind} · {a.user_id}</p><p>{a.website}</p><p>{a.details}</p><button disabled={busy} onClick={()=>void decide(a.id,true)}>Approve</button><button disabled={busy} onClick={()=>void decide(a.id,false)}>Reject</button></article>)}</section>
}
