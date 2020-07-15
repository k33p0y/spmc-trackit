$(document).ready(function () {
   // Users Tables
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


   // Add User
   $("#btnSave").click(function () {
      var data = {};
      data.name = $('#deptname').val();
      var success = 1;

      if (success == 1) {
         $.ajax({
            url: 'http://localhost:8000/api/config/department/',
            type: 'POST',
            data: data,
            beforeSend: function (xhr, settings) {
               xhr.setRequestHeader("X-CSRFToken", '{{ csrf_token }}');
            },
            success: function (result) {
               table.ajax.reload();
               console.log('success')
            },
            error: function (a, b, c) {
               console.log(c);
            },
         })
      }
   });

});