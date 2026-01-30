// КОНФИГУРАЦИЯ - ЗАМЕНИТЕ ССЫЛКИ НА СВОИ!
const ALL_PRIZES = [
    {
        id: 1,
        name: "Гайд №1",
        description: "🎉 Поздравляем! Вы выиграли Гайд №1!",
        link: "https://drive.google.com/file/d/1dkJZV46zi5vY0Gji_iQacjUTBfttCu_p/view", // ЗАМЕНИТЕ
        color: "#FF6B6B",
        icon: "📚"
    },
    {
        id: 2,
        name: "Гайд №2", 
        description: "🎊 Ура! Вы выиграли Гайд №2!",
        link: "https://drive.google.com/file/d/1dkJZV46zi5vY0Gji_iQacjUTBfttCu_p/view", // ЗАМЕНИТЕ
        color: "#4ECDC4",
        icon: "🎯"
    },
    {
        id: 3,
        name: "Гайд №3",
        description: "🌟 Отлично! Вы выиграли Гайд №3!",
        link: "https://drive.google.com/file/d/1dkJZV46zi5vY0Gji_iQacjUTBfttCu_p/view", // ЗАМЕНИТЕ
        color: "#FFD166",
        icon: "🚀"
    },
    {
        id: 4,
        name: "Гайд №4",
        description: "🔥 Потрясающе! Вы выиграли Гайд №4!",
        link: "https://drive.google.com/file/d/1dkJZV46zi5vY0Gji_iQacjUTBfttCu_p/view", // ЗАМЕНИТЕ
        color: "#06D6A0",
        icon: "💎"
    }
];

// Элементы DOM
const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spinButton');
const claimButton = document.getElementById('claimButton');
const prizeDisplay = document.getElementById('prizeDisplay');
const prizeText = document.getElementById('prizeText');
const loading = document.getElementById('loading');
const timerContainer = document.getElementById('timerContainer');
const timer = document.getElementById('timer');
const availablePrizesEl = document.getElementById('availablePrizes');
const wonPrizesEl = document.getElementById('wonPrizes');
const prizesModal = document.getElementById('prizesModal');
const prizesList = document.getElementById('prizesList');

// Ключи для localStorage
const STORAGE_KEYS = {
    LAST_SPIN: 'telegram_wheel_last_spin',
    WON_PRIZES: 'telegram_wheel_won_prizes',
    AVAILABLE_PRIZES: 'telegram_wheel_available_prizes'
};

// Переменные состояния
let isSpinning = false;
let currentPrize = null;
let currentRotation = 0;
let availablePrizes = [];
let wonPrizes = [];
let lastSpinTime = null;
let timerInterval = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем Telegram
    initTelegram();
    
    // Загружаем данные из localStorage
    loadUserData();
    
    // Обновляем интерфейс
    updateUI();
    
    // Назначаем обработчики кнопок
    spinButton.addEventListener('click', spinWheel);
    claimButton.addEventListener('click', claimPrize);
    
    // Инициализация рулетки
    wheel.style.transform = 'rotate(0deg)';
    
    // Обновляем таймер каждую секунду
    updateTimer();
    setInterval(updateTimer, 1000);
    
    console.log('Приложение инициализировано');
    console.log('Доступных призов:', availablePrizes.length);
    console.log('Полученных призов:', wonPrizes.length);
});

// Загрузка данных пользователя
function loadUserData() {
    // Загружаем время последнего вращения
    const lastSpinStr = localStorage.getItem(STORAGE_KEYS.LAST_SPIN);
    lastSpinTime = lastSpinStr ? parseInt(lastSpinStr) : null;
    
    // Загружаем полученные призы
    const wonPrizesStr = localStorage.getItem(STORAGE_KEYS.WON_PRIZES);
    wonPrizes = wonPrizesStr ? JSON.parse(wonPrizesStr) : [];
    
    // Загружаем доступные призы или создаем новые
    const availablePrizesStr = localStorage.getItem(STORAGE_KEYS.AVAILABLE_PRIZES);
    if (availablePrizesStr) {
        availablePrizes = JSON.parse(availablePrizesStr);
    } else {
        // Первая загрузка - все призы доступны
        availablePrizes = [...ALL_PRIZES];
        saveAvailablePrizes();
    }
    
    // Если призов больше нет, обновляем состояние
    if (availablePrizes.length === 0) {
        spinButton.disabled = true;
        spinButton.innerHTML = '<i class="fas fa-check-circle"></i> Все призы получены!';
    }
}

// Сохранение данных пользователя
function saveUserData() {
    if (lastSpinTime) {
        localStorage.setItem(STORAGE_KEYS.LAST_SPIN, lastSpinTime.toString());
    }
    localStorage.setItem(STORAGE_KEYS.WON_PRIZES, JSON.stringify(wonPrizes));
    saveAvailablePrizes();
}

// Сохранение доступных призов
function saveAvailablePrizes() {
    localStorage.setItem(STORAGE_KEYS.AVAILABLE_PRIZES, JSON.stringify(availablePrizes));
}

// Обновление интерфейса
function updateUI() {
    // Обновляем счетчики
    availablePrizesEl.textContent = availablePrizes.length;
    wonPrizesEl.textContent = wonPrizes.length;
    
    // Обновляем цвета рулетки
    updateWheelColors();
    
    // Обновляем доступность кнопки вращения
    updateSpinButton();
    
    // Обновляем список полученных призов
    updatePrizesList();
}

// Обновление цветов рулетки
function updateWheelColors() {
    // Создаем карту призов по ID
    const prizeMap = {};
    ALL_PRIZES.forEach(prize => {
        prizeMap[prize.id] = prize;
    });
    
    // Получаем цвета для каждого сектора
    const colors = ['#CCCCCC', '#CCCCCC', '#CCCCCC', '#CCCCCC']; // Серый по умолчанию
    
    availablePrizes.forEach((prize, index) => {
        // Распределяем доступные призы по секторам
        if (index < 4) {
            colors[index] = prize.color;
            
            // Обновляем текст сектора
            const textElement = document.getElementById(`text${index + 1}`);
            if (textElement) {
                textElement.textContent = prize.name;
                textElement.classList.remove('claimed');
            }
        }
    });
    
    // Помечаем неактивные секторы
    ALL_PRIZES.forEach(prize => {
        // Проверяем, выигран ли этот приз
        const isWon = wonPrizes.some(wonPrize => wonPrize.id === prize.id);
        if (isWon) {
            // Находим какой это сектор
            const prizeIndex = ALL_PRIZES.findIndex(p => p.id === prize.id);
            if (prizeIndex >= 0) {
                const textElement = document.getElementById(`text${prizeIndex + 1}`);
                if (textElement) {
                    textElement.textContent = `Получен`;
                    textElement.classList.add('claimed');
                }
            }
        }
    });
    
    // Устанавливаем цвета
    wheel.style.setProperty('--color1', colors[0]);
    wheel.style.setProperty('--color2', colors[1]);
    wheel.style.setProperty('--color3', colors[2]);
    wheel.style.setProperty('--color4', colors[3]);
}

// Обновление кнопки вращения
function updateSpinButton() {
    if (availablePrizes.length === 0) {
        spinButton.disabled = true;
        spinButton.innerHTML = '<i class="fas fa-check-circle"></i> Все призы получены!';
        return;
    }
    
    if (lastSpinTime) {
        const now = Date.now();
        const timeSinceLastSpin = now - lastSpinTime;
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (timeSinceLastSpin < twentyFourHours) {
            // Менее 24 часов прошло
            spinButton.disabled = true;
            spinButton.innerHTML = '<i class="fas fa-clock"></i> Завтра снова';
            timerContainer.style.display = 'block';
        } else {
            // Прошло больше 24 часов
            spinButton.disabled = false;
            spinButton.innerHTML = '<i class="fas fa-play-circle"></i> Крутить рулетку';
            timerContainer.style.display = 'none';
        }
    } else {
        // Первое вращение
        spinButton.disabled = false;
        spinButton.innerHTML = '<i class="fas fa-play-circle"></i> Крутить рулетку';
        timerContainer.style.display = 'none';
    }
}

// Обновление таймера
function updateTimer() {
    if (!lastSpinTime) return;
    
    const now = Date.now();
    const timeSinceLastSpin = now - lastSpinTime;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const timeLeft = twentyFourHours - timeSinceLastSpin;
    
    if (timeLeft > 0) {
        // Конвертируем миллисекунды в часы, минуты, секунды
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        // Форматируем время
        const formattedTime = 
            `${hours.toString().padStart(2, '0')}:` +
            `${minutes.toString().padStart(2, '0')}:` +
            `${seconds.toString().padStart(2, '0')}`;
        
        timer.textContent = formattedTime;
    } else {
        // Время вышло
        timerContainer.style.display = 'none';
        updateSpinButton();
    }
}

// Функция вращения рулетки
function spinWheel() {
    if (isSpinning || availablePrizes.length === 0) return;
    
    // Проверяем, прошло ли 24 часа
    if (lastSpinTime) {
        const now = Date.now();
        const timeSinceLastSpin = now - lastSpinTime;
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (timeSinceLastSpin < twentyFourHours) {
            alert('Подождите 24 часа перед следующей попыткой!');
            return;
        }
    }
    
    isSpinning = true;
    spinButton.disabled = true;
    claimButton.disabled = true;
    prizeDisplay.classList.remove('show');
    
    // Случайный выбор приза из доступных
    const prizeIndex = Math.floor(Math.random() * availablePrizes.length);
    currentPrize = availablePrizes[prizeIndex];
    
    // Находим позицию приза на рулетке
    const allPrizeIndex = ALL_PRIZES.findIndex(p => p.id === currentPrize.id);
    
    // Расчет угла вращения
    // 3 полных оборота = 1080 градусов
    // Каждая секция = 90 градусов
    const baseAngle = 1080; // 3 полных оборота
    const segmentAngle = 90; // 90 градусов на секцию
    const offset = 45; // Смещение на середину секции
    
    // Учитываем, что некоторые секторы могут быть пустыми
    // Для простоты считаем, что призы распределены по порядку
    const visualIndex = allPrizeIndex; // Индекс визуальной позиции
    
    const targetAngle = baseAngle + (visualIndex * segmentAngle) + offset;
    
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
            
            // Сохраняем время вращения
            lastSpinTime = Date.now();
            
            // Показать выигранный приз
            prizeText.textContent = currentPrize.description;
            prizeDisplay.classList.add('show');
            
            // Разблокировать кнопку получения приза
            claimButton.disabled = false;
            
            // Сохраняем данные и обновляем UI
            saveUserData();
            updateUI();
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
    
    // Добавляем приз в полученные
    const wonPrize = {
        ...currentPrize,
        wonDate: new Date().toISOString(),
        wonTimestamp: Date.now()
    };
    
    wonPrizes.push(wonPrize);
    
    // Удаляем приз из доступных
    const prizeIndex = availablePrizes.findIndex(p => p.id === currentPrize.id);
    if (prizeIndex !== -1) {
        availablePrizes.splice(prizeIndex, 1);
    }
    
    // Отправка данных в Telegram (если есть)
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.sendData(JSON.stringify({
            action: 'prize_claimed',
            prize: currentPrize.name,
            timestamp: new Date().toISOString()
        }));
    }
    
    // Сохраняем данные
    saveUserData();
    
    // Через 1.5 секунды перенаправляем
    setTimeout(() => {
        window.open(currentPrize.link, '_blank');
        
        // Обновляем UI
        updateUI();
        
        // Скрываем индикатор через 2 секунды
        setTimeout(() => {
            loading.classList.remove('show');
            
            // Сбрасываем текущий приз
            currentPrize = null;
        }, 2000);
    }, 1500);
}

// Открытие модального окна с призами
function openMyPrizes() {
    prizesModal.classList.add('show');
    updatePrizesList();
}

// Закрытие модального окна
function closeMyPrizes() {
    prizesModal.classList.remove('show');
}

// Обновление списка призов в модальном окне
function updatePrizesList() {
    if (wonPrizes.length === 0) {
        prizesList.innerHTML = `
            <div class="empty-prizes">
                <i class="fas fa-gift"></i>
                <h3>Пока нет полученных призов</h3>
                <p>Покрутите рулетку, чтобы получить первый гайд!</p>
            </div>
        `;
        return;
    }
    
    // Сортируем по дате получения (новые сверху)
    const sortedPrizes = [...wonPrizes].sort((a, b) => {
        return new Date(b.wonDate) - new Date(a.wonDate);
    });
    
    prizesList.innerHTML = '';
    
    sortedPrizes.forEach(prize => {
        const prizeDate = new Date(prize.wonDate);
        const formattedDate = prizeDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const prizeElement = document.createElement('div');
        prizeElement.className = 'prize-item';
        prizeElement.innerHTML = `
            <div class="prize-icon" style="background: ${prize.color}">
                ${prize.icon}
            </div>
            <div class="prize-info">
                <div class="prize-name">${prize.name}</div>
                <div class="prize-date">Получен: ${formattedDate}</div>
            </div>
            <button class="open-guide-btn" onclick="window.open('${prize.link}', '_blank')">
                Открыть
            </button>
        `;
        
        prizesList.appendChild(prizeElement);
    });
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
        
        // Используем ID пользователя для уникального хранения данных
        const userId = tg.initDataUnsafe?.user?.id;
        if (userId) {
            // Модифицируем ключи хранилища для конкретного пользователя
            Object.keys(STORAGE_KEYS).forEach(key => {
                STORAGE_KEYS[key] = `telegram_wheel_${userId}_${key.toLowerCase()}`;
            });
            
            // Перезагружаем данные с учетом ID пользователя
            loadUserData();
            updateUI();
        }
        
        console.log('Telegram Web App инициализирован');
    } else {
        console.log('Запуск вне Telegram - режим отладки');
        // Для отладки вне Telegram
        document.body.insertAdjacentHTML('beforeend', `
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
        `);
    }
}

// Функция сброса данных (для тестирования)
function resetData() {
    if (confirm('Вы уверены, что хотите сбросить все данные?')) {
        localStorage.removeItem(STORAGE_KEYS.LAST_SPIN);
        localStorage.removeItem(STORAGE_KEYS.WON_PRIZES);
        localStorage.removeItem(STORAGE_KEYS.AVAILABLE_PRIZES);
        
        // Перезагружаем страницу
        location.reload();
    }
}

// Добавляем кнопку сброса для тестирования (только в режиме отладки)
if (!window.Telegram) {
    document.addEventListener('DOMContentLoaded', () => {
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Сбросить данные (тест)';
        resetBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: #ff4444;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
            cursor: pointer;
        `;
        resetBtn.onclick = resetData;
        document.body.appendChild(resetBtn);
    });
}
