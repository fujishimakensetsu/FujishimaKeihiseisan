/**
 * レコード管理モジュール
 * アップロード・表示・編集・削除機能
 */

import { state, categoryIcons } from './config.js';
import { authFetch, showLoading, hideLoading } from './utils.js';

/**
 * ステータス取得
 */
export async function loadStatus() {
    try {
        const res = await authFetch('/api/status');
        const data = await res.json();
        state.allRecords = data.records.reverse();

        // サブスク情報を表示
        displaySubscriptionInfo(data.subscription);

        // LINE連携ステータスを確認
        checkLineStatus();

        // レコードを表示
        applyFilters();
    } catch (e) {
        console.error(e);
    }
}

/**
 * サブスク情報を表示
 */
function displaySubscriptionInfo(subscription) {
    const planNames = {
        'free': '無料プラン',
        'premium': 'プレミアムプラン',
        'enterprise': 'エンタープライズプラン',
        'unlimited': '無制限プラン'
    };

    const plan = subscription.plan || 'free';
    const planName = planNames[plan] || plan;
    const used = subscription.used || 0;
    const limit = subscription.limit || 10;
    const percentage = Math.min((used / limit) * 100, 100);

    let upgradeButton = '';
    if (plan === 'free') {
        upgradeButton = `
            <button onclick="alert('プランのアップグレードをご希望の場合は、管理者にお問い合わせください。')"
                    class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                プランをアップグレード
            </button>
        `;
    }

    document.getElementById('subscriptionInfo').innerHTML = `
        <div class="flex justify-between items-center">
            <div class="flex-1">
                <p class="text-sm text-slate-500">現在のプラン</p>
                <p class="text-2xl font-bold mb-2">${planName}</p>
                <p class="text-sm text-slate-600 mb-2">使用状況: ${used} / ${limit}件</p>
                <div class="w-full bg-slate-200 rounded-full h-3">
                    <div class="bg-blue-600 h-3 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                </div>
            </div>
            <div>
                ${upgradeButton}
            </div>
        </div>
    `;
}

/**
 * LINE連携ステータス確認
 */
async function checkLineStatus() {
    try {
        const res = await authFetch('/api/line-status');
        const data = await res.json();

        if (data.connected) {
            document.getElementById('lineConnected').classList.remove('hidden');
            document.getElementById('lineNotConnected').classList.add('hidden');
        } else {
            document.getElementById('lineConnected').classList.add('hidden');
            document.getElementById('lineNotConnected').classList.remove('hidden');
        }
    } catch (e) {
        console.error(e);
    }
}

/**
 * フィルター適用
 */
export function applyFilters() {
    const searchVendor = document.getElementById('searchVendor').value.toLowerCase();
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    const category = document.getElementById('filterCategory').value;

    let filtered = state.allRecords.filter(r => {
        if (searchVendor && !r.vendor_name.toLowerCase().includes(searchVendor)) {
            return false;
        }
        if (startDate && r.date < startDate) {
            return false;
        }
        if (endDate && r.date > endDate) {
            return false;
        }
        if (category && r.category !== category) {
            return false;
        }
        return true;
    });

    renderRecords(filtered);
}

/**
 * フィルタークリア
 */
export function clearFilters() {
    document.getElementById('searchVendor').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterCategory').value = '';
    renderRecords(state.allRecords);
}

/**
 * レコード表示
 */
export function renderRecords(records) {
    const list = document.getElementById('recordsList');
    list.innerHTML = records.map(r => {
        const displayUrl = (r.pdf_images && r.pdf_images.length > 0) ? r.pdf_images[0] : r.image_url;
        const allImages = (r.pdf_images && r.pdf_images.length > 0) ? r.pdf_images : [r.image_url];
        const categoryIcon = categoryIcons[r.category] || '📦';

        return `
        <div class="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
            <div class="flex gap-4 items-center">
                ${state.isBulkDeleteMode ? `
                    <input type="checkbox"
                           id="check-${r.id}"
                           ${state.selectedRecords.has(r.id) ? 'checked' : ''}
                           onchange="window.toggleRecordSelection('${r.id}')"
                           class="w-5 h-5 cursor-pointer">
                ` : ''}
                <div class="relative">
                    <img src="${displayUrl}"
                         class="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                         onclick='window.openImageModal(${JSON.stringify(allImages)})'
                         title="クリックで拡大表示">
                    ${r.is_pdf ? '<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">PDF</span>' : ''}
                </div>
                <div>
                    <p class="text-xs text-slate-400">${r.date}</p>
                    <p class="font-bold">${r.vendor_name}</p>
                    <p class="text-xs text-slate-500">${categoryIcon} ${r.category || 'その他'}</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <p class="text-xl font-black text-blue-600">¥${r.total_amount.toLocaleString()}</p>
                ${!state.isBulkDeleteMode ? `
                    <button onclick='window.openEditModal(${JSON.stringify(r)})'
                            class="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition"
                            title="編集">
                        ✏️
                    </button>
                    <button onclick="window.deleteRecord('${r.id}', '${r.vendor_name}')"
                            class="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition"
                            title="削除">
                        🗑️
                    </button>
                ` : ''}
            </div>
        </div>
    `}).join('');
}

/**
 * ファイルアップロード処理
 */
export async function uploadFiles(files) {
    if (!files || files.length === 0) return;

    showLoading(`${files.length}件のファイルをアップロード中...`, 'AI解析を実行しています');

    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append('files', file);
    });

    try {
        const res = await authFetch('/upload', {
            method: 'POST',
            body: formData
        });

        const contentType = res.headers.get('content-type');
        let responseData;

        if (contentType && contentType.includes('application/json')) {
            responseData = await res.json();
        } else {
            responseData = await res.text();
        }

        hideLoading();

        if (res.ok) {
            const summary = responseData.summary;
            alert(`✅ ${summary.success}件のファイルを処理しました\n${summary.errors > 0 ? `❌ ${summary.errors}件のエラー` : ''}`);
            await loadStatus();
        } else {
            alert(`アップロードに失敗しました: ${responseData.detail || '不明なエラー'}`);
        }
    } catch (e) {
        hideLoading();
        console.error(e);
        alert('アップロードエラーが発生しました');
    }
}

/**
 * レコード削除
 */
export async function deleteRecord(recordId, vendorName) {
    if (!confirm(`「${vendorName}」のレコードを削除しますか？\n※この操作は取り消せません`)) {
        return;
    }

    showLoading('削除中...', '');

    try {
        const res = await authFetch(`/api/records/${recordId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            await loadStatus();
            alert('削除しました');
        } else {
            const error = await res.json();
            alert(`削除に失敗しました: ${error.detail}`);
        }
    } catch (e) {
        console.error(e);
        alert('削除に失敗しました');
    } finally {
        hideLoading();
    }
}

/**
 * エクスポート機能
 */
export function exportCSV() {
    const token = sessionStorage.getItem('token');
    window.location.href = `/api/export/csv?token=${token}`;
}

export function exportExcel() {
    const token = sessionStorage.getItem('token');
    window.location.href = `/api/export/excel?token=${token}`;
}

export function exportPDF() {
    const token = sessionStorage.getItem('token');
    window.location.href = `/api/export/pdf?token=${token}`;
}
