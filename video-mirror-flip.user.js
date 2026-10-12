// ==UserScript==
// @name         Video Mirror Flip (Websites)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Отзеркаливает видео на любых сайтах по нажатию Alt + M
// @author       aromihsoy
// @license      MIT
// @match        *://*/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/aromihsoy/video-mirror-flip/main/video-mirror-flip.user.js
// @updateURL    https://raw.githubusercontent.com/aromihsoy/video-mirror-flip/main/video-mirror-flip.user.js
// @name:en         Video Mirror Flip (Websites)
// @description:en  Mirror (flip) videos horizontally on any website with Alt + M
// ==/UserScript==

(function () {
    'use strict';

    // Общее состояние: отзеркалено или нет (одно на весь фрейм)
    let mirrored = false;

    // ---------- Поиск видео ----------

    // Рекурсивно собирает <video> из документа и всех открытых Shadow DOM
    function collectVideos(root, result) {
        root.querySelectorAll('video').forEach(v => result.push(v));
        root.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) collectVideos(el.shadowRoot, result);
        });
        return result;
    }

    function findVideos() {
        return collectVideos(document, []);
    }

    // ---------- Применение эффекта ----------

    // Используем свойство scale, а не transform: плееры часто сами
    // перезаписывают transform (зум, поворот), а scale им не мешает.
    function applyMirror(video) {
        if (mirrored) {
            video.style.setProperty('scale', '-1 1', 'important');
        } else {
            video.style.removeProperty('scale');
        }
    }

    // ---------- Уведомление ----------

    function getNotificationParent() {
        // В полноэкранном режиме видно только содержимое fullscreen-элемента
        let el = document.fullscreenElement;
        while (el && el.shadowRoot && el.shadowRoot.fullscreenElement) {
            el = el.shadowRoot.fullscreenElement;
        }
        // Внутрь самого <video> ничего не отрисуется
        if (el && el.tagName === 'VIDEO') return null;
        return el || document.body || document.documentElement;
    }

    function showNotification(text) {
        const parent = getNotificationParent();
        if (!parent) return;

        let notif = document.getElementById('video-flip-notif');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'video-flip-notif';
            notif.style.cssText =
                'position:fixed;top:20px;right:20px;background:rgba(0,0,0,0.85);color:#fff;' +
                'padding:12px 24px;border-radius:8px;z-index:2147483647;font-family:sans-serif;' +
                'font-size:14px;transition:opacity 0.3s;pointer-events:none;';
        }
        // Переносим в актуальный родитель (например, при входе в fullscreen)
        if (notif.parentNode !== parent) parent.appendChild(notif);

        notif.textContent = text;
        notif.style.opacity = '1';
        clearTimeout(notif._timer);
        notif._timer = setTimeout(() => {
            notif.style.opacity = '0';
        }, 2000);
    }

    // ---------- Новые видео на странице ----------

    // Если видео подгрузилось позже (следующая серия, смена плеера),
    // применяем текущее состояние и к нему.
    let pending = false;
    const observer = new MutationObserver(() => {
        if (!mirrored || pending) return;
        pending = true;
        setTimeout(() => {
            pending = false;
            findVideos().forEach(applyMirror);
        }, 300);
    });
    observer.observe(document, { childList: true, subtree: true });

    // ---------- Горячая клавиша ----------

    function isEditable(target) {
        if (!target || !target.tagName) return false;
        const tag = target.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    }

    window.addEventListener('keydown', function (e) {
        // Alt + M; e.code не зависит от раскладки (работает и с русской)
        if (e.code !== 'KeyM' || !e.altKey) return;
        // Без других модификаторов (AltGr на Windows = Ctrl+Alt) и не при удержании
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) return;
        // Не мешаем набору текста (на Mac Option+M вводит символ)
        if (isEditable(e.target)) return;

        const videos = findVideos();
        if (videos.length === 0) {
            // В этом фрейме видео нет: ничего не трогаем и не перехватываем клавишу
            return;
        }

        mirrored = !mirrored;
        videos.forEach(applyMirror);
        showNotification(mirrored ? 'Видео отзеркалено' : 'Видео возвращено в норму');

        // Capture-фаза: перехватываем до скриптов сайта
        e.preventDefault();
        e.stopPropagation();
    }, true);
})();
