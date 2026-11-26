'use client';
import {useEffect,useMemo,useState,useRef,useLayoutEffect,useId} from 'react';
import {createPortal} from 'react-dom';
import Link from 'next/link';
import {browserClient} from '../../lib/supabase';
type Affiliation={name:string;logo_url:string;username:string};
function AffiliationBadge({a}:{a:Affiliation}){
 const anchor=useRef<HTMLAnchorElement>(null),card=useRef<HTMLSpanElement>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [open,O]=useState(false),[position,P]=useState({left:0,top:0,visibility:'hidden' as 'hidden'|'visible'});
 const tooltipId=useId();
 function show(){if(timer.current)clearTimeout(timer.current);O(true)}
 function hide(){if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>O(false),180)}
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 useLayoutEffect(()=>{if(!open)return;function place(){if(!anchor.current||!card.current)return;const r=anchor.current.getBoundingClientRect(),b=card.current.getBoundingClientRect();const below=window.innerHeight-r.bottom-8;P({left:Math.max(8,Math.min(r.left,window.innerWidth-b.width-8)),top:Math.max(8,Math.min(below>=b.height?r.bottom+6:r.top-b.height-6,window.innerHeight-b.height-8)),visibility:'visible'})}place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);return()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true)}},[open]);
 const href='/players/'+encodeURIComponent(a.username);
 return <><Link ref={anchor} className="cvx-affiliation" href={href} aria-label={'Affiliated with '+a.name+'. View organisation.'} aria-describedby={open?tooltipId:undefined} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onKeyDown={e=>{if(e.key==='Escape')O(false)}}><img src={a.logo_url} alt={a.name} referrerPolicy="no-referrer"/></Link>{open&&typeof document!=='undefined'&&createPortal(<span ref={card} id={tooltipId} className="cvx-affiliation-floating" style={position} role="tooltip" onMouseEnter={show} onMouseLeave={hide} onClick={()=>{anchor.current?.click();O(false)}}><span className="cvx-affiliation-card-head"><img className="cvx-affiliation-card-logo" src={a.logo_url} alt="" referrerPolicy="no-referrer"/><span className="cvx-affiliation-card-identity"><span className="cvx-affiliation-card-name">{a.name}<svg width="18" height="18" viewBox="0 0 24 24" aria-label="Verified organisation" role="img"><path fill="#d4a72c" d="M12 1 15 4 19 4 20 8 23 12 20 16 19 20 15 20 12 23 9 20 5 20 4 16 1 12 4 8 5 4 9 4Z"/><path d="m7 12 3 3 7-7" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span className="cvx-affiliation-card-handle">@{a.username}</span></span></span><span className="cvx-affiliation-card-description">This account is affiliated with <b>{a.name}</b> on Critivex.</span><span className="cvx-affiliation-card-action">View organisation profile →</span></span>,anchor.current?.closest('dialog[open]')??document.body)}</>
}
export default function Affiliations({id}:{id:string}){
 const c=useMemo(browserClient,[]),[rows,R]=useState<Affiliation[]>([]);
 useEffect(()=>{R([]);if(!c)return;let active=true;void Promise.resolve(c.rpc('player_affiliations',{player:id})).then(r=>{if(active&&!r.error)R(r.data??[])}).catch(()=>{});return()=>{active=false}},[c,id]);
 return <span className="cvx-affiliations">{rows.map(a=><AffiliationBadge key={a.username} a={a}/>)}</span>
}
