// Security protection against DevTools and code inspection
// This makes it harder (but not impossible) to inspect the application

(function () {
    'use strict';

    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // Disable common keyboard shortcuts for DevTools
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            return false;
        }
    });

    // Detect DevTools opening
    let devtools = { isOpen: false };
    const element = new Image();

    Object.defineProperty(element, 'id', {
        get: function () {
            devtools.isOpen = true;
            // Clear localStorage and redirect
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    });

    setInterval(() => {
        devtools.isOpen = false;
        console.log(element);
        console.clear();

        if (devtools.isOpen) {
            // DevTools detected
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: #0a0118;
                    color: #ef4444;
                    font-family: monospace;
                    font-size: 24px;
                    text-align: center;
                    padding: 20px;
                ">
                    <div>
                        <h1>⚠️ Acceso Denegado</h1>
                        <p>Herramientas de desarrollador detectadas</p>
                        <p style="font-size: 14px; margin-top: 20px;">
                            Esta acción ha sido registrada
                        </p>
                    </div>
                </div>
            `;
        }
    }, 1000);

    // Detect window resize (common when opening DevTools)
    let windowSize = { width: window.innerWidth, height: window.innerHeight };

    window.addEventListener('resize', () => {
        const widthDiff = Math.abs(window.innerWidth - windowSize.width);
        const heightDiff = Math.abs(window.innerHeight - windowSize.height);

        // If window changed significantly (DevTools opened)
        if (widthDiff > 160 || heightDiff > 160) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }

        windowSize = { width: window.innerWidth, height: window.innerHeight };
    });

    // Prevent text selection
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    });

    // Prevent copying
    document.addEventListener('copy', (e) => {
        e.preventDefault();
        return false;
    });

    // Detect debugger
    setInterval(() => {
        const start = performance.now();
        debugger;
        const end = performance.now();

        if (end - start > 100) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    }, 1000);

    // Clear console periodically
    setInterval(() => {
        console.clear();
    }, 2000);

    // Override console methods
    const noop = () => { };
    ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'clear', 'count', 'countReset', 'assert', 'profile', 'profileEnd', 'time', 'timeLog', 'timeEnd', 'timeStamp', 'context', 'memory'].forEach(method => {
        if (console[method]) {
            console[method] = noop;
        }
    });

    console.log('%cSTOP!', 'color: red; font-size: 60px; font-weight: bold; text-shadow: 3px 3px 0 rgb(217,31,38), 6px 6px 0 rgb(226,91,14), 9px 9px 0 rgb(245,221,8), 12px 12px 0 rgb(5,148,68), 15px 15px 0 rgb(2,135,206), 18px 18px 0 rgb(4,77,145), 21px 21px 0 rgb(42,21,113)');
    console.log('%cEsto es una función del navegador destinada para desarrolladores.', 'font-size: 20px;');
    console.log('%cSi alguien te pidió copiar y pegar algo aquí, es un fraude.', 'font-size: 18px; color: red;');

})();
