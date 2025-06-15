import { get, post } from './request';

/**
 * Entry (financial record) related API services
 */
export default {
  /**
   * Create a new entry
   * @param {Object} data - entry information
   */
  createEntry: (data) => {
    return post('/api/entry/create', data);
  },

  /**
   * Update an existing entry
   * @param {Object} data - entry information
   */
  updateEntry: (data) => {
    return post('/api/entry/update', data);
  },

  /**
   * Delete an entry
   * @param {Number} id - entry ID
   */
  deleteEntry: (id) => {
    return post('/api/entry/delete', { id });
  },

  /**
   * 查询指定账本下的账目记录（支持多条件筛选）
   * 
   * @function listLedgerEntries
   * @description 
   * 向后端提交查询条件，获取指定账本（ledgerId）下的账目列表。支持按用户、日期、分类、关键词等进行筛选，
   * 并支持时间范围查询（startDate 到 endDate）及排序设置。
   * 
   * @param {Object} queryParams - 查询参数对象
   * @param {number} queryParams.ledgerId - 账本ID（必填）
   * @param {number} [queryParams.userId] - 用户ID（可选，筛选该用户下的账目）
   * @param {string} [queryParams.date] - 精确日期（可选，格式为 "YYYY-MM-DD"）
   * @param {string} [queryParams.startDate] - 起始日期（可选，用于范围查询，格式为 "YYYY-MM-DD"）
   * @param {string} [queryParams.endDate] - 结束日期（可选，用于范围查询，格式为 "YYYY-MM-DD"）
   * @param {string} [queryParams.category] - 分类名称（可选，用于精确匹配账目分类）
   * @param {string} [queryParams.keyword] - 关键词（可选，模糊匹配备注和分类）
   * @param {string} [queryParams.orderBy] - 排序字段（可选，如 "date", "amount" 等）
   * @param {string} [queryParams.orderDirection] - 排序方向（可选，"asc" 或 "desc"，默认为 "desc"）
   */
  listLedgerEntries: (queryParams) => {
    return post('/api/entry/listByLedger', queryParams);
  },

  /**
   * List entries for the current logged in user
   * @param {Object} queryParams - query parameters
   */
  listMyEntries: (queryParams) => {
    return post('/api/entry/my/list', queryParams);
  }
}; 