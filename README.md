# Romeo e Giulietta – Visualizzazione interattiva

Visualizzazione dell'opera di Shakespeare con linee rosse che collegano ogni istanza di "Romeo" con ogni istanza di "Juliet", come nell'artwork originale (~55.440 linee).

## Come usare

### 1. Avvia un server HTTP locale

Siccome il browser carica `romeo_and_juliet.txt` via `fetch`, serve un server locale:

```bash
cd "c:\Users\utente\ROMEO book"
python -m http.server 8080
```

### 2. Apri nel browser

Apri [http://localhost:8080](http://localhost:8080) nel browser.

### 3. Controlli

- **Play**: avvia l'animazione delle linee
- **Pause**: mette in pausa
- **Reset**: riparte da zero
- **Registra video**: registra l'animazione come file WebM (premere di nuovo per fermare e scaricare)

## Struttura

- `romeo_and_juliet.txt` – testo estratto dal PDF
- `extract_text.py` – script per estrarre il testo dal PDF
- `index.html` – pagina principale
- `visualization.js` – logica canvas, layout, connessioni, animazione
- `requirements.txt` – dipendenze Python (pymupdf)
