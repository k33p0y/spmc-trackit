$(document).ready(function () {
   // List Table
   let table = $('#dt_requests').DataTable({
      "searching": false,
      "responsive": true,
      "autoWidth": false,
      "paging": false,
      "info": false,
      "columnDefs": [{
         "targets": [0,1,2,3,4],
         "orderable": false
      }]
   });
});