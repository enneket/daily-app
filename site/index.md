---
layout: home

hero:
  name: 我的日报
  text: 记录每一天的成长
  tagline: 持续记录，见证进步
  actions:
    - theme: brand
      text: 查看最新
      link: /latest
    - theme: alt
      text: 日历视图
      link: /calendar
---

<script setup>
import { data as reports } from './.vitepress/reports-index.data';
import { data as stats } from './.vitepress/stats.data';

const recentReports = reports.slice(0, 10);
</script>

<div class="home-content">
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">{{ stats.total }}</div>
      <div class="stat-label">总日报数</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ stats.streak }}</div>
      <div class="stat-label">连续天数</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ stats.thisMonth }}</div>
      <div class="stat-label">本月日报</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ stats.avgWords }}</div>
      <div class="stat-label">平均字数</div>
    </div>
  </div>

  <h2>最近日报</h2>
  <div class="reports-list">
    <div v-for="report in recentReports" :key="report.date" class="report-item">
      <div class="report-meta">
        <span class="report-date">{{ report.date }}</span>
        <span class="report-words">{{ report.wordCount }} 字</span>
      </div>
      <h3><a :href="report.path">{{ report.title }}</a></h3>
      <p class="report-summary">{{ report.summary }}</p>
      <div class="report-times">
        <span v-for="entry in report.timeEntries.slice(0, 3)" :key="entry.time" class="time-tag">
          {{ entry.time }}
        </span>
        <span v-if="report.timeEntries.length > 3" class="time-more">
          +{{ report.timeEntries.length - 3 }}
        </span>
      </div>
    </div>
  </div>
</div>

<style scoped>
.home-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
}

.stat-card {
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--vp-c-brand-1);
  line-height: 1;
}

.stat-label {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.reports-list {
  margin-top: 2rem;
}

.report-item {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border-left: 4px solid var(--vp-c-brand-1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.report-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.report-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.report-date {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.report-words {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.report-item h3 {
  margin: 0.5rem 0;
  font-size: 1.25rem;
}

.report-item h3 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.report-item h3 a:hover {
  color: var(--vp-c-brand-1);
}

.report-summary {
  color: var(--vp-c-text-2);
  margin: 0.75rem 0;
  line-height: 1.6;
}

.report-times {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.time-tag {
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: monospace;
}

.time-more {
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .home-content {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1.5rem 1rem;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}
</style>
