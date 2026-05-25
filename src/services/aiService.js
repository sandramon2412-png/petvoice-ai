/**
 * AI Service — PetVoice AI
 *
 * TO REPLACE WITH REAL API:
 * Replace the mock logic in analyzeAudio() with a real call to:
 *   - OpenAI Whisper (for transcription) + GPT-4o (for analysis), or
 *   - Anthropic Claude claude-sonnet-4-5 API, or
 *   - Your own backend endpoint that handles pet sound analysis
 *
 * Example real implementation:
 *   const formData = new FormData();
 *   formData.append('file', { uri: audioUri, type: 'audio/m4a', name: 'recording.m4a' });
 *   formData.append('petContext', JSON.stringify(petContext));
 *   const response = await fetch('https://api.yourbackend.com/analyze-pet-audio', {
 *     method: 'POST',
 *     headers: { 'Authorization': `Bearer ${API_KEY}` },
 *     body: formData,
 *   });
 *   return await response.json();
 */

const EMOTION_PROFILES = {
  dog: [
    {
      emocion: 'Felicidad',
      color_alerta: 'Verde',
      traduccion:
        '¡Estoy contentísimo de verte! Eres mi persona favorita en el mundo entero. ¿Podemos jugar? ¡Por favor, por favor, POR FAVOR!',
      consejo_veterinario:
        'Tu perro está en su mejor estado emocional. Este es el momento ideal para reforzar comportamientos positivos con premios o juego.',
      sugerencia_anuncio: 'juguete',
    },
    {
      emocion: 'Ansiedad',
      color_alerta: 'Amarillo',
      traduccion:
        'Me siento un poco nervioso... ¿Puedes quedarte cerca de mí? Cuando estás aquí todo parece más seguro y tranquilo.',
      consejo_veterinario:
        'Los perros ansiosos se benefician de rutinas estables. Considera un espacio seguro como una cama o kennel propio. Si persiste, consulta a tu veterinario.',
      sugerencia_anuncio: 'paseo',
    },
    {
      emocion: 'Hambre',
      color_alerta: 'Verde',
      traduccion:
        '¡Mi estómago está hablando! Ya sé que me miras con esos ojos tiernos, pero en serio... ¿es hora de comer? Huelo algo rico.',
      consejo_veterinario:
        'Mantén horarios fijos de alimentación. Los perros adultos generalmente comen 2 veces al día. Evita variar mucho los horarios.',
      sugerencia_anuncio: 'comida',
    },
    {
      emocion: 'Alerta',
      color_alerta: 'Amarillo',
      traduccion:
        '¡Espera, espera! Hay algo ahí afuera. Puede ser el cartero, un gato o... no sé, pero algo pasa. ¡Estoy en modo guardia!',
      consejo_veterinario:
        'El comportamiento de alerta es natural, pero si es excesivo puede ser estresante. Socialización temprana y ejercicio diario ayudan a regularlo.',
      sugerencia_anuncio: 'paseo',
    },
    {
      emocion: 'Dolor',
      color_alerta: 'Rojo',
      traduccion:
        'Me duele algo y no sé cómo decírtelo. Por favor, presta atención a cómo me muevo y cómo me porto. Necesito que me ayudes.',
      consejo_veterinario:
        'ATENCIÓN: Las vocalizaciones de dolor requieren evaluación veterinaria inmediata. No ignores este tipo de señales. Revisa si hay heridas visibles.',
      sugerencia_anuncio: 'comida',
    },
  ],
  cat: [
    {
      emocion: 'Satisfacción',
      color_alerta: 'Verde',
      traduccion:
        'Hmmm... todo está exactamente como debe estar. Mi territorio en orden, mi humano presente. La vida es perfectamente aceptable.',
      consejo_veterinario:
        'Un gato satisfecho ronronea, se estira y busca contacto controlado. Respeta sus tiempos — los gatos necesitan autonomía para mantenerse saludables.',
      sugerencia_anuncio: 'juguete',
    },
    {
      emocion: 'Reclamo',
      color_alerta: 'Amarillo',
      traduccion:
        '¿Dónde has estado? Llevo horas esperando. Mi plato estaba vacío desde hace... bueno, desde hace 20 minutos, que para mí es una eternidad.',
      consejo_veterinario:
        'Los gatos son criaturas de rutina. Mantén horarios consistentes de alimentación y juego para reducir el estrés y los maullidos de reclamo.',
      sugerencia_anuncio: 'comida',
    },
    {
      emocion: 'Curiosidad',
      color_alerta: 'Verde',
      traduccion:
        '¿Qué hay en esa bolsa? ¿Y en esa caja? El mundo está lleno de misterios y yo tengo la responsabilidad de investigarlos todos. Es mi deber felino.',
      consejo_veterinario:
        'La curiosidad es signo de un gato mentalmente activo. Ofrece juguetes de enriquecimiento y escondites para explorar. Evita entornos monótonos.',
      sugerencia_anuncio: 'juguete',
    },
    {
      emocion: 'Irritación',
      color_alerta: 'Amarillo',
      traduccion:
        'Para. Ya. Te lo digo en serio. Llevo rato mandando señales y no las ves. Si sigues, ya sabes lo que pasa. No digas que no te avisé.',
      consejo_veterinario:
        'Aprende el lenguaje corporal felino: cola rígida, orejas hacia atrás, pupilas dilatadas. Respetar estas señales previene arañazos y muerde.',
      sugerencia_anuncio: 'paseo',
    },
    {
      emocion: 'Miedo',
      color_alerta: 'Rojo',
      traduccion:
        'Hay algo que me asusta mucho. No me siento seguro. Solo quiero un lugar tranquilo y esconderme hasta que pase. ¿Puedes ayudarme?',
      consejo_veterinario:
        'ATENCIÓN: Un gato aterrorizado puede volverse agresivo por defensa. Dale espacio, elimina la fuente de miedo si es posible y consulta a tu veterinario si persiste.',
      sugerencia_anuncio: 'juguete',
    },
  ],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Analyzes pet audio and returns an emotion interpretation.
 *
 * @param {string} audioUri - Local URI of the recorded audio file
 * @param {Object} petContext - Pet data { name, species, breed, age }
 * @returns {Promise<Object>} Analysis result with emotion, alert color, translation, advice and ad suggestion
 */
export const analyzeAudio = async (audioUri, petContext) => {
  // Simulate API processing time (1.5 - 2.5 seconds)
  const delay = 1500 + Math.random() * 1000;
  await sleep(delay);

  // Select profiles based on species, defaulting to dog
  const species = petContext?.species === 'cat' ? 'cat' : 'dog';
  const profiles = EMOTION_PROFILES[species];

  // Random selection weighted slightly toward positive emotions
  const weights = [0.35, 0.25, 0.2, 0.12, 0.08];
  const rand = Math.random();
  let cumulative = 0;
  let selectedIndex = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) {
      selectedIndex = i;
      break;
    }
  }

  const result = profiles[selectedIndex];
  const petName = petContext?.name || 'Tu mascota';

  return {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    petName,
    species,
    audioUri,
    emocion: result.emocion,
    color_alerta: result.color_alerta,
    traduccion: result.traduccion,
    consejo_veterinario: result.consejo_veterinario,
    sugerencia_anuncio: result.sugerencia_anuncio,
  };
};
