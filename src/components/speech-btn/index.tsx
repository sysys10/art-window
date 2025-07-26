'use client'

import React, { useEffect, useState } from 'react'
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition'
import axios from 'axios'
import { Mic } from 'lucide-react'

export default function SpeechBtn() {
  const [isClient, setIsClient] = useState(false)
  const { transcript, resetTranscript, listening } = useSpeechRecognition()
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  // 음성 인식이 끝났을 때 자동으로 변환 요청
  useEffect(() => {
    if (!listening && transcript.trim()) {
      handleConvert()
    }
  }, [listening]) // listening 상태 변경 감지

  if (!isClient) return null

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>이 브라우저는 음성 인식을 지원하지 않습니다.</p>
  }

  const handleMicClick = () => {
    resetTranscript()
    setTags([]) // 기존 태그 초기화
    SpeechRecognition.startListening({ continuous: false, language: 'ko-KR' })
  }

  const handleConvert = async () => {
    if (!transcript.trim()) return
    try {
      setLoading(true)
      const res = await axios.post('/api/llm/speech', {
        text: transcript,
      })
      setTags(res.data.tags || [])
    } catch (error) {
      console.error('변환 실패:', error)
      alert('태그 변환 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <button
        onClick={handleMicClick}
        style={{
          fontSize: '5rem',
          border: 'none',
          cursor: 'pointer',
        }}
        className="bg-blue-300 hover:bg-blue-400 rounded-full p-4"
        aria-label="녹음 시작"
      >
        <Mic className="text-white text-2xl" />
      </button>
      <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
        {listening ? '듣고 있어요...' : transcript || '음성을 입력해주세요'}
      </p>
      {/* 수동 변환 버튼이 필요 없을 경우 아래 버튼 제거 가능 */}
      {/* 
      <button
        onClick={handleConvert}
        disabled={loading}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        {loading ? '변환 중...' : '변환'}
      </button>
      */}
      {tags.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <strong>추출된 태그:</strong>
          <ul>
            {tags.map((tag, idx) => (
              <li key={idx}>#{tag}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
