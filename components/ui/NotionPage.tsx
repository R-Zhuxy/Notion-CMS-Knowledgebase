'use client'

import { NotionRenderer } from 'react-notion-x'
import { ExtendedRecordMap } from 'notion-types'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic' // 用于动态加载重型组件

// 样式
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css' // 代码高亮样式
import 'katex/dist/katex.min.css' // 公式样式

// 动态加载 Code (代码块) 组件，减小首屏体积
const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then((m) => m.Code)
)
// 动态加载 Collection (数据库视图) 组件
const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then((m) => m.Collection)
)
// 动态加载 Equation (数学公式) 组件
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
)

interface NotionPageProps {
  recordMap: ExtendedRecordMap
  rootPageId?: string // 新增：传入根页面ID，用于判断“返回首页”等逻辑
}

export default function NotionPage({ recordMap, rootPageId }: NotionPageProps) {
  if (!recordMap) return null

  return (
    <div className="notion-container w-full min-h-screen pb-20 px-4">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        disableHeader={true}
        rootPageId={rootPageId}

        // 核心配置 1: 链接重映射
        // 告诉渲染器：遇到页面链接时，去掉 https://notion.so/前缀，只保留 pageId
        mapPageUrl={(pageId) => `/${pageId}`}

        // 核心配置 2: 注入 Next.js 组件
        components={{
          nextImage: Image, // 使用 Next.js 的优化图片组件
          nextLink: Link,   // 使用 Next.js 的无刷新路由组件
          Code,
          Collection,
          Equation,
        }}
      />
    </div>
  )
}