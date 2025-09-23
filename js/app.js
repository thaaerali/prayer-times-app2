// التطبيق الرئيسي وتنسيق الأحداث

// تعريف currentLocation ككائن عام
let currentLocation = {
  latitude: 31.9539,
  longitude: 44.3736,
  city: "النجف"
};

function getCurrentLocation() {
  const cityNameElement = document.getElementById('city-name');
  const prayerTimesElement = document.getElementById('prayer-times');
  const locationButton = document.getElementById('location-button');
  
  if (cityNameElement) cityNameElement.textContent = "جاري تحديد موقعك...";
  if (prayerTimesElement) prayerTimesElement.innerHTML = "<div class='text-center py-4'>جاري تحديد موقعك...</div>";
  if (locationButton) {
    locationButton.disabled = true;
    locationButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري التحديد...';
  }
  
  updateLocationStatus('جاري الوصول إلى موقعك...');

  if (!navigator.geolocation) {
    updateLocationStatus('المتصفح لا يدعم خدمة تحديد الموقع', true);
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

      currentLocation.latitude = lat;
      currentLocation.longitude = lng;

      try {
        // الحصول على اسم المدينة من الإحداثيات
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`);
        const data = await response.json();

        currentLocation.city = data.city || data.locality || "موقع غير معروف";
        if (cityNameElement) cityNameElement.textContent = currentLocation.city;
        
        const coordinatesElement = document.getElementById('coordinates');
        if (coordinatesElement) coordinatesElement.textContent = `خط العرض: ${lat.toFixed(4)}°, خط الطول: ${lng.toFixed(4)}°`;

        updateLocationStatus('تم تحديد موقعك بنجاح');

        // حفظ الإعدادات مع الموقع الجديد
        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
        settings.latitude = lat;
        settings.longitude = lng;
        settings.cityName = currentLocation.city;
        localStorage.setItem('prayerSettings', JSON.stringify(settings));

        if (typeof calculateAndDisplayPrayerTimes === 'function') {
          calculateAndDisplayPrayerTimes();
        }
      } catch (error) {
        console.error('Error getting location name:', error);
        if (cityNameElement) cityNameElement.textContent = `موقعك (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
        
        const coordinatesElement = document.getElementById('coordinates');
        if (coordinatesElement) coordinatesElement.textContent = `خط العرض: ${lat.toFixed(4)}°, خط الطول: ${lng.toFixed(4)}°`;
        
        updateLocationStatus('تم تحديد الموقع ولكن تعذر الحصول على اسم المدينة', true);
        
        if (typeof calculateAndDisplayPrayerTimes === 'function') {
          calculateAndDisplayPrayerTimes();
        }
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

      updateLocationStatus(errorMessage, true);
      if (locationButton) {
        locationButton.disabled = false;
        locationButton.innerHTML = '<i class="bi bi-geo-alt-fill"></i> تحديد موقعي تلقائياً';
      }

      // استخدام موقع افتراضي في حالة الفشل
      if (!currentLocation.latitude || !currentLocation.longitude) {
        currentLocation.latitude = 31.9539;
        currentLocation.longitude = 44.3736;
        currentLocation.city = "النجف";
        const cityNameElement = document.getElementById('city-name');
        if (cityNameElement) cityNameElement.textContent = currentLocation.city;
        
        const coordinatesElement = document.getElementById('coordinates');
        if (coordinatesElement) coordinatesElement.textContent = `خط العرض: ${currentLocation.latitude.toFixed(4)}°, خط الطول: ${currentLocation.longitude.toFixed(4)}°`;
        
        if (typeof calculateAndDisplayPrayerTimes === 'function') {
          calculateAndDisplayPrayerTimes();
        }
      }
    },
    // خيارات إضافية
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

function saveManualLocation() {
  const manualLocation = document.getElementById('manual-location');
  const cityNameElement = document.getElementById('city-name');
  const coordinatesElement = document.getElementById('coordinates');
  
  if (!manualLocation) return;
  
  const city = manualLocation.value.trim();
  if (city) {
    currentLocation.city = city;
    // استخدام موقع افتراضي للمدينة (يمكن تحسينه باستخدام خدمة geocoding)
    currentLocation.latitude = 31.9539;
    currentLocation.longitude = 44.3736;

    if (cityNameElement) cityNameElement.textContent = city;
    if (coordinatesElement) coordinatesElement.textContent = `خط العرض: ${currentLocation.latitude.toFixed(4)}°, خط الطول: ${currentLocation.longitude.toFixed(4)}°`;

    // حفظ الإعدادات
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    settings.city = city;
    settings.latitude = currentLocation.latitude;
    settings.longitude = currentLocation.longitude;
    settings.cityName = city;
    localStorage.setItem('prayerSettings', JSON.stringify(settings));

    if (typeof showNotification === 'function') {
      showNotification('تم حفظ الموقع اليدوي بنجاح');
    }
    
    if (typeof calculateAndDisplayPrayerTimes === 'function') {
      calculateAndDisplayPrayerTimes();
    }
  } else {
    if (typeof showError === 'function') {
      showError('يرجى إدخال اسم المدينة');
    }
  }
}

// دالة مساعدة للاستخدام في location-manager
function updatePrayerTimes(lat, lng) {
    console.log('Updating prayer times for:', lat, lng);
    
    // تحديث الموقع الحالي
    currentLocation.latitude = lat;
    currentLocation.longitude = lng;
    
    // استدعاء دالة حساب أوقات الصلاة
    if (typeof calculateAndDisplayPrayerTimes === 'function') {
        calculateAndDisplayPrayerTimes();
    }
}

// دالة لعرض التاريخ
function displayDate() {
  const dateDisplay = document.getElementById('date-display');
  if (dateDisplay) {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    dateDisplay.textContent = now.toLocaleDateString('ar-SA', options);
  }
}

// تهيئة التطبيق
function initApp() {
  // التحقق من تحميل المكتبة أولاً
  if (typeof PrayTimes === 'undefined') {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = 'خطأ: لم يتم تحميل مكتبة PrayTimes بشكل صحيح. تأكد من وجود ملف praytimes.js في مجلد المشروع.';
      errorMessage.style.display = 'block';
    }
    return;
  }

  // تحميل الإعدادات المحفوظة
  if (typeof loadSettings === 'function') {
    loadSettings();
  }

  // تحميل وتطبيق المظهر
  if (typeof loadTheme === 'function') {
    loadTheme();
  }
  
  if (typeof watchSystemTheme === 'function') {
    watchSystemTheme();
  }

  // عرض التاريخ الحالي
  displayDate();

  // محاولة الحصول على الموقع الحالي
  getCurrentLocation();

  // تحديث التاريخ كل دقيقة
  setInterval(displayDate, 60000);

  // تحديث أوقات الصلاة كل ساعة
  setInterval(() => {
    if (typeof calculateAndDisplayPrayerTimes === 'function') {
      calculateAndDisplayPrayerTimes();
    }
  }, 3600000);

  // بدء مراقبة الإشعارات
  if (typeof startNotificationChecker === 'function') {
    startNotificationChecker();
  }
}

// أحداث النقر على الأزرار
document.addEventListener('DOMContentLoaded', function() {
  const settingsButton = document.getElementById('settings-button');
  const locationButton = document.getElementById('location-button');
  const saveManualLocationBtn = document.getElementById('save-manual-location');
  const settingsModalElement = document.getElementById('settings-modal');
  
  let settingsModal = null;
  if (settingsModalElement) {
    settingsModal = new bootstrap.Modal(settingsModalElement);
  }

  if (settingsButton && settingsModal) {
    settingsButton.addEventListener('click', () => {
      settingsModal.show();
    });
  }

  if (locationButton) {
    locationButton.addEventListener('click', getCurrentLocation);
  }

  if (saveManualLocationBtn) {
    saveManualLocationBtn.addEventListener('click', saveManualLocation);
  }

  // تهيئة التطبيق عند تحميل الصفحة
  initApp();
});
