// JavaScript type definitions - using object constants instead of TypeScript interfaces
// These are used for documentation and IDE hints, not actual runtime types

export const User = {};
export const UserInfo = {};
export const Workspace = {};
export const ModelConfig = {};
export const Folder = {};
export const Agent = {};
export const ApiTaskType = {};
export const VideoOutputItem = {};
export const TaskOutputData = {};
export const TaskRun = {};
export const Thread = {};
export const ApiMessage = {};
export const ChatTask = {};
export const ChatMessage = {};
export const SidebarItem = {};
export const CreditTransaction = {};
export const PayPalOrder = {};
export const CreateOrderRequest = {};
export const CreateOrderResponse = {};
export const CaptureOrderRequest = {};
export const CaptureOrderResponse = {};
export const Invitation = {};
export const WorkspaceRole = {};
export const WorkspacePermission = {};
export const WorkspaceMember = {};
export const WorkspaceProfile = {};
export const WorkspaceError = {};
export const Notification = {};

// JSDoc comments for better IDE support
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [avatar]
 * @property {number} [credit]
 */

/**
 * @typedef {Object} Folder
 * @property {string} id
 * @property {string} name
 * @property {string} [path]
 * @property {string} [folder_type]
 * @property {string} [status]
 */

/**
 * @typedef {Object} Agent
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {string} [avatar]
 * @property {string} [category]
 * @property {string} [role_description]
 * @property {string} [status]
 * @property {Object} [model_config]
 * @property {string} [instructions]
 * @property {string} [job_brief]
 * @property {string} [language]
 * @property {string} [position]
 * @property {string} [greeting_message]
 * @property {string} creator_id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Folder[]} folders
 * @property {string[]} [image_urls]
 * @property {string} [file_url]
 * @property {number} [running_count]
 * @property {number} [successful_runs]
 * @property {number} [total_runs]
 * @property {number} [failed_runs]
 * @property {boolean} [is_running]
 * @property {boolean} [is_scheduled]
 * @property {string} [last_message_time]
 * @property {string} [last_message_content]
 */