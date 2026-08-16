/* ============ NAV: menu toggle ============ */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ============ NAV: scroll-spy active link ============ */
(function scrollSpy(){
  const sections = Array.from(document.querySelectorAll('main section[id], .hero-inner#home'));
  const links = Array.from(navLinks.querySelectorAll('a'));
  if(!sections.length || !links.length) return;
  const map = new Map(links.map(a => [a.getAttribute('href').replace('#',''), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = map.get(entry.target.id);
      if(!link) return;
      if(entry.isIntersecting){
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => spy.observe(s));
})();

/* ============ SCROLL REVEAL (staggered, always on) ============ */
const floatyEligible = new Set(['service-card','project-card','about-card','cert-card','testi-card','skill-card']);
const revealEls = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        el.classList.add('in');
        observer.unobserve(el);
        const isFloatCard = [...el.classList].some(c => floatyEligible.has(c));
        if(isFloatCard){
          el.addEventListener('transitionend', function onEnd(e){
            if(e.propertyName !== 'transform') return;
            el.removeEventListener('transitionend', onEnd);
            el.classList.add('floaty');
          });
        }
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in', 'floaty'));
}

/* stagger the children of grid sections so cards cascade in one after another */
document.querySelectorAll('.skills-grid, .services-grid, .projects-grid, .certs-grid, .testi-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
  });
});

/* ============ Animated hero stat counters ============ */
const statEls = document.querySelectorAll('.hero-stats-row strong');
const statObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const raw = el.textContent.trim();
    const match = raw.match(/[\d.]+/);
    obs.unobserve(el);
    if(!match) return;
    const target = parseFloat(match[0]);
    const suffix = raw.replace(match[0], '');
    const isFloat = match[0].includes('.');
    const duration = 1400;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}, { threshold: 0.4 });
statEls.forEach(el => statObserver.observe(el));

/* ============ Hero load-in sequence ============ */
window.addEventListener('DOMContentLoaded', () => {
  const seq = [
    '.eyebrow-line', '.hero-inner h1', '.hero-inner p.lead',
    '.hero-actions', '.hero-divider', '.testimonial'
  ];
  seq.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if(!el) return;
    el.style.opacity = 0;
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
    setTimeout(() => {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }, 120 + i * 110);
  });
});

/* ============ Typewriter headline (writes & rewrites the role, loops forever) ============ */
(function typewriter(){
  const el = document.getElementById('typeTarget');
  if(!el) return;
  const phrases = [
    'Computer Engineering Student',
    'Full-Stack Web Developer',
    'Embedded Systems Builder'
  ];
  let phraseIndex = 0, charIndex = 0, deleting = false;
  const typeSpeed = 55, deleteSpeed = 32, holdTime = 1400, gapTime = 400;

  function tick(){
    const current = phrases[phraseIndex];
    if(!deleting){
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if(charIndex === current.length){
        deleting = true;
        setTimeout(tick, holdTime);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if(charIndex === 0){
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, gapTime);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }
  setTimeout(tick, 500);
})();

/* ============ 3D tilt on hover for cards (pauses the idle float while tilting) ============ */
(function tilt(){
  const tiltTargets = document.querySelectorAll(
    '.project-card, .service-card, .about-card, .cert-card, .testi-card, .skill-card'
  );
  tiltTargets.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange = 'transform';
    card.addEventListener('mouseenter', () => {
      card.style.animationPlayState = 'paused';
    });
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.animationPlayState = 'running';
    });
  });
})();

/* ============ Cursor glow that follows the pointer inside the hero ============ */
(function cursorGlow(){
  const heroCard = document.querySelector('.hero-card');
  if(!heroCard) return;
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  heroCard.appendChild(glow);
  heroCard.addEventListener('mousemove', (e) => {
    const r = heroCard.getBoundingClientRect();
    glow.style.left = (e.clientX - r.left) + 'px';
    glow.style.top = (e.clientY - r.top) + 'px';
    glow.style.opacity = 1;
  });
  heroCard.addEventListener('mouseleave', () => { glow.style.opacity = 0; });
})();

/* ============ Particle field canvas (ambient moving dots + connecting lines) ============ */
(function particles(){
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let w, h, dpr, points;

  function sizeCanvas(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function makePoints(){
    const count = Math.min(60, Math.floor((w * h) / 26000));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.6
    }));
  }
  sizeCanvas(); makePoints();
  window.addEventListener('resize', () => { sizeCanvas(); makePoints(); });

  function frame(){
    ctx.clearRect(0, 0, w, h);
    for(const p of points){
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;
    }
    for(let i = 0; i < points.length; i++){
      for(let j = i + 1; j < points.length; j++){
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 140){
          ctx.strokeStyle = `rgba(34,211,238,${(1 - dist / 140) * 0.12})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for(const p of points){
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(143,215,255,0.65)';
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
