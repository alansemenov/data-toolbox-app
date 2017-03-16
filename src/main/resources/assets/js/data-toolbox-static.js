function createHeader() {
    return new RcdMaterialHeader('Data toolbox').init();
}

function createMain() {
    const main = new RcdMaterialMain().init();

    //Fills the nav bar
    main.nav.addLink('dumps', 'file_download', 'Dumps', () => router.setState('dumps')).
        addLink('exports', 'import_export', 'Exports', () => router.setState('exports')).
        addLink('snapshots', 'photo_camera', 'Snapshots', () => router.setState('snapshots')).
        addLink('repositories', 'storage', 'Repositories', () => router.setState('repositories'));

    return main;
}