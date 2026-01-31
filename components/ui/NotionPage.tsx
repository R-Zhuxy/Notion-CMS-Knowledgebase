'use client' // 👈 这行代码告诉 Next.js：这个组件要发给浏览器运行

import { NotionRenderer } from 'react-notion-x'
import { ExtendedRecordMap } from 'notion-types'
import 'react-notion-x/src/styles.css' // 样式在这里引入

interface NotionPageProps {
  recordMap: ExtendedRecordMap
}

export default function NotionPage({ recordMap }: NotionPageProps) {
  if (!recordMap) {
    return null
  }

  return (
    // mx-auto: 水平居中
    // max-w-4xl: 最大宽度限制 (根据你的审美可调)
    // px-4: 左右留出一点空隙，手机上不贴边
    // py-10: 上下留白
    // <div className="notion-container mx-auto max-w-6xl px-4 pb-6">
    <div className="notion-container w-full min-h-screen pb-20">
      <NotionRenderer 
        recordMap={recordMap} 
        fullPage={true} 
        darkMode={false}
        disableHeader={true} 
      />
    </div>
  )
}