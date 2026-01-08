<!--
  工件工时表单

  【功能说明】
  用于记录具体工件加工的工时

  【表单字段】
  - 模具号: 选择框，远程搜索，必填
  - 件号: 选择框，依赖模具号，必填
  - 工单号: 只读，自动生成（模具号_Q01_件号）
  - 工时归属: 日期时间选择器，必选，默认当前时间
  - 开始时间: 日期时间选择器，必选
  - 结束时间: 日期时间选择器，必选
  - 工时类型: 选择框，必选
  - 人员工时: 只读，自动计算
  - 设备工时: 只读，选择设备后填入
  - 工艺: 选择框，可筛选，非必填
  - 加工设备: 选择框，可筛选，非必填
  - 反馈说明: 输入框，最大500字

  【核心逻辑】
  - 模具号变化时，清空件号和工单号，请求件号列表
  - 件号变化时，自动生成工单号
  - 工时计算逻辑同辅助工时
-->
<template>
  <div class="workpiece-form">
    <van-form @submit="onSubmit" ref="formRef">
      <!-- 模具号（远程搜索） -->
      <van-field
        v-model="formData.moldCodeText"
        is-link
        readonly
        required
        label="模具号"
        placeholder="请选择模具号"
        @click="showMoldPicker = true"
        :rules="[{ required: true, message: '请选择模具号' }]"
      />

      <!-- 件号（依赖模具号） -->
      <van-field
        v-model="formData.importPartCode"
        is-link
        readonly
        required
        label="件号"
        placeholder="请先选择模具号"
        @click="onPartNoClick"
        :rules="[{ required: true, message: '请选择件号' }]"
      />

      <!-- 工单号（只读，自动生成） -->
      <van-field
        v-model="formData.orderNumber"
        readonly
        required
        label="工单号"
        placeholder="由模具号和件号自动生成"
        :rules="[{ required: true, message: '请先选择模具号和件号' }]"
      />

      <!-- 工时归属 -->
      <van-field
        :model-value="formatDateTime(formData.actDateTime)"
        is-link
        readonly
        required
        label="工时归属"
        placeholder="请选择工时归属时间"
        @click="showActDateTimePicker = true"
        :rules="[{ required: true, message: '请选择工时归属时间' }]"
      />

      <!-- 开始时间 -->
      <van-field
        :model-value="formatDateTime(formData.actBeginTime)"
        is-link
        readonly
        required
        label="开始时间"
        placeholder="请选择开始时间"
        @click="showBeginTimePicker = true"
        :rules="[{ required: true, message: '请选择开始时间' }]"
      />

      <!-- 结束时间 -->
      <van-field
        :model-value="formatDateTime(formData.actEndTime)"
        is-link
        readonly
        required
        label="结束时间"
        placeholder="请选择结束时间"
        @click="showEndTimePicker = true"
        :rules="[{ required: true, message: '请选择结束时间' }]"
      />

      <!-- 工时类型 -->
      <van-field
        v-model="formData.mouldMakeOrderTypeText"
        is-link
        readonly
        required
        label="工时类型"
        placeholder="请选择工时类型"
        @click="showTypePicker = true"
        :rules="[{ required: true, message: '请选择工时类型' }]"
      />

      <!-- 人员工时（只读，自动计算） -->
      <van-field
        v-model="formData.actManTime"
        readonly
        required
        label="人员工时"
        placeholder="由开始/结束时间自动计算"
        :rules="[{ required: true, message: '请先选择开始和结束时间' }]"
      >
        <template #extra>
          <span class="unit">分钟</span>
        </template>
      </van-field>

      <!-- 设备工时（只读，选择设备后填入） -->
      <van-field
        v-model="formData.actMacTime"
        readonly
        label="设备工时"
        placeholder="选择加工设备后自动填入"
      >
        <template #extra>
          <span class="unit">分钟</span>
        </template>
      </van-field>

      <!-- 工艺选择 -->
      <van-field
        v-model="formData.craftName"
        is-link
        readonly
        label="工艺"
        placeholder="请选择工艺"
        @click="showCraftPicker = true"
      />

      <!-- 加工设备选择 -->
      <van-field
        v-model="formData.actByMacText"
        is-link
        readonly
        label="加工设备"
        placeholder="请选择加工设备"
        @click="showDevicePicker = true"
      />

      <!-- 反馈说明 -->
      <van-field
        v-model="formData.prdRemark"
        type="textarea"
        label="反馈说明"
        placeholder="请输入反馈说明（最多500字）"
        maxlength="500"
        show-word-limit
        rows="3"
      />

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

    <!-- 模具号选择器（支持搜索） -->
    <van-popup v-model:show="showMoldPicker" position="bottom" round>
      <div class="search-picker">
        <van-search
          v-model="moldSearchKeyword"
          placeholder="输入模具号搜索"
          @search="onMoldSearch"
          @update:model-value="onMoldSearch"
        />
        <van-picker
          :columns="moldOptions"
          @confirm="onMoldConfirm"
          @cancel="showMoldPicker = false"
          :columns-field-names="{ text: 'text', value: 'value' }"
        />
      </div>
    </van-popup>

    <!-- 件号选择器 -->
    <van-popup v-model:show="showPartNoPicker" position="bottom">
      <van-picker
        :columns="partNoOptions"
        @confirm="onPartNoConfirm"
        @cancel="showPartNoPicker = false"
        :columns-field-names="{ text: 'text', value: 'value' }"
      />
    </van-popup>

    <!-- 工时归属时间选择器（步骤式：先选日期，点下一步选时间） -->
    <van-popup v-model:show="showActDateTimePicker" position="bottom">
      <van-picker-group
        title="选择工时归属时间"
        :tabs="['选择日期', '选择时间']"
        next-step-text="下一步"
        @confirm="onActDateTimeConfirm"
        @cancel="showActDateTimePicker = false"
      >
        <van-date-picker v-model="actDatePickerValue" :min-date="minDate" :max-date="maxDate" />
        <van-time-picker
          v-model="actTimePickerValue"
          :columns-type="['hour', 'minute']"
          :min-hour="actTimeHourFilter.minHour"
          :max-hour="actTimeHourFilter.maxHour"
          :min-time="actTimeLimit.minTime"
          :max-time="actTimeLimit.maxTime"
        />
      </van-picker-group>
    </van-popup>

    <!-- 开始时间选择器（步骤式：先选日期，点下一步选时间） -->
    <van-popup v-model:show="showBeginTimePicker" position="bottom">
      <van-picker-group
        title="选择开始时间"
        :tabs="['选择日期', '选择时间']"
        next-step-text="下一步"
        @confirm="onBeginTimeConfirm"
        @cancel="showBeginTimePicker = false"
      >
        <van-date-picker v-model="beginDatePickerValue" :min-date="minDate" :max-date="maxDate" />
        <van-time-picker
          v-model="beginTimePickerValue"
          :columns-type="['hour', 'minute']"
          :min-hour="beginTimeHourFilter.minHour"
          :max-hour="beginTimeHourFilter.maxHour"
          :min-time="beginTimeLimit.minTime"
          :max-time="beginTimeLimit.maxTime"
        />
      </van-picker-group>
    </van-popup>

    <!-- 结束时间选择器（步骤式：先选日期，点下一步选时间） -->
    <van-popup v-model:show="showEndTimePicker" position="bottom">
      <van-picker-group
        title="选择结束时间"
        :tabs="['选择日期', '选择时间']"
        next-step-text="下一步"
        @confirm="onEndTimeConfirm"
        @cancel="showEndTimePicker = false"
      >
        <van-date-picker v-model="endDatePickerValue" :min-date="minDate" :max-date="maxDate" />
        <van-time-picker
          v-model="endTimePickerValue"
          :columns-type="['hour', 'minute']"
          :min-hour="endTimeHourFilter.minHour"
          :max-hour="endTimeHourFilter.maxHour"
          :min-time="endTimeLimit.minTime"
          :max-time="endTimeLimit.maxTime"
        />
      </van-picker-group>
    </van-popup>

    <!-- 工时类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeOptions"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
        :columns-field-names="{ text: 'text', value: 'value' }"
      />
    </van-popup>

    <!-- 工艺选择器 -->
    <van-popup v-model:show="showCraftPicker" position="bottom">
      <van-picker
        :columns="craftOptions"
        @confirm="onCraftConfirm"
        @cancel="showCraftPicker = false"
        :columns-field-names="{ text: 'text', value: 'value' }"
      />
    </van-popup>

    <!-- 加工设备选择器 -->
    <van-popup v-model:show="showDevicePicker" position="bottom">
      <van-picker
        :columns="deviceOptions"
        @confirm="onDeviceConfirm"
        @cancel="showDevicePicker = false"
        :columns-field-names="{ text: 'text', value: 'value' }"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, defineProps } from "vue";
import { showToast, showConfirmDialog } from "vant";
import { useRouter } from "vue-router";
import {
  getSamMouldInfoByProAndBz,
  getImportPartCodeByMouldCode,
  getCraftByPlineId,
  getDicts,
  workPieceTimeFeedback,
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
const formRef = ref(null);

// 表单数据
const formData = reactive({
  moldCode: "", // 模具号
  moldCodeText: "", // 模具号显示文本
  importPartCode: "", // 件号
  orderNumber: "", // 工单号（自动生成）
  partCode: "", // 零件代码（自动生成）
  mouldMakeOrder: "", // 模具制造订单（自动生成）
  actDateTime: null, // 工时归属时间戳
  actBeginTime: null, // 开始时间戳
  actEndTime: null, // 结束时间戳
  mouldMakeOrderType: "", // 工时类型代码
  mouldMakeOrderTypeText: "", // 工时类型显示文本
  actManTime: "", // 人员工时
  actMacTime: "", // 设备工时
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

// 模具号选择器
const showMoldPicker = ref(false);
const moldSearchKeyword = ref("");
const moldOptions = ref([]);

// 件号选择器
const showPartNoPicker = ref(false);
const partNoOptions = ref([]);

// 工时类型选择器
const showTypePicker = ref(false);
const typeOptions = ref([]);

// 工艺选择器
const showCraftPicker = ref(false);
const craftOptions = ref([]);

// 设备选择器
const showDevicePicker = ref(false);
const deviceOptions = ref([]);

/**
 * 初始化默认时间
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
 * 搜索模具号
 * 根据关键词远程搜索模具列表
 */
async function onMoldSearch() {
  if (!props.userInfo?.plineCode) {
    showToast("用户信息加载中，请稍后");
    return;
  }
  try {
    moldOptions.value = await getSamMouldInfoByProAndBz({
      plineCode: props.userInfo.plineCode,
      moldCode: moldSearchKeyword.value,
    });
  } catch (error) {
    console.error("搜索模具失败:", error);
  }
}

/**
 * 模具号选择确认
 * 选择后清空件号和工单号，请求件号列表
 */
async function onMoldConfirm({ selectedOptions }) {
  const selected = selectedOptions[0];
  if (selected) {
    formData.moldCode = selected.value;
    formData.moldCodeText = selected.text;
    // 清空件号和工单号
    formData.importPartCode = "";
    formData.orderNumber = "";
    formData.partCode = "";
    formData.mouldMakeOrder = "";
    // 请求件号列表
    await fetchPartNoList(selected.value);
  }
  showMoldPicker.value = false;
}

/**
 * 获取件号列表
 */
async function fetchPartNoList(mouldCode) {
  try {
    partNoOptions.value = await getImportPartCodeByMouldCode(mouldCode);
  } catch (error) {
    console.error("获取件号列表失败:", error);
  }
}

/**
 * 件号点击事件
 * 必须先选择模具号
 */
function onPartNoClick() {
  if (!formData.moldCode) {
    showToast("请先选择模具号");
    return;
  }
  showPartNoPicker.value = true;
}

/**
 * 件号选择确认
 * 选择后自动生成工单号
 */
function onPartNoConfirm({ selectedOptions }) {
  const selected = selectedOptions[0];
  if (selected) {
    formData.importPartCode = selected.value;
    // 自动生成工单号：模具号_Q01_件号
    formData.orderNumber = `${formData.moldCode}_Q01_${selected.value}`;
    // 零件代码：模具号_件号
    formData.partCode = `${formData.moldCode}_${selected.value}`;
    // 模具制造订单：模具号_Q01
    formData.mouldMakeOrder = `${formData.moldCode}_Q01`;
  }
  showPartNoPicker.value = false;
}

/**
 * 获取工时类型字典
 */
async function fetchTypeOptions() {
  try {
    typeOptions.value = await getDicts("mould_make_order_type");
  } catch (error) {
    console.error("获取工时类型失败:", error);
  }
}

/**
 * 获取工艺列表
 * 工件工时根据班组获取工艺
 */
async function fetchCraftList() {
  if (!props.userInfo?.plineCode) return;
  try {
    craftOptions.value = await getCraftByPlineId(props.userInfo.plineCode);
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
    if (formData.actByMac) {
      formData.actMacTime = minutes.toString();
    }
  }
}

/**
 * 工时类型选择确认
 */
function onTypeConfirm({ selectedOptions }) {
  const selected = selectedOptions[0];
  if (selected) {
    formData.mouldMakeOrderType = selected.value;
    formData.mouldMakeOrderTypeText = selected.text;
  }
  showTypePicker.value = false;
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
 */
function onDeviceConfirm({ selectedOptions }) {
  const selected = selectedOptions[0];
  if (selected) {
    formData.actByMac = selected.value;
    formData.actByMacText = selected.text;
    if (formData.actManTime) {
      formData.actMacTime = formData.actManTime;
    }
  }
  showDevicePicker.value = false;
}

/**
 * 表单提交
 */
const onSubmit = throttle(async () => {
  const submitData = {
    moldCode: formData.moldCode,
    importPartCode: formData.importPartCode,
    orderNumber: formData.orderNumber,
    partCode: formData.partCode,
    mouldMakeOrder: formData.mouldMakeOrder,
    actDateTime: formData.actDateTime,
    actBeginTime: formData.actBeginTime,
    actEndTime: formData.actEndTime,
    mouldMakeOrderType: formData.mouldMakeOrderType,
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
    await showConfirmDialog({
      title: "提示",
      message: "确认提交工件工时反馈？",
    });

    await workPieceTimeFeedback([submitData]);
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
  formData.moldCode = "";
  formData.moldCodeText = "";
  formData.importPartCode = "";
  formData.orderNumber = "";
  formData.partCode = "";
  formData.mouldMakeOrder = "";
  formData.actBeginTime = null;
  formData.actEndTime = null;
  formData.mouldMakeOrderType = "";
  formData.mouldMakeOrderTypeText = "";
  formData.actManTime = "";
  formData.actMacTime = "";
  formData.craftCode = "";
  formData.craftName = "";
  formData.actByMac = "";
  formData.actByMacText = "";
  formData.prdRemark = "";

  moldSearchKeyword.value = "";
  partNoOptions.value = [];

  initDefaultTime();
  showToast("已重置");
}

// 监听用户信息变化，获取工艺列表（工艺依赖 plineCode）
watch(
  () => props.userInfo,
  (newVal) => {
    if (newVal?.plineCode) {
      fetchCraftList();
    }
  },
  { immediate: true }
);

// 组件挂载后初始化
onMounted(() => {
  initDefaultTime();
  fetchTypeOptions();
  fetchDeviceList();
});
</script>

<style scoped>
.workpiece-form {
  padding: 16px;
  background-color: #fff;
}

.unit {
  color: #999;
  font-size: 14px;
}

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

/* 带搜索的选择器样式 */
.search-picker {
  background-color: #fff;
}

.search-picker :deep(.van-search) {
  padding: 10px 16px;
}
</style>
