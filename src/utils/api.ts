import type { Settings } from '@/types';

/**
 * 默认设置配置
 * 使用智谱AI（GLM）作为默认API提供商
 */
const defaultSettings: Settings = {
  apiKey: '',
  apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  model: 'glm-4-flash',  // 智谱AI免费模型，速度快
  theme: 'light',
  fontSize: 'medium'
};

/**
 * 从localStorage获取用户设置
 * 如果不存在则返回默认设置
 * @returns 用户设置对象
 */
export function getSettings(): Settings {
  try {
    const stored = localStorage.getItem('chatflow_settings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

/**
 * 保存用户设置到localStorage
 * @param settings 要保存的设置对象
 */
export function saveSettings(settings: Settings): void {
  localStorage.setItem('chatflow_settings', JSON.stringify(settings));
}

/**
 * 调用智谱AI大模型API获取聊天响应
 * 支持流式输出，实时返回token
 * 
 * 智谱AI API说明：
 * - 基础URL: https://open.bigmodel.cn/api/paas/v4/chat/completions
 * - 认证方式: Bearer Token（API Key）
 * - 流式响应格式: SSE (Server-Sent Events)
 * - 响应格式示例: data: {"id":"xxx","object":"chat.completion.chunk","created":xxx,"model":"glm-4-flash","choices":[{"index":0,"delta":{"role":"assistant","content":"你"},"finish_reason":null}]}
 * 
 * @param messages 对话历史消息数组
 * @param onToken 每次收到token时的回调函数
 * @param onComplete 响应完成时的回调函数
 * @param onError 发生错误时的回调函数
 */
export async function fetchChatResponse(
  messages: Array<{ role: string; content: string }>,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  const settings = getSettings();
  
  // 验证API密钥是否配置
  if (!settings.apiKey) {
    onError('请先配置API密钥');
    return;
  }

  // 构建智谱AI API请求体
  const requestBody = {
    messages,
    model: settings.model,
    stream: true,           // 启用流式输出
    max_tokens: 4096,       // 最大输出token数
    temperature: 0.7        // 温度参数，控制随机性
  };

  console.log('[API] 准备发送请求:', {
    url: settings.apiBaseUrl,
    model: settings.model,
    messageCount: messages.length,
    lastMessage: messages[messages.length - 1]?.content?.slice(0, 50) + '...'
  });

  try {
    // 发送POST请求到智谱AI API
    const response = await fetch(settings.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`  // JWT认证
      },
      body: JSON.stringify(requestBody)
    });

    console.log('[API] 收到响应:', {
      status: response.status,
      statusText: response.statusText
    });

    // 处理HTTP错误响应
    if (!response.ok) {
      let errorMessage = `API请求失败 (${response.status})`;
      try {
        const errorData = await response.json();
        // 智谱AI错误格式：{ error: { message: "..." } } 或 { code, msg }
        errorMessage = errorData.error?.message || errorData.msg || errorMessage;
        console.error('[API] 错误响应数据:', errorData);
      } catch (e) {
        // 如果不是JSON格式的错误响应
        const text = await response.text();
        errorMessage = text || errorMessage;
        console.error('[API] 非JSON错误响应:', text);
      }
      onError(errorMessage);
      return;
    }

    // 获取响应流读取器
    const reader = response.body?.getReader();
    if (!reader) {
      onError('无法读取响应流');
      return;
    }

    // 创建文本解码器
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let receivedAnyData = false;
    let finishReason: string | null = null;

    // 循环读取流数据
    while (true) {
      let result;
      try {
        result = await reader.read();
      } catch (e) {
        console.error('[API] 读取流数据失败:', e);
        // 流读取失败但已有数据，尝试完成处理
        if (receivedAnyData) {
          console.log('[API] 流读取异常但已有数据，尝试完成');
          onComplete();
          return;
        }
        onError('读取响应流时发生错误');
        return;
      }

      const { done, value } = result;
      
      if (done) {
        console.log('[API] 流读取完成，是否收到数据:', receivedAnyData, '结束原因:', finishReason);
        // 流结束时，如果已有数据则正常完成
        if (receivedAnyData) {
          onComplete();
        } else {
          onError('未收到任何响应数据');
        }
        return;
      }

      receivedAnyData = true;
      
      // 解码新数据并添加到缓冲区
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      console.debug('[API] 收到数据块:', chunk.length, '字符');
      
      // 按行分割数据
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';  // 保留不完整的行

      // 处理每一行数据
      for (const line of lines) {
        // 跳过空行
        if (!line.trim()) continue;
        
        // SSE格式：data: {json}
        if (line.startsWith('data: ')) {
          const data = line.slice(6);  // 提取JSON部分
          
          console.debug('[API] SSE数据:', data.length > 100 ? data.slice(0, 100) + '...' : data);
          
          // 检查是否为结束标记（智谱AI可能不返回[DONE]）
          if (data === '[DONE]') {
            console.log('[API] 收到结束标记');
            onComplete();
            return;
          }
          
          try {
            const json = JSON.parse(data);
            
            // 检查是否有结束原因
            if (json.choices?.[0]?.finish_reason) {
              finishReason = json.choices[0].finish_reason;
              console.log('[API] 收到结束原因:', finishReason);
            }
            
            // 智谱AI流式响应格式：choices[0].delta.content
            const token = json.choices?.[0]?.delta?.content || '';
            if (token) {
              console.debug('[API] 收到Token:', token);
              onToken(token);
            }
            
            // 如果有结束原因且不是null，说明响应结束
            if (finishReason && finishReason !== 'null') {
              console.log('[API] 根据finish_reason结束');
              onComplete();
              return;
            }
          } catch (e) {
            // JSON解析失败，尝试其他格式
            console.warn('[API] JSON解析失败:', e);
            // 尝试直接提取内容
            try {
              // 尝试匹配 content 字段
              const contentMatch = data.match(/"content":\s*"([^"]+)"/);
              if (contentMatch) {
                console.debug('[API] 正则匹配提取内容:', contentMatch[1]);
                onToken(contentMatch[1]);
              }
            } catch (parseErr) {
              console.warn('[API] 正则解析也失败:', parseErr);
            }
          }
        }
      }
    }
  } catch (error) {
    // 处理网络或其他异常
    const errorMsg = error instanceof Error ? error.message : '网络请求失败';
    console.error('[API] 请求异常:', error);
    onError(errorMsg);
  }
}
