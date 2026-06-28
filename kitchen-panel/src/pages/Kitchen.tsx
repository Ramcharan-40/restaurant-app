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
      <header className="kitchen-header">
        <div>
          <img
            src="/aadhyalogo.png"
            alt="Hotel Aadhya"
            className="kitchen-logo"
          />
        </div>
        <span className="kitchen-brand-name">
          Hotel Aadhya
        </span>
        <div className="kitchen-tagline">
          Take a seat have a treat
        </div>
        <h1 className="kitchen-title">🍳 Kitchen Dashboard</h1>

        <span className="kitchen-status-badge" style={{ color: socket.connected ? '#5ea862' : '#c62828' }}>
          {socket.connected ? '● Live' : '● Disconnected'}
        </span>
      </header>

      <div className="kitchen-grid">
        {COLUMNS.map(col => (
          <div key={col.key}>
            <h2 className="kitchen-column-title">
              {col.label} ({visibleOrders.filter(o => o.status === col.key).length})
            </h2>
            <div className="kitchen-column-cards">
              {visibleOrders
                .filter(o => o.status === col.key)
                .map(order => (
                  <div key={order.id} className="kitchen-card" style={{ background: col.color }}>
                    <div className="kitchen-card-header">
                      <strong>Table {order.table_number}</strong>
                      <span className="kitchen-card-time">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <ul className="kitchen-card-items">
                      {order.items.map((item, i) => (
                        <li key={i}>{item.name} × {item.quantity}</li>
                      ))}
                    </ul>
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => advanceStatus(order)}
                        className="kitchen-card-btn"
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

      <style>{`
        .kitchen-header {
          background: #dc5b00;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
        }

        .kitchen-logo {
          height: 48px;
          object-fit: contain;
          margin-right: 16px;
          color: #fff;
        }

        .kitchen-brand-name {
          font-family: 'Great Vibes', cursive;
          font-size: 32px;
          color: #ffffff;
          letter-spacing: 1px;
        }

        .kitchen-tagline {
          font-family: sans-serif;
          font-size: 10px;
          color: #ffffff;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .kitchen-title {
          font-size: 20px;
          color: #fff;
        }

        .kitchen-status-badge {
          padding: 5px 10px;
          width: auto;
          height: 10%;
          border-radius: 8px;
          background: #ffffff;
          font-weight: bold;
          font-size: 18px;
        }

        .kitchen-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 0 24px;
          margin-bottom: 40px;
        }

        .kitchen-column-title {
          font-size: 14px;
          margin-bottom: 12px;
          text-transform: uppercase;
          color: #666;
        }

        .kitchen-column-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 60px;
        }

        .kitchen-card {
          border-radius: 10px;
          padding: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .kitchen-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .kitchen-card-time {
          font-size: 12px;
          color: #666;
        }

        .kitchen-card-items {
          padding-left: 16px;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .kitchen-card-btn {
          width: 100%;
          background: #1a1a1a;
          color: #fff;
          padding: 8px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          text-transform: capitalize;
        }

        /* Tablet — 2 columns */
        @media (max-width: 900px) {
          .kitchen-grid {
            grid-template-columns: repeat(2, 1fr);
            padding: 0 16px;
          }
        }

        /* Phone — header shrinks, grid goes to 1 column */
        @media (max-width: 480px) {
          .kitchen-header {
            padding: 14px 0;
          }

          .kitchen-logo {
            height: 36px;
          }

          .kitchen-brand-name {
            font-size: 22px;
          }

          .kitchen-tagline {
            font-size: 9px;
          }

          .kitchen-title {
            font-size: 16px;
          }

          .kitchen-status-badge {
            font-size: 14px;
          }

          .kitchen-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 0 12px;
          }
        }
      `}</style>
    </div>
  );
}

function isRecent(createdAt: string) {
  const orderTime = new Date(createdAt.replace(' ', 'T') + 'Z').getTime();
  const now = Date.now();
  return now - orderTime < 1000 * 60 * 60 * 4; // shown for 4 hours
}