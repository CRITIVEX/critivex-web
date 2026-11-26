import Link from 'next/link';
import Dashboard from './dashboard';
import Account from './account';
export const metadata={title:'Account',robots:{index:false,follow:false}};
const cards=[['Profile','profile','Edit your public identity and privacy.'],['Statistics','statistics','Explore your gaming activity.'],['Game library','library','Manage your saved games.'],['Collections','collections','Organise your custom game lists.'],['Reviews & ratings','activity','Manage your contributions.'],['Security','settings','Manage your email, password and sessions.'],['Notifications','notifications','Choose your optional updates.']];
export default function Page(){return <><section className="page-intro"><span className="eyebrow">YOUR CRITIVEX</span><h1>Account centre</h1><p>Manage your profile and gaming experience.</p></section><Dashboard><Account/><section className="cvx-account-cards" aria-label="Account sections">{cards.map(([title,slug,description])=><Link className="panel cvx-account-card" key={slug} href={'/account/'+slug}><h2>{title}</h2><p>{description}</p><span>Open section →</span></Link>)}</section></Dashboard></>}
