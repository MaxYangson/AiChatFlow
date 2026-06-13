<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessageSquarePlus, Search, Trash2, X, AlertTriangle } from 'lucide-vue-next';
import { useStorage } from '@/composables/useStorage';

const { 
  conversations, 
  currentConversationId, 
  createConversation, 
  setCurrentConversation, 
  deleteConversation,
  deleteAllConversations 
} = useStorage();

const searchQuery = ref('');
const showDeleteAllConfirm = ref(false);
const deletingConversationId = ref<string | null>(null);
const deletingConversationTitle = computed(() => {
  if (!deletingConversationId.value) return '';
  const conv = conversations.value.find(c => c.id === deletingConversationId.value);
  return conv?.title || '未知对话';
});

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return conversations.value;
  const query = searchQuery.value.toLowerCase();
  return conversations.value.filter(c => 
    c.title.toLowerCase().includes(query) ||
    c.messages.some(m => m.content.toLowerCase().includes(query))
  );
});

const handleNewConversation = (): void => {
  createConversation();
};

const handleSelectConversation = (id: string): void => {
  setCurrentConversation(id);
};

const handleDeleteClick = (id: string): void => {
  deletingConversationId.value = id;
};

const handleConfirmDelete = (): void => {
  if (deletingConversationId.value) {
    deleteConversation(deletingConversationId.value);
    deletingConversationId.value = null;
  }
};

const handleCancelDelete = (): void => {
  deletingConversationId.value = null;
};

const handleDeleteAll = (): void => {
  deleteAllConversations();
  showDeleteAllConfirm.value = false;
};
</script>

<template>
  <div class="w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold text-gray-800 dark:text-white">ChatFlow</h1>
        <button
          class="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="删除全部对话"
          @click="showDeleteAllConfirm = true"
        >
          <Trash2 :size="18" class="text-gray-500" />
        </button>
      </div>
      
      <button
        class="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-colors"
        @click="handleNewConversation"
      >
        <MessageSquarePlus :size="20" />
        新对话
      </button>
      
      <div class="relative mt-4">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索对话..."
          class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white placeholder-gray-400"
        />
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="conv in filteredConversations"
        :key="conv.id"
        class="p-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800"
        :class="[
          currentConversationId === conv.id 
            ? 'bg-primary-50 dark:bg-gray-800' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        ]"
        @click="handleSelectConversation(conv.id)"
      >
        <div class="flex items-start justify-between">
          <h3 class="font-medium text-gray-800 dark:text-white truncate flex-1 mr-2">
            {{ conv.title }}
          </h3>
          <button
            class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors group/btn flex-shrink-0"
            title="删除此对话"
            @click.stop="handleDeleteClick(conv.id)"
          >
            <X :size="14" class="text-gray-400 group-hover/btn:text-red-500 transition-colors" />
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-1 truncate">
          {{ conv.messages[0]?.content || '暂无消息' }}
        </p>
        <p class="text-xs text-gray-400 mt-1">
          {{ new Date(conv.updatedAt).toLocaleString('zh-CN') }}
        </p>
      </div>
      
      <div v-if="filteredConversations.length === 0" class="flex flex-col items-center justify-center h-40 text-gray-400">
        <MessageSquarePlus :size="40" class="mb-2 opacity-50" />
        <p>暂无对话</p>
        <button
          class="mt-2 text-primary-500 hover:text-primary-600 text-sm"
          @click="handleNewConversation"
        >
          创建新对话
        </button>
      </div>
    </div>
  </div>
  
  <Teleport to="body">
    <!-- 删除全部对话确认弹窗 -->
    <div 
      v-if="showDeleteAllConfirm" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDeleteAllConfirm = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-xl">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle :size="20" class="text-red-500" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">删除全部对话</h3>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-4">确定要删除所有对话吗？此操作不可撤销。</p>
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
            @click="showDeleteAllConfirm = false"
          >
            取消
          </button>
          <button
            class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            @click="handleDeleteAll"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>

    <!-- 删除单个对话确认弹窗 -->
    <div 
      v-if="deletingConversationId" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="handleCancelDelete"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-xl">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle :size="20" class="text-red-500" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">删除对话</h3>
          </div>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          确定要删除 <span class="font-medium text-gray-800 dark:text-white">「{{ deletingConversationTitle }}」</span> 吗？删除后无法恢复。
        </p>
        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
            @click="handleCancelDelete"
          >
            取消
          </button>
          <button
            class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            @click="handleConfirmDelete"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
