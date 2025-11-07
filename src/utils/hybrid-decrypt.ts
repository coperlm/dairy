// 混合解密工具 - 浏览器端
// 支持 RSA 私钥解密 + AES 解密

/**
 * 使用口令解密 RSA 私钥,然后用私钥解密 AES 密钥,最后解密日记内容
 * @param encryptedData - AES 加密的日记数据
 * @param encryptedKey - RSA 加密的 AES 密钥
 * @param passphrase - 用户输入的口令
 * @param privateKeyPem - 加密的 RSA 私钥 PEM 格式
 * @returns 解密后的日记数据
 */
export async function decryptHybrid(
  encryptedData: string,
  encryptedKey: string,
  passphrase: string,
  privateKeyPem: string
): Promise<any> {
  try {
    // 1. 导入加密的私钥
    const privateKey = await importPrivateKey(privateKeyPem, passphrase);
    
    // 2. 使用 RSA 私钥解密 AES 密钥
    const aesKeyBuffer = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      privateKey,
      base64ToArrayBuffer(encryptedKey)
    );
    
    // 3. 将 ArrayBuffer 转换为字符串
    const aesKey = arrayBufferToString(aesKeyBuffer);
    
    // 4. 使用 AES 密钥解密日记数据 (使用 CryptoJS)
    const CryptoJS = (await import('crypto-js')).default;
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, aesKey);
    const decryptedJson = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedJson) {
      throw new Error('解密失败: AES 解密返回空');
    }
    
    // 5. 解析 JSON
    return JSON.parse(decryptedJson);
    
  } catch (error) {
    console.error('混合解密失败:', error);
    throw new Error(`解密失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 导入加密的 RSA 私钥
 */
async function importPrivateKey(
  pemKey: string,
  passphrase: string
): Promise<CryptoKey> {
  // 移除 PEM 头尾和换行符
  const pemHeader = '-----BEGIN ENCRYPTED PRIVATE KEY-----';
  const pemFooter = '-----END ENCRYPTED PRIVATE KEY-----';
  const pemContents = pemKey
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '');
  
  // Base64 解码
  const binaryDer = base64ToArrayBuffer(pemContents);
  
  // 使用 passphrase 解密私钥 (这需要 Node.js crypto API)
  // 在浏览器中,我们需要另一种方法...
  
  // 实际上,浏览器的 Web Crypto API 不直接支持加密的私钥导入
  // 我们需要使用一个库来处理 PKCS#8 加密私钥
  
  // 这里返回一个占位符,实际实现需要使用 forge 等库
  throw new Error('浏览器端解密加密私钥需要额外的库支持');
}

/**
 * Base64 转 ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * ArrayBuffer 转字符串
 */
function arrayBufferToString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

/**
 * 验证口令是否正确
 */
export async function verifyPassphrase(
  passphrase: string,
  expectedHash: string
): Promise<boolean> {
  const CryptoJS = (await import('crypto-js')).default;
  const hash = CryptoJS.SHA256(passphrase).toString();
  return hash === expectedHash;
}
