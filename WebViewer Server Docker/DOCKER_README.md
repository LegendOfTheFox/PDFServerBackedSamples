## PDFTRON Server Readme

For more info, check our documentation at https://www.pdftron.com/documentation/web/guides/wv-server/ 

#### Requirements

Windows 10, Windows Server 2016, or a Linux distribution.
A connection to the internet.

It is possible to run this sample with other versions of Windows if you are able to install Docker.

#### Installing Docker

Contained in this package is a series of configuration files to run the WebViewer Server. To use this image, first install
docker at:

    https://docs.docker.com/engine/installation/
    
### STARTING THE SAMPLE WITH DEFAULTS

Open a command line, navigate to this directory and call:

    docker-compose up

To start the container in detached mode, so that it is not tied to the terminal call this:

   docker-compose up -d

To start container fresh, instead of using an existing one, call:

   docker-compose up -d --force-recreate

You can now access the demo app on http://localhost:8090/demo/?s

#### Accessing the demo

To access the demo, navigate to http://localhost:8090/demo?s

#### Restarting the containers

     docker-compose restart

#### Stopping the container

    docker-compose down

The webviewer-sample line can also be replaced with the container id.

#### VIEW THE LOGS

    docker-compose logs : shows all the logs
    docker-compose logs -f : shows all the logs, and continues following them

#### Attaching to the running container

If you wish to see inside of the running docker container and perform actions on it while it runs, do the following:

    docker-compose exec pdfd-tomcat bash

You should now have access to the running docker container.

#### SSL Config

The WebViewer server comes with a self-signed certificate, usable for debugging purposes only.

In order to have it work correctly on your own domain you must provide a signed certificate file. This signed certificate file should contain within it a public certificate, an optional intermediary certificate and a private key in the pem format. The private key must not have an associated password. If you do not include an intermediary certificate in this file, there may be issues with SSL on Firefox.

This combined certificate file should be located within `haproxy_ssl/` with the name `combined_key.pem`.

#### Including self signed certs

To include any self signed certs for your network in the docker image, add them to an external folder and mount that folder
as a volume on the pdfd-tomcat containers at the path /certs. The example below has external_certs as the external folder.

volumes:
     - ./external_certs:/certs

#### Starting WebViewer

Once the docker container is up-and-running, then it can be used by supplying the `pdftronServer` argument to WebViewer upon startup:

```
options.pdftronServer = 'http://<docker_address>'
var myWebViewer = new PDFTron.WebViewer(options, viewerElement);
```

#### Loading documents

When a document URL is provided, that URL will now be fetched by the docker server instead of the browser.
If authorization information needs to be provided to the server providing the document, this can be done using the `customHeaders` option when creating a document.

You can also provide the `filename` option to ensure that the server knows what type of file you are attempting to view (in case it is not clear from the URL).

```
options.customHeaders = {Cookie: "MYAUTHTOKEN=BF6CF50AB90C4025"};
options.filename = "Document.pdf";
var url = 'http://<documentserver>/FileDownload?param1=abcd&fetchid=dcba';
myWebViewer.loadDocument(url, options);
```

When the docker server makes a request to fetch `http://<documentserver>/FileDownload?param1=abcd&fetchid=dcba`, the http request will include the values in `options.customHeaders`.

#### Multiple backends

The container (along with webviewer) now has built-in support for using multiple backends behind a load balancer. 

As the container is not entirely stateless, the balancer needs to fulfill a few requirements:

- operates at layer 7 (http)
- supports instance affinity ("stickiness") via cookies.
- supports http health checks at a specific path

There is a sample configuration included in the download archive which demonstrates a fully working load balancer setup. Running `docker-compose -f docker-compose_load_balance.yml up` will launch a container composed of two pdftron server nodes with an [HAProxy](http://www.haproxy.org/ "HAProxy")  load balancer front end.

In the sample setup, incoming connections are directed to the least occupied backend node, and will remain attached to that node for the remainder of the session, or until the node starts to become overloaded.

If there are no available healthy nodes, then webviewer will attempt to continue in client-only rendering mode.

#### Preloading documents

To pre-fetch a document onto the PDFTron server use the 
`http://<docker_address>/blackbox/PreloadURL` entry point, with the `url` query parameter. For example, to pre-fetch `http://domain/document.pdf`, make a GET request to `http://<docker_address>/blackbox/PreloadURL?url=http%3A%2F%2Fdomain%2Fdocument.pdf`

#### Server options

##### Support for externally mapped static data drives

It's now possible to map the statically served data generated by the container to an external volume. The external folder must be granted full write access. See the commented out `volumes:` sections in both `docker-compose.yml` and `docker-compose_load_balance.yml`. 
Please be aware that the performance of this volume is critical to the performance of the server in general, and that the server operates under the assumption that the files will not be modified or locked by another process.

##### Customize server URL
To access the server from a different internal URL, adjust the `URL_PREFIX` options in `docker-compose.yml`. For example, with the option value `URL_PREFIX: custom-prefix`, the demo would be available at http://localhost:8091/custom-prefix/demo/?s

##### Including the demo
To disable the built in demo, set `INCLUDE_DEMO` to false. This will remove the demo site at http://localhost:8090/demo?s

##### Relative URL
If the server container has the environment variable `TRN_FETCH_DEFAULT_BASE_ADDR` set, then the url argument can start with a slash, in which case it will be appended to `TRN_FETCH_DEFAULT_BASE_ADDR` before fetching. 


##### URL root restriction

**(new)** If the server container has the environment variable `TRN_FETCH_REQUIRED_URL_ROOT` set, then each URL will be checked against its value before initiating any fetch routine. You may specify more than one possible URL root by seperating addresses with semicolons like so: `www.test.com;www.pdftron.com;www.google.com`
This check is done after any URL alteration performed due to the above `TRN_FETCH_DEFAULT_BASE_ADDR` option.
For example, if `TRN_FETCH_REQUIRED_URL_ROOT == my.domain.com/subpath`, then the document `http://my.domain.com/subpath/doc.pdf` would be be allowed, but both `http://my.domain.com/doc.pdf` and `http://my.other.domain.com/subpath/doc.pdf` would fail.
The protocol is not part of this check, and will be ignored if it is included in `TRN_FETCH_REQUIRED_URL_ROOT`.

##### Same domain cookie forwarding

**(new)** If the server container has specified `TRN_FORWARD_CLIENT_COOKIES` as true, cookies a client has received from another server on the same domain will be shared with the WebViewer Server. This can allow cookie based authorization schemes to pass their cookies for the server to use.

##### Client stickiness refresh

**(new)** If running the server in a distributed environment we offer an argument for improving user stickiness when using cookies to manage stickiness. Set `TRN_BALANCER_COOKIE_NAME` to the name of your stickiness cookie. Once set, WebViewer will delete the stickiness cookie whenever opening a new document. This allows users to only be stuck on a particular server on a per document basis.

In order to use this option your environment must allow WebViewer Server to delete cookies server side.

##### Disable client side PDF access

Setting the environment variable `TRN_DISABLE_CLIENT_PDF_ACCESS` will prevent the server from sending the PDF directly to the client, preferring other display modes instead (like server-side image rendering or .xod). Intended to protect sensitive documents by ensuring that only derived data (like rendered pages) are ever sent to the client.

##### Configuring the maximum age of the local cache

**(new)** `TRN_MAX_CACHE_AGE_MINUTES` determines how long the local document cache will be kept before deletion. It accepts a number in minutes for deletion time. 

##### Configuring the maximum size of the local cache

**(new)** Set `TRN_MAX_CACHE_MB` to configure the maximum size of the local cache before a forced deletion will occur. This should be set to 10% lower than the available space to WebViewer Server. Accepts a number in megabytes.

##### Adding self signed certificates to WebViewer Server

**(new)** Your network may use self signed certificates in the file servers WebViewer Server will fetch files from. WebViewer Server will fail unless the certificates are imported into the container. You can do so by placing your public certificates in the `include_certs/` directory and rebuilding the container with `docker-compose build`. The certificates in this directory will be directly imported into WebViewer Server's Java certificates.

##### Debug: disable client side rendering
setting the environment variable `TRN_DEBUG_DISABLE_CLIENT_BACKEND_SWITCH` in the server container will cause webviewer to stick with the server-rendering image backend and not switch to a more efficient client side option at any point. This option is for debugging only, as it may be removed in a future version.

##### Debug: disable HTTPS
If the environment variable `TRN_FETCH_DOWNGRADE_HTTPS` is set, then all fetches originating from the docker server will be made as http, rather than https.

### Troubleshooting

Tomcat fails to start.

- This means you either have a http server on port 8090, or are already running the container. Stop the container
or the HTTP server before running the sample again.

When I try to build the container on Windows, it tells me the system isn't supported.

- Right click on your docker icon in the taskbar tray and select 'Use Linux Containers'

When I try to use docker on Linux it fails with permission errors.

- Docker commands need to be run with sudo, do so for all the commands. It is possible to run it without sudo,
but requires extra user setup.

I was not able to use regular docker and had to use docker tools, I can't connect to basic.html.

- Open up a docker window and type 'docker-machine ip', this should list the ip for the container.
Use this ip instead of localhost: 192.x.x.x:8090/pdftron/basic.html?settings=true

I'm running docker on a VM, but the pdftron server seems to be failing with permission issues.

- In this scenario you may have copied from a shared volume into the VM, this may have mangled the permissions
on the docker files. To avoid this, download this package from our site from inside the virtual machine.

I'm running docker on a VM, but the pdftron server seems to be failing when building, specifically, when installing
the debian packages in the build.

- In this scenario, your VM likely does not have internet connectivity. Make sure you can contact the internet from 
your virtual machine.
