var presentationView = createPresentationView();
function createPresentationView() {
    //Creates and appends the presentation view
    var presentationViewPathElements = [{name: 'Data Toolbox'}];
    var presentationViewDescription = 'Data toolbox provides a web interface to visualize and manipulate your Enonic XP data.<br/> ' +
                                      'In Repositories, a tree representation of your repositories/branches/nodes is shown to allow to ' +
                                      'navigate through, display, export and import your nodes. ' +
                                      'The 3 others views will help you manage your exports, dumps and snapshots.<br/> ' +
                                      'A widget is also included to allow to export content directly from the Content studio.';
    return new RcdMaterialView('presentation', presentationViewPathElements, presentationViewDescription).init();
}
