// // // // Global Scope

// Store files to array
var file_arr = new Array();

// upload function
function uploadAttachment(ticket) {
   if (file_arr.length > 0) {               
      // loop through file attached
      $.each(Object.values(file_arr), function(index, value) {
         let form_data = new FormData();

         // new objcet for file extra data
         let file_obj = new Object();
         file_obj.description = $(`#desc_${index}`).val();
         file_obj.ticket = ticket
      
         // extra data convert to blob
         let blob = new Blob([JSON.stringify(file_obj)], {type: 'application/json'});

         // append to formData
         form_data.append('file', value.file)
         form_data.append('data', blob)

         axios({
            method: 'POST',
            url: '/api/requests/attachments/',
            data: form_data,
            headers: uploadConfig 
         });                
      });
   };
}

$(document).ready(function () {
   
   // Attachments Table
   let table = $('#dt_attachments').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "pageLength": 10,
      "ajax": {
         url: '/api/requests/attachments/?format=datatables',
         type: "GET",
         data: {"ticket_id": $(".ticket-no").data().ticketId},
      },
      "columns": [
         { 
            data: "file_name",
            render: function (data, type, row) {
               let file_type = fileType(row.file_type, media_type);
               return data = `<div class="d-flex align-items-center"><span class="fas fa-lg mr-2 ${file_type}"></span> <button class="btn btn-sm btn-link p-0 btn-file btn-link-orange"> <span><b>${row.file_name}</b></span>  </button></div> `
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
      ]
   });

   // File Upload
   $('#file_upload').on('change', function() {
      const files = this.files;
      const file_lists = $('.file_lists');
      let counter = 0;

      if(files) $('#btn_clear').removeClass('d-none');

      // Appending Display
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

   // Remove Attachment
   $('.file_lists').on('click', '.btn-remove', function () {
      let file_id = $(this).data().fileId;
      
      // loop through the files array and check if the file id of that file matches data-file-id
      // and get the index of the match
      for (var i = 0; i < file_arr.length; ++i) {
         if (file_id == file_arr[i].id) file_arr.splice(i, 1);
      };

      // remove to appended div
      $(this).parents("div.list-group-item").remove();
   });

   // Clear All Attachment
   $('#btn_clear').click(function () {
      $('#file_upload').val('');
      $('.file_lists').empty();
      $('#btn_clear').addClass('d-none');
      file_arr = new Array();
   });
   
   // Attachment row click
   $('#dt_attachments').on('click', '.btn-file', function () {
      let dt_data = table.row($(this).parents('tr')).data();

      // Open modal
      $('.modal-attachment').modal()

      $('#txt-file').text(dt_data.file_name);
      $('#txt-type').text(dt_data.file_type);
      $('#txt-size').text(fileSize(dt_data.file_size));
      $('#txt-upload-date').text((moment(dt_data.uploaded_at).format('DD MMMM YYYY h:mm:ss a')));
      $('#txt-owner').text(`${dt_data.uploaded_by.first_name} ${dt_data.uploaded_by.last_name}`);
      $('#btn_download').attr('href', dt_data.file)

      // View attachment modal shown fn   
      $('#attachmentViewModal').on('shown.bs.modal', function (e) {
         $('#txt-description').text(dt_data.description);
      });

      // Update attachment modal shown fn
      $('#attachmentUpdateModal').on('shown.bs.modal', function (e) {
         $('#txt-description').val(dt_data.description);
         $('#btn_save').data('id', dt_data.id)
      });
   });

   // Update attachment
   $('#btn_save').click(function () {
      let id = $(this).data('id');

      axios({
         method: 'PATCH',
         url: `/api/requests/attachments/${id}/`,
         data: {
            description : $('#txt-description').val()
         },
         headers: axiosConfig
      }).then(function (response) {
         $.when(
            Toast.fire({
               icon: 'success',
               title: 'Update Successfully',
            }),
         ).then(function () {
            $('.modal-attachment').modal('hide');
            table.ajax.reload();
         });
      }).catch(function (error) {
         Toast.fire({
            icon: 'error',
            title: error
         });
      });
   });
});