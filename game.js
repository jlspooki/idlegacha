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


let currentBanner = "default";

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



const fusionRules = {
  Common: { count: 50, bonus: 1 },
  Rare: { count: 35, bonus: 2 },
  Epic: { count: 15, bonus: 5 },
  Legendary: { count: 5, bonus: 10 }
};

let gems = parseInt(localStorage.getItem("gems")) || 0;
let collection = JSON.parse(localStorage.getItem("collection")) || [];
let fusionPerks = JSON.parse(localStorage.getItem("fusionPerks")) || {
  Common: 0, Rare: 0, Epic: 0, Legendary: 0
};

function showTab(tabName) {
  const tabs = ["rollTab", "fuseTab", "bossTab", "collectionTab"];
  tabs.forEach(id => {
    document.getElementById(id).style.display = id === `${tabName}Tab` ? "block" : "none";
  });
}

window.showTab = showTab;


function saveState() {
  localStorage.setItem("gems", gems);
  localStorage.setItem("collection", JSON.stringify(collection));
  localStorage.setItem("fusionPerks", JSON.stringify(fusionPerks));
  localStorage.setItem("lastOnline", Date.now()); // ✅ Offline
}


function getTotalDamage() {
  return collection.reduce((sum, unit) => sum + (unit.damage || 0), 0);
}

function fightBoss(boss) {
  const totalDamage = getTotalDamage();
  const result = document.getElementById("battleResult");

  if (totalDamage >= boss.hp) {
    result.textContent = `✅ You defeated ${boss.name}! Total Damage: ${totalDamage}`;
  } else {
    result.textContent = `❌ You lost to ${boss.name}. Total Damage: ${totalDamage}, Boss HP: ${boss.hp}`;
  }
}


function earnGems() {
  const bonus = Object.values(fusionPerks).reduce((a, b) => a + b, 0);
  gems += 1 + bonus;
  saveState();
  updateUI();
}

function rollCharacter() {
  const pool = banners[currentBanner];
  const roll = Math.random();
  let cumulative = 0;
  for (const unit of pool) {
    cumulative += unit.rate;
    if (roll <= cumulative) return unit;
  }
  return pool[0];
}


function roll(times) {
  const cost = 10 * times;
  if (gems < cost) {
    alert("Not enough gems!");
    return;
  }

  gems -= cost;
  const resultDiv = document.getElementById("result");
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

function fuseUnits() {
  const selectedRarity = document.getElementById("raritySelect").value;
  const { count, bonus } = fusionRules[selectedRarity];
  const owned = collection.filter(u => u.rarity === selectedRarity);

  const result = document.getElementById("result");

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



function updateUI() {
  document.getElementById("gems").textContent = gems;
  const bonus = Object.values(fusionPerks).reduce((a, b) => a + b, 0);
  document.getElementById("perkBonus").textContent = `Fusion Perk Bonus: +${bonus} gems every 1 second`;

const collectionList = document.getElementById("collection");
collectionList.innerHTML = "";

// Count how many of each unit you own (by name + rarity)
const countMap = {};
collection.forEach(unit => {
  const key = `${unit.name}|${unit.rarity}`;
  if (!countMap[key]) {
    countMap[key] = { name: unit.name, rarity: unit.rarity, count: 0 };
  }
  countMap[key].count += 1;
});

// Display each unit with its count
Object.values(countMap).forEach(entry => {
  const li = document.createElement("li");
  li.textContent = `${entry.name} (${entry.rarity}) × ${entry.count}`;
  li.className = entry.rarity;
  collectionList.appendChild(li);
});

  // 💥 Add total damage summary
  const totalDamage = getTotalDamage();
const damageHeader = document.createElement("li");
damageHeader.textContent = `Total Damage: ${totalDamage}`;
damageHeader.style.fontWeight = "bold";
collectionList.appendChild(damageHeader);



  const encyclopediaDiv = document.getElementById("encyclopedia");
encyclopediaDiv.innerHTML = "";

// Track owned units by name + rarity
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

const bossList = document.getElementById("bossList");
bossList.innerHTML = "";

bosses.forEach(boss => {
  const btn = document.createElement("button");
  btn.textContent = `Fight ${boss.name} (HP: ${boss.hp})`;
  btn.addEventListener("click", () => fightBoss(boss));
  bossList.appendChild(btn);
});

  
}

document.getElementById("rollBtn").addEventListener("click", () => roll(1));
document.getElementById("roll10Btn").addEventListener("click", () => roll(10));
document.getElementById("fuseBtn").addEventListener("click", fuseUnits);

window.addEventListener("load", () => {
  // ⏱️ Offline progress
  const lastOnline = parseInt(localStorage.getItem("lastOnline")) || Date.now();
  const now = Date.now();
  const secondsAway = Math.floor((now - lastOnline) / 1000);

  if (secondsAway > 5) { // Optional: ignore very short gaps
    const bonus = Object.values(fusionPerks).reduce((a, b) => a + b, 0);
    const offlineGems = secondsAway * (1 + bonus);
    gems += offlineGems;

    document.getElementById("result").innerHTML = `<span>⏱️ You earned ${offlineGems} gems while away (${secondsAway}s)</span>`;

  }

  showTab("roll"); // ✅ show tab first
  updateUI();      // ✅ then populate content

  // 🔄 Listen for banner changes
  document.getElementById("bannerSelect").addEventListener("change", (e) => {
    currentBanner = e.target.value;
    updateUI();
  });

  // 💎 Start gem earning loop
  setInterval(earnGems, 1000);
  showTab("roll"); // 👈 Add this
});


















