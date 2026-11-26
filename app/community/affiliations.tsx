'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../lib/supabase';
type Affiliation={name:string;logo_url:string;username:string};
export default function Affiliations({id}:{id:string}){
 const c=useMemo(browserClient,[]),[rows,R]=useState<Affiliation[]>([]);
 useEffect(()=>{R([]);if(!c)return;let active=true;void Promise.resolve(c.rpc('player_affiliations',{player:id})).then(r=>{if(active&&!r.error)R(r.data??[])}).catch(()=>{});return()=>{active=false}},[c,id]);
 return <span className="cvx-affiliations">{rows.map(a=><Link key={a.username} className="cvx-affiliation" href={'/players/'+encodeURIComponent(a.username)} aria-label={'This account is affiliated with '+a.name+' on Critivex. View organisation.'}><img src={a.logo_url} alt={a.name} referrerPolicy="no-referrer"/><span className="cvx-affiliation-tooltip" role="tooltip"><span className="cvx-affiliation-card-head"><img className="cvx-affiliation-card-logo" src={a.logo_url} alt="" referrerPolicy="no-referrer"/><span className="cvx-affiliation-card-identity"><span className="cvx-affiliation-card-name">{a.name}<svg width="18" height="18" viewBox="0 0 24 24" aria-label="Verified organisation" role="img"><path fill="#d4a72c" d="M12 1 15 4 19 4 20 8 23 12 20 16 19 20 15 20 12 23 9 20 5 20 4 16 1 12 4 8 5 4 9 4Z"/><path d="m7 12 3 3 7-7" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span className="cvx-affiliation-card-handle">@{a.username}</span></span></span><span className="cvx-affiliation-card-description">This account is affiliated with <b>{a.name}</b> on Critivex.</span><span className="cvx-affiliation-card-action">View organisation profile →</span></span></Link>)}</span>
}
