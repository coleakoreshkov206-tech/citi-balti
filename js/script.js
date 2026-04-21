/**
 * script.js — Скрипты для сайта "Бельцы — мой город"
 * Автор: Запрудский Роман, группа 22
 *
 * Содержит:
 * 1. Мобильное меню (hamburger)
 * 2. Анимация счётчиков
 * 3. Анимация появления элементов (Intersection Observer)
 * 4. Викторина (динамически генерируемый контент)
 * 5. Обработка формы обратной связи
 * 6. Климатический виджет (динамический контент)
 * 7. Подсветка активной ссылки навигации
 * 8. Анимация заголовка на главной
 */

/* ============================================================
   1. МОБИЛЬНОЕ МЕНЮ
   ============================================================ */

/**
 * Переключает мобильное меню (hamburger)
 * Вызывается при клике на иконку меню
 */
function mobileMenu() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    nav.classList.toggle('mobile');
}

// Закрыть меню при клике на ссылку (на мобильных)
document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('nav');
    if (!nav) return;

    var links = nav.querySelectorAll('a');
    links.forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 800) {
                nav.classList.remove('mobile');
            }
        });
    });

    // Закрыть меню при изменении размера окна
    window.addEventListener('resize', function () {
        if (window.innerWidth > 800) {
            nav.classList.remove('mobile');
        }
    });

    // Подсветить активную ссылку навигации
    highlightActiveLink();

    // Запуск всех модулей
    initCounters();
    initScrollAnimation();
    initQuiz();
    initWeatherWidget();
    initHeroAnimation();
});

/* ============================================================
   2. ПОДСВЕТКА АКТИВНОЙ ССЫЛКИ НАВИГАЦИИ
   ============================================================ */

/**
 * Добавляет класс 'active' к текущей ссылке навигации
 */
function highlightActiveLink() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(function (link) {
        var linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

/* ============================================================
   3. АНИМАЦИЯ СЧЁТЧИКОВ (JavaScript-вызов №1)
   ============================================================ */

/**
 * Анимирует числовые счётчики от 0 до target-значения
 * Использует requestAnimationFrame для плавной анимации
 */
function initCounters() {
    var counters = document.querySelectorAll('.counter-num');
    if (counters.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
        observer.observe(counter);
    });
}

/**
 * Анимирует один счётчик
 * @param {HTMLElement} el — элемент с data-target
 */
function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    var start = 0;
    var duration = 1800; // мс
    var startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Функция замедления (easeOut)
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = current.toLocaleString('ru-RU');

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = target.toLocaleString('ru-RU');
        }
    }

    requestAnimationFrame(step);
}

/* ============================================================
   4. АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ (JavaScript-вызов №2)
   ============================================================ */

/**
 * Добавляет класс 'visible' к элементам при прокрутке
 * Использует Intersection Observer API
 */
function initScrollAnimation() {
    var elements = document.querySelectorAll('.loc, .info-card, .counter-card');
    if (elements.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                // Добавляем класс с небольшой задержкой для стагера
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    elements.forEach(function (el) {
        observer.observe(el);
    });
}

/* ============================================================
   5. ВИКТОРИНА — динамически генерируемый контент (JS-вызов №3)
   ============================================================ */

// Данные для викторины
var quizData = [
    {
        question: "В каком году впервые упомянуты Бельцы в документах?",
        options: ["1421 год", "1818 год", "1779 год", "1650 год"],
        correct: 0
    },
    {
        question: "Как часто называют Бельцы?",
        options: ["Южная столица Молдовы", "Северная столица Молдовы", "Столица Бессарабии", "Жемчужина Молдовы"],
        correct: 1
    },
    {
        question: "На какой реке расположены Бельцы?",
        options: ["Прут", "Днестр", "Реут", "Кула"],
        correct: 2
    },
    {
        question: "В каком году Бельцы получили официальный статус города?",
        options: ["1779", "1812", "1818", "1887"],
        correct: 2
    },
    {
        question: "Какой статус получили Бельцы в 2026 году?",
        options: ["Культурная столица ЕС", "Молодёжная столица Молдовы", "Туристическая столица", "Экономическая столица"],
        correct: 1
    }
];

var currentQuestion = 0;
var score = 0;
var answered = false;

/**
 * Инициализирует викторину — генерирует первый вопрос динамически
 */
function initQuiz() {
    var container = document.getElementById('quiz-container');
    if (!container) return;
    showQuestion();
}

/**
 * Показывает текущий вопрос (динамически создаёт HTML)
 */
function showQuestion() {
    var questionEl = document.getElementById('quiz-question');
    var optionsEl = document.getElementById('quiz-options');
    var feedbackEl = document.getElementById('quiz-feedback');
    var nextBtn = document.getElementById('quiz-next');

    if (!questionEl) return;

    var q = quizData[currentQuestion];
    answered = false;

    // Динамически генерируем контент вопроса
    questionEl.innerHTML = '<span style="color:#888; font-size:14px">Вопрос ' + (currentQuestion + 1) + ' из ' + quizData.length + '</span><br>' + q.question;
    feedbackEl.innerHTML = '';
    feedbackEl.style.color = '';
    nextBtn.style.display = 'none';

    // Динамически генерируем кнопки ответов
    optionsEl.innerHTML = '';
    q.options.forEach(function (opt, index) {
        var btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.textContent = opt;
        btn.dataset.index = index;
        btn.addEventListener('click', function () {
            if (!answered) {
                checkAnswer(index, btn);
            }
        });
        optionsEl.appendChild(btn);
    });
}

/**
 * Проверяет ответ и подсвечивает правильный/неправильный
 * @param {number} selected — выбранный индекс
 * @param {HTMLElement} btn — нажатая кнопка
 */
function checkAnswer(selected, btn) {
    answered = true;
    var q = quizData[currentQuestion];
    var feedbackEl = document.getElementById('quiz-feedback');
    var nextBtn = document.getElementById('quiz-next');
    var allBtns = document.querySelectorAll('.quiz-btn');

    // Заблокировать все кнопки
    allBtns.forEach(function (b) {
        b.style.pointerEvents = 'none';
        if (parseInt(b.dataset.index) === q.correct) {
            b.classList.add('correct');
        }
    });

    if (selected === q.correct) {
        score++;
        feedbackEl.textContent = '✅ Верно!';
        feedbackEl.style.color = '#155724';
    } else {
        btn.classList.add('wrong');
        feedbackEl.textContent = '❌ Неверно. Правильный ответ: ' + q.options[q.correct];
        feedbackEl.style.color = '#721c24';
    }

    // Кнопка "следующий" или "результат"
    if (currentQuestion < quizData.length - 1) {
        nextBtn.style.display = 'inline-block';
        nextBtn.textContent = 'Следующий вопрос →';
    } else {
        nextBtn.style.display = 'inline-block';
        nextBtn.textContent = 'Посмотреть результат';
        nextBtn.onclick = showResult;
    }
}

/**
 * Переход к следующему вопросу
 */
function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < quizData.length) {
        showQuestion();
    } else {
        showResult();
    }
}

/**
 * Показывает итоговый результат — динамически генерируемый контент
 */
function showResult() {
    var container = document.getElementById('quiz-container');
    var resultEl = document.getElementById('quiz-result');
    var resultText = document.getElementById('result-text');

    if (!container || !resultEl) return;

    container.style.display = 'none';
    resultEl.style.display = 'block';

    // Динамически генерируем текст результата
    var percent = Math.round((score / quizData.length) * 100);
    var emoji = percent >= 80 ? '🏆' : percent >= 60 ? '👍' : '📚';
    resultText.innerHTML = emoji + ' Результат: ' + score + ' из ' + quizData.length + ' (' + percent + '%)<br>';

    var comment = '';
    if (percent === 100) comment = 'Отлично! Вы настоящий эксперт по Бельцам!';
    else if (percent >= 60) comment = 'Хороший результат! Вы хорошо знаете город.';
    else comment = 'Стоит узнать больше о Бельцах! Изучите наш сайт.';

    // Создаём параграф с комментарием
    var p = document.createElement('p');
    p.textContent = comment;
    p.style.marginTop = '10px';
    resultText.appendChild(p);
}

/**
 * Перезапускает викторину
 */
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    var container = document.getElementById('quiz-container');
    var resultEl = document.getElementById('quiz-result');
    if (container) container.style.display = 'block';
    if (resultEl) resultEl.style.display = 'none';
    showQuestion();
}

/* ============================================================
   6. ОБРАБОТКА ФОРМЫ ОБРАТНОЙ СВЯЗИ (клиентская сторона)
   ============================================================ */

/**
 * Обрабатывает форму обратной связи на стороне клиента
 * Выполняет валидацию и показывает сообщение пользователю
 */
function submitForm() {
    var name = document.getElementById('fname');
    var email = document.getElementById('femail');
    var message = document.getElementById('fmessage');
    var feedback = document.getElementById('form-message');

    if (!name || !email || !message || !feedback) return;

    // Валидация полей
    if (!name.value.trim()) {
        showFormFeedback(feedback, 'Пожалуйста, введите ваше имя.', false);
        name.focus();
        return;
    }

    if (!email.value.trim() || !isValidEmail(email.value)) {
        showFormFeedback(feedback, 'Пожалуйста, введите корректный email.', false);
        email.focus();
        return;
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
        showFormFeedback(feedback, 'Сообщение должно быть не менее 10 символов.', false);
        message.focus();
        return;
    }

    // Имитация отправки (обработка на стороне клиента)
    var submitBtn = document.querySelector('.btn-submit');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }

    // Имитируем задержку сети
    setTimeout(function () {
        showFormFeedback(feedback,
            '✅ Спасибо, ' + name.value.trim() + '! Ваше сообщение отправлено. Мы ответим на ' + email.value.trim(),
            true
        );

        // Очищаем форму
        document.getElementById('fname').value = '';
        document.getElementById('femail').value = '';
        document.getElementById('fmessage').value = '';
        if (document.getElementById('fphone')) document.getElementById('fphone').value = '';

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
        }
    }, 1000);
}

/**
 * Показывает сообщение обратной связи формы
 * @param {HTMLElement} el — элемент для сообщения
 * @param {string} msg — текст сообщения
 * @param {boolean} success — успех или ошибка
 */
function showFormFeedback(el, msg, success) {
    el.textContent = msg;
    el.className = 'form-feedback ' + (success ? 'success' : 'error');
}

/**
 * Проверяет корректность email-адреса
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   7. КЛИМАТИЧЕСКИЙ ВИДЖЕТ — динамически генерируемый контент
   ============================================================ */

/**
 * Генерирует динамический контент с климатической информацией о Бельцах
 */
function initWeatherWidget() {
    var weatherDisplay = document.getElementById('weather-display');
    if (!weatherDisplay) return;

    // Данные о климате (динамически генерируется)
    var seasons = [
        { name: 'Зима', icon: '❄️', temp: '-3°C / +2°C', desc: 'Холодно, снег' },
        { name: 'Весна', icon: '🌸', temp: '+8°C / +18°C', desc: 'Тепло, цветение' },
        { name: 'Лето', icon: '☀️', temp: '+22°C / +30°C', desc: 'Жарко, солнечно' },
        { name: 'Осень', icon: '🍂', temp: '+5°C / +16°C', desc: 'Прохладно, дожди' }
    ];

    // Динамически создаём HTML для виджета
    var html = '<div class="weather-grid">';
    seasons.forEach(function (s) {
        html += '<div class="weather-card">'
            + '<div class="season">' + s.icon + ' ' + s.name + '</div>'
            + '<div class="temp">' + s.temp + '</div>'
            + '<div class="desc">' + s.desc + '</div>'
            + '</div>';
    });
    html += '</div>';

    // Определяем текущий сезон
    var month = new Date().getMonth(); // 0-11
    var currentSeason = month >= 2 && month <= 4 ? 'Весна'
        : month >= 5 && month <= 7 ? 'Лето'
        : month >= 8 && month <= 10 ? 'Осень' : 'Зима';

    html += '<p style="margin-top:14px; font-size:14px; color:#666;">📅 Сейчас в Бельцах: <strong>' + currentSeason + '</strong>. Климат умеренно-континентальный.</p>';

    weatherDisplay.innerHTML = html;
}

/* ============================================================
   8. АНИМАЦИЯ ЗАГОЛОВКА НА ГЛАВНОЙ СТРАНИЦЕ (JS-анимация)
   ============================================================ */

/**
 * Создаёт анимацию печатающегося текста для подзаголовка
 */
function initHeroAnimation() {
    var subtitle = document.getElementById('hero-subtitle');
    if (!subtitle) return;

    var texts = [
        'Северная столица Молдовы',
        'Молодёжная столица 2026',
        'Культурный центр севера',
        'Город с историей с 1421 года'
    ];
    var textIndex = 0;
    var charIndex = 0;
    var isDeleting = false;

    function typeWriter() {
        var currentText = texts[textIndex];

        if (!isDeleting) {
            // Набираем текст
            subtitle.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentText.length) {
                // Пауза перед удалением
                setTimeout(function () {
                    isDeleting = true;
                    setTimeout(typeWriter, 80);
                }, 2000);
                return;
            }
        } else {
            // Удаляем текст
            subtitle.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
            }
        }

        var speed = isDeleting ? 50 : 90;
        setTimeout(typeWriter, speed);
    }

    // Запуск с задержкой (после анимации появления)
    setTimeout(typeWriter, 1200);
}
