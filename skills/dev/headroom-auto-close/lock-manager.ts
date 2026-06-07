import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * 鎖定信息接口
 */
export interface LockInfo {
  timestamp: string;
  processId: string;
  isActive: boolean;
}

/**
 * 鎖定管理器選項
 */
export interface LockManagerOptions {
  lockFilePath?: string;
  lockTimeoutMinutes?: number;
}

/**
 * 預設選項
 */
export const DEFAULT_LOCK_MANAGER_OPTIONS: LockManagerOptions = {
  lockFilePath: 'skills/dev/headroom-auto-close/.lock',
  lockTimeoutMinutes: 30,
};

/**
 * 鎖定管理器類
 */
export class LockManager {
  private options: LockManagerOptions;
  private lockFilePath: string;

  constructor(options: Partial<LockManagerOptions> = {}) {
    this.options = {
      ...DEFAULT_LOCK_MANAGER_OPTIONS,
      ...options,
    };
    
    // 處理相對路徑
    const defaultLockPath = DEFAULT_LOCK_MANAGER_OPTIONS.lockFilePath || 'skills/dev/headroom-auto-close/.lock';
    if (this.options.lockFilePath && !path.isAbsolute(this.options.lockFilePath)) {
      this.lockFilePath = path.join(process.cwd(), this.options.lockFilePath);
    } else {
      this.lockFilePath = this.options.lockFilePath || defaultLockPath;
    }
  }

  /**
   * 嘗試獲取鎖
   * @returns 是否成功獲取鎖
   */
  public acquireLock(): boolean {
    // 檢查是否存在現有鎖
    if (this.hasLock()) {
      // 檢查鎖是否過期
      if (!this.isLockExpired()) {
        console.log('存在未過期的鎖，放棄操作');
        return false;
      }
      
      // 鎖已過期，清理後重新獲取
      console.log('鎖已過期，清理舊鎖');
      this.releaseLock();
    }

    // 創建鎖文件
    const lockInfo: LockInfo = {
      timestamp: new Date().toISOString(),
      processId: this.getProcessId(),
      isActive: true,
    };

    try {
      fs.writeFileSync(this.lockFilePath, JSON.stringify(lockInfo, null, 2));
      console.log('成功獲取鎖');
      return true;
    } catch (error) {
      console.error('獲取鎖失敗:', error);
      return false;
    }
  }

  /**
   * 檢查是否存在鎖
   * @returns 是否存在鎖
   */
  public hasLock(): boolean {
    return fs.existsSync(this.lockFilePath);
  }

  /**
   * 檢查鎖是否過期
   * @returns 是否過期
   */
  public isLockExpired(): boolean {
    try {
      const lockData = fs.readFileSync(this.lockFilePath, 'utf8');
      const lockInfo = JSON.parse(lockData) as LockInfo;
      
      const lockTime = new Date(lockInfo.timestamp);
      const now = new Date();
      const diffMinutes = (now.getTime() - lockTime.getTime()) / (1000 * 60);
      
      return diffMinutes > (this.options.lockTimeoutMinutes || 30);
    } catch (error) {
      console.error('檢查鎖過期時出錯:', error);
      return true; // 出錯時假設鎖已過期
    }
  }

  /**
   * 釋放鎖
   * @returns 是否成功釋放鎖
   */
  public releaseLock(): boolean {
    try {
      if (fs.existsSync(this.lockFilePath)) {
        fs.unlinkSync(this.lockFilePath);
        console.log('成功釋放鎖');
        return true;
      }
      return true; // 鎖已不存在，視為成功
    } catch (error) {
      console.error('釋放鎖失敗:', error);
      return false;
    }
  }

  /**
   * 獲取當前進程 ID
   * @returns 進程 ID
   */
  private getProcessId(): string {
    return process.pid.toString();
  }

  /**
   * 獲取鎖信息
   * @returns 鎖信息或 null
   */
  public getLockInfo(): LockInfo | null {
    if (!this.hasLock()) {
      return null;
    }

    try {
      const lockData = fs.readFileSync(this.lockFilePath, 'utf8');
      return JSON.parse(lockData) as LockInfo;
    } catch (error) {
      console.error('獲取鎖信息失敗:', error);
      return null;
    }
  }

  /**
   * 執行帶鎖的異步操作
   * @param operation 帶鎖操作
   * @returns 操作結果
   */
  public async executeWithLock<T>(operation: () => Promise<T>): Promise<T | null> {
    if (!this.acquireLock()) {
      console.log('無法獲取鎖，跳過操作');
      return null;
    }

    try {
      const result = await operation();
      return result;
    } finally {
      this.releaseLock();
    }
  }

  /**
   * 創建鎖管理器實例
   * @param options 選項
   * @returns LockManager 實例
   */
  public static create(options?: Partial<LockManagerOptions>): LockManager {
    return new LockManager(options);
  }
}

/**
 * 創建鎖管理器實例的工廠函數
 * @param options 選項
 * @returns LockManager 實例
 */
export function createLockManager(options?: Partial<LockManagerOptions>): LockManager {
  return new LockManager(options);
}