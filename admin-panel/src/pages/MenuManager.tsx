import { useEffect, useState } from 'react';
import api from '../api/client';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  available: number;
}

const EMPTY_FORM = { name: '', price: '', category: '' };

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const res = await api.get('/api/menu');
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) {
      alert('Fill in all fields');
      return;
    }

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      category: form.category,
      available: 1,
    };

    if (editingId !== null) {
      await api.put(`/api/menu/${editingId}`, payload);
      setEditingId(null);
    } else {
      await api.post('/api/menu', payload);
    }

    setForm(EMPTY_FORM);
    fetchItems();
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({ name: item.name, price: String(item.price), category: item.category });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/api/menu/${id}`);
    fetchItems();
  };

  const handleToggle = async (item: MenuItem) => {
    await api.put(`/api/menu/${item.id}`, {
      ...item,
      available: item.available === 1 ? 0 : 1,
    });
    fetchItems();
  };

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>

      {/* ── Add / Edit Form ── */}
      <div style={{
        background: '#fff',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ marginBottom: '16px', fontSize: '16px' }}>
          {editingId !== null ? '✏️ Edit item' : '➕ Add new item'}
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            placeholder="Item name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={inputStyle}
          />
          <input
            placeholder="Price (e.g. 120)"
            value={form.price}
            type="number"
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            style={{ ...inputStyle, width: '140px' }}
          />
          <input
            placeholder="Category (e.g. Starters)"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={inputStyle}
          />
          <button onClick={handleSubmit} style={{ background: '#dc5b00', color: '#fff' }}>
            {editingId !== null ? 'Update' : 'Add'}
          </button>
          {editingId !== null && (
            <button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}
              style={{ background: '#eee', color: '#333' }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Menu Items grouped by category ── */}
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#888' }}>No items yet. Add your first menu item above.</p>
      ) : (
        categories.map(cat => (
          <div key={cat} style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {cat}
            </h3>
            {items.filter(i => i.category === cat).map(item => (
              <div key={item.id} style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '14px 18px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                opacity: item.available ? 1 : 0.5,
              }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ marginLeft: '12px', color: '#555' }}>₹{item.price}</span>
                  {!item.available && (
                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#e53' }}>Unavailable</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleToggle(item)}
                    style={{ background: item.available ? '#e8f5e9' : '#fff3e0', color: item.available ? '#2e7d32' : '#e65100', fontSize: '13px' }}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </button>
                  <button onClick={() => handleEdit(item)}
                    style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '13px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    style={{ background: '#fce4ec', color: '#c62828', fontSize: '13px' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '14px',
  flex: 1,
  minWidth: '160px',
};