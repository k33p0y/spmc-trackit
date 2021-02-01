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

const actor = $('.user-link').data().userId;

// Sweet Alert Toast
const Toast = Swal.mixin({
   toast: true,
   position: 'center',
   showConfirmButton: false,
   timer: 1500,
   timerProgressBar: true,
   onOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
   }
});

let getUserNotifications = function (){
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

function fileType(file_type, media_type) {
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
}

function fileSize(bytes) {
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
}