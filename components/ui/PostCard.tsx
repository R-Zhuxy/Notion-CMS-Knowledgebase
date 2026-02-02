import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Post } from '@/lib/parser'

// 简单的日期格式化
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/${post.id}`} className="block group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-stone-200">
        {/* 封面图区域 */}
        <div className="relative h-48 w-full overflow-hidden bg-stone-100">
          {post.cover ? (
            <Image
              src={post.cover}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            // 如果没有封面，显示一个极简的占位色块
            <div className="flex h-full items-center justify-center text-stone-300">
              <span className="text-4xl">📝</span>
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="line-clamp-2 text-lg font-bold text-stone-800 group-hover:text-black">
              {post.title}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-stone-500">
             {/* 这里以后可以加文章摘要，目前先留白 */}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className="text-xs text-stone-400 font-mono">
            {formatDate(post.date)}
          </span>
          <Badge variant="secondary" className="text-xs font-normal bg-stone-100 text-stone-600">
            阅读
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}