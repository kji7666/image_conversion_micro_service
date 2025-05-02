<template>
    <section class="upload-section-inner">
      <!-- 上傳區域：點擊或拖曳 -->
      <div
        class="upload-area"
        :class="{ 'is-dragging': isDragging }"
        @click="triggerFileInput"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <!-- 隱藏的 input[type=file] -->
        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg, image/png, image/gif"
          @change="handleFileSelect"
          style="display: none;"
        />
  
        <!-- 提示文字或預覽圖 -->
        <div v-if="!previewUrl" class="upload-prompt">
          <p class="prompt-text">拖曳圖片到這裡，或點擊選擇檔案</p>
          <!-- <i class="fas fa-upload"></i> -->
        </div>
        <div v-else class="image-preview">
          <img :src="previewUrl" alt="圖片預覽" />
          <button @click.stop="removePreview" class="remove-button">移除</button>
        </div>
      </div>
  
      <!-- 上傳按鈕和狀態 -->
      <div class="upload-controls" v-if="selectedFile && !uploadStatus.startsWith('success')">
         <button @click="uploadImage" :disabled="uploadStatus === 'uploading'">
          {{ uploadStatus === 'uploading' ? '上傳中...' : '確認上傳' }}
        </button>
      </div>
       <p v-if="uploadStatus === 'success'" class="status-message success">✅ 上傳成功！</p>
       <p v-if="uploadStatus === 'error'" class="status-message error">❌ 上傳失敗: {{ errorMessage }}</p>
       <!-- 成功訊息可由父組件顯示，這裡可以移除或保留 -->
       <!-- <p v-if="uploadedImageUrl" class="status-message">
         圖片網址：<a :href="uploadedImageUrl" target="_blank">{{ uploadedImageUrl }}</a>
       </p> -->
  
    </section>
  </template>
  
  <script setup lang="ts">
  import { ref, onUnmounted } from 'vue';
  
  // --- 定義組件發出的事件 ---
  // 'upload-success' 事件會在圖片成功上傳後觸發，並附帶圖片的 URL
  const emit = defineEmits(['upload-success']);
  
  // --- State (狀態) ---
  const fileInputRef = ref<HTMLInputElement | null>(null); // 檔案輸入框的引用
  const selectedFile = ref<File | null>(null);           // 使用者選擇的檔案
  const previewUrl = ref<string | null>(null);           // 圖片預覽 URL
  const isDragging = ref(false);                         // 是否有檔案拖曳到區域上
  const uploadStatus = ref<'idle' | 'uploading' | 'success' | 'error'>('idle'); // 上傳狀態
  const errorMessage = ref<string>('');                  // 錯誤訊息
  // const uploadedImageUrl = ref<string | null>(null); // 本地可以不用儲存最終 URL，由父組件處理
  
  // --- Constants (常數) ---
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  const MAX_FILE_SIZE_MB = 5; // 例如：限制 5MB
  const API_ENDPOINT = '/api/upload'; // 後端 API 端點 (需自行實現)
  
  // --- Methods (方法) ---
  
  function triggerFileInput() {
    if (uploadStatus.value === 'uploading') return; // 成功後允許重新選擇
    fileInputRef.value?.click();
  }
  
  function handleFileSelect(event: Event | DragEvent) {
      // ... (驗證邏輯與之前相同) ...
      let file: File | null = null;
      if (event instanceof DragEvent) {
        file = event.dataTransfer?.files[0] || null;
        isDragging.value = false;
      } else {
        const target = event.target as HTMLInputElement;
        file = target.files?.[0] || null;
      }
  
      if (file) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`不支援的檔案類型: ${file.type}。請選擇 JPG, PNG, 或 GIF。`);
          resetState();
          return;
        }
  
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
           alert(`檔案大小超過限制 (${MAX_FILE_SIZE_MB}MB)。`);
           resetState();
           return;
        }
  
        selectedFile.value = file;
        createPreview(file);
        uploadStatus.value = 'idle';
        errorMessage.value = '';
        // uploadedImageUrl.value = null; // 清除舊 URL
      }
  
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
  }
  
  function createPreview(file: File) {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = URL.createObjectURL(file);
  }
  
  function removePreview() {
      // selectedFile.value = null; // 保留文件，可能只是不想預覽了但還想上傳
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
      }
      // 如果移除預覽就等於取消選擇，則呼叫 resetState
      resetState();
  }
  
  function resetState() {
      selectedFile.value = null;
      if (previewUrl.value) {
          URL.revokeObjectURL(previewUrl.value);
          previewUrl.value = null;
      }
      uploadStatus.value = 'idle';
      errorMessage.value = '';
      // uploadedImageUrl.value = null;
      isDragging.value = false;
      if (fileInputRef.value) {
          fileInputRef.value.value = '';
      }
  }
  
  
  // --- Drag & Drop Handlers ---
  function handleDragOver() {
    if (uploadStatus.value !== 'uploading') {
      isDragging.value = true;
    }
  }
  
  function handleDragLeave() {
    isDragging.value = false;
  }
  
  function handleDrop(event: DragEvent) {
    if (uploadStatus.value !== 'uploading') {
      handleFileSelect(event);
    }
  }
  
  // --- 上傳圖片到後端 ---
  async function uploadImage() {
    if (!selectedFile.value) {
      alert('請先選擇一個圖片檔案');
      return;
    }
  
    uploadStatus.value = 'uploading';
    errorMessage.value = '';
  
    const formData = new FormData();
    formData.append('file', selectedFile.value);
  
    try {
      console.log('模擬上傳中...'); // Log 開始
  
      // --- 模擬後端 API ---
      // 在實際應用中，這裡會是 fetch(API_ENDPOINT, ...)
      // 為了演示，我們延遲 1.5 秒並假設成功，返回一個假 URL
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      // 假設後端處理成功並返回圖片 URL
      const mockResult = {
        // 實際應用中，這個 URL 是後端真實保存圖片後返回的可訪問地址
        imageUrl: `/images/uploaded/${selectedFile.value.name}_${Date.now()}.jpg` // 範例 URL
      };
      // --- 模擬結束 ---
  
      /*
      // --- 真實的 Fetch ---
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        let errorMsg = `伺服器錯誤: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) { }
        throw new Error(errorMsg);
      }
      const result = await response.json();
      // --- 真實 Fetch 結束 ---
      */
  
      const result = mockResult; // 使用模擬結果
  
      console.log('模擬上傳成功:', result); // Log 成功
      uploadStatus.value = 'success';
      const finalImageUrl = result.imageUrl || result.url || result.data || null; // 根據後端實際回傳調整
  
      // --- 觸發 upload-success 事件 ---
      if (finalImageUrl) {
        emit('upload-success', finalImageUrl); // 將獲取的圖片 URL 發送給父組件
      } else {
        console.warn('後端未返回有效的圖片 URL');
        // 也可以觸發一個失敗的事件或設置錯誤狀態
      }
  
      // 成功後可以選擇清除預覽和文件，讓用戶可以上傳下一個
      // resetState();
      // 或者保留預覽，但按鈕可以禁用或改變文字
  
  
    } catch (error: any) {
      console.error('上傳失敗:', error);
      uploadStatus.value = 'error';
      errorMessage.value = error.message || '發生未知錯誤';
    }
  }
  
  // --- Lifecycle Hooks ---
  onUnmounted(() => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
  });
  
  </script>
  
  <style scoped lang="scss">
  /* 沿用你之前的樣式，或者根據需要調整 */
  .upload-section-inner {
    width: 100%;
    max-width: 400px; /* 限制寬度，避免在父容器中過大 */
    margin: 0 auto; /* 居中 */
    padding: 20px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    text-align: center;
  }
  
  .upload-area {
    border: 2px dashed #007bff;
    border-radius: 8px;
    padding: 30px 15px; /* 稍微減少內邊距 */
    margin-bottom: 15px;
    background-color: #ffffff;
    cursor: pointer;
    transition: background-color 0.3s ease, border-color 0.3s ease;
    position: relative;
  
    &:hover .prompt-text { /* 修改 hover 效果 */
        transform: translateY(-4px);
        color: #0056b3;
    }
  
    &.is-dragging {
      background-color: #cfe2ff;
      border-color: #0d6efd;
    }
  }
  
  .upload-prompt {
    color: #6c757d;
    .prompt-text {
        margin: 0;
        font-size: 1rem; /* 調整字體大小 */
         transition: transform 0.3s ease, color 0.3s ease;
    }
  }
  
  .image-preview {
    position: relative;
    display: inline-block;
    max-height: 150px; /* 限制預覽圖最大高度 */
  
    img {
      max-width: 100%;
      max-height: 150px;
      object-fit: contain;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
  
    .remove-button {
        position: absolute;
        top: -5px;  /* 調整位置 */
        right: -5px; /* 調整位置 */
        background-color: rgba(211, 47, 47, 0.8); /* 更明顯的紅色 */
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px; /* 調整大小 */
        height: 20px; /* 調整大小 */
        font-size: 12px; /* 調整大小 */
        line-height: 20px; /* 調整大小 */
        text-align: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2); /* 加點陰影 */
  
        &:hover {
            background-color: rgb(198, 40, 40); /* Hover 時更深 */
        }
    }
  }
  
  
  .upload-controls {
    margin-top: 10px;
    button {
      padding: 8px 20px; /* 調整按鈕大小 */
      font-size: 0.9rem; /* 調整字體大小 */
      font-weight: 600;
      color: #fff;
      background-color: #28a745;
      border: none;
      border-radius: 15px; /* 調整圓角 */
      cursor: pointer;
      transition: background-color 0.3s ease;
  
      &:hover:not(:disabled) {
        background-color: #218838;
      }
  
      &:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
      }
    }
  }
  
  .status-message {
      margin-top: 10px; /* 調整間距 */
      font-weight: 500;
      font-size: 0.9rem; /* 調整字體大小 */
  
      &.success { color: #198754; }
      &.error { color: #dc3545; }
      a {
        color: #0d6efd;
        text-decoration: none;
        &:hover { text-decoration: underline; }
        word-break: break-all; /* 避免長 URL 撐開佈局 */
      }
  }
  </style>