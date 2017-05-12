function createPresentationRoute() {
    const sectionContent = new RcdPElement().init().
        setText('Data toolbox provides a web interface to visualize and manipulate your Enonic XP data.<br/> ' +
                'The repositories view provides a tree representation of your repositories/branches/nodes. ' +
                'The 3 others views will help you manage your node exports, system dumps and snapshots. ' +
                'A widget is also included to allow to export content directly from the Content studio.');

    const exportsSectionContent = new RcdPElement().init().
        setText('A node export is a serialization of a given content/node. ' +
                'This makes node exports well suited for transferring a specific content to another installation. ' +
                'Warning: The current export mechanism does not export old versions of your data. You will loose the version history of your contents. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/operations/export.html">Export and Import</a> for more information.');

    const dumpsSectionContent = new RcdPElement().init().
        setText('A system dump is an export of your entire data (contents, users, groups and roles) from your Enonic XP server to a serialized format.<br/>' +
                'The difference between a node/content export and a system dump is what they export. A node/content export focuses on a given content and its childen while a system dump is used to export an entire system (all repositories/branches/nodes). ' +
                'This makes dumps well suited for migrating your data to another installation. ' +
                'Warning: The current dump mechanism does not export old versions of your data. You will loose the version history of your contents. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/operations/export.html">Export and Import</a> for more information.');

    const snapshotsSectionContent = new RcdPElement().init().
        setText('A snapshot is a record of your Enonic XP indexes at a particular point in time. ' +
                'Your first snapshot will be a complete copy of your indexes, but all subsequent snapshots will save the delta between the existing snapshots and the current state.' +
                'This makes snapshots optimized for repetitive saves and allow to quickly rollback to a previous state in one click. It is also used, in addition to blobs backup, for backing up your data. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/operations/backup.html#backing-up-indexes">Backing up indexes</a> for more information.');

    const repositoriesSectionContent = new RcdPElement().init().
        setText('Enonic XP data is split in repositories. ' +
                'Data stored in a repository will typically belong to a common domain. ' +
                'Enonic XP uses by default 2 repositories. ' +
                '"system-repo", the core repository, contains the users, groups, roles, references to other repositories, installed application, ... ' +
                '"cms-repo", the content domain repository, contains the data managed by Content Studio. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/repository.html">Repository</a> for more information.');

    const branchesSectionContent = new RcdPElement().init().
        setText('A branch is a set of data in a repository. ' +
                'All repositories have a default branch called master. ' +
                'Any number of branches could be added to facilitate your data. ' +
                'For example, the cms-repo repository contains two branches: ' +
                '"draft" containing the content as seen in the Content Studio and ' +
                '"master" containing the published content served by the portal. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/branch.html">Branch</a> for more information.');

    const nodesSectionContent = new RcdPElement().init().
        setText('A Node represents a single storable entity of data. ' +
                'It can be compared to a row in sql or a document in document oriented storage models. ' +
                'See <a href="http://xp.readthedocs.io/en/stable/developer/node-domain/nodes.html">Nodes</a> for more information. ' +
                'The nodes are represented here in a tree structure. ' +
                'While this solution is adapted to repositories like cms-repo or system-repo, ' +
                'it may be problematic for repositories not following a tree structure or for nodes with too many children. ' +
                'If you need a tool to browse these repositories or if you need browsing based on queries, we recommend using the tool <a href="https://market.enonic.com/vendors/runar-myklebust/repoxplorer">repoXPlorer</a>.');


    const layout = new RcdMaterialSectionLayout('Data Toolbox', sectionContent).init();

    return {
        callback: (main) => {
            main.addChild(layout);
            app.setTitle('Data Toolbox');
        }
    };
}
