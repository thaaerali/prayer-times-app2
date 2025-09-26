// js/settings-page.js - JavaScript خاص بصفحة الإعدادات

// تعريف المتغيرات العالمية إذا لم تكن موجودة
function initializeGlobalVariables() {
    if (typeof currentLocation === 'undefined') {
        window.currentLocation = {
            latitude: 31.9539,
            longitude: 44.3736,
            city: 'النجف'
        };
        console.log('✅ تم تعريف currentLocation في صفحة الإعدادات');
    }
}

// تحديث معلومات الموقع الحالي في واجهة الإعدادات
function updateCurrentLocationInfo() {
    try {
        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
        const currentCity = document.getElementById('current-city');
        const currentCoords = document.getElementById('current-coords');

        if (currentCity) {
            currentCity.textContent = settings.cityName || 'النجف';
        }

        if (currentCoords) {
            currentCoords.textContent = `${settings.latitude || 31.9539}, ${settings.longitude || 44.3736}`;
        }
        
        console.log('✅ تم تحديث معلومات الموقع الحالي');
    } catch (error) {
        console.error('❌ خطأ في تحديث معلومات الموقع:', error);
    }
}

// تهيئة أحداث صفحة الإعدادات
function initSettingsPageEvents() {
    console.log('🔧 تهيئة أحداث صفحة الإعدادات...');

    // حدث حفظ الموقع اليدوي
    const saveManualBtn = document.getElementById('save-manual-location');
    if (saveManualBtn) {
        saveManualBtn.addEventListener('click', handleManualLocationSave);
    }

    // حدث تحديد الموقع التلقائي
    const locationBtn = document.getElementById('location-button');
    if (locationBtn) {
        locationBtn.addEventListener('click', handleAutoLocation);
    }

    // حدث فتح نافذة المواقع
    const openLocationsBtn = document.getElementById('open-locations-list');
    if (openLocationsBtn) {
        openLocationsBtn.addEventListener('click', handleOpenLocations);
    }

    // الحفظ التلقائي عند تغيير الإعدادات
    setupAutoSaveEvents();

    // تهيئة أحداث الصوت والمظهر
    initSoundAndAppearanceEvents();

    console.log('✅ تم تهيئة أحداث صفحة الإعدادات بنجاح');
}

// معالجة حفظ الموقع اليدوي
function handleManualLocationSave() {
    const manualLocation = document.getElementById('manual-location');
    const city = manualLocation ? manualLocation.value.trim() : '';

    if (city) {
        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
        settings.city = city;
        settings.cityName = city;
        localStorage.setItem('prayerSettings', JSON.stringify(settings));

        updateCurrentLocationInfo();
        showNotification('تم حفظ الموقع اليدوي بنجاح');
    } else {
        showError('يرجى إدخال اسم المدينة');
    }
}

// معالجة تحديد الموقع التلقائي
function handleAutoLocation() {
    if (typeof getCurrentLocation === 'function') {
        getCurrentLocation();
    } else {
        console.error('❌ دالة getCurrentLocation غير متاحة');
        showError('تعذر تحديد الموقع تلقائياً');
    }
}

// معالجة فتح نافذة المواقع
function handleOpenLocations() {
    if (typeof locationManager !== 'undefined' && locationManager.openLocationModal) {
        locationManager.openLocationModal();
    } else {
        console.error('❌ مدير المواقع غير متاح');
        showError('تعذر فتح قائمة المواقع');
    }
}

// إعداد أحداث الحفظ التلقائي
function setupAutoSaveEvents() {
    const autoSaveElements = [
        'calculation-method', 'time-format', 'rounding-method',
        'toggle-asr', 'toggle-isha', 'toggle-fajr-notification',
        'toggle-dhuhr-notification', 'toggle-asr-notification',
        'toggle-maghrib-notification', 'toggle-isha-notification',
        'toggle-fajr-adhan', 'toggle-dhuhr-adhan', 'toggle-asr-adhan',
        'toggle-maghrib-adhan', 'toggle-isha-adhan', 'volume-level'
    ];

    autoSaveElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', function() {
                if (typeof autoSaveSettings === 'function') {
                    autoSaveSettings();
                }
                updateCurrentLocationInfo();
            });
        }
    });
}

// تهيئة أحداث الصوت والمظهر
function initSoundAndAppearanceEvents() {
    if (typeof initSoundEvents === 'function') {
        console.log('🔊 تهيئة أحداث الصوت...');
        initSoundEvents();
    } else {
        console.error('❌ دالة initSoundEvents غير متاحة');
    }

    if (typeof initAppearanceEvents === 'function') {
        console.log('🎨 تهيئة أحداث المظهر...');
        initAppearanceEvents();
    } else {
        console.error('❌ دالة initAppearanceEvents غير متاحة');
    }
}

// تهيئة صفحة الإعدادات الرئيسية
function initSettingsPage() {
    console.log('🚀 بدء تهيئة صفحة الإعدادات...');
    
    // تهيئة المتغيرات العالمية
    initializeGlobalVariables();
    
    // تحميل الإعدادات
    if (typeof loadSettings === 'function') {
        loadSettings();
        console.log('✅ تم تحميل الإعدادات');
    } else {
        console.error('❌ دالة loadSettings غير متاحة');
    }
    
    // تحديث معلومات الموقع
    updateCurrentLocationInfo();
    
    // تهيئة الأحداث
    initSettingsPageEvents();
    
    console.log('✅ تم تهيئة صفحة الإعدادات بنجاح');
}

// التهيئة عند تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل DOM، بدء تهيئة صفحة الإعدادات...');
    initSettingsPage();
});

// جعل الدوال متاحة globally للاختبار
if (typeof window !== 'undefined') {
    window.initSettingsPage = initSettingsPage;
    window.updateCurrentLocationInfo = updateCurrentLocationInfo;
}