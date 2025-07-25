import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()
    console.log('imageUrl:', imageUrl)
    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })
    }

    //lucataco/realistic-vision-v5.1:2c8e954decbf70b7607a4414e5785ef9e4de4b8c51d50fb8b8b349160e0ef6bb
    const output = await replicate.run(
      //   'stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d',
      'lucataco/realistic-vision-v5.1:2c8e954decbf70b7607a4414e5785ef9e4de4b8c51d50fb8b8b349160e0ef6bb',
      {
        input: {
          image: imageUrl,
          prompt: `
            Transform the input image into a simplified outdoor background by removing all unnecessary or complex elements. 
            Only retain minimal, natural components such as trees, skies, mountains, or grass. 
            Remove any people, animals, vehicles, or man-made objects. 
            The result should be a clean, calm, and uncluttered background inspired by the input.
          `,
          width: 768,
          height: 768,
          steps: 30,
          guidance: 6.5,
          strength: 0.3,
        },
      }
    )

    // output은 이미지 URL 배열
    return NextResponse.json({ imageUrl: output.url() })
  } catch (err) {
    console.error('[Replicate Error]', err)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
