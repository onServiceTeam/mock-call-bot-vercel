export async function startRecorder(){
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  const chunks=[]; const rec=new MediaRecorder(stream,{mimeType:'audio/webm'});
  rec.ondataavailable=(e)=>{ if(e.data.size>0) chunks.push(e.data); };
  return { stop: ()=> new Promise((resolve)=>{ rec.onstop=()=>{ stream.getTracks().forEach(t=>t.stop()); resolve(new Blob(chunks,{type:'audio/webm'})); }; rec.stop(); }) };
}
