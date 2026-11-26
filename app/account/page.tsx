import Library from './library';
import Profile from './profile';
import Account from './account';
export const metadata={title:'Account',robots:{index:false,follow:false}};
export default function Page(){return <><section className="page-intro"><span className="eyebrow">YOUR CRITIVEX</span><h1>Your account</h1><p>Manage your identity, preferences and personal gaming library.</p></section><div className="account-grid"><div><Account/></div><div><Profile/></div></div><Library/></>}