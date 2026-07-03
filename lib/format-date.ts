// Postgres/PostgREST renvoie parfois les fractions de seconde avec 6 chiffres
// (microsecondes) alors que le constructeur Date JS n'en attend que 3
// (millisecondes). Certains navigateurs mobiles mal-interpretent ce format,
// ce qui donne une heure fausse. On normalise avant de parser.
function normalize(value: string) {
  return value.replace(/(\.\d{3})\d*/, '$1');
}

export function formatDateTime(value: string) {
  const date = new Date(normalize(value));
  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value: string) {
  const date = new Date(normalize(value));
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
