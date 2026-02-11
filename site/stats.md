# 统计

<script setup>
import { computed } from 'vue';
import { data as stats } from './.vitepress/stats.data';
import { data as reports } from './.vitepress/reports-index.data';

// 计算平均每天字数
const avgWordsPerDay = computed(() => {
  if (stats.total === 0) return 0;
  return Math.round(stats.totalWords / stats.total);
});

// 按年份统计
const yearStats = computed(() => {
  return Object.entries(stats.byYear)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year.localeCompare(a.year));
});

// 按月份统计（最近12个月）
const monthStats = computed(() => {
  return Object.entries(stats.byMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 12);
});

// 最长的日报
const longestReport = computed(() => {
  return [...reports].sort((a, b) => b.wordCount - a.wordCount)[0];
});

// 最短的日报
const shortestReport = computed(() => {
  return [...reports].sort((a, b) => a.wordCount - b.wordCount)[0];
});

// 计算完成率（本月）
const thisMonthCompletion = computed(() => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  return Math.round((stats.thisMonth / currentDay) * 100);
});
</script>

<div class="stats-container">
  <h2>总体统计</h2>
  
  <div class="stats-grid">
    <div class="stat-card large">
      <div class="stat-icon">📝</div>
      <div class="stat-value">{{ stats.total }}</div>
      <div class="stat-label">总日报数</div>
    </div>
    
    <div class="stat-card large">
      <div class="stat-icon">🔥</div>
      <div class="stat-value">{{ stats.streak }}</div>
      <div class="stat-label">连续天数</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">{{ stats.thisYear }}</div>
      <div class="stat-label">今年日报</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">{{ stats.thisMonth }}</div>
      <div class="stat-label">本月日报</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">{{ stats.totalWords.toLocaleString() }}</div>
      <div class="stat-label">总字数</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">{{ stats.avgWords }}</div>
      <div class="stat-label">平均字数</div>
    </div>
  </div>
  
  <h2>时间跨度</h2>
  <div class="time-range">
    <div class="time-item">
      <div class="time-label">第一篇</div>
      <div class="time-value">{{ stats.firstDate }}</div>
    </div>
    <div class="time-arrow">→</div>
    <div class="time-item">
      <div class="time-label">最新一篇</div>
      <div class="time-value">{{ stats.lastDate }}</div>
    </div>
  </div>
  
  <h2>本月完成率</h2>
  <div class="completion-bar">
    <div class="completion-fill" :style="{ width: thisMonthCompletion + '%' }">
      {{ thisMonthCompletion }}%
    </div>
  </div>
  <p class="completion-text">
    本月已完成 {{ stats.thisMonth }} 篇日报
  </p>
  
  <h2>按年份统计</h2>
  <div class="year-stats">
    <div v-for="item in yearStats" :key="item.year" class="year-item">
      <div class="year-label">{{ item.year }} 年</div>
      <div class="year-bar">
        <div 
          class="year-fill" 
          :style="{ width: (item.count / stats.total * 100) + '%' }"
        ></div>
      </div>
      <div class="year-count">{{ item.count }} 篇</div>
    </div>
  </div>
  
  <h2>最近12个月</h2>
  <div class="month-stats">
    <div v-for="item in monthStats" :key="item.month" class="month-item">
      <div class="month-label">{{ item.month }}</div>
      <div class="month-bar">
        <div 
          class="month-fill" 
          :style="{ width: (item.count / 31 * 100) + '%' }"
        ></div>
      </div>
      <div class="month-count">{{ item.count }}</div>
    </div>
  </div>
  
  <h2>记录</h2>
  <div class="records">
    <div class="record-card">
      <div class="record-title">📏 最长日报</div>
      <div class="record-content">
        <a :href="longestReport.path">{{ longestReport.title }}</a>
        <span class="record-value">{{ longestReport.wordCount }} 字</span>
      </div>
    </div>
    
    <div class="record-card">
      <div class="record-title">📐 最短日报</div>
      <div class="record-content">
        <a :href="shortestReport.path">{{ shortestReport.title }}</a>
        <span class="record-value">{{ shortestReport.wordCount }} 字</span>
      </div>
    </div>
  </div>
</div>

<style scoped>
.stats-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.stats-container h2 {
  margin: 3rem 0 1.5rem 0;
  color: var(--vp-c-brand-1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  text-align: center;
  transition: all 0.2s;
}

.stat-card.large {
  grid-column: span 2;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--vp-c-brand-1);
  line-height: 1;
}

.stat-card.large .stat-value {
  font-size: 3rem;
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
}

.time-item {
  text-align: center;
}

.time-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.time-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.time-arrow {
  font-size: 2rem;
  color: var(--vp-c-text-3);
}

.completion-bar {
  height: 40px;
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.completion-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 1rem;
  color: white;
  font-weight: 600;
  transition: width 0.5s ease;
}

.completion-text {
  text-align: center;
  margin-top: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.year-stats, .month-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.year-item, .month-item {
  display: grid;
  grid-template-columns: 100px 1fr 80px;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.year-label, .month-label {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.year-bar, .month-bar {
  height: 24px;
  background: var(--vp-c-default-soft);
  border-radius: 12px;
  overflow: hidden;
}

.year-fill, .month-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.5s ease;
}

.year-count, .month-count {
  text-align: right;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.records {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.record-card {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
}

.record-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.record-content a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s;
}

.record-content a:hover {
  color: var(--vp-c-brand-2);
}

.record-value {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .stats-container {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card.large {
    grid-column: span 1;
  }
  
  .time-range {
    flex-direction: column;
    gap: 1rem;
  }
  
  .time-arrow {
    transform: rotate(90deg);
  }
  
  .year-item, .month-item {
    grid-template-columns: 80px 1fr 60px;
    gap: 0.5rem;
  }
}
</style>
