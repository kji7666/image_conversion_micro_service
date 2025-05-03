// src/utils/intersectionObserver.js
let observer = null;

const observerCallback = (entries, observerInstance) => { // 接收 observerInstance
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 元素進入視口
      entry.target.classList.add('is-visible');

      // **關鍵：觸發後立即停止觀察此元素**
      observerInstance.unobserve(entry.target);
      console.log(`Animation triggered once for: ${entry.target.className}, unobserving.`); // 調試信息
    }
    // **不再需要 else 分支來移除 class，因為只觸發一次**
  });
};

// observerOptions 和其他函數 (init, observeElements, disconnect) 可以保持不變
// ... (initScrollObserver, observeElements, disconnectObserver) ...
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1, // 進入視口 10% 時觸發
};

export function initScrollObserver() {
  if (observer) return;
  observer = new IntersectionObserver(observerCallback, observerOptions);
  console.log("Scroll Observer (Once Mode) Initialized");
}

export function observeElements(selector = '.animate-on-scroll') {
 if (!observer) { initScrollObserver(); }
  // 使用 setTimeout 確保 DOM 更新完成
  setTimeout(() => {
     const elements = document.querySelectorAll(selector);
     elements.forEach(el => {
          // 可以在這裡檢查是否已經有 is-visible，避免重複觀察已完成的
          if (!el.classList.contains('is-visible')) {
              observer.observe(el);
          }
     });
  }, 0);
}

 export function disconnectObserver() {
     if (observer) {
       observer.disconnect();
       observer = null;
       console.log("Scroll Observer Disconnected");
     }
   }