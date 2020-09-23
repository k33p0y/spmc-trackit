$(document).ready(function () {

   // RETRIEVE / GET
   // List Table
   let table = $('#dt_requests').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 20,
      "ajax": {
         url: '/api/requests/lists/?format=datatables',
         type: "GET",
         dataSrc: function (json) {
            return json.data.filter(function (item) {
               return item.is_archive == false;
            });
         }
      },
      "columns": [
         { data: "ticket_id" },
         {
            data: null,
            render: function (data, type, row) {
               data = 'tests';
               return data
            }
         },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<span class="td-badge" style="background-color:${row.request_form.color}">${row.request_form.name}</span>`
               }
               return data
            }
         },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = row.department.name
               }
               return data
            }
         },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_created).format('DD MMMM YYYY');
                  var time = moment(row.date_created).format('h:mm:ss a');

                  data = `<p class="date mb-1">${date}</p><span class="time">${time}</span>`
               }
               return data
            },
         },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `${row.requested_by.first_name} ${row.requested_by.last_name}`
               }
               return data
            },
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
            data: "null",
            render: function (data, type, row) {
               data = `<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
                         <a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>`;
               return data
            },
         }
      ],
   });

   // LOCAL VARIABLES
   let form_category = $('#form-group-category');
   let dd_type_id;

   // SELECT2 CONFIGURATION
   $('#dd_forms').select2({
      allowClear: true,
      placeholder: 'Select Form',
      cache: true,
   });

   $('#dd_types').select2({
      allowClear: true,
      placeholder: 'Select Category Type',
      cache: true,
   });

   $('#dd_categories').select2({
      allowClear: true,
      placeholder: 'Select Category',
      cache: true,
   });



   // CREATE / POST
   $('#btn_new').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/requests/forms/';
      alert_msg = 'Saved Successfully';

      // Modal
      $("#formModal").modal();
      $(".modal-title").text('Make Request');

      // Setting up forms 
      form_category.hide();

      // Get Dropdown Value
      $('#dd_types').on('change', function () {
         dd_type_id = $("#dd_types option:selected").val();

         $.ajax({
            url: '/requests/categories/json',
            type: 'POST',
            data: {
               'type_id': dd_type_id
            },
            beforeSend: function (xhr, settings) {
               xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: function (data) {
               // Show Category Row
               form_category.slideDown();

               // Empty Dropdown Values
               $("#dd_categories")
                  .empty()
                  .append('<option></option>');

               // Populate Dropdown
               data.forEach(key => {
                  $("#dd_categories").append(`<option value='${key.id}'>${key.name}</option>`)
               });
            },
            error: function (xhr, status, error) {
               console.log(error)
            },
         });
      });
   });
});

function generateTicketNo() {
   let datetime = moment().format('MDYYHHmmss')
   let ticketnumber = `TN${datetime}`;

   return ticketnumber
}