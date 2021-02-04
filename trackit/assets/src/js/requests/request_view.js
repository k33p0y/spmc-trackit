$(document).ready(function () {
    $('.file-type').each((index, element) => {
        let file_type = fileType($(element).data().mimetype, media_type);
        $(element).addClass(file_type);
    });

    $('#dt_attachments').DataTable({
        "searching": false,
        "responsive": true,
        "lengthChange": false,
        "pageLength": 10,
    })

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
            socket.send(JSON.stringify({type: 'comment', data: {comment_id: comment_id}}))
        }).catch(function (error) { // error
            console.log(error);
            Toast.fire({
                icon: 'error',
                title: 'Error in creating comment.',
            });
        });
    });

    // get comments
    let getComments = function(e){
        if ($('#btn-post-comment').data().ticketId){
            axios({
                method: 'GET',
                url: '/api/requests/comments/',
                params: {
                    ticket_id : $('#btn-post-comment').data().ticketId,
                },
                headers: axiosConfig,
            }).then(function (response) { // success
                $('.comment-section').empty();
                let comments_array = response.data.results
                for (i=0; i<comments_array.length; i++){
                    let fullname = `${comments_array[i].user.first_name} ${comments_array[i].user.last_name}`
                    let comment = `${comments_array[i].content}`
                    let date_created = `${moment(comments_array[i].date_created).format('MMM DD, YYYY hh:mm a')}`
                    let logged_user_id = $('.user-link').data().userId;

                    $('.comment-section').append(
                        `<div class="user-comment justify-content-start ${comments_array[i].user.id == logged_user_id ? 'bg-comment-orange' : ''}">
                            <div class="d-inline justify-content-start ">
                            <span class="font-weight-bold text-orange name ">${fullname}</span>
                            <span class="text-muted text-xs"> - ${date_created}</span>
                            </div>
                            <div class="mt-2">
                            <p class="comment-text m-0">${comment}</p>
                            </div>
                        </div>`
                    )
                }
            }).catch(function (error) { // error
                console.log(error)
                Toast.fire({
                    icon: 'error',
                    title: 'Error in loading comments.',
                });
            });
        }
    };

    getComments();
});
