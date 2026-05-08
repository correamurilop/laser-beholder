# 🔴 Laser Beholder — Documentação

## Instalação

1. Copie a pasta `laser-beholder/` para o diretório de módulos do seu Foundry:  
   `<FoundryData>/Data/modules/laser-beholder/`
2. No Foundry, vá em **Gerenciar Módulos** → ative **Laser Beholder**
3. Recarregue a página

---

## Como usar

### 1. Criar um Emissor de Laser

1. Coloque qualquer token no mapa (use um token de **Olho de Beholder**)
2. Selecione o token
3. Rode a macro **"Configurar Emissor de Laser"**
4. Preencha o formulário:

| Campo | Descrição |
|---|---|
| **Tipo de Raio** | Cor e tipo do raio do beholder (10 opções) |
| **Direção Inicial** | N, S, E ou W (cardinal) |
| **Velocidade — X** | Quadrados que a *cabeça* avança por ativação |
| **Comprimento — Y** | Tamanho total do laser (como a cobra do Snake) |
| **Frequência — Z** | Dispara a cada Z turnos de combate |
| **Dano** | Fórmula de dados (ex: `3d6`, `2d10+5`) |
| **Tipo de Dano** | fogo, radiante, necrótico, etc. |
| **Ativo** | Liga/desliga o emissor |

> O botão **👁 (olho)** no HUD do token também abre essa configuração.

---

### 2. Criar um Espelho Mágico

1. Coloque qualquer token no mapa (use um token de espelho/cristal)
2. Selecione o token
3. Rode a macro **"Configurar Espelho Mágico"**
4. Escolha o ângulo:

| Ângulo | Símbolo | Reflexões |
|---|---|---|
| **45°** | `\` | E→S · W→N · N→W · S→E |
| **135°** | `/` | E→N · W→S · N→E · S→W |

> O botão **◆ (diamante)** no HUD do token também abre essa configuração.

---

### 3. Durante o Combate

O laser avança **automaticamente** a cada Z turnos do combate.  
Qualquer token sobre os segmentos do laser **recebe dano** com uma mensagem no chat.

O laser para em **paredes** e é **redirecionado por espelhos**.

---

### 4. Macros disponíveis

| Macro | Função |
|---|---|
| Configurar Emissor de Laser | Abre o formulário de configuração do emissor |
| Configurar Espelho Mágico | Abre o formulário de configuração do espelho |
| Avançar Laser Manual | Avança o laser uma vez (teste fora do combate) |
| Resetar Laser | Apaga o laser e limpa os efeitos visuais |

---

## Mecânica do Laser (Snake)

```
Emissor → [seg1][seg2][seg3]...[segY] → (espaço vazio)
           ↑ cauda some              ↑ cabeça avança X por turno
```

- A cada Z turnos: a **cabeça** avança X quadrados
- O laser mantém **no máximo Y segmentos** no total
- Segmentos do rabo **somem** automaticamente (igual a cobra do Snake)
- Se a cabeça bate numa **parede**, para de crescer (a cauda continua sumindo)
- Se a cabeça bate num **espelho**, muda de direção e continua avançando

---

## Raios do Beholder

| Raio | Cor |
|---|---|
| Charme | Rosa |
| Paralisia | Dourado |
| Medo | Laranja |
| Lentidão | Verde |
| Enervação | Violeta |
| Telecinese | Azul |
| Sono | Ciano |
| Petrificação | Cinza |
| Desintegração | Verde Escuro |
| Morte | Vermelho Escuro |

---

## API para Macros Avançadas

```javascript
// Abrir config do token selecionado
game.laserBeholder.configEmitter();
game.laserBeholder.configMirror();

// Avançar laser manualmente
game.laserBeholder.advance();

// Resetar laser
game.laserBeholder.reset();

// Limpar TODOS os lasers do mapa
game.laserBeholder.clearAll();
```
