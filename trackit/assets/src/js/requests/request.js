$(document).ready(function () {
   var searchInput = function() { return $('#search-input').val(); }
   var categoryId = function() { return $('#category-select').val(); }
   var departmentId = function() { return $('#department-select').val(); }
   var statusId = function() { return $('#status-select').val(); }
   var isActive = function() { return $('#ticket-active-select').val(); }

   // RETRIEVE / GET
   // List Table
   let table = $('#dt_requests').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 8,
      "ajax": {
         url: '/api/requests/lists/?format=datatables',
         type: "GET",
         data: {
            "search_input": searchInput,
            "category_id": categoryId,
            "department_id": departmentId,
            "status_id": statusId,
            "is_active": isActive
         },
      },
      "columns": [
         { data: "ticket_no" }, // Ticket No
         {
            data: "request_form",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<span class="td-badge" style="background-color:${row.request_form.color}">${row.request_form.name}</span>`
               }
               return data
            }
         }, // Request Type
         {
            data: "category",
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
            data: "department",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = row.department.name
               }
               return data
            }
         }, // Department
         {
            data: 'date_created',
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_created).format('DD MMMM YYYY');
                  var time = moment(row.date_created).format('h:mm:ss a');

                  data = `<p class="title mb-1">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         }, // Date Create
         { 
            data: "date_modified",
            visible : false,
            searchable : false,
            render: function (data, type, row) {
               if (type == 'display') {
                  var date = moment(row.date_modified).format('DD MMMM YYYY');
                  var time = moment(row.date_modified).format('h:mm:ss a');

                  data = `<p class="title mb-1">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         }, // Date Update
         {
            data: "requested_by",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `${row.requested_by.first_name} ${row.requested_by.last_name}`
               }
               return data
            },
         }, // User 
         {
            data: "status",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = row.status.name
               }
               return data
            },
         }, // Status 
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
         }, // Is Active
         {
            data: "null",
            render: function (data, type, row) {
               var id = row.ticket_id;
               data = '';
               data = data + `<a href='/requests/${id}/view' class='text-info action-link btn_view'> <i class='fas fa-eye'></i> </a>`;
               if($('#changeTicketHidden').val() == 'true') {
                  data = data + `<a href='/requests/${id}/detail' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>`;
               }
               if($('#deleteTicketHidden').val() == 'true') {
                  data = data + "<a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>";
               }
               return data;
               // data = `<a href='/requests/${id}/detail' class='text-warning action-link btn_edit'> <i class='fas fa-pen'></i> </a>
               //           <a href='#' class='text-danger action-link btn_delete'> <i class='fas fa-trash'></i> </a>`;
               // return data
            },
         } // Action
      ],
      "order": [[ 5, "desc" ]],
   });

   $('#ticket-active-select').select2({
      allowClear: true,
      placeholder: 'Is Active',
      // cache: true,
   });

   $('#category-select').select2({
      allowClear: true,
      placeholder: 'Select Category',
      // cache: true,
   });

   $('#department-select').select2({
      allowClear: true,
      placeholder: 'Select Department',
      // cache: true,
   });

   $('#status-select').select2({
      allowClear: true,
      placeholder: 'Select Status',
      // cache: true,
   });

   //SEARCH
   $("#execute-search").click(function () {
      table.ajax.reload();
      return false; // prevent refresh
   });
});