'use strict';
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDR2GR6eb294KoBuLpPn6T_mjO50d8aGgo",
  authDomain:        "siteexemplo-31f99.firebaseapp.com",
  databaseURL:       "https://siteexemplo-31f99-default-rtdb.firebaseio.com",
  projectId:            "siteexemplo-31f99",
  storageBucket:     "siteexemplo-31f99.firebasestorage.app",
  messagingSenderId: "690569274541",
  appId:             "1:690569274541:web:f0bf16fb0ab7e34baa5224"
};

firebase.initializeApp(FIREBASE_CONFIG);
const _db = firebase.database();
// ── STATE ───────────────────────────────────────────────────────
let cur = 'car', cartN = 0, favs = new Set(), toastT = null, restTab = 'Entradas';

const THEMES = {
  car:        {label:'Concessionária',  A:'#f5c518', MC:'#0e0d08', MB:'rgba(245,197,24,.15)', MBG:'#060604', MT:'#e8e4d4', MS:'rgba(232,228,212,.4)', AT:'#000'},
  dental:     {label:'Odontologia',     A:'#00c9e0', MC:'#031e28', MB:'rgba(0,201,224,.15)', MBG:'#02181e', MT:'#d8f0f5', MS:'rgba(216,240,245,.4)', AT:'#02181e'},
  market:     {label:'Supermercado',    A:'#f4800a', MC:'#1a1000', MB:'rgba(244,128,10,.2)', MBG:'#0d0900', MT:'#fff8f0', MS:'rgba(255,248,240,.4)', AT:'#fff'},
  gym:        {label:'Academia',        A:'#ff3d3d', MC:'#110a0a', MB:'rgba(255,61,61,.15)', MBG:'#070507', MT:'#f0e8e8', MS:'rgba(240,232,232,.4)', AT:'#fff'},
  law:        {label:'Advocacia',       A:'#c9a440', MC:'#100e00', MB:'rgba(201,164,64,.15)', MBG:'#080600', MT:'#f0ead6', MS:'rgba(240,234,214,.4)', AT:'#080600'},
  pet:        {label:'Pet Shop',        A:'#ff6b9d', MC:'#fff',    MB:'rgba(26,10,30,.12)', MBG:'#fff9f4', MT:'#1a0a1e', MS:'rgba(26,10,30,.4)', AT:'#fff'},
  realty:     {label:'Imobiliária',     A:'#60a5fa', MC:'#040d1c', MB:'rgba(96,165,250,.12)', MBG:'#020810', MT:'#ff0000', MS:'rgba(255, 0, 0, 0.4)', AT:'#020810'},
  restaurant: {label:'Restaurante',     A:'#c8753a', MC:'#140800', MB:'rgba(200,117,58,.15)', MBG:'#0b0500', MT:'#f5e8d0', MS:'rgba(245,232,208,.4)', AT:'#fff'},
  beauty:     {label:'Estética',        A:'#c4a882', MC:'#fff',    MB:'rgba(42,31,22,.1)', MBG:'#f9f5ef', MT:'#2a1f16', MS:'rgba(42,31,22,.4)', AT:'#2a1f16'},
  tech:       {label:'Software',        A:'#00ff88', MC:'#010a04', MB:'rgba(0,255,136,.1)', MBG:'#010a04', MT:'#00ff88', MS:'rgba(0,255,136,.4)', AT:'#010a04'},
};

// ── UTILS ────────────────────────────────────────────────────────
function toast(msg) {
  clearTimeout(toastT);
  document.getElementById('tm').textContent = msg;
  const t = document.getElementById('tst');
  t.classList.add('on');
  toastT = setTimeout(() => t.classList.remove('on'), 2800);
}
function addCart(name) {
  cartN++;
  const p = document.getElementById('cart-pill');
  p.style.display = 'flex';
  document.getElementById('cn').textContent = cartN;
  toast(`"${name}" adicionado!`);
}
function openModal(html) {
  const th = THEMES[cur];
  document.documentElement.style.setProperty('--MC', th.MC);
  document.documentElement.style.setProperty('--MB', th.MB);
  document.documentElement.style.setProperty('--MBG', th.MBG);
  document.documentElement.style.setProperty('--MT', th.MT);
  document.documentElement.style.setProperty('--MS', th.MS);
  document.getElementById('mc').innerHTML = html;
  document.getElementById('mo').classList.add('open');
}
function closeModal() { document.getElementById('mo').classList.remove('open'); }
document.getElementById('mo').addEventListener('click', e => { if (e.target === document.getElementById('mo')) closeModal(); });
function wa(msg) { toast('Abrindo WhatsApp…'); }

// ── PHOTO HELPER — exibe img do Firebase ou emoji como fallback ──────────────
// Use: photoOrEmoji(url, emoji, wrapStyle)
function photoOrEmoji(img, emoji, wrapStyle='') {
  if (img) {
    return `<img src="${img}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:4.5rem;position:absolute;top:0;left:0">${emoji}</span>`;
  }
  return `<span style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-size:4.5rem">${emoji}</span>`;
}
function favToggle(id, btn) {
  favs.has(id) ? (favs.delete(id), btn.textContent='♡', toast('Removido')) : (favs.add(id), btn.textContent='❤️', toast('❤️ Salvo!'));
}

function switchNiche(n) {
  if (n === cur) return;
  cur = n; cartN = 0; favs.clear();
  document.getElementById('cart-pill').style.display = 'none';
  const app = document.getElementById('app');
  app.classList.add('out');
  setTimeout(() => {
    app.innerHTML = RENDER[n]();
    app.classList.remove('out');
    fullInit(n);
  }, 220);
}
document.getElementById('ns').addEventListener('change', e => switchNiche(e.target.value));

// ── DATA ────────────────────────────────────────────────────────
const CARS = [
  {id:1,m:'Porsche 911 GT3 RS',y:2024,e:'4.0 Nat.Asp.',km:'0 km',p:'R$ 2.100.000',emoji:'🏎️',tag:'NOVO',tc:'#000',tb:'#f5c518',cat:'Esportivo',cor:'Branco'},
  {id:2,m:'BMW M4 Competition',y:2024,e:'3.0 Biturbo',km:'0 km',p:'R$ 895.000',emoji:'🚗',tag:'NOVO',tc:'#000',tb:'#f5c518',cat:'Esportivo',cor:'Preto'},
  {id:3,m:'Mercedes-AMG GT 63',y:2023,e:'4.0 V8',km:'12.400 km',p:'R$ 1.480.000',emoji:'🚗',tag:'SEMI',tc:'#fff',tb:'#444',cat:'Gran Turismo',cor:'Cinza'},
  {id:4,m:'Ferrari Roma Spider',y:2024,e:'3.9 V8',km:'0 km',p:'R$ 3.200.000',emoji:'🏎️',tag:'NOVO',tc:'#fff',tb:'#c00',cat:'Super',cor:'Rosso'},
  {id:5,m:'Lamborghini Urus S',y:2024,e:'4.0 V8',km:'0 km',p:'R$ 2.800.000',emoji:'🚙',tag:'NOVO',tc:'#000',tb:'#f5c518',cat:'SUV',cor:'Giallo'},
  {id:6,m:'Audi RS6 Avant',y:2024,e:'4.0 TFSI',km:'0 km',p:'R$ 1.280.000',emoji:'🚗',tag:'NOVO',tc:'#000',tb:'#f5c518',cat:'Wagon',cor:'Cinza'},
  {id:7,m:'Rolls-Royce Ghost',y:2022,e:'6.75 V12',km:'22k km',p:'R$ 4.800.000',emoji:'🏅',tag:'PREMIUM',tc:'#fff',tb:'#888',cat:'Sedan',cor:'Branco'},
  {id:8,m:'McLaren 720S Spider',y:2023,e:'4.0 V8',km:'5.100 km',p:'R$ 2.950.000',emoji:'🏎️',tag:'SEMI',tc:'#fff',tb:'#444',cat:'Super',cor:'Laranja'},
  {id:9,m:'Bentley Bentayga',y:2023,e:'4.0 V8',km:'8.200 km',p:'R$ 2.400.000',emoji:'🚙',tag:'SEMI',tc:'#fff',tb:'#444',cat:'SUV',cor:'Verde'},
];
const DEN_SVCS = [
  {ic:'🦷',n:'Clareamento a Laser',  d:'Resultado em 1 sessão',         p:'R$ 450'        },
  {ic:'🔧',n:'Aparelho Invisível',   d:'Alinhadores discretos',          p:'R$ 4.200'      },
  {ic:'💎',n:'Lentes de Contato',    d:'Cerâmica ultra-estética',        p:'R$ 1.800/dente'},
  {ic:'🩺',n:'Implante Dentário',    d:'Titânio certificado',            p:'R$ 3.500'      },
  {ic:'😁',n:'Limpeza + Flúor',      d:'Profilaxia completa',            p:'R$ 180'        },
  {ic:'🛡️',n:'Canal Endodôntico',   d:'Endodontia avançada',            p:'R$ 600+'       },
];
const PRODS = [
  {id:1,n:'Picanha Friboi',u:'kg',p:89.90,old:null,e:'🥩',seal:null,cat:'Carnes'},
  {id:2,n:'Arroz Camil 5kg',u:'5 kg',p:22.90,old:27.90,e:'🌾',seal:'18%',cat:'Grãos'},
  {id:3,n:'Leite Piracanjuba',u:'cx 12un',p:62.00,old:72.00,e:'🥛',seal:'14%',cat:'Laticínios'},
  {id:4,n:'Banana Prata Bio',u:'kg',p:5.90,old:null,e:'🍌',seal:null,cat:'Hortifruti'},
  {id:5,n:'Suco Del Valle',u:'1 litro',p:8.50,old:10.90,e:'🍇',seal:'22%',cat:'Bebidas'},
  {id:6,n:'Detergente Ypê',u:'pack 6',p:18.90,old:null,e:'🧴',seal:null,cat:'Limpeza'},
  {id:7,n:'Pão Plus Vita',u:'500g',p:7.20,old:null,e:'🍞',seal:null,cat:'Padaria'},
  {id:8,n:'Queijo Polenghi',u:'400g',p:19.90,old:24.00,e:'🧀',seal:'17%',cat:'Laticínios'},
  {id:9,n:'Coca-Cola Pack',u:'6 latas',p:23.90,old:null,e:'🥤',seal:null,cat:'Bebidas'},
  {id:10,n:'Café Pilão',u:'500g',p:14.90,old:18.00,e:'☕',seal:'17%',cat:'Grãos'},
  {id:11,n:'Mamão Formosa',u:'un.',p:4.50,old:null,e:'🍈',seal:null,cat:'Hortifruti'},
  {id:12,n:'Sabão Ariel 3D',u:'3 kg',p:29.90,old:null,e:'🫧',seal:null,cat:'Limpeza'},
];
const GYM_CLS = {'Musculação':'#ff3d3d','Spinning':'#8b5cf6','Yoga':'#0ea5e9','Pilates':'#ec4899','CrossFit':'#f97316','Funcional':'#22c55e','Zumba':'#f43f5e','HIIT':'#a855f7'};
const SCHED = [
  {t:'06:00',s:['Musculação','Spinning','HIIT','Musculação','Funcional']},
  {t:'08:00',s:['Yoga','Musculação','Pilates','Musculação','Yoga']},
  {t:'10:00',s:['Funcional','Zumba','Musculação','Spinning','HIIT']},
  {t:'12:00',s:['Musculação','Pilates','Funcional','Musculação','Funcional']},
  {t:'18:00',s:['CrossFit','Musculação','Zumba','HIIT','Spinning']},
  {t:'19:30',s:['HIIT','CrossFit','Musculação','CrossFit','Musculação']},
  {t:'21:00',s:['Musculação','HIIT','Spinning','Musculação','Zumba']},
];
const LAW_AREAS = [
  {n:'I',ic:'🏛️',t:'Direito Civil',s:'Contratos e responsabilidade'},
  {n:'II',ic:'💼',t:'Direito Trabalhista',s:'CLT, rescisões e processos'},
  {n:'III',ic:'🏠',t:'Direito Imobiliário',s:'Compra, venda e locações'},
  {n:'IV',ic:'🤝',t:'Direito Empresarial',s:'Societário e fusões'},
  {n:'V',ic:'👨‍👩‍👧',t:'Família & Sucessões',s:'Divórcio, guarda, inventário'},
  {n:'VI',ic:'💰',t:'Planejamento Patrimonial',s:'Proteção e sucessão'},
];
const PET_SVCS = [
  {id:1,n:'Banho & Tosa',d:'Hidratação premium e corte personalizado',p:'A partir R$ 60',e:'🛁',c:'#ff6b9d',dur:'1-2h'},
  {id:2,n:'Veterinário',d:'Consultas, vacinas e emergência 24h',p:'R$ 120/consulta',e:'🏥',c:'#38bdf8',dur:'30-60min'},
  {id:3,n:'Tosa Artística',d:'Cortes especiais com acabamento premiado',p:'A partir R$ 90',e:'✂️',c:'#c084fc',dur:'2-3h'},
  {id:4,n:'Hotel Pet',d:'Hospedagem com câmeras ao vivo 24h',p:'R$ 80/noite',e:'🏨',c:'#34d399',dur:'Diária'},
  {id:5,n:'Adestramento',d:'8 sessões, comandos básicos e avançados',p:'R$ 600/pacote',e:'🎓',c:'#fbbf24',dur:'1h/sessão'},
  {id:6,n:'Pet Taxi',d:'Transporte seguro e monitorado',p:'R$ 40/corrida',e:'🚗',c:'#fb923c',dur:'Variável'},
];
const PROPS = [
  {id:1,t:'Apartamento Alto Padrão',l:'Moema, SP',rooms:3,area:120,garage:2,p:'R$ 1.850.000',type:'VENDA',typeBg:'#1e3a5f',bg:'#dbeafe',e:'🏢'},
  {id:2,t:'Cobertura Duplex',l:'Jardins, SP',rooms:4,area:340,garage:4,p:'R$ 6.800.000',type:'VENDA',typeBg:'#1e3a5f',bg:'#fef9c3',e:'🏯'},
  {id:3,t:'Studio Moderno',l:'Pinheiros, SP',rooms:1,area:45,garage:1,p:'R$ 4.200/mês',type:'ALUGUEL',typeBg:'#14532d',bg:'#dcfce7',e:'🏙️'},
  {id:4,t:'Casa com Piscina',l:'Alphaville, SP',rooms:4,area:380,garage:4,p:'R$ 4.200.000',type:'VENDA',typeBg:'#1e3a5f',bg:'#f0fdf4',e:'🏠'},
  {id:5,t:'Sala Comercial 80m²',l:'Faria Lima, SP',rooms:0,area:80,garage:2,p:'R$ 14k/mês',type:'ALUGUEL',typeBg:'#14532d',bg:'#f3e8ff',e:'🏛️'},
  {id:6,t:'Penthouse 360°',l:'Higienópolis, SP',rooms:5,area:520,garage:5,p:'R$ 9.800.000',type:'VENDA',typeBg:'#1e3a5f',bg:'#fff7ed',e:'🌆'},
];
const MENU = {
  Entradas:[
    {e:'🥗',n:'Salada Caesar Premium',d:'Alface romana, croutons, parmesão curado, anchova',p:'R$ 32',tags:['Vegetariano']},
    {e:'🧀',n:'Burrata Confitada',d:'Burrata importada, tomates marinados, azeite trufado',p:'R$ 48',tags:['Chef Recomenda']},
    {e:'🦐',n:'Carpaccio de Salmão',d:'Norueguês, alcaparras, limão-siciliano, azeite de ervas',p:'R$ 56',tags:['Frutos do Mar']},
  ],
  Pratos:[
    {e:'🥩',n:'Picanha na Brasa 400g',d:'Maturada 30 dias, arroz arbóreo, farofa de cogumelos',p:'R$ 98',tags:['Mais Pedido','Sem Glúten']},
    {e:'🍝',n:'Risotto Funghi Porcini',d:'Arbóreo cremoso, cogumelos selecionados, trufa negra',p:'R$ 72',tags:['Vegetariano']},
    {e:'🐟',n:'Salmão ao Maracujá',d:'Grelhado na manteiga noisette, purê de batata-baroa',p:'R$ 84',tags:['Sem Glúten']},
  ],
  Bebidas:[
    {e:'🍷',n:'Vinho Tinto da Casa',d:'Cabernet Sauvignon chileno, notas de ameixa',p:'R$ 45',tags:['Por taça']},
    {e:'🍹',n:'Caipirinha Artesanal',d:'Cachaça premium, gengibre, hortelã, açúcar demerara',p:'R$ 28',tags:['Artesanal']},
    {e:'🧃',n:'Suco da Estação',d:'Frutas frescas do dia. Pergunte ao garçom.',p:'R$ 18',tags:['Natural']},
  ],
  Sobremesas:[
    {e:'🍫',n:'Petit Gâteau',d:'Chocolate belga 70%, sorvete baunilha, calda quente',p:'R$ 32',tags:['Chef Recomenda']},
    {e:'🍮',n:'Pudim da Casa',d:'Receita original desde 1998, caramelo artesanal',p:'R$ 24',tags:['Clássico']},
  ],
};
const TREATS = [
  {id:1,n:'Microblading',d:'Design fio a fio. Natural, 1-2 anos.',before:'😐',after:'😍',p:'R$ 650',dur:'2h30',cat:'Rosto'},
  {id:2,n:'Botox Preventivo',d:'Toxina botulínica. Resultado natural.',before:'😤',after:'😊',p:'R$ 750',dur:'30min',cat:'Rosto'},
  {id:3,n:'Preenchimento Labial',d:'Ácido hialurônico premium.',before:'😶',after:'💋',p:'R$ 900',dur:'30min',cat:'Rosto'},
  {id:4,n:'Peeling Químico',d:'Renovação celular profunda.',before:'😔',after:'✨',p:'R$ 380',dur:'1h',cat:'Pele'},
  {id:5,n:'Lipo Enzimática',d:'Ultrassom focado não cirúrgico.',before:'😶',after:'🤩',p:'R$ 1.200',dur:'45min',cat:'Corpo'},
  {id:6,n:'Fios de PDO',d:'Lifting imediato. Colágeno por 18 meses.',before:'😞',after:'🥰',p:'R$ 2.400',dur:'1h30',cat:'Rosto'},
];
const REPOS = [
  {n:'fintech-pix-sdk',d:'SDK TypeScript para PIX, TED, cartão e cripto. 99.9% uptime.',l:'TypeScript',lc:'#3178c6',s:284,f:61},
  {n:'realtime-collab-engine',d:'CRDTs para colaboração sem conflito. <10ms latência.',l:'Rust',lc:'#ff6414',s:512,f:98},
  {n:'ml-fraud-detector',d:'99.2% acurácia. Deploy serverless em <200ms.',l:'Python',lc:'#4ade80',s:173,f:34},
  {n:'next-saas-boilerplate',d:'SaaS completo: auth, billing, multitenancy, analytics.',l:'Next.js',lc:'#fff',s:892,f:201},
];
const STACK = [
  {i:'⚛️',n:'React / Next.js',p:96,c:'#61dafb'},
  {i:'🦀',n:'Rust / WebAssembly',p:82,c:'#ff6414'},
  {i:'🟢',n:'Node.js / Bun',p:93,c:'#4ade80'},
  {i:'🐍',n:'Python / FastAPI',p:85,c:'#ffd43b'},
  {i:'🐘',n:'PostgreSQL / Redis',p:90,c:'#60a5fa'},
  {i:'☁️',n:'AWS / K8s / Terraform',p:78,c:'#fb923c'},
];

// ── DB_DATA — espelho mutável; Firebase sobrescreve em tempo real ─
// As constantes acima permanecem como FALLBACK (site funciona sem internet).
let DB_DATA = {
  car:        [...CARS],
  dental:     [...DEN_SVCS],
  market:     [...PRODS],
  gym:        { schedule: [...SCHED], classes: {...GYM_CLS} },
  law:        [...LAW_AREAS],
  pet:        [...PET_SVCS],
  realty:     [...PROPS],
  restaurant: JSON.parse(JSON.stringify(MENU)),   // deep clone
  beauty:     [...TREATS],
  tech:       { repos: [...REPOS], stack: [...STACK] },
};


// ── RENDERERS ───────────────────────────────────────────────────
const RENDER = {

// ── 1. CONCESSIONÁRIA ──────────────────────────────────────────
car: () => `
<div class="car-root">
  <!-- cursor handled globally -->
  <!-- NAV -->
  <nav style="position:sticky;top:46px;z-index:800;height:60px;display:flex;align-items:center;padding:0 44px;gap:28px;background:rgba(6,6,4,.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(245,197,24,.08)">
    <div style="font-family:'Bebas Neue',cursive;font-size:1.5rem;letter-spacing:.12em;color:#f5c518">▲ IMPORTS</div>
    <div style="display:flex;gap:0;height:100%">
      ${['Início','Estoque','Financiamento','Test Drive','Sobre'].map((l,i)=>`<span style="height:100%;padding:0 18px;display:flex;align-items:center;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:600;color:rgba(232,228,212,${i===0?'.8':'.35'});cursor:pointer;border-bottom:2px solid ${i===0?'#f5c518':'transparent'};transition:all .2s" onmouseover="this.style.color='rgba(232,228,212,.8)';this.style.borderBottomColor='#f5c518'" onmouseout="this.style.color='rgba(232,228,212,${i===0?'.8':'.35'})';this.style.borderBottomColor='${i===0?'#f5c518':'transparent'}'">${l}</span>`).join('')}
    </div>
    <div style="margin-left:auto;display:flex;gap:10px;align-items:center">
      <span style="font-size:.75rem;color:rgba(232,228,212,.3)">📞 (11) 9901-4872</span>
      <button onclick="wa('Olá!')" style="display:flex;align-items:center;gap:6px;padding:9px 18px;background:#25d366;color:#fff;border:none;border-radius:5px;font-weight:700;font-size:.76rem;cursor:pointer;transition:all .2s" onmouseover="this.style.background='#20bb5a'" onmouseout="this.style.background='#25d366'">💬 WhatsApp</button>
    </div>
  </nav>
  <!-- HERO -->
  <div class="car-hero">
    <div class="car-hero-track"></div>
    <div class="car-hero-reel">

     
      <div class="car-slide">🏎️</div>
    </div>
    <div style="position:relative;z-index:2">
      <div class="car-eyebrow">Performance & Exclusividade — Est. 2006</div>
      <h1 class="car-h1">DIRIJA O<br><em>IMPOSSÍVEL</em>
        <div class="car-h1-ghost">DIRIJA O<br>IMPOSSÍVEL</div>
      </h1>
      <p class="car-sub">Os veículos mais exclusivos do planeta. Importados sob encomenda, financiamento personalizado e entrega em todo o Brasil.</p>
      <div class="car-btns">
        <button class="car-btn-p" onclick="document.getElementById('estoque').scrollIntoView({behavior:'smooth'})">VER ESTOQUE →</button>
        <button class="car-btn-g" onclick="openModal(mInteresse('Tenho Interesse'))">Interesse</button>
        <button onclick="toast('Agendando test drive!')" style="padding:13px 24px;background:transparent;color:rgba(232,228,212,.5);border:1px solid rgba(232,228,212,.15);font-weight:600;font-size:.82rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='rgba(232,228,212,.4)';this.style.color='rgba(232,228,212,.8)'" onmouseout="this.style.borderColor='rgba(232,228,212,.15)';this.style.color='rgba(232,228,212,.5)'">Test Drive</button>
      </div>
    </div>
    <div class="car-scroll-hint"><div class="car-scroll-line"></div><span class="car-scroll-txt">Scroll</span></div>
  </div>
  <!-- TICKER -->
  <div class="car-ticker"><div class="car-ticker-inner">
    ${Array(4).fill(['<span>240+</span> Veículos em Estoque','Financiamento <span>100% Digital</span>','<span>18 anos</span> de Tradição','Entrega <span>Todo Brasil</span>','Test Drive <span>na sua Porta</span>']).flat().map(t=>`<span class="car-ticker-item">${t}</span>`).join('')}
  </div></div>
  <!-- ESTOQUE -->
  <div class="car-stock" id="estoque">
    <div class="car-stock-header">
      <div>
        <div class="car-stock-title">ESTOQUE<em>DISPONÍVEL</em></div>
      </div>
      <div style="text-align:right">
        <div style="font-size:.72rem;color:rgba(232,228,212,.3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px">Atualizado hoje</div>
        <div style="font-family:'Bebas Neue',cursive;font-size:1.2rem;color:#f5c518" id="car-count">${DB_DATA.car.length} veículos</div>
      </div>
    </div>
    <div class="car-filter-row">
      ${[['Categoria','car-cat',['Todos','Esportivo','SUV','Gran Turismo','Super','Wagon','Sedan']],['Condição','car-cond',['Todos','NOVO','SEMI','PREMIUM']]].map(([label,id,opts])=>`
        <div style="display:flex;flex-direction:column;gap:4px">
          <span style="font-size:.6rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(232,228,212,.25)">${label}</span>
          <select class="car-filter-sel" id="${id}" onchange="carFilter()">
            ${opts.map(o=>`<option>${o}</option>`).join('')}
          </select>
        </div>
      `).join('')}
      <div style="display:flex;flex-direction:column;gap:4px">
        <span style="font-size:.6rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(232,228,212,.25)">Buscar</span>
        <input class="car-filter-sel" id="car-q" placeholder="Modelo, marca..." oninput="carFilter()" style="min-width:200px">
      </div>
    </div>
    <div class="car-grid" id="car-grid">
      ${DB_DATA.car.map((c,i)=>`
        <div class="car-card-wrap" style="animation:fadeUp .6s ${i*.07}s ease both">
          <div class="car-card">
            <div class="car-card-img" style="position:relative;overflow:hidden">
              ${c.img
                ? `<img src="${c.img}" alt="${c.m}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1"
                      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                   <div style="display:none;font-size:5rem;position:absolute;inset:0;align-items:center;justify-content:center;z-index:1">${c.emoji||c.e||'🚗'}</div>`
                : `<div style="font-size:5rem;position:relative;z-index:1;display:flex;align-items:center;justify-content:center;height:100%">${c.emoji||c.e||'🚗'}</div>`
              }
              <div class="car-card-img-overlay" style="position:absolute;inset:0;z-index:2"></div>
              <span class="car-card-tag" style="background:${c.tb};color:${c.tc};position:absolute;top:12px;left:12px;z-index:3">${c.tag}</span>
              <button onclick="favToggle(${c.id},this)" style="position:absolute;top:12px;right:12px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.55);border:none;cursor:pointer;color:#fff;font-size:.85rem;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:3" onmouseover="this.style.background='rgba(0,0,0,.8)'" onmouseout="this.style.background='rgba(0,0,0,.55)'">♡</button>
              <div class="car-card-num" style="position:absolute;bottom:12px;right:14px;z-index:3">${String(c.id).padStart(2,'0')}</div>
            </div>
            <div class="car-card-body">
              <div class="car-card-model">${c.m}</div>
              <div class="car-card-cat">${c.y} · ${c.cat}</div>
              <div class="car-card-specs">
                <div class="car-card-spec"><strong>${c.e}</strong><span>Motor</span></div>
                <div class="car-card-spec"><strong>${c.km}</strong><span>KM</span></div>
                <div class="car-card-spec"><strong>${c.cor}</strong><span>Cor</span></div>
              </div>
              <div class="car-card-foot">
                <div class="car-card-price"><small>a partir de</small>${c.p}</div>
                <button class="car-card-cta" onclick="openModal(mInteresse('${c.m}'))">Interesse</button>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  <!-- FOOTER -->
  <footer style="background:#030302;border-top:1px solid rgba(245,197,24,.08);padding:52px 44px 28px">
    <div style="max-width:1400px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:36px">
      <div>
        <div style="font-family:'Bebas Neue',cursive;font-size:1.8rem;color:#f5c518;margin-bottom:10px">▲ IMPORTS</div>
        <div style="font-size:.82rem;color:rgba(232,228,212,.3);line-height:1.75;max-width:260px">Importados de luxo com tradição e excelência. 18 anos transformando sonhos em realidade.</div>
      </div>
      ${[['Estoque',['Esportivos','SUVs Premium','Gran Turismo','Superesportivos']],['Serviços',['Financiamento','Consignação','Avaliação','Test Drive']],['Empresa',['Sobre Nós','Blog','Parcerias','Trabalhe Conosco']]].map(([t,ls])=>`
        <div>
          <div style="font-size:.65rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(232,228,212,.2);margin-bottom:14px">${t}</div>
          ${ls.map(l=>`<div style="font-size:.8rem;color:rgba(232,228,212,.4);margin-bottom:9px;cursor:pointer;transition:color .2s" onmouseover="this.style.color='#f5c518'" onmouseout="this.style.color='rgba(232,228,212,.4)'">${l}</div>`).join('')}
        </div>
      `).join('')}
    </div>
    <div style="max-width:1400px;margin:0 auto;border-top:1px solid rgba(255,255,255,.05);padding-top:20px;display:flex;justify-content:space-between;align-items:center;font-size:.72rem;color:rgba(232,228,212,.18);flex-wrap:wrap;gap:10px">
      <span>© ▲ IMPORTS. Todos os direitos reservados.</span>
      <span>CNPJ 00.000.000/0001-00 · SP, Brasil</span>
    </div>
  </footer>
</div>`,

// ── 2. ODONTOLOGIA ──────────────────────────────────────────────
dental: () => `
<div class="den-root">
  <nav class="den-nav">
    <div class="den-nav-brand">Sorrir<span style="color:#d8f0f5">Clínica</span></div>
    <div class="den-nav-links">
      ${['Início','Serviços','Agendar','Equipe','Convênios'].map((l,i)=>`<span class="den-nav-link${i===0?' active':''}" onclick="toast('${l}...')">${l}</span>`).join('')}
    </div>
    <div class="den-nav-right">
      <button class="den-btn-sm den-btn-wa" onclick="wa('Olá!')">💬 WhatsApp</button>
      <button class="den-btn-sm den-btn-book" onclick="openModal(mAgenda())">Agendar</button>
    </div>
  </nav>
  <div class="den-bento">
    <!-- C1: Hero -->
    <div class="den-cell den-c1" style="animation:fadeUp .7s ease both">
      <div class="den-blob den-blob-1"></div>
      <div class="den-blob den-blob-2"></div>
      <div style="position:relative;z-index:2">
        <div class="den-pill"><span class="den-pill-dot"></span>Odontologia Premium · Desde 2010</div>
        <h1 class="den-h1">Sorria com<br><em>Total Confiança.</em></h1>
        <p style="font-size:.9rem;color:rgba(216,240,245,.45);line-height:1.8;max-width:440px;margin-bottom:28px">Tecnologia 3D, especialistas certificados e experiência sem dor. Transformamos sorrisos há 15 anos.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button onclick="openModal(mAgenda())" style="padding:13px 28px;background:var(--A);color:#02181e;border:none;border-radius:30px;font-weight:800;font-size:.85rem;cursor:pointer;transition:all .22s" onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 8px 28px rgba(0,201,224,.35)'" onmouseout="this.style.transform='';this.style.boxShadow=''">Agendar Consulta</button>
          <button onclick="wa('Olá!')" style="padding:13px 20px;background:rgba(37,211,102,.1);color:#25d366;border:1px solid rgba(37,211,102,.2);border-radius:30px;font-weight:700;font-size:.82rem;cursor:pointer;transition:all .2s" onmouseover="this.style.background='rgba(37,211,102,.2)'" onmouseout="this.style.background='rgba(37,211,102,.1)'">💬 WhatsApp</button>
        </div>
      </div>
    </div>
    <!-- C2: Stats 2×2 -->
    <div class="den-cell den-c2" style="animation:fadeUp .7s .1s ease both">
      ${[['4.9★','Google Reviews'],['28k+','Pacientes'],['15 anos','Experiência'],['0 dor','Garantido']].map(([n,l],i)=>`
        <div class="den-stat-cell" style="animation:fadeUp .6s ${.15+i*.07}s ease both">
          <div class="den-stat-num"><span>${n}</span></div>
          <div class="den-stat-label">${l}</div>
        </div>
      `).join('')}
    </div>
    <!-- C3: Serviços lista -->
    <div class="den-cell den-c3" style="animation:fadeUp .7s .15s ease both">
      <div class="den-cell-label">Serviços</div>
      <div class="den-svc-list">
        ${DB_DATA.dental.slice(0,3).map(s=>`
          <div class="den-svc-row" onclick="openModal(mAgenda('${s.n}'))">
            <div class="den-svc-ico" style="position:relative;overflow:hidden;width:44px;height:44px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.4rem">
              ${s.img?`<img src="${s.img}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:10px" onerror="this.style.display='none'">${s.ic}`:s.ic}
            </div>
            <div class="den-svc-info"><h4>${s.n}</h4><p>${s.d}</p></div>
            <div class="den-svc-price">${s.p}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <!-- C4: Mais serviços -->
    <div class="den-cell den-c4" style="animation:fadeUp .7s .2s ease both">
      <div class="den-cell-label">Mais Tratamentos</div>
      <div class="den-svc-list">
        ${DB_DATA.dental.slice(3).map(s=>`
          <div class="den-svc-row" onclick="openModal(mAgenda('${s.n}'))">
            <div class="den-svc-ico" style="position:relative;overflow:hidden;width:44px;height:44px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.4rem">
              ${s.img?`<img src="${s.img}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:10px" onerror="this.style.display='none'">${s.ic}`:s.ic}
            </div>
            <div class="den-svc-info"><h4>${s.n}</h4><p>${s.d}</p></div>
            <div class="den-svc-price">${s.p}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <!-- C5: CTA verde -->
    <div class="den-cell den-c5" style="animation:fadeUp .7s .22s ease both">
      <div style="font-size:.65rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:rgba(2,24,30,.6);margin-bottom:12px">Primeira Consulta</div>
      <div style="font-family:'Geologica',sans-serif;font-size:1.8rem;font-weight:900;color:#02181e;line-height:1.1;margin-bottom:10px">Avaliação <span style="font-style:italic">gratuita</span></div>
      <div style="font-size:.82rem;color:rgba(2,24,30,.55);line-height:1.65;margin-bottom:20px">Análise completa com especialista. Sem compromisso. Resultado em 15 minutos.</div>
      <button onclick="openModal(mAgenda())" style="padding:12px 24px;background:#02181e;color:var(--A);border:none;border-radius:8px;font-weight:800;font-size:.82rem;cursor:pointer;transition:all .22s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">Agendar Grátis →</button>
    </div>
    <!-- C6: Formulário de agendamento -->
    <div class="den-cell den-c6" style="animation:fadeUp .7s .25s ease both">
      <div class="den-cell-label">Agendamento Online</div>
      <div class="den-form-grid">
        <input class="den-input" placeholder="Seu nome completo">
        <input class="den-input" placeholder="WhatsApp (11) 99999-9999" type="tel">
        <select class="den-input">
          <option>Clareamento a Laser</option><option>Aparelho Invisível</option>
          <option>Implante Dentário</option><option>Lentes de Contato</option>
          <option>Limpeza Profissional</option>
        </select>
        <input class="den-input" type="date">
        <div style="grid-column:1/-1">
          <div class="den-cell-label" style="margin-bottom:10px">Horário Preferido</div>
          <div class="den-time-grid">
            ${['08:00','09:30','11:00','14:00','15:30','17:00','18:30','19:00'].map(h=>`<div class="den-time" onclick="selTime(this,'${h}')">${h}</div>`).join('')}
          </div>
        </div>
        <button class="den-book-btn" onclick="toast('✅ Consulta agendada! Confirmação no WhatsApp.')">Confirmar Agendamento</button>
      </div>
    </div>
    <!-- C7: Depoimentos -->
    <div class="den-cell den-c7" style="animation:fadeUp .7s .28s ease both">
      <div class="den-cell-label">Depoimentos</div>
      ${[
        {s:'★★★★★',t:'"Meu sorriso mudou completamente com as lentes. Profissionalismo incrível!"',a:'Mariana T. · Advogada'},
        {s:'★★★★★',t:'"Implante sem dor nenhuma! Equipe super atenciosa e tecnologia de ponta."',a:'José A. · Engenheiro'},
        {s:'★★★★★',t:'"Aparelho invisível em 8 meses! Resultado incrível, recomendo para todos."',a:'Beatriz S. · Designer'},
      ].map(d=>`
        <div class="den-testi">
          <div class="den-stars">${d.s}</div>
          <div class="den-testi-text">${d.t}</div>
          <div class="den-testi-author">— ${d.a}</div>
        </div>
      `).join('')}
    </div>
  </div>
</div>`,

// ── 3. MERCADO ──────────────────────────────────────────────────
market: () => {
  const cats = ['Todos','Carnes','Hortifruti','Laticínios','Bebidas','Grãos','Limpeza','Padaria'];
  return `<div class="mkt-root">
    <div class="mkt-header">
      <div class="mkt-brand">VERDE MERCADO</div>
      <div class="mkt-header-right">
        <span class="mkt-header-info">🚚 Entrega no Mesmo Dia · SP Capital</span>
        <button class="mkt-header-btn" onclick="toast('Verificando CEP...')">📍 Ver Entrega</button>
        <button class="mkt-header-btn" style="background:transparent;color:var(--A);border:1px solid rgba(244,128,10,.4)" onclick="toast('Abrindo app...')">📱 App</button>
      </div>
    </div>
    <div class="mkt-ticker"><div class="mkt-ticker-inner">
      ${Array(4).fill(['🚚 Frete Grátis acima de R$150','⚡ Entrega em até 2h','🌱 Frescos todo dia','🏷️ Até 30% OFF','♻️ 100% Sustentável']).flat().map(t=>`<span class="mkt-ticker-item">${t}</span>`).join('')}
    </div></div>
    <div class="mkt-hero">
      <div class="mkt-hero-left">
        <div class="mkt-big-tag">Ofertas da Semana</div>
        <div class="mkt-big-pct">30%<span>de desconto nesta semana</span></div>
        <p class="mkt-hero-sub-txt">Mais de 4.000 produtos com entrega programada. Mercado premium sem sair de casa.</p>
        <button class="mkt-hero-btn" onclick="toast('Iniciando lista de compras!')">COMEÇAR LISTA →</button>
      </div>
      <div class="mkt-hero-right">
        <div class="mkt-promo-row">
          <div class="mkt-promo-cell featured" onclick="addCart('Picanha Friboi')">
            <div class="mkt-promo-badge">30% OFF</div>
            <div class="mkt-promo-emoji">🥩</div>
            <div class="mkt-promo-info">
              <div class="mkt-promo-name">Picanha Friboi Premium</div>
              <div class="mkt-promo-price">R$ 89,90/kg</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;flex:1">
            ${[['🥦','Hortifruti','Frescos'],['🍞','Padaria','Artesanal'],['🥤','Bebidas','Pack'],['🧀','Laticínios','Premium']].map(([e,n,s])=>`
              <div class="mkt-promo-cell" onclick="toast('Abrindo ${n}...')">
                <div class="mkt-promo-emoji">${e}</div>
                <div class="mkt-promo-name">${n}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="mkt-products">
      <div class="mkt-sec-header">
        <span class="mkt-sec-title">Destaques</span>
        <span class="mkt-sec-n" id="mkt-count">${DB_DATA.market.length} produtos</span>
      </div>
      <div class="mkt-cats" id="mkt-cats">
        ${cats.map((c,i)=>`<div class="mkt-cat${i===0?' on':''}" onclick="mktFilter('${c}',this)">${c}</div>`).join('')}
      </div>
      <div class="mkt-grid" id="mkt-grid">
        ${DB_DATA.market.map(p=>`
          <div class="mkt-prod" data-cat="${p.cat}">
            <div class="mkt-prod-img" style="position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center">
              ${p.seal?`<div class="mkt-seal" style="position:absolute;top:8px;left:8px;z-index:2">${p.seal} OFF</div>`:''}
              ${p.img
                ? `<img src="${p.img}" alt="${p.n}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"
                      onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                   <span style="font-size:3.5rem;display:none;position:relative;z-index:1">${p.e}</span>`
                : `<span style="font-size:3.5rem">${p.e}</span>`
              }
            </div>
            <div class="mkt-prod-body">
              <div class="mkt-prod-name">${p.n}</div>
              <div class="mkt-prod-unit">${p.u}</div>
              <div class="mkt-prod-foot">
                <div>${p.old?`<div class="mkt-old">R$ ${p.old.toFixed(2).replace('.',',')}</div>`:''}<div class="mkt-price">R$ ${p.p.toFixed(2).replace('.',',')}</div></div>
                <button class="mkt-add" onclick="mktAdd(this,'${p.n}')">+</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
},

// ── 4. ACADEMIA ─────────────────────────────────────────────────
gym: () => `
<div class="gym-root">
  <div class="gym-scanline"></div>
  <nav class="gym-nav">
    <div class="gym-brand">IRON CLUB</div>
    <div class="gym-nav-links">
      ${['Início','Modalidades','Planos','Grade','Equipe'].map((l,i)=>`<span class="gym-nav-link" onclick="toast('${l}...')">${l}</span>`).join('')}
    </div>
    <div class="gym-nav-right">
      <button class="gym-nav-btn gym-btn-g" onclick="document.getElementById('gym-plans').scrollIntoView({behavior:'smooth'})">VER PLANOS</button>
      <button class="gym-nav-btn gym-btn-p" onclick="openModal(mGym())">COMEÇAR GRÁTIS</button>
    </div>
  </nav>
  <div class="gym-hero">
    <div class="gym-hero-glow"></div>
    <div class="gym-hero-noise"></div>
    <div class="gym-hero-slash"></div>
    <div class="gym-bg-num">30</div>
    <div class="gym-hero-content">
      <div class="gym-eyebrow">TRANSFORMAÇÃO REAL · 24/7</div>
      <h1 class="gym-h1">QUEBRE</h1>
      <div class="gym-h1-line2">SEUS LIMITES</div>
      <p class="gym-sub">60+ modalidades, personal trainers certificados e biometria 24h. Primeira semana completamente grátis.</p>
      <div class="gym-btns">
        <button class="gym-nav-btn gym-btn-p" onclick="openModal(mGym())">COMEÇAR GRÁTIS</button>
        <button class="gym-nav-btn gym-btn-g" onclick="document.getElementById('gym-sched').scrollIntoView({behavior:'smooth'})">VER GRADE</button>
      </div>
    </div>
  </div>
  <div class="gym-stats">
    ${[['60+','MODALIDADES'],['3.200','ALUNOS ATIVOS'],['24/7','FUNCIONAMENTO'],['4.9★','AVALIAÇÃO']].map(([n,l])=>`<div class="gym-stat"><div class="gym-stat-n">${n}</div><div class="gym-stat-l">${l}</div></div>`).join('')}
  </div>
  <!-- GRADE -->
  <div class="gym-sched" id="gym-sched">
    <div class="gym-sec-h">GRADE DE AULAS</div>
    <div class="gym-sec-accent"></div>
    <div class="gym-table-wrap">
      <table class="gym-table">
        <thead><tr>
          <th class="gym-th">HORA</th>
          ${['SEG','TER','QUA','QUI','SEX','SAB'].map(d=>`<th class="gym-th">${d}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${DB_DATA.gym.schedule.map(row=>`
            <tr>
              <td class="gym-td-t">${row.t}</td>
              ${row.s.concat(['HIIT']).slice(0,6).map(cls=>{
                const c=DB_DATA.gym.classes[cls]||'#666';
                return`<td class="gym-class-td" style="background:${c}18" onclick="toast('📅 Inscrito: ${cls} às ${row.t}!')" onmouseover="this.style.background='${c}35'" onmouseout="this.style.background='${c}18'"><span class="gym-class-name" style="color:${c}">${cls}</span></td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
  <!-- PLANS -->
  <div class="gym-plans" id="gym-plans">
    ${[
      {name:'STARTER',price:'89',per:'/mês',features:['Musculação livre','Vestiários equipados','App de treinos','Cancelamento fácil'],hot:false,c:'#666'},
      {name:'PRO',price:'149',per:'/mês',features:['Acesso ilimitado','Todas as modalidades','Avaliação mensal','Nutricionista','Suporte 24h'],hot:true,c:'#ff3d3d'},
      {name:'ELITE',price:'249',per:'/mês',features:['Tudo do PRO','Personal 2×/semana','Spa & Sauna','Convidado grátis','Loja 20% OFF'],hot:false,c:'#fbbf24'},
    ].map(p=>`
      <div class="gym-plan${p.hot?' hot':''}" style="--plan-c:${p.c}">
        <div class="gym-plan-name">${p.name}</div>
        <div class="gym-plan-price">R$${p.price}</div>
        <div class="gym-plan-per">${p.per} · sem taxa de adesão</div>
        ${p.features.map(f=>`<div class="gym-feature"><span class="gym-feature-dot"></span>${f}</div>`).join('')}
        <button class="gym-plan-btn" onclick="openModal(mGym('${p.name}'))">ASSINAR ${p.name}</button>
      </div>
    `).join('')}
  </div>
</div>`,

// ── 5. ADVOCACIA ────────────────────────────────────────────────
law: () => `
<div class="law-root">
  <div class="law-topbar">
    <span class="law-firm">Mendonça & Associados Advogados</span>
    <div class="law-topbar-sep"></div>
    <span class="law-topbar-info">OAB/SP 123.456 · Fundado em 1998</span>
  </div>
  <nav class="law-nav">
    <div class="law-nav-brand">M&A</div>
    <div class="law-nav-links">
      ${['Início','Áreas','Casos','Artigos','Equipe','Contato'].map((l,i)=>`<span class="law-nav-link${i===0?' active':''}" onclick="toast('${l}...')">${l}</span>`).join('')}
    </div>
    <div class="law-nav-right">
      <button class="law-consult-btn" onclick="openModal(mLaw())">Consulta Gratuita</button>
      <button onclick="wa('Olá!')" style="padding:9px 18px;background:rgba(37,211,102,.1);color:#25d366;border:1px solid rgba(37,211,102,.2);font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s" onmouseover="this.style.background='rgba(37,211,102,.2)'" onmouseout="this.style.background='rgba(37,211,102,.1)'">💬 WhatsApp</button>
    </div>
  </nav>
  <div class="law-hero">
    <div class="law-hero-left">
      <div class="law-deco-grid"></div>
      <div class="law-foil">XXVI ANOS DE EXCELÊNCIA JURÍDICA</div>
      <h1 class="law-hero-h1">Justiça é<br>uma questão<br>de <em>estratégia.</em></h1>
      <div class="law-rule"></div>
      <p class="law-sub">26 anos protegendo patrimônios e direitos. Soluções jurídicas complexas para quem exige o melhor resultado.</p>
      <div class="law-hero-btns">
        <button class="law-btn-p" onclick="openModal(mLaw())">CONSULTA GRATUITA</button>
        <button class="law-btn-g" onclick="toast('Abrindo casos...')">Casos de Sucesso →</button>
      </div>
    </div>
    <div class="law-hero-right">
      <div class="law-areas-ttl">Áreas de Atuação</div>
      ${DB_DATA.law.map(a=>`
        <div class="law-area" onclick="toast('${a.t}')">
          <span class="law-area-n">${a.n}</span>
          <div class="law-area-body"><div class="law-area-t">${a.ic} ${a.t}</div><div class="law-area-s">${a.s}</div></div>
          <span class="law-area-arr">→</span>
        </div>
      `).join('')}
      <div style="margin-top:24px;padding:22px;background:rgba(201,164,64,.06);border:1px solid rgba(201,164,64,.12)">
        <div style="font-family:'Cinzel Decorative',serif;font-size:.92rem;color:var(--A);margin-bottom:6px">Primeira Consulta Gratuita</div>
        <div style="font-size:.78rem;color:rgba(240,234,214,.35);margin-bottom:14px;line-height:1.65">Análise completa do seu caso. Sem compromisso.</div>
        <button onclick="openModal(mLaw())" style="padding:10px 22px;background:var(--A);color:#080600;border:none;font-family:'Cinzel Decorative',serif;font-size:.68rem;letter-spacing:.1em;cursor:pointer;transition:all .22s" onmouseover="this.style.background='#e0ba55'" onmouseout="this.style.background='var(--A)'">AGENDAR AGORA →</button>
      </div>
    </div>
  </div>
  <!-- STATS -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(201,164,64,.1);border-bottom:1px solid rgba(201,164,64,.1)">
    ${[['98%','Taxa de Êxito'],['1.200+','Casos Resolvidos'],['26 anos','de Atuação'],['R$50M+','Recuperados']].map(([n,l])=>`
      <div style="padding:26px 28px;border-right:1px solid rgba(201,164,64,.07);transition:background .2s;cursor:default" onmouseover="this.style.background='rgba(201,164,64,.04)'" onmouseout="this.style.background=''">
        <div style="font-family:'Cinzel Decorative',serif;font-size:2rem;color:var(--A);line-height:1;margin-bottom:4px">${n}</div>
        <div style="font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(240,234,214,.3)">${l}</div>
      </div>
    `).join('')}
  </div>
  <!-- ARTICLES -->
  <div class="law-articles">
    <div class="law-art-h">
      <div class="law-art-title">Artigos &amp; <em>Publicações</em></div>
      <div class="law-art-rule"></div>
    </div>
    <div class="law-art-grid">
      <div class="law-art-card large" onclick="toast('Lendo artigo...')">
        <div class="law-art-reveal"></div>
        <div class="law-art-num">01</div>
        <div class="law-art-area">DIREITO DO CONSUMIDOR</div>
        <div class="law-art-t">Seus Direitos em Compras Online: O que a Lei Realmente Garante em 2025</div>
        <div class="law-art-exc">A proteção ao consumidor digital vai muito além do reembolso. Conheça seus direitos em marketplaces e novas regras para entrega e cancelamento.</div>
        <div class="law-art-date">29 ABR 2025 · LEITURA: 6 MIN</div>
      </div>
      <div class="law-art-right">
        ${[{n:'02',a:'SUCESSÃO PATRIMONIAL',t:'Inventário: Como Planejar e Evitar Conflitos Familiares',d:'15 MAR'},{n:'03',a:'DIREITO TRABALHISTA',t:'Demissão Sem Justa Causa: O Que Você Deve Receber',d:'02 FEV'}].map(art=>`
          <div class="law-art-card" onclick="toast('Lendo artigo ${art.n}...')">
            <div class="law-art-reveal"></div>
            <div class="law-art-num">${art.n}</div>
            <div class="law-art-area">${art.a}</div>
            <div class="law-art-t">${art.t}</div>
            <div class="law-art-date">${art.d}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
</div>`,

// ── 6. PET SHOP ─────────────────────────────────────────────────
pet: () => `
<div class="pet-root">
  <nav class="pet-nav">
    <div class="pet-nav-brand">🐾 <span>Patinha</span>Pet</div>
    <div class="pet-nav-links">
      ${['Início','Serviços','Produtos','Agendar','Blog'].map((l,i)=>`<span class="pet-nav-link${i===0?' active':''}" onclick="toast('${l}...')">${l}</span>`).join('')}
    </div>
    <div class="pet-nav-right">
      <button class="pet-nav-btn pet-btn-wa" onclick="wa('Olá!')">💬 WhatsApp</button>
      <button class="pet-nav-btn pet-btn-book" onclick="openModal(mPet())">📅 Agendar</button>
    </div>
  </nav>
  <div class="pet-hero">
    <div class="pet-shape pet-shape-1"></div>
    <div class="pet-shape pet-shape-2"></div>
    <div class="pet-shape pet-shape-3"></div>
    <div class="pet-hero-left">
      <div class="pet-kicker">🐾 +5.000 Pets Felizes · Desde 2012</div>
      <h1 class="pet-h1">Eles merecem<br>o <span>melhor</span><br>de você!</h1>
      <p class="pet-sub">Banho, tosa, veterinário, hotel e adestramento. Tudo em um só lugar com amor genuíno.</p>
      <div class="pet-hero-btns">
        <button class="pet-nav-btn pet-btn-book" onclick="openModal(mPet())" style="font-size:.88rem;padding:12px 24px">📅 Agendar Agora</button>
        <button class="pet-nav-btn pet-btn-wa" onclick="wa('Olá Patinha!')" style="font-size:.88rem;padding:12px 20px">💬 WhatsApp</button>
      </div>
    </div>
    <div class="pet-hero-right">
      <div class="pet-mascot-grid">
        ${[['🐶','Mel','Golden Retriever'],['🐩','Bolinha','Poodle Toy'],['🐺','Thor','Husky Siberiano'],['🐱','Luna','Maine Coon']].map(([e,n,b])=>`
          <div class="pet-mascot" onclick="toast('❤️ ${n} te dá boas-vindas!')">
            <span class="pet-mascot-e">${e}</span>
            <div class="pet-mascot-n">${n}</div>
            <div class="pet-mascot-b">${b}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  <!-- Stats -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);background:#fff;border-top:3px solid #1a0a1e;border-bottom:3px solid #1a0a1e">
    ${[['5.000+','Pets Atendidos'],['12 anos','Experiência'],['24/7','Emergência Vet'],['4.9★','Avaliação']].map(([n,l])=>`
      <div style="padding:22px 24px;border-right:3px solid #1a0a1e;text-align:center;transition:background .2s;cursor:default" onmouseover="this.style.background='#fff0f5'" onmouseout="this.style.background=''">
        <div style="font-family:'Nunito',sans-serif;font-size:1.8rem;font-weight:900;color:var(--A);margin-bottom:3px">${n}</div>
        <div style="font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(26,10,30,.4)">${l}</div>
      </div>
    `).join('')}
  </div>
  <!-- SERVIÇOS -->
  <div class="pet-services">
    <div class="pet-sec-title">Nossos Serviços 🐾</div>
    <p class="pet-sec-sub">Agendamento online em tempo real. Atendimento com hora marcada.</p>
    <div class="pet-svc-grid">
      ${DB_DATA.pet.map(s=>`
        <div class="pet-svc" data-e="${s.e}" style="border-top:3px solid ${s.c}" onclick="openModal(mPetSvc('${s.n}','${s.p}','${s.e}','${s.c}'))">
          ${s.img
            ? `<div style="width:100%;height:140px;overflow:hidden;border-radius:12px 12px 0 0;position:relative;margin:-16px -16px 16px">
                 <img src="${s.img}" alt="${s.n}" style="width:100%;height:100%;object-fit:cover"
                      onerror="this.parentNode.outerHTML='<div class=\\'pet-svc-ico\\' style=\\'background:${s.c}18;border-color:${s.c}\\'>${s.e}</div>'">
               </div>`
            : `<div class="pet-svc-ico" style="background:${s.c}18;border-color:${s.c}">${s.e}</div>`
          }
          <h3>${s.n}</h3>
          <p>${s.d}</p>
          <div class="pet-svc-price" style="color:${s.c}">${s.p}</div>
          <button class="pet-svc-btn" style="background:${s.c}" onclick="event.stopPropagation();openModal(mPet('${s.n}'))">Agendar</button>
        </div>
      `).join('')}
    </div>
  </div>
</div>`,

// ── 7. IMOBILIÁRIA ──────────────────────────────────────────────
realty: () => `
<div class="rei-root">
  <nav class="rei-nav">
    <div class="rei-brand">PRIME</div>
    <div class="rei-nav-links">
      ${['Início','Comprar','Alugar','Lançamentos','Avaliação'].map((l,i)=>`<span class="rei-nav-link${i===0?' active':''}" onclick="toast('${l}...')">${l}</span>`).join('')}
    </div>
    <div class="rei-nav-right">
      <button class="rei-nav-btn rei-btn-g" onclick="wa('Olá!')">💬 WhatsApp</button>
      <button class="rei-nav-btn rei-btn-p" onclick="openModal(mRealty())">Falar com Corretor</button>
    </div>
  </nav>
  <div class="rei-hero">
    <div class="rei-hero-bg"></div>
    <div class="rei-grid-overlay"></div>
    <div class="rei-diagonal"></div>
    <div class="rei-coords">23°32'S<br>46°38'W<br>SÃO PAULO</div>
    <div class="rei-hero-content">
      <div class="rei-eyebrow">Imobiliária Premium — São Paulo</div>
      <h1 class="rei-h1">Encontre onde<br>você quer<br><em>viver.</em></h1>
      <p class="rei-sub">2.400+ imóveis em São Paulo e região. Corretores especializados e transparência total em cada negociação.</p>
      <div class="rei-stats">
        ${[['2.400+','Imóveis'],['18 anos','Mercado'],['4.8★','Clientes'],['R$2B+','Negociados']].map(([n,l])=>`<div><div class="rei-stat-n">${n}</div><div class="rei-stat-l">${l}</div></div>`).join('')}
      </div>
    </div>
  </div>
  <div class="rei-filter">
    <div class="rei-fg"><span class="rei-fl">Negócio</span><select class="rei-fs" id="r-tipo" onchange="rFilter()"><option value="">Todos</option><option>VENDA</option><option>ALUGUEL</option></select></div>
    <div class="rei-fg"><span class="rei-fl">Quartos</span><select class="rei-fs" id="r-quartos" onchange="rFilter()"><option value="">Qualquer</option><option>1+</option><option>2+</option><option>3+</option><option>4+</option></select></div>
    <div class="rei-fg"><span class="rei-fl">Localização</span><input class="rei-fi" id="r-loc" placeholder="Bairro ou cidade..." oninput="rFilter()"></div>
    <button class="rei-search-btn" onclick="rFilter()">BUSCAR</button>
    <span style="margin-left:auto;align-self:flex-end;font-family:'Orbitron',monospace;font-size:.62rem;color:rgba(96,165,250,.4)" id="r-count">${DB_DATA.realty.length} imóveis</span>
  </div>
  <div class="rei-listings">
    <div class="rei-grid" id="rei-grid">
      ${DB_DATA.realty.map(p=>`
        <div class="rei-card" onclick="openModal(mRealtyCard(${p.id}))">
          <div class="rei-card-img" style="background:${p.bg};position:relative;overflow:hidden">
            ${p.img
              ? `<img src="${p.img}" alt="${p.t}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                 <span style="display:none;font-size:4rem;position:absolute;inset:0;align-items:center;justify-content:center;z-index:1">${p.e}</span>`
              : `<span style="font-size:4rem">${p.e}</span>`
            }
            <div class="rei-type" style="background:${p.typeBg};position:absolute;top:12px;left:12px;z-index:3">${p.type}</div>
            <button class="rei-fav" onclick="event.stopPropagation();favToggle('r${p.id}',this)" style="position:absolute;top:12px;right:12px;z-index:3">♡</button>
          </div>
          <div class="rei-card-body">
            <div class="rei-card-title">${p.t}</div>
            <div class="rei-card-loc">📍 ${p.l}</div>
            <div class="rei-card-specs">
              ${p.rooms>0?`<span class="rei-spec">🛏 ${p.rooms} qtos</span>`:''}
              <span class="rei-spec">📐 ${p.area}m²</span>
              <span class="rei-spec">🚗 ${p.garage} vagas</span>
            </div>
            <div class="rei-price">${p.p}</div>
            <button class="rei-card-btn" onclick="event.stopPropagation();openModal(mRealtyCard(${p.id}))">VER DETALHES →</button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</div>`,

// ── 8. RESTAURANTE ──────────────────────────────────────────────
restaurant: () => `
<div class="rst-root">
  <div class="rst-topbar">
    <span class="rst-resto-name">Bistrô Paulistano — Cozinha Autoral</span>
    <div class="rst-sep"></div>
    <span class="rst-hours">Ter–Dom · 12h–23h · (11) 3456-7890</span>
  </div>
  <nav class="rst-nav">
    <div class="rst-brand">Bistrô</div>
    <div class="rst-nav-links">
      ${['Início','Cardápio','Reservas','Eventos','Delivery'].map((l,i)=>`<span class="rst-nav-link${i===0?' active':''}" onclick="toast('${l}...')">${l}</span>`).join('')}
    </div>
    <div class="rst-nav-right">
      <button class="rst-wa-btn" onclick="wa('Olá!')">💬 Delivery</button>
      <button class="rst-reserve-btn" onclick="openModal(mReserva())">Reservar Mesa</button>
    </div>
  </nav>
  <div class="rst-hero">
    <div class="rst-hero-bg"></div>
    <div class="rst-rings">
      ${[300,500,700,900].map((s,i)=>`<div class="rst-ring" style="width:${s}px;height:${s}px;animation-delay:${-i*1.5}s"></div>`).join('')}
    </div>
    <div class="rst-hero-content">
      <div class="rst-ornament">✦ ✦ ✦</div>
      <h1 class="rst-h1">Uma experiência<br><em>inesquecível</em></h1>
      <div class="rst-divider">✦</div>
      <p class="rst-sub">Ingredientes direto do produtor. Cardápio sazonal renovado semanalmente. Cada prato é uma história contada com paixão.</p>
      <div class="rst-hero-btns">
        <button class="rst-btn-p" onclick="openModal(mReserva())">Reservar Mesa</button>
        <button class="rst-btn-g" onclick="document.getElementById('rst-menu').scrollIntoView({behavior:'smooth'})">Ver Cardápio ↓</button>
        <button class="rst-wa-btn" onclick="wa('Quero pedir delivery!')" style="padding:15px 20px">📱 Delivery</button>
      </div>
    </div>
  </div>
  <!-- MENU -->
  <div class="rst-menu" id="rst-menu">
    <div class="rst-menu-h">
      <div class="rst-menu-title">Nosso Cardápio</div>
      <div class="rst-menu-orn">Seleção Sazonal · Ingredientes Locais</div>
    </div>
    <div class="rst-tabs" id="rst-tabs">
      ${Object.keys(DB_DATA.restaurant).map((t,i)=>{
        const icons={Entradas:'🥗',Pratos:'🍽️',Bebidas:'🍷',Sobremesas:'🍮'};
        return`<div class="rst-tab${i===0?' on':''}" data-tab="${t}" onclick="rstTab('${t}',this)">${icons[t]||''} ${t}</div>`;
      }).join('')}
    </div>
    <div class="rst-items" id="rst-items">${buildRstItems('Entradas')}</div>
  </div>
</div>`,

// ── 9. ESTÉTICA ─────────────────────────────────────────────────
beauty: () => `
<div class="bty-root">
  <div class="bty-vert-text">Lumina Beauty Studio · São Paulo</div>
  <nav class="bty-nav">
    <div class="bty-brand">Lumina <em>Beauty</em></div>
    <div class="bty-nav-links">
      ${['Início','Procedimentos','Agenda','Equipe','Blog'].map((l,i)=>`<span class="bty-nav-link${i===0?' active':''}" onclick="toast('${l}...')">${l}</span>`).join('')}
    </div>
    <div class="bty-nav-right">
      <button class="bty-nav-btn bty-btn-wa" onclick="wa('Olá Lumina!')">💬 WhatsApp</button>
      <button class="bty-nav-btn bty-btn-book" onclick="openModal(mBeauty())">Avaliação Gratuita</button>
    </div>
  </nav>
  <div class="bty-hero">
    <div class="bty-hero-left">
      <div class="bty-hero-left" style="position:relative"></div>
      <div class="bty-year">Est. 2015 — São Paulo, Brasil</div>
      <h1 class="bty-h1">Realce sua<br>beleza<br><em>natural.</em></h1>
      <div class="bty-rule"></div>
      <p class="bty-sub">Procedimentos com tecnologia de ponta, produtos premium importados e profissionais certificados internacionalmente.</p>
      <div class="bty-hero-btns">
        <button class="bty-btn-p" onclick="openModal(mBeauty())">AVALIAÇÃO GRATUITA →</button>
        <button class="bty-btn-g" onclick="document.getElementById('bty-treats').scrollIntoView({behavior:'smooth'})">Ver Procedimentos</button>
      </div>
    </div>
    <div class="bty-hero-right">
      ${[['💉','Injetáveis','Botox, preenchimentos e enzimas','A partir R$ 380'],['✨','Laser & Luz','Rejuvenescimento e manchas','A partir R$ 290'],['🧴','Pele','Peelings e tratamentos faciais','A partir R$ 180'],['💆','Relaxamento','Massagens e drenagem','A partir R$ 120']].map(([e,t,s,p])=>`
        <div class="bty-feat" onclick="toast('${t}...')">
          <div class="bty-feat-e">${e}</div>
          <div class="bty-feat-t">${t}</div>
          <div class="bty-feat-s">${s}</div>
          <div class="bty-feat-p">${p}</div>
        </div>
      `).join('')}
    </div>
  </div>
  <!-- STATS -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(42,31,22,.08);border-bottom:1px solid rgba(42,31,22,.08);background:#f2ebe0">
    ${[['3.000+','Procedimentos/ano'],['10 anos','Experiência'],['98%','Satisfação'],['15+','Especialistas']].map(([n,l])=>`
      <div style="padding:24px 28px;border-right:1px solid rgba(42,31,22,.08);transition:background .2s;cursor:default" onmouseover="this.style.background='#ece3d6'" onmouseout="this.style.background=''">
        <div style="font-family:'Fraunces',serif;font-size:2rem;font-weight:700;color:var(--A);line-height:1;margin-bottom:4px">${n}</div>
        <div style="font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(42,31,22,.4)">${l}</div>
      </div>
    `).join('')}
  </div>
  <!-- TREATMENTS -->
  <div class="bty-treats" id="bty-treats">
    <div class="bty-sec-k">Resultados que Transformam</div>
    <h2 class="bty-sec-t">Procedimentos<br><em>em Destaque</em></h2>
    <div class="bty-filter-row">
      ${['Todos','Rosto','Pele','Corpo'].map((c,i)=>`<button class="bty-filter-btn${i===0?' on':''}" onclick="btyFilter('${c}',this)">${c}</button>`).join('')}
    </div>
    <div class="bty-treats-grid" id="bty-grid">
      ${DB_DATA.beauty.map(t=>`
        <div class="bty-treat" data-cat="${t.cat}" onclick="openModal(mBtyTreat(${t.id}))">
          ${t.img
            ? `<div style="width:100%;height:160px;overflow:hidden;border-radius:12px 12px 0 0;position:relative">
                 <img src="${t.img}" alt="${t.n}" style="width:100%;height:100%;object-fit:cover"
                      onerror="this.parentNode.style.display='none'">
               </div>`
            : `<div class="bty-ba">
                 <div class="bty-ba-before"><span style="font-size:3rem">${t.before}</span><span class="bty-ba-label">antes</span></div>
                 <div class="bty-ba-sep"></div>
                 <div class="bty-ba-after"><span style="font-size:3rem">${t.after}</span><span class="bty-ba-label" style="color:rgba(196,168,130,.45)">depois</span></div>
               </div>`
          }
          <div class="bty-treat-body">
            <div class="bty-treat-n">${t.n}</div>
            <div class="bty-treat-d">${t.d}</div>
            <div class="bty-treat-foot">
              <div><div class="bty-treat-p">${t.p}</div><div class="bty-treat-dur">⏱ ${t.dur}</div></div>
              <button class="bty-book-btn" onclick="event.stopPropagation();openModal(mBeauty())">AGENDAR</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</div>`,

// ── 10. SOFTWARE ────────────────────────────────────────────────
tech: () => {
  const matrix = Array.from({length:500},()=>'01アイウカキクケコ0101'.split('')[Math.floor(Math.random()*14)]).join(' ');
  return `<div class="tec-root">
    <div class="tec-crt"></div>
    <div class="tec-vignette"></div>
    <nav class="tec-nav">
      <div class="tec-brand">DEV.STUDIO</div>
      <div class="tec-nav-links">
        ${['home','servicos','portfolio','stack','processo','contato'].map((l,i)=>`<span class="tec-nav-link${i===0?' active':''}" onclick="toast('./${l}...')">${l}</span>`).join('')}
      </div>
      <div class="tec-nav-right">
        <button class="tec-nav-btn" onclick="openModal(mTech())">orcar_projeto()</button>
        <button class="tec-nav-btn" onclick="wa('Olá Dev.Studio!')">whatsapp()</button>
      </div>
    </nav>
    <div class="tec-hero">
      <div class="tec-matrix-rain">${matrix}</div>
      <div class="tec-hero-glow"></div>
      <div class="tec-hero-content">
        <div class="tec-hero-split">
          <div>
            <div class="tec-prompt">$ <span>whoami</span> → senior.fullstack@dev.studio</div>
            <h1 class="tec-h1">BUILD<br><span class="tec-h1-dim">FASTER.</span><br>SCALE<br><span class="tec-h1-dim">SMARTER.</span></h1>
            <p class="tec-comment">Soluções digitais que escalam. Full-stack, IA aplicada, microsserviços e automações para empresas que não aceitam o segundo lugar.</p>
            <div class="tec-btns">
              <button class="tec-btn-p" onclick="openModal(mTech())">orcar_projeto</button>
              <button class="tec-btn-g" onclick="toast('portfolio...')">ver_portfolio()</button>
            </div>
          </div>
          <div class="tec-terminal">
            <div class="tec-term-bar">
              <div class="tec-tdot" style="background:#ff5f56"></div>
              <div class="tec-tdot" style="background:#ffbd2e"></div>
              <div class="tec-tdot" style="background:#27c93f"></div>
              <span class="tec-term-title">zsh — dev@studio ~ </span>
            </div>
            <div class="tec-term-body" id="tec-term"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="tec-stats">
      ${[['120+','Projetos Entregues'],['99.9%','Uptime SLA'],['< 2h','Suporte'],['8 anos','Mercado']].map(([n,l])=>`<div class="tec-stat"><div class="tec-stat-n">${n}</div><div class="tec-stat-l">${l}</div></div>`).join('')}
    </div>
    <div class="tec-body">
      <div class="tec-two-col">
        <div>
          <div class="tec-sec-label">repositórios públicos</div>
          <div class="tec-sec-t">Open Source</div>
          ${DB_DATA.tech.repos.map(r=>`
            <div class="tec-repo" onclick="toast('📁 ${r.n}...')" onmouseover="this.style.borderColor='var(--A)'" onmouseout="this.style.borderColor='rgba(0,255,136,.1)'">
              <div class="tec-repo-n">📁 ${r.n}</div>
              <div class="tec-repo-d">${r.d}</div>
              <div class="tec-repo-meta">
                <span><span class="tec-ldot" style="background:${r.lc}"></span>${r.l}</span>
                <span>★ ${r.s}</span><span>⑂ ${r.f}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div>
          <div class="tec-sec-label">proficiência técnica</div>
          <div class="tec-sec-t">Tech Stack</div>
          <div id="tec-stack">
            ${DB_DATA.tech.stack.map(s=>`
              <div class="tec-stack-row">
                <span style="font-size:1.1rem">${s.i}</span>
                <div style="flex:1">
                  <div class="tec-stack-n">${s.n}</div>
                  <div class="tec-bar-track"><div class="tec-bar-fill" data-p="${s.p}" style="width:0;background:${s.c}"></div></div>
                </div>
                <span class="tec-stack-pct">${s.p}%</span>
              </div>
            `).join('')}
          </div>
          <div class="tec-cta">
            <div class="tec-cta-t">// Pronto para colaborar?</div>
            <p class="tec-cta-s">Entrega ágil, código limpo e arquitetura que escala com seu negócio. Resposta em até 2h úteis.</p>
            <button class="tec-btn-p" onclick="openModal(mTech())" style="font-size:.68rem;padding:12px 28px">iniciar_projeto()</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
},

}; // END RENDER

// ── MODAL HELPERS ───────────────────────────────────────────────
function mAgenda(svc='') {
  return mForm('Agendar Consulta','Confirmação por WhatsApp em minutos.',`
    <div class="fr"><div class="fl"><label>Nome</label><input class="fi" placeholder="Seu nome"></div><div class="fl"><label>WhatsApp</label><input class="fi" placeholder="(11) 99999-9999" type="tel"></div></div>
    <div class="fl"><label>Especialidade</label><select class="fse"><option${svc?` value="${svc}" selected`:''}>Clareamento a Laser</option><option>Aparelho Invisível</option><option>Implante</option><option>Lentes de Contato</option><option>Limpeza</option></select></div>
    <div class="fr"><div class="fl"><label>Data</label><input class="fi" type="date"></div><div class="fl"><label>Horário</label><select class="fse">${['08:00','09:30','11:00','14:00','15:30','17:00','18:30'].map(h=>`<option>${h}</option>`).join('')}</select></div></div>
  `,'Confirmar Agendamento');
}
function mGym(plan='') {
  return mForm('Começar Grátis','7 dias grátis. Sem cartão de crédito.',`
    <div class="fr"><div class="fl"><label>Nome</label><input class="fi" placeholder="Seu nome"></div><div class="fl"><label>WhatsApp</label><input class="fi" placeholder="(11) 99999-9999"></div></div>
    <div class="fl"><label>Plano</label><select class="fse"><option${plan==='STARTER'?' selected':''}>STARTER — R$89/mês</option><option${plan==='PRO'?' selected':''}>PRO — R$149/mês</option><option${plan==='ELITE'?' selected':''}>ELITE — R$249/mês</option></select></div>
    <div class="fl"><label>Objetivo</label><select class="fse"><option>Emagrecer</option><option>Hipertrofia</option><option>Condicionamento</option><option>Bem-estar</option></select></div>
  `,'Começar Agora →');
}
function mLaw() {
  return mForm('Consulta Jurídica','Primeira consulta gratuita. Sem compromisso.',`
    <div class="fr"><div class="fl"><label>Nome</label><input class="fi" placeholder="Seu nome"></div><div class="fl"><label>WhatsApp</label><input class="fi" placeholder="(11) 99999-9999"></div></div>
    <div class="fl"><label>Área</label><select class="fse">${DB_DATA.law.map(a=>`<option>${a.t}</option>`).join('')}</select></div>
    <div class="fl"><label>Descreva seu caso</label><textarea class="fta" placeholder="Situação que precisa de orientação..."></textarea></div>
  `,'Agendar Consulta Gratuita');
}
function mPet(svc='') {
  return mForm('Agendar Serviço','Confirmação imediata por WhatsApp.',`
    <div class="fr"><div class="fl"><label>Seu Nome</label><input class="fi" placeholder="Nome do tutor"></div><div class="fl"><label>WhatsApp</label><input class="fi" placeholder="(11) 99999-9999"></div></div>
    <div class="fr"><div class="fl"><label>Nome do Pet</label><input class="fi" placeholder="Nome do pet"></div><div class="fl"><label>Raça</label><input class="fi" placeholder="Ex: Golden Retriever"></div></div>
    <div class="fl"><label>Serviço</label><select class="fse">${DB_DATA.pet.map(s=>`<option${s.n===svc?' selected':''}>${s.e} ${s.n} — ${s.p}</option>`).join('')}</select></div>
    <div class="fr"><div class="fl"><label>Data</label><input class="fi" type="date"></div><div class="fl"><label>Horário</label><select class="fse">${['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'].map(h=>`<option>${h}</option>`).join('')}</select></div></div>
  `,'Confirmar Agendamento 🐾');
}
function mPetSvc(name,price,e,c) {
  return `<div style="font-size:4rem;text-align:center;margin-bottom:16px">${e}</div>
  <div class="mt">${name}</div><div class="ms">${price}</div>
  <div style="background:${c}18;border:1px solid ${c}33;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center">
    <div style="font-size:1.3rem;font-weight:800;color:${c}">${price}</div>
  </div>
  <button class="fsb" style="background:${c}" onclick="closeModal();openModal(mPet('${name}'))">Agendar ${name}</button>
  <button class="fwa" onclick="closeModal();wa('Quero agendar ${name}!')">💬 WhatsApp</button>`;
}
function mReserva() {
  return mForm('Reservar Mesa','Confirmação por e-mail e WhatsApp.',`
    <div class="fr"><div class="fl"><label>Nome</label><input class="fi" placeholder="Nome da reserva"></div><div class="fl"><label>WhatsApp</label><input class="fi" placeholder="(11) 99999-9999"></div></div>
    <div class="fr"><div class="fl"><label>Data</label><input class="fi" type="date"></div><div class="fl"><label>Horário</label><select class="fse"><option>12:00 — Almoço</option><option>13:30 — Almoço</option><option>19:00 — Jantar</option><option>20:00 — Jantar</option><option>21:00 — Jantar</option></select></div></div>
    <div class="fr"><div class="fl"><label>Pessoas</label><select class="fse">${[1,2,3,4,5,6,8,10].map(n=>`<option>${n} pessoa${n>1?'s':''}</option>`).join('')}</select></div><div class="fl"><label>Ocasião</label><select class="fse"><option>Almoço/Jantar</option><option>Aniversário</option><option>Negócios</option><option>Evento</option></select></div></div>
    <div class="fl"><label>Observações</label><textarea class="fta" placeholder="Alergias, cadeirinha, preferências..."></textarea></div>
  `,'Confirmar Reserva');
}
function mBeauty() {
  return mForm('Avaliação Gratuita','Análise personalizada com especialista. Sem compromisso.',`
    <div class="fr"><div class="fl"><label>Nome</label><input class="fi" placeholder="Seu nome"></div><div class="fl"><label>WhatsApp</label><input class="fi" placeholder="(11) 99999-9999"></div></div>
    <div class="fl"><label>Área de Interesse</label><select class="fse"><option>Rosto (injetáveis)</option><option>Pele (laser/peeling)</option><option>Sobrancelhas</option><option>Lábios</option><option>Corpo</option></select></div>
    <div class="fr"><div class="fl"><label>Data</label><input class="fi" type="date"></div><div class="fl"><label>Horário</label><select class="fse">${['09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(h=>`<option>${h}</option>`).join('')}</select></div></div>
  `,'Agendar Avaliação Gratuita');
}
function mBtyTreat(id) {
  const t = DB_DATA.beauty.find(x=>x.id===id) || DB_DATA.beauty[id-1] || DB_DATA.beauty[0]; if(!t) return "";
  return `<div style="display:grid;grid-template-columns:1fr 1fr;height:130px;border-radius:10px;overflow:hidden;margin-bottom:18px">
    <div style="background:#f5ede6;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:2.8rem">${t.before}</span><span style="font-size:.58rem;font-weight:700;letter-spacing:.18em;color:rgba(42,31,22,.4);margin-top:6px;text-transform:uppercase">ANTES</span></div>
    <div style="background:#2a1f16;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:2.8rem">${t.after}</span><span style="font-size:.58rem;font-weight:700;letter-spacing:.18em;color:rgba(196,168,130,.4);margin-top:6px;text-transform:uppercase">DEPOIS</span></div>
  </div>
  <div class="mt">${t.n}</div><div class="ms">${t.d}</div>
  <div style="display:flex;gap:10px;margin-bottom:18px">
    <div style="flex:1;background:rgba(196,168,130,.1);border:1px solid rgba(196,168,130,.2);padding:12px;border-radius:7px;text-align:center"><div style="font-size:1.15rem;font-weight:800;color:var(--A)">${t.p}</div><div style="font-size:.7rem;color:rgba(42,31,22,.4)">Valor</div></div>
    <div style="flex:1;background:rgba(196,168,130,.1);border:1px solid rgba(196,168,130,.2);padding:12px;border-radius:7px;text-align:center"><div style="font-size:1.15rem;font-weight:800;color:var(--A)">${t.dur}</div><div style="font-size:.7rem;color:rgba(42,31,22,.4)">Duração</div></div>
  </div>
  <button class="fsb" onclick="closeModal();openModal(mBeauty())">Agendar Este Procedimento →</button>
  <button class="fwa" onclick="closeModal();wa('Quero agendar ${t.n}!')">💬 WhatsApp</button>`;
}
function mRealty() {
  return mForm('Falar com Corretor','Retorno em até 30 minutos.',`
    <div class="fr"><div class="fl"><label>Nome</label><input class="fi" placeholder="Seu nome"></div><div class="fl"><label>WhatsApp</label><input class="fi" placeholder="(11) 99999-9999"></div></div>
    <div class="fl"><label>Interesse</label><select class="fse"><option>Comprar</option><option>Alugar</option><option>Vender meu imóvel</option><option>Avaliação gratuita</option></select></div>
    <div class="fl"><label>Faixa de Valor</label><select class="fse"><option>Até R$ 500k</option><option>R$ 500k–1M</option><option>R$ 1M–3M</option><option>R$ 3M–6M</option><option>R$ 6M+</option></select></div>
  `,'Falar com Corretor →');
}
function mRealtyCard(id) {
  const p = DB_DATA.realty.find(x=>x.id===id) || DB_DATA.realty[id-1] || DB_DATA.realty[0]; if(!p) return "";
  return `<div style="font-size:3.5rem;text-align:center;margin-bottom:12px">${p.e}</div>
  <div class="mt">${p.t}</div><div class="ms">📍 ${p.l}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:18px">
    ${[['Área',`${p.area}m²`],['Quartos',p.rooms||'—'],['Vagas',p.garage]].map(([k,v])=>`<div style="background:rgba(96,165,250,.06);border:1px solid rgba(96,165,250,.1);padding:10px;border-radius:7px;text-align:center"><div style="font-size:.88rem;font-weight:700;color:var(--A)">${v}</div><div style="font-size:.65rem;color:rgba(221,232,245,.35);margin-top:2px;text-transform:uppercase;letter-spacing:.08em">${k}</div></div>`).join('')}
  </div>
  <div style="font-size:1.6rem;font-weight:900;color:var(--A);text-align:center;margin:14px 0;font-family:'Orbitron',monospace">${p.p}</div>
  <div class="fr" style="margin-bottom:12px"><div class="fl"><label>Nome</label><input class="fi" placeholder="Seu nome"></div><div class="fl"><label>WhatsApp</label><input class="fi" placeholder="(11) 99999-9999"></div></div>
  <button class="fsb" onclick="closeModal();toast('✅ Corretor notificado!')">Tenho Interesse →</button>
  <button class="fwa" onclick="closeModal();wa('Interesse: ${p.t}!')">💬 WhatsApp com Corretor</button>`;
}
function mTech() {
  return mForm('orcar_projeto()','Resposta em até 2h úteis. Orçamento gratuito.',`
    <div class="fr"><div class="fl"><label>Nome</label><input class="fi" placeholder="Seu nome"></div><div class="fl"><label>WhatsApp</label><input class="fi" placeholder="(11) 99999-9999"></div></div>
    <div class="fl"><label>Tipo de Projeto</label><select class="fse"><option>Web App / SaaS</option><option>App Mobile</option><option>API / Backend</option><option>IA / Machine Learning</option><option>E-commerce</option><option>Dashboard / BI</option></select></div>
    <div class="fr"><div class="fl"><label>Orçamento</label><select class="fse"><option>R$ 5k–15k</option><option>R$ 15k–50k</option><option>R$ 50k–150k</option><option>R$ 150k+</option></select></div><div class="fl"><label>Prazo</label><select class="fse"><option>Urgente &lt;1 mês</option><option>2–3 meses</option><option>3–6 meses</option><option>6+ meses</option></select></div></div>
    <div class="fl"><label>Descreva o Projeto</label><textarea class="fta" placeholder="O que você precisa construir?"></textarea></div>
  `,'Enviar Briefing →');
}

// ── INTERACTIONS ─────────────────────────────────────────────────
window.selTime = function(el, t) {
  document.querySelectorAll('.den-time').forEach(x => x.classList.remove('sel'));
  el.classList.add('sel');
};
window.carFilter = function() {
  const cat = document.getElementById('car-cat')?.value||'';
  const cond = document.getElementById('car-cond')?.value||'';
  const q = (document.getElementById('car-q')?.value||'').toLowerCase();
  let n=0;
  document.querySelectorAll('#car-grid .car-card-wrap').forEach((el,i)=>{
    const c=DB_DATA.car[i]; if(!c){el.style.display="none";return;}
    const show=(!cat||cat==='Todos'||c.cat===cat)&&(!cond||cond==='Todos'||c.tag===cond)&&(!q||c.m.toLowerCase().includes(q));
    el.style.display=show?'':'none';
    if(show)n++;
  });
  const cnt=document.getElementById('car-count');
  if(cnt)cnt.textContent=`${n} veículos`;
};
window.mktFilter = function(cat,el) {
  document.querySelectorAll('.mkt-cat').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  let n=0;
  document.querySelectorAll('.mkt-prod').forEach(p=>{
    const show=cat==='Todos'||p.dataset.cat===cat;
    p.style.display=show?'':'none';
    if(show)n++;
  });
  const cnt=document.getElementById('mkt-count');
  if(cnt)cnt.textContent=`${n} produtos`;
};
window.mktAdd = function(btn,name) {
  btn.textContent='✓';btn.style.background='#4ade80';btn.style.transform='rotate(0deg)';
  setTimeout(()=>{btn.textContent='+';btn.style.background='#0d0d0d';btn.style.transform=''},1200);
  addCart(name);
};
window.rFilter = function() {
  const tipo=document.getElementById('r-tipo')?.value||'';
  const loc=(document.getElementById('r-loc')?.value||'').toLowerCase();
  let n=0;
  document.querySelectorAll('#rei-grid .rei-card').forEach((el,i)=>{
    const p=DB_DATA.realty[i]; if(!p){el.style.display="none";return;}
    const show=(!tipo||p.type===tipo)&&(!loc||p.l.toLowerCase().includes(loc));
    el.style.display=show?'':'none';if(show)n++;
  });
  const cnt=document.getElementById('r-count');
  if(cnt)cnt.textContent=`${n} imóveis`;
};
function buildRstItems(tab) {
  return (DB_DATA.restaurant[tab]||[]).map(it=>`
    <div class="rst-item" onclick="addCart('${it.n}')" onmouseover="this.querySelector('.rst-add-btn').style.opacity='1';this.querySelector('.rst-add-btn').style.transform='translateX(0)'" onmouseout="this.querySelector('.rst-add-btn').style.opacity='0';this.querySelector('.rst-add-btn').style.transform='translateX(8px)'">
      <div class="rst-item-e" style="position:relative;overflow:hidden;border-radius:10px;flex-shrink:0;width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:2.2rem">
        ${it.img
          ? `<img src="${it.img}" alt="${it.n}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:10px"
                onerror="this.style.display='none'">
             ${it.e}`
          : it.e
        }
      </div>
      <div class="rst-item-info">
        <div class="rst-item-n">${it.n}</div>
        <div class="rst-item-d">${it.d}</div>
        <div class="rst-item-tags">${(it.tags||[]).map(t=>`<span class="rst-item-tag">${t}</span>`).join('')}</div>
      </div>
      <div class="rst-item-right">
        <div class="rst-item-p">${it.p}</div>
        <button class="rst-add-btn" style="opacity:0;transform:translateX(8px);transition:all .22s" onclick="event.stopPropagation();addCart('${it.n}')">+ Pedir</button>
      </div>
    </div>
  `).join('');
}
window.rstTab = function(tab, el) {
  document.querySelectorAll('.rst-tab').forEach(t=>t.classList.remove('on'));
  el.classList.add('on');
  const box=document.getElementById('rst-items');
  box.style.opacity='0';
  setTimeout(()=>{box.innerHTML=buildRstItems(tab);box.style.transition='opacity .25s';box.style.opacity='1';},160);
};
window.btyFilter = function(cat,el) {
  document.querySelectorAll('.bty-filter-btn').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  document.querySelectorAll('#bty-grid .bty-treat').forEach(card=>{
    card.style.display=cat==='Todos'||card.dataset.cat===cat?'':'none';
  });
};

// ── POST HOOKS ────────────────────────────────────────────────────
const POST = {
  car: () => {
    // cursor handled globally
  },
  tech: () => {
    const lines=[
      {t:'cmd',txt:'$ npx analyze --client=você'},
      {t:'out',txt:'✓ Identificando stack...'},
      {t:'out',txt:'✓ Avaliando arquitetura...'},
      {t:'warn',txt:'⚠ Gargalos encontrados: 3'},
      {t:'out',txt:'→ proposal.pdf gerado com sucesso'},
    ];
    const el=document.getElementById('tec-term');
    if(!el)return;
    const colors={cmd:'var(--A)',out:'rgba(0,255,136,.42)',warn:'#ffd700'};
    let li=0,ci=0;
    let curEl=null;
    function tick(){
      if(!document.getElementById('tec-term'))return;
      if(li>=lines.length){el.innerHTML+='<span class="tec-tc tec-tc-cmd">$ <span class="tec-cursor"></span></span>';return;}
      const line=lines[li];
      if(ci===0){curEl=document.createElement('span');curEl.className='tec-tc';curEl.style.color=colors[line.t];el.appendChild(curEl);}
      if(curEl)curEl.textContent=line.txt.slice(0,ci+1);
      ci++;
      if(ci>=line.txt.length){li++;ci=0;setTimeout(tick,180);}else setTimeout(tick,22);
    }
    setTimeout(tick,500);
    // Stack bars
    setTimeout(()=>{document.querySelectorAll('.tec-bar-fill').forEach(b=>{b.style.width=b.dataset.p+'%';});},700);
  },
};

// ── UNIVERSAL CURSOR ─────────────────────────────────────────────
(function initCursor() {
  // Only on non-touch devices
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  const glow = document.getElementById('cur-glow');
  const dot  = document.getElementById('cur-dot');
  if (!glow || !dot) return;

  document.body.classList.add('has-cursor');

  let mx = -100, my = -100;
  let gx = -100, gy = -100;
  let raf;

  function loop() {
    // dot follows instantly
    dot.style.transform  = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
    // glow lerps behind
    gx += (mx - gx) * 0.14;
    gy += (my - gy) * 0.14;
    glow.style.transform = `translate(calc(${gx}px - 50%), calc(${gy}px - 50%))`;
    raf = requestAnimationFrame(loop);
  }

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, {passive:true});
  document.addEventListener('mousedown', () => glow.classList.add('clicking'));
  document.addEventListener('mouseup',   () => glow.classList.remove('clicking'));
  document.addEventListener('mouseleave',() => { glow.style.opacity='0'; dot.style.opacity='0'; });
  document.addEventListener('mouseenter',() => { glow.style.opacity='1'; dot.style.opacity='1'; });

  // Bigger glow on interactive elements
  document.addEventListener('mouseover', e => {
    if (e.target.closest('button,a,[onclick],[class*="card"],[class*="svc"],[class*="treat"],[class*="repo"],[class*="area"]')) {
      glow.style.width  = '52px';
      glow.style.height = '52px';
    } else {
      glow.style.width  = '32px';
      glow.style.height = '32px';
    }
  }, {passive:true});

  loop();
})();
const MBN_CONFIGS = {
  car:        [{i:'🏠',l:'Início'},{i:'🚗',l:'Estoque'},{i:'📋',l:'Interesse'},{i:'💬',l:'WhatsApp'}],
  dental:     [{i:'🏠',l:'Início'},{i:'🦷',l:'Serviços'},{i:'📅',l:'Agendar'},{i:'💬',l:'WhatsApp'}],
  market:     [{i:'🏠',l:'Início'},{i:'🛒',l:'Produtos'},{i:'🏷️',l:'Ofertas'},{i:'📍',l:'Entrega'}],
  gym:        [{i:'🏠',l:'Início'},{i:'📅',l:'Grade'},{i:'💪',l:'Planos'},{i:'💬',l:'WhatsApp'}],
  law:        [{i:'🏠',l:'Início'},{i:'⚖️',l:'Áreas'},{i:'📝',l:'Consulta'},{i:'💬',l:'WhatsApp'}],
  pet:        [{i:'🏠',l:'Início'},{i:'🐾',l:'Serviços'},{i:'📅',l:'Agendar'},{i:'💬',l:'WhatsApp'}],
  realty:     [{i:'🏠',l:'Início'},{i:'🔍',l:'Buscar'},{i:'❤️',l:'Salvos'},{i:'💬',l:'Corretor'}],
  restaurant: [{i:'🏠',l:'Início'},{i:'🍽️',l:'Cardápio'},{i:'📅',l:'Reservar'},{i:'📱',l:'Delivery'}],
  beauty:     [{i:'🏠',l:'Início'},{i:'✨',l:'Tratamentos'},{i:'📅',l:'Agendar'},{i:'💬',l:'WhatsApp'}],
  tech:       [{i:'🏠',l:'Início'},{i:'💻',l:'Portfolio'},{i:'📋',l:'Orçamento'},{i:'💬',l:'WhatsApp'}],
};

function buildMobileNav(n) {
  const items = MBN_CONFIGS[n] || [];
  const th = THEMES[n];
  const actions = [
    () => window.scrollTo({top:0,behavior:'smooth'}),
    () => { const s = document.querySelector('[id$="estoque"],[id$="sched"],[id$="grid"],[id$="rst-menu"],[id$="gym-sched"],[id$="bty-treats"],[id$="rei-grid"],.den-c3,.mkt-products,.pet-services,.rei-listings,.law-articles'); if(s) s.scrollIntoView({behavior:'smooth'}); },
    () => openModal(
      n==='car'?mInteresse('Tenho Interesse'):
      n==='dental'?mAgenda():
      n==='gym'?mGym():
      n==='law'?mLaw():
      n==='pet'?mPet():
      n==='realty'?mRealty():
      n==='restaurant'?mReserva():
      n==='beauty'?mBeauty():
      n==='tech'?mTech():
      mInteresse()
    ),
    () => wa('Olá!'),
  ];
  return `
  <nav class="mobile-bottom-nav" style="--A:${th.A};--MB:${th.MB};--MBG:${th.MBG}">
    ${items.map((item,i)=>`
      <button class="mbn-item${i===0?' active':''}" onclick="mbnClick(this,${i})" data-action="${i}">
        <span class="mbn-icon">${item.i}</span>
        <span>${item.l}</span>
      </button>
    `).join('')}
  </nav>`;
}

window.mbnClick = function(btn, idx) {
  document.querySelectorAll('.mbn-item').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const actions = [
    () => window.scrollTo({top:0,behavior:'smooth'}),
    () => {
      const selectors = '#estoque,#gym-sched,#rst-menu,#bty-treats,.rei-listings,.pet-services,.law-articles,.mkt-products,.den-c3';
      const target = document.querySelector(selectors);
      if(target) target.scrollIntoView({behavior:'smooth'});
    },
    () => openModal(
      cur==='car'?mInteresse('Tenho Interesse'):
      cur==='dental'?mAgenda():
      cur==='gym'?mGym():
      cur==='law'?mLaw():
      cur==='pet'?mPet():
      cur==='realty'?mRealty():
      cur==='restaurant'?mReserva():
      cur==='beauty'?mBeauty():
      cur==='tech'?mTech():
      mInteresse()
    ),
    () => wa('Olá!'),
  ];
  if(actions[idx]) actions[idx]();
};

// ── SCROLL REVEAL ────────────────────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.car-card-wrap,.den-cell,.mkt-prod,.gym-plan,.law-art-card,.pet-svc,.rei-card,.rst-item,.bty-treat,.tec-repo,.tec-stack-row');
  if (!window.IntersectionObserver) { els.forEach(e=>{ e.style.opacity='1'; e.style.transform='none'; }); return; }
  els.forEach(el => el.classList.add('reveal-on-scroll'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));
}

// ── INIT ──────────────────────────────────────────────────────────
function fullInit(n) {
  const th = THEMES[n];
  document.getElementById('lbl').textContent = th.label;
  document.getElementById('lbl').style.color = th.A;
  document.getElementById('lbl').style.borderColor = th.A;
  document.getElementById('tst').querySelector('.tdt').style.background = th.A;
  document.documentElement.style.setProperty('--A', th.A);

  // Update cursor color (convert hex to R,G,B)
  function hexToRGB(hex) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }
  document.documentElement.style.setProperty('--CR', hexToRGB(th.A));

  // Remove old mobile nav
  document.querySelectorAll('.mobile-bottom-nav').forEach(el=>el.remove());
  // Inject new mobile nav
  document.body.insertAdjacentHTML('beforeend', buildMobileNav(n));
  // Run post hooks
  POST[n] && POST[n]();
  // Scroll reveal
  setTimeout(initScrollReveal, 100);
}


// ── FIREBASE REAL-TIME LISTENERS ─────────────────────────────────
function rerenderCurrent() {
  const app = document.getElementById('app');
  app.classList.add('out');
  setTimeout(() => {
    app.innerHTML = RENDER[cur]();
    app.classList.remove('out');
    fullInit(cur);
    toast('🔄 Dados atualizados!');
  }, 180);
}

function setupFirebaseListeners() {
  const toArr = val => val ? Object.values(val) : [];
  const withIds = arr => arr.map((item, i) => ({ ...item, id: item.id ?? (i + 1) }));

  _db.ref('car/items').on('value', snap => {
    const val = snap.val();
    if (val) { DB_DATA.car = withIds(toArr(val)); if (cur === 'car') rerenderCurrent(); }
  });
  _db.ref('dental/services').on('value', snap => {
    const val = snap.val();
    if (val) { DB_DATA.dental = toArr(val); if (cur === 'dental') rerenderCurrent(); }
  });
  _db.ref('market/items').on('value', snap => {
    const val = snap.val();
    if (val) { DB_DATA.market = withIds(toArr(val)); if (cur === 'market') rerenderCurrent(); }
  });
  _db.ref('gym/schedule').on('value', snap => {
    const val = snap.val();
    if (val) {
      DB_DATA.gym.schedule = toArr(val).map(row => ({
        ...row, s: Array.isArray(row.s) ? row.s : Object.values(row.s || {}),
      }));
      if (cur === 'gym') rerenderCurrent();
    }
  });
  _db.ref('gym/classes').on('value', snap => {
    const val = snap.val();
    if (val) { DB_DATA.gym.classes = val; if (cur === 'gym') rerenderCurrent(); }
  });
  _db.ref('law/areas').on('value', snap => {
    const val = snap.val();
    if (val) { DB_DATA.law = toArr(val); if (cur === 'law') rerenderCurrent(); }
  });
  _db.ref('pet/services').on('value', snap => {
    const val = snap.val();
    if (val) { DB_DATA.pet = withIds(toArr(val)); if (cur === 'pet') rerenderCurrent(); }
  });
  _db.ref('realty/items').on('value', snap => {
    const val = snap.val();
    if (val) { DB_DATA.realty = withIds(toArr(val)); if (cur === 'realty') rerenderCurrent(); }
  });
  _db.ref('restaurant/menu').on('value', snap => {
    const val = snap.val();
    if (val) {
      const menu = {};
      Object.keys(val).forEach(cat => { menu[cat] = Object.values(val[cat]); });
      DB_DATA.restaurant = menu;
      if (cur === 'restaurant') rerenderCurrent();
    }
  });
  _db.ref('beauty/items').on('value', snap => {
    const val = snap.val();
    if (val) { DB_DATA.beauty = withIds(toArr(val)); if (cur === 'beauty') rerenderCurrent(); }
  });
  _db.ref('tech/repos').on('value', snap => {
    const val = snap.val();
    if (val) { DB_DATA.tech.repos = toArr(val); if (cur === 'tech') rerenderCurrent(); }
  });
  _db.ref('tech/stack').on('value', snap => {
    const val = snap.val();
    if (val) { DB_DATA.tech.stack = toArr(val); if (cur === 'tech') rerenderCurrent(); }
  });
}

setupFirebaseListeners();

document.getElementById('app').innerHTML = RENDER.car();
fullInit('car');