/* Scripts da página /maison-joa-corporativo — carrossel mobile do mosaicos de
   ambientes/eventos e galeria em tela cheia (ambientes, soluções e eventos). Os carrosséis de
   soluções e clientes são contínuos via JS (com setas e deslize) */

// ---------- carrosséis dos mosaicos (ambientes e eventos; mobile) ----------
document.querySelectorAll('.ambientes-slider').forEach(function (slider) {
  const track = slider.querySelector('.mosaico-ambientes');
  const slides = Array.prototype.slice.call(track.children);
  const dots = Array.prototype.slice.call(slider.querySelectorAll('.slider-dots button'));
  let current = 0;

  // no desktop o mosaico é grid; o carrossel só existe quando vira flex (≤640px)
  function isCarrossel() { return getComputedStyle(track).display === 'flex'; }

  function goTo(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const s = slides[i];
    track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2 });
  }

  function update() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    slides.forEach(function (s, i) {
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    current = best;
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === best); });
    dots.forEach(function (d, i) {
      if (i === best) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }

  dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });
  const prev = slider.querySelector('.seta.prev');
  const next = slider.querySelector('.seta.next');
  if (prev) prev.addEventListener('click', function () { goTo(current === 0 ? slides.length - 1 : current - 1); });
  if (next) next.addEventListener('click', function () { goTo(current === slides.length - 1 ? 0 : current + 1); });

  // tocar numa foto lateral centraliza ela em vez de abrir o lightbox
  track.addEventListener('click', function (e) {
    if (!isCarrossel()) return;
    const btn = e.target.closest('button');
    const i = slides.indexOf(btn);
    if (i !== -1 && i !== current) { e.stopPropagation(); goTo(i); }
  }, true);

  let raf;
  track.addEventListener('scroll', function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
});

// ---------- galeria em tela cheia (mosaicos de ambientes e eventos + carrossel de soluções) ----------
(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lightboxImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.close');
  const prevBtn = lightbox.querySelector('.prev');
  const nextBtn = lightbox.querySelector('.next');
  const counter = lightbox.querySelector('.counter');

  // cada galeria (data-gallery) é a lista de fotos na ordem da página; o carrossel
  // de soluções repete as fotos para o loop infinito, então só a primeira volta entra
  const galleries = {};
  document.querySelectorAll('[data-gallery]').forEach(function (btn) {
    const name = btn.getAttribute('data-gallery');
    const list = galleries[name] || (galleries[name] = []);
    const i = Number(btn.getAttribute('data-index'));
    if (list[i]) return;
    const img = btn.querySelector('img');
    list[i] = { full: btn.getAttribute('data-full'), alt: (img && img.getAttribute('alt')) || '' };
  });

  let list = [], current = 0, opener = null;

  function show(i) {
    current = (i + list.length) % list.length;
    lightboxImg.setAttribute('src', list[current].full);
    lightboxImg.setAttribute('alt', list[current].alt);
    counter.textContent = (current + 1) + ' / ' + list.length;
    // pré-carrega as vizinhas para a troca ser instantânea
    [current - 1, current + 1].forEach(function (n) {
      const item = list[(n + list.length) % list.length];
      if (item) new Image().src = item.full;
    });
  }

  function open(name, i, from) {
    list = galleries[name] || [];
    if (!list.length) return;
    opener = from;
    const single = list.length < 2;
    prevBtn.hidden = single; nextBtn.hidden = single; counter.hidden = single;
    show(i);
    lightbox.classList.add('is-open');
    if (window.__lenis) window.__lenis.stop();
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    if (!lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightboxImg.setAttribute('src', '');
    if (window.__lenis) window.__lenis.start();
    document.body.style.overflow = '';
    if (opener) opener.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-gallery]');
    if (!btn || e.defaultPrevented) return;
    open(btn.getAttribute('data-gallery'), Number(btn.getAttribute('data-index')), btn);
  });

  prevBtn.addEventListener('click', function () { show(current - 1); });
  nextBtn.addEventListener('click', function () { show(current + 1); });
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && list.length > 1) show(current - 1);
    else if (e.key === 'ArrowRight' && list.length > 1) show(current + 1);
  });

  // deslizar para o lado no celular
  let startX = null, startY = null;
  lightbox.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (startX === null || list.length < 2) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();

// ---------- carrosséis contínuos (soluções e clientes) ----------
// Giram sozinhos e aceitam setas, deslize no celular e teclado. O conteúdo é repetido em
// duas metades iguais: ao andar uma metade inteira, volta ao zero sem emenda visível.
document.querySelectorAll('[data-marquee]').forEach(function (box) {
  const viewport = box.firstElementChild;
  const track = viewport.firstElementChild;
  const prev = box.querySelector('.seta.prev');
  const next = box.querySelector('.seta.next');
  const duracao = Number(box.getAttribute('data-duracao')) || 60;   // segundos para andar uma metade
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let metade = 0, velocidade = 0, offset = 0, pausado = false, tocando = false, tween = null, last = 0;

  function medir() {
    const itens = track.children;
    const meio = itens[itens.length / 2];
    metade = meio ? meio.offsetLeft - itens[0].offsetLeft : track.scrollWidth / 2;
    velocidade = metade / duracao;
  }
  function passo() {
    // um item por clique (largura do primeiro item + espaçamento até o seguinte)
    const a = track.children[0], b = track.children[1];
    return b ? b.offsetLeft - a.offsetLeft : 300;
  }
  function aplicar() {
    if (metade) offset = ((offset % metade) + metade) % metade;
    track.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';
  }
  function irPara(delta) {
    const de = offset, ini = performance.now(), dur = 450;
    tween = function (agora) {
      const p = Math.min(1, (agora - ini) / dur);
      offset = de + delta * (1 - Math.pow(1 - p, 3));
      if (p === 1) tween = null;
    };
  }
  function loop(agora) {
    const dt = last ? Math.min(0.05, (agora - last) / 1000) : 0;
    last = agora;
    if (tween) tween(agora);
    else if (!pausado && !tocando && !reduzido) offset += velocidade * dt;
    aplicar();
    requestAnimationFrame(loop);
  }

  if (prev) prev.addEventListener('click', function () { irPara(-passo()); });
  if (next) next.addEventListener('click', function () { irPara(passo()); });
  box.addEventListener('mouseenter', function () { pausado = true; });
  box.addEventListener('mouseleave', function () { pausado = false; });
  box.addEventListener('focusin', function () { pausado = true; });
  box.addEventListener('focusout', function () { pausado = false; });

  // deslizar com o dedo; se arrastou, não abre a foto (galeria) no toque
  let x0 = 0, y0 = 0, base = 0, arrastou = false;
  viewport.addEventListener('touchstart', function (e) {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; base = offset; arrastou = false; tocando = true; tween = null;
  }, { passive: true });
  viewport.addEventListener('touchmove', function (e) {
    const dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
    if (!arrastou && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) arrastou = true;
    if (arrastou) offset = base - dx;
  }, { passive: true });
  viewport.addEventListener('touchend', function () { tocando = false; });
  viewport.addEventListener('click', function (e) {
    if (arrastou) { e.preventDefault(); e.stopPropagation(); arrastou = false; }
  }, true);

  window.addEventListener('resize', medir);
  window.addEventListener('load', medir);
  medir();
  requestAnimationFrame(loop);
});
