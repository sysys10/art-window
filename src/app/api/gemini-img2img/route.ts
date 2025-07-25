// app/api/gemini-img2img/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Modality } from '@google/genai'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

/* ------------------------------------------------------------------ */
/* 1)  클라이언트 & S3 초기화                                          */
/* ------------------------------------------------------------------ */
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

const s3 = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

/* 고정 프롬프트 ------------------------------------------------------ */
const prompt = `
Transform the input image into a bright and dreamlike outdoor background, removing all unnecessary or complex elements.
Preserve only minimal, natural components such as softly glowing skies, gentle trees, distant mountains, or serene grass fields.
Eliminate all people, animals, vehicles, and man-made objects.
The final result should evoke a calm, ethereal, and uncluttered atmosphere inspired by nature.
`.trim()

/* ------------------------------------------------------------------ */
/* 2) POST 핸들러                                                     */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    /* 2‑1) 클라이언트 데이터 추출 */
    const { imageBase64, mimeType } = await req.json()
    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: 'Missing imageBase64 or mimeType' },
        { status: 400 }
      )
    }

    /* 2‑2) Gemini 호출 (img2img) */
    const contents = [
      { text: prompt },
      { inlineData: { mimeType, data: imageBase64 } },
    ]

    const genRes = (await genAI.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    })) as any

    const part = genRes.candidates[0]?.content?.parts.find(
      (p) => 'inlineData' in p
    )
    if (!part?.inlineData?.data) {
      return NextResponse.json(
        { error: 'No image returned by model' },
        { status: 500 }
      )
    }

    /* 2‑3) Base64 → Buffer → S3 업로드 */
    const outputBase64 = part.inlineData.data
    const outBuffer = Buffer.from(outputBase64, 'base64')
    const s3Key = `outputs/${uuidv4()}.png`

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: s3Key,
        Body: outBuffer,
        ContentType: 'image/png',
      })
    )

    const s3Url = `https://${process.env.S3_BUCKET_NAME!}.s3.${process.env
      .S3_REGION!}.amazonaws.com/${s3Key}`

    /* 2‑4) 응답 */
    return NextResponse.json({ imageUrl: s3Url, success: true })
  } catch (err: any) {
    console.error('[Gemini Error]', err)
    return NextResponse.json(
      { error: 'Image generation failed', details: err?.message ?? 'unknown' },
      { status: 500 }
    )
  }
}
