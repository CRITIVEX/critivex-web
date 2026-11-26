'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {Poll} from '../../polls';
import PostText from '../../post-text';
import {browserClient} from '../../../../lib/supabase';
import Engagement from '../../../players/[username]/engagement';
import {PostImage} from '../../post-image';
import PostActions from '../../post-actions';
type Post={id:string;user_id:string;body:string;image_path:string|null;created_at:string;pinned:boolean};
export default function PostDetail({id}:{id:string}){
 const c=useMemo(browserClient,[]),[uid,U]=useState(''),[ready,T]=useState(false),[post,P]=useState<Post|null>(null),[name,N]=useState(''),[handle,H]=useState(''),[loading,L]=useState(true),[revision,V]=useState(0);
 useEffect(()=>{if(!c){T(true);return}const {data:{subscription}}=c.auth.onAuthStateChange((_e,s)=>{U(s?.user.id??'');T(true)});return()=>subscription.unsubscribe()},[c]);
 useEffect(()=>{if(!ready)return;let active=true;P(null);N('');H('');L(true);async function load(){if(!c)return;const r=await c.from('social_posts').select('id,user_id,body,image_path,created_at,pinned').eq('id',id).maybeSingle();if(r.error||!r.data)return;const a=await c.from('profiles').select('username,display_name').eq('user_id',r.data.user_id).maybeSingle();if(active){P(r.data);N(a.data?.display_name||a.data?.username||'Player');H(a.data?.username??'')}}void load().catch(()=>{}).finally(()=>{if(active)L(false)});return()=>{active=false}},[c,id,uid,ready,revision]);
 return <section className="panel"><Link href="/community">← Community</Link><h1>Community post</h1>{loading?<p>Loading post…</p>:post?<><h2>{handle?<Link href={'/players/'+encodeURIComponent(handle)}>{name}</Link>:name}</h2><time>{new Date(post.created_at).toLocaleString('en-AU')}</time><PostText body={post.body}/><Poll id={post.id} uid={uid}/><PostImage path={post.image_path} uid={uid}/><PostActions id={id} uid={uid} owner={post.user_id} body={post.body} pinned={post.pinned} refresh={()=>V(v=>v+1)}/><Engagement postId={id} uid={uid}/></>:<p>This post is unavailable or private.</p>}</section>
}
