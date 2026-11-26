import Link from 'next/link';
import Messages from './messages';
export const metadata={title:'Messages',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{to?:string}>}){const {to}=await searchParams;return <><section className="page-intro"><Link href="/community">← Community</Link><h1>Messages</h1><p>Private conversations with other players.</p></section><Messages initialPeer={typeof to==='string'&&/^[0-9a-f-]{36}$/i.test(to)?to:''}/></>}
