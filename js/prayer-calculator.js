// إدارة حسابات أوقات الصلاة
const prayerNames = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  sunset: 'الغروب',
  maghrib: 'المغرب',
  isha: 'العشاء'
};

// ترتيب الصلوات حسب الوقت
const prayerOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha'];

let currentLocation = {
  latitude: null,
  longitude: null,
  city: null
};

// دالة مساعدة لإرجاع أوقات الصلاة الافتراضية
function getDefaultPrayerTimes() {
    return {
        fajr: '5:00',
        sunrise: '6:00',
        dhuhr: '12:00',
        asr: '15:00',
        sunset: '18:00',
        maghrib: '18:05',
        isha: '19:00'
    };
}

// دالة مساعدة لتحويل الوقت من نص إلى دقائق
function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// دالة مساعدة لتحويل الدقائق إلى نص وقت
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// دالة حساب أوقات الصلاة المعدلة والمحسنة
function getPrayerTimes(lat, lng, date, method) {
    if (typeof PrayTimes === 'undefined') {
        console.error('مكتبة PrayTimes غير متوفرة');
        return getDefaultPrayerTimes();
    }

    try {
        const prayTimes = new PrayTimes();

        // إعداد الطريقة الحسابية
        if (method === 'Hadi') {
            // إعدادات مخصصة لتقويم الهادي
            prayTimes.setMethod('MWL');
            prayTimes.adjust({
                fajr: 18,    // 18 درجة للفجر
                maghrib: 4,  // 4 درجات للمغرب
                isha: 18     // 18 درجة للعشاء
            });
        } else {
            prayTimes.setMethod(method || 'MWL');
        }

        const coordinates = [lat, lng, 0];
        const times = prayTimes.getTimes(date, coordinates, 'auto', 'auto', '24h');

        // التحقق من صحة الأوقات وإصلاحها إذا لزم الأمر
        const validatedTimes = validateAndFixPrayerTimes(times);

        return validatedTimes;
    } catch (error) {
        console.error('خطأ في حساب أوقات الصلاة:', error);
        return getDefaultPrayerTimes();
    }
}

// دالة للتحقق من صحة الأوقات وإصلاحها
function validateAndFixPrayerTimes(times) {
    const fixedTimes = { ...times };
    
    // تأكد من أن المغرب بعد الغروب مباشرة (دقيقة واحدة بعد الغروب)
    const sunsetMinutes = timeToMinutes(times.sunset);
    const maghribMinutes = timeToMinutes(times.maghrib);
    
    if (maghribMinutes <= sunsetMinutes) {
        fixedTimes.maghrib = minutesToTime(sunsetMinutes + 1);
    }
    
    // تأكد من أن الشروق بعد الفجر
    const fajrMinutes = timeToMinutes(times.fajr);
    const sunriseMinutes = timeToMinutes(times.sunrise);
    
    if (sunriseMinutes <= fajrMinutes) {
        fixedTimes.sunrise = minutesToTime(fajrMinutes + 5); // 5 دقائق بعد الفجر
    }
    
    // تأكد من أن العصر بعد الظهر
    const dhuhrMinutes = timeToMinutes(times.dhuhr);
    const asrMinutes = timeToMinutes(times.asr);
    
    if (asrMinutes <= dhuhrMinutes) {
        fixedTimes.asr = minutesToTime(dhuhrMinutes + 60); // ساعة بعد الظهر
    }
    
    // تأكد من أن العشاء بعد المغرب
    const ishaMinutes = timeToMinutes(times.isha);
    const maghribFixedMinutes = timeToMinutes(fixedTimes.maghrib);
    
    if (ishaMinutes <= maghribFixedMinutes) {
        fixedTimes.isha = minutesToTime(maghribFixedMinutes + 60); // ساعة بعد المغرب
    }
    
    return fixedTimes;
}

// دالة تطبيق التقريب المحسنة
function applyRounding(time, method) {
    if (!time || time === '') return '00:00';
    
    try {
        let [hours, minutes] = time.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes)) {
            return '00:00';
        }
        
        switch(method) {
            case 'nearest':
                minutes = Math.round(minutes / 5) * 5;
                break;
            case 'up':
                minutes = Math.ceil(minutes / 5) * 5;
                break;
            case 'down':
                minutes = Math.floor(minutes / 5) * 5;
                break;
            case 'none':
            default:
                // بدون تقريب
                break;
        }
        
        // التعامل مع تجاوز الدقائق 60
        if (minutes >= 60) {
            minutes = 0;
            hours += 1;
            if (hours >= 24) hours = 0;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
        console.error('خطأ في تطبيق التقريب:', error);
        return time;
    }
}

// دالة تنسيق الوقت المحسنة
function formatTime(time, format) {
    if (!time || time === '') return '00:00';
    
    try {
        let [hours, minutes] = time.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes)) {
            return '00:00';
        }
        
        switch(format) {
            case '24h':
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                
            case '12h':
                const period = hours >= 12 ? 'م' : 'ص';
                hours = hours % 12 || 12;
                return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
                
            case '12H':
                hours = hours % 12 || 12;
                return `${hours}:${minutes.toString().padStart(2, '0')}`;
                
            default:
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    } catch (error) {
        console.error('خطأ في تنسيق الوقت:', error);
        return '00:00';
    }
}

// دالة حساب وعرض أوقات الصلاة المحسنة
function calculateAndDisplayPrayerTimes() {
    try {
        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
        const method = settings.calculationMethod || 'MWL';
        const timeFormat = settings.timeFormat || '24h';
        const roundingMethod = settings.roundingMethod || 'nearest';

        // استخدام الموقع الحالي أو الافتراضي
        let lat = currentLocation.latitude || settings.latitude || 31.9539; // النجف كموقع افتراضي
        let lng = currentLocation.longitude || settings.longitude || 44.3736;

        // الحصول على أوقات الصلاة
        const today = new Date();
        const times = getPrayerTimes(lat, lng, today, method);

        // تحديد الصلوات التي سيتم عرضها
        const prayersToShow = ['fajr', 'sunrise', 'dhuhr'];

        // إضافة العصر إذا كان مفعلاً
        if (settings.showAsr !== false) { // القيمة الافتراضية true
            prayersToShow.push('asr');
        }

        prayersToShow.push('sunset', 'maghrib');

        // إضافة العشاء إذا كان مفعلاً
        if (settings.showIsha !== false) { // القيمة الافتراضية true
            prayersToShow.push('isha');
        }

        const prayerTimesElement = document.getElementById('prayer-times');
        if (!prayerTimesElement) {
            console.error('عنصر عرض أوقات الصلاة غير موجود');
            return;
        }

        // إنشاء HTML لعرض أوقات الصلاة
        let html = '';
        
        for (const key of prayersToShow) {
            if (!times[key]) {
                console.warn(`وقت الصلاة ${key} غير متوفر`);
                continue;
            }
            
            let rounded = applyRounding(times[key], roundingMethod);
            let formatted = formatTime(rounded, timeFormat);

            html += `
                <div class="card mb-3 shadow-sm prayer-card">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <h5 class="card-title text-primary mb-0">${prayerNames[key] || key}</h5>
                        <span class="fs-5 fw-bold">${formatted}</span>
                    </div>
                </div>
            `;
        }
        
        prayerTimesElement.innerHTML = html;

        // تحديث اسم المدينة إذا كان متوفراً
        const cityNameElement = document.getElementById('city-name');
        if (cityNameElement) {
            const displayCity = currentLocation.city || settings.cityName || 'النجف';
            cityNameElement.textContent = displayCity;
        }

    } catch (error) {
        console.error('خطأ في حساب وعرض أوقات الصلاة:', error);
        
        // عرض رسالة خطأ للمستخدم
        const prayerTimesElement = document.getElementById('prayer-times');
        if (prayerTimesElement) {
            prayerTimesElement.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="bi bi-exclamation-triangle"></i>
                    <br>
                    حدث خطأ في حساب أوقات الصلاة
                    <br>
                    <small>جاري استخدام الأوقات الافتراضية</small>
                </div>
            `;
        }
        
        // استخدام الأوقات الافتراضية كحل بديل
        setTimeout(() => {
            displayDefaultPrayerTimes();
        }, 1000);
    }
}

// دالة لعرض الأوقات الافتراضية في حالة الخطأ
function displayDefaultPrayerTimes() {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const timeFormat = settings.timeFormat || '24h';
    const roundingMethod = settings.roundingMethod || 'nearest';
    
    const defaultTimes = getDefaultPrayerTimes();
    const prayersToShow = ['fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha'];
    
    let html = '';
    for (const key of prayersToShow) {
        let rounded = applyRounding(defaultTimes[key], roundingMethod);
        let formatted = formatTime(rounded, timeFormat);

        html += `
            <div class="card mb-3 shadow-sm prayer-card">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <h5 class="card-title text-primary mb-0">${prayerNames[key]}</h5>
                    <span class="fs-5 fw-bold">${formatted}</span>
                </div>
            </div>
        `;
    }
    
    const prayerTimesElement = document.getElementById('prayer-times');
    if (prayerTimesElement) {
        prayerTimesElement.innerHTML = html;
    }
}

// دالة عرض التاريخ المحسنة
function displayDate() {
    try {
        const now = new Date();
        
        // التاريخ الميلادي
        const gregorianOptions = { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        };
        const gregorian = now.toLocaleDateString('ar-EG', gregorianOptions);
        
        // التاريخ الهجري
        const islamicOptions = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            calendar: 'islamic'
        };
        const islamic = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', islamicOptions).format(now);
        
        const dateDisplay = document.getElementById('date-display');
        if (dateDisplay) {
            dateDisplay.textContent = `${gregorian} - ${islamic}`;
        }
    } catch (error) {
        console.error('خطأ في عرض التاريخ:', error);
        
        const dateDisplay = document.getElementById('date-display');
        if (dateDisplay) {
            const now = new Date();
            dateDisplay.textContent = now.toLocaleDateString('ar-EG');
        }
    }
}

// دالة للحصول على وقت الصلاة التالية
function getNextPrayerTime() {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const method = settings.calculationMethod || 'MWL';
    
    let lat = currentLocation.latitude || settings.latitude || 31.9539;
    let lng = currentLocation.longitude || settings.longitude || 44.3736;
    
    const now = new Date();
    const times = getPrayerTimes(lat, lng, now, method);
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    let nextPrayer = null;
    let nextPrayerTime = null;
    
    for (const prayer of prayerOrder) {
        if (times[prayer]) {
            const [hours, minutes] = times[prayer].split(':').map(Number);
            const prayerTime = hours * 60 + minutes;
            
            if (prayerTime > currentTime) {
                nextPrayer = prayer;
                nextPrayerTime = prayerTime;
                break;
            }
        }
    }
    
    // إذا لم نجد صلاة تالية في اليوم الحالي، نعود لأول صلاة في اليوم التالي
    if (!nextPrayer) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTimes = getPrayerTimes(lat, lng, tomorrow, method);
        nextPrayer = 'fajr';
        nextPrayerTime = timeToMinutes(tomorrowTimes.fajr) + 24 * 60; // إضافة 24 ساعة
    }
    
    return {
        prayer: nextPrayer,
        name: prayerNames[nextPrayer],
        time: nextPrayerTime - currentTime // الوقت المتبقي بالدقائق
    };
}

// تصدير الدوال للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getPrayerTimes,
        calculateAndDisplayPrayerTimes,
        displayDate,
        getNextPrayerTime,
        prayerNames,
        prayerOrder
    };
}
