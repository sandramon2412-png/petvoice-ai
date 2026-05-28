// AI analysis service — uses OpenAI GPT-4o or Claude 3.5 Sonnet
// Configure your API key in a .env file: EXPO_PUBLIC_OPENAI_API_KEY or EXPO_PUBLIC_ANTHROPIC_KEY

const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";
const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_KEY || "";

const POSTURE_LABELS = {
  relajado: "postura relajada, cuerpo suelto",
  alerta: "postura alerta, orejas erguidas, cuerpo tenso",
  arqueado: "espalda arqueada, pelo erizado",
  sentado: "sentado tranquilamente",
  tumbado: "tumbado de lado o boca abajo",
  jugueton: "postura lúdica, cuartos traseros elevados",
};

const ENV_LABELS = {
  llegada: "llegada del dueño a casa",
  comida: "hora de la comida",
  extrano: "presencia de extraños o ruido repentino",
  juego: "sesión de juego activo",
  descanso: "ambiente tranquilo de descanso",
};

function buildPrompt(species, name, posture, environment, audioDescription) {
  const postureText = POSTURE_LABELS[posture] || posture;
  const envText = ENV_LABELS[environment] || environment;

  return `Eres un etólogo experto en comunicación animal. Analiza el siguiente sonido de ${species} llamado ${name}.

DATOS CONTEXTUALES:
- Especie: ${species}
- Nombre: ${name}
- Postura corporal observada: ${postureText}
- Contexto/estímulo: ${envText}
- Descripción del audio: ${audioDescription || "sonido grabado por el dueño"}

INSTRUCCIONES:
Realiza una validación cruzada entre el audio, la postura corporal y el contexto para determinar el estado emocional con alta precisión.

Responde ÚNICAMENTE con este JSON exacto, sin texto adicional:
{
  "emocion_principal": "Feliz|Alerta|Estresado|Curioso|Hambriento|Juguetón|Asustado|Tranquilo",
  "porcentaje_confianza": <número entre 60 y 98>,
  "color_interfaz": "#10B981|#F59E0B|#EF4444|#6366F1|#F97316|#8B5CF6|#DC2626|#64748B",
  "traduccion_humana": "<frase en primera persona, 10-20 palabras, como si el animal hablara>",
  "consejo_propietario": "<consejo breve y accionable para el dueño, 15-25 palabras>",
  "keyword_publicidad": "<palabra clave relevante para AdSense: comida_mascotas|veterinario|juguetes|bienestar_animal|adiestramiento>"
}

MAPA DE COLORES:
- Feliz, Juguetón → #10B981 (verde)
- Alerta, Curioso → #F59E0B (amarillo/ámbar)
- Estresado, Asustado → #EF4444 (rojo)
- Tranquilo → #64748B (gris azulado)
- Hambriento → #F97316 (naranja)

IMPORTANTE: Escribe SIEMPRE en español correcto con todas las tildes ortográficas (á, é, í, ó, ú, ü, ñ). Nunca omitas acentos. Ejemplos obligatorios: "incómodo", "quédate", "estrés", "también", "más", "está", "así", "difícil", "cariño".`;
}

export async function analyzeWithOpenAI(species, name, posture, environment, audioDescription) {
  if (!OPENAI_KEY) throw new Error("No EXPO_PUBLIC_OPENAI_API_KEY configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 300,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: buildPrompt(species, name, posture, environment, audioDescription),
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI error ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  return parseAIResponse(text);
}

export async function analyzeWithClaude(species, name, posture, environment, audioDescription) {
  if (!ANTHROPIC_KEY) throw new Error("No EXPO_PUBLIC_ANTHROPIC_KEY configured");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: buildPrompt(species, name, posture, environment, audioDescription),
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text?.trim();
  return parseAIResponse(text);
}

function parseAIResponse(text) {
  if (!text) throw new Error("Respuesta vacía del AI");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("El AI no devolvió JSON válido");

  try {
    const result = JSON.parse(jsonMatch[0]);
    // Validate required fields
    if (!result.emocion_principal || !result.traduccion_humana) {
      throw new Error("JSON incompleto del AI");
    }
    return result;
  } catch (e) {
    throw new Error("No se pudo parsear la respuesta del AI");
  }
}

// Main entry point — tries OpenAI first, falls back to Claude
export async function analyzeSound(species, name, posture, environment, audioDescription) {
  if (OPENAI_KEY) {
    return analyzeWithOpenAI(species, name, posture, environment, audioDescription);
  }
  if (ANTHROPIC_KEY) {
    return analyzeWithClaude(species, name, posture, environment, audioDescription);
  }
  // Demo mode — no API key configured
  return getDemoResult(species, posture, environment);
}

function getDemoResult(species, posture, environment) {
  const demos = {
    Feliz: {
      emocion_principal: "Feliz",
      porcentaje_confianza: 91,
      color_interfaz: "#10B981",
      traduccion_humana: "¡Estoy tan contento de verte! Eres mi persona favorita en el mundo.",
      consejo_propietario: "Tu mascota está muy feliz. Refuerza este momento con una caricia o un juguete.",
      keyword_publicidad: "bienestar_animal",
    },
    Alerta: {
      emocion_principal: "Alerta",
      porcentaje_confianza: 78,
      color_interfaz: "#F59E0B",
      traduccion_humana: "Hay algo ahí afuera. No sé si es peligroso, pero lo estoy vigilando.",
      consejo_propietario: "Tu mascota detectó algo inusual. Tranquilízala con voz suave y contacto físico.",
      keyword_publicidad: "adiestramiento",
    },
    Estresado: {
      emocion_principal: "Estresado",
      porcentaje_confianza: 85,
      color_interfaz: "#EF4444",
      traduccion_humana: "Me siento incómodo y necesito tu ayuda. Por favor quédate cerca.",
      consejo_propietario: "Señales de estrés detectadas. Aleja de la fuente de estrés y ofrece un espacio seguro.",
      keyword_publicidad: "veterinario",
    },
    Tranquilo: {
      emocion_principal: "Tranquilo",
      porcentaje_confianza: 88,
      color_interfaz: "#64748B",
      traduccion_humana: "Estoy bien, descansando tranquilo. No me molestes demasiado, ¿vale?",
      consejo_propietario: "Tu mascota está relajada. Es un buen momento para compartir espacio sin exigencias.",
      keyword_publicidad: "bienestar_animal",
    },
    Hambriento: {
      emocion_principal: "Hambriento",
      porcentaje_confianza: 82,
      color_interfaz: "#F97316",
      traduccion_humana: "¡Tengo mucha hambre! ¿No es ya la hora de comer? Llevo rato esperando.",
      consejo_propietario: "Tu mascota pide comida. Verifica si está dentro del horario regular de alimentación.",
      keyword_publicidad: "comida_mascotas",
    },
    Curioso: {
      emocion_principal: "Curioso",
      porcentaje_confianza: 74,
      color_interfaz: "#F59E0B",
      traduccion_humana: "¿Qué es eso? Huelo algo diferente y necesito investigarlo bien.",
      consejo_propietario: "Tu mascota está explorando activamente su entorno. Permítele investigar con seguridad.",
      keyword_publicidad: "juguetes",
    },
  };

  const keys = Object.keys(demos);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return Promise.resolve(demos[randomKey]);
}
