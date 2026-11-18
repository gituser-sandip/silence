import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import './App.css';
import './heritage.css';
import SceneLoader from './SceneLoader';

const PerfumeScene = React.lazy(() => import('./PerfumeScene'));
const KeepsakeScene = React.lazy(() => import('./KeepsakeScene'));

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
  { name: 'PURE', meaning: 'The beauty of simplicity and fresh beginnings.', model: '/assets/keepsakes/pure-citrus.glb', preview: '/assets/keepsakes/previews/pure-citrus.webp', alt: 'A gilt parchment keepsake with sculpted jasmine blossoms, layered leaves, and cut bergamot' },
  { name: 'REMINISCENCE', meaning: 'The warmth of memories that never leave.', model: '/assets/keepsakes/reminiscence-rose.glb', preview: '/assets/keepsakes/previews/reminiscence-rose.webp', alt: 'A gilt parchment keepsake with a sculpted antique rose, stem, leaves, and fallen petals' },
  { name: 'AFTERGLOW', meaning: 'The impression that remains after a moment has passed.', model: '/assets/keepsakes/afterglow-sandalwood.glb', preview: '/assets/keepsakes/previews/afterglow-sandalwood.webp', alt: 'A gilt parchment keepsake with hand split sandalwood, carved grain, and curled shavings' },
  { name: 'SOULMATE', meaning: 'The feeling of a meaningful connection.', model: '/assets/keepsakes/soulmate-amber.glb', preview: '/assets/keepsakes/previews/soulmate-amber.webp', alt: 'A gilt parchment keepsake with faceted amber and pressed olive foliage' },
  { name: 'ETERNAL', meaning: 'The desire to hold onto something timeless.', model: '/assets/keepsakes/eternal-letter.glb', preview: '/assets/keepsakes/previews/eternal-letter.webp', alt: 'A gilt parchment keepsake with folded correspondence, wax seal, sculpted blossom, and flowing silk ribbon' }
];

const formatPrice = value => Number.isFinite(value) ? new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(value) : 'Price pending verification';

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

function Header({ cartCount }) {
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
      <NavLink to="/scent-finder">Help me choose</NavLink>
      <NavLink to="/guide">Fragrance guide</NavLink>
      <NavLink to="/about">Our story</NavLink>
      <NavLink to="/testimonials">Client stories</NavLink>
      <NavLink to="/track">Track order</NavLink>
      <NavLink to="/cart">Bag ({cartCount})</NavLink>
      {location.pathname.startsWith('/admin') && <NavLink to="/admin/operations">Catalogue & queries</NavLink>}
    </nav>
  </header>;
}

function Newsletter({ enabled }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setError(''); setNotice('');
    try { const result = await api('/api/newsletter', { method: 'POST', body: JSON.stringify({ email, consent }) }); setNotice(result.message); setEmail(''); setConsent(false); }
    catch (e) { setError(e.message); }
  }
  if (!enabled) return <p className="footer-note">Newsletter signup opens when secure subscriber storage is configured.</p>;
  return <form className="newsletter-form" onSubmit={submit}><label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/></label><label className="consent-check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required/> I agree to receive occasional fragrance updates and offers. I can unsubscribe at any time.</label><button type="submit">Join the list →</button>{notice && <p role="status">{notice}</p>}{error && <p className="form-error" role="alert">{error}</p>}</form>;
}

function Footer({ config }) {
  return <footer className="site-footer">
    <div className="footer-top"><div><span className="eyebrow">MORE THAN A SCENT, IT'S A FEELING</span><h2>Leave a feeling.<br/><em>Keep a memory.</em></h2></div><Link className="outline-button light" to="/collections">Explore the collection <span>↗</span></Link></div>
    <div className="footer-grid">
      <div><Link className="brand footer-brand" to="/"><span>GOLDEN</span><small>PERFUME HOUSE</small></Link><p>More Than a Scent, It's a Feeling.</p></div>
      <div><span className="footer-heading">Explore</span><Link to="/collections">Collection</Link><Link to="/about">Our story</Link><Link to="/testimonials">Client stories</Link></div>
      <div><span className="footer-heading">Assistance</span><Link to="/scent-finder">Help me choose</Link><Link to="/guide">Fragrance guide</Link><Link to="/faq">FAQ</Link><Link to="/track">Track an order</Link><Link to="/review">Leave a verified review</Link><Link to="/contact">Contact</Link></div>
      <div><span className="footer-heading">Trust & policies</span><Link to="/trust">Sourcing & trust</Link><Link to="/delivery">Delivery</Link><Link to="/returns">Returns</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div>
      <div className="footer-newsletter"><span className="footer-heading">Stay close</span><p>New arrivals, useful fragrance guidance and occasional offers. No unnecessary messages.</p><Newsletter enabled={config.newsletterEnabled}/></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} GOLDEN PERFUME HOUSE</span><span>Leave a Feeling. Keep a Memory.</span></div>
  </footer>;
}

function ProductCard({ product, index, total = 12, onAdd }) {
  const purchasable = product.verified && Number.isFinite(product.price) && product.stock > 0;
  return <article className="product-card">
    <Link to={`/product/${product.id}`} className="product-image" style={{ '--card-tone': product.color }} aria-label={`View ${product.name}`}>
      <span className="product-number">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span><img className="product-bottle-photo" src="/assets/exploded/bottle-golden.webp" alt="" loading="lazy"/><span className="product-discover">Discover fragrance ↗</span>
    </Link>
    <div className="product-caption"><div><span className="eyebrow">{product.family}</span><h3>{product.name}</h3><p>{product.size || 'Size pending'} · {formatPrice(product.price)}</p></div><Link to={`/product/${product.id}`} aria-label={`Explore ${product.name}`} className="round-arrow">↗</Link></div>
    {purchasable ? <button className="card-add" type="button" onClick={() => onAdd(product.id)}>Add to bag</button> : <span className="availability-note">{product.availability}</span>}
  </article>;
}

function Home({ products, onSceneReady, onAdd }) {
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
    <section className="featured-section"><div className="section-title-row"><div><span className="eyebrow">THE COLLECTION</span><h2>Scents with a <em>story.</em></h2></div><Link to="/collections" className="text-link">View all fragrances <span>↗</span></Link></div><div className="featured-grid">{products.filter(p => p.featured).map((product, index) => <ProductCard key={product.id} product={product} index={index} total={products.filter(p => p.featured).length} onAdd={onAdd}/>)}</div></section>
    <section className="story-panel"><div className="story-visual"><img className="atelier-image" src="/assets/editorial/story-atelier-recreated.webp" alt="A vintage perfumer's workshop with copper equipment, flowers, citrus, and glass flasks" loading="lazy"/><span>THE ART OF COMPOSITION</span></div><div className="story-content"><span className="eyebrow">OUR STORY</span><h2>Every scent has<br/><em>a story.</em></h2><p>We began with the bond between fragrance and memory. A familiar note can bring back a person, a place, or a feeling we thought we had forgotten.</p><Link className="outline-button" to="/about">Discover our story <span>↗</span></Link></div></section>
    <section className="testimonial-teaser"><span className="eyebrow">CLIENT STORIES</span><h2>Stories worth <em>sharing.</em></h2><p>Real words and moments from the people who wear GOLDEN PERFUME HOUSE.</p><Link to="/testimonials" className="text-link">Explore client stories <span>↗</span></Link></section>
  </>;
}

function Collections({ products, onAdd }) {
  const [filters, setFilters] = useState({ search: '', category: 'All', family: 'All', size: 'All', occasion: 'All', availability: 'All', maxPrice: '' });
  const values = key => ['All', ...new Set(products.flatMap(product => key === 'occasion' ? product.occasions : [product[key]]).filter(Boolean))];
  const visible = products.filter(product => {
    const query = filters.search.toLowerCase();
    return (!query || `${product.name} ${product.brand} ${product.family} ${product.notes.join(' ')}`.toLowerCase().includes(query))
      && (filters.category === 'All' || product.category === filters.category)
      && (filters.family === 'All' || product.family === filters.family)
      && (filters.size === 'All' || product.size === filters.size)
      && (filters.occasion === 'All' || product.occasions.includes(filters.occasion))
      && (filters.availability === 'All' || (filters.availability === 'In stock' ? product.stock > 0 : product.stock === 0))
      && (!filters.maxPrice || (Number.isFinite(product.price) && product.price <= Number(filters.maxPrice)));
  });
  const update = event => setFilters({ ...filters, [event.target.name]: event.target.value });
  return <div className="page-shell"><div className="page-heading"><span className="eyebrow">THE COLLECTION</span><h1>Find your <em>signature.</em></h1><p>Search by character, family and occasion. Prices and availability appear only after supplier verification.</p></div><details className="catalogue-filters" open><summary>Search and filters</summary><div><label>Search<input name="search" type="search" value={filters.search} onChange={update} placeholder="Name, family or note"/></label><label>Category<select name="category" value={filters.category} onChange={update}>{values('category').map(value => <option key={value}>{value}</option>)}</select></label><label>Fragrance family<select name="family" value={filters.family} onChange={update}>{values('family').map(value => <option key={value}>{value}</option>)}</select></label><label>Bottle size<select name="size" value={filters.size} onChange={update}>{values('size').map(value => <option key={value}>{value}</option>)}</select></label><label>Occasion<select name="occasion" value={filters.occasion} onChange={update}>{values('occasion').map(value => <option key={value}>{value}</option>)}</select></label><label>Availability<select name="availability" value={filters.availability} onChange={update}><option>All</option><option>In stock</option><option>Unavailable</option></select></label><label>Maximum price (NPR)<input name="maxPrice" type="number" min="0" value={filters.maxPrice} onChange={update}/></label><button type="button" onClick={() => setFilters({ search: '', category: 'All', family: 'All', size: 'All', occasion: 'All', availability: 'All', maxPrice: '' })}>Clear filters</button></div></details><p className="result-count" role="status">{visible.length} fragrance{visible.length === 1 ? '' : 's'} found</p>{visible.length ? <div className="collection-grid">{visible.map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={onAdd}/>)}</div> : <div className="empty-results"><h2>No matching fragrances.</h2><p>Clear a filter or ask the house for personal help.</p><Link to="/scent-finder" className="text-link">Help me choose ↗</Link></div>}</div>;
}

function WhatsAppButton({ product, whatsapp, className = 'solid-button' }) {
  if (!whatsapp) return <div className="config-notice">WhatsApp ordering opens when the house number is added.</div>;
  const message = product ? `Hello GOLDEN PERFUME HOUSE, I would like to enquire about ${product.name}.` : 'Hello GOLDEN PERFUME HOUSE, I would like to enquire about your fragrances.';
  return <a className={className} target="_blank" rel="noopener noreferrer" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}>Enquire on WhatsApp <span>↗</span></a>;
}

function ProductDetail({ products, whatsapp, onAdd }) {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  if (!product) return <div className="page-shell empty-state"><h1>Fragrance not found.</h1><Link to="/collections" className="text-link">Return to collection ↗</Link></div>;
  const purchasable = product.verified && Number.isFinite(product.price) && product.stock > 0;
  return <div className="page-shell"><div className="breadcrumb"><Link to="/collections">Collection</Link><span>/</span>{product.name}</div><div className="detail-layout"><div className="detail-visual" style={{ '--card-tone': product.color }}><img className="detail-bottle-photo" src="/assets/exploded/bottle-golden.webp" alt={`${product.name} perfume bottle`}/><span className="detail-vertical">{product.brand.toUpperCase()}</span></div><div className="detail-copy"><span className="eyebrow">{product.brand} · {product.family}</span><h1>{product.name}</h1><p className="product-meta"><strong>{product.size || 'Size pending verification'}</strong><strong>{formatPrice(product.price)}</strong><span>{product.availability}</span></p><p className="detail-lead">{product.description}</p><div className="note-list"><h2>The composition</h2>{['Opening', 'Heart', 'Base'].map((label, i) => <div key={label}><span>{label}</span><p>{product.notes[i]}</p></div>)}</div><p><strong>Fragrance family:</strong> {product.family}<br/><strong>Suggested occasions:</strong> {product.occasions.join(', ')}</p>{purchasable && <button className="solid-button" type="button" onClick={() => onAdd(product.id)}>Add to bag →</button>}<WhatsAppButton product={product} whatsapp={whatsapp}/>{whatsapp && <p className="detail-assist">A personal enquiry opens in WhatsApp. Our team will help with availability, delivery and returns.</p>}<div className="reassurance-links"><Link to="/delivery">Delivery information</Link><Link to="/returns">Returns policy</Link><Link to="/trust">Sourcing & trust</Link><Link to="/faq">Frequently asked questions</Link></div></div></div><div className="detail-bottom"><span>PRODUCT INFORMATION IS PUBLISHED ONLY AFTER VERIFICATION</span><Link to="/collections" className="text-link">Explore more scents ↗</Link></div></div>;
}

function About() {
  const [activeFeeling, setActiveFeeling] = useState(0);
  useEffect(() => {
    const hero = document.querySelector('.story-hero');
    const art = hero?.querySelector('.story-hero-art');
    if (!hero || !art) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return undefined;
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
    <section className="story-hero story-hero-atelier" aria-labelledby="story-title">
      <div className="story-hero-art is-atelier" role="img" aria-label="Oil painting of three perfumers working among amber bottles and copper stills in a vintage atelier">
        <img className="story-hero-base story-atelier-painting" src="/assets/editorial/about-perfumers-atelier.webp" alt="" fetchpriority="high"/>
      </div>
      <div className="story-hero-copy"><span className="story-index">GOLDEN PERFUME HOUSE / A STORY IN FIVE CHAPTERS</span><h1 id="story-title">Every scent<br/>has a <em>story.</em></h1><p>Every story leaves a feeling.</p><span className="story-scroll">SCROLL TO TURN THE PAGE <span aria-hidden="true">↓</span></span></div>
    </section>
    <section className="story-chapter story-memory" data-story-chapter="1" aria-labelledby="memory-title">
      <div className="story-chapter-copy story-reveal"><span className="story-index">01 / THE MEMORY</span><h2 id="memory-title">Some moments<br/>never <em>leave us.</em></h2><p>A familiar embrace. A place that feels like home. The warmth of someone you love.</p><p>Then, unexpectedly, a scent brings it all back. That invisible connection between fragrance and memory is where GOLDEN PERFUME HOUSE begins.</p><span className="story-flourish" aria-hidden="true">✦</span></div>
      <figure className="story-photo story-reveal"><img src="/assets/editorial/story-memory-recreated.png" alt="Antique perfume bottle, wilted rose, botanical sprigs, and an aged keepsake letter on a perfumer's writing table" loading="lazy" decoding="async"/></figure>
    </section>
    <section className="story-philosophy" data-story-chapter="2" aria-labelledby="philosophy-title"><img className="story-sprig story-sprig-left" src="/assets/editorial/story-flower.webp" alt="" aria-hidden="true"/><img className="story-wind-petal story-wind-petal-right" src="/assets/editorial/story-petal.webp" alt="" aria-hidden="true"/><div className="story-section-heading story-reveal"><span className="story-index">02 / THE PHILOSOPHY</span><h2 id="philosophy-title">The soul. The memory.<br/><em>The feeling.</em></h2><p>Three quiet ideas guide every story we tell.</p></div><div className="story-principles story-reveal"><article><span>Ⅰ</span><h3>Who you are</h3><p>A scent that reflects your individuality.</p></article><article><span>Ⅱ</span><h3>What you carry</h3><p>A trace of the moments that shaped you.</p></article><article><span>Ⅲ</span><h3>What you leave behind</h3><p>The feeling someone remembers.</p></article></div></section>
    <section className="story-composition" data-story-chapter="3" aria-labelledby="composition-title"><div className="story-composition-heading story-reveal"><span className="story-index">03 / THE COMPOSITION</span><h2 id="composition-title">A feeling,<br/><em>made tangible.</em></h2><p>Notes gather like fragments of a memory. Together, they become something deeply personal.</p></div><div className="story-artwork story-reveal"><img src="/assets/editorial/story-composition-recreated.png" alt="A perfumer's antique workbench with an amber perfume bottle, formula card, brass scale, scent strips, bergamot, rose, sandalwood, and amber" loading="lazy" decoding="async"/></div><div className="story-ingredient-line" aria-label="Bergamot, rose, sandalwood, and amber"><span className="story-reveal">BERGAMOT</span><span className="story-reveal">ROSE</span><span className="story-reveal">SANDALWOOD</span><span className="story-reveal">AMBER</span></div></section>
    <section className="story-keepsakes" data-story-chapter="4" aria-labelledby="keepsakes-title">
      <img className="story-sprig story-sprig-right" src="/assets/editorial/story-flower.webp" alt="" aria-hidden="true"/>
      <img className="story-wind-petal story-wind-petal-keepsakes" src="/assets/editorial/story-petal.webp" alt="" aria-hidden="true"/>
      <div className="story-section-heading story-reveal"><span className="story-index">04 / THE COLLECTION</span><h2 id="keepsakes-title">Five feelings.<br/><em>Endless stories.</em></h2><p>Each fragrance is an invitation to discover another side of yourself.</p></div>
      <div className="story-feelings-scroll"><div className="story-feelings-stage">
        <div className="story-feelings-image"><React.Suspense fallback={<img src={feelings[activeFeeling].preview} alt=""/>}><KeepsakeScene key={feelings[activeFeeling].model} model={feelings[activeFeeling].model} preview={feelings[activeFeeling].preview} alt={feelings[activeFeeling].alt}/></React.Suspense></div>
        <div className="story-feelings-copy"><span className="story-index">THE COLLECTION / FIVE FEELINGS</span><p className="sr-only" aria-live="polite">Showing {feelings[activeFeeling].name}: {feelings[activeFeeling].meaning}</p><div className="story-feelings-stack">{feelings.map((item, index) => <article className={`${activeFeeling === index ? 'is-active' : ''}${item.name.length > 10 ? ' is-long' : ''}`} key={item.name} aria-hidden={activeFeeling !== index}><span>0{index + 1} / 05</span><h3>{item.name}</h3><p>{item.meaning}</p></article>)}</div><div className="story-feelings-steps" aria-label="Choose a feeling">{feelings.map((item, index) => <button type="button" className={activeFeeling === index ? 'is-active' : ''} aria-label={`Show ${item.name}`} aria-pressed={activeFeeling === index} onClick={() => setActiveFeeling(index)} key={item.name}/>)}</div></div>
      </div></div>
    </section>
    <section className="story-ending story-ending-animated" data-story-chapter="5"><span className="story-index story-reveal">05 / AN INVITATION</span><h2 className="story-reveal">And now,<br/><em>your story.</em></h2><p className="story-reveal">A scent may disappear from the air. The feeling it leaves behind can stay forever.</p><Link to="/collections" className="outline-button light story-reveal">Discover the collection <span aria-hidden="true">↗</span></Link></section>
  </div>;
}

function ScentFinder({ products }) {
  const [answers, setAnswers] = useState({ family: 'All', occasion: 'All', budget: '' });
  const [searched, setSearched] = useState(false);
  const available = products.filter(product => product.verified && product.stock > 0);
  const matches = available.filter(product => (answers.family === 'All' || product.category === answers.family) && (answers.occasion === 'All' || product.occasions.includes(answers.occasion)) && (!answers.budget || product.price <= Number(answers.budget)));
  return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">PERSONAL GUIDANCE</span><h1>Help me <em>choose.</em></h1><p>Tell us the scent family, occasion and budget you have in mind. We only recommend products confirmed as in stock.</p></div><form className="guided-form" onSubmit={event => { event.preventDefault(); setSearched(true); }}><label>Preferred scent family<select value={answers.family} onChange={e => setAnswers({ ...answers, family: e.target.value })}><option>All</option>{[...new Set(products.map(product => product.category))].map(value => <option key={value}>{value}</option>)}</select></label><label>Occasion<select value={answers.occasion} onChange={e => setAnswers({ ...answers, occasion: e.target.value })}><option>All</option>{[...new Set(products.flatMap(product => product.occasions))].map(value => <option key={value}>{value}</option>)}</select></label><label>Maximum budget (NPR)<input type="number" min="0" value={answers.budget} onChange={e => setAnswers({ ...answers, budget: e.target.value })}/></label><button className="solid-button">Find suitable fragrances →</button></form>{searched && <section className="finder-results" aria-live="polite"><h2>{matches.length ? 'Suitable choices' : 'No verified in-stock match yet.'}</h2>{matches.map(product => <Link key={product.id} to={`/product/${product.id}`}>{product.name} <span>{formatPrice(product.price)} ↗</span></Link>)}{!matches.length && <p>Supplier product data is still being confirmed. <Link to="/contact">Ask the house for personal help.</Link></p>}</section>}</div>;
}

function Cart({ products, cart, setQuantity, remove }) {
  const items = cart.map(item => ({ ...item, product: products.find(product => product.id === item.id) })).filter(item => item.product);
  const complete = items.length && items.every(item => item.product.verified && Number.isFinite(item.product.price) && item.product.stock >= item.quantity);
  const subtotal = complete ? items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) : null;
  return <div className="page-shell"><div className="page-heading"><span className="eyebrow">YOUR BAG</span><h1>Review your <em>selection.</em></h1><p>Your bag is preserved during normal browsing. Full pricing and availability must be verified before checkout.</p></div>{items.length ? <><div className="cart-list">{items.map(item => <article key={item.id}><Link to={`/product/${item.id}`}>{item.product.name}</Link><span>{item.product.size || 'Size pending'} · {formatPrice(item.product.price)}</span><label>Quantity<input type="number" min="1" max={Math.max(1, item.product.stock)} value={item.quantity} onChange={e => setQuantity(item.id, Number(e.target.value))}/></label><button type="button" onClick={() => remove(item.id)}>Remove</button></article>)}</div><div className="cart-summary"><span>Subtotal</span><strong>{subtotal === null ? 'Pending verified prices' : formatPrice(subtotal)}</strong>{complete ? <Link to="/checkout" className="solid-button">Continue to checkout →</Link> : <p>Checkout remains closed until product prices, sizes and stock are verified.</p>}</div></> : <div className="empty-results"><h2>Your bag is empty.</h2><Link to="/collections" className="text-link">Explore the collection ↗</Link></div>}</div>;
}

function Checkout({ products, cart, config }) {
  const items = cart.map(item => ({ ...item, product: products.find(product => product.id === item.id) })).filter(item => item.product);
  const ready = config.checkoutEnabled && items.length && items.every(item => item.product.verified && Number.isFinite(item.product.price) && item.product.stock >= item.quantity);
  return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">CHECKOUT</span><h1>Confirm every <em>detail.</em></h1><p>The full order summary, delivery fee and estimate must be shown before payment.</p></div><section className="checkout-gate"><h2>{ready ? 'Checkout ready' : 'Live payment is not available yet.'}</h2><p>The guide's launch gate requires a legally supported payment provider, verified product data, delivery fees, notifications and refund workflow to pass end-to-end testing. These business settings are not configured, so no payment or order is accepted.</p><dl><div><dt>Products</dt><dd>{items.length ? items.map(item => `${item.quantity} × ${item.product.name}`).join(', ') : 'No items'}</dd></div><div><dt>Delivery</dt><dd>{config.deliverySummary || 'Delivery zones, fees and estimates pending confirmation'}</dd></div><div><dt>Payment</dt><dd>Payment provider pending business approval</dd></div><div><dt>Returns</dt><dd>{config.returnsSummary || 'Returns process pending legal and operational confirmation'}</dd></div></dl><Link to="/contact" className="outline-button">Ask for ordering help <span>↗</span></Link></section></div>;
}

const guideSections = [
  ['Fragrance families', 'Fresh fragrances feel bright and airy; floral compositions centre flowers; woody fragrances feel dry or creamy; amber styles are warm and enveloping. Families are a starting point, not a rule.'],
  ['Opening, heart and base', 'The opening is what you notice first. The heart becomes clearer after a few minutes. Base notes are the slower, lasting foundation.'],
  ['Bottle size', 'Choose a size based on how often you expect to wear the fragrance. Confirm the listed volume before ordering.'],
  ['Testing a scent', 'Try on clean skin when possible and allow time for the fragrance to settle. Performance varies by skin, environment and use.'],
  ['Choosing for an occasion', 'Fresh or quiet styles often suit daytime and work; richer woods and amber styles are commonly chosen for evenings. Your preference matters most.']
];

function FragranceGuide() {
  return <div className="page-shell"><div className="page-heading"><span className="eyebrow">THE ART OF FRAGRANCE</span><h1>Choose with <em>confidence.</em></h1><p>A practical introduction to families, notes, bottle sizes and testing.</p></div><div className="information-grid">{guideSections.map(([title, body]) => <article key={title}><h2>{title}</h2><p>{body}</p></article>)}</div></div>;
}

const faqItems = [
  ['Are the products authentic?', 'We publish sourcing and authenticity information only when it is supported by supplier documentation. Product-specific evidence and the store sourcing approach will be added before sales open.'],
  ['Where do you deliver?', 'Delivery areas, fees and estimates are awaiting confirmation and will be shown before an order can be placed.'],
  ['How can I pay?', 'No live payment is accepted until a legally supported provider is configured and tested end to end.'],
  ['Can I return an opened fragrance?', 'Eligibility depends on the final returns policy and applicable law. The confirmed conditions will be published before sales open.'],
  ['How do I choose a fragrance?', 'Use Help Me Choose or contact the house with the scent family, occasion and budget you prefer.'],
  ['How do I track an order?', 'Use the order code and phone number supplied when the house confirms your order.']
];

function FAQ() {
  return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span><h1>Clear answers, <em>without guesswork.</em></h1></div><div className="faq-list">{faqItems.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div>;
}

function PolicyPage({ type, config }) {
  const pages = {
    trust: ['Sourcing & trust', config.businessIdentity ? `The seller is ${config.businessIdentity}.` : 'The final legal business identity is awaiting confirmation.', 'Supplier invoices, authorization or traceability evidence will be used where available. We do not claim official brand authorization, origin, ingredients, performance or authenticity without supporting documentation.'],
    delivery: ['Delivery information', config.deliverySummary || 'Delivery locations, fees, dispatch timing, tracking and realistic estimates are awaiting operational confirmation.', 'The full delivery charge and estimate will be shown before an order can be confirmed. Delayed or damaged parcels will follow the final documented support process.'],
    returns: ['Returns & refunds', config.returnsSummary || 'Eligible conditions, time limits, refund method and restrictions for opened fragrances are awaiting legal and operational confirmation.', 'No sale will open until the returns process is published and tested.'],
    privacy: ['Privacy policy', 'We collect only the information needed to answer messages, manage orders, publish consented stories and maintain newsletter preferences.', 'Order and support data is stored in restricted business systems. We do not sell personal information. Retention periods, processors and the official privacy contact will be finalized with the business identity before sales open.'],
    terms: ['Terms & conditions', 'Live orders and payments are currently disabled.', 'Order acceptance, payment, pricing errors, availability, delivery, liability and disputes must be reviewed for Nepalese law and the final operating business before sales open.']
  };
  const [title, lead, body] = pages[type];
  return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">CUSTOMER PROTECTION</span><h1>{title}</h1><p>{lead}</p></div><section className="policy-copy"><h2>Current position</h2><p>{body}</p><p className="policy-status">Pre-launch notice: this page does not replace the final business-approved policy.</p><Link to="/contact" className="text-link">Ask a question ↗</Link></section></div>;
}

function Unsubscribe() {
  const token = new URLSearchParams(useLocation().search).get('token') || '';
  const [message, setMessage] = useState('');
  async function unsubscribe() { try { setMessage((await api('/api/newsletter/unsubscribe', { method: 'POST', body: JSON.stringify({ token }) })).message); } catch (e) { setMessage(e.message); } }
  return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">EMAIL PREFERENCES</span><h1>Unsubscribe.</h1><p>Stop future newsletter messages from Golden Perfume House.</p></div><button className="solid-button" type="button" disabled={!token} onClick={unsubscribe}>Confirm unsubscribe</button>{message && <p role="status">{message}</p>}</div>;
}

function Review({ products }) {
  const [form, setForm] = useState({ code: '', phone: '', productId: '', rating: '5', name: '', quote: '', permission: false });
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function submit(event) { event.preventDefault(); setMessage(''); setError(''); try { const result = await api('/api/reviews', { method: 'POST', body: JSON.stringify({ ...form, productId: Number(form.productId), rating: Number(form.rating) }) }); setMessage(result.message); } catch (e) { setError(e.message); } }
  return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">VERIFIED BUYER REVIEW</span><h1>Share your <em>experience.</em></h1><p>A matching delivered order is required. Reviews are moderated for abuse and spam, never for a negative opinion.</p></div><form className="guided-form" onSubmit={submit}><label>Order code<input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="SL-XXXXXXXX"/></label><label>Phone number<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required/></label><label>Fragrance<select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required><option value="">Choose a fragrance</option>{products.map(product => <option value={product.id} key={product.id}>{product.name}</option>)}</select></label><label>Rating<select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>{[5,4,3,2,1].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label><label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label><label>Review<textarea value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} required maxLength="1000"/></label><label className="consent-check"><input type="checkbox" checked={form.permission} onChange={e => setForm({ ...form, permission: e.target.checked })} required/> I give permission to publish this review after moderation.</label><button className="solid-button">Submit review →</button>{message && <p className="form-success" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}</form></div>;
}

function Testimonials() {
  const [items, setItems] = useState([]);
  const [story, setStory] = useState({ name: '', quote: '', permission: false });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { api('/api/testimonials').then(setItems).catch(console.error); }, []);
  const types = ['text', 'audio', 'video'];
  async function submit(event) { event.preventDefault(); setError(''); setNotice(''); try { const result = await api('/api/testimonials', { method: 'POST', body: JSON.stringify(story) }); setNotice(result.message); setStory({ name: '', quote: '', permission: false }); } catch (e) { setError(e.message); } }
  return <div className="page-shell"><div className="page-heading"><span className="eyebrow">CLIENT STORIES</span><h1>In their <em>own words.</em></h1><p>Every fragrance becomes part of someone's story. Only stories approved for publication appear here.</p></div><div className="testimonial-grid">{types.map(type => { const matches = items.filter(item => item.type === type); return <section className="testimonial-column" key={type}><span className="eyebrow">{type.toUpperCase()} STORIES</span>{matches.length ? matches.map((item, i) => <article className="testimonial-card" key={i}><h2>{item.title || 'A GOLDEN PERFUME HOUSE story'}</h2>{type === 'text' ? <blockquote>“{item.quote}”</blockquote> : type === 'audio' ? <audio controls src={item.src}>Your browser does not support audio.</audio> : <video controls preload="metadata" src={item.src}>Your browser does not support video.</video>}<span>{item.name || 'GOLDEN PERFUME HOUSE client'}{item.verifiedBuyer ? ' · Verified buyer' : ''}</span></article>) : <div className="story-placeholder"><span>{type === 'text' ? '“' : type === 'audio' ? '♫' : '▷'}</span><h2>{type === 'text' ? 'Words to come.' : type === 'audio' ? 'Voices to come.' : 'Moments to come.'}</h2><p>Approved client {type} stories will appear here.</p></div>}</section>; })}</div><form className="story-submit guided-form" onSubmit={submit}><span className="eyebrow">A FRAGRANCE, A MEMORY, A STORY</span><h2>Share a memory.</h2><p>Does a particular scent remind you of a person, place or special moment? Submitted stories remain private until reviewed.</p><label>Your name<input value={story.name} onChange={e => setStory({ ...story, name: e.target.value })} required/></label><label>Your story<textarea value={story.quote} onChange={e => setStory({ ...story, quote: e.target.value })} required maxLength="1000"/></label><label className="consent-check"><input type="checkbox" checked={story.permission} onChange={e => setStory({ ...story, permission: e.target.checked })} required/> I give permission for the house to review this story for possible publication.</label><button className="solid-button">Submit story →</button>{notice && <p role="status">{notice}</p>}{error && <p className="form-error" role="alert">{error}</p>}</form></div>;
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

function Contact({ whatsapp, supportEmail }) {
  const [form, setForm] = useState({ name: '', contact: '', topic: 'Choosing a fragrance', message: '' });
  const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  async function submit(event) { event.preventDefault(); setError(''); setNotice(''); try { const result = await api('/api/contact', { method: 'POST', body: JSON.stringify(form) }); setNotice(result.message); setForm({ name: '', contact: '', topic: 'Choosing a fragrance', message: '' }); } catch (e) { setError(e.message); } }
  return <div className="page-shell narrow"><div className="page-heading"><span className="eyebrow">GET IN TOUCH</span><h1>Let's <em>talk fragrance.</em></h1><p>Whether you're choosing a signature scent or asking about an order, we'd love to hear from you.</p></div><div className="contact-panel"><span className="eyebrow">PERSONAL ASSISTANCE</span><h2>A conversation begins here.</h2><p>Need help before ordering? Talk to us. We are happy to help you choose.</p><WhatsAppButton whatsapp={whatsapp}/>{supportEmail && <a href={`mailto:${supportEmail}`}>{supportEmail}</a>}</div><form className="guided-form contact-form" onSubmit={submit}><h2>Send a message</h2><p>We ask only for the details needed to reply. Expect a response within two business days.</p><label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required/></label><label>Email or phone<input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} required/></label><label>Topic<select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}><option>Choosing a fragrance</option><option>Product availability</option><option>Order support</option><option>Delivery or returns</option><option>Privacy question</option><option>Other</option></select></label><label>Message<textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required maxLength="1200"/></label><button className="solid-button">Send message →</button>{notice && <p className="form-success" role="status">{notice}</p>}{error && <p className="form-error" role="alert">{error}</p>}</form></div>;
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

function AdminOperations() {
  const key = sessionStorage.getItem('silence-admin-key') || '';
  const [products, setProducts] = useState([]); const [messages, setMessages] = useState([]); const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  const adminApi = (url, options = {}) => api(url, { ...options, headers: { Authorization: `Bearer ${key}`, ...options.headers } });
  async function load() { try { const [catalogue, queries] = await Promise.all([api('/api/products'), adminApi('/api/admin/messages')]); setProducts(catalogue); setMessages(queries); setError(''); } catch (e) { setError(e.message); } }
  useEffect(() => { if (key) load(); }, [key]);
  async function saveProduct(product) { try { const saved = await adminApi(`/api/admin/products/${product.id}`, { method: 'PATCH', body: JSON.stringify(product) }); setProducts(items => items.map(item => item.id === saved.id ? saved : item)); setNotice(`${saved.name} updated.`); } catch (e) { setError(e.message); } }
  async function updateMessage(id, status) { try { await adminApi(`/api/admin/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); } catch (e) { setError(e.message); } }
  if (!key) return <div className="page-shell narrow empty-results"><h1>Admin sign-in required.</h1><Link to="/admin" className="text-link">Sign in to house management ↗</Link></div>;
  return <div className="page-shell admin-page"><div className="page-heading"><span className="eyebrow">HOUSE OPERATIONS</span><h1>Catalogue & <em>queries.</em></h1><p>Publish product data only after checking the supplier list and evidence.</p></div><div className="admin-toolbar"><Link to="/admin">Orders and stories</Link><button onClick={load}>Refresh data</button></div>{notice && <p className="form-success" role="status">{notice}</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="admin-products">{products.map(product => <form key={product.id} className="admin-create" onSubmit={event => { event.preventDefault(); saveProduct(product); }}><h2>{product.name}</h2><div className="admin-fields"><label>Bottle size<input value={product.size || ''} onChange={e => setProducts(items => items.map(item => item.id === product.id ? { ...item, size: e.target.value } : item))} required/></label><label>Price (NPR)<input type="number" min="0" value={product.price ?? ''} onChange={e => setProducts(items => items.map(item => item.id === product.id ? { ...item, price: Number(e.target.value) } : item))} required/></label><label>Stock<input type="number" min="0" step="1" value={product.stock} onChange={e => setProducts(items => items.map(item => item.id === product.id ? { ...item, stock: Number(e.target.value) } : item))} required/></label><label className="approve-checkbox"><input type="checkbox" checked={product.verified} onChange={e => setProducts(items => items.map(item => item.id === product.id ? { ...item, verified: e.target.checked } : item))}/> Supplier data verified</label></div><button className="solid-button">Save product →</button></form>)}</div><div className="admin-orders"><h2>Customer queries</h2>{messages.length ? messages.map(item => <article className="admin-order" key={item.id}><div><strong>{item.topic}</strong><span>{item.name} · {item.contact}</span><span>{item.message}</span></div><label>Status<select value={item.status} onChange={e => updateMessage(item.id, e.target.value)}><option>New</option><option>In progress</option><option>Resolved</option></select></label></article>) : <p>No customer queries yet.</p>}</div></div>;
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
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState({ whatsapp: '', supportEmail: '', businessIdentity: '', deliverySummary: '', returnsSummary: '', checkoutEnabled: false, newsletterEnabled: false });
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('golden-perfume-cart')) || []; } catch { return []; } });
  const [dataReady, setDataReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(() => window.location.pathname !== '/');
  useEffect(() => {
    let active = true;
    Promise.allSettled([api('/api/products'), api('/api/config'), document.fonts?.ready || Promise.resolve()]).then(([productResult, configResult]) => {
      if (!active) return;
      if (productResult.status === 'fulfilled') setProducts(productResult.value); else console.error(productResult.reason);
      if (configResult.status === 'fulfilled') setConfig(configResult.value); else console.error(configResult.reason);
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
  useEffect(() => { localStorage.setItem('golden-perfume-cart', JSON.stringify(cart)); }, [cart]);
  const addToCart = id => setCart(items => { const item = items.find(entry => entry.id === id); return item ? items.map(entry => entry.id === id ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...items, { id, quantity: 1 }]; });
  const setQuantity = (id, quantity) => setCart(items => items.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity || 1) } : item));
  const removeFromCart = id => setCart(items => items.filter(item => item.id !== id));
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <BrowserRouter><ScrollToTop/><SiteBotanicals/><Header cartCount={cartCount}/><main><Routes><Route path="/" element={<Home products={products} onSceneReady={() => setSceneReady(true)} onAdd={addToCart}/>}/><Route path="/collections" element={<Collections products={products} onAdd={addToCart}/>}/><Route path="/product/:id" element={<ProductDetail products={products} whatsapp={config.whatsapp} onAdd={addToCart}/>}/><Route path="/scent-finder" element={<ScentFinder products={products}/>}/><Route path="/guide" element={<FragranceGuide/>}/><Route path="/faq" element={<FAQ/>}/><Route path="/cart" element={<Cart products={products} cart={cart} setQuantity={setQuantity} remove={removeFromCart}/>}/><Route path="/checkout" element={<Checkout products={products} cart={cart} config={config}/>}/><Route path="/about" element={<About/>}/><Route path="/testimonials" element={<Testimonials/>}/><Route path="/review" element={<Review products={products}/>}/><Route path="/track" element={<TrackOrder/>}/><Route path="/contact" element={<Contact whatsapp={config.whatsapp} supportEmail={config.supportEmail}/>}/><Route path="/trust" element={<PolicyPage type="trust" config={config}/>}/><Route path="/delivery" element={<PolicyPage type="delivery" config={config}/>}/><Route path="/returns" element={<PolicyPage type="returns" config={config}/>}/><Route path="/privacy" element={<PolicyPage type="privacy" config={config}/>}/><Route path="/terms" element={<PolicyPage type="terms" config={config}/>}/><Route path="/unsubscribe" element={<Unsubscribe/>}/><Route path="/admin" element={<Admin products={products}/>}/><Route path="/admin/operations" element={<AdminOperations/>}/><Route path="*" element={<div className="page-shell empty-state"><h1>Page not found.</h1><Link to="/" className="text-link">Return home ↗</Link></div>}/></Routes></main><Footer config={config}/></BrowserRouter>;
}

export default App;
