<h1>PDF Server Backends</h1>

<p>This sample is a backend NodeJS Express server to help with loading document with both WebViewer Server and PSPDFkit server</p>

<p>The architecture between WebViewer Server and PSPDFKit server is quite different. In this example the NodeJS backend is utilized to generate auth tokens which in turn get utilized with the front end to load the document. WebViewer on the other hand uses the NodeJS as a file server to send the document to WebViewer Server for processing </p>

<h2>Getting Started</h2>

<ul>
  <li>npm install</li>
  <li>docker-compose up for both WebViewer & PSPDFKit docker files in their respective directories</li>
  <li>confirm both containers are running</li>
  <li>load test documents into documentRepo folder in this repo for tests with WebViewer Server</li>
  <li>navigate to http://localhost:5000/dashboard/documents and upload test documents for PSPDFKit server</li>
  <li>refer to front end code to hook in the Viewing Components</li>
</ul>
