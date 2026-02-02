import { getPageData } from '@/lib/notion'
import { parseSiteConfig, Section, Post, mapNotionImageUrl } from '@/lib/parser'
import { PostCard } from '@/components/ui/PostCard' 
import { Alert } from '@/components/ui/alert'


const CONFIG_PAGE_ID = '2f8d3696e5bb805fb741e018d7375655' // 你的配置页 ID
export const revalidate = 60

export default async function Home() {
  const recordMap = await getPageData(CONFIG_PAGE_ID)
  const sections = recordMap ? parseSiteConfig(recordMap) : []

  console.log('页面准备渲染的 Sections:', JSON.stringify(sections, null, 2))

  // 获取页面的根节点 ID
  const rootId = recordMap ? Object.keys(recordMap.block)[0] : null
  const rootBlock = (recordMap && rootId) ? recordMap.block[rootId]?.value : null

  // 解析头图地址
  const coverUrl = (rootBlock && rootBlock.format?.page_cover && rootId)
    ? mapNotionImageUrl(rootBlock.format.page_cover, rootId)
    : null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* 固定头部：网站总标题*/}
        <section className="mb-16">
          {/* ➤ 新增逻辑：如果存在头图，就渲染出来 */}
          {coverUrl && (
             <div className="relative w-full h-72 md:h-88 rounded-2xl overflow-hidden shadow-sm">
               {/* 使用 img 标签渲染图片，object-cover 保证图片裁切填满 */}
               <img 
                  src={coverUrl} 
                  alt="Page Cover" 
                  className="w-full h-full object-cover"
                />
             </div>
           )}
           <h1 className="text-5xl font-extrabold tracking-tight mt-16">My Knowledge Base.</h1>
        </section>

        {/* 动态板块渲染区 */}
        {sections.map((section) => {
          
          // 渲染公告
          // ✅ 修正：使用 Alert 组件接管渲染
          if (section.type === 'Alert') {
            return (
              <div key={section.id} className="mb-8"> {/* 这里控制公告栏的下边距 */}
                <Alert data={section.data} />
              </div>
            )
          }


          // 渲染文章网格 (无论是文章库，还是知识库，只要是 Database 都会变成网格)
          if (section.type === 'PostGrid') {
            return (
              <div key={section.id} className="mt-12 mb-20">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-bold text-stone-800">{section.data.title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.data.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )
          }
          
          // 渲染 Notion 里的标题
          if (section.type === 'Hero') {
             return <h2 key={section.id} className="text-3xl font-bold mt-16 mb-10">{section.data.text}</h2>
          }

          // 渲染 Hero
  
          
          if (section.type === 'Paragraph') {
              return <p key={section.id} className="text-stone-600 leading-7 mb-4">{section.data.text}</p>
          }

          return null

        })}
        
        {sections.length === 0 && <p className="text-stone-400">正在从 Notion 加载配置...</p>}
      </div>
    </main>
  )
}