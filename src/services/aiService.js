const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";
const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_KEY || "";

const POSTURE_LABELS = {
  relajado: "postura relajada, cuerpo suelto",
  alerta:   "postura alerta, orejas erguidas, cuerpo tenso",
  arqueado: "espalda arqueada, pelo erizado",
  sentado:  "sentado tranquilamente",
  tumbado:  "tumbado de lado o boca abajo",
  jugueton: "postura ludica, cuartos traseros elevados",
  sumiso:   "postura sumisa, cola baja",
};

const ENV_LABELS = {
  llegada:  "llegada del duenio a casa",
  comida:   "hora de la comida",
  extrano:  "presencia de extranos o ruido repentino",
  juego:    "sesion de juego activo",
  descanso: "ambiente tranquilo de descanso",
};

function buildPrompt(species, name, posture, environment) {
  return `Eres un etologo experto en comunicacion animal. Analiza el sonido de ${species} llamado ${name}.
POSTURA: ${POSTURE_LABELS[posture] || posture}
CONTEXTO: ${ENV_LABELS[environment] || environment}
Responde UNICAMENTE con este JSON:
{"emocion_principal":"Feliz|Alerta|Estresado|Curioso|Hambriento|Jugueton|Asustado|Tranquilo","porcentaje_confianza":<60-98>,"color_interfaz":"#10B981|#F59E0B|#EF4444|#6366F1|#F97316|#8B5CF6|#DC2626|#64748B","traduccion_humana":"<frase primera persona 10-20 palabras>","consejo_propietario":"<consejo breve 15-25 palabras>","keyword_publicidad":"comida_mascotas|veterinario|juguetes|bienestar_animal|adiestramiento"}
COLORES: Feliz/Jugueton=#10B981 | Alerta/Curioso=#F59E0B | Estresado/Asustado=#EF4444 | Tranquilo=#64748B | Hambriento=#F97316`;
}

function parseAIResponse(text) {
  if (!text) throw new Error("Respuesta vacia del AI");
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("El AI no devolvio JSON valido");
  const result = JSON.parse(m[0]);
  if (!result.emocion_principal) throw new Error("JSON incompleto");
  return result;
}

export async function analyzeSound(species, name, posture, environment) {
  if (OPENAI_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 300,
        temperature: 0.3,
        messages: [{ role: "user", content: buildPrompt(species, name, posture, environment) }],
      }),
    });
    const data = await res.json();
    return parseAIResponse(data.choices?.[0]?.message?.content);
  }
  if (ANTHROPIC_KEY) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: buildPrompt(species, name, posture, environment) }],
      }),
    });
    const data = await res.json();
    return parseAIResponse(data.content?.[0]?.text);
  }
  // Demo mode â€” sin API key
  const demos = [
    { emocion_principal: "Feliz", porcentaje_confianza: 91, color_interfaz: "#10B981", traduccion_humana: "Estoy tan contento de verte! Eres mi persona favorita en el mundo.", consejo_propietario: "Tu mascota esta muy feliz. Refuerza con una caricia o juguete.", keyword_publicidad: "bienestar_animal" },
    { emocion_principal: "Alerta", porcentaje_confianza: 78, color_interfaz: "#F59E0B", traduccion_humana: "Hay algo ahi afuera. No se si es peligroso pero lo estoy vigilando.", consejo_propietario: "Tu mascota detecto algo inusual. Tranquilizala con voz suave.", keyword_publicidad: "adiestramiento" },
    { emocion_principal: "Estresado", porcentaje_confianza: 85, color_interfaz: "#EF4444", traduccion_humana: "Me siento incomodo y necesito tu ayuda. Por favor quedate cerca.", consejo_propietario: "Aleja de la fuente de estres y ofrece un espacio seguro.", keyword_publicidad: "veterinario" },
  ];
  return Promise.resolve(demos[Math.floor(Math.random() * demos.length)]);
}
