# Gestionale Ordini

Applicazione web full-stack per gestire ordini, articoli personalizzati e stato consegna.

## Stack aggiornato

- **Frontend:** React + Vite + React Router
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Upload immagini:** Multer + Cloudinary

## Funzionalità principali

- Creazione e lista ordini
- Dettaglio ordine con aggiornamento stato spedizione
- Gestione codice tracking
- Aggiunta, modifica e rimozione articoli per ordine
- Upload immagine articolo
- Calcolo costi, guadagni e totale ordine
- Checklist consegna articoli ai destinatari

## Struttura progetto

```text
Gestionale-Ordini/
├── backend/    # API Express + PostgreSQL
├── frontend/   # Interfaccia React
└── avvia_gestionale.bat
```

## Prerequisiti

Per far funzionare il gestionale servono:

- **Node.js 18+**
- **npm**
- **PostgreSQL** attivo e raggiungibile
- **Account Cloudinary** (necessario per upload immagini)

## Installazione

Dalla root del repository:

```bash
npm --prefix frontend install
npm --prefix backend install
```

## Configurazione ambiente

### 1) Backend (`backend/.env`)

Crea il file `backend/.env` con:

```env
PORT=3001
DATABASE_URL=postgresql://your_username:your_password@your_host:5432/your_database_name
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

> `DATABASE_URL` è obbligatoria: al primo avvio il backend crea automaticamente le tabelle (`orders`, `items`) nel database indicato.
> Non committare mai le credenziali: il file `.env` deve restare solo in locale e va mantenuto in `.gitignore`.

### 2) Frontend (`frontend/.env`) - per sviluppo locale

Crea il file `frontend/.env` con:

```env
VITE_API_URL=http://localhost:3001
```

## Avvio in sviluppo (2 terminali)

### Terminale 1 - Backend

```bash
cd backend
npm start
```

Backend disponibile su `http://localhost:3001`.

### Terminale 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend disponibile su `http://localhost:5173` (default Vite).

## Avvio unificato (build frontend + backend)

Se vuoi servire il frontend direttamente dal backend:

```bash
npm --prefix frontend run build
npm --prefix backend run start
```

Poi apri `http://localhost:3001`.

## Avvio rapido su Windows

È disponibile lo script:

```bat
avvia_gestionale.bat
```

Lo script esegue la build del frontend e avvia il server backend.

## Script disponibili

### Frontend

- `npm --prefix frontend run dev`
- `npm --prefix frontend run build`
- `npm --prefix frontend run lint`
- `npm --prefix frontend run preview`

### Backend

- `npm --prefix backend run start`

## Note

- Al momento non sono presenti test automatici backend utilizzabili (`npm --prefix backend test` è un placeholder).
