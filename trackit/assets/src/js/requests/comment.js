$(function(){
    // Post comment
    $('#btn-post-comment').click(function (e){
        e.preventDefault();

        let data = new Object() // data
        data.ticket = $(this).data().ticketId;
        data.content = $('#txtarea-comment').val();

        $('#form-comment').trigger('reset')
        axios({
            method: 'POST',
            url: '/api/requests/comments/',
            data: data,
            headers: axiosConfig,
        }).then(function (response) { // success
            let comment_id = response.data.id
            socket_comment.send(JSON.stringify({comment_id: comment_id}))
            socket_notification.send(JSON.stringify({type: 'notification', data: {object_id: comment_id, notification_type: 'comment'}}))
        }).catch(function (error) { // error
            Toast.fire({
                icon: 'error',
                title: 'Error in creating comment.',
            });
        });
    });

    // Load more comments on scroll
    $('.comment-section').scroll(function () {         
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            if ($('#comment-nextpage-url').val()){
                getComments($('#btn-post-comment').data().ticketId, $('#comment-nextpage-url').val());
            }
        }
    });

    // Load Comments
    getComments($('#btn-post-comment').data().ticketId, null);
});