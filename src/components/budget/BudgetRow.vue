<script setup>
import { ref } from 'vue'
import FeatherIcon from '../ui/FeatherIcon.vue'
import { useCurrency } from '../../composables/useCurrency.js'

const props = defineProps({
  row: { type: Object, required: true },
  type: { type: String, default: 'expense' },
  dragging: { type: Boolean, default: false },
  dragOver: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update-budget',
  'update-name',
  'update-rollover',
  'hide',
  'delete',
  'toggle-select',
  'drag-start',
  'drag-over',
  'drop',
  'drag-end',
])

const { formatCurrency } = useCurrency()
const editingName = ref(false)
const nameDraft = ref('')

function statusClass(remaining, budgeted) {
  if (budgeted === 0) return ''
  const ratio = remaining / budgeted
  if (ratio < 0) return 'text-error'
  if (ratio < 0.1) return 'text-warning'
  return 'text-success'
}

function startNameEdit() {
  nameDraft.value = props.row.category.name
  editingName.value = true
}

function saveName() {
  editingName.value = false
  const trimmed = nameDraft.value.trim()
  if (trimmed && trimmed !== props.row.category.name) {
    emit('update-name', props.row.category.id, trimmed)
  }
}

function onDragStart(event) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', props.row.category.id)
  emit('drag-start', props.row.category.id)
}

function onDragOver(event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  emit('drag-over', props.row.category.id)
}

function onDrop(event) {
  event.preventDefault()
  emit('drop', props.row.category.id)
}
</script>

<template>
  <tr
    draggable="true"
    class="border-b border-hairline transition-colors"
    :class="[
      dragging ? 'opacity-40' : selected ? 'bg-primary/5' : 'hover:bg-surface/50',
      dragOver ? 'ring-1 ring-inset ring-primary/20' : '',
    ]"
    @dragstart="onDragStart"
    @dragover="onDragOver"
    @drop="onDrop"
    @dragend="$emit('drag-end')"
  >
    <td v-if="selectable" class="py-2.5 px-2 w-10">
      <input
        type="checkbox"
        :checked="selected"
        class="rounded border-hairline text-primary focus:ring-primary/30"
        @change="$emit('toggle-select', row.category.id)"
      />
    </td>
    <td class="py-2.5 px-2 w-8">
      <button
        type="button"
        class="p-2 rounded-notion-sm text-steel hover:text-charcoal hover:bg-surface cursor-grab active:cursor-grabbing min-h-[36px] min-w-[36px] flex items-center justify-center"
        title="Drag to reorder"
        @mousedown.stop
      >
        <FeatherIcon name="menu" :size="14" />
      </button>
    </td>
    <td class="py-2.5 px-3">
      <div class="flex items-center gap-2 min-w-0">
        <FeatherIcon :name="row.category.icon" :size="16" class="shrink-0" />
        <input
          v-if="editingName"
          v-model="nameDraft"
          type="text"
          class="flex-1 min-w-0 text-sm px-2 py-1 border border-primary rounded-notion-sm bg-canvas focus:outline-none focus:ring-1 focus:ring-primary/30"
          autofocus
          @blur="saveName"
          @keydown.enter="saveName"
          @keydown.escape="editingName = false"
        />
        <button
          v-else
          type="button"
          class="flex-1 min-w-0 text-left text-sm text-charcoal truncate hover:text-primary"
          title="Click to rename"
          @click="startNameEdit"
        >
          {{ row.category.name }}
        </button>
      </div>
    </td>
    <td class="py-2.5 px-2 text-right">
      <input
        type="number"
        :value="row.baseBudgeted ?? row.budgeted"
        min="0"
        step="0.01"
        class="w-full max-w-24 ml-auto text-right text-sm px-2 py-1 border border-hairline rounded-notion-sm bg-canvas focus:outline-none focus:ring-1 focus:ring-primary/30"
        @change="$emit('update-budget', row.category.id, $event.target.value)"
      />
      <p
        v-if="row.category.rollover && row.rollover > 0"
        class="text-xs text-steel mt-0.5 whitespace-nowrap"
      >
        {{ formatCurrency(row.baseBudgeted ?? row.budgeted) }}
        <span class="text-success">+{{ formatCurrency(row.rollover) }} rollover</span>
      </p>
    </td>
    <td class="py-2.5 px-2 text-right text-sm text-charcoal whitespace-nowrap">{{ formatCurrency(row.actual) }}</td>
    <td class="py-2.5 px-2 text-right text-sm font-medium whitespace-nowrap" :class="statusClass(row.remaining, row.budgeted)">
      {{ formatCurrency(row.remaining) }}
    </td>
    <td class="py-2.5 px-2">
      <div class="flex items-center justify-end gap-1">
        <label class="cursor-pointer" title="Roll over unused budget to next month">
          <input
            type="checkbox"
            :checked="row.category.rollover"
            class="rounded border-hairline text-primary focus:ring-primary/30"
            @change="$emit('update-rollover', row.category.id, $event.target.checked)"
          />
        </label>
        <button
          type="button"
          class="p-2 rounded-notion-sm text-steel hover:text-error hover:bg-tint-rose/50 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Hide category"
          @click="$emit('hide', row.category.id)"
        >
          <FeatherIcon name="eye-off" :size="14" />
        </button>
        <button
          type="button"
          class="p-2 rounded-notion-sm text-steel hover:text-error hover:bg-tint-rose/50 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Delete category permanently"
          @click="$emit('delete', row.category.id, row.category.name)"
        >
          <FeatherIcon name="trash-2" :size="14" />
        </button>
      </div>
    </td>
  </tr>
</template>
