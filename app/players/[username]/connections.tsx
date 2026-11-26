'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../../lib/supabase';
import {PlayerBadge} from '../../community/distinctions';
import Affiliations from '../../community/affiliations';
type Mode='followers'|'following';
type Person={user_id:string;username:string;display_name:string|null;avatar_url:string|null};
export default function Connections({id,uid,name,followers,following,refresh,ready}:{id:string;uid:string;name:string;followers:number;following:number;refresh:()=>void;ready:boolean}){
 const c=useMemo(browserClient,[]),dialog=useRef<HTMLDialogElement>(null);
 const [mode,M]=useState<Mode|null>(null),[rows,R]=useState<Person[]>([]),[mine,F]=useState<string[]>([]),[loading,L]=useState(false),[error,E]=useState(''),[busy,B]=useState(false),[page,P]=useState(0),[more,H]=useState(false),[search,S]=useState(''),[revision,V]=useState(0);
 useEffect(()=>{if(mode&&dialog.current&&!dialog.current.open)dialog.current.showModal()},[mode]);
 useEffect(()=>{if(!c||!mode)return;let active=true;L(true);E('');R([]);F([]);H(false);
 async function load(){
 const field=mode==='followers'?'follower_id':'following_id',filter=mode==='followers'?'following_id':'follower_id';
 const edges=await c!.from('social_follows').select('follower_id,following_id').eq(filter,id).order(field).range(page*40,page*40+40);
 if(edges.error)throw edges.error;
 const ids=(edges.data??[]).slice(0,40).map(e=>e[field] as string);
 const [profiles,own]=await Promise.all([ids.length?c!.from('profiles').select('user_id,username,display_name,avatar_url').in('user_id',ids).not('username','is',null):Promise.resolve({data:[],error:null}),uid&&ids.length?c!.from('social_follows').select('following_id').eq('follower_id',uid).in('following_id',ids):Promise.resolve({data:[],error:null})]);
 if(profiles.error||own.error)throw profiles.error||own.error;
 if(active){R((profiles.data??[]) as Person[]);F((own.data??[]).map(e=>e.following_id));H((edges.data??[]).length>40)}
 }
 void load().catch(()=>{if(active)E('Unable to load connections. Try again.')}).finally(()=>{if(active)L(false)});return()=>{active=false};
 },[c,id,uid,mode,page,revision]);
 function choose(value:Mode){M(value);P(0);S('')}
 async function toggle(person:Person){if(!c||!uid||busy||person.user_id===uid)return;B(true);E('');try{const result=mine.includes(person.user_id)?await c.from('social_follows').delete().eq('follower_id',uid).eq('following_id',person.user_id):await c.from('social_follows').insert({following_id:person.user_id});if(result.error)throw result.error;V(v=>v+1);refresh()}catch{E('Unable to change follow status.')}finally{B(false)}}
 const filtered=rows.filter(p=>(p.username+' '+(p.display_name??'')).toLowerCase().includes(search.toLowerCase()));
 return <><button type="button" className="cvx-connection-count" disabled={!ready} onClick={()=>choose('followers')}><strong>{followers}</strong><span>Followers</span></button><button type="button" className="cvx-connection-count" disabled={!ready} onClick={()=>choose('following')}><strong>{following}</strong><span>Following</span></button><dialog ref={dialog} className="cvx-connections-dialog" aria-label={name+' connections'} onClose={()=>{M(null);R([])}}><header><h2>{name}</h2><button type="button" className="secondary" onClick={()=>dialog.current?.close()} aria-label="Close connections">×</button></header><div className="cvx-connections-tabs"><button type="button" aria-pressed={mode==='followers'} disabled={busy} onClick={()=>choose('followers')}>Followers {followers}</button><button type="button" aria-pressed={mode==='following'} disabled={busy} onClick={()=>choose('following')}>Following {following}</button></div><input aria-label="Filter current page" placeholder="Search this page" value={search} onChange={e=>S(e.target.value)}/>{error&&<p role="alert">{error}</p>}<div className="cvx-connections-list">{loading?<p role="status">Loading…</p>:filtered.length?filtered.map(p=><article key={p.user_id}><Link href={'/players/'+encodeURIComponent(p.username)} className="cvx-social-avatar" onClick={()=>dialog.current?.close()}>{p.avatar_url?.startsWith('https://')?<img src={p.avatar_url} alt="" referrerPolicy="no-referrer"/>:(p.display_name||p.username)[0].toUpperCase()}</Link><div className="cvx-connection-person"><Link href={'/players/'+encodeURIComponent(p.username)} onClick={()=>dialog.current?.close()}><strong>{p.display_name||p.username}</strong></Link><PlayerBadge id={p.user_id}/><Affiliations id={p.user_id}/><small>@{p.username}</small></div>{uid&&uid!==p.user_id?<button type="button" className={mine.includes(p.user_id)?'secondary':'cta'} disabled={busy} onClick={()=>void toggle(p)}>{mine.includes(p.user_id)?'Following':'Follow'}</button>:!uid?<Link href="/account" onClick={()=>dialog.current?.close()}>Sign in</Link>:null}</article>):<p>No visible accounts on this page.</p>}</div><footer><button type="button" className="secondary" disabled={!page||loading||busy} onClick={()=>P(p=>p-1)}>Previous</button><span>Page {page+1}</span><button type="button" className="secondary" disabled={!more||loading||busy} onClick={()=>P(p=>p+1)}>Next</button></footer></dialog></>
}
