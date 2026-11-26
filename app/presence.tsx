'use client';
import {useEffect,useMemo,useState,useRef} from 'react';
import {browserClient} from '../lib/supabase';
export default function Presence(){
 const c=useMemo(browserClient,[]),[uid,U]=useState(''),[mode,M]=useState(''),[busy,B]=useState(false),[error,E]=useState(''),last=useRef(Date.now());
 useEffect(()=>{if(!c)return;const {data:{subscription}}=c.auth.onAuthStateChange((_e,s)=>U(s?.user.id??''));return()=>subscription.unsubscribe()},[c]);
 useEffect(()=>{M('');if(!c||!uid)return;let live=true;const activity=()=>{last.current=Date.now()};const beat=()=>{if(document.hidden)return;void Promise.resolve(c.rpc('presence_heartbeat',{active:Date.now()-last.current<60000})).then(r=>{if(live&&!r.error)M(r.data)}).catch(()=>{})};window.addEventListener('pointerdown',activity);window.addEventListener('keydown',activity);document.addEventListener('visibilitychange',beat);beat();const timer=setInterval(beat,60000);return()=>{live=false;clearInterval(timer);window.removeEventListener('pointerdown',activity);window.removeEventListener('keydown',activity);document.removeEventListener('visibilitychange',beat)}},[c,uid]);
 async function change(value:string){if(!c||busy)return;B(true);E('');try{const r=await c.rpc('presence_heartbeat',{active:true,requested_mode:value});if(r.error)throw r.error;M(r.data)}catch{E('Unable to change status.')}finally{B(false)}}
 if(!uid||!mode)return null;return <div className="cvx-presence-control"><label>Activity status <select value={mode} disabled={busy} onChange={e=>void change(e.target.value)}><option value="online">Online</option><option value="away">Away</option><option value="offline">Offline</option><option value="invisible">Invisible</option></select></label>{error&&<small role="alert">{error}</small>}</div>
}
export function PlayerStatus({id}:{id:string}){
 const c=useMemo(browserClient,[]),[status,S]=useState(''),[uid,U]=useState('');
 useEffect(()=>{if(!c)return;const {data:{subscription}}=c.auth.onAuthStateChange((_e,s)=>U(s?.user.id??''));return()=>subscription.unsubscribe()},[c]);
 useEffect(()=>{S('');if(!c||!uid)return;let live=true;const load=()=>{if(document.hidden)return;void Promise.resolve(c.rpc('player_status',{player:id})).then(r=>{if(live&&!r.error)S(r.data)}).catch(()=>{})};load();const t=setInterval(load,60000);return()=>{live=false;clearInterval(t)}},[c,id,uid]);
 return status?<span className={'cvx-player-status status-'+status}><i/>{status}</span>:null
}
