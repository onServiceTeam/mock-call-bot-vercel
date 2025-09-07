import OpenAI from 'openai';
export const config = { api: { bodyParser: false } };
function bufferFromStream(stream){ return new Promise((resolve,reject)=>{ const chunks=[]; stream.on('data',d=>chunks.push(d)); stream.on('end',()=>resolve(Buffer.concat(chunks))); stream.on('error',reject); }); }
export default async function handler(req,res){ if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 try{ const ct=req.headers['content-type']||''; if(!ct.startsWith('multipart/form-data')) return res.status(400).json({error:'Expected multipart/form-data'});
  const boundary=ct.split('boundary=')[1]; const buf=await bufferFromStream(req); const parts=buf.toString('binary').split('--'+boundary); const part=parts.find(p=>p.includes('name="audio"')); if(!part) return res.status(400).json({error:'No audio provided'});
  const start=part.indexOf('\r\n\r\n')+4; const end=part.lastIndexOf('\r\n'); const fileContent=part.substring(start,end); const fileBuffer=Buffer.from(fileContent,'binary');
  const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY}); const file = new File([fileBuffer],'speech.webm',{type:'audio/webm'});
  const resp=await openai.audio.transcriptions.create({ file, model:'whisper-1' }); res.json({text: resp.text || ''}); }
 catch(e){ console.error(e); res.status(500).json({error:'Transcription failed'}); } }