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
            fajr: times.fajr,
            sunrise: times.sunrise,
            dhuhr: times.dhuhr,
            asr: times.asr,
            sunset: times.sunset,
            maghrib: times.maghrib,
            isha: times.isha
        };
    } catch (error) {
        console.error('Error calculating prayer times:', error);
        return getDefaultPrayerTimes();
    }
}

function calculateAndDisplayPrayerTimes() {
  if (!currentLocation.latitude || !currentLocation.longitude) {
    document.getElementById('prayer-times').innerHTML = '<div class="text-center py-4">يرجى تحديد موقعك أولاً</div>';
    return;
  }

  try {
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    const calculationMethod = settings.calculationMethod || 'MWL';
    const timeFormat = settings.timeFormat || '24h';
    const roundingMethod = settings.roundingMethod || 'nearest';
    const showAsr = settings.showAsr !== undefined ? settings.showAsr : true;
    const showIsha = settings.showIsha !== undefined ? settings.showIsha : true;

    // تكوين مكتبة PrayTimes
    const prayTimes = new PrayTimes();
    prayTimes.setMethod(calculationMethod);
    
    // الحصول على أوقات الصلاة
    const date = new Date();
    const times = prayTimes.getTimes(date, [currentLocation.latitude, currentLocation.longitude], 3, 'auto', '24h');
    
    // عرض أوقات الصلاة في RecyclerView
    const prayers = [
      { id: 'fajr', name: 'الفجر', time: times.fajr, icon: 'bi-sun', alwaysShow: true },
      { id: 'sunrise', name: 'الشروق', time: times.sunrise, icon: 'bi-brightness-high', alwaysShow: true },
      { id: 'dhuhr', name: 'الظهر', time: times.dhuhr, icon: 'bi-brightness-high-fill', alwaysShow: true },
      { id: 'asr', name: 'العصر', time: times.asr, icon: 'bi-cloud-sun', alwaysShow: showAsr },
      { id: 'maghrib', name: 'المغرب', time: times.maghrib, icon: 'bi-sunset', alwaysShow: true },
      { id: 'isha', name: 'العشاء', time: times.isha, icon: 'bi-moon-stars', alwaysShow: showIsha }
    ];

    // إخفاء العناصر المخفية
    prayers.forEach(prayer => {
      const element = document.querySelector(`.prayer-item[data-prayer="${prayer.id}"]`);
      if (element) {
        element.style.display = prayer.alwaysShow ? 'flex' : 'none';
      }
    });

    // تحديث الأوقات مع التنسيق والتقريب
    prayers.forEach(prayer => {
      if (prayer.alwaysShow) {
        let formattedTime = applyRounding(prayer.time, roundingMethod);
        formattedTime = formatTime(formattedTime, timeFormat);
        
        const timeElement = document.getElementById(`${prayer.id}-time`);
        if (timeElement) {
          timeElement.textContent = formattedTime;
        }
      }
    });

    // تحديد الصلاة الحالية
    highlightCurrentPrayer(times);

  } catch (error) {
    console.error('Error calculating prayer times:', error);
    document.getElementById('prayer-times').innerHTML = '<div class="text-center py-4 text-danger">حدث خطأ في حساب أوقات الصلاة</div>';
  }
}

// دالة لتحديد الصلاة الحالية
function highlightCurrentPrayer(times) {
  // إزالة التحديد من جميع العناصر
  document.querySelectorAll('.prayer-item').forEach(item => {
    item.classList.remove('highlight');
  });

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // الوقت الحالي بالدقائق
  
  // تحويل أوقات الصلاة إلى دقائق للمقارنة
  const prayerTimes = [
    { name: 'fajr', time: convertTimeToMinutes(times.fajr) },
    { name: 'sunrise', time: convertTimeToMinutes(times.sunrise) },
    { name: 'dhuhr', time: convertTimeToMinutes(times.dhuhr) },
    { name: 'asr', time: convertTimeToMinutes(times.asr) },
    { name: 'maghrib', time: convertTimeToMinutes(times.maghrib) },
    { name: 'isha', time: convertTimeToMinutes(times.isha) }
  ];

  // تحديد الصلاة الحالية
  let currentPrayer = null;
  for (let i = 0; i < prayerTimes.length - 1; i++) {
    if (currentTime >= prayerTimes[i].time && currentTime < prayerTimes[i + 1].time) {
      currentPrayer = prayerTimes[i].name;
      break;
    }
  }
  
  // إذا كان الوقت بعد العشاء وقبل الفجر، فإن الصلاة الحالية هي العشاء
  if (!currentPrayer && (currentTime >= prayerTimes[prayerTimes.length - 1].time || currentTime < prayerTimes[0].time)) {
    currentPrayer = prayerTimes[prayerTimes.length - 1].name;
  }

  // تطبيق التحديد
  if (currentPrayer) {
    const currentElement = document.querySelector(`.prayer-item[data-prayer="${currentPrayer}"]`);
    if (currentElement) {
      currentElement.classList.add('highlight');
    }
  }
}

// دالة مساعدة لتحويل الوقت إلى دقائق
function convertTimeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function displayDate() {
  const now = new Date();
  const gregorian = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const islamic = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  const dateDisplay = document.getElementById('date-display');
  dateDisplay.textContent = `${gregorian} / ${islamic}`;
}

