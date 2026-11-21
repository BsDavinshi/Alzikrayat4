import { useState } from 'react';
import { Link } from 'react-router-dom';
import PhotoCard from './PhotoCard';
import { timeAgo, uploadUrl } from '../utils/helpers';

function GalleryView({ photos, galleryStyle = 'grid3' }) {
  const [activeSlide, setActiveSlide] = useState(0);

  if (galleryStyle === 'grid3' || galleryStyle === 'grid4') {
    const colClass =
      galleryStyle === 'grid3'
        ? 'row-cols-1 row-cols-sm-2 row-cols-lg-3'
        : 'row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4';

    return (
      <div className={`row ${colClass} g-4 gallery gallery-${galleryStyle}`}>
        {photos.map((photo) => (
          <div className="col" key={photo._id}>
            <PhotoCard photo={photo} cardStyle="grid" />
          </div>
        ))}
      </div>
    );
  }

  if (galleryStyle === 'list') {
    return (
      <div className="d-flex flex-column gap-3 gallery gallery-list">
        {photos.map((photo) => (
          <PhotoCard key={photo._id} photo={photo} cardStyle="list" />
        ))}
      </div>
    );
  }

  if (galleryStyle === 'masonry') {
    return (
      <div className="gallery gallery-masonry">
        {photos.map((photo) => (
          <div className="masonry-item" key={photo._id}>
            <PhotoCard photo={photo} cardStyle="natural" />
          </div>
        ))}
      </div>
    );
  }

  // Full-width slider style
  const safeIndex = Math.min(activeSlide, Math.max(0, photos.length - 1));
  const current = photos[safeIndex];
  const prevSlide = () =>
    setActiveSlide((i) => (i === 0 ? photos.length - 1 : i - 1));
  const nextSlide = () =>
    setActiveSlide((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <div>
      <div className="carousel slide gallery-slider">
        <div className="carousel-inner">
          {current && (
            <div className="carousel-item active">
              <Link to={`/photos/${current._id}`}>
                <img
                  src={uploadUrl(current.fileName)}
                  className="d-block w-100"
                  alt={current.title}
                />
              </Link>
              <div className="carousel-caption">
                <h3 className="display-font h4 mb-1">{current.title}</h3>
                <p className="small mb-0">
                  by{' '}
                  {current.userId
                    ? `${current.userId.firstName} ${current.userId.lastName}`
                    : 'Member'}{' '}
                  · {timeAgo(current.dateTime)}
                </p>
              </div>
            </div>
          )}
        </div>

        {photos.length > 1 && (
          <>
            <button
              className="carousel-control-prev"
              type="button"
              onClick={prevSlide}
              aria-label="Previous"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true" />
            </button>
            <button
              className="carousel-control-next"
              type="button"
              onClick={nextSlide}
              aria-label="Next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <div className="slider-thumbnails d-flex gap-2 mt-3 overflow-auto pb-2">
        {photos.map((photo, idx) => (
          <button
            key={photo._id}
            type="button"
            onClick={() => setActiveSlide(idx)}
            className={`slider-thumb ${idx === safeIndex ? 'active' : ''}`}
            aria-label={`Show ${photo.title}`}
          >
            <img src={uploadUrl(photo.fileName)} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default GalleryView;
