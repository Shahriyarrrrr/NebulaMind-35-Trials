/* NebulaMind: 35 Trials — Client */
const qs = (s, p=document) => p.querySelector(s);
const qsa = (s, p=document) => [...p.querySelectorAll(s)];

// Elements
const startScreen = qs('#start-screen');
const gameScreen = qs('#game');
const resultScreen = qs('#result');
const startForm = qs('#start-form');
const avatarsEl = qs('#avatars');
const levelEl = qs('#level');
const questionEl = qs('#question');
const optionsEl = qs('#options');
const prizeEl = qs('#prize');
const timerEl = qs('#timer');
const resultTitle = qs('#result-title');
const resultMsg = qs('#result-msg');
const iqEl = qs('#iq');
const restartBtn = qs('#restart');
const hudAvatar = qs('#hud-avatar');
const hudName = qs('#hud-name');
const hudTag = qs('#hud-tag');

// Audio
const bgm = qs('#bgm');
const sfxCorrect = qs('#sfx-correct');
const sfxWrong = qs('#sfx-wrong');
const sfxClick = qs('#sfx-click');

// State
let player = null;
let token = null; // session id from API
let level = 1;
let current = null; // current question payload
let used = { fifty:false, best2:false, audience:false };
let answeredAt = null; // for speed bonus
let countdown = null; // timer handle
let timeLeft = 30; // seconds per question

// Prize ladder (BDT)
const PRIZES = [0, 1000, 2000, 3000, 5000, 8000, 12000, 18000, 26000, 36000, 50000, 70000, 95000, 125000, 160000, 210000, 270000, 350000, 450000, 600000, 800000, 1050000, 1350000, 1700000, 2100000, 2600000, 3200000, 3900000, 4700000, 5600000, 6600000, 7700000, 8900000, 10200000, 11700000, 13500000];

function fmtPrize(n){ return `৳${n.toLocaleString()}`; }

function show(panel){
  [startScreen, gameScreen, resultScreen].forEach(p => p.classList.remove('show'));
  panel.classList.add('show');
}

function animateQuestion(){
  gsap.fromTo('.question-wrap', { y: 20, opacity: 0 }, { y:0, opacity:1, duration: 0.4, ease: 'power2.out' });
}

function pickAvatar(e){
  if(e.target.classList.contains('avatar')){
    qsa('.avatar', avatarsEl).forEach(a=>a.classList.remove('selected'));
    e.target.classList.add('selected');
  }
}
avatarsEl.addEventListener('click', pickAvatar);

startForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  sfxClick.play().catch(()=>{});
  const name = qs('#player-name').value.trim();
  const tag = qs('#player-tag').value.trim();
  const age = parseInt(qs('#player-age').value, 10);
  const domain = qs('#domain').value;
  const avatar = qs('.avatar.selected')?.getAttribute('data-id') || 'avatar1';
  if(!name || !tag || !age || age < 18){
    alert('You must be 18+ and fill all fields to play.');
    return;
  }
  try{
    const res = await fetch(`${window.API_BASE}/start`, {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ name, tag, age, avatar, domain })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.detail || 'Start failed');
    token = data.session_id;
    player = { name, tag, age, avatar, domain };
    hudAvatar.src = `assets/avatars/${avatar}.png`;
    hudName.textContent = name;
    hudTag.textContent = '@'+tag;
    prizeEl.textContent = fmtPrize(0);
    used = { fifty:false, best2:false, audience:false };
    level = 1;
    show(gameScreen);
    bgm.volume = 0.5; bgm.play().catch(()=>{});
    await loadQuestion();
  }catch(err){
    console.error(err);
    alert(err.message);
  }
});

async function loadQuestion(){
  const res = await fetch(`${window.API_BASE}/question?session_id=${token}&level=${level}`);
  const data = await res.json();
  if(!res.ok) { alert(data.detail || 'No more questions'); return; }
  current = data; // {qid, text, options:[...], correctIndex}
  levelEl.textContent = level;
  questionEl.textContent = data.text;
  optionsEl.innerHTML = '';
  data.options.forEach((opt, i)=>{
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = opt;
    btn.dataset.index = i;
    btn.addEventListener('click', () => answer(i));
    optionsEl.appendChild(btn);
  });
  answeredAt = Date.now();
  resetTimer();
  animateQuestion();
}

function disableOptions(){ qsa('.option').forEach(o=>o.classList.add('disabled')); }

async function answer(i){
  disableOptions();
  clearInterval(countdown);
  const res = await fetch(`${window.API_BASE}/answer`, {
    method:'POST', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ session_id: token, qid: current.qid, answer_index: i })
  });
  const data = await res.json();
  const btns = qsa('.option');
  btns[current.correctIndex]?.classList.add('correct');
  if(i !== current.correctIndex){
    btns[i]?.classList.add('wrong');
    sfxWrong.play().catch(()=>{});
    setTimeout(()=> gameOver(data), 900);
  } else {
    sfxCorrect.play().catch(()=>{});
    prizeEl.textContent = fmtPrize(PRIZES[level]);
    setTimeout(async ()=>{
      if(level >= 35){
        gameOver({ finished:true, prize: PRIZES[level], level });
      } else {
        level++;
        await loadQuestion();
      }
    }, 750);
  }
}

function resetTimer(){
  timeLeft = 30; // seconds
  timerEl.textContent = `00:${String(timeLeft).padStart(2,'0')}`;
  clearInterval(countdown);
  countdown = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = `00:${String(Math.max(0,timeLeft)).padStart(2,'0')}`;
    if(timeLeft <= 0){
      clearInterval(countdown);
      // auto wrong
      answer(-1);
    }
  }, 1000);
}

// Lifelines
qs('#lifeline-5050').addEventListener('click', ()=>{
  if(used.fifty) return; used.fifty = true; sfxClick.play().catch(()=>{});
  const wrongs = qsa('.option').map((b,i)=>({b,i})).filter(x=>x.i!==current.correctIndex);
  shuffle(wrongs);
  wrongs.slice(0,2).forEach(x=>{ x.b.classList.add('disabled'); x.b.style.opacity = .5; });
});

qs('#lifeline-best2').addEventListener('click', ()=>{
  if(used.best2) return; used.best2 = true; sfxClick.play().catch(()=>{});
  const candidates = new Set([current.correctIndex]);
  const wrongsIdx = [0,1,2,3].filter(i=>i!==current.correctIndex);
  candidates.add(wrongsIdx[Math.floor(Math.random()*wrongsIdx.length)]);
  qsa('.option').forEach((b,i)=>{
    if(candidates.has(i)) b.style.borderColor = 'var(--accent)';
    else { b.classList.add('disabled'); b.style.opacity = .6; }
  });
});

qs('#lifeline-audience').addEventListener('click', async ()=>{
  if(used.audience) return; used.audience = true; sfxClick.play().catch(()=>{});
  try{
    const res = await fetch(`${window.AUDIENCE_BASE}/api/audience?v=${current.correctIndex}&level=${level}`);
    const data = await res.json(); // {dist:[p0,p1,p2,p3]}
    showAudienceOverlay(data.dist);
  }catch(err){
    alert('Audience service unavailable.');
  }
});

function showAudienceOverlay(dist){
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,.6)';
  overlay.style.display = 'grid';
  overlay.style.placeItems = 'center';
  overlay.style.zIndex = '999';
  const card = document.createElement('div');
  card.className = 'card big glass';
  card.innerHTML = `<h3>Audience Preference</h3>
    <div style="display:grid; gap:8px;">${dist.map((p,i)=>`<div><b>Option ${String.fromCharCode(65+i)}</b> — ${Math.round(p*100)}%</div>`).join('')}</div>
    <button class="btn" id="close-aud">Close</button>`;
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  qs('#close-aud', card).addEventListener('click', ()=> overlay.remove());
}

function gameOver(data){
  const elapsed = (Date.now() - (answeredAt||Date.now()))/1000;
  const levelReached = data?.level ?? level;
  const baseIQ = 80 + (levelReached * (40/35));
  const speedBonus = Math.max(0, 10 - Math.min(10, Math.floor(elapsed/2)));
  const iq = Math.round(baseIQ + speedBonus);

  if(data && data.finished){
    resultTitle.textContent = 'Champion! You cleared all 35 Trials!';
    resultMsg.textContent = `You reached level ${levelReached} and won ${fmtPrize(data.prize||PRIZES[levelReached])}.`;
  } else {
    resultTitle.textContent = 'FUCK OFF NOW LOOSER';
    resultMsg.textContent = `Game over at level ${levelReached}. You won ${fmtPrize(PRIZES[levelReached-1]||0)}.`;
  }
  iqEl.textContent = iq;
  show(resultScreen);
}

restartBtn.addEventListener('click', ()=>{
  sfxClick.play().catch(()=>{});
  show(startScreen);
  bgm.pause();
});

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
