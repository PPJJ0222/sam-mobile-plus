/**
 * 质量快反相关 API
 *
 * 【作用说明】
 * 封装质量快反模块的所有后端接口调用
 * 目前为预留接口，返回模拟数据，后续替换为真实接口
 */
import request from "./request";

/**
 * 生成异常单号
 * 进入页面时调用，获取后台生成的唯一单号
 *
 * @returns {Promise<{orderNo: string}>} 返回异常单号
 */
export function generateOrderNo() {
  // TODO: 替换为真实接口
  // return request.get('/quality/generateOrderNo')

  // 模拟数据：生成格式为 YC + 年月日 + 4位序号
  return Promise.resolve({
    orderNo:
      "YC" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "0001",
  });
}

/**
 * 获取模具号列表
 * 用于模具号选择框的下拉数据
 *
 * @returns {Promise<Array<{value: string, text: string}>>} 模具号列表
 */
export function getMoldList() {
  // TODO: 替换为真实接口
  // return request.get('/quality/moldList')

  return Promise.resolve([
    { value: "M001", text: "M001-前保险杠" },
    { value: "M002", text: "M002-后保险杠" },
    { value: "M003", text: "M003-车门内板" },
    { value: "M004", text: "M004-发动机罩" },
  ]);
}

/**
 * 获取异常原因列表
 * 用于异常原因选择框的下拉数据
 *
 * @returns {Promise<Array<{value: string, text: string}>>} 异常原因列表
 */
export function getReasonList() {
  // TODO: 替换为真实接口
  // return request.get('/quality/reasonList')

  return Promise.resolve([
    { value: "R001", text: "尺寸超差" },
    { value: "R002", text: "外观缺陷" },
    { value: "R003", text: "材料问题" },
    { value: "R004", text: "设备故障" },
    { value: "R005", text: "工艺问题" },
  ]);
}

/**
 * 获取部门列表
 * 用于责任部门选择框的下拉数据
 *
 * @returns {Promise<Array<{value: string, text: string}>>} 部门列表
 */
export function getDeptList() {
  // TODO: 替换为真实接口
  // return request.get('/quality/deptList')

  return Promise.resolve([
    { value: "D001", text: "生产部" },
    { value: "D002", text: "质量部" },
    { value: "D003", text: "技术部" },
    { value: "D004", text: "设备部" },
    { value: "D005", text: "采购部" },
  ]);
}

/**
 * 获取当前登录用户信息
 * 用于获取用户所属部门，作为责任部门的默认值
 *
 * @returns {Promise<{deptId: string, deptName: string, userName: string}>} 用户信息
 */
export function getUserInfo() {
  // TODO: 替换为真实接口
  // return request.get('/user/info')

  return Promise.resolve({
    deptId: "D002",
    deptName: "质量部",
    userName: "张三",
  });
}

/**
 * 上传图片
 * 将图片文件上传到服务器
 *
 * @param {File} file - 图片文件对象
 * @returns {Promise<{url: string}>} 返回图片访问地址
 */
export function uploadImage(file) {
  // TODO: 替换为真实接口
  // const formData = new FormData()
  // formData.append('file', file)
  // return request.post('/common/upload', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // })

  // 模拟上传：返回一个假的图片地址
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: "https://placeholder.com/image_" + Date.now() + ".jpg",
      });
    }, 500);
  });
}

/**
 * 提交质量快反表单
 *
 * @param {Object} data - 表单数据
 * @param {string} data.orderNo - 异常单号
 * @param {string} data.moldNo - 模具号
 * @param {string} data.reason - 异常原因
 * @param {string} data.deptId - 责任部门ID
 * @param {boolean} data.needTechSupport - 是否需要技术支持
 * @param {string} data.description - 问题描述
 * @param {Array<string>} data.images - 图片URL数组
 * @param {string} data.remedy - 补救措施
 * @returns {Promise<{success: boolean, message: string}>}
 */
export function submitQualityForm(data) {
  // TODO: 替换为真实接口
  // return request.post('/quality/submit', data)

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("提交的表单数据:", data);
      resolve({
        success: true,
        message: "提交成功",
      });
    }, 1000);
  });
}
