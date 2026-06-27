import { Router } from 'express';
import db from '../db';
import { io } from '../index';

const router = Router();

// GET all orders with their items (kitchen + admin)
router.get('/', (_req, res) => {
  const orders = db.prepare(`
    SELECT o.*, t.table_number FROM orders o
    JOIN tables t ON o.table_id = t.id
    ORDER BY o.created_at DESC
  `).all();

  const items = db.prepare(`
    SELECT oi.*, m.name, m.price FROM order_items oi
    JOIN menu_items m ON oi.menu_item_id = m.id
    WHERE oi.order_id = ?
  `);

  const result = (orders as any[]).map(order => ({
    ...order,
    items: items.all(order.id)
  }));

  res.json(result);
});

// POST place order (customer)
router.post('/', (req, res) => {
  const { table_id, items } = req.body;

  const order = db.prepare(
    `INSERT INTO orders (table_id, status) VALUES (?, 'new')`
  ).run(table_id);

  const orderId = order.lastInsertRowid;

  const insertItem = db.prepare(
    `INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)`
  );

  (items as { menu_item_id: number; quantity: number }[]).forEach(item => {
    insertItem.run(orderId, item.menu_item_id, item.quantity);
  });

  // Fetch full order to emit
  const newOrder = db.prepare(`
    SELECT o.*, t.table_number FROM orders o
    JOIN tables t ON o.table_id = t.id
    WHERE o.id = ?
  `).get(orderId);

  const orderItems = db.prepare(`
    SELECT oi.*, m.name, m.price FROM order_items oi
    JOIN menu_items m ON oi.menu_item_id = m.id
    WHERE oi.order_id = ?
  `).all(orderId);

  const fullOrder = { ...(newOrder as object), items: orderItems };

  // 🔴 This is the key line — kitchen screen gets this instantly
  io.emit('new_order', fullOrder);

  res.json({ success: true, order_id: orderId });
});

// PATCH update status (kitchen)
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['new', 'preparing', 'ready', 'served'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, req.params.id);

  // Notify all kitchen screens of the status change
  io.emit('order_status_updated', { order_id: req.params.id, status });

  res.json({ success: true });
});

export default router;