import { useLocation, useParams, useNavigate } from 'react-router-dom';

export default function Confirmation() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = (location.state as { orderId?: number })?.orderId;

  return (
    <div style={{ padding: '60px 24px', textAlign: 'center',background:'#22C55E',height:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'100vw' }}>
      <div style={{ fontSize: '78px', marginBottom: '16px' }}><svg width="78" height="78" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px' }}>
      <circle cx="12" cy="12" r="10" fill="#4CAF50" />
    <path d="M8 12.5l2.5 2.5L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg></div>
      <h1 style={{ fontSize: '20px', marginBottom: '8px' }}>Order Placed!</h1>
      <p style={{ color: '#ffffff', marginBottom: '4px' }}>
        Order #{orderId} for Table {tableId}
      </p>
      <p style={{ color: '#fffefe', fontSize: '14px', marginBottom: '32px' }}>
        Your order has been sent to the kitchen. Sit back and relax.
      </p>
      <button
        onClick={() => navigate(`/table/${tableId}`)}
        style={{ background: '#dc5b00', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 600,border:"none" }}
      >
        Order More
      </button>
    </div>
  );
}