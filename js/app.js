// التطبيق الرئيسي وتنسيق الأحداث
let currentLocation = {
  latitude: 31.9539, // قيمة افتراضية للنجف
  longitude: 44.3736, // قيمة افتراضية للنجف
  city: 'النجف'
};

// إضافة متغير لإدارة صفحة نهج البلاغة
let nahjAlBalaghaInstance = null;

// متغير لتخزين ضبط التاريخ الهجري
let hijriDateAdjustment = 0;

// دالة للتنقل بين الصفحات
function togglePages(pageName = null) {
    const homePage = document.getElementById('home-page');
    const settingsPage = document.getElementById('settings-page');
    const nahjPage = document.getElementById('nahj-page');

    console.log('تبديل الصفحات إلى:', pageName || 'toggle');

    // إخفاء كل الصفحات أولاً
    if (homePage) homePage.classList.remove('active');
    if (settingsPage) settingsPage.classList.remove('active');
    if (nahjPage) nahjPage.classList.remove('active');

    if (pageName === 'settings' || (!pageName && homePage && homePage.classList.contains('active'))) {
        // الانتقال إلى صفحة الإعدادات
        if (settingsPage) {
            settingsPage.classList.add('active');
            console.log('تم التبديل إلى صفحة الإعدادات');

            // تهيئة أحداث الإعدادات
            setTimeout(() => {
                if (typeof initSettingsPageEvents === 'function') {
                    initSettingsPageEvents();
                }
                if (typeof loadSettings === 'function') {
                    loadSettings();
                }
                // تحميل ضبط التاريخ الهجري
                loadHijriAdjustment();
            }, 100);
        }
    } 
    else if (pageName === 'nahj') {
        // الانتقال إلى صفحة نهج البلاغة
        if (nahjPage) {
            nahjPage.classList.add('active');
            console.log('تم التبديل إلى صفحة نهج البلاغة');
            
            // تحميل محتوى نهج البلاغة إذا لم يكن محملاً
            if (nahjAlBalaghaInstance && typeof nahjAlBalaghaInstance.loadContent === 'function') {
                nahjAlBalaghaInstance.loadContent();
            }
        }
    }
    else {
        // الانتقال إلى الصفحة الرئيسية
        if (homePage) {
            homePage.classList.add('active');
            console.log('تم التبديل إلى الصفحة الرئيسية');

            // إعادة حساب الأوقات
            calculateAndDisplayPrayerTimes();
        }
    }
}

// دالة لعرض صفحة نهج البلاغة
function showNahjPage() {
    togglePages('nahj');
}

// دالة للعودة من صفحة نهج البلاغة
function backFromNahjPage() {
    togglePages('home');
}

// تهيئة التنقل
function initNavigation() {
    const settingsButton = document.querySelector('.settings-button');
    const nahjButton = document.getElementById('nahj-button');
    const nahjBackButton = document.getElementById('nahj-back-button');
    const settingsBackButton = document.getElementById('back-button');
    
    console.log('تهيئة التنقل...');
    
    // زر الإعدادات
    if (settingsButton) {
        // إزالة أي event listeners سابقة
        const newButton = settingsButton.cloneNode(true);
        settingsButton.parentNode.replaceChild(newButton, settingsButton);
        
        // إضافة الوظيفة الجديدة
        newButton.addEventListener('click', () => togglePages('settings'));
        console.log('تم تعيين وظيفة التنقل لزر الإعدادات');
    }
    
    // زر نهج البلاغة
    if (nahjButton) {
        nahjButton.addEventListener('click', showNahjPage);
        console.log('تم تعيين وظيفة التنقل لزر نهج البلاغة');
    }
    
    // زر العودة من صفحة نهج البلاغة
    if (nahjBackButton) {
        nahjBackButton.addEventListener('click', backFromNahjPage);
        console.log('تم تعيين وظيفة التنقل لزر العودة من نهج البلاغة');
    }
    
    // زر العودة من الإعدادات
    if (settingsBackButton) {
        settingsBackButton.addEventListener('click', () => togglePages('home'));
        console.log('تم تعيين وظيفة التنقل لزر العودة من الإعدادات');
    }
}

// دالة لضبط التاريخ الهجري
function adjustHijriDate(days) {
  // تحميل الضبط السابق من localStorage
  const savedAdjustment = localStorage.getItem('hijriDateAdjustment');
  hijriDateAdjustment = savedAdjustment ? parseInt(savedAdjustment) : 0;
  
  // تحديث الضبط
  hijriDateAdjustment += days;
  
  // حفظ في localStorage
  localStorage.setItem('hijriDateAdjustment', hijriDateAdjustment.toString());
  
  // تحديث الواجهة
  updateHijriAdjustmentDisplay();
  
  // إعادة عرض التاريخ مع الضبط الجديد
  displayDate();
  
  // عرض رسالة تأكيد
  const message = days > 0 
    ? `تمت زيادة التاريخ الهجري بمقدار ${days} يوم`
    : `تم تنقيص التاريخ الهجري بمقدار ${Math.abs(days)} يوم`;
  
  showNotification(message, 'info');
}

// دالة لإعادة ضبط التاريخ الهجري
function resetHijriAdjustment() {
  hijriDateAdjustment = 0;
  localStorage.removeItem('hijriDateAdjustment');
  
  updateHijriAdjustmentDisplay();
  displayDate();
  
  showNotification('تمت إعادة ضبط التاريخ الهجري', 'success');
}

// دالة لتحديث عرض حالة الضبط
function updateHijriAdjustmentDisplay() {
  const statusElement = document.getElementById('current-adjustment');
  if (statusElement) {
    statusElement.textContent = hijriDateAdjustment;
    
    // تغيير اللون حسب القيمة
    if (hijriDateAdjustment > 0) {
      statusElement.className = 'text-success fw-bold';
    } else if (hijriDateAdjustment < 0) {
      statusElement.className = 'text-danger fw-bold';
    } else {
      statusElement.className = 'text-muted';
    }
  }
}

// دالة لتحميل ضبط التاريخ الهجري عند بدء التطبيق
function loadHijriAdjustment() {
  const savedAdjustment = localStorage.getItem('hijriDateAdjustment');
  if (savedAdjustment !== null) {
    hijriDateAdjustment = parseInt(savedAdjustment);
    updateHijriAdjustmentDisplay();
    console.log('تم تحميل ضبط التاريخ الهجري:', hijriDateAdjustment);
  }
}

// دالة محسنة لعرض التاريخ مع مراعاة الضبط
function displayDate() {
  try {
    const now = new Date();
    
    // التاريخ الميلادي
    const gregorianOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Baghdad'
    };
    const gregorianDate = now.toLocaleDateString('ar-IQ', gregorianOptions);
    
    // التاريخ الهجري - مع مراعاة الضبط
    let hijriDate;
    try {
      // إنشاء تاريخ جديد مع الضبط
      const adjustedDate = new Date(now);
      adjustedDate.setDate(adjustedDate.getDate() + (hijriDateAdjustment || 0));
      
      const hijriOptions = {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        calendar: 'islamic',
        timeZone: 'Asia/Baghdad'
      };
      hijriDate = adjustedDate.toLocaleDateString('ar-IQ', hijriOptions);
      
      // إضافة مؤشر الضبط إذا كان هناك ضبط
      if (hijriDateAdjustment !== 0) {
        const adjustmentSign = hijriDateAdjustment > 0 ? '+' : '';
        hijriDate += ` (مضبوط ${adjustmentSign}${hijriDateAdjustment})`;
      }
    } catch (error) {
      // إذا فشل استخدام التقويم الهجري، استخدم حساب تقريبي
      hijriDate = calculateHijriDate(now);
    }
    
    console.log('التاريخ الميلادي:', gregorianDate);
    console.log('التاريخ الهجري:', hijriDate);
    console.log('ضبط التاريخ:', hijriDateAdjustment);
    
    // تحديث العناصر في الصفحة
    const gregorianElement = document.getElementById('gregorian-date');
    const hijriElement = document.getElementById('hijri-date');
    
    if (gregorianElement) {
      gregorianElement.textContent = gregorianDate;
      console.log('تم تحديث الميلادي');
    } else {
      console.error('عنصر gregorian-date غير موجود');
    }
    
    if (hijriElement) {
      hijriElement.textContent = hijriDate;
      console.log('تم تحديث الهجري');
    } else {
      console.error('عنصر hijri-date غير موجود');
    }
    
  } catch (error) {
    console.error('خطأ في عرض التاريخ:', error);
  }
}

// دالة محسنة لحساب التاريخ الهجري تقريبياً مع الضبط
function calculateHijriDate(gregorianDate) {
  const hijriMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 
    'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  
  // تطبيق الضبط على التاريخ
  const adjustedDate = new Date(gregorianDate);
  adjustedDate.setDate(adjustedDate.getDate() + (hijriDateAdjustment || 0));
  
  // هذا حساب تقريبي (ليس دقيقاً تماماً)
  const hijriYear = 1446; // سنة هجرية تقريبية
  const monthIndex = adjustedDate.getMonth();
  const day = adjustedDate.getDate();
  
  let result = `${day} ${hijriMonths[monthIndex]} ${hijriYear} هـ`;
  
  // إضافة مؤشر الضبط إذا كان هناك ضبط
  if (hijriDateAdjustment !== 0) {
    const adjustmentSign = hijriDateAdjustment > 0 ? '+' : '';
    result += ` (مضبوط ${adjustmentSign}${hijriDateAdjustment})`;
  }
  
  return result;
}

// دالة لتحديث حالة الموقع
function updateLocationStatus(message, isError = false) {
    const statusElement = document.getElementById('location-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `location-status ${isError ? 'text-danger' : 'text-success'}`;
    }
}

// دالة لعرض الإشعارات
function showNotification(message, type = 'success') {
    // تنفيذ بسيط للإشعارات - يمكن تطويره لاحقاً
    console.log(`${type}: ${message}`);
    alert(message); // تنفيذ مؤقت
}

// دالة لعرض الأخطاء
function showError(message) {
    showNotification(message, 'error');
}

// دالة للحصول على الموقع الحالي
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
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      currentLocation.latitude = lat;
      currentLocation.longitude = lng;

      try {
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

        // حفظ الإعدادات
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

      calculateAndDisplayPrayerTimes();
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

// دالة لحفظ الموقع اليدوي
function saveManualLocation() {
  const manualLocation = document.getElementById('manual-location');
  const cityNameElement = document.getElementById('city-name');
  const coordinatesElement = document.getElementById('coordinates');
  
  if (!manualLocation) return;
  
  const city = manualLocation.value.trim();
  if (city) {
    currentLocation.city = city;
    currentLocation.latitude = 31.9539;
    currentLocation.longitude = 44.3736;

    if (cityNameElement) {
      cityNameElement.textContent = city;
    }
    
    if (coordinatesElement) {
      coordinatesElement.textContent = `خط العرض: ${currentLocation.latitude.toFixed(4)}°, خط الطول: ${currentLocation.longitude.toFixed(4)}°`;
    }

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

// دالة لتحويل الوقت إلى دقائق
function convertTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

// دالة لتنسيق الوقت
function formatTime(time, format) {
  if (format === '12h') {
    let [hours, minutes] = time.split(':').map(Number);
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${modifier}`;
  }
  return time;
}

// دالة لحساب وعرض أوقات الصلاة
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
    if (typeof PrayTimes === 'undefined') {
      prayerTimesContainer.innerHTML = '<div class="text-center py-4 text-danger">خطأ: مكتبة PrayTimes غير محملة</div>';
      return;
    }

    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const calculationMethod = settings.calculationMethod || 'MWL';
    const timeFormat = settings.timeFormat || '24h';
    const showImsak = settings.showImsak !== undefined ? settings.showImsak : true;
    const showAsr = settings.showAsr !== undefined ? settings.showAsr : true;
    const showIsha = settings.showIsha !== undefined ? settings.showIsha : true;
    const showMidnight = settings.showMidnight !== undefined ? settings.showMidnight : true;

    const date = new Date();
    const times = getPrayerTimes(currentLocation.latitude, currentLocation.longitude, date, calculationMethod);
    
    console.log('أوقات الصلاة المحسوبة:', times);

    const prayers = [
      { id: 'imsak', time: times.imsak, alwaysShow: showImsak },
      { id: 'fajr', time: times.fajr, alwaysShow: true },
      { id: 'sunrise', time: times.sunrise, alwaysShow: true },
      { id: 'dhuhr', time: times.dhuhr, alwaysShow: true },
      { id: 'asr', time: times.asr, alwaysShow: showAsr },
      { id: 'sunset', time: times.sunset, alwaysShow: true },
      { id: 'maghrib', time: times.maghrib, alwaysShow: true },
      { id: 'isha', time: times.isha, alwaysShow: showIsha },
      { id: 'midnight', time: times.midnight, alwaysShow: showMidnight }
    ];

    prayers.forEach(prayer => {
      const element = document.querySelector(`.prayer-item[data-prayer="${prayer.id}"]`);
      if (element) {
        element.style.display = prayer.alwaysShow ? 'flex' : 'none';
        
        if (prayer.alwaysShow) {
          let formattedTime = formatTime(prayer.time, timeFormat);
          
          const timeElement = document.getElementById(`${prayer.id}-time`);
          if (timeElement) {
            timeElement.textContent = formattedTime;
          }
        }
      }
    });

    highlightCurrentPrayer(times);

  } catch (error) {
    console.error('Error calculating prayer times:', error);
    prayerTimesContainer.innerHTML = '<div class="text-center py-4 text-danger">حدث خطأ في حساب أوقات الصلاة</div>';
  }
}

// دالة لتحديد الصلاة الحالية
function highlightCurrentPrayer(times) {
  document.querySelectorAll('.prayer-item').forEach(item => {
    item.classList.remove('highlight');
  });

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const prayerTimes = [
    { name: 'imsak', time: convertTimeToMinutes(times.imsak) },
    { name: 'fajr', time: convertTimeToMinutes(times.fajr) },
    { name: 'sunrise', time: convertTimeToMinutes(times.sunrise) },
    { name: 'dhuhr', time: convertTimeToMinutes(times.dhuhr) },
    { name: 'asr', time: convertTimeToMinutes(times.asr) },
    { name: 'sunset', time: convertTimeToMinutes(times.sunset) },
    { name: 'maghrib', time: convertTimeToMinutes(times.maghrib) },
    { name: 'isha', time: convertTimeToMinutes(times.isha) },
    { name: 'midnight', time: convertTimeToMinutes(times.midnight) }
  ].filter(prayer => prayer.time > 0);

  if (prayerTimes.length === 0) return;

  let currentPrayer = null;
  for (let i = 0; i < prayerTimes.length - 1; i++) {
    if (currentTime >= prayerTimes[i].time && currentTime < prayerTimes[i + 1].time) {
      currentPrayer = prayerTimes[i].name;
      break;
    }
  }
  
  if (!currentPrayer && (currentTime >= prayerTimes[prayerTimes.length - 1].time || currentTime < prayerTimes[0].time)) {
    currentPrayer = prayerTimes[prayerTimes.length - 1].name;
  }

  if (currentPrayer) {
    const currentElement = document.querySelector(`.prayer-item[data-prayer="${currentPrayer}"]`);
    if (currentElement) {
      currentElement.classList.add('highlight');
    }
  }
}

// دالة لتحميل المظهر
function loadTheme() {
  const appearanceSettings = JSON.parse(localStorage.getItem('appearanceSettings')) || {};
  const appearance = appearanceSettings.appearance || 'auto';
  applyAppearance(appearance);
}

// دالة لمراقبة تغيير مظهر النظام
function watchSystemTheme() {
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const appearanceSettings = JSON.parse(localStorage.getItem('appearanceSettings')) || {};
      if (appearanceSettings.appearance === 'auto') {
        applyAppearance('auto');
      }
    });
  }
}

// دالة لتطبيق المظهر
function applyAppearance(appearance) {
  let darkMode = false;

  if (appearance === 'dark') {
    darkMode = true;
  } else if (appearance === 'auto') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      darkMode = true;
    }
  }

  if (darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// دالة لتشغيل صوت الأذان
function playAdhanSound(soundId) {
  const soundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {};
  const volumeLevel = soundSettings.volumeLevel || 80;
  
  try {
    const audio = new Audio(`sounds/${soundId}.mp3`);
    audio.volume = volumeLevel / 100;
    audio.play().catch(error => {
      console.error('خطأ في تشغيل الصوت:', error);
      showNotification('تعذر تشغيل صوت الأذان', 'error');
    });
  } catch (error) {
    console.error('خطأ في تحميل الصوت:', error);
    showNotification('تعذر تحميل صوت الأذان', 'error');
  }
}

// تهيئة نهج البلاغة
function initNahjAlBalagha() {
  // تحقق من وجود الصفحة أولاً
  const nahjPage = document.getElementById('nahj-page');
  if (!nahjPage) {
    console.warn('صفحة نهج البلاغة غير موجودة');
    return;
  }
  
  // تأكد من أن الصفحة غير نشطة عند البدء
  nahjPage.classList.remove('active');
  
  console.log('تهيئة نهج البلاغة...');
  
  // يمكنك هنا تهيئة أي دوال إضافية لنهج البلاغة
  // أو تحميل البيانات من GitHub
}

// تهيئة التطبيق
function initApp() {
  console.log('تهيئة التطبيق...');
  
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
  
  // تحميل ضبط التاريخ الهجري
  loadHijriAdjustment();
  
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

  // تهيئة نظام التنقل
  initNavigation();
  
  // تهيئة نهج البلاغة
  initNahjAlBalagha();

  // حساب وعرض أوقات الصلاة مباشرة
  calculateAndDisplayPrayerTimes();

  // تحديث التاريخ كل دقيقة
  setInterval(displayDate, 60000);

  // تحديث أوقات الصلاة كل ساعة
  setInterval(calculateAndDisplayPrayerTimes, 3600000);
}

// دالة لتحديث الصفحة الرئيسية عند تغيير الإعدادات
function updateHomePageFromSettings() {
  console.log('تحديث الصفحة الرئيسية من الإعدادات...');
  
  // تحديث المظهر
  loadTheme();
  // عرض التاريخ الحالي
  displayDate();
  // تحديث أوقات الصلاة
  calculateAndDisplayPrayerTimes();
  
  // تحديث اسم المدينة
  const cityNameElement = document.getElementById('city-name');
  if (cityNameElement && currentLocation.city) {
    cityNameElement.textContent = currentLocation.city;
  }
}

// إضافة event listeners عند تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM محمّل');
  
  // إضافة event listener لزر حفظ الموقع اليدوي
  const saveManualLocationBtn = document.getElementById('save-manual-location');
  if (saveManualLocationBtn) {
    saveManualLocationBtn.addEventListener('click', saveManualLocation);
  }

  // إضافة event listener لزر تحديد الموقع التلقائي
  const locationButton = document.getElementById('location-button');
  if (locationButton) {
    locationButton.addEventListener('click', getCurrentLocation);
  }

  // إضافة event listener لزر إدارة المواقع
  const locationListButton = document.getElementById('location-list-button');
  if (locationListButton) {
    locationListButton.addEventListener('click', function() {
      // افتح نافذة المواقع المحفوظة
      const locationModal = new bootstrap.Modal(document.getElementById('location-list-modal'));
      locationModal.show();
    });
  }

  // تهيئة التطبيق عند تحميل الصفحة
  initApp();
});
