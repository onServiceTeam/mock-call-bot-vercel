import { request } from 'undici';
export default async function handler(req,res){ if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 try{ const {text} = req.body||{}; const voiceId=process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
  const r=await request(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,{ method:'POST', headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY||'','content-type':'application/json'}, body: JSON.stringify({ text: text || "Hello. I'm your training customer.", model_id:'eleven_multilingual_v2', voice_settings:{stability:0.4, similarity_boost:0.7} }) });
  if(r.statusCode>=400){ const t=await r.body.text(); return res.status(500).json({error:'TTS failed', detail:t}); }
  res.setHeader('Content-Type','audio/mpeg'); r.body.pipe(res);
 } catch(e){ console.error(e); res.status(500).json({error:'TTS error'}); } }