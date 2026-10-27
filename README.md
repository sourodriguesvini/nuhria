# Nuhria — site

**Um dia de luz.** A rolagem é a luz atravessando o vidro da clínica, da manhã ao poente. Em vez de uma pilha de seções, o site é uma sequência de momentos que só a Nuhria poderia ter: tudo nasce do símbolo aprovado (anel de 52 pontos, eixo e ponto central) e da ideia de que *o que a luz atravessa, se revela*.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3210
npm run build      # gera out/ (estático, sobe direto na Hostinger)
```

Para revisar a experiência completa numa máquina com "reduzir movimento" ligado, abra `http://localhost:3210/?movimento`.

## Momentos

| # | Momento | O que acontece | Arquivo |
|---|---|---|---|
| 1 | **Fresta** | O eixo do símbolo surge como uma fresta de luz; os 52 pontos chegam no sentido horário e formam o anel; o ponto central acende. Ao rolar, a fresta se abre até virar a janela da sala com o mar e o título "se revela" só onde a luz passa. | `src/components/sections/Fresta.tsx`, `gl/frestaShader.ts` |
| 2 | **Sinais dispersos → prioridade clara** | Sinais soltos (sono, energia, hormônios, rotina…) ligados por fios se organizam no anel; três acendem como prioridades e o eixo com o ponto central fecha o símbolo. É o posicionamento da marca virando interação. | `sections/Sinais.tsx` |
| 3 | **Mostrador das áreas** | As seis áreas são pontos no anel, que gira como um relógio lento. A área sob o eixo de luz acende e sua foto aparece numa lente de vidro com refração real; a troca de foto é uma nova fresta. | `sections/Mostrador.tsx`, `gl/lenteShader.ts` |
| 4 | Um dia na Nuhria | *Próxima rodada:* primeira consulta em rolagem horizontal, com a luz atravessando a sala da manhã à tarde. | — |
| 5 | O vidro | *Próxima rodada:* a vista do mar com um painel de vidro que refrata seguindo o cursor (ou o giroscópio). | — |
| 6 | Comece por uma conversa | *Próxima rodada:* formulário em forma de conversa, uma pergunta por vez; ao enviar, o último ponto do anel acende e o WhatsApp abre com a mensagem pronta. | `sections/Convite.tsx` (provisório) |

**Sistema que atravessa a página:** rolagem macia (Lenis + GSAP ScrollTrigger), a cor do fundo esquenta com a rolagem (`CorDoDia`), o cursor é um halo de luz (`CursorLuz`), grão de filme leve, o anel de 52 pontos como indicador de percurso (`AnelNavegacao`), cabeçalho que troca de tema sobre fotos escuras e menu em tela cheia.

## Marca

- `src/lib/ring.json` — os 52 pontos medidos no SVG aprovado (ângulo, distância e tamanho; maior ponto a 300,9°), o ponto central e o eixo. Gerado a partir de `01. Logotipos/01 Simbolo` da entrega de 24/10/2026.
- `src/lib/logotipo.json` — o logotipo NUHRIA em vetor (assinatura horizontal sem Clínica).
- Cores: Sunlit White `#FFF9F1`, Ivory Cream `#F8EFE1`, Warm Oat `#E3D2BD`, Warm Sandstone `#D7B895`, Warm Taupe `#A67F60`, texto Grafite `#222222`.
- Voz: "pessoa", nunca "paciente"; sem descritor; sem promessa, preço ou número de saúde.

## Pendências antes de publicar

- **Licença das fontes:** o arquivo da Mories no projeto é DEMO. Comprar a licença comercial (web) antes de colocar o site no ar; o mesmo vale para a Mont.
- **Fotos reais** (com a Ju do Mar): Dra. Suzana, eventos e vista do local. As fotos atuais são da direção de imagem da marca. Vídeo da abertura: hoje a foto ganha vida no shader; um loop real da luz no vidro entra no lugar.
- **Confirmar com a Dra.:** as seis áreas de atuação; "01 página · 03 prioridades · 90 dias até a reavaliação"; @saudenuhria.
- **Rodapé (CFM 2.336/2023):** registro da clínica no CRM-RJ e nome do diretor técnico-médico.
- **Política de privacidade (LGPD)** antes de ligar o formulário.
