import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fromEvent, merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as dat from 'dat.gui';
import * as PIXI from 'pixi.js';

const getBoundingBoxes = object => [
  ...(object.children?.reduce(
    (result, child) => [...result, ...getBoundingBoxes(child)],
    [],
  ) ?? []),
  object.getBounds(),
];

const startGame = pixi => {
  const envConfig = {
    gravityRatio: 0.05,
    distanceRatio: 0.01,
  };
  const dinoConfig = {
    runInitVelocity: 9,
    jumpInitVelocity: 15,
    hitBoxOffset: {
      run: {
        left: 2,
        top: 2,
        right: 2,
        bottom: 2,
      },
      jump: {
        left: 2,
        top: 2,
        right: 2,
        bottom: 2,
      },
    },
  };
  const cactusConfig = {
    hitBoxOffset: {
      left: 2,
      top: 2,
      right: 2,
      bottom: 2,
    },
  };
  const debugConfig = {
    isDrawingBoundingBoxes: false,
    isDrawingHitBoxes: false,
  };

  const game = {
    isPlaying: true,
  };

  const dino = {
    velocity: {
      x: dinoConfig.runInitVelocity,
      y: 0,
    },
    isDoubleJumped: false,
  };

  const datGui = new dat.GUI();
  datGui.add(envConfig, 'gravityRatio', 0, 0.1, 0.01);
  datGui.add(envConfig, 'distanceRatio', 0, 0.1, 0.001);
  datGui.add(dinoConfig, 'jumpInitVelocity', 0, 40, 1);
  datGui.add(debugConfig, 'isDrawingBoundingBoxes');
  datGui.add(debugConfig, 'isDrawingHitBoxes');
  datGui.add(dino.velocity, 'x', 0, 100, 1);

  const loader = new PIXI.Loader();
  loader.add('game-sprite.json');
  loader.load((_, resources) => {
    const gameSpriteSheet = resources['game-sprite.json'].spritesheet;

    const landTilingSprite = new PIXI.TilingSprite(
      gameSpriteSheet.textures['bg/land.png'],
      pixi.screen.width,
      26,
    );
    landTilingSprite.zIndex = 0;

    let cactusSprites = [];

    const dinoContainer = new PIXI.Container();
    dinoContainer.zIndex = 2;
    const dinoRunAnimSprite = new PIXI.AnimatedSprite(
      gameSpriteSheet.animations['dino/run'],
    );
    const dinoJumpAnimSprite = new PIXI.AnimatedSprite(
      gameSpriteSheet.animations['dino/jump'],
    );
    const dinoDieAnimSprite = new PIXI.AnimatedSprite(
      gameSpriteSheet.animations['dino/die'],
    );
    dinoDieAnimSprite.loop = false;
    dinoContainer.addChild(dinoRunAnimSprite);
    dinoContainer.addChild(dinoJumpAnimSprite);
    dinoContainer.addChild(dinoDieAnimSprite);

    const scoreDigitSprites = new Array(5).fill({}).map(() => {
      const sprite = new PIXI.Sprite(
        gameSpriteSheet.textures['score/digit_0.png'],
      );
      sprite.zIndex = 3;
      return sprite;
    });

    const gameOverTextSprite = new PIXI.Sprite(
      gameSpriteSheet.textures['game_over/text.png'],
    );
    const gameOverRestartBtnSprite = new PIXI.Sprite(
      gameSpriteSheet.textures['game_over/restart_btn.png'],
    );
    gameOverTextSprite.zIndex = 3;
    gameOverRestartBtnSprite.zIndex = 3;

    const restartGame = () => {
      dino.velocity.x = dinoConfig.runInitVelocity;
      dino.velocity.y = dinoConfig.jumpInitVelocity;
      dinoDieAnimSprite.visible = false;
      dinoRunAnimSprite.visible = true;
      cactusSprites.forEach(cactusSprite => cactusSprite.destroy());
      cactusSprites = [];
      gameOverTextSprite.visible = false;
      gameOverRestartBtnSprite.visible = false;
      game.isPlaying = true;
    };
    gameOverRestartBtnSprite.interactive = true;
    gameOverRestartBtnSprite.buttonMode = true;
    gameOverRestartBtnSprite.on('click', () => {
      restartGame();
    });
    gameOverRestartBtnSprite.on('tap', () => {
      restartGame();
    });

    landTilingSprite.position.set(
      0,
      pixi.screen.height - landTilingSprite.height,
    );

    dinoContainer.position.set(
      50,
      pixi.screen.height - dinoRunAnimSprite.height,
    );

    scoreDigitSprites.forEach((sprite, idx) => {
      sprite.position.set(
        (idx === 0 ? pixi.screen.width - 10 : scoreDigitSprites[idx - 1].x) -
          2 -
          sprite.width,
        10,
      );
    });

    gameOverTextSprite.position.set(
      pixi.screen.width / 2 - gameOverTextSprite.width / 2,
      pixi.screen.height / 2 - gameOverTextSprite.height / 2,
    );
    gameOverRestartBtnSprite.position.set(
      pixi.screen.width / 2 - gameOverRestartBtnSprite.width / 2,
      gameOverTextSprite.y + gameOverTextSprite.height + 10,
    );

    pixi.stage.addChild(landTilingSprite);
    pixi.stage.addChild(dinoContainer);
    scoreDigitSprites.forEach(sprite => {
      pixi.stage.addChild(sprite);
    });
    pixi.stage.addChild(gameOverTextSprite);
    pixi.stage.addChild(gameOverRestartBtnSprite);

    pixi.stage.sortableChildren = true;

    dinoJumpAnimSprite.visible = false;
    dinoDieAnimSprite.visible = false;
    dinoRunAnimSprite.play();

    gameOverTextSprite.visible = false;
    gameOverRestartBtnSprite.visible = false;

    pixi.ticker.add(() => {
      if (
        cactusSprites.length === 0 ||
        cactusSprites[cactusSprites.length - 1].getBounds().right <
          pixi.screen.width
      ) {
        const firstCactusX =
          pixi.screen.width + dinoContainer.width + 150 + Math.random() * 1000;
        let currCactusX = firstCactusX;
        new Array(Math.floor(Math.random() * 3) + 1).fill({}).forEach(() => {
          const cactusSprite = new PIXI.Sprite(
            gameSpriteSheet.textures[
              `bg/cactus_${(Math.floor(Math.random() * 11) + 1)
                .toString()
                .padStart(2, '0')}.png`
            ],
          );
          cactusSprite.zIndex = 1;
          cactusSprite.position.set(
            currCactusX,
            pixi.screen.height - cactusSprite.height,
          );
          currCactusX = cactusSprite.x + cactusSprite.width;
          pixi.stage.addChild(cactusSprite);
          cactusSprites.push(cactusSprite);
        });
      }
    });

    pixi.ticker.add(deltaTime => {
      if (game.isPlaying) {
        landTilingSprite.tilePosition.x -= deltaTime * dino.velocity.x;
        cactusSprites = cactusSprites.reduce((result, cactusSprite) => {
          if (cactusSprite.x <= -cactusSprite.width) {
            cactusSprite.destroy();
            return result;
          }
          return [...result, cactusSprite];
        }, []);
        cactusSprites.forEach(cactusSprite => {
          cactusSprite.x -= deltaTime * dino.velocity.x;
        });
        dino.velocity.y +=
          deltaTime * dinoConfig.jumpInitVelocity * envConfig.gravityRatio;
        dinoContainer.y += deltaTime * dino.velocity.y;
        if (dinoContainer.y >= pixi.screen.height - dinoContainer.height) {
          dinoContainer.y = pixi.screen.height - dinoContainer.height;
          dino.isDoubleJumped = false;
          dino.velocity.y = 0;
          dinoJumpAnimSprite.visible = false;
          dinoRunAnimSprite.visible = true;
        }
      }
    });

    pixi.ticker.add(() => {
      if (game.isPlaying) {
        dinoRunAnimSprite.animationSpeed =
          Math.log10(1 + dino.velocity.x * (9 / 100)) * 0.5;
      }
    });

    pixi.ticker.add(() => {
      if (game.isPlaying) {
        let distance = Math.floor(
          -landTilingSprite.tilePosition.x * envConfig.distanceRatio,
        );
        scoreDigitSprites.forEach(digitSprite => {
          const digit = distance % 10;
          distance = Math.floor(distance / 10);
          digitSprite.texture =
            gameSpriteSheet.textures[`score/digit_${digit}.png`];
        });
      }
    });

    pixi.ticker.add(() => {
      if (game.isPlaying) {
        const dinoHitBox = dinoContainer.getBounds();
        dinoHitBox.x += dinoConfig.hitBoxOffset.run.left;
        dinoHitBox.y += dinoConfig.hitBoxOffset.run.top;
        dinoHitBox.width -=
          dinoConfig.hitBoxOffset.run.left + dinoConfig.hitBoxOffset.run.right;
        dinoHitBox.height -=
          dinoConfig.hitBoxOffset.run.top + dinoConfig.hitBoxOffset.run.bottom;
        const isCrashed = cactusSprites
          .map(cactusSprite => {
            const cactusHitBox = cactusSprite.getBounds();
            cactusHitBox.x += cactusConfig.hitBoxOffset.left;
            cactusHitBox.y += cactusConfig.hitBoxOffset.top;
            cactusHitBox.width -=
              cactusConfig.hitBoxOffset.left + cactusConfig.hitBoxOffset.right;
            cactusHitBox.height -=
              cactusConfig.hitBoxOffset.top + cactusConfig.hitBoxOffset.bottom;
            return cactusHitBox;
          })
          .reduce((result, cactusHitBox) => {
            if (
              cactusHitBox.left > dinoHitBox.right ||
              cactusHitBox.right < dinoHitBox.left
            ) {
              return result;
            }
            return [...result, cactusHitBox];
          }, [])
          .some(
            cactusHitBox =>
              cactusHitBox.left <= dinoHitBox.right &&
              cactusHitBox.right >= dinoHitBox.left &&
              cactusHitBox.bottom >= dinoHitBox.top &&
              cactusHitBox.top <= dinoHitBox.bottom,
          );
        if (isCrashed) {
          dinoRunAnimSprite.visible = false;
          dinoJumpAnimSprite.visible = false;
          dinoDieAnimSprite.visible = true;
          dinoDieAnimSprite.gotoAndPlay(0);
          game.isPlaying = false;
          gameOverTextSprite.visible = true;
          gameOverRestartBtnSprite.visible = true;
        }
      }
    });

    merge(
      fromEvent(pixi.view, 'touchstart'),
      fromEvent(document, 'keydown') |> filter(e => e.code === 'Space'),
    ).subscribe(() => {
      if (game.isPlaying) {
        if (dinoContainer.y === pixi.screen.height - dinoContainer.height) {
          dino.velocity.y = -dinoConfig.jumpInitVelocity;
          dinoRunAnimSprite.visible = false;
          dinoJumpAnimSprite.visible = true;
        } else if (!dino.isDoubleJumped) {
          dino.isDoubleJumped = true;
          dino.velocity.y = -dinoConfig.jumpInitVelocity;
        }
      }
    });

    const debugContainer = new PIXI.Container();
    pixi.stage.addChild(debugContainer);
    pixi.ticker.add(() => {
      debugContainer.removeChildren();
      if (debugConfig.isDrawingBoundingBoxes) {
        getBoundingBoxes(pixi.stage)
          .map(box => {
            const graphics = new PIXI.Graphics();
            graphics.lineStyle(1, 0x00ff00);
            graphics.drawRect(box.x, box.y, box.width, box.height);
            const text = new PIXI.Text(`(${box.x}, ${box.y})`, {
              fontSize: 12,
            });
            text.position.set(box.x, box.y - 20);
            return [graphics, text];
          })
          .reduce((result, objs) => [...result, ...objs], [])
          .forEach(obj => {
            debugContainer.addChild(obj);
          });
      }
      if (debugConfig.isDrawingHitBoxes) {
        const dinoHitBox = dinoContainer.getBounds();
        dinoHitBox.x += dinoConfig.hitBoxOffset.run.left;
        dinoHitBox.y += dinoConfig.hitBoxOffset.run.top;
        dinoHitBox.width -=
          dinoConfig.hitBoxOffset.run.left + dinoConfig.hitBoxOffset.run.right;
        dinoHitBox.height -=
          dinoConfig.hitBoxOffset.run.top + dinoConfig.hitBoxOffset.run.bottom;
        [
          dinoHitBox,
          ...cactusSprites.map(cactusSprite => {
            const cactusHitBox = cactusSprite.getBounds();
            cactusHitBox.x += cactusConfig.hitBoxOffset.left;
            cactusHitBox.y += cactusConfig.hitBoxOffset.top;
            cactusHitBox.width -=
              cactusConfig.hitBoxOffset.left + cactusConfig.hitBoxOffset.right;
            cactusHitBox.height -=
              cactusConfig.hitBoxOffset.top + cactusConfig.hitBoxOffset.bottom;
            return cactusHitBox;
          }),
        ]
          .map(box => {
            const graphics = new PIXI.Graphics();
            graphics.lineStyle(1, 0x00ff00);
            graphics.drawRect(box.x, box.y, box.width, box.height);
            const text = new PIXI.Text(`(${box.x}, ${box.y})`, {
              fontSize: 12,
            });
            text.position.set(box.x, box.y - 20);
            return [graphics, text];
          })
          .reduce((result, objs) => [...result, ...objs], [])
          .forEach(obj => {
            debugContainer.addChild(obj);
          });
      }
    });
  });
};

const ChromeDino = ({ className, width, height }) => {
  const canvasRef = useRef();
  const [pixi, setPixi] = useState(null);
  const [isPixiStarted, setIsPixiStarted] = useState(false);
  useEffect(() => {
    if (canvasRef.current && !pixi) {
      setPixi(
        new PIXI.Application({
          width,
          height,
          view: canvasRef.current,
          transparent: true,
        }),
      );
    } else if (pixi && !isPixiStarted) {
      startGame(pixi);
      setIsPixiStarted(true);
    }
  });

  return (
    <canvas
      className={className}
      width={width}
      height={height}
      ref={canvasRef}
    />
  );
};

ChromeDino.propTypes = {
  className: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default ChromeDino;
