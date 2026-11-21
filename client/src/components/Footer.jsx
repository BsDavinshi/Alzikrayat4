import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="alz-footer mt-5">
      <div className="container py-4">
        <div className="row gy-3 align-items-center">
          <div className="col-md-5 d-flex align-items-center gap-2">
            <img src="/logo.svg" width="28" height="28" alt="" />
            <div>
              <div className="brand-word fs-6">Alzikrayat · الذكريات</div>
              <small className="text-body-secondary">
                Every photo is a memory worth keeping.
              </small>
            </div>
          </div>
          <nav className="col-md-4" aria-label="Footer">
            <ul className="list-inline mb-0 small">
              <li className="list-inline-item">
                <Link to="/gallery">Gallery</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/albums">Albums</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/about">About Us</Link>
              </li>
            </ul>
          </nav>
          <div className="col-md-3 text-md-end small text-body-secondary">
            &copy; {new Date().getFullYear()} Alzikrayat · SUST CS&amp;IT
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
