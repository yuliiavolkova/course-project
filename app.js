// Tabs - Time Range and Holidays
const timeTabBtn = document.getElementById("time-tab-btn");
const holidayTabBtn = document.getElementById("holiday-tab-btn");

// Time Range tab
const timeTab = document.getElementById("time-tab");

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const presetSelect = document.getElementById("preset");
const daysTypeSelect = document.getElementById("days-type");
const unitSelect = document.getElementById("unit");
const calculateBtn = document.getElementById("calculate-btn");

const resultsTableBody = document.querySelector("#results-table tbody");

//  Holidays tab - дані отримуємо з API
const holidayTab = document.getElementById("holiday-tab");

const holidayList = document.getElementById("holiday-list");
const countrySelect = document.getElementById("country");
const yearInput = document.getElementById("year");
const getHolidaysBtn = document.getElementById("get-holidays-btn");

let calculationHistory =
  JSON.parse(localStorage.getItem("calculationHistory")) || []; // збережні значення отримаємо з LS, але якщо таких даних немає, то calculationHistory - пустий масив

// Click between Time Range and Holidays
timeTabBtn.addEventListener("click", () => {
  timeTab.classList.add("active");
  holidayTab.classList.remove("active");
});

holidayTabBtn.addEventListener("click", () => {
  timeTab.classList.remove("active");
  holidayTab.classList.add("active");
});

// Заповнення результату з localStorage
function renderHistory() {
  resultsTableBody.innerHTML = ""; // очищення таблиці, щоб видалити старі дані
  calculationHistory.forEach((item) => {
    const row = document.createElement("tr"); // створюємо для кожного елементу масива новий рядок таблиці
    row.innerHTML = `<td>${item.startDate}</td><td>${item.endDate}</td><td>${item.result}</td>`; // всередині рядка додаємо три елемента - startDate, endDate, result
    resultsTableBody.appendChild(row);
  });
}
renderHistory();

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Місяці нульові, тому +1
  const day = String(date.getDate()).padStart(2, "0"); // якщо довжина числа менша 2 символів, то додаємо 0 до числа

  return `${year}-${month}-${day}`;
}
// Обробка пресетів

presetSelect.addEventListener("change", () => {
  const startDate = startDateInput.value
    ? new Date(startDateInput.value) // якщо користувач ввів дату в полі startDateInput, то вона перетворюється у формат Date, якщо дати немає, startDate -undefined
    : undefined;
  const preset = presetSelect.value;

  if (!startDate || !preset) {
    return;
  }
  const endDate = new Date(startDateInput.value);

  // Preset логіка
  if (preset === "week") {
    endDate.setDate(startDate.getDate() + 7); // метод setDate додає 7 днів до startDate
  } else if (preset === "month") {
    endDate.setDate(startDate.getDate() + 30); // метод setDate додає 30 днів до startDate
  }
  endDateInput.value = formatDate(endDate); // кінцева дата перетворюється у формат, який стає датою endDate
});

// Якщо користувач вибрав Start Date, то поле для End Date стає активним і навпаки
startDateInput.addEventListener("change", () => {
  endDateInput.disabled = !startDateInput.value;
});

// Time range обчислення
calculateBtn.addEventListener("click", () => {
  const startDate = startDateInput.value
    ? new Date(startDateInput.value)
    : undefined;
  const endDate = startDateInput.value
    ? new Date(endDateInput.value)
    : undefined;

  if (!startDate || !endDate || startDate > endDate) {
    alert("Please enter valid dates.");
    return;
  }

  const diffInMs = endDate - startDate; // обчислення різниці між датами у мілісекундах
  let result;

  // Обчислення результату в заданих одиницях
  const unit = unitSelect.value; // в залежності від вибору одиниць вимірювання користувачем, результат перетвориться у необхідний
  if (unit === "days") {
    result = diffInMs / (1000 * 60 * 60 * 24);
  } else if (unit === "hours") {
    result = diffInMs / (1000 * 60 * 60);
  } else if (unit === "minutes") {
    result = diffInMs / (1000 * 60);
  } else if (unit === "seconds") {
    result = diffInMs / 1000;
  }

  const resultText = `${result.toFixed(2)} ${unit}`; // toFixed - округлює результат до 2 знаків після коми
  calculationHistory.push({
    // метод додає новий елемент в кінець масиву calculationHistory
    startDate: startDateInput.value,
    endDate: endDateInput.value,
    result: resultText,
  });
  localStorage.setItem(
    "calculationHistory", // ключ, під яким зберігаються дані
    JSON.stringify(calculationHistory)
  );
  renderHistory(); // функція дозволяє побачити всі попередні обчислення
});

// Fetching countries and holidays from Calendarific API
const apiKey = "WQ254qoXUXFaM1nhTzwcAbxSkW9dHjd7";

function fetchCountries() {
  fetch(`https://calendarific.com/api/v2/countries?&api_key=${apiKey}`) // метод для отримання даних з API
    .then((response) => response.json()) // блок виконається тільки тоді, коли сервер відповість
    .then((data) => {
      const option = document.createElement("option");
      option.value = ""; // додаємо пустий нульовий елемент, без value
      option.textContent = "Select country";
      countrySelect.appendChild(option);

      data.response.countries.forEach((country) => {
        const option = document.createElement("option"); // надання можливості вибору країни
        option.value = country["iso-3166"]; // API повертає код під ключем iso-3166
        option.textContent = country.country_name;
        countrySelect.appendChild(option);
      });
    })
    // конструкція, що відловлює помилки у промісах
    .catch((e) => {
      alert("Something wrong!");
    });
}

getHolidaysBtn.addEventListener("click", () => {
  const country = countrySelect.value;
  const year = yearInput.value;

  fetch(
    `https://calendarific.com/api/v2/holidays?&api_key=${apiKey}&country=${country}&year=${year}`
  )
    .then((response) => response.json())
    .then((data) => {
      const holidaysTableBody = document.querySelector("#holidays-table tbody");
      holidaysTableBody.innerHTML = "";
      data.response.holidays.forEach((holiday) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${holiday.date.iso}</td><td>${holiday.name}</td>`;
        holidaysTableBody.appendChild(row);
      });
    })
    .catch((e) => {
      alert("Something wrong!");
    });
});

fetchCountries();

// Якщо користувач вибрав Select Country, то поле для Select Year стає активним, і навпаки
countrySelect.addEventListener("change", () => {
  yearInput.disabled = !countrySelect.value;
});
