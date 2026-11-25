window.EP01_DUPLO_DATA = {
  channel: 'Duplo Sentido 3D',
  episode: 1,
  slug: 'ep01-pinto-gigante',
  title: 'O Que Eu Faço Com Meu Pinto Gigante 🐥',
  category: 'Animais',
  scenario: 'Quintal Solar',
  anchorWord: 'PINTO GIGANTE',
  duration: 22.5,
  beats: [
    {
      id: 'b1_isca',
      label: '1. Gancho Cerrado (0.0s)',
      time: 0.0,
      end: 2.2,
      tag: '🎯 ISCA 1ª PALAVRA',
      wordPop: 'PINTO GIGANTE?! 👀',
      wordColor: '#fbbf24',
      speaker: 'Você',
      line: 'Você já viu o que eu faço todo dia de manhã com o meu pinto gigante?!',
      subtext: 'Close fechado no rosto sério/maroto; caixote esconde o bicho e só uma pena amarela escapa atrás.',
      sfx: ['boom_hook']
    },
    {
      id: 'b2_revelacao',
      label: '2. Revelação Dolly-Out (2.2s)',
      time: 2.2,
      end: 5.2,
      tag: '🐥 REVELAÇÃO LITERAL!',
      wordPop: 'PIU-PIU DE 1,70M! 🐥',
      wordColor: '#facc15',
      speaker: 'Pintinho + Você',
      line: 'PIU!! — É esse pintinho amarelinho de quase dois metros que nasceu aqui no quintal!',
      subtext: 'Câmera recua com elástico (FOV 34 -> 47) revelando o pintinho gigante pulando do caixote!',
      sfx: ['scratch', 'chick_chirp', 'pop']
    },
    {
      id: 'b3_duas_maos',
      label: '3. Segura Com as 2 Mãos (5.2s)',
      time: 5.2,
      end: 9.6,
      tag: '👐 DUPLO SENTIDO #2',
      wordPop: 'SEGURA FIRME! 👐',
      wordColor: '#38bdf8',
      speaker: 'Você',
      line: 'Pra dar banho nele, você tem que segurar firme com as duas mãos… senão ele escapa escorregando!',
      subtext: 'Corte lateral 3/4: Você tenta abraçar o pintinho redondo; ele dá um pulo e derruba Você na grama!',
      sfx: ['boing', 'thud']
    },
    {
      id: 'b4_bicando',
      label: '4. Acorda Bicando Tudo (9.6s)',
      time: 9.6,
      end: 14.0,
      tag: '🌽 DUPLO SENTIDO #3',
      wordPop: 'ACORDA BICANDO! 🌽',
      wordColor: '#fb923c',
      speaker: 'Você',
      line: 'E seis da manhã ele já acorda em pé, enorme e bicando tudo o que vê pela frente!',
      subtext: 'Contra-plongée: Pintinho gigante marcha orgulhoso bicando milho e até a chinela do Você!',
      sfx: ['peck', 'peck', 'chick_chirp']
    },
    {
      id: 'b5_vizinha',
      label: '5. A Vizinha na Cerca (14.0s)',
      time: 14.0,
      end: 17.8,
      tag: '😱 TESTEMUNHA EM CHOQUE',
      wordPop: 'A VIZINHA VIU?! 😱',
      wordColor: '#f43f5e',
      speaker: 'Você + Paçoca',
      line: 'A vizinha até gritou da cerca ontem: "Nossa, que pinto enorme e amarelo!" E o Paçoca não para de latir!',
      subtext: 'Pan rápido para a cerca mostrando Camila boquiaberta (shocked) e Paçoca latindo olhando pra cima!',
      sfx: ['gasp', 'bark']
    },
    {
      id: 'b6_cta',
      label: '6. Caos Final & Pergunta (17.8s)',
      time: 17.8,
      end: 22.5,
      tag: '💬 COMENTA AÍ!',
      wordPop: 'FAZIA CARINHO? 👇🐥',
      wordColor: '#4ade80',
      speaker: 'Você',
      line: 'PIUUU! — E aí… você teria coragem de fazer carinho no meu pinto gigante? Comenta aqui!',
      subtext: 'Pintinho corre atrás do milho em cima da câmera com chuva de penas douradas + pergunta nos comentários.',
      sfx: ['chick_chirp_big', 'ding']
    }
  ],
  wordplaySchema: {
    anchor: 'Pinto Gigante',
    misdirection: 'Insinuação adulta imediata nos primeiros 2 segundos sem contexto visual',
    payoff: 'Pintinho de galinha gigante, fofo e desastrado comendo milho no quintal',
    escalations: [
      { word: 'segurar firme com as duas mãos', literalAction: 'Abraçar o pintinho pesado e gordo que escapa pulando' },
      { word: 'acorda em pé e bicando tudo', literalAction: 'Pintinho hiperativo às 6h da manhã bicando o balde de milho' },
      { word: 'vizinha gritou: que pinto enorme', literalAction: 'Dona Camila olhando por cima da cerca do quintal' },
      { word: 'fazer carinho no meu pinto gigante', literalAction: 'CTA cômico de engajamento seguro para YouTube Shorts' }
    ]
  }
};
