// إدارة إعدادات التطبيق - بدون modal
const SettingsManager = {
    // تحميل الإعدادات المحفوظة
    loadSettings() {
        const defaultSettings = {
            calculationMethod: 'MWL',
            timeFormat: '24h',
            roundingMethod: 'nearest',
            showAsr: true,
            showIsha: true,
            theme: 'auto',
            muteSounds: false,
            adhanVolume: 0.7,
            notificationVolume: 0.5,
            latitude: 31.9539,
            longitude: 44.3736,
            cityName: 'النجف',
            // إعدادات الإشعارات
            fajrNotification: true,
            dhuhrNotification: true,
            asrNotification: true,
            maghribNotification: true,
            ishaNotification: true
        };

        try {
            const savedSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
            return { ...defaultSettings, ...savedSettings };
        } catch (error) {
            console.error('خطأ في تحميل الإعدادات:', error);
            return defaultSettings;
        }
    },

    // حفظ الإعدادات
    saveSettings(settings) {
        try {
            localStorage.setItem('prayerSettings', JSON.stringify(settings));
            this.applySettings(settings);
            return true;
        } catch (error) {
            console.error('خطأ في حفظ الإعدادات:', error);
            return false;
        }
    },

    // تحديث إعداد محدد
    updateSetting(key, value) {
        const settings = this.loadSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    },

    // تطبيق الإعدادات على الواجهة
    applySettings(settings) {
        // تطبيق المظهر
        this.applyTheme(settings.theme || 'auto');
        
        // تطبيق إعدادات الصوت
        if (typeof audioManager !== 'undefined') {
            audioManager.isMuted = settings.muteSounds || false;
            audioManager.adhan.volume = settings.adhanVolume || 0.7;
            audioManager.notification.volume = settings.notificationVolume || 0.5;
            
            // تحديث أيقونة الكتم
            const muteIcon = document.getElementById('mute-icon');
            if (muteIcon) {
                muteIcon.className = audioManager.isMuted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill';
            }
        }

        // تحديث موقع المدينة
        if (settings.cityName && settings.latitude && settings.longitude) {
            currentLocation.city = settings.cityName;
            currentLocation.latitude = settings.latitude;
            currentLocation.longitude = settings.longitude;
            
            const cityNameElement = document.getElementById('city-name');
            const coordinatesElement = document.getElementById('coordinates');
            
            if (cityNameElement) {
                cityNameElement.textContent = settings.cityName;
            }
            
            if (coordinatesElement) {
                coordinatesElement.textContent = `خط العرض: ${settings.latitude.toFixed(4)}°, خط الطول: ${settings.longitude.toFixed(4)}°`;
            }
        }

        // إعادة حساب أوقات الصلاة
        if (typeof calculateAndDisplayPrayerTimes === 'function') {
            calculateAndDisplayPrayerTimes();
        }
    },

    // تطبيق المظهر
    applyTheme(theme) {
        const body = document.body;
        const actualTheme = theme === 'auto' ? 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
        
        body.setAttribute('data-bs-theme', actualTheme);
        document.documentElement.setAttribute('data-theme', actualTheme);
        
        // تحديث أيقونة الثيم
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            if (theme === 'auto') {
                themeIcon.className = 'bi bi-circle-half';
            } else if (theme === 'light') {
                themeIcon.className = 'bi bi-sun-fill';
            } else {
                themeIcon.className = 'bi bi-moon-fill';
            }
        }
    }
};

// دالة لترحيل الإعدادات من النسخة القديمة إلى الجديدة
function migrateOldSettings() {
    const oldSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    
    if (oldSettings.selectedSound || oldSettings.appearance) {
        // دمج الإعدادات القديمة مع الجديدة
        const newSettings = {
            calculationMethod: oldSettings.calculationMethod || 'MWL',
            timeFormat: oldSettings.timeFormat || '24h',
            roundingMethod: oldSettings.roundingMethod || 'nearest',
            showAsr: oldSettings.showAsr !== undefined ? oldSettings.showAsr : true,
            showIsha: oldSettings.showIsha !== undefined ? oldSettings.showIsha : true,
            theme: oldSettings.appearance || 'auto',
            muteSounds: false,
            adhanVolume: (oldSettings.volumeLevel || 80) / 100,
            notificationVolume: 0.5,
            latitude: oldSettings.latitude || 31.9539,
            longitude: oldSettings.longitude || 44.3736,
            cityName: oldSettings.cityName || 'النجف'
        };

        // حفظ الإعدادات الجديدة
        localStorage.setItem('prayerSettings', JSON.stringify(newSettings));
        
        // تنظيف الإعدادات القديمة
        localStorage.removeItem('soundSettings');
        localStorage.removeItem('appearanceSettings');
    }
}

function loadSettings() {
    // ترحيل الإعدادات القديمة أولاً
    migrateOldSettings();
    
    // تحميل الإعدادات
    const settings = SettingsManager.loadSettings();
    
    // تطبيق الإعدادات
    SettingsManager.applySettings(settings);
    
    return settings;
}

// حفظ الإعدادات يدوياً
function saveSettings() {
    const settings = SettingsManager.loadSettings();
    
    // تحديث الإعدادات من عناصر التحكم في الواجهة
    const manualLocation = document.getElementById('manual-location');
    if (manualLocation && manualLocation.value.trim()) {
        settings.cityName = manualLocation.value.trim();
    }
    
    // حفظ الإعدادات
    if (SettingsManager.saveSettings(settings)) {
        showNotification('تم حفظ الإعدادات بنجاح');
        if (typeof audioManager !== 'undefined') {
            audioManager.playNotification();
        }
    } else {
        showError('حدث خطأ أثناء حفظ الإعدادات');
    }
}

// حفظ الموقع اليدوي
function saveManualLocation() {
    const manualLocation = document.getElementById('manual-location');
    const cityNameElement = document.getElementById('city-name');
    const coordinatesElement = document.getElementById('coordinates');
    
    if (!manualLocation) return;
    
    const city = manualLocation.value.trim();
    if (city) {
        const settings = SettingsManager.loadSettings();
        settings.cityName = city;
        settings.latitude = 31.9539; // قيمة افتراضية
        settings.longitude = 44.3736; // قيمة افتراضية
        
        if (SettingsManager.saveSettings(settings)) {
            if (cityNameElement) {
                cityNameElement.textContent = city;
            }
            
            if (coordinatesElement) {
                coordinatesElement.textContent = `خط العرض: ${settings.latitude.toFixed(4)}°, خط الطول: ${settings.longitude.toFixed(4)}°`;
            }

            showNotification('تم حفظ الموقع اليدوي بنجاح');
            if (typeof audioManager !== 'undefined') {
                audioManager.playNotification();
            }
        }
    } else {
        showError('يرجى إدخال اسم المدينة');
    }
}

// تبديل المظهر
function toggleTheme() {
    const settings = SettingsManager.loadSettings();
    const currentTheme = settings.theme || 'auto';
    let newTheme;
    
    if (currentTheme === 'auto') newTheme = 'light';
    else if (currentTheme === 'light') newTheme = 'dark';
    else newTheme = 'auto';
    
    SettingsManager.updateSetting('theme', newTheme);
    showNotification(`تم التبديل إلى المظهر: ${getThemeName(newTheme)}`);
}

// الحصول على اسم المظهر
function getThemeName(theme) {
    const themes = {
        'auto': 'حسب النظام',
        'light': 'فاتح',
        'dark': 'داكن'
    };
    return themes[theme] || theme;
}

// تبديل كتم الصوت
function toggleMute() {
    if (typeof audioManager !== 'undefined') {
        const isMuted = audioManager.toggleMute();
        SettingsManager.updateSetting('muteSounds', isMuted);
        showNotification(isMuted ? 'تم كتم الأصوات' : 'تم تشغيل الأصوات');
    }
}

// عرض لوحة الإعدادات المبسطة
function showSettingsPanel() {
    // إنشاء لوحة إعدادات عائمة بدلاً من modal
    const existingPanel = document.getElementById('floating-settings-panel');
    if (existingPanel) {
        existingPanel.remove();
        return;
    }

    const settings = SettingsManager.loadSettings();
    
    const panel = document.createElement('div');
    panel.id = 'floating-settings-panel';
    panel.className = 'floating-settings-panel';
    panel.innerHTML = `
        <div class="settings-header">
            <h5><i class="bi bi-gear-fill"></i> الإعدادات السريعة</h5>
            <button class="btn-close" onclick="this.closest('.floating-settings-panel').remove()"></button>
        </div>
        <div class="settings-body">
            <div class="setting-group">
                <label>المظهر:</label>
                <div class="btn-group w-100">
                    <button class="btn btn-outline-primary ${settings.theme === 'auto' ? 'active' : ''}" 
                            onclick="SettingsManager.updateSetting('theme', 'auto')">
                        <i class="bi bi-circle-half"></i> تلقائي
                    </button>
                    <button class="btn btn-outline-primary ${settings.theme === 'light' ? 'active' : ''}" 
                            onclick="SettingsManager.updateSetting('theme', 'light')">
                        <i class="bi bi-sun"></i> فاتح
                    </button>
                    <button class="btn btn-outline-primary ${settings.theme === 'dark' ? 'active' : ''}" 
                            onclick="SettingsManager.updateSetting('theme', 'dark')">
                        <i class="bi bi-moon"></i> داكن
                    </button>
                </div>
            </div>
            
            <div class="setting-group">
                <label>طريقة الحساب:</label>
                <select class="form-select" onchange="SettingsManager.updateSetting('calculationMethod', this.value)">
                    <option value="MWL" ${settings.calculationMethod === 'MWL' ? 'selected' : ''}>رابطة العالم الإسلامي</option>
                    <option value="ISNA" ${settings.calculationMethod === 'ISNA' ? 'selected' : ''}>الجمعية الإسلامية لأمريكا الشمالية</option>
                    <option value="Egypt" ${settings.calculationMethod === 'Egypt' ? 'selected' : ''}>هيئة المساحة المصرية</option>
                    <option value="Makkah" ${settings.calculationMethod === 'Makkah' ? 'selected' : ''}>أم القرى</option>
                    <option value="Karachi" ${settings.calculationMethod === 'Karachi' ? 'selected' : ''}>جامعة Karachi</option>
                    <option value="Tehran" ${settings.calculationMethod === 'Tehran' ? 'selected' : ''}>معهد الجيوفيزياء بجامعة طهران</option>
                </select>
            </div>
            
            <div class="setting-group">
                <label>تنسيق الوقت:</label>
                <div class="btn-group w-100">
                    <button class="btn btn-outline-primary ${settings.timeFormat === '24h' ? 'active' : ''}" 
                            onclick="SettingsManager.updateSetting('timeFormat', '24h')">24 ساعة</button>
                    <button class="btn btn-outline-primary ${settings.timeFormat === '12h' ? 'active' : ''}" 
                            onclick="SettingsManager.updateSetting('timeFormat', '12h')">12 ساعة</button>
                </div>
            </div>
            
            <div class="setting-group">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" ${settings.showAsr ? 'checked' : ''} 
                           onchange="SettingsManager.updateSetting('showAsr', this.checked)">
                    <label class="form-check-label">إظهار صلاة العصر</label>
                </div>
            </div>
            
            <div class="setting-group">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" ${settings.showIsha ? 'checked' : ''} 
                           onchange="SettingsManager.updateSetting('showIsha', this.checked)">
                    <label class="form-check-label">إظهار صلاة العشاء</label>
                </div>
            </div>
        </div>
        <div class="settings-footer">
            <button class="btn btn-primary w-100" onclick="saveSettings()">
                <i class="bi bi-check-lg"></i> حفظ الإعدادات
            </button>
        </div>
    `;

    document.body.appendChild(panel);

    // إضافة أنماط CSS للوحة العائمة
    if (!document.querySelector('#floating-settings-styles')) {
        const styles = document.createElement('style');
        styles.id = 'floating-settings-styles';
        styles.textContent = `
            .floating-settings-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-primary);
                border: 2px solid var(--border-color);
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 1050;
                width: 90%;
                max-width: 400px;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .settings-header {
                padding: 1rem;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: between;
                align-items: center;
            }
            
            .settings-body {
                padding: 1rem;
            }
            
            .settings-footer {
                padding: 1rem;
                border-top: 1px solid var(--border-color);
            }
            
            .setting-group {
                margin-bottom: 1rem;
            }
            
            .setting-group label {
                font-weight: 600;
                margin-bottom: 0.5rem;
                display: block;
            }
            
            .floating-settings-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 1040;
            }
        `;
        document.head.appendChild(styles);
    }
}

// تهيئة الإعدادات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    migrateOldSettings();
    loadSettings();
    
    // إضافة مستمع حدث لإغلاق لوحة الإعدادات عند النقر خارجها
    document.addEventListener('click', function(e) {
        const panel = document.getElementById('floating-settings-panel');
        if (panel && !panel.contains(e.target) && !e.target.closest('#settings-btn')) {
            panel.remove();
        }
    });
});

// دعم التوافق مع الإصدارات القديمة
window.selectSound = function(soundId) {
    console.log('تم استدعاء selectSound - هذه الوظيفة لم تعد مستخدمة في النسخة الجديدة');
};

window.selectAppearance = function(appearanceId) {
    SettingsManager.updateSetting('theme', appearanceId);
};

window.applyAppearance = function(appearance) {
    SettingsManager.applyTheme(appearance);
};

window.autoSaveSettings = function() {
    // هذه الوظيفة لم تعد مستخدمة في النسخة الجديدة
    console.log('الحفظ التلقائي يتم عبر SettingsManager');
};
