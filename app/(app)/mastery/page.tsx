import { getLifeTask, getSkills } from '@/actions/mastery'
import MasteryClient from '@/components/mastery/MasteryClient'

export default async function MasteryPage() {
  const [lifeTask, skills] = await Promise.all([getLifeTask(), getSkills()])
  return <MasteryClient lifeTask={lifeTask} skills={skills} />
}
