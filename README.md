# ng-boilerplate

Hyla Soft simplified fork of [Keats/ng-boilerplate](https://github.com/Keats/ng-boilerplate)

## Goal
This project serves as a starting point for AngularJS projects using Typescript and SASS (it can easily be changed though).

It provides code organisation by feature (see Structure for more details) and a build system ready for development.

The build system is using [Gulp](http://gulpjs.com/) instead of the usual Grunt for speed and simplicity (I wrote an [article](http://vincent.is/introducing-people-to-gulp/) introducing it with examples).
The code instead of configuration approach makes it easy to modify things compared to Grunt.

So in short you get:

- automatic SASS compilation using libsass  with auto-prefixing
- automatic DI annotation (via ng-annotate, no need for .$inject)
- automatic typescript linting and compilation (+ concatenation and minification on dist environment)
- automatic preload of templates using html2js (+ minification on dist environment)
- exception decorator to deal with errors (in app/core/exceptions.decorator.js)
- automatic copy of libs and assets
- automatic injections of css/js files in index.html

## Install
To start your own project, you can clone that project, get rid of the history, change the git origin and start working by following the snippet below
```bash
$ git clone git://github.com/hylasoft-usa/ng-boilerplate myproject
$ cd myproject
$ git checkout --orphan temp
$ git commit -m 'initial commit'
$ git branch -D master
$ git branch -m master
$ git remote remove origin
$ git remote add origin yourgitrepourl.git
$ sudo npm -g install bower
$ bower install
$ npm install
$ npm run watch
```

You then have 2 options: use docker or use your local installation.
To get running using your local node, run the following:

```bash
$ sudo npm -g install bower gulp
$ bower install
$ npm install
$ npm run watch
```

The docker part is using [docker-compose](https://docs.docker.com/compose/) so you'll need both docker and docker-compose installed, follow these links to do so: https://docs.docker.com/installation/#installation and https://docs.docker.com/compose/#installation-and-set-up

You can just run `docker-compose up` and it will set up the environment in a container.

## Structure

```bash
ng-boilerplate/
  |- src/
  |  |- app/
  |  |  |- <app logic>
  |  |- assets/
  |  |  |- <static files>
  |  |- style/
  |  |  |- **/*.scss
  |  |- templates/
  |  |  |- **/*.html
  |  |- types/
  |  |  |  |- **/*.d.ts
  |- vendor/
  |  |- angular/
  |  |- angular-mocks/
  |  |- lodash/
  |  |- ui-router/
  |- gulpfile.js
```

This app organisation groups code by feature but not to the point of grouping the templates/tests/css inside it (it's really to change that in the gulpfile if you want to do that though).

Look at the home module present in the boilerplate to see how you can integrate a module in the angular app and don't forget to delete type definition for the controller in types/app/core.ts.
There's also an exemple service and directive.


## Tasks
This uses gulp (http://gulpjs.com/) so you can call any of the tasks defined in the gulpfile.
The default one watches over the files and runs the associated tasks when needed and is called like this:
```bash
$ npm run gulp
```

To build the version to distribute, run the following:
```bash
$ npm run gulp build --type dist

# if you are using docker-compose, do it while container is "up"
$ docker-compose run angular gulp build --type dist
```
