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
                data: "description",
                render: $.fn.dataTable.render.ellipsis(60, true),
                width: "25%"
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
           }
        ],
        "order": [[ 1, "desc" ]]
    });

    // File Upload
    $('#file_upload').on('change', function() {
        const files = this.files;
        const file_lists = $('#file_lists');
        let counter = 0;

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
                file_lists.append(
                    `<div class="list-group-item border-0 d-flex p-1 mb-1">
                       <div class="file-icon"><i class="far fa-lg ${type}"></i></div>
                       <div style="line-height:15px; width:15%;">
                          <p class="mb-0 font-weight-bold text-truncate text-xs">${file.name}</p>
                          <small class="mb-0">${size}</small>
                       </div>
                       <div class="flex-grow-1 m-0 ml-4 mr-2">
                          <input type="text" class="form-control form-control-sm m-0" id="desc_${counter}" placeholder="Add Description*">
                          <small class="error-info" id="error-info-type"></small>
                       </div>
                       <div>
                          <button type="button" class="btn btn-sm btn-block btn-remove" data-file-id="file_${counter}">
                             <i class="fas fa-times text-orange"></i>
                          </button>
                       </div>
                    </div>`
                )
                file_arr.push({
                    id : `file_${counter}`,
                    file: file 
                });
                counter++;
            }
        });
    });

    // Generate Reference No
    $('#btn_generate').click(function() {
        let id = $(this).data().ticketId;
        let form = $('#form_id').data().formId;

        axios({
            url: `/api/requests/lists/${id}/`,
            method: "PATCH",
            data: {request_form: form},
            headers: axiosConfig
        }).then(function (response) {
            // Show Spinners
            $(".ref-spinner").removeClass('d-none');
            $("#ref_context").html('');

            setTimeout(function() { 
                $(".ref-spinner").addClass('d-none');
                $("#ref_context").removeClass('text-muted').html(response.data.reference_no);
                $("#btn_generate").remove()
            }, 1200);
        }).catch(function (error) {
            Toast.fire({
               icon: 'error',
               title: error.response.data,
            });
        });
    });
});
