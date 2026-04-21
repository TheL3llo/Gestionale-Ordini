import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, API_BASE_URL } from '../api';
import {
  Check, Plus, Box, Truck, Trash2, ExternalLink,
  Pencil, RefreshCw, Upload, X, Save, Hash
} from 'lucide-react';

const REFRESH_INTERVAL = 30; // secondi

// ─── Modal Modifica Articolo ──────────────────────────────────────────────────
function EditItemModal({ item, onClose, onSaved }) {
  const [customText, setCustomText] = useState(item.customText || '');
  const [recipientName, setRecipientName] = useState(item.recipientName || '');
  const [type, setType] = useState(item.type || 'Maglia');
  const [basePrice, setBasePrice] = useState(item.basePrice ?? '');
  const [profit, setProfit] = useState(item.profit ?? '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(item.imagePath ? (item.imagePath.startsWith('http') ? item.imagePath : `${API_BASE_URL}${item.imagePath}`) : null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!recipientName.trim()) { alert('Il nome destinatario è obbligatorio'); return; }
    setSaving(true);
    const formData = new FormData();
    if (file) formData.append('image', file);
    formData.append('customText', customText);
    formData.append('recipientName', recipientName);
    formData.append('type', type);
    formData.append('basePrice', basePrice || 0);
    formData.append('profit', profit || 0);
    try {
      await api.updateItem(item.id, formData);
      onSaved();
    } catch (e) {
      console.error(e);
      alert('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Modifica Articolo</h3>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }}><X size={18} /></button>
        </div>

        {preview && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img src={preview} alt="anteprima" style={{ maxHeight: 160, borderRadius: 8, objectFit: 'contain' }} />
          </div>
        )}

        <div className="input-group">
          <label>Cambia Immagine (opzionale)</label>
          <label htmlFor="edit-file-upload" className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'center' }}>
            <Upload size={16} /> Scegli nuova foto
          </label>
          <input id="edit-file-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

        <div className="input-group">
          <label>Tipo Articolo</label>
          <input className="input-field" type="text" value={type} onChange={e => setType(e.target.value)} placeholder="Es: Maglia, Borsa, Cappellino" />
        </div>

        <div className="input-group">
          <label>Testo Personalizzato (Opzionale)</label>
          <input className="input-field" type="text" value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Es: CAMPIONE 10" />
        </div>

        <div className="input-group">
          <label>Assegna a (Nome della persona)</label>
          <input className="input-field" type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Nome destinatario" />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Prezzo Base (€)</label>
            <input className="input-field" type="number" min="0" step="0.01" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="Es: 10.50" />
          </div>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Guadagno (€)</label>
            <input className="input-field" type="number" min="0" step="0.01" value={profit} onChange={e => setProfit(e.target.value)} placeholder="Es: 5.00" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-success" style={{ width: '100%' }}>
          <Save size={18} /> {saving ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </div>
    </div>
  );
}

// ─── Pagina Principale ────────────────────────────────────────────────────────
export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [editingItem, setEditingItem] = useState(null);

  // Editing tracking code inline
  const [editingTracking, setEditingTracking] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);

  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const loadOrder = useCallback(async () => {
    try {
      const data = await api.getOrder(id);
      setOrder(data);
      setLastUpdate(new Date());
      setCountdown(REFRESH_INTERVAL);
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
    timerRef.current = setInterval(loadOrder, REFRESH_INTERVAL * 1000);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [loadOrder]);

  const handleDelete = async () => {
    if (window.confirm("Sei sicuro di voler cancellare questo ordine?")) {
      try {
        await api.deleteOrder(id);
        navigate('/');
      } catch (e) {
        console.error(e);
        alert("Errore durante la cancellazione");
      }
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.updateOrderStatus(id, status);
      loadOrder();
    } catch (e) {
      console.error(e);
    }
  };

  const saveTracking = async () => {
    setSavingTracking(true);
    try {
      await api.updateOrderTracking(id, trackingInput.trim());
      setEditingTracking(false);
      loadOrder();
    } catch (e) {
      console.error(e);
      alert('Errore durante il salvataggio del codice tracking');
    } finally {
      setSavingTracking(false);
    }
  };

  const toggleItemDelivery = async (itemId, currentStatus) => {
    try {
      await api.updateItemDelivery(itemId, !currentStatus);
      loadOrder();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteItem = async (itemId) => {
    if (window.confirm("Sei sicuro di voler rimuovere questo articolo?")) {
      try {
        await api.deleteItem(itemId);
        loadOrder();
      } catch (e) {
        console.error(e);
        alert("Errore durante l'eliminazione dell'articolo: " + e.message);
      }
    }
  };

  if (!order) return <div className="text-center mt-8">Caricamento...</div>;

  const totalBasePrice = order.items?.reduce((sum, item) => sum + (item.basePrice || 0), 0) || 0;
  const totalProfit = order.items?.reduce((sum, item) => sum + (item.profit || 0), 0) || 0;
  const grandTotal = totalBasePrice + totalProfit;

  const recipientTotals = order.items?.reduce((acc, item) => {
    const nameKey = (item.recipientName || 'Sconosciuto').trim().toLowerCase();
    const displayAs = (item.recipientName || 'Sconosciuto').trim();
    const itemTotal = (item.basePrice || 0) + (item.profit || 0);
    if (!acc[nameKey]) acc[nameKey] = { name: displayAs, total: 0, count: 0 };
    acc[nameKey].total += itemTotal;
    acc[nameKey].count += 1;
    return acc;
  }, {});

  const recipientsList = Object.values(recipientTotals || {});
  const formatTime = (d) => d ? d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';

  return (
    <div>
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => { setEditingItem(null); loadOrder(); }}
        />
      )}

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Ordine #{order.orderNumber}</h1>

          {/* Codice Tracking inline */}
          {editingTracking ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <input
                className="input-field"
                style={{ width: 240 }}
                type="text"
                autoFocus
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveTracking(); if (e.key === 'Escape') setEditingTracking(false); }}
                placeholder="Es: YT2312345678CN"
              />
              <button className="btn btn-success" style={{ padding: '0.5rem 1rem' }} onClick={saveTracking} disabled={savingTracking}>
                <Save size={15} /> {savingTracking ? 'Salvo...' : 'Salva'}
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }} onClick={() => setEditingTracking(false)}>
                <X size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Hash size={14} style={{ color: 'var(--text-muted)' }} />
              <span className="text-muted" style={{ fontSize: '0.95rem' }}>
                {order.trackingCode ? order.trackingCode : 'Codice tracking non inserito'}
              </span>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                onClick={() => { setTrackingInput(order.trackingCode || ''); setEditingTracking(true); }}
                title="Modifica codice tracking"
              >
                <Pencil size={12} /> {order.trackingCode ? 'Modifica' : 'Aggiungi'}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={handleDelete} className="btn" style={{ background: 'var(--danger)' }}>
            <Trash2 size={20} /> Elimina
          </button>
          <Link to={`/orders/${order.id}/items/new`} className="btn">
            <Plus size={20} /> Aggiungi Articolo
          </Link>
        </div>
      </div>

      {/* ── Stato Spedizione ── */}
      <div className="grid-cards mb-8">
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 className="flex items-center gap-2" style={{ margin: 0 }}><Truck size={20} /> Stato Spedizione</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={13} style={{ opacity: 0.7 }} />
              <span>Aggiornato: {formatTime(lastUpdate)}</span>
              <span style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 6,
                padding: '1px 7px',
                color: 'var(--accent-color)',
                fontWeight: 600
              }}>
                prossimo: {countdown}s
              </span>
            </div>
          </div>

          <div className="mb-4">
            <select
              value={order.shippingStatus}
              onChange={(e) => updateStatus(e.target.value)}
              className="input-field"
              style={{ width: 'auto', fontWeight: 'bold', color: 'var(--accent-color)' }}
            >
              <option value="In preparazione">In preparazione</option>
              <option value="Pronto">Pronto</option>
              <option value="Inviato">Inviato</option>
              <option value="Arrivato">Arrivato</option>
              <option value="Consegnato">Consegnato</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {order.trackingCode ? (
              <a
                href={`https://t.17track.net/en#nums=${order.trackingCode}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLink size={16} /> Controlla su 17track
              </a>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => { setTrackingInput(''); setEditingTracking(true); }}
              >
                <Hash size={16} /> Aggiungi codice tracking per tracciare
              </button>
            )}

            {order.shippingStatus !== 'Consegnato' && (
              <button onClick={() => updateStatus('Consegnato')} className="btn btn-success">
                <Box size={16} /> Segna Consegnato
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Totali ── */}
      <div className="grid-cards mb-8" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="glass-panel text-center">
          <p className="text-muted mb-2">Costo (Senza Guadagno)</p>
          <h3>€ {totalBasePrice.toFixed(2)}</h3>
        </div>
        <div className="glass-panel text-center">
          <p className="text-muted mb-2">Totale Guadagno</p>
          <h3 style={{ color: 'var(--success)' }}>+ € {totalProfit.toFixed(2)}</h3>
        </div>
        <div className="glass-panel text-center">
          <p className="text-muted mb-2">Totale Ordine</p>
          <h3 style={{ color: 'var(--accent-color)' }}>€ {grandTotal.toFixed(2)}</h3>
        </div>
      </div>

      {/* ── Da incassare per persona ── */}
      {recipientsList.length > 0 && (
        <div className="mb-8">
          <h2>Da Incassare (Per Persona)</h2>
          <p className="text-muted mb-4">Totale che ciascun destinatario dovrà pagare (Costo + Guadagno).</p>
          <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {recipientsList.map((r, i) => (
              <div key={i} className="glass-panel text-center" style={{ padding: '1rem' }}>
                <h4 className="mb-2">{r.name}</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{r.count} {r.count === 1 ? 'articolo' : 'articoli'}</p>
                <h3 style={{ marginTop: '0.5rem', color: 'var(--accent-color)' }}>€ {r.total.toFixed(2)}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lista articoli ── */}
      <h2>Contenuto Ordine ({order.items?.length || 0} articoli)</h2>
      {order.shippingStatus === 'Consegnato' && order.items?.length > 0 && (
        <p className="text-muted mb-4">L'ordine è arrivato. Spunta gli articoli man mano che li consegni.</p>
      )}

      <div className="mt-4">
        {order.items?.map(item => (
          <div key={item.id} className={`item-card ${item.isDeliveredToRecipient ? 'delivered' : ''}`}>
            {item.imagePath ? (
              <img src={item.imagePath.startsWith('http') ? item.imagePath : `${API_BASE_URL}${item.imagePath}`} alt="articolo" />
            ) : (
              <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                No Img
              </div>
            )}

            <div className="item-info">
              <h4>
                {item.recipientName}
                <span style={{ fontWeight: 'normal', fontSize: '0.8rem', opacity: 0.7, marginLeft: '8px' }}>| {item.type}</span>
              </h4>
              {item.customText && <p className="text-muted" style={{ fontSize: '0.9rem' }}>Testo: "{item.customText}"</p>}
              <p className="mt-2" style={{ fontSize: '0.85rem' }}>
                <span className="text-muted">Costo: €{(item.basePrice || 0).toFixed(2)}</span>
                <span style={{ color: 'var(--success)', marginLeft: '12px' }}>
                  Guadagno: €{(item.profit || 0).toFixed(2)}
                </span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setEditingItem(item)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.75rem', flexShrink: 0 }}
                title="Modifica articolo"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => deleteItem(item.id)}
                className="btn"
                style={{ padding: '0.5rem 0.75rem', flexShrink: 0, background: 'var(--danger)' }}
                title="Rimuovi articolo"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {order.shippingStatus === 'Consegnato' && (
              <div
                className={`checkbox-wrapper ${item.isDeliveredToRecipient ? 'checked' : ''}`}
                onClick={() => toggleItemDelivery(item.id, item.isDeliveredToRecipient)}
              >
                {item.isDeliveredToRecipient && <Check size={20} strokeWidth={3} />}
              </div>
            )}
          </div>
        ))}

        {order.items?.length === 0 && (
          <div className="glass-panel text-center mt-4 text-muted">
            Non ci sono articoli in questo ordine. Aggiungine uno!
          </div>
        )}
      </div>
    </div>
  );
}