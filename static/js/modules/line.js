/**
 * LINE連携モジュール
 */

import { authFetch } from './utils.js';

/**
 * LINEトークン生成
 */
export async function generateLineToken() {
    try {
        const res = await authFetch('/api/line-token');
        const data = await res.json();

        document.getElementById('lineToken').textContent = data.token;
        document.getElementById('lineTokenDisplay').classList.remove('hidden');
    } catch (e) {
        console.error(e);
        alert('トークンの生成に失敗しました');
    }
}

/**
 * トークンをコピー
 */
export function copyToken() {
    const token = document.getElementById('lineToken').textContent;
    navigator.clipboard.writeText(token);
    alert('トークンをコピーしました！');
}

/**
 * LINE連携解除
 */
export async function disconnectLine() {
    if (!confirm('LINE連携を解除しますか？')) return;

    try {
        const res = await authFetch('/api/line-disconnect', { method: 'POST' });
        if (res.ok) {
            alert('LINE連携を解除しました');
            // LINE連携ステータスを再確認
            window.location.reload();
        }
    } catch (e) {
        console.error(e);
        alert('連携解除に失敗しました');
    }
}
