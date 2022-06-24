// localStorage.setItem('explore_main', false);
const exploreTrackit = function() {
    introJs()
    .setOptions({
        exitOnEsc: false, // prevent user to exit tour when pressing Esc button
        exitOnOverlayClick: false, // prevent user to exit tour when clicking overlay
        scrollToElement: true,
        showBullets: true, // steps bullets indicators
        // showProgress: true,
        skipLabel: 'Skip',
        steps: [{
            title: 'Welcome',
            intro: 'Lets get started. You can now use <b class="text-orange">Track It!</b> Explore our guide or jump right into your dashboard.'
        },
        {
            title: 'Profile',
            element: document.getElementById('intro_profile'),
            intro: 'This is where your <b class="text-orange">information</b> is present. Your name, email, department and so on.',
            position: 'right',
        },
        {
            title: 'Dashboard',
            element: document.getElementById('intro_dashboard'),
            intro: 'A visual representation of all of your data <b class="text-orange">at-a-glance</b>. Keeps you informed of the most recent reports and news.',
            position: 'right',
        },
        {
            title: 'Request',
            element: document.getElementById('intro_request'),
            intro: 'Create your requests,',
            position: 'right',
        },
        {
            title: 'User Guide',
            element: document.getElementById('intro_guide'),
            intro: 'This is where to go for a <b class="text-orange">guide</b>. Clicking this will direct you to a PDF viewer.',
            position: 'right',
        },
        {
            title: 'Notification',
            element: document.getElementById('intro_notification'),
            intro: 'Alerts you with information by a badge. <b class="text-orange">Notify</b> you with requests status and other updates.',
        },
        {
            title: 'Explore',
            element: document.getElementById('intro_explore'),
            intro: 'If you ever need <b class="text-orange">help</b>, this is where you go for tutorials and walkthrough.',
        }],
    })
    .onbeforechange(function(element) {  
        switch (element.id) { 
            case "intro_request": 
                $('#intro_request').addClass('menu-open')
            break;
            default:
                $('#intro_request').removeClass('menu-open')
        }
    })
    .onexit(function(element) {  
        localStorage.setItem('explore_main', true);
    })
    .start()
}

// const intro = JSON.parse(localStorage.getItem('explore_main'));
// if (intro == false) exploreTrackit()