$(document).ready(function () {

   var searchInput = function() { return $('#search-input').val(); }
   var typeFilter = function() { return $('#type-filter').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }

   // Local Variables
   let dd_type_id;
   let chk_status = true;
   let action_type, url;
   let alert_msg = '';

   // GET
   // List Table
   let table = $('#dt_category').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 20,
      "ajax": {
         url: '/api/config/category/?format=datatables',
         type: "GET",
         data: {
            "search": searchInput,
            "category_type": typeFilter,
            "is_active": activeFilter
         }
      },
      "columns": [
         {
            data: "name",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = ($('#changeCategoryHidden').val() == 'true') ? `<a href="#" class='btn-link-orange action-link btn_edit'>${row.name}</a>` : row.name
               }
               return data
            },
         },
         { data: "category_type.name" },
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
         }
      ],
   });

   // Select2 Config
   $('#dd_types').select2({
      allowClear: true,
      placeholder: 'Select category type',
      cache: true,
   });

   // Get Dropdown Value
   $('#dd_types').on('change', function () {
      dd_type_id = $("#dd_types option:selected").val();
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
   $('#btn-create-category').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = '/api/config/category/'
      alert_msg = 'Saved Successfully';

      $("#formModal").modal();
      $(".modal-title").text('Add Category');
      $('#txt_categoryname').val('');
   });


   // UPDATE / PUT
   $('#dt_category tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = `/api/config/category/${id}/`;
      alert_msg = 'Update Successfully';

      // Open Modal
      // Rename Modal Title
      $("#formModal").modal();
      $(".modal-title").text('Update Cataegory');

      // Populate Fields
      $('#txt_categoryname').val(dt_data['name']);
      $('#dd_types').val(dt_data['category_type'].id).trigger('change');
      $('#chk_status').prop("checked", dt_data['is_active']);
   });


   // Submit Form
   $("#btn_save").click(function (e) {
      e.preventDefault();

      // Variables
      var data = {}
      var success = 2;

      // Data Values
      data.name = $('#txt_categoryname').val();
      data.category_type = dd_type_id;
      data.is_active = chk_status;

      // Validation
      if ($('#txt_categoryname').val() == '') {
         $('#txt_categoryname').addClass('form-error');
         $('#error-info-name').html('*This field may not be blank');
         success--;
      } else {
         $('#txt_categoryname').removeClass('form-error');
         $('#error-info-name').html('');
      }

      if ($("#dd_types option:selected").val() == "") {
         $('.select2-selection--single').css('border-color', '#dc3546a2');
         $('#error-info-type').html('*This field  may not be blank');
         success--;
      } else {
         $('#dd_types').removeClass('form-error');
         $('#error-info-type').html('');
      }

      // Form is Valid
      if (success == 2) {
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
                  $('#txt_categoryname').addClass('form-error');
                  $('#error-info-name').html(`*${xhr.responseJSON.name}`)
               } else {
                  $('#txt_categoryname').removeClass('form-error');
                  $('#error-info-name').html('')
               }
               if (xhr.responseJSON.category_type) {
                  $('.select2-selection--single').css('border-color', '#dc3546a2'); // change border color to red
                  $('#error-info-type').html(`*${xhr.responseJSON.category_type}`)
               } else {
                  $('.select2-selection--single').css('border-color', '#ced4da'); // change border color to light gray
                  $('#error-info-type').html('')
               }
               Toast.fire({
                  icon: 'error',
                  title: error,
               });
            },
         }).done(function () {
            $('#formModal').modal('hide');
            $('#dd_types').val('').trigger('change');
            $("#form").trigger("reset");
            $('.error-info').html('');
         });
      }
   });


   //Modal Cancel
   $('#btn_cancel').click(function () {
      // Reset Fields to Defaults
      $('#txt_categoryname').removeClass('form-error');
      $('.select2-selection--single').css('border-color', '');
      $('.error-info').html('');
      $('#chk_status').prop("checked", true);
      $('#dd_types').val('').trigger('change');
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