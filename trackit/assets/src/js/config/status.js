$(document).ready(function () {

   var searchInput = function() { return $('#search-input').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }

   // Local Variables
   let chk_status = true;
   let action_type, url;
   let alert_msg = '';
 
   // RETRIEVE / GET
   // List Table
   let table = $('#dt_forms').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverSide": true,
      "processing": true,
      "language": {
         processing: $('#table_spinner').html()
      },
      "pageLength": 20,
      "ajax": {
         url: '/api/config/status/?format=datatables',
         type: "GET",
         data: {
         "search": searchInput,
         "is_active": activeFilter
      },
      },
      "columns": [
         {
            data: "name",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = ($('#changeStatusHidden').val() == 'true') ? `<a href="#" class='btn-link-orange action-link btn_edit'>${row.name}</a>` : row.name
               }
               return data
            },
         }, // Name
         {
            data: "is_active",
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
         } // Is Active
      ],
      "order": [[0, "asc"]],
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
   $('#btn-create-status').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/config/status/';

      $("#formModal").modal();
      $(".modal-title").text('Add Status');
      $('#txt_typename').val('');
   });
 
   // UPDATE / PUT
   $('#dt_forms tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/config/status/${id}/`;

      // Open Modal
      // Rename Modal Title
      $("#formModal").modal();
      $(".modal-title").text('Update Form');

      // Populate Fields
      $('#txt_typename').val(dt_data['name']);
      $('#chk_status').prop("checked", dt_data['is_active']);
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.name = $('#txt_typename').val();
      data.is_active = chk_status;

      // Validation
      if ($('#txt_typename').val() == '') {
         $('#txt_typename').addClass('form-error');
         $('#error-info-status').html('*This field may not be blank');
      } else {
         $('#txt_typename').removeClass('form-error');
         $('#error-info-status').html('');
      }

      // Form is Valid
      if (success == 1) {
         axios({
            method: action_type,
            url: url,
            data: data,
            headers: axiosConfig,
         }).then(function (response) { // success
            toastSuccess('Success');
            $('#formModal').modal('toggle');
            $("#form").trigger("reset");
            table.ajax.reload();
         }).catch(function (error) { // error
            if (error.response.data.name) {
               $('#txt_typename').addClass('form-error');
               $('.name-error').html(`*${error.response.data.name}`)
            } else {
               $('#txt_typename').removeClass('form-error');
               $('.name-error').html('')
            }
         });
      };
   });
 
   //Modal Cancel
   $('#btn_cancel').click(function () {
      // Reset Fields to Defaults
      $('#txt_typename').removeClass('form-error');
      $('.error-info').html('');
      $('#chk_status').prop("checked", true);
      $('#select2_status').val([]).trigger('change');
   });
   
   // // //  Filters
   // Select2 config
   $('.select-filter').select2();

   // Search Bar onSearch Event
   $("#search-input").on('search', function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Search Bar onClick Event
   $("#execute-search").click(function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Apply Filter
   $("#btn_apply").click(function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Clear Filter
   $("#btn_clear").click(function () {
      $('#form-filter').trigger("reset");
      $('#form-filter select').trigger("change");
      table.ajax.reload();
      return false; // prevent refresh
   });
   
   // Close Dropdown 
   $('#close_dropdown').click(function (){ toggleFilter() });

   // Close Dropdown When Click Outside 
   $(document).on('click', function (e) { toggleFilter() });

   // Dropdown Prevent From closing
   $('.dropdown-filter').on('hide.bs.dropdown', function (e) {
      if (e.clickEvent) e.preventDefault();      
   });

 });