<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { Settings, Moon, Sun } from 'lucide-vue-next';
import type { Message } from '@/types';
import { useStorage } from '@/composables/useStorage';
import { useChat } from '@/composables/useChat';
import { useTheme } from '@/composables/useTheme';
import MessageBubble from './MessageBubble.vue';
import InputArea from './InputArea.vue';

const emit = defineEmits<{
  openSettings: [];
}>();

// 获取存储和聊天相关的组合式函数
const { conversations, currentConversationId, getCurrentConversation } = useStorage();
const { isLoading, loadingConversationId, error, sendMessage } = useChat();
const { settings, toggleTheme } = useTheme();

// 当前会话是否正在加载（仅在加载的会话ID与当前会话ID一致时为true）
const isCurrentConversationLoading = computed(() => {
  return loadingConversationId.value === currentConversationId.value;
});

// 消息容器引用，用于滚动到底部
const messagesContainer = ref<HTMLElement | null>(null);
const showError = ref(false);
const inputText = ref(''); // 输入框内容状态

// 直接从当前会话获取消息（使用计算属性）
const messages = computed<Message[]>(() => {
  const conv = getCurrentConversation();
  return conv?.messages || [];
});

// 获取当前会话标题
const currentTitle = computed(() => {
  const conv = getCurrentConversation();
  return conv?.title || '新对话';
});

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

// 监听会话切换，清空输入框
watch(currentConversationId, () => {
  inputText.value = '';
});

// 滚动到底部函数
const scrollToBottom = (): void => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 发送消息处理
const handleSend = (content: string): void => {
  showError.value = false;
  inputText.value = ''; // 发送后清空输入框
  sendMessage(content);
};

// 监听错误，显示错误提示
watch(error, (err) => {
  if (err) {
    showError.value = true;
    setTimeout(() => {
      showError.value = false;
    }, 5000);
  }
});

// 确保有默认会话
if (!currentConversationId.value && conversations.value.length === 0) {
  // 如果没有会话，创建一个默认会话
  const newConv = {
    id: `conv-${Date.now()}`,
    title: '新对话',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  conversations.value.unshift(newConv);
  currentConversationId.value = newConv.id;
}
</script>

<template>
  <div class="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
        {{ currentTitle }}
      </h2>
      <div class="flex items-center gap-2">
        <!-- 主题切换按钮 -->
        <button
          class="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          @click="toggleTheme"
          :title="settings.theme === 'light' ? '切换深色模式' : '切换浅色模式'"
        >
          <Moon v-if="settings.theme === 'light'" :size="20" class="text-gray-600" />
          <Sun v-else :size="20" class="text-yellow-400" />
        </button>
        <!-- 设置按钮 -->
        <button
          class="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          @click="emit('openSettings')"
          title="设置"
        >
          <Settings :size="20" class="text-gray-600" />
        </button>
      </div>
    </div>
    
    <!-- 消息容器 -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-6 py-4"
    >
      <!-- 空状态提示 -->
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
        <div class="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
          <span class="text-4xl">🤖</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">欢迎使用 ChatFlow</h3>
        <p class="text-center max-w-md">
          开始与AI助手对话吧！请先在设置中配置您的API密钥。
        </p>
      </div>
      
      <!-- 消息列表 -->
      <template v-else>
        <MessageBubble
          v-for="(msg, index) in messages"
          :key="msg.id"
          :message="msg"
          :is-loading="isCurrentConversationLoading && index === messages.length - 1 && msg.role === 'assistant'"
        />
      </template>
      
      <!-- 加载状态：仅在当前会话正在等待AI响应时显示 -->
      <div 
        v-if="isCurrentConversationLoading && messages.length > 0"
        class="flex items-center justify-center py-4"
      >
        <div class="flex items-center gap-2 text-gray-500">
          <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span>AI正在思考...</span>
        </div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="showError" class="px-6 py-3 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
      <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
    </div>
    
    <!-- 输入区域 -->
    <InputArea 
      v-model="inputText"
      :disabled="isLoading" 
      @send="handleSend" 
    />
  </div>
</template>
