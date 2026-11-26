'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../lib/supabase';
type Affiliation={name:string;logo_url:string;username:string};
export default function Affiliations({id}:{id:string}){
 const c=useMemo(browserClient,[]),[rows,R]=useState<Affiliation[]>([]);
 useEffect(()=>{R([]);if(!c)return;let active=true;void Promise.resolve(c.rpc('player_affiliations',{player:id})).then(r=>{if(active&&!r.error)R(r.data??[])}).catch(()=>{});return()=>{active=false}},[c,id]);
 return <span className="cvx-affiliations">{rows.map(a=><Link key={a.username} className="cvx-affiliation" href={'/players/'+encodeURIComponent(a.username)} aria-label={'This account is affiliated with '+a.name+' on Critivex. View organisation.'}><img src={a.logo_url} alt={a.name} referrerPolicy="no-referrer"/><span className="cvx-affiliation-tooltip" role="tooltip">This account is affiliated with {a.name} on Critivex.</span></Link>)}</span>
}
