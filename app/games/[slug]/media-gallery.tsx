'use client';
import {useEffect,useRef,useState} from 'react';
export default function MediaGallery({title,screenshots=[],trailers=[]}:{title:string;screenshots?:string[];trailers?:string[]}){
 const images=[...new Set(screenshots.filter(id=>/^[a-zA-Z0-9_]+$/.test(id)))];
 const videos=[...new Set(trailers.filter(id=>/^[A-Za-z0-9_-]{11}$/.test(id)))];
 const [index,setIndex]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null);
 const opener=useRef<HTMLButtonElement|null>(null);
 const current=images[index]??images[0];
 function move(delta:number){setIndex(i=>(i+delta+images.length)%images.length)}
 useEffect(()=>{setIndex(0);dialog.current?.close()},[title]);
 const imageUrl=(id:string,size:string)=>`https://images.igdb.com/igdb/image/upload/${size}/${id}.jpg`;
 return <section className="panel section cvx-media"><span className="eyebrow">GAME MEDIA</span><h2>Screenshots &amp; trailers</h2>
 {current&&<><div className="cvx-media-stage"><button type="button" className="cvx-media-open" aria-label="Enlarge screenshot" onClick={e=>{opener.current=e.currentTarget;dialog.current?.showModal()}}><img src={imageUrl(current,'t_1080p')} alt={title+' screenshot '+(index+1)} loading="lazy"/><span>Expand image ↗</span></button></div>
 <div className="cvx-media-controls"><button type="button" disabled={images.length<2} onClick={()=>move(-1)}>← Previous</button><span aria-live="polite">{index+1} / {images.length}</span><button type="button" disabled={images.length<2} onClick={()=>move(1)}>Next →</button></div>
 <div className="cvx-media-thumbs" aria-label="Screenshot selection">{images.map((id,i)=><button type="button" key={id} aria-label={'Screenshot '+(i+1)} aria-pressed={i===index} onClick={()=>setIndex(i)}><img src={imageUrl(id,'t_screenshot_med')} alt="" loading="lazy"/></button>)}</div>
 <dialog ref={dialog} className="cvx-media-dialog" aria-label={title+' screenshot viewer'} onClose={()=>opener.current?.focus()} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.key==='ArrowRight'){e.preventDefault();move(1)}}} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}}><div className="cvx-media-lightbox"><div className="cvx-media-controls"><span>{title} · {index+1}/{images.length}</span><button type="button" autoFocus onClick={()=>dialog.current?.close()}>Close ×</button></div><img src={imageUrl(current,'t_1080p')} alt={title+' screenshot '+(index+1)}/><div className="cvx-media-controls"><button type="button" disabled={images.length<2} onClick={()=>move(-1)}>← Previous</button><a href={imageUrl(current,'t_1080p')} target="_blank" rel="noopener noreferrer">Original image ↗</a><button type="button" disabled={images.length<2} onClick={()=>move(1)}>Next →</button></div></div></dialog></>}
 {videos.length>0&&<div className="cvx-media-videos"><h3>Videos and trailers</h3><div className="cvx-media-video-grid">{videos.map((id,i)=><a key={id} href={'https://www.youtube.com/watch?v='+id} target="_blank" rel="noopener noreferrer"><img src={'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg'} alt="" loading="lazy"/><span>▶ Watch video {i+1} on YouTube ↗</span></a>)}</div></div>}
 {!images.length&&!videos.length&&<p>No screenshots or trailers available yet.</p>}</section>
}
