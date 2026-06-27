type Page = 'menu' | 'orders' | 'qr';

interface Props {
  current: Page;
  onChange: (page: Page) => void;
  onLogout: () => void;
}

export default function Navbar({ current, onChange,onLogout }: Props) {
  return (
    <nav style={{
      background: '#dc5b00',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      height: '56px'
    }}>
            <img
        src="/aadhyalogo.png"
        alt="Hotel Aadhya"
        style={{
          height: '48px',
          objectFit: 'contain',
          color: '#fff',
        }}
      />
      {(['menu', 'orders','qr'] as Page[]).map(page => (
        <button
          key={page}
          onClick={() => onChange(page)}
          style={{
            background: current === page ? '#fff' : 'transparent',
            color: current === page ? '#dc5b00' : '#f9f9f9',
            padding: '6px 16px',
            borderRadius: '6px',
            textTransform: 'capitalize',
          }}
        >
         {page === 'menu' ? 'Menu Manager' : page === 'orders' ? 'Orders' : 'QR Codes'}
        </button>
      ))}
      <button onClick={onLogout} style={{ marginLeft: 'auto', background: 'transparent', color: '#f8f7f7', fontSize: '13px' ,border: '1px solid #f8f7f7', padding: '6px 12px', borderRadius: '6px' }}>
        Logout
      </button>
    </nav>
  );
}