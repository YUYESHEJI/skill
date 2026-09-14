---
name: open-llm-vtuber
description: >-
  Compañero de voz con avatar Live2D: conversación en tiempo real con LLMs,
  percepción visual, multi-LLM/TTS/ASR y modo mascota de escritorio.
---

# Open-LLM-VTuber — Compañero de Voz IA

## URL

https://github.com/Open-LLM-VTuber/Open-LLM-VTuber

## Categoría

ia (companion IA / voz / avatar)

## Qué hace

Open-LLM-VTuber es un compañero de IA con interacción por voz en tiempo real y
avatar Live2D. Puede funcionar completamente offline en un equipo local.

## Características principales

- 🖥️ **Multiplataforma**: macOS, Linux y Windows.
- 🎤 **Voz en tiempo real**: conversación por voz sin auriculares; la IA evita
  escuchar su propia salida.
- 👁️ **Percepción visual**: cámara, grabación de pantalla y capturas de pantalla.
- 🫱 **Respuesta al tacto**: interacción mediante clics y arrastres.
- 😊 **Expresiones Live2D**: mapeo de emociones controlado por el backend.
- 🐱 **Modo mascota**: fondo transparente, siempre visible y con opción
  click-through.
- 💭 **Pensamientos internos**: ver pensamientos de la IA sin que los pronuncie.
- 🗣️ **Habla proactiva**: la IA puede iniciar una conversación.
- 💾 **Persistencia del chat**: historial de conversaciones.

## Modelos soportados

- **LLM**: Ollama, OpenAI, Gemini, Claude, Mistral, DeepSeek, GGUF, LM Studio,
  vLLM y otros.
- **ASR**: sherpa-onnx, FunASR, Faster-Whisper, Whisper.cpp, Groq Whisper,
  Azure y otros.
- **TTS**: sherpa-onnx, pyttsx3, MeloTTS, Coqui-TTS, GPTSoVITS, Bark, CosyVoice,
  Edge TTS y otros.

## Casos de uso

1. **Compañero personal**: asistente de voz con avatar visual.
2. **Aprendizaje interactivo**: practicar idiomas mediante conversación por voz.
3. **Demo o prototipo**: integrar un LLM con una interfaz de voz.
4. **Productividad**: asistente de escritorio con percepción visual.
5. **IA local**: funcionamiento local cuando los modelos y servicios también
   están instalados localmente.

## Snippets útiles

### Deploy con Docker

```bash
docker run -p 7860:7860 open-llm-vtuber/open-llm-vtuber
```

### Configurar LLM local con Ollama

```yaml
# config.yaml
llm:
  provider: ollama
  model: llama3
  base_url: http://localhost:11434
```

### Configurar TTS con sherpa-onnx

```yaml
tts:
  provider: sherpa-onnx
  model: vits-piper-es
```

### Desktop Pet Mode

```bash
# Iniciar en modo desktop pet con fondo transparente
python main.py --pet-mode
```

## Cómo integrarlo

- **Docker**: utilizar la imagen oficial de Docker Hub.
- **Local**: ejecutar Python y configurar los módulos mediante YAML.
- **API**: utilizar la interfaz web con WebSocket para voz en tiempo real.
- **Modular**: heredar la interfaz `Agent` para integrar una arquitectura propia.

## Pitfalls y límites

- La versión 2.0 está en desarrollo y es un rewrite completo; la versión 1
  puede seguir funcionando, pero conserva bugs conocidos.
- Para uso remoto, el acceso al micrófono requiere HTTPS porque la Web Audio API
  necesita un contexto seguro.
- La memoria a largo plazo fue retirada temporalmente durante el desarrollo de
  la versión 2.
- El micrófono requiere HTTPS o `localhost`.
- La importación de modelos Live2D personalizados requiere configuración manual.
- "Offline" solo es aplicable cuando el LLM, ASR, TTS y modelos necesarios
  están instalados localmente; proveedores remotos siguen necesitando red.

## Reglas de uso para el agente

1. Antes de iniciar Docker, Ollama, un servidor local o cualquier otro proceso,
   explicar qué proceso se iniciará y qué puerto utilizará.
2. Antes de acceder a cámara, micrófono o pantalla, pedir confirmación explícita
   para esa acción concreta.
3. No guardar API keys, tokens, cookies ni credenciales en notas, prompts,
   archivos de configuración compartidos o registros.
4. No afirmar que el sistema funciona completamente offline si se está usando
   un proveedor remoto como OpenAI, Gemini, Claude, Groq o Azure.
5. Verificar que la configuración, el modelo y la plataforma sean compatibles
   antes de ejecutar comandos.

## Fecha de descubrimiento

2026-06-05

## Proveniencia de esta instalación

La ruta de GitHub indicada por SkillsMP (`Ntizar/koldo`) no estaba accesible
durante la instalación. Esta copia se reconstruyó desde el único archivo que
SkillsMP mostraba en su página, `SKILL.md`; no se verificó contra el repositorio
original. Para actualizarla en el futuro, primero hay que confirmar una fuente
GitHub accesible y comparar el contenido.
