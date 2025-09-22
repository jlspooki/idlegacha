export class BannerManager {
  constructor() {
    this.banners = {
      default: [
        { name: "Slime", rarity: "Common", rate: 0.6 },
        { name: "Knight", rarity: "Rare", rate: 0.25 },
        { name: "Dragon", rarity: "Epic", rate: 0.1 },
        { name: "Celestial Fox", rarity: "Legendary", rate: 0.05 }
      ]
    };

    this.fusionRules = {
      Common: { count: 50, bonus: 1 },
      Rare: { count: 35, bonus: 2 },
      Epic: { count: 15, bonus: 5 },
      Legendary: { count: 5, bonus: 10 }
    };
  }

  rollCharacter(banner = "default") {
    const pool = this.banners[banner];
    const roll = Math.random();
    let cumulative = 0;
    for (const unit of pool) {
      cumulative += unit.rate;
      if (roll <= cumulative) return unit;
    }
    return pool[0];
  }
}
