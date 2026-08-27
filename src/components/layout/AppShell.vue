<script setup>
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden lg:pt-4">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main class="flex-1 overflow-y-auto px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <slot />
      </main>
    </div>
  </div>
</template>
