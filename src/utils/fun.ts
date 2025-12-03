import { isArray } from "@pureadmin/utils";

/**
 * 通用字符串截取方法
 * @param {string} str - 要截取的字符串
 * @param {number} maxLength - 最大长度（包括扩展名）
 * @param {string} ellipsis - 省略号，默认为"..."
 * @returns {string} 截取后的字符串
 */
export function truncateString(str: string, maxLength = 20, ellipsis = "...") {
  if (!str || typeof str !== "string") return str;
  if (str.length <= maxLength) return str;

  // 处理文件名，保留扩展名
  const lastDotIndex = str.lastIndexOf(".");
  let fileName = str;
  let fileExtension = "";

  if (lastDotIndex > 0 && lastDotIndex < str.length - 1) {
    fileName = str.substring(0, lastDotIndex);
    fileExtension = str.substring(lastDotIndex);
  }

  // 计算可用长度（减去省略号和扩展名的长度）
  const availableLength = maxLength - ellipsis.length - fileExtension.length;

  if (availableLength <= 0) {
    // 如果可用长度不足，只显示扩展名和省略号
    return ellipsis + fileExtension;
  }

  // 截取文件名部分
  const truncatedName = fileName.substring(0, availableLength) + ellipsis;

  return truncatedName + fileExtension;
}

/**
 * 专门用于文件名的截取方法（智能处理长文件名）
 * @param {string} fileName - 文件名
 * @param {number} maxLength - 最大显示长度，默认为15
 * @returns {string} 截取后的文件名
 */
export function truncateFileName(fileName, maxLength = 15) {
  return truncateString(fileName, maxLength, "...");
}

export function getLastItem(str, type) {
  if (type == "update") {
    return str ? str[0] : "";
  }
  if (str.length == 0) {
    return "";
  }
  console.log("str", str);

  const parts = str.split("/");
  return parts[parts.length - 1];
}
