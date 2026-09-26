import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '../pages/about'
import { aboutHead } from '../seo'

export const Route = createFileRoute('/about')({
  head: aboutHead,
  component: AboutPage,
})
