// تهيئة إعدادات المظهر
function initAppearanceSettings() {
    const appearanceOptions = document.querySelectorAll('.appearance-option');
    
    appearanceOptions.forEach(option => {
        option.addEventListener('click', function() {
            // إزالة النشاط من جميع الخيارات
            appearanceOptions.forEach(opt => {
                opt.classList.remove('active');
            });
            
            // إضافة النشاط للخيار المحدد
            this.classList.add('active');
            
            const theme = this.getAttribute('data-theme');
            console.log('تم النقر على المظهر:', theme); // للتdebug
            
            // تطبيق المظهر فوراً
            applyTheme(theme);
            
            // حفظ الإعدادات كاملة
            saveSettings();
        });
    });
    // في نهاية js/settings.js
console.log('تم تحميل ملف settings.js');

    
    // تحميل الإعدادات المحفوظة وتحديد الخيار النشط
    loadAppearanceSettings();
}

// تحميل إعدادات المظهر المحفوظة
function loadAppearanceSettings() {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const savedTheme = settings.appearance || 'light';
    
    console.log('تحميل إعدادات المظهر:', savedTheme); // للتdebug
    
    // تفعيل الخيار المناسب
    const activeOption = document.querySelector(`.appearance-option[data-theme="${savedTheme}"]`);
    if (activeOption) {
        // إزالة النشاط من جميع الخيارات أولاً
        document.querySelectorAll('.appearance-option').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // ثم إضافة النشاط للخيار المحفوظ
        activeOption.classList.add('active');
    }
    
    // تطبيق المظهر المحفوظ
    applyTheme(savedTheme);
}

// دالة حفظ الإعدادات المعدلة
function saveSettings() {
    const selectedSound = document.querySelector('#adhan-sounds-list .sound-item.active')?.dataset.sound || 'abdul-basit';
    const selectedAppearance = document.querySelector('#appearance-list .appearance-option.active')?.dataset.appearance || 'light';
    
    const settings = {
        calculationMethod: document.getElementById('calculation-method')?.value || 'MWL',
        timeFormat: document.getElementById('time-format')?.value || '24h',
        roundingMethod: document.getElementById('rounding-method')?.value || 'nearest',
        city: document.getElementById('manual-location')?.value || '',
        latitude: currentLocation.latitude || 31.9539,
        longitude: currentLocation.longitude || 44.3736,
        cityName: currentLocation.city || 'النجف',
        showAsr: document.getElementById('toggle-asr')?.checked !== false,
        showIsha: document.getElementById('toggle-isha')?.checked !== false,
        // إعدادات الصوت
        selectedSound: selectedSound,
        playFajrAdhan: document.getElementById('toggle-fajr-adhan')?.checked !== false,
        playDhuhrAdhan: document.getElementById('toggle-dhuhr-adhan')?.checked !== false,
        playAsrAdhan: document.getElementById('toggle-asr-adhan')?.checked !== false,
        playMaghribAdhan: document.getElementById('toggle-maghrib-adhan')?.checked !== false,
        playIshaAdhan: document.getElementById('toggle-isha-adhan')?.checked !== false,
        volumeLevel: document.getElementById('volume-level')?.value || 80,
        // إعدادات المظهر
        appearance: selectedAppearance
    };
    
    console.log('حفظ الإعدادات:', settings); // للتdebug
    
    localStorage.setItem('prayerSettings', JSON.stringify(settings));
    showNotification('تم حفظ الإعدادات بنجاح');
}

// دالة تحميل الإعدادات
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    console.log('تحميل جميع الإعدادات:', settings); // للتdebug
    
    // تحميل إعدادات المظهر أولاً
    if (settings.appearance) {
        loadAppearanceSettings();
    }
    
    // تحميل باقي الإعدادات...
    if (settings.calculationMethod) {
        document.getElementById('calculation-method').value = settings.calculationMethod;
    }
    if (settings.timeFormat) {
        document.getElementById('time-format').value = settings.timeFormat;
    }
    if (settings.roundingMethod) {
        document.getElementById('rounding-method').value = settings.roundingMethod;
    }
    if (settings.city) {
        document.getElementById('manual-location').value = settings.city;
    }
    if (settings.latitude) {
        currentLocation.latitude = settings.latitude;
    }
    if (settings.longitude) {
        currentLocation.longitude = settings.longitude;
    }
    if (settings.cityName) {
        currentLocation.city = settings.cityName;
    }
    
    // الإعدادات الأخرى...
    document.getElementById('toggle-asr').checked = settings.showAsr !== undefined ? settings.showAsr : true;
    document.getElementById('toggle-isha').checked = settings.showIsha !== undefined ? settings.showIsha : true;
    
    // إعدادات الصوت
    if (settings.selectedSound) {
        selectSound(settings.selectedSound);
    }
    
    document.getElementById('toggle-fajr-adhan').checked = settings.playFajrAdhan !== undefined ? settings.playFajrAdhan : true;
    document.getElementById('toggle-dhuhr-adhan').checked = settings.playDhuhrAdhan !== undefined ? settings.playDhuhrAdhan : true;
    document.getElementById('toggle-asr-adhan').checked = settings.playAsrAdhan !== undefined ? settings.playAsrAdhan : true;
    document.getElementById('toggle-maghrib-adhan').checked = settings.playMaghribAdhan !== undefined ? settings.playMaghribAdhan : true;
    document.getElementById('toggle-isha-adhan').checked = settings.playIshaAdhan !== undefined ? settings.playIshaAdhan : true;
    
    document.getElementById('volume-level').value = settings.volumeLevel !== undefined ? settings.volumeLevel : 80;
    
    return settings;
}

// تهيئة أحداث المظهر
function initAppearanceEvents() {
    const appearanceItems = document.querySelectorAll('#appearance-list .sound-item');
    
    appearanceItems.forEach(item => {
        item.addEventListener('click', function() {
            // إزالة النشاط من جميع العناصر
            appearanceItems.forEach(el => el.classList.remove('active'));
            
            // إضافة النشاط للعنصر المحدد
            this.classList.add('active');
            
            // تطبيق المظهر
            const theme = this.getAttribute('data-appearance');
            applyTheme(theme);
            
            // حفظ الإعدادات
            saveSettings();
        });
    });
}

// وفي دالة تحميل الإعدادات، تأكد من تفعيل الخيار الصحيح
function loadAppearanceSettings() {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const savedTheme = settings.appearance || 'light';
    
    // تفعيل الخيار المناسب
    const activeItem = document.querySelector(`#appearance-list .sound-item[data-appearance="${savedTheme}"]`);
    if (activeItem) {
        document.querySelectorAll('#appearance-list .sound-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }
}

