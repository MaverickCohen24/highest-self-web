import { today, getDailyRubinPrompt } from '@/lib/utils'
import { getRecentCreativeEntries, getCreativeProjects, getRecentIdeas } from '@/actions/creative'
import CreativeClient from '@/components/creative/CreativeClient'

export default async function CreativePage() {
  const date = today()
  const prompt = getDailyRubinPrompt(date)
  const [entries, projects, ideas] = await Promise.all([
    getRecentCreativeEntries(),
    getCreativeProjects(),
    getRecentIdeas(),
  ])
  return <CreativeClient date={date} prompt={prompt} entries={entries} projects={projects} ideas={ideas} />
}
