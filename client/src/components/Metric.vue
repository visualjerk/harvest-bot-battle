<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Metric',
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
})
</script>

<template>
  <span
    class="
      text-blue-300 text-lg
      inline-block
      bg-gray-800
      px-2
      rounded-md
      border-2 border-gray-700
      tracking-wider
    "
  >
    {{ label }}:
    <span class="font-bold text-blue-200">{{ value }}</span>
  </span>
</template>
