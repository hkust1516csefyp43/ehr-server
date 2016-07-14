# EHR(Server)

[![Slack Status](https://slack.hkust1516csefyp43.com/badge.svg)](https://hkust1516csefyp43.com)
[![Build Status](https://travis-ci.org/hkust1516csefyp43/ehr-server.svg?branch=master)](https://travis-ci.org/hkust1516csefyp43/ehr-server)
[![Dependency Status](https://david-dm.org/hkust1516csefyp43/ehr-server.svg)](https://david-dm.org/hkust1516csefyp43/ehr-server.svg)

##Goal
A system suitable for remote patient record access. Design and optimized for the workflow of One-2-One Cambodia Clinic.

##How it works
###Back-end
This repository is the backend of the system. Along with a instance of PostgreSQL database, it allows the front-end apps to access, create and modify patients records.
###Front-end
Basically the front-end apps parse and display the data to make it user friendly. They consists of next to no logic, which means it is possible for multiple versions of front-end apps work alongside each other as long as the back-end side is functioning correctly.

##Deployment
###Local
if you are just trying to run everything locally (on the computer you are staring at right now), you can click [here]() to learn more.
###Heroku
Heroku is a cloud service provider. Click here to learn more about them. 
To deploy to Heroku, please check our "?" wiki page.
###Raspberry Pi
To deploy to Raspberry Pi, please check our "?" wiki page. 

##Mobile apps
The client side software is available in 2 platforms: Android and iOS. We are also considering porting the Android version to Chrome OS and Chrome browsers using ARC.
###Android
[Click here to our Android App repo](https://github.com/hkust1516csefyp43/ehr-android)  
(Download from the Google Play Store)  
(Download from Amazon AppStore)
###iOS
[Click here to our iOS App repo](https://github.com/hkust1516csefyp43/ehr-ios)
(Download from the App Store)
