/* ============================================================
 * CipherShield Text Pro
 * Vanilla JS module — login + dashboard + cipher engine
 * ============================================================ */
const CipherShield = (() => {
  const STORAGE = {
    AUTH: 'cs_auth',
    USER: 'cs_user',
    HISTORY: 'cs_history',
    STATS: 'cs_stats',
    THEME: 'cs_theme',
    ACCENT: 'cs_accent',
    SPEED: 'cs_speed',
    FONT: 'cs_font',
    NOTIF: 'cs_notif',
  };

  /* ---------- Toast ---------- */
  function toast(msg, type='info', ms=2600){
    if (localStorage.getItem(STORAGE.NOTIF) === '0') return;
    const host = document.getElementById('toast-host');
    if (!host) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${type==='success'?'✓':type==='error'?'✕':'ℹ'}</span><span>${msg}</span>`;
    host.appendChild(t);
    setTimeout(()=>{ t.classList.add('out'); setTimeout(()=>t.remove(),300); }, ms);
  }

  /* ---------- Cipher engine ---------- */
  function caesar(text, shift, decrypt=false){
    const s = ((decrypt ? -shift : shift) % 26 + 26) % 26;
    let out = '';
    for (const ch of text){
      const c = ch.charCodeAt(0);
      if (c>=65 && c<=90) out += String.fromCharCode((c-65+s)%26+65);
      else if (c>=97 && c<=122) out += String.fromCharCode((c-97+s)%26+97);
      else out += ch;
    }
    return out;
  }

  /* ---------- Background ---------- */
  function initBackground(){
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    function resize(){
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
      const n = Math.min(90, Math.floor(w*h/24000));
      particles = Array.from({length:n}, () => ({
        x: Math.random()*w, y: Math.random()*h,
        vx: (Math.random()-.5)*.4, vy:(Math.random()-.5)*.4,
        r: Math.random()*1.6+.4,
      }));
    }
    function tick(){
      ctx.clearRect(0,0,w,h);
      for (const p of particles){
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>w) p.vx*=-1;
        if (p.y<0||p.y>h) p.vy*=-1;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,229,255,.7)';
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      }
      for (let i=0;i<particles.length;i++){
        for (let j=i+1;j<particles.length;j++){
          const a=particles[i], b=particles[j];
          const dx=a.x-b.x, dy=a.y-b.y, d=dx*dx+dy*dy;
          if (d<14000){
            ctx.strokeStyle = `rgba(168,85,247,${(1-d/14000)*.35})`;
            ctx.lineWidth = .6;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }
    addEventListener('resize', resize);
    resize(); tick();
  }

  /* ---------- Loader ---------- */
  function initLoader(){
    const l = document.getElementById('loader');
    if (!l) return;
    setTimeout(()=>{ l.classList.add('gone'); setTimeout(()=>l.remove(),700); }, 1400);
  }

  /* ---------- Theme ---------- */
  function applyTheme(){
    const theme = localStorage.getItem(STORAGE.THEME) || 'dark';
    document.body.classList.toggle('dark', theme==='dark');
    document.body.classList.toggle('light', theme==='light');
    const accent = localStorage.getItem(STORAGE.ACCENT);
    if (accent) document.documentElement.style.setProperty('--accent', accent);
    const font = localStorage.getItem(STORAGE.FONT);
    if (font) document.documentElement.style.setProperty('--font-base', font+'px');
  }

  /* ---------- LOGIN ---------- */
  function initLogin(){
    applyTheme();
    const form = document.getElementById('loginForm');
    const pwd = document.getElementById('password');
    const toggle = document.getElementById('togglePwd');
    const err = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    toggle.addEventListener('click', () => {
      const is = pwd.type === 'password';
      pwd.type = is ? 'text' : 'password';
      toggle.textContent = is ? 'Hide' : 'Show';
    });

    document.querySelectorAll('.ripple').forEach(el => {
      el.addEventListener('click', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--x', (e.clientX-r.left)+'px');
        el.style.setProperty('--y', (e.clientY-r.top)+'px');
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      err.classList.add('hidden');
      const u = document.getElementById('username').value.trim();
      const p = pwd.value;
      if (!u){ showErr('Username is required.'); return; }
      if (!p || p.length<4){ showErr('Password must be at least 4 characters.'); return; }

      btn.disabled = true;
      btn.querySelector('.btn-label').textContent = 'Authenticating…';
      btn.querySelector('.spinner').classList.remove('hidden');

      setTimeout(() => {
        localStorage.setItem(STORAGE.AUTH, '1');
        localStorage.setItem(STORAGE.USER, u);
        toast('Login successful. Redirecting…', 'success');
        setTimeout(() => location.href = '/dashboard.html', 700);
      }, 900);
    });

    function showErr(m){ err.textContent = m; err.classList.remove('hidden'); }
  }

  /* ---------- STATS ---------- */
  function getStats(){
    return JSON.parse(localStorage.getItem(STORAGE.STATS) || '{"encryptions":0,"decryptions":0,"chars":0,"shifts":{},"timesMs":[],"lastEnc":null}');
  }
  function saveStats(s){ localStorage.setItem(STORAGE.STATS, JSON.stringify(s)); }
  function recordOp(type, text, shift, ms){
    const s = getStats();
    if (type==='enc') s.encryptions++; else s.decryptions++;
    s.chars += text.length;
    s.shifts[shift] = (s.shifts[shift]||0)+1;
    s.timesMs.push(ms); if (s.timesMs.length>50) s.timesMs.shift();
    s.lastEnc = new Date().toISOString();
    saveStats(s);
  }
  function getHistory(){ return JSON.parse(localStorage.getItem(STORAGE.HISTORY) || '[]'); }
  function saveHistory(h){ localStorage.setItem(STORAGE.HISTORY, JSON.stringify(h)); }

  /* ---------- Dashboard ---------- */
  function initDashboard(){
    if (localStorage.getItem(STORAGE.AUTH) !== '1'){ location.href='/login.html'; return; }
    applyTheme();

    const user = localStorage.getItem(STORAGE.USER) || 'Agent';
    document.getElementById('welcomeName').textContent = user;
    document.getElementById('profileName').textContent = user;
    document.getElementById('avatar').textContent = user[0].toUpperCase();

    // Nav routing
    const pages = document.querySelectorAll('.page');
    const navs = document.querySelectorAll('.nav-item');
    function go(id){
      pages.forEach(p => p.classList.toggle('active', p.id===id));
      navs.forEach(n => n.classList.toggle('active', n.dataset.section===id));
      if (id==='analytics') renderAnalytics();
      if (id==='history') renderHistory();
      if (id==='dashboard') renderDashboard();
      document.getElementById('sidebar').classList.remove('open');
    }
    navs.forEach(n => n.addEventListener('click', e => { e.preventDefault(); go(n.dataset.section); location.hash = n.dataset.section; }));
    document.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => go(b.dataset.jump)));
    if (location.hash) go(location.hash.slice(1));

    document.getElementById('menuToggle')?.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem(STORAGE.AUTH);
      toast('Signed out.', 'info'); setTimeout(()=>location.href='/login.html', 500);
    });
    document.getElementById('themeToggle').addEventListener('click', () => {
      const cur = localStorage.getItem(STORAGE.THEME)||'dark';
      localStorage.setItem(STORAGE.THEME, cur==='dark'?'light':'dark');
      applyTheme();
    });
    document.getElementById('notifBtn').addEventListener('click', () => toast('No new notifications.', 'info'));

    initEncryptPage();
    initDecryptPage();
    initPlayground();
    initBrute();
    initFrequency();
    initSettings();
    renderDashboard();
    renderMapping(3);
  }

  /* ---------- Encrypt page ---------- */
  function initEncryptPage(){
    const plain = document.getElementById('plainText');
    const shiftInput = document.getElementById('shiftInput');
    const shiftSlider = document.getElementById('shiftSlider');
    const shiftBig = document.getElementById('shiftBig');
    const orig = document.getElementById('originalOut');
    const enc = document.getElementById('encryptedOut');
    const dec = document.getElementById('decryptedOut');

    function updateCounters(){
      const t = plain.value;
      document.getElementById('cCount').textContent = t.length;
      document.getElementById('wCount').textContent = t.trim()? t.trim().split(/\s+/).length : 0;
      document.getElementById('lCount').textContent = t? t.split(/\n/).length : 0;
    }
    function syncShift(v){
      v = Math.max(1, Math.min(25, parseInt(v)||1));
      shiftInput.value = v; shiftSlider.value = v; shiftBig.textContent = v;
      renderMapping(v);
    }
    plain.addEventListener('input', updateCounters);
    shiftInput.addEventListener('input', () => syncShift(shiftInput.value));
    shiftSlider.addEventListener('input', () => syncShift(shiftSlider.value));
    document.getElementById('shiftInc').addEventListener('click', () => syncShift(+shiftInput.value+1));
    document.getElementById('shiftDec').addEventListener('click', () => syncShift(+shiftInput.value-1));
    document.getElementById('shiftRand').addEventListener('click', () => { syncShift(Math.floor(Math.random()*25)+1); toast('Random shift generated.', 'info'); });

    document.getElementById('pasteBtn').addEventListener('click', async () => {
      try { plain.value = await navigator.clipboard.readText(); updateCounters(); toast('Pasted.', 'success'); }
      catch { toast('Clipboard blocked.', 'error'); }
    });
    document.getElementById('clearInputBtn').addEventListener('click', () => { plain.value=''; updateCounters(); });

    document.getElementById('encryptBtn').addEventListener('click', () => doEncrypt(false));
    document.getElementById('decryptBtnTop').addEventListener('click', () => doEncrypt(true));
    document.getElementById('swapBtn').addEventListener('click', () => {
      const v = enc.textContent === '—' ? '' : enc.textContent;
      plain.value = v; updateCounters();
    });
    document.getElementById('clearAllBtn').addEventListener('click', () => {
      plain.value=''; orig.textContent='—'; enc.textContent='—'; dec.textContent='—';
      document.getElementById('vizSteps').innerHTML=''; updateCounters();
    });

    function doEncrypt(decrypt){
      const text = plain.value;
      if (!text){ toast('Enter some text first.', 'error'); return; }
      const shift = +shiftInput.value;
      const t0 = performance.now();
      const result = caesar(text, shift, decrypt);
      const ms = performance.now()-t0;
      orig.textContent = text;
      if (decrypt){ dec.textContent = result; enc.textContent = text; }
      else { enc.textContent = result; dec.textContent = caesar(result, shift, true); }
      recordOp(decrypt?'dec':'enc', text, shift, ms);
      const h = getHistory();
      h.unshift({ original:text, encrypted: decrypt?text:result, shift, date:new Date().toISOString() });
      saveHistory(h.slice(0,100));
      buildViz(text, result);
      toast(`${decrypt?'Decrypted':'Encrypted'} (${ms.toFixed(1)} ms)`, 'success');
    }

    document.getElementById('dlEnc').addEventListener('click', () => download('encrypted.txt', enc.textContent));
    document.getElementById('dlDec').addEventListener('click', () => download('decrypted.txt', dec.textContent));
    document.getElementById('shareBtn').addEventListener('click', () => {
      const out = `CipherShield Output\nShift: ${shiftInput.value}\nOriginal: ${orig.textContent}\nEncrypted: ${enc.textContent}`;
      navigator.clipboard.writeText(out).then(()=>toast('Share text copied!', 'success'));
    });
    document.getElementById('fsEnc').addEventListener('click', () => openFs(enc.textContent));

    document.querySelectorAll('.copy').forEach(b => b.addEventListener('click', () => {
      const txt = document.getElementById(b.dataset.copy).textContent;
      navigator.clipboard.writeText(txt).then(()=>toast('Copied!', 'success'));
    }));

    document.getElementById('vizPlay').addEventListener('click', () => buildViz(orig.textContent, enc.textContent, true));

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (!(e.ctrlKey||e.metaKey)) return;
      if (e.key==='e'){ e.preventDefault(); doEncrypt(false); }
      else if (e.key==='d'){ e.preventDefault(); doEncrypt(true); }
      else if (e.key==='k'){ e.preventDefault(); document.getElementById('clearAllBtn').click(); }
      else if (e.key==='r'){ e.preventDefault(); document.getElementById('shiftRand').click(); }
    });

    syncShift(3); updateCounters();
  }

  function buildViz(input, output, animate=true){
    const host = document.getElementById('vizSteps');
    host.innerHTML = '';
    const delay = +document.getElementById('vizSpeed').value || 160;
    const max = Math.min(input.length, 120);
    for (let i=0;i<max;i++){
      const a = input[i], b = output[i] || ' ';
      if (!/[a-zA-Z]/.test(a)) continue;
      const el = document.createElement('div');
      el.className = 'step';
      el.innerHTML = `${a} → <b>${b}</b>`;
      el.style.animationDelay = animate ? (i*Math.max(20, 600-delay)/10)+'ms' : '0ms';
      host.appendChild(el);
    }
  }

  function renderMapping(shift){
    const host = document.getElementById('mappingTable');
    if (!host) return;
    host.innerHTML = '';
    for (let i=0;i<26;i++){
      const a = String.fromCharCode(65+i);
      const b = String.fromCharCode((i+shift)%26+65);
      const c = document.createElement('div');
      c.className = 'cell'; c.innerHTML = `${a}<b>${b}</b>`;
      host.appendChild(c);
    }
  }

  /* ---------- Decrypt page ---------- */
  function initDecryptPage(){
    const slider = document.getElementById('dShiftSlider');
    const val = document.getElementById('dShiftVal');
    const out = document.getElementById('dOut');
    slider.addEventListener('input', () => val.textContent = slider.value);
    document.getElementById('runDecrypt').addEventListener('click', () => {
      const txt = document.getElementById('cipherText').value;
      if (!txt){ toast('Enter cipher text.', 'error'); return; }
      const t0 = performance.now();
      const r = caesar(txt, +slider.value, true);
      const ms = performance.now()-t0;
      out.textContent = r;
      recordOp('dec', txt, +slider.value, ms);
      toast('Decrypted.', 'success');
    });
  }

  /* ---------- Playground (alphabet wheel) ---------- */
  function initPlayground(){
    const input = document.getElementById('pgInput');
    const shift = document.getElementById('pgShift');
    const val = document.getElementById('pgShiftVal');
    const out = document.getElementById('pgOut');
    const outerG = document.getElementById('outerLetters');
    const innerG = document.getElementById('innerLetters');

    // Build alphabet ring
    function buildRing(g, radius){
      g.innerHTML='';
      for (let i=0;i<26;i++){
        const ang = (i/26)*Math.PI*2 - Math.PI/2;
        const x = Math.cos(ang)*radius, y = Math.sin(ang)*radius;
        const t = document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x', x); t.setAttribute('y', y+4);
        t.setAttribute('text-anchor','middle');
        t.textContent = String.fromCharCode(65+i);
        g.appendChild(t);
      }
    }
    buildRing(outerG, 90); buildRing(innerG, 55);

    function update(){
      const s = +shift.value;
      val.textContent = s;
      const deg = (s/26)*360;
      innerG.setAttribute('transform', `rotate(${-deg})`);
      out.textContent = caesar(input.value, s) || '—';
    }
    input.addEventListener('input', update);
    shift.addEventListener('input', update);
    update();
  }

  /* ---------- Brute Force ---------- */
  function initBrute(){
    document.getElementById('bruteRun').addEventListener('click', () => {
      const txt = document.getElementById('bruteIn').value;
      const host = document.getElementById('bruteOut');
      host.innerHTML='';
      if (!txt){ toast('Enter cipher text.', 'error'); return; }
      const common = ['THE','AND','YOU','THAT','FOR','HELLO','THIS','WITH'];
      let bestKey=0, bestScore=-1;
      for (let k=1;k<=25;k++){
        const dec = caesar(txt, k, true);
        const up = dec.toUpperCase();
        let score = common.reduce((a,w)=>a+(up.includes(w)?w.length:0),0);
        if (score>bestScore){ bestScore=score; bestKey=k; }
        const div = document.createElement('div');
        div.className='b'; div.dataset.k=k;
        div.innerHTML = `<b>Shift ${k}</b>${dec}`;
        host.appendChild(div);
      }
      if (bestScore>0){
        const el = host.querySelector(`[data-k="${bestKey}"]`);
        if (el){ el.style.boxShadow='0 0 0 2px var(--accent)'; el.style.background='rgba(0,229,255,.08)'; }
        toast(`Most likely shift: ${bestKey}`, 'success');
      }
    });
  }

  /* ---------- Frequency ---------- */
  function initFrequency(){
    document.getElementById('freqRun').addEventListener('click', () => {
      const txt = document.getElementById('freqIn').value.toUpperCase();
      const counts = Array(26).fill(0);
      let total = 0;
      for (const c of txt){
        const i = c.charCodeAt(0)-65;
        if (i>=0 && i<26){ counts[i]++; total++; }
      }
      const host = document.getElementById('freqChart');
      host.innerHTML='';
      const max = Math.max(...counts,1);
      for (let i=0;i<26;i++){
        const bar = document.createElement('div');
        bar.className='bar';
        bar.style.height = (counts[i]/max*100)+'%';
        bar.innerHTML = `<span>${String.fromCharCode(65+i)}</span>`;
        bar.title = `${String.fromCharCode(65+i)}: ${counts[i]} (${total?((counts[i]/total*100).toFixed(1)):0}%)`;
        host.appendChild(bar);
      }
    });
  }

  /* ---------- Settings ---------- */
  function initSettings(){
    const theme = document.getElementById('setTheme');
    theme.value = localStorage.getItem(STORAGE.THEME)||'dark';
    theme.addEventListener('change', () => { localStorage.setItem(STORAGE.THEME, theme.value); applyTheme(); });

    document.querySelectorAll('.swatch').forEach(s => s.addEventListener('click', () => {
      localStorage.setItem(STORAGE.ACCENT, s.dataset.accent); applyTheme(); toast('Accent updated.', 'success');
    }));
    const speed = document.getElementById('setSpeed');
    speed.value = localStorage.getItem(STORAGE.SPEED)||160;
    speed.addEventListener('input', () => localStorage.setItem(STORAGE.SPEED, speed.value));

    const font = document.getElementById('setFont');
    font.value = localStorage.getItem(STORAGE.FONT)||16;
    font.addEventListener('input', () => { localStorage.setItem(STORAGE.FONT, font.value); applyTheme(); });

    const notif = document.getElementById('setNotif');
    notif.checked = localStorage.getItem(STORAGE.NOTIF)!=='0';
    notif.addEventListener('change', () => localStorage.setItem(STORAGE.NOTIF, notif.checked?'1':'0'));
  }

  /* ---------- History ---------- */
  function renderHistory(){
    const body = document.getElementById('histBody');
    const q = (document.getElementById('histSearch').value||'').toLowerCase();
    const list = getHistory().filter(h => !q || h.original.toLowerCase().includes(q) || h.encrypted.toLowerCase().includes(q));
    body.innerHTML='';
    if (!list.length){ body.innerHTML='<tr><td colspan="5" class="muted" style="text-align:center;padding:24px">No history yet.</td></tr>'; return; }
    list.forEach((h, idx) => {
      const tr = document.createElement('tr');
      const d = new Date(h.date);
      tr.innerHTML = `<td class="xs muted">${d.toLocaleString()}</td><td><b>${h.shift}</b></td><td class="mono">${escapeHtml(h.original)}</td><td class="mono">${escapeHtml(h.encrypted)}</td><td><button class="btn xs ghost danger" data-del="${idx}">✕</button></td>`;
      body.appendChild(tr);
    });
    body.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      const arr = getHistory(); arr.splice(+b.dataset.del,1); saveHistory(arr); renderHistory();
    }));
  }
  function escapeHtml(s){ return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  // Hook history controls once
  document.addEventListener('DOMContentLoaded', () => {
    const search = document.getElementById('histSearch');
    if (search) search.addEventListener('input', renderHistory);
    const clear = document.getElementById('clearHist');
    if (clear) clear.addEventListener('click', () => { if(confirm('Clear all history?')){ saveHistory([]); renderHistory(); toast('History cleared.', 'success'); } });
    const exp = document.getElementById('expCsv');
    if (exp) exp.addEventListener('click', () => {
      const arr = getHistory();
      const csv = 'date,shift,original,encrypted\n' + arr.map(h => [h.date, h.shift, JSON.stringify(h.original), JSON.stringify(h.encrypted)].join(',')).join('\n');
      download('history.csv', csv);
    });
    const imp = document.getElementById('impCsv');
    if (imp) imp.addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try{
          const lines = r.result.split(/\n/).slice(1).filter(Boolean);
          const items = lines.map(l => {
            const m = l.match(/^([^,]+),(\d+),(".*?"|[^,]*),(".*?"|[^,]*)$/);
            if (!m) return null;
            return { date:m[1], shift:+m[2], original:JSON.parse(m[3]), encrypted:JSON.parse(m[4]) };
          }).filter(Boolean);
          saveHistory([...items, ...getHistory()].slice(0,200));
          renderHistory(); toast(`Imported ${items.length} records.`, 'success');
        }catch{ toast('Invalid CSV.', 'error'); }
      };
      r.readAsText(f);
    });
  });

  /* ---------- Analytics & Dashboard ---------- */
  function renderDashboard(){
    const s = getStats();
    animateCount('encryptions', s.encryptions);
    animateCount('decryptions', s.decryptions);
    animateCount('chars', s.chars);
    const most = topKey(s.shifts);
    setText('mostShift', most ?? '—');
    setText('mostShift2', most ?? '—');
    setText('avgMs', s.timesMs.length ? (s.timesMs.reduce((a,b)=>a+b,0)/s.timesMs.length).toFixed(1) : '0');
    setText('lastEnc', s.lastEnc ? new Date(s.lastEnc).toLocaleString() : '—');

    const act = document.getElementById('recentActivity');
    if (act){
      const h = getHistory().slice(0,6);
      act.innerHTML = h.length ? h.map(x => `<li><span>Shift <b>${x.shift}</b> · ${escapeHtml(x.original.slice(0,32))}${x.original.length>32?'…':''}</span><span class="muted xs">${new Date(x.date).toLocaleTimeString()}</span></li>`).join('') : '<li class="muted">No activity yet.</li>';
    }

    // Quick cipher
    const qt = document.getElementById('quickText');
    const qs = document.getElementById('quickShift');
    const qsv = document.getElementById('quickShiftVal');
    const qo = document.getElementById('quickOut');
    if (qt && !qt._wired){
      qt._wired = true;
      const u = () => { qsv.textContent = qs.value; qo.textContent = qt.value ? caesar(qt.value, +qs.value) : '—'; };
      qt.addEventListener('input', u); qs.addEventListener('input', u); u();
    }
  }
  function renderAnalytics(){
    renderDashboard();
    const s = getStats();
    const host = document.getElementById('shiftBars');
    if (!host) return;
    host.innerHTML='';
    const max = Math.max(...Object.values(s.shifts), 1);
    for (let i=1;i<=25;i++){
      const v = s.shifts[i]||0;
      const bar = document.createElement('div');
      bar.className='bar';
      bar.style.height = (v/max*100)+'%';
      bar.innerHTML = `<span>${i}</span>`;
      bar.title = `Shift ${i}: ${v} uses`;
      host.appendChild(bar);
    }
  }
  function topKey(obj){ let best=null,bv=-1; for (const k in obj){ if (obj[k]>bv){ bv=obj[k]; best=k; } } return best; }
  function setText(id,v){ const el=document.getElementById(id); if (el) el.textContent = v; }
  function animateCount(name, target){
    document.querySelectorAll(`[data-counter="${name}"]`).forEach(el => {
      const start = +el.textContent || 0, dur=600, t0=performance.now();
      function step(t){
        const p = Math.min(1,(t-t0)/dur);
        el.textContent = Math.round(start+(target-start)*p);
        if (p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Helpers ---------- */
  function download(name, content){
    const blob = new Blob([content], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 500);
  }
  function openFs(text){
    const m = document.getElementById('fsModal');
    document.getElementById('fsContent').textContent = text;
    m.classList.remove('hidden');
    document.getElementById('fsClose').onclick = () => m.classList.add('hidden');
  }

  return { initBackground, initLoader, initLogin, initDashboard };
})();
