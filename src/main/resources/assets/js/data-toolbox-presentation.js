function createPresentationView() {
    //Creates and appends the presentation view
    var presentationViewPathElements = [{name: 'Data Toolbox'}];
    var presentationViewDescription = 'Data toolbox goal is to provide a web interface to visualize and manipulate your Enonic XP data. ' +
                                      'This tool focuses for the moment on 2 essential Enonic XP capabilities: dumps and snapshots. ' +
                                      'A widget is also included to allow to export content directly from the Content studio.';
    return new RcdMaterialView('presentation', presentationViewPathElements, presentationViewDescription).init();
}
