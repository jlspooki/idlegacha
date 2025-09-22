export class UIHandler {
  constructor(engine, banners) {
    this.engine = engine;
    this.banners = banners;
  }

  init() {
    this.updateUI();
    this.renderEncyclopedia();

    document.getElementById("rollBtn").addEventListener("click", () => this.roll(1));
    document.getElementById("roll10Btn").addEventListener("click", () => this.roll(10));
    document.getElementById("fuseBtn").addEventListener("click", () => this.fuse());
  }

  roll(times) {
    const cost = 10 * times;
    if (this.engine.gems < cost) {
      alert("Not enough gems!");
      return;
    }

    this.engine.gems -= cost;
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    for (let i = 0; i < times; i++) {
      const unit = this.banners.rollCharacter();
      this.engine.addUnit(unit);

      const span = document.createElement("span");
      span.textContent = `${unit.name} (${unit.rarity})`;
      span.className = unit.rarity;
      resultDiv.appendChild(span);
    }

    this.updateUI();
  }

  fuse() {
    this.engine.fuseUnits(this.banners.fusionRules);
    this.updateUI();
  }

  updateUI() {
    document.getElementById("gems").textContent = this.engine.gems;
    const bonus = Object.values(this.engine.fusionPerks).reduce((a, b) => a + b, 0);
    document.getElementById("perkBonus").textContent = `Fusion Perk Bonus: +${bonus} gems every 1 second`;

    const collectionList = document.getElementById("collection");
    collectionList.innerHTML = "";
    this.engine.collection.forEach(unit => {
      const li = document.createElement("li");
      li.textContent = `${unit.name} (${unit.rarity})`;
      li.className = unit.rarity;
      collectionList.appendChild(li);
    });

    this.renderEncyclopedia();
  }

  renderEncyclopedia() {
    const encyclopediaDiv = document.getElementById("encyclopedia");
    encyclopediaDiv.innerHTML = "";

    const allUnits = this.banners.banners.default;
    const ownedNames = this.engine.collection.map(u => u.name);

    allUnits.forEach(unit => {
      const span = document.createElement("span");
      span.textContent = `${unit.name} (${unit.rarity})`;
      span.className = unit.rarity;
      if (ownedNames.includes(unit.name)) {
        span.classList.add("owned");
      }
      encyclopediaDiv.appendChild(span);
    });
  }
}
