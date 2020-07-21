$(document).ready(function () {

   // Select2 Dropdown
   $('#dd_depthead').select2({
      allowClear: true,
      placeholder: 'Head of Department',
      ajax: {
         url: '/api/core/user/?format=json',
         dataType: 'json',
         type: "GET",
         quietMillis: 50,
         processResults: function (data) {
            var arr = [];
            var res = data.results

            // Push Array
            res.forEach(function (value, key) {
               arr.push({
                  id: value.id,
                  text: `${value.first_name} ${value.last_name}`
               })
            })

            return {
               results: arr
            }
         }
      }
   });

   // Dropdown Variables
   let dept_head;

   // Capture Dropdown Value
   $('#dd_depthead').on('change', function () {
      dept_head = $("#dd_depthead option:selected").val();
   });

   // GET
   // List Table
   let table = $('#departmentTable').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "ajax": {
         url: "/api/config/department/?format=datatables",
         type: "GET",
      },
      "columns": [
         { data: null },
         { data: "name" },
         { data: "department_head" },
         {
            data: null,
            render: function (data, type, row) {
               if (type == 'display') {

                  if (row.is_active == true) {
                     data = "<i class='fas fa-check-circle text-success'></i>";
                  } else {
                     data = "<i class='fas fa-times-circle text-danger'></i>";
                  }
               }
               return data
            }
         },
         {
            data: "null",
            render: function (data, type, row) {
               data = "<a href='#' class='text-warning action-link'> <i class='fas fa-pen'></i> </a>" +
                  "<a href='#' class='text-danger action-link'> <i class='fas fa-trash'></i> </a>";
               return data
            },
         }
      ],
   });


   // CREATE / PUSH
   // New Department
   $("#btnSave").click(function (e) {
      event.preventDefault();

      // JSON
      var data = {};
      data.name = $('#txt_deptname').val();
      data.department_head = dept_head;
      data.is_active = true;

      console.log(data);

      var success = 1;

      if (success == 1) {
         $.ajax({
            url: '/api/config/department/',
            type: 'POST',
            data: data,
            success: function (result) {
               table.ajax.reload()
               console.log('success')
            },
            error: function (a, b, error) {
               console.log(error);
            },
         }).done(function () {
            $('#deptNew').modal('toggle');
         });
      }
   });

});