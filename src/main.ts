import { loadScript } from './utils';
// import packageJson from '../package.json';

const Sk = window.Sk;
const libList = {
  './pgzrun/__init__.js': './dist/pygame-zero.js',
  //"./pgzrun/__init__.js": `https://cdn.jsdelivr.net/npm/skulpt-pygame-zero@${packageJson.version}/dist/pygame-zero.js`
};
export const PyGameZero = {
  usePyGameZero: function (readFn) {
    const _this = this;
    return function (file) {
      if (_this.matchModelName(file)) {
        return _this.load(file);
      } else {
        return readFn.call(this, file);
      }
    };
  },
  load: function (file) {
    return Sk.misceval.promiseToSuspension(
      new Promise((resolve, reject) => {
        loadScript(
          'https://cdn.bootcdn.net/ajax/libs/pixi.js/5.3.4/pixi.min.js',
          'PIXI'
        ).then(() => {
          fetch(libList[file]).then(function (resp) {
            const result = resp.text();
            resolve(result);
          });
        });
      })
    );
  },
  matchModelName: function (file) {
    return Object.keys(libList).includes(file);
  },
  setContainer: function (el) {
    this.container = el;
  },
  reset: function () {
    this._handleReset();
  },
  _handleReset: function () {},
  _onRunning: function (app) {
    this.app = app;
  },
  _moduleCache: {
    App: null,
    timerMap: new Map(),
    soundMap: {},
    music: new Audio(),
    windowListener: {},
  },
};
window.PyGameZero = PyGameZero;
