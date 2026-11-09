// Erzeugt von ~/Projekte/startseite-b/gen.py (Quelle leben.js) – nicht von Hand ändern.
// Startseite B (09.11.2026): Bewegung + Klicks für die Toon-Elemente.
// Wird von gen.py in die Apps (als Modul) und in die statischen Seiten (inline) kopiert.
// beleben(wurzel, aktionen) → gibt eine Aufräum-Funktion zurück.
export function beleben(wurzel, aktionen) {
  if (!wurzel) return function () {}
  var weg = []
  var still = /standbild/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches
  if (still) wurzel.classList.add('standbild')
  function $$(s, el) { return Array.prototype.slice.call((el || wurzel).querySelectorAll(s)) }
  function an(el, ev, f) { el.addEventListener(ev, f); weg.push(function () { el.removeEventListener(ev, f) }) }

  // Aktionen (Konto anlegen, einloggen, Google/Apple) – nur in den Apps
  $$('[data-aktion]').forEach(function (b) {
    an(b, 'click', function (e) {
      if (!aktionen) return
      var a = b.dataset.aktion, f = aktionen[a]
      if (f) { e.preventDefault(); f(b.dataset.wert) }
    })
  })

  // Einblenden + Zähler beim Scrollen
  function zaehle(el) {
    var z = +el.dataset.ziel, t0 = null
    function s(t) { t0 = t0 || t; var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(z * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(s) }
    requestAnimationFrame(s)
  }
  var teile = $$('.sb-zeig')
  function zeigen(el) {
    el.classList.add('da')
    $$('.lernpfad,.podest,.streak,.meilensteine', el).forEach(function (x) { x.classList.add('da') })
    if (!still) $$('.zaehl', el).forEach(zaehle)
  }
  if (still || !('IntersectionObserver' in window)) teile.forEach(zeigen)
  else {
    var beob = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { zeigen(e.target); beob.unobserve(e.target) } })
    }, { threshold: 0.15 })
    teile.forEach(function (el) { beob.observe(el) })
    weg.push(function () { beob.disconnect() })
  }

  // Konfetti + XP
  var FARBEN = ['var(--p)', '#ffc533', '#2bb673', '#3d8bfd', '#ff5a6a', 'var(--p2)']
  function konfetti(x, y, n) {
    if (still) return
    for (var i = 0; i < (n || 26); i++) {
      var k = document.createElement('i'); k.className = 'konfetti'; k.style.left = x + 'px'; k.style.top = y + 'px'; k.style.background = FARBEN[i % 6]
      var w = Math.random() * Math.PI * 2, r = 60 + Math.random() * 120
      k.style.setProperty('--dx', Math.cos(w) * r + 'px'); k.style.setProperty('--dy', Math.sin(w) * r + 80 + 'px'); k.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg')
      wurzel.appendChild(k); setTimeout(function (k) { k.remove() }.bind(null, k), 1100)
    }
  }
  function xp(x, y, txt) {
    var s = document.createElement('b'); s.className = 'xp-plus'; s.textContent = txt; s.style.left = x - 20 + 'px'; s.style.top = y - 30 + 'px'
    wurzel.appendChild(s); setTimeout(function () { s.remove() }, 1200)
  }
  function mitte(el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] }

  // Ton: echte Aufnahmen der App-Stimme (data-ton), ein Spieler für alles
  var spieler = new Audio()
  function hoer(u) { if (!u) return; try { spieler.pause(); spieler.src = u; spieler.currentTime = 0; spieler.play().catch(function () {}) } catch (e) {} }
  weg.push(function () { spieler.pause() })
  function wackel(t) { if (!t) return; t.classList.remove('spielt'); void t.offsetWidth; t.classList.add('spielt') }
  $$('[data-ton]').forEach(function (el) {
    if (el.classList.contains('kk1')) return
    an(el, 'click', function (e) { e.stopPropagation(); hoer(el.dataset.ton); wackel(el.classList.contains('ton') ? el : el.querySelector('.ton')) })
  })

  // Quiz
  $$('.quiz').forEach(function (q) {
    $$('.qz-opt', q).forEach(function (o) {
      an(o, 'click', function () {
        $$('.qz-opt', q).forEach(function (x) { x.classList.remove('falsch') })
        if (o.dataset.r === '1') {
          o.classList.add('richtig'); var m = mitte(o); konfetti(m[0], m[1]); xp(m[0], m[1], '+10 XP')
          setTimeout(function () { o.classList.remove('richtig') }, 2200)
        } else { void o.offsetWidth; o.classList.add('falsch') }
      })
    })
  })

  // Karteikarte: umdrehen, bewerten, nächste
  $$('.karteikarten').forEach(function (k) {
    var c = k.querySelector('.kk1'), W = JSON.parse(k.dataset.woerter), vorlage = k.dataset.nr, i = 0
    an(c, 'click', function () { if (!c.classList.contains('offen')) hoer(W[i][2]); c.classList.toggle('offen') })
    $$('.kk-k', k).forEach(function (b, j) {
      an(b, 'click', function () {
        if (j >= 2) { var m = mitte(b); xp(m[0], m[1], '+5 XP') }
        c.classList.add('weg')
        setTimeout(function () {
          i = (i + 1) % W.length
          c.querySelector('.kk-wort').textContent = W[i][0]; c.querySelector('.kk-ant').textContent = W[i][1]
          c.querySelector('.kk-nr').textContent = vorlage.replace('{n}', 4 + i)
          c.classList.remove('weg', 'offen'); c.classList.add('neu'); setTimeout(function () { c.classList.remove('neu') }, 450)
        }, 420)
      })
    })
  })

  // KI-Zauber
  $$('.zauber').forEach(function (z) {
    var T = JSON.parse(z.dataset.themen), thema = z.querySelector('.zb-thema.an').dataset.t
    $$('.zb-thema', z).forEach(function (b) {
      an(b, 'click', function () { $$('.zb-thema', z).forEach(function (x) { x.classList.remove('an') }); b.classList.add('an'); thema = b.dataset.t })
    })
    an(z.querySelector('.zb-knopf'), 'click', function () {
      var erg = z.querySelector('.zb-ergebnis'); erg.innerHTML = ''; z.classList.add('zaubert', 'hat')
      var m = mitte(z.querySelector('.zb-bild')); konfetti(m[0], m[1], 14)
      T[thema].forEach(function (w, j) {
        var s = document.createElement('span'); s.className = 'zb-wort'; s.style.animationDelay = (0.25 + j * 0.18) + 's'
        s.textContent = w[0]; var kl = document.createElement('small'); kl.textContent = w[1]; s.appendChild(kl); erg.appendChild(s)
        if (w[2]) { s.classList.add('hoerbar'); s.addEventListener('click', function () { hoer(w[2]) }) }
        if (j === 0) setTimeout(function () { hoer(w[2]) }, 450)
      })
      setTimeout(function () { z.classList.remove('zaubert') }, 1300)
    })
  })

  // Karaoke-Untertitel
  $$('.karaoke').forEach(function (k) {
    var w = $$('i', k), i = 0
    if (still) { w.slice(0, 3).forEach(function (x) { x.classList.add('an') }); return }
    var id = setInterval(function () { w.forEach(function (x) { x.classList.remove('an') }); for (var j = 0; j <= i && j < w.length; j++) w[j].classList.add('an'); i = (i + 1) % (w.length + 2) }, 520)
    weg.push(function () { clearInterval(id) })
  })

  // Pokal: Konfetti
  $$('.sp-pokal').forEach(function (p) { an(p, 'click', function () { var m = mitte(p); konfetti(m[0], m[1] - 30, 34) }) })

  // Videobereich
  $$('.vb').forEach(function (vb) {
    var R = JSON.parse(vb.dataset.reiter), P = vb.dataset.pfad, v = vb.querySelector('video'), ton = vb.querySelector('.vb-ton'), akt = +vb.dataset.start, mit = false
    var L = JSON.parse(vb.dataset.ton)
    function lade() {
      var k = R[akt].k; v.poster = P + k + '.jpg'
      // Safari: stumm gestartete Videos behalten sonst das muted-Attribut → Ton bleibt aus
      if (mit) { v.removeAttribute('muted'); v.defaultMuted = false } else { v.setAttribute('muted', ''); v.defaultMuted = true }
      v.muted = !mit; v.loop = !mit; v.volume = 1; v.src = P + k + (mit ? '-ton' : '') + '.mp4'; v.load()
      if (mit) ton.classList.add('laedt')
      var pr = v.play(); if (pr) pr.then(function () { ton.classList.remove('laedt'); if (mit) v.muted = false }).catch(function () { ton.classList.remove('laedt') })
      ton.classList.toggle('an', mit); ton.querySelector('span').textContent = mit ? L[1] : L[0]
      var tx = vb.querySelector('.vb-text'); tx.querySelector('h3').textContent = R[akt].t
      $$('li', tx).forEach(function (li, j) { li.lastChild.textContent = R[akt].p[j] || '' })
      tx.classList.remove('wechsel'); void tx.offsetWidth; tx.classList.add('wechsel')
    }
    $$('.vb-tab', vb).forEach(function (b) {
      an(b, 'click', function () { $$('.vb-tab', vb).forEach(function (x) { x.classList.remove('an') }); b.classList.add('an'); akt = +b.dataset.i; mit = false; lade() })
    })
    an(ton, 'click', function () { mit = !mit; lade() })
  })

  // Postkarten im Hero folgen leicht der Maus (nur statische Seiten)
  if (!still) $$('.sb-hero').forEach(function (h) {
    var s = h.querySelector('.pk-stapel'); if (!s) return
    an(h, 'mousemove', function (e) {
      var r = h.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
      s.style.transform = 'translate(' + x * -18 + 'px,' + y * -12 + 'px)'
    })
    an(h, 'mouseleave', function () { s.style.transform = '' })
  })

  return function () { weg.forEach(function (f) { f() }) }
}
