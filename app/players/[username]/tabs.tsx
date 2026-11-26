'use client';
import {useState,type ReactNode} from 'react';
export default function Tabs({posts,about,collections,reviews}:{posts:ReactNode;about:ReactNode;collections:ReactNode;reviews:ReactNode}){
 const [active,A]=useState('Posts');const sections=[['Posts',posts],['About',about],['Collections',collections],['Reviews',reviews]] as const;
 return <><nav className="cvx-public-nav cvx-profile-tabs" aria-label="Profile sections">{sections.map(([name])=><button key={name} type="button" aria-pressed={active===name} onClick={()=>A(name)}>{name}</button>)}</nav><div className="cvx-profile-content">{sections.map(([name,node])=><div key={name} hidden={active!==name}>{node}</div>)}</div></>
}
