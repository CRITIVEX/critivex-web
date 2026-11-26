'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import PostMetadata from './post-metadata';
import PostText from './post-text';
import {browserClient} from '../../lib/supabase';
type Entry={user_id:string;post_id:string;quote:string;created_at:string;name:string;username:string;body:string};
export default function RepostFeed({uid,player,following=false}:{uid:string;player?:string;following?:boolean}){
 const c=useMemo(browserClient,[]),[rows,R]=useState<Entry[]>([]),[revision,V]=useState(0),[error,E]=useState('');
 useEffect(()=>{R([]);E('');if(!c)return;let active=true;async function load(){let q=c!.from('social_reposts').select('user_id,post_id,quote,created_at').order('created_at',{ascending:false}).limit(20);if(player)q=q.eq('user_id',player);else if(following){if(!uid)return;const f=await c!.from('social_follows').select('following_id').eq('follower_id',uid).limit(1000);if(f.error)throw f.error;q=q.in('user_id',[uid,...(f.data??[]).map(x=>x.following_id)])}const r=await q;if(r.error)throw r.error;const list=r.data??[];if(!list.length)return;const [a,p]=await Promise.all([c!.from('profiles').select('user_id,username,display_name').in('user_id',[...new Set(list.map(x=>x.user_id))]),c!.from('social_posts').select('id,body').in('id',[...new Set(list.map(x=>x.post_id))])]);if(a.error||p.error)throw new Error('Unavailable');if(active)R(list.flatMap(x=>{const author=a.data?.find(y=>y.user_id===x.user_id),post=p.data?.find(y=>y.id===x.post_id);return author?.username&&post?[{...x,name:author.display_name||author.username,username:author.username,body:post.body}]:[]}))}void load().catch(()=>{if(active)E('Reposts temporarily unavailable.')});return()=>{active=false}},[c,uid,player,following,revision]);
 useEffect(()=>{const refresh=()=>V(v=>v+1);window.addEventListener('cvx-repost-change',refresh);return()=>window.removeEventListener('cvx-repost-change',refresh)},[]);
 return <section className="cvx-repost-feed"><h2>Recent reposts</h2>{error&&<p role="status">{error}</p>}{!error&&!rows.length&&<p>No visible reposts.</p>}{rows.map(r=><article className="panel" key={r.user_id+r.post_id}><small><Link href={'/players/'+encodeURIComponent(r.username)}>{r.name}</Link> {r.quote?'quoted a post':'reposted'} · {new Date(r.created_at).toLocaleDateString('en-AU')}</small>{r.quote&&<p>{r.quote}</p>}<PostMetadata id={r.post_id} uid={uid} owner=""><blockquote><PostText body={r.body}/></blockquote></PostMetadata><Link href={'/community/post/'+r.post_id}>View original post →</Link></article>)}</section>
}
