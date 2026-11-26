'use client';
import {useMemo,useState,useEffect} from 'react';
import {browserClient} from '../../lib/supabase';
export function Report({postId,commentId}:{postId?:string;commentId?:string}){
 const c=useMemo(browserClient,[]),[open,O]=useState(false),[reason,R]=useState('spam'),[details,D]=useState(''),[busy,B]=useState(false),[message,M]=useState('');
 return <div className="cvx-report"><button type="button" className="secondary" onClick={()=>O(!open)}>Report</button>{open&&<form onSubmit={async e=>{e.preventDefault();if(!c||busy)return;B(true);M('');try{const r=await c.from('social_reports').insert({post_id:postId??null,comment_id:commentId??null,reason,details});if(r.error)throw r.error;O(false);M('Report submitted.');D('')}catch{M('Unable to submit report.')}finally{B(false)}}}><label>Reason<select value={reason} onChange={e=>R(e.target.value)}>{['spam','harassment','hate','sexual','violence','other'].map(x=><option key={x}>{x}</option>)}</select></label><textarea aria-label="Additional details" maxLength={1000} value={details} onChange={e=>D(e.target.value)}/><button disabled={busy}>Submit report</button></form>}{message&&<p role="status">{message}</p>}</div>
}
export function Block({uid,target}:{uid:string;target:string}){
 const c=useMemo(browserClient,[]),[blocked,S]=useState(false),[ready,R]=useState(false),[busy,B]=useState(false),[error,E]=useState('');
 useEffect(()=>{R(false);S(false);if(!c||!uid||uid===target)return;let active=true;void Promise.resolve(c.from('social_blocks').select('blocked_id').eq('blocker_id',uid).eq('blocked_id',target).maybeSingle()).then(r=>{if(active&&!r.error){S(!!r.data);R(true)}});return()=>{active=false}},[c,uid,target]);
 if(!uid||uid===target)return null;return <div><button className="secondary" disabled={!ready||busy} onClick={async()=>{if(!c||!confirm(blocked?'Unblock this player?':'Block this player?'))return;B(true);E('');try{const r=blocked?await c.from('social_blocks').delete().eq('blocker_id',uid).eq('blocked_id',target):await c.from('social_blocks').insert({blocked_id:target});if(r.error)throw r.error;window.location.reload()}catch{E('Unable to update block.')}finally{B(false)}}}>{blocked?'Unblock':'Block player'}</button>{error&&<p role="alert">{error}</p>}</div>
}
