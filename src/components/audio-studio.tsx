import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { AudioLines, Check, Clock3, FileText, Film, History, Moon, Pause, Play, Server, Sparkles, Sun, Upload, Volume2, Waves } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { detectivePreset, durationOptions, estimateReading, formatDuration, languageOptions, loadDraft, saveDraft, splitTextIntoChunks, textMetrics, voices } from "@/lib/chawavoice";

type Recent = { id: string; title: string; voiceId: string; text: string; updatedAt: number };
type VoiceSettings = { rate: number; pitch: number; expression: number; volume: number; pause: number };
const starterText = "Há histórias que ganham vida quando encontram a voz certa.\n\nCom a ChawaVoice AI, pode preparar narrações longas, escolher o ritmo e organizar cada segmento para acompanhar o seu vídeo.";
const initialSettings: VoiceSettings = { rate: 1, pitch: 1, expression: 0.5, volume: 0.9, pause: 0.4 };

export function AudioStudio() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [text, setText] = useState(starterText);
  const [voiceId, setVoiceId] = useState("detective");
  const [language, setLanguage] = useState("Todos");
  const [gender, setGender] = useState("Todos");
  const [duration, setDuration] = useState(60);
  const [custom, setCustom] = useState(75);
  const [settings, setSettings] = useState<VoiceSettings>({ ...initialSettings });
  const [speaking, setSpeaking] = useState(false);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [segmentTimes, setSegmentTimes] = useState<number[]>([]);
  const [compareText, setCompareText] = useState("A clareza está nos detalhes.");
  const [compareVoiceIds, setCompareVoiceIds] = useState<string[]>(["detective", "narrador", "conversador"]);
  const [engineVoices, setEngineVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supportedVoices, setSupportedVoices] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setText(draft.text);
      if (voices.some((voice) => voice.id === draft.voiceId)) setVoiceId(draft.voiceId);
    }
    const stored = window.localStorage.getItem("chawavoice-recent-v1");
    if (stored) { try { setRecent(JSON.parse(stored) as Recent[]); } catch { window.localStorage.removeItem("chawavoice-recent-v1"); } }
    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const browserVoices = window.speechSynthesis.getVoices();
        setEngineVoices(browserVoices);
        setSupportedVoices(new Set(browserVoices.map((voice) => voice.lang.toLowerCase())));
      };
      loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
      return () => { window.speechSynthesis.removeEventListener("voiceschanged", loadVoices); window.speechSynthesis.cancel(); };
    }
    return () => undefined;
  }, []);
  useEffect(() => saveDraft({ text, voiceId, updatedAt: Date.now() }), [text, voiceId]);

  const metrics = textMetrics(text);
  const target = duration === 0 ? custom : duration;
  const estimate = estimateReading(metrics.words, target, settings.rate);
  const chunks = useMemo(() => splitTextIntoChunks(text), [text]);
  const selected = voices.find((voice) => voice.id === voiceId) ?? voices[0];
  const filtered = voices.filter((voice) => (language === "Todos" || voice.language === language) && (gender === "Todos" || voice.gender === gender));
  const activeVoices = voices.filter((voice) => {
    const sourceAvailable = voice.available && engineVoices.some((entry) => entry.lang.toLowerCase() === voice.browserLocale.toLowerCase());
    const browserAvailable = supportedVoices.has(voice.browserLocale.toLowerCase());
    return sourceAvailable || browserAvailable;
  });
  const selectedBrowserVoice = engineVoices.find((voice) => voice.lang.toLowerCase() === selected.browserLocale.toLowerCase());
  const hasRealDistinctVoice = Boolean(selected.available && selectedBrowserVoice);
  const validCompareIds = compareVoiceIds.filter((id) => activeVoices.some((voice) => voice.id === id));
  const segments = useMemo(() => splitTextIntoChunks(text, 380), [text]);

  useEffect(() => {
    const base = videoDuration || target;
    const words = segments.map((part) => Math.max(1, textMetrics(part).words));
    const total = words.reduce((a, b) => a + b, 0);
    setSegmentTimes(words.map((count) => Number(((count / total) * base).toFixed(1))));
  }, [segments, videoDuration, target]);

  const playPreview = (content: string, voice = selected) => {
    if (!("speechSynthesis" in window)) { toast.error("Este navegador não tem pré-escuta de voz."); return; }
    const browserVoice = engineVoices.find((entry) => entry.lang.toLowerCase() === voice.browserLocale.toLowerCase());
    if (!browserVoice) { toast.error(`Não foi encontrada uma voz ${voice.language} neste navegador. Este perfil requer um motor de voz ligado.`); return; }
    window.speechSynthesis.cancel();
    const parts = splitTextIntoChunks(content, 260);
    parts.forEach((part, index) => {
      const utterance = new SpeechSynthesisUtterance(part);
      utterance.voice = browserVoice;
      utterance.lang = voice.browserLocale;
      utterance.rate = Math.min(estimate.effectiveRate, 1.35) * settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;
      if (index === 0) utterance.onstart = () => setSpeaking(true);
      if (index === parts.length - 1) utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    });
  };

  const saveRecent = () => {
    if (!text.trim()) { toast.error("Escreva um texto antes de guardar."); return; }
    const item = { id: crypto.randomUUID(), title: text.trim().slice(0, 54), voiceId, text, updatedAt: Date.now() };
    const next = [item, ...recent].slice(0, 6);
    setRecent(next);
    window.localStorage.setItem("chawavoice-recent-v1", JSON.stringify(next));
    toast.success("Projeto guardado neste dispositivo.");
  };

  const importText = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setText(await file.text());
    toast.success("Texto importado.");
    event.target.value = "";
  };

  const importVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file));
  };

  const useMentalist = () => {
    setVoiceId(detectivePreset.voiceId);
    setSettings({ rate: detectivePreset.rate, pitch: detectivePreset.pitch, expression: detectivePreset.expression, volume: detectivePreset.volume, pause: detectivePreset.pause });
    toast.success("Modo Mentalista selecionado. A pré-escuta exige uma voz portuguesa neste navegador.");
  };

  const addCompareVoice = (id: string) => setCompareVoiceIds((old) => old.includes(id) ? old : [...old, id].slice(-4));

  return <div className={`app-shell ${theme === "light" ? "theme-light" : ""}`}><div className="studio-layout">
    <aside className="studio-sidebar"><div className="brand-lockup"><div className="brand-mark"><AudioLines size={20}/></div><div><div className="brand-name">ChawaVoice AI</div><div className="brand-caption">Estúdio de narração</div></div></div>
      <div className="sidebar-section-label">Estúdio</div><nav className="sidebar-nav">{[["Editor", FileText, "editor"],["Vozes", Waves, "vozes"],["Comparar", Volume2, "comparar"],["Vídeo", Film, "video"],["Recentes", History, "recentes"]].map(([label, Icon, id]) => { const I = Icon as typeof FileText; return <a key={String(id)} href={`#${id}`} className={`sidebar-link ${id === "editor" ? "is-active" : ""}`}><I size={17}/>{String(label)}</a>; })}</nav>
      <div className="sidebar-bottom"><div className="engine-status"><span className={`status-dot ${activeVoices.length ? "is-ready" : ""}`}/><div><div className="status-name">{activeVoices.length ? `${activeVoices.length} vozes no navegador` : "Motor TTS não ligado"}</div><div className="status-detail">Nenhum modelo ChawaVoice está configurado. Exportação MP3/WAV indisponível.</div></div></div></div></aside>
    <main className="studio-main"><header className="topbar"><div className="topbar-left"><div className="mobile-brand"><div className="brand-mark"><AudioLines size={17}/></div><span className="brand-name">ChawaVoice AI</span></div><span className="topbar-context">Projetos</span><span className="topbar-context">/</span><span className="topbar-current">Nova narração</span></div><div className="topbar-right"><span className="inline-row local-save-status"><Check size={13}/>Guardado neste dispositivo</span><Button variant="ghost" size="icon" aria-label="Mudar tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun/> : <Moon/>}</Button></div></header>
      <div className="studio-content"><section className="studio-heading"><div><div className="eyebrow">Novo projeto</div><h1>Narração sem limites</h1><p>Escreva, ajuste o ritmo e prepare a narração para o seu vídeo.</p></div><span className="local-save-status"><Server size={13}/>{chunks.length} {chunks.length === 1 ? "bloco" : "blocos"} prontos para processamento</span></section>
        <div className="studio-grid"><section id="editor" className="editor-surface"><div className="editor-head"><div className="editor-label"><FileText size={16}/>Texto da narração</div><Button variant="ghost" size="sm" onClick={() => setText("")}>Limpar</Button></div><div className="editor-body"><textarea aria-label="Texto da narração" className="editor-textarea" value={text} onChange={(event) => setText(event.target.value)} placeholder="Escreva ou cole aqui o seu texto…"/></div><div className="editor-tools"><input ref={fileRef} className="sr-only-file" type="file" accept=".txt,text/plain" onChange={importText}/><Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload/>Importar TXT</Button><Button variant="outline" size="sm" onClick={saveRecent}><Check/>Guardar projeto</Button></div><div className="editor-footer"><span className="editor-counter">{metrics.characters.toLocaleString("pt-PT")} caracteres · {metrics.words.toLocaleString("pt-PT")} palavras</span><span className="editor-counter">≈ {formatDuration(Math.round((metrics.words / 155) * 60 / settings.rate))}</span></div></section>
          <div className="side-stack"><section className="tool-section"><div className="tool-section-head"><div className="tool-title"><Clock3 size={16}/>Duração do áudio</div></div><div className="tool-section-body"><label className="field-label">Duração pretendida<select aria-label="Duração pretendida" className="duration-select" value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{durationOptions.map((seconds) => <option key={seconds} value={seconds}>{formatDuration(seconds)}</option>)}<option value={0}>Personalizada</option></select></label>{duration === 0 && <label className="custom-duration">Segundos <input type="number" min={5} value={custom} onChange={(event) => setCustom(Math.max(5, Number(event.target.value)))}/></label>}
            {([["Velocidade", "rate", .6, 1.4, .05], ["Entoação", "pitch", .6, 1.4, .05], ["Expressividade", "expression", 0, 1, .05], ["Intensidade", "volume", .2, 1, .05], ["Pausa entre parágrafos", "pause", 0, 2, .1]] as const).map(([label, key, min, max, step]) => <label key={key} className="slider-line"><span className="field-label">{label}</span><span className="slider-value">{settings[key].toFixed(2)}</span><input aria-label={label} type="range" min={min} max={max} step={step} value={settings[key]} onChange={(event) => setSettings((old) => ({ ...old, [key]: Number(event.target.value) }))}/></label>)}
            <div className={`reading-estimate ${estimate.tooFast || estimate.tooSlow ? "is-warning" : ""}`}><Sparkles size={14}/>{estimate.tooFast ? `Este texto precisaria de ${estimate.effectiveRate.toFixed(2)}× velocidade. Reduza o texto ou aumente a duração.` : estimate.tooSlow ? "A narração ficaria demasiado lenta. Considere encurtar a duração ou adicionar texto." : `Ritmo estimado de ${Math.round(estimate.wordsPerMinute)} palavras por minuto.`}</div><div className="generate-actions"><Button className="primary-generate" onClick={() => speaking ? (window.speechSynthesis.cancel(), setSpeaking(false)) : playPreview(text)} disabled={!text.trim() || !selectedBrowserVoice}>{speaking ? <Pause/> : <Play/>}{speaking ? "Parar pré-escuta" : "Pré-escutar no navegador"}</Button><Button variant="outline" className="mental-mode-button" onClick={useMentalist}>Modo Mentalista</Button></div><p className="disabled-reason">A pré-escuta usa a voz real disponível neste navegador; não cria ficheiros de áudio nem simula modelos.</p></div></section>
            <section id="vozes" className="tool-section"><div className="tool-section-head"><div className="tool-title"><Volume2 size={16}/>Biblioteca de vozes</div></div><div className="voice-filters"><select aria-label="Filtrar idioma" className="filter-select" value={language} onChange={(event) => setLanguage(event.target.value)}>{languageOptions.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filtrar género" className="filter-select" value={gender} onChange={(event) => setGender(event.target.value)}><option>Todos</option><option>Feminina</option><option>Masculina</option></select></div><div className="voice-list">{filtered.map((voice) => { const available = voice.available && supportedVoices.has(voice.browserLocale.toLowerCase()); return <div key={voice.id} role="button" tabIndex={0} className={`voice-row ${voice.id === voiceId ? "is-selected" : ""}`} onClick={() => setVoiceId(voice.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setVoiceId(voice.id); } }}><div className={`voice-avatar hue-${voice.hue}`}>{voice.initials}</div><div><div className="voice-name">{voice.name}<span className={`voice-availability ${available ? "is-ready" : ""}`}>{available ? "Disponível" : "Motor por ligar"}</span></div><div className="voice-description">{voice.language} · {voice.gender} · {voice.tone}</div><div className="voice-characteristics">{voice.characteristics}</div></div><button className="voice-play" aria-label={`Pré-escutar ${voice.name}`} disabled={!available && !supportedVoices.has(voice.browserLocale.toLowerCase())} onClick={(event) => { event.stopPropagation(); setVoiceId(voice.id); if (supportedVoices.has(voice.browserLocale.toLowerCase())) playPreview("Olá. Esta é uma demonstração da voz disponível neste navegador.", voice); else toast.error("Esta voz precisa de um motor TTS próprio para ser ativada."); }}><Play size={14}/></button></div>; })}</div><p className="voice-browser-note">Nenhum perfil de estúdio está ligado a um motor TTS. A pré-escuta do navegador, quando disponível, <strong>não representa</strong> essa identidade vocal.</p></section></div></div>
        <section id="comparar" className="tool-section compare-section"><div className="section-heading"><div><div className="section-heading-title"><Waves size={17}/>Comparar vozes</div><p>Compare as vozes presentes no seu navegador com exactamente a mesma frase.</p></div><Button variant="outline" size="sm" onClick={() => setCompareOpen((open) => !open)}>{compareOpen ? "Fechar" : "Abrir comparação"}</Button></div>{compareOpen && <div className="compare-body"><textarea aria-label="Frase para comparar" className="compare-textarea" value={compareText} onChange={(event) => setCompareText(event.target.value)} placeholder="Escreva uma frase para comparar as vozes disponíveis…"/><div className="compare-voice-list">{voices.filter((voice) => supportedVoices.has(voice.browserLocale.toLowerCase())).map((voice) => <label className="compare-voice" key={voice.id}><input type="checkbox" checked={compareVoiceIds.includes(voice.id)} onChange={() => setCompareVoiceIds((old) => old.includes(voice.id) ? old.filter((id) => id !== voice.id) : [...old, voice.id].slice(-4))}/>{voice.name}<span>{voice.language}</span></label>)}</div><div className="compare-actions"><span className="editor-counter">{validCompareIds.length ? `${validCompareIds.length} voz(es) disponíveis no navegador.` : "O navegador ainda não forneceu vozes compatíveis."}</span><Button onClick={() => { const voice = voices.find((item) => item.id === validCompareIds[0]); if (!compareText.trim()) { toast.error("Escreva uma frase para comparar."); return; } if (!voice) { toast.error("Nenhuma voz compatível está disponível no navegador."); return; } playPreview(compareText, voice); }} disabled={!validCompareIds.length || !compareText.trim()}><Play/>Ouvir a mesma frase</Button></div><p className="disabled-reason">A comparação usa apenas vozes reais do navegador. Os oito perfis ChawaVoice não podem ser comparados até estarem associados a modelos TTS distintos.</p></div>}</section>
        <div className="studio-lower-grid"><section id="video" className="tool-section"><div className="section-heading"><div><div className="section-heading-title"><Film size={17}/>Sincronização com vídeo</div><p>Ajuste os segmentos para terminar junto com o vídeo.</p></div></div><div className="video-panel-body"><input ref={videoRef} className="sr-only-file" type="file" accept="video/*" onChange={importVideo}/><button type="button" className="video-dropzone" onClick={() => videoRef.current?.click()}><span className="video-drop-icon"><Upload size={17}/></span><span><span className="video-drop-title">{videoUrl ? `Duração do vídeo: ${formatDuration(Math.round(videoDuration))}` : "Importar vídeo"}</span><span className="video-drop-subtitle">O ficheiro fica apenas neste navegador.</span></span></button>{videoUrl && <video className="video-preview" src={videoUrl} controls onLoadedMetadata={(event) => setVideoDuration(event.currentTarget.duration)}/>}<div className="segment-list">{segments.slice(0, 6).map((part, index) => <div key={index} className="segment-row"><span className="segment-number">{index + 1}</span><span className="segment-text">{part}</span><input aria-label={`Duração do segmento ${index + 1}`} type="number" step=".1" value={segmentTimes[index] ?? 0} onChange={(event) => setSegmentTimes((old) => old.map((value, i) => i === index ? Number(event.target.value) : value))}/></div>)}</div><span className="editor-counter">Total: {formatDuration(Math.round(segmentTimes.reduce((a, b) => a + b, 0)))} / {formatDuration(Math.round(videoDuration || target))}</span></div></section>
          <section id="recentes" className="tool-section"><div className="section-heading"><div><div className="section-heading-title"><History size={17}/>Projetos recentes</div><p>Guardados neste dispositivo, sem conta.</p></div></div><div className="history-panel-body">{recent.length === 0 ? <div className="history-empty"><History size={18}/>Ainda não guardou nenhum projeto.</div> : recent.map((item) => <div className="history-item" key={item.id}><button className="history-item-button" onClick={() => { setText(item.text); setVoiceId(item.voiceId); }}><span className="history-item-title">{item.title}</span><span className="history-item-meta">{new Date(item.updatedAt).toLocaleString("pt-PT")}</span></button><Button variant="ghost" size="sm" onClick={() => { const next = recent.filter((project) => project.id !== item.id); setRecent(next); window.localStorage.setItem("chawavoice-recent-v1", JSON.stringify(next)); }}>Eliminar</Button></div>)}</div></section></div>
        <div className="engine-banner"><Server className="engine-banner-icon" size={18}/><div><div className="engine-banner-title">Os perfis ChawaVoice ainda aguardam motores vocais reais</div><div className="engine-banner-copy">Os oito perfis portugueses estão identificados como indisponíveis até existirem modelos originais efetivamente ligados. A pré-escuta do navegador não altera artificialmente timbre ou personalidade. MP3/WAV só será ativado com um motor próprio.</div></div></div><footer className="app-footer">Perfis de voz originais; não reproduzem nem imitam pessoas reais.</footer></div></main></div></div>;
}