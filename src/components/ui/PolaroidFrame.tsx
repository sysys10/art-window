import Image from 'next/image'

export default function PolaroidFrame({
  imgSrc = '/images/ART_WINDOW_FRAME.png',
}: {
  imgSrc: string
}) {
  return (
    <div className="relative w-80 h-80">
      <div className="top-6 left-10 relative w-60 h-65 overflow-hidden">
        <Image
          content="cover"
          fill
          alt="Art Window"
          src={'/images/ART_WINDOW_TEMP.jpg'}
        />
      </div>
      <Image fill alt="Art Window Frame" src={imgSrc} />
    </div>
  )
}
