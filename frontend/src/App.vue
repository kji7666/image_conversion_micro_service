<!--版面配置-->
<template>
  <div class="app">
    <Header />
    <HomeView />
    <!-- <FloatImage />
    <ParallaxContainer /> -->
  </div>
</template>

<script setup>
import HomeView from './views/HomeView.vue';
import Header from './components/Header.vue';
import ParallaxContainer from './components/ParallaxContainer.vue';

// 在 main.js 或 App.vue 的 <script setup> 中
import { onMounted, onUnmounted, nextTick } from 'vue';
import router from './router'; // 引入你的 router
import { initScrollObserver, observeElements, disconnectObserver } from './utils/intersectionObserver';

onMounted(() => {
  initScrollObserver();
  // 初始頁面加載後觀察一次
  nextTick(() => { // 確保 DOM 渲染完成
     observeElements();
  });

  // 監聽路由變化，在新頁面加載後重新觀察
  router.afterEach((to, from) => {
      nextTick(() => { // 確保新頁面 DOM 渲染完成
          observeElements();
      });
  });
});

onUnmounted(() => {
  disconnectObserver();
});
</script>


<!--用來 讓這個 .vue 檔案內的 CSS 樣式「只作用在這個元件內」-->
<style scoped> 

.app {
  display: flex;
  height: 100vw;
  width: 100vw; /*viewport : 大小將會等於是百分之百的「視窗」寬度*/
  flex-direction: column;
  /*border: 2px solid red;*/ /* 加入邊框標註範圍 */
}

</style>


<style>
html, body, #app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>

