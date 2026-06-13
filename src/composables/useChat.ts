import { ref, computed } from 'vue';
import type { Message } from '@/types';
import { fetchChatResponse } from '@/utils/api';
import { useStorage } from './useStorage';

/**
 * 聊天逻辑组合式函数
 * 提供发送消息、管理对话状态等核心聊天功能
 */
export function useChat() {
  // 从useStorage获取会话管理相关方法
  const { getCurrentConversation, createConversation, conversations } = useStorage();
  
  // 正在加载的会话ID（null表示没有会话在加载）
  const loadingConversationId = ref<string | null>(null);
  
  // 是否有任何会话正在加载（用于禁用输入框等全局控制）
  const isLoading = computed(() => loadingConversationId.value !== null);
  
  // 错误信息：存储API调用过程中的错误
  const error = ref('');

  /**
   * 生成唯一消息ID
   * 使用时间戳+随机字符串确保唯一性
   * @returns 唯一的消息ID字符串
   */
  const generateId = (): string => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * 根据消息内容生成会话标题
   * 如果内容超过30字符则截断并添加省略号
   * @param content 用户输入的内容
   * @returns 格式化后的会话标题
   */
  const generateTitle = (content: string): string => {
    const trimmed = content.trim();
    if (trimmed.length <= 30) return trimmed;
    return trimmed.substring(0, 30) + '...';
  };

  /**
   * 发送消息到AI并处理响应
   * 支持流式响应，实时更新消息内容
   * @param content 用户输入的消息内容
   */
  const sendMessage = async (content: string): Promise<void> => {
    // 验证输入：空内容或已有会话正在加载时不发送
    if (!content.trim() || loadingConversationId.value) return;

    // 重置错误状态
    error.value = '';

    // 获取当前会话，如果不存在则创建新会话
    let conversation = getCurrentConversation();
    if (!conversation) {
      conversation = createConversation();
    }

    // 设置加载状态：记录哪个会话正在等待响应
    loadingConversationId.value = conversation.id;

    // 创建用户消息对象
    const userMessage: Message = {
      id: generateId(),           // 生成唯一ID
      role: 'user',              // 角色标识为用户
      content: content.trim(),    // 去除首尾空格
      timestamp: Date.now()       // 记录发送时间
    };

    // 将用户消息添加到会话（使用响应式数组操作）
    conversation.messages.push(userMessage);
    
    // 如果是新会话，根据第一条消息生成标题
    if (conversation.title === '新对话') {
      conversation.title = generateTitle(content);
    }

    // 创建AI回复消息对象（初始内容为空，用于流式更新）
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',               // 初始为空，后续流式填充
      timestamp: Date.now()
    };

    // 将AI消息添加到会话
    conversation.messages.push(assistantMessage);

    // 立即更新响应式状态
    const convIndex = conversations.value.findIndex(c => c.id === conversation.id);
    if (convIndex !== -1) {
      // 创建新对象以触发响应式更新
      conversations.value[convIndex] = { ...conversation };
    }

    // 构建历史消息列表（排除刚创建的空AI消息）
    const history = conversation.messages.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // 记录AI消息在数组中的索引，用于更新
    const assistantMsgIndex = conversation.messages.length - 1;

    try {
      // 调用API获取AI响应（流式）
      await fetchChatResponse(
        history,
        // 流式token回调：每次收到token时更新消息内容
        (token) => {
          // 使用响应式方式更新：创建新消息对象触发更新
          const conv = conversations.value.find(c => c.id === conversation.id);
          if (conv) {
            // 创建新消息数组，确保响应式更新
            const newMessages = [...conv.messages];
            newMessages[assistantMsgIndex] = {
              ...newMessages[assistantMsgIndex],
              content: newMessages[assistantMsgIndex].content + token
            };
            // 更新整个会话对象，确保响应式触发
            const index = conversations.value.findIndex(c => c.id === conv.id);
            if (index !== -1) {
              conversations.value[index] = { ...conv, messages: newMessages };
            }
          }
        },
        // 完成回调：请求完成后重置加载状态
        () => {
          loadingConversationId.value = null;
          // 更新会话的更新时间
          const conv = conversations.value.find(c => c.id === conversation.id);
          if (conv) {
            const index = conversations.value.findIndex(c => c.id === conv.id);
            if (index !== -1) {
              conversations.value[index] = { ...conv, updatedAt: Date.now() };
            }
          }
        },
        // 错误回调：处理API错误
        (err) => {
          loadingConversationId.value = null;
          error.value = err;
          // 更新消息显示错误内容
          const conv = conversations.value.find(c => c.id === conversation.id);
          if (conv) {
            const newMessages = [...conv.messages];
            newMessages[assistantMsgIndex] = {
              ...newMessages[assistantMsgIndex],
              content: `错误: ${err}`
            };
            const index = conversations.value.findIndex(c => c.id === conv.id);
            if (index !== -1) {
              conversations.value[index] = { ...conv, messages: newMessages };
            }
          }
        }
      );
    } catch (err) {
      // 捕获未预期的异常
      loadingConversationId.value = null;
      error.value = err instanceof Error ? err.message : '未知错误';
      // 更新消息显示错误内容
      const conv = conversations.value.find(c => c.id === conversation.id);
      if (conv) {
        const newMessages = [...conv.messages];
        newMessages[assistantMsgIndex] = {
          ...newMessages[assistantMsgIndex],
          content: `错误: ${error.value}`
        };
        const index = conversations.value.findIndex(c => c.id === conv.id);
        if (index !== -1) {
          conversations.value[index] = { ...conv, messages: newMessages };
        }
      }
    }
  };

  // 返回暴露给组件的状态和方法
  return {
    isLoading,              // 是否有任何会话在加载（用于全局控制如禁用输入）
    loadingConversationId,  // 正在加载的会话ID（用于判断当前会话是否在加载）
    error,                  // 错误信息
    sendMessage             // 发送消息方法
  };
}
