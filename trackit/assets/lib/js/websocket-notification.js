// HOST, PROTOCOL constants
const wsStart = window.location.protocol == "https:" ? "wss://" : "ws://";
let url_ws_notification = wsStart + window.location.host + '/ws/notifications/';
const socket_notification = new WebSocket(url_ws_notification)

socket_notification.onopen = function (event) {
    $('.online-status, .profile-online-status').removeClass('d-none')
    getAllNotifications();
    getTasksNotification();
}

socket_notification.onmessage = function (event) {
    if ('notification' in JSON.parse(event.data)) {
        getAllNotifications(); // Notifications
        getTasksNotification(); // Task Counter
    }
}

socket_notification.onclose = function (event) {
    $('.online-status, .profile-online-status').addClass('d-none');
}

socket_notification.onerror = function (event) {
    console.log(event)
    console.log('something went wrong')
}

let getAllNotifications = function (page) {
    getUserNotifications(page).then(data => {
        let notifications = data.results;
        let next_page_url = data.next;

        if (next_page_url) { // check if there is next page to comment list API
           if (next_page_url.includes('socket')){ // check if host == socket
              if (wsStart == 'wss://') next_page_url = next_page_url.replace('http://', 'https://');
              $('#notification-nextpage-url').val(next_page_url.replace('socket', window.location.host)); // change socket host to window.location.host
           } else $('#notification-nextpage-url').val(next_page_url);
        } else $('#notification-nextpage-url').val(null);

        if (data.count) { // if notification is available
            if (data.count > 0) {
                $('.new-notifications-count, .notifications-count').html(data.count); // display unread notification to bell
                $('#clear-all-notifications').removeClass('d-none')
            }
            // var saveDropdown = $('.dropdown-notifications-div .dropdown-body').detach();
            if (!page) $('.dropdown-notifications-div .dropdown-body').empty();
            for (i = 0; i < notifications.length; i++) {
                let model = JSON.parse(notifications[i].log.object_json_repr)
                if (model[0].model === 'requests.ticket') displayTicketNotification(notifications[i]);
                if (model[0].model === 'requests.comment') displayCommentNotification(notifications[i]);
                if (model[0].model === 'core.user') displayUserNotification(notifications[i]);
                if (model[0].model === 'tasks.task') displayTaskNotification(notifications[i]);
                if (model[0].model === 'tasks.opentask') displayOpenTaskNotification(notifications[i]);
                if (model[0].model === 'tasks.team') displayTaskTeamNotification(notifications[i]);
            }
            $('.dropdown-notifications-div .dropdown-body a').click(function () {
                localStorage.setItem("notification-id", $(this).attr('data-notification-id'));
                localStorage.setItem("ticketNumber", $(this).attr('data-ticket-no'));
                localStorage.setItem("user-id", $(this).attr('data-user-id'));
                localStorage.setItem("task-id", $(this).attr('data-task-id'));
            })
        } else {
            displayEmptyNotification();
            $('#clear-all-notifications').addClass('d-none')
            $('.new-notifications-count').html('');
            $('.notifications-count').html(data.count);
        }
    });
};

let displayTicketNotification = function (notification) {
    let object_json_repr = JSON.parse(notification.log.object_json_repr)
    let ticket_no = object_json_repr[0].fields.ticket_no
    let description = object_json_repr[0].fields.description
    let requested_by = object_json_repr[0].fields.requested_by
    let changed_fields = notification.log.changed_fields
    created_by = `${notification.log.user.first_name} ${notification.log.user.last_name}`  // creator of the notification
    user = `${notification.user.first_name} ${notification.user.last_name}`
    if (created_by === user) created_by = 'You'; // if the authenticated user is the requestor of the ticket
    if (requested_by === notification.user.id) requestor = 'your'
    else {
        apostrophe = (notification.log.ticket.requestor.charAt(notification.log.ticket.requestor.length-1) === 's') ? `'` : `'s`
        requestor = `<b>${notification.log.ticket.requestor}${apostrophe}</b>`
    }
    icon = 'fa-ticket-alt'
    color = 'bg-primary'
    action = `${notification.log.event_type}`
    context = ''
    time_from_now = moment(notification.log.datetime).fromNow()
    if (action === 'Create') action = `created a new request.`;
    else if (action === 'Update') {
        if (notification.log.remarks) {
            if (notification.log.remarks.is_approve) { // approved
                icon = 'fa-check'
                action = `approved ${requestor} request ticket <b>${ticket_no}</b>.`
            } else if (notification.log.remarks.is_approve == false) { // disapproved
                icon = 'fa-times'
                color = 'bg-danger'
                action = `disapproved ${requestor} request ticket <b>${ticket_no}</b>.`
            } else if (notification.log.remarks.is_pass) { // passed
                if (requested_by === notification.user.id) requestor = 'a'
                icon = 'fa-check'
                action = `passed ${requestor} request ticket <b>${ticket_no}</b>.`
            } else if (notification.log.remarks.is_pass == false) { // failed
                icon = 'fa-times'
                color = 'bg-danger'
                action = `failed ${requestor} request ticket <b>${ticket_no}</b>.`
            } else action = `moved status to <b>${changed_fields.status[1]}</b> on ticket <b>${ticket_no}</b>.`
        } else {
            determiner = (user === notification.log.ticket.requestor) ? 'to your' : 'in a';
            if (Object.keys(changed_fields).length > 1){
                items = Object.keys(changed_fields).map(function(item) {
                    if (item == 'description') item = 'Title/Description'
                    if (item == 'form_data') item = 'Request Details'
                    if (item == 'reference_no') item = 'Reference Number'
                    return item;
                }).join(' • ')
                action = `made changes ${determiner} request.`
                context = `<p class="line-clamp notification-overview">${items}</p>`
            } else if (Object.keys(changed_fields).length == 1) {
                determiner = (user === notification.log.ticket.requestor) ? 'your' : 'a';
                if (changed_fields.description) {
                    action = `changed the <b>Title/Description</b> in ${determiner} request.`
                    context = `<p class="line-clamp notification-overview">${changed_fields.description[1]}</p>`
                } else if (changed_fields.form_data) action = `updated the <b>Request Details</b> in ${determiner} request.`
                else if (changed_fields.reference_no) action = `assigned ${requestor} request a reference number of <b>${changed_fields.reference_no[1]}</b>.`
            } else {
                action = `made changes ${determiner} request.`
            }
        }   
    }

    $('.dropdown-body').append(
        `<a href="/requests/${notification.log.object_id}/view" class="dropdown-notification-item d-flex" data-notification-id="${notification.id}" data-ticket-no="${ticket_no}">
            <div class="notification-user align-self-start mr-2">
                <div class="img-circle">
                    <span class="img-name">${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}</span>
                    <div class="img-icon ${color}"><i class="fas ${icon} text-light"></i></div>
                </div>
            </div>
            <div class="notification-content w-100">
                <p class="m-0"><b>${created_by}</b> ${action}</p>
                ${context}
                <div class="text-muted notification-time">${time_from_now}</div>  
            </div>
        </a>`        
    )
};

let displayCommentNotification = function (notification) {
    let object_json_repr = JSON.parse(notification.log.object_json_repr)
    let ticket_id = `${object_json_repr[0].fields.ticket}`
    let ticket_no = notification.log.ticket.ticket_no
    let comment = `${object_json_repr[0].fields.content}`

    created_by = `${notification.log.user.first_name} ${notification.log.user.last_name}`
    user = `${notification.user.first_name} ${notification.user.last_name}` // if the authenticated user is the requestor of the ticket 
    determiner = (user === notification.log.ticket.requestor) ? 'your' : 'a';
    time_from_now = moment(notification.log.datetime).fromNow();

    $('.dropdown-body').append(
        `<a href="/requests/${ticket_id}/view" class="dropdown-notification-item d-flex" data-notification-id="${notification.id}" data-ticket-no="${ticket_no}">
                <div class="notification-user align-self-start mr-2">
                <div class="img-circle">
                    <span class="img-name">${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}</span>
                    <div class="img-icon bg-success"><i class="fas fa-comment text-light"></i></div>
                </div>
            </div>
            <div class="notification-content w-100">
                <p class="m-0"><b>${created_by}</b> commented on ${determiner} request.</p>
                <p class="line-clamp notification-overview">${comment}</p>
                <div class="text-muted notification-time">${time_from_now}</div>  
            </div>
        </a>`
    )
};

let displayUserNotification = function (notification) {
    let object_json_repr = JSON.parse(notification.log.object_json_repr)
    let user_pk = object_json_repr[0].pk
    let action = notification.log.event_type
    let changed_fields = notification.log.changed_fields

    time_from_now = moment(notification.log.datetime).fromNow()
    img_text = ''
    img_icon = ''
    circle_color = ''
    name_color = ''

    if (action === 'Create' && notification.log.user === null) {
        img_text = `${object_json_repr[0].fields.first_name.charAt(0)}${object_json_repr[0].fields.last_name.charAt(0)}`
        img_icon = `<div class="img-icon bg-success"><i class="fas fa-plus text-light"></i></div>`
        content = `<b>${object_json_repr[0].fields.first_name} ${object_json_repr[0].fields.last_name}</b> registered to Track-It.`
        notification_url = `/core/user`
    } else if (action === 'Update') {
        notification_url = `/core/user`
        if (notification.log.user.id === parseInt(notification.log.object_id)) { // if user update its profile
            img_text = `${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}`
            img_icon = `<div class="img-icon bg-primary"><i class="fas fa-user text-light"></i></div>`
            content = `<b>$${notification.log.user.first_name} ${notification.log.user.last_name}</b> updated profile information. <b>Review now</b>.`
            if (changed_fields.is_verified) {
                if (changed_fields.is_verified[1] === 'None') {
                    img_icon = `<div class="img-icon bg-danger"><i class="fas fa-image text-light"></i></div>`
                    content = `<b>${notification.log.user.first_name} ${notification.log.user.last_name}</b> added new photos for verification. <b>Review now</b>.`
                }             
            } 
        } else { // else admin update its record
            notification_url = `/core/user/${notification.log.object_id}/profile`
            img_text = `<i class="fas fa-lg fa-user"></i>`
            circle_color = 'img-circle-info'
            name_color = 'img-name-info'
            if (changed_fields.is_verified) {
                if (changed_fields.is_verified[1] === 'True') {
                    img_text = `<i class="fas fa-lg fa-check"></i>`
                    circle_color = 'img-circle-success'
                    name_color = 'img-name-success'
                    content = `<b>Welcome to Track-It</b>. You can now start creating your requests.`
                } else if (changed_fields.is_verified[1] === 'False') {
                    img_text = `<i class="fas fa-lg fa-exclamation-triangle"></i>`
                    circle_color = 'img-circle-danger'
                    name_color = 'img-name-danger'
                    content = `<b>The Adminstrator</b> declined your verification. <b>View on profile to repeat the verification process</b>.`
                } else if (changed_fields.is_verified[1] === 'None') {
                    img_text = `<i class="fas fa-exclamation-triangle"></i>`
                    circle_color = 'img-circle-danger'
                    name_color = 'img-name-danger'
                    content = `<b>The Adminstrator</b> declined your identification. <b>View on profile to repeat verification process</b>.`
                }
            } else if (changed_fields.department) {
                img_text = `<i class="fas fa-lg fa-sitemap"></i>`
                circle_color = 'img-circle-primary'
                name_color = 'img-name-primary'
                content = `<b>The Adminstrator</b> changed your department to <b>${changed_fields.department[1]}</b>.`
            } else if (changed_fields.first_name || changed_fields.last_name) {
                content = `<b>The Adminstrator</b> made changes to your name profile. <b>See profile now</b>.`
            } else if (changed_fields.is_staff || changed_fields.is_superuser) {
                img_text = `<i class="fas fa-lg fa-unlock"></i>`
                circle_color = 'img-circle-purple'
                name_color = 'img-name-purple'
                content = '<b>The Adminstrator</b> made changes to your permission.'
            } else if (changed_fields.username) {
                content = `<b>The Adminstrator</b> changed your username to <b>${changed_fields.username[1]}</b>`
            } else {
                content = '<b>The Adminstrator</b> made changes to your information. <b>See profile now</b>.'
            }
        }   
    }

    $('.dropdown-body').append(
        `<a href="${notification_url}" class="dropdown-notification-item d-flex align-items-center" data-notification-id="${notification.id}" data-user-id="${user_pk}">
            <div class="notification-user align-self-start mr-2">
                <div class="img-circle ${circle_color}">
                    <span class="img-name ${name_color}">${img_text}</span>
                    ${img_icon}
                </div>
            </div>
            <div class="notification-content w-100">
                <p class="m-0">${content}</p>
                <div class="text-muted notification-time">${time_from_now}</div>  
            </div>
        </a>`
    )
};

let displayTaskNotification = function (notification) {
    let object_json_repr = JSON.parse(notification.log.object_json_repr)
    let log_user = `${notification.log.user.first_name} ${notification.log.user.last_name}`
    let action = notification.log.event_type
    let task = notification.log.task 
    time_from_now = moment(notification.log.datetime).fromNow()
    
    notification_url = '#'
    img_text = ''
    img_icon = ''
    circle_color = ''
    name_color = ''

    if (action === 'Create') {
        if (task.is_head_task && task.is_client_task == false) {
            img_text = `${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}`
            img_icon = '<div class="img-icon bg-primary"><i class="fas fa-signature text-light"></i></div>'
            content = `<b>${log_user}</b> created a new request that requires your approval. See ticket <b>${task.ticket.ticket_no}</b>.`
            notification_url = `/requests/${object_json_repr[0].fields.ticket}/view`
        } else if (task.is_client_task) {
            circle_color = 'img-circle-primary'
            name_color = 'img-name-primary'
            img_text = '<i class="fas fa-lg fa-ticket-alt"></i>'
            content = `Your ticket status is in <b>${task.task_type}</b> and requires your action.`
            notification_url = `/requests/${object_json_repr[0].fields.ticket}/view`
        } else {
            img_text = `${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}`
            img_icon = '<div class="img-icon bg-warning"><i class="fas fa-tasks text-light"></i></div>'
            notification_url = '/tasks/mytasks'
            if (object_json_repr[0].fields.opentask_str) content = `<b>${log_user}</b> owned a task of <b>${task.task_type}</b>.`
            else content = `<b>${log_user}</b> assigned you a new task of <b>${task.task_type}</b>.`
        }
    }

    $('.dropdown-body').append(
        `<a href="${notification_url}" class="dropdown-notification-item d-flex" data-notification-id="${notification.id}" data-task-id="${task.task_id}">
            <div class="notification-user align-self-start mr-2">
                <div class="img-circle ${circle_color}">
                    <span class="img-name ${name_color}">${img_text}</span>
                    ${img_icon}
                </div>
            </div>
            <div class="notification-content w-100">
                <p class="m-0">${content}</p>
                <div class="text-muted notification-time">${time_from_now}</div>  
            </div>
        </a>`
    )
};

let displayOpenTaskNotification = function (notification) {
    let object_json_repr = JSON.parse(notification.log.object_json_repr)
    let log_user = `${notification.log.user.first_name} ${notification.log.user.last_name}`
    let action = notification.log.event_type
    let task = notification.log.task
    time_from_now = moment(notification.log.datetime).fromNow()
    if (action === 'Create') content = 'You have a new task available in <b>My Tasks</b>.'
    $('.dropdown-body').append(
        `<a href="/tasks/mytasks" class="dropdown-notification-item d-flex" data-notification-id="${notification.id}" data-task-id="${task.task_id}">
            <div class="notification-user align-self-start mr-2">
                <div class="img-circle img-circle-warning">
                    <span class="img-name img-name-warning"><i class="fas fa-lg fa-tasks"></i></span>
                </div>
            </div>
            <div class="notification-content w-100">
                <p class="m-0">${content}</p>
                <div class="text-muted notification-time">${time_from_now}</div>  
            </div>
        </a>`
    )
};

let displayTaskTeamNotification = function (notification) {
    let log_user = `${notification.log.user.first_name} ${notification.log.user.last_name}`
    let self = `${notification.user.first_name} ${notification.user.last_name}`
    let action = notification.log.event_type
    let task = notification.log.task
    time_from_now = moment(notification.log.datetime).fromNow()
    img_icon = ''
    if (action === 'Create') {
        img_icon = '<div class="img-icon bg-primary"><i class="fas fa-share text-light"></i></div>'
        if (notification.log.task.member == self) content = `shared with you a task.`
        else content = `added <b>${notification.log.task.member}</b> to a task.`
    } else if (action === 'Delete') {
        img_icon = '<div class="img-icon bg-danger"><i class="fas fa-user-slash text-light"></i></div>'
        if (notification.log.task.member == self ) person = 'you'
        else if (notification.log.task.member == log_user) person = 'itself'
        else person = `<b>${notification.log.task.member}</b>`
        content = `removed ${person} from a task.`
    }
    $('.dropdown-body').append(
        `<a href="/tasks/mytasks" class="dropdown-notification-item d-flex" data-notification-id="${notification.id}" data-task-id="${task.task_id}">
            <div class="notification-user align-self-start mr-2">
                <div class="img-circle ">
                    <span class="img-name">${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}</span>
                    ${img_icon}
                </div>
            </div>
            <div class="notification-content w-100">
                <p class="m-0"><b>${log_user}</b> ${content}</p>
                <div class="text-muted notification-time">${time_from_now}</div>  
            </div>
        </a>`
    )
};

let displayEmptyNotification = function () {
    $('.dropdown-body').html(`<div class="d-flex flex-column text-center my-2">
        <div class="state-icon"><i class="fas fa-bell"></i></div>
        <p class="m-0 state-text">No new notifications</p>
    </div>`)
}