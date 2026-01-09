/**
 * RSA 加密/解密工具
 *
 * 【作用说明】
 * 使用 jsencrypt 库进行 RSA 加密解密
 * 主要用于：
 * 1. 登录时对密码进行加密传输
 * 2. 记住密码功能中对密码进行加密存储和解密读取
 *
 * 【jsencrypt 库说明】
 * jsencrypt 是一个纯 JavaScript 实现的 RSA 加密库
 * 支持公钥加密、私钥解密
 */
import JSEncrypt from "jsencrypt";

// RSA 公钥（用于加密）
const PUBLIC_KEY = `MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdH
nzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ==`;

// RSA 私钥（用于解密，记住密码功能使用）
const PRIVATE_KEY = `MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAqhHyZfSsYourNxaY
7Nt+PrgrxkiA50efORdI5U5lsW79MmFnusUA355oaSXcLhu5xxB38SMSyP2KvuKN
PuH3owIDAQABAkAfoiLyL+Z4lf4Myxk6xUDgLaWGximj20CUf+5BKKnlrK+Ed8gA
kM0HqoTt2UZwA5E2MzS4EI2gjfQhz5X28uqxAiEA3wNFxfrCZlSZHb0gn2zDpWow
cSxQAgiCstxGUoOqlW8CIQDDOerGKH5OmCJ4Z21v+F25WaHYPxCFMvwxpcw99Ecv
DQIgIdhDTIqD2jfYjPTY8Jj3EDGPbH2HHuffvflECt3Ek60CIQCFRlCkHpi7hthh
YhovyloRYsM+IS9h/0BzlEAuO0ktMQIgSPT3aFAgJYwKpqRYKlLDVcflZFCKY7u3
UP8iWi1Qw0Y=`;

/**
 * RSA 加密
 * @param {string} text - 要加密的明文
 * @returns {string|false} 加密后的密文，失败返回 false
 *
 * 【使用场景】
 * 登录时对密码进行加密后再发送给后端
 */
export function encrypt(text) {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(PUBLIC_KEY);
  return encryptor.encrypt(text);
}

/**
 * RSA 解密
 * @param {string} text - 要解密的密文
 * @returns {string|false} 解密后的明文，失败返回 false
 *
 * 【使用场景】
 * 记住密码功能：从本地存储读取加密的密码后进行解密
 */
export function decrypt(text) {
  const decryptor = new JSEncrypt();
  decryptor.setPrivateKey(PRIVATE_KEY);
  return decryptor.decrypt(text);
}
