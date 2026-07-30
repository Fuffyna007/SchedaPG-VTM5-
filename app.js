// DATI STRUTTURATI V5
const ATTRIBUTI = {
  fisici: ["Forza", "Destrezza", "Costituzione"],
  sociali: ["Carisma", "Persuasione", "Autocontrollo"],
  mentali: ["Intelligenza", "Prontezza", "Fermezza"]
};

const ABILITA = {
  fisiche: ["Armi da Fuoco", "Atletica", "Criminalità", "Furtività", "Guidare", "Manualità", "Mischia", "Rissa", "Sopravvivenza"],
  sociali: ["Affinità Animale", "Autorità", "Bassifondi", "Convincing", "Espressività", "Galateo", "Intimidire", "Intuito", "Sotterfugio"],
  mentali: ["Accademiche", "Allerta", "Finanza", "Investigare", "Medicina", "Occulto", "Politica", "Scienze", "Tecnologia"]
};

let valoreFame = 1;
const punteggi = {};
let selezioni = [];
let contatoreDiscipline = 0;
let contatoreVantaggi = 0;

// INIZIALIZZAZIONE
generaInterfaccia();
gestisciFame();
creaTracciatori10();

// AGGIUNTA RIGHE INIZIALI DINAMICHE
aggiungiDisciplina("Auspex");
aggiungiVantaggio(); // Parte con 1 sola riga vuota

document.getElementById("btn-add-disciplina").addEventListener("click", () => aggiungiDisciplina("Nuova Disciplina"));
document.getElementById("btn-add-vantaggio").addEventListener("click", () => aggiungiVantaggio());
document.getElementById("btn-tira").addEventListener("click", eseguiTiroDadi);
document.getElementById("btn-reset").addEventListener("click", azzeraSelezioni);

if (window.OBR) {
  OBR.onReady(() => console.log("Connesso a Owlbear Rodeo!"));
}

function generaInterfaccia() {
  for (const tipo in ATTRIBUTI) {
    const cont = document.getElementById(`attr-${tipo}`);
    ATTRIBUTI[tipo].forEach(nome => {
      punteggi[nome] = 1;
      cont.appendChild(creaRigaVoce(nome, 1));
    });
  }

  for (const tipo in ABILITA) {
    const cont = document.getElementById(`abi-${tipo}`);
    ABILITA[tipo].forEach(nome => {
      punteggi[nome] = 0;
      cont.appendChild(creaRigaVoce(nome, 0));
    });
  }
}

function creaRigaVoce(nome, valoreIniziale) {
  const riga = document.createElement("div");
  riga.className = "riga-voce";

  const etichetta = document.createElement("span");
  etichetta.textContent = nome;

  const spanPallini = document.createElement("span");
  spanPallini.className = "pallini";

  etichetta.addEventListener("click", () => {
    gestisciSelezioneVoci(riga, nome, nome);
  });

  aggiornaPalliniGenerici(spanPallini, nome, valoreIniziale, 5, (nuovoVal) => {
    punteggi[nome] = nuovoVal;
    aggiornaValoreInSelezioni(nome, nuovoVal);
  });

  riga.appendChild(etichetta);
  riga.appendChild(spanPallini);
  return riga;
}

// GESTIONE DISCIPLINE DINAMICHE (+ NUOVA DISCIPLINA)
function aggiungiDisciplina(nomeIniziale) {
  contatoreDiscipline++;
  const idDisc = `disc_dinamica_${contatoreDiscipline}`;
  punteggi[idDisc] = 0;

  const contDisc = document.getElementById("lista-discipline");
  const block = document.createElement("div");
  block.className = "block-disciplina";

  const header = document.createElement("div");
  header.className = "header-disciplina";

  const inputNome = document.createElement("input");
  inputNome.type = "text";
  inputNome.value = nomeIniziale;

  const rightBox = document.createElement("div");
  rightBox.style.display = "flex";
  rightBox.style.gap = "8px";
  rightBox.style.alignItems = "center";

  const spanPallini = document.createElement("span");
  spanPallini.className = "pallini";

  const btnDel = document.createElement("button");
  btnDel.className = "btn-del";
  btnDel.textContent = "✕";
  btnDel.addEventListener("click", () => {
    delete punteggi[idDisc];
    block.remove();
  });

  inputNome.addEventListener("click", () => {
    gestisciSelezioneVoci(block, inputNome.value || "Disciplina", idDisc);
  });

  aggiornaPalliniGenerici(spanPallini, idDisc, 0, 5, (nuovoVal) => {
    punteggi[idDisc] = nuovoVal;
    aggiornaValoreInSelezioni(idDisc, nuovoVal);
  });

  header.appendChild(inputNome);
  rightBox.appendChild(spanPallini);
  rightBox.appendChild(btnDel);
  header.appendChild(rightBox);
  block.appendChild(header);

  const contPoteri = document.createElement("div");
  block.appendChild(contPoteri);

  const btnAddPotere = document.createElement("button");
  btnAddPotere.className = "btn-add";
  btnAddPotere.style.fontSize = "0.7rem";
  btnAddPotere.style.marginTop = "4px";
  btnAddPotere.textContent = "+ Potere / Effetto";
  btnAddPotere.addEventListener("click", () => {
    const pRow = document.createElement("div");
    pRow.className = "potere-row";
    pRow.innerHTML = `
      <input type="text" class="potere-nome" placeholder="Liv. / Potere">
      <input type="text" class="potere-desc" placeholder="Descrizione effetto...">
      <button class="btn-del">✕</button>
    `;
    pRow.querySelector(".btn-del").addEventListener("click", () => pRow.remove());
    contPoteri.appendChild(pRow);
  });

  block.appendChild(btnAddPotere);
  contDisc.appendChild(block);
}

// GESTIONE VANTAGGI E DIFETTI DINAMICI (+ NUOVO VANTAGGIO)
function aggiungiVantaggio() {
  contatoreVantaggi++;
  const cont = document.getElementById("lista-vantaggi");
  const riga = document.createElement("div");
  riga.className = "riga-vantaggio";

  const inputNome = document.createElement("input");
  inputNome.type = "text";
  inputNome.placeholder = "Nome Vantaggio / Difetto";
  inputNome.style.width = "30%";

  const inputDesc = document.createElement("input");
  inputDesc.type = "text";
  inputDesc.placeholder = "Descrizione / Effetti...";
  inputDesc.style.width = "45%";

  const spanPallini = document.createElement("span");
  spanPallini.className = "pallini";
  spanPallini.style.width = "18%";

  const btnDel = document.createElement("button");
  btnDel.className = "btn-del";
  btnDel.textContent = "✕";
  btnDel.addEventListener("click", () => riga.remove());

  aggiornaPalliniGenerici(spanPallini, `vantaggio_${contatoreVantaggi}`, 0, 5, () => {});

  riga.appendChild(inputNome);
  riga.appendChild(inputDesc);
  riga.appendChild(spanPallini);
  riga.appendChild(btnDel);
  cont.appendChild(riga);
}

// TRACCIATORI A 10 CASELLE (4 STATI: Vuoto -> / -> X -> █ -> Vuoto)
function creaTracciatori10() {
  const ids = ["salute-caselle", "volonta-caselle", "umanita-caselle"];
  ids.forEach(id => {
    const cont = document.getElementById(id);
    cont.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const box = document.createElement("div");
      box.className = "casella-quadrata";
      box.dataset.stato = "0";

      box.addEventListener("click", () => {
        let st = parseInt(box.dataset.stato);
        st = (st + 1) % 4;
        box.dataset.stato = st.toString();

        box.classList.remove("piena");
        if (st === 0) box.textContent = "";
        else if (st === 1) box.textContent = "/";
        else if (st === 2) box.textContent = "X";
        else if (st === 3) {
          box.textContent = "";
          box.classList.add("piena");
        }
      });
      cont.appendChild(box);
    }
  });
}

// LOGICA SELEZIONE DADI
function gestisciSelezioneVoci(elementoHTML, nome, id) {
  const giaPresente = selezioni.findIndex(item => item.id === id);

  if (giaPresente !== -1) {
    selezioni[giaPresente].elementoHTML.classList.remove("selezionato");
    selezioni.splice(giaPresente, 1);
  } else {
    if (selezioni.length >= 2) {
      const rimosso = selezioni.shift();
      rimosso.elementoHTML.classList.remove("selezionato");
    }
    elementoHTML.classList.add("selezionato");
    selezioni.push({ id: id, nome: nome, valore: punteggi[id] || 0, elementoHTML: elementoHTML });
  }
  aggiornaTestoSelezione();
}

function aggiornaValoreInSelezioni(id, nuovoVal) {
  const item = selezioni.find(s => s.id === id);
  if (item) item.valore = nuovoVal;
  aggiornaTestoSelezione();
}

function azzeraSelezioni() {
  selezioni.forEach(item => item.elementoHTML.classList.remove("selezionato"));
  selezioni = [];
  aggiornaTestoSelezione();
}

function aggiornaTestoSelezione() {
  const info = document.getElementById("info-selezione");
  if (selezioni.length === 0) {
    info.textContent = "Seleziona fino a 2 voci qualsiasi per il tiro";
  } else if (selezioni.length === 1) {
    info.textContent = `${selezioni[0].nome} (${selezioni[0].valore}) = ${selezioni[0].valore} Dadi`;
  } else {
    const tot = selezioni[0].valore + selezioni[1].valore;
    info.textContent = `${selezioni[0].nome} (${selezioni[0].valore}) + ${selezioni[1].nome} (${selezioni[1].valore}) = ${tot} Dadi`;
  }
}

function aggiornaPalliniGenerici(contenitore, chiave, valoreCorrente, max, onChange) {
  contenitore.innerHTML = "";
  for (let i = 1; i <= max; i++) {
    const p = document.createElement("span");
    p.className = "pallino";
    p.textContent = i <= valoreCorrente ? "🔴" : "⚪";
    
    p.addEventListener("click", (e) => {
      e.stopPropagation();
      const nuovoVal = (i === 1 && valoreCorrente === 1) ? 0 : i;
      aggiornaPalliniGenerici(contenitore, chiave, nuovoVal, max, onChange);
      onChange(nuovoVal);
    });
    contenitore.appendChild(p);
  }
}

function gestisciFame() {
  aggiornaPalliniGenerici(document.getElementById("fame-pallini"), "fame", 1, 5, (v) => valoreFame = v);
}

// TIRO DADI CON REGOLE UFFICIALI V5
async function eseguiTiroDadi() {
  const riservaTotale = selezioni.reduce((acc, curr) => acc + curr.valore, 0);

  if (riservaTotale === 0) {
    const err = "Seleziona almeno una voce con punteggio maggiore di 0!";
    if (window.OBR) OBR.notification.show(err);
    else alert(err);
    return;
  }

  const dadiFame = Math.min(valoreFame, riservaTotale);
  const dadiNormali = riservaTotale - dadiFame;

  let successiBase = 0;
  let dieciNormali = 0;
  let dieciFame = 0;
  let unoFame = 0;

  const risNormali = [];
  const risFame = [];

  for (let i = 0; i < dadiNormali; i++) {
    const val = Math.floor(Math.random() * 10) + 1;
    risNormali.push(val);
    if (val >= 6) successiBase++;
    if (val === 10) dieciNormali++;
  }

  for (let i = 0; i < dadiFame; i++) {
    const val = Math.floor(Math.random() * 10) + 1;
    risFame.push(val);
    if (val >= 6) successiBase++;
    if (val === 10) dieciFame++;
    if (val === 1) unoFame++;
  }

  const dieciTotali = dieciNormali + dieciFame;
  const coppieCritiche = Math.floor(dieciTotali / 2);
  const successiTotali = successiBase + (coppieCritiche * 2);

  let tipoEsito = "";
  if (coppieCritiche > 0) {
    tipoEsito = dieciFame > 0 ? " 🔴 CRITICO MESSIANICO!" : " ⚡ CRITICO!";
  } else if (successiTotali === 0 && unoFame > 0) {
    tipoEsito = " 💀 FALLIMENTO BESTIALE!";
  }

  const etichettaTiro = selezioni.map(s => s.nome).join(" + ");
  const nomePlayer = (window.OBR && OBR.player) ? await OBR.player.getName() : "Giocatore";

  const msg = `🎲 ${nomePlayer} [${etichettaTiro}]\n` +
              `ESITO: ${successiTotali} Successi${tipoEsito}\n` +
              `---------------------------------\n` +
              `⚫ Dadi Normali (${dadiNormali}): [ ${risNormali.join(" , ")} ]\n` +
              `🔴 Dadi Fame (${dadiFame}): [ ${risFame.join(" , ")} ]`;

  if (window.OBR) OBR.notification.show(msg);
  else alert(msg);
}