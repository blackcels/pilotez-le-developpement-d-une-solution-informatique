# DataShare — MVP (Projet 3)

Application web de transfert de fichiers sécurisés.

## Stack
- Frontend: Angular (TypeScript)
- Backend: Spring Boot (Java 21)
- Base de données: PostgreSQL
- Stockage: système de fichiers local
- Authentification: JWT

## Fonctionnalités implémentées (MVP)
- US03: Création de compte
- US04: Connexion utilisateur
- US01: Upload (auth requis)
- US02: Téléchargement via lien (avec gestion mot de passe et expiration)
- US05: Consultation de l’historique
- US06: Suppression d’un fichier (propriétaire uniquement)

## Structure du projet
- `backend/` : API Spring Boot
- `frontend/` : application Angular
- `database/schema.sql` : script PostgreSQL
- `openapi.yaml` : contrat d’API MVP
- `ARCHITECTURE_MVP.md` : schéma d’architecture
- `MODELE_DONNEES_MCD_MLD.md` : modèle de données

## Prérequis
- Java 21
- Maven 3.9+
- Node.js 24+
- npm 11+
- PostgreSQL 14+

## Installation

## 1) Base de données
Créer la base et l’utilisateur (adaptable selon ton environnement) :

```sql
CREATE DATABASE datashare;
CREATE USER datashare WITH PASSWORD 'datashare';
GRANT ALL PRIVILEGES ON DATABASE datashare TO datashare;
```

Appliquer le schéma :

```bash
psql -U datashare -d datashare -f database/schema.sql
```

## 2) Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

API disponible sur `http://localhost:8080`.

## 3) Frontend

```bash
cd frontend
npm install
npm start
```

Application disponible sur `http://localhost:4200`.

## Configuration

Backend: `backend/src/main/resources/application.yml`
- `spring.datasource.*`
- `app.jwt.secret`
- `app.jwt.expiration-seconds`
- `app.storage.local-path`

## Contrat API
Le contrat OpenAPI est disponible dans `openapi.yaml`.

## Tests

Backend:

```bash
cd backend
mvn test
```

Le test de contexte utilise un profil `test` avec base H2 en mémoire.

## Notes importantes
- La route `GET /api/auth/me` nécessite un token JWT valide.
- Les routes `GET /api/files` et `DELETE /api/files/{id}` sont protégées.
- Les routes `download` sont publiques et gèrent explicitement les cas `404/410/401`.

## Documents de suivi qualité
- `TESTING.md`
- `SECURITY.md`
- `PERF.md`
- `MAINTENANCE.md`

---

## Documentation d’API (contrat d’interface)

Le contrat d’interface entre le frontend et le backend est documenté dans le fichier `openapi.yaml` à la racine du projet.

- **Format** : Spécification OpenAPI 3.0
- **Contenu** : Toutes les routes, schémas de données, paramètres, codes de retour et exemples pour l’API DataShare (authentification, upload, téléchargement, historique, suppression…)
- **Utilisation** : Ce fichier sert de référence pour l’intégration front/back et la validation des livrables.

Pour visualiser ou tester l’API, vous pouvez ouvrir ce fichier dans [Swagger Editor](https://editor.swagger.io/) ou un outil compatible OpenAPI.

---

## Utilisation de l’IA dans le développement

Dans le cadre de ce projet, une partie de la documentation technique ainsi que l’ajout d’une navbar partagée sur le frontend ont été confiés à un copilote IA (GitHub Copilot).

- **Tâches confiées à l’IA :**
  - Génération et structuration de la documentation technique (README, fichiers de suivi qualité)
  - Création d’un composant navbar partagé pour l’authentification et la déconnexion

- **Incident rencontré :**
  - L’intégration automatique de la navbar par l’IA a provoqué un bug d’affichage et des erreurs de compilation sur le frontend (Angular)

- **Correction collaborative :**
  - Le bug a été identifié lors de la relecture
  - Correction apportée ensemble : ajustement du template Angular, import des modules nécessaires, nettoyage du code généré
  - Les modifications et correctifs ont été tracés dans l’historique Git (commits séparés IA/humain)

- **Supervision humaine :**
  - Relecture systématique du code généré
  - Ajustements pour garantir la conformité, la maintenabilité et la stabilité de l’application

Cette démarche est explicitée ici pour répondre à l’exigence de traçabilité et de transparence sur l’utilisation de l’IA dans le projet.

## 📚 Documentation & Qualité

- [TESTING.md](./TESTING.md) — Stratégie, plan et couverture de tests (backend, e2e)
- [SECURITY.md](./SECURITY.md) — Mesures de sécurité, audits, recommandations
- [PERF.md](./PERF.md) — Budget de performance, tests de charge, métriques clés
- [MAINTENANCE.md](./MAINTENANCE.md) — Procédures de maintenance, mises à jour, sauvegardes

Pour plus de détails sur l’architecture, les modèles de données et les choix techniques, voir aussi :
- [ARCHITECTURE_MVP.md](./ARCHITECTURE_MVP.md)
- [MODELE_DONNEES_MCD_MLD.md](./MODELE_DONNEES_MCD_MLD.md)

---

### 🚀 Déploiement rapide avec Docker

```bash
# 1. Lancer la base de données PostgreSQL
docker-compose up -d

# 2. Appliquer le schéma SQL
psql -h localhost -U datashare -d datashare -f database/schema.sql
```

### 🧹 Nettoyage des fichiers orphelins

Pour supprimer les entrées de fichiers dont le fichier n’existe plus sur le disque :

```bash
psql -h localhost -U datashare -d datashare -f backend/scripts/cleanup_orphan_files.sql
```
