$(document).ready(function () {
    // get more notification on scroll
    $('.dropdown-body').scroll(function () {         
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            if ($('#notification-nextpage-url').val()){
                getAllNotifications($('#notification-nextpage-url').val());
            }
        }
    });

    // Clear all notifications
    $('#clear-all-notifications').click(function () {
        axios.delete('/api/user/notifications/delete/', { headers: axiosConfig }).then(res => { 
            getAllNotifications();
        })
        return false;
    })
});