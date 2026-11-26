'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {usePathname} from 'next/navigation';
import {browserClient} from '../lib/supabase';
export default function SocialBell(){
 const c=useMemo(browserClient,[]),path=usePathname(),[uid,U]=useState(''),[count,C]=useState(0);
 useEffect(()=>{if(!c)return;let active=true;const {data:{subscription}}=c.auth.onAuthStateChange((_event,session)=>{if(active)U(session?.user.id??'')});return()=>{active=false;subscription.unsubscribe()}},[c]);
 useEffect(()=>{C(0);if(!c||!uid)return;let active=true;async function refresh(){try{const r=await c!.from('social_notifications').select('id',{head:true,count:'exact'}).eq('recipient_id',uid).is('read_at',null);if(active&&!r.error)C(r.count??0)}catch{}}const visible=()=>{if(document.visibilityState==='visible')void refresh()};void refresh();const timer=setInterval(visible,30000);window.addEventListener('focus',visible);window.addEventListener('cvx-notifications-read',visible);return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',visible);window.removeEventListener('cvx-notifications-read',visible)}},[c,uid,path]);
 if(!uid)return null;return <Link className="cvx-social-bell secondary" href="/community/notifications" aria-label={count+' unread notifications'}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>{count>0&&<span>{count>99?'99+':count}</span>}</Link>
}
