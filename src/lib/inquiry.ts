// Portfolio adaptation of the business project's src/lib/inquiry.ts.
// Company data omitted; see docs/implementation-scope.md for changes.
import {findTds,familyProductSlugs,additionalApplications} from './demo-catalog.ts';
export type Inquiry = {locale:'en'|'zh'|'pt';submissionId:string;name:string;email:string;company:string;country:string;message:string;intent:string;product:string;application:string;role:string;phone:string;quantity:string;consent:boolean;source:Record<string,string>;turnstileToken:string;tdsDocument:string};
export const intents=['selection','documents','sample','purchase','cooperation'];
const products=['','masterbatch-dispersion-wax','pvc-lubrication-wax',...familyProductSlugs];
const applications=['','masterbatch','pvc-processing',...additionalApplications.map(a=>a.slug)];
const roles=['','distributor','manufacturer','technical','other'];
export function validateInquiry(input:unknown):{value?:Inquiry;errors:Record<string,string>}{
  const errors:Record<string,string>={};
  if(!input||typeof input!=='object'||Array.isArray(input))return {errors:{form:'Invalid inquiry.'}};
  const d=input as Record<string,unknown>;
  const locale=d.locale===undefined||d.locale==='en'?'en':d.locale==='zh'?'zh':d.locale==='pt'?'pt':null;if(!locale)errors.locale='Select an available language.';
  const field=(key:string,max:number,required=false)=>{const raw=d[key];if(raw!==undefined&&typeof raw!=='string'){errors[key]='Enter a text value.';return ''}const s=typeof raw==='string'?raw.trim():'';if(required&&!s)errors[key]='Please complete this field.';if(s.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s))errors[key]='Please shorten or correct this value.';return s};
  const submissionId=field('submissionId',50,true);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId))errors.submissionId='Refresh and try again.';
  const name=field('name',100,true),email=field('email',254,true),company=field('company',180,true),country=field('country',100,true),message=field('message',4000,true);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email))errors.email='Enter a valid email address.';
  const intent=field('intent',30)||'selection',product=field('product',80),application=field('application',50),role=field('role',30),phone=field('phone',80),quantity=field('quantity',100),turnstileToken=field('turnstileToken',2048);
  const tdsDocument=field('tdsDocument',60);if(tdsDocument&&(!findTds(tdsDocument)||findTds(tdsDocument)?.product!==product||intent!=='documents'))errors.tdsDocument='Select the TDS matching your product.';
  if(!intents.includes(intent))errors.intent='Select an available request type.';
  if(!products.includes(product))errors.product='Select an available product.';
  if(!applications.includes(application))errors.application='Select an available application.';
  if(!roles.includes(role))errors.role='Select an available role.';
  if(d.consent!==true)errors.consent='Please acknowledge the inquiry privacy notice.';
  if(d.website)errors.form='Unable to process this inquiry.';
  const source:Record<string,string>={};
  if(d.source&&typeof d.source==='object'&&!Array.isArray(d.source)){
    for(const [key,value] of Object.entries(d.source)){
      if(!['utm_source','utm_medium','utm_campaign','utm_content','first_page','last_page'].includes(key))continue;
      if(typeof value!=='string'||value.length>150)continue;
      // Accept known public paths and simple campaign labels; never forward arbitrary URL queries.
      if(key.endsWith('page')){if(/^\/(?:en|zh|pt)(?:\/[a-z0-9-]+)*$/.test(value))source[key]=value;}
      else if(/^[a-zA-Z0-9_. -]+$/.test(value))source[key]=value;
    }
  }
  if(Object.keys(errors).length)return {errors};
  return {errors,value:{locale:locale!,submissionId,name,email,company,country,message,intent,product,application,role,phone,quantity,consent:true,source,turnstileToken,tdsDocument}};
}
export function inquiryReady(env:Record<string,string|undefined>){try{return Boolean(env.INQUIRY_WEBHOOK_URL&&new URL(env.INQUIRY_WEBHOOK_URL).protocol==='https:'&&env.INQUIRY_WEBHOOK_TOKEN&&(env.NODE_ENV!=='production'||(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET_KEY)))}catch{return false}}
export async function deliverInquiry(value:Inquiry,env:Record<string,string|undefined>,fetcher:typeof fetch):Promise<{ok:boolean;message:string}>{
  if(!inquiryReady(env))return {ok:false,message:'Online inquiry is temporarily unavailable. Please contact the sales team at sales@example.com.'};
  if(env.NODE_ENV==='production'){
    if(!value.turnstileToken)return {ok:false,message:'Please complete the security check.'};
    try{const response=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY!,response:value.turnstileToken}),signal:AbortSignal.timeout(10000)});const result=await response.json();if(!response.ok||result.success!==true||result.action!=='inquiry'||result.hostname!==new URL(env.NEXT_PUBLIC_SITE_URL!).hostname)return {ok:false,message:'Security check could not be verified. Please try again.'};}catch{return {ok:false,message:'Security check is unavailable. Please try again.'}}
  }
  try{
    const {turnstileToken,...data}=value;
    const response=await fetcher(env.INQUIRY_WEBHOOK_URL!,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${env.INQUIRY_WEBHOOK_TOKEN}`,'Idempotency-Key':value.submissionId},body:JSON.stringify({...data,receivedAt:new Date().toISOString(),locale:value.locale,recipient:'sales@example.com',privacyVersion:'portfolio-demo-2026-10-15'}),signal:AbortSignal.timeout(12000),redirect:'error'});
    if(!response.ok)return {ok:false,message:'Your inquiry could not be saved. Please try again or contact the sales team.'};
    const receipt=await response.json();
    if(receipt.stored!==true||receipt.submissionId!==value.submissionId)return {ok:false,message:'Receipt could not be confirmed. Please try again or contact the sales team.'};
    return {ok:true,message:'Your inquiry has been received.'};
  }catch{return {ok:false,message:'Connection interrupted. Your entries are still here. Please try again or contact the sales team.'}}
}
