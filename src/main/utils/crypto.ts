import { safeStorage } from 'electron'

/**
 * 加密工具 — 基于 Electron safeStorage
 * safeStorage 使用系统钥匙串（macOS Keychain / Windows DPAPI / Linux libsecret）
 * 加密后的数据以 Base64 字符串形式存储到数据库
 */

/** 检查当前平台是否支持加密 */
export function isEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable()
}

/** 加密明文，返回 Base64 编码的密文 */
export function encrypt(plainText: string): string {
  if (!plainText) return ''
  if (!isEncryptionAvailable()) {
    // 加密不可用时返回原文（开发环境或 Linux 无 libsecret）
    console.warn('[crypto] safeStorage 不可用，敏感信息将以明文存储')
    return plainText
  }
  const encrypted = safeStorage.encryptString(plainText)
  return encrypted.toString('base64')
}

/** 解密 Base64 密文，返回明文 */
export function decrypt(encryptedBase64: string): string {
  if (!encryptedBase64) return ''
  if (!isEncryptionAvailable()) {
    return encryptedBase64
  }
  try {
    const buffer = Buffer.from(encryptedBase64, 'base64')
    // 如果不是 safeStorage 加密的数据会抛异常，降级返回原文
    return safeStorage.decryptString(buffer)
  } catch {
    // 可能是未加密的旧数据，直接返回
    return encryptedBase64
  }
}