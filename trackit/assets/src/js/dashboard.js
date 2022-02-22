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

   $('.carousel-inner').on('click', '.btn-more', function() {
      axios
         .get(`/api/announcement/all/article/${$(this).data().articleId}/`)
         .then(res => {
            console.log(res.data)
            $('.modal-readmore').html(`
               <div class="m-2">
                  <h6 class="font-weight-bold text-orange mb-1">${res.data.title}</h6>
                  <p class="preface m-0">${res.data.preface}</p>
                  <hr>
                  <div class="mb-4">${res.data.content}</div>
                  <small class="text-muted">Issued on ${moment(res.data.date_publish).format('DD MMMM YYYY h:mm:ss a')} by ${res.data.author.name}</small>
               </div>
            `);
            $('#previewMore').modal();
         })
         .catch(err => {
            console.log(err)
         })
   });
});