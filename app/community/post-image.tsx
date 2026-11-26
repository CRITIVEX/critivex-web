'use client';
import {useEffect,useMemo,useState} from 'react';
import {browserClient} from '../../lib/supabase';
const extensions:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
export function ImagePicker({file,onChange,disabled}:{file:File|null;onChange:(f:File|null)=>void;disabled:boolean}){
 const [preview,P]=useState(''),[error,E]=useState('');
 useEffect(()=>{if(!file){P('');return}const url=URL.createObjectURL(file);P(url);return()=>URL.revokeObjectURL(url)},[file]);
 return <div className="cvx-image-picker"><label>Attach screenshot or image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;if(!extensions[f.type]||f.size>5242880||!f.size){E('Choose a JPEG, PNG or WebP image up to 5 MB.');return}E('');onChange(f)}}/></label>{error&&<p role="alert">{error}</p>}{file&&<><img src={preview||undefined} alt="Selected attachment preview"/><button type="button" disabled={disabled} onClick={()=>onChange(null)}>Remove attachment</button></>}</div>
}
export async function publishPost(c:NonNullable<ReturnType<typeof browserClient>>,uid:string,body:string,file:File|null){
 let path:string|null=null;
 if(file){if(!extensions[file.type]||file.size>5242880||!file.size)throw Error('Invalid attachment');path=uid+'/'+crypto.randomUUID()+'.'+extensions[file.type];const upload=await c.storage.from('social-images').upload(path,file,{contentType:file.type,upsert:false});if(upload.error)return {error:upload.error}}
 const result=await c.from('social_posts').insert({body:body.trim(),image_path:path});
 if(result.error&&path)await c.storage.from('social-images').remove([path]);
 return result;
}
export function PostImage({path,uid}:{path:string|null;uid:string}){
 const c=useMemo(browserClient,[]),[url,U]=useState(''),[failed,F]=useState(false);
 useEffect(()=>{U('');F(false);if(!c||!path)return;let active=true;async function load(){try{const r=await c!.storage.from('social-images').createSignedUrl(path!,120);if(active){U(r.data?.signedUrl??'');F(!!r.error)}}catch{if(active)F(true)}}void load();const timer=setInterval(()=>{if(document.visibilityState==='visible')void load()},90000);const focus=()=>void load();window.addEventListener('focus',focus);return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',focus)}},[c,path,uid]);
 if(!path)return null;return url?<img className="cvx-post-image" src={url} alt="Gaming image shared by the author" loading="lazy" referrerPolicy="no-referrer" onError={()=>F(true)}/>:<p role="status">{failed?'Attachment unavailable.':'Loading attachment…'}</p>
}
