'use client';
import {useEffect,useMemo,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {browserClient} from '../../lib/supabase';
import Account from './account';
const sections=[['Overview','/account'],['Profile','/account/profile'],['Statistics','/account/statistics'],['Game library','/account/library'],['Collections','/account/collections'],['Reviews & ratings','/account/activity'],['Security','/account/settings'],['Notifications','/account/notifications']];
export default function Dashboard({children}:{children:ReactNode}){
 const c=useMemo(browserClient,[]),path=usePathname();const [ready,R]=useState(false),[email,E]=useState('');
 useEffect(()=>{if(!c){R(true);return}let active=true;const {data:{subscription}}=c.auth.onAuthStateChange((_event,session)=>{if(active){E(session?.user.email??'');R(true)}});return()=>{active=false;subscription.unsubscribe()}},[c]);
 if(!ready)return <section className="panel" role="status">Checking your account…</section>;
 if(!email)return <div className="cvx-account-login"><Account/></div>;
 return <div className="cvx-account-dashboard"><aside className="cvx-account-sidebar"><div className="cvx-account-identity"><span className="cvx-account-avatar">{email[0].toUpperCase()}</span><div><strong>My Critivex</strong><small>{email}</small></div></div><nav aria-label="Account navigation">{sections.map(([label,href])=><Link key={href} href={href} aria-current={path===href?'page':undefined} className={path===href?'active':''}>{label}</Link>)}</nav></aside><div className="cvx-account-content">{children}</div></div>
}
