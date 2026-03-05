# SECURITY.md

## Objectif
Documenter les mécanismes de sécurité du MVP et les vérifications à réaliser.

## Mesures implémentées
- Authentification JWT côté backend
## Objectif
Documenter les mécanismes de sécurité, la couverture de tests, les vérifications automatisées et la conformité du MVP.
- Vérification d’accès propriétaire sur historique/suppression
- Upload protégé par JWT
## Vérifications de sécurité recommandées

npm install
npm audit
```bash
cd backend
mvn org.owasp:dependency-check-maven:check
```
Le scan de dépendances backend a été lancé avec OWASP Dependency-Check (version 8.4.0).

**Résultat : Échec de la mise à jour des flux NVD (erreur 403 Forbidden)**

- Le scan utilise les données locales, donc les résultats peuvent ne pas inclure les vulnérabilités les plus récentes.
- Message d'avertissement : "A new version of dependency-check is available. Consider updating to version 12.1.0."

- Vérifier régulièrement la documentation OWASP Dependency-Check pour les solutions de contournement.
- Envisager l'utilisation de sources alternatives (CISA, VulnDB, etc.) si la conformité exige une base à jour.
## 3) Scan conteneur (si Docker)
```bash

## Décisions sécurité (MVP)
- Pas de récupération de mot de passe fichier

## Actions d’amélioration post-MVP
- Rotation et externalisation du secret JWT (variables d’environnement)
- Rate limiting dédié sur login et verify-password
- Journalisation sécurité dédiée (tentatives échouées)
- Chiffrement au repos si migration S3

# Sécurité du projet

## Scan de sécurité (npm audit)

Un scan de sécurité a été réalisé sur le frontend et le backend avec la commande `npm audit`.

### Frontend
- Commandes exécutées :
  - `npm audit fix`
  - `npm install @angular/core@latest @angular/common@latest @angular/forms@latest @angular/platform-browser@latest @angular/router@latest ajv@latest`
  - `npm audit`
- Résultat :
  - Certaines vulnérabilités modérées et hautes subsistent, principalement liées à des dépendances indirectes (Angular, ajv).
  - Les vulnérabilités restantes sont connues, documentées et seront surveillées lors des prochaines mises à jour du framework et des dépendances.
  - Aucun impact direct sur la sécurité des fonctionnalités critiques n'a été détecté.
  - `npm audit` (si applicable)
  - Aucun problème critique détecté.

## Gestion des fichiers non supprimables et rôle admin

Un module d'administration a été ajouté pour permettre la gestion des fichiers ne pouvant pas être supprimés par les utilisateurs standards.


- Les dépendances seront régulièrement mises à jour.
- Les scans de sécurité seront réitérés à chaque nouvelle version majeure.
- Les droits admin sont audités et limités aux comptes autorisés.

---

