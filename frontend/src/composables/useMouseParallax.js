// src/composables/useMouseParallax.js
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

/**
 * 提供響應式的滑鼠相對於容器中心的偏移比例。
 * @param {Ref<HTMLElement | null>} containerRef - Ref to the container element. If null, uses window.
 * @returns {object} - { offsetXRatio, offsetYRatio } ranging from -0.5 to 0.5.
 */
export function useMouseParallax(containerRef = ref(null)) {
  const mouseX = ref(0);
  const mouseY = ref(0);
  const containerWidth = ref(window.innerWidth); // 初始值
  const containerHeight = ref(window.innerHeight); // 初始值
  const containerRect = ref({ left: 0, top: 0 }); // 容器位置

  // 相對於容器中心的偏移比例 (-0.5 to 0.5)
  const offsetXRatio = ref(0);
  const offsetYRatio = ref(0);

  const updateMousePosition = (event) => {
    mouseX.value = event.clientX;
    mouseY.value = event.clientY;
    calculateOffsetRatios();
  };

  const updateContainerInfo = () => {
    const element = containerRef.value;
    if (element) {
      const rect = element.getBoundingClientRect();
      containerWidth.value = rect.width;
      containerHeight.value = rect.height;
      containerRect.value = { left: rect.left, top: rect.top };
    } else {
      // 如果沒有指定容器，使用視窗大小
      containerWidth.value = window.innerWidth;
      containerHeight.value = window.innerHeight;
      containerRect.value = { left: 0, top: 0 };
    }
    // 容器變化後重新計算比例
    calculateOffsetRatios();
  };

  const calculateOffsetRatios = () => {
    if (containerWidth.value > 0 && containerHeight.value > 0) {
      // 計算滑鼠在容器內的相對位置
      const relativeX = mouseX.value - containerRect.value.left;
      const relativeY = mouseY.value - containerRect.value.top;
      // 計算相對於中心的比例
      offsetXRatio.value = (relativeX / containerWidth.value) - 0.5;
      offsetYRatio.value = (relativeY / containerHeight.value) - 0.5;
    } else {
      offsetXRatio.value = 0;
      offsetYRatio.value = 0;
    }
  };

  let resizeObserver = null;

  onMounted(() => {
    // 使用 nextTick 確保容器元素已渲染完成
    nextTick(() => {
      updateContainerInfo(); // 初始獲取容器信息
      const targetElement = containerRef.value || window; // 監聽的目標
      targetElement.addEventListener('mousemove', updateMousePosition);
      window.addEventListener('resize', updateContainerInfo); // 窗口大小變化始終監聽 window

      // 如果指定了容器，觀察容器大小變化
      if (containerRef.value) {
        resizeObserver = new ResizeObserver(updateContainerInfo);
        resizeObserver.observe(containerRef.value);
      }
    });
  });

  onUnmounted(() => {
    const targetElement = containerRef.value || window;
    targetElement.removeEventListener('mousemove', updateMousePosition);
    window.removeEventListener('resize', updateContainerInfo);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  return {
    offsetXRatio, // X 偏移比例 (-0.5 to 0.5)
    offsetYRatio, // Y 偏移比例 (-0.5 to 0.5)
  };
}