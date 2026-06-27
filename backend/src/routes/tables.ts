import { Router } from 'express';
import QRCode from 'qrcode';
import db from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const tables = db.prepare('SELECT * FROM tables ORDER BY table_number').all();
  res.json(tables);
});

// Generate QR code for a specific table
router.get('/:id/qr', async (req, res) => {
  const tableId = req.params.id;

  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(tableId);
  if (!table) {
    return res.status(404).json({ error: 'Table not found' });
  }

  const baseUrl = process.env.CUSTOMER_APP_URL || 'http://localhost:5173';
  const url = `${baseUrl}/table/${tableId}`;

  const qr = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
  });

  res.json({ qr, url, table });
});

export default router;