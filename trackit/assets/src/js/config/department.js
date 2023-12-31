$(document).ready(function () {

   var searchInput = function() { return $('#search-input').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }

   // Local Variables
   let dd_head_id;
   let chk_status = true;
   let action_type, url;
   let alert_msg = '';

   // RETRIEVE / GET
   // List Table
   let table = $('#dt_department').DataTable({
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
         url: '/api/config/department/?format=datatables',
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
                  data = ($('#changeDepartmentHidden').val() == 'true') ? `<a href="#" class='btn-link-orange action-link btn_edit'>${row.name}</a>` : row.name
               }
               return data
            },
         }, // Name
         {
            data: "department_head",
            render: function (data, type, row) {
               if (type == 'display') {
                  if (row.department_head === null) {
                     data = "";
                  } else {
                     data = `${row.department_head.first_name} ${row.department_head.last_name}`;
                  }
               }
               return data
            }
         }, // Department_Head
         {
            data: "is_active",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = '';
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
   });

   // Select2 Config
   $('#dd_depthead').select2({
      allowClear: true,
      placeholder:'Select head of department',
      cache: true,
   });

   // Get Dropdown Value
   $('#dd_depthead').on('change', function () {
      dd_head_id = $("#dd_depthead option:selected").val();
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
   $('#btn-create-department').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/config/department/';

      $("#formModal").modal();
      $(".modal-title").text('Add Department');
      $('#txt_deptname').val('');
      $('#dd_depthead').val('');
   });

   // UPDATE / PUT
   $('#dt_department tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/config/department/${id}/`;

      // Open Modal
      // Rename Modal Title
      $("#formModal").modal();
      $(".modal-title").text('Update Department');

      // Populate Fields
      $('#txt_deptname').val(dt_data['name']);
      $('#dd_depthead').val(dt_data['department_head'].id).trigger('change');
      $('#chk_status').prop("checked", dt_data['is_active']);
   });

   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      let data = {}
      let success = 1;

      // Data
      data.name = $('#txt_deptname').val();
      data.department_head = dd_head_id;
      data.is_active = chk_status;

      // Validation
      if ($('#txt_deptname').val() == '') {
         $('#txt_deptname').addClass('form-error');
         $('#error-department-info').html('*This field may not be blank');
         success--;
      } else {
         $('#txt_deptname').removeClass('form-error');
         $('#error-department-info').html('');
      }

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
               toastSuccess('Success');
               table.ajax.reload();
            },
            error: function (xhr, status, error) {
               if (xhr.responseJSON.name) {
                  $('#txt_deptname').addClass('form-error');
                  $('.department-error').html(`*${xhr.responseJSON.name}`)
               } else {
                  $('#txt_deptname').removeClass('form-error');
                  $('.department-error').html('')
               }
               if (xhr.responseJSON.department_head) {
                  $('.select2-selection--single').css('border-color', '#dc3546a2'); // change border color to red
                  $('.dept-head-error').html(`*${xhr.responseJSON.department_head}`)
               } else {
                  $('.select2-selection--single').css('border-color', '#ced4da'); // change border color to light gray
                  $('.dept-head-error').html('')
               }
               toastError(error);
            },
         }).done(function () {
            $('#formModal').modal('toggle');
            $('#dd_depthead').val('').trigger('change');
            $("#form").trigger("reset");
            $('.error-info').html('');
         });
      }
   });

   //Modal Cancel
   $('#btn_cancel').click(function () {
      // Reset Fields to Defaults
      $('#txt_deptname').removeClass('form-error');
      $('.select2-selection--single').css('border-color', '');
      $('.error-info').html('');
      $('#chk_status').prop("checked", true);
      $('#dd_depthead').val('').trigger('change');
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