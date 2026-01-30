// Конфигурация приза - ЗАМЕНИТЕ ЭТИ ССЫЛКИ НА СВОИ!
const PRIZES = [
    {
        name: "Гайд №1",
        description: "🎉 Поздравляем! Вы выиграли Гайд №1!",
        link: "https://disk.yandex.ru/d/ССЫЛКА_НА_ГАЙД_1" // ЗАМЕНИТЕ
    },
    {
        name: "Гайд №2", 
        description: "🎊 Ура! Вы выиграли Гайд №2!",
        link: "https://disk.yandex.ru/d/ССЫЛКА_НА_ГАЙД_2" // ЗАМЕНИТЕ
    },
    {
        name: "Гайд №3",
        description: "🌟 Отлично! Вы выиграли Гайд №3!",
        link: "https://disk.yandex.ru/d/ССЫЛКА_НА_ГАЙД_3" // ЗАМЕНИТЕ
    },
    {
        name: "Гайд №4",
        description: "🔥 Потрясающе! Вы выиграли Гайд №4!",
        link: "https://disk.yandex.ru/d/ССЫЛКА_НА_ГАЙД_4" // ЗАМЕНИТЕ
    }
];

// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Элементы DOM
const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spinButton');
const claimButton = document.getElementById('claimButton');
const prizeDisplay = document.getElementById('prizeDisplay');
const prizeText = document.getElementById('prizeText');
const loading = document.getElementById('loading');

// Переменные состояния
let isSpinning = false;
let currentPrize = null;
let wheelRotation = 0;

// Функция для вращения рулетки
function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    claimButton.disabled = true;
    prizeDisplay.classList.remove('show');
    
    // Случайный выбор приза
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    currentPrize = PRIZES[prizeIndex];
    
    // Расчет угла вращения (3 полных оборота + позиция приза)
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 * 3 + (prizeIndex * segmentAngle) + (segmentAngle / 2);
    
    // Вращение
    wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.83, 0.67)';
    wheel.style.transform = `rotate(${-targetAngle}deg)`;
    
    // После завершения вращения
    setTimeout(() => {
        isSpinning = false;
        spinButton.disabled = false;
        claimButton.disabled = false;
        
        // Показать выигранный приз
        prizeText.textContent = currentPrize.description;
        prizeDisplay.classList.add('show');
        
        // Сохранить текущее положение колеса
        wheelRotation = targetAngle % 360;
    }, 4000);
}

// Функция для получения приза
function claimPrize() {
    if (!currentPrize) return;
    
    // Показать индикатор загрузки
    loading.classList.add('show');
    prizeDisplay.classList.remove('show');
    claimButton.disabled = true;
    spinButton.disabled = true;
    
    // Отправка данных в Telegram (если нужно)
    tg.sendData(JSON.stringify({
        action: 'prize_claimed',
        prize: currentPrize.name,
        timestamp: new Date().toISOString()
    }));
    
    // Через 2 секунды перенаправляем на Яндекс.Диск
    setTimeout(() => {
        window.open(currentPrize.link, '_blank');
        loading.classList.remove('show');
        
        // Сброс через 3 секунды
        setTimeout(() => {
            claimButton.disabled = false;
            spinButton.disabled = false;
            prizeDisplay.classList.remove('show');
            currentPrize = null;
        }, 3000);
    }, 2000);
}

// Сброс вращения при загрузке
wheel.style.transform = 'rotate(0deg)';

// Обработчик для кнопки "Назад" в Telegram
tg.onEvent('backButtonClicked', () => {
    tg.close();
});

// Показать кнопку "Назад"
tg.BackButton.show();