<!-- components/MosaicGenerateButton.vue -->
<template>
  <button
    @click="handleGenerate"
    :disabled="!canGenerateInternal || busy"
    class="generate-button"
  >
    <slot> <!-- 允許父組件自定義按鈕文本 -->
      {{ busy ? '生成中...' : '開始生成馬賽克' }}
    </slot>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from 'vue';
import axios from 'axios';

interface BackendSuccessResponse {
  success: boolean;
  imageUrl: string;
  message?: string;
}

interface BackendErrorResponse {
  message: string;
  // 你可以根據後端實際返回的錯誤結構添加更多字段
}

const props = defineProps({
  styleImage: {
    type: Object as PropType<File | null>,
    required: true,
  },
  sourceImages: {
    type: Array as PropType<File[]>,
    required: true,
  },
  apiUrl: {
    type: String,
    default: 'http://localhost:8080/api/generate-mosaic',
  },
  // disabled prop 可以從外部控制按鈕的禁用狀態，除了內部邏輯外
  disabled: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits<{
  (e: 'success', payload: { imageUrl: string; message?: string }): void;
  (e: 'error', message: string): void;
  (e: 'progress', percentage: number): void;
  (e: 'busy-change', isBusy: boolean): void; // 新增：通知父組件忙碌狀態變化
}>();

const busy = ref(false);

const canGenerateInternal = computed(() => {
  return props.styleImage !== null && props.sourceImages.length > 0 && !props.disabled;
});

async function handleGenerate() {
  if (!canGenerateInternal.value || busy.value) return;

  busy.value = true;
  emit('busy-change', true); // 通知父組件開始忙碌
  emit('progress', 0);

  const formData = new FormData();
  if (props.styleImage) {
    formData.append('styleImage', props.styleImage, props.styleImage.name);
  }
  props.sourceImages.forEach((file) => {
    formData.append('sourceImages', file, file.name);
  });

  let currentProgress = 0; // 用於 onUploadProgress

  try {
    console.log(`[MosaicGenerateButton] Sending to ${props.apiUrl}`);
    const response = await axios.post<BackendSuccessResponse>(props.apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'json', // 期望後端返回 JSON
      onUploadProgress: progressEvent => {
        if (progressEvent.total) {
          // 將上傳進度映射到 0-90%，因為後端處理也需要時間
          const percentCompleted = Math.round((progressEvent.loaded * 90) / progressEvent.total);
          if (percentCompleted > currentProgress) {
            currentProgress = percentCompleted;
            emit('progress', currentProgress);
          }
        }
      }
    });

    const result = response.data;
    if (result.success && result.imageUrl) {
      emit('progress', 100); // 後端處理完成
      emit('success', { imageUrl: result.imageUrl, message: result.message });
    } else {
      // 即使 HTTP 狀態是 200，但業務邏輯可能失敗
      throw new Error(result.message || '後端操作未成功但未返回明確錯誤信息。');
    }

  } catch (err: any) {
    console.error('[MosaicGenerateButton] Error:', err);
    let errorMessage = '生成馬賽克時發生未知錯誤。';
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // 服務器響應了錯誤狀態碼
        const errorData = err.response.data as BackendErrorResponse | { message?: string };
        errorMessage = errorData?.message || `伺服器錯誤: ${err.response.status} ${err.response.statusText}`;
      } else if (err.request) {
        // 請求已發出，但沒有收到響應
        errorMessage = '伺服器無響應，請檢查網絡或伺服器狀態。';
      } else {
        // 設置請求時發生錯誤
        errorMessage = `請求設置錯誤: ${err.message}`;
      }
    } else if (err instanceof Error) {
        errorMessage = err.message;
    }

    emit('error', errorMessage);
    emit('progress', 0); // 出錯時重置進度
  } finally {
    busy.value = false;
    emit('busy-change', false); // 通知父組件結束忙碌
  }
}
</script>

<style scoped lang="scss">
/* 從 UseNowView.vue 複製 .generate-button 的樣式 */
.generate-button {
  display: block;
  width: auto;
  min-width: 220px;
  margin: 2.5rem auto; /* 與 UseNowView 中的 generate-button 保持一致 */
  background-color: #2ecc71;
  font-size: 1.2rem;
  padding: 16px 35px;
  font-weight: 500;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  user-select: none;

  &:hover:not(:disabled) {
    background-color: #27ae60;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }
  &:active:not(:disabled) {
    transform: translateY(0px);
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
}
</style>