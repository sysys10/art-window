import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 환경변수 설정 필요
})

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    const prompt = `
다음 문장에서 느껴지는 감정을 키워드로 1~3개 추출해 주세요.
감정 키워드는 '기쁨', '슬픔', '분노', '불안', '놀람', '혐오', '평온함', '만족', '후회', '설렘' 등의 단어 중에서 선택해주세요.
문장: "${text}"
결과:
`
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    })

    const raw = completion.choices[0].message.content?.trim() || ''
    const tags = raw
      .replace(/[^가-힣,]/g, '') // 한글, 쉼표만 남김
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('OpenAI 요청 실패:', error)
    return NextResponse.json({ error: 'OpenAI 요청 실패' }, { status: 500 })
  }
}
