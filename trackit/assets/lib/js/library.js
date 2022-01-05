// Headers CSRF 
function getCookie(name) {
   let cookieValue = null;
   if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
         const cookie = cookies[i].trim();
         // Does this cookie string begin with the name we want?
         if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
         }
      }
   }
   return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// Headers Axios
const axiosConfig = {
   "Content-Type": "application/json;charset=UTF-8",
   "Access-Control-Allow-Origin": "*",
   "X-CSRFToken": csrftoken,
};

const uploadConfig = {
   "Content-Type": "multipart/form-data",
   "Access-Control-Allow-Origin": "*",
   "X-CSRFToken": csrftoken,
};

const actor = $('.nav-user').data().userId;

// Sweet Alert Toast
const Toast = Swal.mixin({
   toast: true,
   position: 'top-end',
   showConfirmButton: false,
   timer: 2000,
   // timerProgressBar: true,
   // onOpen: (toast) => {
   //    toast.addEventListener('mouseenter', Swal.stopTimer)
   //    toast.addEventListener('mouseleave', Swal.resumeTimer)
   // }
});

// HOST, PROTOCOL constants
const loc = window.location;
const wsStart = loc.protocol == "https:" ? "wss://" : "ws://";

// Notifications
const getUserNotifications = function (){
   return axios.get('/api/user/notifications/',).then(response=>response.data).catch(response=>response.data)
};

// MIME TYPES REGISTER
const media_type = new Object();
media_type.text = ['text/plain'];
media_type.pdf = ['application/pdf'];
media_type.spreadsheet = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','application/vnd.oasis.opendocument.spreadsheet','text/csv'];
media_type.document = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','application/vnd.oasis.opendocument.text'];
media_type.presentation = ['application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-powerpoint','application/vnd.oasis.opendocument.presentation'];
media_type.image = ['image/png','image/jpeg'];

// File Type
const fileType = function(file_type, media_type) {
   let file_icon;

   if (media_type.text.includes(file_type)) { // Text File
      file_icon = "fa-file-alt"
   } else if (media_type.pdf.includes(file_type)) { // PDF File
      file_icon = "fa-file-pdf text-danger"
   } else if (media_type.spreadsheet.includes(file_type)) { // Excel or CSV File
      file_icon = "fa-file-excel text-success"
   } else if (media_type.document.includes(file_type)) { // Word or Document File
      file_icon = "fa-file-word text-primary"
   } else if (media_type.presentation.includes(file_type)) { // Powerpoint File
      file_icon = "fa-file-powerpoint text-orange"
   } else if (media_type.image.includes(file_type)) { // Image File
      file_icon = "fa-file-image text-warning"
   } else { // Invalid File
      file_icon = 'invalid';
   }

   return file_icon;
};

// File Size
const fileSize = function(bytes) {
   let file_size;

   if (bytes < 1024) {
      file_size = `${bytes} bytes`;
   } else if (bytes >= 1024 && bytes < 1024000) { // Convert Bytes to Kilobytes
      bytes = (bytes / 1024).toFixed(1);
      file_size = `${bytes} KB`;
   } else if (bytes > 1024000 && bytes <= 25214400) { // Convert Bytes to MegaBytes & set limit 25MB 
      bytes = (bytes / 1024000).toFixed(1);
      file_size = `${bytes} MB`;
   } else { // Invalid Size 
      file_size = 'invalid';
   }

   return file_size;
};

const imageSize = function (bytes) {
   let file_size;
   if (bytes < 1024) {
       file_size = `${bytes} bytes`;
   } else if (bytes >= 1024 && bytes < 1024000) { // Convert Bytes to Kilobytes
       bytes = (bytes / 1024).toFixed(1);
       file_size = `${bytes} KB`;
   } else if (bytes > 1024000 && bytes <= 5242880) { // Convert Bytes to MegaBytes & set limit 5MB 
       bytes = (bytes / 1024000).toFixed(1);
       file_size = `${bytes} MB`;
   } else { // Invalid Size 
       file_size = 'invalid';
   }
   return file_size;
};

const imageType = function (file_type) {
   let media_type = ['image/png', 'image/jpeg'];
   let image_type;

   if (media_type.includes(file_type)) image_type = "fa-file-image"
   else image_type = 'invalid';

   return image_type;
};

// Post Comments
const getComments = function(ticket, next_page){
   let url = '/api/requests/comments/'
   if (next_page) url = next_page;

   if (ticket){
      axios({
         method: 'GET',
         url: url,
         params: {
            ticket_id : ticket,
         },
         headers: axiosConfig,
      }).then(function (response) { // success
         let next_page_url = response.data.next
         if (next_page_url) { // check if there is next page to comment list API
            if (next_page_url.includes('socket')){ // check if host == socket
               if (wsStart == 'wss://') next_page_url = next_page_url.replace('http://', 'https://');
               $('#comment-nextpage-url').val(next_page_url.replace('socket', window.location.host)); // change socket host to window.location.host
            } else $('#comment-nextpage-url').val(next_page_url);
         } else $('#comment-nextpage-url').val(null);

         if (!next_page) $('.comment-section').empty();
         let comments_array = response.data.results
         for (i=0; i<comments_array.length; i++){
            if (!$(`.user-comment[data-comment-id="${comments_array[i].id}"]`).length) { // check if comment id already exist
               let fullname = `${comments_array[i].user.first_name} ${comments_array[i].user.last_name}`
               let comment = `${comments_array[i].content}`
               let date_created = `${moment(comments_array[i].date_created).format('MMM DD, YYYY hh:mm a')}`
               let logged_user_id = actor;

               $('.comment-section').append(
                  `<div class="user-comment justify-content-start ${comments_array[i].user.id == logged_user_id ? 'bg-comment-orange' : ''}" data-comment-id="${comments_array[i].id}">
                     <div class="d-inline justify-content-start ">
                        <span class="font-weight-bold text-orange name ">${fullname}</span>
                        <span class="text-muted text-xs"> - ${date_created}</span>
                     </div>
                     <div class="mt-2">
                        <p class="comment-text m-0">${comment}</p>
                     </div>
                  </div>`
               )
            }
         }
         
      }).catch(function (error) { // error
         toastError(error.response)
      });
   }
};

// Dropdown Filter Config
const toggleFilter = function() {return $(".dropdown-filter-toggle").dropdown('hide')}

const makeProgress = function(percent, progressbar) {
   if (percent <= 100) {
      $(progressbar).animate(
         { "width": `${percent}%`}, 0, function() {$('#percent').html(`${percent}%`)}
      );
   }
}

// Upload Attachment
const uploadAttachment = async function(ticket, array) {
   let files = new Object(array);
   let percent = 0;
   let num = 1;

   $('#uploadModal').modal('show'); // Open Modal

   for (const file of files) {
      // new objcet for file extra data
      let file_obj = new Object();
      file_obj.description = $(file.desc).val();
      file_obj.ticket = ticket

      // extra data convert to blob
      let blob = new Blob([JSON.stringify(file_obj)], {type: 'application/json'});
      
      // append to formData
      let form_data = new FormData();
      form_data.append('file', file.file)
      form_data.append('data', blob)
               
      // post api
      await axios({
         method: 'POST',
         url: '/api/requests/attachments/',
         data: form_data,
         headers: uploadConfig         
      }).then (function (result) {
         percent = Math.round(( (num) / files.length) * 100);
         $('#upload-progress').animate(
            { "width": `${percent}%`}, 0, function() {
               $('#percent').html(`${percent}%`);
               if (percent == 100) $(this).addClass('bg-success');
            }
         );
         num++;
      });
   }  
}

const toastSuccess = async function (title) {
   $('.overlay').removeClass('d-none');

   await Toast.fire({
      icon: 'success',
      title: title,
   });   
};

const toastError = async function (title) {
   await Toast.fire({
      icon: 'error',
      title: title,
   });   
};

const alertError = function (message) {
   Swal.fire({
       icon: 'error',
       title: 'Ooops',
       html: `<p class="text-secondary"> ${message} </p>`,
       showConfirmButton: false,
       timer: 2000,
   });
};

const alertSuccess = function (message) {
   Swal.fire({
       icon: 'success',
       title: 'Success',
       html: `<p class="text-secondary"> ${message} </p>`,
       showConfirmButton: false,
       timer: 2000,
       
   })
};