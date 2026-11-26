'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../lib/supabase';
export default function Profile(){
 const c=useMemo(browserClient,[]);const [uid,U]=useState(''),[name,N]=useState(''),[bio,B]=useState(''),[username,H]=useState(''),[avatar,A]=useState(''),[banner,C]=useState(''),[visible,P]=useState(true),[msg,M]=useState(''),[busy,S]=useState(false),[ready,R]=useState(false),[saved,K]=useState('');
 useEffect(()=>{if(!c)return;let active=true,request=0;async function load(){const n=++request;R(false);const {data}=await c!.auth.getUser();if(!active||n!==request)return;U(data.user?.id??'');N('');B('');H('');A('');C('');P(true);K('');M('');if(data.user){const p=await c!.from('profiles').select('display_name,bio,username,avatar_url,banner_url,is_public').eq('user_id',data.user.id).maybeSingle();if(!active||n!==request)return;if(p.error){M(p.error.message);return}N(p.data?.display_name??'');B(p.data?.bio??'');H(p.data?.username??'');K(p.data?.username??'');A(p.data?.avatar_url??'');C(p.data?.banner_url??'');P(p.data?.is_public??true)}R(true)}void load();const {data}=c.auth.onAuthStateChange(event=>{if(event==='TOKEN_REFRESHED'||event==='USER_UPDATED')return;setTimeout(()=>{if(active)void load()},0)});return()=>{active=false;data.subscription.unsubscribe()}},[c]);
 if(!uid||!c)return null;
 return <form className="panel admin-form" onSubmit={async e=>{e.preventDefault();if(!ready||busy)return;S(true);M('');try{const handle=username.trim().toLowerCase();const {error}=await c.from('profiles').upsert({user_id:uid,display_name:name.trim(),bio,username:handle||null,avatar_url:avatar.trim()||null,banner_url:banner.trim()||null,is_public:visible});if(!error)K(handle);M(error?.code==='23505'?'That username is already taken.':error?.message??'Profile saved.')}finally{S(false)}}}>
 <span className="eyebrow">PLAYER IDENTITY</span><h2>Player profile</h2><p>Customise your identity and choose who can view your profile.</p>
 <label>Username<input disabled={!ready||busy} pattern="[a-z0-9_]{3,24}" maxLength={24} value={username} onChange={e=>H(e.target.value.toLowerCase())}/></label><p>3–24 lowercase letters, numbers or underscores.</p>
 <label>Display name<input required maxLength={60} value={name} onChange={e=>N(e.target.value)}/></label>
 <label>Biography<textarea maxLength={500} value={bio} onChange={e=>B(e.target.value)}/></label><p className="!text-xs">{bio.length}/500 characters</p>
 <label>Avatar image HTTPS URL<input type="url" pattern="https://.*" maxLength={500} value={avatar} onChange={e=>A(e.target.value)}/></label>
 <label>Banner image HTTPS URL<input type="url" pattern="https://.*" maxLength={500} value={banner} onChange={e=>C(e.target.value)}/></label>
 <label className="cvx-profile-privacy"><input type="checkbox" checked={visible} onChange={e=>P(e.target.checked)}/> Public profile</label><p>Private profiles are hidden from other visitors.</p>
 <button className="cta" disabled={!ready||busy}>{busy?'Saving…':'Save profile'}</button>{saved&&<Link className="text-link" href={'/players/'+saved}>View your profile →</Link>}{msg&&<p role="status" className="account-feedback">{msg}</p>}</form>
}
