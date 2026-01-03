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
        imsak: '4:30',
        fajr: '5:00',
        sunrise: '6:00',
        dhuhr: '12:00',
        asr: '15:00',
        sunset: '18:00',
        maghrib: '18:05',
        isha: '19:00',
        midnight: '23:30'
    };
}

// دالة حساب أوقات الصلاة المعدلة
function getPrayerTimes(lat, lng, date, method) {
    if (typeof PrayTimes === 'undefined') {
        console.error('مكتبة الحساب غير متوفرة');
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
        const times = prayTimes.getTimes(date, coordinates, 3, 'auto', '24h');

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

        // التأكد من أن جميع الأوقات موجودة
        const result = {
            imsak: times.imsak || getDefaultPrayerTimes().imsak,
            fajr: times.fajr || getDefaultPrayerTimes().fajr,
            sunrise: times.sunrise || getDefaultPrayerTimes().sunrise,
            dhuhr: times.dhuhr || getDefaultPrayerTimes().dhuhr,
            asr: times.asr || getDefaultPrayerTimes().asr,
            sunset: times.sunset || getDefaultPrayerTimes().sunset,
            maghrib: times.maghrib || getDefaultPrayerTimes().maghrib,
            isha: times.isha || getDefaultPrayerTimes().isha,
            midnight: times.midnight || getDefaultPrayerTimes().midnight
        };
        
        console.log('أوقات الصلاة المحسوبة:', result);
        return result;
        
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

// دالة لتنسيق الوقت (للتوافق)
function formatTime(time, format) {
  if (!time || time === '--:--') return '--:--';
  
  try {
    let [hours, minutes] = time.split(':').map(Number);
    
    if (format === '24h') {
      return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    return `${hours}:${minutes.toString().padStart(2,'0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '--:--';
  }
}

// جعل الدوال متاحة عالمياً
if (typeof window !== 'undefined') {
  window.getPrayerTimes = getPrayerTimes;
  window.calculatePrayerTimes = getPrayerTimes;
  window.convertTimeToMinutes = convertTimeToMinutes;
  window.formatTime = formatTime;
  window.prayerNames = prayerNames;
}
