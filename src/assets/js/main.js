$(function () {
    // Fix Header Scroll
    $(window).on('scroll', function () {
        if ($(window).scrollTop() > 0) {
            if (!$("header").hasClass("fixed_header")) {
                $("header").addClass("fixed_header");
            }
        } else {
            if ($("header").hasClass("fixed_header")) {
                $("header").removeClass("fixed_header");
            }
        }
    });

    // Плавный Scroll main menu + Скролл по arrow! .arrow__content_icon,
    $("#header__menu_links li a, .home__arrow_down, .header__logo_symbol, .amazing__tours_arrow").on('click', function (e) {
        e.preventDefault();
        const top = $($(this).attr("href")).offset().top - 60;
        $('body,html').animate({
            scrollTop: top + 'px'
        }, 1100);
    });

    // Active menu при scroll
    let sections = $('section'),
        nav = $('.nav__menu'),
        navHeight = nav.outerHeight();
    $(window).on('scroll', function () {
        let curPos = $(this).scrollTop();
        sections.each(function () {
            let top = $(this).offset().top - navHeight,
                bottom = top + $(this).outerHeight();
            if (curPos >= top && curPos <= bottom) {
                nav.find('a').removeClass('active');
                sections.removeClass('active');
                $(this).addClass('active');
                nav.find('a[href="#' + $(this).attr('id') + '"]').addClass('active');
            }
        });
    });
    nav.find('a').on('click', function () {
        let $el = $(this),
            id = $el.attr('href');
        $('html, body').animate({
            scrollTop: $(id).offset().top - navHeight
        }, 500);
        return false;
    });

    // Hamburger-menu
    $(".hamburger, .page_overlay").on('click', function () {
        $(".mobile_menu_wrap .hamburger").toggleClass("is-active");
        $("body").toggleClass("open");
    });
    // Закрытие меню бургер при нажатии на пунты меню, кнопку callback и на логотип
    $(".sidemenu ul li a, .mobile__btn, .mobile__logo_symbol").on('click', function () {
        $("body").removeClass("open");
    });

    // Модальное окно 
    // открыть по кнопке callback
    $('.callback__btn, .item__service_contact a').click(function () {
        $('.modal__callback').fadeIn();
        $('.modal__callback').addClass('disabled');
    });
    // закрыть на крестик callback + order tour
    $('.callback__close_btn, .modal__close_btn').click(function () {
        $('.modal__callback, .booking__modal').fadeOut(600); // закрытие с плавной анимацией, где 600 это время в мс
    });
    // закрыть по клику вне окна callback + order tour
    $(document).mouseup(function (e) {
        let popup = $('.callback__content, .modal__field');
        if (e.target != popup[0] && popup.has(e.target).length === 0) {
            $('.modal__callback, .booking__modal').fadeOut(600);
        }
    });
    // закрыть по ESC
    $(document).on('keydown', function (event) {
        if (event.keyCode == 27) {
            $('.modal__callback, .booking__modal').fadeOut(600);
        }
    });

    // Маска номера телефона для модалок
    $(function () {
        $('#callback_phone, #booking_phone').mask('+38 (099) 999-99-9?9');
    });

    // Маска e-mail address для модалки
    $('#booking_email[type=email]').on('blur', function (e) {
        e.preventDefault();
        let email = $(this).val();
        if (email.length > 0 && (email.match(/.+?\@.+/g) || []).length !== 1) {
            Swal.fire({
                position: 'top-end',
                icon: 'warning',
                title: 'Fill right email address!',
                showConfirmButton: false,
                timer: 3000
            });
        }
    });

    //  константы для Telegram BOT
    const BOT_TOKEN = '5167653908:AAFXB-D-kZfDWFFxheBEfRZi22U0J-Nos9c';
    const CHAT_ID = '-1001773732504';

    // Отправка формы callback на Telegram BOT
    $("#my_callback-form").on('submit', function (e) {
        e.preventDefault();
        let nameInputCallback = document.getElementById('callback_name');
        let phoneInputCallback = document.getElementById('callback_phone');
        let textCallback = encodeURI(`Name: ${nameInputCallback.value}, Phone: ${phoneInputCallback.value}`);
        if (nameInputCallback.value !== '' && phoneInputCallback.value !== '') {
            $.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=` + textCallback + 
            '&parse_mode=html', (json) => {
                console.log(json);
                if (json.ok) {
                    $("#my_callback-form").trigger('reset');
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Your message send!',
                        showConfirmButton: false,
                        timer: 3000
                    });
                    // Закрытие формы callback после успешной отправки
                    $('.modal__callback').fadeOut(600);
                }
            });
        } else {
            Swal.fire({
                position: 'top-end',
                icon: 'warning',
                title: 'Fill all field!',
                showConfirmButton: false,
                timer: 3000
            });
        }
    });

    // Динамические карты блока place
    async function getCard() {
        await $.ajax({
            url: 'assets/common/card.json',
            type: 'get',
            dataType: 'json',
            success: function (json) {
                let html = '';
                json.forEach((card) => {
                    html += `
                        <li class="card__item card-first wow animate__zoomIn" data-wow-duration="2s">
                            <div class="card__image" id="card-img">
                                <a class="card__image_link colorbox" data-fancybox="group-1" 
                                href="assets/images/place_image/${card.pic.bigImage}" title="${card.title}">
                                    <img class="card__pic"
                                        src="assets/images/place_image/${card.pic.image}" alt="place_image">
                                    <div class="card__price">${card.pic.price}</div>
                                </a>
                            </div>
                            <div class="card__content">
                                <div class="card__title">
                                    <h6>${card.title}</h6>
                                </div>
                                <div class="card__subtitle subtitle">
                                    <p>${card.description}</p>
                                </div>
                                <div class="card__link">
                                    <button type="button" class="card__link_text text_orange" id="card_btn">
                                    ${card.link}</button>
                                </div>
                            </div>
                        </li>
                    `;
                });

                $("#page_card").append(html);
                $("#card_tour").slick('slickAdd', html);
            },
            error: function () {
                // modal window sweet-aler2
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Oops...',
                    text: "The tour-cards don't load!",
                    showConfirmButton: false,
                    timer: 4000
                });
            }
        });
        // открыть по кнопке
        $('#booking_btn, #card_btn').click(function () {
            $('.booking__modal').fadeIn();
            $('.booking__modal').addClass('disabled');
        });

        // colorbox plugin
        $("a.card__image_link").colorbox({
                maxWidth: "98%",
                maxHeight: "98%",
                closeButton: "true"
        });
    }

    // Slick-slider Place
    $('#card_tour').slick({
        infinite: true,
        speed: 900,
        dots: true,
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: true,
        autoplaySpeed: 6000,
        responsive: [{
                breakpoint: 999,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    // arrows: false,
                }
            }
        ]
    });

    // Модальное окно order tour
    getCard();
     // Отправка формы на Telegram BOT
    $(".modal__form").on('submit', function (e) {
        e.preventDefault();
        let nameInput = document.getElementById('booking_name');
        let surnameInput = document.getElementById('booking_surname');
        let emailInput = document.getElementById('booking_email');
        let phoneInput = document.getElementById('booking_phone');
        let tourSelect = document.getElementById('choice_tour');
        let text = encodeURI(`Name: ${nameInput.value}, Surname:${surnameInput.value}, 
        Email: ${emailInput.value}, Phone: ${phoneInput.value}, Tour: ${tourSelect.value}`);
 
        if (nameInput.value !== '' && surnameInput.value !== '' && emailInput.value !== '' &&
             phoneInput.value !== '' && tourSelect.value !== '') {
            $.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=` + text + 
             '&parse_mode=html', (json) => {
                if (json.ok) {
                    $("#my_booking_form").trigger('reset');
                    Swal.fire({
                         position: 'top-end',
                         icon: 'success',
                         title: 'Your message send!',
                         showConfirmButton: false,
                         timer: 3000,
                    });
                    // Закрытие формы order tour после успешной отправки
                    $('.booking__modal').fadeOut(600);
                }
            });
        } else {
             Swal.fire({
                 position: 'top-end',
                 icon: 'warning',
                 title: 'Fill all field!',
                 showConfirmButton: false,
                 timer: 3000
            });
        }
    });

    // Динамические карты блока clients
    function getReview() {
        $.ajax({
            url: 'assets/common/review.json',
            type: 'get',
            dataType: 'json',
            success: function (json) {
                let html = '';
                json.forEach((item) => {
                    html += `
                    <li class="clients__cards">
                        <article class="clients__content">
                            <div class="clients__review subtitle">
                                <p>${item.review}
                                </p>
                            </div>
                            <div class="clients__item">
                                <div class="clients__footer">
                                    <div class="clients__avatar">
                                        <img class="clients__avatar_photo"
                                            src="assets/images/clients/${item.author.avatar}" alt="author-pic">
                                    </div>
                                    <div class="clients__info">
                                        <div class="clients__info_author">${item.author.name}</div>
                                        <div class="clients__info_occupation">${item.author.occupation}</div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </li>
                    `;
                });
                $("#review_clients").append(html);
            },
            error: function () {
                // modal window sweet-aler2
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Oops...',
                    text: "The clients-cards don't load!",
                    showConfirmButton: false,
                    timer: 4000
                });
            }
        });
    }
    getReview();

    // Подключение lightGallery
    lightGallery(document.querySelector('.gallery__album', '.album__page'), {
        plugins: [lgZoom, lgThumbnail, lgFullscreen, lgComment, lgAutoplay, lgShare],
        thumbnail: true,
        zoom: true,
        actualSize: true,
        animateThumb: true,
        zoomFromOrigin: true,
        speed: 500,
        licenseKey: 'your_license_key',
    });

    // Map Leaflet
    // инициализируем карту по клику
    $("#init_map").on('click', function () {
        // удаляем tag <a> init_map
        $(this).remove();
        // Инициализация карты
        let map = L.map('my_map').setView([24.9092452, 91.8641862], 4);
        L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        let myIcon = L.icon({
            iconUrl: 'assets/images/svg/map-pin.svg',
            iconSize: [96, 96],
            iconAnchor: [12, 41],
            popupAnchor: [36, -25],
        });
        const marker = L.marker([24.9092452, 91.8641862], {
                icon: myIcon
            }).addTo(map)
            .bindPopup(`
        <div class="map_popup">
        <img src="assets/plugins/leflet/images/map.svg" alt="map-pic">
        <div class="map_info">
            <b>Hello! <br>
            My friend!</b>
            <div class="map_info_text">You're in Flat 20, Housing state, Sylhet!</div>
            </div>
        </div>
        `);
    });

    // Инициализация WOW.js при скроле for animate.css
    new WOW().init();

});