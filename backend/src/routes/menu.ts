import { Router } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/auth';


const router = Router();

// GET all available items
router.get('/', requireAuth,(_req, res) => {
  const items = db.prepare('SELECT * FROM menu_items ORDER BY category').all();
  res.json(items);
});

// POST new item (admin)
router.post('/', requireAuth, (req, res) => {
  const { name, price, category } = req.body;
  const result = db.prepare(
    'INSERT INTO menu_items (name, price, category) VALUES (?, ?, ?)'
  ).run(name, price, category);
  res.json({ id: result.lastInsertRowid, name, price, category });
});

// PUT update item (admin)
router.put('/:id', requireAuth, (req, res) => {
  const { name, price, category, available } = req.body;
  db.prepare(
    'UPDATE menu_items SET name=?, price=?, category=?, available=? WHERE id=?'
  ).run(name, price, category, available, req.params.id);
  res.json({ success: true });
});

// DELETE item (admin)
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM menu_items WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

export default router;