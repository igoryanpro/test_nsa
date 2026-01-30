// КОНФИГУРАЦИЯ - ЗАМЕНИТЕ ССЫЛКИ НА СВОИ!
const PRIZES = [
    {
        name: "Гайд №1",
        description: "🎉 Поздравляем! Вы выиграли Гайд №1!",
        link: "https://disk.yandex.ru/d/ВАША_ССЫЛКА_1" // ЗАМЕНИТЕ
    },
    {
        name: "Гайд №2", 
        description: "🎊 Ура! Вы выиграли Гайд №2!",
        link: "https://disk.yandex.ru/d/ВАША_ССЫЛКА_2" // ЗАМЕНИТЕ
    },
    {
        name: "Гайд №3",
        description: "🌟 Отлично! Вы выиграли Гайд №3!",
        link: "https://disk.yandex.ru/d/ВАША_ССЫЛКА_3" // ЗАМЕНИТЕ
    },
    {
        name: "Гайд №4",
        description: "🔥 Потрясающе! Вы выиграли Гайд №4!",
        link: "https://disk.yandex.ru/d/ВАША_ССЫЛКА_4" // ЗАМЕНИТЕ
    }
];

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
let currentRotation = 0;

// Функция вращения рулетки
function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    claimButton.disabled = true;
    prizeDisplay.classList.remove('show');
    
    // Случайный выбор приза (0-3)
    const prizeIndex = Math.floor(Math.random() * 4);
    currentPrize = PRIZES[prizeIndex];
    
    // Расчет угла вращения
    // 3 полных оборота = 1080 градусов
    // Каждая секция = 90 градусов
    // Добавляем смещение, чтобы указатель останавливался на середине секции
    const baseAngle = 1080; // 3 полных оборота
    const segmentAngle = 90; // 90 градусов на секцию
    const offset = 45; // Смещение на середину секции (90/2)
    
    const targetAngle = baseAngle + (prizeIndex * segmentAngle) + offset;
    
    // Сброс трансформации перед новым вращением
    wheel.style.transition = 'none';
    wheel.style.transform = `rotate(${currentRotation % 360}deg)`;
    
    // Даем браузеру время на обновление
    setTimeout(() => {
        // Устанавливаем плавное вращение
        wheel.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
        wheel.style.transform = `rotate(${currentRotation + targetAngle}deg)`;
        
        // Сохраняем текущее вращение
        currentRotation += targetAngle;
        
        // После завершения вращения
        setTimeout(() => {
            isSpinning = false;
            spinButton.disabled = false;
            claimButton.disabled = false;
            
            // Показать выигранный приз
            prizeText.textContent = currentPrize.description;
            prizeDisplay.classList.add('show');
        }, 4000);
    }, 50);
}

// Функция получения приза
function claimPrize() {
    if (!currentPrize) return;
    
    // Показать индикатор загрузки
    loading.classList.add('show');
    prizeDisplay.classList.remove('show');
    claimButton.disabled = true;
    spinButton.disabled = true;
    
    // Отправка данных в Telegram (если есть)
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.sendData(JSON.stringify({
            action: 'prize_claimed',
            prize: currentPrize.name,
            timestamp: new Date().toISOString()
        }));
    }
    
    // Через 1.5 секунды перенаправляем
    setTimeout(() => {
        window.open(currentPrize.link, '_blank');
        
        // Скрываем индикатор через 2 секунды
        setTimeout(() => {
            loading.classList.remove('show');
            
            // Сброс через 3 секунды
            setTimeout(() => {
                claimButton.disabled = false;
                spinButton.disabled = false;
                currentPrize = null;
            }, 3000);
        }, 2000);
    }, 1500);
}

// Инициализация Telegram Web App
function initTelegram() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Расширяем на весь экран
        tg.expand();
        
        // Готовим приложение
        tg.ready();
        
        // Показываем кнопку "Назад"
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => {
            tg.close();
        });
        
        console.log('Telegram Web App инициализирован');
    } else {
        console.log('Запуск вне Telegram - режим отладки');
        // Для отладки вне Telegram
        const debugDiv = document.createElement('div');
        debugDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: red;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 1000;
            ">
                Режим отладки
            </div>
        `;
        document.body.appendChild(debugDiv);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем Telegram
    initTelegram();
    
    // Назначаем обработчики кнопок
    spinButton.addEventListener('click', spinWheel);
    claimButton.addEventListener('click', claimPrize);
    
    // Инициализация рулетки
    wheel.style.transform = 'rotate(0deg)';
    
    // Для отладки: выводим секции
    console.log('Рулетка инициализирована. 4 секции:');
    console.log('1. Гайд №1 - красный сектор (0-90°)');
    console.log('2. Гайд №2 - бирюзовый сектор (90-180°)');
    console.log('3. Гайд №3 - желтый сектор (180-270°)');
    console.log('4. Гайд №4 - зеленый сектор (270-360°)');
});

// Добавляем стили для корректного отображения в мобильных браузерах
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 400px) {
        .wheel-container {
            width: 280px;
            height: 280px;
        }
        
        .segment-text {
            font-size: 14px;
        }
        
        #text1 { top: 30%; left: 72%; }
        #text2 { top: 72%; left: 72%; }
        #text3 { top: 72%; left: 28%; }
        #text4 { top: 30%; left: 28%; }
    }
    
    /* Улучшаем читаемость текста */
    .segment-text {
        background: rgba(0,0,0,0.2);
        padding: 2px 8px;
        border-radius: 10px;
    }
    
    /* Анимация затухания для плавного появления */
    .prize-display.show {
        animation: fadeIn 0.5s ease forwards;
    }
`;
document.head.appendChild(style);
