<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import Phaser from 'phaser'

const SIZE = 2048
const CELL = 64
const CENTER = SIZE / 2
const IMAGE_SCALE = 0.5

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
}

class FieldGridCell {
  column: number
  row: number
  x: number
  y: number
  centerX: number
  centerY: number

  constructor(column: number, row: number, size: number) {
    this.row = row
    this.column = column
    this.x = column * size
    this.y = row * size
    this.centerX = this.x - size / 2
    this.centerY = this.y - size / 2
  }
}

class FieldGrid {
  cells: FieldGridCell[] = []
  size: number

  constructor(columns: number, rows: number, size: number) {
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        this.cells.push(new FieldGridCell(column, row, size))
      }
    }
    this.size = size
  }
}

class GameScene extends Phaser.Scene {
  private bot: Phaser.Physics.Arcade.Image | null = null
  private botTarget: Phaser.Math.Vector2 | null = null
  private botMoving: boolean = false
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null
  private fieldGrid: FieldGrid | null = null
  private minerals: Phaser.Physics.Arcade.Image[] = []

  constructor() {
    super(sceneConfig)
  }

  preload() {
    this.load.image('map', 'assets/map.jpg')
    this.load.image('harvest-bot', 'assets/harvest-bot.png')
    this.load.image('minerals', 'assets/minerals.png')
  }

  create() {
    const fieldCount = SIZE / CELL
    this.fieldGrid = new FieldGrid(fieldCount, fieldCount, CELL)

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
  }

  spawnMinerals() {
    this.fieldGrid?.cells.forEach((cell) => {
      if (Math.random() < 0.05) {
        const mineral = this.physics.add
          .image(cell.centerX, cell.centerY, 'minerals')
          .setScale(IMAGE_SCALE)
        this.minerals.push(mineral)
      }
    })
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

    if (this.cursors?.up.isDown) {
      this.botTarget.y -= CELL
      this.physics.moveToObject(this.bot, this.botTarget, CELL)
    } else if (this.cursors?.down.isDown) {
      this.botTarget.y += CELL
      this.physics.moveToObject(this.bot, this.botTarget, CELL)
    } else if (this.cursors?.right.isDown) {
      this.botTarget.x += CELL
      this.physics.moveToObject(this.bot, this.botTarget, CELL)
    } else if (this.cursors?.left.isDown) {
      this.botTarget.x -= CELL
      this.physics.moveToObject(this.bot, this.botTarget, CELL)
    }
  }
}

class Game {
  game: Phaser.Game

  constructor(canvasEl: HTMLCanvasElement) {
    this.game = new Phaser.Game({
      canvas: canvasEl,
      type: Phaser.CANVAS,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
      },
      scene: new GameScene(),
    })
  }
}

export default defineComponent({
  name: 'Game',
  setup() {
    const canvasRef = ref()
    onMounted(() => {
      new Game(canvasRef.value as HTMLCanvasElement)
    })

    return {
      canvasRef,
    }
  },
})
</script>

<template><canvas ref="canvasRef" /></template>
