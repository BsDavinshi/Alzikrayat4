import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import {
  FILTER_NAMES,
  renderFilteredCanvas,
  renderFilterThumbnail
} from '../utils/filters';
import { avatarColor, filterLabel, initials } from '../utils/helpers';

const MAX_BYTES = 5 * 1024 * 1024;

function UploadPhoto({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAlbumId = searchParams.get('album') || '';

  const [sourceImage, setSourceImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [filterName, setFilterName] = useState('none');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [albumId, setAlbumId] = useState(initialAlbumId);
  const [albums, setAlbums] = useState([]);

  const [tagQuery, setTagQuery] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const previewCanvasRef = useRef(null);
  const thumbRefs = useRef({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    apiRequest(`/albums?userId=${user._id}`)
      .then((list) => setAlbums(list))
      .catch(() => {});
  }, [user, navigate]);

  // Render preview canvas whenever sourceImage, filter, brightness, or contrast changes
  useEffect(() => {
    if (!sourceImage || !previewCanvasRef.current) return;
    renderFilteredCanvas(
      sourceImage,
      previewCanvasRef.current,
      filterName,
      { brightness, contrast },
      900
    );
  }, [sourceImage, filterName, brightness, contrast]);

  // Render filter thumbnails when a new image is loaded
  useEffect(() => {
    if (!sourceImage) return;
    FILTER_NAMES.forEach((name) => {
      const thumbCanvas = thumbRefs.current[name];
      if (thumbCanvas) {
        renderFilterThumbnail(sourceImage, thumbCanvas, name);
      }
    });
  }, [sourceImage]);

  // Autocomplete search for tagging registered members
  useEffect(() => {
    const q = tagQuery.trim();
    if (!q) {
      setTagSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      apiRequest(`/users/search?q=${encodeURIComponent(q)}`)
        .then((users) => {
          const selectedIds = new Set(taggedUsers.map((u) => u._id));
          setTagSuggestions(users.filter((u) => !selectedIds.has(u._id)));
        })
        .catch(() => setTagSuggestions([]));
    }, 200);
    return () => clearTimeout(timer);
  }, [tagQuery, taggedUsers]);

  const loadFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Please choose a JPG, PNG, GIF or WEBP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be under 5 MB.');
      return;
    }

    setError('');
    setOriginalFile(file);
    setFilterName('none');
    setBrightness(0);
    setContrast(0);

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSourceImage(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const handleResetFilters = () => {
    setFilterName('none');
    setBrightness(0);
    setContrast(0);
  };

  const addTag = (member) => {
    setTaggedUsers((prev) => [...prev, member]);
    setTagQuery('');
    setTagSuggestions([]);
  };

  const removeTag = (memberId) => {
    setTaggedUsers((prev) => prev.filter((u) => u._id !== memberId));
  };

  const buildUploadBlob = () => {
    return new Promise((resolve) => {
      const hasEdits = filterName !== 'none' || brightness !== 0 || contrast !== 0;
      if (!hasEdits || !sourceImage) {
        resolve(originalFile);
        return;
      }
      const exportCanvas = document.createElement('canvas');
      renderFilteredCanvas(
        sourceImage,
        exportCanvas,
        filterName,
        { brightness, contrast },
        1600
      );
      exportCanvas.toBlob(
        (blob) => {
          resolve(blob || originalFile);
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!originalFile) {
      setError('Please choose an image to upload.');
      return;
    }
    if (!title.trim()) {
      setError('A title is required.');
      return;
    }

    try {
      setSubmitting(true);
      const blob = await buildUploadBlob();
      const formData = new FormData();
      const uploadName =
        blob === originalFile ? originalFile.name : `filtered_${Date.now()}.jpg`;

      formData.append('image', blob, uploadName);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('filterName', filterName);
      if (albumId) formData.append('albumId', albumId);
      if (taggedUsers.length > 0) {
        formData.append(
          'taggedUsers',
          JSON.stringify(taggedUsers.map((u) => u._id))
        );
      }

      const created = await apiRequest('/photos', {
        method: 'POST',
        body: formData
      });
      navigate(`/photos/${created._id}`);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <section className="container py-4 py-md-5">
      <div className="mb-4">
        <span className="eyebrow">New memory</span>
        <h1 className="display-font h1 mt-1 mb-1">Upload a photo</h1>
        <p className="text-body-secondary mb-0">
          Pick an image, style it with a filter, tell its story and tag the people in it.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card upload-card h-100">
              <div className="card-body p-3 p-md-4">
                <label
                  htmlFor="photoInput"
                  className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    className="visually-hidden"
                    id="photoInput"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => loadFile(e.target.files?.[0])}
                  />
                  {!sourceImage ? (
                    <span className="dropzone-empty">
                      <i className="bi bi-cloud-arrow-up" />
                      <strong>Drop an image here or click to browse</strong>
                      <small className="text-body-secondary">
                        JPG, PNG, GIF or WEBP · up to 5 MB
                      </small>
                    </span>
                  ) : (
                    <canvas
                      ref={previewCanvasRef}
                      className="preview-canvas"
                      aria-label="Filtered preview"
                    />
                  )}
                </label>

                {sourceImage && (
                  <div className="filter-studio mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-semibold">
                        <i className="bi bi-magic" /> Filter studio
                      </span>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        onClick={handleResetFilters}
                      >
                        Reset
                      </button>
                    </div>

                    <div className="filter-strip" role="radiogroup" aria-label="Filters">
                      {FILTER_NAMES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          className={`filter-chip ${filterName === name ? 'active' : ''}`}
                          role="radio"
                          aria-checked={filterName === name}
                          onClick={() => setFilterName(name)}
                        >
                          <canvas
                            width="72"
                            height="72"
                            className="filter-thumb"
                            ref={(el) => {
                              thumbRefs.current[name] = el;
                            }}
                            aria-hidden="true"
                          />
                          <span>{filterLabel(name)}</span>
                        </button>
                      ))}
                    </div>

                    <div className="row g-3 mt-1">
                      <div className="col-sm-6">
                        <label htmlFor="brightnessRange" className="form-label small mb-0">
                          Brightness <span>{brightness}</span>
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          id="brightnessRange"
                          min="-100"
                          max="100"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="contrastRange" className="form-label small mb-0">
                          Contrast <span>{contrast}</span>
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          id="contrastRange"
                          min="-100"
                          max="100"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card upload-card">
              <div className="card-body p-3 p-md-4">
                <div className="mb-3">
                  <label htmlFor="titleInput" className="form-label">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="titleInput"
                    required
                    maxLength={200}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sunset over the Nile"
                  />
                  <small className="text-body-secondary d-block text-end">
                    {title.length}/200
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="descriptionInput" className="form-label">
                    Story <small className="text-body-secondary">(optional)</small>
                  </label>
                  <textarea
                    className="form-control"
                    id="descriptionInput"
                    rows="4"
                    maxLength={2000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What happened in this moment?"
                  />
                  <small className="text-body-secondary d-block text-end">
                    {description.length}/2000
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="albumSelect" className="form-label">
                    Album
                  </label>
                  <div className="input-group">
                    <select
                      className="form-select"
                      id="albumSelect"
                      value={albumId}
                      onChange={(e) => setAlbumId(e.target.value)}
                    >
                      <option value="">No album</option>
                      {albums.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.title}
                        </option>
                      ))}
                    </select>
                    <Link
                      className="btn btn-outline-secondary"
                      to="/albums/create"
                      title="Create album"
                    >
                      <i className="bi bi-plus-lg" />
                    </Link>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="tagSearch" className="form-label">
                    Tag people{' '}
                    <small className="text-body-secondary">(registered members)</small>
                  </label>
                  <div className="tag-picker">
                    <div className="tag-picker-chips">
                      {taggedUsers.map((member) => (
                        <span className="tag-chip" key={member._id}>
                          {member.firstName} {member.lastName}
                          <button
                            type="button"
                            className="tag-chip-remove"
                            onClick={() => removeTag(member._id)}
                            aria-label="Remove tag"
                          >
                            <i className="bi bi-x" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      id="tagSearch"
                      placeholder="Type a name…"
                      autoComplete="off"
                      value={tagQuery}
                      onChange={(e) => setTagQuery(e.target.value)}
                    />
                    {tagSuggestions.length > 0 && (
                      <ul className="list-group tag-suggestions" role="listbox">
                        {tagSuggestions.map((member) => (
                          <li
                            key={member._id}
                            className="list-group-item list-group-item-action"
                            role="option"
                            onClick={() => addTag(member)}
                          >
                            <span
                              className="avatar avatar-xs"
                              style={{ background: avatarColor(member._id) }}
                            >
                              {initials(member.firstName, member.lastName)}
                            </span>
                            <span>
                              {member.firstName} {member.lastName}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-accent w-100 py-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-arrow-up" /> Upload memory
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

export default UploadPhoto;
