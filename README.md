# Motions - Pipeline de Vídeo 3D Automatizado

Sistema para geração automatizada de vídeos curtos de curiosidades em 3D usando Blender + Python.

## Requisitos
- Blender 4.x (instalado e acessível via CLI)
- Python 3.10+ (incluso no Blender)

## Estrutura
```
motions/
├── src/           # Módulos do pipeline
├── assets/        # Texturas, HDRI, sons
├── output/        # Renders finais
├── scripts/       # Scripts utilitários
└── config.yaml    # Configurações globais
```

## Uso
```bash
blender --background --python src/main.py -- --scene curiosity_01
```