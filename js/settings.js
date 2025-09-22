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
