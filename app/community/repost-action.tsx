'use client';
import {useEffect,useMemo,useState} from 'react';
import {browserClient} from '../../lib/supabase';
export default function RepostAction({id,uid,owner}:{id:string;uid:string;owner:string}){
 const c=useMemo(browserClient,[]),[saved,S]=useState(false),[ready,R]=useState(false),[busy,B]=useState(false),[open,O]=useState(false),[quote,Q]=useState(''),[error,E]=useState('');
 useEffect(()=>{S(false);R(false);O(false);Q('');E('');if(!c||!uid||uid===owner)return;let active=true;void Promise.resolve(c.from('social_reposts').select('post_id').eq('user_id',uid).eq('post_id',id).maybeSingle()).then(r=>{if(active&&!r.error){S(!!r.data);R(true)}}).catch(()=>{});return()=>{active=false}},[c,id,uid,owner]);
 async function change(text:string){if(!c||!uid||busy||!ready)return;B(true);E('');try{const r=saved?await c.from('social_reposts').delete().eq('user_id',uid).eq('post_id',id):await c.from('social_reposts').insert({post_id:id,quote:text.trim()});if(r.error)throw r.error;S(!saved);O(false);Q('')}catch{E('Unable to update repost.')}finally{B(false)}}
 if(!uid||uid===owner)return null;
 return <span className="cvx-repost-action"><button type="button" className="secondary" disabled={!ready||busy} aria-pressed={saved} onClick={()=>void change('')}>{saved?'Undo repost':'Repost'}</button>{!saved&&<button type="button" className="secondary" disabled={!ready||busy} onClick={()=>O(!open)}>Quote</button>}{open&&<span><textarea aria-label="Quote post" maxLength={2000} value={quote} onChange={e=>Q(e.target.value)}/><button type="button" disabled={busy||!quote.trim()} onClick={()=>void change(quote)}>Publish quote</button></span>}{error&&<small role="alert">{error}</small>}</span>
}
