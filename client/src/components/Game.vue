<script lang="ts">
import Metric from './Metric.vue'
import { defineComponent, onMounted, ref } from 'vue'
import Phaser from 'phaser'
import { handleTurn } from '../test-bot-ai'
import { MoveDirection } from '../types'

const SIZE = 2048
const CELL = 64
const CENTER = SIZE / 2
const IMAGE_SCALE = 0.5

enum GameEvent {
  incrementMoves = 'incrementMoves',
  incrementScore = 'incrementScore',
}

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
}

class GameScene extends Phaser.Scene {
  private bot: Phaser.Physics.Arcade.Image | null = null
  private botTarget: Phaser.Math.Vector2 | null = null
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null
  private minerals: Phaser.Physics.Arcade.StaticGroup | null = null
  private emitter: Phaser.Events.EventEmitter

  constructor(emitter: Phaser.Events.EventEmitter) {
    super(sceneConfig)

    this.emitter = emitter
  }

  preload() {
    this.load.image('map', 'assets/map.jpg')
    this.load.image('harvest-bot', 'assets/harvest-bot.png')
    this.load.image('minerals', 'assets/minerals.png')
  }

  create() {
    this.cameras.main.setBounds(0, 0, SIZE, SIZE)
    this.physics.world.setBounds(0, 0, SIZE, SIZE)
    this.physics.add.staticImage(CENTER, CENTER, 'map')

    this.cursors = this.input.keyboard.createCursorKeys()

    this.add.grid(
      CENTER,
      CENTER,
      SIZE,
      SIZE,
      CELL,
      CELL,
      undefined,
      0,
      0xffffff,
      0.4
    )

    this.spawnMinerals()

    this.bot = this.physics.add
      .image(CENTER - CELL / 2, CENTER - CELL / 2, 'harvest-bot')
      .setScale(IMAGE_SCALE)
      .setCollideWorldBounds(true)
    this.cameras.main.startFollow(this.bot)

    this.botTarget = new Phaser.Math.Vector2()
    this.botTarget.x = this.bot.x
    this.botTarget.y = this.bot.y

    if (this.minerals != null) {
      this.physics.add.overlap(
        this.bot,
        this.minerals,
        this.botHitMineralPatch.bind(this)
      )
    }
  }

  spawnMinerals() {
    this.minerals = this.physics.add.staticGroup({
      key: 'minerals',
      frameQuantity: 50,
    })
    this.minerals.children.each((mineralPatch) => {
      const x = Phaser.Math.Between(0, SIZE / CELL) * CELL + CELL / 2
      const y = Phaser.Math.Between(0, SIZE / CELL) * CELL + CELL / 2

      const mineralPatchImage = mineralPatch as Phaser.Physics.Arcade.Image
      mineralPatchImage
        .setPosition(x, y)
        .setScale(IMAGE_SCALE)
        .setBodySize(CELL / 4, CELL / 4, true)
    })
    this.minerals.refresh()
  }

  botHitMineralPatch(
    bot: Phaser.GameObjects.GameObject,
    mineralPatch: Phaser.GameObjects.GameObject
  ) {
    const mineralPatchImage = mineralPatch as Phaser.Physics.Arcade.Image
    this.minerals?.killAndHide(mineralPatchImage)
    mineralPatchImage.body.enable = false

    this.emitter.emit(GameEvent.incrementScore)
  }

  update() {
    if (this.bot == null || this.botTarget == null) {
      return
    }

    const botMoving =
      this.bot.body.velocity.y > 0 || this.bot.body.velocity.x > 0
    if (botMoving) {
      const distance = Phaser.Math.Distance.Between(
        this.bot.x,
        this.bot.y,
        this.botTarget.x,
        this.botTarget.y
      )
      if (distance < 4) {
        this.bot.body.reset(this.botTarget.x, this.botTarget.y)
      }
      return
    }

    const direction = handleTurn()

    if (this.cursors?.up.isDown || direction === MoveDirection.up) {
      this.botTarget.y -= CELL
      this.bot.setRotation(0)
      this.emitter.emit(GameEvent.incrementMoves)
    } else if (this.cursors?.down.isDown || direction === MoveDirection.down) {
      this.botTarget.y += CELL
      this.bot.setRotation(Math.PI)
      this.emitter.emit(GameEvent.incrementMoves)
    } else if (
      this.cursors?.right.isDown ||
      direction === MoveDirection.right
    ) {
      this.botTarget.x += CELL
      this.bot.setRotation(Math.PI * 0.5)
      this.emitter.emit(GameEvent.incrementMoves)
    } else if (this.cursors?.left.isDown || direction === MoveDirection.left) {
      this.botTarget.x -= CELL
      this.bot.setRotation(Math.PI * 1.5)
      this.emitter.emit(GameEvent.incrementMoves)
    }

    this.physics.moveToObject(this.bot, this.botTarget, CELL * 2)
  }
}

class Game {
  game: Phaser.Game

  constructor(
    canvasEl: HTMLCanvasElement,
    emitter: Phaser.Events.EventEmitter
  ) {
    this.game = new Phaser.Game({
      canvas: canvasEl,
      type: Phaser.CANVAS,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          debug: true,
        },
      },
      scene: new GameScene(emitter),
    })
  }
}

export default defineComponent({
  name: 'Game',
  components: {
    Metric,
  },
  setup() {
    const eventEmitter = new Phaser.Events.EventEmitter()
    const moves = ref(0)
    const score = ref(0)
    const canvasRef = ref()

    onMounted(() => {
      new Game(canvasRef.value as HTMLCanvasElement, eventEmitter)
    })

    eventEmitter.on(GameEvent.incrementMoves, () => {
      moves.value++
    })
    eventEmitter.on(GameEvent.incrementScore, () => {
      score.value++
    })

    return {
      moves,
      score,
      canvasRef,
    }
  },
})
</script>

<template>
  <div class="flex h-screen items-center justify-center bg-gray-900 font-mono">
    <div>
      <canvas ref="canvasRef" class="border-4 border-gray-200 mb-4" />
      <div class="flex gap-3">
        <Metric label="Moves made" :value="moves" />
        <Metric label="Minerals harvested" :value="score" />
      </div>
    </div>
  </div>
</template>
