$(document).ready(function () {
    // Users Tables
    $('#department-table').DataTable({
        "searching": false,
        "responsive": true,
        "autoWidth": false,
        "serverside": true,
        "processing": true,
        "ajax": {
            url: "/api/config/department/?format=datatables",
            type: "GET",
        },
        "columns": [
            { data: "name" },
            { data: "department_head" },
            {
                data: null,
                render: function (data, type, row) {
                    if (type == 'display') {

                        if (row.is_active == true) {
                            data = "<i class='fas fa-check-circle text-success'></i>";
                        } else {
                            data = "<i class='fas fa-times-circle text-danger'></i>";
                        }
                    }
                    return data
                }
            },
            {
                data: "null",
                render: function (data, type, row) {
                    data = "<i class='fas fa-edit text-secondary mr-2'></i>" +
                        "<i class='fas fa-trash text-danger'></i>";
                    return data
                },
            }
        ],
    });

});