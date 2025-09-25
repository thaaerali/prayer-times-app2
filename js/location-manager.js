class LocationManager {
    constructor() {
        this.locations = this.loadLocations();
    }

    init() {
        this.bindEvents();
        this.renderLocations();
    }

    bindEvents() {
        // الانتظار حتى يكون DOM جاهزاً بالكامل
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
            });
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // فتح نافذة المواقع - التحقق من وجود العنصر أولاً
        const locationListButton = document.getElementById('location-list-button');
        if (locationListButton) {
            locationListButton.addEventListener('click', () => {
                this.openLocationModal();
            });
        } else {
            console.warn('زر قائمة المواقع غير موجود');
        }

        // حفظ الموقع الحالي - التحقق من وجود العنصر أولاً
        const saveLocationButton = document.getElementById('save-current-location');
        if (saveLocationButton) {
            saveLocationButton.addEventListener('click', () => {
                this.saveCurrentLocation();
            });
        } else {
            console.warn('زر حفظ الموقع غير موجود');
        }

        // السماح بالحفظ بالضغط على Enter
        const newLocationInput = document.getElementById('new-location-name');
        if (newLocationInput) {
            newLocationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveCurrentLocation();
                }
            });
        }
    }

    loadLocations() {
        try {
            const saved = localStorage.getItem('prayerLocations');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('خطأ في تحميل المواقع المحفوظة:', error);
            return [];
        }
    }

    saveLocations() {
        try {
            localStorage.setItem('prayerLocations', JSON.stringify(this.locations));
        } catch (error) {
            console.error('خطأ في حفظ المواقع:', error);
            this.showAlert('تعذر حفظ المواقع', 'error');
        }
    }

    openLocationModal() {
        if (!this.renderLocations()) {
            console.error('تعذر عرض قائمة المواقع');
            return;
        }
        
        const modalElement = document.getElementById('location-list-modal');
        if (!modalElement) {
            console.error('نافذة المواقع غير موجودة');
            return;
        }

        try {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } catch (error) {
            console.error('خطأ في فتح نافذة المواقع:', error);
            this.showAlert('تعذر فتح نافذة المواقع', 'error');
        }
    }

    async saveCurrentLocation() {
        const locationNameInput = document.getElementById('new-location-name');
        if (!locationNameInput) {
            this.showAlert('عنصر إدخال اسم الموقع غير موجود', 'error');
            return;
        }

        const locationName = locationNameInput.value.trim();
        
        if (!locationName) {
            this.showAlert('يرجى إدخال اسم الموقع', 'error');
            return;
        }

        // التحقق من عدم التكرار
        if (this.locations.some(loc => loc.name.toLowerCase() === locationName.toLowerCase())) {
            this.showAlert('هذا الاسم موجود مسبقاً', 'error');
            return;
        }

        try {
            const position = await this.getCurrentPosition();
            
            this.locations.push({
                name: locationName,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp: new Date().toISOString()
            });

            this.saveLocations();
            this.renderLocations();
            locationNameInput.value = '';
            this.showAlert('تم حفظ الموقع بنجاح!', 'success');

        } catch (error) {
            console.error('خطأ في حفظ الموقع:', error);
            this.showAlert('تعذر الحصول على الموقع الحالي: ' + error.message, 'error');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation غير مدعوم في هذا المتصفح'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            });
        });
    }

    renderLocations() {
        const container = document.getElementById('locations-list');
        const noLocationsMessage = document.getElementById('no-locations-message');
        
        if (!container) {
            console.error('حاوية قائمة المواقع غير موجودة');
            return false;
        }

        container.innerHTML = '';
        
        if (this.locations.length === 0) {
            if (noLocationsMessage) {
                noLocationsMessage.style.display = 'block';
            }
            return true;
        }

        if (noLocationsMessage) {
            noLocationsMessage.style.display = 'none';
        }

        try {
            this.locations.forEach((location, index) => {
                const locationElement = document.createElement('div');
                locationElement.className = 'list-group-item location-item';
                locationElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="location-name">${this.escapeHtml(location.name)}</div>
                            <div class="location-coords">
                                ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
                            </div>
                        </div>
                        <div class="location-actions">
                            <button class="btn btn-sm btn-primary btn-location select-location" 
                                    data-index="${index}">
                                اختيار
                            </button>
                            <button class="btn btn-sm btn-danger btn-location delete-location" 
                                    data-index="${index}">
                                حذف
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(locationElement);
            });

            // إضافة event listeners للأزرار
            container.querySelectorAll('.select-location').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
                    if (index && this.locations[index]) {
                        this.selectLocation(this.locations[index]);
                    }
                });
            });

            container.querySelectorAll('.delete-location').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
                    if (index && this.locations[index]) {
                        this.deleteLocation(parseInt(index));
                    }
                });
            });

            return true;
        } catch (error) {
            console.error('خطأ في عرض المواقع:', error);
            return false;
        }
    }

    selectLocation(location) {
        // إغلاق النافذة
        const modalElement = document.getElementById('location-list-modal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }

        // تحديث أوقات الصلاة للموقع المحدد
        if (typeof updatePrayerTimes === 'function') {
            updatePrayerTimes(location.lat, location.lng);
        }

        // تحديث اسم المدينة في الواجهة
        const cityNameElement = document.getElementById('city-name');
        const coordinatesElement = document.getElementById('coordinates');
        
        if (cityNameElement) {
            cityNameElement.textContent = location.name;
        }
        
        if (coordinatesElement) {
            coordinatesElement.textContent = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        }

        // تحديث currentLocation العالمي إذا كان موجوداً
        if (typeof currentLocation !== 'undefined') {
            currentLocation.latitude = location.lat;
            currentLocation.longitude = location.lng;
            currentLocation.city = location.name;
        }

        this.showAlert(`تم التبديل إلى ${location.name}`, 'success');
    }

    deleteLocation(index) {
        if (index < 0 || index >= this.locations.length) {
            this.showAlert('الموقع غير موجود', 'error');
            return;
        }

        const locationName = this.locations[index].name;
        
        if (confirm(`هل تريد حذف "${locationName}"؟`)) {
            this.locations.splice(index, 1);
            this.saveLocations();
            this.renderLocations();
            this.showAlert('تم حذف الموقع', 'success');
        }
    }

    showAlert(message, type) {
        // استخدام نظام الإشعارات الموجود في التطبيق
        if (typeof showNotification === 'function') {
            showNotification(message);
        } else if (typeof showError === 'function' && type === 'error') {
            showError(message);
        } else {
            // استخدام alert كبديل
            alert(message);
        }
    }

    // للحصول على الموقع الافتراضي أو الأخير
    getDefaultLocation() {
        if (this.locations.length > 0) {
            return this.locations[this.locations.length - 1];
        }
        return null;
    }

    // دالة مساعدة لمنع هجمات XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // دالة لإضافة موقع يدوياً
    addManualLocation(name, lat, lng) {
        if (!name || !lat || !lng) {
            this.showAlert('بيانات الموقع غير كاملة', 'error');
            return false;
        }

        // التحقق من عدم التكرار
        if (this.locations.some(loc => loc.name.toLowerCase() === name.toLowerCase())) {
            this.showAlert('هذا الاسم موجود مسبقاً', 'error');
            return false;
        }

        this.locations.push({
            name: name,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            timestamp: new Date().toISOString()
        });

        this.saveLocations();
        this.renderLocations();
        this.showAlert('تم إضافة الموقع بنجاح!', 'success');
        return true;
    }

    // دالة للحصول على جميع المواقع
    getAllLocations() {
        return [...this.locations];
    }

    // دالة للبحث عن موقع بالاسم
    findLocationByName(name) {
        return this.locations.find(loc => 
            loc.name.toLowerCase() === name.toLowerCase()
        );
    }
}

// تهيئة مدير المواقع
let locationManager;

function initLocationManager() {
    try {
        locationManager = new LocationManager();
        locationManager.init();
        
        // محاولة استخدام موقع محفوظ عند التحميل
        const defaultLocation = locationManager.getDefaultLocation();
        if (defaultLocation) {
            if (typeof updatePrayerTimes === 'function') {
                updatePrayerTimes(defaultLocation.lat, defaultLocation.lng);
            }

            const cityNameElement = document.getElementById('city-name');
            const coordinatesElement = document.getElementById('coordinates');
            
            if (cityNameElement) {
                cityNameElement.textContent = defaultLocation.name;
            }
            
            if (coordinatesElement) {
                coordinatesElement.textContent = `${defaultLocation.lat.toFixed(4)}, ${defaultLocation.lng.toFixed(4)}`;
            }

            // تحديث currentLocation العالمي
            if (typeof currentLocation !== 'undefined') {
                currentLocation.latitude = defaultLocation.lat;
                currentLocation.longitude = defaultLocation.lng;
                currentLocation.city = defaultLocation.name;
            }
        }
        
        console.log('مدير المواقع مهيأ بنجاح');
        return locationManager;
    } catch (error) {
        console.error('خطأ في تهيئة مدير المواقع:', error);
        return null;
    }
}

// التهيئة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocationManager);
} else {
    // الصفحة محملة بالفعل
    setTimeout(initLocationManager, 100);
}
