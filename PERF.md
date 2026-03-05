# PERF.md

## Objectif
Évaluer rapidement les performances sur un endpoint critique et définir un budget de performance.

## Endpoint critique ciblé
- Upload fichier: `POST /api/files/upload`

## Test de charge réel (k6)

Script de test pour l'endpoint d'upload de fichier (`POST /api/files/upload`) :

Le dossier de test se trouve à la racine du projet : `perf/`.
Placez votre script de charge et le fichier de test dans ce dossier.


Fichier `perf/upload-file.js` :

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

const BASE_URL = 'http://localhost:8080';
const UPLOAD_ENDPOINT = '/api/files/upload';
const TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJibGFja2NlbHNAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyNDM1MDgyLCJleHAiOjE3NzI1MjE0ODJ9.1IqzGIwKJLK37hr_Poc5iq3Z7N7m1kU2b6z-EuQknroiB9cOaLXG1NQSLrJ6go9MLN7UwW18PUDgth5VpyTjVA';
const FILE_PATH = 'testfile.txt'; // Placez un petit fichier texte dans perf/

// Charger le fichier UNE FOIS dans la portée globale (init stage)
const fileBin = open(FILE_PATH, 'b');

export default function () {
  const payload = { file: http.file(fileBin, 'testfile.txt') };
  const res = http.post(
    BASE_URL + UPLOAD_ENDPOINT,
    payload,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );
  check(res, {
    'status 201': (r) => r.status === 201,
  });
  sleep(1);
}
```

Commandes :

```bash
# Placez un fichier de test texte dans perf/
echo "Ceci est un fichier de test." > perf/testfile.txt

# Lancez le test de charge depuis le dossier perf/
cd perf
k6 run upload-file.js
```

### Résultat du test k6 (upload fichier)
- 100% de succès (aucune erreur)
- Latence moyenne : ~21ms
- 300 requêtes en 30s, débit stable
- Aucun échec réseau ou HTTP
Voir log d’exécution pour détails.

## Métriques à suivre
- Temps de réponse (`p95`, `p99`)
- Taux d’erreur (`4xx/5xx`)
- Débit requêtes/sec
- Taille moyenne des fichiers transférés

## Budget de performance (MVP)
- API (`p95`) : < 500 ms sur endpoints non-upload
- Upload petit fichier (`p95`) : < 2 s
- Taux d’erreur sous charge légère : < 1%

## Performance front
Mesures recommandées:
- Lighthouse performance
- Poids bundle Angular (`ng build --configuration production`)

Commande:

Poids du bundle Angular (production) :
Commande :
```bash
cd frontend
npm run build
```
À mesurer avec le dossier `dist/` ou via Lighthouse.

```bash
cd frontend
npm run build
```

## Améliorations possibles
- Streaming plus fin des téléchargements
- Compression et cache headers
- CDN si migration stockage cloud
