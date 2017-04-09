function createPresentationRoute() {
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

    const exportsSectionContent = new RcdPElement().init().
        setText('An export is a serialization of a given content/node. ' +
                'While the export/import focuses on a given content, the dump/load is used to export an entire system (all repositories and branches). ' +
                'This makes exports well suited for transfering a specific content to another installation. ' +
                'Warning: The current export mechanism does not export old versions of your data. You will loose the version history of your contents. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/operations/export.html">Export and Import</a> for more information.');

    const snapshotsSectionContent = new RcdPElement().init().
        setText('A snapshot is a record of your Enonic XP indexes at a particular point in time. ' +
                'Your first snapshot will be a complete copy of your indexes, but all subsequent snapshots will save the delta between the existing snapshots and the current state.' +
                'This makes snapshots optimized for repetitive saves and allow to quickly rollback to a previous state in one click. It is also used, in addition to blobs backup, for backing up your data. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/operations/backup.html#backing-up-indexes">Backing up indexes</a> for more information.');

    const repositoriesSectionContent = new RcdPElement().init().
        setText('Enonic XP data is split in repositories. ' +
                'Data stored in a repository will typically belong to a common domain. ' +
                'Enonic XP uses by default 2 repositories: ' +
                '"system-repo", the core repository, containing users, groups, roles, references to other repositories, installed application, etc and ' +
                '"cms-repo", the content domain repository, containing the data managed by Content Studio. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/repository.html">Repository</a> for more information.');

    const branchesSectionContent = new RcdPElement().init().
        setText('A branch is a set of data in a repository. ' +
                'All repositories have a default branch called master. ' +
                'Any number of branches could be added to facilitate your data. ' +
                'For example, the cms-repo repository contains two branches: ' +
                '"draft" containing the content as seen in the Content Studio and ' +
                '"master" containing the published content served by the portal. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/branch.html">Branch</a> for more information.');


    const layout = new RcdMaterialSectionLayout('Data Toolbox', sectionContent).init().
        addSubSection('Dumps', dumpsSectionContent).
        addSubSection('Exports', exportsSectionContent).
        addSubSection('Snapshots', snapshotsSectionContent).
        addSubSection('Repositories', repositoriesSectionContent).
        addSubSection('Branches', branchesSectionContent);

    return {
        callback: (main) => main.addChild(layout)
    };
}
