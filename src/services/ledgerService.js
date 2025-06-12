import { get, post } from './request';

/**
 * Ledger related API services
 */
export default {
  /**
   * Create a new ledger
   * @param {Object} data - ledger information
   */
  createLedger: (data) => {
    return post('/api/ledger/create', data);
  },
  
  /**
   * Update a ledger
   * @param {Object} data - ledger information
   */
  updateLedger: (data) => {
    return post('/api/ledger/update', data);
  },
  
  /**
   * Delete a ledger
   * @param {Number} id - ledger ID
   */
  deleteLedger: (id) => {
    return post('/api/ledger/delete', null, { header: { params: { id } } });
  },
  
  /**
   * Get a ledger by ID
   * @param {Number} id - ledger ID
   */
  getLedger: (id) => {
    return get('/api/ledger/get', { id });
  },

  /**
   * Get detailed ledger info
   * @param {Number} id - ledget ID
   */
  // {
  //   "code": 0,
  //   "data": {
  //     "createTime": "",
  //     "deleteTime": "",
  //     "description": "",
  //     "entries": [
  //       {
  //         "amount": 0,
  //         "category": "",
  //         "createTime": "",
  //         "date": "",
  //         "deleteTime": "",
  //         "icon": "",
  //         "id": 0,
  //         "ledgerId": 0,
  //         "note": "",
  //         "type": "",
  //         "updateTime": "",
  //         "userId": 0
  //       }
  //     ],
  //     "icon": "",
  //     "id": 0,
  //     "members": [
  //       {
  //         "avatar": "",
  //         "birthday": "",
  //         "createTime": "",
  //         "deleteTime": "",
  //         "email": "",
  //         "id": 0,
  //         "ledgerId": 0,
  //         "openId": "",
  //         "phoneNumber": "",
  //         "role": "",
  //         "unionId": "",
  //         "updateTime": "",
  //         "userId": 0,
  //         "username": ""
  //       }
  //     ],
  //     "name": "",
  //     "updateTime": ""
  //   },
  //   "message": ""
  // }
  getLedgerDetail: (id) => {
    return get('/api/ledger/get/detail', { id });
  },
  
  /**
   * Get all ledgers for the current user
   */
  getMyLedgers: () => {
    return get('/api/ledger/my/list');
  },

  /**
   * Get detailed ledger info for all ledgers
   */
  // {
  //   "code": 0,
  //   "data": [
  //     {
  //       "createTime": "",
  //       "deleteTime": "",
  //       "description": "",
  //       "entries": [
  //         {
  //           "amount": 0,
  //           "category": "",
  //           "createTime": "",
  //           "date": "",
  //           "deleteTime": "",
  //           "icon": "",
  //           "id": 0,
  //           "ledgerId": 0,
  //           "note": "",
  //           "type": "",
  //           "updateTime": "",
  //           "userId": 0
  //         }
  //       ],
  //       "icon": "",
  //       "id": 0,
  //       "members": [
  //         {
  //           "avatar": "",
  //           "birthday": "",
  //           "createTime": "",
  //           "deleteTime": "",
  //           "email": "",
  //           "id": 0,
  //           "ledgerId": 0,
  //           "openId": "",
  //           "phoneNumber": "",
  //           "role": "",
  //           "unionId": "",
  //           "updateTime": "",
  //           "userId": 0,
  //           "username": ""
  //         }
  //       ],
  //       "name": "",
  //       "updateTime": ""
  //     }
  //   ],
  //   "message": ""
  // }
  getMyLedgersDetail: () => {
    return get('/api/ledger/my/list/detail');
  },
  
  /**
   * Add a user to a ledger
   * @param {Object} data - ledger user information
   */
  addLedgerUser: (data) => {
    return post('/api/ledger/user/add', data);
  },
  
  /**
   * Add multiple users to a ledger
   * @param {Array} data - array of ledger user information
   */
  addLedgerUsersBatch: (data) => {
    return post('/api/ledger/user/add/batch', data);
  },
  
  /**
   * Update a user's role in a ledger
   * @param {Object} data - ledger user information
   */
  updateLedgerUserRole: (data) => {
    return post('/api/ledger/user/update', data);
  },
  
  /**
   * Exit from a ledger
   * @param {Number} ledgerId - ledger ID
   */
  exitLedger: (ledgerId) => {
    return post('/api/ledger/user/exit', null, { header: { params: { ledgerId } } });
  },
  
  /**
   * Remove a user from a ledger
   * @param {Number} ledgerId - ledger ID
   * @param {Number} userId - user ID
   */
  removeUserFromLedger: (ledgerId, userId) => {
    return post('/api/ledger/user/remove', null, { header: { params: { ledgerId, userId } } });
  },
  
  /**
   * List all users in a ledger
   * @param {Number} ledgerId - ledger ID
   */
  listLedgerUsers: (ledgerId) => {
    return get('/api/ledger/user/list', { ledgerId });
  }
}; 