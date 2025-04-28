import { ref } from 'vue'

export function useUpload() {
  const selectedFile = ref(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      selectedFile.value = file
    }
  }

  return { selectedFile, handleFileChange }
}
