// Offline-only demonstration: every receiver response below is supplied in memory.
import {validateInquiry, deliverInquiry} from '../src/lib/inquiry.ts';

const input = {
  submissionId:'f24b0f50-cdee-42f1-9f9e-92080633fbb8',
  name:'Demo Buyer', email:'buyer@example.com', company:'Example Distributor',
  country:'Example Market', locale:'en', message:'Please share technical information for evaluation.',
  intent:'documents', product:'masterbatch-dispersion-wax',
  application:'masterbatch', role:'distributor', consent:true,
  source:{first_page:'/en/products', last_page:'/en/contact', utm_source:'demo'}
};
const checked = validateInquiry(input);
if (!checked.value) throw Error('The supplied synthetic fixture must validate');
const env = {NODE_ENV:'test', INQUIRY_WEBHOOK_URL:'https://example.com/mock-receiver', INQUIRY_WEBHOOK_TOKEN:'test-only-not-a-credential'};
const scenarios = [
  ['unconfigured', {}, () => {throw Error('Unconfigured requests must not call a receiver')}],
  ['http-200-without-storage-receipt', env, async () => new Response('{}')],
  ['matching-storage-receipt', env, async () => new Response(JSON.stringify({stored:true, submissionId:input.submissionId}))]
];
const results = [];
for (const [scenario, config, receiver] of scenarios) {
  const result = await deliverInquiry(checked.value, config, receiver);
  results.push({scenario, ...result});
}
console.log(JSON.stringify({mode:'synthetic-offline-mocked-receiver', networkRequests:0, emailSent:false, results}, null, 2));
if (results[0].ok || results[1].ok || !results[2].ok) process.exitCode = 1;
