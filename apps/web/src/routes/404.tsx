import { createFileRoute } from '@tanstack/react-router'
import { LostPage } from '../pages/404'
import { notFoundHead } from '../seo'

export const Route = createFileRoute('/404')({
  head: notFoundHead,
  component: LostPage,
})
