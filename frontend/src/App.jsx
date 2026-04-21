import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import OrderDetails from './pages/OrderDetails';
import ShirtEditor from './pages/ShirtEditor';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <Link to="/" className="logo">
          <Package size={28} />
          <span>Gestionale</span>
        </Link>
        <Link to="/orders/new" className="btn">Nuovo Ordine</Link>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders/new" element={<CreateOrder />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/orders/:id/items/new" element={<ShirtEditor />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
