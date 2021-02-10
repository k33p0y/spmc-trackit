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
    var step;
    $('#dd_steps').on('change', function () { 
        step = $("#dd_steps option:selected").val();
    });    
    
    // Accept action 
    $('.btn-accept').click(function (e) {
        e.preventDefault();
        let ticket_id = $(this).data().ticketId;
        var next_step = $("#dd_steps option:selected").next().val()
        let status = (typeof step === "undefined") ? next_step : step;
        let remark = $('#txtarea-comment').val();

        postAction(ticket_id, status, remark);
    });

    // Refuse action
    $('.btn-refuse').click(function (e) {
        e.preventDefault();
        let ticket_id = $(this).data().ticketId;
        let prev_step = $("#dd_steps option:selected").prev().val();  
        let status = (typeof step === "undefined") ? prev_step : step;
        let remark = $('#txtarea-comment').val();

        postAction(ticket_id, status, remark);
    });

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

<<<<<<< HEAD
    // Load Comments
    getComments($('#btn-post-comment').data().ticketId);
=======
    $('.comment-section').scroll(function () {         
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            if ($('#comment-nextpage-url').val()){
                getComments($('#btn-post-comment').data().ticketId, $('#comment-nextpage-url').val());
            }
        }
    });

    // Load Comments
    getComments($('#btn-post-comment').data().ticketId, null);
>>>>>>> b21e94a449c5a707b6acbe382cd1bfc02a53514a
});
