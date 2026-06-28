type Page = 'menu' | 'orders' | 'qr';

interface Props {
  current: Page;
  onChange: (page: Page) => void;
  onLogout: () => void;
}

export default function Navbar({ current, onChange, onLogout }: Props) {
  return (
    <>
      <nav className="admin-navbar">
        <img
          src="/aadhyalogo.png"
          alt="Hotel Aadhya"
          className="admin-navbar-logo"
        />

        <div className="admin-navbar-links">
          {(['menu', 'orders', 'qr'] as Page[]).map(page => (
            <button
              key={page}
              onClick={() => onChange(page)}
              className="admin-navbar-btn"
              style={{
                background: current === page ? '#fff' : 'transparent',
                color: current === page ? '#dc5b00' : '#f9f9f9',
              }}
            >
              {page === 'menu' ? 'Menu Manager' : page === 'orders' ? 'Orders' : 'QR Codes'}
            </button>
          ))}
        </div>

        <button onClick={onLogout} className="admin-navbar-logout">
          Logout
        </button>
      </nav>

      <style>{`
        .admin-navbar {
          background: #dc5b00;
          padding: 10px 24px;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .admin-navbar-logo {
          height: 48px;
          object-fit: contain;
        }

        .admin-navbar-links {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .admin-navbar-btn {
          padding: 6px 16px;
          border-radius: 6px;
          text-transform: capitalize;
          white-space: nowrap;
          font-size: 14px;
        }

        .admin-navbar-logout {
          margin-left: auto;
          background: transparent;
          color: #f8f7f7;
          font-size: 13px;
          border: 1px solid #f8f7f7;
          padding: 6px 12px;
          border-radius: 6px;
          white-space: nowrap;
        }

        /* Tablet and below */
        @media (max-width: 768px) {
          .admin-navbar {
            padding: 10px 16px;
            height: auto;
          }

          .admin-navbar-logo {
            height: 38px;
          }
        }

        /* Phone */
        @media (max-width: 480px) {
          .admin-navbar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 12px 16px;
          }

          .admin-navbar-logo {
            height: 34px;
            align-self: center;
          }

          .admin-navbar-links {
            justify-content: center;
            order: 2;
          }

          .admin-navbar-btn {
            padding: 8px 12px;
            font-size: 13px;
            flex: 1;
            text-align: center;
            min-width: 80px;
          }

          .admin-navbar-logout {
            margin-left: 0;
            align-self: center;
            order: 3;
          }
        }
      `}</style>
    </>
  );
}