import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Image as ImageIcon, Upload, Save } from 'lucide-react';

export default function ShirtEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [customText, setCustomText] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [type, setType] = useState('Maglia');
  const [basePrice, setBasePrice] = useState('');
  const [profit, setProfit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSave = async () => {
    if (!file || !recipientName) {
      alert("Compila i campi richiesti (Immagine e Destinatario)");
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('customText', customText);
    formData.append('recipientName', recipientName);
    formData.append('type', type);
    formData.append('basePrice', basePrice || 0);
    formData.append('profit', profit || 0);

    try {
      await api.addItem(id, formData);
      navigate(`/orders/${id}`);
    } catch(e) {
      console.error(e);
      alert("Errore durante il salvataggio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-8">Aggiungi Articolo</h1>

      <div className="editor-container">
        {/* Anteprima Visiva */}
        <div className="editor-preview">
          {preview ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={preview} alt="Anteprima Articolo" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div className="text-muted flex-col items-center flex gap-4">
              <ImageIcon size={64} opacity={0.5} />
              <p>Carica un'immagine per vedere l'anteprima</p>
            </div>
          )}
        </div>

        {/* Controlli Editor */}
        <div className="editor-controls">
          <div className="glass-panel">
            <h3 className="mb-4">Dettagli Articolo</h3>
            
            <div className="input-group">
              <label>Carica Immagine</label>
              <label htmlFor="file-upload" className="btn btn-secondary" style={{display: 'flex', justifyContent: 'center'}}>
                <Upload size={18} /> Scegli Foto
              </label>
              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} style={{display: 'none'}} />
            </div>

            <div className="input-group">
              <label>Tipo Articolo</label>
              <input 
                className="input-field"
                type="text" 
                value={type} 
                onChange={e => setType(e.target.value)} 
                placeholder="Es: Maglia, Borsa, Cappellino"
              />
            </div>

            <div className="input-group">
              <label>Testo Personalizzato (Opzionale)</label>
              <input 
                className="input-field"
                type="text" 
                value={customText} 
                onChange={e => setCustomText(e.target.value)} 
                placeholder="Es: CAMPIONE 10"
              />
            </div>

            <div className="input-group mb-8">
              <label>Assegna a (Nome della persona)</label>
              <input 
                className="input-field"
                type="text" 
                value={recipientName} 
                onChange={e => setRecipientName(e.target.value)} 
                placeholder="Nome destinatario"
              />
              </div>

            <div style={{ display: 'flex', gap: '1rem' }} className="mb-8">
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Prezzo Base (€)</label>
                <input 
                  className="input-field"
                  type="number"
                  min="0"
                  step="0.01"
                  value={basePrice} 
                  onChange={e => setBasePrice(e.target.value)} 
                  placeholder="Es: 10.50"
                />
              </div>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Guadagno (€)</label>
                <input 
                  className="input-field"
                  type="number"
                  min="0"
                  step="0.01" 
                  value={profit} 
                  onChange={e => setProfit(e.target.value)} 
                  placeholder="Es: 5.00"
                />
              </div>
            </div>

            <button onClick={handleSave} disabled={isSubmitting} className="btn w-full btn-success">
              <Save size={20} />
              {isSubmitting ? 'Salvataggio...' : 'Salva Articolo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
