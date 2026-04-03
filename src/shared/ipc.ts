// ==========================================
// IPC 通道常量定义
// ==========================================

/** IPC 通道常量 */
export const IPC_CHANNELS = {
  // 项目
  PROJECT_CREATE: 'project:create',
  PROJECT_LIST: 'project:list',
  PROJECT_GET: 'project:get',
  PROJECT_DELETE: 'project:delete',
  PROJECT_UPDATE: 'project:update',
  PROJECT_GET_CLIPS: 'project:getClips',

  // 视频处理
  VIDEO_GET_INFO: 'video:getInfo',
  VIDEO_START_PROCESS: 'video:startProcess',
  VIDEO_CANCEL_PROCESS: 'video:cancelProcess',
  VIDEO_PROGRESS: 'video:progress',

  // 设置
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // 上传
  UPLOAD_START: 'upload:start',
  UPLOAD_PROGRESS: 'upload:progress',

  // 对话框
  DIALOG_OPEN_FILE: 'dialog:openFile',
  DIALOG_OPEN_DIRECTORY: 'dialog:openDirectory',

  // 窗口控制
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:isMaximized',
} as const
