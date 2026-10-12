// ==UserScript==
// @name         Video Mirror Flip (Websites)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Отзеркаливает видео на любых сайтах по нажатию Alt + M
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Слушаем нажатие клавиш на самом раннем этапе
    window.addEventListener('keydown', function(e) {
        // Проверяем комбинацию Alt + M (работает и при русской, и при английской раскладке)
        if (e.altKey && (e.key.toLowerCase() === 'm' || e.code === 'KeyM')) {

            // Находим абсолютно все видео-элементы на странице, включая скрытые в Shadow DOM (как у ВК)
            const videos = [];

            // 1. Обычный поиск по документу
            document.querySelectorAll('video').forEach(v => videos.push(v));

            // 2. Глубокий поиск в элементах интерфейса (Shadow Root)
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                if (el.shadowRoot) {
                    el.shadowRoot.querySelectorAll('video').forEach(v => videos.push(v));
                }
            });

            if (videos.length === 0) {
                console.log('Видео на странице не найдено');
                return;
            }

            // Отзеркаливаем каждое найденное видео
            videos.forEach(v => {
                const currentTransform = v.style.transform;
                if (currentTransform.includes('scaleX(-1)')) {
                    // Убираем инверсию
                    v.style.transform = currentTransform.replace('scaleX(-1)', '').trim();
                    showNotification('Видео возвращено в норму');
                } else {
                    // Включаем инверсию
                    v.style.transform = (currentTransform ? currentTransform + ' ' : '') + 'scaleX(-1)';
                    showNotification('Видео отзеркалено');
                }
            });

            // Предотвращаем стандартные действия браузера на эту комбинацию
            e.preventDefault();
            e.stopPropagation();
        }
    }, true); // Используем capture-фазу, чтобы перехватить нажатие до скриптов самого сайта

    // Функция для вывода красивого уведомления прямо на странице
    function showNotification(text) {
        let notif = document.getElementById('video-flip-notif');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'video-flip-notif';
            notif.style.cssText = 'position:fixed;top:20px;right:20px;background:rgba(0,0,0,0.85);color:#fff;padding:12px 24px;border-radius:8px;z-index:9999999;font-family:sans-serif;font-size:14px;transition:opacity 0.3s;pointer-events:none;';
            document.body.appendChild(notif);
        }
        notif.textContent = text;
        notif.style.opacity = '1';
        clearTimeout(notif.timer);
        notif.timer = setTimeout(() => {
            notif.style.opacity = '0';
        }, 2000);
    }
})();
