function createPresentationView() {
    //Creates and appends the presentation view
    var presentationViewPathElements = [{name: 'Data Toolbox'}];
    var presentationViewDescription = 'Data toolbox provides a web interface to visualize and manipulate your Enonic XP data: ' +
                                      'dump & load your data, take & restore a snapshot, ...';
    return new RcdMaterialView('presentation', presentationViewPathElements, presentationViewDescription).init();
}
