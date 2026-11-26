export default function ScoreCard({label,score,detail,loading=false}:{label:string;score:number|null|undefined;detail:string;loading?:boolean}){
 const value=score==null||!Number.isFinite(Number(score))?null:Math.max(0,Math.min(100,Number(score)));
 const tone=value===null?'unrated':value>=80?'high':value>=60?'mid':'low';
 return <article className={'cvx-score-card cvx-score-'+tone}>
 <div className="cvx-score-ring" aria-hidden="true"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="43" className="cvx-score-track"/>{value!==null&&<circle cx="50" cy="50" r="43" className="cvx-score-progress" pathLength="100" strokeDasharray={value+' 100'} transform="rotate(-90 50 50)"/>}</svg><div><strong>{value===null?'—':Math.round(value)}</strong>{value!==null&&<small>/100</small>}</div></div>
 <div className="cvx-score-copy"><h3>{label}</h3><p>{loading?'Loading scores…':value===null?'Not yet scored':value>=80?'Highly rated':value>=60?'Generally positive':'Mixed or lower'}</p><small>{detail}</small><span className="sr-only">{value===null?'No score available':Math.round(value)+' out of 100'}</span></div>
 </article>
}
