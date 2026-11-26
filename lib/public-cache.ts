// Per-worker cache: public anonymous data only. Never store account data.
export function publicCache<A extends unknown[], T>(
  load: (...args:A)=>Promise<T>, ttl:number, cacheable:(value:T)=>boolean = ()=>true,
  maxEntries=128
){
  const entries=new Map<string,{value:T;expires:number}>();
  const pending=new Map<string,Promise<T>>();
  return async (...args:A):Promise<T>=>{
    const key=JSON.stringify(args), now=Date.now();
    const hit=entries.get(key);
    if(hit&&hit.expires>now){entries.delete(key);entries.set(key,hit);return hit.value}
    entries.delete(key);
    const existing=pending.get(key);
    if(existing)return existing;
    const task=Promise.resolve().then(()=>load(...args)).then(value=>{
      if(cacheable(value)){
        entries.set(key,{value,expires:Date.now()+ttl});
        while(entries.size>maxEntries){const oldest=entries.keys().next();if(oldest.done)break;entries.delete(oldest.value)}
      }
      return value;
    }).finally(()=>pending.delete(key));
    pending.set(key,task);
    return task;
  };
}
