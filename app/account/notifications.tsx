'use client';
import {useEffect,useMemo,useState} from 'react';
import {browserClient} from '../../lib/supabase';
const defaults={review_updates:true,release_alerts:false,wishlist_alerts:false,gaming_news:false,community_activity:false,marketing_email:false};
type Preferences=typeof defaults;
const options:{key:keyof Preferences;title:string;description:string}[]=[
 {key:'review_updates',title:'Review moderation updates',description:'Updates about submitted reviews and moderation decisions.'},
 {key:'release_alerts',title:'Game release alerts',description:'Notifications about upcoming and newly released games.'},
 {key:'wishlist_alerts',title:'Wishlist notifications',description:'Updates related to games on your wishlist.'},
 {key:'gaming_news',title:'Gaming news',description:'Editorial news and gaming announcements.'},
 {key:'community_activity',title:'Community activity',description:'Updates about community interactions.'},
 {key:'marketing_email',title:'Marketing emails',description:'Optional promotional emails and offers.'}
];
export default function Notifications(){
 const c=useMemo(browserClient,[]);const [uid,U]=useState(''),[prefs,P]=useState<Preferences>(defaults),[ready,R]=useState(false),[busy,B]=useState(false),[message,M]=useState('');
 useEffect(()=>{if(!c)return;let active=true,seq=0;async function load(){const n=++seq;R(false);M('');P(defaults);try{const {data:{user}}=await c!.auth.getUser();if(!active||n!==seq)return;U(user?.id??'');if(!user)return;const r=await c!.from('notification_preferences').select('review_updates,release_alerts,wishlist_alerts,gaming_news,community_activity,marketing_email').eq('user_id',user.id).maybeSingle();if(!active||n!==seq)return;if(r.error){M('Unable to load notification preferences.');return}P(r.data??defaults);R(true)}catch{if(active&&n===seq)M('Unable to load notification preferences.')}}void load();const {data:{subscription}}=c.auth.onAuthStateChange(e=>{if(e==='TOKEN_REFRESHED'||e==='USER_UPDATED')return;setTimeout(()=>{if(active)void load()},0)});return()=>{active=false;subscription.unsubscribe()}},[c]);
 if(!uid||!c)return null;
 return <section className="panel section"><span className="eyebrow">YOUR PREFERENCES</span><h2>Notifications</h2><p>Choose which optional updates you want to receive. Delivery features will be introduced separately.</p><form onSubmit={async e=>{e.preventDefault();if(!ready||busy)return;B(true);M('');try{const r=await c.from('notification_preferences').upsert({user_id:uid,...prefs},{onConflict:'user_id'});M(r.error?'Unable to save preferences.':'Notification preferences saved.')}catch{M('Unable to save preferences.')}finally{B(false)}}}><fieldset disabled={!ready||busy} className="cvx-notification-options">{options.map(o=><label className="cvx-notification-option" key={o.key}><span><strong>{o.title}</strong><small>{o.description}</small></span><input type="checkbox" checked={prefs[o.key]} onChange={e=>P(old=>({...old,[o.key]:e.target.checked}))}/></label>)}</fieldset><p>Essential account security messages are not controlled by these preferences.</p><button className="cta" disabled={!ready||busy}>{busy?'Saving…':'Save preferences'}</button></form>{message&&<p role="status">{message}</p>}</section>
}
