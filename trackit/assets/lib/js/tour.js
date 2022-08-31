const exploreTrackit = function(request) {
    introJs()
    .setOptions({
        disableInteraction: true,
        exitOnEsc: false, // prevent user to exit tour when pressing Esc button
        exitOnOverlayClick: false, // prevent user to exit tour when clicking overlay
        scrollToElement: true,
        showBullets: true, // steps bullets indicators
        // showProgress: true,
        skipLabel: 'skip',
        steps: [{
            title: 'Welcome',
            intro: 'Lets get started. You can now use <b class="text-orange">Track It!</b> Explore our guide or jump right into your dashboard.'
        },
        {
            title: 'Profile',
            element: '#intro_profile',
            intro: 'This is where your <b class="text-orange">information</b> is present. Your name, email, department and so on.',
            position: 'right',
        },
        {
            title: 'Dashboard',
            element: '#intro_dashboard',
            intro: 'A visual representation of all of your data <b class="text-orange">at-a-glance</b>. Keeps you informed of the most recent reports and news.',
            position: 'right',
        },
        {
            title: 'Tasks',
            element: '#intro_tasks',
            intro: 'A list of every <b class="text-orange">action item</b> linked to your requests that must be accomplished.',
            position: 'right',
        },
        {
            title: 'Request',
            element: '#intro_request',
            intro: 'A table containing all of your <b class="text-orange">made requests</b>. Here, you may view and manage the details of your request.',
            position: 'right',
        },
        {
            title: 'Track',
            element: '#intro_track_request',
            intro: "To monitor the progress of your request. You can view the request logs by simply <b class='text-orange'>keeping track</b> of your ticket number.",
            position: 'right',
        },
        {
            title: 'Create',
            element: '#intro_create_request',
            intro: 'If you ever want to start <b class="text-orange">creating</b> your requests, This is where you go.',
            position: 'right',
        },
        {
            title: 'Notification',
            element: '#intro_notification',
            intro: 'Alerts you with information by a badge. <b class="text-orange">Notify</b> you with requests status and other updates.',
        },
        {
            title: 'Guide',
            element: '#intro_guide',
            intro: "Visit this page for a <b class='text-orange'>user's manual</b> with more details about Track-it. Clicking this will direct you to a PDF viewer.",
            position: 'right',
        },
        {
            title: 'Explore',
            element: '#intro_explore',
            intro: 'If you ever need <b class="text-orange">help</b>, this is where you go for tutorials and walkthrough.',
        }].filter(function (obj) {
            return document.querySelector(obj.element) !== null || obj.title === 'Welcome';
        }),
    })
    // .onbeforechange(function(element) {  
    //     switch (element.id) { 
    //         case "intro_request": 
    //             $('#intro_request').addClass('menu-open')
    //         break;
    //         default:
    //             $('#intro_request').removeClass('menu-open')
    //     }
    // })
    .onexit(function(element) {
        if (request) axiosTour(request, 'main')  
    })
    .start()
}

const exploreRequestTable = function(request) {
    introJs()
    .setOptions({
        disableInteraction: true,
        exitOnEsc: false, // prevent user to exit tour when pressing Esc button
        exitOnOverlayClick: false, // prevent user to exit tour when clicking overlay
        scrollToElement: true,
        showBullets: true, // steps bullets indicators
        // showProgress: true,
        skipLabel: 'skip',
        steps: [{
            title: 'List',
            element: '#intro_tbody',
            intro: $('#table_gif').html(),
            position: 'top',
        },
        {
            title: 'Sort',
            element: '#intro_tablehead',
            intro: 'You can <b class="text-orange">sort</b> table by clicking the column header.',
            position: 'right',
        },
        {
            title: 'Filter',
            element: '#intro_filter',
            intro: 'You can <b class="text-orange">filter rows</b> by form, category, department, status, and date.'
        },
        {
            title: 'Search',
            element: '#intro_search',
            intro: 'You can <b class="text-orange">search</b> by ticket number, reference number and description.',
            position: 'right',
        },
        {
            title: 'New',
            element: '#intro_addbutton',
            intro: 'If you ever want to start <b class="text-orange">creating</b> your requests, This is where you go.',
            position: 'left',
        }].filter(function (obj) {
            return document.querySelector(obj.element) !== null;
        }),
    })
    .onexit(function(element) {  
        if (request) axiosTour(request, 'request_list')
    })
    .start()
}

const exploreRequestNew = function(request) {
    introJs()
    .setOptions({
        disableInteraction: true,
        exitOnEsc: false, // prevent user to exit tour when pressing Esc button
        exitOnOverlayClick: false, // prevent user to exit tour when clicking overlay
        scrollToElement: true,
        showBullets: true, // steps bullets indicators
        // showProgress: true,
        skipLabel: 'skip',
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
            intro: "Click this option to access <b class='text-orange'>files</b> from your device if you have supporting documentation for your request. <i>JPG, PDF, DOC, XLS,</i> and other file kinds are accepted; the largest file size allowed is 25 MB.",
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
        if (request) axiosTour(request, 'request_new')
        location.reload();
    })
    .start()
}

const exploreRequestView = function(request) {
    introJs()
    .setOptions({
        disableInteraction: true,
        exitOnEsc: false, // prevent user to exit tour when pressing Esc button
        exitOnOverlayClick: false, // prevent user to exit tour when clicking overlay
        scrollToElement: true,
        showBullets: true, // steps bullets indicators
        // showProgress: true,
        skipLabel: 'skip',
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
        if (request) axiosTour(request, 'request_view')
    })
    .start()
}

const exploreRequestDetail = function(request) {
    introJs()
    .setOptions({
        disableInteraction: true,
        exitOnEsc: false, // prevent user to exit tour when pressing Esc button
        exitOnOverlayClick: false, // prevent user to exit tour when clicking overlay
        scrollToElement: true,
        showBullets: true, // steps bullets indicators
        // showProgress: true,
        skipLabel: 'skip',
        steps: [{
            title: 'Details',
            element: '#intro_details1',
            intro: "These are the only fields that can be <b class='text-orange'>modified</b>. Asterisk-marked (<span class='text-danger'>*</span>) fields must be completed.",
            position: 'right',
        },
        {
            title: 'Details',
            element: '#intro_details2',
            intro: "These are the only fields that can be <b class='text-orange'>modified</b>. Asterisk-marked (<span class='text-danger'>*</span>) fields must be completed.",
            position: 'right',
        },
        {
            title: 'Attachment',
            element: '#intro_browse',
            intro: "Click this option to access <b class='text-orange'>files</b> from your device if you have supporting documentation for your request. <i>JPG, PDF, DOC, XLS,</i> and other file kinds are accepted; the largest file size allowed is 25 MB.",
            position: 'top',
        },
        {
            title: 'Finalize',
            element: '#btn_update',
            intro: "To <b class='text-orange'>save your changes</b>, click this button.",
            position: 'left',
        },
        {
            title: 'Comment',
            element: '#intro_comment',
            intro: "You can also leave a <b class='text-orange'>comment</b> here if you ever need an update on your request.",
            position: 'left',
        },
        {
            title: 'View As',
            element: '#btn_view',
            intro: "To view your request in the <b class='text-orange'>view page</b>. You can go here.",
            position: 'left',
        }].filter(function (obj) {
            return document.querySelector(obj.element) !== null;
        }),
    })
    .onexit(function(element) {  
        if (request) axiosTour(request, 'request_detail')
    })
    .start()
}

const exploreProfile = function(request) {
    introJs()
    .setOptions({
        disableInteraction: true,
        exitOnEsc:  false, // prevent user to exit tour when pressing Esc button
        exitOnOverlayClick: false, // prevent user to exit tour when clicking overlay
        scrollToElement: true,
        showBullets: true, // steps bullets indicators
        // showProgress: true,
        skipLabel: 'skip',
        steps: [{
            title: 'Change Password',
            element: '#btn-change-password',
            intro: "If you need to <b class='text-orange'>change your password</b>, this is where you go.",
            position: 'right',
        },
        {
            title: 'About',
            element: '#btn-edit-profile',
            intro: "Click this to <b class='text-orange'>make changes</b> to your information. Only the email address, phone number, department, and license number can be changed.",
            position: 'top',
        },
        {
            title: 'Finalize',
            element: '#btn_update',
            intro: "To <b class='text-orange'>save your changes</b>, click this button.",
            position: 'left',
        },
        {
            title: 'Comment',
            element: '#intro_comment',
            intro: "You can also leave a <b class='text-orange'>comment</b> here if you ever need an update on your request.",
            position: 'left',
        },
        {
            title: 'View As',
            element: '#btn_view',
            intro: "To view your request in the <b class='text-orange'>view page</b>. You can go here.",
            position: 'left',
        }].filter(function (obj) {
            return document.querySelector(obj.element) !== null;
        }),
    })
    .onexit(function() {
        if (request) axiosTour(request, 'profile')
    })
    .start()
}

const exploreTask = function(request) {
    introJs()
    .setOptions({
        disableInteraction: true,
        exitOnEsc: false, // prevent user to exit tour when pressing Esc button
        exitOnOverlayClick: false, // prevent user to exit tour when clicking overlay
        scrollToElement: true,
        showBullets: true, // steps bullets indicators
        // showProgress: true,
        skipLabel: 'skip',
        steps: [{
            title: 'List',
            element: '#intro_list',
            intro: $('#table_tasks_gif').html(),
        },
        {
            title: 'Sort',
            element: '#intro_tablehead',
            intro: 'You can <b class="text-orange">sort</b> table by clicking the column header.',
            position: 'right',
        },
        {
            title: 'Search',
            element: '#intro_search_mytask',
            intro: 'You can <b class="text-orange">search</b> by ticket number, reference number and description.'
        },
        {
            title: 'Tabs',
            element: '#intro_task',
            intro: 'By selecting <b class="text-orange">tabs</b>, you can change the table view. Switching on to the to-do list or completed tasks'
        },
        {
            title: 'Tasks',
            element: '#intro_open',
            intro: 'Not all tasks are assigned to you directly. Lists of <b class="text-orange">open tasks</b> are available in this panel.'
        }].filter(function (obj) {
            return document.querySelector(obj.element) !== null;
        }),
    })
    .onexit(function(element) {  
        if (request) axiosTour(request, 'task')
        console.log(request)
    })
    .start()
}

const axiosTour = function(request, tour) {
    // set data values;
    let data = new Object()
    switch (request.method) {
        case "POST":
            data.is_explore_main = (tour == 'main') ? true : false;
            data.is_explore_req_list = (tour == 'request_list') ? true : false;
            data.is_explore_req_new = (tour == 'request_new') ? true : false;
            data.is_explore_req_view = (tour == 'request_view') ? true : false;
            data.is_explore_req_detail = (tour == 'request_detail') ? true : false;
            data.is_explore_profile = (tour == 'profile') ? true : false;
            data.is_explore_task = (tour == 'task') ? true : false;
        break;
        case "PUT":
            if (tour == 'main') data.is_explore_main = true;
            if (tour == 'request_list') data.is_explore_req_list = true;
            if (tour == 'request_new') data.is_explore_req_new = true;
            if (tour == 'request_view') data.is_explore_req_view = true;
            if (tour == 'request_detail') data.is_explore_req_detail = true;
            if (tour == 'profile') data.is_explore_profile = true;
            if (tour == 'task') data.is_explore_task = true;
        break;
    }
    axios({
        method: request.method,
        url: request.url,
        data: data,
        headers: axiosConfig,
    }).catch(err => { // error
        toastError(err.response.statusText) // alert
    });      
}