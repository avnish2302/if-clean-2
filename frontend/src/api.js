import axios from "axios"

export const analyzeImage = async (image) => {
  const formData = new FormData()                   // create FormData. Because backend expects "image" field. Must match multer : upload.single("image")
  formData.append("image", image)

  const res = await axios.post(                     // sends image to backend
    "http://localhost:8000/analyze-cleanliness",
    formData
  )

  return res.data;
}