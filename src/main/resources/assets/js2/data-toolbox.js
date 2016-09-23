//Creates and appends the header
var header = new RcdMaterialHeader('Data toolbox').init();
document.body.appendChild(header.getDomElement());

//Create the main part
var main = new RcdMaterialMain().init();

//Fills the nav bar
main.nav.addLink('file_download', 'Dumps', () => main.content.displayView('dumps')).
    addLink('photo_camera', 'Snapshots');

//Creates and appends the presentation view
var presentationViewDescription = 'Data toolbox provides a web interface to visualize and manipulate your Enonic XP: ' +
                                  'dump & load your data, take & restore a snapshot, ...';
var presentationView = new RcdMaterialView('presentation', ['Data Toolbox'], presentationViewDescription).init();
main.content.addChild(presentationView);

//Creates the dump view
var dumpViewDescription = 'To secure your data or migrate it to another installation, a dump of your installation can be made. ' +
                          'This dump includes all the current versions of your content, users, groups and roles.';
var dumpView = new RcdMaterialView('dumps', ['Data Toolbox', 'Dumps'], dumpViewDescription).init();


//Appends the main part
document.body.appendChild(main.getDomElement());