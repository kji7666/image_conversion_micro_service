<template>
    <!-- 導覽列區塊 -->
    <nav class="menu">
      <ul>
        <!-- 使用 v-for 動態產生每一個選單項目 -->
        <li v-for="(item, index) in menuItems" :key="index">
          {{ item }}
        </li>
      </ul>
    </nav>
  </template>
  
  <script setup>
  import { ref } from 'vue' // 引入 ref 讓資料變成響應式
  
  // 定義一個響應式陣列，存放選單的項目
  const menuItems = ref([
    '首頁',
    '關於',
    '聯絡我們'
  ])
  </script>
  
  <style scoped>
  /* 導覽列外框設定 */
  .menu {
    width: 100%; /* 撐滿整個頁面寬度 */
    background-color: #4caf50; /* 綠色背景 */
    color: white; /* 文字顏色是白色 */
    padding: 10px; /* 上下內距 10px */
    position: sticky; /* sticky 固定在頂部 */
    top: 0;
  }
  
  /* 列表設定 */
  .menu ul {
    display: flex;
    justify-content: center;
    list-style: none;
    gap: 20px;
  }
  </style>
  