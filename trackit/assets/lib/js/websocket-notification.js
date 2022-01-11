let url_ws_notification = wsStart + loc.host + '/ws/notifications/';
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
            <div class="notification-user align-self-start mt-1 mr-2">
                <div class="img-circle text-uppercase">${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}</div>
            </div>
            <div class="notification-content">
                <p><b>${created_by}</b></p>
                <p>${action}</p>
                <p class="text-muted line-clamp notification-overview mt-1"><i class="fas fa-ticket-alt text-info mr-1"></i><i class="text-muted">${description}</i></p>
                <span class="text-black-50 notification-time">${time_from_now}</span>    
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
            <div class="notification-user align-self-start mt-1 mr-2">
            <div class="img-circle text-uppercase">${notification.log.user.first_name.charAt(0)}${notification.log.user.last_name.charAt(0)}</div>
            </div>
            <div class="notification-content">
                <p><b>${created_by}</b></p>
                <p>Commented on request: <b class="text-orange">${ticket_no}</b>. </p>
                <p class="text-muted line-clamp notification-overview mt-1"><i class="fas fa-comment text-success mr-1"></i><i class="text-muted">${comment}</i></p>
                <span class="text-black-50 notification-time">${time_from_now}</span>  
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