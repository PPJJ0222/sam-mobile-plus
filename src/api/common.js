/**
 * 复用性较高 API
 *
 * 【作用说明】
 * 封装复用性较高的后端接口调用
 */
import request from "./request";

/** 获取工艺字典 */
export function getCraftList() {
  return request({
    url: "/moldStandardCraft/moldStandardCraftController/getCraftList",
    method: "get",
  });
}
