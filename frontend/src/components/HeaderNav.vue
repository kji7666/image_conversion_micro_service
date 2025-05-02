<template>
    <ul class = "header-nav">
<!-- 
👉 為什麼用 <ul>？
用 <ul> 是因為我們要畫出一個「選單列」，每個選項都是列表（像：熱門、新歌、排行榜），用 <li> 搭配 <ul> 是最常見的 HTML 寫法，也方便控制樣式。  
👉 為什麼用 :class 加條件？
這是 Vue 的動態 class 語法。意思是：如果這個項目的名字是"目前選中的"，就套用 active 樣式。這樣就可以在畫面上「高亮選中項目」。
👉 為什麼用 v-for？
你不可能一行行手寫每個選單吧？用 v-for 可以根據傳進來的 styleList 陣列"動態"產生幾個 <li>，這樣元件才通用、彈性。
👉 為什麼要加 :key？
Vue 在更新畫面時會比較每個元素。key 是「身分證」，可以讓 Vue 更快、更正確地比對資料，避免渲染錯誤或效率低。
👉 為什麼不用直接寫 $emit？
把功能抽出來寫成 handleChangeView() 是好習慣，這樣可讀性好、好維護，且之後功能改變（例如記錄點擊次數）也好加東西。
👉 為什麼只顯示 name？
styleList 的每個元素應該長這樣 { name: '熱門', path: '/hot' }，你只要顯示名字即可，路徑是點擊後內部使用的資料。
-->
        <li
            :class="{ active: item.name === activeName }" 
            v-for = "item in styleList"
            :key = "item.path"
            @click="handleChangeView(item)"
        >
            {{ item.name }}
        </li>
    </ul>
</template>

<!--你寫的每一個變數與函式都會「被 Vue 看到」，不需要顯式回傳給模板使用。這讓開發者能專注在邏輯本身，而不是框架語法。-->
<script setup lang="ts">
import { defineProps, defineEmits, defineOptions } from 'vue';

// 告訴 Vue「我會從父元件接收到這些資料」。
// 父元件是什麼？簡單講就是「誰用你，你的爸爸就是誰」。
const props = defineProps<{
    styleList: Array<{name:string, path:string}>, // styleList 表示你希望元件由外部提供選單項目，而不是寫死在內部。
    activeName : string
}>()

// 當你希望子元件「通知」父元件一些事件（例如按了哪個選項），你就會用到 emit。
const emit = defineEmits<{ // TypeScript 中對函式型別的描述，它表明「這是一個函式，接收三個參數，回傳值是 void（也就是沒有回傳值）」
    (e: 'click', name : string, path : string) : void
}>()

defineOptions({ name: 'HeaderNav' }) // 👈 給元件命名

// 這個函式其實就是事件橋樑，幫你把點選的內容回報給上層元件使用。
function handleChangeView(item: { name : string, path : string }) {
    emit('click', item.name, item.path)
}
</script>

<style lang = "scss" scoped>
@import "../assets/css/var.scss";

// 這種排版不是靠 list 控制, 要找他的容器
.header-nav {
    display: flex;
    list-style: none;
    justify-content: space-around;
    padding-top: 10px;
    padding-left: 100px;
    padding-right: 100px;
    margin: 0;
}

li {
  margin: $header-nav-margin;
  padding: $header-nav-padding;
  line-height: 3.3rem;
  color: $color-grey;
  border-bottom: none;
  cursor: pointer;
  transition: all 0.2s ease; // 👉 增加滑鼠移動時的動畫過渡效果
}

li.active {
  color: $color-black;
  font-weight: 600;
  border-bottom: 5px solid $color-black;
}

li:hover {
    color: $color-blue-dark;
    border-bottom: 5px solid $color-blue-dark; // 👉 滑鼠移上時加底線
    font-weight: 500;
    transform: translateY(-2px); // 👉 可選：有種「浮起來」的感覺
}

</style>
