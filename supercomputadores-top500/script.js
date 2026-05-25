/* =============================================
   TOP500 — SCRIPT PRINCIPAL
   Engenharia de Computação
   ============================================= */

'use strict';

/* =============================================
   1. LOADING SCREEN
   ============================================= */
(function initLoading() {
    const screen    = document.getElementById('loading-screen');
    const bar       = document.getElementById('loading-bar');
    const percent   = document.getElementById('loading-percent');
    const statusEl  = document.getElementById('loading-status');

    const messages = [
        'Inicializando sistema...',
        'Carregando módulos HPC...',
        'Conectando nós de processamento...',
        'Calibrando sensores...',
        'Sistema pronto.',
    ];

    let progress  = 0;
    let msgIndex  = 0;
    const duration = 2400; // ms total
    const interval = 40;   // ms por tick

    const timer = setInterval(() => {
        progress = Math.min(progress + (100 / (duration / interval)), 100);
        const p = Math.round(progress);
        bar.style.width     = p + '%';
        percent.textContent = p + '%';

        // Mensagens progridem com o carregamento
        const newMsg = Math.floor((p / 100) * (messages.length - 1));
        if (newMsg !== msgIndex) {
            msgIndex = newMsg;
            statusEl.textContent = messages[msgIndex];
        }

        if (progress >= 100) {
            clearInterval(timer);
            statusEl.textContent = messages[messages.length - 1];
            setTimeout(() => {
                screen.classList.add('hidden');
                document.body.style.overflow = '';
                // Inicia animações após o loading
                initHeroCounters();
                initParticles();
            }, 400);
        }
    }, interval);

    // Evita scroll durante loading
    document.body.style.overflow = 'hidden';
})();


/* =============================================
   2. PARTÍCULAS DIGITAIS (CANVAS)
   ============================================= */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx    = canvas.getContext('2d');

    let W, H, particles, lines;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    /* Cria partícula */
    function createParticle() {
        return {
            x:     Math.random() * W,
            y:     Math.random() * H,
            vx:    (Math.random() - 0.5) * 0.4,
            vy:    (Math.random() - 0.5) * 0.4,
            r:     Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.1,
            color: Math.random() > 0.5 ? '#00d4ff' : '#66fcf1',
            life:  Math.random() * 200 + 100,
            age:   0,
        };
    }

    function initParticleSet() {
        particles = [];
        const count = Math.min(80, Math.floor((W * H) / 18000));
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    /* Linhas digitais (movem na tela) */
    function createLine() {
        const horizontal = Math.random() > 0.5;
        return {
            horizontal,
            x:     horizontal ? -200 : Math.random() * W,
            y:     horizontal ? Math.random() * H : -100,
            speed: Math.random() * 0.6 + 0.2,
            length: Math.random() * 120 + 40,
            alpha: Math.random() * 0.15 + 0.05,
            width: Math.random() > 0.8 ? 1.5 : 0.5,
        };
    }

    function initLines() {
        lines = [];
        for (let i = 0; i < 12; i++) {
            const l = createLine();
            if (l.horizontal) l.x = Math.random() * W;
            else              l.y = Math.random() * H;
            lines.push(l);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        /* === Linhas digitais === */
        lines.forEach((l, i) => {
            ctx.save();
            ctx.globalAlpha = l.alpha;
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth   = l.width;
            ctx.beginPath();
            if (l.horizontal) {
                ctx.moveTo(l.x, l.y);
                ctx.lineTo(l.x + l.length, l.y);
                l.x += l.speed;
                if (l.x > W + 200) lines[i] = createLine();
            } else {
                ctx.moveTo(l.x, l.y);
                ctx.lineTo(l.x, l.y + l.length);
                l.y += l.speed;
                if (l.y > H + 200) { lines[i] = createLine(); lines[i].horizontal = false; }
            }
            ctx.stroke();
            ctx.restore();
        });

        /* === Partículas === */
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.age++;

            // Fade in/out
            let alpha = p.alpha;
            if (p.age < 30) alpha = p.alpha * (p.age / 30);
            if (p.age > p.life - 30) alpha = p.alpha * ((p.life - p.age) / 30);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur  = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Renova partícula ao morrer ou sair da tela
            if (p.age >= p.life || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
                particles[i] = createParticle();
            }
        });

        /* === Conexões entre partículas próximas === */
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 100) {
                    ctx.save();
                    ctx.globalAlpha = (1 - d / 100) * 0.08;
                    ctx.strokeStyle = '#00d4ff';
                    ctx.lineWidth   = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    resize();
    initParticleSet();
    initLines();
    draw();

    window.addEventListener('resize', () => {
        resize();
        initParticleSet();
        initLines();
    });
}


/* =============================================
   3. NAVEGAÇÃO — SCROLL + MENU ATIVO
   ============================================= */
(function initNav() {
    const navbar   = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const toggle   = document.getElementById('nav-toggle');
    const navList  = document.querySelector('.nav-links');
    const btt      = document.getElementById('back-to-top');

    // Navbar scroll + back-to-top
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 50);
        btt.classList.toggle('visible', y > 400);
        updateActiveLink();
    });

    // Back to top
    btt.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Mobile toggle — anima hamburguer → X
    toggle.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        // Bloqueia scroll do body quando menu está aberto
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Fechar menu ao clicar em link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('open');
            toggle.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', e => {
        if (navList.classList.contains('open') &&
            !navList.contains(e.target) &&
            !toggle.contains(e.target)) {
            navList.classList.remove('open');
            toggle.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    // Destaca seção ativa
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        let current = '';
        sections.forEach(s => {
            if (window.scrollY + 100 >= s.offsetTop) current = s.id;
        });
        navLinks.forEach(l => {
            l.classList.toggle('active', l.dataset.section === current);
        });
    }
})();


/* =============================================
   4. ANIMAÇÕES DE SCROLL — REVEAL
   ============================================= */
(function initReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const delay = parseFloat(e.target.dataset.delay || 0) * 1000;
                setTimeout(() => {
                    e.target.classList.add('visible');
                    // Inicia barras de desempenho quando ficam visíveis
                    e.target.querySelectorAll('[data-width]').forEach(bar => {
                        bar.style.width = bar.dataset.width + '%';
                    });
                }, delay);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .machine-card').forEach(el => obs.observe(el));
})();


/* =============================================
   5. CONTADORES ANIMADOS — HERO
   ============================================= */
function initHeroCounters() {
    document.querySelectorAll('.hstat-value[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        const duration = 1800;
        const start = performance.now();

        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
            el.textContent = Math.round(ease * target).toLocaleString('pt-BR');
            if (t < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    });
}


/* =============================================
   6. BARRAS DE DESEMPENHO — COMPARAÇÃO
   ============================================= */
(function initComparisonBars() {
    const barObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.pbi-fill, .eb-fill, .dpb-fill').forEach(bar => {
                    setTimeout(() => {
                        bar.style.width = bar.dataset.width + '%';
                    }, 200);
                });
                barObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.perf-comparison, .energy-chart, .detail-perf-bar').forEach(el => {
        barObs.observe(el);
    });
})();


/* =============================================
   7. SW26010 — GRID DE NÚCLEOS
   ============================================= */
(function initSW26010() {
    const grid = document.getElementById('sw-cores-vis');
    if (!grid) return;

    // 8 colunas × 8 linhas = 64 cores visuais (representando os 64 CPCs)
    for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.className = 'sw-core-cell';
        grid.appendChild(cell);
    }

    // Anima núcleos aleatoriamente
    const cells = grid.querySelectorAll('.sw-core-cell');
    const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        // Acende progressivamente
        cells.forEach((cell, i) => {
            setTimeout(() => {
                cell.classList.add('active');
            }, i * 30);
        });

        // Pulsa aleatoriamente depois
        setInterval(() => {
            cells.forEach(cell => {
                if (Math.random() > 0.6) {
                    cell.classList.toggle('active');
                }
            });
        }, 1200);

        obs.unobserve(grid);
    }, { threshold: 0.3 });

    obs.observe(grid);
})();


/* =============================================
   8. SIMULADOR INTERATIVO
   ============================================= */
(function initSimulator() {

    /* === DADOS DAS MÁQUINAS === */
    const machineData = {
        'el-capitan': {
            name:     'El Capitan',
            pflops:   1809,
            power:    29684,
            cores:    4600000,
            dispCores: 400,
        },
        'harpia': {
            name:     'Harpia',
            pflops:   120.38,
            power:    1840,
            cores:    200000,
            dispCores: 400,
        },
        'sunway': {
            name:     'Sunway TaihuLight',
            pflops:   93.01,
            power:    15371,
            cores:    10649600,
            dispCores: 400,
        },
    };

    /* === PERFIS DE TAREFA ===
       Valores em % de carga de cada recurso */
    const taskProfiles = {
        ia: {
            name:    'Inteligência Artificial',
            cpu:     65, gpu: 98, mem: 88, net: 45,
            color:   '#00d4ff',
            coreLoad: 0.9,
            logs: [
                'Carregando dataset de treinamento...',
                'Inicializando camadas da rede neural...',
                'Forward pass — batch 1/4096...',
                'Calculando gradientes (backprop)...',
                'Atualizando pesos — otimizador AdamW...',
                'GPU utilization: 98.2% — PFLOPS máximos.',
                'Loss: 2.341 → 1.876 → 1.203...',
                'Checkpoint salvo: epoch_12.pt',
            ],
        },
        clima: {
            name:    'Previsão Climática',
            cpu:     92, gpu: 40, mem: 95, net: 70,
            color:   '#66fcf1',
            coreLoad: 0.8,
            logs: [
                'Inicializando modelo atmosférico WRF...',
                'Particionando grade global 0.1° × 0.1°...',
                'Distribuindo domínio entre 40.960 nós...',
                'Calculando dinâmica de fluidos atmosféricos...',
                'Processando dados de satélite GOES-16...',
                'Integração temporal: Δt = 60s...',
                'Previsão de 7 dias gerada em 4 minutos.',
            ],
        },
        petroleo: {
            name:    'Exploração de Petróleo',
            cpu:     80, gpu: 75, mem: 92, net: 85,
            color:   '#4ade80',
            coreLoad: 0.75,
            logs: [
                'Carregando cubo sísmico 3D — 12 TB...',
                'Aplicando migração RTM (Reverse Time)...',
                'Processando 80.000 tiros sísmicos...',
                'Análise de amplitude versus offset (AVO)...',
                'Identificando anomalias de bright spot...',
                'Gerando mapa de reservatórios candidatos...',
                'Estimativa de volume: 2.3 bilhões de barris.',
            ],
        },
        dados: {
            name:    'Ciência de Dados',
            cpu:     78, gpu: 60, mem: 82, net: 95,
            color:   '#a78bfa',
            coreLoad: 0.65,
            logs: [
                'Conectando ao sistema de arquivos Lustre...',
                'Lendo 47 TB de dados brutos...',
                'Paralelizando pipeline com MPI...',
                'Aplicando filtros e transformações...',
                'Executando análise estatística distribuída...',
                'Gerando visualizações e relatórios...',
                'Pipeline concluído — 12 min vs 48h no servidor.',
            ],
        },
        simulacao: {
            name:    'Simulação Científica',
            cpu:     95, gpu: 85, mem: 90, net: 60,
            color:   '#fb923c',
            coreLoad: 0.95,
            logs: [
                'Configurando simulação de dinâmica molecular...',
                'Inicializando 10^9 partículas...',
                'Calculando forças de Lennard-Jones...',
                'Integrando equações de Newton — Δt = 1 fs...',
                'Passo 1.000.000 / 10.000.000...',
                'Energia do sistema: -3.241 eV/átomo',
                'Configuração estrutural exportada para análise.',
            ],
        },
    };

    /* === ESTADO === */
    let state = {
        machine:    'el-capitan',
        task:       null,
        running:    false,
        interval:   null,
        logInterval: null,
        logIdx:     0,
        tStart:     0,
    };

    /* === ELEMENTOS DOM === */
    const statusBadge  = document.getElementById('sim-status-badge');
    const cpuBar       = document.getElementById('cpu-bar');
    const gpuBar       = document.getElementById('gpu-bar');
    const memBar       = document.getElementById('mem-bar');
    const netBar       = document.getElementById('net-bar');
    const cpuVal       = document.getElementById('cpu-val');
    const gpuVal       = document.getElementById('gpu-val');
    const memVal       = document.getElementById('mem-val');
    const netVal       = document.getElementById('net-val');
    const sdmPflops    = document.getElementById('sdm-pflops');
    const sdmTemp      = document.getElementById('sdm-temp');
    const sdmPower     = document.getElementById('sdm-power');
    const sdmData      = document.getElementById('sdm-data');
    const coresCount   = document.getElementById('cores-count');
    const coresGrid    = document.getElementById('cores-grid');
    const simLog       = document.getElementById('sim-log');
    const nbBar        = document.getElementById('nb-bar');
    const srvBar       = document.getElementById('srv-bar');
    const supBar       = document.getElementById('sup-bar');
    const nbVal        = document.getElementById('nb-val');
    const srvVal       = document.getElementById('srv-val');
    const supVal       = document.getElementById('sup-val');
    const tempIndicator = document.getElementById('temp-indicator');

    /* === GERA GRID DE NÚCLEOS (400 desktop / 200 mobile) === */
    const isMobile = () => window.innerWidth <= 640;

    function buildCoresGrid() {
        coresGrid.innerHTML = '';
        const count = isMobile() ? 200 : 400;
        for (let i = 0; i < count; i++) {
            const core = document.createElement('div');
            core.className = 'sim-core';
            core.dataset.idx = i;
            coresGrid.appendChild(core);
        }
    }
    buildCoresGrid();

    // Reconstrói o grid se a tela for redimensionada entre mobile e desktop
    let prevMobile = isMobile();
    window.addEventListener('resize', () => {
        const nowMobile = isMobile();
        if (nowMobile !== prevMobile) {
            prevMobile = nowMobile;
            buildCoresGrid();
        }
    });

    /* === ATUALIZA SELEÇÃO DE MÁQUINA === */
    document.querySelectorAll('.sim-machine-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sim-machine-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.machine = btn.dataset.machine;
            if (state.running) startSimulation(); // Reinicia com nova máquina
        });
    });

    /* === SELEÇÃO DE TAREFA === */
    document.querySelectorAll('.sim-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sim-task-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.task = btn.dataset.task;
            startSimulation();
        });
    });

    /* === INICIA SIMULAÇÃO === */
    function startSimulation() {
        if (state.interval)    clearInterval(state.interval);
        if (state.logInterval) clearInterval(state.logInterval);

        state.running = true;
        state.tStart  = Date.now();
        state.logIdx  = 0;

        const machine = machineData[state.machine];
        const profile = taskProfiles[state.task] || taskProfiles.ia;

        statusBadge.textContent = 'EM EXECUÇÃO';
        statusBadge.classList.add('running');

        addLog(`[INIT] Iniciando ${profile.name} em ${machine.name}...`, 'active');

        /* Animação suave dos recursos */
        animateMetric(cpuBar, cpuVal, profile.cpu, val => val + '%');
        animateMetric(gpuBar, gpuVal, profile.gpu, val => val + '%');
        animateMetric(memBar, memVal, profile.mem, val => val + '%');
        animateMetric(netBar, netVal, profile.net, val => (profile.net * 4).toFixed(0) + ' GB/s');

        /* Temperatura */
        const tempTarget = 22 + Math.round(
            (profile.cpu + profile.gpu) / 200 * 65
        ); // entre 22°C e 87°C
        animateValue(22, tempTarget, 1500, v => {
            sdmTemp.textContent = v + '°C';
            const ratio = (v - 22) / 65;
            tempIndicator.style.transform = `scaleX(${ratio})`;
            sdmTemp.style.color = v > 70 ? '#ef4444' : v > 50 ? '#eab308' : '#22c55e';
        });

        /* PFLOPS (flutua em torno do target) */
        const pflopsTarget = machine.pflops * (profile.gpu / 100) * 0.95;
        animateValue(0, pflopsTarget, 2000, v => {
            sdmPflops.textContent = v < 1 ? v.toFixed(3) : v.toFixed(1);
        });

        /* Consumo de energia */
        const powerTarget = Math.round(machine.power * (profile.cpu / 100));
        animateValue(0, powerTarget, 1800, v => {
            sdmPower.textContent = formatNumber(v) + ' kW';
        });

        /* Transferência de dados */
        const dataTarget = (profile.net / 100) * 400;
        animateValue(0, dataTarget, 1500, v => {
            sdmData.textContent = v.toFixed(0) + ' GB/s';
        });

        /* Núcleos ativos */
        const activeCores = Math.round(machine.dispCores * profile.coreLoad);
        animateCores(activeCores);
        animateValue(0, activeCores, 1200, v => {
            coresCount.textContent = formatNumber(Math.round(v)) + ' ativos';
        });

        /* Comparação de escala */
        animateValue(0, 100, 1200, v => {
            nbBar.style.width  = (v * 0.002).toFixed(2) + '%';  // notebook é ínfimo
            srvBar.style.width = Math.min(v * 0.03, 3) + '%';     // servidor = ~3%
        });
        supBar.style.width = '100%';
        supVal.textContent = machine.pflops + ' PFLOPS';
        nbVal.textContent  = '~0.01 TFLOPS';
        srvVal.textContent = '~0.1 PFLOPS';

        /* Variações em tempo real */
        state.interval = setInterval(() => {
            const jitter = () => (Math.random() - 0.5) * 4;
            updateBar(cpuBar, cpuVal, profile.cpu + jitter(), '%');
            updateBar(gpuBar, gpuVal, profile.gpu + jitter(), '%');

            // Flutua PFLOPS levemente
            const pFluctuation = pflopsTarget * (1 + (Math.random() - 0.5) * 0.04);
            sdmPflops.textContent = pFluctuation < 1
                ? pFluctuation.toFixed(3)
                : pFluctuation.toFixed(2);
        }, 1800);

        /* Log de eventos */
        state.logInterval = setInterval(() => {
            const msgs = profile.logs;
            if (state.logIdx < msgs.length) {
                addLog(msgs[state.logIdx], 'success');
                state.logIdx++;
            } else {
                addLog('[LOOP] Reiniciando ciclo de processamento...', 'active');
                state.logIdx = 0;
            }
        }, 2400);
    }

    /* === ANIMA MÉTRICA (barra + valor) === */
    function animateMetric(bar, valEl, target, format) {
        const start = performance.now();
        const duration = 1200;
        const clamp = v => Math.max(0, Math.min(100, v));

        function tick(now) {
            const t    = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            const v    = clamp(ease * target);
            bar.style.width    = v + '%';
            valEl.textContent  = format(Math.round(v));
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    /* === ANIMA VALOR GENÉRICO === */
    function animateValue(from, to, duration, callback) {
        const start = performance.now();
        function tick(now) {
            const t    = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            callback(from + (to - from) * ease);
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    /* === ATUALIZA BARRA SEM ANIMAÇÃO COMPLETA === */
    function updateBar(bar, valEl, target, suffix) {
        const v = Math.max(0, Math.min(100, target));
        bar.style.width   = v + '%';
        valEl.textContent = Math.round(v) + suffix;
    }

    /* === ANIMA NÚCLEOS === */
    function animateCores(count) {
        const cores = Array.from(coresGrid.querySelectorAll('.sim-core'));
        let activated = 0;

        // Desativa todos primeiro
        cores.forEach(c => {
            c.classList.remove('active', 'hot', 'peak');
        });

        // Ativa progressivamente
        const activateNext = () => {
            if (activated >= count) {
                // Pulsa continuamente alguns núcleos "quentes"
                startCoreFlicker(cores, count);
                return;
            }
            const batchSize = Math.ceil(count / 20);
            for (let i = 0; i < batchSize && activated < count; i++) {
                const idx = Math.floor(Math.random() * cores.length);
                if (!cores[idx].classList.contains('active')) {
                    cores[idx].classList.add('active');
                    activated++;
                }
            }
            setTimeout(activateNext, 60);
        };
        activateNext();
    }

    let flickerInterval = null;
    function startCoreFlicker(cores, activeCount) {
        if (flickerInterval) clearInterval(flickerInterval);
        flickerInterval = setInterval(() => {
            const activeCores = Array.from(cores).filter(c => c.classList.contains('active'));
            // Alguns ficam "hot"
            activeCores.forEach(c => {
                if (Math.random() > 0.85) {
                    c.classList.add('hot');
                    setTimeout(() => c.classList.remove('hot'), 300);
                }
                if (Math.random() > 0.97) {
                    c.classList.add('peak');
                    setTimeout(() => c.classList.remove('peak'), 200);
                }
            });
        }, 150);
    }

    /* === ADICIONA LOG === */
    function addLog(msg, type) {
        const entry = document.createElement('p');
        entry.className = `log-entry ${type || ''}`;
        entry.textContent = '[' + new Date().toLocaleTimeString('pt-BR') + '] ' + msg;
        simLog.appendChild(entry);
        simLog.scrollTop = simLog.scrollHeight;

        // Limita log a 20 entradas
        while (simLog.children.length > 20) {
            simLog.removeChild(simLog.firstChild);
        }
    }

    /* === FORMATA NÚMERO GRANDE === */
    function formatNumber(n) {
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return Math.round(n).toString();
    }

})();


/* =============================================
   9. SCROLL PARA DETALHE (botões dos cards)
   ============================================= */
function scrollToDetail(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}


/* =============================================
   10. IMAGENS — FALLBACK HANDLER
   ============================================= */
(function handleImageFallbacks() {
    // Quando imagem carrega com sucesso, esconde o fallback
    document.querySelectorAll('.detail-main-img img').forEach(img => {
        img.addEventListener('load', () => {
            const fallback = img.nextElementSibling;
            if (fallback) fallback.style.display = 'none';
        });
    });

    // Quando imagem falha, garante que o fallback aparece
    document.querySelectorAll('.mc-image').forEach(img => {
        img.addEventListener('error', () => {
            img.style.display = 'none';
            const container = img.closest('.mc-image-container');
            if (container) container.classList.add('mc-no-img');
        });
    });
})();


/* =============================================
   11. EFEITO DE HOVER NAS PARTÍCULAS DO HERO
   ============================================= */
(function heroParallax() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    hero.addEventListener('mousemove', e => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const mx = (clientX / innerWidth  - 0.5) * 20;
        const my = (clientY / innerHeight - 0.5) * 20;

        const visual = document.querySelector('.hero-visual');
        if (visual) {
            visual.style.transform = `translate(${mx * 0.3}px, ${my * 0.3}px)`;
        }

        // HUD indicators parallax suave
        document.querySelectorAll('.hud-indicator').forEach((hud, i) => {
            const factor = (i % 2 === 0) ? 0.12 : -0.12;
            const currentAnim = parseFloat(
                getComputedStyle(hud).getPropertyValue('animation-duration')
            );
            hud.style.transform = `translate(${mx * factor}px, ${my * factor}px)`;
        });
    });

    hero.addEventListener('mouseleave', () => {
        const visual = document.querySelector('.hero-visual');
        if (visual) visual.style.transform = '';
        document.querySelectorAll('.hud-indicator').forEach(h => {
            h.style.transform = '';
        });
    });
})();


/* =============================================
   12. ANIMAÇÃO DE NÚMEROS NA TABELA
   ============================================= */
(function animateTableNumbers() {
    const tableObs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;

        // Pequeno efeito de highlight nas células ao aparecer
        const cells = document.querySelectorAll('.comp-table td');
        cells.forEach((cell, i) => {
            setTimeout(() => {
                cell.style.opacity = '0';
                cell.style.transform = 'translateY(5px)';
                cell.style.transition = 'opacity 0.3s, transform 0.3s';
                setTimeout(() => {
                    cell.style.opacity = '';
                    cell.style.transform = '';
                }, 50);
            }, i * 15);
        });

        tableObs.disconnect();
    }, { threshold: 0.2 });

    const table = document.querySelector('.comp-table-wrapper');
    if (table) tableObs.observe(table);
})();


/* =============================================
   13. DESTAQUE DE SEÇÃO ativa no scroll
   ============================================= */
(function sectionHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.id;
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.toggle('active', link.dataset.section === id);
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-68px 0px 0px 0px',
    });

    sections.forEach(s => obs.observe(s));
})();


/* =============================================
   14. CARDS — DELAY DE REVEAL
   ============================================= */
(function setupCardDelays() {
    // Machine cards já têm data-delay via atributo HTML
    // App cards também
    document.querySelectorAll('.app-card').forEach((card, i) => {
        card.style.transitionDelay = (i * 0.1) + 's';
    });

    document.querySelectorAll('.eng-pillar').forEach((pillar, i) => {
        pillar.style.transitionDelay = (i * 0.08) + 's';
    });

    document.querySelectorAll('.dspec-card').forEach((card, i) => {
        card.style.transitionDelay = (i * 0.05) + 's';
    });
})();


/* =============================================
   15. VISITA — DATA CENTER ART ANIMATION
   ============================================= */
(function visitAnimation() {
    const visitObs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        // Anima racks ligando luzes
        const racks = document.querySelectorAll('.dc-rack');
        racks.forEach((rack, i) => {
            setTimeout(() => {
                rack.style.opacity = '1';
                rack.style.transform = 'scaleY(1)';
            }, i * 120);
        });
        visitObs.disconnect();
    }, { threshold: 0.3 });

    const visitSection = document.getElementById('visita');
    if (visitSection) visitObs.observe(visitSection);
})();


/* =============================================
   16. INDICADOR DE TEMPERATURA DO SIMULADOR
   ============================================= */
(function() {
    // Inicializa estilos dos dc-racks
    document.querySelectorAll('.dc-rack').forEach(rack => {
        rack.style.opacity = '0';
        rack.style.transform = 'scaleY(0.5)';
        rack.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        rack.style.transformOrigin = 'bottom';
    });
})();


/* =============================================
   17. SMOOTH SCROLL PARA LINKS
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            const offset = 68; // altura da navbar
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});


/* =============================================
   18. CONSOLE EASTER EGG
   ============================================= */
console.log('%cTOP500 — Supercomputadores', 'color:#00d4ff; font-family:monospace; font-size:18px; font-weight:bold;');
console.log('%cEngenharia de Computação', 'color:#66fcf1; font-family:monospace; font-size:12px;');
console.log('%c▶ El Capitan: 1.809 PFLOPS | Harpia: 120.38 PFLOPS | Sunway: 93.01 PFLOPS', 'color:#94a3b8; font-family:monospace; font-size:11px;');
