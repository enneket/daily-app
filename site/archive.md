# 归档

<script setup>
import { data as reports } from './.vitepress/reports-index.data';

const safeReports = Array.isArray(reports) ? reports : [];

// 按年月分组
const groupedByMonth = {};
safeReports.forEach(report => {
  const key = `${report.year}-${report.month}`;
  if (!groupedByMonth[key]) {
    groupedByMonth[key] = {
      year: report.year,
      month: report.month,
      reports: []
    };
  }
  groupedByMonth[key].reports.push(report);
});

// 按时间倒序
const months = Object.values(groupedByMonth).sort((a, b) => {
  return `${b.year}-${b.month}`.localeCompare(`${a.year}-${a.month}`);
});
</script>

<div class="archive-container">
  <div class="archive-stats">
    共 <strong>{{ safeReports.length }}</strong> 篇日报
  </div>
  
  <div class="archive-list">
    <div v-for="group in months" :key="`${group.year}-${group.month}`" class="month-group">
      <h2 class="month-title">{{ group.year }} 年 {{ group.month }} 月</h2>
      <div class="month-reports">
        <div v-for="report in group.reports" :key="report.date" class="archive-item">
          <div class="archive-date">{{ report.day }}</div>
          <div class="archive-content">
            <h3><a :href="report.path">{{ report.title }}</a></h3>
            <p class="archive-summary">{{ report.summary }}</p>
            <div class="archive-meta">
              <span class="meta-item">{{ report.wordCount }} 字</span>
              <span class="meta-item">{{ (report.timeEntries || []).length }} 个时间点</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style scoped>
.archive-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.archive-stats {
  padding: 1rem;
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.archive-stats strong {
  color: var(--vp-c-brand-1);
  font-size: 1.25rem;
}

.archive-list {
  margin-top: 2rem;
}

.month-group {
  margin-bottom: 3rem;
}

.month-title {
  font-size: 1.5rem;
  color: var(--vp-c-brand-1);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--vp-c-divider);
}

.month-reports {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.archive-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  transition: all 0.2s;
}

.archive-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.archive-date {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 12px;
  font-size: 1.5rem;
  font-weight: bold;
}

.archive-content {
  flex: 1;
}

.archive-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.archive-content h3 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.archive-content h3 a:hover {
  color: var(--vp-c-brand-1);
}

.archive-summary {
  color: var(--vp-c-text-2);
  margin: 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.6;
}

.archive-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
}

.meta-item {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

@media (max-width: 768px) {
  .archive-container {
    padding: 1rem;
  }
  
  .archive-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .archive-date {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
}
</style>
