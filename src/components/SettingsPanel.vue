<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Save } from 'lucide-vue-next';
import type { Settings } from '@/types';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { settings, updateSettings } = useTheme();

const localSettings = ref<Settings>({ ...settings.value });
const saved = ref(false);

watch(() => props.visible, (visible) => {
  if (visible) {
    localSettings.value = { ...settings.value };
    saved.value = false;
  }
});

watch(localSettings, () => {
  saved.value = false;
}, { deep: true });

const handleSave = (): void => {
  updateSettings(localSettings.value);
  saved.value = true;
};

const handleClose = (): void => {
  if (!saved.value) {
    localSettings.value = { ...settings.value };
  }
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="handleClose"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">设置</h2>
          <button
            class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            @click="handleClose"
          >
            <X :size="20" class="text-gray-500" />
          </button>
        </div>
        
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API密钥
            </label>
            <input
              v-model="localSettings.apiKey"
              type="password"
              placeholder="请输入智谱AI API Key"
              class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white placeholder-gray-400"
            />
            <p class="mt-1 text-xs text-gray-500">
              从智谱AI开放平台获取：open.bigmodel.cn
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API 基础URL
            </label>
            <input
              v-model="localSettings.apiBaseUrl"
              type="text"
              placeholder="https://open.bigmodel.cn/api/paas/v4/chat/completions"
              class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white placeholder-gray-400"
            />
            <p class="mt-1 text-xs text-gray-500">
              智谱AI GLM系列模型API地址
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              模型名称
            </label>
            <input
              v-model="localSettings.model"
              type="text"
              placeholder="glm-4-flash"
              class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white placeholder-gray-400"
            />
            <p class="mt-1 text-xs text-gray-500">
              可选：glm-4-flash(免费)、glm-4、glm-4-plus
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              主题模式
            </label>
            <div class="flex gap-3">
              <button
                class="flex-1 px-4 py-2 rounded-lg border-2 transition-all"
                :class="[
                  localSettings.theme === 'light' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                ]"
                @click="localSettings.theme = 'light'"
              >
                浅色模式
              </button>
              <button
                class="flex-1 px-4 py-2 rounded-lg border-2 transition-all"
                :class="[
                  localSettings.theme === 'dark' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                ]"
                @click="localSettings.theme = 'dark'"
              >
                深色模式
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              字体大小
            </label>
            <div class="flex gap-3">
              <button
                v-for="size in ['small', 'medium', 'large'] as const"
                :key="size"
                class="flex-1 px-4 py-2 rounded-lg border-2 transition-all"
                :class="[
                  localSettings.fontSize === size 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                ]"
                @click="localSettings.fontSize = size"
              >
                {{ size === 'small' ? '小' : size === 'medium' ? '中' : '大' }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
            @click="handleClose"
          >
            取消
          </button>
          <button
            class="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            @click="handleSave"
          >
            <Save :size="16" />
            {{ saved ? '已保存' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
