<script setup lang="ts">
import { Send } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  send: [content: string];
}>();

const handleInput = (event: Event): void => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};

const handleSend = (): void => {
  if (!props.modelValue.trim()) return;
  emit('send', props.modelValue);
};

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
};
</script>

<template>
  <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4">
    <div class="flex items-end gap-3">
      <div class="flex-1 relative">
        <textarea
          :value="modelValue"
          :disabled="disabled"
          placeholder="输入消息..."
          class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
          rows="1"
          @input="handleInput"
          @keydown="handleKeydown"
        ></textarea>
      </div>
      <button
        :disabled="!modelValue.trim() || disabled"
        class="flex-shrink-0 w-12 h-12 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
        @click="handleSend"
      >
        <Send :size="20" />
      </button>
    </div>
    <div class="text-xs text-gray-400 mt-2 text-center">
      按 Enter 发送，Ctrl/Cmd + Enter 换行
    </div>
  </div>
</template>
