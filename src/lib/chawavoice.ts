export type Voice = {
  id: string;
  name: string;
  locale: string;
  language: string;
  gender: string;
  style: string;
  tone: string;
  initials: string;
  hue: string;
  characteristics: string;
  available: boolean;
  browserLocale: string;
  defaultRate: number;
  defaultPitch: number;
  defaultVolume: number;
};

const originalProfile = (voice: Omit<Voice, "available">): Voice => ({ ...voice, available: false });

export const voices: Voice[] = [
  originalProfile({ id: "detective", name: "Detective", locale: "pt-PT", language: "Português · Portugal", gender: "Masculina", style: "Misteriosa", tone: "Médio-grave · Elegante", initials: "DE", hue: "slate", characteristics: "Calmo, observador, dicção clara; ironia subtil e pausas naturais.", browserLocale: "pt-PT", defaultRate: 0.88, defaultPitch: 0.91, defaultVolume: 0.9 }),
  originalProfile({ id: "narrador", name: "Narrador", locale: "pt-PT", language: "Português · Portugal", gender: "Masculina", style: "Cinematográfica", tone: "Grave · Expressivo", initials: "NA", hue: "gold", characteristics: "Narrativa cinematográfica, grave e expressiva.", browserLocale: "pt-PT", defaultRate: 0.96, defaultPitch: 0.82, defaultVolume: 0.94 }),
  originalProfile({ id: "conversador", name: "Conversador", locale: "pt-PT", language: "Português · Portugal", gender: "Masculina", style: "Conversacional", tone: "Jovem-adulto · Natural", initials: "CO", hue: "aqua", characteristics: "Natural, próximo e descontraído.", browserLocale: "pt-PT", defaultRate: 1.03, defaultPitch: 1.04, defaultVolume: 0.92 }),
  originalProfile({ id: "documentario", name: "Documentário", locale: "pt-PT", language: "Português · Portugal", gender: "Masculina", style: "Documental", tone: "Profundo · Profissional", initials: "DO", hue: "blue", characteristics: "Profundo, sério, articulado e profissional.", browserLocale: "pt-PT", defaultRate: 0.96, defaultPitch: 0.86, defaultVolume: 0.94 }),
  originalProfile({ id: "energia", name: "Energia", locale: "pt-PT", language: "Português · Portugal", gender: "Masculina", style: "Energética", tone: "Dinâmico · Entusiasmado", initials: "EN", hue: "peach", characteristics: "Dinâmico, expressivo e entusiasmado.", browserLocale: "pt-PT", defaultRate: 1.09, defaultPitch: 1.08, defaultVolume: 0.97 }),
  originalProfile({ id: "sofia", name: "Sofia", locale: "pt-PT", language: "Português · Portugal", gender: "Feminina", style: "Natural", tone: "Suave · Articulada", initials: "SO", hue: "rose", characteristics: "Suave, articulada e natural.", browserLocale: "pt-PT", defaultRate: 0.98, defaultPitch: 1.08, defaultVolume: 0.9 }),
  originalProfile({ id: "aurora", name: "Aurora", locale: "pt-PT", language: "Português · Portugal", gender: "Feminina", style: "Documental", tone: "Madura · Confiante", initials: "AU", hue: "mint", characteristics: "Madura, confiante e profissional.", browserLocale: "pt-PT", defaultRate: 0.94, defaultPitch: 0.98, defaultVolume: 0.94 }),
  originalProfile({ id: "misterio", name: "Mistério", locale: "pt-PT", language: "Português · Portugal", gender: "Feminina", style: "Misteriosa", tone: "Calma · Dramática", initials: "MI", hue: "lilac", characteristics: "Calma, envolvente e dramática.", browserLocale: "pt-PT", defaultRate: 0.86, defaultPitch: 0.94, defaultVolume: 0.89 }),
  originalProfile({ id: "clara-br", name: "Clara Oliveira", locale: "pt-BR", language: "Português · Brasil", gender: "Feminina", style: "Conversacional", tone: "Jovem · Natural", initials: "CL", hue: "rose", characteristics: "Perfil original em português do Brasil; motor próprio necessário.", browserLocale: "pt-BR", defaultRate: 1, defaultPitch: 1, defaultVolume: 0.9 }),
  originalProfile({ id: "marcos-br", name: "Marcos Silva", locale: "pt-BR", language: "Português · Brasil", gender: "Masculina", style: "Energética", tone: "Envolvente · Natural", initials: "MS", hue: "blue", characteristics: "Perfil original em português do Brasil; motor próprio necessário.", browserLocale: "pt-BR", defaultRate: 1, defaultPitch: 1, defaultVolume: 0.9 }),
  originalProfile({ id: "ella-en", name: "Ella Brooks", locale: "en-GB", language: "Inglês", gender: "Feminina", style: "Cinematográfica", tone: "Madura · Suave", initials: "EL", hue: "lilac", characteristics: "Perfil original em inglês; motor próprio necessário.", browserLocale: "en-GB", defaultRate: 1, defaultPitch: 1, defaultVolume: 0.9 }),
  originalProfile({ id: "lucas-en", name: "Lucas Bennett", locale: "en-US", language: "Inglês", gender: "Masculina", style: "Documental", tone: "Grave · Natural", initials: "LU", hue: "aqua", characteristics: "Perfil original em inglês; motor próprio necessário.", browserLocale: "en-US", defaultRate: 1, defaultPitch: 1, defaultVolume: 0.9 }),
  originalProfile({ id: "ines-es", name: "Inés Romero", locale: "es-ES", language: "Espanhol", gender: "Feminina", style: "Misteriosa", tone: "Calma · Suave", initials: "IN", hue: "peach", characteristics: "Perfil original em espanhol; motor próprio necessário.", browserLocale: "es-ES", defaultRate: 1, defaultPitch: 1, defaultVolume: 0.9 }),
  originalProfile({ id: "louis-fr", name: "Louis Moreau", locale: "fr-FR", language: "Francês", gender: "Masculina", style: "Narrativa", tone: "Maduro · Envolvente", initials: "LO", hue: "slate", characteristics: "Perfil original em francês; motor próprio necessário.", browserLocale: "fr-FR", defaultRate: 1, defaultPitch: 1, defaultVolume: 0.9 }),
];

export const languageOptions = ["Todos", "Português · Portugal", "Português · Brasil", "Inglês", "Espanhol", "Francês"];
export const durationOptions = [15, 30, 45, 60, 90, 120, 180, 300, 600];
export const detectivePreset = { name: "Modo Mentalista", voiceId: "detective", rate: 0.88, pitch: 0.91, expression: 0.34, volume: 0.9, pause: 0.75 };

export const textMetrics = (text: string) => ({ characters: text.length, words: text.trim() ? text.trim().split(/\s+/u).length : 0 });

export const splitTextIntoChunks = (text: string, targetSize = 1800) => {
  const paragraphs = text.split(/\n\s*\n/u).map((part) => part.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (paragraph.length > targetSize) {
      if (current) chunks.push(current);
      current = "";
      const sentences = paragraph.match(/[^.!?]+[.!?]+["'”»)]*|[^.!?]+$/gu) ?? [paragraph];
      for (const sentence of sentences) {
        if (sentence.length > targetSize) {
          if (current) chunks.push(current);
          current = "";
          for (let start = 0; start < sentence.length; start += targetSize) chunks.push(sentence.slice(start, start + targetSize));
        } else if (current && current.length + sentence.length + 1 > targetSize) {
          chunks.push(current.trim());
          current = sentence.trim();
        } else current = current ? `${current} ${sentence.trim()}` : sentence.trim();
      }
      continue;
    }
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > targetSize && current) { chunks.push(current); current = paragraph; } else current = next;
  }
  if (current) chunks.push(current);
  return chunks;
};

export const estimateReading = (wordCount: number, durationSeconds: number, rate: number) => {
  const wordsPerMinute = durationSeconds > 0 ? (wordCount / durationSeconds) * 60 : 0;
  const effectiveRate = wordsPerMinute > 0 ? wordsPerMinute / 155 : rate;
  return { wordsPerMinute, effectiveRate, tooFast: effectiveRate > 1.35, tooSlow: effectiveRate < 0.65 };
};

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `0:${String(secs).padStart(2, "0")}`;
};

export const saveDraft = (draft: { text: string; voiceId: string; updatedAt: number }) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("chawavoice-draft-v1", JSON.stringify(draft));
};

export const loadDraft = (): { text: string; voiceId: string } | null => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem("chawavoice-draft-v1");
  if (!stored) return null;
  try {
    const draft = JSON.parse(stored) as { text: string; voiceId: string };
    return typeof draft.text === "string" && typeof draft.voiceId === "string" ? draft : null;
  } catch { return null; }
};