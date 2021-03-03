# Trackit Web Application System
A Digitize creation of requests forms for effieciency of sorting, searching and tracking of request.
***

## Dependencies
- Django 3.0.7
- Django REST Framework
- Python 3.6.9
- MySQL
- Docker
- Redis

## Documentation
- [Django Channels](https://channels.readthedocs.io/en/stable/introduction.html)

## Setup and Installation
#### Create and activate a virtual environment
Make sure that you are in parent directory.
```sh
$ virtualenv -p python3.6 venv
$ source venv/bin/activate
```

#### Install required packages
Install dependencies and packages using pip.
```sh
$ pip install -r requirements.txt
```

#### Create .env file
Used to populate the environment variables or will be used to fill instance settings.

    SECRET_KEY=<Secret Key Here>
    DEBUG=True
    
    DB_NAME= <db name>
    DB_HOST=<db host>
    DB_USER=<db user>
    DB_PASSWORD=<db password>
    
    ALLOWED_HOSTS = .localhost, .10.1.80.22, .10.1.80.23, .10.1.25.54
    
    REDIS_HOST = localhost
    REDIS_PORT = 6379

#### Migrate Models 
Change your directory to the project directory and run migration:
```sh
$ cd trackit
$ python manage.py migrate
```

#### Collect Static Files
Copy your assets files (JS, CSS, Vendors) to static folder:
```sh
$ python manage.py collectstatic`
```

#### Redis via Docker
Use a channel layer that uses Redis as its backing store. To start a Redis server on port 6379, run the following command:
```sh
$ sudo docker run -p 6379:6379 -d redis:5
```

#### Run Django Development Server
```sh
$ python manage.py runserver
```

## Permissions and Group
| User | Groups | Permission |
|-----|-----|-----|
| Superuser |  | All |
| Staff | SSD, ICT, KM | View, Add & Edit Request<br>View & Add Comments<br>View & Add Attachments<br>View Crud Event (Track Logs)<br><br>(Optional)<br>View, Add, Edit & Delete Status<br>View, Add, Edit & Delete Categorytype<br>View, Add, Edit & Delete Categories<br>View, Add, Edit & Delete Form<br>View, Add, Edit & Delete Users<br>View, Add, Edit & Delete Group |
|  | Segworks | View & Change Request<br>View & Add Comments<br>View & Add Attachments<br>View Crud Event (Track Logs) |
| User | User | View & Change Request<br>View & Add Comments<br>View & Add Attachments<br>View Crud Event (Track Logs) |
| User | Department Head | View Request<br>View & Add Comments<br>View & Add Attachments<br>View Crud Event (Track Logs) |


## Daphne
```sh
### Create Daphne daemon in /etc/systemd/system/trackit-daphne.service
[Unit]
Description=daphne daemon for trackit
After=network.target

[Service]
User=<user here>
Group=www-data
WorkingDirectory=/var/www/trackit/trackit
ExecStart=/var/www/trackit/venv/bin/daphne -b 10.1.80.22 -p 8001 trackit.asgi:application

[Install]
WantedBy=multi-user.target

# start trackit-daphne.service daemon
systemctl start trackit-daphne.service
systemctl status trackit-daphne.service
systemctl daemon-reload
```
## NGINX
```sh
### create Nginx config to /etc/nginx/sites-available/trackit
upstream socket {
    ip_hash;
    server 10.1.80.22:8001 fail_timeout=0;
}

server {
    listen 91;

    server_name 10.1.80.22;
    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
            root /var/www/trackit/trackit;
    }

    location /media/ {
            root /var/www/trackit/trackit;
    }

    location / {
        proxy_pass http://socket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    access_log /var/log/nginx/trackit.access.log;
    error_log /var/log/nginx/trackit.error.log;
}

### copy config to /etc/nginx/sites-enabled
sudo ln -s /etc/nginx/sites-available/trackit /etc/nginx/sites-enabled

### reload Nginx
service nginx reload
```

## Developer
> **© 2021 Integrated Hospital Operations and Management Program (IHOMP) Software and Systems Development Unit (SSD)**

