let url_ws_comment = wsStart + loc.host + '/ws/comments/';
const socket_comment = new WebSocket(url_ws_comment)

socket_comment.onopen = function (event) {
}

socket_comment.onmessage = function (event) {
    displayComment(JSON.parse(event.data));
}

socket_comment.onclose = function (event) {
    $('.online-status, .profile-online-status').addClass('d-none');
}

socket_comment.onerror = function (event) {
    console.log(event)
    console.log('something went wrodddng')
}

let displayComment = function (obj) {
    if ($('#btn-post-comment').data().ticketId === obj.comment['ticket_id']) {
        let logged_user_id = actor

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