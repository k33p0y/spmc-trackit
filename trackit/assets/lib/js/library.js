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