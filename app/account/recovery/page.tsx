import Recovery from './recovery';
export const metadata={title:'Password recovery',robots:{index:false,follow:false}};
export default function Page(){return <><section className="page-intro"><span className="eyebrow">ACCOUNT SECURITY</span><h1>Password recovery</h1><p>Recover access to your Critivex account.</p></section><Recovery/></>}
