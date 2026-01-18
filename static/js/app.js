/**
 * SmartBuilder AI - メインアプリケーション
 * すべてのモジュールを統合
 */

// モジュールインポート
import { TOKEN, USER_ROLE, state } from './modules/config.js';
import * as auth from './modules/auth.js';
import * as records from './modules/records.js';
import * as line from './modules/line.js';
import { showLoading, hideLoading } from './modules/utils.js';

// グローバル関数として公開（HTMLから呼び出すため）
window.switchAuthTab = auth.switchAuthTab;
window.login = auth.login;
window.register = auth.register;
window.logout = auth.logout;
window.switchMainTab = auth.switchMainTab;
window.loadStatus = records.loadStatus;
window.applyFilters = records.applyFilters;
window.clearFilters = records.clearFilters;
window.deleteRecord = records.deleteRecord;
window.exportCSV = records.exportCSV;
window.exportExcel = records.exportExcel;
window.exportPDF = records.exportPDF;
window.generateLineToken = line.generateLineToken;
window.copyToken = line.copyToken;
window.disconnectLine = line.disconnectLine;

// ドラッグ&ドロップ処理
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // ファイル選択時
    fileInput.addEventListener('change', (e) => {
        records.uploadFiles(e.target.files);
        fileInput.value = ''; // リセット
    });

    // ドラッグオーバー
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    // ドラッグリーブ
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    // ドロップ
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        records.uploadFiles(e.dataTransfer.files);
    });

    // 初回ログイン状態チェック
    if (TOKEN) {
        document.getElementById('authOverlay').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');

        if (USER_ROLE === 'admin') {
            document.getElementById('adminTabs').classList.remove('hidden');
        }

        records.loadStatus();
    }
});

console.log('SmartBuilder AI - Application Loaded');
