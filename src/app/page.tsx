'use client'
import SpeechBtn from '@/components/speech-btn'
import { Image } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  return (
    <div className="w-full h-full flex justify-center items-center">
      <SpeechBtn />
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
          onClick={() => {
            router.push('/image-upload')
          }}
          style={{
            fontSize: '5rem',
            border: 'none',
            cursor: 'pointer',
          }}
          className="bg-blue-300 hover:bg-blue-400 rounded-full p-4"
          aria-label="녹음 시작"
        >
          <Image className="text-white text-2xl" />
        </button>
        <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
          사진을 입력해주세요
        </p>
      </div>
    </div>
  )
}
