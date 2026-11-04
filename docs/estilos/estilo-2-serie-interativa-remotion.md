# Estilo 2: Série Interativa Narrada em 2ª Pessoa (Método Edu Dark / "Você Decide o Fim")

## 1. Origem e Análise do Método
Baseado no estudo aprofundado do fluxo de produção de séries virais com IA/Remotion documentado por Edu Dark (criador de *"Trancados"* e referência em canais de animação gerados via código):
- **Formato:** Vídeos verticais curtos (9:16), entre 60 e 90 segundos.
- **Narrativa:** Estritamente em **2ª pessoa** (*"Você acorda...", "Você olha pela janela...", "Você escuta..."*). O espectador é colocado diretamente no papel do protagonista.
- **Mecânica do Algoritmo:** Cada episódio é um "Dia" de sobrevivência e termina travando numa escolha binária de alto risco (**Opção 1 vs Opção 2**). O comentário mais votado decide o rumo do episódio seguinte.
- **Efeito Duplo de Retenção:**
  1. Milhares de comentários no vídeo (sinal forte de engajamento para a entrega do algoritmo no TikTok, Reels, Shorts e Facebook).
  2. Retorno garantido do espectador no dia seguinte para conferir se a escolha dele venceu.

---

## 2. As Regras de Ouro Técnicas

### ⚠️ Regra 1: Nunca peça "Faça igual", peça uma Tabela Comparativa
Se você apenas diz ao agente "assiste e faz igual", ele inventa e comete erros graves. A abordagem profissional é solicitar um estudo minucioso:
- Extrair 1 quadro por segundo.
- Contar número exato de cortes (ex: 9 cortes em 90 segundos — câmera desliza suavemente em vez de cortes secos a cada 2 segundos).
- Mapear a dinâmica de áudio: volume, graves e momentos de **silêncio absoluto**.
- Protagonista na tela: em vez de apenas uma mão flutuante em 1ª pessoa, o corpo do protagonista deve aparecer (deitado, levantando, reagindo de costas ou perfil).

### 📖 Regra 2: A Bíblia da Série (World & Continuity Bible)
Público que vota tem memória fotográfica. Para evitar furos de roteiro:
- Documento único contendo a linha do tempo dia a dia.
- Localização exata de cada personagem e de cada objeto-chave (chaves, lanternas, trancas, armas).
- Uma **Regra de Sobrevivência Nova** revelada por episódio (Regra 1, Regra 2, etc.).
- O agente **lê obrigatoriamente a Bíblia antes de escrever qualquer nova linha de roteiro**.

### 🎬 Regra 3: Construção em Peças no Remotion
- Nada de gerador de vídeo genérico com IA instável.
- Personagens desenhados em peças modulares (cabeça, tronco, braços, pernas, expressões).
- Câmera contínua com interpolação suave (panning/zoom lento).
- Divisão em dois agentes em paralelo para acelerar o render sem conflito de arquivos.

### 🔊 Regra 4: Sound Design Cirúrgico
- **Silêncio total** de 1 a 2 segundos antes de cada susto ou revelação.
- **Sub-grave (bass drop)** apenas no impacto real (nunca zumbindo o tempo todo).
- Efeitos sonoros sutis em cada interação física (passo na água, trinco rangendo, clique da lanterna).
- Vozes clonadas personalizadas para cada personagem com nome na legenda.

---

## 3. Prompts Oficiais do Método

### 📌 Prompt 1: Engenharia Reversa da Referência (Auditoria em Tabela)
```text
Analise o vídeo de referência frame a frame e não faça nada ainda.
Extraia os seguintes dados estruturados e me devolva uma TABELA COMPARATIVA:
1. Duração total e contagem exata de cortes de câmera.
2. Ritmo visual: segundos médios por tomada e tipos de movimento de câmera.
3. Posicionamento do protagonista: em quais momentos o corpo dele aparece e qual a proporção na tela.
4. Mapeamento de áudio: onde ocorrem silêncios absolutos, onde o grave entra e volume da trilha de fundo vs voz.
5. Ponto exato do gancho final (quantos segundos antes do fim o dilema é apresentado).
```

### 📌 Prompt 2: Criação e Validação da Bíblia da Série
```text
Crie a BÍBLIA DA SÉRIE para o projeto [NOME DA SÉRIE].
A estrutura deve conter:
- Premissa e Contagem Regressiva: [Ex: Faltam 30 dias para o resgate].
- Protagonista (Você): Profissão, limitações físicas e psicológicas.
- Elenco Secundário: 3 a 4 personagens com maneirismos únicos e falhas humanas.
- O Inimigo/Ameaça: Regras estritas do que a ameaça pode e não pode fazer.
- Linha do Tempo e Inventário: Onde cada chave, ferramenta e recurso está em cada dia.
- Livro de Regras de Sobrevivência: Regra 1 até a Regra do episódio atual.
Antes de escrever qualquer episódio, verifique se alguma ação viola as regras anteriores.
```

### 📌 Prompt 3: Roteirização em 2ª Pessoa com Retenção Viral
```text
Escreva o roteiro do Dia [X] em 2ª pessoa ("Você...").
Tempo total: 70 a 85 segundos.
Estrutura obrigatória:
- [0-3s] Hook Imediato: Consequência da votação do dia anterior e perigo iminente.
- [3-25s] Ação de Sobrevivência: Protagonista e personagens executando o plano com tensão crescente.
- [25-50s] O Imprevisto / Descoberta: Algo quebra, uma nova regra da ameaça é revelada.
- [50-65s] O Clímax / Ponto Sem Retorno: Silêncio súbito seguido por impacto.
- [65-80s] O Dilema Binário: Pare a cena exatamente no momento crítico.
Apresente:
- OPÇÃO 1: [Ação arriscada com benefício claro]
- OPÇÃO 2: [Ação cautelosa com custo pesado]
Finalize com a chamada: "A maioria nos comentários decide o Dia [X+1]. Escolha agora."
```
