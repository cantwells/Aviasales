//БД городов
let citiesList = [];

//Константы для работы с API
const citiesAPI = 'http://api.travelpayouts.com/data/ru/cities.json',
    proxy = 'https://cors-anywhere.herokuapp.com/',
    API_KEY = '38fced4ed2a88bfd782f3d4e16d17d58',
    calendar = 'https://min-prices.aviasales.ru/calendar_preload/';

// let param = '?origin=SVX&destination=KGD&depart_date=2020-05-25&one_way=true&token=' + API_KEY;

//Получаем элементы со страницы
const inputCitiesFrom = document.querySelector('.input__cities-from'),
    dropDownCitiesFrom = document.querySelector('.dropdown__cities-from'),
    inputCitiesTo = document.querySelector('.input__cities-to'),
    dropDownCitiesTo = document.querySelector('.dropdown__cities-to'),
    inputDateDepart = document.querySelector('.input__date-depart'),
    formSearch = document.querySelector('.form-search');

//Объявление
let from = '',
    to = '',
    when = '';

//Функции

//Функция для получения данных через AJAX
const getData = (url, callback) => {
    const request = new XMLHttpRequest(); // Создаем объект XMLHttpRequest

    request.open('GET', url); //Настраиваем какой и куда будет запрос

    request.addEventListener('readystatechange', () => {
        if (request.readyState !== 4) return;

        if (request.status == '200') {
            callback(request.response);
        } else {
            console.error(request.status);
        }

    });

    request.send(); // отправляем запрос
}

//Функция получения совпадающий с запросом городов и вывода в виде списка на экран
const showCities = (list, input, dropdown) => {
    dropdown.textContent = ''; //Очищаем ul с городами

    const citiesMatchList = list.filter(function(item) {
        item = item.name.toLowerCase(); //делаем название городов прописными буквами

        if (input.value !== '') //Проверяем, что если инпут не пустой 
            return item.startsWith(input.value.toLowerCase());
    });

    //отсортируем в соответствии с полем name, чтобы при вводе определенной буквы начались отсортироваваться города
    citiesMatchList.sort(function compare(a, b) {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        // a должно быть равным b
        return 0;
    });

    //Пробигаем по списку совподающих с запросом городов и создаем li-элементы с нужным классом, который потом добавляем в Ul. 
    citiesMatchList.forEach((item) => {
        let liElem = document.createElement('li');
        liElem.classList.add('dropdown__city');
        liElem.textContent = item.name;
        dropdown.append(liElem);
        liElem.addEventListener('click', function(event) {
            input.value = this.textContent;
            dropdown.textContent = '';
        });
    });
};

const renderTicket = (ticket) => {
    console.log(ticket);
}

const renderTickets = (tickets) => {
    tickets.sort(function compare(a, b) {
        if (a.value < b.value) {
            return -1;
        }
        if (a.value > b.value) {
            return 1;
        }
        // a должно быть равным b
        return 0;
    });

    console.log(tickets);
}

//Функция для отрисовки билетов, которая получает нужные данные, а потом передает соответсвующим функциям
const renderCheap = (data, date) => {
    const cheapTicketsYear = JSON.parse(data).best_prices;

    const cheapTicketDay = cheapTicketsYear.filter((item) => {
        return item.depart_date === date;
    });

    renderTicket(cheapTicketDay);
    renderTickets(cheapTicketsYear);

};

//Оброботчики событий
inputCitiesFrom.addEventListener('input', () => {
    showCities(citiesList, inputCitiesFrom, dropDownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
    showCities(citiesList, inputCitiesTo, dropDownCitiesTo);
});

formSearch.addEventListener('submit', (event) => {
    event.preventDefault(); //отключаем поведение по умолчанию (перезагрузке при отправке формы)

    //Получаем нужный код города из списка городов соответсвующий вводимому значению в инпут
    from = citiesList.find((item) => { return inputCitiesFrom.value == item.name }).code;
    to = citiesList.find((item) => { return inputCitiesTo.value == item.name }).code;
    when = inputDateDepart.value; //полчаем дату

    //формируем строчку с параметрами для получения массивов с билетами
    let param = `?origin=${from}&destination=${to}&one_way=true`;

    getData(calendar + param, (data) => {
        renderCheap(data, when);
    });
});


//Вызовы функций

//Получаем список городов 
getData(proxy + citiesAPI, (data) => {
    const dataCities = JSON.parse(data);

    //Возвращает только те у кого есть название на русском
    citiesList = dataCities.filter((item) => {
        return item.name;
    });
});