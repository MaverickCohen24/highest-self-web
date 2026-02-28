import { today, getDailyReflectionPrompt } from '@/lib/utils'
import { getRecentReflections, getAllPatternTags } from '@/actions/reflections'
import ReflectionsClient from '@/components/reflections/ReflectionsClient'

export default async function ReflectionsPage() {
  const date = today()
  const prompt = getDailyReflectionPrompt(date)
  const [reflections, tags] = await Promise.all([
    getRecentReflections(),
    getAllPatternTags(),
  ])
  return <ReflectionsClient date={date} prompt={prompt} reflections={reflections} tags={tags} />
}
