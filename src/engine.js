export class GameEngine {
  constructor() {
    this.gems = parseInt(localStorage.getItem("gems")) || 0;
    this.collection = JSON.parse(localStorage.getItem("collection")) || [];
    this.fusionPerks = JSON.parse(localStorage.getItem("fusionPerks")) || {
      Common: 0, Rare: 0, Epic: 0, Legendary: 0
    };
  }

  saveState() {
    localStorage.setItem("gems", this.gems);
    localStorage.setItem("collection", JSON.stringify(this.collection));
    localStorage.setItem("fusionPerks", JSON.stringify(this.fusionPerks));
  }

  earnGems() {
    const bonus = Object.values(this.fusionPerks).reduce((a, b) => a + b, 0);
    this.gems += 1 + bonus;
    this.saveState();
  }

  addUnit(unit) {
    this.collection.push(unit);
    this.saveState();
  }

  fuseUnits(rules) {
    for (const rarity in rules) {
      const count = rules[rarity].count;
      const bonus = rules[rarity].bonus;
      const owned = this.collection.filter(u => u.rarity === rarity).length;
      while (owned >= count) {
        this.collection = this.collection.filter((u, i) => {
          if (u.rarity === rarity && i < count) return false;
          return true;
        });
        this.fusionPerks[rarity] += bonus;
        break;
      }
    }
    this.saveState();
  }
}
