$(document).ready(function () {

   var getTrackingNum = function() {
      let tracking_num = $('#search-input').val();
      if (!tracking_num) tracking_num = "None";
      return tracking_num
   }

   // RETRIEVE / GET
   // List Table
   let table = $('#dt_tracking').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "autoWidth": false,
      "serverside": true,
      "processing": true,
      "pageLength": 25,
      "ajax": {
         url: `/api/ticket/logs/?format=datatables`,
         type: "GET",
         data: {
               "tracking_num": getTrackingNum,
         },
         dataSrc: function (json) {
               return json.data.filter(function (item) {
                  return (item.event_type === "Create") || (item.event_type === "Update" && item.changed_fields.status);
               });
         }
      },
      "columns": [
         { 
               data: null,
               render: function (data, type, row) {
                  if (type == 'display') {
                     var date = moment(row.datetime).format('DD MMMM YYYY');
                     data = `<p class="title mb-1">${date}</p>`
                  }
                  return data
               },
         }, // DATE
         {
               data: null,
               render: function (data, type, row) {
                  if (type == 'display') {
                     var time = moment(row.datetime).format('h:mm:ss a');
                     data = `<p class="title mb-1">${time}</p>`
                  }
                  return data
               },
         }, // TIME
         {
               data: "event_type",
               render: function (data, type, row) {
                  if (type == 'display') {
                     if (row.event_type === "Create") {
                           data = `${row.event_type}`
                     } else if (row.event_type === "Update") {
                           data = `${row.changed_fields.status[0]}` // index 0 for the current status, 1 for the previous status
                     }
                  }
                  return data
               },
         }, // STATUS
         { 
               data: "user",
               render: function (data, type, row) {
                  if (type == 'display') {
                     data = `${row.user.first_name} ${row.user.last_name}`
                  }
                  return data
               },
         }, // USER
      ],
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
   
});
