import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// يقرأ أول عنوان H1 من الملف ليُستخدم في القائمة الجانبية
function h1(file: string): string {
  const m = readFileSync(file, 'utf-8').match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : file
}

const adrDir = join(process.cwd(), 'docs/adr')
const adrItems = readdirSync(adrDir)
  .filter((f) => /^\d{4}-.*\.md$/.test(f))
  .sort()
  .map((f) => ({
    text: h1(join(adrDir, f)).replace(/^ADR-(\d{4}):\s*/, '$1 · '),
    link: `/docs/adr/${f.replace(/\.md$/, '')}`,
  }))

export default defineConfig({
  lang: 'ar-SA',
  title: 'انتشار',
  description: 'المرجع الموحّد لمشروع منصة تطبيقات متاجر زد',
  base: process.env.PORTAL_BASE || '/',
  cleanUrls: true,
  srcExclude: ['research_notes/**', 'node_modules/**', 'README.md', 'tracking/**'],
  locales: {
    root: { label: 'العربية', lang: 'ar-SA', dir: 'rtl' },
  },
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap' }],
  ],
  themeConfig: {
    nav: [
      { text: 'التقدم', link: '/docs/progress' },
      { text: 'خارطة الطريق', link: '/docs/roadmap' },
      { text: 'PRD', link: '/docs/01-prd' },
      { text: 'القرارات', link: '/docs/adr/README' },
    ],
    sidebar: [
      {
        text: 'البداية',
        items: [
          { text: 'التقدم والجدول الزمني', link: '/docs/progress' },
          { text: 'خارطة الطريق', link: '/docs/roadmap' },
          { text: 'الملاحظات والمخاطر', link: '/docs/inbox' },
          { text: 'فهرس الوثائق', link: '/docs/README' },
        ],
      },
      {
        text: 'المواصفات',
        items: [
          { text: '01 · متطلبات المنتج (PRD)', link: '/docs/01-prd' },
          { text: 'قرارات المنتج', link: '/docs/open-decisions' },
          { text: 'التجارب التقنية', link: '/docs/spikes' },
        ],
      },
      {
        text: 'القرارات المعمارية',
        collapsed: false,
        items: [{ text: 'السجل والقالب', link: '/docs/adr/README' }, ...adrItems],
      },
      {
        text: 'العملية',
        items: [
          { text: 'الأدوار', link: '/docs/process/roles' },
          { text: 'مراجعة الخطة', link: '/docs/process/plan-reviews' },
          { text: 'Definition of Ready', link: '/docs/process/definition-of-ready' },
          { text: 'Definition of Done', link: '/docs/process/definition-of-done' },
          { text: 'طلب التغيير', link: '/docs/process/change-request' },
          { text: 'قالب القصة', link: '/docs/process/user-story-template' },
        ],
      },
      {
        text: 'البحث (مدخلات)',
        collapsed: true,
        items: [
          { text: 'تقرير الجدوى', link: '/reports/جدوى منصة تطبيقات متاجر زد' },
          { text: 'تقرير المزايا والتخصيص', link: '/reports/مزايا وتخصيص تطبيقات متاجر زد' },
        ],
      },
    ],
    outline: { level: [2, 3], label: 'في هذه الصفحة' },
    docFooter: { prev: 'السابق', next: 'التالي' },
    darkModeSwitchLabel: 'المظهر',
    lightModeSwitchTitle: 'الوضع الفاتح',
    darkModeSwitchTitle: 'الوضع الداكن',
    sidebarMenuLabel: 'القائمة',
    returnToTopLabel: 'العودة للأعلى',
    notFound: { title: 'الصفحة غير موجودة', quote: 'ربما نُقلت أو لم تُكتب بعد.', linkText: 'العودة للرئيسية' },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'بحث', buttonAriaLabel: 'بحث' },
          modal: {
            noResultsText: 'لا نتائج لـ',
            resetButtonTitle: 'مسح',
            footer: { selectText: 'فتح', navigateText: 'تنقل', closeText: 'إغلاق' },
          },
        },
      },
    },
  },
})
