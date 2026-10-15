// Portfolio adaptation of the business project's src/lib/tds-access.ts.
// Company data omitted; see docs/implementation-scope.md for changes.
import {createHmac,timingSafeEqual} from 'node:crypto';
import {findTds} from './demo-catalog.ts';
import type {Inquiry} from './inquiry.ts';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {join} from 'node:path';
type Env=Record<string,string|undefined>;
export const grantLifetime=15*60;
export function tdsReady(env:Env){return Boolean(env.TDS_DOWNLOAD_SECRET&&env.TDS_DOWNLOAD_SECRET.length>=32)}
export function localTdsPreview(env:Env){return env.NODE_ENV==='development'&&env.TDS_LOCAL_PREVIEW==='true'&&tdsReady(env)}
export function tdsPath(id:string,locale:string){return findTds(id)&&['en','zh','pt'].includes(locale)?join(process.cwd(),'private','tds',`${id}-${locale}.pdf`):null}
export function createTdsGrant(id:string,locale:string,submissionId:string,env:Env,now=Date.now()){
 if(!tdsReady(env)||!tdsPath(id,locale))throw Error('TDS unavailable');
 const payload=Buffer.from(JSON.stringify({id,locale,submissionId,exp:Math.floor(now/1000)+grantLifetime})).toString('base64url');
 const signature=createHmac('sha256',env.TDS_DOWNLOAD_SECRET!).update(payload).digest('base64url');
 return `/api/tds/${id}?token=${payload}.${signature}`;
}
export function verifyTdsGrant(id:string,token:string,env:Env,now=Date.now()):{locale:string;submissionId:string}|null{
 if(!tdsReady(env)||token.length>1000)return null;
 try{const [payload,signature,extra]=token.split('.');if(!payload||!signature||extra)return null;
 const expected=createHmac('sha256',env.TDS_DOWNLOAD_SECRET!).update(payload).digest();const actual=Buffer.from(signature,'base64url');
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;
 const c=JSON.parse(Buffer.from(payload,'base64url').toString());
 if(c.id!==id||!tdsPath(id,c.locale)||!Number.isInteger(c.exp)||c.exp<=Math.floor(now/1000)||c.exp>Math.floor(now/1000)+grantLifetime||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(c.submissionId))return null;
 return {locale:c.locale,submissionId:c.submissionId};}catch{return null}
}
// Explicit opt-in local review only. Never runs in production and never emails sales.
export async function saveLocalTdsRequest(value:Inquiry,env:Env,root=join(process.cwd(),'.local-data','tds-requests')){
 if(!localTdsPreview(env)||!value.tdsDocument)throw Error('Preview disabled');
 await mkdir(root,{recursive:true});const file=join(root,`${value.submissionId}.json`);
 const {turnstileToken,...data}=value;
 try{await writeFile(file,JSON.stringify({data,receivedAt:new Date().toISOString(),mode:'local-review-sales-not-notified'},null,2),{flag:'wx',mode:0o600});}
 catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;const stored=JSON.parse(await readFile(file,'utf8'));if(JSON.stringify(stored.data)!==JSON.stringify(data))throw Error('Submission conflict');}
 return value.submissionId;
}
