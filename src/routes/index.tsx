import { createFileRoute } from "@tanstack/react-router";
import { AudioStudio } from "@/components/audio-studio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChawaVoice AI — Estúdio de voz e narração" },
      { name: "description", content: "Escreva a sua narração, escolha uma voz e prepare áudio para os seus vídeos no estúdio ChawaVoice AI." },
      { property: "og:title", content: "ChawaVoice AI — Estúdio de voz e narração" },
      { property: "og:description", content: "Estúdio de narração, vozes e sincronização com vídeo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AudioStudio,
});
