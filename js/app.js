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
                // تحديث تسمية القائمة المنسدلة
                updateHijriDropdownLabel();
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

            // تحديث البيانات بعد التأخير القصير
            setTimeout(() => {
                displayDate();
                calculateAndDisplayPrayerTimes();
            }, 50);
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

// دالة لتحديث تسمية القائمة المنسدلة
function updateHijriDropdownLabel() {
    const dropdownLabel = document.getElementById('dropdown-label');
    const statusElement = document.getElementById('current-adjustment');
    
    if (dropdownLabel) {
        if (hijriDateAdjustment > 0) {
            dropdownLabel.textContent = `+${hijriDateAdjustment} يوم`;
            dropdownLabel.className = 'text-success fw-bold';
        } else if (hijriDateAdjustment < 0) {
            dropdownLabel.textContent = `${hijriDateAdjustment} يوم`;
            dropdownLabel.className = 'text-danger fw-bold';
        } else {
            dropdownLabel.textContent = 'تعديل التاريخ';
            dropdownLabel.className = '';
        }
    }
    
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

// دالة مصححة لضبط التاريخ الهجري
function adjustHijriDate(days) {
    console.log(`ضبط التاريخ الهجري بقيمة: ${days}`);
    
    // لا تحميل من localStorage هنا - استخدم القيمة الحالية
    // hijriDateAdjustment متغير عام تم تحميله مسبقاً
    
    // تحديث الضبط بالقيمة المحددة
    hijriDateAdjustment += days;
    console.log(`الضبط الجديد: ${hijriDateAdjustment}`);
    
    // حفظ في localStorage
    localStorage.setItem('hijriDateAdjustment', hijriDateAdjustment.toString());
    
    // تحديث واجهة القائمة المنسدلة
    updateHijriDropdownLabel();
    
    // إعادة عرض التاريخ مع الضبط الجديد
    displayDate();
    
    // عرض رسالة تأكيد
    const message = days > 0 
        ? `تمت زيادة التاريخ الهجري بمقدار ${days} يوم`
        : `تم تنقيص التاريخ الهجري بمقدار ${Math.abs(days)} يوم`;
    
    showNotification(message, 'info');
    
    // إغلاق القائمة المنسدلة تلقائياً
    closeHijriDropdown();
}

// دالة لإعادة ضبط التاريخ الهجري
function resetHijriAdjustment() {
    console.log('إعادة ضبط التاريخ الهجري');
    hijriDateAdjustment = 0;
    localStorage.removeItem('hijriDateAdjustment');
    
    // تحديث واجهة القائمة المنسدلة
    updateHijriDropdownLabel();
    displayDate();
    
    showNotification('تمت إعادة ضبط التاريخ الهجري', 'success');
    
    // إغلاق القائمة المنسدلة تلقائياً
    closeHijriDropdown();
}

// دالة لإغلاق القائمة المنسدلة
function closeHijriDropdown() {
    const dropdownElement = document.getElementById('hijriAdjustmentDropdown');
    if (dropdownElement) {
        const dropdown = bootstrap.Dropdown.getInstance(dropdownElement);
        if (dropdown) {
            dropdown.hide();
        }
    }
}

// دالة لتحديث عرض حالة الضبط
function updateHijriAdjustmentDisplay() {
    updateHijriDropdownLabel();
}

// دالة لتحميل ضبط التاريخ الهجري عند بدء التطبيق
function loadHijriAdjustment() {
    const savedAdjustment = localStorage.getItem('hijriDateAdjustment');
    if (savedAdjustment !== null) {
        hijriDateAdjustment = parseInt(savedAdjustment);
        updateHijriDropdownLabel();
        console.log('تم تحميل ضبط التاريخ الهجري:', hijriDateAdjustment);
    }
}

function displayDate() {
    try {
        const gEl = document.getElementById('gregorian-date');
        const hEl = document.getElementById('hijri-date');

        if (!gEl || !hEl) {
            console.warn('⚠️ عناصر التاريخ غير موجودة بعد');
            return;
        }

        const now = new Date();

        // 📅 التاريخ الميلادي
        const gregorianDate = now.toLocaleDateString('ar-IQ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        gEl.textContent = gregorianDate;

        // 🕌 التاريخ الهجري (مع الضبط)
        const adjustedDate = new Date(now);
        adjustedDate.setDate(adjustedDate.getDate() + (hijriDateAdjustment || 0));

        const hijriDate = new Intl.DateTimeFormat(
            'ar-SA-u-ca-islamic',
            {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }
        ).format(adjustedDate);

        hEl.textContent = hijriDate;

        console.log('📅 ميلادي:', gregorianDate);
        console.log('🕌 هجري:', hijriDate);
        console.log('ضبط الهجري الحالي:', hijriDateAdjustment);

    } catch (e) {
        console.error('❌ خطأ في عرض التاريخ:', e);
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
    console.log(`${type}: ${message}`);
    
    // استخدام Bootstrap Toast إذا كان متاحاً
    const notificationElement = document.getElementById('notification');
    if (notificationElement) {
        const toastBody = notificationElement.querySelector('.toast-body');
        if (toastBody) {
            toastBody.textContent = message;
            
            // تغيير لون الخلفية حسب النوع
            if (type === 'error') {
                notificationElement.className = 'toast align-items-center text-white bg-danger border-0 position-fixed bottom-0 end-0 m-3';
            } else if (type === 'info') {
                notificationElement.className = 'toast align-items-center text-white bg-info border-0 position-fixed bottom-0 end-0 m-3';
            } else {
                notificationElement.className = 'toast align-items-center text-white bg-primary border-0 position-fixed bottom-0 end-0 m-3';
            }
            
            const toast = new bootstrap.Toast(notificationElement);
            toast.show();
        }
    } else {
        alert(message);
    }
}

// دالة لعرض الأخطاء
function showError(message) {
    showNotification(message, 'error');
}

// دالة لإضافة الألقاب الخاصة للمدن المقدسة
function addHonorificTitle(cityName) {
    if (!cityName || typeof cityName !== 'string') {
        return cityName || 'موقع غير معروف';
    }
    
    // تنظيف النص
    const cleanCity = cityName.trim();
    
    // إنشاء نسخة للبحث (إزالة التشكيل والفراغات)
    const searchCity = cleanCity.replace(/[ًٌٍَُِّْ]/g, '').replace(/\s+/g, ' ');
    
    // خريطة المدن المقدسة مع ألقابها
    const holyCitiesMap = [
        // المدن المقدسة في الإسلام
        { 
            names: ['مكة', 'مكه', 'مكـة', 'مكـه', 'مكا', 'مكاه'], 
            title: 'مكة المكرمة' 
        },
        { 
            names: ['المدينة', 'المدينه', 'المديـنة', 'المديـنه', 'المدينه المنورة', 'المدينة المنورة'], 
            title: 'المدينة المنورة' 
        },
        { 
            names: ['القدس', 'بيت المقدس', 'القدس الشريف'], 
            title: 'القدس الشريف' 
        },
        
        // المدن المقدسة عند الشيعة
        { 
            names: ['النجف', 'النجـف', 'النجف الاشرف', 'النجف الأشرف'], 
            title: 'النجف الأشرف' 
        },
        { 
            names: ['كربلاء', 'كربلاء', 'كربـلاء', 'كربـلاء', 'كربلاء المقدسة'], 
            title: 'كربلاء المقدسة' 
        },
        { 
            names: ['مشهد', 'مشـهد', 'مشهد المقدسة'], 
            title: 'مشهد المقدسة' 
        },
        { 
            names: ['قم', 'قـم', 'قم المقدسة'], 
            title: 'قم المقدسة' 
        },
        { 
            names: ['الكاظمية', 'الكاظميه', 'الكاظميـة', 'الكاظميـه', 'الكاظمية المقدسة'], 
            title: 'الكاظمية المقدسة' 
        },
        { 
            names: ['سامراء', 'سامرا', 'سامـراء', 'سامـرا', 'سامراء المقدسة'], 
            title: 'سامراء المقدسة' 
        },
        { 
            names: ['الكوفة', 'الكوفه', 'الكوفـة', 'الكوفـه', 'الكوفة المقدسة'], 
            title: 'الكوفة المقدسة' 
        }
    ];
    
    // التحقق من الاسم الكامل أولاً (بدون حساسية لحالة الأحرف)
    const searchCityLower = searchCity.toLowerCase();
    
    for (const city of holyCitiesMap) {
        for (const name of city.names) {
            const nameLower = name.toLowerCase();
            
            // مطابقة دقيقة
            if (searchCityLower === nameLower) {
                console.log(`✅ تم إضافة اللقب لمدينة (مطابقة دقيقة): ${cleanCity} → ${city.title}`);
                return city.title;
            }
            
            // مطابقة جزئية (إذا كان اسم المدينة يبدأ باسم مقدس)
            if (searchCityLower.startsWith(nameLower) || 
                searchCityLower.includes(` ${nameLower}`) ||
                searchCityLower.includes(nameLower + ' ')) {
                
                // تجنب التكرار (مثل "مكة المكرمة" لا تحتاج لتغيير)
                if (!searchCityLower.includes(city.title.toLowerCase())) {
                    console.log(`✅ تم إضافة اللقب لمدينة (مطابقة جزئية): ${cleanCity} → ${city.title}`);
                    return city.title;
                }
            }
        }
    }
    
    // إذا لم تكن المدينة في القائمة، أرجع الاسم الأصلي
    console.log(`ℹ️ المدينة "${cleanCity}" ليست في قائمة المدن المقدسة`);
    return cleanCity;
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

                // الحصول على اسم المدينة الأساسي
                let cityName = data.city || data.locality || data.principalSubdivision || "موقع غير معروف";
                
                // إضافة الألقاب الخاصة للمدن المقدسة
                cityName = addHonorificTitle(cityName);
                
                currentLocation.city = cityName;
                
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
        // إضافة اللقب الخاص إذا كانت المدينة مقدسة
        const cityWithTitle = addHonorificTitle(city);
        
        currentLocation.city = cityWithTitle;
        currentLocation.latitude = 31.9539;
        currentLocation.longitude = 44.3736;

        if (cityNameElement) {
            cityNameElement.textContent = cityWithTitle;
        }
        
        if (coordinatesElement) {
            coordinatesElement.textContent = `خط العرض: ${currentLocation.latitude.toFixed(4)}°, خط الطول: ${currentLocation.longitude.toFixed(4)}°`;
        }

        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
        settings.city = cityWithTitle;
        settings.latitude = currentLocation.latitude;
        settings.longitude = currentLocation.longitude;
        settings.cityName = cityWithTitle;
        localStorage.setItem('prayerSettings', JSON.stringify(settings));

        showNotification('تم حفظ الموقع اليدوي بنجاح');
        calculateAndDisplayPrayerTimes();
    } else {
        showError('يرجى إدخال اسم المدينة');
    }
}

// دالة لاختبار إضافة الألقاب للمدن
function testCityTitles() {
    const testCities = [
        'مكة',
        'مكه',
        'المدينة',
        'المدينه',
        'النجف',
        'كربلاء',
        'مشهد',
        'قم',
        'الكاظمية',
        'سامراء',
        'الكوفة',
        'بغداد', // ليست في القائمة
        'دمشق',   // ليست في القائمة
        'مكة المكرمة', // بالفعل كاملة
        'المدينة المنورة', // بالفعل كاملة
        'القدس',
        'النجف الأشرف' // بالفعل كاملة
    ];
    
    console.log('=== اختبار إضافة ألقاب المدن ===');
    testCities.forEach(city => {
        const result = addHonorificTitle(city);
        console.log(`"${city}" → "${result}"`);
    });
    console.log('=== نهاية الاختبار ===');
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
    const nahjPage = document.getElementById('nahj-page');
    if (!nahjPage) {
        console.warn('صفحة نهج البلاغة غير موجودة');
        return;
    }
    
    nahjPage.classList.remove('active');
    console.log('تهيئة نهج البلاغة...');
}

// دالة مصححة ومبسطة لتهيئة أحداث ضبط التاريخ الهجري
function initHijriAdjustmentEvents() {
    console.log('تهيئة أحداث ضبط التاريخ الهجري...');
    
    // طريقة 1: استخدام onclick مباشرة في HTML (الأفضل)
    // تأكد أن HTML يحتوي على:
    // <a class="dropdown-item" href="#" onclick="adjustHijriDate(-1); return false;">
    
    // طريقة 2: إضافة event listeners ديناميكياً
    const dropdownItems = document.querySelectorAll('.dropdown-item[data-hijri-adjust]');
    
    dropdownItems.forEach(item => {
        // إزالة أي event listeners سابقة
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        // إضافة listener جديدة
        newItem.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const adjustValue = this.getAttribute('data-hijri-adjust');
            if (adjustValue) {
                const days = parseInt(adjustValue);
                console.log(`ضبط الهجري بقيمة: ${days}`);
                adjustHijriDate(days);
            }
        });
    });
    
    // طريقة احتياطية: مراقبة جميع النقرات
    document.addEventListener('click', function(e) {
        const target = e.target.closest('[onclick*="adjustHijriDate"]');
        if (target) {
            console.log('تم النقر على زر ضبط الهجري');
        }
    });
}

// دالة تشخيصية
function debugHijriAdjustment() {
    console.log('=== تشخيص ضبط الهجري ===');
    console.log('الضبط الحالي:', hijriDateAdjustment);
    console.log('القيمة في localStorage:', localStorage.getItem('hijriDateAdjustment'));
    
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    console.log(`عدد عناصر القائمة: ${dropdownItems.length}`);
    
    dropdownItems.forEach((item, index) => {
        console.log(`العنصر ${index}:`, {
            text: item.textContent.trim(),
            onclick: item.getAttribute('onclick'),
            href: item.getAttribute('href'),
            'data-hijri-adjust': item.getAttribute('data-hijri-adjust')
        });
    });
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
    
    // تهيئة أحداث ضبط التاريخ الهجري
    initHijriAdjustmentEvents();
    
    // تفعيل دالة التشخيص للتحقق
    console.log('لتفعيل تشخيص ضبط الهجري، اكتب في الكونسول: debugHijriAdjustment()');

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

// تصدير الدوال للاستخدام في الكونسول (للتشخيص)
window.debugHijriAdjustment = debugHijriAdjustment;
window.testCityTitles = testCityTitles;
window.addHonorificTitle = addHonorificTitle;
