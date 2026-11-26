import Link from 'next/link';
import Inbox from './inbox';
export const metadata={title:'Social notifications',robots:{index:false,follow:false}};
export default function Page(){return <><section className="page-intro"><Link href="/community">← Community</Link><h1>Notifications</h1><p>Stay up to date with your social activity.</p></section><Inbox/></>}
