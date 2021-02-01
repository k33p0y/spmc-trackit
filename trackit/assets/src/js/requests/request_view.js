$(document).ready(function () {
   $('.file-type').each((index, element) => {
      let file_type = fileType($(element).data().mimetype, media_type);
      $(element).addClass(file_type);
   });

   $('#dt_attachments').DataTable({
      "searching": false,
      "responsive": true,
      "lengthChange": false,
      "pageLength": 10,
   })
});
