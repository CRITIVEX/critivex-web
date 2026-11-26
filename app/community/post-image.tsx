'use client';
import {useEffect,useMemo,useState} from 'react';
import {browserClient} from '../../lib/supabase';
const extensions:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
export function ImagePicker({file,onChange,disabled}:{file:File[];onChange:(f:File[])=>void;disabled:boolean}){
 const [error,E]=useState('');
 return <div className="cvx-image-picker"><label>Attach up to four images<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled||file.length>=4} onChange={e=>{const list=Array.from(e.target.files??[]);e.target.value='';if(list.length+file.length>4||list.some(f=>!extensions[f.type]||f.size>5242880||!f.size)){E('Choose up to four JPEG, PNG or WebP images, 5 MB each.');return}E('');onChange([...file,...list])}}/></label>{error&&<p role="alert">{error}</p>}{file.map((f,i)=><div key={i}><LocalPreview file={f}/><button type="button" disabled={disabled} onClick={()=>onChange(file.filter((_,j)=>j!==i))}>Remove image {i+1}</button></div>)}</div>
}
function LocalPreview({file}:{file:File}){const [url,U]=useState('');useEffect(()=>{const u=URL.createObjectURL(file);U(u);return()=>URL.revokeObjectURL(u)},[file]);return url?<img src={url} alt="Selected attachment"/>:null}
export async function publishPost(c:NonNullable<ReturnType<typeof browserClient>>,uid:string,body:string,file:File[]){
 const paths:string[]=[];
 if(file.length>4||file.some(f=>!extensions[f.type]||f.size>5242880||!f.size))throw Error('Invalid attachments');
 try{for(const f of file){const path=uid+'/'+crypto.randomUUID()+'.'+extensions[f.type];const upload=await c.storage.from('social-images').upload(path,f,{contentType:f.type,upsert:false});if(upload.error)throw upload.error;paths.push(path)}
 const result=await c.from('social_posts').insert({body:body.trim(),image_path:paths[0]??null,image_paths:paths});if(result.error)throw result.error;return result;
 }catch(error){if(paths.length)await c.storage.from('social-images').remove(paths);return {error}}
}
export function PostCarousel({id,path,uid}:{id:string;path:string|null;uid:string}){
 const c=useMemo(browserClient,[]),[paths,P]=useState<string[]>([]),[index,I]=useState(0);
 useEffect(()=>{P([]);I(0);if(!c)return;let active=true;void Promise.resolve(c.from('social_posts').select('image_paths').eq('id',id).maybeSingle()).then(r=>{if(active&&!r.error)P(r.data?.image_paths??[])}).catch(()=>{});return()=>{active=false}},[c,id,uid]);
 const images=paths.length?paths:path?[path]:[];
 if(!images.length)return null;return <div className="cvx-post-carousel"><PostImage path={images[Math.min(index,images.length-1)]} uid={uid}/>{images.length>1&&<div className="cvx-carousel-controls"><button type="button" disabled={index===0} onClick={()=>I(i=>i-1)}>← Previous</button><span>{index+1} / {images.length}</span><button type="button" disabled={index>=images.length-1} onClick={()=>I(i=>i+1)}>Next →</button></div>}</div>
}
export function PostImage({path,uid}:{path:string|null;uid:string}){
 const c=useMemo(browserClient,[]),[url,U]=useState(''),[failed,F]=useState(false);
 useEffect(()=>{U('');F(false);if(!c||!path)return;let active=true;async function load(){try{const r=await c!.storage.from('social-images').createSignedUrl(path!,120);if(active){U(r.data?.signedUrl??'');F(!!r.error)}}catch{if(active)F(true)}}void load();const timer=setInterval(()=>{if(document.visibilityState==='visible')void load()},90000);const focus=()=>void load();window.addEventListener('focus',focus);return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',focus)}},[c,path,uid]);
 if(!path)return null;return url?<img className="cvx-post-image" src={url} alt="Gaming image shared by the author" loading="lazy" referrerPolicy="no-referrer" onError={()=>F(true)}/>:<p role="status">{failed?'Attachment unavailable.':'Loading attachment…'}</p>
}
