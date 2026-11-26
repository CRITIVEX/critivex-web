'use client';
import {useEffect,useMemo,useState} from 'react';
import {browserClient} from '../../lib/supabase';
export default function Settings(){
 const c=useMemo(browserClient,[]);const [email,E]=useState(''),[nextEmail,N]=useState(''),[current,C]=useState(''),[password,P]=useState(''),[repeat,R]=useState(''),[busy,B]=useState(false),[message,M]=useState(''),[failed,F]=useState(false);
 useEffect(()=>{if(!c)return;let active=true;const {data:{subscription}}=c.auth.onAuthStateChange((_e,s)=>{if(active){E(s?.user.email??'');if(!s){N('');C('');P('');R('');M('')}}});return()=>{active=false;subscription.unsubscribe()}},[c]);
 async function run(action:'email'|'password'|'others'|'global'){
 if(!c||!email||busy)return;
 if(action==='password'&&(password!==repeat||password.length<8)){F(true);M('Passwords must match and contain at least 8 characters.');return}
 if(action==='email'&&nextEmail.trim().toLowerCase()===email.toLowerCase()){F(true);M('Enter a different email address.');return}
 if((action==='others'||action==='global')&&!confirm(action==='others'?'Sign out other sessions?':'Sign out all sessions, including this device?'))return;
 B(true);M('');F(false);
 try{
 if(action==='email'||action==='password'){
 const auth=await c.auth.signInWithPassword({email,password:current});if(auth.error){F(true);M('Current password could not be verified.');return}
 const r=action==='email'?await c.auth.updateUser({email:nextEmail.trim()},{emailRedirectTo:window.location.origin+'/account'}):await c.auth.updateUser({password});
 if(r.error){F(true);M(r.error.message);return}
 M(action==='email'?'Check your email for confirmation instructions.':'Password updated.');N('');P('');R('');
 }else{const r=await c.auth.signOut({scope:action==='others'?'others':'global'});F(!!r.error);M(r.error?.message??'Sessions signed out.')}
 }catch{F(true);M('Unable to complete the request. Try again.')}finally{C('');B(false)}
 }
 if(!email)return null;
 return <section className="panel section cvx-security"><span className="eyebrow">ACCOUNT SECURITY</span><h2>Account settings</h2><p>Current email: {email}</p><div className="cvx-security-grid"><form className="admin-form" onSubmit={e=>{e.preventDefault();void run('email')}}><h3>Change email</h3><label>New email<input type="email" required autoComplete="email" value={nextEmail} onChange={e=>N(e.target.value)}/></label><label>Current password<input type="password" required autoComplete="current-password" value={current} onChange={e=>C(e.target.value)}/></label><button className="cta" disabled={busy}>Request email change</button></form><form className="admin-form" onSubmit={e=>{e.preventDefault();void run('password')}}><h3>Change password</h3><label>Current password<input type="password" required autoComplete="current-password" value={current} onChange={e=>C(e.target.value)}/></label><label>New password<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>P(e.target.value)}/></label><label>Confirm new password<input type="password" required minLength={8} autoComplete="new-password" value={repeat} onChange={e=>R(e.target.value)}/></label><button className="cta" disabled={busy}>Update password</button></form></div><h3>Session management</h3><p>Revoke refresh tokens for other sessions or sign out everywhere. Existing access tokens may remain valid until expiry.</p><div className="cvx-activity-tabs"><button className="secondary" disabled={busy} onClick={()=>void run('others')}>Sign out other sessions</button><button className="secondary" disabled={busy} onClick={()=>void run('global')}>Sign out everywhere</button></div>{message&&<p role={failed?'alert':'status'} className={failed?'account-error':'account-feedback'}>{message}</p>}</section>
}
