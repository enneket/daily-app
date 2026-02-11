# 日历视图

<script setup>
import { ref, computed } from 'vue';
import { data as reports } from './.vitepress/reports-index.data';

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);

const reportsByDate = computed(() => {
  const map = {};
  reports.forEach(report => {
    map[report.date] = report;
  });
  return map;
});

const monthDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  
  const days = [];
  
  // 填充前面的空白
  for (let i = 0; i < startWeekday; i++) {
    days.push(null);
  }
  
  // 填充日期
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({
      day,
      date: dateStr,
      hasReport: !!reportsByDate.value[dateStr],
      report: reportsByDate.value[dateStr]
    });
  }
  
  return days;
});

const monthName = computed(() => {
  return `${currentYear.value} 年 ${currentMonth.value} 月`;
});

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

function goToToday() {
  const now = new Date();
  currentYear.value = now.getFullYear();
  currentMonth.value = now.getMonth() + 1;
}
</script>

<div class="calendar-container">
  <div class="calendar-header">
    <button @click="prevMonth" class="nav-btn">← 上月</button>
    <h2 class="month-title">{{ monthName }}</h2>
    <button @click="nextMonth" class="nav-btn">下月 →</button>
  </div>
  
  <button @click="goToToday" class="today-btn">回到今天</button>
  
  <div class="calendar">
    <div class="weekdays">
      <div class="weekday">日</div>
      <div class="weekday">一</div>
      <div class="weekday">二</div>
      <div class="weekday">三</div>
      <div class="weekday">四</div>
      <div class="weekday">五</div>
      <div class="weekday">六</div>
    </div>
    
    <div class="days">
      <div
        v-for="(day, index) in monthDays"
        :key="index"
        :class="['day', { 'has-report': day?.hasReport, 'empty': !day }]"
      >
        <template v-if="day">
          <a v-if="day.hasReport" :href="day.report.path" class="day-link">
            <span class="day-number">{{ day.day }}</span>
            <span class="day-indicator">●</span>
          </a>
          <span v-else class="day-number">{{ day.day }}</span>
        </template>
      </div>
    </div>
  </div>
  
  <div class="calendar-legend">
    <span class="legend-item">
      <span class="legend-dot has-report">●</span>
      有日报
    </span>
    <span class="legend-item">
      <span class="legend-dot">○</span>
      无日报
    </span>
  </div>
</div>

<style scoped>
.calendar-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.month-title {
  font-size: 1.5rem;
  margin: 0;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.today-btn {
  display: block;
  margin: 0 auto 1.5rem;
  padding: 0.5rem 1.5rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.today-btn:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.calendar {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 1.5rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: var(--vp-c-text-2);
  padding: 0.5rem;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  position: relative;
}

.day.empty {
  background: transparent;
}

.day.has-report {
  background: var(--vp-c-brand-soft);
}

.day-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.day.has-report .day-link:hover {
  background: var(--vp-c-brand-1);
  color: white;
  border-radius: 8px;
}

.day-number {
  font-size: 1.1rem;
  font-weight: 500;
}

.day-indicator {
  font-size: 0.5rem;
  color: var(--vp-c-brand-1);
  margin-top: 0.25rem;
}

.day.has-report .day-link:hover .day-indicator {
  color: white;
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  font-size: 1.5rem;
  line-height: 1;
}

.legend-dot.has-report {
  color: var(--vp-c-brand-1);
}

@media (max-width: 768px) {
  .calendar-container {
    padding: 1rem;
  }
  
  .calendar {
    padding: 1rem;
  }
  
  .day-number {
    font-size: 0.9rem;
  }
  
  .day-indicator {
    font-size: 0.4rem;
  }
}
</style>
