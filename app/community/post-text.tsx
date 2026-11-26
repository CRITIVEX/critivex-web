import Link from 'next/link';
export default function PostText({body}:{body:string}){
 return <p className="cvx-post-text">{body.split(/((?:^|\s)[#@][A-Za-z0-9_]{1,40}(?![A-Za-z0-9_]))/g).map((part,i)=>{const m=part.match(/^(\s*)([#@])([A-Za-z0-9_]+)$/);if(!m)return part;const [,space,type,value]=m;if(type==='@'&&(value.length<3||value.length>24))return part;return <span key={i}>{space}<Link href={type==='#'?'/community/topics/'+encodeURIComponent(value.toLowerCase()):'/players/'+encodeURIComponent(value)}>{type}{value}</Link></span>})}</p>
}
