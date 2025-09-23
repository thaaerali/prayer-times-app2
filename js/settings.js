function saveSettings() {
  // الحصول على العناصر من DOM
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
