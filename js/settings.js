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

  // إضافة مستمعي الأحداث للحفظ التلقائي
  initAutoSaveEvents();

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

  // تطبيق المظهر بعد الحفظ
  applyAppearance(selectedAppearance);

  console.log('تم الحفظ التلقائي للإعدادات');
}

// تهيئة أحداث الحفظ التلقائي
function initAutoSaveEvents() {
  // إعدادات الصلاة
  document.getElementById('calculation-method').addEventListener('change', autoSaveSettings);
  document.getElementById('time-format').addEventListener('change', autoSaveSettings);
  document.getElementById('rounding-method').addEventListener('change', autoSaveSettings);
  document.getElementById('manual-location').addEventListener('change', autoSaveSettings);
  document.getElementById('toggle-asr').addEventListener('change', autoSaveSettings);
  document.getElementById('toggle-isha').addEventListener('change', autoSaveSettings);
  
  // إعدادات الإشعارات
  document.getElementById('toggle-fajr-notification').addEventListener('change', autoSaveSettings);
  document.getElementById('toggle-dhuhr-notification').addEventListener('change', autoSaveSettings);
  document.getElementById('toggle-asr-notification').addEventListener('change', autoSaveSettings);
  document.getElementById('toggle-maghrib-notification').addEventListener('change', autoSaveSettings);
  document.getElementById('toggle-isha-notification').addEventListener('change', autoSaveSettings);
  
  // إعدادات الصوت (تمت إضافتها في initSoundEvents)
  
  // إعدادات المظهر (تمت إضافتها في initAppearanceEvents)
}

function saveSettings() {
  autoSaveSettings();
  showNotification('تم حفظ الإعدادات بنجاح');
  calculateAndDisplayPrayerTimes();

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
  
  volumeLevel.addEventListener('input', () => {
    if (adhanPlayer) {
      adhanPlayer.volume = volumeLevel.value / 100;
    }
    
    // حفظ مستوى الصوت تلقائياً
    autoSaveSettings();
  });

  // أحداث التبديل للتشغيل التلقائي للأذان
  const toggleIds = [
    'toggle-fajr-adhan',
    'toggle-dhuhr-adhan',
    'toggle-asr-adhan',
    'toggle-maghrib-adhan',
    'toggle-isha-adhan'
  ];
  
  toggleIds.forEach(id => {
    document.getElementById(id).addEventListener('change', autoSaveSettings);
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

// فتح قائمة المواقع من الإعدادات
document.getElementById('open-locations-list').addEventListener('click', () => {
  if (typeof locationManager !== 'undefined') {
      locationManager.openLocationModal();
      
      // إغلاق نافذة الإعدادات عند فتح نافذة المواقع
      const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settings-modal'));
      if (settingsModal) {
        settingsModal.hide();
      }
  }
});

// استدعاء دالة الترحيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  migrateOldSettings();
  loadSettings();
});

// تهيئة أحداث الحفظ عند فتح النافذة
document.getElementById('settings-modal').addEventListener('shown.bs.modal', function() {
  initAutoSaveEvents();
  initSoundEvents();
  initAppearanceEvents();
});
// حفظ الإعدادات عند إغلاق نافذة الإعدادات
document.getElementById('settings-modal').addEventListener('hidden.bs.modal', function() {
  // التأكد من حفظ أي إعدادات أخيرة قبل إغلاق النافذة
  autoSaveSettings();
  
  // إعادة حساب أوقات الصلاة بعد إغلاق النافذة
  calculateAndDisplayPrayerTimes();
  
  // إعادة تشغيل مراقبة الإشعارات
  if (typeof startNotificationChecker === 'function') {
    startNotificationChecker();
  }
});


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

// تأكد من أن دالة saveSettings تتضمن إعدادات المظهر
function saveSettings() {
    const selectedSound = document.querySelector('#adhan-sounds-list .sound-item.active')?.dataset.sound || 'abdul-basit';
    const selectedAppearance = document.querySelector('#appearance-list .appearance-option.active')?.dataset.appearance || 'light';
    
    const settings = {
        calculationMethod: calculationMethodSelect.value,
        timeFormat: timeFormatSelect.value,
        roundingMethod: roundingMethodSelect.value,
        city: manualLocation.value,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        cityName: currentLocation.city,
        showAsr: toggleAsr.checked,
        showIsha: toggleIsha.checked,
        // إعدادات الصوت
        selectedSound: selectedSound,
        playFajrAdhan: toggleFajrAdhan.checked,
        playDhuhrAdhan: toggleDhuhrAdhan.checked,
        playAsrAdhan: toggleAsrAdhan.checked,
        playMaghribAdhan: toggleMaghribAdhan.checked,
        playIshaAdhan: toggleIshaAdhan.checked,
        volumeLevel: volumeLevel.value,
        // إعدادات المظهر
        appearance: selectedAppearance
    };
    
    localStorage.setItem('prayerSettings', JSON.stringify(settings));
    showNotification('تم حفظ الإعدادات بنجاح');
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
    const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settings-modal'));
    if (settingsModal) {
      settingsModal.hide();
      showNotification('تم إغلاق الإعدادات تلقائياً بعد فترة من عدم النشاط');
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

// دالة لتهيئة الإعدادات التلقائية
function setupAutoCloseSettings() {
  const settingsModal = document.getElementById('settings-modal');
  
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

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  setupAutoCloseSettings();
  setupAutoSaveSettings(); // الدالة السابقة للحفظ التلقائي
});
