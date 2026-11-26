import type {ReactNode} from 'react';
import Dashboard from '../dashboard';
export const metadata={title:'Account',robots:{index:false,follow:false}};
export default function Layout({children}:{children:ReactNode}){return <><section className="page-intro"><span className="eyebrow">YOUR CRITIVEX</span><h1>Account centre</h1><p>Manage your profile and gaming experience.</p></section><Dashboard>{children}</Dashboard></>}
