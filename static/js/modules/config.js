/**
 * 設定モジュール
 * グローバル変数と定数を管理
 */

// グローバル変数
export let TOKEN = localStorage.getItem('token') || '';
export let USER_ROLE = localStorage.getItem('role') || 'user';

export function setToken(token) {
    TOKEN = token;
    localStorage.setItem('token', token);
}

export function setUserRole(role) {
    USER_ROLE = role;
    localStorage.setItem('role', role);
}

export function clearAuth() {
    TOKEN = '';
    USER_ROLE = 'user';
    localStorage.removeItem('token');
    localStorage.removeItem('role');
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

// カテゴリアイコン
export const categoryIcons = {
    '食費': '🍽️',
    '交通費': '🚃',
    '事務用品': '🏢',
    '光熱費': '💡',
    '通信費': '📱',
    '医療費': '🏥',
    '交際費': '🎉',
    'その他': '📦'
};
