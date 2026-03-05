
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

const BASE_URL = 'http://localhost:8080';
const UPLOAD_ENDPOINT = '/api/files/upload';
// Charge dynamiquement le token extrait avec open() de k6
const TOKEN = open('../frontend/tests/e2e/token.txt').trim();
const FILE_PATH = 'testfile.txt';

// Charger le fichier UNE FOIS dans la portée globale (init stage)
const fileBin = open(FILE_PATH, 'b');

export default function () {
  const formData = {
    file: http.file(fileBin, 'testfile.txt', 'text/plain'),
    expiresInDays: '2', // optionnel
  };
  const res = http.post(
    BASE_URL + UPLOAD_ENDPOINT,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    }
  );
  check(res, {
    'status 201': (r) => r.status === 201,
  });
  console.log('Status:', res.status);
  sleep(1);
}
