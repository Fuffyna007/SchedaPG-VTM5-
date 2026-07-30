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

// CONFIGURAZIONE DISCORD OAUTH2 (Sostituisci con le tue info da Discord Developer Portal)
const DISCORD_CLIENT_ID = "IL_TUO_DISCORD_CLIENT_ID";
const WORKER_URL = "https://tuo-worker.workers.dev/check-roles"; // Endpoint del worker che controlla i ruoli

let utentePremium = false; // Diventa true se possiede i ruoli abbonati

// INIZIALIZZAZIONE
generaInterfaccia();
gestisciFame();
creaTracciatori10();
gestisciLoginDiscord();

// AGGIUNTA RIGHE INIZIALI DINAMICHE
aggiungiDisciplina("Auspex");
aggiungiVantaggio(); 

document.getElementById("btn-add-disciplina").addEventListener("click", () => aggiungiDisciplina("Nuova Disciplina"));
document.getElementById("btn-add-vantaggio").addEventListener("click", () => aggiungiVantaggio());
document.getElementById("btn-tira").addEventListener("click", eseguiTiroDadi);
document.getElementById("btn-reset").addEventListener("click", azzeraSelezioni);

// PULSANTI PREMIUM E AZIONI
document.getElementById("btn-salva-scheda").addEventListener("click", azioneSalvaScheda);
document.getElementById("btn-carica-scheda").addEventListener("click", caricaSchedaLocale);
document.getElementById("btn-esporta-pdf").addEventListener("click", azioneEsportaPDF);
document.getElementById("btn-chiudi-modal").addEventListener("click", () => {
  document.getElementById("modal-premium").style.display = "none";
});

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

function eseguiTiroDadi() {
  const riservaTotale = selezioni.reduce((acc, curr) => acc + curr.valore, 0);

  if (riservaTotale === 0) {
    alert("Seleziona almeno una voce con punteggio maggiore di 0!");
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

  const msg = `🎲 TIRO DADI [${etichettaTiro}]\n` +
              `ESITO: ${successiTotali} Successi${tipoEsito}\n` +
              `---------------------------------\n` +
              `⚫ Dadi Normali (${dadiNormali}): [ ${risNormali.join(" , ")} ]\n` +
              `🔴 Dadi Fame (${dadiFame}): [ ${risFame.join(" , ")} ]`;

  alert(msg);
}

// ==========================================
// LOGICA DISCORD OAUTH2 & CONTROLLO RUOLI
// ==========================================
function gestisciLoginDiscord() {
  const btnLogin = document.getElementById("btn-login-discord");
  
  btnLogin.addEventListener("click", () => {
    const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
    const scope = encodeURIComponent("identify guilds.members.read");
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = authUrl;
  });

  // Leggi token dall'URL dopo il redirect di Discord
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = fragment.get("access_token");

  if (accessToken) {
    window.location.hash = ""; // Pulisci URL
    vericaAbbonamentoDiscord(accessToken);
  }
}

async function vericaAbbonamentoDiscord(token) {
  try {
    // 1. Prendi dati utente da Discord
    const userResp = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = await userResp.json();

    document.getElementById("label-user").textContent = userData.username;

    // 2. Invia ID utente alla tua Worker gratuita per controllare se ha il ruolo abbonato sul Server
    const checkResp = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userData.id })
    });
    const checkResult = await checkResp.json();

    if (checkResult.isPremium) {
      utentePremium = true;
      const badge = document.getElementById("badge-status");
      badge.textContent = checkResult.roleName || "Sostenitore";
      badge.classList.add("sbloccato");
    }
  } catch (err) {
    console.error("Errore verifica Discord:", err);
  }
}

// ==========================================
// SALVATAGGIO COMPLETO DELLA SCHEDA (PREMIUM)
// ==========================================
function azioneSalvaScheda() {
  if (!utentePremium) {
    document.getElementById("modal-premium").style.display = "flex";
    return;
  }

  // 1. Salva tutti i testi (input e textarea)
  const datiInput = {};
  document.querySelectorAll("input, textarea").forEach(el => {
    if (el.id) datiInput[el.id] = el.value;
  });

  // 2. Salva lo stato dei pallini/punteggi (Attributi, Abilità, Fame, Discipline)
  const datiPunteggi = { ...punteggi, fame: valoreFame };

  // 3. Salva lo stato delle caselle di Salute, Volontà e Umanità
  const datiTracciatori = {};
  ["salute-caselle", "volonta-caselle", "umanita-caselle"].forEach(idCont => {
    const cont = document.getElementById(idCont);
    if (cont) {
      const stati = Array.from(cont.querySelectorAll(".casella-quadrata")).map(c => c.dataset.stato);
      datiTracciatori[idCont] = stati;
    }
  });

  // 4. Salva la struttura delle Discipline e dei Vantaggi creati dinamicamente
  const disciplineDinamiche = [];
  document.querySelectorAll("#lista-discipline .block-disciplina").forEach(block => {
    const nome = block.querySelector(".header-disciplina input")?.value || "";
    const poteri = [];
    block.querySelectorAll(".potere-row").forEach(row => {
      const inputs = row.querySelectorAll("input");
      poteri.push({ liv: inputs[0]?.value || "", desc: inputs[1]?.value || "" });
    });
    disciplineDinamiche.push({ nome, poteri });
  });

  const vantaggiDinamici = [];
  document.querySelectorAll("#lista-vantaggi .riga-vantaggio").forEach(riga => {
    const inputs = riga.querySelectorAll("input");
    vantaggiDinamici.push({ nome: inputs[0]?.value || "", desc: inputs[1]?.value || "" });
  });

  // Pacchetto completo di salvataggio
  const pacchettoScheda = {
    inputs: datiInput,
    punteggi: datiPunteggi,
    tracciatori: datiTracciatori,
    discipline: disciplineDinamiche,
    vantaggi: vantaggiDinamici
  };

  localStorage.setItem("vtm_scheda_salvata", JSON.stringify(pacchettoScheda));
  alert("💾 Scheda completissima salvata con successo nel browser!");
}

// ==========================================
// CARICAMENTO COMPLETO DELLA SCHEDA
// ==========================================
function caricaSchedaLocale() {
  const salvataggio = localStorage.getItem("vtm_scheda_salvata");
  if (!salvataggio) {
    alert("Nessuna scheda salvata trovata!");
    return;
  }

  const pacchetto = JSON.parse(salvataggio);

  // 1. Ripristina i testi delle caselle
  if (pacchetto.inputs) {
    for (const id in pacchetto.inputs) {
      const el = document.getElementById(id);
      if (el) el.value = pacchetto.inputs[id];
    }
  }

  // 2. Ripristina i punteggi ed aggiorna la grafica dei pallini
  if (pacchetto.punteggi) {
    Object.assign(punteggi, pacchetto.punteggi);
    if (pacchetto.punteggi.fame !== undefined) {
      valoreFame = pacchetto.punteggi.fame;
      gestisciFame();
    }
    // Ridisegna tutti i pallini delle sezioni statiche
    generaInterfaccia();
  }

  // 3. Ripristina lo stato delle 10 caselle (Salute, Volontà, Umanità)
  if (pacchetto.tracciatori) {
    for (const idCont in pacchetto.tracciatori) {
      const cont = document.getElementById(idCont);
      if (cont) {
        const caselle = cont.querySelectorAll(".casella-quadrata");
        pacchetto.tracciatori[idCont].forEach((st, idx) => {
          if (caselle[idx]) {
            caselle[idx].dataset.stato = st;
            caselle[idx].classList.remove("piena");
            if (st === "0") caselle[idx].textContent = "";
            else if (st === "1") caselle[idx].textContent = "/";
            else if (st === "2") caselle[idx].textContent = "X";
            else if (st === "3") {
              caselle[idx].textContent = "";
              caselle[idx].classList.add("piena");
            }
          }
        });
      }
    }
  }

  // 4. Ricrea le Discipline dinamiche con i loro poteri
  if (pacchetto.discipline && Array.isArray(pacchetto.discipline)) {
    document.getElementById("lista-discipline").innerHTML = "";
    pacchetto.discipline.forEach(d => {
      aggiungiDisciplina(d.nome);
      const ultimoBlocco = document.querySelector("#lista-discipline .block-disciplina:last-child");
      if (ultimoBlocco && d.poteri) {
        const contPoteri = ultimoBlocco.children[1]; // Contenitore poteri
        d.poteri.forEach(p => {
          const pRow = document.createElement("div");
          pRow.className = "potere-row";
          pRow.innerHTML = `
            <input type="text" class="potere-nome" value="${p.liv}">
            <input type="text" class="potere-desc" value="${p.desc}">
            <button class="btn-del">✕</button>
          `;
          pRow.querySelector(".btn-del").addEventListener("click", () => pRow.remove());
          contPoteri.appendChild(pRow);
        });
      }
    });
  }

  // 5. Ricrea i Vantaggi/Difetti dinamici
  if (pacchetto.vantaggi && Array.isArray(pacchetto.vantaggi)) {
    document.getElementById("lista-vantaggi").innerHTML = "";
    pacchetto.vantaggi.forEach(v => {
      aggiungiVantaggio();
      const ultimaRiga = document.querySelector("#lista-vantaggi .riga-vantaggio:last-child");
      if (ultimaRiga) {
        const inputs = ultimaRiga.querySelectorAll("input");
        if (inputs[0]) inputs[0].value = v.nome;
        if (inputs[1]) inputs[1].value = v.desc;
      }
    });
  }

  alert("📂 Scheda ripristinata con successo in ogni suo dettaglio!");
}