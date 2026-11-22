/* =========================================
   CONTRADIÇÃO RPG
   Sistema de fichas + Supabase
   ========================================= */

const SUPABASE_URL = "https://cmklpgzvymrwcuuycoxy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4kSJLFKeaj22hk5pWrWXkA_B0tCIwoh";

const supabaseClient =
  window.supabase &&
  SUPABASE_URL &&
  !SUPABASE_URL.includes("https://cmklpgzvymrwcuuycoxy.supabase.co") &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.includes("sb_publishable_4kSJLFKeaj22hk5pWrWXkA_B0tCIwoh")
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const STORAGE_KEY = "contradicao_fichas_v1";
const CLASS_KEY = "contradicao_classes_v1";

const ATTRIBUTE_DICE = {
  1: "0",
  2: "d4",
  3: "d8",
  4: "d12",
  5: "d20"
};

const DEFAULT_CLASSES = [
  {
    group: "DEFENSORES",
    items: [
      { id: "preset_combatente_def", nome: "Combatente (Def)", descricao: "Defensor focado em combate direto." },
      { id: "preset_tanque_def", nome: "Tanque (Def)", descricao: "Defensor focado em resistência e absorção." },
      { id: "preset_algoz_def", nome: "Algoz (Def)", descricao: "Defensor implacável contra alvos marcados." },
      { id: "preset_guardiao_def", nome: "Guardião (Def)", descricao: "Defensor voltado à proteção de aliados." },
      { id: "preset_gladiador_def", nome: "Gladiador (Def)", descricao: "Defensor agressivo em duelos e arena." },
      { id: "preset_oni_def", nome: "Oni (Def)", descricao: "Defensor de fúria brutal e presença intimidadora." }
    ]
  },
  {
    group: "OCULTISTAS",
    items: [
      { id: "preset_feiticeiro_ocu", nome: "Feiticeiro (Ocu)", descricao: "Ocultista especialista em feitiços e rituais ofensivos." },
      { id: "preset_curandeiro_ocu", nome: "Curandeiro (Ocu)", descricao: "Ocultista focado em restauração e suporte vital." },
      { id: "preset_ampliador_ocu", nome: "Ampliador (Ocu)", descricao: "Ocultista que potencializa efeitos e rituais." },
      { id: "preset_metamorfo_ocu", nome: "Metamorfo (Ocu)", descricao: "Ocultista de forma mutável e adaptação." },
      { id: "preset_manipulador_ocu", nome: "Manipulador (Ocu)", descricao: "Ocultista voltado a controle e influência." },
      { id: "preset_vampiro_ocu", nome: "Vampiro (Ocu)", descricao: "Ocultista que drena essência e vitalidade." }
    ]
  },
  {
    group: "ESTRATÉGISTAS",
    items: [
      { id: "preset_mentalista_est", nome: "Mentalista (Est)", descricao: "Estrategista de leitura tática e mente afiada." },
      { id: "preset_tiro_preciso_est", nome: "Tiro Preciso (Est)", descricao: "Estrategista especializado em ataques à distância e mira." },
      { id: "preset_artifice_est", nome: "Artífice (Est)", descricao: "Estrategista criador de mecanismos e aparatos." },
      { id: "preset_quimico_est", nome: "Químico (Est)", descricao: "Estrategista de misturas, toxinas e reações." },
      { id: "preset_arruaceiro_est", nome: "Arruaceiro (Est)", descricao: "Estrategista ágil, furtivo e oportunista." },
      { id: "preset_fada_est", nome: "Fada (Est)", descricao: "Estrategista imprevisível de truques e mobilidade." }
    ]
  }
];

const WEAPONS_CATALOG = {
  adagas_x2: {
    name: "Adagas ×2",
    damage: "2d8 cada",
    rule: "Permitem realizar a ação extra sem a desvantagem; máximo de 2 ataques"
  },
  cajado: {
    name: "Cajado",
    damage: "2d8",
    rule: "—"
  },
  soqueira: {
    name: "Soqueira",
    damage: "2d10",
    rule: "Com Força 4–5; caso contrário, 2d8"
  },
  garras_de_ferro: {
    name: "Garras de ferro",
    damage: "2d10",
    rule: "—"
  },
  chicote: {
    name: "Chicote",
    damage: "2d8",
    rule: "—"
  },
  clava: {
    name: "Clava",
    damage: "2d10",
    rule: "—"
  },
  mangual: {
    name: "Mangual",
    damage: "2d8",
    rule: "—"
  },
  espada: {
    name: "Espada",
    damage: "2d10",
    rule: "—"
  },
  katana: {
    name: "Katana",
    damage: "2d10",
    rule: "—"
  },
  lanca: {
    name: "Lança",
    damage: "2d10",
    rule: "—"
  },
  machado_de_batalha: {
    name: "Machado de batalha",
    damage: "2d12",
    rule: "—"
  },
  marreta: {
    name: "Marreta",
    damage: "2d10",
    rule: "—"
  },
  alabarda: {
    name: "Alabarda",
    damage: "2d12",
    rule: "—"
  },
  espada_grande: {
    name: "Espada grande",
    damage: "2d12",
    rule: "Requer Força 4+"
  },
  pistola: {
    name: "Pistola",
    damage: "2d12",
    rule: "—"
  },
  sniper_curta: {
    name: "Sniper — curta",
    damage: "2d12",
    rule: "-10 por distância"
  },
  sniper_media: {
    name: "Sniper — média",
    damage: "2d12",
    rule: "-5 por distância"
  },
  sniper_longa: {
    name: "Sniper — longa",
    damage: "4d12+1d4 por distância",
    rule: "—"
  },
  foice: {
    name: "Foice",
    damage: "2d12",
    rule: "—"
  }
};

let characters = [];
let classes = [];
let currentCharacterId = null;
let isMaster = false;
let currentTab = "main";
let saveTimer = null;

const lobbyScreen = document.getElementById("lobbyScreen");
const sheetScreen = document.getElementById("sheetScreen");
const characterGrid = document.getElementById("characterGrid");
const emptyState = document.getElementById("emptyState");

document.addEventListener("DOMContentLoaded", async () => {
  renderWeaponOptions();
  bindEvents();
  await loadData();
});

function readLocalStorageSafe(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

async function loadData() {
  characters = readLocalStorageSafe(STORAGE_KEY);
  classes = readLocalStorageSafe(CLASS_KEY);
  renderLobby();
  renderClassOptions();

  if (!supabaseClient) {
    showSaveStatus("LOCAL (CONFIGURE SUPABASE)");
    return;
  }

  try {
    const [{ data: charsData, error: charsError }, { data: classesData, error: classesError }] =
      await Promise.all([
        supabaseClient
          .from("characters")
          .select("id, data")
          .order("updated_at", { ascending: true }),
        supabaseClient
          .from("classes")
          .select("id, nome, descricao")
          .order("created_at", { ascending: true })
      ]);

    if (!charsError && Array.isArray(charsData)) {
      characters = charsData.map(row => normalizeCharacter({
        ...(row.data || {}),
        id: row.id
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    }

    if (!classesError && Array.isArray(classesData)) {
      classes = classesData.map(row => ({
        id: row.id,
        nome: row.nome,
        descricao: row.descricao || ""
      }));
      localStorage.setItem(CLASS_KEY, JSON.stringify(classes));
    }

    renderLobby();
    renderClassOptions();

    if (currentCharacterId) {
      const updatedCurrent = getCurrentCharacter();
      if (updatedCurrent) {
        fillSheet(updatedCurrent);
      }
    }

    showSaveStatus("SINCRONIZADO");
  } catch (error) {
    showSaveStatus("SALVO LOCALMENTE");
  }
}

function normalizeCharacter(raw) {
  const safe = raw || {};
  const invArray = Array.isArray(safe.inventario) ? safe.inventario : [];
  const count = Math.min(
    50,
    Math.max(0, Number.isFinite(parseInt(safe.inventarioCount, 10)) ? parseInt(safe.inventarioCount, 10) : invArray.length || 3)
  );

  const normalizedInv = [];
  for (let i = 0; i < count; i++) {
    const existing = invArray[i] || {};
    normalizedInv.push({
      id: existing.id || `item_${i + 1}`,
      nome: typeof existing.nome === "string" ? existing.nome : "",
      qtd: Math.max(0, parseInt(existing.qtd, 10) || 1),
      descricao: typeof existing.descricao === "string" ? existing.descricao : ""
    });
  }

  return {
    ...safe,
    nome: safe.nome ?? "NOME",
    imagem: safe.imagem ?? "",
    classe: safe.classe ?? "",
    afinidade: safe.afinidade ?? "",
    palavraDe: safe.palavraDe ?? "",
    dt: safe.dt ?? 1,
    fr: safe.fr ?? 1,
    it: safe.it ?? 1,
    pr: safe.pr ?? 1,
    ag: safe.ag ?? 1,
    dfBonus: typeof safe.dfBonus === "number" ? safe.dfBonus : 0,
    pvAtual: safe.pvAtual ?? 10,
    pvMax: safe.pvMax ?? 10,
    paAtual: safe.paAtual ?? 10,
    paMax: safe.paMax ?? 10,
    armaNome: safe.armaNome ?? "",
    armaTipo: safe.armaTipo ?? "",
    armaImagem: safe.armaImagem ?? "",
    habilidades: Array.isArray(safe.habilidades) ? safe.habilidades : [],
    rituais: Array.isArray(safe.rituais) ? safe.rituais : [],
    inventarioCount: count,
    inventario: normalizedInv
  };
}

function saveData(characterToSync = null) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  renderLobby();

  const target = characterToSync || getCurrentCharacter();
  if (!supabaseClient || !target) {
    showSaveStatus("SALVO LOCALMENTE");
    return;
  }

  showSaveStatus("SALVANDO...");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const { error } = await supabaseClient
        .from("characters")
        .upsert({
          id: target.id,
          data: target,
          updated_at: new Date().toISOString()
        });

      showSaveStatus(error ? "SALVO LOCALMENTE" : "SINCRONIZADO");
    } catch (error) {
      showSaveStatus("SALVO LOCALMENTE");
    }
  }, 150);
}

async function syncClassToCloud(classe) {
  localStorage.setItem(CLASS_KEY, JSON.stringify(classes));
  renderClasses();
  renderClassOptions();

  if (!supabaseClient || !classe) return;

  try {
    await supabaseClient
      .from("classes")
      .upsert({
        id: classe.id,
        nome: classe.nome,
        descricao: classe.descricao || ""
      });
  } catch (error) {
    // Mantém localmente em caso de falha de rede
  }
}

async function removeClassFromCloud(id) {
  localStorage.setItem(CLASS_KEY, JSON.stringify(classes));
  renderClasses();
  renderClassOptions();

  if (!supabaseClient || !id) return;

  try {
    await supabaseClient
      .from("classes")
      .delete()
      .eq("id", id);
  } catch (error) {
    // Mantém localmente em caso de falha de rede
  }
}

function getAllPresetClassesFlat() {
  return DEFAULT_CLASSES.flatMap(group => group.items);
}

function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}

function bindEvents() {
  document.getElementById("createCharacterButton")
    .addEventListener("click", createCharacter);

  document.getElementById("backButton")
    .addEventListener("click", backToLobby);

  document.getElementById("masterButton")
    .addEventListener("click", openMasterAccess);

  document.getElementById("manageClassesButton")
    .addEventListener("click", () => {
      if (!isMaster) return;
      renderClasses();
      document.getElementById("classesDialog").showModal();
    });

  document.getElementById("classForm")
    .addEventListener("submit", createClass);

  document.getElementById("accessForm")
    .addEventListener("submit", handleMasterAccess);

  document.getElementById("fullscreenButton")
    .addEventListener("click", togglePresentation);

  document.getElementById("exitPresentationButton")
    .addEventListener("click", exitPresentation);

  document.getElementById("addAbilityButton")
    .addEventListener("click", addAbility);

  document.getElementById("addRitualButton")
    .addEventListener("click", addRitual);

  document.getElementById("portraitInput")
    .addEventListener("change", uploadPortrait);

  document.getElementById("weaponInput")
    .addEventListener("change", uploadWeaponImage);

  document.querySelectorAll(".sheet-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      switchTab(tab.dataset.tab);
    });
  });

  ["characterName", "characterClass", "characterAffinity", "characterDeWord", "weaponCustomName", "weaponType"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => updateSheetFromInputs(false));
    el.addEventListener("change", () => updateSheetFromInputs(true));
  });

  const numericFields = [
    "attributeDT",
    "attributeFR",
    "attributeIT",
    "attributePR",
    "attributeAG",
    "pvCurrent",
    "pvMax",
    "paCurrent",
    "paMax"
  ];

  numericFields.forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => updateSheetFromInputs(false));
    el.addEventListener("change", () => updateSheetFromInputs(true));
    el.addEventListener("blur", () => updateSheetFromInputs(true));
  });

  const invCountInput = document.getElementById("inventoryItemCount");
  if (invCountInput) {
    invCountInput.addEventListener("input", () => {
      const val = invCountInput.value;
      if (val === "") return;
      setInventoryCount(parseInt(val, 10) || 0, false);
    });
    invCountInput.addEventListener("change", () => {
      setInventoryCount(parseInt(invCountInput.value, 10) || 0, true);
    });
    invCountInput.addEventListener("blur", () => {
      setInventoryCount(parseInt(invCountInput.value, 10) || 0, true);
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      exitPresentation();
    }
  });
}

function renderWeaponOptions() {
  const select = document.getElementById("weaponType");
  if (!select) return;

  select.innerHTML = '<option value="">— SELECIONAR ARMA —</option>';

  Object.entries(WEAPONS_CATALOG).forEach(([key, weapon]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = weapon.name;
    select.appendChild(option);
  });
}

function getWeaponDisplayData(weaponKey, strengthValue) {
  const base = WEAPONS_CATALOG[weaponKey];
  if (!base) {
    return {
      damage: "—",
      rule: "—"
    };
  }

  if (weaponKey === "soqueira") {
    const fr = Math.min(5, Math.max(1, parseInt(strengthValue, 10) || 1));
    return {
      damage: fr >= 4 ? "2d10" : "2d8",
      rule: base.rule
    };
  }

  return {
    damage: base.damage,
    rule: base.rule
  };
}

function updateWeaponDisplay() {
  const weaponKey = document.getElementById("weaponType").value;
  const strength = parseInt(document.getElementById("attributeFR").value, 10) || 1;
  const info = getWeaponDisplayData(weaponKey, strength);

  document.getElementById("weaponDamage").textContent = info.damage;
  document.getElementById("weaponRule").textContent = info.rule;
}

function createCharacter() {
  const character = normalizeCharacter({
    id: generateId(),
    nome: "NOME",
    imagem: "",
    classe: "",
    afinidade: "",
    palavraDe: "",
    dt: 1,
    fr: 1,
    it: 1,
    pr: 1,
    ag: 1,
    dfBonus: 0,
    pvAtual: 10,
    pvMax: 10,
    paAtual: 10,
    paMax: 10,
    armaNome: "",
    armaTipo: "",
    armaImagem: "",
    habilidades: [],
    rituais: [],
    inventarioCount: 3,
    inventario: []
  });

  characters.push(character);
  saveData(character);
  openCharacter(character.id);
}

function renderLobby() {
  characterGrid.innerHTML = "";

  document.getElementById("characterCount").textContent = characters.length;
  emptyState.classList.toggle("hidden", characters.length > 0);

  characters.forEach(character => {
    const card = document.createElement("div");
    card.className = "character-card";

    card.innerHTML = `
      <h3>${escapeHTML(character.nome || "SEM NOME")}</h3>
      <p>${escapeHTML(getClassName(character.classe))}</p>

      <div class="card-resources">
        <span class="card-hp">
          PV ${character.pvAtual}/${character.pvMax}
        </span>
        <span class="card-pa">
          PA ${character.paAtual}/${character.paMax}
        </span>
      </div>
    `;

    const deleteButton = document.createElement("button");
    deleteButton.className = "card-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.title = "Excluir ficha";

    deleteButton.addEventListener("click", event => {
      event.stopPropagation();
      deleteCharacter(character.id);
    });

    card.appendChild(deleteButton);

    card.addEventListener("click", () => {
      openCharacter(character.id);
    });

    characterGrid.appendChild(card);
  });

  renderMasterSummary();
}

function renderMasterSummary() {
  const summary = document.getElementById("masterSummary");
  const list = document.getElementById("summaryList");

  summary.classList.toggle("hidden", !isMaster);
  if (!isMaster) return;

  list.innerHTML = "";

  characters.forEach(character => {
    const row = document.createElement("div");
    row.className = "summary-row";

    const portraitHTML = character.imagem
      ? `<img src="${escapeHTML(character.imagem)}" alt="Foto de ${escapeHTML(character.nome || "personagem")}">`
      : `<span class="summary-portrait-empty">∅</span>`;

    row.innerHTML = `
      <div class="summary-portrait-corner">${portraitHTML}</div>
      <span>${escapeHTML(character.nome)}</span>
      <span class="summary-class">${escapeHTML(getClassName(character.classe))}</span>
      <span class="summary-pv">PV ${character.pvAtual}/${character.pvMax}</span>
      <span class="summary-pa">PA ${character.paAtual}/${character.paMax}</span>
    `;

    row.addEventListener("click", () => {
      openCharacter(character.id);
    });

    list.appendChild(row);
  });
}

function openCharacter(id) {
  const character = characters.find(c => c.id === id);
  if (!character) return;

  const normalized = normalizeCharacter(character);
  const idx = characters.findIndex(c => c.id === id);
  if (idx !== -1) characters[idx] = normalized;

  currentCharacterId = id;

  lobbyScreen.classList.remove("active");
  sheetScreen.classList.remove("hidden");
  sheetScreen.classList.add("active");

  renderClassOptions();
  renderWeaponOptions();
  fillSheet(normalized);
  switchTab("main");
}

async function backToLobby() {
  exitPresentation();

  sheetScreen.classList.remove("active");
  sheetScreen.classList.add("hidden");
  lobbyScreen.classList.add("active");

  currentCharacterId = null;
  await loadData();
}

function getCurrentCharacter() {
  return characters.find(c => c.id === currentCharacterId);
}

function fillSheet(character) {
  const c = normalizeCharacter(character);

  document.getElementById("characterName").value = c.nome || "";
  document.getElementById("characterClass").value = c.classe || "";
  document.getElementById("characterAffinity").value = c.afinidade || "";
  document.getElementById("characterDeWord").value = c.palavraDe || "";

  document.getElementById("attributeDT").value = c.dt ?? 1;
  document.getElementById("attributeFR").value = c.fr ?? 1;
  document.getElementById("attributeIT").value = c.it ?? 1;
  document.getElementById("attributePR").value = c.pr ?? 1;
  document.getElementById("attributeAG").value = c.ag ?? 1;

  document.getElementById("pvCurrent").value = c.pvAtual;
  document.getElementById("pvMax").value = c.pvMax;

  document.getElementById("paCurrent").value = c.paAtual;
  document.getElementById("paMax").value = c.paMax;

  document.getElementById("weaponCustomName").value = c.armaNome || "";
  document.getElementById("weaponType").value = c.armaTipo || "";

  updateAttributeDice();
  updateDefense();
  updateWeaponDisplay();

  const portrait = document.getElementById("characterPortrait");
  const placeholder = document.getElementById("portraitPlaceholder");

  if (c.imagem) {
    portrait.src = c.imagem;
    portrait.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else {
    portrait.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }

  const weaponImg = document.getElementById("weaponImage");
  const weaponPlaceholder = document.getElementById("weaponPlaceholder");

  if (c.armaImagem) {
    weaponImg.src = c.armaImagem;
    weaponImg.classList.remove("hidden");
    weaponPlaceholder.classList.add("hidden");
  } else {
    weaponImg.classList.add("hidden");
    weaponPlaceholder.classList.remove("hidden");
  }

  renderEntries();
  renderInventory(c);
}

function updateSheetFromInputs(enforceBounds = false) {
  const character = getCurrentCharacter();
  if (!character) return;

  character.nome = document.getElementById("characterName").value;
  character.classe = document.getElementById("characterClass").value;
  character.afinidade = document.getElementById("characterAffinity").value;
  character.palavraDe = document.getElementById("characterDeWord").value;
  character.armaNome = document.getElementById("weaponCustomName").value;
  character.armaTipo = document.getElementById("weaponType").value;

  character.dt = readAttribute("attributeDT", enforceBounds);
  character.fr = readAttribute("attributeFR", enforceBounds);
  character.it = readAttribute("attributeIT", enforceBounds);
  character.pr = readAttribute("attributePR", enforceBounds);
  character.ag = readAttribute("attributeAG", enforceBounds);

  const rawPvMax = document.getElementById("pvMax").value;
  const rawPaMax = document.getElementById("paMax").value;
  const rawPvCur = document.getElementById("pvCurrent").value;
  const rawPaCur = document.getElementById("paCurrent").value;

  if (enforceBounds) {
    character.pvMax = Math.max(1, parseInt(rawPvMax, 10) || 1);
    character.paMax = Math.max(1, parseInt(rawPaMax, 10) || 1);

    const parsedPvCur = parseInt(rawPvCur, 10);
    character.pvAtual = Math.min(
      character.pvMax,
      Math.max(0, Number.isNaN(parsedPvCur) ? 0 : parsedPvCur)
    );

    const parsedPaCur = parseInt(rawPaCur, 10);
    character.paAtual = Math.min(
      character.paMax,
      Math.max(0, Number.isNaN(parsedPaCur) ? 0 : parsedPaCur)
    );

    document.getElementById("pvMax").value = character.pvMax;
    document.getElementById("paMax").value = character.paMax;
    document.getElementById("pvCurrent").value = character.pvAtual;
    document.getElementById("paCurrent").value = character.paAtual;
  } else {
    if (rawPvMax !== "") character.pvMax = Math.max(1, parseInt(rawPvMax, 10) || 1);
    if (rawPaMax !== "") character.paMax = Math.max(1, parseInt(rawPaMax, 10) || 1);
    if (rawPvCur !== "") character.pvAtual = Math.max(0, parseInt(rawPvCur, 10) || 0);
    if (rawPaCur !== "") character.paAtual = Math.max(0, parseInt(rawPaCur, 10) || 0);
  }

  updateAttributeDice();
  updateDefense();
  updateWeaponDisplay();
  saveData(character);
}

function readAttribute(id, enforceBounds) {
  const input = document.getElementById(id);
  const raw = input.value;

  if (!enforceBounds && raw === "") {
    return 1;
  }

  let value = parseInt(raw, 10);
  if (!Number.isFinite(value)) value = 1;
  value = Math.min(5, Math.max(1, value));

  if (enforceBounds) {
    input.value = value;
  }
  return value;
}

function updateAttributeDice() {
  const pairs = [
    ["attributeDT", "dadoDT"],
    ["attributeFR", "dadoFR"],
    ["attributeIT", "dadoIT"],
    ["attributePR", "dadoPR"],
    ["attributeAG", "dadoAG"]
  ];

  pairs.forEach(([inputId, boxId]) => {
    const val = Math.min(5, Math.max(1, parseInt(document.getElementById(inputId).value, 10) || 1));
    document.getElementById(boxId).textContent = ATTRIBUTE_DICE[val] ?? "0";
  });
}

function updateDefense() {
  const character = getCurrentCharacter();
  const bonus = character && typeof character.dfBonus === "number" ? character.dfBonus : 0;
  const dt = parseInt(document.getElementById("attributeDT").value, 10) || 1;
  const defense = Math.max(0, 14 + Math.min(5, Math.max(1, dt)) + bonus);
  document.getElementById("defenseValue").textContent = defense;
}

function changeDefense(amount) {
  const character = getCurrentCharacter();
  if (!character) return;

  if (typeof character.dfBonus !== "number") {
    character.dfBonus = 0;
  }

  character.dfBonus += amount;
  updateDefense();
  saveData(character);
}

function changeResource(type, amount) {
  const character = getCurrentCharacter();
  if (!character) return;

  if (type === "pv") {
    character.pvAtual = Math.min(
      character.pvMax,
      Math.max(0, character.pvAtual + amount)
    );
    document.getElementById("pvCurrent").value = character.pvAtual;
  }

  if (type === "pa") {
    character.paAtual = Math.min(
      character.paMax,
      Math.max(0, character.paAtual + amount)
    );
    document.getElementById("paCurrent").value = character.paAtual;
  }

  saveData(character);
}

/* INVENTÁRIO */
function changeInventoryCount(delta) {
  const character = getCurrentCharacter();
  if (!character) return;
  const current = character.inventarioCount ?? (character.inventario ? character.inventario.length : 3);
  setInventoryCount(current + delta, true);
}

function setInventoryCount(newCount, syncInputValue = true) {
  const character = getCurrentCharacter();
  if (!character) return;

  const clamped = Math.min(50, Math.max(0, parseInt(newCount, 10) || 0));
  if (!Array.isArray(character.inventario)) {
    character.inventario = [];
  }

  while (character.inventario.length < clamped) {
    const idx = character.inventario.length + 1;
    character.inventario.push({
      id: `item_${idx}_${Date.now().toString(36)}`,
      nome: "",
      qtd: 1,
      descricao: ""
    });
  }

  if (character.inventario.length > clamped) {
    character.inventario = character.inventario.slice(0, clamped);
  }

  character.inventarioCount = clamped;

  if (syncInputValue) {
    const countInput = document.getElementById("inventoryItemCount");
    if (countInput) countInput.value = clamped;
  }

  renderInventory(character);
  saveData(character);
}

function renderInventory(character) {
  const c = normalizeCharacter(character);
  const grid = document.getElementById("inventoryItemsGrid");
  const countInput = document.getElementById("inventoryItemCount");
  const label = document.getElementById("inventoryCountLabel");

  if (!grid) return;

  if (countInput && document.activeElement !== countInput) {
    countInput.value = c.inventarioCount;
  }

  if (label) {
    label.textContent = `${c.inventarioCount} ${c.inventarioCount === 1 ? "ITEM" : "ITENS"}`;
  }

  grid.innerHTML = "";

  if (c.inventarioCount === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "limit-message";
    emptyMsg.textContent = "Nenhum item selecionado. Aumente o número de itens acima.";
    grid.appendChild(emptyMsg);
    return;
  }

  c.inventario.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "inventory-slot-card";

    const top = document.createElement("div");
    top.className = "inventory-slot-top";

    const indexSpan = document.createElement("span");
    indexSpan.className = "inventory-slot-index";
    indexSpan.textContent = `ITEM ${index + 1}`;

    const qtdWrap = document.createElement("div");
    qtdWrap.className = "inventory-slot-qtd-wrap";

    const qtdLabel = document.createElement("span");
    qtdLabel.textContent = "QTD";

    const qtdInput = document.createElement("input");
    qtdInput.type = "number";
    qtdInput.min = "0";
    qtdInput.className = "inventory-slot-qtd";
    qtdInput.value = item.qtd ?? 1;
    qtdInput.addEventListener("input", () => {
      const targetChar = getCurrentCharacter();
      if (!targetChar || !targetChar.inventario[index]) return;
      targetChar.inventario[index].qtd = Math.max(0, parseInt(qtdInput.value, 10) || 0);
      saveData(targetChar);
    });

    qtdWrap.appendChild(qtdLabel);
    qtdWrap.appendChild(qtdInput);

    top.appendChild(indexSpan);
    top.appendChild(qtdWrap);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.maxlength = "60";
    nameInput.placeholder = "Nome do item...";
    nameInput.value = item.nome || "";
    nameInput.addEventListener("input", () => {
      const targetChar = getCurrentCharacter();
      if (!targetChar || !targetChar.inventario[index]) return;
      targetChar.inventario[index].nome = nameInput.value;
      saveData(targetChar);
    });

    const descInput = document.createElement("textarea");
    descInput.placeholder = "Detalhes ou peso/efeito...";
    descInput.value = item.descricao || "";
    descInput.addEventListener("input", () => {
      const targetChar = getCurrentCharacter();
      if (!targetChar || !targetChar.inventario[index]) return;
      targetChar.inventario[index].descricao = descInput.value;
      saveData(targetChar);
    });

    card.appendChild(top);
    card.appendChild(nameInput);
    card.appendChild(descInput);
    grid.appendChild(card);
  });
}

async function createClass(event) {
  event.preventDefault();

  const name = document.getElementById("newClassName").value.trim();
  const description = document.getElementById("newClassDescription").value.trim();

  if (!name) return;

  const presetNames = getAllPresetClassesFlat().map(c => c.nome.toLowerCase());
  if (
    presetNames.includes(name.toLowerCase()) ||
    classes.some(c => c.nome.toLowerCase() === name.toLowerCase())
  ) {
    alert("Essa classe já existe.");
    return;
  }

  const novaClasse = {
    id: generateId(),
    nome: name,
    descricao: description
  };

  classes.push(novaClasse);
  await syncClassToCloud(novaClasse);
  document.getElementById("classForm").reset();
}

function renderClasses() {
  const list = document.getElementById("classesList");
  list.innerHTML = "";

  classes.forEach(classe => {
    const row = document.createElement("div");
    row.className = "class-row";

    const info = document.createElement("div");
    info.className = "class-row-info";

    const name = document.createElement("strong");
    name.textContent = classe.nome;

    const description = document.createElement("small");
    description.textContent = classe.descricao || "Sem descrição";

    info.appendChild(name);
    info.appendChild(description);

    const remove = document.createElement("button");
    remove.className = "class-delete";
    remove.type = "button";
    remove.textContent = "×";

    remove.addEventListener("click", () => {
      deleteClass(classe.id);
    });

    row.appendChild(info);
    row.appendChild(remove);
    list.appendChild(row);
  });
}

async function deleteClass(id) {
  if (!confirm("Excluir esta classe?")) return;

  classes = classes.filter(c => c.id !== id);
  const affectedChars = [];
  characters.forEach(character => {
    if (character.classe === id) {
      character.classe = "";
      affectedChars.push(character);
    }
  });

  await removeClassFromCloud(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  renderLobby();

  if (supabaseClient) {
    for (const ch of affectedChars) {
      try {
        await supabaseClient
          .from("characters")
          .upsert({
            id: ch.id,
            data: ch,
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        // Ignora erro de rede
      }
    }
  }
}

function renderClassOptions() {
  const select = document.getElementById("characterClass");
  if (!select) return;
  const selected = select.value;

  select.innerHTML = '<option value="">CLASSE</option>';

  DEFAULT_CLASSES.forEach(groupData => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = groupData.group;

    groupData.items.forEach(preset => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.nome;
      optgroup.appendChild(option);
    });

    select.appendChild(optgroup);
  });

  if (classes.length > 0) {
    const customGroup = document.createElement("optgroup");
    customGroup.label = "PERSONALIZADAS";

    classes.forEach(classe => {
      const option = document.createElement("option");
      option.value = classe.id;
      option.textContent = classe.nome;
      customGroup.appendChild(option);
    });

    select.appendChild(customGroup);
  }

  select.value = selected;
}

function getClassName(id) {
  if (!id) return "SEM CLASSE";
  const preset = getAllPresetClassesFlat().find(c => c.id === id);
  if (preset) return preset.nome;

  const custom = classes.find(c => c.id === id);
  return custom ? custom.nome : "SEM CLASSE";
}

function addAbility() {
  const character = getCurrentCharacter();
  if (!character) return;

  if (character.habilidades.length >= 3) {
    alert("Você só pode ter 3 habilidades.");
    return;
  }

  character.habilidades.push({
    id: generateId(),
    nome: "",
    pa: 0,
    descricao: ""
  });

  saveData(character);
  renderEntries();
}

function addRitual() {
  const character = getCurrentCharacter();
  if (!character) return;

  character.rituais.push({
    id: generateId(),
    nome: "",
    pa: 0,
    descricao: ""
  });

  saveData(character);
  renderEntries();
}

function renderEntries() {
  const character = getCurrentCharacter();
  if (!character) return;

  renderAbilityEntries(character);
  renderRitualEntries(character);

  const count = character.habilidades.length;
  document.getElementById("abilityLimit").textContent = `${count} / 3 HABILIDADES`;
  document.getElementById("addAbilityButton").disabled = count >= 3;
}

function renderAbilityEntries(character) {
  const list = document.getElementById("abilitiesList");
  list.innerHTML = "";

  character.habilidades.forEach((entry, index) => {
    list.appendChild(createEntryCard(entry, index, "habilidades", "HABILIDADE"));
  });
}

function renderRitualEntries(character) {
  const list = document.getElementById("ritualsList");
  list.innerHTML = "";

  character.rituais.forEach((entry, index) => {
    list.appendChild(createEntryCard(entry, index, "rituais", "RITUAL"));
  });
}

function createEntryCard(entry, index, type, label) {
  const card = document.createElement("div");
  card.className = "entry-card";

  const top = document.createElement("div");
  top.className = "entry-top";

  const nameDiv = document.createElement("div");
  nameDiv.className = "entry-name";

  const nameLabel = document.createElement("label");
  nameLabel.textContent = "NOME";

  const nameInput = document.createElement("input");
  nameInput.value = entry.nome || "";
  nameInput.placeholder = `Nome da ${label.toLowerCase()}`;
  nameInput.addEventListener("input", () => {
    updateEntry(type, index, "nome", nameInput.value);
  });

  nameDiv.appendChild(nameLabel);
  nameDiv.appendChild(nameInput);

  const costDiv = document.createElement("div");
  costDiv.className = "entry-cost";

  const costLabel = document.createElement("label");
  costLabel.textContent = "CUSTO PA";

  const costInput = document.createElement("input");
  costInput.type = "number";
  costInput.min = "0";
  costInput.value = entry.pa ?? 0;
  costInput.addEventListener("input", () => {
    updateEntry(type, index, "pa", Math.max(0, parseInt(costInput.value, 10) || 0));
  });

  costDiv.appendChild(costLabel);
  costDiv.appendChild(costInput);

  top.appendChild(nameDiv);
  top.appendChild(costDiv);

  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "DESCRIÇÃO";

  const descriptionInput = document.createElement("textarea");
  descriptionInput.value = entry.descricao || "";
  descriptionInput.placeholder = "Descreva o efeito...";
  descriptionInput.addEventListener("input", () => {
    updateEntry(type, index, "descricao", descriptionInput.value);
  });

  const remove = document.createElement("button");
  remove.className = "remove-entry";
  remove.type = "button";
  remove.textContent = "×";
  remove.title = "Remover";
  remove.addEventListener("click", () => {
    removeEntry(type, index);
  });

  card.appendChild(top);
  card.appendChild(descriptionLabel);
  card.appendChild(descriptionInput);
  card.appendChild(remove);

  return card;
}

function updateEntry(type, index, field, value) {
  const character = getCurrentCharacter();
  if (!character) return;

  character[type][index][field] = value;
  saveData(character);
}

function removeEntry(type, index) {
  const character = getCurrentCharacter();
  if (!character) return;

  character[type].splice(index, 1);
  saveData(character);
  renderEntries();
}

function uploadPortrait(event) {
  const file = event.target.files[0];
  const character = getCurrentCharacter();

  if (!file || !character) return;

  if (!file.type.startsWith("image/")) {
    alert("Escolha um arquivo de imagem.");
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    alert("Escolha uma imagem de até 3 MB para manter o salvamento rápido.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    character.imagem = reader.result;
    saveData(character);
    fillSheet(character);
  };
  reader.readAsDataURL(file);
}

function uploadWeaponImage(event) {
  const file = event.target.files[0];
  const character = getCurrentCharacter();

  if (!file || !character) return;

  if (!file.type.startsWith("image/")) {
    alert("Escolha um arquivo de imagem.");
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    alert("Escolha uma imagem de até 3 MB para manter o salvamento rápido.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    character.armaImagem = reader.result;
    saveData(character);
    fillSheet(character);
  };
  reader.readAsDataURL(file);
}

function switchTab(tab) {
  currentTab = tab;

  document.querySelectorAll(".sheet-tab").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  const pages = {
    main: document.getElementById("mainSheetPage"),
    abilities: document.getElementById("abilitiesSheetPage"),
    inventory: document.getElementById("inventorySheetPage")
  };

  Object.entries(pages).forEach(([key, el]) => {
    if (!el) return;
    const isActive = key === tab;
    el.classList.toggle("active", isActive);
    el.classList.toggle("hidden", !isActive);
  });
}

function togglePresentation() {
  document.body.classList.toggle("presentation-mode");
}

function exitPresentation() {
  document.body.classList.remove("presentation-mode");
}

async function openMasterAccess() {
  if (isMaster) {
    isMaster = false;
    document.getElementById("masterButton").textContent = "MESTRE";
    renderLobby();
    return;
  }

  document.getElementById("accessError").textContent = "";
  document.getElementById("accessDialog").showModal();
}

async function handleMasterAccess(event) {
  event.preventDefault();

  const key = document.getElementById("accessKey").value;

  if (key === "MESTRE123") {
    isMaster = true;
    document.getElementById("masterButton").textContent = "SAIR DO MESTRE";
    closeDialog("accessDialog");
    document.getElementById("accessForm").reset();
    await loadData();
  } else {
    document.getElementById("accessError").textContent = "Chave incorreta.";
  }
}

async function deleteCharacter(id) {
  if (!confirm("Tem certeza que deseja excluir esta ficha?")) {
    return;
  }

  characters = characters.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));

  if (currentCharacterId === id) {
    currentCharacterId = null;
    sheetScreen.classList.remove("active");
    sheetScreen.classList.add("hidden");
    lobbyScreen.classList.add("active");
  }

  renderLobby();

  if (supabaseClient) {
    try {
      await supabaseClient
        .from("characters")
        .delete()
        .eq("id", id);
    } catch (error) {
      // Ignora erro de rede
    }
  }
}

function closeDialog(id) {
  document.getElementById(id).close();
}

function showSaveStatus(text = "SINCRONIZADO") {
  const status = document.getElementById("saveStatus");
  if (!status) return;
  status.textContent = text;
  status.style.color = text === "SINCRONIZADO" ? "#82a876" : "#d4b46a";
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}