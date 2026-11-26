'use client';
import {useEffect,useMemo,useState} from 'react';
import {browserClient} from '../../../lib/supabase';
type Badge={code:string;label:string;progress:number;target:number};
export default function Achievements({id}:{id:string}){
 const c=useMemo(browserClient,[]),[rows,R]=useState<Badge[]>([]),[error,E]=useState(false),[loading,L]=useState(true);
 useEffect(()=>{if(!c){E(true);L(false);return}let active=true;async function load(){try{const r=await c!.rpc('player_achievements',{player:id});if(active){if(r.error)throw r.error;R(r.data??[]);E(false)}}catch{if(active)E(true)}finally{if(active)L(false)}}void load();const refresh=()=>void load();window.addEventListener('focus',refresh);return()=>{active=false;window.removeEventListener('focus',refresh)}},[c,id]);
 return <section className="panel cvx-achievements"><h2>Gaming achievements</h2>{loading?<p>Loading milestones…</p>:error?<p>Achievements temporarily unavailable.</p>:!rows.length?<p>No public achievements available.</p>:<><div className="cvx-achievement-stats">{rows.filter(x=>['first_post','first_review','collector'].includes(x.code)).map(x=><div key={x.code}><strong>{x.progress}</strong><small>{x.code==='first_post'?'Posts':x.code==='first_review'?'Published reviews':'Public collections'}</small></div>)}</div><div className="cvx-achievement-grid">{rows.map(x=><article key={x.code} className={x.progress>=x.target?'earned':''}><span aria-hidden="true">{x.progress>=x.target?'★':'◇'}</span><strong>{x.label}</strong><small>{x.progress>=x.target?'Earned':x.progress+'/'+x.target}</small><progress max={x.target} value={Math.min(x.progress,x.target)}/></article>)}</div></>}</section>
}
