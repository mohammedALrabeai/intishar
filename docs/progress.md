---
outline: false
aside: false
---

# التقدم والجدول الزمني

<script setup>
import { data } from '../.vitepress/progress.data.ts'
import ProgressBoard from '../.vitepress/theme/components/ProgressBoard.vue'
</script>

<ProgressBoard :data="data" />
