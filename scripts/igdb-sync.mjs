import {writeFile} from 'node:fs/promises';
const id=process.env.IGDB_CLIENT_ID,secret=process.env.IGDB_CLIENT_SECRET;
if(!id||!secret)throw new Error('IGDB_CLIENT_ID and IGDB_CLIENT_SECRET required');
const tokenResponse=await fetch('https://id.twitch.tv/oauth2/token',{method:'POST',body:new URLSearchParams({client_id:id,client_secret:secret,grant_type:'client_credentials'}),signal:AbortSignal.timeout(15000)});
if(!tokenResponse.ok)throw new Error('Twitch authentication failed: '+tokenResponse.status);
const {access_token}=await tokenResponse.json();
const maxPages=Number(process.env.IGDB_MAX_PAGES??'10');if(!Number.isInteger(maxPages)||maxPages<1||maxPages>100)throw new Error('IGDB_MAX_PAGES must be 1–100');
const rows=[];let cursor=Number(process.env.IGDB_START_ID??'0');if(!Number.isSafeInteger(cursor)||cursor<0)throw new Error('Invalid IGDB_START_ID');for(let page=0;page<maxPages;page++){const response=await fetch('https://api.igdb.com/v4/games',{method:'POST',headers:{'Client-ID':id,Authorization:'Bearer '+access_token,'Content-Type':'text/plain'},body:`fields id,name,slug,summary,first_release_date,cover.image_id,screenshots.image_id,videos.video_id,genres.name,platforms.name,involved_companies.company.name,involved_companies.developer,involved_companies.publisher; where id > ${cursor}; sort id asc; limit 500;`,signal:AbortSignal.timeout(20000)});
if(!response.ok)throw new Error('IGDB request failed: '+response.status);
const batch=await response.json();if(!Array.isArray(batch))throw new Error('Invalid IGDB response');if(!batch.length)break;const next=batch[batch.length-1].id;if(!Number.isSafeInteger(next)||next<=cursor)throw new Error('Invalid pagination cursor');rows.push(...batch);cursor=next;if(batch.length<500)break;await new Promise(resolve=>setTimeout(resolve,350));}
await writeFile('igdb-import.json',JSON.stringify(rows,null,2)+'\n');console.log('Prepared '+rows.length+' records for editorial review. No database writes performed.');