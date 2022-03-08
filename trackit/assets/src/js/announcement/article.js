$(document).ready(function () {
   
   var searchInput = function() { return $('#search-input').val(); }
   var activeFilter = function() { return $('#active-filter').val(); }
   var dateFromFilter = function() { return $('#date-from-filter').val(); }
   var dateToFilter = function() { return $('#date-to-filter').val(); }

   // RETRIEVE / GET
   let table = $('#dt_articles').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 15,
      "ajax": {
      url: '/api/announcement/all/article/?format=datatables',
      type: "GET",
      data: {
         "search": searchInput,
         "is_active": activeFilter,
         "date_from": dateFromFilter,
         "date_to": dateToFilter,
      }
   },
   "columns": [
      {
         data: "title",
         render: function (data, type, row) {
            let headline_html = `<div><p class="title text-nowrap m-0">${row.title}</p><span class="sub-title text-muted">${row.preface}</span></div>`;
            if (type == 'display') data = `<a href='/announcement/article/${row.id}/view' class='text-orange btn-edit'> ${headline_html} </a>`
            return data
         },
      },
      {
         data: "date_publish",
         render: function (data, type, row) {
            if (type == 'display') {
               var date = moment(row.date_publish).format('DD MMMM YYYY');
               var time = moment(row.date_publish).format('h:mm:ss a');

               data = `<p class="title mb-0">${date}</p><span class="sub-title">${time}</span>`
            }
            return data
         },
      },
      {
         data: "author",
         render: function (data, type, row) {
            if (type == 'display') data = `${row.author.name}`;
            return data
         },
      },
      {
         data: "is_active",
         render: function (data, type, row) {
            data = (row.is_active) ? "<i class='fas fa-check-circle text-success'></i>" : "<i class='fas fa-times-circle text-secondary'></i>";
            return data
         },
      }
   ],
   // "order": [[4, "desc"]],
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