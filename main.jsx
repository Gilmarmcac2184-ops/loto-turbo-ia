import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { generateSmartGame, checkGame } from './lotteryBrain.js';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || '/api/megasena/latest';
const fallback = { concurso: '---', data: 'Sem conexão', dezenas: ['06','10','27','32','42','53'], acumulado: false, estimativa: 0, fonte: 'offline' };

function App() {
  const [latest, setLatest] = useState(fallback);
  const [game, setGame] = useState('06 10 27 32 42 53');
  const [smart, setSmart] = useState(['06','10','27','32','42','53']);
  const [installHint, setInstallHint] = useState('No iPhone: Safari → Compartilhar → Adicionar à Tela de Início');
  const [notificationStatus, setNotificationStatus] = useState('Notificações ainda não ativadas');

  async function loadLatest() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Falha na API');
      setLatest(await res.json());
    } catch (_) { setLatest(fallback); }
  }

  async function enableNotifications() {
    if (!('Notification' in window)) return setNotificationStatus('Este navegador não suporta notificações.');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationStatus('Notificações ativadas neste aparelho.');
      new Notification('Loto Turbo IA', { body: 'Você receberá alerta quando houver novo resultado.' });
    } else {
      setNotificationStatus('Permissão de notificação não concedida.');
    }
  }

  useEffect(() => {
    loadLatest();
    const timer = setInterval(loadLatest, 60000);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      setInstallHint('Este app pode ser instalado na tela inicial do aparelho.');
    });
    return () => clearInterval(timer);
  }, []);

  const parsed = useMemo(() => game.match(/\d+/g)?.map(n => n.padStart(2, '0')).slice(0, 20) || [], [game]);
  const checked = checkGame(parsed, latest.dezenas);

  return <main>
    <section className="hero">
      <div>
        <p className="eyebrow">PWA instalável</p>
        <h1>Loto Turbo IA</h1>
        <p>Resultado rápido, conferidor automático e gerador inteligente.</p>
      </div>
      <button onClick={loadLatest}>Atualizar</button>
    </section>

    <section className="card result">
      <div className="row"><span>Mega-Sena</span><strong>Concurso {latest.concurso}</strong></div>
      <p className="muted">{latest.data} • fonte: {latest.fonte || 'API'}</p>
      <div className="balls">{latest.dezenas.map(n => <b key={n}>{n}</b>)}</div>
      <p>{latest.acumulado ? 'Acumulou' : 'Resultado disponível'} • Estimativa: R$ {Number(latest.estimativa || 0).toLocaleString('pt-BR')}</p>
    </section>

    <section className="card">
      <h2>Conferir meu jogo</h2>
      <textarea value={game} onChange={e => setGame(e.target.value)} placeholder="Ex: 06 10 27 32 42 53" />
      <p><strong>{checked.count}</strong> acerto(s): {checked.hits.join(', ') || 'nenhum até agora'}</p>
    </section>

    <section className="card">
      <h2>Gerador inteligente</h2>
      <div className="balls small">{smart.map(n => <b key={n}>{n}</b>)}</div>
      <button onClick={() => setSmart(generateSmartGame())}>Gerar novo jogo</button>
      <p className="muted">Usa equilíbrio de soma, pares/ímpares, distribuição por dezenas e frequência histórica.</p>
    </section>

    <section className="card">
      <h2>Instalação e notificações</h2>
      <p>{installHint}</p>
      <button onClick={enableNotifications}>Ativar notificações</button>
      <p className="muted">{notificationStatus}</p>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
