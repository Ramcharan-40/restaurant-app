import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/clinet.ts';
import { useCart } from '../context/CartContext';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  available: number;
}

export default function Menu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { cart, addItem, total } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/menu').then(res => {
      setItems(res.data.filter((i: MenuItem) => i.available === 1));
      setLoading(false);
    });
  }, []);

  const categories = [...new Set(items.map(i => i.category))];
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) return <p style={{ padding: '24px' }}>Loading menu...</p>;

  return (
    <div style={{ paddingBottom: itemCount > 0 ? '80px' : '24px' }}>
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
        <h1 style={{ fontSize: '25px',color: '#ffffff' }}>Table {tableId}</h1>
        <p style={{ fontSize: '13px', color: '#ffffff' }}>Browse the menu and add items to your cart</p>
      </header>
     <div style={{ padding: '0 16px',background:"#dcdbda" }}>
      {items.length === 0 ? (
        <p style={{ padding: '24px', color: '#f50000' }}>No items available right now.</p>
      ) : (
        categories.map(cat => (
          <div key={cat} style={{ padding: '12px 16px', marginTop: '20px' ,background:"#ffff",borderRadius:"10px"}}>
            <h2 style={{ fontSize: '14px', color: '#000000', textTransform: 'uppercase', marginBottom: '10px' }}>
              {cat}
            </h2>
            {items.filter(i => i.category === cat).map(item => {
              const inCart = cart.find(c => c.menu_item_id === item.id);
              return (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px',
                  marginBottom: '10px',
                  border: '1px solid #eee',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.name}</div>
                    <div style={{ color: '#000000', fontSize: '14px' }}>₹{item.price}</div>
                  </div>
                  <button
                    onClick={() => addItem({ menu_item_id: item.id, name: item.name, price: item.price })}
                    style={{
                      background: inCart ? '#1f8928' : '#dc5b00',
                      color: inCart ? '#ffffff' : '#fff',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {inCart ? `Added ×${inCart.quantity}` : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>
        ))
      )}
    
    </div>

      {itemCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#dc5b00',
          color: '#fff',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{itemCount} item{itemCount > 1 ? 's' : ''} · ₹{total}</span>
          <button
            onClick={() => navigate(`/table/${tableId}/cart`)}
            style={{ border:'none',background: '#fff', color: '#1a1a1a', padding: '8px 18px', borderRadius: '6px', fontWeight: 700 }}
          >
            View Cart →
          </button>
        </div>
      )}
    </div>
  );
}