import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '../pages/index'
import { homeHead } from '../seo'

export const Route = createFileRoute('/')({
  head: homeHead,
  component: HomePage,
})
