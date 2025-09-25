// =======================
// 🔧 GAME CONFIGURATION
// =======================

// 🎯 Banner definitions: units with rarity, roll rate, and damage
const banners = {
  default: [
    { name: "Slime", rarity: "Common", rate: 0.6, damage: 1 },
    { name: "Knight", rarity: "Rare", rate: 0.25, damage: 5 },
    { name: "Dragon", rarity: "Epic", rate: 0.1, damage: 15 },
    { name: "Celestial Fox", rarity: "Legendary", rate: 0.05, damage: 30 }
  ],
  spooky: [
    { name: "Pumpkin Fiend", rarity: "Common", rate: 0.5, damage: 2 },
    { name: "Ghost Knight", rarity: "Rare", rate: 0.3, damage: 6 },
    { name: "Witch Queen", rarity: "Epic", rate: 0.15, damage: 18 },
    { name: "Spectral Dragon", rarity: "Legendary", rate: 0.05, damage: 35 }
  ]
};

// 🧪 Fusion rules: how many units needed and bonus gems earned
const fusionRules = {
  Common: { count: 50, bonus: 1 },
  Rare: { count: 35, bonus: 2 },
  Epic: { count: 15, bonus: 5 },
  Legendary: { count: 5, bonus: 10 }
};

// 💥 Boss definitions: name and HP
const bosses = [
  { name: "Goblin King", hp: 50 },
  { name: "Shadow Beast", hp: 100 },
  { name: "Ancient Hydra", hp: 200 },
  { name: "Bone Tyrant", hp: 300 },
  { name: "Crystal Wyrm", hp: 400 },
  { name: "Pumpkin Overlord", hp: 500 },
  { name: "Spectral Reaper", hp: 650 },
  { name: "Frozen Colossus", hp: 800 },
  { name: "Storm Djinn", hp: 1000 },
  { name: "Celestial Leviathan", hp: 1500 }
];

// 🌟 Special Banner: permanent damage units (non-fusable)
const specialBanner = [
  { name: "Character1", rarity: "Rare", baseDamage: 20 },
  { name: "Character2", rarity: "Epic", baseDamage: 35 },
  { name: "Character3", rarity: "Legendary", baseDamage: 50 },
  { name: "Character4", rarity: "Mythic", baseDamage: 75 }
];


// =======================
// 💾 GAME STATE
// =======================

let currentBanner = "default";
let gems = parseInt(localStorage.getItem("gems")) || 0;
let collection = JSON.parse(localStorage.getItem("collection")) || [];
let fusionPerks = JSON.parse(localStorage.getItem("fusionPerks")) || {
  Common: 0, Rare: 0, Epic: 0, Legendary: 0

};
let bossShards = parseInt(localStorage.getItem("bossShards")) || 0;
let specialCollection = JSON.parse(localStorage.getItem("specialCollection")) || [];



// =======================
// 🧭 TAB NAVIGATION
// =======================

// Show selected tab and hide others
function showTab(tabName) {
  const tabs = ["rollTab", "fuseTab", "bossTab", "collectionTab"];
  tabs.forEach(id => {
    document.getElementById(id).style.display = id === `${tabName}Tab` ? "block" : "none";
  });
}
window.showTab = showTab;


// =======================
// 💾 SAVE GAME STATE
// =======================

function saveState() {
  localStorage.setItem("gems", gems);
  localStorage.setItem("collection", JSON.stringify(collection));
  localStorage.setItem("fusionPerks", JSON.stringify(fusionPerks));
  localStorage.setItem("lastOnline", Date.now());
  localStorage.setItem("bossShards", bossShards);
  localStorage.setItem("specialCollection", JSON.stringify(specialCollection)); // ✅ Add this line
}


// =======================
// ⚔️ BOSS BATTLE LOGIC
// =======================

// Calculate total damage from all collected units
function getTotalDamage() {
  const baseDamage = collection.reduce((sum, unit) => sum + (unit.damage || 0), 0);
  const specialDamage = specialCollection.reduce((sum, unit) => sum + (unit.baseDamage * (unit.level || 1)), 0);
  return baseDamage + specialDamage;
}


// Fight a boss and show result
function fightBoss(boss) {
  const totalDamage = getTotalDamage();
  const result = document.getElementById("battleResult");

  if (totalDamage >= boss.hp) {
  result.textContent = `✅ You defeated ${boss.name}! Total Damage: ${totalDamage}`;
  const shardsEarned = Math.floor(boss.hp / 10); // Example formula
  bossShards += shardsEarned;
  result.textContent += ` You earned ${shardsEarned} Boss Shards.`;
  saveState();
  updateUI();
  } else {
    result.textContent = `❌ You lost to ${boss.name}. Total Damage: ${totalDamage}, Boss HP: ${boss.hp}`;
  }
}


// =======================
// 💎 GEM GENERATION
// =======================

// Earn gems every second based on fusion perks
function earnGems() {
  const bonus = Object.values(fusionPerks).reduce((a, b) => a + b, 0);
  gems += 1 + bonus;
  saveState();
  updateUI();
}


// =======================
// 🎲 GACHA ROLLING
// =======================

// Roll a single character from the current banner
function rollCharacter() {
  const pool = banners[currentBanner];
  const roll = Math.random();
  let cumulative = 0;
  for (const unit of pool) {
    cumulative += unit.rate;
    if (roll <= cumulative) return unit;
  }
  return pool[0]; // fallback
}

// Roll multiple characters and update collection
function roll(times) {
  const cost = 10 * times;
  if (gems < cost) {
    alert("Not enough gems!");
    return;
  }

  gems -= cost;
  const resultDiv = document.getElementById("rollResult");
  resultDiv.innerHTML = `<span class="spinner">👾</span>`;

  setTimeout(() => {
    resultDiv.innerHTML = "";
    for (let i = 0; i < times; i++) {
      const unit = rollCharacter();
      collection.push(unit);

      const span = document.createElement("span");
      span.textContent = `${unit.name} (${unit.rarity})`;
      span.className = unit.rarity;
      resultDiv.appendChild(span);
    }
    saveState();
    updateUI();
  }, 500);

}

function rollSpecial(times) {
  const costPerRoll = 10;
  const totalCost = costPerRoll * times;

  if (bossShards < totalCost) {
    alert("Not enough Boss Shards!");
    return;
  }

  bossShards -= totalCost;

  const resultDiv = document.getElementById("specialResult");
  resultDiv.innerHTML = ""; // ✅ Clear previous results

  for (let i = 0; i < times; i++) {
    const roll = Math.random();
    let cumulative = 0;
    for (const unit of specialBanner) {
      cumulative += 1 / specialBanner.length;
      if (roll <= cumulative) {
        const existing = specialCollection.find(u => u.name === unit.name);
        if (existing) {
          existing.level += 1;
          resultDiv.innerHTML += `<span>🔁 ${unit.name} leveled up to Lv.${existing.level}</span><br>`;
        } else {
          specialCollection.push({ ...unit, level: 1 });
          resultDiv.innerHTML += `<span>✨ New unit: ${unit.name} (${unit.rarity})</span><br>`;
        }
        break;
      }
    }
  }

  saveState();
  updateUI();
}
  
function upgradeSpecialUnit(unitName) {
  const unit = specialCollection.find(u => u.name === unitName);
  if (!unit) {
    alert("Unit not found!");
    return;
  }

  const cost = unit.level * 100; // Example: Lv.2 → 200 gems
  if (gems < cost) {
    alert(`Not enough gems! Need ${cost} gems to upgrade.`);
    return;
  }

  gems -= cost;
  unit.level += 1;

  saveState();
  updateUI();
}

  function convertGemsToShards() {
  const conversionRate = 100;
  if (gems < conversionRate) {
    alert("Not enough gems to convert!");
    return;
  }

  gems -= conversionRate;
  bossShards += 1;
    
document.getElementById("conversionResult").innerHTML = `<span>✅ Converted 100 gems into 1 Boss Shard!</span>`;

  saveState();
  updateUI();
}



// =======================
// 🧪 FUSION SYSTEM
// =======================

// Fuse units of selected rarity to gain perks
function fuseUnits() {
  const selectedRarity = document.getElementById("raritySelect").value;
  const { count, bonus } = fusionRules[selectedRarity];
  const owned = collection.filter(u => u.rarity === selectedRarity);
  const result = document.getElementById("fuseResult");

  if (owned.length >= count) {
    let removed = 0;
    collection = collection.filter(u => {
      if (u.rarity === selectedRarity && removed < count) {
        removed++;
        return false;
      }
      return true;
    });

    fusionPerks[selectedRarity] += bonus;
    saveState();
    updateUI();
    result.innerHTML = `<span>✨ Fused ${count} ${selectedRarity} units for +${bonus} gem bonus!</span>`;
  } else {
    result.innerHTML = `<span>⚠️ Not enough ${selectedRarity} units to fuse!</span>`;
  }
}


// =======================
// 🔄 UI UPDATES
// =======================

function updateUI() {
  // Update gem count and perk bonus
  document.getElementById("gems").textContent = gems;
  
  // Update bossShard count and perk bonus
  document.getElementById("bossShards").textContent = bossShards;

  const bonus = Object.values(fusionPerks).reduce((a, b) => a + b, 0);
  document.getElementById("perkBonus").textContent = `Fusion Perk Bonus: +${bonus} gems every 1 second`;

  // Update collection summary
  const collectionList = document.getElementById("collection");
  collectionList.innerHTML = "";

  const countMap = {};
  collection.forEach(unit => {
    const key = `${unit.name}|${unit.rarity}`;
    if (!countMap[key]) {
      countMap[key] = { name: unit.name, rarity: unit.rarity, count: 0 };
    }
    countMap[key].count += 1;
  });

  Object.values(countMap).forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name} (${entry.rarity}) × ${entry.count}`;
    li.className = entry.rarity;
    collectionList.appendChild(li);
  });

  // Show total damage
  const totalDamage = getTotalDamage();
  const damageHeader = document.createElement("li");
  damageHeader.textContent = `Total Damage: ${totalDamage}`;
  damageHeader.style.fontWeight = "bold";
  collectionList.appendChild(damageHeader);

  // Update encyclopedia
  const encyclopediaDiv = document.getElementById("encyclopedia");
  encyclopediaDiv.innerHTML = "";
  const ownedKeys = collection.map(u => `${u.name}|${u.rarity}`);

  banners[currentBanner].forEach(unit => {
    const key = `${unit.name}|${unit.rarity}`;
    const span = document.createElement("span");
    span.textContent = `${unit.name} (${unit.rarity})`;
    span.className = unit.rarity;
    if (ownedKeys.includes(key)) {
      span.classList.add("owned");
    }
    encyclopediaDiv.appendChild(span);
  });

  // Update boss list
  const bossList = document.getElementById("bossList");
  bossList.innerHTML = "";

  bosses.forEach(boss => {
    const btn = document.createElement("button");
    btn.textContent = `Fight ${boss.name} (HP: ${boss.hp})`;
    btn.addEventListener("click", () => fightBoss(boss));
    bossList.appendChild(btn);
  });
  
// Update special units
  const specialDiv = document.getElementById("specialCollection");
specialDiv.innerHTML = "";

specialCollection.forEach(unit => {
  const span = document.createElement("span");
  span.innerHTML = `${unit.name} (${unit.rarity}) Lv.${unit.level || 1} 
  <button onclick="upgradeSpecialUnit('${unit.name}')">Upgrade (${unit.level * 100} gems)</button>`;
  span.className = unit.rarity;
  specialDiv.appendChild(span);
});

}


// =======================
// 🧠 EVENT LISTENERS
// =======================

// 🎲 Roll buttons
document.getElementById("rollBtn").addEventListener("click", () => roll(1));
document.getElementById("roll10Btn").addEventListener("click", () => roll(10));

// 🧪 Fusion button
document.getElementById("fuseBtn").addEventListener("click", fuseUnits);

// 🏁 Game startup logic
window.addEventListener("load", () => {
  // ⏱️ Offline progress calculation
  const lastOnline = parseInt(localStorage.getItem("lastOnline")) || Date.now();
  const now = Date.now();
  const maxOfflineSeconds = 6 * 60 * 60; // 6 hours
  const secondsAway = Math.min(Math.floor((now - lastOnline) / 1000), maxOfflineSeconds);

 if (secondsAway > 5) {
  const bonus = Object.values(fusionPerks).reduce((a, b) => a + b, 0);
  const offlineGems = secondsAway * (1 + bonus);
  gems += offlineGems;

  document.getElementById("rollResult").innerHTML = `<span>⏱️ You earned ${offlineGems} gems while away (${secondsAway}s)</span>`;

  if (secondsAway === maxOfflineSeconds) {
    document.getElementById("rollResult").innerHTML += `<span>⚠️ Offline progress capped at 6 hours.</span>`;
  }
}

  // 🧭 Show default tab and update UI
  showTab("roll");
  updateUI();

  // 🎯 Banner selection dropdown
  document.getElementById("bannerSelect").addEventListener("change", (e) => {
    currentBanner = e.target.value;
    updateUI();
  });

  // 🔁 Start passive gem generation loop
  setInterval(earnGems, 1000);
});

window.convertGemsToShards = convertGemsToShards;
window.rollSpecial = rollSpecial;














