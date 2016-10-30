#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var mustache = require('mustache');
var nodemailer = require('nodemailer');
var request = require('request');
var app=express();

var database;

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
		
       self.routes['/contact'] = function(req, res) {
           
          var content = fs.readFileSync('views/contact.html').toString();
	  var data ={
						"message":""
						}
	  var html = mustache.to_html(content,data);
	  res.send(html);
	    
        };
		 self.routes['/about'] = function(req, res) {


            res.setHeader('Content-Type', 'text/html');
            res.send(fs.readFileSync('views/about.html'));
        };
	
	 self.routes['/subscribe'] = function(req, res) {


            res.setHeader('Content-Type', 'text/html');
            res.send(fs.readFileSync('views/newsletter.html'));
        };
		
		self.routes['/testimonials'] = function(req, res) {

			var params = {};
		 	var collection = database.collection('testimonials');
			 var content = fs.readFileSync('views/t.html').toString();
			
			  collection.find(params).toArray(function(err, docs) {
               var idx = 0;
                var idex = 0;
                var data = {
                    "testimonials" : docs,
                    "idx" : function(){
                        return idx++;
                    },
                    "idex" : function(){
                        return idex++;
                    }
                 };
				 
				 
				  var html = mustache.to_html(content,data);
                   if(req.headers.type && req.headers.type == 'JSON'){
                     html = data;
                   }
                   res.send(html);

             })
			 
			 
			 
			 
			 
			 
			
           // res.setHeader('Content-Type', 'text/html');
            //res.send(fs.readFileSync('views/t.html'));
        };
		 self.routes['/trainer-videos'] = function(req, res) {


            res.setHeader('Content-Type', 'text/html');
            res.send(fs.readFileSync('views/videos.html'));
        };
		
	 self.routes['/review'] = function(req, res) {
           
				var content = fs.readFileSync('views/treviews.html').toString();
					var data ={
						"message":""
						}
				var html = mustache.to_html(content,data);
				res.send(html);
	    
        };
		
		
		self.routes['/SubmitReview'] = function(req, res) {
           
		   console.log("Saving name "+req.query.fname+">>>ID>>>"+req.query.lname+">>>>>>>>>"+req.query.review);
		   
		   if(req.query.fname && req.query.lname && req.query.review){
                self.mongoSave(req.query.fname,req.query.lname, req.query.review);
            }
				var content = fs.readFileSync('views/treviews.html').toString();
					var data ={
						"message":""
						}
				var html = mustache.to_html(content,data);
				res.send(html);
	    
        };
		
		
		
		
		    self.mongoSave = function(fname, lname, review) {
				console.log("We are connected");
				
				console.log("In Mongo Save"+fname+">>>ID>>>"+lname+">>>>>>>>>"+review);
				var collection = database.collection('testimonials');
					collection.find().count(function(error, nbDocs) {
					//var imgUrl = url;
					//imgUrl = imgUrl.replace('http://youtube.com/embed/','http://img.youtube.com/vi/');
					//imgUrl = imgUrl+'/0.jpg';
					var document = {'fname':fname, 'lname':lname,'review':review};
					collection.insert(document, {w:1}, function(err, result) {});
        });
    };
		
	
self.routes['/sendMail'] = function(req, res) {
	
	 var content = fs.readFileSync('views/contact.html').toString()
	    
	   
			
				var transporter = nodemailer.createTransport({ 
				host: 'smtpout.secureserver.net', 
				port: 465, 
				auth: { user: 'contact@the-superfit.com', pass: 'Superman39' },
					secure: true
			});
			
			 var text ="This Message From:   "+req.query.name+' Phone :'+req.query.phone+"      Email:"+req.query.email+"      "+req.query.message;
			 console.log('hello Name '+req.query.name+' Phone :'+req.query.phone+'  Email'+req.query.email+'Message'+req.query.message);
//			 'Hello world from \n\n';
		  var mailOptions = {
			from:'contact@the-superfit.com',
//			req.query.email, // sender address
			to: 'gpavan99@gmail.com,rashidc@hotmail.com', // list of receivers
			subject: 'Superfit Website Inquiry By - '+ req.query.name, // Subject line
			text: text //, // plaintext body
			// html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
			};
			
			
			transporter.sendMail(mailOptions, function(error, info){
					if(error){
						console.log(error);
						//res.json({yo: 'error'});
						var data ={
						"message":"Failed"
						}
						 var html = mustache.to_html(content,data);
						res.send(html);
					}else{
						console.log('Message sent: ' + info.response);
						var data ={
						"message":"Thank you for getting in touch!. Rashid will get back to you as soon as possible"
						}
						//res.json({yo: info.response});
						 var html = mustache.to_html(content,data);
						res.send(html);
					};
			});
		
        };
	
		
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();
		self.mongoConnect();
        // Create the express server and routes.
        self.initializeServer();
    };
	
	
	
	    self.mongoConnect = function(){
      //############################################################################
      //  TODO: Remove duplicate mongo connect in both admin and server.js
      //############################################################################

        // Retrieve
        var MongoClient = require('mongodb').MongoClient;

        var connection_string = '127.0.0.1:27017/rsuperfit';
        // if OPENSHIFT env variables are present, use the available connection info:
        if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
            connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
            process.env.OPENSHIFT_APP_NAME;
        }
        MongoClient.connect("mongodb://"+connection_string, function(err, db) {
            if(!err) {
                 db.authenticate('admin', 'JbLjxjD4NCH7', function(err, result) {
                       database = db;
                });

            }
    });

    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
		
			 self.app.use(express.static(__dirname + '/'));
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

