import Dashboard from './dashboard';
import Account from './account';
export const metadata={title:'Account',robots:{index:false,follow:false}};
export default function Page(){return <><section className="page-intro"><span className="eyebrow">YOUR CRITIVEX</span><h1>Account centre</h1><p>Manage your profile and gaming experience.</p></section><Dashboard><Account/></Dashboard></>}
