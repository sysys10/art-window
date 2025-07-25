'use client'
import React, { useState, useRef, ChangeEvent } from 'react'
import { Upload, FileImage, Loader2, Download } from 'lucide-react'
import Image from 'next/image'

interface ProcessResponse {
  result?: string
  success?: boolean
  error?: string
  details?: string
  imageUrl?: string
}

export default function GeminiImageProcessor() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      setSelectedImage(file)
      setError('')
      setResult('')

      // Create preview
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data:image/jpeg;base64, prefix
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const processImage = async (): Promise<void> => {
    if (!selectedImage) {
      setError('Please select an image first')
      return
    }

    setIsProcessing(true)
    setError('')
    setResult('')

    try {
      const imageBase64 = await convertToBase64(selectedImage)

      const response = await fetch('/api/gemini-img2img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageBase64,
          mimeType: selectedImage.type,
        }),
      })

      const data: ProcessResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image')
      }

      setResult(data.imageUrl || 'No result received')
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while processing the image'
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = (): void => {
    setSelectedImage(null)
    setImagePreview('')
    setResult('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gemini Image Background Simplifier
        </h1>
        <p className="text-gray-600">
          Transform your images into clean, minimal outdoor backgrounds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-700 mb-2">
                Choose an image to process
              </span>
              <span className="text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB
              </span>
            </label>
          </div>

          {imagePreview && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Original Image
              </h3>
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={processImage}
              disabled={!selectedImage || isProcessing}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileImage className="w-5 h-5 mr-2" />
                  Process Image
                </>
              )}
            </button>

            <button
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-red-600">
                  <h3 className="font-medium">Error</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Processing Result
              </h3>
              <div className="bg-gray-50 border rounded-lg p-4">
                <Image src={result} width={400} height={400} />
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Processing Image
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Analyzing and simplifying your image...
                  </p>
                </div>
              </div>
            </div>
          )}

          {!result && !error && !isProcessing && (
            <div className="text-center py-12 text-gray-500">
              <FileImage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Upload an image to see the processing results here</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          How it works
        </h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            • Upload any image with complex backgrounds or multiple elements
          </p>
          <p>
            • The AI will analyze and describe how to simplify it into a clean
            outdoor background
          </p>
          <p>• Remove people, animals, vehicles, and man-made objects</p>
          <p>
            • Keep only natural elements like trees, sky, mountains, or grass
          </p>
        </div>
      </div>
    </div>
  )
}
