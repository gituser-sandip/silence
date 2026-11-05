import React from 'react';

const clamp = value => Math.max(0, Math.min(1, value));
const ease = (start, end, value) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};
const interpolate = (from, to, amount) => from + (to - from) * amount;
const asset = '/assets/exploded';

function Ingredient({ src, alt, start, end, from, size, progress, rotate = 0 }) {
  const move = ease(start, end, progress);
  const fade = 1 - ease(end - 0.09, end + 0.04, progress);
  const appear = start === 0 ? 1 : ease(start - 0.04, start + 0.06, progress);
  const left = interpolate(from[0], 52, move);
  const top = interpolate(from[1], 51, move);
  return <img className="real-ingredient" src={src} alt={alt} style={{ left: `${left}%`, top: `${top}%`, width: size, opacity: Math.max(0, appear * fade), transform: `translate(-50%, -50%) rotate(${interpolate(rotate, 0, move)}deg) scale(${interpolate(1, .16, move)})` }} />;
}

export default function RealPerfumeScene({ progress = 0 }) {
  const bottleRotation = interpolate(-4, 7, progress);
  const finalNotes = ease(.58, .9, progress);
  return <div className="real-perfume-scene" role="img" aria-label="A photoreal GOLDEN PERFUME HOUSE perfume bottle as bergamot, rose, sandalwood and amber move into the fragrance">
    <div className="real-orbit" aria-hidden="true" />
    <Ingredient progress={progress} src={`${asset}/bergamot-real.png`} alt="Bergamot" start={0} end={.28} from={[28, 26]} size="min(31vw, 390px)" rotate={-12} />
    <Ingredient progress={progress} src={`${asset}/rose-real.png`} alt="Blush rose" start={.2} end={.5} from={[76, 27]} size="min(32vw, 430px)" rotate={8} />
    <Ingredient progress={progress} src={`${asset}/wood-amber-real.png`} alt="Sandalwood and amber" start={.42} end={.74} from={[27, 69]} size="min(34vw, 440px)" rotate={-8} />
    <img className="real-notes" src={`${asset}/notes.png`} alt="" aria-hidden="true" style={{ opacity: finalNotes, transform: `translate(-50%, -50%) scale(${.72 + finalNotes * .28}) rotate(${progress * -4}deg)` }} />
    <div className="real-bottle-wrap" style={{ transform: `translate(-50%, -50%) rotate(${bottleRotation}deg) translateY(${Math.sin(progress * Math.PI) * -10}px)` }}>
      <img src={`${asset}/bottle-golden.webp`} alt="GOLDEN PERFUME HOUSE Parfum bottle" />
    </div>
    <div className="real-particles" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ '--angle': `${index * 31}deg`, '--distance': `${28 + (index % 6) * 13}px`, '--delay': `${(index % 8) * .08}s` }} />)}</div>
  </div>;
}
