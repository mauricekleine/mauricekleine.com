import { essays } from './essay-content'
import { staticPages } from './static-pages'

function escapeText(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function homeBody() {
  const items = essays.map((essay) => `          <li>
            <a href="/essays/${essay.slug}">${escapeText(essay.title)}</a>
            <p>${escapeText(essay.summary)}</p>
          </li>`).join('\n')
  return staticPages.index.body.replace('ESSAY_HOME_LIST', `<ol class="essay-list" reversed>\n${items}\n        </ol>`)
}

export function essaysBody() {
  const items = essays.map((essay, index) => `          <li>
            <a class="essay-cover" href="/essays/${essay.slug}" tabindex="-1" aria-hidden="true">
              <img src="${essay.cover}" srcset="${essay.coverSrcset}" sizes="${essay.coverSizes}" alt="${escapeText(essay.coverAlt)}" width="${essay.coverWidth}" height="${essay.coverHeight}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} />
            </a>
            <a href="/essays/${essay.slug}">${escapeText(essay.title)}</a>
            <p>${escapeText(essay.summary)}</p>
            <p class="essay-meta"><time datetime="${essay.date}">${escapeText(essay.dateDisplay)}</time></p>
          </li>`).join('\n')
  return staticPages.essays.body.replace('ESSAY_INDEX_LIST', `<ol class="essay-list" reversed>\n${items}\n        </ol>`)
}
