//БД городов
const citiesList = ['Москва', 'Санкт-Петербург', 'Симферополь', 'Казань', 'Екатеринбург', 'Краснодар',
    'Минск', 'Киев', 'Владивосток', 'Нижний Новгород', 'Ростов-на-Дону', 'Челябинск', 'Новосибирск',
    'Самара', 'Томбов', 'Архангельск', 'Тверь', 'Рига', 'Таллин', 'Калининград', 'Вильнюс', 'Тбилиси',
    'Ереван', 'Баку', 'Астана', 'Ташкент', 'Бишкек', 'Душанбе', 'Лондон', 'Вашингтон', 'Берлин', 'Рим'
];

//Получаем элементы со страницы
const inputCitiesFrom = document.querySelector('.input__cities-from'),
    dropDownCitiesFrom = document.querySelector('.dropdown__cities-from'),
    inputCitiesTo = document.querySelector('.input__cities-to'),
    dropDownCitiesTo = document.querySelector('.dropdown__cities-to'),
    buttonSearch = document.querySelector('.button__search');

//Функции

//Функция получения совпадающий с запросом городов и вывода его на экран
const showCities = (list, input, dropdown) => {
    dropdown.textContent = '';

    const citiesMatchList = list.filter(function(item) {
        item = item.toLowerCase();
        if (input.value !== '')
            return item.startsWith(input.value.toLowerCase());
    });

    citiesMatchList.forEach((item) => {
        let liElem = document.createElement('li');
        liElem.classList.add('dropdown__city');
        liElem.textContent = item;
        dropdown.append(liElem);
        liElem.addEventListener('click', function(event) {
            input.value = this.textContent;
            dropdown.textContent = '';
        });
    });
};

//Оброботчики событий
inputCitiesFrom.addEventListener('input', () => {
    showCities(citiesList, inputCitiesFrom, dropDownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
    showCities(citiesList, inputCitiesTo, dropDownCitiesTo);
});