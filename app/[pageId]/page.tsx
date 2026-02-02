import { getPageData } from '@/lib/notion'
import NotionPage from '@/components/ui/NotionPage'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getPageTitle } from 'notion-utils'

interface PageProps {
  params: {
    pageId: string
  }
}

// 1. 设置 ISR 更新时间：每 60 秒检查一次 Notion 是否有更新
export const revalidate = 60

// 2. 动态生成 SEO 标题
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const recordMap = await getPageData(params.pageId)
  const { pageId } = await params
  if (!recordMap) return { title: 'Not Found' }
  if (!pageId || pageId === 'favicon.ico') {
    return { title: 'Not Found' }
  }

  const title = getPageTitle(recordMap)
  return {
    title: `${title} - 知识库`,
  }
}

// 3. 页面渲染主逻辑
export default async function DynamicPage({ params }: PageProps) {
  // 获取 URL 中的 pageId (比如 /12345 里的 12345)
  const recordMap = await getPageData(params.pageId)
  const { pageId } = await params

  if (!pageId || pageId === 'favicon.ico') {
    return <div>Page not found</div>
  }

  // 如果找不到数据，显示 404 页面
  if (!recordMap) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <NotionPage recordMap={recordMap} />
    </main>
  )
}