// التطبيق الرئيسي وتنسيق الأحداث
let currentLocation = {
  latitude: 31.9539, // قيمة افتراضية للنجف
  longitude: 44.3736, // قيمة افتراضية للنجف
  city: 'النجف'
};

function getCurrentLocation() {
  const cityNameElement = document.getElementById('city-name');
  const locationButton = document.getElementById('location-button');
  
  if (cityNameElement) {
    cityNameElement.textContent = "جاري تحديد موقعك...";
  }
  
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

        currentLocation.city = data.city || data.locality || data.principalSubdivision || "موقع غير معروف";
        
        const cityNameElement = document.getElementById('city-name');
        const coordinatesElement = document.getElementById('coordinates');
        
        if (cityNameElement) {
          cityNameElement.textContent = currentLocation.city;
        }
        
        if (coordinatesElement) {
          coordinatesElement.textContent = `خط العرض: ${lat.toFixed(4)}°, خط الطول: ${lng.toFixed(4)}°`;
        }

        updateLocationStatus('تم تحديد موقعك بنجاح');

        // حفظ الإعدادات مع الموقع الجديد
        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
        settings.latitude = lat;
        settings.longitude = lng;
        settings.cityName = currentLocation.city;
        localStorage.setItem('prayerSettings', JSON.stringify(settings));

        calculateAndDisplayPrayerTimes();
      } catch (error) {
        console.error('Error getting location name:', error);
        const cityNameElement = document.getElementById('city-name');
        const coordinatesElement = document.getElementById('coordinates');
        
        if (cityNameElement) {
          cityNameElement.textContent = `موقعك (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
        }
        
        if (coordinatesElement) {
          coordinatesElement.textContent = `خط العرض: ${lat.toFixed(4)}°, خط الطول: ${lng.toFixed(4)}°`;
        }
        
        updateLocationStatus('تم تحديد الموقع ولكن تعذر الحصول على اسم المدينة', true);
        calculateAndDisplayPrayerTimes();
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
      
      const locationButton = document.getElementById('location-button');
      if (locationButton) {
        locationButton.disabled = false;
        locationButton.innerHTML = '<i class="bi bi-geo-alt-fill"></i> تحديد موقعي تلقائياً';
      }

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

function saveManualLocation() {
  const manualLocation = document.getElementById('manual-location');
  const cityNameElement = document.getElementById('city-name');
  const coordinatesElement = document.getElementById('coordinates');
  
  if (!manualLocation) return;
  
  const city = manualLocation.value.trim();
  if (city) {
    currentLocation.city = city;
    // استخدام موقع افتراضي للمدينة
    currentLocation.latitude = 31.9539;
    currentLocation.longitude = 44.3736;

    if (cityNameElement) {
      cityNameElement.textContent = city;
    }
    
    if (coordinatesElement) {
      coordinatesElement.textContent = `خط العرض: ${currentLocation.latitude.toFixed(4)}°, خط الطول: ${currentLocation.longitude.toFixed(4)}°`;
    }

    // حفظ الإعدادات
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    settings.city = city;
    settings.latitude = currentLocation.latitude;
    settings.longitude = currentLocation.longitude;
    settings.cityName = city;
    localStorage.setItem('prayerSettings', JSON.stringify(settings));

    showNotification('تم حفظ الموقع اليدوي بنجاح');
    calculateAndDisplayPrayerTimes();
  } else {
    showError('يرجى إدخال اسم المدينة');
  }
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

    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
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
      { id: 'sunset', time: times.sunset, alwaysShow: true }, // إضافة الغروب
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
    { name: 'sunset', time: convertTimeToMinutes(times.sunset) }, // إضافة الغروب
    { name: 'maghrib', time: convertTimeToMinutes(times.maghrib) },
    { name: 'isha', time: convertTimeToMinutes(times.isha) }
  ].filter(prayer => prayer.time > 0); // تصفية الأوقات غير الصالحة

  if (prayerTimes.length === 0) return;

  // تحديد الصلاة الحالية
  let currentPrayer = null;
  for (let i = 0; i < prayerTimes.length - 1; i++) {
    if (currentTime >= prayerTimes[i].time && currentTime < prayerTimes[i + 1].time) {
      currentPrayer = prayerTimes[i].name;
      break;
    }
  }
  
  // إذا كان الوقت بعد العشاء وقبل الفجر، فإن الصلاة الحالية هي العشاء
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

// تهيئة التطبيق
function initApp() {
  console.log('تهيئة التطبيق...');
  
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
  loadSettings();
  
  // تحميل وتطبيق المظهر
  loadTheme();
  watchSystemTheme();

  // عرض التاريخ الحالي
  displayDate();

  // تعيين موقع افتراضي وعرض الأوقات مباشرة
  const cityNameElement = document.getElementById('city-name');
  const coordinatesElement = document.getElementById('coordinates');
  
  if (cityNameElement) {
    cityNameElement.textContent = currentLocation.city;
  }
  
  if (coordinatesElement) {
    coordinatesElement.textContent = `خط العرض: ${currentLocation.latitude.toFixed(4)}°, خط الطول: ${currentLocation.longitude.toFixed(4)}°`;
  }

  // حساب وعرض أوقات الصلاة مباشرة
  calculateAndDisplayPrayerTimes();

  // تحديث التاريخ كل دقيقة
  setInterval(displayDate, 60000);

  // تحديث أوقات الصلاة كل ساعة
  setInterval(calculateAndDisplayPrayerTimes, 3600000);
}

// أحداث النقر على الأزرار
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM محمّل');
  
  const settingsButton = document.getElementById('settings-button');
  const locationButton = document.getElementById('location-button');
  const saveManualLocationBtn = document.getElementById('save-manual-location');
  const saveSettingsButton = document.getElementById('save-settings');

  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      const settingsModal = new bootstrap.Modal(document.getElementById('settings-modal'));
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


