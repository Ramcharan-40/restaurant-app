import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import MenuManager from './pages/MenuManager';
import Orders from './pages/Orders';
import QRCodes from './pages/QRCodes';
import Login from './pages/Login';

type Page = 'menu' | 'orders' | 'qr';

function AdminApp() {
  const { token, logout } = useAuth();
  const [page, setPage] = useState<Page>('menu');

  if (!token) return <Login />;

  return (
    <>
      <Navbar current={page} onChange={setPage} onLogout={logout} />
      {page === 'menu' ? <MenuManager /> : page === 'orders' ? <Orders /> : <QRCodes />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}