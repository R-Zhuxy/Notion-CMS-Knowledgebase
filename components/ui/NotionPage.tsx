'use client'

import { NotionRenderer } from 'react-notion-x'
import { ExtendedRecordMap } from 'notion-types'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ComponentProps } from 'react' // 引入 React 标准类型

// 样式
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'katex/dist/katex.min.css'

// 动态组件加载
const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then((m) => m.Code)
)
const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then((m) => m.Collection)
)
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
)
const Pdf = dynamic(() =>
  import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
  { ssr: false }
)
const Modal = dynamic(
  () => import('react-notion-x/build/third-party/modal').then((m) => m.Modal),
  { ssr: false }
)

interface NotionPageProps {
  recordMap: ExtendedRecordMap
  rootPageId?: string
}

export default function NotionPage({ recordMap, rootPageId }: NotionPageProps) {
  if (!recordMap) return null

  return (
    <div className="notion-container w-full min-h-screen pb-20 px-4">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        rootPageId={rootPageId}
        disableHeader={true}
        
        // 1. URL 映射逻辑
        mapPageUrl={(pageId) => {
          // 如果目标 ID 等于根页面 ID (rootPageId)，强制映射回网站根路径 '/'
          // 注意：你需要确保传入组件的 rootPageId 格式是 clean 的（无横杠），
          // 或者在这里做一下比较逻辑的兼容。通常比较建议两个都转成 clean uuid 比较。
          
          const cleanTargetId = pageId.replace(/-/g, '')
          const cleanRootId = rootPageId?.replace(/-/g, '')
        
          if (cleanTargetId === cleanRootId) {
            return '/'
          }
          
          return `/${pageId}`
        }}

        // 2. 自定义组件注入 (严格类型版)
        components={{
          // 使用 ComponentProps<'a'> 替换 any，这是标准的 HTML 锚点类型
          Link: ({ href, children, ...props }: ComponentProps<'a'>) => {
            return (
              <Link 
                href={href || ''} // 确保 href 不为 undefined
                {...props} 
                className="notion-link"
              >
                {children}
              </Link>
            )
          },
          Code,
          Collection,
          Equation,
          Pdf,
          Modal,
          // 如果你要开启 Image 优化，请使用以下类型定义：
          // Image: ({ src, alt, height, width, className, style, priority }: ComponentProps<typeof Image>) => { ... }
        }}
      />
    </div>
  )
}