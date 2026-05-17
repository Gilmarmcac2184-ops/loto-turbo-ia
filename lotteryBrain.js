const hotNumbers = ['05','06','10','27','32','37','38','42','46','53','58','60'];
const pool = Array.from({ length: 60 }, (_, i) => String(i + 1).padStart(2, '0'));

function scoreGame(nums) {
  const values = nums.map(Number);
  const sum = values.reduce((a, b) => a + b, 0);
  const evens = values.filter(n => n % 2 === 0).length;
  const hot = nums.filter(n => hotNumbers.includes(n)).length;
  const decades = new Set(values.map(n => Math.floor((n - 1) / 10))).size;
  let score = hot * 4 + decades * 3 - Math.abs(3 - evens) * 3 - Math.abs(175 - sum) / 12;
  for (let i = 1; i < values.length; i++) if (values[i] === values[i - 1] + 1) score -= 2;
  return score;
}

export function generateSmartGame() {
  let best = [];
  let bestScore = -Infinity;
  for (let attempt = 0; attempt < 900; attempt++) {
    const weighted = [...pool, ...hotNumbers, ...hotNumbers];
    const pick = new Set();
    while (pick.size < 6) pick.add(weighted[Math.floor(Math.random() * weighted.length)]);
    const nums = [...pick].sort((a, b) => Number(a) - Number(b));
    const score = scoreGame(nums);
    if (score > bestScore) { bestScore = score; best = nums; }
  }
  return best;
}

export function checkGame(myGame, result) {
  const resultSet = new Set(result || []);
  const hits = [...new Set(myGame)].filter(n => resultSet.has(n)).sort((a, b) => Number(a) - Number(b));
  return { hits, count: hits.length };
}
