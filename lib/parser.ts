import { ExtendedRecordMap, Decoration } from 'notion-types'
// import { getTextContent } from 'notion-utils'


// --- 1. 类型定义 ---
export interface Post {
  id: string
  title: string
  cover?: string
  date?: string
}

interface AlertData {
  text: string
  icon?: string // 确保这里有 icon 字段
  color?: string
}

interface PostGridData {
  title: string
  posts: Post[]
  type?: string
}

interface HeroData {
  text: string
  level: string
}

interface ParagraphData {
  text: string
}

export type Section = 
  | { id: string; type: 'Alert'; data: AlertData }
  | { id: string; type: 'PostGrid'; data: PostGridData }
  | { id: string; type: 'Hero'; data: HeroData }
  | { id: string; type: 'Paragraph'; data: ParagraphData }

// 兼容接口
interface CustomBlock {
  id: string
  type: string
  content?: string[] // 子块 ID 列表
  collection_id?: string
  view_ids?: string[]
  format?: {
    page_cover?: string
    page_icon?: string
    block_color?: string
  }
  properties?: {
    title?: Decoration[] 
  }
  created_time?: number
}

// --- 辅助函数：深度提取文本 ---
function getTextContent(block: CustomBlock): string {
  if (!block.properties?.title) {
    return ''
  }
  return block.properties.title
    .map((item) => item[0])
    .join('')
    .trim()
}

export function mapNotionImageUrl(url: string, blockId: string) {
  if (!url) return null
  if (url.startsWith('data:')) return url
  if (url.startsWith('/images')) return `https://www.notion.so${url}`
  
  const encodedUrl = encodeURIComponent(url)
  return `https://www.notion.so/image/${encodedUrl}?table=block&id=${blockId}&cache=v2`
}

// --- 2. 解析逻辑 ---

export function parseSiteConfig(recordMap: ExtendedRecordMap): Section[] {
  const sections: Section[] = []
  
  const rootId = Object.keys(recordMap.block)[0]
  const rootBlock = recordMap.block[rootId]?.value

  if (!rootBlock || !rootBlock.content) return []

  console.log(`[Parser] 解析页面 ID: ${rootId}, 包含子块数量: ${rootBlock.content.length}`)

  for (const blockId of rootBlock.content) {
    const rawBlock = recordMap.block[blockId]?.value
    if (!rawBlock) continue

    const block = rawBlock as unknown as CustomBlock

    // ➤ A. 处理 Callout (公告)
    if (block.type === 'callout') {
        const icon = block.format?.page_icon
        const color = block.format?.block_color
        
        const textLines: string[] = []
  
        // 1. 获取 Callout 自身的主标题（第一行）
        // 注意：如果用户第一行没写字直接回车，这里是空字符串，我们也 push 进去占位
        const selfText = getTextContent(block)
        textLines.push(selfText)
        
        // 2. 遍历所有子块 (处理 Enter 产生的后续段落)
        if (block.content && block.content.length > 0) {
          for (const childId of block.content) {
            const childRaw = recordMap.block[childId]?.value
            
            if (!childRaw) {
              // 如果找不到数据，通常是因为 notion-client fetch 时没抓取深层数据
              // 但对于 Callout 的直接子块，通常是有的
              continue 
            }
  
            const childBlock = childRaw as unknown as CustomBlock
            
            // 获取子块文本
            // 关键修改：即使 childText 是空字符串（比如用户想要个空行），也要 push
            // 这样后面 join('\n') 时就会产生双换行，形成段落间隔
            const childText = getTextContent(childBlock)
            textLines.push(childText)
          }
        }
  
        // 3. 拼接所有行
        // 过滤掉首尾的空白行（trim），但保留中间的换行结构
        // filter((line, index) => ...) 这步看你喜好，如果不需要过滤空行，直接 join 即可
        // 这里建议直接 join，保留原汁原味的排版
        const fullText = textLines.join('\n').trim()
  
        if (fullText.length > 0) {
          sections.push({
            id: blockId,
            type: 'Alert',
            data: { 
              text: fullText, // 这里传过去的就是 "第一行\n第二行\n第三行"
              icon: typeof icon === 'string' ? icon : undefined,
              color: color
            }
          })
        }
        continue
      }
    // ➤ B. 处理 Database
    if (block.type === 'collection_view' || block.type === 'collection_view_page') {
        console.log('--- 发现数据库 ---')
        console.log('Block ID:', block.id)
        console.log('Collection ID:', block.collection_id)
        console.log('View IDs:', block.view_ids)

      const collectionId = block.collection_id
      if (!collectionId) continue

      const collection = recordMap.collection?.[collectionId]?.value
      const collectionName = collection?.name?.[0]?.[0] || '精选文章'
      
      const firstViewId = block.view_ids?.[0]
      const viewType = firstViewId 
        ? recordMap.collection_view?.[firstViewId]?.value?.type 
        : 'list' // 默认回落到 list

      let postIds: string[] = []
      const targetViewIds = block.view_ids || []
      
      if (recordMap.collection_query && recordMap.collection_query[collectionId]) {
        const queries = recordMap.collection_query[collectionId]
        
        for (const viewId of targetViewIds) {
          const result = queries[viewId]?.collection_group_results
          if (result?.blockIds && result.blockIds.length > 0) {
            postIds = result.blockIds
            break
          }
        }
        
        if (postIds.length === 0) {
            const allViewIds = Object.keys(queries)
            for (const viewId of allViewIds) {
                const result = queries[viewId]?.collection_group_results
                if (result?.blockIds && result.blockIds.length > 0) {
                    postIds = result.blockIds
                    break
                }
            }
        }
      }

      if (postIds.length > 0) {
        const posts = postIds.map((id): Post | null => {
          const itemRaw = recordMap.block[id]?.value
          if (!itemRaw) return null
          const item = itemRaw as unknown as CustomBlock
          
          const rawCoverUrl = item.format?.page_cover 
            ? mapNotionImageUrl(item.format.page_cover, item.id) 
            : undefined

          return {
            id: id,
            title: getTextContent(item) || '无标题',
            cover: rawCoverUrl || undefined,
            date: item.created_time ? new Date(item.created_time).toISOString() : undefined
          }
        }).filter((item): item is Post => !!item)

        console.log(`数据库 [${collectionName}] 解析出了 ${posts.length} 篇文章`)

        sections.push({
          id: blockId,
          type: 'PostGrid',
          data: {
            title: collectionName,
            posts: posts,
            type: viewType
          }
        })
      }
      continue
    }

    // ➤ C. 处理 Header
    if (block.type === 'header' || block.type === 'sub_header' || block.type === 'sub_sub_header') {
       sections.push({
         id: blockId,
         type: 'Hero',
         data: {
           text: getTextContent(block),
           level: block.type
         }
       })
       continue
    }

    // ➤ D. 处理普通文本
    if (block.type === 'text') {
        const text = getTextContent(block)
        if (text) {
            sections.push({
                id: blockId,
                type: 'Paragraph',
                data: { text }
            })
        }
    }
  }

  return sections
}