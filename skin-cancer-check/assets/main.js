(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: scrolled state, mobile menu ---------- */
  var header = document.querySelector('[data-header]');
  var toTop = document.querySelector('[data-to-top]');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-visible', y > window.innerHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('[data-burger]');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* current section highlight in nav */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('ul a'));
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var href = '#' + en.target.id;
        navLinks.forEach(function (a) {
          if (en.isIntersecting) a.classList.toggle('is-current', a.getAttribute('href') === href);
          else if (a.getAttribute('href') === href) a.classList.remove('is-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) secObs.observe(s); });
  }

  /* ---------- Hero video ---------- */
  var video = document.querySelector('[data-hero-video]');
  var hero = document.querySelector('.hero');
  var toggle = document.querySelector('[data-video-toggle]');
  if (video) {
    var mobile = window.matchMedia('(max-width: 900px)').matches;
    video.src = mobile ? video.dataset.srcMobile : video.dataset.srcDesktop;
    if (reduceMotion) {
      video.removeAttribute('autoplay');
      toggle.setAttribute('aria-pressed', 'true');
      toggle.setAttribute('aria-label', 'Play background video');
    } else {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
    toggle.addEventListener('click', function () {
      var paused = toggle.getAttribute('aria-pressed') === 'true';
      if (paused) { video.play(); } else { video.pause(); }
      toggle.setAttribute('aria-pressed', String(!paused));
      toggle.setAttribute('aria-label', paused ? 'Pause background video' : 'Play background video');
    });
  }
  requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });

  /* ---------- Image reveals ---------- */
  var reveals = document.querySelectorAll('.reveal-img');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); rObs.unobserve(en.target); } });
    }, { threshold: 0.25 });
    reveals.forEach(function (el) { rObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Services tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tab]'));
  var tablist = document.querySelector('.tabs');
  function selectTab(tab, focus) {
    var key = tab.dataset.tab;
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    tablist.dataset.active = key;
    document.querySelectorAll('[data-svc-bg]').forEach(function (img) { img.classList.toggle('is-active', img.dataset.svcBg === key); });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        selectTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
      }
    });
  });

  /* ---------- Bodyscan demo ---------- */
  var stage = document.querySelector('[data-scan]');
  if (stage) {
    var rings = stage.querySelectorAll('.scan__rings span');
    rings.forEach(function (r, i) { r.style.setProperty('--i', i); });
    var counts = {
      baseline: { unchanged: 0, changed: 0, 'new': 0 },
      followup: { unchanged: 0, changed: 0, 'new': 0 }
    };
    rings.forEach(function (r) {
      var s = r.dataset.s;
      if (s !== 'n') counts.baseline.unchanged++;
      counts.followup[s === 'u' ? 'unchanged' : s === 'c' ? 'changed' : 'new']++;
    });
    var segBtns = Array.prototype.slice.call(document.querySelectorAll('[data-visit]'));
    var label = document.querySelector('[data-label="unchanged"]');
    function setVisit(v) {
      stage.dataset.visit = v;
      segBtns.forEach(function (b) {
        var on = b.dataset.visit === v;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      Object.keys(counts[v]).forEach(function (k) { document.querySelector('[data-count="' + k + '"]').textContent = counts[v][k]; });
      label.textContent = v === 'baseline' ? 'mapped at baseline' : 'unchanged';
      if (!reduceMotion) {
        stage.classList.remove('is-sweeping');
        void stage.offsetWidth;
        stage.classList.add('is-sweeping');
      }
    }
    segBtns.forEach(function (b, i) {
      b.addEventListener('click', function () { setVisit(b.dataset.visit); });
      b.addEventListener('keydown', function (e) {
        if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(e.key) > -1) {
          e.preventDefault();
          var nb = segBtns[(i + 1) % segBtns.length];
          setVisit(nb.dataset.visit); nb.focus();
        }
      });
    });
    setVisit('baseline');
    stage.classList.remove('is-sweeping');

    /* play the comparison once when it first scrolls into view */
    if ('IntersectionObserver' in window && !reduceMotion) {
      var played = false;
      var sObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !played) {
          played = true;
          stage.classList.add('is-sweeping');
          setTimeout(function () { if (stage.dataset.visit === 'baseline') setVisit('followup'); }, 1800);
          sObs.disconnect();
        }
      }, { threshold: 0.5 });
      sObs.observe(stage);
    }
  }

  /* ---------- Process steps ---------- */
  var steps = document.querySelectorAll('.step');
  var stepImgs = document.querySelectorAll('[data-step-img]');
  if ('IntersectionObserver' in window) {
    var stObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target.dataset.step;
        steps.forEach(function (s) { s.classList.toggle('is-active', s === en.target); });
        stepImgs.forEach(function (im) { im.classList.toggle('is-active', im.dataset.stepImg === n); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { stObs.observe(s); });
  }

  /* ---------- Compare slider ---------- */
  var cmp = document.querySelector('[data-compare]');
  if (cmp) {
    var range = cmp.querySelector('input');
    var set = function () { cmp.style.setProperty('--pos', range.value + '%'); };
    range.addEventListener('input', set);
    set();
  }

  /* ---------- Parallax on full-bleed images ---------- */
  var para = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (para.length && !reduceMotion) {
    var ticking = false;
    var update = function () {
      var vh = window.innerHeight;
      para.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var progress = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        img.style.transform = 'translate3d(0,' + (progress * -16 - 8).toFixed(2) + '%,0)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- YouTube playlist (loads player only on click) ---------- */
  var yt = document.querySelector('[data-yt]');
  if (yt) {
    var thumb = yt.querySelector('[data-yt-thumb]');
    var playBtn = yt.querySelector('[data-yt-play]');
    var titleEl = document.querySelector('[data-yt-title]');
    var list = Array.prototype.slice.call(document.querySelectorAll('[data-video]'));
    var load = function (id, autoplay) {
      var old = yt.querySelector('iframe');
      if (old) old.remove();
      if (!autoplay) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      f.title = titleEl.textContent;
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      yt.appendChild(f);
      playBtn.hidden = true;
    };
    playBtn.addEventListener('click', function () { load(yt.dataset.id, true); });
    list.forEach(function (b) {
      b.addEventListener('click', function () {
        list.forEach(function (x) { x.classList.toggle('is-active', x === b); });
        yt.dataset.id = b.dataset.video;
        titleEl.textContent = b.querySelector('span').textContent;
        thumb.src = 'https://i.ytimg.com/vi/' + b.dataset.video + '/hqdefault.jpg';
        playBtn.setAttribute('aria-label', 'Play video: ' + titleEl.textContent);
        load(b.dataset.video, true);
      });
    });
  }

  /* ---------- Year ---------- */
  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
