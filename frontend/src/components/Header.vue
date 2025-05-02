<template>
    <header class="app-header">
      <!-- 可以在這裡放 Logo 或其他元素 -->
      <div class="logo">
        <img src="../assets/image/gaki.jpg" alt="網站 Logo" class="logo-img" />
      </div>
  
      <!-- 使用 HeaderNav 子元件 -->
      <HeaderNav
        :styleList="navigationItems"
        :activeName="currentActiveNav"
        @click="handleNavigation"
      />
  
      <!-- 可以在這裡放用戶資訊或其他元素 -->
      <!-- <div class="user-actions">
        <span>用戶操作區</span>
      </div> -->
  
      <!-- (僅為演示) 顯示當前活動項目的名稱 -->
      <!-- <div style="clear: both; padding-top: 10px; color: #666;">
        當前活動項目: {{ currentActiveNav }}
      </div> -->
    </header>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  // 假設 HeaderNav.vue 與 Header.vue 在同一個目錄下
  // 如果不是，請調整相對路徑
  import HeaderNav from './HeaderNav.vue';
  // 如果需要實際路由跳轉，取消下面這行的註解
  // import { useRouter } from 'vue-router';
  
  // --- State ---
  
  // 導航項目的資料列表，傳給 HeaderNav 的 styleList prop
  const navigationItems = ref([
    { name: '首頁', path: '/' },
    { name: '熱門歌曲', path: '/hot-songs' },
    { name: '最新專輯', path: '/latest-albums' },
    { name: '歌手列表', path: '/artists' },
    { name: '排行榜', path: '/rankings' },
  ]);
  
  // 當前活動的導航項目名稱，傳給 HeaderNav 的 activeName prop
  // 初始化為列表中的第一個項目，或一個預設值
  const currentActiveNav = ref(navigationItems.value[0]?.name || '首頁');
  
  // 如果需要實際路由跳轉，取消下面這行的註解
  // const router = useRouter();
  
  // --- Methods ---
  
  /**
   * 處理從 HeaderNav 子元件發出的 click 事件
   * @param name 被點擊項目的名稱
   * @param path 被點擊項目的路徑
   */
  function handleNavigation(name: string, path: string) {
    console.log(`Header 元件收到點擊事件: Name = ${name}, Path = ${path}`);
  
    // 1. 更新當前活動項目的狀態，觸發 HeaderNav 的高亮更新
    currentActiveNav.value = name;
  
    // 2. (可選) 執行實際的頁面導航
    // 例如使用 Vue Router:
    // router.push(path);
    // 或是其他導航邏輯
  
    // 為了演示，這裡用 alert
    alert(`準備導航到: ${name} (路徑: ${path})`);
  }
  
  </script>
  
  <style scoped>
  .app-header {
    display: flex; /* 使用 Flexbox 佈局 */
    padding: 0 20px; /* 左右內邊距 */
    height: 60px; /* 固定高度 */
    background-color: #ffffff; /* 背景色 */
    border-bottom: 1px solid #e0e0e0; /* 底部邊框 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 輕微陰影 */
  }
  
  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 40px; /* Logo 和導航之間的間距 */
    color: #333;
  }
  
  /* 讓 HeaderNav 元件佔據可用空間 */
  .app-header > :deep(.header-nav) { /* 使用 :deep() 選擇子元件的根元素 */
    flex-grow: 1; /* 允許導航區域伸展 */
  }
  
  /* .user-actions {
    margin-left: auto;
    color: #555;
  } 
  */
  
  /* 清除浮動和演示文字的樣式 (如果不需要演示可以移除) */
  div[style*="clear: both"] {
      background-color: #f0f0f0;
      padding: 10px;
      margin-top: 10px;
      border-radius: 4px;
  }

  .logo-img {
    height: 100px;         /* 設定固定高度 */
    width: auto;          /* 寬度自動計算，保持比例 */
    object-fit: contain;  /* 確保圖片不被裁切或拉扯變形 */
  }



  </style>