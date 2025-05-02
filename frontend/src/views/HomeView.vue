<template>
  <div class="homepage">
    <!-- 1. 添加背景元素 -->
    <div class="fixed-background"></div>

    <!-- 保持現有內容結構 -->
    <div class="spacer top">向下滾動查看效果 👇</div>

    <ScrollingImageSection />

    <div class="spacer bottom">繼續滾動或向上滾動 👆</div>
  </div>
</template>

<script setup lang="ts">
import ScrollingImageSection from '../components/ScrollingImageSection.vue'; // 調整路徑
</script>

<style scoped lang="scss">
.homepage {
  // **重要:** 需要設置 position: relative (或其他非 static 的值)
  // 以便 .fixed-background 的 z-index:-1 相對於它生效，
  // 確保背景在 .homepage 的內容之後，而不是在整個 body 之後。
  // 如果不設置，z-index:-1 可能會讓背景跑到 body 的所有內容之後，
  // 甚至可能看不見（取決於瀏覽器和父級樣式）。
  position: relative;
  // 可選：如果希望內容區域有最小高度確保背景可見
  // min-height: 100vh;
  // 注意：這裡的 overflow: hidden; 不是必需的，除非你想限制 homepage 內容不超出範圍
}

/* 2. 定義背景元素的樣式 */
.fixed-background {
  position: fixed; /* 固定定位，相對於 viewport */
  top: 0;
  left: 0;
  width: 100vw; /* 寬度等於視窗寬度 */
  height: 100vh; /* 高度等於視窗高度 */
  z-index: -1; /* **關鍵:** 將其層級設為負數，放到普通內容的後面 */

  /* --- 背景圖片設置 --- */
  /* 將 'your-background-image.jpg' 替換成你的圖片路徑 */
  /* 建議將圖片放在 /public 文件夾下，這樣可以直接用 / 根路徑訪問 */
  background-image: url('../assets/image/background.png');

  /* 確保背景圖片覆蓋整個區域 */
  background-size: cover;

  /* 將背景圖片置中顯示 */
  background-position: center center;

  /* 背景圖片不重複 */
  background-repeat: no-repeat;

  /* 可選：如果圖片較亮，可以加一個半透明的深色疊加層，讓前景文字更易讀 */
  /*
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3); // 30% 透明度的黑色疊加層
    z-index: 1; // 疊加層在背景圖之上
  }
  */
}

/* 現有的 spacer 樣式保持不變 */
.spacer {
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  // **修改:** 讓文字在背景上更清晰可見
  color: #ffffff; /* 改為白色或其他對比度高的顏色 */
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6); /* 添加文字陰影 */
  text-align: center;
  // **移除背景色，讓固定背景透出來**
  // background-color: #f0f0f0; // 移除或註釋掉
  position: relative; // 確保文字在背景之上 (如果背景有 ::after 疊加層)
  z-index: 2;       // 確保 spacer 內容在背景之上
}
</style>