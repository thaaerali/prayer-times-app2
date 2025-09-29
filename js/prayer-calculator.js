// إدارة حسابات أوقات الصلاة
const prayerNames = {
  imsak: 'الإمساك',
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  sunset: 'الغروب',
  maghrib: 'المغرب',
  isha: 'العشاء',
  midnight: 'منتصف الليل'
};

// ترتيب الصلوات حسب الوقت
const prayerOrder = ['imsak','fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha', 'midnight'];

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

// دالة حساب أوقات الصلاة المعدلة
function getPrayerTimes(lat, lng, date, method) {
    if (typeof PrayTimes === 'undefined') {
        showError('مكتبة الحساب غير متوفرة');
        return getDefaultPrayerTimes();
    }

    try {
        const prayTimes = new PrayTimes();

        // إذا كانت الطريقة Hadi، استخدم إعدادات مخصصة
        if (method === 'Hadi') {
            prayTimes.setMethod('MWL');
            prayTimes.adjust({
                fajr: 18,
                maghrib: 4,  // 4 درجات للمغرب
                isha: 18
            });
        } else {
            prayTimes.setMethod(method || 'MWL');
        }

        const coordinates = [lat, lng, 0];
        const times = prayTimes.getTimes(date, coordinates);

        // تأكد من أن المغرب بعد الغروب
        if (times.maghrib === times.sunset) {
            const [hours, minutes] = times.sunset.split(':').map(Number);
            let newMinutes = minutes + 1;
            let newHours = hours;

            if (newMinutes >= 60) {
                newMinutes = 0;
                newHours += 1;
                if (newHours >= 24) newHours = 0;
            }

            times.maghrib = `${newHours}:${newMinutes.toString().padStart(2, '0')}`;
        }

        return {
            imsak: times.imsak,
            fajr: times.fajr,
            sunrise: times.sunrise,
            dhuhr: times.dhuhr,
            asr: times.asr,
            sunset: times.sunset,
            maghrib: times.maghrib,
            isha: times.isha,
            midnight: times.midnight
        };
    } catch (error) {
        console.error('Error calculating prayer times:', error);
        return getDefaultPrayerTimes();
    }
}

// دالة مساعدة لتحويل الوقت إلى دقائق
function convertTimeToMinutes(timeString) {
  if (!timeString || timeString === '--:--') return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}





