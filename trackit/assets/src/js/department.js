$(document).ready(function () {

   // Local Variables
   let dd_head_id;
   let chk_status = true;
   let action_type;
   let alert_msg = '';
   let url = "/api/config/department/";

   // Sweet Alert Toast 
   const Toast = Swal.mixin({
      toast: true,
      position: 'center',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      onOpen: (toast) => {
         toast.addEventListener('mouseenter', Swal.stopTimer)
         toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
   });

   // GET
   // List Table
   let table = $('#dt_department').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "ajax": {
         url: `${url}?format=datatables`,
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
               if (type == 'display') {
                  if (row.department_head === null) {
                     data = "";
                  } else {
                     data = `${row.department_head.first_name} ${row.department_head.last_name}`;
                  }
               }
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
            data: "null",
            render: function (data, type, row) {
               data = `<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
                     <a href='#' class='text-danger action-link'> <i class='fas fa-trash'></i> </a>`;
               return data
            },
         }
      ],
   });

   // Select2 Config
   $('#dd_depthead').select2({
      allowClear: true,
      placeholder: 'Select Head of Department',
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
   // New Department
   $('#btn_new').on('click', function () {
      // Assign AJAX Action Type and URL
      action_type = 'POST';
      url = url
      alert_msg = 'Saved Successfully';

      $("#formModal").modal();
      $(".modal-title").text('New Department');
      $('#txt_deptname').val('');
      $('#dd_depthead').val('');
   });


   // UPDATE / PUT
   // Edit Department
   $('#dt_department tbody').on('click', '.btn_edit', function () {
      let dt_data = table.row($(this).parents('tr')).data();
      let id = dt_data['id'];

      // Assign AJAX Action Type/Method and URL
      action_type = 'PUT';
      url = url + `${id}/`;
      alert_msg = 'Update Successfully';

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
      var data = {}
      var success = 1;

      // Data Values
      data.name = $('#txt_deptname').val();
      data.department_head = dd_head_id;
      data.is_active = chk_status;

      // Validation
      if ($('#txt_deptname').val() == '') {
         $('#txt_deptname').addClass('form-error');
         $('.error-info').html('*This field cannot be empty');
         success--;
      } else {
         $('#txt_deptname').removeClass('form-error');
         $('#error-password').html('');
      }

      // Form is Valid
      if (success == 1) {
         $.ajax({
            url: url,
            type: type,
            data: data,
            success: function (result) {
               Toast.fire({
                  icon: 'success',
                  title: title,
               });
               table.ajax.reload();
            },
            error: function (a, b, error) {
               Toast.fire({
                  icon: 'error',
                  title: error,
               });
            },
         }).done(function () {
            $('#deptModal').modal('toggle');
            $('#dd_depthead').val('').trigger('change');
            $('#chk_status').prop("checked", true);
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

});