import { NotionAPI } from 'notion-client'

export const notion = new NotionAPI()

export async function getPageData(pageId: string) {
  try {
    const recordMap = await notion.getPage(pageId)
    return recordMap
  } catch (error) {
    console.error('获取 Notion 数据失败:', error)
    return null
  }
}