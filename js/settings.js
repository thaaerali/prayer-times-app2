// إدارة الإعدادات والتخزين المحلي

// دالة لترحيل الإعدادات من النسخة القديمة إلى الجديدة
function migrateOldSettings() {
  const oldSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  
  if (oldSettings.selectedSound || oldSettings.appearance) {
    // فصل إعدادات الصوت
    const soundSettings = {
      selectedSound: oldSettings.selectedSound || 'aba dhari alhulwaji',
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
  
  // تحميل إعدادات الصلاة
  const calculationMethodSelect = document.getElementById('calculation-method');
  const timeFormatSelect = document.getElementById('time-format');
  const manualLocation = document.getElementById('manual-location');
  const toggleImsak = document.getElementById('toggle-imsak');
  const toggleAsr = document.getElementById('toggle-asr');
  const toggleIsha = document.getElementById('toggle-isha');
  const toggleMidnight = document.getElementById('toggle-midnight');
  const toggleFajrAdhan = document.getElementById('toggle-fajr-adhan');
  const toggleDhuhrAdhan = document.getElementById('toggle-dhuhr-adhan');
  const toggleAsrAdhan = document.getElementById('toggle-asr-adhan');
  const toggleMaghribAdhan = document.getElementById('toggle-maghrib-adhan');
  const toggleIshaAdhan = document.getElementById('toggle-isha-adhan');
  const volumeLevel = document.getElementById('volume-level');

  // تحميل إعدادات الصلاة
  if (calculationMethodSelect && prayerSettings.calculationMethod) calculationMethodSelect.value = prayerSettings.calculationMethod;
  if (timeFormatSelect && prayerSettings.timeFormat) timeFormatSelect.value = prayerSettings.timeFormat;
  if (manualLocation && prayerSettings.city) manualLocation.value = prayerSettings.city;
  
  if (prayerSettings.latitude) currentLocation.latitude = prayerSettings.latitude;
  if (prayerSettings.longitude) currentLocation.longitude = prayerSettings.longitude;
  if (prayerSettings.cityName) currentLocation.city = prayerSettings.cityName;
  
  if (toggleImsak) toggleImsak.checked = prayerSettings.showImsak !== undefined ? prayerSettings.showImsak : true;
  if (toggleAsr) toggleAsr.checked = prayerSettings.showAsr !== undefined ? prayerSettings.showAsr : true;
  if (toggleIsha) toggleIsha.checked = prayerSettings.showIsha !== undefined ? prayerSettings.showIsha : true;
  if (toggleMidnight) toggleMidnight.checked = prayerSettings.showMidnight !== undefined ? prayerSettings.showMidnight : true;

  // تحميل إعدادات الصوت
  if (soundSettings.selectedSound) {
    selectSound(soundSettings.selectedSound);
  } else {
    selectSound('aba dhari alhulwaji'); // قيمة افتراضية
  }

  // تعيين القيم الافتراضية للتشغيل التلقائي
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

  // دعم التوافق مع الإصدارات القديمة
  const oldSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  if (oldSettings.selectedSound && !soundSettings.selectedSound) {
    selectSound(oldSettings.selectedSound);
  }
  if (oldSettings.appearance && !appearanceSettings.appearance) {
    selectAppearance(oldSettings.appearance);
    applyAppearance(oldSettings.appearance);
  }

  // إضافة مستمعي الأحداث للحفظ التلقائي
  if (document.getElementById('settings-page')?.classList.contains('active')) {
    initAutoSaveEvents();
  }

  return {
    ...prayerSettings,
    ...soundSettings,
    ...appearanceSettings
  };
}

// دالة للحفظ التلقائي للإعدادات (تم تحديثها)
function autoSaveSettings() {
  console.log('الحفظ التلقائي للإعدادات...');
  
  const selectedSound = document.querySelector('#adhan-sounds-list .sound-item.active')?.dataset.sound || 'aba dhari alhulwaji';
  const selectedAppearance = document.querySelector('#appearance-list .sound-item.active')?.dataset.appearance || 'auto';
  const calculationMethodSelect = document.getElementById('calculation-method');
  const timeFormatSelect = document.getElementById('time-format');
  const manualLocation = document.getElementById('manual-location');
  const toggleImsak = document.getElementById('toggle-imsak');
  const toggleAsr = document.getElementById('toggle-asr');
  const toggleIsha = document.getElementById('toggle-isha');
  const toggleMidnight = document.getElementById('toggle-midnight');

  // التحقق من وجود العناصر قبل استخدامها
  if (!calculationMethodSelect || !timeFormatSelect) {
    console.log('عناصر الإعدادات غير موجودة، تأجيل الحفظ');
    return;
  }

  // حفظ إعدادات الصلاة والموقع (بدون إعدادات الإشعارات القديمة)
  const prayerSettings = {
    calculationMethod: calculationMethodSelect.value,
    timeFormat: timeFormatSelect.value,
    city: manualLocation ? manualLocation.value : '',
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    cityName: currentLocation.city,
    showImsak: toggleImsak ? toggleImsak.checked : true,
    showAsr: toggleAsr ? toggleAsr.checked : true,
    showIsha: toggleIsha ? toggleIsha.checked : true,
    showMidnight: toggleMidnight ? toggleMidnight.checked : true
  };
  
  // حفظ إعدادات الصوت
  const soundSettings = {
    selectedSound: selectedSound,
    playFajrAdhan: document.getElementById('toggle-fajr-adhan')?.checked ?? true,
    playDhuhrAdhan: document.getElementById('toggle-dhuhr-adhan')?.checked ?? true,
    playAsrAdhan: document.getElementById('toggle-asr-adhan')?.checked ?? true,
    playMaghribAdhan: document.getElementById('toggle-maghrib-adhan')?.checked ?? true,
    playIshaAdhan: document.getElementById('toggle-isha-adhan')?.checked ?? true,
    volumeLevel: document.getElementById('volume-level')?.value ?? 80
  };
  
  // حفظ إعدادات المظهر
  const appearanceSettings = {
    appearance: selectedAppearance
  };

  // حفظ كل مجموعة إعدادات بشكل منفصل
  localStorage.setItem('prayerSettings', JSON.stringify(prayerSettings));
  localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
  localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));

  console.log('تم الحفظ التلقائي للإعدادات:', {
    prayerSettings,
    soundSettings,
    appearanceSettings
  });

  // تطبيق المظهر بعد الحفظ
  applyAppearance(selectedAppearance);
  
  // تحديث الصفحة الرئيسية فوراً
  if (typeof updateHomePageFromSettings === 'function') {
    updateHomePageFromSettings();
  }
}

function saveSettings() {
  // الحصول على العناصر من DOM مع التحقق من وجودها
  const calculationMethodSelect = document.getElementById('calculation-method');
  const timeFormatSelect = document.getElementById('time-format');
  const manualLocation = document.getElementById('manual-location');
  const toggleImsak = document.getElementById('toggle-imsak');
  const toggleAsr = document.getElementById('toggle-asr');
  const toggleIsha = document.getElementById('toggle-isha');
  const toggleMidnight = document.getElementById('toggle-midnight');
  const toggleFajrAdhan = document.getElementById('toggle-fajr-adhan');
  const toggleDhuhrAdhan = document.getElementById('toggle-dhuhr-adhan');
  const toggleAsrAdhan = document.getElementById('toggle-asr-adhan');
  const toggleMaghribAdhan = document.getElementById('toggle-maghrib-adhan');
  const toggleIshaAdhan = document.getElementById('toggle-isha-adhan');
  const volumeLevel = document.getElementById('volume-level');

  // الحصول على القيم المحددة
  const selectedSound = document.querySelector('#adhan-sounds-list .sound-item.active')?.dataset.sound || 'aba dhari alhulwaji';
  const selectedAppearance = document.querySelector('#appearance-list .sound-item.active')?.dataset.appearance || 'auto';

  // حفظ إعدادات الصلاة والموقع (بدون إعدادات الإشعارات القديمة)
  const prayerSettings = {
    calculationMethod: calculationMethodSelect ? calculationMethodSelect.value : 'MWL',
    timeFormat: timeFormatSelect ? timeFormatSelect.value : '24h',
    city: manualLocation ? manualLocation.value : '',
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    cityName: currentLocation.city,
    showImsak: toggleImsak ? toggleImsak.checked : true,
    showAsr: toggleAsr ? toggleAsr.checked : true,
    showIsha: toggleIsha ? toggleIsha.checked : true,
    showMidnight: toggleMidnight ? toggleMidnight.checked : true
  };
  
  // حفظ إعدادات الصوت
  const soundSettings = {
    selectedSound: selectedSound,
    playFajrAdhan: toggleFajrAdhan ? toggleFajrAdhan.checked : true,
    playDhuhrAdhan: toggleDhuhrAdhan ? toggleDhuhrAdhan.checked : true,
    playAsrAdhan: toggleAsrAdhan ? toggleAsrAdhan.checked : true,
    playMaghribAdhan: toggleMaghribAdhan ? toggleMaghribAdhan.checked : true,
    playIshaAdhan: toggleIshaAdhan ? toggleIshaAdhan.checked : true,
    volumeLevel: volumeLevel ? volumeLevel.value : 80
  };
  
  // حفظ إعدادات المظهر
  const appearanceSettings = {
    appearance: selectedAppearance
  };

  // حفظ كل مجموعة إعدادات بشكل منفصل
  localStorage.setItem('prayerSettings', JSON.stringify(prayerSettings));
  localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
  localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));

  // تطبيق المظهر بعد الحفظ
  applyAppearance(selectedAppearance);

  showNotification('تم حفظ الإعدادات بنجاح');
  
  // إعادة حساب وعرض أوقات الصلاة
  if (typeof calculateAndDisplayPrayerTimes === 'function') {
    calculateAndDisplayPrayerTimes();
  }
}

// دالة محسنة لاختيار الصوت
function selectSound(soundId) {
  const soundItems = document.querySelectorAll('#adhan-sounds-list .sound-item');
  soundItems.forEach(item => {
    if (item.dataset.sound === soundId) {
      item.classList.add('active');
      // حفظ فوري للإعدادات
      const soundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {};
      soundSettings.selectedSound = soundId;
      localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
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
  
  soundItems.forEach(item => {
    // إزالة أي event listeners سابقة
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
    
    // إضافة event listener جديدة
    newItem.addEventListener('click', (e) => {
      if (e.target.classList.contains('play-btn') || e.target.parentElement.classList.contains('play-btn')) {
        // تشغيل الصوت عند النقر على زر التشغيل
        const soundId = newItem.dataset.sound;
        if (typeof playAdhanSound === 'function') {
          playAdhanSound(soundId);
        }
      } else {
        // تحديد الصوت عند النقر على العنصر
        selectSound(newItem.dataset.sound);
        
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
}

// تهيئة الأحداث الخاصة بمظهر التطبيق
function initAppearanceEvents() {
  const appearanceItems = document.querySelectorAll('#appearance-list .sound-item');
  
  appearanceItems.forEach(item => {
    // إزالة أي event listeners سابقة
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
    
    // إضافة event listener جديدة
    newItem.addEventListener('click', () => {
      selectAppearance(newItem.dataset.appearance);
      applyAppearance(newItem.dataset.appearance);
      
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

// تهيئة أحداث الحفظ التلقائي (تم تحديثها)
function initAutoSaveEvents() {
  console.log('تهيئة أحداث الحفظ التلقائي...');
  
  // قائمة بجميع عناصر الإعدادات التي تحتاج event listeners
  const settingsElements = [
    'calculation-method', 'time-format', 'manual-location','toggle-imsak',
    'toggle-asr', 'toggle-isha','toggle-midnight', 'toggle-fajr-adhan', 'toggle-dhuhr-adhan',
    'toggle-asr-adhan', 'toggle-maghrib-adhan', 'toggle-isha-adhan', 'volume-level'
  ];

  settingsElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      // إزالة أي event listeners سابقة
      const newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);
      
      // إضافة event listener جديدة
      document.getElementById(id).addEventListener('change', function() {
        console.log(`تغيير في ${id}:`, this.value || this.checked);
        autoSaveSettings();
      });
    }
  });

  // تهيئة أحداث الصوت والمظهر
  initSoundEvents();
  initAppearanceEvents();
}

// دالة محسنة لتهيئة أحداث صفحة الإعدادات
function initSettingsPageEvents() {
  console.log('تهيئة أحداث صفحة الإعدادات...');
  
  // تهيئة الأحداث فقط إذا كانت صفحة الإعدادات نشطة
  const settingsPage = document.getElementById('settings-page');
  if (!settingsPage || !settingsPage.classList.contains('active')) {
    console.log('صفحة الإعدادات غير نشطة، تأجيل تهيئة الأحداث');
    return;
  }

  // تحميل الإعدادات الحالية أولاً
  loadSettings();
  
  // ثم تهيئة أحداث الحفظ التلقائي
  setTimeout(() => {
    initAutoSaveEvents();
  }, 100);
}

// استدعاء دالة الترحيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  migrateOldSettings();
  loadSettings();
});

// دالة محسنة لتطبيق المظهر
function applyAppearance(appearance) {
  console.log('تطبيق المظهر:', appearance);
  
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
    document.body.classList.remove('bg-light');
  } else {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('bg-light');
  }
}

// جعل الدوال متاحة عالمياً
if (typeof window !== 'undefined') {
  window.loadSettings = loadSettings;
  window.saveSettings = saveSettings;
  window.autoSaveSettings = autoSaveSettings;
  window.initSettingsPageEvents = initSettingsPageEvents;
  window.selectSound = selectSound;
  window.selectAppearance = selectAppearance;
  window.applyAppearance = applyAppearance;
}
