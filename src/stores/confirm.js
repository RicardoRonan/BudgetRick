import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmStore = defineStore('confirm', () => {
  const open = ref(false)
  const title = ref('')
  const message = ref('')
  const confirmLabel = ref('Confirm')
  const cancelLabel = ref('Cancel')
  const variant = ref('danger')

  let resolver = null

  function show(options = {}) {
    title.value = options.title ?? 'Are you sure?'
    message.value = options.message ?? ''
    confirmLabel.value = options.confirmLabel ?? 'Confirm'
    cancelLabel.value = options.cancelLabel ?? 'Cancel'
    variant.value = options.variant ?? 'danger'
    open.value = true

    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  function accept() {
    open.value = false
    if (resolver) resolver(true)
    resolver = null
  }

  function dismiss() {
    open.value = false
    if (resolver) resolver(false)
    resolver = null
  }

  return {
    open,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant,
    show,
    accept,
    dismiss,
  }
})
