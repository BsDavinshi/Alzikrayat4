import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';

function EditProfile({ user, onProfileUpdated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    occupation: user?.occupation || '',
    location: user?.location || '',
    description: user?.description || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      const data = await apiRequest('/users/me', {
        method: 'PUT',
        body: form
      });
      if (onProfileUpdated) onProfileUpdated(data.user);
      navigate(`/users/${data.user._id}`);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-7">
          <div className="card auth-card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h1 className="display-font h3 mb-4">Edit your profile</h1>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label htmlFor="editFirstName" className="form-label">
                      First name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editFirstName"
                      name="firstName"
                      required
                      maxLength={50}
                      value={form.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="editLastName" className="form-label">
                      Last name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editLastName"
                      name="lastName"
                      required
                      maxLength={50}
                      value={form.lastName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="editOccupation" className="form-label">
                      Occupation
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editOccupation"
                      name="occupation"
                      maxLength={100}
                      value={form.occupation}
                      onChange={handleChange}
                      placeholder="e.g. Photographer"
                    />
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="editLocation" className="form-label">
                      Location
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editLocation"
                      name="location"
                      maxLength={100}
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Khartoum"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="editDescription" className="form-label">
                      About you
                    </label>
                    <textarea
                      className="form-control"
                      id="editDescription"
                      name="description"
                      rows="4"
                      maxLength={1000}
                      value={form.description}
                      onChange={handleChange}
                    />
                    <small className="text-body-secondary d-block text-end">
                      {form.description.length}/1000
                    </small>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-accent"
                    disabled={submitting}
                  >
                    <i className="bi bi-check2" />{' '}
                    {submitting ? 'Saving...' : 'Save changes'}
                  </button>
                  <Link
                    to={`/users/${user._id}`}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditProfile;
