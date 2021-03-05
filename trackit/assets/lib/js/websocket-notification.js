let loc = window.location
let wsStart = loc.protocol == "https:" ? "wss://" : "ws://";
let url = wsStart + loc.host + '/ws/notifications/';
const socket = new WebSocket(url)

socket.onopen = function(event) {
    $('.online-status').addClass('text-success')
    getAllNotifications();
}

socket.onmessage = function(event) {
    //console.log(event)
    
    if ('notification' in JSON.parse(event.data)) getAllNotifications(); // Notifications

    if ('comment' in JSON.parse(event.data)){ // Comments
        displayComment(JSON.parse(event.data));
    }
}

socket.onclose = function(event) {
    $('.online-status').removeClass('text-success');
}

socket.onerror = function(event) {
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
    created_by = `${notification.log.user.first_name} ${notification.log.user.last_name}`
    user = `${notification.user.first_name} ${notification.user.last_name}`
    if (created_by === user) created_by = 'You'; // if the authenticated user is the requestor of the ticket
    action = `${notification.log.event_type}`
    time_from_now = moment(notification.log.datetime).fromNow()
    if (action === 'Create') action = 'created a new request, Ticket no.';
    else if (action === 'Update') action = 'updated request';
    if (notification.unread) {
        bg_color = 'bg-notification'; 
        display_status = '';
    } else {
        bg_color = '';
        display_status = 'd-none'
    }

    let object_json_repr = JSON.parse(notification.log.object_json_repr)
    let ticket_no = object_json_repr[0].fields.ticket_no
    $('.dropdown-notifications-div').append(
        `<a href="/requests/${notification.log.object_id}/view" class="dropdown-item dropdown-notification-item d-flex ${bg_color}" data-notification-id="${notification.id}" data-ticket-no="${ticket_no}">
            <div class="notification-content flex-grow-1">
                <p><b>${created_by}</b> ${action} <b>${ticket_no}</b></p>
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


let displayComment = function(obj){
    
    if ($('#btn-post-comment').data().ticketId === obj.comment['ticket_id']) {
        let logged_user_id = $('.user-link').data().userId;
        
        $('.comment-section').prepend(
            `<div class="user-comment justify-content-start ${logged_user_id == obj.comment['user_id'] ? 'bg-comment-orange' : ''}">
                <div class="d-inline justify-content-start ">
                <span class="font-weight-bold text-orange name ">${obj.comment['user']}</span>
                <span class="text-muted text-xs"> - ${moment(obj.comment['date_created']).format('MMM DD, YYYY hh:mm a')}</span>
                </div>
                <div class="mt-2">
                <p class="comment-text m-0">${obj.comment['content']}</p>
                </div>
            </div>`
        )
    }
};