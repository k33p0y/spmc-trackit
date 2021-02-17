$(document).ready(function () {

   var searchInput = function() { return $('#search-input').val(); }
   var typeFilter = function() { return $('#type-filter').val(); }
   var categoryFilter = function() { return $('#category-filter').val(); }
   var departmentFilter = function() { return $('#department-filter').val(); }
   var statusFilter = function() { return $('#status-filter').val(); }
   var dateFromFilter = function() { return $('#date-from-filter').val(); }
   var dateToFilter = function() { return $('#date-to-filter').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }

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
            "search": searchInput,
            "category_type": typeFilter,
            "category": categoryFilter,
            "department": departmentFilter,
            "status": statusFilter,
            "date_from": dateFromFilter,
            "date_to": dateToFilter,
            "is_active": activeFilter,
            "is_archive":  false
         },
      },
      "columns": [
         { data: "ticket_no" }, // Ticket No
         {
            data: "request_form",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<span class="td-badge text-light" style="background-color:${row.request_form.color}">${row.request_form.name}</span>`
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
                  data = data + `<a href='#' class='text-danger action-link btn_delete' data-id="${id}"> <i class='fas fa-trash'></i> </a>`;
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

   // DELETE / PATCH
   $('#dt_requests tbody').on('click', '.btn_delete', function () {
      var id = $(this).data('id');

      Swal.fire({
         title: 'Are you sure?',
         icon: 'error',
         showCancelButton: true,
         confirmButtonText: 'Delete',
         confirmButtonColor: '#d9534f',
      }).then((result) => {
         if (result.value) {
            axios({
               headers: axiosConfig,
               url: `/api/requests/lists/${id}/`,
               method: "PATCH",
               data: {
                  is_archive: true,
               },
            }).then(function (response) {
               Toast.fire({
                  icon: 'success',
                  title: 'Deleted Successfully',
               });
               table.ajax.reload();
            }).catch(function (error) {
               Toast.fire({
                  icon: 'error',
                  title: error,
               });
            });
         }
      })
   });
   
   // // //  Filters
   // Select2 config
   $('.select-filter').select2();

   // Type Filter on change
   $('#type-filter').on('change', function () { // category type dropdown
      category_type = $("#type-filter option:selected").val();

      axios.get('/api/config/category', {params: {"category_type" : category_type}}, axiosConfig).then(res => {
         $("#category-filter")
            .empty()
            .append('<option value="">All</option>')
            .removeAttr('disabled');

         res.data.results.forEach(category => {
            $("#category-filter").append(`<option value='${category.id}'>${category.name}</option>`)
         });
       });
   });

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