import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import GalleryView from '../components/GalleryView';
import StyleSwitcher from '../components/StyleSwitcher';
import EmptyState from '../components/EmptyState';

function Gallery({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTerm = searchParams.get('q') || '';
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [searchInput, setSearchInput] = useState(queryTerm);
  const [galleryStyle, setGalleryStyle] = useState(
    () => localStorage.getItem('alz-gallery-style') || 'grid3'
  );
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchInput(queryTerm);
  }, [queryTerm]);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (queryTerm) params.set('q', queryTerm);
    params.set('page', String(pageParam));

    apiRequest(`/photos?${params.toString()}`)
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [queryTerm, pageParam]);

  const handleStyleChange = (nextStyle) => {
    setGalleryStyle(nextStyle);
    try {
      localStorage.setItem('alz-gallery-style', nextStyle);
    } catch {
      // ignore storage errors
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (searchInput.trim()) next.q = searchInput.trim();
    setSearchParams(next);
  };

  const goToPage = (targetPage) => {
    const next = { page: String(targetPage) };
    if (queryTerm) next.q = queryTerm;
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="container py-4 py-md-5">
      <div className="page-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
        <div>
          <span className="eyebrow">Community gallery</span>
          <h1 className="display-font h1 mb-1 mt-1">
            {queryTerm ? `Results for “${queryTerm}”` : 'Every memory, in one place'}
          </h1>
          <p className="text-body-secondary mb-0">
            {Number(data.total || 0).toLocaleString()} photo{data.total === 1 ? '' : 's'}
          </p>
        </div>

        <div className="d-flex flex-column flex-sm-row gap-2 align-items-sm-center">
          <form className="search-form" onSubmit={handleSearchSubmit} role="search">
            <div className="input-group input-group-sm">
              <span className="input-group-text">
                <i className="bi bi-search" />
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Search titles, stories, people"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                maxLength={100}
                aria-label="Search photos"
              />
            </div>
          </form>
          <StyleSwitcher galleryStyle={galleryStyle} onChange={handleStyleChange} />
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading photos...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && data.items.length === 0 && (
        <EmptyState
          message={
            queryTerm
              ? 'No memories match your search.'
              : 'The gallery is empty. Upload the very first memory!'
          }
          user={user}
        />
      )}

      {!loading && !error && data.items.length > 0 && (
        <>
          <GalleryView photos={data.items} galleryStyle={galleryStyle} />

          {data.pages > 1 && (
            <nav className="mt-5" aria-label="Gallery pages">
              <ul className="pagination justify-content-center flex-wrap">
                <li className={`page-item ${data.page <= 1 ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => goToPage(Math.max(1, data.page - 1))}
                    aria-label="Previous"
                  >
                    &laquo;
                  </button>
                </li>
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <li
                    key={p}
                    className={`page-item ${p === data.page ? 'active' : ''}`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${data.page >= data.pages ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => goToPage(Math.min(data.pages, data.page + 1))}
                    aria-label="Next"
                  >
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

export default Gallery;
