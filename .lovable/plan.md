# ChawaVoice AI — plataforma de narração e áudio

## Objetivo
Construir a aplicação de estúdio descrita no briefing, com dados protegidos por conta, ferramentas utilizáveis e estados claros. A síntese nunca será apresentada como concluída se não houver um motor configurado.

## Arquitetura
- **Aplicação Web:** TanStack Start; editor, biblioteca de vozes, controlos de duração, sincronização com vídeo, histórico e administração.
- **Contas, dados e ficheiros:** Lovable Cloud para autenticação, registos persistentes, permissões e armazenamento privado dos áudios.
- **Síntese profissional:** serviço TTS open-source alojado num servidor próprio, separado da aplicação Web. Um adaptador de motor liga a aplicação a esse serviço; a fila divide textos longos em blocos, regista o progresso e permite retomar falhas.
- **Alternativa de pré-visualização:** voz disponível no navegador, claramente identificada como pré-escuta; não será apresentada como exportação profissional nem como MP3/WAV.

## Etapas
1. Criar o estúdio responsivo com editor longo, contadores, importação TXT, seleção e filtros de vozes, controlos de leitura, estimativa de duração e avisos de velocidade excessiva.
2. Implementar contas e persistência no Cloud: biblioteca, registos das gerações, filas e ficheiros privados; limitar leitura, eliminação e administração às permissões de cada utilizador.
3. Construir o fluxo de trabalhos por blocos, estados de fila, tentativa/retoma e união/exportação de ficheiros, chamando somente o motor TTS próprio quando estiver configurado.
4. Criar sincronização com vídeo importado, leitura da duração real, divisão e ajuste de segmentos, pausas e pré-visualização da linha temporal.
5. Implementar a área administrativa protegida, estados sem configuração/erro/carregamento e verificar a experiência em telemóvel e computador.

## Limite externo a resolver
Ainda não foi fornecido nem ligado um servidor TTS próprio ou endereço do respetivo serviço. O código e a ligação modular podem ficar preparados, mas a produção real de MP3/WAV só poderá ser ativada quando esse serviço estiver alojado e configurado. Sem ele, a geração fica indisponível, com uma mensagem clara; não haverá áudio de sucesso simulado. A pré-escuta do navegador continuará distinta da geração profissional.
