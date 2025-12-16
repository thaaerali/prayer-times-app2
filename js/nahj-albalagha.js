async function loadNahjData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/thaaerali/nahj-al-balagha-json/refs/heads/main/nahj-al-balagha.json');
        const data = await response.json();
        displayNahjContent(data);
    } catch (error) {
        console.error('Error loading Nahj al-Balagha data:', error);
    }
}

function displayNahjContent(data) {
    const container = document.getElementById('nahj-content');
    
    data.content.sections.forEach(section => {
        const sectionHTML = `
            <div class="nahj-section">
                <p class="nahj-text">${section.text}</p>
                <div class="footnotes-container" id="footnotes-${section.id}" style="display:none;">
                    <h4>شرح محمد عبده:</h4>
                    ${section.footnotes.map(fn => `
                        <div class="footnote-item">
                            <span class="footnote-number">(${fn.id})</span>
                            <span class="footnote-text">${fn.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.innerHTML += sectionHTML;
    });
    
    // إضافة تفاعل للحواشي
    addFootnoteInteractivity();
}

function addFootnoteInteractivity() {
    document.querySelectorAll('.footnote-ref').forEach(ref => {
        ref.addEventListener('click', function() {
            const footnoteId = this.getAttribute('data-id');
            const sectionId = this.closest('.nahj-section').id;
            // عرض الحاشية
            showFootnote(footnoteId, sectionId);
        });
    });
}
