/**
 * Cliente Oficial Streaming para API Kodeo (https://api.kodeo.com.br)
 */
export async function generateWithKodeoStream({ model = 'claude-haiku-5.5', prompt, max_tokens = 3500 }) {
  const apiKey = 'ck_2ca416bf4acf20572d20ae137e2df3075e94e8f6cc6298a0';
  console.log(`📡 Conectando à API Kodeo (${model}) [Streaming Ativo]...`);

  const res = await fetch('https://api.kodeo.com.br/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens,
      stream: true,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    throw new Error(`Erro na Kodeo HTTP ${res.status}: ${await res.text()}`);
  }

  let fullText = '';
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Mantém linha incompleta no buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (jsonStr === '[DONE]') break;
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.text) {
          fullText += parsed.delta.text;
          process.stdout.write(parsed.delta.text);
        }
      } catch (err) {
        // Ignora keep-alives ou chunks parciais
      }
    }
  }

  console.log(`\n✅ Resposta recebida da Kodeo com sucesso (${fullText.length} caracteres)!`);
  return fullText.replace(/^```(?:javascript|js)?\n/i, '').replace(/\n```$/, '');
}
