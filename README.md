# Gestionale Ordini

Applicazione web full-stack per gestire ordini, articoli personalizzati e stato consegna.

## Stack

- **Frontend:** React + Vite + React Router
- **Backend:** Node.js + Express
- **Database:** SQLite
- **Upload immagini:** Multer

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
gestionale/
├── backend/    # API Express + SQLite
├── frontend/   # Interfaccia React
└── avvia_gestionale.bat
```

## Requisiti

- Node.js 18+ (consigliato)
- npm

## Installazione

Dalla root del repository:

```bash
npm --prefix frontend install
npm --prefix backend install
```

## Avvio in sviluppo

### 1) Frontend

```bash
npm --prefix frontend run dev
```

### 2) Backend

In un secondo terminale:

```bash
node /home/runner/work/gestionale/gestionale/backend/server.js
```

Backend disponibile su `http://localhost:3001`.

## Build frontend

```bash
npm --prefix frontend run build
```

La build viene generata in `frontend/dist` e servita dal backend.

## Avvio “unificato” (Windows)

È disponibile lo script:

```bat
avvia_gestionale.bat
```

Lo script esegue la build del frontend e avvia il server backend sulla porta `3001`.

## Script disponibili

### Frontend

- `npm --prefix frontend run dev`
- `npm --prefix frontend run build`
- `npm --prefix frontend run lint`
- `npm --prefix frontend run preview`

### Backend

- `node backend/server.js`
- `npm --prefix backend test` (attualmente placeholder)
