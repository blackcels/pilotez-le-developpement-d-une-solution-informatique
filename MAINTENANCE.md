# MAINTENANCE.md

## Objectif
Définir les opérations de maintenance minimales pour garder l’application stable et sécurisée.

## Fréquence recommandée
- Hebdomadaire : vérification dépendances et vulnérabilités
- Mensuelle : mise à jour mineure dépendances
- Trimestrielle : revue des versions majeures + dette technique

## Procédure de mise à jour

## Frontend
```bash
cd frontend
npm outdated
npm update
npm audit fix
```

## Backend
```bash
cd backend
mvn versions:display-dependency-updates
mvn versions:use-latest-releases
mvn test
```

## Risques à surveiller
- Régression API (contrat OpenAPI)
- Incompatibilité dépendances Spring/Angular
- Changement de comportement sécurité (JWT, CORS, filtres)
- Régression performance après upgrade

## Procédure de correction incident
1. Identifier l’erreur via logs backend/frontend
2. Reproduire sur environnement local
3. Corriger dans une branche dédiée
4. Exécuter tests minimum (`mvn test`, tests front ciblés)
5. Déployer correctif et vérifier endpoints critiques

## Sauvegarde / rétention (minimum MVP)
- Sauvegarde régulière de la base PostgreSQL
- Répertoire de stockage fichiers monitoré (taille/disponibilité)
- Politique de purge expirés maintenue via tâche planifiée

## Checklist maintenance rapide
- [ ] Dépendances à jour
- [ ] Scan sécurité exécuté
- [ ] Tests backend OK
- [ ] Build frontend OK
- [ ] Vérification upload/download/historique/suppression
