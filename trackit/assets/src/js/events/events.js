$(document).ready(function() {
    var searchInput = function() { return $('#search-input').val(); }
    var eventForFilter = function() { return $('#eventfor-filter').val(); }
    var activeFilter = function() { return $('#active-filter').val(); }

    let table = $('#dt_events').DataTable({
        "searching": false,
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false, 
        "serverSide": true,
        "processing": true,
        "language": {
            processing: $('#table_spinner').html()
         },
        "pageLength": 15,
        "ajax": {
            url: '/api/events/all/?format=datatables',
            type: "GET",
            data: {
                "search": searchInput,
                "event_for" : eventForFilter,
                "is_active": activeFilter
            },
        },
        "columns": [
            {
                data: "title",
                render: function (data, type, row) {
                    let headline_html = `<div><p class="title text-nowrap m-0">${row.title}</p><span class="sub-title text-muted">${row.subject}</span></div>`;
                    if (type == 'display') data = `<a href='/events/event/${row.id}/view' class='text-orange btn-edit'> ${headline_html} </a>`
                    return data
                },
            }, // Title
            {
                data: "event_for",
                render: function (data, type, row) {
                    if (type == 'display') data = row.event_for.name;
                    return data
                },
            }, // Event For
            {
                data: "highlight",
                render: function (data, type, row) {
                    if (type == 'display') data = `<div class= "circle" style="background-color:${row.highlight};" ></div>`;
                    return data
                },
            }, // Highlight
            {
                data: "participants",
            }, // Participants
            {
                data: "is_active",
                render: function (data, type, row) {
                if (row.is_active === true) data = "<i class='fas fa-check-circle text-success'></i>";
                else data = "<i class='fas fa-times-circle text-secondary'></i>";
                return data
                },
            } // Is Active
        ],
        "order": [[4, "desc"]],
    }); // table end

     // // //  Filters
   // Select2 config
   $('.select-filter').select2();

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
});