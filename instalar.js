// Instalar a app: ao abrir o link pela primeira vez, mostra o passo certo para cada aparelho.
(function(){
  var CFG = window.PR_INSTALL_CFG || {};
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(function(){}); }
  var ua = navigator.userAgent;
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var iosOther = ios && /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  var mac = !ios && /Macintosh/.test(ua);
  var macSafari = mac && /Safari/.test(ua) && !/Chrome|Chromium|Edg\/|OPR\//.test(ua);
  var android = /Android/.test(ua);
  var chromium = 'onbeforeinstallprompt' in window;
  var deferred = null;
  var LSK = 'prInstallSeen_' + CFG.key;
  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

  var css = document.createElement('style');
  css.textContent =
    '.ig-ov{position:fixed;inset:0;z-index:9999;background:rgba(5,7,10,.82);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:18px;font-family:Inter,system-ui,sans-serif;}' +
    '.ig-ov.on{display:flex;}' +
    '.ig-card{width:100%;max-width:400px;background:#12161D;border:1px solid #262D39;border-radius:20px;padding:24px 22px 18px;color:#EDEFF2;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5);}' +
    '.ig-card img{width:76px;height:76px;border-radius:18px;display:block;margin:0 auto 12px;box-shadow:0 6px 20px rgba(0,0,0,.4);}' +
    '.ig-card h3{font-family:"Barlow Condensed",sans-serif;font-size:28px;font-weight:700;margin:0 0 4px;}' +
    '.ig-card p{color:#8A93A3;font-size:14px;line-height:1.45;margin:0 0 16px;}' +
    '.ig-steps{list-style:none;padding:0;margin:0 0 16px;text-align:left;display:flex;flex-direction:column;gap:10px;}' +
    '.ig-steps li{display:flex;gap:12px;align-items:center;background:#1B212B;border:1px solid #262D39;border-radius:12px;padding:10px 12px;font-size:14px;line-height:1.35;}' +
    '.ig-steps b{color:#fff;}' +
    '.ig-n{flex-shrink:0;width:26px;height:26px;border-radius:50%;background:' + CFG.accent + ';color:#140B04;font-weight:700;display:grid;place-items:center;font-size:13px;}' +
    '.ig-ico{display:inline-block;vertical-align:-4px;width:20px;height:20px;margin:0 2px;color:#4DA3FF;}' +
    '.ig-btn{width:100%;border:none;border-radius:12px;padding:14px;font-size:16px;font-weight:700;background:' + CFG.accent + ';color:#140B04;cursor:pointer;}' +
    '.ig-later{background:none;border:none;color:#8A93A3;font-size:13px;margin-top:10px;padding:8px;cursor:pointer;text-decoration:underline;}' +
    '.ig-copy{display:flex;gap:8px;margin:0 0 14px;}' +
    '.ig-copy input{flex:1;min-width:0;background:#1B212B;border:1px solid #262D39;border-radius:10px;color:#fff;padding:10px;font-size:13px;}' +
    '.ig-copy button{background:#1B212B;border:1px solid #262D39;color:#fff;border-radius:10px;padding:0 14px;font-weight:600;cursor:pointer;}' +
    '.ig-arrow{position:fixed;bottom:10px;left:50%;transform:translateX(-50%);font-size:30px;color:#fff;animation:igb 1.2s infinite;display:none;z-index:10000;}' +
    '.ig-qr{background:rgba(232,114,44,.12);border:1px solid rgba(232,114,44,.45);color:#EDEFF2 !important;border-radius:12px;padding:10px 12px;margin:0 0 14px !important;}' +
    '.ig-bar{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:9998;display:flex;align-items:center;gap:10px;background:#12161D;border:1px solid #262D39;border-radius:16px;padding:10px 10px 10px 12px;box-shadow:0 12px 40px rgba(0,0,0,.55);font-family:Inter,system-ui,sans-serif;color:#EDEFF2;max-width:520px;margin:0 auto;transform:translateY(150%);transition:transform .35s ease;}' +
    '.ig-bar.on{transform:none;}' +
    '.ig-bar img{width:40px;height:40px;border-radius:10px;flex-shrink:0;}' +
    '.ig-bar .t{flex:1;min-width:0;font-size:13px;line-height:1.3;color:#8A93A3;}' +
    '.ig-bar .t b{display:block;color:#fff;font-size:14px;}' +
    '.ig-bar .go{border:none;border-radius:10px;padding:10px 14px;font-weight:700;font-size:14px;background:' + CFG.accent + ';color:#140B04;cursor:pointer;flex-shrink:0;}' +
    '.ig-bar .x{background:none;border:none;color:#8A93A3;font-size:20px;line-height:1;padding:6px 8px;cursor:pointer;flex-shrink:0;}' +
    '@keyframes igb{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,8px)}}';
  document.head.appendChild(css);

  var SHARE = '<svg class="ig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>';
  var PLUS = '<svg class="ig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  var DOTS = '<b>⋮</b>';

  var ov = document.createElement('div');
  ov.className = 'ig-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Instalar ' + CFG.name);
  ov.innerHTML = '<div class="ig-card"><img src="' + CFG.icon + '" alt=""><h3>Instalar ' + CFG.name + '</h3><p id="igText"></p><div id="igBody"></div><button class="ig-later" id="igLater">Agora não, continuar no browser</button></div>';
  var arrow = document.createElement('div'); arrow.className = 'ig-arrow'; arrow.textContent = '⬇';
  document.body.appendChild(ov); document.body.appendChild(arrow);

  function steps(list){ return '<ol class="ig-steps">' + list.map(function(s, i){ return '<li><span class="ig-n">' + (i+1) + '</span><span>' + s + '</span></li>'; }).join('') + '</ol>'; }
  function copyBox(){ return '<div class="ig-copy"><input readonly value="' + location.origin + location.pathname + '"><button id="igCopy">Copiar</button></div>'; }

  var qrCtx = false;
  function render(){
    var t = document.getElementById('igText'), b = document.getElementById('igBody');
    arrow.style.display = 'none';
    document.getElementById('igLater').textContent = qrCtx && CFG.later ? CFG.later : 'Agora não, continuar no browser';
    if(deferred){
      t.textContent = 'Fica com um ícone no ' + (android ? 'telemóvel' : 'computador') + ' e abre em ecrã inteiro, como uma app normal. Atualiza-se sozinha.';
      b.innerHTML = '<button class="ig-btn" id="igGo">⬇ Instalar agora</button>';
      document.getElementById('igGo').onclick = function(){
        deferred.prompt();
        deferred.userChoice.then(function(c){ if(c && c.outcome === 'accepted'){ close(true); } }).finally(function(){ deferred = null; render(); });
      };
    } else if(ios && !iosOther){
      t.textContent = 'No iPhone e no iPad instala-se em 3 toques, a partir do Safari:';
      b.innerHTML = steps(['Toca em <b>Partilhar</b> ' + SHARE + ' na barra do Safari (em baixo ou em cima)', 'Desliza e toca em <b>Adicionar ao ecrã principal</b> ' + PLUS, 'Toca em <b>Adicionar</b>. O ícone ' + CFG.name + ' aparece no ecrã principal']);
      arrow.style.display = /iPhone|iPod/.test(ua) ? 'block' : 'none';
    } else if(iosOther){
      t.textContent = 'Neste browser do iPhone pode não dar. O mais seguro é abrir o link no Safari:';
      b.innerHTML = copyBox() + steps(['Copia o link e abre-o no <b>Safari</b>', 'Toca em <b>Partilhar</b> ' + SHARE + ' e em <b>Adicionar ao ecrã principal</b>']);
    } else if(macSafari){
      t.textContent = 'No Mac, com o Safari, a app fica na Dock e abre numa janela própria:';
      b.innerHTML = steps(['No menu do topo, clica em <b>Ficheiro</b> (ou no botão Partilhar ' + SHARE + ')', 'Escolhe <b>Adicionar à Dock…</b>', 'Clica em <b>Adicionar</b>']) + '<p style="font-size:12px;margin-top:-6px">Precisa do macOS Sonoma (14) ou mais recente. Em versões antigas, abre o link no Google Chrome.</p>';
    } else if(chromium){
      t.textContent = android ? 'Fica com um ícone no telemóvel e abre em ecrã inteiro:' : 'Fica com um ícone no computador e abre numa janela própria:';
      b.innerHTML = steps(android
        ? ['Toca no menu ' + DOTS + ' no canto do Chrome', 'Toca em <b>Instalar app</b> (ou <b>Adicionar ao ecrã principal</b>)', 'Confirma em <b>Instalar</b>']
        : ['Clica no ícone de instalar ' + PLUS + ' no fim da barra de endereço, ou no menu ' + DOTS, 'Escolhe <b>Instalar ' + CFG.name + '</b>', 'Confirma em <b>Instalar</b>']);
    } else {
      t.textContent = 'Este browser não instala apps. Para teres o ícone, abre o link no Google Chrome ou no Microsoft Edge. Também podes continuar a usar aqui, funciona na mesma.';
      b.innerHTML = copyBox();
    }
    if(qrCtx) b.insertAdjacentHTML('afterbegin', '<p class="ig-qr">📲 Instala já a app: na próxima aula é só tocar no ícone ' + CFG.name + ' e escrever o PIN.</p>');
    var c = document.getElementById('igCopy');
    if(c) c.onclick = function(){ var i = c.previousSibling; i.select(); try{ navigator.clipboard.writeText(i.value); }catch(e){ document.execCommand('copy'); } c.textContent = 'Copiado ✓'; };
  }
  function open(fromQr){ qrCtx = fromQr === true; hideBar(); render(); ov.classList.add('on'); }

  // barra discreta para quem já disse "agora não" e volta a entrar pelo QR
  var bar = null;
  function hideBar(){ if(bar){ bar.classList.remove('on'); document.body.style.paddingBottom = ''; } }
  function showBar(){
    bar = document.createElement('div'); bar.className = 'ig-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Instalar ' + CFG.name);
    bar.innerHTML = '<img src="' + CFG.icon + '" alt=""><div class="t"><b>Instala a app ' + CFG.name + '</b>Na próxima aula abres com um toque</div><button class="go">Instalar</button><button class="x" aria-label="Fechar">✕</button>';
    document.body.appendChild(bar);
    bar.querySelector('.go').onclick = function(){ open(true); };
    bar.querySelector('.x').onclick = function(){ hideBar(); lsSet(LSK + '_bar', String(Date.now())); };
    setTimeout(function(){ bar.classList.add('on'); document.body.style.paddingBottom = '96px'; }, 600);
    var hb = CFG.hideBarOn && document.getElementById(CFG.hideBarOn);
    if(hb) hb.addEventListener('click', hideBar);
  }
  function close(done){ ov.classList.remove('on'); arrow.style.display = 'none'; lsSet(LSK, done ? 'installed' : String(Date.now())); }
  document.getElementById('igLater').onclick = function(){ close(false); };
  ov.addEventListener('click', function(e){ if(e.target === ov) close(false); });
  window.PlayRideInstall = open;

  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred = e; if(ov.classList.contains('on')) render(); });
  window.addEventListener('appinstalled', function(){ close(true); hideBar(); var x = document.getElementById('installBtn'); if(x) x.remove(); });

  if(standalone) return;
  CFG.button();
  var qs = new URLSearchParams(location.search);
  var forced = qs.has('instalar');
  var skip = CFG.skip && CFG.skip(qs);
  var seen = lsGet(LSK);
  var fromQr = CFG.fromQr && CFG.fromQr();
  if(fromQr && !forced){
    // entrou pela leitura do QR: 1.ª vez mostra o guia; depois, só uma barra discreta (até instalar)
    if(seen === 'installed') return;
    if(!seen) setTimeout(function(){ open(true); }, chromium && !deferred ? 1200 : 500);
    else if(Date.now() - Number(lsGet(LSK + '_bar') || 0) > 3*24*3600*1000) showBar();
    return;
  }
  if(forced || (!skip && !seen)) setTimeout(open, chromium && !deferred ? 1200 : 500);
})();
