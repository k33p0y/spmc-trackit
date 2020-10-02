$(document).ready(function () {

   // Local Variables
   let chk_status = true;
   let action_type, url;
   let alert_msg = '';

   // Spectrum Picker
   $('#txt_color').spectrum({
      type: "text",
      showPalette: false,
   });

   // RETRIEVE / GET
   // List Table
   let table = $('#dt_forms').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 25,
      "ajax": {
         url: '/api/requests/forms/?format=datatables',
         type: "GET",
         dataSrc: function (json) {
            return json.data.filter(function (item) {
               return item.is_archive == false;
            });
         }
      },
      "columns": [
         { data: "name" },
         {
            data: null,
            render: function (data, type, row) {
               data = `<div class="circle" style="background-color:${row.color};"></div>`;
               return data
            }
         },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  if (row.is_active == true) {
                     data = "<i class='fas fa-check-circle text-success'></i>";
                  } else {
                     data = "<i class='fas fa-times-circle text-secondary'></i>";
                  }
               }
               return data
            }
         },
         {
            data: null,
            render: function (data, type, row) {
               data = `<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
                     <a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>`;
               return data
            },
         }
      ],
   });

   // Get Checkbox State
   $('#chk_status').click(function () {
      if ($(this).prop("checked") == true) {
         chk_status = true;
      }
      else if ($(this).prop("checked") == false) {
         chk_status = false;
      }
   });

   // CREATE / POST
   $('#btn_new').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/requests/forms/';
      alert_msg = 'Saved Successfully';

      let samp_json = {
         "ihomp": [{
            "name": "",
            "fields": [{
               "type": "",
               "size": null,
               "option": [],
               "answer": ""
            }]
         }]
      }



      $("#formModal").modal();
      $(".modal-title").text('New Form');
      $('#txt_typename').val('');
      $('#txt_color').val('');
      $('#txt_json').val(JSON.stringify(samp_json));

      prettyPrint();
   });

   // UPDATE / PUT
   $('#dt_forms tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/requests/forms/${id}/`;
      alert_msg = 'Update Successfully';

      // Open Modal
      // Rename Modal Title
      $("#formModal").modal();
      $(".modal-title").text('Update Form');

      // Populate Fields
      $('#txt_typename').val(dt_data['name']);
      $('#txt_color').val(dt_data['color']);
      $('#chk_status').prop("checked", dt_data['is_active']);
      $('#txt_json').val(JSON.stringify(dt_data['fields']));

      // Format Textarea value to JSON
      prettyPrint();
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.name = $('#txt_typename').val();
      data.color = $('#txt_color').val();
      data.fields = cleanJSON();
      data.is_active = chk_status;
      data.is_archive = false;

      // Form is Valid
      if (success == 1) {
         $.ajax({
            url: url,
            type: action_type,
            data: data,
            beforeSend: function (xhr, settings) {
               xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: function (result) {
               Toast.fire({
                  icon: 'success',
                  title: alert_msg,
               });
               table.ajax.reload();
            },
            error: function (xhr, status, error) {
               if (xhr.responseJSON.name) {
                  $('#txt_typename').addClass('form-error');
                  $('.name-error').html(`*${xhr.responseJSON.name}`)
               } else {
                  $('#txt_typename').removeClass('form-error');
                  $('.name-error').html('')
               }
               if (xhr.responseJSON.color) {
                  $('#txt_color').addClass('form-error');
                  $('.color-error').html(`*${xhr.responseJSON.color}`)
               } else {
                  $('#txt_color').removeClass('form-error');
                  $('.color-error').html('')
               }
               Toast.fire({
                  icon: 'error',
                  title: error,
               });
            },
         }).done(function () {
            $('#formModal').modal('toggle');
            $("#form").trigger("reset");
         });
      }
   });

   // DELETE / PATCH
   $('#dt_forms tbody').on('click', '.btn_delete', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      Swal.fire({
         title: 'Are you sure?',
         icon: 'error',
         showCancelButton: true,
         confirmButtonText: 'Delete',
         confirmButtonColor: '#d9534f',
      }).then((result) => {
         if (result.value) {
            $.ajax({
               url: `/api/requests/forms/${id}/`,
               type: 'PATCH',
               data: {
                  is_archive: true,
               },
               beforeSend: function (xhr, settings) {
                  xhr.setRequestHeader("X-CSRFToken", csrftoken);
               },
               success: function (result) {
                  Toast.fire({
                     icon: 'success',
                     title: 'Delete Successfully',
                  });
                  table.ajax.reload();
               },
               error: function (a, b, error) {
                  Toast.fire({
                     icon: 'error',
                     title: error,
                  });
               },
            })
         }
      })
   });

   //Modal Cancel
   $('#btn_cancel').click(function () {
      // Reset Fields to Defaults
      $('#txt_typename').removeClass('form-error');
      $('.error-info').html('');
      $('#chk_status').prop("checked", true);
   });

});

function prettyPrint() {
   let obj = JSON.parse($('#txt_json').val());
   let pretty = JSON.stringify(obj, undefined, 4);
   $('#txt_json').val(pretty);
}

function cleanJSON() {
   let parsed = JSON.parse($('#txt_json').val());
   let stringed = JSON.stringify(parsed);
   let clean = $.trim(stringed);

   return clean;
}