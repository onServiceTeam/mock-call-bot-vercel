import OpenAI from 'openai'; import { loadScenario } from '../lib/loadScenario.js';
function containsAny(text, keys){ const t=(text||'').toLowerCase(); return (keys||[]).some(k=>t.includes(k.toLowerCase())); }
export default async function handler(req,res){ if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 try{ const {scenarioId, history=[], agentUtterance=''} = req.body||{}; const scenario=loadScenario(scenarioId);
  const botTurns=history.filter(h=>h.speaker==='bot').length; const idx=Math.min(botTurns, scenario.checkpoints.length-1); const cp=scenario.checkpoints[idx];
  let nextText, passed=false;
  if(!agentUtterance){ nextText=scenario.opening_line; }
  else{ passed = !cp?.require_any_keywords?.length || containsAny(agentUtterance, cp.require_any_keywords);
    if(!passed){ const recentFails=history.slice(-4).filter(h=>h.speaker==='agent' && !containsAny(h.text||'', cp.require_any_keywords||[])).length;
      if(cp.fail_hangup_after_misses && recentFails >= cp.fail_hangup_after_misses){ nextText="I don’t think this is going to work for me today. I’ll call back later. Bye."; return res.json({customerText: nextText, end:true}); }
      nextText = cp.bot_pushback || "I’m not sure about that. Can you explain it simply?";
    } else {
      const nextId=cp.on_pass_next; const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
      const system=`You are a U.S. customer named ${scenario.persona.name} (${scenario.persona.age}) in ${scenario.persona.location}. Keep replies under 30 words. Traits: ${(scenario.persona.traits||[]).join(', ')}`;
      const user=`Checkpoint passed: ${cp.id} → Next: ${nextId}. Agent said: "${agentUtterance}" Provide the next CUSTOMER reply only.`;
      const completion=await openai.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature:0.6, messages:[{role:'system',content:system},{role:'user',content:user}] });
      nextText = completion.choices[0].message.content.trim();
    }
  }
  res.json({customerText: nextText});
 } catch(e){ console.error(e); res.status(500).json({error:'Reply generation failed'}); } }