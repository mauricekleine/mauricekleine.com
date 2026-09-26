import { createFileRoute } from '@tanstack/react-router'
import { essays } from '../essay-content'
import { EssaysPage } from '../pages/essays'
import { essaysHead } from '../seo'

export const Route = createFileRoute('/essays')({
  head: () => essaysHead(essays),
  component: EssaysPage,
})
