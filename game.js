const banners = {
  default: [
    { name: "Slime", rarity: "Common", rate: 0.6 },
    { name: "Knight", rarity: "Rare", rate: 0.25 },
    { name: "Dragon", rarity: "Epic", rate: 0.1 },
    { name: "Celestial Fox", rarity: "Legendary", rate: 0.05 }
  ],
  spooky: [
    { name: "Pumpkin Fiend", rarity: "Common", rate: 0.5 },
    { name: "Ghost Knight", rarity: "Rare", rate: 0.3 },
    { name: "Witch Queen", rarity: "Epic", rate: 0.15 },
    { name: "Spectral Dragon", rarity: "Legendary", rate: 0.05 }
  ]
};

let currentBanner = "default";


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

function saveState() {
  localStorage.setItem("gems", gems);
  localStorage.setItem("collection", JSON.stringify(collection));
  localStorage.setItem("fusionPerks", JSON.stringify(fusionPerks));
}

function earnGems() {
  const bonus = Object.values(fusionPerks).reduce((a, b) => a + b, 0);
  gems += 1 + bonus;
  saveState();
  updateUI();
}

function rollCharacter() {
  const roll = Math.random();
  let cumulative = 0;
  for (const unit of characters) {
    cumulative += unit.rate;
    if (roll <= cumulative) return unit;
  }
  return characters[0];
}

function roll(times) {
  const cost = 10 * times;
  if (gems < cost) {
    alert("Not enough gems!");
    return;
  }

  gems -= cost;
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `<span class="spinner">🎰</span>`;

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
  for (const rarity in fusionRules) {
    const { count, bonus } = fusionRules[rarity];
    const owned = collection.filter(u => u.rarity === rarity);
    if (owned.length >= count) {
      let removed = 0;
      collection = collection.filter(u => {
        if (u.rarity === rarity && removed < count) {
          removed++;
          return false;
        }
        return true;
      });
      fusionPerks[rarity] += bonus;
    }
  }
  saveState();
  updateUI();
  document.getElementById("result").innerHTML = `<span>✨ Fusion complete!</span>`;
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


  const encyclopediaDiv = document.getElementById("encyclopedia");
encyclopediaDiv.innerHTML = "";

// Track owned units by name + rarity
const ownedKeys = collection.map(u => `${u.name}|${u.rarity}`);

characters.forEach(unit => {
  const key = `${unit.name}|${unit.rarity}`;
  const span = document.createElement("span");
  span.textContent = `${unit.name} (${unit.rarity})`;
  span.className = unit.rarity;
  if (ownedKeys.includes(key)) {
    span.classList.add("owned");
  }
  encyclopediaDiv.appendChild(span);
});

}

document.getElementById("rollBtn").addEventListener("click", () => roll(1));
document.getElementById("roll10Btn").addEventListener("click", () => roll(10));
document.getElementById("fuseBtn").addEventListener("click", fuseUnits);

window.addEventListener("load", () => {
  updateUI();
  setInterval(earnGems, 1000);
});




