import { getPageData } from '@/lib/notion'
import NotionPage from '@/components/ui/NotionPage'
import { notFound, redirect } from 'next/navigation' // ➤ 修改点 1：引入 redirect
import { Metadata } from 'next'
import { getPageTitle, parsePageId } from 'notion-utils'

// ➤ 建议把你的根页面 ID 放在这里，或者从环境变量/配置文件引入
const ROOT_PAGE_ID = '2f8d3696-e5bb-805f-b741-e018d7375655'

type PageProps = {
  params: Promise<{
    pageId: string
  }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const pageId = parsePageId(resolvedParams.pageId)
  
  if (!pageId) return { title: 'Not Found' }

  const recordMap = await getPageData(pageId)
  if (!recordMap) return { title: 'Not Found' }

  return {
    title: `${getPageTitle(recordMap)} - 知识库`,
  }
}

export default async function DynamicPage({ params }: PageProps) {
  // 第一步：先解包 params
  const resolvedParams = await params
  
  // 第二步：清洗 ID
  const pageId = parsePageId(resolvedParams.pageId)

  // 如果 ID 无效或者是 favicon，直接返回
  if (!pageId || pageId === 'favicon.ico') {
    return notFound()
  }

  // ➤ 修改点 2：核心修复逻辑 —— 路由守卫
  // 如果当前访问的 pageId 等于 根页面ID，说明用户（或者面包屑导航）试图访问通用渲染页
  // 我们强行把它重定向回网站根目录 '/'，让 app/page.tsx 去接管渲染
  const cleanPageId = pageId.replace(/-/g, '')
  const cleanRootId = ROOT_PAGE_ID.replace(/-/g, '')

  if (cleanPageId === cleanRootId) {
    redirect('/') 
  }

  // 第三步：获取数据
  const recordMap = await getPageData(pageId)

  if (!recordMap) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 最好也把 rootPageId 传进去，配合你在 NotionPage.tsx 里修改的 mapPageUrl 
         这样组件内部生成的链接也会更准确 
      */}
      <NotionPage recordMap={recordMap} rootPageId={ROOT_PAGE_ID} />
    </main>
  )
}