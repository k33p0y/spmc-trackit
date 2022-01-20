$(document).ready(function () {
 
    // RETRIEVE / GET
    let table = $('#dt_articles').DataTable({
       "searching": false,
       "responsive": true,
       "lengthChange": false,
       "autoWidth": false,
       "serverside": true,
       "processing": true,
       "pageLength": 15,
    }); // table end
 });