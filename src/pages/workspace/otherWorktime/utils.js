/**
 * 其他工时工具函数
 *
 * 【作用说明】
 * 提供工时计算、日期格式化等通用功能
 */

/**
 * 计算两个时间段的重叠分钟数
 * 用于计算工作时间与休息时间的重叠部分
 *
 * @param {number} start1 - 第一个时间段开始时间戳
 * @param {number} end1 - 第一个时间段结束时间戳
 * @param {number} start2 - 第二个时间段开始时间戳
 * @param {number} end2 - 第二个时间段结束时间戳
 * @returns {number} 重叠的分钟数
 */
function calculateOverlap(start1, end1, start2, end2) {
  const start = Math.max(start1, start2);
  const end = Math.min(end1, end2);
  const overlap = (end - start) / 60000;
  return overlap > 0 ? overlap : 0;
}

/**
 * 计算人员工时（扣除休息时间）
 *
 * 【计算规则】
 * - 午休：12:00 - 13:30（90分钟）
 * - 晚休：17:30 - 18:00（30分钟）
 * - 晚班休息：23:30 - 次日00:30（60分钟）
 *
 * 【特殊处理】
 * - 如果时间段完全在 12:00-13:30 之间，不扣除休息时间
 * - 如果完全在休息时间段内，工时为 0
 * - 跨休息时间段时，自动扣除重叠部分
 *
 * @param {Date|number} beginDate - 开始时间
 * @param {Date|number} endDate - 结束时间
 * @returns {number} 工时（分钟）
 */
export function calculateActManTime(beginDate, endDate) {
  const MILLISECONDS_IN_MINUTE = 60000;
  const beginTimestamp =
    beginDate instanceof Date ? beginDate.getTime() : beginDate;
  const endTimestamp = endDate instanceof Date ? endDate.getTime() : endDate;

  // 时间无效或结束时间早于开始时间
  if (!beginTimestamp || !endTimestamp || endTimestamp <= beginTimestamp) {
    return 0;
  }

  const beginDateObj = new Date(beginTimestamp);

  // 检查 beginDate 是否恰好是 00:00:00
  const isMidnight =
    beginDateObj.getHours() === 0 &&
    beginDateObj.getMinutes() === 0 &&
    beginDateObj.getSeconds() === 0;

  // 创建次日对象用于晚班吃饭时间段
  const nextDay = new Date(beginTimestamp);
  nextDay.setDate(nextDay.getDate() + 1);

  // 创建前一天对象
  const previousDay = new Date(beginTimestamp);
  previousDay.setDate(previousDay.getDate() - 1);

  // 检查时间段是否完全在 12:00 到 13:30 之间
  const lunchStart = new Date(beginTimestamp);
  lunchStart.setHours(12, 0, 0, 0);
  const lunchEnd = new Date(beginTimestamp);
  lunchEnd.setHours(13, 30, 0, 0);
  const isInLunchPeriod =
    beginTimestamp >= lunchStart.getTime() &&
    endTimestamp <= lunchEnd.getTime();

  // 如果时间段完全在 12:00 到 13:30 之间，不计算休息时间
  if (isInLunchPeriod) {
    return Math.round((endTimestamp - beginTimestamp) / MILLISECONDS_IN_MINUTE);
  }

  // 定义休息时间段
  const restPeriods = [
    {
      // 午休 12:00 - 13:30
      start: new Date(beginTimestamp).setHours(12, 0, 0, 0),
      end: new Date(beginTimestamp).setHours(13, 30, 0, 0),
    },
    {
      // 晚间休息 17:30 - 18:00
      start: new Date(beginTimestamp).setHours(17, 30, 0, 0),
      end: new Date(beginTimestamp).setHours(18, 0, 0, 0),
    },
  ];

  // 动态设置晚班休息时间段
  if (isMidnight) {
    // 如果 beginDate 是 00:00:00，晚班休息时间是前一天 23:30 到当天 00:30
    restPeriods.push({
      start: new Date(previousDay).setHours(23, 30, 0, 0),
      end: new Date(beginTimestamp).setHours(0, 30, 0, 0),
    });
  } else {
    // 否则，晚班休息时间是当天 23:30 到次日 00:30
    restPeriods.push({
      start: new Date(beginTimestamp).setHours(23, 30, 0, 0),
      end: new Date(nextDay).setHours(0, 30, 0, 0),
    });
  }

  // 计算总工时
  let actManTime = Math.round(
    (endTimestamp - beginTimestamp) / MILLISECONDS_IN_MINUTE
  );

  // 计算休息时间重叠
  let totalRestTime = 0;
  restPeriods.forEach((period) => {
    totalRestTime += calculateOverlap(
      beginTimestamp,
      endTimestamp,
      period.start,
      period.end
    );
  });

  // 判断是否完全在休息时间段内
  const isDuringRest = restPeriods.some(
    (period) => beginTimestamp >= period.start && endTimestamp <= period.end
  );

  if (isDuringRest) {
    actManTime = 0;
  } else {
    actManTime -= totalRestTime;
    actManTime = actManTime < 0 ? 0 : actManTime;
  }

  return actManTime;
}

/**
 * 格式化日期时间为字符串
 *
 * @param {Date} date - 日期对象
 * @param {string} format - 格式，默认 'YYYY-MM-DD HH:mm'
 * @returns {string} 格式化后的字符串
 */
export function formatDateTime(date, format = "YYYY-MM-DD HH:mm") {
  if (!date) return "";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * 节流函数
 * 防止表单重复提交
 *
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒），默认 3000
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay = 3000) {
  let isThrottling = false;
  return function (...args) {
    if (isThrottling) return;
    isThrottling = true;
    func.apply(this, args);
    setTimeout(() => {
      isThrottling = false;
    }, delay);
  };
}
