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
               data = `<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
                         <a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>`;
               return data
            },
         } // Action
      ],
   });

   // LOCAL VARIABLES
   let dd_type_id, dd_form_id, dd_department_id, dd_category_id;

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

   $('#dd_departments').select2({
      allowClear: true,
      placeholder: 'Select Department',
      cache: true,
   });

   // SElECT ON CHANGE EVENT
   $('#dd_forms').on('change', function () {
      dd_form_id = $("#dd_forms option:selected").val();
      doTheThing(dd_form_id)
         .then((data) => {
            fields_arr = data.fields;
            generateForm(fields_arr);
         })
   });

   $('#dd_types').on('change', function () {
      dd_type_id = $("#dd_types option:selected").val();
      getCategory(dd_type_id);
   });

   $('#dd_categories').on('change', function () {
      dd_category_id = $("#dd_categories option:selected").val();
   });

   $('#dd_departments').on('change', function () {
      dd_department_id = $("#dd_departments option:selected").val();
   });

   // CREATE / POST
   $('#btn_new').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/requests/lists/';
      alert_msg = 'Saved Successfully';

      // Modal
      $("#formModal").modal();
      $(".modal-title").text('Make Request');

      // Hide Category Form Dropdown
      $('#form-group-category').hide();

      // Prev Next Function
      navigator();
   });

   // UPDATE / PUT
   $('#dt_requests tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];
      let form_data = dt_data['form_data'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/requests/lists/${id}/`;
      alert_msg = 'Update Successfully';

      // Open Modal
      // Rename Modal Title
      $("#formModal").modal();
      $(".modal-title").text('Update Requests');

      // Populate Fields
      $('#dd_departments').val(dt_data['department'].id).trigger('change');
      $('#dd_forms').val(dt_data['request_form'].id).trigger('change');
      $('#dd_types').val(dt_data['category'].category_type.id).trigger('change');
      $('#dd_categories').val(dt_data['category'].id).trigger('change');

      // Prev Next Function
      navigator();
   });

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