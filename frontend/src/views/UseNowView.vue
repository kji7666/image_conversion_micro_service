<template>
  <!--
    @file UseNowView.vue
    @description 用戶交互頁面，用於創建照片馬賽克。
    該頁面引導用戶完成以下步驟：
    1. 選擇一張風格圖片 (style image)，這張圖片將決定最終馬賽克圖像的整體外觀和色調。
    2. 上傳一個包含多張素材圖片 (source images) 的資料夾，這些小圖片將被用來填充馬賽克。
    3. 開始生成馬賽克圖像，過程中會顯示進度條。
    4. 生成完成後，預覽最終的馬賽克圖片並提供下載鏈接。
    頁面還處理了錯誤顯示和按鈕的禁用狀態。
  -->
  <div class="use-now-page">
    <h1 class="page-title">製作你的照片馬賽克</h1>
    <p class="page-subtitle">將你的照片集變成獨一無二的藝術品！</p>

    <!-- 步驟 1: 選擇風格圖片 -->
    <section class="upload-section">
      <h2 class="section-title">步驟 1：選擇你的風格圖片 (單張)</h2>
      <p class="section-description">
        這張圖片將決定馬賽克的整體外觀和顏色風格。
      </p>
      <div class="single-image-upload-area">
        <!-- 
          觸發文件選擇對話框的按鈕。
          按鈕文本會根據是否已選擇文件動態更新。
        -->
        <button @click="triggerStyleImageSelect" class="select-button">
          {{ styleImageFile ? `已選擇: ${styleImageFile.name}` : '選擇風格圖片' }}
        </button>
        <!-- 
          隱藏的 input[type="file"] 元素，用於實際的文件選擇。
          通過 ref (styleImageInput) 在腳本中訪問。
          accept 屬性限制可選擇的文件類型。
        -->
        <input
          type="file"
          ref="styleImageInput"
          @change="handleStyleImageSelected"
          style="display: none;"
          accept="image/jpeg, image/png, image/webp"
        />
        <!-- 
          如果已選擇風格圖片並生成了預覽 URL，則顯示圖片預覽。
        -->
        <div v-if="styleImagePreviewUrl" class="image-preview-container">
          <img :src="styleImagePreviewUrl" alt="風格圖片預覽" class="image-preview single-preview">
        </div>
      </div>
    </section>

    <!-- 步驟 2: 上傳素材圖片資料夾 -->
    <section class="upload-section">
      <h2 class="section-title">步驟 2：上傳你的素材圖片資料夾</h2>
      <p class="section-description">
        選擇一個包含多張小圖片的資料夾，這些圖片將被用來填充你的馬賽克。系統會自動過濾非圖片檔案。
      </p>
      <!-- 
        資料夾上傳組件。
        @files-selected 事件在用戶選擇文件後觸發，並將選中的文件列表傳遞給 handleFolderFilesSelected 方法。
      -->
      <DirectoryUploadBlock_Simplified @files-selected="handleFolderFilesSelected" />
    </section>

    <!-- 開始生成按鈕 -->
    <button
      @click="startGeneration"
      :disabled="!canGenerate || isGenerating"
      class="generate-button"
    >
      <!-- 按鈕文本根據是否正在生成動態變化 -->
      {{ isGenerating ? '生成中...' : '開始生成馬賽克' }}
    </button>

    <!-- 進度條區域 (僅在生成過程中顯示) -->
    <div v-if="isGenerating" class="progress-area">
      <p>圖片正在努力生成中，請稍候...</p>
      <div class="progress-bar-container">
        <!-- 進度條的寬度由 generationProgress 數據綁定 -->
        <div class="progress-bar" :style="{ width: generationProgress + '%' }">
          {{ generationProgress }}%
        </div>
      </div>
    </div>

    <!-- 最終圖片展示區域 (僅在生成成功後顯示) -->
    <div v-if="finalImageUrl" class="final-image-area">
      <h2 class="section-title">生成結果</h2>
      <img :src="finalImageUrl" alt="最終生成的馬賽克圖片" class="final-image">
      <!-- 
        下載按鈕。
        :href 綁定到最終圖片的 URL。
        :download 屬性指定下載時的文件名。
      -->
      <a :href="finalImageUrl" :download="downloadFileName" class="download-button">
        下載馬賽克圖片
      </a>
    </div>

    <!-- 錯誤信息顯示區域 -->
    <div v-if="errorMessage" class="error-message">
      錯誤：{{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file UseNowView.vue <script setup lang="ts">
 * @description UseNowView 組件的 TypeScript 邏輯部分。
 * 職責：
 * 1. 管理用戶輸入：風格圖片和素材圖片資料夾的選擇。
 * 2. 處理文件上傳和預覽邏輯。
 * 3. 與後端 API 通信，發送圖片數據以生成馬賽克圖像。
 * 4. 顯示生成進度、最終結果和任何可能發生的錯誤。
 * 5. 管理組件的響應式狀態 (如文件引用、預覽 URL、生成狀態、進度、錯誤信息等)。
 * 6. 在組件卸載時清理資源 (如對象 URL、定時器)。
 */

import { ref, computed, onUnmounted } from 'vue';
import DirectoryUploadBlock_Simplified from '../components/DirectoryUploadBlock_Simplified.vue';

// --- 響應式狀態 (State) ---

/**
 * @type {Ref<HTMLInputElement | null>}
 * @description 對風格圖片文件輸入框 (input[type="file"]) 的引用。
 */
const styleImageInput = ref<HTMLInputElement | null>(null);

/**
 * @type {Ref<File | null>}
 * @description 用戶選擇的風格圖片文件對象。
 */
const styleImageFile = ref<File | null>(null);

/**
 * @type {Ref<string | null>}
 * @description 用於預覽風格圖片的本地對象 URL。
 */
const styleImagePreviewUrl = ref<string | null>(null);

/**
 * @type {Ref<File[]>}
 * @description 從用戶選擇的資料夾中提取的素材圖片文件列表。
 */
const folderImageFiles = ref<File[]>([]);

/**
 * @type {Ref<boolean>}
 * @description 標記當前是否正在生成馬賽克圖像。
 */
const isGenerating = ref(false);

/**
 * @type {Ref<number>}
 * @description 馬賽克圖像生成的進度百分比 (0-100)。
 */
const generationProgress = ref(0);

/**
 * @type {Ref<string | null>}
 * @description 後端成功生成馬賽克後返回的圖片 URL。
 */
const finalImageUrl = ref<string | null>(null);

/**
 * @type {Ref<string | null>}
 * @description 操作過程中發生的錯誤信息。
 */
const errorMessage = ref<string | null>(null);

/**
 * @type {number | undefined}
 * @description 用於模擬進度條更新的 setInterval 定時器 ID。
 * @private
 */
let progressInterval: number | undefined;

// --- 計算屬性 (Computed Properties) ---

/**
 * @computed canGenerate
 * @description 計算屬性，判斷是否已滿足開始生成馬賽克的條件（即風格圖片和素材圖片都已選擇）。
 * @returns {boolean} 如果可以開始生成，則為 true，否則為 false。
 */
const canGenerate = computed(() => {
  return styleImageFile.value !== null && folderImageFiles.value.length > 0;
});

/**
 * @computed downloadFileName
 * @description 計算屬性，生成下載馬賽克圖片時建議的文件名。
 * 通常基於風格圖片名或時間戳。
 * @returns {string} 建議的下載文件名。
 */
const downloadFileName = computed(() => {
  const prefix = styleImageFile.value ? styleImageFile.value.name.split('.')[0] : 'mosaic';
  return `${prefix}_photomosaic_${Date.now()}.png`; // 假設總是 PNG，或根據後端返回類型調整
});

// --- 方法 (Methods) ---

/**
 * @function triggerStyleImageSelect
 * @description 以編程方式觸發隱藏的風格圖片文件輸入框的點擊事件，打開文件選擇對話框。
 * @returns {void}
 */
const triggerStyleImageSelect = () => {
  styleImageInput.value?.click();
};

/**
 * @function handleStyleImageSelected
 * @description 當用戶通過文件輸入框選擇了風格圖片後觸發的回調函數。
 * 處理選中的文件，生成預覽 URL，並更新相關狀態。
 * @param {Event} event - 文件輸入框的 change 事件對象。
 * @returns {void}
 */
const handleStyleImageSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    styleImageFile.value = target.files[0];
    // 釋放舊的預覽 URL (如果存在)
    if (styleImagePreviewUrl.value) {
      URL.revokeObjectURL(styleImagePreviewUrl.value);
    }
    styleImagePreviewUrl.value = URL.createObjectURL(styleImageFile.value);
    errorMessage.value = null; // 清除之前的錯誤信息
  } else {
    styleImageFile.value = null;
    styleImagePreviewUrl.value = null;
  }
};

/**
 * @function handleFolderFilesSelected
 * @description 當 DirectoryUploadBlock_Simplified 組件觸發 'files-selected' 事件時調用的回調函數。
 * 更新組件狀態中存儲的素材圖片文件列表。
 * @param {File[]} files - 從資料夾上傳組件選中的文件列表。
 * @returns {void}
 */
const handleFolderFilesSelected = (files: File[]) => {
  folderImageFiles.value = files;
  console.log(`已選擇 ${files.length} 個素材圖片。`);
  errorMessage.value = null; // 清除之前的錯誤信息
};


/**
 * @function startGeneration
 * @description 開始生成馬賽克圖像的異步函數。
 * 1. 檢查是否滿足生成條件。
 * 2. 重置生成狀態和進度。
 * 3. 創建 FormData 對象並填充風格圖片和素材圖片。
 * 4. (可選) 啟動一個模擬進度條。
 * 5. 使用 fetch API 將 FormData 發送到後端 `/api/generate-mosaic` 端點。
 * 6. 處理後端響應：
 *    - 如果成功，更新最終圖片 URL 並將進度設為 100%。
 *    - 如果失敗，捕獲錯誤並顯示錯誤信息。
 * 7. 無論成功或失敗，最終都會重置 `isGenerating` 狀態並清理定時器。
 * @async
 * @returns {Promise<void>}
 */
const startGeneration = async () => {
  if (!canGenerate.value) {
    errorMessage.value = "請先選擇風格圖片和素材圖片資料夾。";
    return;
  }

  // 重置狀態
  isGenerating.value = true;
  generationProgress.value = 0;
  finalImageUrl.value = null;
  errorMessage.value = null;

  // 模擬進度條 (真實進度應由後端事件或輪詢提供，此處為簡化)
  clearInterval(progressInterval);
  progressInterval = window.setInterval(() => { // 明確使用 window.setInterval
    if (generationProgress.value < 95) {
      generationProgress.value += 5;
    } else {
      clearInterval(progressInterval); 
    }
  }, 200);

  // 準備表單數據
  const formData = new FormData();
  if (styleImageFile.value) {
    formData.append('styleImage', styleImageFile.value, styleImageFile.value.name);
  }
  folderImageFiles.value.forEach((file) => {
    formData.append('sourceImages', file, file.name);
  });

  const backendApiUrl = 'http://localhost:3000/api/generate-mosaic'; // **後端 API URL**

  try {
    console.log(`正在向 ${backendApiUrl} 發送圖片數據...`);
    const response = await fetch(backendApiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorData = { message: `伺服器錯誤: ${response.status} ${response.statusText}` };
      try {
        const errJson = await response.json();
        if (errJson && errJson.message) errorData.message = errJson.message;
      } catch (e) { /* 忽略解析錯誤，使用 HTTP 狀態文本 */ }
      throw new Error(errorData.message);
    }

    const result = await response.json();

    if (result.success && result.imageUrl) {
      finalImageUrl.value = result.imageUrl; // 後端應返回可直接訪問的 URL
      generationProgress.value = 100;
      clearInterval(progressInterval);
      console.log('後端處理完成，圖片 URL:', finalImageUrl.value);
      if (result.message) console.log('後端訊息:', result.message);
    } else {
      throw new Error(result.message || '後端返回數據格式不正確或操作未成功。');
    }

  } catch (error: any) {
    console.error('生成馬賽克時出錯:', error);
    errorMessage.value = error.message || '與伺服器通信失敗或處理時發生錯誤。';
    // 出錯時也應該停止進度條並可能重置
    clearInterval(progressInterval);
    if (generationProgress.value < 100) generationProgress.value = 0; // 如果未完成，重置
  } finally {
    isGenerating.value = false;
    // 確保在任何情況下都清除定時器，如果它還在運行且未完成
    if (generationProgress.value !== 100 && progressInterval) {
        clearInterval(progressInterval);
    }
  }
};

// --- 生命周期鉤子 (Lifecycle Hooks) ---

/**
 * @function onUnmounted
 * @description Vue 組件生命週期鉤子：當組件實例被卸載時調用。
 * 用於清理資源，例如釋放通過 `URL.createObjectURL` 創建的對象 URL，
 * 以及清除任何正在運行的 `setInterval` 定時器。
 * @returns {void}
 */
onUnmounted(() => {
  if (styleImagePreviewUrl.value) {
    URL.revokeObjectURL(styleImagePreviewUrl.value);
  }
  clearInterval(progressInterval);
});

</script>


<style scoped lang="scss">
/* 
  SCSS 樣式塊，`scoped` 屬性確保樣式僅作用於此組件。
  定義了 UseNowView 頁面的佈局、標題、上傳區域、按鈕、進度條、
  結果展示區和錯誤信息的外觀。
  使用了 flex 和 grid (隱式) 進行佈局，並對顏色、字體、邊距等進行了樣式化。
*/

.use-now-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  padding-top: 90px; /* 為固定 Header 留出空間 (如果 Header 是 fixed) */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #fdfdfd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.page-title {
  text-align: center;
  font-size: 2.4rem; /* 略微增大 */
  color: #2c3e50; /* 更柔和的深色 */
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.page-subtitle {
  text-align: center;
  font-size: 1.15rem; /* 略微增大 */
  color: #555; /* 更深的灰色 */
  margin-bottom: 3rem; /* 增大與下方內容的間距 */
}

.upload-section {
  margin-bottom: 3rem; /* 增大區塊間距 */
  padding: 25px; /* 增加內邊距 */
  background-color: #ffffff;
  border: 1px solid #eaeaea; /* 更淺的邊框 */
  border-radius: 8px; /* 更大的圓角 */
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.section-title {
  font-size: 1.6rem; /* 增大 */
  color: #34495e; /* 藍灰色調 */
  margin-top: 0;
  margin-bottom: 1rem; /* 增大 */
  border-bottom: 2px solid #ecf0f1; /* 更明顯的下劃線 */
  padding-bottom: 0.75rem; /* 增大 */
  font-weight: 500;
}

.section-description {
  font-size: 1rem; /* 增大 */
  color: #606060;
  line-height: 1.7; /* 增加行高 */
  margin-bottom: 1.8rem; /* 增大 */
}

.select-button, .generate-button, .download-button {
  display: inline-block;
  padding: 12px 28px; /* 調整 padding */
  font-size: 1.05rem; /* 調整字體大小 */
  font-weight: 500;
  color: white;
  background-color: #3498db; /* 主題藍色 */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  text-decoration: none;
  user-select: none; /* 防止選中文本 */

  &:hover {
    background-color: #2980b9; /* 深一點的藍色 */
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0px);
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  &:disabled {
    background-color: #bdc3c7; /* 禁用時的灰色 */
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
}

.single-image-upload-area {
  text-align: center; 
  padding-top: 10px; /* 給按鈕上方一些空間 */
}

.image-preview-container {
    margin-top: 20px; /* 增大與按鈕的間距 */
    display: flex;
    justify-content: center;
}
.image-preview {
  max-width: 250px; /* 增大預覽尺寸 */
  max-height: 250px;
  border: 2px dashed #bdc3c7; /* 使用虛線邊框 */
  border-radius: 6px;
  object-fit: contain;
  padding: 5px; /* 圖片與邊框間距 */
  background-color: #f9f9f9;
}

.generate-button {
  display: block; 
  width: auto; /* 改為 auto，讓其根據內容調整 */
  min-width: 220px; /* 設置最小寬度 */
  margin: 2.5rem auto; /* 調整上下邊距 */
  background-color: #2ecc71; /* 主題綠色 */
  font-size: 1.2rem; /* 增大 */
  padding: 16px 35px; /* 增大 */

  &:hover {
    background-color: #27ae60; /* 深一點的綠色 */
  }
}

.progress-area {
  margin: 2.5rem 0; /* 調整上下邊距 */
  text-align: center;
  p {
    margin-bottom: 1rem; /* 增大 */
    color: #555;
    font-size: 1.05rem;
  }
}

.progress-bar-container {
  width: 100%;
  background-color: #ecf0f1; /* 淺灰色背景 */
  border-radius: 6px; /* 增大圓角 */
  overflow: hidden;
  height: 2.2rem; /* 增大高度 */
  display: flex; 
  align-items: center;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.progress-bar {
  height: 100%;
  background-image: linear-gradient(45deg, #3498db, #2980b9); /* 漸變藍色 */
  width: 0%; 
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem; /* 略微增大 */
  font-weight: 600; /* 加粗 */
  transition: width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1); /* 更平滑的過渡 */
  text-shadow: 0 1px 1px rgba(0,0,0,0.2);
}

.final-image-area {
  margin-top: 2.5rem; /* 調整 */
  text-align: center;
  padding: 25px; /* 調整 */
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);

  .final-image {
    display: block;
    max-width: 100%;
    max-height: 550px; /* 增大預覽高度 */
    border: 1px solid #dcdcdc; /* 邊框顏色 */
    border-radius: 6px;
    margin: 0 auto 2rem auto; /* 增大底部間距 */
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
}

.download-button {
  background-color: #1abc9c; /* 青綠色 */
  min-width: 200px; /* 設置最小寬度 */
   &:hover {
    background-color: #16a085; /* 深一點的青綠色 */
  }
}

.error-message {
  margin-top: 2rem; /* 調整 */
  color: #c0392b; /* 深紅色 */
  background-color: #fdedec; /* 非常淺的紅色背景 */
  border: 1px solid #e74c3c; /* 紅色邊框 */
  padding: 12px 18px; /* 調整 */
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
}
</style>