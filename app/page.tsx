import { getPageData } from '@/lib/notion'
// 👇 注意这里：我们要引入刚才写的那个 Client Component，而不是直接引入 react-notion-x
import NotionPage from '@/components/ui/NotionPage' 

// ⚠️ 请再次确认这里填了你的 ID
const PAGE_ID = '2f8d3696e5bb8019936fcd6589d25a05' 

export default async function Home() {
  // 1. 在服务端获取数据 (这一步依然是在服务器上发生的，很安全)
  const recordMap = await getPageData(PAGE_ID)

  // 2. 将数据传递给负责渲染的客户端组件
  return (
    <main className="min-h-screen">
      {recordMap ? (
        <NotionPage recordMap={recordMap} />
      ) : (
        <div className="p-10 text-red-500">无法获取数据，请检查 Page ID。</div>
      )}
    </main>
  )
}