import { GALLERY_STYLES } from '../utils/helpers';

function StyleSwitcher({ galleryStyle, onChange }) {
  return (
    <div className="btn-group style-switcher" role="group" aria-label="Display style">
      {Object.entries(GALLERY_STYLES).map(([key, info]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`btn btn-sm ${
            galleryStyle === key ? 'btn-accent' : 'btn-outline-secondary'
          }`}
          title={info.label}
          aria-label={info.label}
          aria-current={galleryStyle === key ? 'true' : undefined}
        >
          <i className={`bi ${info.icon}`} />
          <span className="d-none d-xl-inline ms-1">{info.label}</span>
        </button>
      ))}
    </div>
  );
}

export default StyleSwitcher;
