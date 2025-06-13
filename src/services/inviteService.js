import { get, post } from './request';

export default {

    /**
     * Create an invite code for a ledger
     * @param {Number} ledgerId
     * @returns {Object} - invite code
     */
    createInviteCode: (ledgerId) => {
        return post(`/api/invite/create?ledgerId=${ledgerId}`);
    },

    /**
     * Join a ledger by invite code
     * @param {String} code
     */
    joinByCode: (code) => {
        return post(`/api/invite/join?code=${code}`);
    },
}
