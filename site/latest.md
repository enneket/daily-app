# 最新日报

<script setup>
import { data as reports } from './.vitepress/reports-index.data';
import { useRouter } from 'vitepress';
import { onMounted } from 'vue';

const router = useRouter();
const safeReports = Array.isArray(reports) ? reports : [];

onMounted(() => {
  if (safeReports.length > 0) {
    // 重定向到最新的日报
    router.go(safeReports[0].path);
  }
});
</script>

<div class="loading">
  <p>正在跳转到最新日报...</p>
  <p v-if="reports.length === 0">暂无日报</p>
</div>

<style scoped>
.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--vp-c-text-2);
}
</style>
