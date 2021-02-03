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

   $('#btn-post-comment').click(function (e){
      e.preventDefault();

      let data = new Object() // data
      data.ticket = $(this).data().ticketId;
      data.content = $('#txtarea-comment').val();

      $('#form-comment').trigger('reset')
      axios({
          method: 'POST',
          url: '/api/requests/comments/',
          data: data,
          headers: axiosConfig,
      }).then(function (response) { // success
          let comment_id = response.data.id
          socket.send(JSON.stringify({type: 'comment', data: {comment_id: comment_id}}))
      }).catch(function (error) { // error
          console.log(error);
          Toast.fire({
              icon: 'error',
              title: 'Error in creating comment.',
          });
      });
  });
});
