let url_ws_notification = wsStart + loc.host + '/ws/notifications/';
const socket_notification = new WebSocket(url_ws_notification)

socket_notification.onopen = function(event) {
    $('.online-status').addClass('text-success')
    getAllNotifications();
}

socket_notification.onmessage = function(event) {
    //console.log(event)
    
    if ('notification' in JSON.parse(event.data)) getAllNotifications(); // Notifications
}

socket_notification.onclose = function(event) {
    $('.online-status').removeClass('text-success');
}

socket_notification.onerror = function(event) {
    console.log(event)
    console.log('something went wrong')
}

let getAllNotifications = function(){
    getUserNotifications().then(data=>{
        let notifications = data
        unread_count = notifications.filter(obj=>obj.unread==true).length

        if (notifications.length){ // if notification is available
            $('.dropdown-notifications-title').html(`Notications (${unread_count}) `) // display unread notification to title
            if (unread_count > 0) $('.new-notifications-count').html(unread_count); // display unread notification to bell
            
            var saveDropdown = $('.dropdown-notifications-div .dropdown-notifications-title').detach();
            $('.dropdown-notifications-div').empty().append(saveDropdown);
            for (i=0; i<notifications.length; i++){
                let model = JSON.parse(notifications[i].log.object_json_repr)
                if (JSON.parse(model[0].model == 'requests.ticket')) displayTicketNotification(notifications[i]);
                if (JSON.parse(model[0].model == 'requests.comment')) displayCommentNotification(notifications[i]);
            }
            $('.dropdown-notifications-div a').click(function(){
                localStorage.setItem("ticketNumber", $(this).attr('data-ticket-no'));
                localStorage.setItem("notification-id", $(this).attr('data-notification-id'));
            })
        } else {
            $('.dropdown-notifications-title').html('Notifications (0)')
        }
    });
};

let displayTicketNotification = function(notification){
    let object_json_repr = JSON.parse(notification.log.object_json_repr)
    let ticket_no = object_json_repr[0].fields.ticket_no
    created_by = `${notification.log.user.first_name} ${notification.log.user.last_name}`
    user = `${notification.user.first_name} ${notification.user.last_name}`
    if (created_by === user) created_by = 'You'; // if the authenticated user is the requestor of the ticket
    action = `${notification.log.event_type}`
    time_from_now = moment(notification.log.datetime).fromNow()
    if (action === 'Create') action = `created a new request, Ticket no. <b>${ticket_no}</b>`;
    else if (action === 'Update') {
        if (notification.log.remarks){
            if (notification.log.remarks.is_approve) action = `approved request <b>${ticket_no}</b>`
            else if (notification.log.remarks.is_approve == false) action = `disapproved request <b>${ticket_no}</b>`
            else action = `updated <b>${ticket_no}</b> status from ${notification.log.changed_fields.status[0]} to ${notification.log.changed_fields.status[1]}`
        } else action = `updated request <b>${ticket_no}</b>`
    }
    if (notification.unread) {
        bg_color = 'bg-notification'; 
        display_status = '';
    } else {
        bg_color = '';
        display_status = 'd-none'
    }

    $('.dropdown-notifications-div').append(
        `<a href="/requests/${notification.log.object_id}/view" class="dropdown-item dropdown-notification-item d-flex ${bg_color}" data-notification-id="${notification.id}" data-ticket-no="${ticket_no}">
            <div class="notification-content flex-grow-1">
                <p><b>${created_by} </b> ${action} </p>
                <span class="text-muted notification-time">${time_from_now}</span>    
            </div>
            <div class="notification-status align-self-center ${display_status}"><i class="fas fa-circle"></i></div>
            </a>`
    )
};

let displayCommentNotification = function(notification){
    created_by = `${notification.log.user.first_name} ${notification.log.user.last_name}`
    user = `${notification.user.first_name} ${notification.user.last_name}`
    if (created_by === user) created_by = 'You'; // if the authenticated user is the requestor of the ticket
    let object_json_repr = JSON.parse(notification.log.object_json_repr)
    
    time_from_now = moment(notification.log.datetime).fromNow()
    if (notification.unread) {
        bg_color = 'bg-notification'; 
        display_status = '';
    } else {
        bg_color = '';
        display_status = 'd-none'
    }
    
    let ticket_id = `${object_json_repr[0].fields.ticket}`
    let ticket_no = notification.log.ticket_no
    $('.dropdown-notifications-div').append(
        `<a href="/requests/${ticket_id}/view" class="dropdown-item dropdown-notification-item d-flex ${bg_color}" data-notification-id="${notification.id}" data-ticket-no="${ticket_no}">
            <div class="notification-content flex-grow-1">
                <p><b>${created_by}</b> commented on ticket <b>${ticket_no}</b></p>
                <span class="text-muted notification-time">${time_from_now}</span>    
            </div>
            <div class="notification-status align-self-center ${display_status}"><i class="fas fa-circle"></i></div>
            </a>`
    )
};