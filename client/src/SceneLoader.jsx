export default function SceneLoader({ progress, failed = false }) {
  const hasProgress = Number.isFinite(progress);
  return <div className={`scene-loading ${failed ? 'is-error' : ''}`} role="status" aria-live="polite">
    <span className="scene-loading-mark" aria-hidden="true">GOLDEN<small>PERFUME HOUSE</small></span>
    <span className="scene-loading-title">{failed ? 'The 3D preview could not load.' : 'Preparing your fragrance'}</span>
    {!failed && <div className={`scene-loading-track ${hasProgress ? '' : 'is-indeterminate'}`} aria-hidden="true"><span style={hasProgress ? { width: `${Math.max(5, progress)}%` } : undefined}/></div>}
    <span className="scene-loading-detail">{failed ? 'You can still explore the collection below.' : hasProgress ? `${progress}% loaded` : 'Loading the 3D experience'}</span>
  </div>;
}
