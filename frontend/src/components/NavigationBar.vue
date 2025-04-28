<template>
    <nav class = "menu">
        <ul>
            <li v-for = "(item, index) in menuItems" :key = index>
                {{ item }}
            </li>
        </ul>
    </nav>
</template>

<script setup>
import { ref } from 'vue'
const menuItems = ref ([
    '選項 1',
    '選項 2',
    '選項 3'
])
</script>

<style scoped>
/* 依照 class 名指定 */
.menu {
    /* size */
    height : 150px;
    width : 100%;
    padding : 10px;
    /* 字 */
    font-size : 48px;
    color : white;
    font-weight: bold;

    /* 背景圖 */
    background-image: url('/asset/gaki.jpg');
    background-color: aquamarine;
    background-repeat: repeat;
    background-position: center;
    position : sticky;
    top : 0;
}

.menu ul {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    list-style: none;
    padding-top:50px;
    margin-left: 300px;
    margin-right: 300px;
}

.menu li {
  text-shadow: 2px 2px 4px #000000, -2px -2px 4px #000000; /* 黑色边框效果 */
}
</style>