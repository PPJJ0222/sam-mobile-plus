<!--
  辅助工时表单

  【功能说明】
  用于记录辅助性工作的工时，如设备维护、会议等

  【表单字段】
  - 工时归属: 日期时间选择器，必选，默认当前时间
  - 开始时间: 日期时间选择器，必选
  - 结束时间: 日期时间选择器，必选
  - 人员工时: 只读，由开始/结束时间自动计算
  - 设备工时: 只读，选择加工设备后自动填入
  - 工艺: 选择框，可筛选，非必填
  - 加工设备: 选择框，可筛选，非必填
  - 反馈说明: 输入框，最大500字

  【核心逻辑】
  - 开始/结束时间变化时，自动计算人员工时
  - 选择加工设备后，设备工时 = 人员工时
  - 清空设备时，设备工时清空
-->
<template>
  <div class="auxiliary-form">
    <van-form @submit="onSubmit" ref="formRef">
      <!-- 工时归属 -->
      <van-field :model-value="formatDateTime(formData.actDateTime)" is-link readonly required label="工时归属"
        placeholder="请选择工时归属时间" @click="showActDateTimePicker = true"
        :rules="[{ required: true, message: '请选择工时归属时间' }]" />

      <!-- 开始时间 -->
      <van-field :model-value="formatDateTime(formData.actBeginTime)" is-link readonly required label="开始时间"
        placeholder="请选择开始时间" @click="showBeginTimePicker = true" :rules="[{ required: true, message: '请选择开始时间' }]" />

      <!-- 结束时间 -->
      <van-field :model-value="formatDateTime(formData.actEndTime)" is-link readonly required label="结束时间"
        placeholder="请选择结束时间" @click="showEndTimePicker = true" :rules="[{ required: true, message: '请选择结束时间' }]" />

      <!-- 人员工时（只读，自动计算） -->
      <van-field v-model="formData.actManTime" readonly required label="人员工时" placeholder="由开始/结束时间自动计算"
        :rules="[{ required: true, message: '请先选择开始和结束时间' }]">
        <template #extra>
          <span class="unit">分钟</span>
        </template>
      </van-field>

      <!-- 设备工时（只读，选择设备后填入） -->
      <van-field v-model="formData.actMacTime" readonly label="设备工时" placeholder="选择加工设备后自动填入">
        <template #extra>
          <span class="unit">分钟</span>
        </template>
      </van-field>

      <!-- 工艺选择 -->
      <van-field v-model="formData.craftName" is-link readonly label="工艺" placeholder="请选择工艺"
        @click="showCraftPicker = true" />

      <!-- 加工设备选择 -->
      <van-field v-model="formData.actByMacText" is-link readonly label="加工设备" placeholder="请选择加工设备"
        @click="showDevicePicker = true" />

      <!-- 反馈说明 -->
      <van-field v-model="formData.prdRemark" type="textarea" label="反馈说明" placeholder="请输入反馈说明（最多500字）" maxlength="500"
        show-word-limit rows="3" />

      <!-- 提交和重置按钮 -->
      <div class="button-group">
        <van-button type="primary" native-type="submit" class="submit-btn">
          提交
        </van-button>
        <van-button type="default" @click="onReset" class="reset-btn">
          重置
        </van-button>
      </div>
    </van-form>

    <!-- 工时归属时间选择器（步骤式：先选日期，点下一步选时间） -->
    <van-popup v-model:show="showActDateTimePicker" position="bottom">
      <van-picker-group title="选择工时归属时间" :tabs="['选择日期', '选择时间']" next-step-text="下一步" @confirm="onActDateTimeConfirm"
        @cancel="showActDateTimePicker = false">
        <van-date-picker v-model="actDatePickerValue" :min-date="minDate" :max-date="maxDate" />
        <van-time-picker v-model="actTimePickerValue" :columns-type="['hour', 'minute']"
          :min-hour="actTimeHourFilter.minHour" :max-hour="actTimeHourFilter.maxHour" :min-time="actTimeLimit.minTime"
          :max-time="actTimeLimit.maxTime" />
      </van-picker-group>
    </van-popup>

    <!-- 开始时间选择器（步骤式：先选日期，点下一步选时间） -->
    <van-popup v-model:show="showBeginTimePicker" position="bottom">
      <van-picker-group title="选择开始时间" :tabs="['选择日期', '选择时间']" next-step-text="下一步" @confirm="onBeginTimeConfirm"
        @cancel="showBeginTimePicker = false">
        <van-date-picker v-model="beginDatePickerValue" :min-date="minDate" :max-date="maxDate" />
        <van-time-picker v-model="beginTimePickerValue" :columns-type="['hour', 'minute']"
          :min-hour="beginTimeHourFilter.minHour" :max-hour="beginTimeHourFilter.maxHour"
          :min-time="beginTimeLimit.minTime" :max-time="beginTimeLimit.maxTime" />
      </van-picker-group>
    </van-popup>

    <!-- 结束时间选择器（步骤式：先选日期，点下一步选时间） -->
    <van-popup v-model:show="showEndTimePicker" position="bottom">
      <van-picker-group title="选择结束时间" :tabs="['选择日期', '选择时间']" next-step-text="下一步" @confirm="onEndTimeConfirm"
        @cancel="showEndTimePicker = false">
        <van-date-picker v-model="endDatePickerValue" :min-date="minDate" :max-date="maxDate" />
        <van-time-picker v-model="endTimePickerValue" :columns-type="['hour', 'minute']"
          :min-hour="endTimeHourFilter.minHour" :max-hour="endTimeHourFilter.maxHour" :min-time="endTimeLimit.minTime"
          :max-time="endTimeLimit.maxTime" />
      </van-picker-group>
    </van-popup>

    <!-- 工艺选择器 -->
    <van-popup v-model:show="showCraftPicker" position="bottom">
      <van-picker :columns="craftOptions" @confirm="onCraftConfirm" @cancel="showCraftPicker = false"
        :columns-field-names="{ text: 'text', value: 'value' }" />
    </van-popup>

    <!-- 加工设备选择器 -->
    <van-popup v-model:show="showDevicePicker" position="bottom">
      <van-picker :columns="deviceOptions" @confirm="onDeviceConfirm" @cancel="showDevicePicker = false"
        :columns-field-names="{ text: 'text', value: 'value' }" />
    </van-popup>
  </div>
</template>

<script setup>
/**
 * 【Vue 3 Composition API 说明】
 * - ref: 创建响应式数据
 * - reactive: 创建响应式对象
 * - watch: 监听数据变化
 * - onMounted: 组件挂载后执行
 * - defineProps: 定义组件接收的 props
 */
import { ref, reactive, computed, onMounted, defineProps } from "vue";
import { showToast, showConfirmDialog } from "vant";
import { useRouter } from "vue-router";
import {
  getCraftByBigType,
  saveMesOtherBackList,
} from "@/api/otherWorktime";
import { getDeviceList } from "@/api/qiandiao";
import { calculateActManTime, formatDateTime, throttle } from "./utils";

// 接收父组件传递的用户信息
const props = defineProps({
  userInfo: {
    type: Object,
    default: null,
  },
});

const router = useRouter();

// 表单引用，用于表单校验
const formRef = ref(null);

// 表单数据（移除冗余的显示文本变量）
const formData = reactive({
  actDateTime: null, // 工时归属时间戳
  actBeginTime: null, // 开始时间戳
  actEndTime: null, // 结束时间戳
  actManTime: "", // 人员工时（分钟）
  actMacTime: "", // 设备工时（分钟）
  craftCode: "", // 工艺代码
  craftName: "", // 工艺名称
  actByMac: "", // 加工设备代码
  actByMacText: "", // 加工设备显示文本
  prdRemark: "", // 反馈说明
});

// ==================== 时间范围限制 ====================

/**
 * 【时间范围限制说明】
 * 只允许选择当前时间往前推72小时内的时间
 * - maxDate: 当前时间（不能选择未来）
 * - minDate: 当前时间 - 72小时
 */
const maxDate = computed(() => new Date());
const minDate = computed(() => {
  const now = new Date();
  return new Date(now.getTime() - 72 * 60 * 60 * 1000);
});

/**
 * 根据选择的日期动态计算时间选择器的小时限制
 */
const getHourFilter = (selectedDateArr) => {
  if (!selectedDateArr || selectedDateArr.length < 3) {
    return { minHour: 0, maxHour: 23 };
  }
  const selectedDate = new Date(
    Number(selectedDateArr[0]),
    Number(selectedDateArr[1]) - 1,
    Number(selectedDateArr[2])
  );
  const now = new Date();
  const min = minDate.value;
  const isMinDay = selectedDate.toDateString() === min.toDateString();
  const isToday = selectedDate.toDateString() === now.toDateString();
  return {
    minHour: isMinDay ? min.getHours() : 0,
    maxHour: isToday ? now.getHours() : 23,
  };
};

/**
 * 根据选择日期动态限制分钟范围
 */
const getTimeLimit = (selectedDateArr) => {
  if (!selectedDateArr || selectedDateArr.length < 3) {
    return { minTime: undefined, maxTime: undefined };
  }
  const selectedDate = new Date(
    Number(selectedDateArr[0]),
    Number(selectedDateArr[1]) - 1,
    Number(selectedDateArr[2])
  );
  const min = minDate.value;
  const max = maxDate.value;
  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };
  const isMinDay = selectedDate.toDateString() === min.toDateString();
  const isMaxDay = selectedDate.toDateString() === max.toDateString();
  return {
    minTime: isMinDay ? formatTime(min) : undefined,
    maxTime: isMaxDay ? formatTime(max) : undefined,
  };
};

// 各时间选择器的小时和分钟限制
const actTimeHourFilter = computed(() => getHourFilter(actDatePickerValue.value));
const beginTimeHourFilter = computed(() => getHourFilter(beginDatePickerValue.value));
const endTimeHourFilter = computed(() => getHourFilter(endDatePickerValue.value));
const actTimeLimit = computed(() => getTimeLimit(actDatePickerValue.value));
const beginTimeLimit = computed(() => getTimeLimit(beginDatePickerValue.value));
const endTimeLimit = computed(() => getTimeLimit(endDatePickerValue.value));
const showActDateTimePicker = ref(false);
const showBeginTimePicker = ref(false);
const showEndTimePicker = ref(false);

// 日期时间选择器值（日期和时间分开存储）
// 工时归属
const actDatePickerValue = ref([]);
const actTimePickerValue = ref([]);
// 开始时间
const beginDatePickerValue = ref([]);
const beginTimePickerValue = ref([]);
// 结束时间
const endDatePickerValue = ref([]);
const endTimePickerValue = ref([]);

// 工艺选择器
const showCraftPicker = ref(false);
const craftOptions = ref([]);

// 设备选择器
const showDevicePicker = ref(false);
const deviceOptions = ref([]);

/**
 * 初始化默认时间
 * 工时归属默认为当前时间
 */
function initDefaultTime() {
  const now = new Date();
  formData.actDateTime = now.getTime();

  // 初始化选择器值（日期和时间分开）
  actDatePickerValue.value = [
    now.getFullYear().toString(),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0"),
  ];
  actTimePickerValue.value = [
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
  ];
}

/**
 * 获取工艺列表
 * 辅助工时使用 '辅助工时' 大分类
 */
async function fetchCraftList() {
  try {
    craftOptions.value = await getCraftByBigType("辅助工时");
  } catch (error) {
    console.error("获取工艺列表失败:", error);
  }
}

/**
 * 获取设备列表
 * 使用和钳调反馈一样的 API（硬编码 sysOrgCode: "30"）
 */
async function fetchDeviceList() {
  try {
    deviceOptions.value = await getDeviceList();
  } catch (error) {
    console.error("获取设备列表失败:", error);
  }
}

/**
 * 工时归属时间确认
 * 从日期和时间选择器值中构建完整时间戳
 */
function onActDateTimeConfirm() {
  const [year, month, day] = actDatePickerValue.value;
  const [hour, minute] = actTimePickerValue.value;
  const date = new Date(year, month - 1, day, hour, minute);
  formData.actDateTime = date.getTime();
  showActDateTimePicker.value = false;
}

/**
 * 开始时间确认
 */
function onBeginTimeConfirm() {
  const [year, month, day] = beginDatePickerValue.value;
  const [hour, minute] = beginTimePickerValue.value;
  const date = new Date(year, month - 1, day, hour, minute);
  formData.actBeginTime = date.getTime();
  showBeginTimePicker.value = false;
  updateActManTime();
}

/**
 * 结束时间确认
 */
function onEndTimeConfirm() {
  const [year, month, day] = endDatePickerValue.value;
  const [hour, minute] = endTimePickerValue.value;
  const date = new Date(year, month - 1, day, hour, minute);
  formData.actEndTime = date.getTime();
  showEndTimePicker.value = false;
  updateActManTime();
}

/**
 * 更新人员工时
 * 当开始时间或结束时间变化时调用
 */
function updateActManTime() {
  if (formData.actBeginTime && formData.actEndTime) {
    if (formData.actEndTime <= formData.actBeginTime) {
      showToast("结束时间必须大于开始时间");
      formData.actManTime = "";
      formData.actMacTime = "";
      return;
    }
    const minutes = calculateActManTime(
      formData.actBeginTime,
      formData.actEndTime
    );
    formData.actManTime = minutes.toString();
    // 如果已选择设备，同步更新设备工时
    if (formData.actByMac) {
      formData.actMacTime = minutes.toString();
    }
  }
}

/**
 * 工艺选择确认
 */
function onCraftConfirm({ selectedOptions }) {
  const selected = selectedOptions[0];
  if (selected) {
    formData.craftCode = selected.value;
    formData.craftName = selected.text;
  }
  showCraftPicker.value = false;
}

/**
 * 设备选择确认
 * 选择设备后，设备工时 = 人员工时
 */
function onDeviceConfirm({ selectedOptions }) {
  const selected = selectedOptions[0];
  if (selected) {
    formData.actByMac = selected.value;
    formData.actByMacText = selected.text;
    // 设备工时 = 人员工时
    if (formData.actManTime) {
      formData.actMacTime = formData.actManTime;
    }
  }
  showDevicePicker.value = false;
}

/**
 * 表单提交
 * 使用节流防止重复提交
 */
const onSubmit = throttle(async () => {
  // 构建提交数据
  const submitData = {
    actDateTime: formData.actDateTime,
    actBeginTime: formData.actBeginTime,
    actEndTime: formData.actEndTime,
    actManTime: formData.actManTime,
    actMacTime: formData.actMacTime || null,
    craftCode: formData.craftCode || null,
    craftName: formData.craftName || null,
    actByMac: formData.actByMac || null,
    prdRemark: formData.prdRemark || null,
    actByUser: props.userInfo?.operatorUserName || null,
    deptId: props.userInfo?.deptId || null,
    plineCode: props.userInfo?.plineCode || null,
  };

  try {
    // 确认提交
    await showConfirmDialog({
      title: "提示",
      message: "确认提交辅助工时反馈？",
    });

    await saveMesOtherBackList([submitData]);
    showToast("提交成功");
    router.back();
  } catch (error) {
    if (error !== "cancel") {
      console.error("提交失败:", error);
      showToast("提交失败，请重试");
    }
  }
}, 3000);

/**
 * 重置表单
 */
function onReset() {
  // 重置表单数据
  formData.actBeginTime = null;
  formData.actEndTime = null;
  formData.actManTime = "";
  formData.actMacTime = "";
  formData.craftCode = "";
  formData.craftName = "";
  formData.actByMac = "";
  formData.actByMacText = "";
  formData.prdRemark = "";

  // 重新初始化工时归属为当前时间
  initDefaultTime();

  showToast("已重置");
}

// 组件挂载后初始化
onMounted(() => {
  initDefaultTime();
  fetchCraftList();
  fetchDeviceList();
});
</script>

<style scoped>
.auxiliary-form {
  padding: 16px;
  background-color: #fff;
}

/* 单位文字样式 */
.unit {
  color: #999;
  font-size: 14px;
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 0 16px;
}

.reset-btn {
  flex: 1;
}

.submit-btn {
  flex: 2;
}
</style>
