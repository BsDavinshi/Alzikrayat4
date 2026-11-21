import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';

function CreateAlbum({ user }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      const created = await apiRequest('/albums', {
        method: 'POST',
        body: { title: title.trim(), description: description.trim() }
      });
      navigate(`/albums/${created._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create album');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card auth-card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h1 className="display-font h3 mb-1">New album</h1>
              <p className="text-body-secondary small mb-4">
                Group related memories together.
              </p>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="albumTitle" className="form-label">
                    Album title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="albumTitle"
                    required
                    maxLength={150}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Graduation 2026"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="albumDescription" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="albumDescription"
                    rows="3"
                    maxLength={1000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <small className="text-body-secondary d-block text-end">
                    {description.length}/1000
                  </small>
                </div>
                <button
                  type="submit"
                  className="btn btn-accent w-100"
                  disabled={submitting}
                >
                  <i className="bi bi-folder-plus" />{' '}
                  {submitting ? 'Creating...' : 'Create album'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CreateAlbum;
