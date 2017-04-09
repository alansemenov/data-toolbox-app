function createPresentationRoute() {
    const breadcrumbsLayout = new RcdMaterialBreadcrumbsLayout().init().
        addBreadcrumb(new RcdMaterialBreadcrumb('Data Toolbox').init());

    const sectionContent = new RcdPElement().init().
        setText('Data toolbox provides a web interface to visualize and manipulate your Enonic XP data.<br/> ' +
                'In Repositories, a tree representation of your repositories/branches/nodes is shown to allow to ' +
                'navigate through, display, export and import your nodes. ' +
                'The 3 others views will help you manage your exports, dumps and snapshots.<br/> ' +
                'A widget is also included to allow to export content directly from the Content studio.');

    const dumpsSectionContent = new RcdPElement().init().
        setText('A dump is an export of your data (contents, users, groups and roles) from your Enonic XP server to a serialized format. ' +
                'While the export/import focuses on a given content, the dump/load is used to export an entire system (all repositories and branches). ' +
                'This makes dumps well suited for migrating your data to another installation. ' +
                'Warning: The current dump mechanism does not export old versions of your data. You will loose the version history of your contents. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/operations/export.html">Export and Import</a> for more information.');
    const layout = new RcdMaterialSectionLayout('Data Toolbox', sectionContent).init()
        .addSubSection('Dumps', dumpsSectionContent);

    return {
        callback: (main) => main.addChild(breadcrumbsLayout).addChild(layout)
    };
}
