import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import './App.css';
import './heritage.css';
import SceneLoader from './SceneLoader';

const PerfumeScene = React.lazy(() => import('./PerfumeScene'));

const statusOptions = ['Order placed', 'Confirmed', 'Preparing', 'Dispatched', 'Out for delivery', 'Delivered', 'Cancelled'];
const trackingStages = [
  { status: 'Order placed', title: 'Order placed', detail: 'Your selection is reserved with the house.' },
  { status: 'Confirmed', title: 'Confirmed', detail: 'Your order has been personally confirmed.' },
  { status: 'Preparing', title: 'Prepared', detail: 'Your fragrance is being prepared for its journey.' },
  { status: 'Dispatched', title: 'Dispatched', detail: 'Your parcel has left the house.' },
  { status: 'Out for delivery', title: 'Out for delivery', detail: 'Your fragrance is on its final route to you.' },
  { status: 'Delivered', title: 'Delivered', detail: 'Your fragrance has arrived at its destination.' }
];
const stages = [
  { eyebrow: 'GOLDEN PERFUME HOUSE PARFUM / 01', title: 'More than a scent.', body: 'A clear vessel waits for a fragrance that will become part of your story.' },
  { eyebrow: 'THE MEMORY / 02', title: 'A memory awakens.', body: 'Bergamot and rose recall the moments we wish we could hold onto.' },
  { eyebrow: 'THE FEELING / 03', title: 'A feeling takes shape.', body: 'Sandalwood brings warmth and depth to a composition that feels personal.' },
  { eyebrow: 'THE SOUL / 04', title: 'Leave a feeling.', body: 'Amber completes the scent. What remains is the impression you leave behind.' }
];

const feelings = [
  { name: 'PURE', meaning: 'The beauty of simplicity and fresh beginnings.' },
  { name: 'REMINISCENCE', meaning: 'The warmth of memories that never leave.' },
  { name: 'AFTERGLOW', meaning: 'The impression that remains after a moment has passed.' },
  { name: 'SOULMATE', meaning: 'The feeling of a meaningful connection.' },
  { name: 'ETERNAL', meaning: 'The desire to hold onto something timeless.' }
];

async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return null;
}

function Header() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  return <header className="site-header">
    <Link className="brand" to="/" aria-label="Golden Perfume House home"><span>GOLDEN</span><small>PERFUME HOUSE</small></Link>
    <Link className="header-cta" to="/collections">Discover <span>↗</span></Link>
    <button ref={menuButtonRef} type="button" className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-controls="main-navigation" aria-expanded={open}>{open ? '×' : '☰'}</button>
    <nav id="main-navigation" className={open ? 'site-nav open' : 'site-nav'} aria-label="Main navigation">
      <NavLink to="/collections">The collection</NavLink>
      <NavLink to="/about">Our story</NavLink>
      <NavLink to="/testimonials">Client stories</NavLink>
      <NavLink to="/track">Track order</NavLink>
    </nav>
  </header>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="footer-top"><div><span className="eyebrow">MORE THAN A SCENT, IT'S A FEELING</span><h2>Leave a feeling.<br/><em>Keep a memory.</em></h2></div><Link className="outline-button light" to="/collections">Explore the collection <span>↗</span></Link></div>
    <div className="footer-grid">
      <div><Link className="brand footer-brand" to="/"><span>GOLDEN</span><small>PERFUME HOUSE</small></Link><p>More Than a Scent, It's a Feeling.</p></div>
      <div><span className="footer-heading">Explore</span><Link to="/collections">Collection</Link><Link to="/about">Our story</Link><Link to="/testimonials">Client stories</Link></div>
      <div><span className="footer-heading">Assistance</span><Link to="/track">Track an order</Link><Link to="/contact">Contact</Link></div>
      <div><span className="footer-heading">The house</span><p>Every story deserves a scent.</p></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} GOLDEN PERFUME HOUSE</span><span>Leave a Feeling. Keep a Memory.</span></div>
  </footer>;
}

function ProductCard({ product, index }) {
  return <article className="product-card">
    <Link to={`/product/${product.id}`} className="product-image" style={{ '--card-tone': product.color }} aria-label={`View ${product.name}`}>
      <span className="product-number">0{index + 1} / 04</span><img className="product-bottle-photo" src="/assets/exploded/bottle-golden.webp" alt="" loading="lazy"/><span className="product-discover">Discover fragrance ↗</span>
    </Link>
    <div className="product-caption"><div><span className="eyebrow">{product.family}</span><h3>{product.name}</h3></div><Link to={`/product/${product.id}`} aria-label={`Explore ${product.name}`} className="round-arrow">↗</Link></div>
  </article>;
}

function Home({ products, onSceneReady }) {
  const ritualRef = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      if (!ritualRef.current) return;
      const rect = ritualRef.current.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      setProgress(Math.max(0, Math.min(1, -rect.top / distance)));
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', update); update();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', update); };
  }, []);
  const stage = Math.min(3, Math.floor(progress * 4));
  return <>
    <section className="ritual-scroll" ref={ritualRef} aria-label="How our fragrance comes together">
      <div className="ritual-sticky"><div className="ritual-heading"><span className="eyebrow">GOLDEN PERFUME HOUSE · THE COMPOSITION</span><span>SCROLL TO DISCOVER / 01—04</span></div><div className="ritual-scene"><React.Suspense fallback={<div className="perfume-scene"><SceneLoader/></div>}><PerfumeScene progress={progress} onReady={onSceneReady}/></React.Suspense></div><div className="ritual-copy" key={stage}><span className="eyebrow">{stages[stage].eyebrow}</span><h1>{stages[stage].title}</h1><p>{stages[stage].body}</p>{stage === 3 && <Link className="ritual-cta" to="/collections">Explore the collection <span>↗</span></Link>}<div className="ritual-progress"><div style={{ width: `${Math.max(4, progress * 100)}%` }}/></div><span className="ritual-count">0{stage + 1} <span>/ 04</span></span></div><div className="ritual-ingredients"><span className={progress > .02 ? 'active' : ''}>BERGAMOT</span><span className={progress > .21 ? 'active' : ''}>ROSE</span><span className={progress > .42 ? 'active' : ''}>SANDALWOOD</span><span className={progress > .61 ? 'active' : ''}>AMBER</span></div></div>
    </section>
    <div className="editorial-band"><span>LEAVE A FEELING</span><span className="band-symbol">✦</span><span>KEEP A MEMORY</span><span className="band-symbol">✦</span><span>EVERY STORY DESERVES A SCENT</span></div>
    <section className="intro-section"><span className="eyebrow">THE GOLDEN PERFUME HOUSE PHILOSOPHY</span><h2>Fragrance is personal.<br/><em>Emotion is universal.</em></h2><p>A scent can bring someone closer, return us to a moment, or express what words cannot. We create for the feelings that stay with you.</p></section>
    <section className="featured-section"><div className="section-title-row"><div><span className="eyebrow">THE COLLECTION</span><h2>Scents with a <em>story.</em></h2></div><Link to="/collections" className="text-link">View all fragrances <span>↗</span></Link></div><div className="featured-grid">{products.filter(p => p.featured).map((product, index) => <ProductCard key={product.id} product={product} index={index}/>)}</div></section>
    <section className="story-panel"><div className="story-visual"><img className="atelier-image" src="/assets/editorial/perfumers-atelier.png" alt="A perfumer's workroom with copper equipment, flowers, and citrus" loading="lazy"/><span>THE ART OF COMPOSITION</span></div><div className="story-content"><span className="eyebrow">OUR STORY</span><h2>Every scent has<br/><em>a story.</em></h2><p>We began with the bond between fragrance and memory. A familiar note can bring back a person, a place, or a feeling we thought we had forgotten.</p><Link className="outline-button" to="/about">Discover our story <span>↗</span></Link></div></section>
    <section className="testimonial-teaser"><span className="eyebrow">CLIENT STORIES</span><h2>Stories worth <em>sharing.</em></h2><p>Real words and moments from the people who wear GOLDEN PERFUME HOUSE.</p><Link to="/testimonials" className="text-link">Explore client stories <span>↗</span></Link></section>
  </>;
}

function Collections({ products }) {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(products.map(p => p.category))];
  return <div className="page-shell"><div className="page-heading"><span className="eyebrow">THE COLLECTION</span><h1>Find your <em>signature.</em></h1><p>Distinct expressions, composed with intention. Discover the one that feels unmistakably yours.</p></div><div className="filters" aria-label="Filter fragrances">{categories.map(category => <button key={category} className={filter === category ? 'selected' : ''} onClick={() => setFilter(category)}>{category}</button>)}</div><div className="collection-grid">{products.filter(p => filter === 'All' || p.category === filter).map((product, index) => <ProductCard key={product.id} product={product} index={index}/>)}</div></div>;
}

function WhatsAppButton({ product, whatsapp, className = 'solid-button' }) {
  if (!whatsapp) return <div className="config-notice">WhatsApp ordering opens when the house number is added.</div>;
  const message = product ? `Hello GOLDEN PERFUME HOUSE, I would like to enquire about ${product.name}.` : 'Hello GOLDEN PERFUME HOUSE, I would like to enquire about your fragrances.';
  return <a className={className} target="_blank" rel="noopener noreferrer" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}>Enquire on WhatsApp <span>↗</span></a>;
}

function ProductDetail({ products, whatsapp }) {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  if (!product) return <div className="page-shell empty-state"><h1>Fragrance not found.</h1><Link to="/collections" className="text-link">Return to collection ↗</Link></div>;
  return <div className="page-shell"><div className="breadcrumb"><Link to="/collections">Collection</Link><span>/</span>{product.name}</div><div className="detail-layout"><div className="detail-visual" style={{ '--card-tone': product.color }}><img className="detail-bottle-photo" src="/assets/exploded/bottle-golden.webp" alt="GOLDEN PERFUME HOUSE Parfum bottle"/><span className="detail-vertical">GOLDEN PERFUME HOUSE PARFUM</span></div><div className="detail-copy"><span className="eyebrow">{product.family}</span><h1>{product.name}</h1><p className="detail-lead">{product.description}</p><div className="note-list"><h2>The composition</h2>{['Opening', 'Heart', 'Base'].map((label, i) => <div key={label}><span>{label}</span><p>{product.notes[i]}</p></div>)}</div><WhatsAppButton product={product} whatsapp={whatsapp}/>{whatsapp && <p className="detail-assist">A personal enquiry opens in WhatsApp. Our team will help from there.</p>}</div></div><div className="detail-bottom"><span>MADE TO BE DISCOVERED</span><Link to="/collections" className="text-link">Explore more scents ↗</Link></div></div>;
}

function WindRibbon({ className = '' }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: true });
    const image = new Image();
    image.src = '/assets/editorial/story-ribbon.webp';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let width = 0;
    let height = 0;
    let lastDraw = 0;
    let visible = true;
    let gust = 0;
    let targetGust = 0;
    let lastScroll = window.scrollY;
    let gustTimer = 0;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.round(bounds.width * ratio);
      height = Math.round(bounds.height * ratio);
      canvas.width = width;
      canvas.height = height;
    };
    const draw = (time) => {
      frame = requestAnimationFrame(draw);
      if (!visible || !image.complete || !image.naturalWidth || time - lastDraw < 32) return;
      lastDraw = time;
      gust += (targetGust - gust) * .055;
      context.clearRect(0, 0, width, height);
      const scale = Math.max(width / image.width, height / image.height);
      const sourceWidth = width / scale;
      const sourceHeight = height / scale;
      const sourceX = (image.width - sourceWidth) / 2;
      const sourceY = (image.height - sourceHeight) / 2;
      if (reducedMotion.matches) {
        context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
        return;
      }
      const phase = time * .0017;
      const strip = Math.max(3, Math.round(width / 240));
      for (let x = 0; x < width; x += strip) {
        const sliceWidth = Math.min(strip, width - x);
        const position = x / width;
        const freeEnd = Math.min(1, Math.abs(position - .62) / .62);
        const wave = Math.sin(position * 13 - phase) * (22 + gust * 12) + Math.sin(position * 25 - phase * 1.55) * (6 + gust * 4);
        const lift = wave * freeEnd * (width / 1100);
        context.drawImage(image, sourceX + x / scale, sourceY, sliceWidth / scale + .5, sourceHeight, x, lift, sliceWidth + 1, height);
      }
    };
    resize();
    frame = requestAnimationFrame(draw);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(canvas.closest('.story-hero'));
    const onPointerMove = (event) => {
      const rect = canvas.closest('.story-hero').getBoundingClientRect();
      targetGust = event.clientY >= rect.top && event.clientY <= rect.bottom ? Math.max(0, 1 - Math.abs(event.clientX - rect.width * .45) / rect.width) : 0;
    };
    const onScroll = () => {
      const nextScroll = window.scrollY;
      const velocity = Math.min(1, Math.abs(nextScroll - lastScroll) / 80);
      lastScroll = nextScroll;
      targetGust = Math.max(targetGust, velocity);
      window.clearTimeout(gustTimer);
      gustTimer = window.setTimeout(() => { targetGust = 0; }, 180);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', resize); window.clearTimeout(gustTimer); };
  }, []);
  return <canvas className={`story-hero-ribbon ${className}`.trim()} ref={canvasRef} aria-hidden="true"/>;
}

function DustField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: true });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const particles = Array.from({ length: 46 }, (_, index) => ({
      x: (index * 37) % 100,
      y: (index * 61) % 100,
      size: 0.45 + (index % 4) * 0.35,
      alpha: 0.05 + (index % 5) * 0.018,
      phase: index * 1.73,
      speed: 0.08 + (index % 4) * 0.025,
    }));
    let frame = 0;
    let visible = true;
    let gust = 0;
    let targetGust = 0;
    let lastScroll = window.scrollY;
    let gustTimer = 0;
    let cssWidth = 0;
    let cssHeight = 0;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      cssWidth = bounds.width;
      cssHeight = bounds.height;
      canvas.width = Math.round(cssWidth * ratio);
      canvas.height = Math.round(cssHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (time) => {
      frame = requestAnimationFrame(draw);
      if (!visible || reducedMotion.matches || !cssWidth || !cssHeight) return;
      gust += (targetGust - gust) * .04;
      context.clearRect(0, 0, cssWidth, cssHeight);
      particles.forEach((particle) => {
        particle.x += particle.speed * (.012 + gust * .02);
        particle.y -= particle.speed * (.006 + gust * .012);
        if (particle.x > 104) particle.x = -4;
        if (particle.y < -4) particle.y = 104;
        const sway = Math.sin(time * .00035 + particle.phase) * (2 + gust * 9);
        const pulse = .72 + Math.sin(time * .0011 + particle.phase) * .28;
        context.fillStyle = `rgba(255,244,211,${(particle.alpha * pulse).toFixed(3)})`;
        context.beginPath();
        context.arc((particle.x / 100) * cssWidth + sway, (particle.y / 100) * cssHeight, particle.size, 0, Math.PI * 2);
        context.fill();
      });
    };
    const hero = canvas.closest('.story-hero');
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(hero);
    const onPointerMove = (event) => {
      const rect = hero.getBoundingClientRect();
      targetGust = event.clientY >= rect.top && event.clientY <= rect.bottom ? Math.max(0, 1 - Math.abs(event.clientX - rect.width * .48) / rect.width) : 0;
    };
    const onScroll = () => {
      const nextScroll = window.scrollY;
      const velocity = Math.min(1, Math.abs(nextScroll - lastScroll) / 80);
      lastScroll = nextScroll;
      targetGust = Math.max(targetGust, velocity);
      window.clearTimeout(gustTimer);
      gustTimer = window.setTimeout(() => { targetGust = 0; }, 180);
    };
    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', resize); window.clearTimeout(gustTimer); };
  }, []);
  return <canvas className="story-hero-dust" ref={canvasRef} aria-hidden="true"/>;
}

function HeroWindFilter() {
  const turbulenceRef = useRef(null);
  const displacementRef = useRef(null);
  useEffect(() => {
    const hero = document.querySelector('.story-hero');
    if (!hero) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(hero);
    const animate = (time) => {
      frame = requestAnimationFrame(animate);
      if (!visible || reducedMotion.matches) return;
      const slow = Math.sin(time * .00022);
      const quick = Math.sin(time * .00061 + 1.8);
      const base = 0.0068 + (slow + 1) * .00045;
      const cross = 0.016 + (quick + 1) * .0011;
      turbulenceRef.current?.setAttribute('baseFrequency', `${base.toFixed(4)} ${cross.toFixed(4)}`);
      displacementRef.current?.setAttribute('scale', (1.2 + (slow + 1) * .9).toFixed(2));
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);
  return <svg className="story-hero-wind-filter" aria-hidden="true" focusable="false">
    <defs>
      <filter id="story-hero-wind" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
        <feTurbulence ref={turbulenceRef} type="fractalNoise" baseFrequency=".007 .017" numOctaves="2" seed="19" result="windNoise"/>
        <feDisplacementMap ref={displacementRef} in="SourceGraphic" in2="windNoise" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  </svg>;
}

function About() {
  const [activeFeeling, setActiveFeeling] = useState(0);
  useEffect(() => {
    const hero = document.querySelector('.story-hero');
    const art = hero?.querySelector('.story-hero-art');
    if (!hero || !art) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;
    let frame = 0;
    let visible = true;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(hero);
    const onPointerMove = (event) => {
      const rect = hero.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        targetX = 0;
        targetY = 0;
        return;
      }
      targetX = ((event.clientX - rect.left) / rect.width - .5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - .5) * 2;
      art.style.setProperty('--lens-x', `${((event.clientX - rect.left) / rect.width * 100).toFixed(1)}%`);
      art.style.setProperty('--lens-y', `${((event.clientY - rect.top) / rect.height * 100).toFixed(1)}%`);
    };
    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      art.style.setProperty('--lens-x', '50%');
      art.style.setProperty('--lens-y', '45%');
    };
    const onPointerDown = (event) => {
      const rect = hero.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'story-hero-ripple';
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      hero.appendChild(ripple);
      art.classList.add('is-touched');
      window.clearTimeout(art.__touchTimer);
      art.__touchTimer = window.setTimeout(() => art.classList.remove('is-touched'), 1400);
      window.setTimeout(() => ripple.remove(), 1100);
    };
    const animate = (time) => {
      frame = requestAnimationFrame(animate);
      if (!visible) return;
      currentX += (targetX - currentX) * .045;
      currentY += (targetY - currentY) * .045;
      const idleX = Math.sin(time * .00031) * 3.5;
      const idleY = Math.cos(time * .00023) * 2.5;
      art.style.setProperty('--hero-parallax-x', `${(currentX * 5 + idleX * .55).toFixed(2)}px`);
      art.style.setProperty('--hero-parallax-y', `${(currentY * 3.5 + idleY * .55).toFixed(2)}px`);
      art.style.setProperty('--hero-ribbon-x', `${(currentX * 15 + idleX * .7).toFixed(2)}px`);
      art.style.setProperty('--hero-ribbon-y', `${(currentY * 9 + idleY * .5).toFixed(2)}px`);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerleave', onPointerLeave, { passive: true });
    hero.addEventListener('pointerdown', onPointerDown, { passive: true });
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('pointermove', onPointerMove); hero.removeEventListener('pointerleave', onPointerLeave); hero.removeEventListener('pointerdown', onPointerDown); window.clearTimeout(art.__touchTimer); };
  }, []);
  useEffect(() => {
    const page = document.querySelector('.story-page');
    const targets = page.querySelectorAll('.story-reveal, .story-ending-animated');
    const hero = page.querySelector('.story-hero');
    const chapters = [...page.querySelectorAll('[data-story-chapter]')];
    const progressMarker = page.querySelector('.story-progress');
    const progress = page.querySelector('.story-progress-fill');
    const current = page.querySelector('.story-progress-current');
    const memoryPhoto = page.querySelector('.story-photo');
    const heroArt = page.querySelector('.story-hero-art');
    const feelingScroll = page.querySelector('.story-feelings-scroll');
    const windPetals = [...page.querySelectorAll('.story-wind-petal')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    hero.classList.add('is-visible');
    if (!('IntersectionObserver' in window) || reducedMotion) {
      page.classList.add('story-no-motion');
      targets.forEach(target => target.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(target => observer.observe(target));
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const readingLine = window.innerHeight * 0.45;
      const chapterRects = chapters.map(chapter => chapter.getBoundingClientRect());
      const memoryRect = memoryPhoto.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const feelingRect = feelingScroll.getBoundingClientRect();
      const windRects = windPetals.map(petal => petal.parentElement.getBoundingClientRect());
      let active = 0;
      chapterRects.forEach((rect, index) => {
        if (rect.top <= readingLine) active = index;
      });
      const first = chapterRects[0].top + window.scrollY - readingLine;
      const last = chapterRects.at(-1).bottom + window.scrollY - readingLine;
      const amount = Math.min(1, Math.max(0, (window.scrollY - first) / (last - first)));
      const drift = Math.min(1, Math.max(-1, (window.innerHeight / 2 - memoryRect.top - memoryRect.height / 2) / ((window.innerHeight + memoryRect.height) / 2)));
      current.textContent = String(active + 1).padStart(2, '0');
      progressMarker.classList.toggle('is-on-dark', active === chapters.length - 1);
      progress.style.transform = window.innerWidth <= 700 ? `scaleX(${amount})` : `scaleY(${amount})`;
      memoryPhoto.style.setProperty('--memory-drift', `${(drift * 9).toFixed(1)}px`);
      const paperTravel = Math.min(1, Math.max(0, -heroRect.top / Math.max(1, heroRect.height)));
      heroArt.style.setProperty('--paper-drift', `${(paperTravel * 12).toFixed(1)}px`);
      const feelingDistance = Math.max(1, feelingRect.height - window.innerHeight);
      const feelingProgress = Math.min(1, Math.max(0, -feelingRect.top / feelingDistance));
      setActiveFeeling(Math.min(feelings.length - 1, Math.floor(feelingProgress * feelings.length)));
      windPetals.forEach((petal, index) => {
        const rect = windRects[index];
        const travel = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
        petal.style.opacity = String(Math.sin(Math.PI * travel) * 0.42);
        petal.style.transform = `translate3d(${((travel - 0.5) * 105 + Math.sin(travel * 7 + index) * 10).toFixed(1)}px, ${(travel * 125 - 40).toFixed(1)}px, 0) rotate(${(travel * 185 + index * 50).toFixed(1)}deg)`;
      });
    };
    const scheduleProgress = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };
    updateProgress();
    window.addEventListener('scroll', scheduleProgress, { passive: true });
    window.addEventListener('resize', scheduleProgress);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleProgress);
      window.removeEventListener('resize', scheduleProgress);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return <div className="story-page">
    <div className="story-progress" aria-hidden="true"><span className="story-progress-current">01</span><span className="story-progress-track"><span className="story-progress-fill"/></span><span className="story-progress-total">05</span></div>
    <section className="story-hero" aria-labelledby="story-title">
      <div className="story-hero-art is-hyperframes is-composite-source is-motion-plate" role="img" aria-label="An illuminated perfume-house letter, rose, silk ribbon, wax seal, and botanical branches on aged paper">
        <div className="story-hero-layered-scene" aria-hidden="true">
          <img className="story-hero-layer story-hero-paper-layer story-hero-composite-layer" src="/assets/editorial/story-letter-base.webp" alt="" />
          <span className="story-hero-seal-sheen" />
          <span className="story-hero-paper-breathe" />
          <HeroWindFilter />
        </div>
        <img className="story-hero-base story-hero-fallback" src="/assets/editorial/story-letter-option2.png" alt=""/>
        <video className="story-hero-base story-hero-motion-video" autoPlay muted loop playsInline preload="auto" poster="/assets/editorial/story-letter-base.webp" aria-hidden="true">
          <source src="/assets/editorial/story-silk.mp4" type="video/mp4"/>
        </video>
        <img className="story-hero-flower" src="/assets/editorial/story-flower.webp" alt=""/>
        <div className="story-hero-petals" aria-hidden="true">
          <img className="story-hero-petal story-hero-petal-one" src="/assets/editorial/story-petal.webp" alt=""/>
          <img className="story-hero-petal story-hero-petal-two" src="/assets/editorial/story-petal.webp" alt=""/>
          <img className="story-hero-petal story-hero-petal-three" src="/assets/editorial/story-petal.webp" alt=""/>
        </div>
        <DustField/>
      </div>
      <div className="story-hero-copy"><span className="story-index">GOLDEN PERFUME HOUSE / A STORY IN FIVE CHAPTERS</span><h1 id="story-title">Every scent<br/>has a <em>story.</em></h1><p>Every story leaves a feeling.</p><span className="story-scroll">SCROLL TO TURN THE PAGE <span aria-hidden="true">↓</span></span></div>
    </section>
    <section className="story-chapter story-memory" data-story-chapter="1" aria-labelledby="memory-title">
      <div className="story-chapter-copy story-reveal"><span className="story-index">01 / THE MEMORY</span><h2 id="memory-title">Some moments<br/>never <em>leave us.</em></h2><p>A familiar embrace. A place that feels like home. The warmth of someone you love.</p><p>Then, unexpectedly, a scent brings it all back. That invisible connection between fragrance and memory is where GOLDEN PERFUME HOUSE begins.</p><span className="story-flourish" aria-hidden="true">✦</span></div>
      <figure className="story-photo story-reveal"><img src="/assets/editorial/story-memory.webp" alt="Hand-colored engraving of two crystal perfume flacons, a rose, and a remembered letter" loading="lazy" decoding="async"/><figcaption>THE ART OF REMEMBERING / GOLDEN PERFUME HOUSE</figcaption></figure>
    </section>
    <section className="story-philosophy" data-story-chapter="2" aria-labelledby="philosophy-title"><img className="story-sprig story-sprig-left" src="/assets/editorial/story-flower.webp" alt="" aria-hidden="true"/><img className="story-wind-petal story-wind-petal-right" src="/assets/editorial/story-petal.webp" alt="" aria-hidden="true"/><div className="story-section-heading story-reveal"><span className="story-index">02 / THE PHILOSOPHY</span><h2 id="philosophy-title">The soul. The memory.<br/><em>The feeling.</em></h2><p>Three quiet ideas guide every story we tell.</p></div><div className="story-principles story-reveal"><article><span>Ⅰ</span><h3>Who you are</h3><p>A scent that reflects your individuality.</p></article><article><span>Ⅱ</span><h3>What you carry</h3><p>A trace of the moments that shaped you.</p></article><article><span>Ⅲ</span><h3>What you leave behind</h3><p>The feeling someone remembers.</p></article></div></section>
    <section className="story-composition" data-story-chapter="3" aria-labelledby="composition-title"><img className="story-wind-petal story-wind-petal-left" src="/assets/editorial/story-petal.webp" alt="" aria-hidden="true"/><div className="story-composition-heading story-reveal"><span className="story-index">03 / THE COMPOSITION</span><h2 id="composition-title">A feeling,<br/><em>made tangible.</em></h2><p>Notes gather like fragments of a memory. Together, they become something deeply personal.</p></div><div className="story-artwork story-reveal"><img src="/assets/editorial/story-composition.webp" alt="Hand-engraved GOLDEN PERFUME HOUSE style bottle surrounded by bergamot, rose, sandalwood, and amber" loading="lazy" decoding="async"/></div><div className="story-ingredient-line" aria-label="Bergamot, rose, sandalwood, and amber"><span className="story-reveal">BERGAMOT</span><span className="story-reveal">ROSE</span><span className="story-reveal">SANDALWOOD</span><span className="story-reveal">AMBER</span></div></section>
    <section className="story-keepsakes" data-story-chapter="4" aria-labelledby="keepsakes-title">
      <img className="story-sprig story-sprig-right" src="/assets/editorial/story-flower.webp" alt="" aria-hidden="true"/>
      <img className="story-wind-petal story-wind-petal-keepsakes" src="/assets/editorial/story-petal.webp" alt="" aria-hidden="true"/>
      <div className="story-section-heading story-reveal"><span className="story-index">04 / THE COLLECTION</span><h2 id="keepsakes-title">Five feelings.<br/><em>Endless stories.</em></h2><p>Each fragrance is an invitation to discover another side of yourself.</p></div>
      <div className="story-feelings-scroll"><div className="story-feelings-stage">
        <div className="story-feelings-image"><img src="/assets/editorial/story-keepsakes.webp" alt="Five illustrated keepsake cards with citrus, rose, sandalwood, amber, and a ribbon-tied letter" loading="lazy" decoding="async" style={{ objectPosition: `${activeFeeling * 25}% center` }}/></div>
        <div className="story-feelings-copy"><span className="story-index">THE COLLECTION / FIVE FEELINGS</span><div className="story-feelings-stack">{feelings.map((item, index) => <article className={`${activeFeeling === index ? 'is-active' : ''}${item.name.length > 10 ? ' is-long' : ''}`} key={item.name}><span>0{index + 1} / 05</span><h3>{item.name}</h3><p>{item.meaning}</p></article>)}</div><div className="story-feelings-steps" aria-hidden="true">{feelings.map((item, index) => <span className={activeFeeling === index ? 'is-active' : ''} key={item.name}/>)}</div></div>
      </div></div>
    </section>
    <section className="story-ending story-ending-animated" data-story-chapter="5"><span className="story-index story-reveal">05 / AN INVITATION</span><h2 className="story-reveal">And now,<br/><em>your story.</em></h2><p className="story-reveal">A scent may disappear from the air. The feeling it leaves behind can stay forever.</p><Link to="/collections" className="outline-button light story-reveal">Discover the collection <span aria-hidden="true">↗</span></Link></section>
  </div>;
}

function Testimonials() {
  const [items, setItems] = useState([]);
  useEffect(() => { api('/api/testimonials').then(setItems).catch(console.error); }, []);
  const types = ['text', 'audio', 'video'];
  return <div className="page-shell"><div className="page-heading"><span className="eyebrow">CLIENT STORIES</span><h1>In their <em>own words.</em></h1><p>Every fragrance becomes part of someone's story. This is where those stories belong.</p></div><div className="testimonial-grid">{types.map(type => { const matches = items.filter(item => item.type === type); return <section className="testimonial-column" key={type}><span className="eyebrow">{type.toUpperCase()} STORIES</span>{matches.length ? matches.map((item, i) => <article className="testimonial-card" key={i}><h2>{item.title || 'A GOLDEN PERFUME HOUSE story'}</h2>{type === 'text' ? <blockquote>“{item.quote}”</blockquote> : type === 'audio' ? <audio controls src={item.src}>Your browser does not support audio.</audio> : <video controls preload="metadata" src={item.src}>Your browser does not support video.</video>}<span>{item.name || 'GOLDEN PERFUME HOUSE client'}</span></article>) : <div className="story-placeholder"><span>{type === 'text' ? '“' : type === 'audio' ? '♫' : '▷'}</span><h2>{type === 'text' ? 'Words to come.' : type === 'audio' ? 'Voices to come.' : 'Moments to come.'}</h2><p>Approved client {type} stories will appear here.</p></div>}</section>; })}</div></div>;
}

function TrackOrder() {
  const [code, setCode] = useState(''); const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setOrder(null);
    try { setOrder(await api('/api/orders/track', { method: 'POST', body: JSON.stringify({ code, phone }) })); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const currentStage = order ? trackingStages.findIndex(stage => stage.status === order.status) : -1;
  const isCancelled = order?.status === 'Cancelled';
  const isDelivered = order?.status === 'Delivered';
  const progress = Math.max(0, currentStage) / (trackingStages.length - 1) * 100;
  const historyByStatus = new Map(order?.history?.map(event => [event.status, event]) || []);
  const destinationCopy = isDelivered ? 'Delivered to your address' : order?.status === 'Out for delivery' ? 'On its final route to your address' : order?.status === 'Dispatched' ? 'Travelling to your delivery address' : 'Your delivery address is reserved';
  return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">ORDER ASSISTANCE</span><h1>Follow the <em>journey.</em></h1><p>Enter the order code and phone number shared when your order was confirmed.</p></div><form className="track-form" onSubmit={submit}><label>Order code<input value={code} onChange={e => setCode(e.target.value)} placeholder="SL-XXXXXXXX" required/></label><label>Phone number<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Number used for your order" required/></label><button className="solid-button" disabled={busy}>{busy ? 'Looking up your order…' : 'Track order →'}</button>{error && <p className="form-error" role="alert">{error}</p>}</form>{order && <section className={`tracking-result ${isCancelled ? 'is-cancelled' : ''}`} aria-label={`Tracking for order ${order.code}`}><div className="tracking-summary"><div><span className="eyebrow">ORDER {order.code}</span><h2>{order.status}</h2><p>{order.products.join(', ')}</p></div>{!isCancelled && <div className="tracking-current"><span>Current stage</span><strong>{String(currentStage + 1).padStart(2, '0')} <small>/ {String(trackingStages.length).padStart(2, '0')}</small></strong></div>}</div>{isCancelled ? <div className="tracking-exception"><strong>This order has been cancelled.</strong><span>Please contact the house if you need any assistance.</span></div> : <><div className="tracking-route-heading"><span className="eyebrow">LIVE DELIVERY JOURNEY</span><div className="tracking-destination"><span>Destination</span><strong>{destinationCopy}</strong></div></div><div className="tracking-journey" style={{ '--tracking-progress': `${progress}%` }}><div className="tracking-line" aria-hidden="true"><span/></div><ol>{trackingStages.map((stage, index) => { const event = historyByStatus.get(stage.status); const state = index < currentStage ? (event ? 'complete' : 'passed') : index === currentStage ? 'current' : 'upcoming'; return <li key={stage.status} className={state}><span className="tracking-marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><strong>{stage.title}</strong>{event && <time>{new Date(event.at).toLocaleString()}</time>}<span className="sr-only">{state === 'complete' ? 'Completed' : state === 'passed' ? 'Passed without a recorded update' : state === 'current' ? 'Current stage' : 'Upcoming stage'}</span></div></li>; })}</ol></div><div className={`tracking-review ${isDelivered ? 'available' : ''}`}><span className="review-marker" aria-hidden="true">07</span><div><span className="eyebrow">CLIENT REVIEW</span><h3>{isDelivered ? 'Your story is ready to be shared.' : 'Review invitation follows delivery.'}</h3></div>{isDelivered ? <Link to="/contact" className="outline-button">Share a review <span>↗</span></Link> : <span className="review-state">After delivery</span>}</div></>}</section>}</div>;
}

function Contact({ whatsapp }) {
  return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">GET IN TOUCH</span><h1>Let's <em>talk fragrance.</em></h1><p>Whether you're choosing a signature scent or asking about an order, we'd love to hear from you.</p></div><div className="contact-panel"><span className="eyebrow">PERSONAL ASSISTANCE</span><h2>A conversation begins here.</h2><p>Send us a message on WhatsApp and we'll help with availability, selection, and ordering.</p><WhatsAppButton whatsapp={whatsapp}/></div></div>;
}

function Admin({ products }) {
  const [key, setKey] = useState(() => sessionStorage.getItem('silence-admin-key') || '');
  const [draftKey, setDraftKey] = useState('');
  const [orders, setOrders] = useState([]); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ customerName: '', phone: '', productIds: [] });
  const [stories, setStories] = useState([]);
  const [story, setStory] = useState({ type: 'text', name: '', title: '', quote: '', src: '', approved: false });
  const adminApi = (url, options = {}, token = key) => api(url, { ...options, headers: { Authorization: `Bearer ${token}`, ...options.headers } });
  async function load(token = key) { try { const [orderItems, storyItems] = await Promise.all([adminApi('/api/admin/orders', {}, token), adminApi('/api/admin/testimonials', {}, token)]); setOrders(orderItems); setStories(storyItems); setError(''); } catch (e) { setError(e.message); } }
  useEffect(() => { if (key) load(key); }, [key]);
  async function login(event) { event.preventDefault(); try { await adminApi('/api/admin/orders', {}, draftKey); sessionStorage.setItem('silence-admin-key', draftKey); setKey(draftKey); setDraftKey(''); setError(''); } catch (e) { setError(e.message); } }
  async function create(event) { event.preventDefault(); try { const order = await adminApi('/api/admin/orders', { method: 'POST', body: JSON.stringify(form) }); setNotice(`Created ${order.code}. Share this code and the registered phone number with the customer.`); setForm({ customerName: '', phone: '', productIds: [] }); await load(); } catch (e) { setError(e.message); } }
  async function changeStatus(code, status) { try { await adminApi(`/api/admin/orders/${code}`, { method: 'PATCH', body: JSON.stringify({ status }) }); setNotice(`${code} updated to ${status}.`); await load(); } catch (e) { setError(e.message); } }
  async function addStory(event) { event.preventDefault(); try { await adminApi('/api/admin/testimonials', { method: 'POST', body: JSON.stringify(story) }); setStory({ type: 'text', name: '', title: '', quote: '', src: '', approved: false }); setNotice('Story added.'); await load(); } catch (e) { setError(e.message); } }
  async function approveStory(id, approved) { try { await adminApi(`/api/admin/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify({ approved }) }); await load(); } catch (e) { setError(e.message); } }
  return <div className="page-shell admin-page"><div className="page-heading"><span className="eyebrow">HOUSE OPERATIONS</span><h1>House <em>management.</em></h1></div>{!key ? <form className="track-form" onSubmit={login}><label>Admin API key<input type="password" value={draftKey} onChange={e => setDraftKey(e.target.value)} required autoComplete="current-password"/></label><button className="solid-button">Sign in →</button>{error && <p className="form-error">{error}</p>}</form> : <><div className="admin-toolbar"><button onClick={() => { sessionStorage.removeItem('silence-admin-key'); setKey(''); setOrders([]); setStories([]); }}>Sign out</button><button onClick={() => load()}>Refresh data</button></div><form className="admin-create" onSubmit={create}><h2>Create an order</h2><div className="admin-fields"><label>Customer name<input required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })}/></label><label>Phone number<input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/></label></div><fieldset><legend>Fragrances</legend>{products.map(product => <label key={product.id}><input type="checkbox" checked={form.productIds.includes(product.id)} onChange={e => setForm({ ...form, productIds: e.target.checked ? [...form.productIds, product.id] : form.productIds.filter(id => id !== product.id) })}/>{product.name}</label>)}</fieldset><button className="solid-button">Create order →</button></form>{notice && <p className="form-success" role="status">{notice}</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="admin-orders"><h2>Orders</h2>{orders.length ? orders.map(order => <article key={order.code} className="admin-order"><div><strong>{order.code}</strong><span>{order.customerName} · {order.phone}</span><span>{order.productIds.map(id => products.find(p => p.id === id)?.name).filter(Boolean).join(', ')}</span></div><label>Status<select value={order.status} onChange={e => changeStatus(order.code, e.target.value)}>{statusOptions.map(status => <option key={status}>{status}</option>)}</select></label></article>) : <p>No orders yet.</p>}</div><form className="admin-create story-admin-form" onSubmit={addStory}><h2>Add a client story</h2><div className="admin-fields"><label>Format<select value={story.type} onChange={e => setStory({ ...story, type: e.target.value })}><option value="text">Text</option><option value="audio">Audio</option><option value="video">Video</option></select></label><label>Client name<input required value={story.name} onChange={e => setStory({ ...story, name: e.target.value })}/></label></div><label>Title<input value={story.title} onChange={e => setStory({ ...story, title: e.target.value })}/></label>{story.type === 'text' ? <label>Quote<textarea required value={story.quote} onChange={e => setStory({ ...story, quote: e.target.value })}/></label> : <label>HTTPS media URL<input type="url" required value={story.src} onChange={e => setStory({ ...story, src: e.target.value })} placeholder="https://…"/></label>}<label className="approve-checkbox"><input type="checkbox" checked={story.approved} onChange={e => setStory({ ...story, approved: e.target.checked })}/> Approved for publication</label><button className="solid-button">Add story →</button></form><div className="admin-orders"><h2>Client stories</h2>{stories.length ? stories.map(item => <article className="admin-order" key={item.id}><div><strong>{item.title || item.type}</strong><span>{item.name} · {item.type}</span></div><label>Approved<select value={String(item.approved)} onChange={e => approveStory(item.id, e.target.value === 'true')}><option value="false">No</option><option value="true">Yes</option></select></label></article>) : <p>No client stories yet.</p>}</div></>}</div>;
}

function SiteBotanicals() {
  const { pathname } = useLocation();
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => setScroll(window.scrollY)); };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); };
  }, [pathname]);
  if (pathname === '/about' || pathname === '/admin') return null;
  const phase = scroll * .13;
  return <div className="site-botanicals" aria-hidden="true">
    <img className="site-botanical site-botanical-left" src="/assets/editorial/story-flower.webp" alt=""/>
    <img className="site-botanical site-botanical-right" src="/assets/editorial/story-flower.webp" alt=""/>
    {[0, 1, 2].map((index) => <img key={index} className="site-floating-petal" src="/assets/editorial/story-petal.webp" alt="" style={{ left: `${14 + index * 31}%`, top: `${24 + index * 23}%`, transform: `translate3d(${Math.sin(phase / 110 + index * 2) * 38}px, ${((phase + index * 140) % 420) - 210}px, 0) rotate(${phase * .24 + index * 42}deg)` }}/>) }
  </div>;
}

function App() {
  const [products, setProducts] = useState([]); const [whatsapp, setWhatsapp] = useState('');
  const [dataReady, setDataReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(() => window.location.pathname !== '/');
  useEffect(() => {
    let active = true;
    Promise.allSettled([api('/api/products'), api('/api/config'), document.fonts?.ready || Promise.resolve()]).then(([productResult, configResult]) => {
      if (!active) return;
      if (productResult.status === 'fulfilled') setProducts(productResult.value); else console.error(productResult.reason);
      if (configResult.status === 'fulfilled') setWhatsapp(configResult.value.whatsapp); else console.error(configResult.reason);
      setDataReady(true);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!dataReady || !sceneReady) return undefined;
    const intro = document.getElementById('site-intro');
    let removal;
    const reveal = window.setTimeout(() => {
      intro?.classList.add('is-complete');
      intro?.setAttribute('aria-hidden', 'true');
      removal = window.setTimeout(() => {
        intro?.remove();
        document.getElementById('root')?.removeAttribute('inert');
        document.getElementById('root')?.setAttribute('aria-busy', 'false');
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
    }, Math.max(0, (window.location.pathname === '/' ? 1850 : 400) - performance.now()));
    return () => { window.clearTimeout(reveal); window.clearTimeout(removal); };
  }, [dataReady, sceneReady]);
  return <BrowserRouter><ScrollToTop/><SiteBotanicals/><Header/><main><Routes><Route path="/" element={<Home products={products} onSceneReady={() => setSceneReady(true)}/>}/><Route path="/collections" element={<Collections products={products}/>}/><Route path="/product/:id" element={<ProductDetail products={products} whatsapp={whatsapp}/>}/><Route path="/about" element={<About/>}/><Route path="/testimonials" element={<Testimonials/>}/><Route path="/track" element={<TrackOrder/>}/><Route path="/contact" element={<Contact whatsapp={whatsapp}/>}/><Route path="/admin" element={<Admin products={products}/>}/><Route path="*" element={<div className="page-shell empty-state"><h1>Page not found.</h1><Link to="/" className="text-link">Return home ↗</Link></div>}/></Routes></main><Footer/></BrowserRouter>;
}

export default App;
