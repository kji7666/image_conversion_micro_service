<template>
    <section class="upload-section">
      <h2>上傳圖片</h2>
      <input type="file" @change="handleFileChange" />
      <p v-if="selectedFile">已選擇檔案：{{ selectedFile.name }}</p>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useUpload } from '../composables/useUpload.js'
  
  const { selectedFile, handleFileChange } = useUpload()
  </script>
  
  <style scoped>
  .upload-section {
    margin: 30px;
    text-align: center;
  }
  </style>
  