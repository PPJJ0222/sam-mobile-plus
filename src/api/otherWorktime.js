/**
 * 其他工时相关 API
 *
 * 【作用说明】
 * 封装辅助工时、工件工时模块的所有后端接口调用
 */
import request from "./request";

/**
 * 根据工艺大分类获取工艺列表
 * 用于辅助工时表单的工艺选择
 *
 * @param {string} bigTypeName - 工艺大分类名称，如 '辅助工时'
 * @returns {Promise<Array<{value: string, text: string}>>} 工艺列表
 */
export function getCraftByBigType(bigTypeName) {
  return request({
    url: `/moldStandardCraft/moldStandardCraftController/getCraftByBigType/${bigTypeName}`,
    method: "get",
  }).then((res) => {
    const data = res.data || [];
    return data.map((item) => ({
      value: item.craftCode,
      text: item.craftName,
      // 保留原始数据，用于判断是否为辅助设备类
      raw: item,
    }));
  });
}

/**
 * 根据班组获取工艺列表
 * 用于工件工时表单的工艺选择
 *
 * @param {string} plineCode - 班组编码
 * @returns {Promise<Array<{value: string, text: string}>>} 工艺列表
 */
export function getCraftByPlineId(plineCode) {
  return request({
    url: `/samMesPlineCraft/samMesPlineCraftController/getCraftByPlineId/${plineCode}`,
    method: "get",
  }).then((res) => {
    const data = res.data || [];
    return data.map((item) => ({
      value: item.craftCode,
      text: item.craftName,
      raw: item,
    }));
  });
}

/**
 * 获取加工设备列表
 *
 * @param {Object} params - 查询参数
 * @param {string} params.sysOrgCode - 组织编码
 * @returns {Promise<Array<{value: string, text: string}>>} 设备列表
 */
export function getMachineListByPline(params) {
  return request({
    url: "/fm/equipment/getMachineListByPlineForMobile",
    method: "get",
    params,
  }).then((res) => {
    const data = res.data || [];
    return data.map((item) => ({
      value: item.code,
      text: item.name ? `${item.code}(${item.name})` : item.code,
    }));
  });
}

/**
 * 根据班组和关键词搜索模具列表
 * 用于工件工时表单的模具远程搜索
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
    const data = res.data || [];
    return data.map((item) => ({
      value: item.code,
      text: item.name ? `${item.code}(${item.name})` : item.code,
    }));
  });
}

/**
 * 根据模具号获取件号列表
 *
 * @param {string} mouldCode - 模具号
 * @returns {Promise<Array<{value: string, text: string}>>} 件号列表
 */
export function getImportPartCodeByMouldCode(mouldCode) {
  return request({
    url: `/rel/qtrel/getImportPartCodeByMouldCode/${mouldCode}`,
    method: "get",
  }).then((res) => {
    const data = res.data || [];
    return data.map((item) => ({
      value: item.importPartCode,
      text: item.importPartCode,
    }));
  });
}

/**
 * 获取字典数据
 * 用于获取工时类型等字典
 *
 * @param {string} dictType - 字典类型，如 'mould_make_order_type'
 * @returns {Promise<Array<{value: string, text: string}>>} 字典列表
 */
export function getDicts(dictType) {
  return request({
    url: `/system/dict/data/type/${dictType}`,
    method: "get",
  }).then((res) => {
    const data = res.data || [];
    return data.map((item) => ({
      value: item.dictValue,
      text: item.dictLabel,
    }));
  });
}

/**
 * 提交辅助工时
 *
 * @param {Array<Object>} data - 辅助工时数据数组
 * @returns {Promise<Object>}
 */
export function saveMesOtherBackList(data) {
  return request({
    url: "/dgn/unitBack/saveMesOtherBackList",
    method: "post",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: {
      mesOtherBackList: JSON.stringify(data),
    },
  });
}

/**
 * 提交工件工时
 *
 * @param {Array<Object>} data - 工件工时数据数组
 * @returns {Promise<Object>}
 */
export function workPieceTimeFeedback(data) {
  return request({
    url: "/dgn/unitBack/workPieceTimeFeedback",
    method: "post",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: {
      unitBackList: JSON.stringify(data),
    },
  });
}
