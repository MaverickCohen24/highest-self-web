import { getDayEntry } from '@/actions/journal'
import DayEntryClient from '@/components/journal/DayEntryClient'
import { notFound } from 'next/navigation'

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const data = await getDayEntry(date)
  if (!data.entry) notFound()
  return <DayEntryClient date={date} data={data} />
}
