(() => {
  class AudioCore {
    constructor() {
      this.ctx = null;
      this.master = null;
    }
    ensure() {
      if (this.ctx) return;
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.25;
      this.master.connect(this.ctx.destination);
    }
    beep(duration = 0.07, freq = 440) {
      this.ensure();
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(freq, this.ctx.currentTime);
      g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(
        0.0001,
        this.ctx.currentTime + duration
      );
      o.connect(g);
      g.connect(this.master);
      o.start();
      o.stop(this.ctx.currentTime + duration);
    }
    noise(duration = 1.3) {
      this.ensure();
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const g = this.ctx.createGain();
      g.gain.value = 0.18;
      src.connect(g);
      g.connect(this.master);
      src.start();
    }
    toneSweep(duration = 2.0, start = 40, end = 10) {
      this.ensure();
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(start, this.ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(
        end,
        this.ctx.currentTime + duration
      );
      g.gain.value = 0.06;
      o.connect(g);
      g.connect(this.master);
      o.start();
      o.stop(this.ctx.currentTime + duration);
    }
  }
  const A = new AudioCore();

  const $ = (sel) => document.querySelector(sel);
  const pad = (n, z = 2) => String(n).padStart(z, "0");

  const store = {
    get k() {
      return "obscurus_v4_history";
    },
    load() {
      try {
        return JSON.parse(localStorage.getItem(this.k) || "[]");
      } catch {
        return [];
      }
    },
    save(arr) {
      try {
        localStorage.setItem(this.k, JSON.stringify(arr.slice(0, 200)));
      } catch {}
    },
  };

  const books = {
    1897: {
      code: "2847",
      title: "On the Threshold of the Veil",
      year: "(1897)",
      risk: "baixo",
      status: "disponível",
    },
    1903: {
      code: "3092",
      title: "The Quantification of the Impossible",
      year: "(1903)",
      risk: "medio",
      status: "restrito",
    },
    1907: {
      code: "4751",
      title: "Corpus Obscura",
      year: "(1907)",
      risk: "alto",
      status: "restrito",
    },
    1911: {
      code: "5834",
      title: "Eclipse of Causality",
      year: "(1911)",
      risk: "alto",
      status: "restrito",
    },
    1913: {
      code: "6921",
      title: "Fractured Symmetry",
      year: "(1913)",
      risk: "medio",
      status: "restrito",
    },
    1916: {
      code: "7483",
      title: "Axioms of the Unseen",
      year: "(1916)",
      risk: "alto",
      status: "restrito",
    },
    1918: {
      code: "8192",
      title: "The Null Convergence",
      year: "(1918)",
      risk: "critical",
      status: "perdido",
    },
    1921: {
      code: "9374",
      title: "Vesper Codex",
      year: "(1921)",
      risk: "alto",
      status: "restrito",
    },
    1925: {
      code: "1056",
      title: "Pale Architecture",
      year: "(1925)",
      risk: "alto",
      status: "restrito",
    },
    1928: {
      code: "2873",
      title: "The Hollow Operator",
      year: "(1928)",
      risk: "medio",
      status: "restrito",
    },
    1933: {
      code: "4691",
      title: "The Parallax Wound",
      year: "(1933)",
      risk: "critical",
      status: "restrito",
    },
    "0000": {
      code: "0000",
      title: "The Recursive Gospel",
      year: "(1939)",
      risk: "critical",
      status: "CLASSIFICADO",
    },
  };

  const bookDescriptions = {
    2847: {
      title: "ON THE THRESHOLD OF THE VEIL",
      content: `OBRA INAUGURAL DE GASTER - TEORIAS SOBRE O VÉU SEPARANDO PLANOS DIMENSIONAIS
DESCRIÇÃO: Primeira exploração científica dos limites entre realidades
CONTEÚDO: Equações fundamentais da separação dimensional
APLICAÇÕES: Base teórica para experimentos subsequentes`,
    },
    3092: {
      title: "THE QUANTIFICATION OF THE IMPOSSIBLE",
      content: `TRADUÇÃO DE FENÔMENOS PARANORMAIS EM FÓRMULAS MATEMÁTICAS
DESCRIÇÃO: Metodologia para análise quantitativa de eventos anômalos
CONTEÚDO: 247 equações para fenômenos não-euclidianos
AVISO: Requer autorização nível 3 para acesso completo`,
    },
    4751: {
      title: "CORPUS OBSCURA",
      content: `COMPÊNDIO DE RITUAIS E SÍMBOLOS - CULTOS EXTINTOS
DESCRIÇÃO: Documentação de práticas ocultistas pré-industriais
CONTEÚDO: 15 rituais completos, 400+ símbolos catalogados
AVISO: Não tentar reproduzir procedimentos descritos`,
    },
    5834: {
      title: "ECLIPSE OF CAUSALITY",
      content: `ESTUDO SOBRE PARADOXOS TEMPORAIS E LOOPS CAUSAIS
DESCRIÇÃO: Análise de eventos que precedem suas próprias causas
CONTEÚDO: 12 casos documentados de inversão temporal
RESULTADOS: Confirmação da não-linearidade temporal local`,
    },
    6921: {
      title: "FRACTURED SYMMETRY",
      content: `PADRÕES MATEMÁTICOS - QUEBRAS DE SIMETRIA ESPACIAL
DESCRIÇÃO: Geometrias impossíveis em espaços distorcidos
CONTEÚDO: Topologia de dimensões fraturadas
APLICAÇÕES: Navegação em espaços não-euclidianos`,
    },
    7483: {
      title: "AXIOMS OF THE UNSEEN",
      content: `SETE AXIOMAS FUNDAMENTAIS QUE REGEM O 'OUTRO LADO'
DESCRIÇÃO: Leis físicas alternativas em planos adjacentes
CONTEÚDO: Axiomas I-VII da física dimensional
IMPORTÂNCIA: Base para todos os experimentos subsequentes`,
    },
    8192: {
      title: "THE NULL CONVERGENCE",
      content: `DESCRIÇÃO DO PONTO DE CONVERGÊNCIA DIMENSIONAL
STATUS: ARQUIVO PERDIDO DURANTE INCIDENTE DE 1918
ÚLTIMA LOCALIZAÇÃO: Laboratório Principal - Setor 7
CONTEÚDO ESTIMADO: Coordenadas do ponto de convergência zero

<span class='error'>AVISO: DADOS CORROMPIDOS - RECUPERAÇÃO IMPOSSÍVEL</span>`,
    },
    9374: {
      title: "VESPER CODEX",
      content: `GUIA SOBRE ENTIDADES QUE EXISTEM ENTRE INSTANTES TEMPORAIS
DESCRIÇÃO: Catálogo de seres dimensionais
CONTEÚDO: 23 espécies catalogadas, protocolos de contato
PRECAUÇÃO: Não estabelecer comunicação direta`,
    },
    1056: {
      title: "PALE ARCHITECTURE",
      content: `DIAGRAMAS DE CONSTRUÇÕES GEOMETRICAMENTE IMPOSSÍVEIS
DESCRIÇÃO: Plantas arquitetônicas de estruturas interdimensionais
CONTEÚDO: 89 projetos, 200+ especificações técnicas
STATUS: Construção física confirmadamente impossível`,
    },
    2873: {
      title: "THE HOLLOW OPERATOR",
      content: `ENTIDADE QUE MANIPULA LEIS FÍSICAS SEM SER OBSERVADA DIRETAMENTE
DESCRIÇÃO: Fenômeno de alteração da realidade por presença invisível
COMPORTAMENTO: Modificação de constantes físicas locais
CONTATO: 3 encontros documentados (1925, 1927, 1928)`,
    },
    4691: {
      title: "THE PARALLAX WOUND",
      content: `ÚLTIMO LIVRO ANTES DO DESAPARECIMENTO DE W.D. GASTER
DESCRIÇÃO: Análise da 'ferida' na estrutura dimensional
CONTEÚDO: Localização da anomalia, métodos de reparo
DATA FINAL: 15 de setembro de 1933

<span class='warning'>NOTA: Gaster desapareceu 3 dias após completar este trabalho</span>`,
    },
  };

  class MatrixRain {
    constructor(canvas) {
      this.c = canvas;
      this.ctx = canvas.getContext("2d");
      this.running = false;
      this.columns = [];
      this.charSize = this.calcChar();
      this.resize();
      window.addEventListener("resize", () => {
        this.charSize = this.calcChar();
        this.resize();
      });
    }
    calcChar() {
      const colsTarget = Math.max(
        60,
        Math.min(110, Math.floor(window.innerWidth / 12))
      );
      return Math.max(
        12,
        Math.min(18, Math.floor((window.innerWidth / colsTarget) * 12))
      );
    }
    resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.c.width = Math.floor(w * dpr);
      this.c.height = Math.floor(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.floor(w / this.charSize);
      this.columns = new Array(cols).fill(0);
    }
    start() {
      if (this.running) return;
      this.running = true;
      this.c.style.display = "block";
      this.loop();
    }
    stop() {
      this.running = false;
      this.c.style.display = "none";
    }
    loop() {
      if (!this.running) return;
      const { ctx, c, charSize } = this;
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, c.width, c.height);
      const rootEl = document.getElementById("termRoot");
      ctx.fillStyle = getComputedStyle(rootEl).getPropertyValue("--fg").trim();
      ctx.font = `${charSize}px 'JetBrains Mono', monospace`;
      this.columns.forEach((y, i) => {
        const char = String.fromCharCode(0x30a0 + Math.random() * 96);
        const x = i * charSize;
        ctx.fillText(char, x, y);
        this.columns[i] =
          y > window.innerHeight + Math.random() * 1000 ? 0 : y + charSize;
      });
      requestAnimationFrame(() => this.loop());
    }
  }

  function escapeHtml(s) {
    return s.replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );
  }

  class Terminal {
    constructor() {
      this.out = $("#output");
      this.input = $("#input");
      this.inputLine = $("#inputLine");
      this.ts = $("#timestamp");
      this.ac = $("#ac");
      this.matrixCanvas = $("#matrixRain");
      this.matrix = new MatrixRain(this.matrixCanvas);

      // auth
      this.authenticated = false;
      this.currentUser = "GUEST";
      this.failedAttempts = 0;

      this.isProcessing = false;
      this.history = store.load();
      this.hIndex = -1;
      this.commands = this.registerCommands();
      this.allCmds = Object.keys(this.commands);
      this.bind();
      this.startIntro();
      this.tickClock();
      this.updateIdentityUI();
    }

    bind() {
      this.input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !this.isProcessing) {
          const raw = this.input.value;
          const command = raw.trim();
          if (command) {
            this.history.unshift(command);
            store.save(this.history);
          }
          this.hIndex = -1;
          this.print(
            `\n<span class='prompt' id='promptEcho'>${escapeHtml(
              this.promptText()
            )}</span> ${escapeHtml(command)}`
          );
          this.input.value = "";
          this.ac.style.display = "none";
          this.exec(command);
        }
      });
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (this.hIndex < this.history.length - 1) {
            this.hIndex++;
            this.input.value = this.history[this.hIndex];
            this.moveCaretToEnd();
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (this.hIndex > -1) {
            this.hIndex--;
            this.input.value =
              this.hIndex === -1 ? "" : this.history[this.hIndex];
            this.moveCaretToEnd();
          }
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.autocomplete();
        }
      });
      $("#rebootBtn").addEventListener("click", () => this.reboot());
      $("#matrixBtn").addEventListener("click", () => this.toggleMatrix());
      $("#themeBtn").addEventListener("click", () => this.toggleTheme());
      document.addEventListener("click", (e) => {
        if (e.target.closest(".autocomplete div")) {
          this.input.value = e.target.textContent;
          this.ac.style.display = "none";
          this.input.focus();
        }
      });

      // bloqueios leves
      document.addEventListener("contextmenu", (e) => e.preventDefault());
      document.addEventListener("keydown", (e) => {
        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
          (e.ctrlKey && e.key === "u")
        ) {
          e.preventDefault();
        }
      });

      // Konami
      let code = [];
      const seq = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "KeyB",
        "KeyA",
      ];
      document.addEventListener("keydown", (e) => {
        code.push(e.code);
        if (code.length > seq.length) code.shift();
        if (JSON.stringify(code) === JSON.stringify(seq)) {
          this.print(
            "\n<span class='success'>🎮 CÓDIGO KONAMI ATIVADO - MODO DESENVOLVEDOR HABILITADO 🎮</span>\n"
          );
          this.print(
            "<span class='intro-accent'>Novos comandos: debug, matrix, credits</span>\n"
          );
          code = [];
          A.beep(0.09, 880);
        }
      });

      // focar input
      window.addEventListener("click", () => this.input.focus());
      window.addEventListener("touchend", () => this.input.focus(), {
        passive: true,
      });
    }

    moveCaretToEnd() {
      const len = this.input.value.length;
      this.input.setSelectionRange(len, len);
    }

    tickClock() {
      const upd = () => {
        const n = new Date();
        this.ts.textContent = `${pad(n.getDate())}/${pad(
          n.getMonth() + 1
        )}/${n.getFullYear()} ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(
          n.getSeconds()
        )}`;
      };
      upd();
      setInterval(upd, 1000);
    }

    promptText() {
      return `${this.currentUser.toUpperCase()}@obscurus:~#`;
    }

    updateIdentityUI() {
      $("#userChip").textContent = `USER: ${this.currentUser.toUpperCase()}`;
      const promptEl = $("#prompt");
      promptEl.textContent = this.promptText();
      promptEl.style.color = this.authenticated ? "#4caf50" : "#ff4444";
      promptEl.style.textShadow = this.authenticated
        ? "0 0 8px #4caf50"
        : "0 0 5px #ff4444";
    }

    async startIntro() {
      this.isProcessing = true;
      this.inputLine.style.display = "none";
      await this.type(
        "<span class='intro-accent'>Inicializando sistema OBSCURUS...</span>",
        450
      );
      this.print(
        '<div class="loading-bar"><div class="loading-progress"></div></div>'
      );
      await this.delay(1200);

      const seq = [
        "<span class='intro-warning'>► Carregando módulos de segurança...</span>",
        "<span class='intro-accent'>► Montando sistema de arquivos criptografados...</span>",
        "<span class='intro-warning'>► Inicializando protocolos de contenção...</span>",
        "<span class='intro-accent'>► Conectando ao banco de dados OBSCURUS...</span>",
        "<span class='success'>► Verificação de integridade: OK</span>",
        " ",
        "ARQUIVO OBSCURUS - TERMINAL DE ACESSO",
        "<span class='classified'>CLEARANCE LEVEL: 5 - COSMIC</span>",
        "USUÁRIO ATUAL: <span class='warning'>GUEST</span>",
        "<span class='warning'>CLASSIFICAÇÃO: ULTRA SECRETO</span>",
        " ",
        `Sistema operacional desde 15.03.1897`,
        `Última sincronização: ${new Date().toISOString()}`,
        " ",
        "<span class='intro-accent'>► Indexando catálogo...</span>",
      ];
      for (const line of seq) {
        await this.type(line, 120);
      }

      // indexação do catálogo 5–10s
      const totalMs = 5000 + Math.floor(Math.random() * 5000);
      await this.indexCatalogLoad(totalMs);

      this.print("═══════════════════════════════════════════════");
      this.print(
        'Digite <span class="intro-accent">"help"</span> para ver comandos'
      );
      this.print(
        'Digite <span class="intro-accent">"catalog"</span> para acessar o catálogo'
      );
      this.print(
        'Digite <span class="intro-accent">"auth [senha]"</span> para autenticar'
      );
      this.print(
        'Digite <span class="intro-accent">"user"</span> para ver seu status'
      );
      this.isProcessing = false;
      this.inputLine.style.display = "flex";
      this.input.focus();
    }

    async indexCatalogLoad(totalMs) {
      const ids = Object.keys(books);
      const steps = ids.length + 2;
      const per = Math.max(120, Math.floor(totalMs / steps));
      for (const key of ids) {
        const b = books[key];
        if (key === "0000") {
          this.print(
            `• [${b.code}] índice protegido ........ <span class='success'>OK</span>`
          );
        } else {
          this.print(
            `• [${b.code}] ${b.title} ${b.year} ..... <span class='success'>OK</span>`
          );
        }
        await this.delay(per);
      }
      await this.delay(per);
      this.print("<span class='success'>► Catálogo indexado</span>\n");
      await this.delay(180);
    }

    async exec(raw) {
      const command = raw.trim();
      const name = command.split(/\s+/)[0]?.toLowerCase();
      const argstr = command.slice(name.length).trim();
      this.isProcessing = true;

      if (this.commands[name]) {
        try {
          await this.commands[name](argstr);
        } catch (e) {
          this.print(
            `\n<span class='error'>ERRO: ${escapeHtml(String(e))}</span>`
          );
        }
      } else if (/^\d{4}$/.test(name) && this.validCode(name)) {
        if (name === "0000") {
          if (!this.authenticated) {
            this.print(
              `\n<span class='critical'>ACESSO NEGADO</span> — arquivo <b>0000</b> é <span class='classified'>CLASSIFICADO</span>. Autentique com <span class='intro-accent'>auth [senha]</span>.\n`
            );
          } else {
            await this.recursiveGospel();
          }
        } else {
          await this.showBook(name);
        }
      } else if (name === "") {
        // vazio
      } else {
        this.print(
          `\n<span class='error'>ERRO: Comando '${escapeHtml(
            raw
          )}' não reconhecido</span>`
        );
        this.print(
          `<span class='warning'>Digite 'help' para ver comandos disponíveis</span>`
        );
        A.beep(0.08, 160);
      }
      this.isProcessing = false;
    }

    validCode(c) {
      return Object.values(books).some((b) => b.code === c);
    }

    registerCommands() {
      return {
        help: async () => {
          const t = [
            "\n<span class='success'>═══════════ COMANDOS ═══════════</span>",
            "<span class='intro-accent'>help</span>        - Ajuda",
            "<span class='intro-accent'>catalog</span>     - Lista arquivos",
            "<span class='intro-accent'>status</span>      - Status do sistema",
            "<span class='intro-accent'>history</span>     - Histórico de comandos",
            "<span class='intro-accent'>clear</span>       - Limpar tela",
            "<span class='intro-accent'>search [termo]</span> - Buscar no catálogo",
            "<span class='intro-accent'>theme</span>       - Alternar tema (default/violet/amber)",
            "<span class='intro-accent'>matrix</span>      - Alternar Matrix Rain",
            "<span class='intro-accent'>user</span>        - Informações do usuário (quem sou eu)",
            "<span class='intro-accent'>auth [senha]</span> - Autenticar (ex.: auth DARKER_YET_DARKER)",
            "<span class='intro-accent'>logout</span>      - Encerrar sessão",
            "<span class='intro-accent'>uptime</span>      - Tempo ativo",
            "<span class='intro-accent'>reboot</span>      - Reinicializa interface",
            "<span class='intro-accent'>credits</span>     - Créditos",
            "<span class='intro-accent'>debug</span>       - Info técnica",
            "<span class='intro-accent'>[código]</span>    - Acessa arquivo (4 dígitos)",
          ];
          for (const l of t) this.print(l);
        },
        catalog: async () => {
          this.print(
            "\n<span class='warning'>═══════════ CATÁLOGO OBSCURUS ═══════════</span>\n"
          );
          for (const k of Object.keys(books)) {
            if (k === "0000") continue;
            const b = books[k];
            const r = `risk-${b.risk}`;
            const s = `status-${b.status}`;
            if (!this.authenticated && b.status === "restrito") {
              this.print(
                `<span class='error'>${b.code}</span> - [ACESSO NEGADO] ${b.year}`
              );
              this.print(
                `     RISCO: <span class='${r}'>${b.risk.toUpperCase()}</span> | STATUS: <span class='${s}'>${b.status.toUpperCase()}</span>`
              );
            } else {
              this.print(
                `<span class='success'>${b.code}</span> - ${b.title} ${b.year}`
              );
              this.print(
                `     RISCO: <span class='${r}'>${b.risk.toUpperCase()}</span> | STATUS: <span class='${s}'>${b.status.toUpperCase()}</span>`
              );
            }
          }
          this.print("\nDigite o código para acessar um arquivo.\n");
        },
        status: async () => {
          const days = Math.floor(
            (Date.now() - new Date("1897-03-15").getTime()) /
              (1000 * 60 * 60 * 24)
          );
          let d = 0,
            r = 0,
            p = 0;
          Object.values(books).forEach((b) => {
            if (b.status === "disponível") d++;
            else if (b.status === "restrito") r++;
            else if (b.status === "perdido") p++;
          });
          this.print(
            "\n<span class='success'>═══════════ STATUS ═══════════</span>\n"
          );
          this.print(`Sistema: <span class='success'>OBSCURUS v4.0</span>`);
          this.print(
            `Tempo ativo: <span class='intro-accent'>${days} dias</span>`
          );
          this.print(
            `Usuário: <span class='success'>${this.currentUser.toUpperCase()}</span>`
          );
          this.print(
            `Autenticado: <span class='${
              this.authenticated ? "success" : "warning"
            }'>${this.authenticated ? "SIM" : "NÃO"}</span>`
          );
          this.print(
            `Nível de acesso: <span class='${
              this.authenticated ? "success" : "warning"
            }'>${this.authenticated ? "TOTAL" : "LIMITADO"}</span>\n`
          );
          this.print("Arquivos:");
          this.print(
            `• <span class='status-disponivel'>Disponíveis: ${d}</span>`
          );
          this.print(`• <span class='status-restrito'>Restritos: ${r}</span>`);
          this.print(`• <span class='status-perdido'>Perdidos: ${p}</span>\n`);
          this.print(`Integridade: <span class='success'>98.9%</span>`);
          this.print(
            `Última verificação: <span class='intro-accent'>${new Date().toLocaleTimeString(
              "pt-BR"
            )}</span>\n`
          );
        },
        history: async () => {
          this.print(
            "\n<span class='success'>═══════════ HISTÓRICO ═══════════</span>\n"
          );
          if (!this.history.length) this.print("Nenhum comando.");
          else
            this.history
              .slice(0, 12)
              .forEach((c, i) => this.print(`${i + 1}. ${escapeHtml(c)}`));
          this.print("\n");
        },
        clear: async () => {
          this.out.innerHTML = "";
        },
        cls: async () => {
          this.out.innerHTML = "";
        },
        search: async (term) => {
          if (!term) {
            this.print("\n<span class='warning'>Uso: search [termo]</span>");
            return;
          }
          this.print(
            `\n<span class='intro-accent'>Buscando por: "${escapeHtml(
              term
            )}"</span>\n`
          );
          let found = false;
          for (const k of Object.keys(books)) {
            const b = books[k];
            if (
              b.title.toLowerCase().includes(term.toLowerCase()) ||
              b.code.includes(term) ||
              b.year.includes(term)
            ) {
              const r = `risk-${b.risk}`;
              const s = `status-${b.status}`;
              if (!this.authenticated && b.status === "restrito") {
                this.print(
                  `<span class='error'>${b.code}</span> - [ACESSO NEGADO] ${b.year}`
                );
                this.print(
                  `     RISCO: <span class='${r}'>${b.risk.toUpperCase()}</span> | STATUS: <span class='${s}'>${b.status.toUpperCase()}</span>`
                );
              } else {
                this.print(
                  `<span class='success'>${b.code}</span> - ${b.title} ${b.year}`
                );
                this.print(
                  `     RISCO: <span class='${r}'>${b.risk.toUpperCase()}</span> | STATUS: <span class='${s}'>${b.status.toUpperCase()}</span>`
                );
              }
              found = true;
            }
          }
          if (!found)
            this.print(
              `<span class='warning'>Nenhum arquivo encontrado para: "${escapeHtml(
                term
              )}"</span>\n`
            );
        },
        theme: async () => this.toggleTheme(),
        matrix: async () => this.toggleMatrix(),

        user: async () => {
          this.print(
            `\nUsuário atual: <span class='success'>${this.currentUser.toUpperCase()}</span>`
          );
          this.print(
            `Autenticado: <span class='${
              this.authenticated ? "success" : "warning"
            }'>${this.authenticated ? "SIM" : "NÃO"}</span>`
          );
          this.print(`Clearance: <span class='classified'>COSMIC (5)</span>\n`);
        },

        auth: async (argstr) => {
          const pass = argstr.trim();
          if (!pass) {
            this.print(`\n<span class='warning'>Uso: auth [senha]</span>`);
            return;
          }
          this.print(
            `\n<span class='warning'>INICIANDO AUTENTICAÇÃO...</span>`
          );
          await this.delay(500);
          const ok = [
            "DARKER_YET_DARKER",
            "beware_of_the_man_who_speaks_in_hands",
          ].includes(pass);
          if (ok) {
            this.authenticated = true;
            this.currentUser = "GASTER";
            this.failedAttempts = 0;
            this.updateIdentityUI();
            this.print(
              `<span class='success'>✓ AUTENTICAÇÃO BEM-SUCEDIDA</span>`
            );
            this.print(
              `<span class='success'>Bem-vindo de volta, Dr. Gaster.</span>`
            );
            this.print(
              `<span class='intro-accent'>Acesso ampliado: arquivos restritos liberados.</span>`
            );
            A.beep(0.08, 960);
          } else {
            this.failedAttempts++;
            this.print(`<span class='error'>✗ FALHA NA AUTENTICAÇÃO</span>`);
            this.print(
              `<span class='error'>Tentativas falhas: ${this.failedAttempts}/3</span>`
            );
            A.beep(0.11, 180);
            if (this.failedAttempts >= 3) {
              this.print(
                `<span class='critical'>SISTEMA BLOQUEADO TEMPORARIAMENTE</span>`
              );
              await this.delay(1200);
              this.out.innerHTML = "";
              this.failedAttempts = 0;
            }
          }
        },
        logout: async () => {
          if (!this.authenticated) {
            this.print(
              `\n<span class='warning'>Nenhuma sessão autenticada para encerrar.</span>`
            );
            return;
          }
          this.print(`\n<span class='warning'>Encerrando sessão...</span>`);
          this.authenticated = false;
          this.currentUser = "GUEST";
          this.updateIdentityUI();
          A.beep(0.07, 420);
          this.print(
            `<span class='intro-accent'>Sessão encerrada. Acesso limitado restaurado.</span>`
          );
        },

        uptime: async () => {
          const ms = performance.now();
          const s = Math.floor(ms / 1000) % 60,
            m = Math.floor(ms / 60000) % 60,
            h = Math.floor(ms / 3600000);
          this.print(
            `\n${pad(h)}:${pad(m)}:${pad(s)} desde boot da interface\n`
          );
        },
        reboot: async () => this.reboot(),
        credits: async () => {
          const lines = [
            "\n<small class='mono-dim'>OBSCURUS Interface v4 — Pedro + GPT-5 Thinking</small>",
            "<small class='mono-dim'>Responsivo (clamp/100svh), boot 5–10s com indexação, wingdings em 30s.</small>",
            "<small class='mono-dim'>Pressione <span class='kbd'>TAB</span> para autocomplete.</small>\n",
          ];
          lines.forEach((l) => this.print(l));
        },
        debug: async () => {
          this.print(
            `\nUA: ${escapeHtml(navigator.userAgent)}\nDPR: ${
              window.devicePixelRatio
            }\nSize: ${window.innerWidth}x${window.innerHeight}\n`
          );
        },
      };
    }

    async showBook(code) {
      const b = Object.values(books).find((x) => x.code === code);
      const info = bookDescriptions[code];
      if (!this.authenticated && b.status === "restrito") {
        this.print(
          "\n<span class='critical'>ACESSO NEGADO</span> — arquivo restrito. Autentique com <span class='intro-accent'>auth [senha]</span>.\n"
        );
        return;
      }
      this.print("\n<span class='warning'>Iniciando acesso...</span>");
      await this.delay(700);
      this.print("<span class='success'>► Verificando permissões...</span>");
      await this.delay(350);
      this.print("<span class='success'>► Decifrando dados...</span>");
      await this.delay(600);
      this.print("<span class='success'>► ACESSO AUTORIZADO</span>\n");
      await this.delay(250);
      this.print("═══════════════════════════════════════════════");
      this.print(`<span class='classified'>${info.title}</span>`);
      this.print("═══════════════════════════════════════════════\n");
      this.print(`<span class='intro-accent'>CÓDIGO:</span> ${b.code}`);
      this.print(`<span class='intro-accent'>ANO:</span> ${b.year}`);
      this.print(
        `<span class='intro-accent'>NÍVEL DE RISCO:</span> <span class='risk-${
          b.risk
        }'>${b.risk.toUpperCase()}</span>`
      );
      this.print(
        `<span class='intro-accent'>STATUS:</span> <span class='status-${
          b.status
        }'>${b.status.toUpperCase()}</span>\n`
      );
      this.print("CONTEÚDO:\n─────────");
      for (const line of info.content.split("\n")) {
        this.print(line);
        await this.delay(140);
      }
      this.print("\n═══════════════════════════════════════════════\n");
    }

    async recursiveGospel() {
      this.print(
        "\n<span class='error'>TENTATIVA DE ACESSO AO ARQUIVO 0000...</span>"
      );
      await this.delay(700);
      this.print("<span class='warning'>► Verificando credenciais...</span>");
      await this.delay(700);
      this.print("<span class='error'>► FALHA DE AUTENTICAÇÃO</span>");
      await this.delay(350);
      this.print("<span class='critical'>► SISTEMA COMPROMETIDO</span>");
      await this.delay(350);
      $("#termRoot").classList.add("glitch");
      A.noise(1.8);
      A.toneSweep(1.6, 80, 28);

      const warnings = [
        `<span class='critical'>██████ ERRO CRÍTICO ██████</span>`,
        `<span class='critical'>█ O EVANGELHO RECURSIVO █</span>`,
        `<span class='critical'>██ NÃO DEVE SER VISTO ███</span>`,
        `<span class='critical'>███████ PERIGO ██████████</span>`,
        `<span class='critical'>████ DESCONECTANDO █████</span>`,
      ];
      for (const w of warnings) {
        this.print(w);
        await this.delay(220);
      }

      await this.delay(500);
      this.out.innerHTML = "";
      $("#termRoot").classList.remove("glitch");
      await this.delay(250);

      const totalWingdingsMs = 30000; // 30s
      const phrases = [
        "ENTRY NUMBER SEVENTEEN",
        "DARK DARKER YET DARKER",
        "THE DARKNESS KEEPS GROWING",
        "THE SHADOWS CUTTING DEEPER",
        "PHOTON READINGS NEGATIVE",
        "THIS NEXT EXPERIMENT",
        "SEEMS",
        "VERY",
        "VERY",
        "INTERESTING",
        "...",
        "WHAT DO YOU TWO THINK?",
      ];
      const perMsg = Math.max(
        300,
        Math.floor(totalWingdingsMs / phrases.length)
      );

      const ascii = `
<div class="ascii-art">
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠛⠛⠛⠛⠛⠛⠛⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡟⡏⠁⣶⣶⣶⣶⣶⣶⣶⣶⠉⠉⠉⡿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡿⣟⠛⢀⡀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣀⠛⢻⣿⣿⣿⣿
⣿⣿⣿⣿⡿⡟⠀⢸⡇⠀⣿⣿⣿⣿⣿⣿⡿⣟⡿⢿⣿⣿⠀⢸⣿⣿⣿⣿⡇
⣿⣿⣿⣿⡇⠀⣿⠛⢃⣀⣿⣿⣿⣿⣿⠛⠃⠀⠀⠘⠻⣿⣀⠘⠛⣿⣿⣿⡇
⣿⣿⣿⠉⠁⣶⣿⠀⠰⡿⣿⣿⡏⠉⣿⠀⠀⠀⠀⠀⠀⠉⣿⠂⠀⣿⣿⣿⣿
⣿⣿⣿⠀⠀⣿⣿⣀⡀⠀⣿⠟⠃⠀⣿⠁⠀⠀⠀⠀⠀⠀⣿⡁⠀⣿⣿⣿⣿⡇
⣿⣿⣿⠀⠀⣿⠉⢹⡇⠀⠉⠀⠀⠀⣿⠂⠀⠀⠀⠀⠀⠀⣿⠄⠀⣿⣿⣿⣿⡇
⣿⣿⣿⠀⠀⣿⣀⠀⠀⠀⠀⠀⢀⣀⣿⣿⣇⣀⠀⢀⣠⣿⣿⡀⠀⣿⣿⣿⣿
⣿⣿⣿⠀⢀⣿⣿⣤⡄⠀⠀⢠⣼⣿⣿⣿⣿⣟⠀⢸⣿⣿⣿⠀⠀⣿⣿⣿⡇
⣿⣿⣿⣿⡇⠀⣿⣿⡟⠛⣿⣿⣿⣿⣿⣿⣿⣯⠀⠘⠻⣿⣿⡀⠀⣿⣿⣿
⣿⣿⣿⣿⡇⠀⣿⣿⡇⠀⠉⢹⣿⣿⣿⣿⣿⡷⠀⠀⠀⣿⠉⢠⣴⣿⣿⣿⡇
⣿⣿⣿⣿⣷⣟⠀⣸⣿⣷⣀⠀⠸⠿⠿⠀⠀⠀⣀⣸⡿⠿⣀⣸⣿⣿⣿⣿⡇
⣿⣿⣿⣿⣿⣿⣤⠈⠹⣿⣿⣦⡄⠀⠀⠀⠀⠀⣿⣿⡇⠀⣿⣿⣿⣿⣿⣿⡇
⣿⣿⣿⣿⡿⠷⠀⠀⠘⠿⣿⣿⣷⣷⣀⣀⣈⣾⠿⠀⠀⠿⣿⣿⣿⣿⣿⣿⡇
⣿⣿⣿⣻⡇⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠉⠋⠉⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⡇
⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣟⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⡇
⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣽⣯⣿⣿⣟⠀⠀⠀⠀⠀⠘⠻⣿⣿⣿⣿⣿⡇
⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣯⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⡇
⣿⡿⠛⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⡟⠓⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⡇
⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢹⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⡇
⣿⡧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⡇
⣿⣇⠀⠀⠀⠀⣤⣤⡄⠀⠀⠀⠈⠉⣿⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠉⣿⣿⣿⣿
⡇⠀⠀⢀⣀⣮⣀⣀⣀⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⠀⠀⠀⠀⣿⣿⣿⣿
⡇⠀⠀⢸⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⣤⣼⡏⠉⣤⠄⠀⠀⣿⣿⣿⡇
⡇⠀⠀⠼⢿⣿⣿⣿⡿⠯⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣇⣀⣿⠂⠀⠀⣿⣿⣿⡇
⡇⠀⠀⠀⠀⠛⠘⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠋⢹⣿⣿⠉⠁⠀⠀⣿⣿⣿⣿
⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ⣿⣿⣿⣿
⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ⣿⣿⣿⣿
⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀  ⣿⣿⣿⣿
⣧⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤  ⣿⣿⣿⡇
⣿⣿⣶⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣿⣿⣿⣿⣿⡇
⣿⣿⣿⣿⣧⣤⣤⣤⣤⣤⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣤⣼⣿⣿⣿⣿⣿⡇
⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⡇
</div>`;
      this.print(ascii);

      for (let i = 0; i < phrases.length; i++) {
        this.print(`<div class="wingdings">${phrases[i]}</div>`);
        A.noise(0.3);
        await this.delay(perMsg);
      }

      this.print(`\n<span class="success">Fim da transmissão.</span>`);
      this.print(
        `<span class="warning">Sistema retornando ao estado normal...</span>\n`
      );
    }

    async endRecursive() {
      await this.delay(800);
      this.print("\n<span class='error'>CONEXÃO PERDIDA...</span>");
      await this.delay(700);
      this.print("<span class='warning'>Reinicializando sistema...</span>\n");
      await this.delay(500);
      this.reboot(false);
      this.print("<span class='success'>Sistema restaurado.</span>");
      this.print(
        "<span class='intro-accent'>Digite 'help' para continuar.</span>\n"
      );
    }

    reboot(showIntro = true) {
      this.out.innerHTML = "";
      if (showIntro) this.startIntro();
    }

    toggleTheme() {
      const root = document.getElementById("termRoot");
      const order = ["default", "violet", "amber"];
      const cur = root.getAttribute("data-theme") || "default";
      const next = order[(order.indexOf(cur) + 1) % order.length];
      root.setAttribute("data-theme", next);
      this.print(`\nTema: ${next}\n`);
    }

    toggleMatrix() {
      if (this.matrix.running) {
        this.matrix.stop();
        this.print("\nMatrix Rain: OFF\n");
      } else {
        this.matrix.start();
        this.print("\nMatrix Rain: ON\n");
      }
    }

    autocomplete() {
      const v = this.input.value.trim();
      if (!v) {
        this.ac.style.display = "none";
        return;
      }
      const opts = this.allCmds.filter((c) => c.startsWith(v));
      if (!opts.length) {
        this.ac.style.display = "none";
        return;
      }
      this.ac.innerHTML = opts.map((o) => `<div>${o}</div>`).join("");
      this.ac.style.display = "block";
    }

    async type(text, delayMs = 50) {
      this.print(text);
      await this.delay(delayMs);
    }
    print(text) {
      this.out.innerHTML += text + "\n";
      this.scroll();
    }
    scroll() {
      this.out.scrollTop = this.out.scrollHeight;
    }
    delay(ms) {
      return new Promise((r) => setTimeout(r, ms));
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    window.term = new Terminal();
  });
})();
