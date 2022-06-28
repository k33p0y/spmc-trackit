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

const exploreRequestView = function() {
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
            title: 'Information',
            element: '#intro_information',
            intro: "This panel displays the <b class='text-orange'>specifics of your request</b>. The ticket number, the reference number, the date requested, the status, and so on."
        },
        {
            title: 'Details',
            element: '#intro_details',
            intro: "This is an <b class='text-orange'>overview of your request</b> based on the information provided on the request form.",
            position: 'right',
        },
        {
            title: 'Event',
            element: '#intro_event',
            intro: "Select an <b class='text-orange'>event</b> for this current status. This field may not be in another status or step.",
            position: 'left',
        },
        {
            title: 'Schedule',
            element: '#intro_schedule',
            intro: "Select a <b class='text-orange'>schedule</b> from the event you've chosen. The dates in this dropdown may differ depending on the event selected. This field may not be in another status or step.",
            position: 'left',
        },
        {
            title: 'Remarks',
            element: '#intro_remarks',
            intro: "Before performing an action, you may leave a <b class='text-orange'>remark</b> for the current status.",
            position: 'left',
        },
        {
            title: 'Action',
            element: '#intro_action',
            intro: "If the status or step ever needs to be <b class='text-orange'>changed</b>. This is where you go. <br> The orange button advances one step, while the red button reverses. This button may differ from other steps. <i>(i.e., Approve & Disapprove, Pass & Fail, and Proceed)</i>.",
            position: 'left',
        },
        {
            title: 'Comment',
            element: '#intro_comment',
            intro: "You can leave a <b class='text-orange'>comment</b> here if you ever need an update on your request.",
            position: 'left',
        },
        {
            title: 'Logs',
            element: '#intro_logs',
            intro: "If you need to see the <b class='text-orange'>previous actions</b> of your request, this is where you go.",
            position: 'left',
        },
        {
            title: 'Update',
            element: '#intro_update',
            intro: "To <b class='text-orange'>change</b> the details of your request, click this to go to the update page.",
            position: 'left',
        }].filter(function (obj) {
            return document.querySelector(obj.element) !== null;
        }),
    })
    .onexit(function(element) {  
    })
    .oncomplete(function(element) {  
    })
    .start()
}

// const intro = JSON.parse(localStorage.getItem('explore_main'));
// if (intro == false) exploreTrackit()