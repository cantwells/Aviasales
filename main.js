//БД городов
let citiesList = [];

//Константы для работы с API
const citiesAPI = 'http://api.travelpayouts.com/data/ru/cities.json',
    proxy = 'https://cors-anywhere.herokuapp.com/',
    API_KEY = '38fced4ed2a88bfd782f3d4e16d17d58',
    calendar = 'https://min-prices.aviasales.ru/calendar_preload/',
    MAX_COUNT = '5';

// let param = '?origin=SVX&destination=KGD&depart_date=2020-05-25&one_way=true&token=' + API_KEY;

//Получаем элементы со страницы
const inputCitiesFrom = document.querySelector('.input__cities-from'),
    dropDownCitiesFrom = document.querySelector('.dropdown__cities-from'),
    inputCitiesTo = document.querySelector('.input__cities-to'),
    dropDownCitiesTo = document.querySelector('.dropdown__cities-to'),
    inputDateDepart = document.querySelector('.input__date-depart'),
    formSearch = document.querySelector('.form-search'),
    cheapestTicket = document.getElementById('cheapest-ticket'),
    otherCheapTickets = document.getElementById('other-cheap-tickets'),
    wrapperError = document.querySelector('.wrapper__error');

//Объявление
let from = '',
    to = '',
    when = '',
    idx = -1;


//Объявление функций

//Функция для получения данных через AJAX
const getData = (url, callback) => {
    const request = new XMLHttpRequest(); // Создаем объект XMLHttpRequest

    request.open('GET', url); //Настраиваем какой и куда будет запрос

    request.addEventListener('readystatechange', () => {
        if (request.readyState !== 4) return;

        if (request.status == '200') {
            callback(request.response);
        } else {
            const err = document.createElement('h2');
            err.textContent = 'Не известное направление для полётов';
            wrapperError.append(err);
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
    if (input.value.length === 1) idx = -1;
};

//Функция получения названия города по коду
const getCityName = (code) => {
    const obj = citiesList.find((item) => {
        return item.code === code;
    });
    return obj.name;
}

//Функция получения кол-во пересадок
const getTransfer = (num) => {
    if (num) {
        let transfer = num === 1 ? 'Одна пересадка' : 'Две пересадки';
        return transfer;
    } else {
        return 'Без пересадок';
    }
}

//Функция получения нужно даты даты
const getCorrectDate = (date) => {
    return new Date(date).toLocaleString('ru', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

const getLinkAviasales = (obj) => {

    //https://www.aviasales.ru/search/SVX2905KGD1
    let link = 'https://www.aviasales.ru/search/';
    link += obj.origin;
    let day = new Date(obj.depart_date).getDate();
    link += day < 10 ? '0' + day : day;
    let month = new Date(obj.depart_date).getMonth() + 1;
    link += month < 10 ? '0' + month : month;
    link += obj.destination;
    link += '1';
    return link;
}

//Фукция создания карточки
const createCard = (ticketObj) => {
    const article = document.createElement('article');
    article.classList.add('ticket');
    let deep = '';
    deep = `
    <h3 class="agent">${ticketObj.gate}</h3>
    <div class="ticket__wrapper">
    <div class="left-side">
    <a href="${getLinkAviasales(ticketObj)}" target="_blank" class="button button__buy">Купить
            за ${ticketObj.value}₽</a>
            </div>
            <div class="right-side">
            <div class="block-left">
            <div class="city__from">Вылет из города:
            <span class="city__name">${getCityName(ticketObj.origin)}</span>
            </div>
            <div class="date">${getCorrectDate(ticketObj.depart_date)}</div>
            </div>
            
            <div class="block-right">
            <div class="changes">${getTransfer(ticketObj.number_of_changes)}</div>
            <div class="city__to">Город назначения:
            <span class="city__name">${getCityName(ticketObj.destination)}</span>
            </div>
            </div>
            </div>
            </div> 
            `;
    article.insertAdjacentHTML('afterbegin', deep);

    return article;
}

//Функция отрисовки билета на нужную дату
const renderTicket = (obj) => {
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
    const ticket = createCard(obj[0]);
    cheapestTicket.append(ticket);
}

//Функция отрисовки остальных предложенных билетов
const renderTickets = (tickets) => {
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';
    tickets.sort(function compare(a, b) {
        return a.value - b.value;
    });

    for (let i = 0; i < tickets.length && i <= MAX_COUNT; i++) {
        const ticket = createCard(tickets[i]);
        otherCheapTickets.append(ticket);
    }
}

//Общая Функция отрисовки билетов, которая получает нужные данные, а потом передает соответсвующим функциям
const renderCheap = (data, date) => {
    const cheapTicketsYear = JSON.parse(data).best_prices;

    const cheapTicketDay = cheapTicketsYear.filter((item) => {
        return item.depart_date === date;
    });

    if (cheapTicketDay.length) {
        renderTicket(cheapTicketDay);
    } else {
        const err = document.createElement('h2');
        err.textContent = 'На выбранную дату нет рейсов';
        wrapperError.append(err);
    }
    renderTickets(cheapTicketsYear);
};

//Функция управления лавишами

const keyControl = (event, input, dropdown) => {
    const Lis = dropdown.children;
    let length = Lis.length - 1;

    switch (event.keyCode) {
        case 38:
            if (idx >= 0)
                Lis.item(idx).classList.remove('active');
            idx--;
            if (idx < 0) idx = length;
            Lis.item(idx).classList.add('active');
            console.log(idx);

            break;
        case 40:
            if (idx >= 0)
                Lis.item(idx).classList.remove('active');
            idx++;
            if (idx > length) idx = 0;
            Lis.item(idx).classList.add('active');
            console.log(idx);

            break;
        case 13:
            input.value = Lis.item(idx).textContent;
            dropdown.textContent = '';
    }
}



//Оброботчики событий

inputCitiesFrom.addEventListener('input', () => {
    showCities(citiesList, inputCitiesFrom, dropDownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
    showCities(citiesList, inputCitiesTo, dropDownCitiesTo);
});

document.addEventListener('keydown', (e) => {
    if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 13) {
        if (dropDownCitiesFrom.children.length)
            keyControl(e, inputCitiesFrom, dropDownCitiesFrom);

        if (dropDownCitiesTo.children.length)
            keyControl(e, inputCitiesTo, dropDownCitiesTo);
    }
});

formSearch.addEventListener('submit', (event) => {
    event.preventDefault(); //отключаем поведение по умолчанию (перезагрузке при отправке формы)
    event.target.setAtr

    //Получаем нужный код города из списка городов соответсвующий вводимому значению в инпут
    from = citiesList.find((item) => { return inputCitiesFrom.value == item.name });
    to = citiesList.find((item) => { return inputCitiesTo.value == item.name });
    when = inputDateDepart.value; //полчаем дату

    if (from && to) {
        //формируем строчку с параметрами для получения массивов с билетами
        let param = `?origin=${from.code}&destination=${to.code}&one_way=true`;
        // console.log(param);
        getData(calendar + param, (data) => {
            renderCheap(data, when);
        });
    } else {
        alert('Ошибка ввода города');
    }
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