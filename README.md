# Romeo e Giulietta – Visualizzazione interattiva

Visualizzazione dell'opera di Shakespeare con linee rosse che collegano ogni "Romeo" con ogni "Juliet" – primo con ultimo, secondo con penultimo, e così via – ordine di apparizione casuale.

**[Live su Vercel](https://romeo-juliet-viz.vercel.app)** (dopo il deploy)

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

## Deploy su Vercel

1. Crea un repo GitHub e pusha il codice (vedi sotto)
2. Vai su [vercel.com](https://vercel.com) → **Add New** → **Project**
3. Importa il repo GitHub → **Deploy**

## Push su GitHub

```powershell
gh auth login   # una tantum, se non sei loggato
cd "c:\Users\utente\ROMEO book"
gh repo create romeo-juliet-viz --public --source=. --remote=origin --push
```

## Struttura

- `romeo_and_juliet.txt` – testo estratto dal PDF
- `extract_text.py` – script per estrarre il testo dal PDF
- `index.html` – pagina principale
- `visualization.js` – logica canvas, layout, connessioni, animazione
- `requirements.txt` – dipendenze Python (pymupdf)
