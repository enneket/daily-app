# 归档

<script setup>
import { ref, computed } from 'vue';
import { data as reports } from './.vitepress/reports-index.data';

const selectedYear = ref('all');
const selectedMonth = ref('all');

// 按年份分组
const reportsByYear = computed(() => {
  const grouped = {};
  reports.forEach(report => {
    if (!grouped[report.year]) {
      grouped[report.year] = [];
    }
    grouped[report.year].push(report);
  });
  return grouped;
});

// 可用的年份
const years = computed(() => {
  return Object.keys(reportsByYear.value).sort().reverse();
});

// 可用的月份（根据选中的年份）
const months = computed(() => {
  if (selectedYear.value === 'all') return [];
  
  const monthSet = new Set();
  reportsByYear.value[selectedYear.value]?.forEach(report => {
    monthSet.add(report.month);
  });
  
  return Array.from(monthSet).sort().reverse();
});

// 过滤后的日报
const filteredReports = computed(() => {
  let filtered = reports;
  
  if (selectedYear.value !== 'all') {
    filtered = filtered.filter(r => r.year === selectedYear.value);
    
    if (selectedMonth.value !== 'all') {
      filtered = filtered.filter(r => r.month === selectedMonth.value);
    }
  }
  
  return filtered;
});

// 按月分组显示
const groupedReports = computed(() => {
  const grouped = {};
  
  filteredReports.value.forEach(report => {
    const key = `${report.year}-${report.month}`;
    if (!grouped[key]) {
      grouped[key] = {
        year: report.year,
        month: report.month,
        reports: []
      };
    }
    grouped[key].reports.push(report);
  });
  
  return Object.values(grouped).sort((a, b) => {
    return `${b.year}-${b.month}`.localeCompare(`${a.year}-${a.month}`);
  });
});

function resetFilters() {
  selectedYear.value = 'all';
  selectedMonth.value = 'all';
}
</script>

<div class="archive-container">
  <div class="filters">
    <div class="filter-group">
      <label>年份：</label>
      <select v-model="selectedYear" class="filter-select">
        <option value="all">全部</option>
        <option v-for="year in years" :key="year" :value="year">
          {{ year }} 年
        </option>
      </select>
    </div>
    
    <div class="filter-group" v-if="selectedYear !== 'all'">
      <label>月份：</label>
      <select v-model="selectedMonth" class="filter-select">
        <option value="all">全部</option>
        <option v-for="month in months" :key="month" :value="month">
          {{ month }} 月
        </option>
      </select>
    </div>
    
    <button @click="resetFilters" class="reset-btn">重置</button>
  </div>
  
  <div class="archive-stats">
    共找到 <strong>{{ filteredReports.length }}</strong> 篇日报
  </div>
  
  <div class="archive-list">
    <div v-for="group in groupedReports" :key="`${group.year}-${group.month}`" class="month-group">
      <h2 class="month-title">{{ group.year }} 年 {{ group.month }} 月</h2>
      <div class="month-reports">
        <div v-for="report in group.reports" :key="report.date" class="archive-item">
          <div class="archive-date">{{ report.day || report.date.split('-')[2] }}</div>
          <div class="archive-content">
            <h3><a :href="report.path">{{ report.title }}</a></h3>
            <p class="archive-summary">{{ report.summary }}</p>
            <div class="archive-meta">
              <span class="meta-item">{{ report.wordCount }} 字</span>
              <span class="meta-item">{{ report.timeEntries?.length || 0 }} 个时间点</span>
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

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.filter-select {
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: var(--vp-c-brand-1);
}

.filter-select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.reset-btn {
  padding: 0.5rem 1rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

.reset-btn:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.archive-stats {
  padding: 1rem;
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
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
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .reset-btn {
    margin-left: 0;
    width: 100%;
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
