// location-manager.js - إدارة المواقع (متوافق مع الصفحتين)

let savedLocations = [];

// تهيئة إدارة المواقع
function initLocationManager() {
    return new Promise((resolve) => {
        loadSavedLocations();
        setupLocationEventListeners();
        console.log('✅ تم تهيئة إدارة المواقع');
        resolve();
    });
}

// تحميل المواقع المحفوظة
function loadSavedLocations() {
    try {
        const locations = localStorage.getItem('savedLocations');
        if (locations) {
            savedLocations = JSON.parse(locations);
        } else {
            savedLocations = [];
        }
        console.log(`📁 تم تحميل ${savedLocations.length} موقع محفوظ`);
        return savedLocations;
    } catch (error) {
        console.error('❌ خطأ في تحميل المواقع المحفوظة:', error);
        savedLocations = [];
        return [];
    }
}

// حفظ المواقع
function saveLocations() {
    try {
        localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
        console.log('💾 تم حفظ المواقع');
        return true;
    } catch (error) {
        console.error('❌ خطأ في حفظ المواقع:', error);
        return false;
    }
}

// إعداد مستمعي الأحداث (لصفحة الإعدادات فقط)
function setupLocationEventListeners() {
    // هذه الأحداث مخصصة لصفحة الإعدادات فقط
    const saveLocationBtn = document.getElementById('save-current-location');
    const newLocationInput = document.getElementById('new-location-name');
    
    if (saveLocationBtn) {
        saveLocationBtn.addEventListener('click', handleSaveCurrentLocation);
        console.log('✅ تم إعداد حدث حفظ الموقع');
    } else {
        console.log('ℹ️ زر حفظ الموقع غير موجود في هذه الصفحة (هذا طبيعي في الصفحة الرئيسية)');
    }

    if (newLocationInput) {
        newLocationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSaveCurrentLocation();
            }
        });
    }

    // تحديث القائمة عند تغيير المواقع
    window.addEventListener('locationsUpdated', renderLocations);
}

// حفظ الموقع الحالي
function handleSaveCurrentLocation() {
    const locationNameInput = document.getElementById('new-location-name');
    let locationName = 'موقع محفوظ';

    if (locationNameInput && locationNameInput.value.trim()) {
        locationName = locationNameInput.value.trim();
    }

    try {
        // الحصول على الموقع الحالي من التطبيق الرئيسي
        const currentLocation = window.currentLocation || getDefaultLocation();
        
        if (!currentLocation.latitude || !currentLocation.longitude) {
            showError('❌ لا يوجد موقع حالي محدد');
            return;
        }

        const locationData = {
            name: locationName,
            city: currentLocation.city || 'غير معروف',
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude
        };

        const success = addLocation(locationData);
        
        if (success) {
            showNotification('✅ تم حفظ الموقع بنجاح');
            
            // مسح حقل الإدخال إذا كان موجوداً
            if (locationNameInput) {
                locationNameInput.value = '';
            }
            
            // إعادة تحميل القائمة
            renderLocations();
        } else {
            showError('❌ فشل في حفظ الموقع');
        }
    } catch (error) {
        console.error('❌ خطأ في حفظ الموقع:', error);
        showError('❌ حدث خطأ أثناء حفظ الموقع');
    }
}

// إضافة موقع جديد
function addLocation(locationData) {
    const newLocation = {
        id: Date.now().toString(),
        name: locationData.name || 'موقع جديد',
        city: locationData.city || 'غير معروف',
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timestamp: new Date().toISOString()
    };

    // منع التكرار
    const exists = savedLocations.some(loc => 
        loc.latitude === locationData.latitude && 
        loc.longitude === locationData.longitude
    );

    if (exists) {
        showError('⚠️ هذا الموقع موجود مسبقاً');
        return false;
    }

    savedLocations.unshift(newLocation);
    
    // حفظ فقط آخر 10 مواقع
    if (savedLocations.length > 10) {
        savedLocations = savedLocations.slice(0, 10);
    }
    
    const saved = saveLocations();
    if (saved) {
        window.dispatchEvent(new CustomEvent('locationsUpdated'));
    }
    
    return saved;
}

// حذف موقع
function deleteLocation(locationId) {
    const initialLength = savedLocations.length;
    savedLocations = savedLocations.filter(location => location.id !== locationId);
    
    if (savedLocations.length !== initialLength) {
        saveLocations();
        window.dispatchEvent(new CustomEvent('locationsUpdated'));
        return true;
    }
    return false;
}

// تبديل الموقع
function switchLocation(locationId) {
    const location = savedLocations.find(loc => loc.id === locationId);
    if (!location) {
        throw new Error('الموقع غير موجود');
    }

    // حفظ الموقع الجديد كموقع حالي
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    settings.latitude = location.latitude;
    settings.longitude = location.longitude;
    settings.cityName = location.city;
    localStorage.setItem('prayerSettings', JSON.stringify(settings));

    // إرسال حدث تغيير الموقع
    window.dispatchEvent(new CustomEvent('locationChanged', {
        detail: location
    }));

    return location;
}

// عرض المواقع (لصفحة الإعدادات فقط)
function renderLocations() {
    const container = document.getElementById('locations-container');
    if (!container) {
        // هذا طبيعي في الصفحة الرئيسية
        return;
    }

    const list = document.getElementById('locations-list');
    const noLocationsMsg = document.getElementById('no-locations-message');

    if (!list || !noLocationsMsg) {
        console.error('❌ عناصر عرض المواقع غير موجودة');
        return;
    }

    // مسح القائمة الحالية
    list.innerHTML = '';

    if (savedLocations.length === 0) {
        noLocationsMsg.style.display = 'block';
        list.style.display = 'none';
    } else {
        noLocationsMsg.style.display = 'none';
        list.style.display = 'block';

        savedLocations.forEach(location => {
            const locationElement = createLocationElement(location);
            list.appendChild(locationElement);
        });
    }
}

// إنشاء عنصر موقع (لصفحة الإعدادات)
function createLocationElement(location) {
    const div = document.createElement('div');
    div.className = 'list-group-item location-item d-flex justify-content-between align-items-center';
    div.innerHTML = `
        <div>
            <div class="fw-medium">${location.name}</div>
            <small class="text-muted">${location.city} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})</small>
        </div>
        <div>
            <button class="btn btn-sm btn-outline-primary switch-location-btn me-1" data-id="${location.id}" title="استخدام هذا الموقع">
                <i class="bi bi-geo-alt"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-location-btn" data-id="${location.id}" title="حذف الموقع">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    // إضافة مستمعي الأحداث
    const switchBtn = div.querySelector('.switch-location-btn');
    const deleteBtn = div.querySelector('.delete-location-btn');

    switchBtn.addEventListener('click', () => {
        try {
            switchLocation(location.id);
            showNotification(`📍 تم التبديل إلى موقع ${location.name}`);
            
            // إغلاق modal إذا كان مفتوحاً
            const modal = bootstrap.Modal.getInstance(document.getElementById('location-list-modal'));
            if (modal) {
                modal.hide();
            }
        } catch (error) {
            showError(`❌ ${error.message}`);
        }
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm(`هل تريد حذف موقع "${location.name}"؟`)) {
            const deleted = deleteLocation(location.id);
            if (deleted) {
                showNotification('🗑️ تم حذف الموقع بنجاح');
            } else {
                showError('❌ فشل في حذف الموقع');
            }
        }
    });

    return div;
}

// موقع افتراضي
function getDefaultLocation() {
    return {
        latitude: 31.9539,
        longitude: 44.3736,
        city: 'النجف'
    };
}

// الحصول على قائمة المواقع
function getSavedLocations() {
    return [...savedLocations];
}

// البحث عن موقع بالاسم
function findLocationByName(name) {
    return savedLocations.find(location => 
        location.name.toLowerCase().includes(name.toLowerCase()) ||
        location.city.toLowerCase().includes(name.toLowerCase())
    );
}

// فتح قائمة المواقع (لصفحة الإعدادات)
function openLocationList() {
    renderLocations();
    const modal = new bootstrap.Modal(document.getElementById('location-list-modal'));
    modal.show();
}

// ===== دعم الإشعارات =====
function showNotification(message) {
    // استخدام Toast إذا كان متاحاً، أو console كبديل
    const toast = document.getElementById('notification-toast');
    if (toast) {
        const toastInstance = new bootstrap.Toast(toast);
        toast.querySelector('.toast-body').textContent = message;
        toastInstance.show();
    } else {
        console.log(`💡 ${message}`);
    }
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        console.error(`❌ ${message}`);
    }
}

// تصدير الدوال للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initLocationManager,
        loadSavedLocations,
        addLocation,
        deleteLocation,
        saveCurrentLocation: handleSaveCurrentLocation,
        switchLocation,
        getSavedLocations,
        findLocationByName,
        renderLocations,
        openLocationList
    };
}
