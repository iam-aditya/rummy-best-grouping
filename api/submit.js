const { CardManager } = require('../gp/dist/bestGroup.js');

function serializeResult(result) {
  return {
    isValid: result.isValid,
    score: result.score,
    names: result.names,
    groupIdToTypeMap: result.groupIdToTypeMap
      ? Object.fromEntries(result.groupIdToTypeMap)
      : {},
  };
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { cards, joker } = req.body ?? {};
  if (!Array.isArray(cards) || !joker) {
    return res.status(400).json({ error: 'Missing cards or joker' });
  }

  const cardManager = new CardManager();

  const userResult = cardManager.checkDeclarationAndScore(cards, joker);
  const plainCards = cards.map(c => c.split('.').slice(0, 2).join('.'));
  const bestResult = cardManager.bestGrouping(plainCards, joker);

  res.json({
    userResult: serializeResult(userResult),
    bestResult: serializeResult(bestResult),
  });
};
