import Link from 'next/link';
import Directory from './directory';
export const metadata={title:'Discover players'};
export default function Page(){return <><section className="page-intro"><Link href="/community">← Community</Link><h1>Discover players</h1><p>Find gaming friends, creators and community members.</p></section><Directory/></>}
