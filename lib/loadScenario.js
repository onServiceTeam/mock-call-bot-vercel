import fs from 'fs'; import path from 'path';
export function loadScenario(id){ const file=path.join(process.cwd(),'scenarios', id + '.json'); if(!fs.existsSync(file)) throw new Error('Scenario not found: '+id); return JSON.parse(fs.readFileSync(file,'utf-8')); }
