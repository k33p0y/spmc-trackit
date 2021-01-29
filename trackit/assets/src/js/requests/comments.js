$(document).ready(function () {
    $('#btn-save').click(function (e){
        e.preventDefault();

        let data = {}
        // Data
        data.ticket = $('#txt_tracking_num').val();
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
});