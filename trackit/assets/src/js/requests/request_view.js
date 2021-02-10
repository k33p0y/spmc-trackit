$(document).ready(function () {
    // get ticket number in localStorage if available
    if (localStorage.getItem('ticketNumber')){
        localStorage.removeItem('ticketNumber');
    }

    // set notification instance to unread = False
    if (localStorage.getItem('notification-id')){
        axios.delete(`/api/user/notifications/${localStorage.getItem('notification-id')}/`, {headers: axiosConfig})
        localStorage.removeItem('notification-id');
    }

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
            socket.send(JSON.stringify({type: 'notification', data: {ticket_id: response.data.ticket, notification_type: 'comment'}}))
        }).catch(function (error) { // error
            console.log(error.response);
            Toast.fire({
                icon: 'error',
                title: 'Error in creating comment.',
            });
        });
    });

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
