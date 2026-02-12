# 日历视图

<script setup>
import { data as reports } from './.vitepress/reports-index.data';

// 按年月分组
const reportsByMonth = {};
if (Array.isArray(reports)) {
  reports.forEach(report => {
    const key = `${report.year}-${report.month}`;
    if (!reportsByMonth[key]) {
      reportsByMonth[key] = [];
    }
    reportsByMonth[key].push(report);
  });
}

// 按时间倒序排列月份
const months = Object.keys(reportsByMonth).sort().reverse();
</script>

<div class="calendar-simple">
  <div v-for="monthKey in months" :key="monthKey" class="month-section">
    <h2>{{ monthKey.replace('-', ' 年 ') }} 月</h2>
    <div class="days-grid">
      <a 
        v-for="report in reportsByMonth[monthKey]" 
        :key="report.date"
        :href="report.path"
        class="day-card"
      >
        <div class="day-number">{{ report.day }}</div>
        <div class="day-title">{{ report.title }}</div>
        <div class="day-meta">{{ report.wordCount }} 字</div>
      </a>
    </div>
  </div>
</div>

<style scoped>
.calendar-simple {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.month-section {
  margin-bottom: 3rem;
}

.month-section h2 {
  color: var(--vp-c-brand-1);
  border-bottom: 2px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.day-card {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.day-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.day-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--vp-c-brand-1);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.day-title {
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-meta {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

@media (max-width: 768px) {
  .calendar-simple {
    padding: 1rem;
  }
  
  .days-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }
  
  .day-card {
    padding: 1rem;
  }
  
  .day-number {
    font-size: 1.5rem;
  }
}
</style>
