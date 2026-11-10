// يحمّل بيانات صفحة التقدم وقت البناء.
// المصدر الحالي: بذرة محلية في tracking/phase-0.yaml.
// بعد إنشاء مستودع GitHub (T-009 وT-010) يُستبدل المصدر بـ GitHub Issues، وتُحذف البذرة.
import { defineLoader } from 'vitepress'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'yaml'

type RawStatus = 'todo' | 'doing' | 'done' | 'blocked'
export type State = 'done' | 'doing' | 'ready' | 'waiting' | 'blocked'
export interface Ref { label: string; link?: string }
export interface Task {
  id: string; phase: number; status: RawStatus; role: string; type: string; title: string
  refs: Ref[]; depends: string[]; waitingOn: string[]; state: State
}
export interface Phase { id: number; title: string; weeks: string; gate: string | null; status: RawStatus; total: number; done: number }
export type CpState = 'done' | 'due' | 'upcoming'
export interface Checkpoint {
  id: string; phase: number; kind: 'checkpoint' | 'gate'; status: RawStatus; title: string
  after: string[]; waitingOn: string[]; state: CpState
}
export interface Data { source: 'seed' | 'github'; updated: string; phases: Phase[]; tasks: Task[]; checkpoints: Checkpoint[] }

declare const data: Data
export { data }

const root = process.cwd()
const seedFile = resolve(root, 'tracking/phase-0.yaml')

function refLink(r: string, adrFiles: string[]): Ref {
  if (/^D-\d+/.test(r)) return { label: r, link: '/docs/open-decisions' }
  if (/^(SPK|P-)/.test(r)) return { label: r, link: '/docs/spikes' }
  const adr = r.match(/^ADR-(\d{4})/)
  if (adr) {
    const f = adrFiles.find((x) => x.startsWith(adr[1]))
    return { label: r, link: f ? `/docs/adr/${f.replace(/\.md$/, '')}` : '/docs/adr/README' }
  }
  if (r === 'PRD') return { label: r, link: '/docs/01-prd' }
  if (/^G\d/.test(r)) return { label: r, link: '/docs/roadmap' }
  return { label: r }
}

export default defineLoader({
  watch: [seedFile],
  load(): Data {
    const doc = parse(readFileSync(seedFile, 'utf-8'))
    const adrFiles = readdirSync(resolve(root, 'docs/adr'))
    const raw: any[] = doc.tasks ?? []
    const byId = new Map(raw.map((t) => [t.id, t]))
    const tasks: Task[] = raw.map((t) => {
      const depends: string[] = t.depends ?? []
      const waitingOn = depends.filter((d) => byId.get(d)?.status !== 'done')
      const state: State =
        t.status === 'done' ? 'done'
        : t.status === 'doing' ? 'doing'
        : t.status === 'blocked' ? 'blocked'
        : waitingOn.length ? 'waiting' : 'ready'
      return { ...t, refs: (t.refs ?? []).map((r: string) => refLink(r, adrFiles)), depends, waitingOn, state }
    })
    const phases: Phase[] = (doc.phases ?? []).map((p: any) => {
      const ts = tasks.filter((t) => t.phase === p.id)
      return { ...p, total: ts.length, done: ts.filter((t) => t.state === 'done').length }
    })
    // نقطة المراجعة «مستحقة» حين تكتمل كل المهام التي تسبقها، و«قادمة» قبل ذلك
    const checkpoints: Checkpoint[] = (doc.checkpoints ?? []).map((c: any) => {
      const after: string[] = (c.after ?? []).map(String)
      const waitingOn = after.filter((a) => byId.get(a)?.status !== 'done')
      const state: CpState = c.status === 'done' ? 'done' : waitingOn.length ? 'upcoming' : 'due'
      return { ...c, after, waitingOn, state }
    })
    return { source: 'seed', updated: String(doc.updated), phases, tasks, checkpoints }
  },
})
