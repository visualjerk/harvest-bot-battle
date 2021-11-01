<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import Phaser from 'phaser'

const SIZE = 2048
const CENTER = SIZE / 2

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
}

class GameScene extends Phaser.Scene {
  private bot: Phaser.Physics.Arcade.Image | null = null
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null

  constructor() {
    super(sceneConfig)
  }

  preload() {
    this.load.image('map', 'assets/map.jpg')
    this.load.image('harvest-bot', 'assets/harvest-bot.png')
  }

  create() {
    this.cameras.main.setBounds(0, 0, SIZE, SIZE)
    this.physics.world.setBounds(0, 0, SIZE, SIZE)
    this.physics.add.staticImage(CENTER, CENTER, 'map')

    this.cursors = this.input.keyboard.createCursorKeys()

    const gridCellSize = SIZE / 30
    this.add.grid(
      CENTER,
      CENTER,
      SIZE,
      SIZE,
      gridCellSize,
      gridCellSize,
      undefined,
      0,
      0xffffff
    )

    this.bot = this.physics.add.image(CENTER, CENTER, 'harvest-bot')
    this.bot.setCollideWorldBounds(true)
    this.cameras.main.startFollow(this.bot)
    // Create minerals
  }

  update() {
    this.bot?.setVelocity(0)

    if (this.cursors?.up.isDown) {
      this.bot?.setVelocityY(-200)
    } else if (this.cursors?.down.isDown) {
      this.bot?.setVelocityY(200)
    }

    if (this.cursors?.right.isDown) {
      this.bot?.setVelocityX(200)
    } else if (this.cursors?.left.isDown) {
      this.bot?.setVelocityX(-200)
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
