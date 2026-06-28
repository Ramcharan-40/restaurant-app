import { useEffect, useState } from 'react';
import api from '../api/client';

interface Table {
  id: number;
  table_number: number;
}

interface QRData {
  qr: string;
  url: string;
}

export default function QRCodes() {
  const [tables, setTables] = useState<Table[]>([]);
  const [qrMap, setQrMap] = useState<Record<number, QRData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/tables').then(async res => {
      const tableList: Table[] = res.data;
      setTables(tableList);

      const qrResults = await Promise.all(
        tableList.map(t => api.get(`/api/tables/${t.id}/qr`))
      );

      const map: Record<number, QRData> = {};
      tableList.forEach((t, i) => {
        map[t.id] = qrResults[i].data;
      });
      setQrMap(map);
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ padding: '24px' }}>Generating QR codes...</p>;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',flexWrap: 'wrap',
  gap: '12px' }}>
        <h2>Table QR Codes</h2>
        <button
          onClick={() => window.print()}
          style={{ background: '#dc5b00', color: '#fff', padding: '8px 16px', borderRadius: '6px' }}
        >
          🖨 Print All
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
      }}>
        {tables.map(table => (
          <div key={table.id} className="qr-card" style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            pageBreakInside: 'avoid',
          }}>
            <h3 style={{ marginBottom: '12px' }}>Table {table.table_number}</h3>
            {qrMap[table.id] && (
              <img src={qrMap[table.id].qr} alt={`QR for table ${table.table_number}`} style={{ width: '100%' }} />
            )}
            <p style={{ fontSize: '11px', color: '#999', marginTop: '8px', wordBreak: 'break-all' }}>
              {qrMap[table.id]?.url}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          nav, button { display: none !important; }
          .qr-card { box-shadow: none; border: 1px solid #ddd; }
        }
      `}</style>
    </div>
  );
}