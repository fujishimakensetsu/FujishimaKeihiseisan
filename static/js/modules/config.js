/**
 * 設定モジュール
 * グローバル変数と定数を管理
 */

// グローバル変数
export let TOKEN = sessionStorage.getItem('token') || '';
export let USER_ROLE = sessionStorage.getItem('role') || 'user';

export function setToken(token) {
    TOKEN = token;
    sessionStorage.setItem('token', token);
}

export function setUserRole(role) {
    USER_ROLE = role;
    sessionStorage.setItem('role', role);
}

export function clearAuth() {
    TOKEN = '';
    USER_ROLE = 'user';
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
}

// 状態管理
export const state = {
    isBulkDeleteMode: false,
    selectedRecords: new Set(),
    selectedFiles: [],
    editingRecordId: null,
    allRecords: [],
    currentImageIndex: 0,
    currentImages: []
};

