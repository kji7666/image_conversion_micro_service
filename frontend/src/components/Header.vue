<template>
    <header class="app-header">
      <!-- 可以在這裡放 Logo 或其他元素 -->
      <div class="logo">
        <img src="../assets/image/logo.png" alt="網站 Logo" class="logo-img" />
        <h1 class="logo-text">mosaic</h1>
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
    { name: 'Guide', path: '/' },
    { name: 'Use now', path: '/hot-songs' },
    { name: 'NFT', path: '/hot-songs' },
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
    /* --- 添加粘性定位 --- */
    position: sticky; /* 設置為粘性定位 */
    top: 0;         /* 當滾動到距離頂部 0px 時觸發固定 */
    z-index: 1000;  /* 確保在頂層 */
    display: flex; /* 使用 Flexbox 佈局 */
    padding: 0 20px; /* 左右內邊距 */
    height: 70px; /* 固定高度 */

    background-color: #ffffff; /* 背景色 */
    border-bottom: 1px solid #e0e0e0; /* 底部邊框 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 輕微陰影 */
  }

  .logo-text {
    padding-left: 80px;
    margin-top: 10px;
    color:#848484
  }
  
  .logo-container {
    /* 這個容器是定位基準，需要設置 position (非 static) */
    /* position: relative; */
    width: 200px; /* 假設容器本身有個大小 */
    height: 200px;
    border: 1px dashed red; /* 為了方便觀察容器邊界 */
    /* overflow: hidden; */ /* 注意：如果設置了 hidden，超出部分會被隱藏 */
    overflow: visible; /* 確保超出部分可見 (預設值) */
    flex-shrink: 0
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 40px; /* Logo 和導航之間的間距 */
    color: #333;
  }

  .logo-img {
    /* 1. 設置絕對定位 */
    position: absolute;

    /* 2. 控制圖片自身大小 */
    width: 120px; /* 設置比容器寬 */
    height: auto; /* 高度自適應，保持比例 */
    max-width: none; 
    /* 或者 height: 80px; */

    /* 3. 控制圖片位置 (相對於 .logo-container) */
    /* 範例：將圖片左上角定位在容器左上角之外 */
    top: -20px; /* 向上移動 20px */
    left: 0px; /* 向左移動 30px */

    /* 範例：將圖片中心點對齊容器中心點 */
    /* top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); */

    /* 範例：圖片右下角對齊容器右下角，並向外偏移 */
    /* bottom: -10px;
    right: -10px; */

    /* 確保圖片在需要時可以顯示在其他內容之上 */
    z-index: 10;
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


  </style>