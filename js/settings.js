// إدارة الإعدادات والتخزين المحلي

// دالة لترحيل الإعدادات من النسخة القديمة إلى الجديدة
function migrateOldSettings() {
  const oldSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  
  if (oldSettings.selectedSound || oldSettings.appearance) {
    // فصل إعدادات الصوت
    const soundSettings = {
      selectedSound: oldSettings.selectedSound || 'abdul-basit',
      playFajrAdhan: oldSettings.playFajrAdhan !== undefined ? oldSettings.playFajrAdhan : true,
      playDhuhrAdhan: oldSettings.playDhuhrAdhan !== undefined ? oldSettings.playDhuhrAdhan : true,
      playAsrAdhan: oldSettings.playAsrAdhan !== undefined ? oldSettings.playAsrAdhan : true,
      playMaghribAdhan: oldSettings.playMaghribAdhan !== undefined ? oldSettings.playMaghribAdhan : true,
      playIshaAdhan: oldSettings.playIshaAdhan !== undefined ? oldSettings.playIshaAdhan : true,
      volumeLevel: oldSettings.volumeLevel !== undefined ? oldSettings.volumeLevel : 80
    };
    
    // فصل إعدادات المظهر
    const appearanceSettings = {
      appearance: oldSettings.appearance || 'auto'
    };
    
    // حفظ الإعدادات الجديدة
    localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
    
    // إزالة الخصائص القديمة من كائن الإعدادات
    delete oldSettings.selectedSound;
    delete oldSettings.playFajrAdhan;
    delete oldSettings.playDhuhrAdhan;
    delete oldSettings.playAsrAdhan;
    delete oldSettings.playMaghribAdhan;
    delete oldSettings.playIshaAdhan;
    delete oldSettings.volumeLevel;
    delete oldSettings.appearance;
    
    // حفظ إعدادات الصلاة المتبقية
    localStorage.setItem('prayerSettings', JSON.stringify(oldSettings));
  }
}

function loadSettings() {
  // ترحيل الإعدادات القديمة أولاً
  migrateOldSettings();
  
  // تحميل كل مجموعة إعدادات بشكل منفصل
  const prayerSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  const soundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {};
  const appearanceSettings = JSON.parse(localStorage.getItem('appearanceSettings')) || {};
  
  // فحص وجود العناصر قبل الوصول إليها
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

  // تحميل إعدادات الصلاة (مع فحص وجود العناصر)
  if (calculationMethodSelect && prayerSettings.calculationMethod) calculationMethodSelect.value = prayerSettings.calculationMethod;
  if (timeFormatSelect && prayerSettings.timeFormat) timeFormatSelect.value = prayerSettings.timeFormat;
  if (roundingMethodSelect && prayerSettings.roundingMethod) roundingMethodSelect.value = prayerSettings.roundingMethod;
  if (manualLocation && prayerSettings.city) manualLocation.value = prayerSettings.city;
  
  // تحديث currentLocation إذا كان موجوداً
  if (typeof currentLocation !== 'undefined') {
    if (prayerSettings.latitude) currentLocation.latitude = prayerSettings.latitude;
    if (prayerSettings.longitude) currentLocation.longitude = prayerSettings.longitude;
    if (prayerSettings.cityName) currentLocation.city = prayerSettings.cityName;
  }

  if (toggleAsr) toggleAsr.checked = prayerSettings.showAsr !== undefined ? prayerSettings.showAsr : true;
  if (toggleIsha) toggleIsha.checked = prayerSettings.showIsha !== undefined ? prayerSettings.showIsha : true;

  // تحميل إعدادات الإشعارات
  if (toggleFajrNotification) toggleFajrNotification.checked = prayerSettings.fajrNotification !== undefined ? prayerSettings.fajrNotification : true;
  if (toggleDhuhrNotification) toggleDhuhrNotification.checked = prayerSettings.dhuhrNotification !== undefined ? prayerSettings.dhuhrNotification : true;
  if (toggleAsrNotification) toggleAsrNotification.checked = prayerSettings.asrNotification !== undefined ? prayerSettings.asrNotification : true;
  if (toggleMaghribNotification) toggleMaghribNotification.checked = prayerSettings.maghribNotification !== undefined ? prayerSettings.maghribNotification : true;
  if (toggleIshaNotification) toggleIshaNotification.checked = prayerSettings.ishaNotification !== undefined ? prayerSettings.ishaNotification : true;

  // تحميل إعدادات الصوت
  if (soundSettings.selectedSound) {
    selectSound(soundSettings.selectedSound);
  } else {
    selectSound('abdul-basit'); // قيمة افتراضية
  }

  // تعيين القيم الافتراضية للتشغيل التلقائي إذا لم تكن محددة
  if (toggleFajrAdhan) toggleFajrAdhan.checked = soundSettings.playFajrAdhan !== undefined ? soundSettings.playFajrAdhan : true;
  if (toggleDhuhrAdhan) toggleDhuhrAdhan.checked = soundSettings.playDhuhrAdhan !== undefined ? soundSettings.playDhuhrAdhan : true;
  if (toggleAsrAdhan) toggleAsrAdhan.checked = soundSettings.playAsrAdhan !== undefined ? soundSettings.playAsrAdhan : true;
  if (toggleMaghribAdhan) toggleMaghribAdhan.checked = soundSettings.playMaghribAdhan !== undefined ? soundSettings.playMaghribAdhan : true;
  if (toggleIshaAdhan) toggleIshaAdhan.checked = soundSettings.playIshaAdhan !== undefined ? soundSettings.playIshaAdhan : true;

  if (volumeLevel) volumeLevel.value = soundSettings.volumeLevel !== undefined ? soundSettings.volumeLevel : 80;

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

// دالة للحفظ التلقائي للإعدادات
function autoSaveSettings() {
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

  // فحص وجود العناصر قبل استخدامها
  if (!calculationMethodSelect || !timeFormatSelect || !roundingMethodSelect) return;

  // حفظ إعدادات الصلاة والموقع بشكل منفصل
  const prayerSettings = {
    calculationMethod: calculationMethodSelect.value,
    timeFormat: timeFormatSelect.value,
    roundingMethod: roundingMethodSelect.value,
    city: manualLocation ? manualLocation.value : '',
    latitude: (typeof currentLocation !== 'undefined' && currentLocation.latitude) ? currentLocation.latitude : 31.9539,
    longitude: (typeof currentLocation !== 'undefined' && currentLocation.longitude) ? currentLocation.longitude : 44.3736,
    cityName: (typeof currentLocation !== 'undefined' && currentLocation.city) ? currentLocation.city : 'النجف',
    showAsr: toggleAsr ? toggleAsr.checked : true,
    showIsha: toggleIsha ? toggleIsha.checked : true,
    // إعدادات الإشعارات
    fajrNotification: toggleFajrNotification ? toggleFajrNotification.checked : true,
    dhuhrNotification: toggleDhuhrNotification ? toggleDhuhrNotification.checked : true,
    asrNotification: toggleAsrNotification ? toggleAsrNotification.checked : true,
    maghribNotification: toggleMaghribNotification ? toggleMaghribNotification.checked : true,
    ishaNotification: toggleIshaNotification ? toggleIshaNotification.checked : true
  };
  
  // حفظ إعدادات الصوت بشكل منفصل
  const soundSettings = {
    selectedSound: selectedSound,
    playFajrAdhan: toggleFajrAdhan ? toggleFajrAdhan.checked : true,
    playDhuhrAdhan: toggleDhuhrAdhan ? toggleDhuhrAdhan.checked : true,
    playAsrAdhan: toggleAsrAdhan ? toggleAsrAdhan.checked : true,
    playMaghribAdhan: toggleMaghribAdhan ? toggleMaghribAdhan.checked : true,
    playIshaAdhan: toggleIshaAdhan ? toggleIshaAdhan.checked : true,
    volumeLevel: volumeLevel ? volumeLevel.value : 80
  };
  
  // حفظ إعدادات المظهر بشكل منفصل
  const appearanceSettings = {
    appearance: selectedAppearance
  };

  // حفظ كل مجموعة إعدادات بشكل منفصل
  localStorage.setItem('prayerSettings', JSON.stringify(prayerSettings));
  localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
  localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));

  // تطبيق المظهر بعد الحفظ
  applyAppearance(selectedAppearance);

  console.log('تم الحفظ التلقائي للإعدادات');
}

// تهيئة أحداث الحفظ التلقائي
function initAutoSaveEvents() {
  // إعدادات الصلاة
  const calculationMethod = document.getElementById('calculation-method');
  const timeFormat = document.getElementById('time-format');
  const roundingMethod = document.getElementById('rounding-method');
  const manualLocation = document.getElementById('manual-location');
  const toggleAsr = document.getElementById('toggle-asr');
  const toggleIsha = document.getElementById('toggle-isha');
  
  if (calculationMethod) calculationMethod.addEventListener('change', autoSaveSettings);
  if (timeFormat) timeFormat.addEventListener('change', autoSaveSettings);
  if (roundingMethod) roundingMethod.addEventListener('change', autoSaveSettings);
  if (manualLocation) manualLocation.addEventListener('change', autoSaveSettings);
  if (toggleAsr) toggleAsr.addEventListener('change', autoSaveSettings);
  if (toggleIsha) toggleIsha.addEventListener('change', autoSaveSettings);
  
  // إعدادات الإشعارات
  const notificationToggles = [
    'toggle-fajr-notification',
    'toggle-dhuhr-notification',
    'toggle-asr-notification',
    'toggle-maghrib-notification',
    'toggle-isha-notification'
  ];
  
  notificationToggles.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', autoSaveSettings);
    }
  });
}

function saveSettings() {
  autoSaveSettings();
  if (typeof showNotification === 'function') {
    showNotification('تم حفظ الإعدادات بنجاح');
  }
  if (typeof calculateAndDisplayPrayerTimes === 'function') {
    calculateAndDisplayPrayerTimes();
  }

  // إعادة تشغيل مراقبة الإشعارات بعد حفظ الإعدادات
  if (typeof startNotificationChecker === 'function') {
    startNotificationChecker();
  }
}

function selectSound(soundId) {
  const soundItems = document.querySelectorAll('#adhan-sounds-list .sound-item');
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
        if (typeof playAdhanSound === 'function') {
          playAdhanSound(soundId);
        }
      } else {
        // تحديد الصوت عند النقر على العنصر
        selectSound(item.dataset.sound);
        
        // حفظ إعدادات الصوت تلقائياً
        autoSaveSettings();
      }
    });
  });

  // أحداث التمرير لمستوى الصوت
  const volumeLevel = document.getElementById('volume-level');
  const adhanPlayer = document.getElementById('adhan-player');
  
  if (volumeLevel) {
    volumeLevel.addEventListener('input', () => {
      if (adhanPlayer) {
        adhanPlayer.volume = volumeLevel.value / 100;
      }
      
      // حفظ مستوى الصوت تلقائياً
      autoSaveSettings();
    });
  }

  // أحداث التبديل للتشغيل التلقائي للأذان
  const toggleIds = [
    'toggle-fajr-adhan',
    'toggle-dhuhr-adhan',
    'toggle-asr-adhan',
    'toggle-maghrib-adhan',
    'toggle-isha-adhan'
  ];
  
  toggleIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', autoSaveSettings);
    }
  });
}

// تهيئة الأحداث الخاصة بمظهر التطبيق
function initAppearanceEvents() {
  const appearanceItems = document.querySelectorAll('#appearance-list .sound-item');
  
  appearanceItems.forEach(item => {
    item.addEventListener('click', () => {
      selectAppearance(item.dataset.appearance);
      applyAppearance(item.dataset.appearance);
      
      // حفظ إعدادات المظهر تلقائياً
      autoSaveSettings();
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

// دالة لتهيئة الإعدادات التلقائية
function setupAutoSaveSettings() {
  // تهيئة أحداث الحفظ التلقائي
  initAutoSaveEvents();
  initSoundEvents();
  initAppearanceEvents();
}

// تهيئة إعدادات المظهر
function initAppearanceSettings() {
    const appearanceOptions = document.querySelectorAll('.appearance-option');
    
    appearanceOptions.forEach(option => {
        option.addEventListener('click', function() {
            appearanceOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const theme = this.getAttribute('data-theme');
            applyTheme(theme);
            
            // حفظ الإعدادات كاملة
            saveSettings();
        });
    });
    
    // تحميل الإعدادات المحفوظة
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const savedTheme = settings.appearance || 'light';
    
    // تفعيل الخيار المناسب
    const activeOption = document.querySelector(`.appearance-option[data-theme="${savedTheme}"]`);
    if (activeOption) {
        activeOption.classList.add('active');
    }
}

// متغيرات لإدارة المؤقت التلقائي
let autoCloseTimer;
const AUTO_CLOSE_DELAY = 15000; // 15 ثانية

// دالة لبدء مؤتمر الإغلاق التلقائي
function startAutoCloseTimer() {
  // مسح المؤقت الحالي إذا كان موجوداً
  clearTimeout(autoCloseTimer);
  
  // بدء مؤتمر جديد
  autoCloseTimer = setTimeout(() => {
    const settingsModalElement = document.getElementById('settings-modal');
    if (settingsModalElement) {
      const settingsModal = bootstrap.Modal.getInstance(settingsModalElement);
      if (settingsModal) {
        settingsModal.hide();
        if (typeof showNotification === 'function') {
          showNotification('تم إغلاق الإعدادات تلقائياً بعد فترة من عدم النشاط');
        }
      }
    }
  }, AUTO_CLOSE_DELAY);
}

// دالة لإعادة تعيين المؤتمر عند النشاط
function resetAutoCloseTimer() {
  startAutoCloseTimer();
}

// دالة لإعداد مستمعي الأحداث للنشاط
function setupActivityListeners() {
  const settingsModal = document.getElementById('settings-modal');
  if (!settingsModal) return;
  
  // إعادة تعيين المؤتمر عند أي تفاعل مع النافذة
  settingsModal.addEventListener('click', resetAutoCloseTimer);
  settingsModal.addEventListener('keydown', resetAutoCloseTimer);
  settingsModal.addEventListener('scroll', resetAutoCloseTimer);
  settingsModal.addEventListener('mousemove', resetAutoCloseTimer);
  settingsModal.addEventListener('touchstart', resetAutoCloseTimer);
  
  // إعادة تعيين المؤتمر عند تغيير التبويبات
  const tabButtons = document.querySelectorAll('#v-pills-tab button');
  tabButtons.forEach(button => {
    button.addEventListener('click', resetAutoCloseTimer);
  });
  
  // إعادة تعيين المؤتمر عند تغيير الإعدادات
  const formElements = document.querySelectorAll('#settings-modal input, #settings-modal select, #settings-modal button');
  formElements.forEach(element => {
    element.addEventListener('change', resetAutoCloseTimer);
    element.addEventListener('click', resetAutoCloseTimer);
  });
}

// دالة لتهيئة الإغلاق التلقائي
function setupAutoCloseSettings() {
  const settingsModal = document.getElementById('settings-modal');
  if (!settingsModal) return;
  
  // بدء المؤتمر عند فتح النافذة
  settingsModal.addEventListener('shown.bs.modal', function() {
    startAutoCloseTimer();
    setupActivityListeners();
  });
  
  // مسح المؤتمر عند إغلاق النافذة
  settingsModal.addEventListener('hidden.bs.modal', function() {
    clearTimeout(autoCloseTimer);
  });
}

// تهيئة الإعدادات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  migrateOldSettings();
  loadSettings();
  setupAutoSaveSettings();
  setupAutoCloseSettings();
});

// أحداث نافذة الإعدادات
document.addEventListener('DOMContentLoaded', function() {
  const settingsModal = document.getElementById('settings-modal');
  const openLocationsList = document.getElementById('open-locations-list');
  
  if (settingsModal) {
    // تهيئة أحداث الحفظ عند فتح النافذة
    settingsModal.addEventListener('shown.bs.modal', function() {
      setupAutoSaveSettings();
    });
    
    // حفظ الإعدادات عند إغلاق نافذة الإعدادات
    settingsModal.addEventListener('hidden.bs.modal', function() {
      // التأكد من حفظ أي إعدادات أخيرة قبل إغلاق النافذة
      autoSaveSettings();
      
      // إعادة حساب أوقات الصلاة بعد إغلاق النافذة
      if (typeof calculateAndDisplayPrayerTimes === 'function') {
        calculateAndDisplayPrayerTimes();
      }
      
      // إعادة تشغيل مراقبة الإشعارات
      if (typeof startNotificationChecker === 'function') {
        startNotificationChecker();
      }
    });
  }
  
  if (openLocationsList) {
    openLocationsList.addEventListener('click', () => {
      if (typeof locationManager !== 'undefined' && locationManager.openLocationModal) {
        locationManager.openLocationModal();
        
        // إغلاق نافذة الإعدادات عند فتح نافذة المواقع
        const settingsModalElement = document.getElementById('settings-modal');
        if (settingsModalElement) {
          const settingsModalInstance = bootstrap.Modal.getInstance(settingsModalElement);
          if (settingsModalInstance) {
            settingsModalInstance.hide();
          }
        }
      }
    });
  }
});
