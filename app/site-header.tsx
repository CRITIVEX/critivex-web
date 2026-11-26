'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import HeaderSearch from './header-search';
const links=[['Home','/'],['Games','/games'],['News','/news'],['Reviews','/reviews'],['Rankings','/rankings'],['Releases','/releases'],['Trending','/trending'],['Community','/community']];
export default function SiteHeader(){
 const path=usePathname(),[open,setOpen]=useState(false);
 const root=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null);
 useEffect(()=>{setOpen(false)},[path]);
 useEffect(()=>{if(!open)return;function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node))setOpen(false)}function escape(e:KeyboardEvent){if(e.key==='Escape'&&!e.defaultPrevented){setOpen(false);toggle.current?.focus()}}document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}},[open]);
 return <header ref={root} className="cvx-site-header"><Link className="brand" href="/" aria-label="Critivex home"><svg viewBox="0 0 64 64" width="38" aria-hidden="true"><path d="M49 13H23L9 32l14 19h26L39 40H28l-6-8 6-8h11z" fill="#8b5cf6"/><path d="m32 24 13 8-13 8z" fill="white"/></svg>CRITI<span>VEX</span></Link>
 <button ref={toggle} type="button" className="cvx-menu-toggle" aria-expanded={open} aria-controls="cvx-main-nav" aria-label={open?'Close navigation':'Open navigation'} onClick={()=>setOpen(v=>!v)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{open?<path d="m6 6 12 12M18 6 6 18"/>:<path d="M4 6h16M4 12h16M4 18h16"/>}</svg></button>
 <nav id="cvx-main-nav" className={open?'cvx-main-nav is-open':'cvx-main-nav'} aria-label="Main navigation">{links.map(([x,href])=>{return <Link key={href} href={href} aria-current={path===href?'page':undefined} className={path===href||(href!=='/'&&path.startsWith(href+'/'))?'is-active':undefined} onClick={()=>setOpen(false)}>{x}</Link>})}</nav>
 <div className="header-actions cvx-header-actions"><HeaderSearch/><Link className="cta cvx-profile-button !px-3 !py-2 text-sm" href="/account" onClick={()=>setOpen(false)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg><span>My Profile</span></Link></div></header>
}
