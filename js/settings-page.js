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

// دالة تحديد الموقع لصفحة الإعدادات
function getCurrentLocationForSettings() {
    const locationButton = document.getElementById('location-button');
    const locationStatus = document.getElementById('location-status');
    
    if (locationButton) {
        locationButton.disabled = true;
        locationButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري التحديد...';
    }
    
    if (locationStatus) {
        locationStatus.textContent = 'جاري الوصول إلى موقعك...';
        locationStatus.className = 'small text-info';
    }

    if (!navigator.geolocation) {
        if (locationStatus) {
            locationStatus.textContent = 'المتصفح لا يدعم خدمة تحديد الموقع';
            locationStatus.className = 'small text-danger';
        }
        if (locationButton) {
            locationButton.disabled = false;
            locationButton.innerHTML = '<i class="bi bi-geo-alt-fill"></i> تحديد موقعي تلقائياً';
        }
        return;
    }

    navigator.geolocation.getCurrentPosition(
        // نجاح الحصول على الموقع
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // تحديث currentLocation العالمي
            if (typeof currentLocation !== 'undefined') {
                currentLocation.latitude = lat;
                currentLocation.longitude = lng;
            }

            try {
                // الحصول على اسم المدينة من الإحداثيات
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`);
                const data = await response.json();

                const cityName = data.city || data.locality || data.principalSubdivision || "موقع غير معروف";
                
                if (typeof currentLocation !== 'undefined') {
                    currentLocation.city = cityName;
                }

                if (locationStatus) {
                    locationStatus.textContent = 'تم تحديد موقعك بنجاح';
                    locationStatus.className = 'small text-success';
                }

                // حفظ الإعدادات مع الموقع الجديد
                const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
                settings.latitude = lat;
                settings.longitude = lng;
                settings.cityName = cityName;
                localStorage.setItem('prayerSettings', JSON.stringify(settings));

                // تحديث واجهة المستخدم
                updateCurrentLocationInfo();
                
                showNotification('تم تحديد موقعك بنجاح');

            } catch (error) {
                console.error('Error getting location name:', error);
                
                if (locationStatus) {
                    locationStatus.textContent = 'تم تحديد الموقع ولكن تعذر الحصول على اسم المدينة';
                    locationStatus.className = 'small text-warning';
                }
                
                // حفظ الإحداثيات بدون اسم المدينة
                const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
                settings.latitude = lat;
                settings.longitude = lng;
                settings.cityName = `موقعك (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
                localStorage.setItem('prayerSettings', JSON.stringify(settings));

                updateCurrentLocationInfo();
                showNotification('تم تحديد الموقع بنجاح');
            }

            if (locationButton) {
                locationButton.disabled = false;
                locationButton.innerHTML = '<i class="bi bi-geo-alt-fill"></i> تحديد موقعي تلقائياً';
            }
        },
        // فشل الحصول على الموقع
        (error) => {
            console.error('Error getting location:', error);
            let errorMessage = 'تعذر تحديد موقعك';

            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'تم رفض الإذن للوصول إلى الموقع';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'معلومات الموقع غير متاحة';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'انتهت مهلة طلب الموقع';
                    break;
            }

            if (locationStatus) {
                locationStatus.textContent = errorMessage;
                locationStatus.className = 'small text-danger';
            }
            
            if (locationButton) {
                locationButton.disabled = false;
                locationButton.innerHTML = '<i class="bi bi-geo-alt-fill"></i> تحديد موقعي تلقائياً';
            }

            showError(errorMessage);
        },
        // خيارات إضافية
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
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
            const lat = settings.latitude || 31.9539;
            const lng = settings.longitude || 44.3736;
            currentCoords.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
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

    console.log('✅ تم تهيئة أحداث صفحة الإعدادات بنجاح');
}

// معالجة حفظ الموقع اليدوي
function handleManualLocationSave() {
    const manualLocation = document.getElementById('manual-location');
    const city = manualLocation ? manualLocation.value.trim() : '';

    if (city) {
        // تحديث currentLocation العالمي
        if (typeof currentLocation !== 'undefined') {
            currentLocation.city = city;
            currentLocation.latitude = 31.9539;
            currentLocation.longitude = 44.3736;
        }

        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
        settings.city = city;
        settings.cityName = city;
        settings.latitude = 31.9539;
        settings.longitude = 44.3736;
        localStorage.setItem('prayerSettings', JSON.stringify(settings));

        updateCurrentLocationInfo();
        showNotification('تم حفظ الموقع اليدوي بنجاح');
        
        // إعادة تحميل الصفحة الرئيسية إذا كانت مفتوحة
        if (window.opener) {
            window.opener.location.reload();
        }
    } else {
        showError('يرجى إدخال اسم المدينة');
    }
}

// معالجة تحديد الموقع التلقائي
function handleAutoLocation() {
    // استخدام الدالة المحلية لصفحة الإعدادات
    getCurrentLocationForSettings();
}

// معالجة فتح نافذة المواقع
function handleOpenLocations() {
    if (typeof openLocationList === 'function') {
        openLocationList();
    } else {
        console.error('❌ دالة openLocationList غير متاحة');
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

// دالة لعرض الإشعارات في صفحة الإعدادات
function showNotification(message) {
    const notificationEl = document.getElementById('notification');
    if (notificationEl && typeof bootstrap !== 'undefined') {
        const toastBody = notificationEl.querySelector('.toast-body');
        if (toastBody) toastBody.textContent = message;
        
        const toast = new bootstrap.Toast(notificationEl);
        toast.show();
    } else {
        console.log('إشعار:', message);
    }
}

// دالة لعرض الأخطاء في صفحة الإعدادات
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        console.error('خطأ:', message);
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
    
    // تهيئة إدارة المواقع
    if (typeof initLocationManager === 'function') {
        initLocationManager().then(() => {
            console.log('✅ تم تهيئة إدارة المواقع في صفحة الإعدادات');
        });
    }
    
    console.log('✅ تم تهيئة صفحة الإعدادات بنجاح');
}

// التهيئة عند تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل DOM، بدء تهيئة صفحة الإعدادات...');
    initSettingsPage();
});

// جعل الدوال متاحة globally للاختبار
if (typeof window !== 'undefined') {
    window.getCurrentLocationForSettings = getCurrentLocationForSettings;
    window.handleAutoLocation = handleAutoLocation;
    window.handleManualLocationSave = handleManualLocationSave;
}
