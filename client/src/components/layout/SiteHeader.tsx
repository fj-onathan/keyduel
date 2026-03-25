import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { NavChip } from "../landing/NavChip";
import { PracticeModal } from "../practice/PracticeModal";
import { AuthModal } from "../auth/AuthModal";
import { MobileWarningModal } from "../ui/MobileWarningModal";
import { Button } from "../ui/Button";
import { env } from "../../config/env";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useToastStore } from "../../store/toastStore";
import { useIsMobile } from "../../lib/useIsMobile";

export function SiteHeader() {
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileWarningOpen, setMobileWarningOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const { isAuthenticated, profile, logout } = useAuthStore();
  const openAuthModal = useUIStore((s) => s.openAuthModal);
  const addToast = useToastStore((s) => s.addToast);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on route change
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Close dropdown on outside click.
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    addToast("You have been signed out.", "info");
  };

  return (
    <>
      <header className="top-nav z-30 mb-8">
        <div className="top-nav-inner">
          <Link to="/" className="top-nav-brand" aria-label="Go to homepage">
            <div className="top-nav-brand-orb" aria-hidden="true">
              <span className="top-nav-brand-orb-core">
                <span>{"{"}</span>
                <span style={{ opacity: 0.5 }}>{"}"}</span>
              </span>
            </div>
            <span className="top-nav-brand-name">{env.appName}</span>
          </Link>

          <nav className="top-nav-links" aria-label="Primary">
            <NavChip to="/hubs">Hubs</NavChip>
            <NavChip to="/leaderboard">Leaderboard</NavChip>
            <button
              type="button"
              className="top-nav-practice-btn"
              onClick={() => isMobile ? setMobileWarningOpen(true) : setPracticeOpen(true)}
            >
              Practice
            </button>
            <a
              href="https://github.com/fj-onathan/keyduel"
              target="_blank"
              rel="noopener noreferrer"
              className="top-nav-github"
              aria-label="KeyDuel on GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
          </nav>

          <div className="top-nav-actions">
            {isAuthenticated && profile ? (
              <div className="top-nav-user" ref={dropdownRef}>
                <button
                  type="button"
                  className="top-nav-user-trigger"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="top-nav-avatar"
                    />
                  ) : (
                    <span className="top-nav-avatar-fallback">
                      {(profile.displayName || profile.username || "?")[0].toUpperCase()}
                    </span>
                  )}
                  <span className="top-nav-username">{profile.displayName || profile.username}</span>
                </button>

                {dropdownOpen && (
                  <div className="top-nav-dropdown">
                    <button
                      type="button"
                      className="top-nav-dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(`/u/${profile.username}`);
                      }}
                    >
                      My Profile
                    </button>
                    <button
                      type="button"
                      className="top-nav-dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/dashboard");
                      }}
                    >
                      Dashboard
                    </button>
                    <div className="top-nav-dropdown-divider" />
                    <button
                      type="button"
                      className="top-nav-dropdown-item top-nav-dropdown-item--danger"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="secondary"
                className="top-nav-auth-button"
                onClick={openAuthModal}
              >
                Sign Up / Log In
              </Button>
            )}
            <Link to="/race" className="top-nav-go-race-button">
              Go Race
            </Link>
          </div>

          {/* Mobile: hamburger + Go Race */}
          <div className="top-nav-mobile-right">
            <button
              type="button"
              className={`top-nav-hamburger ${mobileMenuOpen ? "is-open" : ""}`}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span className="top-nav-hamburger-line" />
              <span className="top-nav-hamburger-line" />
              <span className="top-nav-hamburger-line" />
            </button>
            <Link to="/race" className="top-nav-go-race-button">
              Go Race
            </Link>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`top-nav-drawer ${mobileMenuOpen ? "is-open" : ""}`}>
          <nav className="top-nav-drawer-links" aria-label="Mobile navigation">
            <NavChip to="/hubs">Hubs</NavChip>
            <NavChip to="/leaderboard">Leaderboard</NavChip>
            <button
              type="button"
              className="top-nav-practice-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                if (isMobile) {
                  setMobileWarningOpen(true);
                } else {
                  setPracticeOpen(true);
                }
              }}
            >
              Practice
            </button>
            <a
              href="https://github.com/fj-onathan/keyduel"
              target="_blank"
              rel="noopener noreferrer"
              className="top-nav-practice-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              GitHub
            </a>
          </nav>
          <div className="top-nav-drawer-divider" />
          <div className="top-nav-drawer-actions">
            {isAuthenticated && profile ? (
              <>
                <button
                  type="button"
                  className="top-nav-drawer-link"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(`/u/${profile.username}`);
                  }}
                >
                  My Profile
                </button>
                <button
                  type="button"
                  className="top-nav-drawer-link"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  className="top-nav-drawer-link top-nav-drawer-link--danger"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Button
                variant="secondary"
                className="top-nav-drawer-auth-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
              >
                Sign Up / Log In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop overlay */}
      {mobileMenuOpen && (
        <div
          className="top-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <PracticeModal
        open={practiceOpen}
        onClose={() => setPracticeOpen(false)}
      />
      <AuthModal />
      <MobileWarningModal
        open={mobileWarningOpen}
        onClose={() => setMobileWarningOpen(false)}
      />
    </>
  );
}
