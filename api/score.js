import OpenAI from 'openai'; import { loadScenario } from '../lib/loadScenario.js';
export default async function handler(req,res){ if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 try{ const {scenarioId, history=[]}=req.body||{}; loadScenario(scenarioId); const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const rubric=`You are a QA rater for onService agent training. Score 0-5 for: Greeting & Control, Objection Handling, Session Setup, Explanation, Verification, Pricing & Upsell. Output JSON keys {greeting, objections, session, explanation, verification, pricing, notes}`;
  const transcript=(history||[]).map(h=>(h.speaker==='agent'?'Agent: ':'Customer: ')+h.text).join('\n');
  const completion=await openai.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature:0.2, messages:[{role:'system',content:rubric},{role:'user',content:transcript}], response_format:{type:'json_object'} });
  const js=JSON.parse(completion.choices[0].message.content);
  const total=Math.round(((+js.greeting||0)+(+js.objections||0)+(+js.session||0)+(+js.explanation||0)+(+js.verification||0)+(+js.pricing||0))*(100/30));
  res.json({...js,total});
 } catch(e){ console.error(e); res.status(500).json({error:'Scoring failed'}); } }