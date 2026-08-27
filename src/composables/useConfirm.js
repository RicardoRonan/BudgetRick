import { useConfirmStore } from '../stores/confirm.js'

export function useConfirm() {
  const confirmStore = useConfirmStore()

  function confirm(options) {
    if (typeof options === 'string') {
      return confirmStore.show({ message: options })
    }
    return confirmStore.show(options)
  }

  return { confirm }
}
