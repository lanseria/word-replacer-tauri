<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'

const greetMsg = ref('')
const name = ref('')

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsg.value = await invoke('greet', { name: name.value })
}
</script>

<template>
  <div class="flex flex-col items-center">
    <form class="flex gap-2" @submit.prevent="greet">
      <input id="greet-input" v-model="name" placeholder="Enter a name...">
      <button type="submit" class="btn">
        Greet
      </button>
    </form>
    <p>{{ greetMsg }}</p>
  </div>
</template>
