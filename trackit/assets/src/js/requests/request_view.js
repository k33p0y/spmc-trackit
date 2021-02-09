$(document).ready(function () {
    $('.file-type').each((index, element) => {
        let file_type = fileType($(element).data().mimetype, media_type);
        $(element).addClass(file_type);
    });

    // Attachments table
    $('#dt_attachments').DataTable({
        "searching": false,
        "responsive": true,
        "lengthChange": false,
        "pageLength": 10,
    })

    // Select2 Action Steps
    $('#dd_steps').select2();

    // On Change Event Select 2
    var step = $("#dd_steps option:selected").next().val();  
    $('#dd_steps').on('change', function () { 
        step = $("#dd_steps option:selected").val();
    });    
    
    // post action
    $('.btn-accept').click(function (e) {
        e.preventDefault();
        let ticket_id = $(this).data().ticketId;

        axios({
            url:`/api/requests/lists/${ticket_id}/`,
            method: "PATCH",
            data: {status: step},
            headers: axiosConfig,
        }).then(function (response) { // success
            let data = new Object();
            data.ticket = response.data.ticket_id;
            data.remark = $('#txtarea-remark').val();

            axios({
                method: 'POST',
                url: `/api/config/remark/`,
                data: data,
                headers: axiosConfig,
            }).then(function (res) {
                socket.send(JSON.stringify({type: 'step_action', data: {ticket_id: ticket_id}}))
                $.when(
                    Toast.fire({
                        icon: 'success',
                        title: 'Success',
                    }),
                    $('.overlay').removeClass('d-none')
                ).then(function () {
                    $(location).attr('href', '/requests/lists')
                });
            });

        }).catch(function (error) { // error
            console.log(error);
            Toast.fire({
                icon: 'error',
                title: error,
            });
        });
    });

    // post comment
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
            console.log(error.response);
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
