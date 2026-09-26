import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { articleMarkdown, type Essay } from './essay-content'

export function EssayArticle({ essay }: { essay: Essay }) {
  return <article className="essay">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a({ href, children }) {
          const target = href?.startsWith('https://www.mauricekleine.com/essays/') && href.endsWith('.md')
            ? href.slice(0, -3)
            : href
          return <a href={target}>{children}</a>
        },
        p({ node, children }) {
          const imageOnly = node?.children.length === 1 && node.children[0].type === 'element' && node.children[0].tagName === 'img'
          return imageOnly ? <>{children}</> : <p>{children}</p>
        },
        img({ src, alt }) {
          const source = src ?? ''
          const imageUrl = new URL(source, 'https://www.mauricekleine.com')
          const localSource = imageUrl.hostname === 'www.mauricekleine.com' ? imageUrl.pathname : source
          if (imageUrl.pathname === essay.coverOriginal) {
            return <figure className="cover"><img src={essay.cover} srcSet={essay.coverSrcset} sizes={essay.coverSizes} alt={essay.coverAlt} width={essay.coverWidth} height={essay.coverHeight} fetchPriority="high" /></figure>
          }
          const basename = imageUrl.pathname.slice(imageUrl.pathname.lastIndexOf('/') + 1)
          const image = essay.images[basename]
          if (!image) throw new Error(`missing image metadata: ${essay.slug}/${basename}`)
          return <figure><img src={localSource} alt={image.alt || alt || ''} width={image.width} height={image.height} loading="lazy" decoding="async" /></figure>
        },
        code({ children }) {
          return <code>{children}</code>
        },
      }}
    >
      {articleMarkdown(essay)}
    </ReactMarkdown>
  </article>
}
