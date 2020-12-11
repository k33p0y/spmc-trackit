// Global Variables
let fields_arr;

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
         { data: "ticket_no" }, // Ticket No
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<span class="td-badge" style="background-color:${row.request_form.color}">${row.request_form.name}</span>`
               }
               return data
            }
         }, // Request Type
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  let category = row.category.name
                  let category_type = row.category.category_type.name

                  data = `<p class="title mb-1">${category}</p><span class="sub-title">${category_type}</span>`
               }
               return data
            }
         }, // Category
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = row.department.name
               }
               return data
            }
         }, // Department
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_created).format('DD MMMM YYYY');
                  var time = moment(row.date_created).format('h:mm:ss a');

                  data = `<p class="title mb-1">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         }, // Date
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `${row.requested_by.first_name} ${row.requested_by.last_name}`
               }
               return data
            },
         }, // User 
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {
                  data = row.status
               }
               return data
            },
         }, // Status 
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
         }, // Is Active
         {
            data: "null",
            render: function (data, type, row) {
               var id = row.ticket_id;

               data = `<a href='/requests/${id}/detail' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
                         <a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>`;
               return data
            },
         } // Action
      ],
   });

   // // UPDATE / PUT
   // $('#dt_requests tbody').on('click', '.btn_edit', function () {
   //    let dt_data = table.row($(this).parents('tr')).data();
   //    let id = dt_data['id'];
   //    let form_data = dt_data['form_data'];

   //    // Assign AJAX Action Type/Method and URL
   //    action_type = 'PUT';
   //    url = `/api/requests/lists/${id}/`;
   //    alert_msg = 'Update Successfully';

   //    // Open Modal
   //    // Rename Modal Title
   //    $("#formModal").modal();
   //    $(".modal-title").text('Update Requests');

   //    // Populate Fields
   //    $('#dd_departments').val(dt_data['department'].id).trigger('change');
   //    $('#dd_forms').val(dt_data['request_form'].id).trigger('change');
   //    $('#dd_types').val(dt_data['category'].category_type.id).trigger('change');
   //    $('#dd_categories').val(dt_data['category'].id).trigger('change');

   //    // Prev Next Function
   //    navigator();
   // });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.ticket_no = '';
      data.request_form = dd_form_id;
      data.form_data = getFormValues(fields_arr);
      data.category = dd_category_id;
      data.department = dd_department_id;
      data.is_active = true;
      data.is_archive = false;

      if (success == 1) {
         axios({
            method: action_type,
            url: url,
            data: data,
            headers: axiosConfig,
         }).then(function (response) { // success
            Toast.fire({
               icon: 'success',
               title: alert_msg,
            });
            $('#formModal').modal('toggle');
            $("#form").trigger("reset");
            table.ajax.reload();
         }).catch(function (error) { // error
            console.log(error.response)

            Toast.fire({
               icon: 'error',
               title: error,
            });
         });
      };
   });
});