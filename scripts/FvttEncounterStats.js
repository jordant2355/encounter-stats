import { CreateFolder } from "./Folder.js";
import { CreateJournal, UpdateJournal, GetArticle } from "./Journal.js";
import {
  GetItemFromLocalStorage,
  SaveToLocalStorage,
  TruncateLocalStorage,
} from "./LocalStorage.js";

export async function FvttEncounterStats() {
  CreateFolder();
  _setupHooks();
}

function _cleanseCombatants(combatants) {
  const combatant = combatants.data;
  if (combatant.type !== "character") return null;

  const newCombatants = {
    name: combatant.name,
    id: combatant._id,
    img: combatant.img,
    type: combatant.type,
    hp: combatant.data.attributes.hp.value,
    max: combatant.data.attributes.hp.max,
    ac: combatant.data.attributes.ac.value,
  };

  return newCombatants;
}

function _buildContentCombatant(combatant) {
  const markup = `
  <hr />
  <div class="fvtt-enc-stats_combatant" data-fvtt-id="${combatant.id}">
    <h2>${combatant.name}</h2>
    <div class="fvtt-enc-stats_combatants_overview">
      <div class="fvtt-enc-stats_combatants_actor">
        <table>
          <tbody>
            <tr>
              <th width="120px" scope="col"></th>
              <th scope="col">HP</th>
              <th scope="col">Max HP</th>
              <th scope="col">AC</th>
            </tr>
            <tr>
              <td><img src="${combatant.img}" width="100" height="100" alt="${combatant.name}" /></td>
              <td>${combatant.hp}</td>
              <td>${combatant.max}</td>
              <td>${combatant.ac}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="fvtt-enc-stats_combatants_attacks">
        <table>
          <tbody data-fvtt-attack-id="${combatant.id}">
            <tr>
              <td></td>
              <th scope="col">Weapon Name</th>
              <th scope="col">Advantage</th>
              <th scope="col">Disadvantage</th>
              <th scope="col">Attack Total</th>
              <th scope="col">Damage Total</th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="fvtt-enc-stats_combatants_summary">
      <table>
        <tbody class="fvtt-enc-stats_combatants_summary-table" data-fvtt-attack-summary-id="${combatant.id}">
          <tr>
            <th scope="col">Min</th>
            <th scope="col">Max</th>
            <th scope="col">Average</th>
            <th scope="col">Damage Total</th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;

  return markup;
}

function _buildContent() {
  const encounterId = GetItemFromLocalStorage()?.encounterId;
  if (!encounterId) return "";
  const markup = `
 <div class="combatants">
    <h1>
        Encounter ID: ${encounterId}
    </h1>
    <hr />
    <div class="fvtt-enc-stats_combatants">

    </div>
 </div>
`;

  return markup;
}

function add(accumulator, a) {
  return accumulator + a;
}

function _getStatsFromArray(arr) {
  return {
    min: Math.min(...arr),
    max: Math.max(...arr),
    avg: arr.reduce(add, 0) / arr.length,
    total: arr.reduce(add, 0),
  };
}

async function _buildSummaries() {
  let article = await GetArticle();
  let currentHtml = $(`<div>${article.data.content}</div>`);
  let combatantsList = currentHtml.find(".fvtt-enc-stats_combatant");

  for (let i = 0; i < combatantsList.length; i++) {
    let damageTotalList = $(combatantsList[i]).find(`[data-damage-total]`);
    let damageArray = [];
    let actorId = $(combatantsList[i]).attr("data-fvtt-id");

    for (let j = 0; j < damageTotalList.length; j++) {
      damageArray.push(
        parseInt($(damageTotalList[j]).attr("data-damage-total"))
      );
    }
    const summaryList = _getStatsFromArray(damageArray);

    let html = `
    <tr>
      <td>${summaryList.min}</td>
      <td>${summaryList.max}</td>
      <td>${summaryList.avg}</td>
      <td>${summaryList.total}</td>
    </tr>`;

    currentHtml.find(`[data-fvtt-attack-summary-id="${actorId}"]`).append(html);
  }

  await UpdateJournal(currentHtml.html(), article);
}

async function _updateJournalCombatant(html) {
  let article = await GetArticle();
  let currentHtml = $(article.data.content);
  currentHtml
    .find(".fvtt-enc-stats_combatants")
    .append($(`<div>${html}</div>`).html());

  await UpdateJournal(currentHtml.html(), article);
}

async function _updateJournalAttack(data) {
  let article = await GetArticle();
  const round = GetItemFromLocalStorage()?.round;
  if (!round) return;

  const event = {
    id: data._id,
    tokenId: data.tokenId,
    actorId: data.actor.data._id,
    advantage: data.advantage ? data.advantage : false,
    isCritical: data.isCritical,
    isFumble: data.isFumble,
    disadvantage: data.disadvantage ? data.advantage : false,
    attackTotal: data.attackTotal ? data.attackTotal : 0,
    damageTotal: data.damageTotal ? data.damageTotal : 0,
    item: {
      name: data.item.name,
    },
  };

  const html = `
  <tr data-event-id="${event.id}">
    <th scope="row">Round ${round}</th>
    <td>${event.item.name}</td>
    <td>${event.advantage}</td>
    <td>${event.disadvantage}</td>
    <td>${event.attackTotal}</td>
    <td data-damage-total="${event.damageTotal}">${event.damageTotal}</td>
  </tr>`;
  let currentHtml = $(`<div>${article.data.content}</div>`);
  let eventHtml = currentHtml.find(`[data-event-id="${event.id}"]`);
  if (eventHtml) {
    eventHtml.remove();
  }
  currentHtml.find(`[data-fvtt-attack-id="${event.actorId}"]`).append(html);

  await UpdateJournal(currentHtml.html(), article);
}

async function _updateJournalCombatants(data) {
  let article = await GetArticle();
  if (!article || !data.combat) return;
  let currentHtml = $(article.data.content);
  if (currentHtml.find(".fvtt-enc-stats_combatant").length > 0) return;

  let newCombatantHtml = "";
  const combatantsList = data.combat.data._source.combatants;
  for (let i = 0; i < combatantsList.length; i++) {
    const actorId = combatantsList[i].actorId;
    const combatants = _cleanseCombatants(game.actors.get(actorId));
    if (combatants) {
      newCombatantHtml += _buildContentCombatant(combatants);
    }
  }
  await _updateJournalCombatant(newCombatantHtml);
}

async function _updateRound(currentRound) {
  if (!currentRound) return;
  const pastRound = GetItemFromLocalStorage()?.round;
  if (pastRound !== currentRound) {
    const encounterId = GetItemFromLocalStorage()?.encounterId;
    if (!encounterId) return;
    SaveToLocalStorage(encounterId, currentRound);
  }
}

// Function
async function _setupHooks() {
  window.Hooks.on("renderCombatTracker", async function (arg1, arg2, arg3) {
    await _updateJournalCombatants(arg3);
  });
  window.Hooks.on("createCombat", async function (arg1, arg2, arg3) {
    SaveToLocalStorage(arg1.data._id);
    await CreateJournal(arg1, _buildContent());
  });
  window.Hooks.on("deleteCombat", async function (arg1, arg2, arg3) {
    await _buildSummaries();
    TruncateLocalStorage(arg1.data._id);
  });
  window.Hooks.on("midi-qol.RollComplete", async function (attackData) {
    if (attackData.actor.type !== "character") return;
    _updateJournalAttack(attackData);
  });

  window.Hooks.on("updateCombat", async function (arg1, arg2, arg3) {
    _updateRound(arg2.round);
  });
}
