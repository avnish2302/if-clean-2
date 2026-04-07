import { useEffect, useState, useRef } from "react"
import { analyzeImage } from "./api"

export default function App() {
  const [image, setImage] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasChecked, setHasChecked] = useState(false)
  const [preview, setPreview] = useState(null)

  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const renderResult = () => {
    if (error) return <p className="text-red-400">{error}</p>
    if (!result) return <p>No result</p>
    if (!result.valid)
      return <p className="text-yellow-400">{result.reason}</p>

    const status = result.cleanliness?.status;
    const confidence = result.cleanliness?.confidence ?? 0

    // CLEAN
    if (status === "clean") {
      return (
        <div>
          <p className="text-green-400 font-semibold">Clean</p>{" "}
          <p className="text-sm text-gray-400">
            Confidence: {(confidence * 100).toFixed(0)}%
          </p>
          <p className="text-gray-400 text-sm">No issues found</p>
        </div>
      )
    }

    // DIRTY
    if (status === "dirty") {
      return (
        <div>
          <p className="text-red-400 font-semibold">Dirty</p>{" "}
          {/* if status is dirty, show Dirty in red */}
          <p className="text-sm text-gray-400">
            Confidence: {(confidence * 100).toFixed(0)}%
          </p>
          {result.cleanliness?.issues?.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {result.cleanliness.issues.map((issue, i) => (
                <li
                  key={i}
                  className="bg-[#1a1a1a] border border-[#3f3f3f] rounded-lg px-3 py-2"
                >
                  {issue}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">Issues not clearly detected</p> // fallback. If AI says dirty but no issues found
          )}
        </div>
      )
    }

    // UNKNOWN
    return (
      <div>
        <p className="text-yellow-400 font-semibold">Uncertain</p>
        <p className="text-sm text-gray-400">
          Confidence: {(confidence * 100).toFixed(0)}%
        </p>
        <p className="text-gray-400 text-sm">
          Unable to confidently determine cleanliness
        </p>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!image) return

    try {
      setLoading(true)
      setError(null)
      setHasChecked(true)

      const data = await analyzeImage(image)
      setResult(data)
    } catch (err) {
      console.log(err)
      setError("Something went wrong")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (   // primary return block
    <div className="min-h-screen bg-[#212121] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-[#2f2f2f] rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl text-center font-semibold">Analyser Tool</h1>

        {/* Upload */}
        <label className="block w-full bg-[#1a1a1a] border border-[#3f3f3f] rounded-lg p-3 cursor-pointer text-sm text-gray-300">
          {image ? image.name : "Upload Image"}
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              const file = e.target.files[0]
              if (!file) return
              if (preview) {
                URL.revokeObjectURL(preview)
              }
              loading
              const url = URL.createObjectURL(file)

              setImage(file)
              setPreview(url)
              setResult(null)
              setHasChecked(false)
              setError(null)
            }}
            className="hidden"
          />
        </label>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading || !image}
            className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2
                        bg-white text-black hover:bg-gray-200
                        disabled:bg-gray-600 disabled:text-gray-300
                        disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {loading ? (
              <>
                Analyzing
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              </>
            ) : (
              "Analyze"
            )}
          </button>

          <button
            onClick={() => {
              if (preview) URL.revokeObjectURL(preview);

              setImage(null)
              setPreview(null)
              setResult(null)
              setError(null)
              setHasChecked(false)

              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
            className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600"
          >
            Reset
          </button>
        </div>

        {/* Result */}
        {preview && (
          <div className="flex flex-col md:flex-row gap-6 items-start bg-[#1f1f1f] p-4 rounded-xl">
            {/* IMAGE */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg mb-2">Image</h2>
              <img
                src={preview}
                alt="Uploaded"
                className="w-40 h-40 object-cover rounded-lg border border-[#3f3f3f]"
              />
            </div>

            {/* RESULT */}
            <div className="flex-1 border-l border-[#3f3f3f] pl-4">
              <h2 className="text-lg mb-2">Result</h2>
              {hasChecked && !loading && renderResult()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
