<!--
  钳调反馈页面

  【作用说明】
  用于查询钳调数据并进行反馈操作
  使用场景：钳调作业完成后，查询相关数据并填写反馈信息

  【页面结构】
  1. 顶部用户信息：固定显示当前用户的单位-班组-姓名
  2. 搜索表单：包含模具、件号、制造令号、是否调班等筛选条件
  3. 数据列表：展示查询结果，支持下拉刷新和上拉加载
  4. 展开详情：点击数据项展开详情表单进行反馈
-->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { showConfirmDialog, showToast } from "vant";
import { getDeviceList, getOrderList, getPartNoList, getQiandiaoDetail, getQianTiaoUserInfo, getSamMouldInfoByProAndBz, submitQiandiaoFeedback, } from "@/api/qiandiao";
import { getCraftList } from "@/api/common";
import { calculateActManTime } from "@/pages/workspace/otherWorktime/utils";

// ==================== 用户信息 ====================

/**
 * 【用户信息说明】
 * 用户的部门、班组、姓名从后端接口获取，显示在页面顶部
 * 接口：getQianTiaoUserInfo
 * 显示格式：部门-班组-姓名
 * 提交反馈时需要携带 deptId, plineCode, userName
 */
const userInfo = ref({
  deptId: "",
  deptName: "",
  plineCode: "",
  plineName: "",
  userName: "",
  nickName: "",
});

/**
 * 【computed 解释】
 * 计算属性，当 userInfo 变化时自动重新计算显示文本
 */
const userInfoDisplay = computed(() => {
  const { deptName, plineName, nickName } = userInfo.value;
  if (!deptName && !plineName && !nickName) {
    return "加载中...";
  }
  return `${deptName} _ ${plineName} _ ${nickName}`;
});

/**
 * 【onMounted 解释】
 * Vue 3 生命周期钩子，组件挂载完成后执行
 * 用于页面初始化时获取用户信息
 */
onMounted(async () => {
  try {
    userInfo.value = await getQianTiaoUserInfo();
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
  // 获取工艺列表
  try {
    const res = await getCraftList();
    craftList.value = res.data;
  } catch (error) {
    console.error("获取工艺列表失败:", error);
  }
});

// ==================== 搜索表单数据 ====================

/**
 * 【ref 解释】
 * ref() 是 Vue 3 的响应式 API
 * 当 ref 包裹的数据变化时，页面会自动更新
 */

// 模具（必填，本地筛选）
const moldId = ref("");
const moldText = ref("");

// 件号（非必填，联动模具）
const partNo = ref("");
const partNoText = ref("");

// 制造令号（非必填）
const manufactureNo = ref("");

// 是否调班（默认否）
const isShiftChange = ref("0");

// ==================== 下拉选项数据 ====================

// 模具选项（远程搜索获取）
const moldOptions = ref([]);
// 模具搜索加载状态
const moldLoading = ref(false);
// 件号选项（依赖模具）
const partNoOptions = ref([]);

// 工艺列表（用于 id 转 name）
const craftList = ref([]);

/**
 * 根据工艺 id 获取工艺名称
 */
const getCraftName = (id) => {
  const craft = craftList.value.find(item => item.id === id);
  return craft ? craft.craftName : id;
};

// ==================== 搜索关键词 ====================

// 模具搜索关键词（用于远程搜索）
const moldKeyword = ref("");
// 件号搜索关键词
const partNoKeyword = ref("");

// ==================== 模具远程搜索 ====================

/**
 * 【watch 解释】
 * 监听模具关键词变化，触发远程搜索
 * - 为什么存在：模具数据量大，需要远程搜索
 * - 监听对象：moldKeyword（模具搜索关键词）
 * - 触发时机：关键词变化时
 * - 搜索参数：plineCode（班组编码）+ moldCode（关键词）
 */
watch(moldKeyword, async (keyword) => {
  const trimmed = keyword.trim();
  if (!trimmed) {
    moldOptions.value = [];
    return;
  }
  moldLoading.value = true;
  try {
    moldOptions.value = await getSamMouldInfoByProAndBz({
      plineCode: userInfo.value.plineCode || null,
      moldCode: trimmed,
    });
  } finally {
    moldLoading.value = false;
  }
});

// ==================== 过滤后的选项 ====================

/**
 * 【computed 解释】
 * 计算属性，当依赖的数据变化时自动重新计算
 * 用于根据关键词筛选选项列表
 */

// 模具选项（远程搜索，直接使用 moldOptions）
const filteredMoldOptions = computed(() => moldOptions.value);

// 筛选件号
const filteredPartNoOptions = computed(() => {
  const keyword = partNoKeyword.value.trim();
  if (!keyword) return partNoOptions.value;
  return partNoOptions.value.filter(
    (item) =>
      item.text.includes(keyword) || String(item.value).includes(keyword)
  );
});

// ==================== Popup 显示控制 ====================

/**
 * 【Popup + Picker 组合说明】
 * Vant 的 Picker 选择器需要配合 Popup 弹出层使用
 * showXxxPicker 控制弹出层的显示/隐藏
 */
const showMoldPicker = ref(false);
const showPartNoPicker = ref(false);

// ==================== 列表数据 ====================

// 全部列表数据（查询结果）
const allListData = ref([]);
// 当前页码
const pageNum = ref(1);
// 每页条数
const pageSize = ref(5);

// 列表加载状态
const listLoading = ref(false);
// 总数据量（用于分页）
const totalCount = ref(0);

/**
 * 【computed 解释】
 * 计算当前页显示的数据
 * 由于后端分页，直接使用 allListData
 */
const listData = computed(() => allListData.value);

// 总页数
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value);
});

// ==================== 展开详情相关 ====================

// 详情弹窗显示状态
const showDetailPopup = ref(false);
// 当前选中的数据项（用于弹窗显示）
const detailData = ref(null);
// 详情加载状态
const detailLoading = ref(false);

// ==================== 详情表单数据 ====================

/**
 * 【详情表单说明】
 * 展开数据项后显示的反馈表单
 * 包含只读字段（从详情数据填充）和可编辑字段
 * 字段名与后端接口保持一致，无需映射
 */
const detailForm = ref({
  // 只读字段（从详情数据填充，字段名与后端一致）
  moldCode: "",        // 模具号
  partCode: "",        // 零件号
  projectCode: "",     // 项目号
  // 数据卡片字段（从列表项填充）
  importPartCode: "",  // 件号
  partName: "",        // 零件名称
  partRoutingId: "",   // 工艺名称
  orderNumber: "",     // 工单号
  // 可编辑字段（字段名与后端提交接口一致）
  actDateTime: null,   // 工时归属时间（Date 对象，提交时格式化为字符串）
  actBeginTime: null,  // 开始时间（Date 对象）
  actEndTime: null,    // 结束时间（Date 对象）
  actManTime: "",      // 人员工时（分钟，自动计算）
  actMacTime: "",      // 设备工时（分钟，选择设备后显示）
  actByMac: "",        // 加工设备 ID
  actByMacText: "",    // 加工设备显示文本（仅用于界面显示）
  prdRemark: "",       // 反馈说明
});

// 设备选项列表
const deviceOptions = ref([]);
// 设备搜索关键词
const deviceKeyword = ref("");

// ==================== 时间选择器控制 ====================

/**
 * 【时间选择器说明】
 * 使用 Vant 的 van-date-picker + van-time-picker 组合
 * 通过 Popup 弹出，选择日期和时间
 */
const showWorkTimePicker = ref(false);
const showStartTimePicker = ref(false);
const showEndTimePicker = ref(false);
const showDevicePicker = ref(false);
// PickerGroup 需要 tabs 配置才会渲染内部的步骤式选择
const dateTimeTabs = ["日期", "时间"];

// 临时存储选择的日期和时间（用于 PickerGroup）
const tempWorkTimeDate = ref([]);
const tempWorkTimeTime = ref([]);
const tempStartDate = ref([]);
const tempStartTime = ref([]);
const tempEndDate = ref([]);
const tempEndTime = ref([]);

// ==================== 时间范围限制 ====================

/**
 * 【时间范围限制说明】
 * 只允许选择当前时间往前推72小时内的时间
 * - maxDate: 当前时间（不能选择未来）
 * - minDate: 当前时间 - 72小时
 */

// 最大可选时间（当前时间）
const maxDate = computed(() => new Date());

// 最小可选时间（当前时间往前推72小时）
const minDate = computed(() => {
  const now = new Date();
  return new Date(now.getTime() - 72 * 60 * 60 * 1000);
});

/**
 * 根据选择的日期动态计算时间选择器的小时限制
 * - 如果选择的是最小日期那天，小时不能早于 minDate 的小时
 * - 如果选择的是最大日期（今天），小时不能晚于当前小时
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

  // 判断是否是最小日期那天
  const isMinDay = selectedDate.toDateString() === min.toDateString();
  // 判断是否是今天
  const isToday = selectedDate.toDateString() === now.toDateString();

  return {
    minHour: isMinDay ? min.getHours() : 0,
    maxHour: isToday ? now.getHours() : 23,
  };
};

// 工时归属时间的小时过滤
const workTimeHourFilter = computed(() => getHourFilter(tempWorkTimeDate.value));
// 开始时间的小时过滤
const startTimeHourFilter = computed(() => getHourFilter(tempStartDate.value));
// 结束时间的小时过滤
const endTimeHourFilter = computed(() => getHourFilter(tempEndDate.value));

/**
 * 根据选择日期动态限制分钟范围
 * - 如果是最小日期，分钟不能早于 minDate 对应的分钟
 * - 如果是最大日期（今天），分钟不能晚于当前分钟
 * 使用 TimePicker 的 min-time / max-time 细化到分钟
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

// 时间选择器的分钟限制
const workTimeLimit = computed(() => getTimeLimit(tempWorkTimeDate.value));
const startTimeLimit = computed(() => getTimeLimit(tempStartDate.value));
const endTimeLimit = computed(() => getTimeLimit(tempEndDate.value));

// ==================== 筛选设备选项 ====================

const filteredDeviceOptions = computed(() => {
  const keyword = deviceKeyword.value.trim();
  if (!keyword) return deviceOptions.value;
  return deviceOptions.value.filter(
    (item) =>
      item.text.includes(keyword) || String(item.value).includes(keyword)
  );
});

// ==================== 工时计算 ====================

/**
 * 【工时计算说明】
 * 根据开始时间和结束时间自动计算人员工时（分钟）
 * 设备工时与人员工时一致，但只有选择了加工设备才显示
 */

/**
 * 格式化日期时间为显示字符串
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的字符串，如 "2024-01-06 14:30"
 */
const formatDateTime = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}`;
};

/**
 * 计算工时
 * 使用 calculateActManTime 函数计算人员工时（自动扣除休息时间）
 */
const calculateHours = () => {
  const { actBeginTime, actEndTime, actByMac } = detailForm.value;
  if (actBeginTime && actEndTime) {
    // 使用 calculateActManTime 计算工时（扣除午休、晚休、晚班休息时间）
    const minutes = calculateActManTime(actBeginTime, actEndTime);
    detailForm.value.actManTime = minutes > 0 ? String(minutes) : "";
    // 设备工时与人员工时一致（仅当选择了设备）
    detailForm.value.actMacTime = actByMac ? detailForm.value.actManTime : "";
  } else {
    detailForm.value.actManTime = "";
    detailForm.value.actMacTime = "";
  }
};

/**
 * 监听开始时间和结束时间变化，自动计算工时
 */
watch(
  [() => detailForm.value.actBeginTime, () => detailForm.value.actEndTime],
  () => {
    calculateHours();
  }
);

/**
 * 监听设备选择变化，更新设备工时
 */
watch(
  () => detailForm.value.actByMac,
  (newVal) => {
    if (newVal) {
      detailForm.value.actMacTime = detailForm.value.actManTime;
    } else {
      detailForm.value.actMacTime = "";
    }
  }
);

// ==================== 时间选择器事件 ====================

/**
 * 将日期数组和时间数组转换为 Date 对象
 */
const arrayToDate = (dateArr, timeArr) => {
  if (!dateArr || dateArr.length < 3 || !timeArr || timeArr.length < 2) {
    return null;
  }
  return new Date(
    Number(dateArr[0]),
    Number(dateArr[1]) - 1,
    Number(dateArr[2]),
    Number(timeArr[0]),
    Number(timeArr[1])
  );
};

/**
 * 将 Date 对象转换为日期数组和时间数组
 */
const dateToArrays = (date) => {
  if (!date) {
    const now = new Date();
    return {
      dateArr: [String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")],
      timeArr: [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0")],
    };
  }
  return {
    dateArr: [String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")],
    timeArr: [String(date.getHours()).padStart(2, "0"), String(date.getMinutes()).padStart(2, "0")],
  };
};

/**
 * 打开工时归属时间选择器
 */
const openWorkTimePicker = () => {
  const { dateArr, timeArr } = dateToArrays(detailForm.value.actDateTime);
  tempWorkTimeDate.value = dateArr;
  tempWorkTimeTime.value = timeArr;
  showWorkTimePicker.value = true;
};

/**
 * 确认工时归属时间
 */
const onWorkTimeConfirm = () => {
  detailForm.value.actDateTime = arrayToDate(tempWorkTimeDate.value, tempWorkTimeTime.value);
  showWorkTimePicker.value = false;
};

/**
 * 打开开始时间选择器
 */
const openStartTimePicker = () => {
  const { dateArr, timeArr } = dateToArrays(detailForm.value.actBeginTime);
  tempStartDate.value = dateArr;
  tempStartTime.value = timeArr;
  showStartTimePicker.value = true;
};

/**
 * 确认开始时间
 */
const onStartTimeConfirm = () => {
  detailForm.value.actBeginTime = arrayToDate(tempStartDate.value, tempStartTime.value);
  showStartTimePicker.value = false;
};

/**
 * 清空开始时间
 */
const clearStartTime = () => {
  detailForm.value.actBeginTime = null;
  showStartTimePicker.value = false;
};

/**
 * 打开结束时间选择器
 */
const openEndTimePicker = () => {
  const { dateArr, timeArr } = dateToArrays(detailForm.value.actEndTime);
  tempEndDate.value = dateArr;
  tempEndTime.value = timeArr;
  showEndTimePicker.value = true;
};

/**
 * 确认结束时间
 */
const onEndTimeConfirm = () => {
  detailForm.value.actEndTime = arrayToDate(tempEndDate.value, tempEndTime.value);
  showEndTimePicker.value = false;
};

/**
 * 清空结束时间
 */
const clearEndTime = () => {
  detailForm.value.actEndTime = null;
  showEndTimePicker.value = false;
};

/**
 * 确认设备选择
 */
const onDeviceConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0];
  detailForm.value.actByMac = selected.value;
  detailForm.value.actByMacText = selected.text;
  showDevicePicker.value = false;
};

/**
 * 清空设备选择
 */
const clearDevice = () => {
  detailForm.value.actByMac = "";
  detailForm.value.actByMacText = "";
  showDevicePicker.value = false;
};

// ==================== 联动选择 ====================

/**
 * 【watch 解释】
 * 监听响应式数据的变化，当数据变化时执行回调
 *
 * 监听模具变化，重新获取件号列表
 * - 为什么存在：件号数据依赖于模具，模具变化时需要重新获取件号
 * - 监听对象：moldId（模具 ID）
 * - 触发时机：模具选择变化时
 */
watch(moldId, async (newMoldId) => {
  // 清空已选件号
  partNo.value = "";
  partNoText.value = "";
  partNoOptions.value = [];

  if (newMoldId) {
    const res = await getPartNoList(newMoldId);
    partNoOptions.value = res;
  }
});

// ==================== 选择器确认事件 ====================

const onMoldConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0];
  moldId.value = selected.value;
  moldText.value = selected.text;
  showMoldPicker.value = false;
};

const onPartNoConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0];
  partNo.value = selected.value;
  partNoText.value = selected.text;
  showPartNoPicker.value = false;
};

const clearPartNo = () => {
  partNo.value = "";
  partNoText.value = "";
  showPartNoPicker.value = false;
};

// ==================== 查询和重置 ====================

/**
 * 执行列表查询（内部方法）
 * 不重置分页，直接使用当前 pageNum 查询
 */
const fetchList = async () => {
  listLoading.value = true;
  try {
    const res = await getOrderList({
      plineCode: userInfo.value.plineCode || undefined,
      moldCode: moldId.value,
      importPartCode: partNo.value || undefined,
      mouldMakeOrder: manufactureNo.value || undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    });
    allListData.value = res.rows || [];
    totalCount.value = res.total || 0;
  } finally {
    listLoading.value = false;
  }
};

/**
 * 点击查询按钮
 * 重置分页后调用查询
 */
const handleSearch = async () => {
  // 校验必填项
  if (!moldId.value) {
    showToast("请选择模具");
    return;
  }

  // 重置分页和总数（隐藏分页组件）
  pageNum.value = 1;
  totalCount.value = 0;

  // 关闭弹窗
  showDetailPopup.value = false;
  detailData.value = null;

  // 调用查询
  await fetchList();
};

/**
 * 分页切换
 * 不重置分页，直接查询
 */
const handlePageChange = () => {
  fetchList();
};

/**
 * 重置表单
 * 同时重新获取用户信息
 */
const handleReset = async () => {
  // 清空表单字段
  moldId.value = "";
  moldText.value = "";
  partNo.value = "";
  partNoText.value = "";
  manufactureNo.value = "";
  isShiftChange.value = "0";

  // 清空列表
  allListData.value = [];
  totalCount.value = 0;
  pageNum.value = 1;
  showDetailPopup.value = false;
  detailData.value = null;

  // 重新获取用户信息
  try {
    const res = await getQianTiaoUserInfo();
    userInfo.value = res;
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// ==================== 展开详情 ====================

/**
 * 点击列表项，打开详情弹窗
 *
 * 【弹窗交互说明】
 * - 点击数据卡片后打开底部弹窗
 * - 弹窗内显示详情表单，支持填写反馈信息
 */
const handleItemClick = async (item) => {
  // 打开弹窗并显示加载状态
  showDetailPopup.value = true;
  detailLoading.value = true;

  try {
    const res = await getQiandiaoDetail(item.id);
    // 保存详情数据，直接使用后端返回的数据
    detailData.value = { ...res, id: item.id, _listItem: item };

    // 初始化详情表单数据
    // 填充只读字段（直接使用后端字段名）
    detailForm.value.moldCode = res.moldCode || "";
    detailForm.value.partCode = res.partCode || "";
    detailForm.value.projectCode = res.projectCode || "";
    // 填充数据卡片字段（从列表项获取）
    detailForm.value.importPartCode = item.importPartCode || "";
    detailForm.value.partName = item.partName || "";
    detailForm.value.partRoutingId = item.partRoutingId || "";
    detailForm.value.orderNumber = item.orderNumber || "";
    // 初始化可编辑字段
    detailForm.value.actDateTime = new Date(); // 默认当前时间
    detailForm.value.actBeginTime = null;
    detailForm.value.actEndTime = null;
    detailForm.value.actManTime = "";
    detailForm.value.actMacTime = "";
    detailForm.value.actByMac = "";
    detailForm.value.actByMacText = "";
    detailForm.value.prdRemark = "";

    // 加载设备列表
    deviceOptions.value = await getDeviceList();
  } finally {
    detailLoading.value = false;
  }
};

/**
 * 重置详情表单
 * 保留只读字段，重置可编辑字段
 */
const handleDetailReset = () => {
  detailForm.value.actDateTime = new Date();
  detailForm.value.actBeginTime = null;
  detailForm.value.actEndTime = null;
  detailForm.value.actManTime = "";
  detailForm.value.actMacTime = "";
  detailForm.value.actByMac = "";
  detailForm.value.actByMacText = "";
  detailForm.value.prdRemark = "";
};

// ==================== 提交反馈 ====================

/**
 * 提交反馈
 * 校验必填项后提交表单数据
 */
const handleSubmit = async () => {
  // 校验必填项
  if (!detailForm.value.actDateTime) {
    showToast("请选择工时归属时间");
    return;
  }
  if (!detailForm.value.actBeginTime) {
    showToast("请选择开始时间");
    return;
  }
  if (!detailForm.value.actEndTime) {
    showToast("请选择结束时间");
    return;
  }
  if (!detailForm.value.actManTime) {
    showToast("人员工时计算异常，请检查时间");
    return;
  }

  try {
    await showConfirmDialog({
      title: "提交确认",
      message: "确定要提交反馈吗？",
    });

    // 组装提交数据（合并工单信息和反馈表单信息）
    // 参考老项目：let combinedForm = {...this.formData, ...this.submitData};
    const listItem = detailData.value._listItem || {};
    const submitData = {
      // 工单原始信息（来自列表项）
      ...listItem,
      // 详情数据
      ...detailData.value,
      // 用户信息（用于反馈记录存储）
      deptId: userInfo.value.deptId,
      plineCode: userInfo.value.plineCode,
      userName: userInfo.value.userName,
      // 反馈表单信息（字段名与后端一致）
      actDateTime: formatDateTime(detailForm.value.actDateTime),
      actBeginTime: formatDateTime(detailForm.value.actBeginTime),
      actEndTime: formatDateTime(detailForm.value.actEndTime),
      actManTime: Number(detailForm.value.actManTime),
      actMacTime: detailForm.value.actMacTime ? Number(detailForm.value.actMacTime) : null,
      actByUser: userInfo.value.userName,
      actByMac: detailForm.value.actByMac || null,
      prdRemark: detailForm.value.prdRemark,
    };

    await submitQiandiaoFeedback(submitData);
    showToast("提交成功");
    // 关闭弹窗
    showDetailPopup.value = false;
    detailData.value = null;
  } catch (error) {
    if (error !== "cancel") {
      console.error("提交失败:", error);
    }
  }
};
</script>

<template>
  <div class="qiandiao-page">
    <!--
      【头部区域】
      包含用户信息栏和搜索表单
    -->
    <div class="fixed-header">
      <!-- 用户信息栏 -->
      <div class="user-info-bar">
        {{ userInfoDisplay }}
      </div>

      <!-- 搜索表单 -->
      <van-cell-group inset class="form-card">
        <!-- 模具（必填，本地筛选） -->
        <van-field v-model="moldText" label="模具" placeholder="请选择模具" is-link readonly required
          @click="showMoldPicker = true" />

        <!-- 件号（非必填，联动模具） -->
        <van-field v-model="partNoText" label="件号" placeholder="请选择件号" is-link readonly
          @click="showPartNoPicker = true" />

        <!-- 制造令号（非必填） -->
        <van-field v-model="manufactureNo" label="制造令号" placeholder="请输入制造令号" />

        <!-- 是否调班（单选） -->
        <van-field label="是否调班">
          <template #input>
            <van-radio-group v-model="isShiftChange" direction="horizontal">
              <van-radio name="1">是</van-radio>
              <van-radio name="0">否</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <!-- 操作按钮 -->
        <div class="btn-group">
          <van-button type="primary" size="small" @click="handleSearch">
            查询
          </van-button>
          <van-button size="small" @click="handleReset">重置</van-button>
        </div>
      </van-cell-group>
    </div>

    <!--
      【数据列表区域】
      可滚动区域，展示查询结果
    -->
    <div class="list-area">
      <!-- 查询加载中状态 -->
      <van-loading v-if="listLoading" class="list-loading" />

      <!--
        【列表项结构】
        每个数据项是一个卡片，点击后打开详情弹窗
      -->
      <div v-else v-for="item in listData" :key="item.id" class="list-item-wrapper">
        <!-- 数据卡片（直接使用后端返回的字段名） -->
        <van-cell-group inset class="data-card" @click="handleItemClick(item)">
          <van-cell title="件号" :value="item.importPartCode" />
          <van-cell title="零件名称" :value="item.partName" />
          <van-cell title="工艺名称" :value="getCraftName(item.partRoutingId)" />
          <van-cell title="工单号" :value="item.orderNumber" />
        </van-cell-group>
      </div>

      <!--
        【空状态】
        当列表为空且不在加载中时显示
      -->
      <van-empty v-if="!listLoading && totalCount === 0" description="暂无数据，请先查询" />

      <!--
        【分页组件】
        当有数据且总页数大于1时显示
      -->
      <div v-if="totalPages > 1" class="pagination-wrapper">
        <van-pagination v-model="pageNum" :total-items="totalCount" :items-per-page="pageSize" :show-page-size="3"
          force-ellipses @change="handlePageChange" />
      </div>
    </div>

    <!-- ==================== 详情弹窗 ==================== -->

    <!--
      【详情弹窗说明】
      使用 van-popup 底部弹窗展示详情表单
      - position="bottom": 从底部弹出
      - closeable: 显示关闭按钮
      - round: 圆角样式
      - 高度设为 80%，内容可滚动
    -->
    <van-popup v-model:show="showDetailPopup" position="bottom" round closeable :style="{ height: '93%' }">
      <div class="detail-popup-content">
        <div class="detail-popup-title">反馈详情</div>

        <!-- 加载中状态 -->
        <van-loading v-if="detailLoading" class="detail-loading" />

        <!-- 详情表单 -->
        <van-cell-group v-else-if="detailData" inset class="detail-form">
          <!-- 只读字段（字段名与后端一致） -->
          <van-field v-model="detailForm.moldCode" label="模具号" readonly />
          <van-field v-model="detailForm.partCode" label="零件号" readonly />
          <van-field v-model="detailForm.projectCode" label="项目号" readonly />
          <!-- 数据卡片字段（从列表项填充） -->
          <van-field v-model="detailForm.importPartCode" label="件号" readonly />
          <van-field v-model="detailForm.partName" label="零件名称" readonly />
          <van-field :model-value="getCraftName(detailForm.partRoutingId)" label="工艺名称" readonly />
          <van-field v-model="detailForm.orderNumber" label="工单号" readonly />

          <!-- 工时归属时间（必填，不可清空） -->
          <van-field :model-value="formatDateTime(detailForm.actDateTime)" label="工时归属" placeholder="请选择" is-link
            readonly required @click="openWorkTimePicker" />

          <!-- 开始时间（必填，允许清空） -->
          <van-field :model-value="formatDateTime(detailForm.actBeginTime)" label="开始时间" placeholder="请选择" is-link
            readonly required @click="openStartTimePicker" />

          <!-- 结束时间（必填，允许清空） -->
          <van-field :model-value="formatDateTime(detailForm.actEndTime)" label="结束时间" placeholder="请选择" is-link
            readonly required @click="openEndTimePicker" />

          <!-- 人员工时（只读，自动计算） -->
          <van-field v-model="detailForm.actManTime" label="人员工时" readonly required>
            <template #extra>
              <span class="field-unit">分钟</span>
            </template>
          </van-field>

          <!-- 设备工时（只读，选择设备后显示） -->
          <van-field v-if="detailForm.actByMac" v-model="detailForm.actMacTime" label="设备工时" readonly required>
            <template #extra>
              <span class="field-unit">分钟</span>
            </template>
          </van-field>

          <!-- 加工设备（非必填，可筛选） -->
          <van-field v-model="detailForm.actByMacText" label="加工设备" placeholder="请选择" is-link readonly
            @click="showDevicePicker = true" />

          <!-- 反馈说明（非必填，500字以内） -->
          <van-field v-model="detailForm.prdRemark" label="反馈说明" type="textarea" placeholder="请输入反馈说明（500字以内）"
            maxlength="500" show-word-limit rows="3" autosize />

          <!-- 操作按钮 -->
          <div class="button-group">
            <van-button type="primary" @click="handleSubmit" class="submit-btn">
              提交反馈
            </van-button>
            <van-button type="default" @click="handleDetailReset" class="reset-btn">
              重置
            </van-button>
            <van-button type="default" @click="showDetailPopup = false" class="cancel-btn">
              取消
            </van-button>
          </div>
        </van-cell-group>
      </div>
    </van-popup>

    <!-- ==================== 选择器弹窗 ==================== -->

    <!-- 模具选择器（本地筛选） -->
    <van-popup v-model:show="showMoldPicker" position="bottom" round>
      <div class="picker-search">
        <van-search v-model="moldKeyword" placeholder="输入模具关键词" shape="round" clearable />
      </div>
      <van-picker :columns="filteredMoldOptions" @confirm="onMoldConfirm" @cancel="showMoldPicker = false" />
    </van-popup>

    <!-- 件号选择器 -->
    <van-popup v-model:show="showPartNoPicker" position="bottom" round>
      <div class="picker-search">
        <van-search v-model="partNoKeyword" placeholder="输入件号关键词" shape="round" clearable />
      </div>
      <van-picker :columns="filteredPartNoOptions" @confirm="onPartNoConfirm" @cancel="showPartNoPicker = false" />
      <div class="picker-clear-btn">
        <van-button size="small" @click="clearPartNo">清空</van-button>
      </div>
    </van-popup>

    <!-- ==================== 详情表单选择器弹窗 ==================== -->

    <!-- 工时归属时间选择器（步骤式：先选日期，点下一步选时间） -->
    <van-popup v-model:show="showWorkTimePicker" position="bottom" round>
      <van-picker-group title="选择工时归属时间" :tabs="dateTimeTabs" next-step-text="下一步" @confirm="onWorkTimeConfirm"
        @cancel="showWorkTimePicker = false">
        <van-date-picker v-model="tempWorkTimeDate" :min-date="minDate" :max-date="maxDate" />
        <van-time-picker v-model="tempWorkTimeTime" :columns-type="['hour', 'minute']"
          :min-hour="workTimeHourFilter.minHour" :max-hour="workTimeHourFilter.maxHour"
          :min-time="workTimeLimit.minTime" :max-time="workTimeLimit.maxTime" />
      </van-picker-group>
    </van-popup>

    <!-- 开始时间选择器（步骤式：先选日期，点下一步选时间） -->
    <van-popup v-model:show="showStartTimePicker" position="bottom" round>
      <van-picker-group title="选择开始时间" :tabs="dateTimeTabs" next-step-text="下一步" @confirm="onStartTimeConfirm"
        @cancel="showStartTimePicker = false">
        <van-date-picker v-model="tempStartDate" :min-date="minDate" :max-date="maxDate" />
        <van-time-picker v-model="tempStartTime" :columns-type="['hour', 'minute']"
          :min-hour="startTimeHourFilter.minHour" :max-hour="startTimeHourFilter.maxHour"
          :min-time="startTimeLimit.minTime" :max-time="startTimeLimit.maxTime" />
      </van-picker-group>
      <div class="picker-clear-btn">
        <van-button size="small" @click="clearStartTime">清空</van-button>
      </div>
    </van-popup>

    <!-- 结束时间选择器（步骤式：先选日期，点下一步选时间） -->
    <van-popup v-model:show="showEndTimePicker" position="bottom" round>
      <van-picker-group title="选择结束时间" :tabs="dateTimeTabs" next-step-text="下一步" @confirm="onEndTimeConfirm"
        @cancel="showEndTimePicker = false">
        <van-date-picker v-model="tempEndDate" :min-date="minDate" :max-date="maxDate" />
        <van-time-picker v-model="tempEndTime" :columns-type="['hour', 'minute']" :min-hour="endTimeHourFilter.minHour"
          :max-hour="endTimeHourFilter.maxHour" :min-time="endTimeLimit.minTime" :max-time="endTimeLimit.maxTime" />
      </van-picker-group>
      <div class="picker-clear-btn">
        <van-button size="small" @click="clearEndTime">清空</van-button>
      </div>
    </van-popup>

    <!-- 加工设备选择器 -->
    <van-popup v-model:show="showDevicePicker" position="bottom" round>
      <div class="picker-search">
        <van-search v-model="deviceKeyword" placeholder="输入设备关键词" shape="round" clearable />
      </div>
      <van-picker :columns="filteredDeviceOptions" @confirm="onDeviceConfirm" @cancel="showDevicePicker = false" />
      <div class="picker-clear-btn">
        <van-button size="small" @click="clearDevice">清空</van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.qiandiao-page {
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 头部区域 */
.fixed-header {
  background: #f5f5f5;
  padding: 0 12px 12px;
}

/* 用户信息栏 */
.user-info-bar {
  background: #1989fa;
  color: #fff;
  padding: 12px 16px;
  margin: 0 -12px 12px -12px;
  font-size: 14px;
  font-weight: 500;
}

/* 表单卡片 */
.form-card {
  margin: 0;
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
}

.btn-group .van-button {
  flex: 1;
}

/* 列表区域 */
.list-area {
  flex: 1;
  padding: 0 12px 60px;
  overflow-y: auto;
}

/* 列表加载中 */
.list-loading {
  padding: 40px;
  text-align: center;
}

/* 列表项容器 */
.list-item-wrapper {
  margin-bottom: 12px;
}

/* 数据卡片 */
.data-card {
  margin: 0;
}

/* 详情弹窗内容区域 */
.detail-popup-content {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 20px;
}

/* 详情弹窗标题 */
.detail-popup-title {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

/* 详情加载中 */
.detail-loading {
  padding: 40px;
  text-align: center;
}

/* 详情表单 */
.detail-form {
  margin: 0;
}

/* 详情表单按钮组（与其他工时页面保持一致） */
.button-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 0 16px;
}

.cancel-btn {
  flex: 1;
}

.reset-btn {
  flex: 1;
}

.submit-btn {
  flex: 2;
}

/* 字段单位 */
.field-unit {
  color: #969799;
  font-size: 14px;
}

/* 分页组件容器 - 固定在底部导航栏上方 */
.pagination-wrapper {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  background: #fff;
  padding: 8px 0;
  display: flex;
  justify-content: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* 选择器搜索区域 */
.picker-search {
  padding: 8px 12px 4px;
  background: #fff;
}

/* 选择器清空按钮 */
.picker-clear-btn {
  padding: 8px 16px 16px;
  background: #fff;
  text-align: center;
}
</style>
