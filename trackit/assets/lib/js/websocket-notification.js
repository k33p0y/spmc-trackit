// HOST, PROTOCOL constants
const wsStart = window.location.protocol == "https:" ? "wss://" : "ws://";
let url_ws_notification = wsStart + window.location.host + '/ws/notifications/';
const socket_notification = new WebSocket(url_ws_notification)

socket_notification.onopen = function (event) {
    $('.online-status, .profile-online-status').removeClass('d-none')
    getAllNotifications();
}

socket_notification.onmessage = function (event) {
    console.log(event.data)
    if ('notification' in JSON.parse(event.data)) getAllNotifications(); // Notifications
}

socket_notification.onclose = function (event) {
    $('.online-status, .profile-online-status').addClass('d-none');
}

socket_notification.onerror = function (event) {
    console.log(event)
    console.log('something went wrong')
}

let getAllNotifications = function () {
    getUserNotifications().then(data => {
        let notifications = data
        unread_count = notifications.filter(obj => obj.unread == true).length

        if (notifications.length) { // if notification is available
            if (unread_count > 0) {
                $('.new-notifications-count').html(unread_count); // display unread notification to bell
                $('#clear-all-notifications').removeClass('d-none')
            }
            // var saveDropdown = $('.dropdown-notifications-div .dropdown-body').detach();
            $('.dropdown-notifications-div .dropdown-body').empty();
            for (i = 0; i < notifications.length; i++) {
                let model = JSON.parse(notifications[i].log.object_json_repr)
                if (JSON.parse(model[0].model == 'requests.ticket')) displayTicketNotification(notifications[i]);
                if (JSON.parse(model[0].model == 'requests.comment')) displayCommentNotification(notifications[i]);
                if (JSON.parse(model[0].model == 'core.user')) displayRegistrationNotification(notifications[i]);
            }
            $('.dropdown-notifications-div .dropdown-body a').click(function () {
                localStorage.setItem("ticketNumber", $(this).attr('data-ticket-no'));
                localStorage.setItem("notification-id", $(this).attr('data-notification-id'));
            })
        } else {
            $('.dropdown-body').html('<p class="text-center text-muted p-2">No new notifications</p>')
            $('#clear-all-notifications').addClass('d-none')
            $('.new-notifications-count').html('');
        }
    });
};

let displayTicketNotification = function (notification) {
    let object_json_repr = JSON.parse(notification.log.object_json_repr)
    let ticket_no = object_json_repr[0].fields.ticket_no
    let description = object_json_repr[0].fields.description
    created_by = `${notification.log.user.first_name} ${notification.log.user.last_name}`
    user = `${notification.user.first_name} ${notification.user.last_name}`
    if (created_by === user) created_by = 'You'; // if the authenticated user is the requestor of the ticket
    action = `${notification.log.event_type}`
    time_from_now = moment(notification.log.datetime).fromNow()
    if (action === 'Create') action = `Created a new request: <b class="text-orange">${ticket_no}</b>.`;
    else if (action === 'Update') {
        if (notification.log.remarks) {
            if (notification.log.remarks.is_approve) action = `Approved request: <b class="text-orange">${ticket_no}</b> changed status to <b class="text-orange">${notification.log.changed_fields.status[1]}</b>.`
            else if (notification.log.remarks.is_approve == false) action = `Disapproved request: <b class="text-orange">${ticket_no}</b> changed status to <b class="text-orange">${notification.log.changed_fields.status[1]}</b>.`
            else action = `Updated request: <b class="text-orange">${ticket_no}</b> status to <b class="text-orange">${notification.log.changed_fields.status[1]}</b>.`
        } else action = `Updated request: <b class="text-orange">${ticket_no}</b> details.`
    }

    $('.dropdown-body').append(
        `<a href="/requests/${notification.log.object_id}/view" class="dropdown-notification-item d-flex" data-notification-id="${notification.id}" data-ticket-no="${ticket_no}">
            <div class="notification-user align-self-start mr-2">
                <div class="img-circle">
                    <span class="img-name">${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}</span>
                    <div class="img-icon bg-info"><i class="fas fa-ticket-alt text-light"></i></div>
                </div>
            </div>
            <div class="notification-content w-100">
                <div class="d-flex justify-content-between align-items-center">    
                    <p><b>${created_by}</b></p>
                    <span class="text-muted notification-time">${time_from_now}</span>  
                </div>  
                <p class="m-0">${action}</p>
                <p class="text-muted line-clamp notification-overview"><i class="text-muted">Title: ${description}</i></p>
            </div>
        </a>`        
    )
};

let displayCommentNotification = function (notification) {
    created_by = `${notification.log.user.first_name} ${notification.log.user.last_name}`
    user = `${notification.user.first_name} ${notification.user.last_name}`

    if (created_by === user) self = 'You'; // if the authenticated user is the requestor of the ticket
    let object_json_repr = JSON.parse(notification.log.object_json_repr)

    time_from_now = moment(notification.log.datetime).fromNow();

    let ticket_id = `${object_json_repr[0].fields.ticket}`
    let ticket_no = notification.log.ticket_no
    let comment = `${object_json_repr[0].fields.content}`

    $('.dropdown-body').append(
        `<a href="/requests/${ticket_id}/view" class="dropdown-notification-item d-flex" data-notification-id="${notification.id}" data-ticket-no="${ticket_no}">
                <div class="notification-user align-self-start mr-2">
                <div class="img-circle">
                    <span class="img-name">${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}</span>
                    <div class="img-icon bg-success"><i class="fas fa-comment text-light"></i></div>
                </div>
            </div>
            <div class="notification-content w-100">
                <div class="d-flex justify-content-between align-items-center">    
                    <p><b>${created_by}</b></p>
                    <span class="text-muted notification-time">${time_from_now}</span>  
                </div>  
                <p class="m-0">Commented on request: <b class="text-orange">${ticket_no}</b>.</p>
                <p class="text-muted line-clamp notification-overview"><i class="text-muted">"${comment}"</i></p>
            </div>
        </a>`
    )
};

let displayRegistrationNotification = function (notification) {
    let object_json_repr = JSON.parse(notification.log.object_json_repr)
    let user_pk = object_json_repr[0].pk
    let time_from_now = moment(notification.log.datetime).fromNow()
    let action = notification.log.event_type
    let changed_fields = notification.log.changed_fields
    
    img_icon = 'fa-user'
    img_color = 'bg-purple'
    subtext = ''

    if (action === 'Create' && notification.log.user === null) {
        img_text = `${object_json_repr[0].fields.first_name.charAt(0)}${object_json_repr[0].fields.last_name.charAt(0)}`
        title = 'A new user has created an account'
        content = `<b class="text-orange">${object_json_repr[0].fields.first_name} ${object_json_repr[0].fields.last_name} </b>successfully registered to Track-It. Review account now.`
    } else if (action === 'Update') {
        if (changed_fields.is_verified) {
            if (changed_fields.is_verified[1] === 'True') {
                img_text = 'A'
                img_icon = 'fa-bell'
                img_color = 'bg-orange'
                title = 'Account Verified'
                content = `Welcome to Track-It. <b class="text-orange">You can now start creating your requests</b>.`
            } else if (changed_fields.is_verified[1] === 'False') {
                img_text = 'A'
                img_icon = 'fa-exclamation'
                img_color = 'bg-danger'
                title = 'Verification Failed'
                content = `The Administrator declined your verification. <b class="text-orange">Go to your profile and repeat the verification process</b>.`
            } else if (changed_fields.is_verified[1] === 'None') {
                img_text = `${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}`
                img_icon = 'fa-exclamation'
                img_color = 'bg-danger'
                title = 'Verification Failed'
                content = `The Adminstrator declined your identification. <b class="text-orange">Go to your profile and repeat verification process</b>.`
            }
        } else if (changed_fields.department) {
            img_text = `A`
            title = 'Account Update'
            content = `Your department has been changed to <b class="text-orange">${changed_fields.department[1]}</b>.`
            subtext = `From: ${changed_fields.department[0]}`
        } else if (changed_fields.first_name || changed_fields.last_name) {
            img_text = `A`
            title = 'Account Update'
            content = `Your name has been changed.<b class="text-orange">See profile now</b>.`
        } else if (changed_fields.is_staff || changed_fields.is_superuser) {
            img_text = `A`
            title = 'Account Permission'
            content = 'Your permission has been changed.'

        } else if (changed_fields.username) {
            img_text = `A`
            title = 'Account Update'
            content = 'Your username has been changed. <b class="text-orange">See profile now.</b>'
        } else {
            img_text = `A`
            title = 'Account Update'
            content = 'Your information has been changed. See profile now.'
        }
    }

    $('.dropdown-body').append(
        `<a href="#" class="dropdown-notification-item d-flex" data-notification-id="${notification.id}" data-user-pk="${user_pk}">
            <div class="notification-user align-self-start mr-2">
                <div class="img-circle">
                    <span class="img-name">${img_text}</span>
                    <div class="img-icon ${img_color}"><i class="fas ${img_icon} text-light"></i></div>
                </div>
            </div>
            <div class="notification-content w-100">
                <div class="d-flex justify-content-between align-items-center">    
                    <p><b>${title}</b></p>
                    <span class="text-muted notification-time">${time_from_now}</span>  
                </div>  
                <p class="m-0">${content}</p>
                <p class="text-muted line-clamp notification-overview"><i class="text-muted">${subtext}</i></p>
            </div>
        </a>`
    )
};

// Clear all notifications
$('#clear-all-notifications').click(function () {
    let notifications = $('.dropdown-body').children();

    $.each(notifications, function (index, value) {
        const notification_id = $(this).data().notificationId;
        axios.delete(`/api/user/notifications/${notification_id}/`, { headers: axiosConfig }).then(res => {
            $(this).fadeOut("fast", "linear", function () { $(this).remove(); });
        })
        getAllNotifications();
    });
    return false;
})