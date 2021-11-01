import { MoveDirection } from './types'

export function handleTurn() {
  return Math.random() > 0.5 ? MoveDirection.left : MoveDirection.up
}
