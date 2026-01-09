/**
 * 图片压缩工具
 *
 * 【作用说明】
 * 当用户上传的图片超过指定大小时，自动压缩图片
 * 使用 Canvas API 实现压缩，通过降低图片质量来减小文件大小
 */

/**
 * 压缩图片
 *
 * @param {File} file - 原始图片文件
 * @param {number} maxSize - 最大文件大小（字节），默认 5MB
 * @param {number} quality - 压缩质量（0-1），默认 0.7
 * @returns {Promise<File>} 压缩后的图片文件
 */
export function compressImage(file, maxSize = 5 * 1024 * 1024, quality = 0.7) {
  return new Promise((resolve, reject) => {
    // 如果文件已经小于限制，直接返回
    if (file.size <= maxSize) {
      resolve(file);
      return;
    }

    // 创建 FileReader 读取图片
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        // 创建 Canvas 进行压缩
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // 保持原始尺寸
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制图片到 Canvas
        ctx.drawImage(img, 0, 0);

        // 尝试不同质量级别压缩
        let currentQuality = quality;
        let compressedBlob = null;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob.size <= maxSize || currentQuality <= 0.1) {
                // 压缩成功或已达到最低质量
                compressedBlob = blob;
                // 将 Blob 转换为 File
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // 继续降低质量
                currentQuality -= 0.1;
                tryCompress();
              }
            },
            "image/jpeg",
            currentQuality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        reject(new Error("图片加载失败"));
      };
    };

    reader.onerror = () => {
      reject(new Error("文件读取失败"));
    };
  });
}

/**
 * 检查图片大小并在需要时压缩
 *
 * @param {File} file - 图片文件
 * @param {number} maxSize - 最大文件大小（字节），默认 5MB
 * @returns {Promise<{file: File, compressed: boolean, tooLarge: boolean}>}
 *   - file: 处理后的文件
 *   - compressed: 是否进行了压缩
 *   - tooLarge: 压缩后是否仍然超过限制
 */
export async function processImage(file, maxSize = 5 * 1024 * 1024) {
  // 文件大小在限制内，直接返回
  if (file.size <= maxSize) {
    return { file, compressed: false, tooLarge: false };
  }

  // 尝试压缩
  try {
    const compressedFile = await compressImage(file, maxSize);

    // 检查压缩后是否仍然超过限制
    if (compressedFile.size > maxSize) {
      return { file: compressedFile, compressed: true, tooLarge: true };
    }

    return { file: compressedFile, compressed: true, tooLarge: false };
  } catch (error) {
    console.error("图片压缩失败:", error);
    return { file, compressed: false, tooLarge: true };
  }
}
