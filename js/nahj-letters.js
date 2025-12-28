// nahj-letters.js - نسخة محسنة مع معالجة الملفات المفقودة
class NahjLetters {
    constructor(baseURL = 'https://raw.githubusercontent.com/thaaerali/nahj-data/main/') {
        this.baseURL = baseURL;
        this.lettersIndexURL = this.baseURL + 'letters/letters-index.json';
        this.currentLetter = null;
        this.lettersIndex = [];
        this.currentLetterId = 1;
        this.totalLetters = 79;
        
        // عناصر DOM الخاصة بالرسائل
        this.elements = {
            lettersContent: null,
            lettersNav: null,
            letterContainer: null
        };
    }
    
    async init(containerId = 'nahj-content') {
        try {
            console.log('📜 جاري تهيئة قسم الرسائل...');
            await this.loadLettersIndex();
            
            if (containerId) {
                this.setupContainer(containerId);
            }
            
            return this;
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة قسم الرسائل:', error);
            return this;
        }
    }
    
    async loadLettersIndex() {
        try {
            console.log('📋 جاري تحميل فهرس الرسائل...');
            
            // محاولة تحميل الفهرس من GitHub
            const response = await fetch(this.lettersIndexURL);
            
            if (!response.ok) {
                // إذا لم يكن الفهرس موجوداً، أنشئ فهرساً افتراضياً
                console.log('⚠️ فهرس الرسائل غير موجود، إنشاء فهرس افتراضي...');
                this.createDefaultIndex();
                return this.lettersIndex;
            }
            
            const data = await response.json();
            this.lettersIndex = data.letters_index || [];
            this.totalLetters = this.lettersIndex.length;
            
            console.log(`✅ تم تحميل فهرس الرسائل: ${this.totalLetters} رسالة`);
            return this.lettersIndex;
            
        } catch (error) {
            console.error('❌ خطأ في تحميل فهرس الرسائل:', error);
            this.createDefaultIndex();
            return this.lettersIndex;
        }
    }
    
    createDefaultIndex() {
        // إنشاء فهرس افتراضي إذا لم يكن الفهرس موجوداً
        console.log('🔨 إنشاء فهرس افتراضي للرسائل...');
        
        this.lettersIndex = [
            {
                id: 1,
                file: 'letters/letter-001.json',
                title: 'الرسالة الأولى',
                subtitle: 'كتاب لأهل الكوفة عند مسيره من المدينة إلى البصرة',
                description: 'رسالة من الإمام علي إلى أهل الكوفة عند مسيره من المدينة إلى البصرة',
                recipient: 'أهل الكوفة',
                occasion: 'عند مسيره من المدينة إلى البصرة',
                year: '36 هـ',
                category: 'السياسة وإدارة الدولة',
                page_start: 350,
                page_end: 352,
                total_footnotes: 5,
                total_sections: 4,
                has_content: true,
                keywords: ['الكوفة', 'البصرة', 'الجمل', 'البيعة', 'عثمان']
            },
            {
                id: 2,
                file: 'letters/letter-002.json',
                title: 'الرسالة الثانية',
                subtitle: 'كتاب إلى معاوية بن أبي سفيان',
                recipient: 'معاوية بن أبي سفيان',
                category: 'السياسة',
                page_start: 353,
                page_end: 357,
                has_content: false
            },
            {
                id: 3,
                file: 'letters/letter-003.json',
                title: 'الرسالة الثالثة',
                subtitle: 'كتاب إلى عماله على الأمصار',
                recipient: 'عمال الأمصار',
                category: 'الإدارة والولاية',
                page_start: 358,
                page_end: 360,
                has_content: false
            },
             {  "id": 53,
                "file": "letters/letter-053.json",
                "title": "رسالة الثالثة والخمسون (عهد مالك الأشتر الكامل)",
                "subtitle": "عهد الإمام علي (ع) إلى مالك بن الحارث الأشتر النخعي لما ولاه على مصر وأعمالها أشهر وأطول وأهم وثيقة سياسية وإدارية في التاريخ الإسلامي، كتبها الإمام علي (ع) لمالك الأشتر النخعي عند تعيينه والياً على مصر. يعتبر هذا العهد دستوراً شاملاً للحكم الرشيد، ويغطي جميع جوانب الإدارة: من الأسس الأخلاقية والروحية، إلى السياسة الداخلية والخارجية، والاقتصاد، والقضاء، والجيش، والعلاقات الاجتماعية. يحتوي على 79 فقرة تغطي فلسفة الحكم، إدارة الوزراء والمستشارين، النظام الطبقي، الجيش، القضاء، الموظفين، التجار والصناع، رعاية الفقراء، السياسة الخارجية، الأخلاق الحاكمة، والوصايا الختامية. يعتبر مرجعاً أساسياً في الفكر السياسي الإسلامي والإنساني",
                "description": "أشهر وأطول وأهم وثيقة سياسية وإدارية في التاريخ الإسلامي، كتبها الإمام علي (ع) لمالك الأشتر النخعي عند تعيينه والياً على مصر. يعتبر هذا العهد دستوراً شاملاً للحكم الرشيد، ويغطي جميع جوانب الإدارة: من الأسس الأخلاقية والروحية، إلى السياسة الداخلية والخارجية، والاقتصاد، والقضاء، والجيش، والعلاقات الاجتماعية. يحتوي على 79 فقرة تغطي فلسفة الحكم، إدارة الوزراء والمستشارين، النظام الطبقي، الجيش، القضاء، الموظفين، التجار والصناع، رعاية الفقراء، السياسة الخارجية، الأخلاق الحاكمة، والوصايا الختامية. يعتبر مرجعاً أساسياً في الفكر السياسي الإسلامي والإنساني.",
                "recipient": "مالك بن الحارث الأشتر النخعي (قائد عسكري وسياسي بارز)",
                "occasion": "تعيين مالك الأشتر والياً على مصر بعد اضطراب أمر محمد بن أبي بكر.",
                "year": "38 هـ (سنة 658 م تقريباً)",
                "historical_context": "يعد هذا العهد من أشهر الوثائق السياسية في التاريخ الإسلامي والعالمي. كتبه الإمام (ع) في فترة حرجة من خلافته، عندما كانت مصر تعاني من اضطرابات. العهد ليس مجرد تعليمات لوالٍ، بل هو فلسفة كاملة للحكم تجمع بين المبادئ الإسلامية والقيم الإنسانية والحكمة العملية. تأثر به العديد من المفكرين والفلاسفة عبر التاريخ، واعتبره الكثيرون أول دستور مكتوب للحكم الرشيد. يتكون العهد من 79 فقرة تغطي السياسة الداخلية والخارجية، والاقتصاد، والقضاء، والجيش، والأخلاق الحاكمة. يعتبر ذروة الفكر السياسي الإسلامي ويقدم نموذجاً للحكومة العادلة التي تجمع بين العدالة والرحمة، والقوة والحكمة، والروحانية والعملية.",
                "category": "العهود الدستورية",
                "has_content": true,
                "keywords": ["مالك الأشتر", "مصر", "العهد", "الدستور الإسلامي", "الحكم الرشيد", "السياسة الشرعية", "العدالة", "الرعية", "الإدارة", "الخلافة", "الأشتر النخعي", "الولاية", "الوزراء", "الجيش", "القضاء", "الاقتصاد", "التجار", "الفقراء", "الصلح", "العهود", "الأخلاق الحاكمة", "الختام"],
                "length": "79 فقرة",
                "parts": 6,
                "footnotes_count": 140
 
       }
        ];
        
        this.totalLetters = this.lettersIndex.length;
        console.log(`✅ تم إنشاء فهرس افتراضي: ${this.totalLetters} رسالة`);
    }
    
    async loadLetter(letterId) {
        try {
            console.log(`📥 جاري تحميل الرسالة ${letterId}...`);
            
            // البحث عن الرسالة في الفهرس
            const letterInfo = this.lettersIndex.find(l => l.id === letterId);
            if (!letterInfo) {
                throw new Error(`الرسالة ${letterId} غير موجودة في الفهرس`);
            }
            
            // إذا كان الملف موجوداً على GitHub
            if (letterInfo.has_content !== false) {
                const letterURL = this.baseURL + letterInfo.file;
                const response = await fetch(letterURL);
                
                if (response.ok) {
                    this.currentLetter = await response.json();
                    this.currentLetterId = letterId;
                    
                    console.log(`✅ تم تحميل الرسالة: ${this.currentLetter.metadata.title}`);
                    return this.currentLetter;
                }
            }
            
            // إذا لم يكن الملف موجوداً، أنشئ رسالة افتراضية
            console.log(`⚠️ ملف الرسالة ${letterId} غير موجود، إنشاء محتوى افتراضي...`);
            this.createDefaultLetter(letterId, letterInfo);
            
            return this.currentLetter;
            
        } catch (error) {
            console.error(`❌ خطأ في تحميل الرسالة ${letterId}:`, error);
            this.createDefaultLetter(letterId);
            return this.currentLetter;
        }
    }
    
    createDefaultLetter(letterId, letterInfo = null) {
        // إنشاء رسالة افتراضية
        const defaultTexts = [
            {
                id: 1,
                text: "من عبد الله علي أمير المؤمنين إلى أهل الكوفة جبهة الأنصار وسنام العرب.",
                footnotes: [
                    {
                        id: 1,
                        text: "شبههم بالجبهة من حيث الكرم، وبالسنام من حيث الرفعة.",
                        page: 350
                    }
                ]
            },
            {
                id: 2,
                text: "أما بعد، فإني أخبركم عن أمر عثمان حتى يكون سمعه كعيانه، إن الناس طعنوا عليه فكنت رجلاً من المهاجرين أكثر استعتابه وأقل عتابه.",
                footnotes: [
                    {
                        id: 1,
                        text: "استعتابه: استرضاؤه. والوجيف: ضرب من سير الخيل والإبل سريع.",
                        page: 350
                    }
                ]
            },
            {
                id: 3,
                text: "وكان طلحة والزبير أهون سيرهما فيه الوجيف، وأرفق حدائهما العنيف، وكان من عائشة فيه فلتة غضب، فأتيح له قوم فقتلوه.",
                footnotes: [
                    {
                        id: 1,
                        text: "قيل: إن أم أمير المؤمنين أخرجت نعلي رسول الله صلى الله عليه وآله وسلم وقميصه من تحت ستارها، وعثمان رضي الله عنه على المنبر، وقالت: هذان نعلا رسول الله وقميصه لم يبلا، وقد بدلت من دينه، وغيرت من سنته.",
                        page: 350
                    }
                ]
            },
            {
                id: 4,
                text: "وبايعني الناس غير مستكرهين ولا مجبرين، بل طائعين مخيرين. واعلموا أن دار الهجرة قد قلعت بأهلها وقلعوا بها، وجاشت [جيش] المرجل، وقامت الفتنة على القطب، فأسرعوا إلى أميركم، وبادروا جهاد عدوكم، إن شاء الله.",
                footnotes: [
                    {
                        id: 1,
                        text: "دار الهجرة: المدينة. وقلع المكان بأهله: نبذهم فلم يصلح لاستيطانهم. وجاشت: غلت، والجيش: الغليان. والمرجل - كمنبر -: القدر.",
                        page: 351
                    }
                ]
            }
        ];
        
        this.currentLetter = {
            metadata: {
                title: letterInfo?.title || `الرسالة ${letterId}`,
                author: 'الإمام علي بن أبي طالب (ع)',
                editor: 'الشيخ محمد عبده',
                work: `الرسالة ${letterId}`,
                total_footnotes: 5,
                total_sections: 4,
                compiled_date: '2024-01-01',
                page_start: letterInfo?.page_start || 350,
                page_end: letterInfo?.page_end || 352,
                categories: letterInfo?.category ? [letterInfo.category] : ['السياسة وإدارة الدولة']
            },
            content: {
                letter_id: letterId,
                title: letterInfo?.title || `الرسالة ${letterId}`,
                description: letterInfo?.description || 'رسالة من الإمام علي بن أبي طالب',
                recipient: letterInfo?.recipient || 'غير محدد',
                occasion: letterInfo?.occasion || 'غير محدد',
                sections: defaultTexts
            }
        };
        
        this.currentLetterId = letterId;
        console.log(`✅ تم إنشاء رسالة افتراضية: ${this.currentLetter.metadata.title}`);
    }
    
    setupContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ العنصر ${containerId} غير موجود`);
            return;
        }
        
        // إنشاء واجهة عرض الرسائل
        container.innerHTML = `
            <div class="letters-container">
                <!-- شريط التنقل للرسائل -->
                <div class="letters-navigation card shadow-sm mb-4">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-4">
                                <div class="d-flex align-items-center">
                                    <button class="btn btn-sm btn-outline-primary me-2" id="prev-letter-btn" disabled>
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                    
                                    <div class="letter-info">
                                        <h6 class="mb-0" id="current-letter-title">جاري التحميل...</h6>
                                        <small class="text-muted" id="letter-counter">-- / ${this.totalLetters}</small>
                                    </div>
                                    
                                    <button class="btn btn-sm btn-outline-primary ms-2" id="next-letter-btn" disabled>
                                        <i class="bi bi-chevron-left"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="col-md-5">
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text">انتقل إلى</span>
                                    <input type="number" 
                                           class="form-control" 
                                           id="goto-letter-input" 
                                           min="1" 
                                           max="${this.totalLetters}" 
                                           placeholder="رقم الرسالة">
                                    <button class="btn btn-primary" id="goto-letter-btn">
                                        <i class="bi bi-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="col-md-3 text-end">
                                <div class="dropdown">
                                    <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                                            type="button" 
                                            id="letters-list-btn"
                                            data-bs-toggle="dropdown">
                                        <i class="bi bi-list-ul"></i> فهرس الرسائل (${this.totalLetters})
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-end" id="letters-list-menu">
                                        <div class="px-3 py-2">
                                            <small class="text-muted">جاري تحميل الفهرس...</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- حاوية محتوى الرسالة -->
                <div id="letter-content-container"></div>
            </div>
        `;
        
        // تحديث مراجع عناصر DOM
        this.updateDOMElements();
        this.setupNavigationEvents();
        
        // تحميل قائمة الرسائل
        this.loadLettersList();
    }
    
    updateDOMElements() {
        this.elements.prevLetterBtn = document.getElementById('prev-letter-btn');
        this.elements.nextLetterBtn = document.getElementById('next-letter-btn');
        this.elements.currentTitle = document.getElementById('current-letter-title');
        this.elements.letterCounter = document.getElementById('letter-counter');
        this.elements.gotoInput = document.getElementById('goto-letter-input');
        this.elements.gotoBtn = document.getElementById('goto-letter-btn');
        this.elements.lettersList = document.getElementById('letters-list-menu');
        this.elements.letterContainer = document.getElementById('letter-content-container');
    }
    
    setupNavigationEvents() {
        // زر الرسالة السابقة
        if (this.elements.prevLetterBtn) {
            this.elements.prevLetterBtn.addEventListener('click', () => {
                if (this.currentLetterId > 1) {
                    this.loadLetter(this.currentLetterId - 1);
                    this.renderCurrentLetter();
                }
            });
        }
        
        // زر الرسالة التالية
        if (this.elements.nextLetterBtn) {
            this.elements.nextLetterBtn.addEventListener('click', () => {
                if (this.currentLetterId < this.totalLetters) {
                    this.loadLetter(this.currentLetterId + 1);
                    this.renderCurrentLetter();
                }
            });
        }
        
        // الانتقال إلى رسالة محددة
        if (this.elements.gotoBtn && this.elements.gotoInput) {
            this.elements.gotoBtn.addEventListener('click', () => {
                const letterId = parseInt(this.elements.gotoInput.value);
                if (letterId >= 1 && letterId <= this.totalLetters) {
                    this.loadLetter(letterId);
                    this.renderCurrentLetter();
                } else {
                    alert(`الرجاء إدخال رقم بين 1 و ${this.totalLetters}`);
                }
            });
            
            this.elements.gotoInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.elements.gotoBtn.click();
                }
            });
        }
    }
    
    loadLettersList() {
        if (!this.elements.lettersList || this.lettersIndex.length === 0) return;
        
        let listHTML = '';
        
        // تجميع الرسائل حسب التصنيف
        const lettersByCategory = {};
        this.lettersIndex.forEach(letter => {
            const category = letter.category || 'غير مصنف';
            if (!lettersByCategory[category]) {
                lettersByCategory[category] = [];
            }
            lettersByCategory[category].push(letter);
        });
        
        // إنشاء القائمة
        for (const [category, letters] of Object.entries(lettersByCategory)) {
            listHTML += `
                <h6 class="dropdown-header">${category} <span class="badge bg-secondary">${letters.length}</span></h6>
                ${letters.map(letter => `
                    <a class="dropdown-item letter-list-item ${letter.id === this.currentLetterId ? 'active' : ''}" 
                       href="#" 
                       data-letter-id="${letter.id}">
                        <span class="badge bg-primary me-2">${letter.id}</span>
                        ${letter.title}
                        ${letter.recipient ? `<small class="text-muted d-block">إلى: ${letter.recipient}</small>` : ''}
                    </a>
                `).join('')}
                <div class="dropdown-divider"></div>
            `;
        }
        
        this.elements.lettersList.innerHTML = listHTML;
        
        // إضافة أحداث النقر
        document.querySelectorAll('.letter-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const letterId = parseInt(e.currentTarget.getAttribute('data-letter-id'));
                this.loadLetter(letterId);
                this.renderCurrentLetter();
                
                // إغلاق القائمة المنسدلة
                const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('letters-list-btn'));
                if (dropdown) dropdown.hide();
            });
        });
    }
    
    async renderCurrentLetter() {
        if (!this.currentLetter || !this.elements.letterContainer) {
            console.log('جاري تحميل الرسالة...');
            return;
        }
        
        const html = this.renderLetter(this.currentLetter);
        this.elements.letterContainer.innerHTML = html;
        
        // تحديث واجهة التنقل
        this.updateNavigationUI();
    }
    
    updateNavigationUI() {
        // تحديث العنوان
        if (this.elements.currentTitle && this.currentLetter) {
            this.elements.currentTitle.innerHTML = `
                <span class="badge bg-primary me-2">الرسالة ${this.currentLetterId}</span>
                ${this.currentLetter.metadata.title}
            `;
        }
        
        // تحديث العداد
        if (this.elements.letterCounter) {
            this.elements.letterCounter.textContent = `${this.currentLetterId} / ${this.totalLetters}`;
        }
        
        // تحديث حالة الأزرار
        if (this.elements.prevLetterBtn) {
            this.elements.prevLetterBtn.disabled = this.currentLetterId <= 1;
        }
        
        if (this.elements.nextLetterBtn) {
            this.elements.nextLetterBtn.disabled = this.currentLetterId >= this.totalLetters;
        }
        
        // تحديث حقل الإدخال
        if (this.elements.gotoInput) {
            this.elements.gotoInput.value = this.currentLetterId;
        }
        
        // تحديث القائمة المنسدلة
        this.loadLettersList();
    }
    
    renderLetter(letterData) {
        if (!letterData) return '<div class="alert alert-danger">تعذر تحميل الرسالة</div>';
        
        const metadata = letterData.metadata;
        const content = letterData.content;
        
        return `
            <div class="letter-container" data-letter-id="${content.letter_id}">
                <!-- رأس الرسالة -->
                <div class="letter-header card shadow-sm mb-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h3 class="text-primary mb-2">${metadata.title}</h3>
                                ${content.subtitle ? `<h5 class="text-secondary mb-3">${content.subtitle}</h5>` : ''}
                                ${content.description ? `<p class="text-muted">${content.description}</p>` : ''}
                                
                                <div class="letter-meta mt-3">
                                    ${content.recipient ? `
                                        <div class="mb-1">
                                            <span class="badge bg-info me-2">إلى:</span>
                                            <span class="text-muted">${content.recipient}</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${content.occasion ? `
                                        <div class="mb-1">
                                            <span class="badge bg-info me-2">المناسبة:</span>
                                            <span class="text-muted">${content.occasion}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                <div class="letter-meta">
                                    ${metadata.categories ? metadata.categories.map(cat => 
                                        `<span class="badge bg-secondary me-2 mb-1">${cat}</span>`
                                    ).join('') : ''}
                                    
                                    ${metadata.page_start ? `
                                        <small class="text-muted d-block">الصفحات: ${metadata.page_start} - ${metadata.page_end}</small>
                                    ` : ''}
                                    
                                    ${metadata.total_footnotes ? `
                                        <small class="text-muted d-block">عدد الحواشي: ${metadata.total_footnotes}</small>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- محتوى الرسالة -->
                <div class="letter-content">
                    ${content.sections ? content.sections.map(section => this.renderSection(section)).join('') : `
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i> محتوى هذه الرسالة قيد الإعداد
                        </div>
                    `}
                </div>
                
                <!-- تذييل الرسالة -->
                <div class="letter-footer mt-4 pt-3 border-top">
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted">
                                <i class="bi bi-book"></i> ${metadata.source || 'نهج البلاغة'}
                            </small>
                        </div>
                        <div class="col-md-6 text-end">
                            <small class="text-muted">
                                شرح: ${metadata.editor || 'محمد عبده'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSection(section) {
        return `
            <div class="letter-section mb-4 p-3 border rounded-3" data-section-id="${section.id}">
                <div class="section-text mb-3">
                    <p class="text-justify" style="font-size: 1.1rem; line-height: 1.8;">${section.text}</p>
                </div>
                
                ${section.footnotes && section.footnotes.length > 0 ? `
                    <div class="section-footnotes">
                        <button class="btn btn-sm btn-outline-primary toggle-footnotes" 
                                data-section="${section.id}"
                                data-bs-toggle="collapse" 
                                data-bs-target="#letter-footnotes-${section.id}">
                            <i class="bi bi-chat-square-quote"></i> 
                            عرض شرح محمد عبده 
                            <span class="badge bg-secondary ms-1">${section.footnotes.length}</span>
                        </button>
                        
                        <div class="collapse mt-2" id="letter-footnotes-${section.id}">
                            <div class="card card-body border-primary">
                                ${section.footnotes.map(footnote => `
                                    <div class="footnote-item mb-3">
                                        <div class="d-flex align-items-start">
                                            <span class="footnote-number badge bg-primary me-2">${footnote.id}</span>
                                            <div class="footnote-content">
                                                <p class="mb-1">${footnote.text}</p>
                                                ${footnote.page ? `<small class="text-muted">الصفحة: ${footnote.page}</small>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// تصدير الكلاس للاستخدام العالمي
if (typeof window !== 'undefined') {
    window.NahjLetters = NahjLetters;
    console.log('✅ NahjLetters جاهز للاستخدام');
}


