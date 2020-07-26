$(document).ready(function () {

   // GET
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

   // Capture Dropdown Value
   let dept_head;
   $('#dd_depthead').on('change', function () {
      dept_head = $("#dd_depthead option:selected").val();
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
         url: "/api/config/department/?format=datatables",
         type: "GET",
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
                     data = "<i class='fas fa-times-circle text-danger'></i>";
                  }
               }
               return data
            }
         },
         {
            data: "null",
            render: function (data, type, row) {
               if (row.department_head === null)
                  data = `<a href='#' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
                     <a href='#' class='text-danger action-link'> <i class='fas fa-trash'></i> </a>`;
               else {
                  data = `<a href='#' class='text-warning action-link btn_edit' dept_id='${row.department_head.id}'> <i class='fas fa-pen'></i> </a>
                     <a href='#' class='text-danger action-link'> <i class='fas fa-trash'></i> </a>`;
               }
               return data
            },
         }
      ],
   });

   // CREATE / PUSH
   // New Department
   $('#btn_new').on('click', function (e) {
      $("#deptModal").modal();
      $(".modal-title").text('New Department');
      $('#txt_deptname').val('');
      $('#dd_depthead').val('');
   });

   // UPDATE / PUT
   // Edit Department
   $('#dt_department tbody').on('click', '.btn_edit', function () {
      let data = table.row($(this).parents('tr')).data();
      let dept_id = $(this).attr("dept_id");

      // Open Modal
      // Rename Modal Title
      $("#deptModal").modal();
      $(".modal-title").text('Update Department');

      // Populate Fields
      $('#txt_deptname').val(data['name']);
      $('#dd_depthead').val(dept_id).trigger("change");
   });


   // $("#btn_save").click(function (e) {
   //    e.preventDefault();

   //    // JSON
   //    var data = {};
   //    data.name = $('#txt_deptname').val();
   //    data.department_head = dept_head;
   //    data.is_active = true;

   //    console.log(data);

   //    var success = 1;

   //    if (success == 1) {
   //       $.ajax({
   //          url: '/api/config/department/',
   //          type: 'POST',
   //          data: data,
   //          success: function (result) {
   //             table.ajax.reload()
   //             console.log('success')
   //          },
   //          error: function (a, b, error) {
   //             console.log(error);
   //          },
   //       }).done(function () {
   //          $('#deptModal').modal('toggle');
   //       });
   //    }
   // });

});