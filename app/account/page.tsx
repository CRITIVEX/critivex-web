import Activity from './activity';
import Collections from './collections';
import Statistics from './statistics';
import Library from './library';
import Profile from './profile';
import Account from './account';
export const metadata={title:'Account',robots:{index:false,follow:false}};
export default function Page(){return <><section className="page-intro"><span className="eyebrow">YOUR CRITIVEX · ACCOUNT CENTRE</span><h1>Account centre</h1><p>Manage your identity, preferences and personal gaming library.</p></section><div className="account-grid"><div><Account/></div><div><Profile/></div></div><Statistics/><Library/><Collections/><Activity/></>}