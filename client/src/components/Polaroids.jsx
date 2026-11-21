import { Link } from 'react-router-dom';
import { uploadUrl } from '../utils/helpers';

function Polaroids({ heroPhotos = [], isStrip = false }) {
  if (heroPhotos.length === 0) {
    const placeholders = ['bi-sunrise', 'bi-camera2', 'bi-heart'];
    return (
      <div className="polaroid-stack">
        {placeholders.map((icon, idx) => (
          <div
            key={icon}
            className={`polaroid polaroid-${idx + 1} polaroid-placeholder`}
          >
            <div className="polaroid-image d-flex align-items-center justify-content-center">
              <i className={`bi ${icon}`} />
            </div>
            <div className="polaroid-caption">Your memory here</div>
          </div>
        ))}
      </div>
    );
  }

  const list = heroPhotos.slice(0, isStrip ? 5 : 3);
  return (
    <div className={isStrip ? 'polaroid-strip' : 'polaroid-stack'}>
      {list.map((photo, idx) => (
        <Link
          key={photo._id}
          className={`polaroid polaroid-${idx + 1}`}
          to={`/photos/${photo._id}`}
        >
          <img
            className="polaroid-image"
            src={uploadUrl(photo.fileName)}
            alt={photo.title}
            loading="lazy"
          />
          <span className="polaroid-caption">{photo.title}</span>
        </Link>
      ))}
    </div>
  );
}

export default Polaroids;
