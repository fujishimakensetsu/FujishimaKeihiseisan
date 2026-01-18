/**
 * 認証モジュール
 * ログイン・登録・ログアウト機能
 */

import { setToken, setUserRole, clearAuth } from './config.js';
import { showLoading, hideLoading } from './utils.js';
import { loadStatus } from './records.js';

/**
 * 認証タブ切り替え
 */
export function switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (tab === 'login') {
        loginTab.classList.add('tab-active', 'bg-white');
        loginTab.classList.remove('bg-slate-100');
        registerTab.classList.remove('tab-active', 'bg-white');
        registerTab.classList.add('bg-slate-100');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        registerTab.classList.add('tab-active', 'bg-white');
        registerTab.classList.remove('bg-slate-100');
        loginTab.classList.remove('tab-active', 'bg-white');
        loginTab.classList.add('bg-slate-100');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

/**
 * ログイン
 */
export async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('メールアドレスとパスワードを入力してください');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        const res = await fetch('/login', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            setToken(data.access_token);
            setUserRole(data.role || 'user');

            document.getElementById('authOverlay').classList.add('hidden');
            document.getElementById('mainContent').classList.remove('hidden');

            // 管理者の場合、管理者タブを表示
            if (data.role === 'admin') {
                document.getElementById('adminTabs').classList.remove('hidden');
            }

            await loadStatus();
        } else {
            alert('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
        }
    } catch (e) {
        console.error(e);
        alert('ログインエラーが発生しました');
    }
}

/**
 * 新規登録
 */
export async function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    if (!email || !password || !passwordConfirm) {
        alert('全ての項目を入力してください');
        return;
    }

    if (password.length < 8) {
        alert('パスワードは8文字以上で入力してください');
        return;
    }

    if (password !== passwordConfirm) {
        alert('パスワードが一致しません');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        const res = await fetch('/register', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            setToken(data.access_token);
            setUserRole('user');

            alert('登録が完了しました！');

            document.getElementById('authOverlay').classList.add('hidden');
            document.getElementById('mainContent').classList.remove('hidden');

            await loadStatus();
        } else {
            const error = await res.json();
            alert(`登録に失敗しました: ${error.detail}`);
        }
    } catch (e) {
        console.error(e);
        alert('登録エラーが発生しました');
    }
}

/**
 * ログアウト
 */
export function logout() {
    clearAuth();
    document.getElementById('authOverlay').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
}

/**
 * メインタブ切り替え
 */
export function switchMainTab(tab) {
    const dashboardTab = document.getElementById('dashboardTab');
    const adminTab = document.getElementById('adminTab');
    const dashboardBtn = document.getElementById('dashboardTabBtn');
    const adminBtn = document.getElementById('adminTabBtn');

    if (tab === 'dashboard') {
        dashboardTab.classList.remove('hidden');
        adminTab.classList.add('hidden');
        dashboardBtn.classList.add('bg-white');
        dashboardBtn.classList.remove('bg-slate-100');
        adminBtn.classList.remove('bg-white');
        adminBtn.classList.add('bg-slate-100');
    } else {
        dashboardTab.classList.add('hidden');
        adminTab.classList.remove('hidden');
        dashboardBtn.classList.remove('bg-white');
        dashboardBtn.classList.add('bg-slate-100');
        adminBtn.classList.add('bg-white');
        adminBtn.classList.remove('bg-slate-100');
        // loadUsers(); // 管理者機能は別モジュールで実装
    }
}
