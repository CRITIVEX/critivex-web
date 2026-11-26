'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../../lib/supabase';
type Player={user_id:string;username:string;display_name:string|null;avatar_url:string|null;total:number};
function safe(url:string|null){try{return url&&new URL(url).protocol==='https:'?url:null}catch{return null}}
export default function MutualFollowers({id,uid,revision=0}:{id:string;uid:string;revision?:number}){
 const c=useMemo(browserClient,[]),[result,R]=useState<{key:string;rows:Player[]}|null>(null),[expanded,E]=useState(false);
 const key=uid+':'+id+':'+revision;
 useEffect(()=>{R(null);E(false);if(!c||!uid||uid===id)return;let active=true;void Promise.resolve(c.rpc('mutual_followers',{player:id})).then(r=>{if(active&&!r.error)R({key,rows:r.data??[]})}).catch(()=>{});return()=>{active=false}},[c,id,uid,key]);
 const rows=result?.key===key?result.rows:[];
 if(!uid||uid===id||!rows.length)return null;
 const total=Number(rows[0].total),first=rows.slice(0,2);
 return <section className="panel cvx-mutual-followers"><div className="cvx-mutual-summary"><div className="cvx-mutual-avatars">{rows.slice(0,3).map(p=><Link key={p.user_id} href={'/players/'+encodeURIComponent(p.username)} aria-label={p.display_name||p.username}>{safe(p.avatar_url)?<img src={safe(p.avatar_url)!} alt="" referrerPolicy="no-referrer"/>:(p.display_name||p.username)[0].toUpperCase()}</Link>)}</div><p>Followed by {first.map((p,i)=><span key={p.user_id}>{i>0?', ':''}<Link href={'/players/'+encodeURIComponent(p.username)}><strong>{p.display_name||p.username}</strong></Link></span>)}{total>first.length?' and '+(total-first.length)+' others':''}</p><button type="button" className="secondary" aria-expanded={expanded} onClick={()=>E(v=>!v)}>{expanded?'Hide':'View'}</button></div>{expanded&&<div className="cvx-mutual-list">{rows.map(p=><Link key={p.user_id} href={'/players/'+encodeURIComponent(p.username)}>{p.display_name||p.username} <small>@{p.username}</small></Link>)}{total>rows.length&&<small>Showing {rows.length} of {total} shared followers.</small>}</div>}</section>
}
