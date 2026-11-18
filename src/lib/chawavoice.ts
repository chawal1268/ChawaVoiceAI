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
};

export const voices: Voice[] = [
  { id: "ana-pt", name: "Ana Martins", locale: "pt-PT", language: "Português · Portugal", gender: "Feminina", style: "Narrativa", tone: "Suave · Natural", initials: "AM", hue: "mint" },
  { id: "tiago-pt", name: "Tiago Nunes", locale: "pt-PT", language: "Português · Portugal", gender: "Masculina", style: "Documental", tone: "Grave · Calmo", initials: "TN", hue: "gold" },
  { id: "clara-br", name: "Clara Oliveira", locale: "pt-BR", language: "Português · Brasil", gender: "Feminina", style: "Conversacional", tone: "Jovem · Natural", initials: "CO", hue: "rose" },
  { id: "marcos-br", name: "Marcos Silva", locale: "pt-BR", language: "Português · Brasil", gender: "Masculina", style: "Energética", tone: "Envolvente", initials: "MS", hue: "blue" },
  { id: "ella-en", name: "Ella Brooks", locale: "en-GB", language: "English · UK", gender: "Feminina", style: "Cinematográfica", tone: "Madura · Suave", initials: "EB", hue: "lilac" },
  { id: "lucas-en", name: "Lucas Bennett", locale: "en-US", language: "English · US", gender: "Masculina", style: "Documental", tone: "Grave · Natural", initials: "LB", hue: "aqua" },
  { id: "ines-es", name: "Inés Romero", locale: "es-ES", language: "Español", gender: "Feminina", style: "Misteriosa", tone: "Calma · Suave", initials: "IR", hue: "peach" },
  { id: "louis-fr", name: "Louis Moreau", locale: "fr-FR", language: "Français", gender: "Masculina", style: "Narrativa", tone: "Maduro · Envolvente", initials: "LM", hue: "slate" },
];

export const durationOptions = [15, 30, 45, 60, 90, 120, 180, 300, 600];

export const textMetrics = (text: string) => ({
  characters: text.length,
  words: text.trim() ? text.trim().split(/\s+/u).length : 0,
});

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
          for (let start = 0; start < sentence.length; start += targetSize) {
            chunks.push(sentence.slice(start, start + targetSize));
          }
        } else if (current && current.length + sentence.length + 1 > targetSize) {
          chunks.push(current.trim());
          current = sentence.trim();
        } else {
          current = current ? `${current} ${sentence.trim()}` : sentence.trim();
        }
      }
      continue;
    }
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > targetSize && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = next;
    }
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
  } catch {
    return null;
  }
};
