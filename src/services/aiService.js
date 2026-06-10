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
  llegada:  "llegada del dueño a casa",
  comida:   "hora de la comida",
  extrano:  "presencia de extraños o ruido repentino",
  juego:    "sesión de juego activo",
  descanso: "ambiente tranquilo de descanso",
};

const SPECIES_CONTEXT = {
  dog: `El perro se comunica principalmente mediante ladridos (cortos=alerta, repetitivos=excitación, graves=amenaza),
gemidos (ansiedad, dolor, solicitud), gruñidos (advertencia, juego), y aullidos (soledad, respuesta a sonidos).
La cola, las orejas y la postura corporal complementan el sonido.`,
  cat: `El gato se comunica mediante maullidos (principalmente dirigidos a humanos, tono alto=urgencia, suave=saludo),
ronroneo (satisfacción, pero también dolor o estrés), chirridos y trinos (excitación ante presas),
bufidos y gruñidos (miedo, agresión). Los gatos vocalizan mucho menos entre ellos que con humanos.`,
};

function buildPrompt(species, name, posture, environment) {
  const speciesEs = species === "cat" ? "gato" : "perro";
  return `Eres un etólogo experto en comportamiento animal. Analiza el sonido de un ${speciesEs} llamado ${name}.

CONOCIMIENTO ESPECIE:
${SPECIES_CONTEXT[species] || SPECIES_CONTEXT.dog}

POSTURA OBSERVADA: ${POSTURE_LABELS[posture] || posture}
CONTEXTO: ${ENV_LABELS[environment] || environment}

Teniendo en cuenta las características vocales específicas del ${speciesEs}, responde ÚNICAMENTE con este JSON:
{"emocion_principal":"Feliz|Alerta|Estresado|Curioso|Hambriento|Juguetón|Asustado|Tranquilo","porcentaje_confianza":<60-98>,"color_interfaz":"#10B981|#F59E0B|#EF4444|#6366F1|#F97316|#8B5CF6|#DC2626|#64748B","traduccion_humana":"<frase en primera persona desde perspectiva del ${speciesEs}, 10-20 palabras>","consejo_propietario":"<consejo específico para dueño de ${speciesEs}, 15-25 palabras>","keyword_publicidad":"comida_mascotas|veterinario|juguetes|bienestar_animal|adiestramiento"}
COLORES: Feliz/Juguetón=#10B981 | Alerta/Curioso=#F59E0B | Estresado/Asustado=#EF4444 | Tranquilo=#64748B | Hambriento=#F97316`;
}

const EMOTION_NORMALIZE = { "Jugueton": "Juguetón" };

function parseAIResponse(text) {
  if (!text) throw new Error("Respuesta vacía del AI");
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("El AI no devolvió JSON válido");
  const result = JSON.parse(m[0]);
  if (!result.emocion_principal) throw new Error("JSON incompleto");
  result.emocion_principal = EMOTION_NORMALIZE[result.emocion_principal] || result.emocion_principal;
  return result;
}

// Demo results diferenciados por especie
const DEMOS_DOG = [
  { emocion_principal: "Feliz",      porcentaje_confianza: 91, color_interfaz: "#10B981", traduccion_humana: "¡Estoy tan contento de verte! Eres mi persona favorita, ¡guau!", consejo_propietario: "Tu perro está eufórico. Refuerza con caricias y un juego breve.", keyword_publicidad: "bienestar_animal" },
  { emocion_principal: "Alerta",     porcentaje_confianza: 78, color_interfaz: "#F59E0B", traduccion_humana: "Hay algo ahí afuera. No sé si es peligroso pero lo estoy vigilando.", consejo_propietario: "Tu perro detectó algo inusual. Tranquilízalo con voz firme y calmada.", keyword_publicidad: "adiestramiento" },
  { emocion_principal: "Estresado",  porcentaje_confianza: 85, color_interfaz: "#EF4444", traduccion_humana: "Me siento solo e incómodo. Por favor no me dejes tanto tiempo solo.", consejo_propietario: "Posible ansiedad por separación. Considera juguetes de estimulación mental.", keyword_publicidad: "veterinario" },
  { emocion_principal: "Juguetón",   porcentaje_confianza: 93, color_interfaz: "#10B981", traduccion_humana: "¡Quiero jugar! ¡Lánzame la pelota, ven, persígueme, es muy divertido!", consejo_propietario: "Tu perro tiene mucha energía acumulada. Dedica 20 min de juego activo.", keyword_publicidad: "juguetes" },
  { emocion_principal: "Hambriento", porcentaje_confianza: 88, color_interfaz: "#F97316", traduccion_humana: "¡Ya es hora de comer! Mi tazón lleva un rato vacío y lo sabes.", consejo_propietario: "Mantén horarios fijos de comida para evitar ansiedad alimentaria en perros.", keyword_publicidad: "comida_mascotas" },
  { emocion_principal: "Asustado",   porcentaje_confianza: 82, color_interfaz: "#8B5CF6", traduccion_humana: "Ese ruido fuerte me asustó mucho. Necesito que te quedes cerca de mí.", consejo_propietario: "Crea un refugio seguro para tu perro. Evita reforzar el miedo con lástima.", keyword_publicidad: "veterinario" },
  { emocion_principal: "Tranquilo",  porcentaje_confianza: 76, color_interfaz: "#64748B", traduccion_humana: "Estoy muy relajado y a gusto a tu lado. Este momento es perfecto.", consejo_propietario: "Tu perro está en paz. Buen momento para el vínculo con caricias suaves.", keyword_publicidad: "bienestar_animal" },
  { emocion_principal: "Curioso",    porcentaje_confianza: 74, color_interfaz: "#6366F1", traduccion_humana: "¿Qué es ese olor tan raro? Nunca lo había detectado. Quiero investigar.", consejo_propietario: "Permite que olfatee y explore. El olfato es vital para el bienestar canino.", keyword_publicidad: "juguetes" },
];

const DEMOS_CAT = [
  { emocion_principal: "Feliz",      porcentaje_confianza: 88, color_interfaz: "#10B981", traduccion_humana: "Estoy ronroneando porque me siento seguro y feliz a tu lado.", consejo_propietario: "El ronroneo fuerte indica satisfacción. Tu gato está muy vinculado contigo.", keyword_publicidad: "bienestar_animal" },
  { emocion_principal: "Hambriento", porcentaje_confianza: 92, color_interfaz: "#F97316", traduccion_humana: "¡Maullando para que me des comida! Sé perfectamente que me entiendes.", consejo_propietario: "Los gatos maúllan estratégicamente para conseguir comida. Mantén horarios fijos.", keyword_publicidad: "comida_mascotas" },
  { emocion_principal: "Alerta",     porcentaje_confianza: 80, color_interfaz: "#F59E0B", traduccion_humana: "Hay un pájaro en la ventana. Ese sonido que hago es mi instinto cazador.", consejo_propietario: "El chirrido es instintivo ante presas. Ofrece juguetes que simulen caza.", keyword_publicidad: "juguetes" },
  { emocion_principal: "Estresado",  porcentaje_confianza: 86, color_interfaz: "#EF4444", traduccion_humana: "Este ambiente me pone nervioso. Necesito un espacio tranquilo solo mío.", consejo_propietario: "Los gatos necesitan zonas de refugio elevadas. Reduce estímulos en el entorno.", keyword_publicidad: "veterinario" },
  { emocion_principal: "Juguetón",   porcentaje_confianza: 90, color_interfaz: "#10B981", traduccion_humana: "¡Quiero cazar ese juguete! Tengo mucha energía y necesito liberarla ahora.", consejo_propietario: "Dos sesiones de juego de 10 min al día reducen el estrés y el aburrimiento felino.", keyword_publicidad: "juguetes" },
  { emocion_principal: "Asustado",   porcentaje_confianza: 84, color_interfaz: "#8B5CF6", traduccion_humana: "Ese ruido extraño me aterrorizó. Me voy a esconder hasta que pase.", consejo_propietario: "Nunca fuerces a un gato asustado a salir. Dale tiempo y espacio en su refugio.", keyword_publicidad: "veterinario" },
  { emocion_principal: "Tranquilo",  porcentaje_confianza: 79, color_interfaz: "#64748B", traduccion_humana: "Estoy en mi sitio favorito, relajado. Todo está bien en mi territorio.", consejo_propietario: "Un gato tranquilo es un gato seguro. Mantén su rutina y territorio estable.", keyword_publicidad: "bienestar_animal" },
  { emocion_principal: "Curioso",    porcentaje_confianza: 75, color_interfaz: "#6366F1", traduccion_humana: "Algo nuevo en mi territorio. Debo investigarlo y decidir si es amenaza.", consejo_propietario: "Los gatos necesitan explorar novedades a su ritmo. No lo interrumpas.", keyword_publicidad: "juguetes" },
];

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
  // Demo mode — resultados diferenciados por especie
  const demos = species === "cat" ? DEMOS_CAT : DEMOS_DOG;
  return Promise.resolve(demos[Math.floor(Math.random() * demos.length)]);
}
