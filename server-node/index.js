const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// GET /api/audience?v=<correctIndex>&level=<1..35>
app.get('/api/audience', (req,res)=>{
  const v = parseInt(req.query.v ?? '0', 10);
  const level = parseInt(req.query.level ?? '1', 10);
  // Skew: early levels -> stronger correctness; later -> weaker
  const base = Math.max(0.35, 0.85 - (level-1)*0.015); // ~0.85 down to ~0.35
  const remaining = 1 - base;

  const noise = [0,1,2,3].filter(i=>i!==v).map(()=> Math.random());
  const sumNoise = noise.reduce((a,b)=>a+b,0) || 1;
  const others = noise.map(n=> n/sumNoise * remaining);

  const dist = [0,0,0,0];
  let idx=0;
  for(let i=0;i<4;i++){
    if(i===v) dist[i]=base; else { dist[i]=others[idx]; idx++; }
  }
  res.json({ dist });
});

const PORT = 3000;
app.listen(PORT, ()=> console.log(`Audience service running on :${PORT}`));
