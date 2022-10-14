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
   var officerFilter = function() { return $('#officer-filter').val(); }
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
            "officer" : officerFilter,
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
                  data = `<span class="td-badge text-light" style="background-color:${row.request_form.color}" data-toggle="tooltip" title="${row.request_form.name}">${row.request_form.prefix}
                  </span>`
               }
               return data
            },
            // width: "10%"
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
            width: "15%"
            
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
            data: "requested_by",
            render: function (data, type, row) {
               if (type == 'display') {
                  data = `<p class="title m-0">${row.requested_by.first_name} ${row.requested_by.last_name}</p>
                     <span class="sub-title">${row.department.name}</span>`
               }
               return data
            },
         }, // User 
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
            data: "status",
            render: function (data, type, row) {
               if (type == 'display') {
                  template = `<div> ${row.status.name}
                        <div class="progress progress-table mt-1">
                           <div class="progress-bar bg-orange" role="progressbar" style="width: ${row.progress}%;" aria-valuenow="${row.progress}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        </div>
                     </div>`
                  data = template
               }
               return data
            },
            width: "15%"
         }, // Status
         {
            data: 'officers',
            render: function (data, type, row) {
               if (type == 'display') {
                  function memberItem() {
                     let template = '';
                     row.officers.forEach(officer => {
                        const fullname = officer.full_name
                        const initials = `${officer.first_name.charAt(0)}${officer.last_name.charAt(0)}`
                        template += `<div class="member-profile member-profile-sm member-overlap-item" data-toggle="tooltip" data-placement="top" title="${fullname}">${initials}</div>`
                     })
                     return template
                  }
                  data = (row.officers) ? `<div class="d-flex">${memberItem()}</div>` : '<span style="color: #e3e5ed">None</span>';
               }
               return data
            }, 
            orderable: false, /* true or false */
         }, // Status
         {
            data: "is_active",
            render: function (data, type, row) {
               if (type == 'display') {
                  if (row.is_active == true) data = "<i class='fas fa-check-circle text-success'></i>";
                  else data = "<i class='fas fa-times-circle text-danger'></i>";
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

   // RequestForm filter on change
   $('#requestform-filter').on('change', function () { // category type dropdown
      let form = $("#requestform-filter option:selected").val();
      if (form) {
         axios.get(`/api/requests/forms/all/${form}/`).then(res => {
            console.log(res.data.category_types)
            $("#type-filter")
               .empty()
               .append('<option value="">All</option>')
               .removeAttr('disabled');
            if (res.data.category_types.length > 1) 
               res.data.category_types.forEach(obj => $("#type-filter").append(`<option value='${obj.id}'>${obj.name}</option>`));
            else $("#type-filter").append('<option disabled>No category types</option>')
         });
      }
   });
   // Type filter on change
   $('#type-filter').on('change', function () { // category type dropdown
      let category_type = $("#type-filter option:selected").val();
      axios.get('/api/config/list/category', {params: {"category_type" : category_type}}, axiosConfig).then(res => {
         $("#category-filter")
            .empty()
            .append('<option value="">All</option>')
            .removeAttr('disabled');

         res.data.forEach(obj => {
            $("#category-filter").append(`<option value='${obj.id}'>${obj.name}</option>`)
         });
       });
   });
   // Status filter on change
   $('#status-filter').on('change', function () { // category type dropdown
      let status = $("#status-filter option:selected").val();
      if (status) {
         axios.get(`/api/status/officer/${status}`).then(res => {
            $("#officer-filter")
               .empty()
               .append('<option value="">All</option>')
               .removeAttr('disabled');
            if (res.data.officers.length > 1) 
               res.data.officers.forEach(obj => $("#officer-filter").append(`<option value='${obj.id}'>${obj.name}</option>`));
            else $("#officer-filter").append('<option disabled>No officer assigned</option>')
         });
      }
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