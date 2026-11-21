import { useState } from 'react';
import { apiRequest } from '../utils/api';
import { passwordStrength } from '../utils/helpers';

function RegisterForm({ onAuthSuccess, idPrefix = 'register' }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const strength = passwordStrength(form.password);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.passwordConfirm) {
      setError('Passwords must match');
      return;
    }

    try {
      setSubmitting(true);
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password
        }
      });
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-sm-6">
            <label htmlFor={`${idPrefix}-first-name`} className="form-label">
              First name
            </label>
            <input
              type="text"
              className="form-control"
              id={`${idPrefix}-first-name`}
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              maxLength={50}
              autoComplete="given-name"
            />
          </div>
          <div className="col-sm-6">
            <label htmlFor={`${idPrefix}-last-name`} className="form-label">
              Last name
            </label>
            <input
              type="text"
              className="form-control"
              id={`${idPrefix}-last-name`}
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              maxLength={50}
              autoComplete="family-name"
            />
          </div>

          <div className="col-12">
            <label htmlFor={`${idPrefix}-email`} className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id={`${idPrefix}-email`}
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              maxLength={100}
              autoComplete="email"
            />
          </div>

          <div className="col-sm-6">
            <label htmlFor={`${idPrefix}-password`} className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id={`${idPrefix}-password`}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
            />
            <div
              className="progress password-strength mt-2"
              role="progressbar"
              aria-label="Password strength"
            >
              <div
                className={`progress-bar ${strength.color}`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
            <div className="form-text">8+ characters with letters and numbers.</div>
          </div>

          <div className="col-sm-6">
            <label htmlFor={`${idPrefix}-password-confirm`} className="form-label">
              Confirm password
            </label>
            <input
              type="password"
              className="form-control"
              id={`${idPrefix}-password-confirm`}
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
              maxLength={72}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-accent w-100 py-2 mt-4"
          disabled={submitting}
        >
          <i className="bi bi-person-plus" />{' '}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </>
  );
}

export default RegisterForm;
