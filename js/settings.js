// إدارة الإعدادات والتخزين المحلي
function loadSettings() {
  // تحميل كل مجموعة إعدادات بشكل منفصل
  const prayerSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  const soundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {};
  const appearanceSettings = JSON.parse(localStorage.getItem('appearanceSettings')) || {};
  
  const calculationMethodSelect = document.getElementById('calculation-method');
  const timeFormatSelect = document.getElementById('time-format');
  const roundingMethodSelect = document.getElementById('rounding-method');
  const manualLocation = document.getElementById('manual-location');
  const toggleAsr = document.getElementById('toggle-asr');
  const toggleIsha = document.getElementById('toggle-isha');
  const toggleFajrAdhan = document.getElementById('toggle-fajr-adhan');
  const toggleDhuhrAdhan = document.getElementById('toggle-dhuhr-adhan');
  const toggleAsrAdhan = document.getElementById('toggle-asr-adhan');
  const toggleMaghribAdhan = document.getElementById('toggle-maghrib-adhan');
  const toggleIshaAdhan = document.getElementById('toggle-isha-adhan');
  const volumeLevel = document.getElementById('volume-level');
  const toggleFajrNotification = document.getElementById('toggle-fajr-notification');
  const toggleDhuhrNotification = document.getElementById('toggle-dhuhr-notification');
  const toggleAsrNotification = document.getElementById('toggle-asr-notification');
  const toggleMaghribNotification = document.getElementById('toggle-maghrib-notification');
  const toggleIshaNotification = document.getElementById('toggle-isha-notification');

  // تحميل إعدادات الصلاة
  if (prayerSettings.calculationMethod) calculationMethodSelect.value = prayerSettings.calculationMethod;
  if (prayerSettings.timeFormat) timeFormatSelect.value = prayerSettings.timeFormat;
  if (prayerSettings.roundingMethod) roundingMethodSelect.value = prayerSettings.roundingMethod;
  if (prayerSettings.city) manualLocation.value = prayerSettings.city;
  if (prayerSettings.latitude) currentLocation.latitude = prayerSettings.latitude;
  if (prayerSettings.longitude) currentLocation.longitude = prayerSettings.longitude;
  if (prayerSettings.cityName) currentLocation.city = prayerSettings.cityName;

  toggleAsr.checked = prayerSettings.showAsr !== undefined ? prayerSettings.showAsr : true;
  toggleIsha.checked = prayerSettings.showIsha !== undefined ? prayerSettings.showIsha : true;

  // تحميل إعدادات الإشعارات
  toggleFajrNotification.checked = prayerSettings.fajrNotification !== undefined ? prayerSettings.fajrNotification : true;
  toggleDhuhrNotification.checked = prayerSettings.dhuhrNotification !== undefined ? prayerSettings.dhuhrNotification : true;
  toggleAsrNotification.checked = prayerSettings.asrNotification !== undefined ? prayerSettings.asrNotification : true;
  toggleMaghribNotification.checked = prayerSettings.maghribNotification !== undefined ? prayerSettings.maghribNotification : true;
  toggleIshaNotification.checked = prayerSettings.ishaNotification !== undefined ? prayerSettings.ishaNotification : true;

  // تحميل إعدادات الصوت
  if (soundSettings.selectedSound) {
    selectSound(soundSettings.selectedSound);
  } else {
    selectSound('abdul-basit'); // قيمة افتراضية
  }

  // تعيين القيم الافتراضية للتشغيل التلقائي إذا لم تكن محددة
  toggleFajrAdhan.checked = soundSettings.playFajrAdhan !== undefined ? soundSettings.playFajrAdhan : true;
  toggleDhuhrAdhan.checked = soundSettings.playDhuhrAdhan !== undefined ? soundSettings.playDhuhrAdhan : true;
  toggleAsrAdhan.checked = soundSettings.playAsrAdhan !== undefined ? soundSettings.playAsrAdhan : true;
  toggleMaghribAdhan.checked = soundSettings.playMaghribAdhan !== undefined ? soundSettings.playMaghribAdhan : true;
  toggleIshaAdhan.checked = soundSettings.playIshaAdhan !== undefined ? soundSettings.playIshaAdhan : true;

  if (soundSettings.volumeLevel !== undefined) volumeLevel.value = soundSettings.volumeLevel;
  else volumeLevel.value = 80; // قيمة حجم افتراضية

  // تحميل إعدادات المظهر
  if (appearanceSettings.appearance) {
    selectAppearance(appearanceSettings.appearance);
    applyAppearance(appearanceSettings.appearance);
  } else {
    selectAppearance('auto');
    applyAppearance('auto');
  }

  // دعم التوافق مع الإصدارات القديمة (إذا كانت الإعدادات مخزنة في كائن واحد)
  const oldSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  if (oldSettings.selectedSound && !soundSettings.selectedSound) {
    selectSound(oldSettings.selectedSound);
  }
  if (oldSettings.appearance && !appearanceSettings.appearance) {
    selectAppearance(oldSettings.appearance);
    applyAppearance(oldSettings.appearance);
  }

  return {
    ...prayerSettings,
    ...soundSettings,
    ...appearanceSettings
  };
}

function saveSettings() {
  const selectedSound = document.querySelector('#adhan-sounds-list .sound-item.active')?.dataset.sound || 'abdul-basit';
  const selectedAppearance = document.querySelector('#appearance-list .sound-item.active')?.dataset.appearance || 'auto';
  const calculationMethodSelect = document.getElementById('calculation-method');
  const timeFormatSelect = document.getElementById('time-format');
  const roundingMethodSelect = document.getElementById('rounding-method');
  const manualLocation = document.getElementById('manual-location');
  const toggleAsr = document.getElementById('toggle-asr');
  const toggleIsha = document.getElementById('toggle-isha');
  const toggleFajrAdhan = document.getElementById('toggle-fajr-adhan');
  const toggleDhuhrAdhan = document.getElementById('toggle-dhuhr-adhan');
  const toggleAsrAdhan = document.getElementById('toggle-asr-adhan');
  const toggleMaghribAdhan = document.getElementById('toggle-maghrib-adhan');
  const toggleIshaAdhan = document.getElementById('toggle-isha-adhan');
  const volumeLevel = document.getElementById('volume-level');
  const toggleFajrNotification = document.getElementById('toggle-fajr-notification');
  const toggleDhuhrNotification = document.getElementById('toggle-dhuhr-notification');
  const toggleAsrNotification = document.getElementById('toggle-asr-notification');
  const toggleMaghribNotification = document.getElementById('toggle-maghrib-notification');
  const toggleIshaNotification = document.getElementById('toggle-isha-notification');

  // حفظ إعدادات الصلاة والموقع بشكل منفصل
  const prayerSettings = {
    calculationMethod: calculationMethodSelect.value,
    timeFormat: timeFormatSelect.value,
    roundingMethod: roundingMethodSelect.value,
    city: manualLocation.value,
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    cityName: currentLocation.city,
    showAsr: toggleAsr.checked,
    showIsha: toggleIsha.checked,
    // إعدادات الإشعارات
    fajrNotification: toggleFajrNotification.checked,
    dhuhrNotification: toggleDhuhrNotification.checked,
    asrNotification: toggleAsrNotification.checked,
    maghribNotification: toggleMaghribNotification.checked,
    ishaNotification: toggleIshaNotification.checked
  };
  
  // حفظ إعدادات الصوت بشكل منفصل
  const soundSettings = {
    selectedSound: selectedSound,
    playFajrAdhan: toggleFajrAdhan.checked,
    playDhuhrAdhan: toggleDhuhrAdhan.checked,
    playAsrAdhan: toggleAsrAdhan.checked,
    playMaghribAdhan: toggleMaghribAdhan.checked,
    playIshaAdhan: toggleIshaAdhan.checked,
    volumeLevel: volumeLevel.value
  };
  
  // حفظ إعدادات المظهر بشكل منفصل
  const appearanceSettings = {
    appearance: selectedAppearance
  };

  // حفظ كل مجموعة إعدادات بشكل منفصل
  localStorage.setItem('prayerSettings', JSON.stringify(prayerSettings));
  localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
  localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
  
  showNotification('تم حفظ الإعدادات بنجاح');
  calculateAndDisplayPrayerTimes();

  // تطبيق المظهر بعد الحفظ
  applyAppearance(selectedAppearance);

  // إعادة تشغيل مراقبة الإشعارات بعد حفظ الإعدادات
  startNotificationChecker();
}

function selectSound(soundId) {
  const soundItems = document.querySelectorAll('.sound-item');
  soundItems.forEach(item => {
    if (item.dataset.sound === soundId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function selectAppearance(appearanceId) {
  const appearanceItems = document.querySelectorAll('#appearance-list .sound-item');
  appearanceItems.forEach(item => {
    if (item.dataset.appearance === appearanceId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function applyAppearance(appearance) {
  let darkMode = false;

  if (appearance === 'dark') {
    darkMode = true;
  } else if (appearance === 'auto') {
    // التحقق من تفضيلات النظام
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

// تهيئة الأحداث الخاصة بالأصوات
function initSoundEvents() {
  const soundItems = document.querySelectorAll('#adhan-sounds-list .sound-item');
  
  // حدث النقر على عنصر صوت
  soundItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('play-btn') || e.target.parentElement.classList.contains('play-btn')) {
        // تشغيل الصوت عند النقر على زر التشغيل
        const soundId = item.dataset.sound;
        playAdhanSound(soundId);
      } else {
        // تحديد الصوت عند النقر على العنصر
        selectSound(item.dataset.sound);
        
        // حفظ إعدادات الصوت فقط دون التأثير على الإعدادات الأخرى
        const soundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {};
        soundSettings.selectedSound = item.dataset.sound;
        localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
      }
    });
  });

  // أحداث التمرير لمستوى الصوت
  const volumeLevel = document.getElementById('volume-level');
  const adhanPlayer = document.getElementById('adhan-player');
  
  volumeLevel.addEventListener('input', () => {
    adhanPlayer.volume = volumeLevel.value / 100;
    
    // حفظ مستوى الصوت فوراً
    const soundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {};
    soundSettings.volumeLevel = volumeLevel.value;
    localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
  });
}

// تهيئة الأحداث الخاصة بمظهر التطبيق
function initAppearanceEvents() {
  const appearanceItems = document.querySelectorAll('#appearance-list .sound-item');
  
  appearanceItems.forEach(item => {
    item.addEventListener('click', () => {
      selectAppearance(item.dataset.appearance);
      applyAppearance(item.dataset.appearance);
      
      // حفظ إعدادات المظهر فوراً
      const appearanceSettings = { appearance: item.dataset.appearance };
      localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
    });
  });

  // الاستماع لتغير تفضيلات النظام عند اختيار "حسب جهاز المستخدم"
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const appearanceSettings = JSON.parse(localStorage.getItem('appearanceSettings')) || {};
      if (appearanceSettings.appearance === 'auto') {
        applyAppearance('auto');
      }
    });
  }
}


