// app.js - التطبيق الرئيسي وتنسيق الأحداث

let currentLocation = {
  latitude: 31.9539, // قيمة افتراضية للنجف
  longitude: 44.3736, // قيمة افتراضية للنجف
  city: 'النجف'
};

// تهيئة التطبيق
async function initApp() {
  console.log('🚀 بدء تهيئة التطبيق...');
  
  try {
    // التحقق من تحميل المكتبة أولاً
    if (typeof PrayTimes === 'undefined') {
      const errorMessage = document.getElementById('error-message');
      if (errorMessage) {
        errorMessage.textContent = 'خطأ: لم يتم تحميل مكتبة PrayTimes بشكل صحيح. تأكد من وجود ملف praytimes.js في مجلد المشروع.';
        errorMessage.style.display = 'block';
      }
      return;
    }

    // تهيئة إدارة الموقع
    await initLocationManager();
    
    // تهيئة إدارة الصوت
    initAudioManager();
    
    // تحميل الإعدادات المحفوظة
    loadStoredSettings();
    
    // تحميل وتطبيق المظهر
    loadTheme();
    watchSystemTheme();

    // عرض التاريخ الحالي
    displayDate();

    // تعيين موقع افتراضي وعرض الأوقات مباشرة
    const cityNameElement = document.getElementById('city-name');
    
    if (cityNameElement) {
      cityNameElement.textContent = currentLocation.city;
    }

    // حساب وعرض أوقات الصلاة مباشرة
    calculateAndDisplayPrayerTimes();

    // تحديث التاريخ كل دقيقة
    setInterval(displayDate, 60000);

    // تحديث أوقات الصلاة كل ساعة
    setInterval(calculateAndDisplayPrayerTimes, 3600000);

    console.log('✅ تم تهيئة التطبيق بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تهيئة التطبيق:', error);
    showError('حدث خطأ في تهيئة التطبيق');
  }
}

function getCurrentLocation() {
  const cityNameElement = document.getElementById('city-name');
  
  if (cityNameElement) {
    cityNameElement.textContent = "جاري تحديد موقعك...";
  }
  
  updateLocationStatus('جاري الوصول إلى موقعك...');

  if (!navigator.geolocation) {
    updateLocationStatus('المتصفح لا يدعم خدمة تحديد الموقع', true);
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

        currentLocation.city = data.city || data.locality || data.principalSubdivision || "موقع غير معروف";
        
        const cityNameElement = document.getElementById('city-name');
        
        if (cityNameElement) {
          cityNameElement.textContent = currentLocation.city;
        }

        updateLocationStatus('تم تحديد موقعك بنجاح');

        // حفظ الإعدادات مع الموقع الجديد
        const settings = getStoredSettings();
        settings.latitude = lat;
        settings.longitude = lng;
        settings.cityName = currentLocation.city;
        localStorage.setItem('prayerSettings', JSON.stringify(settings));

        calculateAndDisplayPrayerTimes();
      } catch (error) {
        console.error('Error getting location name:', error);
        const cityNameElement = document.getElementById('city-name');
        
        if (cityNameElement) {
          cityNameElement.textContent = `موقعك (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
        }
        
        updateLocationStatus('تم تحديد الموقع ولكن تعذر الحصول على اسم المدينة', true);
        calculateAndDisplayPrayerTimes();
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
      
      // استخدام موقع افتراضي في حالة الفشل
      calculateAndDisplayPrayerTimes();
    },
    // خيارات إضافية
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

function calculateAndDisplayPrayerTimes() {
  const prayerTimesContainer = document.getElementById('prayer-times');
  
  if (!prayerTimesContainer) {
    console.error('عنصر prayer-times غير موجود');
    return;
  }

  if (!currentLocation.latitude || !currentLocation.longitude) {
    prayerTimesContainer.innerHTML = '<div class="text-center py-4">يرجى تحديد موقعك أولاً</div>';
    return;
  }

  try {
    // التحقق من وجود مكتبة PrayTimes
    if (typeof PrayTimes === 'undefined') {
      prayerTimesContainer.innerHTML = '<div class="text-center py-4 text-danger">خطأ: مكتبة PrayTimes غير محملة</div>';
      return;
    }

    const settings = getStoredSettings();
    const calculationMethod = settings.calculationMethod || 'MWL';
    const timeFormat = settings.timeFormat || '24h';
    const roundingMethod = settings.roundingMethod || 'nearest';
    const showAsr = settings.showAsr !== undefined ? settings.showAsr : true;
    const showIsha = settings.showIsha !== undefined ? settings.showIsha : true;

    // استخدام دالة getPrayerTimes من prayer-calculator.js
    const date = new Date();
    const times = getPrayerTimes(currentLocation.latitude, currentLocation.longitude, date, calculationMethod);
    
    console.log('أوقات الصلاة المحسوبة:', times);

    // تحديث الأوقات في الواجهة
    const prayers = [
      { id: 'fajr', time: times.fajr, alwaysShow: true },
      { id: 'sunrise', time: times.sunrise, alwaysShow: true },
      { id: 'dhuhr', time: times.dhuhr, alwaysShow: true },
      { id: 'asr', time: times.asr, alwaysShow: showAsr },
      { id: 'sunset', time: times.sunset, alwaysShow: true },
      { id: 'maghrib', time: times.maghrib, alwaysShow: true },
      { id: 'isha', time: times.isha, alwaysShow: showIsha }
    ];

    // إخفاء/إظهار العناصر حسب الإعدادات
    prayers.forEach(prayer => {
      const element = document.querySelector(`.prayer-item[data-prayer="${prayer.id}"]`);
      if (element) {
        element.style.display = prayer.alwaysShow ? 'flex' : 'none';
        
        if (prayer.alwaysShow) {
          let formattedTime = applyRounding(prayer.time, roundingMethod);
          formattedTime = formatTime(formattedTime, timeFormat);
          
          const timeElement = document.getElementById(`${prayer.id}-time`);
          if (timeElement) {
            timeElement.textContent = formattedTime;
          }
        }
      }
    });

    // تحديد الصلاة الحالية
    highlightCurrentPrayer(times);

  } catch (error) {
    console.error('Error calculating prayer times:', error);
    prayerTimesContainer.innerHTML = '<div class="text-center py-4 text-danger">حدث خطأ في حساب أوقات الصلاة</div>';
  }
}

// دالة لتحديد الصلاة الحالية
function highlightCurrentPrayer(times) {
  // إزالة التحديد من جميع العناصر
  document.querySelectorAll('.prayer-item').forEach(item => {
    item.classList.remove('highlight');
  });

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // تحويل أوقات الصلاة إلى دقائق للمقارنة
  const prayerTimes = [
    { name: 'fajr', time: convertTimeToMinutes(times.fajr) },
    { name: 'sunrise', time: convertTimeToMinutes(times.sunrise) },
    { name: 'dhuhr', time: convertTimeToMinutes(times.dhuhr) },
    { name: 'asr', time: convertTimeToMinutes(times.asr) },
    { name: 'sunset', time: convertTimeToMinutes(times.sunset) },
    { name: 'maghrib', time: convertTimeToMinutes(times.maghrib) },
    { name: 'isha', time: convertTimeToMinutes(times.isha) }
  ].filter(prayer => prayer.time > 0);

  if (prayerTimes.length === 0) return;

  // تحديد الصلاة الحالية
  let currentPrayer = null;
  for (let i = 0; i < prayerTimes.length - 1; i++) {
    if (currentTime >= prayerTimes[i].time && currentTime < prayerTimes[i + 1].time) {
      currentPrayer = prayerTimes[i].name;
      break;
    }
  }
  
  // إذا كان الوقت بعد العشاء وقبل الفجر
  if (!currentPrayer && (currentTime >= prayerTimes[prayerTimes.length - 1].time || currentTime < prayerTimes[0].time)) {
    currentPrayer = prayerTimes[prayerTimes.length - 1].name;
  }

  // تطبيق التحديد
  if (currentPrayer) {
    const currentElement = document.querySelector(`.prayer-item[data-prayer="${currentPrayer}"]`);
    if (currentElement) {
      currentElement.classList.add('highlight');
    }
  }
}

// ===== الدوال المساعدة =====

// الحصول على الإعدادات المخزنة
function getStoredSettings() {
  const defaultSettings = {
    calculationMethod: 'MWL',
    timeFormat: '24h',
    roundingMethod: 'nearest',
    adhanSound: 'abdul-basit',
    volume: 50,
    appearance: 'auto',
    showAsr: true,
    showIsha: true
  };
  
  try {
    const stored = localStorage.getItem('prayerSettings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch (error) {
    console.error('خطأ في تحميل الإعدادات:', error);
    return defaultSettings;
  }
}

// تحميل الإعدادات المخزنة
function loadStoredSettings() {
  const settings = getStoredSettings();
  
  // تطبيق الإعدادات على التطبيق
  applyAppearanceSettings(settings);
  
  return settings;
}

// تطبيق إعدادات المظهر
function applyAppearanceSettings(settings) {
  const body = document.body;
  
  // إزالة جميع classes السابقة
  body.classList.remove('light-mode', 'dark-mode');
  
  // تطبيق المظهر الجديد
  if (settings.appearance === 'dark' || 
      (settings.appearance === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    body.classList.add('dark-mode');
  } else {
    body.classList.add('light-mode');
  }
}

// تحميل الثيم
function loadTheme() {
  const settings = getStoredSettings();
  applyAppearanceSettings(settings);
}

// مراقبة تغيير ثيم النظام
function watchSystemTheme() {
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const settings = getStoredSettings();
      if (settings.appearance === 'auto') {
        applyAppearanceSettings(settings);
      }
    });
  }
}

// عرض التاريخ
function displayDate() {
  const dateElement = document.getElementById('date-display');
  if (dateElement) {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    dateElement.textContent = now.toLocaleDateString('ar-SA', options);
  }
}

// تحديث حالة الموقع
function updateLocationStatus(message, isError = false) {
  const statusElement = document.getElementById('location-status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = isError ? 'mt-2 small text-danger' : 'mt-2 small text-success';
  }
}

// عرض إشعار
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

// عرض خطأ
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

// ===== تهيئة Service Worker =====
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(reg => console.log("Service Worker مسجل:", reg.scope))
    .catch(err => console.error("فشل تسجيل Service Worker:", err));
}

// ===== أحداث النقر على الأزرار =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM محمّل - بدء تهيئة التطبيق');
  
  const locationListButton = document.getElementById('location-list-button');
  
  // زر قائمة المواقع - توجيه إلى صفحة الإعدادات
  if (locationListButton) {
    locationListButton.addEventListener('click', function() {
      window.location.href = 'settings.html';
    });
  }

  // تهيئة التطبيق عند تحميل الصفحة
  initApp();
});

// ===== تصدير الدوال للاستخدام في ملفات أخرى =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCurrentLocation,
    calculateAndDisplayPrayerTimes,
    getStoredSettings,
    currentLocation
  };
}
