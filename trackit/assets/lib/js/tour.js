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
    .oncomplete(function(element) {  
        localStorage.setItem('explore_main', true);
    })
    .start()
}

const exploreRequestTable = function() {
    introJs()
    .setOptions({
        disableInteraction: true,
        exitOnEsc: false, // prevent user to exit tour when pressing Esc button
        exitOnOverlayClick: false, // prevent user to exit tour when clicking overlay
        scrollToElement: true,
        showBullets: true, // steps bullets indicators
        // showProgress: true,
        skipLabel: 'Skip',
        steps: [{
            title: 'Filter',
            element: document.getElementById('intro_filter'),
            intro: 'You can <b class="text-orange">filter rows</b> by form, category, department, status, and date.'
        },
        {
            title: 'Search',
            element: document.getElementById('intro_search'),
            intro: 'You can <b class="text-orange">search</b> by ticket number, reference number and description.',
            position: 'right',
        },
        {
            title: 'Sort',
            element: document.getElementById('intro_tablehead'),
            intro: 'You can <b class="text-orange">sort</b> table by clicking the column header.',
            position: 'right',
        },
        {
            title: 'New',
            element: document.getElementById('intro_addbutton'),
            intro: 'If you ever want to start <b class="text-orange">creating</b> your requests, This is where you go.',
            position: 'left',
        }],
    })
    .onexit(function(element) {  
        localStorage.setItem('explore_requesttbl', true);
    })
    .oncomplete(function(element) {  
        localStorage.setItem('explore_requesttbl', true);
    })
    .start()
}

const exploreRequestNew = function() {
    introJs()
    .setOptions({
        disableInteraction: true,
        exitOnEsc: false, // prevent user to exit tour when pressing Esc button
        exitOnOverlayClick: false, // prevent user to exit tour when clicking overlay
        scrollToElement: true,
        showBullets: true, // steps bullets indicators
        // showProgress: true,
        skipLabel: 'Skip',
        steps: [{
            title: 'Title',
            element: document.getElementById('intro_title'),
            intro: "Let's begin by providing a brief <b class='text-orange'>description or title</b> for your request."
        },
        {
            title: 'Request Form',
            element: document.getElementById('intro_form'),
            intro: "Choose a <b class='text-orange'>request form</b> that caters to your needs. <i>(e.g., System Service Request, User Account Form, and more)</i>.",
            position: 'right',
        },
        {
            title: 'Category Type',
            element: document.getElementById('intro_type'),
            intro: "Choose a <b class='text-orange'>category type</b> <i>(e.g., Web Application, Biomachine, Online Meeting, and more)</i>. This may depend on your selected request form.",
            position: 'right',
        },
        {
            title: 'Categories',
            element: document.getElementById('intro_category'),
            intro: "Choose a <b class='text-orange'>category</b> <i>(e.g., HIS, EHR, DTR, and more)</i>. This may depend on your selected category type. You can select multiple categories.",
            position: 'left',
        },
        {
            title: 'Form Fields',
            element: document.getElementById('intro_formfield'),
            intro: "Complete all the <b class='text-orange'>fields</b> marked with an asterisk (<span class='text-danger'>*</span>) to provide more information about your request. Depending on the request form you choose, some fields could vary.",
            position: 'top',
        },
        {
            title: 'Attachments',
            element: document.getElementById('intro_browse'),
            intro: "Click this option to access <b class='text-orange'>files</b> from your computer if you have supporting documentation for your request. <i>JPG, PDF, DOC, XLS,</i> and other file kinds are accepted; the largest file size allowed is 25 MB.",
            position: 'top',
        },
        {
            title: 'Submit',
            element: document.getElementById('btn_submit'),
            intro: "Finally, click this button to <b class='text-orange'>submit</b> your request.",
            position: 'top',
        },
        {
            title: 'Complete',
            // element: document.getElementById('btn_submit'),
            intro: "You can now start <b class='text-orange'>creating</b> your requests.",
            position: 'top',
        }],
    })
    .onbeforechange(function(element) {  
        console.log(element.id)
        switch (element.id) { 
            case "intro_title": 
                $('#txt_description').val('An error occured on the system (For demonstration purposes only)');
            break;
            case "intro_form":
                var first_op = $('#select2_requestform option:eq(1)').val();
                $('#select2_requestform').val(first_op).trigger('change');
            break;
            case "intro_type":
                var first_op = $('#select2_categorytype option:eq(1)').val();
                $('#select2_categorytype').val(first_op).trigger('change');
            break;
            case "intro_category":
                var options = new Array($('#select2_category option:eq(1)').val(), $('#select2_category option:eq(2)').val())
                $('#select2_category').val(options).trigger('change');
            break;
        }
    })
    .onexit(function(element) {  
        localStorage.setItem('explore_requestnew', true);
        location.reload();
    })
    .oncomplete(function(element) {  
        localStorage.setItem('explore_requestnew', true);
        location.reload();
    })
    .start()
}

// const intro = JSON.parse(localStorage.getItem('explore_main'));
// if (intro == false) exploreTrackit()