/**
 * 钳调反馈相关 API
 *
 * 【作用说明】
 * 封装钳调反馈模块的所有后端接口调用
 */
import request from "./request";

/**
 * 根据班组和关键词搜索模具列表
 * 用于模具选择器的远程搜索
 *
 * @param {Object} params - 搜索参数
 * @param {string} params.plineCode - 班组编码
 * @param {string} params.moldCode - 模具关键词
 * @returns {Promise<Array<{value: string, text: string}>>} 模具列表
 */
export function getSamMouldInfoByProAndBz(params) {
  return request({
    url: "/rel/qtrel/getSamMouldInfoByProAndBz",
    method: "get",
    params,
  }).then((res) => {
    // 转换为选择器需要的格式，显示 code(name)
    const data = res.data || [];
    return data.map((item) => ({
      value: item.code,
      text: item.name ? `${item.code}(${item.name})` : item.code,
    }));
  });
}

/**
 * 获取件号列表
 * 用于件号选择框的下拉数据，依赖于模具
 *
 * @param {string} mouldCode - 模具号
 * @returns {Promise<Array<{value: string, text: string}>>} 件号列表
 */
export function getPartNoList(mouldCode) {
  return request({
    url: `/rel/qtrel/getImportPartCodeByMouldCode/${mouldCode}`,
    method: "get",
  }).then((res) => {
    // 转换为选择器需要的格式
    const data = res.data || [];
    return data.map((item) => ({
      value: item.importPartCode,
      text: item.importPartCode,
    }));
  });
}

/**
 * 查询待处理工单列表
 *
 * @param {Object} params - 查询参数
 * @param {string} params.moldCode - 模具号
 * @param {string} params.importPartCode - 件号
 * @param {string} params.mouldMakeOrder - 制造令号
 * @param {string} params.shiftChange - 是否调班 ('0' 否, '1' 是)
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @returns {Promise<{rows: Array, total: number}>}
 */
export function getOrderList(params) {
  return request({
    url: "/SamMesPartsOrderController/partsOrder/getWaitAssignOrders",
    method: "get",
    params,
  });
}

/**
 * 获取工单详情
 * 根据工单ID获取详细信息
 *
 * @param {string} id - 工单 ID
 * @returns {Promise<Object>} 详情数据
 */
export function getQiandiaoDetail(id) {
  return request({
    url: `/SamMesPartsOrderController/partsOrder/getWaitAssignOrderById/${id}`,
    method: "get",
  }).then((res) => res.data);
}

/**
 * 获取加工设备列表
 *
 * @returns {Promise<Array<{value: string, text: string}>>} 设备列表
 */
export function getDeviceList() {
  return request({
    url: "/fm/equipment/getMachineListByPlineForMobile",
    method: "get",
    params: { sysOrgCode: "30" },
  }).then((res) => {
    // 转换为选择器需要的格式，显示 code(name)
    const data = res.data || [];
    return data.map((item) => ({
      value: item.code,
      text: item.name ? `${item.code}(${item.name})` : item.code,
    }));
  });
}

/**
 * 提交钳调反馈
 *
 * @param {Object} data - 反馈数据（完整的工单信息 + 反馈表单信息）
 * @returns {Promise<Object>}
 */
export function submitQiandiaoFeedback(data) {
  return request({
    url: "/dgn/unitBack/saveUnitBackListForQT",
    method: "post",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: {
      unitBackList: JSON.stringify([data]),
    },
  });
}

/**
 * 获取钳调用户信息
 * 用于页面顶部显示当前用户的部门-班组-姓名
 *
 * @returns {Promise<Object>} 用户信息
 *   - deptId: 部门ID
 *   - deptName: 部门名称
 *   - plineCode: 班组编码
 *   - plineName: 班组名称
 *   - operatorUserName: 操作员用户名
 *   - operatorNickName: 操作员姓名
 */
export function getQianTiaoUserInfo() {
  return request({
    url: "/rel/qtrel/getQianTiaoUserInfo",
    method: "get",
  }).then((res) => res.data);
}
