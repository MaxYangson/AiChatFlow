import { ref, watch } from 'vue';
import type { Conversation } from '@/types';

const STORAGE_KEY = 'chatflow_conversations';

/**
 * 从localStorage加载会话列表
 */
function loadConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * 保存会话列表到localStorage
 */
function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

// 单例状态 - 确保所有组件共享同一套状态
const conversations = ref<Conversation[]>(loadConversations());
const currentConversationId = ref<string | null>(null);

// 监听会话列表变化，自动保存到localStorage
watch(conversations, (newVal) => {
  saveConversations(newVal);
}, { deep: true });

/**
 * 创建新会话
 * @returns 新创建的会话对象
 */
function createConversation(): Conversation {
  const now = Date.now();
  const conversation: Conversation = {
    id: `conv-${now}`,
    title: '新对话',
    messages: [],
    createdAt: now,
    updatedAt: now
  };
  conversations.value.unshift(conversation);
  currentConversationId.value = conversation.id;
  return conversation;
}

/**
 * 根据ID获取会话
 * @param id 会话ID
 * @returns 会话对象或undefined
 */
function getConversation(id: string): Conversation | undefined {
  return conversations.value.find(c => c.id === id);
}

/**
 * 更新会话
 * @param id 会话ID
 * @param updates 要更新的字段
 */
function updateConversation(id: string, updates: Partial<Conversation>): void {
  const index = conversations.value.findIndex(c => c.id === id);
  if (index !== -1) {
    conversations.value[index] = { ...conversations.value[index], ...updates, updatedAt: Date.now() };
  }
}

/**
 * 删除会话
 * @param id 会话ID
 */
function deleteConversation(id: string): void {
  const index = conversations.value.findIndex(c => c.id === id);
  if (index !== -1) {
    conversations.value.splice(index, 1);
    if (currentConversationId.value === id) {
      currentConversationId.value = conversations.value[0]?.id || null;
    }
  }
}

/**
 * 删除所有会话
 */
function deleteAllConversations(): void {
  conversations.value = [];
  currentConversationId.value = null;
}

/**
 * 获取当前会话
 * @returns 当前会话对象或undefined
 */
function getCurrentConversation(): Conversation | undefined {
  if (!currentConversationId.value) return undefined;
  return getConversation(currentConversationId.value);
}

/**
 * 设置当前会话
 * @param id 会话ID或null
 */
function setCurrentConversation(id: string | null): void {
  currentConversationId.value = id;
}

// 初始化：如果有会话但没有当前会话ID，设置第一个会话为当前会话
if (conversations.value.length > 0 && !currentConversationId.value) {
  currentConversationId.value = conversations.value[0].id;
}

/**
 * 存储管理组合式函数（单例模式）
 * 所有组件调用此函数都会共享同一套状态
 */
export function useStorage() {
  return {
    conversations,
    currentConversationId,
    createConversation,
    getConversation,
    updateConversation,
    deleteConversation,
    deleteAllConversations,
    getCurrentConversation,
    setCurrentConversation
  };
}
