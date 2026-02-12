# 总体统计

<ClientOnly>
<script setup>
import { data as reports } from './.vitepress/reports-index.data';
import { data as stats } from './.vitepress/stats.data';

const safeReports = Array.isArray(reports) ? reports : [];
const safeStats = stats || {
  total: 0,
  streak: 0,
  thisYear: 0,
  thisMonth: 0,
  totalWords: 0,
  avgWords: 0,
  byMonth: {},
  byYear: {}
};

// 将对象转换为数组，避免 v-for 遍历对象的问题
const yearStatsArray = Object.entries(safeStats.byYear || {})
  .map(([year, count]) => ({ year, count }))
  .sort((a, b) => b.year.localeCompare(a.year));

const monthStatsArray = Object.entries(safeStats.byMonth || {})
  .map(([month, count]) => ({ month, count }))
  .sort((a, b) => b.month.localeCompare(a.month));

const hasTimeRange = safeStats.firstDate && safeStats.lastDate;
</script>

<div class="stats-container">
  <div class="stats-grid">
    <div class="stat-card large">
      <div class="stat-icon">📝</div>
      <div class="stat-value">{{ safeStats.total }}</div>
      <div class="stat-label">总日报数</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">{{ safeStats.thisYear }}</div>
      <div class="stat-label">今年日报</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">{{ safeStats.thisMonth }}</div>
      <div class="stat-label">本月日报</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">{{ safeStats.totalWords.toLocaleString() }}</div>
      <div class="stat-label">总字数</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">{{ safeStats.avgWords }}</div>
      <div class="stat-label">平均字数</div>
    </div>
  </div>

  <h2 v-if="hasTimeRange">时间跨度</h2>
  <div class="time-range" v-if="hasTimeRange">
    <div class="range-item">
      <div class="range-label">第一篇</div>
      <div class="range-value">{{ safeStats.firstDate }}</div>
    </div>
    <div class="range-divider">→</div>
    <div class="range-item">
      <div class="range-label">最新一篇</div>
      <div class="range-value">{{ safeStats.lastDate }}</div>
    </div>
  </div>

  <h2 v-if="yearStatsArray.length > 0">按年统计</h2>
  <div class="year-stats" v-if="yearStatsArray.length > 0">
    <div 
      v-for="item in yearStatsArray" 
      :key="item.year"
      class="year-item"
    >
      <div class="year-label">{{ item.year }} 年</div>
      <div class="year-bar">
        <div 
          class="year-bar-fill" 
          :style="{ width: `${(item.count / safeStats.total * 100)}%` }"
        ></div>
      </div>
      <div class="year-count">{{ item.count }} 篇</div>
    </div>
  </div>

  <h2 v-if="monthStatsArray.length > 0">按月统计</h2>
  <div class="month-stats" v-if="monthStatsArray.length > 0">
    <div 
      v-for="item in monthStatsArray" 
      :key="item.month"
      class="month-item"
    >
      <div class="month-label">{{ item.month }}</div>
      <div class="month-count">{{ item.count }} 篇</div>
    </div>
  </div>
</div>
</ClientOnly>

<style scoped>
.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
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

.stat-card.large {
  grid-column: span 2;
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
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

.time-range {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  margin: 2rem 0;
}

.range-item {
  text-align: center;
}

.range-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.range-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.range-divider {
  font-size: 2rem;
  color: var(--vp-c-text-3);
}

.year-stats {
  margin: 2rem 0;
}

.year-item {
  display: grid;
  grid-template-columns: 100px 1fr 80px;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.year-label {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.year-bar {
  height: 24px;
  background: var(--vp-c-default-soft);
  border-radius: 12px;
  overflow: hidden;
}

.year-bar-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.3s;
}

.year-count {
  text-align: right;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.month-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.month-item {
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  text-align: center;
}

.month-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.month-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--vp-c-brand-1);
}

@media (max-width: 768px) {
  .stats-container {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card.large {
    grid-column: span 2;
  }
  
  .time-range {
    flex-direction: column;
    gap: 1rem;
  }
  
  .range-divider {
    transform: rotate(90deg);
  }
  
  .year-item {
    grid-template-columns: 80px 1fr 60px;
    gap: 0.5rem;
  }
  
  .month-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
