import './Loader.css';

function Loader({ size = 'md', label = '', fullScreen = false }) {
  const spinner = (
    <span className={`loader loader--${size}`} role="status" aria-live="polite">
      <span className="loader__spinner" />
      {label ? (
        <span className="loader__label">{label}</span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </span>
  );

  if (fullScreen) {
    return <div className="loader-overlay">{spinner}</div>;
  }

  return spinner;
}

export default Loader;