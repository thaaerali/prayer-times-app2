document.addEventListener("DOMContentLoaded", () => {

  const homePage = document.getElementById("home-page");
  const nahjPage = document.getElementById("nahj-page");

  // فتح صفحة نهج البلاغة
  document.getElementById("nahj-button").addEventListener("click", () => {
    homePage.classList.remove("active");
    nahjPage.classList.add("active");
  });

  // الرجوع
  document.getElementById("nahj-back-button").addEventListener("click", () => {
    nahjPage.classList.remove("active");
    homePage.classList.add("active");
  });

});
const BASE_URL =
  "https://raw.githubusercontent.com/thaaerali/nahj-al-balagha-json/main/nahj-al-balagha.json";

const content = document.getElementById("nahj-content");
const tabs = document.querySelectorAll("#nahj-tabs .nav-link");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const section = tab.dataset.section;
    loadSection(section);
  });
});

function loadSection(section) {
  content.innerHTML = `<div class="text-center py-4">جاري التحميل...</div>`;

  if (section === "wisdoms") {
    fetch(BASE_URL + "wisdoms/wisdoms.json")
      .then(r => r.json())
      .then(renderWisdoms);
  } else {
    fetch(BASE_URL + "index.json")
      .then(r => r.json())
      .then(index => loadList(section, index[section].count));
  }
}

function loadList(section, count) {
  content.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const id = String(i).padStart(3, "0");
    const file =
      section === "khutbas"
        ? `khutbas/khutba_${id}.json`
        : `letters/letter_${id}.json`;

    fetch(BASE_URL + file)
      .then(r => r.json())
      .then(data => renderItem(data));
  }
}

function renderItem(item) {
  const div = document.createElement("div");
  div.className = "list-group-item";

  div.innerHTML = `
    <h6 class="fw-bold">${item.title || ""}</h6>
    <p class="mb-2">${item.text?.original || item.text}</p>
    ${
      item.explanation
        ? `<details>
            <summary class="text-primary">الشرح</summary>
            <p class="mt-2">${item.explanation.text || item.explanation.summary}</p>
           </details>`
        : ""
    }
  `;

  content.appendChild(div);
}

function renderWisdoms(items) {
  content.innerHTML = "";
  items.forEach(w => {
    const div = document.createElement("div");
    div.className = "list-group-item";
    div.textContent = w.text;
    content.appendChild(div);
  });
}
