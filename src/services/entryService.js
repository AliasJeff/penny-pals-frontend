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
   * List entries by ledger
   * @param {Object} queryParams - query parameters
   */
  listLedgerEntries: (queryParams) => {
    return post('/api/entry/listByLedger', queryParams);
  },

  /**
   * List entries by user
   * @param {Object} queryParams - query parameters
   */
  listUserEntries: (queryParams) => {
    return post('/api/entry/listByUser', queryParams);
  },

  /**
   * List entries for the current logged in user
   * @param {Object} queryParams - query parameters
   */
  listMyEntries: (queryParams) => {
    return post('/api/entry/my/list', queryParams);
  }
}; 