<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import NotionButton from './NotionButton.vue'
import FeatherIcon from './FeatherIcon.vue'
import { useConfirmStore } from '../../stores/confirm.js'

const confirmStore = useConfirmStore()
const { open, title, message, confirmLabel, cancelLabel, variant } = storeToRefs(confirmStore)

function onKeydown(event) {
  if (!open.value) return
  if (event.key === 'Escape') confirmStore.dismiss()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div
        v-if="open"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @click.self="confirmStore.dismiss()"
      >
        <div class="absolute inset-0 bg-navy/40 dark:bg-black/60 backdrop-blur-sm" />
        <div
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="title ? 'confirm-title' : undefined"
          aria-describedby="confirm-message"
          class="relative bg-canvas border border-hairline rounded-notion-lg shadow-xl w-full max-w-sm"
        >
          <div class="p-5">
            <div class="flex items-start gap-3">
              <div
                class="shrink-0 p-2 rounded-notion"
                :class="variant === 'danger' ? 'bg-tint-rose text-error' : 'bg-tint-sky text-primary'"
              >
                <FeatherIcon
                  :name="variant === 'danger' ? 'alert-triangle' : 'help-circle'"
                  :size="20"
                />
              </div>
              <div class="min-w-0 flex-1">
                <h2
                  v-if="title"
                  id="confirm-title"
                  class="text-base font-semibold text-charcoal"
                >
                  {{ title }}
                </h2>
                <p id="confirm-message" class="text-sm text-steel mt-1">
                  {{ message }}
                </p>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-5">
              <NotionButton variant="secondary" size="sm" @click="confirmStore.dismiss()">
                {{ cancelLabel }}
              </NotionButton>
              <NotionButton
                size="sm"
                :variant="variant === 'danger' ? 'danger' : 'primary'"
                @click="confirmStore.accept()"
              >
                {{ confirmLabel }}
              </NotionButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.2s ease;
}
.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
</style>
