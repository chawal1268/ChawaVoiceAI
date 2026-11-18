import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { AudioLines, Check, Clock3, FileText, Film, History, Moon, Pause, Play, Server, Sparkles, Sun, Upload, Volume2, Waves } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { durationOptions, estimateReading, formatDuration, loadDraft, saveDraft, splitTextIntoChunks, textMetrics, voices } from "@/lib/chawavoice";

type Recent = { id: string; title: string; voiceId: string; text: string; updatedAt: number };
const sample = "Há histórias que ganham vida quando encontram a voz certa.\n\nCom a ChawaVoice AI, pode preparar narrações longas, escolher o ritmo e organizar cada segmento para acompanhar o seu vídeo.";

export function AudioStudio() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [text, setText] = useState(sample);
  const [voiceId, setVoiceId] = useState(voices[0].id);
  const [language, setLanguage] = useState("Todos");
  const [gender, setGender] = useState("Todos");
  const [duration, setDuration] = useState(60);
  const [custom, setCustom] = useState(75);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(0.9);
  const [pause, setPause] = useState(0.4);
  const [speaking, setSpeaking] = useState(false);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [segmentTimes, setSegmentTimes] = useState<number[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) { setText(draft.text); setVoiceId(draft.voiceId); }
    const stored = window.localStorage.getItem("chawavoice-recent-v1");
    if (stored) try { setRecent(JSON.parse(stored) as Recent[]); } catch { /* ignore */ }
  }, []);
  useEffect(() => saveDraft({ text, voiceId, updatedAt: Date.now() }), [text, voiceId]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const metrics = textMetrics(text);
  const target = duration === 0 ? custom : duration;
  const estimate = estimateReading(metrics.words, target, rate);
  const chunks = useMemo(() => splitTextIntoChunks(text), [text]);
  const filtered = voices.filter((v) => (language === "Todos" || v.language === language) && (gender === "Todos" || v.gender === gender));
  const selected = voices.find((v) => v.id === voiceId) ?? voices[0];
  const segments = useMemo(() => splitTextIntoChunks(text, 380), [text]);

  useEffect(() => {
    const base = videoDuration || target;
    const words = segments.map((s) => Math.max(1, textMetrics(s).words));
    const total = words.reduce((a, b) => a + b, 0);
    setSegmentTimes(words.map((w) => Number(((w / total) * base).toFixed(1))));
  }, [segments, videoDuration, target]);

  const speak = (content: string, voice = selected) => {
    if (!("speechSynthesis" in window)) return toast.error("Este navegador não tem pré-escuta de voz.");
    window.speechSynthesis.cancel();
    const parts = splitTextIntoChunks(content, 260);
    const browserVoice = window.speechSynthesis.getVoices().find((v) => v.lang === voice.locale) ?? window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(voice.locale.slice(0, 2)));
    parts.forEach((part, index) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = voice.locale; u.voice = browserVoice ?? null; u.rate = Math.min(estimate.effectiveRate, 1.35) * rate; u.pitch = pitch; u.volume = volume;
      if (index === 0) u.onstart = () => setSpeaking(true);
      if (index === parts.length - 1) u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    });
  };

  const saveRecent = () => {
    if (!text.trim()) return toast.error("Escreva um texto antes de guardar.");
    const item = { id: crypto.randomUUID(), title: text.trim().slice(0, 54), voiceId, text, updatedAt: Date.now() };
    const next = [item, ...recent].slice(0, 6);
    setRecent(next); window.localStorage.setItem("chawavoice-recent-v1", JSON.stringify(next)); toast.success("Projeto guardado neste dispositivo.");
  };
  const importText = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    setText(await file.text()); toast.success("Texto importado."); event.target.value = "";
  };
  const importVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl); setVideoUrl(URL.createObjectURL(file));
  };

  return <div className={`app-shell ${theme === "light" ? "theme-light" : ""}`}><div className="studio-layout">
    <aside className="studio-sidebar"><div className="brand-lockup"><div className="brand-mark"><AudioLines size={20}/></div><div><div className="brand-name">ChawaVoice AI</div><div className="brand-caption">Estúdio de narração</div></div></div>
      <div className="sidebar-section-label">Estúdio</div><nav className="sidebar-nav">{[["Editor", FileText, "editor"],["Vozes", Waves, "vozes"],["Vídeo", Film, "video"],["Recentes", History, "recentes"]].map(([label, Icon, id]) => { const I = Icon as typeof FileText; return <a key={String(id)} href={`#${id}`} className={`sidebar-link ${id === "editor" ? "is-active" : ""}`}><I size={17}/>{String(label)}</a>; })}</nav>
      <div className="sidebar-bottom"><div className="engine-status"><span className="status-dot"/><div><div className="status-name">Motor próprio por ligar</div><div className="status-detail">Exportação MP3/WAV desativada até existir um servidor de voz.</div></div></div></div></aside>
    <main className="studio-main"><header className="topbar"><div className="topbar-left"><div className="mobile-brand"><div className="brand-mark"><AudioLines size={17}/></div><span className="brand-name">ChawaVoice AI</span></div><span className="topbar-context">Projetos</span><span className="topbar-context">/</span><span className="topbar-current">Nova narração</span></div><div className="topbar-right"><span className="inline-row local-save-status"><Check size={13}/>Guardado neste dispositivo</span><Button variant="ghost" size="icon" aria-label="Mudar tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun/> : <Moon/>}</Button></div></header>
      <div className="studio-content"><section className="studio-heading"><div><div className="eyebrow">Novo projeto</div><h1>Narração sem limites</h1><p>Escreva, ajuste o ritmo e prepare a narração para o seu vídeo.</p></div><span className="local-save-status"><Server size={13}/>{chunks.length} {chunks.length === 1 ? "bloco" : "blocos"} prontos para processamento</span></section>
        <div className="studio-grid"><section id="editor" className="editor-surface"><div className="editor-head"><div className="editor-label"><FileText size={16}/>Texto da narração</div><Button variant="ghost" size="sm" onClick={() => setText("")}>Limpar</Button></div><div className="editor-body"><textarea aria-label="Texto da narração" className="editor-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva ou cole aqui o seu texto…"/></div><div className="editor-tools"><input ref={fileRef} className="sr-only-file" type="file" accept=".txt,text/plain" onChange={importText}/><Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload/>Importar TXT</Button><Button variant="outline" size="sm" onClick={saveRecent}><Check/>Guardar projeto</Button></div><div className="editor-footer"><span className="editor-counter">{metrics.characters.toLocaleString("pt-PT")} caracteres · {metrics.words.toLocaleString("pt-PT")} palavras</span><span className="editor-counter">≈ {formatDuration(Math.round((metrics.words / 155) * 60 / rate))}</span></div></section>
          <div className="side-stack"><section className="tool-section"><div className="tool-section-head"><div className="tool-title"><Clock3 size={16}/>Duração do áudio</div></div><div className="tool-section-body"><label className="field-label">Duração pretendida<select aria-label="Duração pretendida" className="duration-select" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>{durationOptions.map((s) => <option key={s} value={s}>{formatDuration(s)}</option>)}<option value={0}>Personalizada</option></select></label>{duration === 0 && <label className="custom-duration">Segundos <input type="number" min={5} value={custom} onChange={(e) => setCustom(Math.max(5, Number(e.target.value)))}/></label>}
            {[["Velocidade", rate, setRate, .6, 1.4, .05], ["Entoação", pitch, setPitch, .6, 1.4, .05], ["Intensidade", volume, setVolume, .2, 1, .05], ["Pausa entre parágrafos", pause, setPause, 0, 2, .1]].map(([label, value, set, min, max, step]) => <label key={String(label)} className="slider-line"><span className="field-label">{String(label)}</span><span className="slider-value">{Number(value).toFixed(2)}</span><input type="range" min={Number(min)} max={Number(max)} step={Number(step)} value={Number(value)} onChange={(e) => (set as (n: number) => void)(Number(e.target.value))}/></label>)}
            <div className={`reading-estimate ${estimate.tooFast || estimate.tooSlow ? "is-warning" : ""}`}><Sparkles size={14}/>{estimate.tooFast ? `Este texto precisaria de ${estimate.effectiveRate.toFixed(2)}× velocidade. Reduza o texto ou aumente a duração.` : estimate.tooSlow ? "A narração ficaria demasiado lenta. Considere encurtar a duração ou adicionar texto." : `Ritmo estimado de ${Math.round(estimate.wordsPerMinute)} palavras por minuto.`}</div><Button className="primary-generate" onClick={() => speaking ? (window.speechSynthesis.cancel(), setSpeaking(false)) : speak(text)} disabled={!text.trim()}>{speaking ? <Pause/> : <Play/>}{speaking ? "Parar pré-escuta" : "Pré-escutar no navegador"}</Button><p className="disabled-reason">A pré-escuta não gera ficheiros. MP3/WAV só será ativado com um motor de voz próprio.</p></div></section>
            <section id="vozes" className="tool-section"><div className="tool-section-head"><div className="tool-title"><Volume2 size={16}/>Biblioteca de vozes</div></div><div className="voice-filters"><select aria-label="Filtrar idioma" className="filter-select" value={language} onChange={(e) => setLanguage(e.target.value)}><option>Todos</option>{[...new Set(voices.map((v) => v.language))].map((l) => <option key={l}>{l}</option>)}</select><select aria-label="Filtrar género" className="filter-select" value={gender} onChange={(e) => setGender(e.target.value)}><option>Todos</option><option>Feminina</option><option>Masculina</option></select></div><div className="voice-list">{filtered.map((v) => <div key={v.id} className={`voice-row ${v.id === voiceId ? "is-selected" : ""}`} onClick={() => setVoiceId(v.id)}><div className={`voice-avatar hue-${v.hue}`}>{v.initials}</div><div><div className="voice-name">{v.name}</div><div className="voice-description">{v.language} · {v.style} · {v.tone}</div></div><button className="voice-play" aria-label={`Ouvir ${v.name}`} onClick={(e) => { e.stopPropagation(); setVoiceId(v.id); speak("Olá. Esta é uma demonstração da minha voz.", v); }}><Play size={14}/></button></div>)}</div><p className="voice-browser-note"><strong>Demonstrações:</strong> usam a voz disponível neste navegador e podem variar.</p></section></div></div>
        <div className="studio-lower-grid"><section id="video" className="tool-section"><div className="section-heading"><div><div className="section-heading-title"><Film size={17}/>Sincronização com vídeo</div><p>Ajuste os segmentos para terminar junto com o vídeo.</p></div></div><div className="video-panel-body"><label className="video-dropzone"><span className="video-drop-icon"><Upload size={17}/></span><span><span className="video-drop-title">{videoUrl ? `Duração do vídeo: ${formatDuration(Math.round(videoDuration))}` : "Importar vídeo"}</span><span className="video-drop-subtitle">O ficheiro fica apenas neste navegador.</span></span><input className="sr-only-file" type="file" accept="video/*" onChange={importVideo}/></label>{videoUrl && <video className="video-preview" src={videoUrl} controls onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}/>}<div className="segment-list">{segments.slice(0, 6).map((s, i) => <div key={i} className="segment-row"><span className="segment-number">{i + 1}</span><span className="segment-text">{s}</span><input aria-label={`Duração do segmento ${i + 1}`} type="number" step=".1" value={segmentTimes[i] ?? 0} onChange={(e) => setSegmentTimes((old) => old.map((v, n) => n === i ? Number(e.target.value) : v))}/></div>)}</div><span className="editor-counter">Total: {formatDuration(Math.round(segmentTimes.reduce((a, b) => a + b, 0)))} / {formatDuration(Math.round(videoDuration || target))}</span></div></section>
          <section id="recentes" className="tool-section"><div className="section-heading"><div><div className="section-heading-title"><History size={17}/>Projetos recentes</div><p>Guardados neste dispositivo, sem conta.</p></div></div><div className="history-panel-body">{recent.length === 0 ? <div className="history-empty"><History size={18}/>Ainda não guardou nenhum projeto.</div> : recent.map((item) => <div className="history-item" key={item.id}><button className="history-item-button" onClick={() => { setText(item.text); setVoiceId(item.voiceId); }}><span className="history-item-title">{item.title}</span><span className="history-item-meta">{new Date(item.updatedAt).toLocaleString("pt-PT")}</span></button><Button variant="ghost" size="sm" onClick={() => { const next = recent.filter((x) => x.id !== item.id); setRecent(next); localStorage.setItem("chawavoice-recent-v1", JSON.stringify(next)); }}>Eliminar</Button></div>)}</div></section></div>
        <div className="engine-banner"><Server className="engine-banner-icon" size={18}/><div><div className="engine-banner-title">Ficheiros MP3/WAV aguardam o motor ChawaVoice</div><div className="engine-banner-copy">A aplicação já divide textos longos em blocos. Para gerar e exportar áudio profissional, ligue um motor de voz open-source alojado no seu servidor.</div></div></div><footer className="app-footer">Vozes originais da biblioteca ChawaVoice; sem clonagem de pessoas reais.</footer></div></main></div></div>;
}
