<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import ChatPanel from '@/components/ChatPanel.vue';
import SettingsPanel from '@/components/SettingsPanel.vue';

const showSettings = ref(false);
</script>

<template>
  <div class="h-screen flex bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
    <Sidebar />
    <ChatPanel @open-settings="showSettings = true" />
    <SettingsPanel 
      :visible="showSettings" 
      @close="showSettings = false" 
    />
  </div>
</template>
