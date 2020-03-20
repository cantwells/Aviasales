//БД городов
let citiesList = [];
const citiesAPI = 'http://api.travelpayouts.com/data/ru/cities.json',
    proxy = 'https://cors-anywhere.herokuapp.com/',
    API_KEY = '38fced4ed2a88bfd782f3d4e16d17d58',
    calendar = 'http://min-prices.aviasales.ru/calendar_preload/';

// let param = '?origin=SVX&destination=KGD&depart_date=2020-05-25&one_way=true&token=' + API_KEY;

//Получаем элементы со страницы
const inputCitiesFrom = document.querySelector('.input__cities-from'),
    dropDownCitiesFrom = document.querySelector('.dropdown__cities-from'),
    inputCitiesTo = document.querySelector('.input__cities-to'),
    dropDownCitiesTo = document.querySelector('.dropdown__cities-to'),
    inputDateDepart = document.querySelector('.input__date-depart'),
    formSearch = document.querySelector('.form-search');

let from = '',
    to = '',
    when = '';

//Функции

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

//Функция получения совпадающий с запросом городов и вывода его на экран
const showCities = (list, input, dropdown) => {
    dropdown.textContent = '';

    const citiesMatchList = list.filter(function(item) {
        item = item.name.toLowerCase();

        if (input.value !== '')
            return item.startsWith(input.value.toLowerCase());
    });

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

// console renderTickets = (tickets) => {

// }

const renderCheap = (data, date) => {
    const getTickets = JSON.parse(data).best_prices;

    const cheapTicket = getTickets.find((item) => {
        return item.depart_date == date;
    });

    renderTicket(cheapTicket);
    // renderTickets( cheapTickets );
};

//Оброботчики событий
inputCitiesFrom.addEventListener('input', () => {
    showCities(citiesList, inputCitiesFrom, dropDownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
    showCities(citiesList, inputCitiesTo, dropDownCitiesTo);
});

formSearch.addEventListener('submit', (event) => {
    event.preventDefault();

    from = citiesList.find((item) => { return inputCitiesFrom.value == item.name }).code;
    to = citiesList.find((item) => { return inputCitiesTo.value == item.name }).code;
    when = inputDateDepart.value;

    let param = `?origin=${from}&destination=${to}&depart_date=${when}&one_way=true`;

    getData(proxy + calendar + param, (data) => {
        renderCheap(data, when);
    });
});


//Вызовы функций
// getData('https://jsonplaceholder.typicode.com/photos/', (data) => {
getData(proxy + citiesAPI, (data) => {
    const dataCities = JSON.parse(data);

    citiesList = dataCities.filter((item) => {
        return item.name;
    });
});

// getData(proxy + calendar + param, (data) => {
//     const saleTickets = JSON.parse(data).best_prices.filter((item) => {
//         return item.depart_date == '2020-05-25';
//     });

//     console.log(saleTickets);
// })