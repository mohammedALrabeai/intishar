// يحمّل بيانات صفحة التقدم وقت البناء من GitHub Issues (ADR-0001).
// المهام: Issues عنوانها «المعرّف · العنوان». المراحل: Milestones باسم «المرحلة N · الاسم».
// الحالة: مغلقة = منجز، ووسم status:doing = قيد التنفيذ، ووسم status:blocked = متوقف.
// الربط بين المهام في جسم الـ Issue بأسطر «المراجع:» و«يعتمد على:» و«بعد:».
import { defineLoader } from 'vitepress'
import { execSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

type RawStatus = 'todo' | 'doing' | 'done' | 'blocked'
export type State = 'done' | 'doing' | 'ready' | 'waiting' | 'blocked'
export interface Ref { label: string; link?: string }
export interface Task {
  id: string; phase: number; status: RawStatus; role: string; type: string; title: string; url: string; module: string
  refs: Ref[]; depends: string[]; waitingOn: string[]; state: State
}
export interface Phase { id: number; title: string; weeks: string; gate: string | null; status: RawStatus; total: number; done: number }
export type CpState = 'done' | 'due' | 'upcoming'
export interface Checkpoint {
  id: string; phase: number; kind: 'checkpoint' | 'gate'; status: RawStatus; title: string; url: string
  after: string[]; waitingOn: string[]; state: CpState
}
export interface Data {
  source: 'github' | 'offline'; repo: string; error?: string; updated: string
  phases: Phase[]; tasks: Task[]; checkpoints: Checkpoint[]
}

declare const data: Data
export { data }

const root = process.cwd()
const sh = (cmd: string) => { try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return '' } }

function repoName(): string {
  if (process.env.PORTAL_REPO) return process.env.PORTAL_REPO
  const m = sh('git remote get-url origin').match(/github\.com[:/](.+?)(\.git)?$/)
  return m ? m[1] : ''
}

async function gh(repo: string, token: string, path: string): Promise<any[]> {
  const out: any[] = []
  for (let page = 1; page < 50; page++) {
    const r = await fetch(`https://api.github.com/repos/${repo}${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    })
    if (!r.ok) throw new Error(`GitHub ${r.status} على ${path}`)
    const items = await r.json()
    out.push(...items)
    if (items.length < 100) break
  }
  return out
}

let modFiles: string[] = []
function refLink(r: string, adrFiles: string[]): Ref {
  if (/^D-\d+/.test(r)) return { label: r, link: '/docs/open-decisions' }
  if (/^(SPK|P-)/.test(r)) return { label: r, link: '/docs/spikes' }
  const adr = r.match(/^ADR-(\d{4})/)
  if (adr) {
    const f = adrFiles.find((x) => x.startsWith(adr[1]))
    return { label: r, link: f ? `/docs/adr/${f.replace(/\.md$/, '')}` : '/docs/adr/README' }
  }
  const mod = r.match(/^M(\d{2})$/)
  if (mod) {
    const f = modFiles.find((x) => x.startsWith(r + '-'))
    return { label: r, link: f ? `/docs/modules/${f.replace(/\.md$/, '')}` : '/docs/modules/README' }
  }
  if (r === 'PRD') return { label: r, link: '/docs/01-prd' }
  if (/^G\d/.test(r)) return { label: r, link: '/docs/roadmap' }
  return { label: r }
}

const list = (body: string, key: string): string[] => {
  const m = (body || '').match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  return m ? m[1].split(/[,،]/).map((s) => s.trim()).filter(Boolean) : []
}
const labelValue = (labels: any[], prefix: string) =>
  (labels.find((l) => l.name.startsWith(prefix))?.name ?? '').slice(prefix.length)

export default defineLoader({
  async load(): Promise<Data> {
    const repo = repoName()
    const updated = new Date().toISOString().slice(0, 10)
    const empty = (error: string): Data => ({ source: 'offline', repo, error, updated, phases: [], tasks: [], checkpoints: [] })
    const token = process.env.GITHUB_TOKEN || sh('gh auth token')
    if (!repo) return empty('لم يُعرف مستودع GitHub')
    if (!token) return empty('لا يوجد رمز GitHub: عيّن GITHUB_TOKEN أو سجّل الدخول بـ gh')

    try {
      const [milestones, issues] = await Promise.all([
        gh(repo, token, '/milestones?state=all'),
        gh(repo, token, '/issues?state=all'),
      ])
      const adrFiles = readdirSync(resolve(root, 'docs/adr'))
      modFiles = readdirSync(resolve(root, 'docs/modules'))
      const phaseOf = new Map<number, number>()
      const rawPhases = milestones
        .map((m) => {
          const n = m.title.match(/المرحلة\s*(\d+)/)
          if (!n) return null
          const id = Number(n[1])
          phaseOf.set(m.number, id)
          const gate = (m.description || '').match(/البوابة:\s*(\S+)/)?.[1]
          return {
            id, title: m.title.split('·').slice(1).join('·').trim() || m.title,
            weeks: (m.description || '').match(/الأسابيع:\s*(\S+)/)?.[1] ?? '',
            gate: gate && gate !== '—' ? gate : null,
          }
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.id - b.id) as { id: number; title: string; weeks: string; gate: string | null }[]

      const rows = issues.filter((i) => !i.pull_request).map((i) => {
        const m = i.title.match(/^([A-Z]+-\d+)\s*·\s*(.+)$/)
        const labels = i.labels ?? []
        const status: RawStatus = i.state === 'closed' ? 'done'
          : labels.some((l: any) => l.name === 'status:doing') ? 'doing'
          : labels.some((l: any) => l.name === 'status:blocked') ? 'blocked' : 'todo'
        return {
          id: m ? m[1] : `#${i.number}`, title: m ? m[2] : i.title, url: i.html_url, status,
          phase: i.milestone ? phaseOf.get(i.milestone.number) ?? -1 : -1,
          role: labelValue(labels, 'role:') || '—', type: labelValue(labels, 'type:') || '—', module: labelValue(labels, 'module:'),
          kind: labels.some((l: any) => l.name === 'gate') ? 'gate' : labels.some((l: any) => l.name === 'checkpoint') ? 'checkpoint' : null,
          body: i.body || '',
        }
      })
      const byId = new Map(rows.map((r) => [r.id, r]))
      const notDone = (ids: string[]) => ids.filter((d) => byId.get(d)?.status !== 'done')
      const sortId = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id, 'en', { numeric: true })

      const tasks: Task[] = rows.filter((r) => !r.kind).map((r) => {
        const depends = list(r.body, 'يعتمد على')
        const waitingOn = notDone(depends)
        const state: State = r.status === 'done' ? 'done' : r.status === 'doing' ? 'doing'
          : r.status === 'blocked' ? 'blocked' : waitingOn.length ? 'waiting' : 'ready'
        return {
          id: r.id, phase: r.phase, status: r.status, role: r.role, type: r.type, title: r.title, url: r.url, module: r.module,
          refs: list(r.body, 'المراجع').map((x) => refLink(x, adrFiles)), depends, waitingOn, state,
        }
      }).sort(sortId)

      const checkpoints: Checkpoint[] = rows.filter((r) => r.kind).map((r) => {
        const after = list(r.body, 'بعد')
        const waitingOn = notDone(after)
        const state: CpState = r.status === 'done' ? 'done' : waitingOn.length ? 'upcoming' : 'due'
        return { id: r.id, phase: r.phase, kind: r.kind as 'checkpoint' | 'gate', status: r.status, title: r.title, url: r.url, after, waitingOn, state }
      }).sort(sortId)

      const current = rawPhases.find((p) => rows.some((r) => r.phase === p.id && r.status !== 'done'))?.id
      const phases: Phase[] = rawPhases.map((p) => {
        const ts = tasks.filter((t) => t.phase === p.id)
        const all = rows.filter((r) => r.phase === p.id)
        const status: RawStatus = all.length && all.every((r) => r.status === 'done') ? 'done' : p.id === current ? 'doing' : 'todo'
        return { ...p, status, total: ts.length, done: ts.filter((t) => t.state === 'done').length }
      })
      return { source: 'github', repo, updated, phases, tasks, checkpoints }
    } catch (e: any) {
      return empty(String(e?.message ?? e))
    }
  },
})
