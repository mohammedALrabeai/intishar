<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import type { Checkpoint, CpState, Data, State, Task } from '../../progress.data'

const props = defineProps<{ data: Data }>()

const stateLabel: Record<State, string> = {
  doing: 'قيد التنفيذ',
  ready: 'جاهز للبدء',
  waiting: 'بانتظار مهام سابقة',
  blocked: 'متوقف',
  done: 'منجز',
}
const order: State[] = ['doing', 'ready', 'waiting', 'blocked', 'done']
const roles = ['الكل', 'المنفذ', 'المشرف', 'المعتمِد']
const role = ref('الكل')

const current = computed(() => props.data.phases.find((p) => p.status === 'doing') ?? props.data.phases[0] ?? { id: 0, title: '—', weeks: '', gate: null, status: 'todo', total: 0, done: 0 })
const all = computed(() => props.data.tasks)
const pct = (d: number, t: number) => (t ? Math.round((d / t) * 100) : 0)
const count = (s: State) => all.value.filter((t) => t.state === s).length

const groups = computed(() =>
  order
    .map((s) => ({
      state: s,
      tasks: all.value.filter((t) => t.state === s && (role.value === 'الكل' || t.role === role.value)),
    }))
    .filter((g) => g.tasks.length),
)
const showDone = ref(false)
const link = (l?: string) => (l ? withBase(l) : undefined)
const phaseLabel = (t: Task) => `م${t.phase}`

const cpLabel: Record<CpState, string> = { done: 'تمت', due: 'مستحقة الآن', upcoming: 'قادمة' }
const nextCp = computed<Checkpoint | undefined>(() => props.data.checkpoints.find((c) => c.state !== 'done'))
const cpsOf = (phase: number) => props.data.checkpoints.filter((c) => c.phase === phase)
const reviewsLink = withBase('/docs/process/plan-reviews')
</script>

<template>
  <div class="pb">
    <div v-if="data.source === 'offline'" class="pb-offline">
      تعذّر جلب التقدم من GitHub: {{ data.error }}
    </div>
    <section class="pb-cards">
      <div class="pb-card">
        <div class="pb-k">المرحلة الحالية</div>
        <div class="pb-v">{{ current.id }} · {{ current.title }}</div>
        <div class="pb-bar"><span :style="{ width: pct(current.done, current.total) + '%' }" /></div>
        <div class="pb-s">{{ current.done }} من {{ current.total }} مهمة · <bdi dir="ltr">{{ pct(current.done, current.total) }}%</bdi></div>
      </div>
      <a v-if="nextCp" class="pb-card pb-cp-card" :href="reviewsLink">
        <div class="pb-k">نقطة المراجعة القادمة</div>
        <div class="pb-v">◆ {{ nextCp.id }} · {{ nextCp.title }}</div>
        <div class="pb-s">
          <template v-if="nextCp.state === 'due'">مستحقة الآن: اكتملت المهام التي تسبقها</template>
          <template v-else>بعد: {{ nextCp.waitingOn.join('، ') }}</template>
        </div>
      </a>
      <div class="pb-card"><div class="pb-k">قيد التنفيذ</div><div class="pb-n">{{ count('doing') }}</div></div>
      <div class="pb-card"><div class="pb-k">جاهز للبدء</div><div class="pb-n">{{ count('ready') }}</div></div>
      <div class="pb-card"><div class="pb-k">بانتظار</div><div class="pb-n">{{ count('waiting') }}</div></div>
    </section>

    <h2 id="timeline">الجدول الزمني</h2>
    <ol class="pb-timeline">
      <li v-for="p in data.phases" :key="p.id" :class="['pb-phase', 'is-' + p.status]">
        <div class="pb-dot" />
        <div class="pb-phase-body">
          <div class="pb-phase-head">
            <strong>{{ p.id }}. {{ p.title }}</strong>
            <span class="pb-chip">الأسابيع <bdi dir="ltr">{{ p.weeks }}</bdi></span>
            <span v-if="p.gate" class="pb-chip pb-gate">بوابة {{ p.gate }}</span>
          </div>
          <div v-if="p.total" class="pb-bar small"><span :style="{ width: pct(p.done, p.total) + '%' }" /></div>
          <div class="pb-s">
            <template v-if="p.total">{{ p.done }} من {{ p.total }} مهمة</template>
            <template v-else>تُفصَّل مهامها عند الوصول إليها</template>
          </div>
          <ul v-if="cpsOf(p.id).length" class="pb-cps">
            <li v-for="c in cpsOf(p.id)" :key="c.id" :class="['pb-cp', 'cp-' + c.state]">
              <span class="pb-diamond">◆</span>
              <a :href="c.url" target="_blank" rel="noopener" class="pb-cp-id">{{ c.id }}</a>
              <span class="pb-cp-title">{{ c.title }}</span>
              <span :class="['pb-chip', c.state === 'due' ? 'pb-gate' : 'ghost']">{{ cpLabel[c.state] }}</span>
            </li>
          </ul>
        </div>
      </li>
    </ol>

    <h2 id="tasks">المهام</h2>
    <div class="pb-filter" role="group" aria-label="تصفية حسب الدور">
      <button v-for="r in roles" :key="r" :class="{ on: role === r }" @click="role = r">{{ r }}</button>
    </div>

    <div v-for="g in groups" :key="g.state" class="pb-group">
      <h3 :class="'st-' + g.state">
        {{ stateLabel[g.state] }} <span class="pb-count">{{ g.tasks.length }}</span>
        <button v-if="g.state === 'done'" class="pb-toggle" @click="showDone = !showDone">
          {{ showDone ? 'إخفاء' : 'إظهار' }}
        </button>
      </h3>
      <ul v-if="g.state !== 'done' || showDone" class="pb-list">
        <li v-for="t in g.tasks" :key="t.id" class="pb-task">
          <a class="pb-id" :href="t.url" target="_blank" rel="noopener"><code>{{ t.id }}</code></a>
          <div class="pb-main">
            <div class="pb-title">{{ t.title }}</div>
            <div class="pb-meta">
              <span class="pb-chip">{{ t.role }}</span>
              <span class="pb-chip ghost">{{ t.type }}</span>
              <span class="pb-chip ghost">{{ phaseLabel(t) }}</span>
              <template v-for="r in t.refs" :key="r.label">
                <a v-if="r.link" class="pb-ref" :href="link(r.link)">{{ r.label }}</a>
                <span v-else class="pb-ref">{{ r.label }}</span>
              </template>
              <span v-if="t.waitingOn.length" class="pb-wait">ينتظر: {{ t.waitingOn.join('، ') }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <p class="pb-src">
      آخر تحديث: {{ data.updated }} ·
      المصدر: <a :href="'https://github.com/' + data.repo + '/issues'" target="_blank" rel="noopener">GitHub Issues</a>.
      لتحديث الحالة: أغلق الـ Issue عند الإنجاز، أو أضف الوسم <code>status:doing</code> عند البدء.
    </p>
  </div>
</template>

<style scoped>
.pb { margin-top: 8px; }
.pb-cards { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.pb-cards > .pb-card { grid-column: span 2; }
.pb-cards > .pb-card:first-child, .pb-cards > .pb-cp-card { grid-column: span 3; }
@media (max-width: 720px) { .pb-cards { grid-template-columns: 1fr 1fr; } .pb-cards > .pb-card { grid-column: span 1; } .pb-cards > .pb-card:first-child, .pb-cards > .pb-cp-card { grid-column: 1 / -1; } }
a.pb-cp-card { color: inherit; text-decoration: none; transition: border-color .2s; }
a.pb-cp-card:hover { border-color: var(--vp-c-brand-1); }
.pb-cps { list-style: none; padding: 0 !important; margin: 8px 0 0 !important; display: grid; gap: 4px; }
.pb-cp { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 13px; margin: 0 !important; }
.pb-diamond { color: var(--vp-c-text-3); font-size: 11px; }
.cp-due .pb-diamond { color: var(--vp-c-warning-1); }
.cp-done .pb-diamond { color: var(--vp-c-brand-1); }
.pb-cp-id { font-weight: 600; direction: ltr; unicode-bidi: isolate; }
.pb-cp-title { color: var(--vp-c-text-2); }
.pb-card { border: 1px solid var(--vp-c-divider); border-radius: 12px; padding: 14px 16px; background: var(--vp-c-bg-soft); }
.pb-k { font-size: 13px; color: var(--vp-c-text-2); }
.pb-v { font-weight: 600; margin: 4px 0 10px; }
.pb-n { font-size: 28px; font-weight: 700; color: var(--vp-c-brand-1); line-height: 1.4; }
.pb-s { font-size: 13px; color: var(--vp-c-text-2); margin-top: 6px; }
.pb-bar { height: 8px; border-radius: 99px; background: var(--vp-c-default-soft); overflow: hidden; }
.pb-bar.small { height: 6px; margin-top: 8px; }
.pb-bar span { display: block; height: 100%; background: var(--vp-c-brand-1); border-radius: 99px; }

.pb-timeline { list-style: none; padding: 0; margin: 0; border-inline-start: 2px solid var(--vp-c-divider); }
.pb-phase { position: relative; padding: 0 0 18px; padding-inline-start: 22px; margin: 0; }
.pb-dot { position: absolute; inset-inline-start: -8px; top: 6px; width: 14px; height: 14px; border-radius: 50%; background: var(--vp-c-bg); border: 2px solid var(--vp-c-divider); }
.pb-phase.is-done .pb-dot { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
.pb-phase.is-doing .pb-dot { border-color: var(--vp-c-brand-1); box-shadow: 0 0 0 4px var(--vp-c-brand-soft); }
.pb-phase.is-doing .pb-phase-head strong { color: var(--vp-c-brand-1); }
.pb-phase.is-todo { opacity: 0.75; }
.pb-phase-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

.pb-chip { font-size: 12px; padding: 1px 8px; border-radius: 99px; background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); white-space: nowrap; }
.pb-chip.ghost { background: var(--vp-c-default-soft); color: var(--vp-c-text-2); }
.pb-gate { background: var(--vp-c-warning-soft); color: var(--vp-c-warning-1); }

.pb-filter { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0 4px; }
.pb-filter button { border: 1px solid var(--vp-c-divider); border-radius: 99px; padding: 4px 14px; font-size: 14px; color: var(--vp-c-text-2); }
.pb-filter button.on { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: var(--vp-c-white); }

.pb-group h3 { display: flex; align-items: center; gap: 8px; }
.pb-count { font-size: 13px; color: var(--vp-c-text-2); font-weight: 500; }
.pb-toggle { font-size: 13px; color: var(--vp-c-brand-1); margin-inline-start: auto; }
.st-doing { color: var(--vp-c-brand-1); }
.st-blocked { color: var(--vp-c-danger-1); }
.pb-list { list-style: none; padding: 0 !important; margin: 0 !important; }
.pb-task { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--vp-c-divider); margin: 0 !important; }
.pb-id { flex: none; font-size: 12px; height: fit-content; }
.pb-main { min-width: 0; }
.pb-title { font-weight: 500; }
.pb-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 4px; font-size: 13px; }
.pb-ref { font-size: 12px; direction: ltr; unicode-bidi: isolate; }
.pb-wait { font-size: 12px; color: var(--vp-c-warning-1); }
.pb-src { font-size: 13px; color: var(--vp-c-text-2); margin-top: 24px; }
.pb-offline { border: 1px solid var(--vp-c-danger-1); background: var(--vp-c-danger-soft); border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; }
a.pb-id { text-decoration: none; }
</style>
