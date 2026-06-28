import { useEffect, useState } from 'react';
import api from '../api/client';
import { socket } from '../socket/socket';

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  id: number;
  table_number: number;
  status: 'new' | 'preparing' | 'ready' | 'served';
  created_at: string;
  items: OrderItem[];
}

const COLUMNS: { key: Order['status']; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: '#e3f2fd' },
  { key: 'preparing', label: 'Preparing', color: '#fff8e1' },
  { key: 'ready', label: 'Ready', color: '#e8f5e9' },
  { key: 'served', label: 'Served', color: '#f3e5f5' },
];

const NEXT_STATUS: Record<Order['status'], Order['status'] | null> = {
  new: 'preparing',
  preparing: 'ready',
  ready: 'served',
  served: null,
};

export default function Kitchen() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Initial load
  useEffect(() => {
    api.get('/api/orders').then(res => setOrders(res.data));
  }, []);

  // Live updates
  useEffect(() => {
    function handleNewOrder(order: Order) {
      setOrders(prev => [order, ...prev]);
    }

    function handleStatusUpdate({ order_id, status }: { order_id: string; status: Order['status'] }) {
      setOrders(prev =>
        prev.map(o => (o.id === Number(order_id) ? { ...o, status } : o))
      );
    }

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, []);

  const advanceStatus = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;

    // Optimistic update — UI moves immediately, socket event will confirm
    setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status: next } : o)));

    await api.patch(`/api/orders/${order.id}/status`, { status: next });
  };

  // Hide served orders older than today's session to keep the board clean
  const visibleOrders = orders.filter(o => o.status !== 'served' || isRecent(o.created_at));

  return (
    <div>
      <header style={{background:"#dc5b00", marginBottom: '20px', display: 'flex' ,flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',padding: '20px 0'}}>
        <div ><img
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
        <h1 style={{ fontSize: '20px' }}>🍳 Kitchen Dashboard</h1>
        
          <span style={{ padding:'5px',width: 'auto',height: '10%',borderRadius: '8px', background: '#ffffff', fontWeight: 'bold', fontSize: '18px', color: socket.connected ? '#5ea862' : '#c62828' }}>
            {socket.connected ? '● Live' : '● Disconnected'}
          </span>
    
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '0 24px', marginBottom: '40px' }}>
        {COLUMNS.map(col => (
          <div key={col.key}>
            <h2 style={{ fontSize: '14px', marginBottom: '12px', textTransform: 'uppercase', color: '#666' }}>
              {col.label} ({visibleOrders.filter(o => o.status === col.key).length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '60px' }}>
              {visibleOrders
                .filter(o => o.status === col.key)
                .map(order => (
                  <div key={order.id} style={{
                    background: col.color,
                    borderRadius: '10px',
                    padding: '14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>Table {order.table_number}</strong>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(order.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <ul style={{ paddingLeft: '16px', marginBottom: '10px', fontSize: '13px' }}>
                      {order.items.map((item, i) => (
                        <li key={i}>{item.name} × {item.quantity}</li>
                      ))}
                    </ul>
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => advanceStatus(order)}
                        style={{
                          width: '100%',
                          background: '#1a1a1a',
                          color: '#fff',
                          padding: '8px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        Mark as {NEXT_STATUS[order.status]} →
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function isRecent(createdAt: string) {
  const orderTime = new Date(createdAt.replace(' ', 'T') + 'Z').getTime();
  const now = Date.now();
  return now - orderTime < 1000 * 60 * 60*4 ; // shown for 4 hours
}