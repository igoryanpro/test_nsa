// КОНФИГУРАЦИЯ - ЗАМЕНИТЕ ССЫЛКИ НА СВОИ!
const ALL_PRIZES = [
    {
        id: 1,
        name: "Гайд №1",
        description: "🎉 Поздравляем! Вы выиграли Гайд №1!",
        link: "https://drive.google.com/file/d/1dkJZV46zi5vY0Gji_iQacjUTBfttCu_p/view",
        color: "#FF6B6B",
        icon: "📚"
    },
    {
        id: 2,
        name: "Гайд №2", 
        description: "🎊 Ура! Вы выиграли Гайд №2!",
        link: "https://drive.google.com/file/d/1dkJZV46zi5vY0Gji_iQacjUTBfttCu_p/view",
        color: "#4ECDC4",
        icon: "🎯"
    },
    {
        id: 3,
        name: "Гайд №3",
        description: "🌟 Отлично! Вы выиграли Гайд №3!",
        link: "https://drive.google.com/file/d/1dkJZV46zi5vY0Gji_iQacjUTBfttCu_p/view",
        color: "#FFD166",
        icon: "🚀"
    },
    {
        id: 4,
        name: "Гайд №4",
        description: "🔥 Потрясающе! Вы выиграли Гайд №4!",
        link: "https://drive.google.com/file/d/1dkJZV46zi5vY0Gji_iQacjUTBfttCu_p/view",
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
    initApp();
});

// Основная функция инициализации
function initApp() {
    console.log('Инициализация приложения...');
    
    // Инициализируем Telegram
    initTelegram();
    
    // Загружаем данные из localStorage
    loadUserData();
    
    // Обновляем интерфейс
    updateUI();
    
    // Назначаем обработчики кнопок
    initEventListeners();
    
    // Инициализация рулетки
    wheel.style.transform = 'rotate(0deg)';
    
    // Обновляем таймер каждую секунду
    updateTimer();
    setInterval(updateTimer, 1000);
    
    console.log('Приложение инициализировано');
    console.log('Доступных призов:', availablePrizes.length);
    console.log('Полученных призов:', wonPrizes.length);
}

// Инициализация обработчиков событий
function initEventListeners() {
    // Кнопка вращения рулетки
    if (spinButton) {
        spinButton.addEventListener('click', spinWheel);
    }
    
    // Кнопка получения приза
    if (claimButton) {
        claimButton.addEventListener('click', claimPrize);
    }
    
    // Кнопка "Ваши призы" в статистике
    const myPrizesBtn = document.querySelector('.stats-bar .open-guide-btn');
    if (myPrizesBtn) {
        myPrizesBtn.addEventListener('click', openMyPrizes);
        console.log('Кнопка "Ваши призы" найдена и обработчик назначен');
    } else {
        console.log('Кнопка "Ваши призы" не найдена!');
        // Создаем кнопку вручную, если она не найдена
        createMyPrizesButton();
    }
    
    // Кнопка закрытия модального окна
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeMyPrizes);
    }
    
    // Закрытие модального окна при клике на overlay
    if (prizesModal) {
        prizesModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeMyPrizes();
            }
        });
    }
}

// Создание кнопки "Ваши призы", если она не найдена
function createMyPrizesButton() {
    const statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;
    
    const myPrizesBtn = document.createElement('button');
    myPrizesBtn.className = 'open-guide-btn';
    myPrizesBtn.style.cssText = 'background: transparent; color: white; padding: 5px 10px; border: none; cursor: pointer;';
    myPrizesBtn.innerHTML = '<i class="fas fa-history"></i> Ваши призы';
    myPrizesBtn.addEventListener('click', openMyPrizes);
    
    statsBar.appendChild(myPrizesBtn);
    console.log('Кнопка "Ваши призы" создана программно');
}

// Инициализация Telegram Web App
function initTelegram() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.ready();
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', () => tg.close());
        console.log('Telegram Web App инициализирован');
    } else {
        console.log('Запуск вне Telegram - режим отладки');
        addDebugInfo();
    }
}

// Добавление отладочной информации
function addDebugInfo() {
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: red;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1000;
    `;
    debugDiv.textContent = 'Режим отладки';
    document.body.appendChild(debugDiv);
}

// Загрузка данных пользователя
function loadUserData() {
    const lastSpinStr = localStorage.getItem(STORAGE_KEYS.LAST_SPIN);
    lastSpinTime = lastSpinStr ? parseInt(lastSpinStr) : null;
    
    const wonPrizesStr = localStorage.getItem(STORAGE_KEYS.WON_PRIZES);
    wonPrizes = wonPrizesStr ? JSON.parse(wonPrizesStr) : [];
    
    const availablePrizesStr = localStorage.getItem(STORAGE_KEYS.AVAILABLE_PRIZES);
    if (availablePrizesStr) {
        availablePrizes = JSON.parse(availablePrizesStr);
    } else {
        availablePrizes = [...ALL_PRIZES];
        saveAvailablePrizes();
    }
    
    if (availablePrizes.length === 0) {
        spinButton.disabled = true;
        spinButton.innerHTML = '<i class="fas fa-check-circle"></i> Все призы получены!';
    }
}

// Сохранение данных
function saveUserData() {
    if (lastSpinTime) {
        localStorage.setItem(STORAGE_KEYS.LAST_SPIN, lastSpinTime.toString());
    }
    localStorage.setItem(STORAGE_KEYS.WON_PRIZES, JSON.stringify(wonPrizes));
    saveAvailablePrizes();
}

function saveAvailablePrizes() {
    localStorage.setItem(STORAGE_KEYS.AVAILABLE_PRIZES, JSON.stringify(availablePrizes));
}

// Обновление интерфейса
function updateUI() {
    availablePrizesEl.textContent = availablePrizes.length;
    wonPrizesEl.textContent = wonPrizes.length;
    updateWheelColors();
    updateSpinButton();
    updatePrizesList();
}

// Обновление цветов рулетки
function updateWheelColors() {
    const colors = ['#CCCCCC', '#CCCCCC', '#CCCCCC', '#CCCCCC'];
    
    availablePrizes.forEach((prize, index) => {
        if (index < 4) {
            colors[index] = prize.color;
            const textElement = document.getElementById(`text${index + 1}`);
            if (textElement) {
                textElement.textContent = prize.name;
                textElement.classList.remove('claimed');
            }
        }
    });
    
    ALL_PRIZES.forEach(prize => {
        const isWon = wonPrizes.some(wonPrize => wonPrize.id === prize.id);
        if (isWon) {
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
            spinButton.disabled = true;
            spinButton.innerHTML = '<i class="fas fa-clock"></i> Завтра снова';
            timerContainer.style.display = 'block';
        } else {
            spinButton.disabled = false;
            spinButton.innerHTML = '<i class="fas fa-play-circle"></i> Крутить рулетку';
            timerContainer.style.display = 'none';
        }
    } else {
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
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        const formattedTime = 
            `${hours.toString().padStart(2, '0')}:` +
            `${minutes.toString().padStart(2, '0')}:` +
            `${seconds.toString().padStart(2, '0')}`;
        
        timer.textContent = formattedTime;
    } else {
        timerContainer.style.display = 'none';
        updateSpinButton();
    }
}

// Функция вращения рулетки
function spinWheel() {
    if (isSpinning || availablePrizes.length === 0) return;
    
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
    
    const prizeIndex = Math.floor(Math.random() * availablePrizes.length);
    currentPrize = availablePrizes[prizeIndex];
    
    const allPrizeIndex = ALL_PRIZES.findIndex(p => p.id === currentPrize.id);
    const baseAngle = 1080;
    const segmentAngle = 90;
    const offset = 45;
    const visualIndex = allPrizeIndex;
    
    const targetAngle = baseAngle + (visualIndex * segmentAngle) + offset;
    
    wheel.style.transition = 'none';
    wheel.style.transform = `rotate(${currentRotation % 360}deg)`;
    
    setTimeout(() => {
        wheel.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
        wheel.style.transform = `rotate(${currentRotation + targetAngle}deg)`;
        
        currentRotation += targetAngle;
        
        setTimeout(() => {
            isSpinning = false;
            lastSpinTime = Date.now();
            prizeText.textContent = currentPrize.description;
            prizeDisplay.classList.add('show');
            claimButton.disabled = false;
            saveUserData();
            updateUI();
        }, 4000);
    }, 50);
}

// Функция получения приза
function claimPrize() {
    if (!currentPrize) return;
    
    loading.classList.add('show');
    prizeDisplay.classList.remove('show');
    claimButton.disabled = true;
    
    const wonPrize = {
        ...currentPrize,
        wonDate: new Date().toISOString(),
        wonTimestamp: Date.now()
    };
    
    wonPrizes.push(wonPrize);
    
    const prizeIndex = availablePrizes.findIndex(p => p.id === currentPrize.id);
    if (prizeIndex !== -1) {
        availablePrizes.splice(prizeIndex, 1);
    }
    
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.sendData(JSON.stringify({
            action: 'prize_claimed',
            prize: currentPrize.name,
            timestamp: new Date().toISOString()
        }));
    }
    
    saveUserData();
    
    setTimeout(() => {
        openGuide(currentPrize.link);
        updateUI();
        
        setTimeout(() => {
            loading.classList.remove('show');
            currentPrize = null;
        }, 2000);
    }, 1500);
}

// Функция открытия гайда
function openGuide(link) {
    console.log('Пытаюсь открыть ссылку:', link);
    
    // Проверяем, что ссылка существует и валидна
    if (!link || link.includes('ВАША_ССЫЛКА')) {
        alert('Ссылка на гайд не настроена. Пожалуйста, сообщите администратору.');
        return;
    }
    
    // Проверяем, запущено ли в Telegram Web App
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        // Используем метод Telegram для открытия ссылок
        tg.openLink(link);
        console.log('Открываю ссылку через Telegram Web App');
    } else {
        // Открываем в новом окне в обычном браузере
        window.open(link, '_blank', 'noopener,noreferrer');
        console.log('Открываю ссылку в новом окне');
    }
}

// Открытие модального окна с призами
function openMyPrizes() {
    console.log('Функция openMyPrizes вызвана');
    if (prizesModal) {
        prizesModal.classList.add('show');
        updatePrizesList();
    } else {
        console.error('Элемент prizesModal не найден!');
    }
}

// Закрытие модального окна
function closeMyPrizes() {
    if (prizesModal) {
        prizesModal.classList.remove('show');
    }
}

// Обновление списка призов (ИСПРАВЛЕННАЯ ВЕРСИЯ)
function updatePrizesList() {
    console.log('Обновление списка призов. Получено:', wonPrizes.length);
    
    if (!prizesList) {
        console.error('Элемент prizesList не найден!');
        return;
    }
    
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
    
    // Очищаем список
    prizesList.innerHTML = '';
    
    // Создаем элементы призов с правильными обработчиками
    sortedPrizes.forEach(prize => {
        const prizeDate = new Date(prize.wonDate);
        const formattedDate = prizeDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        // Создаем элементы через DOM API
        const prizeElement = document.createElement('div');
        prizeElement.className = 'prize-item';
        
        // Иконка приза
        const prizeIcon = document.createElement('div');
        prizeIcon.className = 'prize-icon';
        prizeIcon.style.background = prize.color;
        prizeIcon.textContent = prize.icon;
        
        // Информация о призе
        const prizeInfo = document.createElement('div');
        prizeInfo.className = 'prize-info';
        
        const prizeName = document.createElement('div');
        prizeName.className = 'prize-name';
        prizeName.textContent = prize.name;
        
        const prizeDateEl = document.createElement('div');
        prizeDateEl.className = 'prize-date';
        prizeDateEl.textContent = `Получен: ${formattedDate}`;
        
        prizeInfo.appendChild(prizeName);
        prizeInfo.appendChild(prizeDateEl);
        
        // Кнопка "Открыть"
        const openButton = document.createElement('button');
        openButton.className = 'open-guide-btn';
        openButton.textContent = 'Открыть';
        
        // Добавляем обработчик клика
        openButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Останавливаем всплытие
            console.log('Кнопка "Открыть" нажата для:', prize.name);
            openGuide(prize.link);
        });
        
        // Добавляем hover эффект для всей карточки
        prizeElement.addEventListener('click', function(e) {
            // Если клик не на кнопке "Открыть", тоже открываем гайд
            if (e.target !== openButton && !e.target.closest('.open-guide-btn')) {
                console.log('Клик по карточке, открываю гайд:', prize.name);
                openGuide(prize.link);
            }
        });
        
        // Собираем карточку
        prizeElement.appendChild(prizeIcon);
        prizeElement.appendChild(prizeInfo);
        prizeElement.appendChild(openButton);
        
        prizesList.appendChild(prizeElement);
    });
}

// Сброс данных для тестирования
function resetData() {
    if (confirm('Вы уверены, что хотите сбросить все данные?')) {
        localStorage.clear();
        location.reload();
    }
}

// Делаем функции глобально доступными
window.openMyPrizes = openMyPrizes;
window.closeMyPrizes = closeMyPrizes;
window.spinWheel = spinWheel;
window.claimPrize = claimPrize;
window.resetData = resetData;
window.openGuide = openGuide;

// Добавляем кнопку сброса для тестирования (только в режиме отладки)
if (!window.Telegram) {
    document.addEventListener('DOMContentLoaded', () => {
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 Сбросить данные';
        resetBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: #ff4444;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        resetBtn.onclick = resetData;
        document.body.appendChild(resetBtn);
    });
}
