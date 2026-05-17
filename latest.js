export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');

  const fallback = {
    concurso: '---',
    data: 'Aguardando resultado',
    dezenas: ['06', '10', '27', '32', '42', '53'],
    acumulado: false,
    estimativa: 0,
    fonte: 'fallback seguro'
  };

  try {
    const caixaUrl = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena';
    const caixa = await fetch(caixaUrl, {
      headers: {
        'accept': 'application/json,text/plain,*/*',
        'user-agent': 'LotoTurboIA/1.0'
      }
    });

    if (!caixa.ok) throw new Error(`Caixa respondeu ${caixa.status}`);
    const data = await caixa.json();

    const dezenas = Array.isArray(data.listaDezenas)
      ? data.listaDezenas.map(n => String(n).padStart(2, '0'))
      : fallback.dezenas;

    return response.status(200).json({
      concurso: data.numero || fallback.concurso,
      data: data.dataApuracao || fallback.data,
      dezenas,
      acumulado: Boolean(data.acumulado),
      estimativa: Number(data.valorEstimadoProximoConcurso || 0),
      fonte: 'Caixa'
    });
  } catch (error) {
    return response.status(200).json({
      ...fallback,
      erro: 'Fonte principal indisponível no momento. O app continua funcionando.'
    });
  }
}
