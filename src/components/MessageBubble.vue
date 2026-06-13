<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '@/types';
import LoadingDots from './LoadingDots.vue';
import { renderMarkdown } from '@/utils/markdown';

const props = defineProps<{
  message: Message;
  isLoading?: boolean;
}>();

/**
 * 格式化时间显示
 */
const formattedTime = computed(() => {
  const date = new Date(props.message.timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
});

/**
 * 渲染消息内容
 * 如果是用户消息，进行HTML转义
 * 如果是AI消息，解析Markdown格式
 */
const renderedContent = computed(() => {
  if (props.message.role === 'user') {
    // 用户消息：HTML转义并保留换行
    return props.message.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  } else {
    // AI消息：解析Markdown
    return renderMarkdown(props.message.content);
  }
});
</script>

<template>
  <div 
    class="flex gap-3 mb-4"
    :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
  >
    <!-- 头像 -->
    <div 
      class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
      :class="message.role === 'user' ? 'bg-primary-500' : 'bg-gray-500'"
    >
      {{ message.role === 'user' ? 'U' : 'AI' }}
    </div>
    
    <!-- 消息内容区域 -->
    <div 
      class="max-w-[70%]"
      :class="message.role === 'user' ? 'text-right' : 'text-left'"
    >
      <!-- 消息气泡 -->
      <div 
        class="px-4 py-3 rounded-2xl"
        :class="[
          message.role === 'user' 
            ? 'bg-primary-500 text-white rounded-br-md' 
            : 'bg-gray-100 dark:bg-gray-700 rounded-bl-md'
        ]"
      >
        <!-- 加载状态 -->
        <div 
          v-if="isLoading" 
          class="flex items-center justify-center h-8"
        >
          <LoadingDots />
        </div>
        
        <!-- 消息内容 -->
        <div 
          v-else
          class="break-words"
          :class="message.role === 'user' ? 'whitespace-pre-wrap' : 'markdown-content'"
          v-html="renderedContent"
        ></div>
      </div>
      
      <!-- 时间戳 -->
      <div class="text-xs text-gray-400 mt-1">
        {{ formattedTime }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 确保 Markdown 内容的样式在深色模式下也生效 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  color: inherit;
}

.markdown-content :deep(a) {
  color: #3b82f6;
}

.dark .markdown-content :deep(code) {
  background-color: #374151;
  color: #e5e7eb;
}

.dark .markdown-content :deep(pre) {
  background-color: #1f2937;
}

.dark .markdown-content :deep(blockquote) {
  background-color: rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
}
</style>
