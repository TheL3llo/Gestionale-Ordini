import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function CreateOrder() {
  const [trackingCode, setTrackingCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const generatedOrderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const data = await api.createOrder({ orderNumber: generatedOrderNumber, trackingCode });
      navigate(`/orders/${data.id}`);
    } catch (e) {
      console.error(e);
      alert('Errore creazione ordine');
    }
  };

  return (
    <div style={{maxWidth: '600px', margin: '0 auto'}}>
      <h1 className="mb-8">Nuovo Ordine</h1>
      <div className="glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Codice Tracking (Opzionale)</label>
            <input 
              className="input-field"
              type="text" 
              value={trackingCode} 
              onChange={e => setTrackingCode(e.target.value)} 
              placeholder="Inserisci codice spedizione"
            />
          </div>
          <button type="submit" className="btn w-full mt-4">
            Crea Ordine
          </button>
        </form>
      </div>
    </div>
  );
}
