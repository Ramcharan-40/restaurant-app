import { useEffect, useState } from 'react';
import api from '../api/client';

interface Order {
  id: number;
  table_number: number;
  status: string;
  created_at: string;
  items: { name: string; quantity: number; price: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  new:       '#e3f2fd',
  preparing: '#fff8e1',
  ready:     '#e8f5e9',
  served:    '#f3e5f5',
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // annotate generic so response is typed and callback param isn't implicitly any
    api.get<Order[]>('/api/orders').then(response => setOrders(response.data));
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>All Orders</h2>
      {orders.length === 0 ? (
        <p style={{ color: '#888' }}>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 700 }}>Table {order.table_number}</span>
              <span style={{
                background: STATUS_COLORS[order.status] || '#eee',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '13px',
                textTransform: 'capitalize',
              }}>
                {order.status}
              </span>
              <span style={{ color: '#888', fontSize: '13px' }}>
                {new Date(order.created_at).toLocaleTimeString()}
              </span>
            </div>
            <ul style={{ paddingLeft: '16px' }}>
              {order.items.map((item, i) => (
                <li key={i} style={{ fontSize: '14px', color: '#444', marginBottom: '4px' }}>
                  {item.name} × {item.quantity}
                  <span style={{ marginLeft: '8px', color: '#888' }}>₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}