<!--
  质量快反表单页面

  【作用说明】
  用于提交质量问题反馈，包含异常单号、模具号、异常原因等信息
  使用场景：生产过程中发现质量问题时，填写此表单进行反馈

  【表单字段】
  - 异常单号：只读，由后台自动生成
  - 模具号：必填，下拉选择，支持筛选
  - 异常原因：必填，下拉选择，支持筛选
  - 责任部门：必填，下拉选择，默认为登录人部门
  - 是否技术支持：必填，单选，默认否
  - 问题描述：必填，文本框，最多500字
  - 描述图片：非必填，支持批量上传和拍照
  - 补救措施：非必填，文本框，最多500字
-->
<script setup>
import {ref, onMounted, computed} from "vue";
import {useRouter} from "vue-router";
import {showToast, showConfirmDialog} from "vant";
import {
  generateOrderNo,
  getMoldList,
  getReasonList,
  getDeptList,
  getUserInfo,
  uploadImage,
  submitQualityForm,
} from "@/api/quality";
import {processImage} from "@/utils/imageCompress";

/**
 * 【useRouter 解释】
 * Vue Router 提供的组合式函数，用于获取路由实例
 * 可以通过 router.back() 返回上一页
 */
const router = useRouter();

// ==================== 表单数据 ====================

/**
 * 【ref 解释】
 * ref() 是 Vue 3 的响应式 API
 * 当 ref 包裹的数据变化时，页面会自动更新
 */

// 异常单号（只读，由后台生成）
const orderNo = ref("");

// 模具号
const moldNo = ref("");
const moldText = ref(""); // 显示文本

// 异常原因
const reason = ref("");
const reasonText = ref(""); // 显示文本

// 责任部门
const deptId = ref("");
const deptText = ref(""); // 显示文本

// 是否技术支持（默认否）
const needTechSupport = ref("0");

// 问题描述
const description = ref("");

// 描述图片列表
// van-uploader 需要的数据格式：[{ url: '图片地址' }]
const imageList = ref([]);

// 补救措施
const remedy = ref("");

// ==================== 下拉选项数据 ====================

// 模具号选项列表
const moldOptions = ref([]);

// 异常原因选项列表
const reasonOptions = ref([]);

// 部门选项列表
const deptOptions = ref([]);

// ==================== 搜索关键词（用于筛选） ====================

// 模具号搜索关键词
const moldKeyword = ref("");
// 异常原因搜索关键词
const reasonKeyword = ref("");
// 责任部门搜索关键词
const deptKeyword = ref("");

// ==================== 过滤后的选项（基于关键词） ====================

/**
 * 通过关键词筛选模具号
 * includes 同时匹配编号与描述，方便快速定位
 */
const filteredMoldOptions = computed(() => {
  const keyword = moldKeyword.value.trim();
  if (!keyword) return moldOptions.value;
  return moldOptions.value.filter(
      (item) =>
          item.text.includes(keyword) || String(item.value).includes(keyword)
  );
});

/**
 * 通过关键词筛选异常原因
 */
const filteredReasonOptions = computed(() => {
  const keyword = reasonKeyword.value.trim();
  if (!keyword) return reasonOptions.value;
  return reasonOptions.value.filter(
      (item) =>
          item.text.includes(keyword) || String(item.value).includes(keyword)
  );
});

/**
 * 通过关键词筛选责任部门
 */
const filteredDeptOptions = computed(() => {
  const keyword = deptKeyword.value.trim();
  if (!keyword) return deptOptions.value;
  return deptOptions.value.filter(
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
const showReasonPicker = ref(false);
const showDeptPicker = ref(false);

// ==================== 页面初始化 ====================

/**
 * 【onMounted 解释】
 * Vue 3 的生命周期钩子，在组件挂载完成后执行
 * 适合在这里发起网络请求获取初始数据
 */
onMounted(async () => {
  // 并行请求所有初始数据
  const [orderRes, moldRes, reasonRes, deptRes, userRes] = await Promise.all([
    generateOrderNo(),
    getMoldList(),
    getReasonList(),
    getDeptList(),
    getUserInfo(),
  ]);

  // 设置异常单号
  orderNo.value = orderRes.orderNo;

  // 设置下拉选项
  // Picker 需要的数据格式：[{ text: '显示文本', value: '值' }]
  moldOptions.value = moldRes;
  reasonOptions.value = reasonRes;
  deptOptions.value = deptRes;

  // 设置责任部门默认值为登录人部门
  deptId.value = userRes.deptId;
  deptText.value = userRes.deptName;
});

// ==================== 选择器确认事件 ====================

/**
 * 模具号选择确认
 * @param {Object} param0 - Picker 回调参数
 * @param {Array} param0.selectedOptions - 选中的选项数组
 */
const onMoldConfirm = ({selectedOptions}) => {
  const selected = selectedOptions[0];
  moldNo.value = selected.value;
  moldText.value = selected.text;
  showMoldPicker.value = false;
};

/**
 * 异常原因选择确认
 */
const onReasonConfirm = ({selectedOptions}) => {
  const selected = selectedOptions[0];
  reason.value = selected.value;
  reasonText.value = selected.text;
  showReasonPicker.value = false;
};

/**
 * 责任部门选择确认
 */
const onDeptConfirm = ({selectedOptions}) => {
  const selected = selectedOptions[0];
  deptId.value = selected.value;
  deptText.value = selected.text;
  showDeptPicker.value = false;
};

// ==================== 图片上传处理 ====================

/**
 * 图片上传前的处理
 * 检查图片大小，超过5M则压缩
 *
 * 【beforeRead 说明】
 * van-uploader 的钩子函数，在读取文件前触发
 * 返回 false 可以阻止上传
 * 返回 Promise 可以进行异步处理
 *
 * @param {File} file - 要上传的文件
 * @returns {Promise<File|false>} 处理后的文件或 false（阻止上传）
 */
const beforeRead = async (file) => {
  // 检查文件类型
  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    return false;
  }

  const maxSize = 5 * 1024 * 1024; // 5MB

  // 处理图片（检查大小并在需要时压缩）
  const result = await processImage(file, maxSize);

  if (result.tooLarge) {
    showToast("图片过大，压缩后仍超过5M");
    return false;
  }

  if (result.compressed) {
    showToast("图片已自动压缩");
  }

  return result.file;
};

/**
 * 图片上传后的处理
 * 调用后台接口上传图片，获取图片URL
 *
 * 【afterRead 说明】
 * van-uploader 的钩子函数，在读取文件后触发
 * 此时文件已经被读取，可以进行上传操作
 *
 * @param {Object} fileInfo - 文件信息对象
 * @param {File} fileInfo.file - 文件对象
 */
const afterRead = async (fileInfo) => {
  // 设置上传状态
  fileInfo.status = "uploading";
  fileInfo.message = "上传中...";

  try {
    // 调用上传接口
    const res = await uploadImage(fileInfo.file);
    // 上传成功，保存返回的URL
    fileInfo.status = "done";
    fileInfo.url = res.url;
  } catch (error) {
    // 上传失败
    fileInfo.status = "failed";
    fileInfo.message = "上传失败";
  }
};

// ==================== 表单提交 ====================

/**
 * 表单引用
 * 用于调用表单的 validate 方法进行校验
 */
const formRef = ref(null);

/**
 * 提交表单
 * 1. 校验必填项
 * 2. 弹出二次确认
 * 3. 调用提交接口
 */
const handleSubmit = async () => {
  try {
    // 校验表单
    await formRef.value.validate();

    // 二次确认
    await showConfirmDialog({
      title: "提交确认",
      message: "确定要提交质量快反单吗？",
    });

    // 收集图片URL
    const imageUrls = imageList.value
        .filter((item) => item.status === "done")
        .map((item) => item.url);

    // 构造提交数据
    const formData = {
      orderNo: orderNo.value,
      moldNo: moldNo.value,
      reason: reason.value,
      deptId: deptId.value,
      needTechSupport: needTechSupport.value === "1",
      description: description.value,
      images: imageUrls,
      remedy: remedy.value,
    };

    // 调用提交接口
    const res = await submitQualityForm(formData);

    if (res.success) {
      showToast("提交成功");
      // 返回上一页
      router.back();
    }
  } catch (error) {
    // 用户取消确认或校验失败，不做处理
    if (error !== "cancel") {
      console.error("提交失败:", error);
    }
  }
};
</script>

<template>
  <div class="quality-page">
    <!--
      【van-form 解释】
      Vant 的表单组件，提供表单校验功能
      通过 ref 获取表单实例，调用 validate() 方法进行校验
    -->
    <van-form ref="formRef">
      <!--
        【卡片1: 基本信息】
        使用 van-cell-group 实现卡片效果
        inset: 圆角卡片风格，自带左右 margin 和圆角
      -->
      <van-cell-group inset class="form-card">
        <!--
          异常单号
          readonly: 只读，不可编辑
          数据由后台生成，用户无法修改
        -->
        <van-field
            v-model="orderNo"
            label="异常单号"
            placeholder="自动生成"
            readonly
            required
        />

        <!--
          模具号选择器
          is-link: 显示右侧箭头，表示可点击
          readonly: 禁止手动输入，只能通过选择器选择
          @click: 点击时打开选择器弹窗
        -->
        <van-field
            v-model="moldText"
            label="模具号"
            placeholder="请选择模具号"
            is-link
            readonly
            required
            :rules="[{ required: true, message: '请选择模具号' }]"
            @click="showMoldPicker = true"
        />

        <!--
          异常原因选择器
        -->
        <van-field
            v-model="reasonText"
            label="异常原因"
            placeholder="请选择异常原因"
            is-link
            readonly
            required
            :rules="[{ required: true, message: '请选择异常原因' }]"
            @click="showReasonPicker = true"
        />

        <!--
          责任部门选择器
          默认值为登录人所在部门
        -->
        <van-field
            v-model="deptText"
            label="责任部门"
            placeholder="请选择责任部门"
            is-link
            readonly
            required
            :rules="[{ required: true, message: '请选择责任部门' }]"
            @click="showDeptPicker = true"
        />

        <!--
          是否技术支持
          【van-radio-group 解释】
          单选按钮组，v-model 绑定选中的值
          direction="horizontal": 水平排列
        -->
        <van-field label="技术支持" required>
          <template #input>
            <van-radio-group v-model="needTechSupport" direction="horizontal">
              <van-radio name="1">是</van-radio>
              <van-radio name="0">否</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <!--
        【卡片2: 问题详情】
        包含问题描述和描述图片
      -->
      <van-cell-group inset class="form-card">
        <!--
          问题描述
          type="textarea": 多行文本输入
          maxlength: 最大字符数
          show-word-limit: 显示字数统计
          autosize: 自动调整高度
        -->
        <van-field
            v-model="description"
            label="问题描述"
            type="textarea"
            placeholder="请描述问题详情"
            required
            :rules="[{ required: true, message: '请填写问题描述' }]"
            maxlength="500"
            show-word-limit
            :autosize="{ minHeight: 80 }"
        />

        <!--
          描述图片
          【van-uploader 解释】
          图片上传组件
          v-model: 绑定已上传的图片列表
          multiple: 支持多选
          :before-read: 上传前的处理函数
          :after-read: 上传后的处理函数
          accept: 接受的文件类型
        -->
        <van-field label="描述图片">
          <template #input>
            <van-uploader
                v-model="imageList"
                multiple
                :before-read="beforeRead"
                :after-read="afterRead"
                accept="image/*"
            />
          </template>
        </van-field>
      </van-cell-group>

      <!--
        【卡片3: 补救措施】
        非必填字段
      -->
      <van-cell-group inset class="form-card">
        <van-field
            v-model="remedy"
            label="补救措施"
            type="textarea"
            placeholder="请填写补救措施（选填）"
            maxlength="500"
            show-word-limit
            :autosize="{ minHeight: 80 }"
        />
      </van-cell-group>

      <!--
        提交按钮
        type="primary": 主要按钮样式（蓝色）
        block: 块级按钮，宽度撑满容器
        round: 圆角按钮
      -->
      <div class="submit-btn-wrapper">
        <van-button type="primary" block round @click="handleSubmit">
          提交
        </van-button>
      </div>
    </van-form>

    <!--
      模具号选择器弹窗
      【van-popup + van-picker 组合说明】
      Popup 是弹出层容器，Picker 是选择器
      position="bottom": 从底部弹出
      round: 顶部圆角
      -->
    <van-popup v-model:show="showMoldPicker" position="bottom" round>
      <div class="picker-search">
        <van-search
            v-model="moldKeyword"
            placeholder="输入模具号关键词"
            shape="round"
            clearable
        />
      </div>
      <van-picker
          :columns="filteredMoldOptions"
          @confirm="onMoldConfirm"
          @cancel="showMoldPicker = false"
      />
    </van-popup>

    <!--
      异常原因选择器弹窗
      -->
    <van-popup v-model:show="showReasonPicker" position="bottom" round>
      <div class="picker-search">
        <van-search
            v-model="reasonKeyword"
            placeholder="输入异常原因关键词"
            shape="round"
            clearable
        />
      </div>
      <van-picker
          :columns="filteredReasonOptions"
          @confirm="onReasonConfirm"
          @cancel="showReasonPicker = false"
      />
    </van-popup>

    <!--
      责任部门选择器弹窗
      -->
    <van-popup v-model:show="showDeptPicker" position="bottom" round>
      <div class="picker-search">
        <van-search
            v-model="deptKeyword"
            placeholder="输入部门关键词"
            shape="round"
            clearable
        />
      </div>
      <van-picker
          :columns="filteredDeptOptions"
          @confirm="onDeptConfirm"
          @cancel="showDeptPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.quality-page {
  background: #f5f5f5;
  padding: 12px;
}

/* 表单卡片，卡片之间保持 12px 间距 */
.form-card {
  margin: 0;
  margin-bottom: 12px;
}

/* 提交按钮容器，添加上下间距 */
.submit-btn-wrapper {
  padding: 8px 16px;
}

/* 选择器内的搜索区域，提供筛选入口 */
.picker-search {
  padding: 8px 12px 4px;
  background: #fff;
}
</style>
