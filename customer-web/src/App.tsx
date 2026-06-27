import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Confirmation from './pages/Confirmation';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/table/:tableId" element={<Menu />} />
          <Route path="/table/:tableId/cart" element={<Cart />} />
          <Route path="/table/:tableId/confirm" element={<Confirmation />} />
          <Route path="*" element={<p style={{ padding: '24px' }}>Scan the QR code on your table to view the menu.</p>} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}


