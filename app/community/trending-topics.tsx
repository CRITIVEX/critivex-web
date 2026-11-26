'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../lib/supabase';
export default function TrendingTopics(){const c=useMemo(browserClient,[]),[rows,R]=useState<{topic:string;posts:number}[]>([]);useEffect(()=>{if(!c)return;let active=true;void Promise.resolve(c.rpc('trending_topics')).then(r=>{if(active&&!r.error)R(r.data??[])}).catch(()=>{});return()=>{active=false}},[c]);return <section><h3>Trending topics</h3>{rows.length?rows.map(r=><div key={r.topic}><Link href={'/community/topics/'+encodeURIComponent(r.topic)}>#{r.topic}</Link><small> · {r.posts} posts</small></div>):<p>No trending topics available.</p>}</section>}
