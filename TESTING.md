# TESTING.md

## Objectif
Valider les fonctionnalités critiques du MVP DataShare (US01 à US06).

## Stratégie
- Tests backend unitaires/intégration (Spring Boot + JUnit)
- Tests front (à compléter) sur formulaires et parcours critiques
- Scénarios e2e (à compléter) pour les flux utilisateur complets

## Plan de tests (minimum)

| ID | Fonctionnalité | Type | Cas de test | Résultat attendu |
|---|---|---|---|---|
| T-01 | Signup | API | Email valide + mdp >= 8 | `201` + token |
| T-02 | Signup | API | Email déjà utilisé | `409` |
| T-03 | Login | API | Identifiants valides | `200` + token |
| T-04 | Login | API | Mauvais mdp | `401` |
| T-05 | Upload | API | Fichier valide + JWT | `201` + downloadUrl |
| T-06 | Upload | API | Fichier > 1 Go | `400` |
| T-07 | Download metadata | API | Token valide | `200` + métadonnées |
| T-08 | Download file | API | Token expiré | `410` |
| T-09 | Historique | API | JWT valide | `200` + liste fichiers |
| T-10 | Suppression | API | Owner supprime son fichier | `204` |
| T-11 | Suppression | API | Non-owner supprime fichier | `404` |

## État actuel
  - Fichier: `backend/src/test/java/com/datashare/backend/DataShareApplicationTests.java`

## Couverture de code
- Frontend : 71–79% global (statements, branches, functions, lines)
- Backend : 75% global (Jacoco, instructions/methods/classes)
- Rapports disponibles dans :
  - frontend/coverage/index.html
  - backend/target/site/jacoco/index.html

## E2E automatisés
- Tous les scénarios critiques (création de compte, upload, download, suppression, navigation, gestion erreurs) ont été automatisés avec Playwright et sont passés avec succès.

Commande pour lancer les tests E2E :
```bash
npx playwright test frontend/tests/e2e/
```


## Exécution tests backend

```bash
cd backend
mvn test
```

## Couverture de code
Commande recommandée:

```bash
cd backend
mvn test jacoco:report
```

Objectif indicatif: **>= 70%**.

## E2E (recommandé)
Scénarios à automatiser prioritairement:
1. Signup -> Login -> Upload -> Download
2. Login -> Historique -> Suppression
3. Download d’un fichier expiré
