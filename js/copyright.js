// تحديث سنة حقوق النشر تلقائياً في جميع الصفحات
(function() {
    'use strict';
    
    function updateCopyright() {
        const currentYear = new Date().getFullYear();
        const startYear = 2017;
        
        // تحديث جميع عناصر حقوق النشر
        document.querySelectorAll('footer small.text-muted, .copyright, [data-copyright]').forEach(el => {
            const content = el.innerHTML;
            
            // نمط 1: © 2017 Prayer Times
            if (content.includes('© 2017 Prayer Times')) {
                el.innerHTML = `© ${startYear}-${currentYear} Prayer Times - Developer AzkaMothol by praytime.js`;
            }
            // نمط 2: © 2017-2026 Prayer Times
            else if (content.includes('© 2017-')) {
                el.innerHTML = content.replace(/© 2017-\d{4}/, `© ${startYear}-${currentYear}`);
            }
        });
        
        // تحديث العناصر ذات ID محدد
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = currentYear;
        }
    }
    
    // تشغيل عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateCopyright);
    } else {
        updateCopyright();
    }
    
    // تحديث مرة واحدة كل ساعة (اختياري)
    setInterval(updateCopyright, 3600000);
})();