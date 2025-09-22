// دالة تطبيق المظهر
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('bg-light');
    } else if (theme === 'light') {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('bg-light');
    } else {
        // التلقائي - نتحقق من تفضيلات النظام
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('bg-light');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('bg-light');
        }
    }
    
    // حفظ التفضيل في localStorage
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    settings.appearance = theme;
    localStorage.setItem('prayerSettings', JSON.stringify(settings));
}

// تحميل التفضيل المحفوظ عند بدء التحميل
function loadTheme() {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const savedTheme = settings.appearance || 'light';
    applyTheme(savedTheme);
    return savedTheme;
}

// للاستماع لتغير تفضيلات النظام عند اختيار "تلقائي"
function watchSystemTheme() {
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', e => {
            const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
            if (settings.appearance === 'auto') {
                applyTheme('auto');
            }
        });
    }
}
