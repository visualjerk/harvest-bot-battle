<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import Phaser from 'phaser'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
}

class GameScene extends Phaser.Scene {
  private bot: Phaser.Physics.Arcade.Image | null = null

  constructor() {
    super(sceneConfig)
  }

  preload() {
    this.load.image('map', 'assets/map.jpg')
    this.load.image('harvest-bot', 'assets/harvest-bot.png')
  }

  create() {
    // const { width, height } = this.sys.game.config
    this.physics.add.staticImage(0, 0, 'map')
    this.bot = this.physics.add.image(400, 300, 'harvest-bot')
    // Create minerals
  }

  update() {
    // this.bot?.setAngularVelocity(50)
    // const cursorKeys = this.input.keyboard.createCursorKeys()
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
