$(document).ready(function () { 

   const archiveFilter = function() {return true}
   const restoreData = function(url, table) {
      Swal.fire({
         title: 'Are you sure?',
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: 'Restore',
         confirmButtonColor: '#17a2b8',
      }).then((result) => {
         if (result.value) {
            axios({
               url: url,
               method: 'PATCH',
               data : {"is_archive" : false},
               headers : axiosConfig
            }).then(res => {
               Toast.fire({
                  icon: 'success',
                  title: 'Restored',
               });
               table.ajax.reload();
            }).catch(error => {
               Toast.fire({
                  icon: 'error',
                  title: error,
               });
            });
         }
      })
   }

   // Ticket/Requests Archive Table
   let tbl_ticket = $('#dt_requests').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 15,
      "ajax": {
         url: '/api/requests/lists/?format=datatables',
         type: "GET",
         data: {"is_archive": archiveFilter},
      },
      "columns": [
         { data: "ticket_no" }, // Ticket No
         {
            data: null,
            render: function (data, type, row) {
               return "<a href='#' class='text-info action-link btn_restore'> <i class='fas fa-trash-restore'></i> </a>"
            },
         }
      ],
   });
   // Form Archive Table
   let tbl_forms = $('#dt_forms').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 5,
      "ajax": {
         url: '/api/requests/forms/?format=datatables',
         type: "GET",
         data: {"is_archive": archiveFilter},
      },
      "columns": [
         { data: "name" },
         {
            data: null,
            render: function (data, type, row) {
               return "<a href='#' class='text-info action-link btn_restore'> <i class='fas fa-trash-restore'></i> </a>"
            },
         }
      ],
   });
   // Status Archive Table
   let tbl_status = $('#dt_status').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 5,
      "ajax": {
         url: '/api/config/status/?format=datatables',
         type: "GET",
         data: {"is_archive": archiveFilter},
      },
      "columns": [
         { data: "name" },
         {
            data: null,
            render: function (data, type, row) {
               return "<a href='#' class='text-info action-link btn_restore'> <i class='fas fa-trash-restore'></i> </a>";
            },
         }
      ],
   });
   // Department Archive Table
   let tbl_department = $('#dt_departments').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 5,
      "ajax": {
         url: '/api/config/department/?format=datatables',
         type: "GET",
         data: {"is_archive": archiveFilter},
      },
      "columns": [
         { data: "name" },
         {
            data: null,
            render: function (data, type, row) {
               return "<a href='#' class='text-info action-link btn_restore'> <i class='fas fa-trash-restore'></i> </a>"
            },
         }
      ],
   });
   // Category Archive Table
   let tbl_category = $('#dt_category').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 5,
      "ajax": {
         url: '/api/config/category/?format=datatables',
         type: "GET",
         data: {"is_archive": archiveFilter},
      },
      "columns": [
         { data: "name" },
         {
            data: null,
            render: function (data, type, row) {
               return "<a href='#' class='text-info action-link btn_restore'> <i class='fas fa-trash-restore'></i> </a>"
            },
         }
      ],
   });
   // Category Type Archive Table
   let tbl_types = $('#dt_category_types').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 5,
      "ajax": {
         url: '/api/config/categorytype/?format=datatables',
         type: "GET",
         data: {"is_archive": archiveFilter},
      },
      "columns": [
         { data: "name" },
         {
            data: null,
            render: function (data, type, row) {
               return "<a href='#' class='text-info action-link btn_restore'> <i class='fas fa-trash-restore'></i> </a>"
            },
         }
      ],
   });
   
   // // // Patch
   // Requests
   $('#dt_requests').on('click', '.btn_restore', function () {
      let dt_data = tbl_ticket.row($(this).parents('tr')).data();
      let id = dt_data['ticket_id'];
      restoreData(`/api/requests/lists/${id}/`, tbl_ticket)
   });
   // Forms
   $('#dt_forms').on('click', '.btn_restore', function () {
      let dt_data = tbl_forms.row($(this).parents('tr')).data();
      let id = dt_data['id'];
      restoreData(`/api/requests/forms/${id}/`, tbl_forms)
   });
   // Status
   $('#dt_status').on('click', '.btn_restore', function () {
      let dt_data = tbl_status.row($(this).parents('tr')).data();
      let id = dt_data['id'];
      restoreData(`/api/config/status/${id}/`, tbl_status)
   });
   // Department
   $('#dt_departments').on('click', '.btn_restore', function () {
      let dt_data = tbl_department.row($(this).parents('tr')).data();
      let id = dt_data['id'];
      restoreData(`/api/config/department/${id}/`, tbl_department)
   });
   // Category
   $('#dt_category').on('click', '.btn_restore', function () {
      let dt_data = tbl_category.row($(this).parents('tr')).data();
      let id = dt_data['id'];
      restoreData(`/api/config/category/${id}/`, tbl_category)
   });
   // Category Types
   $('#dt_category_types').on('click', '.btn_restore', function () {
      let dt_data = tbl_types.row($(this).parents('tr')).data();
      let id = dt_data['id'];
      restoreData(`/api/config/types/${id}/`, tbl_types)
   });
});