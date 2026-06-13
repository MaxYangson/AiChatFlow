import { ref, watch, onMounted } from 'vue';
import { getSettings, saveSettings } from '@/utils/api';
import type { Settings } from '@/types';

export function useTheme() {
  const settings = ref<Settings>(getSettings());

  const toggleTheme = (): void => {
    settings.value.theme = settings.value.theme === 'light' ? 'dark' : 'light';
    saveSettings(settings.value);
    updateHtmlClass();
  };

  const updateFontSize = (size: 'small' | 'medium' | 'large'): void => {
    settings.value.fontSize = size;
    saveSettings(settings.value);
    updateFontSizeClass();
  };

  const updateSettings = (newSettings: Partial<Settings>): void => {
    settings.value = { ...settings.value, ...newSettings };
    saveSettings(settings.value);
    updateHtmlClass();
    updateFontSizeClass();
  };

  const updateHtmlClass = (): void => {
    const html = document.documentElement;
    if (settings.value.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  const updateFontSizeClass = (): void => {
    const html = document.documentElement;
    html.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (settings.value.fontSize) {
      case 'small':
        html.classList.add('text-sm');
        break;
      case 'large':
        html.classList.add('text-lg');
        break;
      default:
        html.classList.add('text-base');
    }
  };

  watch(() => settings.value.theme, () => {
    updateHtmlClass();
  });

  watch(() => settings.value.fontSize, () => {
    updateFontSizeClass();
  });

  onMounted(() => {
    updateHtmlClass();
    updateFontSizeClass();
  });

  return {
    settings,
    toggleTheme,
    updateFontSize,
    updateSettings
  };
}
