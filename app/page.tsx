// 这个界面的web ui特别好看，不要改！！
import { getPageData } from '@/lib/notion'
import { parseSiteConfig, mapNotionImageUrl, Post } from '@/lib/parser' // 确保这里引入了 Post 类型
import { PostCard } from '@/components/ui/PostCard'
import { Alert } from '@/components/ui/alert'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// 你的配置页 ID
const CONFIG_PAGE_ID = process.env.NOTION_ROOT_PAGE_ID || '2f8d3696e5bb805fb741e018d7375655'

export const revalidate = 60

export default async function Home() {
  const recordMap = await getPageData(CONFIG_PAGE_ID)
  
  if (!recordMap) return notFound()

  const sections = parseSiteConfig(recordMap)

  // 获取页面的根节点 ID 用于提取头图
  const rootId = Object.keys(recordMap.block)[0]
  const rootBlock = recordMap.block[rootId]?.value
  const coverUrl = (rootBlock && rootBlock.format?.page_cover && rootId)
    ? mapNotionImageUrl(rootBlock.format.page_cover, rootId)
    : null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* 固定头部：网站总标题 */}
        <section className="mb-16">
          {coverUrl && (
             <div className="relative w-full h-48 md:h-64 mb-8 rounded-xl overflow-hidden">
               <img src={coverUrl} alt="Cover" className="object-cover w-full h-full" />
             </div>
          )}
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            {rootBlock?.properties?.title?.[0]?.[0] || '知识库'}
          </h1>
          {/* 这里可以根据你的原设计保留或删除描述 */}
          <p className="text-xl text-stone-500">
             欢迎来到我的数字花园。
          </p>
        </section>

        {/* 动态渲染所有板块 */}
        {sections.map((section) => {
          // 1. 公告栏
          if (section.type === 'Alert') {
            return (
              <div key={section.id} className="mb-8">
                <Alert data={section.data} />
              </div>
            )
          }

          // 2. 数据库板块 (核心修改部分)
          if (section.type === 'PostGrid') {
            return (
              <div key={section.id} className="mt-12 mb-20">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                     <span className="w-1.5 h-6 bg-black rounded-full"></span>
                     {section.data.title}
                  </h2>
                </div>

                {/* ➤ 分叉判断：如果是 list 类型，渲染列表；否则渲染原有的 PostCard */}
                {section.data.type === 'list' ? (
                  <div className="flex flex-col gap-3">
                    {/* 这里使用 Post 类型替代 any */}
                    {section.data.posts.map((post: Post) => (
                      <Link 
                        key={post.id} 
                        href={`/${post.id}`}
                        className="group flex items-center justify-between p-4 bg-white border border-stone-200 rounded-lg hover:border-black hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-medium text-stone-700 group-hover:text-black group-hover:underline underline-offset-4 decoration-stone-400">
                            {post.title}
                          </span>
                        </div>
                        {post.date && (
                           <span className="text-sm text-stone-400 font-mono hidden md:block">
                             {new Date(post.date).toLocaleDateString('zh-CN')}
                           </span>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  // ➤ 你的原始样式配置：画廊视图
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.data.posts.map((post: Post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            )
          }
          
          // 3. 标题
          if (section.type === 'Hero') {
             return <h2 key={section.id} className="text-3xl font-bold mt-16 mb-10">{section.data.text}</h2>
          }

          // 4. 段落
          if (section.type === 'Paragraph') {
              return <p key={section.id} className="text-stone-600 leading-7 mb-4">{section.data.text}</p>
          }

          return null
        })}

      </div>
    </main>
  )
}