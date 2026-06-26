const http = require('http');
const { CardManager } = require('./gp/dist/bestGroup.js');

function serializeResult(result) {
  return {
    isValid: result.isValid,
    score: result.score,
    names: result.names ?? [],
    groupIdToTypeMap: result.groupIdToTypeMap
      ? Object.fromEntries(result.groupIdToTypeMap)
      : {},
  };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (req.url !== '/api/submit' || req.method !== 'POST') {
    res.writeHead(404);
    return res.end('Not found');
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const { cards, joker } = JSON.parse(body);
      if (!Array.isArray(cards) || !joker) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing cards or joker' }));
      }

      console.log('--- submit ---');
      console.log('joker:', joker);
      console.log('cards:', JSON.stringify(cards));

      const cardManager = new CardManager();
      const userResult = cardManager.checkDeclarationAndScore(cards, joker);
      const plainCards = cards.map(c => c.split('.').slice(0, 2).join('.'));
      const bestResult = cardManager.bestGrouping(plainCards, joker);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        userResult: serializeResult(userResult),
        bestResult: serializeResult(bestResult),
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(3001, () => {
  console.log('API running at http://localhost:3001');
});
