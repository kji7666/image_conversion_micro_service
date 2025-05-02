<!--版面配置-->
<template>
  <div class="app">
    <Header />
    <HomeView />
  </div>
</template>

<script setup>
import HomeView from './views/HomeView.vue'
import Header from './components/Header.vue'
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

