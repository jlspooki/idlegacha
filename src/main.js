import { GameEngine } from './engine.js';
import { BannerManager } from './banners.js';
import { UIHandler } from './ui.js';

const engine = new GameEngine();
const banners = new BannerManager();
const ui = new UIHandler(engine, banners);

window.addEventListener("load", () => {
  ui.init();
  setInterval(() => engine.earnGems(), 1000);
});
