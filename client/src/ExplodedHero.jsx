import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const art = '/assets/exploded';
const clamp = value => Math.max(0, Math.min(1, value));
const ease = (start, end, value) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

export default function ExplodedHero() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const referenceRef = useRef(null);
  const bottleRef = useRef(null);
  const capRef = useRef(null);
  const collarRef = useRef(null);
  const pumpRef = useRef(null);
  const notesRef = useRef(null);
  const progressRef = useRef(null);
  const captionsRef = useRef([]);
  const labelsRef = useRef([]);
  const finalLinkRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let target = 0;
    let current = 0;
    let frame = 0;
    let active = false;

    function updateTarget() {
      if (!section || reducedMotion.matches) return;
      const rect = section.getBoundingClientRect();
      target = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
      if (!active) {
        active = true;
        frame = requestAnimationFrame(tick);
      }
    }

    function position(ref, start, end, t, startRotate = 0, endRotate = 0, startScale = 1, endScale = 1) {
      if (!ref.current) return;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const dx = (end[0] - start[0]) * width * t / 100;
      const dy = (end[1] - start[1]) * height * t / 100;
      const rotate = lerp(startRotate, endRotate, t);
      const scale = lerp(startScale, endScale, t);
      ref.current.style.transform = `translate(-50%, -50%) translate3d(${dx}px, ${dy}px, 0) rotate(${rotate}deg) scale(${scale})`;
    }

    function paint(p) {
      const transition = ease(0.05, 0.22, p);
      referenceRef.current.style.opacity = String(1 - transition);
      const layerOpacity = ease(0.07, 0.22, p);
      const parts = [bottleRef, capRef, collarRef, pumpRef, notesRef];
      parts.forEach(ref => { if (ref.current) ref.current.style.opacity = String(layerOpacity); });

      const mobile = stage.clientWidth <= 700;
      const bottleMove = ease(0.18, 0.85, p);
      position(bottleRef, mobile ? [57, 62] : [57, 55], mobile ? [52, 62] : [54, 55], bottleMove, -9, 0, 1, mobile ? 1 : 1.12);
      position(pumpRef, mobile ? [36, 66] : [49, 56], mobile ? [52, 40] : [54, 27], ease(0.31, 0.66, p), -13, 0, 1, 0.68);
      position(collarRef, mobile ? [28, 59] : [44, 50], mobile ? [52, 35] : [54, 22], ease(0.48, 0.78, p), -8, 0, 1, 0.66);
      position(capRef, mobile ? [18, 61] : [36, 49], mobile ? [52, 43] : [54, 26], ease(0.64, 0.92, p), -10, 0, 1, 0.62);
      const noteMove = ease(0.2, 0.78, p);
      position(notesRef, mobile ? [78, 58] : [74, 47], mobile ? [55, 61] : [58, 53], noteMove, 0, -13, 1, 0.34);
      notesRef.current.style.opacity = String(layerOpacity * (1 - ease(0.51, 0.88, p)));

      captionsRef.current.forEach((element, index) => {
        if (!element) return;
        const windows = [[0, 0.31], [0.22, 0.56], [0.48, 0.82], [0.73, 1.03]];
        const [start, end] = windows[index];
        const fadeIn = index === 0 ? 1 : ease(start, start + 0.09, p);
        const fadeOut = index === 3 ? 1 : 1 - ease(end - 0.09, end, p);
        const opacity = fadeIn * fadeOut;
        element.style.opacity = String(opacity);
        element.style.transform = `translate3d(0, ${(1 - opacity) * 18}px, 0)`;
      });
      labelsRef.current.forEach(element => { if (element) element.style.opacity = String((1 - ease(0.2, 0.42, p)) * (1 - transition)); });
      finalLinkRef.current.style.pointerEvents = p > 0.82 ? 'auto' : 'none';
      progressRef.current.style.transform = `scaleX(${p})`;
    }

    function tick() {
      const difference = target - current;
      current += difference * 0.15;
      if (Math.abs(difference) < 0.0005) current = target;
      paint(current);
      if (current !== target) frame = requestAnimationFrame(tick);
      else active = false;
    }

    function reducedChange() {
      if (reducedMotion.matches) {
        cancelAnimationFrame(frame);
        active = false;
        stage.classList.add('reduced');
      } else {
        stage.classList.remove('reduced');
        updateTarget();
      }
    }

    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget);
    reducedMotion.addEventListener('change', reducedChange);
    reducedChange();
    paint(0);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
      reducedMotion.removeEventListener('change', reducedChange);
    };
  }, []);

  return <section className="exploded-scroll" ref={sectionRef} aria-label="The composition of GOLDEN PERFUME HOUSE perfume assembles as you scroll">
    <div className="exploded-stage" ref={stageRef}>
      <div className="exploded-ambient" aria-hidden="true" />
      <img className="exploded-reference" ref={referenceRef} src={`${art}/hero-editorial.png`} alt="" />
      <div className="exploded-art" aria-hidden="true">
        <img className="exploded-layer exploded-bottle" ref={bottleRef} src={`${art}/bottle-golden.webp`} alt="" />
        <img className="exploded-layer exploded-notes" ref={notesRef} src={`${art}/notes.png`} alt="" />
        <img className="exploded-layer exploded-pump" ref={pumpRef} src={`${art}/pump.png`} alt="" />
        <img className="exploded-layer exploded-collar" ref={collarRef} src={`${art}/collar.png`} alt="" />
        <img className="exploded-layer exploded-cap" ref={capRef} src={`${art}/cap.png`} alt="" />
      </div>
      <div className="exploded-copy">
        <div className="exploded-caption" ref={element => captionsRef.current[0] = element}><span className="eyebrow">GOLDEN PERFUME HOUSE · 01</span><h1>Crafted to<br/><em>inspire.</em></h1><p>A harmony of considered ingredients and quiet craftsmanship.</p></div>
        <div className="exploded-caption" ref={element => captionsRef.current[1] = element}><span className="eyebrow">THE FIRST IMPRESSION · 02</span><h2>Nature, in<br/><em>motion.</em></h2><p>Bright citrus and petals meet precious woods in a fleeting moment.</p></div>
        <div className="exploded-caption" ref={element => captionsRef.current[2] = element}><span className="eyebrow">THE CRAFT · 03</span><h2>Every detail<br/><em>belongs.</em></h2><p>Glass, gold and fragrance come together, one deliberate movement at a time.</p></div>
        <div className="exploded-caption exploded-finale" ref={element => captionsRef.current[3] = element}><span className="eyebrow">THE REVEAL · 04</span><h2>Meet<br/><em>Golden.</em></h2><p>A presence that stays with you long after the moment has passed.</p><Link to="/collections" ref={finalLinkRef} className="solid-button">Explore the collection <span>↗</span></Link></div>
      </div>
      <div className="exploded-labels" aria-hidden="true">
        <span className="label-cap" ref={element => labelsRef.current[0] = element}>SIGNATURE CAP<i/></span>
        <span className="label-collar" ref={element => labelsRef.current[1] = element}>PRECISION COLLAR<i/></span>
        <span className="label-spray" ref={element => labelsRef.current[2] = element}>THE ATOMIZER<i/></span>
        <span className="label-notes" ref={element => labelsRef.current[3] = element}>ROSE · BERGAMOT · SANDALWOOD<i/></span>
      </div>
      <div className="exploded-bottom"><span>SCROLL TO COMPOSE</span><div className="exploded-progress"><span ref={progressRef}/></div><span>01 / 04</span></div>
    </div>
  </section>;
}
