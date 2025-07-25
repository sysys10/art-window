import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

const s3 = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
  }

  try {
    // 1. 파일을 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 2. Sharp로 512x512 PNG 리사이즈
    const resizedBuffer = await sharp(buffer)
      .resize(512, 512, {
        fit: 'cover',
      })
      .png()
      .toBuffer()

    // 3. S3에 업로드
    const key = `uploads/${uuidv4()}.png`

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: resizedBuffer,
        ContentType: 'image/png',
        // ACL 제거: 퍼블릭 접근은 버킷 정책으로 설정
      })
    )

    const publicUrl = `https://${process.env.S3_BUCKET_NAME!}.s3.${process.env
      .S3_REGION!}.amazonaws.com/${key}`

    return NextResponse.json({ publicUrl })
  } catch (err) {
    console.error('[Upload Error]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
