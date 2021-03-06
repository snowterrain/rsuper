#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var mustache = require('mustache');
//var nodemailer = require('nodemailer');
var request = require('request');
var app=express();
var cheerio = require('cheerio');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
 
// create application/x-www-form-urlencoded parser 
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var mongo = require('mongodb');


 

var database;



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
    


app.use(express.json());
app.use(express.urlencoded());

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
        self.ipaddress = '0.0.0.0';
        self.port      = 8080;
/*
        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };*/
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


        self.routes['/getClients'] = function(req, res) {

            var params = {};
            var collection = database.collection('client');
           
            
              collection.find(params).toArray(function(err, docs) {
               var idx = 0;
                var idex = 0;
                var data = {
                    "clients" : docs,
                    "idx" : function(){
                        return idx++;
                    },
                    "idex" : function(){
                        return idex++;
                    }
                 };
                 
                     res.header("Access-Control-Allow-Origin", "*");
                     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
           

                   res.send(data);

             })
             
             
             
             
             
             
            
           // res.setHeader('Content-Type', 'text/html');
            //res.send(fs.readFileSync('views/t.html'));
        };

        self.routes['/getClientActivity'] = function(req, res) {

            
            // var params = {};
                 console.log("In client activity ID >>>>>>>>>>>>"+req.query.id);

                 var o_id = new mongo.ObjectID(req.query.id);

            var params = {"_id":o_id};



            var collection = database.collection('client');

           
            console.log("In client activity");
              collection.find(params).toArray(function(err, docs) {
               var idx = 0;
                var idex = 0;
                var data = {
                    "clients" : docs,
                    "idx" : function(){
                        return idx++;
                    },
                    "idex" : function(){
                        return idex++;
                    }
                 };
                 
                     res.header("Access-Control-Allow-Origin", "*");
                     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
           
                    console.log("In client activity data"+data);
                   res.send(data);

             })
             
             

        };







		 self.routes['/trainer-videos'] = function(req, res) {
			 
			var params = {};
		 //	var collection = database.collection('trainingyt');
            var content = fs.readFileSync('views/videos.html').toString();
            
            var data={
                "videos":[{
                    "name": "Kettlebell swing",
                    "youtubeid": "khKaFtL_hr8"
                },
                {
                    "name": "Med ball ball slam",
                    "youtubeid": "Lm8rdZF-y8A"
                },
                {
                    "name": "battling rope side to side",
                    "youtubeid": "i_KlcB2iv_M"
                },
                {
                    "name": "TRX suspension system",
                    "youtubeid": "JChZ4kAkD-8"
                },
                {
                    "name": "Box jumps",
                    "youtubeid": "gRsmpWwakzY"
                },
                {
                    "name": "dumbbell thruster",
                    "youtubeid": "4VAtzkxWHE0"
                },
                {
                    "name": "Battling rope for the core",
                    "youtubeid": "mcOqPl2W-xA"
                },
                {
                    "name": "Inchworm",
                    "youtubeid": "AfgmkRCs90c"
                },
                {
                    "name": "Straight barbell thruster",
                    "youtubeid": "zogTZ7MsDYM"
                },
                {
                    "name": "Concept 2 skier",
                    "youtubeid": "Zvvp0URUDh8"
                },
                {
                    "name": "Renegade row 30 pound dumbbells",
                    "youtubeid": "TSx1RsdJzTc"
                },
                {
                    "name": "Battling rope push-up combo",
                    "youtubeid": "Wlii3KNvsMo"
                },
                {
                    "name": "Turkish get-ups",
                    "youtubeid": "0oohQLwh8C8"
                },
                {
                    "name": "Sledgehammer  hits",
                    "youtubeid": "BbnwZXV_GZI"
                },
                {
                    "name": "Battling ropes",
                    "youtubeid": "Q3kguQWhEEw"
                },
                {
                    "name": "Russian Twist on Swiss ball",
                    "youtubeid": "QgxBzlGumLc"
                },
                {
                    "name": "Wall balls",
                    "youtubeid": "iq_M07O3xsQ"
                },
                {
                    "name": "Dual kettlebell High pull",
                    "youtubeid": "lWlrSP3q8bM"
                },
                {
                    "name": "Addressing hamstrings",
                    "youtubeid": "--WDjgRApPE"
                },
                {
                    "name": "Power board for lower body",
                    "youtubeid": "RRo3MHOrqwg"
                },
                {
                    "name": "Feb 8 Training By Rashid Chaudry",
                    "youtubeid": "x1ANb4kwcLs"
                },
                {
                    "name": "Training by Rashid Chaudry",
                    "youtubeid": "K5CoybYpTXU"
                },
                {
                    "name": "Kettlebell swings BY Rashid Chaudry",
                    "youtubeid": "CEtvaevx5oY"
                }
            ]

            };
/* 
			collection.find(params).sort({"_id":-1}).toArray(function(err, docs) {
               var idx = 0;
                var idex = 0;
                var data = {
                    "videos" : docs,
                    "idx" : function(){
                        return idx++;
                    },
                    "idex" : function(){
                        return idex++;
                    }
                 };
				  */
				 
			  var html = mustache.to_html(content,data);
                   if(req.headers.type && req.headers.type == 'JSON'){
                     html = data;
                   }
                   res.send(html);

            // })
        };
		
	 self.routes['/review'] = function(req, res) {
           
				var content = fs.readFileSync('views/treviews.html').toString();
					var data ={
						"message":""
						}
				var html = mustache.to_html(content,data);
				res.send(html);
	    
        };
		
			
	 self.routes['/thankyou'] = function(req, res) {
           
				var content = fs.readFileSync('views/thanks.html').toString();
					var data ={
						"message":""
						}
				var html = mustache.to_html(content,data);
				res.send(html);
	    
        };	
		
		
		 self.routes['/s-thankyou'] = function(req, res) {
           
				var content = fs.readFileSync('views/sthanks.html').toString();
					var data ={
						"message":""
						}
				var html = mustache.to_html(content,data);
				res.send(html);
	    
        };	
			
			
		
		 self.routes['/promotions'] = function(req, res) {
           
				var content = fs.readFileSync('views/promotions.html').toString();
					var data ={
						"message":""
						}
				var html = mustache.to_html(content,data);
				res.send(html);
	    
        };		
		
    self.routes['/youtubeDataFeed'] = function(req, res) {
        var newHtml;
        try{

          //for(var i=0;i<configModule.getChannels().length;i++){
           // var collection = database.collection('trainingyt');
              request('https://www.youtube.com/channel/UCG7vl3IncjRSiLkhxtkB_4g/videos?shelf_id=0&view=0&sort=dd', function (error, response, html) {
				  

                    var $ = cheerio.load(html);
                    //var linkContent = ""
                    links = $('a');
                     $(links).each(function(i, link){
                      var href = $(link).attr('href');
                      var text = $(link).text();
                      text = text.replace(new RegExp('\n', 'g'), '')
                      text = text.trim();
                      if(href !=undefined && href.indexOf('watch') != -1){
                        //linkContent = linkContent+ $(link).text() + ':' + href+ '<br>';
                        var youtubeid=href.substring(href.lastIndexOf("v=")+2,href.lastIndexOf("v=")+13);
                        //youtubeid=youtubeid.substring(0,youtubeid.lastIndexOf("&index"));
                        //linkContent = linkContent+ $(link).text() + ':' + youtubeid+ '<br>';
						
						 //console.log("youtube id"+youtubeid);
                        if(youtubeid && text){
                          var document = {'name':text.replace('\n',''), 'youtubeid':youtubeid};

                          console.log('name:'+text.replace('\n','')+',youtubeid:'+youtubeid)
                         // collection.insert(document, {w:1}, function(err, result) {});
                        }
                      }
                      // console.log($(link).text() + ':\n  ' + $(link).attr('href'));
                     });



              });

         //}
           res.send('Done');
          }catch(e){
            res.send("error");
          }
    };
		
		
		
		
		self.routes['/SubmitReview'] = function(req, res) {
           
		   console.log("Saving name "+req.query.fname+">>>ID>>>"+req.query.lname+">>>>>>>>>"+req.query.review);
		   
		   if(req.query.fname && req.query.lname && req.query.review){
                self.mongoSave(req.query.fname,req.query.lname, req.query.review,req.query.email,req.query.city,req.query.state);
            }
				var content = fs.readFileSync('views/thanks.html').toString();
					var data ={
						"message":""
						}
				var html = mustache.to_html(content,data);
				res.send(html);
	    
        };
		
	
		
		
		    self.mongoSave = function(fname, lname, review,email,city,state) {
				console.log("We are connected");
				
				console.log("In Mongo Save"+fname+">>>ID>>>"+lname+">>>>>>>>>"+review);
				var collection = database.collection('testimonials');
					collection.find().count(function(error, nbDocs) {
					//var imgUrl = url;
					//imgUrl = imgUrl.replace('http://youtube.com/embed/','http://img.youtube.com/vi/');
					//imgUrl = imgUrl+'/0.jpg';
					var document = {'fname':fname, 'lname':lname,'review':review,'email':email,'city':city,'state':state};
					collection.insert(document, {w:1}, function(err, result) {});
        });
    };
		
	
self.routes['/sendMail'] = function(req, res) {
	
	 var content = fs.readFileSync('views/contact.html').toString()
	    
	   
			
			/* 	var transporter = nodemailer.createTransport({ 
				host: 'smtpout.secureserver.net', 
				port: 465, 
				auth: { user: 'contact@the-superfit.com', pass: 'Superman39' },
					secure: true
			});
 */
        if(req.query.name && (req.query.phone || req.query.email)){        
			/* 
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
            }); */
            
            console.log('Message sent: ' + info.response);
            var data ={
            "message":"Thank you for getting in touch!. Rashid will get back to you as soon as possible"
            }
            //res.json({yo: info.response});
             var html = mustache.to_html(content,data);
            res.send(html);


        } else{/* 
                        
                        var data ={
                        "message":"Please enter Name and contact email/phone"
                        }
                        //res.json({yo: info.response});
                         var html = mustache.to_html(content,data);
                        res.send(html); */
                    }
		
        };
	
		
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }

       self.app.post('/saveData',jsonParser, function(req, res) {
                  var name = req.body.image;
                  var client=req.body.client;
                  var date=req.body.date;
                    console.log("in save data request"+name+">>>>>>"+client+">>>>"+date);
                   // res.end("yes");

                    ///res.json({yo: hello});
                     //var data = {"clients" : "Hello"};
                 
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
           

                console.log("Saving signature for client ID >>>>>>>>>>>>>>>>>>>>>"+client._id);
                    var collection = database.collection('client');

                    //var temp =collection.find({"_id": "5828c7a9fd78e2ce3d000011"});

                   //console.log("Variable temp >>>>>>>>>>>>"+temp.firstname);

console.log("First name"+client.firstname+">>>>>>>>>>>>>"+"lastname"+client.lastname);

//collection.update({_id:client._id},
                    collection.update({"lastname":client.lastname,"firstname":client.firstname},
                     {
                        $addToSet: {
                            "Activity":

                                {
                                 "signature":name,
                                 "date":date
                                }
                              },

                               "$set": { 
                               "lastvisit": date
                           
                            }

                    }, 
                    function(err,result)
                    {


                     console.log("error+"+err);
                        console.log("result+"+result);
                        if (err) 
                        {
                         // Oh no! Something goes wrong!
                            return;
                         }
                

                                      



                     }); 




                   res.send("yes");
              
            // ...
            });
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
              // to support JSON-encoded bodies


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
	    
	     self.app.listen(process.env.PORT || 8080);
       // self.app.listen(self.port, self.ipaddress, function() {
           // console.log('%s: Node server started on %s:%d ...',
                //        Date(Date.now() ), self.ipaddress, self.port);
            self.app.use( bodyParser.json() ); 
           self.app.use(bodyParser.urlencoded({ extended: false }))
 
 /*
self.app.use(function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.write('you posted:\n')
  res.end(JSON.stringify(req.body, null, 2))
})
self.app.use(bodyParser.json({ type: 'application/*+json' }))
*/


       // });
    };



};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

