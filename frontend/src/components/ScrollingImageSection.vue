<template>
    <!-- sectionRef 仍然可以作為一個大的滾動區域參考，但觸發器將是 imageContainerRef -->
    <section ref="sectionRef" class="scrolling-image-section">
      <!-- imageContainerRef 現在同時是觸發器 (trigger) 和動畫目標 (target) -->
      <div ref="imageContainerRef" class="image-container">
        <img
          v-if="!uploadedImageUrl"
          src="../assets/image/head_bottle_non_background.png"
          alt="初始滾動圖片"
          class="scrolling-image initial-image"
        />
        <img
          v-if="uploadedImageUrl"
          :src="uploadedImageUrl"
          alt="上傳的圖片"
          class="scrolling-image uploaded-image"
        />
      </div>
      <div class="upload-block-wrapper">
        <UploadBlock @upload-success="handleUploadSuccess" />
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import UploadBlock from './UploadBlock.vue';
  
  gsap.registerPlugin(ScrollTrigger);
  
  const sectionRef = ref<HTMLElement | null>(null);          // 整體區塊參考 (可選)
  const imageContainerRef = ref<HTMLElement | null>(null); // 圖片容器參考 (觸發器+目標)
  const uploadedImageUrl = ref<string | null>(null);
  let st: ScrollTrigger | null = null;
  
  function handleUploadSuccess(imageUrl: string) {
    console.log('ScrollingImageSection 收到圖片 URL:', imageUrl);
    uploadedImageUrl.value = imageUrl;
    // 不需要特別刷新，ScrollTrigger 會處理
  }
  
  onMounted(() => {
    // --- 等待 DOM 和圖片可能的加載 ---
    // 使用 setTimeout 或 nextTick 確保元素尺寸已確定
    // 或者更好的方式是使用 imagesLoaded 庫，但這裡用簡單的 setTimeout
    setTimeout(() => {
      if (!imageContainerRef.value) {
        console.error('缺少圖片容器元素引用');
        return;
      }
  
      console.log('Image Container Ref:', imageContainerRef.value);
  
      // --- 配置 GSAP ScrollTrigger 動畫 ---
      st = ScrollTrigger.create({
        // --- 修改 trigger ---
        // 將觸發器設置為圖片容器本身
        trigger: imageContainerRef.value,
        // --- trigger 修改結束 ---
  
        animation: gsap.fromTo(
          imageContainerRef.value, // 動畫目標也是圖片容器
          { xPercent: 100 },      // 起始狀態：完全在右側畫面外
          { xPercent: -100 }      // 結束狀態：完全移到左側畫面外
        ),
  
        // --- 修改 start 和 end ---
        // start: "top bottom"
        // 意義：當 `trigger` (imageContainer) 的頂部 (top) 觸碰到視窗的底部 (bottom) 時，動畫開始 (進度 0%)
        start: "top bottom",
  
        // end: "bottom top"
        // 意義：當 `trigger` (imageContainer) 的底部 (bottom) 觸碰到視窗的頂部 (top) 時，動畫結束 (進度 100%)
        end: "bottom top",
        // --- start 和 end 修改結束 ---
  
        // --- 修改 scrub ---
        // scrub: true
        // 意義：動畫進度與滾動條在 start 和 end 之間的進度完全同步 (1:1 映射)
        // 這樣確保了圖片剛好完全離開視窗時，動畫也剛好到達 xPercent: -100
        scrub: true, // 使用 true 實現精確同步
        // 如果仍想要一點平滑感，可以用數字，但可能會稍微不同步
        // scrub: 0.5,
        // --- scrub 修改結束 ---
  
        markers: import.meta.env.DEV, // 開發時顯示標記，方便調試 start/end 位置
        invalidateOnRefresh: true,    // 視窗大小改變時重新計算
        // anticipatePin: 1, // 可選：稍微提前計算 Pinning，有時可改善跳動感 (此處沒用到 Pin)
      });
  
      console.log('ScrollTrigger 初始化完成 (精確可見性同步)');
  
    }, 100); // 短暫延遲確保元素渲染完成 (根據情況調整或改用更可靠方法)
  
  });
  
  onUnmounted(() => {
    if (st) {
      console.log('銷毀 ScrollTrigger 實例');
      st.kill();
      st = null;
    }
    // 如果 imageContainerRef 可能因為 v-if 銷毀，最好也清理動畫
    if (imageContainerRef.value) {
        gsap.killTweensOf(imageContainerRef.value);
    }
  });
  
  </script>
  
  <style scoped lang="scss">
  /* 樣式與之前相同 */
  .scrolling-image-section {
    position: relative;
    width: 100%;
    min-height: 150vh; /* 確保有足夠滾動空間，可調整 */
    // background-color: rgba(255, 235, 59, 0.1);
    overflow-x: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .image-container {
    position: absolute; // 絕對定位使其可以自由移動
    top: 50%;
    // left: 0; // GSAP 會控制 transform
    width: 100%;       // 明確寬度
    height: 100%;      // 明確高度
    transform: translateY(-50%); // 垂直居中
    will-change: transform; // GPU 加速提示
    // border: 1px dashed red; // 方便觀察觸發器範圍
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .scrolling-image {
    display: block;
    max-width: 100%;
    max-height: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .upload-block-wrapper {
    position: relative;
    z-index: 10;
    padding: 20px;
    border-radius: 10px;
  }
  </style>