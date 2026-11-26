'use client';
import {useEffect,useMemo,useState} from 'react';
import {browserClient} from '../../../lib/supabase';
const defaults={favourites:true,links:true,connections:true,activity:true,allow_follows:true,allow_messages:true};
const labels={favourites:'Show favourite games',links:'Show social links',connections:'Show follower connections to other players',activity:'Share activity status',allow_follows:'Allow new followers',allow_messages:'Allow incoming direct messages'};
type Settings=typeof defaults;
export default function Privacy({id}:{id:string}){
 const c=useMemo(browserClient,[]),[uid,U]=useState(''),[settings,S]=useState<Settings>(defaults),[ready,T]=useState(false),[exists,X]=useState(false),[busy,B]=useState(false),[message,M]=useState('');
 useEffect(()=>{if(!c)return;const {data:{subscription}}=c.auth.onAuthStateChange((_e,s)=>U(s?.user.id??''));return()=>subscription.unsubscribe()},[c]);
 useEffect(()=>{T(false);S(defaults);X(false);M('');if(!c||uid!==id)return;let active=true;void Promise.resolve(c.from('player_privacy').select('favourites,links,connections,activity,allow_follows,allow_messages').eq('user_id',uid).maybeSingle()).then(r=>{if(!active)return;if(r.error){M('Privacy settings unavailable.');return}S(r.data??defaults);X(!!r.data);T(true)}).catch(()=>{if(active)M('Privacy settings unavailable.')});return()=>{active=false}},[c,id,uid]);
 async function save(){if(!c||uid!==id||busy||!ready)return;B(true);M('');try{const r=exists?await c.from('player_privacy').update(settings).eq('user_id',uid):await c.from('player_privacy').insert(settings);if(r.error)throw r.error;X(true);M('Privacy settings saved.')}catch{M('Unable to save privacy settings.')}finally{B(false)}}
 if(uid!==id)return null;
 return <section className="panel cvx-privacy-editor"><h2>Privacy settings</h2><p>Choose what other players can see and how they can interact with you. Existing followers and message history are not removed.</p>{ready&&<form onSubmit={e=>{e.preventDefault();void save()}}>{(Object.keys(defaults) as (keyof Settings)[]).map(k=><label key={k}><input type="checkbox" checked={settings[k]} disabled={busy} onChange={e=>S(old=>({...old,[k]:e.target.checked}))}/>{labels[k]}</label>)}<button type="submit" disabled={busy}>Save privacy settings</button></form>}{message&&<p role="status">{message}</p>}</section>
}
