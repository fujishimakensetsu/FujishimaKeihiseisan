/**
 * ユーティリティモジュール
 * API通信、ローディング表示など
 */

import { TOKEN } from './config.js';

/**
 * 認証付きFetch
 */
export async function authFetch(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${TOKEN}`,
        ...options.headers
    };
    return fetch(url, { ...options, headers });
}

/**
 * ローディング表示
 */
export function showLoading(message, subtext = 'しばらくお待ちください') {
    document.getElementById('loadingMessage').textContent = message;
    document.getElementById('loadingSubtext').textContent = subtext;
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

/**
 * ローディング非表示
 */
export function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

/**
 * モーダル関連
 */
export function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

export function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}
