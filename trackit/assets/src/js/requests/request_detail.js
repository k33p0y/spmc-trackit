$(document).ready(function () {
   const ticket = $(".ticket-no").data().ticketId;
   
   // Attachments Table
   $('#dt_attachments').DataTable({
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
      ]
   });

   // Load File Icons In Attachment Table
   $('.file-type').each((index, element) => {
      let file_type = fileType($(element).data().mimetype, media_type);
      $(element).addClass(file_type);
   });

   $('#dd_edit_departments').select2({ // department select2
      allowClear: true,
      placeholder: 'Select Department',
      cache: true,
   });

   $('#dd_edit_types').select2({ // department select2
      allowClear: true,
      placeholder: 'Select Category Type',
      cache: true,
   });

   $('#dd_edit_categories').select2({ // categories select2
      allowClear: true,
      placeholder: 'Select Category',
      cache: true,
   });

   // SElECT ON CHANGE EVENT
   var department = $("#dd_edit_departments option:selected").val();
   $('#dd_edit_departments').on('change', function () { // department dropdown
      department = $($(this), "option:selected").val();
   });

   var category = $("#dd_edit_categories option:selected").val();
   $('#dd_edit_categories').on('change', function () { // categories dropdown
      category = $($(this), "option:selected").val();
   });

   // File Upload
   var file_arr = new Array();
   $('#file_upload').on('change', function() {
      const files = this.files;
      const file_lists = $('#file_lists');
      let counter = 0;

       if(files) $('#btn_clear').removeClass('d-none');

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
   $('#file_lists').on('click', '.btn-remove', function () {
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
      $('#file_lists').empty();
      $('#btn_clear').addClass('d-none');
      file_arr = new Array();
   });
   

   $("#btn_update").click(function (e) {
      e.preventDefault();

      let success = validateForms();
      if (success == 1) {

         // Data
         data = new Object();
         data.form_data = getFormDetailValues();
         data.category = category;
         data.department = department;
         data.is_active = ($('#is_active_switch').is(":checked")) ? true : false;

         axios({
            method: 'PUT',
            url: `/api/requests/lists/${ticket}/`,
            data: file_data,
            headers: axiosConfig,
         }).then(function (response) { // success
            socket_notification.send(JSON.stringify({type: 'notification', data: {object_id: response.data.ticket_id, notification_type: 'ticket'}}))
            // disable submit button
            $(this).attr('disabled', true)
            $.when(
               Toast.fire({
                  icon: 'success',
                  title: 'Update Successfully',
               }),
               $('.overlay').removeClass('d-none')
            ).then(function () {
               $(location).attr('href', '/requests/lists')
            });

         }).catch(function (error) { // error
            Toast.fire({
               icon: 'error',
               title: error,
            });
         });
      }
   });

   $('#dt_attachments tbody').on('click', '.btn-delete', function () {
      const id = $(this).data().attachmentId;

      Swal.fire({
         title: 'Are you sure?',
         icon: 'error',
         showCancelButton: true,
         confirmButtonText: 'Delete',
         confirmButtonColor: '#d9534f',
      }).then((result) => {
         if (result.value) {
            axios({
               method: 'DELETE',
               url: `/api/requests/attachments/${id}/`,
               headers: axiosConfig,
            }).then(response => {
               Toast.fire({
                  icon: 'success',
                  title: 'Update Successfully',
               });
               table.ajax.reload();
            }).catch(function (error) {
               Toast.fire({
                  icon: 'error',
                  title: error,
               });
            });
         };
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
            $("#ref_context").removeClass('text-light').html(response.data.reference_no);
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

function validateForms() {
   let success = 1;

   // Validate Request Details
   if ($('#dd_edit_categories').val() == '') {
      $('#dd_edit_categories').next().find('.select2-selection').addClass('form-error');
      $('#error-info-category').html('*This field cannot be empty')
      success--;
   } else {
      $('#dd_edit_categories').next().find('.select2-selection').removeClass('form-error');
      $('#error-info-category').html('');
   }

   if ($('#dd_edit_departments').val() == '') {
      $('#dd_edit_departments').next().find('.select2-selection').addClass('form-error');
      $('#error-info-department').html('*This field cannot be empty')
      success--;
   } else {
      $('#dd_edit_departments').next().find('.select2-selection').removeClass('form-error');
      $('#error-info-department').html('')
   }

   // Validate Request Form Fields
   const form_fields = $('.form_field_detail');
   
   form_fields.each(function(index, val) {      
      if(val.required == true) {
         if ($(this).val() == '') {
            $(this).addClass('form-error').next().html('*This field cannot be empty');
            success--;
         } else {
            $(this).removeClass('form-error').next().html('');
         }
      }

      // if($(this).children().length > 0 && $(this).data().requiredId == 'False') {
      //    let check_count = $(this).find('input:checkbox:checked').length;
         
      //    if (check_count == 0 ) {
      //       $(this).next().html('*Please select at least one')
      //    }
      // }
   });

   return success;
}

function getFormDetailValues() {
   const form_fields = $('.form_field_detail');
   const form_data = new Array()
   
   form_fields.each(function(index, val) {
      if ($(this).children().length > 0) {
         let nodes = $(this).children();
         var answer = new Array();
         var type;

         nodes.each(function(index, element) {
            const field = $(this).find('input');
            const label = $(this).find('label');

            // Set type of field
            type = field.attr('type');
            
            // Push to array
            answer.push({
               "option_id": field.attr('id'),
               "option_name" : label.text(),
               "option_value" : (field.is(":checked")) ? true : false
            });
         });
      }
      
      if (val.type == 'text' || val.type == 'textarea') {
         var answer = $(`#${val.id}`).val()
         var type = val.type;
      }
      
      form_data.push({
         "id" : val.id,
         "type" : type,
         "value" : answer,
      });
   });

   return form_data;
}