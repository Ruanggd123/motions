import asyncio
import os
import edge_tts

VOICE_NARRATOR = "pt-BR-AntonioNeural"
VOICE_BIA = "pt-BR-FranciscaNeural"
VOICE_TIAO = "pt-BR-AntonioNeural"

LINES = [
    {
        "id": "fala_01_hook",
        "voice": VOICE_NARRATOR,
        "rate": "+0%",
        "pitch": "-4Hz",
        "text": "Faltam 30 dias para o resgate chegar... Se é que tem alguém vivo lá em cima."
    },
    {
        "id": "fala_02_bloqueio",
        "voice": VOICE_NARRATOR,
        "rate": "+2%",
        "pitch": "-2Hz",
        "text": "Às três e catorze da manhã, a Estação Central lacrou tudo. Nenhuma catraca gira. Nenhuma escada rolante sobe. E no rádio da cabine, um aviso militar repete em loop: quarentena biológica na superfície."
    },
    {
        "id": "fala_03_bia",
        "voice": VOICE_BIA,
        "rate": "+5%",
        "pitch": "+0Hz",
        "text": "Eu peguei doze garrafas de água no quiosque e as ataduras. Mas o sinal do celular sumiu de todo mundo!"
    },
    {
        "id": "fala_04_tiao",
        "voice": VOICE_TIAO,
        "rate": "-3%",
        "pitch": "-6Hz",
        "text": "Os acessos da rua têm tranca hidráulica blindada. Só abre pelo comando central lá em cima... que agora tá em silêncio total."
    },
    {
        "id": "fala_05_susto",
        "voice": VOICE_NARRATOR,
        "rate": "-2%",
        "pitch": "-3Hz",
        "text": "O arrepio corre pelas suas costas. Essa voz nos trilhos... é da dona Irene, a faxineira... que foi embora no último trem da meia-noite."
    },
    {
        "id": "fala_06_dilema",
        "voice": VOICE_NARRATOR,
        "rate": "+2%",
        "pitch": "-2Hz",
        "text": "Se ficarmos no escuro total, nada nos protege. Você é o técnico da estação e precisa decidir o que a gente faz agora. Comente: Opção 1 para ligar o gerador da subestação, ou Opção 2 para recuar pro duto de ventilação 3. Escolha agora!"
    }
]

async def main():
    out_dir = r"c:\Users\Ruan Gomes\Desktop\projetos\motions\motions\series\subterraneo-404\audio"
    os.makedirs(out_dir, exist_ok=True)
    print("Gerando arquivos de áudio via EdgeTTS...")
    for item in LINES:
        path = os.path.join(out_dir, f"{item['id']}.mp3")
        communicate = edge_tts.Communicate(item["text"], item["voice"], rate=item["rate"], pitch=item["pitch"])
        await communicate.save(path)
        print(f"Salvo: {item['id']}.mp3 ({os.path.getsize(path)} bytes)")
    print("Todos os áudios gerados com sucesso!")

if __name__ == "__main__":
    asyncio.run(main())
