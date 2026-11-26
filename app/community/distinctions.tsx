'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../lib/supabase';
export function Badge({kind}:{kind:string|null}){
 if(!kind)return null;
 const label=kind==='government'?'Verified government or public institution':kind==='organisation'?'Verified organisation':kind==='founder'?'Critivex founder':kind==='official'?'Official Critivex account':'Verified account';
 const color=kind==='government'?'#a1a1aa':kind==='organisation'||kind==='official'?'#d4a72c':kind==='founder'?'#8b5cf6':'#3b82f6';
 return <span className="cvx-check-icon" tabIndex={0} role="img" aria-label={label} title={label}><svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path fill={color} d="M12 1 15 4 19 4 20 8 23 12 20 16 19 20 15 20 12 23 9 20 5 20 4 16 1 12 4 8 5 4 9 4Z"/><path d="m7 12 3 3 7-7" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
}
export function PlayerBadge({id}:{id:string}){
 const c=useMemo(browserClient,[]),[kind,K]=useState<string|null>(null);
 useEffect(()=>{K(null);if(!c||!id)return;let active=true;void Promise.all([c.from('player_distinctions').select('kind').eq('user_id',id).maybeSingle(),c.from('verified_organisations').select('category').eq('user_id',id).maybeSingle()]).then(([d,o])=>{if(active)K(o.data?(o.data.category==='government'?'government':'organisation'):d.data?.kind??null)}).catch(()=>{});return()=>{active=false}},[c,id]);
 return <Badge kind={kind}/>
}
type Featured={user_id:string;kind:string;profiles:{username:string;display_name:string|null}|null};
export function FeaturedPlayers(){const c=useMemo(browserClient,[]),[rows,R]=useState<Featured[]>([]);useEffect(()=>{if(!c)return;let active=true;async function load(){const d=await c!.from('player_distinctions').select('user_id,kind').eq('featured',true).limit(12);if(d.error||!d.data?.length)return;const p=await c!.from('profiles').select('user_id,username,display_name').in('user_id',d.data.map(x=>x.user_id));if(active)R(d.data.map(x=>({...x,profiles:p.data?.find(y=>y.user_id===x.user_id)??null})))}void load().catch(()=>{});return()=>{active=false}},[c]);return rows.some(x=>x.profiles?.username)?<section className="panel cvx-featured-players"><h2>Recommended accounts</h2>{rows.map(x=>x.profiles?.username?<div key={x.user_id}><Link href={'/players/'+encodeURIComponent(x.profiles.username)}>{x.profiles.display_name||x.profiles.username}</Link> <Badge kind={x.kind}/></div>:null)}</section>:null}
