import {Link} from "react-router-dom";
import {env} from "../../config/env";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-8 sm:mt-16 md:mt-24" aria-label="Site footer">
      <div className="site-footer-inner mx-auto max-w-7xl">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <div
              className="top-nav-brand-orb site-footer-brand-orb"
              aria-hidden="true"
            >
              <span className="top-nav-brand-orb-core site-footer-brand-orb-core">
                <span>{"{"}</span>
                <span style={{opacity: 0.5}}>{"}"}</span>
              </span>
            </div>
            <span>{env.appName}</span>
          </div>

          <nav className="site-footer-links" aria-label="Footer links">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <a
              href="https://github.com/fj-onathan/keyduel"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>

        <p className="site-footer-meta">
          &copy; 2026 KeyDuel. Open source under the Functional Source License.
        </p>
      </div>
    </footer>
  );
}
