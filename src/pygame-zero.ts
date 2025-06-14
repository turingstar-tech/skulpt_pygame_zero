const Sk = window.Sk;
const PIXI = window.PIXI;
import {
  loadScript,
  textureRecources,
  defineGetter,
  defineProperty,
  hitTestRectangle,
  genkwaFunc,
  translateTools,
  resetPygameZero,
} from './utils';

// Third-party plugins
const CDN = {
  tween:
    'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.umd.js',
};

//Aliases
const Application = PIXI.Application,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Sprite = PIXI.Sprite,
  Graphics = PIXI.Graphics,
  Text = PIXI.Text,
  TextStyle = PIXI.TextStyle;

// 全局缓存，在运行时存入，运行前销毁
const ModuleCache = window.PyGameZero._moduleCache;

let hasReset = false;
// 声明_handleReset方法供外部重置
window.PyGameZero._handleReset = function () {
  hasReset = true;
  resetPygameZero(ModuleCache);
};
// 外部没有重置时自动重置
if (!hasReset) {
  resetPygameZero(ModuleCache);
}
loader.pre((resource, next) => {
  resource.crossOrigin = 'anonymous';
  resource.loadType = window.PIXI.loaders.Resource.LOAD_TYPE.XHR;
  next();
});
let width = 500;
let height = 400;

if (window.PyGameZero.container) {
  width = window.PyGameZero.container.offsetWidth;
  height = window.PyGameZero.container.offsetHeight;
}
ModuleCache.App = new Application({
  backgroundColor: 0x000000,
  width,
  height,
});
const app = ModuleCache.App;
// 启用舞台的自动排序功能，使 zIndex 生效
app.stage.sortableChildren = true;
window.PyGameZero._onRunning(app);
window.PyGameZero.container.appendChild(app.view);
const { transX, transY, transPos, transColor } = translateTools(app);
window.$builtinmodule = function () {
  const mod: any = { __name__: new Sk.builtin.str('pygame-zero') };
  mod.WIDTH = Sk.ffi.remapToPy(app.view.width);
  mod.HEIGHT = Sk.ffi.remapToPy(app.view.height);

  // 角色类
  mod.Actor = Sk.misceval.buildClass(
    mod,
    function ($gbl, $loc) {
      $loc.__init__ = new Sk.builtin.func(
        genkwaFunc(function (args, kwa) {
          return new Sk.misceval.promiseToSuspension(
            new Promise(function (resolve) {
              const [self, actorName] = args;
              let jsActorName = Sk.ffi.remapToJs(actorName);
              const jsKwa = Sk.ffi.remapToJs(kwa) || {};

              // 处理多帧图片：如果传入的是数组，保存所有帧并使用第一帧作为默认
              if (Array.isArray(jsActorName)) {
                self.frames = jsActorName; // 保存所有帧
                jsActorName = jsActorName[0]; // 使用第一帧作为默认
                self.currentFrame = 1; // 当前帧索引（从1开始，符合pygame zero惯例）
              } else {
                self.frames = [jsActorName]; // 单帧也保存为数组
                self.currentFrame = 1;
              }

              // 使用与 blit 相同的纹理加载方式
              let texture;
              if (window.PIXI.utils.TextureCache[jsActorName]) {
                texture = window.PIXI.utils.TextureCache[jsActorName];
                createActor(texture);
              } else {
                texture = PIXI.Texture.from(jsActorName);
                if (texture.baseTexture.valid) {
                  createActor(texture);
                } else {
                  texture.baseTexture.on('loaded', () => {
                    createActor(texture);
                  });
                  texture.baseTexture.on('error', () => {
                    console.warn('Failed to load actor texture:', jsActorName);
                    // 创建一个空的精灵作为占位符
                    createActor(PIXI.Texture.EMPTY);
                  });
                }
              }

              function createActor(texture) {
                const sprite = new Sprite(texture);
                sprite.zIndex = 1; // 确保角色在背景之上
                self.sprite = sprite;

                // 默认锚点为中心
                self.sprite.anchor.set(0.5);

                // 处理各种定位选项
                const positionHandlers = {
                  pos: (value) => {
                    let x = 0,
                      y = 0;
                    if (Array.isArray(value)) {
                      [x, y] = value;
                    } else if (typeof value === 'object' && value !== null) {
                      x = value.x || 0;
                      y = value.y || 0;
                    }
                    self.sprite.x = transX(x);
                    self.sprite.y = transY(y);
                  },
                  topleft: (value) => {
                    let x = 0,
                      y = 0;
                    if (Array.isArray(value)) {
                      [x, y] = value;
                    } else if (typeof value === 'object' && value !== null) {
                      x = value.x || 0;
                      y = value.y || 0;
                    }
                    self.sprite.anchor.set(0, 0);
                    self.sprite.x = transX(x);
                    self.sprite.y = transY(y);
                  },
                  topright: (value) => {
                    let x = 0,
                      y = 0;
                    if (Array.isArray(value)) {
                      [x, y] = value;
                    } else if (typeof value === 'object' && value !== null) {
                      x = value.x || 0;
                      y = value.y || 0;
                    }
                    self.sprite.anchor.set(1, 0);
                    self.sprite.x = transX(x);
                    self.sprite.y = transY(y);
                  },
                  bottomleft: (value) => {
                    let x = 0,
                      y = 0;
                    if (Array.isArray(value)) {
                      [x, y] = value;
                    } else if (typeof value === 'object' && value !== null) {
                      x = value.x || 0;
                      y = value.y || 0;
                    }
                    self.sprite.anchor.set(0, 1);
                    self.sprite.x = transX(x);
                    self.sprite.y = transY(y);
                  },
                  bottomright: (value) => {
                    let x = 0,
                      y = 0;
                    if (Array.isArray(value)) {
                      [x, y] = value;
                    } else if (typeof value === 'object' && value !== null) {
                      x = value.x || 0;
                      y = value.y || 0;
                    }
                    self.sprite.anchor.set(1, 1);
                    self.sprite.x = transX(x);
                    self.sprite.y = transY(y);
                  },
                  midtop: (value) => {
                    let x = 0,
                      y = 0;
                    if (Array.isArray(value)) {
                      [x, y] = value;
                    } else if (typeof value === 'object' && value !== null) {
                      x = value.x || 0;
                      y = value.y || 0;
                    }
                    self.sprite.anchor.set(0.5, 0);
                    self.sprite.x = transX(x);
                    self.sprite.y = transY(y);
                  },
                  midleft: (value) => {
                    let x = 0,
                      y = 0;
                    if (Array.isArray(value)) {
                      [x, y] = value;
                    } else if (typeof value === 'object' && value !== null) {
                      x = value.x || 0;
                      y = value.y || 0;
                    }
                    self.sprite.anchor.set(0, 0.5);
                    self.sprite.x = transX(x);
                    self.sprite.y = transY(y);
                  },
                  midright: (value) => {
                    let x = 0,
                      y = 0;
                    if (Array.isArray(value)) {
                      [x, y] = value;
                    } else if (typeof value === 'object' && value !== null) {
                      x = value.x || 0;
                      y = value.y || 0;
                    }
                    self.sprite.anchor.set(1, 0.5);
                    self.sprite.x = transX(x);
                    self.sprite.y = transY(y);
                  },
                  midbottom: (value) => {
                    let x = 0,
                      y = 0;
                    if (Array.isArray(value)) {
                      [x, y] = value;
                    } else if (typeof value === 'object' && value !== null) {
                      x = value.x || 0;
                      y = value.y || 0;
                    }
                    self.sprite.anchor.set(0.5, 1);
                    self.sprite.x = transX(x);
                    self.sprite.y = transY(y);
                  },
                  center: (value) => {
                    let x = 0,
                      y = 0;
                    if (Array.isArray(value)) {
                      [x, y] = value;
                    } else if (typeof value === 'object' && value !== null) {
                      x = value.x || 0;
                      y = value.y || 0;
                    }
                    self.sprite.anchor.set(0.5, 0.5);
                    self.sprite.x = transX(x);
                    self.sprite.y = transY(y);
                  },
                };
                let positionApplied = false;
                for (const [posType, handler] of Object.entries(
                  positionHandlers
                )) {
                  // 首先检查jsKwa是否有这个属性
                  if (jsKwa?.[posType] !== undefined) {
                    // 获取值
                    const pyValue = jsKwa[posType];
                    // 直接检查是否是数组或可以直接使用的值
                    if (Array.isArray(pyValue)) {
                      // 已经是JavaScript数组，直接使用
                      handler(pyValue);
                    } else if (Sk.builtin.checkSequence(pyValue)) {
                      // 是Python序列，需要转换
                      const jsArray = [];
                      const iterator = Sk.abstr.iter(pyValue);
                      let item;
                      while (
                        (item = Sk.abstr.iternext(iterator, false)) !==
                        undefined
                      ) {
                        jsArray.push(Sk.ffi.remapToJs(item));
                      }
                      handler(jsArray);
                    } else {
                      // 其他类型的值照常处理
                      handler(Sk.ffi.remapToJs(pyValue));
                    }
                    positionApplied = true;
                    break;
                  }
                }

                // 向后兼容：如果没有设置任何位置属性，则检查位置参数
                if (!positionApplied && args.length > 2) {
                  const pos = Sk.ffi.remapToJs(args[2]) || [];
                  self.sprite.x = transX(pos[0] || 0);
                  self.sprite.y = transY(pos[1] || 0);
                } else if (!positionApplied) {
                  // 默认位置为(0,0)
                  self.sprite.x = transX(0);
                  self.sprite.y = transY(0);
                }

                self.actorName = jsActorName;
                self._initialized = true; // 标记初始化完成
                // 立即添加到舞台，确保 Actor 创建后立即可见
                app.stage.addChild(self.sprite);
                resolve(void 0);
              }
            })
          );
        }, true)
      );
      $loc.x = defineProperty(
        function (self) {
          return Sk.ffi.remapToPy(transX(self.sprite.x, true));
        },
        function (self, val) {
          self.sprite.x = transX(val.v);
        }
      );
      $loc.y = defineProperty(
        function (self) {
          return Sk.ffi.remapToPy(transY(self.sprite.y, true));
        },
        function (self, val) {
          self.sprite.y = transY(val.v);
        }
      );
      $loc.width = defineProperty('sprite', 'width');
      $loc.height = defineProperty('sprite', 'height');
      $loc.pos = defineProperty(
        function (self) {
          return Sk.ffi.remapToPy(
            transPos([self.sprite.x, self.sprite.y], true)
          );
        },
        function (self, val) {
          const pos = transPos(Sk.ffi.remapToJs(val));
          self.sprite.x = pos[0];
          self.sprite.y = pos[1];
          self['sprite']['pos'] = [pos[0], pos[1]];
        }
      );
      $loc.angle = defineProperty('sprite', 'angle');
      $loc.show = defineProperty('sprite', 'visible');
      $loc.image = defineProperty(
        function (self) {
          return Sk.ffi.remapToPy(self['sprite']['texture']);
        },
        function (self, val) {
          return new Sk.misceval.promiseToSuspension(
            new Promise(function (resolve) {
              textureRecources(val.v).then(function (texture) {
                self['sprite']['texture'] = texture;
                resolve(void 0);
              });
            })
          );
        }
      );
      $loc.frame = defineProperty(
        function (self) {
          return Sk.ffi.remapToPy(self.currentFrame || 1);
        },
        function (self, val) {
          const frameIndex = val.v;
          if (
            self.frames &&
            frameIndex >= 1 &&
            frameIndex <= self.frames.length
          ) {
            self.currentFrame = frameIndex;
            const frameUrl = self.frames[frameIndex - 1]; // 数组索引从0开始，但frame从1开始

            // 使用与初始化相同的纹理加载方式
            let texture;
            if (window.PIXI.utils.TextureCache[frameUrl]) {
              texture = window.PIXI.utils.TextureCache[frameUrl];
              self.sprite.texture = texture;
            } else {
              texture = PIXI.Texture.from(frameUrl);
              self.sprite.texture = texture;
            }
          }
        }
      );
      $loc.distance_to = new Sk.builtin.func(function (self, pos) {
        pos = transPos(Sk.ffi.remapToJs(pos));
        // 计算两点距离：|AB| = √((x1-x2)²+(y1-y2)²)
        return Sk.ffi.remapToPy(
          Math.round(
            Math.abs(
              Math.sqrt(
                Math.pow(self.sprite.x - pos[0], 2) +
                  Math.pow(self.sprite.y - pos[1], 2)
              )
            )
          )
        );
      });
      $loc.angle_to = new Sk.builtin.func(function (self, pos) {
        pos = transPos(Sk.ffi.remapToJs(pos));
        // 计算两点角度：arcsin(|y1-y2| ÷ √((x1-x2)²+(y1-y2)²)) ÷ π ×180
        const x1 = self.sprite.y;
        const x2 = pos[0];
        const y1 = self.sprite.y;
        const y2 = pos[1];
        const x = Math.abs(x1 - x2);
        const y = Math.abs(y1 - y2);
        const z = Math.sqrt(x * x + y * y);
        return Sk.ffi.remapToPy(Math.round((Math.asin(y / z) / Math.PI) * 180));
      });
      $loc.collide_point = new Sk.builtin.func(function (self, pos) {
        return hitTestRectangle(self.sprite, transPos(Sk.ffi.remapToJs(pos)));
      });
      $loc.collide_actor = new Sk.builtin.func(function (self, actor) {
        return hitTestRectangle(self.sprite, actor.sprite);
      });
      $loc.colliderect = new Sk.builtin.func(function (self, actor) {
        return hitTestRectangle(self.sprite, actor.sprite);
      });
      $loc.remove = new Sk.builtin.func(function (self) {
        app.stage.removeChild(self.sprite);
      });
      $loc.draw = new Sk.builtin.func(function (self) {
        if (self._initialized && self.sprite) {
          // 如果精灵不在舞台上，就重新添加到舞台
          if (self.sprite.parent !== app.stage) {
            app.stage.addChild(self.sprite);
          }
          // 强制触发舞台重新排序，确保 zIndex 生效
          app.stage.sortChildren();
        }
      });
    },
    'Actor'
  );
  // 矩形类
  mod.Rect = Sk.misceval.buildClass(
    mod,
    function ($gbl, $loc) {
      // $loc.__init__就是构造器
      let _self;
      $loc.__init__ = new Sk.builtin.func(function (self, pos, size) {
        pos = transPos(Sk.ffi.remapToJs(pos));
        size = Sk.ffi.remapToJs(size);
        self.pos = {
          x: pos[0],
          y: pos[1],
        };
        self.size = {
          width: size[0],
          height: size[1],
        };
      });
      $loc.pos = defineGetter((self) =>
        Sk.ffi.remapToPy(transPos(self.pos, true))
      );
      $loc.size = defineGetter((self) => Sk.ffi.remapToPy(self.size));
    },
    'Rect',
    []
  );
  // 画笔类
  const graph = new Graphics();
  mod.draw = Sk.misceval.buildClass(
    mod,
    function ($gbl, $loc) {
      $loc.__init__ = new Sk.builtin.func(function (self) {
        self.size = 5;
      });
      $loc.size = new Sk.builtin.func(function (self, size) {
        self.size = size.v;
      });
      // $loc.fill = new Sk.builtin.func(function(self, color) {
      //   color = transColor(Sk.ffi.remapToJs(color));
      //   graph.beginFill(color)
      // })
      $loc.line = new Sk.builtin.func(function (self, start, end, color) {
        color = transColor(Sk.ffi.remapToJs(color));
        start = Sk.ffi.remapToJs(start);
        end = Sk.ffi.remapToJs(end);
        graph.lineStyle(self.size || 2, color, 1);
        graph.moveTo(start[0], start[1]);
        graph.lineTo(end[0], end[1]);
        app.stage.addChild(graph);
      });
      $loc.circle = new Sk.builtin.func(function (self, pos, radius, color) {
        color = transColor(Sk.ffi.remapToJs(color));
        pos = transPos(Sk.ffi.remapToJs(pos));
        graph.lineStyle(self.size, color, 1);
        graph.drawCircle(pos[0], pos[1], radius.v);
        app.stage.addChild(graph);
      });
      $loc.filled_circle = new Sk.builtin.func(function (
        self,
        pos,
        radius,
        color
      ) {
        color = transColor(Sk.ffi.remapToJs(color));
        pos = transPos(Sk.ffi.remapToJs(pos));
        graph.lineStyle(0);
        graph.beginFill(color, 1);
        graph.drawCircle(pos[0], pos[1], radius.v);
        graph.endFill();
        app.stage.addChild(graph);
      });
      $loc.rect = new Sk.builtin.func(function (self, ...args) {
        if (Sk.abstr.typeName(args[0]) === 'Rect') {
          const [rect, color] = args;
          graph.lineStyle(self.size, transColor(Sk.ffi.remapToJs(color)), 1);
          graph.drawRect(
            rect.pos.x,
            rect.pos.y,
            rect.size.width,
            rect.size.height
          );
          app.stage.addChild(graph);
        } else {
          let left, top;
          const leftTop = Sk.ffi.remapToJs(args[0]);
          if (Array.isArray(leftTop)) {
            left = leftTop[0];
            top = leftTop[1];
            args.shift();
          } else {
            left = args[0].v;
            top = args[1].v;
            args.shift();
            args.shift();
          }
          let [width, height, color] = args;
          width = Sk.ffi.remapToJs(width);
          height = Sk.ffi.remapToJs(height);
          graph.lineStyle(self.size, transColor(Sk.ffi.remapToJs(color)), 1);
          graph.drawRect(transX(left), transY(top), width, height);
          app.stage.addChild(graph);
        }
      });
      $loc.filled_rect = new Sk.builtin.func(function (self, ...args) {
        if (Sk.abstr.typeName(args[0]) === 'Rect') {
          const [rect, color] = args;
          graph.lineStyle(0);
          graph.beginFill(transColor(Sk.ffi.remapToJs(color)), 1);
          graph.drawRect(
            rect.pos.x,
            rect.pos.y,
            rect.size.width,
            rect.size.height
          );
          graph.endFill();
          app.stage.addChild(graph);
        } else {
          let left, top;
          const leftTop = Sk.ffi.remapToJs(args[0]);
          if (Array.isArray(leftTop)) {
            left = leftTop[0];
            top = leftTop[1];
            args.shift();
          } else {
            left = args[0].v;
            top = args[1].v;
            args.shift();
            args.shift();
          }
          let [width, height, color] = args;
          width = Sk.ffi.remapToJs(width);
          height = Sk.ffi.remapToJs(height);
          color = transColor(Sk.ffi.remapToJs(color));
          graph.lineStyle(0);
          graph.beginFill(color, 1);
          graph.drawRect(transX(left), transY(top), width, height);
          graph.endFill();
          app.stage.addChild(graph);
        }
      });
      $loc.clear = new Sk.builtin.func(function (self) {
        graph.clear();
        self.basicText && self.basicText.destroy();
      });
      $loc.text = new Sk.builtin.func(
        genkwaFunc(function (args, kwa) {
          kwa = Sk.ffi.remapToJs(kwa);
          let [self, str, pos, color, fontsize, fontname] = args;
          color = transColor(Sk.ffi.remapToJs(color || kwa.color));
          fontsize = Sk.ffi.remapToJs(fontsize || kwa.fontsize);
          fontname = Sk.ffi.remapToJs(fontname || kwa.fontname);
          pos = transPos(Sk.ffi.remapToJs(pos));
          const style = new PIXI.TextStyle({
            fontFamily: fontname || 'PingFang SC',
            fontSize: fontsize,
            fill: color,
          });
          const basicText = new PIXI.Text(str.v, style);
          self.basicText = basicText;
          basicText.anchor.set(0.5);
          if (pos) {
            basicText.x = pos[0];
            basicText.y = pos[1];
          }
          app.stage.addChild(basicText);
        }, true)
      );
    },
    'Draw',
    []
  );
  // 屏幕类

  mod.screen = Sk.misceval.callsimOrSuspend(
    Sk.misceval.buildClass(
      mod,
      function ($gbl, $loc) {
        $loc.draw = Sk.misceval.callsimOrSuspend(mod.draw);
        $loc.clear = new Sk.builtin.func(function (self) {
          // app.destroy();
          while (app.stage.children.length > 0) {
            var child = app.stage.getChildAt(0);
            app.stage.removeChild(child);
          }
        });
        $loc.fill = new Sk.builtin.func(function (self, color) {
          // 先确保尺寸已更新
          if (Sk.globals && Sk.globals.WIDTH && Sk.globals.HEIGHT) {
            const newWidth = Sk.ffi.remapToJs(Sk.globals.WIDTH);
            const newHeight = Sk.ffi.remapToJs(Sk.globals.HEIGHT);

            if (newWidth !== app.view.width || newHeight !== app.view.height) {
              app.renderer.resize(newWidth, newHeight);
              if (window.PyGameZero.container) {
                window.PyGameZero.container.style.width = newWidth + 'px';
                window.PyGameZero.container.style.height = newHeight + 'px';
              }
            }
          }

          // 然后执行填充
          graph.clear();
          graph.beginFill(transColor(Sk.ffi.remapToJs(color)), 1);
          graph.drawRect(0, 0, app.view.width, app.view.height);
          graph.endFill();
          app.stage.addChild(graph);
        });
        $loc.blit = new Sk.builtin.func(function (self, image, pos) {
          const imageSrc = Sk.ffi.remapToJs(image);
          const position = transPos(Sk.ffi.remapToJs(pos));

          // 立即创建精灵，不等待纹理加载完成
          let texture;
          if (window.PIXI.utils.TextureCache[imageSrc]) {
            texture = window.PIXI.utils.TextureCache[imageSrc];
          } else {
            texture = PIXI.Texture.from(imageSrc);
          }

          const sprite = new Sprite(texture);
          sprite.anchor.set(0, 0); // 左上角对齐，符合 pygame blit 的行为
          sprite.x = transX(position[0]);
          sprite.y = transY(position[1]);
          sprite.zIndex = -1; // 使用 zIndex 确保背景在底层

          // 立即添加到舞台，不等待异步加载
          app.stage.addChild(sprite);
        });
      },
      'Screen',
      []
    )
  );
  // 时间类
  mod.clock = Sk.misceval.callsimOrSuspend(
    Sk.misceval.buildClass(
      mod,
      function ($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func(function (self) {
          // ModuleCache.timerMap = new WeakMap();
        });
        $loc.schedule = new Sk.builtin.func(function (self, callback, delay) {
          ModuleCache.timerMap.set(
            callback,
            setTimeout(function () {
              Sk.misceval.callsimAsync(null, callback);
            }, delay.v * 1000)
          );
        });
        $loc.schedule_interval = new Sk.builtin.func(function (
          self,
          callback,
          delay
        ) {
          ModuleCache.timerMap.set(
            callback,
            setInterval(function () {
              Sk.misceval.callsimAsync(null, callback);
            }, delay.v * 1000)
          );
        });
        $loc.schedule_unique = new Sk.builtin.func(function (
          self,
          callback,
          delay
        ) {
          if (self.timerMap.has(callback)) {
            clearTimeout(ModuleCache.timerMap.get(callback));
            clearInterval(ModuleCache.timerMap.get(callback));
          }
          ModuleCache.timerMap.set(
            callback,
            setTimeout(function () {
              Sk.misceval.callsimAsync(null, callback);
            }, delay.v * 1000)
          );
        });
        $loc.unschedule = new Sk.builtin.func(function (self, callback, delay) {
          if (ModuleCache.timerMap.has(callback)) {
            clearTimeout(ModuleCache.timerMap.get(callback));
            clearInterval(ModuleCache.timerMap.get(callback));
          }
        });
      },
      'Clock',
      []
    )
  );

  // 音乐类
  mod.music = Sk.misceval.callsimOrSuspend(
    Sk.misceval.buildClass(
      mod,
      function ($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func(function (self) {});
        $loc.play = new Sk.builtin.func(function (self, name) {
          ModuleCache.music.src = name.v;
          ModuleCache.music.loop = true;
          ModuleCache.music.play();
        });
        $loc.play_once = new Sk.builtin.func(function (self, name) {
          ModuleCache.music.src = name.v;
          ModuleCache.music.loop = false;
          ModuleCache.music.play();
        });
        $loc.is_playing = new Sk.builtin.func(function (self, name) {
          return !ModuleCache.music.paused;
        });
        $loc.volume = defineProperty(
          function (self) {
            return ModuleCache.music.volume;
          },
          function (self, val) {
            ModuleCache.music.volume = val.v;
          }
        );
        $loc.set_volume = new Sk.builtin.func(function (self, val) {
          ModuleCache.music.volume = val.v;
        });
        $loc.get_volume = new Sk.builtin.func(function (self) {
          return ModuleCache.music.volume;
        });
        $loc.stop = new Sk.builtin.func(function (self, name) {
          ModuleCache.music.currentTime = 0;
          ModuleCache.music.pause();
        });
      },
      'Music',
      []
    )
  );

  // 音效类
  mod.sound = Sk.misceval.callsimOrSuspend(
    Sk.misceval.buildClass(
      mod,
      function ($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func(function (self) {});
        $loc.play = new Sk.builtin.func(function (self, name) {
          if (ModuleCache.soundMap[name.v]) {
            ModuleCache.soundMap[name.v].play();
            ModuleCache.soundMap[name.v].currentTime = 0;
          } else {
            const audio = new Audio();
            audio.src = name.v;
            audio.loop = false;
            audio.play();
            ModuleCache.soundMap[name.v] = audio;
          }
        });
        $loc.stop = new Sk.builtin.func(function (self, name) {
          ModuleCache.soundMap[name.v].pause();
        });
        $loc.get_length = new Sk.builtin.func(function (self, name) {
          return Sk.ffi.remapToPy(
            Math.ceil(ModuleCache.soundMap[name.v].duration)
          );
        });
      },
      'Sound',
      []
    )
  );

  // 动画类
  let tweenTicker = false;
  mod.animate = Sk.misceval.buildClass(
    mod,
    function ($gbl, $loc) {
      $loc.__init__ = new Sk.builtin.func(
        genkwaFunc(function (args, oldkwa) {
          const kwa = Sk.ffi.remapToJs(oldkwa);
          let [self, actor, tween, duration, on_finished, targets] = args;
          tween = tween || kwa.tween || 'linear';
          duration = duration || kwa.duration || 1;
          console.log(oldkwa);
          on_finished = on_finished || oldkwa.entries.on_finished.rhs;

          const x = transX(kwa.x) || actor.sprite.x;
          const y = transY(kwa.y) || actor.sprite.y;
          const pos = transPos(targets) || transPos(kwa.pos) || [x, y];
          return new Sk.misceval.promiseToSuspension(
            new Promise(function (resolve) {
              loadScript(CDN.tween, 'TWEEN').then(() => {
                if (!tweenTicker) {
                  app.ticker.add(() => {
                    window.TWEEN.update();
                  });
                  tweenTicker = true;
                }
                const { Easing } = window.TWEEN;
                const tweenMap = {
                  linear: Easing.Linear.None, // 线性
                  accelerate: Easing.Quartic.Out, // 加速
                  decelerate: Easing.Quartic.In, // 减速
                  accel_decel: Easing.Quartic.InOut, // 先加速再加速
                  elastic_start: Easing.Elastic.In, // 开始时反弹
                  elastic_end: Easing.Elastic.Out, // 结束时反弹
                  elastic_start_end: Easing.Elastic.InOut, // 开始结束都反弹
                  bounce_start: Easing.Bounce.In, // 开始时弹跳
                  bounce_end: Easing.Bounce.Out, // 结束时弹跳
                  bounce_start_end: Easing.Bounce.InOut, // 开始和结束都弹跳
                };
                self.ani = new window.TWEEN.Tween({
                  x: actor.sprite.x,
                  y: actor.sprite.y,
                })
                  .to(
                    {
                      x: pos[0] || x,
                      y: pos[1] || y,
                    },
                    duration * 1000
                  )
                  .easing(tweenMap[tween] || Easing.Linear.None)
                  .onUpdate(function (object) {
                    actor.sprite.y = object.y;
                    actor.sprite.x = object.x;
                  })
                  .onComplete(function () {
                    on_finished && Sk.misceval.callsimOrSuspend(on_finished);
                  })
                  .start();
                resolve(void 0);
              });
            })
          );
        }, true)
      );
      $loc.stop = new Sk.builtin.func(function (self) {
        self.ani.pause();
      });
      $loc.running = defineGetter(function (self) {
        return Sk.ffi.remapToPy(self.ani.tweens[0].playing);
      });
    },
    'Animate',
    []
  );

  // 主循环
  app.ticker.add((delta) => {
    if (Sk.globals && Sk.globals.WIDTH && Sk.globals.HEIGHT) {
      const newWidth = Sk.ffi.remapToJs(Sk.globals.WIDTH);
      const newHeight = Sk.ffi.remapToJs(Sk.globals.HEIGHT);

      // 如果尺寸发生变化，调整应用和容器
      if (newWidth !== app.view.width || newHeight !== app.view.height) {
        app.renderer.resize(newWidth, newHeight);
        if (window.PyGameZero.container) {
          window.PyGameZero.container.style.width = newWidth + 'px';
          window.PyGameZero.container.style.height = newHeight + 'px';
        }
      }
    }
    Sk.globals.draw && Sk.misceval.callsimAsync(null, Sk.globals.draw);
    Sk.globals.update && Sk.misceval.callsimAsync(null, Sk.globals.update);
  });

  const keys = [
    'K_0',
    'K_1',
    'K_2',
    'K_3',
    'K_4',
    'K_5',
    'K_6',
    'K_7',
    'K_8',
    'K_9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'SHIFT',
    'CTRL',
    'ALT',
    'LEFT',
    'UP',
    'RIGHT',
    'DOWN',
    'PAGEUP',
    'PAGEDOWN',
    'END',
    'HOME',
    'ESCAPE',
    'ENTER',
    'SPACE',
    'RETURN',
    'BACKSPACE',
    'INSERT',
    'DELETE',
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F11',
    'F12',
    'F13',
    'F14',
    'F15',
  ];
  const nativeKeys = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'Shift',
    'Ctrl',
    'Alt',
    'ArrowLeft',
    'ArrowUp',
    'ArrowRight',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'End',
    'Home',
    'Escape',
    'Enter',
    '',
    'Return',
    'Backspace',
    'Insert',
    'Delete',
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F11',
    'F12',
    'F13',
    'F14',
    'F15',
  ];
  const keysMap = {};
  nativeKeys.map((nativeKeys, index) => {
    keysMap[nativeKeys] = keys[index];
  });
  const keyboard = {};

  // 键盘按下事件
  ModuleCache.windowListener.keydownListener = function (e) {
    keyboard[keysMap[e.key]] = true;
    Sk.globals.on_key_down &&
      Sk.misceval.callsimAsync(
        null,
        Sk.globals.on_key_down,
        Sk.ffi.remapToPy(keysMap[e.key])
      );
  };
  window.addEventListener(
    'keydown',
    ModuleCache.windowListener.keydownListener
  );

  ModuleCache.windowListener.keyupListener = function (e) {
    keyboard[keysMap[e.key]] = false;
    Sk.globals.on_key_down &&
      Sk.misceval.callsimAsync(
        null,
        Sk.globals.on_key_down,
        Sk.ffi.remapToPy(keysMap[e.key])
      );
  };
  window.addEventListener('keyup', ModuleCache.windowListener.keyupListener);
  // 键盘名称
  mod.Keys = Sk.misceval.callsimOrSuspend(
    Sk.misceval.buildClass(
      mod,
      function ($gbl, $loc) {
        keys.map((key) => {
          $loc[key] = defineGetter(() => Sk.ffi.remapToPy(key));
        });
      },
      'Keys',
      []
    )
  );
  // 键盘按下
  mod.keyboard = Sk.misceval.callsimOrSuspend(
    Sk.misceval.buildClass(
      mod,
      function ($gbl, $loc) {
        keys.map((key, i) => {
          $loc[key.toLowerCase()] = defineGetter(() => keyboard[key] || false);
        });
      },
      'keyboard',
      []
    )
  );

  const mouseDownMap = {
    '0': 'LEFT',
    '1': 'MIDDLE',
    '2': 'RIGHT',
  };
  let mousePos = {
    x: 0,
    y: 0,
  };
  const mouse = {};
  let buttons = [];
  const insertData = function (arr, data) {
    if (data && !~arr.indexOf(data)) {
      arr.push(data);
    }
  };
  const delData = function (arr, data) {
    const index = arr.indexOf(data);
    if (~index) {
      arr.splice(index, 1);
    }
  };
  // 鼠标按下事件
  app.view.addEventListener('mousedown', function (e) {
    const button = (mouseDownMap[e.button] || '').toLowerCase();
    insertData(buttons, button);
    Sk.globals.on_mouse_down &&
      Sk.misceval.callsimAsync(
        null,
        Sk.globals.on_mouse_down,
        Sk.ffi.remapToPy([transX(e.offsetX, true), transY(e.offsetY, true)]),
        Sk.ffi.remapToPy(button)
      );
  });
  // 鼠标抬起事件
  app.view.addEventListener('mouseup', function (e) {
    const button = (mouseDownMap[e.button] || '').toLowerCase();
    delData(buttons, button);
    Sk.globals.on_mouse_up &&
      Sk.misceval.callsimAsync(
        null,
        Sk.globals.on_mouse_up,
        Sk.ffi.remapToPy([transX(e.offsetX, true), transY(e.offsetY, true)]),
        Sk.ffi.remapToPy(mouseDownMap[e.button])
      );
  });
  // // 禁用鼠标右键
  // document.oncontextmenu = function(){
  //   return false;
  // }
  // 鼠标移动事件
  app.view.addEventListener('mousemove', function (e) {
    mousePos = {
      x: transX(e.offsetX, true),
      y: transY(e.offsetY, true),
    };
    Sk.globals.on_mouse_move &&
      Sk.misceval.callsimAsync(
        null,
        Sk.globals.on_mouse_move,
        Sk.ffi.remapToPy([mousePos.x, mousePos.y]),
        Sk.ffi.remapToPy([mousePos.x, mousePos.y]),
        Sk.ffi.remapToPy(buttons)
      );
  });
  // 鼠标滚轮事件
  app.view.addEventListener('wheel', function (e) {
    if (e.deltaY > 0) {
      insertData(buttons, 'wheel_down');
      delData(buttons, 'wheel_up');
    } else if (e.deltaY < 0) {
      insertData(buttons, 'wheel_up');
      delData(buttons, 'wheel_down');
    } else {
      delData(buttons, 'wheel_up');
      delData(buttons, 'wheel_down');
    }
  });

  // 鼠标位置
  mod.mouse = Sk.misceval.callsimOrSuspend(
    Sk.misceval.buildClass(
      mod,
      function ($gbl, $loc) {
        $loc.x = defineGetter(() => mousePos.x);
        $loc.y = defineGetter(() => mousePos.y);
        $loc.pos = defineGetter(() =>
          Sk.ffi.remapToPy([mousePos.x, mousePos.y])
        );
        $loc.LEFT = Sk.ffi.remapToPy('left');
        $loc.MIDDLE = Sk.ffi.remapToPy('middle');
        $loc.RIGHT = Sk.ffi.remapToPy('right');
        $loc.WHEEL_UP = Sk.ffi.remapToPy('wheel_up');
        $loc.WHEEL_DOWN = Sk.ffi.remapToPy('wheel_down');
      },
      'Mouse',
      []
    )
  );

  mod.go = new Sk.builtin.func(function (self) {});

  return mod;
};
