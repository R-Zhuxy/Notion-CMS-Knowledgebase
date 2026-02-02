import React from 'react'

interface AlertProps {
  data: {
    text: string
    icon?: string
    color?: string
  }
}

// 颜色映射保持不变...
const colorMap: Record<string, string> = {
  'gray': 'bg-gray-100 border-gray-200 text-gray-800',
  'gray_background': 'bg-gray-100 border-gray-200 text-gray-800',
  'brown': 'bg-orange-50 border-orange-200 text-orange-900',
  'brown_background': 'bg-orange-50 border-orange-200 text-orange-900',
  'orange': 'bg-orange-100 border-orange-200 text-orange-900',
  'orange_background': 'bg-orange-100 border-orange-200 text-orange-900',
  'yellow': 'bg-yellow-50 border-yellow-200 text-yellow-900',
  'yellow_background': 'bg-yellow-50 border-yellow-200 text-yellow-900',
  'green': 'bg-green-50 border-green-200 text-green-900',
  'green_background': 'bg-green-50 border-green-200 text-green-900',
  'blue': 'bg-blue-50 border-blue-200 text-blue-900',
  'blue_background': 'bg-blue-50 border-blue-200 text-blue-900',
  'purple': 'bg-purple-50 border-purple-200 text-purple-900',
  'purple_background': 'bg-purple-50 border-purple-200 text-purple-900',
  'pink': 'bg-pink-50 border-pink-200 text-pink-900',
  'pink_background': 'bg-pink-50 border-pink-200 text-pink-900',
  'red': 'bg-red-50 border-red-200 text-red-900',
  'red_background': 'bg-red-50 border-red-200 text-red-900',
  'teal': 'bg-teal-50 border-teal-200 text-teal-900',
  'teal_background': 'bg-teal-50 border-teal-200 text-teal-900',
  'default': 'bg-gray-50 border-gray-200 text-gray-800'
}

export function Alert({ data }: AlertProps) {
  const { text, icon, color } = data
  const colorClass = color && colorMap[color] ? colorMap[color] : colorMap.default

  // ➤ 1. 判断是否为图片路径 (以 / 开头 或 http 开头)
  const isIconImage = icon && (icon.startsWith('/') || icon.startsWith('http'))
  
  // ➤ 2. 如果是 Notion 的相对路径，补全域名
  const iconSrc = icon?.startsWith('/') ? `https://www.notion.so${icon}` : icon

  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 my-4 shadow-sm ${colorClass}`}>
      {icon && (
        <span className="flex-shrink-0 mt-0.5 select-none">
          {/* ➤ 3. 根据类型渲染：是图片就用 img，不是就直接渲染文字(Emoji) */}
          {isIconImage ? (
            <img 
              src={iconSrc} 
              alt="icon" 
              className="w-6 h-6 opacity-80" // 这里可以调整图标大小
            />
          ) : (
            <span className="text-xl">{icon}</span>
          )}
        </span>
      )}
      <div className="whitespace-pre-wrap break-words text-base leading-loose pt-0.5">
        {text}
      </div>
    </div>
  )
}