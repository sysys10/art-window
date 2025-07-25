import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import sharp from 'sharp'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File

    if (!file || file.type !== 'image/png') {
      return NextResponse.json({ error: 'PNG image required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const resizedImageBuffer = await sharp(buffer)
      .resize(256, 256)
      .png()
      .toBuffer()

    // ✅ 핵심: File API로 래핑
    const wrapped = new File([resizedImageBuffer], 'image.png', {
      type: 'image/png',
    })

    const response = await openai.images.createVariation({
      image: wrapped,
      n: 1,
      size: '256x256',
    })
    if (!response.data) {
      // 일단
      return
    }

    return NextResponse.json({ imageUrl: response.data[0].url })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Image generation failed' },
      { status: 500 }
    )
  }
}
