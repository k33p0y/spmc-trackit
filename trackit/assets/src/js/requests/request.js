$(document).ready(function () {
   // Check if user has already done or skip walkthrough
   axios.get('/api/config/tour/').then(res => { // response
      const response = res.data.results;
      let request = new Object();
      // if empty response; call walkthrough fn with POST method to create instance  
      // if has response and is_explore value is false; call walkthrough fn with PUT method and url
      if (response.length > 0 && !response[0].is_explore_req_list) {
         request.method = 'PUT';
         request.url = `/api/config/tour/${response[0].id}/`;
         exploreRequestTable(request);
      }
      else if (response.length == 0) {
         request.method = 'POST';
         request.url = `/api/config/tour/`;
         exploreRequestTable(request);
      }
   }).catch(err => { // error
      toastError(err.response.statusText) // alert
   });

   // RETRIEVE / GET
   var searchInput = function() { return $('#search-input').val(); }
   var formFilter = function() { return $('#requestform-filter').val(); }
   var typeFilter = function() { return $('#type-filter').val(); }
   var categoryFilter = function() { return $('#category-filter').val(); }
   var departmentFilter = function() { return $('#department-filter').val(); }
   var statusFilter = function() { return $('#status-filter').val(); }
   var dateFromFilter = function() { return $('#date-from-filter').val(); }
   var dateToFilter = function() { return $('#date-to-filter').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }

   // List Table
   let table = $('#dt_requests').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverSide": true,
      "language": {
         processing: $('#table_spinner').html()
      },
      "processing": true,
      "pageLength": 15,
      "ajax": {
         url: '/api/requests/ticket/all/?format=datatables',
         type: "GET",
         data: {
            "search": searchInput,
            "request_form": formFilter,
            "category_type": typeFilter,
            "category": categoryFilter,
            "department": departmentFilter,
            "status": statusFilter,
            "date_from": dateFromFilter,
            "date_to": dateToFilter,
            "is_active": activeFilter
         }
      },
      "columns": [
         { 
            data: "ticket_no",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<a href='/requests/${row.ticket_id}/view' class='btn-link-orange action-link btn_view'> ${row.ticket_no} </a>`
               }
               return data
            }
         }, // Ticket No
         {
            data: "request_form",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<span class="td-badge text-light" style="background-color:${row.request_form.color}">
                     <span class="d-inline d-md-none">${row.request_form.prefix} </span>
                     <span class="d-none d-md-inline">${row.request_form.name}</span>   
                  </span>`
               }
               return data
            },
            width: "20%"
         }, // Request Type
         { 
            data: "description",
            render: $.fn.dataTable.render.ellipsis(60, true),
            width: "20%"
         }, // Description
         {
            data: "category",
            render: function (data, type, row) {
               if (type == 'display') {
                  const categories = row.category.map((category) => {return category.name});
                  const type = row.category.map((category) => {return category.category_type_name});                     
                  data = `<p class="title">${categories.join(', ')}</p> <span class="sub-title">${type[0]}</span>`
               }
               return data
            },
            width: "20%"
            
         }, // Category
         { 
            data: "reference_no",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = (row.reference_no) ? row.reference_no : '<span style="color: #e3e5ed"> XXX-0000-00000</span>'
               }
               return data
            }         
         }, // Reference No
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

                  data = `<p class="title mb-0">${date}</p><span class="sub-title">${time}</span>`
               }
               return data
            },
         }, // Date Create
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
               // console.log(row)
               if (type == 'display') {
                  template = `<div> ${row.status.name}
                        <div class="progress progress-table mt-1">
                           <div class="progress-bar bg-orange" role="progressbar" style="width: ${row.progress}%;" aria-valuenow="${row.progress}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                     </div>`
                  data = template
               }
               return data
            },
            width: "10%"
         }, // Status 
         {
            data: "is_active",
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
         }, // Is Active
      ],
      "order": [[ 6, "desc" ]],
   });
   
   // // //  Filters
   // Select2 config
   $('.select-filter').select2();

   // Type Filter on change
   $('#type-filter').on('change', function () { // category type dropdown
      category_type = $("#type-filter option:selected").val();
      axios.get('/api/config/list/category', {params: {"category_type" : category_type}}, axiosConfig).then(res => {
         $("#category-filter")
            .empty()
            .append('<option value="">All</option>')
            .removeAttr('disabled');

         res.data.forEach(category => {
            $("#category-filter").append(`<option value='${category.id}'>${category.name}</option>`)
         });
       });
   });

   // Search Bar onSearch Event
   $("#search-input").on('search', function () {
      table.ajax.reload();
      return false; // prevent refresh
   });

   // Search Bar keyPress Event
   $('#search-input').keypress(function(event){
      let keycode = event.keyCode || event.which;
      if (keycode == '13') table.ajax.reload();
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

   // walkthrough click event
   $('.tour-me').click(function() {
      exploreRequestTable();
   });
});