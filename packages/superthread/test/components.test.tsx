import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { Button } from '../registry/ui/button'
import { Input } from '../registry/ui/input'
import { Card, CardTitle } from '../registry/ui/card'
import { Badge } from '../registry/ui/badge'
import { Chip } from '../registry/ui/chip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../registry/ui/tabs'
import { AppSwitcher } from '../registry/ui/app-switcher'

test('core components render semantic markup and variants', () => {
  const html = renderToStaticMarkup(<>
    <Button variant="primary">continue</Button>
    <Input aria-label="ship name" />
    <Card><CardTitle>one thing</CardTitle></Card>
    <Badge state="attention">attention</Badge><Chip>fleet/004</Chip>
    <Tabs defaultValue="one"><TabsList><TabsTrigger value="one">one</TabsTrigger></TabsList><TabsContent value="one">content</TabsContent></Tabs>
    <AppSwitcher />
  </>)
  expect(html).toContain('continue')
  expect(html).toContain('ship name')
  expect(html).toContain('one thing')
  expect(html).toContain('attention')
  expect(html).toContain('fleet/004')
  expect(html).toContain('fleet')
})
