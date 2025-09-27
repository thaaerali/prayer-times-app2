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
  
  // تحميل إعدادات الصلاة فقط إذا كانت العناصر موجودة
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

  // تحميل إعدادات الصلاة (فقط إذا كانت العناصر موجودة)
  if (calculationMethodSelect && prayerSettings.calculationMethod) calculationMethodSelect.value = prayerSettings.calculationMethod;
  if (timeFormatSelect && prayerSettings.timeFormat) timeFormatSelect.value = prayerSettings.timeFormat;
  if (roundingMethodSelect && prayerSettings.roundingMethod) roundingMethodSelect.value = prayerSettings.roundingMethod;
  if (manualLocation && prayerSettings.city) manualLocation.value = prayerSettings.city;
  
  if (prayerSettings.latitude) currentLocation.latitude = prayerSettings.latitude;
  if (prayerSettings.longitude) currentLocation.longitude = prayerSettings.longitude;
  if (prayerSettings.cityName) currentLocation.city = prayerSettings.cityName;

  if (toggleAsr) toggleAsr.checked = prayerSettings.showAsr !== undefined ? prayerSettings.showAsr : true;
  if (toggleIsha) toggleIsha.checked = prayerSettings.showIsha !== undefined ? prayerSettings.showIsha : true;

  // تحميل إعدادات الإشعارات (فقط إذا كانت العناصر موجودة)
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

  // إضافة مستمعي الأحداث للحفظ التلقائي (فقط إذا كانت الصفحة نشطة)
  if (document.getElementById('settings-page').classList.contains('active')) {
    initAutoSaveEvents();
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

  // التحقق من وجود العناصر قبل استخدامها
  if (!calculationMethodSelect || !timeFormatSelect || !roundingMethodSelect) {
    console.log('عناصر الإعدادات غير موجودة، تأجيل الحفظ');
    return;
  }

  // حفظ إعدادات الصلاة والموقع بشكل منفصل
  const prayerSettings = {
    calculationMethod: calculationMethodSelect.value,
    timeFormat: timeFormatSelect.value,
    roundingMethod: roundingMethodSelect.value,
    city: manualLocation ? manualLocation.value : '',
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    cityName: currentLocation.city,
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
  console.log('تهيئة أحداث الحفظ التلقائي...');
  
  // قائمة بجميع عناصر الإعدادات التي تحتاج event listeners
  const settingsElements = [
    'calculation-method', 'time-format', 'rounding-method', 'manual-location',
    'toggle-asr', 'toggle-isha', 'toggle-fajr-notification', 'toggle-dhuhr-notification',
    'toggle-asr-notification', 'toggle-maghrib-notification', 'toggle-isha-notification',
    'toggle-fajr-adhan', 'toggle-dhuhr-adhan', 'toggle-asr-adhan', 'toggle-maghrib-adhan',
    'toggle-isha-adhan', 'volume-level'
  ];

  settingsElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      // إزالة أي event listeners سابقة لمنع التكرار
      element.replaceWith(element.cloneNode(true));
      
      // إضافة event listener جديدة
      const newElement = document.getElementById(id);
      newElement.addEventListener('change', autoSaveSettings);
    } else {
      console.warn(`العنصر ${id} غير موجود، تم تخطيه`);
    }
  });

  // تهيئة أحداث الصوت والمظهر
  initSoundEvents();
  initAppearanceEvents();
}

function saveSettings() {
  // الحصول على العناصر من DOM مع التحقق من وجودها
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

  // الحصول على القيم المحددة
  const selectedSound = document.querySelector('#adhan-sounds-list .sound-item.active')?.dataset.sound || 'abdul-basit';
  const selectedAppearance = document.querySelector('#appearance-list .sound-item.active')?.dataset.appearance || 'auto';

  // حفظ إعدادات الصلاة والموقع بشكل منفصل
  const prayerSettings = {
    calculationMethod: calculationMethodSelect ? calculationMethodSelect.value : 'MWL',
    timeFormat: timeFormatSelect ? timeFormatSelect.value : '24h',
    roundingMethod: roundingMethodSelect ? roundingMethodSelect.value : 'nearest',
    city: manualLocation ? manualLocation.value : '',
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    cityName: currentLocation.city,
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

  showNotification('تم حفظ الإعدادات بنجاح');
  
  // إعادة حساب وعرض أوقات الصلاة
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

// استدعاء دالة الترحيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  migrateOldSettings();
  loadSettings();
});

// تهيئة أحداث الحفظ عند فتح صفحة الإعدادات
function initSettingsPageEvents() {
  // تهيئة الأحداث فقط إذا كانت صفحة الإعدادات نشطة
  if (document.getElementById('settings-page').classList.contains('active')) {
    console.log('تهيئة أحداث صفحة الإعدادات...');
    initAutoSaveEvents();
  }
}

// استدعاء تهيئة الأحداث عند التنقل إلى صفحة الإعدادات
function onSettingsPageOpen() {
  // تأخير بسيط لضمان تحميل DOM
  setTimeout(() => {
    initSettingsPageEvents();
    loadSettings(); // إعادة تحميل الإعدادات للتأكد من أنها محدثة
  }, 100);
}

// إزالة الأحداث القديمة المتعلقة بالنافذة المنبثقة
// حذف هذه الأجزاء لأننا لم نعد نستخدم النافذة المنبثقة:
/*
document.getElementById('settings-modal').addEventListener('shown.bs.modal', function() {
  initAutoSaveEvents();
  initSoundEvents();
  initAppearanceEvents();
});

document.getElementById('settings-modal').addEventListener('hidden.bs.modal', function() {
  autoSaveSettings();
  calculateAndDisplayPrayerTimes();
  if (typeof startNotificationChecker === 'function') {
    startNotificationChecker();
  }
});
*/

// تحديث دالة togglePages في app.js لاستدعاء تهيئة الأحداث
// أضف هذا في دالة togglePages في app.js:
/*
function togglePages() {
    // ... الكود الحالي ...
    
    if (settingsPage.classList.contains('active')) {
        onSettingsPageOpen(); // تهيئة أحداث الإعدادات
    }
}
*/
