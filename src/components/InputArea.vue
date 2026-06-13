<script setup lang="ts">
import { ref } from 'vue';
import { Send } from 'lucide-vue-next';

const emit = defineEmits<{
  send: [content: string];
}>();

defineProps<{
  disabled?: boolean;
}>();

const inputText = ref('');

const handleSend = (): void => {
  if (!inputText.value.trim()) return;
  emit('send', inputText.value);
  inputText.value = '';
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
          v-model="inputText"
          :disabled="disabled"
          placeholder="输入消息..."
          class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
          rows="1"
          @keydown="handleKeydown"
        ></textarea>
      </div>
      <button
        :disabled="!inputText.trim() || disabled"
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
