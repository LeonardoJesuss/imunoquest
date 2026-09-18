# Imunoquest — Operação Defesa

Jogo educativo (Tower Defense) sobre o **Sistema Imunitário humano**, desenvolvido como
recurso didático no contexto do PIBID, para estudantes de **13 a 16 anos**.

## Como abrir

1. Se recebeu a pasta em um `.zip`, **extraia tudo** antes de abrir (clique direito > "Extrair tudo").
   Não abra o `index.html` de dentro do zip.
2. Dê dois cliques em **`index.html`**, em um navegador atualizado (Chrome, Edge ou Firefox).
3. Pronto — **não é necessária conexão com a internet**.

O progresso (fases desbloqueadas, estrelas) fica salvo no navegador de cada computador.
Todos começam na Fase 1; cada fase destrava ao vencer a anterior.

## O que tem no jogo

- **6 fases jogáveis** (5 ondas cada), da imunidade inata à adaptativa, memória imunológica,
  soro e vacinas:
  1. A Primeira Barreira — barreiras físicas/químicas e fagocitose.
  2. Alarme e Fagocitose — macrófago, inflamação e o custo do recrutamento.
  3. Vigilância e Febre — células NK e febre.
  4. Defesa Especializada — antígeno e linfócitos B e T (imunidade adaptativa).
  5. O Inimigo Retorna — memória imunológica.
  6. Operação Defesa — soro, vacina e imunidade passiva, com interlúdios de decisão.
- **Tutorial guiado** na Fase 1.
- **Botão "?"** no canto superior direito do campo de jogo: reabre, a qualquer momento, o resumo do
  que a fase ensina (o jogo pausa enquanto está aberto).
- **Feedback pedagógico** durante a partida e **análise da falha** (sem "game over" seco).
- **Avaliação de fim de fase** (Estratégia / Compreensão / Eficiência) + "O que você aprendeu".
- **Reiniciar fase** (menu de pausa) e **vender defesa** (clique numa defesa já posicionada; devolve 50%).
- **Central do Sistema Imunitário** (enciclopédia), com verbetes liberados conforme o progresso.
- **Configurações**: velocidade, modo sem pressão de tempo, tamanho do texto, alto contraste,
  reduzir animações, som.
- Funciona **100% offline**. Sem frameworks, sem CDN, sem backend. Só HTML, CSS e JavaScript.

## Atalhos de teclado (durante a fase)

`Espaço` pausa · `L` libera a onda · `1`–`9` seleciona a defesa · `?` abre a ajuda · `Esc` fecha a ajuda.

## Estrutura

```
index.html
css/   style.css · game.css
js/    content.js   (todo o texto pedagógico)
       storage.js · audio.js
       enemies.js · towers.js · levels.js
       engine.js  (canvas + laço) · education.js (camada pedagógica)
       ui.js · encyclopedia.js
       game.js (orquestra a partida) · main.js (navegação + configurações)
```
