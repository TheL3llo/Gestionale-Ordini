import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Search, Package, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
    // Refresh periodically for status
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (e) {
      console.error('Failed to load orders', e);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Consegnato') return 'badge-green';
    if (status === 'In preparazione') return 'badge-orange';
    if (status === 'Spedito') return 'badge-purple';
    return 'badge-blue';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Ordini Recenti</h1>
      </div>
      
      {orders.length === 0 ? (
        <div className="glass-panel text-center">
          <Package size={48} className="text-muted mx-auto mb-4" />
          <h3 className="text-muted">Nessun ordine trovato. Inizia creandone uno!</h3>
        </div>
      ) : (
        <div className="grid-cards">
          {orders.map(order => (
            <Link to={`/orders/${order.id}`} key={order.id} style={{textDecoration: 'none'}}>
              <div className="glass-panel glass-panel-hoverable">
                <div className="flex justify-between items-center mb-4">
                  <h3>#{order.orderNumber}</h3>
                  <span className={`badge ${getStatusBadge(order.shippingStatus)}`}>
                    {order.shippingStatus}
                  </span>
                </div>
                {order.trackingCode && (
                  <p className="text-muted mt-2">
                    <span style={{fontSize: '0.8rem'}}>TRACKING</span><br/>
                    {order.trackingCode}
                  </p>
                )}
                <div className="flex justify-between items-center mt-4 pt-4" style={{borderTop: '1px solid var(--panel-border)'}}>
                  <span className="text-muted" style={{fontSize: '0.9rem'}}>Vai al Dettaglio</span>
                  <ChevronRight size={18} className="text-muted" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
