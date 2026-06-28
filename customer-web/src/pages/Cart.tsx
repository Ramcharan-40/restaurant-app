import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/clinet.ts';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { cart, updateQuantity, clearCart, total } = useCart();
  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const res = await api.post('/api/orders', {
        table_id: Number(tableId),
        items: cart.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
      });
      clearCart();
      navigate(`/table/${tableId}/confirm`, { state: { orderId: res.data.order_id } });
    } catch (err) {
      alert('Could not place order. Try again.');
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#ff0000', marginBottom: '16px' }}>Your cart is empty.</p>
        <button onClick={() => navigate(`/table/${tableId}`)} style={{ background: '#dc5b00', color: '#fff', padding: '10px 20px', borderRadius: '6px',border:'none', fontWeight:600 }}>
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '90px' }}>
      <header style={{ padding: '20px 16px', background: '#dc5b00', color: '#fff' }}>
        <div> <img
        src="/aadhyalogo.png"
        alt="Hotel Aadhya"
        style={{
          height: '48px',
          objectFit: 'contain',
          marginRight: '16px',
          color: '#fff',
        }}
      />
      </div>
        <span style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: '32px',
          color: '#ffffff',       /* the red from the logo */
          letterSpacing: '1px',
        }}>
          Hotel Aadhya
        </span>
      <div style={{
        fontFamily: 'sans-serif',
        fontSize: '10px',
        color: '#ffffff',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      }}>
        Take a seat have a treat
      </div>
        <h1 style={{ fontSize: '18px' }}>Your Cart</h1>
        <p style={{ fontSize: '13px', color: '#ffffff' }}>Table {tableId}</p>
      </header>

      <div style={{ padding: '0 16px' }}>
        {cart.map(item => (
          <div key={item.menu_item_id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
             border: '1px solid #eee',background:"#ffff",borderRadius:"10px",marginTop:"10px",padding:"14px"
          }}>
            <div>
              <div style={{ fontWeight: 600, color: '#000000' }}>{item.name}</div>
              <div style={{ color: '#666', fontSize: '14px' }}>₹{item.price} each</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                style={{ background: '#dc5b00', width: '28px', height: '28px', borderRadius: '50%' ,border:'1px solid #dc5b00'}}>−</button>
              <span style={{ minWidth: '20px', textAlign: 'center',fontSize:'18px' }}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                style={{ background: '#dc5b00', width: '28px', height: '28px', borderRadius: '50%' ,border:'1px solid #dc5b00'}}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #eee', padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 700 }}>
          <span>Total</span>
          <span>₹{total}</span>
        </div>
        <button
          onClick={placeOrder}
          disabled={placing}
          style={{
            width: '100%', background: '#dc5b00', color: '#fff',border: 'none',
            padding: '14px', borderRadius: '8px', fontWeight: 700, fontSize: '15px',
            opacity: placing ? 0.6 : 1,
          }}
        >
          {placing ? 'Placing order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}