import Image from 'next/image'

export default function MainPage() {
  return (
    <div className="max-w-xl mx-auto h-screen w-full bg-gray-300">
      <div className="relative w-80 h-80">
        <div className="top-6 left-10 relative w-60 h-65 overflow-hidden">
          <Image
            content="cover"
            fill
            alt="Art Window"
            src={'/images/ART_WINDOW_TEMP.jpg'}
          />
        </div>
        <Image
          fill
          alt="Art Window Frame"
          src={'/images/ART_WINDOW_FRAME.png'}
        />
      </div>
    </div>
  )
}
