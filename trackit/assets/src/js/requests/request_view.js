$(document).ready(function () {
    const ticket = $(".ticket-no").data().ticketId;

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

    let table_attachment = $('#dt_attachments').DataTable({
        "searching": false,
        "responsive": true,
        "lengthChange": false,
        "pageLength": 10,
        "ajax": {
           url: '/api/requests/attachments/?format=datatables',
           type: "GET",
           data: {"ticket_id": ticket},
        },
        "columns": [
           { 
              data: "file_name",
              render: function (data, type, row) {
                 let file_type = fileType(row.file_type, media_type);
                 return data = `<span class="fas fa-lg mr-2 ${file_type}"></span> <a href="${row.file}" class="text-secondary"><b>${row.file_name}</b></a>`
              }
           }, 
           { 
              data: 'uploaded_at',
              render: function (data, type, row) {
                 return data = `${moment(row.uploaded_at).format('DD MMM YYYY')} ${moment(row.uploaded_at).format('h:mm:ss a')}`
              },
           }, 
           { 
              data: 'uploaded_by',
              render: function (data, type, row) {
                 let name = (row.uploaded_by.id == actor) ? 'Me' : `${row.uploaded_by.first_name} ${row.uploaded_by.last_name}`
                 return data = name
              },
           }, 
           { 
              data: "file_size",
              render: function (data, type, row) {
                 let file_size = fileSize(row.file_size);
                 return data = file_size
              },
           }, 
           { 
              data: "null",
              render: function (data, type, row) {
                 data = `<a href="${row.file}" class='text-secondary action-link'> <i class='fas fa-download'></i> </a>
                    <a class='text-danger action-link btn-delete' data-attachment-id="${row.id}"> <i class='fas fa-trash'></i> </a>`;
                 return data
              },
           }, 
        ],
        "order": [[ 1, "desc" ]]
    });

    // File Upload
    $('#file_upload').on('change', function() {
        const files = this.files;
        const file_table = $("#file_table");

        Object.values(files).forEach(file => {
            let type = fileType(file.type, media_type);
            let size = fileSize(file.size);

            if (type == 'invalid') { // If file is not registered
                this.value = "";
                Toast.fire({
                icon: 'error',
                title: 'File type is not supported!',
                })
            } else if (size == 'invalid') { // If file is more than 25MB
                this.value = "";
                Toast.fire({
                icon: 'error',
                title: 'File is too big!',
                })
            } else {
                const blob = new Blob([JSON.stringify(ticket)], {type: 'application/json'});
                const file_data = new FormData();
                file_data.append('file', file)
                file_data.append('ticket', blob)

                file_table.prepend(
                    `<tr>
                       <td><span class="far fa-lg ${type} mr-2"></span>${file.name}</td>
                       <td> - </td>
                       <td> - </td>
                       <td> ${size} </td>
                       <td> <div class="progress mt-1"> <div class="progress-bar progress-bar-animated bg-orange" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div></div></td>
                    </tr>`
                );

                axios({
                    method: 'POST',
                    url: '/api/requests/attachments/',
                    data: file_data,
                    headers: axiosConfig,
                    onUploadProgress: (progress => {
                        let percentCompleted = Math.round((progress.loaded * 100) / progress.total)
                        let str_progress = `${percentCompleted}%`
                        $(".progress-bar").css("width", str_progress).attr("aria-valuenow", percentCompleted);
                        $(".progress-bar").text(str_progress);
                    })
                }).then(response => {
                    // table_attachment.ajax.reload();
                });
            }
        });
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
