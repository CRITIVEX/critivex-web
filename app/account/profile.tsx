'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../lib/supabase';
export default function Profile(){
 const c=useMemo(browserClient,[]);const [uid,U]=useState(''),[name,N]=useState(''),[bio,B]=useState(''),[username,H]=useState(''),[avatar,A]=useState(''),[banner,C]=useState(''),[visible,P]=useState(true),[msg,M]=useState(''),[busy,S]=useState(false),[ready,R]=useState(false),[saved,K]=useState('');
 useEffect(()=>{if(!c)return;let active=true,request=0;async function load(){const n=++request;R(false);const {data}=await c!.auth.getUser();if(!active||n!==request)return;U(data.user?.id??'');N('');B('');H('');A('');C('');P(true);K('');M('');if(data.user){const p=await c!.from('profiles').select('display_name,bio,username,avatar_url,banner_url,is_public').eq('user_id',data.user.id).maybeSingle();if(!active||n!==request)return;if(p.error){M(p.error.message);return}N(p.data?.display_name??'');B(p.data?.bio??'');H(p.data?.username??'');K(p.data?.username??'');A(p.data?.avatar_url??'');C(p.data?.banner_url??'');P(p.data?.is_public??true)}R(true)}void load();const {data}=c.auth.onAuthStateChange(event=>{if(event==='TOKEN_REFRESHED'||event==='USER_UPDATED')return;setTimeout(()=>{if(active)void load()},0)});return()=>{active=false;data.subscription.unsubscribe()}},[c]);
 async function upload(file:File,kind:'avatar'|'banner'){
 if(!c||!uid||!ready||busy)return;
 const ext:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
 if(!ext[file.type]||file.size>5242880||file.size===0){M('Choose a JPG, PNG or WebP image up to 5 MB.');return}
 S(true);M('');
 try{const path=uid+'/'+kind+'-'+crypto.randomUUID()+'.'+ext[file.type];const bucket=c.storage.from('profile-images');const result=await bucket.upload(path,file,{contentType:file.type,upsert:false});if(result.error){M(result.error.message);return}const url=bucket.getPublicUrl(path).data.publicUrl;if(kind==='avatar')A(url);else C(url);M('Image uploaded. Save your profile to apply it.')}catch{M('Image upload failed. Please try again.')}finally{S(false)}
 }
 if(!uid||!c)return null;
 return <form className="panel admin-form" onSubmit={async e=>{e.preventDefault();if(!ready||busy)return;S(true);M('');try{const handle=username.trim();const {error}=await c.from('profiles').upsert({user_id:uid,display_name:name.trim(),bio,username:handle||null,avatar_url:avatar.trim()||null,banner_url:banner.trim()||null,is_public:visible});if(!error)K(handle);M(error?.code==='23505'?'That username is already taken.':error?.message??'Profile saved.')}finally{S(false)}}}>
 <span className="eyebrow">PLAYER IDENTITY</span><h2>Player profile</h2><p>Customise your identity and choose who can view your profile.</p>
 <label>Username<input disabled={!ready||busy} pattern="[A-Za-z0-9_]{3,24}" maxLength={24} value={username} onChange={e=>H(e.target.value)}/></label><p>3–24 letters (uppercase or lowercase), numbers or underscores.</p>
 <label>Display name<input required maxLength={60} value={name} onChange={e=>N(e.target.value)}/></label>
 <label>Biography<textarea maxLength={500} value={bio} onChange={e=>B(e.target.value)}/></label><p className="!text-xs">{bio.length}/500 characters</p>
 <div className="cvx-profile-upload-grid">{(['avatar','banner'] as const).map(kind=>{const url=kind==='avatar'?avatar:banner;return <div className="cvx-profile-upload" key={kind}><strong>{kind==='avatar'?'Profile picture':'Profile banner'}</strong><div className={'cvx-upload-preview '+kind}>{url?<img src={url} alt={kind+' preview'} referrerPolicy="no-referrer"/>:<span>No image selected</span>}</div><label>Upload image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={!ready||busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void upload(file,kind)}}/></label><small>JPG, PNG or WebP · Maximum 5 MB</small>{url&&<button type="button" className="secondary" disabled={!ready||busy} onClick={()=>{if(kind==='avatar')A('');else C('');M('Save your profile to remove this image.')}}>Remove image</button>}</div>})}</div><p>Uploaded images are publicly accessible by their direct URL, even if your profile is private.</p>
 <label className="cvx-profile-privacy"><input type="checkbox" checked={visible} onChange={e=>P(e.target.checked)}/> Public profile</label><p>Private profiles are hidden from other visitors.</p>
 <button className="cta" disabled={!ready||busy}>{busy?'Saving…':'Save profile'}</button>{saved&&<Link className="text-link" href={'/players/'+saved}>View your profile →</Link>}{msg&&<p role="status" className="account-feedback">{msg}</p>}</form>
}
